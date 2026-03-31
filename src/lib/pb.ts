import PocketBase from "pocketbase";

const POCKETBASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

/**
 * Create a new PocketBase client instance.
 * Each request should use its own instance to avoid shared state.
 */
export function createPb(): PocketBase {
  return new PocketBase(POCKETBASE_URL);
}

/**
 * Create an admin-authenticated PocketBase client.
 * Uses POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD env vars.
 * Only use server-side (API routes, server components, scripts).
 */
export async function createAdminPb(): Promise<PocketBase> {
  const pb = createPb();
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be set"
    );
  }

  await pb.collection("_superusers").authWithPassword(email, password);
  return pb;
}

export { POCKETBASE_URL };
export default PocketBase;
