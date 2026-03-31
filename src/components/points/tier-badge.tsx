import type { ReputationTier } from "@/lib/points";

const tierStyles: Record<
  string,
  { bg: string; text: string; border: string; icon: string; label: string }
> = {
  bronze: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "🥉",
    label: "Bronze",
  },
  silver: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: "🥈",
    label: "Silver",
  },
  gold: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: "🥇",
    label: "Gold",
  },
  platinum: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: "💎",
    label: "Platinum",
  },
  diamond: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    icon: "✨",
    label: "Diamond",
  },
};

export function TierBadge({
  tier,
  size = "sm",
  showIcon = true,
}: {
  tier: string;
  size?: "xs" | "sm" | "md" | "lg";
  showIcon?: boolean;
}) {
  const style = tierStyles[tier] || tierStyles.bronze;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      {showIcon && <span>{style.icon}</span>}
      {style.label}
    </span>
  );
}

/**
 * Inline tier indicator for use next to usernames.
 */
export function TierIndicator({ tier }: { tier: string }) {
  const style = tierStyles[tier] || tierStyles.bronze;
  return (
    <span className={`text-xs font-medium ${style.text}`} title={`${style.label} tier`}>
      {style.icon}
    </span>
  );
}
