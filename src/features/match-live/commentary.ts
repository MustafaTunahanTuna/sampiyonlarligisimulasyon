import type { MatchEvent, Side } from '../../domain/engine'
import type { Messages } from '../../i18n/messages/messages'
import type { Team } from '../../domain/types'

export function commentaryFor(
  event: MatchEvent,
  teams: Record<Side, Team>,
  t: Messages,
): string {
  return t.live.commentary[event.kind](teams[event.side].name, t.live.zonePhrase[event.zone])
}

export function clockLabel(event: MatchEvent): string {
  return `${event.minute}'`
}
