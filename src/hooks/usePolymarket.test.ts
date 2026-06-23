import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  matchesTeams,
  isHalftimeEvent,
  isExactScoreEvent,
  parseOutcomes,
  buildOddsMap,
  teamVariants,
  normalizePlayerName,
  playerTokenKey,
  getGoalCount,
} from "./usePolymarket";
import type { PolymarketRawEvent, ScorerTally } from "../types";

describe("normalizeTitle", () => {
  it("lowercases and strips non-alpha characters", () => {
    expect(normalizeTitle("Mexico vs. South Africa")).toBe("mexico vs south africa");
  });

  it("collapses multiple spaces and normalizes team names", () => {
    expect(normalizeTitle("Canada vs.  Bosnia-Herzegovina")).toBe("canada vs bosnia and herzegovina");
  });

  it("handles accented characters by stripping them and normalizes team names", () => {
    expect(normalizeTitle("Côte d'Ivoire")).toBe("cote divoire");
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeTitle("  Brazil vs Haiti  ")).toBe("brazil vs haiti");
  });
});

describe("teamVariants", () => {
  it("returns lowercase and normalized for a simple team", () => {
    const variants = teamVariants("Brazil");
    expect(variants).toContain("brazil");
  });

  it("includes aliases for aliased teams", () => {
    const variants = teamVariants("South Korea");
    expect(variants).toContain("south korea");
    expect(variants).toContain("korea republic");
  });

  it("includes reverse alias lookup", () => {
    const variants = teamVariants("Czechia");
    expect(variants).toContain("czech republic");
  });

  it("handles USA alias", () => {
    const variants = teamVariants("USA");
    expect(variants).toContain("united states");
  });
});

describe("matchesTeams", () => {
  it("matches exact team names", () => {
    expect(matchesTeams("mexico vs south africa", "Mexico", "South Africa")).toBe(true);
  });

  it("matches with Polymarket punctuation in title", () => {
    expect(matchesTeams("Mexico vs. South Africa", "Mexico", "South Africa")).toBe(true);
  });

  it("matches aliased teams (schedule -> polymarket)", () => {
    expect(matchesTeams("Korea Republic vs. Czechia", "South Korea", "Czech Republic")).toBe(true);
  });

  it("matches USA vs United States", () => {
    expect(matchesTeams("United States vs. Paraguay", "USA", "Paraguay")).toBe(true);
  });

  it("matches Ivory Coast vs Côte d'Ivoire", () => {
    expect(matchesTeams("Côte d'Ivoire vs. Ecuador", "Ivory Coast", "Ecuador")).toBe(true);
  });

  it("matches Cape Verde vs Cabo Verde", () => {
    expect(matchesTeams("Cabo Verde vs. Saudi Arabia", "Cape Verde", "Saudi Arabia")).toBe(true);
  });

  it("matches Bosnia & Herzegovina vs Bosnia and Herzegovina", () => {
    expect(matchesTeams("Canada vs. Bosnia and Herzegovina", "Canada", "Bosnia & Herzegovina")).toBe(true);
  });

  it("does not match unrelated teams", () => {
    expect(matchesTeams("Brazil vs. Haiti", "Mexico", "South Africa")).toBe(false);
  });
});

describe("isHalftimeEvent", () => {
  it("detects halftime events", () => {
    expect(isHalftimeEvent("Mexico vs. South Africa - Halftime Result")).toBe(true);
  });

  it("rejects non-halftime events", () => {
    expect(isHalftimeEvent("Mexico vs. South Africa")).toBe(false);
  });
});

describe("isExactScoreEvent", () => {
  it("detects exact score events", () => {
    expect(isExactScoreEvent("Mexico vs. South Africa - Exact Score")).toBe(true);
  });

  it("rejects non-exact-score events", () => {
    expect(isExactScoreEvent("Mexico vs. South Africa")).toBe(false);
  });
});

describe("parseOutcomes", () => {
  it("parses valid outcomePrices", () => {
    const markets = [
      { groupItemTitle: "Mexico", outcomePrices: '["0.665", "0.335"]' },
      { groupItemTitle: "South Africa", outcomePrices: '["0.125", "0.875"]' },
    ];
    const result = parseOutcomes(markets);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("Mexico");
    expect(result[0].probability).toBeCloseTo(0.665);
    expect(result[1].label).toBe("South Africa");
    expect(result[1].probability).toBeCloseTo(0.125);
  });

  it("skips markets with null outcomePrices", () => {
    const markets = [
      { groupItemTitle: "Mexico", outcomePrices: null },
      { groupItemTitle: "Draw", outcomePrices: '["0.2", "0.8"]' },
    ];
    const result = parseOutcomes(markets);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Draw");
  });

  it("strips 'Exact Score:' prefix from labels", () => {
    const markets = [
      { groupItemTitle: "Exact Score: 1-0", outcomePrices: '["0.1", "0.9"]' },
    ];
    const result = parseOutcomes(markets);
    expect(result[0].label).toBe("1-0");
  });

  it("skips malformed JSON gracefully", () => {
    const markets = [
      { groupItemTitle: "Mexico", outcomePrices: "not json" },
    ];
    const result = parseOutcomes(markets);
    expect(result).toHaveLength(0);
  });

  it("sorts by probability descending", () => {
    const markets = [
      { groupItemTitle: "A", outcomePrices: '["0.1", "0.9"]' },
      { groupItemTitle: "B", outcomePrices: '["0.8", "0.2"]' },
      { groupItemTitle: "C", outcomePrices: '["0.5", "0.5"]' },
    ];
    const result = parseOutcomes(markets);
    expect(result.map((o) => o.label)).toEqual(["B", "C", "A"]);
  });
});

describe("buildOddsMap", () => {
  const winnerEvent: PolymarketRawEvent = {
    title: "Mexico vs. South Africa",
    slug: "mexico-vs-south-africa",
    markets: [
      { groupItemTitle: "Mexico", outcomePrices: '["0.665", "0.335"]' },
      { groupItemTitle: "Draw (Mexico vs. South Africa)", outcomePrices: '["0.215", "0.785"]' },
      { groupItemTitle: "South Africa", outcomePrices: '["0.125", "0.875"]' },
    ],
  };

  const exactScoreEvent: PolymarketRawEvent = {
    title: "Mexico vs. South Africa - Exact Score",
    slug: "mexico-vs-south-africa-exact-score",
    markets: [
      { groupItemTitle: "Exact Score: 1-0", outcomePrices: '["0.095", "0.905"]' },
      { groupItemTitle: "Exact Score: 2-0", outcomePrices: '["0.16", "0.84"]' },
      { groupItemTitle: "Exact Score: 0-0", outcomePrices: '["0.065", "0.935"]' },
    ],
  };

  const halftimeEvent: PolymarketRawEvent = {
    title: "Mexico vs. South Africa - Halftime Result",
    slug: "mexico-vs-south-africa-halftime-result",
    markets: [
      { groupItemTitle: "Mexico", outcomePrices: '["0.4", "0.6"]' },
    ],
  };

  it("groups winner and exact score under the same key", () => {
    const map = buildOddsMap([winnerEvent, exactScoreEvent]);
    const key = "mexico vs south africa";
    expect(map.has(key)).toBe(true);
    const odds = map.get(key)!;
    expect(odds.winner).toHaveLength(3);
    expect(odds.exactScore).toHaveLength(3);
  });

  it("skips halftime events", () => {
    const map = buildOddsMap([winnerEvent, halftimeEvent]);
    for (const [key] of map) {
      expect(key).not.toContain("halftime");
    }
  });

  it("sorts winner outcomes by probability descending", () => {
    const map = buildOddsMap([winnerEvent]);
    const odds = map.get("mexico vs south africa")!;
    expect(odds.winner[0].label).toBe("Mexico");
    expect(odds.winner[2].label).toBe("South Africa");
  });

  it("sorts exact score outcomes by probability descending", () => {
    const map = buildOddsMap([exactScoreEvent]);
    const odds = map.get("mexico vs south africa")!;
    expect(odds.exactScore[0].label).toBe("2-0");
    expect(odds.exactScore[1].label).toBe("1-0");
    expect(odds.exactScore[2].label).toBe("0-0");
  });

  it("handles empty event list", () => {
    const map = buildOddsMap([]);
    expect(map.size).toBe(0);
  });
});

describe("normalizePlayerName", () => {
  it("strips accents and lowercases", () => {
    expect(normalizePlayerName("Kylian Mbappé")).toBe("kylian mbappe");
    expect(normalizePlayerName("Vinícius Júnior")).toBe("vinicius junior");
    expect(normalizePlayerName("Ousmane Dembélé")).toBe("ousmane dembele");
  });

  it("removes punctuation and collapses spaces", () => {
    expect(normalizePlayerName("Hwang In-Beom")).toBe("hwang in beom");
    expect(normalizePlayerName("  Harry   Kane  ")).toBe("harry kane");
  });
});

describe("playerTokenKey", () => {
  it("is order-independent", () => {
    expect(playerTokenKey("Heung-Min Son")).toBe(playerTokenKey("Son Heung Min"));
  });
});

describe("getGoalCount", () => {
  const tally = new Map<string, ScorerTally>([
    ["kylian mbappe", { name: "Kylian Mbappé", goals: 4 }],
    ["harry kane", { name: "Harry Kane", goals: 2 }],
  ]);

  it("matches accented Polymarket-style names", () => {
    expect(getGoalCount("Kylian Mbappe", tally)).toBe(4);
    expect(getGoalCount("Harry Kane", tally)).toBe(2);
  });

  it("returns 0 for players not in the tally", () => {
    expect(getGoalCount("Lionel Messi", tally)).toBe(0);
  });

  it("falls back to token-set matching for word-order differences", () => {
    const reordered = new Map<string, ScorerTally>([
      ["son heung min", { name: "Son Heung-Min", goals: 3 }],
    ]);
    expect(getGoalCount("Heung-Min Son", reordered)).toBe(3);
  });
});
