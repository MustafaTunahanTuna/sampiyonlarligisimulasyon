export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 1350
export const CARD_MARGIN = 72

const CONTENT_TOP = 424
const FOOTER_RESERVE = 96
const SECTION_HEADING_HEIGHT = 42
const MIN_ROW_HEIGHT = 46
const MAX_ROW_HEIGHT = 96

export interface CardLayout {
  contentTop: number
  rowHeight: number
  fixturesTop: number
  knockoutTop: number | null
  footerY: number
}

export function teamCardLayout(fixtureCount: number, knockoutCount: number): CardLayout {
  const sectionCount = knockoutCount > 0 ? 2 : 1
  const available =
    CARD_HEIGHT - CARD_MARGIN - FOOTER_RESERVE - CONTENT_TOP - SECTION_HEADING_HEIGHT * sectionCount
  const rowCount = fixtureCount + knockoutCount
  const rowHeight = Math.min(
    MAX_ROW_HEIGHT,
    Math.max(MIN_ROW_HEIGHT, available / Math.max(rowCount, 1)),
  )
  const fixturesTop = CONTENT_TOP + SECTION_HEADING_HEIGHT

  return {
    contentTop: CONTENT_TOP,
    rowHeight,
    fixturesTop,
    knockoutTop:
      knockoutCount > 0
        ? fixturesTop + fixtureCount * rowHeight + SECTION_HEADING_HEIGHT
        : null,
    footerY: CARD_HEIGHT - CARD_MARGIN,
  }
}

export function cardContentBottom(layout: CardLayout, knockoutCount: number): number {
  return layout.knockoutTop === null
    ? layout.fixturesTop
    : layout.knockoutTop + knockoutCount * layout.rowHeight
}
