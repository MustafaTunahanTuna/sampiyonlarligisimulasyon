import { useState } from 'react'
import type { ReactNode } from 'react'
import { StandingsRow } from './StandingsRow'
import { TeamFixturesModal } from './TeamFixturesModal'
import { QUALIFICATION_TEXT_TONE } from './qualificationTone'
import { useTranslation } from '../../i18n/useTranslation'
import type { Qualification } from '../../domain/standings'
import { STANDINGS_ANCHOR_ID } from './standingsAnchor'
import type { StandingRow, Team } from '../../domain/types'

const ZONES: Qualification[] = ['LAST_16', 'PLAY_OFF', 'ELIMINATED']

interface StandingsTableProps {
  rows: StandingRow[]
  favouriteTeam: Team | null
  hasPredictions: boolean
  shareAction?: ReactNode
}

export function StandingsTable({
  rows,
  favouriteTeam,
  hasPredictions,
  shareAction,
}: StandingsTableProps) {
  const t = useTranslation()
  const [openTeamId, setOpenTeamId] = useState<string | null>(null)
  const openStanding = rows.find((row) => row.team.id === openTeamId) ?? null

  if (!hasPredictions) {
    return (
      <section id={STANDINGS_ANCHOR_ID} className="scroll-mt-6">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
          {t.standings.title}
        </h2>
        <p className="mt-4 max-w-md text-sm text-muted">{t.standings.empty}</p>
      </section>
    )
  }

  return (
    <section id={STANDINGS_ANCHOR_ID} className="scroll-mt-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line-strong pb-3">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
          {t.standings.title}
        </h2>
        {shareAction}
        <ul className="eyebrow flex w-full flex-wrap gap-x-4 gap-y-1">
          {ZONES.map((zone) => (
            <li key={zone} className={QUALIFICATION_TEXT_TONE[zone]}>
              {t.standings.qualificationZone[zone]}
            </li>
          ))}
        </ul>
      </header>

      <div className="scroll-area overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="eyebrow text-dim">
              <th scope="col" className="py-2 pl-3 pr-2 text-right font-semibold">
                {t.standings.columnPosition}
              </th>
              <th scope="col" className="py-2 pr-3 text-left font-semibold">{t.standings.columnTeam}</th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold xs:table-cell">
                {t.standings.columnPlayed}
              </th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold sm:table-cell">
                {t.standings.columnWins}
              </th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold sm:table-cell">
                {t.standings.columnDraws}
              </th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold sm:table-cell">
                {t.standings.columnLosses}
              </th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold md:table-cell">
                {t.standings.columnGoals}
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">
                {t.standings.columnGoalDifference}
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">{t.standings.columnPoints}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <StandingsRow
                key={row.team.id}
                row={row}
                isFavourite={row.team.id === favouriteTeam?.id}
                onOpen={() => setOpenTeamId(row.team.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {openStanding !== null && (
        <TeamFixturesModal
          key={openStanding.team.id}
          standing={openStanding}
          onClose={() => setOpenTeamId(null)}
        />
      )}
    </section>
  )
}
