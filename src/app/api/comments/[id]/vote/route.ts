import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";
import { castVote } from "@/lib/votes";
import { awardPoints } from "@/lib/points";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { pb, user } = await getAuthenticatedPb();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { value } = await request.json();

    if (![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { error: "Value must be 1, -1, or 0" },
        { status: 400 }
      );
    }

    const result = await castVote(pb, user.id, "comment", id, value);

    // Award points on upvote (not downvote, not removal)
    if (value === 1 && result.userVote === 1) {
      try {
        // Award give_upvote points to the voter
        await awardPoints(pb, user.id, "give_upvote", "vote", id);

        // Award receive_comment_upvote points to the comment author
        const comment = await pb.collection("comments").getOne(id);
        const authorId = comment["author"] as string;
        if (authorId && authorId !== user.id) {
          await awardPoints(pb, authorId, "receive_comment_upvote", "comment", id);
        }
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({
      success: true,
      commentId: id,
      ...result,
    });
  } catch (err) {
    console.error("Comment vote error:", err);
    return NextResponse.json(
      { error: "Failed to record vote" },
      { status: 500 }
    );
  }
}
