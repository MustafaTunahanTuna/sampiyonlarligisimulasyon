import type { RandomSource } from '../random'
import type { TeamProfile, Zone } from './types'

const BASE_FOUL_CHANCE = 0.115
const DISCIPLINE_BASELINE = 70
const DISCIPLINE_SWING = 140
const CARD_CHANCE_BY_ZONE: Record<Zone, number> = {
  0: 0.09,
  1: 0.11,
  2: 0.14,
  3: 0.2,
  4: 0.24,
}
const SECOND_YELLOW_CHANCE = 0.05
const STRAIGHT_RED_CHANCE = 0.003
const PENALTY_CHANCE_IN_BOX = 0.05

export type FoulCard = 'YELLOW' | 'RED' | null

export interface FoulResult {
  conceded: boolean
  card: FoulCard
  penalty: boolean
}

const NO_FOUL: FoulResult = { conceded: false, card: null, penalty: false }

function foulChance(defender: TeamProfile): number {
  return BASE_FOUL_CHANCE * (1 + (DISCIPLINE_BASELINE - defender.discipline) / DISCIPLINE_SWING)
}

function cardFor(zone: Zone, yellowsAlready: number, random: RandomSource): FoulCard {
  if (random() < STRAIGHT_RED_CHANCE) return 'RED'
  if (random() >= CARD_CHANCE_BY_ZONE[zone]) return null
  return yellowsAlready > 0 && random() < SECOND_YELLOW_CHANCE ? 'RED' : 'YELLOW'
}

export function rollFoul(
  zone: Zone,
  defender: TeamProfile,
  yellowsAlready: number,
  random: RandomSource,
): FoulResult {
  if (random() >= foulChance(defender)) return NO_FOUL
  return {
    conceded: true,
    card: cardFor(zone, yellowsAlready, random),
    penalty: zone === 4 && random() < PENALTY_CHANCE_IN_BOX,
  }
}
