import type { MatchEvent, MatchStats, Side, SideStats } from './types'

const SHOT_KINDS = new Set([
  'GOAL',
  'PENALTY_GOAL',
  'PENALTY_MISSED',
  'SHOT_SAVED',
  'SHOT_OFF',
  'SHOT_BLOCKED',
  'POST',
])

const ON_TARGET_KINDS = new Set(['GOAL', 'PENALTY_GOAL', 'PENALTY_MISSED', 'SHOT_SAVED'])

function emptySideStats(possession: number): SideStats {
  return {
    goals: 0,
    shots: 0,
    shotsOnTarget: 0,
    shotsBlocked: 0,
    corners: 0,
    yellowCards: 0,
    redCards: 0,
    expectedGoals: 0,
    possession,
  }
}

function countInto(row: SideStats, event: MatchEvent) {
  if (SHOT_KINDS.has(event.kind)) row.shots += 1
  if (event.xg !== null) row.expectedGoals += event.xg
  if (ON_TARGET_KINDS.has(event.kind)) row.shotsOnTarget += 1
  switch (event.kind) {
    case 'GOAL':
    case 'PENALTY_GOAL':
      row.goals += 1
      return
    case 'SHOT_BLOCKED':
      row.shotsBlocked += 1
      return
    case 'CORNER':
      row.corners += 1
      return
    case 'YELLOW_CARD':
      row.yellowCards += 1
      return
    case 'RED_CARD':
      row.redCards += 1
      return
    default:
      return
  }
}

export function buildStats(
  events: MatchEvent[],
  possessionSeconds: Record<Side, number>,
): MatchStats {
  const total = Math.max(1, possessionSeconds.home + possessionSeconds.away)
  const stats: MatchStats = {
    home: emptySideStats((possessionSeconds.home / total) * 100),
    away: emptySideStats((possessionSeconds.away / total) * 100),
  }
  for (const event of events) countInto(stats[event.side], event)
  return stats
}
