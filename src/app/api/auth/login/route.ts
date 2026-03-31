import { NextRequest, NextResponse } from "next/server";
import { login, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { user, token } = await login(email, password);
    await setAuthCookie(token);

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Invalid credentials";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
