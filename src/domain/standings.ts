import type { Score, StandingRow, Team } from './types'

export type Qualification = 'LAST_16' | 'PLAY_OFF' | 'ELIMINATED'

const LAST_16_CUTOFF = 8
const PLAY_OFF_CUTOFF = 24

export const QUALIFICATION_OUTCOME_LABEL: Record<Qualification, string> = {
  LAST_16: 'Son 16 turuna yükseldi',
  PLAY_OFF: 'Play-off turuna kaldı',
  ELIMINATED: 'Lig aşamasında elendi',
}

export const QUALIFICATION_LABEL: Record<Qualification, string> = {
  LAST_16: 'Son 16 turuna doğrudan',
  PLAY_OFF: 'Play-off turu',
  ELIMINATED: 'Elenir',
}

export function qualificationAt(position: number): Qualification {
  if (position <= LAST_16_CUTOFF) return 'LAST_16'
  if (position <= PLAY_OFF_CUTOFF) return 'PLAY_OFF'
  return 'ELIMINATED'
}

function emptyRow(team: Team): StandingRow {
  return {
    team,
    position: 0,
    qualification: 'ELIMINATED',
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    awayGoalsFor: 0,
    awayWins: 0,
    points: 0,
  }
}

function applyResult(row: StandingRow, goalsFor: number, goalsAgainst: number, isAway: boolean) {
  row.played += 1
  row.goalsFor += goalsFor
  row.goalsAgainst += goalsAgainst
  row.goalDifference = row.goalsFor - row.goalsAgainst
  if (isAway) row.awayGoalsFor += goalsFor
  if (goalsFor > goalsAgainst) {
    row.wins += 1
    row.points += 3
    if (isAway) row.awayWins += 1
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1
    row.points += 1
  } else {
    row.losses += 1
  }
}

function byUefaTiebreakers(left: StandingRow, right: StandingRow): number {
  return (
    right.points - left.points ||
    right.goalDifference - left.goalDifference ||
    right.goalsFor - left.goalsFor ||
    right.awayGoalsFor - left.awayGoalsFor ||
    right.wins - left.wins ||
    right.awayWins - left.awayWins ||
    right.team.strength - left.team.strength ||
    left.team.name.localeCompare(right.team.name)
  )
}

interface PlayedMatch {
  homeTeamId: string
  awayTeamId: string
  score: Score
}

export function buildStandings(teams: Team[], results: PlayedMatch[]): StandingRow[] {
  const rows = new Map(teams.map((team) => [team.id, emptyRow(team)]))

  for (const result of results) {
    const home = rows.get(result.homeTeamId)
    const away = rows.get(result.awayTeamId)
    if (!home || !away) continue
    applyResult(home, result.score.home, result.score.away, false)
    applyResult(away, result.score.away, result.score.home, true)
  }

  return [...rows.values()].sort(byUefaTiebreakers).map((row, index) => ({
    ...row,
    position: index + 1,
    qualification: qualificationAt(index + 1),
  }))
}
