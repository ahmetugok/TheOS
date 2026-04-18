import { useEffect, useState } from 'react';
import { supabase, signIn, signUp } from './lib/supabase';
import TheOS from '../TheOS_Complete.jsx';

const S = {
  wrap: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '14px',
    background: '#0a0a0b', color: '#e8e3da', fontFamily: 'system-ui, sans-serif',
  },
  input: {
    padding: '10px 16px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)', color: '#e8e3da',
    fontSize: '15px', width: '280px', outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    padding: '10px 0', borderRadius: '8px', border: 'none',
    background: '#c8a86b', color: '#0a0a0b', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer', width: '280px',
  },
  link: {
    background: 'none', border: 'none', color: '#a09890',
    fontSize: '13px', cursor: 'pointer', textDecoration: 'underline',
  },
  err: { color: '#e07070', fontSize: '13px', maxWidth: '280px', textAlign: 'center' },
};

export default function App() {
  const [session, setSession] = useState(undefined);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (session) return <TheOS />;

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    if (mode === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.message);
    } else {
      const { error: err } = await signUp(email, password);
      if (err) setError(err.message);
      else setSignedUp(true);
    }
    setLoading(false);
  }

  if (signedUp) {
    return (
      <div style={S.wrap}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>Daily OS</h2>
        <p style={{ color: '#a09890', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>
          Kayıt başarılı! E-postanı onayla, ardından giriş yap.
        </p>
        <button style={S.link} onClick={() => { setSignedUp(false); setMode('login'); }}>
          Giriş ekranına dön
        </button>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '0.05em' }}>Daily OS</h2>
      <input
        style={S.input} type="email" placeholder="E-posta"
        value={email} onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        autoComplete="email"
      />
      <input
        style={S.input} type="password" placeholder="Şifre"
        value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      {error && <p style={S.err}>{error}</p>}
      <button style={S.btn} onClick={handleSubmit} disabled={loading}>
        {loading ? '…' : mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
      </button>
      <button style={S.link} onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}>
        {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
      </button>
    </div>
  );
}
