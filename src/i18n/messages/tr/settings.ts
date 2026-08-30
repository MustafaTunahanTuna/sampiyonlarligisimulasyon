export const settings = {
  title: 'Ayarlar',
  intro: 'Dil, maç deneyimi ve ses tercihlerini buradan yönet; seçimlerin bu tarayıcıda saklanır.',
  languageTitle: 'Dil',
  languageHint:
    'Arayüz dili. Seçim yaptığında tarayıcı diline göre otomatik algılama devre dışı kalır.',
  matchTitle: 'Maç deneyimi',
  replaysLabel: 'Gol tekrarları',
  replaysHint: 'Golden sonra pozisyon ağır çekimde bir kez daha oynatılır.',
  switchOn: 'Açık',
  switchOff: 'Kapalı',
  audioTitle: 'Ses',
  audioHint:
    'Seviyeler maç izlerken uygulanır; tamamen susturmak için maç ekranındaki ses düğmesini kullan.',
  ambienceLabel: 'Tribün ambiyansı',
  effectsLabel: 'Vuruş ve düdük efektleri',
  volumeValue: (percent: number) => `%${percent}`,
}
