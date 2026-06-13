import { useState, useCallback, useEffect } from "react";
import type { ScheduleData, RawMatch, Round } from "../types";

const SCHEDULE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

export function matchToUtcMs(m: RawMatch): number {
  const timeMatch = m.time?.match(/^(\d{1,2}):(\d{2})\s*UTC([+-]\d+)$/);
  if (!m.date || !timeMatch) return 0;
  const [, h, min, offset] = timeMatch;
  const sign = offset.startsWith("-") ? "-" : "+";
  const absOffset = Math.abs(parseInt(offset));
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = `${m.date}T${pad(parseInt(h))}:${min}:00${sign}${pad(absOffset)}:00`;
  return new Date(iso).getTime() || 0;
}

export function israelDate(m: RawMatch): string {
  const ms = matchToUtcMs(m);
  if (!ms) return m.date || "TBD";
  return new Intl.DateTimeFormat("en-IL", {
    timeZone: "Asia/Jerusalem",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ms));
}

// A match is "over" ~2.5h after kickoff, or once a final score exists.
const MATCH_DURATION_MS = 2.5 * 60 * 60 * 1000;

export function isGameOver(m: RawMatch, now: number = Date.now()): boolean {
  if (m.score?.ft) return true;
  const kickoff = matchToUtcMs(m);
  if (!kickoff) return false; // TBD / unparseable -> keep it
  return now - kickoff >= MATCH_DURATION_MS;
}

export function groupByDate(matches: RawMatch[]): Round[] {
  const map = new Map<string, RawMatch[]>();
  for (const m of matches) {
    if (isGameOver(m)) continue;
    const key = israelDate(m);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map, ([name, dayMatches]) => ({
    name,
    matches: dayMatches.sort((a, b) => matchToUtcMs(a) - matchToUtcMs(b)),
  }))
    .filter((r) => r.matches.length > 0)
    .sort((a, b) => matchToUtcMs(a.matches[0]) - matchToUtcMs(b.matches[0]));
}

export function useSchedule() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(SCHEDULE_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ScheduleData = await res.json();
      setRounds(groupByDate(data.matches));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rounds, loading, error, refresh: fetchData };
}
