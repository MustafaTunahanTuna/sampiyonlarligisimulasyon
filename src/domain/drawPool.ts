import rawPool from '../data/league-phase-2026-27.json'
import type { DrawPool, Team } from './types'

export const drawPool = rawPool as DrawPool

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
