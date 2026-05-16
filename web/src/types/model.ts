export type Driver = 'Cyber-Compliance' | 'Technology Obsolescence' | 'Multi-Driver' | 'Strategy' | 'Business Need' | 'Other';
export type Recommendation = 'CONTINUE' | 'DELAY' | 'CANCEL' | 'REDUCE SCOPE' | `MERGE-WITH:${string}`;

export interface Initiative {
  id: string;
  name: string;
  portfolioName: string;
  valueStream: string;
  funded: boolean;
  fundingStatus: 'Funded' | 'Partially Funded' | 'Unfunded';
  fundingSource: string;
  driver: Driver;
  recommendation: Recommendation;
  bcr: number;
  totalCapitalCost: number;
  goLive: string;
  ouSponsor: string;
  outcomes: string;
  classification: string;
  capability: string;
  dependsOn?: string;
  year2026: number;
  year2027: number;
  year2028: number;
  priorityScore?: number;
  factorContributions?: Record<string, number>;
  explanation?: string;
}

export interface Filters {
  portfolioName: string;
  valueStream: string[];
  fundingStatus: string[];
  driver: string[];
  recommendation: string[];
  bcrThreshold: 'all' | 'hasBcr' | 'gte1' | 'gte2' | 'lt1';
  search: string;
}
