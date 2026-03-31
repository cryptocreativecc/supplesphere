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

    const body = await request.json();
    const { email, oldPassword, newPassword } = body;

    if (email) {
      await pb.collection("users").requestEmailChange(email);
      return NextResponse.json({
        success: true,
        message: "Verification email sent to new address",
      });
    }

    if (oldPassword && newPassword) {
      await pb.collection("users").update(user.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      });
      return NextResponse.json({
        success: true,
        message: "Password updated",
      });
    }

    return NextResponse.json(
      { error: "No changes provided" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Account update error:", err);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}
