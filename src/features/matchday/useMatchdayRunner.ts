import { useState } from 'react'
import {
  MATCHDAY_NUMBERS,
  isLeaguePhaseComplete,
  nextMatchday,
} from '../../domain/matchdays'
import { usePredictions } from '../../state/usePredictions'
import type { MatchdayNumber } from '../../domain/matchdays'

export function useMatchdayRunner() {
  const { state, dispatch } = usePredictions()
  const [activeMatchday, setActiveMatchday] = useState<MatchdayNumber | null>(null)

  const runMatchday = (matchday: MatchdayNumber) => {
    dispatch({ type: 'matchday-simulated', matchday })
    setActiveMatchday(matchday)
  }

  const startNext = () => {
    const upcoming = nextMatchday(state.predictions)
    if (upcoming !== null) runMatchday(upcoming)
  }

  const replayMatchday = (matchday: MatchdayNumber) => setActiveMatchday(matchday)

  const restartSeason = () => {
    dispatch({ type: 'everything-cleared' })
    setActiveMatchday(null)
  }

  const finishRemaining = () => {
    for (const matchday of MATCHDAY_NUMBERS) {
      dispatch({ type: 'matchday-simulated', matchday })
    }
    setActiveMatchday(null)
  }

  return {
    activeMatchday,
    isLeagueComplete: isLeaguePhaseComplete(state.predictions),
    upcomingMatchday: nextMatchday(state.predictions),
    startNext,
    restartSeason,
    replayMatchday,
    finishRemaining,
    close: () => setActiveMatchday(null),
  }
}
