import { ENGINE_VERSION } from '../domain/engine'
import type { KnockoutScoreMap, PredictionMap } from '../domain/types'

const STORAGE_KEY = 'ucl:predictions'

export interface PersistedPredictions {
  predictions: PredictionMap
  knockoutScores?: KnockoutScoreMap
  seed: string
  unpredictability: number
  engineVersion?: number
}

function manualOnly(predictions: PredictionMap): PredictionMap {
  return Object.fromEntries(
    Object.entries(predictions).filter(([, prediction]) => prediction.source === 'manual'),
  )
}

function migrated(stored: PersistedPredictions): PersistedPredictions {
  if (stored.engineVersion === ENGINE_VERSION) return stored
  return {
    ...stored,
    predictions: manualOnly(stored.predictions ?? {}),
    knockoutScores: {},
    engineVersion: ENGINE_VERSION,
  }
}

export function readPersisted(): PersistedPredictions | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : migrated(JSON.parse(raw) as PersistedPredictions)
  } catch {
    return null
  }
}

export function persist(state: PersistedPredictions) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, engineVersion: ENGINE_VERSION }),
    )
  } catch {
    return
  }
}
