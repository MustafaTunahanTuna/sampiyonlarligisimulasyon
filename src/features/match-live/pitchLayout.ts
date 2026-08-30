import type { Size } from './geometry'

export const PITCH_INSET = 0.045
export const WORLD_SCALE = 1 - PITCH_INSET * 2

export function applyWorldInset(context: CanvasRenderingContext2D, size: Size) {
  context.translate(size.width * PITCH_INSET, size.height * PITCH_INSET)
  context.scale(WORLD_SCALE, WORLD_SCALE)
}
