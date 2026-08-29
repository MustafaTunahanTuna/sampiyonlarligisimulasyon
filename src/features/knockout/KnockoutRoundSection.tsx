import { TieCard } from './TieCard'
import { isWatchableTie } from './watchableTie'
import type { KnockoutRound } from '../../domain/knockoutStage'
import type { KnockoutTie } from '../../domain/types'

const REVEAL_STEP_MS = 60

interface KnockoutRoundSectionProps {
  round: KnockoutRound
  favouriteTeamId: string | null
  onWatchTie: (tie: KnockoutTie) => void
}

export function KnockoutRoundSection({
  round,
  favouriteTeamId,
  onWatchTie,
}: KnockoutRoundSectionProps) {
  return (
    <section>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-strong pb-3">
        <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">
          {round.label}
          <span className="eyebrow pl-3 text-muted">
            {round.ties.length} eşleşme{round.ties[0]?.isTwoLegged === false && ' · tek maç'}
          </span>
        </h3>
        {round.isComplete && <span className="eyebrow text-home">Tamamlandı</span>}
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {round.ties.map((tie, index) => (
          <TieCard
            key={tie.id}
            tie={tie}
            outcome={round.outcomes.get(tie.id)}
            favouriteTeamId={favouriteTeamId}
            revealDelay={index * REVEAL_STEP_MS}
            onWatch={
              isWatchableTie(tie, round.outcomes.get(tie.id), favouriteTeamId)
                ? () => onWatchTie(tie)
                : null
            }
          />
        ))}
      </div>
    </section>
  )
}
