import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, soft, dsp, bdy, mno, mmss, buzz, Fld, RAD, CheckDot, Icon } from "./ui.jsx";
import { beep as tone } from "./sound.js";

/* ================================================================
   ONE THING AT A TIME

   The pieces TODAY, the gym and the evening are built from. Three text
   sizes and no others: the name (T1), the prescription and the clock
   (T2), and everything else (T3, never under 18 px). Every target is at
   least 56 px tall, and the big ones are bigger.
   ================================================================ */
export const T1 = 32, T2 = 22, T3 = 18;
const TAP = 56;

const big = (bg, fg, line) => Object.assign({}, dsp, {
  fontSize: 20, fontWeight: 800, letterSpacing: .8, background: bg, color: fg, border: "1px solid " + (line || bg),
  borderRadius: RAD.m, padding: "14px 12px", minHeight: 60, cursor: "pointer", width: "100%",
});

/* ---------- the name, the library entry, the prescription ---------- */
export function CardHead({ name, lib, desc, pres, colour }) {
  const entries = lib && lib.length ? lib : null;
  const descs = entries ? null : (Array.isArray(desc) ? desc : desc ? [desc] : []);
  return (
    <div>
      <h2 data-testid="card-name" style={Object.assign({}, dsp, { margin: 0, fontSize: T1, fontWeight: 800, letterSpacing: -.4, lineHeight: 1.12, color: C.chalk, overflowWrap: "anywhere" })}>{name}</h2>
      {entries ? entries.map((e, i) => (
        <div key={i} data-testid="card-lib" style={{ marginTop: 10 }}>
          {entries.length > 1 ? <div style={Object.assign({}, mno, { fontSize: T3, fontWeight: 700, color: colour || C.brass, letterSpacing: .6 })}>{e.n}</div> : null}
          <p style={Object.assign({}, bdy, { margin: 0, fontSize: T3, lineHeight: 1.5, color: C.chalk })}>{e.text}</p>
        </div>)) : null}
      {descs && descs.length ? descs.map((d, i) => (
        <p key={i} data-testid="card-desc" style={Object.assign({}, bdy, { margin: "10px 0 0", fontSize: T3, lineHeight: 1.5, color: C.chalk })}>{d}</p>)) : null}
      {pres ? <div data-testid="card-pres" style={Object.assign({}, mno, { marginTop: 12, fontSize: T2, fontWeight: 700, color: colour || C.brass, lineHeight: 1.3, overflowWrap: "anywhere" })}>{pres}</div> : null}
    </div>);
}

export function BigBtn({ children, on, c, fill, dis, label, s, pressed }) {
  const col = c || C.moss;
  return <button onClick={on} disabled={dis} aria-label={label} aria-pressed={pressed} style={Object.assign(big(fill ? col : soft(col), fill ? C.on : col === C.ash ? C.chalk : col, fill ? col : "transparent"), { opacity: dis ? .4 : 1 }, s)}>{children}</button>;
}

/* ---------- the row of set buttons ----------
   Tap a set and it is done at the weight and reps on it; the rest timer
   starts itself. ADJUST opens the numbers for a set that went
   differently. The bar-speed field sits under the first set only. */
export function SetButtons({ n, sets, label, onTap, adjust, speed }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: n }).map((_, i) => { const ok = !!(sets[i] && sets[i].ok);
          return (
            <button key={i} data-set-btn={i + 1} onClick={() => onTap(i)} aria-label={(ok ? "Undo set " : "Set ") + (i + 1)}
              style={Object.assign({}, mno, { flex: "1 1 30%", minWidth: 96, minHeight: 72, borderRadius: RAD.m, cursor: "pointer", padding: "8px 6px",
                background: ok ? soft(C.moss) : C.ink, color: C.chalk, border: "1.5px solid " + (ok ? C.moss : C.line) })}>
              <div style={{ fontSize: T3, fontWeight: 700, letterSpacing: 1 }}>{ok ? "✓ " : ""}SET {i + 1}</div>
              <div style={{ fontSize: T3, marginTop: 2 }}>{label(i)}</div>
            </button>); })}
      </div>
      {speed ? <div style={{ marginTop: 12 }}>{speed}</div> : null}
      {adjust ? (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setOpen(!open)} style={Object.assign({}, mno, { background: soft(C.ash), border: "none", color: C.chalk, fontSize: 16, fontWeight: 700, letterSpacing: .6, borderRadius: RAD.s, minHeight: 48, padding: "8px 16px", cursor: "pointer" })}>{open ? "CLOSE" : "ADJUST"}</button>
          {open ? <div style={{ marginTop: 10 }}>{adjust}</div> : null}
        </div>) : null}
    </div>);
}

/* ---------- a labelled field, one per number the row needs ---------- */
export function Input({ label, v, on, ph, type }) {
  return (
    <label style={{ display: "block", marginTop: 12 }}>
      <span style={Object.assign({}, mno, { display: "block", fontSize: T3, fontWeight: 600, color: C.ash, marginBottom: 6 })}>{label}</span>
      <Fld v={v} on={on} ph={ph || "—"} type={type} a="left" s={{ fontSize: T2, minHeight: TAP }} />
    </label>);
}

/* ---------- a checklist: the warm-up, the weekly rows ---------- */
export function Checklist({ rows, ticks, onTick }) {
  return (
    <div style={{ marginTop: 14 }}>
      {rows.map((r, i) => r.head
        ? <div key={i} style={Object.assign({}, mno, { fontSize: T3, color: C.brass, letterSpacing: 1, margin: "14px 0 4px" })}>{r.head}</div>
        : (
          <button key={i} onClick={() => onTick(i)} aria-label={(ticks[i] ? "Untick " : "Tick ") + r.n}
            style={{ display: "flex", gap: 12, width: "100%", textAlign: "left", alignItems: "flex-start", background: "transparent", border: "none", borderTop: "1px solid " + C.line, padding: "12px 0", cursor: "pointer", minHeight: TAP }}>
            <span style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckDot ok={!!ticks[i]} size={32} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, fontWeight: 700, color: ticks[i] ? C.ash : C.chalk })}>{r.n}{r.s ? <span style={Object.assign({}, mno, { fontWeight: 400, color: C.brass })}>{"  " + r.s}</span> : null}</span>
              {r.level ? <span data-testid="row-level" style={Object.assign({}, mno, { display: "block", fontSize: T3, color: C.violet, lineHeight: 1.4, marginTop: 4 })}>{r.level}</span> : null}
              {r.text ? <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, color: C.ash, lineHeight: 1.5, marginTop: 4 })}>{r.text}</span> : null}
            </span>
          </button>))}
    </div>);
}

/* ================================================================
   THE ROUTINE RUNNER — the morning and evening routines, one card at a
   time, each card exactly as home-routines.md writes it: the name, its
   own words, then one line — HOLD with a clock, or the reps with none.

   A HOLD card gives 8 seconds of GET SET with the card on screen, then
   the clock; "at halfway" in its words buzzes once at halfway; at zero
   it buzzes and the next card comes up. A REPS card has no clock and
   never moves on by itself: DONE ▶ does. ◀ and ▶ are on every card.
   `at` is the card the day is on (cards.length is DONE); `onAt` keeps it.
   ================================================================ */
export const GET_SET = 8;
export function RoutineRunner({ cards, sound, colour, at, onAt, label }) {
  const n = cards.length;
  const start = Math.max(0, Math.min(n, Number(at) || 0));
  const [s, setS0] = useState({ i: start, ph: "idle", left: start < n && cards[start].kind === "hold" ? cards[start].secs : 0, half: false, armed: false });
  const ref = useRef(s); ref.current = s;
  /* the ref moves with every change, so a timer tick never reads a stale card */
  const setS = (x) => { ref.current = x; setS0(x); };
  const end = useRef(0);
  const keep = useRef(onAt); keep.current = onAt;
  const beep = useCallback((f, ms) => { if (sound) tone(f, ms); }, [sound]);
  /* a card coming up: a HOLD card gets its GET SET once the routine is going */
  const show = (k, armed) => {
    const i = Math.max(0, Math.min(n, k)), c = cards[i];
    if (keep.current) keep.current(i);
    if (c && c.kind === "hold" && armed) { end.current = Date.now() + GET_SET * 1000; setS({ i, ph: "set", left: GET_SET, half: false, armed }); }
    else setS({ i, ph: "idle", left: c && c.kind === "hold" ? c.secs : 0, half: false, armed });
  };
  useEffect(() => {
    if (s.ph !== "set" && s.ph !== "run") return undefined;
    const id = setInterval(() => {
      const cur = ref.current, c = cards[cur.i]; if (!c || (cur.ph !== "set" && cur.ph !== "run")) return;
      const rem = Math.ceil((end.current - Date.now()) / 1000);
      if (cur.ph === "set") {
        if (rem > 0) { if (rem !== cur.left) setS(Object.assign({}, cur, { left: rem })); return; }
        end.current = Date.now() + c.secs * 1000; beep(660, 120);
        setS(Object.assign({}, cur, { ph: "run", left: c.secs, half: false })); return;
      }
      if (rem > 0) {
        const patch = {};
        if (c.halfway && !cur.half && rem <= c.secs / 2) { patch.half = true; buzz(200); beep(740, 150); }
        if (rem !== cur.left) patch.left = rem;
        if (Object.keys(patch).length) setS(Object.assign({}, cur, patch));
        return;
      }
      buzz([120, 60, 120]); beep(880, 250);
      show(cur.i + 1, true);
    }, 250);
    return () => clearInterval(id);
  }, [s.ph, s.i]);
  const go = () => { const cur = ref.current, c = cards[cur.i]; if (!c) return;
    if (cur.ph === "set" || cur.ph === "run") { setS(Object.assign({}, cur, { ph: cur.ph === "set" ? "pset" : "pause", left: Math.max(0, Math.ceil((end.current - Date.now()) / 1000)) })); return; }
    if (cur.ph === "pause" || cur.ph === "pset") { end.current = Date.now() + cur.left * 1000; setS(Object.assign({}, cur, { ph: cur.ph === "pset" ? "set" : "run", armed: true })); return; }
    end.current = Date.now() + GET_SET * 1000; setS(Object.assign({}, cur, { ph: "set", left: GET_SET, half: false, armed: true })); beep(660, 80); };
  const col = colour || C.violet;
  if (!n) return null;
  if (s.i >= n) return (
    <div data-testid="routine-runner" style={{ marginTop: 14 }}>
      <div data-testid="routine-done" style={Object.assign({}, dsp, { fontSize: T1, fontWeight: 800, letterSpacing: 2, color: C.moss })}>{label || "DONE"}</div>
      <BigBtn on={() => show(n - 1, false)} c={C.ash} s={{ marginTop: 12 }}>◀ BACK TO THE LAST CARD</BigBtn>
    </div>);
  const c = cards[s.i], hold = c.kind === "hold";
  const going = s.ph === "set" || s.ph === "run";
  const setting = s.ph === "set" || s.ph === "pset";
  return (
    <div data-testid="routine-runner" data-routine-card={s.i + 1} data-kind={c.kind} style={{ marginTop: 14 }}>
      <div style={Object.assign({}, mno, { fontSize: T3, color: col, letterSpacing: 1 })}>{"CARD " + (s.i + 1) + " OF " + n}</div>
      <div style={{ background: C.ink, border: "1.5px solid " + col, borderRadius: RAD.m, padding: 16, marginTop: 8 }}>
        <h3 data-testid="routine-name" style={Object.assign({}, dsp, { margin: 0, fontSize: T1, fontWeight: 800, letterSpacing: -.4, lineHeight: 1.12, color: C.chalk, overflowWrap: "anywhere" })}>{c.n}</h3>
        <p data-testid="routine-words" style={Object.assign({}, bdy, { margin: "10px 0 0", fontSize: T3, lineHeight: 1.5, color: C.chalk })}>{c.words}</p>
        {c.level ? <p data-testid="routine-level" style={Object.assign({}, mno, { margin: "10px 0 0", fontSize: T3, lineHeight: 1.5, color: col })}>{c.level}</p> : null}
        <div data-testid="routine-dose" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
          <span style={Object.assign({}, mno, { fontSize: T2, fontWeight: 700, color: col, letterSpacing: 1 })}>{hold ? (setting ? "GET SET" : "HOLD") : "REPS " + c.amt}</span>
          {hold ? <span data-testid="routine-clock" style={Object.assign({}, mno, { fontSize: 64, fontWeight: 700, color: setting ? C.ash : C.chalk, lineHeight: 1 })}>{mmss(s.left)}</span> : null}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <BigBtn on={() => show(s.i - 1, s.armed)} c={C.ash} dis={s.i === 0} s={{ flex: 1 }} label="Previous card">◀</BigBtn>
          {hold
            ? <BigBtn on={go} c={col} fill={!going} s={{ flex: 3 }}>{going ? "PAUSE" : s.ph === "idle" ? "▶ START" : "GO ON"}</BigBtn>
            : <BigBtn on={() => { buzz(30); show(s.i + 1, true); }} c={C.moss} fill s={{ flex: 3, fontSize: 28 }} label="Done, next card">DONE ▶</BigBtn>}
          <BigBtn on={() => show(s.i + 1, s.armed)} c={C.ash} s={{ flex: 1 }} label="Next card">▶</BigBtn>
        </div>
      </div>
    </div>);
}

/* seconds out of a prescription: "3 min", "2 × 20 s", "45 seconds" */
export function secsOf(p, fallback) {
  const t = String(p || "");
  let m = t.match(/(\d+)\s*min/i); if (m) return Number(m[1]) * 60;
  m = t.match(/(\d+)\s*×\s*(\d+)\s*s\b/i); if (m) return Number(m[1]) * Number(m[2]);
  m = t.match(/(\d+)\s*(s|sec|seconds)\b/i); if (m) return Number(m[1]);
  return fallback || 60;
}

/* ---------- the whole day, in chapters ---------- */
export function Chapter({ title, items, open, onToggle, onPick, onTick, curId }) {
  const left = items.filter((x) => !x.done).length;
  return (
    <div data-chapter={title} style={{ border: "1px solid " + C.line, borderRadius: RAD.l, marginBottom: 12, background: C.card, boxShadow: C.shadow, overflow: "hidden" }}>
      <button onClick={onToggle} aria-expanded={open} style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, background: "transparent", border: "none", padding: "14px 16px", cursor: "pointer", minHeight: TAP }}>
        <span style={Object.assign({}, dsp, { flex: 1, textAlign: "left", fontSize: 19, fontWeight: 800, letterSpacing: 1.2, color: C.chalk })}>{title}</span>
        <span style={Object.assign({}, mno, { fontSize: 15, fontWeight: 700, color: left ? C.ash : C.moss, background: soft(left ? C.ash : C.moss), borderRadius: 999, padding: "4px 10px" })}>{left ? left + " to do" : "✓"}</span>
        <span style={{ color: C.ash }}><Icon n={open ? "up" : "down"} size={20} w={2.4} /></span>
      </button>
      {open ? items.map((it) => (
        <div key={it.id} data-flow-id={it.id} data-flow-name={it.n} data-flow-time={it.clock || ""} style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid " + C.line, padding: "7px 14px 7px 10px", background: it.id === curId ? soft(C.brass) : "transparent" }}>
          <button onClick={() => onTick(it)} aria-label={(it.done ? "Untick " : "Tick ") + it.n}
            style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 999, cursor: "pointer", background: "transparent", border: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckDot ok={!!it.done} /></button>
          <button onClick={() => onPick(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", minHeight: 48 }}>
            <span style={Object.assign({}, mno, { display: "block", fontSize: 16, fontWeight: it.id === curId ? 700 : 500, color: it.id === curId ? C.brass : C.ash })}>{it.clock}{it.id === curId ? " · NOW" : ""}</span>
            <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, fontWeight: 700, color: it.done ? C.ash : C.chalk, lineHeight: 1.35 })}>{it.n}</span>
            {it.s ? <span data-row-pres style={Object.assign({}, mno, { display: "block", fontSize: T3, color: it.done ? C.ash : C.brass, lineHeight: 1.35, marginTop: 2 })}>{it.s}</span> : null}
          </button>
        </div>)) : null}
    </div>);
}
