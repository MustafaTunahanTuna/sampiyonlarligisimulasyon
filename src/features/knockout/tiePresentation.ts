import { ROUND_SHORT } from '../../domain/knockoutFormat'
import type { KnockoutSummary } from '../../domain/teamKnockoutRun'
import type { Messages } from '../../i18n/messages/messages'
import type { TieSlot } from '../../domain/types'

export function slotLabel(slot: TieSlot, t: Messages): string {
  return slot.kind === 'POSITION'
    ? t.knockout.slotPosition(slot.position)
    : t.knockout.slotWinner(ROUND_SHORT[slot.round], slot.order)
}

export function runSummaryLabel(summary: KnockoutSummary, t: Messages): string {
  switch (summary.kind) {
    case 'CHAMPION':
      return t.knockout.runSummary.champion
    case 'ADVANCED':
      return t.knockout.runSummary.advanced[summary.round]
    case 'ELIMINATED':
      return t.knockout.runSummary.eliminated[summary.round]
  }
}
