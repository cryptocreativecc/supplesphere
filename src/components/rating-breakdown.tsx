export function RatingBreakdown({
  distribution,
  totalReviews,
}: {
  distribution: { stars: number; count: number }[];
  totalReviews: number;
}) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => {
        const entry = distribution.find((d) => d.stars === stars);
        const count = entry?.count || 0;
        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return (
          <div key={stars} className="flex items-center gap-3">
            <span className="w-8 text-right text-sm font-medium text-neutral-600">
              {stars}★
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-warning transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs text-neutral-400">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
