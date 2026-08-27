import { ClubCrest } from '../../components/ClubCrest'
import type { Team } from '../../domain/types'

interface TieTeamRowProps {
  team: Team | null
  placeholder: string
  aggregate: number | null
  isWinner: boolean
  isFavourite: boolean
}

export function TieTeamRow({
  team,
  placeholder,
  aggregate,
  isWinner,
  isFavourite,
}: TieTeamRowProps) {
  if (team === null) {
    return (
      <div className="flex items-center gap-2.5 py-1.5">
        <span className="size-6 shrink-0 rounded-pill border border-dashed border-line-strong" />
        <span className="truncate text-sm text-dim">{placeholder}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <ClubCrest team={team} size={24} />
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          isWinner ? 'font-bold text-fg' : 'text-muted'
        } ${isFavourite ? 'underline decoration-accent decoration-2 underline-offset-4' : ''}`}
      >
        {team.name}
      </span>
      {aggregate !== null && (
        <span
          className={`shrink-0 font-display text-base font-extrabold tabular-nums ${
            isWinner ? 'text-fg' : 'text-dim'
          }`}
        >
          {aggregate}
        </span>
      )}
    </div>
  )
}
