import type { LeagueStats } from '../../domain/leagueStats'

interface StatTilesProps {
  stats: LeagueStats
}

function Tile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="border-l border-line pl-4">
      <p className="eyebrow text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{value}</p>
      {detail !== undefined && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
    </div>
  )
}

export function StatTiles({ stats }: StatTilesProps) {
  const homeShare =
    stats.playedCount === 0 ? 0 : Math.round((stats.homeWins / stats.playedCount) * 100)

  return (
    <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
      <Tile
        label="Tahmin edilen"
        value={`${stats.playedCount}`}
        detail={`${stats.totalCount} maçın`}
      />
      <Tile label="Toplam gol" value={`${stats.totalGoals}`} />
      <Tile
        label="Maç başına"
        value={stats.goalsPerMatch.toFixed(2)}
        detail="gol ortalaması"
      />
      <Tile
        label="Ev sahibi kazandı"
        value={`%${homeShare}`}
        detail={`${stats.draws} beraberlik · ${stats.awayWins} deplasman galibiyeti`}
      />
      <Tile
        label="Gol yemeyen"
        value={`${stats.cleanSheets}`}
        detail="maçta bir takım"
      />
    </dl>
  )
}
