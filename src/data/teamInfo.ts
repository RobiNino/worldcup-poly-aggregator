export interface TeamInfo {
  fifaRank: number;
  squadValueEur: number;
}

// FIFA Men's World Ranking as of the 11 June 2026 update.
// Squad values are Transfermarkt total market values for the 26-player
// World Cup 2026 rosters, in EUR. Both are static snapshots.
export const TEAM_INFO: Record<string, TeamInfo> = {
  "argentina": { fifaRank: 1, squadValueEur: 807_500_000 },
  "spain": { fifaRank: 2, squadValueEur: 1_220_000_000 },
  "france": { fifaRank: 3, squadValueEur: 1_520_000_000 },
  "england": { fifaRank: 4, squadValueEur: 1_360_000_000 },
  "portugal": { fifaRank: 5, squadValueEur: 1_010_000_000 },
  "brazil": { fifaRank: 6, squadValueEur: 928_200_000 },
  "morocco": { fifaRank: 7, squadValueEur: 447_700_000 },
  "netherlands": { fifaRank: 8, squadValueEur: 754_200_000 },
  "belgium": { fifaRank: 9, squadValueEur: 547_500_000 },
  "germany": { fifaRank: 10, squadValueEur: 947_000_000 },
  "croatia": { fifaRank: 11, squadValueEur: 387_300_000 },
  "colombia": { fifaRank: 13, squadValueEur: 302_350_000 },
  "mexico": { fifaRank: 14, squadValueEur: 191_850_000 },
  "senegal": { fifaRank: 15, squadValueEur: 478_100_000 },
  "uruguay": { fifaRank: 16, squadValueEur: 359_300_000 },
  "usa": { fifaRank: 17, squadValueEur: 385_650_000 },
  "japan": { fifaRank: 18, squadValueEur: 270_850_000 },
  "switzerland": { fifaRank: 19, squadValueEur: 332_500_000 },
  "iran": { fifaRank: 20, squadValueEur: 32_050_000 },
  "turkey": { fifaRank: 22, squadValueEur: 473_700_000 },
  "ecuador": { fifaRank: 23, squadValueEur: 368_700_000 },
  "austria": { fifaRank: 24, squadValueEur: 245_200_000 },
  "south korea": { fifaRank: 25, squadValueEur: 139_050_000 },
  "australia": { fifaRank: 27, squadValueEur: 77_450_000 },
  "algeria": { fifaRank: 28, squadValueEur: 256_900_000 },
  "egypt": { fifaRank: 29, squadValueEur: 116_480_000 },
  "canada": { fifaRank: 30, squadValueEur: 198_650_000 },
  "norway": { fifaRank: 31, squadValueEur: 589_900_000 },
  "ivory coast": { fifaRank: 33, squadValueEur: 522_100_000 },
  "panama": { fifaRank: 34, squadValueEur: 34_550_000 },
  "sweden": { fifaRank: 38, squadValueEur: 406_080_000 },
  "czech republic": { fifaRank: 40, squadValueEur: 188_180_000 },
  "paraguay": { fifaRank: 41, squadValueEur: 153_650_000 },
  "scotland": { fifaRank: 42, squadValueEur: 170_250_000 },
  "tunisia": { fifaRank: 45, squadValueEur: 69_950_000 },
  "dr congo": { fifaRank: 46, squadValueEur: 143_900_000 },
  "uzbekistan": { fifaRank: 50, squadValueEur: 85_330_000 },
  "qatar": { fifaRank: 56, squadValueEur: 19_930_000 },
  "iraq": { fifaRank: 57, squadValueEur: 21_200_000 },
  "south africa": { fifaRank: 60, squadValueEur: 49_250_000 },
  "saudi arabia": { fifaRank: 61, squadValueEur: 40_680_000 },
  "jordan": { fifaRank: 63, squadValueEur: 20_300_000 },
  "bosnia & herzegovina": { fifaRank: 64, squadValueEur: 146_400_000 },
  "cape verde": { fifaRank: 67, squadValueEur: 49_250_000 },
  "ghana": { fifaRank: 73, squadValueEur: 234_500_000 },
  "curaçao": { fifaRank: 82, squadValueEur: 25_780_000 },
  "haiti": { fifaRank: 83, squadValueEur: 55_900_000 },
  "new zealand": { fifaRank: 85, squadValueEur: 34_450_000 },
};

// Maps alternate display names to the canonical keys used in TEAM_INFO.
const NAME_ALIASES: Record<string, string> = {
  "korea republic": "south korea",
  "czechia": "czech republic",
  "bosnia and herzegovina": "bosnia & herzegovina",
  "bosnia": "bosnia & herzegovina",
  "bosnia-herzegovina": "bosnia & herzegovina",
  "united states": "usa",
  "türkiye": "turkey",
  "turkiye": "turkey",
  "côte d'ivoire": "ivory coast",
  "cote d'ivoire": "ivory coast",
  "cote divoire": "ivory coast",
  "cabo verde": "cape verde",
  "curacao": "curaçao",
};

export function getTeamInfo(team: string): TeamInfo | undefined {
  const lower = team.toLowerCase();
  const key = NAME_ALIASES[lower] ?? lower;
  return TEAM_INFO[key];
}

export function formatSquadValue(eur: number): string {
  if (eur >= 1_000_000_000) return `€${(eur / 1_000_000_000).toFixed(2)}bn`;
  return `€${Math.round(eur / 1_000_000)}m`;
}
