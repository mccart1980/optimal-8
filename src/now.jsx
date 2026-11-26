import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, soft, tone as toneOf, dsp, bdy, mno, big, mmss, buzz, Fld, RAD, FS, CheckDot, Icon, words } from "./ui.jsx";
import { beep as tone } from "./sound.js";

/* ================================================================
   ONE THING AT A TIME

   The pieces TODAY, the gym and the evening are built from. On a card
   there are three text sizes and no others: the name (T1), the
   prescription and the clock (T2), and everything else (T3, never
   under 18 px). Every target is at least 56 px tall, and the big ones
   are bigger. What you do sits above what you read.
   ================================================================ */
export const T1 = FS.name, T2 = FS.lead, T3 = FS.body;
const TAP = 56;

const bigBtn = (bg, fg) => Object.assign({}, dsp, {
  fontSize: FS.body, fontWeight: 800, letterSpacing: .6, background: bg, color: fg, border: "1px solid transparent",
  borderRadius: RAD.m, padding: "14px 12px", minHeight: 60, cursor: "pointer", width: "100%",
});

/* ---------- the name, the prescription, the words ----------
   `part`: "top" is the name and the prescription alone, "words" the
   library entry or the description alone; without it, all three.
   `sub`: one of a pair, its name a size down under the pair's own. */
export function CardHead({ name, lib, desc, pres, colour, part, sub }) {
  const entries = lib && lib.length ? lib : null;
  const descs = entries ? null : (Array.isArray(desc) ? desc : desc ? [desc] : []);
  const col = colour === C.bad ? C.bad : C.accent;
  const top = part !== "words", words = part !== "top";
  return (
    <div>
      {top ? <h2 data-testid="card-name" style={Object.assign({}, dsp, { margin: 0, fontSize: sub ? T2 : T1, fontWeight: 800, letterSpacing: sub ? -.3 : -.6, lineHeight: sub ? 1.2 : 1.1, color: C.chalk, overflowWrap: "anywhere" })}>{name}</h2> : null}
      {top && pres ? <div data-testid="card-pres" style={Object.assign({}, mno, { marginTop: 10, fontSize: T2, fontWeight: 700, color: col, lineHeight: 1.3, overflowWrap: "anywhere" })}>{pres}</div> : null}
      {words && entries ? entries.map((e, i) => (
        <div key={i} data-testid="card-lib" style={{ marginTop: 14 }}>
          {entries.length > 1 ? <div style={Object.assign({}, mno, { fontSize: T3, fontWeight: 700, color: C.chalk, marginBottom: 2 })}>{e.n}</div> : null}
          <p style={Object.assign({}, bdy, { margin: 0, fontSize: T3, lineHeight: 1.5, color: C.ash })}>{e.text}</p>
        </div>)) : null}
      {words && descs && descs.length ? descs.map((d, i) => (
        <p key={i} data-testid="card-desc" style={Object.assign({}, bdy, { margin: (i ? 10 : 14) + "px 0 0", fontSize: T3, lineHeight: 1.5, color: C.ash })}>{d}</p>)) : null}
    </div>);
}

/* A big button. `fill` is the one to press; without it the button is
   quiet. Red and amber keep their meaning; any other colour is the accent. */
export function BigBtn({ children, on, c, fill, dis, label, s, pressed, main }) {
  const t = toneOf(c || C.accent), quiet = t === C.accent || t === C.ash;
  return <button onClick={on} disabled={dis} aria-label={label} aria-pressed={pressed} data-main={main ? "1" : undefined}
    style={Object.assign(bigBtn(fill ? (t === C.ash ? C.chalk : t) : quiet ? soft(C.ash) : soft(t), fill ? C.on : quiet ? C.chalk : t), { opacity: dis ? .38 : 1 }, s)}>{words(children)}</button>;
}

/* ---------- the sets, one row each ----------
   Tap a row and that set is done at the weight and reps on it; the rest
   timer starts itself. Each row carries last time's numbers for the same
   set. ADJUST opens the numbers for a set that went differently. The
   bar-speed field sits under the sets of the first work set only.
   `prev(i)`: what set i was last time, or nothing. `next`: the row the
   LOG SET button will log. */
export function SetButtons({ n, sets, label, onTap, adjust, speed, prev, next }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: n }).map((_, i) => { const ok = !!(sets[i] && sets[i].ok), up = !ok && next === i, was = prev ? prev(i) : null;
          return (
            <button key={i} data-set-btn={i + 1} data-set-next={up ? "1" : undefined} onClick={() => onTap(i)} aria-label={(ok ? "Undo set " : "Set ") + (i + 1)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", minHeight: 68, borderRadius: RAD.m, cursor: "pointer", padding: "10px 14px",
                background: ok ? soft(C.accent) : C.raise, color: C.chalk, border: "1.5px solid " + (up ? C.accent : "transparent") }}>
              <span style={Object.assign({}, mno, { flexShrink: 0, minWidth: 58, fontSize: T3, fontWeight: 700, letterSpacing: .6, color: ok ? C.accent : C.ash })}>SET {i + 1}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span data-set-label style={Object.assign({}, big, { display: "block", fontSize: T2, fontWeight: 700, lineHeight: 1.2, color: C.chalk })}>{label(i)}</span>
                {was ? <span data-set-prev style={Object.assign({}, mno, { display: "block", fontSize: T3, color: C.ash, lineHeight: 1.25, marginTop: 2 })}>{was}</span> : null}
              </span>
              <CheckDot ok={ok} size={32} />
            </button>); })}
      </div>
      {adjust ? (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setOpen(!open)} aria-expanded={open} style={Object.assign({}, dsp, { background: soft(C.ash), border: "none", color: C.chalk, fontSize: T3, fontWeight: 700, letterSpacing: .4, borderRadius: RAD.m, minHeight: 52, padding: "8px 18px", cursor: "pointer" })}>{open ? "CLOSE" : "ADJUST"}</button>
          {open ? <div className="rise" style={{ marginTop: 10 }}>{adjust}</div> : null}
        </div>) : null}
      {speed ? <div style={{ marginTop: 14 }}>{speed}</div> : null}
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
        ? <div key={i} style={Object.assign({}, mno, { fontSize: T3, fontWeight: 700, color: C.chalk, letterSpacing: .6, margin: "18px 0 6px" })}>{r.head}</div>
        : (
          <button key={i} onClick={() => onTick(i)} aria-label={(ticks[i] ? "Untick " : "Tick ") + r.n}
            style={{ display: "flex", gap: 12, width: "100%", textAlign: "left", alignItems: "flex-start", background: "transparent", border: "none", borderTop: "1px solid " + C.line, padding: "12px 0", cursor: "pointer", minHeight: TAP }}>
            <span style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckDot ok={!!ticks[i]} size={32} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, fontWeight: 700, color: ticks[i] ? C.ash : C.chalk })}>{r.n}{r.s ? <span style={Object.assign({}, mno, { fontWeight: 600, color: ticks[i] ? C.ash : C.accent })}>{"  " + r.s}</span> : null}</span>
              {r.level ? <span data-testid="row-level" style={Object.assign({}, mno, { display: "block", fontSize: T3, color: C.chalk, lineHeight: 1.4, marginTop: 4 })}>{r.level}</span> : null}
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
  if (!n) return null;
  if (s.i >= n) return (
    <div data-testid="routine-runner" className="rise" style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <CheckDot ok size={40} />
        <div data-testid="routine-done" style={Object.assign({}, dsp, { fontSize: T1, fontWeight: 800, letterSpacing: .4, color: C.accent })}>{label || "DONE"}</div>
      </div>
      <BigBtn on={() => show(n - 1, false)} c={C.ash} s={{ marginTop: 14 }}>◀ BACK TO THE LAST CARD</BigBtn>
    </div>);
  const c = cards[s.i], hold = c.kind === "hold";
  const going = s.ph === "set" || s.ph === "run";
  const setting = s.ph === "set" || s.ph === "pset";
  const frac = hold && !setting && c.secs ? Math.max(0, Math.min(1, 1 - s.left / c.secs)) : 0;
  return (
    <div data-testid="routine-runner" data-routine-card={s.i + 1} data-kind={c.kind} style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={Object.assign({}, mno, { fontSize: T3, fontWeight: 700, color: C.ash, letterSpacing: .6, whiteSpace: "nowrap" })}>{"CARD " + (s.i + 1) + " OF " + n}</span>
        <span aria-hidden="true" style={{ flex: 1, display: "flex", gap: 3 }}>{cards.map((_, k) => <span key={k} style={{ flex: 1, height: 4, borderRadius: 999, background: k < s.i ? C.accent : k === s.i ? C.chalk : soft(C.chalk) }} />)}</span>
      </div>
      <div key={s.i} className="slide" style={{ background: C.raise, borderRadius: RAD.l, padding: 16, marginTop: 10, overflow: "hidden", position: "relative" }}>
        <h3 data-testid="routine-name" style={Object.assign({}, dsp, { margin: 0, fontSize: T1, fontWeight: 800, letterSpacing: -.6, lineHeight: 1.1, color: C.chalk, overflowWrap: "anywhere" })}>{c.n}</h3>
        <div data-testid="routine-dose" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
          <span style={Object.assign({}, mno, { fontSize: T2, fontWeight: 700, color: setting ? C.warn : C.accent, letterSpacing: .6 })}>{hold ? (setting ? "GET SET" : "HOLD") : "REPS " + c.amt}</span>
          {hold ? <span data-testid="routine-clock" style={Object.assign({}, big, { fontSize: 64, fontWeight: 700, color: setting ? C.ash : C.chalk, lineHeight: 1, letterSpacing: -1 })}>{mmss(s.left)}</span> : null}
        </div>
        {hold ? <div aria-hidden="true" style={{ height: 6, borderRadius: 999, background: soft(C.chalk), overflow: "hidden", marginTop: 12 }}><div style={{ width: (frac * 100) + "%", height: "100%", background: C.accent, borderRadius: 999, transition: "width .3s linear" }} /></div> : null}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <BigBtn on={() => show(s.i - 1, s.armed)} c={C.ash} dis={s.i === 0} s={{ flex: 1 }} label="Previous card">◀</BigBtn>
          {hold
            ? <BigBtn main on={go} c={going ? C.ash : C.accent} fill={!going} s={{ flex: 3 }}>{going ? "PAUSE" : s.ph === "idle" ? "▶ START" : "GO ON"}</BigBtn>
            : <BigBtn main on={() => { buzz(30); show(s.i + 1, true); }} c={C.accent} fill s={{ flex: 3, fontSize: T2 }} label="Done, next card">DONE ▶</BigBtn>}
          <BigBtn on={() => show(s.i + 1, s.armed)} c={C.ash} s={{ flex: 1 }} label="Next card">▶</BigBtn>
        </div>
        <p data-testid="routine-words" style={Object.assign({}, bdy, { margin: "16px 0 0", fontSize: T3, lineHeight: 1.5, color: C.ash })}>{c.words}</p>
        {c.level ? <p data-testid="routine-level" style={Object.assign({}, mno, { margin: "10px 0 0", fontSize: T3, lineHeight: 1.5, color: C.chalk })}>{c.level}</p> : null}
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

/* ---------- the day, in chapters ----------
   One card a chapter. Its head says what's left and opens it; a row is a
   tick to press and the item to open. The item the day is on is marked. */
export function Chapter({ title, items, open, onToggle, onPick, onTick, curId }) {
  const left = items.filter((x) => !x.done).length;
  if (!items.length) return null;
  return (
    <div data-chapter={title} style={{ border: "1px solid " + C.edge, borderRadius: RAD.l, marginBottom: 12, background: C.card, overflow: "hidden" }}>
      <button onClick={onToggle} aria-expanded={open} style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, background: "transparent", border: "none", padding: "14px 16px", cursor: "pointer", minHeight: 60 }}>
        <span style={Object.assign({}, dsp, { flex: 1, textAlign: "left", fontSize: FS.body, fontWeight: 800, letterSpacing: .8, color: C.chalk })}>{title}</span>
        <span style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 700, color: left ? C.chalk : C.accent, background: soft(left ? C.ash : C.accent), borderRadius: 999, padding: "4px 12px", whiteSpace: "nowrap" })}>{left ? left + " to do" : "✓"}</span>
        <span style={{ color: C.ash }}><Icon n={open ? "up" : "down"} size={20} w={2.4} /></span>
      </button>
      {open ? items.map((it) => { const now = it.id === curId; return (
        <div key={it.id} data-flow-id={it.id} data-flow-name={it.n} data-flow-time={it.clock || ""} style={{ display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid " + C.line, padding: "6px 14px 6px 8px", background: now ? soft(C.accent) : "transparent" }}>
          <button onClick={() => onTick(it)} aria-label={(it.done ? "Untick " : "Tick ") + it.n}
            style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 999, cursor: "pointer", background: "transparent", border: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckDot ok={!!it.done} /></button>
          <button onClick={() => onPick(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "6px 0", minHeight: 52 }}>
            <span style={Object.assign({}, mno, { display: "block", fontSize: FS.meta, fontWeight: now ? 700 : 500, color: now ? C.accent : C.ash })}>{it.clock}{now ? " · NOW" : ""}</span>
            <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, fontWeight: 700, color: it.done ? C.ash : C.chalk, lineHeight: 1.3, textDecoration: it.done ? "line-through" : "none" })}>{it.n}</span>
            {it.s ? <span data-row-pres style={Object.assign({}, mno, { display: "block", fontSize: FS.meta, color: C.ash, lineHeight: 1.35, marginTop: 2 })}>{it.s}</span> : null}
          </button>
          <span aria-hidden="true" style={{ color: C.ring, flexShrink: 0 }}><Icon n="right" size={18} w={2.2} /></span>
        </div>); }) : null}
    </div>);
}
