import type { Fixture } from '../../domain/types'

export function formatScore(fixture: Fixture): string | null {
  if (fixture.goalsFor === null || fixture.goalsAgainst === null) return null
  return `${fixture.goalsFor} – ${fixture.goalsAgainst}`
}
