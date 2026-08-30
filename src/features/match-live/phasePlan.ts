import { teamShape, zoneLine } from './formations'
import { clamp, easeInOut, easeOut, easeOutStrong, linear, lerpPoint, pitchDistance } from './geometry'
import { restartBall, restartBefore, sidelineFor } from './matchRestarts'
import { resolveShot } from './shotResolution'
import { FULL_SQUAD, carrierInZone, kickOffCarrier, outfieldSlots, receiverFor, runnerFor } from './squad'
import { hashSeed } from '../../domain/random'
import type { OnPitch } from './squad'
import type { Point } from './geometry'
import type { Restart } from './matchRestarts'
import type { ChainAction, MatchEvent, MatchReport, Side, Zone } from '../../domain/engine'

const INTERCEPT_REACH = 0.76
const ZONE_DRIFT = 0.035
const DEPTH_LIMIT = 0.965

const LIFT_BY_ACTION: Record<ChainAction, number> = {
  PASS: 0.08,
  HOLD: 0,
  DRIBBLE: 0,
  LONG_BALL: 1,
  CROSS: 0.82,
  SHOOT: 0.4,
}

const EASING: Record<ChainAction, (progress: number) => number> = {
  PASS: easeOutStrong,
  HOLD: easeOutStrong,
  DRIBBLE: linear,
  LONG_BALL: easeOut,
  CROSS: easeInOut,
  SHOOT: linear,
}

const KICK_ACTIONS: ReadonlySet<ChainAction> = new Set(['PASS', 'CROSS', 'LONG_BALL', 'SHOOT'])

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
  deflectTo: Point | null
  deflectAt: number
  keeperTo: Point | null
  travel: number
  windup: boolean
  lift: number
  isShot: boolean
  restart: Restart
  onPitch: Record<Side, OnPitch>
  ease: (progress: number) => number
}

function nearestSlot(points: Point[], target: Point, onPitch: OnPitch): number {
  let best = kickOffCarrier()
  let bestDistance = Infinity
  points.forEach((point, index) => {
    if (!onPitch.has(index)) return
    const candidate = pitchDistance(point, target)
    if (candidate < bestDistance) {
      bestDistance = candidate
      best = index
    }
  })
  return best
}

function zoneAnchor(side: Side, zone: Zone, seed: number): number {
  const drift = ((hashSeed(`depth:${seed}`) % 1000) / 1000 - 0.5) * 2 * ZONE_DRIFT
  return clamp(zoneLine(side, zone) + drift, 1 - DEPTH_LIMIT, DEPTH_LIMIT)
}

function sentOffSlot(side: Side, index: number, taken: OnPitch): number {
  const candidates = outfieldSlots().filter((slot) => taken.has(slot))
  return candidates[hashSeed(`sentoff:${side}:${index}`) % candidates.length]
}

function redCardsByPhase(report: MatchReport): Map<number, Side[]> {
  const byPhase = new Map<number, Side[]>()
  for (const event of report.timeline) {
    if (event.kind !== 'RED_CARD') continue
    const existing = byPhase.get(event.phaseIndex) ?? []
    byPhase.set(event.phaseIndex, [...existing, event.side])
  }
  return byPhase
}

interface Handover {
  ball: Point
  carrier: number
  side: Side | null
}

export function buildPhasePlans(
  report: MatchReport,
  eventByPhase: Map<number, MatchEvent>,
): PhasePlan[] {
  const phases = report.phases
  const redCards = redCardsByPhase(report)
  let onPitch: Record<Side, OnPitch> = { home: FULL_SQUAD, away: FULL_SQUAD }
  let handover: Handover = { ball: { x: 0.5, y: 0.5 }, carrier: kickOffCarrier(), side: null }

  return phases.map((phase, order) => {
    const event = eventByPhase.get(phase.index)
    const previousPhase = order === 0 ? undefined : phases[order - 1]
    const previousEvent =
      previousPhase === undefined ? undefined : eventByPhase.get(previousPhase.index)
    const restart = restartBefore(phase, event, previousPhase, previousEvent)
    const ballFrom = restartBall(restart, phase.side, handover.ball, phase.index) ?? handover.ball

    const lineStart = zoneLine(phase.side, phase.fromZone)
    const startShape = teamShape(phase.side, lineStart)
    const squad = onPitch[phase.side]
    const claimed =
      handover.side === phase.side && restart === 'none'
        ? handover.carrier
        : nearestSlot(startShape, ballFrom, squad)
    const carrier = carrierInZone(claimed, phase.fromZone, (slot) =>
      pitchDistance(startShape[slot], ballFrom), squad)

    const isShot = phase.action === 'SHOOT'
    const lineEnd = isShot ? lineStart : zoneLine(phase.side, phase.toZone)
    const endShape = teamShape(phase.side, lineEnd)
    const receiver = receiverFor(
      phase.action,
      carrier,
      phase.toZone,
      hashSeed(`pass:${phase.index}`),
      (slot) => pitchDistance(endShape[slot], ballFrom),
      squad,
    )

    const reach = phase.outcome === 'TURNOVER' ? INTERCEPT_REACH : 1
    const settled = {
      x: zoneAnchor(phase.side, phase.toZone, phase.index),
      y: endShape[receiver].y,
    }
    const intercepted = lerpPoint(ballFrom, settled, reach)
    const nextPhase = order + 1 < phases.length ? phases[order + 1] : undefined
    const nextRestart =
      nextPhase === undefined
        ? 'none'
        : restartBefore(nextPhase, eventByPhase.get(nextPhase.index), phase, event)
    const shot = isShot ? resolveShot(event, phase.side, phase.index, ballFrom) : null
    const ballTo =
      shot !== null
        ? shot.target
        : nextRestart === 'throwIn'
          ? sidelineFor(intercepted, phase.index)
          : intercepted

    handover = { ball: shot?.deflectTo ?? ballTo, carrier: receiver, side: phase.side }
    const plan: PhasePlan = {
      side: phase.side,
      carrier,
      receiver,
      runner: runnerFor(carrier, receiver, hashSeed(`run:${phase.index}`), squad),
      lineStart,
      lineEnd,
      spreadStart: ZONE_SPREAD[phase.fromZone],
      spreadEnd: ZONE_SPREAD[phase.toZone],
      ballFrom,
      ballTo,
      deflectTo: shot?.deflectTo ?? null,
      deflectAt: shot?.deflectAt ?? 1,
      keeperTo: shot?.keeperTo ?? null,
      travel:
        pitchDistance(ballFrom, ballTo) +
        (shot?.deflectTo == null ? 0 : pitchDistance(ballTo, shot.deflectTo)),
      windup:
        nextRestart === 'none' &&
        nextPhase !== undefined &&
        nextPhase.side === phase.side &&
        KICK_ACTIONS.has(nextPhase.action),
      lift: LIFT_BY_ACTION[phase.action],
      isShot,
      restart,
      onPitch,
      ease: EASING[phase.action],
    }

    for (const punished of redCards.get(phase.index) ?? []) {
      const remaining = new Set(onPitch[punished])
      remaining.delete(sentOffSlot(punished, phase.index, remaining))
      onPitch = { ...onPitch, [punished]: remaining }
    }

    return plan
  })
}
