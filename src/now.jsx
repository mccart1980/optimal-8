import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, dsp, bdy, mno, mmss, buzz, Fld } from "./ui.jsx";

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
  fontSize: T2, fontWeight: 800, letterSpacing: 1.4, background: bg, color: fg, border: "2px solid " + (line || bg),
  borderRadius: 8, padding: "16px 12px", minHeight: 64, cursor: "pointer", width: "100%",
});

/* ---------- the name, the library entry, the prescription ---------- */
export function CardHead({ name, lib, desc, pres, colour }) {
  const entries = lib && lib.length ? lib : null;
  const descs = entries ? null : (Array.isArray(desc) ? desc : desc ? [desc] : []);
  return (
    <div>
      <h2 data-testid="card-name" style={Object.assign({}, dsp, { margin: 0, fontSize: T1, fontWeight: 800, letterSpacing: 1, lineHeight: 1.1, color: C.chalk, overflowWrap: "anywhere" })}>{name}</h2>
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

export function BigBtn({ children, on, c, fill, dis, label, s }) {
  const col = c || C.moss;
  return <button onClick={on} disabled={dis} aria-label={label} style={Object.assign(big(fill ? col : "transparent", fill ? C.ink : col, col), { opacity: dis ? .45 : 1 }, s)}>{children}</button>;
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
              style={Object.assign({}, mno, { flex: "1 1 30%", minWidth: 96, minHeight: 72, borderRadius: 8, cursor: "pointer", padding: "8px 6px",
                background: ok ? C.moss : C.ink, color: ok ? C.ink : C.chalk, border: "2px solid " + (ok ? C.moss : C.line) })}>
              <div style={{ fontSize: T3, fontWeight: 700, letterSpacing: 1 }}>{ok ? "✓ " : ""}SET {i + 1}</div>
              <div style={{ fontSize: T3, marginTop: 2 }}>{label(i)}</div>
            </button>); })}
      </div>
      {speed ? <div style={{ marginTop: 12 }}>{speed}</div> : null}
      {adjust ? (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setOpen(!open)} style={Object.assign({}, mno, { background: "transparent", border: "1px solid " + C.line, color: C.ash, fontSize: T3, borderRadius: 6, minHeight: 48, padding: "8px 14px", cursor: "pointer" })}>{open ? "CLOSE" : "ADJUST"}</button>
          {open ? <div style={{ marginTop: 10 }}>{adjust}</div> : null}
        </div>) : null}
    </div>);
}

/* ---------- a labelled field, one per number the row needs ---------- */
export function Input({ label, v, on, ph, type }) {
  return (
    <label style={{ display: "block", marginTop: 12 }}>
      <span style={Object.assign({}, mno, { display: "block", fontSize: T3, color: C.ash, marginBottom: 4 })}>{label}</span>
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
            <span style={Object.assign({}, mno, { width: 40, height: 40, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: T3, fontWeight: 700,
              background: ticks[i] ? C.moss : "transparent", color: ticks[i] ? C.ink : C.ash, border: "2px solid " + (ticks[i] ? C.moss : C.line) })}>{ticks[i] ? "✓" : ""}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, fontWeight: 700, color: ticks[i] ? C.ash : C.chalk })}>{r.n}{r.s ? <span style={Object.assign({}, mno, { fontWeight: 400, color: C.brass })}>{"  " + r.s}</span> : null}</span>
              {r.text ? <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, color: C.ash, lineHeight: 1.5, marginTop: 4 })}>{r.text}</span> : null}
            </span>
          </button>))}
    </div>);
}

/* ================================================================
   THE MOVE RUNNER — the evening, one move per card.

   Each move has its own timer; when it runs out the phone buzzes and
   the next move comes up and starts by itself. Nothing to tap between
   moves.
   ================================================================ */
export function MoveRunner({ moves, sound, colour, onFinish, label }) {
  const [s, setS] = useState({ i: 0, left: moves.length ? moves[0].s : 0, run: false, done: false });
  const ref = useRef(s); ref.current = s;
  const end = useRef(0);
  const ctx = useRef(null);
  const beep = useCallback((f, ms) => { if (!sound) return; try {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    const c = ctx.current, o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.connect(g); g.connect(c.destination);
    const t = c.currentTime; g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.0001, t + ms / 1000); o.start(t); o.stop(t + ms / 1000 + .03);
  } catch (e) {} }, [sound]);
  useEffect(() => {
    if (!s.run) return undefined;
    const id = setInterval(() => {
      const cur = ref.current; if (!cur.run) return;
      const rem = Math.ceil((end.current - Date.now()) / 1000);
      if (rem > 0) { if (rem !== cur.left) setS(Object.assign({}, cur, { left: rem })); return; }
      const n = cur.i + 1;
      buzz([120, 60, 120]); beep(880, 250);
      if (n < moves.length) { end.current = Date.now() + moves[n].s * 1000; setS({ i: n, left: moves[n].s, run: true, done: false }); }
      else { setS({ i: n, left: 0, run: false, done: true }); if (onFinish) onFinish(); }
    }, 250);
    return () => clearInterval(id);
  }, [s.run, s.i]);
  const go = () => { const cur = ref.current; if (cur.done) return;
    if (cur.run) setS(Object.assign({}, cur, { run: false }));
    else { end.current = Date.now() + cur.left * 1000; setS(Object.assign({}, cur, { run: true })); beep(660, 80); } };
  const jump = (k) => { const n = Math.max(0, Math.min(moves.length - 1, k)); end.current = Date.now() + moves[n].s * 1000;
    setS({ i: n, left: moves[n].s, run: ref.current.run, done: false }); };
  const col = colour || C.violet;
  if (!moves.length) return null;
  const m = moves[Math.min(s.i, moves.length - 1)];
  return (
    <div data-testid="move-runner" style={{ marginTop: 14 }}>
      <div style={Object.assign({}, mno, { fontSize: T3, color: col, letterSpacing: 1 })}>{s.done ? (label || "DONE") : "MOVE " + (s.i + 1) + " OF " + moves.length}</div>
      {s.done ? null : (
        <div style={{ background: C.ink, border: "2px solid " + col, borderRadius: 10, padding: 16, marginTop: 8 }}>
          <CardHead name={m.n} lib={m.lib} desc={m.desc} pres={m.pres} colour={col} />
          <div data-testid="move-clock" style={Object.assign({}, mno, { fontSize: 72, fontWeight: 700, color: C.chalk, textAlign: "center", lineHeight: 1, marginTop: 18 })}>{mmss(s.left)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <BigBtn on={() => jump(s.i - 1)} c={C.ash} dis={s.i === 0} s={{ flex: 1 }} label="Previous move">◀</BigBtn>
            <BigBtn on={go} c={col} fill={!s.run} s={{ flex: 3 }}>{s.run ? "PAUSE" : "START"}</BigBtn>
            <BigBtn on={() => (s.i + 1 < moves.length ? jump(s.i + 1) : (setS({ i: moves.length, left: 0, run: false, done: true }), onFinish && onFinish()))} c={C.ash} s={{ flex: 1 }} label="Next move">▶</BigBtn>
          </div>
        </div>)}
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
    <div data-chapter={title} style={{ border: "1px solid " + C.line, borderRadius: 8, marginBottom: 10, background: C.card }}>
      <button onClick={onToggle} aria-expanded={open} style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, background: "transparent", border: "none", padding: "14px 14px", cursor: "pointer", minHeight: TAP }}>
        <span style={Object.assign({}, dsp, { flex: 1, textAlign: "left", fontSize: T2, fontWeight: 800, letterSpacing: 1.6, color: C.chalk })}>{title}</span>
        <span style={Object.assign({}, mno, { fontSize: T3, color: left ? C.ash : C.moss })}>{left ? left + " to do" : "✓"}</span>
        <span style={Object.assign({}, mno, { fontSize: T3, color: C.ash })}>{open ? "▾" : "▸"}</span>
      </button>
      {open ? items.map((it) => (
        <div key={it.id} data-flow-id={it.id} data-flow-name={it.n} data-flow-time={it.clock || ""} style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid " + C.line, padding: "8px 14px" }}>
          <button onClick={() => onTick(it)} aria-label={(it.done ? "Untick " : "Tick ") + it.n}
            style={Object.assign({}, mno, { width: 48, height: 48, flexShrink: 0, borderRadius: 6, cursor: "pointer", fontSize: T3, fontWeight: 700, background: it.done ? C.moss : "transparent", color: it.done ? C.ink : C.ash, border: "2px solid " + (it.done ? C.moss : C.line) })}>{it.done ? "✓" : ""}</button>
          <button onClick={() => onPick(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", minHeight: 48 }}>
            <span style={Object.assign({}, mno, { display: "block", fontSize: T3, color: it.id === curId ? C.brass : C.ash })}>{it.clock}{it.id === curId ? " · NOW" : ""}</span>
            <span style={Object.assign({}, bdy, { display: "block", fontSize: T3, fontWeight: 700, color: it.done ? C.ash : C.chalk, lineHeight: 1.35 })}>{it.n}</span>
          </button>
        </div>)) : null}
    </div>);
}
