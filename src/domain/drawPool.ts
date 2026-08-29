import rawPool from '../data/league-phase-2026-27.json'
import { squadRatings } from './squads'
import type { DrawPool, Team } from './types'

const rawDrawPool = rawPool as DrawPool

export const drawPool: DrawPool = {
  ...rawDrawPool,
  teams: rawDrawPool.teams.map((team) => {
    const ratings = squadRatings(team.id)
    if (ratings === null) return team
    return { ...team, strength: ratings.strength, strengthSource: 'squad-blend' }
  }),
}

const teamsById = new Map<string, Team>(drawPool.teams.map((team) => [team.id, team]))

export function getTeam(teamId: string): Team {
  const team = teamsById.get(teamId)
  if (!team) throw new Error(`Unknown team id: ${teamId}`)
  return team
}

export function findTeam(teamId: string | null): Team | null {
  return teamId === null ? null : (teamsById.get(teamId) ?? null)
}

export interface TeamSearchOptions {
  localeTag: string
  countryNameOf: (team: Team) => string
}

export function searchTeams(query: string, { localeTag, countryNameOf }: TeamSearchOptions): Team[] {
  const needle = query.trim().toLocaleLowerCase(localeTag)
  if (needle === '') return drawPool.teams
  return drawPool.teams.filter((team) =>
    [team.name, team.officialName, team.code, countryNameOf(team)]
      .join(' ')
      .toLocaleLowerCase(localeTag)
      .includes(needle),
  )
}
