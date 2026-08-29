import { PITCH_PALETTE } from './pitchPalette'
import type { Size } from './geometry'

const STRIPE_COUNT = 14
const BOX_DEPTH = 0.157
const BOX_HEIGHT = 0.593
const SIX_YARD_DEPTH = 0.052
const SIX_YARD_HEIGHT = 0.269
const GOAL_DEPTH = 0.019
const GOAL_HEIGHT = 0.108
const PENALTY_SPOT_DEPTH = 0.105
const ARC_RADIUS_X = 0.0871
const ARC_RADIUS_Y = 0.1346
const ARC_HALF_ANGLE = Math.acos((BOX_DEPTH - PENALTY_SPOT_DEPTH) / ARC_RADIUS_X)
const CENTRE_CIRCLE = 0.1346
const CORNER_ARC = 0.0095
const NET_MESH_COUNT = 5
const FLOODLIGHT_POOLS = [0.22, 0.78]

function paintStripes(context: CanvasRenderingContext2D, size: Size) {
  const stripeWidth = size.width / STRIPE_COUNT
  for (let index = 0; index < STRIPE_COUNT; index += 1) {
    context.fillStyle = index % 2 === 0 ? PITCH_PALETTE.turfDark : PITCH_PALETTE.turfLight
    context.fillRect(index * stripeWidth, 0, stripeWidth + 1, size.height)
  }
}

function paintSheen(context: CanvasRenderingContext2D, size: Size) {
  const sheen = context.createLinearGradient(0, 0, 0, size.height)
  sheen.addColorStop(0, PITCH_PALETTE.turfSheen)
  sheen.addColorStop(0.45, 'rgba(0, 0, 0, 0)')
  sheen.addColorStop(1, PITCH_PALETTE.turfSheen)
  context.fillStyle = sheen
  context.fillRect(0, 0, size.width, size.height)
}

function paintFloodlights(context: CanvasRenderingContext2D, size: Size) {
  for (const share of FLOODLIGHT_POOLS) {
    const pool = context.createRadialGradient(
      size.width * share,
      size.height * 0.5,
      size.height * 0.05,
      size.width * share,
      size.height * 0.5,
      size.width * 0.42,
    )
    pool.addColorStop(0, PITCH_PALETTE.floodlight)
    pool.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = pool
    context.fillRect(0, 0, size.width, size.height)
  }
}

function paintVignette(context: CanvasRenderingContext2D, size: Size) {
  const vignette = context.createRadialGradient(
    size.width / 2,
    size.height / 2,
    size.height * 0.24,
    size.width / 2,
    size.height / 2,
    size.width * 0.7,
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, PITCH_PALETTE.turfEdge)
  context.fillStyle = vignette
  context.fillRect(0, 0, size.width, size.height)
}

export function drawTurf(context: CanvasRenderingContext2D, size: Size) {
  paintStripes(context, size)
  paintSheen(context, size)
  paintFloodlights(context, size)
  paintVignette(context, size)
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

function strokePenaltyArc(context: CanvasRenderingContext2D, size: Size, fromLeft: boolean) {
  const spotX = fromLeft
    ? PENALTY_SPOT_DEPTH * size.width
    : size.width - PENALTY_SPOT_DEPTH * size.width
  const from = fromLeft ? -ARC_HALF_ANGLE : Math.PI - ARC_HALF_ANGLE
  context.beginPath()
  context.ellipse(
    spotX,
    size.height / 2,
    ARC_RADIUS_X * size.width,
    ARC_RADIUS_Y * size.height,
    0,
    from,
    from + ARC_HALF_ANGLE * 2,
  )
  context.stroke()
}

function strokeCornerArcs(context: CanvasRenderingContext2D, size: Size) {
  const radiusX = CORNER_ARC * size.width
  const radiusY = CORNER_ARC * size.width
  const corners = [
    { x: 0, y: 0, from: 0 },
    { x: size.width, y: 0, from: Math.PI / 2 },
    { x: size.width, y: size.height, from: Math.PI },
    { x: 0, y: size.height, from: -Math.PI / 2 },
  ]
  for (const corner of corners) {
    context.beginPath()
    context.ellipse(corner.x, corner.y, radiusX, radiusY, 0, corner.from, corner.from + Math.PI / 2)
    context.stroke()
  }
}

function drawSpot(context: CanvasRenderingContext2D, size: Size, x: number) {
  context.beginPath()
  context.arc(x, size.height / 2, Math.max(1.2, size.height * 0.006), 0, Math.PI * 2)
  context.fill()
}

function drawGoal(context: CanvasRenderingContext2D, size: Size, fromLeft: boolean) {
  const goalWidth = GOAL_DEPTH * size.width
  const goalHeight = GOAL_HEIGHT * size.height
  const x = fromLeft ? -goalWidth : size.width
  const y = (size.height - goalHeight) / 2

  context.fillStyle = PITCH_PALETTE.net
  context.fillRect(x, y, goalWidth, goalHeight)

  context.strokeStyle = PITCH_PALETTE.netMesh
  context.lineWidth = Math.max(0.5, size.height * 0.0015)
  for (let index = 1; index < NET_MESH_COUNT; index += 1) {
    const share = index / NET_MESH_COUNT
    context.beginPath()
    context.moveTo(x, y + goalHeight * share)
    context.lineTo(x + goalWidth, y + goalHeight * share)
    context.moveTo(x + goalWidth * share, y)
    context.lineTo(x + goalWidth * share, y + goalHeight)
    context.stroke()
  }

  context.strokeStyle = PITCH_PALETTE.goalFrame
  context.lineWidth = Math.max(1.4, size.height * 0.005)
  context.strokeRect(x, y, goalWidth, goalHeight)
}

export function drawMarkings(context: CanvasRenderingContext2D, size: Size) {
  context.strokeStyle = PITCH_PALETTE.markings
  context.fillStyle = PITCH_PALETTE.markings
  context.lineWidth = Math.max(1, size.height * 0.0035)

  context.strokeRect(0, 0, size.width, size.height)
  context.beginPath()
  context.moveTo(size.width / 2, 0)
  context.lineTo(size.width / 2, size.height)
  context.stroke()

  context.beginPath()
  context.ellipse(
    size.width / 2,
    size.height / 2,
    CENTRE_CIRCLE * size.height,
    CENTRE_CIRCLE * size.height,
    0,
    0,
    Math.PI * 2,
  )
  context.stroke()

  for (const fromLeft of [true, false]) {
    strokeBox(context, size, fromLeft, BOX_DEPTH, BOX_HEIGHT)
    strokeBox(context, size, fromLeft, SIX_YARD_DEPTH, SIX_YARD_HEIGHT)
    strokePenaltyArc(context, size, fromLeft)
  }
  strokeCornerArcs(context, size)

  drawSpot(context, size, size.width / 2)
  drawSpot(context, size, PENALTY_SPOT_DEPTH * size.width)
  drawSpot(context, size, size.width - PENALTY_SPOT_DEPTH * size.width)

  drawGoal(context, size, true)
  drawGoal(context, size, false)
}
