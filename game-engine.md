# Maç Motoru Context Dokümanı

> Bu doküman `champions-league-sim` için 2D maç motorunun **referans sözleşmesidir**.
> Kod bu dokümanı takip eder; doküman koddan sonra değil, önce revize edilir.
>
> Durum: v4 uygulandı (F1–F11) · Son güncelleme: 2026-08-28

---

## 1. Amaç ve kapsam

### 1.1 Ne yapıyoruz

Mevcut sistem bir maçı tek bir Poisson çekimiyle skora indirgiyor (`src/domain/simulation.ts`). Skor var, maç yok. Hedef: **maçın kendisini üreten**, ondan skoru **türeten** bir motor.

Üç katmanlı hedef:

1. **Tutarlı sonuç** — 144 maçlık lig aşaması + nakavt turları istatistiksel olarak gerçekçi dağılsın (gol ortalaması, beraberlik oranı, ev sahibi avantajı, güç → sonuç monotonluğu).
2. **Anlatılabilir maç** — 90 dakikanın önemli anları (gol, net fırsat, kurtarış, direk, kırmızı kart, penaltı) zaman çizelgesi olarak çıksın.
3. **İzlenebilir maç** — sürekli akan bir 2D oyun değil; Football Manager'daki gibi **yalnızca pozisyon anlarında** saha ekrana gelsin, arada metin anlatımı aksın.

### 1.2 Ne YAPMIYORUZ (kapsam bariyerleri)

Bunlar bilinçli olarak kapsam dışı. Motor bunları yapmaya kalkarsa proje batar:

- **22 ajanlı fizik simülasyonu yapmıyoruz.** Top yörüngesi, çarpışma, oyuncu yol bulma yok. FM'in gerçek motoru budur; bizim bütçemiz değil.
- **Oyuncu veritabanı kurmuyoruz.** Elimizde 36 takım ve tek bir `strength` (20–100) var. Gerçek kadro verisi v1 kapsamı dışında.
- **Taktik editörü yapmıyoruz.** Diziliş, oyuncu rolü, talimat sistemi v1'de yok (bkz. §10 park listesi).
- **Sunucu / backend yok.** Her şey tarayıcıda, saf TypeScript, sıfır yeni bağımlılık.

### 1.3 "Tutarlılık" bu projede ne demek

Dört ayrı garanti; hepsi ayrı ayrı doğrulanabilir olmalı:

| Garanti | Tanım | Nasıl doğrularız |
|---|---|---|
| **D1 · Determinizm** | Aynı `(seed, matchId, takımlar, unpredictability)` girdisi → bit-bit aynı maç, aynı zaman çizelgesi, aynı skor. | Aynı girdiyle iki koşu, JSON karşılaştırması. |
| **D2 · İç tutarlılık** | Skor, olayların *türevidir*. Zaman çizelgesindeki gol olaylarının sayısı = skor. İstatistikler (şut, isabet, korner) olaylardan sayılır, ayrıca zar atılmaz. | Motor çıktısında invariant kontrolleri. |
| **D3 · İstatistiksel tutarlılık** | Toplu davranış hedef aralıklarda ve gol üretimi projenin λ modeline demirli (§6). | `npm run calibrate` ile 20.016 maç, 16 kontrol. |
| **D4 · Görsel tutarlılık** | 2D oynatımda gördüğün şey ile skor tablosu asla çelişmez; animasyon olayı *gösterir*, üretmez. | Renderer saf okuyucudur, RNG'ye erişimi yoktur. |

D2 ve D4 mimari kurallardır, test değil: **skor ve pozisyonlar tek bir olay akışından türetilir.**

---

## 2. Mevcut sistemin envanteri

Motorun bağlanacağı yüzeyler:

| Dosya | Rolü | Motor sonrası |
|---|---|---|
| `src/domain/random.ts` | `hashSeed` + mulberry32 türevi `createRandom` | **Korunur.** Motorun tek RNG kaynağı budur; kullanılmayan `poisson` yardımcısı silindi. |
| `src/domain/simulation.ts` | `expectedGoals` + `simulateScore` (Poisson) | Rolü daraldı: yalnızca **λ kaynağı**. Skor üreten `simulateScore` / `simulateMatch` silindi. |
| `src/domain/knockoutSimulation.ts` | Uzatma + penaltı | Motora taşınır (uzatma = ek 30 dk devam; penaltılar ayrı model). |
| `src/state/predictionReducer.ts` | `simulateMatch` çağırır, `PredictionMap`'e `Score` yazar | Çağrı motora döner; **saklanan şey yine `Score`**. |
| `src/state/predictionStorage.ts` | localStorage'a `predictions + seed` | Şema büyümez, yalnızca sürüm alanı eklenir. |
| `src/features/matchday/MatchdayModal.tsx` | Hafta sonuçları listesi | Satıra "maçı izle" girişi eklenir. |
| `src/domain/standings.ts` | Skorlardan puan tablosu | Değişmez. |

### 2.1 Kritik mimari karar: zaman çizelgesini SAKLAMIYORUZ

Motor saf ve deterministik olduğu için (D1), bir maçın tam zaman çizelgesi **her an yeniden üretilebilir**. Bu yüzden:

- `PredictionMap` içinde yalnızca `Score` durmaya devam eder — localStorage şeması, mevcut reducer ve standings kodu değişmez.
- Kullanıcı "maçı izle" dediğinde motor o maçı **yeniden koşar** ve tam raporu üretir. Aynı seed → aynı maç.
- 144 maçın timeline'ını saklamak yerine 144 skoru saklamaya devam ederiz.

**Bunun bedeli:** motorun davranışı değişirse eski kayıtlı skorlar ile yeniden üretilen timeline çelişir. Çözüm: `ENGINE_VERSION` sabiti `PersistedPredictions` içine yazılır; sürüm uyuşmazsa kayıtlı **simüle** skorlar geçersiz sayılır, manuel girilen skorlar korunur.

---

## 3. Model seçimi

### 3.1 Aday modeller ve neden elendiler

| Model | Artı | Eksi | Karar |
|---|---|---|---|
| **Bağımsız Poisson** (mevcut) | 3 satır, hızlı, kalibre | Maç yok, an yok, beraberliği eksik tahmin eder | Referans kalibrasyon kaynağı olarak kalır |
| **Dixon-Coles** (düşük skorlarda düzeltmeli bivariate Poisson) | Beraberlik oranını düzeltir, literatürde standart | Yine sadece skor üretir; skoru sonradan düzeltmek D2'yi kırar | **v1'e alınmadı** — zincirin doğal beraberlik oranı zaten bantta (§4.6) |
| **Tam ajan-tabanlı fizik** (FM'in gerçek motoru) | En zengin | Ay/yıl ölçeğinde iş; 22 ajan × pozisyon × karar ağacı | **Elendi** (§1.2) |
| **Zon-tabanlı possession-chain Markov zinciri** | Olay üretir, kalibre edilebilir, ~400 satır, deterministik | Gerçek taktik derinliği yok | **SEÇİLDİ** |

### 3.2 Seçilen model: iki katmanlı motor

```
Katman A — Mantıksal Motor (logical engine)
  Girdi:  (homeTeam, awayTeam, seedKey, unpredictability, options)
  Süreç:  possession chain Markov zinciri + dakika saati
  Çıktı:  MatchReport { score, timeline: MatchEvent[], stats: MatchStats }
  Saf. Deterministik. DOM bilmez. RNG'ye tek erişim burasıdır.

Katman B — Kinematik Katman (playback)
  Girdi:  MatchReport
  Süreç:  her faz için saha üzerinde çapa noktaları + easing
  Çıktı:  belirli bir t anında topun ve 22 nesnenin pozisyonu
  Saf fonksiyon: frame(report, t) → PitchFrame. RNG YOK (D4).
```

Bu ayrım dokümanın en önemli kararıdır. Görselleştirme motorun içine sızarsa determinizm ve tutarlılık çöker.

---

## 4. Katman A — Mantıksal motor tasarımı

### 4.1 Takım profili: tek `strength`'ten çok boyuta

Elimizde tek sayı var (20–100). Motorun ihtiyaç duyduğu boyutları bundan **deterministik olarak** türetiriz; böylece veri şeması değişmez ama takımlar birbirinin kopyası olmaz:

```
TeamProfile {
  attack      // gol üretme
  midfield    // topa sahip olma, zinciri ilerletme
  defence     // zinciri kesme
  goalkeeping // şut kurtarma
  discipline  // faul ve kart eğilimi
  tempo       // dakikadaki hamle sayısı
}
```

Türetme kuralı: her boyut `strength` etrafında, `hashSeed(team.id + ':' + dimension)` ile üretilmiş sabit bir sapma (±8 puan) alır. Sonuç: aynı güçteki iki takım farklı karakterde oynar, ama bir takımın karakteri sezon boyunca **sabittir** (maç seed'ine değil, takım id'sine bağlıdır).

### 4.2 Saha zonları

Top her an bir zonda ve bir takımın kontrolündedir. Kontrol eden takımın hücum yönüne göre 5 zon:

```
Z0 OWN_BOX        kendi ceza sahası çevresi
Z1 BUILD_UP       kendi üçüncü bölgesi
Z2 MIDFIELD       orta saha
Z3 FINAL_THIRD    son üçüncü bölge
Z4 BOX            rakip ceza sahası (şut bölgesi)
```

Ek yan durum: `SET_PIECE` (korner / serbest vuruş / penaltı) — zincire dışarıdan enjekte edilir.

### 4.3 Zincir adımı (tek `tick`)

Bir maç ~90 dakika, dakika başına ortalama ~1.9 hamle → maç başına ~170 adım. Her adımda:

1. **Aksiyon seçimi** — mevcut zon ve takım profillerine göre ağırlıklı seçim:
   `PASS` (ileri) · `HOLD` (yatay/geri, zon değişmez) · `DRIBBLE` · `LONG_BALL` · `CROSS` · `SHOOT`.
   `SHOOT` ağırlığı zon ile keskin artar (Z2'de ~0, Z4'te baskın).
2. **Çözümleme** — aksiyonun başarı olasılığı `attack/midfield` ile `defence` karşılaştırmasından logistic bir fonksiyonla gelir; `unpredictability` bu farkı yumuşatır (mevcut `simulation.ts` felsefesiyle aynı).
3. **Sonuç** — başarı: zon ilerler; başarısızlık: top rakibe geçer (`TURNOVER`), zon aynalanır.
4. **Şut çözümü** — `SHOOT` seçilirse zon ve durumdan bir **xG** hesaplanır, sonra sırayla:
   `BLOCKED` → `OFF_TARGET` → `SAVED` → `GOAL`, nadir dal olarak `POST`.
   Kaleci kalitesi `SAVED`/`GOAL` ayrımını kaydırır. Blok ve kurtarış korner doğurabilir.
5. **Saat** — her adım, profillerin `tempo`suna bağlı 20–70 sn ilerletir; 90. dakikada uzatma dakikaları (kart ve gol sayısına bağlı 1–6 dk) eklenir.

### 4.4 Disiplin ve kesintiler

- Faul olasılığı savunan takımın `discipline` boyutundan gelir; zon ne kadar tehlikeliyse kart şansı o kadar yüksek.
- İkinci sarı → kırmızı; kırmızı gören takımın `midfield` ve `defence` boyutu maçın kalanında düşer. Bu, motorun statik olmadığını gösteren tek oyun-içi durum değişimidir ve MVP için yeterlidir.
- Ceza sahasında faul → penaltı (ayrı çözüm, ~%76 baz gol oranı).

### 4.5 Olay modeli

Zaman çizelgesine yazılan olaylar; hem 2D oynatım hem "önemli anlar" özeti buradan beslenir:

```
KICK_OFF · GOAL · PENALTY_GOAL · PENALTY_MISSED · PENALTY_AWARDED ·
BIG_CHANCE · SHOT_SAVED · SHOT_OFF · POST · CORNER ·
YELLOW_CARD · RED_CARD · HALF_TIME · FULL_TIME
```

Her olay: `{ minute, second, side, zone, kind, importance }`. `importance` 0–3; "önemli anlar" özeti `importance >= 2` filtresiyle çıkar — ayrı bir highlight seçici yazmayız.

**Aktörler (oyuncu isimleri) v1'de yok.** Olaylar takım ve bölge düzeyinde anlatılır ("Sağ kanattan ortada…"). Gerçek kadro geldiğinde `actor` alanı doldurulur; olay şeması bunu şimdiden opsiyonel alan olarak taşır.

### 4.6 Kalibrasyon köprüsü (tutarlılığın kalbi)

Ham Markov zinciri kendi başına doğru gol ortalamasını tutturmaz. Çözüm: **motoru mevcut Poisson modeline demirle.**

1. `expectedGoals(home, away, unpredictability)` fonksiyonundan `(λ_home, λ_away)` alınır — bu bizim *hedefimizdir*.
2. Zincir, gol atma olasılığı sıfırlanmış hâlde **8 kez sondaj koşusu** yapar; koşuların ürettiği beklenen gol (Σ xG) ve beklenen penaltı golü ortalanır.
3. `finishingScale = (λ − beklenen penaltı golü) / ortalama Σ xG`. Bu katsayı maç başına bir kez hesaplanır, maç içinde sabittir.
4. Katsayı ilk sondaj setine uygulanıp **8 sondaj daha** koşulur (sabit nokta adımı): goller devreye girince orta saha başlangıçlı yeniden başlamalar zincirin şut üretimini değiştirir, bu adım o farkı düzeltir. Nihai katsayı ikinci setten hesaplanır.
5. Gerçek maç tek koşuda, nihai katsayıyla oynanır.

**Sondaj koşularının ortalanması zorunludur, bir optimizasyon değil.** `scale = λ / Σxg` ifadesinde Σxg tek koşudan gelirse, `E[1/Σxg] > 1/E[Σxg]` (Jensen eşitsizliği) nedeniyle gol ortalaması sistematik olarak yukarı kayar. Ölçüldü: tek sondajla sapma **+%13**, 4 sondajla **+%3.9**, 8 sondajla **+%2.0**.

Bu köprü, "motor değişti diye lig aşaması saçmaladı" riskini yapısal olarak ortadan kaldırır: motorun gol üretimi her zaman projenin kendi λ modeline ±%6 içinde bağlıdır.

**Dixon-Coles τ düzeltmesi v1'e alınmadı.** τ, skorun *ortak dağılımına* uygulanan bir düzeltmedir; olay-tabanlı bir motorda skoru sonradan düzeltmek D2 (skor = olayların türevi) invariant'ını kırar. Ölçüm, zincirin kendi doğal gol bağımlılığının beraberlik oranını zaten %21.2'ye taşıdığını gösterdi — hedef bandın içinde. Gerek doğarsa park listesinden alınır (§10).

## 5. Katman B — Pozisyon oynatımı

### 5.1 Neden sürekli akan 2D değil

v1'de maç baştan sona 2D olarak akıyordu. Sonuç çiğdi: 22 daire durmadan salınıyor, hiçbir an diğerinden ayrışmıyor, gerçek futbol hissi vermiyordu. Sorun grafik kalitesi değil, **kurgu** idi — sürekli akan bir animasyon, izleyiciye "neye bakacağını" söylemiyor.

v2'nin modeli Football Manager'ın kendi çözümüdür: **maç metinle akar, saha yalnızca pozisyonda açılır.**

### 5.2 Highlight clip modeli

`highlights.ts` her maçı **klip**lere böler. Bir klip, `importance >= 2` olan bir olayın (gol, penaltı, net fırsat, direk, kırmızı kart) etrafında kurulur:

- **Bitiş fazı**: olayın gerçekleştiği faz.
- **Başlangıç fazı**: oradan geriye doğru, aynı takımın kesintisiz topa sahip olduğu en fazla 6 faz — yani atağın kuruluşu.
- Aynı ya da komşu fazdaki olaylar tek klipte birleşir (penaltı kazanma + penaltı golü gibi).

Ölçülen: **maç başına 6.4 klip**, klip başına 3.7 faz.

### 5.3 İki hızlı saat

Oynatım iki modda ilerler; ikisi de aynı `MatchReport` üstünde çalışır:

| Mod | Saat hızı | Ekran |
|---|---|---|
| **Anlatım** | 260 maç-saniyesi / gerçek saniye | Saha gizli; büyük maç saati + son önemli an |
| **Klip** | Faz başına 1.9 sn, şut 1.6 sn | Saha açık, pozisyon oynuyor |
| **Kutlama** | 2.4 sn, ilerleme 1'e sabit | Top ağda, flaş ve tezahürat |

Hız çarpanı `2×` (varsayılan) veya `4×`. Kullanıcı her an "Sonucu göster" ile atlayabilir.

**Kutlama ayrı bir adımdır, şut fazının süresine eklenmez.** v3'te kutlama süresi şut adımının içine ekleniyordu; bu, top hâlâ havadayken adımın ilerlemesini yüzde 85'e taşıyor ve **gol sesi top ağa girmeden çalıyordu** — yani pozisyonun golle biteceği önceden belli oluyordu. v4'te kutlama, ilerlemesi 1'e sabitlenmiş ayrı bir adım: ses, flaş ve skor açılışı topun ağa girdiği ana kilitlendi.

Saha ile anlatım arasındaki geçiş 300 ms opacity ile yapılır — canvas hep monte kalır, üstündeki anlatım paneli kaybolur/gelir. Böylece rAF döngüsü kesilmez.

### 5.4 Pas zinciri: top oyuncudan oyuncuya gider

v2'de top zon çapaları arasında uçuyordu ve en yakın oyuncu topa çekiliyordu — yani top önce hareket ediyor, oyuncu ona koşuyordu. Bu tersti ve futbol gibi hissettirmiyordu.

v3'te ilişki tersine çevrildi. Her faz için bir **pas planı** üretilir (`pitchFrame.ts` → `buildPlans`):

- **Taşıyıcı (carrier)**: topu ayağında tutan oyuncunun forma slotu.
- **Alıcı (receiver)**: aksiyona ve mesafeye göre seçilen hedef oyuncu.
- Top, taşıyıcının ayağından alıcının ayağına gider; ikisi de blokla birlikte kayarken.
- **Süreklilik**: bir sonraki fazın taşıyıcısı = bu fazın alıcısı. Böylece bir pozisyon `#5 → #1 → #5 → #2 → #4 → #8 → şut` gibi okunabilir bir pas zinciri olur.

Alıcı seçimi rol ve mesafe kısıtlarına tabidir (`squad.ts`):

| Aksiyon | Aday havuzu |
|---|---|
| `PASS` | Bir üst hat (DF→MF, MF→FW), aynı hat yedeği |
| `HOLD` | Geri pas: DF→kaleci, MF→DF |
| `LONG_BALL` | Forvetler |
| `CROSS` | Merkez forvetler (9, 8, 10) |
| `DRIBBLE` | Taşıyıcının kendisi (bölge rolüne izin veriyorsa) |
| `SHOOT` | Taşıyıcının kendisi |

Adaylar önce hedef zonun rol kısıtından geçer (`ZONE_ROLES`), sonra mesafeye göre sıralanıp en yakın 3 içinden deterministik seçilir. Bu iki kural iki somut hatayı kapattı:

- **Kaleci artık şut atmıyor.** Ceza sahası zonunda yalnızca MF/FW rolleri taşıyıcı olabilir; kalecinin veya bir stoperin son bölgeye topla girmesi mümkün değil. Ölçüm: 384 şutun **0**'ı kaleciden.
- **Paslar kısaldı.** Rastgele rol seçimi yerine mesafeye göre sıralama, faz başına ortalama top yolunu 0.381'den **0.326**'ya indirdi.

**Süreklilik ölçüldü:** akan oyundaki 819 faz geçişinin **816'sında** top hiç sıçramıyor (kopukluk < %0.5 saha genişliği). Kalan sıçramalar korner ve top kaybı gibi duran top / kesinti anları — orada sıçrama zaten doğru davranış.

Topu almayan bir forvet her fazda öne **derinlik koşusu** yapar (`runnerFor`, sinüs zarfı). Koşuyu alıcıya değil üçüncü oyuncuya vermek bilinçli: alıcıya verilirse faz sonunda oyuncu geri sıçrıyor ve topun sürekliliği bozuluyordu.

### 5.5 Takım kimliği

Elimizde forma rengi verisi yok, o yüzden **deterministik forma renkleri** üretiyoruz (`kits.ts`):

- Renk tonu takım id'sinin hash'inden gelir → her takımın sabit bir rengi olur.
- Çim tonu (88°–168°) yasaklı; saha üstünde kaybolmasınlar diye.
- İki takımın tonu arasında en az **72° ayrım** garanti edilir; çakışırsa uygun ilk ton aranır. Ölçüm: 60 maçta **0 çakışma**.
- Kaleci aynı tonun açık versiyonunu giyer, böylece ayrışır.

Kimliği ayrıca üç yerden okuyabilirsin:

1. **Formaların üstünde numara** (1, 2, 5, 6, 3, 4, 8, 7, 11, 9, 10 — 4-3-3 dizilişine göre).
2. **Saha üstü etiket**: sol üstte `ARS →`, sağ üstte `← BAY`; ok hücum yönünü gösterir.
3. **Skor başlığında** her takımın adının altında forma rengi çubuğu ve "hücum →" yönü.

### 5.6 Pozisyonu okunur kılan diğer detaylar

- **Salınım kaldırıldı.** v1'deki sürekli titreşim "çiğ" hissinin ana kaynağıydı.
- **Baskı**: rakip takımın topa en yakın oyuncusu faz boyunca topa doğru %55 çekilir; şutta bu kaleciye denk gelir ve çıkış/kurtarış gibi okunur.
- **Top izi**: son 26 karenin yörüngesi solan bir çizgi olarak kalır; pasın nereden geldiği görülür.
- **Saha detayı**: kale ağı, penaltı noktaları, altıpas, vinyet.
- **Gol anı**: beyaz flaş (1.8/sn sönümlenir) + tezahürat sesi.

### 5.7 Oynatım kontrolleri

- Hız `2×` (varsayılan) / `4×`, duraklat, "Sonucu göster", sessize alma.
- **Modal yüksekliği sabittir** (`88vh`). Pozisyon açılıp kapanırken pencere büyüyüp küçülmez; anlatım sütunu kendi içinde kaydırılır, sol sütun da öyle.
- `prefers-reduced-motion`: canvas hiç monte edilmez, maç bitmiş sayılır, zaman çizelgesi metin olarak listelenir. Zorunlu.
- **Yalnızca favori takımın maçı izlenebilir.** Diğer maçlarda izleme girişi yok — kullanıcı 17 maç izlemek zorunda değil.

### 5.8 Bilgi açılış zamanlaması (spoiler kontrolü)

Oynatım iki ayrı saat tutar:

- `second` — sahnedeki maç saati; klip boyunca klibin başı ve sonu arasında yumuşak ilerler (dakika göstergesi bunu kullanır).
- `reveal` — **bilginin açıldığı** saat; skor, anlatım satırları ve istatistikler bunu kullanır.

`reveal`, bir adım tamamlanana kadar o fazın başlangıç saniyesinin *gerisinde* tutulur (`revealSecondFor`) ve asla geri gitmez. Sonuç: şut oynanırken skor değişmez, anlatım satırı düşmez, istatistik artmaz — hepsi topun ağa girdiği ana kilitlidir.

Ölçüldü: 80 maçtaki **266 gol klibinin 266'sında** ses ile skor açılışı arasındaki sapma **0.000 sn**, ve o anda top kale çizgisinde.

### 5.9 Canlı istatistikler

İstatistik paneli maç boyunca ekranda durur ve pozisyonlar ilerledikçe dolar. Bunun için `MatchEvent` artık `xg` alanı taşır ve `buildStats(events, possessionSeconds)` tamamen olaylardan türetir:

- Şut, isabet, korner, kart → `reveal` saatine kadarki olaylardan sayılır.
- Beklenen gol → aynı olayların `xg` alanlarının toplamı.
- Topa sahip olma → `reveal` saatine kadarki fazların süre payı.

D2 korunur: hiçbir istatistik için ayrı zar atılmaz, hepsi tek olay akışının türevidir.

### 5.10 Ses (`matchAudio.ts`)

Sıfır bağımlılık, **sıfır ses dosyası**. Her şey Web Audio ile sentezlenir:

```
gürültü tamponu (3 sn, kahverengi gürültü)
  ├─ ambiyans : bandpass 520Hz + lowpass 1800Hz → gain 0.055, 7 sn periyotlu LFO
  ├─ tezahürat: bandpass 380→1250→560Hz süpürme, 0.14 sn atak / 3.6 sn sönüm
  └─ vuruş    : bandpass 1900Hz, 0.09 sn klik + 150→62Hz sinüs gövde (0.13 sn)
                                          ↓
                        master gain → DynamicsCompressor (limiter) → çıkış
```

- **Vuruş sesi** her pas, orta, uzun top ve şutta çalar; güç aksiyona göre değişir (pas 0.8 · orta 1.1 · uzun top 1.2 · şut 1.6). Dribbling sessizdir.
- **Tezahürat** yalnızca gol kutlama adımının başında çalar (§5.6).
- `AudioContext` ilk kullanıcı etkileşiminden sonra `resume()` edilir — autoplay politikası sorunu yok.
- Sessize alma tercihi `localStorage`'da; sekme gizlenince ses susar.
- Master üzerindeki limiter, üst üste binen seslerde kırpılmayı engeller.

### 5.11 Render mimarisi

- Tek `<canvas>`, `requestAnimationFrame`, `devicePixelRatio` ölçekli.
- **React her karede render etmez.** Saat ve çizim rAF içinde ref'lerle yürür; React'e yalnızca dakika değiştiğinde ve 240 ms'de bir anlatım ilerlemesi bildirilir.
- Saha koordinatları normalize (0–1 × 0–1) → responsive bedava gelir.

### 5.12 Performans bütçesi

| İş | Bütçe | Ölçülen |
|---|---|---|
| Tek maç mantıksal simülasyonu | < 1 ms | **0.82 ms** (17 zincir koşusu: 16 sondaj + 1 maç) |
| 144 maçlık lig aşaması (tam sezon) | < 120 ms | **~118 ms** |
| 2D kare hesabı | < 2 ms/kare | **0.0016 ms** |
| Kalibrasyon scripti, 20.000 maç | < 10 sn | **~17 sn** (kabul edildi, CI'da koşmuyor) |

Bu bütçeler aşılırsa Worker konuşulur; önceden değil.

---

## 6. Kalibrasyon hedefleri

`npm run calibrate` (→ `scripts/calibrate-engine.mjs`) gerçek 144 maçlık fikstürü 139 kez tekrarlayarak 20.016 maç simüle eder ve şu aralıkları doğrular. Aralık dışına çıkan her satır scriptin hata vermesi (exit 1) demektir — motorun regresyon testi budur.

**Mutlak gol bandı bu havuza göredir.** Bu fikstür ve bu takım güçleriyle projenin kendi Poisson tabanı λ = **3.14 gol/maç** üretir; band bunun etrafına kuruldu, genel UCL ortalamasına değil. Asıl kapı `Poisson λ sapması` satırıdır.

| Metrik | Kabul aralığı | Ölçülen |
|---|---|---|
| Maç başına toplam gol | 2.70 – 3.35 | 3.21 |
| Ev sahibi gol ortalaması | 1.40 – 1.85 | 1.77 |
| Deplasman gol ortalaması | 1.15 – 1.55 | 1.43 |
| Beraberlik oranı | %19 – %29 | %21.2 |
| Ev sahibi galibiyet oranı | %39 – %51 | %46.1 |
| Takım başına şut | 9 – 16 | 13.83 |
| İsabetli şut oranı | %28 – %45 | %35.2 |
| Takım başına korner | 3 – 8 | 3.61 |
| Maç başına sarı kart | 2.5 – 5.0 | 3.51 |
| Maç başına kırmızı kart | 0.02 – 0.25 | 0.17 |
| Maç başına penaltı | 0.10 – 0.50 | 0.29 |
| Topa sahip olma toplamı | 99.5 – 100.5 (invariant) | 100.00 |
| **Poisson λ sapması** | %−6 – %+6 | **%2.0** |
| **Güç monotonluğu** | Güç farkı arttıkça favorinin kazanma oranı monoton artmalı | %39 → %46 → %57 → %71 |
| **Skor = gol olayı sayısı** | Her maçta | 0 ihlal |
| **Determinizm** | Aynı seed, iki koşu, aynı JSON | geçti |

Ek yapısal doğrulama (Katman B): 40 maçın 76.616 karesinde faz sürekliliği ihlali 0, saha dışına taşan koordinat 0.

`unpredictability` 0 → güç farkı maksimum etkili; 1 → takımlar eşitlenir. Kalibrasyon varsayılan 0.25 üzerinden yapılır, uçlar ayrıca kontrol edilir.

---

## 7. Kod yerleşimi

Mevcut konvansiyona uyar: saf alan mantığı `src/domain/`, görünüm `src/features/`.

```
src/domain/engine/
  index.ts            genel API yüzeyi (dışarıdan tek giriş noktası)
  types.ts            MatchReport, MatchEvent, MatchPhase, MatchStats, TeamProfile, Zone
  teamProfile.ts      strength → TeamProfile (deterministik, takım id'sine göre önbellekli)
  zones.ts            zon tanımları, aksiyon ağırlıkları, zon xG tablosu
  actions.ts          aksiyon seçimi ve başarı olasılığı (logistic edge)
  shot.ts             xG, blok/isabetsiz/kurtarış/gol/direk dalları, penaltı dönüşümü
  discipline.ts       faul, kart, penaltı kazanımı
  clock.ts            faz süresi, uzatma dakikaları, dakika dönüşümü
  chainState.ts       zincir durumu, olay/faz yazımı, top kaybı ve orta saha başlangıcı
  chain.ts            possession chain karar döngüsü (Katman A çekirdeği)
  calibration.ts      finishingScale hesabı ve sınırları
  stats.ts            timeline → MatchStats (türetme, ayrı zar yok)
  seedKey.ts          seed + matchId → tekrar üretilebilir anahtar
  simulateMatch.ts    sondaj → sabit nokta → maç orkestrasyonu, ENGINE_VERSION

src/features/match-live/
  MatchLiveView.tsx      maçın canlı görünümü (skor, saha, kontroller, anlatım)
  MatchStage.tsx         React kabuğu: canvas, klipler arası DOM katmanı, döngü yaşam döngüsü
  stageLoop.ts           rAF döngüsü, klip giriş/çıkış, ResizeObserver ile ölçüm
  stageDirector.ts       dramaturji: kamera cue'su, zaman ölçeği, flaş, sarsıntı, banner ömrü
  pitchCamera.ts         yayın kamerası: ölü bölge, sönümleme, öngörü, zoom, sarsıntı
  pitchRenderer.ts       katman sırası ve kamera dönüşümü (dünya → ekran uzayı)
  pitchBackdrop.ts       statik sahanın offscreen önbelleği (yalnız ölçü değişince yeniden çizilir)
  pitchScene.ts          çim, ışık, FIFA oranlı çizgiler, kale ağı (yalnız backdrop çağırır)
  pitchActors.ts         oyuncu, top, iz çizimi (yön, gölge, taşıyıcı halkası, dikiş)
  stageOverlay.ts        ekran uzayı: banner, flaş, taraf etiketleri, mini harita
  pitchPalette.ts        saha ve banner renk paleti
  pitchFrame.ts          createPlayback → frameOfPhase(index, t)   ← Katman B çekirdeği
  phasePlan.ts           faz planlarının zincirlenmesi (topun sürekliliği burada garanti edilir)
  geometry.ts            Point/Size, lerp, clamp, easing, kritik sönümleme
  highlights.ts          MatchReport → HighlightClip[] (pozisyon seçimi)
  clipTimeline.ts        klip adımları, aksiyon bazlı ritim, adım imleci (saf, test edilebilir)
  squad.ts               forma numaraları, rol/zon kısıtları, alıcı ve koşucu seçimi
  kits.ts                deterministik forma renkleri, ton ayrımı garantisi
  formations.ts          4-3-3 çapaları, zon → saha ekseni, blok kayması, yayılma/daralma
  EventTicker.tsx        anlatım bandı (aria-live)
  MatchStatsPanel.tsx    şut, korner, xG, topa sahip olma
  commentary.ts          olay → Türkçe spiker metni
  matchAudio.ts          Web Audio: taraftar ambiyansı + gol tezahüratı (dosyasız)
  useMatchAudio.ts       ses yaşam döngüsü, sessize alma tercihi
  useMatchPlayback.ts    oynatım durumu (hız, duraklat, atla, görünür olaylar)
  useMatchReport.ts      seed'den raporu yeniden üretir

src/features/matchday/
  MatchdayModal.tsx      kabuk + aşama geçişi (canlı maç → sonuçlar)
  MatchdayResults.tsx    hafta sonuç listesi ve alt bar
  resultList.ts          hafta sonuçlarının türetilmesi, favori maçın bulunması

src/hooks/usePrefersReducedMotion.ts
scripts/calibrate-engine.mjs   §6 tablosunun yürütülebilir hâli (`npm run calibrate`)
```

**Bağımlılık yönü tek yönlü:** `features/match-live` → `domain/engine` → `domain/random`. Tersi asla. `domain/engine` içinde DOM, React veya `Math.random` geçmez.

---

## 8. Tech stack uyumu

| Konu | Karar | Gerekçe |
|---|---|---|
| Yeni bağımlılık | **Sıfır** | Proje 2 runtime bağımlılığıyla yaşıyor (react, react-dom). Motor saf TS, render Canvas 2D API. |
| React 19 | Canvas dışında normal bileşen; `useRef` + rAF yeterli | Mevcut `features/share/*` zaten imperatif canvas kullanıyor, desen tanıdık. |
| Görsel süreklilik | Faz planları zincirlenir: `ballFrom(N+1) === ballTo(N)`, blok çizgisi `toZone(N) === fromZone(N+1)` üzerinden devam eder | Motor zonu böyle yazıyor (`state.zone = toZone`, top kaybında `mirrorZone`); `ZONE_PROGRESS` ve `ZONE_SPREAD` ayna-simetriktir, bu yüzden faz sınırında top da blok da sıçramaz. |
| Render maliyeti | Statik saha offscreen canvas'ta önbelleklenir, kare başına yalnızca bir `drawImage`; ölçüm `ResizeObserver` ile | Kare içinde `clientWidth` okumak zorunlu yeniden yerleşim tetikler; gradyanı her karede yeniden kurmak boşa boyamadır. |
| Tailwind v4 | Yalnızca kabuk ve kontroller; sahanın kendisi canvas | Token'lar `@theme` içinde hazır. |
| TypeScript | `strict` derleme (`tsc -b`), `MatchEvent` discriminated union | Union olunca `switch` exhaustive olur, yorum gerekmez. |
| Test | Repo'da test runner yok. **Yeni runner kurmuyoruz**; doğrulama `scripts/calibrate-engine.mjs` (Node, mevcut `scripts/*.mjs` deseni) | Konvansiyona uyum; §6 yürütülebilir sözleşme. |
| Depolama | `PredictionMap` şeması değişmez; `ENGINE_VERSION` eklenir | §2.1 |
| Erişilebilirlik | `prefers-reduced-motion` zorunlu; canlı skor `aria-live="polite"`; oynatım klavyeyle kontrol edilebilir | Mevcut modal deseni zaten `<dialog>` kullanıyor. |

---

## 9. Uygulama sırası

| Faz | İş | Durum |
|---|---|---|
| **F1** | `domain/engine` tipleri, `teamProfile`, `zones` | ✅ |
| **F2** | Zincir, şut, disiplin, saat → `simulateMatch` | ✅ |
| **F3** | Kalibrasyon köprüsü + `scripts/calibrate-engine.mjs` | ✅ 16/16 kontrol PASS |
| **F4** | Reducer entegrasyonu + `ENGINE_VERSION` depolama koruması | ✅ |
| **F5** | Katman B: `pitchFrame`, `formations`, `pitchRenderer` | ✅ yapısal doğrulama geçti |
| **F6** | `MatchLiveModal`, oynatım, Türkçe anlatım | ✅ |
| **F7** | Nakavt entegrasyonu (uzatma motor üstünden, penaltı atışları ayrı model) | ✅ |
| **F8** | Sürpriz akış + pozisyon-bazlı klip oynatımı (v2) | ✅ 6.4 klip/maç, ~75 sn izleme |
| **F9** | Web Audio ambiyans + gol tezahüratı (v2) | ✅ dosyasız, sessize alınabilir |
| **F10** | Pas zinciri + takım kimliği (v3) | ✅ 819 geçişte 3 kopukluk, 0 kaleci şutu, 0 renk çakışması |
| **F11** | Canlı istatistik, sabit yükseklik, vuruş sesi, gol senkronu (v4) | ✅ 266 gol klibinde 0.000 sn sapma |

F1–F4 motoru **tek başına** kullanılabilir kılar; 2D olmadan da proje değer kazanır. Bu bilinçli bir sıralamadır: 2D katmanı kesilirse iş yine tamamlanmış olur.

---

## 10. Park listesi (v1'i bloklamaz)

- Gerçek kadro ve oyuncu verisi → olaylara isim (`actor` alanı hazır); forma numaraları zaten yerinde, isim eşlemesi kalıyor
- Diziliş ve taktik seçimi (yüksek pres, kontratak) → `TeamProfile`'a çarpan olarak girer
- Sakatlık ve oyuncu değişikliği
- Isı haritası, pas ağı gibi maç sonrası analiz görselleri
- Maç içi yönetici müdahalesi (canlı taktik değişimi) — oyunu "izlenen"den "oynanan"a çevirir, ayrı bir tasarım turu ister
- Hava durumu, saha ve seyirci etkisi
- Zaman çizelgesinin paylaşılabilir kart olarak dışa aktarımı (`features/share` deseni hazır)
- Nakavt turlarında da pozisyon oynatımı (şu an yalnızca lig aşamasında)
- Şut, kurtarış ve düdük için ek ses efektleri; klip sırasında ambiyansın yükselmesi

---

## 11. Verilen kararlar

1. **Sürpriz akış.** Yeni hafta başlatıldığında modal doğrudan **canlı maç** aşamasında açılır; hafta sonuçları listesi ancak favori maç bittikten (veya atlandıktan) sonra görünür. Modal artık şeffaf değil koyu bir backdrop kullanıyor — arkadaki puan tablosu skorları sızdırmasın diye.
2. **Yalnızca favori takımın maçı izlenebilir.** Diğer maçlarda izleme girişi yok; favori maç elle girilmiş bir skora sahipse (motor üretmediyse) izleme aşaması atlanır ve doğrudan sonuçlar gösterilir.
3. **Forma renkleri uydurulmuştur.** Veri setinde kit rengi yok; renkler takım id'sinden deterministik üretiliyor. Gerçek forma verisi gelirse `kits.ts` tek dokunuşla değişir.
4. **Saha sadece pozisyonda.** Sürekli akan 2D kaldırıldı (§5.1). Arada büyük maç saati ve son önemli an gösterilir.
5. **Motor sürümü değişince ne olur?** `ENGINE_VERSION` localStorage'daki kayıtla uyuşmazsa simüle skorlar atılır, elle girilen skorlar korunur (`predictionStorage.ts`).
6. **Hareket azaltma:** `prefers-reduced-motion` açıksa canvas hiç monte edilmez; maç bitmiş kabul edilip tüm zaman çizelgesi metin olarak listelenir.
7. **Ses varsayılan olarak açık**, tercih `localStorage`'da saklanır, sekme gizlenince susar.
8. **Skor maç boyunca görünür.** Sürpriz korumasının yeri hafta sonuçları listesidir (§11.1), maçın kendisi değil — canlı skorun görünmesi izlemeyi heyecanlı kılar. Kritik olan, golün *pozisyon oynanırken önceden* sızmamasıdır; bunu `reveal` saati garanti eder (§5.6).

## 12. Kaynaklar

- Dixon & Coles düzeltmeli bivariate Poisson: [dashee87 · Predicting Football Results With Statistical Modelling](https://dashee87.github.io/football/python/predicting-football-results-with-statistical-modelling-dixon-coles-and-time-weighting/)
- Bivariate Dixon-Coles genel bakış: [emergentmind](https://www.emergentmind.com/topics/bivariate-dixon-and-coles-model)
- Possession'ı atomik birim alan simülasyon yaklaşımı, spatio-temporal possession modellemesi: [arXiv 2511.14297](https://arxiv.org/pdf/2511.14297)
- Futbol sonuçlarında bağımlılık yapısı: [arXiv 2103.07272](https://arxiv.org/pdf/2103.07272)
- FM motorunun attribute-check temelli karar mantığı: [Football Manager · FM26 tactical evolution](https://www.footballmanager.com/fm26/features/possession-out-possession-fm26s-new-tactical-evolution), [FM Match Engine Tips](https://footballgpt.co/fm/fm-match-engine)
