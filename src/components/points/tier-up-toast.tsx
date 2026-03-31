"use client";

import { useState, useEffect } from "react";
import { TierBadge } from "./tier-badge";

const tierCelebrations: Record<string, { emoji: string; message: string }> = {
  silver: { emoji: "🎉", message: "You can now submit deals!" },
  gold: { emoji: "🏆", message: "You can now set profile flair and report content!" },
  platinum: { emoji: "💎", message: "You can now create communities!" },
  diamond: { emoji: "✨", message: "You've earned the Verified Reviewer badge!" },
};

export function TierUpToast({
  newTier,
  onClose,
}: {
  newTier: string;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const celebration = tierCelebrations[newTier] || { emoji: "🎊", message: "Keep it up!" };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
      />

      {/* Card */}
      <div
        className={`relative z-10 mx-4 max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-2xl transition-transform duration-300 ${
          visible ? "scale-100" : "scale-90"
        }`}
      >
        <div className="mb-4 text-5xl">{celebration.emoji}</div>
        <h2 className="mb-2 text-xl font-bold text-brand-navy">Tier Up!</h2>
        <p className="mb-4 text-sm text-neutral-600">
          You&apos;ve reached a new reputation tier
        </p>
        <div className="mb-4 flex justify-center">
          <TierBadge tier={newTier} size="lg" />
        </div>
        <p className="mb-6 text-sm text-neutral-500">{celebration.message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="rounded-lg bg-accent-teal px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

/**
 * Hook-like component that checks for new tier-up notifications.
 * Place this in the layout to auto-show celebrations.
 */
export function TierUpChecker() {
  const [tierUp, setTierUp] = useState<string | null>(null);

  useEffect(() => {
    // Check for unread tier-up notifications
    fetch("/api/points?type=tier-check")
      .then((res) => res.json())
      .then((data) => {
        if (data.newTier) {
          setTierUp(data.newTier);
        }
      })
      .catch(() => {});
  }, []);

  if (!tierUp) return null;

  return <TierUpToast newTier={tierUp} onClose={() => setTierUp(null)} />;
}
