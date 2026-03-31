import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";
import { muteUser, banUser } from "@/lib/moderation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ community: string }> }
) {
  const { community: communitySlug } = await params;
  const { pb, user } = await getAuthenticatedPb();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, userId, durationHours } = body;

    // Get community by slug
    const communities = await pb.collection("communities").getList(1, 1, {
      filter: `slug = "${communitySlug}"`,
    });
    if (communities.items.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    const communityId = communities.items[0].id;

    if (action === "mute") {
      await muteUser(pb, userId, communityId, durationHours || 24, user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "ban") {
      await banUser(pb, userId, communityId, user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Mod user action error:", err);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ community: string }> }
) {
  const { community: communitySlug } = await params;
  const { pb, user } = await getAuthenticatedPb();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    // Get community
    const communities = await pb.collection("communities").getList(1, 1, {
      filter: `slug = "${communitySlug}"`,
    });
    if (communities.items.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    const communityId = communities.items[0].id;

    // Get community members
    const filters = [`joined_communities ~ "${communityId}"`];
    if (search) {
      filters.push(`(username ~ "${search}" || email ~ "${search}")`);
    }

    const users = await pb.collection("users").getList(page, 20, {
      filter: filters.join(" && "),
      sort: "-created",
      fields: "id,username,email,avatar,points,reputation_tier,role,created",
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("Get community users error:", err);
    return NextResponse.json({ items: [], totalItems: 0, totalPages: 0 });
  }
}
