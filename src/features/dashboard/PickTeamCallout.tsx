import { Button } from '../../components/Button'
import { Starball } from '../../components/Starball'

interface PickTeamCalloutProps {
  onPickTeam: () => void
}

export function PickTeamCallout({ onPickTeam }: PickTeamCalloutProps) {
  return (
    <section className="panel flex flex-wrap items-center gap-x-6 gap-y-4 p-6">
      <Starball className="size-8 shrink-0 text-accent" />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
          Takımını seç
        </h2>
        <p className="mt-1 text-sm text-muted">
          Bir kulüp seç; sekiz eşleşmesi, sıralaması ve paylaşılabilir kartı senin olsun.
        </p>
      </div>
      <Button variant="primary" onClick={onPickTeam}>
        Takım seç
      </Button>
    </section>
  )
}
