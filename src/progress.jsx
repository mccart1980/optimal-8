import React, { useState } from "react";
import { C, soft, dsp, bdy, mno, big, cap, RAD, FS, num, parseISO, Icon, Btn, Fld, Empty } from "./ui.jsx";
import { Trend, Spark, Delta, Stat, ChartCard } from "./charts.jsx";
import { parseKey, inScope, ergTotal } from "./metrics.js";

/* ================================================================
   PROGRESS — the numbers the training moves, drawn.

   Four things, each its own page: the lifts, the sprints, the fitness
   tests, and body weight against its target. Everything here reads
   what is already logged; nothing new is asked for except, if you want
   it, the morning's weight.
   ================================================================ */
const DAY_AT = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
/* "2 Nov" */
export const shortDate = (d) => { try { return parseISO(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch (e) { return String(d); } };
const stamp = (d) => { try { return parseISO(d).getTime() / 86400000; } catch (e) { return null; } };
const one = (v) => String(Math.round(v * 10) / 10);
const two = (v) => String(Math.round(v * 100) / 100);

/* every entry in the log for one exercise or test, oldest first, each
   with the day it was made: the entry's own date, or the date its week
   and day fall on (`isoOf`) */
export function entriesOf(log, match, view, isoOf) {
  const out = [];
  Object.keys(log || {}).forEach((k) => { const p = parseKey(k); if (!p || !inScope(view, p.macro) || !match(p.id)) return;
    const e = log[k] || {}, d = e.d && /^\d{4}-\d\d-\d\d$/.test(e.d) ? e.d : (isoOf ? isoOf(p) : null);
    out.push({ p, e, d, order: (d || "") + "|" + String(p.week).padStart(3, "0") + "|" + (DAY_AT[p.day] == null ? 9 : DAY_AT[p.day]) }); });
  return out.sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));
}
const rowOf = (x, v) => [x.d ? shortDate(x.d) : "Week " + x.p.week, v, x.d ? stamp(x.d) : null];
/* a number typed into one box, session by session */
export const boxSeries = (log, id, view, isoOf, field) => entriesOf(log, (i) => i === id, view, isoOf)
  .map((x) => rowOf(x, num(x.e[field || "w"]))).filter((r) => r[1] != null);

/* ---------- body weight ----------
   Every weight on file, one a day, from wherever it was written down:
   the morning scales, the weekly weigh-in, the tape, an imported file. */
export function weightSeries({ morning, tape, body, fuel }) {
  const by = {}, put = (d, v) => { const n = num(v); if (d && /^\d{4}-\d\d-\d\d$/.test(d) && n != null && n > 20 && n < 250) by[d] = n; };
  ((fuel && fuel.entries) || []).forEach((e) => e && put(e.d, e.bw));
  (body || []).forEach((e) => e && put(e.d, e.bw));
  (tape || []).forEach((e) => e && put(e.d, e.kg));
  Object.keys(morning || {}).forEach((d) => put(d, (morning[d] || {}).kg));
  return Object.keys(by).sort().map((d) => ({ d, kg: by[d] }));
}
export const weightData = (rows) => rows.map((r) => [shortDate(r.d), r.kg, stamp(r.d)]);

/* the chart, how far there is to go, and a box for today's weight */
export function WeightCard({ rows, goal, today, onAdd }) {
  const [kg, setKg] = useState("");
  const n = rows.length, last = n ? rows[n - 1] : null, first = n ? rows[0] : null;
  const gap = last && goal != null ? Math.round((last.kg - goal) * 10) / 10 : null;
  const v = num(String(kg).replace(",", ".")), ok = v != null && v > 20 && v < 250;
  const has = last && last.d === today;
  return (
    <ChartCard testid="weight-card" title={"Body weight" + (goal != null ? " to " + one(goal) + " kg" : "")} data={weightData(rows)} unit="kg" goal={goal} fmt={one} dir={goal != null && last && last.kg < goal ? "up" : "down"} icon="scale"
      empty="No weights yet. Type this morning's below and the line starts with the second one.">
      {last && goal != null ? (
        <div data-testid="weight-gap" style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <div style={{ flex: 1, background: soft(C.ash), borderRadius: RAD.m, padding: "10px 12px" }}>
            <div style={cap()}>{Math.abs(gap) < 0.05 ? "On target" : gap > 0 ? "To go" : "Under target"}</div>
            <div style={Object.assign({}, big, { fontVariantNumeric: "normal", fontSize: FS.lead, fontWeight: 700, color: C.chalk, lineHeight: 1.2, marginTop: 2 })}>{one(Math.abs(gap))}<span style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 600, color: C.ash })}> kg</span></div>
          </div>
          {n > 1 ? (
            <div style={{ flex: 1, background: soft(C.ash), borderRadius: RAD.m, padding: "10px 12px" }}>
              <div style={cap()}>Since {shortDate(first.d)}</div>
              <div style={Object.assign({}, big, { fontVariantNumeric: "normal", fontSize: FS.lead, fontWeight: 700, color: C.chalk, lineHeight: 1.2, marginTop: 2 })}>{(last.kg - first.kg > 0 ? "+" : last.kg - first.kg < 0 ? "−" : "") + one(Math.abs(last.kg - first.kg))}<span style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 600, color: C.ash })}> kg</span></div>
            </div>) : null}
        </div>) : null}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 12 }}>
        <label style={{ flex: 1, minWidth: 0 }}>
          <span style={Object.assign(cap(), { display: "block", marginBottom: 6 })}>{has ? "Today's weight (kg) · change it" : "This morning's weight (kg)"}</span>
          <Fld v={kg} on={setKg} ph={has ? one(last.kg) : "kg"} a="left" />
        </label>
        <Btn fill dis={!ok} on={() => { onAdd(String(v)); setKg(""); }} s={{ minWidth: 96 }}>SAVE</Btn>
      </div>
    </ChartCard>);
}

/* ---------- the lifts ---------- */
const doneSets = (e) => ((e && e.sets) || []).filter((x) => x && x.ok && num(x.w) != null);
/* every lift with a weight on it: the heaviest set of each session, oldest first */
export function liftSeries(log, view, isoOf) {
  const by = {};
  entriesOf(log, () => true, view, isoOf).forEach((x) => { const done = doneSets(x.e); if (!done.length) return;
    const L = by[x.p.id] || (by[x.p.id] = { id: x.p.id, n: null, rows: [] });
    L.rows.push(rowOf(x, Math.max.apply(null, done.map((s) => num(s.w))))); if (x.e.n) L.n = x.e.n; });
  return Object.keys(by).map((id) => by[id]);
}
/* `mains`: [[id, name]] drawn in full, first. `nameOf(id)`: a lift's
   name when its sets don't carry one. `added(id)`: the weight is added
   to bodyweight. */
export function LiftsCharts({ log, view, isoOf, mains, nameOf, added }) {
  const [open, setOpen] = useState(null);
  const all = liftSeries(log, view, isoOf), by = {}; all.forEach((x) => { by[x.id] = x; });
  const mainIds = (mains || []).map((m) => m[0]);
  const rest = all.filter((x) => mainIds.indexOf(x.id) < 0).sort((a, b) => (b.rows[b.rows.length - 1][2] || 0) - (a.rows[a.rows.length - 1][2] || 0) || String(a.n || a.id).localeCompare(String(b.n || b.id)));
  const say = (id) => (v) => (added && added(id) ? "+" : "") + one(v);
  return (
    <div data-testid="lifts-charts">
      {(mains || []).map((m) => <ChartCard key={m[0]} testid={"lift-" + m[0]} title={m[1]} data={by[m[0]] ? by[m[0]].rows : []} unit="kg" fmt={say(m[0])} dir="up" icon="bar"
        empty="No sets logged yet. The heaviest set of each session is drawn here." note={by[m[0]] && by[m[0]].rows.length > 1 ? "The heaviest set of each session." : null} />)}
      <div style={{ background: C.card, border: "1px solid " + C.edge, borderRadius: RAD.l, padding: "6px 16px", marginBottom: 12 }}>
        <div style={Object.assign({}, dsp, { fontSize: FS.body, fontWeight: 700, color: C.chalk, padding: "10px 0 6px" })}>Every other lift</div>
        {rest.length ? rest.map((x, i) => { const n = x.rows.length, last = x.rows[n - 1], prev = n > 1 ? x.rows[n - 2] : null, on = open === x.id, f = say(x.id);
          return (
            <div key={x.id} data-lift-history={x.id} style={{ borderTop: "1px solid " + C.line }}>
              <button onClick={() => setOpen(on ? null : x.id)} aria-expanded={on} style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, textAlign: "left", background: "transparent", border: "none", padding: "10px 0", minHeight: 60, cursor: "pointer" }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, fontWeight: 600, color: C.chalk, lineHeight: 1.3 })}>{x.n || (nameOf ? nameOf(x.id) : x.id)}</span>
                  <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.meta, color: C.ash, marginTop: 1 })}>{last[0]}{n > 1 ? " · " + n + " sessions" : ""}</span>
                </span>
                {n > 1 ? <Spark values={x.rows.map((r) => r[1])} w={56} /> : null}
                <span style={{ textAlign: "right", flexShrink: 0, minWidth: 74 }}>
                  <span style={Object.assign({}, big, { fontVariantNumeric: "normal", display: "block", fontSize: FS.body, fontWeight: 700, color: C.chalk, whiteSpace: "nowrap" })}>{f(last[1])}<span style={Object.assign({}, mno, { fontSize: FS.micro, fontWeight: 600, color: C.ash })}> kg</span></span>
                  {prev ? <Delta d={last[1] - prev[1]} good={Math.abs(last[1] - prev[1]) < 1e-9 ? null : last[1] > prev[1]} /> : null}
                </span>
                <span style={{ color: C.ash, flexShrink: 0 }}><Icon n={on ? "up" : "down"} size={18} w={2.4} /></span>
              </button>
              {on ? (n > 1 ? <div className="rise" style={{ paddingBottom: 12 }}><Trend data={x.rows} unit="kg" fmt={f} /></div>
                : <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, padding: "0 0 12px" })}>One session so far. The line starts with the second.</div>) : null}
            </div>); })
          : <Empty icon="bar" title="No weights logged yet" testid="lifts-empty">Type the weight in the box above an exercise's sets, then log the sets. Each lift gets its own line here.</Empty>}
      </div>
    </div>);
}

/* ---------- the sprints ----------
   The heavy sled: the time of a run at the load on the sled, session by
   session, and the load. The bursts: the session's total. */
export function SprintsPage({ log, view, isoOf, bursts, unit, sledIds }) {
  const ids = sledIds || ["sled"];
  const runs = entriesOf(log, (id) => ids.indexOf(id) >= 0, view, isoOf).filter((x) => num(x.e.t) != null || num(x.e.w) != null);
  const time = runs.filter((x) => num(x.e.t) != null).map((x) => rowOf(x, num(x.e.t)));
  const load = runs.filter((x) => num(x.e.w) != null).map((x) => rowOf(x, num(x.e.w)));
  const lastRun = runs[runs.length - 1];
  return (
    <div data-testid="sprints-page">
      <ChartCard testid="sled-time" title="Heavy sled sprint · time over 20 m" data={time} unit="s" fmt={two} dir="down" icon="bolt"
        empty="Nothing logged yet. The load and the time have their boxes on the sled's card."
        note={lastRun && num(lastRun.e.w) != null && time.length ? "Last run with " + one(num(lastRun.e.w)) + " kg on the sled. Faster at the same load is the number moving." : null} />
      <ChartCard testid="sled-load" title="Heavy sled sprint · load" data={load} unit="kg" fmt={one} dir="up" icon="bolt"
        empty="Nothing logged yet." />
      {(bursts || []).length ? bursts.map((b) => (
        <ChartCard key={b.n} testid="bursts-total" title={b.n + " · the session's total"} data={b.rows} unit={unit} fmt={one} dir="up" icon="bolt" />))
        : <ChartCard testid="bursts-total" title="6-second bursts · the session's total" data={[]} unit={unit} icon="bolt" empty="Nothing logged yet. The total goes in the box on the bursts' card when the timer says done." />}
    </div>);
}

/* an interval session's total, session by session: the one number logged at the end */
export function ergRows(log, id, view, isoOf, kinds) {
  return entriesOf(log, (i) => i === id + "_erg", view, isoOf).filter((x) => !kinds || !x.e.kind || kinds.indexOf(x.e.kind) >= 0)
    .map((x) => rowOf(x, ergTotal(x.e.v || []))).filter((r) => r[1] != null);
}

/* ---------- a row of two number cards ---------- */
export const StatRow = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>{children}</div>;
export { Stat, ChartCard, Trend };
