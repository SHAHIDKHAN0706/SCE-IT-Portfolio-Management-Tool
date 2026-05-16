import type { PropsWithChildren } from 'react';
import styles from './TopBar.module.css';

type Props = PropsWithChildren<{ title: string }>;

export default function TopBar({ title, children }: Props) {
  return (
    <header className={styles.root}>
      <div className={styles.left}>SCE • {title}</div>
      <div className={styles.right}>{children}</div>
    </header>
  );
}
