import type { Size } from './geometry'

export const PITCH_ASPECT = 0.648

export interface StageSurface {
  size: Size
  ratio: () => number
  release: () => void
}

export function observeStageSurface(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): StageSurface {
  const size: Size = { width: 0, height: 0 }
  let ratio = 1

  const measure = () => {
    ratio = window.devicePixelRatio || 1
    size.width = canvas.clientWidth
    size.height = Math.round(size.width * PITCH_ASPECT)
    canvas.width = Math.max(1, Math.round(size.width * ratio))
    canvas.height = Math.max(1, Math.round(size.height * ratio))
    canvas.style.height = `${size.height}px`
    context.imageSmoothingQuality = 'high'
  }

  const observer = new ResizeObserver(measure)
  observer.observe(canvas)
  measure()

  return { size, ratio: () => ratio, release: () => observer.disconnect() }
}
