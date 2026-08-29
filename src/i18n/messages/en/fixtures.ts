import type { Messages } from '../messages'

export const fixtures: Messages['fixtures'] = {
  title: 'Fixtures',
  homeCount: (count) => `${count} home`,
  awayCount: (count) => `${count} away`,
  hint: 'Enter the scores yourself or fill them by simulating. Scores you typed stay',
  hintHighlight: ' highlighted',
  hintSuffix: ' and are kept when you simulate again.',
  opponentMeta: (country, pot) => `${country} · pot ${pot}`,
  goalsOf: (team) => `${team} goals`,
  venue: { HOME: 'Home', AWAY: 'Away' },
  outcome: { WIN: 'Win', DRAW: 'Draw', LOSS: 'Loss' },
  outcomeShort: { WIN: 'W', DRAW: 'D', LOSS: 'L' },
}
