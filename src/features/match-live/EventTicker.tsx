import { clockLabel, commentaryFor } from './commentary'
import { useTranslation } from '../../i18n/useTranslation'
import type { MatchEvent, Side } from '../../domain/engine'
import type { Team } from '../../domain/types'

const TONE_BY_IMPORTANCE: Record<number, string> = {
  0: 'text-dim',
  1: 'text-muted',
  2: 'text-fg',
  3: 'text-highlight font-semibold',
}

interface EventTickerProps {
  events: MatchEvent[]
  teams: Record<Side, Team>
  minImportance: number
}

export function EventTicker({ events, teams, minImportance }: EventTickerProps) {
  const t = useTranslation()
  const visible = events.filter((event) => event.importance >= minImportance).slice(-40).reverse()

  if (visible.length === 0) {
    return <p className="px-1 py-2 text-sm text-muted">{t.live.noEvents}</p>
  }

  return (
    <ol aria-live="polite" className="space-y-0.5">
      {visible.map((event, index) => (
        <li
          key={`${event.second}-${event.kind}-${index}`}
          className="flex items-baseline gap-2.5 rounded-control px-2 py-1.5 odd:bg-surface/40"
        >
          <span className="w-9 shrink-0 text-right font-display text-xs tabular-nums text-muted">
            {clockLabel(event)}
          </span>
          <span className={`text-sm ${TONE_BY_IMPORTANCE[event.importance]}`}>
            {commentaryFor(event, teams, t)}
          </span>
        </li>
      ))}
    </ol>
  )
}
