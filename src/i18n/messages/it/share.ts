import type { Messages } from '../messages'

export const share: Messages['share'] = {
  brand: 'Champions League 2026/27',
  brandWithStage: 'Champions League 2026/27 · Fase campionato',
  scenario: (seed) => `Scenario ${seed}`,
  knockoutTitle: 'Fase a eliminazione diretta',
  knockoutSubtitle: (rounds) => `${rounds} turni giocati · tabellone`,
  playOffNote: 'le vincenti approdano agli ottavi di finale',
  champion: 'Campione',
  footer: 'Dati del sorteggio: uefa.com · Pronostici e simulazione',
  footerShort: 'Dati del sorteggio: uefa.com · Pronostici',
  standingsTitle: 'Classifica',
  standingsSubtitle: (played, total, goals, perMatch) =>
    `${played}/${total} partite · ${goals} gol · ${perMatch} a partita`,
  columns: ['G', 'V', 'N', 'P', 'DR', 'PT'],
  legendLast16: 'Ottavi',
  legendPlayOff: 'Spareggio',
  legendEliminated: 'Eliminata',
  leagueSection: 'Fase campionato',
  knockoutSection: 'Fase a eliminazione diretta',
  teamMeta: (country, pot) => `${country} · Fascia ${pot}`,
  positionBadge: (position) => `POSTO ${position}`,
  teamRecord: (points, wins, draws, losses, goalsFor, goalsAgainst) =>
    `${points} pt · ${wins}V ${draws}N ${losses}P · ${goalsFor}-${goalsAgainst}`,
  downloadTeam: 'Scarica la card del club',
  downloadKnockout: 'Scarica la card del tabellone',
  downloadStandings: 'Scarica la classifica',
  preparing: 'Preparazione…',
  downloaded: 'Scaricata',
  failed: 'Creazione non riuscita',
  fileKnockout: 'eliminazione-diretta',
  fileStandings: 'classifica',
}
