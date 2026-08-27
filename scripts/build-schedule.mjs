const MATCHDAY_COUNT = 8
const MAX_ATTEMPTS = 400

function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let drawn = Math.imul(state ^ (state >>> 15), 1 | state)
    drawn = (drawn + Math.imul(drawn ^ (drawn >>> 7), 61 | drawn)) ^ drawn
    return ((drawn ^ (drawn >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled(items, random) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

function matchesByTeam(matches) {
  const index = new Map()
  for (const match of matches) {
    for (const teamId of [match.homeTeamId, match.awayTeamId]) {
      if (!index.has(teamId)) index.set(teamId, [])
      index.get(teamId).push(match)
    }
  }
  return index
}

function findPerfectMatching(available, teamIds) {
  const chosen = []
  const used = new Set()

  const pickNext = () => {
    if (used.size === teamIds.length) return true

    let scarcestTeam = null
    let options = null
    for (const teamId of teamIds) {
      if (used.has(teamId)) continue
      const candidates = available
        .get(teamId)
        .filter((match) => !used.has(match.homeTeamId) && !used.has(match.awayTeamId))
      if (candidates.length === 0) return false
      if (options === null || candidates.length < options.length) {
        scarcestTeam = teamId
        options = candidates
      }
    }
    if (scarcestTeam === null || options === null) return false

    for (const match of options) {
      used.add(match.homeTeamId)
      used.add(match.awayTeamId)
      chosen.push(match)
      if (pickNext()) return true
      chosen.pop()
      used.delete(match.homeTeamId)
      used.delete(match.awayTeamId)
    }
    return false
  }

  return pickNext() ? chosen : null
}

function venueImbalance(matchdays, teamIds) {
  const venuesByTeam = new Map(teamIds.map((teamId) => [teamId, []]))
  for (const round of matchdays) {
    for (const match of round) {
      venuesByTeam.get(match.homeTeamId).push('H')
      venuesByTeam.get(match.awayTeamId).push('A')
    }
  }

  let penalty = 0
  for (const venues of venuesByTeam.values()) {
    let streak = 1
    for (let index = 1; index < venues.length; index += 1) {
      streak = venues[index] === venues[index - 1] ? streak + 1 : 1
      if (streak >= 3) penalty += streak - 2
    }
  }
  return penalty
}

function buildAttempt(matches, teamIds, random) {
  const remaining = new Set(shuffled(matches, random))
  const matchdays = []

  for (let round = 0; round < MATCHDAY_COUNT; round += 1) {
    const available = matchesByTeam([...remaining])
    for (const [teamId, teamMatches] of available) {
      available.set(teamId, shuffled(teamMatches, random))
    }
    const matching = findPerfectMatching(available, teamIds)
    if (matching === null) return null
    for (const match of matching) remaining.delete(match)
    matchdays.push(matching)
  }
  return matchdays
}

export function buildSchedule(matches, teams, seed = 20262027) {
  const teamIds = teams.map((team) => team.id)
  const random = createRandom(seed)
  let best = null
  let bestPenalty = Number.POSITIVE_INFINITY

  for (let attempt = 0; attempt < MAX_ATTEMPTS && bestPenalty > 0; attempt += 1) {
    const matchdays = buildAttempt(matches, teamIds, random)
    if (matchdays === null) continue
    const penalty = venueImbalance(matchdays, teamIds)
    if (penalty < bestPenalty) {
      bestPenalty = penalty
      best = matchdays
    }
  }

  if (best === null) throw new Error('Lig aşaması takvimi üretilemedi')

  const matchdayByMatchId = new Map()
  best.forEach((round, index) => {
    for (const match of round) matchdayByMatchId.set(match.id, index + 1)
  })
  return { matchdayByMatchId, venuePenalty: bestPenalty }
}
