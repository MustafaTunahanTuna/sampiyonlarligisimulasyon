import type { Messages } from '../messages'

export const standings: Messages['standings'] = {
  title: 'Clasificación',
  empty:
    'La clasificación se construye con tus pronósticos. Empieza introduciendo marcadores o simulando la temporada: los 36 clubes se ordenan al instante.',
  qualificationZone: {
    LAST_16: 'Directo a octavos',
    PLAY_OFF: 'Ronda de play-off',
    ELIMINATED: 'Eliminado',
  },
  qualificationOutcome: {
    LAST_16: 'Clasificado para octavos',
    PLAY_OFF: 'A la ronda de play-off',
    ELIMINATED: 'Eliminado en la fase de liga',
  },
  columnPosition: '#',
  columnTeam: 'Club',
  columnPlayed: 'PJ',
  columnWins: 'G',
  columnDraws: 'E',
  columnLosses: 'P',
  columnGoals: 'Goles',
  columnGoalDifference: 'DG',
  columnPoints: 'Pts',
  openTeam: (team) => `Ver los partidos de ${team}`,
  position: (position) => `${position}.º puesto`,
  pointsSuffix: (points) => `${points} pts`,
  homeVenue: 'Local',
  awayVenue: 'Visitante',
}
