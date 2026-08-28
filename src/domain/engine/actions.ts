import type { RandomSource } from '../random'
import { ACTION_WEIGHTS } from './zones'
import type { ChainAction, TeamProfile, Zone } from './types'

const CHAIN_ACTIONS: ChainAction[] = ['PASS', 'HOLD', 'DRIBBLE', 'LONG_BALL', 'CROSS', 'SHOOT']

const BASE_SUCCESS: Record<ChainAction, number> = {
  PASS: 0.8,
  HOLD: 0.93,
  DRIBBLE: 0.6,
  LONG_BALL: 0.47,
  CROSS: 0.36,
  SHOOT: 1,
}

const EDGE_STEEPNESS = 2.2
const EDGE_FLOOR = 0.72
const EDGE_SWING = 0.56

function shootBias(profile: TeamProfile): number {
  return 0.75 + (profile.attack / 100) * 0.5
}

export function chooseAction(zone: Zone, profile: TeamProfile, random: RandomSource): ChainAction {
  const weights = ACTION_WEIGHTS[zone]
  const bias = shootBias(profile)
  let total = 0
  for (const action of CHAIN_ACTIONS) {
    total += action === 'SHOOT' ? weights[action] * bias : weights[action]
  }

  let target = random() * total
  for (const action of CHAIN_ACTIONS) {
    target -= action === 'SHOOT' ? weights[action] * bias : weights[action]
    if (target <= 0) return action
  }
  return 'HOLD'
}

export function attackingRating(action: ChainAction, profile: TeamProfile): number {
  return action === 'CROSS' || action === 'LONG_BALL' ? profile.attack : profile.midfield
}

export function edgeFactor(attackRating: number, defenceRating: number, unpredictability: number) {
  const diff = ((attackRating - defenceRating) / 100) * (1 - unpredictability)
  return 1 / (1 + Math.exp(-EDGE_STEEPNESS * diff))
}

export function actionSuccessChance(
  action: ChainAction,
  attacker: TeamProfile,
  defender: TeamProfile,
  unpredictability: number,
): number {
  const edge = edgeFactor(attackingRating(action, attacker), defender.defence, unpredictability)
  return Math.min(0.97, Math.max(0.05, BASE_SUCCESS[action] * (EDGE_FLOOR + EDGE_SWING * edge)))
}
