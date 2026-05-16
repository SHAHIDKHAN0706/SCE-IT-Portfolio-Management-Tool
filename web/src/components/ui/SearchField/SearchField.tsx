import TextField from '../TextField/TextField';
export default function SearchField(props: { value: string; onChange: (v: string) => void; placeholder?: string }) { return <TextField {...props} />; }
