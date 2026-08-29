import { FavouriteTeamStrip } from './FavouriteTeamStrip'
import { GettingStarted } from './GettingStarted'
import { HighlightMatches } from './HighlightMatches'
import { PlayerRankingList } from './PlayerRankingList'
import { RankingList } from './RankingList'
import { StatTiles } from './StatTiles'
import { SeasonRunner } from '../matchday/SeasonRunner'
import { StandingsTable } from '../standings/StandingsTable'
import { scrollToStandings } from '../standings/standingsAnchor'
import { DownloadStandingsButton } from '../share/DownloadStandingsButton'
import { PickTeamCallout } from './PickTeamCallout'
import {
  bestDefences,
  biggestOverperformers,
  leagueStats,
  playedMatches,
  topScorers,
} from '../../domain/leagueStats'
import { topAssistProviders, topGoalscorers } from '../../domain/playerStats'
import { predictedStandings } from '../../domain/predictedResults'
import { useTranslation } from '../../i18n/useTranslation'
import { usePlayerTallies } from './usePlayerTallies'
import { usePredictions } from '../../state/usePredictions'
import type { Team } from '../../domain/types'

interface LeagueDashboardProps {
  favouriteTeam: Team | null
  onPickTeam: () => void
  onOpenTeamPanel: () => void
  onGoToKnockout: () => void
}

export function LeagueDashboard({
  favouriteTeam,
  onPickTeam,
  onOpenTeamPanel,
  onGoToKnockout,
}: LeagueDashboardProps) {
  const { state } = usePredictions()
  const t = useTranslation()
  const tallies = usePlayerTallies()
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

      <SeasonRunner
        favouriteTeam={favouriteTeam}
        onGoToKnockout={onGoToKnockout}
        onViewStandings={scrollToStandings}
      />

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
              <DownloadStandingsButton
                rows={standings}
                stats={stats}
                favouriteTeam={favouriteTeam}
                seed={state.seed}
              />
            }
          />
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-3">
            <RankingList
              title={t.dashboard.topScorers}
              rankings={topScorers(standings)}
              formatValue={(value) => String(value)}
              favouriteTeamId={favouriteTeam?.id ?? null}
            />
            <RankingList
              title={t.dashboard.bestDefences}
              rankings={bestDefences(standings)}
              formatValue={(value) => String(value)}
              favouriteTeamId={favouriteTeam?.id ?? null}
            />
            <RankingList
              title={t.dashboard.overperformers}
              rankings={biggestOverperformers(standings)}
              formatValue={(value) => (value > 0 ? `+${value}` : String(value))}
              favouriteTeamId={favouriteTeam?.id ?? null}
            />
          </div>
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
            <PlayerRankingList
              title={t.dashboard.topGoalscorers}
              players={topGoalscorers(tallies)}
              primaryValue={(tally) => tally.goals}
              secondaryText={(tally) => t.dashboard.playerAssists(tally.assists)}
              favouriteTeamId={favouriteTeam?.id ?? null}
              emptyText={t.dashboard.playerStatsEmpty}
            />
            <PlayerRankingList
              title={t.dashboard.topAssistProviders}
              players={topAssistProviders(tallies)}
              primaryValue={(tally) => tally.assists}
              secondaryText={(tally) => t.dashboard.playerGoals(tally.goals)}
              favouriteTeamId={favouriteTeam?.id ?? null}
              emptyText={t.dashboard.playerStatsEmpty}
            />
          </div>
        </>
      ) : (
        <GettingStarted />
      )}
    </div>
  )
}
