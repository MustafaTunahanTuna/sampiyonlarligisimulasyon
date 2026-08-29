import type { Messages } from '../messages'

export const standings: Messages['standings'] = {
  title: 'Classement',
  empty:
    'Le classement se construit à partir de vos pronostics. Commencez par saisir des scores ou simuler la saison — les 36 clubs sont classés instantanément.',
  qualificationZone: {
    LAST_16: 'Directement en huitièmes',
    PLAY_OFF: 'Tour de barrage',
    ELIMINATED: 'Éliminé',
  },
  qualificationOutcome: {
    LAST_16: 'Qualifié pour les huitièmes',
    PLAY_OFF: 'Renvoyé au tour de barrage',
    ELIMINATED: 'Éliminé en phase de ligue',
  },
  columnPosition: '#',
  columnTeam: 'Club',
  columnPlayed: 'J',
  columnWins: 'G',
  columnDraws: 'N',
  columnLosses: 'P',
  columnGoals: 'Buts',
  columnGoalDifference: 'Diff',
  columnPoints: 'Pts',
  openTeam: (team) => `Voir les matches de ${team}`,
  position: (position) => (position === 1 ? '1re place' : `${position}e place`),
  pointsSuffix: (points) => `${points} pts`,
  homeVenue: 'Domicile',
  awayVenue: 'Extérieur',
}
