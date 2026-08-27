interface ScoreInputProps {
  value: number | null
  label: string
  isManual: boolean
  onChange: (value: number | null) => void
}

const MAX_GOALS = 19

function parseGoals(raw: string): number | null {
  if (raw === '') return null
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return null
  return Math.min(Math.max(parsed, 0), MAX_GOALS)
}

export function ScoreInput({ value, label, isManual, onChange }: ScoreInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={label}
      value={value === null ? '' : String(value)}
      placeholder="–"
      onChange={(event) => onChange(parseGoals(event.target.value))}
      className={`w-11 rounded-control border py-1.5 text-center font-display text-xl font-extrabold tabular-nums transition-all placeholder:font-normal placeholder:text-dim focus:border-accent focus:outline-none sm:w-12 sm:text-2xl ${
        isManual
          ? 'border-accent/60 bg-accent/10 text-fg'
          : 'border-line-strong/70 bg-surface/40 text-fg group-hover:border-line-strong'
      }`}
    />
  )
}
