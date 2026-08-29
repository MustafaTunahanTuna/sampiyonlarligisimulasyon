import { MatchdayDots } from './MatchdayDots'
import { Button } from '../../components/Button'
import { Starball } from '../../components/Starball'
import { useTranslation } from '../../i18n/useTranslation'
import { usePredictions } from '../../state/usePredictions'
import { createSeed } from '../../state/predictionReducer'
import type { MatchdayNumber } from '../../domain/matchdays'

const UNPREDICTABILITY_STEPS = [
  { value: 0, key: 'form' },
  { value: 0.25, key: 'balanced' },
  { value: 0.6, key: 'surprising' },
  { value: 0.9, key: 'chaos' },
] as const

interface SimulationControlsProps {
  upcomingMatchday: MatchdayNumber | null
  completedMatchdays: number
  onPlayNext: () => void
  onFinishAll: () => void
  onGoToKnockout: () => void
  onReviewMatchday: (matchday: MatchdayNumber) => void
  onReset: () => void
}

export function SimulationControls({
  upcomingMatchday,
  completedMatchdays,
  onPlayNext,
  onFinishAll,
  onGoToKnockout,
  onReviewMatchday,
  onReset,
}: SimulationControlsProps) {
  const { state, dispatch } = usePredictions()
  const t = useTranslation()
  const isComplete = upcomingMatchday === null
  const hasStarted = completedMatchdays > 0

  return (
    <section className="panel flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {isComplete ? (
          <Button variant="primary" onClick={onGoToKnockout}>
            <Starball className="size-4" />
            {t.matchday.goToKnockout}
          </Button>
        ) : (
          <Button variant="primary" onClick={onPlayNext}>
            <Starball className="size-4" />
            {hasStarted ? t.matchday.playMatchday(upcomingMatchday) : t.matchday.startSeason}
          </Button>
        )}

        {!isComplete && hasStarted && (
          <Button variant="ghost" onClick={onFinishAll} className="px-3">
            {t.matchday.finishAll}
          </Button>
        )}

        {hasStarted && (
          <Button variant="ghost" onClick={onReset} className="px-3 hover:text-highlight">
            {t.matchday.reset}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <select
          value={state.unpredictability}
          onChange={(event) =>
            dispatch({
              type: 'unpredictability-changed',
              unpredictability: Number(event.target.value),
            })
          }
          aria-label={t.matchday.unpredictability}
          className="rounded-control border border-line-strong bg-surface/60 px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none"
        >
          {UNPREDICTABILITY_STEPS.map((step) => (
            <option key={step.value} value={step.value} className="bg-surface">
              {t.matchday.unpredictabilitySteps[step.key]}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            value={state.seed}
            onChange={(event) =>
              dispatch({ type: 'seed-changed', seed: event.target.value.toUpperCase() })
            }
            aria-label={t.matchday.seed}
            title={t.matchday.seedHint}
            className="w-24 rounded-control border border-line-strong bg-surface/60 px-3 py-1.5 font-display text-sm font-bold uppercase tracking-widest text-fg focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => dispatch({ type: 'seed-changed', seed: createSeed() })}
            aria-label={t.matchday.newSeed}
            title={t.matchday.newSeed}
            className="rounded-pill px-2 py-1.5 text-muted transition-colors hover:bg-surface hover:text-accent"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M20 11a8 8 0 1 0-2.3 5.7" />
              <path d="M20 4v7h-7" />
            </svg>
          </button>
        </div>

        <MatchdayDots completed={completedMatchdays} onReview={onReviewMatchday} />
      </div>
    </section>
  )
}
