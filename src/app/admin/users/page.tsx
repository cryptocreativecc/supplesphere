"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: string;
  reputation_tier: string;
  points: number;
  review_count: number;
  created: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function changeRole(userId: string, newRole: string) {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setEditingRole(null);
    } catch {
      // silent
    }
  }

  async function suspendUser(userId: string) {
    if (!confirm("Are you sure you want to suspend this user?")) return;
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, suspended: true }),
      });
      fetchUsers();
    } catch {
      // silent
    }
  }

  const tierColors: Record<string, string> = {
    bronze: "text-amber-700 bg-amber-50",
    silver: "text-neutral-500 bg-neutral-100",
    gold: "text-yellow-600 bg-yellow-50",
    platinum: "text-cyan-600 bg-cyan-50",
    diamond: "text-purple-600 bg-purple-50",
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-brand-navy">User Management</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by username or email..."
          className="flex-1 min-w-[200px] max-w-md rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-accent-teal focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-accent-teal focus:outline-none"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="business">Business</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-400">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold text-neutral-500 uppercase">
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/u/${u.username}`}
                      className="font-medium text-accent-teal hover:underline"
                    >
                      {u.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                  <td className="px-4 py-3">
                    {editingRole === u.id ? (
                      <select
                        defaultValue={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        className="rounded border border-neutral-200 px-2 py-1 text-xs focus:border-accent-teal focus:outline-none"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="business">Business</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingRole(u.id)}
                        className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-neutral-700 hover:bg-neutral-200"
                      >
                        {u.role}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${tierColors[u.reputation_tier] || ""}`}>
                      {u.reputation_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.points}</td>
                  <td className="px-4 py-3">{u.review_count}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(u.created).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => suspendUser(u.id)}
                      className="rounded px-2 py-1 text-xs font-medium text-error bg-error/10 hover:bg-error/20"
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
