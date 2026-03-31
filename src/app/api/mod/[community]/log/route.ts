import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

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

    const log = await pb.collection("mod_log").getList(page, 30, {
      filter: `community = "${communityId}"`,
      sort: "-created",
      expand: "moderator",
    });

    return NextResponse.json(log);
  } catch (err) {
    console.error("Get mod log error:", err);
    return NextResponse.json({ items: [], totalItems: 0, totalPages: 0 });
  }
}
