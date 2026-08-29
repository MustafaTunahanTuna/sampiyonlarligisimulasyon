import type { Messages } from '../messages'

export const layout: Messages['layout'] = {
  documentTitle: 'Phase de ligue 2026/27 — Choisissez votre club, suivez chaque match',
  brandName: 'Ligue des champions',
  brandStage: 'Phase de ligue',
  home: 'Accueil',
  teamSelection: 'Choix du club',
  mainNavigation: 'Navigation principale',
  navLeague: 'Ligue',
  navKnockout: 'Élimination',
  navTeam: 'Mon club',
  languageGroup: 'Choix de la langue',
  drawEyebrow: (date, venue) => `${date} · tirage de ${venue}`,
  leaguePhase: 'Phase de ligue',
  drawSummary: (teams, matches) =>
    `${teams} clubs, ${matches} matches. Commencez par choisir le club que vous soutenez, puis pronostiquez les scores ou simulez la saison — le classement et les statistiques de buts sont recalculés instantanément.`,
  footerSourcePrefix: 'Source des données :',
  footerSourceLink: 'centre du tirage uefa.com',
  footerSourceSuffix: (date) =>
    `— récupérées le ${date}. Le classement et les statistiques sont calculés à partir de vos propres pronostics.`,
  footerDisclaimer:
    'Une application non officielle, créée par des supporters. Les écussons appartiennent à leurs clubs respectifs.',
}
