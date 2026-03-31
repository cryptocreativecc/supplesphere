import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";
import { awardPoints } from "@/lib/points";
import { runCommentChecks } from "@/lib/anti-gaming";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "50");

  try {
    const { pb } = await getAuthenticatedPb();

    const filters: string[] = ['status = "published"'];
    if (postId) filters.push(`post = "${postId}"`);

    const result = await pb.collection("comments").getList(page, perPage, {
      filter: filters.join(" && "),
      sort: "-created",
      expand: "author,parent_comment",
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Comments fetch error:", err);
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

    const { postId, parentCommentId, content } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId and content are required" },
        { status: 400 }
      );
    }

    // Run anti-gaming checks
    const userRecord = await pb.collection("users").getOne(user.id);
    const antiGaming = await runCommentChecks(pb, user.id, userRecord.created, content);
    if (!antiGaming.allowed) {
      return NextResponse.json({ error: antiGaming.reason }, { status: 400 });
    }

    // Enforce max 3 levels of nesting
    if (parentCommentId) {
      try {
        const parent = await pb.collection("comments").getOne(parentCommentId, {
          expand: "parent_comment.parent_comment",
        });
        // Check depth
        const expand = parent.expand as Record<string, unknown> | undefined;
        if (expand?.["parent_comment"]) {
          const grandparent = expand["parent_comment"] as Record<string, unknown>;
          const gpExpand = grandparent.expand as Record<string, unknown> | undefined;
          if (gpExpand?.["parent_comment"]) {
            return NextResponse.json(
              { error: "Maximum reply depth reached (3 levels)" },
              { status: 400 }
            );
          }
        }
      } catch {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const record = await pb.collection("comments").create({
      post: postId,
      parent_comment: parentCommentId || "",
      author: user.id,
      body: content,
      upvotes: 0,
      downvotes: 0,
      status: "published",
    });

    // Increment comment count on post
    try {
      const post = await pb.collection("posts").getOne(postId);
      await pb.collection("posts").update(postId, {
        comment_count: (post["comment_count"] || 0) + 1,
      });
    } catch {
      // Non-critical
    }

    // Award points for comment
    try {
      await awardPoints(pb, user.id, "comment", "comment", record.id);
    } catch {
      // Non-critical
    }

    return NextResponse.json(
      { success: true, id: record.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Comment creation error:", err);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
