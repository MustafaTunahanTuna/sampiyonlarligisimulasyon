import { drawPool, getTeam } from '../domain/drawPool'
import { matchdayMatches } from '../domain/matchdays'
import type { MatchdayNumber } from '../domain/matchdays'
import { simulateMatch } from '../domain/simulation'
import type { KnockoutScoreMap, PredictionMap, Score } from '../domain/types'

export const DEFAULT_UNPREDICTABILITY = 0.25

export interface PredictionState {
  predictions: PredictionMap
  knockoutScores: KnockoutScoreMap
  seed: string
  unpredictability: number
}

export type PredictionAction =
  | { type: 'score-entered'; matchId: string; score: Score }
  | { type: 'score-cleared'; matchId: string }
  | { type: 'simulation-requested'; scope: 'gaps' | 'resimulate' }
  | { type: 'matchday-simulated'; matchday: MatchdayNumber }
  | { type: 'knockout-round-simulated'; scores: KnockoutScoreMap }
  | { type: 'seed-changed'; seed: string }
  | { type: 'unpredictability-changed'; unpredictability: number }
  | { type: 'everything-cleared' }

export function createSeed(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function initialState(): PredictionState {
  return {
    predictions: {},
    knockoutScores: {},
    seed: createSeed(),
    unpredictability: DEFAULT_UNPREDICTABILITY,
  }
}

function simulate(state: PredictionState, scope: 'gaps' | 'resimulate'): PredictionMap {
  const next: PredictionMap = {}
  for (const match of drawPool.matches) {
    const existing = state.predictions[match.id]
    if (existing && (scope === 'gaps' || existing.source === 'manual')) {
      next[match.id] = existing
      continue
    }
    next[match.id] = {
      score: simulateMatch(
        match,
        getTeam(match.homeTeamId),
        getTeam(match.awayTeamId),
        state.seed,
        state.unpredictability,
      ),
      source: 'simulated',
    }
  }
  return next
}

function simulateMatchday(state: PredictionState, matchday: MatchdayNumber): PredictionMap {
  const simulated: PredictionMap = { ...state.predictions }
  for (const match of matchdayMatches(matchday)) {
    if (simulated[match.id]?.source === 'manual') continue
    simulated[match.id] = {
      score: simulateMatch(
        match,
        getTeam(match.homeTeamId),
        getTeam(match.awayTeamId),
        state.seed,
        state.unpredictability,
      ),
      source: 'simulated',
    }
  }
  return simulated
}

export function predictionReducer(
  state: PredictionState,
  action: PredictionAction,
): PredictionState {
  switch (action.type) {
    case 'score-entered':
      return {
        ...state,
        knockoutScores: {},
        predictions: {
          ...state.predictions,
          [action.matchId]: { score: action.score, source: 'manual' },
        },
      }
    case 'score-cleared': {
      const remaining = { ...state.predictions }
      delete remaining[action.matchId]
      return { ...state, knockoutScores: {}, predictions: remaining }
    }
    case 'simulation-requested': {
      const refreshed =
        action.scope === 'resimulate' ? { ...state, seed: createSeed() } : state
      return { ...refreshed, knockoutScores: {}, predictions: simulate(refreshed, action.scope) }
    }
    case 'matchday-simulated':
      return {
        ...state,
        knockoutScores: {},
        predictions: simulateMatchday(state, action.matchday),
      }
    case 'knockout-round-simulated':
      return { ...state, knockoutScores: { ...state.knockoutScores, ...action.scores } }
    case 'seed-changed':
      return { ...state, seed: action.seed }
    case 'unpredictability-changed':
      return { ...state, unpredictability: action.unpredictability }
    case 'everything-cleared':
      return initialState()
  }
}
