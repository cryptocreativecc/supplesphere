"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  postsToday: number;
  reviewsToday: number;
  activeReports: number;
  pendingSources: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    postsToday: 0,
    reviewsToday: 0,
    activeReports: 0,
    pendingSources: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/analytics?summary=true");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👤", color: "text-brand-navy" },
    { label: "Posts Today", value: stats.postsToday, icon: "📝", color: "text-accent-teal" },
    { label: "Reviews Today", value: stats.reviewsToday, icon: "⭐", color: "text-yellow-500" },
    { label: "Active Reports", value: stats.activeReports, icon: "🚩", color: "text-error" },
    { label: "Sources Pending", value: stats.pendingSources, icon: "🏪", color: "text-warning" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-brand-navy">Admin Dashboard</h1>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card"
          >
            <div className="text-2xl">{stat.icon}</div>
            <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
              {isLoading ? "—" : stat.value}
            </p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mb-3 text-lg font-semibold text-brand-navy">Quick Actions</h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/sources"
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-teal/10 text-xl">
            ✅
          </div>
          <div>
            <div className="font-medium text-brand-navy">Verify Sources</div>
            <div className="text-xs text-neutral-500">Review and verify source listings</div>
          </div>
        </Link>
        <Link
          href="/admin/reports"
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10 text-xl">
            🚩
          </div>
          <div>
            <div className="font-medium text-brand-navy">Escalated Reports</div>
            <div className="text-xs text-neutral-500">Handle escalated moderation reports</div>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-xl">
            📂
          </div>
          <div>
            <div className="font-medium text-brand-navy">Manage Categories</div>
            <div className="text-xs text-neutral-500">Add, edit, or reorder categories</div>
          </div>
        </Link>
      </div>

      {/* Recent activity panels */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-3 text-lg font-semibold text-brand-navy">
            Source Verification Queue
          </h2>
          <div className="rounded-lg bg-neutral-50 p-4 text-center text-sm text-neutral-400">
            {stats.pendingSources > 0
              ? `${stats.pendingSources} source(s) awaiting verification.`
              : "No pending verifications."}
          </div>
          {stats.pendingSources > 0 && (
            <Link
              href="/admin/sources"
              className="mt-3 block text-center text-sm font-medium text-accent-teal hover:text-accent-teal-light"
            >
              Review sources →
            </Link>
          )}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-3 text-lg font-semibold text-brand-navy">
            Platform Moderation
          </h2>
          <div className="rounded-lg bg-neutral-50 p-4 text-center text-sm text-neutral-400">
            {stats.activeReports > 0
              ? `${stats.activeReports} active report(s) need attention.`
              : "All clear."}
          </div>
          {stats.activeReports > 0 && (
            <Link
              href="/admin/reports"
              className="mt-3 block text-center text-sm font-medium text-accent-teal hover:text-accent-teal-light"
            >
              View reports →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
