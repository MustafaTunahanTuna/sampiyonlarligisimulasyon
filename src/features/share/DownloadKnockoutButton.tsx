import { DownloadCardButton } from './DownloadCardButton'
import { renderKnockoutCard } from './knockoutCard'
import { slugify } from './shareFile'
import { useLocale } from '../../i18n/useLocale'
import type { KnockoutCardInput } from './knockoutCard'

type DownloadKnockoutButtonProps = Omit<KnockoutCardInput, 'text'>

export function DownloadKnockoutButton(input: DownloadKnockoutButtonProps) {
  const { locale, messages: t } = useLocale()

  return (
    <DownloadCardButton
      label={t.share.downloadKnockout}
      fileName={`${t.share.fileKnockout}-${slugify(input.seed, locale)}.png`}
      renderCard={() => renderKnockoutCard({ ...input, text: { locale, t } })}
    />
  )
}
