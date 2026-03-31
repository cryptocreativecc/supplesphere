"use client";

import { useState, useEffect } from "react";

interface DailyCapData {
  [action: string]: { used: number; remaining: number; cap: number };
}

const capLabels: Record<string, { label: string; icon: string }> = {
  source_review: { label: "Source Reviews", icon: "🏪" },
  product_review: { label: "Product Reviews", icon: "💊" },
  discussion: { label: "Discussions", icon: "💬" },
  deal: { label: "Deals", icon: "🔥" },
  comment: { label: "Comments", icon: "💭" },
  receive_post_upvote: { label: "Post Upvotes Received", icon: "👍" },
  receive_comment_upvote: { label: "Comment Upvotes Received", icon: "👍" },
  give_upvote: { label: "Upvotes Given", icon: "⬆️" },
  first_post_of_day: { label: "Daily Post Bonus", icon: "🌅" },
  report_accepted: { label: "Reports Accepted", icon: "🛡️" },
};

export function DailyCaps({ userId }: { userId: string }) {
  const [caps, setCaps] = useState<DailyCapData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/points?type=daily-caps")
      .then((res) => res.json())
      .then((data) => {
        if (data.dailyCaps) setCaps(data.dailyCaps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  }

  // Only show actions that have caps and the user has interacted with, or common ones
  const displayActions = Object.entries(caps).filter(([, data]) => data.cap > 0);

  if (displayActions.length === 0) {
    return (
      <p className="text-sm text-neutral-400">No activity today yet. Start contributing!</p>
    );
  }

  return (
    <div className="space-y-3">
      {displayActions.map(([action, data]) => {
        const config = capLabels[action] || { label: action, icon: "📌" };
        const pct = data.cap > 0 ? (data.used / data.cap) * 100 : 0;
        const isMaxed = data.remaining <= 0;

        return (
          <div key={action}>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{config.icon}</span>
                <span className="text-xs font-medium text-neutral-600">{config.label}</span>
              </div>
              <span className={`text-xs font-medium ${isMaxed ? "text-warning" : "text-neutral-400"}`}>
                {data.used}/{data.cap} pts
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isMaxed ? "bg-warning" : pct > 60 ? "bg-yellow-400" : "bg-accent-teal"
                }`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
