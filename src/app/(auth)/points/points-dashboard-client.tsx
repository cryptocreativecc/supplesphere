"use client";

import { DailyCaps } from "@/components/points/daily-caps";
import { PointsHistory } from "@/components/points/points-history";

export function PointsDashboardClient({ userId }: { userId: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Points History */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">Points History</h2>
        <PointsHistory userId={userId} />
      </div>

      {/* Daily Caps */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card h-fit">
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">Today&apos;s Activity</h2>
        <DailyCaps userId={userId} />
      </div>
    </div>
  );
}
