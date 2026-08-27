import type { Fixture, Outcome, Venue } from '../../domain/types'

const KICK_OFF_FORMAT = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export const VENUE_LABEL: Record<Venue, string> = { HOME: 'Ev', AWAY: 'Deplasman' }

export const OUTCOME_LABEL: Record<Outcome, string> = {
  WIN: 'Galibiyet',
  DRAW: 'Beraberlik',
  LOSS: 'Mağlubiyet',
}

export function formatKickOff(kickOff: string | null): string | null {
  return kickOff === null ? null : KICK_OFF_FORMAT.format(new Date(kickOff))
}

export function formatScore(fixture: Fixture): string | null {
  if (fixture.goalsFor === null || fixture.goalsAgainst === null) return null
  return `${fixture.goalsFor} – ${fixture.goalsAgainst}`
}

export const OUTCOME_SHORT: Record<Outcome, string> = { WIN: 'G', DRAW: 'B', LOSS: 'M' }
