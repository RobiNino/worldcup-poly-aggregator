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

export interface GoalEntry {
  name: string;
  minute?: string;
  penalty?: boolean;
  owngoal?: boolean;
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
  goals1?: GoalEntry[];
  goals2?: GoalEntry[];
}

export interface ScorerTally {
  name: string;
  goals: number;
}

export interface Round {
  name: string;
  matches: RawMatch[];
}

export interface ScheduleData {
  name: string;
  matches: RawMatch[];
}
