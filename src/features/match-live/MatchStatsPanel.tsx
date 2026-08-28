import type { MatchStats } from '../../domain/engine'

interface StatRow {
  label: string
  home: string
  away: string
  homeShare: number
}

function share(home: number, away: number): number {
  const total = home + away
  return total === 0 ? 50 : (home / total) * 100
}

function buildRows(stats: MatchStats): StatRow[] {
  return [
    {
      label: 'Topa sahip olma',
      home: `%${Math.round(stats.home.possession)}`,
      away: `%${Math.round(stats.away.possession)}`,
      homeShare: stats.home.possession,
    },
    {
      label: 'Şut',
      home: `${stats.home.shots}`,
      away: `${stats.away.shots}`,
      homeShare: share(stats.home.shots, stats.away.shots),
    },
    {
      label: 'İsabetli şut',
      home: `${stats.home.shotsOnTarget}`,
      away: `${stats.away.shotsOnTarget}`,
      homeShare: share(stats.home.shotsOnTarget, stats.away.shotsOnTarget),
    },
    {
      label: 'Beklenen gol',
      home: stats.home.expectedGoals.toFixed(2),
      away: stats.away.expectedGoals.toFixed(2),
      homeShare: share(stats.home.expectedGoals, stats.away.expectedGoals),
    },
    {
      label: 'Korner',
      home: `${stats.home.corners}`,
      away: `${stats.away.corners}`,
      homeShare: share(stats.home.corners, stats.away.corners),
    },
    {
      label: 'Kart',
      home: `${stats.home.yellowCards + stats.home.redCards}`,
      away: `${stats.away.yellowCards + stats.away.redCards}`,
      homeShare: share(
        stats.home.yellowCards + stats.home.redCards,
        stats.away.yellowCards + stats.away.redCards,
      ),
    },
  ]
}

export function MatchStatsPanel({ stats }: { stats: MatchStats }) {
  return (
    <dl className="space-y-2.5">
      {buildRows(stats).map((row) => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-sm tabular-nums text-fg">{row.home}</span>
            <dt className="eyebrow text-muted">{row.label}</dt>
            <span className="font-display text-sm tabular-nums text-fg">{row.away}</span>
          </div>
          <dd className="mt-1 flex h-1.5 overflow-hidden rounded-pill bg-raised">
            <span className="bg-home" style={{ width: `${row.homeShare}%` }} />
            <span className="flex-1 bg-away" />
          </dd>
        </div>
      ))}
    </dl>
  )
}
