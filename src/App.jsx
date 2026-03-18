import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// GLOBAL STYLES
// ============================================================
const injectStyles = () => {
  if (document.getElementById('os-styles')) return;
  const s = document.createElement('style');
  s.id = 'os-styles';
  s.textContent = `
    :root {
      --bg:#0a0a0f;--bg-card:#111118;--bg-input:#16161f;--bg-hover:#1c1c28;
      --border:#252535;--border-focus:#3a3a55;
      --text:#e8e8f0;--text-muted:#6b6b82;--text-soft:#a0a0b5;
      --accent:#00d4aa;--accent-dim:rgba(0,212,170,.12);
      --a2:#7c3aed;--a2-dim:rgba(124,58,237,.12);
      --warn:#f59e0b;--warn-dim:rgba(245,158,11,.12);
      --danger:#ef4444;--success:#22c55e;
      --r:8px;--r-lg:14px;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%;background:var(--bg);color:var(--text);
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      font-size:14px;line-height:1.5}
    #root{height:100%}
    input,textarea,button,select{font-family:inherit;font-size:inherit}
    textarea{resize:vertical}
    button{cursor:pointer}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
    ::selection{background:var(--accent-dim)}
    input:focus,textarea:focus{border-color:var(--border-focus)!important;outline:none}
    button:active{transform:scale(.97)}
    .fade-in{animation:fadeIn .25s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @media(max-width:640px){.hide-mobile{display:none!important}}
  `;
  document.head.appendChild(s);
};

// ============================================================
// STORAGE
// ============================================================
const store = {
  get(key) {
    try { const r=(window.storage||localStorage).getItem(key); return r?JSON.parse(r):null; }
    catch { return null; }
  },
  set(key,val) {
    try { (window.storage||localStorage).setItem(key,JSON.stringify(val)); } catch(e) { void e; }
  },
};

// ============================================================
// HOOKS
// ============================================================
function useDebounce(fn, delay) {
  const t = useRef(null);
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; });
  return useCallback((...a) => { clearTimeout(t.current); t.current = setTimeout(()=>ref.current(...a), delay); }, [delay]);
}

// ============================================================
// CONSTANTS & UTILITIES
// ============================================================
const XP_PER_LEVEL = 500;
const LEVELS = ['Başlangıç','Uyanış','Odaklanma','Momentum','Disiplin','Akış','Üretken','Derinlik','Vizyon','Özgürlük'];

const getLevelInfo = (xp) => {
  const idx = Math.min(Math.floor(xp/XP_PER_LEVEL), LEVELS.length-1);
  const pct = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  return { idx, name: LEVELS[idx], pct, current: xp%XP_PER_LEVEL };
};

const todayStr = () => new Date().toISOString().split('T')[0];

const getWeekKey = () => {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(),0,1);
  const week = Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
  return `${d.getFullYear()}-W${week}`;
};

const AUTOPILOT_QS = [
  'Gerçekten ne istiyorum, şu an ne yapıyorum?',
  'Hangi alışkanlıklarım beni geri çekiyor?',
  'Bugün kiminle vakit geçirdim? Bu ilişkiler beni yükselttiyor mu?',
  'En büyük korkum nedir ve ondan kaçıyor muyum?',
  '5 yıl sonra kendime ne söyleyebilmek isterdim?',
  'Gündelik hayatımda ne sahte, ne gerçek?',
  'Sürekli ertelediğim bir karar var mı?',
  'Bugün kim olmak istiyorum?',
];

const DEFAULT_HABITS = [
  { id:1, name:'Egzersiz', color:'#00d4aa' },
  { id:2, name:'Okuma',    color:'#7c3aed' },
  { id:3, name:'Meditasyon', color:'#f59e0b' },
];

const DEFAULT_MORNING = [
  { id:1, text:'Su iç' },
  { id:2, text:'Günlük hedefleri gözden geçir' },
  { id:3, text:'5 dk meditasyon' },
  { id:4, text:'Günü planla' },
];

const mkState = () => ({
  xp: 0, streak: 0, lastCloseDate: null,
  identity: { statement:'', antiVision:'', idealVision:'',
    ikigai:{ love:'', goodAt:'', worldNeeds:'', paidFor:'' }},
  northStar: {
    year:{ goal:'', why:'' }, month:{ goal:'', why:'' }, week:{ goal:'', why:'' },
    constraints:['','',''],
  },
  daily: {
    date: todayStr(),
    morningStack: DEFAULT_MORNING.map(m=>({...m, done:false})),
    habits: DEFAULT_HABITS.map(h=>({...h, done:false})),
    deepWork:{ sessions:0, totalMinutes:0 },
    dayClosed: false,
  },
  journal:{ autopilot:{}, brainDump:[], weeklyReview:{} },
  history:{},
});

const loadState = () => {
  const saved = store.get('the-os-v1');
  if (!saved) return mkState();
  const base = mkState();
  const s = { ...base, ...saved,
    identity:{...base.identity,...(saved.identity||{})},
    northStar:{...base.northStar,...(saved.northStar||{})},
    daily:{...base.daily,...(saved.daily||{})},
    journal:{...base.journal,...(saved.journal||{})},
    history:{...base.history,...(saved.history||{})},
  };
  // Reset daily if new day
  if (s.daily.date !== todayStr()) {
    const d = s.daily;
    const mDone = d.morningStack.filter(m=>m.done).length;
    const mTotal = d.morningStack.length;
    const hDone = d.habits.filter(h=>h.done).length;
    const hTotal = d.habits.length;
    const score = mTotal>0&&hTotal>0 ? Math.round((mDone/mTotal)*50+(hDone/hTotal)*50) : 0;
    s.history[d.date] = { score, mDone, mTotal, hDone, hTotal,
      dwSessions: d.deepWork.sessions, closed: d.dayClosed };
    s.daily = {
      date: todayStr(),
      morningStack: d.morningStack.map(m=>({...m,done:false})),
      habits: d.habits.map(h=>({...h,done:false})),
      deepWork:{ sessions:0, totalMinutes:0 },
      dayClosed: false,
    };
  }
  return s;
};

// ============================================================
// MINI UI COMPONENTS
// ============================================================
function Input({ value, onChange, placeholder, style }) {
  return (
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ background:'var(--bg-input)', border:'1px solid var(--border)',
        borderRadius:'var(--r)', color:'var(--text)', padding:'8px 12px',
        width:'100%', ...style }} />
  );
}

function Textarea({ value, onChange, placeholder, rows=4, style }) {
  return (
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      rows={rows}
      style={{ background:'var(--bg-input)', border:'1px solid var(--border)',
        borderRadius:'var(--r)', color:'var(--text)', padding:'10px 12px',
        width:'100%', lineHeight:'1.6', ...style }} />
  );
}

function Btn({ children, onClick, variant='ghost', style, disabled }) {
  const vs = {
    primary:{ background:'var(--accent)', color:'#0a0a0f', border:'none', fontWeight:700 },
    secondary:{ background:'var(--a2)', color:'#fff', border:'none', fontWeight:700 },
    ghost:{ background:'transparent', color:'var(--text-muted)', border:'1px solid var(--border)' },
    danger:{ background:'var(--danger)', color:'#fff', border:'none', fontWeight:700 },
    warn:{ background:'var(--warn)', color:'#0a0a0f', border:'none', fontWeight:700 },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...vs[variant], padding:'8px 16px', borderRadius:'var(--r)',
        cursor: disabled?'not-allowed':'pointer', fontSize:'13px',
        opacity: disabled ? 0.5 : 1, transition:'opacity .15s,transform .1s', ...style }}>
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:'var(--r-lg)', padding:'20px', ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <span style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.08em',
      textTransform:'uppercase', color:'var(--text-muted)', display:'block', marginBottom:6 }}>
      {children}
    </span>
  );
}

function Section({ title, children, accent, style }) {
  return (
    <div style={{ ...style }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {accent && <div style={{ width:3, height:18, background:accent, borderRadius:2 }} />}
        <h2 style={{ fontSize:17, fontWeight:700 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Badge({ children, color='var(--accent)' }) {
  return (
    <span style={{ background:`${color}22`, color, border:`1px solid ${color}44`,
      borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:600 }}>
      {children}
    </span>
  );
}

// ============================================================
// SVG RING
// ============================================================
function Ring({ pct, size=64, stroke=6, color='var(--accent)', children, label }) {
  const r = (size-stroke*2)/2;
  const circ = 2*Math.PI*r;
  const dash = pct*circ;
  return (
    <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="var(--border)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeLinecap="round"
            style={{ transition:'stroke-dasharray .5s ease' }} />
        </svg>
        {children && (
          <div style={{ position:'absolute', inset:0, display:'flex',
            alignItems:'center', justifyContent:'center' }}>
            {children}
          </div>
        )}
      </div>
      {label && <span style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center' }}>{label}</span>}
    </div>
  );
}

// ============================================================
// IDENTITY CORE
// ============================================================
function IdentityCore({ state, setState }) {
  const { identity } = state;

  const set = (field, val) => setState(s => ({
    ...s, identity:{ ...s.identity, [field]:val }
  }));
  const setIk = (field, val) => setState(s => ({
    ...s, identity:{ ...s.identity, ikigai:{ ...s.identity.ikigai, [field]:val }}
  }));

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Identity Statement */}
      <Card>
        <Section title="🪞 Kimlik İfadesi" accent="var(--accent)">
          <Label>Ben … tipinde biriyim</Label>
          <Input value={identity.statement}
            onChange={v=>set('statement',v)}
            placeholder="Ben disiplinli, vizyoner bir girişimci tipinde biriyim."
            style={{ fontSize:15, fontWeight:500 }} />
          {identity.statement && (
            <div style={{ marginTop:12, padding:'12px 16px',
              background:'var(--accent-dim)', borderRadius:'var(--r)',
              border:'1px solid var(--border)',
              color:'var(--text)', fontSize:15, fontStyle:'italic' }}>
              "{identity.statement}"
            </div>
          )}
        </Section>
      </Card>

      {/* Anti vs Ideal Vision */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <Section title="⚡ Anti-Vizyon" accent="var(--danger)">
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>
              Nefret ettiğin, kaçtığın hayat — güçlü bir motivatör
            </p>
            <Textarea value={identity.antiVision} onChange={v=>set('antiVision',v)}
              placeholder="Drifting through life with no purpose, consuming instead of creating..."
              rows={5} />
          </Section>
        </Card>
        <Card>
          <Section title="✨ İdeal Vizyon" accent="var(--accent)">
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>
              Ulaşmak istediğin hayat — çekildiğin yer
            </p>
            <Textarea value={identity.idealVision} onChange={v=>set('idealVision',v)}
              placeholder="Deeply focused, financially free, creating meaningful work every day..."
              rows={5} />
          </Section>
        </Card>
      </div>

      {/* Ikigai */}
      <Card>
        <Section title="🗺 Ikigai Haritası" accent="var(--a2)">
          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
            Sevdiğin, iyi olduğun, dünyanın ihtiyacı olan ve ödeme yapılan alanların kesişimi
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { key:'love', label:'❤️ Sevdiğin', color:'var(--danger)',
                ph:'Yaratıcılık, yazma, öğretme...' },
              { key:'goodAt', label:'💪 İyi Olduğun', color:'var(--accent)',
                ph:'Analitik düşünce, kod yazma...' },
              { key:'worldNeeds', label:'🌍 Dünyanın İhtiyacı', color:'var(--a2)',
                ph:'Eğitim, çözüm üretimi...' },
              { key:'paidFor', label:'💰 Ödeme Yapılan', color:'var(--warn)',
                ph:'Danışmanlık, yazılım geliştirme...' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Textarea value={identity.ikigai[key]}
                  onChange={v=>setIk(key,v)}
                  placeholder={ph} rows={3} />
              </div>
            ))}
          </div>
          {Object.values(identity.ikigai).every(v=>v.trim()) && (
            <div style={{ marginTop:16, padding:16, background:'var(--a2-dim)',
              borderRadius:'var(--r)', border:'1px solid var(--border)' }}>
              <Label>🎯 Ikigai Özeti</Label>
              <p style={{ fontSize:13, color:'var(--text-soft)', lineHeight:1.7 }}>
                Sevdiğin şey: <strong style={{color:'var(--danger)'}}>{identity.ikigai.love}</strong>
                {' · '}
                İyi olduğun şey: <strong style={{color:'var(--accent)'}}>{identity.ikigai.goodAt}</strong>
                {' · '}
                Dünyanın ihtiyacı: <strong style={{color:'var(--a2)'}}>{identity.ikigai.worldNeeds}</strong>
                {' · '}
                Ödeme yapılan: <strong style={{color:'var(--warn)'}}>{identity.ikigai.paidFor}</strong>
              </p>
            </div>
          )}
        </Section>
      </Card>
    </div>
  );
}

// ============================================================
// NORTH STAR
// ============================================================
function NorthStar({ state, setState }) {
  const { northStar } = state;

  const getDimColor = (color) => {
    if (color === 'var(--accent)') return 'var(--accent-dim)';
    if (color === 'var(--a2)') return 'var(--a2-dim)';
    return 'var(--warn-dim)';
  };

  const setGoal = (period, field, val) => setState(s => ({
    ...s, northStar:{ ...s.northStar,
      [period]:{ ...s.northStar[period], [field]:val }}
  }));
  const setConstraint = (i, val) => setState(s => ({
    ...s, northStar:{ ...s.northStar,
      constraints: s.northStar.constraints.map((c,j)=>j===i?val:c) }
  }));
  const addConstraint = () => setState(s => ({
    ...s, northStar:{ ...s.northStar, constraints:[...s.northStar.constraints,''] }
  }));

  const periods = [
    { key:'year', label:'📅 Yıllık Hedef', color:'var(--accent)', ph:'Bu yıl kim olacağım?' },
    { key:'month', label:'🗓 Aylık Hedef', color:'var(--a2)', ph:'Bu ay ne teslim edeceğim?' },
    { key:'week', label:'📋 Haftalık Hedef', color:'var(--warn)', ph:'Bu hafta tek odak noktam?' },
  ];

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {periods.map(({key,label,color,ph}) => (
        <Card key={key}>
          <Section title={label} accent={color}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <Label>Hedef</Label>
                <Input value={northStar[key].goal}
                  onChange={v=>setGoal(key,'goal',v)} placeholder={ph} />
              </div>
              <div>
                <Label>Neden? (motivasyonun)</Label>
                <Input value={northStar[key].why}
                  onChange={v=>setGoal(key,'why',v)}
                  placeholder="Çünkü..." />
              </div>
            </div>
            {northStar[key].goal && northStar[key].why && (
              <div style={{ marginTop:12, padding:'10px 14px',
                background: getDimColor(color),
                borderRadius:'var(--r)', border:'1px solid var(--border)', fontSize:13 }}>
                <strong style={{color}}>{northStar[key].goal}</strong>
                <span style={{color:'var(--text-muted)'}}> — {northStar[key].why}</span>
              </div>
            )}
          </Section>
        </Card>
      ))}

      <Card>
        <Section title="🚧 Kısıtlamalar" accent="var(--danger)">
          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>
            Asla feda etmeyeceğin şeyler — odağının sınırları
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {northStar.constraints.map((c,i) => (
              <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ color:'var(--danger)', fontSize:13, fontWeight:700, minWidth:20 }}>{i+1}.</span>
                <Input value={c} onChange={v=>setConstraint(i,v)}
                  placeholder={`Kısıtlama ${i+1}: asla feda etmeyeceğim şey...`} />
              </div>
            ))}
          </div>
          <Btn onClick={addConstraint} style={{ marginTop:12 }}>+ Kısıtlama Ekle</Btn>
        </Section>
      </Card>
    </div>
  );
}

// ============================================================
// HABIT RING COMPONENT
// ============================================================
function HabitRing({ habit, onToggle }) {
  return (
    <div onClick={onToggle} style={{ cursor:'pointer', display:'flex',
      flexDirection:'column', alignItems:'center', gap:8,
      padding:'12px 16px', background: habit.done ? `${habit.color}18` : 'var(--bg-input)',
      borderRadius:'var(--r-lg)', border:`1px solid ${habit.done ? habit.color+'44' : 'var(--border)'}`,
      transition:'all .2s', minWidth:100 }}>
      <Ring pct={habit.done ? 1 : 0} size={56} stroke={5} color={habit.color}>
        <span style={{ fontSize:18 }}>{habit.done ? '✓' : '○'}</span>
      </Ring>
      <span style={{ fontSize:12, fontWeight:600, color: habit.done ? habit.color : 'var(--text-soft)',
        textAlign:'center' }}>{habit.name}</span>
    </div>
  );
}

// ============================================================
// DEEP WORK TIMER
// ============================================================
function DeepWorkTimer({ state, setState, onXP }) {
  const PRESETS = [25, 50, 90];
  const [preset, setPreset] = useState(25);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(25*60);
  const [task, setTask] = useState('');
  const [focus, setFocus] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const presetRef = useRef(preset);
  const setStateRef = useRef(setState);
  const onXPRef = useRef(onXP);

  useEffect(() => { presetRef.current = preset; }, [preset]);
  useEffect(() => { setStateRef.current = setState; }, [setState]);
  useEffect(() => { onXPRef.current = onXP; }, [onXP]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          const p = presetRef.current;
          setStateRef.current(s => ({
            ...s,
            xp: s.xp + 50,
            daily: { ...s.daily,
              deepWork: { sessions: s.daily.deepWork.sessions+1,
                totalMinutes: s.daily.deepWork.totalMinutes+p }}
          }));
          onXPRef.current && onXPRef.current(50, '⏱ Deep Work tamamlandı!');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => { setDone(false); setRemaining(preset*60); setRunning(true); };
  const stop = () => { setRunning(false); clearInterval(intervalRef.current); };
  const reset = () => { stop(); setRemaining(preset*60); setDone(false); };
  const selectPreset = (p) => { if(!running){ setPreset(p); setRemaining(p*60); setDone(false); }};

  const mins = Math.floor(remaining/60).toString().padStart(2,'0');
  const secs = (remaining%60).toString().padStart(2,'0');
  const pct = 1 - remaining/(preset*60);

  if (focus) return (
    <div style={{ position:'fixed', inset:0, background:'var(--bg)',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:32, zIndex:9999 }}>
      {task && <p style={{ color:'var(--text-muted)', fontSize:15 }}>🎯 {task}</p>}
      <Ring pct={pct} size={220} stroke={12} color={running?'var(--accent)':'var(--border)'}>
        <span style={{ fontSize:48, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>
          {mins}:{secs}
        </span>
      </Ring>
      <div style={{ display:'flex', gap:12 }}>
        {running
          ? <Btn onClick={stop} variant="ghost">⏸ Duraklat</Btn>
          : <Btn onClick={start} variant="primary">▶ Başlat</Btn>}
        <Btn onClick={reset} variant="ghost">↺ Sıfırla</Btn>
        <Btn onClick={()=>setFocus(false)} variant="ghost">← Çık</Btn>
      </div>
      {done && (
        <div style={{ padding:'12px 24px', background:'var(--accent-dim)',
          borderRadius:'var(--r-lg)', border:'1px solid var(--border)',
          color:'var(--accent)', fontWeight:700 }}>
          🎉 Tebrikler! +50 XP kazandın
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <Section title="⏱ Deep Work Timer" accent="var(--accent)">
        {/* Presets */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {PRESETS.map(p => (
            <Btn key={p} onClick={()=>selectPreset(p)}
              variant={preset===p?'primary':'ghost'}
              style={{ flex:1 }}>{p} dk</Btn>
          ))}
        </div>
        {/* Task input */}
        <Input value={task} onChange={setTask}
          placeholder="Çalışacağın görev (opsiyonel)..."
          style={{ marginBottom:16 }} />
        {/* Ring + time */}
        <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:16 }}>
          <Ring pct={pct} size={90} stroke={7} color={running?'var(--accent)':'var(--border)'}>
            <span style={{ fontSize:18, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>
              {mins}:{secs}
            </span>
          </Ring>
          <div style={{ flex:1 }}>
            {done && (
              <p style={{ color:'var(--accent)', fontWeight:700, marginBottom:8 }}>
                🎉 +50 XP kazandın!
              </p>
            )}
            <p style={{ color:'var(--text-muted)', fontSize:12 }}>
              Bugün: {state.daily.deepWork.sessions} seans · {state.daily.deepWork.totalMinutes} dk
            </p>
          </div>
        </div>
        {/* Controls */}
        <div style={{ display:'flex', gap:8 }}>
          {running
            ? <Btn onClick={stop} variant="ghost">⏸ Duraklat</Btn>
            : <Btn onClick={start} variant="primary">▶ Başlat</Btn>}
          <Btn onClick={reset} variant="ghost">↺ Sıfırla</Btn>
          <Btn onClick={()=>setFocus(true)} variant="secondary">⛶ Tam Ekran</Btn>
        </div>
      </Section>
    </Card>
  );
}

// ============================================================
// DAY SCORE
// ============================================================
function DayScore({ state }) {
  const { daily } = state;
  const mDone = daily.morningStack.filter(m=>m.done).length;
  const mTotal = daily.morningStack.length;
  const hDone = daily.habits.filter(h=>h.done).length;
  const hTotal = daily.habits.length;
  const score = mTotal>0&&hTotal>0 ? Math.round((mDone/mTotal)*50+(hDone/hTotal)*50) : 0;
  const color = score>=80?'var(--accent)':score>=50?'var(--warn)':'var(--danger)';

  return (
    <Card style={{ display:'flex', alignItems:'center', gap:20 }}>
      <Ring pct={score/100} size={72} stroke={6} color={color}>
        <span style={{ fontSize:16, fontWeight:800, color }}>{score}</span>
      </Ring>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:18, fontWeight:700 }}>Günlük Skor</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
          Sabah ritueli: {mDone}/{mTotal} · Alışkanlıklar: {hDone}/{hTotal}
        </div>
        {daily.dayClosed && (
          <Badge color="var(--accent)" style={{marginTop:6}}>✓ Gün Kapatıldı</Badge>
        )}
      </div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:11, color:'var(--text-muted)' }}>XP</div>
        <div style={{ fontSize:20, fontWeight:800, color:'var(--accent)' }}>{state.xp}</div>
        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{state.streak} gün seri</div>
      </div>
    </Card>
  );
}

// ============================================================
// DAILY OS
// ============================================================
function DailyOS({ state, setState, onXP }) {
  const { daily } = state;

  const toggleMorning = (id) => {
    setState(s => ({
      ...s, daily:{ ...s.daily,
        morningStack: s.daily.morningStack.map(m=>m.id===id?{...m,done:!m.done}:m) }
    }));
  };

  const toggleHabit = (id) => {
    const habit = daily.habits.find(h=>h.id===id);
    const wasActive = habit?.done;
    setState(s => ({
      ...s,
      xp: wasActive ? s.xp-50 : s.xp+50,
      daily:{ ...s.daily,
        habits: s.daily.habits.map(h=>h.id===id?{...h,done:!h.done}:h) }
    }));
    if (!wasActive) onXP && onXP(50, `✅ ${habit?.name} tamamlandı!`);
  };

  const addHabit = () => {
    const name = prompt('Alışkanlık adı:');
    if (!name) return;
    const colors = ['#00d4aa','#7c3aed','#f59e0b','#ef4444','#22c55e','#3b82f6'];
    const color = colors[daily.habits.length % colors.length];
    const id = Date.now();
    setState(s => ({
      ...s, daily:{ ...s.daily,
        habits:[...s.daily.habits, { id, name, color, done:false }] }
    }));
  };

  const removeHabit = (id) => {
    setState(s => ({
      ...s, daily:{ ...s.daily,
        habits: s.daily.habits.filter(h=>h.id!==id) }
    }));
  };

  const addMorning = () => {
    const text = prompt('Sabah ritueli görevi:');
    if (!text) return;
    const id = Date.now();
    setState(s => ({
      ...s, daily:{ ...s.daily,
        morningStack:[...s.daily.morningStack, { id, text, done:false }] }
    }));
  };

  const closeDay = () => {
    if (daily.dayClosed) return;
    const mDone = daily.morningStack.filter(m=>m.done).length;
    const mTotal = daily.morningStack.length;
    const hDone = daily.habits.filter(h=>h.done).length;
    const hTotal = daily.habits.length;
    const allDone = mDone===mTotal && hDone===hTotal;
    const xpGain = allDone ? 150 : 50;
    const today = todayStr();
    const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
    const lastClose = state.lastCloseDate;
    const newStreak = (lastClose===yesterday || lastClose===today) ? state.streak+1 : 1;

    // Streak milestone
    let bonusXP = 0;
    if ([7,30,84,365].includes(newStreak)) {
      bonusXP = newStreak===7?50:newStreak===30?100:newStreak===84?150:200;
    }

    setState(s => ({
      ...s,
      xp: s.xp + xpGain + bonusXP,
      streak: newStreak,
      lastCloseDate: today,
      daily:{ ...s.daily, dayClosed:true },
    }));
    onXP && onXP(xpGain+bonusXP, allDone ? '🏆 Mükemmel gün! +'+xpGain+' XP' : '✅ Gün kapatıldı! +'+xpGain+' XP');
  };

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <DayScore state={state} />

      {/* Morning Stack */}
      <Card>
        <Section title="☀️ Morning Stack" accent="var(--warn)">
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {daily.morningStack.map(m => (
              <div key={m.id} onClick={()=>toggleMorning(m.id)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                  background: m.done?'var(--accent-dim)':'var(--bg-input)',
                  borderRadius:'var(--r)', border:`1px solid ${m.done?'var(--accent)44':'var(--border)'}`,
                  cursor:'pointer', transition:'all .15s' }}>
                <div style={{ width:20, height:20, borderRadius:'50%',
                  background: m.done?'var(--accent)':'transparent',
                  border:`2px solid ${m.done?'var(--accent)':'var(--text-muted)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, transition:'all .15s' }}>
                  {m.done && <span style={{ fontSize:11, color:'#0a0a0f', fontWeight:800 }}>✓</span>}
                </div>
                <span style={{ flex:1, color: m.done?'var(--text-muted)':'var(--text)',
                  textDecoration: m.done?'line-through':'none' }}>{m.text}</span>
              </div>
            ))}
          </div>
          <Btn onClick={addMorning} style={{ marginTop:12 }}>+ Görev Ekle</Btn>
        </Section>
      </Card>

      {/* Habit Tracker */}
      <Card>
        <Section title="🔥 Alışkanlık Takibi" accent="var(--a2)">
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {daily.habits.map(h => (
              <div key={h.id} style={{ position:'relative' }}>
                <HabitRing habit={h} onToggle={()=>toggleHabit(h.id)} />
                <button onClick={e=>{e.stopPropagation();removeHabit(h.id);}}
                  style={{ position:'absolute', top:-6, right:-6, width:18, height:18,
                    borderRadius:'50%', background:'var(--danger)', color:'#fff',
                    border:'none', fontSize:10, display:'flex', alignItems:'center',
                    justifyContent:'center', cursor:'pointer', opacity:.7 }}>×</button>
              </div>
            ))}
            <div onClick={addHabit} style={{ cursor:'pointer', display:'flex',
              flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:8, padding:'12px 16px', background:'var(--bg-input)',
              borderRadius:'var(--r-lg)', border:'1px dashed var(--border)',
              minWidth:100, color:'var(--text-muted)', fontSize:24 }}>+</div>
          </div>
        </Section>
      </Card>

      {/* Deep Work Timer */}
      <DeepWorkTimer state={state} setState={setState} onXP={onXP} />

      {/* Close Day */}
      <Card style={{ textAlign:'center', background: daily.dayClosed ? 'var(--accent-dim)' : 'var(--bg-card)' }}>
        {daily.dayClosed ? (
          <div>
            <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:17, fontWeight:700, color:'var(--accent)' }}>Gün Kapatıldı!</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
              Harika iş çıkardın. Yarın görüşürüz.
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:16 }}>
              Günü senkronize et, seriyi güncelle, XP kazan
            </div>
            <Btn onClick={closeDay} variant="primary"
              style={{ fontSize:15, padding:'12px 32px' }}>
              🌙 Günü Kapat
            </Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================
// MIND JOURNAL
// ============================================================
function MindJournal({ state, setState }) {
  const [tab, setTab] = useState('autopilot');
  const tabs = [
    { key:'autopilot', label:'🧠 Otopilot Kırıcı' },
    { key:'dump', label:'📝 Brain Dump' },
    { key:'review', label:'📊 Haftalık Review' },
  ];

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Tab bar */}
      <div style={{ display:'flex', gap:8 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ flex:1, padding:'10px 12px', borderRadius:'var(--r)',
              background: tab===t.key ? 'var(--a2)' : 'var(--bg-card)',
              color: tab===t.key ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${tab===t.key?'var(--a2)':'var(--border)'}`,
              fontWeight: tab===t.key ? 700 : 400, cursor:'pointer',
              fontSize:13, transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab==='autopilot' && <AutopilotBreaker state={state} setState={setState} />}
      {tab==='dump' && <BrainDump state={state} setState={setState} />}
      {tab==='review' && <WeeklyReview state={state} setState={setState} />}
    </div>
  );
}

function AutopilotBreaker({ state, setState }) {
  const dateKey = todayStr();
  const answers = state.journal.autopilot[dateKey]?.answers || Array(AUTOPILOT_QS.length).fill('');

  const setAnswer = useDebounce((i, val) => {
    setState(s => {
      const prev = s.journal.autopilot[dateKey]?.answers || Array(AUTOPILOT_QS.length).fill('');
      const next = [...prev]; next[i] = val;
      return { ...s, journal:{ ...s.journal,
        autopilot:{ ...s.journal.autopilot, [dateKey]:{ answers:next } }}};
    });
  }, 700);

  const [local, setLocal] = useState(answers);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Card style={{ background:'var(--a2-dim)', border:'1px solid var(--border)' }}>
        <p style={{ fontSize:13, color:'var(--text-soft)', lineHeight:1.7 }}>
          Bu 8 soru bilinçsiz düşünce kalıplarını yüzeye çıkarmak için tasarlandı.
          Her soruyu dürüstçe yanıtla — yargılama yok.
        </p>
      </Card>
      {AUTOPILOT_QS.map((q, i) => (
        <Card key={i}>
          <Label>Soru {i+1}/{AUTOPILOT_QS.length}</Label>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:12, lineHeight:1.6 }}>{q}</p>
          <Textarea value={local[i]} rows={3}
            placeholder="Cevabın..."
            onChange={v => {
              const n=[...local]; n[i]=v; setLocal(n);
              setAnswer(i, v);
            }} />
        </Card>
      ))}
    </div>
  );
}

function BrainDump({ state, setState }) {
  const [text, setText] = useState('');

  const save = () => {
    if (!text.trim()) return;
    const entry = { id:Date.now(), date:todayStr(), text:text.trim() };
    setState(s => ({
      ...s, journal:{ ...s.journal,
        brainDump:[entry, ...s.journal.brainDump] }
    }));
    setText('');
  };

  const remove = (id) => setState(s => ({
    ...s, journal:{ ...s.journal,
      brainDump: s.journal.brainDump.filter(e=>e.id!==id) }
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Card>
        <Section title="📝 Brain Dump" accent="var(--warn)">
          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
            Filtresiz, yargısız serbest yazma. Aklındaki her şeyi dök.
          </p>
          <Textarea value={text} onChange={setText} rows={6}
            placeholder="Aklında ne varsa buraya yaz — endişeler, fikirler, düşünceler..." />
          <Btn onClick={save} variant="primary" style={{ marginTop:12 }}>💾 Kaydet</Btn>
        </Section>
      </Card>
      {state.journal.brainDump.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Label>Geçmiş Kayıtlar</Label>
          {state.journal.brainDump.map(e => (
            <Card key={e.id}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{e.date}</span>
                <button onClick={()=>remove(e.id)}
                  style={{ background:'none', border:'none', color:'var(--danger)',
                    cursor:'pointer', fontSize:13 }}>🗑</button>
              </div>
              <p style={{ fontSize:13, lineHeight:1.7, color:'var(--text-soft)',
                whiteSpace:'pre-wrap' }}>{e.text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function WeeklyReview({ state, setState }) {
  const wk = getWeekKey();
  const review = state.journal.weeklyReview[wk] || { workedWell:'', didntWork:'', learned:'', nextFocus:'' };

  const set = useDebounce((field, val) => {
    setState(s => ({
      ...s, journal:{ ...s.journal,
        weeklyReview:{ ...s.journal.weeklyReview,
          [wk]:{ ...review, [field]:val }}}
    }));
  }, 700);

  const [local, setLocal] = useState(review);

  const fields = [
    { key:'workedWell', label:'✅ Ne işe yaradı?', ph:'Bu hafta iyi çalışan şeyler...' },
    { key:'didntWork', label:'❌ Ne işe yaramadı?', ph:'Değiştirilmesi gereken şeyler...' },
    { key:'learned', label:'💡 Ne öğrendim?', ph:'Bu haftanın dersleri...' },
    { key:'nextFocus', label:'🎯 Gelecek haftanın tek odağı', ph:'Gelecek hafta neye odaklanacağım?' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Card style={{ background:'var(--accent-dim)' }}>
        <div style={{ fontSize:12, color:'var(--text-muted)' }}>
          Hafta: <strong style={{color:'var(--accent)'}}>{wk}</strong>
        </div>
      </Card>
      {fields.map(({key,label,ph}) => (
        <Card key={key}>
          <Label>{label}</Label>
          <Textarea value={local[key]||''} rows={4} placeholder={ph}
            onChange={v => { setLocal(l=>({...l,[key]:v})); set(key,v); }} />
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// PROGRESS
// ============================================================
function Progress({ state }) {
  const [hovered, setHovered] = useState(null);
  const days = 84;
  const levelInfo = getLevelInfo(state.xp);

  // Build 84-day data
  const dayData = [];
  const now = new Date();
  for (let i=days-1; i>=0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate()-i);
    const key = d.toISOString().split('T')[0];
    const h = state.history[key] || null;
    dayData.push({ key, h, day:d.getDate(), month:d.getMonth() });
  }

  const getColor = (h) => {
    if (!h) return 'var(--border)';
    const s = h.score || 0;
    if (s>=90) return 'var(--accent)';
    if (s>=70) return '#00a888';
    if (s>=40) return '#006655';
    return '#003333';
  };

  const milestones = [
    { label:'Seviye 1', xp:500, done:state.xp>=500 },
    { label:'Seviye 5', xp:2500, done:state.xp>=2500 },
    { label:'Seviye 10', xp:5000, done:state.xp>=5000 },
    { label:'7 Gün Seri', streak:7, done:state.streak>=7 },
    { label:'30 Gün Seri', streak:30, done:state.streak>=30 },
    { label:'84 Gün Seri', streak:84, done:state.streak>=84 },
  ];

  // Weeks grid: 12 cols x 7 rows
  const weeks = [];
  for (let w=0; w<12; w++) {
    weeks.push(dayData.slice(w*7, w*7+7));
  }

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Level Ring */}
      <Card>
        <Section title="⚡ Seviye & XP" accent="var(--accent)">
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            <Ring pct={levelInfo.pct} size={100} stroke={8} color="var(--accent)">
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800 }}>{levelInfo.idx}</div>
              </div>
            </Ring>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--accent)' }}>
                {levelInfo.name}
              </div>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
                {levelInfo.current} / {XP_PER_LEVEL} XP
              </div>
              <div style={{ marginTop:10, height:6, background:'var(--border)',
                borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'var(--accent)',
                  width:`${levelInfo.pct*100}%`, transition:'width .5s ease',
                  borderRadius:3 }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between',
                marginTop:8, fontSize:11, color:'var(--text-muted)' }}>
                <span>Toplam XP: {state.xp}</span>
                <span>Seri: {state.streak} gün</span>
              </div>
            </div>
          </div>
          {/* Level progression */}
          <div style={{ marginTop:20, display:'flex', gap:6, flexWrap:'wrap' }}>
            {LEVELS.map((l,i) => (
              <div key={l} style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                background: i<=levelInfo.idx ? 'var(--accent-dim)' : 'var(--bg-input)',
                color: i<levelInfo.idx?'var(--accent)':i===levelInfo.idx?'var(--accent)':'var(--text-muted)',
                border:`1px solid ${i<=levelInfo.idx?'var(--accent)44':'var(--border)'}` }}>
                {l}
              </div>
            ))}
          </div>
        </Section>
      </Card>

      {/* 84-day calendar */}
      <Card>
        <Section title="📅 84 Günlük Aktivite" accent="var(--a2)">
          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', gap:3, overflowX:'auto', paddingBottom:4 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {week.map((d, di) => (
                    <div key={di}
                      onMouseEnter={e=>{
                        setHovered({...d, x:e.clientX, y:e.clientY});
                      }}
                      onMouseLeave={()=>setHovered(null)}
                      style={{ width:14, height:14, borderRadius:3,
                        background:getColor(d.h), cursor:'default',
                        transition:'transform .1s' }} />
                  ))}
                </div>
              ))}
            </div>
            {hovered && (
              <div style={{ position:'fixed', top:hovered.y-60, left:hovered.x+10,
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:'var(--r)', padding:'8px 12px', fontSize:12,
                zIndex:1000, pointerEvents:'none', boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
                <div style={{ fontWeight:700 }}>{hovered.key}</div>
                {hovered.h ? (
                  <>
                    <div style={{color:'var(--accent)'}}>Skor: {hovered.h.score}</div>
                    <div style={{color:'var(--text-muted)'}}>
                      {hovered.h.mDone}/{hovered.h.mTotal} sabah · {hovered.h.hDone}/{hovered.h.hTotal} alışkanlık
                    </div>
                  </>
                ) : <div style={{color:'var(--text-muted)'}}>Kayıt yok</div>}
              </div>
            )}
            <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:8,
              fontSize:11, color:'var(--text-muted)' }}>
              <span>Az</span>
              {['var(--border)','#003333','#006655','#00a888','var(--accent)'].map((c,i)=>(
                <div key={i} style={{ width:12, height:12, borderRadius:2, background:c }} />
              ))}
              <span>Çok</span>
            </div>
          </div>
        </Section>
      </Card>

      {/* Habit Rates */}
      <Card>
        <Section title="📊 Alışkanlık Oranları (84 gün)" accent="var(--warn)">
          {state.daily.habits.length === 0 ? (
            <p style={{color:'var(--text-muted)',fontSize:13}}>Henüz alışkanlık yok.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {state.daily.habits.map(h => {
                const total = dayData.filter(d=>d.h).length;
                const done = Object.values(state.history).filter(v => {
                  return v && v.hDone > 0;
                }).length;
                const pct = total>0 ? Math.round(done/total*100) : 0;
                return (
                  <div key={h.id}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      marginBottom:6, fontSize:13 }}>
                      <span style={{ fontWeight:600 }}>{h.name}</span>
                      <span style={{ color:h.color, fontWeight:700 }}>{pct}%</span>
                    </div>
                    <div style={{ height:8, background:'var(--border)', borderRadius:4 }}>
                      <div style={{ height:'100%', background:h.color,
                        width:`${pct}%`, borderRadius:4, transition:'width .5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </Card>

      {/* Milestones */}
      <Card>
        <Section title="🏆 Kilometre Taşları" accent="var(--danger)">
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {milestones.map((m,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                padding:'10px 14px', borderRadius:'var(--r)',
                background: m.done ? 'var(--accent-dim)' : 'var(--bg-input)',
                border:`1px solid ${m.done?'var(--accent)44':'var(--border)'}` }}>
                <div style={{ width:28, height:28, borderRadius:'50%',
                  background: m.done ? 'var(--accent)' : 'var(--border)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, flexShrink:0 }}>
                  {m.done ? '✓' : '○'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{m.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                    {m.xp ? `${m.xp} XP gerekli` : `${m.streak} gün seri gerekli`}
                  </div>
                </div>
                {m.done && <Badge color="var(--accent)">Tamamlandı</Badge>}
              </div>
            ))}
          </div>
        </Section>
      </Card>
    </div>
  );
}

// ============================================================
// XP TOAST
// ============================================================
function XPToast({ msg, onDone }) {
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position:'fixed', bottom:32, right:24,
      background:'var(--accent)', color:'#0a0a0f',
      padding:'12px 20px', borderRadius:'var(--r-lg)', fontWeight:700,
      fontSize:14, zIndex:9998, boxShadow:'0 8px 32px rgba(0,212,170,.3)',
      animation:'fadeIn .25s ease' }}>
      {msg}
    </div>
  );
}

// ============================================================
// TOP BAR
// ============================================================
function TopBar({ identity, xp, streak }) {
  const li = getLevelInfo(xp);
  return (
    <div style={{ position:'sticky', top:0, zIndex:100,
      background:'rgba(10,10,15,.85)', backdropFilter:'blur(12px)',
      borderBottom:'1px solid var(--border)', padding:'0 24px',
      display:'flex', alignItems:'center', gap:16, height:52 }}>
      <div style={{ fontSize:16, fontWeight:800, color:'var(--accent)',
        letterSpacing:'-0.02em', flexShrink:0 }}>THE OS</div>
      {identity?.statement && (
        <div style={{ flex:1, overflow:'hidden',
          textOverflow:'ellipsis', whiteSpace:'nowrap',
          fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}
          className="hide-mobile">
          "{identity.statement}"
        </div>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ fontSize:12, color:'var(--text-muted)' }}>
          <span style={{ color:'var(--accent)', fontWeight:700 }}>{li.name}</span>
          {' · '}{xp} XP
        </div>
        <div style={{ fontSize:12, color:'var(--text-muted)' }}>
          🔥 {streak}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BOTTOM NAV
// ============================================================
function BottomNav({ active, onSelect }) {
  const tabs = [
    { key:'identity', icon:'🪞', label:'Kimlik' },
    { key:'northstar', icon:'🎯', label:'Vizyon' },
    { key:'daily', icon:'⚡', label:'Daily OS' },
    { key:'journal', icon:'📓', label:'Journal' },
    { key:'progress', icon:'📈', label:'İlerleme' },
  ];
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100,
      background:'rgba(10,10,15,.95)', backdropFilter:'blur(12px)',
      borderTop:'1px solid var(--border)',
      display:'flex' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={()=>onSelect(t.key)}
          style={{ flex:1, padding:'10px 4px', border:'none', cursor:'pointer',
            background:'none', display:'flex', flexDirection:'column',
            alignItems:'center', gap:3, transition:'all .15s' }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:10, fontWeight: active===t.key?700:400,
            color: active===t.key ? 'var(--accent)' : 'var(--text-muted)' }}>
            {t.label}
          </span>
          {active===t.key && (
            <div style={{ position:'absolute', bottom:0, width:32, height:2,
              background:'var(--accent)', borderRadius:2 }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// APP
// ============================================================
export default function App() {
  injectStyles();
  const [state, setStateRaw] = useState(loadState);
  const [tab, setTab] = useState('daily');
  const [toast, setToast] = useState(null);

  const save = useDebounce((s) => store.set('the-os-v1', s), 700);

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater==='function' ? updater(prev) : updater;
      save(next);
      return next;
    });
  }, [save]);

  const onXP = (amount, msg) => {
    setToast({ msg, id: Date.now() });
  };

  const TABS = {
    identity: <IdentityCore state={state} setState={setState} />,
    northstar: <NorthStar state={state} setState={setState} />,
    daily: <DailyOS state={state} setState={setState} onXP={onXP} />,
    journal: <MindJournal state={state} setState={setState} />,
    progress: <Progress state={state} />,
  };

  const TAB_TITLES = {
    identity: 'Kimlik Çekirdeği',
    northstar: 'North Star',
    daily: 'Daily OS',
    journal: 'Mind Journal',
    progress: 'İlerleme',
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <TopBar identity={state.identity} xp={state.xp} streak={state.streak} />
      <div style={{ flex:1, overflowY:'auto', paddingBottom:80 }}>
        <div style={{ maxWidth:720, margin:'0 auto', padding:'20px 16px' }}>
          <div style={{ marginBottom:20, display:'flex', alignItems:'center',
            justifyContent:'space-between' }}>
            <h1 style={{ fontSize:22, fontWeight:800 }}>{TAB_TITLES[tab]}</h1>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>{todayStr()}</span>
          </div>
          {TABS[tab]}
        </div>
      </div>
      <BottomNav active={tab} onSelect={setTab} />
      {toast && (
        <XPToast key={toast.id} msg={toast.msg} onDone={()=>setToast(null)} />
      )}
    </div>
  );
}
