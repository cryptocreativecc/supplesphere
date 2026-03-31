import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const filter = searchParams.get("filter") || "all";

  try {
    const filters = [`recipient = "${user.id}"`];
    if (filter === "unread") filters.push('is_read = false');
    if (filter === "replies") filters.push('(type = "reply" || type = "comment")');
    if (filter === "mentions") filters.push('type = "mention"');
    if (filter === "system") filters.push('(type = "moderation" || type = "badge" || type = "points")');

    const result = await pb.collection("notifications").getList(page, limit, {
      filter: filters.join(" && "),
      sort: "-created",
    });

    // Get unread count
    const unreadResult = await pb.collection("notifications").getList(1, 1, {
      filter: `recipient = "${user.id}" && is_read = false`,
    });

    return NextResponse.json({
      items: result.items,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      page: result.page,
      unreadCount: unreadResult.totalItems,
    });
  } catch (err) {
    console.error("Notifications error:", err);
    return NextResponse.json({ items: [], unreadCount: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.markAllRead) {
      // Mark all as read
      const unread = await pb.collection("notifications").getList(1, 200, {
        filter: `recipient = "${user.id}" && is_read = false`,
      });
      for (const n of unread.items) {
        await pb.collection("notifications").update(n.id, { is_read: true });
      }
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      // Verify ownership
      const notif = await pb.collection("notifications").getOne(body.id);
      if (notif["recipient"] !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await pb.collection("notifications").update(body.id, { is_read: body.is_read ?? true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("Notification update error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
