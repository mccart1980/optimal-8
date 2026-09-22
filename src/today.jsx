import React, { useState } from "react";
import { C, dsp, bdy, mno, mmss, buzz, Card, Btn, Note, Seg, Fld, Lab } from "./ui.jsx";
import { useRunner } from "./im-ui.jsx";

/* ================================================================
   TODAY — one guided flow.

   Every item of the day appears once, in order. The current item is
   open with its timer or its fields; everything finished is collapsed
   above it with a tick; everything still to come is collapsed below.
   One NEXT button moves down the list.
   ================================================================ */

/* ---------- a list of moves with one running timer under it ----------
   The timer steps through the moves; the list marks where it is. */
export function TimedRows({ steps, rows, rowOf, colour, sound, onFinish }) {
  const R = useRunner(steps, sound, onFinish);
  const { s } = R;
  const col = colour || C.violet;
  const at = rowOf ? rowOf(s.i) : s.i;
  const cur = steps[s.i] || null;
  return (
    <div>
      {rows.map((r, i) => {
        const live = !s.done && i === at;
        const past = s.done || i < at;
        return (
          <div key={r.id || i} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "7px 0", borderBottom: "1px solid " + C.line, opacity: past && !live ? .55 : 1 }}>
            <span style={Object.assign({}, mno, { fontSize: 14, color: live ? col : C.ash, width: 18, flexShrink: 0 })}>{live ? "▸" : i + 1}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={Object.assign({}, bdy, { fontSize: 18, fontWeight: 600, color: live ? C.chalk : C.ash, lineHeight: 1.4 })}>{r.n}</div>
              {r.s ? <div style={Object.assign({}, mno, { fontSize: 15, color: C.brass, marginTop: 3, letterSpacing: .4 })}>{r.s}</div> : null}
            </span>
          </div>); })}

      <div style={{ background: C.ink, border: "1px solid " + C.line, borderRadius: 6, padding: "12px 12px 10px", marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={Object.assign({}, mno, { fontSize: 40, fontWeight: 700, color: s.done ? C.moss : C.chalk, lineHeight: 1 })}>{s.done ? "✓" : mmss(s.left)}</span>
          <span style={Object.assign({}, mno, { fontSize: 13, color: C.ash, letterSpacing: 1 })}>{s.done ? mmss(R.total) + " TOTAL" : mmss(R.total - R.elapsed) + " LEFT"}</span>
        </div>
        <div style={Object.assign({}, bdy, { fontSize: 16, color: s.done ? C.moss : col, marginTop: 8, lineHeight: 1.45, fontWeight: 600 })}>{s.done ? "COMPLETE" : cur ? cur.l : ""}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <Btn on={R.reset} c={C.ash} small s={{ flex: 1 }}>RESET</Btn>
          <Btn on={s.run ? R.pause : R.start} c={col} fill={!s.run && !s.done} dis={s.done} small s={{ flex: 2 }}>{s.done ? "DONE" : s.run ? "PAUSE" : "START"}</Btn>
          <Btn on={R.skip} c={C.ash} dis={s.done} small s={{ flex: 1 }}>SKIP</Btn>
        </div>
      </div>
    </div>);
}

/* ---------- a plain numbered list of lines, no ticks, no timers ---------- */
export function Lines({ rows, colour }) {
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "7px 0", borderBottom: i < rows.length - 1 ? "1px solid " + C.line : "none" }}>
          <span style={Object.assign({}, mno, { fontSize: 14, color: colour || C.brass, width: 18, flexShrink: 0 })}>{i + 1}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <div style={Object.assign({}, bdy, { fontSize: 18, fontWeight: 600, color: C.chalk, lineHeight: 1.45 })}>{typeof r === "string" ? r : r.n}</div>
            {typeof r === "string" || !r.s ? null : <div style={Object.assign({}, mno, { fontSize: 16, color: C.brass, marginTop: 4, letterSpacing: .4 })}>{r.s}</div>}
            {typeof r === "string" || !r.how ? null : <div style={Object.assign({}, bdy, { fontSize: 16, color: C.ash, marginTop: 4, lineHeight: 1.5 })}>{r.how}</div>}
          </span>
        </div>))}
    </div>);
}

/* ---------- the four yes/no taps and the day it resolves to ---------- */
export function CheckTaps({ qs, answers, setAnswers, result, line, from }) {
  const a = answers || [];
  const put = (i, val) => { const n = a.slice(); while (n.length < qs.length) n.push(""); n[i] = n[i] === val ? "" : val; setAnswers(n); buzz(15); };
  const ac = result === "R" ? C.oxide : result === "Y" ? C.brass : result === "G" ? C.moss : C.cobalt;
  const say = line || (result === "R" ? "RED — the hard steps come off the order"
    : result === "Y" ? "YELLOW — every load −7%"
    : result === "G" ? "GREEN — the session as written" : "");
  return (
    <div>
      {qs.map((q, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
          <span style={Object.assign({}, bdy, { flex: 1, minWidth: 0, fontSize: 18, fontWeight: 600, color: C.chalk, lineHeight: 1.35 })}>{q}</span>
          <span style={{ width: 140, flexShrink: 0 }}>
            <Seg opts={[["y", "YES", C.oxide], ["n", "NO", C.moss]]} val={a[i] || ""} on={(val) => put(i, val)} />
          </span>
        </div>))}
      {result ? (
        <div style={{ background: C.ink, border: "1px solid " + ac, borderRadius: 5, padding: "10px 12px", marginTop: 12 }}>
          <div style={Object.assign({}, mno, { fontSize: 13, letterSpacing: 1.2, color: ac, lineHeight: 1.5 })}>{say}</div>
          {from && from.length ? <div style={Object.assign({}, mno, { fontSize: 11, color: C.ash, marginTop: 5, lineHeight: 1.5 })}>{from.join(" · ")}</div> : null}
        </div>) : null}
    </div>);
}

/* ================================================================
   THE FLOW ITSELF
   ================================================================ */
const secLine = (n, c) => (
  <div style={Object.assign({}, mno, { fontSize: 14, fontWeight: 700, letterSpacing: 2, color: c || C.brass, padding: "16px 2px 8px" })}>{n}</div>);

function FlowRow({ item, no, open, onOpen, onTick, last }) {
  const col = item.colour || C.brass;
  const edge = item.done ? C.moss : open ? col : C.line;
  return (
    <Card ac={edge} s={{ padding: 0, opacity: item.done && !open ? .62 : 1 }}>
      <div data-flow-id={item.id} data-flow-name={item.n} data-flow-open={open ? "1" : "0"} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
        <button onClick={onTick} aria-label={(item.done ? "Untick " : "Tick ") + item.n}
          style={Object.assign({}, mno, { width: 48, height: 48, flexShrink: 0, borderRadius: 5, cursor: "pointer", fontSize: 17, fontWeight: 700, background: item.done ? C.moss : C.ink, color: item.done ? C.ink : col, border: "1px solid " + (item.done ? C.moss : C.line) })}>{item.done ? "✓" : no}</button>
        <span onClick={onOpen} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
          {item.clock ? <div style={Object.assign({}, mno, { fontSize: 14, color: C.ash, letterSpacing: 1 })}>{item.clock}</div> : null}
          <div style={Object.assign({}, bdy, { fontSize: 19, fontWeight: 600, color: C.chalk, lineHeight: 1.3 })}>{item.n}</div>
          {item.s ? <div style={Object.assign({}, mno, { fontSize: 24, fontWeight: 700, color: C.brass, marginTop: 4, lineHeight: 1.3, overflowWrap: "anywhere" })}>{item.s}</div> : null}
        </span>
        <span onClick={onOpen} style={Object.assign({}, mno, { fontSize: 17, color: col, flexShrink: 0, cursor: "pointer", width: 22, textAlign: "right" })}>{open ? "▾" : "▸"}</span>
      </div>
      {open ? (
        <div className="rise" style={{ padding: "0 12px 12px" }}>
          <div style={{ height: 1, background: C.line, marginBottom: 12 }} />
          {item.body ? item.body() : null}
          {item.tr ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 12, textAlign: "center", letterSpacing: 1 })}>↓ {item.tr} MIN TRANSITION ↓</div> : null}
        </div>) : null}
    </Card>);
}

export function TodayFlow({ items, curId, go, mark, streak, header }) {
  const live = items.filter((x) => x);
  const curIdx = curId === null ? -1 : (() => {
    const i = live.findIndex((x) => x.id === curId); if (i >= 0) return i;
    return live.findIndex((x) => !x.done); })();
  const cur = curIdx >= 0 ? live[curIdx] : null;
  const allDone = live.length > 0 && live.every((x) => x.done);
  const next = () => {
    if (!cur) return;
    mark(cur, true);
    const after = live.slice(curIdx + 1);
    const n = after.find((x) => !x.done) || live.find((x, i) => i !== curIdx && !x.done) || null;
    go(n ? n.id : null);
    buzz(30);
  };
  let sec = null, no = 0;
  return (
    <div>
      {header || null}
      {allDone ? (
        <Card ac={C.moss}>
          <div style={Object.assign({}, dsp, { fontSize: 38, fontWeight: 800, letterSpacing: 2, color: C.moss, lineHeight: 1 })}>DONE</div>
          <div style={Object.assign({}, mno, { fontSize: 15, color: C.ash, letterSpacing: 1.4, marginTop: 8 })}>STREAK · {streak == null ? "—" : streak}</div>
        </Card>) : null}
      {live.map((it, i) => {
        no += 1;
        const head = it.sec !== sec ? (sec = it.sec, secLine(it.sec, it.secColour)) : null;
        const open = cur ? it.id === cur.id : false;
        return (
          <div key={it.id}>
            {head}
            {it.head ? it.head() : null}
            <FlowRow item={it} no={no} open={open}
              onOpen={() => go(it.id)}
              onTick={() => mark(it, !it.done)} />
          </div>); })}
      {cur ? (
        <div style={{ position: "sticky", bottom: 64, zIndex: 20, paddingTop: 6 }}>
          <Btn on={next} c={C.moss} fill s={{ width: "100%", fontSize: 17, padding: "15px 0" }}>
            {live.filter((x) => !x.done).length <= 1 ? "NEXT — FINISH THE DAY" : "NEXT"}
          </Btn>
        </div>) : null}
    </div>);
}
