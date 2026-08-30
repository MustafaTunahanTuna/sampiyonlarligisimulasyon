import { useTranslation } from '../../i18n/useTranslation'
import type { MatchStats } from '../../domain/engine'
import type { Messages } from '../../i18n/messages/messages'

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

function buildRows(stats: MatchStats, t: Messages): StatRow[] {
  return [
    {
      label: t.live.stats.possession,
      home: `%${Math.round(stats.home.possession)}`,
      away: `%${Math.round(stats.away.possession)}`,
      homeShare: stats.home.possession,
    },
    {
      label: t.live.stats.shots,
      home: `${stats.home.shots}`,
      away: `${stats.away.shots}`,
      homeShare: share(stats.home.shots, stats.away.shots),
    },
    {
      label: t.live.stats.shotsOnTarget,
      home: `${stats.home.shotsOnTarget}`,
      away: `${stats.away.shotsOnTarget}`,
      homeShare: share(stats.home.shotsOnTarget, stats.away.shotsOnTarget),
    },
    {
      label: t.live.stats.expectedGoals,
      home: stats.home.expectedGoals.toFixed(2),
      away: stats.away.expectedGoals.toFixed(2),
      homeShare: share(stats.home.expectedGoals, stats.away.expectedGoals),
    },
    {
      label: t.live.stats.corners,
      home: `${stats.home.corners}`,
      away: `${stats.away.corners}`,
      homeShare: share(stats.home.corners, stats.away.corners),
    },
    {
      label: t.live.stats.cards,
      home: `${stats.home.yellowCards + stats.home.redCards}`,
      away: `${stats.away.yellowCards + stats.away.redCards}`,
      homeShare: share(
        stats.home.yellowCards + stats.home.redCards,
        stats.away.yellowCards + stats.away.redCards,
      ),
    },
  ]
}

const STAGGER_STEP_MS = 80

interface MatchStatsPanelProps {
  stats: MatchStats
  staggered?: boolean
}

export function MatchStatsPanel({ stats, staggered = false }: MatchStatsPanelProps) {
  const t = useTranslation()

  return (
    <dl className="space-y-2.5">
      {buildRows(stats, t).map((row, index) => (
        <div
          key={row.label}
          className={staggered ? 'animate-rise' : undefined}
          style={staggered ? { animationDelay: `${index * STAGGER_STEP_MS}ms` } : undefined}
        >
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
