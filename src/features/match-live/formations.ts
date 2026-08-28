import type { Side, Zone } from '../../domain/engine'

export interface Point {
  x: number
  y: number
}

const BLOCK_TRAVEL = 0.46
const KEEPER_TRAVEL_SHARE = 0.22
const MIN_DEPTH = 0.02
const MAX_DEPTH = 0.96

const SHAPE: Point[] = [
  { x: 0.05, y: 0.5 },
  { x: 0.22, y: 0.14 },
  { x: 0.19, y: 0.38 },
  { x: 0.19, y: 0.62 },
  { x: 0.22, y: 0.86 },
  { x: 0.44, y: 0.26 },
  { x: 0.42, y: 0.5 },
  { x: 0.44, y: 0.74 },
  { x: 0.68, y: 0.18 },
  { x: 0.72, y: 0.5 },
  { x: 0.68, y: 0.82 },
]

export const ZONE_PROGRESS: Record<Zone, number> = {
  0: 0.12,
  1: 0.3,
  2: 0.5,
  3: 0.72,
  4: 0.89,
}

export function zoneLine(side: Side, zone: Zone): number {
  const progress = ZONE_PROGRESS[zone]
  return side === 'home' ? progress : 1 - progress
}

function clampDepth(value: number): number {
  return Math.min(MAX_DEPTH, Math.max(MIN_DEPTH, value))
}

export function teamShape(side: Side, line: number): Point[] {
  const ownProgress = side === 'home' ? line : 1 - line
  const shift = (ownProgress - 0.5) * BLOCK_TRAVEL

  return SHAPE.map((slot, index) => {
    const travel = index === 0 ? shift * KEEPER_TRAVEL_SHARE : shift
    const depth = clampDepth(slot.x + travel)
    return { x: side === 'home' ? depth : 1 - depth, y: slot.y }
  })
}

export function goalMouth(side: Side): Point {
  return { x: side === 'home' ? 0.985 : 0.015, y: 0.5 }
}
