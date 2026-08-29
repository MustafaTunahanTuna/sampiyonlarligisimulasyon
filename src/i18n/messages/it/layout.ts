import type { Messages } from '../messages'

export const layout: Messages['layout'] = {
  documentTitle: 'Fase campionato 2026/27 — Scegli il tuo club, segui ogni partita',
  brandName: 'Champions League',
  brandStage: 'Fase campionato',
  home: 'Home',
  teamSelection: 'Scelta del club',
  mainNavigation: 'Navigazione principale',
  navLeague: 'Campionato',
  navKnockout: 'Eliminazione',
  navTeam: 'Il mio club',
  languageGroup: 'Selezione della lingua',
  drawEyebrow: (date, venue) => `${date} · sorteggio di ${venue}`,
  leaguePhase: 'Fase campionato',
  drawSummary: (teams, matches) =>
    `${teams} club, ${matches} partite. Inizia scegliendo il club che tifi, poi pronostica i risultati o simula la stagione: classifica e statistiche sui gol vengono ricalcolate all’istante.`,
  footerSourcePrefix: 'Fonte dei dati:',
  footerSourceLink: 'centro sorteggi di uefa.com',
  footerSourceSuffix: (date) =>
    `— raccolti il ${date}. La classifica e le statistiche sono calcolate a partire dai tuoi pronostici.`,
  footerDisclaimer:
    'Un’app non ufficiale, creata dai tifosi. Gli stemmi appartengono ai rispettivi club.',
}
