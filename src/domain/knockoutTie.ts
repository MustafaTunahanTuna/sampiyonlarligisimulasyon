import { extraTimeId, legId, penaltyId } from './knockoutFormat'
import { simulateExtraTime, simulateLeg, simulatePenalties } from './knockoutSimulation'
import type { KnockoutScoreMap, KnockoutTie, Score, TieOutcome } from './types'

interface LegSetup {
  home: NonNullable<KnockoutTie['seeded']>
  away: NonNullable<KnockoutTie['seeded']>
  id: string
}

function legSetups(tie: KnockoutTie): LegSetup[] {
  const seeded = tie.seeded
  const challenger = tie.challenger
  if (seeded === null || challenger === null) return []
  if (!tie.isTwoLegged) {
    return [{ home: seeded, away: challenger, id: legId(tie.id, 1) }]
  }
  return [
    { home: challenger, away: seeded, id: legId(tie.id, 1) },
    { home: seeded, away: challenger, id: legId(tie.id, 2) },
  ]
}

function aggregateOf(tie: KnockoutTie, legs: Score[]): { seeded: number; challenger: number } {
  const setups = legSetups(tie)
  return legs.reduce(
    (total, score, index) => {
      const isSeededHome = setups[index].home.id === tie.seeded?.id
      return {
        seeded: total.seeded + (isSeededHome ? score.home : score.away),
        challenger: total.challenger + (isSeededHome ? score.away : score.home),
      }
    },
    { seeded: 0, challenger: 0 },
  )
}

export function simulateTieScores(
  tie: KnockoutTie,
  seed: string,
  unpredictability: number,
): KnockoutScoreMap {
  const setups = legSetups(tie)
  if (setups.length === 0) return {}

  const scores: KnockoutScoreMap = {}
  const legs: Score[] = []
  for (const setup of setups) {
    const score = simulateLeg(setup.home, setup.away, `${seed}:${setup.id}`, unpredictability)
    scores[setup.id] = score
    legs.push(score)
  }

  const aggregate = aggregateOf(tie, legs)
  if (aggregate.seeded !== aggregate.challenger) return scores

  const decider = setups[setups.length - 1]
  const extraTime = simulateExtraTime(
    decider.home,
    decider.away,
    `${seed}:${tie.id}`,
    unpredictability,
  )
  scores[extraTimeId(tie.id)] = extraTime

  const isSeededHome = decider.home.id === tie.seeded?.id
  const seededExtra = isSeededHome ? extraTime.home : extraTime.away
  const challengerExtra = isSeededHome ? extraTime.away : extraTime.home
  if (seededExtra !== challengerExtra) return scores

  scores[penaltyId(tie.id)] = simulatePenalties(decider.home, decider.away, `${seed}:${tie.id}`)
  return scores
}

export function resolveTie(tie: KnockoutTie, scores: KnockoutScoreMap): TieOutcome | null {
  const setups = legSetups(tie)
  if (setups.length === 0) return null

  const legs = setups.map((setup) => scores[setup.id])
  if (legs.some((score) => score === undefined)) return null

  const aggregate = aggregateOf(tie, legs)
  const seeded = tie.seeded
  const challenger = tie.challenger
  if (seeded === null || challenger === null) return null

  const base = {
    tieId: tie.id,
    legs,
    aggregateSeeded: aggregate.seeded,
    aggregateChallenger: aggregate.challenger,
    extraTime: null,
    penalties: null,
  }

  if (aggregate.seeded !== aggregate.challenger) {
    return {
      ...base,
      winner: aggregate.seeded > aggregate.challenger ? seeded : challenger,
      decidedBy: 'AGGREGATE',
    }
  }

  const decider = setups[setups.length - 1]
  const isSeededHome = decider.home.id === seeded.id
  const extraTime = scores[extraTimeId(tie.id)]
  if (extraTime === undefined) return null

  const seededExtra = isSeededHome ? extraTime.home : extraTime.away
  const challengerExtra = isSeededHome ? extraTime.away : extraTime.home
  if (seededExtra !== challengerExtra) {
    return {
      ...base,
      extraTime,
      winner: seededExtra > challengerExtra ? seeded : challenger,
      decidedBy: 'EXTRA_TIME',
    }
  }

  const penalties = scores[penaltyId(tie.id)]
  if (penalties === undefined) return null
  const seededPenalties = isSeededHome ? penalties.home : penalties.away
  const challengerPenalties = isSeededHome ? penalties.away : penalties.home

  return {
    ...base,
    extraTime,
    penalties,
    winner: seededPenalties > challengerPenalties ? seeded : challenger,
    decidedBy: 'PENALTIES',
  }
}

export function tieLegSetups(tie: KnockoutTie) {
  return legSetups(tie)
}
