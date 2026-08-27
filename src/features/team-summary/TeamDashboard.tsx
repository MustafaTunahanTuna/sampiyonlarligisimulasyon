import { useState } from 'react'
import { FixtureList } from '../fixtures/FixtureList'
import { DownloadStandingsButton } from '../share/DownloadStandingsButton'
import { DownloadTeamButton } from '../share/DownloadTeamButton'
import { SeasonRunner } from '../matchday/SeasonRunner'
import { StandingsTable } from '../standings/StandingsTable'
import { SeasonSummary } from './SeasonSummary'
import { TeamHeader } from './TeamHeader'
import { fixturesOf, recordOf } from '../../domain/fixtures'
import { leagueStats, playedMatches } from '../../domain/leagueStats'
import { buildKnockoutStage } from '../../domain/knockoutStage'
import { knockoutRunSummary, teamKnockoutRun } from '../../domain/teamKnockoutRun'
import {
  predictedMatchCount,
  predictedStandings,
  withPredictedScores,
} from '../../domain/predictedResults'
import { usePredictions } from '../../state/usePredictions'
import type { Team } from '../../domain/types'

type DashboardTab = 'fixtures' | 'standings'

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'fixtures', label: 'Eşleşmelerim' },
  { id: 'standings', label: 'Puan tablosu' },
]

interface TeamDashboardProps {
  team: Team
  onChangeTeam: () => void
  onReleaseTeam: () => void
  onGoToKnockout: () => void
}

export function TeamDashboard({
  team,
  onChangeTeam,
  onReleaseTeam,
  onGoToKnockout,
}: TeamDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('fixtures')
  const { state } = usePredictions()

  const fixtures = withPredictedScores(fixturesOf(team), state.predictions)
  const record = recordOf(fixtures)
  const standings = predictedStandings(state.predictions)
  const standing = standings.find((row) => row.team.id === team.id)!
  const predictedCount = predictedMatchCount(state.predictions)
  const stats = leagueStats(playedMatches(state.predictions))
  const knockoutStage = buildKnockoutStage(standings, state.knockoutScores)
  const knockoutRun = teamKnockoutRun(team, knockoutStage)
  const knockoutSummary = knockoutRunSummary(team, knockoutStage, knockoutRun)

  return (
    <div key={team.id} className="animate-rise space-y-10">
      <TeamHeader team={team} onChangeTeam={onChangeTeam} onReleaseTeam={onReleaseTeam} />
      <SeasonSummary record={record} totalFixtures={fixtures.length} standing={standing} />
      <SeasonRunner favouriteTeam={team} onGoToKnockout={onGoToKnockout} />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-strong">
        <nav className="flex gap-6" aria-label="Panel bölümleri">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`border-b-2 pb-3 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-fg'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-3 pb-3">
          <DownloadTeamButton
            team={team}
            fixtures={fixtures}
            standing={standing}
            knockoutRun={knockoutRun}
            knockoutSummary={knockoutSummary}
            seed={state.seed}
          />
          <DownloadStandingsButton
            rows={standings}
            stats={stats}
            favouriteTeam={team}
            seed={state.seed}
          />
        </div>
      </div>

      {activeTab === 'fixtures' ? (
        <FixtureList team={team} fixtures={fixtures} />
      ) : (
        <StandingsTable
          rows={standings}
          favouriteTeam={team}
          hasPredictions={predictedCount > 0}
        />
      )}
    </div>
  )
}
