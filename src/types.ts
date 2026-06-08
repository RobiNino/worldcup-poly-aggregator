export interface Outcome {
  name: string;
  probability: number;
  volume: number;
}

export interface Market {
  question: string;
  outcomes: Outcome[];
}

export interface OddEntry {
  label: string;
  probability: number;
}

export interface PolymarketOdds {
  winner: OddEntry[];
  exactScore: OddEntry[];
  slug?: string;
  exactScoreSlug?: string;
}

export interface PolymarketRawMarket {
  groupItemTitle: string;
  outcomePrices: string | null;
}

export interface PolymarketRawEvent {
  title: string;
  slug: string;
  markets: PolymarketRawMarket[];
}

export interface RawMatch {
  date: string;
  time: string;
  team1: string;
  team2: string;
  score?: { ft: number[] };
  group?: string;
  round: string;
  ground?: string;
}

export interface Round {
  name: string;
  matches: RawMatch[];
}

export interface ScheduleData {
  name: string;
  matches: RawMatch[];
}
