import { createClient } from '@supabase/supabase-js';

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SB_URL, SB_KEY);

const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;
  let id = localStorage.getItem('os_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('os_device_id', id);
  }
  return id;
};

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password });

export const signOut = () => supabase.auth.signOut();

export const store = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('value')
        .eq('user_id', await getUserId())
        .eq('key', key)
        .single();

      if (!error && data != null) {
        localStorage.setItem(key, JSON.stringify(data.value));
        return data.value;
      }
    } catch {}

    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },

  async set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    try {
      await supabase
        .from('user_data')
        .upsert(
          { user_id: await getUserId(), key, value },
          { onConflict: 'user_id,key' }
        );
    } catch {}
  },

  async delete(key) {
    try { localStorage.removeItem(key); } catch {}
    try {
      await supabase
        .from('user_data')
        .delete()
        .eq('user_id', await getUserId())
        .eq('key', key);
    } catch {}
  },
};
