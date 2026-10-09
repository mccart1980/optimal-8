import React, { useState } from "react";
import { C, dsp, bdy, mno, num, fmtDate, addDays, Card, Eye, Lab, Fld, Btn, Chip, Note, Seg } from "./ui.jsx";
import { Sheet } from "./im-ui.jsx";
import { DocView } from "./mdview.jsx";
import { rowDates } from "./builder.js";
import { VEL_LIFTS, PROFILE_LOADS, VEL_PHASES, fitLine, targetFor, TYPICAL, BALLISTIC, ballisticOf, BALLISTIC_DEFAULT, powerRows, peakPower } from "./velocity.js";

/* ================================================================
   THE SEASON — the whole plan as one dated strip
   ================================================================ */
const BLOCK_C = { ACCUMULATE: C.moss, INTENSIFY: C.oxide, CONVERT: C.brass, "TEST WEEK": C.cobalt,
  FOUNDATION: C.moss, BUILD: C.oxide, "EASY + TESTS": C.cobalt, PEAK: C.brass, SHARPEN: C.violet, "FIGHT WEEK": C.oxide,
  TRANSITION: C.moss };

const PROG_C = { prep: C.moss, camp: C.brass, transition: C.cobalt, pre: C.violet };
const PROG_N = { prep: "PREP", camp: "CAMP", transition: "TRANSITION", pre: "BEFORE THE CAMP" };
const rowBlock = (r) => (r.program === "prep" ? (r.doc <= 5 ? "ACCUMULATE" : r.doc <= 10 ? "INTENSIFY" : r.doc <= 13 ? "CONVERT" : "TEST WEEK")
  : r.program === "camp" ? ({ F1: "FOUNDATION", F: "FOUNDATION", B1: "BUILD", B2: "BUILD", B3: "BUILD", E: "EASY + TESTS", P1: "PEAK", P2: "PEAK", P3: "PEAK", E1: "ENGINE", E2: "ENGINE", S: "SHARPEN", FW: "FIGHT WEEK" })[r.id]
  : r.program === "pre" ? "BEFORE WEEK 1" : r.hold ? "THE HEAD CHECK" : "TRANSITION");

export function SeasonView({ season, st, current, classic, dayIso, openWeek }) {
  const s = st.season || {};
  const rows = season.rows.filter((r) => r.mon >= addDays(dayIso, -7 * 20)).slice(0, 60);
  let lastHead = null;
  return (
    <div>
      <Card ac={C.brass}>
        <Eye c={C.brass}>The season</Eye>
        {classic ? (
          <div style={Object.assign({}, dsp, { fontSize: 28, fontWeight: 800, letterSpacing: 1.3, color: C.chalk })}>OPTIMAL 8 FIGHTER</div>
        ) : s.booked && s.fight ? (
          <div style={Object.assign({}, dsp, { fontSize: 30, fontWeight: 800, letterSpacing: 1.3, color: C.chalk, lineHeight: 1.05 })}>FIGHT · {fmtDate(s.fight).toUpperCase()}</div>
        ) : (
          <div style={Object.assign({}, dsp, { fontSize: 28, fontWeight: 800, letterSpacing: 1.3, color: C.chalk })}>NO FIGHT BOOKED</div>)}
        <div style={Object.assign({}, bdy, { fontSize: 18, color: C.chalk, marginTop: 10, lineHeight: 1.5 })}>
          {classic ? "The classic program, on its own clock. Settings → Fight booked? builds a season."
            : s.booked ? s.rounds + " × " + s.mins + " · " + s.rest + " s rest · weigh-in " + (s.weighIn === "day" ? "on the day" : "the day before") + " · " + s.fitness + " fitness · emphasis " + s.emphasis
            : "Prep's 16-week cycle, on repeat. Settings → Fight booked? builds a camp."}
        </div>
        {st.planNote ? <Note c={C.brass}>{st.planNote}</Note> : null}
      </Card>

      {rows.map((r) => {
        const isNow = r.mac === current.macro && r.kw === current.week;
        const head = PROG_N[r.program] + (r.program === "camp" ? " · " + fmtDate(r.camp.fight) : r.program === "prep" && r.cycle ? " · CYCLE " + r.cycle : "");
        const showHead = head + r.plan !== lastHead ? (lastHead = head + r.plan) : null;
        const c = PROG_C[r.program] || C.ash;
        return (
          <div key={r.mac + r.kw}>
            {showHead ? <div style={Object.assign({}, mno, { fontSize: 14, fontWeight: 700, letterSpacing: 2, color: c, padding: "16px 2px 8px" })}>{head}</div> : null}
            <Card ac={isNow ? c : C.line} s={{ padding: "12px 13px", opacity: isNow ? 1 : r.sun < dayIso ? .7 : .88 }}>
              <button onClick={() => openWeek && openWeek(r)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <span style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 800, letterSpacing: 1.1, color: C.chalk })}>{r.hold ? "HOLD" : r.program === "transition" ? "T" + r.idx : r.id} · {rowBlock(r)}</span>
                  <span style={Object.assign({}, mno, { fontSize: 14, color: c, whiteSpace: "nowrap" })}>{isNow ? "THIS WEEK" : ""}</span>
                </div>
                <div style={Object.assign({}, mno, { fontSize: 15, color: C.ash, marginTop: 4 })}>{rowDates(r)}</div>
                {r.preCamp ? <div style={Object.assign({}, bdy, { fontSize: 16, color: C.violet, marginTop: 6 })}>The pre-camp check — bloods and blood pressure</div> : null}
                {r.program === "prep" && r.doc === 14 ? <div style={Object.assign({}, bdy, { fontSize: 16, color: C.cobalt, marginTop: 6 })}>Test day {fmtDate(addDays(r.mon, 5))}</div> : null}
                {r.program === "camp" && r.id === "FW" ? <div style={Object.assign({}, bdy, { fontSize: 16, color: C.oxide, marginTop: 6 })}>FIGHT {fmtDate(r.camp.fight)}</div> : null}
              </button>
            </Card>
          </div>); })}
    </div>);
}

/* ================================================================
   THE GUIDE — the plain-English page, and what this week is
   ================================================================ */
export function GuideView({ md, md2, blockName, emphasis, tests, after, phase, next }) {
  const line = { fontSize: 19, color: C.chalk, marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.line, lineHeight: 1.5 };
  return (
    <div>
      <Card ac={C.brass}>
        <div data-testid="guide-live" style={Object.assign({}, dsp, { fontSize: 24, fontWeight: 800, letterSpacing: 1.2, color: C.chalk, lineHeight: 1.15 })}>
          This week is {blockName}
        </div>
        {emphasis ? <div style={Object.assign({}, bdy, { fontSize: 19, color: C.chalk, marginTop: 10, lineHeight: 1.5 })}>{emphasis}</div> : null}
        <div style={Object.assign({}, bdy, { fontSize: 19, color: tests && tests.length ? C.brass : C.ash, marginTop: 12, lineHeight: 1.5 })}>
          Tests this week: {tests && tests.length ? tests.join(", ") : "none"}
        </div>
        <div style={Object.assign({}, bdy, line)}>
          <span style={{ color: C.ash }}>The food this week: </span>
          <span style={{ fontWeight: 600, color: phase ? phase.c : C.chalk }}>{phase ? phase.n : "the day as printed"}</span>
          {phase ? <span style={{ color: C.ash }}> — {phase.chg || "the day as printed"}</span> : null}
        </div>
        <div style={Object.assign({}, bdy, line)}>
          <span style={{ color: C.ash }}>Next feed: </span>
          {next ? <span><span style={{ fontWeight: 600 }}>{next.n}</span><span style={{ color: C.ash }}> at </span><span style={Object.assign({}, mno, { fontWeight: 700, color: C.brass })}>{next.t}</span></span>
            : <span style={{ color: C.ash }}>nothing left today</span>}
        </div>
      </Card>
      {after || null}
      <DocView md={md2 ? md + "\n\n" + md2 : md} accent={C.brass} big />
    </div>);
}

/* ================================================================
   THE PROFILE — five loads, five speeds, one line per lift
   ================================================================ */
export function ProfileTool({ profiles, setProfiles, maxes, dayIso, onClose }) {
  const [lift, setLift] = useState("squat");
  const P = profiles || {};
  const cur = P[lift] || { points: [] };
  const bal = ballisticOf(lift);
  const of = bal ? bal.of : lift;
  const work = num(maxes[of]) || num(maxes["cw_" + of]) || null;
  const loads = bal ? bal.loads : PROFILE_LOADS;
  const pts = loads.map((pc, i) => (cur.points && cur.points[i]) || { load: pc, speed: "" });
  const put = (i, field, val) => {
    const next = pts.slice(); next[i] = Object.assign({}, next[i], { [field]: val });
    setProfiles(Object.assign({}, P, { [lift]: { points: next, drawn: dayIso } }));
  };
  const line = bal ? null : fitLine(pts);
  const pw = bal ? powerRows(pts, work) : null;
  const peak = bal ? peakPower(P, lift, work) : null;
  return (
    <Sheet title="LOAD-VELOCITY PROFILE" sub={bal ? "FOUR LOADS · TWO REPS EACH · THE WATCH RECORDING" : "FIVE LOADS · TWO REPS EACH · THE WATCH RECORDING"} colour={C.brass} onClose={onClose}>
      <Card ac={C.brass}>
        <Note c={C.chalk} s={{ marginTop: 0 }}>
          {bal ? "Two reps at each load, as fast as it will go, and the mean speed from the watch typed in beside it. Power is load times speed; the load with the highest number is the one the rows use until the next profile."
            : "Two reps at each load, as fast as the bar will move, and the mean speed from the watch typed in beside it. The line the five points draw is what every phase target is read off from then on."}
        </Note>
      </Card>
      <Card>
        <Lab>Lift</Lab>
        <Seg opts={VEL_LIFTS.map((x) => [x.id, x.n.split(" ")[0].toUpperCase()])} val={lift} on={setLift} c={C.brass} />
        <div style={{ marginTop: 8 }}><Seg opts={BALLISTIC.map((x) => [x.id, x.n.toUpperCase()])} val={lift} on={setLift} c={C.oxide} /></div>
        {work ? <Note>{bal ? (of === "bench" ? "Bench " : "Trap bar ") : "Working max "}{work} kg — the loads below are percentages of it.</Note> : <Note>No working max for this lift yet. The percentages still draw the line.</Note>}
      </Card>
      <Card>
        <Eye c={C.brass}>The {bal ? "four" : "five"} loads</Eye>
        {pts.map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end", padding: "9px 0", borderBottom: "1px solid " + C.line }}>
            <div style={{ flex: 1 }}><Lab>load (%)</Lab><Fld v={pt.load} on={(v) => put(i, "load", v)} ph="%" /></div>
            <div style={{ flex: 1 }}><Lab>kg</Lab>
              <div style={Object.assign({}, mno, { fontSize: 18, color: C.ash, minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center" })}>
                {work && num(pt.load) != null ? Math.round(work * num(pt.load) / 100 / 2.5) * 2.5 : "—"}
              </div></div>
            <div style={{ flex: 1 }}><Lab>speed (m/s)</Lab><Fld v={pt.speed} on={(v) => put(i, "speed", v)} ph="m/s" /></div>
            {bal ? <div style={{ flex: 1 }}><Lab>power</Lab>
              <div style={Object.assign({}, mno, { fontSize: 18, fontWeight: 700, color: peak && pw[i].power === peak.power && pw[i].pct === peak.pct ? C.moss : C.ash, minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center" })}>
                {pw[i].power == null ? "—" : pw[i].power}
              </div></div> : null}
          </div>))}
      </Card>
      {bal ? (
        <Card ac={peak ? C.moss : C.line}>
          <Eye c={peak ? C.moss : C.ash}>The peak-power load</Eye>
          <div data-testid="peak-power" style={Object.assign({}, mno, { fontSize: 26, fontWeight: 700, color: peak ? C.moss : C.ash })}>
            {peak ? peak.pct + "%" + (peak.kg != null ? " · " + peak.kg + " kg" : "") : BALLISTIC_DEFAULT[lift] + "% until a speed is entered"}
          </div>
          <Note>{bal.n} rows load from this until the next profile.</Note>
          {cur.drawn ? <Note>Last drawn {fmtDate(cur.drawn)}.</Note> : null}
        </Card>
      ) : (
      <Card ac={line ? C.moss : C.line}>
        <Eye c={line ? C.moss : C.ash}>The targets this draws</Eye>
        {VEL_PHASES.map((ph) => { const t = targetFor(P, lift, ph.id);
          if (!t) return null;
          return (
            <div key={ph.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: "1px solid " + C.line }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={Object.assign({}, bdy, { fontSize: 18, fontWeight: 600, color: C.chalk })}>{ph.n}</div>
                <div style={Object.assign({}, mno, { fontSize: 14, color: C.ash, marginTop: 2 })}>{ph.line}</div>
              </span>
              <span style={Object.assign({}, mno, { fontSize: 24, fontWeight: 700, color: t.own ? C.moss : C.ash })}>{t.v} <span style={{ fontSize: 13 }}>m/s</span></span>
            </div>); })}
        <Note c={line ? C.chalk : C.ash}>{line ? "Drawn from your own five points" + (line.r2 != null ? " · fit " + Math.round(line.r2 * 100) + "%" : "") + "." : "Typical numbers, until two or more speeds are entered."}</Note>
        {cur.drawn ? <Note>Last drawn {fmtDate(cur.drawn)}.</Note> : null}
      </Card>)}
      <Btn on={onClose} c={C.brass} fill s={{ width: "100%" }}>DONE — IT'S SAVED</Btn>
    </Sheet>);
}

/* ================================================================
   THE MOVEMENT SESSION — thirty guided minutes
   ================================================================ */
