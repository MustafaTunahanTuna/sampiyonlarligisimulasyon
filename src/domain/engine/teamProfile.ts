import { createRandom, hashSeed } from '../random'
import type { Team } from '../types'
import type { TeamProfile } from './types'

const DIMENSION_SPREAD = 8
const MIN_RATING = 12
const MAX_RATING = 100
const TEMPO_SPREAD = 0.15

function clampRating(value: number): number {
  return Math.min(MAX_RATING, Math.max(MIN_RATING, value))
}

function dimension(teamId: string, name: string, strength: number): number {
  const random = createRandom(hashSeed(`${teamId}:${name}`))
  return clampRating(strength + (random() * 2 - 1) * DIMENSION_SPREAD)
}

function tempoFor(teamId: string): number {
  const random = createRandom(hashSeed(`${teamId}:tempo`))
  return 1 + (random() * 2 - 1) * TEMPO_SPREAD
}

const cache = new Map<string, TeamProfile>()

export function teamProfile(team: Team): TeamProfile {
  const cached = cache.get(team.id)
  if (cached !== undefined) return cached

  const profile: TeamProfile = {
    attack: dimension(team.id, 'attack', team.strength),
    midfield: dimension(team.id, 'midfield', team.strength),
    defence: dimension(team.id, 'defence', team.strength),
    goalkeeping: dimension(team.id, 'goalkeeping', team.strength),
    discipline: dimension(team.id, 'discipline', team.strength),
    tempo: tempoFor(team.id),
  }
  cache.set(team.id, profile)
  return profile
}

export function weakenedProfile(profile: TeamProfile, penalty: number): TeamProfile {
  return {
    ...profile,
    midfield: clampRating(profile.midfield - penalty),
    defence: clampRating(profile.defence - penalty),
    attack: clampRating(profile.attack - penalty),
  }
}
