# Şampiyonlar Ligi 2026/27 — Lig Aşaması Takibi

UEFA Şampiyonlar Ligi 2026/27 lig aşaması kurasını uefa.com'dan kazıyıp statik JSON veri havuzuna
dönüştüren; takımını seçip skorları tahmin etmeni, sezonu simüle etmeni, puan tablosunu oluşturmanı
ve sonucu paylaşılabilir bir görsele dönüştürmeni sağlayan web uygulaması.

## Ekranlar

- **Lig (ana sayfa, `#/`)**: sezon KPI'ları (tahmin edilen maç, toplam gol, maç başına ortalama,
  ev sahibi oranı, gol yemeyen maç), en farklı ve en gollü maç, 36 takımlık puan tablosu, gol
  krallığı / en iyi savunma / sürpriz yapanlar sıralamaları ve takım seçici.
- **Takımım (`#/takimim`)**: seçili takımın sekiz eşleşmesi, skor girişi, sezon özeti ve iki
  paylaşım kartı (takım kartı + puan tablosu).
- **Takım seçimi (`#/takim-sec`)**: torbalara ayrılmış liste. Seçim önce taslak olur, alttaki
  onay çubuğundan onaylanana kadar takip edilen takım değişmez. Takım seçmek zorunludur —
  seçilmeden lig ekranına ve simülasyona erişilmez. "Takibi bırak" ile takımsız hâle dönülür
  (tahminler silinmez).

## Neler var

- **Tahmin**: her maçın skorunu elle gir; elle girilenler simülasyonda korunur.
- **Simülasyon**: takım gücüne dayalı Poisson modeli, dört sürpriz seviyesi ve tekrar üretilebilir
  senaryo kodu (aynı kod + aynı ayar = aynı sezon). İlk çalıştırma boş maçları mevcut kodla
  doldurur; "yeniden simüle et" yeni bir senaryo kodu üretip elle girilen skorlar hariç her şeyi
  yeniden hesaplar.
- **Puan tablosu**: 36 takım, UEFA eşitlik bozma sırasıyla; son 16 / play-off / eleme bölgeleri.
- **Paylaşım**: iki adet 1080×1350 PNG kart — takım kartı (sekiz eşleşme + sıra) ve puan tablosu
  kartı (36 takım, nitelik bölgeleri). Canvas 2D ile çizilir, harici kütüphane yoktur; mobilde
  Web Share, masaüstünde indirme.

## Kullanım

```bash
npm install
npm run scrape   # kurayı (ve yayınlandıysa fikstür/skorları) yeniden çeker
npm run dev
npm run build
```

## Veri havuzu

`src/data/league-phase-2026-27.json` — `npm run scrape` tarafından üretilir.

| Alan | İçerik |
|---|---|
| `meta` | Kura kimliği, tarih, yer, kaynak URL, çekilme zamanı |
| `pots` | Dört torba ve takım kimlikleri |
| `teams` | 36 takım: isim, ülke, torba, arma URL'leri, güç puanı |
| `matches` | 144 benzersiz eşleşme: ev/deplasman, matchday, başlama saati, skor |

Kaynak uçlar (`scripts/uefa-api.mjs`):

- `fsp-draw-service.uefa.com/v1/draws?drawId=…` — kura sonucu (36 slot × 8 rakip)
- `comp.uefa.com/v2/teams?teamIds=…` — takım kimlik bilgileri ve armalar
- `match.uefa.com/v5/matches?competitionId=1&seasonYear=2027` — fikstür ve skorlar
- `comp.uefa.com/v2/coefficients?coefficientType=MEN_CLUB|MEN_ASSOCIATION` — kulüp ve ülke katsayıları

### Takım gücü

Simülasyonun girdisi olan `strength` (20–100) UEFA katsayılarından türetilir ve kaynağı
`strengthSource` alanında işaretlenir:

| Kaynak | Anlamı |
|---|---|
| `club-coefficient` | Kulübün gerçek UEFA katsayısı (15 takım) |
| `association-estimate` | Torba tabanı + ülke katsayısına göre ayarlama (18 takım) |
| `pot-baseline` | Yalnızca torba tabanı; ülke katsayısı ilk 20'de değil (3 takım) |

Katsayı uçları yalnızca ilk 20 kaydı döndürdüğü için alt torbalar bu şekilde tahmin edilir.
Simülasyon 12 senaryo üzerinden kalibre edildi: maç başına ~3.15 gol, %45 ev galibiyeti,
%33 deplasman galibiyeti — gerçek UEFA Şampiyonlar Ligi ortalamalarıyla uyumlu.

Kura sonucu her takımı 8 rakiple eşler; iki yönlü kayıtlar `scripts/build-draw-pool.mjs` içinde
tekilleştirilerek 144 maça indirgenir. `scripts/validate-draw-pool.mjs` her çekimde UEFA'nın kura
kurallarını doğrular: 36 takım, 144 maç, takım başına 4 ev + 4 deplasman, her torbadan 2 rakip,
aynı ülkeden rakip yok. Kural bozulursa script hata verir ve JSON yazılmaz.

**Not:** Lig aşaması maç takvimi kura günü itibarıyla henüz yayınlanmamıştı; `kickOff`, `matchday`
ve `score` alanları `null`. UEFA takvimi açıklayınca `npm run scrape` bunları doldurur, uygulama
skorları ve puan tablosunu otomatik gösterir.

## Yapı

```
scripts/          veri kazıma, dönüştürme, doğrulama
src/domain/       tipler, veri erişimi, fikstür, simülasyon, puan tablosu
src/state/        tahmin reducer'ı, context, kalıcılık
src/features/     lig dashboard'u, takım seçici, eşleşmeler, simülasyon, tablo, paylaşım kartı
src/components/   paylaşılan sunum bileşenleri
```

Resmî olmayan, hayran yapımı bir uygulamadır. Veriler ve armalar UEFA ile ilgili kulüplere aittir.
