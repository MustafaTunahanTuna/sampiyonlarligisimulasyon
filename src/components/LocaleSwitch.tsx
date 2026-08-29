import { useCallback, useRef, useState } from 'react'
import { LOCALES, LOCALE_NAME } from '../i18n/locale'
import { useLocale } from '../i18n/useLocale'
import { useTranslation } from '../i18n/useTranslation'
import { useDismissOnOutside } from '../hooks/useDismissOnOutside'
import type { Locale } from '../i18n/locale'

const OPTION_BASE =
  'flex w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left font-display text-xs font-bold uppercase tracking-wide transition-colors'

function optionStyle(isSelected: boolean): string {
  return isSelected
    ? `${OPTION_BASE} bg-accent/15 text-accent ring-1 ring-accent/45`
    : `${OPTION_BASE} text-muted hover:bg-surface hover:text-fg`
}

function triggerStyle(isOpen: boolean): string {
  const base =
    'flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide transition-colors'
  return isOpen
    ? `${base} bg-accent/15 text-accent ring-1 ring-accent/45`
    : `${base} bg-surface text-muted hover:text-fg`
}

export function LocaleSwitch() {
  const { locale, setLocale } = useLocale()
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsOpen(false), [])
  useDismissOnOutside(container, isOpen, close)

  function choose(next: Locale) {
    setLocale(next)
    setIsOpen(false)
  }

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t.layout.languageGroup}
        onClick={() => setIsOpen((open) => !open)}
        className={triggerStyle(isOpen)}
      >
        {locale}
        <span aria-hidden className="text-[0.5rem] leading-none opacity-70">
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={t.layout.languageGroup}
          className="panel absolute right-0 top-full z-40 mt-2 w-44 animate-rise space-y-0.5 bg-canvas/95 p-1 shadow-xl shadow-black/40 backdrop-blur-md"
        >
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={locale === option}
              onClick={() => choose(option)}
              className={optionStyle(locale === option)}
            >
              <span className="w-5 shrink-0 opacity-60">{option}</span>
              {LOCALE_NAME[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
