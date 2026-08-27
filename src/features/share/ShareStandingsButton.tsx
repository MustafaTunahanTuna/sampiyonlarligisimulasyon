import { ShareButton } from './ShareButton'
import { renderStandingsCard } from './standingsCard'
import { slugify } from './shareFile'
import type { StandingsCardInput } from './standingsCard'

export function ShareStandingsButton(input: StandingsCardInput) {
  return (
    <ShareButton
      label="Tabloyu paylaş"
      fileName={`puan-tablosu-${slugify(input.seed)}.png`}
      title="Şampiyonlar Ligi puan tablosu tahminim"
      renderCard={() => renderStandingsCard(input)}
    />
  )
}
