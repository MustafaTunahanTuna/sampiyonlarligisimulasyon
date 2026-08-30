import { useEffect, useState } from 'react'

export type Route = 'league' | 'team' | 'picker' | 'knockout' | 'settings'

const ROUTE_HASH: Record<Route, string> = {
  league: '#/',
  team: '#/takimim',
  picker: '#/takim-sec',
  knockout: '#/nakavt',
  settings: '#/ayarlar',
}

function currentRoute(): Route {
  if (typeof window === 'undefined') return 'league'
  const { hash } = window.location
  if (hash.startsWith(ROUTE_HASH.team)) return 'team'
  if (hash.startsWith(ROUTE_HASH.picker)) return 'picker'
  if (hash.startsWith(ROUTE_HASH.knockout)) return 'knockout'
  if (hash.startsWith(ROUTE_HASH.settings)) return 'settings'
  return 'league'
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(currentRoute)

  useEffect(() => {
    const syncRoute = () => setRoute(currentRoute())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  const navigate = (next: Route) => {
    if (typeof window === 'undefined') return
    window.location.hash = ROUTE_HASH[next]
    setRoute(next)
  }

  return { route, navigate }
}
