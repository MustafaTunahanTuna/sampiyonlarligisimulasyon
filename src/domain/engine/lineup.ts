import { createRandom, hashSeed } from '../random'
import { findSquad } from '../squads'
import type { RandomSource } from '../random'
import type { SquadPlayer, SquadPosition } from '../squads'
import type { Zone } from './types'

const FORMATION: Record<SquadPosition, number> = { GK: 1, DF: 4, MF: 3, FW: 3 }
const ROTATION_POOL = 2
const QUALITY_BIAS = 2.6

const SCORER_WEIGHT: Record<Zone, Record<SquadPosition, number>> = {
  0: { GK: 0, DF: 5, MF: 4, FW: 1 },
  1: { GK: 0, DF: 4, MF: 5, FW: 1 },
  2: { GK: 0, DF: 1.4, MF: 7, FW: 2.6 },
  3: { GK: 0, DF: 0.7, MF: 6, FW: 7 },
  4: { GK: 0, DF: 1, MF: 4.4, FW: 12 },
}

const ASSIST_WEIGHT: Record<SquadPosition, number> = { GK: 0.2, DF: 2, MF: 6, FW: 4 }
const CARD_WEIGHT: Record<SquadPosition, number> = { GK: 0.3, DF: 4, MF: 4.4, FW: 2.7 }

export interface Lineup {
  starters: SquadPlayer[]
  penaltyTaker: SquadPlayer
}

function pickWeighted<T>(items: T[], weightOf: (item: T) => number, random: RandomSource): T {
  let total = 0
  for (const item of items) total += weightOf(item)
  if (total <= 0) return items[items.length - 1]

  let target = random() * total
  for (const item of items) {
    target -= weightOf(item)
    if (target <= 0) return item
  }
  return items[items.length - 1]
}

function selectByPosition(
  players: SquadPlayer[],
  position: SquadPosition,
  count: number,
  random: RandomSource,
): SquadPlayer[] {
  const ranked = players
    .filter((player) => player.position === position)
    .sort((left, right) => right.quality - left.quality)
    .slice(0, count + ROTATION_POOL)

  const chosen: SquadPlayer[] = []
  const available = [...ranked]
  while (chosen.length < count && available.length > 0) {
    const picked = pickWeighted(available, (player) => player.quality, random)
    chosen.push(picked)
    available.splice(available.indexOf(picked), 1)
  }
  return chosen
}

export function selectLineup(teamId: string, seedKey: string): Lineup | null {
  const squad = findSquad(teamId)
  if (squad === null) return null

  const random = createRandom(hashSeed(`${seedKey}:lineup:${teamId}`))
  const starters: SquadPlayer[] = []
  for (const [position, count] of Object.entries(FORMATION) as [SquadPosition, number][]) {
    starters.push(...selectByPosition(squad.players, position, count, random))
  }
  if (starters.length === 0) return null

  const outfield = starters.filter((player) => player.position !== 'GK')
  const penaltyTaker = (outfield.length === 0 ? starters : outfield).reduce((best, player) =>
    player.quality > best.quality ? player : best,
  )
  return { starters, penaltyTaker }
}

function biasedQuality(player: SquadPlayer): number {
  return (player.quality / 100) ** QUALITY_BIAS
}

export function pickScorer(lineup: Lineup, zone: Zone, random: RandomSource): SquadPlayer {
  const weights = SCORER_WEIGHT[zone]
  return pickWeighted(
    lineup.starters,
    (player) => weights[player.position] * biasedQuality(player),
    random,
  )
}

export function pickAssist(
  lineup: Lineup,
  scorer: SquadPlayer,
  random: RandomSource,
): SquadPlayer | null {
  const candidates = lineup.starters.filter((player) => player !== scorer)
  if (candidates.length === 0) return null
  return pickWeighted(
    candidates,
    (player) => ASSIST_WEIGHT[player.position] * biasedQuality(player),
    random,
  )
}

export function pickOffender(lineup: Lineup, random: RandomSource): SquadPlayer {
  return pickWeighted(lineup.starters, (player) => CARD_WEIGHT[player.position], random)
}
