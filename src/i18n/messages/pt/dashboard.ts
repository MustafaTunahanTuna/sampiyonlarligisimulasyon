import type { Messages } from '../messages'

export const dashboard: Messages['dashboard'] = {
  yourTeam: 'O teu clube',
  points: (points) => `${points} pts`,
  changeTeam: 'Mudar',
  openPanel: 'Painel',
  pickTeamTitle: 'Escolhe o teu clube',
  pickTeamBody:
    'Escolhe um clube e os seus oito jogos, a sua classificação e o seu cartão para partilhar passam a ser teus.',
  pickTeamAction: 'Escolher um clube',
  biggestWin: 'Maior diferença',
  highestScoring: 'Jogo com mais golos',
  steps: [
    {
      title: 'Simula a época',
      detail:
        'Um modelo baseado na força das equipas marca os 144 jogos — és tu que defines o grau de surpresa.',
    },
    {
      title: 'Escreve tu os resultados',
      detail: 'Introduz qualquer resultado de que discordes; fica guardado quando voltares a simular.',
    },
    {
      title: 'Partilha a classificação',
      detail:
        'A tabela dos 36 clubes atualiza-se de imediato — transforma o resultado num cartão para partilhar.',
    },
  ],
  statPredicted: 'Previstos',
  statPredictedDetail: (total) => `de ${total} jogos`,
  statTotalGoals: 'Golos no total',
  statPerMatch: 'Por jogo',
  statPerMatchDetail: 'média de golos',
  statHomeWins: 'Vitórias em casa',
  statHomeWinsDetail: (draws, awayWins) => `${draws} empates · ${awayWins} vitórias fora`,
  statCleanSheets: 'Jogos sem sofrer',
  statCleanSheetsDetail: 'jogos com pelo menos um',
  topScorers: 'Melhores ataques',
  bestDefences: 'Melhores defesas',
  overperformers: 'Acima do esperado',
  rankingPlayed: (played) => `${played} jogos`,
  rankingExpected: (position) => `esperado ${position}`,
  topGoalscorers: 'Melhores marcadores',
  topAssistProviders: 'Melhores assistências',
  playerGoals: (goals: number) => `${goals} golos`,
  playerAssists: (assists: number) => `${assists} assistências`,
  playerStatsEmpty:
    'As estatísticas individuais vêm apenas dos jogos simulados. Os resultados que introduzes à mão não têm marcador associado.',
}
