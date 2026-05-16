import type { PropsWithChildren } from 'react';
import styles from './PageHeader.module.css';

type Props = PropsWithChildren<{ eyebrow: string; title: string; subtitle: string; actions?: React.ReactNode }>;

export default function PageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <div className={styles.root}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h1 className={[styles.title, 'serif'].join(' ')}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}
