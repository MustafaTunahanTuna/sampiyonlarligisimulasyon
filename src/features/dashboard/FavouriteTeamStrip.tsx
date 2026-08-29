import { Button } from '../../components/Button'
import { ClubCrest } from '../../components/ClubCrest'
import { QUALIFICATION_TEXT_TONE } from '../standings/qualificationTone'
import { useTranslation } from '../../i18n/useTranslation'
import type { StandingRow } from '../../domain/types'

interface FavouriteTeamStripProps {
  standing: StandingRow
  hasPredictions: boolean
  onOpenTeam: () => void
  onChangeTeam: () => void
}

export function FavouriteTeamStrip({
  standing,
  hasPredictions,
  onOpenTeam,
  onChangeTeam,
}: FavouriteTeamStripProps) {
  const t = useTranslation()

  return (
    <div className="panel flex w-full items-center gap-4 px-4 py-3">
      <ClubCrest team={standing.team} size={44} />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-muted">{t.dashboard.yourTeam}</p>
        <p className="font-display text-xl font-extrabold uppercase tracking-tight">
          {standing.team.name}
        </p>
      </div>
      {hasPredictions && (
        <div className="hidden text-right xs:block">
          <p className="font-display text-2xl font-extrabold tabular-nums">
            {standing.position}.
            <span className="pl-2 text-base text-muted">{t.dashboard.points(standing.points)}</span>
          </p>
          <p className={`eyebrow ${QUALIFICATION_TEXT_TONE[standing.qualification]}`}>
            {t.standings.qualificationOutcome[standing.qualification]}
          </p>
        </div>
      )}
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" onClick={onChangeTeam} className="px-3">
          {t.dashboard.changeTeam}
        </Button>
        <Button variant="secondary" onClick={onOpenTeam}>
          {t.dashboard.openPanel}
        </Button>
      </div>
    </div>
  )
}
