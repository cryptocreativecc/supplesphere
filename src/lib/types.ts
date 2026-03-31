// ─── PocketBase Collection Types ───
// All collections include id, created, updated from PocketBase automatically.

export interface PBRecord {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

// ─── Category ───
export interface Category extends PBRecord {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

// ─── Source ───
export interface Source extends PBRecord {
  name: string;
  url: string;
  logo: string;
  verified: boolean;
  description: string;
  categories: string[]; // relation ids
  avg_rating: number;
  review_count: number;
  claimed_by: string; // relation id
  slug: string;
}

export interface SourceExpand {
  categories?: Category[];
  claimed_by?: User;
}

// ─── Brand ───
export interface Brand extends PBRecord {
  name: string;
  logo: string;
  website: string;
  verified: boolean;
  description: string;
  country_of_origin: string;
  slug: string;
}

// ─── Product ───
export interface Product extends PBRecord {
  name: string;
  brand: string; // relation id
  image: string;
  description: string;
  category: string; // relation id
  avg_rating: number;
  review_count: number;
  sources: string[]; // relation ids
  ingredients: string;
  dosage: string;
  slug: string;
}

export interface ProductExpand {
  brand?: Brand;
  category?: Category;
  sources?: Source[];
}

// ─── User ───
export interface User extends PBRecord {
  username: string;
  email: string;
  avatar: string;
  bio: string;
  points: number;
  reputation_tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  review_count: number;
  badges: string[];
  is_verified_reviewer: boolean;
  profile_flair: string;
  joined_communities: string[]; // relation ids
  bookmarks: string[]; // relation ids
  role: "user" | "moderator" | "admin" | "business";
}

// ─── Community ───
export interface Community extends PBRecord {
  slug: string;
  name: string;
  description: string;
  banner: string;
  icon: string;
  created_by: string; // relation id
  moderators: string[]; // relation ids
  member_count: number;
  rules: CommunityRule[];
  post_types: PostType[];
}

export interface CommunityRule {
  title: string;
  description: string;
}

export interface CommunityExpand {
  created_by?: User;
  moderators?: User[];
}

// ─── Post ───
export type PostType =
  | "source_review"
  | "product_review"
  | "discussion"
  | "deal"
  | "image_post";

export interface Post extends PBRecord {
  post_type: PostType;
  title: string;
  body: string;
  author: string; // relation id
  community: string; // relation id
  source: string; // relation id
  product: string; // relation id
  brand: string; // relation id
  rating: number;
  images: string[];
  url: string;
  deal_price: string;
  deal_expires: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_verified_purchase: boolean;
  is_pinned: boolean;
  status: "published" | "removed" | "flagged";
}

export interface PostExpand {
  author?: User;
  community?: Community;
  source?: Source;
  product?: Product;
  brand?: Brand;
}

// ─── Comment ───
export interface Comment extends PBRecord {
  post: string; // relation id
  parent_comment: string; // relation id
  author: string; // relation id
  body: string;
  upvotes: number;
  downvotes: number;
  status: "published" | "removed" | "flagged";
}

export interface CommentExpand {
  author?: User;
  post?: Post;
  parent_comment?: Comment;
}

// ─── Vote ───
export interface Vote extends PBRecord {
  user: string; // relation id
  target_type: "post" | "comment";
  target_id: string;
  value: 1 | -1;
}

// ─── Deal ───
export interface Deal extends PBRecord {
  source: string; // relation id
  title: string;
  description: string;
  discount_code: string;
  url: string;
  expires: string;
  is_promoted: boolean;
}

export interface DealExpand {
  source?: Source;
}

// ─── Notification ───
export interface Notification extends PBRecord {
  recipient: string; // relation id
  type:
    | "upvote"
    | "comment"
    | "reply"
    | "mention"
    | "badge"
    | "points"
    | "moderation";
  message: string;
  reference_id: string;
  is_read: boolean;
}

// ─── Report ───
export interface Report extends PBRecord {
  reporter: string; // relation id
  target_type: "post" | "comment" | "user";
  target_id: string;
  reason:
    | "spam"
    | "harassment"
    | "misinformation"
    | "counterfeit"
    | "off_topic"
    | "other";
  details: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
}

// ─── Points Ledger ───
export interface PointsLedger extends PBRecord {
  user: string; // relation id
  action:
    | "source_review"
    | "product_review"
    | "discussion"
    | "deal"
    | "comment"
    | "receive_upvote_post"
    | "receive_upvote_comment"
    | "give_upvote"
    | "first_post_daily"
    | "verified_purchase"
    | "report_accepted"
    | "content_removed"
    | "spam_confirmed";
  points: number;
  reference_type: string;
  reference_id: string;
}

// ─── Follow ───
export interface Follow extends PBRecord {
  follower: string; // relation id
  following: string; // relation id
}

// ─── Utility types for list responses ───
export interface PBListResult<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}
