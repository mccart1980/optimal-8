import React from "react";
import { C, dsp, bdy, mno, Card, Eye, Lab, Fld, Btn, Chip, Note, Seg } from "./ui.jsx";
import { Sheet } from "./im-ui.jsx";
import { LEVELS, levelOf, MOVE_TESTS, rangeStandardsMet, testSummary, canMarkEnd } from "./move.js";

/* ================================================================
   OPTIMAL 8 · MOVE — the levels on a card, the fifteen standards'
   sheet from the Sunday weekly check, and TRACK's table of them.
   ================================================================ */

const T3 = 18;

/* --- THE LEVELS: the move's level, one down, one up --- */
export function MoveLevels({ ids, lv, onStep }) {
  const list = (ids || []).filter((id, i, a) => LEVELS[id] && a.indexOf(id) === i);
  if (!list.length) return null;
  return (
    <div data-testid="move-levels" style={{ marginTop: 16, border: "1px solid " + C.line, borderRadius: 8, padding: "4px 12px" }}>
      <div style={Object.assign({}, mno, { fontSize: T3, color: C.violet, letterSpacing: 1, margin: "10px 0 2px" })}>YOUR LEVELS · UP WHEN IT'S CLEAN TWICE RUNNING</div>
      {list.map((id) => { const L = LEVELS[id], n = levelOf(lv, id);
        return (
          <div key={id} data-level-id={id} style={{ borderTop: "1px solid " + C.line, padding: "10px 0" }}>
            <div style={Object.assign({}, bdy, { fontSize: T3, fontWeight: 700, color: C.chalk })}>{L.n}</div>
            <div data-testid="move-level-line" style={Object.assign({}, mno, { fontSize: T3, color: C.violet, lineHeight: 1.4, marginTop: 4 })}>{"LEVEL " + n + " OF " + L.l.length + " — " + L.l[n - 1]}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn on={() => onStep(id, -1)} c={C.ash} dis={n <= 1} s={{ flex: 1, minHeight: 52, fontSize: T3 }}>▼ DOWN</Btn>
              <Btn on={() => onStep(id, 1)} c={C.violet} dis={n >= L.l.length} s={{ flex: 1, minHeight: 52, fontSize: T3 }}>▲ UP</Btn>
            </div>
          </div>); })}
    </div>);
}

/* --- THE FIFTEEN STANDARDS · MOVE weeks 1, 5, 9 and 13, then every eight --- */
export function MoveTests({ mw, get, put, gymGet, prevGet, ends, onEnd, onClose }) {
  const g = (id) => (id === "mv11" ? gymGet(id) : get(id));
  const E = ends || {};
  const keep = rangeStandardsMet(g, E);
  return (
    <Sheet title="THE FIFTEEN STANDARDS" sub={"MOVE WEEK " + mw + " · ON THE SUNDAY WEEKLY CHECK"} colour={C.violet} onClose={onClose}>
      {MOVE_TESTS.map((t, i) => (
        <Card key={t.id} ac={t.met(g) || E[t.id] ? C.moss : C.violet}>
          <div data-move-test={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 800, letterSpacing: 1, color: C.chalk })}>{i + 1}. {t.n}</span>
            <Chip c={t.met(g) || E[t.id] ? C.moss : C.violet}>{t.met(g) ? "MET" : E[t.id] ? "YOUR END" : "TARGET " + t.tgt.toUpperCase()}</Chip>
          </div>
          <Note c={C.chalk}>{t.how}</Note>
          {t.fields.map((f) => (
            <div key={f.id} style={{ padding: "10px 0", borderBottom: "1px solid " + C.line }}>
              <Lab>{f.n}</Lab>
              {t.gym
                ? <div data-testid="move-gym-field" style={Object.assign({}, mno, { fontSize: T3, color: g(f.id) ? C.chalk : C.ash, marginTop: 6 })}>{g(f.id) ? g(f.id) + " S · FROM SUNDAY'S SESSION" : "— · IN SUNDAY'S SESSION, THE BACK EXTENSION'S SLOT"}</div>
                : f.k === "yn"
                  ? <Seg opts={[["y", "YES", C.moss], ["n", "NO", C.oxide]]} val={get(f.id) || ""} on={(val) => put(f.id, get(f.id) === val ? "" : val)} />
                  : <Fld v={get(f.id)} on={(val) => put(f.id, val)} ph="—" />}
            </div>))}
          {E[t.id] && !t.met(g)
            ? <div data-testid="move-end" style={{ marginTop: 12 }}>
                <Note c={C.moss}>Marked as your end: it counts as met. Keep testing it; if it moves, it moves.</Note>
                <Btn on={() => onEnd(t.id)} c={C.ash} s={{ width: "100%", minHeight: 52, fontSize: T3 }}>UNDO — NOT MY END</Btn>
              </div>
            : canMarkEnd(t, g, prevGet) && onEnd
              ? <div data-testid="move-end" style={{ marginTop: 12 }}>
                  <Note c={C.chalk}>Only if all three are true: this test and the last both fell short with no gain; the end feels like a hard block or a pinch, not a stretch; and a physio has looked at any pinch.</Note>
                  <Btn on={() => onEnd(t.id)} c={C.moss} s={{ width: "100%", minHeight: 52, fontSize: T3 }}>THIS IS MY END</Btn>
                </div>
              : null}
        </Card>))}
      <Note c={keep ? C.moss : C.chalk} bold>{keep
        ? "Every range standard met or marked as your end: from next week RANGE drops to THE KEEP, 10 minutes."
        : "RANGE stays at about 20 minutes until standards 3 to 8, 12, 13 and 15 are all met or marked as your end."}</Note>
      <Btn on={onClose} c={C.violet} fill s={{ width: "100%" }}>DONE — IT'S SAVED</Btn>
    </Sheet>);
}

/* --- TRACK · the standards, test by test: a list, so it reads on a phone --- */
export function MoveTrack({ weeks, get, ends }) {
  const E = ends || {};
  /* weeks: [{ label, key }] — MOVE's test weeks, oldest first */
  if (!weeks || !weeks.length) return null;
  return (
    <Card ac={C.violet}>
      <Eye c={C.violet}>MOVE — the fifteen standards</Eye>
      <div data-testid="move-track">
        {MOVE_TESTS.map((t, i) => (
          <div key={t.id} data-track-standard={t.id} style={{ borderTop: i ? "1px solid " + C.line : "none", padding: "10px 0" }}>
            <div style={Object.assign({}, bdy, { fontSize: T3, fontWeight: 700, color: C.chalk, lineHeight: 1.35 })}>{(i + 1) + ". " + t.n}<span style={{ fontWeight: 400, color: C.ash }}>{" · " + t.tgt}</span>{E[t.id] ? <span data-testid="track-end" style={{ color: C.moss }}>{" · YOUR END"}</span> : null}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 4 }}>
              {weeks.map((w) => { const g = (id) => get(w.key, id), met = t.met(g);
                return <span key={w.key} data-track-week={w.key} style={Object.assign({}, mno, { fontSize: 16, color: met ? C.moss : C.chalk })}>{w.label.toUpperCase() + " · " + testSummary(t, g) + (met ? " ✓" : "")}</span>; })}
            </div>
          </div>))}
      </div>
      <Note>Green is met. RANGE drops to THE KEEP once standards 3 to 8, 12, 13 and 15 are all met or marked as your end.</Note>
    </Card>);
}
