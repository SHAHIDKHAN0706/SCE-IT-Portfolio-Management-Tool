import type { PropsWithChildren } from 'react';
import styles from './EmptyState.module.css';

type EmptyStateProps = PropsWithChildren<{ className?: string }>;

export default function EmptyState({ children, className }: EmptyStateProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
