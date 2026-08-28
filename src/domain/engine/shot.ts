import type { RandomSource } from '../random'
import { edgeFactor } from './actions'
import { ZONE_XG } from './zones'
import type { MatchEventKind, TeamProfile, Zone } from './types'

const CROSS_ASSIST_BONUS = 1.45
const SET_PIECE_PENALTY = 0.62
const BLOCK_SHARE = 0.27
const OFF_TARGET_SHARE = 0.465
const POST_SHARE_OF_OFF_TARGET = 0.09
const KEEPER_BASELINE = 60
const KEEPER_SWING = 0.3
const MAX_GOAL_CHANCE = 0.85

export const PENALTY_CONVERSION = 0.76

export type ShotResult = Extract<
  MatchEventKind,
  'GOAL' | 'SHOT_SAVED' | 'SHOT_OFF' | 'SHOT_BLOCKED' | 'POST'
>

export interface ShotContext {
  zone: Zone
  fromCross: boolean
  fromSetPiece: boolean
}

export function shotQuality(
  context: ShotContext,
  attacker: TeamProfile,
  defender: TeamProfile,
  unpredictability: number,
): number {
  const edge = edgeFactor(attacker.attack, defender.defence, unpredictability)
  const base = ZONE_XG[context.zone] * (0.7 + 0.6 * edge)
  const crossed = context.fromCross ? base * CROSS_ASSIST_BONUS : base
  return context.fromSetPiece ? crossed * SET_PIECE_PENALTY : crossed
}

function keeperFactor(keeper: TeamProfile): number {
  return 1 - ((keeper.goalkeeping - KEEPER_BASELINE) / 100) * KEEPER_SWING
}

export function resolveShot(
  quality: number,
  finishingScale: number,
  keeper: TeamProfile,
  random: RandomSource,
): ShotResult {
  const goalChance = Math.min(MAX_GOAL_CHANCE, quality * finishingScale * keeperFactor(keeper))
  const drawn = random()
  if (drawn < goalChance) return 'GOAL'

  const remainder = (drawn - goalChance) / Math.max(1e-6, 1 - goalChance)
  if (remainder < BLOCK_SHARE) return 'SHOT_BLOCKED'
  if (remainder < BLOCK_SHARE + OFF_TARGET_SHARE) {
    const offTargetPosition = (remainder - BLOCK_SHARE) / OFF_TARGET_SHARE
    return offTargetPosition < POST_SHARE_OF_OFF_TARGET ? 'POST' : 'SHOT_OFF'
  }
  return 'SHOT_SAVED'
}

export function penaltyConverted(keeper: TeamProfile, random: RandomSource): boolean {
  return random() < PENALTY_CONVERSION * keeperFactor(keeper)
}
