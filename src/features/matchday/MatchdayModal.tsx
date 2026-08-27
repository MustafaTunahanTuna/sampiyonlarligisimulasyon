import { useEffect, useRef } from 'react'
import { MatchdayProgress } from './MatchdayProgress'
import { MatchdayResultRow } from './MatchdayResultRow'
import { Button } from '../../components/Button'
import { getTeam } from '../../domain/drawPool'
import { MATCHDAY_NUMBERS, matchdayMatches } from '../../domain/matchdays'
import { scoreFor } from '../../domain/predictedResults'
import type { MatchdayNumber } from '../../domain/matchdays'
import type { PredictionMap, StandingRow, Team } from '../../domain/types'

const REVEAL_STEP_MS = 28

interface MatchdayModalProps {
  matchday: MatchdayNumber
  predictions: PredictionMap
  favouriteTeam: Team | null
  favouriteStanding: StandingRow | null
  completedCount: number
  isReview: boolean
  hasNext: boolean
  onNext: () => void
  onGoToKnockout: () => void
  onFinishAll: () => void
  onClose: () => void
}

export function MatchdayModal({
  matchday,
  predictions,
  favouriteTeam,
  favouriteStanding,
  completedCount,
  isReview,
  hasNext,
  onNext,
  onGoToKnockout,
  onFinishAll,
  onClose,
}: MatchdayModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog !== null && !dialog.open) dialog.showModal()
  }, [])

  const results = matchdayMatches(matchday).flatMap((match) => {
    const score = scoreFor(match, predictions)
    return score === null
      ? []
      : [{ id: match.id, home: getTeam(match.homeTeamId), away: getTeam(match.awayTeamId), score }]
  })
  const favouriteResult = results.find(
    (result) => result.home.id === favouriteTeam?.id || result.away.id === favouriteTeam?.id,
  )
  const otherResults = results.filter((result) => result.id !== favouriteResult?.id)

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="matchday-title"
      className="animate-modal-in panel m-auto w-[min(46rem,calc(100vw-2rem))] max-w-none bg-surface p-0 text-fg backdrop:bg-transparent"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="border-b border-line px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2
              id="matchday-title"
              className="font-display text-2xl font-extrabold uppercase tracking-tight"
            >
              Hafta {matchday}
            </h2>
            <div className="flex items-center gap-4">
              <p className="eyebrow text-muted tabular-nums">
                {matchday} / {MATCHDAY_NUMBERS.length} · {results.length} maç
              </p>
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
          </div>
          <div className="mt-3">
            <MatchdayProgress current={matchday} completed={completedCount} />
          </div>
        </header>

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {favouriteResult !== undefined && (
            <section className="mb-5">
              <h3 className="eyebrow mb-2 text-accent">Senin maçın</h3>
              <ul>
                <MatchdayResultRow
                  homeTeam={favouriteResult.home}
                  awayTeam={favouriteResult.away}
                  score={favouriteResult.score}
                  favouriteTeamId={favouriteTeam?.id ?? null}
                  revealDelay={0}
                />
              </ul>
            </section>
          )}

          <section>
            <h3 className="eyebrow mb-2 text-muted">Diğer maçlar</h3>
            <ul className="space-y-0.5">
              {otherResults.map((result, index) => (
                <MatchdayResultRow
                  key={result.id}
                  homeTeam={result.home}
                  awayTeam={result.away}
                  score={result.score}
                  favouriteTeamId={favouriteTeam?.id ?? null}
                  revealDelay={120 + index * REVEAL_STEP_MS}
                />
              ))}
            </ul>
          </section>
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4 sm:px-6">
          {favouriteStanding !== null && (
            <p className="eyebrow text-muted">
              <span className="text-fg">{favouriteStanding.position}. sıra</span>
              <span className="px-2 text-dim">·</span>
              {favouriteStanding.points} puan
            </p>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              {isReview ? 'Kapat' : 'Kapat ve incele'}
            </Button>
            {isReview ? null : hasNext ? (
              <>
                <Button variant="ghost" onClick={onFinishAll}>
                  Tümünü tamamla
                </Button>
                <Button variant="primary" onClick={onNext}>
                  Sonraki hafta →
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={onGoToKnockout}>
                Nakavt aşamasına geç →
              </Button>
            )}
          </div>
        </footer>
      </div>
    </dialog>
  )
}
