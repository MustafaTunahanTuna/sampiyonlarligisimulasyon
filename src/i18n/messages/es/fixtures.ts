import type { Messages } from '../messages'

export const fixtures: Messages['fixtures'] = {
  title: 'Calendario',
  homeCount: (count) => `${count} en casa`,
  awayCount: (count) => `${count} fuera`,
  hint: 'Introduce tú los marcadores o rellénalos simulando. Los marcadores que escribas quedan',
  hintHighlight: ' resaltados',
  hintSuffix: ' y se conservan al volver a simular.',
  opponentMeta: (country, pot) => `${country} · bombo ${pot}`,
  goalsOf: (team) => `Goles de ${team}`,
  venue: { HOME: 'Local', AWAY: 'Visitante' },
  outcome: { WIN: 'Victoria', DRAW: 'Empate', LOSS: 'Derrota' },
  outcomeShort: { WIN: 'V', DRAW: 'E', LOSS: 'D' },
}
