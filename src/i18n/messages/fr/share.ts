import type { Messages } from '../messages'

export const share: Messages['share'] = {
  brand: 'Ligue des champions 2026/27',
  brandWithStage: 'Ligue des champions 2026/27 · Phase de ligue',
  scenario: (seed) => `Scénario ${seed}`,
  knockoutTitle: 'Phase à élimination directe',
  knockoutSubtitle: (rounds) => `${rounds} tours joués · tableau`,
  playOffNote: 'les vainqueurs rejoignent les huitièmes de finale',
  champion: 'Champion',
  footer: 'Données du tirage : uefa.com · Pronostics et simulation',
  footerShort: 'Données du tirage : uefa.com · Pronostics',
  standingsTitle: 'Classement',
  standingsSubtitle: (played, total, goals, perMatch) =>
    `${played}/${total} matches · ${goals} buts · ${perMatch} par match`,
  columns: ['J', 'G', 'N', 'P', 'DIFF', 'PTS'],
  legendLast16: 'Huitièmes',
  legendPlayOff: 'Barrage',
  legendEliminated: 'Éliminé',
  leagueSection: 'Phase de ligue',
  knockoutSection: 'Phase à élimination directe',
  teamMeta: (country, pot) => `${country} · Chapeau ${pot}`,
  positionBadge: (position) => `PLACE ${position}`,
  teamRecord: (points, wins, draws, losses, goalsFor, goalsAgainst) =>
    `${points} pts · ${wins}V ${draws}N ${losses}D · ${goalsFor}-${goalsAgainst}`,
  downloadTeam: 'Télécharger la carte du club',
  downloadKnockout: 'Télécharger la carte du tableau',
  downloadStandings: 'Télécharger le classement',
  preparing: 'Préparation…',
  downloaded: 'Téléchargé',
  failed: 'Création impossible',
  fileKnockout: 'elimination-directe',
  fileStandings: 'classement',
}
