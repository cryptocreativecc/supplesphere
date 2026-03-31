import Link from "next/link";
import { Metadata } from "next";
import { StarRatingDisplay } from "@/components/star-rating";
import { RatingBreakdown } from "@/components/rating-breakdown";
import { ProductCard } from "@/components/product-card";
import { ProductReviewsClient } from "./product-reviews-client";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data";
import {
  mockProducts,
  mockSources,
  mockFeedPosts,
  mockProductRatingDistribution,
} from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} by ${product.brandName} — Reviews`,
    description: `Read ${product.reviewCount} community reviews for ${product.name} by ${product.brandName}. ${product.description}`,
    openGraph: {
      title: `${product.name} by ${product.brandName} — Reviews | SuppleSphere`,
      description: product.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} by ${product.brandName} — Reviews | SuppleSphere`,
      description: product.description,
    },
    alternates: {
      canonical: `/supplements/${slug}`,
    },
  };
}

export default async function SupplementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);

  if (!product) {
    const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/supplements" className="mb-4 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Supplements
        </Link>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-card">
          <h1 className="text-2xl font-bold text-brand-navy">{name}</h1>
          <p className="mt-2 text-neutral-400">This product hasn&apos;t been added yet.</p>
        </div>
      </div>
    );
  }

  const productReviews = mockFeedPosts.filter((p) => p.post_type === "product_review");
  const relatedProducts = mockProducts.filter((p) => p.slug !== product.slug).slice(0, 3);
  const availableSources = mockSources.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <JsonLd data={generateProductSchema(product)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Supplements", url: "/supplements" },
          { name: product.name, url: `/supplements/${product.slug}` },
        ])}
      />
      <Link href="/supplements" className="mb-6 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Supplements
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Product Hero */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="h-48 w-48 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center">
                <svg className="h-16 w-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="rounded-full bg-brand-navy/10 px-2.5 py-0.5 text-xs font-medium text-brand-navy">
                  {product.category}
                </span>
                <h1 className="mt-2 text-2xl font-bold text-brand-navy">{product.name}</h1>
                <Link
                  href={`/brands/${product.brandSlug}`}
                  className="mt-1 inline-block text-sm text-accent-teal hover:text-accent-teal-light"
                >
                  by {product.brandName}
                </Link>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{product.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <StarRatingDisplay rating={product.avgRating} size="md" showValue />
                  <span className="text-sm text-neutral-400">{product.reviewCount.toLocaleString()} reviews</span>
                </div>
                <Link
                  href="/a/supplementreviews/submit"
                  className="mt-4 inline-block rounded-lg bg-accent-teal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light"
                >
                  Write a Review
                </Link>
              </div>
            </div>
          </div>

          {/* Ingredients & Dosage */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-brand-navy">Ingredients & Dosage</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-500 uppercase tracking-wide">Ingredients</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{product.ingredients}</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-500 uppercase tracking-wide">Recommended Dosage</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{product.dosage}</p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-brand-navy">Rating Breakdown</h2>
            <div className="mx-auto max-w-md">
              <RatingBreakdown distribution={mockProductRatingDistribution} totalReviews={product.reviewCount} />
            </div>
          </div>

          {/* Where to Buy */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-brand-navy">Where to Buy</h2>
            <div className="space-y-3">
              {availableSources.map((source, i) => (
                <div
                  key={source.slug}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 transition hover:border-accent-teal/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy text-sm font-bold text-white">
                      {source.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-800">{source.name}</span>
                        {source.verified && (
                          <svg className="h-3.5 w-3.5 text-accent-teal" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRatingDisplay rating={source.avgRating} />
                        <span className="text-xs text-neutral-400">{source.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-navy">£{(19.99 + i * 3.5).toFixed(2)}</p>
                    <a
                      href={`https://${source.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-accent-teal hover:text-accent-teal-light"
                    >
                      Visit Store →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews with sort & pagination */}
          <ProductReviewsClient reviews={productReviews} />
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h3 className="mb-3 text-sm font-semibold text-brand-navy">Related Products</h3>
              <div className="space-y-3">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.slug}
                    name={p.name}
                    slug={p.slug}
                    brandName={p.brandName}
                    category={p.category}
                    avgRating={p.avgRating}
                    reviewCount={p.reviewCount}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
