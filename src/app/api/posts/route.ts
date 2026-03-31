import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";
import { awardPoints, hasPostedToday } from "@/lib/points";
import { runPostChecks } from "@/lib/anti-gaming";
import { canSubmitDeal } from "@/lib/permissions";
import type { PointsAction } from "@/lib/points";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const community = searchParams.get("community") || "";
  const postType = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "new";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");
  const source = searchParams.get("source") || "";
  const product = searchParams.get("product") || "";
  const author = searchParams.get("author") || "";

  try {
    const { pb } = await getAuthenticatedPb();

    const filters: string[] = ['status = "published"'];
    if (community) filters.push(`community.slug = "${community}"`);
    if (postType) filters.push(`post_type = "${postType}"`);
    if (source) filters.push(`source = "${source}"`);
    if (product) filters.push(`product = "${product}"`);
    if (author) filters.push(`author = "${author}"`);

    let sortField = "-created";
    if (sort === "top") sortField = "-upvotes";
    else if (sort === "hot") sortField = "-upvotes,-created";

    const result = await pb.collection("posts").getList(page, perPage, {
      filter: filters.join(" && "),
      sort: sortField,
      expand: "author,community,source,product,brand",
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Posts fetch error:", err);
    return NextResponse.json({
      page,
      perPage,
      totalItems: 0,
      totalPages: 0,
      items: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pb, user } = await getAuthenticatedPb();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, unknown>;
    let postBody = "";
    let postType = "";
    let sourceId = "";
    let isVerifiedPurchase = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      postType = (formData.get("post_type") as string) || "";
      postBody = (formData.get("body") as string) || "";
      sourceId = (formData.get("source") as string) || "";
      isVerifiedPurchase = formData.get("is_verified_purchase") === "true";

      data = {
        post_type: postType,
        title: formData.get("title"),
        body: postBody,
        community: formData.get("community"),
        rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
        source: sourceId || undefined,
        product: formData.get("product") || undefined,
        brand: formData.get("brand") || undefined,
        is_verified_purchase: isVerifiedPurchase,
        url: formData.get("url") || undefined,
        deal_price: formData.get("deal_price") || undefined,
        deal_expires: formData.get("deal_expires") || undefined,
        author: user.id,
        status: "published",
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
      };

      // Handle file uploads
      const images = formData.getAll("images");
      if (images.length > 0) {
        // Check deal permission
        if (postType === "deal") {
          const canDeal = canSubmitDeal({ id: user.id, reputation_tier: user.reputation_tier, points: user.points });
          if (!canDeal) {
            return NextResponse.json(
              { error: "You need Silver tier or higher to submit deals" },
              { status: 403 }
            );
          }
        }

        // Run anti-gaming checks
        const userRecord = await pb.collection("users").getOne(user.id);
        const antiGaming = await runPostChecks(pb, user.id, userRecord.created, postType, postBody, sourceId);
        if (!antiGaming.allowed) {
          return NextResponse.json({ error: antiGaming.reason }, { status: 400 });
        }

        const pbFormData = new FormData();
        Object.entries(data).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            pbFormData.append(key, String(val));
          }
        });
        images.forEach((img) => {
          if (img instanceof File) {
            pbFormData.append("images", img);
          }
        });

        const record = await pb.collection("posts").create(pbFormData);

        // Award points (fire and forget)
        await awardPointsForPost(pb, user.id, postType, record.id, isVerifiedPurchase);

        return NextResponse.json(
          { success: true, id: record.id },
          { status: 201 }
        );
      }
    } else {
      const body = await request.json();
      postType = body.post_type || "";
      postBody = body.body || "";
      sourceId = body.source || "";
      isVerifiedPurchase = body.is_verified_purchase || false;

      data = {
        ...body,
        author: user.id,
        status: "published",
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
      };
    }

    // Check deal permission
    if (postType === "deal") {
      const canDeal = canSubmitDeal({ id: user.id, reputation_tier: user.reputation_tier, points: user.points });
      if (!canDeal) {
        return NextResponse.json(
          { error: "You need Silver tier or higher to submit deals" },
          { status: 403 }
        );
      }
    }

    // Run anti-gaming checks
    const userRecord = await pb.collection("users").getOne(user.id);
    const antiGaming = await runPostChecks(pb, user.id, userRecord.created, postType, postBody, sourceId);
    if (!antiGaming.allowed) {
      return NextResponse.json({ error: antiGaming.reason }, { status: 400 });
    }

    const record = await pb.collection("posts").create(data);

    // Award points
    await awardPointsForPost(pb, user.id, postType, record.id, isVerifiedPurchase);

    return NextResponse.json(
      { success: true, id: record.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Post creation error:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

async function awardPointsForPost(
  pb: import("pocketbase").default,
  userId: string,
  postType: string,
  postId: string,
  isVerifiedPurchase: boolean
) {
  try {
    // Map post type to points action
    const actionMap: Record<string, PointsAction> = {
      source_review: "source_review",
      product_review: "product_review",
      discussion: "discussion",
      deal: "deal",
    };

    const action = actionMap[postType];
    if (action) {
      await awardPoints(pb, userId, action, "post", postId);
    }

    // First post of the day bonus
    const alreadyPosted = await hasPostedToday(pb, userId);
    if (!alreadyPosted) {
      await awardPoints(pb, userId, "first_post_of_day", "post", postId);
    }

    // Verified purchase bonus
    if (isVerifiedPurchase && (postType === "source_review" || postType === "product_review")) {
      await awardPoints(pb, userId, "verified_purchase_bonus", "post", postId);
    }
  } catch (err) {
    console.error("Award points error:", err);
    // Non-critical — don't fail the post creation
  }
}
