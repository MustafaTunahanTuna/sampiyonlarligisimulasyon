import { PITCH_PALETTE } from './pitchPalette'
import { saturate } from './geometry'
import type { Point, Size } from './geometry'

const RIPPLE_LIFE = 0.7
const RIPPLE_RINGS = 3
const RIPPLE_START = 0.008
const RIPPLE_GROWTH = 0.05
const LETTERBOX_SHARE = 0.085

export interface NetRipple {
  impact: Point
  age: number
}

export function drawNetRipple(context: CanvasRenderingContext2D, size: Size, ripple: NetRipple) {
  const life = saturate(1 - ripple.age / RIPPLE_LIFE)
  if (life <= 0) return

  const x = ripple.impact.x * size.width
  const y = ripple.impact.y * size.height
  context.strokeStyle = PITCH_PALETTE.goalFrame
  context.lineWidth = Math.max(1, size.height * 0.0035)
  for (let ring = 0; ring < RIPPLE_RINGS; ring += 1) {
    const spread = ripple.age / RIPPLE_LIFE + ring / RIPPLE_RINGS
    const radius = size.height * (RIPPLE_START + spread * RIPPLE_GROWTH)
    context.globalAlpha = life * (1 - ring / RIPPLE_RINGS) * 0.7
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.stroke()
  }
  context.globalAlpha = 1
}

export function drawLetterbox(
  context: CanvasRenderingContext2D,
  size: Size,
  amount: number,
  label: string,
) {
  const reveal = saturate(amount)
  if (reveal <= 0.01) return

  const bar = size.height * LETTERBOX_SHARE * reveal
  context.fillStyle = 'rgba(2, 6, 4, 0.92)'
  context.fillRect(0, 0, size.width, bar)
  context.fillRect(0, size.height - bar, size.width, bar)

  if (reveal < 0.6) return
  const fontSize = Math.max(9, size.height * 0.036)
  context.fillStyle = PITCH_PALETTE.bannerInk
  context.globalAlpha = (reveal - 0.6) / 0.4
  context.font = `700 ${fontSize}px "Archivo", system-ui, sans-serif`
  context.textAlign = 'right'
  context.textBaseline = 'middle'
  context.fillText(label, size.width - size.height * 0.03, bar / 2)
  context.globalAlpha = 1
}
