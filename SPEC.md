# SuppleSphere — Technical Specification

**Community Supplement Review Platform**
Version 1.0 | March 2026
Prepared for Austin McCormick — AMGA Design

---

## 1. Executive Summary

SuppleSphere is a community-driven supplement review and discussion platform built on Next.js and PocketBase. It enables users to review supplement sources (online retailers and sellers), individual supplement products, share deals, and engage in topic-based communities. The platform rewards active participation through a points and reputation system that unlocks profile upgrades and community creation privileges.

The platform targets the supplement enthusiast market, providing a trusted, community-moderated space where buyers can make informed purchasing decisions based on authentic peer reviews, verified source ratings, and active discussion threads.

### 1.1 Core Value Proposition

- Transparent, community-driven reviews of supplement sources and products
- Structured taxonomy: Sources (sellers/retailers), Brands (manufacturers), Products (individual supplements)
- Reddit-style community spaces with focused topics (a/sourcereviews, a/supplementreviews, a/sourcetalk)
- Gamified engagement through points, reputation tiers, and profile upgrades
- Deals and promotions section combining community submissions and verified business listings
- Revenue model combining promoted listings, affiliate partnerships, and advertising placements

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 16 (App Router) | Server-side rendering for SEO, React Server Components for performance |
| Runtime | Bun | Fast package management, native TypeScript execution |
| Styling | Tailwind CSS 4 | @theme directives, utility-first responsive design |
| Backend / DB | PocketBase (latest) | Embedded SQLite, built-in auth, real-time subscriptions, file storage |
| Search | Meilisearch | Typo-tolerant full-text search with faceting across all content types |
| Deployment | VPS (e.g. Hetzner / DigitalOcean) | PocketBase + Meilisearch co-located, Next.js via Node/Bun server |
| CDN / Media | Cloudflare (CDN + R2) | Edge caching, image optimisation, DDoS protection |

---

## 2. Information Architecture

The platform is organised around three primary content taxonomies, community spaces, and a user engagement layer.

### 2.1 Content Taxonomy

#### 2.1.1 Sources

A Source is a website or online retailer that sells supplements. Sources are the top-level entity that users review for trustworthiness, delivery, pricing, and customer service.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Business/website name |
| url | url | Website URL (validated, unique) |
| logo | file | Business logo (uploaded or scraped) |
| verified | boolean | Admin-verified legitimate business |
| description | text | Brief description of the source |
| categories | relation[] | Supplement categories they sell |
| avg_rating | float | Pre-computed average review score (1–5) |
| review_count | int | Total number of reviews |
| claimed_by | relation | Business user who has claimed this source |

#### 2.1.2 Brands

A Brand is a supplement manufacturer or product line. Brands can be associated with multiple Sources that stock their products.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Brand name |
| logo | file | Brand logo |
| website | url | Official brand website |
| verified | boolean | Admin-verified brand |
| description | text | Brand overview |
| country_of_origin | string | Manufacturing country |

#### 2.1.3 Products

A Product is an individual supplement item linked to a Brand and available from one or more Sources.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Product name |
| brand | relation | Link to Brand |
| image | file | Product image |
| description | text | Product description, ingredients, dosage |
| category | relation | Supplement category (e.g. protein, creatine, vitamins) |
| avg_rating | float | Pre-computed average product review score |
| review_count | int | Total product reviews |
| sources | relation[] | Sources that sell this product |

### 2.2 Community Spaces

Communities follow a Reddit-inspired model with the prefix `a/` (standing for "arena"). Three default community types are provided at launch, with user-created communities unlocked via the points system.

#### 2.2.1 Default Communities

| Community | Purpose | Post Types |
|-----------|---------|------------|
| a/sourcereviews | Reviews of supplement sellers and websites | Source review posts with star ratings, verified purchase tags |
| a/supplementreviews | Reviews of individual supplement products | Product review posts with brand, source, images, star ratings |
| a/sourcetalk | General discussion about supplements, sources, and the industry | Discussion threads, questions, tips, news |

#### 2.2.2 User-Created Communities

Users who reach the required points threshold (Platinum tier — 5,000 points) can create custom communities. Examples: a/ukprotein, a/preworkout, a/veganstacks.

| Field | Type | Description |
|-------|------|-------------|
| slug | string | Unique community identifier (a/slug format) |
| name | string | Display name |
| description | text | Community purpose and rules |
| banner | file | Community banner image |
| icon | file | Community avatar/icon |
| created_by | relation | Founding user |
| moderators | relation[] | Users with moderation privileges |
| member_count | int | Pre-computed member count |
| rules | json | Community-specific rules |
| post_types | select[] | Allowed post types: review, discussion, deal, image |

---

## 3. Database Schema (PocketBase Collections)

PocketBase collections map directly to database tables. PocketBase automatically provides `id`, `created`, and `updated` fields for every record.

### 3.1 Users (extends PocketBase auth collection)

| Field | Type | Notes |
|-------|------|-------|
| username | string | Unique display name |
| avatar | file | Profile picture |
| bio | text | Short biography |
| points | int | Total accumulated points (default 0) |
| reputation_tier | select | bronze / silver / gold / platinum / diamond |
| review_count | int | Total reviews posted |
| badges | json | Array of earned badge IDs |
| is_verified_reviewer | boolean | Earned through consistent quality reviews |
| profile_flair | string | Custom flair text (unlocked at gold tier) |
| joined_communities | relation[] | Communities the user has joined |
| bookmarks | relation[] | Saved/bookmarked post IDs |
| role | select | user / moderator / admin / business |

### 3.2 Posts

A unified posts collection handles all content types. The `post_type` field determines rendering and validation rules.

| Field | Type | Notes |
|-------|------|-------|
| post_type | select | source_review / product_review / discussion / deal / image_post |
| title | string | Post title |
| body | text | Post content (markdown supported) |
| author | relation | Link to user |
| community | relation | Link to community (a/slug) |
| source | relation | Link to Source (for source_review and deal types) |
| product | relation | Link to Product (for product_review type) |
| brand | relation | Link to Brand (for product_review type) |
| rating | int | Star rating 1–5 (for review types only) |
| images | file[] | Attached images (max 4) |
| url | url | External URL (for deal posts) |
| deal_price | string | Deal price or discount info |
| deal_expires | date | Deal expiry date |
| upvotes | int | Pre-computed upvote count |
| downvotes | int | Pre-computed downvote count |
| comment_count | int | Pre-computed comment count |
| is_verified_purchase | boolean | User has verified they purchased from this source |
| is_pinned | boolean | Pinned by community moderator |
| status | select | published / removed / flagged |

### 3.3 Comments

| Field | Type | Notes |
|-------|------|-------|
| post | relation | Parent post |
| parent_comment | relation | Parent comment (for nested replies, max 3 levels) |
| author | relation | Link to user |
| body | text | Comment content |
| upvotes | int | Pre-computed upvote count |
| downvotes | int | Pre-computed downvote count |
| status | select | published / removed / flagged |

### 3.4 Votes

Separate collection to track individual votes, preventing duplicates and enabling vote toggling.

| Field | Type | Notes |
|-------|------|-------|
| user | relation | Voting user |
| target_type | select | post / comment |
| target_id | string | ID of the post or comment |
| value | int | +1 (upvote) or -1 (downvote) |

> **Unique index** on `(user, target_type, target_id)` prevents double voting.

### 3.5 Points Ledger

| Field | Type | Notes |
|-------|------|-------|
| user | relation | User earning points |
| action | select | See points system section for full list |
| points | int | Points awarded (can be negative for penalties) |
| reference_type | string | post / comment / vote / report |
| reference_id | string | ID of the related record |

### 3.6 Additional Collections

- **categories** — Supplement categories (protein, creatine, vitamins, pre-workout, etc.) with `name`, `slug`, `icon`, and `description` fields
- **reports** — User-submitted reports for content moderation with `reporter`, `target_type`, `target_id`, `reason` (select), and `details` (text)
- **follows** — User-to-user follow relationships with `follower` and `following` relation fields
- **notifications** — User notifications with `recipient`, `type` (select), `message`, `reference_id`, and `is_read` (boolean)
- **deals** — Promoted deals from verified businesses with `source`, `title`, `description`, `discount_code`, `url`, `expires`, and `is_promoted` (boolean)

---

## 4. Points & Reputation System

The points system rewards quality engagement over volume. Points are earned through actions that benefit the community, with multipliers for content that receives positive reception.

### 4.1 Points Actions

| Action | Points | Daily Cap | Notes |
|--------|--------|-----------|-------|
| Post a source review | +15 | 75 (5 reviews) | Must include rating and min 50 words |
| Post a product review | +15 | 75 (5 reviews) | Must include rating, brand, and min 50 words |
| Post a discussion thread | +5 | 25 (5 posts) | Min 30 words |
| Post a deal | +10 | 30 (3 deals) | Must include valid URL and price info |
| Comment on a post | +3 | 30 (10 comments) | Min 15 words |
| Receive an upvote on a post | +2 | 50 | Quality signal — rewards popular content |
| Receive an upvote on a comment | +1 | 20 | Quality signal |
| Upvote someone else's content | +1 | 10 | Rewards active curation |
| First post of the day | +5 | 5 (once) | Daily login engagement bonus |
| Verified purchase review | +10 | Bonus | On top of review points |
| Report accepted (valid moderation report) | +5 | 15 | Rewards community policing |
| Content removed (spam/low quality) | −10 | No cap | Penalty for removed content |
| Spam/abuse flag confirmed | −50 | No cap | Serious penalty |

### 4.2 Reputation Tiers

| Tier | Points Required | Unlocks |
|------|----------------|---------|
| Bronze | 0 | Basic profile, can post and comment |
| Silver | 250 | Custom avatar border, can submit deals |
| Gold | 1,000 | Profile flair text, early access to new features, can report content |
| Platinum | 5,000 | Create communities, custom profile banner, nomination for moderator |
| Diamond | 15,000 | Verified reviewer badge, priority support, beta feature access |

### 4.3 Anti-Gaming Measures

> Daily caps prevent spam-for-points. Reviews under minimum word counts are rejected. Multiple reviews of the same source within 7 days earn no points. Accounts with >30% removed content are flagged for review. Upvote rings (mutual upvoting patterns) are detected and points reversed.

### 4.4 Profile Upgrades by Tier

- **Bronze:** Default avatar, username, bio, review history visible on public profile
- **Silver:** Custom avatar border colour, deal submission privileges, follower/following visible
- **Gold:** Profile flair (custom text badge), bookmarking, early access to platform features
- **Platinum:** Create custom communities (a/ spaces), custom profile banner image, moderator nomination eligibility
- **Diamond:** Verified reviewer badge displayed on all posts, priority customer support, beta feature testing

---

## 5. Page Architecture & Routing

The Next.js App Router handles all routing. Pages are server-rendered by default for SEO, with client components used selectively for interactive elements (voting, real-time feed updates, search).

### 5.1 Route Map

| Route | Page | Rendering | Description |
|-------|------|-----------|-------------|
| `/` | Homepage | SSR + streaming | Feed, top sources sidebar, latest images, deals |
| `/login` | Auth | SSR | Login / register with email or OAuth |
| `/sources` | Source directory | SSR | Browse and search all sources |
| `/sources/[slug]` | Source profile | SSR | Source details, reviews, rating breakdown |
| `/supplements` | Product directory | SSR | Browse and search all products by category |
| `/supplements/[slug]` | Product profile | SSR | Product details, reviews, where to buy |
| `/brands/[slug]` | Brand profile | SSR | Brand overview, their products, reviews |
| `/a/[community]` | Community feed | SSR + streaming | Community page with filtered feed |
| `/a/[community]/[postId]` | Post detail | SSR | Full post with comments thread |
| `/a/[community]/submit` | Create post | CSR | Post creation form (type-dependent) |
| `/u/[username]` | User profile | SSR | Public profile, review history, reputation |
| `/deals` | Deals hub | SSR | All active deals, filterable by category |
| `/search` | Search results | SSR | Meilisearch-powered results across all content |
| `/settings` | User settings | CSR | Account, notifications, privacy preferences |
| `/mod/[community]` | Moderation panel | CSR | Content queue, reports, user management |
| `/admin` | Admin dashboard | CSR | Platform-wide moderation, analytics, source verification |

### 5.2 Homepage Layout

The homepage uses a three-column layout on desktop, collapsing to single column on mobile with tab navigation for sidebar content.

#### 5.2.1 Header (Fixed)

- **Left:** SuppleSphere logo (links to homepage)
- **Centre:** Global search bar (Meilisearch-powered, searches sources, products, posts, communities)
- **Right:** Three navigation items — Sources (link to /sources), Supplements (link to /supplements), Login/Avatar (auth state dependent)

#### 5.2.2 Left Sidebar

**Top Rated Sources:** Displays the top 5 sources by average rating. Each card shows the source logo, verified badge (if applicable), URL, review score (stars + numeric), and two action buttons: "View Source" and "Review Source".

#### 5.2.3 Main Feed (Centre)

**Filter Bar:** Two filter dropdowns sit above the feed. The first filter controls sort order: New (most recent), Top (highest voted), and Hot (trending algorithm based on recency + votes). The second filter controls location scope: Everywhere (all content), My Communities (only joined communities), and Following (only from followed users).

**Feed Cards:** Each feed card displays the community tag (e.g. a/sourcereviews), the URL being reviewed (for review posts), the post title, a truncated body preview, the author avatar and username with their reputation stars, and an action bar with upvote/downvote buttons with counts, and a comments button with count. Product review cards additionally show the brand name and a product image thumbnail to the left of the text.

#### 5.2.4 Right Sidebar

- **Latest Images:** Grid of the most recent community-posted images (4–6 thumbnails) linking to their parent posts
- **Promos & Deals:** Carousel of active deals showing the source name, offer summary, and a "View Deal" button. Verified business deals are badged
- **Advertising Space:** Designated ad placement area for sponsored content
- **Communities:** List of popular and recently active communities with member counts and join buttons

---

## 6. Search Architecture (Meilisearch)

Meilisearch runs alongside PocketBase as a companion service. Data is synced from PocketBase to Meilisearch via hooks that trigger on record create, update, and delete events.

### 6.1 Indexes

| Index | Searchable Fields | Filterable Fields | Sortable Fields |
|-------|-------------------|-------------------|-----------------|
| sources | name, url, description | verified, categories, avg_rating | avg_rating, review_count |
| products | name, description, brand.name | category, avg_rating, brand | avg_rating, review_count |
| posts | title, body, author.username | post_type, community, status | created, upvotes |
| communities | name, slug, description | member_count | member_count, created |

### 6.2 Sync Strategy

- PocketBase hooks (`OnRecordAfterCreateRequest`, `OnRecordAfterUpdateRequest`, `OnRecordAfterDeleteRequest`) push changes to Meilisearch in near real-time
- A nightly full re-index job runs as a safety net to catch any missed updates
- Search results return PocketBase record IDs, allowing the frontend to fetch full records with relations as needed

### 6.3 Search UX Pattern

> The global search bar uses Meilisearch's instant search with as-you-type results. Results are grouped by type (Sources, Products, Posts, Communities) in a dropdown. Selecting a result navigates to the appropriate detail page. The `/search` page provides full-page results with faceted filtering.

---

## 7. Authentication & Authorisation

### 7.1 Authentication Methods

- Email + password (PocketBase built-in auth collection)
- OAuth2 providers: Google and GitHub at launch (PocketBase built-in OAuth2 support)
- Email verification required before posting (PocketBase built-in email verification)
- Password reset via email (PocketBase built-in)

### 7.2 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Guest (unauthenticated) | Browse sources, products, posts. View profiles. Use search. Cannot vote, comment, or post. |
| User (authenticated) | All guest permissions plus: post, comment, vote, report, follow users, join communities, manage own profile. |
| Moderator | All user permissions plus: remove posts/comments in assigned communities, review reports, pin posts, mute users within community. |
| Business | All user permissions plus: claim source listing, post verified deals, access basic analytics for their source page. |
| Admin | Full platform access: verify sources/brands, assign moderators, manage categories, view platform analytics, manage ads/promos. |

### 7.3 API Access Rules (PocketBase)

PocketBase collection API rules enforce permissions at the database level. Each collection has `list`, `view`, `create`, `update`, and `delete` rules expressed as filter expressions. For example, posts can only be updated by their author, and only moderators or admins can change post status to "removed".

---

## 8. Real-Time Features

PocketBase provides Server-Sent Events (SSE) based real-time subscriptions. The frontend subscribes to specific collections or individual records for live updates.

### 8.1 Real-Time Subscriptions

| Feature | Collection | Trigger |
|---------|-----------|---------|
| Live feed updates | posts | New posts appear at top of feed in real-time |
| Comment threads | comments | New comments appear without page refresh |
| Vote counts | posts / comments | Vote counts update live as users vote |
| Notifications | notifications | Bell icon updates with new notification count |
| Online user count | Custom endpoint | Community page shows active user count |

### 8.2 Implementation Pattern

The frontend uses PocketBase's JavaScript SDK `subscribe` method within React `useEffect` hooks. Subscriptions are scoped to the current view (e.g. subscribing to posts filtered by community when viewing a community page) and cleaned up on unmount to prevent memory leaks.

---

## 9. Moderation System

Moderation is built in from day one to ensure community quality as the platform scales.

### 9.1 Reporting Flow

1. Any authenticated user (Gold tier+) submits a report against a post, comment, or user
2. Report enters the moderation queue for the relevant community
3. Community moderators review the report and take action: dismiss, warn, remove content, or escalate to admin
4. Reporter receives a notification of the outcome
5. If the report was valid, the reporter earns +5 points. If the content is removed, the author loses −10 points

### 9.2 Automated Moderation

- **Rate limiting:** Max post/comment frequency per user (configurable per community)
- **Minimum account age:** New accounts cannot post for 24 hours (prevents drive-by spam)
- **Word filter:** Configurable blocklist for offensive terms (applied on create/update hooks)
- **Duplicate detection:** Prevent identical post bodies within a rolling 24-hour window
- **New user probation:** First 5 posts from any user are held for moderator review

### 9.3 Moderator Tools

- **Content queue:** Filterable list of flagged/reported content with one-click actions
- **User history:** View a user's complete post/comment/report history from the mod panel
- **Community rules editor:** Define and display rules specific to each community
- **Mute/ban:** Temporarily mute or permanently ban users from specific communities
- **Mod log:** Transparent audit trail of all moderator actions (visible to admins)

---

## 10. Revenue Model

The platform uses a combined revenue approach to diversify income streams while maintaining user trust.

### 10.1 Revenue Streams

| Stream | Model | Details |
|--------|-------|---------|
| Promoted Source Listings | Pay-per-month | Sources pay to appear in the "Top Rated" sidebar or featured positions. Clearly labelled as "Sponsored". |
| Verified Business Accounts | Subscription | Monthly/annual fee for businesses to claim their source listing, post official deals, and access analytics. |
| Affiliate Links | Commission | Product links to sources use affiliate tracking where partnerships exist. Disclosed transparently. |
| Display Advertising | CPM / CPC | Designated ad slots in the right sidebar and between feed items (max 1 ad per 10 posts). No intrusive formats. |
| Promoted Deals | Pay-per-listing | Businesses pay to feature deals in the Promos & Deals section with enhanced visibility. |

### 10.2 Trust Principle

> All paid placements are visually distinct and labelled. Sponsored content never influences community-generated ratings or review order. The platform's credibility depends on authentic reviews, so paid content and organic content are always clearly separated.

---

## 11. SEO Strategy

Given the platform's content-heavy nature, SEO is a core growth driver. Every page is server-rendered with structured data to maximise organic discovery.

### 11.1 Technical SEO

- Server-side rendering via Next.js App Router for all public pages (sources, products, reviews, communities)
- Dynamic metadata generation using Next.js `generateMetadata` for each route with unique titles, descriptions, and Open Graph images
- JSON-LD structured data: `Product` schema for supplements, `Review` schema for reviews, `Organization` schema for sources, `BreadcrumbList` for navigation
- XML sitemap generated dynamically from PocketBase collections, submitted to Google Search Console
- Canonical URLs on all pages to prevent duplicate content issues
- Image optimisation via Next.js Image component with alt text derived from product/source names

### 11.2 Content SEO

- Each source and product gets a dedicated, indexable page with unique content
- Review content provides long-tail keyword coverage naturally (e.g. "[Brand] [Product] review UK")
- Community discussion threads create topical authority around supplement categories
- Category pages (`/supplements?category=protein`) target mid-funnel search queries
- Internal linking strategy: products link to their sources, sources link to their reviews, reviews link back to products

---

## 12. Component Architecture

The frontend uses a component-based architecture with clear separation between server and client components. Tailwind CSS handles all styling.

### 12.1 Core Components

| Component | Type | Purpose |
|-----------|------|---------|
| `<Header />` | Client | Fixed header with logo, search bar, nav links, auth state |
| `<SearchBar />` | Client | Meilisearch instant search with grouped dropdown results |
| `<FeedCard />` | Server | Individual post card in the feed (renders differently per post_type) |
| `<FeedList />` | Client | Infinite scroll feed container with filter controls and real-time subscription |
| `<SourceCard />` | Server | Source card for sidebar/directory (logo, rating, verified badge, actions) |
| `<ProductCard />` | Server | Product card with image, brand, rating, category |
| `<ReviewForm />` | Client | Dynamic form for source/product reviews (star input, text, image upload) |
| `<CommentThread />` | Client | Nested comment tree with real-time updates and voting |
| `<VoteButtons />` | Client | Upvote/downvote with optimistic UI updates |
| `<StarRating />` | Client | Interactive star rating input and display component |
| `<UserBadge />` | Server | User avatar + username + reputation tier indicator |
| `<DealCard />` | Server | Deal card with source, offer, expiry countdown, action button |
| `<CommunityList />` | Server | Sidebar community list with member counts and join buttons |
| `<ImageGrid />` | Server | Responsive grid of community images with lightbox |
| `<ModQueue />` | Client | Moderator content queue with action buttons |
| `<PointsDisplay />` | Client | User points and tier progress indicator |

### 12.2 Design System Tokens (Tailwind)

The Tailwind 4 configuration uses `@theme` directives to define the design system:

- **Colours:** Brand navy, accent teal, success green, warning amber, error red, neutral greys
- **Typography:** Inter for body, display weight for headings
- **Spacing:** 8px grid system
- **Border radius:** sm (4px) through full (pill)

All components consume these tokens for visual consistency.

---

## 13. Deployment & Infrastructure

### 13.1 Architecture Overview

The platform runs on a single VPS with PocketBase and Meilisearch co-located. Next.js runs as a Node/Bun server behind a reverse proxy. Cloudflare sits in front for CDN, DDoS protection, and edge caching.

### 13.2 Infrastructure Stack

| Service | Provider | Purpose |
|---------|----------|---------|
| VPS | Hetzner / DigitalOcean | Primary server (4 vCPU, 8GB RAM minimum) |
| Reverse Proxy | Caddy | Automatic HTTPS, reverse proxy to Next.js + PocketBase |
| CDN | Cloudflare | Edge caching, image optimisation, WAF, DDoS protection |
| Object Storage | Cloudflare R2 | Media uploads (images, avatars, logos) — optional, can use PocketBase local storage initially |
| Email | Resend | Transactional emails (verification, password reset, notifications) |
| Monitoring | Uptime Kuma | Self-hosted uptime monitoring and alerting |
| Backups | Automated script | Nightly PocketBase SQLite backup to R2 or offsite storage |

### 13.3 Deployment Pipeline

1. Code pushed to GitHub main branch triggers deployment
2. GitHub Actions runs linting, type checking, and build
3. Successful build artefact is deployed to VPS via SSH/rsync
4. Process manager (PM2 or systemd) restarts the Next.js server
5. PocketBase runs as a systemd service (separate from Next.js)
6. Meilisearch runs as a systemd service with persistent data directory

### 13.4 Backup Strategy

- **PocketBase SQLite database:** Nightly automated backup using PocketBase's built-in backup command, stored in Cloudflare R2
- **Meilisearch:** Nightly snapshot dump to R2 (Meilisearch has built-in snapshot/dump commands)
- **Media files:** If using R2 for storage, R2 handles durability. If using local storage, rsync to offsite backup nightly
- **Database retention:** 30 days of daily backups, 12 months of weekly backups

---

## 14. Launch Checklist

### 14.1 Infrastructure

- [ ] VPS provisioned and secured (SSH keys, firewall, fail2ban)
- [ ] PocketBase deployed with all collections, API rules, and hooks configured
- [ ] Meilisearch deployed with indexes created and initial data sync complete
- [ ] Caddy configured with SSL for all domains/subdomains
- [ ] Cloudflare configured with DNS, caching rules, and page rules
- [ ] Resend configured with domain verification and transactional email templates
- [ ] Backup automation tested and running
- [ ] Uptime monitoring configured with alerts

### 14.2 Application

- [ ] All routes rendering correctly with SSR and proper metadata
- [ ] Authentication flow complete (register, login, verify email, reset password, OAuth)
- [ ] Source, Brand, and Product CRUD working for admin users
- [ ] Post creation, editing, and deletion working for all post types
- [ ] Voting system working with optimistic UI and duplicate prevention
- [ ] Comment system working with nesting and real-time updates
- [ ] Points system calculating and awarding correctly with daily caps
- [ ] Search returning accurate results across all content types
- [ ] Image upload and optimisation pipeline working
- [ ] Mobile-responsive layout tested across breakpoints

### 14.3 Content & Community

- [ ] Default communities (a/sourcereviews, a/supplementreviews, a/sourcetalk) created with rules and descriptions
- [ ] Seed data: Minimum 20 sources, 10 brands, and 50 products populated
- [ ] Category taxonomy defined with icons and descriptions
- [ ] Community guidelines and terms of service published
- [ ] Moderation tools tested and moderator accounts created

### 14.4 SEO & Analytics

- [ ] XML sitemap generating correctly and submitted to Google Search Console
- [ ] JSON-LD structured data validated on all page types
- [ ] Open Graph and Twitter Card meta tags rendering correctly
- [ ] Analytics tracking installed (Plausible or Umami for privacy-respecting analytics)
- [ ] Core Web Vitals passing on all key pages

---

## 15. Next Steps

1. Review and finalise this specification with any amendments
2. Set up the development environment (Next.js + PocketBase + Meilisearch locally via Bun)
3. Build the PocketBase collections schema and API rules
4. Develop the component library starting with the design system tokens
5. Implement authentication and user profile flows
6. Build the feed system with post creation and voting
7. Integrate Meilisearch and build the search experience
8. Implement the points and reputation engine
9. Build moderation tooling
10. Seed content, test all flows end-to-end, and deploy

---

*End of Specification — SuppleSphere v1.0*
