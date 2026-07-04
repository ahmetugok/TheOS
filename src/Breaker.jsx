import { useEffect, useMemo, useRef, useState } from 'react';
import { store } from './lib/supabase';
import { computeStreak, mapChainBreakerBackup } from './breaker/breakerData.js';
import { CHALLENGES_DB } from './breaker/challenges.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

const MOODS = ['😣', '😕', '😐', '🙂', '😄'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#c8a86b'];
const EMOJIS = ['🚬', '🍺', '🍬', '📱', '🎮', '🛒', '☕', '🌙', '🔥', '💪', '🧘', '📵'];
const SUBS = [
  { key: 'today', label: 'Bugün' },
  { key: 'calendar', label: 'Takvim' },
  { key: 'stats', label: 'İstatistik' },
  { key: 'forge', label: 'Forge' },
];
const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const TR_DOW = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

function addDaysUTC(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
function ymd(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function lastNDays(n, endStr) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(addDaysUTC(endStr, -i));
  return out;
}
function mergeChains(a, b) {
  const map = new Map(a.map(c => [c.id, c]));
  for (const c of b) if (c && c.id != null) map.set(c.id, c);
  return [...map.values()];
}
function mergeLogs(a, b) {
  const out = { ...a };
  for (const d of Object.keys(b)) out[d] = { ...(out[d] || {}), ...b[d] };
  return out;
}
function longestStreak(logs, chainId) {
  const dates = Object.keys(logs).filter(d => logs[d] && logs[d][chainId] === true).sort();
  let best = 0, cur = 0, prev = null;
  for (const d of dates) {
    cur = prev && addDaysUTC(prev, 1) === d ? cur + 1 : 1;
    if (cur > best) best = cur;
    prev = d;
  }
  return best;
}

const S = {
  h2: { fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: 'var(--gold)', margin: '0 0 4px' },
  sub: { fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--txd)', margin: 0, letterSpacing: '0.03em' },
  card: { background: 'var(--s2)', border: '1px solid var(--b)', borderRadius: 12, padding: 16 },
  label: { fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--txd)', letterSpacing: '0.08em', textTransform: 'uppercase' },
  input: {
    padding: '9px 12px', borderRadius: 8, border: '1px solid var(--b)',
    background: 'var(--s3)', color: 'var(--tx)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--fm)',
  },
  chipBtn: (active, color) => ({
    width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 17,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: active ? 'var(--s2)' : 'var(--s3)',
    border: `2px solid ${active ? (color || 'var(--gold)') : 'transparent'}`,
    transition: 'all .15s',
  }),
  primaryBtn: {
    padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'var(--gold)', color: '#0a0a0b', fontWeight: 600, fontSize: 13,
    fontFamily: 'var(--fm)',
  },
};

export default function Breaker({ setXp }) {
  const [chains, setChains] = useState([]);
  const [logs, setLogs] = useState({});
  const [forge, setForge] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('today');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', icon: EMOJIS[0], color: COLORS[0] });
  const saveT = useRef(null);

  const today = todayKey();
  const todayLog = logs[today] || {};

  /* Load */
  useEffect(() => {
    (async () => {
      const c = await store.get('theos_breaker_chains');
      const l = await store.get('theos_breaker_logs');
      const f = await store.get('theos_breaker_forge');
      if (Array.isArray(c)) setChains(c);
      if (l && typeof l === 'object') setLogs(l);
      if (f && typeof f === 'object') setForge(f);
      setLoaded(true);
    })();
  }, []);

  /* Debounced save */
  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      store.set('theos_breaker_chains', chains);
      store.set('theos_breaker_logs', logs);
      store.set('theos_breaker_forge', forge);
    }, 700);
    return () => clearTimeout(saveT.current);
  }, [chains, logs, forge, loaded]);

  const patchToday = (patch) =>
    setLogs(prev => ({ ...prev, [today]: { ...(prev[today] || {}), ...patch } }));

  const addChain = () => {
    const name = form.name.trim();
    if (!name) return;
    setChains(prev => [
      ...prev,
      { id: Date.now().toString(), name, icon: form.icon, color: form.color, createdAt: today },
    ]);
    setForm({ name: '', icon: EMOJIS[0], color: COLORS[0] });
    setAdding(false);
  };

  const removeChain = (id) => setChains(prev => prev.filter(c => c.id !== id));

  const startChallenge = (id) => {
    setForge(prev => prev[id] ? prev : { ...prev, [id]: { startDate: today, checkins: {} } });
  };
  const abandonChallenge = (id) => {
    setForge(prev => { const next = { ...prev }; delete next[id]; return next; });
  };
  const checkInChallenge = (id) => {
    let gained = false;
    setForge(prev => {
      const cur = prev[id];
      if (!cur || cur.checkins[today]) return prev;
      gained = true;
      return { ...prev, [id]: { ...cur, checkins: { ...cur.checkins, [today]: true } } };
    });
    if (gained) setXp(x => x + 50);
  };

  const fileRef = useRef(null);
  const exportData = () => {
    const payload = { chains, logs, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theos-breaker-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importData = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(reader.result); } catch { return; }
      let nc, nl;
      if (Array.isArray(data.chains)) {
        nc = data.chains;
        nl = data.logs && typeof data.logs === 'object' ? data.logs : {};
      } else if (Array.isArray(data.habits) || data.dailyLogs) {
        const mapped = mapChainBreakerBackup(data);
        nc = mapped.chains;
        nl = mapped.logs;
      } else {
        return;
      }
      setChains(prev => mergeChains(prev, nc));
      setLogs(prev => mergeLogs(prev, nl));
    };
    reader.readAsText(file);
  };

  const toggleChain = (id) => {
    const was = todayLog[id] === true;
    patchToday({ [id]: !was });
    // XP sadece false→true geçişinde verilir, geri alımda düşmez
    if (!was) setXp(x => x + 50);
  };

  if (!loaded) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={S.h2}>Breaker</h2>
        <p style={S.sub}>Zincirlerini kır. Her gün seçimini işaretle, seriyi büyüt.</p>
      </div>

      {/* Alt-sekmeler */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--b)' }}>
        {SUBS.map(s => (
          <button key={s.key} onClick={() => setView(s.key)}
            style={{
              fontFamily: 'var(--fm)', fontSize: 12, padding: '8px 18px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: view === s.key ? 'var(--tx)' : 'var(--txd)',
              borderBottom: `2px solid ${view === s.key ? 'var(--gold)' : 'transparent'}`,
              marginBottom: -1, letterSpacing: '0.04em', transition: 'all .2s',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {view === 'today' && (
        <TodayView
          chains={chains} todayLog={todayLog} today={today} logs={logs}
          patchToday={patchToday} toggleChain={toggleChain} removeChain={removeChain}
          adding={adding} setAdding={setAdding} form={form} setForm={setForm} addChain={addChain}
        />
      )}
      {view === 'calendar' && <CalendarView chains={chains} logs={logs} today={today} />}
      {view === 'stats' && <StatsView chains={chains} logs={logs} today={today} />}
      {view === 'forge' && (
        <ForgeView forge={forge} today={today}
          onStart={startChallenge} onAbandon={abandonChallenge} onCheckIn={checkInChallenge} />
      )}

      {/* Veri yedekleme */}
      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--b)', paddingTop: 16 }}>
        <button onClick={exportData}
          style={{ ...S.primaryBtn, background: 'var(--s3)', color: 'var(--tx)', fontSize: 12 }}>
          Dışa aktar
        </button>
        <button onClick={() => fileRef.current?.click()}
          style={{ ...S.primaryBtn, background: 'var(--s3)', color: 'var(--tx)', fontSize: 12 }}>
          İçe aktar
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
          onChange={e => { importData(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </div>
  );
}

function TodayView({ chains, todayLog, today, logs, patchToday, toggleChain, removeChain, adding, setAdding, form, setForm, addChain }) {
  return (
    <>
      {/* Bugünkü ruh hali */}
      <div style={S.card}>
        <div style={{ ...S.label, marginBottom: 10 }}>Bugünün ruh hali</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {MOODS.map((m, i) => {
            const val = i + 1;
            const active = todayLog.mood === val;
            return (
              <button key={val} onClick={() => patchToday({ mood: val })}
                style={{ ...S.chipBtn(active, 'var(--gold)'), width: 44, height: 44, fontSize: 22 }}>
                {m}
              </button>
            );
          })}
        </div>
        <div style={{ ...S.label, margin: '16px 0 8px' }}>Tetikleyici notu</div>
        <textarea
          value={todayLog.note || ''}
          onChange={e => patchToday({ note: e.target.value })}
          placeholder="Bugün seni ne tetikledi? Ne hissettin?"
          style={{ ...S.input, width: '100%', minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      {/* Zincirler */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={S.label}>Zincirler</div>
          {!adding && (
            <button onClick={() => setAdding(true)} style={{ ...S.primaryBtn, padding: '6px 14px', fontSize: 12 }}>
              + Zincir ekle
            </button>
          )}
        </div>

        {adding && (
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              autoFocus
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addChain()}
              placeholder="Zincir adı (örn. Sigara)"
              style={{ ...S.input, width: '100%', boxSizing: 'border-box' }}
            />
            <div>
              <div style={{ ...S.label, marginBottom: 8 }}>İkon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, icon: e }))}
                    style={S.chipBtn(form.icon === e, 'var(--gold)')}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...S.label, marginBottom: 8 }}>Renk</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ ...S.chipBtn(form.color === c, c), background: c }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addChain} style={S.primaryBtn}>Ekle</button>
              <button onClick={() => { setAdding(false); setForm({ name: '', icon: EMOJIS[0], color: COLORS[0] }); }}
                style={{ ...S.primaryBtn, background: 'transparent', color: 'var(--txd)', border: '1px solid var(--b)' }}>
                İptal
              </button>
            </div>
          </div>
        )}

        {chains.length === 0 && !adding && (
          <div style={{ ...S.card, textAlign: 'center', color: 'var(--txd)', fontFamily: 'var(--fm)', fontSize: 13 }}>
            Henüz zincir yok. Kırmak istediğin ilk alışkanlığı ekle.
          </div>
        )}

        {chains.map(chain => {
          const done = todayLog[chain.id] === true;
          const streak = computeStreak(logs, chain.id, today);
          return (
            <div key={chain.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => toggleChain(chain.id)}
                style={{
                  width: 46, height: 46, borderRadius: 12, cursor: 'pointer', fontSize: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? chain.color : 'var(--s3)',
                  border: `2px solid ${done ? chain.color : 'var(--b)'}`,
                  transition: 'all .15s', flexShrink: 0,
                }}>
                {done ? '✓' : chain.icon}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 15, color: 'var(--tx)', fontWeight: 500 }}>
                  {chain.icon} {chain.name}
                </div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: streak > 0 ? 'var(--gold)' : 'var(--txd)', marginTop: 3 }}>
                  {streak > 0 ? `🔥 ${streak} günlük seri` : 'Bugün başla'}
                </div>
              </div>
              <button onClick={() => removeChain(chain.id)} title="Sil"
                style={{ background: 'none', border: 'none', color: 'var(--txd)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CalendarView({ chains, logs, today }) {
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const [selected, setSelected] = useState(null);

  const cells = useMemo(() => {
    const { y, m } = cursor;
    const firstDow = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7; // Pt=0
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const arr = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(ymd(y, m, d));
    return arr;
  }, [cursor]);

  const move = (delta) => setCursor(c => {
    const d = new Date(Date.UTC(c.y, c.m + delta, 1));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });

  const dayInfo = (dateStr) => {
    const log = logs[dateStr] || {};
    const doneCount = chains.filter(c => log[c.id] === true).length;
    const ratio = chains.length ? doneCount / chains.length : 0;
    return { doneCount, ratio, mood: log.mood, note: log.note };
  };

  const selInfo = selected ? dayInfo(selected) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => move(-1)} style={{ ...S.primaryBtn, background: 'var(--s3)', color: 'var(--tx)', padding: '6px 12px' }}>‹</button>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 14, color: 'var(--tx)', letterSpacing: '0.04em' }}>
          {TR_MONTHS[cursor.m]} {cursor.y}
        </div>
        <button onClick={() => move(1)} style={{ ...S.primaryBtn, background: 'var(--s3)', color: 'var(--tx)', padding: '6px 12px' }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {TR_DOW.map(d => (
          <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--txd)' }}>{d}</div>
        ))}
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`e${i}`} />;
          const { ratio, mood } = dayInfo(dateStr);
          const isToday = dateStr === today;
          const dayNum = Number(dateStr.slice(-2));
          const bg = ratio > 0
            ? `rgba(201,168,76,${0.18 + ratio * 0.6})`
            : 'var(--s3)';
          return (
            <button key={dateStr} onClick={() => setSelected(dateStr)}
              style={{
                aspectRatio: '1', borderRadius: 8, cursor: 'pointer',
                background: bg,
                border: `1px solid ${isToday ? 'var(--gold)' : selected === dateStr ? 'var(--txm)' : 'transparent'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                fontFamily: 'var(--fm)', color: 'var(--txm)', fontSize: 11,
              }}>
              <span>{dayNum}</span>
              <span style={{ fontSize: 11, lineHeight: 1 }}>{mood ? MOODS[mood - 1] : ''}</span>
            </button>
          );
        })}
      </div>

      {selInfo && (
        <div style={S.card}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 13, color: 'var(--tx)', marginBottom: 8 }}>
            {selected} {selInfo.mood ? `· ${MOODS[selInfo.mood - 1]}` : ''}
          </div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--gold)' }}>
            {chains.length ? `${selInfo.doneCount}/${chains.length} zincir tutuldu` : 'Zincir yok'}
          </div>
          {selInfo.note && (
            <div style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--txm)', marginTop: 8, lineHeight: 1.5 }}>
              {selInfo.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatsView({ chains, logs, today }) {
  if (chains.length === 0) {
    return (
      <div style={{ ...S.card, textAlign: 'center', color: 'var(--txd)', fontFamily: 'var(--fm)', fontSize: 13 }}>
        İstatistik için önce zincir ekle.
      </div>
    );
  }
  const window = lastNDays(84, today);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {chains.map(chain => {
        const cur = computeStreak(logs, chain.id, today);
        const best = longestStreak(logs, chain.id);
        const hit = window.filter(d => (logs[d] || {})[chain.id] === true).length;
        const pct = Math.round((hit / window.length) * 100);
        return (
          <div key={chain.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{chain.icon}</span>
              <span style={{ fontFamily: 'var(--fm)', fontSize: 14, color: 'var(--tx)' }}>{chain.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <Stat label="Güncel seri" value={`${cur}g`} />
              <Stat label="En uzun seri" value={`${best}g`} />
              <Stat label="Son 84 gün" value={`%${pct}`} />
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--s3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: chain.color, transition: 'width .3s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForgeView({ forge, today, onStart, onAbandon, onCheckIn }) {
  const active = CHALLENGES_DB.filter(c => forge[c.id]);
  const inactive = CHALLENGES_DB.filter(c => !forge[c.id]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {active.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={S.label}>Aktif meydan okumalar</div>
          {active.map(c => {
            const state = forge[c.id];
            const doneCount = Object.keys(state.checkins).length;
            const pct = Math.min(100, Math.round((doneCount / c.duration) * 100));
            const checkedToday = !!state.checkins[today];
            return (
              <div key={c.id} style={{ ...S.card, borderLeft: `3px solid ${c.color}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{c.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: 14, color: 'var(--tx)' }}>{c.title}</div>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--txd)' }}>
                      {doneCount}/{c.duration} gün · %{pct}{c.isStrict ? ' · katı' : ''}
                    </div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--s3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: c.color, transition: 'width .3s' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onCheckIn(c.id)} disabled={checkedToday}
                    style={{
                      ...S.primaryBtn, flex: 1, fontSize: 13,
                      background: checkedToday ? 'var(--s3)' : c.color,
                      color: checkedToday ? 'var(--txd)' : '#0a0a0b',
                      cursor: checkedToday ? 'default' : 'pointer',
                    }}>
                    {checkedToday ? '✓ Bugün tamam' : 'Bugünü işaretle'}
                  </button>
                  <button onClick={() => onAbandon(c.id)}
                    style={{ ...S.primaryBtn, background: 'transparent', color: 'var(--txd)', border: '1px solid var(--b)', fontSize: 12 }}>
                    Bırak
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={S.label}>Meydan okumalar</div>
        {inactive.map(c => (
          <div key={c.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 14, color: 'var(--tx)' }}>{c.title}</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--txd)' }}>
                  {c.duration} gün{c.isStrict ? ' · katı (kaçırırsan baştan)' : ''}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--txm)', lineHeight: 1.5 }}>
              {c.description}
            </div>
            <button onClick={() => onStart(c.id)}
              style={{ ...S.primaryBtn, alignSelf: 'flex-start', background: c.color, fontSize: 12 }}>
              Başlat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'var(--fm)', fontSize: 18, color: 'var(--gold)', fontWeight: 600 }}>{value}</span>
      <span style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--txd)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}
