import React, { useState } from "react";
import { C, soft, dsp, bdy, mno, big, cap, RAD, FS, Icon } from "./ui.jsx";

/* ================================================================
   THE CHARTS — one way of drawing a number over time, used on every
   screen that has one.

   A trend is a thin line with a faint wash under it, hairline rules
   behind, and a ringed dot on the latest reading. Words and numbers
   are always in the text colours; only the line itself is coloured. A
   target is a dashed line with its name on it. Touch the chart and a
   hairline finds the nearest reading and says what it was; every
   reading can also be read as a list under the chart, so nothing is
   only on a tooltip. With one reading it shows the number; with none,
   it says what will fill it.
   ================================================================ */
const fmt1 = (v) => (Math.abs(v) >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10));
/* round steps for the rules behind a chart: 1, 2, 2.5 or 5 times a power of ten */
function niceStep(span, n) {
  const raw = span / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
export function scaleFor(values, goal) {
  const all = values.concat(goal != null ? [goal] : []);
  let lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
  if (lo === hi) { const pad = Math.abs(lo) * 0.05 || 1; lo -= pad; hi += pad; }
  const step = niceStep(hi - lo, 3);
  const y0 = Math.floor(lo / step) * step, y1 = Math.ceil(hi / step) * step;
  const ticks = []; for (let v = y0; v <= y1 + step / 1000; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return { y0, y1, ticks, step };
}

/* `data`: [[label, value, time]], oldest first. `time` (a number that
   grows with the date) spaces the readings by when they were; without
   it they sit one after another. `goal` draws the target. `fmt` writes
   a value; `unit` follows it. */
export function Trend({ data, unit, goal, goalLabel, fmt, h, testid }) {
  const [at, setAt] = useState(null);
  const rows = (data || []).filter((d) => d && d[1] != null && !isNaN(d[1]));
  if (rows.length < 2) return null;
  const say = fmt || fmt1, H = h || 150;
  const vals = rows.map((d) => d[1]), sc = scaleFor(vals, goal);
  const timed = rows.every((d) => typeof d[2] === "number") && rows[rows.length - 1][2] > rows[0][2];
  const xs = rows.map((d, i) => (timed ? (d[2] - rows[0][2]) / (rows[rows.length - 1][2] - rows[0][2]) : i / (rows.length - 1)) * 100);
  const yOf = (v) => (1 - (v - sc.y0) / (sc.y1 - sc.y0 || 1)) * 100;
  const ys = vals.map(yOf);
  const line = xs.map((x, i) => (i ? "L" : "M") + x.toFixed(2) + " " + ys[i].toFixed(2)).join(" ");
  const last = rows.length - 1, sel = at == null ? null : Math.max(0, Math.min(last, at));
  const pickAt = (e) => { const r = e.currentTarget.getBoundingClientRect(); if (!r.width) return;
    const f = ((e.clientX - r.left) / r.width) * 100; let best = 0;
    xs.forEach((x, i) => { if (Math.abs(x - f) < Math.abs(xs[best] - f)) best = i; });
    setAt(best); };
  const key = (e) => { if (e.key === "ArrowLeft") { setAt(sel == null ? last : Math.max(0, sel - 1)); e.preventDefault(); }
    else if (e.key === "ArrowRight") { setAt(sel == null ? 0 : Math.min(last, sel + 1)); e.preventDefault(); }
    else if (e.key === "Escape") setAt(null); };
  const GUT = 40, FOOT = 24, TOP = 10, RIGHT = 12;
  const dot = (i, r, fill) => <span key={"d" + i} aria-hidden="true" style={{ position: "absolute", left: xs[i] + "%", top: ys[i] + "%", width: r * 2, height: r * 2, margin: -r, borderRadius: 999, background: fill, boxShadow: "0 0 0 2px " + C.card, pointerEvents: "none" }} />;
  return (
    <div data-testid={testid || "trend"} data-points={rows.length} className="fade" style={{ position: "relative", height: H + FOOT + TOP, marginTop: 6 }}>
      {/* the rules and their numbers */}
      {sc.ticks.map((t) => (
        <React.Fragment key={t}>
          <span aria-hidden="true" style={{ position: "absolute", left: GUT, right: RIGHT, top: TOP + (yOf(t) / 100) * H, height: 1, background: C.line }} />
          <span aria-hidden="true" style={Object.assign({}, mno, { position: "absolute", left: 0, width: GUT - 8, textAlign: "right", top: TOP + (yOf(t) / 100) * H - 8, fontSize: FS.micro, lineHeight: "16px", color: C.ash })}>{say(t)}</span>
        </React.Fragment>))}
      {/* the plot */}
      <div role="img" tabIndex={0} aria-label={rows.length + " readings, the latest " + say(vals[last]) + (unit ? " " + unit : "") + " on " + rows[last][0] + ". Left and right arrows step through them."}
        onPointerDown={pickAt} onPointerMove={(e) => { if (e.buttons || e.pointerType === "mouse") pickAt(e); }} onKeyDown={key} onBlur={() => setAt(null)}
        style={{ position: "absolute", left: GUT, right: RIGHT, top: TOP, height: H, touchAction: "pan-y", cursor: "crosshair", outlineOffset: 4, borderRadius: RAD.s }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
          <path d={line + " L" + xs[last].toFixed(2) + " 100 L" + xs[0].toFixed(2) + " 100 Z"} style={{ fill: C.accent, opacity: .1 }} />
          {goal != null ? <line x1="0" x2="100" y1={yOf(goal)} y2={yOf(goal)} vectorEffect="non-scaling-stroke" style={{ stroke: C.chalk, strokeWidth: 1.5, strokeDasharray: "5 5", opacity: .7 }} /> : null}
          <path d={line} vectorEffect="non-scaling-stroke" style={{ fill: "none", stroke: C.accent, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" }} />
          {sel != null ? <line x1={xs[sel]} x2={xs[sel]} y1="0" y2="100" vectorEffect="non-scaling-stroke" style={{ stroke: C.ash, strokeWidth: 1 }} /> : null}
        </svg>
        {rows.length <= 16 ? rows.map((_, i) => (i === last ? null : dot(i, 2.5, C.accent))) : null}
        {dot(last, 5, C.accent)}
        {sel != null && sel !== last ? dot(sel, 5, C.chalk) : null}
        {goal != null ? <span style={Object.assign({}, mno, { position: "absolute", right: 0, top: "calc(" + yOf(goal) + "% - 22px)", fontSize: FS.micro, fontWeight: 700, color: C.chalk, background: C.card, padding: "0 0 0 6px", lineHeight: "18px", whiteSpace: "nowrap" })}>{goalLabel || "Target " + say(goal) + (unit ? " " + unit : "")}</span> : null}
        {sel != null ? (
          <span data-testid="trend-tip" style={Object.assign({}, mno, { position: "absolute", left: "clamp(0px, calc(" + xs[sel] + "% - 60px), calc(100% - 120px))", width: 120, top: -6, transform: "translateY(-100%)", textAlign: "center", background: C.card2, border: "1px solid " + C.line, borderRadius: RAD.s, padding: "6px 8px", boxShadow: C.lift, pointerEvents: "none", zIndex: 2 })}>
            <span style={{ display: "block", fontSize: FS.meta, fontWeight: 700, color: C.chalk, lineHeight: 1.2 }}>{say(vals[sel])}{unit ? " " + unit : ""}</span>
            <span style={{ display: "block", fontSize: FS.micro, color: C.ash, lineHeight: 1.3 }}>{rows[sel][0]}</span>
          </span>) : null}
      </div>
      {/* the first and the last reading's own labels */}
      <span aria-hidden="true" style={Object.assign({}, mno, { position: "absolute", left: GUT, bottom: 0, fontSize: FS.micro, color: C.ash, lineHeight: "16px", whiteSpace: "nowrap" })}>{rows[0][0]}</span>
      <span aria-hidden="true" style={Object.assign({}, mno, { position: "absolute", right: RIGHT, bottom: 0, fontSize: FS.micro, color: C.ash, lineHeight: "16px", whiteSpace: "nowrap" })}>{rows[last][0]}</span>
    </div>);
}

/* the shape of a number's recent past, with nothing around it */
export function Spark({ values, w, h }) {
  const v = (values || []).filter((x) => x != null && !isNaN(x)); if (v.length < 2) return null;
  const W = w || 72, H = h || 28, lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), span = hi - lo || 1;
  const pts = v.map((x, i) => [(i / (v.length - 1)) * (W - 8) + 4, H - 4 - ((x - lo) / span) * (H - 8)]);
  return (
    <svg width={W} height={H} viewBox={"0 0 " + W + " " + H} aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path d={pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ")} style={{ fill: "none", stroke: C.ring, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" }} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" style={{ fill: C.accent, stroke: C.card, strokeWidth: 2 }} />
    </svg>);
}

/* which way a number moved, said in a word and an arrow as well as a
   colour: `good` true is the right way, false the wrong way, null neither */
export function Delta({ d, unit, good, fmt }) {
  if (d == null || isNaN(d)) return null;
  const flat = Math.abs(d) < 1e-9, col = flat || good == null ? C.ash : good ? C.accent : C.bad;
  return (
    <span data-testid="delta" style={Object.assign({}, mno, { display: "inline-flex", alignItems: "center", gap: 3, fontSize: FS.meta, fontWeight: 700, color: col, whiteSpace: "nowrap" })}>
      {flat ? null : <Icon n={d > 0 ? "up" : "down"} size={14} w={3} />}{flat ? "no change" : (d > 0 ? "+" : "−") + (fmt || fmt1)(Math.abs(d)) + (unit ? " " + unit : "")}
    </span>);
}

/* one number on a card: its name, the number, how it moved, its shape */
export function Stat({ label, value, unit, d, good, sub, values, on, testid }) {
  const Tag = on ? "button" : "div";
  return (
    <Tag onClick={on} data-testid={testid} style={{ display: "block", width: "100%", textAlign: "left", background: C.card, border: "1px solid " + C.edge, borderRadius: RAD.l, padding: 14, cursor: on ? "pointer" : "default", minWidth: 0 }}>
      <span style={Object.assign(cap(), { display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{label}</span>
      <span style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
        <span style={Object.assign({}, big, { fontVariantNumeric: "normal", fontSize: FS.title, fontWeight: 700, color: value == null ? C.ash : C.chalk, lineHeight: 1.05, letterSpacing: -.5, whiteSpace: "nowrap" })}>
          {value == null ? "—" : value}{value != null && unit ? <span style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 600, color: C.ash, letterSpacing: 0 })}> {unit}</span> : null}
        </span>
        <Spark values={values} />
      </span>
      <span style={{ display: "block", minHeight: 20, marginTop: 6 }}>
        {d != null ? <Delta d={d} good={good} /> : <span style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash })}>{sub || ""}</span>}
      </span>
    </Tag>);
}

/* A chart on a card: its name, the latest number and how it moved, the
   trend, a line of explanation, and the readings as a list on request.
   With one reading there is no line to draw: the number stands alone.
   With none, `empty` says what will fill it. */
export function ChartCard({ title, data, unit, goal, goalLabel, fmt, dir, note, empty, icon, testid, right, children }) {
  const [list, setList] = useState(false);
  const rows = (data || []).filter((d) => d && d[1] != null && !isNaN(d[1]));
  const say = fmt || fmt1, n = rows.length, last = n ? rows[n - 1] : null, prev = n > 1 ? rows[n - 2] : null;
  const d = prev ? last[1] - prev[1] : null;
  return (
    <div data-testid={testid || "chart-card"} data-chart-points={n} style={{ background: C.card, border: "1px solid " + C.edge, borderRadius: RAD.l, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={Object.assign({}, dsp, { fontSize: FS.body, fontWeight: 700, color: C.chalk, lineHeight: 1.25 })}>{title}</div>
          {last ? <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, marginTop: 2 })}>{last[0]}{n > 1 ? " · " + n + " readings" : ""}</div> : null}
        </div>
        {last ? (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={Object.assign({}, big, { fontVariantNumeric: "normal", fontSize: FS.lead, fontWeight: 700, color: C.chalk, lineHeight: 1.15, whiteSpace: "nowrap" })}>{say(last[1])}{unit ? <span style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 600, color: C.ash })}> {unit}</span> : null}</div>
            {d != null ? <Delta d={d} fmt={say} good={dir == null ? null : Math.abs(d) < 1e-9 ? null : dir === "down" ? d < 0 : d > 0} /> : null}
          </div>) : right || null}
      </div>
      {n >= 2 ? <Trend data={rows} unit={unit} goal={goal} goalLabel={goalLabel} fmt={fmt} />
        : n === 1 ? <div data-testid="chart-one" style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, lineHeight: 1.5, marginTop: 10 })}>One reading so far. The line starts with the second.{goal != null ? " " + (goalLabel || "Target " + say(goal) + (unit ? " " + unit : "")) + "." : ""}</div>
        : (
          <div data-testid="chart-empty" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, padding: 14, borderRadius: RAD.m, background: soft(C.ash) }}>
            <span style={{ color: C.ash, flexShrink: 0 }}><Icon n={icon || "progress"} size={24} /></span>
            <span style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, lineHeight: 1.45 })}>{empty || "Nothing logged yet."}</span>
          </div>)}
      {children || null}
      {note ? <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, lineHeight: 1.5, marginTop: 10 })}>{note}</div> : null}
      {n >= 2 ? (
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setList(!list)} aria-expanded={list} style={Object.assign({}, dsp, { display: "inline-flex", alignItems: "center", gap: 4, minHeight: 44, background: "transparent", border: "none", padding: "0 4px 0 0", cursor: "pointer", color: C.ash, fontSize: FS.meta, fontWeight: 700 })}>{list ? "Hide the numbers" : "Show the numbers"}<Icon n={list ? "up" : "down"} size={16} w={2.6} /></button>
          {list ? (
            <div data-testid="chart-list" className="rise">
              {rows.slice().reverse().slice(0, 30).map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: "1px solid " + C.line }}>
                  <span style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash })}>{r[0]}</span>
                  <span style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 700, color: C.chalk })}>{say(r[1])}{unit ? " " + unit : ""}</span>
                </div>))}
            </div>) : null}
        </div>) : null}
    </div>);
}
