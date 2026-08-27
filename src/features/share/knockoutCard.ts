import {
  SHARE_PALETTE as palette,
  drawContainedImage,
  drawNeonStarball,
  drawStar,
  createCardCanvas,
  drawStarfield,
  loadImage,
  toCardBlob,
  truncateText,
} from './canvasPrimitives'
import {
  CARD_HEIGHT as HEIGHT,
  CARD_MARGIN as MARGIN,
  CARD_WIDTH as WIDTH,
  bracketLayout,
} from './bracketLayout'
import { drawConnector, drawFinalConnector, drawRoundLabel, drawTieBox } from './bracketDrawing'
import type { BracketLayout, BracketSide, Box } from './bracketLayout'
import type { TieVisual } from './bracketDrawing'
import type { KnockoutRoundId } from '../../domain/knockoutFormat'
import type { KnockoutStage } from '../../domain/knockoutStage'
import type { Team } from '../../domain/types'

const DISPLAY = '"Archivo", "Manrope", sans-serif'
const BODY = '"Manrope", sans-serif'
const DEPTH_ROUND: Record<number, KnockoutRoundId> = {
  0: 'ROUND_OF_16',
  1: 'QUARTER_FINAL',
  2: 'SEMI_FINAL',
}

export interface KnockoutCardInput {
  stage: KnockoutStage
  favouriteTeam: Team | null
  seed: string
}

function tieVisual(stage: KnockoutStage, round: KnockoutRoundId, order: number): TieVisual | null {
  const target = stage.rounds.find((entry) => entry.id === round)
  const tie = target?.ties[order - 1]
  if (target === undefined || tie === undefined) return null
  return { tie, outcome: target.outcomes.get(tie.id) }
}

function drawHeader(context: CanvasRenderingContext2D, seed: string, playedRounds: number) {
  drawStar(context, MARGIN + 12, MARGIN + 6, 13, palette.accent)
  context.font = `600 20px ${DISPLAY}`
  context.letterSpacing = '4px'
  context.fillStyle = palette.muted
  context.fillText('ŞAMPİYONLAR LİGİ 2026/27', MARGIN + 38, MARGIN + 13)
  context.textAlign = 'right'
  context.fillStyle = palette.dim
  context.fillText(`SENARYO ${seed}`, WIDTH - MARGIN, MARGIN + 13)
  context.letterSpacing = '0px'
  context.textAlign = 'left'

  context.font = `800 54px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.letterSpacing = '-2px'
  context.fillText('NAKAVT AŞAMASI', MARGIN, MARGIN + 78)
  context.letterSpacing = '0px'

  context.font = `500 20px ${BODY}`
  context.fillStyle = palette.muted
  context.fillText(`${playedRounds} tur oynandı · turnuva ağacı`, MARGIN, MARGIN + 110)
}

function drawPlayOffStrip(
  context: CanvasRenderingContext2D,
  layout: BracketLayout,
  stage: KnockoutStage,
  crests: Map<string, HTMLImageElement>,
  favouriteTeamId: string | null,
) {
  drawRoundLabel(context, 'Play-off turu', MARGIN, layout.playOffLabelY, 'left')
  context.font = `500 14px ${BODY}`
  context.fillStyle = palette.dim
  context.textAlign = 'right'
  context.fillText('kazananlar son 16 turuna yükselir', WIDTH - MARGIN, layout.playOffLabelY)
  context.textAlign = 'left'

  layout.playOff.forEach((box, index) => {
    const visual = tieVisual(stage, 'PLAY_OFF', index + 1)
    if (visual !== null) drawTieBox(context, visual, crests, favouriteTeamId, box, true)
  })
}

function drawTree(
  context: CanvasRenderingContext2D,
  layout: BracketLayout,
  stage: KnockoutStage,
  crests: Map<string, HTMLImageElement>,
  favouriteTeamId: string | null,
) {
  const boxOf = (side: BracketSide, depth: number, tieOrder: number): Box | null =>
    layout.slots.find(
      (slot) => slot.side === side && slot.depth === depth && slot.tieOrder === tieOrder,
    )?.box ?? null

  for (const side of ['left', 'right'] as BracketSide[]) {
    for (const slot of layout.slots.filter((entry) => entry.side === side)) {
      const visual = tieVisual(stage, DEPTH_ROUND[slot.depth], slot.tieOrder)
      if (visual !== null) drawTieBox(context, visual, crests, favouriteTeamId, slot.box)
    }

    const quarterOrders = side === 'left' ? [1, 2] : [3, 4]
    const roundOf16Orders = side === 'left' ? [1, 8, 4, 5] : [3, 6, 2, 7]
    quarterOrders.forEach((quarterOrder, index) => {
      const quarterBox = boxOf(side, 1, quarterOrder)
      if (quarterBox === null) return
      for (const order of roundOf16Orders.slice(index * 2, index * 2 + 2)) {
        const source = boxOf(side, 0, order)
        if (source !== null) drawConnector(context, source, quarterBox, side)
      }
    })

    const semiBox = boxOf(side, 2, side === 'left' ? 1 : 2)
    if (semiBox !== null) {
      for (const quarterOrder of quarterOrders) {
        const source = boxOf(side, 1, quarterOrder)
        if (source !== null) drawConnector(context, source, semiBox, side)
      }
      drawFinalConnector(context, semiBox, layout.final, side)
    }
  }

  const columnLabels: [number, string][] = [
    [0, 'Son 16'],
    [1, 'Çeyrek final'],
    [2, 'Yarı final'],
  ]
  const labelY = layout.treeTop - 18
  for (const [depth, label] of columnLabels) {
    const leftBox = layout.slots.find((slot) => slot.side === 'left' && slot.depth === depth)?.box
    const rightBox = layout.slots.find((slot) => slot.side === 'right' && slot.depth === depth)?.box
    if (leftBox !== undefined) drawRoundLabel(context, label, leftBox.x, labelY, 'left')
    if (rightBox !== undefined) {
      drawRoundLabel(context, label, rightBox.x + rightBox.width, labelY, 'right')
    }
  }
  drawRoundLabel(context, 'Final', layout.final.x + layout.final.width / 2, labelY, 'center')

  const finalVisual = tieVisual(stage, 'FINAL', 1)
  if (finalVisual !== null) {
    context.strokeStyle = palette.accent
    context.lineWidth = 1.5
    context.beginPath()
    context.roundRect(
      layout.final.x - 4,
      layout.final.y - 4,
      layout.final.width + 8,
      layout.final.height + 8,
      11,
    )
    context.stroke()
    drawTieBox(context, finalVisual, crests, favouriteTeamId, layout.final)
  }
}

function drawChampion(
  context: CanvasRenderingContext2D,
  champion: Team,
  crest: HTMLImageElement,
  y: number,
) {
  const width = WIDTH - MARGIN * 2
  context.fillStyle = 'rgba(127, 216, 245, 0.1)'
  context.beginPath()
  context.roundRect(MARGIN, y, width, 96, 12)
  context.fill()
  context.strokeStyle = palette.accent
  context.lineWidth = 1.5
  context.stroke()

  drawContainedImage(context, crest, MARGIN + 22, y + 14, 68)

  context.font = `600 19px ${DISPLAY}`
  context.fillStyle = palette.accent
  context.letterSpacing = '4px'
  context.fillText('ŞAMPİYON', MARGIN + 110, y + 42)
  context.letterSpacing = '0px'

  context.font = `800 42px ${DISPLAY}`
  context.fillStyle = palette.fg
  context.fillText(truncateText(context, champion.name, width - 170), MARGIN + 110, y + 80)
}

function drawFooter(context: CanvasRenderingContext2D, y: number) {
  context.font = `500 19px ${BODY}`
  context.fillStyle = palette.dim
  context.fillText('Kura verisi: uefa.com · Tahmin ve simülasyon', MARGIN, y)
}

export async function renderKnockoutCard({
  stage,
  favouriteTeam,
  seed,
}: KnockoutCardInput): Promise<Blob> {
  const { canvas, context } = createCardCanvas(WIDTH, HEIGHT)

  const teams = new Map<string, Team>()
  for (const round of stage.rounds) {
    for (const tie of round.ties) {
      if (tie.seeded !== null) teams.set(tie.seeded.id, tie.seeded)
      if (tie.challenger !== null) teams.set(tie.challenger.id, tie.challenger)
    }
  }
  const loaded = await Promise.all(
    [...teams.values()].map(async (team) => [team.id, await loadImage(team.logo)] as const),
  )
  const crests = new Map(loaded)
  await document.fonts.ready

  context.fillStyle = palette.base
  context.fillRect(0, 0, WIDTH, HEIGHT)
  drawStarfield(context, WIDTH, HEIGHT, 20260827)
  await drawNeonStarball(context, WIDTH * 0.32, HEIGHT * 0.54, WIDTH * 0.9, 0.22)

  const layout = bracketLayout()
  const favouriteTeamId = favouriteTeam?.id ?? null

  drawHeader(context, seed, stage.rounds.filter((round) => round.isComplete).length)
  drawPlayOffStrip(context, layout, stage, crests, favouriteTeamId)
  drawTree(context, layout, stage, crests, favouriteTeamId)

  if (stage.champion !== null) {
    const championCrest = crests.get(stage.champion.id)
    if (championCrest !== undefined) {
      drawChampion(context, stage.champion, championCrest, layout.championTop)
    }
  }

  drawFooter(context, layout.footerY)

  return toCardBlob(canvas)
}
