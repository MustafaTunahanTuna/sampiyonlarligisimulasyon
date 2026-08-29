import { PITCH_PALETTE, drawMarkings, drawTurf } from './pitchScene'
import type { Kit } from './kits'
import type { PitchFrame } from './pitchFrame'
import type { Point } from './formations'
import type { Size } from './pitchScene'
import { KEEPER_SLOT, SHIRT_NUMBER } from './squad'

const PLAYER_RADIUS_RATIO = 0.028
const BALL_RADIUS_RATIO = 0.0105
const LABEL_MARGIN = 0.022
const BALL_LIFT_RISE = 0.055
const BALL_LIFT_GROWTH = 0.55
const SHADOW_LIFT_DROP = 3.6

const BANNER_TONE: Record<BannerTone, string> = {
  goal: 'rgba(56, 214, 132, 0.92)',
  card: 'rgba(247, 191, 62, 0.92)',
  danger: 'rgba(255, 107, 107, 0.95)',
  miss: 'rgba(226, 240, 255, 0.72)',
}
const BANNER_PANEL = 'rgba(6, 14, 10, 0.82)'

export type BannerTone = 'goal' | 'card' | 'danger' | 'miss'

export interface StageBanner {
  title: string
  detail: string | null
  tone: BannerTone
  strength: number
}

export interface TeamVisual {
  code: string
  kit: Kit
}

export interface RenderOptions {
  trail: Point[]
  flash: number
  flashTint: string
  banner: StageBanner | null
  home: TeamVisual
  away: TeamVisual
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

function drawBall(context: CanvasRenderingContext2D, size: Size, ball: Point, lift: number) {
  const radius = size.height * BALL_RADIUS_RATIO
  const x = ball.x * size.width
  const groundY = ball.y * size.height
  const y = groundY - lift * BALL_LIFT_RISE * size.height

  context.globalAlpha = 1 - lift * 0.45
  context.fillStyle = PITCH_PALETTE.shadow
  context.beginPath()
  context.ellipse(
    x,
    groundY + radius * (0.9 + lift * SHADOW_LIFT_DROP),
    radius * (0.9 - lift * 0.3),
    radius * (0.5 - lift * 0.18),
    0,
    0,
    Math.PI * 2,
  )
  context.fill()
  context.globalAlpha = 1

  context.fillStyle = PITCH_PALETTE.ball
  context.beginPath()
  context.arc(x, y, radius * (1 + lift * BALL_LIFT_GROWTH), 0, Math.PI * 2)
  context.fill()
}

function drawBanner(context: CanvasRenderingContext2D, size: Size, banner: StageBanner) {
  const titleSize = Math.max(13, size.height * 0.085)
  const detailSize = Math.max(10, size.height * 0.05)
  const padding = size.height * 0.03
  const centre = size.width / 2
  const top = size.height * 0.62

  context.font = `800 ${titleSize}px "Archivo", system-ui, sans-serif`
  const titleWidth = context.measureText(banner.title).width
  context.font = `600 ${detailSize}px "Archivo", system-ui, sans-serif`
  const detailWidth = banner.detail === null ? 0 : context.measureText(banner.detail).width
  const panelWidth = Math.max(titleWidth, detailWidth) + padding * 2
  const panelHeight = titleSize + (banner.detail === null ? 0 : detailSize * 1.5) + padding * 1.6

  context.globalAlpha = banner.strength
  context.fillStyle = BANNER_PANEL
  context.beginPath()
  context.roundRect(centre - panelWidth / 2, top, panelWidth, panelHeight, panelHeight * 0.22)
  context.fill()

  context.textAlign = 'center'
  context.textBaseline = 'top'
  context.fillStyle = BANNER_TONE[banner.tone]
  context.font = `800 ${titleSize}px "Archivo", system-ui, sans-serif`
  context.fillText(banner.title, centre, top + padding * 0.7)

  if (banner.detail !== null) {
    context.fillStyle = 'rgba(255, 255, 255, 0.88)'
    context.font = `600 ${detailSize}px "Archivo", system-ui, sans-serif`
    context.fillText(banner.detail, centre, top + padding * 0.7 + titleSize * 1.12)
  }
  context.globalAlpha = 1
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
  drawBall(context, size, frame.ball, frame.lift)

  if (options.flash > 0) {
    context.globalAlpha = options.flash * 0.28
    context.fillStyle = options.flashTint
    context.fillRect(0, 0, size.width, size.height)
    context.globalAlpha = 1
  }

  if (options.banner !== null && options.banner.strength > 0) {
    drawBanner(context, size, options.banner)
  }
}
