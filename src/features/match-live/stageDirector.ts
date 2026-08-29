import { createCamera, lockCamera, shakeCamera, updateCamera } from './pitchCamera'
import { lerp, saturate } from './geometry'
import type { ActiveBanner } from './stageOverlay'
import type { Camera } from './pitchCamera'
import type { ChainAction } from '../../domain/engine'
import type { PitchFrame } from './pitchFrame'
import type { StepCursor } from './clipTimeline'

const ZOOM_BY_ACTION: Record<ChainAction, number> = {
  PASS: 1.12,
  HOLD: 1.06,
  DRIBBLE: 1.24,
  LONG_BALL: 1.02,
  CROSS: 1.3,
  SHOOT: 1.46,
}

const CELEBRATION_ZOOM = 1.38
const SLOW_MOTION_FROM = 0.55
const SHOT_TIME_SCALE = 0.5
const CELEBRATION_TIME_SCALE = 0.72
const FLASH_DECAY = 1.8
const GOAL_SHAKE = 0.85
const BANNER_LIFE = 2.6
const SPIN_RATE = 34
const PULSE_SPEED = 4.4

export interface Director {
  camera: Camera
  flash: number
  flashTint: string
  banner: ActiveBanner | null
  spin: number
  elapsed: number
}

export function createDirector(): Director {
  return { camera: createCamera(), flash: 0, flashTint: '#ffffff', banner: null, spin: 0, elapsed: 0 }
}

export function timeScaleOf(cursor: StepCursor): number {
  if (cursor.step.hold) return CELEBRATION_TIME_SCALE
  if (cursor.step.action !== 'SHOOT' || cursor.progress < SLOW_MOTION_FROM) return 1
  const tension = (cursor.progress - SLOW_MOTION_FROM) / (1 - SLOW_MOTION_FROM)
  return lerp(1, SHOT_TIME_SCALE, saturate(tension))
}

function zoomFor(cursor: StepCursor): number {
  return cursor.step.hold ? CELEBRATION_ZOOM : ZOOM_BY_ACTION[cursor.step.action]
}

function ageBanner(banner: ActiveBanner | null, delta: number): ActiveBanner | null {
  if (banner === null) return null
  const aged = { ...banner, age: banner.age + delta }
  return aged.age >= aged.life ? null : aged
}

export function advanceDirector(
  director: Director,
  frame: PitchFrame,
  cursor: StepCursor,
  delta: number,
): Director {
  const cue = { focus: frame.ball, velocity: frame.ballVelocity, zoom: zoomFor(cursor) }
  const camera = updateCamera(director.camera, cue, delta)
  const speed = Math.hypot(frame.ballVelocity.x, frame.ballVelocity.y)

  return {
    camera,
    flash: Math.max(0, director.flash - delta * FLASH_DECAY),
    flashTint: director.flashTint,
    banner: ageBanner(director.banner, delta),
    spin: director.spin + speed * SPIN_RATE * delta,
    elapsed: director.elapsed + delta,
  }
}

export function celebrate(director: Director, tint: string): Director {
  return {
    ...director,
    flash: 1,
    flashTint: tint,
    camera: shakeCamera(director.camera, GOAL_SHAKE),
  }
}

export function announceBanner(
  director: Director,
  content: Omit<ActiveBanner, 'age' | 'life'>,
): Director {
  return { ...director, banner: { ...content, age: 0, life: BANNER_LIFE } }
}

export function pulseOf(director: Director): number {
  return (Math.sin(director.elapsed * PULSE_SPEED) + 1) / 2
}

export function restDirector(director: Director): Director {
  return { ...director, camera: lockCamera(director.camera), flash: 0, banner: null }
}
