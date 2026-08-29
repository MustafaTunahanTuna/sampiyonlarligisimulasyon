import { buildClips } from './highlights'
import type { HighlightClip } from './highlights'
import { goalMouth, movingShape, teamShape, zoneLine } from './formations'
import type { Point } from './formations'
import { carrierInZone, kickOffCarrier, receiverFor, runnerFor } from './squad'
import { hashSeed } from '../../domain/random'
import { buildStats } from '../../domain/engine'
import type {
  ChainAction,
  MatchEvent,
  MatchPhase,
  MatchReport,
  MatchStats,
  Side,
} from '../../domain/engine'

const INTERCEPT_REACH = 0.76
const RUNNER_SURGE = 0.045
const PRESSURE_PULL = 0.55
const BALL_FOOT_OFFSET = 0.012

const LIFT_BY_ACTION: Record<ChainAction, number> = {
  PASS: 0.08,
  HOLD: 0,
  DRIBBLE: 0,
  LONG_BALL: 1,
  CROSS: 0.82,
  SHOOT: 0.4,
}

export interface PitchFrame {
  phase: MatchPhase
  possession: Side
  ball: Point
  lift: number
  home: Point[]
  away: Point[]
  carrier: number
  event: MatchEvent | null
}

interface PhasePlan {
  side: Side
  carrier: number
  receiver: number
  lineStart: number
  lineEnd: number
  runner: number
  reach: number
  shotTarget: Point | null
  ballYFrom: number
  ballYTo: number
  lift: number
  ease: (progress: number) => number
}

const easeOut = (progress: number) => 1 - (1 - progress) ** 2
const easeIn = (progress: number) => progress * progress
const easeInOut = (progress: number) =>
  progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2
const linear = (progress: number) => progress

const EASING: Record<ChainAction, (progress: number) => number> = {
  PASS: easeOut,
  HOLD: easeOut,
  DRIBBLE: linear,
  LONG_BALL: easeOut,
  CROSS: easeInOut,
  SHOOT: easeIn,
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

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

function lerpPoint(from: Point, to: Point, amount: number): Point {
  return { x: lerp(from.x, to.x, amount), y: lerp(from.y, to.y, amount) }
}

function distance(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, (left.y - right.y) * 0.62)
}

function nearestSlot(points: Point[], target: Point): number {
  let best = 0
  let bestDistance = Infinity
  points.forEach((point, index) => {
    const candidate = distance(point, target)
    if (candidate < bestDistance) {
      bestDistance = candidate
      best = index
    }
  })
  return best
}

function attackingSign(side: Side): number {
  return side === 'home' ? 1 : -1
}

function isScoringEvent(event: MatchEvent | undefined): boolean {
  return event?.kind === 'GOAL' || event?.kind === 'PENALTY_GOAL'
}

function buildPlans(
  phases: MatchPhase[],
  eventByPhase: Map<number, MatchEvent>,
): PhasePlan[] {
  const plans: PhasePlan[] = []
  let carrier = kickOffCarrier()
  let previousSide: Side | null = null
  let previousBall: Point | null = null
  let previousScored = false

  for (const phase of phases) {
    const lineStart = zoneLine(phase.side, phase.fromZone)
    const startShape = teamShape(phase.side, lineStart)
    if (phase.side !== previousSide) {
      carrier =
        previousScored || previousBall === null
          ? kickOffCarrier()
          : nearestSlot(startShape, previousBall)
    }
    carrier = carrierInZone(carrier, phase.fromZone, (slot) =>
      distance(startShape[slot], startShape[carrier]),
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
      (slot) => distance(endShape[slot], startShape[carrier]),
    )
    const shotTarget = isShot
      ? { x: goalMouth(phase.side).x, y: shotTargetY(event, phase.index) }
      : null
    const reach = phase.outcome === 'TURNOVER' ? INTERCEPT_REACH : 1

    const ballEnd = shotTarget ?? lerpPoint(endShape[carrier], endShape[receiver], reach)
    plans.push({
      side: phase.side,
      carrier,
      receiver,
      runner: runnerFor(carrier, receiver, hashSeed(`run:${phase.index}`)),
      lineStart,
      lineEnd,
      reach,
      shotTarget,
      ballYFrom: startShape[carrier].y,
      ballYTo: ballEnd.y,
      lift: LIFT_BY_ACTION[phase.action],
      ease: EASING[phase.action],
    })

    previousBall = ballEnd
    previousScored = isScoringEvent(event)
    previousSide = phase.side
    carrier = receiver
  }

  return plans
}

function possessionUntil(phases: MatchPhase[], second: number): Record<Side, number> {
  const played = { home: 0, away: 0 }
  for (const phase of phases) {
    if (phase.startSecond >= second) break
    played[phase.side] += Math.min(phase.endSecond, second) - phase.startSecond
  }
  return played
}

export interface Playback {
  report: MatchReport
  clips: HighlightClip[]
  totalSeconds: number
  phaseCount: number
  frameOfPhase: (index: number, progress: number) => PitchFrame
  eventsUntil: (second: number) => MatchEvent[]
  statsUntil: (second: number) => MatchStats
}

export function createPlayback(report: MatchReport): Playback {
  const eventByPhase = new Map<number, MatchEvent>()
  for (const event of report.timeline) {
    const existing = eventByPhase.get(event.phaseIndex)
    if (existing === undefined || event.importance > existing.importance) {
      eventByPhase.set(event.phaseIndex, event)
    }
  }
  const plans = buildPlans(report.phases, eventByPhase)

  return {
    report,
    clips: buildClips(report),
    totalSeconds: report.durationSeconds,
    phaseCount: report.phases.length,
    eventsUntil: (second) => report.timeline.filter((event) => event.second <= second),
    statsUntil: (second) =>
      buildStats(
        report.timeline.filter((event) => event.second <= second),
        possessionUntil(report.phases, second),
      ),
    frameOfPhase: (index, progress) => {
      const clamped = Math.min(report.phases.length - 1, Math.max(0, index))
      const phase = report.phases[clamped]
      const plan = plans[clamped]
      const t = Math.min(1, Math.max(0, progress))

      const ballY = lerp(plan.ballYFrom, plan.ballYTo, plan.ease(t))
      const motion = {
        from: plan.lineStart,
        to: plan.lineEnd,
        progress: t,
        ballY,
        cycle: clamped + t,
      }
      const home = movingShape('home', motion)
      const away = movingShape('away', motion)
      const attackers = plan.side === 'home' ? home : away
      const defenders = plan.side === 'home' ? away : home

      const runner = attackers[plan.runner]
      attackers[plan.runner] = {
        x: runner.x + attackingSign(plan.side) * RUNNER_SURGE * Math.sin(t * Math.PI),
        y: runner.y,
      }

      const origin = attackers[plan.carrier]
      const target =
        plan.shotTarget ?? lerpPoint(origin, attackers[plan.receiver], plan.reach)
      const travelled = lerpPoint(origin, target, plan.ease(t))
      const ball = { x: travelled.x, y: travelled.y + BALL_FOOT_OFFSET }

      const pressed = nearestSlot(defenders, ball)
      defenders[pressed] = lerpPoint(defenders[pressed], ball, PRESSURE_PULL * t)

      return {
        phase,
        possession: plan.side,
        ball,
        lift: plan.lift * Math.sin(t * Math.PI),
        home,
        away,
        carrier: plan.shotTarget !== null || t < 0.55 ? plan.carrier : plan.receiver,
        event: eventByPhase.get(clamped) ?? null,
      }
    },
  }
}
