import styles from './MultiSelect.module.css';

type Option = { label: string; value: string };
type Props = { value: string[]; options: Option[]; onChange: (value: string[]) => void };

export default function MultiSelect({ value, options, onChange }: Props) {
  return (
    <div className={styles.wrap}>
      {options.map((o) => (
        <label key={o.value} className={styles.item}>
          <input type="checkbox" checked={value.includes(o.value)} onChange={(e) => onChange(e.target.checked ? [...value, o.value] : value.filter((v) => v !== o.value))} /> {o.label}
        </label>
      ))}
    </div>
  );
}
