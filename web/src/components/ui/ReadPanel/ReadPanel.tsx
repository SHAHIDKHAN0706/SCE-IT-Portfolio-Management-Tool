import type { PropsWithChildren } from 'react';
import styles from './ReadPanel.module.css';

type ReadPanelProps = PropsWithChildren<{ className?: string }>;

export default function ReadPanel({ children, className }: ReadPanelProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
