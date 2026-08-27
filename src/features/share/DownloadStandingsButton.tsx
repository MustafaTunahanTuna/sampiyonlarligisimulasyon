import { DownloadCardButton } from './DownloadCardButton'
import { renderStandingsCard } from './standingsCard'
import { slugify } from './shareFile'
import type { StandingsCardInput } from './standingsCard'

export function DownloadStandingsButton(input: StandingsCardInput) {
  return (
    <DownloadCardButton
      label="Tabloyu indir"
      fileName={`puan-tablosu-${slugify(input.seed)}.png`}
      renderCard={() => renderStandingsCard(input)}
    />
  )
}
