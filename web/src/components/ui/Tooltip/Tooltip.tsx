import type { PropsWithChildren } from 'react';
import styles from './Tooltip.module.css';

type TooltipProps = PropsWithChildren<{ className?: string }>;

export default function Tooltip({ children, className }: TooltipProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
