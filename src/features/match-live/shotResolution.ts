import { clamp, lerpPoint } from './geometry'
import { hashSeed } from '../../domain/random'
import type { Point } from './geometry'
import type { MatchEvent, Side } from '../../domain/engine'

const POST_HALF_GAP = 0.054
const NET_DEPTH = 0.013
const GOAL_INSIDE_SPAN = 0.041
const SAVE_GLOVE_GAP = 0.033
const SAVE_REACH_SPAN = 0.05
const OFF_BEYOND_LINE = 0.042
const OFF_WIDE_BASE = 0.078
const OFF_WIDE_SPAN = 0.11
const BLOCK_SHARE = 0.3
const POST_REBOUND_DEPTH = 0.09
const KEEPER_GUARD_GAP = 0.028
const KEEPER_BEATEN_REACH = 0.45
const KEEPER_WATCH_REACH = 0.3

export interface ShotPlan {
  target: Point
  deflectTo: Point | null
  deflectAt: number
  keeperTo: Point
}

function attackingSign(side: Side): number {
  return side === 'home' ? 1 : -1
}

function goalLineX(side: Side): number {
  return side === 'home' ? 1 : 0
}

function driftOf(seed: number): number {
  return (hashSeed(`shot:${seed}`) % 1000) / 1000 - 0.5
}

function keeperFor(side: Side, targetY: number, reach: number): Point {
  return {
    x: goalLineX(side) - attackingSign(side) * KEEPER_GUARD_GAP,
    y: 0.5 + (targetY - 0.5) * reach,
  }
}

function goalShot(side: Side, drift: number): ShotPlan {
  const target = {
    x: goalLineX(side) + attackingSign(side) * NET_DEPTH,
    y: 0.5 + drift * 2 * GOAL_INSIDE_SPAN,
  }
  return { target, deflectTo: null, deflectAt: 1, keeperTo: keeperFor(side, target.y, KEEPER_BEATEN_REACH) }
}

function postShot(side: Side, drift: number, seed: number): ShotPlan {
  const postY = 0.5 + Math.sign(drift || 1) * POST_HALF_GAP
  const target = { x: goalLineX(side), y: postY }
  const bounce = (hashSeed(`rebound:${seed}`) % 1000) / 1000
  return {
    target,
    deflectTo: {
      x: goalLineX(side) - attackingSign(side) * (POST_REBOUND_DEPTH + bounce * 0.05),
      y: postY + (postY > 0.5 ? -1 : 1) * (0.02 + bounce * 0.03),
    },
    deflectAt: 0.8,
    keeperTo: keeperFor(side, postY, KEEPER_WATCH_REACH),
  }
}

function wideShot(side: Side, drift: number): ShotPlan {
  const target = {
    x: goalLineX(side) + attackingSign(side) * OFF_BEYOND_LINE,
    y: 0.5 + Math.sign(drift || 1) * (OFF_WIDE_BASE + Math.abs(drift) * OFF_WIDE_SPAN),
  }
  return { target, deflectTo: null, deflectAt: 1, keeperTo: keeperFor(side, target.y, KEEPER_WATCH_REACH) }
}

function savedShot(side: Side, drift: number): ShotPlan {
  const target = {
    x: goalLineX(side) - attackingSign(side) * SAVE_GLOVE_GAP,
    y: 0.5 + drift * 2 * SAVE_REACH_SPAN,
  }
  return { target, deflectTo: null, deflectAt: 1, keeperTo: { x: target.x, y: target.y } }
}

function blockedShot(side: Side, drift: number, from: Point): ShotPlan {
  const aim = { x: goalLineX(side), y: 0.5 + drift * 0.12 }
  const target = lerpPoint(from, aim, BLOCK_SHARE)
  return {
    target,
    deflectTo: {
      x: clamp(target.x - attackingSign(side) * 0.035, 0.02, 0.98),
      y: clamp(target.y + Math.sign(drift || 1) * 0.06, 0.03, 0.97),
    },
    deflectAt: 0.7,
    keeperTo: keeperFor(side, aim.y, KEEPER_WATCH_REACH),
  }
}

export function resolveShot(
  event: MatchEvent | undefined,
  side: Side,
  seed: number,
  from: Point,
): ShotPlan {
  const drift = driftOf(seed)
  switch (event?.kind) {
    case 'GOAL':
    case 'PENALTY_GOAL':
      return goalShot(side, drift)
    case 'POST':
      return postShot(side, drift, seed)
    case 'SHOT_OFF':
      return wideShot(side, drift)
    case 'SHOT_BLOCKED':
      return blockedShot(side, drift, from)
    case 'PENALTY_MISSED':
      return hashSeed(`penmiss:${seed}`) % 2 === 0 ? savedShot(side, drift) : wideShot(side, drift)
    default:
      return savedShot(side, drift)
  }
}
