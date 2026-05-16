import type { PropsWithChildren } from 'react';
import styles from './Drawer.module.css';

type DrawerProps = PropsWithChildren<{ className?: string }>;

export default function Drawer({ children, className }: DrawerProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
