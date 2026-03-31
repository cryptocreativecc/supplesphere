"use client";

import { useState } from "react";
import Link from "next/link";
import { StarRatingDisplay } from "@/components/star-rating";
import { UserBadge } from "@/components/user-badge";
import { VoteButtons } from "@/components/feed/vote-buttons";
import type { FeedPost } from "@/components/feed/feed-card";

type ReviewSort = "newest" | "highest" | "helpful";

const REVIEWS_PER_PAGE = 10;

export function ProductReviewsClient({ reviews }: { reviews: FeedPost[] }) {
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [page, setPage] = useState(1);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "highest") return (b.rating || 0) - (a.rating || 0);
    if (sort === "helpful") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / REVIEWS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-navy">Reviews</h2>
        <div className="flex gap-1">
          {(["newest", "highest", "helpful"] as ReviewSort[]).map((s) => (
            <button
              key={s}
              onClick={() => { setSort(s); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                sort === s
                  ? "bg-accent-teal text-white"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {s === "helpful" ? "Most Helpful" : s === "highest" ? "Highest Rated" : "Newest"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {paginated.map((review) => (
          <div key={review.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <UserBadge username={review.author} tier={review.authorTier} size="sm" />
                  <span className="text-xs text-neutral-400">• {review.created}</span>
                  {/* Verified purchase badge */}
                  {review.id === "post-2" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Purchase
                    </span>
                  )}
                </div>
                {review.rating && (
                  <div className="mt-2">
                    <StarRatingDisplay rating={review.rating} />
                  </div>
                )}
              </div>
              <VoteButtons
                targetId={review.id}
                targetType="post"
                initialUpvotes={review.upvotes}
                initialDownvotes={review.downvotes}
              />
            </div>
            <h3 className="mt-3 font-semibold text-brand-navy">
              <Link href={`/a/${review.community}/${review.id}`} className="hover:text-accent-teal">
                {review.title}
              </Link>
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{review.body}</p>

            <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
              <span>Was this review helpful?</span>
              <Link
                href={`/a/${review.community}/${review.id}`}
                className="flex items-center gap-1 hover:text-accent-teal"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {review.commentCount} comments
              </Link>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:border-accent-teal disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-neutral-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:border-accent-teal disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
