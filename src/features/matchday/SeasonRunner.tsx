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
}

export function SeasonRunner({ favouriteTeam, onGoToKnockout }: SeasonRunnerProps) {
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
        onReset={runner.restartSeason}
      />

      {runner.activeMatchday !== null && (
        <MatchdayModal
          key={runner.activeMatchday}
          matchday={runner.activeMatchday}
          predictions={state.predictions}
          favouriteTeam={favouriteTeam}
          favouriteStanding={favouriteStanding}
          completedCount={completed}
          hasNext={runner.upcomingMatchday !== null}
          onNext={runner.startNext}
          onGoToKnockout={() => {
            runner.close()
            onGoToKnockout()
          }}
          onFinishAll={runner.finishRemaining}
          onClose={runner.close}
        />
      )}
    </>
  )
}
