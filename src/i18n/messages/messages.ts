import { tr } from './tr'
import { en } from './en'
import { fr } from './fr'
import { es } from './es'
import { pt } from './pt'
import { it } from './it'
import type { Locale } from '../locale'

export type Messages = typeof tr

const MESSAGES: Record<Locale, Messages> = { tr, en, fr, es, pt, it }

export function messagesOf(locale: Locale): Messages {
  return MESSAGES[locale]
}
