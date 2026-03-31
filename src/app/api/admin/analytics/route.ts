import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const isSummary = searchParams.get("summary") === "true";

  try {
    // Get basic counts
    const [usersRes, postsRes, sourcesRes, reportsRes] = await Promise.all([
      pb.collection("users").getList(1, 1).catch(() => ({ totalItems: 0 })),
      pb.collection("posts").getList(1, 1).catch(() => ({ totalItems: 0 })),
      pb.collection("sources").getList(1, 1, { filter: 'verified = false' }).catch(() => ({ totalItems: 0 })),
      pb.collection("reports").getList(1, 1, { filter: 'status = "pending"' }).catch(() => ({ totalItems: 0 })),
    ]);

    // Get today's counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().replace("T", " ");

    const [postsTodayRes, reviewsTodayRes] = await Promise.all([
      pb.collection("posts").getList(1, 1, { filter: `created >= "${todayStr}"` }).catch(() => ({ totalItems: 0 })),
      pb.collection("posts").getList(1, 1, { filter: `created >= "${todayStr}" && (post_type = "source_review" || post_type = "product_review")` }).catch(() => ({ totalItems: 0 })),
    ]);

    if (isSummary) {
      return NextResponse.json({
        totalUsers: usersRes.totalItems,
        postsToday: postsTodayRes.totalItems,
        reviewsToday: reviewsTodayRes.totalItems,
        activeReports: reportsRes.totalItems,
        pendingSources: sourcesRes.totalItems,
      });
    }

    // Full analytics - generate time series data
    const days = 30;
    const signups: { date: string; count: number }[] = [];
    const postsPerDay: { date: string; count: number }[] = [];
    const reviewsPerDay: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setDate(dEnd.getDate() + 1);
      const dStr = d.toISOString().replace("T", " ");
      const dEndStr = dEnd.toISOString().replace("T", " ");
      const dateLabel = d.toISOString().split("T")[0];

      const [s, p, r] = await Promise.all([
        pb.collection("users").getList(1, 1, { filter: `created >= "${dStr}" && created < "${dEndStr}"` }).catch(() => ({ totalItems: 0 })),
        pb.collection("posts").getList(1, 1, { filter: `created >= "${dStr}" && created < "${dEndStr}"` }).catch(() => ({ totalItems: 0 })),
        pb.collection("posts").getList(1, 1, { filter: `created >= "${dStr}" && created < "${dEndStr}" && (post_type = "source_review" || post_type = "product_review")` }).catch(() => ({ totalItems: 0 })),
      ]);

      signups.push({ date: dateLabel, count: s.totalItems });
      postsPerDay.push({ date: dateLabel, count: p.totalItems });
      reviewsPerDay.push({ date: dateLabel, count: r.totalItems });
    }

    // Top sources
    const topSourcesRes = await pb.collection("sources").getList(1, 10, {
      sort: "-review_count",
      fields: "id,name,review_count",
    }).catch(() => ({ items: [] }));
    const topSources = topSourcesRes.items.map((s) => ({
      name: s["name"] as string,
      reviewCount: (s["review_count"] as number) || 0,
    }));

    // Top communities
    const topCommunitiesRes = await pb.collection("communities").getList(1, 10, {
      sort: "-member_count",
      fields: "id,name,member_count",
    }).catch(() => ({ items: [] }));
    const topCommunities = topCommunitiesRes.items.map((c) => ({
      name: c["name"] as string,
      memberCount: (c["member_count"] as number) || 0,
    }));

    // Total reviews
    const totalReviewsRes = await pb.collection("posts").getList(1, 1, {
      filter: 'post_type = "source_review" || post_type = "product_review"',
    }).catch(() => ({ totalItems: 0 }));

    return NextResponse.json({
      signups,
      postsPerDay,
      reviewsPerDay,
      topSources,
      topCommunities,
      totalUsers: usersRes.totalItems,
      totalPosts: postsRes.totalItems,
      totalReviews: totalReviewsRes.totalItems,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
