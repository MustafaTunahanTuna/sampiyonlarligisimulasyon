import { FavouriteTeamStrip } from './FavouriteTeamStrip'
import { GettingStarted } from './GettingStarted'
import { HighlightMatches } from './HighlightMatches'
import { RankingList } from './RankingList'
import { StatTiles } from './StatTiles'
import { SimulationControls } from '../simulation/SimulationControls'
import { StandingsTable } from '../standings/StandingsTable'
import { ShareStandingsButton } from '../share/ShareStandingsButton'
import { PickTeamCallout } from './PickTeamCallout'
import {
  bestDefences,
  biggestOverperformers,
  leagueStats,
  playedMatches,
  topScorers,
} from '../../domain/leagueStats'
import { predictedStandings } from '../../domain/predictedResults'
import { usePredictions } from '../../state/usePredictions'
import type { Team } from '../../domain/types'

interface LeagueDashboardProps {
  favouriteTeam: Team | null
  onPickTeam: () => void
  onOpenTeamPanel: () => void
}

export function LeagueDashboard({
  favouriteTeam,
  onPickTeam,
  onOpenTeamPanel,
}: LeagueDashboardProps) {
  const { state } = usePredictions()
  const matches = playedMatches(state.predictions)
  const stats = leagueStats(matches)
  const standings = predictedStandings(state.predictions)
  const hasPredictions = stats.playedCount > 0
  const favouriteStanding =
    favouriteTeam === null ? null : standings.find((row) => row.team.id === favouriteTeam.id)!

  return (
    <div className="space-y-12">
      {favouriteStanding === null ? (
        <PickTeamCallout onPickTeam={onPickTeam} />
      ) : (
        <FavouriteTeamStrip
          standing={favouriteStanding}
          hasPredictions={hasPredictions}
          onOpenTeam={onOpenTeamPanel}
          onChangeTeam={onPickTeam}
        />
      )}

      <SimulationControls predictedCount={stats.playedCount} />

      {hasPredictions ? (
        <>
          <StatTiles stats={stats} />
          <HighlightMatches
            biggestWin={stats.biggestWin}
            highestScoring={stats.highestScoring}
          />
          <StandingsTable
            rows={standings}
            favouriteTeam={favouriteTeam}
            hasPredictions={hasPredictions}
            shareAction={
              <ShareStandingsButton
                rows={standings}
                stats={stats}
                favouriteTeam={favouriteTeam}
                seed={state.seed}
              />
            }
          />
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-3">
            <RankingList
              title="En çok gol atan"
              rankings={topScorers(standings)}
              formatValue={(value) => String(value)}
              favouriteTeamId={favouriteTeam?.id ?? null}
            />
            <RankingList
              title="En az gol yiyen"
              rankings={bestDefences(standings)}
              formatValue={(value) => String(value)}
              favouriteTeamId={favouriteTeam?.id ?? null}
            />
            <RankingList
              title="Sürpriz yapanlar"
              rankings={biggestOverperformers(standings)}
              formatValue={(value) => (value > 0 ? `+${value}` : String(value))}
              favouriteTeamId={favouriteTeam?.id ?? null}
            />
          </div>
        </>
      ) : (
        <GettingStarted />
      )}
    </div>
  )
}
