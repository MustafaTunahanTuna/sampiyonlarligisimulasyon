import { FixtureRow } from './FixtureRow'
import { useTranslation } from '../../i18n/useTranslation'
import { usePredictions } from '../../state/usePredictions'
import type { Fixture, Score, Team } from '../../domain/types'

interface FixtureListProps {
  team: Team
  fixtures: Fixture[]
}

export function FixtureList({ team, fixtures }: FixtureListProps) {
  const { state, dispatch } = usePredictions()
  const t = useTranslation()
  const homeCount = fixtures.filter((fixture) => fixture.venue === 'HOME').length
  const decided = fixtures.filter((fixture) => fixture.outcome !== null)
  const goalsFor = decided.reduce((total, fixture) => total + (fixture.goalsFor ?? 0), 0)
  const goalsAgainst = decided.reduce((total, fixture) => total + (fixture.goalsAgainst ?? 0), 0)

  const changeScore = (matchId: string, score: Score | null) => {
    dispatch(
      score === null
        ? { type: 'score-cleared', matchId }
        : { type: 'score-entered', matchId, score },
    )
  }

  return (
    <section>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line-strong pb-3">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
          {t.fixtures.title}
        </h2>
        <p className="eyebrow flex items-center gap-x-3 text-muted">
          <span className="text-home">{t.fixtures.homeCount(homeCount)}</span>
          <span className="text-dim">·</span>
          <span className="text-away">{t.fixtures.awayCount(fixtures.length - homeCount)}</span>
          {decided.length > 0 && (
            <>
              <span className="text-dim">·</span>
              <span className="tabular-nums text-fg">
                {goalsFor}:{goalsAgainst}
              </span>
            </>
          )}
        </p>
      </header>

      <div className="divide-y divide-line/70">
        {fixtures.map((fixture, index) => (
          <FixtureRow
            key={fixture.match.id}
            fixture={fixture}
            team={team}
            order={index + 1}
            isManual={state.predictions[fixture.match.id]?.source === 'manual'}
            onScoreChange={(score) => changeScore(fixture.match.id, score)}
          />
        ))}
      </div>

      <p className="mt-5 text-xs text-muted">
        {t.fixtures.hint}
        <span className="text-accent">{t.fixtures.hintHighlight}</span>
        {t.fixtures.hintSuffix}
      </p>
    </section>
  )
}
