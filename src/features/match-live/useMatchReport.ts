import { useMemo } from 'react'
import { matchSeedKey, simulateMatchReport } from '../../domain/engine'
import { usePredictions } from '../../state/usePredictions'
import type { MatchReport } from '../../domain/engine'
import type { Team } from '../../domain/types'

export function useMatchReport(matchId: string, homeTeam: Team, awayTeam: Team): MatchReport {
  const { state } = usePredictions()
  return useMemo(
    () =>
      simulateMatchReport(
        homeTeam,
        awayTeam,
        matchSeedKey(state.seed, matchId),
        state.unpredictability,
      ),
    [homeTeam, awayTeam, matchId, state.seed, state.unpredictability],
  )
}
