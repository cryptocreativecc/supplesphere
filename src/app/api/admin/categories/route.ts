import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function GET() {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await pb.collection("categories").getList(1, 100, {
      sort: "name",
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Admin categories error:", err);
    return NextResponse.json({ items: [], totalItems: 0, totalPages: 0 });
  }
}

export async function POST(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, slug, icon, description } = body;
    if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 });

    const created = await pb.collection("categories").create({ name, slug, icon: icon || "", description: description || "" });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Admin create category error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updated = await pb.collection("categories").update(id, updates);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Admin update category error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { pb, user } = await getAuthenticatedPb();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await pb.collection("categories").delete(body.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete category error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
