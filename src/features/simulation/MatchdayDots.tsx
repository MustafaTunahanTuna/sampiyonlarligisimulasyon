import { MATCHDAY_NUMBERS } from '../../domain/matchdays'
import type { MatchdayNumber } from '../../domain/matchdays'

interface MatchdayDotsProps {
  completed: number
  onReview: (matchday: MatchdayNumber) => void
}

export function MatchdayDots({ completed, onReview }: MatchdayDotsProps) {
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
                title={isPlayed ? `Hafta ${matchday} sonuçlarını gör` : `Hafta ${matchday} oynanmadı`}
                aria-label={
                  isPlayed ? `Hafta ${matchday} sonuçlarını gör` : `Hafta ${matchday} oynanmadı`
                }
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
