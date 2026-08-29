import { LOCALES } from '../i18n/locale'
import { useLocale } from '../i18n/useLocale'
import { useTranslation } from '../i18n/useTranslation'

export function LocaleSwitch() {
  const { locale, setLocale } = useLocale()
  const t = useTranslation()

  return (
    <div role="group" aria-label={t.layout.languageGroup} className="flex rounded-pill bg-surface p-0.5">
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={locale === option}
          onClick={() => setLocale(option)}
          className={`rounded-pill px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide transition-colors ${
            locale === option ? 'bg-accent text-canvas' : 'text-muted hover:text-fg'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
