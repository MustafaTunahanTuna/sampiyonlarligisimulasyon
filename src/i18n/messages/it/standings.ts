import type { Messages } from '../messages'

export const standings: Messages['standings'] = {
  title: 'Classifica',
  empty:
    'La classifica si costruisce dai tuoi pronostici. Inizia inserendo i risultati o simulando la stagione: tutti i 36 club vengono ordinati all’istante.',
  qualificationZone: {
    LAST_16: 'Direttamente agli ottavi',
    PLAY_OFF: 'Turno di spareggio',
    ELIMINATED: 'Eliminata',
  },
  qualificationOutcome: {
    LAST_16: 'Qualificata agli ottavi',
    PLAY_OFF: 'Al turno di spareggio',
    ELIMINATED: 'Eliminata nella fase campionato',
  },
  columnPosition: '#',
  columnTeam: 'Club',
  columnPlayed: 'G',
  columnWins: 'V',
  columnDraws: 'N',
  columnLosses: 'P',
  columnGoals: 'Gol',
  columnGoalDifference: 'DR',
  columnPoints: 'Pt',
  openTeam: (team) => `Vedi le partite del ${team}`,
  position: (position) => `${position}° posto`,
  pointsSuffix: (points) => `${points} pt`,
  homeVenue: 'Casa',
  awayVenue: 'Trasferta',
}
