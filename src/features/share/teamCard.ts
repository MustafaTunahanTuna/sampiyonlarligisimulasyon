import {
  SHARE_PALETTE as palette,
  drawContainedImage,
  drawStar,
  drawNeonStarball,
  drawStarfield,
  loadImage,
  truncateText,
} from './canvasPrimitives'
import { OUTCOME_SHORT, VENUE_LABEL } from '../fixtures/matchPresentation'
import { QUALIFICATION_LABEL } from '../../domain/standings'
import type { Fixture, StandingRow, Team } from '../../domain/types'

const WIDTH = 1080
const HEIGHT = 1350
const MARGIN = 72
const DISPLAY = '"Archivo", "Manrope", sans-serif'
const BODY = '"Manrope", sans-serif'

export interface TeamCardInput {
  team: Team
  fixtures: Fixture[]
  standing: StandingRow
  seed: string
}

function drawEyebrow(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  context.font = `600 22px ${DISPLAY}`
  context.fillStyle = color
  context.letterSpacing = '4px'
  context.fillText(text.toLocaleUpperCase('tr'), x, y)
  context.letterSpacing = '0px'
}

function drawHeader(context: CanvasRenderingContext2D, seed: string) {
  drawStar(context, MARGIN + 12, MARGIN + 6, 14, palette.accent)
  drawEyebrow(context, 'Şampiyonlar Ligi 2026/27 · Lig aşaması', MARGIN + 40, MARGIN + 14, palette.muted)

  context.textAlign = 'right'
  drawEyebrow(context, `Senaryo ${seed}`, WIDTH - MARGIN, MARGIN + 14, palette.dim)
  context.textAlign = 'left'
}

function drawHero(
  context: CanvasRenderingContext2D,
  team: Team,
  crest: HTMLImageElement,
  standing: StandingRow,
) {
  const top = MARGIN + 70
  drawContainedImage(context, crest, MARGIN, top, 168)

  const textLeft = MARGIN + 200
  context.font = `800 76px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.letterSpacing = '-2px'
  context.fillText(
    truncateText(context, team.name.toLocaleUpperCase('tr'), WIDTH - textLeft - MARGIN),
    textLeft,
    top + 78,
  )
  context.letterSpacing = '0px'

  context.font = `500 26px ${BODY}`
  context.fillStyle = palette.muted
  context.fillText(`${team.countryName} · Torba ${standing.team.pot}`, textLeft, top + 122)

  const badgeTop = top + 152
  context.font = `800 30px ${DISPLAY}`
  context.fillStyle = palette.accent
  context.fillText(`${standing.position}. SIRA`, textLeft, badgeTop)
  context.font = `500 26px ${BODY}`
  context.fillStyle = palette.muted
  const positionWidth = context.measureText(`${standing.position}. SIRA`).width
  context.fillText(
    `${standing.points} puan · ${standing.wins}G ${standing.draws}B ${standing.losses}M · ${QUALIFICATION_LABEL[standing.qualification]}`,
    textLeft + positionWidth + 60,
    badgeTop,
  )
}

function drawFixtureRow(
  context: CanvasRenderingContext2D,
  fixture: Fixture,
  crest: HTMLImageElement,
  y: number,
) {
  const isHome = fixture.venue === 'HOME'
  const rowHeight = 96

  context.fillStyle = isHome ? palette.home : palette.away
  context.fillRect(MARGIN, y, 4, rowHeight - 16)

  drawContainedImage(context, crest, MARGIN + 28, y + 12, 56)

  context.font = `700 34px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.fillText(truncateText(context, fixture.opponent.name, 420), MARGIN + 108, y + 44)

  context.font = `500 22px ${BODY}`
  context.fillStyle = isHome ? palette.home : palette.away
  context.fillText(VENUE_LABEL[fixture.venue], MARGIN + 108, y + 74)

  context.textAlign = 'right'
  if (fixture.goalsFor !== null && fixture.goalsAgainst !== null) {
    context.font = `800 46px ${DISPLAY}`
    context.fillStyle = palette.fg
    context.fillText(`${fixture.goalsFor} – ${fixture.goalsAgainst}`, WIDTH - MARGIN - 60, y + 56)

    context.font = `800 30px ${DISPLAY}`
    context.fillStyle =
      fixture.outcome === 'WIN' ? palette.home : fixture.outcome === 'LOSS' ? palette.dim : palette.muted
    context.fillText(OUTCOME_SHORT[fixture.outcome ?? 'DRAW'], WIDTH - MARGIN, y + 56)
  } else {
    context.font = `500 26px ${BODY}`
    context.fillStyle = palette.dim
    context.fillText('—', WIDTH - MARGIN, y + 56)
  }
  context.textAlign = 'left'

  context.strokeStyle = palette.line
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(MARGIN, y + rowHeight - 8)
  context.lineTo(WIDTH - MARGIN, y + rowHeight - 8)
  context.stroke()
}

function drawFooter(context: CanvasRenderingContext2D, standing: StandingRow) {
  const y = HEIGHT - MARGIN
  context.font = `500 22px ${BODY}`
  context.fillStyle = palette.dim
  context.fillText('Kura verisi: uefa.com · Tahmin ve simülasyon', MARGIN, y)

  context.textAlign = 'right'
  context.font = `800 34px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.fillText(`${standing.goalsFor}:${standing.goalsAgainst}`, WIDTH - MARGIN, y)
  context.textAlign = 'left'
}

export async function renderTeamCard({ team, fixtures, standing, seed }: TeamCardInput): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas bağlamı oluşturulamadı')

  const [teamCrest, ...opponentCrests] = await Promise.all([
    loadImage(team.logoLarge),
    ...fixtures.map((fixture) => loadImage(fixture.opponent.logo)),
  ])
  await document.fonts.ready

  context.fillStyle = palette.base
  context.fillRect(0, 0, WIDTH, HEIGHT)
  drawStarfield(context, WIDTH, HEIGHT, 20260827)
  await drawNeonStarball(context, WIDTH * 0.34, HEIGHT * 0.52, WIDTH * 0.92, 0.3)
  context.textBaseline = 'alphabetic'

  drawHeader(context, seed)
  drawHero(context, team, teamCrest, standing)

  let rowY = MARGIN + 420
  fixtures.forEach((fixture, index) => {
    drawFixtureRow(context, fixture, opponentCrests[index], rowY)
    rowY += 96
  })

  drawFooter(context, standing)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob === null ? reject(new Error('Görsel oluşturulamadı')) : resolve(blob)),
      'image/png',
    )
  })
}
