import type { RandomSource } from '../random'
import { actionSuccessChance, chooseAction } from './actions'
import {
  IMPORTANCE,
  concedePossession,
  createState,
  emit,
  other,
  pushPhase,
  restartFromKickOff,
  result,
} from './chainState'
import type { ChainConfig, ChainState } from './chainState'
import type { Side } from './types'
import { addedTimeSeconds, phaseDuration } from './clock'
import { rollFoul } from './discipline'
import { pickAssist, pickOffender, pickScorer } from './lineup'
import { PENALTY_CONVERSION, penaltyConverted, resolveShot, shotQuality } from './shot'
import { weakenedProfile } from './teamProfile'
import { mirrorZone, zoneAfterAction } from './zones'
import type { ChainResult } from './chainState'

const RED_CARD_PENALTY = 12
const CORNER_FROM_BLOCK = 0.4
const CORNER_FROM_SAVE = 0.32
const CORNER_FROM_CROSS = 0.24
const SET_PIECE_DURATION = 24
const ASSUMED_SUBSTITUTIONS = 5
const BIG_CHANCE_XG = 0.2

function offenderName(state: ChainState, side: Side): string | null {
  const lineup = state.lineups[side]
  return lineup === null ? null : pickOffender(lineup, state.actorRandom).name
}

function applyCard(state: ChainState, card: 'YELLOW' | 'RED') {
  const punished = other(state.side)
  emit(state, card === 'YELLOW' ? 'YELLOW_CARD' : 'RED_CARD', punished, state.zone, {
    actor: offenderName(state, punished),
  })
  if (card === 'YELLOW') {
    state.yellows[punished] += 1
    return
  }
  state.profiles[punished] = weakenedProfile(state.profiles[punished], RED_CARD_PENALTY)
}

function resolvePenalty(state: ChainState, random: RandomSource) {
  const attacking = state.side
  const taker = state.lineups[attacking]?.penaltyTaker.name ?? null
  state.penaltyExpectedGoals[attacking] += PENALTY_CONVERSION
  emit(state, 'PENALTY_AWARDED', attacking, 4, { actor: taker })
  if (penaltyConverted(state.profiles[other(attacking)], random)) {
    state.goals[attacking] += 1
    emit(state, 'PENALTY_GOAL', attacking, 4, { xg: PENALTY_CONVERSION, actor: taker })
    pushPhase(state, 'SHOOT', 'SHOT', 4, 4, SET_PIECE_DURATION)
    restartFromKickOff(state, other(attacking))
    return
  }
  emit(state, 'PENALTY_MISSED', attacking, 4, { xg: PENALTY_CONVERSION, actor: taker })
  pushPhase(state, 'SHOOT', 'SHOT', 4, 4, SET_PIECE_DURATION)
  concedePossession(state, 0)
}

function resolveFoul(state: ChainState, random: RandomSource): boolean {
  const defending = other(state.side)
  const foul = rollFoul(state.zone, state.profiles[defending], state.yellows[defending], random)
  if (!foul.conceded) return false

  if (foul.card !== null) applyCard(state, foul.card)
  if (foul.penalty) {
    resolvePenalty(state, random)
    return true
  }

  const zone = state.zone
  pushPhase(state, 'HOLD', 'FOUL', zone, zone, SET_PIECE_DURATION)
  state.fromSetPiece = true
  state.fromCross = false
  return true
}

function awardCorner(state: ChainState) {
  emit(state, 'CORNER', state.side, 4)
  state.zone = 4
  state.fromSetPiece = true
  state.fromCross = false
}

function resolveShotAttempt(state: ChainState, config: ChainConfig, random: RandomSource) {
  const attacking = state.side
  const defending = other(attacking)
  const zone = state.zone
  const quality = shotQuality(
    { zone, fromCross: state.fromCross, fromSetPiece: state.fromSetPiece },
    state.profiles[attacking],
    state.profiles[defending],
    config.unpredictability,
  )
  state.expectedGoals[attacking] += quality
  const result = resolveShot(quality, config.finishingScale[attacking], state.profiles[defending], random)
  const missedBigChance =
    quality >= BIG_CHANCE_XG && (result === 'SHOT_SAVED' || result === 'SHOT_OFF')
  const lineup = state.lineups[attacking]
  const shooter = lineup === null ? null : pickScorer(lineup, zone, state.actorRandom)
  const assist =
    lineup === null || shooter === null || result !== 'GOAL'
      ? null
      : pickAssist(lineup, shooter, state.actorRandom)
  emit(state, result, attacking, zone, {
    importance: missedBigChance ? 2 : IMPORTANCE[result],
    xg: quality,
    actor: shooter?.name ?? null,
    assist: assist?.name ?? null,
  })
  pushPhase(state, 'SHOOT', 'SHOT', zone, zone, SET_PIECE_DURATION)

  if (result === 'GOAL') {
    state.goals[attacking] += 1
    restartFromKickOff(state, defending)
    return
  }
  if (result === 'SHOT_BLOCKED' && random() < CORNER_FROM_BLOCK) return awardCorner(state)
  if (result === 'SHOT_SAVED' && random() < CORNER_FROM_SAVE) return awardCorner(state)
  concedePossession(state, result === 'SHOT_BLOCKED' ? 1 : 0)
}

function resolveMovement(state: ChainState, config: ChainConfig, random: RandomSource) {
  const attacking = state.side
  const defending = other(attacking)
  const action = chooseAction(state.zone, state.profiles[attacking], random)
  if (action === 'SHOOT') return resolveShotAttempt(state, config, random)

  const fromZone = state.zone
  const duration = phaseDuration(state.profiles[attacking], state.profiles[defending], random)
  const succeeded =
    random() < actionSuccessChance(action, state.profiles[attacking], state.profiles[defending], config.unpredictability)

  if (!succeeded) {
    pushPhase(state, action, 'TURNOVER', fromZone, fromZone, duration)
    if (action === 'CROSS' && random() < CORNER_FROM_CROSS) return awardCorner(state)
    return concedePossession(state, mirrorZone(fromZone))
  }

  const toZone = zoneAfterAction(fromZone, action)
  pushPhase(state, action, toZone === fromZone ? 'RETAIN' : 'ADVANCE', fromZone, toZone, duration)
  state.zone = toZone
  state.fromCross = action === 'CROSS'
  state.fromSetPiece = false
}

function totalCards(state: ChainState): number {
  return state.events.filter(
    (event) => event.kind === 'YELLOW_CARD' || event.kind === 'RED_CARD',
  ).length
}

function totalGoals(state: ChainState): number {
  return state.goals.home + state.goals.away
}

export function runChain(config: ChainConfig, random: RandomSource): ChainResult {
  const state = createState(config)
  emit(state, 'KICK_OFF', state.side, state.zone)

  let extended = false
  while (true) {
    if (state.second >= state.limit) {
      if (extended) break
      extended = true
      state.limit += addedTimeSeconds(
        totalGoals(state),
        totalCards(state),
        ASSUMED_SUBSTITUTIONS,
        random,
      )
      continue
    }
    if (!state.halfTimeDone && config.halfTimeSecond !== null && state.second >= config.halfTimeSecond) {
      state.halfTimeDone = true
      emit(state, 'HALF_TIME', state.side, state.zone)
      restartFromKickOff(state, other(config.kickOffSide))
      continue
    }
    if (resolveFoul(state, random)) continue
    resolveMovement(state, config, random)
  }

  state.endSecond = state.second
  emit(state, 'FULL_TIME', 'home', state.zone)
  return result(state)
}
