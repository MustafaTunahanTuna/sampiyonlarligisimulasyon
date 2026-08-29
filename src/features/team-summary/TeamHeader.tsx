import { Button } from '../../components/Button'
import { ClubCrest } from '../../components/ClubCrest'
import { PotBadge } from '../../components/PotBadge'
import { countryNameOf } from '../../i18n/countryNames'
import { useLocale } from '../../i18n/useLocale'
import type { Team } from '../../domain/types'

interface TeamHeaderProps {
  team: Team
  onChangeTeam: () => void
  onReleaseTeam: () => void
}

export function TeamHeader({ team, onChangeTeam, onReleaseTeam }: TeamHeaderProps) {
  const { locale, messages: t } = useLocale()

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <ClubCrest team={team} size={88} large />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-3">
          <PotBadge pot={team.pot} />
          <img src={team.associationLogo} alt="" width={18} height={18} className="opacity-70" />
          <span className="text-xs text-muted">{countryNameOf(team, locale)}</span>
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl">
          {team.name}
        </h1>
        <p className="mt-2 text-sm text-muted">{team.officialName}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onReleaseTeam} className="px-3">
          {t.team.release}
        </Button>
        <Button variant="secondary" onClick={onChangeTeam}>
          {t.team.changeTeam}
        </Button>
      </div>
    </header>
  )
}
