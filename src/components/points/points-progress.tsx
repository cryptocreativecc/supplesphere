import { TIERS, calculateTier, getNextTier, getTierInfo } from "@/lib/points";
import { TierBadge } from "./tier-badge";

export function PointsProgress({
  points,
  showLabels = true,
  compact = false,
}: {
  points: number;
  showLabels?: boolean;
  compact?: boolean;
}) {
  const currentTier = calculateTier(points);
  const currentInfo = getTierInfo(currentTier);
  const nextInfo = getNextTier(currentTier);

  let progressPct = 100;
  let pointsToNext = 0;

  if (nextInfo) {
    const range = nextInfo.pointsRequired - currentInfo.pointsRequired;
    const progress = points - currentInfo.pointsRequired;
    progressPct = Math.min(100, Math.max(0, (progress / range) * 100));
    pointsToNext = nextInfo.pointsRequired - points;
  }

  const barColours: Record<string, string> = {
    bronze: "bg-amber-500",
    silver: "bg-slate-400",
    gold: "bg-yellow-500",
    platinum: "bg-purple-500",
    diamond: "bg-cyan-500",
  };

  if (compact) {
    return (
      <div className="w-full">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-neutral-600">
            {points.toLocaleString()} pts
          </span>
          {nextInfo && (
            <span className="text-neutral-400">
              {pointsToNext.toLocaleString()} to {nextInfo.label}
            </span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColours[currentTier] || "bg-accent-teal"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showLabels && (
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TierBadge tier={currentTier} size="sm" />
            <span className="text-sm font-semibold text-neutral-700">
              {points.toLocaleString()} points
            </span>
          </div>
          {nextInfo ? (
            <span className="text-xs text-neutral-400">
              {pointsToNext.toLocaleString()} points to{" "}
              <TierBadge tier={nextInfo.name} size="xs" />
            </span>
          ) : (
            <span className="text-xs font-medium text-cyan-600">Max tier reached! ✨</span>
          )}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColours[currentTier] || "bg-accent-teal"}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      {showLabels && nextInfo && (
        <div className="mt-1 flex justify-between text-xs text-neutral-400">
          <span>{currentInfo.pointsRequired.toLocaleString()}</span>
          <span>{Math.round(progressPct)}%</span>
          <span>{nextInfo.pointsRequired.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
