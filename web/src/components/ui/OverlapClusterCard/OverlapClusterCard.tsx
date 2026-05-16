import styles from './OverlapClusterCard.module.css';

export default function OverlapClusterCard({ title, ids, score, savings }: { title: string; ids: string[]; score: number; savings: number }) {
  return <div className={styles.root}><strong>{title}</strong><div>Members: {ids.join(', ')}</div><div>Similarity: {Math.round(score * 100)}%</div><div>Est. savings: ${savings.toFixed(1)}M</div></div>;
}
