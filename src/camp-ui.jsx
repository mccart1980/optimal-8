import React, { useState } from "react";
import { C, bdy, mno, num, r25, DAYS, DSH, Card, Eye, Lab, Fld, Btn, Note } from "./ui.jsx";
import {
  campRow, CPH, CAMP_TABLE_NOTE, CAMP_TEST_INTRO, CAMP_TARGETS, WORKING_WEIGHT_RULE, CAMP_INTRO, CAMP_PHILOSOPHY,
  FIGHT_WEEK_INTRO, FIGHT_WEEK_FOOD, FIGHT_WEEK_AFTER, PHASE_NAME, OUTPUT_RULE, CAMP_RULES, campBench, liftLine, daysOut,
} from "./camp.js";
import { rowDates } from "./builder.js";

/* ================================================================
   CAMP — the views the camp needs that the Fighter hasn't got: the
   dated ten-week table, the fight-week layout, the working-weight
   panel that sits on every main lift, and the camp's numbers.
   ================================================================ */

const Head = ({ children, w }) => (
  <th style={Object.assign({}, mno, { fontSize: 7.5, letterSpacing: 1, color: C.ash, textAlign: "left", padding: "6px 5px", borderBottom: "1px solid " + C.line, whiteSpace: "nowrap", width: w })}>{children}</th>);
const Cell = ({ children, c, b }) => (
  <td style={Object.assign({}, bdy, { fontSize: 10.5, color: c || C.chalk, padding: "7px 5px", borderBottom: "1px solid " + C.line, lineHeight: 1.35, verticalAlign: "top", fontWeight: b ? 600 : 400 })}>{children}</td>);

/* ---------------- the camp's weeks, with dates ---------------- */
export function CampWeekTable({ rows, week, setWeek }) {
  let prev = null;
  const first = rows[0] && rows[0].row.camp;
  return (
    <Card ac={C.brass} s={{ padding: 0 }}>
      <div style={{ padding: "14px 14px 8px" }}>
        <Eye c={C.brass} s={{ marginBottom: 4 }}>The camp — every number, every week, with dates</Eye>
        {first && rows.length === 10 && first.ids.join() === "F,B1,B2,B3,E,P1,P2,P3,S,FW" && first.R === 6 ? (
          <div>
            <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.5 })}>{CAMP_INTRO}</div>
            <Note>{CAMP_PHILOSOPHY}</Note>
          </div>) : (
          <Note c={C.chalk} s={{ marginTop: 0 }}>{rows.map((x) => x.row.id).join(" · ")} — {first ? first.R + " × " + first.mins + ", " + first.rest + " s rest, " + first.fitness + " fitness" + (first.emphasis !== "none" ? ", " + first.emphasis : "") + (first.ef ? ", engine-first" : "") : ""}.</Note>)}
      </div>
      <div style={{ overflowX: "auto", padding: "0 14px 14px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
          <thead><tr>
            <Head w={26}>Wk</Head><Head w={74}>Dates</Head><Head w={70}>Block</Head>
            <Head w={62}>Mon BASE</Head><Head>Tue ENGINE 1</Head><Head>Wed trap bar · phase · sets</Head>
            <Head>Thu ENGINE 2</Head><Head>Sat sprints · squat</Head><Head>Sun ROUNDS</Head><Head w={52}>Nordics</Head>
          </tr></thead>
          <tbody>
            {rows.map(({ row, rx }) => {
              const r = campRow(rx, prev), sel = row.kw === week, ph = CPH[rx.ph] || CPH.c1; prev = rx;
              return (
                <tr key={row.kw} onClick={() => setWeek && setWeek(row.kw)} style={{ cursor: setWeek ? "pointer" : "default", background: sel ? "rgba(210,160,71,.14)" : "transparent" }}>
                  <Cell c={sel ? C.brass : ph.ac} b>{row.idx}</Cell>
                  <Cell c={C.ash}>{rowDates(row)}</Cell>
                  <Cell c={ph.ac} b>{row.id} · {rx.block}</Cell>
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
export function CampWeekCard({ rx, dates }) {
  const r = campRow(rx);
  const Row = ({ k, val }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
      <span style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk, flexShrink: 0 })}>{k}</span>
      <span style={Object.assign({}, mno, { fontSize: 10.5, color: C.brass, textAlign: "right" })}>{val}</span>
    </div>);
  const bp = campBench(rx);
  return (
    <Card ac={C.brass}>
      <Eye c={C.brass}>What this week actually is · {dates}</Eye>
      <Row k="Monday base" val={r.mon} />
      <Row k="Tuesday engine 1" val={r.tue} />
      <Row k="Wednesday trap bar" val={rx.tb ? liftLine(rx.tb) : "—"} />
      <Row k="Wednesday bench" val={bp ? liftLine(bp) : rx.tp ? "bench throws 3 × 3" : "—"} />
      <Row k="The lift phase" val={rx.tb ? PHASE_NAME[rx.tb.phase] : rx.sq ? PHASE_NAME[rx.sq.phase] : "—"} />
      <Row k="Sled" val={r.sled} />
      <Row k="Nordics (Wed)" val={r.nor} />
      <Row k="Wednesday easy" val={rx.thirty ? (rx.wedEasy || 30) + " min, nose only" : "—"} />
      <Row k="Thursday engine 2" val={r.thu} />
      <Row k="Saturday sprints" val={rx.spr ? (rx.spr.micro ? "the speed microdose" : rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : "")) : "—"} />
      <Row k="Saturday squat" val={rx.sq ? liftLine(rx.sq) : "—"} />
      <Row k="Reactive jumps" val={rx.tp || rx.fightWeek ? "—" : (rx.jump === "AEL" ? "Loaded drop jumps " : "Depth jumps ") + rx.js[0] + " × " + rx.js[1]} />
      <Row k="Box jumps · side bounds" val={rx.tp || rx.fightWeek ? "—" : rx.box[0] + " × " + rx.box[1] + " · " + rx.bsets + " × 4 per side"} />
      <Row k="Push press" val={rx.pp ? rx.pp.sets + " × " + rx.pp.reps + " @ " + rx.pp.pct + "%" : "—"} />
      <Row k="Punch throws" val={rx.vec + " rounds"} />
      <Row k="Sunday rounds" val={r.sun} />
      <Row k="Friday" val="Sleep — no alarm" />
      <Row k="Calisthenics" val={rx.tp ? "holds only" : rx.dl ? "half sets" : "at your levels"} />
      <Row k="Sauna" val={!rx.sauna ? "—" : "15–20 min, twice a week — Sunday and one weekday evening"} />
      <Row k="Emphasis" val={rx.emphasis && rx.emphasis !== "none" ? rx.emphasis : "none"} />
      <Row k="The edge" val={rx.edge ? [rx.speed ? "Tuesday speed" : "", rx.tb && rx.tb.phase === "cluster" ? "clusters" : "", rx.thirty ? "the Wednesday easy session" : ""].filter(Boolean).join(" · ") || "—" : "off"} />
      {rx.twoThirds ? <Note c={C.brass} bold>Two-thirds dose: every set and interval count down by a third, the intervals at 90%, the rounds at 90 seconds' rest. Loads as written.</Note> : null}
      {rx.ef ? <Note c={C.brass}>Engine-first: the lifts at two work sets, the engine gets the time.</Note> : null}
      {rx.reset ? <Note c={C.brass} bold>Reset week: the working weights reset with a set of 3 that's hard but leaves two in you — trap bar Wednesday, squat Saturday.</Note> : null}
      {rx.sim && rx.sim.scored ? <Note c={C.oxide} bold>SCORED — round one's output and the last round's. The last divided by the first is the fade.</Note> : null}
      <Note>{OUTPUT_RULE}</Note>
    </Card>);
}

/* ---------------- fight week, with the fight on its own day ---------------- */
const FW_LINES = {
  5: "20 minutes easy, nose only. Neck holds, 2 × 10 seconds each direction. RANGE at half dose. Bed by half past eight.",
  4: "SPEED MICRODOSE · 25 min: warm-up, 3 × 20 m flying sprints at 90%, box jumps 2 × 3, rotational throws 2 × 3 per side, bench throws 3 × 3. Fast, nothing tired, done.",
  3: "Nothing. RANGE at half dose, the sit.",
  2: "ACTIVATION · 20 min: Tuesday's warm-up, band pull-aparts and external rotations, three easy throws per side, two minutes of shadow boxing at pace, three physiological sighs, done.",
};
const DNAME = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
export function FightWeekTable({ rx }) {
  const days = DAYS.filter((d) => daysOut(d, rx) >= 0 && daysOut(d, rx) <= 5).sort((a, b) => daysOut(b, rx) - daysOut(a, rx));
  return (
    <Card ac={C.oxide} s={{ padding: 0 }}>
      <div style={{ padding: "14px 14px 8px" }}>
        <Eye c={C.oxide} s={{ marginBottom: 4 }}>Fight week — the fight on {DNAME[rx.fightDay || "sat"]} {rx.fightIso}</Eye>
        <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.5 })}>{FIGHT_WEEK_INTRO}</div>
      </div>
      <div style={{ padding: "0 14px 14px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr><Head w={96}>Day</Head><Head>What</Head></tr></thead>
          <tbody>
            {days.map((d) => { const o = daysOut(d, rx);
              const what = o === 0 ? "FIGHT. The warm-up you rehearsed. The corner minute in every rest. The last round is a place you've already been."
                : o === 1 ? (rx.weighIn === "day" ? "Nothing. Feet up. The rehearsal's meals. Bed early — you weigh in tomorrow." : "Weigh-in. Nothing else. Feet up. The rehearsal's meals. Bed early.") : FW_LINES[o];
              return (
                <tr key={d}>
                  <Cell c={o === 0 ? C.oxide : C.brass} b>{DSH[d]}</Cell>
                  <Cell c={o === 0 ? C.chalk : undefined} b={o === 0}>{what}</Cell>
                </tr>); })}
          </tbody>
        </table>
        <Note>The rehearsal is six days before the fight: {rx.rehearsal}.</Note>
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
export function CampNumbers({ rows, log, maxes, onSetMax }) {
  const [edit, setEdit] = useState({});
  rows = rows || [];
  const get = (w, day, id) => { const e = log["mCw" + w + "-" + day + "-" + id]; return e ? num(e.w) : null; };
  const fade = (w) => { const a = get(w, "sun", "c_fs_rd1"), b = get(w, "sun", "c_fs_rd6"); return a && b ? b / a * 100 : null; };
  const TEST_WEEKS = rows.filter((x) => x.rx.tests && x.rx.tests.tue).map((x) => x.row.kw);
  const idOf = (kw) => { const x = rows.find((y) => y.row.kw === kw); return x ? x.row.id : kw; };
  const testRow = (id) => TEST_WEEKS.map((w) => [w, get(w, "tue", id)]);
  const TESTED = [["c_burst1", "Burst 1 — peak power"], ["c_burst10", "Burst 10 — peak power"], ["c_jump", "Broad jump (m)"], ["c_throw", "Rotational throw (m)"],
    ["c_bolt", "BOLT (s)"], ["c_rhr", "Resting heart rate"]];
  const WORK = [["cw_squat", "Back Squat"], ["cw_tbdl", "Trap Bar Deadlift"], ["cw_bench", "Bench Press"], ["cw_pp", "Push Press"]];
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
        {rows.filter((x) => x.rx.sim && x.rx.sim.scored).map(({ row }) => { const w = row.kw, f = fade(w);
          return (
            <div key={w} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk })}>Week {row.idx} · {row.id} · {rowDates(row)}</span>
              <span style={Object.assign({}, mno, { fontSize: 13, fontWeight: 700, color: f == null ? C.ash : f >= 95 ? C.moss : f >= 90 ? C.brass : C.oxide })}>{f == null ? "—" : f.toFixed(1) + "%"}</span>
            </div>); })}
        <Note>Week 1 is the camp's baseline; the last hard week is the last read before the fight. The first read also checks the fitness you entered: under 75% reads low, 75–84% moderate, 85% or more good.</Note>
      </Card>

      <Card ac={C.oxide}>
        <Eye c={C.oxide}>The tests — week 1, the easy week, the sharpen week</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{CAMP_TEST_INTRO}</Note>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr><Head>Test</Head>{TEST_WEEKS.map((w) => <Head key={w} w={58}>{idOf(w)}</Head>)}</tr></thead>
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
