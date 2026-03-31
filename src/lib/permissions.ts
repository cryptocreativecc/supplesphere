import type { ReputationTier } from "./points";

export interface UserForPermissions {
  id: string;
  reputation_tier: string;
  points: number;
  is_verified_reviewer?: boolean;
  role?: string;
}

const TIER_RANK: Record<string, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  diamond: 4,
};

function tierRank(tier: string): number {
  return TIER_RANK[tier] ?? 0;
}

function isAtLeast(user: UserForPermissions, minTier: ReputationTier): boolean {
  // Admins bypass tier checks
  if (user.role === "admin") return true;
  return tierRank(user.reputation_tier) >= tierRank(minTier);
}

/** Silver+ required */
export function canSubmitDeal(user: UserForPermissions): boolean {
  return isAtLeast(user, "silver");
}

/** Gold+ required */
export function canReportContent(user: UserForPermissions): boolean {
  return isAtLeast(user, "gold");
}

/** Platinum+ required */
export function canCreateCommunity(user: UserForPermissions): boolean {
  return isAtLeast(user, "platinum");
}

/** Gold+ required */
export function canSetFlair(user: UserForPermissions): boolean {
  return isAtLeast(user, "gold");
}

/** Platinum+ required */
export function canSetBanner(user: UserForPermissions): boolean {
  return isAtLeast(user, "platinum");
}

/** Diamond only */
export function hasVerifiedReviewerBadge(user: UserForPermissions): boolean {
  return isAtLeast(user, "diamond");
}

/**
 * Get a human-readable tier requirement label for locked features.
 */
export function getTierRequirement(feature: string): { tier: ReputationTier; label: string } | null {
  const requirements: Record<string, { tier: ReputationTier; label: string }> = {
    deal: { tier: "silver", label: "Silver" },
    report: { tier: "gold", label: "Gold" },
    flair: { tier: "gold", label: "Gold" },
    community: { tier: "platinum", label: "Platinum" },
    banner: { tier: "platinum", label: "Platinum" },
    verified_badge: { tier: "diamond", label: "Diamond" },
  };
  return requirements[feature] || null;
}

/**
 * Get all features unlocked by a given tier.
 */
export function getTierPerks(tier: string): string[] {
  const rank = tierRank(tier);
  const perks: string[] = [];

  // Bronze (rank 0)
  perks.push("Basic profile", "Post and comment", "Vote on content");

  // Silver (rank 1+)
  if (rank >= 1) {
    perks.push("Custom avatar border", "Submit deals");
  }

  // Gold (rank 2+)
  if (rank >= 2) {
    perks.push("Profile flair text", "Report content", "Early access to features");
  }

  // Platinum (rank 3+)
  if (rank >= 3) {
    perks.push("Create communities", "Custom profile banner", "Moderator nomination eligibility");
  }

  // Diamond (rank 4)
  if (rank >= 4) {
    perks.push("Verified reviewer badge", "Priority support", "Beta feature access");
  }

  return perks;
}

/**
 * Get perks that are locked for a given tier (next tier's perks).
 */
export function getNextTierPerks(tier: string): { tier: string; perks: string[] } | null {
  const rank = tierRank(tier);
  const nextTiers: { rank: number; name: string; perks: string[] }[] = [
    { rank: 1, name: "Silver", perks: ["Custom avatar border", "Submit deals"] },
    { rank: 2, name: "Gold", perks: ["Profile flair text", "Report content", "Early access to features"] },
    { rank: 3, name: "Platinum", perks: ["Create communities", "Custom profile banner", "Moderator nomination"] },
    { rank: 4, name: "Diamond", perks: ["Verified reviewer badge", "Priority support", "Beta features"] },
  ];

  const next = nextTiers.find((t) => t.rank === rank + 1);
  if (!next) return null;
  return { tier: next.name, perks: next.perks };
}
