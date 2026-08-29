import { MatchdayModal } from './MatchdayModal'
import { useMatchdayRunner } from './useMatchdayRunner'
import { SimulationControls } from '../simulation/SimulationControls'
import { completedMatchdayCount } from '../../domain/matchdays'
import { predictedStandings } from '../../domain/predictedResults'
import { usePredictions } from '../../state/usePredictions'
import type { Team } from '../../domain/types'

interface SeasonRunnerProps {
  favouriteTeam: Team | null
  onGoToKnockout: () => void
  onViewStandings: () => void
}

export function SeasonRunner({
  favouriteTeam,
  onGoToKnockout,
  onViewStandings,
}: SeasonRunnerProps) {
  const { state } = usePredictions()
  const runner = useMatchdayRunner()
  const completed = completedMatchdayCount(state.predictions)

  const favouriteStanding =
    favouriteTeam === null
      ? null
      : (predictedStandings(state.predictions).find((row) => row.team.id === favouriteTeam.id) ??
        null)

  return (
    <>
      <SimulationControls
        upcomingMatchday={runner.upcomingMatchday}
        completedMatchdays={completed}
        onPlayNext={runner.startNext}
        onFinishAll={runner.finishRemaining}
        onGoToKnockout={onGoToKnockout}
        onReviewMatchday={runner.replayMatchday}
        onReset={runner.restartSeason}
      />

      {runner.activeView !== null && (
        <MatchdayModal
          key={`${runner.activeView.matchday}-${runner.activeView.mode}`}
          matchday={runner.activeView.matchday}
          predictions={state.predictions}
          favouriteTeam={favouriteTeam}
          favouriteStanding={favouriteStanding}
          completedCount={completed}
          isReview={runner.activeView.mode === 'review'}
          hasNext={runner.upcomingMatchday !== null}
          onNext={runner.startNext}
          onViewStandings={() => {
            runner.close()
            onViewStandings()
          }}
          onFinishAll={runner.finishRemaining}
          onClose={runner.close}
        />
      )}
    </>
  )
}
