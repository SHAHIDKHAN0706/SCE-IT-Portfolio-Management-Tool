import type { Initiative } from '../types/model';
import { PageHeader, DataTable } from '../components/ui';

export default function InitiativesRegister({ items }: { items: Initiative[] }) {
  return <><PageHeader eyebrow='EXHIBIT 4' title='Initiatives Register' subtitle='Filtered initiative listing' /><DataTable rows={items} columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Initiative' }, { key: 'portfolioName', label: 'Portfolio' }, { key: 'valueStream', label: 'Value Stream' }, { key: 'bcr', label: 'BCR' }, { key: 'totalCapitalCost', label: 'Capital (M)' }, { key: 'recommendation', label: 'Recommendation' }]} /></>;
}
