import { Navbar } from "../components/Navbar";
import { PredictionCard } from "../components/PredictionCard";
import { usePolymarket } from "../hooks/usePolymarket";

const WINNER_SLUG = "world-cup-winner";

export function Overall() {
  const winner = usePolymarket(WINNER_SLUG);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Overall{" "}
          <span className="text-accent">Winner</span>
        </h1>

        {winner.loading && (
          <p className="text-center text-text-muted">Loading predictions...</p>
        )}

        {!winner.loading && winner.market && (
          <PredictionCard market={winner.market} />
        )}

        {!winner.loading && winner.error && !winner.market && (
          <p className="text-center text-accent">{winner.error}</p>
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
