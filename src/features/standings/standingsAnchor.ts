export const STANDINGS_ANCHOR_ID = 'puan-tablosu'

export function scrollToStandings() {
  requestAnimationFrame(() => {
    document
      .getElementById(STANDINGS_ANCHOR_ID)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
