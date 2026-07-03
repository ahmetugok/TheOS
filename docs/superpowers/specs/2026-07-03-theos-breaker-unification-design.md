# TheOS + Breaker Birleşik Çatısı — Tasarım Dokümanı

**Tarih:** 2026-07-03
**Durum:** Onaylandı (tasarım), implementasyon planı bekliyor

## Amaç

İki ayrı uygulamayı, hiçbiri özelliklerini kaybetmeden, tek bir günlük kullanılabilir
çatı altında birleştirmek:

- **TheOS** (React 19 + Vite + Supabase): kimlik temelli kişisel üretkenlik OS'u.
- **Chain Breaker** (vanilla JS PWA): "don't break the chain" tarzı alışkanlık/seri takibi,
  ruh hali + tetikleyici notları, Forge meydan okuma sistemi, çevrimdışı PWA.

TheOS ana kabuk olur; Chain Breaker onun içine bir **Breaker** modülü/sekmesi olarak taşınır.

## Mevcut Durum (keşif)

### TheOS
- `src/App.jsx`: Supabase auth kapısı; oturum varsa `TheOS_Complete.jsx` render eder.
- `TheOS_Complete.jsx` (~2066 satır): tüm uygulama. Sekmeler `TABS` dizisinde (satır ~1500):
  `daily, identity, northstar, journal, progress` (+ gizli `logs`, `metac`).
  Tab render switch satır ~1741.
- `src/lib/supabase.js`: `store` soyutlaması — Supabase `user_data` (user_id, key, value)
  tablosu + localStorage cache/fallback. Offline-first, 700ms debounce.
- XP deseni: `setXp(x => x + N)`. Alışkanlık tamamlama +50, deep work +50.
- Store key deseni: `theos_*` (ör. `theos_identity`, `theos_streak`, `theos_daily_<date>`).
- **PWA yok** (manifest/service worker mevcut değil).

### Chain Breaker
Veri modeli (localStorage):
- `chainbreaker_habits`: `[{id, name, icon, color, createdAt}]` — kullanıcı tanımlı zincirler.
- `chainbreaker_logs`: `{ [date]: { habits: {habitId: bool}, mood: 1-5, note: '' } }`.
- `chainbreaker_settings`, `chainbreaker_forge` (Forge ilerlemesi).
- JSON dışa/içe aktarma: `{ habits, dailyLogs, settings, forgeData, exportDate }`.
- Forge: önceden tanımlı çok günlü meydan okumalar (90 günlük yetenek, 365 günlük günlük,
  21 gün şikayet etmeme, dijital detoks vb.) günlük check-in'lerle.

## Mimari Kararlar

1. **Ana kabuk = TheOS.** Auth ve `store` katmanı korunur.
2. **Breaker = yeni sekme.** `TABS` dizisine `{key:"breaker", label:"Breaker", icon:"⛓"}`,
   render switch'e `{tab==="breaker" && <Breaker xp={xp} setXp={setXp}/>}`.
3. **Port stratejisi:** Chain Breaker'ın vanilla JS'i TheOS deseniyle React'e portlanır —
   saf CSS-in-JS, harici state kütüphanesi yok, TheOS tema değişkenleri (`--gold`, `--tx`,
   `--txm`, `--b`, vb.).
4. **Çoklu zincir** desteklenir (Chain Breaker zaten çoklu habit tutuyor).
5. **XP/Progress tam entegrasyon.**

## Breaker Modülü Kapsamı (özellik kaybı yok)

- Çoklu zincir: kullanıcı tanımlı alışkanlıklar (renk, ikon, oluşturma tarihi, streak).
- Günlük check + ruh hali (1-5) + tetikleyici notu.
- Takvim görünümü (başarılı/başarısız günler, ruh hali göstergeleri).
- Streak istatistikleri.
- Forge meydan okuma sistemi (çok günlü challenge'lar + günlük check-in).
- JSON dışa/içe aktarma (eski Chain Breaker yedeğini import → seriler korunur).

## Veri Modeli & Senkron

TheOS `store` (Supabase + localStorage) kullanılır. Yeni key'ler:

| Key | İçerik (sentetik örnek) |
|---|---|
| `theos_breaker_chains` | `[{id:"h1", name:"Sigara", icon:"🚬", color:"#ef4444", createdAt:"2026-01-01"}]` |
| `theos_breaker_logs` | `{ "2026-07-03": { "h1": true, "mood": 4, "note": "..." } }` |
| `theos_breaker_forge` | Forge ilerleme durumu `{ [challengeId]: { startDate, checkins:{[date]:bool} } }` |

Tarih formatı: `YYYY-MM-DD`. Sonuç: Breaker verisi cihazlar arası otomatik senkron +
çevrimdışı çalışır.

JSON import, Chain Breaker'ın `{ habits, dailyLogs, forgeData }` formatını bu key'lere
dönüştürür (habits→chains; dailyLogs içindeki iç içe `habits` alanı `{chainId: bool}`
olarak düzleştirilir, `mood`/`note` korunur).

## XP / Progress Entegrasyonu

- Temiz/başarılı gün → `setXp(x => x + 50)`.
- Streak kilometre taşları → mevcut Progress milestone + streak takvimine katkı.
- Day Score hesabına Breaker tamamlanma oranı dahil edilir.
- Kural: XP sadece false→true geçişinde verilir, geri alımda düşmez (TheOS mevcut davranışı).

## PWA + Offline

TheOS'a Chain Breaker'dan kazandırılan özellik:

- `vite-plugin-pwa` eklenir (Vite'ın hash'li bundle'ları için doğru precache; elle yazılan
  SW rebuild'de bozulur).
- Chain Breaker'ın `icons/` seti + `manifest.json` (uygulama adı "TheOS", tema `#0a0a0b`).
- Sonuç: telefona kurulabilir, çevrimdışı açılır.

## Uygulama Adı

Uygulama adı **TheOS**. Giriş ekranındaki (`src/App.jsx`) "Daily OS" başlığı ve
`document.title` "TheOS" olarak güncellenir; PWA manifest `name`/`short_name` = "TheOS".

## Kapsam (tek faz)

Tümü tek bir implementasyon planında:
- Kabuk entegrasyonu (Breaker sekmesi).
- PWA + offline.
- Breaker çekirdeği: zincirler, takvim, ruh hali/tetikleyici, streak, XP, JSON import.
- Forge meydan okuma sistemi.

## Kapsam Dışı (YAGNI)

- Chain Breaker'ın vanilla PWA'sının ayrı deploy'u (tek çatı olduğu için gereksiz).
- İki kod tabanını canlı tutan micro-frontend katmanı.
- Chain Breaker `settings` alanının birebir taşınması (TheOS teması global).
