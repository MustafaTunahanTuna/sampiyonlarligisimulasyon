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
const BOX_DEPTH = 0.16
const BOX_HEIGHT = 0.56
const SIX_YARD_DEPTH = 0.055
const SIX_YARD_HEIGHT = 0.26
const GOAL_DEPTH = 0.018
const GOAL_HEIGHT = 0.16
const PENALTY_SPOT_DEPTH = 0.11

export interface Size {
  width: number
  height: number
}

export function drawTurf(context: CanvasRenderingContext2D, size: Size) {
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

