import type { Initiative } from '../types/model';
import { PageHeader, Section, StackedBarChartCard } from '../components/ui';

export default function FundingGapAnalysis({ items }: { items: Initiative[] }) {
  const data = Object.entries(items.reduce<Record<string, { y2026: number; y2027: number; y2028: number }>>((acc, i) => {
    const prev = acc[i.valueStream] ?? { y2026: 0, y2027: 0, y2028: 0 };
    acc[i.valueStream] = { y2026: prev.y2026 + i.year2026, y2027: prev.y2027 + i.year2027, y2028: prev.y2028 + i.year2028 };
    return acc;
  }, {})).map(([name, v]) => ({ name, ...v }));
  return <><PageHeader eyebrow='EXHIBIT 2' title='Funding Gap Analysis' subtitle='Stacked demand by year and value stream' /><Section><StackedBarChartCard title='Funding by Value Stream (M)' data={data} /></Section></>;
}
