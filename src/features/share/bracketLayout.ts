export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 1350
export const CARD_MARGIN = 48

const PLAY_OFF_TOP = 214
const PLAY_OFF_ROW_HEIGHT = 62
const PLAY_OFF_COLUMNS = 4
const PLAY_OFF_GAP = 12
const TREE_TOP = 428
const TIE_HEIGHT = 84
const TIE_GAP = 28
const COLUMN_GAP = 10
const CHAMPION_HEIGHT = 104
const FOOTER_RESERVE = 64

export const LEFT_ROUND_OF_16_ORDER = [1, 8, 4, 5]
export const RIGHT_ROUND_OF_16_ORDER = [3, 6, 2, 7]

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export type BracketSide = 'left' | 'right'

export interface BracketSlot {
  box: Box
  side: BracketSide
  depth: number
  tieOrder: number
}

export interface BracketLayout {
  playOff: Box[]
  playOffLabelY: number
  slots: BracketSlot[]
  final: Box
  championTop: number
  footerY: number
  columnWidth: number
  treeTop: number
}

function columnWidthFor(): number {
  const usable = CARD_WIDTH - CARD_MARGIN * 2
  return (usable - COLUMN_GAP * 6) / 7
}

function columnX(depth: number, side: BracketSide, columnWidth: number): number {
  const step = columnWidth + COLUMN_GAP
  return side === 'left'
    ? CARD_MARGIN + depth * step
    : CARD_WIDTH - CARD_MARGIN - columnWidth - depth * step
}

function stackY(depth: number, index: number): number {
  const span = TIE_HEIGHT + TIE_GAP
  const groupSize = 2 ** depth
  const first = TREE_TOP + index * groupSize * span
  return first + ((groupSize - 1) * span) / 2
}

export function bracketLayout(): BracketLayout {
  const columnWidth = columnWidthFor()
  const playOffWidth = (CARD_WIDTH - CARD_MARGIN * 2 - PLAY_OFF_GAP * (PLAY_OFF_COLUMNS - 1)) / PLAY_OFF_COLUMNS

  const playOff = Array.from({ length: 8 }, (_, index) => ({
    x: CARD_MARGIN + (index % PLAY_OFF_COLUMNS) * (playOffWidth + PLAY_OFF_GAP),
    y: PLAY_OFF_TOP + Math.floor(index / PLAY_OFF_COLUMNS) * (PLAY_OFF_ROW_HEIGHT + PLAY_OFF_GAP),
    width: playOffWidth,
    height: PLAY_OFF_ROW_HEIGHT,
  }))

  const slots: BracketSlot[] = []
  for (const side of ['left', 'right'] as BracketSide[]) {
    const roundOf16Order = side === 'left' ? LEFT_ROUND_OF_16_ORDER : RIGHT_ROUND_OF_16_ORDER
    roundOf16Order.forEach((tieOrder, index) => {
      slots.push({
        box: { x: columnX(0, side, columnWidth), y: stackY(0, index), width: columnWidth, height: TIE_HEIGHT },
        side,
        depth: 0,
        tieOrder,
      })
    })

    const quarterOrders = side === 'left' ? [1, 2] : [3, 4]
    quarterOrders.forEach((tieOrder, index) => {
      slots.push({
        box: { x: columnX(1, side, columnWidth), y: stackY(1, index), width: columnWidth, height: TIE_HEIGHT },
        side,
        depth: 1,
        tieOrder,
      })
    })

    slots.push({
      box: { x: columnX(2, side, columnWidth), y: stackY(2, 0), width: columnWidth, height: TIE_HEIGHT },
      side,
      depth: 2,
      tieOrder: side === 'left' ? 1 : 2,
    })
  }

  const finalWidth = columnWidth + 40
  const final = {
    x: (CARD_WIDTH - finalWidth) / 2,
    y: stackY(2, 0) + TIE_HEIGHT + 44,
    width: finalWidth,
    height: TIE_HEIGHT + 12,
  }

  const treeBottom = stackY(0, 3) + TIE_HEIGHT
  const championTop = Math.max(treeBottom, final.y + final.height) + 34

  return {
    playOff,
    playOffLabelY: PLAY_OFF_TOP - 16,
    slots,
    final,
    championTop,
    footerY: CARD_HEIGHT - CARD_MARGIN,
    columnWidth,
    treeTop: TREE_TOP,
  }
}

export function contentBottom(layout: BracketLayout): number {
  return layout.championTop + CHAMPION_HEIGHT
}

export function fitsCard(layout: BracketLayout): boolean {
  return contentBottom(layout) < CARD_HEIGHT - CARD_MARGIN - FOOTER_RESERVE
}
