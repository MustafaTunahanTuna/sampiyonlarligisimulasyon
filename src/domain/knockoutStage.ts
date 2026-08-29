import { KNOCKOUT_ROUNDS } from './knockoutFormat'
import {
  finalTie,
  isTieReady,
  playOffTies,
  quarterFinalTies,
  roundOf16Ties,
  semiFinalTies,
  winnersOf,
} from './knockoutBracket'
import { resolveTie, simulateTieScores } from './knockoutTie'
import type { KnockoutRoundId } from './knockoutFormat'
import type { KnockoutScoreMap, KnockoutTie, StandingRow, Team, TieOutcome } from './types'

export interface KnockoutRound {
  id: KnockoutRoundId
  ties: KnockoutTie[]
  outcomes: Map<string, TieOutcome>
  isReady: boolean
  isComplete: boolean
}

export interface KnockoutStage {
  rounds: KnockoutRound[]
  champion: Team | null
}

function buildRound(id: KnockoutRoundId, ties: KnockoutTie[], scores: KnockoutScoreMap): KnockoutRound {
  const outcomes = new Map<string, TieOutcome>()
  for (const tie of ties) {
    const outcome = resolveTie(tie, scores)
    if (outcome !== null) outcomes.set(tie.id, outcome)
  }
  return {
    id,
    ties,
    outcomes,
    isReady: ties.every(isTieReady),
    isComplete: ties.length > 0 && outcomes.size === ties.length,
  }
}

export function buildKnockoutStage(
  standings: StandingRow[],
  scores: KnockoutScoreMap,
): KnockoutStage {
  const playOff = buildRound('PLAY_OFF', playOffTies(standings), scores)
  const roundOf16 = buildRound(
    'ROUND_OF_16',
    roundOf16Ties(standings, winnersOf(playOff.ties, playOff.outcomes)),
    scores,
  )
  const quarterFinal = buildRound(
    'QUARTER_FINAL',
    quarterFinalTies(winnersOf(roundOf16.ties, roundOf16.outcomes)),
    scores,
  )
  const semiFinal = buildRound(
    'SEMI_FINAL',
    semiFinalTies(winnersOf(quarterFinal.ties, quarterFinal.outcomes)),
    scores,
  )
  const final = buildRound('FINAL', finalTie(winnersOf(semiFinal.ties, semiFinal.outcomes)), scores)

  return {
    rounds: [playOff, roundOf16, quarterFinal, semiFinal, final],
    champion: final.outcomes.get(final.ties[0]?.id ?? '')?.winner ?? null,
  }
}

export function nextPlayableRound(stage: KnockoutStage): KnockoutRound | null {
  return stage.rounds.find((round) => round.isReady && !round.isComplete) ?? null
}

export function simulateRoundScores(
  round: KnockoutRound,
  seed: string,
  unpredictability: number,
): KnockoutScoreMap {
  return round.ties.reduce<KnockoutScoreMap>(
    (scores, tie) => ({ ...scores, ...simulateTieScores(tie, seed, unpredictability) }),
    {},
  )
}

export function roundIndexOf(id: KnockoutRoundId): number {
  return KNOCKOUT_ROUNDS.indexOf(id)
}
