import type { MatchEventKind } from '../../../domain/engine'

type CommentaryLine = (
  team: string,
  zone: string,
  actor: string | null,
  assist: string | null,
) => string

function named(actor: string | null, team: string): string {
  return actor === null ? team : `${actor} (${team})`
}

export const live = {
  playbackSpeed: 'Oynatma hızı',
  unmute: 'Sesi aç',
  mute: 'Sesi kapat',
  attackingRight: 'hücum →',
  attackingLeft: '← hücum',
  reducedMotion:
    'Hareket azaltma tercihin açık olduğu için saha canlandırması kapatıldı; maçın tamamı yanda metin olarak listeleniyor.',
  pause: 'Duraklat',
  resume: 'Devam et',
  showResult: 'Sonucu göster',
  matchStats: 'Maç istatistikleri',
  commentaryTitle: 'Maç anlatımı',
  noEvents: 'Henüz kayda değer bir an yok.',
  pitchLabel: 'Pozisyonun saha üzerinde canlandırması',
  replayLabel: 'TEKRAR',
  idleHeadline: 'Maç sürüyor, pozisyon bekleniyor.',
  scoreLabel: (home: number, away: number) => `Skor ${home} ${away}`,
  summaryTitle: 'Maç özeti',
  summaryEmpty: 'Henüz gol ya da kart yok.',
  minuteLabel: (minute: number) => `${minute}. dakika`,
  penaltyMark: '(P)',
  stats: {
    possession: 'Topa sahip olma',
    shots: 'Şut',
    shotsOnTarget: 'İsabetli şut',
    expectedGoals: 'Beklenen gol',
    corners: 'Korner',
    cards: 'Kart',
  },
  zonePhrase: {
    0: 'kendi sahasında',
    1: 'kuruluş bölgesinde',
    2: 'orta sahada',
    3: 'son bölgede',
    4: 'ceza sahasında',
  } as Record<number, string>,
  banner: {
    goal: 'GOL',
    penaltyGoal: 'PENALTI GOLÜ',
    penaltyMissed: 'PENALTI KAÇTI',
    yellowCard: 'SARI KART',
    redCard: 'KIRMIZI KART',
    post: 'DİREK',
    save: 'KURTARIŞ',
  },
  commentary: {
    KICK_OFF: () => 'Maç başladı.',
    HALF_TIME: () => 'İlk yarı sona erdi.',
    FULL_TIME: () => 'Maç sona erdi.',
    GOAL: (team: string, _zone: string, actor: string | null, assist: string | null) =>
      `GOL! ${named(actor, team)} ağları havalandırdı.${assist === null ? '' : ` Asist: ${assist}.`}`,
    PENALTY_AWARDED: (team: string) => `${team} penaltı kazandı.`,
    PENALTY_GOAL: (team: string, _zone: string, actor: string | null) =>
      `GOL! ${named(actor, team)} penaltıyı değerlendirdi.`,
    PENALTY_MISSED: (team: string, _zone: string, actor: string | null) =>
      `${named(actor, team)} penaltıdan yararlanamadı.`,
    SHOT_SAVED: (team: string, _zone: string, actor: string | null) =>
      `${named(actor, team)} vurdu, kaleci kurtardı.`,
    SHOT_OFF: (team: string, zone: string, actor: string | null) =>
      `${named(actor, team)} ${zone} denedi, top auta gitti.`,
    SHOT_BLOCKED: (team: string, _zone: string, actor: string | null) =>
      `${named(actor, team)} şutunu savunma bloke etti.`,
    POST: (team: string, _zone: string, actor: string | null) =>
      `${named(actor, team)} direkten döndü!`,
    CORNER: (team: string) => `${team} korner kullanıyor.`,
    YELLOW_CARD: (team: string, _zone: string, actor: string | null) =>
      `${named(actor, team)} sarı kart gördü.`,
    RED_CARD: (team: string, _zone: string, actor: string | null) =>
      `${named(actor, team)} kırmızı kart gördü!`,
  } as Record<MatchEventKind, CommentaryLine>,
}
