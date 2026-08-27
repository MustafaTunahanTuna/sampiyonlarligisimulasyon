import { ShareButton } from './ShareButton'
import { renderTeamCard } from './teamCard'
import { slugify } from './shareFile'
import type { TeamCardInput } from './teamCard'

export function ShareTeamButton(input: TeamCardInput) {
  return (
    <ShareButton
      label="Takım kartı"
      variant="primary"
      fileName={`${slugify(input.team.name)}-${slugify(input.seed)}.png`}
      title={`${input.team.name} — Şampiyonlar Ligi tahminim`}
      renderCard={() => renderTeamCard(input)}
    />
  )
}
