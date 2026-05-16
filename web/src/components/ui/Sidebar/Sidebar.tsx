import { NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import styles from './Sidebar.module.css';

type Props = PropsWithChildren<{ items: Array<{ to: string; label: string }> }>;

export default function Sidebar({ items, children }: Props) {
  return (
    <aside className={styles.root}>
      <nav className={styles.nav}>
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')}>{i.label}</NavLink>
        ))}
      </nav>
      {children}
    </aside>
  );
}
