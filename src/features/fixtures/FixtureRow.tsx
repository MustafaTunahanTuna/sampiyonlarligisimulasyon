import { ScoreInput } from './ScoreInput'
import { TeamSide } from './TeamSide'
import { OUTCOME_LABEL, OUTCOME_SHORT, formatKickOff } from './matchPresentation'
import type { Fixture, Score, Team } from '../../domain/types'

const OUTCOME_TONE: Record<string, string> = {
  WIN: 'bg-home/15 text-home ring-home/35',
  DRAW: 'bg-surface text-muted ring-line-strong',
  LOSS: 'bg-highlight/12 text-highlight ring-highlight/30',
}

interface FixtureRowProps {
  fixture: Fixture
  team: Team
  order: number
  isManual: boolean
  onScoreChange: (score: Score | null) => void
}

export function FixtureRow({ fixture, team, order, isManual, onScoreChange }: FixtureRowProps) {
  const isHome = fixture.venue === 'HOME'
  const homeTeam = isHome ? team : fixture.opponent
  const awayTeam = isHome ? fixture.opponent : team
  const homeGoals = isHome ? fixture.goalsFor : fixture.goalsAgainst
  const awayGoals = isHome ? fixture.goalsAgainst : fixture.goalsFor
  const opponentMeta = `${fixture.opponent.countryName} · ${fixture.opponent.pot}. torba`

  const changeSide = (side: 'home' | 'away', next: number | null) => {
    const home = side === 'home' ? next : homeGoals
    const away = side === 'away' ? next : awayGoals
    if (home === null && away === null) {
      onScoreChange(null)
      return
    }
    onScoreChange({ home: home ?? 0, away: away ?? 0 })
  }

  return (
    <article className="group grid grid-cols-[2.5rem_1fr] items-center gap-x-3 gap-y-3 rounded-panel px-2 py-4 transition-colors hover:bg-surface/60 sm:grid-cols-[3rem_1fr_4.5rem] sm:gap-x-4 sm:px-3">
      <div className="flex flex-col gap-1 sm:gap-1.5">
        <span className="font-display text-sm font-extrabold tabular-nums text-dim">
          {String(order).padStart(2, '0')}
        </span>
        <span className={`eyebrow ${isHome ? 'text-home' : 'text-away'}`}>
          {isHome ? 'Ev' : 'Dep'}
        </span>
      </div>

      <div className="col-start-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
        <TeamSide
          team={homeTeam}
          align="end"
          isFavourite={homeTeam.id === team.id}
          meta={isHome ? undefined : opponentMeta}
        />

        <div className="flex shrink-0 items-center gap-1.5">
          <ScoreInput
            value={homeGoals}
            label={`${homeTeam.name} golü`}
            isManual={isManual}
            onChange={(next) => changeSide('home', next)}
          />
          <span className="text-dim">–</span>
          <ScoreInput
            value={awayGoals}
            label={`${awayTeam.name} golü`}
            isManual={isManual}
            onChange={(next) => changeSide('away', next)}
          />
        </div>

        <TeamSide
          team={awayTeam}
          align="start"
          isFavourite={awayTeam.id === team.id}
          meta={isHome ? opponentMeta : undefined}
        />
      </div>

      <div className="col-span-2 flex items-center justify-end gap-2 sm:col-span-1 sm:col-start-3">
        {fixture.match.kickOff !== null && (
          <span className="truncate text-xs text-dim">{formatKickOff(fixture.match.kickOff)}</span>
        )}
        {fixture.outcome !== null && (
          <span
            title={OUTCOME_LABEL[fixture.outcome]}
            className={`inline-flex size-8 items-center justify-center rounded-pill font-display text-sm font-extrabold ring-1 ${OUTCOME_TONE[fixture.outcome]}`}
          >
            {OUTCOME_SHORT[fixture.outcome]}
          </span>
        )}
      </div>
    </article>
  )
}
