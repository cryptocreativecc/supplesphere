import { createPb } from "./pb";
import type { Source, Product, Post, Community } from "./types";

export interface SearchResults {
  sources: SearchResult<Source>[];
  products: SearchResult<Product>[];
  posts: SearchResult<Post>[];
  communities: SearchResult<Community>[];
}

export interface SearchResult<T> {
  item: T;
  type: "source" | "product" | "post" | "community";
}

export interface SearchFilters {
  type?: "all" | "sources" | "products" | "posts" | "communities";
  sort?: string;
  page?: number;
  perPage?: number;
}

/**
 * Build a PocketBase text filter for a given query across multiple fields.
 * Uses ~ (LIKE) for text matching.
 */
function buildTextFilter(query: string, fields: string[]): string {
  const escaped = query.replace(/["\\]/g, "");
  if (!escaped) return "";
  return fields.map((f) => `${f} ~ "${escaped}"`).join(" || ");
}

/**
 * Search all collections in parallel.
 * Uses PocketBase filter syntax for text matching.
 * When Meilisearch is added later, this function can be swapped out.
 */
export async function searchAll(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResults> {
  if (!query || query.trim().length < 2) {
    return { sources: [], products: [], posts: [], communities: [] };
  }

  const pb = createPb();
  const perPage = filters.perPage || 10;
  const page = filters.page || 1;
  const type = filters.type || "all";

  const results: SearchResults = {
    sources: [],
    products: [],
    posts: [],
    communities: [],
  };

  const promises: Promise<void>[] = [];

  // Search sources
  if (type === "all" || type === "sources") {
    promises.push(
      pb
        .collection("sources")
        .getList(page, perPage, {
          filter: buildTextFilter(query, ["name", "url", "description"]),
          sort: filters.sort || "-avg_rating",
        })
        .then((res) => {
          results.sources = res.items.map((item) => ({
            item: item as unknown as Source,
            type: "source" as const,
          }));
        })
        .catch(() => {})
    );
  }

  // Search products
  if (type === "all" || type === "products") {
    promises.push(
      pb
        .collection("products")
        .getList(page, perPage, {
          filter: buildTextFilter(query, ["name", "description"]),
          sort: filters.sort || "-avg_rating",
          expand: "brand,category",
        })
        .then((res) => {
          results.products = res.items.map((item) => ({
            item: item as unknown as Product,
            type: "product" as const,
          }));
        })
        .catch(() => {})
    );
  }

  // Search posts
  if (type === "all" || type === "posts") {
    promises.push(
      pb
        .collection("posts")
        .getList(page, perPage, {
          filter: `(${buildTextFilter(query, ["title", "body"])}) && status = "published"`,
          sort: filters.sort || "-created",
          expand: "author,community",
        })
        .then((res) => {
          results.posts = res.items.map((item) => ({
            item: item as unknown as Post,
            type: "post" as const,
          }));
        })
        .catch(() => {})
    );
  }

  // Search communities
  if (type === "all" || type === "communities") {
    promises.push(
      pb
        .collection("communities")
        .getList(page, perPage, {
          filter: buildTextFilter(query, ["name", "slug", "description"]),
          sort: filters.sort || "-member_count",
        })
        .then((res) => {
          results.communities = res.items.map((item) => ({
            item: item as unknown as Community,
            type: "community" as const,
          }));
        })
        .catch(() => {})
    );
  }

  await Promise.all(promises);
  return results;
}

/**
 * Quick search — returns fewer results for the header dropdown.
 */
export async function quickSearch(query: string): Promise<SearchResults> {
  return searchAll(query, { perPage: 5 });
}
