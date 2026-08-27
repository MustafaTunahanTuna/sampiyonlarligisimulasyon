const STRENGTH_FLOOR = 20
const STRENGTH_CEILING = 100
const FALLBACK_POT_SPREAD = 25

function averageOf(values) {
  return values.reduce((total, value) => total + value, 0) / values.length
}

function potBaselines(knownByPot, pots) {
  const measured = pots.filter((pot) => knownByPot.get(pot).length > 0)
  const baselines = new Map(measured.map((pot) => [pot, averageOf(knownByPot.get(pot))]))
  const first = measured[0]
  const last = measured[measured.length - 1]
  const stepPerPot =
    measured.length > 1 ? (baselines.get(last) - baselines.get(first)) / (last - first) : 0

  for (const pot of pots) {
    if (!baselines.has(pot)) {
      baselines.set(pot, baselines.get(last) + stepPerPot * (pot - last))
    }
  }
  return baselines
}

function observedPotSpread(knownByPot, pots) {
  const spreads = pots
    .map((pot) => knownByPot.get(pot))
    .filter((values) => values.length > 1)
    .map((values) => Math.max(...values) - Math.min(...values))
  return spreads.length > 0 ? averageOf(spreads) : FALLBACK_POT_SPREAD
}

function associationOffsets(teams, associationPoints) {
  const known = [...associationPoints.values()]
  const lowest = known.length > 0 ? Math.min(...known) : 0
  const highest = known.length > 0 ? Math.max(...known) : 1
  const span = highest - lowest || 1
  return new Map(
    teams.map((team) => {
      const points = associationPoints.get(team.countryCode)
      const position = points === undefined ? 0 : (points - lowest) / span
      return [team.id, position - 0.5]
    }),
  )
}

function normalise(rawByTeamId) {
  const values = [...rawByTeamId.values()]
  const lowest = Math.min(...values)
  const span = Math.max(...values) - lowest || 1
  return new Map(
    [...rawByTeamId].map(([teamId, value]) => [
      teamId,
      Math.round(STRENGTH_FLOOR + ((value - lowest) / span) * (STRENGTH_CEILING - STRENGTH_FLOOR)),
    ]),
  )
}

export function buildStrengthIndex({ teams, clubCoefficients, associationCoefficients }) {
  const pots = [...new Set(teams.map((team) => team.pot))].sort((left, right) => left - right)
  const clubPoints = new Map(
    clubCoefficients.map((entry) => [String(entry.member.id), entry.overallRanking.totalPoints]),
  )
  const associationPoints = new Map(
    associationCoefficients.map((entry) => [
      entry.member.countryCode,
      entry.overallRanking.totalPoints,
    ]),
  )

  const knownByPot = new Map(
    pots.map((pot) => [
      pot,
      teams.filter((team) => team.pot === pot && clubPoints.has(team.id)).map((team) => clubPoints.get(team.id)),
    ]),
  )
  const baselines = potBaselines(knownByPot, pots)
  const spread = observedPotSpread(knownByPot, pots)
  const offsets = associationOffsets(teams, associationPoints)

  const rawByTeamId = new Map(
    teams.map((team) => [
      team.id,
      clubPoints.get(team.id) ?? baselines.get(team.pot) + spread * offsets.get(team.id),
    ]),
  )
  const normalised = normalise(rawByTeamId)

  return new Map(
    teams.map((team) => [
      team.id,
      {
        strength: normalised.get(team.id),
        strengthSource: clubPoints.has(team.id)
          ? 'club-coefficient'
          : associationPoints.has(team.countryCode)
            ? 'association-estimate'
            : 'pot-baseline',
      },
    ]),
  )
}
