import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>;

export default function Button({ children, variant = 'secondary', size = 'md', ...props }: Props) {
  return <button {...props} className={[styles.button, styles[variant], styles[size], props.className].filter(Boolean).join(' ')}>{children}</button>;
}
