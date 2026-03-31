import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function PATCH(
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

    const comment = await pb.collection("comments").getOne(id);
    if (comment["author"] !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const updated = await pb.collection("comments").update(id, {
      body: content,
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (err) {
    console.error("Comment update error:", err);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const comment = await pb.collection("comments").getOne(id);
    if (comment["author"] !== user.id && user.id !== "admin") {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Soft delete — mark as removed
    await pb.collection("comments").update(id, {
      status: "removed",
      body: "[deleted]",
    });

    // Decrement comment count on post
    try {
      const postId = comment["post"] as string;
      const post = await pb.collection("posts").getOne(postId);
      await pb.collection("posts").update(postId, {
        comment_count: Math.max(0, (post["comment_count"] || 0) - 1),
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Comment delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
