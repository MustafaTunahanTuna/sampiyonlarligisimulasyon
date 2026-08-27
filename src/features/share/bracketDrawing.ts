import { SHARE_PALETTE as palette, drawContainedImage, truncateText } from './canvasPrimitives'
import { decisionSuffix } from '../../domain/teamKnockoutRun'
import type { Box, BracketSide } from './bracketLayout'
import type { KnockoutTie, Team, TieOutcome } from '../../domain/types'

const DISPLAY = '"Archivo", "Manrope", sans-serif'
const BODY = '"Manrope", sans-serif'
const CREST_SIZE = 20

export interface TieVisual {
  tie: KnockoutTie
  outcome: TieOutcome | undefined
}

function drawSide(
  context: CanvasRenderingContext2D,
  team: Team | null,
  placeholder: string,
  crest: HTMLImageElement | null,
  aggregate: number | null,
  isWinner: boolean,
  isFavourite: boolean,
  box: Box,
  baseline: number,
  useFullName: boolean,
) {
  const left = box.x + 10
  const right = box.x + box.width - 10

  if (team === null || crest === null) {
    context.font = `500 14px ${BODY}`
    context.fillStyle = palette.dim
    context.fillText(truncateText(context, placeholder, box.width - 24), left, baseline)
    return
  }

  drawContainedImage(context, crest, left, baseline - CREST_SIZE + 5, CREST_SIZE)

  const textLeft = left + CREST_SIZE + 8
  context.font = useFullName
    ? `${isWinner ? 700 : 500} 17px ${BODY}`
    : `${isWinner ? 800 : 600} 17px ${DISPLAY}`
  context.fillStyle = isWinner ? palette.fg : palette.muted
  const label = useFullName
    ? truncateText(context, team.name, box.width - CREST_SIZE - 56)
    : team.code
  context.fillText(label, textLeft, baseline)

  if (isFavourite) {
    context.fillStyle = palette.accent
    context.fillRect(textLeft, baseline + 4, context.measureText(label).width, 2)
  }

  if (aggregate !== null) {
    context.textAlign = 'right'
    context.font = `800 18px ${DISPLAY}`
    context.fillStyle = isWinner ? palette.fg : palette.dim
    context.fillText(String(aggregate), right, baseline)
    context.textAlign = 'left'
  }
}

export function drawTieBox(
  context: CanvasRenderingContext2D,
  visual: TieVisual,
  crests: Map<string, HTMLImageElement>,
  favouriteTeamId: string | null,
  box: Box,
  useFullName = false,
) {
  const { tie, outcome } = visual
  const isDecided = outcome !== undefined

  context.fillStyle = isDecided ? 'rgba(17, 26, 69, 0.85)' : 'rgba(13, 20, 54, 0.55)'
  context.beginPath()
  context.roundRect(box.x, box.y, box.width, box.height, 9)
  context.fill()
  context.strokeStyle = isDecided ? palette.line : 'rgba(38, 49, 95, 0.6)'
  context.lineWidth = 1
  context.stroke()

  const winnerId = outcome?.winner.id ?? null
  const crestFor = (team: Team | null) => (team === null ? null : (crests.get(team.id) ?? null))

  drawSide(
    context,
    tie.seeded,
    tie.seededLabel,
    crestFor(tie.seeded),
    outcome?.aggregateSeeded ?? null,
    winnerId === tie.seeded?.id,
    tie.seeded?.id === favouriteTeamId,
    box,
    box.y + 26,
    useFullName,
  )
  drawSide(
    context,
    tie.challenger,
    tie.challengerLabel,
    crestFor(tie.challenger),
    outcome?.aggregateChallenger ?? null,
    winnerId === tie.challenger?.id,
    tie.challenger?.id === favouriteTeamId,
    box,
    box.y + 50,
    useFullName,
  )

  const suffix = outcome === undefined ? '' : decisionSuffix(outcome.decidedBy)
  if (suffix !== '') {
    context.textAlign = 'right'
    context.font = `600 11px ${DISPLAY}`
    context.fillStyle = palette.dim
    context.letterSpacing = '1.5px'
    context.fillText(
      suffix.toLocaleUpperCase('tr'),
      box.x + box.width - 34,
      box.y + box.height / 2 + 4,
    )
    context.letterSpacing = '0px'
    context.textAlign = 'left'
  }
}

export function drawConnector(
  context: CanvasRenderingContext2D,
  from: Box,
  to: Box,
  side: BracketSide,
) {
  const fromX = side === 'left' ? from.x + from.width : from.x
  const toX = side === 'left' ? to.x : to.x + to.width
  const midX = (fromX + toX) / 2
  const fromY = from.y + from.height / 2
  const toY = to.y + to.height / 2

  context.strokeStyle = 'rgba(90, 100, 143, 0.55)'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(fromX, fromY)
  context.lineTo(midX, fromY)
  context.lineTo(midX, toY)
  context.lineTo(toX, toY)
  context.stroke()
}

export function drawFinalConnector(
  context: CanvasRenderingContext2D,
  from: Box,
  final: Box,
  side: BracketSide,
) {
  const fromX = side === 'left' ? from.x + from.width : from.x
  const fromY = from.y + from.height / 2
  const targetX = side === 'left' ? final.x : final.x + final.width
  const targetY = final.y + final.height / 2
  const midX = (fromX + targetX) / 2

  context.strokeStyle = 'rgba(90, 100, 143, 0.55)'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(fromX, fromY)
  context.lineTo(midX, fromY)
  context.lineTo(midX, targetY)
  context.lineTo(targetX, targetY)
  context.stroke()
}

export function drawRoundLabel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign,
) {
  context.textAlign = align
  context.font = `600 15px ${DISPLAY}`
  context.fillStyle = palette.dim
  context.letterSpacing = '2.5px'
  context.fillText(text.toLocaleUpperCase('tr'), x, y)
  context.letterSpacing = '0px'
  context.textAlign = 'left'
}
