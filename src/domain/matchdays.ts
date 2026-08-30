import { drawPool } from './drawPool'
import { scoreFor } from './predictedResults'
import type { Match, PredictionMap } from './types'

export const MATCHDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export type MatchdayNumber = (typeof MATCHDAY_NUMBERS)[number]

const matchesByMatchday = new Map<number, Match[]>(
  MATCHDAY_NUMBERS.map((matchday) => [
    matchday,
    drawPool.matches.filter((match) => match.matchday === matchday),
  ]),
)

export interface MatchdayWindow {
  from: string
  to: string
}

const windowByMatchday = new Map<number, MatchdayWindow | null>(
  MATCHDAY_NUMBERS.map((matchday) => {
    const kickOffs = (matchesByMatchday.get(matchday) ?? [])
      .map((match) => match.kickOff)
      .filter((kickOff): kickOff is string => kickOff !== null)
      .sort()
    return [
      matchday,
      kickOffs.length === 0 ? null : { from: kickOffs[0], to: kickOffs[kickOffs.length - 1] },
    ]
  }),
)

export function matchdayMatches(matchday: MatchdayNumber): Match[] {
  return matchesByMatchday.get(matchday) ?? []
}

export function matchdayWindow(matchday: MatchdayNumber): MatchdayWindow | null {
  return windowByMatchday.get(matchday) ?? null
}

export function isMatchdayComplete(matchday: MatchdayNumber, predictions: PredictionMap): boolean {
  const matches = matchdayMatches(matchday)
  return matches.length > 0 && matches.every((match) => scoreFor(match, predictions) !== null)
}

export function completedMatchdayCount(predictions: PredictionMap): number {
  return MATCHDAY_NUMBERS.filter((matchday) => isMatchdayComplete(matchday, predictions)).length
}

export function nextMatchday(predictions: PredictionMap): MatchdayNumber | null {
  return MATCHDAY_NUMBERS.find((matchday) => !isMatchdayComplete(matchday, predictions)) ?? null
}

export function isLeaguePhaseComplete(predictions: PredictionMap): boolean {
  return nextMatchday(predictions) === null
}
