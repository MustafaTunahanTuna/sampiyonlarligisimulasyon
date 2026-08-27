import { DrawIntro } from './components/DrawIntro'
import { SiteHeader } from './components/SiteHeader'
import { StarballBackdrop } from './components/StarballBackdrop'
import { LeagueDashboard } from './features/dashboard/LeagueDashboard'
import { TeamPicker } from './features/team-picker/TeamPicker'
import { TeamDashboard } from './features/team-summary/TeamDashboard'
import { PredictionProvider } from './state/PredictionProvider'
import { drawPool } from './domain/drawPool'
import { useFavouriteTeam } from './hooks/useFavouriteTeam'
import { useHashRoute } from './hooks/useHashRoute'
import type { Team } from './domain/types'

const SCRAPED_AT_FORMAT = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function App() {
  const { team, selectTeam, releaseTeam } = useFavouriteTeam()
  const { route, navigate } = useHashRoute()

  const mustPickTeam = team === null
  const isPicking = mustPickTeam || route === 'picker'
  const isTeamPanel = !isPicking && route === 'team'

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
            {isPicking ? (
              <TeamPicker
                currentTeam={team}
                onConfirm={confirmTeam}
                onCancel={() => navigate('team')}
                onRelease={dropTeam}
              />
            ) : isTeamPanel && team !== null ? (
              <TeamDashboard
                team={team}
                onChangeTeam={() => navigate('picker')}
                onReleaseTeam={dropTeam}
              />
            ) : (
              <LeagueDashboard
                favouriteTeam={team}
                onPickTeam={() => navigate('picker')}
                onOpenTeamPanel={() => navigate('team')}
              />
            )}
          </main>

          <footer className="mx-auto max-w-5xl border-t border-line px-5 py-8 text-xs text-muted">
            <p>
              Veri kaynağı:{' '}
              <a href={drawPool.meta.source} className="text-accent underline-offset-4 hover:underline">
                uefa.com kura merkezi
              </a>{' '}
              — {SCRAPED_AT_FORMAT.format(new Date(drawPool.meta.scrapedAt))} tarihinde çekildi.
              Puan tablosu ve istatistikler senin tahminlerinden hesaplanır.
            </p>
            <p className="mt-2">
              Resmî olmayan, hayran yapımı bir uygulama. Kulüp armaları ilgili kulüplere aittir.
            </p>
          </footer>
        </div>
      </div>
    </PredictionProvider>
  )
}
