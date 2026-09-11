import React, { useMemo, useState } from "react";
import { C, dsp, bdy, mno, num, Card, Eye, Lab, Fld, Btn, Chip, Note, Seg } from "./ui.jsx";
import { Pacer, Sheet } from "./im-ui.jsx";
import {
  RANGE_INTRO, RANGE_HOW, RANGE_HIPS, RANGE_SKIP, KEEP_LINE, MORNING_FIVE_HOW, MORNING_FIVE,
  RANGE_SECTIONS, RANGE_STEPS, KEEP_STEPS, TEST_INTRO, RANGE_TESTS, RANGE_CM,
  isKeepWeek, rangeTitle, stepsFor, totalOf,
} from "./range.js";

/* ================================================================
   THE HOME BLOCK — the screens for THE MORNING FIVE, RANGE, THE KEEP
   and the four tests. One guided timer engine (the Pacer) behind all
   of them, timestamp-based, holding a wake lock while it runs.
   ================================================================ */

const mmssL = (s) => Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);

/* --- THE MORNING FIVE · a 5-minute guided timer --- */
export function MorningFiveTool({ sound, onClose }) {
  const steps = useMemo(() => MORNING_FIVE.map((x) => Object.assign({}, x)), []);
  return (
    <Pacer steps={steps} sound={sound} title="THE MORNING FIVE" sub="ON WAKING · JOINT CIRCLES · 5 MIN" colour={C.moss} onClose={onClose}
      footer={
        <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: 6, padding: 12, maxHeight: 150, overflowY: "auto" }}>
          <Note c={C.chalk} s={{ marginTop: 0 }}>{MORNING_FIVE_HOW}</Note>
        </div>} />);
}

/* --- RANGE / THE KEEP · the evening guided timer --- */
export function RangeTool({ rangeWeek, sound, onClose }) {
  const keep = isKeepWeek(rangeWeek);
  const [full, setFull] = useState(false);
  const steps = useMemo(() => stepsFor(rangeWeek, full), [rangeWeek, full]);
  const total = totalOf(steps);
  return (
    <Pacer steps={steps} sound={sound} title={keep ? "THE KEEP" : "RANGE"}
      sub={(keep ? "EVERY EVENING, FOR GOOD · " : "EVERY EVENING · ") + mmssL(total)} colour={C.violet} onClose={onClose}
      footer={
        <div>
          {keep ? null : (
            <div style={{ marginBottom: 8 }}>
              <Lab>Length</Lab>
              <Seg opts={[[0, "20 MIN"], [1, "FULL HOLDS · " + mmssL(totalOf(stepsFor(rangeWeek, true)))]]} val={full ? 1 : 0} on={(v) => setFull(!!v)} c={C.violet} />
              <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, letterSpacing: .8, marginTop: 5, lineHeight: 1.5 })}>
                20 MIN RUNS THE DOCUMENT'S SECTIONS — 1 + 5 + 8 + 6. FULL HOLDS RUNS EVERY HOLD AT THE LENGTH THE DOCUMENT WRITES, WHICH COMES TO MORE THAN TWENTY.
              </div>
            </div>)}
          <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: 6, padding: 12, maxHeight: 150, overflowY: "auto" }}>
            <Note c={C.chalk} s={{ marginTop: 0 }}>{keep ? KEEP_LINE : RANGE_HOW}</Note>
          </div>
        </div>} />);
}

/* --- THE FOUR TESTS · weeks 1, 5, 9 and 13 --- */
export function RangeTests({ week, rangeWeek, get, put, onClose }) {
  return (
    <Sheet title="THE FOUR RANGE TESTS" sub={"RANGE WEEK " + rangeWeek + " · ON THE SUNDAY WEEKLY CHECK"} colour={C.oxide} onClose={onClose}>
      <Card ac={C.oxide}><Note c={C.chalk} s={{ marginTop: 0 }}>{TEST_INTRO}</Note></Card>
      {RANGE_TESTS.map((t, i) => (
        <Card key={t.id} ac={t.c}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <span style={Object.assign({}, dsp, { fontSize: 18, fontWeight: 800, letterSpacing: 1.1, color: C.chalk })}>{i + 1}. {t.n}</span>
            <Chip c={t.c}>TEST {i + 1}</Chip>
          </div>
          <Note c={C.chalk}>{t.how}</Note>
          {t.fields.map((f) => (
            <div key={f.id} style={{ padding: "10px 0", borderBottom: "1px solid " + C.line }}>
              <Lab>{f.n}{f.k === "cm" ? " (cm)" : ""}</Lab>
              {f.k === "yn"
                ? <Seg opts={[["y", "YES", C.moss], ["n", "NO", C.oxide]]} val={get(f.id) || ""} on={(v) => put(f.id, get(f.id) === v ? "" : v)} />
                : <Fld v={get(f.id)} on={(v) => put(f.id, v)} ph="—" />}
            </div>))}
        </Card>))}
      <Card><Note c={C.chalk} s={{ marginTop: 0 }}>{RANGE_SKIP}</Note></Card>
      <Btn on={onClose} c={C.oxide} fill s={{ width: "100%" }}>DONE — IT'S SAVED</Btn>
    </Sheet>);
}

/* --- TRACK · the four tests, charted --- */
function TestBars({ data, color }) {
  const vals = data.filter((d) => d[1] != null).map((d) => d[1]);
  if (!vals.length) return <Note s={{ fontStyle: "italic" }}>Nothing logged yet.</Note>;
  const mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), span = mx - mn || mx || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 76, marginTop: 10 }}>
      {data.map((d, i) => { const has = d[1] != null; const rel = has ? (d[1] - mn) / span : 0; const h = has ? 18 + rel * 46 : 4;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0 }}>
            <div style={Object.assign({}, mno, { fontSize: 9, fontWeight: 700, color: has ? C.chalk : C.ash, marginBottom: 3 })}>{has ? d[1] : ""}</div>
            <div style={{ width: "100%", height: h, background: has ? color : C.line, borderRadius: "3px 3px 0 0" }} />
            <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, marginTop: 4, whiteSpace: "nowrap" })}>{d[0]}</div>
          </div>); })}
    </div>);
}

export function RangeTrack({ weeks, get }) {
  /* weeks: [{ label, key, rangeWeek }] — the test weeks, oldest first */
  const yn = (v) => (v === "y" ? "YES" : v === "n" ? "NO" : "—");
  return (
    <div>
      <Card ac={C.violet}>
        <Eye c={C.violet}>RANGE — the four tests</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{TEST_INTRO}</Note>
      </Card>
      {RANGE_CM.map((f) => (
        <Card key={f.id} ac={f.c}>
          <div style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{f.n}</div>
          <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, letterSpacing: 1, marginTop: 3 })}>CENTIMETRES · LOWER IS BETTER</div>
          <TestBars data={weeks.map((w) => [w.label, num(get(w.key, f.id))])} color={f.c} />
        </Card>))}
      <Card>
        <Eye c={C.brass}>The yes-or-nos</Eye>
        <div style={{ overflowX: "auto" }}>
          <table style={Object.assign({}, bdy, { width: "100%", minWidth: 420, borderCollapse: "collapse", fontSize: 11.5 })}>
            <thead><tr>
              <th style={Object.assign({}, mno, { textAlign: "left", color: C.ash, fontSize: 8, letterSpacing: 1, padding: "6px 8px 6px 0", borderBottom: "1px solid " + C.line })}>TEST</th>
              {weeks.map((w) => <th key={w.key} style={Object.assign({}, mno, { textAlign: "right", color: C.ash, fontSize: 8, letterSpacing: 1, padding: "6px 8px 6px 0", borderBottom: "1px solid " + C.line, whiteSpace: "nowrap" })}>{w.label.toUpperCase()}</th>)}
            </tr></thead>
            <tbody>
              {RANGE_TESTS.map((t) => t.fields.filter((f) => f.k === "yn").map((f) => (
                <tr key={f.id}>
                  <td style={{ color: C.chalk, padding: "8px 8px 8px 0", borderBottom: "1px solid " + C.line, lineHeight: 1.4 }}>{t.n} — {f.n}</td>
                  {weeks.map((w) => { const v = get(w.key, f.id);
                    return <td key={w.key} style={Object.assign({}, mno, { textAlign: "right", fontSize: 10, padding: "8px 8px 8px 0", borderBottom: "1px solid " + C.line, color: v === "y" ? C.moss : v === "n" ? C.oxide : C.ash })}>{yn(v)}</td>; })}
                </tr>)))}
            </tbody>
          </table>
        </div>
        <Note>If nothing has moved by week 5, the holds aren't long enough or the exhale isn't happening; fix that before adding anything.</Note>
      </Card>
    </div>);
}

/* --- the home block, written out: the protocol sheet's RANGE half --- */
export function RangeSheet({ rangeWeek, onClose, onOpenRange, onOpenMorning }) {
  const keep = isKeepWeek(rangeWeek);
  return (
    <Sheet title="THE HOME BLOCK" sub={"THE MORNING FIVE · " + rangeTitle(rangeWeek) + " · THE SKILL BLOCK"} colour={C.violet} onClose={onClose}>
      <Card ac={C.violet}><Note c={C.chalk} s={{ marginTop: 0 }}>{RANGE_INTRO}</Note><Note>{RANGE_HOW}</Note><Note c={C.oxide}>{RANGE_HIPS}</Note></Card>
      <Card ac={C.moss}>
        <Eye c={C.moss}>The morning five · on waking, after the sighs and the one thing · 5 min</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{MORNING_FIVE_HOW}</Note>
        {MORNING_FIVE.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
            <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.brass, flexShrink: 0, width: 34 })}>{s.s}s</span>
            <span style={Object.assign({}, bdy, { fontSize: 12, color: C.chalk, lineHeight: 1.45 })}>{s.l}</span>
          </div>))}
        <Btn on={onOpenMorning} c={C.moss} fill s={{ width: "100%", marginTop: 10 }}>▶ THE MORNING FIVE · 5 MIN</Btn>
      </Card>
      {keep ? (
        <Card ac={C.violet}>
          <Eye c={C.violet}>The keep · every evening · 10 min</Eye>
          <Note c={C.chalk} s={{ marginTop: 0 }}>{KEEP_LINE}</Note>
          {KEEP_STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.brass, flexShrink: 0, width: 34 })}>{s.s}s</span>
              <span style={Object.assign({}, bdy, { fontSize: 12, color: C.chalk, lineHeight: 1.45 })}>{s.l}</span>
            </div>))}
          <Btn on={onOpenRange} c={C.violet} fill s={{ width: "100%", marginTop: 10 }}>▶ THE KEEP · 10 MIN</Btn>
        </Card>) : (
        RANGE_SECTIONS.map((sec, si) => (
          <Card key={si} ac={sec.c}>
            <Eye c={sec.c}>{sec.n} · {sec.mins} min</Eye>
            {sec.note ? <Note c={C.chalk} s={{ marginTop: 0 }}>{sec.note}</Note> : null}
            {RANGE_STEPS.filter((s) => s.sec === si).map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
                <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.brass, flexShrink: 0, width: 34 })}>{s.s}s</span>
                <span style={Object.assign({}, bdy, { fontSize: 12, color: C.chalk, lineHeight: 1.45 })}>{s.l}</span>
              </div>))}
            {si === RANGE_SECTIONS.length - 1 ? <Btn on={onOpenRange} c={C.violet} fill s={{ width: "100%", marginTop: 10 }}>▶ RANGE · 20 MIN</Btn> : null}
          </Card>)))}
      <Card><Note c={C.chalk} s={{ marginTop: 0 }}>{KEEP_LINE}</Note><Note>{RANGE_SKIP}</Note></Card>
    </Sheet>);
}
