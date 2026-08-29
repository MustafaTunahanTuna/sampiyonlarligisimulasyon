import type { Messages } from '../messages'

export const fixtures: Messages['fixtures'] = {
  title: 'Calendrier',
  homeCount: (count) => `${count} à domicile`,
  awayCount: (count) => `${count} à l’extérieur`,
  hint: 'Saisissez les scores vous-même ou remplissez-les par simulation. Les scores saisis restent',
  hintHighlight: ' en surbrillance',
  hintSuffix: ' et sont conservés à la simulation suivante.',
  opponentMeta: (country, pot) => `${country} · chapeau ${pot}`,
  goalsOf: (team) => `Buts de ${team}`,
  venue: { HOME: 'Domicile', AWAY: 'Extérieur' },
  outcome: { WIN: 'Victoire', DRAW: 'Nul', LOSS: 'Défaite' },
  outcomeShort: { WIN: 'V', DRAW: 'N', LOSS: 'D' },
}
