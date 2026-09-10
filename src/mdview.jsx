import React, { useMemo, useState, useRef } from "react";
import { C, dsp, bdy, mno, Card } from "./ui.jsx";

/* ================================================================
   DOCUMENT VIEW — the two source documents, rendered offline with a
   table of contents. Enough markdown for what these files use:
   headings, tables, lists, bold, italic, rules and paragraphs.
   ================================================================ */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* bold / italic inside a line */
function inline(text, key) {
  const out = []; let buf = ""; let i = 0; let n = 0;
  const push = () => { if (buf) { out.push(buf); buf = ""; } };
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const e = text.indexOf("**", i + 2);
      if (e > 0) { push(); out.push(<strong key={key + "b" + (n++)} style={{ color: C.chalk, fontWeight: 700 }}>{text.slice(i + 2, e)}</strong>); i = e + 2; continue; }
    }
    if (text[i] === "*" && text[i + 1] !== "*") {
      const e = text.indexOf("*", i + 1);
      if (e > 0) { push(); out.push(<em key={key + "i" + (n++)} style={{ color: C.brass, fontStyle: "italic" }}>{text.slice(i + 1, e)}</em>); i = e + 1; continue; }
    }
    buf += text[i]; i++;
  }
  push();
  return out;
}

const splitRow = (line) => line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

function parse(md) {
  const lines = md.split("\n");
  const blocks = []; let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (/^#{1,4}\s/.test(ln)) { const lvl = ln.match(/^#+/)[0].length; blocks.push({ t: "h", lvl, s: ln.replace(/^#+\s*/, "") }); i++; continue; }
    if (/^---+\s*$/.test(ln)) { blocks.push({ t: "hr" }); i++; continue; }
    if (/^\s*\|/.test(ln)) {
      const rows = []; while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const body = rows.filter((r) => !/^\s*\|[\s|:-]+\|\s*$/.test(r)).map(splitRow);
      if (body.length) blocks.push({ t: "table", head: body[0], rows: body.slice(1) });
      continue;
    }
    if (/^\s*[-*]\s+/.test(ln) || /^\s*\d+\.\s+/.test(ln)) {
      const items = []; while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) { items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, "")); i++; }
      blocks.push({ t: "ul", items }); continue;
    }
    if (!ln.trim()) { i++; continue; }
    const para = []; while (i < lines.length && lines[i].trim() && !/^#{1,4}\s/.test(lines[i]) && !/^\s*\|/.test(lines[i]) && !/^---+\s*$/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) { para.push(lines[i]); i++; }
    blocks.push({ t: "p", s: para.join(" ") });
  }
  return blocks;
}

export function DocView({ md, accent }) {
  const blocks = useMemo(() => parse(md), [md]);
  const toc = useMemo(() => blocks.filter((b) => b.t === "h" && b.lvl === 2).map((b) => ({ id: slug(b.s), s: b.s })), [blocks]);
  const [showToc, setShowToc] = useState(true);
  const wrap = useRef(null);
  const go = (id) => { const el = wrap.current && wrap.current.querySelector("#doc-" + id); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const ac = accent || C.brass;
  return (
    <div ref={wrap}>
      <Card ac={ac} s={{ padding: 0 }}>
        <button onClick={() => setShowToc(!showToc)} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: "13px 14px", cursor: "pointer", textAlign: "left", minHeight: 44 }}>
          <span style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 700, letterSpacing: 1.2, color: C.chalk })}>CONTENTS</span>
          <span style={Object.assign({}, mno, { fontSize: 15, color: C.ash })}>{showToc ? "−" : "+"}</span>
        </button>
        {showToc ? <div className="rise" style={{ padding: "0 14px 12px" }}>
          {toc.map((t) => (
            <button key={t.id} onClick={() => go(t.id)} style={Object.assign({}, bdy, { display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid " + C.line, color: C.chalk, fontSize: 13, padding: "10px 0", cursor: "pointer", minHeight: 44 })}>{t.s}</button>))}
        </div> : null}
      </Card>

      <Card>
        {blocks.map((b, k) => {
          if (b.t === "h") {
            const size = b.lvl === 1 ? 26 : b.lvl === 2 ? 20 : 15;
            return <div key={k} id={b.lvl === 2 ? "doc-" + slug(b.s) : undefined} style={Object.assign({}, dsp, { fontSize: size, fontWeight: 800, letterSpacing: 1.1, color: b.lvl <= 2 ? C.chalk : ac, marginTop: k ? (b.lvl <= 2 ? 26 : 16) : 0, marginBottom: 8, lineHeight: 1.15, scrollMarginTop: 96 })}>{inline(b.s, k)}</div>;
          }
          if (b.t === "hr") return <div key={k} style={{ height: 1, background: C.line, margin: "18px 0" }} />;
          if (b.t === "ul") return <ul key={k} style={{ margin: "6px 0 6px 0", paddingLeft: 18 }}>{b.items.map((it, j) => <li key={j} style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk, lineHeight: 1.55, marginBottom: 5 })}>{inline(it, k + "-" + j)}</li>)}</ul>;
          if (b.t === "table") return (
            <div key={k} style={{ overflowX: "auto", margin: "10px 0" }}>
              <table style={Object.assign({}, bdy, { width: "100%", minWidth: Math.min(640, 110 * b.head.length), borderCollapse: "collapse", fontSize: 11.5 })}>
                <thead><tr>{b.head.map((h, j) => <th key={j} style={Object.assign({}, mno, { textAlign: "left", color: C.ash, fontSize: 8, letterSpacing: 1, padding: "7px 8px 7px 0", borderBottom: "1px solid " + C.line, whiteSpace: "nowrap" })}>{h.toUpperCase()}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, ri) => <tr key={ri}>{r.map((cel, ci) => <td key={ci} style={{ color: ci === 0 ? ac : C.chalk, padding: "8px 8px 8px 0", borderBottom: "1px solid " + C.line, verticalAlign: "top", lineHeight: 1.4 }}>{inline(cel, k + "-" + ri + "-" + ci)}</td>)}</tr>)}</tbody>
              </table>
            </div>);
          return <div key={k} style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk, lineHeight: 1.6, margin: "9px 0" })}>{inline(b.s, k)}</div>;
        })}
      </Card>
    </div>);
}
