import { useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { persist, readPersisted } from './predictionStorage'
import { DEFAULT_UNPREDICTABILITY, createSeed, predictionReducer } from './predictionReducer'
import type { PredictionState } from './predictionReducer'

import { PredictionContext } from './predictionContext'

function restoreState(): PredictionState {
  const stored = readPersisted()
  return {
    predictions: stored?.predictions ?? {},
    seed: stored?.seed ?? createSeed(),
    unpredictability: stored?.unpredictability ?? DEFAULT_UNPREDICTABILITY,
  }
}

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(predictionReducer, null, restoreState)

  useEffect(() => {
    persist(state)
  }, [state])

  return (
    <PredictionContext value={{ state, dispatch }}>{children}</PredictionContext>
  )
}
