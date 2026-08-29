import {
  BRACKET_ORDER,
  PLAY_OFF_PAIRS,
  ROUND_OF_16_SEEDING,
  isTwoLegged,
  tieId,
} from './knockoutFormat'
import type { KnockoutRoundId } from './knockoutFormat'
import type { KnockoutTie, StandingRow, Team, TieOutcome, TieSlot } from './types'

function teamAtPosition(standings: StandingRow[], position: number): Team | null {
  return standings.find((row) => row.position === position)?.team ?? null
}

function positionSlot(position: number): TieSlot {
  return { kind: 'POSITION', position }
}

function winnerSlot(round: KnockoutRoundId, order: number): TieSlot {
  return { kind: 'WINNER', round, order }
}

function createTie(
  round: KnockoutRoundId,
  order: number,
  seeded: Team | null,
  challenger: Team | null,
  seededSlot: TieSlot,
  challengerSlot: TieSlot,
): KnockoutTie {
  return {
    id: tieId(round, order),
    round,
    order,
    seeded,
    challenger,
    seededSlot,
    challengerSlot,
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
      positionSlot(seededPosition),
      positionSlot(challengerPosition),
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
      positionSlot(seededPosition),
      winnerSlot('PLAY_OFF', playOffOrder),
    ),
  )
}

function pairWinners(
  round: KnockoutRoundId,
  winners: (Team | null)[],
  slots: TieSlot[],
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
        slots[first],
        slots[second],
      ),
    )
  }
  return ties
}

export function quarterFinalTies(roundOf16Winners: (Team | null)[]): KnockoutTie[] {
  const slots = roundOf16Winners.map((_, index) => winnerSlot('ROUND_OF_16', index + 1))
  return pairWinners('QUARTER_FINAL', roundOf16Winners, slots, BRACKET_ORDER)
}

export function semiFinalTies(quarterFinalWinners: (Team | null)[]): KnockoutTie[] {
  const slots = quarterFinalWinners.map((_, index) => winnerSlot('QUARTER_FINAL', index + 1))
  return pairWinners('SEMI_FINAL', quarterFinalWinners, slots, [1, 2, 3, 4])
}

export function finalTie(semiFinalWinners: (Team | null)[]): KnockoutTie[] {
  const slots = semiFinalWinners.map((_, index) => winnerSlot('SEMI_FINAL', index + 1))
  return pairWinners('FINAL', semiFinalWinners, slots, [1, 2])
}

export function isTieReady(tie: KnockoutTie): boolean {
  return tie.seeded !== null && tie.challenger !== null
}

export function winnersOf(ties: KnockoutTie[], outcomes: Map<string, TieOutcome>): (Team | null)[] {
  return ties.map((tie) => outcomes.get(tie.id)?.winner ?? null)
}
