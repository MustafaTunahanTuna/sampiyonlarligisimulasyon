import {
  BRACKET_ORDER,
  PLAY_OFF_PAIRS,
  ROUND_OF_16_SEEDING,
  isTwoLegged,
  tieId,
} from './knockoutFormat'
import type { KnockoutRoundId } from './knockoutFormat'
import type { KnockoutTie, StandingRow, Team, TieOutcome } from './types'

function teamAtPosition(standings: StandingRow[], position: number): Team | null {
  return standings.find((row) => row.position === position)?.team ?? null
}

function createTie(
  round: KnockoutRoundId,
  order: number,
  seeded: Team | null,
  challenger: Team | null,
  seededLabel: string,
  challengerLabel: string,
): KnockoutTie {
  return {
    id: tieId(round, order),
    round,
    order,
    seeded,
    challenger,
    seededLabel,
    challengerLabel,
    isTwoLegged: isTwoLegged(round),
  }
}

export function playOffTies(standings: StandingRow[]): KnockoutTie[] {
  return PLAY_OFF_PAIRS.map(([seededPosition, challengerPosition], index) =>
    createTie(
      'PLAY_OFF',
      index + 1,
      teamAtPosition(standings, seededPosition),
      teamAtPosition(standings, challengerPosition),
      `${seededPosition}. sıra`,
      `${challengerPosition}. sıra`,
    ),
  )
}

export function roundOf16Ties(
  standings: StandingRow[],
  playOffWinners: (Team | null)[],
): KnockoutTie[] {
  return ROUND_OF_16_SEEDING.map(([seededPosition, playOffOrder], index) =>
    createTie(
      'ROUND_OF_16',
      index + 1,
      teamAtPosition(standings, seededPosition),
      playOffWinners[playOffOrder - 1] ?? null,
      `${seededPosition}. sıra`,
      `PO${playOffOrder} galibi`,
    ),
  )
}

function pairWinners(
  round: KnockoutRoundId,
  winners: (Team | null)[],
  labels: string[],
  order: number[],
): KnockoutTie[] {
  const ties: KnockoutTie[] = []
  for (let index = 0; index < order.length; index += 2) {
    const first = order[index] - 1
    const second = order[index + 1] - 1
    ties.push(
      createTie(
        round,
        ties.length + 1,
        winners[first] ?? null,
        winners[second] ?? null,
        labels[first],
        labels[second],
      ),
    )
  }
  return ties
}

export function quarterFinalTies(roundOf16Winners: (Team | null)[]): KnockoutTie[] {
  const labels = roundOf16Winners.map((_, index) => `R16-${index + 1} galibi`)
  return pairWinners('QUARTER_FINAL', roundOf16Winners, labels, BRACKET_ORDER)
}

export function semiFinalTies(quarterFinalWinners: (Team | null)[]): KnockoutTie[] {
  const labels = quarterFinalWinners.map((_, index) => `QF-${index + 1} galibi`)
  return pairWinners('SEMI_FINAL', quarterFinalWinners, labels, [1, 2, 3, 4])
}

export function finalTie(semiFinalWinners: (Team | null)[]): KnockoutTie[] {
  const labels = semiFinalWinners.map((_, index) => `SF-${index + 1} galibi`)
  return pairWinners('FINAL', semiFinalWinners, labels, [1, 2])
}

export function isTieReady(tie: KnockoutTie): boolean {
  return tie.seeded !== null && tie.challenger !== null
}

export function winnersOf(ties: KnockoutTie[], outcomes: Map<string, TieOutcome>): (Team | null)[] {
  return ties.map((tie) => outcomes.get(tie.id)?.winner ?? null)
}
