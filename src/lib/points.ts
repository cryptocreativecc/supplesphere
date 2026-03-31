import type PocketBase from "pocketbase";
import { createPb } from "./pb";

// ─── Points Configuration ───

export type PointsAction =
  | "source_review"
  | "product_review"
  | "discussion"
  | "deal"
  | "comment"
  | "receive_post_upvote"
  | "receive_comment_upvote"
  | "give_upvote"
  | "first_post_of_day"
  | "verified_purchase_bonus"
  | "report_accepted"
  | "content_removed"
  | "spam_confirmed";

export interface PointsConfig {
  points: number;
  dailyCap: number | null; // null = no cap
}

export const POINTS_CONFIG: Record<PointsAction, PointsConfig> = {
  source_review: { points: 15, dailyCap: 75 },
  product_review: { points: 15, dailyCap: 75 },
  discussion: { points: 5, dailyCap: 25 },
  deal: { points: 10, dailyCap: 30 },
  comment: { points: 3, dailyCap: 30 },
  receive_post_upvote: { points: 2, dailyCap: 50 },
  receive_comment_upvote: { points: 1, dailyCap: 20 },
  give_upvote: { points: 1, dailyCap: 10 },
  first_post_of_day: { points: 5, dailyCap: 5 },
  verified_purchase_bonus: { points: 10, dailyCap: null },
  report_accepted: { points: 5, dailyCap: 15 },
  content_removed: { points: -10, dailyCap: null },
  spam_confirmed: { points: -50, dailyCap: null },
};

// ─── Tier Configuration ───

export type ReputationTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface TierInfo {
  name: ReputationTier;
  label: string;
  pointsRequired: number;
}

export const TIERS: TierInfo[] = [
  { name: "bronze", label: "Bronze", pointsRequired: 0 },
  { name: "silver", label: "Silver", pointsRequired: 250 },
  { name: "gold", label: "Gold", pointsRequired: 1000 },
  { name: "platinum", label: "Platinum", pointsRequired: 5000 },
  { name: "diamond", label: "Diamond", pointsRequired: 15000 },
];

// ─── Core Functions ───

export function calculateTier(points: number): ReputationTier {
  let tier: ReputationTier = "bronze";
  for (const t of TIERS) {
    if (points >= t.pointsRequired) {
      tier = t.name;
    }
  }
  return tier;
}

export function getTierInfo(tier: ReputationTier): TierInfo {
  return TIERS.find((t) => t.name === tier) || TIERS[0];
}

export function getNextTier(tier: ReputationTier): TierInfo | null {
  const idx = TIERS.findIndex((t) => t.name === tier);
  if (idx < 0 || idx >= TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

/**
 * Check how many points a user has used today for a given action.
 */
export async function checkDailyCap(
  pb: PocketBase,
  userId: string,
  action: PointsAction
): Promise<{ used: number; remaining: number; cap: number }> {
  const config = POINTS_CONFIG[action];
  if (!config.dailyCap) {
    return { used: 0, remaining: Infinity, cap: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().replace("T", " ");

  try {
    const records = await pb.collection("points_ledger").getList(1, 200, {
      filter: `user = "${userId}" && action = "${action}" && created >= "${todayStr}"`,
    });

    let used = 0;
    for (const r of records.items) {
      used += Math.abs(r["points"] as number);
    }

    return {
      used,
      remaining: Math.max(0, config.dailyCap - used),
      cap: config.dailyCap,
    };
  } catch {
    return { used: 0, remaining: config.dailyCap, cap: config.dailyCap };
  }
}

export interface AwardResult {
  awarded: boolean;
  points: number;
  reason: string;
}

/**
 * Award points to a user for an action.
 * Checks daily caps and creates a ledger record.
 */
export async function awardPoints(
  pb: PocketBase,
  userId: string,
  action: PointsAction,
  referenceType: string,
  referenceId: string
): Promise<AwardResult> {
  const config = POINTS_CONFIG[action];

  // Check daily cap
  if (config.dailyCap !== null) {
    const { remaining } = await checkDailyCap(pb, userId, action);
    if (remaining <= 0) {
      return {
        awarded: false,
        points: 0,
        reason: `Daily cap reached for ${action}`,
      };
    }
  }

  try {
    // Create ledger entry
    await pb.collection("points_ledger").create({
      user: userId,
      action,
      points: config.points,
      reference_type: referenceType,
      reference_id: referenceId,
    });

    // Update user's total points
    const user = await pb.collection("users").getOne(userId);
    const currentPoints = (user["points"] as number) || 0;
    const newPoints = Math.max(0, currentPoints + config.points);

    await pb.collection("users").update(userId, {
      points: newPoints,
    });

    // Check and update tier
    await updateUserTier(pb, userId, newPoints);

    return {
      awarded: true,
      points: config.points,
      reason: `Awarded ${config.points} points for ${action}`,
    };
  } catch (err) {
    console.error("Award points error:", err);
    return {
      awarded: false,
      points: 0,
      reason: "Failed to award points",
    };
  }
}

/**
 * Recalculate and update a user's reputation tier.
 * Returns true if the tier changed (tier up!).
 */
export async function updateUserTier(
  pb: PocketBase,
  userId: string,
  points?: number
): Promise<boolean> {
  try {
    let userPoints = points;
    if (userPoints === undefined) {
      const user = await pb.collection("users").getOne(userId);
      userPoints = (user["points"] as number) || 0;
    }

    const user = await pb.collection("users").getOne(userId);
    const currentTier = (user["reputation_tier"] as ReputationTier) || "bronze";
    const newTier = calculateTier(userPoints);

    if (newTier !== currentTier) {
      await pb.collection("users").update(userId, {
        reputation_tier: newTier,
      });

      // Create notification for tier up (only if going up)
      const currentIdx = TIERS.findIndex((t) => t.name === currentTier);
      const newIdx = TIERS.findIndex((t) => t.name === newTier);

      if (newIdx > currentIdx) {
        try {
          await pb.collection("notifications").create({
            recipient: userId,
            type: "badge",
            message: `Congratulations! You've reached ${TIERS[newIdx].label} tier! 🎉`,
            reference_id: "",
            is_read: false,
          });
        } catch {
          // Non-critical
        }
      }

      return true;
    }

    return false;
  } catch (err) {
    console.error("Update tier error:", err);
    return false;
  }
}

/**
 * Check if a user has already posted today (for first_post_of_day bonus).
 */
export async function hasPostedToday(
  pb: PocketBase,
  userId: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().replace("T", " ");

  try {
    const records = await pb.collection("points_ledger").getList(1, 1, {
      filter: `user = "${userId}" && action = "first_post_of_day" && created >= "${todayStr}"`,
    });
    return records.items.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get paginated points history for a user.
 */
export async function getPointsHistory(
  pb: PocketBase,
  userId: string,
  page: number = 1,
  limit: number = 20,
  filter?: "earned" | "spent" | "all"
) {
  const filters: string[] = [`user = "${userId}"`];

  if (filter === "earned") {
    filters.push("points > 0");
  } else if (filter === "spent") {
    filters.push("points < 0");
  }

  try {
    const result = await pb.collection("points_ledger").getList(page, limit, {
      filter: filters.join(" && "),
      sort: "-created",
    });

    return result;
  } catch {
    return {
      page,
      perPage: limit,
      totalItems: 0,
      totalPages: 0,
      items: [],
    };
  }
}

/**
 * Get all daily cap statuses for a user.
 */
export async function getAllDailyCaps(
  pb: PocketBase,
  userId: string
): Promise<Record<string, { used: number; remaining: number; cap: number }>> {
  const cappedActions: PointsAction[] = [
    "source_review",
    "product_review",
    "discussion",
    "deal",
    "comment",
    "receive_post_upvote",
    "receive_comment_upvote",
    "give_upvote",
    "first_post_of_day",
    "report_accepted",
  ];

  const result: Record<string, { used: number; remaining: number; cap: number }> = {};

  // Batch query: get all today's ledger entries at once
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().replace("T", " ");

  try {
    const records = await pb.collection("points_ledger").getList(1, 500, {
      filter: `user = "${userId}" && created >= "${todayStr}"`,
    });

    // Group by action
    const usedByAction: Record<string, number> = {};
    for (const r of records.items) {
      const action = r["action"] as string;
      usedByAction[action] = (usedByAction[action] || 0) + Math.abs(r["points"] as number);
    }

    for (const action of cappedActions) {
      const config = POINTS_CONFIG[action];
      const cap = config.dailyCap || 0;
      const used = usedByAction[action] || 0;
      result[action] = {
        used,
        remaining: Math.max(0, cap - used),
        cap,
      };
    }
  } catch {
    for (const action of cappedActions) {
      const config = POINTS_CONFIG[action];
      result[action] = {
        used: 0,
        remaining: config.dailyCap || 0,
        cap: config.dailyCap || 0,
      };
    }
  }

  return result;
}
