import { ClubCrest } from '../../components/ClubCrest'
import { QUALIFICATION_TEXT_TONE } from './qualificationTone'
import { fixturesOf } from '../../domain/fixtures'
import { withPredictedScores } from '../../domain/predictedResults'
import { useModalDialog } from '../../hooks/useModalDialog'
import { useTranslation } from '../../i18n/useTranslation'
import { usePredictions } from '../../state/usePredictions'
import type { Outcome, StandingRow } from '../../domain/types'

const OUTCOME_TONE: Record<Outcome, string> = {
  WIN: 'bg-home/15 text-home ring-home/35',
  DRAW: 'bg-surface text-muted ring-line-strong',
  LOSS: 'bg-highlight/12 text-highlight ring-highlight/30',
}

interface TeamFixturesModalProps {
  standing: StandingRow
  onClose: () => void
}

export function TeamFixturesModal({ standing, onClose }: TeamFixturesModalProps) {
  const dialogRef = useModalDialog()
  const { state } = usePredictions()
  const t = useTranslation()
  const team = standing.team
  const fixtures = withPredictedScores(fixturesOf(team), state.predictions)

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="team-fixtures-title"
      className="animate-modal-in panel m-auto w-[min(38rem,calc(100vw-2rem))] max-w-none bg-surface p-0 text-fg"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <ClubCrest team={team} size={38} />
            <div className="min-w-0 flex-1">
              <h2
                id="team-fixtures-title"
                className="truncate font-display text-2xl font-extrabold uppercase tracking-tight"
              >
                {team.name}
              </h2>
              <p className="eyebrow mt-1 text-muted">
                <span className={QUALIFICATION_TEXT_TONE[standing.qualification]}>
                  {t.standings.position(standing.position)}
                </span>
                <span className="px-2 text-dim">·</span>
                {t.standings.pointsSuffix(standing.points)}
                <span className="px-2 text-dim">·</span>
                {standing.wins}-{standing.draws}-{standing.losses}
                <span className="px-2 text-dim">·</span>
                <span className="tabular-nums">
                  {standing.goalsFor}:{standing.goalsAgainst}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              title={t.common.close}
              className="shrink-0 rounded-pill p-1.5 text-muted transition-colors hover:bg-raised hover:text-fg"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <p className={`eyebrow mt-3 ${QUALIFICATION_TEXT_TONE[standing.qualification]}`}>
            {t.standings.qualificationOutcome[standing.qualification]}
          </p>
        </header>

        <ul className="scroll-area min-h-0 flex-1 divide-y divide-line/70 overflow-y-auto px-5 py-2">
          {fixtures.map((fixture, index) => (
            <li
              key={fixture.match.id}
              className="grid grid-cols-[2.25rem_1fr_auto_2rem] items-center gap-3 py-2.5"
            >
              <span className="font-display text-sm font-extrabold tabular-nums text-dim">
                {String(fixture.match.matchday ?? index + 1).padStart(2, '0')}
              </span>

              <div className="flex min-w-0 items-center gap-2.5">
                <ClubCrest team={fixture.opponent} size={24} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-fg">{fixture.opponent.name}</span>
                  <span
                    className={`eyebrow ${fixture.venue === 'HOME' ? 'text-home' : 'text-away'}`}
                  >
                    {fixture.venue === 'HOME' ? t.standings.homeVenue : t.standings.awayVenue}
                  </span>
                </span>
              </div>

              <span className="shrink-0 rounded-control bg-canvas/80 px-2.5 py-1 font-display text-base font-extrabold tabular-nums text-fg ring-1 ring-line">
                {fixture.goalsFor === null || fixture.goalsAgainst === null
                  ? '–'
                  : `${fixture.goalsFor}–${fixture.goalsAgainst}`}
              </span>

              {fixture.outcome === null ? (
                <span aria-hidden="true" />
              ) : (
                <span
                  title={t.fixtures.outcome[fixture.outcome]}
                  className={`inline-flex size-7 items-center justify-center rounded-pill font-display text-xs font-extrabold ring-1 ${OUTCOME_TONE[fixture.outcome]}`}
                >
                  {t.fixtures.outcomeShort[fixture.outcome]}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}
