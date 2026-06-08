import { Navbar } from "../components/Navbar";
import { PredictionCard } from "../components/PredictionCard";
import { usePolymarket } from "../hooks/usePolymarket";

const WINNER_SLUG = "world-cup-winner";
const SCORER_SLUG = "world-cup-golden-boot-winner";

export function Predictions() {
  const winner = usePolymarket(WINNER_SLUG);
  const scorer = usePolymarket(SCORER_SLUG);

  const refresh = () => {
    winner.refresh();
    scorer.refresh();
  };

  const loading = winner.loading || scorer.loading;

  return (
    <>
      <Navbar onRefresh={refresh} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          World Cup 2026{" "}
          <span className="text-accent">Predictions</span>
        </h1>

        {loading && (
          <p className="text-center text-text-muted">Loading predictions...</p>
        )}

        {!loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {winner.market && <PredictionCard market={winner.market} />}
            {winner.error && !winner.market && (
              <p className="text-center text-accent">{winner.error}</p>
            )}
            {scorer.market && <PredictionCard market={scorer.market} />}
            {scorer.error && !scorer.market && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-4 text-lg font-semibold text-text">Golden Boot Winner</h2>
                <p className="text-sm text-text-muted">Market not currently available on Polymarket.</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-10 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-xs">Visitors</span>
          <img
            src="https://count.getloli.com/@worldcup-poly-aggregator?theme=3d-num"
            alt="Visitor count"
            className="h-8"
          />
        </footer>
      </main>
    </>
  );
}
