export const LOCALES = ['tr', 'en'] as const

export type Locale = (typeof LOCALES)[number]

const STORAGE_KEY = 'ucl:locale'
const TURKISH_TAG = 'tr'

export const LOCALE_TAG: Record<Locale, string> = { tr: 'tr-TR', en: 'en-GB' }

export const LOCALE_NAME: Record<Locale, string> = { tr: 'Türkçe', en: 'English' }

function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value)
}

function browserLocale(): Locale {
  const language = window.navigator.language?.toLowerCase() ?? ''
  return language.startsWith(TURKISH_TAG) ? 'tr' : 'en'
}

export function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored !== null && isLocale(stored) ? stored : null
  } catch {
    return null
  }
}

export function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    return
  }
}

export function initialLocale(): Locale {
  return readStoredLocale() ?? browserLocale()
}
