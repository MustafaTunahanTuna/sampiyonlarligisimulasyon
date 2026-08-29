import { tr } from './tr'
import { en } from './en'
import type { Locale } from '../locale'

export type Messages = typeof tr

export function messagesOf(locale: Locale): Messages {
  return locale === 'tr' ? tr : en
}
