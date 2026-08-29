import { useTranslation } from '../../i18n/useTranslation'
import type { MatchEvent, MatchEventKind, Side } from '../../domain/engine'
import type { Messages } from '../../i18n/messages/messages'
import type { Team } from '../../domain/types'

const SUMMARY_KINDS = ['GOAL', 'PENALTY_GOAL', 'RED_CARD', 'YELLOW_CARD'] as const

type SummaryKind = (typeof SUMMARY_KINDS)[number]

interface SummaryEvent extends MatchEvent {
  kind: SummaryKind
}

interface MatchSummaryProps {
  events: MatchEvent[]
  teams: Record<Side, Team>
}

function isSummaryEvent(event: MatchEvent): event is SummaryEvent {
  return SUMMARY_KINDS.some((candidate: MatchEventKind) => candidate === event.kind)
}

function labelFor(kind: SummaryKind, t: Messages): string {
  switch (kind) {
    case 'GOAL':
      return t.live.banner.goal
    case 'PENALTY_GOAL':
      return t.live.banner.penaltyGoal
    case 'YELLOW_CARD':
      return t.live.banner.yellowCard
    case 'RED_CARD':
      return t.live.banner.redCard
  }
}

function SummaryIcon({ kind, label }: { kind: SummaryKind; label: string }) {
  if (kind === 'GOAL' || kind === 'PENALTY_GOAL') {
    return (
      <svg viewBox="0 0 12 12" role="img" aria-label={label} className="size-3 shrink-0 text-fg">
        <circle cx="6" cy="6" r="5" fill="currentColor" />
        <circle cx="6" cy="6" r="1.9" className="fill-canvas" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 12 12" role="img" aria-label={label} className="size-3 shrink-0">
      <rect
        x="3"
        y="1.5"
        width="6"
        height="9"
        rx="1.2"
        className={kind === 'RED_CARD' ? 'fill-danger' : 'fill-highlight'}
      />
    </svg>
  )
}

function SummaryRow({ event, alignEnd }: { event: SummaryEvent; alignEnd: boolean }) {
  const t = useTranslation()
  const label = labelFor(event.kind, t)

  return (
    <li
      className={`flex items-center gap-1.5 py-0.5 text-sm ${alignEnd ? 'flex-row-reverse text-right' : ''}`}
    >
      <SummaryIcon kind={event.kind} label={label} />
      <span className="font-display text-xs tabular-nums text-muted">{event.minute}'</span>
      <span className="min-w-0 truncate text-fg">
        {event.actor ?? label}
        {event.kind === 'PENALTY_GOAL' ? ` ${t.live.penaltyMark}` : ''}
      </span>
    </li>
  )
}

function SideColumn({
  events,
  side,
  team,
}: {
  events: SummaryEvent[]
  side: Side
  team: Team
}) {
  const own = events.filter((event) => event.side === side)
  if (own.length === 0) return <div />

  return (
    <ol aria-label={team.name} className="min-w-0">
      {own.map((event, index) => (
        <SummaryRow
          key={`${event.second}-${event.kind}-${index}`}
          event={event}
          alignEnd={side === 'home'}
        />
      ))}
    </ol>
  )
}

export function MatchSummary({ events, teams }: MatchSummaryProps) {
  const t = useTranslation()
  const notable = events.filter(isSummaryEvent)

  if (notable.length === 0) {
    return (
      <p className="rounded-control bg-raised px-4 py-3 text-sm text-muted">{t.live.summaryEmpty}</p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 rounded-control bg-raised/60 px-3 py-2.5 ring-1 ring-line">
      <SideColumn events={notable} side="home" team={teams.home} />
      <SideColumn events={notable} side="away" team={teams.away} />
    </div>
  )
}
