import {
  SHARE_PALETTE as palette,
  drawContainedImage,
  truncateText,
} from './canvasPrimitives'
import { CARD_MARGIN as MARGIN, CARD_WIDTH as WIDTH } from './teamCardLayout'
import { OUTCOME_SHORT, VENUE_LABEL } from '../fixtures/matchPresentation'
import { decisionSuffix } from '../../domain/teamKnockoutRun'
import type { KnockoutAppearance } from '../../domain/teamKnockoutRun'
import type { Fixture } from '../../domain/types'

const DISPLAY = '"Archivo", "Manrope", sans-serif'
const BODY = '"Manrope", sans-serif'

export function drawSectionHeading(context: CanvasRenderingContext2D, text: string, y: number) {
  context.font = `600 22px ${DISPLAY}`
  context.fillStyle = palette.muted
  context.letterSpacing = '4px'
  context.fillText(text.toLocaleUpperCase('tr'), MARGIN, y)
  context.letterSpacing = '0px'
}

export function drawRowDivider(context: CanvasRenderingContext2D, y: number) {
  context.strokeStyle = palette.line
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(MARGIN, y)
  context.lineTo(WIDTH - MARGIN, y)
  context.stroke()
}

export function drawFixtureRow(
  context: CanvasRenderingContext2D,
  fixture: Fixture,
  crest: HTMLImageElement,
  y: number,
  rowHeight: number,
) {
  const isHome = fixture.venue === 'HOME'
  const crestSize = Math.min(56, rowHeight - 18)
  const centre = y + rowHeight / 2

  context.fillStyle = isHome ? palette.home : palette.away
  context.fillRect(MARGIN, y + 6, 4, rowHeight - 14)

  drawContainedImage(context, crest, MARGIN + 28, centre - crestSize / 2, crestSize)

  const nameSize = Math.min(34, Math.round(rowHeight * 0.4))
  context.font = `700 ${nameSize}px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.fillText(truncateText(context, fixture.opponent.name, 380), MARGIN + 108, centre - 4)

  context.font = `500 20px ${BODY}`
  context.fillStyle = isHome ? palette.home : palette.away
  context.fillText(VENUE_LABEL[fixture.venue], MARGIN + 108, centre + 22)

  context.textAlign = 'right'
  if (fixture.goalsFor !== null && fixture.goalsAgainst !== null) {
    context.font = `800 ${Math.min(46, Math.round(rowHeight * 0.5))}px ${DISPLAY}`
    context.fillStyle = palette.fg
    context.fillText(
      `${fixture.goalsFor} – ${fixture.goalsAgainst}`,
      WIDTH - MARGIN - 60,
      centre + 10,
    )

    context.font = `800 28px ${DISPLAY}`
    context.fillStyle =
      fixture.outcome === 'WIN' ? palette.home : fixture.outcome === 'LOSS' ? palette.dim : palette.muted
    context.fillText(OUTCOME_SHORT[fixture.outcome ?? 'DRAW'], WIDTH - MARGIN, centre + 10)
  } else {
    context.font = `500 24px ${BODY}`
    context.fillStyle = palette.dim
    context.fillText('—', WIDTH - MARGIN, centre + 10)
  }
  context.textAlign = 'left'

  drawRowDivider(context, y + rowHeight)
}

export function drawKnockoutRow(
  context: CanvasRenderingContext2D,
  appearance: KnockoutAppearance,
  crest: HTMLImageElement,
  y: number,
  rowHeight: number,
) {
  const crestSize = Math.min(34, rowHeight - 22)
  const centre = y + rowHeight / 2

  context.fillStyle = appearance.advanced ? palette.home : palette.dim
  context.fillRect(MARGIN, y + 6, 4, rowHeight - 14)

  context.font = `600 19px ${DISPLAY}`
  context.fillStyle = palette.accent
  context.letterSpacing = '2px'
  context.fillText(appearance.roundLabel.toLocaleUpperCase('tr'), MARGIN + 28, centre - 10)
  context.letterSpacing = '0px'

  drawContainedImage(context, crest, MARGIN + 28, centre + 2, crestSize)

  context.font = `500 22px ${BODY}`
  context.fillStyle = palette.muted
  context.fillText(
    truncateText(context, appearance.opponent.name, 300),
    MARGIN + 28 + crestSize + 12,
    centre + 24,
  )

  context.textAlign = 'right'
  context.font = `800 ${Math.min(38, Math.round(rowHeight * 0.46))}px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.fillText(
    `${appearance.goalsFor} – ${appearance.goalsAgainst}`,
    WIDTH - MARGIN - 56,
    centre + 8,
  )

  const suffix = decisionSuffix(appearance.decidedBy)
  if (suffix !== '') {
    context.font = `500 17px ${BODY}`
    context.fillStyle = palette.muted
    context.fillText(suffix, WIDTH - MARGIN - 56, centre + 30)
  }

  context.font = `800 26px ${DISPLAY}`
  context.fillStyle = appearance.advanced ? palette.home : palette.dim
  context.fillText(appearance.advanced ? '↑' : '×', WIDTH - MARGIN, centre + 8)
  context.textAlign = 'left'

  drawRowDivider(context, y + rowHeight)
}
