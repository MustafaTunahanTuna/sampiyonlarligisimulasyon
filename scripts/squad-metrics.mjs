export const STARTERS = { GK: 1, DF: 4, MF: 3, FW: 3 }
export const DEPTH_SLICE = 9

const RATING_PIVOT = 50
const RATING_SPREAD = 2
const RATING_FLOOR = 12
const RATING_CEILING = 100
const DISCIPLINE_PIVOT = 140
const DEFAULT_AGGRESSION = 70

export const SQUAD_WEIGHT = 0.6

export function toEngineRating(overall) {
  const scaled = (overall - RATING_PIVOT) * RATING_SPREAD + RATING_FLOOR + 8
  return Math.round(Math.min(RATING_CEILING, Math.max(RATING_FLOOR, scaled)))
}

export function averageOf(values) {
  if (values.length === 0) return null
  return values.reduce((total, value) => total + value, 0) / values.length
}

export function teamCard(players) {
  const card = {}
  for (const [position, count] of Object.entries(STARTERS)) {
    const rated = players
      .filter((player) => player.position === position)
      .map((player) => player.quality)
      .sort((left, right) => right - left)
      .slice(0, count)
    card[position] = rated.length === 0 ? null : Math.round(averageOf(rated))
  }
  const ranked = players.map((player) => player.quality).sort((left, right) => right - left)
  const eleven = ranked.slice(0, 11)
  const bench = ranked.slice(11, 11 + DEPTH_SLICE)
  const aggression =
    averageOf(players.map((player) => player.aggression).filter((value) => value != null)) ??
    DEFAULT_AGGRESSION
  return {
    goalkeeping: card.GK,
    defence: card.DF,
    midfield: card.MF,
    attack: card.FW,
    firstEleven: Math.round(averageOf(eleven)),
    depth: bench.length === 0 ? Math.round(averageOf(eleven)) : Math.round(averageOf(bench)),
    aggression: Math.round(aggression),
    size: players.length,
  }
}

export function engineProfile(card, uefaStrength, squadWeight = SQUAD_WEIGHT) {
  const squadStrength = toEngineRating(card.firstEleven)
  const blended =
    uefaStrength === null
      ? squadStrength
      : squadWeight * squadStrength + (1 - squadWeight) * uefaStrength
  return {
    attack: toEngineRating(card.attack),
    midfield: toEngineRating(card.midfield),
    defence: toEngineRating(card.defence),
    goalkeeping: toEngineRating(card.goalkeeping),
    discipline: Math.round(
      Math.min(RATING_CEILING, Math.max(RATING_FLOOR, DISCIPLINE_PIVOT - card.aggression)),
    ),
    depth: toEngineRating(card.depth),
    squadStrength,
    strength: Math.round(blended),
  }
}

export function normaliseToStrength(valueByKey, floor = 20, ceiling = 100) {
  const values = [...valueByKey.values()]
  const lowest = Math.min(...values)
  const span = Math.max(...values) - lowest || 1
  return new Map(
    [...valueByKey].map(([key, value]) => [
      key,
      Math.round(floor + ((value - lowest) / span) * (ceiling - floor)),
    ]),
  )
}
