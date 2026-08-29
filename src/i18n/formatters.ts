import { LOCALE_TAG } from './locale'
import type { Locale } from './locale'

const DATE_TIME_FORMATS: Record<Locale, Intl.DateTimeFormat> = {
  tr: new Intl.DateTimeFormat(LOCALE_TAG.tr, { dateStyle: 'medium', timeStyle: 'short' }),
  en: new Intl.DateTimeFormat(LOCALE_TAG.en, { dateStyle: 'medium', timeStyle: 'short' }),
}

const DAY_FORMATS: Record<Locale, Intl.DateTimeFormat> = {
  tr: new Intl.DateTimeFormat(LOCALE_TAG.tr, { day: 'numeric', month: 'long' }),
  en: new Intl.DateTimeFormat(LOCALE_TAG.en, { day: 'numeric', month: 'long' }),
}

const KICK_OFF_FORMATS: Record<Locale, Intl.DateTimeFormat> = {
  tr: new Intl.DateTimeFormat(LOCALE_TAG.tr, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }),
  en: new Intl.DateTimeFormat(LOCALE_TAG.en, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }),
}

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

const DRAW_DATE_FORMATS: Record<Locale, Intl.DateTimeFormat> = {
  tr: new Intl.DateTimeFormat(LOCALE_TAG.tr, { day: 'numeric', month: 'long', year: 'numeric' }),
  en: new Intl.DateTimeFormat(LOCALE_TAG.en, { day: 'numeric', month: 'long', year: 'numeric' }),
}

export function formatDrawDate(value: string, locale: Locale): string {
  return DRAW_DATE_FORMATS[locale].format(new Date(value))
}
