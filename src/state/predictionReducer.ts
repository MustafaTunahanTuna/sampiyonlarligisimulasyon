import { drawPool, getTeam } from '../domain/drawPool'
import { simulateMatch } from '../domain/simulation'
import type { PredictionMap, Score } from '../domain/types'

export const DEFAULT_UNPREDICTABILITY = 0.25

export interface PredictionState {
  predictions: PredictionMap
  seed: string
  unpredictability: number
}

export type PredictionAction =
  | { type: 'score-entered'; matchId: string; score: Score }
  | { type: 'score-cleared'; matchId: string }
  | { type: 'simulation-requested'; scope: 'gaps' | 'resimulate' }
  | { type: 'seed-changed'; seed: string }
  | { type: 'unpredictability-changed'; unpredictability: number }
  | { type: 'everything-cleared' }

export function createSeed(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function initialState(): PredictionState {
  return { predictions: {}, seed: createSeed(), unpredictability: DEFAULT_UNPREDICTABILITY }
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

export function predictionReducer(
  state: PredictionState,
  action: PredictionAction,
): PredictionState {
  switch (action.type) {
    case 'score-entered':
      return {
        ...state,
        predictions: {
          ...state.predictions,
          [action.matchId]: { score: action.score, source: 'manual' },
        },
      }
    case 'score-cleared': {
      const remaining = { ...state.predictions }
      delete remaining[action.matchId]
      return { ...state, predictions: remaining }
    }
    case 'simulation-requested': {
      const refreshed =
        action.scope === 'resimulate' ? { ...state, seed: createSeed() } : state
      return { ...refreshed, predictions: simulate(refreshed, action.scope) }
    }
    case 'seed-changed':
      return { ...state, seed: action.seed }
    case 'unpredictability-changed':
      return { ...state, unpredictability: action.unpredictability }
    case 'everything-cleared':
      return initialState()
  }
}
