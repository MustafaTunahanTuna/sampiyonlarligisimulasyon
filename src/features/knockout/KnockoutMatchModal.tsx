import { useState } from 'react'
import { MatchLiveView } from '../match-live/MatchLiveView'
import { Button } from '../../components/Button'
import { useModalDialog } from '../../hooks/useModalDialog'
import { ROUND_LABEL } from '../../domain/knockoutFormat'
import { tieLegSetups } from '../../domain/knockoutTie'
import type { KnockoutTie, TieDecision, TieOutcome } from '../../domain/types'

const DECISION_NOTE: Record<TieDecision, string> = {
  AGGREGATE: 'toplam skorla',
  EXTRA_TIME: 'uzatmada',
  PENALTIES: 'penaltılarda',
}

interface KnockoutMatchModalProps {
  tie: KnockoutTie
  outcome: TieOutcome | undefined
  onClose: () => void
}

export function KnockoutMatchModal({ tie, outcome, onClose }: KnockoutMatchModalProps) {
  const dialogRef = useModalDialog()
  const [legIndex, setLegIndex] = useState(0)
  const setups = tieLegSetups(tie)

  const setup = setups[legIndex]
  if (setup === undefined) return null

  const isLastLeg = legIndex === setups.length - 1
  const legLabel = setups.length > 1 ? `${legIndex + 1}. maç` : 'Tek maç'

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="knockout-tie-title"
      className="animate-modal-in panel m-auto w-[min(58rem,calc(100vw-2rem))] max-w-none bg-surface p-0 text-fg"
    >
      <div className="flex h-[88vh] flex-col">
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-4 sm:px-6">
          <h2
            id="knockout-tie-title"
            className="font-display text-2xl font-extrabold uppercase tracking-tight"
          >
            {ROUND_LABEL[tie.round]}
          </h2>
          <div className="flex items-center gap-4">
            <p className="eyebrow text-muted">{legLabel}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              title="Kapat"
              className="rounded-pill p-1.5 text-muted transition-colors hover:bg-raised hover:text-fg"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>

        <MatchLiveView
          key={setup.id}
          matchId={setup.id}
          homeTeam={setup.home}
          awayTeam={setup.away}
          footer={(isFinished) =>
            isLastLeg ? (
              <>
                {isFinished && outcome !== undefined && (
                  <p className="eyebrow mr-auto text-muted">
                    <span className="text-fg">{outcome.winner.name}</span>
                    <span className="px-2 text-dim">·</span>
                    {DECISION_NOTE[outcome.decidedBy]} turu geçti
                  </p>
                )}
                <Button variant={isFinished ? 'primary' : 'ghost'} onClick={onClose}>
                  {isFinished ? 'Eşleşme özetine dön →' : 'Sonuçlara atla →'}
                </Button>
              </>
            ) : (
              <Button
                variant={isFinished ? 'primary' : 'ghost'}
                onClick={() => setLegIndex(legIndex + 1)}
              >
                {isFinished ? 'Rövanşı izle →' : 'Rövanşa atla →'}
              </Button>
            )
          }
        />
      </div>
    </dialog>
  )
}
