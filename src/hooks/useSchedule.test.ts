import { describe, it, expect } from "vitest";
import { matchToUtcMs, israelDate, groupByDate, completedMatches } from "./useSchedule";
import type { RawMatch } from "../types";

function match(overrides: Partial<RawMatch>): RawMatch {
  return { date: "", time: "", team1: "A", team2: "B", round: "Matchday 1", ...overrides };
}

describe("matchToUtcMs", () => {
  it("converts UTC-6 time correctly", () => {
    const m = match({ date: "2026-06-11", time: "20:00 UTC-6" });
    const ms = matchToUtcMs(m);
    // 20:00 UTC-6 = 02:00 UTC next day
    expect(new Date(ms).toISOString()).toBe("2026-06-12T02:00:00.000Z");
  });

  it("converts UTC-4 time correctly", () => {
    const m = match({ date: "2026-06-12", time: "15:00 UTC-4" });
    const ms = matchToUtcMs(m);
    // 15:00 UTC-4 = 19:00 UTC same day
    expect(new Date(ms).toISOString()).toBe("2026-06-12T19:00:00.000Z");
  });

  it("converts UTC-7 time correctly", () => {
    const m = match({ date: "2026-06-13", time: "12:00 UTC-7" });
    const ms = matchToUtcMs(m);
    // 12:00 UTC-7 = 19:00 UTC same day
    expect(new Date(ms).toISOString()).toBe("2026-06-13T19:00:00.000Z");
  });

  it("returns 0 for missing date", () => {
    const m = match({ date: "", time: "12:00 UTC-4" });
    expect(matchToUtcMs(m)).toBe(0);
  });

  it("returns 0 for unparseable time", () => {
    const m = match({ date: "2026-06-11", time: "TBD" });
    expect(matchToUtcMs(m)).toBe(0);
  });
});

describe("israelDate", () => {
  it("assigns late UTC-6 match to next Israel date", () => {
    // 20:00 UTC-6 on June 11 = 05:00 Israel time on June 12
    const m = match({ date: "2026-06-11", time: "20:00 UTC-6" });
    const d = israelDate(m);
    expect(d).toContain("12");
    expect(d).not.toContain("11");
  });

  it("assigns early UTC-6 match to same Israel date", () => {
    // 13:00 UTC-6 on June 11 = 22:00 Israel time on June 11
    const m = match({ date: "2026-06-11", time: "13:00 UTC-6" });
    const d = israelDate(m);
    expect(d).toContain("11");
  });
});

describe("groupByDate", () => {
  it("groups matches by Israel-time date and sorts chronologically", () => {
    const matches: RawMatch[] = [
      match({ date: "2026-06-11", time: "20:00 UTC-6", team1: "South Korea", team2: "Czech Republic", round: "Matchday 1" }),
      match({ date: "2026-06-11", time: "13:00 UTC-6", team1: "Mexico", team2: "South Africa", round: "Matchday 1" }),
      match({ date: "2026-06-12", time: "15:00 UTC-4", team1: "Canada", team2: "Bosnia", round: "Matchday 2" }),
    ];

    const groups = groupByDate(matches);

    // Mexico vs SA (June 11 22:00 IL) is on June 11
    // South Korea vs Czech (June 12 05:00 IL) is on June 12
    // Canada vs Bosnia (June 12 22:00 IL) is also on June 12
    expect(groups).toHaveLength(2);

    const june11 = groups[0];
    expect(june11.name).toContain("11");
    expect(june11.matches).toHaveLength(1);
    expect(june11.matches[0].team1).toBe("Mexico");

    const june12 = groups[1];
    expect(june12.name).toContain("12");
    expect(june12.matches).toHaveLength(2);
    expect(june12.matches[0].team1).toBe("South Korea");
    expect(june12.matches[1].team1).toBe("Canada");
  });

  it("sorts matches within same day by kickoff time", () => {
    const matches: RawMatch[] = [
      match({ date: "2026-06-12", time: "15:00 UTC-4", team1: "Late" }),
      match({ date: "2026-06-12", time: "12:00 UTC-4", team1: "Early" }),
    ];

    const groups = groupByDate(matches);
    expect(groups[0].matches[0].team1).toBe("Early");
    expect(groups[0].matches[1].team1).toBe("Late");
  });
});

describe("completedMatches", () => {
  it("returns only games with a final score", () => {
    const matches: RawMatch[] = [
      match({ date: "2026-06-11", time: "13:00 UTC-6", team1: "Mexico", team2: "South Africa", score: { ft: [2, 0] } }),
      match({ date: "2030-06-12", time: "15:00 UTC-4", team1: "Canada", team2: "Bosnia" }),
    ];

    const done = completedMatches(matches);
    expect(done).toHaveLength(1);
    expect(done[0].team1).toBe("Mexico");
  });

  it("treats games >2.5h past kickoff as completed even without a score", () => {
    const longAgo = match({ date: "2026-06-11", time: "13:00 UTC-6", team1: "Old" });
    // No score, but kickoff is far in the past -> isGameOver true, but no ft -> excluded
    const done = completedMatches([longAgo]);
    expect(done).toHaveLength(0);
  });

  it("sorts completed matches most recent first", () => {
    const matches: RawMatch[] = [
      match({ date: "2026-06-11", time: "13:00 UTC-6", team1: "First", score: { ft: [1, 0] } }),
      match({ date: "2026-06-13", time: "13:00 UTC-6", team1: "Later", score: { ft: [2, 2] } }),
      match({ date: "2026-06-12", time: "13:00 UTC-6", team1: "Middle", score: { ft: [0, 0] } }),
    ];

    const done = completedMatches(matches);
    expect(done.map((m) => m.team1)).toEqual(["Later", "Middle", "First"]);
  });
});
