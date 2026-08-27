import { TieCard } from './TieCard'
import { Button } from '../../components/Button'
import type { KnockoutRound } from '../../domain/knockoutStage'

const REVEAL_STEP_MS = 60

interface KnockoutRoundSectionProps {
  round: KnockoutRound
  favouriteTeamId: string | null
  isPlayable: boolean
  onPlay: () => void
}

export function KnockoutRoundSection({
  round,
  favouriteTeamId,
  isPlayable,
  onPlay,
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
        {isPlayable && (
          <Button variant="primary" onClick={onPlay}>
            {round.label} oyna
          </Button>
        )}
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
          />
        ))}
      </div>
    </section>
  )
}
