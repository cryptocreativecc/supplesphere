"use client";

import { useState } from "react";
import { ReportModal } from "./report-modal";

interface ReportButtonProps {
  targetType: "post" | "comment";
  targetId: string;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 text-neutral-400 transition hover:text-error"
        title="Report"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      </button>

      {showModal && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
