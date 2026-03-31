import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";
import { submitReport } from "@/lib/moderation";

export async function POST(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { target_type, target_id, reason, details } = body;

    if (!target_type || !target_id || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const report = await submitReport(pb, user.id, target_type, target_id, reason, details || "");
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("community");
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    const filters = [];
    if (status) filters.push(`status = "${status}"`);
    if (communityId) {
      // Get post IDs in this community
      const posts = await pb.collection("posts").getList(1, 500, {
        filter: `community = "${communityId}"`,
        fields: "id",
      });
      const postIds = posts.items.map((p) => p.id);
      if (postIds.length > 0) {
        filters.push(`(${postIds.map((id) => `target_id = "${id}"`).join(" || ")})`);
      } else {
        return NextResponse.json({ items: [], totalItems: 0, totalPages: 0 });
      }
    }

    const result = await pb.collection("reports").getList(page, 20, {
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "-created",
      expand: "reporter",
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("List reports error:", err);
    return NextResponse.json({ items: [], totalItems: 0, totalPages: 0 });
  }
}
