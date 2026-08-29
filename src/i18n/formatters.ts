import { LOCALES, LOCALE_TAG } from './locale'
import type { Locale } from './locale'

function formatsOf(options: Intl.DateTimeFormatOptions): Record<Locale, Intl.DateTimeFormat> {
  const entries = LOCALES.map((locale) => [locale, new Intl.DateTimeFormat(LOCALE_TAG[locale], options)] as const)
  return Object.fromEntries(entries) as Record<Locale, Intl.DateTimeFormat>
}

const DATE_TIME_FORMATS = formatsOf({ dateStyle: 'medium', timeStyle: 'short' })

const DAY_FORMATS = formatsOf({ day: 'numeric', month: 'long' })

const KICK_OFF_FORMATS = formatsOf({ day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

const DRAW_DATE_FORMATS = formatsOf({ day: 'numeric', month: 'long', year: 'numeric' })

export function formatDateTime(value: string, locale: Locale): string {
  return DATE_TIME_FORMATS[locale].format(new Date(value))
}

export function formatDay(value: string, locale: Locale): string {
  return DAY_FORMATS[locale].format(new Date(value))
}

export function formatKickOff(value: string | null, locale: Locale): string | null {
  return value === null ? null : KICK_OFF_FORMATS[locale].format(new Date(value))
}

export function toUpperCase(value: string, locale: Locale): string {
  return value.toLocaleUpperCase(LOCALE_TAG[locale])
}

export function formatDrawDate(value: string, locale: Locale): string {
  return DRAW_DATE_FORMATS[locale].format(new Date(value))
}
