import { MatchdayResultRow } from './MatchdayResultRow'
import type { MatchdayResult } from './resultList'
import { Button } from '../../components/Button'
import type { StandingRow, Team } from '../../domain/types'

const REVEAL_STEP_MS = 28

interface MatchdayResultsProps {
  results: MatchdayResult[]
  favouriteResult: MatchdayResult | null
  favouriteTeam: Team | null
  favouriteStanding: StandingRow | null
  isReview: boolean
  hasNext: boolean
  onRewatch: (() => void) | null
  onNext: () => void
  onGoToKnockout: () => void
  onFinishAll: () => void
  onClose: () => void
}

export function MatchdayResults({
  results,
  favouriteResult,
  favouriteTeam,
  favouriteStanding,
  isReview,
  hasNext,
  onRewatch,
  onNext,
  onGoToKnockout,
  onFinishAll,
  onClose,
}: MatchdayResultsProps) {
  const otherResults = results.filter((result) => result.id !== favouriteResult?.id)

  return (
    <>
      <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {favouriteResult !== null && (
          <section className="mb-5">
            <h3 className="eyebrow mb-2 text-accent">Senin maçın</h3>
            <ul>
              <MatchdayResultRow
                homeTeam={favouriteResult.home}
                awayTeam={favouriteResult.away}
                score={favouriteResult.score}
                favouriteTeamId={favouriteTeam?.id ?? null}
                revealDelay={0}
                onWatch={onRewatch}
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
                onWatch={null}
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
    </>
  )
}
