import type PocketBase from "pocketbase";

export interface AntiGamingResult {
  allowed: boolean;
  reason: string;
}

/**
 * Check if text meets minimum word count.
 */
export function checkWordCount(text: string, minimum: number): AntiGamingResult {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < minimum) {
    return {
      allowed: false,
      reason: `Content must be at least ${minimum} words (currently ${words.length})`,
    };
  }
  return { allowed: true, reason: "" };
}

/**
 * Check if user has already reviewed the same source within 7 days.
 */
export async function checkDuplicateReview(
  pb: PocketBase,
  userId: string,
  sourceId: string
): Promise<AntiGamingResult> {
  if (!sourceId) return { allowed: true, reason: "" };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().replace("T", " ");

  try {
    const records = await pb.collection("posts").getList(1, 1, {
      filter: `author = "${userId}" && source = "${sourceId}" && (post_type = "source_review" || post_type = "product_review") && created >= "${dateStr}" && status = "published"`,
    });

    if (records.items.length > 0) {
      return {
        allowed: false,
        reason: "You've already reviewed this source within the last 7 days",
      };
    }
  } catch {
    // Allow on error
  }

  return { allowed: true, reason: "" };
}

/**
 * Check if user has posted identical content within 24 hours.
 */
export async function checkDuplicateContent(
  pb: PocketBase,
  userId: string,
  body: string
): Promise<AntiGamingResult> {
  if (!body || body.trim().length < 20) return { allowed: true, reason: "" };

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const dateStr = oneDayAgo.toISOString().replace("T", " ");

  // We can't do an exact body match via PocketBase filter easily,
  // so fetch recent posts and compare
  try {
    const records = await pb.collection("posts").getList(1, 20, {
      filter: `author = "${userId}" && created >= "${dateStr}" && status = "published"`,
      sort: "-created",
    });

    const normalised = body.trim().toLowerCase();
    for (const r of records.items) {
      const existingBody = ((r["body"] as string) || "").trim().toLowerCase();
      if (existingBody === normalised) {
        return {
          allowed: false,
          reason: "You've already posted identical content within the last 24 hours",
        };
      }
    }
  } catch {
    // Allow on error
  }

  return { allowed: true, reason: "" };
}

/**
 * Check if account is old enough to post (24 hour minimum).
 */
export function checkAccountAge(userCreated: string): AntiGamingResult {
  const created = new Date(userCreated);
  const now = new Date();
  const ageMs = now.getTime() - created.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours < 24) {
    const remaining = Math.ceil(24 - ageHours);
    return {
      allowed: false,
      reason: `New accounts must wait 24 hours before posting (${remaining}h remaining)`,
    };
  }

  return { allowed: true, reason: "" };
}

/**
 * Check if user has too high a content removal rate (>30%).
 */
export async function checkContentRemovalRate(
  pb: PocketBase,
  userId: string
): Promise<AntiGamingResult> {
  try {
    const allPosts = await pb.collection("posts").getList(1, 1, {
      filter: `author = "${userId}"`,
    });

    const removedPosts = await pb.collection("posts").getList(1, 1, {
      filter: `author = "${userId}" && status = "removed"`,
    });

    const total = allPosts.totalItems;
    const removed = removedPosts.totalItems;

    if (total >= 5 && removed / total > 0.3) {
      return {
        allowed: false,
        reason: "Your account has been flagged due to high content removal rate. Please contact support.",
      };
    }
  } catch {
    // Allow on error
  }

  return { allowed: true, reason: "" };
}

/**
 * Run all applicable anti-gaming checks for post creation.
 */
export async function runPostChecks(
  pb: PocketBase,
  userId: string,
  userCreated: string,
  postType: string,
  body: string,
  sourceId?: string
): Promise<AntiGamingResult> {
  // Account age check
  const ageCheck = checkAccountAge(userCreated);
  if (!ageCheck.allowed) return ageCheck;

  // Content removal rate
  const removalCheck = await checkContentRemovalRate(pb, userId);
  if (!removalCheck.allowed) return removalCheck;

  // Word count checks
  if (postType === "source_review" || postType === "product_review") {
    const wordCheck = checkWordCount(body, 50);
    if (!wordCheck.allowed) return wordCheck;
  } else if (postType === "discussion") {
    const wordCheck = checkWordCount(body, 30);
    if (!wordCheck.allowed) return wordCheck;
  }

  // Duplicate review check
  if (sourceId && (postType === "source_review" || postType === "product_review")) {
    const dupCheck = await checkDuplicateReview(pb, userId, sourceId);
    if (!dupCheck.allowed) return dupCheck;
  }

  // Duplicate content check
  const dupContentCheck = await checkDuplicateContent(pb, userId, body);
  if (!dupContentCheck.allowed) return dupContentCheck;

  return { allowed: true, reason: "" };
}

/**
 * Run anti-gaming checks for comment creation.
 */
export async function runCommentChecks(
  pb: PocketBase,
  userId: string,
  userCreated: string,
  body: string
): Promise<AntiGamingResult> {
  // Account age check
  const ageCheck = checkAccountAge(userCreated);
  if (!ageCheck.allowed) return ageCheck;

  // Word count check for comments
  const wordCheck = checkWordCount(body, 15);
  if (!wordCheck.allowed) return wordCheck;

  // Content removal rate
  const removalCheck = await checkContentRemovalRate(pb, userId);
  if (!removalCheck.allowed) return removalCheck;

  return { allowed: true, reason: "" };
}
