import type { KnockoutRoundId } from '../../../domain/knockoutFormat'
import type { TieDecision } from '../../../domain/types'
import type { Messages } from '../messages'

export const knockout: Messages['knockout'] = {
  eyebrow: 'Turni a eliminazione',
  title: 'Fase a eliminazione diretta',
  intro:
    'Le prime 8 vanno direttamente agli ottavi di finale. Dal 9° al 24° posto si disputa il turno di spareggio, dal 25° al 36° si è eliminati. Spareggio, ottavi, quarti e semifinali si giocano in due gare; la finale è in gara unica.',
  lockedTitle: 'Fase a eliminazione diretta bloccata',
  lockedBody: (total, completed) =>
    `Gli accoppiamenti nascono dalla classifica della fase campionato. ${completed} giornate su ${total} sono complete: gioca le restanti per sbloccare gli spareggi.`,
  backToLeague: 'Torna alla fase campionato',
  playRound: (round) => `Gioca ${round.toLocaleLowerCase('it')}`,
  bracketTitle: 'Tabellone',
  bracketSubtitle: 'dagli ottavi alla finale',
  tieCount: (count) => `${count} accoppiamenti`,
  singleLeg: ' · gara unica',
  completed: 'Completato',
  watchTie: 'Guarda il doppio confronto',
  watchSecondLeg: 'Guarda la gara di ritorno →',
  skipToSecondLeg: 'Passa alla gara di ritorno →',
  backToTie: 'Torna al riepilogo del confronto →',
  singleLegLabel: 'Gara unica',
  legLabel: (leg) => `Gara ${leg}`,
  tieResult: (winner, decision) => `${winner} passa il turno ${decision}`,
  championEyebrow: 'Campione',
  roundLabel: {
    PLAY_OFF: 'Turno di spareggio',
    ROUND_OF_16: 'Ottavi di finale',
    QUARTER_FINAL: 'Quarti di finale',
    SEMI_FINAL: 'Semifinali',
    FINAL: 'Finale',
  } as Record<KnockoutRoundId, string>,
  decisionNote: {
    AGGREGATE: 'nel computo totale',
    EXTRA_TIME: 'ai supplementari',
    PENALTIES: 'ai rigori',
  } as Record<TieDecision, string>,
  decisionSuffix: {
    AGGREGATE: '',
    EXTRA_TIME: 'supplementari',
    PENALTIES: 'rigori',
  } as Record<TieDecision, string>,
  tieNote: {
    AGGREGATE: '',
    EXTRA_TIME: 'ai supplementari',
    PENALTIES: 'ai rigori',
  } as Record<TieDecision, string>,
  slotPosition: (position) => `posto ${position}`,
  slotWinner: (round, order) => `vincente ${round}${order}`,
  runSummary: {
    champion: 'Campione',
    advanced: {
      PLAY_OFF: 'Qualificata agli ottavi',
      ROUND_OF_16: 'Qualificata ai quarti',
      QUARTER_FINAL: 'Qualificata alle semifinali',
      SEMI_FINAL: 'Qualificata alla finale',
      FINAL: 'Campione',
    } as Record<KnockoutRoundId, string>,
    eliminated: {
      PLAY_OFF: 'Eliminata nel turno di spareggio',
      ROUND_OF_16: 'Eliminata agli ottavi',
      QUARTER_FINAL: 'Eliminata ai quarti',
      SEMI_FINAL: 'Eliminata in semifinale',
      FINAL: 'Sconfitta in finale',
    } as Record<KnockoutRoundId, string>,
  },
}
