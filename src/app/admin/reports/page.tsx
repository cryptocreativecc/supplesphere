"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function resolveReport(reportId: string, action: string) {
    try {
      await fetch(`/api/reports/${reportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      fetchReports();
    } catch {
      // silent
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    reviewed: "bg-accent-teal/10 text-accent-teal",
    dismissed: "bg-neutral-100 text-neutral-500",
    actioned: "bg-success/10 text-success",
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-brand-navy">Escalated Reports</h1>

      <div className="mb-4 flex gap-2">
        {["pending", "reviewed", "actioned", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              statusFilter === s
                ? "bg-accent-teal text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-400">Loading…</div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl bg-neutral-50 p-8 text-center">
          <div className="mb-2 text-4xl">✅</div>
          <h3 className="text-lg font-semibold text-neutral-700">No reports</h3>
          <p className="text-sm text-neutral-400">No {statusFilter} reports to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded px-2 py-0.5 font-medium capitalize ${statusColors[report.status] || ""}`}>
                  {report.status}
                </span>
                <span className="rounded bg-error/10 px-1.5 py-0.5 font-medium text-error capitalize">
                  {report.reason.replace("_", " ")}
                </span>
                <span className="text-neutral-400">
                  {report.target_type} • {report.target_id.slice(0, 8)}…
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-400">
                  by {report.expand?.reporter?.username || "Unknown"}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-400">
                  {new Date(report.created).toLocaleDateString()}
                </span>
              </div>
              <p className="mb-3 text-sm text-neutral-600">
                {report.details || "No additional details provided."}
              </p>
              {report.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => resolveReport(report.id, "dismiss")} className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200">
                    Dismiss
                  </button>
                  <button onClick={() => resolveReport(report.id, "warn")} className="rounded-lg px-3 py-1.5 text-xs font-medium text-warning bg-warning/10 hover:bg-warning/20">
                    Warn Author
                  </button>
                  <button onClick={() => resolveReport(report.id, "remove")} className="rounded-lg px-3 py-1.5 text-xs font-medium text-error bg-error/10 hover:bg-error/20">
                    Remove Content
                  </button>
                </div>
              )}
            </div>
          ))}
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
