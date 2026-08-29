import type { Messages } from '../messages'

export const layout: Messages['layout'] = {
  documentTitle: 'League Phase 2026/27 — Pick your club, follow every fixture',
  brandName: 'Champions League',
  brandStage: 'League phase',
  home: 'Home',
  teamSelection: 'Team selection',
  mainNavigation: 'Main navigation',
  navLeague: 'League',
  navKnockout: 'Knockout',
  navTeam: 'My team',
  languageGroup: 'Language selection',
  drawEyebrow: (date, venue) => `${date} · ${venue} draw`,
  leaguePhase: 'League phase',
  drawSummary: (teams, matches) =>
    `${teams} clubs, ${matches} fixtures. Start by picking the club you support, then predict the scores or simulate the season — the table and goal stats are recalculated instantly.`,
  footerSourcePrefix: 'Data source:',
  footerSourceLink: 'uefa.com draw centre',
  footerSourceSuffix: (date) =>
    `— scraped on ${date}. The table and statistics are calculated from your own predictions.`,
  footerDisclaimer:
    'An unofficial, fan-made app. Club crests belong to their respective clubs.',
}
