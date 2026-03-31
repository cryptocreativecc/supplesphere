import { TierBadge } from "./points/tier-badge";

const tierBorderColours: Record<string, string> = {
  bronze: "",
  silver: "ring-2 ring-slate-300",
  gold: "ring-2 ring-yellow-400",
  platinum: "ring-2 ring-purple-400",
  diamond: "ring-2 ring-cyan-400",
};

export function UserBadge({
  username,
  avatar,
  tier = "bronze",
  size = "sm",
  showTier = true,
}: {
  username: string;
  avatar?: string;
  tier?: string;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
}) {
  const borderClass = tierBorderColours[tier] || "";
  const sizeClasses = {
    sm: { avatar: "h-6 w-6 text-xs", name: "text-sm" },
    md: { avatar: "h-8 w-8 text-sm", name: "text-sm" },
    lg: { avatar: "h-10 w-10 text-base", name: "text-base" },
  }[size];

  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          className={`${sizeClasses.avatar} rounded-full object-cover ${borderClass}`}
        />
      ) : (
        <div
          className={`${sizeClasses.avatar} flex items-center justify-center rounded-full bg-brand-navy font-bold text-white ${borderClass}`}
        >
          {username.charAt(0).toUpperCase()}
        </div>
      )}
      <span className={`${sizeClasses.name} font-medium text-neutral-700`}>
        {username}
      </span>
      {showTier && <TierBadge tier={tier} size="xs" />}
    </div>
  );
}
