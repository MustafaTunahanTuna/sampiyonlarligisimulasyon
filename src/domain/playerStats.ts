import { drawPool, getTeam } from './drawPool'
import { matchSeedKey, simulateMatchReport } from './engine'
import type { PredictionMap, Team } from './types'

const RANKING_SIZE = 10

export interface PlayerTally {
  name: string
  team: Team
  goals: number
  assists: number
}

function ensure(tallies: Map<string, PlayerTally>, teamId: string, name: string): PlayerTally {
  const id = `${teamId}|${name}`
  const existing = tallies.get(id)
  if (existing !== undefined) return existing
  const created: PlayerTally = { name, team: getTeam(teamId), goals: 0, assists: 0 }
  tallies.set(id, created)
  return created
}

export function playerTallies(
  predictions: PredictionMap,
  seed: string,
  unpredictability: number,
): PlayerTally[] {
  const tallies = new Map<string, PlayerTally>()

  for (const match of drawPool.matches) {
    if (predictions[match.id]?.source !== 'simulated') continue
    const home = getTeam(match.homeTeamId)
    const away = getTeam(match.awayTeamId)
    const report = simulateMatchReport(
      home,
      away,
      matchSeedKey(seed, match.id),
      unpredictability,
    )

    for (const event of report.timeline) {
      const teamId = event.side === 'home' ? home.id : away.id
      if (event.actor !== null && (event.kind === 'GOAL' || event.kind === 'PENALTY_GOAL')) {
        ensure(tallies, teamId, event.actor).goals += 1
      }
      if (event.assist !== null) {
        ensure(tallies, teamId, event.assist).assists += 1
      }
    }
  }

  return [...tallies.values()]
}

export function topGoalscorers(tallies: PlayerTally[]): PlayerTally[] {
  return [...tallies]
    .filter((tally) => tally.goals > 0)
    .sort((left, right) => right.goals - left.goals || right.assists - left.assists)
    .slice(0, RANKING_SIZE)
}

export function topAssistProviders(tallies: PlayerTally[]): PlayerTally[] {
  return [...tallies]
    .filter((tally) => tally.assists > 0)
    .sort((left, right) => right.assists - left.assists || right.goals - left.goals)
    .slice(0, RANKING_SIZE)
}

export function simulatedMatchCount(predictions: PredictionMap): number {
  return drawPool.matches.filter((match) => predictions[match.id]?.source === 'simulated').length
}
