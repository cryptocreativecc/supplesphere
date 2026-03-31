"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type ModTab = "queue" | "users" | "rules" | "log";

interface ReportItem {
  id: string;
  reporter: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string;
  status: string;
  created: string;
  expand?: {
    reporter?: { username: string };
  };
}

interface UserItem {
  id: string;
  username: string;
  email: string;
  points: number;
  reputation_tier: string;
  role: string;
  created: string;
}

interface ModLogItem {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  created: string;
  expand?: {
    moderator?: { username: string };
  };
}

export default function ModPanelPage() {
  const params = useParams();
  const community = params.community as string;
  const [activeTab, setActiveTab] = useState<ModTab>("queue");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [modLog, setModLog] = useState<ModLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [stats, setStats] = useState({ pending: 0, flagged: 0, mutes: 0 });
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    id: string;
    label: string;
  } | null>(null);
  const [muteModal, setMuteModal] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports?community=${community}&status=pending`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.items || []);
        setStats((prev) => ({ ...prev, pending: data.totalItems || 0 }));
      }
    } catch {
      // silent
    }
  }, [community]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.set("search", userSearch);
      const res = await fetch(`/api/mod/${community}/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
      }
    } catch {
      // silent
    }
  }, [community, userSearch]);

  const fetchLog = useCallback(async () => {
    try {
      const res = await fetch(`/api/mod/${community}/log`);
      if (res.ok) {
        const data = await res.json();
        setModLog(data.items || []);
      }
    } catch {
      // silent
    }
  }, [community]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchReports(), fetchUsers(), fetchLog()]).finally(() =>
      setIsLoading(false)
    );
  }, [fetchReports, fetchUsers, fetchLog]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [userSearch, activeTab, fetchUsers]);

  async function resolveReport(reportId: string, action: string) {
    try {
      await fetch(`/api/reports/${reportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, communityId: community }),
      });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
      setConfirmAction(null);
    } catch {
      // silent
    }
  }

  async function handleUserAction(userId: string, action: string, durationHours?: number) {
    try {
      await fetch(`/api/mod/${community}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, durationHours }),
      });
      setMuteModal(null);
      fetchUsers();
      fetchLog();
    } catch {
      // silent
    }
  }

  const tabs: { key: ModTab; label: string; icon: string }[] = [
    { key: "queue", label: "Content Queue", icon: "📋" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "rules", label: "Rules", icon: "📜" },
    { key: "log", label: "Mod Log", icon: "📊" },
  ];

  const actionColors: Record<string, string> = {
    dismiss: "text-neutral-600 bg-neutral-100 hover:bg-neutral-200",
    warn: "text-warning bg-warning/10 hover:bg-warning/20",
    remove: "text-error bg-error/10 hover:bg-error/20",
    escalate: "text-purple-700 bg-purple-100 hover:bg-purple-200",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-brand-navy">
        Moderation — a/{community}
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Manage reports, users, and community settings
      </p>

      {/* Stats bar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending Reports", value: stats.pending, icon: "🚩", color: "text-error" },
          { label: "Flagged Content", value: stats.flagged, icon: "⚠️", color: "text-warning" },
          { label: "Active Mutes", value: stats.mutes, icon: "🔇", color: "text-neutral-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
            <div className="flex items-center gap-2">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-b-2 border-accent-teal text-accent-teal"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-400">Loading…</div>
      ) : (
        <>
          {/* Content Queue tab */}
          {activeTab === "queue" && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="rounded-xl bg-neutral-50 p-8 text-center">
                  <div className="mb-2 text-4xl">✅</div>
                  <h3 className="text-lg font-semibold text-neutral-700">All clear!</h3>
                  <p className="text-sm text-neutral-400">No pending reports to review.</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-error/10 px-1.5 py-0.5 font-medium text-error">
                        {report.reason}
                      </span>
                      <span className="text-neutral-400">
                        Reported by {report.expand?.reporter?.username || "Unknown"}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-400">{report.created}</span>
                    </div>
                    <p className="mb-3 text-sm text-neutral-600">
                      {report.details || "No additional details provided."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(["dismiss", "warn", "remove", "escalate"] as const).map((action) => (
                        <button
                          key={action}
                          onClick={() =>
                            setConfirmAction({ type: action, id: report.id, label: action })
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${actionColors[action]}`}
                        >
                          {action === "remove" ? "Remove Content" : action === "escalate" ? "Escalate to Admin" : action}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Users tab */}
          {activeTab === "users" && (
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full max-w-md rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-accent-teal focus:outline-none"
                />
              </div>
              <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold text-neutral-500 uppercase">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">Points</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 font-medium text-brand-navy">{u.username}</td>
                        <td className="px-4 py-3 capitalize">{u.reputation_tier}</td>
                        <td className="px-4 py-3">{u.points}</td>
                        <td className="px-4 py-3 text-neutral-500">{new Date(u.created).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setMuteModal(u.id)}
                              className="rounded px-2 py-1 text-xs font-medium text-warning bg-warning/10 hover:bg-warning/20"
                            >
                              Mute
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "ban", id: u.id, label: `ban ${u.username}` })
                              }
                              className="rounded px-2 py-1 text-xs font-medium text-error bg-error/10 hover:bg-error/20"
                            >
                              Ban
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rules tab */}
          {activeTab === "rules" && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
              <h2 className="mb-4 text-lg font-semibold text-brand-navy">Community Rules</h2>
              <p className="mb-4 text-sm text-neutral-500">
                Define and manage rules for a/{community}. Rules are displayed on the community page.
              </p>
              <div className="rounded-lg bg-neutral-50 p-4 text-center text-sm text-neutral-400">
                Rules editor coming soon. Contact an admin to update community rules.
              </div>
            </div>
          )}

          {/* Mod Log tab */}
          {activeTab === "log" && (
            <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold text-neutral-500 uppercase">
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Moderator</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {modLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-neutral-700">
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-navy">
                        {entry.expand?.moderator?.username || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {entry.target_type} • {entry.target_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(entry.created).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {modLog.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                        No mod actions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Confirm action modal */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmAction(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-semibold text-brand-navy">Confirm Action</h3>
            <p className="mb-4 text-sm text-neutral-600">
              Are you sure you want to <strong className="capitalize">{confirmAction.label}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === "ban") {
                    handleUserAction(confirmAction.id, "ban");
                  } else {
                    resolveReport(confirmAction.id, confirmAction.type);
                  }
                }}
                className="flex-1 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:bg-error-light"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mute duration modal */}
      {muteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setMuteModal(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-brand-navy">Mute Duration</h3>
            <div className="space-y-2">
              {[
                { label: "1 hour", hours: 1 },
                { label: "24 hours", hours: 24 },
                { label: "7 days", hours: 168 },
                { label: "30 days", hours: 720 },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  onClick={() => handleUserAction(muteModal, "mute", opt.hours)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-warning hover:bg-warning/10"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMuteModal(null)}
              className="mt-3 w-full rounded-lg px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
