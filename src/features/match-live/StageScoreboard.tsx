import { useTranslation } from '../../i18n/useTranslation'
import type { Score } from '../../domain/types'
import type { TeamVisual } from './pitchRenderer'

interface StageScoreboardProps {
  home: TeamVisual
  away: TeamVisual
  score: Score
  minute: number
}

function SideBadge({ team, flipped }: { team: TeamVisual; flipped: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 ${flipped ? 'flex-row-reverse' : ''}`}>
      <span
        aria-hidden="true"
        style={{ backgroundColor: team.kit.outfield }}
        className="h-3.5 w-1 rounded-pill"
      />
      <span className="font-display text-xs font-bold tracking-wide text-fg">{team.code}</span>
    </span>
  )
}

export function StageScoreboard({ home, away, score, minute }: StageScoreboardProps) {
  const t = useTranslation()

  return (
    <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2.5 rounded-control bg-canvas/85 px-2.5 py-1.5 ring-1 ring-line-strong backdrop-blur-sm">
      <SideBadge team={home} flipped={false} />
      <span className="font-display text-sm font-extrabold tabular-nums text-fg">
        {score.home}–{score.away}
      </span>
      <SideBadge team={away} flipped />
      <span className="h-3.5 w-px bg-line-strong" aria-hidden="true" />
      <span
        aria-label={t.live.minuteLabel(minute)}
        className="font-display text-xs font-bold tabular-nums text-accent"
      >
        {minute}'
      </span>
    </div>
  )
}
