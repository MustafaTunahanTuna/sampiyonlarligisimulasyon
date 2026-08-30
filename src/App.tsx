import { DrawIntro } from './components/DrawIntro'
import { SiteHeader } from './components/SiteHeader'
import { StarballBackdrop } from './components/StarballBackdrop'
import { LeagueDashboard } from './features/dashboard/LeagueDashboard'
import { KnockoutStageView } from './features/knockout/KnockoutStageView'
import { SettingsView } from './features/settings/SettingsView'
import { TeamPicker } from './features/team-picker/TeamPicker'
import { TeamDashboard } from './features/team-summary/TeamDashboard'
import { PredictionProvider } from './state/PredictionProvider'
import { drawPool } from './domain/drawPool'
import { formatDateTime } from './i18n/formatters'
import { useLocale } from './i18n/useLocale'
import { useFavouriteTeam } from './hooks/useFavouriteTeam'
import { useHashRoute } from './hooks/useHashRoute'
import type { Team } from './domain/types'

export default function App() {
  const { locale, messages: t } = useLocale()
  const { team, selectTeam, releaseTeam } = useFavouriteTeam()
  const { route, navigate } = useHashRoute()

  const mustPickTeam = team === null
  const isSettings = route === 'settings'
  const isPicking = !isSettings && (mustPickTeam || route === 'picker')
  const isTeamPanel = !isPicking && route === 'team'
  const isKnockout = !isPicking && route === 'knockout'

  const confirmTeam = (next: Team) => {
    selectTeam(next)
    navigate('team')
  }

  const dropTeam = () => {
    releaseTeam()
    navigate('picker')
  }

  return (
    <PredictionProvider>
      <div className="relative min-h-dvh">
        <StarballBackdrop />
        <div className="relative">
          <SiteHeader route={route} favouriteTeam={team} onNavigate={navigate} />
          {(mustPickTeam || route === 'league') && <DrawIntro hasFavouriteTeam={!mustPickTeam} />}

          <main className="mx-auto max-w-5xl px-5 py-12">
            {isSettings ? (
              <SettingsView />
            ) : isPicking ? (
              <TeamPicker
                currentTeam={team}
                onConfirm={confirmTeam}
                onCancel={() => navigate('team')}
                onRelease={dropTeam}
              />
            ) : isKnockout ? (
              <KnockoutStageView
                favouriteTeam={team}
                onBackToLeague={() => navigate('league')}
              />
            ) : isTeamPanel && team !== null ? (
              <TeamDashboard
                team={team}
                onChangeTeam={() => navigate('picker')}
                onReleaseTeam={dropTeam}
                onGoToKnockout={() => navigate('knockout')}
              />
            ) : (
              <LeagueDashboard
                favouriteTeam={team}
                onPickTeam={() => navigate('picker')}
                onOpenTeamPanel={() => navigate('team')}
                onGoToKnockout={() => navigate('knockout')}
              />
            )}
          </main>

          <footer className="mx-auto max-w-5xl border-t border-line px-5 py-8 text-xs text-muted">
            <p>
              {t.layout.footerSourcePrefix}{' '}
              <a href={drawPool.meta.source} className="text-accent underline-offset-4 hover:underline">
                {t.layout.footerSourceLink}
              </a>{' '}
              {t.layout.footerSourceSuffix(formatDateTime(drawPool.meta.scrapedAt, locale))}
            </p>
            <p className="mt-2">{t.layout.footerDisclaimer}</p>
          </footer>
        </div>
      </div>
    </PredictionProvider>
  )
}
