import { minuteOf } from './clock'
import { KICK_OFF_ZONE } from './zones'
import type {
  ChainAction,
  EventImportance,
  MatchEvent,
  MatchEventKind,
  MatchPhase,
  PhaseOutcome,
  Side,
  TeamProfile,
  Zone,
} from './types'

export const IMPORTANCE: Record<MatchEventKind, EventImportance> = {
  KICK_OFF: 0,
  GOAL: 3,
  PENALTY_AWARDED: 2,
  PENALTY_GOAL: 3,
  PENALTY_MISSED: 3,
  SHOT_SAVED: 1,
  SHOT_OFF: 1,
  SHOT_BLOCKED: 0,
  POST: 2,
  CORNER: 0,
  YELLOW_CARD: 1,
  RED_CARD: 3,
  HALF_TIME: 1,
  FULL_TIME: 1,
}

export interface ChainConfig {
  profiles: Record<Side, TeamProfile>
  finishingScale: Record<Side, number>
  unpredictability: number
  regulationSeconds: number
  halfTimeSecond: number | null
  kickOffSide: Side
}

export interface ChainResult {
  phases: MatchPhase[]
  events: MatchEvent[]
  goals: Record<Side, number>
  expectedGoals: Record<Side, number>
  penaltyExpectedGoals: Record<Side, number>
  possessionSeconds: Record<Side, number>
  endSecond: number
}

export interface ChainState extends ChainResult {
  side: Side
  zone: Zone
  second: number
  yellows: Record<Side, number>
  profiles: Record<Side, TeamProfile>
  fromCross: boolean
  fromSetPiece: boolean
  halfTimeDone: boolean
  limit: number
}

export function other(side: Side): Side {
  return side === 'home' ? 'away' : 'home'
}

export function createState(config: ChainConfig): ChainState {
  return {
    side: config.kickOffSide,
    zone: KICK_OFF_ZONE,
    second: 0,
    phases: [],
    events: [],
    goals: { home: 0, away: 0 },
    expectedGoals: { home: 0, away: 0 },
    penaltyExpectedGoals: { home: 0, away: 0 },
    possessionSeconds: { home: 0, away: 0 },
    yellows: { home: 0, away: 0 },
    profiles: { ...config.profiles },
    fromCross: false,
    fromSetPiece: false,
    halfTimeDone: config.halfTimeSecond === null,
    limit: config.regulationSeconds,
    endSecond: 0,
  }
}

export interface EventDetail {
  importance?: EventImportance
  xg?: number
}

export function emit(
  state: ChainState,
  kind: MatchEventKind,
  side: Side,
  zone: Zone,
  detail: EventDetail = {},
) {
  state.events.push({
    kind,
    side,
    zone,
    second: state.second,
    minute: minuteOf(state.second),
    importance: detail.importance ?? IMPORTANCE[kind],
    xg: detail.xg ?? null,
    phaseIndex: state.phases.length,
    actor: null,
  })
}

export function pushPhase(
  state: ChainState,
  action: ChainAction,
  outcome: PhaseOutcome,
  fromZone: Zone,
  toZone: Zone,
  duration: number,
) {
  state.phases.push({
    index: state.phases.length,
    side: state.side,
    action,
    outcome,
    fromZone,
    toZone,
    startSecond: state.second,
    endSecond: state.second + duration,
  })
  state.possessionSeconds[state.side] += duration
  state.second += duration
}

export function restartFromKickOff(state: ChainState, conceding: Side) {
  state.side = conceding
  state.zone = KICK_OFF_ZONE
  state.fromCross = false
  state.fromSetPiece = false
}

export function concedePossession(state: ChainState, zone: Zone) {
  state.side = other(state.side)
  state.zone = zone
  state.fromCross = false
  state.fromSetPiece = false
}

export function result(state: ChainState): ChainResult {
  return {
    phases: state.phases,
    events: state.events,
    goals: state.goals,
    expectedGoals: state.expectedGoals,
    penaltyExpectedGoals: state.penaltyExpectedGoals,
    possessionSeconds: state.possessionSeconds,
    endSecond: state.endSecond,
  }
}
