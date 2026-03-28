// src/Auth.jsx
import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function Auth() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080809;color:#ddd8cf;font-family:'DM Sans',sans-serif;}
        input{font-family:'DM Sans',sans-serif;}
        input::placeholder{color:#4a4845;}
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#080809',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 36, fontWeight: 600,
              color: '#ddd8cf', marginBottom: 8,
            }}>
              The OS
            </h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 15, fontStyle: 'italic',
              color: '#4a4845', lineHeight: 1.6,
            }}>
              "You don't need more motivation.<br/>
              You need a system."
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 12 }}>
                <label style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#4a4845',
                  display: 'block', marginBottom: 8,
                }}>
                  E-posta
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sen@domain.com"
                  required
                  style={{
                    width: '100%',
                    background: '#0f0f11',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 10, padding: '12px 16px',
                    fontSize: 14, color: '#ddd8cf',
                    outline: 'none', transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                />
              </div>

              {error && (
                <p style={{
                  fontSize: 12, color: '#b85c6e',
                  marginBottom: 12, fontFamily: "'DM Mono', monospace",
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#1c1c1f' : '#c9a84c',
                  color: loading ? '#4a4845' : '#080809',
                  border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'all .2s',
                }}
              >
                {loading ? 'Gönderiliyor...' : 'Magic Link Gönder →'}
              </button>

              <p style={{
                fontSize: 12, color: '#4a4845',
                textAlign: 'center', marginTop: 16, lineHeight: 1.6,
              }}>
                Şifre yok. E-postana gelen linke tıklaman yeterli.
              </p>
            </form>
          ) : (
            <div style={{
              background: '#0f0f11',
              border: '1px solid rgba(201,168,76,.2)',
              borderRadius: 14, padding: '28px 24px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 28, marginBottom: 16 }}>✉️</p>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20, fontStyle: 'italic',
                color: '#ddd8cf', marginBottom: 10,
              }}>
                Link gönderildi
              </p>
              <p style={{ fontSize: 13, color: '#8a8580', lineHeight: 1.7 }}>
                <strong style={{ color: '#c9a84c' }}>{email}</strong> adresine<br/>
                giriş linki gönderdik. Maili aç ve linke tıkla.
              </p>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: 20, fontSize: 12,
                  color: '#4a4845', background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace",
                  textDecoration: 'underline',
                }}
              >
                Farklı e-posta kullan
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
