import type { KnockoutRoundId } from './knockoutFormat'
import type { KnockoutStage } from './knockoutStage'
import type { Team, TieDecision } from './types'

export interface KnockoutAppearance {
  round: KnockoutRoundId
  roundLabel: string
  opponent: Team
  goalsFor: number
  goalsAgainst: number
  advanced: boolean
  decidedBy: TieDecision
}

const ELIMINATION_LABEL: Record<KnockoutRoundId, string> = {
  PLAY_OFF: 'Play-off turunda elendi',
  ROUND_OF_16: 'Son 16 turunda elendi',
  QUARTER_FINAL: 'Çeyrek finalde elendi',
  SEMI_FINAL: 'Yarı finalde elendi',
  FINAL: 'Finalde kaybetti',
}

const PROGRESS_LABEL: Record<KnockoutRoundId, string> = {
  PLAY_OFF: 'Son 16 turuna yükseldi',
  ROUND_OF_16: 'Çeyrek finale yükseldi',
  QUARTER_FINAL: 'Yarı finale yükseldi',
  SEMI_FINAL: 'Finale yükseldi',
  FINAL: 'Şampiyon',
}

const DECISION_SUFFIX: Record<TieDecision, string> = {
  AGGREGATE: '',
  EXTRA_TIME: 'uzatma',
  PENALTIES: 'penaltı',
}

export function decisionSuffix(decision: TieDecision): string {
  return DECISION_SUFFIX[decision]
}

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
          roundLabel: round.label,
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
): string | null {
  if (stage.champion?.id === team.id) return 'Şampiyon'
  if (run.length === 0) return null
  const lastRound = run[run.length - 1]
  return lastRound.advanced
    ? PROGRESS_LABEL[lastRound.round]
    : ELIMINATION_LABEL[lastRound.round]
}
