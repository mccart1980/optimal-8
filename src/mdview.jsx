import React, { useMemo, useState, useRef } from "react";
import { C, dsp, bdy, mno, cap, FS, Icon, Card } from "./ui.jsx";

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
      if (e > 0) { push(); out.push(<em key={key + "i" + (n++)} style={{ color: C.chalk, fontStyle: "italic" }}>{text.slice(i + 1, e)}</em>); i = e + 1; continue; }
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

export function DocView({ md }) {
  /* two documents joined into one share heading names, so every id is
     made unique in the order it appears */
  const blocks = useMemo(() => { const seen = {};
    return parse(md).map((b) => { if (b.t !== "h") return b; const s0 = slug(b.s); seen[s0] = (seen[s0] || 0) + 1;
      return Object.assign({}, b, { id: s0 + (seen[s0] > 1 ? "-" + seen[s0] : "") }); }); }, [md]);
  const toc = useMemo(() => blocks.filter((b) => b.t === "h" && b.lvl === 2).map((b) => ({ id: b.id, s: b.s })), [blocks]);
  const [showToc, setShowToc] = useState(true);
  const wrap = useRef(null);
  const go = (id) => { const el = wrap.current && wrap.current.querySelector("#doc-" + id); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <div ref={wrap}>
      <Card s={{ padding: 0 }}>
        <button onClick={() => setShowToc(!showToc)} aria-expanded={showToc} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: "0 16px", cursor: "pointer", textAlign: "left", minHeight: 56 }}>
          <span style={cap(C.ash)}>Contents</span>
          <span aria-hidden="true" style={{ color: C.ash, display: "flex", transform: showToc ? "rotate(180deg)" : "none", transition: "transform .2s" }}><Icon n="down" size={18} w={2.2} /></span>
        </button>
        {showToc ? <div className="rise" style={{ padding: "0 16px 4px" }}>
          {toc.map((t) => (
            <button key={t.id} onClick={() => go(t.id)} style={Object.assign({}, bdy, { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: "1px solid " + C.line, color: C.chalk, fontSize: FS.meta, fontWeight: 600, lineHeight: 1.3, padding: "10px 0", cursor: "pointer", minHeight: 48 })}>
              <span style={{ flex: 1, minWidth: 0 }}>{t.s}</span>
              <span aria-hidden="true" style={{ color: C.ring, display: "flex", flexShrink: 0 }}><Icon n="right" size={16} w={2.2} /></span>
            </button>))}
        </div> : null}
      </Card>

      <Card>
        {blocks.map((b, k) => {
          if (b.t === "h") {
            const size = b.lvl === 1 ? FS.title : b.lvl === 2 ? FS.lead : FS.body;
            return <div key={k} role="heading" aria-level={b.lvl} id={b.lvl === 2 ? "doc-" + b.id : undefined} style={Object.assign({}, dsp, { fontSize: size, fontWeight: 800, letterSpacing: b.lvl <= 2 ? .2 : 0, color: C.chalk, marginTop: k ? (b.lvl <= 2 ? 32 : 20) : 0, marginBottom: 8, lineHeight: 1.2, scrollMarginTop: 96 })}>{inline(b.s, k)}</div>;
          }
          if (b.t === "hr") return <div key={k} style={{ height: 1, background: C.line, margin: "20px 0" }} />;
          if (b.t === "ul") return <ul key={k} style={{ margin: "8px 0", paddingLeft: 20 }}>{b.items.map((it, j) => <li key={j} style={Object.assign({}, bdy, { fontSize: FS.body, color: C.chalk, lineHeight: 1.5, marginBottom: 6 })}>{inline(it, k + "-" + j)}</li>)}</ul>;
          if (b.t === "table") return (
            <div key={k} className="o8-row" style={{ overflowX: "auto", margin: "12px -16px", padding: "0 16px" }}>
              <table style={Object.assign({}, bdy, { width: "100%", minWidth: Math.min(640, 120 * b.head.length), borderCollapse: "collapse", fontSize: FS.meta })}>
                <thead><tr>{b.head.map((h, j) => <th key={j} style={Object.assign({}, mno, { textAlign: "left", color: C.ash, fontSize: FS.micro, fontWeight: 700, letterSpacing: .6, padding: "8px 12px 8px 0", borderBottom: "1px solid " + C.line, whiteSpace: "nowrap" })}>{h.toUpperCase()}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, ri) => <tr key={ri}>{r.map((cel, ci) => <td key={ci} style={{ color: C.chalk, fontWeight: ci === 0 ? 600 : 400, padding: "10px 12px 10px 0", borderBottom: "1px solid " + C.line, verticalAlign: "top", lineHeight: 1.4 }}>{inline(cel, k + "-" + ri + "-" + ci)}</td>)}</tr>)}</tbody>
              </table>
            </div>);
          return <div key={k} style={Object.assign({}, bdy, { fontSize: FS.body, color: C.chalk, lineHeight: 1.55, margin: "12px 0" })}>{inline(b.s, k)}</div>;
        })}
      </Card>
    </div>);
}
