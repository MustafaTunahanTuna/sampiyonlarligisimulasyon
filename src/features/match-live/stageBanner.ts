import type { MatchEvent } from '../../domain/engine'
import type { Messages } from '../../i18n/messages/messages'
import type { BannerTone } from './pitchPalette'

export interface BannerContent {
  title: string
  detail: string | null
  tone: BannerTone
}

export function bannerFor(event: MatchEvent, t: Messages): BannerContent | null {
  const detail = event.actor
  switch (event.kind) {
    case 'GOAL':
      return { title: t.live.banner.goal, detail, tone: 'goal' }
    case 'PENALTY_GOAL':
      return { title: t.live.banner.penaltyGoal, detail, tone: 'goal' }
    case 'PENALTY_MISSED':
      return { title: t.live.banner.penaltyMissed, detail, tone: 'miss' }
    case 'POST':
      return { title: t.live.banner.post, detail, tone: 'miss' }
    case 'YELLOW_CARD':
      return { title: t.live.banner.yellowCard, detail, tone: 'card' }
    case 'RED_CARD':
      return { title: t.live.banner.redCard, detail, tone: 'danger' }
    default:
      return null
  }
}
