"use client";

import { useState, useEffect, useCallback } from "react";

interface SourceItem {
  id: string;
  name: string;
  url: string;
  slug: string;
  verified: boolean;
  avg_rating: number;
  review_count: number;
  claimed_by: string;
}

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), search });
      const res = await fetch(`/api/admin/sources?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSources(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  async function toggleVerify(id: string, verified: boolean) {
    try {
      await fetch("/api/admin/sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, verified: !verified }),
      });
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, verified: !verified } : s))
      );
    } catch {
      // silent
    }
  }

  async function bulkVerify() {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await fetch("/api/admin/sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, verified: true }),
      });
    }
    setSelectedIds(new Set());
    fetchSources();
  }

  async function deleteSource(id: string) {
    if (!confirm("Are you sure you want to delete this source?")) return;
    try {
      await fetch("/api/admin/sources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchSources();
    } catch {
      // silent
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-brand-navy">Source Management</h1>
        {selectedIds.size > 0 && (
          <button
            onClick={bulkVerify}
            className="rounded-lg bg-accent-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-teal-light"
          >
            Verify Selected ({selectedIds.size})
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search sources by name or URL..."
          className="w-full max-w-md rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-accent-teal focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-400">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold text-neutral-500 uppercase">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(sources.map((s) => s.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    checked={selectedIds.size === sources.length && sources.length > 0}
                    className="accent-accent-teal"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Claimed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(source.id)}
                      onChange={() => toggleSelect(source.id)}
                      className="accent-accent-teal"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-navy">{source.name}</td>
                  <td className="px-4 py-3">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent-teal hover:underline truncate max-w-[200px] block">
                      {source.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {source.verified ? (
                      <span className="rounded bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Yes</span>
                    ) : (
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {source.avg_rating > 0 ? `${source.avg_rating.toFixed(1)} ⭐` : "—"}
                  </td>
                  <td className="px-4 py-3">{source.review_count}</td>
                  <td className="px-4 py-3">
                    {source.claimed_by ? (
                      <span className="rounded bg-accent-teal/10 px-2 py-0.5 text-xs font-medium text-accent-teal">Yes</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleVerify(source.id, source.verified)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          source.verified
                            ? "text-warning bg-warning/10 hover:bg-warning/20"
                            : "text-success bg-success/10 hover:bg-success/20"
                        }`}
                      >
                        {source.verified ? "Unverify" : "Verify"}
                      </button>
                      <a
                        href={`/sources/${source.slug || source.id}`}
                        className="rounded px-2 py-1 text-xs font-medium text-accent-teal bg-accent-teal/10 hover:bg-accent-teal/20"
                      >
                        View
                      </a>
                      <button
                        onClick={() => deleteSource(source.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-error bg-error/10 hover:bg-error/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                    No sources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
