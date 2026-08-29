import { ClubCrest } from '../../components/ClubCrest'
import { QUALIFICATION_TONE } from './qualificationTone'
import { useTranslation } from '../../i18n/useTranslation'
import type { StandingRow } from '../../domain/types'

interface StandingsRowProps {
  row: StandingRow
  isFavourite: boolean
  onOpen: () => void
}

export function StandingsRow({ row, isFavourite, onOpen }: StandingsRowProps) {
  const t = useTranslation()

  return (
    <tr
      onClick={onOpen}
      className={`cursor-pointer transition-colors hover:bg-raised/70 ${
        isFavourite ? 'bg-raised text-fg' : 'text-muted'
      }`}
    >
      <td className={`border-l-2 py-2 pl-3 pr-2 text-right tabular-nums ${QUALIFICATION_TONE[row.qualification]}`}>
        {row.position}
      </td>
      <td className="py-2 pr-3">
        <button
          type="button"
          onClick={onOpen}
          title={t.standings.openTeam(row.team.name)}
          className="flex w-full items-center gap-2.5 text-left transition-colors hover:text-accent"
        >
          <ClubCrest team={row.team} size={22} />
          <span className={`truncate ${isFavourite ? 'font-bold text-fg' : 'font-semibold'}`}>
            {row.team.name}
          </span>
        </button>
      </td>
      <td className="hidden py-2 pr-3 text-right tabular-nums xs:table-cell">{row.played}</td>
      <td className="hidden py-2 pr-3 text-right tabular-nums sm:table-cell">{row.wins}</td>
      <td className="hidden py-2 pr-3 text-right tabular-nums sm:table-cell">{row.draws}</td>
      <td className="hidden py-2 pr-3 text-right tabular-nums sm:table-cell">{row.losses}</td>
      <td className="hidden py-2 pr-3 text-right tabular-nums md:table-cell">
        {row.goalsFor}:{row.goalsAgainst}
      </td>
      <td className="py-2 pr-3 text-right tabular-nums">
        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
      </td>
      <td className="py-2 pr-3 text-right font-display font-extrabold tabular-nums text-fg">
        {row.points}
      </td>
    </tr>
  )
}
