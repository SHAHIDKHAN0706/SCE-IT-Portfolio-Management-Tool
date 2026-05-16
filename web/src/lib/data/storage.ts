import type { Initiative } from '../../types/model';

const KEY = 'sce-portfolio-dataset';
const WEIGHT_KEY = 'sce-priority-weights';

export const loadDataset = async (): Promise<Initiative[]> => {
  const local = localStorage.getItem(KEY);
  if (local) return JSON.parse(local) as Initiative[];
  const response = await fetch('/sample/snapshot.json');
  return response.json() as Promise<Initiative[]>;
};

export const saveDataset = (items: Initiative[]) => localStorage.setItem(KEY, JSON.stringify(items));
export const resetDataset = () => localStorage.removeItem(KEY);

export const loadWeights = <T,>(defaults: T): T => {
  const local = localStorage.getItem(WEIGHT_KEY);
  return local ? (JSON.parse(local) as T) : defaults;
};

export const saveWeights = <T,>(weights: T) => localStorage.setItem(WEIGHT_KEY, JSON.stringify(weights));
