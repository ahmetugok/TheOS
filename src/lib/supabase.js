// src/lib/supabase.js
// Auth kaldırıldı — sadece localStorage

export const store = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },

  async set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },

  async delete(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};
