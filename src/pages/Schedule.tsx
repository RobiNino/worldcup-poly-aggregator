import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { useSchedule } from "../hooks/useSchedule";
import { useMatchOdds } from "../hooks/usePolymarket";
import { getFlag } from "../utils/countryFlags";
import type { PolymarketOdds, RawMatch } from "../types";

function parseUtcOffset(time: string): string | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*UTC([+-]\d+)$/);
  if (!match) return null;
  const [, h, m, offset] = match;
  const sign = offset.startsWith("-") ? "-" : "+";
  const absOffset = Math.abs(parseInt(offset));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(parseInt(h))}:${m}:00${sign}${pad(absOffset)}:00`;
}

function formatTime(date: string, time: string): string {
  if (!date) return "TBD";
  const timePart = parseUtcOffset(time);
  const iso = timePart ? `${date}T${timePart}` : date;
  try {
    return new Intl.DateTimeFormat("en-IL", {
      timeZone: "Asia/Jerusalem",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return time;
  }
}

const DISPLAY_ALIASES: Record<string, string[]> = {
  "south korea": ["korea republic"],
  "czech republic": ["czechia"],
  "bosnia & herzegovina": ["bosnia and herzegovina", "bosnia"],
  "bosnia-herzegovina": ["bosnia and herzegovina", "bosnia & herzegovina", "bosnia"],
  "usa": ["united states"],
  "turkey": ["türkiye", "turkiye"],
  "ivory coast": ["côte d'ivoire", "cote d'ivoire", "cote divoire"],
  "cape verde": ["cabo verde"],
};

function findOddFor(odds: PolymarketOdds, team: string): number | null {
  const lower = team.toLowerCase();
  const variants = [lower, ...(DISPLAY_ALIASES[lower] || [])];
  const entry = odds.winner.find((o) => {
    const label = o.label.toLowerCase();
    return variants.some((v) => label.includes(v) || v.includes(label));
  });
  return entry ? entry.probability : null;
}

function findDrawOdd(odds: PolymarketOdds): number | null {
  const entry = odds.winner.find((o) => o.label.toLowerCase().includes("draw"));
  return entry ? entry.probability : null;
}

function namesMatch(a: string, b: string): boolean {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const aVariants = [aLower, ...(DISPLAY_ALIASES[aLower] || [])];
  const bVariants = [bLower, ...(DISPLAY_ALIASES[bLower] || [])];
  return aVariants.some((av) =>
    bVariants.some((bv) => av === bv || av.includes(bv) || bv.includes(av))
  );
}

function getTeamHistory(team: string, completed: RawMatch[]): RawMatch[] {
  return completed.filter(
    (m) => namesMatch(team, m.team1) || namesMatch(team, m.team2)
  );
}

function PreviousMatches({ team, completed }: { team: string; completed: RawMatch[] }) {
  const history = getTeamHistory(team, completed);
  return (
    <div className="flex-1">
      <p className="mb-1 text-xs font-semibold">
        {getFlag(team)} {team}
      </p>
      {history.length === 0 ? (
        <p className="text-xs text-text-muted">No previous matches</p>
      ) : (
        <ul className="space-y-1">
          {history.map((m, idx) => {
            const ft = m.score!.ft;
            const teamIsHome = namesMatch(team, m.team1);
            const teamScore = teamIsHome ? ft[0] : ft[1];
            const oppScore = teamIsHome ? ft[1] : ft[0];
            const opponent = teamIsHome ? m.team2 : m.team1;
            const result =
              teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
            const resultColor =
              result === "W"
                ? "text-green-500"
                : result === "L"
                  ? "text-accent"
                  : "text-text-muted";
            return (
              <li key={`${m.team1}-${m.team2}-${idx}`} className="text-xs text-text-muted">
                <span className={`font-semibold ${resultColor}`}>{result}</span>{" "}
                <span className="font-medium text-text">
                  {teamScore} – {oppScore}
                </span>{" "}
                vs {getFlag(opponent)} {opponent}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OddsPanel({
  odds,
  team1,
  team2,
  completed,
}: {
  odds: PolymarketOdds;
  team1: string;
  team2: string;
  completed: RawMatch[];
}) {
  const top5 = odds.exactScore.slice(0, 5);
  const polymarketSlug = odds.exactScoreSlug || odds.slug;
  return (
    <div className="mt-2 rounded-md border border-border bg-background px-4 py-3">
      {top5.length > 0 && (
        <>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">Top Exact Score Predictions</p>
          <div className="flex flex-wrap gap-2">
            {top5.map((o) => (
              <span
                key={o.label}
                className="rounded border border-border px-2 py-1 text-xs font-medium"
              >
                {o.label} <span className="text-accent">{Math.round(o.probability * 100)}%</span>
              </span>
            ))}
          </div>
        </>
      )}
      <div className={top5.length > 0 ? "mt-3 border-t border-border pt-3" : ""}>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">Previous Matches</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <PreviousMatches team={team1} completed={completed} />
          <PreviousMatches team={team2} completed={completed} />
        </div>
      </div>
      {polymarketSlug && (
        <a
          href={`https://polymarket.com/event/${polymarketSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block text-xs text-accent hover:underline${top5.length > 0 ? " mt-2" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          View on Polymarket ↗
        </a>
      )}
    </div>
  );
}

export function Schedule() {
  const { rounds, completed, loading, error, refresh } = useSchedule();
  const { getOdds } = useMatchOdds();
  const [expandedTile, setExpandedTile] = useState<string | null>(null);

  return (
    <>
      <Navbar onRefresh={refresh} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Match <span className="text-accent">Schedule</span>
        </h1>

        {loading && (
          <p className="text-center text-text-muted">Loading schedule...</p>
        )}
        {error && (
          <p className="text-center text-accent">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {rounds.map((round) => (
              <section key={round.name}>
                <h2 className="mb-3 border-b border-border pb-2 text-lg font-semibold text-accent-alt">
                  {round.name}
                </h2>
                <div className="space-y-2">
                  {round.matches.map((m, i) => {
                    const tileKey = `${m.team1}-${m.team2}-${i}`;
                    const odds = getOdds(m.team1, m.team2);
                    const hasOdds = odds != null;
                    const isExpanded = expandedTile === tileKey;

                    return (
                      <div key={tileKey}>
                        <div
                          className={`rounded-lg border border-border bg-surface px-4 py-3${hasOdds ? " cursor-pointer transition-colors hover:border-accent/40" : ""}`}
                          onClick={hasOdds ? () => setExpandedTile(isExpanded ? null : tileKey) : undefined}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-text-muted">
                              {formatTime(m.date, m.time)}
                            </span>
                            <span className="flex items-center gap-2">
                              {m.ground && (
                                <span className="text-xs text-text-muted">{m.ground}</span>
                              )}
                              {m.score?.ft && (
                                <span className="text-sm font-bold text-accent">
                                  {m.score.ft[0]} – {m.score.ft[1]}
                                </span>
                              )}
                              {hasOdds && (
                                <span className="text-xs text-text-muted">
                                  {isExpanded ? "▲" : "▼"}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="mt-1 flex items-start text-sm font-medium">
                            <div className="flex flex-1 flex-col items-end">
                              <span>{getFlag(m.team1)} {m.team1}</span>
                              {odds && findOddFor(odds, m.team1) != null && (
                                <span className="text-xs text-accent">{Math.round(findOddFor(odds, m.team1)! * 100)}%</span>
                              )}
                            </div>
                            <div className="flex w-10 shrink-0 flex-col items-center">
                              <span className="text-text-muted">vs</span>
                              {odds && findDrawOdd(odds) != null && (
                                <span className="text-xs text-text-muted">{Math.round(findDrawOdd(odds)! * 100)}%</span>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col items-start">
                              <span>{m.team2} {getFlag(m.team2)}</span>
                              {odds && findOddFor(odds, m.team2) != null && (
                                <span className="text-xs text-accent">{Math.round(findOddFor(odds, m.team2)! * 100)}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded && hasOdds && (
                          <OddsPanel
                            odds={odds!}
                            team1={m.team1}
                            team2={m.team2}
                            completed={completed}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
