import { createContext } from 'react'
import type { Locale } from './locale'
import type { Messages } from './messages/messages'

export interface LocaleContextValue {
  locale: Locale
  messages: Messages
  setLocale: (locale: Locale) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
