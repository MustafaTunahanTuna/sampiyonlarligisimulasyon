import type { Messages } from '../messages'

export const dashboard: Messages['dashboard'] = {
  yourTeam: 'Tu club',
  points: (points) => `${points} pts`,
  changeTeam: 'Cambiar',
  openPanel: 'Panel',
  pickTeamTitle: 'Elige tu club',
  pickTeamBody:
    'Elige un club y sus ocho partidos, su clasificación y su tarjeta para compartir serán tuyos.',
  pickTeamAction: 'Elegir un club',
  biggestWin: 'Mayor diferencia',
  highestScoring: 'Partido con más goles',
  steps: [
    {
      title: 'Simula la temporada',
      detail:
        'Un modelo basado en la fuerza de los equipos marca los 144 partidos: tú decides cuánta sorpresa quieres.',
    },
    {
      title: 'Escribe tú los resultados',
      detail: 'Introduce cualquier marcador que no te convenza; se conserva al volver a simular.',
    },
    {
      title: 'Comparte la clasificación',
      detail:
        'La tabla de 36 clubes se actualiza al instante: convierte el resultado en una tarjeta para compartir.',
    },
  ],
  statPredicted: 'Pronosticados',
  statPredictedDetail: (total) => `de ${total} partidos`,
  statTotalGoals: 'Goles totales',
  statPerMatch: 'Por partido',
  statPerMatchDetail: 'media de goles',
  statHomeWins: 'Victorias locales',
  statHomeWinsDetail: (draws, awayWins) => `${draws} empates · ${awayWins} victorias visitantes`,
  statCleanSheets: 'Porterías a cero',
  statCleanSheetsDetail: 'partidos con alguna',
  topScorers: 'Mejores ataques',
  bestDefences: 'Mejores defensas',
  overperformers: 'Por encima de lo esperado',
  rankingPlayed: (played) => `${played} partidos`,
  rankingExpected: (position) => `esperado ${position}`,
  topGoalscorers: 'Máximos goleadores',
  topAssistProviders: 'Máximos asistentes',
  playerGoals: (goals: number) => `${goals} goles`,
  playerAssists: (assists: number) => `${assists} asistencias`,
  playerStatsEmpty:
    'Las estadísticas individuales salen solo de los partidos simulados. Los marcadores que introduces a mano no llevan goleador asociado.',
}
