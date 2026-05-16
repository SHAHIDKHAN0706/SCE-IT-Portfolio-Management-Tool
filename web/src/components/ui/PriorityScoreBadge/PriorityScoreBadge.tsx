import styles from './PriorityScoreBadge.module.css';

export default function PriorityScoreBadge({ score }: { score: number }) {
  const band = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
  return <span className={[styles.root, styles[band]].join(' ')}>{score.toFixed(1)}</span>;
}
