import { countryNameTr } from './country-names-tr.mjs'
import { buildStrengthIndex } from './team-strength.mjs'

const LOCALE = 'EN'

function potNumberById(rounds) {
  const [round] = rounds
  return new Map(round.pots.map((pot) => [pot.potId, pot.numOrder]))
}

function collectPotAssignments(teamSlots) {
  const assignments = new Map()
  for (const slot of teamSlots) {
    for (const opponent of slot.opponents) {
      assignments.set(opponent.teamId, opponent.potId)
    }
  }
  return assignments
}

function toMatchKey(homeTeamId, awayTeamId) {
  return `${homeTeamId}-${awayTeamId}`
}

function buildMatches(teamSlots) {
  const matches = new Map()
  for (const slot of teamSlots) {
    const [teamId] = slot.teamIds
    for (const opponent of slot.opponents) {
      const isHome = opponent.location === 'HOME'
      const homeTeamId = isHome ? teamId : opponent.teamId
      const awayTeamId = isHome ? opponent.teamId : teamId
      matches.set(toMatchKey(homeTeamId, awayTeamId), { homeTeamId, awayTeamId })
    }
  }
  return [...matches.values()]
}

function toTeam(raw, potNumber) {
  return {
    id: raw.id,
    name: raw.translations?.displayName?.[LOCALE] ?? raw.internationalName,
    officialName: raw.translations?.displayOfficialName?.[LOCALE] ?? raw.internationalName,
    code: raw.teamCode,
    countryCode: raw.countryCode,
    countryName: countryNameTr(raw.countryCode, raw.translations?.countryName?.[LOCALE] ?? raw.countryCode),
    pot: potNumber,
    logo: raw.mediumLogoUrl,
    logoLarge: raw.bigLogoUrl,
    associationLogo: raw.associationLogoUrl,
  }
}

function toScore(rawMatch) {
  const total = rawMatch.score?.total
  if (!total || total.home === undefined || total.away === undefined) return null
  return { home: total.home, away: total.away }
}

function indexLiveMatches(rawMatches) {
  const index = new Map()
  for (const rawMatch of rawMatches) {
    index.set(toMatchKey(rawMatch.homeTeam.id, rawMatch.awayTeam.id), {
      matchId: rawMatch.id,
      kickOff: rawMatch.kickOffTime?.dateTime ?? null,
      matchday: rawMatch.matchday?.number ?? null,
      status: rawMatch.status ?? 'UPCOMING',
      score: toScore(rawMatch),
    })
  }
  return index
}

export function buildDrawPool({ draw, rawTeams, rawMatches, clubCoefficients, associationCoefficients }) {
  const [round] = draw.rounds
  const [group] = round.result.groups
  const potNumbers = potNumberById(draw.rounds)
  const potAssignments = collectPotAssignments(group.teamSlots)

  const rankedTeams = rawTeams
    .map((raw) => toTeam(raw, potNumbers.get(potAssignments.get(raw.id))))
    .sort((left, right) => left.pot - right.pot || left.name.localeCompare(right.name))

  const strengthIndex = buildStrengthIndex({
    teams: rankedTeams,
    clubCoefficients,
    associationCoefficients,
  })
  const teams = rankedTeams.map((team) => ({ ...team, ...strengthIndex.get(team.id) }))

  const liveMatches = indexLiveMatches(rawMatches)
  const matches = buildMatches(group.teamSlots)
    .map(({ homeTeamId, awayTeamId }) => {
      const key = toMatchKey(homeTeamId, awayTeamId)
      const live = liveMatches.get(key)
      return {
        id: key,
        homeTeamId,
        awayTeamId,
        matchId: live?.matchId ?? null,
        matchday: live?.matchday ?? null,
        kickOff: live?.kickOff ?? null,
        status: live?.status ?? 'SCHEDULED_UNCONFIRMED',
        score: live?.score ?? null,
      }
    })
    .sort((left, right) => left.id.localeCompare(right.id))

  return {
    meta: {
      competition: 'UEFA Champions League',
      season: '2026/27',
      seasonYear: draw.seasonYear,
      stage: 'League phase',
      drawId: draw.id,
      roundId: round.roundId,
      drawDate: draw.date,
      venue: 'Monaco',
      source: `https://www.uefa.com/uefachampionsleague/draws/${draw.seasonYear}/${round.roundId}/`,
      scrapedAt: new Date().toISOString(),
    },
    pots: round.pots.map((pot) => ({
      number: pot.numOrder,
      teamIds: teams.filter((team) => team.pot === pot.numOrder).map((team) => team.id),
    })),
    teams,
    matches,
  }
}
