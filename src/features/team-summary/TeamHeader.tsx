import { Button } from '../../components/Button'
import { ClubCrest } from '../../components/ClubCrest'
import { PotBadge } from '../../components/PotBadge'
import type { Team } from '../../domain/types'

interface TeamHeaderProps {
  team: Team
  onChangeTeam: () => void
  onReleaseTeam: () => void
}

export function TeamHeader({ team, onChangeTeam, onReleaseTeam }: TeamHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <ClubCrest team={team} size={88} large />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-3">
          <PotBadge pot={team.pot} />
          <img src={team.associationLogo} alt="" width={18} height={18} className="opacity-70" />
          <span className="text-xs text-muted">{team.countryName}</span>
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl">
          {team.name}
        </h1>
        <p className="mt-2 text-sm text-muted">{team.officialName}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onReleaseTeam} className="px-3">
          Takibi bırak
        </Button>
        <Button variant="secondary" onClick={onChangeTeam}>
          Takımı değiştir
        </Button>
      </div>
    </header>
  )
}
