"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DealForm({
  community,
}: {
  community: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [dealUrl, setDealUrl] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [dealExpiry, setDealExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    dealUrl.trim().length > 0 &&
    dealPrice.trim().length > 0;

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
          post_type: "deal",
          title,
          body,
          community,
          source_name: sourceName,
          url: dealUrl,
          deal_price: dealPrice,
          deal_expires: dealExpiry || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit deal");
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
      {/* Source */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Source
        </label>
        <input
          type="text"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          placeholder="e.g., ProteinWorks"
        />
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
          placeholder="e.g., 30% off all creatine — code SPRING30"
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Description <span className="text-error">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          placeholder="Describe the deal, any conditions, and your experience..."
        />
      </div>

      {/* Deal details */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Deal URL <span className="text-error">*</span>
          </label>
          <input
            type="url"
            value={dealUrl}
            onChange={(e) => setDealUrl(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Price / Discount <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
            placeholder="e.g., 30% OFF"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Expiry Date
          </label>
          <input
            type="date"
            value={dealExpiry}
            onChange={(e) => setDealExpiry(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          />
        </div>
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
          {loading ? "Submitting..." : "Submit Deal"}
        </button>
      </div>
    </form>
  );
}
