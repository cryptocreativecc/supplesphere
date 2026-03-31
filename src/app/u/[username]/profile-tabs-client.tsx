"use client";

import { useState } from "react";
import Link from "next/link";
import { StarRatingDisplay } from "@/components/star-rating";
import { UserBadge } from "@/components/user-badge";
import { VoteButtons } from "@/components/feed/vote-buttons";
import type { FeedPost } from "@/components/feed/feed-card";

type Tab = "reviews" | "posts" | "comments";

export function ProfileTabsClient({
  username,
  reviews,
  posts,
}: {
  username: string;
  reviews: FeedPost[];
  posts: FeedPost[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "reviews", label: "Reviews", count: reviews.length },
    { key: "posts", label: "Posts", count: posts.length },
    { key: "comments", label: "Comments", count: 0 },
  ];

  return (
    <div className="mt-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-card">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-accent-teal text-white"
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-white/70" : "text-neutral-400"}`}>
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4 space-y-3">
        {activeTab === "reviews" && (
          reviews.length === 0 ? (
            <EmptyState message="No reviews yet." />
          ) : (
            reviews.map((review) => (
              <PostCard key={review.id} post={review} />
            ))
          )
        )}
        {activeTab === "posts" && (
          posts.length === 0 ? (
            <EmptyState message="No posts yet." />
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )
        )}
        {activeTab === "comments" && (
          <EmptyState message="Comments will appear here." />
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/a/${post.community}`}
              className="font-semibold text-accent-teal hover:text-accent-teal-light"
            >
              a/{post.community}
            </Link>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-400">{post.created}</span>
          </div>
          <h3 className="mt-1 font-semibold text-brand-navy hover:text-accent-teal">
            <Link href={`/a/${post.community}/${post.id}`}>{post.title}</Link>
          </h3>
          {post.rating && (
            <div className="mt-1">
              <StarRatingDisplay rating={post.rating} />
            </div>
          )}
          <p className="mt-1.5 text-sm text-neutral-600 line-clamp-2">{post.body}</p>
        </div>
        <VoteButtons
          targetId={post.id}
          targetType="post"
          initialUpvotes={post.upvotes}
          initialDownvotes={post.downvotes}
        />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  );
}
