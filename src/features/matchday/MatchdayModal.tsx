import { useEffect, useRef, useState } from 'react'
import { MatchdayProgress } from './MatchdayProgress'
import { MatchdayResults } from './MatchdayResults'
import { favouriteResultOf, matchdayResults } from './resultList'
import { Button } from '../../components/Button'
import { MatchLiveView } from '../match-live/MatchLiveView'
import { MATCHDAY_NUMBERS } from '../../domain/matchdays'
import type { MatchdayNumber } from '../../domain/matchdays'
import type { PredictionMap, StandingRow, Team } from '../../domain/types'

type Stage = 'live' | 'results'

interface MatchdayModalProps {
  matchday: MatchdayNumber
  predictions: PredictionMap
  favouriteTeam: Team | null
  favouriteStanding: StandingRow | null
  completedCount: number
  isReview: boolean
  hasNext: boolean
  onNext: () => void
  onViewStandings: () => void
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
  onViewStandings,
  onFinishAll,
  onClose,
}: MatchdayModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const results = matchdayResults(matchday, predictions)
  const favouriteResult = favouriteResultOf(results, favouriteTeam)
  const canWatch = favouriteResult !== null && favouriteResult.isWatchable
  const [stage, setStage] = useState<Stage>(canWatch && !isReview ? 'live' : 'results')

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog !== null && !dialog.open) dialog.showModal()
  }, [])

  const isLive = stage === 'live' && favouriteResult !== null

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="matchday-title"
      className="animate-modal-in panel m-auto w-[min(58rem,calc(100vw-2rem))] max-w-none bg-surface p-0 text-fg"
    >
      <div className="flex h-[88vh] flex-col">
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
                {isLive
                  ? 'Senin maçın'
                  : `${matchday} / ${MATCHDAY_NUMBERS.length} · ${results.length} maç`}
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

        {isLive ? (
          <MatchLiveView
            matchId={favouriteResult.id}
            homeTeam={favouriteResult.home}
            awayTeam={favouriteResult.away}
            footer={(isFinished) => (
              <Button
                variant={isFinished ? 'primary' : 'ghost'}
                onClick={() => setStage('results')}
              >
                {isFinished ? 'Diğer sonuçları gör →' : 'Sonuçlara atla →'}
              </Button>
            )}
          />
        ) : (
          <MatchdayResults
            results={results}
            favouriteResult={favouriteResult}
            favouriteTeam={favouriteTeam}
            favouriteStanding={favouriteStanding}
            isReview={isReview}
            hasNext={hasNext}
            onRewatch={canWatch ? () => setStage('live') : null}
            onNext={onNext}
            onViewStandings={onViewStandings}
            onFinishAll={onFinishAll}
            onClose={onClose}
          />
        )}
      </div>
    </dialog>
  )
}
