import { applyWorldInset } from './pitchLayout'
import { drawApron, drawMarkings, drawTurf } from './pitchScene'
import type { Size } from './geometry'

const SUPERSAMPLE = 1.6

export interface Backdrop {
  paint: (context: CanvasRenderingContext2D, size: Size, ratio: number) => void
  release: () => void
}

export function createBackdrop(): Backdrop {
  const layer = document.createElement('canvas')
  let signature = ''

  const repaint = (size: Size, ratio: number) => {
    const scale = ratio * SUPERSAMPLE
    layer.width = Math.max(1, Math.round(size.width * scale))
    layer.height = Math.max(1, Math.round(size.height * scale))
    const context = layer.getContext('2d')
    if (context === null) return
    context.setTransform(scale, 0, 0, scale, 0, 0)
    drawApron(context, size)
    applyWorldInset(context, size)
    drawTurf(context, size)
    drawMarkings(context, size)
  }

  return {
    paint: (context, size, ratio) => {
      const next = `${size.width}×${size.height}@${ratio}`
      if (next !== signature) {
        signature = next
        repaint(size, ratio)
      }
      context.drawImage(layer, 0, 0, size.width, size.height)
    },
    release: () => {
      layer.width = 0
      layer.height = 0
    },
  }
}
