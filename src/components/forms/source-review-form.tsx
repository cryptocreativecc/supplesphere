"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "@/components/star-rating";
import { ImageUpload } from "./image-upload";

export function SourceReviewForm({
  community,
  preselectedSource,
}: {
  community: string;
  preselectedSource?: { id: string; name: string };
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [verifiedPurchase, setVerifiedPurchase] = useState(false);
  const [sourceId, setSourceId] = useState(preselectedSource?.id || "");
  const [sourceName, setSourceName] = useState(preselectedSource?.name || "");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<{ id: string; name: string }[]>([]);
  const [sourcesLoaded, setSourcesLoaded] = useState(!!preselectedSource);

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const isValid = rating > 0 && title.trim().length > 0 && wordCount >= 50 && (sourceId || sourceName);

  async function loadSources() {
    if (sourcesLoaded) return;
    try {
      const res = await fetch("/api/sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data.items || []);
      }
    } catch {
      // Use empty array
    }
    setSourcesLoaded(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("post_type", "source_review");
      formData.append("title", title);
      formData.append("body", body);
      formData.append("rating", String(rating));
      formData.append("community", community);
      formData.append("is_verified_purchase", String(verifiedPurchase));
      if (sourceId) formData.append("source", sourceId);
      if (sourceName && !sourceId) formData.append("source_name", sourceName);
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
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
      {/* Source selector */}
      {!preselectedSource && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Source <span className="text-error">*</span>
          </label>
          {sources.length > 0 ? (
            <select
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                const s = sources.find((s) => s.id === e.target.value);
                setSourceName(s?.name || "");
              }}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
            >
              <option value="">Select a source...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              onFocus={loadSources}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
              placeholder="Enter source name..."
            />
          )}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Rating <span className="text-error">*</span>
        </label>
        <StarRatingInput value={rating} onChange={setRating} />
        {rating === 0 && (
          <p className="mt-1 text-xs text-neutral-400">Select a rating</p>
        )}
      </div>

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
          placeholder="e.g., Fast delivery, legit products — highly recommend"
          maxLength={200}
        />
      </div>

      {/* Body */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Review <span className="text-error">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          placeholder="Share your detailed experience with this source... (Markdown supported)"
        />
        <p className="mt-1 text-xs text-neutral-400">
          {wordCount} words
          {wordCount < 50 && (
            <span className="text-warning"> — minimum 50 words required</span>
          )}
        </p>
      </div>

      {/* Verified Purchase */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={verifiedPurchase}
          onChange={(e) => setVerifiedPurchase(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-accent-teal focus:ring-accent-teal"
        />
        <div>
          <span className="text-sm font-medium text-neutral-700">Verified Purchase</span>
          <p className="text-xs text-neutral-400">I purchased from this source</p>
        </div>
      </label>

      {/* Images */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Images (optional)
        </label>
        <ImageUpload images={images} onChange={setImages} maxImages={4} />
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!isValid || loading}
          className="rounded-lg bg-accent-teal px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
