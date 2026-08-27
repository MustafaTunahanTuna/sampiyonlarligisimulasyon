interface StarballProps {
  className?: string
}

export function Starball({ className }: StarballProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2.5l2.9 5.9 6.5 1-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-1z"
        fill="currentColor"
      />
    </svg>
  )
}
