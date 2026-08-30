import { arch, easeInOut, easeOutStrong, lerpPoint, pitchDistance } from './geometry'
import { KEEPER_SLOT } from './squad'
import type { OnPitch } from './squad'
import type { Point } from './geometry'
import type { Side } from '../../domain/engine'

const SCORER_RUN = 0.16
const SCORER_CURVE = 0.055
const MATE_COUNT = 2
const MATE_PULL = 0.6
const MATE_RING = 0.034
const DEJECTED_DRIFT = 0.028

export interface CelebrationCast {
  attackers: Point[]
  defenders: Point[]
  scorer: number
  side: Side
  attackersOnPitch: OnPitch
  defendersOnPitch: OnPitch
}

function retreatSign(side: Side): number {
  return side === 'home' ? -1 : 1
}

function nearestMates(cast: CelebrationCast, origin: Point): number[] {
  return cast.attackers
    .map((point, slot) => ({ slot, gap: pitchDistance(point, origin) }))
    .filter(
      ({ slot }) => slot !== cast.scorer && slot !== KEEPER_SLOT && cast.attackersOnPitch.has(slot),
    )
    .sort((left, right) => left.gap - right.gap)
    .slice(0, MATE_COUNT)
    .map(({ slot }) => slot)
}

export function applyCelebration(cast: CelebrationCast, progress: number): Point {
  const origin = cast.attackers[cast.scorer]
  const surge = easeOutStrong(progress)
  const scorer = {
    x: origin.x + retreatSign(cast.side) * SCORER_RUN * surge,
    y: origin.y + (origin.y < 0.5 ? 1 : -1) * SCORER_CURVE * arch(progress),
  }
  cast.attackers[cast.scorer] = scorer

  nearestMates(cast, origin).forEach((slot, order) => {
    const angle = order * 2.4 + cast.scorer
    const spot = {
      x: scorer.x + Math.cos(angle) * MATE_RING,
      y: scorer.y + Math.sin(angle) * MATE_RING,
    }
    cast.attackers[slot] = lerpPoint(cast.attackers[slot], spot, MATE_PULL * easeInOut(progress))
  })

  cast.defenders.forEach((point, slot) => {
    if (slot === KEEPER_SLOT || !cast.defendersOnPitch.has(slot)) return
    cast.defenders[slot] = {
      x: point.x + retreatSign(cast.side) * DEJECTED_DRIFT * progress,
      y: point.y,
    }
  })

  return scorer
}
