import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './BarChartCard.module.css';

export default function BarChartCard({ data, xKey, yKey, title }: { data: Record<string, unknown>[]; xKey: string; yKey: string; title: string }) {
  return <div className={styles.root}><strong>{title}</strong><ResponsiveContainer width='100%' height={260}><BarChart data={data}><CartesianGrid stroke='var(--slate-100)' /><XAxis dataKey={xKey} /><YAxis /><Tooltip /><Bar dataKey={yKey} fill='var(--color-primary)' /></BarChart></ResponsiveContainer></div>;
}
