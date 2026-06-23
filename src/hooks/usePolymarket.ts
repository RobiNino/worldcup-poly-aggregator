import { useState, useCallback, useEffect } from "react";
import type {
  Market,
  Outcome,
  PolymarketOdds,
  PolymarketRawEvent,
  OddEntry,
  ScorerTally,
} from "../types";

// --- Slug-based hook (used by Overall page) ---

interface GammaMarket {
  question: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  groupItemTitle?: string;
}

interface GammaEvent {
  title: string;
  markets: GammaMarket[];
}

function aggregateMarkets(event: GammaEvent): Market {
  const outcomes: Outcome[] = event.markets
    .filter((gm) => gm.outcomePrices != null)
    .map((gm) => {
      const prices: string[] = JSON.parse(gm.outcomePrices);
      const yesPrice = parseFloat(prices[0]) || 0;
      const volume = parseFloat(gm.volume) || 0;
      return {
        name: gm.groupItemTitle ?? gm.question,
        probability: yesPrice,
        volume,
      };
    });

  outcomes.sort((a, b) => b.probability - a.probability);

  return { question: event.title, outcomes };
}

const BASE_URL = import.meta.env.DEV
  ? "/polymarket-api"
  : "https://gamma-api.polymarket.com";

export function usePolymarket(slug: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/events?slug=${slug}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const events: GammaEvent[] = await res.json();
      if (!events.length) throw new Error("Event not found");
      setMarket(aggregateMarkets(events[0]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { market, loading, error, refresh: fetchData };
}

// --- Series-based hook (used by Schedule page for match odds) ---

const SERIES_BASE = `${BASE_URL}/events?series_id=11433&closed=false&limit=100`;

type OddsMap = Map<string, PolymarketOdds>;

const TITLE_NORMALIZATIONS: string[][] = [
  ["bosnia and herzegovina", "bosniaherzegovina", "bosnia herzegovina"],
  ["cote divoire", "ctedivoire", "cte divoire"],
  ["korea republic", "south korea"],
  ["united states", "usa"],
  ["cabo verde", "cape verde"],
  ["turkiye", "trkiye", "turkey"],
];

export function normalizeTitle(title: string): string {
  let t = title.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
  for (const group of TITLE_NORMALIZATIONS) {
    for (let i = 1; i < group.length; i++) {
      if (t.includes(group[i])) {
        t = t.replace(group[i], group[0]);
        break;
      }
    }
  }
  return t;
}

export const TEAM_ALIASES: Record<string, string[]> = {
  "south korea": ["korea republic"],
  "czech republic": ["czechia"],
  "bosnia & herzegovina": ["bosnia and herzegovina", "bosniaherzegovina"],
  "bosnia-herzegovina": ["bosnia and herzegovina", "bosnia & herzegovina"],
  "usa": ["united states"],
  "turkey": ["trkiye", "turkiye"],
  "ivory coast": ["cte divoire", "cote divoire"],
  "cape verde": ["cabo verde"],
};

export function teamVariants(team: string): string[] {
  const lower = team.toLowerCase();
  const normalized = normalizeTitle(team);
  const variants = [lower, normalized];
  if (TEAM_ALIASES[lower]) variants.push(...TEAM_ALIASES[lower]);
  for (const [alias, targets] of Object.entries(TEAM_ALIASES)) {
    if (targets.includes(normalized)) variants.push(alias);
  }
  return variants;
}

export function matchesTeams(eventTitle: string, team1: string, team2: string): boolean {
  const norm = normalizeTitle(eventTitle);
  const t1Variants = teamVariants(team1);
  const t2Variants = teamVariants(team2);
  return t1Variants.some((v) => norm.includes(v)) && t2Variants.some((v) => norm.includes(v));
}

// --- Player name normalization (used to match goal scorers to Golden Boot names) ---

export function normalizePlayerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function playerTokenKey(name: string): string {
  return normalizePlayerName(name).split(" ").filter(Boolean).sort().join(" ");
}

export function getGoalCount(
  playerName: string,
  tally: Map<string, ScorerTally>
): number {
  const direct = tally.get(normalizePlayerName(playerName));
  if (direct) return direct.goals;
  const tokenKey = playerTokenKey(playerName);
  for (const entry of tally.values()) {
    if (playerTokenKey(entry.name) === tokenKey) return entry.goals;
  }
  return 0;
}

export function isHalftimeEvent(title: string): boolean {
  return title.toLowerCase().includes("halftime");
}

export function isExactScoreEvent(title: string): boolean {
  return title.toLowerCase().includes("exact score");
}

export function parseOutcomes(markets: PolymarketRawEvent["markets"]): OddEntry[] {
  const entries: OddEntry[] = [];
  for (const market of markets) {
    if (!market.outcomePrices) continue;
    try {
      const prices: string[] = JSON.parse(market.outcomePrices);
      const prob = parseFloat(prices[0]);
      if (!isNaN(prob) && market.groupItemTitle) {
        const label = market.groupItemTitle.replace(/^Exact Score:\s*/i, "");
        entries.push({ label, probability: prob });
      }
    } catch {
      // skip malformed prices
    }
  }
  return entries.sort((a, b) => b.probability - a.probability);
}

export function buildOddsMap(events: PolymarketRawEvent[]): OddsMap {
  const grouped = new Map<string, { winner: OddEntry[]; exactScore: OddEntry[]; slug?: string; exactScoreSlug?: string }>();

  for (const event of events) {
    if (isHalftimeEvent(event.title)) continue;

    const isExact = isExactScoreEvent(event.title);
    const baseKey = normalizeTitle(
      isExact ? event.title.replace(/exact score/i, "").trim() : event.title
    );

    if (!grouped.has(baseKey)) {
      grouped.set(baseKey, { winner: [], exactScore: [] });
    }

    const outcomes = parseOutcomes(event.markets);
    const entry = grouped.get(baseKey)!;

    if (isExact) {
      entry.exactScore.push(...outcomes);
      entry.exactScoreSlug = event.slug;
    } else {
      entry.winner.push(...outcomes);
      entry.slug = event.slug;
    }
  }

  for (const odds of grouped.values()) {
    odds.winner.sort((a, b) => b.probability - a.probability);
    odds.exactScore.sort((a, b) => b.probability - a.probability);
  }

  return grouped;
}

export function useMatchOdds() {
  const [oddsMap, setOddsMap] = useState<OddsMap>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function fetchAllEvents(): Promise<PolymarketRawEvent[]> {
      const all: PolymarketRawEvent[] = [];
      let offset = 0;
      const PAGE = 100;
      while (true) {
        const res = await fetch(`${SERIES_BASE}&offset=${offset}`);
        if (!res.ok) break;
        const page: PolymarketRawEvent[] = await res.json();
        if (page.length === 0) break;
        all.push(...page);
        if (page.length < PAGE) break;
        offset += PAGE;
      }
      return all;
    }

    async function fetchOdds() {
      try {
        const events = await fetchAllEvents();
        if (!cancelled) {
          setOddsMap(buildOddsMap(events));
        }
      } catch {
        // silently fail - odds are optional
      }
    }

    fetchOdds();
    return () => { cancelled = true; };
  }, []);

  const getOdds = useCallback(
    (team1: string, team2: string): PolymarketOdds | null => {
      for (const [key, odds] of oddsMap) {
        if (matchesTeams(key, team1, team2)) {
          return odds;
        }
      }
      return null;
    },
    [oddsMap]
  );

  return { getOdds };
}
