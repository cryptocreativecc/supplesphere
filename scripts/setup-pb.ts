/**
 * PocketBase Schema Setup Script (v0.25+ compatible)
 *
 * Creates all SuppleSphere collections with fields, relations, and API rules.
 * Run with: bun run scripts/setup-pb.ts
 *
 * PB v0.25+ uses `fields` (flat properties) instead of `schema` with `options` wrapper.
 * Relations require target collection IDs, so we:
 *   1. Create collections WITHOUT relation fields
 *   2. Fetch all collection IDs
 *   3. Update collections to add relation fields
 *
 * Requires env vars:
 *   POCKETBASE_ADMIN_EMAIL
 *   POCKETBASE_ADMIN_PASSWORD
 *   NEXT_PUBLIC_POCKETBASE_URL (optional, defaults to http://127.0.0.1:8090)
 */

import PocketBase from "pocketbase";

const PB_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

// Helper: create or update a collection by name
async function upsertCollection(data: Record<string, unknown>) {
  const name = data.name as string;
  try {
    const existing = await pb.collections.getOne(name);
    console.log(`📝 Updating collection: ${name}`);
    await pb.collections.update(existing.id, data);
  } catch {
    console.log(`➕ Creating collection: ${name}`);
    await pb.collections.create(data);
  }
}

// Helper: get collection ID by name
async function getCollectionId(name: string): Promise<string> {
  const col = await pb.collections.getOne(name);
  return col.id;
}

async function main() {
  console.log("🔐 Authenticating as admin...");
  await pb.collection("_superusers").authWithPassword(ADMIN_EMAIL!, ADMIN_PASSWORD!);
  console.log("✅ Authenticated\n");

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: Create all collections WITHOUT relation fields
  // ═══════════════════════════════════════════════════════════════
  console.log("═══ Phase 1: Creating collections (no relations) ═══\n");

  // ─── Categories ───
  await upsertCollection({
    name: "categories",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, min: 1, max: 100 },
      { name: "slug", type: "text", required: true, min: 1, max: 100 },
      { name: "icon", type: "text", max: 50 },
      { name: "description", type: "text", max: 500 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)"],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Sources (without relations) ───
  await upsertCollection({
    name: "sources",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, min: 1, max: 200 },
      { name: "url", type: "url", required: true },
      { name: "slug", type: "text", required: true, min: 1, max: 200 },
      {
        name: "logo",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      },
      { name: "verified", type: "bool" },
      { name: "description", type: "text", max: 2000 },
      { name: "avg_rating", type: "number", min: 0, max: 5 },
      { name: "review_count", type: "number", min: 0 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_sources_slug ON sources (slug)",
      "CREATE UNIQUE INDEX idx_sources_url ON sources (url)",
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Brands ───
  await upsertCollection({
    name: "brands",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, min: 1, max: 200 },
      { name: "slug", type: "text", required: true, min: 1, max: 200 },
      {
        name: "logo",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      },
      { name: "website", type: "url" },
      { name: "verified", type: "bool" },
      { name: "description", type: "text", max: 2000 },
      { name: "country_of_origin", type: "text", max: 100 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_brands_slug ON brands (slug)"],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Products (without relations) ───
  await upsertCollection({
    name: "products",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, min: 1, max: 300 },
      { name: "slug", type: "text", required: true, min: 1, max: 300 },
      {
        name: "image",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      { name: "description", type: "text", max: 5000 },
      { name: "avg_rating", type: "number", min: 0, max: 5 },
      { name: "review_count", type: "number", min: 0 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_products_slug ON products (slug)"],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Communities (without relations) ───
  await upsertCollection({
    name: "communities",
    type: "base",
    fields: [
      { name: "slug", type: "text", required: true, min: 1, max: 100 },
      { name: "name", type: "text", required: true, min: 1, max: 200 },
      { name: "description", type: "text", max: 2000 },
      {
        name: "banner",
        type: "file",
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "icon",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      { name: "member_count", type: "number", min: 0 },
      { name: "rules", type: "json" },
      {
        name: "post_types",
        type: "select",
        values: ["review", "discussion", "deal", "image"],
        maxSelect: 4,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_communities_slug ON communities (slug)",
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Posts (without relations) ───
  await upsertCollection({
    name: "posts",
    type: "base",
    fields: [
      {
        name: "post_type",
        type: "select",
        required: true,
        values: [
          "source_review",
          "product_review",
          "discussion",
          "deal",
          "image_post",
        ],
        maxSelect: 1,
      },
      { name: "title", type: "text", required: true, min: 1, max: 300 },
      { name: "body", type: "text", max: 50000 },
      { name: "rating", type: "number", min: 1, max: 5 },
      {
        name: "images",
        type: "file",
        maxSelect: 4,
        maxSize: 10485760,
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ],
      },
      { name: "url", type: "url" },
      { name: "deal_price", type: "text", max: 100 },
      { name: "deal_expires", type: "date" },
      { name: "upvotes", type: "number", min: 0 },
      { name: "downvotes", type: "number", min: 0 },
      { name: "comment_count", type: "number", min: 0 },
      { name: "is_verified_purchase", type: "bool" },
      { name: "is_pinned", type: "bool" },
      {
        name: "status",
        type: "select",
        values: ["published", "removed", "flagged"],
        maxSelect: 1,
      },
    ],
    listRule: "status = 'published'",
    viewRule: "status = 'published'",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Comments (without relations) ───
  await upsertCollection({
    name: "comments",
    type: "base",
    fields: [
      { name: "body", type: "text", required: true, min: 1, max: 10000 },
      { name: "upvotes", type: "number", min: 0 },
      { name: "downvotes", type: "number", min: 0 },
      {
        name: "status",
        type: "select",
        values: ["published", "removed", "flagged"],
        maxSelect: 1,
      },
    ],
    listRule: "status = 'published'",
    viewRule: "status = 'published'",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Votes (without relations) ───
  await upsertCollection({
    name: "votes",
    type: "base",
    fields: [
      {
        name: "target_type",
        type: "select",
        required: true,
        values: ["post", "comment"],
        maxSelect: 1,
      },
      { name: "target_id", type: "text", required: true, min: 1, max: 50 },
      { name: "value", type: "number", required: true, min: -1, max: 1 },
    ],
    listRule: null,
    viewRule: null,
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: null,
  });

  // ─── Points Ledger (without relations) ───
  await upsertCollection({
    name: "points_ledger",
    type: "base",
    fields: [
      {
        name: "action",
        type: "select",
        required: true,
        values: [
          "source_review",
          "product_review",
          "discussion",
          "deal_post",
          "comment",
          "receive_upvote_post",
          "receive_upvote_comment",
          "upvote_other",
          "first_post_daily",
          "verified_purchase",
          "report_accepted",
          "content_removed",
          "spam_confirmed",
        ],
        maxSelect: 1,
      },
      { name: "points", type: "number", required: true },
      { name: "reference_type", type: "text", max: 50 },
      { name: "reference_id", type: "text", max: 50 },
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  // ─── Reports (without relations) ───
  await upsertCollection({
    name: "reports",
    type: "base",
    fields: [
      {
        name: "target_type",
        type: "select",
        required: true,
        values: ["post", "comment", "user"],
        maxSelect: 1,
      },
      { name: "target_id", type: "text", required: true, min: 1, max: 50 },
      {
        name: "reason",
        type: "select",
        required: true,
        values: [
          "spam",
          "harassment",
          "misinformation",
          "counterfeit",
          "off_topic",
          "other",
        ],
        maxSelect: 1,
      },
      { name: "details", type: "text", max: 2000 },
      {
        name: "status",
        type: "select",
        values: ["pending", "reviewed", "dismissed", "actioned"],
        maxSelect: 1,
      },
    ],
    listRule: "@request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    createRule: "@request.auth.id != ''",
    updateRule:
      "@request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ─── Follows (without relations) ───
  await upsertCollection({
    name: "follows",
    type: "base",
    fields: [],
    listRule: null,
    viewRule: null,
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: null,
  });

  // ─── Notifications (without relations) ───
  await upsertCollection({
    name: "notifications",
    type: "base",
    fields: [
      {
        name: "type",
        type: "select",
        required: true,
        values: [
          "upvote",
          "comment",
          "reply",
          "follow",
          "mention",
          "mod_action",
          "points",
          "system",
        ],
        maxSelect: 1,
      },
      { name: "message", type: "text", required: true, max: 500 },
      { name: "reference_id", type: "text", max: 50 },
      { name: "is_read", type: "bool" },
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  // ─── Deals (without relations) ───
  await upsertCollection({
    name: "deals",
    type: "base",
    fields: [
      { name: "title", type: "text", required: true, min: 1, max: 300 },
      { name: "description", type: "text", max: 2000 },
      { name: "discount_code", type: "text", max: 50 },
      { name: "url", type: "url" },
      { name: "expires", type: "date" },
      { name: "is_promoted", type: "bool" },
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: Fetch all collection IDs
  // ═══════════════════════════════════════════════════════════════
  console.log("\n═══ Phase 2: Fetching collection IDs ═══\n");

  const ids: Record<string, string> = {};
  const collectionNames = [
    "users",
    "categories",
    "sources",
    "brands",
    "products",
    "communities",
    "posts",
    "comments",
    "votes",
    "points_ledger",
    "reports",
    "follows",
    "notifications",
    "deals",
  ];

  for (const name of collectionNames) {
    ids[name] = await getCollectionId(name);
    console.log(`  ${name}: ${ids[name]}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: Update collections with relation fields + final rules
  // ═══════════════════════════════════════════════════════════════
  console.log("\n═══ Phase 3: Adding relation fields ═══\n");

  // ─── Users (update with custom fields) ───
  // We fetch existing fields and append our custom ones
  const usersCol = await pb.collections.getOne("users");
  const systemFields = usersCol.fields.filter((f: any) => f.system);
  await upsertCollection({
    name: "users",
    type: "auth",
    fields: [
      ...systemFields,
      {
        name: "avatar",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ],
      },
      { name: "bio", type: "text", max: 500 },
      { name: "points", type: "number", min: 0 },
      {
        name: "reputation_tier",
        type: "select",
        values: ["bronze", "silver", "gold", "platinum", "diamond"],
        maxSelect: 1,
      },
      { name: "review_count", type: "number", min: 0 },
      { name: "badges", type: "json" },
      { name: "is_verified_reviewer", type: "bool" },
      { name: "profile_flair", type: "text", max: 50 },
      {
        name: "joined_communities",
        type: "relation",
        collectionId: ids.communities,
        maxSelect: 999,
      },
      {
        name: "bookmarks",
        type: "relation",
        collectionId: ids.posts,
        maxSelect: 999,
      },
      {
        name: "role",
        type: "select",
        values: ["user", "moderator", "admin", "business"],
        maxSelect: 1,
      },
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "id = @request.auth.id",
    deleteRule: "id = @request.auth.id",
  });
  console.log("✅ users updated with custom + relation fields");

  // ─── Sources (add relation fields) ───
  await upsertCollection({
    name: "sources",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, min: 1, max: 200 },
      { name: "url", type: "url", required: true },
      { name: "slug", type: "text", required: true, min: 1, max: 200 },
      {
        name: "logo",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      },
      { name: "verified", type: "bool" },
      { name: "description", type: "text", max: 2000 },
      {
        name: "categories",
        type: "relation",
        collectionId: ids.categories,
        maxSelect: 999,
      },
      { name: "avg_rating", type: "number", min: 0, max: 5 },
      { name: "review_count", type: "number", min: 0 },
      {
        name: "claimed_by",
        type: "relation",
        collectionId: ids.users,
        maxSelect: 1,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_sources_slug ON sources (slug)",
      "CREATE UNIQUE INDEX idx_sources_url ON sources (url)",
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule:
      "@request.auth.role = 'admin' || claimed_by = @request.auth.id",
    deleteRule: "@request.auth.role = 'admin'",
  });
  console.log("✅ sources updated with relation fields");

  // ─── Products (add relation fields) ───
  await upsertCollection({
    name: "products",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, min: 1, max: 300 },
      { name: "slug", type: "text", required: true, min: 1, max: 300 },
      {
        name: "brand",
        type: "relation",
        required: true,
        collectionId: ids.brands,
        maxSelect: 1,
      },
      {
        name: "image",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      { name: "description", type: "text", max: 5000 },
      {
        name: "category",
        type: "relation",
        collectionId: ids.categories,
        maxSelect: 1,
      },
      { name: "avg_rating", type: "number", min: 0, max: 5 },
      { name: "review_count", type: "number", min: 0 },
      {
        name: "sources",
        type: "relation",
        collectionId: ids.sources,
        maxSelect: 999,
      },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_products_slug ON products (slug)"],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });
  console.log("✅ products updated with relation fields");

  // ─── Communities (add relation fields) ───
  await upsertCollection({
    name: "communities",
    type: "base",
    fields: [
      { name: "slug", type: "text", required: true, min: 1, max: 100 },
      { name: "name", type: "text", required: true, min: 1, max: 200 },
      { name: "description", type: "text", max: 2000 },
      {
        name: "banner",
        type: "file",
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "icon",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "created_by",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      {
        name: "moderators",
        type: "relation",
        collectionId: ids.users,
        maxSelect: 999,
      },
      { name: "member_count", type: "number", min: 0 },
      { name: "rules", type: "json" },
      {
        name: "post_types",
        type: "select",
        values: ["review", "discussion", "deal", "image"],
        maxSelect: 4,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_communities_slug ON communities (slug)",
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule:
      "created_by = @request.auth.id || moderators.id ?= @request.auth.id",
    deleteRule: "@request.auth.role = 'admin'",
  });
  console.log("✅ communities updated with relation fields");

  // ─── Posts (add relation fields) ───
  await upsertCollection({
    name: "posts",
    type: "base",
    fields: [
      {
        name: "post_type",
        type: "select",
        required: true,
        values: [
          "source_review",
          "product_review",
          "discussion",
          "deal",
          "image_post",
        ],
        maxSelect: 1,
      },
      { name: "title", type: "text", required: true, min: 1, max: 300 },
      { name: "body", type: "text", max: 50000 },
      {
        name: "author",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      {
        name: "community",
        type: "relation",
        required: true,
        collectionId: ids.communities,
        maxSelect: 1,
      },
      {
        name: "source",
        type: "relation",
        collectionId: ids.sources,
        maxSelect: 1,
      },
      {
        name: "product",
        type: "relation",
        collectionId: ids.products,
        maxSelect: 1,
      },
      {
        name: "brand",
        type: "relation",
        collectionId: ids.brands,
        maxSelect: 1,
      },
      { name: "rating", type: "number", min: 1, max: 5 },
      {
        name: "images",
        type: "file",
        maxSelect: 4,
        maxSize: 10485760,
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ],
      },
      { name: "url", type: "url" },
      { name: "deal_price", type: "text", max: 100 },
      { name: "deal_expires", type: "date" },
      { name: "upvotes", type: "number", min: 0 },
      { name: "downvotes", type: "number", min: 0 },
      { name: "comment_count", type: "number", min: 0 },
      { name: "is_verified_purchase", type: "bool" },
      { name: "is_pinned", type: "bool" },
      {
        name: "status",
        type: "select",
        values: ["published", "removed", "flagged"],
        maxSelect: 1,
      },
    ],
    listRule: "status = 'published' || author = @request.auth.id",
    viewRule: "status = 'published' || author = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "author = @request.auth.id",
    deleteRule:
      "author = @request.auth.id || @request.auth.role = 'admin'",
  });
  console.log("✅ posts updated with relation fields");

  // ─── Comments (add relation fields) ───
  await upsertCollection({
    name: "comments",
    type: "base",
    fields: [
      {
        name: "post",
        type: "relation",
        required: true,
        collectionId: ids.posts,
        maxSelect: 1,
      },
      {
        name: "parent_comment",
        type: "relation",
        collectionId: ids.comments,
        maxSelect: 1,
      },
      {
        name: "author",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      { name: "body", type: "text", required: true, min: 1, max: 10000 },
      { name: "upvotes", type: "number", min: 0 },
      { name: "downvotes", type: "number", min: 0 },
      {
        name: "status",
        type: "select",
        values: ["published", "removed", "flagged"],
        maxSelect: 1,
      },
    ],
    listRule:
      "status = 'published' || author = @request.auth.id",
    viewRule:
      "status = 'published' || author = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "author = @request.auth.id",
    deleteRule:
      "author = @request.auth.id || @request.auth.role = 'admin'",
  });
  console.log("✅ comments updated with relation fields");

  // ─── Votes (add relation fields) ───
  await upsertCollection({
    name: "votes",
    type: "base",
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      {
        name: "target_type",
        type: "select",
        required: true,
        values: ["post", "comment"],
        maxSelect: 1,
      },
      { name: "target_id", type: "text", required: true, min: 1, max: 50 },
      { name: "value", type: "number", required: true, min: -1, max: 1 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_votes_unique ON votes (user, target_type, target_id)",
    ],
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "user = @request.auth.id",
    deleteRule: "user = @request.auth.id",
  });
  console.log("✅ votes updated with relation fields");

  // ─── Points Ledger (add relation fields) ───
  await upsertCollection({
    name: "points_ledger",
    type: "base",
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      {
        name: "action",
        type: "select",
        required: true,
        values: [
          "source_review",
          "product_review",
          "discussion",
          "deal_post",
          "comment",
          "receive_upvote_post",
          "receive_upvote_comment",
          "upvote_other",
          "first_post_daily",
          "verified_purchase",
          "report_accepted",
          "content_removed",
          "spam_confirmed",
        ],
        maxSelect: 1,
      },
      { name: "points", type: "number", required: true },
      { name: "reference_type", type: "text", max: 50 },
      { name: "reference_id", type: "text", max: 50 },
    ],
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });
  console.log("✅ points_ledger updated with relation fields");

  // ─── Reports (add relation fields) ───
  await upsertCollection({
    name: "reports",
    type: "base",
    fields: [
      {
        name: "reporter",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      {
        name: "target_type",
        type: "select",
        required: true,
        values: ["post", "comment", "user"],
        maxSelect: 1,
      },
      { name: "target_id", type: "text", required: true, min: 1, max: 50 },
      {
        name: "reason",
        type: "select",
        required: true,
        values: [
          "spam",
          "harassment",
          "misinformation",
          "counterfeit",
          "off_topic",
          "other",
        ],
        maxSelect: 1,
      },
      { name: "details", type: "text", max: 2000 },
      {
        name: "status",
        type: "select",
        values: ["pending", "reviewed", "dismissed", "actioned"],
        maxSelect: 1,
      },
    ],
    listRule:
      "reporter = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    viewRule:
      "reporter = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    createRule: "@request.auth.id != ''",
    updateRule:
      "@request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    deleteRule: "@request.auth.role = 'admin'",
  });
  console.log("✅ reports updated with relation fields");

  // ─── Follows (add relation fields) ───
  await upsertCollection({
    name: "follows",
    type: "base",
    fields: [
      {
        name: "follower",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      {
        name: "following",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_follows_unique ON follows (follower, following)",
    ],
    listRule:
      "follower = @request.auth.id || following = @request.auth.id",
    viewRule:
      "follower = @request.auth.id || following = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: "follower = @request.auth.id",
  });
  console.log("✅ follows updated with relation fields");

  // ─── Notifications (add relation fields) ───
  await upsertCollection({
    name: "notifications",
    type: "base",
    fields: [
      {
        name: "recipient",
        type: "relation",
        required: true,
        collectionId: ids.users,
        maxSelect: 1,
      },
      {
        name: "type",
        type: "select",
        required: true,
        values: [
          "upvote",
          "comment",
          "reply",
          "follow",
          "mention",
          "mod_action",
          "points",
          "system",
        ],
        maxSelect: 1,
      },
      { name: "message", type: "text", required: true, max: 500 },
      { name: "reference_id", type: "text", max: 50 },
      { name: "is_read", type: "bool" },
    ],
    listRule: "recipient = @request.auth.id",
    viewRule: "recipient = @request.auth.id",
    createRule: null,
    updateRule: "recipient = @request.auth.id",
    deleteRule: "recipient = @request.auth.id",
  });
  console.log("✅ notifications updated with relation fields");

  // ─── Deals (add relation fields) ───
  await upsertCollection({
    name: "deals",
    type: "base",
    fields: [
      {
        name: "source",
        type: "relation",
        required: true,
        collectionId: ids.sources,
        maxSelect: 1,
      },
      { name: "title", type: "text", required: true, min: 1, max: 300 },
      { name: "description", type: "text", max: 2000 },
      { name: "discount_code", type: "text", max: 50 },
      { name: "url", type: "url" },
      { name: "expires", type: "date" },
      { name: "is_promoted", type: "bool" },
      {
        name: "submitted_by",
        type: "relation",
        collectionId: ids.users,
        maxSelect: 1,
      },
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule:
      "submitted_by = @request.auth.id || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });
  console.log("✅ deals updated with relation fields");

  console.log("\n🎉 All collections created/updated successfully!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
