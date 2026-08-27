import { drawPool, getTeam } from './drawPool'
import type { Fixture, Match, Outcome, SeasonRecord, Team, Venue } from './types'

const VENUE_ORDER: Record<Venue, number> = { HOME: 0, AWAY: 1 }

function outcomeOf(goalsFor: number, goalsAgainst: number): Outcome {
  if (goalsFor > goalsAgainst) return 'WIN'
  if (goalsFor < goalsAgainst) return 'LOSS'
  return 'DRAW'
}

function toFixture(match: Match, teamId: string): Fixture {
  const venue: Venue = match.homeTeamId === teamId ? 'HOME' : 'AWAY'
  const opponent = getTeam(venue === 'HOME' ? match.awayTeamId : match.homeTeamId)
  if (match.score === null) {
    return { match, opponent, venue, goalsFor: null, goalsAgainst: null, outcome: null }
  }
  const goalsFor = venue === 'HOME' ? match.score.home : match.score.away
  const goalsAgainst = venue === 'HOME' ? match.score.away : match.score.home
  return { match, opponent, venue, goalsFor, goalsAgainst, outcome: outcomeOf(goalsFor, goalsAgainst) }
}

function byMatchdayThenPot(left: Fixture, right: Fixture): number {
  if (left.match.matchday !== null && right.match.matchday !== null) {
    return left.match.matchday - right.match.matchday
  }
  return (
    left.opponent.pot - right.opponent.pot ||
    VENUE_ORDER[left.venue] - VENUE_ORDER[right.venue] ||
    left.opponent.name.localeCompare(right.opponent.name)
  )
}

export function fixturesOf(team: Team): Fixture[] {
  return drawPool.matches
    .filter((match) => match.homeTeamId === team.id || match.awayTeamId === team.id)
    .map((match) => toFixture(match, team.id))
    .sort(byMatchdayThenPot)
}

export function recordOf(fixtures: Fixture[]): SeasonRecord {
  return fixtures.reduce<SeasonRecord>(
    (record, fixture) => {
      if (fixture.outcome === null || fixture.goalsFor === null || fixture.goalsAgainst === null) {
        return record
      }
      return {
        played: record.played + 1,
        wins: record.wins + (fixture.outcome === 'WIN' ? 1 : 0),
        draws: record.draws + (fixture.outcome === 'DRAW' ? 1 : 0),
        losses: record.losses + (fixture.outcome === 'LOSS' ? 1 : 0),
        goalsFor: record.goalsFor + fixture.goalsFor,
        goalsAgainst: record.goalsAgainst + fixture.goalsAgainst,
        points: record.points + (fixture.outcome === 'WIN' ? 3 : fixture.outcome === 'DRAW' ? 1 : 0),
      }
    },
    { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  )
}
