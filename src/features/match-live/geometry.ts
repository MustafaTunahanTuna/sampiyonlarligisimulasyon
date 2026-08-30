export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

const PITCH_ASPECT_BIAS = 0.62

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function saturate(value: number): number {
  return clamp(value, 0, 1)
}

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

export function lerpPoint(from: Point, to: Point, amount: number): Point {
  return { x: lerp(from.x, to.x, amount), y: lerp(from.y, to.y, amount) }
}

export function pitchDistance(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, (left.y - right.y) * PITCH_ASPECT_BIAS)
}

export function easeIn(progress: number): number {
  return progress * progress
}

export function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 2
}

export function easeInOut(progress: number): number {
  return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2
}

export function easeOutBack(progress: number): number {
  const overshoot = 1.7
  return 1 + (overshoot + 1) * (progress - 1) ** 3 + overshoot * (progress - 1) ** 2
}

export function linear(progress: number): number {
  return progress
}

const FRICTION = 3.4

export function easeOutStrong(progress: number): number {
  return (1 - Math.exp(-FRICTION * progress)) / (1 - Math.exp(-FRICTION))
}

export function arch(progress: number): number {
  return Math.sin(saturate(progress) * Math.PI)
}

export function approach(current: number, target: number, delta: number, tau: number): number {
  return current + (target - current) * (1 - Math.exp(-delta / tau))
}
