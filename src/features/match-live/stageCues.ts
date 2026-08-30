import { KICK_POWER } from './clipTimeline'
import type { MatchEventKind } from '../../domain/engine'
import type { PitchFrame } from './pitchFrame'
import type { StepCursor } from './clipTimeline'

const CROWD_AT_PROGRESS = 0.92

const CROWD_KINDS: ReadonlySet<MatchEventKind> = new Set([
  'SHOT_OFF',
  'POST',
  'SHOT_SAVED',
  'PENALTY_MISSED',
])

export type StepCue =
  | { key: string; kind: 'celebrate' }
  | { key: string; kind: 'kick'; power: number; hitStop: boolean }
  | { key: string; kind: 'quiet' }

export function stepCueFor(cursor: StepCursor, clipId: string): StepCue {
  const key = `${clipId}:${cursor.order}`
  if (cursor.step.replay) return { key, kind: 'quiet' }
  if (cursor.step.hold) return { key, kind: 'celebrate' }
  const power = KICK_POWER[cursor.step.action]
  if (power <= 0) return { key, kind: 'quiet' }
  return { key, kind: 'kick', power, hitStop: cursor.step.action === 'SHOOT' }
}

export function crowdCueFor(
  cursor: StepCursor,
  clipId: string,
  frame: PitchFrame,
): string | null {
  if (cursor.step.replay || cursor.step.hold) return null
  if (cursor.step.action !== 'SHOOT' || cursor.progress < CROWD_AT_PROGRESS) return null
  if (frame.event === null || !CROWD_KINDS.has(frame.event.kind)) return null
  return `${clipId}:${cursor.order}`
}
