import { useContext } from 'react'
import { LocaleContext } from './localeContext'
import type { LocaleContextValue } from './localeContext'

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (context === null) {
    throw new Error('useLocale must be used inside LocaleProvider')
  }
  return context
}
