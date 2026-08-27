import { TeamOption } from './TeamOption'
import type { PotNumber, Team } from '../../domain/types'

interface PotColumnProps {
  pot: PotNumber
  teams: Team[]
  draftTeamId: string | null
  currentTeamId: string | null
  onDraft: (team: Team) => void
}

export function PotColumn({ pot, teams, draftTeamId, currentTeamId, onDraft }: PotColumnProps) {
  return (
    <section className="min-w-0">
      <h3 className="eyebrow flex items-baseline gap-2 border-b border-line pb-2 text-muted">
        <span className="text-accent tabular-nums">{String(pot).padStart(2, '0')}</span>
        <span>Torba</span>
        <span className="ml-auto tabular-nums normal-case tracking-normal">{teams.length}</span>
      </h3>
      <ul className="mt-2 space-y-0.5">
        {teams.map((team) => (
          <li key={team.id}>
            <TeamOption
              team={team}
              isDraft={team.id === draftTeamId}
              isCurrent={team.id === currentTeamId}
              onDraft={onDraft}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
