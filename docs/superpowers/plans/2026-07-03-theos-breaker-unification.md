# TheOS + Breaker Birleştirme — Implementasyon Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chain Breaker'ı, tüm özellikleriyle (çoklu zincir, ruh hali/tetikleyici, takvim, streak, Forge, JSON import), TheOS içine bir "Breaker" sekmesi olarak taşımak ve TheOS'a PWA/offline kazandırmak.

**Architecture:** TheOS (React 19 + Vite + Supabase) ana kabuk. Breaker ayrı bir `src/Breaker.jsx` bileşeni; MindJournal deseni gibi kendi verisini doğrudan `store` (Supabase + localStorage) ile yönetir, XP'yi prop olarak gelen `setXp` ile paylaşılan havuza yazar. `TheOS_Complete.jsx` yalnızca yeni bir TAB girişi + render satırı + Breaker'a prop geçişi için dokunulur.

**Tech Stack:** React 19, Vite 8, @supabase/supabase-js, vite-plugin-pwa (yeni), vitest (yalnız saf-mantık testleri için, dev).

## Global Constraints

- Harici state kütüphanesi YOK. Sadece React hooks. (spec: "harici state kütüphanesi yok")
- Tailwind YOK. Saf CSS-in-JS + TheOS tema değişkenleri: `--gold`, `--tx`, `--txm`, `--txd`, `--b`, `--s2`, `--green`, `--rose`, `--fm` (mono font), `--fd` (display font). (spec: "saf CSS-in-JS")
- Store key deseni: `theos_*`. Yeni key'ler: `theos_breaker_chains`, `theos_breaker_logs`, `theos_breaker_forge`. (spec: Veri Modeli)
- Tarih formatı: `YYYY-MM-DD`. TheOS'un mevcut `todayKey()` yardımcı fonksiyonu kullanılır.
- XP: `setXp(x => x + N)`. XP sadece false→true geçişinde verilir, geri alımda düşmez. (spec: XP Entegrasyonu)
- Uygulama adı her yerde "TheOS" (giriş ekranı, document.title, manifest). (spec: Uygulama Adı)
- Kaynak referans: Chain Breaker kodu `https://github.com/ahmetugok/chain-breaker` — `app.js` (1575 satır), `styles.css`, `index.html`, `manifest.json`, `icons/`. Port ederken bu dosyalar okunmalı.

---

### Task 1: PWA + offline + uygulama adı "TheOS"

**Files:**
- Create: `public/icons/` (Chain Breaker `icons/*.png` seti buraya kopyalanır)
- Create: `public/manifest.webmanifest` (veya vite-plugin-pwa `manifest` opsiyonu)
- Modify: `vite.config.js` (vite-plugin-pwa ekle)
- Modify: `package.json` (devDependency: `vite-plugin-pwa`)
- Modify: `index.html` (`<title>TheOS</title>`, theme-color meta)
- Modify: `src/App.jsx` (giriş ekranındaki iki "Daily OS" başlığı → "TheOS")

**Interfaces:**
- Produces: Kurulabilir/çevrimdışı çalışan PWA. Sonraki task'lar için bir bağımlılık yok.

- [ ] **Step 1: vite-plugin-pwa kur**

```bash
cd /Users/ahmetugurgok/TheOS
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: Chain Breaker ikonlarını kopyala**

Chain Breaker deposundan `icons/icon-*.png` (72,96,128,144,152,192,384,512) dosyalarını `public/icons/` altına indir/kopyala. (Kaynak: `gh api repos/ahmetugok/chain-breaker/contents/icons` ile listele, her birini indir.)

- [ ] **Step 3: vite.config.js'e PWA ekle**

Mevcut `vite.config.js` içeriğini okuyup `VitePWA` plugin'ini ekle:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'TheOS',
        short_name: 'TheOS',
        description: 'Kişisel işletim sistemi — kimlik, alışkanlık ve seri takibi',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0b',
        theme_color: '#0a0a0b',
        orientation: 'portrait-primary',
        lang: 'tr',
        icons: [72,96,128,144,152,192,384,512].map(s => ({
          src: `/icons/icon-${s}.png`,
          sizes: `${s}x${s}`,
          type: 'image/png',
          purpose: 'any maskable',
        })),
      },
    }),
  ],
});
```

- [ ] **Step 4: index.html başlık + tema**

`index.html` içinde `<title>` değerini `TheOS` yap, `<head>` içine `<meta name="theme-color" content="#0a0a0b">` ekle.

- [ ] **Step 5: Giriş ekranı adını değiştir**

`src/App.jsx` içindeki iki `Daily OS` metnini (signedUp ekranı `<h2>` ve login `<h2>`) `TheOS` yap.

- [ ] **Step 6: Build ile doğrula**

Run: `npm run build`
Expected: Hatasız build. `dist/` içinde `sw.js` ve `manifest.webmanifest` üretilmiş olmalı.

- [ ] **Step 7: Tarayıcıda doğrula**

Run: `npm run preview`, tarayıcıda aç. DevTools → Application → Manifest'te "TheOS" ve ikonlar görünmeli; Service Worker "activated" olmalı. Ağı kapatıp sayfayı yenile → yüklenmeli.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: TheOS'a PWA/offline ekle ve uygulama adini TheOS yap"
```

---

### Task 2: Breaker veri katmanı + saf mantık (import mapper + streak) — testli

**Files:**
- Create: `src/breaker/breakerData.js`
- Create: `src/breaker/breakerData.test.js`
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)

**Interfaces:**
- Produces:
  - `mapChainBreakerBackup(backup) -> { chains, logs }`
    - `backup`: `{ habits:[{id,name,icon,color,createdAt}], dailyLogs:{[date]:{habits:{[id]:bool},mood,note}}, forgeData }`
    - dönüş `chains`: `[{id,name,icon,color,createdAt}]`
    - dönüş `logs`: `{ [date]: { [chainId]: bool, mood, note } }` (dailyLogs'taki iç içe `habits` düzleştirilir; `mood`/`note` korunur)
  - `computeStreak(logs, chainId, todayStr) -> number` — bugünden geriye, `logs[date][chainId] === true` olan kesintisiz gün sayısı.

- [ ] **Step 1: vitest kur**

```bash
cd /Users/ahmetugurgok/TheOS
npm install -D vitest
```
`package.json` scripts'e ekle: `"test": "vitest run"`.

- [ ] **Step 2: Failing test yaz**

`src/breaker/breakerData.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { mapChainBreakerBackup, computeStreak } from './breakerData.js';

describe('mapChainBreakerBackup', () => {
  it('habits -> chains, dailyLogs düzleştirilir', () => {
    const backup = {
      habits: [{ id: 'h1', name: 'Sigara', icon: '🚬', color: '#ef4444', createdAt: '2026-01-01' }],
      dailyLogs: { '2026-07-01': { habits: { h1: true }, mood: 4, note: 'iyi' } },
    };
    const { chains, logs } = mapChainBreakerBackup(backup);
    expect(chains).toEqual(backup.habits);
    expect(logs['2026-07-01']).toEqual({ h1: true, mood: 4, note: 'iyi' });
  });

  it('eksik alanlar guvenli defaultlar', () => {
    const { chains, logs } = mapChainBreakerBackup({});
    expect(chains).toEqual([]);
    expect(logs).toEqual({});
  });
});

describe('computeStreak', () => {
  it('bugunden geriye kesintisiz true sayar', () => {
    const logs = {
      '2026-07-03': { h1: true }, '2026-07-02': { h1: true }, '2026-07-01': { h1: false },
    };
    expect(computeStreak(logs, 'h1', '2026-07-03')).toBe(2);
  });
  it('bugun false ise 0', () => {
    expect(computeStreak({ '2026-07-03': { h1: false } }, 'h1', '2026-07-03')).toBe(0);
  });
});
```

- [ ] **Step 3: Testin fail ettiğini doğrula**

Run: `npm test`
Expected: FAIL — "Failed to resolve import './breakerData.js'".

- [ ] **Step 4: Minimal implementasyon**

`src/breaker/breakerData.js`:

```js
export function mapChainBreakerBackup(backup = {}) {
  const chains = Array.isArray(backup.habits) ? backup.habits : [];
  const logs = {};
  const src = backup.dailyLogs || {};
  for (const date of Object.keys(src)) {
    const day = src[date] || {};
    const flat = { ...(day.habits || {}) };
    if (day.mood != null) flat.mood = day.mood;
    if (day.note != null) flat.note = day.note;
    logs[date] = flat;
  }
  return { chains, logs };
}

function addDays(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function computeStreak(logs = {}, chainId, todayStr) {
  let n = 0;
  let cur = todayStr;
  while (logs[cur] && logs[cur][chainId] === true) {
    n += 1;
    cur = addDays(cur, -1);
  }
  return n;
}
```

- [ ] **Step 5: Testin geçtiğini doğrula**

Run: `npm test`
Expected: PASS (4 test).

- [ ] **Step 6: Commit**

```bash
git add src/breaker/breakerData.js src/breaker/breakerData.test.js package.json package-lock.json
git commit -m "feat: Breaker veri katmani (import mapper + streak) + testler"
```

---

### Task 3: Breaker çekirdek UI — zincirler, günlük check, ruh hali, tetikleyici notu

**Files:**
- Create: `src/Breaker.jsx`
- Modify: `TheOS_Complete.jsx` (TABS dizisine giriş; render switch'e satır; `<App>` içinde import)

**Interfaces:**
- Consumes: `mapChainBreakerBackup`, `computeStreak` (Task 2); `store` (`src/lib/supabase.js`); `todayKey()` (TheOS_Complete.jsx içinde tanımlı ama export edilmiyor — Breaker.jsx kendi küçük kopyasını içerir).
- Produces: `export default function Breaker({ setXp })` — TheOS_Complete.jsx bunu render eder.

**Breaker.jsx iç davranışı:**
- State: `chains` (`theos_breaker_chains`), `logs` (`theos_breaker_logs`). Mount'ta `store.get` ile yükle, MindJournal deseni gibi değişince `store.set` ile 700ms debounce kaydet.
- Zincir ekle/sil: isim + ikon (emoji) + renk seçimi. `id: Date.now().toString()`, `createdAt: todayKey()`.
- Bugün paneli: her zincir için toggle (bugünkü `logs[today][chainId]`). false→true geçişinde `setXp(x=>x+50)`.
- Bugünün ruh hali (1-5) ve tetikleyici notu: `logs[today].mood`, `logs[today].note`.
- Her zincir kartında `computeStreak(logs, chain.id, todayKey())` ile güncel seri gösterilir.
- Stil: TheOS tema değişkenleri; Chain Breaker `styles.css` `.habit-item`, mood butonları referans alınır.

- [ ] **Step 1: Breaker.jsx iskeletini yaz**

`src/Breaker.jsx` — yukarıdaki "iç davranış" sözleşmesine göre. `store` import: `import { store } from './lib/supabase';`. `map/computeStreak` import: `import { computeStreak } from './breaker/breakerData.js';`. Kaynak port referansı: Chain Breaker `app.js` içindeki habit render (`renderHabits`, satır ~263 civarı), mood butonları (`MOOD_EMOJIS`), not alanı (`renderNotes`/day modal). Emoji/renk seçimi Chain Breaker'daki habit ekleme akışından (satır ~381) uyarlanır.

- [ ] **Step 2: TheOS_Complete.jsx'e entegre et**

`TheOS_Complete.jsx` en üstüne import ekle: `import Breaker from './src/Breaker.jsx';` (TheOS_Complete.jsx kökte, Breaker.jsx `src/` altında → `./src/Breaker.jsx`; import satırında yolu doğrula).

`TABS` dizisine ekle (progress'ten sonra):
```js
{key:"breaker",  label:"Breaker",        icon:"⛓"},
```
Render switch'e (progress satırının yanına) ekle:
```jsx
{tab==="breaker"   && <Breaker setXp={setXp}/>}
```

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`
Expected: Hatasız build.

- [ ] **Step 4: Tarayıcıda doğrula**

Run: `npm run dev`. Giriş yap → "Breaker" sekmesi görünür. Zincir ekle, bugünkü toggle'ı aç → XP artar (header'daki XP), seri 1 olur. Sayfayı yenile → veri korunur (store). Toggle'ı geri kapat → XP düşmez.

- [ ] **Step 5: Commit**

```bash
git add src/Breaker.jsx TheOS_Complete.jsx
git commit -m "feat: Breaker cekirdek UI (zincirler, gunluk check, ruh hali, tetikleyici) + XP entegrasyonu"
```

---

### Task 4: Breaker takvim + seri istatistikleri görünümü

**Files:**
- Modify: `src/Breaker.jsx` (takvim + istatistik bölümü ekle)

**Interfaces:**
- Consumes: Task 3'teki `chains`, `logs` state; `computeStreak` (Task 2).
- Produces: Breaker sekmesi içinde takvim + istatistik alt-görünümü.

- [ ] **Step 1: Takvim bileşenini ekle**

Chain Breaker `app.js` `renderCalendar` (satır ~440-500) ve `openDayModal` (satır ~536+) mantığını React'e port et: ay ızgarası, her gün için o günkü zincir tamamlanma + `mood` göstergesi (`MOOD_EMOJIS`). Bir güne tıklayınca o günün notunu/mood'unu göster (salt görüntüleme yeterli; düzenleme bugün paneline bırakılabilir).

- [ ] **Step 2: İstatistik bölümü ekle**

Her zincir için: güncel seri (`computeStreak`), en uzun seri, son 84 güne göre başarı yüzdesi. Chain Breaker istatistik hesaplarını referans al.

- [ ] **Step 3: Build + tarayıcı doğrulama**

Run: `npm run build` (hatasız). `npm run dev` → takvimde işaretli günler ve mood emojileri görünür; istatistikler doğru.

- [ ] **Step 4: Commit**

```bash
git add src/Breaker.jsx
git commit -m "feat: Breaker takvim ve seri istatistikleri"
```

---

### Task 5: JSON dışa/içe aktarma (eski Chain Breaker verisi göçü)

**Files:**
- Modify: `src/Breaker.jsx` (export/import UI + handler)

**Interfaces:**
- Consumes: `mapChainBreakerBackup` (Task 2); Task 3 `chains`/`logs` state + store setter'ları.
- Produces: Breaker içinde "Dışa aktar" (JSON indir) ve "İçe aktar" (dosya seç) butonları.

- [ ] **Step 1: Export handler**

Mevcut `chains` + `logs`'u `{ chains, logs, exportDate: new Date().toISOString() }` olarak Blob ile indir. Chain Breaker `exportData` (app.js ~975) referans; dosya adı `theos-breaker-backup-<today>.json`.

- [ ] **Step 2: Import handler**

`<input type="file">` ile JSON oku (FileReader). İki formatı da destekle:
- Yeni format `{ chains, logs }` → doğrudan yükle.
- Eski Chain Breaker formatı `{ habits, dailyLogs, forgeData }` → `mapChainBreakerBackup` ile dönüştür.
Yüklenen veriyi mevcut state ile birleştir (aynı `id`/`date` üzerine yaz), store'a kaydet.

- [ ] **Step 3: Doğrulama**

Run: `npm run dev`. Chain Breaker'dan alınmış gerçek bir `chainbreaker-backup-*.json` dosyasını içe aktar → zincirler ve geçmiş günler (seriler dahil) Breaker'da görünür. Dışa aktar → indirilen dosya tekrar içe aktarılabilir.

- [ ] **Step 4: Commit**

```bash
git add src/Breaker.jsx
git commit -m "feat: Breaker JSON disa/ice aktarma + eski Chain Breaker gocu"
```

---

### Task 6: Forge meydan okuma sistemi

**Files:**
- Create: `src/breaker/challenges.js` (CHALLENGES_DB)
- Modify: `src/Breaker.jsx` (Forge alt-sekmesi)

**Interfaces:**
- Consumes: `store` (`theos_breaker_forge`); `setXp` (Task 3 prop, Breaker zaten alıyor); `todayKey()`.
- Produces: Breaker içinde "Forge" alt-görünümü.
- `theos_breaker_forge` şekli: `{ [challengeId]: { startDate, checkins: { [date]: true } } }`.

- [ ] **Step 1: CHALLENGES_DB portu**

`src/breaker/challenges.js` — Chain Breaker `app.js` `CHALLENGES_DB` (satır ~1150+) dizisini export et: `[{id, title, duration, emoji, color, isStrict, ...}]`. Değerleri kaynaktan birebir kopyala.

- [ ] **Step 2: Forge UI + check-in**

Chain Breaker `renderForge` (app.js ~560+) mantığını port et: aktif challenge'lar, günlük check-in butonu, ilerleme (checkins sayısı / duration), kalan gün. Check-in `theos_breaker_forge`'a yazılır. Yeni check-in (o gün ilk kez) → `setXp(x=>x+50)`.

- [ ] **Step 3: Build + tarayıcı doğrulama**

Run: `npm run build` (hatasız). `npm run dev` → Forge alt-sekmesinde challenge listesi; bir challenge başlat, günlük check-in yap → ilerleme artar, XP artar. Yenile → korunur.

- [ ] **Step 4: Commit**

```bash
git add src/breaker/challenges.js src/Breaker.jsx
git commit -m "feat: Breaker Forge meydan okuma sistemi + check-in XP"
```

---

## Notlar

- **Test kapsamı:** Saf mantık (import mapper, streak) birim testli. UI port task'ları build + manuel tarayıcı doğrulaması ile kapanır — kod tabanında DOM test altyapısı yok ve UI saf CSS-in-JS monolit; bu proje için manuel doğrulama uygun.
- **Deploy:** Depoda mevcut deploy akışı neyse (Vercel/GitHub Pages) build çıktısı onunla uyumlu. PWA `dist/` içine üretilir; ayrı adım gerekmez.
- **`todayKey()`:** TheOS_Complete.jsx içinde tanımlı ama export edilmiyor. Breaker.jsx ve challenges.js kendi küçük `todayKey()` kopyasını içerir (`new Date().toISOString().slice(0,10)` — mevcut davranışla eşleştiğini Task 3 Step 1'de doğrula).
