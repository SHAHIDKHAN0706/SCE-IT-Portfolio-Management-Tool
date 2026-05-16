import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './DonutChartCard.module.css';

const colors = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)'];

export default function DonutChartCard({ data, title, valueKey = 'value', nameKey = 'name' }: { data: Record<string, unknown>[]; title: string; valueKey?: string; nameKey?: string }) {
  return <div className={styles.root}><strong>{title}</strong><ResponsiveContainer width='100%' height={260}><PieChart><Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={50} outerRadius={90}>{data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>;
}
