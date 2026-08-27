import { MATCHDAY_NUMBERS } from '../../domain/matchdays'
import type { MatchdayNumber } from '../../domain/matchdays'

interface MatchdayProgressProps {
  current: MatchdayNumber
  completed: number
}

export function MatchdayProgress({ current, completed }: MatchdayProgressProps) {
  return (
    <ol className="flex items-center gap-1.5" aria-label={`Hafta ${current} / ${MATCHDAY_NUMBERS.length}`}>
      {MATCHDAY_NUMBERS.map((matchday) => (
        <li
          key={matchday}
          aria-current={matchday === current ? 'step' : undefined}
          className={`h-1 flex-1 rounded-pill transition-colors ${
            matchday === current
              ? 'bg-accent'
              : matchday <= completed
                ? 'bg-accent/40'
                : 'bg-line-strong'
          }`}
        />
      ))}
    </ol>
  )
}
