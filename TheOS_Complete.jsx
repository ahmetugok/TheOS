// ═══════════════════════════════════════════════════════
//  THE OS — Birleşik Uygulama
//  Dan Koe felsefesiyle kişisel işletim sistemi
//  Faz 1 (Identity) + 2 (Daily) + 3 (Journal) + 4 (Progress)
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { store, signOut } from "./src/lib/supabase";

/* ─────────────────────────── GLOBAL STYLES ─────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#080809;--s1:#0f0f11;--s2:#161618;--s3:#1c1c1f;
      --b:rgba(255,255,255,0.07);--bh:rgba(255,255,255,0.13);
      --tx:#e8e3da;--txd:#706b65;--txm:#a09890;
      --gold:#c9a84c;--gold-s:rgba(201,168,76,0.07);--gold-m:rgba(201,168,76,0.16);
      --red:#b83232;--red-s:rgba(184,50,50,0.07);
      --blue:#3d8fd4;--blue-s:rgba(61,143,212,0.07);
      --green:#3a9469;--green-s:rgba(58,148,105,0.07);
      --violet:#7c5cbf;--violet-s:rgba(124,92,191,0.07);
      --amber:#c8964a;--amber-s:rgba(200,150,74,0.07);--amber-m:rgba(200,150,74,0.15);
      --rose:#b85c6e;--rose-s:rgba(184,92,110,0.07);
      --sage:#6a9e7a;--sage-s:rgba(106,158,122,0.07);
      --slate:#7a8fa8;--slate-s:rgba(122,143,168,0.07);
      --fd:'Cormorant Garamond',serif;
      --fb:'DM Sans',sans-serif;
      --fm:'DM Mono',monospace;
      --nav:56px;
      --zinc-900:#0f0f11;--zinc-800:#161618;--zinc-700:rgba(255,255,255,0.10);
      --zinc-600:#706b65;--zinc-500:#8a857f;--zinc-400:#a09890;
      --zinc-300:#bab4ac;--zinc-200:#e8e3da;
      --nav-bg:rgba(8,8,9,.94);--overlay-bg:rgba(4,4,5,.7);
    }
    html[data-theme="light"]{
      --bg:#f5f2ec;--s1:#ede9e0;--s2:#e6e0d4;--s3:#ddd7c8;
      --b:rgba(0,0,0,0.09);--bh:rgba(0,0,0,0.16);
      --tx:#1a1814;--txd:#9a9080;--txm:#706b65;
      --gold:#9a7428;--gold-s:rgba(154,116,40,0.10);--gold-m:rgba(154,116,40,0.22);
      --red:#b83232;--red-s:rgba(184,50,50,0.08);
      --blue:#2a7fc4;--blue-s:rgba(42,127,196,0.10);
      --green:#2e8059;--green-s:rgba(46,128,89,0.10);
      --violet:#6a4cb0;--violet-s:rgba(106,76,176,0.10);
      --amber:#b87c30;--amber-s:rgba(184,124,48,0.10);--amber-m:rgba(184,124,48,0.20);
      --rose:#a84858;--rose-s:rgba(168,72,88,0.10);
      --sage:#4e8a5e;--sage-s:rgba(78,138,94,0.10);
      --slate:#5a7a98;--slate-s:rgba(90,122,152,0.10);
      --zinc-900:#ede9e0;--zinc-800:#e6e0d4;--zinc-700:rgba(0,0,0,0.09);
      --zinc-600:#9a9080;--zinc-500:#706b65;--zinc-400:#4a4540;
      --zinc-300:#2a2520;--zinc-200:#1a1814;
      --nav-bg:rgba(245,242,236,.94);--overlay-bg:rgba(200,195,185,.7);
    }
    body{background:var(--bg);color:var(--tx);font-family:var(--fb);-webkit-text-size-adjust:100%;}
    input,textarea{font-family:var(--fb);background:transparent;border:none;outline:none;color:var(--tx);resize:none;font-size:16px;line-height:1.7;}
    input::placeholder,textarea::placeholder{color:var(--txd);}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:var(--bh);border-radius:2px;}

    @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fi{from{opacity:0}to{opacity:1}}
    @keyframes bgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.18)}100%{transform:scale(1)}}
    @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes ink{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}
    @keyframes swap{0%{opacity:1;transform:translateY(0)}40%{opacity:0;transform:translateY(-6px)}60%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}

    .fu{animation:fu .45s ease both}
    .fu1{animation:fu .45s .07s ease both}
    .fu2{animation:fu .45s .14s ease both}
    .fu3{animation:fu .45s .21s ease both}
    .fu4{animation:fu .45s .28s ease both}
    .fi{animation:fi .35s ease both}
    .bgrow{transform-origin:left;animation:bgrow .9s cubic-bezier(.4,0,.2,1) both}
    .ink{display:block;height:1px;background:var(--amber);transform-origin:left;animation:ink .5s ease both}

    .gold-text{
      background:linear-gradient(90deg,var(--gold) 0%,#e8cc7a 40%,var(--gold) 60%,#c89a30 100%);
      background-size:200% auto;
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      animation:shimmer 3s linear infinite;
    }

    /* ── Mobile nav ── */
    .mob-menu{display:none;}
    .mob-overlay{display:none;}
    @media(max-width:700px){
      .desk-nav{display:none!important;}
      .mob-menu{display:flex;}
      .mob-overlay{display:block;position:fixed;inset:0;z-index:90;background:var(--overlay-bg);backdrop-filter:blur(6px);}
      .mob-nav-panel{
        position:fixed;top:0;right:0;bottom:0;width:240px;z-index:91;
        background:var(--s1);border-left:1px solid var(--bh);
        display:flex;flex-direction:column;padding:16px 0;
      }
      /* Stack grids to single column on mobile */
      .grid-2col{grid-template-columns:1fr!important;}
      .daily-grid{grid-template-columns:1fr!important;}
      .right-sticky{position:static!important;}
      .progress-hero{flex-direction:column!important;gap:20px!important;}
      .log-summary-grid{grid-template-columns:repeat(2,1fr)!important;}
      .main-pad{padding:20px 14px 100px!important;}
      .header-pad{padding:0 14px!important;}
      /* Bottom tab bar on mobile */
      .mob-tabbar{
        display:flex!important;
        position:fixed;bottom:0;left:0;right:0;z-index:80;
        background:var(--nav-bg);border-top:1px solid var(--b);
        backdrop-filter:blur(12px);
        padding:6px 0 max(6px,env(safe-area-inset-bottom));
      }
    }
    @media(min-width:701px){
      .mob-tabbar{display:none!important;}
    }
    /* Timer circle — fluid size using CSS */
    .timer-wrap-normal{width:min(180px,42vw);height:min(180px,42vw);}
    .timer-wrap-focus{width:min(260px,72vw);height:min(260px,72vw);}
  `}</style>
);


/* ─────────────────────────── HELPERS ─────────────────────────── */
const todayKey = () => new Date().toISOString().slice(0, 10);
const weekKey  = () => {
  const d = new Date(), j = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-W${String(Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7)).padStart(2, "0")}`;
};
const lastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};
const fmtDate = (iso) => new Date(iso).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
const wc = (t) => t?.trim() ? t.trim().split(/\s+/).length : 0;
const levelFromXp = (xp) => Math.floor(xp / 500) + 1;
const LEVEL_TITLES = ["","Başlangıç","Uyanış","Odaklanma","Momentum","Disiplin","Akış","Üretken","Derinlik","Vizyon","Özgürlük"];
const lvlTitle = (lvl) => LEVEL_TITLES[Math.min(lvl, LEVEL_TITLES.length - 1)] || `Seviye ${lvl}`;

/* ─────────────────────────── ATOM COMPONENTS ─────────────────────────── */
const Tag = ({ children, color = "gold" }) => {
  const map = {
    gold:  ["var(--gold-s)",  "var(--gold)",  "rgba(201,168,76,.18)"],
    red:   ["var(--red-s)",   "var(--red)",   "rgba(184,50,50,.18)"],
    blue:  ["var(--blue-s)",  "var(--blue)",  "rgba(61,143,212,.18)"],
    green: ["var(--green-s)", "var(--green)", "rgba(58,148,105,.18)"],
    violet:["var(--violet-s)","var(--violet)","rgba(124,92,191,.18)"],
    amber: ["var(--amber-s)", "var(--amber)", "rgba(200,150,74,.18)"],
    rose:  ["var(--rose-s)",  "var(--rose)",  "rgba(184,92,110,.18)"],
  };
  const [bg, fg, border] = map[color] || map.gold;
  return <span style={{ display:"inline-flex", alignItems:"center", fontSize:10, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", background:bg, color:fg, border:`1px solid ${border}`, padding:"3px 9px", borderRadius:3 }}>{children}</span>;
};

const FieldLabel = ({ children, color = "var(--txm)" }) => (
  <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color, fontFamily:"var(--fm)", marginBottom:10 }}>{children}</p>
);

const Card = ({ children, accent, style = {} }) => {
  const accents = {
    gold:  ["rgba(201,168,76,.22)", "rgba(201,168,76,.03)"],
    red:   ["rgba(184,50,50,.22)",  "rgba(184,50,50,.03)"],
    blue:  ["rgba(61,143,212,.22)", "rgba(61,143,212,.03)"],
    green: ["rgba(58,148,105,.22)", "rgba(58,148,105,.03)"],
    violet:["rgba(124,92,191,.22)", "rgba(124,92,191,.03)"],
    amber: ["rgba(200,150,74,.22)", "rgba(200,150,74,.03)"],
    rose:  ["rgba(184,92,110,.22)", "rgba(184,92,110,.03)"],
  };
  const [border, glow] = accents[accent] || ["var(--b)", "transparent"];
  return <div style={{ background:`linear-gradient(135deg,var(--s1) 0%,${glow} 100%)`, border:`1px solid ${border}`, borderRadius:16, padding:"22px 26px", ...style }}>{children}</div>;
};

const Divider = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 0" }}>
    <div style={{ flex:1, height:1, background:"var(--b)" }} />
    {label && <span style={{ fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--txd)", fontFamily:"var(--fm)" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:"var(--b)" }} />
  </div>
);

const SectionHead = ({ tag, tagColor, title }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
    <Tag color={tagColor}>{tag}</Tag>
    {title && <span style={{ fontSize:12, color:"var(--txm)", fontFamily:"var(--fm)" }}>{title}</span>}
    <div style={{ flex:1, height:1, background:"var(--b)" }} />
  </div>
);

const SaveDot = ({ saved }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6, opacity:.55 }}>
    <div style={{ width:5, height:5, borderRadius:"50%", background:saved?"var(--green)":"var(--amber)", transition:"background .3s", animation:saved?"none":"pulse 1.2s infinite" }} />
    <span style={{ fontSize:10, color:"var(--txd)", fontFamily:"var(--fm)" }}>{saved?"kaydedildi":"kaydediliyor"}</span>
  </div>
);

/* ─────────────────────────── DEFAULTS ─────────────────────────── */
const DEF_IDENTITY = { statement:"", antiVision:"", idealVision:"", ikigai:{ love:"", good:"", world:"", paid:"" } };
const DEF_NORTHSTAR = { yearly:{goal:"",why:""}, monthly:{goal:"",why:""}, weekly:{goal:"",why:""}, constraints:"" };
const DEF_MORNING = [
  {id:1,text:"Su iç (500ml)"}, {id:2,text:"5 dk meditasyon / nefes"},
  {id:3,text:"Günün tek odağını yaz"}, {id:4,text:"Telefona bakmadan ilk 30 dk"},
];
const DEF_HABITS = [
  {id:1,text:"Derin odak çalışması", color:"var(--gold)"},
  {id:2,text:"Fiziksel antrenman",   color:"var(--blue)"},
  {id:3,text:"Stratejik okuma",      color:"var(--green)"},
  {id:4,text:"İçerik üretimi",       color:"var(--amber)"},
];
const AUTOPILOT_QS = [
  {id:1,q:"Şu an yaptığın şeyle aslında neyden kaçıyorsun?",              hint:"Dikkat dağıtma genellikle bir kaçıştır. O şey ne?",         color:"var(--rose)",   bg:"var(--rose-s)"},
  {id:2,q:"Son iki saatini filmlesen, hayattan ne istediğini ne derdi?",   hint:"Dışarıdan bir gözle bak. Davranışların ne anlatıyor?",      color:"var(--amber)",  bg:"var(--amber-s)"},
  {id:3,q:"Nefret ettiğin hayata mı gidiyorsun, istediğin hayata mı?",    hint:"Bugünkü eylemler hangi yönü gösteriyor?",                   color:"var(--sage)",   bg:"var(--sage-s)"},
  {id:4,q:"Bugün neyi gerçek arzudan değil kimlik korumak için yaptın?",  hint:"Ego'nun seni yönlendirdiği an hangisiydi?",                 color:"var(--slate)",  bg:"var(--slate-s)"},
  {id:5,q:"Hayatının neresinde canlılığı güvenliğe takas ediyorsun?",     hint:"Konfor alanın seni nerede küçültüyor?",                     color:"var(--gold)",   bg:"var(--gold-s)"},
  {id:6,q:"Beş yıl sonraki sen bugünkü kararlarına bakınca ne hisseder?", hint:"Pişmanlık perspektifi — en net ayna.",                      color:"var(--violet)", bg:"var(--violet-s)"},
  {id:7,q:"Şu an en çok neyi erteliyorsun ve gerçek sebebi ne?",          hint:"Meşguliyetin ardına gizlenen korku ne?",                    color:"var(--blue)",   bg:"var(--blue-s)"},
  {id:8,q:"Başkalarının onayına ihtiyaç duymadan neyi yapardın?",         hint:"Yargılanma korkusu olmasa ne değişirdi?",                   color:"var(--rose)",   bg:"var(--rose-s)"},
];
const WEEKLY_PROMPTS = [
  {key:"worked",    label:"Ne İşe Yaradı?",             hint:"Bu hafta tekrarlamaya değer sistem ya da karar.",       color:"var(--sage)"},
  {key:"didnt",     label:"Ne İşe Yaramadı?",           hint:"Ne seni yavaşlattı veya boşa harcandı?",               color:"var(--rose)"},
  {key:"learned",   label:"Ne Öğrendim?",               hint:"Bir içgörü, bir şaşırma, bir gerçek fark etme.",        color:"var(--amber)"},
  {key:"nextfocus", label:"Gelecek Haftanın Tek Odağı", hint:"Tek şey. En önemliyi yaz.",                            color:"var(--slate)"},
];
const PRESETS = [{label:"25 dk",sec:25*60},{label:"50 dk",sec:50*60},{label:"90 dk",sec:90*60}];

// ════════════════════════════════════════════════════════
//  TAB 1 — IDENTITY CORE
// ════════════════════════════════════════════════════════
function IdentityCore({ data, onChange }) {
  const up = (f, v) => onChange({ ...data, [f]: v });
  const upI = (k, v) => onChange({ ...data, ikigai: { ...data.ikigai, [k]: v } });
  const ikigaiFields = [
    {key:"love", label:"Ne yapmayı seviyorsun?",       color:"var(--gold)",   accent:"gold"},
    {key:"good", label:"Neyde gerçekten iyisin?",      color:"var(--blue)",   accent:"blue"},
    {key:"world",label:"Dünyanın neye ihtiyacı var?",  color:"var(--green)",  accent:"green"},
    {key:"paid", label:"Bunun için ödeme yapılıyor mu?",color:"var(--red)",   accent:"red"},
  ];
  const ikigaiFilled = Object.values(data.ikigai).filter(Boolean).length;
  return (
    <div style={{maxWidth:740,margin:"0 auto"}}>
      {/* Identity */}
      <div className="fu" style={{marginBottom:36}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <Tag color="gold">Kimlik İfadesi</Tag>
          <div style={{flex:1,height:1,background:"var(--b)"}}/>
        </div>
        <Card accent="gold">
          <p style={{fontFamily:"var(--fd)",fontSize:12,fontStyle:"italic",color:"var(--gold)",letterSpacing:"0.06em",marginBottom:12}}>"Ben … tipinde biriyim."</p>
          <textarea value={data.statement} onChange={e=>up("statement",e.target.value)}
            placeholder="Zorluklardan kaçmayan, her gün vizyonuma doğru istikrarlı adımlar atan biriyim."
            rows={2} style={{fontFamily:"var(--fd)",fontSize:21,fontWeight:300,fontStyle:"italic",lineHeight:1.5,width:"100%"}}/>
          <p style={{fontSize:11,color:"var(--txd)",marginTop:10,lineHeight:1.6}}>Kimlik önce yazılır — davranışlar onu takip eder.</p>
        </Card>
      </div>

      {/* Vision axes */}
      <div className="fu1" style={{marginBottom:36}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <Tag color="blue">Vizyon Eksenleri</Tag>
          <div style={{flex:1,height:1,background:"var(--b)"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card accent="red">
            <FieldLabel color="var(--red)">Anti-Vizyon — Kaçtığın Hayat</FieldLabel>
            <textarea value={data.antiVision} onChange={e=>up("antiVision",e.target.value)}
              placeholder="Başkalarının hayallerini inşa eden, akşamları yorgunluktan ekrana bakan biri..."
              rows={5} style={{fontSize:14,lineHeight:1.75,width:"100%"}}/>
          </Card>
          <Card accent="blue">
            <FieldLabel color="var(--blue)">İdeal Vizyon — Kazandığın Hayat</FieldLabel>
            <textarea value={data.idealVision} onChange={e=>up("idealVision",e.target.value)}
              placeholder="Kendi zamanını kontrol eden, özgürce üreten, zihinsel zirvede olan..."
              rows={5} style={{fontSize:14,lineHeight:1.75,width:"100%"}}/>
          </Card>
        </div>
      </div>

      {/* Ikigai */}
      <div className="fu2">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <Tag color="green">Ikigai Kesişimi</Tag>
          <div style={{flex:1,height:1,background:"var(--b)"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {ikigaiFields.map(f=>(
            <Card key={f.key} accent={f.accent}>
              <FieldLabel color={f.color}>{f.label}</FieldLabel>
              <textarea value={data.ikigai[f.key]} onChange={e=>upI(f.key,e.target.value)}
                rows={3} style={{fontSize:14,lineHeight:1.75,width:"100%"}}/>
            </Card>
          ))}
        </div>
        {ikigaiFilled >= 3 && (
          <Card accent="gold">
            <FieldLabel color="var(--gold)">Kesişim Noktası</FieldLabel>
            <p style={{fontFamily:"var(--fd)",fontSize:17,fontStyle:"italic",color:"var(--tx)",lineHeight:1.7}}>
              {Object.values(data.ikigai).filter(Boolean).join(" · ")}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  TAB 2 — NORTH STAR
// ════════════════════════════════════════════════════════
function NorthStar({ data, onChange }) {
  const up = (lvl, f, v) => onChange({ ...data, [lvl]: { ...data[lvl], [f]: v } });
  const horizons = [
    {key:"yearly",  label:"1 Yıllık Ana Görev",    sub:"Yılın sonunda 'kazandım' diyeceğin şey?", accent:"gold",  color:"var(--gold)",  icon:"◈"},
    {key:"monthly", label:"Boss Savaşı — Bu Ay",   sub:"Yıllık hedefin kilidini açacak tek proje",accent:"blue",  color:"var(--blue)",  icon:"◉"},
    {key:"weekly",  label:"Bu Haftanın Tek Odağı", sub:"Aylık projeye en çok katkı sağlayacak eylem",accent:"green",color:"var(--green)",icon:"◎"},
  ];
  return (
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {horizons.map((h,i)=>(
          <div key={h.key} className={`fu${i}`}>
            <Card accent={h.accent}>
              <div style={{display:"flex",gap:18,alignItems:"flex-start"}}>
                <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${h.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:h.color}}>
                  {h.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <Tag color={h.accent}>{h.label}</Tag>
                  </div>
                  <p style={{fontSize:12,color:"var(--txd)",marginBottom:12,lineHeight:1.6}}>{h.sub}</p>
                  <input type="text" value={data[h.key].goal} onChange={e=>up(h.key,"goal",e.target.value)}
                    placeholder="Hedef..."
                    style={{fontFamily:"var(--fd)",fontSize:19,fontWeight:400,lineHeight:1.4,color:"var(--tx)",width:"100%",padding:"4px 0",borderBottom:"1px solid var(--b)",marginBottom:12,display:"block"}}/>
                  <FieldLabel>Neden bu hedef?</FieldLabel>
                  <textarea value={data[h.key].why} onChange={e=>up(h.key,"why",e.target.value)}
                    placeholder="Gerçek motivasyon..." rows={2} style={{fontSize:14,lineHeight:1.75,width:"100%"}}/>
                </div>
              </div>
            </Card>
            {i<2&&<div style={{display:"flex",justifyContent:"center",padding:"2px 0"}}><div style={{width:1,height:16,background:"var(--b)"}}/></div>}
          </div>
        ))}
      </div>
      <div className="fu3" style={{marginTop:24}}>
        <Divider label="Oyun Kuralları"/>
        <Card style={{marginTop:16}}>
          <FieldLabel>Kısıtlamalar — Asla Feda Etmeyeceklerin</FieldLabel>
          <textarea value={data.constraints} onChange={e=>onChange({...data,constraints:e.target.value})}
            placeholder="Uyku düzenim, ailem, fiziksel antrenmanım..." rows={3} style={{fontSize:14,lineHeight:1.75,width:"100%"}}/>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  TAB 3 — DAILY OS
// ════════════════════════════════════════════════════════

/* Morning Stack */
function MorningStack({ items, done, onToggle }) {
  const completed = items.filter(i=>done[i.id]).length;
  const pct = items.length ? Math.round(completed/items.length*100) : 0;
  return (
    <div style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:16,padding:"22px"}}>
      <SectionHead tag="Sabah Ritüeli" tagColor="amber"/>
      <div style={{height:2,background:"var(--b)",borderRadius:1,marginBottom:16,overflow:"hidden"}}>
        <div style={{height:"100%",background:"var(--amber)",width:`${pct}%`,transition:"width .5s ease",borderRadius:1}}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {items.map(item=>{
          const d = !!done[item.id];
          return (
            <div key={item.id} onClick={()=>onToggle(item.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,cursor:"pointer",background:d?"rgba(200,150,74,.05)":"var(--s2)",border:`1px solid ${d?"rgba(200,150,74,.15)":"var(--b)"}`,transition:"all .2s"}}>
              <div style={{width:17,height:17,borderRadius:4,flexShrink:0,border:`1.5px solid ${d?"var(--amber)":"var(--txd)"}`,background:d?"var(--amber)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                {d&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6 8 1" stroke="#080809" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{fontSize:13,flex:1,color:d?"var(--txm)":"var(--tx)",textDecoration:d?"line-through":"none",textDecorationColor:"var(--txd)"}}>{item.text}</span>
            </div>
          );
        })}
      </div>
      <p style={{fontFamily:"var(--fm)",fontSize:10,color:pct===100?"var(--amber)":"var(--txd)",marginTop:12,textAlign:"right"}}>{completed}/{items.length}</p>
    </div>
  );
}

/* Habit Tracker */
function HabitTracker({ habits, done, onToggle }) {
  const completed = habits.filter(h=>done[h.id]).length;
  return (
    <div style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:16,padding:"22px"}}>
      <SectionHead tag="Alışkanlıklar" tagColor="green"/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {habits.map(h=>{
          const d = !!done[h.id];
          return (
            <div key={h.id} onClick={()=>onToggle(h.id)}
              style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,cursor:"pointer",background:d?`${h.color}08`:"var(--s2)",border:`1px solid ${d?`${h.color}22`:"var(--b)"}`,transition:"all .25s"}}>
              {/* Ring */}
              <svg width="36" height="36" style={{transform:"rotate(-90deg)",flexShrink:0}}>
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--bh)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={h.color} strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={94.25} strokeDashoffset={d?0:94.25}
                  style={{transition:"stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)",opacity:d?1:.2}}/>
              </svg>
              <span style={{fontSize:14,flex:1,fontWeight:500,color:d?"var(--txm)":"var(--tx)",textDecoration:d?"line-through":"none"}}>{h.text}</span>
              <div style={{width:7,height:7,borderRadius:"50%",background:d?h.color:"var(--bh)",transition:"background .3s"}}/>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--b)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:"var(--txm)"}}>Bugünkü skor</span>
        <span style={{fontFamily:"var(--fm)",fontSize:20,color:completed===habits.length?"var(--gold)":"var(--txm)"}}>{completed}<span style={{fontSize:12,color:"var(--txd)"}}>/{habits.length}</span></span>
      </div>
    </div>
  );
}

/* Deep Work Timer */
function DeepWorkTimer({ onSession, xp, setXp, sessions, setSessions }) {
  const [preset, setPreset]       = useState(PRESETS[0]);
  const [secs, setSecs]           = useState(PRESETS[0].sec);
  const [running, setRunning]     = useState(false);
  const [project, setProject]     = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [toast, setToast]         = useState(null);
  const iRef    = useRef(null);
  const totalRef = useRef(PRESETS[0].sec);

  const progress = 1 - secs / totalRef.current;
  const NORM_S = 200; const FOCUS_S = 300;
  const SIZE = focusMode ? FOCUS_S : NORM_S;
  const R = (SIZE - 8) / 2;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - progress);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2500); };
  const enterFocus = () => { if(!running) start(); setFocusMode(true); };
  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setSecs(preset.sec); totalRef.current = preset.sec; };
  const pick  = (p) => { setRunning(false); setPreset(p); setSecs(p.sec); totalRef.current = p.sec; };

  useEffect(()=>{
    if(running){
      iRef.current = setInterval(()=>{
        setSecs(s=>{
          if(s<=1){
            clearInterval(iRef.current); setRunning(false);
            const gained = 50;
            setXp(x=>x+gained);
            setSessions(n=>n+1);
            onSession?.();
            setFocusMode(false);
            showToast(`✓ Seans tamamlandı! +${gained} XP`);
            return totalRef.current;
          }
          return s-1;
        });
      },1000);
    } else clearInterval(iRef.current);
    return ()=>clearInterval(iRef.current);
  },[running]);

  const mins = String(Math.floor(secs/60)).padStart(2,"0");
  const sec2 = String(secs%60).padStart(2,"0");

  // Timer ring — tıklanınca focus moduna girer, viewBox ile zoom-safe
  // Timer boyutlarını JS ile hesapla (CSS min() yerine — daha güvenilir)
  const timerSizePx = focusMode
    ? Math.min(300, Math.floor(window.innerWidth * 0.72))
    : Math.min(200, Math.floor(window.innerWidth * 0.46));

  const timerCore = (
    <div
      onClick={focusMode ? undefined : enterFocus}
      title={focusMode ? undefined : "Odak moduna gir"}
      style={{
        position:"relative",
        width:timerSizePx,
        height:timerSizePx,
        cursor: focusMode ? "default" : "pointer",
        flexShrink:0,
      }}
    >
      <svg width={timerSizePx} height={timerSizePx} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{transform:"rotate(-90deg)",display:"block"}}>
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="var(--s3)" strokeWidth={focusMode?5:3}/>
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={running?"var(--gold)":"var(--bh)"}
          strokeWidth={focusMode?5:3} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/>
      </svg>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"var(--fm)",fontSize:focusMode?`${Math.round(timerSizePx*0.2)}px`:`${Math.round(timerSizePx*0.17)}px`,fontWeight:300,letterSpacing:"0.04em",color:running?"var(--tx)":"var(--txm)"}}>{mins}:{sec2}</span>
        <span style={{fontSize:focusMode?13:10,color:"var(--txd)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:3}}>
          {focusMode ? (running?"odakta":"başlamak için bas") : (running?"odakta":"tıkla → odak")}
        </span>
      </div>
    </div>
  );

  // ── FOCUS (tam ekran) modu ── Portal ile document.body'e render et
  // (parent'ta transform olursa position:fixed bozulur — portal bunu çözer)
  const focusOverlay = focusMode ? createPortal(
    <div style={{
      position:"fixed",top:0,left:0,
      width:"100vw",height:"100vh",
      zIndex:99999,
      background:"#030304",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      animation:"fi .3s ease",
    }}>
      {toast&&<div style={{position:"absolute",top:32,left:"50%",transform:"translateX(-50%)",background:"var(--s2)",border:"1px solid var(--gold-m)",color:"var(--gold)",padding:"8px 24px",borderRadius:20,fontFamily:"var(--fm)",fontSize:13,whiteSpace:"nowrap"}}>{toast}</div>}
      <p style={{fontFamily:"var(--fd)",fontSize:18,fontStyle:"italic",color:"var(--txm)",letterSpacing:"0.06em",marginBottom:40,textAlign:"center",padding:"0 20px"}}>{project||"Derin Odak"}</p>
      {timerCore}
      <div style={{marginTop:40,display:"flex",gap:16}}>
        <button onClick={running?pause:start} style={{fontFamily:"var(--fb)",fontSize:15,fontWeight:600,padding:"13px 44px",borderRadius:10,border:"none",cursor:"pointer",background:"var(--gold)",color:"#030304",letterSpacing:"0.02em"}}>{running?"⏸ Duraklat":"▶ Başlat"}</button>
        <button onClick={()=>{reset();setFocusMode(false);}} style={{fontFamily:"var(--fb)",fontSize:15,padding:"13px 28px",borderRadius:10,border:"1px solid var(--bh)",cursor:"pointer",background:"transparent",color:"var(--txm)"}}>Çık</button>
      </div>
      {sessions>0&&<p style={{marginTop:32,fontFamily:"var(--fm)",fontSize:12,color:"var(--txd)",letterSpacing:"0.08em"}}>{sessions} seans tamamlandı</p>}
    </div>,
    document.body
  ) : null;

  if(focusMode) return focusOverlay;

  // ── Normal kart modu ──
  return (
    <div style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:16,padding:"22px"}}>
      {toast&&<div style={{marginBottom:12,background:"var(--gold-s)",border:"1px solid var(--gold-m)",color:"var(--gold)",padding:"8px 14px",borderRadius:8,fontFamily:"var(--fm)",fontSize:12,textAlign:"center"}}>{toast}</div>}
      <SectionHead tag="Derin Odak" tagColor="violet"/>
      <div style={{marginBottom:16,padding:"10px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--b)"}}>
        <p style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--txm)",fontFamily:"var(--fm)",marginBottom:6}}>Aktif Görev</p>
        <input value={project} onChange={e=>setProject(e.target.value)} placeholder="Ne üzerinde çalışıyorsun?" style={{fontSize:14,width:"100%"}}/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {PRESETS.map(p=>(
          <button key={p.label} onClick={()=>pick(p)} style={{flex:1,padding:"8px 0",borderRadius:8,border:`1px solid ${preset.label===p.label?"var(--gold)":"var(--b)"}`,background:preset.label===p.label?"var(--gold-s)":"transparent",color:preset.label===p.label?"var(--gold)":"var(--txm)",fontSize:12,fontFamily:"var(--fm)",cursor:"pointer",transition:"all .2s"}}>{p.label}</button>
        ))}
      </div>
      {/* Timer ring — tıklayınca odak moduna girer */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>{timerCore}</div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={running?pause:start} style={{flex:2,padding:"12px",borderRadius:10,border:"none",cursor:"pointer",background:running?"var(--s3)":"var(--gold)",color:running?"var(--tx)":"#030304",fontSize:14,fontWeight:600,fontFamily:"var(--fb)",transition:"all .2s"}}>{running?"⏸ Duraklat":"▶ Başlat"}</button>
        <button onClick={reset} title="Sıfırla" style={{flex:1,padding:"12px",borderRadius:10,border:"1px solid var(--b)",cursor:"pointer",background:"transparent",color:"var(--txm)",fontSize:13,fontFamily:"var(--fb)"}}>↺</button>
        <button onClick={enterFocus} title="Tam ekran odak" style={{padding:"12px 14px",borderRadius:10,border:"1px solid var(--b)",cursor:"pointer",background:"transparent",color:"var(--txm)",fontSize:15}}>⛶</button>
      </div>
      {sessions>0&&<p style={{marginTop:12,textAlign:"center",fontFamily:"var(--fm)",fontSize:12,color:"var(--gold)"}}>◆ {sessions} seans · {sessions*Math.round(preset.sec/60)} dk odak</p>}
    </div>
  );
}

/* Day Score */
function DayScore({ morning, mDone, habits, hDone, streak, sessions }) {
  const ms = morning.length ? morning.filter(i=>mDone[i.id]).length/morning.length : 0;
  const hs = habits.length  ? habits.filter(h=>hDone[h.id]).length/habits.length   : 0;
  const overall = Math.round(((ms+hs)/2)*100);
  const scoreColor = overall>=80?"var(--gold)":overall>=50?"var(--blue)":"var(--txm)";
  return (
    <div style={{background:"var(--s1)",border:`1px solid ${overall>=80?"var(--gold-m)":"var(--b)"}`,borderRadius:16,padding:"20px 24px",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap",transition:"border-color .3s"}}>
      <div style={{flex:1,minWidth:100}}>
        <p style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--txd)",fontFamily:"var(--fm)",marginBottom:4}}>Günün Skoru</p>
        <div style={{display:"flex",alignItems:"baseline",gap:4}}>
          <span style={{fontFamily:"var(--fd)",fontSize:38,fontWeight:600,color:scoreColor}}>{overall}</span>
          <span style={{fontSize:13,color:"var(--txd)"}}>/ 100</span>
        </div>
      </div>
      <div style={{width:1,height:36,background:"var(--b)"}}/>
      <div style={{display:"flex",gap:22,flexWrap:"wrap"}}>
        {[
          {label:"Sabah",    val:`${morning.filter(i=>mDone[i.id]).length}/${morning.length}`, c:"var(--amber)"},
          {label:"Alışkanlık",val:`${habits.filter(h=>hDone[h.id]).length}/${habits.length}`,  c:"var(--green)"},
          {label:"Seans",    val:sessions,                                                       c:"var(--violet)"},
          {label:"🔥 Seri",  val:`${streak} gün`,                                               c:"var(--gold)"},
        ].map(s=>(
          <div key={s.label}>
            <p style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--txd)",fontFamily:"var(--fm)",marginBottom:3}}>{s.label}</p>
            <p style={{fontFamily:"var(--fm)",fontSize:17,color:s.c}}>{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* End Day Modal */
function EndDayModal({ onClose, onConfirm }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:150,background:"rgba(4,4,5,.88)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"var(--s1)",border:"1px solid var(--bh)",borderRadius:20,padding:"34px 38px",maxWidth:360,width:"90%",animation:"fu .25s ease"}}>
        <p style={{fontFamily:"var(--fd)",fontSize:26,fontStyle:"italic",color:"var(--tx)",marginBottom:12}}>Günü kapat?</p>
        <p style={{fontSize:13,color:"var(--txd)",lineHeight:1.7,marginBottom:26}}>Sabah ritüeli ve alışkanlıklar sıfırlanacak. Seri sayacın güncellenecek.</p>
        <div style={{display:"flex",gap:12}}>
          <button onClick={onConfirm} style={{flex:1,padding:"11px",borderRadius:10,border:"none",cursor:"pointer",background:"var(--gold)",color:"#030304",fontSize:13,fontWeight:600,fontFamily:"var(--fb)"}}>Kapat & Senkronize Et</button>
          <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,cursor:"pointer",border:"1px solid var(--b)",background:"transparent",color:"var(--txd)",fontSize:13,fontFamily:"var(--fb)"}}>Geri</button>
        </div>
      </div>
    </div>
  );
}

function DailyOS({ morningItems, morningDone, onToggleMorning, habits, habitsDone, onToggleHabit, streak, onEndDay, xp, setXp, sessions, setSessions, focusText, setFocusText }) {
  const [showEnd, setShowEnd] = useState(false);

  const handleEndDay = () => {
    onEndDay();
    setSessions(0);
    setShowEnd(false);
  };

  return (
    <div>
      {showEnd&&<EndDayModal onClose={()=>setShowEnd(false)} onConfirm={handleEndDay}/>}
      <div className="fu" style={{marginBottom:20}}>
        <DayScore morning={morningItems} mDone={morningDone} habits={habits} hDone={habitsDone} streak={streak} sessions={sessions}/>
      </div>
      <div className="daily-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div className="fu1"><MorningStack items={morningItems} done={morningDone} onToggle={onToggleMorning}/></div>
          <div className="fu2"><HabitTracker habits={habits} done={habitsDone} onToggle={onToggleHabit}/></div>
        </div>
        <div className="right-sticky" style={{display:"flex",flexDirection:"column",gap:18,position:"sticky",top:74}}>
          <div className="fu1">
            <DeepWorkTimer onSession={()=>setSessions(s=>s+1)} xp={xp} setXp={setXp} sessions={sessions} setSessions={setSessions} project={focusText} setProject={setFocusText}/>
          </div>
          <div className="fu2" style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:16,padding:"20px 22px"}}>
            <p style={{fontSize:11,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--txm)",fontFamily:"var(--fm)",marginBottom:10}}>Bugünün Tek Odağı</p>
            <textarea value={focusText} onChange={e=>setFocusText(e.target.value)}
              placeholder="Bugün tek şeyi yapabilseydin ne olurdu?" rows={3}
              style={{width:"100%",fontSize:15,lineHeight:1.8,fontFamily:"var(--fd)",fontStyle:"italic"}}/>
          </div>
          <button onClick={()=>setShowEnd(true)} style={{width:"100%",padding:"13px",borderRadius:12,border:"1px solid var(--bh)",cursor:"pointer",background:"var(--s2)",color:"var(--txm)",fontSize:14,fontFamily:"var(--fb)",fontWeight:500,transition:"all .2s"}}>
            Günü Kapat & Senkronize Et ↓
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  TAB 4 — MIND JOURNAL
// ════════════════════════════════════════════════════════
function AutopilotBreaker() {
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState({});
  const [dateView, setDateView] = useState(todayKey());
  const [savedQs, setSavedQs] = useState({});  // store'dan gelen kayıtlı cevaplar
  const [anim, setAnim]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const ref = useRef(null);
  const q = AUTOPILOT_QS[idx];
  const isToday = dateView === todayKey();
  const pastDays = lastNDays(8).slice(0,-1).reverse();

  // Seçili tarihin kayıtlarını yükle
  useEffect(()=>{
    (async()=>{
      const d = await store.get(`theos_ap_${dateView}`) || {};
      setSavedQs(d);
      // Bugün görüntüleniyorsa local answers'ı koru, geçmişte sıfırla
      if(dateView !== todayKey()) setAnswers({});
    })();
  },[dateView]);

  const goTo = (i) => { if(i===idx)return; setAnim(true); setTimeout(()=>{setIdx(i);setAnim(false);ref.current?.focus();},260); };

  const handleSave = async () => {
    if(!answers[q.id]?.trim())return;
    setSaving(true);
    const existing = await store.get(`theos_ap_${dateView}`) || {};
    const updated = { ...existing, [q.id]: answers[q.id] };
    await store.set(`theos_ap_${dateView}`, updated);
    setSavedQs(updated);
    setSaving(false); setSavedMsg(true); setTimeout(()=>setSavedMsg(false),1800);
  };

  // Görüntülenen cevap: bugün → local state, geçmiş → store
  const displayAnswer = isToday ? (answers[q.id]||savedQs[q.id]||"") : (savedQs[q.id]||"");
  const answeredCount = Object.keys(savedQs).length;

  return (
    <div style={{maxWidth:640,margin:"0 auto"}}>
      <div className="fu" style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:8}}>
          <h2 style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:400,fontStyle:"italic",color:"var(--tx)"}}>Otopilotu Kes</h2>
          <span className="ink" style={{flex:1,marginBottom:5}}/>
        </div>
        <p style={{fontSize:13,color:"var(--txd)",fontStyle:"italic",lineHeight:1.7}}>Hayat kelimelerde değil, olaylarda yaşanır. Şu anki gerçekliğinle yüzleş.</p>
      </div>

      {/* Tarih seçici */}
      <div className="fu1" style={{display:"flex",gap:6,marginBottom:20,overflowX:"auto",paddingBottom:2}}>
        {[todayKey(),...pastDays.slice(0,6)].map(k=>(
          <button key={k} onClick={()=>setDateView(k)} style={{fontFamily:"var(--fm)",fontSize:11,padding:"5px 12px",borderRadius:14,border:`1px solid ${dateView===k?"var(--rose)":"var(--b)"}`,background:dateView===k?"var(--rose-s)":"transparent",color:dateView===k?"var(--rose)":"var(--txd)",cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap",flexShrink:0}}>
            {k===todayKey()?"bugün":new Date(k).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}
          </button>
        ))}
      </div>

      {/* Soru pill'leri — yanıtlananlar renkli */}
      <div className="fu1" style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
        {AUTOPILOT_QS.map((qs,i)=>{
          const hasAnswer = !!savedQs[qs.id];
          return <button key={qs.id} onClick={()=>goTo(i)} style={{fontFamily:"var(--fm)",fontSize:11,padding:"4px 11px",borderRadius:16,border:`1px solid ${i===idx?qs.color:hasAnswer?"rgba(255,255,255,.12)":"var(--b)"}`,background:i===idx?qs.bg:hasAnswer?"rgba(255,255,255,.04)":"transparent",color:i===idx?qs.color:hasAnswer?"var(--txm)":"var(--txd)",cursor:"pointer",transition:"all .2s",position:"relative"}}>
            {i+1}{hasAnswer&&<span style={{position:"absolute",top:-3,right:-3,width:6,height:6,borderRadius:"50%",background:qs.color}}/>}
          </button>;
        })}
        <button onClick={()=>goTo(Math.floor(Math.random()*AUTOPILOT_QS.length))} style={{fontFamily:"var(--fm)",fontSize:11,padding:"4px 11px",borderRadius:16,border:"1px dashed var(--bh)",background:"transparent",color:"var(--txd)",cursor:"pointer",marginLeft:4}}>⟳</button>
        {answeredCount>0&&<span style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--txd)",alignSelf:"center",marginLeft:4}}>{answeredCount}/8 yanıtlandı</span>}
      </div>

      <div className="fu2" style={{background:"var(--s1)",border:`1px solid ${q.color}20`,borderRadius:18,overflow:"hidden",marginBottom:16}}>
        <div style={{height:2,background:q.color,opacity:.55}}/>
        <div style={{padding:"28px 28px 24px"}}>
          <div style={{animation:anim?"swap .5s ease":"none"}}>
            <p style={{fontFamily:"var(--fd)",fontSize:20,fontStyle:"italic",color:"var(--tx)",lineHeight:1.55,marginBottom:8}}>{q.q}</p>
            <p style={{fontSize:12,color:"var(--txd)",fontStyle:"italic",lineHeight:1.6,marginBottom:24}}>{q.hint}</p>
          </div>
          <div style={{borderTop:`1px solid ${q.color}15`,paddingTop:18}}>
            <textarea ref={ref}
              value={isToday ? (answers[q.id]??savedQs[q.id]??"") : (savedQs[q.id]||"")}
              onChange={e=>{ if(!isToday)return; setAnswers(p=>({...p,[q.id]:e.target.value})); }}
              readOnly={!isToday}
              placeholder={isToday?"Dürüstçe yaz. Sadece kendin için...":"(geçmiş kayıt — salt okunur)"}
              rows={6} style={{width:"100%",fontSize:15,lineHeight:1.8,letterSpacing:"0.01em",color:isToday?"var(--tx)":"var(--txm)"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
            <span style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--txd)"}}>
              {!isToday&&savedQs[q.id]
                ? <span style={{color:"var(--rose)"}}>✓ {dateView === todayKey()?"bugün":new Date(dateView).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})} kaydedildi</span>
                : `${wc(answers[q.id]||"")} kelime`
              }
            </span>
            {isToday&&<button onClick={handleSave} disabled={!answers[q.id]?.trim()}
              style={{fontFamily:"var(--fm)",fontSize:11,padding:"7px 18px",borderRadius:8,border:`1px solid ${answers[q.id]?.trim()?q.color:"var(--b)"}`,background:savedMsg?q.bg:"transparent",color:savedMsg?q.color:answers[q.id]?.trim()?q.color:"var(--txd)",cursor:answers[q.id]?.trim()?"pointer":"default",transition:"all .25s"}}>
              {saving?"...":savedMsg?"✓ kaydedildi":"kaydet"}
            </button>}
          </div>
        </div>
      </div>
      <div className="fu3" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>goTo(Math.max(0,idx-1))} disabled={idx===0} style={{fontFamily:"var(--fm)",fontSize:12,padding:"7px 14px",borderRadius:8,border:"1px solid var(--b)",cursor:idx===0?"default":"pointer",background:"transparent",color:"var(--txm)",opacity:idx===0?.3:1}}>← önceki</button>
        <span style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--txd)"}}>{idx+1} / {AUTOPILOT_QS.length}</span>
        <button onClick={()=>goTo(Math.min(AUTOPILOT_QS.length-1,idx+1))} disabled={idx===AUTOPILOT_QS.length-1} style={{fontFamily:"var(--fm)",fontSize:12,padding:"7px 14px",borderRadius:8,border:"1px solid var(--b)",cursor:idx===AUTOPILOT_QS.length-1?"default":"pointer",background:"transparent",color:"var(--txm)",opacity:idx===AUTOPILOT_QS.length-1?.3:1}}>sonraki →</button>
      </div>
    </div>
  );
}

function BrainDump() {
  const [text, setText] = useState("");
  const [dateView, setDateView] = useState(todayKey());
  const [saving, setSaving] = useState(false);
  const pastKeys = lastNDays(7).slice(0,-1).reverse();
  const saveT = useRef(null);
  const isToday = dateView===todayKey();

  useEffect(()=>{(async()=>{const d=await store.get(`theos_dump_${dateView}`);setText(d?.text||"");})();},[dateView]);

  const handleChange = (val) => {
    setText(val); setSaving(true);
    clearTimeout(saveT.current);
    saveT.current = setTimeout(async()=>{ await store.set(`theos_dump_${dateView}`,{text:val}); setSaving(false); },800);
  };

  return (
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <div className="fu" style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:8}}>
          <h2 style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:400,fontStyle:"italic",color:"var(--tx)"}}>Brain Dump</h2>
          <span className="ink" style={{flex:1,marginBottom:5}}/>
        </div>
        <p style={{fontSize:13,color:"var(--txd)",fontStyle:"italic",lineHeight:1.7}}>Zihnindeki her şeyi dışarı at. Filtre yok, yargı yok. Sadece ak.</p>
      </div>
      <div className="fu1" style={{display:"flex",gap:7,marginBottom:20}}>
        {[todayKey(),...pastKeys.slice(0,5)].map(k=>(
          <button key={k} onClick={()=>setDateView(k)} style={{fontFamily:"var(--fm)",fontSize:11,padding:"5px 12px",borderRadius:16,border:`1px solid ${dateView===k?"var(--amber)":"var(--b)"}`,background:dateView===k?"var(--amber-s)":"transparent",color:dateView===k?"var(--amber)":"var(--txd)",cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
            {k===todayKey()?"bugün":new Date(k).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}
          </button>
        ))}
      </div>
      <div className="fu2" style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:18,overflow:"hidden"}}>
        <div style={{padding:"12px 22px",borderBottom:"1px solid var(--b)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--txd)"}}>{fmtDate(dateView)}</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"var(--fm)",fontSize:11,color:wc(text)>50?"var(--amber)":"var(--txd)",transition:"color .3s"}}>{wc(text)} kelime</span>
            <div style={{width:5,height:5,borderRadius:"50%",background:saving?"var(--amber)":"var(--green)",animation:saving?"pulse 1s infinite":"none",transition:"background .3s"}}/>
          </div>
        </div>
        <div style={{padding:"24px 28px",backgroundImage:isToday?"repeating-linear-gradient(transparent,transparent 31px,rgba(255,255,255,.022) 31px,rgba(255,255,255,.022) 32px)":"none",backgroundSize:"100% 32px",backgroundPositionY:"24px"}}>
          <textarea value={text} onChange={e=>handleChange(e.target.value)} readOnly={!isToday}
            placeholder={isToday?"Aklındaki her şeyi buraya dök.\n\nNe düşünüyorsun? Ne hissediyorsun? Neyi çözmek istiyorsun?\nFiltre yok. Sadece yaz.":"(geçmiş kayıt — salt okunur)"}
            rows={16} style={{width:"100%",fontSize:15,lineHeight:"32px",letterSpacing:"0.01em",color:isToday?"var(--tx)":"var(--txm)"}}/>
        </div>
      </div>
    </div>
  );
}

function WeeklyReview() {
  const [selectedWk, setSelectedWk] = useState(weekKey());
  const [review, setReview]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const saveT = useRef(null);

  const weekKeys = Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-i*7);
    const jan1=new Date(d.getFullYear(),0,1);
    const w=Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
    return `${d.getFullYear()}-W${String(w).padStart(2,"0")}`;
  });

  const isCurrentWeek = selectedWk === weekKey();

  useEffect(()=>{
    (async()=>{ const d=await store.get(`theos_review_${selectedWk}`); setReview(d||{}); })();
  },[selectedWk]);

  const handleChange = (key, val) => {
    if(!isCurrentWeek) return;
    const up={...review,[key]:val}; setReview(up); setSaving(true);
    clearTimeout(saveT.current);
    saveT.current=setTimeout(async()=>{ await store.set(`theos_review_${selectedWk}`,up); setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),1500); },700);
  };

  const getWeekRange = (wk) => {
    const [yr,w]=wk.split("-W").map(Number);
    const jan1=new Date(yr,0,1);
    const mon=new Date(jan1.getTime()+(w-1)*7*86400000-(jan1.getDay()-1)*86400000);
    const sun=new Date(mon.getTime()+6*86400000);
    const f=dt=>dt.toLocaleDateString("tr-TR",{day:"numeric",month:"short"});
    return `${f(mon)} – ${f(sun)}`;
  };
  const done = WEEKLY_PROMPTS.filter(p=>(review[p.key]||"").trim().length>20).length;

  return (
    <div style={{maxWidth:640,margin:"0 auto"}}>
      <div className="fu" style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:8}}>
          <h2 style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:400,fontStyle:"italic",color:"var(--tx)"}}>Haftalık Review</h2>
          <span className="ink" style={{flex:1,marginBottom:5}}/>
        </div>
      </div>

      {/* Hafta seçici */}
      <div className="fu1" style={{display:"flex",gap:6,marginBottom:20,overflowX:"auto",paddingBottom:2}}>
        {weekKeys.map((wk,i)=>(
          <button key={wk} onClick={()=>setSelectedWk(wk)} style={{fontFamily:"var(--fm)",fontSize:11,padding:"5px 12px",borderRadius:14,border:`1px solid ${selectedWk===wk?"var(--sage)":"var(--b)"}`,background:selectedWk===wk?"var(--sage-s)":"transparent",color:selectedWk===wk?"var(--sage)":"var(--txd)",cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap",flexShrink:0}}>
            {i===0?"bu hafta":getWeekRange(wk)}
          </button>
        ))}
      </div>

      {/* Hafta özeti */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <p style={{fontSize:13,color:"var(--txd)",fontStyle:"italic"}}>{getWeekRange(selectedWk)}</p>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {WEEKLY_PROMPTS.map(p=><div key={p.key} style={{width:7,height:7,borderRadius:"50%",background:(review[p.key]||"").trim().length>20?p.color:"var(--bh)",transition:"background .3s"}}/>)}
          <span style={{fontFamily:"var(--fm)",fontSize:10,color:saving?"var(--amber)":saved?"var(--green)":"var(--txd)",marginLeft:4}}>
            {!isCurrentWeek?"geçmiş":saving?"kayıt...":saved?"✓":`${done}/4`}
          </span>
        </div>
      </div>

      {!isCurrentWeek&&(
        <div className="fu1" style={{marginBottom:16,padding:"10px 16px",background:"rgba(255,255,255,.03)",border:"1px solid var(--b)",borderRadius:10}}>
          <p style={{fontSize:12,color:"var(--txd)",fontStyle:"italic"}}>📖 Geçmiş hafta — salt okunur</p>
        </div>
      )}

      <div className="fu1" style={{marginBottom:20,padding:"14px 18px",borderLeft:"2px solid var(--amber)",background:"var(--amber-s)",borderRadius:"0 10px 10px 0"}}>
        <p style={{fontFamily:"var(--fd)",fontSize:14,fontStyle:"italic",color:"var(--txm)",lineHeight:1.8}}>"What gets reviewed gets improved. What gets ignored stays broken."</p>
        <p style={{fontSize:11,color:"var(--txd)",marginTop:5,fontFamily:"var(--fm)"}}>— Dan Koe</p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {WEEKLY_PROMPTS.map((p,i)=>{
          const val=review[p.key]||"";
          const filled=val.trim().length>20;
          return (
            <div key={p.key} className={`fu${Math.min(i+1,3)}`} style={{background:"var(--s1)",border:`1px solid ${filled?`${p.color}25`:"var(--b)"}`,borderRadius:14,overflow:"hidden",transition:"border-color .3s"}}>
              <div style={{display:"flex"}}>
                <div style={{width:3,flexShrink:0,background:filled?p.color:"var(--b)",transition:"background .3s"}}/>
                <div style={{flex:1,padding:"18px 20px"}}>
                  <FieldLabel color={filled?p.color:"var(--txd)"}>{p.label}</FieldLabel>
                  <p style={{fontSize:12,color:"var(--txd)",fontStyle:"italic",lineHeight:1.6,marginBottom:12}}>{p.hint}</p>
                  <textarea value={val} onChange={e=>handleChange(p.key,e.target.value)}
                    readOnly={!isCurrentWeek}
                    placeholder={isCurrentWeek?"Yaz...":"(bu haftada kayıt yok)"}
                    rows={p.key==="nextfocus"?2:3}
                    style={{width:"100%",fontSize:14,lineHeight:1.75,color:isCurrentWeek?"var(--tx)":"var(--txm)"}}/>
                  {wc(val)>0&&<p style={{fontSize:10,color:wc(val)>10?p.color:"var(--txd)",fontFamily:"var(--fm)",marginTop:5,textAlign:"right"}}>{wc(val)} kelime</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isCurrentWeek&&done===4&&<div className="fi" style={{marginTop:20,padding:"16px 20px",background:"var(--green-s)",border:"1px solid rgba(58,148,105,.2)",borderRadius:12,textAlign:"center"}}>
        <p style={{fontFamily:"var(--fd)",fontSize:17,fontStyle:"italic",color:"var(--green)"}}>Bu haftanın review'u tamamlandı.</p>
        <p style={{fontSize:12,color:"var(--txd)",marginTop:4}}>Refleksiyon yapan %1'in içindesin. Devam et.</p>
      </div>}
    </div>
  );
}

const JOURNAL_TABS = [
  {key:"autopilot",label:"Otopilot Kırıcı",color:"var(--rose)"},
  {key:"dump",     label:"Brain Dump",      color:"var(--amber)"},
  {key:"review",   label:"Haftalık Review", color:"var(--sage)"},
];

function MindJournal() {
  const [sub, setSub] = useState("autopilot");
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:28,borderBottom:"1px solid var(--b)",paddingBottom:0}}>
        {JOURNAL_TABS.map(t=>(
          <button key={t.key} onClick={()=>setSub(t.key)} style={{fontFamily:"var(--fm)",fontSize:12,padding:"8px 18px",border:"none",cursor:"pointer",background:"transparent",color:sub===t.key?"var(--tx)":"var(--txd)",borderBottom:`2px solid ${sub===t.key?t.color:"transparent"}`,transition:"all .2s",marginBottom:-1,letterSpacing:"0.04em"}}>{t.label}</button>
        ))}
      </div>
      {sub==="autopilot"&&<AutopilotBreaker/>}
      {sub==="dump"&&<BrainDump/>}
      {sub==="review"&&<WeeklyReview/>}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  TAB 5 — PROGRESS
// ════════════════════════════════════════════════════════
const genDemoData = () => {
  const days = lastNDays(84), data = {};
  days.forEach((d,i)=>{
    const we = [0,6].includes(new Date(d).getDay());
    const rec = i>70;
    const r = Math.random();
    data[d] = rec ? (r>.15?Math.floor(r*3)+2:0) : we ? (r>.6?Math.floor(r*2)+1:0) : (r>.35?Math.floor(r*4)+1:0);
  });
  return data;
};

const cellC = (s) => ["var(--s3)","rgba(201,168,76,.16)","rgba(201,168,76,.35)","rgba(201,168,76,.58)","rgba(201,168,76,.88)"][Math.min(s,4)];

function StreakCalendar({ dayData }) {
  const [tip, setTip] = useState(null);
  const days = lastNDays(84);
  const weeks = Array.from({length:12},(_,w)=>days.slice(w*7,w*7+7));
  const TR = ["Pz","Pt","Sa","Ça","Pe","Cu","Ct"];
  const mLabels = [];
  weeks.forEach((w,wi)=>{
    const lbl=new Date(w[0]).toLocaleDateString("tr-TR",{month:"short"});
    if(wi===0||new Date(weeks[wi-1]?.[0]).toLocaleDateString("tr-TR",{month:"short"})!==lbl) mLabels.push({wi,lbl});
  });
  return (
    <div>
      <div style={{display:"flex",marginBottom:6,paddingLeft:26}}>
        {weeks.map((_,wi)=>{const ml=mLabels.find(m=>m.wi===wi);return(<div key={wi} style={{flex:1,fontSize:9,fontFamily:"var(--fm)",color:ml?"var(--txd)":"transparent",letterSpacing:"0.06em"}}>{ml?.lbl||"·"}</div>);})}
      </div>
      <div style={{display:"flex",gap:2}}>
        <div style={{display:"flex",flexDirection:"column",gap:2,marginRight:4}}>
          {TR.map(d=><div key={d} style={{height:12,fontSize:8,fontFamily:"var(--fm)",color:"var(--txd)",display:"flex",alignItems:"center"}}>{d}</div>)}
        </div>
        {weeks.map((week,wi)=>(
          <div key={wi} style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
            {week.map((day)=>{
              const s=dayData[day]||0, isT=day===todayKey();
              return <div key={day} onMouseEnter={()=>setTip({day,s})} onMouseLeave={()=>setTip(null)}
                style={{height:12,borderRadius:2,background:cellC(s),border:`1px solid ${isT?"var(--gold)":s>=4?"rgba(201,168,76,.4)":"transparent"}`,cursor:"default",transition:"transform .1s"}}/>;
            })}
          </div>
        ))}
      </div>
      {tip&&(
        <div style={{marginTop:10,padding:"7px 14px",background:"var(--s2)",border:"1px solid var(--bh)",borderRadius:8,display:"inline-flex",alignItems:"center",gap:10}}>
          <div style={{width:9,height:9,borderRadius:2,background:cellC(tip.s)}}/>
          <span style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--txm)"}}>{fmtDate(tip.day)}</span>
          <span style={{fontFamily:"var(--fm)",fontSize:11,color:tip.s?"var(--gold)":"var(--txd)"}}>{tip.s?`${tip.s}/4 tamamlandı`:"Kayıt yok"}</span>
        </div>
      )}
      <div style={{marginTop:10,display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end"}}>
        <span style={{fontSize:9,fontFamily:"var(--fm)",color:"var(--txd)"}}>az</span>
        {[0,1,2,3,4].map(s=><div key={s} style={{width:11,height:11,borderRadius:2,background:cellC(s)}}/>)}
        <span style={{fontSize:9,fontFamily:"var(--fm)",color:"var(--txd)"}}>çok</span>
      </div>
    </div>
  );
}

function Progress({ xp, streak }) {
  const [dayData, setDayData] = useState({});
  const [logs, setLogs]       = useState([]);
  const [loaded, setLoaded]   = useState(false);

  useEffect(()=>{
    (async()=>{
      // Loglardan gerçek day data oluştur
      const stored = await store.get("theos_logs") || [];
      setLogs(stored);
      // Her log entry için score → 0-4 arası normalize et
      const data = {};
      stored.forEach(e=>{
        // dayScore 0-100 → 0-4 arası
        data[e.date] = Math.round(e.dayScore / 25);
      });
      // Bugünkü aktif veriyi de ekle (henüz günü kapatmamışsa)
      const td = await store.get(`theos_daily_${todayKey()}`);
      if(td){
        const mDone = Object.values(td.morningDone||{}).filter(Boolean).length;
        const hDone = Object.values(td.habitsDone||{}).filter(Boolean).length;
        const total = mDone + hDone;
        if(total>0) data[todayKey()] = Math.min(4, Math.ceil(total/2));
      }
      setDayData(data);
      setLoaded(true);
    })();
  },[]);

  const lvl      = levelFromXp(xp);
  const xpInLvl  = xp % 500;
  const lvlPct   = Math.round(xpInLvl/500*100);
  const R=54, C=2*Math.PI*R;
  const offset = C*(1-xpInLvl/500);
  const totalDays   = Object.values(dayData).filter(v=>v>0).length;
  const perfectDays = Object.values(dayData).filter(v=>v>=4).length;

  // Gerçek alışkanlık oranları loglardan
  const habitNames = DEF_HABITS.map(h=>h.text);
  const habitColors= {"Derin odak çalışması":"var(--gold)","Fiziksel antrenman":"var(--blue)","Stratejik okuma":"var(--green)","İçerik üretimi":"var(--amber)"};
  const HABITS_STAT = habitNames.map(name=>({
    label: name,
    pct: logs.length ? Math.round(logs.filter(e=>e.habits?.includes(name)).length/logs.length*100) : 0,
    color: habitColors[name]||"var(--gold)",
  }));
  const MILESTONES = [
    {xp:500, label:"İlk seviye",  icon:"◎",done:true},
    {xp:1000,label:"1000 XP",    icon:"◉",done:xp>=1000},
    {xp:2000,label:"Momentum",   icon:"◈",done:xp>=2000},
    {xp:3500,label:"21 gün seri",icon:"◆",done:streak>=21},
    {xp:5000,label:"Elite",      icon:"★",done:xp>=5000},
  ];
  const maxM = 5000;

  return (
    <div>
      {/* Hero */}
      <div className="fu" style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:18,padding:"28px 32px",marginBottom:20,display:"flex",alignItems:"center",gap:32,flexWrap:"wrap"}}>
        {/* Level ring */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{position:"relative",width:120,height:120}}>
            <svg width="120" height="120" style={{transform:"rotate(-90deg)"}}>
              <circle cx="60" cy="60" r={R} fill="none" stroke="var(--s3)" strokeWidth={4}/>
              <circle cx="60" cy="60" r={R} fill="none" stroke="var(--gold)" strokeWidth={4}
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
                style={{transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"var(--fd)",fontSize:30,fontWeight:600,color:"var(--gold)"}}>{lvl}</span>
              <span style={{fontFamily:"var(--fm)",fontSize:8,color:"var(--txd)",letterSpacing:"0.1em"}}>LEVEL</span>
            </div>
          </div>
          <p style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--gold)",letterSpacing:"0.1em"}}>{lvlTitle(lvl).toUpperCase()}</p>
        </div>
        <div style={{width:1,height:90,background:"var(--b)"}}/>
        {/* XP bar */}
        <div style={{flex:1,minWidth:180}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--txd)"}}>Seviye {lvl} → {lvl+1}</span>
            <span style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--gold)"}}>{xpInLvl} / 500 XP</span>
          </div>
          <div style={{height:5,background:"var(--s3)",borderRadius:3,overflow:"hidden",marginBottom:18}}>
            <div className="bgrow" style={{height:"100%",background:"var(--gold)",borderRadius:3,width:`${lvlPct}%`,boxShadow:"0 0 8px rgba(201,168,76,.3)",animationDelay:".3s"}}/>
          </div>
          <p style={{fontFamily:"var(--fd)",fontSize:14,fontStyle:"italic",color:"var(--txm)",lineHeight:1.7}}>"Discipline is choosing between what you want now and what you want most."</p>
        </div>
        <div style={{width:1,height:90,background:"var(--b)"}}/>
        {/* Stats */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[{label:"Aktif Gün",val:totalDays,c:"var(--gold)"},{label:"Kusursuz",val:perfectDays,c:"var(--green)"},{label:"🔥 Seri",val:`${streak} gün`,c:"var(--violet)"}].map(s=>(
            <div key={s.label}>
              <p style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--txd)",marginBottom:2}}>{s.label}</p>
              <p style={{fontFamily:"var(--fd)",fontSize:24,fontWeight:600,color:s.c}}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="fu1" style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:16,padding:"24px 28px",marginBottom:18}}>
        <p style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",marginBottom:18}}>84 Günlük Aktivite</p>
        <StreakCalendar dayData={dayData}/>
      </div>

      {/* Bottom grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {/* Habits breakdown */}
        <div className="fu2" style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:16,padding:"22px 24px"}}>
          <p style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",marginBottom:18}}>Alışkanlık Oranı (84 gün)</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {HABITS_STAT.map((h,i)=>(
              <div key={h.label} style={{animationDelay:`${i*.08}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:13,color:"var(--txm)"}}>{h.label}</span>
                  <span style={{fontFamily:"var(--fm)",fontSize:11,color:h.color}}>{h.pct}%</span>
                </div>
                <div style={{height:3,background:"var(--s3)",borderRadius:2,overflow:"hidden"}}>
                  <div className="bgrow" style={{height:"100%",background:h.color,borderRadius:2,width:`${h.pct}%`,animationDelay:`${.3+i*.08}s`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Milestones */}
        <div className="fu2" style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:16,padding:"22px 24px"}}>
          <p style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",marginBottom:18}}>Kilometre Taşları</p>
          <div style={{position:"relative",marginBottom:20}}>
            <div style={{height:2,background:"var(--s3)",borderRadius:1}}/>
            <div className="bgrow" style={{position:"absolute",top:0,left:0,height:2,background:"var(--gold)",borderRadius:1,width:`${Math.min(xp/maxM*100,100)}%`,animationDelay:".4s"}}/>
            {MILESTONES.map(m=>(
              <div key={m.xp} style={{position:"absolute",top:"50%",left:`${m.xp/maxM*100}%`,transform:"translate(-50%,-50%)",width:11,height:11,borderRadius:"50%",background:m.done?"var(--gold)":"var(--s2)",border:`2px solid ${m.done?"var(--gold)":"var(--bh)"}`,boxShadow:m.done?"0 0 7px rgba(201,168,76,.35)":"none",zIndex:2}}/>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {MILESTONES.map(m=>(
              <div key={m.xp} style={{display:"flex",alignItems:"center",gap:10,opacity:m.done?1:.35,transition:"opacity .2s"}}>
                <span style={{fontFamily:"var(--fm)",fontSize:13,color:m.done?"var(--gold)":"var(--txd)",width:14}}>{m.icon}</span>
                <span style={{fontSize:13,flex:1,color:m.done?"var(--tx)":"var(--txm)"}}>{m.label}</span>
                <span style={{fontFamily:"var(--fm)",fontSize:10,color:m.done?"var(--gold)":"var(--txd)"}}>{m.xp} XP</span>
                {m.done&&<span style={{fontSize:10,color:"var(--green)"}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  TAB 6 — LOGLAR
// ════════════════════════════════════════════════════════
const AP_LABELS = {
  1:"Neyden kaçıyorum?", 2:"Son 2 saatimi filmlesen?",
  3:"Nefret ettiğim hayata mı?", 4:"Kimlik koruma mı, arzu mu?",
  5:"Canlılığı güvenliğe takas?", 6:"5 yıl sonra ne hisseder?",
  7:"Neyi erteliyorum?", 8:"Onaysız ne yapardım?",
};
const HABIT_CLR = {
  "Derin odak çalışması":"var(--gold)","Fiziksel antrenman":"var(--blue)",
  "Stratejik okuma":"var(--green)","İçerik üretimi":"var(--amber)",
};
const scoreClr = (s) => s>=80?"var(--gold)":s>=55?"var(--blue)":s>=30?"var(--amber)":"var(--txd)";
const scoreLbl = (s) => s===100?"Kusursuz":s>=80?"Güçlü":s>=55?"Orta":s>=30?"Zayıf":"Kayıp";
const fmtShort = (iso) => new Date(iso).toLocaleDateString("tr-TR",{weekday:"short",day:"numeric",month:"short"});
const fmtLong  = (iso) => new Date(iso).toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

function LogCard({ entry, habits, morning, expanded, onToggle }) {
  const sc = scoreClr(entry.dayScore);
  return (
    <div style={{background:"var(--s1)",border:`1px solid ${expanded?"var(--bh)":"var(--b)"}`,borderRadius:14,overflow:"hidden",transition:"border-color .2s"}}>
      {/* Row header */}
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 18px",cursor:"pointer"}}>
        {/* Score ring */}
        <div style={{width:42,height:42,borderRadius:"50%",flexShrink:0,border:`2px solid ${sc}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`${sc}08`}}>
          <span style={{fontFamily:"var(--fd)",fontSize:14,fontWeight:600,color:sc,lineHeight:1}}>{entry.dayScore}</span>
          <span style={{fontSize:7,color:sc,fontFamily:"var(--fm)",letterSpacing:"0.06em"}}>puan</span>
        </div>
        {/* Date + habit dots */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <span style={{fontFamily:"var(--fb)",fontSize:13,fontWeight:500,color:"var(--tx)"}}>{fmtShort(entry.date)}</span>
            <span style={{fontSize:9,padding:"2px 7px",borderRadius:8,background:`${sc}10`,color:sc,fontFamily:"var(--fm)",letterSpacing:"0.08em"}}>{scoreLbl(entry.dayScore)}</span>
            {entry.streak>0&&<span style={{fontSize:11,color:"var(--gold)",fontFamily:"var(--fm)"}}>🔥 {entry.streak}</span>}
          </div>
          <div style={{display:"flex",gap:5}}>
            {habits.map(h=>(
              <div key={h.id} title={h.text} style={{width:8,height:8,borderRadius:"50%",background:entry.habits?.includes(h.text)?(HABIT_CLR[h.text]||"var(--gold)"):"var(--s3)",border:`1px solid ${entry.habits?.includes(h.text)?"transparent":"var(--bh)"}`,transition:"background .2s"}}/>
            ))}
          </div>
        </div>
        {/* Stats */}
        <div style={{display:"flex",gap:14,flexShrink:0}}>
          {[{l:"Seans",v:entry.sessions,c:"var(--violet)"},{l:"+XP",v:`+${entry.xpGained}`,c:"var(--gold)"},{l:"Journal",v:entry.answeredQs?.length||0,c:"var(--rose)"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <p style={{fontFamily:"var(--fm)",fontSize:13,color:s.c}}>{s.v}</p>
              <p style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--txd)",letterSpacing:"0.08em"}}>{s.l}</p>
            </div>
          ))}
          <span style={{fontSize:11,color:"var(--txd)",marginLeft:2}}>{expanded?"▲":"▼"}</span>
        </div>
      </div>
      {/* Expanded */}
      {expanded&&(
        <div style={{borderTop:"1px solid var(--b)",padding:"16px 18px 18px",background:"var(--s2)",animation:"fu .2s ease"}}>
          <p style={{fontSize:10,color:"var(--txd)",fontFamily:"var(--fm)",letterSpacing:"0.1em",marginBottom:14}}>{fmtLong(entry.date)}</p>
          {/* Habits */}
          <div style={{marginBottom:14}}>
            <p style={{fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",fontFamily:"var(--fm)",marginBottom:8}}>Alışkanlıklar</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {habits.map(h=>{
                const done = entry.habits?.includes(h.text);
                const c = HABIT_CLR[h.text]||"var(--gold)";
                return <span key={h.id} style={{fontSize:11,padding:"3px 9px",borderRadius:12,background:done?`${c}12`:"var(--s3)",border:`1px solid ${done?`${c}30`:"var(--b)"}`,color:done?c:"var(--txd)",fontFamily:"var(--fb)"}}>{done?"✓":"○"} {h.text}</span>;
              })}
            </div>
          </div>
          {/* Morning */}
          <div style={{marginBottom:14}}>
            <p style={{fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",fontFamily:"var(--fm)",marginBottom:8}}>Sabah Ritüeli</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {morning.map(i=>{
                const done = entry.morning?.includes(i.text);
                return <span key={i.id} style={{fontSize:11,padding:"3px 9px",borderRadius:12,background:done?"var(--amber-s)":"var(--s3)",border:`1px solid ${done?"var(--amber-m)":"var(--b)"}`,color:done?"var(--amber)":"var(--txd)",fontFamily:"var(--fb)"}}>{done?"✓":"○"} {i.text}</span>;
              })}
            </div>
          </div>
          {/* Sessions */}
          {entry.sessions>0&&(
            <div style={{marginBottom:14}}>
              <p style={{fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",fontFamily:"var(--fm)",marginBottom:8}}>Derin Odak</p>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {Array.from({length:Math.min(entry.sessions,12)}).map((_,i)=>(
                  <div key={i} style={{width:22,height:22,borderRadius:6,background:"var(--violet-s)",border:"1px solid rgba(124,92,191,.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:9,color:"var(--violet)"}}>◉</span>
                  </div>
                ))}
                <span style={{fontSize:12,color:"var(--txm)",fontFamily:"var(--fm)",marginLeft:4}}>{entry.sessions} seans</span>
              </div>
            </div>
          )}
          {/* Journal */}
          {entry.answeredQs?.length>0&&(
            <div style={{marginBottom:14}}>
              <p style={{fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",fontFamily:"var(--fm)",marginBottom:8}}>Yanıtlanan Sorular</p>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {entry.answeredQs.map(qId=>(
                  <div key={qId} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:16,height:16,borderRadius:4,background:"var(--rose-s)",border:"1px solid rgba(184,92,110,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"var(--rose)",flexShrink:0}}>{qId}</span>
                    <span style={{fontSize:12,color:"var(--txm)",fontStyle:"italic"}}>{AP_LABELS[qId]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Score bar */}
          <div style={{paddingTop:12,borderTop:"1px solid var(--b)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:10,color:"var(--txd)",fontFamily:"var(--fm)"}}>Gün Skoru</span>
              <span style={{fontSize:10,color:sc,fontFamily:"var(--fm)"}}>{entry.dayScore}/100</span>
            </div>
            <div style={{height:3,background:"var(--s3)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${entry.dayScore}%`,background:sc,borderRadius:2}}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogSummary({ logs }) {
  if(!logs.length) return null;
  const avg     = Math.round(logs.reduce((s,e)=>s+e.dayScore,0)/logs.length);
  const perfect = logs.filter(e=>e.dayScore===100).length;
  const sessions= logs.reduce((s,e)=>s+(e.sessions||0),0);
  const totalXp = logs.reduce((s,e)=>s+(e.xpGained||0),0);
  const jDays   = logs.filter(e=>e.answeredQs?.length>0).length;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
      {[
        {label:"Ort. Skor",    val:avg,         color:scoreClr(avg),  sub:`${logs.length} günden`},
        {label:"Kusursuz Gün", val:perfect,      color:"var(--gold)",  sub:"100 puan"},
        {label:"Deep Work",    val:sessions,     color:"var(--violet)",sub:"toplam seans"},
        {label:"Kazanılan XP", val:`+${totalXp}`,color:"var(--gold)", sub:"bu dönem"},
        {label:"Journal Günü", val:jDays,        color:"var(--rose)",  sub:"soru yanıtlandı"},
      ].map(s=>(
        <div key={s.label} style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:12,padding:"14px 16px"}}>
          <p style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--txd)",marginBottom:5}}>{s.label}</p>
          <p style={{fontFamily:"var(--fd)",fontSize:24,fontWeight:600,color:s.color}}>{s.val}</p>
          <p style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--txd)",marginTop:2}}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

function ScoreTrend({ logs }) {
  if(logs.length<3) return null;
  const recent = [...logs].reverse().slice(-14);
  const max = 100;
  return (
    <div style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:14,padding:"16px 20px",marginBottom:18}}>
      <p style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)",marginBottom:12}}>Son 14 Günün Skor Trendi</p>
      <div style={{display:"flex",alignItems:"flex-end",gap:4,height:48}}>
        {recent.map((e,i)=>{
          const h = Math.max((e.dayScore/max)*48,3);
          const c = scoreClr(e.dayScore);
          return <div key={e.date} title={`${fmtShort(e.date)}: ${e.dayScore}`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{width:"100%",height:h,borderRadius:"3px 3px 0 0",background:c,opacity:.6+(i/recent.length)*.4,transition:"height .5s"}}/>
          </div>;
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
        <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--txd)"}}>{fmtShort(recent[0]?.date)}</span>
        <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--txd)"}}>{fmtShort(recent[recent.length-1]?.date)}</span>
      </div>
    </div>
  );
}

function Logs({ habits=[], morning=[] }) {
  const [logs, setLogs]       = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter]   = useState("all");
  const [loaded, setLoaded]   = useState(false);

  useEffect(()=>{
    (async()=>{ const d=await store.get("theos_logs")||[]; setLogs(d); setLoaded(true); })();
  },[]);

  const filtered = logs.filter(e =>
    filter==="perfect" ? e.dayScore===100 : filter==="good" ? e.dayScore>=70 : true
  );

  if(!loaded) return <div style={{textAlign:"center",padding:"60px 0",color:"var(--txd)",fontFamily:"var(--fm)",fontSize:12}}>Yükleniyor...</div>;

  if(!logs.length) return (
    <div style={{maxWidth:480,margin:"0 auto",textAlign:"center",padding:"64px 0"}}>
      <p style={{fontFamily:"var(--fd)",fontSize:26,fontStyle:"italic",color:"var(--tx)",marginBottom:12}}>Henüz log yok</p>
      <p style={{fontSize:13,color:"var(--txd)",lineHeight:1.8}}>Daily OS'ta günü tamamlayıp <strong style={{color:"var(--txm)"}}>Günü Kapat</strong> butonuna basınca ilk log otomatik kaydedilir.</p>
    </div>
  );

  return (
    <div>
      <div className="fu"><LogSummary logs={logs}/></div>
      <div className="fu1"><ScoreTrend logs={logs}/></div>
      <div className="fu1" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <p style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--txd)"}}>{filtered.length} kayıt</p>
        <div style={{display:"flex",gap:6}}>
          {[{k:"all",l:"Tümü"},{k:"good",l:"≥70 puan"},{k:"perfect",l:"Kusursuz"}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} style={{fontFamily:"var(--fm)",fontSize:11,padding:"4px 12px",borderRadius:14,border:`1px solid ${filter===f.k?"var(--gold)":"var(--b)"}`,background:filter===f.k?"var(--gold-s)":"transparent",color:filter===f.k?"var(--gold)":"var(--txd)",cursor:"pointer",transition:"all .2s"}}>{f.l}</button>
          ))}
        </div>
      </div>
      <div className="fu2" style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.length===0
          ? <p style={{textAlign:"center",padding:"28px 0",fontSize:13,color:"var(--txd)",fontStyle:"italic"}}>Bu filtreye uygun log bulunamadı.</p>
          : filtered.map(e=>(
            <LogCard key={e.date} entry={e} habits={habits} morning={morning}
              expanded={expanded===e.date} onToggle={()=>setExpanded(p=>p===e.date?null:e.date)}/>
          ))
        }
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  IDENTITY BANNER (header'da her tab'da görünür)
// ════════════════════════════════════════════════════════
const IdentityBanner = ({ stmt }) => !stmt ? null : (
  <div style={{borderBottom:"1px solid var(--b)",padding:"8px 28px",background:"rgba(201,168,76,.02)",display:"flex",alignItems:"center",gap:10}}>
    <span style={{fontSize:9,color:"var(--gold)",letterSpacing:"0.12em",textTransform:"uppercase",flexShrink:0,fontFamily:"var(--fm)"}}>Ben</span>
    <p style={{fontFamily:"var(--fd)",fontSize:14,fontStyle:"italic",color:"rgba(221,216,207,.55)",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{stmt}</p>
  </div>
);

// ════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════
const OLAY_TIPLERI = [
  { id: 'duygusal', label: 'Duygusal Tepki', icon: '⚡' },
  { id: 'hedef', label: 'Hedef Sapması', icon: '🎯' },
  { id: 'karar', label: 'Karar Anı', icon: '⚖️' },
  { id: 'davranis', label: 'Davranış Kalıbı', icon: '🔄' },
];

const CARPITMALAR = [
  'Felaketleştirme',
  'Siyah-beyaz düşünce',
  'Zihin okuma',
  'Aşırı genelleme',
  'Duygusal muhakeme',
  '"Yapmalıyım" tuzağı',
  'Kişiselleştirme',
  'Küçümseme',
  'Filtreleme',
];

const TABS = [
  {key:"daily",    label:"Daily OS",       icon:"◎"},
  {key:"identity", label:"Identity",       icon:"◈"},
  {key:"northstar",label:"North Star",     icon:"◉"},
  {key:"journal",  label:"Mind Journal",   icon:"◇"},
  {key:"progress", label:"Progress",       icon:"◆"},
  {key:"logs",     label:"Loglar",         icon:"◌"},
  {key:"metac",    label:"Metacognition",  icon:"◑"},
];

export default function App() {
  const [tab, setTab]           = useState("daily");
  const [identity, setIdentity] = useState(DEF_IDENTITY);
  const [northStar, setNS]      = useState(DEF_NORTHSTAR);
  const [morningDone, setMD]    = useState({});
  const [habitsDone, setHD]     = useState({});
  const [streak, setStreak]     = useState(0);
  const [xp, setXp]             = useState(0);
  const [level, setLevel]       = useState(1);
  const [sessions, setSessions] = useState(0);
  const [focusText, setFocusText] = useState("");
  const [loaded, setLoaded]     = useState(false);
  const [saved, setSaved]       = useState(true);
  const [mobOpen, setMobOpen]   = useState(false);
  const [theme, setTheme]       = useState(() => localStorage.getItem('os_theme') || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('os_theme', theme);
  }, [theme]);
  const [metacEvents, setMetacEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('metac_events') || '[]'); } catch { return []; }
  });
  const [checkIns, setCheckIns] = useState(() => {
    try { return JSON.parse(localStorage.getItem('checkins') || '[]'); } catch { return []; }
  });
  const [metacView, setMetacView] = useState('kayit');
  const [eventForm, setEventForm] = useState({
    type: '', olay: '', dusunce: '', carpitmalar: [], cerceve: '', yogunluk: 3
  });
  const [checkinForm, setCheckinForm] = useState({ his: '', engel: '', adim: '' });
  const [showEventSuccess, setShowEventSuccess] = useState(false);
  const saveT                   = useRef(null);

  /* ── Load ── */
  useEffect(()=>{
    (async()=>{
      const id  = await store.get("theos_identity");
      const ns  = await store.get("theos_northstar");
      const td  = await store.get(`theos_daily_${todayKey()}`);
      const st  = await store.get("theos_streak");
      const xpv = await store.get("theos_xp");
      const me  = await store.get("metac_events");
      const ci  = await store.get("checkins");
      if(id) setIdentity(id);
      if(ns) setNS(ns);
      if(td){ setMD(td.morningDone||{}); setHD(td.habitsDone||{}); }
      if(st) setStreak(st);
      if(xpv!=null){ setXp(xpv); setLevel(levelFromXp(xpv)); }
      if(Array.isArray(me)) setMetacEvents(me);
      if(Array.isArray(ci)) setCheckIns(ci);
      setLoaded(true);
    })();
  },[]);

  /* ── Auto-save ── */
  useEffect(()=>{
    if(!loaded)return;
    setSaved(false);
    clearTimeout(saveT.current);
    saveT.current = setTimeout(async()=>{
      await store.set("theos_identity",identity);
      await store.set("theos_northstar",northStar);
      await store.set(`theos_daily_${todayKey()}`,{morningDone,habitsDone});
      await store.set("theos_streak",streak);
      await store.set("theos_xp",xp);
      setSaved(true);
    },700);
  },[identity,northStar,morningDone,habitsDone,streak,xp,loaded]);

  /* ── Level up ── */
  useEffect(()=>{
    const newLvl = levelFromXp(xp);
    if(newLvl>level) setLevel(newLvl);
  },[xp]);

  const toggleMorning = (id) => setMD(p=>({...p,[id]:!p[id]}));
  const toggleHabit   = (id) => {
    const was = !!habitsDone[id];
    setHD(p=>({...p,[id]:!p[id]}));
    // XP sadece false→true geçişinde verilir, geri alımda düşmez
    if(!was) setXp(x=>x+50);
  };
  const handleEndDay = async () => {
    const today  = todayKey();
    const allM   = DEF_MORNING.every(i=>morningDone[i.id]);
    const allH   = DEF_HABITS.every(h=>habitsDone[h.id]);
    const mScore = DEF_MORNING.length ? Math.round(DEF_MORNING.filter(i=>morningDone[i.id]).length/DEF_MORNING.length*100) : 0;
    const hScore = DEF_HABITS.length  ? Math.round(DEF_HABITS.filter(h=>habitsDone[h.id]).length/DEF_HABITS.length*100)   : 0;
    const dayScore = Math.round((mScore+hScore)/2);

    let xpGained = 0;
    let newStreak = streak;
    if(allM&&allH){ xpGained=150; newStreak=streak+1; setStreak(newStreak); }
    else if(allH||allM){ xpGained=50; }
    xpGained += sessions*50;
    if(xpGained>0) setXp(x=>x+xpGained);

    // Journal cevapları
    const journalData = await store.get(`theos_ap_${today}`) || {};
    const answeredQs  = Object.keys(journalData).map(Number);

    // Log entry kaydet
    const entry = {
      date:      today,
      dayScore,
      habits:    DEF_HABITS.filter(h=>habitsDone[h.id]).map(h=>h.text),
      morning:   DEF_MORNING.filter(i=>morningDone[i.id]).map(i=>i.text),
      sessions,
      xpGained,
      answeredQs,
      streak:    newStreak,
      timestamp: new Date().toISOString(),
    };
    const existing = await store.get("theos_logs") || [];
    await store.set("theos_logs", [entry, ...existing.filter(e=>e.date!==today)].slice(0,90));

    // Sıfırla
    setMD({}); setHD({}); setSessions(0);
  };

  const saveMetacEvent = () => {
    if (!eventForm.type || !eventForm.olay || !eventForm.dusunce) return;
    const newEvent = { id: Date.now(), date: new Date().toISOString(), ...eventForm };
    const updated = [newEvent, ...metacEvents];
    setMetacEvents(updated);
    store.set('metac_events', updated);
    setEventForm({ type: '', olay: '', dusunce: '', carpitmalar: [], cerceve: '', yogunluk: 3 });
    setShowEventSuccess(true);
    setTimeout(() => setShowEventSuccess(false), 2500);
  };

  const saveCheckIn = () => {
    if (!checkinForm.his) return;
    const newCI = { id: Date.now(), date: new Date().toISOString(), ...checkinForm };
    const updated = [newCI, ...checkIns];
    setCheckIns(updated);
    store.set('checkins', updated);
    setCheckinForm({ his: '', engel: '', adim: '' });
  };

  const getCarpitmaStats = () => {
    const counts = {};
    metacEvents.forEach(e => e.carpitmalar?.forEach(c => { counts[c] = (counts[c] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const getOlayTipStats = () => {
    const counts = { duygusal: 0, hedef: 0, karar: 0, davranis: 0 };
    metacEvents.forEach(e => { if (counts[e.type] !== undefined) counts[e.type]++; });
    return counts;
  };

  const getLast7DaysCheckIns = () => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const ci = checkIns.find(c => c.date.startsWith(dateStr));
      return { date: dateStr, label: d.toLocaleDateString('tr-TR', { weekday: 'short' }), ci };
    });
  };

  const activeTab = TABS.find(t=>t.key===tab);

  return (
    <>
      <G/>
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>

        {/* ── Mobile overlay & panel ── */}
        {mobOpen && (
          <>
            <div className="mob-overlay" onClick={()=>setMobOpen(false)}/>
            <div className="mob-nav-panel">
              <div style={{padding:"0 16px 12px",borderBottom:"1px solid var(--b)",marginBottom:8}}>
                <span style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:600,color:"var(--tx)"}}>The OS</span>
              </div>
              {TABS.map(t=>(
                <button key={t.key} onClick={()=>{setTab(t.key);setMobOpen(false);}}
                  style={{fontFamily:"var(--fm)",fontSize:13,padding:"12px 20px",border:"none",cursor:"pointer",background:tab===t.key?"var(--s2)":"transparent",color:tab===t.key?"var(--tx)":"var(--txm)",textAlign:"left",display:"flex",alignItems:"center",gap:10,borderLeft:`3px solid ${tab===t.key?"var(--gold)":"transparent"}`,transition:"all .2s"}}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
              <div style={{marginTop:"auto",padding:"12px 16px",borderTop:"1px solid var(--b)"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--txd)",textAlign:"center"}}>The OS</div>
              </div>
            </div>
          </>
        )}

        {/* ── Header ── */}
        <header style={{borderBottom:"1px solid var(--b)",position:"sticky",top:0,zIndex:50,background:"var(--nav-bg)",backdropFilter:"blur(14px)",paddingTop:"env(safe-area-inset-top)"}}>
          <div className="header-pad" style={{maxWidth:940,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"var(--nav)"}}>
            {/* Logo */}
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:600,color:"var(--tx)"}}>The OS</span>
              <div style={{width:1,height:13,background:"var(--bh)"}}/>
              <span style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--txm)",letterSpacing:"0.1em"}}>{ activeTab?.label.toUpperCase()}</span>
            </div>
            {/* Desktop Nav */}
            <nav className="desk-nav" style={{display:"flex",gap:1}}>
              {TABS.map(t=>(
                <button key={t.key} onClick={()=>setTab(t.key)} style={{fontFamily:"var(--fm)",fontSize:11,padding:"6px 14px",borderRadius:6,border:"none",cursor:"pointer",background:tab===t.key?"var(--s2)":"transparent",color:tab===t.key?"var(--tx)":"var(--txm)",borderBottom:`2px solid ${tab===t.key?"var(--gold)":"transparent"}`,transition:"all .2s",letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:5,marginBottom:"-1px"}}>
                  <span style={{opacity:.7}}>{t.icon}</span> {t.label}
                </button>
              ))}
            </nav>
            {/* Right side */}
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} title="Tema değiştir" style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--txd)",fontSize:14,padding:"4px 6px",borderRadius:6,lineHeight:1}}>{theme==='dark'?'☀':'🌙'}</button>
              <button onClick={signOut} title="Çıkış yap" style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--txd)",fontSize:14,padding:"4px 6px",borderRadius:6,lineHeight:1}}>⎋</button>
              <SaveDot saved={saved}/>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--s2)",border:"1px solid var(--gold-m)",padding:"5px 12px",borderRadius:14}}>
                <span className="gold-text" style={{fontFamily:"var(--fd)",fontSize:14,fontWeight:600}}>{xp.toLocaleString()} XP</span>
                <div style={{width:1,height:11,background:"var(--bh)"}}/>
                <span style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--txm)"}}>🔥 {streak}</span>
              </div>
              {/* Hamburger — mobile only */}
              <button className="mob-menu" onClick={()=>setMobOpen(o=>!o)}
                style={{width:36,height:36,borderRadius:8,border:"1px solid var(--b)",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
                {[0,1,2].map(i=><div key={i} style={{width:16,height:1.5,background:"var(--txm)",borderRadius:1}}/>)}
              </button>
            </div>
          </div>
          {/* Identity banner */}
          <IdentityBanner stmt={identity.statement}/>
        </header>

        {/* ── Content ── */}
        <main className="main-pad" style={{maxWidth:940,margin:"0 auto",padding:"32px 24px 80px"}}>
          {tab==="identity"  && <IdentityCore data={identity} onChange={setIdentity}/>}
          {tab==="northstar" && <NorthStar data={northStar} onChange={setNS}/>}
          {tab==="daily"     && <DailyOS morningItems={DEF_MORNING} morningDone={morningDone} onToggleMorning={toggleMorning} habits={DEF_HABITS} habitsDone={habitsDone} onToggleHabit={toggleHabit} streak={streak} onEndDay={handleEndDay} xp={xp} setXp={setXp} sessions={sessions} setSessions={setSessions} focusText={focusText} setFocusText={setFocusText}/>}
          {tab==="journal"   && <MindJournal/>}
          {tab==="progress"  && <Progress xp={xp} streak={streak}/>}
          {tab==="logs"      && <Logs habits={DEF_HABITS} morning={DEF_MORNING}/>}
          {tab==="metac" && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '0.25rem' }}>
        Metacognition
      </h2>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--zinc-400)' }}>
        Düşünceni gözlemle. Kalıpları gör. Yeniden çerçevele.
      </p>
    </div>

    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {[
        { id: 'kayit', label: 'Olay Kaydı' },
        { id: 'checkin', label: 'Check-in' },
        { id: 'oruntu', label: 'Örüntüler' },
        { id: 'review', label: 'Haftalık Review' },
      ].map(v => (
        <button key={v.id} onClick={() => setMetacView(v.id)} style={{
          padding: '0.4rem 1rem',
          borderRadius: '999px',
          border: metacView === v.id ? '1px solid var(--gold)' : '1px solid var(--zinc-700)',
          background: metacView === v.id ? 'var(--gold)' : 'transparent',
          color: metacView === v.id ? 'var(--zinc-900)' : 'var(--zinc-300)',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.8rem',
          cursor: 'pointer',
          fontWeight: metacView === v.id ? 700 : 400,
        }}>{v.label}</button>
      ))}
    </div>

    {metacView === 'kayit' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-700)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: 'var(--zinc-200)', marginBottom: 0 }}>Yeni Olay Kaydı</p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {OLAY_TIPLERI.map(t => (
              <button key={t.id} onClick={() => setEventForm(f => ({ ...f, type: t.id }))} style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '8px',
                border: eventForm.type === t.id ? '1px solid var(--gold)' : '1px solid var(--zinc-700)',
                background: eventForm.type === t.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                color: eventForm.type === t.id ? 'var(--gold)' : 'var(--zinc-400)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}>{t.icon} {t.label}</button>
            ))}
          </div>

          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', display: 'block', marginBottom: '0.3rem' }}>Ne oldu?</label>
            <textarea value={eventForm.olay} onChange={e => setEventForm(f => ({ ...f, olay: e.target.value }))}
              placeholder="Durumu kısaca anlat..." rows={2}
              style={{ width: '100%', background: 'var(--zinc-800)', border: '1px solid var(--zinc-700)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'var(--zinc-200)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', display: 'block', marginBottom: '0.3rem' }}>İlk düşüncem / tepkim ne oldu?</label>
            <textarea value={eventForm.dusunce} onChange={e => setEventForm(f => ({ ...f, dusunce: e.target.value }))}
              placeholder="Aklından geçenleri yaz..." rows={2}
              style={{ width: '100%', background: 'var(--zinc-800)', border: '1px solid var(--zinc-700)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'var(--zinc-200)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', display: 'block', marginBottom: '0.5rem' }}>Bilişsel çarpıtma var mı? (varsa işaretle)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {CARPITMALAR.map(c => {
                const selected = eventForm.carpitmalar.includes(c);
                return (
                  <button key={c} onClick={() => setEventForm(f => ({
                    ...f,
                    carpitmalar: selected ? f.carpitmalar.filter(x => x !== c) : [...f.carpitmalar, c]
                  }))} style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    border: selected ? '1px solid #e05252' : '1px solid var(--zinc-700)',
                    background: selected ? 'rgba(224,82,82,0.15)' : 'transparent',
                    color: selected ? '#e05252' : 'var(--zinc-500)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}>{c}</button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', display: 'block', marginBottom: '0.3rem' }}>
              Duygusal yoğunluk: <span style={{ color: 'var(--gold)', fontFamily: 'DM Mono, monospace' }}>{eventForm.yogunluk}/5</span>
            </label>
            <input type="range" min={1} max={5} value={eventForm.yogunluk}
              onChange={e => setEventForm(f => ({ ...f, yogunluk: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--gold)' }} />
          </div>

          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', display: 'block', marginBottom: '0.3rem' }}>Daha gerçekçi / dengeli bir bakış ne olurdu?</label>
            <textarea value={eventForm.cerceve} onChange={e => setEventForm(f => ({ ...f, cerceve: e.target.value }))}
              placeholder="Alternatif perspektif..." rows={2}
              style={{ width: '100%', background: 'var(--zinc-800)', border: '1px solid var(--zinc-700)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'var(--zinc-200)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <button onClick={saveMetacEvent} style={{
            padding: '0.65rem 1.5rem', background: 'var(--gold)', border: 'none', borderRadius: '8px',
            color: 'var(--zinc-900)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
            fontSize: '0.85rem', cursor: 'pointer', alignSelf: 'flex-start',
          }}>Kaydet</button>

          {showEventSuccess && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4ade80' }}>✓ Olay kaydedildi.</p>
          )}
        </div>

        {metacEvents.length > 0 && (
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', marginBottom: '0.8rem' }}>Son olaylar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metacEvents.slice(0, 5).map(ev => {
                const tip = OLAY_TIPLERI.find(t => t.id === ev.type);
                return (
                  <div key={ev.id} style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-800)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--gold)' }}>{tip?.icon} {tip?.label}</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--zinc-600)' }}>
                        {new Date(ev.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--zinc-300)', margin: '0 0 0.3rem' }}>{ev.olay}</p>
                    {ev.carpitmalar?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                        {ev.carpitmalar.map(c => (
                          <span key={c} style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: '#e05252', fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem' }}>{c}</span>
                        ))}
                      </div>
                    )}
                    {ev.cerceve && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4ade80', marginTop: '0.5rem', borderLeft: '2px solid #4ade80', paddingLeft: '0.5rem' }}>
                        {ev.cerceve}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}

    {metacView === 'checkin' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {getLast7DaysCheckIns().map(d => (
            <div key={d.date} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '8px',
                background: d.ci ? 'rgba(212,175,55,0.25)' : 'var(--zinc-800)',
                border: d.ci ? '1px solid var(--gold)' : '1px solid var(--zinc-700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', marginBottom: '0.25rem',
              }}>{d.ci ? '✓' : '·'}</div>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--zinc-500)' }}>{d.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-700)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: 'var(--zinc-200)', marginBottom: 0 }}>
            {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} Check-in
          </p>

          {[
            { key: 'his', label: 'Şu an nasıl hissediyorsun?', placeholder: 'Düşünce, his, enerji seviyesi...' },
            { key: 'engel', label: 'Seni durduran bir şey var mı?', placeholder: 'Bir korku, şüphe, erteleme...' },
            { key: 'adim', label: 'Bir sonraki küçük adım ne?', placeholder: 'Somut, yapılabilir bir şey...' },
          ].map(q => (
            <div key={q.key}>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', display: 'block', marginBottom: '0.3rem' }}>{q.label}</label>
              <textarea value={checkinForm[q.key]} onChange={e => setCheckinForm(f => ({ ...f, [q.key]: e.target.value }))}
                placeholder={q.placeholder} rows={2}
                style={{ width: '100%', background: 'var(--zinc-800)', border: '1px solid var(--zinc-700)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'var(--zinc-200)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
          ))}

          <button onClick={saveCheckIn} style={{
            padding: '0.65rem 1.5rem', background: 'var(--gold)', border: 'none', borderRadius: '8px',
            color: 'var(--zinc-900)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
            fontSize: '0.85rem', cursor: 'pointer', alignSelf: 'flex-start',
          }}>Check-in Yap</button>
        </div>

        {checkIns.slice(0, 3).map(ci => (
          <div key={ci.id} style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-800)', borderRadius: '10px', padding: '1rem' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--zinc-600)', marginBottom: '0.5rem' }}>
              {new Date(ci.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--zinc-300)', margin: '0 0 0.25rem' }}>💭 {ci.his}</p>
            {ci.engel && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'var(--zinc-500)', margin: '0 0 0.25rem' }}>🧱 {ci.engel}</p>}
            {ci.adim && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4ade80', margin: 0 }}>→ {ci.adim}</p>}
          </div>
        ))}
      </div>
    )}

    {metacView === 'oruntu' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {metacEvents.length === 0 ? (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--zinc-500)', textAlign: 'center', padding: '3rem 0' }}>
            Henüz kaydedilen olay yok. Olay Kaydı bölümünden başla.
          </p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Toplam Olay', value: metacEvents.length },
                { label: 'Check-in', value: checkIns.length },
                { label: 'En çok çarpıtma', value: getCarpitmaStats()[0]?.[0]?.split(' ')[0] || '—' },
                { label: 'Ort. Yoğunluk', value: metacEvents.length ? (metacEvents.reduce((a, e) => a + (e.yogunluk || 3), 0) / metacEvents.length).toFixed(1) : '—' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-800)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.4rem', color: 'var(--gold)', margin: '0 0 0.2rem' }}>{s.value}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--zinc-500)', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-800)', borderRadius: '12px', padding: '1.2rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', marginBottom: '1rem' }}>Olay tipi dağılımı</p>
              {OLAY_TIPLERI.map(t => {
                const count = getOlayTipStats()[t.id] || 0;
                const max = Math.max(...Object.values(getOlayTipStats()), 1);
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-400)', width: '110px', flexShrink: 0 }}>{t.icon} {t.label}</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--zinc-800)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: 'var(--gold)', borderRadius: '3px', transition: 'width 0.4s' }} />
                    </div>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--zinc-500)', width: '20px', textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {getCarpitmaStats().length > 0 && (
              <div style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-800)', borderRadius: '12px', padding: '1.2rem' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--zinc-500)', marginBottom: '1rem' }}>En sık görülen bilişsel çarpıtmalar</p>
                {getCarpitmaStats().slice(0, 6).map(([name, count]) => {
                  const maxC = getCarpitmaStats()[0]?.[1] || 1;
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.73rem', color: 'var(--zinc-400)', width: '130px', flexShrink: 0 }}>{name}</span>
                      <div style={{ flex: 1, height: '6px', background: 'var(--zinc-800)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / maxC) * 100}%`, background: '#e05252', borderRadius: '3px', transition: 'width 0.4s' }} />
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--zinc-500)', width: '20px', textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    )}

    {metacView === 'review' && (
      <div style={{ background: 'var(--zinc-900)', border: '1px solid var(--zinc-700)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: 0 }}>Haftalık Metacognition Review</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--zinc-500)', marginTop: '-0.5rem' }}>
          Bu hafta kaydettiğin {metacEvents.filter(e => {
            const d = new Date(e.date);
            const now = new Date();
            const diff = (now - d) / (1000 * 60 * 60 * 24);
            return diff <= 7;
          }).length} olay var.
        </p>

        {[
          { key: 'metaR1', label: 'Bu hafta hangi düşünce kalıbı en çok öne çıktı?' },
          { key: 'metaR2', label: 'Bir olayda otopilottaydın — fark ettiğin an ne oldu?' },
          { key: 'metaR3', label: 'Hangi çarpıtmayı tekrarlıyorsun? Kökeninde ne olabilir?' },
          { key: 'metaR4', label: 'Gelecek hafta daha bilinçli olmak istediğin bir alan nedir?' },
          { key: 'metaR5', label: 'Kendine adil bir tanık olabildin mi bu hafta?' },
        ].map(q => {
          const storageKey = `os_meta_review_${new Date().toISOString().slice(0, 10)}_${q.key}`;
          const savedVal = localStorage.getItem(storageKey) || '';
          return (
            <div key={q.key}>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--zinc-400)', display: 'block', marginBottom: '0.4rem' }}>{q.label}</label>
              <textarea defaultValue={savedVal}
                onBlur={e => localStorage.setItem(storageKey, e.target.value)}
                rows={3}
                style={{ width: '100%', background: 'var(--zinc-800)', border: '1px solid var(--zinc-700)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'var(--zinc-200)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
          );
        })}
      </div>
    )}
  </div>
)}
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="mob-tabbar" style={{display:"none"}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{flex:1,padding:"6px 2px 2px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:tab===t.key?"var(--gold)":"var(--txd)",transition:"color .2s"}}>
              <span style={{fontSize:16}}>{t.icon}</span>
              <span style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.05em"}}>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
