import {
  SHARE_PALETTE as palette,
  drawContainedImage,
  drawStar,
  drawNeonStarball,
  createCardCanvas,
  drawStarfield,
  loadImage,
  toCardBlob,
  truncateText,
} from './canvasPrimitives'
import { QUALIFICATION_OUTCOME_LABEL } from '../../domain/standings'
import type { Fixture, StandingRow, Team } from '../../domain/types'

import {
  CARD_HEIGHT as HEIGHT,
  CARD_MARGIN as MARGIN,
  CARD_WIDTH as WIDTH,
  teamCardLayout,
} from './teamCardLayout'
import { drawFixtureRow, drawKnockoutRow, drawSectionHeading } from './teamCardRows'
import type { KnockoutAppearance } from '../../domain/teamKnockoutRun'

const DISPLAY = '"Archivo", "Manrope", sans-serif'
const BODY = '"Manrope", sans-serif'

export interface TeamCardInput {
  team: Team
  fixtures: Fixture[]
  standing: StandingRow
  knockoutRun: KnockoutAppearance[]
  knockoutSummary: string | null
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
  knockoutSummary: string | null,
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
    `${standing.points} puan · ${standing.wins}G ${standing.draws}B ${standing.losses}M · ${standing.goalsFor}-${standing.goalsAgainst}`,
    textLeft + positionWidth + 60,
    badgeTop,
  )

  context.font = `600 24px ${DISPLAY}`
  context.fillStyle = knockoutSummary === null ? palette.muted : palette.accent
  context.letterSpacing = '2px'
  context.fillText(
    (knockoutSummary ?? QUALIFICATION_OUTCOME_LABEL[standing.qualification]).toLocaleUpperCase('tr'),
    textLeft,
    badgeTop + 42,
  )
  context.letterSpacing = '0px'
}

function drawFooter(context: CanvasRenderingContext2D, y: number) {
  context.font = `500 22px ${BODY}`
  context.fillStyle = palette.dim
  context.fillText('Kura verisi: uefa.com · Tahmin ve simülasyon', MARGIN, y)
}

export async function renderTeamCard({
  team,
  fixtures,
  standing,
  knockoutRun,
  knockoutSummary,
  seed,
}: TeamCardInput): Promise<Blob> {
  const { canvas, context } = createCardCanvas(WIDTH, HEIGHT)

  const [teamCrest, ...crests] = await Promise.all([
    loadImage(team.logoLarge),
    ...fixtures.map((fixture) => loadImage(fixture.opponent.logo)),
    ...knockoutRun.map((appearance) => loadImage(appearance.opponent.logo)),
  ])
  const opponentCrests = crests.slice(0, fixtures.length)
  const knockoutCrests = crests.slice(fixtures.length)
  await document.fonts.ready

  context.fillStyle = palette.base
  context.fillRect(0, 0, WIDTH, HEIGHT)
  drawStarfield(context, WIDTH, HEIGHT, 20260827)
  await drawNeonStarball(context, WIDTH * 0.34, HEIGHT * 0.52, WIDTH * 0.92, 0.3)

  const layout = teamCardLayout(fixtures.length, knockoutRun.length)

  drawHeader(context, seed)
  drawHero(context, team, teamCrest, standing, knockoutSummary)

  drawSectionHeading(context, 'Lig aşaması', layout.contentTop + 24)
  fixtures.forEach((fixture, index) => {
    drawFixtureRow(
      context,
      fixture,
      opponentCrests[index],
      layout.fixturesTop + index * layout.rowHeight,
      layout.rowHeight,
    )
  })

  const knockoutTop = layout.knockoutTop
  if (knockoutTop !== null) {
    drawSectionHeading(context, 'Nakavt aşaması', knockoutTop - 16)
    knockoutRun.forEach((appearance, index) => {
      drawKnockoutRow(
        context,
        appearance,
        knockoutCrests[index],
        knockoutTop + index * layout.rowHeight,
        layout.rowHeight,
      )
    })
  }

  drawFooter(context, layout.footerY)

  return toCardBlob(canvas)
}
