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
import { runSummaryLabel } from '../knockout/tiePresentation'
import { toUpperCase } from '../../i18n/formatters'
import { countryNameOf } from '../../i18n/countryNames'
import type { Fixture, StandingRow, Team } from '../../domain/types'
import type { KnockoutSummary } from '../../domain/teamKnockoutRun'
import type { ShareText } from './shareText'

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
  knockoutSummary: KnockoutSummary | null
  seed: string
  text: ShareText
}

function drawEyebrow(
  context: CanvasRenderingContext2D,
  label: string,
  locale: ShareText['locale'],
  x: number,
  y: number,
  color: string,
) {
  context.font = `600 22px ${DISPLAY}`
  context.fillStyle = color
  context.letterSpacing = '4px'
  context.fillText(toUpperCase(label, locale), x, y)
  context.letterSpacing = '0px'
}

function drawHeader(context: CanvasRenderingContext2D, seed: string, text: ShareText) {
  drawStar(context, MARGIN + 12, MARGIN + 6, 14, palette.accent)
  drawEyebrow(
    context,
    text.t.share.brandWithStage,
    text.locale,
    MARGIN + 40,
    MARGIN + 14,
    palette.muted,
  )

  context.textAlign = 'right'
  drawEyebrow(context, text.t.share.scenario(seed), text.locale, WIDTH - MARGIN, MARGIN + 14, palette.dim)
  context.textAlign = 'left'
}

function drawHero(
  context: CanvasRenderingContext2D,
  team: Team,
  crest: HTMLImageElement,
  standing: StandingRow,
  knockoutSummary: KnockoutSummary | null,
  text: ShareText,
) {
  const top = MARGIN + 70
  drawContainedImage(context, crest, MARGIN, top, 168)

  const textLeft = MARGIN + 200
  context.font = `800 76px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.letterSpacing = '-2px'
  context.fillText(
    truncateText(context, toUpperCase(team.name, text.locale), WIDTH - textLeft - MARGIN),
    textLeft,
    top + 78,
  )
  context.letterSpacing = '0px'

  context.font = `500 26px ${BODY}`
  context.fillStyle = palette.muted
  context.fillText(
    text.t.share.teamMeta(countryNameOf(team, text.locale), standing.team.pot),
    textLeft,
    top + 122,
  )

  const badgeTop = top + 152
  context.font = `800 30px ${DISPLAY}`
  context.fillStyle = palette.accent
  const positionBadge = text.t.share.positionBadge(standing.position)
  context.fillText(positionBadge, textLeft, badgeTop)
  context.font = `500 26px ${BODY}`
  context.fillStyle = palette.muted
  const positionWidth = context.measureText(positionBadge).width
  context.fillText(
    text.t.share.teamRecord(
      standing.points,
      standing.wins,
      standing.draws,
      standing.losses,
      standing.goalsFor,
      standing.goalsAgainst,
    ),
    textLeft + positionWidth + 60,
    badgeTop,
  )

  context.font = `600 24px ${DISPLAY}`
  context.fillStyle = knockoutSummary === null ? palette.muted : palette.accent
  context.letterSpacing = '2px'
  const outcomeLabel =
    knockoutSummary === null
      ? text.t.standings.qualificationOutcome[standing.qualification]
      : runSummaryLabel(knockoutSummary, text.t)
  context.fillText(toUpperCase(outcomeLabel, text.locale), textLeft, badgeTop + 42)
  context.letterSpacing = '0px'
}

function drawFooter(context: CanvasRenderingContext2D, text: ShareText, y: number) {
  context.font = `500 22px ${BODY}`
  context.fillStyle = palette.dim
  context.fillText(text.t.share.footer, MARGIN, y)
}

export async function renderTeamCard({
  team,
  fixtures,
  standing,
  knockoutRun,
  knockoutSummary,
  seed,
  text,
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

  drawHeader(context, seed, text)
  drawHero(context, team, teamCrest, standing, knockoutSummary, text)

  drawSectionHeading(context, text.t.share.leagueSection, text.locale, layout.contentTop + 24)
  fixtures.forEach((fixture, index) => {
    drawFixtureRow(
      context,
      fixture,
      opponentCrests[index],
      text,
      layout.fixturesTop + index * layout.rowHeight,
      layout.rowHeight,
    )
  })

  const knockoutTop = layout.knockoutTop
  if (knockoutTop !== null) {
    drawSectionHeading(context, text.t.share.knockoutSection, text.locale, knockoutTop - 16)
    knockoutRun.forEach((appearance, index) => {
      drawKnockoutRow(
        context,
        appearance,
        knockoutCrests[index],
        text,
        knockoutTop + index * layout.rowHeight,
        layout.rowHeight,
      )
    })
  }

  drawFooter(context, text, layout.footerY)

  return toCardBlob(canvas)
}
