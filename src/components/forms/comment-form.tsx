"use client";

import { useState } from "react";

export function CommentForm({
  postId,
  parentCommentId,
  onSubmit,
  onCancel,
  placeholder = "What are your thoughts?",
  compact = false,
}: {
  postId: string;
  parentCommentId?: string;
  onSubmit?: (comment: { id: string; body: string }) => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const charCount = body.length;
  const isValid = body.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          parentCommentId,
          content: body,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post comment");
      }

      const data = await res.json();
      setBody("");
      onSubmit?.({ id: data.id || "new", body });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={compact ? 3 : 4}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
        placeholder={placeholder}
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>{charCount} chars</span>
          <span>{wordCount} words</span>
          {wordCount > 0 && wordCount < 15 && (
            <span className="text-warning">15+ words for points</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="rounded-lg bg-accent-teal px-4 py-1.5 text-xs font-medium text-white transition hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : compact ? "Reply" : "Comment"}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
    </form>
  );
}
