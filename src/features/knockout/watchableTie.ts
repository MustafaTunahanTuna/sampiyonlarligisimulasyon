import type { KnockoutTie, TieOutcome } from '../../domain/types'

export function isWatchableTie(
  tie: KnockoutTie,
  outcome: TieOutcome | undefined,
  favouriteTeamId: string | null,
): boolean {
  if (outcome === undefined || favouriteTeamId === null) return false
  return tie.seeded?.id === favouriteTeamId || tie.challenger?.id === favouriteTeamId
}
