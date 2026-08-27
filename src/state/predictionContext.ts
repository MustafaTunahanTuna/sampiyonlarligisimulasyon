import { createContext } from 'react'
import type { PredictionAction, PredictionState } from './predictionReducer'

export interface PredictionContextValue {
  state: PredictionState
  dispatch: (action: PredictionAction) => void
}

export const PredictionContext = createContext<PredictionContextValue | null>(null)
