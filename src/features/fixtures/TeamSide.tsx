import { ClubCrest } from '../../components/ClubCrest'
import type { Team } from '../../domain/types'

interface TeamSideProps {
  team: Team
  align: 'start' | 'end'
  isFavourite: boolean
  meta?: string
}

export function TeamSide({ team, align, isFavourite, meta }: TeamSideProps) {
  const isEnd = align === 'end'

  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${
        isEnd ? 'flex-row-reverse justify-start text-right' : 'justify-start text-left'
      }`}
    >
      <ClubCrest team={team} size={36} />
      <div className="min-w-0">
        <p
          className={`truncate font-display text-base font-bold uppercase leading-tight tracking-tight sm:text-lg ${
            isFavourite ? 'text-fg' : 'text-muted'
          }`}
        >
          {team.name}
        </p>
        {meta !== undefined && <p className="truncate text-xs text-dim">{meta}</p>}
      </div>
    </div>
  )
}
