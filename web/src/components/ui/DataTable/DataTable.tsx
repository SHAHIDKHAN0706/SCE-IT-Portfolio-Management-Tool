import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import Button from '../Button/Button';
import styles from './DataTable.module.css';

type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode };
type Props<T extends object> = { rows: T[]; columns: Column<T>[] };

export default function DataTable<T extends object>({ rows, columns }: Props<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [ascending, setAscending] = useState(true);
  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortKey] ?? '');
      const bv = String((b as Record<string, unknown>)[sortKey] ?? '');
      return ascending ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true });
    });
  }, [rows, sortKey, ascending]);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => {
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'table');
          XLSX.writeFile(wb, 'export.csv', { bookType: 'csv' });
        }}>Export CSV</Button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => <th key={String(c.key)} className={styles.th}><button onClick={() => { setAscending(sortKey === c.key ? !ascending : true); setSortKey(String(c.key)); }}>{c.label}</button></th>)}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} className={styles.row}>
              {columns.map((c) => <td key={String(c.key)} className={styles.td}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[String(c.key)] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
