import type { PropsWithChildren } from 'react';
import styles from './AppShell.module.css';

type Props = PropsWithChildren<{ sidebar: React.ReactNode; topbar: React.ReactNode }>;

export default function AppShell({ sidebar, topbar, children }: Props) {
  return (
    <div className={styles.root}>
      {sidebar}
      <div className={styles.main}>
        {topbar}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
