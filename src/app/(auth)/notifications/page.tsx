"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  reference_id: string;
  is_read: boolean;
  created: string;
}

type FilterTab = "all" | "unread" | "replies" | "mentions" | "system";

const typeIcons: Record<string, string> = {
  upvote: "👍",
  comment: "💬",
  reply: "↩️",
  mention: "@",
  badge: "🏆",
  points: "⭐",
  moderation: "🛡️",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (f: FilterTab, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ filter: f, page: String(p), limit: "20" });
      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
        setTotalPages(data.totalPages || 1);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(filter, page);
  }, [filter, page, fetchNotifications]);

  async function markAsRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_read: true }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function markAllAsRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "replies", label: "Replies" },
    { key: "mentions", label: "Mentions" },
    { key: "system", label: "System" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-navy">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-lg px-4 py-2 text-sm font-medium text-accent-teal transition hover:bg-accent-teal/10"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setPage(1); }}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition ${
              filter === tab.key
                ? "border-b-2 border-accent-teal text-accent-teal"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="py-12 text-center text-neutral-400">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl bg-neutral-50 p-8 text-center">
          <div className="mb-2 text-4xl">🔔</div>
          <h3 className="mb-1 text-lg font-semibold text-neutral-700">No notifications</h3>
          <p className="text-sm text-neutral-400">
            {filter === "unread"
              ? "You're all caught up!"
              : "Notifications will appear here when someone interacts with your content."}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition hover:shadow-card ${
                notif.is_read
                  ? "border-neutral-200 bg-white"
                  : "border-accent-teal/20 bg-accent-teal/5"
              }`}
            >
              <span className="mt-0.5 text-lg shrink-0">{typeIcons[notif.type] || "📌"}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${!notif.is_read ? "font-medium text-brand-navy" : "text-neutral-600"}`}>
                  {notif.message}
                </p>
                <span className="text-xs text-neutral-400">{formatTime(notif.created)}</span>
              </div>
              {!notif.is_read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
