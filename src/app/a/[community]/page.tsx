import Link from "next/link";
import { Metadata } from "next";
import { FeedList } from "@/components/feed/feed-list";
import { mockCommunities, mockFeedPosts } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ community: string }>;
}): Promise<Metadata> {
  const { community } = await params;
  const comm = mockCommunities.find((c) => c.slug === community);
  if (!comm) return { title: `a/${community}` };
  return {
    title: `a/${comm.slug} — ${comm.name}`,
    description: comm.description,
    openGraph: {
      title: `a/${comm.slug} — ${comm.name} | SuppleSphere`,
      description: comm.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `a/${comm.slug} — ${comm.name} | SuppleSphere`,
      description: comm.description,
    },
    alternates: {
      canonical: `/a/${community}`,
    },
  };
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const comm = mockCommunities.find((c) => c.slug === community);

  const communityPosts = mockFeedPosts.filter(
    (p) => p.community === community
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Community Header */}
      <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-brand-navy to-accent-teal" />

        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="-mt-12 flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-brand-navy text-lg font-bold text-white shadow-card">
                a/
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">
                  {comm ? comm.name : `a/${community}`}
                </h1>
                <p className="text-sm text-neutral-400">a/{community}</p>
                {comm && (
                  <p className="mt-2 max-w-lg text-sm text-neutral-600">
                    {comm.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-neutral-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {comm
                      ? `${comm.memberCount.toLocaleString()} members`
                      : "0 members"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="rounded-full bg-accent-teal px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-teal-light">
                Join
              </button>
              <Link
                href={`/a/${community}/submit`}
                className="rounded-full border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-600 transition hover:border-accent-teal hover:text-accent-teal"
              >
                Create Post
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Feed */}
        <FeedList
          initialPosts={communityPosts.length > 0 ? communityPosts : mockFeedPosts}
          community={community}
          showScopeFilter={false}
        />

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {/* About */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
              <h3 className="mb-2 text-sm font-semibold text-brand-navy">
                About this community
              </h3>
              <p className="text-sm text-neutral-600">
                {comm?.description || `Community discussion space for a/${community}.`}
              </p>
              <div className="mt-3 border-t border-neutral-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Members</span>
                  <span className="font-medium text-neutral-700">
                    {comm?.memberCount.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-neutral-400">Created</span>
                  <span className="font-medium text-neutral-700">Mar 2026</span>
                </div>
              </div>
            </div>

            {/* Rules */}
            {comm && comm.rules.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
                <h3 className="mb-3 text-sm font-semibold text-brand-navy">
                  Community Rules
                </h3>
                <ol className="space-y-3">
                  {comm.rules.map((rule, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-neutral-700">
                            {rule.title}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Allowed post types */}
            {comm && (
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
                <h3 className="mb-2 text-sm font-semibold text-brand-navy">
                  Allowed Post Types
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {comm.postTypes.map((pt) => (
                    <span
                      key={pt}
                      className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-600"
                    >
                      {pt.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
