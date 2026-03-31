"use client";

import { useState, useEffect } from "react";

interface PointsEntry {
  id: string;
  action: string;
  points: number;
  reference_type: string;
  reference_id: string;
  created: string;
}

const actionLabels: Record<string, { label: string; icon: string }> = {
  source_review: { label: "Source Review", icon: "🏪" },
  product_review: { label: "Product Review", icon: "💊" },
  discussion: { label: "Discussion", icon: "💬" },
  deal: { label: "Deal Shared", icon: "🔥" },
  comment: { label: "Comment", icon: "💭" },
  receive_post_upvote: { label: "Post Upvoted", icon: "👍" },
  receive_comment_upvote: { label: "Comment Upvoted", icon: "👍" },
  give_upvote: { label: "Upvoted Content", icon: "⬆️" },
  first_post_of_day: { label: "First Post Bonus", icon: "🌅" },
  verified_purchase_bonus: { label: "Verified Purchase", icon: "✅" },
  report_accepted: { label: "Report Accepted", icon: "🛡️" },
  content_removed: { label: "Content Removed", icon: "❌" },
  spam_confirmed: { label: "Spam Penalty", icon: "🚫" },
};

export function PointsHistory({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<PointsEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"all" | "earned" | "spent">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/points?page=${page}&limit=15&filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.items || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [page, filter, userId]);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1">
        {(["all", "earned", "spent"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filter === f
                ? "bg-white text-brand-navy shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {f === "all" ? "All" : f === "earned" ? "Earned" : "Deducted"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No points history yet. Start contributing to earn points!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const config = actionLabels[entry.action] || {
              label: entry.action,
              icon: "📌",
            };
            const isPositive = entry.points > 0;

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white px-4 py-3 transition hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{config.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      {config.label}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDate(entry.created)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isPositive ? "text-success" : "text-error"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {entry.points}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-neutral-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
