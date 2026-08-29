import { MATCHDAY_NUMBERS } from '../../domain/matchdays'
import { useTranslation } from '../../i18n/useTranslation'
import type { MatchdayNumber } from '../../domain/matchdays'
import type { Messages } from '../../i18n/messages/messages'

function dotLabel(matchday: MatchdayNumber, isPlayed: boolean, t: Messages): string {
  return isPlayed ? t.matchday.dotPlayed(matchday) : t.matchday.dotUnplayed(matchday)
}

interface MatchdayDotsProps {
  completed: number
  onReview: (matchday: MatchdayNumber) => void
}

export function MatchdayDots({ completed, onReview }: MatchdayDotsProps) {
  const t = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <ol className="flex items-center gap-1">
        {MATCHDAY_NUMBERS.map((matchday) => {
          const isPlayed = matchday <= completed
          return (
            <li key={matchday}>
              <button
                type="button"
                disabled={!isPlayed}
                onClick={() => onReview(matchday)}
                title={dotLabel(matchday, isPlayed, t)}
                aria-label={dotLabel(matchday, isPlayed, t)}
                className={`size-2.5 rounded-pill transition-all ${
                  isPlayed
                    ? 'bg-accent hover:scale-125 hover:bg-fg'
                    : 'bg-line-strong'
                }`}
              />
            </li>
          )
        })}
      </ol>
      <span className="eyebrow text-muted tabular-nums">
        <span className="text-fg">{completed}</span>/{MATCHDAY_NUMBERS.length}
      </span>
    </div>
  )
}
