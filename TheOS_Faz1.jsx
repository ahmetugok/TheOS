import { useState, useEffect, useCallback } from "react";

/* ── Google Fonts ── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0a0a0a;
      --surface:   #111111;
      --surface2:  #1a1a1a;
      --border:    rgba(255,255,255,0.07);
      --border-h:  rgba(255,255,255,0.14);
      --text:      #e8e4dc;
      --text-dim:  #6b6560;
      --text-mid:  #9d9590;
      --gold:      #c9a84c;
      --gold-dim:  rgba(201,168,76,0.12);
      --red:       #c0392b;
      --red-dim:   rgba(192,57,43,0.10);
      --blue:      #4a9eff;
      --blue-dim:  rgba(74,158,255,0.10);
      --green:     #3d9970;
      --green-dim: rgba(61,153,112,0.10);
      --font-display: 'Cormorant Garamond', serif;
      --font-body:    'DM Sans', sans-serif;
    }

    body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

    textarea, input {
      font-family: var(--font-body);
      font-size: 14px;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text);
      resize: none;
      width: 100%;
      line-height: 1.7;
    }
    textarea::placeholder, input::placeholder { color: var(--text-dim); }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-h); border-radius: 2px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-gold {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.15); }
      50%       { box-shadow: 0 0 0 6px rgba(201,168,76,0); }
    }
    .fade-up { animation: fadeUp 0.5s ease forwards; }
    .fade-up-d1 { animation: fadeUp 0.5s 0.08s ease both; }
    .fade-up-d2 { animation: fadeUp 0.5s 0.16s ease both; }
    .fade-up-d3 { animation: fadeUp 0.5s 0.24s ease both; }
    .fade-up-d4 { animation: fadeUp 0.5s 0.32s ease both; }
  `}</style>
);

/* ── Storage (window.storage → localStorage fallback) ── */
const store = {
  async get(key) {
    try {
      const r = await window.storage?.get(key);
      return r ? JSON.parse(r.value) : null;
    } catch {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
    }
  },
  async set(key, value) {
    try { await window.storage?.set(key, JSON.stringify(value)); } catch {}
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

/* ── Default Data ── */
const DEFAULT_IDENTITY = {
  statement: "",
  antiVision: "",
  idealVision: "",
  ikigai: { love: "", good: "", world: "", paid: "" }
};

const DEFAULT_NORTHSTAR = {
  yearly: { goal: "", why: "" },
  monthly: { goal: "", why: "" },
  weekly: { goal: "", why: "" },
  constraints: ""
};

/* ── Small Components ── */
const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    {label && <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
  </div>
);

const Tag = ({ children, color = "gold" }) => {
  const colors = {
    gold:  { bg: "var(--gold-dim)",  text: "var(--gold)",  border: "rgba(201,168,76,0.2)" },
    red:   { bg: "var(--red-dim)",   text: "var(--red)",   border: "rgba(192,57,43,0.2)" },
    blue:  { bg: "var(--blue-dim)",  text: "var(--blue)",  border: "rgba(74,158,255,0.2)" },
    green: { bg: "var(--green-dim)", text: "var(--green)", border: "rgba(61,153,112,0.2)" },
  };
  const c = colors[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: "3px 8px", borderRadius: 3
    }}>{children}</span>
  );
};

const Card = ({ children, accent, style = {} }) => {
  const accents = {
    gold:  { border: "rgba(201,168,76,0.25)", glow: "rgba(201,168,76,0.04)" },
    red:   { border: "rgba(192,57,43,0.25)",  glow: "rgba(192,57,43,0.04)" },
    blue:  { border: "rgba(74,158,255,0.25)", glow: "rgba(74,158,255,0.04)" },
    green: { border: "rgba(61,153,112,0.25)", glow: "rgba(61,153,112,0.04)" },
  };
  const a = accents[accent] || { border: "var(--border)", glow: "transparent" };
  return (
    <div style={{
      background: `linear-gradient(135deg, var(--surface) 0%, ${a.glow} 100%)`,
      border: `1px solid ${a.border}`,
      borderRadius: 16,
      padding: "24px 28px",
      transition: "border-color 0.2s",
      ...style
    }}>
      {children}
    </div>
  );
};

const FieldLabel = ({ children, color = "var(--text-dim)" }) => (
  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color, marginBottom: 10 }}>
    {children}
  </p>
);

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{ display: "block", width: "100%", paddingTop: 4 }}
  />
);

/* ── Save Toast ── */
const SaveIndicator = ({ saved }) => (
  <div style={{
    position: "fixed", bottom: 28, right: 28, zIndex: 100,
    display: "flex", alignItems: "center", gap: 8,
    background: "var(--surface2)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "8px 16px",
    fontSize: 12, color: saved ? "var(--green)" : "var(--text-dim)",
    transition: "all 0.3s", opacity: saved ? 1 : 0.4,
    fontFamily: "var(--font-body)", letterSpacing: "0.04em"
  }}>
    <div style={{
      width: 6, height: 6, borderRadius: "50%",
      background: saved ? "var(--green)" : "var(--text-dim)",
      transition: "background 0.3s"
    }} />
    {saved ? "Kaydedildi" : "Kaydediliyor..."}
  </div>
);

/* ══════════════════════════════════════
   TAB 1: IDENTITY CORE
══════════════════════════════════════ */
function IdentityCore({ data, onChange }) {
  const update = (field, val) => onChange({ ...data, [field]: val });
  const updateIkigai = (key, val) => onChange({ ...data, ikigai: { ...data.ikigai, [key]: val } });

  const ikigaiFields = [
    { key: "love",  label: "Ne yapmayı seviyorsun?",          hint: "Saatlerin nasıl geçtiğini anlamadığın şey",            color: "#c9a84c", accent: "gold"  },
    { key: "good",  label: "Neyde gerçekten iyisin?",         hint: "Başkalarının sana danıştığı, doğal yeteneğin",        color: "#4a9eff", accent: "blue"  },
    { key: "world", label: "Dünyanın neye ihtiyacı var?",     hint: "İnsanların gerçekten çözmek istediği problemler",     color: "#3d9970", accent: "green" },
    { key: "paid",  label: "Bunun için ödeme yapılıyor mu?",  hint: "Para kazandırabilecek, değer yaratan alan",           color: "#c0392b", accent: "red"   },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>

      {/* Identity Statement */}
      <div className="fade-up" style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <Tag color="gold">Kimlik İfadesi</Tag>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <Card accent="gold">
          <p style={{
            fontFamily: "var(--font-display)", fontSize: 13, fontStyle: "italic",
            color: "var(--gold)", letterSpacing: "0.06em", marginBottom: 14
          }}>
            "Ben ... tipinde biriyim."
          </p>
          <textarea
            value={data.statement}
            onChange={e => update("statement", e.target.value)}
            placeholder="Zorluklardan kaçmayan, her gün vizyonuma doğru istikrarlı adımlar atan biriyim."
            rows={2}
            style={{
              fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300,
              fontStyle: "italic", lineHeight: 1.5, color: "var(--text)",
              background: "transparent", border: "none", outline: "none",
              resize: "none", width: "100%"
            }}
          />
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 12, lineHeight: 1.6 }}>
            Dan Koe: Kimlik önce yazılır, davranışlar onu takip eder. Bu ifade her gün gözünün önünde olacak.
          </p>
        </Card>
      </div>

      {/* Vision / Anti-Vision */}
      <div className="fade-up-d1" style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <Tag color="blue">Vizyon Eksenleri</Tag>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card accent="red">
            <FieldLabel color="var(--red)">Anti-Vizyon — Kaçtığın Hayat</FieldLabel>
            <TextArea
              value={data.antiVision}
              onChange={v => update("antiVision", v)}
              placeholder="Başkalarının hayallerini inşa eden, akşamları yorgunluktan ekrana bakan, potansiyelini harcamış biri..."
              rows={5}
            />
            <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10, lineHeight: 1.6 }}>
              Korku, vizyon kadar güçlü bir motivatördür. Gitmek istemediğin yeri net gör.
            </p>
          </Card>
          <Card accent="blue">
            <FieldLabel color="var(--blue)">İdeal Vizyon — Kazandığın Hayat</FieldLabel>
            <TextArea
              value={data.idealVision}
              onChange={v => update("idealVision", v)}
              placeholder="Kendi zamanını kontrol eden, özgürce üreten, bedensel ve zihinsel zirvede olan..."
              rows={5}
            />
            <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10, lineHeight: 1.6 }}>
              Spesifik, duyusal bir vizyon. Sadece hedef değil — bir hayat hissi.
            </p>
          </Card>
        </div>
      </div>

      {/* Ikigai */}
      <div className="fade-up-d2">
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <Tag color="green">Ikigai Kesişimi</Tag>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {ikigaiFields.map(f => (
            <Card key={f.key} accent={f.accent}>
              <FieldLabel color={f.color}>{f.label}</FieldLabel>
              <TextArea
                value={data.ikigai[f.key]}
                onChange={v => updateIkigai(f.key, v)}
                placeholder={f.hint}
                rows={3}
              />
            </Card>
          ))}
        </div>

        {/* Ikigai Summary — gösterilir eğer 3+ alan doluysa */}
        {Object.values(data.ikigai).filter(Boolean).length >= 3 && (
          <Card accent="gold" style={{ marginTop: 4 }}>
            <FieldLabel color="var(--gold)">Kesişim Noktası — Senin Ikigai'n</FieldLabel>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--text)", lineHeight: 1.7, marginTop: 4 }}>
              {[data.ikigai.love, data.ikigai.good, data.ikigai.world, data.ikigai.paid]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}>
              Bu alanların kesiştiği yer, uzun vadeli motivasyonunun merkezidir.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TAB 2: NORTH STAR
══════════════════════════════════════ */
function NorthStar({ data, onChange }) {
  const update = (level, field, val) => onChange({
    ...data,
    [level]: { ...data[level], [field]: val }
  });

  const horizons = [
    {
      key: "yearly", label: "1 Yıllık Ana Görev", sub: "Yılın sonunda neye baktığında 'kazandım' diyeceksin?",
      accent: "gold", color: "var(--gold)", icon: "◈"
    },
    {
      key: "monthly", label: "Boss Savaşı — Bu Ay", sub: "Yıllık hedefin kilidini açacak tek aylık proje",
      accent: "blue", color: "var(--blue)", icon: "◉"
    },
    {
      key: "weekly", label: "Bu Haftanın Odağı", sub: "Aylık projeye en çok katkı sağlayacak tek eylem",
      accent: "green", color: "var(--green)", icon: "◎"
    },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>

      {/* Hierarchy */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {horizons.map((h, i) => (
          <div key={h.key} className={`fade-up-d${i}`}>
            <Card accent={h.accent}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0, marginTop: 2,
                  background: h.accent === "gold" ? "var(--gold-dim)" : h.accent === "blue" ? "var(--blue-dim)" : "var(--green-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: h.color
                }}>
                  {h.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <Tag color={h.accent}>{h.label}</Tag>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.6 }}>{h.sub}</p>
                  <input
                    type="text"
                    value={data[h.key].goal}
                    onChange={e => update(h.key, "goal", e.target.value)}
                    placeholder="Hedef..."
                    style={{
                      fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400,
                      lineHeight: 1.4, color: "var(--text)", padding: "6px 0",
                      borderBottom: `1px solid var(--border)`, marginBottom: 14, display: "block"
                    }}
                  />
                  <div>
                    <FieldLabel>Neden bu hedef?</FieldLabel>
                    <TextArea
                      value={data[h.key].why}
                      onChange={v => update(h.key, "why", v)}
                      placeholder="Bu hedefin arkasındaki gerçek motivasyon... Yüzeyin altına in."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Connector */}
            {i < horizons.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                <div style={{ width: 1, height: 20, background: "var(--border)" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="fade-up-d3" style={{ marginTop: 32 }}>
        <Divider label="Oyun Kuralları" />
        <Card style={{ marginTop: 20 }}>
          <FieldLabel>Kısıtlamalar — Asla Feda Etmeyeceklerin</FieldLabel>
          <TextArea
            value={data.constraints}
            onChange={v => onChange({ ...data, constraints: v })}
            placeholder="Uyku düzenimi (8 saat), aileme ayırdığım zamanı ve fiziksel antrenmanı asla feda etmeyeceğim."
            rows={3}
          />
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10, lineHeight: 1.6 }}>
            Kısıtlar zayıflık değil, özgürlüktür. Neyi koruyacağını bilmek, neye odaklanacağını netleştirir.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   IDENTITY BANNER (persistent)
══════════════════════════════════════ */
function IdentityBanner({ statement }) {
  if (!statement) return null;
  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      padding: "10px 28px",
      background: "rgba(201,168,76,0.03)",
      display: "flex", alignItems: "center", gap: 10
    }}>
      <span style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>Ben</span>
      <p style={{
        fontFamily: "var(--font-display)", fontSize: 15, fontStyle: "italic",
        color: "rgba(232,228,220,0.6)", overflow: "hidden",
        whiteSpace: "nowrap", textOverflow: "ellipsis"
      }}>
        {statement}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("identity");
  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
  const [northStar, setNorthStar] = useState(DEFAULT_NORTHSTAR);
  const [saved, setSaved] = useState(true);
  const [loaded, setLoaded] = useState(false);

  /* Load from storage */
  useEffect(() => {
    (async () => {
      const id = await store.get("theos_identity");
      const ns = await store.get("theos_northstar");
      if (id) setIdentity(id);
      if (ns) setNorthStar(ns);
      setLoaded(true);
    })();
  }, []);

  /* Auto-save with debounce */
  useEffect(() => {
    if (!loaded) return;
    setSaved(false);
    const t = setTimeout(async () => {
      await store.set("theos_identity", identity);
      await store.set("theos_northstar", northStar);
      setSaved(true);
    }, 800);
    return () => clearTimeout(t);
  }, [identity, northStar, loaded]);

  const tabs = [
    { key: "identity", label: "Identity Core" },
    { key: "northstar", label: "North Star" },
  ];

  return (
    <>
      <FontLink />
      <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)" }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 28px",
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)"
        }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600,
                letterSpacing: "0.04em", color: "var(--text)"
              }}>
                The OS
              </span>
              <span style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>
                Faz I
              </span>
            </div>
            <nav style={{ display: "flex", gap: 4 }}>
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                    padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                    transition: "all 0.2s",
                    background: tab === t.key ? "var(--surface2)" : "transparent",
                    color: tab === t.key ? "var(--text)" : "var(--text-dim)",
                    outline: "none",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* ── Identity Banner ── */}
        <IdentityBanner statement={identity.statement} />

        {/* ── Main ── */}
        <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 28px 80px" }}>
          {tab === "identity" && (
            <IdentityCore data={identity} onChange={setIdentity} />
          )}
          {tab === "northstar" && (
            <NorthStar data={northStar} onChange={setNorthStar} />
          )}
        </main>

        <SaveIndicator saved={saved} />
      </div>
    </>
  );
}
