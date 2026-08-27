import { Button } from '../../components/Button'
import { Starball } from '../../components/Starball'
import { usePredictions } from '../../state/usePredictions'
import { createSeed } from '../../state/predictionReducer'
import { MATCHDAY_NUMBERS } from '../../domain/matchdays'
import type { MatchdayNumber } from '../../domain/matchdays'

const UNPREDICTABILITY_STEPS = [
  { value: 0, label: 'Forma göre' },
  { value: 0.25, label: 'Dengeli' },
  { value: 0.6, label: 'Sürprizli' },
  { value: 0.9, label: 'Kaos' },
]

interface SimulationControlsProps {
  upcomingMatchday: MatchdayNumber | null
  completedMatchdays: number
  onPlayNext: () => void
  onFinishAll: () => void
  onGoToKnockout: () => void
  onReset: () => void
}

export function SimulationControls({
  upcomingMatchday,
  completedMatchdays,
  onPlayNext,
  onFinishAll,
  onGoToKnockout,
  onReset,
}: SimulationControlsProps) {
  const { state, dispatch } = usePredictions()
  const isComplete = upcomingMatchday === null
  const hasStarted = completedMatchdays > 0

  return (
    <section className="panel">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 p-4">
        {isComplete ? (
          <Button variant="primary" onClick={onGoToKnockout}>
            <Starball className="size-4" />
            Nakavt aşamasına geç
          </Button>
        ) : (
          <Button variant="primary" onClick={onPlayNext}>
            <Starball className="size-4" />
            {hasStarted ? `Hafta ${upcomingMatchday} oyna` : 'Sezonu başlat'}
          </Button>
        )}

        {!isComplete && hasStarted && (
          <Button variant="ghost" onClick={onFinishAll} className="px-3">
            Kalan haftaları tamamla
          </Button>
        )}

        {hasStarted && (
          <Button variant="ghost" onClick={onReset} className="px-3 hover:text-highlight">
            Sıfırla
          </Button>
        )}

        <label className="flex items-center gap-3">
          <span className="eyebrow text-muted">Sürpriz</span>
          <select
            value={state.unpredictability}
            onChange={(event) =>
              dispatch({
                type: 'unpredictability-changed',
                unpredictability: Number(event.target.value),
              })
            }
            className="rounded-control border border-line-strong bg-surface/60 px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none"
          >
            {UNPREDICTABILITY_STEPS.map((step) => (
              <option key={step.value} value={step.value} className="bg-surface">
                {step.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3">
          <span className="eyebrow text-muted">Senaryo</span>
          <input
            value={state.seed}
            onChange={(event) =>
              dispatch({ type: 'seed-changed', seed: event.target.value.toUpperCase() })
            }
            aria-label="Senaryo kodu"
            className="w-24 rounded-control border border-line-strong bg-surface/60 px-3 py-1.5 font-display text-sm font-bold uppercase tracking-widest text-fg focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => dispatch({ type: 'seed-changed', seed: createSeed() })}
            className="eyebrow text-muted transition-colors hover:text-accent"
          >
            Yenile
          </button>
        </label>

        <p className="eyebrow ml-auto text-muted tabular-nums">
          <span className="text-fg">{completedMatchdays}</span> / {MATCHDAY_NUMBERS.length} hafta
        </p>
      </div>
    </section>
  )
}
