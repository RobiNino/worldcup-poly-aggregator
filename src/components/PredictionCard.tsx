import type { Market } from "../types";

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function PredictionCard({
  market,
  limit = 10,
}: {
  market: Market;
  limit?: number;
}) {
  const top = market.outcomes.slice(0, limit);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-lg font-semibold text-text">{market.question}</h2>
      <div className="space-y-2.5">
        {top.map((o, i) => {
          const pct = (o.probability * 100).toFixed(1);
          return (
            <div key={o.name} className="flex items-center gap-3">
              <span className="w-6 text-right text-xs font-bold text-text-muted">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">{o.name}</span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatVolume(o.volume)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="w-14 text-right text-sm font-semibold text-accent-alt">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
