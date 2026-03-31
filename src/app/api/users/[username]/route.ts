import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const { pb } = await getAuthenticatedPb();

    // Find user by username
    const users = await pb.collection("users").getList(1, 1, {
      filter: `username = "${username}"`,
    });

    if (users.items.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = users.items[0];

    // Get user stats
    let reviewCount = 0;
    let commentCount = 0;
    let upvotesReceived = 0;

    try {
      const posts = await pb.collection("posts").getList(1, 1, {
        filter: `author = "${user.id}" && (post_type = "source_review" || post_type = "product_review") && status = "published"`,
      });
      reviewCount = posts.totalItems;
    } catch { /* */ }

    try {
      const comments = await pb.collection("comments").getList(1, 1, {
        filter: `author = "${user.id}" && status = "published"`,
      });
      commentCount = comments.totalItems;
    } catch { /* */ }

    try {
      const posts = await pb.collection("posts").getList(1, 200, {
        filter: `author = "${user.id}" && status = "published"`,
        fields: "upvotes",
      });
      upvotesReceived = posts.items.reduce((sum, p) => sum + ((p["upvotes"] as number) || 0), 0);
    } catch { /* */ }

    return NextResponse.json({
      id: user.id,
      username: user["username"],
      avatar: user["avatar"] || "",
      bio: user["bio"] || "",
      points: user["points"] || 0,
      reputation_tier: user["reputation_tier"] || "bronze",
      review_count: reviewCount,
      is_verified_reviewer: user["is_verified_reviewer"] || false,
      profile_flair: user["profile_flair"] || "",
      created: user.created,
      stats: {
        reviews: reviewCount,
        comments: commentCount,
        upvotesReceived,
      },
    });
  } catch (err) {
    console.error("User profile error:", err);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}
