import { DownloadCardButton } from './DownloadCardButton'
import { renderKnockoutCard } from './knockoutCard'
import { slugify } from './shareFile'
import type { KnockoutCardInput } from './knockoutCard'

export function DownloadKnockoutButton(input: KnockoutCardInput) {
  return (
    <DownloadCardButton
      label="Nakavt kartını indir"
      fileName={`nakavt-${slugify(input.seed)}.png`}
      renderCard={() => renderKnockoutCard(input)}
    />
  )
}
