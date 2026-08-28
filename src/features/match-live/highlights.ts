import type { MatchEvent, MatchPhase, MatchReport } from '../../domain/engine'

const MAX_BUILD_UP_PHASES = 6
const HIGHLIGHT_IMPORTANCE = 2

export interface HighlightClip {
  id: string
  headline: MatchEvent
  events: MatchEvent[]
  fromPhase: number
  toPhase: number
  startSecond: number
  endSecond: number
  isGoal: boolean
}

function groupByPhase(events: MatchEvent[]): MatchEvent[][] {
  const groups: MatchEvent[][] = []
  for (const event of events) {
    const last = groups[groups.length - 1]
    if (last !== undefined && event.phaseIndex - last[last.length - 1].phaseIndex <= 1) {
      last.push(event)
      continue
    }
    groups.push([event])
  }
  return groups
}

function buildUpStart(phases: MatchPhase[], anchor: number): number {
  let index = anchor
  while (
    index > 0 &&
    anchor - index < MAX_BUILD_UP_PHASES &&
    phases[index - 1].side === phases[anchor].side
  ) {
    index -= 1
  }
  return index
}

function headlineOf(events: MatchEvent[]): MatchEvent {
  return events.reduce((best, event) => (event.importance > best.importance ? event : best))
}

export function buildClips(report: MatchReport): HighlightClip[] {
  const phases = report.phases
  if (phases.length === 0) return []

  return groupByPhase(
    report.timeline.filter((event) => event.importance >= HIGHLIGHT_IMPORTANCE),
  ).map((events, order) => {
    const anchor = Math.min(phases.length - 1, events[events.length - 1].phaseIndex)
    const fromPhase = buildUpStart(phases, anchor)
    const headline = headlineOf(events)
    return {
      id: `clip-${order}`,
      headline,
      events,
      fromPhase,
      toPhase: anchor,
      startSecond: phases[fromPhase].startSecond,
      endSecond: phases[anchor].endSecond,
      isGoal: events.some((event) => event.kind === 'GOAL' || event.kind === 'PENALTY_GOAL'),
    }
  })
}
