import type { Side, Zone } from '../../domain/engine'

export interface Point {
  x: number
  y: number
}

const BLOCK_TRAVEL = 0.46
const MIN_DEPTH = 0.02
const MAX_DEPTH = 0.96
const LAG_WINDOW = 0.4
const SWAY_AMPLITUDE = 0.004
const SWAY_CYCLES_PER_PHASE = 0.55
const SWAY_DEPTH_SHARE = 0.3
const LATERAL_LIMIT = 0.14

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

const SLOT_TRAVEL = [0.2, 0.88, 0.72, 0.72, 0.88, 1.02, 0.9, 1.02, 1.12, 1.04, 1.12]
const SLOT_LAG = [0.95, 0.62, 0.72, 0.72, 0.62, 0.34, 0.42, 0.34, 0.08, 0.16, 0.08]
const SLOT_LATERAL = [0.42, 1.05, 0.78, 0.78, 1.05, 0.92, 0.7, 0.92, 0.66, 0.44, 0.66]
const SLOT_SWAY = [0.6, 1.15, 0.85, 0.9, 1.1, 1.25, 1.0, 1.2, 1.35, 1.05, 1.3]

export const ZONE_PROGRESS: Record<Zone, number> = {
  0: 0.12,
  1: 0.3,
  2: 0.5,
  3: 0.72,
  4: 0.89,
}

export interface ShapeMotion {
  from: number
  to: number
  progress: number
  ballY: number
  cycle: number
}

export function zoneLine(side: Side, zone: Zone): number {
  const progress = ZONE_PROGRESS[zone]
  return side === 'home' ? progress : 1 - progress
}

function clampDepth(value: number): number {
  return Math.min(MAX_DEPTH, Math.max(MIN_DEPTH, value))
}

function easeInOut(progress: number): number {
  return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2
}

function laggedProgress(slot: number, progress: number): number {
  const delay = SLOT_LAG[slot] * LAG_WINDOW
  const span = 1 - delay
  return easeInOut(Math.min(1, Math.max(0, (progress - delay) / span)))
}

function slotPoint(side: Side, slot: number, line: number, lateral: number, sway: number): Point {
  const ownProgress = side === 'home' ? line : 1 - line
  const shift = (ownProgress - 0.5) * BLOCK_TRAVEL * SLOT_TRAVEL[slot]
  const depth = clampDepth(SHAPE[slot].x + shift + sway * SWAY_DEPTH_SHARE)
  const width = Math.min(0.97, Math.max(0.03, SHAPE[slot].y + lateral + sway))
  return { x: side === 'home' ? depth : 1 - depth, y: width }
}

export function teamShape(side: Side, line: number): Point[] {
  return SHAPE.map((_, slot) => slotPoint(side, slot, line, 0, 0))
}

export function movingShape(side: Side, motion: ShapeMotion): Point[] {
  const pull = (motion.ballY - 0.5) * LATERAL_LIMIT
  return SHAPE.map((_, slot) => {
    const line = motion.from + (motion.to - motion.from) * laggedProgress(slot, motion.progress)
    const sway =
      Math.sin((motion.cycle * SWAY_CYCLES_PER_PHASE + slot * 0.37) * Math.PI * 2) *
      SWAY_AMPLITUDE *
      SLOT_SWAY[slot]
    return slotPoint(side, slot, line, pull * SLOT_LATERAL[slot], sway)
  })
}

export function goalMouth(side: Side): Point {
  return { x: side === 'home' ? 0.985 : 0.015, y: 0.5 }
}
