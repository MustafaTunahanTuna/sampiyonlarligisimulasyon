import { SelectMenu } from './SelectMenu'
import { LOCALES, LOCALE_NAME } from '../i18n/locale'
import { useLocale } from '../i18n/useLocale'
import { useTranslation } from '../i18n/useTranslation'

const OPTIONS = LOCALES.map((locale) => ({
  value: locale,
  label: LOCALE_NAME[locale],
  hint: locale,
}))

export function LocaleSwitch() {
  const { locale, setLocale } = useLocale()
  const t = useTranslation()

  return (
    <SelectMenu
      value={locale}
      options={OPTIONS}
      label={t.layout.languageGroup}
      triggerText={LOCALE_NAME[locale]}
      variant="control"
      alignEnd
      onChange={setLocale}
    />
  )
}
