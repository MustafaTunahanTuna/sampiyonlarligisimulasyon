import type { Qualification } from '../../domain/standings'

export const QUALIFICATION_TONE: Record<Qualification, string> = {
  LAST_16: 'border-home',
  PLAY_OFF: 'border-away',
  ELIMINATED: 'border-transparent',
}

export const QUALIFICATION_TEXT_TONE: Record<Qualification, string> = {
  LAST_16: 'text-home',
  PLAY_OFF: 'text-away',
  ELIMINATED: 'text-dim',
}
