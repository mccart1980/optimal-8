import React, { useEffect, useState } from "react";

/* ================================================================
   THE DESIGN SYSTEM — one place for the colours, the type, the
   spacing, the corners, the motion, the icons and the shared pieces
   every screen is built from. Nothing on a screen picks its own.

   COLOUR. Dark is the main look: a black page, cards one step up,
   white text. Three colours carry meaning and nothing else is
   coloured:
     accent (lime)  — go: the button to press, what's picked, progress, done
     warn   (amber) — wait: a rest, a heads-up, a yellow morning
     bad    (red)   — hard or stop: a work interval, a pain stop, an error
   The older names stay as other names for these, so the programme's
   own files and every older screen follow without being touched:
   brass, moss, cobalt and violet are the accent; oxide is the red.
   Every colour used as text clears 4.5:1 on the page, the bars and
   the cards, in both themes.
   ================================================================ */
export const THEMES = {
  dark: {
    ink: "#000000", bar: "#0C0D0F", card: "#141518", card2: "#1E2024", line: "#2A2D33", ash: "#A0A5B0", chalk: "#F5F6F8", on: "#050505",
    accent: "#C5F240", warn: "#FFB629", bad: "#FF6257",
    softAccent: "#323B1F", softWarn: "#3C301B", softBad: "#412424", softAsh: "#28292C", softChalk: "#38393C", thumb: "#3A3E47", ring: "#6B7280",
    raise: "#1E2024",                                                // a row or a box that sits on the page itself, not on a card
    markLit: "#F5F6F8", markShade: "#A0A5B0",                        // the bull, where it's drawn in the app
  },
  light: {
    ink: "#F3F4F6", bar: "#FFFFFF", card: "#FFFFFF", card2: "#F3F4F6", line: "#E1E4E9", ash: "#565D69", chalk: "#0B0C0E", on: "#FFFFFF",
    accent: "#1D7044", warn: "#8F5300", bad: "#CC1F45",
    softAccent: "#E4EEE9", softWarn: "#F2EAE0", softBad: "#FAE8EC", softAsh: "#F0F0F1", softChalk: "#E7E7E7", thumb: "#FFFFFF", ring: "#858C98",
    raise: "#FFFFFF",
    markLit: "#0B0C0E", markShade: "#565D69",
  },
};
/* what isn't a flat colour: the glass of the bars, the edge of a card, the shadows, the dimming behind a sheet */
const EXTRA = {
  dark: { glass: "rgba(0,0,0,.82)", edge: "rgba(255,255,255,.05)", shadow: "0 0 0 rgba(0,0,0,0)", lift: "0 -10px 40px rgba(0,0,0,.6)", scrim: "rgba(0,0,0,.66)" },
  light: { glass: "rgba(255,255,255,.9)", edge: "#E1E4E9", shadow: "0 1px 2px rgba(11,12,14,.04)", lift: "0 -8px 30px rgba(11,12,14,.14)", scrim: "rgba(11,12,14,.45)" },
};
/* the older names, each another name for one of the three */
const SAME = { brass: "accent", moss: "accent", cobalt: "accent", violet: "accent", oxide: "bad",
  softBrass: "softAccent", softMoss: "softAccent", softCobalt: "softAccent", softViolet: "softAccent", softOxide: "softBad" };
const kebab = (k) => k.replace(/[A-Z0-9]/g, (m) => "-" + m.toLowerCase());
const varsOf = (name) => Object.keys(THEMES[name]).map((k) => "--o8-" + kebab(k) + ": " + THEMES[name][k] + ";").join(" ")
  + " " + Object.keys(EXTRA[name]).map((k) => "--o8-" + k + ": " + EXTRA[name][k] + ";").join(" ");
const cv = (k) => "var(--o8-" + kebab(SAME[k] || k) + ")";
export const C = {
  ink: cv("ink"), slab: cv("glass"), card: cv("card"), card2: cv("card2"), line: cv("line"), edge: cv("edge"), ash: cv("ash"), chalk: cv("chalk"), on: cv("on"),
  accent: cv("accent"), warn: cv("warn"), bad: cv("bad"),
  moss: cv("moss"), oxide: cv("oxide"), brass: cv("brass"), cobalt: cv("cobalt"), violet: cv("violet"),
  shadow: cv("shadow"), lift: cv("lift"), scrim: cv("scrim"), thumb: cv("thumb"), ring: cv("ring"), raise: cv("raise"), markLit: cv("markLit"), markShade: cv("markShade"),
};
const SOFT = { [C.accent]: cv("softAccent"), [C.warn]: cv("softWarn"), [C.bad]: cv("softBad"), [C.ash]: cv("softAsh"), [C.chalk]: cv("softChalk") };
/* the tint of a colour, for a fill with text on it */
export const soft = (c) => SOFT[c] || c;
/* what a colour handed to a shared piece means: red and amber keep their meaning, anything else is the accent */
export const tone = (c) => (c === C.bad ? C.bad : c === C.warn ? C.warn : c === C.ash ? C.ash : C.accent);

/* The theme. Dark unless LIGHT is picked; AUTO follows the phone.
   It lives on the page's root as data-theme; the colours follow in CSS. */
export const THEME_STEPS = [["dark", "DARK"], ["light", "LIGHT"], ["auto", "AUTO"]];
export const themeNow = (k) => (k === "light" ? "light" : k === "auto"
  ? (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : "dark");
export function applyTheme(k) {
  if (typeof document === "undefined") return;
  const root = document.documentElement, name = themeNow(k);
  root.setAttribute("data-theme", k === "light" || k === "auto" ? k : "dark");
  const meta = document.querySelector('meta[name="theme-color"]:not([media])') || document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEMES[name].ink);
}

/* The three steps of the text-size setting, on top of whatever the
   phone itself asks for. */
export const TEXT_STEPS = [["n", "NORMAL", 1], ["l", "LARGE", 1.15], ["xl", "LARGEST", 1.32]];
export const stepScale = (k) => { const s = TEXT_STEPS.find((x) => x[0] === k); return s ? s[2] : 1; };

/* TYPE. Two faces, both the phone's own, so there is nothing to
   download and the first screen is the finished screen: the system
   face for words (San Francisco on an iPhone), and its rounded cut for
   the big numbers — clocks, weights, the numbers on a chart. */
const SYS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const RND = "ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
/* the sizes, and no others: a tab's label and a chart's ticks; a small
   label in capitals; the quiet second line; reading text; a card's
   prescription and a section's title; a page's title; an exercise's name */
export const FS = { micro: 12, cap: 13, meta: 15, body: 18, lead: 22, title: 28, name: 32 };
/* SPACE on a 4-point grid, and the corners: small for a box inside a
   card, medium for a button or a field, large for a card */
export const SP = { x1: 4, x2: 8, x3: 12, x4: 16, x5: 20, x6: 24, x8: 32 };
export const RAD = { s: 10, m: 14, l: 20 };
/* MOTION: one curve, two speeds */
export const EASE = "cubic-bezier(.2,.8,.2,1)";

export const FONTS = `
:root { color-scheme: dark; ${varsOf("dark")} }
:root[data-theme="light"] { color-scheme: light; ${varsOf("light")} }
@media (prefers-color-scheme: light) { :root[data-theme="auto"] { color-scheme: light; ${varsOf("light")} } }
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
html, body { background: var(--o8-ink); -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body { overscroll-behavior-y: none; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
/* The phone's own text size, measured off this, and the three steps of
   the setting, are multiplied into one zoom on the app's root. */
.o8-probe { font: -apple-system-body; position: absolute; visibility: hidden; pointer-events: none; }
.o8-root { zoom: var(--o8-zoom, 1); }
@supports not (zoom: 1) { .o8-root { font-size: calc(100% * var(--o8-zoom, 1)); } }
input, button, textarea { font-family: inherit; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
input::placeholder, textarea::placeholder { color: var(--o8-ash); opacity: .5; }
/* every button answers the thumb; every box shows where you are */
.o8-root button { touch-action: manipulation; -webkit-user-select: none; user-select: none;
  transition: transform .12s ${EASE}, filter .12s ease, background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease, opacity .2s ease; }
.o8-root button:not(:disabled):active { transform: scale(.97); filter: brightness(.9); }
.o8-root input, .o8-root textarea { transition: border-color .16s ease, box-shadow .16s ease; }
.o8-root input:focus, .o8-root textarea:focus { outline: none; border-color: var(--o8-accent) !important; box-shadow: 0 0 0 3px var(--o8-soft-accent); }
button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--o8-accent); outline-offset: 2px; }
.o8-glass { -webkit-backdrop-filter: saturate(160%) blur(20px); backdrop-filter: saturate(160%) blur(20px); }
.o8-row { overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
/* read out, never seen */
.o8-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
@keyframes rise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes breathe { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
@keyframes pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.12); opacity: 1 } 100% { transform: scale(1) } }
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sheet { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
@keyframes slide { from { opacity: 0; transform: translateX(18px) } to { opacity: 1; transform: none } }
@keyframes flash { from { opacity: .5 } to { opacity: 0 } }
@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
@keyframes toast { 0% { opacity: 0; transform: translateY(-12px) scale(.98) } 8% { opacity: 1; transform: none } 88% { opacity: 1; transform: none } 100% { opacity: 0; transform: translateY(-8px) } }
@keyframes draw { from { stroke-dashoffset: var(--o8-len, 1000) } to { stroke-dashoffset: 0 } }
@keyframes grow { from { transform: scaleY(0) } to { transform: scaleY(1) } }
.rise { animation: rise .24s ${EASE}; }
.pop { animation: pop .24s ${EASE}; }
.fade { animation: fade .2s ease-out; }
.sheet { animation: sheet .26s ${EASE}; }
.slide { animation: slide .24s ${EASE}; }
.o8-flash { opacity: 0; animation: flash .7s ease-out; }
.o8-pulse { animation: pulse 1s ease-in-out infinite; }
.o8-skel { border-radius: 14px; background: linear-gradient(90deg, var(--o8-card) 25%, var(--o8-card2) 50%, var(--o8-card) 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
.o8-toast { animation: toast 2.6s ${EASE} forwards; }
.o8-draw { stroke-dasharray: var(--o8-len, 1000); animation: draw .7s ${EASE}; }
.o8-grow { transform-origin: 50% 100%; transform-box: fill-box; animation: grow .45s ${EASE}; }
@media (prefers-reduced-motion: reduce) { .rise, .pop, .fade, .sheet, .slide, .o8-flash, .o8-pulse, .o8-skel, .o8-draw, .o8-grow { animation: none } .o8-toast { animation-timing-function: step-end } * { transition: none !important } }
::-webkit-scrollbar { width: 0; height: 0; }
`;

/* dsp for names, titles and buttons; bdy for reading; mno for labels
   and small numbers (every digit the same width, so a clock doesn't
   jitter as it counts); big for the large numbers */
export const dsp = { fontFamily: SYS };
export const bdy = { fontFamily: SYS };
export const mno = { fontFamily: SYS, fontVariantNumeric: "tabular-nums" };
export const big = { fontFamily: RND, fontVariantNumeric: "tabular-nums" };
/* a small label in capitals */
export const cap = (c) => Object.assign({}, mno, { fontSize: FS.cap, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: c || C.ash });

/* ---------- the icons: drawn here, one weight, no files ---------- */
const ICONS = {
  today: <g><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M8 3v4M16 3v4M3.5 10.5h17" /><path d="M8.5 15.2l2.4 2.3 4.6-4.6" /></g>,
  progress: <g><path d="M4 4.5v15h16" /><path d="M7.5 15.5l3.6-4.4 3.2 2.6 5-6.2" /></g>,
  food: <g><path d="M6 3v6.2a2.6 2.6 0 0 0 5.2 0V3M8.6 3v18" /><path d="M17.5 21V3c-2.2 1.6-3.3 4.2-3.3 7.2V13h3.3" /></g>,
  more: <g><rect x="4" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" /></g>,
  left: <path d="M14.5 5l-7 7 7 7" />,
  right: <path d="M9.5 5l7 7-7 7" />,
  down: <path d="M5 9l7 7 7-7" />,
  up: <path d="M5 15l7-7 7 7" />,
  check: <path d="M5 12.6l4.4 4.4L19 7.4" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  reset: <g><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" /><path d="M4 4.5v4.2h4.2" /></g>,
  skip: <g><path d="M6 5.5l9 6.5-9 6.5z" /><path d="M18 5.5v13" /></g>,
  play: <path d="M8 5l11 7-11 7z" fill="currentColor" />,
  pause: <g><rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor" /><rect x="13.9" y="5" width="3.6" height="14" rx="1" fill="currentColor" /></g>,
  list: <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  sound: <g><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" /></g>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  timer: <g><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.6 1.8M9.5 3h5" /></g>,
  expand: <path d="M5 9.5V5h4.5M19 14.5V19h-4.5M5 5l5.5 5.5M19 19l-5.5-5.5" />,
  bar: <g><path d="M3 12h18" /><rect x="5" y="7.5" width="2.8" height="9" rx="1" /><rect x="16.2" y="7.5" width="2.8" height="9" rx="1" /></g>,
  bolt: <path d="M13.5 3L5.5 13.5h5.5l-1 7.5 8.5-11h-5.5z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.500 15.4 12 20 12 20z" />,
  scale: <g><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8.5 10a4.6 4.6 0 0 1 7 0M12 10.5l1.6-2.2" /></g>,
  camera: <g><path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v10.500H4z" /><circle cx="12" cy="13.5" r="3.3" /></g>,
  body: <g><circle cx="12" cy="5.5" r="2.2" /><path d="M6.5 10.5c3.500-1.300 7.500-1.300 11 0M12 9.800v5.200M12 15l-3 5.500M12 15l3 5.500" /></g>,
  move: <g><circle cx="13.5" cy="4.800" r="2" /><path d="M5 20l3.500-5 3 1.500 1.500 4M8.500 15l1.500-5.500 4.500 1 2.500 3.500M10 9.500l-4 1.500" /></g>,
  book: <g><path d="M5 4.500h10.500a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h10.500M9 8.500h6" /></g>,
  calendar: <g><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M8 3v4M16 3v4M3.5 10.5h17" /></g>,
  gear: <g><circle cx="12" cy="12" r="3.2" /><path d="M12 3.500v2.300M12 18.200v2.300M3.500 12h2.300M18.200 12h2.300M6 6l1.600 1.600M16.400 16.400L18 18M6 18l1.600-1.600M16.400 7.600L18 6" /></g>,
  help: <g><circle cx="12" cy="12" r="8.500" /><path d="M9.500 9.500a2.600 2.600 0 1 1 3.800 2.300c-.800.400-1.300 1-1.300 1.900M12 17h.01" /></g>,
  flag: <g><path d="M6 21V4.500M6 5h11l-2.200 3.800L17 12.500H6" /></g>,
  moon: <path d="M19 14.500A7.500 7.500 0 0 1 9.500 5a7.500 7.500 0 1 0 9.500 9.500z" />,
  warn: <g><path d="M12 4l9 15.500H3z" /><path d="M12 10v4.500M12 17.200h.01" /></g>,
  inbox: <g><path d="M4 13.500l2.500-8h11l2.500 8v5.500H4z" /><path d="M4 13.500h4.500l1 2.500h5l1-2.500H20" /></g>,
  target: <g><circle cx="12" cy="12" r="8.500" /><circle cx="12" cy="12" r="4.500" /><path d="M12 12h.01" /></g>,
};
export const Icon = ({ n, size, c, w, s }) => (
  <svg aria-hidden="true" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none"
    style={Object.assign({ display: "block", flexShrink: 0, stroke: c || "currentColor", color: c || "currentColor", strokeWidth: w || 2, strokeLinecap: "round", strokeLinejoin: "round" }, s)}>{ICONS[n] || null}</svg>);

/* A button's words, with a drawn icon where the label opens with ▶, ◀, ▲
   or ▼, or ends with ▶. The words alone are the button's name. */
const GLYPH = { "▶": "play", "◀": "left", "▲": "up", "▼": "down" };
export const words = (kids) => {
  const str = typeof kids === "string" ? kids : Array.isArray(kids) && kids.every((k) => typeof k === "string") ? kids.join("") : null;
  if (str == null || !/[▶◀▲▼]/.test(str)) return kids;
  const a = str === "▶" ? "right" : GLYPH[str[0]] || null;
  const z = /▶$/.test(str) && str.length > 1 ? "right" : null;
  const text = str.replace(/^[▶◀▲▼]\s*/, "").replace(/\s*▶$/, "");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, maxWidth: "100%" }}>
      {a ? <Icon n={a} size={a === "play" ? 16 : 18} w={2.6} /> : null}
      {text ? <span style={{ minWidth: 0 }}>{text}</span> : null}
      {z ? <Icon n={z} size={18} w={2.6} /> : null}
    </span>);
};

/* ---------- small helpers ---------- */
export const buzz = (m) => { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} };
export const mmss = (s) => { const a = Math.abs(Math.round(s)), m = Math.floor(a / 60), x = a % 60; return (s < 0 ? "-" : "") + m + ":" + (x < 10 ? "0" : "") + x; };
export const r25 = (n) => Math.round(n / 2.5) * 2.5;
export const num = (v) => { if (v === "" || v === null || v === undefined) return null; const n = Number(v); return isNaN(n) ? null : n; };

/* ---------- dates ---------- */
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DSH = { mon: "MON", tue: "TUE", wed: "WED", thu: "THU", fri: "FRI", sat: "SAT", sun: "SUN" };
export const iso = (d) => { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
export const mondayOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
export const parseISO = (s) => { const p = String(s).split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
export const todayKey = () => DAYS[(new Date().getDay() + 6) % 7];
export const addDays = (isoStr, n) => { const d = parseISO(isoStr); d.setDate(d.getDate() + n); return iso(d); };
/* Whole weeks from one date's Monday to another's. Each Monday is a
   midnight by the phone's own clock, so when the clocks have changed
   between them the gap is an hour short or long of a whole number of
   weeks: it is rounded, never cut down. */
export const weeksIn = (ms) => Math.round(ms / 604800000);
export const weeksApart = (a, b) => weeksIn(mondayOf(b) - mondayOf(a));
/* a date some weeks on from another (or back, with a minus): by the
   calendar, so a clock change can't land it on the day before */
export const addWeeks = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + 7 * n); return x; };
export const fmtDate = (s) => { try { return parseISO(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch (e) { return s; } };
/* "Thursday 26 November" */
export const longDate = (s) => { try { return parseISO(s).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); } catch (e) { return s; } };

/* ---------- storage ---------- */
export async function load(k, f) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : f; } catch { return f; } }
/* a save that fails says so on the screen, once, instead of failing quietly */
let saveFailed = false;
export async function save(k, v) { try { await window.storage.set(k, JSON.stringify(v)); saveFailed = false; }
  catch (e) { console.error(e); if (!saveFailed) { saveFailed = true; toast("That didn't save. The phone's storage may be full.", "bad"); } } }

/* ---------- the toast: one line that says a thing was done ---------- */
const TOAST = "o8-toast";
export function toast(text, kind) { try { if (typeof window !== "undefined" && window.dispatchEvent && typeof CustomEvent === "function") window.dispatchEvent(new CustomEvent(TOAST, { detail: { text, kind: kind || "ok" } })); } catch (e) {} }
export function Toasts() {
  const [t, setT] = useState(null);
  useEffect(() => {
    let timer = null;
    const on = (e) => { setT(Object.assign({ id: Date.now() + Math.random() }, e.detail)); clearTimeout(timer); timer = setTimeout(() => setT(null), 2600); };
    window.addEventListener(TOAST, on);
    return () => { window.removeEventListener(TOAST, on); clearTimeout(timer); };
  }, []);
  const col = t && t.kind === "bad" ? C.bad : t && t.kind === "warn" ? C.warn : C.accent;
  return (
    <div aria-live="polite" role="status" data-testid="toasts" style={{ position: "fixed", left: 0, right: 0, top: "calc(10px + env(safe-area-inset-top))", zIndex: 400, display: "flex", justifyContent: "center", pointerEvents: "none", padding: "0 16px" }}>
      {t ? (
        <div key={t.id} data-testid="toast" data-kind={t.kind} className="o8-toast" style={Object.assign({}, bdy, { display: "flex", alignItems: "center", gap: 10, maxWidth: 480, background: C.card2, color: C.chalk, border: "1px solid " + C.line, borderRadius: 999, padding: "12px 18px 12px 12px", fontSize: FS.meta, fontWeight: 600, lineHeight: 1.3, boxShadow: C.lift })}>
          <span style={{ width: 28, height: 28, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: col, color: C.on }}><Icon n={t.kind === "bad" || t.kind === "warn" ? "warn" : "check"} size={17} w={2.8} /></span>
          <span>{t.text}</span>
        </div>) : null}
    </div>);
}

/* ================================================================
   THE SHARED PIECES
   ================================================================ */
/* A card: one step up from the page. A card has no colour of its own:
   the older screens gave each kind of card an edge in its own colour
   (`ac`), and that is no longer drawn. `mark` is for the one that
   matters: "bad" for a stop or a must, "warn" for a heads-up. */
export const Card = ({ children, s, mark }) => { const m = mark === "bad" ? C.bad : mark === "warn" ? C.warn : null; return (
  <div style={Object.assign({ background: C.card, border: "1px solid " + C.edge, borderRadius: RAD.l, marginBottom: 12, padding: 16, boxShadow: (m ? "inset 3px 0 0 " + m + ", " : "") + C.shadow }, s)}>{children}</div>); };
/* a small label in capitals over a block, always quiet */
export const Eye = ({ children, s }) => <div style={Object.assign(cap(), { lineHeight: 1.35, marginBottom: 8 }, s)}>{children}</div>;
export const Lab = ({ children }) => <div style={Object.assign(cap(), { fontSize: FS.micro, fontWeight: 600, letterSpacing: .8, marginBottom: 6 })}>{children}</div>;
export const Fld = ({ v, on, ph, a, type, s }) => <input value={v == null ? "" : v} onChange={(e) => on(e.target.value)} placeholder={ph} inputMode={type === "text" ? "text" : type === "time" ? undefined : "decimal"} type={type === "date" || type === "time" ? type : "text"}
  style={Object.assign({}, mno, { width: "100%", background: C.ink, border: "1px solid " + C.line, borderRadius: RAD.m, color: C.chalk, fontSize: FS.body, fontWeight: 600, padding: "11px 12px", textAlign: a || "center", minHeight: 52 }, s)} />;
/* A button. `fill` is the one to press: solid, in the accent (or red,
   or amber). Without it the button is quiet: grey, with white words. */
export const Btn = ({ children, on, c, fill, s, dis, small, label }) => { const t = tone(c || C.accent), quiet = t === C.accent || t === C.ash; return (
  <button onClick={on} disabled={dis} aria-label={label} style={Object.assign({}, dsp, { fontSize: small ? FS.meta : FS.body, fontWeight: 700, letterSpacing: .4,
    background: fill ? (t === C.ash ? C.chalk : t) : quiet ? soft(C.ash) : soft(t), color: fill ? C.on : quiet ? C.chalk : t, border: "1px solid transparent", borderRadius: RAD.m,
    padding: small ? "10px 14px" : "14px 18px", cursor: dis ? "default" : "pointer", opacity: dis ? .38 : 1, minHeight: small ? 48 : 52 }, s)}>{words(children)}</button>); };
export const Chip = ({ children, c, s }) => { const t = c === C.ash || !c ? C.ash : tone(c); return (
  <span style={Object.assign({}, mno, { fontSize: FS.micro, fontWeight: 700, letterSpacing: .6, color: t === C.ash ? C.chalk : t, background: soft(t), borderRadius: 999, padding: "4px 10px", textTransform: "uppercase", whiteSpace: "nowrap", display: "inline-block" }, s)}>{children}</span>); };
export const Note = ({ children, c, bold, s }) => <div style={Object.assign({}, bdy, { fontSize: FS.body, color: c || C.ash, lineHeight: 1.5, marginTop: 8, fontWeight: bold ? 600 : 400 }, s)}>{children}</div>;
/* A choice of a few: a tray, and the chosen one raised in it. An option
   with its own colour (a red YES, a green NO) fills with that colour.
   `col`: the options one under another, for labels too long to share a row */
export const Seg = ({ opts, val, on, col, fit }) => (
  <div style={Object.assign({ display: "flex", gap: 4, background: soft(C.ash), borderRadius: RAD.m, padding: 4 }, col ? { flexDirection: "column" } : {})}>
    {opts.map((o) => { const sel = val === o[0], own = o[2] ? tone(o[2]) : null; return <button key={o[0]} onClick={() => on(o[0])} aria-pressed={sel} style={Object.assign({}, dsp, { flex: fit ? "1 1 auto" : 1, minWidth: 0, fontSize: FS.meta, fontWeight: 700, letterSpacing: .2, padding: fit ? "10px 6px" : "10px 4px", borderRadius: RAD.s, cursor: "pointer", minHeight: 48,
      background: sel ? (own || C.thumb) : "transparent", color: sel ? (own ? C.on : C.chalk) : C.ash, border: "1px solid transparent", boxShadow: sel ? C.shadow : "none" })}>{o[1]}</button>; })}
  </div>);

/* the on/off switch itself: a track, and a knob that slides */
export const Knob = ({ on, c }) => (
  <span aria-hidden="true" style={{ width: 52, height: 32, borderRadius: 999, background: on ? tone(c || C.accent) : C.ring, position: "relative", flexShrink: 0, transition: "background-color .2s ease" }}>
    <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 26, height: 26, borderRadius: 999, background: on ? C.on : C.card, transition: "left .2s " + EASE }} /></span>);

/* the round tick: an empty ring, or filled with the tick in it */
export const CheckDot = ({ ok, c, size }) => { const z = size || 30, t = tone(c || C.accent); return (
  <span aria-hidden="true" className={ok ? "pop" : undefined} style={{ width: z, height: z, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: ok ? t : "transparent", border: "2px solid " + (ok ? t : C.ring), color: C.on }}>
    {ok ? <Icon n="check" size={Math.round(z * .62)} w={3} /> : null}</span>); };

/* A tick row. 48px to press. */
export const Tick = ({ on, ok, title, sub, c, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid " + C.line }}>
    <button onClick={on} aria-label={(ok ? "Untick " : "Tick ") + title} style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 999, cursor: "pointer", background: "transparent", border: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckDot ok={ok} c={c} /></button>
    <span style={{ flex: 1, minWidth: 0 }}>
      <div style={Object.assign({}, bdy, { fontSize: FS.body, fontWeight: 600, color: ok ? C.ash : C.chalk, lineHeight: 1.35, textDecoration: ok ? "line-through" : "none" })}>{title}</div>
      {sub ? <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, marginTop: 3, lineHeight: 1.45 })}>{sub}</div> : null}
    </span>
    {right || null}
  </div>);

/* A way in, for a tick row that also opens a tool. */
export const OpenBtn = ({ on, label }) => (
  <button onClick={on} aria-label={label} style={{ width: 48, height: 48, flexShrink: 0, borderRadius: RAD.m, cursor: "pointer", background: soft(C.ash), border: "none", color: C.chalk, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="right" size={22} w={2.4} /></button>);

/* A row that goes somewhere: an icon, a title, a quiet second line, a chevron. 60px to press. */
export const NavRow = ({ icon, title, sub, on, last, right, testid }) => (
  <button onClick={on} data-testid={testid} aria-label={title} style={{ display: "flex", width: "100%", alignItems: "center", gap: 14, textAlign: "left", background: "transparent", border: "none", borderBottom: last ? "none" : "1px solid " + C.line, padding: "12px 0", minHeight: 64, cursor: "pointer" }}>
    {icon ? <span style={{ width: 40, height: 40, borderRadius: RAD.s, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: soft(C.ash), color: C.chalk }}><Icon n={icon} size={22} /></span> : null}
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, fontWeight: 600, color: C.chalk, lineHeight: 1.3 })}>{title}</span>
      {sub ? <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.meta, color: C.ash, marginTop: 2, lineHeight: 1.35 })}>{sub}</span> : null}
    </span>
    {right || <span style={{ color: C.ash, flexShrink: 0 }}><Icon n="right" size={20} w={2.2} /></span>}
  </button>);

/* A bar that fills: where you are in a session, a week, the programme. */
export const Meter = ({ v, c, h, label, testid, track }) => { const p = Math.max(0, Math.min(1, v || 0)); return (
  <div data-testid={testid} role="progressbar" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}
    style={{ height: h || 6, background: track || soft(C.chalk), borderRadius: 999, overflow: "hidden" }}>
    <div style={{ width: (p * 100) + "%", height: "100%", background: c || C.accent, borderRadius: 999, transition: "width .4s " + EASE }} />
  </div>); };

/* Nothing here yet: an icon, what will be here, and how it gets here. */
export const Empty = ({ icon, title, children, action, testid }) => (
  <div data-testid={testid || "empty"} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 12px" }}>
    <span style={{ width: 56, height: 56, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: soft(C.ash), color: C.ash, marginBottom: 14 }}><Icon n={icon || "inbox"} size={26} /></span>
    <div style={Object.assign({}, dsp, { fontSize: FS.body, fontWeight: 700, color: C.chalk, lineHeight: 1.3 })}>{title}</div>
    {children ? <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, lineHeight: 1.5, marginTop: 6, maxWidth: 320 })}>{children}</div> : null}
    {action || null}
  </div>);

/* A line across a screen that says something went wrong, or needs doing. */
export const Banner = ({ kind, children, action, testid }) => { const t = kind === "bad" ? C.bad : kind === "warn" ? C.warn : C.accent; return (
  <div data-testid={testid || "banner"} role={kind === "bad" ? "alert" : "status"} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: soft(t), borderRadius: RAD.l, padding: 14, marginBottom: 12 }}>
    <span style={{ color: t, flexShrink: 0, marginTop: 1 }}><Icon n={kind === "ok" ? "check" : "warn"} size={22} /></span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={Object.assign({}, bdy, { fontSize: FS.body, color: C.chalk, lineHeight: 1.45 })}>{children}</div>
      {action || null}
    </div>
  </div>); };

/* The shape of a screen while it loads: grey blocks where the cards will be. */
export const Skeleton = () => (
  <div data-testid="loading" aria-busy="true">
    <span className="o8-sr" role="status">LOADING…</span>
    <div className="o8-skel" style={{ height: 132, borderRadius: RAD.l, marginBottom: 12 }} />
    <div className="o8-skel" style={{ height: 196, borderRadius: RAD.l, marginBottom: 12 }} />
    <div className="o8-skel" style={{ height: 64, borderRadius: RAD.l, marginBottom: 12 }} />
    <div className="o8-skel" style={{ height: 64, borderRadius: RAD.l, marginBottom: 12 }} />
  </div>);

/* A screen that broke: it says so, keeps the data, and offers the way back. */
export class Guard extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { try { console.error(err); } catch (e) {} }
  componentDidUpdate(prev) { if (this.state.err && prev.at !== this.props.at) this.setState({ err: null }); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div data-testid="broke" role="alert" style={{ padding: "8px 0" }}>
        <Empty icon="warn" title="This screen hit a problem" testid="broke-box">
          Nothing you've logged has been lost. Go to another tab and come back, or open the app again.
        </Empty>
        <Btn fill on={() => { try { window.location.reload(); } catch (e) {} }} s={{ width: "100%" }}>OPEN THE APP AGAIN</Btn>
      </div>);
  }
}
