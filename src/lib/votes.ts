import { createPb } from "./pb";
import type PocketBase from "pocketbase";

export interface VoteResult {
  userVote: 1 | -1 | null;
  upvotes: number;
  downvotes: number;
}

/**
 * Cast a vote on a post or comment.
 * value: 1 = upvote, -1 = downvote, 0 = remove vote
 */
export async function castVote(
  pb: PocketBase,
  userId: string,
  targetType: "post" | "comment",
  targetId: string,
  value: 1 | -1 | 0
): Promise<VoteResult> {
  const collection = targetType === "post" ? "posts" : "comments";

  // Check for existing vote
  let existingVote = null;
  try {
    const votes = await pb.collection("votes").getList(1, 1, {
      filter: `user = "${userId}" && target_type = "${targetType}" && target_id = "${targetId}"`,
    });
    if (votes.items.length > 0) {
      existingVote = votes.items[0];
    }
  } catch {
    // No existing vote
  }

  // Get current target record
  const target = await pb.collection(collection).getOne(targetId);
  let upvotes = target["upvotes"] || 0;
  let downvotes = target["downvotes"] || 0;

  if (existingVote) {
    const oldValue = existingVote["value"] as 1 | -1;

    if (value === 0 || value === oldValue) {
      // Remove vote (toggle off)
      await pb.collection("votes").delete(existingVote.id);
      if (oldValue === 1) upvotes = Math.max(0, upvotes - 1);
      else downvotes = Math.max(0, downvotes - 1);

      await pb.collection(collection).update(targetId, { upvotes, downvotes });
      return { userVote: null, upvotes, downvotes };
    } else {
      // Change vote direction
      await pb.collection("votes").update(existingVote.id, { value });
      if (oldValue === 1) {
        upvotes = Math.max(0, upvotes - 1);
        downvotes += 1;
      } else {
        downvotes = Math.max(0, downvotes - 1);
        upvotes += 1;
      }

      await pb.collection(collection).update(targetId, { upvotes, downvotes });
      return { userVote: value as 1 | -1, upvotes, downvotes };
    }
  } else {
    if (value === 0) {
      // Nothing to remove
      return { userVote: null, upvotes, downvotes };
    }

    // Create new vote
    await pb.collection("votes").create({
      user: userId,
      target_type: targetType,
      target_id: targetId,
      value,
    });

    if (value === 1) upvotes += 1;
    else downvotes += 1;

    await pb.collection(collection).update(targetId, { upvotes, downvotes });
    return { userVote: value, upvotes, downvotes };
  }
}

/**
 * Get a user's vote on a specific target.
 */
export async function getUserVote(
  pb: PocketBase,
  userId: string,
  targetType: "post" | "comment",
  targetId: string
): Promise<1 | -1 | null> {
  try {
    const votes = await pb.collection("votes").getList(1, 1, {
      filter: `user = "${userId}" && target_type = "${targetType}" && target_id = "${targetId}"`,
    });
    if (votes.items.length > 0) {
      return votes.items[0]["value"] as 1 | -1;
    }
  } catch {
    // No vote found
  }
  return null;
}

/**
 * Get a user's votes for multiple targets at once.
 */
export async function getUserVotes(
  pb: PocketBase,
  userId: string,
  targetType: "post" | "comment",
  targetIds: string[]
): Promise<Record<string, 1 | -1>> {
  if (targetIds.length === 0) return {};

  const filterParts = targetIds.map((id) => `target_id = "${id}"`).join(" || ");
  try {
    const votes = await pb.collection("votes").getList(1, 100, {
      filter: `user = "${userId}" && target_type = "${targetType}" && (${filterParts})`,
    });
    const result: Record<string, 1 | -1> = {};
    for (const vote of votes.items) {
      result[vote["target_id"] as string] = vote["value"] as 1 | -1;
    }
    return result;
  } catch {
    return {};
  }
}
