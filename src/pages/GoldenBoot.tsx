import { Navbar } from "../components/Navbar";
import { PredictionCard } from "../components/PredictionCard";
import { usePolymarket, getGoalCount } from "../hooks/usePolymarket";
import { useSchedule } from "../hooks/useSchedule";

const SCORER_SLUG = "world-cup-golden-boot-winner";

export function GoldenBoot() {
  const scorer = usePolymarket(SCORER_SLUG);
  const { scorerTally, refresh: refreshSchedule } = useSchedule();

  const refresh = () => {
    scorer.refresh();
    refreshSchedule();
  };

  return (
    <>
      <Navbar onRefresh={refresh} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Golden Boot{" "}
          <span className="text-accent">Winner</span>
        </h1>

        {scorer.loading && (
          <p className="text-center text-text-muted">Loading predictions...</p>
        )}

        {!scorer.loading && scorer.market && (
          <PredictionCard
            market={scorer.market}
            limit={10}
            renderBadge={(name) => {
              const goals = getGoalCount(name, scorerTally);
              if (goals <= 0) return null;
              return (
                <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-xs font-semibold text-accent">
                  {goals} {goals === 1 ? "goal" : "goals"}
                </span>
              );
            }}
          />
        )}

        {!scorer.loading && scorer.error && !scorer.market && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-lg font-semibold text-text">Golden Boot Winner</h2>
            <p className="text-sm text-text-muted">Market not currently available on Polymarket.</p>
          </div>
        )}

        <footer className="mt-10 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-xs">Page visits</span>
          <img
            src="https://count.getloli.com/@worldcup-poly-aggregator?theme=3d-num"
            alt="Page visit count"
            className="h-8"
          />
        </footer>
      </main>
    </>
  );
}
