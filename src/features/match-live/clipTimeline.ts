import type { HighlightClip } from './highlights'
import type { Playback } from './pitchFrame'
import type { ChainAction, MatchPhase } from '../../domain/engine'

export const PHASE_REAL_SECONDS = 1.9
export const SHOT_REAL_SECONDS = 1.6
export const CELEBRATION_REAL_SECONDS = 2.4

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

export function buildTimelines(playback: Playback): ClipTimeline[] {
  return playback.clips.map((clip) => {
    const steps: ClipStep[] = []
    for (let index = clip.fromPhase; index <= clip.toPhase; index += 1) {
      const action = playback.report.phases[index].action
      steps.push({
        phaseIndex: index,
        duration: action === 'SHOOT' ? SHOT_REAL_SECONDS : PHASE_REAL_SECONDS,
        hold: false,
        action,
      })
    }
    if (clip.isGoal) {
      steps.push({
        phaseIndex: clip.toPhase,
        duration: CELEBRATION_REAL_SECONDS,
        hold: true,
        action: playback.report.phases[clip.toPhase].action,
      })
    }
    return { clip, steps, total: steps.reduce((sum, step) => sum + step.duration, 0) }
  })
}

export function stepAt(timeline: ClipTimeline, elapsed: number): StepCursor {
  let remaining = elapsed
  for (let order = 0; order < timeline.steps.length; order += 1) {
    const step = timeline.steps[order]
    if (remaining < step.duration) {
      return { step, order, progress: step.hold ? 1 : remaining / step.duration }
    }
    remaining -= step.duration
  }
  const order = timeline.steps.length - 1
  return { step: timeline.steps[order], order, progress: 1 }
}

export function revealSecondFor(phases: MatchPhase[], cursor: StepCursor): number {
  const phase = phases[cursor.step.phaseIndex]
  return cursor.step.hold || cursor.progress >= 1 ? phase.endSecond : phase.startSecond - 1
}
