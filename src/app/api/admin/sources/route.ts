import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";

  try {
    const filters = [];
    if (search) {
      filters.push(`(name ~ "${search}" || url ~ "${search}")`);
    }

    const result = await pb.collection("sources").getList(page, 20, {
      filter: filters.length > 0 ? filters.join(" && ") : undefined,
      sort: "-created",
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Admin sources error:", err);
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

    const updated = await pb.collection("sources").update(id, updates);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Admin update source error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await pb.collection("sources").delete(body.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete source error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
