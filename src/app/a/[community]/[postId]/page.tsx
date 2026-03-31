import Link from "next/link";
import { Metadata } from "next";
import { StarRatingDisplay } from "@/components/star-rating";
import { UserBadge } from "@/components/user-badge";
import { VoteButtons } from "@/components/feed/vote-buttons";
import { CommentThread } from "@/components/feed/comment-thread";
import { mockFeedPosts, mockComments } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ community: string; postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = mockFeedPosts.find((p) => p.id === postId);
  const { community } = await params;
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — a/${community}`,
    description: post.body.slice(0, 160),
    openGraph: {
      title: `${post.title} — a/${community} | SuppleSphere`,
      description: post.body.slice(0, 160),
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — a/${community} | SuppleSphere`,
      description: post.body.slice(0, 160),
    },
    alternates: {
      canonical: `/a/${community}/${postId}`,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ community: string; postId: string }>;
}) {
  const { community, postId } = await params;
  const post = mockFeedPosts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href={`/a/${community}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to a/{community}
        </Link>
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-card">
          <h1 className="text-xl font-bold text-brand-navy">Post not found</h1>
          <p className="mt-2 text-neutral-400">
            This post may have been removed or doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/a/${community}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-accent-teal hover:text-accent-teal-light"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to a/{community}
      </Link>

      {/* Post */}
      <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        {/* Meta */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={`/a/${post.community}`}
            className="font-semibold text-accent-teal hover:text-accent-teal-light"
          >
            a/{post.community}
          </Link>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-400">{post.created}</span>
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            post.post_type === "source_review"
              ? "bg-brand-navy/10 text-brand-navy"
              : post.post_type === "product_review"
                ? "bg-accent-teal/10 text-accent-teal"
                : post.post_type === "deal"
                  ? "bg-success/10 text-success"
                  : "bg-neutral-100 text-neutral-600"
          }`}>
            {post.post_type.replace(/_/g, " ")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-brand-navy">{post.title}</h1>

        {/* Rating */}
        {post.rating && (
          <div className="mt-2 flex items-center gap-2">
            <StarRatingDisplay rating={post.rating} size="md" />
            <span className="text-sm font-medium text-neutral-600">
              {post.rating}/5
            </span>
          </div>
        )}

        {/* Context info */}
        {(post.sourceName || post.brandName) && (
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-neutral-500">
            {post.sourceName && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {post.sourceName}
              </span>
            )}
            {post.brandName && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {post.brandName}
              </span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="mt-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">
          {post.body}
        </div>

        {/* Deal info */}
        {post.post_type === "deal" && (
          <div className="mt-4 rounded-lg border border-success/20 bg-success/5 p-4">
            <div className="flex flex-wrap items-center gap-3">
              {post.dealPrice && (
                <span className="rounded-full bg-success px-3 py-1 text-sm font-bold text-white">
                  {post.dealPrice}
                </span>
              )}
              {post.dealUrl && (
                <a
                  href={post.dealUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition hover:bg-success-light"
                >
                  View Deal →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Author & Actions bar */}
        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
          <UserBadge
            username={post.author}
            tier={post.authorTier}
            avatar={post.authorAvatar}
            size="md"
          />

          <div className="flex items-center gap-3">
            <VoteButtons
              targetId={post.id}
              targetType="post"
              initialUpvotes={post.upvotes}
              initialDownvotes={post.downvotes}
            />
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-50 hover:text-accent-teal">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-50 hover:text-error">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Report
            </button>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">
          {post.commentCount} Comments
        </h2>
        <CommentThread comments={mockComments} />
      </div>
    </div>
  );
}
