import type { Messages } from '../messages'

export const fixtures: Messages['fixtures'] = {
  title: 'Calendario',
  homeCount: (count) => `${count} in casa`,
  awayCount: (count) => `${count} in trasferta`,
  hint: 'Inserisci tu i risultati oppure riempili simulando. I risultati che digiti restano',
  hintHighlight: ' evidenziati',
  hintSuffix: ' e vengono mantenuti quando simuli di nuovo.',
  opponentMeta: (country, pot) => `${country} · fascia ${pot}`,
  goalsOf: (team) => `Gol del ${team}`,
  venue: { HOME: 'Casa', AWAY: 'Trasferta' },
  outcome: { WIN: 'Vittoria', DRAW: 'Pareggio', LOSS: 'Sconfitta' },
  outcomeShort: { WIN: 'V', DRAW: 'N', LOSS: 'P' },
}
