import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPb } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const { pb, user } = await getAuthenticatedPb();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const updateData = new FormData();

      const username = formData.get("username");
      const bio = formData.get("bio");
      const avatar = formData.get("avatar");

      if (username) updateData.append("username", username as string);
      if (bio !== null) updateData.append("bio", bio as string);
      if (avatar instanceof File) updateData.append("avatar", avatar);

      await pb.collection("users").update(user.id, updateData);
    } else {
      const body = await request.json();
      const updateData: Record<string, unknown> = {};

      if (body.username) updateData.username = body.username;
      if (body.bio !== undefined) updateData.bio = body.bio;

      await pb.collection("users").update(user.id, updateData);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
