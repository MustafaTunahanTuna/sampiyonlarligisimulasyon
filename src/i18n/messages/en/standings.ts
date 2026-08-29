import type { Messages } from '../messages'

export const standings: Messages['standings'] = {
  title: 'Standings',
  empty:
    'The table is built from your predictions. Start by entering scores or simulating the season — all 36 clubs are ranked instantly.',
  qualificationZone: {
    LAST_16: 'Straight to the round of 16',
    PLAY_OFF: 'Play-off round',
    ELIMINATED: 'Eliminated',
  },
  qualificationOutcome: {
    LAST_16: 'Reached the round of 16',
    PLAY_OFF: 'Into the play-off round',
    ELIMINATED: 'Out in the league phase',
  },
  columnPosition: '#',
  columnTeam: 'Club',
  columnPlayed: 'P',
  columnWins: 'W',
  columnDraws: 'D',
  columnLosses: 'L',
  columnGoals: 'Goals',
  columnGoalDifference: 'GD',
  columnPoints: 'Pts',
  openTeam: (team) => `See ${team} fixtures`,
  position: (position) => `${position}${ordinalSuffix(position)} place`,
  pointsSuffix: (points) => `${points} pts`,
  homeVenue: 'Home',
  awayVenue: 'Away',
}

function ordinalSuffix(position: number): string {
  const lastTwo = position % 100
  if (lastTwo >= 11 && lastTwo <= 13) return 'th'
  switch (position % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
