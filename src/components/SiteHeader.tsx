import { BrandLogo } from './BrandLogo'
import { ClubCrest } from './ClubCrest'
import { LocaleSwitch } from './LocaleSwitch'
import { useTranslation } from '../i18n/useTranslation'
import { drawPool } from '../domain/drawPool'
import { MATCHDAY_NUMBERS, completedMatchdayCount } from '../domain/matchdays'
import { usePredictions } from '../state/usePredictions'
import type { Route } from '../hooks/useHashRoute'
import type { Team } from '../domain/types'

interface SiteHeaderProps {
  route: Route
  favouriteTeam: Team | null
  onNavigate: (route: Route) => void
}

const NAV_BASE =
  'flex items-center gap-2 rounded-pill px-4 py-2 font-display text-sm font-bold uppercase tracking-wide transition-all'

function navStyle(isActive: boolean): string {
  return isActive
    ? `${NAV_BASE} bg-accent/15 text-accent ring-1 ring-accent/45`
    : `${NAV_BASE} text-muted hover:bg-surface hover:text-fg`
}

export function SiteHeader({ route, favouriteTeam, onNavigate }: SiteHeaderProps) {
  const { state } = usePredictions()
  const t = useTranslation()
  const isLeagueComplete = completedMatchdayCount(state.predictions) === MATCHDAY_NUMBERS.length

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-4">
        <button
          type="button"
          onClick={() => onNavigate(favouriteTeam === null ? 'picker' : 'league')}
          className="shrink-0 rounded-control transition-opacity hover:opacity-85"
          aria-label={t.layout.home}
        >
          <BrandLogo season={drawPool.meta.season} />
        </button>

        {favouriteTeam === null ? (
          <p className="ml-auto font-display text-sm font-bold uppercase tracking-wide text-accent">
            {t.layout.teamSelection}
          </p>
        ) : (
          <nav className="ml-auto flex items-center gap-2" aria-label={t.layout.mainNavigation}>
            <button
              type="button"
              onClick={() => onNavigate('league')}
              aria-current={route === 'league' ? 'page' : undefined}
              className={navStyle(route === 'league')}
            >
              {t.layout.navLeague}
            </button>
            {isLeagueComplete && (
              <button
                type="button"
                onClick={() => onNavigate('knockout')}
                aria-current={route === 'knockout' ? 'page' : undefined}
                className={navStyle(route === 'knockout')}
              >
                {t.layout.navKnockout}
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('team')}
              aria-current={route === 'team' ? 'page' : undefined}
              className={`${navStyle(route === 'team')} pl-2.5`}
            >
              <ClubCrest team={favouriteTeam} size={24} />
              <span className="hidden xs:inline">{t.layout.navTeam}</span>
            </button>
          </nav>
        )}

        <div className={`shrink-0 ${favouriteTeam === null ? '' : 'ml-1'}`}>
          <LocaleSwitch />
        </div>
      </div>
    </header>
  )
}
