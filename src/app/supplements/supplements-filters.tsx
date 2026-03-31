"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";

interface ProductData {
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  category: string;
  avgRating: number;
  reviewCount: number;
}

interface CategoryData {
  name: string;
  slug: string;
  icon: string;
}

export function SupplementsFilters({
  categories,
  products,
}: {
  categories: CategoryData[];
  products: ProductData[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<"rating" | "reviews" | "newest">("rating");

  const filtered = products
    .filter((p) => {
      if (activeCategory === "all") return true;
      return p.category.toLowerCase() === activeCategory.toLowerCase();
    })
    .sort((a, b) => {
      if (sort === "rating") return b.avgRating - a.avgRating;
      if (sort === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });

  return (
    <>
      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            activeCategory === "all"
              ? "bg-accent-teal text-white"
              : "border border-neutral-200 text-neutral-600 hover:border-accent-teal hover:text-accent-teal"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.name)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === cat.name
                ? "bg-accent-teal text-white"
                : "border border-neutral-200 text-neutral-600 hover:border-accent-teal hover:text-accent-teal"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 focus:border-accent-teal focus:outline-none"
        >
          <option value="rating">Sort by Rating</option>
          <option value="reviews">Sort by Reviews</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard
            key={product.slug}
            name={product.name}
            slug={product.slug}
            brandName={product.brandName}
            brandSlug={product.brandSlug}
            category={product.category}
            avgRating={product.avgRating}
            reviewCount={product.reviewCount}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-neutral-400">
            No products in this category yet
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Check back soon or try a different category
          </p>
        </div>
      )}
    </>
  );
}
