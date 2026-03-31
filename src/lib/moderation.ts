import type PocketBase from "pocketbase";
import type { Report } from "./types";
import { awardPoints } from "./points";

// ─── Word filter blocklist ───
const DEFAULT_BLOCKLIST = [
  "scam",
  "fake",
  "counterfeit",
  "poison",
  "kill",
  "die",
];

export type ReportReason =
  | "spam"
  | "harassment"
  | "misinformation"
  | "off_topic"
  | "other";

export type ModAction =
  | "dismiss"
  | "warn"
  | "remove"
  | "escalate"
  | "mute"
  | "ban"
  | "unban"
  | "unmute";

/**
 * Submit a content report.
 */
export async function submitReport(
  pb: PocketBase,
  reporterId: string,
  targetType: "post" | "comment" | "user",
  targetId: string,
  reason: ReportReason,
  details: string
): Promise<Report> {
  const report = await pb.collection("reports").create({
    reporter: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
    status: "pending",
  });

  // Check if target now has 3+ reports → auto-flag
  try {
    const reportCount = await pb.collection("reports").getList(1, 1, {
      filter: `target_type = "${targetType}" && target_id = "${targetId}" && status != "dismissed"`,
    });
    if (reportCount.totalItems >= 3 && targetType !== "user") {
      await pb.collection(targetType === "post" ? "posts" : "comments").update(targetId, {
        status: "flagged",
      });
    }
  } catch {
    // non-critical
  }

  return report as unknown as Report;
}

/**
 * Get the moderation queue for a community.
 */
export async function getModQueue(
  pb: PocketBase,
  communityId: string,
  status?: string
): Promise<{ reports: Report[]; total: number }> {
  // Get all posts in this community
  const statusFilter = status ? `&& status = "${status}"` : "";

  try {
    // Get reports for posts in this community
    const posts = await pb.collection("posts").getList(1, 500, {
      filter: `community = "${communityId}" && (status = "flagged" || status = "published")`,
      fields: "id",
    });

    const postIds = posts.items.map((p) => p.id);
    if (postIds.length === 0) {
      return { reports: [], total: 0 };
    }

    const postFilter = postIds
      .map((id) => `target_id = "${id}"`)
      .join(" || ");

    const reports = await pb.collection("reports").getList(1, 50, {
      filter: `(${postFilter}) ${statusFilter}`,
      sort: "-created",
      expand: "reporter",
    });

    return {
      reports: reports.items as unknown as Report[],
      total: reports.totalItems,
    };
  } catch {
    return { reports: [], total: 0 };
  }
}

/**
 * Resolve a report with an action.
 */
export async function resolveReport(
  pb: PocketBase,
  reportId: string,
  action: ModAction,
  moderatorId: string,
  communityId?: string
): Promise<void> {
  const report = await pb.collection("reports").getOne(reportId);
  const targetType = report["target_type"] as string;
  const targetId = report["target_id"] as string;

  switch (action) {
    case "dismiss":
      await pb.collection("reports").update(reportId, { status: "dismissed" });
      break;

    case "warn":
      await pb.collection("reports").update(reportId, { status: "reviewed" });
      // Create notification for the content author
      if (targetType === "post" || targetType === "comment") {
        const content = await pb
          .collection(targetType === "post" ? "posts" : "comments")
          .getOne(targetId);
        const authorId = content["author"] as string;
        await pb.collection("notifications").create({
          recipient: authorId,
          type: "moderation",
          message:
            "Your content has been flagged by a moderator. Please review community guidelines.",
          reference_id: targetId,
          is_read: false,
        });
      }
      break;

    case "remove":
      await removeContent(pb, targetType, targetId, moderatorId, "Removed by moderator");
      await pb.collection("reports").update(reportId, { status: "actioned" });
      // Award reporter points
      const reporterId = report["reporter"] as string;
      await awardPoints(pb, reporterId, "report_accepted", "report", reportId);
      break;

    case "escalate":
      await pb.collection("reports").update(reportId, {
        status: "pending",
        reason: report["reason"],
        details: `[ESCALATED] ${report["details"] || ""}`,
      });
      break;
  }

  // Log the mod action
  await logModAction(pb, moderatorId, action, targetType, targetId, communityId);
}

/**
 * Remove content and deduct author points.
 */
export async function removeContent(
  pb: PocketBase,
  targetType: string,
  targetId: string,
  moderatorId: string,
  reason: string
): Promise<void> {
  const collection = targetType === "post" ? "posts" : "comments";

  const content = await pb.collection(collection).getOne(targetId);
  const authorId = content["author"] as string;

  // Set status to removed
  await pb.collection(collection).update(targetId, { status: "removed" });

  // Deduct author points
  await awardPoints(pb, authorId, "content_removed", targetType, targetId);

  // Notify author
  await pb.collection("notifications").create({
    recipient: authorId,
    type: "moderation",
    message: `Your ${targetType} has been removed. Reason: ${reason}`,
    reference_id: targetId,
    is_read: false,
  });
}

/**
 * Mute a user in a community for a duration.
 */
export async function muteUser(
  pb: PocketBase,
  userId: string,
  communityId: string,
  durationHours: number,
  moderatorId: string
): Promise<void> {
  const muteUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);

  await pb.collection("community_mutes").create({
    user: userId,
    community: communityId,
    muted_until: muteUntil.toISOString(),
    muted_by: moderatorId,
  });

  await pb.collection("notifications").create({
    recipient: userId,
    type: "moderation",
    message: `You have been muted in this community for ${durationHours} hours.`,
    reference_id: communityId,
    is_read: false,
  });

  await logModAction(pb, moderatorId, "mute", "user", userId, communityId);
}

/**
 * Ban a user from a community permanently.
 */
export async function banUser(
  pb: PocketBase,
  userId: string,
  communityId: string,
  moderatorId: string
): Promise<void> {
  await pb.collection("community_bans").create({
    user: userId,
    community: communityId,
    banned_by: moderatorId,
  });

  await pb.collection("notifications").create({
    recipient: userId,
    type: "moderation",
    message: "You have been permanently banned from this community.",
    reference_id: communityId,
    is_read: false,
  });

  await logModAction(pb, moderatorId, "ban", "user", userId, communityId);
}

/**
 * Log a moderation action for audit trail.
 */
export async function logModAction(
  pb: PocketBase,
  moderatorId: string,
  action: string,
  targetType: string,
  targetId: string,
  communityId?: string
): Promise<void> {
  try {
    await pb.collection("mod_log").create({
      moderator: moderatorId,
      action,
      target_type: targetType,
      target_id: targetId,
      community: communityId || "",
    });
  } catch {
    console.error("Failed to log mod action");
  }
}

/**
 * Check content against the word filter blocklist.
 * Returns true if content contains blocked words.
 */
export function checkWordFilter(
  content: string,
  customBlocklist?: string[]
): { flagged: boolean; matches: string[] } {
  const blocklist = customBlocklist || DEFAULT_BLOCKLIST;
  const lower = content.toLowerCase();
  const matches = blocklist.filter((word) => lower.includes(word.toLowerCase()));
  return { flagged: matches.length > 0, matches };
}

/**
 * Check if a user is muted in a community.
 */
export async function isUserMuted(
  pb: PocketBase,
  userId: string,
  communityId: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const mutes = await pb.collection("community_mutes").getList(1, 1, {
      filter: `user = "${userId}" && community = "${communityId}" && muted_until > "${now}"`,
    });
    return mutes.totalItems > 0;
  } catch {
    return false;
  }
}

/**
 * Check if a user is banned from a community.
 */
export async function isUserBanned(
  pb: PocketBase,
  userId: string,
  communityId: string
): Promise<boolean> {
  try {
    const bans = await pb.collection("community_bans").getList(1, 1, {
      filter: `user = "${userId}" && community = "${communityId}"`,
    });
    return bans.totalItems > 0;
  } catch {
    return false;
  }
}
