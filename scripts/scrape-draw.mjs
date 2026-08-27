import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fetchAssociationCoefficients,
  fetchClubCoefficients,
  fetchDraw,
  fetchMatches,
  fetchTeams,
} from './uefa-api.mjs'
import { buildDrawPool } from './build-draw-pool.mjs'
import { validateDrawPool } from './validate-draw-pool.mjs'

const DRAW_ID = '6da15cf2-3c1f-47fa-83ab-bce3f0986647'
const COMPETITION_ID = '1'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(projectRoot, 'src/data/league-phase-2026-27.json')

const draw = await fetchDraw(DRAW_ID)
const [round] = draw.rounds
const teamIds = round.result.groups[0].teamSlots.flatMap((slot) => slot.teamIds)

const [rawTeams, rawMatches, clubCoefficients, associationCoefficients] = await Promise.all([
  fetchTeams(teamIds),
  fetchMatches({
    competitionId: COMPETITION_ID,
    seasonYear: draw.seasonYear,
    roundId: round.roundId,
  }),
  fetchClubCoefficients(draw.seasonYear),
  fetchAssociationCoefficients(draw.seasonYear),
])

const pool = buildDrawPool({
  draw,
  rawTeams,
  rawMatches,
  clubCoefficients,
  associationCoefficients,
})
validateDrawPool(pool)

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(pool, null, 2)}\n`, 'utf8')

const withScores = pool.matches.filter((match) => match.score !== null).length
console.log(
  `${pool.teams.length} teams, ${pool.matches.length} matches (${withScores} with scores) -> ${outputPath}`,
)
