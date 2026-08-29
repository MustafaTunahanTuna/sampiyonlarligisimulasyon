import { Button } from '../../components/Button'
import { Starball } from '../../components/Starball'
import { useTranslation } from '../../i18n/useTranslation'

interface PickTeamCalloutProps {
  onPickTeam: () => void
}

export function PickTeamCallout({ onPickTeam }: PickTeamCalloutProps) {
  const t = useTranslation()

  return (
    <section className="panel flex flex-wrap items-center gap-x-6 gap-y-4 p-6">
      <Starball className="size-8 shrink-0 text-accent" />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
          {t.dashboard.pickTeamTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{t.dashboard.pickTeamBody}</p>
      </div>
      <Button variant="primary" onClick={onPickTeam}>
        {t.dashboard.pickTeamAction}
      </Button>
    </section>
  )
}
