import { Button } from '../../components/Button'
import { Starball } from '../../components/Starball'
import { usePredictions } from '../../state/usePredictions'
import { createSeed } from '../../state/predictionReducer'
import { drawPool } from '../../domain/drawPool'

interface SimulationControlsProps {
  predictedCount: number
}

const UNPREDICTABILITY_STEPS = [
  { value: 0, label: 'Forma göre' },
  { value: 0.25, label: 'Dengeli' },
  { value: 0.6, label: 'Sürprizli' },
  { value: 0.9, label: 'Kaos' },
]

export function SimulationControls({ predictedCount }: SimulationControlsProps) {
  const { state, dispatch } = usePredictions()
  const total = drawPool.matches.length
  const hasPredictions = predictedCount > 0

  return (
    <section className="panel">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 p-4">
        <Button
          variant="primary"
          onClick={() =>
            dispatch({ type: 'simulation-requested', scope: hasPredictions ? 'resimulate' : 'gaps' })
          }
        >
          <Starball className="size-4" />
          {hasPredictions ? 'Yeniden simüle et' : 'Sezonu simüle et'}
        </Button>

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
            onChange={(event) => dispatch({ type: 'seed-changed', seed: event.target.value.toUpperCase() })}
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
          <span className="text-fg">{predictedCount}</span> / {total} maç
        </p>
      </div>

      {hasPredictions && (
        <div className="border-t border-line px-4 py-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'everything-cleared' })}
            className="eyebrow text-dim transition-colors hover:text-highlight"
          >
            Tüm tahminleri sil
          </button>
        </div>
      )}
    </section>
  )
}
