import type { PotNumber } from '../domain/types'

interface PotBadgeProps {
  pot: PotNumber
}

export function PotBadge({ pot }: PotBadgeProps) {
  return (
    <span className="eyebrow text-muted tabular-nums">
      Torba {String(pot).padStart(2, '0')}
    </span>
  )
}
