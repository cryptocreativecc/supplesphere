"use client";

import { useState } from "react";
import { FeedCard, type FeedPost } from "./feed-card";

type SortOption = "new" | "top" | "hot";
type ScopeOption = "everywhere" | "my_communities" | "following";

export function FeedList({
  initialPosts,
  community,
  showScopeFilter = true,
}: {
  initialPosts: FeedPost[];
  community?: string;
  showScopeFilter?: boolean;
}) {
  const [posts] = useState<FeedPost[]>(initialPosts);
  const [sort, setSort] = useState<SortOption>("new");
  const [scope, setScope] = useState<ScopeOption>("everywhere");

  const sortedPosts = [...posts].sort((a, b) => {
    if (sort === "top") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    // "new" and "hot" use default order for now
    return 0;
  });

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
        <div className="flex gap-1">
          {(["new", "top", "hot"] as SortOption[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                sort === s
                  ? "bg-accent-teal text-white"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {showScopeFilter && (
          <>
            <div className="h-5 w-px bg-neutral-200" />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ScopeOption)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 focus:border-accent-teal focus:outline-none"
            >
              <option value="everywhere">Everywhere</option>
              <option value="my_communities">My Communities</option>
              <option value="following">Following</option>
            </select>
          </>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {sortedPosts.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <p className="text-neutral-400">No posts yet. Be the first to contribute!</p>
          </div>
        ) : (
          sortedPosts.map((post) => <FeedCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
