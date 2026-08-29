import rawSquads from '../data/squads-2026-27.json'

export type SquadPosition = 'GK' | 'DF' | 'MF' | 'FW'

export interface SquadPlayer {
  name: string
  position: SquadPosition
  number: number | null
  quality: number
  age: number | null
  source: string
}

export interface SquadRatings {
  attack: number
  midfield: number
  defence: number
  goalkeeping: number
  discipline: number
  depth: number
  squadStrength: number
  strength: number
}

export interface TeamSquad {
  teamId: string
  teamName: string
  engine: SquadRatings
  players: SquadPlayer[]
}

const squadsByTeamId = new Map<string, TeamSquad>(
  (rawSquads.squads as TeamSquad[]).map((squad) => [squad.teamId, squad]),
)

export function findSquad(teamId: string): TeamSquad | null {
  return squadsByTeamId.get(teamId) ?? null
}

export function squadRatings(teamId: string): SquadRatings | null {
  return squadsByTeamId.get(teamId)?.engine ?? null
}
