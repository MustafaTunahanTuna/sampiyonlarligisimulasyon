import { createRandom, hashSeed, poisson } from './random'
import { expectedGoals, simulateScore } from './simulation'
import type { Score, Team } from './types'

const EXTRA_TIME_SHARE = 1 / 3
const PENALTY_ROUNDS = 5
const BASE_CONVERSION = 0.76
const STRENGTH_CONVERSION_SWING = 0.08

export function simulateLeg(
  home: Team,
  away: Team,
  seedKey: string,
  unpredictability: number,
): Score {
  return simulateScore(home, away, seedKey, unpredictability)
}

export function simulateExtraTime(
  home: Team,
  away: Team,
  seedKey: string,
  unpredictability: number,
): Score {
  const random = createRandom(hashSeed(`${seedKey}:et`))
  const odds = expectedGoals(home, away, unpredictability)
  return {
    home: poisson(odds.expectedHomeGoals * EXTRA_TIME_SHARE, random),
    away: poisson(odds.expectedAwayGoals * EXTRA_TIME_SHARE, random),
  }
}

function conversionRate(shooter: Team, opponent: Team): number {
  const edge = (shooter.strength - opponent.strength) / 100
  return Math.min(0.95, Math.max(0.55, BASE_CONVERSION + edge * STRENGTH_CONVERSION_SWING))
}

export function simulatePenalties(home: Team, away: Team, seedKey: string): Score {
  const random = createRandom(hashSeed(`${seedKey}:pen`))
  const homeRate = conversionRate(home, away)
  const awayRate = conversionRate(away, home)
  let homeGoals = 0
  let awayGoals = 0

  for (let round = 0; round < PENALTY_ROUNDS; round += 1) {
    if (random() < homeRate) homeGoals += 1
    if (random() < awayRate) awayGoals += 1
  }

  while (homeGoals === awayGoals) {
    const homeScored = random() < homeRate
    const awayScored = random() < awayRate
    if (homeScored) homeGoals += 1
    if (awayScored) awayGoals += 1
  }

  return { home: homeGoals, away: awayGoals }
}
