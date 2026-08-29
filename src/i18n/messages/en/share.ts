import type { Messages } from '../messages'

export const share: Messages['share'] = {
  brand: 'Champions League 2026/27',
  brandWithStage: 'Champions League 2026/27 · League phase',
  scenario: (seed) => `Scenario ${seed}`,
  knockoutTitle: 'Knockout stage',
  knockoutSubtitle: (rounds) => `${rounds} rounds played · bracket`,
  playOffNote: 'winners advance to the round of 16',
  champion: 'Champion',
  footer: 'Draw data: uefa.com · Predictions and simulation',
  footerShort: 'Draw data: uefa.com · Predictions',
  standingsTitle: 'Standings',
  standingsSubtitle: (played, total, goals, perMatch) =>
    `${played}/${total} matches · ${goals} goals · ${perMatch} per match`,
  columns: ['P', 'W', 'D', 'L', 'GD', 'PTS'],
  legendLast16: 'Round of 16',
  legendPlayOff: 'Play-off',
  legendEliminated: 'Eliminated',
  leagueSection: 'League phase',
  knockoutSection: 'Knockout stage',
  teamMeta: (country, pot) => `${country} · Pot ${pot}`,
  positionBadge: (position) => `PLACE ${position}`,
  teamRecord: (points, wins, draws, losses, goalsFor, goalsAgainst) =>
    `${points} pts · ${wins}W ${draws}D ${losses}L · ${goalsFor}-${goalsAgainst}`,
  downloadTeam: 'Download the club card',
  downloadKnockout: 'Download the knockout card',
  downloadStandings: 'Download the table',
  preparing: 'Preparing…',
  downloaded: 'Downloaded',
  failed: 'Could not be created',
  fileKnockout: 'knockout',
  fileStandings: 'standings',
}
