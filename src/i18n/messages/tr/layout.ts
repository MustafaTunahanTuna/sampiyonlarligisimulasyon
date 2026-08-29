export const layout = {
  documentTitle: 'Lig Aşaması 2026/27 — Takımını seç, eşleşmeleri takip et',
  brandName: 'Şampiyonlar Ligi',
  brandStage: 'Lig aşaması',
  home: 'Ana sayfa',
  teamSelection: 'Takım seçimi',
  mainNavigation: 'Ana gezinme',
  navLeague: 'Lig',
  navKnockout: 'Nakavt',
  navTeam: 'Takımım',
  languageGroup: 'Dil seçimi',
  drawEyebrow: (date: string, venue: string) => `${date} · ${venue} kurası`,
  leaguePhase: 'Lig aşaması',
  drawSummary: (teams: number, matches: number) =>
    `${teams} takım, ${matches} eşleşme. Başlamak için taraftarı olduğun kulübü seç; ardından skorları tahmin et ya da sezonu simüle et, puan tablosu ve gol istatistikleri anında hesaplansın.`,
  footerSourcePrefix: 'Veri kaynağı:',
  footerSourceLink: 'uefa.com kura merkezi',
  footerSourceSuffix: (date: string) =>
    `— ${date} tarihinde çekildi. Puan tablosu ve istatistikler senin tahminlerinden hesaplanır.`,
  footerDisclaimer:
    'Resmî olmayan, hayran yapımı bir uygulama. Kulüp armaları ilgili kulüplere aittir.',
}
