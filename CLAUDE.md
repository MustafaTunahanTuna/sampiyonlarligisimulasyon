# CLAUDE.md

Bu dosya, bu depoda çalışan Claude Code oturumları içindir.

## Proje

UEFA Şampiyonlar Ligi 2026/27 lig aşaması simülatörü. Kura uefa.com'dan kazınıp statik JSON'a
dönüştürülür; kullanıcı bir kulüp seçer, skorları elle girer veya sezonu simüle eder, puan tablosu
ve nakavt ağacı bundan türetilir, sonuç PNG karta dökülür. Backend yok — her şey tarayıcıda,
kalıcılık `localStorage`.

**Zaten yazılmış iki doküman var, tekrarlama:**
- `README.md` — ekranlar, veri havuzu şeması, UEFA API uçları, takım gücü türetimi, hafta takvimi üretimi.
- `game-engine.md` — maç motorunun tasarım kararları, iki katmanlı mimari (mantıksal motor + pozisyon
  oynatımı), kalibrasyon hedefleri, dosya dosya kod yerleşimi. Motora dokunmadan **önce oku**.

## Komutlar

```bash
npm run dev        # Vite dev sunucusu
npm run build      # tsc -b && vite build  ← tip denetimi burada
npm run lint       # oxlint
npm run scrape     # kurayı/fikstürü UEFA'dan yeniden çeker, JSON'u doğrulayıp yazar
npm run calibrate  # maç motorunu 12 senaryoda kalibre eder (game-engine.md §6)
npm run squads     # kadro verisini üretir
npm run backtest   # geçmiş sezonlara karşı motoru sınar
```

**Test runner yok ve kurulmayacak.** Doğrulama sırası: `npm run build` → `npm run lint` →
motora dokunulduysa `npm run calibrate`. Görsel bir iddia varsa derlenmiş çıktıyı grep'le
(aşağıdaki Tailwind notu).

## Mimari

```
scripts/*.mjs      veri kazıma / dönüştürme / doğrulama (Node, build dışı)
src/data/*.json    üretilmiş statik veri — elle düzenlenmez
src/domain/        saf TypeScript: tipler, fikstür, simülasyon, tablo, nakavt, kadro
src/domain/engine/ maç motoru (game-engine.md §7)
src/state/         tahmin reducer'ı + context + localStorage kalıcılığı
src/i18n/          locale çözümleme, formatlayıcılar, mesaj katalogları
src/hooks/         paylaşılan React hook'ları
src/features/      ekran/akış bazlı bileşenler (dashboard, knockout, matchday, match-live, share, …)
src/components/    paylaşılan sunum bileşenleri
```

**Bağımlılık yönü tek yönlü:** `features` → `hooks`/`state`/`i18n` → `domain` → `domain/random`.
Tersi asla. `src/domain/` içinde DOM, React veya `Math.random` geçmez — rastgelelik `domain/random.ts`
üzerinden tohumlanır, çünkü aynı senaryo kodu aynı sezonu üretmek zorunda.

Yönlendirme hash tabanlı (`useHashRoute`): `#/`, `#/takimim`, `#/takim-sec`, `#/nakavt`.

## Kod sözleşmesi

Depoda şu anda **0 yorum satırı** ve **0 adet `any`** var. Bunu bozma.

- **Yorum yazma.** Kod isimlerle, tiplerle ve yapıyla anlatır; açıklama ihtiyacı duyduğun yerde
  fonksiyonu ayır veya yeniden adlandır.
- Named export kullan. Tek istisna `src/App.tsx`.
- Dosyalar odaklı kalsın — en büyük dosya 270 satır. 300'ü aşmadan böl.
- `verbatimModuleSyntax` açık: tip importları `import type` olmak zorunda.
- `erasableSyntaxOnly` açık: `enum` ve parametre property'leri yasak. Sabit birlik tipleri için
  depodaki desen `as const` dizisi + `(typeof X)[number]` (bkz. `KNOCKOUT_ROUNDS`, `LOCALES`,
  `MATCHDAY_NUMBERS`).
- `noUnusedLocals` / `noUnusedParameters` açık — kullanılmayan parametreyi `_zone` gibi adlandır.
- **React Compiler açık** (`vite.config.ts`). `useMemo`/`useCallback` ile elle memoization ekleme;
  gerçekten ölçülmüş bir sorun yoksa gereksiz.
- Yeni runtime bağımlılığı ekleme. Proje `react` + `react-dom` ile yaşıyor; kart çizimi Canvas 2D,
  ses Web Audio, hepsi elle yazıldı.

## i18n — 6 dil

`tr, en, fr, es, pt, it`. Dil, `navigator.languages` üzerinden birincil alt etiketle eşleştirilir
(`pt-BR` → `pt`); eşleşme yoksa **İngilizce**. Kullanıcı `LocaleSwitch`'ten seçim yaparsa
`ucl:locale` anahtarına yazılır ve tarayıcı dili artık dikkate alınmaz.

- `Messages` tipi `typeof tr` — yani **Türkçe katalog şemanın kaynağıdır**. `tr`'ye bir anahtar
  eklersen diğer beş dil derlenmez; hepsini birlikte güncelle.
- Katalog modül başına bölünmüş: `src/i18n/messages/<locale>/{common,dashboard,fixtures,knockout,
  layout,live,matchday,share,standings,team}.ts` + `index.ts`.
- Yeni dil eklemek: `LOCALES` dizisine bir satır. `LOCALE_TAG`, `LOCALE_NAME`, `COUNTRY_NAMES` ve
  `MESSAGES` `Record<Locale, …>` olduğu için derleyici eksik kalanı sana söyler. `formatters.ts`
  kendi kendine türetir, dokunmaya gerek yok.
- UI metnini bileşene gömme; `useTranslation()` üzerinden al.

## Tailwind v4

Token'lar `src/index.css` içinde: `@theme inline` ile CSS değişkenlerinden köprülenmiş renkler
(`canvas`, `surface`, `raised`, `fg`, `muted`, `dim`, `line`, `accent`, `home`, `away`, `highlight`),
yarıçaplar (`rounded-pill/control/panel`), animasyonlar (`animate-rise`, `animate-modal-in`, …) ve
`@utility` bloklarıyla `panel`, `starfield`, `floodlight`, `eyebrow`.

**Tuzak:** Tailwind v4'te olmayan bir sınıf sessizce düşer — build hata vermez. Görsel bir değişiklik
yaptıysan derlenmiş CSS'i doğrula; escape'li seçicileri sabit metin olarak ara:

```bash
grep -cF '.hover\:bg-surface:hover' dist/assets/index-*.css
```

Aktif/seçili durum için deponun kendi idiomu: `bg-accent/15 text-accent ring-1 ring-accent/45`.
Native `<select>` gibi işletim sistemi tarafından çizilen kontroller tema token'larını almaz —
`LocaleSwitch` bu yüzden kendi `role="menu"` dropdown'ını kullanır.

## Durum ve kalıcılık

- `PredictionProvider` + `predictionReducer`; eylemler discriminated union.
- Beş `localStorage` anahtarı, hepsi `ucl:` önekli ve her okuma/yazma `try/catch` içinde
  (özel sekmede `localStorage` fırlatabilir):

  | Anahtar | Nerede | İçerik |
  |---|---|---|
  | `ucl:predictions` | `state/predictionStorage.ts` | tahminler, nakavt skorları, senaryo kodu, sürpriz seviyesi, `engineVersion` |
  | `ucl:favourite-team` | `hooks/useFavouriteTeam.ts` | takip edilen kulüp id'si |
  | `ucl:locale` | `i18n/locale.ts` | kullanıcının seçtiği dil |
  | `ucl:match-audio-muted` | `features/match-live/useMatchAudio.ts` | ses tercihi |
  | `ucl:settings` | `state/settingsStorage.ts` | gol tekrarı aç/kapa, tribün ve efekt ses seviyeleri |
- `source: 'manual'` olan skorlar kullanıcının kendi girdisidir; simülasyon bunları **asla** ezmez.
- `ENGINE_VERSION` değiştiğinde `predictionStorage.ts` saklı veriyi göç ettirir: simüle edilmiş
  skorlar ve nakavt sonuçları atılır, elle girilenler korunur. Motorun çıktı dağılımını değiştiren
  her düzenlemede `ENGINE_VERSION`'ı artır.

## Veri hattı

`src/data/*.json` üretilmiş çıktıdır, elle düzenlenmez. `npm run scrape` kurayı çeker,
`build-draw-pool.mjs` 36×8 iki yönlü kayıtları 144 benzersiz maça indirger,
`validate-draw-pool.mjs` UEFA kura kurallarını doğrular (kural bozulursa JSON yazılmaz),
`build-schedule.mjs` UEFA takvim yayınlamadığı sürece 8 haftayı 1-faktörizasyonla üretir.
`meta.matchdaySource` alanı takvimin `uefa` mı `generated` mı olduğunu söyler.

## Erişilebilirlik

`prefers-reduced-motion` zorunlu (`usePrefersReducedMotion`) — saha animasyonu kapanır, maç metin
olarak listelenir. Canlı skor ve anlatım `aria-live`. Modallar `<dialog>` + `useModalDialog`.
Odak halkası global: `:focus-visible` `src/index.css` içinde tanımlı, bileşende yeniden tanımlama.

## Dil

Kullanıcıyla Türkçe konuş. Kod içindeki tanımlayıcılar İngilizce. Commit mesajları da İngilizce ve
Conventional Commits formatında (`feat: …`, `fix: …`) — depodaki mevcut geçmiş bu deseni izliyor.
