import { getTeam } from '../../domain/drawPool'
import { matchdayMatches } from '../../domain/matchdays'
import { scoreFor } from '../../domain/predictedResults'
import type { MatchdayNumber } from '../../domain/matchdays'
import type { PredictionMap, Score, Team } from '../../domain/types'

export interface MatchdayResult {
  id: string
  home: Team
  away: Team
  score: Score
  isWatchable: boolean
}

export function matchdayResults(
  matchday: MatchdayNumber,
  predictions: PredictionMap,
): MatchdayResult[] {
  return matchdayMatches(matchday).flatMap((match) => {
    const score = scoreFor(match, predictions)
    if (score === null) return []
    return [
      {
        id: match.id,
        home: getTeam(match.homeTeamId),
        away: getTeam(match.awayTeamId),
        score,
        isWatchable: predictions[match.id]?.source === 'simulated',
      },
    ]
  })
}

export function favouriteResultOf(
  results: MatchdayResult[],
  favouriteTeam: Team | null,
): MatchdayResult | null {
  if (favouriteTeam === null) return null
  return (
    results.find(
      (result) => result.home.id === favouriteTeam.id || result.away.id === favouriteTeam.id,
    ) ?? null
  )
}
