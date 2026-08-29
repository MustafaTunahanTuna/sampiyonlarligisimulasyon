export const LOCALES = ['tr', 'en', 'fr', 'es', 'pt', 'it'] as const

export type Locale = (typeof LOCALES)[number]

const STORAGE_KEY = 'ucl:locale'
const FALLBACK_LOCALE: Locale = 'en'

export const LOCALE_TAG: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-GB',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-PT',
  it: 'it-IT',
}

export const LOCALE_NAME: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
}

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value)
}

function primaryLanguageOf(tag: string): string {
  return tag.toLowerCase().split('-')[0]
}

function localeOfTag(tag: string): Locale | null {
  const language = primaryLanguageOf(tag)
  return isLocale(language) ? language : null
}

function preferredTags(): readonly string[] {
  const { languages, language } = window.navigator
  if (languages !== undefined && languages.length > 0) return languages
  return language === undefined ? [] : [language]
}

function browserLocale(): Locale {
  for (const tag of preferredTags()) {
    const locale = localeOfTag(tag)
    if (locale !== null) return locale
  }
  return FALLBACK_LOCALE
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
