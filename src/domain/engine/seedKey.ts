export function matchSeedKey(seed: string, matchId: string): string {
  return `${seed}:${matchId}`
}
