import { clamp, easeInOut } from './geometry'
import type { Point } from './geometry'
import type { Side, Zone } from '../../domain/engine'

const BLOCK_TRAVEL = 0.46
const MIN_DEPTH = 0.02
const MAX_DEPTH = 0.96
const LAG_WINDOW = 0.4
const SWAY_AMPLITUDE = 0.004
const SWAY_CYCLES_PER_PHASE = 0.55
const SWAY_DEPTH_SHARE = 0.3
const LATERAL_LIMIT = 0.14
const SPREAD_RANGE = 0.18
const CENTRE_LINE = 0.5

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
const SLOT_SPREAD = [0.1, 1.0, 0.55, 0.55, 1.0, 0.85, 0.4, 0.85, 1.0, 0.35, 1.0]

export const ZONE_PROGRESS: Record<Zone, number> = {
  0: 0.11,
  1: 0.3,
  2: 0.5,
  3: 0.7,
  4: 0.89,
}

export interface ShapeMotion {
  from: number
  to: number
  progress: number
  ballY: number
  spread: number
  cycle: number
}

export function zoneLine(side: Side, zone: Zone): number {
  const progress = ZONE_PROGRESS[zone]
  return side === 'home' ? progress : 1 - progress
}

function laggedProgress(slot: number, progress: number): number {
  const delay = SLOT_LAG[slot] * LAG_WINDOW
  return easeInOut(clamp((progress - delay) / (1 - delay), 0, 1))
}

interface SlotOffset {
  lateral: number
  sway: number
  spread: number
}

const RESTING: SlotOffset = { lateral: 0, sway: 0, spread: 0 }

function slotPoint(side: Side, slot: number, line: number, offset: SlotOffset): Point {
  const ownProgress = side === 'home' ? line : 1 - line
  const shift = (ownProgress - CENTRE_LINE) * BLOCK_TRAVEL * SLOT_TRAVEL[slot]
  const depth = clamp(SHAPE[slot].x + shift + offset.sway * SWAY_DEPTH_SHARE, MIN_DEPTH, MAX_DEPTH)
  const fanned = CENTRE_LINE + (SHAPE[slot].y - CENTRE_LINE) * (1 + offset.spread)
  const width = clamp(fanned + offset.lateral + offset.sway, 0.03, 0.97)
  return { x: side === 'home' ? depth : 1 - depth, y: width }
}

export function teamShape(side: Side, line: number): Point[] {
  return SHAPE.map((_, slot) => slotPoint(side, slot, line, RESTING))
}

export function movingShape(side: Side, motion: ShapeMotion): Point[] {
  const pull = (motion.ballY - CENTRE_LINE) * LATERAL_LIMIT
  return SHAPE.map((_, slot) => {
    const line = motion.from + (motion.to - motion.from) * laggedProgress(slot, motion.progress)
    const sway =
      Math.sin((motion.cycle * SWAY_CYCLES_PER_PHASE + slot * 0.37) * Math.PI * 2) *
      SWAY_AMPLITUDE *
      SLOT_SWAY[slot]
    return slotPoint(side, slot, line, {
      lateral: pull * SLOT_LATERAL[slot],
      sway,
      spread: motion.spread * SPREAD_RANGE * SLOT_SPREAD[slot],
    })
  })
}
