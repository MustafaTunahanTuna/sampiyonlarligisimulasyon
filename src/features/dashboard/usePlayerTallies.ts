import { useMemo } from 'react'
import { playerTallies } from '../../domain/playerStats'
import { usePredictions } from '../../state/usePredictions'
import type { PlayerTally } from '../../domain/playerStats'

export function usePlayerTallies(): PlayerTally[] {
  const { state } = usePredictions()
  return useMemo(
    () => playerTallies(state.predictions, state.seed, state.unpredictability),
    [state.predictions, state.seed, state.unpredictability],
  )
}
