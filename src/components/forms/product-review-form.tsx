"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "@/components/star-rating";
import { ImageUpload } from "./image-upload";

export function ProductReviewForm({
  community,
  preselectedProduct,
  preselectedBrand,
}: {
  community: string;
  preselectedProduct?: { id: string; name: string };
  preselectedBrand?: { id: string; name: string };
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [verifiedPurchase, setVerifiedPurchase] = useState(false);
  const [brandId, setBrandId] = useState(preselectedBrand?.id || "");
  const [productId, setProductId] = useState(preselectedProduct?.id || "");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mock brand/product options (would be fetched from API)
  const brands = [
    { id: "brand-1", name: "Optimum Nutrition" },
    { id: "brand-2", name: "MyProtein" },
    { id: "brand-3", name: "Creapure" },
    { id: "brand-4", name: "Nordic Naturals" },
    { id: "brand-5", name: "Solgar" },
    { id: "brand-6", name: "Cellucor" },
  ];

  const products: Record<string, { id: string; name: string }[]> = {
    "brand-1": [{ id: "prod-1", name: "Gold Standard Whey" }],
    "brand-2": [{ id: "prod-6", name: "BCAA Complex" }],
    "brand-3": [{ id: "prod-2", name: "Creatine Monohydrate" }],
    "brand-4": [{ id: "prod-3", name: "Omega-3 Fish Oil" }],
    "brand-5": [{ id: "prod-4", name: "Vitamin D3 4000IU" }],
    "brand-6": [{ id: "prod-5", name: "C4 Original Pre-Workout" }],
  };

  const filteredProducts = brandId ? (products[brandId] || []) : [];

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const isValid = rating > 0 && title.trim().length > 0 && wordCount >= 50 && (brandId || preselectedBrand);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("post_type", "product_review");
      formData.append("title", title);
      formData.append("body", body);
      formData.append("rating", String(rating));
      formData.append("community", community);
      formData.append("is_verified_purchase", String(verifiedPurchase));
      if (brandId) formData.append("brand", brandId);
      if (productId) formData.append("product", productId);
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
      {/* Brand selector */}
      {!preselectedBrand && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Brand <span className="text-error">*</span>
          </label>
          <select
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value);
              setProductId("");
            }}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
          >
            <option value="">Select a brand...</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Product selector */}
      {!preselectedProduct && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Product
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={!brandId && !preselectedBrand}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
          >
            <option value="">Select a product...</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {!brandId && !preselectedBrand && (
            <p className="mt-1 text-xs text-neutral-400">Select a brand first</p>
          )}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Rating <span className="text-error">*</span>
        </label>
        <StarRatingInput value={rating} onChange={setRating} />
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
          placeholder="e.g., Gold Standard Whey — still the best after 5 years"
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
          placeholder="Share your experience with this product... (Markdown supported)"
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
          <p className="text-xs text-neutral-400">I purchased this product</p>
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
