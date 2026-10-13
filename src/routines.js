import homeMd from "../home-routines.md?raw";

/* ================================================================
   THE HOME ROUTINES — home-routines.md, card by card

   Every card the morning and the evening routines show is read here
   from the document itself: the name, HOLD or REPS, the amount and the
   card's own words. Nothing is written in the app. A card is
   { no, n, kind: "hold" | "reps", secs, amt, words, halfway }:
   a HOLD card has `secs` and a clock; a REPS card has `amt` ("8 EACH
   SIDE") and none.
   ================================================================ */

const SEC = (t) => { const m = String(t).match(/^(\d+):(\d\d)/); if (m) return Number(m[1]) * 60 + Number(m[2]);
  const s = String(t).match(/^(\d+)\s*s\b/); return s ? Number(s[1]) : null; };

/* "HOLD 70 s", "HOLD 3:00 (practice time)", "REPS 8 EACH SIDE" */
function dose(t) {
  const h = String(t).match(/^HOLD\s+(.+)$/);
  if (h) return { kind: "hold", secs: SEC(h[1].trim()), amt: h[1].trim() };
  const r = String(t).match(/^REPS\s+(.+)$/);
  if (r) return { kind: "reps", secs: null, amt: r[1].trim() };
  return null;
}

/* the document split at its "## " headings */
function sections(md) {
  const out = {}; let cur = null;
  String(md || "").split(/\r?\n/).forEach((line) => {
    const h = line.match(/^##\s+(.+)$/);
    if (h) { cur = h[1].trim(); out[cur] = []; return; }
    if (cur) out[cur].push(line);
  });
  return out;
}
const sectionOf = (S, start) => { const k = Object.keys(S).find((x) => x.indexOf(start) === 0); return k ? S[k] : []; };

/* "**4 · OPEN BOOK — RIGHT ARM** · HOLD 70 s", then the words on the next line */
function numberedCards(lines) {
  const out = []; let part = "";
  lines.forEach((line, i) => {
    const p = line.match(/^###\s+(.+)$/); if (p) { part = p[1].trim(); return; }
    const m = line.match(/^\*\*(\d+)\s*·\s*(.+?)\*\*\s*·\s*(.+)$/); if (!m) return;
    let words = ""; for (let j = i + 1; j < lines.length; j++) { if (lines[j].trim()) { words = lines[j].trim(); break; } }
    out.push(Object.assign({ no: Number(m[1]), n: m[2].trim(), part, words }, dose(m[3].trim())));
  });
  return out;
}

const halfwayIn = (w) => /\bat halfway\b/i.test(w);
const card = (c) => Object.assign({}, c, { halfway: c.kind === "hold" && halfwayIn(c.words) });
/* "without the press": the card's words up to its "At halfway" */
const noPress = (w) => w.replace(/\s*At halfway\b[\s\S]*$/, "").trim();

const S = sections(homeMd);

/* ---------------- THE MORNING ---------------- */
const morningLines = sectionOf(S, "THE MORNING");
function morning() {
  let sighs = null, five = null;
  morningLines.forEach((line, i) => {
    const m = line.match(/^\*\*(.+?)\*\*\s*·\s*(.+)$/); if (!m) return;
    let words = ""; for (let j = i + 1; j < morningLines.length; j++) { if (morningLines[j].trim()) { words = morningLines[j].trim(); break; } }
    if (/SIGHS/.test(m[1])) sighs = { n: m[1].trim(), amt: m[2].trim(), words };
    if (/MORNING FIVE/.test(m[1])) five = { n: m[1].trim(), amt: m[2].trim(), words, rows: [] };
  });
  morningLines.forEach((line) => {
    const r = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*[—-]\s*(.+)$/);
    if (r && five) five.rows.push({ id: "m5_" + r[1].trim().toLowerCase().replace(/[^a-z]+/g, ""), n: r[1].trim(), text: r[2].trim() });
  });
  return { sighs, five };
}
const MORNING = morning();
export const SIGHS = MORNING.sighs;
export const MORNING_FIVE = MORNING.five;

/* ---------------- RANGE ---------------- */
export const RANGE_CARDS = numberedCards(sectionOf(S, "RANGE · ")).map(card);
const rangeCard = (no) => RANGE_CARDS.find((c) => c.no === no);

/* the fight week and the Keep: "1. **NAME** · HOLD 45 s (card 3)" or
   "· HOLD 35 s — as card 4, without the press." */
function listed(lines) {
  const out = [];
  lines.forEach((line) => {
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*·\s*((?:HOLD|REPS)\s+[^(—]+?)\s*(?:\(card\s+(\d+)\)|—\s*as card\s+(\d+)(,\s*without the press)?\.?)\s*$/);
    if (!m) return;
    const src = rangeCard(Number(m[4] || m[5]));
    const words = src ? (m[6] ? noPress(src.words) : src.words) : "";
    out.push(card(Object.assign({ no: Number(m[1]), n: m[2].trim(), from: src ? src.no : null, words }, dose(m[3].trim()))));
  });
  return out;
}
export const FIGHT_WEEK_CARDS = listed(sectionOf(S, "RANGE — FIGHT WEEK"));
export const KEEP_CARDS = listed(sectionOf(S, "THE KEEP"));

/* ---------------- THE MOVEMENT SESSION ---------------- */
/* "As RANGE card 24." is that card's words */
export const MOVE_CARDS = numberedCards(sectionOf(S, "THE MOVEMENT SESSION")).map((c) => {
  const as = c.words.match(/^As RANGE card (\d+)\.?$/);
  const src = as ? rangeCard(Number(as[1])) : null;
  return card(src ? Object.assign({}, c, { words: src.words, from: src.no }) : c);
});

/* ---------------- THE SKILL BLOCK ---------------- */
export const SKILL_CARDS = numberedCards(sectionOf(S, "THE SKILL BLOCK")).map(card);
/* the handstand card carries the level's instruction under its words */
export const skillCards = (hs) => SKILL_CARDS.map((c) => (/HANDSTAND/.test(c.n) && hs
  ? Object.assign({}, c, { level: "LEVEL " + hs.l + (hs.what ? " — " + hs.what : "") }) : c));

/* the amounts in the section headings: "about 20 minutes", "5 minutes" */
const minsOf = (start) => { const k = Object.keys(S).find((x) => x.indexOf(start) === 0); const m = k ? k.match(/(\d+)\s*minutes/) : null; return m ? Number(m[1]) : null; };
export const ROUTINE_MINS = { range: minsOf("RANGE · "), fight: minsOf("RANGE — FIGHT WEEK"), keep: minsOf("THE KEEP"), move: minsOf("THE MOVEMENT SESSION"), skill: minsOf("THE SKILL BLOCK") };

/* the line under a card's words: HOLD with a clock, or the reps */
export const doseLine = (c) => (c.kind === "hold" ? "HOLD" : "REPS " + c.amt);
