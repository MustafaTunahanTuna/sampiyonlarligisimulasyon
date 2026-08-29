import { useTranslation } from '../i18n/useTranslation'
import type { PotNumber } from '../domain/types'

interface PotBadgeProps {
  pot: PotNumber
}

export function PotBadge({ pot }: PotBadgeProps) {
  const t = useTranslation()

  return (
    <span className="eyebrow text-muted tabular-nums">
      {t.team.pot} {String(pot).padStart(2, '0')}
    </span>
  )
}
