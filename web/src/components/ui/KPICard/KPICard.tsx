import styles from './KPICard.module.css';

type Props = { label: string; value: string; delta?: string };

export default function KPICard({ label, value, delta }: Props) {
  return (
    <div className={styles.root}>
      <div>{label}</div>
      <div className='serif'>{value}</div>
      {delta ? <small>{delta}</small> : null}
    </div>
  );
}
