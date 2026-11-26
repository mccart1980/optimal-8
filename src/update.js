/* ================================================================
   KEEPING THE APP UP TO DATE

   The app keeps a copy of itself on the phone, so it opens with no
   signal. Left to itself, a phone looks for a newer copy only when it
   chooses to, and a home-screen app on an iPhone can go hours without
   looking. So the app asks: every time it comes onto the screen, and
   every half hour while it's open. A newer copy downloads in the
   background; once it has taken over, the app reloads into it. Never
   while a clock is running or a box is being typed in: then it waits
   for the next time the app comes onto the screen.

   Nothing here touches what's stored on the phone: a reload reads it
   all back, and opens on the screen the day was left on.
   ================================================================ */
const EVERY = 30 * 60 * 1000;

/* the app says when a reload would lose something: a clock running */
let busy = () => false;
export const whileBusy = (fn) => { busy = typeof fn === "function" ? fn : () => false; };
const typing = (doc) => { const a = doc.activeElement; return !!a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA"); };

let reg0 = null;
/* `env` is for the tests: the service worker, the page, how to reload,
   how often to look */
export function keepUpToDate(env) {
  const e = env || {};
  const sw = e.sw || (typeof navigator !== "undefined" ? navigator.serviceWorker : null);
  const doc = e.doc || (typeof document !== "undefined" ? document : null);
  const reload = e.reload || (() => window.location.reload());
  if (!sw || !doc) return null;
  /* a phone opening the app for the first time isn't reloaded: what it has is the newest */
  let had = !!sw.controller, pending = false;
  const go = () => { if (busy() || typing(doc)) { pending = true; return; } pending = false; reload(); };
  const check = () => { if (reg0) reg0.update().catch(() => {}); };
  sw.addEventListener("controllerchange", () => { if (had) go(); had = true; });
  doc.addEventListener("visibilitychange", () => { if (doc.visibilityState !== "visible") return; if (pending) go(); else check(); });
  const id = setInterval(() => { if (doc.visibilityState === "visible" && !pending) check(); }, e.every || EVERY);
  Promise.resolve(sw.ready).then((r) => { if (r) { reg0 = r; check(); } }).catch(() => {});
  return { check, stop: () => { clearInterval(id); reg0 = null; } };
}

/* Settings' button: look for a newer copy now.
   "new": one is downloading · "same": this is the newest
   "offline": couldn't reach the internet · "none": not installed for offline use */
export async function checkNow(env) {
  const sw = (env && env.sw) || (typeof navigator !== "undefined" ? navigator.serviceWorker : null);
  let r = env && env.sw ? null : reg0;
  if (!r && sw && sw.getRegistration) { try { r = await sw.getRegistration(); } catch (err) { r = null; } }
  if (!r) return "none";
  try { await r.update(); } catch (err) { return "offline"; }
  return r.installing || r.waiting ? "new" : "same";
}
export const CHECK_SAID = {
  new: "A newer copy is downloading. The app refreshes itself once it's in, unless a clock is running.",
  same: "This is the newest copy.",
  offline: "Couldn't reach the internet. Try again with signal.",
  none: "This copy isn't kept on the phone for offline use, so there's nothing to update.",
};

/* which copy this is: the commit it was built from, and when, set at
   build time (vite.config.js); none when it wasn't built for the phone */
/* global __BUILD__ */
export const BUILD = typeof __BUILD__ !== "undefined" ? __BUILD__ : null;
export const buildSay = (b) => {
  if (!b || !b.sha) return "Not a published copy.";
  let when = "";
  try { when = new Date(b.at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (err) { when = String(b.at || ""); }
  return "Version " + b.sha + (when ? " · published " + when : "");
};
