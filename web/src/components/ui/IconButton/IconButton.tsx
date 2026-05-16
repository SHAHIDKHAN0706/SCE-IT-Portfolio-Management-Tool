import type { PropsWithChildren } from 'react';
import styles from './IconButton.module.css';

type IconButtonProps = PropsWithChildren<{ className?: string }>;

export default function IconButton({ children, className }: IconButtonProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
