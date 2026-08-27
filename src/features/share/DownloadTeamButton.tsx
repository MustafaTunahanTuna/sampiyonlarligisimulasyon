import { DownloadCardButton } from './DownloadCardButton'
import { renderTeamCard } from './teamCard'
import { slugify } from './shareFile'
import type { TeamCardInput } from './teamCard'

export function DownloadTeamButton(input: TeamCardInput) {
  return (
    <DownloadCardButton
      label="Takım kartını indir"
      variant="primary"
      fileName={`${slugify(input.team.name)}-${slugify(input.seed)}.png`}
      renderCard={() => renderTeamCard(input)}
    />
  )
}
