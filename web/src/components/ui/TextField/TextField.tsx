import styles from './TextField.module.css';
export default function TextField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) { return <input className={styles.root} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />; }
