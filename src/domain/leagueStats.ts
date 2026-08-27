import { drawPool, getTeam } from './drawPool'
import { scoreFor } from './predictedResults'
import type { PredictionMap, StandingRow, Team } from './types'

export interface PlayedMatchSummary {
  matchId: string
  homeTeam: Team
  awayTeam: Team
  homeGoals: number
  awayGoals: number
  totalGoals: number
  margin: number
}

export interface LeagueStats {
  playedCount: number
  totalCount: number
  totalGoals: number
  goalsPerMatch: number
  homeWins: number
  draws: number
  awayWins: number
  cleanSheets: number
  biggestWin: PlayedMatchSummary | null
  highestScoring: PlayedMatchSummary | null
}

export interface TeamRanking {
  team: Team
  value: number
  detail: string
}

export function playedMatches(predictions: PredictionMap): PlayedMatchSummary[] {
  return drawPool.matches.flatMap((match) => {
    const score = scoreFor(match, predictions)
    if (score === null) return []
    return [
      {
        matchId: match.id,
        homeTeam: getTeam(match.homeTeamId),
        awayTeam: getTeam(match.awayTeamId),
        homeGoals: score.home,
        awayGoals: score.away,
        totalGoals: score.home + score.away,
        margin: Math.abs(score.home - score.away),
      },
    ]
  })
}

function bestBy(
  matches: PlayedMatchSummary[],
  rank: (match: PlayedMatchSummary) => number,
): PlayedMatchSummary | null {
  return matches.reduce<PlayedMatchSummary | null>(
    (best, match) => (best === null || rank(match) > rank(best) ? match : best),
    null,
  )
}

export function leagueStats(matches: PlayedMatchSummary[]): LeagueStats {
  const totalGoals = matches.reduce((total, match) => total + match.totalGoals, 0)
  return {
    playedCount: matches.length,
    totalCount: drawPool.matches.length,
    totalGoals,
    goalsPerMatch: matches.length === 0 ? 0 : totalGoals / matches.length,
    homeWins: matches.filter((match) => match.homeGoals > match.awayGoals).length,
    draws: matches.filter((match) => match.homeGoals === match.awayGoals).length,
    awayWins: matches.filter((match) => match.homeGoals < match.awayGoals).length,
    cleanSheets: matches.filter((match) => match.homeGoals === 0 || match.awayGoals === 0).length,
    biggestWin: bestBy(matches, (match) => match.margin * 100 + match.totalGoals),
    highestScoring: bestBy(matches, (match) => match.totalGoals),
  }
}

const RANKING_SIZE = 5

export function topScorers(rows: StandingRow[]): TeamRanking[] {
  return [...rows]
    .sort((left, right) => right.goalsFor - left.goalsFor || right.goalDifference - left.goalDifference)
    .slice(0, RANKING_SIZE)
    .map((row) => ({ team: row.team, value: row.goalsFor, detail: `${row.played} maç` }))
}

export function bestDefences(rows: StandingRow[]): TeamRanking[] {
  return [...rows]
    .sort((left, right) => left.goalsAgainst - right.goalsAgainst || right.goalDifference - left.goalDifference)
    .slice(0, RANKING_SIZE)
    .map((row) => ({ team: row.team, value: row.goalsAgainst, detail: `${row.played} maç` }))
}

export function biggestOverperformers(rows: StandingRow[]): TeamRanking[] {
  const byStrength = [...rows].sort((left, right) => right.team.strength - left.team.strength)
  const expectedPosition = new Map(byStrength.map((row, index) => [row.team.id, index + 1]))
  return rows
    .map((row) => ({
      team: row.team,
      value: (expectedPosition.get(row.team.id) ?? row.position) - row.position,
      detail: `beklenen ${expectedPosition.get(row.team.id)}.`,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, RANKING_SIZE)
}
