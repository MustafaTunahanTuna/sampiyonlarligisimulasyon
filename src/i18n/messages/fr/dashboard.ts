import type { Messages } from '../messages'

export const dashboard: Messages['dashboard'] = {
  yourTeam: 'Votre club',
  points: (points) => `${points} pts`,
  changeTeam: 'Changer',
  openPanel: 'Panneau',
  pickTeamTitle: 'Choisissez votre club',
  pickTeamBody:
    'Choisissez un club et ses huit matches, son classement et sa carte à partager vous appartiennent.',
  pickTeamAction: 'Choisir un club',
  biggestWin: 'Plus large écart',
  highestScoring: 'Match le plus prolifique',
  steps: [
    {
      title: 'Simulez la saison',
      detail:
        'Un modèle fondé sur la force des équipes fixe les 144 scores — vous réglez la part de surprise.',
    },
    {
      title: 'Écrivez les scores vous-même',
      detail: 'Saisissez tout score qui ne vous convient pas ; il est conservé à la simulation suivante.',
    },
    {
      title: 'Partagez le classement',
      detail:
        'Le tableau des 36 clubs se met à jour instantanément — transformez le résultat en carte à partager.',
    },
  ],
  statPredicted: 'Pronostiqués',
  statPredictedDetail: (total) => `sur ${total} matches`,
  statTotalGoals: 'Buts au total',
  statPerMatch: 'Par match',
  statPerMatchDetail: 'moyenne de buts',
  statHomeWins: 'Victoires à domicile',
  statHomeWinsDetail: (draws, awayWins) => `${draws} nuls · ${awayWins} victoires à l’extérieur`,
  statCleanSheets: 'Clean sheets',
  statCleanSheetsDetail: 'matches concernés',
  topScorers: 'Meilleures attaques',
  bestDefences: 'Meilleures défenses',
  overperformers: 'Au-dessus des attentes',
  rankingPlayed: (played) => `${played} matches`,
  rankingExpected: (position) => `attendu ${position}`,
  topGoalscorers: 'Meilleurs buteurs',
  topAssistProviders: 'Meilleurs passeurs',
  playerGoals: (goals: number) => `${goals} buts`,
  playerAssists: (assists: number) => `${assists} passes décisives`,
  playerStatsEmpty:
    'Les statistiques individuelles proviennent uniquement des matches simulés. Les scores saisis à la main n’ont pas de buteur associé.',
}
