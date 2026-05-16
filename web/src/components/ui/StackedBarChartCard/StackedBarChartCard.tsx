import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './StackedBarChartCard.module.css';

export default function StackedBarChartCard({ data, title }: { data: Array<{ name: string; y2026: number; y2027: number; y2028: number }>; title: string }) {
  return <div className={styles.root}><strong>{title}</strong><ResponsiveContainer width='100%' height={260}><BarChart data={data}><CartesianGrid stroke='var(--slate-100)' /><XAxis dataKey='name' /><YAxis /><Tooltip /><Bar dataKey='y2026' stackId='a' fill='var(--color-primary)' /><Bar dataKey='y2027' stackId='a' fill='var(--sce-blue-light)' /><Bar dataKey='y2028' stackId='a' fill='var(--sce-teal)' /></BarChart></ResponsiveContainer></div>;
}
