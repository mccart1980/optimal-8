import React, { useState } from "react";
import { C, dsp, bdy, mno, num, fmtDate, Card, Eye, Lab, Fld, Btn, Chip, Note, Seg } from "./ui.jsx";
import { Sheet } from "./im-ui.jsx";
import { DocView } from "./mdview.jsx";
import { seasonLabel, dateSpan, CAMP_BLOCKS } from "./season.js";
import { prepEmphasis, prepTests } from "./prep.js";
import { VEL_LIFTS, PROFILE_LOADS, VEL_PHASES, fitLine, targetFor, TYPICAL } from "./velocity.js";

/* ================================================================
   THE SEASON — the whole plan as one dated strip
   ================================================================ */
const BLOCK_C = { ACCUMULATE: C.moss, INTENSIFY: C.oxide, CONVERT: C.brass, "TEST WEEK": C.cobalt,
  FOUNDATION: C.moss, BUILD: C.oxide, "EASY + TESTS": C.cobalt, PEAK: C.brass, SHARPEN: C.violet, "FIGHT WEEK": C.oxide,
  TRANSITION: C.moss };

export function SeasonView({ season, st, current, program, onProgram, moved }) {
  const rows = season.rows;
  const nowMon = (r) => r.program === (program === "transition" ? "transition" : program === "camp" ? "camp" : "prep");
  let lastBlock = null;
  return (
    <div>
      <Card ac={C.brass}>
        <Eye c={C.brass}>The season</Eye>
        {season.fight ? (
          <div>
            <div style={Object.assign({}, dsp, { fontSize: 30, fontWeight: 800, letterSpacing: 1.3, color: C.chalk, lineHeight: 1.05 })}>FIGHT · {fmtDate(season.fight).toUpperCase()}</div>
            <div style={Object.assign({}, bdy, { fontSize: 18, color: C.chalk, marginTop: 10, lineHeight: 1.5 })}>
              Prep ends {fmtDate(season.testDay)} on test day · camp starts {fmtDate(season.campStart)}.
            </div>
            <div style={Object.assign({}, bdy, { fontSize: 16, color: C.ash, marginTop: 6, lineHeight: 1.5 })}>
              {season.prepWeeks} prep {season.prepWeeks === 1 ? "week" : "weeks"}{season.truncated ? ", the first " + season.truncated + " of the calendar cut from the front" : ""} · 10 camp weeks · 2 easy weeks after.
            </div>
          </div>) : (
          <div>
            <div style={Object.assign({}, dsp, { fontSize: 28, fontWeight: 800, letterSpacing: 1.3, color: C.chalk })}>NO FIGHT DATE</div>
            <div style={Object.assign({}, bdy, { fontSize: 18, color: C.chalk, marginTop: 10, lineHeight: 1.5 })}>
              Prep runs its sixteen-week form: accumulate 1–6, intensify 7–11, convert 12–15, test week 16. Set a fight date in settings and everything re-dates from it backwards.
            </div>
          </div>)}
      </Card>

      {moved && moved.length ? (
        <Card ac={C.oxide}>
          <Eye c={C.oxide}>The date moved</Eye>
          <div style={Object.assign({}, bdy, { fontSize: 18, color: C.chalk, lineHeight: 1.5 })}>
            {moved.length} {moved.length === 1 ? "week" : "weeks"} changed: {moved.slice(0, 6).map((r) => seasonLabel(r)).join(", ")}{moved.length > 6 ? " and " + (moved.length - 6) + " more" : ""}.
          </div>
        </Card>) : null}

      {rows.map((r, i) => {
        const isNow = nowMon(r) && r.week === current.week;
        const head = r.block !== lastBlock ? (lastBlock = r.block) : null;
        const c = BLOCK_C[r.block] || C.ash;
        return (
          <div key={r.program + r.week}>
            {head ? <div style={Object.assign({}, mno, { fontSize: 14, fontWeight: 700, letterSpacing: 2, color: c, padding: "16px 2px 8px" })}>{r.block}</div> : null}
            <Card ac={isNow ? c : C.line} s={{ padding: "12px 13px", opacity: isNow ? 1 : .82 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 800, letterSpacing: 1.1, color: C.chalk })}>{seasonLabel(r)}</span>
                <span style={Object.assign({}, mno, { fontSize: 14, color: c, whiteSpace: "nowrap" })}>{isNow ? "THIS WEEK" : ""}</span>
              </div>
              <div style={Object.assign({}, mno, { fontSize: 15, color: C.ash, marginTop: 4 })}>{dateSpan(r)}</div>
              {r.program === "prep" ? (
                <div style={Object.assign({}, bdy, { fontSize: 16, color: C.chalk, marginTop: 7, lineHeight: 1.5 })}>{prepEmphasis(r.doc)}</div>) : null}
            </Card>
            {r.program === "prep" && i < rows.length - 1 && rows[i + 1].program === "camp" ? (
              <Card ac={C.cobalt} s={{ padding: "12px 13px" }}>
                <div style={Object.assign({}, dsp, { fontSize: 22, fontWeight: 800, letterSpacing: 1.3, color: C.cobalt })}>TEST DAY</div>
                <div style={Object.assign({}, mno, { fontSize: 15, color: C.ash, marginTop: 4 })}>{fmtDate(season.testDay)}</div>
              </Card>) : null}
            {r.program === "camp" && r.week === 10 ? (
              <Card ac={C.oxide} s={{ padding: "12px 13px" }}>
                <div style={Object.assign({}, dsp, { fontSize: 22, fontWeight: 800, letterSpacing: 1.3, color: C.oxide })}>FIGHT</div>
                <div style={Object.assign({}, mno, { fontSize: 15, color: C.ash, marginTop: 4 })}>{fmtDate(season.fight)}</div>
              </Card>) : null}
          </div>); })}

      <Card>
        <Eye>Running now</Eye>
        <Seg opts={[["prep", "PREP"], ["camp", "CAMP"], ["fighter", "FIGHTER"]]} val={program === "transition" ? "prep" : program} on={onProgram} c={C.brass} />
        <Note>The season above is the plan; this is the program the app is running today.</Note>
      </Card>
    </div>);
}

/* ================================================================
   THE GUIDE — the plain-English page, and what this week is
   ================================================================ */
export function GuideView({ md, blockName, emphasis, tests }) {
  return (
    <div>
      <Card ac={C.brass}>
        <div style={Object.assign({}, dsp, { fontSize: 24, fontWeight: 800, letterSpacing: 1.2, color: C.chalk, lineHeight: 1.15 })}>
          This week is {blockName}
        </div>
        {emphasis ? <div style={Object.assign({}, bdy, { fontSize: 19, color: C.chalk, marginTop: 10, lineHeight: 1.5 })}>{emphasis}</div> : null}
        <div style={Object.assign({}, bdy, { fontSize: 19, color: tests && tests.length ? C.brass : C.ash, marginTop: 12, lineHeight: 1.5 })}>
          Tests this week: {tests && tests.length ? tests.join(", ") : "none"}
        </div>
      </Card>
      <DocView md={md} accent={C.brass} big />
    </div>);
}

/* ================================================================
   THE PROFILE — five loads, five speeds, one line per lift
   ================================================================ */
export function ProfileTool({ profiles, setProfiles, maxes, dayIso, onClose }) {
  const [lift, setLift] = useState("squat");
  const P = profiles || {};
  const cur = P[lift] || { points: [] };
  const work = num(maxes[lift]) || num(maxes["cw_" + lift]) || null;
  const pts = PROFILE_LOADS.map((pc, i) => (cur.points && cur.points[i]) || { load: pc, speed: "" });
  const put = (i, field, val) => {
    const next = pts.slice(); next[i] = Object.assign({}, next[i], { [field]: val });
    setProfiles(Object.assign({}, P, { [lift]: { points: next, drawn: dayIso } }));
  };
  const line = fitLine(pts);
  return (
    <Sheet title="LOAD-VELOCITY PROFILE" sub="FIVE LOADS · TWO REPS EACH · THE WATCH RECORDING" colour={C.brass} onClose={onClose}>
      <Card ac={C.brass}>
        <Note c={C.chalk} s={{ marginTop: 0 }}>
          Two reps at each load, as fast as the bar will move, and the mean speed from the watch typed in beside it. The line the five points draw is what every phase target is read off from then on.
        </Note>
      </Card>
      <Card>
        <Lab>Lift</Lab>
        <Seg opts={VEL_LIFTS.map((x) => [x.id, x.n.split(" ")[0].toUpperCase()])} val={lift} on={setLift} c={C.brass} />
        {work ? <Note>Working max {work} kg — the loads below are percentages of it.</Note> : <Note>No working max for this lift yet. The percentages still draw the line.</Note>}
      </Card>
      <Card>
        <Eye c={C.brass}>The five loads</Eye>
        {pts.map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end", padding: "9px 0", borderBottom: "1px solid " + C.line }}>
            <div style={{ flex: 1 }}><Lab>load (%)</Lab><Fld v={pt.load} on={(v) => put(i, "load", v)} ph="%" /></div>
            <div style={{ flex: 1 }}><Lab>kg</Lab>
              <div style={Object.assign({}, mno, { fontSize: 18, color: C.ash, minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center" })}>
                {work && num(pt.load) != null ? Math.round(work * num(pt.load) / 100 / 2.5) * 2.5 : "—"}
              </div></div>
            <div style={{ flex: 1 }}><Lab>speed (m/s)</Lab><Fld v={pt.speed} on={(v) => put(i, "speed", v)} ph="m/s" /></div>
          </div>))}
      </Card>
      <Card ac={line ? C.moss : C.line}>
        <Eye c={line ? C.moss : C.ash}>The targets this draws</Eye>
        {VEL_PHASES.map((ph) => { const t = targetFor(P, lift, ph.id);
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
      </Card>
      <Btn on={onClose} c={C.brass} fill s={{ width: "100%" }}>DONE — IT'S SAVED</Btn>
    </Sheet>);
}

/* ================================================================
   THE MOVEMENT SESSION — thirty guided minutes
   ================================================================ */
