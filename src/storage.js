/* ================================================================
   STORAGE SHIM
   The original artifact ran inside claude.ai and used window.storage:
     get(key)     -> Promise<{ key, value } | null>
     set(key, v)  -> Promise<void>
     delete(key)  -> Promise<void>
     list(prefix) -> Promise<{ keys: string[] }>
   This is the same API backed by localStorage, so load()/save() in
   App.jsx work unchanged and the existing "o8s-…" keys are preserved.
   If localStorage is unavailable (private mode, blocked cookies) it
   quietly falls back to memory for the life of the page.
   ================================================================ */
const mem = new Map();

function backing() {
  try {
    const t = "__o8s_probe__";
    window.localStorage.setItem(t, "1");
    window.localStorage.removeItem(t);
    return window.localStorage;
  } catch (e) {
    return null;
  }
}

const storage = {
  async get(key) {
    const ls = backing();
    const value = ls ? ls.getItem(key) : mem.has(key) ? mem.get(key) : null;
    if (value === null || value === undefined) return null;
    return { key, value };
  },
  async set(key, value) {
    const v = String(value);
    const ls = backing();
    if (ls) ls.setItem(key, v); else mem.set(key, v);
  },
  async delete(key) {
    const ls = backing();
    if (ls) ls.removeItem(key); else mem.delete(key);
  },
  async list(prefix) {
    const p = prefix || "";
    const ls = backing();
    const all = ls ? Object.keys(ls) : Array.from(mem.keys());
    return { keys: all.filter((k) => k.indexOf(p) === 0) };
  },
};

if (typeof window !== "undefined" && !window.storage) window.storage = storage;

export default storage;
