import type { Initiative } from '../../types/model';

const tokenize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

const tfidf = (docs: string[][]) => {
  const vocab = Array.from(new Set(docs.flat()));
  const idf = new Map<string, number>();
  vocab.forEach((t) => {
    const df = docs.filter((d) => d.includes(t)).length;
    idf.set(t, Math.log((docs.length + 1) / (df + 1)) + 1);
  });
  return docs.map((doc) => {
    const tf = new Map<string, number>();
    doc.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
    return vocab.map((v) => ((tf.get(v) ?? 0) / doc.length) * (idf.get(v) ?? 0));
  });
};

const cosine = (a: number[], b: number[]) => {
  const dot = a.reduce((acc, v, i) => acc + v * b[i], 0);
  const an = Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));
  const bn = Math.sqrt(b.reduce((acc, v) => acc + v * v, 0));
  return an && bn ? dot / (an * bn) : 0;
};

export interface OverlapCluster { ids: string[]; score: number; }

export function findOverlapClusters(items: Initiative[], threshold = 0.55): OverlapCluster[] {
  const docs = items.map((i) => tokenize(`${i.capability} ${i.outcomes} ${i.classification}`));
  const vectors = tfidf(docs);
  const parent = items.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a: number, b: number) => { parent[find(a)] = find(b); };

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      let sim = cosine(vectors[i], vectors[j]);
      if (items[i].valueStream === items[j].valueStream) sim += 0.15;
      if (items[i].ouSponsor === items[j].ouSponsor) sim += 0.1;
      if (items[i].driver === items[j].driver) sim += 0.1;
      if (sim >= threshold) union(i, j);
    }
  }

  const groups = new Map<number, number[]>();
  items.forEach((_, i) => {
    const root = find(i);
    groups.set(root, [...(groups.get(root) ?? []), i]);
  });

  return Array.from(groups.values())
    .filter((g) => g.length > 1)
    .map((g) => ({ ids: g.map((idx) => items[idx].id), score: Number((g.length / items.length).toFixed(2)) }));
}
