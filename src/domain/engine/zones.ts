import type { ChainAction, Zone } from './types'

export const KICK_OFF_ZONE: Zone = 2

export const ZONE_LABEL: Record<Zone, string> = {
  0: 'Kendi ceza sahası',
  1: 'Kuruluş',
  2: 'Orta saha',
  3: 'Son üçüncü bölge',
  4: 'Ceza sahası',
}

export const ACTION_WEIGHTS: Record<Zone, Record<ChainAction, number>> = {
  0: { PASS: 46, HOLD: 30, DRIBBLE: 6, LONG_BALL: 18, CROSS: 0, SHOOT: 0 },
  1: { PASS: 44, HOLD: 26, DRIBBLE: 10, LONG_BALL: 14, CROSS: 6, SHOOT: 0 },
  2: { PASS: 42, HOLD: 22, DRIBBLE: 14, LONG_BALL: 8, CROSS: 8, SHOOT: 4 },
  3: { PASS: 30, HOLD: 12, DRIBBLE: 14, LONG_BALL: 2, CROSS: 22, SHOOT: 16 },
  4: { PASS: 12, HOLD: 4, DRIBBLE: 10, LONG_BALL: 0, CROSS: 14, SHOOT: 48 },
}

export const ZONE_XG: Record<Zone, number> = {
  0: 0,
  1: 0,
  2: 0.026,
  3: 0.058,
  4: 0.155,
}

export function mirrorZone(zone: Zone): Zone {
  return (4 - zone) as Zone
}

export function advanceZone(zone: Zone, steps: number): Zone {
  return Math.min(4, Math.max(0, zone + steps)) as Zone
}

export function zoneAfterAction(zone: Zone, action: ChainAction): Zone {
  switch (action) {
    case 'PASS':
    case 'DRIBBLE':
      return advanceZone(zone, 1)
    case 'LONG_BALL':
      return advanceZone(zone, 2)
    case 'CROSS':
      return 4
    case 'HOLD':
    case 'SHOOT':
      return zone
  }
}
