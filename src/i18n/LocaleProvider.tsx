import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LocaleContext } from './localeContext'
import { initialLocale, persistLocale } from './locale'
import { messagesOf } from './messages/messages'
import type { Locale } from './locale'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const messages = useMemo(() => messagesOf(locale), [locale])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = messages.layout.documentTitle
  }, [locale, messages])

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next)
    setLocaleState(next)
  }, [])

  const value = useMemo(() => ({ locale, messages, setLocale }), [locale, messages, setLocale])

  return <LocaleContext value={value}>{children}</LocaleContext>
}
