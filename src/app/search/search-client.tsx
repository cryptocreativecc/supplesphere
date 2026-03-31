"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StarRatingDisplay } from "@/components/star-rating";

type Tab = "all" | "sources" | "products" | "posts" | "communities";

interface SearchResultItem {
  item: Record<string, unknown>;
  type: string;
}

interface SearchResults {
  sources: SearchResultItem[];
  products: SearchResultItem[];
  posts: SearchResultItem[];
  communities: SearchResultItem[];
}

export function SearchPageClient() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-8 text-center text-neutral-400">Loading…</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialTab = (searchParams.get("tab") || "all") as Tab;

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState("-created");

  const doSearch = useCallback(
    async (q: string, tab: Tab, sortBy: string) => {
      if (!q || q.trim().length < 2) {
        setResults(null);
        return;
      }
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q,
          type: tab,
          sort: sortBy,
          perPage: "20",
        });
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, activeTab, sort);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.replace(`/search?q=${encodeURIComponent(query)}&tab=${activeTab}`);
    doSearch(query, activeTab, sort);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (query.trim()) {
      router.replace(`/search?q=${encodeURIComponent(query)}&tab=${tab}`);
      doSearch(query, tab, sort);
    }
  }

  function handleSortChange(newSort: string) {
    setSort(newSort);
    if (query.trim()) doSearch(query, activeTab, newSort);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "sources", label: "Sources" },
    { key: "products", label: "Products" },
    { key: "posts", label: "Posts" },
    { key: "communities", label: "Communities" },
  ];

  const totalResults = results
    ? results.sources.length +
      results.products.length +
      results.posts.length +
      results.communities.length
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-navy">Search</h1>

      {/* Search input */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <svg
          className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sources, supplements, posts, communities..."
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pr-24 pl-12 text-base shadow-card transition focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-accent-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-teal-light"
        >
          Search
        </button>
      </form>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-b-2 border-accent-teal text-accent-teal"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      {results && totalResults > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            {totalResults} result{totalResults !== 1 ? "s" : ""}
          </span>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 focus:border-accent-teal focus:outline-none"
          >
            <option value="-created">Newest first</option>
            <option value="created">Oldest first</option>
            <option value="-avg_rating">Highest rated</option>
          </select>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="py-12 text-center text-neutral-400">Searching…</div>
      )}

      {/* Results */}
      {results && !isLoading && (
        <div className="space-y-3">
          {/* Sources */}
          {results.sources.length > 0 && (
            <ResultSection title="Sources">
              {results.sources.map((r) => (
                <SourceResult key={r.item["id"] as string} item={r.item} />
              ))}
            </ResultSection>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <ResultSection title="Products">
              {results.products.map((r) => (
                <ProductResult key={r.item["id"] as string} item={r.item} />
              ))}
            </ResultSection>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (
            <ResultSection title="Posts">
              {results.posts.map((r) => (
                <PostResult key={r.item["id"] as string} item={r.item} />
              ))}
            </ResultSection>
          )}

          {/* Communities */}
          {results.communities.length > 0 && (
            <ResultSection title="Communities">
              {results.communities.map((r) => (
                <CommunityResult
                  key={r.item["id"] as string}
                  item={r.item}
                />
              ))}
            </ResultSection>
          )}

          {/* No results */}
          {totalResults === 0 && (
            <div className="rounded-xl bg-neutral-50 p-8 text-center">
              <div className="mb-2 text-4xl">🔍</div>
              <h3 className="mb-1 text-lg font-semibold text-neutral-700">
                No results found
              </h3>
              <p className="mb-4 text-sm text-neutral-400">
                Try different keywords or check your spelling
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Protein", "Creatine", "Vitamins", "Pre-workout"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion);
                        doSearch(suggestion, activeTab, sort);
                      }}
                      className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600 transition hover:border-accent-teal hover:text-accent-teal"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!results && !isLoading && (
        <div className="rounded-xl bg-neutral-50 p-8 text-center text-neutral-400">
          Enter a search query to find sources, supplements, posts, and
          communities.
        </div>
      )}
    </div>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-neutral-400 uppercase">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SourceResult({ item }: { item: Record<string, unknown> }) {
  const name = item["name"] as string;
  const slug = (item["slug"] as string) || (item["id"] as string);
  const url = item["url"] as string;
  const verified = item["verified"] === true;
  const avgRating = (item["avg_rating"] as number) || 0;
  const reviewCount = (item["review_count"] as number) || 0;

  return (
    <Link
      href={`/sources/${slug}`}
      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5 text-xl">
        🏪
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-brand-navy">{name}</span>
          {verified && (
            <span className="rounded bg-accent-teal/10 px-1.5 py-0.5 text-xs font-medium text-accent-teal">
              Verified
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-neutral-500">
          <span className="truncate">{url}</span>
          {avgRating > 0 && (
            <>
              <span>•</span>
              <StarRatingDisplay rating={avgRating} />
              <span>({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductResult({ item }: { item: Record<string, unknown> }) {
  const name = item["name"] as string;
  const slug = (item["slug"] as string) || (item["id"] as string);
  const avgRating = (item["avg_rating"] as number) || 0;
  const reviewCount = (item["review_count"] as number) || 0;
  const description = (item["description"] as string) || "";

  return (
    <Link
      href={`/supplements/${slug}`}
      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-teal/5 text-xl">
        💊
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-brand-navy">{name}</span>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-neutral-500">
          {avgRating > 0 && (
            <>
              <StarRatingDisplay rating={avgRating} />
              <span>({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
            </>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-neutral-400 line-clamp-1">{description}</p>
        )}
      </div>
    </Link>
  );
}

function PostResult({ item }: { item: Record<string, unknown> }) {
  const expand = item["expand"] as Record<string, unknown> | undefined;
  const communityData = expand?.["community"] as Record<string, unknown> | undefined;
  const communitySlug = (communityData?.["slug"] as string) || "community";
  const id = item["id"] as string;
  const title = item["title"] as string;
  const body = (item["body"] as string) || "";
  const created = item["created"] as string;
  const postType = ((item["post_type"] as string) || "").replace("_", " ");

  return (
    <Link
      href={`/a/${communitySlug}/${id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
    >
      <div className="mb-1 flex items-center gap-2 text-xs">
        <span className="font-medium text-accent-teal">a/{communitySlug}</span>
        <span className="text-neutral-300">•</span>
        <span className="text-neutral-400">{created}</span>
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
          {postType}
        </span>
      </div>
      <div className="font-semibold text-brand-navy">{title}</div>
      {body && (
        <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{body}</p>
      )}
    </Link>
  );
}

function CommunityResult({ item }: { item: Record<string, unknown> }) {
  const slug = item["slug"] as string;
  const name = item["name"] as string;
  const memberCount = (item["member_count"] as number) || 0;
  const description = (item["description"] as string) || "";

  return (
    <Link
      href={`/a/${slug}`}
      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-xl">
        👥
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-brand-navy">{name}</div>
        <div className="mt-0.5 text-sm text-neutral-500">
          a/{slug} • {memberCount} members
        </div>
        {description && (
          <p className="mt-1 text-sm text-neutral-400 line-clamp-1">{description}</p>
        )}
      </div>
    </Link>
  );
}
