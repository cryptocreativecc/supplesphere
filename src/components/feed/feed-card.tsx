import Link from "next/link";
import { StarRatingDisplay } from "../star-rating";
import { UserBadge } from "../user-badge";
import { VoteButtons } from "./vote-buttons";
import { ReportButton } from "../moderation/report-button";

export interface FeedPost {
  id: string;
  post_type: "source_review" | "product_review" | "discussion" | "deal" | "image_post";
  title: string;
  body: string;
  community: string;
  communityName: string;
  author: string;
  authorTier: string;
  authorAvatar?: string;
  rating?: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  created: string;
  // Source review
  sourceName?: string;
  sourceUrl?: string;
  // Product review
  productName?: string;
  productImage?: string;
  brandName?: string;
  // Deal
  dealPrice?: string;
  dealExpires?: string;
  dealUrl?: string;
  images?: string[];
  status?: "published" | "removed" | "flagged";
  isModerator?: boolean;
}

function PostTypeBadge({ type }: { type: FeedPost["post_type"] }) {
  const config: Record<string, { label: string; classes: string }> = {
    source_review: { label: "Source Review", classes: "bg-brand-navy/10 text-brand-navy" },
    product_review: { label: "Product Review", classes: "bg-accent-teal/10 text-accent-teal" },
    discussion: { label: "Discussion", classes: "bg-neutral-100 text-neutral-600" },
    deal: { label: "Deal", classes: "bg-success/10 text-success" },
    image_post: { label: "Image", classes: "bg-purple-100 text-purple-700" },
  };
  const c = config[type] || config.discussion;
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${c.classes}`}>
      {c.label}
    </span>
  );
}

function DealCountdown({ expires }: { expires: string }) {
  const exp = new Date(expires);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return <span className="text-xs text-error font-medium">Expired</span>;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return (
    <span className="text-xs font-medium text-warning">
      {days > 0 ? `${days}d ` : ""}{hours}h left
    </span>
  );
}

export function FeedCard({ post }: { post: FeedPost }) {
  const postUrl = `/a/${post.community}/${post.id}`;
  const isFlagged = post.status === "flagged";

  return (
    <article className={`rounded-xl border bg-white p-4 shadow-card transition hover:shadow-card-hover ${isFlagged && post.isModerator ? "border-warning border-2" : "border-neutral-200"}`}>
      {/* Meta row */}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <Link
          href={`/a/${post.community}`}
          className="font-semibold text-accent-teal hover:text-accent-teal-light"
        >
          a/{post.community}
        </Link>
        <span className="text-neutral-300">•</span>
        <span className="text-neutral-400">{post.created}</span>
        <PostTypeBadge type={post.post_type} />
      </div>

      <div className="flex gap-4">
        {/* Product image thumbnail for product reviews */}
        {post.post_type === "product_review" && post.productImage && (
          <div className="hidden sm:block h-20 w-20 shrink-0 rounded-lg bg-neutral-100 overflow-hidden">
            <img src={post.productImage} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Title */}
          <h3 className="text-base font-semibold text-brand-navy hover:text-accent-teal">
            <Link href={postUrl}>{post.title}</Link>
          </h3>

          {/* Rating + context */}
          {post.rating && (
            <div className="mt-1 flex items-center gap-2">
              <StarRatingDisplay rating={post.rating} />
              {post.sourceName && (
                <span className="text-xs text-neutral-500">{post.sourceName}</span>
              )}
              {post.brandName && (
                <span className="text-xs text-neutral-500">{post.brandName}</span>
              )}
            </div>
          )}

          {/* Deal info */}
          {post.post_type === "deal" && (
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {post.sourceName && (
                <span className="text-xs text-neutral-500">{post.sourceName}</span>
              )}
              {post.dealPrice && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                  {post.dealPrice}
                </span>
              )}
              {post.dealExpires && <DealCountdown expires={post.dealExpires} />}
            </div>
          )}

          {/* Body preview */}
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 line-clamp-2">
            {post.body}
          </p>

          {/* Author & actions */}
          <div className="mt-3 flex items-center justify-between">
            <UserBadge username={post.author} tier={post.authorTier} avatar={post.authorAvatar} size="sm" />

            <div className="flex items-center gap-3">
              <VoteButtons
                targetId={post.id}
                targetType="post"
                initialUpvotes={post.upvotes}
                initialDownvotes={post.downvotes}
              />
              <Link
                href={postUrl}
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
                <span className="text-sm">{post.commentCount}</span>
              </Link>

              <ReportButton targetType="post" targetId={post.id} />

              {post.post_type === "deal" && post.dealUrl && (
                <a
                  href={post.dealUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-success px-3 py-1 text-xs font-medium text-white transition hover:bg-success-light"
                >
                  View Deal
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
