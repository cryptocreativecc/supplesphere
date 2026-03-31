import Link from "next/link";
import { StarRatingDisplay } from "./star-rating";

export function SourceCard({
  name,
  slug,
  url,
  logo,
  verified,
  avgRating,
  reviewCount,
  description,
  compact = false,
}: {
  name: string;
  slug: string;
  url: string;
  logo?: string;
  verified: boolean;
  avgRating: number;
  reviewCount: number;
  description?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/sources/${slug}`}
      className="group block rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition hover:border-accent-teal/30 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-lg font-bold text-white">
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-brand-navy group-hover:text-accent-teal transition-colors">
              {name}
            </h3>
            {verified && (
              <svg
                className="h-4 w-4 shrink-0 text-accent-teal"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-xs text-neutral-400">{url}</p>
        </div>
      </div>

      {!compact && description && (
        <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRatingDisplay rating={avgRating} />
          <span className="text-sm font-medium text-neutral-600">
            {avgRating.toFixed(1)}
          </span>
        </div>
        <span className="text-xs text-neutral-400">
          {reviewCount} review{reviewCount !== 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
}
