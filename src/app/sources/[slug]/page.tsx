import Link from "next/link";
import { Metadata } from "next";
import { StarRatingDisplay } from "@/components/star-rating";
import { RatingBreakdown } from "@/components/rating-breakdown";
import { UserBadge } from "@/components/user-badge";
import { SourceCard } from "@/components/source-card";
import { VoteButtons } from "@/components/feed/vote-buttons";
import { SourceReviewsClient } from "./source-reviews-client";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateSourceSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data";
import {
  mockSources,
  mockFeedPosts,
  mockSourceRatingDistribution,
} from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = mockSources.find((s) => s.slug === slug);
  if (!source) return { title: "Source Not Found" };
  return {
    title: `${source.name} Reviews & Ratings`,
    description: `Read ${source.reviewCount} community reviews for ${source.name}. ${source.description}`,
    openGraph: {
      title: `${source.name} Reviews & Ratings | SuppleSphere`,
      description: source.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${source.name} Reviews & Ratings | SuppleSphere`,
      description: source.description,
    },
    alternates: {
      canonical: `/sources/${slug}`,
    },
  };
}

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const source = mockSources.find((s) => s.slug === slug);

  if (!source) {
    const name = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/sources"
          className="mb-4 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sources
        </Link>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-card">
          <h1 className="text-2xl font-bold text-brand-navy">{name}</h1>
          <p className="mt-2 text-neutral-400">
            This source hasn&apos;t been added to SuppleSphere yet.
          </p>
          <button className="mt-4 rounded-lg bg-accent-teal px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light">
            Add This Source
          </button>
        </div>
      </div>
    );
  }

  const sourceReviews = mockFeedPosts.filter(
    (p) => p.post_type === "source_review"
  );
  const similarSources = mockSources
    .filter((s) => s.slug !== source.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <JsonLd data={generateSourceSchema(source)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Sources", url: "/sources" },
          { name: source.name, url: `/sources/${source.slug}` },
        ])}
      />
      <Link
        href="/sources"
        className="mb-6 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Sources
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Hero */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-3xl font-bold text-white">
                {source.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-brand-navy">{source.name}</h1>
                  {source.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-teal/10 px-2.5 py-0.5 text-xs font-medium text-accent-teal">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <a
                  href={`https://${source.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light"
                >
                  {source.url}
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{source.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {source.categories.map((cat) => (
                    <span key={cat} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-neutral-50 p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <StarRatingDisplay rating={source.avgRating} size="md" />
                </div>
                <p className="mt-1 text-lg font-bold text-brand-navy">{source.avgRating.toFixed(1)}</p>
                <p className="text-xs text-neutral-400">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-brand-navy">{source.reviewCount.toLocaleString()}</p>
                <p className="text-xs text-neutral-400">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-brand-navy">{source.categories.length}</p>
                <p className="text-xs text-neutral-400">Categories</p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-brand-navy">Rating Breakdown</h2>
            <div className="mx-auto max-w-md">
              <RatingBreakdown distribution={mockSourceRatingDistribution} totalReviews={source.reviewCount} />
            </div>
          </div>

          {/* Write a Review CTA */}
          <div className="rounded-xl border border-accent-teal/20 bg-accent-teal/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-brand-navy">
              Bought from {source.name}?
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Share your experience and help others make informed decisions.
            </p>
            <Link
              href={`/a/sourcereviews/submit`}
              className="mt-4 inline-block rounded-lg bg-accent-teal px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light"
            >
              Write a Review
            </Link>
          </div>

          {/* Reviews with sort & pagination */}
          <SourceReviewsClient reviews={sourceReviews} />
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h3 className="mb-3 text-sm font-semibold text-brand-navy">Similar Sources</h3>
              <div className="space-y-3">
                {similarSources.map((s) => (
                  <SourceCard
                    key={s.slug}
                    name={s.name}
                    slug={s.slug}
                    url={s.url}
                    verified={s.verified}
                    avgRating={s.avgRating}
                    reviewCount={s.reviewCount}
                    compact
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h3 className="mb-2 text-sm font-semibold text-brand-navy">Source Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Status</span>
                  <span className="font-medium text-neutral-700">
                    {source.verified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Claimed</span>
                  <span className="font-medium text-neutral-700">Not yet claimed</span>
                </div>
              </div>
              <button className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:border-accent-teal hover:text-accent-teal">
                Claim This Source
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
