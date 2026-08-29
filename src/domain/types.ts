export type PotNumber = 1 | 2 | 3 | 4

export type MatchStatus =
  | 'SCHEDULED_UNCONFIRMED'
  | 'UPCOMING'
  | 'LIVE'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'

export type StrengthSource = 'club-coefficient' | 'association-estimate' | 'pot-baseline'

export interface Team {
  id: string
  name: string
  officialName: string
  code: string
  countryCode: string
  countryName: string
  pot: PotNumber
  logo: string
  logoLarge: string
  associationLogo: string
  strength: number
  strengthSource: StrengthSource
}

export interface Score {
  home: number
  away: number
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  matchId: string | null
  matchday: number | null
  kickOff: string | null
  status: MatchStatus
  score: Score | null
}

export interface Pot {
  number: PotNumber
  teamIds: string[]
}

export type MatchdaySource = 'uefa' | 'generated'

export interface DrawMeta {
  competition: string
  season: string
  seasonYear: string
  stage: string
  drawId: string
  roundId: string
  drawDate: string
  venue: string
  source: string
  matchdaySource: MatchdaySource
  scrapedAt: string
}

export interface DrawPool {
  meta: DrawMeta
  pots: Pot[]
  teams: Team[]
  matches: Match[]
}

export type Venue = 'HOME' | 'AWAY'

export type Outcome = 'WIN' | 'DRAW' | 'LOSS'

export interface Fixture {
  match: Match
  opponent: Team
  venue: Venue
  goalsFor: number | null
  goalsAgainst: number | null
  outcome: Outcome | null
}

export interface SeasonRecord {
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type PredictionSource = 'manual' | 'simulated'

export interface Prediction {
  score: Score
  source: PredictionSource
}

export type PredictionMap = Record<string, Prediction>

export interface StandingRow {
  team: Team
  position: number
  qualification: import('./standings').Qualification
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  awayGoalsFor: number
  awayWins: number
  points: number
}

export type TieSlot =
  | { kind: 'POSITION'; position: number }
  | { kind: 'WINNER'; round: import('./knockoutFormat').KnockoutRoundId; order: number }

export interface KnockoutTie {
  id: string
  round: import('./knockoutFormat').KnockoutRoundId
  order: number
  seeded: Team | null
  challenger: Team | null
  seededSlot: TieSlot
  challengerSlot: TieSlot
  isTwoLegged: boolean
}

export type TieDecision = 'AGGREGATE' | 'EXTRA_TIME' | 'PENALTIES'

export interface TieOutcome {
  tieId: string
  legs: Score[]
  aggregateSeeded: number
  aggregateChallenger: number
  extraTime: Score | null
  penalties: Score | null
  winner: Team
  decidedBy: TieDecision
}

export type KnockoutScoreMap = Record<string, Score>
