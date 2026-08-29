import { clamp } from './geometry'
import { hashSeed } from '../../domain/random'
import type { Point } from './geometry'
import type { MatchEvent, MatchPhase, Side } from '../../domain/engine'

const THROW_IN_SHARE = 34
const SIDELINE_INSET = 0.018
const CORNER_INSET = 0.022
const GOAL_KICK_DEPTH = 0.065
const CENTRE: Point = { x: 0.5, y: 0.5 }

export const RESTARTS = ['none', 'kickOff', 'corner', 'throwIn', 'goalKick'] as const

export type Restart = (typeof RESTARTS)[number]

function attackingCornerX(side: Side): number {
  return side === 'home' ? 1 - CORNER_INSET : CORNER_INSET
}

function ownGoalX(side: Side): number {
  return side === 'home' ? GOAL_KICK_DEPTH : 1 - GOAL_KICK_DEPTH
}

export function restartBefore(
  phase: MatchPhase,
  ownEvent: MatchEvent | undefined,
  previousPhase: MatchPhase | undefined,
  previousEvent: MatchEvent | undefined,
): Restart {
  if (previousPhase === undefined) return 'kickOff'
  if (ownEvent?.kind === 'CORNER') return 'corner'
  if (previousEvent?.kind === 'GOAL' || previousEvent?.kind === 'PENALTY_GOAL') return 'kickOff'
  if (previousEvent?.kind === 'SHOT_OFF') return 'goalKick'
  if (
    previousPhase.outcome === 'TURNOVER' &&
    hashSeed(`throw:${phase.index}`) % 100 < THROW_IN_SHARE
  ) {
    return 'throwIn'
  }
  return 'none'
}

export function sidelineFor(ball: Point, seed: number): Point {
  const above = ball.y === 0.5 ? hashSeed(`line:${seed}`) % 2 === 0 : ball.y < 0.5
  return { x: clamp(ball.x, 0.06, 0.94), y: above ? SIDELINE_INSET : 1 - SIDELINE_INSET }
}

export function restartBall(
  restart: Restart,
  side: Side,
  ball: Point,
  seed: number,
): Point | null {
  switch (restart) {
    case 'kickOff':
      return CENTRE
    case 'corner':
      return {
        x: attackingCornerX(side),
        y: hashSeed(`corner:${seed}`) % 2 === 0 ? CORNER_INSET : 1 - CORNER_INSET,
      }
    case 'goalKick':
      return { x: ownGoalX(side), y: 0.5 }
    case 'throwIn':
      return sidelineFor(ball, seed)
    case 'none':
      return null
  }
}
