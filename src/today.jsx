import React, { useState } from "react";
import { C, dsp, bdy, mno, mmss, buzz, Card, Btn, Note, Seg, Fld, Lab } from "./ui.jsx";

/* ================================================================
   TODAY's small shared pieces: a numbered list of lines, and the four
   yes/no taps of the morning check. The flow itself is in App.jsx and
   now.jsx.
   ================================================================ */

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
          <span style={{ width: 150, flexShrink: 0 }}>
            <Seg opts={[["y", "YES", C.oxide], ["n", "NO", C.moss]]} val={a[i] || ""} on={(val) => put(i, val)} />
          </span>
        </div>))}
      {result ? (
        <div style={{ background: C.ink, border: "1px solid " + ac, borderRadius: 5, padding: "10px 12px", marginTop: 12 }}>
          <div style={Object.assign({}, mno, { fontSize: 18, letterSpacing: 1, color: ac, lineHeight: 1.5 })}>{say}</div>
          {from && from.length ? <div style={Object.assign({}, mno, { fontSize: 18, color: C.ash, marginTop: 5, lineHeight: 1.5 })}>{from.join(" · ")}</div> : null}
        </div>) : null}
    </div>);
}
