import { applyCelebration } from './celebration'
import { buildClips } from './highlights'
import { movingShape } from './formations'
import { arch, clamp, easeIn, easeOut, lerp, lerpPoint, pitchDistance, saturate } from './geometry'
import { buildPhasePlans } from './phasePlan'
import { KEEPER_SLOT } from './squad'
import { buildStats } from '../../domain/engine'
import type { OnPitch } from './squad'
import type { HighlightClip } from './highlights'
import type { PhasePlan } from './phasePlan'
import type { Restart } from './matchRestarts'
import type { Point } from './geometry'
import type { MatchEvent, MatchPhase, MatchReport, MatchStats, Side } from '../../domain/engine'

const RUNNER_SURGE = 0.045
const CARRIER_GRIP = 0.85
const PRESSURE_PULL = 0.55
const SUPPORT_PULL = 0.24
const BALL_FOOT_OFFSET = 0.012
const VELOCITY_STEP = 0.02
const KEEPER_TRACKING = 0.34
const KEEPER_TRACK_LIMIT = 0.12
const KEEPER_RUSH = 0.035
const KEEPER_RUSH_RANGE = 0.22
const DIVE_START = 0.45
const FLIGHT_SHARE = 0.72
const FIRST_BOUNCE_SHARE = 0.88
const SECOND_BOUNCE_SHARE = 0.97
const FIRST_BOUNCE_HEIGHT = 0.24
const SECOND_BOUNCE_HEIGHT = 0.08
const DEFLECT_LIFT = 0.14
const BOUNCE_THRESHOLD = 0.5
const WINDUP_FROM = 0.84
const SHOT_FOCUS_PULL = 0.3

export interface WindupCue {
  side: Side
  slot: number
  amount: number
}

export interface PitchFrame {
  phase: MatchPhase
  possession: Side
  ball: Point
  ballVelocity: Point
  lift: number
  home: Point[]
  away: Point[]
  carrier: number
  onPitch: Record<Side, OnPitch>
  event: MatchEvent | null
  focus: Point
  windup: WindupCue | null
}

export interface Playback {
  report: MatchReport
  clips: HighlightClip[]
  totalSeconds: number
  phaseCount: number
  frameOfPhase: (index: number, progress: number, celebration?: number) => PitchFrame
  travelOf: (index: number) => number
  restartOf: (index: number) => Restart
  eventsUntil: (second: number) => MatchEvent[]
  statsUntil: (second: number) => MatchStats
}

function attackingSign(side: Side): number {
  return side === 'home' ? 1 : -1
}

function ballAt(plan: PhasePlan, progress: number): Point {
  if (plan.deflectTo === null) {
    return lerpPoint(plan.ballFrom, plan.ballTo, plan.ease(progress))
  }
  if (progress < plan.deflectAt) {
    return lerpPoint(plan.ballFrom, plan.ballTo, plan.ease(progress / plan.deflectAt))
  }
  const rebound = (progress - plan.deflectAt) / (1 - plan.deflectAt)
  return lerpPoint(plan.ballTo, plan.deflectTo, easeOut(rebound))
}

function liftAt(plan: PhasePlan, progress: number): number {
  if (plan.deflectTo !== null) {
    if (progress < plan.deflectAt) return plan.lift * arch(progress / plan.deflectAt)
    return DEFLECT_LIFT * arch((progress - plan.deflectAt) / (1 - plan.deflectAt))
  }
  if (plan.lift < BOUNCE_THRESHOLD) return plan.lift * arch(progress)
  if (progress < FLIGHT_SHARE) return plan.lift * arch(progress / FLIGHT_SHARE)
  if (progress < FIRST_BOUNCE_SHARE) {
    const bounce = (progress - FLIGHT_SHARE) / (FIRST_BOUNCE_SHARE - FLIGHT_SHARE)
    return plan.lift * FIRST_BOUNCE_HEIGHT * arch(bounce)
  }
  if (progress < SECOND_BOUNCE_SHARE) {
    const bounce = (progress - FIRST_BOUNCE_SHARE) / (SECOND_BOUNCE_SHARE - FIRST_BOUNCE_SHARE)
    return plan.lift * SECOND_BOUNCE_HEIGHT * arch(bounce)
  }
  return 0
}

function closestPair(
  points: Point[],
  target: Point,
  skip: number,
  onPitch: OnPitch,
): [number, number] {
  let first = skip
  let second = skip
  let firstGap = Infinity
  let secondGap = Infinity
  for (let slot = 0; slot < points.length; slot += 1) {
    if (slot === skip || !onPitch.has(slot)) continue
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

function diveKeeper(shape: Point[], plan: PhasePlan, progress: number) {
  if (plan.keeperTo === null || progress <= DIVE_START) return
  const dive = easeIn((progress - DIVE_START) / (1 - DIVE_START))
  shape[KEEPER_SLOT] = lerpPoint(shape[KEEPER_SLOT], plan.keeperTo, dive)
}

function applyPressure(defenders: Point[], ball: Point, progress: number, onPitch: OnPitch) {
  const [closest, support] = closestPair(defenders, ball, KEEPER_SLOT, onPitch)
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

function windupOf(plan: PhasePlan, progress: number, celebration: number): WindupCue | null {
  if (!plan.windup || plan.isShot || celebration > 0 || progress < WINDUP_FROM) return null
  return {
    side: plan.side,
    slot: plan.receiver,
    amount: arch((progress - WINDUP_FROM) / (1 - WINDUP_FROM)),
  }
}

export function createPlayback(report: MatchReport): Playback {
  const eventByPhase = headlineByPhase(report)
  const plans = buildPhasePlans(report, eventByPhase)

  const frameOfPhase = (index: number, progress: number, celebration = 0): PitchFrame => {
    const clamped = clamp(index, 0, report.phases.length - 1)
    const phase = report.phases[clamped]
    const plan = plans[clamped]
    const t = saturate(progress)

    const ground = ballAt(plan, t)
    const ahead = ballAt(plan, Math.min(1, t + VELOCITY_STEP))
    const lift = liftAt(plan, t)
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

    const defendingSide = plan.side === 'home' ? 'away' : 'home'
    applyPressure(defenders, ball, t, plan.onPitch[defendingSide])
    positionKeeper(defenders, defendingSide, ball)
    if (plan.isShot) diveKeeper(defenders, plan, t)

    const headline = eventByPhase.get(clamped) ?? null
    const scorer =
      celebration > 0
        ? applyCelebration(
            {
              attackers,
              defenders,
              scorer: plan.carrier,
              side: plan.side,
              attackersOnPitch: plan.onPitch[plan.side],
              defendersOnPitch: plan.onPitch[defendingSide],
            },
            celebration,
          )
        : null

    const focus =
      scorer !== null
        ? scorer
        : plan.isShot
          ? lerpPoint(ball, { x: plan.side === 'home' ? 1 : 0, y: 0.5 }, SHOT_FOCUS_PULL)
          : ball

    return {
      phase,
      possession: plan.side,
      ball,
      ballVelocity: { x: ahead.x - ground.x, y: ahead.y - ground.y },
      lift,
      home,
      away,
      carrier: plan.isShot || t < 0.55 ? plan.carrier : plan.receiver,
      onPitch: plan.onPitch,
      event: headline,
      focus,
      windup: windupOf(plan, t, celebration),
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
    travelOf: (index) => plans[clamp(index, 0, plans.length - 1)].travel,
    restartOf: (index) => plans[clamp(index, 0, plans.length - 1)].restart,
    frameOfPhase,
  }
}
