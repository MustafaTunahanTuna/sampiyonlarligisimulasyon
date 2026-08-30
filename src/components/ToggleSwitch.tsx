interface ToggleSwitchProps {
  checked: boolean
  label: string
  stateText: string
  onChange: (next: boolean) => void
}

export function ToggleSwitch({ checked, label, stateText, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex shrink-0 items-center gap-2.5 rounded-pill"
    >
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 rounded-pill transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-raised ring-1 ring-line-strong'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-pill transition-transform duration-200 ease-out ${
            checked ? 'translate-x-5 bg-canvas' : 'bg-muted'
          }`}
        />
      </span>
      <span
        className={`font-display text-xs font-bold uppercase tracking-wide ${
          checked ? 'text-accent' : 'text-muted'
        }`}
      >
        {stateText}
      </span>
    </button>
  )
}
