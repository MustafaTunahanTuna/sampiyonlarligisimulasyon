import { QUALIFICATION_TEXT_TONE } from '../standings/qualificationTone'
import { useTranslation } from '../../i18n/useTranslation'
import type { SeasonRecord, StandingRow } from '../../domain/types'

interface SeasonSummaryProps {
  record: SeasonRecord
  totalFixtures: number
  standing: StandingRow
}

function Stat({ label, value, tone = 'text-fg' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="border-l border-line pl-4">
      <dt className="eyebrow text-muted">{label}</dt>
      <dd className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${tone}`}>{value}</dd>
    </div>
  )
}

export function SeasonSummary({ record, totalFixtures, standing }: SeasonSummaryProps) {
  const t = useTranslation()

  if (record.played === 0) {
    return (
      <p className="border-l border-line py-1 pl-4 text-sm text-muted">
        {t.team.emptySeason(totalFixtures)}
      </p>
    )
  }

  return (
    <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
      <Stat
        label={t.team.statPosition}
        value={t.team.positionValue(standing.position)}
        tone={QUALIFICATION_TEXT_TONE[standing.qualification]}
      />
      <Stat label={t.team.statPoints} value={String(record.points)} />
      <Stat label={t.team.statRecord} value={`${record.wins}-${record.draws}-${record.losses}`} />
      <Stat label={t.team.statGoals} value={`${record.goalsFor}:${record.goalsAgainst}`} />
      <div className="col-span-2 border-l border-line pl-4 sm:col-span-4">
        <p className={`eyebrow ${QUALIFICATION_TEXT_TONE[standing.qualification]}`}>
          {t.standings.qualificationOutcome[standing.qualification]}
          <span className="pl-3 text-muted">
            {t.team.predictedCount(record.played, totalFixtures)}
          </span>
        </p>
      </div>
    </dl>
  )
}
