"use client";

import { useState } from "react";

interface ReportModalProps {
  targetType: "post" | "comment";
  targetId: string;
  onClose: () => void;
}

const REASONS = [
  { value: "spam", label: "Spam", description: "Unsolicited or repetitive content" },
  { value: "harassment", label: "Harassment", description: "Abusive or threatening behavior" },
  { value: "misinformation", label: "Misinformation", description: "False or misleading claims" },
  { value: "off_topic", label: "Off-topic", description: "Not relevant to the community" },
  { value: "other", label: "Other", description: "Another reason not listed above" },
];

export function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center">
            <div className="mb-3 text-4xl">✅</div>
            <h2 className="mb-2 text-lg font-semibold text-brand-navy">Report Submitted</h2>
            <p className="mb-4 text-sm text-neutral-500">
              Thank you for helping keep the community safe. A moderator will review your report.
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-accent-teal px-6 py-2 text-sm font-medium text-white transition hover:bg-accent-teal-light"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-navy">
                Report {targetType === "post" ? "Post" : "Comment"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4 space-y-2">
                <label className="text-sm font-medium text-neutral-700">Reason</label>
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                      reason === r.value
                        ? "border-accent-teal bg-accent-teal/5"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-0.5 accent-accent-teal"
                    />
                    <div>
                      <div className="text-sm font-medium text-brand-navy">{r.label}</div>
                      <div className="text-xs text-neutral-500">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Provide more context about this report..."
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm transition focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                />
              </div>

              {error && (
                <div className="mb-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason}
                  className="flex-1 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition hover:bg-error-light disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
