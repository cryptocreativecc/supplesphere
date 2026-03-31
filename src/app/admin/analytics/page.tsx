"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  signups: { date: string; count: number }[];
  postsPerDay: { date: string; count: number }[];
  reviewsPerDay: { date: string; count: number }[];
  topSources: { name: string; reviewCount: number }[];
  topCommunities: { name: string; memberCount: number }[];
  totalUsers: number;
  totalPosts: number;
  totalReviews: number;
}

function MiniChart({ data, color = "#0d9488" }: { data: { date: string; count: number }[]; color?: string }) {
  if (data.length === 0) return <div className="h-32 rounded-lg bg-neutral-50 flex items-center justify-center text-sm text-neutral-400">No data</div>;

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const width = 100;
  const height = 32;
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - (d.count / maxVal) * height;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function BarChart({ items, valueKey, labelKey, color = "#0d9488" }: {
  items: Record<string, unknown>[];
  valueKey: string;
  labelKey: string;
  color?: string;
}) {
  if (items.length === 0) return <div className="p-4 text-center text-sm text-neutral-400">No data</div>;
  const maxVal = Math.max(...items.map((i) => (i[valueKey] as number) || 0), 1);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const value = (item[valueKey] as number) || 0;
        const pct = (value / maxVal) * 100;
        return (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-32 truncate text-sm text-neutral-700">{item[labelKey] as string}</span>
            <div className="flex-1 h-6 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="w-12 text-right text-sm font-medium text-neutral-600">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) return <div className="py-12 text-center text-neutral-400">Loading analytics…</div>;

  if (!data) return <div className="py-12 text-center text-neutral-400">Failed to load analytics.</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-brand-navy">Platform Analytics</h1>

      {/* Summary stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users", value: data.totalUsers, icon: "👤" },
          { label: "Total Posts", value: data.totalPosts, icon: "📝" },
          { label: "Total Reviews", value: data.totalReviews, icon: "⭐" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
            <div className="text-2xl">{s.icon}</div>
            <p className="mt-2 text-2xl font-bold text-brand-navy">{s.value}</p>
            <p className="text-sm text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-navy">Signups Over Time</h3>
          <MiniChart data={data.signups} color="#0d9488" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-navy">Posts Per Day</h3>
          <MiniChart data={data.postsPerDay} color="#1a1f36" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-navy">Reviews Per Day</h3>
          <MiniChart data={data.reviewsPerDay} color="#f59e0b" />
        </div>
      </div>

      {/* Bar charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-navy">Top Sources by Reviews</h3>
          <BarChart items={data.topSources as unknown as Record<string, unknown>[]} valueKey="reviewCount" labelKey="name" color="#0d9488" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-navy">Top Communities by Members</h3>
          <BarChart items={data.topCommunities as unknown as Record<string, unknown>[]} valueKey="memberCount" labelKey="name" color="#1a1f36" />
        </div>
      </div>
    </div>
  );
}
