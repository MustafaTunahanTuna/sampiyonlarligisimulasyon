import { DownloadCardButton } from './DownloadCardButton'
import { renderStandingsCard } from './standingsCard'
import { slugify } from './shareFile'
import { useLocale } from '../../i18n/useLocale'
import type { StandingsCardInput } from './standingsCard'

type DownloadStandingsButtonProps = Omit<StandingsCardInput, 'text'>

export function DownloadStandingsButton(input: DownloadStandingsButtonProps) {
  const { locale, messages: t } = useLocale()

  return (
    <DownloadCardButton
      label={t.share.downloadStandings}
      fileName={`${t.share.fileStandings}-${slugify(input.seed, locale)}.png`}
      renderCard={() => renderStandingsCard({ ...input, text: { locale, t } })}
    />
  )
}
