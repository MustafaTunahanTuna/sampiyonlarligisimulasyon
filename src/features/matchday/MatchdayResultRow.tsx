import { ClubCrest } from '../../components/ClubCrest'
import { QUALIFICATION_TEXT_TONE } from '../standings/qualificationTone'
import type { Score, StandingRow, Team } from '../../domain/types'

interface MatchdayResultRowProps {
  homeTeam: Team
  awayTeam: Team
  score: Score
  homeStanding: StandingRow | null
  awayStanding: StandingRow | null
  favouriteTeamId: string | null
  revealDelay: number
  onWatch: (() => void) | null
}

function sideTone(isWinner: boolean, isFavourite: boolean): string {
  if (isFavourite) return 'text-fg font-bold'
  return isWinner ? 'text-fg' : 'text-muted'
}

function PositionBadge({ standing }: { standing: StandingRow | null }) {
  if (standing === null) return <span aria-hidden="true" />
  return (
    <span
      title={`${standing.team.name} · puan tablosunda ${standing.position}. sıra`}
      className={`text-center font-display text-xs font-bold tabular-nums ${QUALIFICATION_TEXT_TONE[standing.qualification]}`}
    >
      {standing.position}
    </span>
  )
}

export function MatchdayResultRow({
  homeTeam,
  awayTeam,
  score,
  homeStanding,
  awayStanding,
  favouriteTeamId,
  revealDelay,
  onWatch,
}: MatchdayResultRowProps) {
  const involvesFavourite = homeTeam.id === favouriteTeamId || awayTeam.id === favouriteTeamId

  return (
    <li
      style={{ animationDelay: `${revealDelay}ms` }}
      className={`animate-result-in grid grid-cols-[1.25rem_1fr_auto_1fr_1.25rem] items-center gap-3 rounded-control px-3 py-2.5 ${
        involvesFavourite ? 'bg-accent/10 ring-1 ring-accent/30' : 'odd:bg-surface/40'
      }`}
    >
      <PositionBadge standing={homeStanding} />

      <div className="flex min-w-0 flex-row-reverse items-center justify-start gap-2.5 text-right">
        <ClubCrest team={homeTeam} size={26} />
        <span
          className={`truncate text-sm ${sideTone(score.home > score.away, homeTeam.id === favouriteTeamId)}`}
        >
          {homeTeam.name}
        </span>
      </div>

      <span
        style={{ animationDelay: `${revealDelay + 90}ms` }}
        className="animate-score-pop shrink-0 rounded-control bg-canvas/80 px-2.5 py-1 font-display text-lg font-extrabold tabular-nums text-fg ring-1 ring-line"
      >
        {score.home}–{score.away}
      </span>

      <div className="flex min-w-0 items-center gap-2.5">
        <ClubCrest team={awayTeam} size={26} />
        <span
          className={`truncate text-sm ${sideTone(score.away > score.home, awayTeam.id === favouriteTeamId)}`}
        >
          {awayTeam.name}
        </span>
        {onWatch !== null && (
          <button
            type="button"
            onClick={onWatch}
            aria-label={`${homeTeam.name} - ${awayTeam.name} maçını izle`}
            title="Maçı izle"
            className="ml-auto shrink-0 rounded-pill p-1.5 text-muted transition-colors hover:bg-raised hover:text-accent"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
              <path d="M8 5.5v13l10-6.5-10-6.5Z" />
            </svg>
          </button>
        )}
      </div>

      <PositionBadge standing={awayStanding} />
    </li>
  )
}
