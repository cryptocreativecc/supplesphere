import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";
import { getPointsHistory, getAllDailyCaps, calculateTier, getNextTier, getTierInfo } from "@/lib/points";

export async function GET(request: NextRequest) {
  try {
    const { pb, user } = await getAuthenticatedPb();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";

    if (type === "daily-caps") {
      const dailyCaps = await getAllDailyCaps(pb, user.id);
      return NextResponse.json({ dailyCaps });
    }

    if (type === "history") {
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "15");
      const filter = (searchParams.get("filter") || "all") as "all" | "earned" | "spent";
      const history = await getPointsHistory(pb, user.id, page, limit, filter);
      return NextResponse.json(history);
    }

    if (type === "tier-check") {
      // Check for unread tier-up notifications
      try {
        const notifications = await pb.collection("notifications").getList(1, 1, {
          filter: `recipient = "${user.id}" && type = "badge" && is_read = false`,
          sort: "-created",
        });

        if (notifications.items.length > 0) {
          const notification = notifications.items[0];
          // Mark as read
          await pb.collection("notifications").update(notification.id, { is_read: true });

          return NextResponse.json({ newTier: user.reputation_tier });
        }
      } catch {
        // Non-critical
      }

      return NextResponse.json({ newTier: null });
    }

    // Default: overview
    const currentTier = calculateTier(user.points);
    const tierInfo = getTierInfo(currentTier);
    const nextTier = getNextTier(currentTier);
    const dailyCaps = await getAllDailyCaps(pb, user.id);
    const history = await getPointsHistory(pb, user.id, 1, 10);

    return NextResponse.json({
      points: user.points,
      tier: currentTier,
      tierInfo,
      nextTier,
      dailyCaps,
      history,
    });
  } catch (err) {
    console.error("Points API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch points data" },
      { status: 500 }
    );
  }
}
