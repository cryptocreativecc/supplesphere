"use client";

import { useState } from "react";

export function VoteButtons({
  targetId,
  targetType,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  orientation = "horizontal",
}: {
  targetId: string;
  targetType: "post" | "comment";
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: 1 | -1 | null;
  orientation?: "horizontal" | "vertical";
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote ?? null);

  async function handleVote(value: 1 | -1) {
    const prevVote = userVote;
    const prevUp = upvotes;
    const prevDown = downvotes;

    // Optimistic update
    if (userVote === value) {
      // Remove vote
      setUserVote(null);
      if (value === 1) setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      setUserVote(value);
      if (value === 1) {
        setUpvotes((v) => v + 1);
        if (prevVote === -1) setDownvotes((v) => v - 1);
      } else {
        setDownvotes((v) => v + 1);
        if (prevVote === 1) setUpvotes((v) => v - 1);
      }
    }

    try {
      const endpoint =
        targetType === "post"
          ? `/api/posts/${targetId}/vote`
          : `/api/comments/${targetId}/vote`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: userVote === value ? 0 : value }),
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch {
      // Rollback
      setUserVote(prevVote);
      setUpvotes(prevUp);
      setDownvotes(prevDown);
    }
  }

  const score = upvotes - downvotes;
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex items-center gap-1 rounded-lg bg-neutral-50 px-2 py-1 ${
        isVertical ? "flex-col" : ""
      }`}
    >
      <button
        onClick={() => handleVote(1)}
        className={`transition ${
          userVote === 1
            ? "text-accent-teal"
            : "text-neutral-400 hover:text-accent-teal"
        }`}
        aria-label="Upvote"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <span
        className={`min-w-[2ch] text-center text-sm font-medium ${
          userVote === 1
            ? "text-accent-teal"
            : userVote === -1
              ? "text-error"
              : "text-neutral-700"
        }`}
      >
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        className={`transition ${
          userVote === -1
            ? "text-error"
            : "text-neutral-400 hover:text-error"
        }`}
        aria-label="Downvote"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
