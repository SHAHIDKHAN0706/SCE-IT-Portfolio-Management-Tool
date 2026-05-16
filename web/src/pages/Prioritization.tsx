import { useMemo } from 'react';
import type { Initiative } from '../types/model';
import { PageHeader, DataTable, Slider, Button, PriorityScoreBadge, RecommendationBadge, ExplainabilityPopover, OverlapClusterCard, NetworkGraphCard, Section } from '../components/ui';
import type { Weights } from '../lib/prioritization/score';
import { scoreInitiative, suggestRecommendation } from '../lib/prioritization/score';
import { findOverlapClusters } from '../lib/prioritization/similarity';
import { buildDependencyGraph } from '../lib/prioritization/graph';

export default function Prioritization({ items, weights, onWeightsChange, onSaveWeights, onResetWeights }: { items: Initiative[]; weights: Weights; onWeightsChange: (w: Weights) => void; onSaveWeights: () => void; onResetWeights: () => void }) {
  const scored = useMemo(() => items.map((i) => scoreInitiative(i, weights)).sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)), [items, weights]);
  const clusters = useMemo(() => findOverlapClusters(scored), [scored]);
  const graph = useMemo(() => buildDependencyGraph(scored), [scored]);
  const scoredWithRec = scored.map((i) => {
    const cluster = clusters.find((c) => c.ids.includes(i.id));
    const target = cluster ? cluster.ids.map((id) => scored.find((s) => s.id === id)).sort((a, b) => (b?.priorityScore ?? 0) - (a?.priorityScore ?? 0))[0]?.id : undefined;
    const recommendation = suggestRecommendation(i, target);
    return { ...i, recommendation, explanation: `Score ${i.priorityScore?.toFixed(1)} with weighted factors; cluster: ${cluster ? cluster.ids.join(', ') : 'none'}` };
  });

  return (
    <>
      <PageHeader eyebrow='EXHIBIT 6' title='Prioritization' subtitle='Weights, overlap clusters, and interdependency graph' actions={<><Button onClick={onResetWeights}>Reset to defaults</Button><Button variant='primary' onClick={onSaveWeights}>Save weights</Button></>} />
      <Section>
        {Object.entries(weights).map(([k, v]) => (
          <div key={k}><label>{k}: {v.toFixed(2)}</label><Slider value={v} onChange={(next) => onWeightsChange({ ...weights, [k]: next })} /></div>
        ))}
      </Section>
      <DataTable rows={scoredWithRec} columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Initiative' },
        { key: 'priorityScore', label: 'Score', render: (r) => <PriorityScoreBadge score={Number(r.priorityScore)} /> },
        { key: 'recommendation', label: 'Recommendation', render: (r) => <RecommendationBadge recommendation={String(r.recommendation)} /> },
        { key: 'factorContributions', label: 'Explainability', render: (r) => <ExplainabilityPopover factors={r.factorContributions as Record<string, number>} /> },
      ]} />
      <Section>
        {clusters.map((c, idx) => {
          const members = c.ids.map((id) => scoredWithRec.find((s) => s.id === id)).filter(Boolean) as Initiative[];
          const winner = [...members].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))[0];
          const savings = members.filter((m) => m.id !== winner.id).reduce((a, b) => a + b.totalCapitalCost, 0);
          return <OverlapClusterCard key={idx} title={`Cluster ${idx + 1}`} ids={c.ids} score={c.score} savings={savings} />;
        })}
      </Section>
      <NetworkGraphCard graph={graph} />
      <DataTable rows={graph.links as unknown as Record<string, unknown>[]} columns={[{ key: 'source', label: 'Source' }, { key: 'target', label: 'Target' }, { key: 'type', label: 'Edge Type' }]} />
    </>
  );
}
