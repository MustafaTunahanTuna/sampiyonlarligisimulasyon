export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 1350
export const CARD_MARGIN = 56

const TABLE_TOP = 252
const FIRST_ROW_OFFSET = 20
const LEGEND_RESERVE = 74
const BASELINE_RATIO = 0.7

export interface TableLayout {
  tableTop: number
  firstRowY: number
  rowHeight: number
  lastRowBottom: number
  legendY: number
  legendTop: number
  hasOverlap: boolean
}

export function tableLayout(rowCount: number): TableLayout {
  const firstRowY = TABLE_TOP + FIRST_ROW_OFFSET
  const available = CARD_HEIGHT - CARD_MARGIN - LEGEND_RESERVE - firstRowY
  const rowHeight = available / Math.max(rowCount, 1)
  const lastRowBottom = firstRowY + (rowCount - 1) * rowHeight + rowHeight * (1 - BASELINE_RATIO)
  const legendY = CARD_HEIGHT - CARD_MARGIN
  const legendTop = legendY - 12

  return {
    tableTop: TABLE_TOP,
    firstRowY,
    rowHeight,
    lastRowBottom,
    legendY,
    legendTop,
    hasOverlap: lastRowBottom > legendTop,
  }
}

export function rowBandTop(baselineY: number, rowHeight: number): number {
  return baselineY - rowHeight * BASELINE_RATIO
}
