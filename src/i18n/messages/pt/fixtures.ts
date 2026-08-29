import type { Messages } from '../messages'

export const fixtures: Messages['fixtures'] = {
  title: 'Calendário',
  homeCount: (count) => `${count} em casa`,
  awayCount: (count) => `${count} fora`,
  hint: 'Introduz tu os resultados ou preenche-os simulando. Os resultados que escreveres ficam',
  hintHighlight: ' destacados',
  hintSuffix: ' e são mantidos quando voltares a simular.',
  opponentMeta: (country, pot) => `${country} · pote ${pot}`,
  goalsOf: (team) => `Golos do ${team}`,
  venue: { HOME: 'Casa', AWAY: 'Fora' },
  outcome: { WIN: 'Vitória', DRAW: 'Empate', LOSS: 'Derrota' },
  outcomeShort: { WIN: 'V', DRAW: 'E', LOSS: 'D' },
}
