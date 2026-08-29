import type { Messages } from '../messages'

export const dashboard: Messages['dashboard'] = {
  yourTeam: 'Il tuo club',
  points: (points) => `${points} pt`,
  changeTeam: 'Cambia',
  openPanel: 'Pannello',
  pickTeamTitle: 'Scegli il tuo club',
  pickTeamBody:
    'Scegli un club e le sue otto partite, la sua classifica e la sua card da condividere diventano tue.',
  pickTeamAction: 'Scegli un club',
  biggestWin: 'Scarto più ampio',
  highestScoring: 'Partita più prolifica',
  steps: [
    {
      title: 'Simula la stagione',
      detail:
        'Un modello basato sulla forza delle squadre assegna i risultati di tutte le 144 partite: sei tu a decidere quanta sorpresa.',
    },
    {
      title: 'Scrivi tu i risultati',
      detail: 'Inserisci qualsiasi risultato non ti convinca; resta salvato quando simuli di nuovo.',
    },
    {
      title: 'Condividi la classifica',
      detail:
        'La classifica dei 36 club si aggiorna all’istante: trasforma il risultato in una card da condividere.',
    },
  ],
  statPredicted: 'Pronosticate',
  statPredictedDetail: (total) => `su ${total} partite`,
  statTotalGoals: 'Gol totali',
  statPerMatch: 'Per partita',
  statPerMatchDetail: 'media gol',
  statHomeWins: 'Vittorie in casa',
  statHomeWinsDetail: (draws, awayWins) => `${draws} pareggi · ${awayWins} vittorie in trasferta`,
  statCleanSheets: 'Porte inviolate',
  statCleanSheetsDetail: 'partite con almeno una',
  topScorers: 'Migliori attacchi',
  bestDefences: 'Migliori difese',
  overperformers: 'Oltre le attese',
  rankingPlayed: (played) => `${played} partite`,
  rankingExpected: (position) => `atteso ${position}`,
  topGoalscorers: 'Migliori marcatori',
  topAssistProviders: 'Migliori assistman',
  playerGoals: (goals: number) => `${goals} gol`,
  playerAssists: (assists: number) => `${assists} assist`,
  playerStatsEmpty:
    'Le statistiche individuali arrivano solo dalle partite simulate. I risultati inseriti a mano non hanno un marcatore associato.',
}
