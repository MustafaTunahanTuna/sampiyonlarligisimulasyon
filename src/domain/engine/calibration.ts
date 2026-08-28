const MIN_SCALE = 0.15
const MAX_SCALE = 6
const MIN_PROBE_XG = 0.05

export function finishingScale(targetGoals: number, probeExpectedGoals: number): number {
  const ratio = targetGoals / Math.max(MIN_PROBE_XG, probeExpectedGoals)
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, ratio))
}
