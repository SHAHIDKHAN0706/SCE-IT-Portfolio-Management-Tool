import styles from './Slider.module.css';

type Props = { value: number; min?: number; max?: number; step?: number; onChange: (value: number) => void };

export default function Slider({ value, min = 0, max = 1, step = 0.01, onChange }: Props) {
  return <input className={styles.root} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />;
}
