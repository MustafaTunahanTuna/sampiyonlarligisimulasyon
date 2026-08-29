import type { RandomSource } from '../random'
import type { TeamProfile } from './types'

const BASE_PHASE_SECONDS = 26
const PHASE_JITTER_SECONDS = 18
const SECONDS_PER_MINUTE = 60
const MIN_PHASE_SECONDS = 4

export function phaseDuration(
  attacker: TeamProfile,
  defender: TeamProfile,
  random: RandomSource,
): number {
  const pace = (attacker.tempo + defender.tempo) / 2
  const seconds = Math.round((BASE_PHASE_SECONDS + random() * PHASE_JITTER_SECONDS) / pace)
  return Number.isFinite(seconds) ? Math.max(MIN_PHASE_SECONDS, seconds) : BASE_PHASE_SECONDS
}

export function addedTimeSeconds(
  goals: number,
  cards: number,
  substitutionsAssumed: number,
  random: RandomSource,
): number {
  const minutes = 1 + goals * 0.5 + cards * 0.35 + substitutionsAssumed * 0.2 + random() * 1.5
  return Math.round(Math.min(7, minutes) * SECONDS_PER_MINUTE)
}

export function minuteOf(second: number): number {
  return Math.floor(second / SECONDS_PER_MINUTE) + 1
}
