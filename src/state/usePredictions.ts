import { useContext } from 'react'
import { PredictionContext } from './predictionContext'
import type { PredictionContextValue } from './predictionContext'

export function usePredictions(): PredictionContextValue {
  const context = useContext(PredictionContext)
  if (context === null) {
    throw new Error('usePredictions must be used inside PredictionProvider')
  }
  return context
}
