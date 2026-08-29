import { BANNER_TONE, PITCH_PALETTE } from './pitchPalette'
import { easeOutBack, saturate } from './geometry'
import type { BannerTone } from './pitchPalette'
import type { Camera } from './pitchCamera'
import type { Point, Size } from './geometry'

const BANNER_ENTER = 0.28
const BANNER_FADE = 0.4
const BANNER_TOP = 0.63
const MINIMAP_WIDTH = 0.17
const MINIMAP_MARGIN = 0.028
const MINIMAP_REVEAL_ZOOM = 1.06
const MINIMAP_ASPECT = 0.64

export interface ActiveBanner {
  title: string
  detail: string | null
  tone: BannerTone
  age: number
  life: number
}

export function drawMinimap(
  context: CanvasRenderingContext2D,
  size: Size,
  camera: Camera,
  ball: Point,
) {
  const reveal = saturate((camera.zoom - 1) / (MINIMAP_REVEAL_ZOOM - 1))
  if (reveal <= 0.01) return

  const width = size.width * MINIMAP_WIDTH
  const height = width * MINIMAP_ASPECT
  const x = size.width - width - size.height * MINIMAP_MARGIN
  const y = size.height - height - size.height * MINIMAP_MARGIN

  context.globalAlpha = reveal * 0.82
  context.fillStyle = PITCH_PALETTE.bannerPanel
  context.beginPath()
  context.roundRect(x, y, width, height, height * 0.12)
  context.fill()

  context.strokeStyle = PITCH_PALETTE.markings
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(x + width / 2, y)
  context.lineTo(x + width / 2, y + height)
  context.stroke()

  const half = 0.5 / camera.zoom
  context.strokeStyle = PITCH_PALETTE.carrier
  context.strokeRect(
    x + (camera.centre.x - half) * width,
    y + (camera.centre.y - half) * height,
    half * 2 * width,
    half * 2 * height,
  )

  context.fillStyle = PITCH_PALETTE.ball
  context.beginPath()
  context.arc(x + ball.x * width, y + ball.y * height, Math.max(1.5, height * 0.045), 0, Math.PI * 2)
  context.fill()
  context.globalAlpha = 1
}

function bannerOpacity(banner: ActiveBanner): number {
  const remaining = banner.life - banner.age
  return remaining >= BANNER_FADE ? 1 : saturate(remaining / BANNER_FADE)
}

export function drawBanner(
  context: CanvasRenderingContext2D,
  size: Size,
  banner: ActiveBanner,
) {
  const entrance = saturate(banner.age / BANNER_ENTER)
  const opacity = bannerOpacity(banner)
  if (opacity <= 0) return

  const titleSize = Math.max(13, size.height * 0.082)
  const detailSize = Math.max(10, size.height * 0.046)
  const padding = size.height * 0.032
  const centre = size.width / 2

  context.textAlign = 'center'
  context.textBaseline = 'top'
  context.font = `800 ${titleSize}px "Archivo", system-ui, sans-serif`
  const titleWidth = context.measureText(banner.title).width
  context.font = `600 ${detailSize}px "Archivo", system-ui, sans-serif`
  const detailWidth = banner.detail === null ? 0 : context.measureText(banner.detail).width
  const panelWidth = Math.max(titleWidth, detailWidth) + padding * 2.4
  const panelHeight = titleSize + (banner.detail === null ? 0 : detailSize * 1.5) + padding * 1.5
  const top = size.height * BANNER_TOP + (1 - easeOutBack(entrance)) * panelHeight * 0.6

  context.globalAlpha = opacity
  context.fillStyle = PITCH_PALETTE.bannerPanel
  context.beginPath()
  context.roundRect(centre - panelWidth / 2, top, panelWidth, panelHeight, panelHeight * 0.2)
  context.fill()

  context.fillStyle = BANNER_TONE[banner.tone]
  context.fillRect(centre - panelWidth / 2, top, panelWidth * 0.014, panelHeight)

  context.font = `800 ${titleSize}px "Archivo", system-ui, sans-serif`
  context.fillText(banner.title, centre, top + padding * 0.62)

  if (banner.detail !== null) {
    context.fillStyle = PITCH_PALETTE.bannerInk
    context.font = `600 ${detailSize}px "Archivo", system-ui, sans-serif`
    context.fillText(banner.detail, centre, top + padding * 0.62 + titleSize * 1.1)
  }
  context.globalAlpha = 1
}

export function drawFlash(
  context: CanvasRenderingContext2D,
  size: Size,
  strength: number,
  tint: string,
) {
  if (strength <= 0) return
  context.globalAlpha = saturate(strength) * 0.26
  context.fillStyle = tint
  context.fillRect(0, 0, size.width, size.height)
  context.globalAlpha = 1
}
