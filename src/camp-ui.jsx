import React, { useState } from "react";
import { C, bdy, mno, num, r25, DAYS, DSH, Card, Eye, Lab, Fld, Btn, Note } from "./ui.jsx";
import {
  CAMP_L, campRxFor, campRow, campDatesLabel, campDayLabel, CPH,
  CAMP_TABLE_NOTE, CAMP_TEST_INTRO, CAMP_TARGETS, WORKING_WEIGHT_RULE, CAMP_INTRO, CAMP_PHILOSOPHY,
  FIGHT_WEEK_INTRO, FIGHT_WEEK_ROWS, FIGHT_WEEK_FOOD, FIGHT_WEEK_AFTER,
  scoredWeeks, campTestWeeks, PHASE_NAME, OUTPUT_RULE, CAMP_RULES,
} from "./camp.js";

/* ================================================================
   CAMP — the views the camp needs that the Fighter hasn't got: the
   dated ten-week table, the fight-week layout, the working-weight
   panel that sits on every main lift, and the camp's numbers.
   ================================================================ */

const Head = ({ children, w }) => (
  <th style={Object.assign({}, mno, { fontSize: 7.5, letterSpacing: 1, color: C.ash, textAlign: "left", padding: "6px 5px", borderBottom: "1px solid " + C.line, whiteSpace: "nowrap", width: w })}>{children}</th>);
const Cell = ({ children, c, b }) => (
  <td style={Object.assign({}, bdy, { fontSize: 10.5, color: c || C.chalk, padding: "7px 5px", borderBottom: "1px solid " + C.line, lineHeight: 1.35, verticalAlign: "top", fontWeight: b ? 600 : 400 })}>{children}</td>);

/* ---------------- the ten weeks, with dates ---------------- */
export function CampWeekTable({ start, week, setWeek }) {
  return (
    <Card ac={C.brass} s={{ padding: 0 }}>
      <div style={{ padding: "14px 14px 8px" }}>
        <Eye c={C.brass} s={{ marginBottom: 4 }}>The ten weeks — every number, every week, with dates</Eye>
        <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.5 })}>{CAMP_INTRO}</div>
        <Note>{CAMP_PHILOSOPHY}</Note>
        <Note c={C.ash}>Week 1 FOUNDATION — one week of slow lowering and base off the test-day numbers · weeks 2–4 BUILD — paused, then fast in clusters · week 5 EASY + TESTS · weeks 6–8 PEAK — contrast, depth jumps, top speed twice a week, eight rounds, the sauna four times · week 9 SHARPEN · week 10 FIGHT WEEK. If the date moves, the last three rows move with it.</Note>
      </div>
      <div style={{ overflowX: "auto", padding: "0 14px 14px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
          <thead><tr>
            <Head w={26}>Wk</Head><Head w={74}>Dates</Head><Head w={70}>Block</Head>
            <Head w={62}>Mon BASE</Head><Head>Tue ENGINE 1</Head><Head>Wed trap bar · phase · sets</Head>
            <Head>Thu ENGINE 2</Head><Head>Sat sprints · squat</Head><Head>Sun ROUNDS</Head><Head w={52}>Nordics</Head>
          </tr></thead>
          <tbody>
            {Array.from({ length: CAMP_L }, (_, i) => i + 1).map((w) => {
              const rx = campRxFor(w), r = campRow(rx), sel = w === week, ph = CPH[rx.ph];
              return (
                <tr key={w} onClick={() => setWeek && setWeek(w)} style={{ cursor: setWeek ? "pointer" : "default", background: sel ? "rgba(210,160,71,.14)" : "transparent" }}>
                  <Cell c={sel ? C.brass : ph.ac} b>{w}</Cell>
                  <Cell c={C.ash}>{campDatesLabel(start, w)}</Cell>
                  <Cell c={ph.ac} b>{rx.block}</Cell>
                  <Cell>{r.mon}</Cell><Cell>{r.tue}</Cell><Cell>{r.wed}</Cell>
                  <Cell>{r.thu}</Cell><Cell>{r.sat}</Cell><Cell>{r.sun}</Cell><Cell c={C.ash}>{r.nor}</Cell>
                </tr>);
            })}
          </tbody>
        </table>
        <Note s={{ fontStyle: "italic" }}>{CAMP_TABLE_NOTE}</Note>
      </div>
    </Card>);
}

/* ---------------- what this week actually is ---------------- */
export function CampWeekCard({ start, rx }) {
  const r = campRow(rx);
  const Row = ({ k, val }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
      <span style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk, flexShrink: 0 })}>{k}</span>
      <span style={Object.assign({}, mno, { fontSize: 10.5, color: C.brass, textAlign: "right" })}>{val}</span>
    </div>);
  return (
    <Card ac={C.brass}>
      <Eye c={C.brass}>What this week actually is · {campDatesLabel(start, rx.w)}</Eye>
      <Row k="Monday base" val={r.mon} />
      <Row k="Tuesday engine 1" val={r.tue} />
      <Row k="Wednesday trap bar" val={rx.tb ? rx.tb.sc : "—"} />
      <Row k="The lift phase" val={rx.tb ? PHASE_NAME[rx.tb.phase] : rx.sq ? PHASE_NAME[rx.sq.phase] : "—"} />
      <Row k="Sled" val={r.sled} />
      <Row k="Nordics (Wed)" val={r.nor} />
      <Row k="Thursday engine 2" val={r.thu} />
      <Row k="Saturday sprints" val={rx.spr ? (rx.spr.micro ? "the speed microdose" : rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : "")) : "—"} />
      <Row k="Saturday squat" val={rx.sq ? rx.sq.sc : "—"} />
      <Row k="Reactive jumps" val={rx.tp ? "—" : (rx.jump === "AEL" ? "Loaded drop jumps " : "Depth jumps ") + rx.js[0] + " × " + rx.js[1]} />
      <Row k="Box jumps · side bounds" val={rx.tp ? "—" : rx.box[0] + " × " + rx.box[1] + " · " + rx.bsets + " × 4 per side"} />
      <Row k="Push press" val={rx.pp ? rx.pp.sc + " @ " + rx.pp.pct + "%" : "—"} />
      <Row k="Punch throws" val={rx.vec + " rounds"} />
      <Row k="Sunday rounds" val={r.sun} />
      <Row k="Friday" val="Sleep — no alarm" />
      <Row k="Calisthenics" val={rx.tp ? "holds only" : rx.dl ? "half sets" : "at your levels"} />
      <Row k="Sauna" val={!rx.sauna ? "—" : rx.sauna4 && rx.edge ? "15–20 min, four times — Sun, Tue, Thu, Sat" : "15–20 min, twice a week"} />
      <Row k="The edge" val={rx.edge ? [rx.speed ? "Tuesday speed" : "", rx.tb && rx.tb.phase === "cluster" ? "clusters" : "", rx.micro ? "microdoses" : "", rx.thirty ? "the Wednesday thirty" : ""].filter(Boolean).join(" · ") || "—" : "off"} />
      {rx.reset ? <Note c={C.brass} bold>Reset week: the working weights reset with a set of 3 that's hard but leaves two in you — trap bar Wednesday, squat Saturday.</Note> : null}
      {rx.sim && rx.sim.scored ? <Note c={C.oxide} bold>SCORED — round one's output and round six's. Round six divided by round one is the fade.</Note> : null}
      <Note>{OUTPUT_RULE}</Note>
    </Card>);
}

/* ---------------- fight week, the Saturday layout ---------------- */
export function FightWeekTable({ start }) {
  return (
    <Card ac={C.oxide} s={{ padding: 0 }}>
      <div style={{ padding: "14px 14px 8px" }}>
        <Eye c={C.oxide} s={{ marginBottom: 4 }}>Fight week — fight on Saturday {campDayLabel(start, 10, 5)}</Eye>
        <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.5 })}>{FIGHT_WEEK_INTRO}</div>
      </div>
      <div style={{ padding: "0 14px 14px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr><Head w={96}>Day</Head><Head>What</Head></tr></thead>
          <tbody>
            {FIGHT_WEEK_ROWS.map((r, i) => {
              const last = i === FIGHT_WEEK_ROWS.length - 1;
              return (
                <tr key={i}>
                  <Cell c={last ? C.oxide : C.brass} b>{DSH[DAYS[r[1]]]} {campDayLabel(start, r[0], r[1])}</Cell>
                  <Cell c={last ? C.chalk : undefined} b={last}>{r[2]}</Cell>
                </tr>);
            })}
          </tbody>
        </table>
        <Note>{FIGHT_WEEK_FOOD}</Note>
        <Note c={C.moss} bold>{FIGHT_WEEK_AFTER}</Note>
      </div>
    </Card>);
}

/* ---------------- the working weight on a main lift ---------------- */
export function CampWorkPanel({ id, name, kg, onSet, reset, week }) {
  const [inp, setInp] = useState("");
  const step = id === "cw_pp" ? 2.5 : 5;
  const bump = (dir) => { if (!kg) return; onSet(Math.round(kg * (dir > 0 ? 1.025 : 0.975) / step) * step, (dir > 0 ? "+2.5% · camp wk " : "−2.5% · camp wk ") + week); };
  return (
    <div style={{ background: C.ink, border: "1px solid " + C.brass, borderRadius: 5, padding: 12, marginBottom: 11 }}>
      <Eye c={C.brass} s={{ marginBottom: 4 }}>{name} — working weight</Eye>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={Object.assign({}, mno, { fontSize: 26, fontWeight: 700, color: kg ? C.brass : C.ash })}>{kg ? kg + " kg" : "not set"}</span>
        <span style={Object.assign({}, mno, { fontSize: 9, color: C.ash, letterSpacing: 1 })}>NO MAXES, EVER, IN CAMP</span>
      </div>
      {kg ? (
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <Btn small c={C.moss} fill s={{ flex: 2 }} on={() => bump(1)}>LAST REP AS FAST AS THE FIRST · +2.5%</Btn>
          <Btn small c={C.oxide} s={{ flex: 1 }} on={() => bump(-1)}>IT GROUND · −2.5%</Btn>
        </div>) : null}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 10 }}>
        <div style={{ flex: 1 }}><Lab>{reset ? "Today's set of 3 (kg)" : "Set it by hand (kg)"}</Lab><Fld v={inp} on={setInp} ph="kg" /></div>
        <Btn c={C.brass} fill dis={!num(inp)} on={() => { const k = num(inp); if (!k) return; onSet(r25(k), (reset ? "reset · set of 3 · camp wk " : "by hand · camp wk ") + week); setInp(""); }}>SAVE</Btn>
      </div>
    </div>);
}

/* ---------------- the camp's numbers ---------------- */
export function CampNumbers({ start, log, maxes, onSetMax }) {
  const [edit, setEdit] = useState({});
  const get = (w, day, id) => { const e = log["mCw" + w + "-" + day + "-" + id]; return e ? num(e.w) : null; };
  const fade = (w) => { const a = get(w, "sun", "c_fs_rd1"), b = get(w, "sun", "c_fs_rd6"); return a && b ? b / a * 100 : null; };
  const TEST_WEEKS = campTestWeeks();
  const testRow = (id) => TEST_WEEKS.map((w) => [w, get(w, "tue", id)]);
  const TESTED = [["c_burst1", "Burst 1 — peak power"], ["c_burst10", "Burst 10 — peak power"], ["c_jump", "Broad jump (m)"], ["c_throw", "Rotational throw (m)"],
    ["c_bolt", "BOLT (s)"], ["c_rhr", "Resting heart rate"]];
  const WORK = [["cw_squat", "Back Squat"], ["cw_tbdl", "Trap Bar Deadlift"], ["cw_pp", "Push Press"]];
  return (
    <div>
      <Card ac={C.brass}>
        <Eye c={C.brass}>The working weights — every weight in camp comes off these</Eye>
        {WORK.map((m) => { const cur = num(maxes[m[0]]);
          return (
            <div key={m[0]} style={{ padding: "10px 0", borderBottom: "1px solid " + C.line }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1 }}>
                  <div style={Object.assign({}, bdy, { fontSize: 14.5, fontWeight: 600, color: C.chalk })}>{m[1]}</div>
                  <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, marginTop: 2 })}>{cur ? "OFF TEST DAY, RESET IN WEEK 5" : "NOT SET — test day's numbers set it"}</div>
                </span>
                <span style={Object.assign({}, mno, { fontSize: 22, fontWeight: 700, color: cur ? C.brass : C.ash })}>{cur ? cur + " kg" : "—"}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <div style={{ flex: 1 }}><Fld v={edit[m[0]]} on={(val) => setEdit(Object.assign({}, edit, { [m[0]]: val }))} ph="working weight (kg)" /></div>
                <Btn small c={C.brass} dis={!num(edit[m[0]])} on={() => { onSetMax(m[0], num(edit[m[0]]), "entered by hand · camp"); setEdit(Object.assign({}, edit, { [m[0]]: "" })); }}>SAVE</Btn>
              </div>
            </div>);
        })}
        <Note>{WORKING_WEIGHT_RULE}</Note>
        <Note c={C.ash} s={{ fontStyle: "italic" }}>Your Optimal 8 maxes are untouched by a camp — they're still on the NUMBERS page when the switch goes off.</Note>
      </Card>

      <Card ac={C.cobalt}>
        <Eye c={C.cobalt}>The fade — round six against round one</Eye>
        {scoredWeeks().map((w) => { const f = fade(w);
          return (
            <div key={w} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk })}>Week {w} · {campDatesLabel(start, w)}</span>
              <span style={Object.assign({}, mno, { fontSize: 13, fontWeight: 700, color: f == null ? C.ash : f >= 95 ? C.moss : f >= 90 ? C.brass : C.oxide })}>{f == null ? "—" : f.toFixed(1) + "%"}</span>
            </div>); })}
        <Note>Week 1 is the camp's baseline; week 8 is the last read before the fight. Everything here is aimed at moving it toward 100%.</Note>
      </Card>

      <Card ac={C.oxide}>
        <Eye c={C.oxide}>The tests — weeks 1, 5 and 9</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{CAMP_TEST_INTRO}</Note>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr><Head>Test</Head>{TEST_WEEKS.map((w) => <Head key={w} w={58}>Wk {w}</Head>)}</tr></thead>
            <tbody>
              {TESTED.map((t) => { const row = testRow(t[0]);
                return <tr key={t[0]}><Cell b>{t[1]}</Cell>{row.map((r) => <Cell key={r[0]} c={r[1] == null ? C.ash : C.brass}>{r[1] == null ? "—" : r[1]}</Cell>)}</tr>; })}
            </tbody>
          </table>
        </div>
        <Note>{CAMP_TARGETS}</Note>
      </Card>

      <Card ac={C.violet}>
        <Eye c={C.violet}>The camp rules — fixed, from day one to the bell</Eye>
        {CAMP_RULES.map((r, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.5, padding: "5px 0", borderBottom: "1px solid " + C.line })}>{i + 1}. {r}</div>)}
      </Card>
    </div>);
}
