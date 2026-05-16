import defaults from './weights.json';
import type { Initiative, Recommendation } from '../../types/model';

export type Weights = Record<keyof typeof defaults, number>;

const driverMap: Record<string, number> = {
  'Cyber-Compliance': 1,
  'Technology Obsolescence': 0.85,
  'Multi-Driver': 0.75,
  Strategy: 0.7,
  'Business Need': 0.55,
  Other: 0.3,
};

const recSignal: Record<string, number> = {
  CONTINUE: 1,
  DELAY: 0.5,
  CANCEL: 0,
  'REDUCE SCOPE': 0.4,
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export const normalizeWeights = (weights: Weights): Weights => {
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / total])) as Weights;
};

export function scoreInitiative(item: Initiative, weights: Weights): Initiative {
  const today = new Date();
  const goLive = new Date(item.goLive);
  const months = Math.max(1, (goLive.getFullYear() - today.getFullYear()) * 12 + (goLive.getMonth() - today.getMonth()));
  const factorContributions = {
    bcr: clamp(item.bcr / 3),
    driverUrgency: driverMap[item.driver] ?? 0.3,
    fundingPressure: item.funded ? 1 : item.fundingStatus === 'Partially Funded' ? 0.5 : 0,
    strategicAlignment: item.driver === 'Cyber-Compliance' || item.driver === 'Strategy' ? 1 : 0.6,
    timeToGoLive: clamp(1 - months / 48),
    capitalEfficiency: clamp(1 - item.totalCapitalCost / 120),
    recommendationSignal: recSignal[item.recommendation] ?? 0.5,
  };
  const normalized = normalizeWeights(weights);
  const score = Object.entries(factorContributions).reduce((acc, [k, v]) => acc + v * normalized[k as keyof Weights], 0) * 100;
  return {
    ...item,
    priorityScore: Number(score.toFixed(1)),
    factorContributions,
  };
}

export function suggestRecommendation(item: Initiative, mergeTarget?: string): Recommendation {
  if (mergeTarget && mergeTarget !== item.id) return `MERGE-WITH:${mergeTarget}`;
  if ((item.priorityScore ?? 0) >= 70 && item.funded) return 'CONTINUE';
  if ((item.priorityScore ?? 0) < 40 && item.driver !== 'Cyber-Compliance') return 'CANCEL';
  if ((item.priorityScore ?? 0) >= 40 && (item.priorityScore ?? 0) <= 69 && !item.funded) return 'DELAY';
  if ((item.priorityScore ?? 0) >= 40 && (item.priorityScore ?? 0) <= 69 && item.totalCapitalCost > 60) return 'REDUCE SCOPE';
  return 'CONTINUE';
}
