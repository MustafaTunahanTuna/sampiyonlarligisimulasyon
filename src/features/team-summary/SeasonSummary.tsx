import { QUALIFICATION_LABEL } from '../../domain/standings'
import { QUALIFICATION_TEXT_TONE } from '../standings/qualificationTone'
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
  if (record.played === 0) {
    return (
      <p className="border-l border-line py-1 pl-4 text-sm text-muted">
        Bu takımın {totalFixtures} eşleşmesi belli. Skorları elle gir ya da sezonu simüle et —
        puan tablosu ve paylaşılabilir görsel anında oluşur.
      </p>
    )
  }

  return (
    <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
      <Stat label="Sıra" value={`${standing.position}.`} tone={QUALIFICATION_TEXT_TONE[standing.qualification]} />
      <Stat label="Puan" value={String(record.points)} />
      <Stat label="G / B / M" value={`${record.wins}-${record.draws}-${record.losses}`} />
      <Stat label="Averaj" value={`${record.goalsFor}:${record.goalsAgainst}`} />
      <div className="col-span-2 border-l border-line pl-4 sm:col-span-4">
        <p className={`eyebrow ${QUALIFICATION_TEXT_TONE[standing.qualification]}`}>
          {QUALIFICATION_LABEL[standing.qualification]}
          <span className="pl-3 text-muted">
            {record.played}/{totalFixtures} maç tahmin edildi
          </span>
        </p>
      </div>
    </dl>
  )
}
