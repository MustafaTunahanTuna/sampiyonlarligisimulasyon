import { approach, clamp, saturate } from './geometry'
import type { Point, Size } from './geometry'

const WIDE_ZOOM = 1
const MAX_ZOOM = 1.52
const DEAD_ZONE_X = 0.26
const DEAD_ZONE_Y = 0.2
const LOOKAHEAD = 7
const CENTRE_TAU = 0.28
const ZOOM_TAU = 0.42
const SHAKE_DECAY = 4.2
const SHAKE_AMPLITUDE = 0.014
const SHAKE_SPEED_X = 47
const SHAKE_SPEED_Y = 61

export interface Camera {
  centre: Point
  zoom: number
  shake: number
  elapsed: number
}

export interface CameraCue {
  focus: Point
  velocity: Point
  zoom: number
}

export interface Viewport {
  scale: number
  originX: number
  originY: number
}

export function createCamera(): Camera {
  return { centre: { x: 0.5, y: 0.5 }, zoom: WIDE_ZOOM, shake: 0, elapsed: 0 }
}

function deadzoned(current: number, focus: number, margin: number): number {
  const gap = focus - current
  return Math.abs(gap) <= margin ? current : focus - Math.sign(gap) * margin
}

function framed(centre: number, zoom: number): number {
  const half = 0.5 / zoom
  return clamp(centre, half, 1 - half)
}

export function updateCamera(camera: Camera, cue: CameraCue, delta: number): Camera {
  const zoom = approach(camera.zoom, clamp(cue.zoom, WIDE_ZOOM, MAX_ZOOM), delta, ZOOM_TAU)
  const half = 0.5 / zoom
  const aim = {
    x: cue.focus.x + cue.velocity.x * LOOKAHEAD,
    y: cue.focus.y + cue.velocity.y * LOOKAHEAD,
  }
  const anchored = {
    x: deadzoned(camera.centre.x, aim.x, half * DEAD_ZONE_X),
    y: deadzoned(camera.centre.y, aim.y, half * DEAD_ZONE_Y),
  }

  return {
    centre: {
      x: framed(approach(camera.centre.x, anchored.x, delta, CENTRE_TAU), zoom),
      y: framed(approach(camera.centre.y, anchored.y, delta, CENTRE_TAU), zoom),
    },
    zoom,
    shake: Math.max(0, camera.shake - delta * SHAKE_DECAY),
    elapsed: camera.elapsed + delta,
  }
}

export function shakeCamera(camera: Camera, strength: number): Camera {
  return { ...camera, shake: Math.max(camera.shake, saturate(strength)) }
}

export function lockCamera(camera: Camera): Camera {
  return { ...camera, centre: { x: 0.5, y: 0.5 }, zoom: WIDE_ZOOM, shake: 0 }
}

export function viewportOf(camera: Camera, size: Size): Viewport {
  const jolt = camera.shake * camera.shake * SHAKE_AMPLITUDE
  const half = 0.5 / camera.zoom
  const centreX = framed(camera.centre.x + Math.sin(camera.elapsed * SHAKE_SPEED_X) * jolt, camera.zoom)
  const centreY = framed(camera.centre.y + Math.cos(camera.elapsed * SHAKE_SPEED_Y) * jolt, camera.zoom)

  return {
    scale: camera.zoom,
    originX: -(centreX - half) * size.width * camera.zoom,
    originY: -(centreY - half) * size.height * camera.zoom,
  }
}
