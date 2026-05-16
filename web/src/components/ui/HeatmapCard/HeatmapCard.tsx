import styles from './HeatmapCard.module.css';

export default function HeatmapCard({ rows, cols, values }: { rows: string[]; cols: string[]; values: Record<string, number> }) {
  return (
    <div className={styles.root}>
      <strong>Heatmap</strong>
      {rows.map((r) => <div key={r}>{cols.map((c) => <span key={c}>{r}/{c}:{values[`${r}-${c}`] ?? 0} </span>)}</div>)}
    </div>
  );
}
