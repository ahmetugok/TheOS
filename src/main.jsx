// src/main.jsx
import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import App from './App';
import Auth from './Auth';

function Root() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor

  useEffect(() => {
    // Mevcut oturumu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Oturum değişikliklerini dinle (magic link dönüşü dahil)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  // Yükleniyor
  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100vh', background: '#080809',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#c9a84c', opacity: 0.6,
          animation: 'pulse 1.2s infinite',
        }} />
        <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.8}}`}</style>
      </div>
    );
  }

  // Giriş yapılmamış
  if (!session) return <Auth />;

  // Giriş yapılmış → uygulamayı göster
  return <App session={session} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
