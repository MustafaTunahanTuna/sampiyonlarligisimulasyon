import { Button } from '../../components/Button'
import { ClubCrest } from '../../components/ClubCrest'
import type { Team } from '../../domain/types'

interface SelectionBarProps {
  draftTeam: Team | null
  currentTeam: Team | null
  onConfirm: (team: Team) => void
  onCancel: () => void
}

export function SelectionBar({ draftTeam, currentTeam, onConfirm, onCancel }: SelectionBarProps) {
  const isUnchanged = draftTeam !== null && draftTeam.id === currentTeam?.id

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
        {draftTeam === null ? (
          <p className="text-sm text-muted">
            Listeden bir kulüp seç — seçimin burada onayına sunulur.
          </p>
        ) : (
          <>
            <ClubCrest team={draftTeam} size={40} />
            <div className="min-w-0">
              <p className="eyebrow text-muted">Seçilen</p>
              <p className="truncate font-display text-lg font-extrabold uppercase tracking-tight">
                {draftTeam.name}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Button variant="ghost" onClick={onCancel}>
                Vazgeç
              </Button>
              <Button
                variant="primary"
                disabled={isUnchanged}
                onClick={() => onConfirm(draftTeam)}
              >
                {isUnchanged ? 'Zaten takip ediliyor' : 'Takımım olarak onayla'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
