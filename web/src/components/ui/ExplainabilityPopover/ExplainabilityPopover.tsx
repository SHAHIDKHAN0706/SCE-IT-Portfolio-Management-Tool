import styles from './ExplainabilityPopover.module.css';

export default function ExplainabilityPopover({ factors }: { factors?: Record<string, number> }) {
  return (
    <details className={styles.root}>
      <summary>Explain</summary>
      {Object.entries(factors ?? {}).map(([k, v]) => <div key={k}>{k}: {(v * 100).toFixed(1)}%</div>)}
    </details>
  );
}
