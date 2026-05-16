import type { PropsWithChildren } from 'react';
import styles from './Skeleton.module.css';

type SkeletonProps = PropsWithChildren<{ className?: string }>;

export default function Skeleton({ children, className }: SkeletonProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
