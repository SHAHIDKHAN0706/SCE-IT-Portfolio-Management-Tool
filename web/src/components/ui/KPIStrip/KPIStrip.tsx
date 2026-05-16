import type { PropsWithChildren } from 'react';
import styles from './KPIStrip.module.css';

export default function KPIStrip({ children }: PropsWithChildren) {
  return <div className={styles.root}>{children}</div>;
}
