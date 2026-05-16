import type { PropsWithChildren } from 'react';
import styles from './Toast.module.css';

type ToastProps = PropsWithChildren<{ className?: string }>;

export default function Toast({ children, className }: ToastProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
