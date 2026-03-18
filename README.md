# TheOS — Kişisel İşletim Sistemi

> "You don't need more motivation. You need a system that makes the right action the default action."
> — Dan Koe

**The OS**, Dan Koe'nun felsefesinden ilham alarak inşa edilmiş, kimlik temelli bir kişisel üretkenlik uygulamasıdır. Alışkanlık takibini, derin odak çalışmasını, günlük yansımayı ve uzun vadeli vizyon yönetimini tek, tutarlı bir sistem altında birleştirir.

---

## Nedir?

Çoğu üretkenlik uygulaması yapılacakları yönetir. **The OS** ise seni yönetir — kim olduğunu, nereye gittiğini ve her gün ne yapman gerektiğini.

Sistem 4 katmandan oluşur:

```
Kimlik (Kim olduğun)
    ↓
Vizyon (Nereye gittiğin)
    ↓
Günlük Sistem (Ne yapıyorsun)
    ↓
Yansıma (Ne öğreniyorsun)
```

---

## Özellikler

### �� Identity Core
- **Kimlik İfadesi** — "Ben … tipinde biriyim" formatında, her ekranda görünür
- **Anti-Vizyon / İdeal Vizyon** — Kaçtığın ve ulaşmak istediğin hayatı yan yana görürsün
- **Ikigai Haritası** — Sevdiğin, iyi olduğun, dünyanın ihtiyacı ve ödeme yapılan alanların kesişimi otomatik özetlenir

### 🎯 North Star
- **Yıl → Ay → Hafta hiyerarşisi** — Her hedefin altında "neden bu?" alanı; hedefi değil motivasyonu takip edersin
- **Kısıtlamalar** — Asla feda etmeyeceğin şeyleri tanımla; bu, odağın sınırlarını çizer

### ⚡ Daily OS
- **Morning Stack** — Özelleştirilebilir sabah ritueli checklist'i
- **Habit Tracker** — SVG halka animasyonuyla günlük alışkanlık takibi
- **Deep Work Timer** — 25 / 50 / 90 dk preset, aktif görev girişi ve tam ekran odak modu
- **Day Score** — Sabah ritueli + alışkanlık tamamlanma oranından hesaplanan günlük skor
- **Günü Kapat** — Günü senkronize et, seri sayacını güncelle, XP kazan

### 📓 Mind Journal
- **Otopilot Kırıcı** — 8 derin soru ile bilinçsiz kalıpları yüzeye çıkar
- **Brain Dump** — Filtresiz serbest yazma, tarihe göre geçmiş kayıtlara erişim
- **Haftalık Review** — Ne işe yaradı / yaramadı / öğrendim / gelecek haftanın tek odağı

### 📈 Progress
- **84 Günlük Aktivite Takvimi** — GitHub contribution graph tarzı, hover tooltip ile
- **Level Ring** — XP'ye göre SVG dairesel progress, level unvanları
- **Alışkanlık Oranları** — 84 güne göre her alışkanlığın başarı yüzdesi
- **Kilometre Taşları** — XP ve seri hedefleri zaman çizelgesinde

---

## Teknik Detaylar

### Stack
- **React** (hooks only, harici state kütüphanesi yok)
- **Tailwind yok** — saf CSS-in-JS, CSS variables ile tema sistemi
- **Sıfır bağımlılık** — sadece React (+ Vite build tool)

### Depolama
`window.storage` (Claude Artifacts) → `localStorage` (yerel). Her iki ortamda da otomatik çalışır. 700ms debounce ile sessiz otomatik kayıt.

### Mimari

```
App (global state: xp, streak, identity, daily)
├── IdentityCore      (identity state)
├── NorthStar         (northStar state)
├── DailyOS
│   ├── DayScore
│   ├── MorningStack
│   ├── HabitTracker
│   └── DeepWorkTimer (local: timer, focusMode)
├── MindJournal
│   ├── AutopilotBreaker
│   ├── BrainDump
│   └── WeeklyReview
└── Progress
    ├── StreakCalendar
    ├── HabitBreakdown
    └── MilestoneTrack
```

### XP Sistemi

| Eylem | XP |
|---|---|
| Alışkanlık tamamlama | +50 |
| Deep work seansı | +50 |
| Günü kusursuz kapatma (tüm görevler) | +150 |
| Streak milestone (7/30/84/365 gün) | +50–200 |

Her 500 XP = 1 Level. Seviyeler: **Başlangıç → Uyanış → Odaklanma → Momentum → Disiplin → Akış → Üretken → Derinlik → Vizyon → Özgürlük**

---

## Kurulum

```bash
# Projeyi klonla
git clone https://github.com/ahmetugok/TheOS.git
cd TheOS

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

Tek dosya: `src/App.jsx` — doğrudan mevcut bir React/Vite projesine de eklenebilir.

---

## Felsefe

The OS üç temel Dan Koe kavramı üzerine inşa edilmiştir:

### 1. Identity-First Change
Davranışları değiştirmeye çalışmak çalışmaz. Kimliği değiştir — davranışlar onu takip eder. Bu yüzden sistem kimlik ifadesiyle başlar ve her ekranda görünür kalır.

### 2. Anti-Vision
İstediğin hayatı hayal etmek kadar, nefret ettiğin hayatı somutlaştırmak da güçlü bir motivatördür. Anti-vizyon, zor anlarda geri döneceğin aynadır.

### 3. The One-Person System
Karmaşık sistemler çöker. Tek yıllık hedef, tek aylık proje, tek haftalık odak — hiyerarşi sade tutulduğunda eylem netleşir.

---

## Geliştirme Yol Haritası

- [ ] Alışkanlık ekleme / silme (Setup ekranı)
- [ ] Mobil-first responsive düzen
- [ ] Haftalık email özeti (export)
- [ ] North Star'dan Daily OS'a otomatik görev bağlantısı
- [ ] Çoklu tema (light mode)
- [ ] PWA desteği (offline, ana ekrana ekle)

---

## Lisans

MIT — istediğin gibi kullan, fork'la, kişiselleştir.

---

<p align="center">
  <i>Sistem seni inşa eder, sen de sistemi inşa edersin.</i>
</p>
