import styles from './Select.module.css';

type Option = { label: string; value: string };
type Props = { value: string; options: Option[]; onChange: (value: string) => void; className?: string };

export default function Select({ value, options, onChange, className }: Props) {
  return (
    <select className={[styles.select, className].filter(Boolean).join(' ')} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
