import React, { useState } from "react";
import { createPortal } from "react-dom";
import { C, soft, dsp, bdy, mno, big, cap, RAD, FS, Icon, CheckDot, Meter } from "./ui.jsx";

/* ================================================================
   HOME AND THE SESSION SCREEN

   HOME is TODAY as it opens: where you are in the programme, this
   week, today's session with one button to start it, and the day's
   running order beneath. THE SESSION SCREEN is one thing at a time,
   over the whole phone: the card, and under the thumb a bar that never
   moves — back, LOG SET, NEXT.
   ================================================================ */
const arrow = (dis) => ({ flexShrink: 0, width: 48, height: 48, borderRadius: 999, cursor: dis ? "default" : "pointer", padding: 0,
  display: "flex", alignItems: "center", justifyContent: "center", background: dis ? "transparent" : soft(C.ash), color: dis ? C.ring : C.chalk, border: "none" });

/* ---------- where you are: the programme, the week, the seven days ----------
   `nav`: { title, sub, atFirst, atLast, step(±1), pickOpen, setPickOpen,
   pos: { n, m } (week n of m), under (a line under the title), weeks: [{ w, label, name, on, now,
   tag ("light" | "test"), dot ("done" | "part") }], goWeek(w),
   days: [{ k, letter, date, state: "done" | "part" | "todo" | "rest", on, now, name }], goDay(k) } */
export function WeekCard({ nav }) {
  const pos = nav.pos;
  return (
    <div data-testid="week-card" style={{ background: C.card, border: "1px solid " + C.edge, borderRadius: RAD.l, padding: "12px 12px 14px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={() => nav.step(-1)} disabled={nav.atFirst} aria-label={nav.prevLabel || "Previous week"} style={arrow(nav.atFirst)}><Icon n="left" size={22} w={2.6} /></button>
        <button onClick={() => nav.setPickOpen(!nav.pickOpen)} aria-expanded={nav.pickOpen} aria-label="Pick a week"
          style={{ flex: 1, minWidth: 0, minHeight: 52, background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", textAlign: "center" }}>
          <span style={Object.assign(cap(), { display: "block", lineHeight: 1.3 })}>{nav.sub}</span>
          <span style={Object.assign({}, dsp, { display: "inline-flex", alignItems: "center", gap: 4, fontSize: FS.lead, fontWeight: 800, letterSpacing: -.3, lineHeight: 1.2, color: C.chalk })}>
            <span data-testid="week-title">{nav.title}</span><span aria-hidden="true" style={{ color: C.ash }}><Icon n={nav.pickOpen ? "up" : "down"} size={18} w={2.6} /></span></span>
          {nav.under ? <span data-testid="week-under" style={Object.assign(cap(C.chalk), { display: "block", lineHeight: 1.3, marginTop: 2 })}>{nav.under}</span> : null}
        </button>
        <button onClick={() => nav.step(1)} disabled={nav.atLast} aria-label={nav.nextLabel || "Next week"} style={arrow(nav.atLast)}><Icon n="right" size={22} w={2.6} /></button>
      </div>
      {/* the programme, a block a week: done, here, to come */}
      {pos && pos.m > 1 ? (
        <div data-testid="programme-bar" role="img" aria-label={"Week " + pos.n + " of " + pos.m} style={{ display: "flex", gap: 3, margin: "10px 4px 0" }}>
          {Array.from({ length: pos.m }).map((_, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 999, background: i + 1 === pos.n ? C.chalk : i + 1 < pos.n ? C.accent : soft(C.chalk), transition: "background-color .3s ease" }} />)}
        </div>) : null}
      {nav.pickOpen ? (
        <div data-testid="week-picker" className="rise" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginTop: 12 }}>
          {nav.weeks.map((x, i) => <button key={x.w + "-" + i} onClick={() => nav.goWeek(x.w)} aria-label={x.name} data-week-tag={x.tag || undefined}
            style={Object.assign({}, big, { minHeight: 52, fontSize: FS.body, fontWeight: 700, lineHeight: 1.1, borderRadius: RAD.s, cursor: "pointer", padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
              background: x.on ? C.accent : soft(C.ash), color: x.on ? C.on : C.chalk, border: "1.5px solid " + (x.on ? C.accent : x.now ? C.accent : "transparent") })}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{x.label}{x.dot ? <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: x.on ? C.on : x.dot === "done" ? C.accent : C.warn }} /> : null}</span>
            {x.tag ? <span style={Object.assign({}, mno, { fontSize: FS.micro, fontWeight: 600, color: x.on ? C.on : C.ash })}>{x.tag}</span> : null}
          </button>)}
        </div>) : null}
      {/* the seven days */}
      {nav.days && nav.days.length ? <div data-testid="day-strip" style={{ display: "flex", gap: 4, marginTop: 14 }}>
        {nav.days.map((d) => { const done = d.state === "done";
          return (
            <button key={d.k} onClick={() => nav.goDay(d.k)} aria-pressed={d.on} aria-label={d.name} data-day={d.k} data-day-state={d.state}
              style={{ flex: 1, minWidth: 0, minHeight: 72, borderRadius: RAD.m, cursor: "pointer", padding: "8px 0 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: d.on ? C.accent : "transparent", color: d.on ? C.on : C.chalk, border: "1.5px solid " + (d.on ? C.accent : d.now ? C.accent : "transparent") }}>
              <span style={Object.assign({}, mno, { fontSize: FS.micro, fontWeight: 700, letterSpacing: .6, color: d.on ? C.on : C.ash })}>{d.letter}</span>
              <span style={Object.assign({}, big, { fontSize: FS.body, fontWeight: 700, lineHeight: 1.1, opacity: d.state === "rest" && !d.on ? .5 : 1 })}>{d.date}</span>
              <span aria-hidden="true" style={{ height: 14, display: "flex", alignItems: "center", justifyContent: "center", color: d.on ? C.on : C.accent }}>
                {done ? <Icon n="check" size={14} w={3.4} />
                  : d.state === "part" ? <span style={{ width: 6, height: 6, borderRadius: 999, background: d.on ? C.on : C.warn }} />
                  : d.state === "rest" ? <span style={{ width: 8, height: 2, borderRadius: 999, background: d.on ? C.on : C.ring }} />
                  : <span style={{ width: 6, height: 6, borderRadius: 999, border: "1.5px solid " + (d.on ? C.on : C.ring) }} />}
              </span>
            </button>); })}
      </div> : null}
    </div>);
}

/* ---------- today's session, and the one button that starts it ----------
   `hero`: { over, title, text, facts: [..], done, total, state: "rest" |
   "todo" | "going" | "done", go(), label } */
export function Hero({ hero }) {
  const rest = hero.state === "rest", fin = hero.state === "done";
  return (
    <div data-testid="session-hero" data-state={hero.state} style={{ background: C.card, border: "1px solid " + C.edge, borderRadius: RAD.l, padding: 18, marginBottom: 12 }}>
      <div style={cap()}>{hero.over}</div>
      <h2 data-testid="hero-title" style={Object.assign({}, dsp, { margin: "6px 0 0", fontSize: FS.title, fontWeight: 800, letterSpacing: -.6, lineHeight: 1.12, color: C.chalk, overflowWrap: "anywhere" })}>{hero.title}</h2>
      {hero.text ? <p style={Object.assign({}, bdy, { margin: "8px 0 0", fontSize: FS.meta, lineHeight: 1.45, color: C.ash })}>{hero.text}</p> : null}
      {hero.facts && hero.facts.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {hero.facts.map((f) => <span key={f} style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 700, color: C.chalk, background: soft(C.ash), borderRadius: 999, padding: "6px 12px", whiteSpace: "nowrap" })}>{f}</span>)}
        </div>) : null}
      {rest ? null : (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={cap()}>{fin ? "Session done" : "Exercises"}</span>
            <span data-testid="hero-count" style={Object.assign({}, big, { fontSize: FS.meta, fontWeight: 700, color: fin ? C.accent : C.chalk })}>{hero.done} of {hero.total}</span>
          </div>
          <Meter v={hero.total ? hero.done / hero.total : 0} h={8} label="The session" testid="session-progress" />
        </div>)}
      {hero.go ? (
        <button onClick={hero.go} data-testid="hero-go" style={Object.assign({}, dsp, { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 64, marginTop: 16, borderRadius: RAD.m, border: "none", cursor: "pointer",
          background: fin ? soft(C.ash) : C.accent, color: fin ? C.chalk : C.on, fontSize: FS.lead, fontWeight: 800, letterSpacing: .8 })}>
          {fin ? null : <Icon n="play" size={20} />}{hero.label}</button>) : null}
    </div>);
}

/* ---------- what the day is on, when it isn't the session ---------- */
export function NowRow({ over, name, sub, on, done }) {
  return (
    <button onClick={on} data-testid="now-row" style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, textAlign: "left", background: C.card, border: "1px solid " + C.edge, borderRadius: RAD.l, padding: "12px 14px 12px 16px", minHeight: 72, marginBottom: 12, cursor: "pointer" }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={Object.assign(cap(done ? C.ash : C.accent), { display: "block" })}>{over}</span>
        <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, fontWeight: 700, color: C.chalk, lineHeight: 1.3, marginTop: 2 })}>{name}</span>
        {sub ? <span style={Object.assign({}, mno, { display: "block", fontSize: FS.meta, color: C.ash, lineHeight: 1.35, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{sub}</span> : null}
      </span>
      {done ? <CheckDot ok size={32} /> : <span style={{ width: 44, height: 44, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: soft(C.ash), color: C.chalk }}><Icon n="right" size={22} w={2.4} /></span>}
    </button>);
}

/* a small heading over a block of the page */
export const Section = ({ children, right }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, margin: "20px 4px 10px" }}>
    <h3 style={Object.assign({}, dsp, { margin: 0, fontSize: FS.lead, fontWeight: 800, letterSpacing: -.3, color: C.chalk })}>{children}</h3>
    {right ? <span style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 600, color: C.ash, whiteSpace: "nowrap" })}>{right}</span> : null}
  </div>);

/* ================================================================
   THE SESSION SCREEN
   ================================================================ */
export const ACT_H = 84;      // the bar under the thumb, before the phone's own inset

/* The button LOG SET, put into the bar by the card that owns the sets:
   it logs the next set that isn't done, exactly as a tap on its row does. */
export function LogSet({ slot, n, what, text, on }) {
  if (!slot) return null;
  return createPortal(
    <button onClick={on} data-testid="log-set" aria-label={"Log " + what + " " + n}
      style={Object.assign({}, dsp, { flex: 1, minWidth: 0, minHeight: 64, borderRadius: RAD.m, border: "none", cursor: "pointer", background: C.accent, color: C.on, padding: "6px 10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 })}>
      <span style={{ fontSize: FS.lead, fontWeight: 800, letterSpacing: .8, lineHeight: 1.15, whiteSpace: "nowrap" }}>LOG {what.toUpperCase()} {n}</span>
      {text ? <span style={Object.assign({}, mno, { fontSize: FS.cap, fontWeight: 700, lineHeight: 1.2, opacity: .8, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{text}</span> : null}
    </button>, slot);
}

/* `label`: "NOW · 03:43 · 3 OF 9". `list`: the session's cards, for the
   jump list. `setSlot`: where a card puts its LOG SET button. */
export function Focus({ id, label, pct, onHome, list, onPick, canBack, onBack, onNext, nextLabel, setSlot, dockUp, children, footer }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid="today-now" className="fade" style={{ position: "fixed", inset: 0, zIndex: 60, background: C.ink, display: "flex", flexDirection: "column" }}>
      <div className="o8-glass" style={{ flexShrink: 0, background: C.slab, borderBottom: "1px solid " + C.line, paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 640, margin: "0 auto", padding: "6px 12px 8px", paddingLeft: "max(12px, env(safe-area-inset-left))", paddingRight: "max(12px, env(safe-area-inset-right))" }}>
          <button onClick={onHome} aria-label="WHOLE DAY" style={arrow(false)}><Icon n="left" size={22} w={2.6} /></button>
          <span data-testid="now-label" style={Object.assign({}, mno, { flex: 1, minWidth: 0, textAlign: "center", fontSize: FS.meta, fontWeight: 700, letterSpacing: .6, color: C.chalk, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{label}</span>
          {list ? <button onClick={() => setOpen(true)} aria-label="SESSION LIST" aria-expanded={open} style={arrow(false)}><Icon n="list" size={22} w={2.4} /></button>
            : <span aria-hidden="true" style={{ width: 48, flexShrink: 0 }} />}
        </div>
        <Meter v={pct / 100} h={3} label="The day" testid="day-progress" track="transparent" />
      </div>
      <div key={id} data-testid="focus-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px " + (dockUp ? 120 : 28) + "px", paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))" }}>
          {children}
          {footer || null}
        </div>
      </div>
      <div className="o8-glass" data-testid="action-bar" style={{ flexShrink: 0, background: C.slab, borderTop: "1px solid " + C.line, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="o8-act" style={{ display: "flex", gap: 8, maxWidth: 640, margin: "0 auto", padding: "10px 12px", paddingLeft: "max(12px, env(safe-area-inset-left))", paddingRight: "max(12px, env(safe-area-inset-right))" }}>
          <button onClick={onBack} disabled={!canBack} aria-label="Back to the item before"
            style={{ width: 60, minHeight: 64, flexShrink: 0, borderRadius: RAD.m, border: "none", cursor: canBack ? "pointer" : "default", background: soft(C.ash), color: C.chalk, opacity: canBack ? 1 : .38, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="left" size={24} w={2.6} /></button>
          <span ref={setSlot} className="o8-slot" />
          <button onClick={onNext} className="o8-next" style={Object.assign({}, dsp, { minWidth: 0, minHeight: 64, borderRadius: RAD.m, border: "none", cursor: "pointer", fontSize: FS.lead, fontWeight: 800, letterSpacing: .8 })}>{nextLabel}</button>
        </div>
      </div>
      {open && list ? (
        <div className="fade" onClick={() => setOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 5, background: C.scrim, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div data-testid="session-list" className="sheet" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: "24px 24px 0 0", maxHeight: "78%", display: "flex", flexDirection: "column", boxShadow: C.lift, paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 12px 8px 20px" }}>
              <span style={Object.assign({}, dsp, { flex: 1, fontSize: FS.lead, fontWeight: 800, letterSpacing: -.3, color: C.chalk })}>The session</span>
              <button onClick={() => setOpen(false)} aria-label="CLOSE" style={arrow(false)}><Icon n="close" size={22} w={2.4} /></button>
            </div>
            <div style={{ overflowY: "auto", padding: "0 12px 12px 12px" }}>
              {list.map((g, i) => (
                <button key={g.id} onClick={() => { onPick(g.id); setOpen(false); }} style={{ display: "flex", width: "100%", gap: 12, alignItems: "center", textAlign: "left", background: g.cur ? soft(C.accent) : "transparent", border: "none", borderRadius: RAD.m, padding: "10px 8px", minHeight: 60, cursor: "pointer" }}>
                  <span style={{ width: 32, display: "flex", justifyContent: "center", flexShrink: 0 }}><CheckDot ok={!!g.done} size={26} /></span>
                  <span style={Object.assign({}, bdy, { flex: 1, minWidth: 0, fontSize: FS.body, fontWeight: 700, lineHeight: 1.3, color: g.done && !g.cur ? C.ash : C.chalk })}>{g.n}</span>
                  <span style={Object.assign({}, big, { fontSize: FS.meta, fontWeight: 700, color: C.ash, flexShrink: 0 })}>{i + 1}</span>
                </button>))}
            </div>
          </div>
        </div>) : null}
    </div>);
}

/* what sits in the page's style sheet for the bar: NEXT is the button to
   press until a card puts LOG SET beside it, then it steps back */
export const ACT_CSS = `
.o8-slot { display: flex; flex: 2.3 1 0; min-width: 0; }
.o8-slot:empty { display: none; }
.o8-next { flex: 2.3 1 0; background: var(--o8-accent); color: var(--o8-on); }
.o8-slot:not(:empty) ~ .o8-next { flex: 1 1 0; background: var(--o8-soft-ash); color: var(--o8-chalk); }
[data-testid="today-now"]:has([data-main]) .o8-next { background: var(--o8-soft-ash); color: var(--o8-chalk); }
`;
