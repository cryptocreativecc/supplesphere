"use client";

import { useState } from "react";
import { SourceCard } from "@/components/source-card";

interface SourceData {
  name: string;
  slug: string;
  url: string;
  verified: boolean;
  avgRating: number;
  reviewCount: number;
  description?: string;
  categories: string[];
}

interface CategoryData {
  name: string;
  slug: string;
  icon: string;
}

export function SourcesFilters({
  categories,
  sources,
}: {
  categories: CategoryData[];
  sources: SourceData[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"rating" | "reviews" | "newest">("rating");

  const filtered = sources
    .filter((s) => {
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== "all" && !s.categories.some((c) => c.toLowerCase() === category.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "rating") return b.avgRating - a.avgRating;
      if (sort === "reviews") return b.reviewCount - a.reviewCount;
      return 0; // newest — would sort by date in production
    });

  return (
    <>
      {/* Search & filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
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
            placeholder="Search sources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 py-2.5 pr-4 pl-10 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-600 focus:border-accent-teal focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-600 focus:border-accent-teal focus:outline-none"
        >
          <option value="rating">Sort by Rating</option>
          <option value="reviews">Sort by Reviews</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-neutral-400">
        {filtered.length} source{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((source) => (
          <SourceCard
            key={source.slug}
            name={source.name}
            slug={source.slug}
            url={source.url}
            verified={source.verified}
            avgRating={source.avgRating}
            reviewCount={source.reviewCount}
            description={source.description}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-neutral-400">
            No sources match your search
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Try adjusting your filters or search term
          </p>
        </div>
      )}
    </>
  );
}
