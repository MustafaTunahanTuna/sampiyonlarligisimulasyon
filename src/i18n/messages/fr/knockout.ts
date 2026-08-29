import type { KnockoutRoundId } from '../../../domain/knockoutFormat'
import type { TieDecision } from '../../../domain/types'
import type { Messages } from '../messages'

export const knockout: Messages['knockout'] = {
  eyebrow: 'Tours à élimination directe',
  title: 'Phase à élimination directe',
  intro:
    'Les 8 premiers filent en huitièmes de finale. Les places 9 à 24 disputent le barrage, les 25 à 36 sont éliminées. Barrage, huitièmes, quarts et demi-finales se jouent en deux manches ; la finale est un match unique.',
  lockedTitle: 'Phase à élimination directe verrouillée',
  lockedBody: (total, completed) =>
    `Les confrontations sont tirées du classement de la phase de ligue. ${completed} des ${total} journées sont terminées — jouez les autres pour débloquer les barrages.`,
  backToLeague: 'Retour à la phase de ligue',
  playRound: (round) => `Jouer ${round.toLocaleLowerCase('fr')}`,
  bracketTitle: 'Tableau',
  bracketSubtitle: 'des huitièmes à la finale',
  tieCount: (count) => `${count} confrontations`,
  singleLeg: ' · match unique',
  completed: 'Terminé',
  watchTie: 'Regarder la confrontation',
  watchSecondLeg: 'Regarder le match retour →',
  skipToSecondLeg: 'Passer au match retour →',
  backToTie: 'Retour au résumé de la confrontation →',
  singleLegLabel: 'Match unique',
  legLabel: (leg) => `Manche ${leg}`,
  tieResult: (winner, decision) => `${winner} se qualifie ${decision}`,
  championEyebrow: 'Champion',
  roundLabel: {
    PLAY_OFF: 'Tour de barrage',
    ROUND_OF_16: 'Huitièmes de finale',
    QUARTER_FINAL: 'Quarts de finale',
    SEMI_FINAL: 'Demi-finales',
    FINAL: 'Finale',
  } as Record<KnockoutRoundId, string>,
  decisionNote: {
    AGGREGATE: 'sur l’ensemble des deux matches',
    EXTRA_TIME: 'après prolongation',
    PENALTIES: 'aux tirs au but',
  } as Record<TieDecision, string>,
  decisionSuffix: {
    AGGREGATE: '',
    EXTRA_TIME: 'prolongation',
    PENALTIES: 'tirs au but',
  } as Record<TieDecision, string>,
  tieNote: {
    AGGREGATE: '',
    EXTRA_TIME: 'après prolongation',
    PENALTIES: 'aux tirs au but',
  } as Record<TieDecision, string>,
  slotPosition: (position) => `place ${position}`,
  slotWinner: (round, order) => `vainqueur ${round}${order}`,
  runSummary: {
    champion: 'Champion',
    advanced: {
      PLAY_OFF: 'Qualifié pour les huitièmes',
      ROUND_OF_16: 'Qualifié pour les quarts',
      QUARTER_FINAL: 'Qualifié pour les demi-finales',
      SEMI_FINAL: 'Qualifié pour la finale',
      FINAL: 'Champion',
    } as Record<KnockoutRoundId, string>,
    eliminated: {
      PLAY_OFF: 'Éliminé au tour de barrage',
      ROUND_OF_16: 'Éliminé en huitièmes',
      QUARTER_FINAL: 'Éliminé en quarts',
      SEMI_FINAL: 'Éliminé en demi-finales',
      FINAL: 'Battu en finale',
    } as Record<KnockoutRoundId, string>,
  },
}
