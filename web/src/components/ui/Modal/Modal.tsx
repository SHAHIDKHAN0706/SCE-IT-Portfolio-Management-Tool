import type { PropsWithChildren } from 'react';
import styles from './Modal.module.css';

type ModalProps = PropsWithChildren<{ className?: string }>;

export default function Modal({ children, className }: ModalProps) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')}>{children}</div>;
}
