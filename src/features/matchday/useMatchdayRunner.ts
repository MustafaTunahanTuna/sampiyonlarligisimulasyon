import { useState } from 'react'
import { MATCHDAY_NUMBERS, isLeaguePhaseComplete, nextMatchday } from '../../domain/matchdays'
import { usePredictions } from '../../state/usePredictions'
import type { MatchdayNumber } from '../../domain/matchdays'

type ViewMode = 'play' | 'review'

interface ActiveView {
  matchday: MatchdayNumber
  mode: ViewMode
}

export function useMatchdayRunner() {
  const { state, dispatch } = usePredictions()
  const [activeView, setActiveView] = useState<ActiveView | null>(null)

  const startNext = () => {
    const upcoming = nextMatchday(state.predictions)
    if (upcoming === null) return
    dispatch({ type: 'matchday-simulated', matchday: upcoming })
    setActiveView({ matchday: upcoming, mode: 'play' })
  }

  const replayMatchday = (matchday: MatchdayNumber) =>
    setActiveView({ matchday, mode: 'review' })

  const finishRemaining = () => {
    for (const matchday of MATCHDAY_NUMBERS) {
      dispatch({ type: 'matchday-simulated', matchday })
    }
    setActiveView(null)
  }

  const restartSeason = () => {
    dispatch({ type: 'everything-cleared' })
    setActiveView(null)
  }

  return {
    activeView,
    isLeagueComplete: isLeaguePhaseComplete(state.predictions),
    upcomingMatchday: nextMatchday(state.predictions),
    startNext,
    replayMatchday,
    restartSeason,
    finishRemaining,
    close: () => setActiveView(null),
  }
}
