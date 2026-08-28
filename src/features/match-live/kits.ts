import { hashSeed } from '../../domain/random'

const TURF_HUE_START = 88
const TURF_HUE_END = 168
const TURF_HUE_SHIFT = 130
const MIN_SEPARATION = 72
const OUTFIELD_LIGHTNESS = 63
const KEEPER_LIGHTNESS = 84
const SATURATION = 74

export interface Kit {
  outfield: string
  keeper: string
  ink: string
}

export interface MatchKits {
  home: Kit
  away: Kit
}

function awayFromTurf(hue: number): number {
  return hue >= TURF_HUE_START && hue <= TURF_HUE_END ? (hue + TURF_HUE_SHIFT) % 360 : hue
}

function hueFor(teamId: string): number {
  return awayFromTurf(hashSeed(teamId) % 360)
}

function separation(left: number, right: number): number {
  const delta = Math.abs(left - right) % 360
  return Math.min(delta, 360 - delta)
}

function kitOf(hue: number): Kit {
  return {
    outfield: `hsl(${hue} ${SATURATION}% ${OUTFIELD_LIGHTNESS}%)`,
    keeper: `hsl(${hue} ${SATURATION - 20}% ${KEEPER_LIGHTNESS}%)`,
    ink: 'rgba(8, 14, 24, 0.88)',
  }
}

function usable(hue: number, homeHue: number): boolean {
  return (
    (hue < TURF_HUE_START || hue > TURF_HUE_END) && separation(homeHue, hue) >= MIN_SEPARATION
  )
}

function awayHueFor(homeHue: number, candidate: number): number {
  if (usable(candidate, homeHue)) return candidate
  for (let offset = MIN_SEPARATION; offset < 360; offset += 10) {
    const shifted = (candidate + offset) % 360
    if (usable(shifted, homeHue)) return shifted
  }
  return (homeHue + 180) % 360
}

export function matchKits(homeTeamId: string, awayTeamId: string): MatchKits {
  const homeHue = hueFor(homeTeamId)
  return { home: kitOf(homeHue), away: kitOf(awayHueFor(homeHue, hueFor(awayTeamId))) }
}
