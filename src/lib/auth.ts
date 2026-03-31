import { cookies } from "next/headers";
import { createPb } from "./pb";
import type PocketBase from "pocketbase";

const COOKIE_NAME = "ss_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  name: string;
  points: number;
  reputation_tier: string;
  bio: string;
}

/**
 * Get the current authenticated user from cookies (server-side).
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);

  if (!authCookie?.value) return null;

  try {
    const pb = createPb();
    pb.authStore.save(authCookie.value, null);

    // Verify the token is still valid
    const record = await pb.collection("users").authRefresh();
    const user = record.record;

    return {
      id: user.id,
      username: user["username"] || "",
      email: user["email"] || "",
      avatar: user["avatar"] || "",
      name: user["name"] || "",
      points: user["points"] || 0,
      reputation_tier: user["reputation_tier"] || "bronze",
      bio: user["bio"] || "",
    };
  } catch {
    return null;
  }
}

/**
 * Login with email and password. Returns the user and sets cookie.
 */
export async function login(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  const pb = createPb();
  const authData = await pb
    .collection("users")
    .authWithPassword(email, password);

  const token = pb.authStore.token;
  const user: AuthUser = {
    id: authData.record.id,
    username: authData.record["username"] || "",
    email: authData.record["email"] || "",
    avatar: authData.record["avatar"] || "",
    name: authData.record["name"] || "",
    points: authData.record["points"] || 0,
    reputation_tier: authData.record["reputation_tier"] || "bronze",
    bio: authData.record["bio"] || "",
  };

  return { user, token };
}

/**
 * Register a new user.
 */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  const pb = createPb();

  await pb.collection("users").create({
    username,
    email,
    password,
    passwordConfirm: password,
    points: 0,
    reputation_tier: "bronze",
  });

  // Auto-login after registration
  return login(email, password);
}

/**
 * Set the auth cookie (call from API route).
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear the auth cookie (call from API route).
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get PocketBase client with auth from cookie.
 */
export async function getAuthenticatedPb(): Promise<{
  pb: PocketBase;
  user: AuthUser | null;
}> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  const pb = createPb();

  if (!authCookie?.value) return { pb, user: null };

  try {
    pb.authStore.save(authCookie.value, null);
    const record = await pb.collection("users").authRefresh();
    const u = record.record;

    return {
      pb,
      user: {
        id: u.id,
        username: u["username"] || "",
        email: u["email"] || "",
        avatar: u["avatar"] || "",
        name: u["name"] || "",
        points: u["points"] || 0,
        reputation_tier: u["reputation_tier"] || "bronze",
        bio: u["bio"] || "",
      },
    };
  } catch {
    return { pb, user: null };
  }
}
