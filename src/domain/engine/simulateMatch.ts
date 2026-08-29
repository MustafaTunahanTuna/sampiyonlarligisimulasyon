import { createRandom, hashSeed } from '../random'
import { expectedGoals } from '../simulation'
import type { Team } from '../types'
import { runChain } from './chain'
import type { ChainConfig } from './chainState'
import { finishingScale } from './calibration'
import { buildStats } from './stats'
import { selectLineup } from './lineup'
import { homeProfile, teamProfile } from './teamProfile'
import type { MatchReport, MatchSimulationOptions, Side } from './types'

export const ENGINE_VERSION = 1

const PROBE_RUNS = 8
const HOME_ADVANTAGE = 4

const FULL_MATCH: MatchSimulationOptions = {
  durationMinutes: 90,
  halfTimeMinute: 45,
  goalScale: 1,
}

const NEUTRAL_SCALE: Record<Side, number> = { home: 0, away: 0 }
const NO_LINEUPS: Record<Side, null> = { home: null, away: null }

function withDefaults(options: Partial<MatchSimulationOptions>): MatchSimulationOptions {
  return { ...FULL_MATCH, ...options }
}

function baseConfig(
  home: Team,
  away: Team,
  unpredictability: number,
  options: MatchSimulationOptions,
): Omit<ChainConfig, 'finishingScale'> {
  const homeSide = options.profiles?.home ?? teamProfile(home)
  const awaySide = options.profiles?.away ?? teamProfile(away)
  return {
    profiles: { home: homeProfile(homeSide, HOME_ADVANTAGE), away: awaySide },
    lineups: NO_LINEUPS,
    actorRandom: createRandom(0),
    unpredictability,
    regulationSeconds: options.durationMinutes * 60,
    halfTimeSecond: options.halfTimeMinute === null ? null : options.halfTimeMinute * 60,
    kickOffSide: 'home',
  }
}

function targetGoals(
  home: Team,
  away: Team,
  unpredictability: number,
  options: MatchSimulationOptions,
): Record<Side, number> {
  const odds = expectedGoals(home, away, unpredictability)
  const share = (options.durationMinutes / FULL_MATCH.durationMinutes) * options.goalScale
  return {
    home: odds.expectedHomeGoals * share,
    away: odds.expectedAwayGoals * share,
  }
}

interface ProbeAverage {
  expectedGoals: Record<Side, number>
  penaltyExpectedGoals: Record<Side, number>
}

function probeAverage(
  shared: Omit<ChainConfig, 'finishingScale'>,
  finishingScale: Record<Side, number>,
  seedKey: string,
): ProbeAverage {
  const totals: ProbeAverage = {
    expectedGoals: { home: 0, away: 0 },
    penaltyExpectedGoals: { home: 0, away: 0 },
  }
  for (let run = 0; run < PROBE_RUNS; run += 1) {
    const probe = runChain({ ...shared, finishingScale }, createRandom(hashSeed(`${seedKey}:${run}`)))
    totals.expectedGoals.home += probe.expectedGoals.home / PROBE_RUNS
    totals.expectedGoals.away += probe.expectedGoals.away / PROBE_RUNS
    totals.penaltyExpectedGoals.home += probe.penaltyExpectedGoals.home / PROBE_RUNS
    totals.penaltyExpectedGoals.away += probe.penaltyExpectedGoals.away / PROBE_RUNS
  }
  return totals
}

function scaleFrom(target: Record<Side, number>, probe: ProbeAverage): Record<Side, number> {
  const openPlayTarget =
    target.home - probe.penaltyExpectedGoals.home + (target.away - probe.penaltyExpectedGoals.away)
  const probedExpectedGoals = probe.expectedGoals.home + probe.expectedGoals.away
  const shared = finishingScale(openPlayTarget, probedExpectedGoals)
  return { home: shared, away: shared }
}

export function simulateMatchReport(
  home: Team,
  away: Team,
  seedKey: string,
  unpredictability: number,
  options: Partial<MatchSimulationOptions> = {},
): MatchReport {
  const resolved = withDefaults(options)
  const shared = baseConfig(home, away, unpredictability, resolved)

  const target = targetGoals(home, away, unpredictability, resolved)
  const rough = probeAverage(shared, NEUTRAL_SCALE, `${seedKey}:probe`)
  const refined = probeAverage(shared, scaleFrom(target, rough), `${seedKey}:refine`)
  const played = runChain(
    {
      ...shared,
      finishingScale: scaleFrom(target, refined),
      lineups: {
        home: selectLineup(home.id, seedKey),
        away: selectLineup(away.id, seedKey),
      },
      actorRandom: createRandom(hashSeed(`${seedKey}:actors`)),
    },
    createRandom(hashSeed(`${seedKey}:play`)),
  )

  return {
    homeTeamId: home.id,
    awayTeamId: away.id,
    score: { home: played.goals.home, away: played.goals.away },
    durationSeconds: played.endSecond,
    timeline: played.events,
    phases: played.phases,
    stats: buildStats(played.events, played.possessionSeconds),
  }
}
