import { TieTeamRow } from './TieTeamRow'
import { tieLegSetups } from '../../domain/knockoutTie'
import type { KnockoutTie, TieOutcome } from '../../domain/types'

const DECISION_NOTE: Record<string, string> = {
  EXTRA_TIME: 'uzatmada',
  PENALTIES: 'penaltılarda',
}

interface TieCardProps {
  tie: KnockoutTie
  outcome: TieOutcome | undefined
  favouriteTeamId: string | null
  revealDelay: number
}

export function TieCard({ tie, outcome, favouriteTeamId, revealDelay }: TieCardProps) {
  const setups = tieLegSetups(tie)
  const winnerId = outcome?.winner.id ?? null
  const note = outcome === undefined ? null : DECISION_NOTE[outcome.decidedBy]

  return (
    <article
      style={outcome === undefined ? undefined : { animationDelay: `${revealDelay}ms` }}
      className={`panel px-3 py-2.5 ${outcome === undefined ? '' : 'animate-result-in'}`}
    >
      <TieTeamRow
        team={tie.seeded}
        placeholder={tie.seededLabel}
        aggregate={outcome?.aggregateSeeded ?? null}
        isWinner={winnerId === tie.seeded?.id}
        isFavourite={tie.seeded?.id === favouriteTeamId}
      />
      <TieTeamRow
        team={tie.challenger}
        placeholder={tie.challengerLabel}
        aggregate={outcome?.aggregateChallenger ?? null}
        isWinner={winnerId === tie.challenger?.id}
        isFavourite={tie.challenger?.id === favouriteTeamId}
      />

      {outcome !== undefined && (
        <p className="mt-1.5 border-t border-line pt-1.5 text-xs text-dim">
          {outcome.legs.map((leg, index) => (
            <span key={setups[index]?.id ?? index} className="tabular-nums">
              {index > 0 && <span className="px-1.5">·</span>}
              {leg.home}-{leg.away}
            </span>
          ))}
          {note !== null && <span className="pl-2 text-highlight">{note}</span>}
        </p>
      )}
    </article>
  )
}
