import type { KnockoutRoundId } from '../../../domain/knockoutFormat'
import type { TieDecision } from '../../../domain/types'
import type { Messages } from '../messages'

export const knockout: Messages['knockout'] = {
  eyebrow: 'Elimination rounds',
  title: 'Knockout stage',
  intro:
    'The top 8 go straight to the round of 16. Places 9–24 play the play-off round, 25–36 are out. Play-off, round of 16, quarter-final and semi-final are two-legged; the final is a single match.',
  lockedTitle: 'Knockout stage locked',
  lockedBody: (total, completed) =>
    `The ties are drawn from the league phase table. ${completed} of ${total} matchdays are done — play the rest to unlock the play-off ties.`,
  backToLeague: 'Back to the league phase',
  playRound: (round) => `Play the ${round.toLocaleLowerCase('en')}`,
  bracketTitle: 'Bracket',
  bracketSubtitle: 'round of 16 to the final',
  tieCount: (count) => `${count} ties`,
  singleLeg: ' · single match',
  completed: 'Completed',
  watchTie: 'Watch the tie',
  watchSecondLeg: 'Watch the second leg →',
  skipToSecondLeg: 'Skip to the second leg →',
  backToTie: 'Back to the tie summary →',
  singleLegLabel: 'Single match',
  legLabel: (leg) => `Leg ${leg}`,
  tieResult: (winner, decision) => `${winner} went through ${decision}`,
  championEyebrow: 'Champion',
  roundLabel: {
    PLAY_OFF: 'Play-off round',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINAL: 'Quarter-final',
    SEMI_FINAL: 'Semi-final',
    FINAL: 'Final',
  } as Record<KnockoutRoundId, string>,
  decisionNote: {
    AGGREGATE: 'on aggregate',
    EXTRA_TIME: 'in extra time',
    PENALTIES: 'on penalties',
  } as Record<TieDecision, string>,
  decisionSuffix: {
    AGGREGATE: '',
    EXTRA_TIME: 'extra time',
    PENALTIES: 'penalties',
  } as Record<TieDecision, string>,
  tieNote: {
    AGGREGATE: '',
    EXTRA_TIME: 'in extra time',
    PENALTIES: 'on penalties',
  } as Record<TieDecision, string>,
  slotPosition: (position) => `place ${position}`,
  slotWinner: (round, order) => `${round}${order} winner`,
  runSummary: {
    champion: 'Champion',
    advanced: {
      PLAY_OFF: 'Reached the round of 16',
      ROUND_OF_16: 'Reached the quarter-final',
      QUARTER_FINAL: 'Reached the semi-final',
      SEMI_FINAL: 'Reached the final',
      FINAL: 'Champion',
    } as Record<KnockoutRoundId, string>,
    eliminated: {
      PLAY_OFF: 'Out in the play-off round',
      ROUND_OF_16: 'Out in the round of 16',
      QUARTER_FINAL: 'Out in the quarter-final',
      SEMI_FINAL: 'Out in the semi-final',
      FINAL: 'Lost the final',
    } as Record<KnockoutRoundId, string>,
  },
}
