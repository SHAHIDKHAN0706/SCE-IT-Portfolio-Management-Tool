import type { PropsWithChildren } from 'react';
import styles from './ExhibitFrame.module.css';

type ExhibitFrameProps = PropsWithChildren<{ className?: string }>;

export default function ExhibitFrame({ children, className }: ExhibitFrameProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
