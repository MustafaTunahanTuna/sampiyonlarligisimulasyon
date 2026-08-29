import { goalMouth, teamShape, zoneLine } from './formations'
import { easeIn, easeInOut, easeOut, linear, lerpPoint, pitchDistance } from './geometry'
import { carrierInZone, kickOffCarrier, receiverFor, runnerFor } from './squad'
import { hashSeed } from '../../domain/random'
import type { Point } from './geometry'
import type { ChainAction, MatchEvent, MatchPhase, Side, Zone } from '../../domain/engine'

const INTERCEPT_REACH = 0.76
const KICK_OFF_BALL: Point = { x: 0.5, y: 0.5 }

const LIFT_BY_ACTION: Record<ChainAction, number> = {
  PASS: 0.08,
  HOLD: 0,
  DRIBBLE: 0,
  LONG_BALL: 1,
  CROSS: 0.82,
  SHOOT: 0.4,
}

const EASING: Record<ChainAction, (progress: number) => number> = {
  PASS: easeOut,
  HOLD: easeOut,
  DRIBBLE: linear,
  LONG_BALL: easeOut,
  CROSS: easeInOut,
  SHOOT: easeIn,
}

const ZONE_SPREAD: Record<Zone, number> = {
  0: -1,
  1: -0.5,
  2: 0,
  3: 0.5,
  4: 1,
}

export interface PhasePlan {
  side: Side
  carrier: number
  receiver: number
  runner: number
  lineStart: number
  lineEnd: number
  spreadStart: number
  spreadEnd: number
  ballFrom: Point
  ballTo: Point
  lift: number
  isShot: boolean
  ease: (progress: number) => number
}

function shotTargetY(event: MatchEvent | undefined, seed: number): number {
  const drift = (hashSeed(`shot:${seed}`) % 1000) / 1000 - 0.5
  switch (event?.kind) {
    case 'GOAL':
    case 'PENALTY_GOAL':
      return 0.5 + drift * 0.2
    case 'SHOT_OFF':
      return 0.5 + Math.sign(drift || 1) * 0.17
    case 'POST':
      return 0.5 + Math.sign(drift || 1) * 0.11
    default:
      return 0.5 + drift * 0.08
  }
}

function nearestSlot(points: Point[], target: Point): number {
  let best = 0
  let bestDistance = Infinity
  points.forEach((point, index) => {
    const candidate = pitchDistance(point, target)
    if (candidate < bestDistance) {
      bestDistance = candidate
      best = index
    }
  })
  return best
}

function isScoringEvent(event: MatchEvent | undefined): boolean {
  return event?.kind === 'GOAL' || event?.kind === 'PENALTY_GOAL'
}

interface Handover {
  ball: Point
  carrier: number
  side: Side | null
  restarted: boolean
}

function carrierAfterHandover(
  handover: Handover,
  phase: MatchPhase,
  startShape: Point[],
): number {
  if (handover.side === phase.side && !handover.restarted) return handover.carrier
  if (handover.restarted || handover.side === null) return kickOffCarrier()
  return nearestSlot(startShape, handover.ball)
}

export function buildPhasePlans(
  phases: MatchPhase[],
  eventByPhase: Map<number, MatchEvent>,
): PhasePlan[] {
  let handover: Handover = { ball: KICK_OFF_BALL, carrier: kickOffCarrier(), side: null, restarted: true }

  return phases.map((phase) => {
    const lineStart = zoneLine(phase.side, phase.fromZone)
    const startShape = teamShape(phase.side, lineStart)
    const claimed = carrierAfterHandover(handover, phase, startShape)
    const carrier = carrierInZone(claimed, phase.fromZone, (slot) =>
      pitchDistance(startShape[slot], startShape[claimed]),
    )

    const event = eventByPhase.get(phase.index)
    const isShot = phase.action === 'SHOOT'
    const lineEnd = isShot ? lineStart : zoneLine(phase.side, phase.toZone)
    const endShape = teamShape(phase.side, lineEnd)
    const receiver = receiverFor(
      phase.action,
      carrier,
      phase.toZone,
      hashSeed(`pass:${phase.index}`),
      (slot) => pitchDistance(endShape[slot], startShape[carrier]),
    )

    const ballFrom = handover.restarted ? KICK_OFF_BALL : handover.ball
    const reach = phase.outcome === 'TURNOVER' ? INTERCEPT_REACH : 1
    const ballTo = isShot
      ? { x: goalMouth(phase.side).x, y: shotTargetY(event, phase.index) }
      : lerpPoint(ballFrom, endShape[receiver], reach)

    handover = {
      ball: ballTo,
      carrier: receiver,
      side: phase.side,
      restarted: isScoringEvent(event),
    }

    return {
      side: phase.side,
      carrier,
      receiver,
      runner: runnerFor(carrier, receiver, hashSeed(`run:${phase.index}`)),
      lineStart,
      lineEnd,
      spreadStart: ZONE_SPREAD[phase.fromZone],
      spreadEnd: ZONE_SPREAD[phase.toZone],
      ballFrom,
      ballTo,
      lift: LIFT_BY_ACTION[phase.action],
      isShot,
      ease: EASING[phase.action],
    }
  })
}
