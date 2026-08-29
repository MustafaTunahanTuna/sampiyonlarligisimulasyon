import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rolldown } from 'rolldown'
import { fetchAssociationCoefficients, fetchClubCoefficients } from './uefa-api.mjs'
import { engineProfile, normaliseToStrength, teamCard, toEngineRating } from './squad-metrics.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const CACHE = join(ROOT, 'scripts/.cache')
const RATINGS_PATH = join(CACHE, 'eafc26-men.csv')
const SEASONS_PATH = join(ROOT, 'scripts/backtest-seasons.json')

const RUNS_PER_MATCH = Number(process.env.RUNS ?? 400)
const ROUND_ROBIN_RUNS = Number(process.env.RR_RUNS ?? 120)
const ROUND_ROBIN = process.env.RR !== '0'
const UNPREDICTABILITY = 0.25
const EPSILON = 1e-9

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

const POSITION_GROUP = {
  GK: 'GK',
  CB: 'DF', LB: 'DF', RB: 'DF', LWB: 'DF', RWB: 'DF',
  CDM: 'MF', CM: 'MF', CAM: 'MF', LM: 'MF', RM: 'MF',
  LW: 'FW', RW: 'FW', ST: 'FW', CF: 'FW',
}

function loadEaSquads() {
  const rows = parseCsv(readFileSync(RATINGS_PATH, 'utf8'))
  const head = rows[0]
  const index = {
    name: head.indexOf('Name'),
    ovr: head.indexOf('OVR'),
    team: head.indexOf('Team'),
    position: head.indexOf('Position'),
    aggression: head.indexOf('Aggression'),
  }
  const byTeam = new Map()
  for (const row of rows.slice(1)) {
    if (row.length < head.length - 5) continue
    const overall = Number.parseInt(row[index.ovr], 10)
    const group = POSITION_GROUP[(row[index.position] ?? '').trim()]
    if (!Number.isFinite(overall) || group === undefined) continue
    const team = row[index.team]
    if (!byTeam.has(team)) byTeam.set(team, [])
    byTeam.get(team).push({
      name: row[index.name],
      quality: overall,
      position: group,
      aggression: Number.parseInt(row[index.aggression], 10) || null,
    })
  }
  return byTeam
}

function parseResults(text) {
  const matches = []
  let stage = null
  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^▪\s*(.+)/)
    if (heading !== null) {
      stage = heading[1]
      continue
    }
    if (!/^League/i.test(stage ?? '')) continue
    const played = line.match(/^\s*(?:\d{2}:\d{2}\s+)?(.+?)\s+v\s+(.+?)\s+(\d+)-(\d+)/)
    if (played === null) continue
    const homeCountry = (played[1].match(/\(([A-Z]{3})\)\s*$/) ?? [])[1] ?? null
    const awayCountry = (played[2].match(/\(([A-Z]{3})\)\s*$/) ?? [])[1] ?? null
    matches.push({
      homeCountry,
      awayCountry,
      home: played[1].replace(/\s*\([A-Z]{3}\)\s*$/, '').trim(),
      away: played[2].replace(/\s*\([A-Z]{3}\)\s*$/, '').trim(),
      homeGoals: Number.parseInt(played[3], 10),
      awayGoals: Number.parseInt(played[4], 10),
    })
  }
  return matches
}

async function cachedFetch(url, file) {
  const path = join(CACHE, file)
  if (existsSync(path)) return readFile(path, 'utf8')
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  const text = await response.text()
  await writeFile(path, text)
  return text
}

async function coefficientTables(seasonYear) {
  const cachePath = join(CACHE, `coefficients-${seasonYear}.json`)
  if (existsSync(cachePath)) return JSON.parse(readFileSync(cachePath, 'utf8'))
  const clubs = await fetchClubCoefficients(seasonYear)
  const associations = await fetchAssociationCoefficients(seasonYear)
  const tables = {
    clubs: clubs.map((entry) => ({
      name: entry.member.internationalName,
      points: entry.overallRanking.totalPoints,
    })),
    associations: associations.map((entry) => ({
      country: entry.member.countryCode,
      points: entry.overallRanking.totalPoints,
    })),
  }
  await writeFile(cachePath, JSON.stringify(tables))
  return tables
}

async function loadEngine() {
  const outDir = await mkdtemp(join(tmpdir(), 'backtest-engine-'))
  const bundle = await rolldown({
    input: { engine: join(ROOT, 'src/domain/engine/index.ts') },
    platform: 'node',
  })
  await bundle.write({ dir: outDir, format: 'esm', entryFileNames: '[name].mjs' })
  await bundle.close()
  const engine = await import(pathToFileURL(join(outDir, 'engine.mjs')).href)
  return { engine, dispose: () => rm(outDir, { recursive: true, force: true }) }
}

function fakeTeam(id, strength) {
  return {
    id,
    name: id,
    officialName: id,
    code: id.slice(0, 3).toUpperCase(),
    countryCode: 'XXX',
    countryName: 'X',
    pot: 1,
    logo: '',
    logoLarge: '',
    associationLogo: '',
    strength,
    strengthSource: 'club-coefficient',
  }
}

function outcomeOf(homeGoals, awayGoals) {
  if (homeGoals > awayGoals) return 'home'
  if (homeGoals < awayGoals) return 'away'
  return 'draw'
}

const NEUTRAL_TEMPO = 1

function withTempo(profile) {
  return { ...profile, tempo: NEUTRAL_TEMPO }
}

function predict(engine, model, match, seedPrefix) {
  const home = withTempo(model.profiles.get(match.home))
  const away = withTempo(model.profiles.get(match.away))
  const counts = { home: 0, draw: 0, away: 0 }
  let goalError = 0
  for (let run = 0; run < RUNS_PER_MATCH; run += 1) {
    const report = engine.simulateMatchReport(
      fakeTeam(match.home, home.strength),
      fakeTeam(match.away, away.strength),
      `${seedPrefix}:${match.home}:${match.away}:${run}`,
      UNPREDICTABILITY,
      model.usesProfiles ? { profiles: { home, away } } : {},
    )
    counts[outcomeOf(report.score.home, report.score.away)] += 1
    goalError +=
      Math.abs(report.score.home - match.homeGoals) + Math.abs(report.score.away - match.awayGoals)
  }
  const smoothed = RUNS_PER_MATCH + 3
  return {
    home: (counts.home + 1) / smoothed,
    draw: (counts.draw + 1) / smoothed,
    away: (counts.away + 1) / smoothed,
    goalError: goalError / RUNS_PER_MATCH,
  }
}

function scoreMatch(probabilities, actual) {
  const clamped = Math.max(EPSILON, probabilities[actual])
  const logLoss = -Math.log(clamped)
  let brier = 0
  for (const key of ['home', 'draw', 'away']) {
    const target = key === actual ? 1 : 0
    brier += (probabilities[key] - target) ** 2
  }
  const ranked = ['home', 'draw', 'away'].sort((left, right) => probabilities[right] - probabilities[left])
  return { logLoss, brier, hit: ranked[0] === actual ? 1 : 0 }
}

const ESTIMATE_FLOOR_SHARE = 0.35
const ESTIMATE_SPAN_SHARE = 0.5

function coefficientStrengths(season, tables, countryByTeam) {
  const names = Object.keys(season.teams)
  const clubPoints = new Map(tables.clubs.map((entry) => [entry.name, entry.points]))
  const associationPoints = new Map(tables.associations.map((entry) => [entry.country, entry.points]))

  const knownClub = names
    .map((name) => clubPoints.get(season.teams[name].uefaName))
    .filter((value) => value !== undefined)
  const lowestKnown = knownClub.length > 0 ? Math.min(...knownClub) : 60

  const associationValues = [...associationPoints.values()]
  const lowestAssociation = Math.min(...associationValues)
  const associationSpan = Math.max(...associationValues) - lowestAssociation || 1

  const raw = new Map()
  let estimated = 0
  for (const name of names) {
    const direct = clubPoints.get(season.teams[name].uefaName)
    if (direct !== undefined) {
      raw.set(name, direct)
      continue
    }
    estimated += 1
    const country = countryByTeam.get(name)
    const associationPoint = country === undefined ? undefined : associationPoints.get(country)
    const position =
      associationPoint === undefined ? 0 : (associationPoint - lowestAssociation) / associationSpan
    raw.set(name, lowestKnown * (ESTIMATE_FLOOR_SHARE + ESTIMATE_SPAN_SHARE * position))
  }
  return { strengths: normaliseToStrength(raw), estimated, total: names.length }
}

function buildModels(season, eaSquads, coefficientStrength) {
  const names = Object.keys(season.teams)

  const cardByName = new Map()
  for (const name of names) {
    const eaTeam = season.teams[name].eaTeam
    if (eaTeam === null) continue
    const players = eaSquads.get(eaTeam)
    if (players === undefined) throw new Error(`EA kadrosu yok: ${name} -> ${eaTeam}`)
    cardByName.set(name, teamCard(players))
  }

  const uefaByName = new Map(names.map((name) => [name, coefficientStrength.get(name)]))

  function profilesFor(squadWeight) {
    const rawStrength = new Map()
    const cards = new Map()
    for (const name of names) {
      const uefa = uefaByName.get(name)
      const card = cardByName.get(name) ?? fallbackCard(uefa)
      cards.set(name, card)
      const squadStrength = toEngineRating(card.firstEleven)
      rawStrength.set(name, squadWeight * squadStrength + (1 - squadWeight) * uefa)
    }
    const normalised = normaliseToStrength(rawStrength)
    const profiles = new Map()
    for (const name of names) {
      profiles.set(name, { ...engineProfile(cards.get(name), null, 1), strength: normalised.get(name) })
    }
    return profiles
  }

  return [
    { key: 'katsayı (eski motor)', profiles: profilesFor(0), usesProfiles: false },
    { key: 'katsayı + kadro dokusu', profiles: profilesFor(0), usesProfiles: true },
    { key: 'saf kadro', profiles: profilesFor(1), usesProfiles: true },
    { key: 'harman 0.4', profiles: profilesFor(0.4), usesProfiles: true },
    { key: 'harman 0.6', profiles: profilesFor(0.6), usesProfiles: true },
    { key: 'harman 0.8', profiles: profilesFor(0.8), usesProfiles: true },
  ]
}

function fallbackCard(strength) {
  const overall = Math.round(strength / 2 + 42)
  return {
    goalkeeping: overall,
    defence: overall,
    midfield: overall,
    attack: overall,
    firstEleven: overall,
    depth: overall - 4,
    aggression: 70,
    size: 20,
  }
}

function baselineScores(matches) {
  const counts = { home: 0, draw: 0, away: 0 }
  for (const match of matches) counts[outcomeOf(match.homeGoals, match.awayGoals)] += 1
  const total = matches.length
  const rates = { home: counts.home / total, draw: counts.draw / total, away: counts.away / total }
  let logLoss = 0
  let brier = 0
  let hits = 0
  for (const match of matches) {
    const scored = scoreMatch(rates, outcomeOf(match.homeGoals, match.awayGoals))
    logLoss += scored.logLoss
    brier += scored.brier
    hits += scored.hit
  }
  return { logLoss: logLoss / total, brier: brier / total, hit: hits / total, rates }
}

function roundRobinFixtures(names) {
  const fixtures = []
  for (const home of names) {
    for (const away of names) {
      if (home !== away) fixtures.push({ home, away })
    }
  }
  return fixtures
}

function distributionFor(engine, model, fixture, seedPrefix, runs) {
  const home = withTempo(model.profiles.get(fixture.home))
  const away = withTempo(model.profiles.get(fixture.away))
  const counts = { home: 0, draw: 0, away: 0 }
  for (let run = 0; run < runs; run += 1) {
    const report = engine.simulateMatchReport(
      fakeTeam(fixture.home, home.strength),
      fakeTeam(fixture.away, away.strength),
      `${seedPrefix}:${fixture.home}:${fixture.away}:${run}`,
      UNPREDICTABILITY,
      model.usesProfiles ? { profiles: { home, away } } : {},
    )
    counts[outcomeOf(report.score.home, report.score.away)] += 1
  }
  return { home: counts.home / runs, draw: counts.draw / runs, away: counts.away / runs }
}

function mostLikely(distribution) {
  return ['home', 'draw', 'away'].sort((left, right) => distribution[right] - distribution[left])[0]
}

function expectedPoints(distribution) {
  return {
    home: distribution.home * 3 + distribution.draw,
    away: distribution.away * 3 + distribution.draw,
  }
}

async function runRoundRobin(engine, models, season) {
  const names = Object.keys(season.teams)
  const fixtures = roundRobinFixtures(names)
  console.log(`\n=== Ayrışma analizi · ${names.length} takım çift devreli · ${fixtures.length} maç · maç başına ${ROUND_ROBIN_RUNS} simülasyon`)
  console.log('(gerçek sonuç yok: bu doğruluk değil, modeller arası ayrışma ölçer)')

  const runs = [
    ...models.map((model) => ({ label: model.key, model, seed: 'RR' })),
    { label: `${models[0].key} [aynı model, farklı tohum]`, model: models[0], seed: 'RR2' },
  ]

  const tables = new Map()
  for (const entry of runs) {
    const distributions = fixtures.map((fixture) =>
      distributionFor(engine, entry.model, fixture, entry.seed, ROUND_ROBIN_RUNS),
    )
    const points = new Map(names.map((name) => [name, 0]))
    for (let index = 0; index < fixtures.length; index += 1) {
      const fixture = fixtures[index]
      const share = expectedPoints(distributions[index])
      points.set(fixture.home, points.get(fixture.home) + share.home)
      points.set(fixture.away, points.get(fixture.away) + share.away)
    }
    tables.set(entry.label, { distributions, points })
    console.log(`  ${entry.label} tamamlandı`)
  }

  const reference = models[0].key
  const referenceRun = tables.get(reference)
  console.log('\nkarşılaştırma (referans: ' + reference + ')')
  console.log('model                                   TVD    farklı favori   puan sapması')
  for (const [label, run] of tables) {
    if (label === reference) continue
    let totalVariation = 0
    let disagreements = 0
    for (let index = 0; index < fixtures.length; index += 1) {
      const left = referenceRun.distributions[index]
      const right = run.distributions[index]
      totalVariation +=
        (Math.abs(left.home - right.home) + Math.abs(left.draw - right.draw) + Math.abs(left.away - right.away)) / 2
      if (mostLikely(left) !== mostLikely(right)) disagreements += 1
    }
    let pointGap = 0
    for (const name of names) pointGap += Math.abs(referenceRun.points.get(name) - run.points.get(name))
    console.log(
      `${label.padEnd(38)} ${(totalVariation / fixtures.length).toFixed(4)}   %${((disagreements / fixtures.length) * 100).toFixed(1).padStart(5)}        ${(pointGap / names.length).toFixed(2)}`,
    )
  }

  const squadLabel = 'saf kadro'
  if (tables.has(squadLabel)) {
    const squadRun = tables.get(squadLabel)
    const rows = names
      .map((name) => ({
        name,
        reference: referenceRun.points.get(name),
        squad: squadRun.points.get(name),
      }))
      .map((row) => ({ ...row, delta: row.squad - row.reference }))
      .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    console.log(`\nbeklenen puan (${fixtures.length / names.length * 1} maç üzerinden) · en çok ayrışan 10 takım`)
    console.log('takım                        katsayı   saf kadro    fark')
    for (const row of rows.slice(0, 10)) {
      console.log(
        `${row.name.padEnd(28)} ${row.reference.toFixed(1).padStart(7)}   ${row.squad.toFixed(1).padStart(9)}   ${(row.delta >= 0 ? '+' : '') + row.delta.toFixed(1)}`,
      )
    }
  }
}

async function main() {
  const seasons = JSON.parse(readFileSync(SEASONS_PATH, 'utf8')).seasons
  const eaSquads = loadEaSquads()
  const { engine, dispose } = await loadEngine()

  for (const season of seasons) {
    const text = await cachedFetch(season.resultsUrl, `cl-${season.season}.txt`)
    const matches = parseResults(text)
    const tables = await coefficientTables(season.coefficientSeasonYear)
    const countryByTeam = new Map()
    for (const match of matches) {
      if (match.homeCountry !== null) countryByTeam.set(match.home, match.homeCountry)
      if (match.awayCountry !== null) countryByTeam.set(match.away, match.awayCountry)
    }
    const coefficients = coefficientStrengths(season, tables, countryByTeam)

    const models = buildModels(season, eaSquads, coefficients.strengths)
    const baseline = baselineScores(matches)

    console.log(`\n=== ${season.season} · ${matches.length} lig maçı · maç başına ${RUNS_PER_MATCH} simülasyon`)
    console.log(`katsayı: ${coefficients.total - coefficients.estimated} gerçek · ${coefficients.estimated} ülke katsayısından tahmin`)
    console.log(`gerçek dağılım: ev %${(baseline.rates.home * 100).toFixed(1)} · beraberlik %${(baseline.rates.draw * 100).toFixed(1)} · deplasman %${(baseline.rates.away * 100).toFixed(1)}`)
    console.log('\nmodel               log-loss   Brier   isabet   gol hatası')
    console.log(`sabit taban oran     ${baseline.logLoss.toFixed(4)}   ${baseline.brier.toFixed(4)}   %${(baseline.hit * 100).toFixed(1)}     —`)

    const perMatch = new Map()
    for (const model of models) {
      const losses = []
      let brier = 0
      let hits = 0
      let goalError = 0
      for (const match of matches) {
        const probabilities = predict(engine, model, match, season.season)
        const scored = scoreMatch(probabilities, outcomeOf(match.homeGoals, match.awayGoals))
        losses.push(scored.logLoss)
        brier += scored.brier
        hits += scored.hit
        goalError += probabilities.goalError
      }
      perMatch.set(model.key, losses)
      const total = matches.length
      const mean = losses.reduce((a, b) => a + b, 0) / total
      const variance = losses.reduce((a, b) => a + (b - mean) ** 2, 0) / (total - 1)
      const stdError = Math.sqrt(variance / total)
      console.log(
        `${model.key.padEnd(22)} ${mean.toFixed(4)} ±${stdError.toFixed(4)}   ${(brier / total).toFixed(4)}   %${((hits / total) * 100).toFixed(1)}     ${(goalError / total).toFixed(3)}`,
      )
    }

    console.log('\neşleştirilmiş karşılaştırma (aynı maçlarda log-loss farkı, negatif = ilki daha iyi)')
    const reference = 'katsayı (eski motor)'
    const referenceLosses = perMatch.get(reference)
    for (const [key, losses] of perMatch) {
      if (key === reference) continue
      const diffs = losses.map((value, index) => value - referenceLosses[index])
      const total = diffs.length
      const mean = diffs.reduce((a, b) => a + b, 0) / total
      const variance = diffs.reduce((a, b) => a + (b - mean) ** 2, 0) / (total - 1)
      const stdError = Math.sqrt(variance / total)
      const t = mean / stdError
      const verdict = Math.abs(t) >= 2 ? (mean < 0 ? 'ANLAMLI daha iyi' : 'ANLAMLI daha kötü') : 'ayırt edilemez'
      console.log(`  ${key.padEnd(24)} ${(mean >= 0 ? '+' : '')}${mean.toFixed(4)} ±${stdError.toFixed(4)}  t=${t.toFixed(2)}  ${verdict}`)
    }

    if (ROUND_ROBIN) await runRoundRobin(engine, models, season)

    const strengthRows = models.map((model) => ({
      key: model.key,
      values: Object.keys(season.teams).map((name) => model.profiles.get(name).strength),
    }))
    function correlation(left, right) {
      const n = left.length
      const meanLeft = left.reduce((a, b) => a + b, 0) / n
      const meanRight = right.reduce((a, b) => a + b, 0) / n
      let top = 0, sqLeft = 0, sqRight = 0
      for (let i = 0; i < n; i += 1) {
        const dl = left[i] - meanLeft, dr = right[i] - meanRight
        top += dl * dr; sqLeft += dl * dl; sqRight += dr * dr
      }
      return top / Math.sqrt(sqLeft * sqRight)
    }
    const coefficientValues = strengthRows.find((row) => row.key === reference).values
    const squadValues = strengthRows.find((row) => row.key === 'saf kadro').values
    console.log(`\nkatsayı ile kadro gücü korelasyonu: ${correlation(coefficientValues, squadValues).toFixed(3)}`)
  }

  await dispose()
}

await main()
