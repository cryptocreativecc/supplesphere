"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DiscussionForm({
  community,
}: {
  community: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const isValid = title.trim().length > 0 && wordCount >= 30;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_type: "discussion",
          title,
          body,
          community,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      const data = await res.json();
      router.push(`/a/${community}/${data.id || ""}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Title <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          placeholder="What's on your mind?"
          maxLength={200}
        />
      </div>

      {/* Body */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Body <span className="text-error">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          placeholder="Share your thoughts... (Markdown supported)"
        />
        <p className="mt-1 text-xs text-neutral-400">
          {wordCount} words
          {wordCount < 30 && (
            <span className="text-warning"> — minimum 30 words required</span>
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!isValid || loading}
          className="rounded-lg bg-accent-teal px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Post Discussion"}
        </button>
      </div>
    </form>
  );
}
