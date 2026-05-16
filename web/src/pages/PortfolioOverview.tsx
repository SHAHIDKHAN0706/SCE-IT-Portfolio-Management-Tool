import type { Initiative } from '../types/model';
import { PageHeader, KPIStrip, KPICard, Section, BarChartCard, DonutChartCard } from '../components/ui';

export default function PortfolioOverview({ items }: { items: Initiative[] }) {
  const total = items.reduce((a, b) => a + b.totalCapitalCost, 0);
  const funded = items.filter((i) => i.funded).length;
  const bar = Object.entries(items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.valueStream]: (acc[i.valueStream] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
  const rec = Object.entries(items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.recommendation]: (acc[i.recommendation] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
  return (
    <>
      <PageHeader eyebrow='EXHIBIT 1' title='Portfolio Overview' subtitle='KPI summary and disposition' />
      <KPIStrip>
        <KPICard label='Initiatives' value={String(items.length)} />
        <KPICard label='Funded' value={String(funded)} />
        <KPICard label='Capital (M)' value={total.toFixed(1)} />
        <KPICard label='Avg BCR' value={(items.reduce((a, b) => a + b.bcr, 0) / Math.max(1, items.length)).toFixed(2)} />
      </KPIStrip>
      <Section><BarChartCard title='Value Stream Breakdown' data={bar} xKey='name' yKey='value' /></Section>
      <Section><DonutChartCard title='Recommendation Disposition' data={rec} /></Section>
    </>
  );
}
