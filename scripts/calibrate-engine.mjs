import { mkdtemp, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rolldown } from 'rolldown'

const ROOT = resolve(import.meta.dirname, '..')
const ENGINE_ENTRY = join(ROOT, 'src/domain/engine/index.ts')
const ODDS_ENTRY = join(ROOT, 'src/domain/simulation.ts')
const POOL_PATH = join(ROOT, 'src/data/league-phase-2026-27.json')
const SAMPLE_SIZE = Number(process.env.SAMPLE_SIZE ?? 20000)
const UNPREDICTABILITY = 0.25

async function loadEngine() {
  const outDir = await mkdtemp(join(tmpdir(), 'ucl-engine-'))
  const bundle = await rolldown({
    input: { engine: ENGINE_ENTRY, odds: ODDS_ENTRY },
    platform: 'node',
  })
  await bundle.write({ dir: outDir, format: 'esm', entryFileNames: '[name].mjs' })
  await bundle.close()
  const engine = await import(pathToFileURL(join(outDir, 'engine.mjs')).href)
  const odds = await import(pathToFileURL(join(outDir, 'odds.mjs')).href)
  return { engine, odds, dispose: () => rm(outDir, { recursive: true, force: true }) }
}

function createAccumulator() {
  return {
    matches: 0,
    homeGoals: 0,
    awayGoals: 0,
    draws: 0,
    homeWins: 0,
    shots: 0,
    onTarget: 0,
    corners: 0,
    yellows: 0,
    reds: 0,
    penalties: 0,
    possession: 0,
    lambdaGoals: 0,
    invariantFailures: 0,
  }
}

function goalEventCount(report, side) {
  return report.timeline.filter(
    (event) => event.side === side && (event.kind === 'GOAL' || event.kind === 'PENALTY_GOAL'),
  ).length
}

function accumulate(totals, report) {
  totals.matches += 1
  totals.homeGoals += report.score.home
  totals.awayGoals += report.score.away
  if (report.score.home === report.score.away) totals.draws += 1
  if (report.score.home > report.score.away) totals.homeWins += 1
  totals.shots += report.stats.home.shots + report.stats.away.shots
  totals.onTarget += report.stats.home.shotsOnTarget + report.stats.away.shotsOnTarget
  totals.corners += report.stats.home.corners + report.stats.away.corners
  totals.yellows += report.stats.home.yellowCards + report.stats.away.yellowCards
  totals.reds += report.stats.home.redCards + report.stats.away.redCards
  totals.penalties += report.timeline.filter((event) => event.kind === 'PENALTY_AWARDED').length
  totals.possession += report.stats.home.possession + report.stats.away.possession

  if (
    goalEventCount(report, 'home') !== report.score.home ||
    goalEventCount(report, 'away') !== report.score.away
  ) {
    totals.invariantFailures += 1
  }
}

function monotonicityBuckets() {
  return [0, 1, 2, 3].map(() => ({ played: 0, favouriteWins: 0 }))
}

function bucketFor(diff) {
  if (diff < 10) return 0
  if (diff < 25) return 1
  if (diff < 45) return 2
  return 3
}

function run(engine, odds, pool) {
  const totals = createAccumulator()
  const buckets = monotonicityBuckets()
  const teamsById = new Map(pool.teams.map((team) => [team.id, team]))
  const rounds = Math.max(1, Math.round(SAMPLE_SIZE / pool.matches.length))

  for (let round = 0; round < rounds; round += 1) {
    for (const match of pool.matches) {
      const home = teamsById.get(match.homeTeamId)
      const away = teamsById.get(match.awayTeamId)
      const report = engine.simulateMatchReport(home, away, `CAL${round}:${match.id}`, UNPREDICTABILITY)
      accumulate(totals, report)

      const lambda = odds.expectedGoals(home, away, UNPREDICTABILITY)
      totals.lambdaGoals += lambda.expectedHomeGoals + lambda.expectedAwayGoals

      const bucket = buckets[bucketFor(Math.abs(home.strength - away.strength))]
      bucket.played += 1
      const favouriteIsHome = home.strength >= away.strength
      const favouriteWon = favouriteIsHome
        ? report.score.home > report.score.away
        : report.score.away > report.score.home
      if (favouriteWon) bucket.favouriteWins += 1
    }
  }

  return { totals, buckets }
}

function checkDeterminism(engine, teams) {
  const [home, away] = teams
  const first = engine.simulateMatchReport(home, away, 'DET', UNPREDICTABILITY)
  const second = engine.simulateMatchReport(home, away, 'DET', UNPREDICTABILITY)
  return JSON.stringify(first) === JSON.stringify(second)
}

function row(label, value, min, max, format = (input) => input.toFixed(2)) {
  const passed = value >= min && value <= max
  return { label, text: format(value), range: `${format(min)} – ${format(max)}`, passed }
}

function report(totals, buckets, deterministic) {
  const perMatch = (value) => value / totals.matches
  const percent = (value) => (value / totals.matches) * 100
  const asPercent = (input) => `%${input.toFixed(1)}`

  const rows = [
    row('Maç başına toplam gol', perMatch(totals.homeGoals + totals.awayGoals), 2.7, 3.35),
    row('Ev sahibi gol ortalaması', perMatch(totals.homeGoals), 1.4, 1.85),
    row('Deplasman gol ortalaması', perMatch(totals.awayGoals), 1.15, 1.55),
    row('Beraberlik oranı', percent(totals.draws), 19, 29, asPercent),
    row('Ev sahibi galibiyet oranı', percent(totals.homeWins), 39, 51, asPercent),
    row('Takım başına şut', perMatch(totals.shots) / 2, 9, 16),
    row('İsabetli şut oranı', (totals.onTarget / totals.shots) * 100, 28, 45, asPercent),
    row('Takım başına korner', perMatch(totals.corners) / 2, 3, 8),
    row('Maç başına sarı kart', perMatch(totals.yellows), 2.5, 5),
    row('Maç başına kırmızı kart', perMatch(totals.reds), 0.02, 0.25),
    row('Maç başına penaltı', perMatch(totals.penalties), 0.1, 0.5),
    row('Topa sahip olma toplamı', perMatch(totals.possession), 99.5, 100.5),
    row(
      'Poisson λ sapması',
      ((totals.homeGoals + totals.awayGoals) / totals.lambdaGoals - 1) * 100,
      -6,
      6,
      asPercent,
    ),
  ]

  const winRates = buckets.map((bucket) =>
    bucket.played === 0 ? 0 : bucket.favouriteWins / bucket.played,
  )
  const monotonic = winRates.every((rate, index) => index === 0 || rate >= winRates[index - 1] - 0.01)

  console.log(`\nÖrneklem: ${totals.matches} maç · unpredictability ${UNPREDICTABILITY}\n`)
  for (const entry of rows) {
    console.log(
      `${entry.passed ? 'PASS' : 'FAIL'}  ${entry.label.padEnd(28)} ${entry.text.padStart(8)}  hedef ${entry.range}`,
    )
  }
  console.log(
    `${monotonic ? 'PASS' : 'FAIL'}  ${'Güç monotonluğu'.padEnd(28)} ${winRates.map((rate) => `%${(rate * 100).toFixed(0)}`).join(' → ')}`,
  )
  console.log(
    `${totals.invariantFailures === 0 ? 'PASS' : 'FAIL'}  ${'Skor = gol olayı sayısı'.padEnd(28)} ${totals.invariantFailures} ihlal`,
  )
  console.log(`${deterministic ? 'PASS' : 'FAIL'}  ${'Determinizm'.padEnd(28)}`)

  return rows.every((entry) => entry.passed) && monotonic && totals.invariantFailures === 0 && deterministic
}

const { engine, odds, dispose } = await loadEngine()
try {
  const pool = JSON.parse(readFileSync(POOL_PATH, 'utf8'))
  const startedAt = performance.now()
  const { totals, buckets } = run(engine, odds, pool)
  const msPerMatch = (performance.now() - startedAt) / totals.matches
  const ok = report(totals, buckets, checkDeterminism(engine, pool.teams))
  console.log(`
Maç başına simülasyon süresi: ${msPerMatch.toFixed(3)} ms`)
  if (!ok) process.exitCode = 1
} finally {
  await dispose()
}
