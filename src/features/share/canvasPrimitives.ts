export interface Palette {
  base: string
  surface: string
  line: string
  fg: string
  muted: string
  dim: string
  accent: string
  home: string
  away: string
}

export const SHARE_PALETTE: Palette = {
  base: '#080d2b',
  surface: '#111a45',
  line: '#26315f',
  fg: '#f7f9ff',
  muted: '#9aa5cc',
  dim: '#5a648f',
  accent: '#7fd8f5',
  home: '#5fe0a4',
  away: '#7fd8f5',
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Görsel yüklenemedi: ${src}`))
    image.src = src
  })
}

export function drawStarfield(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
) {
  const glow = context.createRadialGradient(width / 2, -height * 0.1, 0, width / 2, height * 0.35, height * 0.8)
  glow.addColorStop(0, 'rgba(64, 138, 220, 0.42)')
  glow.addColorStop(1, 'rgba(8, 13, 43, 0)')
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)

  let state = seed >>> 0
  const nextRandom = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }

  for (let index = 0; index < 90; index += 1) {
    const x = nextRandom() * width
    const y = nextRandom() * height
    const radius = nextRandom() * 1.8 + 0.4
    context.fillStyle = `rgba(247, 249, 255, ${0.15 + nextRandom() * 0.5})`
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
}

export async function drawNeonStarball(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
) {
  const ball = await loadImage('/starball.webp')
  context.save()
  context.globalCompositeOperation = 'screen'
  context.globalAlpha = opacity
  drawContainedImage(context, ball, x, y, size)
  context.restore()
}

export function drawStar(
  context: CanvasRenderingContext2D,
  centreX: number,
  centreY: number,
  radius: number,
  fill: string,
) {
  const points = 5
  context.save()
  context.beginPath()
  for (let index = 0; index < points * 2; index += 1) {
    const angle = (Math.PI / points) * index - Math.PI / 2
    const distance = index % 2 === 0 ? radius : radius * 0.42
    const x = centreX + Math.cos(angle) * distance
    const y = centreY + Math.sin(angle) * distance
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.fillStyle = fill
  context.fill()
  context.restore()
}

export function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number,
) {
  const scale = Math.min(size / image.width, size / image.height)
  const width = image.width * scale
  const height = image.height * scale
  context.drawImage(image, x + (size - width) / 2, y + (size - height) / 2, width, height)
}

export function truncateText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (context.measureText(text).width <= maxWidth) return text
  let clipped = text
  while (clipped.length > 1 && context.measureText(`${clipped}…`).width > maxWidth) {
    clipped = clipped.slice(0, -1)
  }
  return `${clipped}…`
}

export const CARD_PIXEL_RATIO = 2

export interface CardCanvas {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

export function createCardCanvas(width: number, height: number): CardCanvas {
  const canvas = document.createElement('canvas')
  canvas.width = width * CARD_PIXEL_RATIO
  canvas.height = height * CARD_PIXEL_RATIO
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas bağlamı oluşturulamadı')

  context.scale(CARD_PIXEL_RATIO, CARD_PIXEL_RATIO)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.textBaseline = 'alphabetic'
  return { canvas, context }
}

export function toCardBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob === null ? reject(new Error('Görsel oluşturulamadı')) : resolve(blob)),
      'image/png',
    )
  })
}
