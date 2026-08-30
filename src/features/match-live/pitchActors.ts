import { PITCH_PALETTE } from './pitchPalette'
import { saturate } from './geometry'
import { KEEPER_SLOT, SHIRT_NUMBER } from './squad'
import type { Kit } from './kits'
import type { OnPitch } from './squad'
import type { Point, Size } from './geometry'
import type { WindupCue } from './pitchFrame'

const PLAYER_RADIUS_RATIO = 0.027
const BALL_RADIUS_RATIO = 0.0105
const BALL_LIFT_RISE = 0.058
const BALL_LIFT_GROWTH = 0.5
const SHADOW_LIFT_DROP = 3.6
const FACING_THRESHOLD = 0.0006
const FACING_ARC = 0.7
const CARRIER_PULSE = 0.12
const TRAIL_WIDTH = 0.0062
const SEAM_COUNT = 3
const STRETCH_RATE = 42
const STRETCH_LIMIT = 0.38
const WINDUP_GROWTH = 0.12

export interface TeamPose {
  points: Point[]
  previous: Point[]
  kit: Kit
  carrier: number | null
  onPitch: OnPitch
  windup: WindupCue | null
}

interface Stride {
  facing: number | null
  stretch: number
}

function strideOf(current: Point, previous: Point): Stride {
  const dx = current.x - previous.x
  const dy = current.y - previous.y
  const pace = Math.hypot(dx, dy)
  return {
    facing: pace < FACING_THRESHOLD ? null : Math.atan2(dy, dx),
    stretch: 1 + Math.min(STRETCH_LIMIT, pace * STRETCH_RATE),
  }
}

function drawShadow(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.fillStyle = PITCH_PALETTE.shadow
  context.beginPath()
  context.ellipse(x, y + radius * 0.58, radius * 0.98, radius * 0.44, 0, 0, Math.PI * 2)
  context.fill()
}

function drawFacing(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  facing: number,
) {
  context.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  context.lineWidth = Math.max(1, radius * 0.26)
  context.lineCap = 'round'
  context.beginPath()
  context.arc(x, y, radius * 0.82, facing - FACING_ARC, facing + FACING_ARC)
  context.stroke()
}

function drawCarrierRing(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  pulse: number,
) {
  context.strokeStyle = PITCH_PALETTE.carrier
  context.lineWidth = Math.max(1.4, radius * 0.18)
  context.globalAlpha = 0.55 + pulse * 0.45
  context.beginPath()
  context.arc(x, y, radius * (1.45 + pulse * CARRIER_PULSE), 0, Math.PI * 2)
  context.stroke()
  context.globalAlpha = 1
}

function drawPlayer(
  context: CanvasRenderingContext2D,
  size: Size,
  pose: TeamPose,
  slot: number,
  baseRadius: number,
  pulse: number,
) {
  const point = pose.points[slot]
  const x = point.x * size.width
  const y = point.y * size.height
  const windup = pose.windup !== null && pose.windup.slot === slot ? pose.windup.amount : 0
  const radius = baseRadius * (1 + WINDUP_GROWTH * windup)

  drawShadow(context, x, y, radius)

  const stride = strideOf(point, pose.previous[slot])
  if (stride.facing !== null) drawFacing(context, x, y, radius, stride.facing)

  context.fillStyle = slot === KEEPER_SLOT ? pose.kit.keeper : pose.kit.outfield
  context.beginPath()
  context.ellipse(
    x,
    y,
    radius * stride.stretch,
    radius / Math.sqrt(stride.stretch),
    stride.facing ?? 0,
    0,
    Math.PI * 2,
  )
  context.fill()
  context.strokeStyle = 'rgba(6, 14, 10, 0.5)'
  context.lineWidth = Math.max(0.6, radius * 0.09)
  context.stroke()

  context.fillStyle = pose.kit.ink
  context.fillText(String(SHIRT_NUMBER[slot]), x, y + radius * 0.06)

  if (slot === pose.carrier) drawCarrierRing(context, x, y, radius, pulse)
}

export function drawTeam(
  context: CanvasRenderingContext2D,
  size: Size,
  pose: TeamPose,
  pulse: number,
) {
  const radius = size.height * PLAYER_RADIUS_RATIO
  context.font = `700 ${radius * 1.1}px "Archivo", system-ui, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  pose.points.forEach((_, slot) => {
    if (pose.onPitch.has(slot)) drawPlayer(context, size, pose, slot, radius, pulse)
  })
}

export function drawTrail(context: CanvasRenderingContext2D, size: Size, trail: Point[]) {
  if (trail.length < 2) return
  context.lineCap = 'round'
  context.strokeStyle = PITCH_PALETTE.trail
  for (let index = 1; index < trail.length; index += 1) {
    const strength = index / trail.length
    context.globalAlpha = strength * 0.42
    context.lineWidth = Math.max(1, size.height * TRAIL_WIDTH * strength)
    context.beginPath()
    context.moveTo(trail[index - 1].x * size.width, trail[index - 1].y * size.height)
    context.lineTo(trail[index].x * size.width, trail[index].y * size.height)
    context.stroke()
  }
  context.globalAlpha = 1
}

function drawSeams(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  spin: number,
) {
  context.fillStyle = PITCH_PALETTE.ballSeam
  for (let index = 0; index < SEAM_COUNT; index += 1) {
    const angle = spin + (index * Math.PI * 2) / SEAM_COUNT
    context.beginPath()
    context.arc(
      x + Math.cos(angle) * radius * 0.42,
      y + Math.sin(angle) * radius * 0.42,
      radius * 0.24,
      0,
      Math.PI * 2,
    )
    context.fill()
  }
}

export function drawBall(
  context: CanvasRenderingContext2D,
  size: Size,
  ball: Point,
  lift: number,
  spin: number,
) {
  const radius = size.height * BALL_RADIUS_RATIO
  const height = saturate(lift)
  const x = ball.x * size.width
  const groundY = ball.y * size.height
  const y = groundY - height * BALL_LIFT_RISE * size.height

  context.globalAlpha = 1 - height * 0.45
  context.fillStyle = PITCH_PALETTE.shadow
  context.beginPath()
  context.ellipse(
    x,
    groundY + radius * (0.9 + height * SHADOW_LIFT_DROP),
    radius * (0.9 - height * 0.3),
    radius * (0.5 - height * 0.18),
    0,
    0,
    Math.PI * 2,
  )
  context.fill()
  context.globalAlpha = 1

  const lifted = radius * (1 + height * BALL_LIFT_GROWTH)
  context.fillStyle = PITCH_PALETTE.ball
  context.beginPath()
  context.arc(x, y, lifted, 0, Math.PI * 2)
  context.fill()
  drawSeams(context, x, y, lifted, spin)
}
