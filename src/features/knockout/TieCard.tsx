import { TieTeamRow } from './TieTeamRow'
import { WatchTieButton } from './WatchTieButton'
import { slotLabel } from './tiePresentation'
import { tieLegSetups } from '../../domain/knockoutTie'
import { useTranslation } from '../../i18n/useTranslation'
import type { KnockoutTie, TieOutcome } from '../../domain/types'

interface TieCardProps {
  tie: KnockoutTie
  outcome: TieOutcome | undefined
  favouriteTeamId: string | null
  revealDelay: number
  onWatch: (() => void) | null
}

export function TieCard({ tie, outcome, favouriteTeamId, revealDelay, onWatch }: TieCardProps) {
  const t = useTranslation()
  const setups = tieLegSetups(tie)
  const winnerId = outcome?.winner.id ?? null
  const note = outcome === undefined ? '' : t.knockout.tieNote[outcome.decidedBy]

  return (
    <article
      style={outcome === undefined ? undefined : { animationDelay: `${revealDelay}ms` }}
      className={`panel px-3 py-2.5 ${outcome === undefined ? '' : 'animate-result-in'}`}
    >
      <TieTeamRow
        team={tie.seeded}
        placeholder={slotLabel(tie.seededSlot, t)}
        aggregate={outcome?.aggregateSeeded ?? null}
        isWinner={winnerId === tie.seeded?.id}
        isFavourite={tie.seeded?.id === favouriteTeamId}
      />
      <TieTeamRow
        team={tie.challenger}
        placeholder={slotLabel(tie.challengerSlot, t)}
        aggregate={outcome?.aggregateChallenger ?? null}
        isWinner={winnerId === tie.challenger?.id}
        isFavourite={tie.challenger?.id === favouriteTeamId}
      />

      {outcome !== undefined && (
        <div className="mt-1.5 flex items-center gap-2 border-t border-line pt-1.5">
          <p className="min-w-0 flex-1 text-xs text-dim">
            {outcome.legs.map((leg, index) => (
              <span key={setups[index]?.id ?? index} className="tabular-nums">
                {index > 0 && <span className="px-1.5">·</span>}
                {leg.home}-{leg.away}
              </span>
            ))}
            {note !== '' && <span className="pl-2 text-highlight">{note}</span>}
          </p>
          {onWatch !== null && (
            <WatchTieButton label={t.knockout.watchTie} onWatch={onWatch} compact />
          )}
        </div>
      )}
    </article>
  )
}
