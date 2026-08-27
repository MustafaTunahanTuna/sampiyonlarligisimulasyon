import { ClubCrest } from '../../components/ClubCrest'
import { decisionSuffix } from '../../domain/teamKnockoutRun'
import type { KnockoutTie, Team, TieOutcome } from '../../domain/types'

interface BracketSideProps {
  team: Team | null
  placeholder: string
  aggregate: number | null
  isWinner: boolean
  isFavourite: boolean
}

function BracketSide({ team, placeholder, aggregate, isWinner, isFavourite }: BracketSideProps) {
  if (team === null) {
    return (
      <div className="flex items-center gap-1.5 py-1">
        <span className="size-5 shrink-0 rounded-pill border border-dashed border-line-strong" />
        <span className="truncate text-xs text-dim">{placeholder}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 py-1" title={team.name}>
      <ClubCrest team={team} size={20} />
      <span
        className={`min-w-0 flex-1 truncate font-display text-sm font-bold uppercase tracking-tight ${
          isWinner ? 'text-fg' : 'text-muted'
        } ${isFavourite ? 'underline decoration-accent decoration-2 underline-offset-4' : ''}`}
      >
        {team.code}
      </span>
      {aggregate !== null && (
        <span
          className={`shrink-0 font-display text-sm font-extrabold tabular-nums ${
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
  emphasis?: boolean
}

export function BracketTie({ tie, outcome, favouriteTeamId, emphasis = false }: BracketTieProps) {
  const winnerId = outcome?.winner.id ?? null
  const suffix = outcome === undefined ? '' : decisionSuffix(outcome.decidedBy)

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
        placeholder={tie.seededLabel}
        aggregate={outcome?.aggregateSeeded ?? null}
        isWinner={winnerId === tie.seeded?.id}
        isFavourite={tie.seeded?.id === favouriteTeamId}
      />
      <BracketSide
        team={tie.challenger}
        placeholder={tie.challengerLabel}
        aggregate={outcome?.aggregateChallenger ?? null}
        isWinner={winnerId === tie.challenger?.id}
        isFavourite={tie.challenger?.id === favouriteTeamId}
      />
      {suffix !== '' && (
        <p className="border-t border-line pt-1 text-[0.65rem] uppercase tracking-wide text-dim">
          {suffix}
        </p>
      )}
    </article>
  )
}
