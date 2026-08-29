import { ClubCrest } from '../../components/ClubCrest'
import type { PlayerTally } from '../../domain/playerStats'

interface PlayerRankingListProps {
  title: string
  players: PlayerTally[]
  primaryValue: (tally: PlayerTally) => number
  secondaryText: (tally: PlayerTally) => string
  favouriteTeamId: string | null
  emptyText: string
}

export function PlayerRankingList({
  title,
  players,
  primaryValue,
  secondaryText,
  favouriteTeamId,
  emptyText,
}: PlayerRankingListProps) {
  return (
    <section className="panel min-w-0 p-4">
      <h3 className="eyebrow border-b border-line pb-2.5 text-muted">{title}</h3>
      {players.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{emptyText}</p>
      ) : (
        <ol className="mt-1 divide-y divide-line">
          {players.map((tally, index) => (
            <li
              key={`${tally.team.id}-${tally.name}`}
              className={`flex items-center gap-3 py-2.5 ${
                tally.team.id === favouriteTeamId ? 'text-fg' : 'text-muted'
              }`}
            >
              <span className="w-4 shrink-0 text-right font-display text-xs font-bold tabular-nums text-dim">
                {index + 1}
              </span>
              <ClubCrest team={tally.team} size={24} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{tally.name}</span>
                <span className="block truncate text-xs text-dim">
                  {tally.team.name} · {secondaryText(tally)}
                </span>
              </span>
              <span className="w-10 shrink-0 text-right font-display text-lg font-extrabold tabular-nums text-fg">
                {primaryValue(tally)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
