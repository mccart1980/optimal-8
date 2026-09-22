import React from "react";

/* ================================================================
   SHARED CHROME — the palette, the type, the small helpers and the
   atoms every page is built from. App.jsx and the Iron Mind modules
   both draw from here so the two halves of the app look like one.
   ================================================================ */
/* Every colour used as text clears 4.5:1 against both the ink and the
   card behind it. The four accents were a shade too dark for that, so
   they have been lifted; used as a fill behind ink text they are better
   for it, not worse. */
export const C = {
  ink: "#101416", slab: "#171C20", card: "#1D2429", line: "#2E383F", ash: "#9CA7B0", chalk: "#F2EDE1",
  moss: "#7FA46F", oxide: "#E06A4C", brass: "#D8A94F", cobalt: "#6FA3C8", violet: "#9D8FCB",
};

/* The three steps of the text-size setting, on top of whatever the
   phone itself asks for. */
export const TEXT_STEPS = [["n", "NORMAL", 1], ["l", "LARGE", 1.15], ["xl", "LARGEST", 1.32]];
export const stepScale = (k) => { const s = TEXT_STEPS.find((x) => x[0] === k); return s ? s[2] : 1; };

export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
html, body { background: ${C.ink}; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
/* The phone's own text size, measured off this, and the three steps of
   the setting, are multiplied into one zoom on the app's root. */
.o8-probe { font: -apple-system-body; position: absolute; visibility: hidden; pointer-events: none; }
.o8-root { zoom: var(--o8-zoom, 1); }
@supports not (zoom: 1) { .o8-root { font-size: calc(100% * var(--o8-zoom, 1)); } }
input, button, textarea { font-family: inherit; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
input[type=date] { color-scheme: dark; }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid ${C.brass}; outline-offset: 2px; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
@keyframes rise { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes breathe { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
.rise { animation: rise .16s ease-out; }
@media (prefers-reduced-motion: reduce) { .rise { animation: none } * { transition: none !important } }
::-webkit-scrollbar { width: 0; height: 0; }
`;

export const dsp = { fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" };
export const bdy = { fontFamily: "'Barlow', system-ui, sans-serif" };
export const mno = { fontFamily: "'IBM Plex Mono', 'Roboto Mono', monospace" };

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
export const fmtDate = (s) => { try { return parseISO(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch (e) { return s; } };

/* ---------- storage ---------- */
export async function load(k, f) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : f; } catch { return f; } }
export async function save(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } }

/* ================================================================
   ATOMS
   ================================================================ */
export const Card = ({ children, s, ac }) => <div style={Object.assign({ background: C.card, border: "1px solid " + C.line, borderLeft: ac ? "3px solid " + ac : "1px solid " + C.line, borderRadius: 6, marginBottom: 10, padding: 14 }, s)}>{children}</div>;
export const Eye = ({ children, c, s }) => <div style={Object.assign({}, mno, { fontSize: 13, letterSpacing: 1.4, color: c || C.ash, marginBottom: 8, textTransform: "uppercase" }, s)}>{children}</div>;
export const Lab = ({ children }) => <div style={Object.assign({}, mno, { fontSize: 12, color: C.ash, marginBottom: 4, letterSpacing: .8, textTransform: "uppercase" })}>{children}</div>;
export const Fld = ({ v, on, ph, a, type, s }) => <input value={v == null ? "" : v} onChange={(e) => on(e.target.value)} placeholder={ph} inputMode={type === "text" ? "text" : "decimal"} type={type === "date" ? "date" : "text"}
  style={Object.assign({}, mno, { width: "100%", background: C.ink, border: "1px solid " + C.line, borderRadius: 4, color: C.chalk, fontSize: 19, padding: "11px 8px", textAlign: a || "center", minHeight: 48 }, s)} />;
export const Btn = ({ children, on, c, fill, s, dis, small, label }) => <button onClick={on} disabled={dis} aria-label={label} style={Object.assign({}, dsp, { fontSize: small ? 16 : 18, fontWeight: 700, letterSpacing: 1.1, background: fill ? (c || C.brass) : "transparent", color: fill ? C.ink : (c || C.brass), border: "1px solid " + (c || C.brass), borderRadius: 5, padding: small ? "10px 12px" : "14px 16px", cursor: dis ? "default" : "pointer", opacity: dis ? .45 : 1, minHeight: 48 }, s)}>{children}</button>;
export const Chip = ({ children, c, s }) => <span style={Object.assign({}, mno, { fontSize: 12, letterSpacing: 1, color: c || C.ash, border: "1px solid " + (c || C.line), borderRadius: 3, padding: "3px 7px", textTransform: "uppercase", whiteSpace: "nowrap", display: "inline-block" }, s)}>{children}</span>;
export const Note = ({ children, c, bold, s }) => <div style={Object.assign({}, bdy, { fontSize: 18, color: c || C.ash, lineHeight: 1.5, marginTop: 8, fontWeight: bold ? 600 : 400 }, s)}>{children}</div>;
export const Seg = ({ opts, val, on, c }) => (
  <div style={{ display: "flex", gap: 5 }}>
    {opts.map((o) => <button key={o[0]} onClick={() => on(o[0])} style={Object.assign({}, dsp, { flex: 1, fontSize: 16, fontWeight: 700, letterSpacing: .6, padding: "11px 4px", borderRadius: 4, cursor: "pointer", minHeight: 48,
      background: val === o[0] ? (o[2] || c || C.brass) : "transparent", color: val === o[0] ? C.ink : C.ash, border: "1px solid " + (val === o[0] ? (o[2] || c || C.brass) : C.line) })}>{o[1]}</button>)}
  </div>);

/* A tick row — the Iron Mind day is built out of these. 44px minimum. */
export const Tick = ({ on, ok, title, sub, c, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: "1px solid " + C.line }}>
    <button onClick={on} aria-label={(ok ? "Untick " : "Tick ") + title} style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 6, cursor: "pointer", background: ok ? (c || C.moss) : "transparent", border: "1px solid " + (ok ? (c || C.moss) : C.line), color: ok ? C.ink : C.ash, fontSize: 19, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "○"}</button>
    <span style={{ flex: 1, minWidth: 0 }}>
      <div style={Object.assign({}, bdy, { fontSize: 18, fontWeight: 600, color: ok ? C.ash : C.chalk, lineHeight: 1.35, textDecoration: ok ? "line-through" : "none" })}>{title}</div>
      {sub ? <div style={Object.assign({}, bdy, { fontSize: 16, color: C.ash, marginTop: 3, lineHeight: 1.45 })}>{sub}</div> : null}
    </span>
    {right || null}
  </div>);

/* A "▸" affordance for a tick row that also opens a tool. */
export const OpenBtn = ({ on, label, c }) => (
  <button onClick={on} aria-label={label} style={Object.assign({}, mno, { width: 48, height: 48, flexShrink: 0, borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid " + (c || C.line), color: c || C.brass, fontSize: 18 })}>▸</button>);
