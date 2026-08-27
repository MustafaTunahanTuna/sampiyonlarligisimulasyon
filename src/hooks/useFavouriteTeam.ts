import { useCallback, useState } from 'react'
import { findTeam } from '../domain/drawPool'
import type { Team } from '../domain/types'

const STORAGE_KEY = 'ucl:favourite-team'

function readStoredTeam(): Team | null {
  if (typeof window === 'undefined') return null
  try {
    return findTeam(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function useFavouriteTeam() {
  const [team, setTeam] = useState<Team | null>(readStoredTeam)

  const selectTeam = useCallback((next: Team | null) => {
    setTeam(next)
    try {
      if (next === null) window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, next.id)
    } catch {
      return
    }
  }, [])

  const releaseTeam = useCallback(() => selectTeam(null), [selectTeam])

  return { team, selectTeam, releaseTeam }
}
