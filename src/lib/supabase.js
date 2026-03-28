// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  ?? 'https://placeholder.supabase.co';
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ─────────────────────────────────────────
   STORE — localStorage'ın Supabase versiyonu
   Kullanımı birebir aynı: store.get(key), store.set(key, value)
   Tüm veriler user_data tablosunda key-value olarak tutulur.
───────────────────────────────────────── */
export const store = {
  async get(key) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return localGet(key);

      const { data, error } = await supabase
        .from('user_data')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data?.value ?? null;
    } catch (e) {
      console.warn('store.get fallback to localStorage:', e);
      return localGet(key);
    }
  },

  async set(key, value) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return localSet(key, value);

      const { error } = await supabase
        .from('user_data')
        .upsert(
          { user_id: user.id, key, value },
          { onConflict: 'user_id,key' }
        );

      if (error) throw error;
      // Lokal cache de güncelle (offline fallback)
      localSet(key, value);
    } catch (e) {
      console.warn('store.set fallback to localStorage:', e);
      localSet(key, value);
    }
  },

  async delete(key) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('user_data')
        .delete()
        .eq('user_id', user.id)
        .eq('key', key);
      localStorage.removeItem(`theos_${key}`);
    } catch (e) {
      console.warn('store.delete error:', e);
    }
  }
};

// localStorage yardımcıları (offline fallback)
const localGet = (key) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};

const localSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
