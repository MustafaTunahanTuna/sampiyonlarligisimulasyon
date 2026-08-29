import { buildClips } from './highlights'
import { movingShape } from './formations'
import { arch, clamp, lerp, lerpPoint, pitchDistance, saturate } from './geometry'
import { buildPhasePlans } from './phasePlan'
import { KEEPER_SLOT } from './squad'
import { buildStats } from '../../domain/engine'
import type { HighlightClip } from './highlights'
import type { PhasePlan } from './phasePlan'
import type { Point } from './geometry'
import type { MatchEvent, MatchPhase, MatchReport, MatchStats, Side } from '../../domain/engine'

const RUNNER_SURGE = 0.045
const CARRIER_GRIP = 0.72
const PRESSURE_PULL = 0.55
const SUPPORT_PULL = 0.24
const BALL_FOOT_OFFSET = 0.012
const VELOCITY_STEP = 0.02
const KEEPER_TRACKING = 0.34
const KEEPER_TRACK_LIMIT = 0.12
const KEEPER_RUSH = 0.035
const KEEPER_RUSH_RANGE = 0.22

export interface PitchFrame {
  phase: MatchPhase
  possession: Side
  ball: Point
  ballVelocity: Point
  lift: number
  home: Point[]
  away: Point[]
  carrier: number
  event: MatchEvent | null
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

function attackingSign(side: Side): number {
  return side === 'home' ? 1 : -1
}

function ballAt(plan: PhasePlan, progress: number): Point {
  return lerpPoint(plan.ballFrom, plan.ballTo, plan.ease(progress))
}

function closestPair(points: Point[], target: Point, skip: number): [number, number] {
  let first = -1
  let second = -1
  let firstGap = Infinity
  let secondGap = Infinity
  for (let slot = 0; slot < points.length; slot += 1) {
    if (slot === skip) continue
    const gap = pitchDistance(points[slot], target)
    if (gap < firstGap) {
      second = first
      secondGap = firstGap
      first = slot
      firstGap = gap
      continue
    }
    if (gap < secondGap) {
      second = slot
      secondGap = gap
    }
  }
  return [first, second]
}

function magnetise(shape: Point[], slot: number, ball: Point, weight: number) {
  if (weight <= 0) return
  shape[slot] = lerpPoint(shape[slot], { x: ball.x, y: ball.y - BALL_FOOT_OFFSET }, weight)
}

function positionKeeper(shape: Point[], side: Side, ball: Point) {
  const keeper = shape[KEEPER_SLOT]
  const tracked = clamp(
    lerp(0.5, ball.y, KEEPER_TRACKING),
    0.5 - KEEPER_TRACK_LIMIT,
    0.5 + KEEPER_TRACK_LIMIT,
  )
  const closeness = saturate(1 - Math.abs(ball.x - keeper.x) / KEEPER_RUSH_RANGE)
  shape[KEEPER_SLOT] = {
    x: keeper.x + attackingSign(side) * KEEPER_RUSH * closeness,
    y: tracked,
  }
}

function applyPressure(defenders: Point[], ball: Point, progress: number) {
  const [closest, support] = closestPair(defenders, ball, KEEPER_SLOT)
  defenders[closest] = lerpPoint(defenders[closest], ball, PRESSURE_PULL * progress)
  defenders[support] = lerpPoint(defenders[support], ball, SUPPORT_PULL * progress)
}

function possessionUntil(phases: MatchPhase[], second: number): Record<Side, number> {
  const played = { home: 0, away: 0 }
  for (const phase of phases) {
    if (phase.startSecond >= second) break
    played[phase.side] += Math.min(phase.endSecond, second) - phase.startSecond
  }
  return played
}

function headlineByPhase(report: MatchReport): Map<number, MatchEvent> {
  const byPhase = new Map<number, MatchEvent>()
  for (const event of report.timeline) {
    const existing = byPhase.get(event.phaseIndex)
    if (existing === undefined || event.importance > existing.importance) {
      byPhase.set(event.phaseIndex, event)
    }
  }
  return byPhase
}

export function createPlayback(report: MatchReport): Playback {
  const eventByPhase = headlineByPhase(report)
  const plans = buildPhasePlans(report.phases, eventByPhase)

  const frameOfPhase = (index: number, progress: number): PitchFrame => {
    const clamped = clamp(index, 0, report.phases.length - 1)
    const phase = report.phases[clamped]
    const plan = plans[clamped]
    const t = saturate(progress)

    const ground = ballAt(plan, t)
    const ahead = ballAt(plan, Math.min(1, t + VELOCITY_STEP))
    const lift = plan.lift * arch(t)
    const ball = { x: ground.x, y: ground.y + BALL_FOOT_OFFSET }

    const spread = lerp(plan.spreadStart, plan.spreadEnd, t)
    const motion = {
      from: plan.lineStart,
      to: plan.lineEnd,
      progress: t,
      ballY: ground.y,
      spread,
      cycle: clamped + t,
    }
    const home = movingShape('home', { ...motion, spread: plan.side === 'home' ? spread : -spread })
    const away = movingShape('away', { ...motion, spread: plan.side === 'away' ? spread : -spread })
    const attackers = plan.side === 'home' ? home : away
    const defenders = plan.side === 'home' ? away : home

    const runner = attackers[plan.runner]
    attackers[plan.runner] = {
      x: runner.x + attackingSign(plan.side) * RUNNER_SURGE * arch(t),
      y: runner.y,
    }

    const grounded = 1 - saturate(lift)
    magnetise(attackers, plan.carrier, ball, CARRIER_GRIP * (1 - t) * grounded)
    if (!plan.isShot) {
      magnetise(attackers, plan.receiver, ball, CARRIER_GRIP * t * grounded)
    }

    applyPressure(defenders, ball, t)
    positionKeeper(defenders, plan.side === 'home' ? 'away' : 'home', ball)

    return {
      phase,
      possession: plan.side,
      ball,
      ballVelocity: { x: ahead.x - ground.x, y: ahead.y - ground.y },
      lift,
      home,
      away,
      carrier: plan.isShot || t < 0.55 ? plan.carrier : plan.receiver,
      event: eventByPhase.get(clamped) ?? null,
    }
  }

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
    frameOfPhase,
  }
}
