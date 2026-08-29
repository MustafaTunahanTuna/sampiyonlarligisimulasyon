import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fetchSquads } from './wiki-squads.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const RATINGS_PATH = join(ROOT, 'scripts/.cache/eafc26-men.csv')
const CLUB_MAP_PATH = join(ROOT, 'scripts/club-map.json')
const POOL_PATH = join(ROOT, 'src/data/league-phase-2026-27.json')
const OUTPUT_PATH = join(ROOT, 'src/data/squads-2026-27.json')

const STARTERS = { GK: 1, DF: 4, MF: 3, FW: 3 }
const DEPTH_SLICE = 9
const UNMATCHED_PENALTY = 4
const MIN_QUALITY = 40

const RATING_PIVOT = 50
const RATING_SPREAD = 2
const RATING_FLOOR = 12
const RATING_CEILING = 100
const SQUAD_WEIGHT = 0.6
const DISCIPLINE_PIVOT = 140
const DEFAULT_AGGRESSION = 70

function toEngineRating(overall) {
  const scaled = (overall - RATING_PIVOT) * RATING_SPREAD + RATING_FLOOR + 8
  return Math.round(Math.min(RATING_CEILING, Math.max(RATING_FLOOR, scaled)))
}

function parseCsv(input) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"'
          index += 1
        } else quoted = false
      } else field += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function normaliseName(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function surnameKey(value) {
  const parts = normaliseName(value).split(' ')
  return parts.length === 1 ? parts[0] : `${parts[0][0]} ${parts[parts.length - 1]}`
}

function loadRatings() {
  const rows = parseCsv(readFileSync(RATINGS_PATH, 'utf8'))
  const head = rows[0]
  const column = (name) => head.indexOf(name)
  const index = {
    name: column('Name'),
    ovr: column('OVR'),
    team: column('Team'),
    position: column('Position'),
    age: column('Age'),
    aggression: column('Aggression'),
  }

  const players = []
  for (const row of rows.slice(1)) {
    if (row.length < head.length - 5) continue
    const overall = Number.parseInt(row[index.ovr], 10)
    if (!Number.isFinite(overall)) continue
    players.push({
      name: row[index.name],
      overall,
      team: row[index.team],
      position: row[index.position],
      age: Number.parseInt(row[index.age], 10) || null,
      aggression: Number.parseInt(row[index.aggression], 10) || null,
    })
  }

  const byExact = new Map()
  const byClub = new Map()
  for (const player of players) {
    const exact = normaliseName(player.name)
    if (!byExact.has(exact)) byExact.set(exact, [])
    byExact.get(exact).push(player)
    if (!byClub.has(player.team)) byClub.set(player.team, [])
    byClub.get(player.team).push(player)
  }
  return { byExact, byClub }
}

function tokensOf(name) {
  return new Set(normaliseName(name).split(' ').filter((token) => token.length > 1))
}

function tokenOverlap(left, right) {
  let shared = 0
  for (const token of left) if (right.has(token)) shared += 1
  return shared
}

function matchWithinClub(squad, name) {
  const wanted = tokensOf(name)
  if (wanted.size === 0) return null
  const surname = surnameKey(name)

  const scored = squad
    .map((candidate) => {
      const tokens = tokensOf(candidate.name)
      const shared = tokenOverlap(wanted, tokens)
      const covered = shared === Math.min(wanted.size, tokens.size)
      const sameSurname = surnameKey(candidate.name) === surname
      return { candidate, score: shared + (covered ? 1 : 0) + (sameSurname ? 1 : 0) }
    })
    .filter((entry) => entry.score >= 2)
    .sort((left, right) => right.score - left.score)

  if (scored.length === 0) return null
  if (scored.length > 1 && scored[0].score === scored[1].score) return null
  return { player: scored[0].candidate, confidence: 'club' }
}

function matchPlayer(ratings, name, eaTeam) {
  if (eaTeam !== null) {
    const squad = ratings.byClub.get(eaTeam)
    if (squad !== undefined) {
      const withinClub = matchWithinClub(squad, name)
      if (withinClub !== null) return withinClub
    }
  }
  const exact = ratings.byExact.get(normaliseName(name))
  if (exact !== undefined && exact.length === 1) return { player: exact[0], confidence: 'global' }
  return null
}

function averageOf(values) {
  if (values.length === 0) return null
  return values.reduce((total, value) => total + value, 0) / values.length
}

function estimateQuality(players, position) {
  const samePosition = players.filter((player) => player.position === position && player.quality !== null)
  const anyPosition = players.filter((player) => player.quality !== null)
  const reference = averageOf(samePosition.map((player) => player.quality)) ??
    averageOf(anyPosition.map((player) => player.quality))
  if (reference === null) return null
  return Math.max(MIN_QUALITY, Math.round(reference - UNMATCHED_PENALTY))
}

function teamCard(players) {
  const card = {}
  for (const [position, count] of Object.entries(STARTERS)) {
    const rated = players
      .filter((player) => player.position === position)
      .map((player) => player.quality)
      .sort((left, right) => right - left)
      .slice(0, count)
    card[position] = rated.length === 0 ? null : Math.round(averageOf(rated))
  }
  const ranked = players.map((player) => player.quality).sort((left, right) => right - left)
  const eleven = ranked.slice(0, 11)
  const bench = ranked.slice(11, 11 + DEPTH_SLICE)
  const aggression = averageOf(
    players.map((player) => player.aggression).filter((value) => value !== null),
  ) ?? DEFAULT_AGGRESSION
  return {
    goalkeeping: card.GK,
    defence: card.DF,
    midfield: card.MF,
    attack: card.FW,
    firstEleven: Math.round(averageOf(eleven)),
    depth: bench.length === 0 ? Math.round(averageOf(eleven)) : Math.round(averageOf(bench)),
    aggression: Math.round(aggression),
    size: players.length,
  }
}

function engineProfile(card, uefaStrength) {
  const squadStrength = toEngineRating(card.firstEleven)
  return {
    attack: toEngineRating(card.attack),
    midfield: toEngineRating(card.midfield),
    defence: toEngineRating(card.defence),
    goalkeeping: toEngineRating(card.goalkeeping),
    discipline: Math.round(Math.min(RATING_CEILING, Math.max(RATING_FLOOR, DISCIPLINE_PIVOT - card.aggression))),
    depth: toEngineRating(card.depth),
    squadStrength,
    strength: Math.round(SQUAD_WEIGHT * squadStrength + (1 - SQUAD_WEIGHT) * uefaStrength),
  }
}

async function main() {
  const ratings = loadRatings()
  const clubMap = JSON.parse(readFileSync(CLUB_MAP_PATH, 'utf8'))
  const pool = JSON.parse(readFileSync(POOL_PATH, 'utf8'))
  const poolById = new Map(pool.teams.map((team) => [team.id, team]))

  const squads = await fetchSquads(clubMap.clubs.map((club) => club.wikiClub))

  const output = []
  const report = []
  for (const club of clubMap.clubs) {
    const roster = squads.get(club.wikiClub)
    if (roster === null || roster === undefined) throw new Error(`Kadro alınamadı: ${club.name} (${club.wikiClub})`)

    const players = roster.map((entry) => {
      const match = matchPlayer(ratings, entry.name, club.eaTeam)
      return {
        name: entry.name,
        position: entry.position,
        number: entry.number,
        quality: match === null ? null : match.player.overall,
        age: match === null ? null : match.player.age,
        aggression: match === null ? null : match.player.aggression,
        source: match === null ? 'estimated' : match.confidence,
      }
    })

    for (const player of players) {
      if (player.quality !== null) continue
      player.quality = estimateQuality(players, player.position)
    }

    const unresolved = players.filter((player) => player.quality === null)
    if (unresolved.length > 0) throw new Error(`${club.name}: kalite türetilemedi (${unresolved.length} oyuncu)`)

    const matched = players.filter((player) => player.source !== 'estimated').length
    report.push({
      team: club.name,
      total: players.length,
      matched,
      estimated: players.length - matched,
      byClub: players.filter((player) => player.source === 'club').length,
    })

    const card = teamCard(players)
    const poolTeam = poolById.get(club.id)
    if (poolTeam === undefined) throw new Error(`Havuzda takım yok: ${club.name} (${club.id})`)
    output.push({
      teamId: club.id,
      teamName: club.name,
      wikiClub: club.wikiClub,
      eaTeam: club.eaTeam,
      card,
      engine: engineProfile(card, poolTeam.strength),
      players,
    })
  }

  const document = {
    meta: {
      generatedAt: new Date().toISOString().slice(0, 10),
      squadSource: 'en.wikipedia.org club pages (CC BY-SA)',
      ratingSource: 'EA SPORTS FC 26 public ratings',
      note: 'Kadro listeleri güncel Wikipedia kulüp sayfalarından, oyuncu kaliteleri EA FC 26 genel puanından türetilmiştir. Ham puan tablosu saklanmaz.',
      strengthBlend: `${SQUAD_WEIGHT} kadro + ${(1 - SQUAD_WEIGHT).toFixed(1)} UEFA kulüp katsayısı`,
    },
    squads: output,
  }
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(document, null, 1)}\n`)

  report.sort((left, right) => left.matched / left.total - right.matched / right.total)
  console.log('takım              oyuncu  eşleşen  tahmin  kulüpten  oran')
  for (const row of report) {
    const ratio = ((row.matched / row.total) * 100).toFixed(0)
    console.log(
      row.team.padEnd(18) +
        String(row.total).padStart(5) +
        String(row.matched).padStart(8) +
        String(row.estimated).padStart(8) +
        String(row.byClub).padStart(9) +
        `${ratio}%`.padStart(7),
    )
  }
  const totals = report.reduce(
    (sum, row) => ({ total: sum.total + row.total, matched: sum.matched + row.matched }),
    { total: 0, matched: 0 },
  )
  console.log(`\ntoplam ${totals.matched}/${totals.total} eşleşti (%${((totals.matched / totals.total) * 100).toFixed(1)})`)
  console.log(`yazıldı: ${OUTPUT_PATH}`)
  if (poolById.size !== output.length) console.log('UYARI: takım sayısı havuzla uyuşmuyor')
}

await main()
