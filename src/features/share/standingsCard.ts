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
import { toUpperCase } from '../../i18n/formatters'
import type { LeagueStats } from '../../domain/leagueStats'
import type { StandingRow, Team } from '../../domain/types'
import type { ShareText } from './shareText'

import {
  CARD_HEIGHT as HEIGHT,
  CARD_MARGIN as MARGIN,
  CARD_WIDTH as WIDTH,
  rowBandTop,
  tableLayout,
} from './standingsCardLayout'

const DISPLAY = '"Archivo", "Manrope", sans-serif'
const BODY = '"Manrope", sans-serif'
const CREST_SIZE = 21
const ZONE_COLOUR = { LAST_16: palette.home, PLAY_OFF: palette.away, ELIMINATED: palette.dim }

export interface StandingsCardInput {
  rows: StandingRow[]
  stats: LeagueStats
  favouriteTeam: Team | null
  seed: string
  text: ShareText
}

function drawHeader(
  context: CanvasRenderingContext2D,
  stats: LeagueStats,
  seed: string,
  text: ShareText,
) {
  drawStar(context, MARGIN + 12, MARGIN + 6, 14, palette.accent)
  context.font = `600 22px ${DISPLAY}`
  context.letterSpacing = '4px'
  context.fillStyle = palette.muted
  context.fillText(toUpperCase(text.t.share.brandWithStage, text.locale), MARGIN + 40, MARGIN + 14)
  context.textAlign = 'right'
  context.fillStyle = palette.dim
  context.fillText(toUpperCase(text.t.share.scenario(seed), text.locale), WIDTH - MARGIN, MARGIN + 14)
  context.letterSpacing = '0px'
  context.textAlign = 'left'

  context.font = `800 72px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.letterSpacing = '-2px'
  context.fillText(toUpperCase(text.t.share.standingsTitle, text.locale), MARGIN, MARGIN + 106)
  context.letterSpacing = '0px'

  context.font = `500 24px ${BODY}`
  context.fillStyle = palette.muted
  context.fillText(
    text.t.share.standingsSubtitle(
      stats.playedCount,
      stats.totalCount,
      stats.totalGoals,
      stats.goalsPerMatch.toFixed(2),
    ),
    MARGIN,
    MARGIN + 148,
  )
}

function drawColumnHeaders(
  context: CanvasRenderingContext2D,
  columns: number[],
  tableTop: number,
  text: ShareText,
) {
  context.font = `600 18px ${DISPLAY}`
  context.fillStyle = palette.dim
  context.letterSpacing = '2px'
  context.textAlign = 'right'
  const labels = text.t.share.columns
  labels.forEach((label, index) => context.fillText(label, columns[index], tableTop - 14))
  context.textAlign = 'left'
  context.letterSpacing = '0px'

  context.strokeStyle = palette.line
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(MARGIN, tableTop - 6)
  context.lineTo(WIDTH - MARGIN, tableTop - 6)
  context.stroke()
}

function drawRow(
  context: CanvasRenderingContext2D,
  row: StandingRow,
  crest: HTMLImageElement,
  y: number,
  rowHeight: number,
  columns: number[],
  isFavourite: boolean,
) {
  const bandTop = rowBandTop(y, rowHeight)

  if (isFavourite) {
    context.fillStyle = 'rgba(127, 216, 245, 0.12)'
    context.fillRect(MARGIN - 8, bandTop, WIDTH - MARGIN * 2 + 16, rowHeight)
  }

  context.fillStyle = ZONE_COLOUR[row.qualification]
  context.fillRect(MARGIN - 8, bandTop, 3, rowHeight)

  context.font = `${isFavourite ? 800 : 600} 19px ${DISPLAY}`
  context.fillStyle = isFavourite ? palette.fg : palette.muted
  context.textAlign = 'right'
  context.fillText(String(row.position), MARGIN + 26, y)
  context.textAlign = 'left'

  drawContainedImage(context, crest, MARGIN + 36, y - CREST_SIZE * 0.78, CREST_SIZE)

  context.font = `${isFavourite ? 700 : 500} 20px ${BODY}`
  context.fillStyle = isFavourite ? palette.fg : palette.muted
  context.fillText(truncateText(context, row.team.name, 240), MARGIN + 68, y)

  context.textAlign = 'right'
  context.font = `500 19px ${BODY}`
  const values = [
    row.played,
    row.wins,
    row.draws,
    row.losses,
    row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference,
  ]
  values.forEach((value, index) => {
    context.fillStyle = isFavourite ? palette.fg : palette.muted
    context.fillText(String(value), columns[index], y)
  })
  context.font = `800 21px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.fillText(String(row.points), columns[5], y)
  context.textAlign = 'left'
}

function drawLegend(context: CanvasRenderingContext2D, text: ShareText, y: number) {
  const entries = [
    { colour: palette.home, label: text.t.share.legendLast16 },
    { colour: palette.away, label: text.t.share.legendPlayOff },
    { colour: palette.dim, label: text.t.share.legendEliminated },
  ]
  let x = MARGIN
  context.font = `500 20px ${BODY}`
  for (const entry of entries) {
    context.fillStyle = entry.colour
    context.fillRect(x, y - 12, 12, 12)
    context.fillStyle = palette.muted
    context.fillText(entry.label, x + 20, y)
    x += context.measureText(entry.label).width + 56
  }

  context.textAlign = 'right'
  context.fillStyle = palette.dim
  context.fillText(text.t.share.footerShort, WIDTH - MARGIN, y)
  context.textAlign = 'left'
}

export async function renderStandingsCard({
  rows,
  stats,
  favouriteTeam,
  seed,
  text,
}: StandingsCardInput): Promise<Blob> {
  const { canvas, context } = createCardCanvas(WIDTH, HEIGHT)

  const crests = await Promise.all(rows.map((row) => loadImage(row.team.logo)))
  await document.fonts.ready

  context.fillStyle = palette.base
  context.fillRect(0, 0, WIDTH, HEIGHT)
  drawStarfield(context, WIDTH, HEIGHT, 20260827)
  await drawNeonStarball(context, WIDTH * 0.34, HEIGHT * 0.52, WIDTH * 0.92, 0.3)

  const columns = [640, 700, 760, 820, 910, WIDTH - MARGIN]
  const layout = tableLayout(rows.length)

  drawHeader(context, stats, seed, text)
  drawColumnHeaders(context, columns, layout.tableTop, text)

  rows.forEach((row, index) => {
    drawRow(
      context,
      row,
      crests[index],
      layout.firstRowY + index * layout.rowHeight,
      layout.rowHeight,
      columns,
      row.team.id === favouriteTeam?.id,
    )
  })

  drawLegend(context, text, layout.legendY)

  return toCardBlob(canvas)
}
