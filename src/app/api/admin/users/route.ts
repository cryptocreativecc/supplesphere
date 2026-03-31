import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  try {
    const filters = [];
    if (search) {
      filters.push(`(username ~ "${search}" || email ~ "${search}")`);
    }
    if (role) {
      filters.push(`role = "${role}"`);
    }

    const result = await pb.collection("users").getList(page, 20, {
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "-created",
      fields: "id,username,email,role,reputation_tier,points,review_count,created",
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ items: [], totalItems: 0, totalPages: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Handle suspend
    if (updates.suspended) {
      // For now, set role to a special state or lock the account
      await pb.collection("users").update(id, { role: "suspended" });
      return NextResponse.json({ success: true });
    }

    const updated = await pb.collection("users").update(id, updates);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Admin update user error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
