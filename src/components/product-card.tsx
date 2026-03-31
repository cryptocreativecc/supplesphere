import Link from "next/link";
import { StarRatingDisplay } from "./star-rating";

export function ProductCard({
  name,
  slug,
  image,
  brandName,
  brandSlug,
  category,
  avgRating,
  reviewCount,
}: {
  name: string;
  slug: string;
  image?: string;
  brandName: string;
  brandSlug?: string;
  category?: string;
  avgRating: number;
  reviewCount: number;
}) {
  return (
    <Link
      href={`/supplements/${slug}`}
      className="group block rounded-xl border border-neutral-200 bg-white shadow-card transition hover:border-accent-teal/30 hover:shadow-card-hover overflow-hidden"
    >
      {/* Product image */}
      <div className="aspect-square w-full bg-neutral-100 relative">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {category && (
          <span className="absolute top-2 left-2 rounded-full bg-brand-navy/80 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {category}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-brand-navy group-hover:text-accent-teal transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="mt-0.5 text-xs text-neutral-400">{brandName}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRatingDisplay rating={avgRating} />
            <span className="text-sm font-medium text-neutral-600">
              {avgRating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-neutral-400">
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
