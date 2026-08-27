const API_KEY = 'ceeee1a5bb209502c6c438abd8f30aef179ce669bb9288f2d1cf2fa276de03f4'

const DRAW_SERVICE = 'https://fsp-draw-service.uefa.com/v1'
const COMP_SERVICE = 'https://comp.uefa.com/v2'
const MATCH_SERVICE = 'https://match.uefa.com/v5'

async function request(url) {
  const response = await fetch(url, { headers: { 'x-api-key': API_KEY } })
  if (!response.ok) {
    throw new Error(`UEFA API ${response.status} ${response.statusText} for ${url}`)
  }
  return response.json()
}

export function fetchDraw(drawId) {
  return request(`${DRAW_SERVICE}/draws?drawId=${drawId}`).then(([draw]) => {
    if (!draw) throw new Error(`Draw ${drawId} not found`)
    return draw
  })
}

export async function fetchTeams(teamIds) {
  const chunks = []
  for (let index = 0; index < teamIds.length; index += 20) {
    chunks.push(teamIds.slice(index, index + 20))
  }
  const responses = await Promise.all(
    chunks.map((chunk) => request(`${COMP_SERVICE}/teams?teamIds=${chunk.join(',')}`)),
  )
  return responses.flat()
}

export function fetchMatches({ competitionId, seasonYear, roundId }) {
  const query = new URLSearchParams({
    competitionId,
    seasonYear: String(seasonYear),
    limit: '500',
    offset: '0',
  })
  return request(`${MATCH_SERVICE}/matches?${query}`).then((matches) =>
    matches.filter((match) => match.round?.id === roundId),
  )
}

function fetchCoefficients(coefficientType, seasonYear) {
  const query = new URLSearchParams({
    coefficientType,
    coefficientRange: 'OVERALL',
    seasonYear: String(seasonYear),
    limit: '500',
    offset: '0',
  })
  return request(`${COMP_SERVICE}/coefficients?${query}`).then((payload) => payload.data.members)
}

export function fetchClubCoefficients(seasonYear) {
  return fetchCoefficients('MEN_CLUB', seasonYear)
}

export function fetchAssociationCoefficients(seasonYear) {
  return fetchCoefficients('MEN_ASSOCIATION', seasonYear)
}
