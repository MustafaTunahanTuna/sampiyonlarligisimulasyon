import type { KnockoutRoundId } from '../../../domain/knockoutFormat'
import type { TieDecision } from '../../../domain/types'
import type { Messages } from '../messages'

export const knockout: Messages['knockout'] = {
  eyebrow: 'Rondas a eliminar',
  title: 'Fase a eliminar',
  intro:
    'Os 8 primeiros seguem diretamente para os oitavos de final. Os lugares 9 a 24 disputam a ronda de play-off e do 25 ao 36 ficam eliminados. Play-off, oitavos, quartos e meias-finais jogam-se a duas mãos; a final é a jogo único.',
  lockedTitle: 'Fase a eliminar bloqueada',
  lockedBody: (total, completed) =>
    `Os confrontos saem da classificação da fase de liga. ${completed} de ${total} jornadas estão concluídas — joga as restantes para desbloquear os confrontos do play-off.`,
  backToLeague: 'Voltar à fase de liga',
  playRound: (round) => `Jogar ${round.toLocaleLowerCase('pt')}`,
  bracketTitle: 'Quadro',
  bracketSubtitle: 'dos oitavos à final',
  tieCount: (count) => `${count} confrontos`,
  singleLeg: ' · jogo único',
  completed: 'Concluído',
  watchTie: 'Ver o confronto',
  watchSecondLeg: 'Ver a segunda mão →',
  skipToSecondLeg: 'Saltar para a segunda mão →',
  backToTie: 'Voltar ao resumo do confronto →',
  singleLegLabel: 'Jogo único',
  legLabel: (leg) => `Mão ${leg}`,
  tieResult: (winner, decision) => `${winner} seguiu em frente ${decision}`,
  championEyebrow: 'Campeão',
  roundLabel: {
    PLAY_OFF: 'Ronda de play-off',
    ROUND_OF_16: 'Oitavos de final',
    QUARTER_FINAL: 'Quartos de final',
    SEMI_FINAL: 'Meias-finais',
    FINAL: 'Final',
  } as Record<KnockoutRoundId, string>,
  decisionNote: {
    AGGREGATE: 'no resultado agregado',
    EXTRA_TIME: 'no prolongamento',
    PENALTIES: 'nos penáltis',
  } as Record<TieDecision, string>,
  decisionSuffix: {
    AGGREGATE: '',
    EXTRA_TIME: 'prolongamento',
    PENALTIES: 'penáltis',
  } as Record<TieDecision, string>,
  tieNote: {
    AGGREGATE: '',
    EXTRA_TIME: 'no prolongamento',
    PENALTIES: 'nos penáltis',
  } as Record<TieDecision, string>,
  slotPosition: (position) => `lugar ${position}`,
  slotWinner: (round, order) => `vencedor ${round}${order}`,
  runSummary: {
    champion: 'Campeão',
    advanced: {
      PLAY_OFF: 'Apurado para os oitavos',
      ROUND_OF_16: 'Apurado para os quartos',
      QUARTER_FINAL: 'Apurado para as meias-finais',
      SEMI_FINAL: 'Apurado para a final',
      FINAL: 'Campeão',
    } as Record<KnockoutRoundId, string>,
    eliminated: {
      PLAY_OFF: 'Eliminado na ronda de play-off',
      ROUND_OF_16: 'Eliminado nos oitavos',
      QUARTER_FINAL: 'Eliminado nos quartos',
      SEMI_FINAL: 'Eliminado nas meias-finais',
      FINAL: 'Derrotado na final',
    } as Record<KnockoutRoundId, string>,
  },
}
