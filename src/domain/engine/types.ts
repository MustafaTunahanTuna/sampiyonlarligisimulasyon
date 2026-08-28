import type { Score } from '../types'

export type Zone = 0 | 1 | 2 | 3 | 4

export type Side = 'home' | 'away'

export type ChainAction = 'PASS' | 'HOLD' | 'DRIBBLE' | 'LONG_BALL' | 'CROSS' | 'SHOOT'

export type PhaseOutcome = 'ADVANCE' | 'RETAIN' | 'TURNOVER' | 'SHOT' | 'FOUL' | 'RESTART'

export type MatchEventKind =
  | 'KICK_OFF'
  | 'GOAL'
  | 'PENALTY_AWARDED'
  | 'PENALTY_GOAL'
  | 'PENALTY_MISSED'
  | 'SHOT_SAVED'
  | 'SHOT_OFF'
  | 'SHOT_BLOCKED'
  | 'POST'
  | 'CORNER'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'HALF_TIME'
  | 'FULL_TIME'

export type EventImportance = 0 | 1 | 2 | 3

export interface TeamProfile {
  attack: number
  midfield: number
  defence: number
  goalkeeping: number
  discipline: number
  tempo: number
}

export interface MatchPhase {
  index: number
  side: Side
  action: ChainAction
  outcome: PhaseOutcome
  fromZone: Zone
  toZone: Zone
  startSecond: number
  endSecond: number
}

export interface MatchEvent {
  kind: MatchEventKind
  side: Side
  zone: Zone
  second: number
  minute: number
  importance: EventImportance
  xg: number | null
  phaseIndex: number
  actor: string | null
}

export interface SideStats {
  goals: number
  shots: number
  shotsOnTarget: number
  shotsBlocked: number
  corners: number
  yellowCards: number
  redCards: number
  expectedGoals: number
  possession: number
}

export interface MatchStats {
  home: SideStats
  away: SideStats
}

export interface MatchReport {
  homeTeamId: string
  awayTeamId: string
  score: Score
  durationSeconds: number
  timeline: MatchEvent[]
  phases: MatchPhase[]
  stats: MatchStats
}

export interface MatchSimulationOptions {
  durationMinutes: number
  halfTimeMinute: number | null
  goalScale: number
}
