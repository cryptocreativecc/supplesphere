import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TierBadge } from "@/components/points/tier-badge";
import { PointsProgress } from "@/components/points/points-progress";
import { TierPerksComparison } from "@/components/points/tier-perks";
import { PointsDashboardClient } from "./points-dashboard-client";

export const metadata: Metadata = {
  title: "Points & Reputation",
  description: "Track your points, reputation tier, and progress on SuppleSphere.",
};

export default async function PointsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Points & Reputation</h1>

      {/* Overview card */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy text-2xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-brand-navy">{user.username}</h2>
                <TierBadge tier={user.reputation_tier} size="sm" />
              </div>
              <p className="text-2xl font-bold text-accent-teal">
                {user.points.toLocaleString()} <span className="text-sm font-normal text-neutral-400">points</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <PointsProgress points={user.points} />
        </div>
      </div>

      {/* Client-side interactive sections */}
      <PointsDashboardClient userId={user.id} />

      {/* Tier comparison */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">Tier Perks</h2>
        <TierPerksComparison currentTier={user.reputation_tier} />
      </div>

      {/* How points work */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">How Points Work</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { action: "Source/Product Review", points: "+15", icon: "🏪" },
            { action: "Discussion Post", points: "+5", icon: "💬" },
            { action: "Share a Deal", points: "+10", icon: "🔥" },
            { action: "Comment", points: "+3", icon: "💭" },
            { action: "Receive Post Upvote", points: "+2", icon: "👍" },
            { action: "Receive Comment Upvote", points: "+1", icon: "👍" },
            { action: "Give an Upvote", points: "+1", icon: "⬆️" },
            { action: "First Post of the Day", points: "+5", icon: "🌅" },
            { action: "Verified Purchase Bonus", points: "+10", icon: "✅" },
            { action: "Report Accepted", points: "+5", icon: "🛡️" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-sm text-neutral-700">{item.action}</span>
              </div>
              <span className="text-sm font-bold text-success">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
