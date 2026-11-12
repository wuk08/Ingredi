interface Props {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
}

/** Filter/choice chip: muted at rest, forest green with a white 600 label when selected. */
export function Chip({ label, selected = false, onToggle }: Props) {
  return (
    <button type="button" className="chip" aria-pressed={selected} onClick={onToggle}>
      {label}
    </button>
  );
}
