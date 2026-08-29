export const fixtures = {
  title: 'Eşleşmeler',
  homeCount: (count: number) => `${count} ev`,
  awayCount: (count: number) => `${count} deplasman`,
  hint: 'Skorları elle gir ya da simülasyonla doldur. Elle girdiklerin',
  hintHighlight: ' vurgulu',
  hintSuffix: ' görünür ve yeniden simüle edilince korunur.',
  opponentMeta: (country: string, pot: number) => `${country} · ${pot}. torba`,
  goalsOf: (team: string) => `${team} golü`,
  venue: { HOME: 'Ev', AWAY: 'Dep' },
  outcome: { WIN: 'Galibiyet', DRAW: 'Beraberlik', LOSS: 'Mağlubiyet' },
  outcomeShort: { WIN: 'G', DRAW: 'B', LOSS: 'M' },
}
