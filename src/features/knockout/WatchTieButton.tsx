interface WatchTieButtonProps {
  label: string
  onWatch: () => void
  compact?: boolean
}

export function WatchTieButton({ label, onWatch, compact = false }: WatchTieButtonProps) {
  return (
    <button
      type="button"
      onClick={onWatch}
      aria-label={label}
      title={label}
      className={`shrink-0 rounded-pill text-muted transition-colors hover:bg-raised hover:text-accent ${
        compact ? 'p-1' : 'p-1.5'
      }`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={compact ? 'size-3.5' : 'size-4'} fill="currentColor">
        <path d="M8 5.5v13l10-6.5-10-6.5Z" />
      </svg>
    </button>
  )
}
