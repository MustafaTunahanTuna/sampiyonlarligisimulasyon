import { ClubCrest } from '../../components/ClubCrest'
import type { TeamRanking } from '../../domain/leagueStats'

interface RankingListProps {
  title: string
  rankings: TeamRanking[]
  formatValue: (value: number) => string
  favouriteTeamId: string | null
}

export function RankingList({ title, rankings, formatValue, favouriteTeamId }: RankingListProps) {
  return (
    <section className="panel min-w-0 p-4">
      <h3 className="eyebrow border-b border-line pb-2.5 text-muted">{title}</h3>
      <ol className="mt-1 divide-y divide-line">
        {rankings.map((ranking, index) => (
          <li
            key={ranking.team.id}
            className={`flex items-center gap-3 py-2.5 ${
              ranking.team.id === favouriteTeamId ? 'text-fg' : 'text-muted'
            }`}
          >
            <span className="w-4 shrink-0 text-right font-display text-xs font-bold tabular-nums text-dim">
              {index + 1}
            </span>
            <ClubCrest team={ranking.team} size={24} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{ranking.team.name}</span>
            <span className="shrink-0 text-xs text-dim">{ranking.detail}</span>
            <span className="w-10 shrink-0 text-right font-display text-lg font-extrabold tabular-nums text-fg">
              {formatValue(ranking.value)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
