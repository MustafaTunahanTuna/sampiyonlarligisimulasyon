import type { KnockoutScoreMap, PredictionMap } from '../domain/types'

const STORAGE_KEY = 'ucl:predictions'

export interface PersistedPredictions {
  predictions: PredictionMap
  knockoutScores?: KnockoutScoreMap
  seed: string
  unpredictability: number
}

export function readPersisted(): PersistedPredictions | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : (JSON.parse(raw) as PersistedPredictions)
  } catch {
    return null
  }
}

export function persist(state: PersistedPredictions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}
