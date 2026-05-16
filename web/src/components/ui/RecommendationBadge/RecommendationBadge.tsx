import styles from './RecommendationBadge.module.css';

export default function RecommendationBadge({ recommendation }: { recommendation: string }) {
  return <span className={styles.root}>{recommendation}</span>;
}
