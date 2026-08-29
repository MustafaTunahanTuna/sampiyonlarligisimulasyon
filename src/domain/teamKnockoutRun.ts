import type { KnockoutRoundId } from './knockoutFormat'
import type { KnockoutStage } from './knockoutStage'
import type { Team, TieDecision } from './types'

export interface KnockoutAppearance {
  round: KnockoutRoundId
  opponent: Team
  goalsFor: number
  goalsAgainst: number
  advanced: boolean
  decidedBy: TieDecision
}

export type KnockoutSummary =
  | { kind: 'CHAMPION' }
  | { kind: 'ADVANCED'; round: KnockoutRoundId }
  | { kind: 'ELIMINATED'; round: KnockoutRoundId }

export function teamKnockoutRun(team: Team, stage: KnockoutStage): KnockoutAppearance[] {
  return stage.rounds.flatMap((round) =>
    round.ties.flatMap((tie) => {
      const outcome = round.outcomes.get(tie.id)
      if (outcome === undefined) return []
      const isSeeded = tie.seeded?.id === team.id
      const isChallenger = tie.challenger?.id === team.id
      if (!isSeeded && !isChallenger) return []

      const opponent = isSeeded ? tie.challenger : tie.seeded
      if (opponent === null) return []

      return [
        {
          round: round.id,
          opponent,
          goalsFor: isSeeded ? outcome.aggregateSeeded : outcome.aggregateChallenger,
          goalsAgainst: isSeeded ? outcome.aggregateChallenger : outcome.aggregateSeeded,
          advanced: outcome.winner.id === team.id,
          decidedBy: outcome.decidedBy,
        },
      ]
    }),
  )
}

export function knockoutRunSummary(
  team: Team,
  stage: KnockoutStage,
  run: KnockoutAppearance[],
): KnockoutSummary | null {
  if (stage.champion?.id === team.id) return { kind: 'CHAMPION' }
  if (run.length === 0) return null
  const lastRound = run[run.length - 1]
  return lastRound.advanced
    ? { kind: 'ADVANCED', round: lastRound.round }
    : { kind: 'ELIMINATED', round: lastRound.round }
}
