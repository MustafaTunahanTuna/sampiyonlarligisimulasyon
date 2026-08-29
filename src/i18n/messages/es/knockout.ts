import type { KnockoutRoundId } from '../../../domain/knockoutFormat'
import type { TieDecision } from '../../../domain/types'
import type { Messages } from '../messages'

export const knockout: Messages['knockout'] = {
  eyebrow: 'Rondas eliminatorias',
  title: 'Fase eliminatoria',
  intro:
    'Los 8 primeros pasan directamente a octavos de final. Los puestos 9 a 24 juegan la ronda de play-off y del 25 al 36 quedan eliminados. Play-off, octavos, cuartos y semifinales se juegan a doble partido; la final es a partido único.',
  lockedTitle: 'Fase eliminatoria bloqueada',
  lockedBody: (total, completed) =>
    `Los cruces salen de la clasificación de la fase de liga. ${completed} de ${total} jornadas están completas: juega las restantes para desbloquear los cruces del play-off.`,
  backToLeague: 'Volver a la fase de liga',
  playRound: (round) => `Jugar ${round.toLocaleLowerCase('es')}`,
  bracketTitle: 'Cuadro',
  bracketSubtitle: 'de octavos a la final',
  tieCount: (count) => `${count} cruces`,
  singleLeg: ' · partido único',
  completed: 'Completado',
  watchTie: 'Ver el cruce',
  watchSecondLeg: 'Ver el partido de vuelta →',
  skipToSecondLeg: 'Saltar al partido de vuelta →',
  backToTie: 'Volver al resumen del cruce →',
  singleLegLabel: 'Partido único',
  legLabel: (leg) => `Partido ${leg}`,
  tieResult: (winner, decision) => `${winner} pasa ${decision}`,
  championEyebrow: 'Campeón',
  roundLabel: {
    PLAY_OFF: 'Ronda de play-off',
    ROUND_OF_16: 'Octavos de final',
    QUARTER_FINAL: 'Cuartos de final',
    SEMI_FINAL: 'Semifinales',
    FINAL: 'Final',
  } as Record<KnockoutRoundId, string>,
  decisionNote: {
    AGGREGATE: 'en el global',
    EXTRA_TIME: 'en la prórroga',
    PENALTIES: 'en los penaltis',
  } as Record<TieDecision, string>,
  decisionSuffix: {
    AGGREGATE: '',
    EXTRA_TIME: 'prórroga',
    PENALTIES: 'penaltis',
  } as Record<TieDecision, string>,
  tieNote: {
    AGGREGATE: '',
    EXTRA_TIME: 'en la prórroga',
    PENALTIES: 'en los penaltis',
  } as Record<TieDecision, string>,
  slotPosition: (position) => `puesto ${position}`,
  slotWinner: (round, order) => `ganador ${round}${order}`,
  runSummary: {
    champion: 'Campeón',
    advanced: {
      PLAY_OFF: 'Clasificado para octavos',
      ROUND_OF_16: 'Clasificado para cuartos',
      QUARTER_FINAL: 'Clasificado para semifinales',
      SEMI_FINAL: 'Clasificado para la final',
      FINAL: 'Campeón',
    } as Record<KnockoutRoundId, string>,
    eliminated: {
      PLAY_OFF: 'Eliminado en el play-off',
      ROUND_OF_16: 'Eliminado en octavos',
      QUARTER_FINAL: 'Eliminado en cuartos',
      SEMI_FINAL: 'Eliminado en semifinales',
      FINAL: 'Derrotado en la final',
    } as Record<KnockoutRoundId, string>,
  },
}
