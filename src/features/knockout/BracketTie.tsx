import { ClubCrest } from '../../components/ClubCrest'
import { WatchTieButton } from './WatchTieButton'
import { slotLabel } from './tiePresentation'
import { tieLegGoals } from '../../domain/knockoutTie'
import { useTranslation } from '../../i18n/useTranslation'
import type { KnockoutTie, Team, TieOutcome } from '../../domain/types'

interface BracketSideProps {
  team: Team | null
  placeholder: string
  aggregate: number | null
  legGoals: number[]
  isWinner: boolean
  isFavourite: boolean
}

function BracketSide({
  team,
  placeholder,
  aggregate,
  legGoals,
  isWinner,
  isFavourite,
}: BracketSideProps) {
  if (team === null) {
    return (
      <div className="flex items-center gap-1.5 py-1">
        <span className="size-5 shrink-0 rounded-pill border border-dashed border-line-strong" />
        <span className="truncate text-xs text-dim">{placeholder}</span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-1.5 py-1"
      title={legGoals.length > 1 ? `${team.name}: ${legGoals.join(' - ')}` : team.name}
    >
      <ClubCrest team={team} size={20} />
      <span
        className={`min-w-0 flex-1 truncate font-display text-sm font-bold uppercase tracking-tight ${
          isWinner ? 'text-fg' : 'text-muted'
        } ${isFavourite ? 'underline decoration-accent decoration-2 underline-offset-4' : ''}`}
      >
        {team.code}
      </span>
      {legGoals.length > 1 && (
        <span className="shrink-0 font-display text-[0.6rem] tabular-nums text-dim">
          {legGoals.join(' ')}
        </span>
      )}
      {aggregate !== null && (
        <span
          className={`shrink-0 border-l border-line pl-1.5 font-display text-sm font-extrabold tabular-nums ${
            isWinner ? 'text-fg' : 'text-dim'
          }`}
        >
          {aggregate}
        </span>
      )}
    </div>
  )
}

interface BracketTieProps {
  tie: KnockoutTie
  outcome: TieOutcome | undefined
  favouriteTeamId: string | null
  onWatch?: (() => void) | null
  emphasis?: boolean
}

export function BracketTie({
  tie,
  outcome,
  favouriteTeamId,
  onWatch = null,
  emphasis = false,
}: BracketTieProps) {
  const t = useTranslation()
  const winnerId = outcome?.winner.id ?? null
  const suffix = outcome === undefined ? '' : t.knockout.decisionSuffix[outcome.decidedBy]
  const legGoals =
    outcome === undefined ? { seeded: [], challenger: [] } : tieLegGoals(tie, outcome.legs)

  return (
    <article
      className={`rounded-control border px-2 py-1.5 transition-colors ${
        outcome === undefined
          ? 'border-line/70 bg-surface/30'
          : 'border-line bg-surface/70'
      } ${emphasis ? 'ring-1 ring-accent/40' : ''}`}
    >
      <BracketSide
        team={tie.seeded}
        placeholder={slotLabel(tie.seededSlot, t)}
        aggregate={outcome?.aggregateSeeded ?? null}
        legGoals={legGoals.seeded}
        isWinner={winnerId === tie.seeded?.id}
        isFavourite={tie.seeded?.id === favouriteTeamId}
      />
      <BracketSide
        team={tie.challenger}
        placeholder={slotLabel(tie.challengerSlot, t)}
        aggregate={outcome?.aggregateChallenger ?? null}
        legGoals={legGoals.challenger}
        isWinner={winnerId === tie.challenger?.id}
        isFavourite={tie.challenger?.id === favouriteTeamId}
      />
      {(suffix !== '' || onWatch !== null) && (
        <div className="flex items-center gap-1 border-t border-line pt-1">
          <p className="min-w-0 flex-1 truncate text-[0.65rem] uppercase tracking-wide text-dim">
            {suffix}
          </p>
          {onWatch !== null && (
            <WatchTieButton label={t.knockout.watchTie} onWatch={onWatch} compact />
          )}
        </div>
      )}
    </article>
  )
}
