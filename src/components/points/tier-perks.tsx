import { getTierPerks, getNextTierPerks } from "@/lib/permissions";
import { TierBadge } from "./tier-badge";

export function TierPerks({
  tier,
  showNext = true,
}: {
  tier: string;
  showNext?: boolean;
}) {
  const currentPerks = getTierPerks(tier);
  const nextTierInfo = showNext ? getNextTierPerks(tier) : null;

  return (
    <div className="space-y-4">
      {/* Current perks */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <TierBadge tier={tier} size="md" />
          <span className="text-sm font-medium text-neutral-600">Your Perks</span>
        </div>
        <ul className="space-y-2">
          {currentPerks.map((perk, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
              <svg className="h-4 w-4 shrink-0 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* Next tier perks */}
      {nextTierInfo && (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm">🔒</span>
            <TierBadge tier={nextTierInfo.tier.toLowerCase()} size="md" />
            <span className="text-sm font-medium text-neutral-500">Unlocks at {nextTierInfo.tier}</span>
          </div>
          <ul className="space-y-2">
            {nextTierInfo.perks.map((perk, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-neutral-400">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Full comparison of all tiers and their perks.
 */
export function TierPerksComparison({ currentTier }: { currentTier: string }) {
  const tiers = [
    { name: "bronze", label: "Bronze", points: "0", perks: ["Basic profile", "Post and comment", "Vote on content"] },
    { name: "silver", label: "Silver", points: "250", perks: ["Custom avatar border", "Submit deals"] },
    { name: "gold", label: "Gold", points: "1,000", perks: ["Profile flair text", "Report content", "Early access"] },
    { name: "platinum", label: "Platinum", points: "5,000", perks: ["Create communities", "Custom banner", "Mod nomination"] },
    { name: "diamond", label: "Diamond", points: "15,000", perks: ["Verified badge", "Priority support", "Beta features"] },
  ];

  const tierRank: Record<string, number> = { bronze: 0, silver: 1, gold: 2, platinum: 3, diamond: 4 };
  const currentRank = tierRank[currentTier] ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiers.map((t) => {
        const isUnlocked = (tierRank[t.name] ?? 0) <= currentRank;
        const isCurrent = t.name === currentTier;

        return (
          <div
            key={t.name}
            className={`rounded-xl border p-4 ${
              isCurrent
                ? "border-accent-teal bg-accent-teal/5 ring-1 ring-accent-teal"
                : isUnlocked
                  ? "border-neutral-200 bg-white"
                  : "border-dashed border-neutral-300 bg-neutral-50"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <TierBadge tier={t.name} size="sm" />
              <span className="text-xs text-neutral-400">{t.points} pts</span>
            </div>
            {isCurrent && (
              <p className="mb-2 text-xs font-medium text-accent-teal">← You are here</p>
            )}
            <ul className="space-y-1">
              {t.perks.map((perk, i) => (
                <li key={i} className={`flex items-center gap-1.5 text-xs ${isUnlocked ? "text-neutral-600" : "text-neutral-400"}`}>
                  {isUnlocked ? (
                    <span className="text-success">✓</span>
                  ) : (
                    <span>🔒</span>
                  )}
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
