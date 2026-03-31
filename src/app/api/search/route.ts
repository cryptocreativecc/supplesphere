import { NextRequest, NextResponse } from "next/server";
import { searchAll, quickSearch } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const quick = searchParams.get("quick") === "true";
  const type = (searchParams.get("type") || "all") as
    | "all"
    | "sources"
    | "products"
    | "posts"
    | "communities";
  const sort = searchParams.get("sort") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { sources: [], products: [], posts: [], communities: [] },
      { status: 200 }
    );
  }

  try {
    if (quick) {
      const results = await quickSearch(q);
      const grouped = {
        sources: results.sources.map((r) => ({
          id: r.item.id,
          type: "source" as const,
          title: r.item.name,
          subtitle: r.item.url,
          url: `/sources/${r.item.slug || r.item.id}`,
        })),
        products: results.products.map((r) => ({
          id: r.item.id,
          type: "product" as const,
          title: r.item.name,
          subtitle: undefined as string | undefined,
          url: `/supplements/${r.item.slug || r.item.id}`,
        })),
        posts: results.posts.map((r) => ({
          id: r.item.id,
          type: "post" as const,
          title: r.item.title,
          subtitle: r.item.body ? r.item.body.substring(0, 60) + "…" : undefined,
          url: `/a/community/${r.item.id}`,
        })),
        communities: results.communities.map((r) => ({
          id: r.item.id,
          type: "community" as const,
          title: r.item.name,
          subtitle: `a/${r.item.slug} • ${r.item.member_count} members`,
          url: `/a/${r.item.slug}`,
        })),
      };
      return NextResponse.json(grouped);
    }

    const results = await searchAll(q, { type, sort, page, perPage });
    return NextResponse.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
