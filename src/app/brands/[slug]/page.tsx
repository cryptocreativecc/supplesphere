import Link from "next/link";
import { Metadata } from "next";
import { StarRatingDisplay } from "@/components/star-rating";
import { ProductCard } from "@/components/product-card";
import { mockBrands, mockProducts } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = mockBrands.find((b) => b.slug === slug);
  if (!brand) return { title: "Brand Not Found" };
  return {
    title: `${brand.name} Supplements`,
    description: `Browse ${brand.name} supplements and read community reviews. ${brand.description}`,
    openGraph: {
      title: `${brand.name} Supplements | SuppleSphere`,
      description: brand.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} Supplements | SuppleSphere`,
      description: brand.description,
    },
    alternates: {
      canonical: `/brands/${slug}`,
    },
  };
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = mockBrands.find((b) => b.slug === slug);

  if (!brand) {
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
          <p className="mt-2 text-neutral-400">This brand hasn&apos;t been added yet.</p>
        </div>
      </div>
    );
  }

  const brandProducts = mockProducts.filter(
    (p) => p.brandSlug === brand.slug
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/supplements" className="mb-6 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Supplements
      </Link>

      {/* Brand Hero */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Logo */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-accent-teal text-3xl font-bold text-white">
            {brand.name.charAt(0)}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-navy">
                {brand.name}
              </h1>
              {brand.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-teal/10 px-2.5 py-0.5 text-xs font-medium text-accent-teal">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Brand
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {brand.country}
              </span>
              <a
                href={`https://${brand.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-accent-teal hover:text-accent-teal-light"
              >
                {brand.website}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {brand.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-neutral-50 p-4">
          <div className="text-center">
            <p className="text-lg font-bold text-brand-navy">
              {brand.productCount}
            </p>
            <p className="text-xs text-neutral-400">Products</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <StarRatingDisplay rating={brand.avgRating} />
            </div>
            <p className="mt-1 text-sm font-bold text-brand-navy">
              {brand.avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-neutral-400">Avg Rating</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-navy">
              {brand.totalReviews.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-400">Total Reviews</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">
          Products by {brand.name}
        </h2>
        {brandProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandProducts.map((product) => (
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
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <p className="text-neutral-400">No products listed for this brand yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
