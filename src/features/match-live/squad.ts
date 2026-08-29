import type { ChainAction, Zone } from '../../domain/engine'

export const KEEPER_SLOT = 0
export const SHIRT_NUMBER = [1, 2, 5, 6, 3, 4, 8, 7, 11, 9, 10]

type Role = 'GK' | 'DF' | 'MF' | 'FW'

const SLOT_ROLE: Role[] = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW']

const SLOTS = SHIRT_NUMBER.map((_, slot) => slot)
const DEFENDERS = [1, 2, 3, 4]
const MIDFIELDERS = [5, 6, 7]
const FORWARDS = [8, 9, 10]
const CENTRAL_FORWARDS = [9, 8, 10]

const ZONE_ROLES: Record<Zone, Role[]> = {
  0: ['GK', 'DF', 'MF'],
  1: ['GK', 'DF', 'MF'],
  2: ['DF', 'MF', 'FW'],
  3: ['MF', 'FW'],
  4: ['MF', 'FW'],
}

const NEAREST_POOL = 3

export type SlotDistance = (slot: number) => number

export type OnPitch = ReadonlySet<number>

export const FULL_SQUAD: OnPitch = new Set(SLOTS)

export function outfieldSlots(): number[] {
  return SLOTS.filter((slot) => slot !== KEEPER_SLOT)
}

export function allowedInZone(slot: number, zone: Zone): boolean {
  return ZONE_ROLES[zone].includes(SLOT_ROLE[slot])
}

function nearestOf(candidates: number[], distanceTo: SlotDistance, seed: number): number {
  const ranked = [...candidates].sort((left, right) => distanceTo(left) - distanceTo(right))
  const pool = ranked.slice(0, Math.min(NEAREST_POOL, ranked.length))
  return pool[Math.abs(seed) % pool.length]
}

function passOptions(carrier: number): number[] {
  switch (SLOT_ROLE[carrier]) {
    case 'GK':
      return [...DEFENDERS, ...MIDFIELDERS]
    case 'DF':
      return [...MIDFIELDERS, ...DEFENDERS]
    case 'MF':
      return [...FORWARDS, ...MIDFIELDERS]
    case 'FW':
      return [...FORWARDS, ...MIDFIELDERS]
  }
}

function holdOptions(carrier: number): number[] {
  switch (SLOT_ROLE[carrier]) {
    case 'GK':
      return DEFENDERS
    case 'DF':
      return [KEEPER_SLOT, ...DEFENDERS, ...MIDFIELDERS]
    case 'MF':
      return [...DEFENDERS, ...MIDFIELDERS]
    case 'FW':
      return [...MIDFIELDERS, ...FORWARDS]
  }
}

function optionsFor(action: ChainAction, carrier: number): number[] {
  switch (action) {
    case 'PASS':
      return passOptions(carrier)
    case 'HOLD':
      return holdOptions(carrier)
    case 'LONG_BALL':
      return FORWARDS
    case 'CROSS':
      return CENTRAL_FORWARDS
    case 'DRIBBLE':
    case 'SHOOT':
      return passOptions(carrier)
  }
}

function fallbackFor(
  zone: Zone,
  distanceTo: SlotDistance,
  seed: number,
  onPitch: OnPitch,
): number {
  const present = SLOTS.filter((slot) => onPitch.has(slot))
  const allowed = present.filter((slot) => allowedInZone(slot, zone))
  return nearestOf(allowed.length === 0 ? present : allowed, distanceTo, seed)
}

export function carrierInZone(
  carrier: number,
  zone: Zone,
  distanceTo: SlotDistance,
  onPitch: OnPitch,
): number {
  return onPitch.has(carrier) && allowedInZone(carrier, zone)
    ? carrier
    : fallbackFor(zone, distanceTo, 0, onPitch)
}

export function receiverFor(
  action: ChainAction,
  carrier: number,
  targetZone: Zone,
  seed: number,
  distanceTo: SlotDistance,
  onPitch: OnPitch,
): number {
  if (action === 'SHOOT') return carrier
  if (action === 'DRIBBLE' && allowedInZone(carrier, targetZone)) return carrier

  const candidates = optionsFor(action, carrier).filter(
    (slot) => slot !== carrier && onPitch.has(slot) && allowedInZone(slot, targetZone),
  )
  return candidates.length === 0
    ? fallbackFor(targetZone, distanceTo, seed, onPitch)
    : nearestOf(candidates, distanceTo, seed)
}

export function runnerFor(
  carrier: number,
  receiver: number,
  seed: number,
  onPitch: OnPitch,
): number {
  const candidates = [...FORWARDS, ...MIDFIELDERS].filter(
    (slot) => slot !== carrier && slot !== receiver && onPitch.has(slot),
  )
  return candidates.length === 0
    ? receiver
    : candidates[Math.abs(seed) % candidates.length]
}

export function kickOffCarrier(): number {
  return 6
}
