import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";
import { resolveReport } from "@/lib/moderation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { pb, user } = await getAuthenticatedPb();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, communityId } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    await resolveReport(pb, id, action, user.id, communityId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resolve report error:", err);
    return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 });
  }
}
