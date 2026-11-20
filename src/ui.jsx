import React from "react";

/* ================================================================
   SHARED CHROME — the palette, the type, the icons, the small helpers
   and the atoms every page is built from. App.jsx and the Iron Mind
   modules both draw from here so the two halves of the app look like one.
   ================================================================ */
/* Two themes, light and dark, each a full set of colours. The names stay
   as they were so the code reads the same: ink is the page, card a card,
   chalk the text, ash the quieter text, brass the app's blue, oxide red,
   moss green, cobalt teal. Every colour used as text clears 4.5:1 on the
   page, the bars and the cards, in both themes.
   A colour behind text comes two ways: soft(), its tint, with the text
   colour or the colour itself on it; or solid, with C.on as the text. */
export const THEMES = {
  light: {
    ink: "#F1F4F9", bar: "#FFFFFF", card: "#FFFFFF", line: "#DDE3EC", ash: "#4B5871", chalk: "#0E1A2E", on: "#FFFFFF",
    brass: "#1D5FDB", oxide: "#BF3519", moss: "#157A45", cobalt: "#0B7285", violet: "#6741C7",
    softBrass: "#E1EBFC", softOxide: "#FCE8E3", softMoss: "#DDF2E5", softCobalt: "#D8EFF3", softViolet: "#EAE4FA", softAsh: "#E8ECF2", softChalk: "#DFE5EE", thumb: "#FFFFFF", ring: "#8793A6",
    markLit: "#1D5FDB", markShade: "#86A9EE",                        // the bull, where it's drawn in the app: the same two as the launch screen's
  },
  dark: {
    ink: "#0A0D12", bar: "#11151C", card: "#151A22", line: "#262E3A", ash: "#A4AFC2", chalk: "#F2F5F9", on: "#0A0D12",
    brass: "#7DB0FF", oxide: "#FF8D76", moss: "#4FD08B", cobalt: "#56CDE0", violet: "#B8A3FF",
    softBrass: "#162B50", softOxide: "#4A211A", softMoss: "#123524", softCobalt: "#0F323A", softViolet: "#2D2354", softAsh: "#222A35", softChalk: "#2C3542", thumb: "#364050", ring: "#5D697C",
    markLit: "#F2F5F9", markShade: "#7DB0FF",
  },
};
/* what isn't a flat colour: the glass of the bars, the shadows, the dimming behind a sheet */
const EXTRA = {
  light: { glass: "rgba(255,255,255,.93)", shadow: "0 1px 2px rgba(14,26,46,.05), 0 2px 10px rgba(14,26,46,.06)", lift: "0 10px 30px rgba(14,26,46,.16)", scrim: "rgba(14,26,46,.5)" },
  dark: { glass: "rgba(17,21,28,.93)", shadow: "0 0 0 rgba(0,0,0,0)", lift: "0 12px 34px rgba(0,0,0,.55)", scrim: "rgba(0,0,0,.6)" },
};
const kebab = (k) => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
const varsOf = (name) => Object.keys(THEMES[name]).map((k) => "--o8-" + kebab(k) + ": " + THEMES[name][k] + ";").join(" ")
  + " " + Object.keys(EXTRA[name]).map((k) => "--o8-" + k + ": " + EXTRA[name][k] + ";").join(" ");
const cv = (k) => "var(--o8-" + kebab(k) + ")";
export const C = {
  ink: cv("ink"), slab: cv("glass"), card: cv("card"), line: cv("line"), ash: cv("ash"), chalk: cv("chalk"), on: cv("on"),
  moss: cv("moss"), oxide: cv("oxide"), brass: cv("brass"), cobalt: cv("cobalt"), violet: cv("violet"),
  shadow: cv("shadow"), lift: cv("lift"), scrim: cv("scrim"), thumb: cv("thumb"), ring: cv("ring"), markLit: cv("markLit"), markShade: cv("markShade"),
};
const SOFT = {
  [C.moss]: cv("softMoss"), [C.oxide]: cv("softOxide"), [C.brass]: cv("softBrass"), [C.cobalt]: cv("softCobalt"), [C.violet]: cv("softViolet"),
  [C.ash]: cv("softAsh"), [C.chalk]: cv("softChalk"),
};
/* the tint of a colour, for a fill with text on it */
export const soft = (c) => SOFT[c] || c;

/* The theme: "auto" follows the phone, "light" and "dark" hold one.
   It lives on the page's root as data-theme; the colours follow in CSS. */
export const THEME_STEPS = [["auto", "AUTO"], ["light", "LIGHT"], ["dark", "DARK"]];
export const themeNow = (k) => (k === "light" || k === "dark" ? k
  : (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
export function applyTheme(k) {
  if (typeof document === "undefined") return;
  const root = document.documentElement, name = themeNow(k);
  if (k === "light" || k === "dark") root.setAttribute("data-theme", k); else root.removeAttribute("data-theme");
  const meta = document.querySelector('meta[name="theme-color"]:not([media])') || document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEMES[name].ink);
}

/* The three steps of the text-size setting, on top of whatever the
   phone itself asks for. */
export const TEXT_STEPS = [["n", "NORMAL", 1], ["l", "LARGE", 1.15], ["xl", "LARGEST", 1.32]];
export const stepScale = (k) => { const s = TEXT_STEPS.find((x) => x[0] === k); return s ? s[2] : 1; };

/* The phone's own typeface: San Francisco on an iPhone, Roboto on Android.
   Nothing to download, so the first screen is the finished screen. */
const SYS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
export const FONTS = `
:root { color-scheme: light; ${varsOf("light")} }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; ${varsOf("dark")} } }
:root[data-theme="dark"] { color-scheme: dark; ${varsOf("dark")} }
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
input::placeholder, textarea::placeholder { color: var(--o8-ash); opacity: .55; }
/* every button answers the thumb; every box shows where you are */
.o8-root button { touch-action: manipulation; -webkit-user-select: none; user-select: none;
  transition: transform .09s ease, filter .12s ease, background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease, opacity .18s ease; }
.o8-root button:not(:disabled):active { transform: scale(.97); filter: brightness(.94); }
.o8-root input, .o8-root textarea { transition: border-color .15s ease, box-shadow .15s ease; }
.o8-root input:focus, .o8-root textarea:focus { outline: none; border-color: var(--o8-brass) !important; box-shadow: 0 0 0 3px var(--o8-soft-brass); }
button:focus-visible { outline: 2px solid var(--o8-brass); outline-offset: 2px; }
.o8-glass { -webkit-backdrop-filter: saturate(180%) blur(18px); backdrop-filter: saturate(180%) blur(18px); }
/* Older boxes were written with small corners, heavy outlines and very
   small print. They are brought up to the new look here, in one place:
   the browser reads each box's own style and these rules lift it. */
.o8-root [style*="border-radius: 4px"], .o8-root [style*="border-radius: 5px"], .o8-root [style*="border-radius: 6px"] { border-radius: 10px !important; }
.o8-root [style*="border-radius: 8px"], .o8-root [style*="border-radius: 9px"] { border-radius: 14px !important; }
.o8-root [style*="border: 2px solid"] { border-width: 1.5px !important; }
.o8-root [style*="font-size: 7px"], .o8-root [style*="font-size: 7.5px"] { font-size: 9.5px !important; }
.o8-root [style*="font-size: 8px"], .o8-root [style*="font-size: 8.5px"] { font-size: 10.5px !important; }
.o8-root [style*="font-size: 9px"], .o8-root [style*="font-size: 9.5px"] { font-size: 11px !important; }
.o8-row { overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
@keyframes rise { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes breathe { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
@keyframes pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.12); opacity: 1 } 100% { transform: scale(1) } }
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sheet { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
@keyframes flash { from { opacity: .5 } to { opacity: 0 } }
.rise { animation: rise .22s cubic-bezier(.2,.8,.2,1); }
.pop { animation: pop .24s cubic-bezier(.2,.8,.2,1); }
.fade { animation: fade .2s ease-out; }
.sheet { animation: sheet .26s cubic-bezier(.2,.8,.2,1); }
.o8-flash { opacity: 0; animation: flash .7s ease-out; }
.o8-pulse { animation: pulse 1s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .rise, .pop, .fade, .sheet, .o8-flash, .o8-pulse { animation: none } * { transition: none !important } }
::-webkit-scrollbar { width: 0; height: 0; }
`;

/* one family, three jobs: dsp for headings and buttons, bdy for reading,
   mno for labels and numbers (every digit the same width, so a clock
   doesn't jitter as it counts) */
export const dsp = { fontFamily: SYS };
export const bdy = { fontFamily: SYS };
export const mno = { fontFamily: SYS, fontVariantNumeric: "tabular-nums" };

/* the corners: small for a box inside a card, medium for a button, large for a card */
export const RAD = { s: 10, m: 14, l: 18 };

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
};
export const Icon = ({ n, size, c, w, s }) => (
  <svg aria-hidden="true" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none"
    style={Object.assign({ display: "block", flexShrink: 0, stroke: c || "currentColor", color: c || "currentColor", strokeWidth: w || 2, strokeLinecap: "round", strokeLinejoin: "round" }, s)}>{ICONS[n] || null}</svg>);

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

/* ---------- storage ---------- */
export async function load(k, f) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : f; } catch { return f; } }
export async function save(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } }

/* ================================================================
   ATOMS
   ================================================================ */
export const Card = ({ children, s, ac }) => <div style={Object.assign({ background: C.card, border: "1px solid " + C.line, borderRadius: RAD.l, marginBottom: 12, padding: 16, boxShadow: (ac ? "inset 3px 0 0 " + ac + ", " : "") + C.shadow }, s)}>{children}</div>;
export const Eye = ({ children, c, s }) => <div style={Object.assign({}, mno, { fontSize: 13, fontWeight: 700, letterSpacing: 1.1, color: c || C.ash, marginBottom: 8, textTransform: "uppercase" }, s)}>{children}</div>;
export const Lab = ({ children }) => <div style={Object.assign({}, mno, { fontSize: 12, fontWeight: 600, color: C.ash, marginBottom: 5, letterSpacing: .7, textTransform: "uppercase" })}>{children}</div>;
export const Fld = ({ v, on, ph, a, type, s }) => <input value={v == null ? "" : v} onChange={(e) => on(e.target.value)} placeholder={ph} inputMode={type === "text" ? "text" : type === "time" ? undefined : "decimal"} type={type === "date" || type === "time" ? type : "text"}
  style={Object.assign({}, mno, { width: "100%", background: C.ink, border: "1px solid " + C.line, borderRadius: RAD.s, color: C.chalk, fontSize: 19, fontWeight: 600, padding: "11px 10px", textAlign: a || "center", minHeight: 50 }, s)} />;
/* A button: `fill` is the one to press (solid, in its colour); without it
   the button is quiet (the colour's tint, the colour as its text). */
export const Btn = ({ children, on, c, fill, s, dis, small, label }) => { const col = c || C.brass; return (
  <button onClick={on} disabled={dis} aria-label={label} style={Object.assign({}, dsp, { fontSize: small ? 15 : 17, fontWeight: 700, letterSpacing: .6,
    background: fill ? col : soft(col), color: fill ? C.on : col === C.ash ? C.chalk : col, border: "1px solid " + (fill ? col : "transparent"), borderRadius: RAD.m,
    padding: small ? "10px 14px" : "14px 18px", cursor: dis ? "default" : "pointer", opacity: dis ? .4 : 1, minHeight: 48 }, s)}>{children}</button>); };
export const Chip = ({ children, c, s }) => { const col = c || C.ash, tint = SOFT[col]; return (
  <span style={Object.assign({}, mno, { fontSize: 12, fontWeight: 700, letterSpacing: .6, color: col, background: tint || "transparent", border: "1px solid " + (tint ? "transparent" : col), borderRadius: 999, padding: "3px 9px", textTransform: "uppercase", whiteSpace: "nowrap", display: "inline-block" }, s)}>{children}</span>); };
export const Note = ({ children, c, bold, s }) => <div style={Object.assign({}, bdy, { fontSize: 18, color: c || C.ash, lineHeight: 1.5, marginTop: 8, fontWeight: bold ? 600 : 400 }, s)}>{children}</div>;
/* A choice of a few: a tray, and the chosen one raised in it. An option
   with its own colour (a red YES, a green NO) fills with that colour.
   `col`: the options one under another, for labels too long to share a row */
export const Seg = ({ opts, val, on, c, col, fit }) => (
  <div style={Object.assign({ display: "flex", gap: 4, background: soft(C.ash), borderRadius: RAD.m, padding: 4 }, col ? { flexDirection: "column" } : {})}>
    {opts.map((o) => { const sel = val === o[0], own = o[2]; return <button key={o[0]} onClick={() => on(o[0])} style={Object.assign({}, dsp, { flex: fit ? "1 1 auto" : 1, minWidth: 0, fontSize: fit ? 14.5 : 15, fontWeight: 700, letterSpacing: fit ? 0 : .2, padding: fit ? "10px 5px" : "10px 2px", borderRadius: RAD.s, cursor: "pointer", minHeight: 48,
      background: sel ? (own || C.thumb) : "transparent", color: sel ? (own ? C.on : c || C.chalk) : C.ash, border: "1px solid " + (sel && own ? own : "transparent"), boxShadow: sel ? C.shadow : "none" })}>{o[1]}</button>; })}
  </div>);

/* the round tick: an empty ring, or filled in its colour with the tick in it */
export const CheckDot = ({ ok, c, size }) => { const z = size || 30; return (
  <span aria-hidden="true" className={ok ? "pop" : undefined} style={{ width: z, height: z, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: ok ? (c || C.moss) : "transparent", border: "2px solid " + (ok ? (c || C.moss) : C.ring), color: C.on }}>
    {ok ? <Icon n="check" size={Math.round(z * .62)} w={3} /> : null}</span>); };

/* A tick row — the Iron Mind day is built out of these. 48px to press. */
export const Tick = ({ on, ok, title, sub, c, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
    <button onClick={on} aria-label={(ok ? "Untick " : "Tick ") + title} style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 999, cursor: "pointer", background: "transparent", border: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckDot ok={ok} c={c} /></button>
    <span style={{ flex: 1, minWidth: 0 }}>
      <div style={Object.assign({}, bdy, { fontSize: 18, fontWeight: 600, color: ok ? C.ash : C.chalk, lineHeight: 1.35, textDecoration: ok ? "line-through" : "none" })}>{title}</div>
      {sub ? <div style={Object.assign({}, bdy, { fontSize: 16, color: C.ash, marginTop: 3, lineHeight: 1.45 })}>{sub}</div> : null}
    </span>
    {right || null}
  </div>);

/* A way in, for a tick row that also opens a tool. */
export const OpenBtn = ({ on, label, c }) => (
  <button onClick={on} aria-label={label} style={{ width: 48, height: 48, flexShrink: 0, borderRadius: RAD.m, cursor: "pointer", background: soft(c || C.brass), border: "none", color: c || C.brass, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="right" size={22} w={2.4} /></button>);
