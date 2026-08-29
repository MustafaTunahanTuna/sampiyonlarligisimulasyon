import { DownloadCardButton } from './DownloadCardButton'
import { renderTeamCard } from './teamCard'
import { slugify } from './shareFile'
import { useLocale } from '../../i18n/useLocale'
import type { TeamCardInput } from './teamCard'

type DownloadTeamButtonProps = Omit<TeamCardInput, 'text'>

export function DownloadTeamButton(input: DownloadTeamButtonProps) {
  const { locale, messages: t } = useLocale()

  return (
    <DownloadCardButton
      label={t.share.downloadTeam}
      variant="primary"
      fileName={`${slugify(input.team.name, locale)}-${slugify(input.seed, locale)}.png`}
      renderCard={() => renderTeamCard({ ...input, text: { locale, t } })}
    />
  )
}
