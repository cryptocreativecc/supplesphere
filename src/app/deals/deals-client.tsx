"use client";

import { useState } from "react";
import Link from "next/link";
import { VoteButtons } from "@/components/feed/vote-buttons";

interface DealItem {
  id: string;
  title: string;
  description: string;
  sourceName: string;
  sourceSlug: string;
  dealPrice: string;
  code?: string;
  url: string;
  expires: string;
  category: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPromoted: boolean;
  author: string;
  created: string;
}

type SortOption = "newest" | "expiring" | "popular";

const categories = ["All", "Protein", "Creatine", "Vitamins", "Pre-Workout", "Amino Acids"];

function DealCountdown({ expires }: { expires: string }) {
  const exp = new Date(expires);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return <span className="text-xs font-medium text-error">Expired</span>;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return (
    <span className="text-xs font-medium text-warning">
      {days > 0 ? `${days}d ` : ""}{hours}h left
    </span>
  );
}

function DealCard({ deal }: { deal: DealItem }) {
  const [codeCopied, setCodeCopied] = useState(false);

  function copyCode() {
    if (deal.code) {
      navigator.clipboard.writeText(deal.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }

  return (
    <div className={`relative rounded-xl border bg-white p-5 shadow-card transition hover:shadow-card-hover ${
      deal.isPromoted ? "border-accent-teal/30 ring-1 ring-accent-teal/20" : "border-neutral-200"
    }`}>
      {deal.isPromoted && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-accent-teal px-3 py-0.5 text-xs font-medium text-white">
          Promoted
        </span>
      )}

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-white">
            {deal.sourceName.charAt(0)}
          </div>
          <Link
            href={`/sources/${deal.sourceSlug}`}
            className="text-sm font-medium text-neutral-600 hover:text-accent-teal"
          >
            {deal.sourceName}
          </Link>
        </div>
        <DealCountdown expires={deal.expires} />
      </div>

      <h3 className="font-semibold text-brand-navy">{deal.title}</h3>
      <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2">{deal.description}</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-bold text-success">
          {deal.dealPrice}
        </span>
        {deal.code && (
          <button
            onClick={copyCode}
            className="group flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-mono transition hover:border-accent-teal"
          >
            <code className="text-accent-teal">{deal.code}</code>
            <svg className="h-3.5 w-3.5 text-neutral-400 group-hover:text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {codeCopied && (
              <span className="text-xs text-success">Copied!</span>
            )}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
        <div className="flex items-center gap-3">
          <VoteButtons
            targetId={deal.id}
            targetType="post"
            initialUpvotes={deal.upvotes}
            initialDownvotes={deal.downvotes}
          />
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {deal.commentCount}
          </span>
        </div>
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-success px-4 py-1.5 text-xs font-medium text-white transition hover:bg-success-light"
        >
          View Deal →
        </a>
      </div>
    </div>
  );
}

export function DealsClient({ deals }: { deals: DealItem[] }) {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");

  let filtered = deals;
  if (category !== "All") {
    filtered = filtered.filter((d) => d.category === category);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    // Promoted always first
    if (a.isPromoted && !b.isPromoted) return -1;
    if (!a.isPromoted && b.isPromoted) return 1;

    if (sort === "popular") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    if (sort === "expiring") return new Date(a.expires).getTime() - new Date(b.expires).getTime();
    return 0; // newest = default order
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
        <div className="flex gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                category === cat
                  ? "bg-accent-teal text-white"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-neutral-200" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 focus:border-accent-teal focus:outline-none"
        >
          <option value="newest">Newest</option>
          <option value="expiring">Expiring Soon</option>
          <option value="popular">Most Upvoted</option>
        </select>
      </div>

      {/* Deals Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-neutral-400">No deals found for this category.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
