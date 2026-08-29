import type { ReactNode } from 'react'
import { StandingsRow } from './StandingsRow'
import { QUALIFICATION_TEXT_TONE } from './qualificationTone'
import { QUALIFICATION_LABEL } from '../../domain/standings'
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
  if (!hasPredictions) {
    return (
      <section id={STANDINGS_ANCHOR_ID} className="scroll-mt-6">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">Puan tablosu</h2>
        <p className="mt-4 max-w-md text-sm text-muted">
          Tablo tahminlerinden oluşur. Skorları elle girerek ya da sezonu simüle ederek başla —
          36 takımın sıralaması anında hesaplanır.
        </p>
      </section>
    )
  }

  return (
    <section id={STANDINGS_ANCHOR_ID} className="scroll-mt-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line-strong pb-3">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">Puan tablosu</h2>
        {shareAction}
        <ul className="eyebrow flex w-full flex-wrap gap-x-4 gap-y-1">
          {ZONES.map((zone) => (
            <li key={zone} className={QUALIFICATION_TEXT_TONE[zone]}>
              {QUALIFICATION_LABEL[zone]}
            </li>
          ))}
        </ul>
      </header>

      <div className="scroll-area overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="eyebrow text-dim">
              <th scope="col" className="py-2 pl-3 pr-2 text-right font-semibold">#</th>
              <th scope="col" className="py-2 pr-3 text-left font-semibold">Takım</th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold xs:table-cell">O</th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold sm:table-cell">G</th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold sm:table-cell">B</th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold sm:table-cell">M</th>
              <th scope="col" className="hidden py-2 pr-3 text-right font-semibold md:table-cell">Gol</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Av</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">P</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <StandingsRow
                key={row.team.id}
                row={row}
                isFavourite={row.team.id === favouriteTeam?.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
