import { drawPool } from './drawPool'
import { buildStandings } from './standings'
import type { Fixture, Match, PredictionMap, Score, StandingRow } from './types'

export function scoreFor(match: Match, predictions: PredictionMap): Score | null {
  return match.score ?? predictions[match.id]?.score ?? null
}

export function withPredictedScores(fixtures: Fixture[], predictions: PredictionMap): Fixture[] {
  return fixtures.map((fixture) => {
    const score = scoreFor(fixture.match, predictions)
    if (score === null) return fixture
    const goalsFor = fixture.venue === 'HOME' ? score.home : score.away
    const goalsAgainst = fixture.venue === 'HOME' ? score.away : score.home
    return {
      ...fixture,
      goalsFor,
      goalsAgainst,
      outcome: goalsFor > goalsAgainst ? 'WIN' : goalsFor < goalsAgainst ? 'LOSS' : 'DRAW',
    }
  })
}

export function predictedStandings(
  predictions: PredictionMap,
  throughMatchday?: number,
): StandingRow[] {
  const results = drawPool.matches.flatMap((match) => {
    if (throughMatchday !== undefined && (match.matchday ?? Infinity) > throughMatchday) return []
    const score = scoreFor(match, predictions)
    return score === null
      ? []
      : [{ homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId, score }]
  })
  return buildStandings(drawPool.teams, results)
}

export function predictedMatchCount(predictions: PredictionMap): number {
  return drawPool.matches.filter((match) => scoreFor(match, predictions) !== null).length
}
