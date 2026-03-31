import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { StarRatingDisplay } from "@/components/star-rating";
import { UserBadge } from "@/components/user-badge";
import { VoteButtons } from "@/components/feed/vote-buttons";
import { TierBadge } from "@/components/points/tier-badge";
import { PointsProgress } from "@/components/points/points-progress";
import { TierPerks } from "@/components/points/tier-perks";
import { mockFeedPosts } from "@/lib/mock-data";
import { createPb } from "@/lib/pb";

export const dynamic = "force-dynamic";

async function findUser(identifier: string) {
  const pb = createPb();
  try {
    // Try by username first
    return await pb.collection("users").getFirstListItem(`username="${identifier}"`);
  } catch {
    try {
      // Fall back to ID
      return await pb.collection("users").getOne(identifier);
    } catch {
      return null;
    }
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Profile`,
    description: `View ${username}'s reviews, posts, and activity on SuppleSphere.`,
    openGraph: {
      title: `${username}'s Profile | SuppleSphere`,
      description: `View ${username}'s reviews, posts, and activity on SuppleSphere.`,
    },
    twitter: {
      card: "summary",
      title: `${username}'s Profile | SuppleSphere`,
      description: `View ${username}'s reviews, posts, and activity on SuppleSphere.`,
    },
    alternates: {
      canonical: `/u/${username}`,
    },
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const pbUser = await findUser(decodeURIComponent(username));
  if (!pbUser) notFound();

  const user = {
    username: pbUser.username || pbUser.id,
    bio: pbUser.bio || "",
    points: pbUser.points || 0,
    reputation_tier: pbUser.reputation_tier || "bronze",
    is_verified_reviewer: pbUser.is_verified_reviewer || false,
    created: pbUser.created,
    stats: {
      reviews: pbUser.review_count || 0,
      comments: 0,
      upvotesReceived: 0,
    },
  };

  // Filter mock posts for this "user"
  const userReviews = mockFeedPosts.filter(
    (p) => p.post_type === "source_review" || p.post_type === "product_review"
  );
  const userPosts = mockFeedPosts.filter(
    (p) => p.post_type === "discussion" || p.post_type === "deal"
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-navy text-3xl font-bold text-white">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-navy">{username}</h1>
              <TierBadge tier={user.reputation_tier} size="md" />
              {user.is_verified_reviewer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-teal/10 px-2.5 py-0.5 text-xs font-medium text-accent-teal">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Reviewer
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-neutral-400">
              Member since {new Date(user.created).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>

            {user.bio && (
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {user.bio}
              </p>
            )}

            {/* Points & Progress */}
            <div className="mt-4">
              <PointsProgress points={user.points} />
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center rounded-lg bg-neutral-50 p-3">
                <p className="text-lg font-bold text-brand-navy">{user.stats.reviews}</p>
                <p className="text-xs text-neutral-400">Reviews</p>
              </div>
              <div className="text-center rounded-lg bg-neutral-50 p-3">
                <p className="text-lg font-bold text-brand-navy">{user.stats.comments}</p>
                <p className="text-xs text-neutral-400">Comments</p>
              </div>
              <div className="text-center rounded-lg bg-neutral-50 p-3">
                <p className="text-lg font-bold text-brand-navy">{user.stats.upvotesReceived}</p>
                <p className="text-xs text-neutral-400">Upvotes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Perks */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-brand-navy">Reputation Perks</h2>
        <TierPerks tier={user.reputation_tier} showNext={true} />
      </div>

      {/* Content Tabs */}
      <ProfileTabs
        username={username}
        reviews={userReviews}
        posts={userPosts}
      />
    </div>
  );
}

function ProfileTabs({
  username,
  reviews,
  posts,
}: {
  username: string;
  reviews: typeof mockFeedPosts;
  posts: typeof mockFeedPosts;
}) {
  return <ProfileTabsClient username={username} reviews={reviews} posts={posts} />;
}

// Client component for tab interaction
import { ProfileTabsClient } from "./profile-tabs-client";
