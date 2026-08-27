const EXPECTED_TEAM_COUNT = 36
const EXPECTED_MATCH_COUNT = 144
const EXPECTED_OPPONENTS_PER_POT = 2

function fail(message) {
  throw new Error(`Draw pool validation failed: ${message}`)
}

function countByTeam(matches, key) {
  const counts = new Map()
  for (const match of matches) {
    counts.set(match[key], (counts.get(match[key]) ?? 0) + 1)
  }
  return counts
}

export function validateDrawPool(pool) {
  if (pool.teams.length !== EXPECTED_TEAM_COUNT) {
    fail(`expected ${EXPECTED_TEAM_COUNT} teams, got ${pool.teams.length}`)
  }
  if (pool.matches.length !== EXPECTED_MATCH_COUNT) {
    fail(`expected ${EXPECTED_MATCH_COUNT} matches, got ${pool.matches.length}`)
  }

  const teamsById = new Map(pool.teams.map((team) => [team.id, team]))
  const untyped = pool.teams.filter((team) => ![1, 2, 3, 4].includes(team.pot))
  if (untyped.length > 0) {
    fail(`teams without a valid pot: ${untyped.map((team) => team.name).join(', ')}`)
  }

  const homeCounts = countByTeam(pool.matches, 'homeTeamId')
  const awayCounts = countByTeam(pool.matches, 'awayTeamId')
  for (const team of pool.teams) {
    if (homeCounts.get(team.id) !== 4 || awayCounts.get(team.id) !== 4) {
      fail(
        `${team.name} has ${homeCounts.get(team.id) ?? 0} home / ${awayCounts.get(team.id) ?? 0} away matches, expected 4/4`,
      )
    }
  }

  for (const team of pool.teams) {
    const opponents = pool.matches
      .filter((match) => match.homeTeamId === team.id || match.awayTeamId === team.id)
      .map((match) => (match.homeTeamId === team.id ? match.awayTeamId : match.homeTeamId))
    if (new Set(opponents).size !== opponents.length) {
      fail(`${team.name} faces the same opponent twice`)
    }
    for (const pot of [1, 2, 3, 4]) {
      const fromPot = opponents.filter((id) => teamsById.get(id)?.pot === pot).length
      if (fromPot !== EXPECTED_OPPONENTS_PER_POT) {
        fail(`${team.name} has ${fromPot} opponents from pot ${pot}, expected ${EXPECTED_OPPONENTS_PER_POT}`)
      }
    }
    if (opponents.some((id) => teamsById.get(id)?.countryCode === team.countryCode)) {
      fail(`${team.name} faces a team from the same association`)
    }
  }
}
