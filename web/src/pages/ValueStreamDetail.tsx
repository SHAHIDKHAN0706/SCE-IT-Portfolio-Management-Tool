import type { Initiative } from '../types/model';
import { PageHeader, DataTable } from '../components/ui';

export default function ValueStreamDetail({ items }: { items: Initiative[] }) {
  const rows = Object.entries(items.reduce<Record<string, { count: number; avgBcr: number; cap: number }>>((acc, i) => {
    const prev = acc[i.valueStream] ?? { count: 0, avgBcr: 0, cap: 0 };
    const count = prev.count + 1;
    acc[i.valueStream] = { count, avgBcr: (prev.avgBcr * prev.count + i.bcr) / count, cap: prev.cap + i.totalCapitalCost };
    return acc;
  }, {})).map(([valueStream, v]) => ({ valueStream, ...v }));
  return <><PageHeader eyebrow='EXHIBIT 3' title='Value Stream Detail' subtitle='Scorecard by value stream' /><DataTable rows={rows} columns={[{ key: 'valueStream', label: 'Value Stream' }, { key: 'count', label: 'Count' }, { key: 'avgBcr', label: 'Avg BCR' }, { key: 'cap', label: 'Capital (M)' }]} /></>;
}
