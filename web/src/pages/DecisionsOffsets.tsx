import type { Initiative } from '../types/model';
import { PageHeader, DonutChartCard, DataTable, Section } from '../components/ui';

export default function DecisionsOffsets({ items }: { items: Initiative[] }) {
  const donut = Object.entries(items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.recommendation]: (acc[i.recommendation] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
  const atRisk = items.filter((i) => !i.funded).reduce((a, b) => a + b.totalCapitalCost, 0);
  const offsets = items.filter((i) => i.recommendation === 'CANCEL' || i.recommendation === 'REDUCE SCOPE').map((i) => ({ id: i.id, initiative: i.name, offset: i.totalCapitalCost }));
  return <><PageHeader eyebrow='EXHIBIT 5' title='Decisions & Offsets' subtitle={`Capital at risk: ${atRisk.toFixed(1)}M`} /><Section><DonutChartCard title='Disposition Mix' data={donut} /></Section><DataTable rows={offsets} columns={[{ key: 'id', label: 'ID' }, { key: 'initiative', label: 'Initiative' }, { key: 'offset', label: 'Offset (M)' }]} /></>;
}
