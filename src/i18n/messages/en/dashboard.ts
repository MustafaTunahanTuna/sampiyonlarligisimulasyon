import type { Messages } from '../messages'

export const dashboard: Messages['dashboard'] = {
  yourTeam: 'Your club',
  points: (points) => `${points} pts`,
  changeTeam: 'Change',
  openPanel: 'Panel',
  pickTeamTitle: 'Pick your club',
  pickTeamBody: 'Choose a club and its eight fixtures, its ranking and its shareable card are yours.',
  pickTeamAction: 'Pick a club',
  biggestWin: 'Biggest margin',
  highestScoring: 'Highest scoring',
  steps: [
    {
      title: 'Simulate the season',
      detail: 'A strength-based model scores all 144 fixtures — you set how surprising it gets.',
    },
    {
      title: 'Write the scores yourself',
      detail: 'Type in any score you disagree with; it is kept when you simulate again.',
    },
    {
      title: 'Share the table',
      detail: 'The 36-club table updates instantly — turn the result into a shareable card.',
    },
  ],
  statPredicted: 'Predicted',
  statPredictedDetail: (total) => `of ${total} matches`,
  statTotalGoals: 'Total goals',
  statPerMatch: 'Per match',
  statPerMatchDetail: 'goal average',
  statHomeWins: 'Home wins',
  statHomeWinsDetail: (draws, awayWins) => `${draws} draws · ${awayWins} away wins`,
  statCleanSheets: 'Clean sheets',
  statCleanSheetsDetail: 'matches with one',
  topScorers: 'Top scorers',
  bestDefences: 'Best defences',
  overperformers: 'Overperformers',
  rankingPlayed: (played) => `${played} matches`,
  rankingExpected: (position) => `expected ${position}`,
  topGoalscorers: 'Top scorers',
  topAssistProviders: 'Top assists',
  playerGoals: (goals: number) => `${goals} goals`,
  playerAssists: (assists: number) => `${assists} assists`,
  playerStatsEmpty:
    'Player stats come from simulated matches only. Scores you enter by hand have no scorer attached.',
}
