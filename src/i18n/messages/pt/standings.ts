import type { Messages } from '../messages'

export const standings: Messages['standings'] = {
  title: 'Classificação',
  empty:
    'A classificação é construída a partir das tuas previsões. Começa por introduzir resultados ou simular a época — os 36 clubes são ordenados de imediato.',
  qualificationZone: {
    LAST_16: 'Direto aos oitavos',
    PLAY_OFF: 'Ronda de play-off',
    ELIMINATED: 'Eliminado',
  },
  qualificationOutcome: {
    LAST_16: 'Apurado para os oitavos',
    PLAY_OFF: 'Para a ronda de play-off',
    ELIMINATED: 'Eliminado na fase de liga',
  },
  columnPosition: '#',
  columnTeam: 'Clube',
  columnPlayed: 'J',
  columnWins: 'V',
  columnDraws: 'E',
  columnLosses: 'D',
  columnGoals: 'Golos',
  columnGoalDifference: 'DG',
  columnPoints: 'Pts',
  openTeam: (team) => `Ver os jogos do ${team}`,
  position: (position) => `${position}.º lugar`,
  pointsSuffix: (points) => `${points} pts`,
  homeVenue: 'Casa',
  awayVenue: 'Fora',
}
