import type { PropsWithChildren } from 'react';
import styles from './Tabs.module.css';

type TabsProps = PropsWithChildren<{ className?: string }>;

export default function Tabs({ children, className }: TabsProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
