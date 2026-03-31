import { NextRequest, NextResponse } from "next/server";

// In production, this would query PocketBase
// For now, returns mock data structure
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "rating";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");

  // Placeholder — would use createPb() and query sources collection
  return NextResponse.json({
    page,
    perPage,
    totalItems: 0,
    totalPages: 0,
    items: [],
    filters: { q, category, sort },
  });
}
