import { createClient } from '@supabase/supabase-js';

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SB_URL, SB_KEY);

// Stable device ID — auth olmadan user_id olarak kullanılır
const getDeviceId = () => {
  let id = localStorage.getItem('os_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('os_device_id', id);
  }
  return id;
};

export const store = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('value')
        .eq('user_id', getDeviceId())
        .eq('key', key)
        .single();

      if (!error && data != null) {
        localStorage.setItem(key, JSON.stringify(data.value));
        return data.value;
      }
    } catch { /* ağ hatası — localStorage'a düş */ }

    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },

  async set(key, value) {
    // localStorage'ı anında güncelle
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}

    try {
      await supabase
        .from('user_data')
        .upsert(
          { user_id: getDeviceId(), key, value },
          { onConflict: 'user_id,key' }
        );
    } catch { /* localStorage zaten güncellendi */ }
  },

  async delete(key) {
    try { localStorage.removeItem(key); } catch {}
    try {
      await supabase
        .from('user_data')
        .delete()
        .eq('user_id', getDeviceId())
        .eq('key', key);
    } catch {}
  },
};
