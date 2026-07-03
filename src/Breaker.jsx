import { useEffect, useRef, useState } from 'react';
import { store } from './lib/supabase';
import { computeStreak } from './breaker/breakerData.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

const MOODS = ['😣', '😕', '😐', '🙂', '😄'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#c8a86b'];
const EMOJIS = ['🚬', '🍺', '🍬', '📱', '🎮', '🛒', '☕', '🌙', '🔥', '💪', '🧘', '📵'];

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
  const [loaded, setLoaded] = useState(false);
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
      if (Array.isArray(c)) setChains(c);
      if (l && typeof l === 'object') setLogs(l);
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
    }, 700);
    return () => clearTimeout(saveT.current);
  }, [chains, logs, loaded]);

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

  const removeChain = (id) => {
    setChains(prev => prev.filter(c => c.id !== id));
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

      {/* Bugünkü ruh hali */}
      <div style={S.card}>
        <div style={{ ...S.label, marginBottom: 10 }}>Bugünün ruh hali</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {MOODS.map((m, i) => {
            const val = i + 1;
            const active = todayLog.mood === val;
            return (
              <button key={val} onClick={() => patchToday({ mood: val })}
                style={{
                  ...S.chipBtn(active, 'var(--gold)'), width: 44, height: 44, fontSize: 22,
                }}>
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
              <button onClick={() => removeChain(chain.id)}
                title="Sil"
                style={{ background: 'none', border: 'none', color: 'var(--txd)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
