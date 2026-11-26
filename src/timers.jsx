import React from "react";
import { C, soft, dsp, bdy, mno, big, cap, mmss, RAD, FS, Icon } from "./ui.jsx";
import { beatAt } from "./sound.js";

/* ================================================================
   THE TIMERS ON SCREEN

   Two shapes of one clock. THE DOCK: a bar that rides just above the
   bottom of the screen, so a rest counts down in big numbers without
   covering the card you are logging on. THE FULL SCREEN: the part's
   name, a ring that empties as it runs with the clock inside it, what
   to do, where you are and what's next, for the sessions where the
   clock is the session. A rest opens in the dock; everything else
   opens full, and either can be turned into the other.

   The colours mean what they mean everywhere: red is work, amber is
   rest, the accent is done.
   ================================================================ */
const colourOf = (t, cur) => (t.done ? C.accent : cur.t === "w" ? C.bad : C.warn);
const roundBtn = (z) => ({ width: z, height: z, flexShrink: 0, borderRadius: 999, border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" });

/* `rounds(kind)`: whether this timer is boxing rounds, for the last-ten
   rule. `bottom`: how far up the screen the dock rides. */
export function TimerDock({ T, rounds, bottom }) {
  const t = T.t; if (!t || T.open) return null;
  const cur = t.steps[t.i] || { l: "COMPLETE", s: 1, t: "r" };
  const col = colourOf(t, cur);
  const frac = t.done ? 1 : 1 - t.left / (cur.s || 1);
  const ten = !t.done && beatAt(t.steps, t.i, t.left, rounds(t.kind)).ten;
  const part = t.done ? "COMPLETE" : cur.l, same = part === t.title;
  return (
    <div data-testid="timer-dock" className="sheet" style={{ position: "fixed", left: 0, right: 0, bottom, zIndex: 70, padding: "0 8px 8px", pointerEvents: "none" }}>
      <div style={{ maxWidth: 624, margin: "0 auto", background: C.raise, border: "1px solid " + C.line, borderRadius: RAD.l, boxShadow: C.lift, overflow: "hidden", pointerEvents: "auto" }}>
        <div aria-hidden="true" style={{ height: 5, background: soft(C.chalk) }}><div style={{ width: (frac * 100) + "%", height: "100%", background: ten ? C.bad : col, transition: "width .25s linear, background-color .3s ease" }} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px 10px 16px" }}>
          <button onClick={() => T.setOpen(true)} aria-label="Open the timer" style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer", color: C.chalk }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span data-testid="timer-title" style={Object.assign(cap(col), { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{t.title}</span>
              {ten ? <span data-testid="dock-ten" className="o8-pulse" style={Object.assign(cap(C.on), { fontSize: FS.micro, background: C.bad, borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" })}>LAST 10</span> : null}
            </span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
              <span data-testid="timer-count" className={t.done ? "pop" : undefined} style={Object.assign({}, big, { fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: t.done ? C.accent : ten ? C.bad : C.chalk })}>{t.done ? "✓" : mmss(t.left)}</span>
              <span data-testid="timer-part" className={same ? "o8-sr" : undefined} style={same ? undefined : Object.assign({}, bdy, { fontSize: FS.meta, fontWeight: 600, color: C.ash, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 })}>{part}</span>
            </span>
          </button>
          <button onClick={T.toggle} disabled={t.done} aria-label={t.run ? "PAUSE" : "START"} style={Object.assign(roundBtn(56), { background: col, color: C.on, opacity: t.done ? .4 : 1 })}><Icon n={t.run ? "pause" : "play"} size={24} /></button>
          <button onClick={T.skip} disabled={t.done} aria-label="SKIP" style={Object.assign(roundBtn(56), { background: soft(C.chalk), color: C.chalk, opacity: t.done ? .4 : 1 })}><Icon n="skip" size={24} /></button>
          <button onClick={T.close} aria-label="Close timer" style={Object.assign(roundBtn(44), { background: "transparent", color: C.ash })}><Icon n="close" size={22} /></button>
        </div>
      </div>
    </div>);
}

/* The whole screen. It takes the part's colour and flashes as each part
   starts, so a change shows even with the sound off. */
export function TimerFull({ T, rounds }) {
  const t = T.t; if (!t || !T.open) return null;
  const cur = t.steps[t.i] || { l: "COMPLETE", s: 1, t: "r" };
  const col = colourOf(t, cur);
  const total = t.steps.reduce((a, x) => a + x.s, 0), elapsed = t.steps.slice(0, t.i).reduce((a, x) => a + x.s, 0) + (t.done ? 0 : (cur.s - t.left));
  const nxt = t.steps[t.i + 1];
  const left = t.done ? 0 : Math.max(0, Math.min(1, t.left / (cur.s || 1)));
  /* the last ten seconds of the round, the rest or the part: the clock in red, a label in the ring, and a flash as they start */
  const ten = !t.done && beatAt(t.steps, t.i, t.left, rounds(t.kind)).ten;
  const R = 136, LEN = 2 * Math.PI * R, clock = t.done ? "✓" : mmss(t.left);
  const side = "min(310px, calc(100vw / var(--o8-zoom, 1) - 56px), calc(100vh / var(--o8-zoom, 1) - 430px))";
  const quiet = Object.assign({}, dsp, { flex: 1, minHeight: 64, borderRadius: RAD.m, border: "none", cursor: "pointer", background: C.raise, color: C.chalk, fontSize: FS.body, fontWeight: 700, letterSpacing: .4 });
  return (
    <div data-testid="timer-full" className="fade" style={{ position: "fixed", inset: 0, background: C.ink, zIndex: 100, display: "flex", flexDirection: "column", padding: 16, paddingTop: "calc(12px + env(safe-area-inset-top))", paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 70% at 50% 38%, " + soft(col) + " 0%, transparent 72%)", opacity: t.run ? 1 : .5, transition: "opacity .4s ease", pointerEvents: "none" }} />
      <div key={t.i + (ten ? "t" : "") + (t.done ? "d" : "")} aria-hidden="true" className="o8-flash" style={{ position: "absolute", inset: 0, background: ten ? C.bad : col, pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span data-testid="timer-title" style={Object.assign(cap(C.ash), { fontSize: FS.meta, minWidth: 0, overflowWrap: "anywhere" })}>{t.title}</span>
        <button onClick={() => T.setOpen(false)} style={Object.assign({}, dsp, { display: "flex", alignItems: "center", gap: 6, minHeight: 48, borderRadius: 999, border: "none", cursor: "pointer", background: C.raise, color: C.chalk, fontSize: FS.meta, fontWeight: 700, letterSpacing: .4, padding: "0 16px 0 12px" })}><Icon n="down" size={18} w={2.6} />MINIMISE</button>
      </div>
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div data-testid="timer-part" style={Object.assign({}, dsp, { fontSize: FS.lead, fontWeight: 800, letterSpacing: .4, lineHeight: 1.2, color: col, marginBottom: 14, padding: "0 10px" })}>{t.done ? "COMPLETE" : cur.l}</div>
        <div style={{ position: "relative", width: side, aspectRatio: "1 / 1", flexShrink: 0 }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true" style={{ display: "block", transform: "rotate(-90deg)" }}>
            <circle cx="150" cy="150" r={R} fill="none" style={{ stroke: soft(C.chalk), strokeWidth: 14 }} />
            <circle cx="150" cy="150" r={R} fill="none" style={{ stroke: ten ? C.bad : col, strokeWidth: 14, strokeLinecap: "round", strokeDasharray: LEN, strokeDashoffset: LEN * (1 - (t.done ? 1 : left)), transition: "stroke-dashoffset .25s linear, stroke .3s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div data-testid="timer-count" className={t.done ? "pop" : undefined} style={Object.assign({}, big, { fontSize: clock.length > 4 ? 78 : 98, fontWeight: 700, color: t.done ? C.accent : ten ? C.bad : C.chalk, lineHeight: 1, letterSpacing: -2 })}>{clock}</div>
          </div>
          {ten ? <div style={{ position: "absolute", left: 0, right: 0, top: "19%", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <span data-testid="timer-ten" className="o8-pulse" style={Object.assign(cap(C.on), { padding: "5px 12px", borderRadius: 999, background: C.bad })}>LAST 10 SECONDS</span>
          </div> : null}
        </div>
        {!t.done && cur.c ? <div style={Object.assign({}, bdy, { fontSize: FS.body, fontWeight: 500, color: C.chalk, marginTop: 14, lineHeight: 1.4, maxWidth: 380, padding: "0 6px" })}>{cur.c}</div> : null}
        <div style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 600, color: C.ash, marginTop: 12, letterSpacing: .6 })}>{t.done ? mmss(total) + " TOTAL" : "STEP " + (t.i + 1) + " / " + t.steps.length + " · " + mmss(total - elapsed) + " LEFT"}</div>
        <div aria-hidden="true" style={{ display: "flex", gap: 2, width: "100%", maxWidth: 340, marginTop: 10 }}>
          {t.steps.map((s, k) => <div key={k} style={{ flex: Math.max(1, s.s), height: 5, borderRadius: 3, background: k < t.i || t.done ? (s.t === "w" ? C.bad : C.warn) : k === t.i ? col : soft(C.chalk), opacity: k < t.i || t.done ? .5 : 1 }} />)}
        </div>
        {!t.done && nxt ? <div style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 600, color: C.ash, marginTop: 12, lineHeight: 1.35, padding: "0 8px" })}>NEXT · <span style={{ color: C.chalk }}>{nxt.l}</span> · {mmss(nxt.s)}</div> : null}
      </div>
      <div style={{ position: "relative", display: "flex", gap: 8 }}>
        <button onClick={T.reset} style={quiet}>RESET</button>
        <button onClick={T.toggle} disabled={t.done} style={Object.assign({}, quiet, { flex: 2, background: col, color: C.on, fontSize: FS.lead, fontWeight: 800, letterSpacing: .8, opacity: t.done ? .4 : 1 })}>{t.done ? "DONE" : t.run ? "PAUSE" : "START"}</button>
        <button onClick={T.skip} disabled={t.done} style={Object.assign({}, quiet, { opacity: t.done ? .4 : 1 })}>SKIP</button>
      </div>
      <button onClick={T.close} style={Object.assign({}, dsp, { position: "relative", marginTop: 8, minHeight: 48, background: "transparent", border: "none", cursor: "pointer", color: C.ash, fontSize: FS.meta, fontWeight: 700, letterSpacing: .4 })}>CLOSE TIMER</button>
    </div>);
}
