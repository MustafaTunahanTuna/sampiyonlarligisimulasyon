export const KNOCKOUT_ROUNDS = [
  'PLAY_OFF',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'FINAL',
] as const

export type KnockoutRoundId = (typeof KNOCKOUT_ROUNDS)[number]

export const ROUND_SHORT: Record<KnockoutRoundId, string> = {
  PLAY_OFF: 'PO',
  ROUND_OF_16: 'R16',
  QUARTER_FINAL: 'QF',
  SEMI_FINAL: 'SF',
  FINAL: 'F',
}

export const TWO_LEGGED_ROUNDS: KnockoutRoundId[] = [
  'PLAY_OFF',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
]

export function isTwoLegged(round: KnockoutRoundId): boolean {
  return TWO_LEGGED_ROUNDS.includes(round)
}

export const PLAY_OFF_PAIRS: [number, number][] = [
  [9, 24],
  [10, 23],
  [11, 22],
  [12, 21],
  [13, 20],
  [14, 19],
  [15, 18],
  [16, 17],
]

export const ROUND_OF_16_SEEDING: [number, number][] = [
  [1, 8],
  [2, 7],
  [3, 6],
  [4, 5],
  [5, 4],
  [6, 3],
  [7, 2],
  [8, 1],
]

export const BRACKET_ORDER = [1, 8, 4, 5, 3, 6, 2, 7]

export function tieId(round: KnockoutRoundId, order: number): string {
  return `${ROUND_SHORT[round]}-${order}`
}

export function legId(tie: string, leg: 1 | 2): string {
  return `${tie}:L${leg}`
}

export function extraTimeId(tie: string): string {
  return `${tie}:ET`
}

export function penaltyId(tie: string): string {
  return `${tie}:PEN`
}
