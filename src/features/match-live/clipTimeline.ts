import { clamp } from './geometry'
import type { HighlightClip } from './highlights'
import type { Playback } from './pitchFrame'
import type { ChainAction, MatchPhase } from '../../domain/engine'

export const CELEBRATION_REAL_SECONDS = 2.6

const DURATION_BASE: Record<ChainAction, number> = {
  PASS: 0.72,
  HOLD: 0.75,
  DRIBBLE: 1.3,
  LONG_BALL: 0.95,
  CROSS: 0.85,
  SHOOT: 0.8,
}

const DURATION_PER_TRAVEL: Record<ChainAction, number> = {
  PASS: 3.4,
  HOLD: 3,
  DRIBBLE: 2.6,
  LONG_BALL: 2.2,
  CROSS: 2.4,
  SHOOT: 1.5,
}

const DURATION_MIN = 0.7
const DURATION_MAX = 2.4
const REPLAY_STRETCH = 1.8
const REPLAY_PHASES = 2

export const KICK_POWER: Record<ChainAction, number> = {
  PASS: 0.8,
  HOLD: 0.65,
  DRIBBLE: 0,
  LONG_BALL: 1.2,
  CROSS: 1.1,
  SHOOT: 1.6,
}

export interface ClipStep {
  phaseIndex: number
  duration: number
  hold: boolean
  replay: boolean
  action: ChainAction
}

export interface ClipTimeline {
  clip: HighlightClip
  steps: ClipStep[]
  total: number
}

export interface StepCursor {
  step: ClipStep
  order: number
  progress: number
}

function durationOf(action: ChainAction, travel: number): number {
  return clamp(DURATION_BASE[action] + travel * DURATION_PER_TRAVEL[action], DURATION_MIN, DURATION_MAX)
}

function liveSteps(playback: Playback, clip: HighlightClip, goalPhase: number | null): ClipStep[] {
  const steps: ClipStep[] = []
  for (let index = clip.fromPhase; index <= clip.toPhase; index += 1) {
    const action = playback.report.phases[index].action
    steps.push({
      phaseIndex: index,
      duration: durationOf(action, playback.travelOf(index)),
      hold: false,
      replay: false,
      action,
    })
    if (index === goalPhase) {
      steps.push({
        phaseIndex: index,
        duration: CELEBRATION_REAL_SECONDS,
        hold: true,
        replay: false,
        action,
      })
    }
  }
  return steps
}

function goalPhaseOf(clip: HighlightClip): number {
  const goal = [...clip.events]
    .reverse()
    .find((event) => event.kind === 'GOAL' || event.kind === 'PENALTY_GOAL')
  if (goal === undefined) return clip.toPhase
  return Math.min(clip.toPhase, Math.max(clip.fromPhase, goal.phaseIndex))
}

function replaySteps(playback: Playback, clip: HighlightClip, goalPhase: number): ClipStep[] {
  const steps: ClipStep[] = []
  const fromPhase = Math.max(clip.fromPhase, goalPhase - (REPLAY_PHASES - 1))
  for (let index = fromPhase; index <= goalPhase; index += 1) {
    const action = playback.report.phases[index].action
    steps.push({
      phaseIndex: index,
      duration: durationOf(action, playback.travelOf(index)) * REPLAY_STRETCH,
      hold: false,
      replay: true,
      action,
    })
  }
  return steps
}

export function buildTimelines(playback: Playback, includeReplays = true): ClipTimeline[] {
  return playback.clips.map((clip) => {
    const goalPhase = clip.isGoal ? goalPhaseOf(clip) : null
    const steps = liveSteps(playback, clip, goalPhase)
    if (goalPhase !== null && includeReplays) steps.push(...replaySteps(playback, clip, goalPhase))
    return { clip, steps, total: steps.reduce((sum, step) => sum + step.duration, 0) }
  })
}

export function stepAt(timeline: ClipTimeline, elapsed: number): StepCursor {
  let remaining = elapsed
  for (let order = 0; order < timeline.steps.length; order += 1) {
    const step = timeline.steps[order]
    if (remaining < step.duration) {
      return { step, order, progress: remaining / step.duration }
    }
    remaining -= step.duration
  }
  const order = timeline.steps.length - 1
  return { step: timeline.steps[order], order, progress: 1 }
}

export function revealSecondFor(phases: MatchPhase[], cursor: StepCursor): number {
  const phase = phases[cursor.step.phaseIndex]
  return cursor.step.hold || cursor.step.replay || cursor.progress >= 1
    ? phase.endSecond
    : phase.startSecond - 1
}
