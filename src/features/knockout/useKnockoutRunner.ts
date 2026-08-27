import { buildKnockoutStage, nextPlayableRound, simulateRoundScores } from '../../domain/knockoutStage'
import { predictedStandings } from '../../domain/predictedResults'
import { usePredictions } from '../../state/usePredictions'

export function useKnockoutRunner() {
  const { state, dispatch } = usePredictions()
  const stage = buildKnockoutStage(predictedStandings(state.predictions), state.knockoutScores)
  const playable = nextPlayableRound(stage)

  const playNextRound = () => {
    if (playable === null) return
    dispatch({
      type: 'knockout-round-simulated',
      scores: simulateRoundScores(playable, state.seed, state.unpredictability),
    })
  }

  return { stage, playableRound: playable, playNextRound }
}
