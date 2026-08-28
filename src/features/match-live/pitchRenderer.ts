import type { Kit } from './kits'
import type { PitchFrame } from './pitchFrame'
import type { Point } from './formations'
import { KEEPER_SLOT, SHIRT_NUMBER } from './squad'

export const PITCH_PALETTE = {
  turf: '#123521',
  turfStripe: '#164027',
  turfEdge: 'rgba(6, 14, 10, 0.45)',
  markings: 'rgba(226, 240, 255, 0.3)',
  net: 'rgba(226, 240, 255, 0.18)',
  carrier: 'rgba(255, 255, 255, 0.92)',
  ball: '#fbfdff',
  trail: 'rgba(251, 253, 255, 0.55)',
  shadow: 'rgba(4, 10, 6, 0.42)',
}

const STRIPE_COUNT = 12
const PLAYER_RADIUS_RATIO = 0.028
const BALL_RADIUS_RATIO = 0.0105
const BOX_DEPTH = 0.16
const BOX_HEIGHT = 0.56
const SIX_YARD_DEPTH = 0.055
const SIX_YARD_HEIGHT = 0.26
const GOAL_DEPTH = 0.018
const GOAL_HEIGHT = 0.16
const PENALTY_SPOT_DEPTH = 0.11
const LABEL_MARGIN = 0.022

export interface Size {
  width: number
  height: number
}

export interface TeamVisual {
  code: string
  kit: Kit
}

export interface RenderOptions {
  trail: Point[]
  flash: number
  home: TeamVisual
  away: TeamVisual
}

function drawTurf(context: CanvasRenderingContext2D, size: Size) {
  context.fillStyle = PITCH_PALETTE.turf
  context.fillRect(0, 0, size.width, size.height)
  context.fillStyle = PITCH_PALETTE.turfStripe
  const stripeWidth = size.width / STRIPE_COUNT
  for (let index = 0; index < STRIPE_COUNT; index += 2) {
    context.fillRect(index * stripeWidth, 0, stripeWidth, size.height)
  }

  const vignette = context.createRadialGradient(
    size.width / 2,
    size.height / 2,
    size.height * 0.2,
    size.width / 2,
    size.height / 2,
    size.width * 0.72,
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, PITCH_PALETTE.turfEdge)
  context.fillStyle = vignette
  context.fillRect(0, 0, size.width, size.height)
}

function strokeBox(
  context: CanvasRenderingContext2D,
  size: Size,
  fromLeft: boolean,
  depth: number,
  height: number,
) {
  const boxWidth = depth * size.width
  const boxHeight = height * size.height
  const x = fromLeft ? 0 : size.width - boxWidth
  context.strokeRect(x, (size.height - boxHeight) / 2, boxWidth, boxHeight)
}

function drawGoal(context: CanvasRenderingContext2D, size: Size, fromLeft: boolean) {
  const goalWidth = GOAL_DEPTH * size.width
  const goalHeight = GOAL_HEIGHT * size.height
  const x = fromLeft ? -goalWidth : size.width
  const y = (size.height - goalHeight) / 2
  context.fillStyle = PITCH_PALETTE.net
  context.fillRect(x, y, goalWidth, goalHeight)
  context.strokeRect(x, y, goalWidth, goalHeight)
}

function drawSpot(context: CanvasRenderingContext2D, size: Size, x: number) {
  context.beginPath()
  context.arc(x, size.height / 2, Math.max(1.2, size.height * 0.006), 0, Math.PI * 2)
  context.fill()
}

function drawMarkings(context: CanvasRenderingContext2D, size: Size) {
  context.strokeStyle = PITCH_PALETTE.markings
  context.fillStyle = PITCH_PALETTE.markings
  context.lineWidth = Math.max(1, size.height * 0.0035)

  context.strokeRect(0, 0, size.width, size.height)
  context.beginPath()
  context.moveTo(size.width / 2, 0)
  context.lineTo(size.width / 2, size.height)
  context.stroke()

  context.beginPath()
  context.arc(size.width / 2, size.height / 2, size.height * 0.135, 0, Math.PI * 2)
  context.stroke()

  strokeBox(context, size, true, BOX_DEPTH, BOX_HEIGHT)
  strokeBox(context, size, false, BOX_DEPTH, BOX_HEIGHT)
  strokeBox(context, size, true, SIX_YARD_DEPTH, SIX_YARD_HEIGHT)
  strokeBox(context, size, false, SIX_YARD_DEPTH, SIX_YARD_HEIGHT)

  drawSpot(context, size, size.width / 2)
  drawSpot(context, size, PENALTY_SPOT_DEPTH * size.width)
  drawSpot(context, size, size.width - PENALTY_SPOT_DEPTH * size.width)

  drawGoal(context, size, true)
  drawGoal(context, size, false)
}

function drawSideLabels(context: CanvasRenderingContext2D, size: Size, options: RenderOptions) {
  const fontSize = Math.max(10, size.height * 0.05)
  context.font = `700 ${fontSize}px "Archivo", system-ui, sans-serif`
  context.textBaseline = 'top'
  const margin = size.height * LABEL_MARGIN

  context.textAlign = 'left'
  context.fillStyle = options.home.kit.outfield
  context.fillText(`${options.home.code} →`, margin, margin)

  context.textAlign = 'right'
  context.fillStyle = options.away.kit.outfield
  context.fillText(`← ${options.away.code}`, size.width - margin, margin)
}

function drawTrail(context: CanvasRenderingContext2D, size: Size, trail: Point[]) {
  if (trail.length < 2) return
  context.lineCap = 'round'
  for (let index = 1; index < trail.length; index += 1) {
    const strength = index / trail.length
    context.strokeStyle = PITCH_PALETTE.trail
    context.globalAlpha = strength * 0.5
    context.lineWidth = Math.max(1, size.height * 0.006 * strength)
    context.beginPath()
    context.moveTo(trail[index - 1].x * size.width, trail[index - 1].y * size.height)
    context.lineTo(trail[index].x * size.width, trail[index].y * size.height)
    context.stroke()
  }
  context.globalAlpha = 1
}

function drawPlayer(
  context: CanvasRenderingContext2D,
  size: Size,
  point: Point,
  kit: Kit,
  slot: number,
  radius: number,
  isCarrier: boolean,
) {
  const x = point.x * size.width
  const y = point.y * size.height

  context.fillStyle = PITCH_PALETTE.shadow
  context.beginPath()
  context.ellipse(x, y + radius * 0.55, radius * 0.95, radius * 0.45, 0, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = slot === KEEPER_SLOT ? kit.keeper : kit.outfield
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = kit.ink
  context.font = `700 ${radius * 1.15}px "Archivo", system-ui, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(String(SHIRT_NUMBER[slot]), x, y + radius * 0.06)

  if (!isCarrier) return
  context.strokeStyle = PITCH_PALETTE.carrier
  context.lineWidth = Math.max(1.4, radius * 0.2)
  context.beginPath()
  context.arc(x, y, radius * 1.42, 0, Math.PI * 2)
  context.stroke()
}

function drawTeam(
  context: CanvasRenderingContext2D,
  size: Size,
  points: Point[],
  kit: Kit,
  carrier: number | null,
) {
  const radius = size.height * PLAYER_RADIUS_RATIO
  points.forEach((point, slot) => {
    drawPlayer(context, size, point, kit, slot, radius, slot === carrier)
  })
}

function drawBall(context: CanvasRenderingContext2D, size: Size, ball: Point) {
  const radius = size.height * BALL_RADIUS_RATIO
  const x = ball.x * size.width
  const y = ball.y * size.height
  context.fillStyle = PITCH_PALETTE.shadow
  context.beginPath()
  context.ellipse(x, y + radius * 0.9, radius * 0.9, radius * 0.5, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = PITCH_PALETTE.ball
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
}

export function renderFrame(
  context: CanvasRenderingContext2D,
  size: Size,
  frame: PitchFrame,
  options: RenderOptions,
) {
  drawTurf(context, size)
  drawMarkings(context, size)
  drawSideLabels(context, size, options)
  drawTrail(context, size, options.trail)

  const homeCarrier = frame.possession === 'home' ? frame.carrier : null
  const awayCarrier = frame.possession === 'away' ? frame.carrier : null
  drawTeam(context, size, frame.away, options.away.kit, awayCarrier)
  drawTeam(context, size, frame.home, options.home.kit, homeCarrier)
  drawBall(context, size, frame.ball)

  if (options.flash <= 0) return
  context.fillStyle = `rgba(255, 255, 255, ${options.flash * 0.35})`
  context.fillRect(0, 0, size.width, size.height)
}
