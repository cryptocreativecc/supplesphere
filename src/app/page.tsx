import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateWebsiteSchema,
  generateOrganizationSchema,
} from "@/lib/structured-data";

/* ─── Placeholder data ─── */
const topSources = [
  { name: "SupplementHQ", url: "supplementhq.co.uk", rating: 4.8, reviews: 342, verified: true },
  { name: "PureProtein UK", url: "pureprotein.co.uk", rating: 4.6, reviews: 218, verified: true },
  { name: "VitalStack", url: "vitalstack.com", rating: 4.5, reviews: 156, verified: false },
  { name: "NutriDirect", url: "nutridirect.co.uk", rating: 4.3, reviews: 89, verified: true },
  { name: "GainZone", url: "gainzone.com", rating: 4.1, reviews: 67, verified: false },
];

const feedPosts = [
  {
    id: "post-1",
    community: "sourcereviews",
    title: "SupplementHQ review — fast delivery, legit products",
    body: "Ordered creatine monohydrate and whey protein last week. Arrived in 2 days, well packaged. Both products had batch codes that checked out. Will order again.",
    author: "ProteinPete",
    tier: "gold",
    upvotes: 47,
    comments: 12,
    time: "3h ago",
    type: "source_review",
    rating: 5,
  },
  {
    id: "post-2",
    community: "supplementreviews",
    title: "Optimum Nutrition Gold Standard Whey — Still the GOAT?",
    body: "Been using ON Gold Standard for years but recently tried a few alternatives. Here's my honest comparison after 3 months of testing different brands...",
    author: "FitReviewer",
    tier: "platinum",
    upvotes: 134,
    comments: 45,
    time: "5h ago",
    type: "product_review",
    rating: 4,
    brand: "Optimum Nutrition",
  },
  {
    id: "post-3",
    community: "sourcetalk",
    title: "Best UK sources for nootropics in 2026?",
    body: "Looking for reliable UK-based sources for nootropics. Specifically interested in Lion's Mane and Ashwagandha KSM-66. What are people using?",
    author: "BrainGains",
    tier: "silver",
    upvotes: 23,
    comments: 31,
    time: "8h ago",
    type: "discussion",
  },
  {
    id: "post-4",
    community: "sourcereviews",
    title: "Warning: Avoid NutriScam.co — possible counterfeit products",
    body: "Ordered what was supposed to be branded creatine but the packaging looked off. Sent it for testing and the results were concerning...",
    author: "SafeSupps",
    tier: "diamond",
    upvotes: 289,
    comments: 67,
    time: "12h ago",
    type: "source_review",
    rating: 1,
  },
];

const communities = [
  { slug: "sourcereviews", name: "Source Reviews", members: 12400 },
  { slug: "supplementreviews", name: "Supplement Reviews", members: 8900 },
  { slug: "sourcetalk", name: "Source Talk", members: 6200 },
  { slug: "ukprotein", name: "UK Protein", members: 3100 },
  { slug: "preworkout", name: "Pre-Workout", members: 2800 },
];

/* ─── Helper Components ─── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-warning" : "text-neutral-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colours: Record<string, string> = {
    bronze: "bg-amber-100 text-amber-700",
    silver: "bg-neutral-100 text-neutral-500",
    gold: "bg-yellow-100 text-yellow-700",
    platinum: "bg-cyan-100 text-cyan-700",
    diamond: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colours[tier] || colours.bronze}`}>
      {tier}
    </span>
  );
}

/* ─── Page ─── */

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <JsonLd data={generateWebsiteSchema()} />
      <JsonLd data={generateOrganizationSchema()} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_300px]">
        {/* ── Left Sidebar ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h2 className="mb-4 text-sm font-semibold text-brand-navy">
                🏆 Top Rated Sources
              </h2>
              <div className="space-y-3">
                {topSources.map((source, i) => (
                  <div
                    key={source.name}
                    className="rounded-lg border border-neutral-100 p-3 transition hover:border-accent-teal/30 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-neutral-800">
                              {source.name}
                            </span>
                            {source.verified && (
                              <svg className="h-3.5 w-3.5 text-accent-teal" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400">{source.url}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(source.rating)} />
                        <span className="text-xs font-medium text-neutral-600">
                          {source.rating}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {source.reviews} reviews
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/sources"
                className="mt-4 block text-center text-sm font-medium text-accent-teal transition hover:text-accent-teal-light"
              >
                View All Sources →
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main Feed ── */}
        <div>
          {/* Filter Bar */}
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
            <div className="flex gap-1">
              {["New", "Top", "Hot"].map((filter, i) => (
                <button
                  key={filter}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    i === 0
                      ? "bg-accent-teal text-white"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="h-5 w-px bg-neutral-200" />
            <select className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 focus:border-accent-teal focus:outline-none">
              <option>Everywhere</option>
              <option>My Communities</option>
              <option>Following</option>
            </select>
          </div>

          {/* Feed Cards */}
          <div className="space-y-3">
            {feedPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
              >
                {/* Community & time */}
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <Link
                    href={`/${post.community}`}
                    className="font-semibold text-accent-teal hover:text-accent-teal-light"
                  >
                    {post.community}
                  </Link>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-400">{post.time}</span>
                  {post.type === "source_review" && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="rounded bg-brand-navy/10 px-1.5 py-0.5 text-xs font-medium text-brand-navy">
                        Source Review
                      </span>
                    </>
                  )}
                  {post.type === "product_review" && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="rounded bg-accent-teal/10 px-1.5 py-0.5 text-xs font-medium text-accent-teal">
                        Product Review
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h3 className="mb-1 text-base font-semibold text-brand-navy hover:text-accent-teal">
                  <Link href={`/${post.community}/${post.id}`}>
                    {post.title}
                  </Link>
                </h3>

                {/* Rating (for reviews) */}
                {post.rating && (
                  <div className="mb-2 flex items-center gap-2">
                    <StarRating rating={post.rating} />
                    {post.brand && (
                      <span className="text-xs text-neutral-500">
                        {post.brand}
                      </span>
                    )}
                  </div>
                )}

                {/* Body preview */}
                <p className="mb-3 text-sm leading-relaxed text-neutral-600 line-clamp-2">
                  {post.body}
                </p>

                {/* Author & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {post.author}
                    </span>
                    <TierBadge tier={post.tier} />
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Vote buttons */}
                    <div className="flex items-center gap-1 rounded-lg bg-neutral-50 px-2 py-1">
                      <button className="text-neutral-400 transition hover:text-accent-teal">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="min-w-[2ch] text-center text-sm font-medium text-neutral-700">
                        {post.upvotes}
                      </span>
                      <button className="text-neutral-400 transition hover:text-error">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Comments */}
                    <Link
                      href={`/${post.community}/${post.id}`}
                      className="flex items-center gap-1 text-neutral-400 transition hover:text-accent-teal"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="text-sm">{post.comments}</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {/* Latest Images */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-brand-navy">
                📸 Latest Images
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-neutral-100"
                  >
                    <div className="flex h-full items-center justify-center text-xs text-neutral-300">
                      {i}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deals */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-brand-navy">
                🔥 Deals & Promos
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                  <p className="text-sm font-medium text-neutral-800">
                    20% off all protein at SupplementHQ
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Code: SPRING20 • Expires in 3 days
                  </p>
                  <button className="mt-2 rounded-md bg-success px-3 py-1 text-xs font-medium text-white transition hover:bg-success-light">
                    View Deal
                  </button>
                </div>
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                  <p className="text-sm font-medium text-neutral-800">
                    Buy 2 Get 1 Free on creatine
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    PureProtein UK • Ends Friday
                  </p>
                  <button className="mt-2 rounded-md bg-warning px-3 py-1 text-xs font-medium text-white transition hover:bg-warning-light">
                    View Deal
                  </button>
                </div>
              </div>
              <Link
                href="/deals"
                className="mt-3 block text-center text-sm font-medium text-accent-teal transition hover:text-accent-teal-light"
              >
                All Deals →
              </Link>
            </div>

            {/* Communities */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-brand-navy">
                🏘️ Communities
              </h2>
              <div className="space-y-2">
                {communities.map((community) => (
                  <Link
                    key={community.slug}
                    href={`/a/${community.slug}`}
                    className="flex items-center justify-between rounded-lg p-2 transition hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-white">
                        a/
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {community.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {community.members.toLocaleString()} members
                        </p>
                      </div>
                    </div>
                    <button className="rounded-full border border-accent-teal px-3 py-1 text-xs font-medium text-accent-teal transition hover:bg-accent-teal hover:text-white">
                      Join
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile: Bottom cards (visible on mobile only) ── */}
      <div className="mt-6 space-y-4 lg:hidden">
        {/* Top Sources (mobile) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-brand-navy">
            🏆 Top Rated Sources
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {topSources.slice(0, 3).map((source) => (
              <div
                key={source.name}
                className="min-w-[200px] shrink-0 rounded-lg border border-neutral-100 p-3"
              >
                <p className="text-sm font-medium text-neutral-800">
                  {source.name}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <StarRating rating={Math.round(source.rating)} />
                  <span className="text-xs text-neutral-500">{source.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Communities (mobile) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-brand-navy">
            🏘️ Communities
          </h2>
          <div className="flex flex-wrap gap-2">
            {communities.map((c) => (
              <Link
                key={c.slug}
                href={`/a/${c.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:border-accent-teal hover:text-accent-teal"
              >
                a/{c.slug}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
