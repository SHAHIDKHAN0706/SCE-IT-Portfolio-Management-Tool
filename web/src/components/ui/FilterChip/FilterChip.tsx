import Button from '../Button/Button';

export default function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return <Button size='sm' variant='ghost' onClick={onClear}>{label} ✕</Button>;
}
