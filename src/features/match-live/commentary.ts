import type { MatchEvent, MatchEventKind, Side } from '../../domain/engine'
import type { Team } from '../../domain/types'

const ZONE_PHRASE: Record<number, string> = {
  0: 'kendi sahasında',
  1: 'kuruluş bölgesinde',
  2: 'orta sahada',
  3: 'son bölgede',
  4: 'ceza sahasında',
}

const TEMPLATES: Record<MatchEventKind, (team: string, zone: string) => string> = {
  KICK_OFF: () => 'Maç başladı.',
  HALF_TIME: () => 'İlk yarı sona erdi.',
  FULL_TIME: () => 'Maç sona erdi.',
  GOAL: (team) => `GOL! ${team} ağları havalandırdı.`,
  PENALTY_AWARDED: (team) => `${team} penaltı kazandı.`,
  PENALTY_GOAL: (team) => `GOL! ${team} penaltıyı değerlendirdi.`,
  PENALTY_MISSED: (team) => `${team} penaltıdan yararlanamadı.`,
  SHOT_SAVED: (team) => `${team} vurdu, kaleci kurtardı.`,
  SHOT_OFF: (team, zone) => `${team} ${zone} denedi, top auta gitti.`,
  SHOT_BLOCKED: (team) => `${team} şutunu savunma bloke etti.`,
  POST: (team) => `${team} direkten döndü!`,
  CORNER: (team) => `${team} korner kullanıyor.`,
  YELLOW_CARD: (team) => `${team} sarı kart gördü.`,
  RED_CARD: (team) => `${team} kırmızı kart gördü!`,
}

export function commentaryFor(event: MatchEvent, teams: Record<Side, Team>): string {
  return TEMPLATES[event.kind](teams[event.side].name, ZONE_PHRASE[event.zone])
}

export function clockLabel(event: MatchEvent): string {
  return `${event.minute}'`
}
