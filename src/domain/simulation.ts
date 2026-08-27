import { createRandom, hashSeed, poisson } from './random'
import type { Match, Score, Team } from './types'

const BASE_HOME_GOALS = 1.68
const BASE_AWAY_GOALS = 1.38
const STRENGTH_WEIGHT = 0.9
const STRENGTH_RANGE = 100

export interface MatchOdds {
  expectedHomeGoals: number
  expectedAwayGoals: number
}

export function expectedGoals(home: Team, away: Team, unpredictability: number): MatchOdds {
  const edge = ((home.strength - away.strength) / STRENGTH_RANGE) * STRENGTH_WEIGHT * (1 - unpredictability)
  return {
    expectedHomeGoals: BASE_HOME_GOALS * Math.exp(edge),
    expectedAwayGoals: BASE_AWAY_GOALS * Math.exp(-edge),
  }
}

export function simulateMatch(
  match: Match,
  home: Team,
  away: Team,
  seed: string,
  unpredictability: number,
): Score {
  const random = createRandom(hashSeed(`${seed}:${match.id}`))
  const odds = expectedGoals(home, away, unpredictability)
  return {
    home: poisson(odds.expectedHomeGoals, random),
    away: poisson(odds.expectedAwayGoals, random),
  }
}
