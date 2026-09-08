import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./storage.js"; // installs window.storage (localStorage-backed)

/* ================================================================
   OPTIMAL 8 — THE FIGHTER BUILD · companion app
   The phase colour drives the screen: BUILD moss, FORCE oxide,
   VELOCITY brass, TAPER/TEST cobalt. Durability work is violet.
   ================================================================ */
const C = {
  ink: "#101416", slab: "#171C20", card: "#1D2429", line: "#2E383F", ash: "#8A959E", chalk: "#ECE6D8",
  moss: "#66845A", oxide: "#C24E33", brass: "#D2A047", cobalt: "#4F84A8", violet: "#7A6AA6",
};
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
html, body { background: ${C.ink}; }
input, button, textarea { font-family: inherit; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
input[type=date] { color-scheme: dark; }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid ${C.brass}; outline-offset: 2px; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
@keyframes rise { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
.rise { animation: rise .16s ease-out; }
@media (prefers-reduced-motion: reduce) { .rise { animation: none } * { transition: none !important } }
::-webkit-scrollbar { width: 0; height: 0; }
`;
const dsp = { fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" };
const bdy = { fontFamily: "'Barlow', system-ui, sans-serif" };
const mno = { fontFamily: "'IBM Plex Mono', 'Roboto Mono', monospace" };

/* ---------- storage ---------- */
async function load(k, f) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : f; } catch { return f; } }
async function save(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } }

/* ---------- file backup (Web Share where available, download otherwise) ---------- */
const backupName = () => "optimal-8-backup-" + new Date().toISOString().slice(0, 10) + ".json";
async function shareOrDownload(text) {
  const name = backupName();
  try {
    if (typeof navigator !== "undefined" && navigator.canShare && typeof File === "function") {
      const file = new File([text], name, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Optimal 8 backup" }); return "shared"; }
    }
  } catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 5000);
    return "downloaded";
  } catch (e) { return "failed"; }
}
const readTextFile = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result || "")); r.onerror = () => rej(r.error); r.readAsText(file); });

const buzz = (m) => { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} };
const mmss = (s) => { const a = Math.abs(Math.round(s)), m = Math.floor(a / 60), x = a % 60; return (s < 0 ? "-" : "") + m + ":" + (x < 10 ? "0" : "") + x; };
const r25 = (n) => Math.round(n / 2.5) * 2.5;
const num = (v) => { if (v === "" || v === null || v === undefined) return null; const n = Number(v); return isNaN(n) ? null : n; };

/* ---------- dates ---------- */
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DSH = { mon: "MON", tue: "TUE", wed: "WED", thu: "THU", fri: "FRI", sat: "SAT", sun: "SUN" };
const iso = (d) => { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
const mondayOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const parseISO = (s) => { const p = String(s).split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const todayKey = () => DAYS[(new Date().getDay() + 6) % 7];
const defaultStart = () => { const t = new Date(); const dow = (t.getDay() + 6) % 7; const m = mondayOf(t); if (dow >= 5) m.setDate(m.getDate() + 7); return iso(m); };
const fmtDate = (s) => { try { return parseISO(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch (e) { return s; } };

/* ================================================================
   THE MACROCYCLE — every prescription in the app derives from here
   ================================================================ */
const PH = {
  b1: { n: "BUILD", long: "BLOCK 1 · BUILD", ac: C.moss, vl: "25–30%",
    note: "The most volume in the cycle — four sets of rows, three of split squats. Loaded drop jumps. Friday’s ride at its full 55 minutes. Jump circuit at 2 rounds, punch throws at 3, Nordics ramping up. Week 1 finds your trap bar and push press numbers." },
  b2: { n: "FORCE", long: "BLOCK 2 · FORCE", ac: C.oxide, vl: "15–20%",
    note: "Accessories drop to 3 sets and the bar gets heavier: the rests on the main lifts go to 2½ minutes for the heavy triples. Friday's easy ride drops to 45 min. Week 9's single is a direction check, not your real number — you're carrying fatigue." },
  b3: { n: "VELOCITY", long: "BLOCK 3 · VELOCITY", ac: C.brass, vl: "10–15%",
    note: "Everything gets faster. The jump circuit leads Saturday at 4 rounds with the band-assisted jump; the squat drops to 2×2 @ 88% behind it. Monday's bench and bench throws merge into one circuit. Depth jumps replace loaded drop jumps, side bounds go continuous, punch throws to 4 rounds, trap bar and push press to fast 3×3s at 80%, and Wednesday's pause squat becomes a speed squat. Speed fades fastest once you stop — so it's trained hardest right before the test." },
  taper: { n: "TAPER", long: "TAPER & TEST", ac: C.cobalt, vl: "≤10%",
    note: "Volume −40% then −60%. Intensity held. A deload drops intensity to restore you; a taper drops volume and keeps intensity, because fatigue sheds faster than fitness. Sprints and jumps stay in both weeks — reduce their volume, never their intent. Saturday of week 16 is test day." },
  hell: { n: "HELL WEEK", long: "HELL WEEK", ac: C.oxide, vl: "—",
    note: "You've just tapered for two weeks — the freshest you'll be all cycle, the only sensible place for a maximal test battery. No Optimal 8 volume. One flagship test per day, drawn from the cards each morning. Run it from the IRON tab." },
  reload: { n: "RELOAD", long: "RELOAD", ac: C.moss, vl: "—",
    note: "Sets −40%, intensity ~70%. Light movement, full food. The adaptation happens now, not during the testing. Sprints and jumps stay in at reduced volume. Then straight into week 1 of the next macrocycle." },
};
const phaseOf = (w) => (w <= 5 ? "b1" : w <= 10 ? "b2" : w <= 14 ? "b3" : w <= 16 ? "taper" : w === 17 ? "hell" : "reload");
const bwk = (w) => (w <= 5 ? w : w <= 10 ? w - 5 : w <= 14 ? w - 10 : null);

const ENG = {
  vo2: { n: "4-MINUTE INTERVALS", d: "4 × 4 min @ 90–95% HRmax / 3 min easy", why: "The most replicated protocol for raising aerobic power. Boxing is ~75–80% aerobic." },
  lac: { n: "40-SECOND REPEATS", d: "2 blocks × (3 × 40s max / 80s) · 5 min between blocks", why: "Post-bout lactate in amateurs sits at 10–15 mmol/L. This is the only session that goes there. Rounds 1–2 feel manageable, round 3 burns, the last three are unpleasant. That sensation is the training effect. Don't sandbag the early rounds." },
  rz: { n: "30-SECOND ALL-OUTS", d: "5 × 30s all-out / 3:00 full recovery", why: "Alactic-glycolytic power and the ability to repeat it. Take the whole 3 minutes or you are training lactate tolerance, which has its own slot." },
  rz3: { n: "ALL-OUTS · TAPER", d: "3 × 30s all-out / 3:00 full recovery", why: "Sharp and short. Intent held, volume down." },
  easy: { n: "EASY ZONE 2", d: "20 min conversational", why: "Deload. Nothing else." },
  easy15: { n: "EASY FLUSH", d: "15 min conversational", why: "Test week. Nothing else." },
};
const SIMB = { 1: { rest: 45 }, 2: { rest: 90, max3: 1 }, 3: { rest: 60 }, 4: { rest: 60, tested: 1 }, 5: { skip: 1 } };

const R = {};
const cal = { sc: "CALIBRATE — ramp to a 3RM @ RPE 8", cal: 1 };
const tbB = (sc, s, r, p) => ({ sc, sets: s, reps: r, pct: p });
const wk = (w, o) => { R[w] = Object.assign({ w, ph: phaseOf(w), bw: bwk(w), cpct: 85, vec: 3, jump: "AEL", js: [4, 4], bound: "stick", z2wed: 30, z2sun: 40, sled: 5, sprPct: 100, throw: [5, 3] }, o); };
wk(1, { sc: "4 × 6 @ 75%", sets: 4, reps: 6, pct: 75, cr: 2, spr: 3, acc: 4, nor: [2, 3], tb: cal, pp: cal, eng: "vo2", sim: SIMB[1], cal: 1 });
wk(2, { sc: "4 × 5 @ 78%", sets: 4, reps: 5, pct: 78, cr: 2, spr: 4, acc: 4, nor: [2, 4], tb: tbB("4 × 3 @ 80%", 4, 3, 80), pp: tbB("4 × 3 @ 82%", 4, 3, 82), eng: "lac", sim: SIMB[2] });
wk(3, { sc: "4 × 5 @ 80%", sets: 4, reps: 5, pct: 80, cr: 2, spr: 5, acc: 4, nor: [3, 4], tb: tbB("4 × 3 @ 80%", 4, 3, 80), pp: tbB("4 × 3 @ 82%", 4, 3, 82), eng: "rz", sim: SIMB[3] });
wk(4, { sc: "MAX SINGLE → 2 × 3 @ 85%", sets: 2, reps: 3, pct: 85, maxSq: 1, maxBe: 1, cr: 2, spr: 5, acc: 4, nor: [3, 5], tb: tbB("4 × 3 @ 80%", 4, 3, 80), pp: { bench: 1 }, eng: "vo2", sim: SIMB[4] });
wk(5, { sc: "2 × 5 @ 65% — deload", sets: 2, reps: 5, pct: 65, cr: 1, spr: 3, sprPct: 90, acc: 2, nor: [2, 3], tb: tbB("2 × 3 @ 65%", 2, 3, 65), pp: tbB("2 × 3 @ 65%", 2, 3, 65), vec: 2, js: [2, 4], eng: "easy", sim: SIMB[5], dl: 1, sled: 3 });
wk(6, { sc: "4 × 4 @ 82%", sets: 4, reps: 4, pct: 82, cr: 3, spr: 3, acc: 3, nor: [3, 5], tb: tbB("4 × 3 @ 85%", 4, 3, 85), pp: tbB("4 × 3 @ 85%", 4, 3, 85), iso: 1, z2wed: 20, eng: "vo2", sim: SIMB[1] });
wk(7, { sc: "4 × 3 @ 85%", sets: 4, reps: 3, pct: 85, cr: 3, spr: 4, acc: 3, nor: [3, 5], tb: tbB("4 × 3 @ 85%", 4, 3, 85), pp: tbB("4 × 3 @ 85%", 4, 3, 85), iso: 1, z2wed: 20, eng: "lac", sim: SIMB[2] });
wk(8, { sc: "4 × 3 @ 87%", sets: 4, reps: 3, pct: 87, cr: 3, spr: 5, acc: 3, nor: [3, 5], tb: tbB("4 × 3 @ 85%", 4, 3, 85), pp: tbB("4 × 3 @ 85%", 4, 3, 85), iso: 1, z2wed: 20, eng: "rz", sim: SIMB[3] });
wk(9, { sc: "MAX SINGLE → 2 × 2 @ 88%", sets: 2, reps: 2, pct: 88, maxSq: 1, maxBe: 1, mid: 1, cr: 2, spr: 5, acc: 3, nor: [3, 5], tb: tbB("3 × 2 @ 88%", 3, 2, 88), pp: { bench: 1 }, z2wed: 20, eng: "vo2", sim: SIMB[4] });
wk(10, { sc: "2 × 4 @ 65% — deload", sets: 2, reps: 4, pct: 65, cr: 1, spr: 3, sprPct: 90, acc: 2, nor: [2, 3], tb: tbB("2 × 3 @ 65%", 2, 3, 65), pp: tbB("2 × 3 @ 65%", 2, 3, 65), vec: 2, js: [2, 4], z2wed: 20, eng: "easy", sim: SIMB[5], dl: 1, sled: 3 });
[11, 12, 13, 14].forEach((w, i) => wk(w, { sc: "JUMP CIRCUIT LEADS · 2 × 2 @ 88% after", sets: 2, reps: 2, pct: 88, cpct: 88, cr: 4, spr: [3, 4, 5, 5][i], acc: 3, nor: [3, 5],
  tb: tbB("3 × 3 @ 80% — bar speed", 3, 3, 80), pp: tbB("3 × 3 @ 80% — bar speed", 3, 3, 80), vec: 4, jump: "DEPTH", js: [4, 5], bound: "cont",
  eng: ["vo2", "lac", "rz", "vo2"][i], sim: [{ rest: 60 }, { rest: 45 }, { rest: 60 }, { rest: 60, tested: 1 }][i], upperC: 1, lowerLead: 1, bw: i + 1 }));
wk(15, { sc: "2 × 2 @ 85%", sets: 2, reps: 2, pct: 85, cr: 2, spr: 3, acc: 2, nor: [2, 4], tb: tbB("2 × 2 @ 85%", 2, 2, 85), pp: tbB("2 × 2 @ 85%", 2, 2, 85), vec: 2, jump: "DEPTH", js: [2, 5], bound: "cont", eng: "rz3", sim: { rounds: 3, rest: 60 }, tp: 1 });
wk(16, { sc: "1 × 2 @ 85%", sets: 1, reps: 2, pct: 85, bsc: "2 × 2 @ 85%", bsets: 2, cr: 1, spr: 3, acc: 1, nor: null, tb: tbB("1 × 2 @ 80%", 1, 2, 80), pp: null, vec: 2, jump: "DEPTH", js: [2, 3], bound: "cont", z2wed: 20, z2sun: 30, eng: "easy15", sim: SIMB[5], throw: [3, 3], tp: 1, test: 1 });
wk(17, { sc: "NO OPTIMAL 8 VOLUME", hell: 1, eng: null, sim: SIMB[5] });
wk(18, { sc: "2 × 5 @ 70% — reload", sets: 2, reps: 5, pct: 70, cr: 1, spr: 3, sprPct: 90, acc: 2, nor: [2, 3], tb: tbB("2 × 3 @ 65%", 2, 3, 65), pp: tbB("2 × 3 @ 65%", 2, 3, 65), vec: 2, js: [2, 4], eng: "easy", sim: SIMB[5], dl: 1, sled: 3, reload: 1 });
const ENG2 = { 1: "lac", 2: "rz", 3: "vo2", 4: "lac", 5: "easy", 6: "lac", 7: "rz", 8: "vo2", 9: "lac", 10: "easy", 11: "lac", 12: "rz", 13: "vo2", 14: "lac", 15: "easy", 16: null, 17: null, 18: "easy" };
const pqB = (sc, pct, sets, reps, fast) => ({ sc, pct, sets: sets || 3, reps: reps || 3, fast: !!fast });
const PQ = { 1: pqB("3 × 3 @ 75%", 75), 2: pqB("3 × 3 @ 78%", 78), 3: pqB("3 × 3 @ 80%", 80), 4: null, 5: pqB("2 × 3 @ 65% — easy week", 65, 2), 6: pqB("3 × 3 @ 80%", 80), 7: pqB("3 × 3 @ 82%", 82), 8: pqB("3 × 3 @ 84%", 84), 9: null, 10: pqB("2 × 3 @ 65% — easy week", 65, 2),
  11: pqB("3 × 3 @ 70% — fast", 70, 3, 3, 1), 12: pqB("3 × 3 @ 70% — fast", 70, 3, 3, 1), 13: pqB("3 × 3 @ 70% — fast", 70, 3, 3, 1), 14: pqB("3 × 3 @ 70% — fast", 70, 3, 3, 1), 15: pqB("2 × 2 @ 80%", 80, 2, 2), 16: null, 17: null, 18: pqB("2 × 3 @ 65% — reload", 65, 2) };
Object.keys(R).forEach((w) => { R[w].eng2 = ENG2[w] === undefined ? null : ENG2[w]; R[w].pq = PQ[w] || null; });
const rxFor = (w) => R[w] || R[1];

/* ---------- timer step builders ---------- */
function steps(kind, o) {
  const S = [], W = (l, s) => S.push({ l, s, t: "w" }), Rs = (l, s) => S.push({ l, s, t: "r" });
  o = o || {};
  if (kind === "sim") { const r = o.rounds || 6, rest = o.rest == null ? 60 : o.rest;
    for (let i = 1; i <= r; i++) { W("RD " + i + " · MIN 1 — SKIERG", 60); W("RD " + i + " · MIN 2 — ASSAULT BIKE", 60); W("RD " + i + " · MIN 3 — " + (i % 2 ? "LANDMINE PUNCHES" : "MED-BALL SLAMS") + (o.max3 ? " · MAXIMAL" : ""), 60); if (i < r && rest > 0) Rs("REST", rest); } }
  else if (kind === "vo2") { for (let i = 1; i <= 4; i++) { W("INTERVAL " + i + " — 90–95% HRMAX", 240); if (i < 4) Rs("EASY", 180); } }
  else if (kind === "lac") { for (let b = 1; b <= 2; b++) { for (let i = 1; i <= 3; i++) { W("BLOCK " + b + " · REP " + i + " — MAX", 40); if (i < 3) Rs("REST", 80); } if (b === 1) Rs("BETWEEN BLOCKS", 300); } }
  else if (kind === "rz") { const r = o.rounds || 5; for (let i = 1; i <= r; i++) { W("ROUND " + i + " — ALL OUT", 30); if (i < r) Rs("FULL RECOVERY", 180); } }
  else if (kind === "z2") { W(o.label || "ZONE 2 — CONVERSATIONAL", (o.min || 30) * 60); }
  else if (kind === "contrast") { const r = o.rounds || 3, items = o.items || ["BACK SQUAT — 2 REPS", "BOX JUMP ×3", "TRAP BAR JUMP ×3"];
    for (let i = 1; i <= r; i++) { items.forEach((it, j) => { W("RD " + i + " · " + it, j === 0 ? 40 : 20); if (j < items.length - 1) Rs("20s", 20); }); if (i < r) Rs("BETWEEN ROUNDS", o.rest || 165); } }
  else if (kind === "vec") { const r = o.rounds || 3, ex = ["SHOT-PUT 4/SIDE", "DIAGONAL 4/SIDE", "HOOK THROW 4/SIDE", "LANDMINE PUNCH 5/SIDE"];
    for (let i = 1; i <= r; i++) { ex.forEach((e, j) => { W("RD " + i + " · " + e, 40); if (j < ex.length - 1) Rs("45s", 45); }); if (i < r) Rs("BETWEEN ROUNDS", 90); } }
  else if (kind === "iso") { for (let s = 1; s <= 3; s++) { for (let i = 1; i <= 3; i++) { W("SET " + s + " · REP " + i + " — MAX INTENT", 3); if (i < 3) Rs("15s", 15); } if (s < 3) Rs("BETWEEN SETS", 120); } }
  else if (kind === "hold") { const r = o.sets || 3; for (let i = 1; i <= r; i++) { W((o.label || "HOLD") + " " + i, o.secs || 20); if (i < r) Rs("REST", o.rest || 30); } }
  else if (kind === "rest") Rs("REST", o.secs || 90);
  return S;
}

/* ---------- protocols (written once, referenced by name) ---------- */
const PROTO = {
  SH: { n: "Warm-up · shoulders", s: "8 min · Mon", c: C.cobalt, note: "The bench ramp is part of the warm-up — rest about a minute between those sets, so the first working set is already warm.",
    i: [["Back on the floor, feet on a bench", "5 breaths — in 4s, out 8s"], ["Band pull-apart", "×20 — arms straight, pull until it touches your chest"], ["Band external rotation", "×15/arm — elbow pinned to the ribs"], ["Wall slide", "×10 — forearms never leave the wall"], ["BENCH RAMP", ""], ["Bar", "×10"], ["40%", "×5"], ["60%", "×3"], ["75%", "×2"]] },
  HIP: { n: "Warm-up · hips + build-ups", s: "12 min · Sat", c: C.cobalt, note: "Never sprint cold. The three build-ups are the sprint warm-up; the squat ramp comes after them.",
    i: [["90/90 switches", "×5 each way"], ["Hip airplane", "×5/side"], ["Cossack squat", "×6/side"], ["Leg swings", "×10 each — forward-back, then side-to-side"], ["Pogo hops", "2 × 20"], ["SPRINT BUILD-UPS", ""], ["20m @ 60%", "×1"], ["20m @ 75%", "×1"], ["20m @ 90%", "×1"], ["SQUAT RAMP", ""], ["40%", "×3"], ["60%", "×2"], ["75%", "×1"]] },
  GEN: { n: "Warm-up", s: "6 min · Tue, Wed, Thu · Sun 10 min", c: C.cobalt, note: "Wednesday adds the trap bar and squat warm-up sets. Sunday adds broad jumps, chest passes, bike sprints and three easy practice throws of each throw.",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"]] },
  CUFF: { n: "Shoulder circuit + band catch", s: "8 min · Mon · 2 rounds, rest 45s", c: C.violet, note: "Every right hand you throw, this muscle group has to brake your arm. This is the only place it gets trained to.",
    i: [["Side-lying external rotation", "12/side — top elbow glued to the ribs"], ["Prone T raise", "×10 — face down on an incline bench, thumbs up"], ["Face pull", "×15 — elbows high, squeeze the back of the shoulders"], ["Wall slide", "×10"], ["BAND DECELERATION CATCH", ""], ["Punch out fast, brake the return", "2 × 8/arm — stop it dead in the last third"]] },
  NECK: { n: "Neck", s: "10 min · Wed and Thu", c: C.violet,
    note: "A stronger, stiffer neck measurably reduces how much your head accelerates when hit. Whether that prevents concussion is not proven. Cheap bet, sound mechanism — and it is not armour: it changes nothing about what you take in sparring.",
    i: [["4-direction holds", "3 × 10s each — palm hard against the forehead and push, the head never moves. Then the back of the head, then each side."], ["Rapid tense", "3 × 6/direction — band resting light pressure on your head, snap from fully relaxed to fully braced in under a second, hold 2s, relax"], ["Perturbation hold", "3 × 20s — band anchored to the rack, brace neutral, tug it in small random pulses from different angles. The head does not move."], ["Catch", "2 × 6/direction — let the band start to pull your head toward the anchor, then stop it dead in the last third"]] },
  HANDS: { n: "Hands", s: "5 min · Tue and Sun", c: C.violet,
    note: "The most common boxing injury is a wrist folding under impact. Five minutes of insurance. Your job covers your grip — no grip work in here.",
    i: [["Knuckle hold", "3 × 20s — push-up position on your fists on a mat, wrist dead straight so forearm and knuckles make one line. Firmer surface over the weeks only if the wrist stays straight."], ["Band wrist extension", "2 × 15 — forearm on your knee, palm down, lift the knuckles toward you"]] },
  CALF: { n: "Seated calf raise", s: "4 min · Tue", c: C.violet,
    note: "It must be seated (knee bent) — that's the muscle that keeps you on your toes in round six; the jumps and sprints already cover the other calf muscle. Moved here from Saturday: a low-cost lift in a low-cost slot.",
    i: [["Seated calf raise", "3 × 15 · rest 60s — up on the balls of the feet, pause, down slow"]] },
  SPLIT: { n: "Split squat, rear foot elevated", s: "8 min · Thu", c: C.violet,
    note: "Moved here from Saturday: 24 hours after the heavy lower morning, 48 before Saturday's sprints, and before the bike so the reps are clean.",
    i: [["Rear-foot-elevated split squat", "3 × 6–8 each leg · rest 75s (easy weeks and weeks 15–16: 2 sets)"], ["Weak side first", "same weight on both legs — the weaker leg sets the load"], ["Loading", "start at a weight you could do 10 with; add when 8 is clean"]] },
  VEC: { n: "The four punch throws", s: "rest 45s between exercises · 90s between rounds", c: C.brass,
    note: "Straight punches are built on forward drive; hooks on rotation. They're different physical problems, so all four get trained. Ball 3–5 kg: if it isn't flying, it's too heavy. Both sides equally.",
    i: [["Rotational shot-put", "4/side — YOUR STRAIGHT RIGHT. Ball at the shoulder, side-on to a wall. Drive off the back hip, flat and hard. A few from a lower crouch for the body shot."], ["Downward diagonal throw", "4/side — YOUR OVERHAND RIGHT. Ball high outside the shoulder, drive it down and across toward the opposite hip. Back foot pivots, trunk turns AND side-bends."], ["Hook throw", "4/side — YOUR LEAD HOOK. Ball at chest height in bent arms, pivot hard off the lead leg and sling it sideways into the wall."], ["Landmine punch", "5/side — YOUR LOADED STRAIGHT. Drive the hips and PUNCH it up and away — never a slow press. Catch it, go again."]] },
  HOME: { n: "The home block", s: "8 min · every evening (Friday 20)", c: C.violet,
    note: "This is the mobility that used to close every gym session. It moved home so the gym time is all training. It does the same job at 8pm that it did at 4am; the only thing that changes is whether you do it. Kit: a foam roller, a light band, and something to hold at your chest — a kettlebell, a dumbbell, a bag of sugar. If you skip it: nothing shows this week. By week 6 the hips tighten, squat depth goes, the sprints get shorter and the pause squat starts to hurt.",
    i: [["THE FOUR MOVES, EVERY EVENING", ""],
      ["Foam roller across the mid-back", "×8 — hands behind head, arch back over it, moving the roller up a notch each time"],
      ["Open book", "6/side · hold 3s — on your side, knees bent, open the top arm to the far side, chest follows, knees stay down"],
      ["90/90 hip switches", "×5 each way — swivel the knees over without using your hands"],
      ["Deep squat hold", "90s — a weight at your chest, sit in the very bottom of a squat"],
      ["FRIDAY EVENING · THE FULL STRETCH · 20 MIN — replaces the four moves", ""],
      ["UPPER BACK FIRST, ALWAYS", ""],
      ["Foam roller arch-backs", "×8"], ["Open book", "×8/side"], ["Thread the needle", "×8/side — on all fours, slide one arm under the other, shoulder toward the floor"], ["Quadruped rotation", "×8/side — hand behind head, rotate the elbow to the ceiling"],
      ["HIPS", ""],
      ["90/90 switches + hold", "×5 each · 30s/side"], ["Couch stretch", "90s/side — back foot up on the sofa, knee on a cushion, squeeze the glute, stand tall"], ["Frog", "90s — knees wide, rock the hips back"], ["Deep squat hold with a weight", "90s"],
      ["SHOULDERS", ""],
      ["Hang from a bar or doorframe", "45s — skip if you haven't one"], ["Wall slides", "×12"], ["Band pull-apart", "×20"], ["Band external rotation", "×15/arm"]] },
};
const HOMELINE = "HOME · tonight: mobility 8 min (Friday: the full stretch, 20 min)";

/* ================================================================
   SESSIONS — the seven pages, in running order, exactly as written.
   item: { n, s, cue, id, k: "wr" (sets) | "out" (one output) | "chk" (tick) | "txt", u, mk, pct, sets, reps, bwp }
   ================================================================ */
const v = (x, rx) => (typeof x === "function" ? x(rx) : x);
const heavy79 = (rx) => rx.w >= 7 && rx.w <= 9;
const friMin = (rx) => (rx.w === 16 ? 30 : rx.z2wed === 20 ? 45 : 55);
const engTimer = (key) => (rx) => { const e = rx[key];
  return e === "vo2" ? { kind: "vo2", title: "VO2MAX" } : e === "lac" ? { kind: "lac", title: "LACTATE" } : e === "rz" ? { kind: "rz", opt: { rounds: 5 }, title: "RED ZONE" }
    : e === "rz3" ? { kind: "rz", opt: { rounds: 3 }, title: "RED ZONE" } : e === "easy" ? { kind: "z2", opt: { min: 20, label: "EASY ZONE 2" }, title: "EASY" } : { kind: "z2", opt: { min: 15, label: "EASY FLUSH" }, title: "EASY" }; };
const engMin = (key) => (rx) => (rx[key] === "easy" || rx[key] === "easy15" ? 20 : 24);

const S = {
  /* ---------------- MONDAY ---------------- */
  mon: { n: "MONDAY", t: "Upper Strength + Power Dose", m: 57, ac: C.oxide, box: 1,
    intro: "Upper strength and the first of the week's three power doses. Nothing is taken to failure.", b: [
    { L: "A", n: "Warm-up", m: 8, p: "SH" },
    { L: "B", n: "Bench Throw (Smith)", m: 11, star: 1, hard: 1, hide: (rx) => !!rx.upperC, rest: "Rest 2:00", rt: 120,
      items: [{ n: "Bench throw", s: (rx) => rx.throw[0] + " × " + rx.throw[1] + " @ ~⅓ of bench max", cue: "On a Smith machine, bar light. Lower to your chest, then press so hard the bar leaves your hands at the top. Catch it, reset, repeat. The right weight is whatever flies highest — adjust until it does.", id: "throw", k: "wr", mk: "bench", pct: [30, 45], sets: (rx) => rx.throw[0], reps: (rx) => rx.throw[1] }],
      w: "Stop the set the instant a throw is visibly lower than the last.",
      why: "This is your punch-speed lift. A normal bench decelerates through its last third to protect the elbows; releasing the bar removes the brake. In weeks 11–14 it merges into the circuit below.",
      note: "No Smith machine? Throw a 4–6 kg medicine ball off your chest at a wall, 5 × 5, as hard as you can.", tr: 2 },
    { L: "C", n: "Power dose — box jumps", m: 5, star: 1, hard: 1, hide: (rx) => !!rx.test, rest: "Rest 60–90s", rt: 75,
      items: [{ n: "Box jump", s: "3 × 3", cue: "A box at knee-to-hip height. Quick dip, jump as high as you can, land soft on top, step down. Three perfect jumps, never three tired ones.", id: "boxjump", k: "chk" }],
      why: "Explosiveness responds to how often the nervous system is asked, not how much. Five minutes, three mornings a week." },
    { L: "D", n: (rx) => (rx.upperC ? "Upper Circuit — Bench + Throws" : "Bench Press"), m: 10, star: (rx) => !!rx.upperC, hard: 1, mainLift: "bench", fb: "bench",
      pres: (rx) => ({ sc: rx.upperC ? "4 rounds · 2 @ 85%" : rx.maxBe ? rx.sets + " × " + rx.reps + " @ " + rx.pct + "%" : (rx.bsc || rx.sc), pct: rx.upperC ? 85 : rx.pct }),
      rest: (rx) => (rx.upperC ? "20s between elements · rest 2:30 between rounds" : heavy79(rx) ? "Rest 2:30" : "Rest 2:00"),
      rt: (rx) => (rx.upperC || heavy79(rx) ? 150 : 120),
      timer: (rx) => (rx.upperC ? { kind: "contrast", opt: { rounds: 4, rest: 150, items: ["BENCH — 2 @ 85%", "BENCH THROW ×3", "CLAP PUSH-UP ×3"] }, title: "UPPER CIRCUIT" } : null),
      items: (rx) => (rx.upperC
        ? [{ n: "Bench", s: "2 @ 85% · 4 rounds", cue: "Heavy wakes the system up.", id: "bench", k: "wr", mk: "bench", pct: 85, sets: 4, reps: 2 }, { n: "Bench throw", s: "×3", cue: "Fast uses it.", id: "uc_throw", k: "chk" }, { n: "Clap push-up", s: "×3", cue: "Overspeed.", id: "uc_plyo", k: "chk" }]
        : [{ n: "Bench press", s: rx.maxBe ? rx.sets + " × " + rx.reps + " @ " + rx.pct + "%" : (rx.bsc || rx.sc), cue: "Pins at chest height, no collars. Controlled down, drive up hard. If a rep grinds, that set is over.", id: "bench", k: "wr", mk: "bench", pct: rx.pct, sets: rx.bsets || rx.sets, reps: rx.reps }]),
      w: "Pins at chest height. No collars, ever. Bench max singles happen on Sunday, fresh, first thing — never here.",
      note: (rx) => (rx.upperC ? "Weeks 11–14: steps 2 and 4 merge into one circuit, 4 rounds — 2 bench reps @ 85% → rest 20s → 3 bench throws → rest 20s → 3 clap push-ups → rest 2½ min."
        : rx.maxBe ? "Max-single week: the bench max is Sunday morning, first thing. Today is the back-off work." : ""),
      why: "Upper-body maximal force, which tracks punch impact in elite amateurs.", tr: 2 },
    { L: "E", n: "Weighted Chin-Up", m: 6, rest: "Rest 90s", rt: 90,
      items: [{ n: "Weighted chin-up", s: "3 × 5", cue: "Wide grip, palms away (switch to a neutral grip if wide ever bothers your shoulders), weight on a belt or a dumbbell between your feet. Dead hang, chin over the bar, lower under control, no swinging. Add weight when all three sets are clean.", id: "chin", k: "wr", sets: 3, reps: 5 }],
      why: "Pulling strength protects the shoulders that throw a thousand punches a week.", tr: 1 },
    { L: "F", n: "Chest-Supported Row", m: 7, rest: "Rest 75s", rt: 75,
      items: (rx) => [{ n: "Chest-supported row", s: (rx.acc <= 2 ? 3 : 4) + " × 8", cue: "Lie chest-down on an incline bench with dumbbells. Row until your elbows pass your body, pause one second at the top, lower slow.", id: "csrow", k: "wr", sets: rx.acc <= 2 ? 3 : 4, reps: 8 }],
      why: "Four sets so your pulling matches your pressing. A boxer's shoulders live or die on that balance.", tr: 1 },
    { L: "G", n: "Shoulder Circuit + Band Catch", m: 8, p: "CUFF",
      items: [{ n: "Circuit + band deceleration catch", s: "2 rounds · then 2 × 8/arm", id: "catch", k: "chk" }],
      why: "Every right hand you throw, this muscle group has to brake your arm. This is the only place it gets trained to." }] },

  /* ---------------- TUESDAY ---------------- */
  tue: { n: "TUESDAY", t: "Jumps · Engine 1 · Hands · Trunk · Calf", m: (rx) => (rx.test ? 32 : rx.eng === "easy" ? 52 : 56), ac: C.cobalt, box: 1,
    intro: "Power dose first, fresh, then the first of the week's two engine sessions. Your legs had yesterday off.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN" },
    { L: "B", n: "Power dose — jumps", m: 8, star: 1, hard: 1, hide: (rx) => !!rx.test, rest: "Rest 90s", rt: 90,
      items: [{ n: "Broad jump", s: "3 × 2", cue: "Two-foot jump forward for distance, stick the landing dead still.", id: "broad", k: "chk" },
        { n: "Trap bar jump", s: (rx) => (rx.cal ? "3 × 3 — empty bar (week 1)" : "3 × 3 @ 20% of trap bar max"), cue: "Stand inside the bar, jump with it, land soft.", id: "tbjump2", k: "chk" }],
      why: "The second of three weekly power doses. Fresh legs, before the bike — never after." },
    { L: "C", n: (rx) => (ENG[rx.eng] ? ENG[rx.eng].n : "Bike session"), m: engMin("eng"), star: 1, hard: 1, eng: 1, hide: (rx) => !rx.eng, timer: engTimer("eng"),
      items: [{ n: "Output", s: "write it down", id: "cond", k: "out", u: "output / peak HR" }],
      note: "Bike or SkiErg — pick one and keep it all 16 weeks so your numbers compare." },
    { L: "D", n: "Hands", m: 5, p: "HANDS", timer: () => ({ kind: "hold", opt: { sets: 3, secs: 20, rest: 30, label: "KNUCKLE HOLD" }, title: "HANDS" }),
      items: [{ n: "Knuckle hold + wrist extension", s: "3 × 20s · 2 × 15", id: "hands", k: "chk" }] },
    { L: "E", n: "Trunk", m: 9, hide: (rx) => !!rx.test, rest: "Rest 45s between exercises", rt: 45,
      items: [{ n: "Pallof press", s: "3 × 10/side · 2s hold", cue: "Band at chest height, anchored beside you. Press your hands straight out and hold two seconds without letting it twist you. Your trunk is what turns leg drive into hand speed, and it has to be stiff to transmit it.", id: "pallof", k: "wr", sets: 3, reps: "10/side" },
        { n: "Ab wheel rollout", s: "3 × 8–12", cue: "Knees down, roll out only as far as your lower back stays flat, pull back.", id: "abwheel", k: "wr", sets: 3, reps: "8–12" },
        { n: "Copenhagen plank", s: "2 × 30s/side", cue: "Side plank with your top foot up on a bench, bottom leg lifted off the floor. Groin strength — the muscles you pivot off.", id: "copen", k: "chk" }] },
    { L: "F", n: "Seated Calf Raise", m: 4, p: "CALF", hide: (rx) => !!rx.test, rest: "Rest 60s", rt: 60,
      items: [{ n: "Seated calf raise", s: "3 × 15", cue: "Seated machine, or a barbell padded across your knees. Up on the balls of the feet, pause, down slow.", id: "soleus", k: "wr", sets: 3, reps: 15 }],
      why: "It must be seated — that's the muscle that keeps you on your toes in round six. The jumps and sprints already cover the other one." }] },

  /* ---------------- WEDNESDAY ---------------- */
  wed: { n: "WEDNESDAY", t: "Sled · Trap Bar · Pause Squat · RDL · Neck", m: (rx) => (rx.pq ? 55 : 45), ac: C.oxide, box: 1,
    intro: "The heavy lower morning. Sled first while the nervous system is freshest, then the pulls, then the second squat exposure. Nothing to failure. The hamstring work that leaves you sore is on Sunday, not here.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN", note: "Then trap bar warm-up sets (bar × 5 · 50% × 3 · 65% × 2) and squat warm-up sets (40% × 3 · 60% × 2)." },
    { L: "B", n: "Heavy Sled Sprints", m: 16, star: 1, hard: 1, rest: "Rest 2:30–3:00", rt: 165,
      items: [{ n: "Heavy sled sprint 20m", s: (rx) => rx.sled + " × 20m @ 40–60% of bodyweight", cue: "Lean into it at about 45°, and sprint 20 metres driving the ground backwards through your whole foot.", id: "sled", k: "out", u: "load (kg) · time (s)", bwp: [40, 60], bwl: "on the sled" }],
      rxLine: (rx) => rx.sled + " × 20m", w: "Get the load right by the clock: each 20m run should take 5–7 seconds. Faster — add weight. Slower — take some off.",
      why: "This is forward pressure — your fighting style with resistance on it. First in the session, before the lifts, while the nervous system is freshest.", tr: 3 },
    { L: "C", n: "Trap Bar Deadlift", m: 12, hard: 1, mainLift: "tbdl", calib: "tbdl", fb: "tbdl",
      rest: (rx) => (heavy79(rx) ? "Rest 2:30" : "Rest 2:00"), rt: (rx) => (heavy79(rx) ? 150 : 120),
      items: [{ n: "Trap bar deadlift", s: (rx) => rx.tb.sc, cue: "Stand inside the bar, grip the handles, flat back, drive the floor away FAST. No grinding, no slow reps — set the bar down and end the set if speed drops.", id: "tbdl", k: "wr", mk: "tbdl", pct: (rx) => rx.tb.pct, sets: (rx) => rx.tb.sets, reps: (rx) => rx.tb.reps }],
      why: "At 3am this is the one heavy lift allowed: nothing passes over your body, and a rep that isn't there gets set down, not fought.", tr: 2 },
    { L: "D", n: (rx) => (rx.pq && rx.pq.fast ? "Speed Squat" : "Pause Squat"), m: 10, hard: 1, mainLift: "squat", pres: (rx) => ({ sc: rx.pq.sc, pct: rx.pq.pct }), hide: (rx) => !rx.pq, rest: "Rest 2:00", rt: 120,
      items: (rx) => [{ n: rx.pq.fast ? "Speed squat" : "Pause squat", s: rx.pq.sc, cue: rx.pq.fast ? "No pause. Every rep as fast as you can move it. Pins set." : "Bar on your back, sit to just below parallel and hold there, dead still, for a full two seconds — then drive up hard. Pins set.", id: "pausesq", k: "wr", mk: "squat", pct: rx.pq.pct, sets: rx.pq.sets, reps: rx.pq.reps }],
      rxLine: (rx) => rx.pq.sc, w: "Pins set. Skipped on max-single weeks (4, 9) and in week 16.",
      why: "The second squat exposure — submaximal, paused, from the position rear-leg drive starts in. Saturday owns the heavy squat; this is at a weight you own.", tr: 2 },
    { L: "E", n: "Romanian Deadlift", m: 6, rest: "Rest 75s", rt: 75, rxLine: () => "3 × 6",
      items: [{ n: "Romanian deadlift", s: "3 × 6", cue: "Bar at your hips, soft knees, push your hips back until the bar reaches mid-shin with a flat back, stand back up by driving the hips through. Start around 60% of your trap bar max and add 2.5–5 kg a week while every rep still moves at the same speed.", id: "rdl", k: "wr", sets: 3, reps: 6 }],
      why: "Hamstring strength without the soreness. The eccentric work that does leave you sore — the Nordics — is last on Sunday." },
    { L: "F", n: "Neck — holds only", m: 5, p: "NECK",
      items: [{ n: "4-direction holds", s: "3 × 10s each direction", id: "neck2", k: "chk" }],
      why: "Second dose of the week, holds only. Thursday carries the full block." }] },

  /* ---------------- THURSDAY ---------------- */
  thu: { n: "THURSDAY", t: "Throws + Landmine · Split Squat · Engine 2 · Neck", m: (rx) => (rx.test ? 16 : rx.eng2 === "easy" ? 52 : 56), ac: C.cobalt, box: 1,
    intro: "The third power dose, the only single-leg lift, the second engine session and the full neck block. (Week 16: warm-up and neck only.)", b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN", note: "Same as Tuesday." },
    { L: "B", n: "Power dose — throws + landmine", m: 8, star: 1, hard: 1, hide: (rx) => !!rx.test, rest: "45s between sets", rt: 45,
      items: [{ n: "Rotational shot-put", s: "2 × 3/side", cue: "Medicine ball, 3–5 kg, at the shoulder, side-on to the wall, drive off the back hip. Flat and hard, like the punch.", id: "shot2", k: "chk" },
        { n: "Landmine punch", s: "2 × 5/side", cue: "One end of a barbell in a corner or landmine sleeve, the other end at your shoulder, in your stance. Drive the hips and punch it up and away — never press it. Bar speed is the metric; add weight only when it still snaps.", id: "lm2", k: "wr", sets: 2, reps: "5/side" }],
      why: "The third weekly power dose: the unloaded ballistic and the loaded punch pattern, three days before Sunday's full session." },
    { L: "C", n: "Split Squat — rear foot elevated", m: 8, p: "SPLIT", hide: (rx) => !!rx.test, rest: "Rest 75s", rt: 75,
      rxLine: (rx) => (rx.acc <= 2 ? 2 : 3) + " × 6–8 each leg",
      items: (rx) => [{ n: "Rear-foot-elevated split squat", s: (rx.acc <= 2 ? 2 : 3) + " × 6–8 each leg", cue: "Back foot up on a bench behind you, front foot far enough forward that your shin stays near vertical, a dumbbell in each hand. Sink straight down until the back knee nearly touches the floor, drive up through the front heel. Weak side first, same weight on both legs.", id: "rfess", k: "wr", sets: rx.acc <= 2 ? 2 : 3, reps: "6–8/leg" }],
      why: "Every other loaded leg lift in the week is on two legs. Boxing isn't — the rear-leg drive and the pivot are one foot, and two-legged lifting lets your strong side hide the weak one. This is where the weak side gets found and fixed.", tr: 1 },
    { L: "D", n: (rx) => (ENG[rx.eng2] ? ENG[rx.eng2].n : "Bike session"), m: engMin("eng2"), star: 1, hard: 1, eng: 1, engKey: "eng2", hide: (rx) => !rx.eng2, timer: engTimer("eng2"),
      items: [{ n: "Output", s: "write it down", id: "cond2", k: "out", u: "output / peak HR" }],
      note: "The same four session types as Tuesday. Thursday always runs a different quality, so each quality is trained twice every three weeks. Same bike, same rules." },
    { L: "E", n: "Neck", m: 10, p: "NECK", items: [{ n: "The full neck block", s: "4 movements", id: "neck", k: "chk" }] }] },

  /* ---------------- FRIDAY ---------------- */
  fri: { n: "FRIDAY", t: "Easy Bike", m: friMin, ac: C.moss, box: 1,
    intro: "Tomorrow is the biggest session of the week. Today's only job is arriving there fresh with the engine fed. Nothing hard, nothing heavy, nothing fast.", b: [
    { L: "A", n: "Easy bike", m: friMin, star: 1, timer: (rx) => ({ kind: "z2", opt: { min: friMin(rx), label: "EASY BIKE" }, title: "EASY BIKE" }),
      items: (rx) => [{ n: "Easy bike", s: friMin(rx) + " min · conversation pace · nasal", cue: "Steady spin at a pace where you could hold a conversation, breathing through your nose. If you can't speak a full sentence, slow down. Roughly 65–75% of the peak heart rate from your 20-minute test. No warm-up needed — ride into it. Fine on an empty stomach. Bike, not running — running beats your legs up before tomorrow.", id: "friz2", k: "out", u: "distance / avg HR" }],
      rxLine: (rx) => friMin(rx) + " min (weeks 6–10: 45 · week 16: 30)",
      why: "Boring on purpose. The aerobic base under two interval sessions and the fight rounds — and it keeps tomorrow's legs fresh by being easy." }] },

  /* ---------------- SATURDAY ---------------- */
  sat: { n: "SATURDAY", t: "★ The Leg & Power Session", m: (rx) => (rx.lowerLead ? 94 : rx.pp && rx.pp.sc ? 90 : 85), ac: C.oxide, free: 1, box: 1,
    intro: "No shift, fed and fresh. This is the session that matters most all week, on the one day nothing can compromise it. Fuel it like the fuel plan's big day: porridge 6:30, shake 7:45, start 8:15.", b: [
    { L: "A", n: "Warm-up", m: 12, p: "HIP", note: "Build-ups included. Never sprint cold." },
    { L: "B", n: "Flying Sprints", m: 14, star: 1, hard: 1, rest: "Rest 2:30–3:00 — full recovery", rt: 165,
      items: [{ n: "Flying sprint 20m", s: (rx) => rx.spr + " × 20m" + (rx.sprPct < 100 ? " @ 90%" : ""), cue: "Jog-build for 10–15m, then 20 metres absolutely flat out. Walk back, full rest — this is a speed session, not cardio. Time them if you can.", id: "sprint", k: "out", u: "best time (s)" }],
      rxLine: (rx) => rx.spr + " × 20m" + (rx.sprPct < 100 ? " @ 90%" : " · flat out"),
      w: "On a yellow day: 3 runs at 90%, never max.",
      why: "Sprinting flat-out is the single most explosive thing you can do, and regular top-speed running is also the best protection your hamstrings can get.",
      note: "Treadmill options, best first: curved self-powered → outdoors → treadmill on an 8–12% incline at 12–15 km/h for 8–10 seconds, safety clip on.", tr: 2 },
    { L: "C", n: (rx) => (rx.jump === "AEL" ? "Loaded Drop Jumps" : "Depth Jumps"), m: 12, hard: 1, rest: "Rest 2:00", rt: 120,
      items: [{ n: (rx) => (rx.jump === "AEL" ? "Loaded drop jump" : "Depth jump"), s: (rx) => rx.js[0] + " × " + rx.js[1] + (rx.jump === "AEL" ? " · hex DBs 8–12 kg each" : " · 30–40 cm box"),
        cue: (rx) => (rx.jump === "AEL" ? "Hold a hex dumbbell in each hand. Dip fast into a quarter squat — at the bottom, let both dumbbells go — and jump straight up as high as you can, empty-handed. Land soft on clear floor, step away from the dumbbells, reset." : "Step off a 30–40 cm box, and the instant your feet touch, jump as high as you can. Shortest possible time on the floor."), id: "jump", k: "out", u: "height / quality" }],
      rxLine: (rx) => rx.js[0] + " × " + rx.js[1], w: "Stop the set the moment a jump is lower than the last.",
      why: (rx) => (rx.jump === "AEL" ? "You cannot eccentrically overload a jump with bodyweight; this does, at lower joint cost than a higher box." : "Weeks 11–14: reactive strength, concentrated before the peak."), tr: 2 },
    { L: "D", n: "Side Bounds", m: 7, rest: "Rest 90s", rt: 90,
      items: [{ n: (rx) => (rx.bound === "stick" ? "Side bound — stick the landing" : "Side bound — continuous"), s: "3 × 4/side",
        cue: (rx) => (rx.bound === "stick" ? "Stand on one leg, jump sideways as far as you can, land on the other leg and stick the landing dead still for 2 seconds." : "Weeks 11–14: no stick — bounce straight back the other way."), id: "latbound", k: "chk" }],
      why: "The sideways push-off is how you cut the ring off. Nothing else in the week trains it.", tr: 2 },
    { L: "E", n: "Back Squat", m: 15, star: 1, hard: 1, mainLift: "squat", maxUI: 1, fb: "squat",
      rest: (rx) => (heavy79(rx) ? "Rest 3:00" : "Rest 2:30"), rt: (rx) => (heavy79(rx) ? 180 : 150),
      items: [{ n: "Back squat", s: (rx) => rx.sc, cue: "Bar on your back, break at the hips and knees together, sit to just below parallel, drive up hard. Every rep fast on the way up; a grinding rep ends the set.", id: "squat", k: "wr", mk: "squat", pct: (rx) => rx.pct, sets: (rx) => rx.sets, reps: (rx) => rx.reps }],
      w: "Pins set — just below your lowest position on every set over 80%.",
      why: "Lower-body maximal strength is the strongest single predictor of punch force in trained boxers.", tr: 3 },
    { L: "F", n: "The Jump Circuit", m: (rx) => (rx.lowerLead ? 22 : 18), star: 1, hard: 1, rt: 165, rest: "20s between elements · rest 2:30–3:00 between rounds",
      timer: (rx) => ({ kind: "contrast", opt: { rounds: rx.cr, rest: 165, items: ["BACK SQUAT — 2 @ " + rx.cpct + "%", "BOX JUMP ×3", "TRAP BAR JUMP ×3"].concat(rx.ph === "b3" ? ["ASSISTED JUMP ×3"] : []) }, title: "JUMP CIRCUIT" }),
      items: (rx) => [{ n: "Back squat", s: "2 @ " + rx.cpct + "%", cue: "Wakes the nervous system up.", id: "csq", k: "wr", mk: "squat", pct: rx.cpct, sets: rx.cr, reps: 2 },
        { n: "Box jump", s: "×3", cue: "Knee-to-hip-height box, land soft, step down.", id: "cbox", k: "chk" },
        { n: "Trap bar jump", s: rx.cal ? "×3 — empty bar (week 1)" : "3 @ 20% of trap bar max", cue: "Stand inside the bar, jump with it, land soft.", id: "ctbj", k: "wr", mk: rx.cal ? null : "tbdl", pct: 20, sets: rx.cr, reps: 3 }]
        .concat(rx.ph === "b3" ? [{ n: "Band-assisted jump", s: "×3", cue: "Loop a heavy band over the top of the rack, tuck it under your armpits so it pulls you upward, and jump — it makes you faster than you are.", id: "cassist", k: "chk" }] : []),
      rxLine: (rx) => rx.cr + " round" + (rx.cr > 1 ? "s" : "") + " · squat 2 @ " + rx.cpct + "%",
      w: "End the round the moment jump height drops.",
      why: "If round 2 jumps as high as round 1, the rest can be a bit shorter; if it doesn't, it was too short.",
      note: (rx) => (rx.lowerLead ? "Weeks 11–14: this circuit moves to the FRONT — before the squat, while you're freshest." : ""), tr: 2 },
    { L: "G", n: "Push Press", m: 10, hard: 1, mainLift: "pp", calib: "pp", fb: "pp", hide: (rx) => !rx.pp || !rx.pp.sc, rest: "Rest 2:00", rt: 120,
      items: (rx) => [{ n: "Push press", s: rx.pp.sc, cue: "Bar on the front of your shoulders. Quick shallow knee dip, then drive the bar overhead with your LEGS and punch it to lockout. Down under control.", id: "pushpress", k: "wr", mk: "pp", pct: rx.pp.pct, sets: rx.pp.sets, reps: rx.pp.reps }],
      why: "Legs → braced trunk → hands. The same route a punch takes, and the heaviest thing your shoulders and traps see all week — which is why the traps and shoulders don't need a size block.",
      note: "Weeks 4 and 9: skipped. The squat max is enough maximal work for one day." }] },

  /* ---------------- SUNDAY ---------------- */
  sun: { n: "SUNDAY", t: "★ Punch Throws · Fight Rounds · Core · Nordics", m: (rx) => (rx.test ? 40 : rx.maxBe ? 82 : rx.sim.skip ? 46 : 70), ac: C.brass, free: 1, box: 1,
    intro: "Second free morning. Punches, rounds, core and hands, and the week's hamstring work last, with two leg-free days behind it. No pressing today on purpose so Monday's bench gets 42 hours. (Week 16: the warm-up, the 20-minute test and the weekly check. Nothing else.)", b: [
    { L: "A", n: "Warm-up", m: 10, p: "GEN", note: "Plus: broad jumps 3 × 2 · med-ball chest passes 3 × 3 as hard as you can · 3 × 10-second bike sprints with a minute between · then three EASY practice throws of each of the four throws." },
    { L: "B", n: "Bench Max Single", m: 12, star: 1, hard: 1, hide: (rx) => !rx.maxBe, mainLift: "bench", maxUI: 1, rest: "Rest 2:30–3:00", rt: 165,
      items: [{ n: "Bench — max single", s: "pins · no collars · first, straight after the warm-up", id: "benchmax", k: "chk" }],
      why: "Weeks 4 and 9 only, and it happens here — Sunday, first thing, fresh, with pins. Bench warm-up sets (bar × 10, 40% × 5, 60% × 3) before the ramp. Write the new max down.", tr: 2 },
    { L: "C", n: "The Four Punch Throws", m: 16, star: 1, p: "VEC", hide: (rx) => !!rx.test, rest: "45s between exercises · 90s between rounds", rt: 45,
      timer: (rx) => ({ kind: "vec", opt: { rounds: rx.vec }, title: "PUNCH THROWS" }),
      items: [{ n: "Med-ball rotational shot-put", s: "4/side — your straight right", cue: "Ball at your shoulder, boxing stance side-on to a wall. Drive off the back hip and put the ball into the wall as hard as you can, flat and hard like a punch. A few from a lower crouch for the body-shot version.", id: "mbshot", k: "out", u: "best distance (m)" },
        { n: "Med-ball downward diagonal", s: "4/side — your overhand right", cue: "Ball high outside your shoulder. Drive it down and across your body, letting go toward the opposite hip. Back foot pivots, trunk turns AND side-bends, exactly like the punch.", id: "mbdiag", k: "out", u: "best distance (m)" },
        { n: "Med-ball hook throw", s: "4/side — your lead hook", cue: "Ball held at chest height in bent arms. Pivot hard off the lead leg and sling it sideways into the wall.", id: "mbhook", k: "chk" },
        { n: "Landmine punch", s: "5/side — your loaded straight", cue: "Bar end at your shoulder, in your stance. Drive the hips and PUNCH it up and away — never a slow press. Catch it, go again.", id: "lmpunch", k: "wr", sets: (rx) => rx.vec, reps: "5/side" }],
      rxLine: (rx) => rx.vec + " rounds",
      why: "Straight punches are built on forward drive; hooks on rotation. They're different physical problems, so all four get trained. Medicine ball 3–5 kg — if it isn't flying, it's too heavy.", tr: 2 },
    { L: "D", n: "Fight Simulation", m: 24, star: 1, sim: 1, hard: 1, hide: (rx) => !!rx.sim.skip || rx.w === 1 || !!rx.test,
      timer: (rx) => ({ kind: "sim", opt: { rounds: rx.sim.rounds || 6, rest: rx.sim.rest, max3: rx.sim.max3 }, title: "FIGHT SIM" }),
      items: [{ n: "Minute 1", s: "SkiErg", k: "txt" }, { n: "Minute 2", s: "Assault bike", k: "txt" }, { n: "Minute 3", s: "Landmine punches (odd rounds) or med-ball slams (even). Bag work if your gym has one — hard and technically clean.", k: "txt" },
        { n: "Round 1 output", s: "scored weeks 4, 9 and 14", id: "fs_rd1", k: "out", u: "SkiErg m / bike cal" }, { n: "Round 6 output", s: "round 6 ÷ round 1 is your fade", id: "fs_rd6", k: "out", u: "SkiErg m / bike cal" }],
      rxLine: (rx) => (rx.sim.rounds || 6) + " × 3 min · rest " + rx.sim.rest + "s" + (rx.sim.tested ? " · SCORED" : rx.sim.max3 ? " · minute 3 flat out" : ""),
      rules: ["Relaxed jaw, shoulders down. Finish a round with your traps by your ears and that round doesn't count, whatever the number says.", "Nose-breathe through rounds 1–3 as a pacing tool, not a test. Mouth open whenever you need it; the round still counts."],
      why: "Three-minute rounds, never enough rest, holding output across six — nothing else you own trains the actual shape of a fight. The whole game is getting the fade toward 100%.", tr: 3 },
    { L: "E", n: "20-Minute Bike Test", m: 25, star: 1, hard: 1, hide: (rx) => !(rx.w === 1 || rx.w === 16), timer: () => ({ kind: "z2", opt: { min: 20, label: "20-MIN TEST" }, title: "20-MIN TEST" }),
      items: [{ n: "20 minutes, maximum distance", s: "same bike or SkiErg every time", cue: "5 easy minutes, then 20 minutes for the most distance you can. No pacing plan — go and find out. Write down two numbers: the distance, and the highest heart rate you saw. That peak is your practical maximum; from now on every easy ride sits around 65–75% of it.", id: "bike20", k: "out", u: "distance (m)" },
        { n: "Peak heart rate", s: "highest you saw", id: "bike20hr", k: "out", u: "bpm" }],
      rxLine: () => "20 min max distance — the engine test",
      why: "Replaces the fight rounds in weeks 1 and 16. Week 1 is the baseline; week 16 is the verdict.", tr: 2 },
    { L: "F", n: "Core + Hands", m: 8, hide: (rx) => !!rx.test, rest: "Rest 60s", rt: 60,
      items: [{ n: "Hanging leg raise", s: "3 × 8–12", cue: "Hang from a bar, dumbbell between your feet if needed, lift the legs to hip height or above, no swinging.", id: "hlr", k: "wr", sets: 3, reps: "8–12" },
        { n: "Side plank reach-through", s: "2 × 10/side", cue: "In a side plank, thread your top arm under your body, then rotate open to the ceiling.", id: "sprt", k: "chk" },
        { n: "Hands", s: "knuckle hold 3 × 20s · band wrist extension 2 × 15", cue: "As Tuesday.", id: "hands2", k: "chk" }] },
    { L: "G", n: "Nordic Curls", m: 8, hide: (rx) => !rx.nor || !!rx.test, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => rx.nor[0] + " × " + rx.nor[1] + " — ramped",
      items: [{ n: "Nordic curl", s: (rx) => rx.nor[0] + " × " + rx.nor[1] + " — ramped", cue: "Kneel with your heels anchored under something solid. Keeping your body straight from knees to head, lower yourself forward as SLOWLY as you can, catch yourself with your hands, push back up. Stop the set the moment your lower back rounds — not at the rep count.", id: "nordic", k: "wr", sets: (rx) => rx.nor[0], reps: (rx) => rx.nor[1] }],
      why: "Last block of the last day, on purpose: the hardest hamstring work of the week, followed by two leg-free days, so the soreness is gone before it can cost you a sprint." },
    { L: "H", n: "Weekly Check", m: 2, review: 1,
      items: [{ n: "Bodyweight", s: "kg", id: "wr_bw", k: "out", u: "kg" }, { n: "Resting heart rate", s: "bpm", id: "wr_rhr", k: "out", u: "bpm" }, { n: "HRV average", s: "if you measure it", id: "wr_hrv", k: "out", u: "ms" },
        { n: "Hips", s: "0–10", id: "wr_hip", k: "out", u: "0–10" }, { n: "Shoulders", s: "0–10", id: "wr_sh", k: "out", u: "0–10" }, { n: "Wrists", s: "0–10", id: "wr_wr", k: "out", u: "0–10" },
        { n: "Boxing nights your hands felt slow", s: "count", id: "wr_slow", k: "out", u: "nights" }, { n: "Energy", s: "1–10", id: "wr_en", k: "out", u: "1–10" },
        { n: "Home evenings done", s: "0–7", id: "wr_home", k: "out", u: "0–7" }],
      note: "Two slow-hands nights, or three yellows in one week = next week is an easy week, whatever the plan says. Every 4–6 weeks: tape — arms, shoulders, waist." }] },

  /* ---------------- THE LIGHT SESSION ---------------- */
  light: { n: "LIGHT SESSION", t: "After head contact", m: 30, ac: C.violet,
    intro: "The morning after any sparring: Tuesday's warm-up, Thursday's neck block, Monday's shoulder circuit — about 30 minutes, or nothing. No heavy lifting, no sprinting, no jumping for 24 hours after head contact. Any headache, fogginess or light sensitivity: do nothing, and tell your coach.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN" },
    { L: "B", n: "Neck", m: 10, p: "NECK", items: [{ n: "The full neck block", s: "4 movements", id: "neck", k: "chk" }] },
    { L: "C", n: "Shoulder Circuit + Band Catch", m: 8, p: "CUFF", items: [{ n: "Circuit + band deceleration catch", s: "2 rounds · then 2 × 8/arm", id: "catch", k: "chk" }] }] },
};

/* blocks visible for a day in a given week, in the order they are performed */
function blocksFor(day, rx) {
  const sess = S[day]; if (!sess) return [];
  let b = sess.b.filter((x) => x.sp || !(x.hide && x.hide(rx)));
  if (day === "sat" && rx.lowerLead) { const e = b.findIndex((x) => x.L === "E"), f = b.findIndex((x) => x.L === "F"); if (e >= 0 && f >= 0 && e < f) { const arr = b.slice(); const tmp = arr[e]; arr[e] = arr[f]; arr[f] = tmp; b = arr; } }
  return b;
}
const realBlocks = (day, rx) => blocksFor(day, rx).filter((x) => x.L);

const MAXES = [["squat", "Back Squat"], ["bench", "Flat Bench"], ["tbdl", "Trap Bar Deadlift"], ["pp", "Push Press"]];
const TESTS = [
  { id: "sprint", n: "Flying sprint 20m", u: "s", dir: "down", d: "3 attempts, best time", tgt: "−1–3%" },
  { id: "jump", n: "Depth jump rebound", u: "cm", dir: "up", d: "3 attempts, best height — phone slow-motion or jump mat", tgt: "+3–5%" },
  { id: "mbdiag", n: "Diagonal throw (overhand)", u: "m", dir: "up", d: "3/side, best distance", tgt: "+3–5%" },
  { id: "mbshot", n: "Shot-put (straight)", u: "m", dir: "up", d: "3/side, best distance", tgt: "+3–5%" },
  { id: "squat", n: "Back squat — max single", u: "kg", dir: "up", d: "pins", max: "squat", tgt: "+3–6%" },
  { id: "bench", n: "Flat bench — max single", u: "kg", dir: "up", d: "pins, no collars", max: "bench", tgt: "+3–6%" },
  { id: "imtp", n: "Mid-thigh pull peak force", u: "N", dir: "up", d: "only if your gym has a force plate — otherwise leave blank", tgt: "+3–6%", opt: 1 },
  { id: "tb3rm", n: "Trap bar 3RM", u: "kg", dir: "up", d: "hard triple × 1.08 sets the trap bar max", max: "tbdl", est: 1.08, tgt: "+3–6%" },
  { id: "bike20", n: "20-min bike test (distance)", u: "m", dir: "up", d: "Sunday of week 1 and week 16", tgt: "+3–5%", sun: 1 },
];

/* ---------- reference (PLAN tab) ---------- */
const PLAN = [
  ["THE PREMISE", C.brass, [
    ["The fighter's build. Weekdays at 3am, under an hour. Saturday 90 minutes. Sunday 70. Mobility at home. Nothing in the gym that doesn't make you a better fighter.", 1],
    ["Your coach owns boxing. This owns everything else: maximal strength, punching power, speed, the engine, and the tissue that keeps you training. Boxing runs separately.", 0],
    ["Power is dosed three mornings a week — Monday box jumps, Tuesday jumps, Thursday throws — because explosiveness responds to how often the nervous system is asked, not how much.", 1],
    ["The engine is built twice, the squat gets a second exposure, the trunk is braced, the landmine appears twice.", 0],
    ["About 7¼ hours in the gym at peak, an hour and a quarter at home. Easy weeks: about 5½ in the gym.", 0],
    ["Every barbell weight is a percentage of a number you have measured. You already know squat and bench; trap bar (Wednesday) and push press (Saturday) are found in week 1 — hard triple × 1.08 = your max. Round to the nearest 2.5 kg.", 1],
    ["Every explosive set ends the moment the output drops — jump height, throw distance, bar speed. Rep counts are ceilings, not targets.", 1],
  ]],
  ["THE WEEK", C.moss, [
    ["MONDAY · 3am · upper strength + box-jump power dose — warm-up, bench throws, box jumps, bench, chins, rows, shoulder circuit + band catch. ~57 min.", 1],
    ["TUESDAY · 3am · jumps, engine session 1, hands, trunk, seated calf raise. ~56 min.", 1],
    ["WEDNESDAY · 3am · sled, trap bar, pause squat, RDL, neck holds. The heavy lower morning. ~55 min.", 1],
    ["THURSDAY · 3am · throws + landmine, split squat, engine session 2, the full neck block. ~56 min.", 1],
    ["FRIDAY · 3am · the easy bike, and nothing else. 55 min (weeks 6–10: 45 · week 16: 30).", 1],
    ["SATURDAY · morning · THE LEG & POWER SESSION — warm-up, flying sprints, loaded drop jumps, side bounds, back squat, jump circuit, push press. ~90 min.", 1],
    ["SUNDAY · morning · the four punch throws, the fight simulation, core + hands, Nordics, the weekly check. ~70 min.", 1],
    ["EVERY EVENING · at home · mobility 8 min. Friday: the full stretch, 20 min.", 1],
    ["Each session page is a running order — start at the top, work down, done. Everything you need to run it is on the page.", 0],
  ]],
  ["WHAT LEFT, AND WHY", C.oxide, [
    ["The size blocks — lateral raises, rear-delt flies, shrugs, pulldowns, dips, curls — were 42 minutes a week that built the look, not the fighter. They're gone.", 1],
    ["The bench, push press, weighted chins, rows, trap bar and throws carry the shoulders, traps and arms from here. Cost to the fighter: nothing. Cost to the look: some direct arm and shoulder volume — the tape will tell you, not the mirror.", 0],
    ["Mobility moved to the evening at home. It does the same job at 8pm that it did at 4am, and the eight minutes it freed are what keep four weekday sessions under an hour.", 1],
    ["The split squat left Saturday for Thursday: 24 hours after the heavy lower morning, 48 before Saturday's sprints, and before the bike so the reps stay clean. The seated calf raise left Saturday for the end of Tuesday.", 0],
    ["The warm-ups did not move. They are what makes sprinting, jumping and lifting at 3am survivable, and they are not mobility.", 0],
    ["Nothing else went: every sprint, jump, throw, lift, round and durability drill is still here, at the same numbers.", 1],
  ]],
  ["THE FAST-BAR RULE", C.brass, [
    ["On the four main lifts — squat, bench, trap bar, push press — after your last work set, ask one question: did the last rep move as fast as the first? The app asks it for you.", 1],
    ["Yes → raise that lift's max by 2.5% for next week. Squat and trap bar round to the nearest 5 kg; bench and push press to 2.5 kg. Once per lift per week, no more.", 1],
    ["A percentage of a number measured weeks ago goes stale fast when you're getting stronger quickly. The grind rule can only ever take weight off; this is the other half. It keeps the loading honest between measurements.", 0],
    ["The grind rule still runs the other way: a grinding rep ends the set, and two grinding sets on one lift in a week means take 2.5% back off.", 1],
    ["Max-single weeks and test day replace the number outright, not by 2.5%.", 1],
    ["If a lift hits the fast-bar rule three weeks running, expect the week-4 or week-9 max to come in well above 102% — take the second attempt.", 0],
  ]],
  ["RESTS", C.cobalt, [
    ["Main lifts — 2 minutes. 2½ on the heavy triples in weeks 7–9 and on max days. Saturday's back squat sits at 2½, and 3 in weeks 7–9.", 1],
    ["Accessories — 75–90 seconds: chins 90s, rows 75s, RDL 75s, split squat 75s.", 1],
    ["Speed, jumps, sprints and throws keep their full rests. Those are trained by quality, and a short rest turns them into conditioning.", 1],
    ["If a strength set feels flat after 2 minutes, take 2½. The number on the page is the default, not a stopwatch you fail.", 0],
    ["Recovery is not the limit in this build; time is.", 0],
  ]],
  ["THE DAILY CHECK — BEFORE EVERY SESSION", C.moss, [
    ["Ask four things: is my resting heart rate up? Do I feel unusually sore? Flat and unmotivated? Sleep quality worse than normal for me?", 1],
    ["0–1 yes = GREEN. Train as written.", 1],
    ["2–3 yes = YELLOW. Take 7% off every barbell weight. Sprints become 3 runs at 90% effort, never flat out. Skip the last section of the session.", 1],
    ["Ill, injured, or 3 yellow days in a row = RED. No heavy lifts, no sprints, no jumps. Warm-up, neck and shoulder work, then home. Mobility at home as normal.", 1],
    ["Two slow-hands nights at boxing, or three yellows in one week = next week is an easy week, whatever the plan says.", 0],
  ]],
  ["THE HEAD-CONTACT RULE", C.oxide, [
    ["The morning after any sparring you do the LIGHT SESSION — Tuesday's warm-up, Thursday's neck block, Monday's shoulder circuit, about 30 minutes — or nothing.", 1],
    ["No heavy lifting, no sprinting, no jumping for 24 hours after head contact. The app swaps it in with one tap.", 1],
    ["Any headache, fogginess or light sensitivity: do nothing, and tell your coach.", 1],
    ["Sparred the night before Wednesday? The heavy lower morning becomes the light session and the heavy work waits a week.", 0],
  ]],
  ["TRAINING ALONE — NON-NEGOTIABLE", C.oxide, [
    ["SQUAT — safety pins in the rack, set just below your lowest position, on every set over 80%. No pins in the gym = no max singles; stop at a heavy 3.", 1],
    ["BENCH — pins at chest height, and never clamp collars on the bar; if you get stuck you tip the plates off. Bench max singles only happen on Sundays, fresh, first thing.", 1],
    ["TRAP BAR at 3am — the one heavy lift allowed at that hour. Nothing passes over your body, and a rep you're not sure of gets set down, not fought.", 1],
    ["NORDICS — heels anchored under something solid. Stop the set the moment your lower back rounds.", 0],
    ["DROP JUMPS — rubber hex dumbbells, dropped straight down, land on clear floor.", 0],
    ["If you are not certain you'll make the rep, you don't start it.", 1],
  ]],
  ["THE MACROCYCLE", C.cobalt, [
    ["Weeks 1–5 BUILD · squat and bench 4×6 @ 75% → 4×5 @ 78% → 4×5 @ 80% → max single then 2×3 @ 85% → easy week 2×5 @ 65%. Jump circuit 2 rounds, punch throws 3, rows 4 sets.", 1],
    ["Weeks 6–10 FORCE · 4×4 @ 82% → 4×3 @ 85% → 4×3 @ 87% → max single then 2×2 @ 88% → easy week 2×4 @ 65%. Jump circuit 3 rounds, accessories 3 sets, rests 2½ on the triples.", 1],
    ["Weeks 11–14 VELOCITY · squat 2×2 @ 88% done fast, behind a 4-round jump circuit that now leads Saturday. Depth jumps, continuous side bounds, speed squat on Wednesday, bench and bench throws merged into one circuit on Monday, punch throws 4 rounds.", 1],
    ["Weeks 15–16 TAPER · volume down, intensity held. Saturday of week 16 is test day; Sunday is the 20-minute bike test.", 1],
    ["Weeks 5 and 10 are easy weeks. Sled runs 5 a week (week 1: 4 · easy weeks 3). Sprints build 3 → 4 → 5 across the first three weeks of a block; Nordics ramp 2×3 → 2×4 → 3×4 → 3×5 across the first month.", 0],
    ["Max singles: weeks 4 and 9 and test day. The squat max is Saturday; the bench max is Sunday morning, first thing, and the push press is skipped that Saturday.", 1],
  ]],
  ["THE ENGINE", C.cobalt, [
    ["Two engine sessions a week — Tuesday and Thursday — and they always run different qualities, so each is trained twice every three weeks.", 1],
    ["4-MINUTE INTERVALS · 4 rounds of 4 minutes hard (you could speak 2–3 words) with 3 easy minutes between. The single best session there is for building your engine.", 0],
    ["40-SECOND REPEATS · 40 seconds flat out, 80 easy. Three, then 5 full minutes, then three more. The last three are horrible — that burning is what the late rounds of a fight feel like.", 0],
    ["30-SECOND ALL-OUTS · 30 seconds at absolute maximum, then 3 FULL minutes of rest, 5 rounds. Cutting the rest short turns it into a different, wrong session.", 0],
    ["Bike or SkiErg — pick one and keep it all 16 weeks so your numbers compare. Write down your output.", 1],
    ["YOUR ENGINE NUMBER · Sunday of week 1 and Sunday of week 16 replace the fight rounds with a 20-minute bike test. It gives you the only measurement of the engine this program builds, and your peak heart rate — the number every easy ride is paced off, at 65–75%.", 1],
    ["THE FIGHT SIM · six 3-minute rounds, minute 1 SkiErg, minute 2 assault bike, minute 3 landmine punches or slams (bag if the gym has one). Round 6 ÷ round 1 is your fade — scored in weeks 4, 9 and 14. The whole game is getting it toward 100%.", 0],
  ]],
  ["THE HOME BLOCK", C.violet, [
    ["Eight minutes, every evening: foam roller across the mid-back ×8 · open book 6/side · 90/90 hip switches ×5 each way · deep squat hold 90s.", 1],
    ["Friday evening instead: the full stretch, 20 minutes — upper back first, then hips, then shoulders.", 1],
    ["Kit: a foam roller, a light band, and something to hold at your chest.", 0],
    ["If you skip it, nothing shows this week. By week 6 the hips tighten, squat depth goes, the sprints get shorter and the pause squat starts to hurt. The weekly check asks how many evenings you did it, so you'll see it coming.", 0],
  ]],
  ["TEST DAY — SATURDAY OF WEEK 16", C.cobalt, [
    ["Fresh after two easy weeks. Most explosive first, full recovery between everything.", 1],
    ["1 Flying 20m sprint, 3 attempts · 2 Depth jump, best rebound (height in cm ≈ 123 × flight time²) · 3 Diagonal throw · 4 Shot-put · 5 Back squat max single, pins · 6 Bench max single, pins, no collars · 7 Trap bar heavy 3RM × 1.08 · 8 Tape and bodyweight · 9 Sunday: the 20-minute bike test.", 0],
    ["Targets each 16 weeks: lifts +3–6% · throws and jump +3–5% · sprint 1–3% faster · 20-minute distance +3–5% · fight-sim fade 1–3 points better.", 1],
    ["If the fast-bar rule fired most weeks, the lifts will beat that range — the targets are floors, not ceilings. Then 3–4 easy days, and week 1 starts again off the new numbers.", 0],
  ]],
  ["FUEL", C.violet, [
    ["The fuel plan does not change. The 3:10 shake before every hard morning, Monday to Thursday.", 1],
    ["Friday's ride is fasted, and Friday's 5pm carb feed loads Saturday; Tuesday's 5pm feed loads Wednesday's trap bar.", 0],
    ["Saturday and Sunday eat like the fuel plan's big day: porridge 6:30, shake 7:45, session 8:15, the big feed within the hour after you finish.", 0],
    ["Total training time is about an hour and three-quarters a week lower than the Singles version. Do not cut calories on that assumption — the tape decides.", 1],
    ["Creatine 5 g every day. Omega-3 daily. Vitamin D through the winter.", 0],
  ]],
  ["WHAT YOUR COACH OWNS", C.brass, [
    ["Hitting hard on contact — the split-second stiffening of fist, arm and trunk at impact that makes two men with the same squat punch differently. Built on the bag.", 1],
    ["Snap and retraction — pads, where the feedback is instant.", 0],
    ["Keeping your guard up when gassed — it only shows up when someone's trying to hit you.", 0],
  ]],
  ["THE THINKING", C.cobalt, [
    ["What this version is: Optimal 8 Singles with the aesthetics taken out, the mobility taken home, the weekday sessions capped under an hour, the weekend sessions cut to what the fighter needs, shorter strength rests, and one new rule.", 1],
    ["Why the rests are shorter: two minutes between strength sets is enough for triples and fives at these percentages, and 75–90 seconds is enough for rows and split squats. Speed, jumps, sprints and throws keep every second, because the moment those get tired they stop training what they're for.", 0],
    ["Placement, unchanged: the two sessions that decide this program sit on the weekend, fed and fresh. Wednesday is the heavy lower morning, 72 hours from Saturday. Friday is easy so Saturday isn't. The Nordics go last on Sunday with two leg-free days behind them.", 0],
    ["Saturday is 90 minutes now, not 120, and gives up nothing the fighter uses: sprints, reactive jumps, side bounds, heavy squat, the full jump circuit and the push press are all there, all fresh, in the same order.", 1],
    ["The evidence: leg strength drives punch force (Loturco 2016; Dunn 2022). Throw speed drives punch speed. The engine is mostly aerobic with brutal spikes — easy volume, 4-minute intervals (Helgerud 2007), 40-second repeats for the late-round burn, the fight sim for the shape of a fight. Durability is cheap and targeted: neck, hands, Nordics, Copenhagen planks, cuff work.", 0],
    ["Stop the set when it slows. Speed of movement is the quality being trained; grinding reps train grinding.", 1],
  ]],
];

/* ================================================================
   ATOMS
   ================================================================ */
const Card = ({ children, s, ac }) => <div style={Object.assign({ background: C.card, border: "1px solid " + C.line, borderLeft: ac ? "3px solid " + ac : "1px solid " + C.line, borderRadius: 6, marginBottom: 10, padding: 14 }, s)}>{children}</div>;
const Eye = ({ children, c, s }) => <div style={Object.assign({}, mno, { fontSize: 9.5, letterSpacing: 1.6, color: c || C.ash, marginBottom: 8, textTransform: "uppercase" }, s)}>{children}</div>;
const Lab = ({ children }) => <div style={Object.assign({}, mno, { fontSize: 8, color: C.ash, marginBottom: 3, letterSpacing: 1, textTransform: "uppercase" })}>{children}</div>;
const Fld = ({ v, on, ph, a, type, s }) => <input value={v == null ? "" : v} onChange={(e) => on(e.target.value)} placeholder={ph} inputMode={type === "text" ? "text" : "decimal"} type={type === "date" ? "date" : "text"}
  style={Object.assign({}, mno, { width: "100%", background: C.ink, border: "1px solid " + C.line, borderRadius: 4, color: C.chalk, fontSize: 15, padding: "9px 8px", textAlign: a || "center", minHeight: 40 }, s)} />;
const Btn = ({ children, on, c, fill, s, dis, small }) => <button onClick={on} disabled={dis} style={Object.assign({}, dsp, { fontSize: small ? 12 : 14, fontWeight: 700, letterSpacing: 1.2, background: fill ? (c || C.brass) : "transparent", color: fill ? C.ink : (c || C.brass), border: "1px solid " + (c || C.brass), borderRadius: 5, padding: small ? "8px 10px" : "12px 14px", cursor: dis ? "default" : "pointer", opacity: dis ? .4 : 1, minHeight: small ? 34 : 44 }, s)}>{children}</button>;
const Chip = ({ children, c, s }) => <span style={Object.assign({}, mno, { fontSize: 8.5, letterSpacing: 1.2, color: c || C.ash, border: "1px solid " + (c || C.line), borderRadius: 3, padding: "2px 6px", textTransform: "uppercase", whiteSpace: "nowrap" }, s)}>{children}</span>;
const Note = ({ children, c, bold, s }) => <div style={Object.assign({}, bdy, { fontSize: 12.5, color: c || C.ash, lineHeight: 1.5, marginTop: 8, fontWeight: bold ? 600 : 400 }, s)}>{children}</div>;
const Seg = ({ opts, val, on, c }) => (
  <div style={{ display: "flex", gap: 5 }}>
    {opts.map((o) => <button key={o[0]} onClick={() => on(o[0])} style={Object.assign({}, dsp, { flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: .8, padding: "9px 4px", borderRadius: 4, cursor: "pointer", minHeight: 38,
      background: val === o[0] ? (o[2] || c || C.brass) : "transparent", color: val === o[0] ? C.ink : C.ash, border: "1px solid " + (val === o[0] ? (o[2] || c || C.brass) : C.line) })}>{o[1]}</button>)}
  </div>);

/* ================================================================
   TIMER — one engine, docked at the bottom, expands to a round clock
   ================================================================ */
function useTimer(sound) {
  const [t, setT] = useState(null);
  const [open, setOpen] = useState(false);
  const tRef = useRef(null), endRef = useRef(0), beepRef = useRef(""), ctxRef = useRef(null), lockRef = useRef(null);
  useEffect(() => { tRef.current = t; }, [t]);
  const beep = useCallback((f, ms, vol) => { if (!sound) return; try {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current; if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime; g.gain.setValueAtTime(vol || 0.3, now); g.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000); o.start(now); o.stop(now + ms / 1000 + 0.03);
  } catch (e) {} }, [sound]);
  const bell = useCallback((kind) => { if (kind === "w") { beep(660, 180); setTimeout(() => beep(990, 320), 130); buzz([120, 60, 120]); } else if (kind === "r") { beep(440, 320); buzz(200); } else { beep(523, 180); setTimeout(() => beep(659, 180), 160); setTimeout(() => beep(784, 420), 320); buzz([150, 80, 150, 80, 320]); } }, [beep]);
  const lock = useCallback(async (on) => { try { if (on) { if (!lockRef.current && navigator.wakeLock) lockRef.current = await navigator.wakeLock.request("screen"); } else if (lockRef.current) { await lockRef.current.release(); lockRef.current = null; } } catch (e) {} }, []);
  useEffect(() => {
    if (!t || !t.run) { lock(false); return; }
    lock(true);
    const id = setInterval(() => {
      const cur = tRef.current; if (!cur || !cur.run) return;
      const rem = Math.ceil((endRef.current - Date.now()) / 1000);
      if (rem > 0 && rem <= 3 && beepRef.current !== cur.i + ":" + rem) { beepRef.current = cur.i + ":" + rem; beep(880, 80, .2); buzz(35); }
      if (rem <= 0) {
        const n = cur.i + 1;
        if (n < cur.steps.length) { endRef.current = Date.now() + cur.steps[n].s * 1000; bell(cur.steps[n].t); setT(Object.assign({}, cur, { i: n, left: cur.steps[n].s })); }
        else { bell("done"); setT(Object.assign({}, cur, { i: n, left: 0, run: false, done: true })); }
      } else if (rem !== cur.left) setT(Object.assign({}, cur, { left: rem }));
    }, 200);
    return () => clearInterval(id);
  }, [t && t.run, t && t.i, t && t.steps]);
  const start = useCallback((preset) => { const st = steps(preset.kind, preset.opt); if (!st.length) return; endRef.current = Date.now() + st[0].s * 1000; beepRef.current = "";
    setT({ steps: st, i: 0, left: st[0].s, run: true, title: preset.title || "TIMER", kind: preset.kind, done: false }); if (preset.kind !== "rest") setOpen(true); beep(880, 60, .15); }, [beep]);
  const toggle = useCallback(() => { const cur = tRef.current; if (!cur || cur.done) return; if (cur.run) setT(Object.assign({}, cur, { run: false })); else { endRef.current = Date.now() + cur.left * 1000; setT(Object.assign({}, cur, { run: true })); } }, []);
  const skip = useCallback(() => { const cur = tRef.current; if (!cur) return; const n = cur.i + 1; if (n < cur.steps.length) { endRef.current = Date.now() + cur.steps[n].s * 1000; setT(Object.assign({}, cur, { i: n, left: cur.steps[n].s })); } else setT(Object.assign({}, cur, { i: n, left: 0, run: false, done: true })); }, []);
  const reset = useCallback(() => { const cur = tRef.current; if (!cur) return; endRef.current = Date.now() + cur.steps[0].s * 1000; setT(Object.assign({}, cur, { i: 0, left: cur.steps[0].s, run: false, done: false })); }, []);
  const close = useCallback(() => { setT(null); setOpen(false); }, []);
  return { t, open, setOpen, start, toggle, skip, reset, close };
}

function TimerDock({ T }) {
  const t = T.t; if (!t || T.open) return null;
  const cur = t.steps[t.i] || { l: "COMPLETE", s: 1, t: "r" };
  const col = t.done ? C.moss : cur.t === "w" ? C.oxide : C.cobalt;
  const frac = t.done ? 1 : 1 - t.left / (cur.s || 1);
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(58px + env(safe-area-inset-bottom))", zIndex: 70, background: C.slab, borderTop: "1px solid " + C.line, padding: "0 0 2px" }}>
      <div style={{ height: 4, background: C.ink }}><div style={{ width: (frac * 100) + "%", height: "100%", background: col, transition: "width .2s linear" }} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", maxWidth: 640, margin: "0 auto" }}>
        <div onClick={() => T.setOpen(true)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
          <div style={Object.assign({}, mno, { fontSize: 9, letterSpacing: 1.2, color: col, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{t.done ? t.title + " · COMPLETE" : t.title === cur.l ? cur.l : t.title + " · " + cur.l}</div>
          <div style={Object.assign({}, mno, { fontSize: 22, fontWeight: 700, color: C.chalk, lineHeight: 1.1 })}>{t.done ? "✓" : mmss(t.left)}<span style={{ fontSize: 8.5, color: C.ash, marginLeft: 8, whiteSpace: "nowrap" }}>{t.done ? "" : (t.steps.length > 1 ? "STEP " + (t.i + 1) + "/" + t.steps.length : "TAP TO EXPAND")}</span></div>
        </div>
        <Btn on={T.toggle} c={col} fill={!t.run && !t.done} small s={{ minWidth: 64 }} dis={t.done}>{t.run ? "PAUSE" : "START"}</Btn>
        <Btn on={T.skip} c={C.ash} small dis={t.done}>SKIP</Btn>
        <button onClick={T.close} aria-label="Close timer" style={Object.assign({}, mno, { background: "transparent", border: "1px solid " + C.line, color: C.ash, borderRadius: 4, width: 34, height: 34, cursor: "pointer", fontSize: 14 })}>×</button>
      </div>
    </div>);
}

function TimerFull({ T }) {
  const t = T.t; if (!t || !T.open) return null;
  const cur = t.steps[t.i] || { l: "COMPLETE", s: 1, t: "r" };
  const col = t.done ? C.moss : cur.t === "w" ? C.oxide : C.cobalt;
  const total = t.steps.reduce((a, x) => a + x.s, 0), elapsed = t.steps.slice(0, t.i).reduce((a, x) => a + x.s, 0) + (t.done ? 0 : (cur.s - t.left));
  const nxt = t.steps[t.i + 1];
  return (
    <div style={{ position: "fixed", inset: 0, background: C.ink, zIndex: 100, display: "flex", flexDirection: "column", padding: 16, paddingTop: "calc(16px + env(safe-area-inset-top))", paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={Object.assign({}, mno, { fontSize: 10, color: C.ash, letterSpacing: 1.4 })}>{t.title}</span>
        <Btn on={() => T.setOpen(false)} c={C.ash} small s={{ minWidth: 44, minHeight: 44 }}>MINIMISE</Btn>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={Object.assign({}, dsp, { fontSize: 22, fontWeight: 700, letterSpacing: 1.6, color: col, marginBottom: 8, animation: t.run && cur.t === "w" ? "pulse 1.4s infinite" : "none", padding: "0 10px" })}>{t.done ? "COMPLETE" : cur.l}</div>
        <div style={Object.assign({}, mno, { fontSize: 96, fontWeight: 700, color: t.done ? C.moss : C.chalk, lineHeight: 1, letterSpacing: -3 })}>{t.done ? "✓" : mmss(t.left)}</div>
        <div style={Object.assign({}, mno, { fontSize: 11, color: C.ash, marginTop: 14, letterSpacing: 1.2 })}>{t.done ? mmss(total) + " TOTAL" : "STEP " + (t.i + 1) + " / " + t.steps.length + " · " + mmss(total - elapsed) + " LEFT"}</div>
        <div style={{ display: "flex", gap: 2, width: "100%", maxWidth: 360, marginTop: 18 }}>
          {t.steps.map((s, k) => <div key={k} style={{ flex: Math.max(1, s.s), height: 6, borderRadius: 2, background: k < t.i || t.done ? (s.t === "w" ? C.oxide : C.cobalt) : k === t.i ? col : C.card, opacity: k < t.i || t.done ? .55 : 1 }} />)}
        </div>
        {!t.done && nxt ? <div style={Object.assign({}, mno, { fontSize: 10.5, color: C.ash, marginTop: 14 })}>NEXT · {nxt.l} · {mmss(nxt.s)}</div> : null}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn on={T.reset} c={C.ash} s={{ flex: 1, padding: "18px 0" }}>RESET</Btn>
        <Btn on={T.toggle} c={col} fill={!t.run && !t.done} dis={t.done} s={{ flex: 2, padding: "18px 0", fontSize: 17 }}>{t.done ? "DONE" : t.run ? "PAUSE" : "START"}</Btn>
        <Btn on={T.skip} c={C.ash} dis={t.done} s={{ flex: 1, padding: "18px 0" }}>SKIP</Btn>
      </div>
      <Btn on={T.close} c={C.line} s={{ marginTop: 8, color: C.ash, padding: "10px 0" }}>CLOSE TIMER</Btn>
    </div>);
}

/* ================================================================
   PLATES
   ================================================================ */
function Plates({ kg, bar, onClose }) {
  const [b, setB] = useState(bar || 20);
  const P = [25, 20, 15, 10, 5, 2.5, 1.25];
  const perSide = (kg - b) / 2; const out = []; let rem = perSide;
  if (perSide > 0) P.forEach((p) => { const n = Math.floor(rem / p + 1e-9); if (n > 0) { out.push([p, n]); rem = +(rem - n * p).toFixed(3); } });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(16,20,22,.94)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, paddingTop: "calc(20px + env(safe-area-inset-top))", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }} onClick={onClose}>
      <div style={{ background: C.card, border: "1px solid " + C.brass, borderRadius: 8, padding: 20, maxWidth: 340, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <Eye c={C.brass}>Plates per side</Eye>
        <div style={Object.assign({}, mno, { fontSize: 42, fontWeight: 700, color: C.chalk, margin: "2px 0 10px" })}>{kg}<span style={{ fontSize: 17, color: C.ash }}> kg</span></div>
        <Seg opts={[[20, "20 KG BAR"], [25, "25 KG TRAP BAR"]]} val={b} on={setB} c={C.brass} />
        <div style={{ marginTop: 12 }}>
          {perSide <= 0 ? <Note>Bar only, or lighter than the bar.</Note>
            : out.map((o) => <div key={o[0]} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 16, fontWeight: 600, color: C.chalk })}>{o[0]} kg</span>
              <span style={Object.assign({}, mno, { fontSize: 16, color: C.brass })}>× {o[1]}</span></div>)}
          {rem > 0.01 ? <Note c={C.oxide}>{rem} kg per side unmatched — load {r25(kg)} kg.</Note> : null}
        </div>
        <Btn on={onClose} c={C.brass} fill s={{ width: "100%", marginTop: 16 }}>CLOSE</Btn>
      </div>
    </div>);
}

/* ================================================================
   SET LOGGER — tap a set to confirm it; the rest clock starts itself
   ================================================================ */
function SetLogger({ sets, reps, autoKg, cur, onChange, onSetDone, prevSets, prevLabel, prevMacro }) {
  const n = Math.max(1, Number(sets) || 1);
  const rows = (cur && cur.sets) || [];
  const repNum = typeof reps === "number" ? reps : (String(reps || "").match(/^\d+/) || [""])[0];
  const defW = (i) => { for (let k = i - 1; k >= 0; k--) if (rows[k] && rows[k].w) return rows[k].w; return autoKg != null ? String(autoKg) : ""; };
  const get = (i) => rows[i] || {};
  const put = (i, patch) => { const next = rows.slice(); while (next.length < n) next.push({}); next[i] = Object.assign({}, next[i], patch); onChange(Object.assign({}, cur, { sets: next })); };
  const confirm = (i) => { const r = get(i); if (r.ok) { put(i, { ok: false }); return; } put(i, { ok: true, w: r.w != null && r.w !== "" ? r.w : defW(i), r: r.r != null && r.r !== "" ? r.r : String(repNum) }); buzz(30); if (onSetDone) onSetDone(i); };
  const vl = cur && cur.vl;
  return (
    <div style={{ marginTop: 8 }}>
      {prevSets ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.brass, marginBottom: 6 })}>{prevLabel}: {prevSets}</div> : null}
      {prevMacro ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginBottom: 6 })}>{prevMacro}</div> : null}
      {Array.from({ length: n }).map((_, i) => { const r = get(i); const ok = !!r.ok;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={Object.assign({}, mno, { fontSize: 9, color: ok ? C.moss : C.ash, width: 34, letterSpacing: .8 })}>SET {i + 1}</span>
            <div style={{ flex: 1, position: "relative" }}><Fld v={r.w != null ? r.w : defW(i)} on={(val) => put(i, { w: val })} ph="kg" s={{ padding: "8px 24px 8px 6px", opacity: ok ? .75 : 1 }} /><span style={Object.assign({}, mno, { position: "absolute", right: 7, top: 12, fontSize: 9, color: C.ash })}>KG</span></div>
            <span style={Object.assign({}, mno, { fontSize: 11, color: C.ash })}>×</span>
            <div style={{ flex: .8, position: "relative" }}><Fld v={r.r != null ? r.r : String(repNum)} on={(val) => put(i, { r: val })} ph={String(reps || "")} s={{ padding: "8px 6px", opacity: ok ? .75 : 1 }} /></div>
            <button onClick={() => confirm(i)} aria-label={"Confirm set " + (i + 1)} style={Object.assign({}, mno, { width: 44, height: 40, borderRadius: 5, cursor: "pointer", fontSize: 16, fontWeight: 700, background: ok ? C.moss : "transparent", color: ok ? C.ink : C.ash, border: "1px solid " + (ok ? C.moss : C.line) })}>{ok ? "✓" : "○"}</button>
          </div>);
      })}
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        {[["CLEAN", C.moss], ["SLOWED", C.brass], ["CUT", C.oxide]].map((o) => <button key={o[0]} onClick={() => onChange(Object.assign({}, cur, { vl: vl === o[0] ? "" : o[0] }))}
          style={Object.assign({}, mno, { flex: 1, fontSize: 9, letterSpacing: .8, padding: "7px 0", borderRadius: 3, cursor: "pointer", background: vl === o[0] ? o[1] : "transparent", color: vl === o[0] ? C.ink : C.ash, border: "1px solid " + (vl === o[0] ? "transparent" : C.line) })}>{o[0]}</button>)}
      </div>
      <div style={Object.assign({}, mno, { fontSize: 8, color: C.ash, marginTop: 4 })}>CLEAN = every rep fast · SLOWED = a rep visibly slower · CUT = stopped the set early</div>
    </div>);
}

/* ================================================================
   BLOCK BODY — the prescription for one block, one week
   ================================================================ */
const setsSummary = (e) => { if (!e) return ""; if (e.sets && e.sets.some((s) => s.ok)) { const ok = e.sets.filter((s) => s.ok); const ws = ok.map((s) => s.w); const same = ws.every((x) => x === ws[0]); return same ? ws[0] + " kg × " + ok.map((s) => s.r).join(",") : ok.map((s) => s.w + "×" + s.r).join(" · "); } if (e.w) return e.w + (e.r ? " × " + e.r : ""); return ""; };
const RAMP = [[50, 5], [65, 3], [75, 2], [85, 1], [92, 1]];

function BlockBody({ b, rx, week, macro, day, log, setLog, maxes, bw, ready, openProto, startTimer, openPlates, onSetMax, autoRest, weekStats }) {
  const P = PH[rx.ph], yellow = ready === "Y", red = ready === "R";
  const key = (id) => "m" + macro + "w" + week + "-" + day + "-" + id;
  const prevW = (id) => log["m" + macro + "w" + (week - 1) + "-" + day + "-" + id];
  const prevM = (id) => log["m" + (macro - 1) + "w" + week + "-" + day + "-" + id];
  const setE = (id, e) => { const k = key(id); const n = Object.assign({}, log); n[k] = e; setLog(n); };
  const patch = (id, f, val) => { const k = key(id); setE(id, Object.assign({}, log[k], { [f]: val })); };
  const calc = (mk, pct) => { const m = num(maxes[mk]); if (!m || pct == null) return null; const adj = yellow ? 0.93 : 1;
    const lo = Array.isArray(pct) ? pct[0] : pct, hi = Array.isArray(pct) ? pct[1] : pct; const a = r25(m * lo / 100 * adj), z = r25(m * hi / 100 * adj); return a === z ? [a] : [a, z]; };
  const mainLift = v(b.mainLift, rx), items = v(b.items, rx), timer = b.timer ? b.timer(rx) : null, rest = v(b.rest, rx), rt = v(b.rt, rx);
  const isMaxWeek = mainLift && !!b.maxUI && ((mainLift === "squat" && rx.maxSq) || (mainLift === "bench" && rx.maxBe));
  const needsCal = b.calib && ((rx.cal && rx[b.calib === "tbdl" ? "tb" : "pp"] && rx[b.calib === "tbdl" ? "tb" : "pp"].cal) || !num(maxes[b.calib]));
  const [calIn, setCalIn] = useState(""); const [maxIn, setMaxIn] = useState("");
  const mainMax = mainLift ? num(maxes[mainLift]) : null;
  const fs1 = log[key("fs_rd1")], fs6 = log[key("fs_rd6")];
  const drop = fs1 && fs6 && num(fs1.w) && num(fs6.w) ? (num(fs1.w) - num(fs6.w)) / num(fs1.w) * 100 : null;
  const startRest = (secs) => startTimer({ kind: "rest", opt: { secs }, title: "REST" });
  const kgLine = (arr) => (arr ? arr.join("–") + " kg" : null);
  const bwLine = (it) => { const p = v(it.bwp, rx); if (!p || !bw) return null; return Math.round(bw * p[0] / 100) + "–" + Math.round(bw * p[1] / 100) + " kg " + (it.bwl || "") + " at " + bw + " kg"; };
  return (
    <div>
      {red && b.hard ? <div style={{ background: C.ink, border: "1px solid " + C.oxide, borderRadius: 5, padding: "10px 12px", marginBottom: 10 }}><div style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 700, letterSpacing: 1.2, color: C.oxide })}>RED DAY — SKIP THIS BLOCK</div><Note>No max effort, no sprints, no jumps. Prep, protocols and mobility only.</Note></div> : null}
      {b.tag ? <Chip c={C.oxide} s={{ marginBottom: 10, display: "inline-block" }}>{b.tag}</Chip> : null}

      {mainLift && !(rx.maxBe && mainLift === "bench" && day === "sat" && false) ? (
        <div style={{ background: C.ink, border: "1px solid " + P.ac, borderRadius: 5, padding: 12, marginBottom: 11 }}>
          <Eye c={P.ac} s={{ marginBottom: 4 }}>Week {week} · {P.long}</Eye>
          <div style={Object.assign({}, bdy, { fontSize: 16, fontWeight: 700, color: C.chalk })}>{b.pres ? b.pres(rx).sc : mainLift === "tbdl" ? rx.tb.sc : mainLift === "pp" ? (rx.pp ? rx.pp.sc : "") : mainLift === "bench" ? (isMaxWeek ? "MAX SINGLE" : rx.upperC && day === "mon" ? "4 rounds · 2 @ 85%" : (rx.bsc || rx.sc)) : rx.sc}</div>
          {!isMaxWeek && !needsCal ? (() => { const pct = b.pres ? b.pres(rx).pct : mainLift === "tbdl" ? rx.tb.pct : mainLift === "pp" ? (rx.pp && rx.pp.pct) : mainLift === "bench" && rx.upperC && day === "mon" ? 85 : rx.pct; const kg = calc(mainLift, pct);
            return kg ? <div onClick={() => openPlates(kg[0])} style={Object.assign({}, mno, { fontSize: 30, fontWeight: 700, color: C.brass, marginTop: 6, cursor: "pointer" })}>{kgLine(kg)} <span style={{ fontSize: 9, color: C.ash, letterSpacing: 1 }}>▶ PLATES</span></div>
              : <Note c={C.ash} s={{ fontStyle: "italic" }}>Enter your {MAXES.find((x) => x[0] === mainLift)[1]} max in TRACK to see kilos here.</Note>; })() : null}
          {yellow && !isMaxWeek ? <div style={Object.assign({}, mno, { fontSize: 9.5, color: C.brass, marginTop: 6 })}>YELLOW DAY — loads reduced 7%</div> : null}
          {isMaxWeek ? (
            <div style={{ marginTop: 8 }}>
              <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.oxide, fontWeight: 600 })}>★ MAX SINGLE — one of two this macrocycle. Pins set. {mainLift === "bench" ? "Sunday morning, first thing, fresh. No collars." : "After the sprints and the jumps, before the jump circuit."}</div>
              {mainMax ? <div style={{ marginTop: 8 }}>
                <Lab>Ramp from {mainMax} kg</Lab>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {RAMP.map((r) => <span key={r[0]} style={Object.assign({}, mno, { fontSize: 11, color: C.chalk, border: "1px solid " + C.line, borderRadius: 3, padding: "4px 7px" })}>{r25(mainMax * r[0] / 100)} × {r[1]}</span>)}
                  <span style={Object.assign({}, mno, { fontSize: 11, color: C.ink, background: C.brass, borderRadius: 3, padding: "4px 7px", fontWeight: 700 })}>{r25(mainMax * 1.0)}–{r25(mainMax * 1.02)} × 1</span>
                </div>
                <Note>One attempt at 100–102%. A second only if the first flew up, or if the fast-bar rule has been firing for three weeks. If you are not certain you will complete the rep, you don't start it.</Note>
              </div> : <Note c={C.ash} s={{ fontStyle: "italic" }}>No max on file — enter one in TRACK, or log today's single below and it becomes the max.</Note>}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 10 }}>
                <div style={{ flex: 1 }}><Lab>Today's single (kg)</Lab><Fld v={maxIn} on={setMaxIn} ph="kg" /></div>
                <Btn on={() => { const k = num(maxIn); if (!k) return; onSetMax(mainLift, k, "max single · wk " + week); setMaxIn(""); }} c={C.oxide} fill dis={!num(maxIn)}>SAVE AS MAX</Btn>
              </div>
              {mainMax ? <Note c={C.chalk}>Then back off: {rx.sets} × {rx.reps} @ {rx.pct}% → {r25(mainMax * rx.pct / 100)} kg of the max on file{num(maxIn) ? " (" + r25(num(maxIn) * rx.pct / 100) + " kg of today's single)" : ""}.</Note> : null}
            </div>) : null}
          {needsCal ? (
            <div style={{ marginTop: 8 }}>
              <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.brass, fontWeight: 600 })}>CALIBRATE — this lift has never been tested. Ramp in triples: bar, then add 10–20 kg a set until a triple is RPE 8 (two reps left). That triple is your number.</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 10 }}>
                <div style={{ flex: 1 }}><Lab>3RM today (kg)</Lab><Fld v={calIn} on={setCalIn} ph="kg" /></div>
                <div style={{ flex: 1 }}><Lab>Estimated 1RM</Lab><div style={Object.assign({}, mno, { fontSize: 20, fontWeight: 700, color: C.brass, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" })}>{num(calIn) ? r25(num(calIn) * 1.08) + " kg" : "—"}</div></div>
                <Btn on={() => { const k = num(calIn); if (!k) return; onSetMax(b.calib, r25(k * 1.08), "3RM × 1.08 · wk " + week); setCalIn(""); }} c={C.brass} fill dis={!num(calIn)}>SAVE</Btn>
              </div>
            </div>) : null}
        </div>) : null}

      {b.eng && ENG[rx[b.engKey || "eng"]] ? (
        <div style={{ background: C.ink, border: "1px solid " + C.cobalt, borderRadius: 5, padding: "11px 12px", marginBottom: 11 }}>
          <Eye c={C.cobalt} s={{ marginBottom: 4 }}>Block week {rx.bw || "—"} · rotation</Eye>
          <div style={Object.assign({}, bdy, { fontSize: 15, fontWeight: 700, color: C.chalk })}>{ENG[rx[b.engKey || "eng"]].d}</div>
          <Note>{ENG[rx[b.engKey || "eng"]].why}</Note>
        </div>) : null}
      {b.sim ? (
        <div style={{ background: C.ink, border: "1px solid " + C.brass, borderRadius: 5, padding: "11px 12px", marginBottom: 11 }}>
          <Eye c={C.brass} s={{ marginBottom: 4 }}>This week's rest</Eye>
          <div style={Object.assign({}, bdy, { fontSize: 15, fontWeight: 700, color: C.chalk })}>{(rx.sim.rounds || 6)} rounds · {rx.sim.rest}s between{rx.sim.max3 ? " · minute 3 MAXIMAL" : ""}{rx.sim.tested ? " · TESTED — log round 1 and round 6" : ""}</div>
          {drop != null ? <div style={{ marginTop: 8 }}><span style={Object.assign({}, mno, { fontSize: 22, fontWeight: 700, color: drop <= 5 ? C.moss : drop <= 10 ? C.brass : C.oxide })}>{drop.toFixed(1)}% drop-off</span><Note>{drop <= 5 ? "Excellent." : drop <= 10 ? "Good — the standard." : drop <= 20 ? "Aerobic base needs work." : "Pacing or engine."}</Note></div> : null}
        </div>) : null}

      {timer && !(red && b.hard) ? <Btn on={() => startTimer(timer)} c={C.oxide} fill s={{ width: "100%", marginBottom: 10, fontSize: 15 }}>▶ START {timer.title}</Btn> : null}
      {b.p && ((items || []).filter((x) => x.k !== "txt").length <= 1) ? (
        <div style={{ background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "10px 12px", marginBottom: 11 }}>
          <Eye c={PROTO[b.p].c} s={{ marginBottom: 6 }}>{PROTO[b.p].n} · {PROTO[b.p].s}</Eye>
          {PROTO[b.p].i.map((pi, pj) => pi[1]
            ? <div key={pj} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 0", borderBottom: "1px solid " + C.line }}>
                <span style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk })}>{pi[0]}</span>
                <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.brass, textAlign: "right", flexShrink: 0, maxWidth: "58%" })}>{pi[1]}</span></div>
            : <Eye key={pj} c={C.brass} s={{ margin: "9px 0 3px", fontSize: 8.5 }}>{pi[0]}</Eye>)}
          {PROTO[b.p].note ? <Note s={{ fontStyle: "italic", fontSize: 11.5 }}>{PROTO[b.p].note}</Note> : null}
        </div>) : null}
      {rest ? <div onClick={() => rt && startRest(rt)} style={Object.assign({}, mno, { fontSize: 10.5, color: C.brass, marginBottom: 11, letterSpacing: .6, cursor: rt ? "pointer" : "default", border: "1px dashed " + (rt ? C.brass : "transparent"), borderRadius: 4, padding: rt ? "8px 10px" : 0 })}>{rest.toUpperCase()}{rt ? "  ▶ TIME IT" : ""}</div> : null}

      {items && !(red && b.hard) ? items.map((it, j) => {
        const id = it.id, k = it.k, cur = id ? (log[key(id)] || {}) : {};
        const auto = it.mk && it.pct != null ? calc(it.mk, v(it.pct, rx)) : null;
        const name = v(it.n, rx), sch = v(it.s, rx), cue = v(it.cue, rx);
        const pw = id ? prevW(id) : null, pm = id ? prevM(id) : null;
        if (k === "txt") return <div key={j} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid " + C.line }}><span style={Object.assign({}, mno, { fontSize: 10, color: C.brass, flexShrink: 0, width: 62 })}>{name.toUpperCase()}</span><span style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk })}>{sch}</span></div>;
        return (
          <div key={j} style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid " + C.line }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
              <span style={Object.assign({}, bdy, { fontSize: 14, fontWeight: 600, color: C.chalk })}>{name}</span>
              <span style={Object.assign({}, mno, { fontSize: 11, color: C.brass, textAlign: "right", flexShrink: 0, maxWidth: "46%" })}>{sch}</span>
            </div>
            {auto && !(mainLift && it.mk === mainLift) ? <div onClick={() => openPlates(auto[0])} style={Object.assign({}, mno, { fontSize: 18, fontWeight: 700, color: C.brass, marginTop: 4, cursor: "pointer" })}>{kgLine(auto)} <span style={{ fontSize: 8, color: C.ash }}>▶ PLATES</span></div> : null}
            {bwLine(it) ? <div style={Object.assign({}, mno, { fontSize: 11, color: C.brass, marginTop: 4 })}>{bwLine(it)}</div> : null}
            {cue ? <Note s={{ marginTop: 3 }}>{cue}</Note> : null}
            {id && k === "wr" ? <SetLogger sets={v(it.sets, rx)} reps={v(it.reps, rx)} autoKg={auto ? auto[0] : null} cur={cur} onChange={(e) => setE(id, e)}
              onSetDone={() => { if (autoRest && rt) startRest(rt); }} prevSets={setsSummary(pw)} prevLabel={"LAST WEEK"} prevMacro={pm && setsSummary(pm) ? "M" + (macro - 1) + " SAME WEEK: " + setsSummary(pm) : null} /> : null}
            {id && k === "out" ? <div style={{ marginTop: 8 }}><Lab>{it.u || "output"}</Lab><Fld v={cur.w} on={(val) => patch(id, "w", val)} ph="—" a="left" />
              {pw && pw.w ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.brass, marginTop: 5 })}>LAST WEEK: {pw.w}</div> : null}
              {pm && pm.w ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 3 })}>M{macro - 1} SAME WEEK: {pm.w}</div> : null}</div> : null}
            {id && k === "chk" ? <button onClick={() => patch(id, "ok", !cur.ok)} style={Object.assign({}, dsp, { marginTop: 8, width: "100%", minHeight: 40, fontSize: 13, fontWeight: 700, letterSpacing: 1, borderRadius: 5, cursor: "pointer", background: cur.ok ? C.moss : "transparent", color: cur.ok ? C.ink : C.ash, border: "1px solid " + (cur.ok ? C.moss : C.line) })}>{cur.ok ? "✓ DONE" : "MARK DONE"}</button> : null}
          </div>);
      }) : null}

      {b.fb && !isMaxWeek && !rx.test && !(b.fb === "bench" && rx.maxBe) && !(b.fb === "squat" && rx.maxSq) ? (() => {
        const lift = b.fb, ans = log[key("fb_" + lift)] || {}, cm = num(maxes[lift]);
        const it = (items || []).find((x) => x.mk === lift && x.k === "wr");
        const nsets = it ? Math.max(1, Number(v(it.sets, rx)) || 1) : 0;
        const e2 = it && it.id ? log[key(it.id)] : null;
        const lastDone = !!(e2 && e2.sets && e2.sets[nsets - 1] && e2.sets[nsets - 1].ok);
        if (!lastDone && !ans.a) return null;
        const step = lift === "squat" || lift === "tbdl" ? 5 : 2.5;
        const next = cm ? Math.round(cm * 1.025 / step) * step : null;
        const lname = (MAXES.find((x) => x[0] === lift) || [, lift])[1];
        return (
          <div style={{ background: C.ink, border: "1px solid " + C.brass, borderRadius: 5, padding: 12, margin: "11px 0" }}>
            <Eye c={C.brass} s={{ marginBottom: 6 }}>The fast-bar rule · once per lift per week</Eye>
            <div style={Object.assign({}, bdy, { fontSize: 16, fontWeight: 700, color: C.chalk })}>Last rep as fast as the first?</div>
            {ans.a === "y" ? <Note c={C.moss} bold>Yes — {lname} max {ans.from} → {ans.kg} kg for next week. It's in TRACK; change it there if that's wrong.</Note>
              : !cm ? <Note c={C.ash} s={{ fontStyle: "italic" }}>Enter your {lname} max in TRACK first.</Note>
              : <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Btn on={() => { setE("fb_" + lift, { a: "y", kg: next, from: cm }); onSetMax(lift, next, "fast-bar rule · wk " + week); }} c={C.brass} fill s={{ flex: 2 }}>YES · {cm} → {next} KG</Btn>
                  <Btn on={() => setE("fb_" + lift, { a: "n" })} c={C.ash} fill={ans.a === "n"} s={{ flex: 1 }}>NO</Btn>
                </div>}
            {ans.a === "y" ? null : <Note>Yes raises this lift's max by 2.5% for next week, rounded to {step} kg, once per lift per week. The grind rule runs the other way: two grinding sets on one lift in a week and you take 2.5% back off.</Note>}
          </div>);
      })() : null}

      {b.review && weekStats ? (
        <div style={{ background: C.ink, border: "1px solid " + C.moss, borderRadius: 5, padding: "11px 12px", marginBottom: 11 }}>
          <Eye c={C.moss} s={{ marginBottom: 6 }}>This week, counted for you</Eye>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["SESSIONS", weekStats.done + "/" + weekStats.planned], ["GREEN", weekStats.g], ["YELLOW", weekStats.y], ["RED", weekStats.r], ["HANDS SLOW", weekStats.slow], ["SPARRED", weekStats.spar]].map((x) => (
              <div key={x[0]} style={{ flex: "1 1 28%", background: C.card, borderRadius: 4, padding: "7px 4px", textAlign: "center", border: "1px solid " + C.line }}>
                <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, letterSpacing: 1 })}>{x[0]}</div>
                <div style={Object.assign({}, mno, { fontSize: 15, fontWeight: 700, color: C.chalk })}>{x[1]}</div></div>))}
          </div>
          {weekStats.slow >= 2 ? <Note c={C.oxide} bold>Two slow nights at boxing this week — that morning was too much. Cut it, don't push through.</Note> : null}
          {weekStats.y >= 3 ? <Note c={C.oxide} bold>Three yellow days — one early-deload trigger. A second in the same week means deload now.</Note> : null}
        </div>) : null}

      {b.rules ? <div style={{ background: C.ink, border: "1px solid " + C.oxide, borderRadius: 5, padding: 12, margin: "11px 0" }}><Eye c={C.oxide}>The two rules</Eye>{b.rules.map((r, k) => <div key={k} style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.45, marginBottom: 8 })}>{k + 1}. {r}</div>)}</div> : null}
      {v(b.w, rx) ? <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.oxide, lineHeight: 1.5, marginTop: 9, paddingLeft: 10, borderLeft: "2px solid " + C.oxide, fontWeight: 600 })}>{v(b.w, rx)}</div> : null}
      {v(b.why, rx) ? <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.5, marginTop: 9 })}><span style={Object.assign({}, mno, { fontSize: 8.5, color: C.brass, letterSpacing: 1.2 })}>WHY · </span>{v(b.why, rx)}</div> : null}
      {v(b.note, rx) ? <Note s={{ fontStyle: "italic" }}>{v(b.note, rx)}</Note> : null}
    </div>);
}

/* ================================================================
   PROTOCOL SHEET
   ================================================================ */
function ProtoSheet({ id, close }) {
  const p = PROTO[id]; if (!p) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(16,20,22,.9)", zIndex: 90, display: "flex", alignItems: "flex-end" }} onClick={close}>
      <div className="rise" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderTop: "3px solid " + p.c, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 640, margin: "0 auto", maxHeight: "86vh", overflowY: "auto", padding: 16, paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div><Eye c={p.c} s={{ marginBottom: 2 }}>Protocol</Eye><div style={Object.assign({}, dsp, { fontSize: 24, fontWeight: 800, letterSpacing: 1, color: C.chalk })}>{p.n}</div><div style={Object.assign({}, mno, { fontSize: 10, color: C.ash, marginTop: 3 })}>{p.s.toUpperCase()}</div></div>
          <Btn on={close} c={C.ash} small s={{ minWidth: 44, minHeight: 44 }}>CLOSE</Btn>
        </div>
        <div style={{ marginTop: 12 }}>
          {p.i.map((it, i) => it[1] ? (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 14, color: C.chalk, fontWeight: 600 })}>{it[0]}</span>
              <span style={Object.assign({}, mno, { fontSize: 10.5, color: C.brass, textAlign: "right", flexShrink: 0, maxWidth: "58%" })}>{it[1]}</span>
            </div>) : <Eye key={i} c={C.brass} s={{ margin: i ? "14px 0 6px" : "0 0 6px" }}>{it[0]}</Eye>)}
          {p.note ? <Note s={{ fontStyle: "italic", marginTop: 14 }}>{p.note}</Note> : null}
        </div>
      </div>
    </div>);
}

/* ================================================================
   SESSION — one day's card: readiness, the spine, the blocks
   ================================================================ */
function summaryFor(b, rx, calc) {
  if (b.review) return "2 min — write it down";
  if (b.rxLine) return b.rxLine(rx);
  if (b.eng && ENG[rx[b.engKey || "eng"]]) return ENG[rx[b.engKey || "eng"]].d;
  const its = v(b.items, rx);
  if (its && its.length && its[0].s) { const f = its[0]; const s = v(f.s, rx); const kg = f.mk && f.pct != null ? calc(f.mk, v(f.pct, rx)) : null; return s + (kg ? " → " + kg.join("–") + " kg" : ""); }
  if (b.p && PROTO[b.p]) return PROTO[b.p].s;
  return "";
}
const dayKey = (macro, week, day) => "m" + macro + "w" + week + "-" + day;
const prevDayKey = (macro, week, day, L) => { const i = DAYS.indexOf(day); if (i > 0) return dayKey(macro, week, DAYS[i - 1]); if (week > 1) return dayKey(macro, week - 1, "sun"); return dayKey(macro - 1, L, "sun"); };

function Session(props) {
  const { macro, week, day, isCurrent, done, setDone, log, setLog, maxes, bw, ready, setReady, sparPrev, sparThis, setSparThis, swapped, setSwapped, box, setBox, note, setNote, openProto, startTimer, openPlates, onSetMax, autoRest, openFlow, goIron, weekStats, addBody } = props;
  const rx = rxFor(week), P = PH[rx.ph];
  const [open, setOpen] = useState(null);
  if (rx.hell) return (
    <Card ac={C.oxide}>
      <Eye c={C.oxide}>Week 17 · Hell Week</Eye>
      <div style={Object.assign({}, dsp, { fontSize: 24, fontWeight: 800, letterSpacing: 1.2, color: C.chalk })}>NO OPTIMAL 8 VOLUME</div>
      <Note c={C.chalk}>This week replaces the program; it doesn't stack on top. One flagship test per day, drawn from the cards each morning. Day 6 last.</Note>
      <Btn on={goIron} c={C.oxide} fill s={{ width: "100%", marginTop: 12 }}>GO TO HELL WEEK</Btn>
    </Card>);
  if (day === "sat" && rx.test) return <TestDay macro={macro} week={week} day={day} done={done} setDone={setDone} log={log} setLog={setLog} maxes={maxes} onSetMax={onSetMax} bw={bw} addBody={addBody} />;
  const own = S[day], srcDay = swapped ? "light" : day, sess = S[srcDay];
  const blocks = blocksFor(srcDay, rx), real = blocks.filter((x) => x.L);
  const dk = dayKey(macro, week, day), dl = done[dk] || [];
  const pct = real.length ? Math.round(dl.length / real.length * 100) : 0;
  const nx = real.find((b) => dl.indexOf(b.L) < 0);
  const effReady = sparPrev && !swapped ? "R" : ready;
  const yellow = effReady === "Y";
  const calc = (mk, pctv) => { const m = num(maxes[mk]); if (!m || pctv == null) return null; const adj = yellow ? 0.93 : 1; const lo = Array.isArray(pctv) ? pctv[0] : pctv, hi = Array.isArray(pctv) ? pctv[1] : pctv; const a = r25(m * lo / 100 * adj), z = r25(m * hi / 100 * adj); return a === z ? [a] : [a, z]; };
  const mark = (L) => { const cur = done[dk] || []; const n = Object.assign({}, done); n[dk] = cur.indexOf(L) >= 0 ? cur.filter((x) => x !== L) : cur.concat([L]); setDone(n); buzz(20); };
  const RC = { G: C.moss, Y: C.brass, R: C.oxide };
  const mins = v(sess.m, rx);
  return (
    <div>
      <Card ac={own.ac} s={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={Object.assign({}, dsp, { fontSize: 28, fontWeight: 800, letterSpacing: 1.6, color: C.chalk, lineHeight: 1 })}>{own.n}</span>
            <span style={Object.assign({}, mno, { fontSize: 10.5, color: own.ac, whiteSpace: "nowrap" })}>{mins} MIN{own.pm ? " · PM" : ""}</span>
          </div>
          <div style={Object.assign({}, bdy, { fontSize: 14, color: C.chalk, marginTop: 5, fontWeight: 600 })}>{swapped ? "Light session (sparring rule)" : sess.t}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <Chip c={P.ac}>M{macro} · WK {week} · {P.n}</Chip>
            {own.free ? <Chip c={C.moss}>Free day</Chip> : <Chip c={C.brass}>3am session</Chip>}
            {rx.maxSq && day === "sat" ? <Chip c={C.oxide}>Squat max single</Chip> : null}
            {rx.maxBe && day === "sun" ? <Chip c={C.oxide}>Bench max single</Chip> : null}
            {rx.dl ? <Chip c={C.moss}>Deload</Chip> : null}{rx.tp ? <Chip c={C.cobalt}>Taper</Chip> : null}{rx.cal && (day === "wed" || day === "sat") ? <Chip c={C.brass}>Calibration</Chip> : null}
          </div>
          {sess.intro ? <Note c={C.ash}>{sess.intro}</Note> : null}
        </div>

        {sparPrev ? (
          <div style={{ background: C.ink, borderTop: "1px solid " + C.oxide, borderBottom: "1px solid " + C.oxide, padding: "11px 14px" }}>
            <Eye c={C.oxide} s={{ marginBottom: 4 }}>The sparring rule</Eye>
            <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.5 })}>You sparred last night. The morning is the light session — Tuesday's warm-up, Thursday's neck block, Monday's shoulder circuit, about 30 minutes — or nothing. Any headache, fogginess or light sensitivity: do nothing at all, and tell your coach.</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <Btn on={() => setSwapped(!swapped)} c={C.oxide} fill={!swapped} small s={{ flex: 1 }}>{swapped ? "BACK TO THE PLAN" : "USE THE LIGHT SESSION"}</Btn>
            </div>
          </div>) : null}

        <div style={{ padding: "12px 14px 14px" }}>
          <Eye s={{ marginBottom: 6 }}>Readiness — sets today's loads</Eye>
          <Seg opts={[["G", "GREEN", C.moss], ["Y", "YELLOW −7%", C.brass], ["R", "RED", C.oxide]]} val={ready} on={(val) => setReady(ready === val ? "" : val)} />
          {ready === "Y" ? <Note c={C.brass}>Top sets reduced 7%. Sprints become 3 × 20m @ 90%. Drop the last accessory block.</Note> : null}
          {ready === "R" ? <Note c={C.oxide}>No max effort, no sprints, no jumps today. Prep, protocols, mobility — then stop.</Note> : null}
          {own.box ? (
            <div style={{ marginTop: 12 }}>
              <Eye s={{ marginBottom: 6 }}>Tonight at boxing</Eye>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 2 }}><Seg opts={[["sharp", "HANDS SHARP", C.moss], ["slow", "HANDS SLOW", C.oxide]]} val={box} on={(val) => setBox(box === val ? "" : val)} /></div>
                <button onClick={() => setSparThis(!sparThis)} style={Object.assign({}, dsp, { flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: .8, borderRadius: 4, cursor: "pointer", minHeight: 38, background: sparThis ? C.violet : "transparent", color: sparThis ? C.ink : C.ash, border: "1px solid " + (sparThis ? C.violet : C.line) })}>{sparThis ? "SPARRED ✓" : "SPARRED?"}</button>
              </div>
              {box === "slow" ? <Note c={C.oxide}>Slow hands at 7pm means this morning was too much. Cut it next week; don't push through.</Note> : null}
            </div>) : null}
          <div style={{ height: 6, background: C.ink, borderRadius: 3, marginTop: 14, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: pct === 100 ? C.moss : own.ac, transition: "width .3s" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={Object.assign({}, mno, { fontSize: 9, color: C.ash })}>{dl.length}/{real.length} BLOCKS</span>
            <span style={Object.assign({}, mno, { fontSize: 9, color: pct === 100 ? C.moss : C.ash })}>{pct === 100 ? "SESSION COMPLETE" : nx ? "NEXT · " + nx.L + " " + v(nx.n, rx).toUpperCase() : ""}</span>
          </div>
          <Btn on={openFlow} c={pct === 100 ? C.moss : own.ac} fill={pct < 100} s={{ width: "100%", marginTop: 12, fontSize: 16 }}>{pct === 100 ? "REVIEW SESSION" : pct > 0 ? "▶ CONTINUE SESSION" : "▶ START SESSION"}</Btn>
        </div>
      </Card>

      {blocks.map((b, idx) => {
        if (b.sp) return <div key={"sp" + idx} style={Object.assign({}, mno, { fontSize: 10, letterSpacing: 1.8, color: C.brass, padding: "12px 2px 8px", borderTop: "1px solid " + C.line, marginTop: 4 })}>{v(b.sp, rx)}</div>;
        const isDone = dl.indexOf(b.L) >= 0, isOpen = open === b.L, isNext = nx && b.L === nx.L, skip = effReady === "R" && b.hard;
        const edge = skip ? C.oxide : isDone ? C.moss : isNext ? own.ac : C.line;
        const name = v(b.n, rx), star = v(b.star, rx);
        return (
          <Card key={b.L} ac={edge} s={{ padding: 0, opacity: isDone ? .62 : 1 }}>
            <div onClick={() => setOpen(isOpen ? null : b.L)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", cursor: "pointer" }}>
              <span style={Object.assign({}, mno, { fontSize: 12, fontWeight: 700, width: 30, height: 30, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? C.moss : C.ink, color: isDone ? C.ink : own.ac, border: "1px solid " + (isDone ? C.moss : C.line), flexShrink: 0 })}>{isDone ? "✓" : b.L}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={Object.assign({}, bdy, { fontSize: 14.5, fontWeight: 600, color: star ? C.brass : C.chalk, lineHeight: 1.25, textDecoration: skip ? "line-through" : "none" })}>{star ? "★ " : ""}{name}</div>
                <div style={Object.assign({}, mno, { fontSize: 9.5, color: skip ? C.oxide : C.ash, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{skip ? "SKIP — " + (sparPrev && !swapped ? "SPARRING RULE" : "RED DAY") : summaryFor(b, rx, calc)}</div>
              </span>
              <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, flexShrink: 0 })}>{v(b.m, rx) ? v(b.m, rx) + "′" : ""}</span>
            </div>
            {isOpen ? (
              <div className="rise" style={{ padding: "0 12px 12px" }}>
                <div style={{ height: 1, background: C.line, marginBottom: 12 }} />
                <BlockBody b={b} rx={rx} week={week} macro={macro} day={day} log={log} setLog={setLog} maxes={maxes} bw={bw} ready={effReady} openProto={openProto} startTimer={startTimer} openPlates={openPlates} onSetMax={onSetMax} autoRest={autoRest} weekStats={weekStats} />
                {b.tr ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 12, textAlign: "center", letterSpacing: 1 })}>↓ {b.tr} MIN TRANSITION ↓</div> : null}
                <Btn on={() => mark(b.L)} c={isDone ? C.line : C.moss} fill={!isDone} s={{ width: "100%", marginTop: 12, color: isDone ? C.ash : C.ink }}>{isDone ? "UNDO" : "MARK BLOCK DONE"}</Btn>
              </div>) : null}
          </Card>);
      })}

      <Card ac={C.violet} s={{ padding: 0 }}>
        <button onClick={() => openProto("HOME")} style={{ display: "flex", width: "100%", alignItems: "center", gap: 11, textAlign: "left", background: "transparent", border: "none", padding: "12px 13px", cursor: "pointer" }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <div style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk, lineHeight: 1.4 })}>{HOMELINE}</div>
            <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 3, letterSpacing: 1 })}>TAP FOR THE HOME BLOCK</div>
          </span>
          <span style={Object.assign({}, mno, { fontSize: 13, color: C.violet, flexShrink: 0 })}>▸</span>
        </button>
      </Card>

      <Card>
        <Eye>Session notes</Eye>
        <textarea value={note || ""} onChange={(e) => setNote(e.target.value)} placeholder="How it went. What slowed. What hurt. Hands at 7pm."
          style={Object.assign({}, bdy, { width: "100%", minHeight: 64, background: C.ink, border: "1px solid " + C.line, borderRadius: 4, color: C.chalk, fontSize: 13, padding: 9, resize: "vertical" })} />
      </Card>
    </div>);
}

/* ================================================================
   FLOW — one block at a time, full screen
   ================================================================ */
function Flow(props) {
  const { macro, week, day, done, setDone, swapped, sparPrev, ready, close } = props;
  const rx = rxFor(week), srcDay = swapped ? "light" : day, own = S[day];
  const real = realBlocks(srcDay, rx);
  const dk = dayKey(macro, week, day), dl = done[dk] || [];
  const [i, setI] = useState(() => { const f = real.findIndex((x) => dl.indexOf(x.L) < 0); return f < 0 ? 0 : f; });
  const b = real[i]; if (!b) return null;
  const isDone = dl.indexOf(b.L) >= 0;
  const effReady = sparPrev && !swapped ? "R" : ready;
  const mark = () => { const cur = done[dk] || []; const n = Object.assign({}, done); const was = cur.indexOf(b.L) >= 0; n[dk] = was ? cur.filter((x) => x !== b.L) : cur.concat([b.L]); setDone(n); buzz(30); if (!was && i < real.length - 1) setTimeout(() => setI(i + 1), 180); };
  return (
    <div style={{ position: "fixed", inset: 0, background: C.ink, zIndex: 60, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 14px 8px", paddingTop: "calc(10px + env(safe-area-inset-top))", borderBottom: "1px solid " + C.line, background: C.slab }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={Object.assign({}, mno, { fontSize: 10, color: C.ash, letterSpacing: 1.2 })}>{own.n} · WK {week} · {dl.length}/{real.length} DONE</span>
          <Btn on={close} c={C.ash} small s={{ minWidth: 44, minHeight: 44 }}>EXIT</Btn>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 9 }}>
          {real.map((x, k) => <div key={x.L} onClick={() => setI(k)} style={{ flex: 1, height: 6, borderRadius: 3, cursor: "pointer", background: dl.indexOf(x.L) >= 0 ? C.moss : k === i ? own.ac : C.line }} />)}
        </div>
      </div>
      <div className="rise" key={i} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 90px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <div style={Object.assign({}, mno, { fontSize: 10, color: C.ash, letterSpacing: 1.4 })}>BLOCK {b.L} · {i + 1} OF {real.length}{v(b.m, rx) ? " · " + v(b.m, rx) + " MIN" : ""}</div>
        <div style={Object.assign({}, dsp, { fontSize: 30, fontWeight: 800, letterSpacing: 1, color: v(b.star, rx) ? C.brass : C.chalk, lineHeight: 1.05, margin: "5px 0 14px" })}>{v(b.star, rx) ? "★ " : ""}{v(b.n, rx)}</div>
        <BlockBody {...props} b={b} rx={rx} ready={effReady} />
        {b.tr ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 14, textAlign: "center", letterSpacing: 1 })}>↓ {b.tr} MIN TRANSITION ↓</div> : null}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "8px 12px", paddingBottom: "calc(8px + env(safe-area-inset-bottom))", borderTop: "1px solid " + C.line, background: C.slab, minHeight: 58 }}>
        <Btn on={() => setI(Math.max(0, i - 1))} c={C.ash} dis={i === 0} s={{ flex: 1, padding: "8px 0", minHeight: 40 }}>◀</Btn>
        <Btn on={mark} c={isDone ? C.line : C.moss} fill={!isDone} s={{ flex: 3, color: isDone ? C.ash : C.ink, fontSize: 15, padding: "8px 0", minHeight: 40 }}>{isDone ? "UNDO" : i === real.length - 1 ? "DONE — FINISH" : "DONE — NEXT"}</Btn>
        <Btn on={() => setI(Math.min(real.length - 1, i + 1))} c={C.ash} dis={i === real.length - 1} s={{ flex: 1, padding: "8px 0", minHeight: 40 }}>▶</Btn>
      </div>
    </div>);
}

/* ================================================================
   TEST DAY — Saturday of week 16
   ================================================================ */
function TestDay({ macro, week, day, done, setDone, log, setLog, maxes, onSetMax, bw, addBody }) {
  const key = (id) => "m" + macro + "w16-test-" + id;
  const g = (id) => (log[key(id)] || {}).w || "";
  const put = (id, val) => { const n = Object.assign({}, log); n[key(id)] = Object.assign({}, n[key(id)], { w: val }); setLog(n); };
  const prev = (id) => { const e = log["m" + (macro - 1) + "w16-test-" + id]; return e && num(e.w); };
  const [tape, setTape] = useState({});
  const dk = dayKey(macro, week, day), isDone = (done[dk] || []).length > 0;
  const commit = () => {
    TESTS.forEach((t) => { if (t.sun) return; const val = num(g(t.id)); if (t.max && val) onSetMax(t.max, t.est ? r25(val * t.est) : val, "test day · M" + macro); });
    if (num(tape.bw)) addBody(Object.assign({}, tape));
    const n = Object.assign({}, done); n[dk] = ["TEST"]; setDone(n); buzz([80, 40, 80]);
  };
  return (
    <div>
      <Card ac={C.cobalt}>
        <Eye c={C.cobalt}>Saturday · week 16 · macrocycle {macro}</Eye>
        <div style={Object.assign({}, dsp, { fontSize: 30, fontWeight: 800, letterSpacing: 1.4, color: C.chalk, lineHeight: 1 })}>TEST DAY</div>
        <Note c={C.chalk}>Most neural first. Full recovery between everything. These are the real numbers — tested fresh after a two-week taper — and every percentage in the next macrocycle recalculates from them.</Note>
        {isDone ? <Chip c={C.moss} s={{ marginTop: 10, display: "inline-block" }}>Saved · maxes updated</Chip> : null}
      </Card>
      {TESTS.filter((x) => !x.sun).map((t, i) => { const pv = prev(t.id), cur = num(g(t.id)); const d = pv && cur ? (cur - pv) / pv * 100 : null; const good = d == null ? null : t.dir === "down" ? d < 0 : d > 0;
        return (
          <Card key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={Object.assign({}, bdy, { fontSize: 14.5, fontWeight: 600, color: C.chalk })}>{i + 1} · {t.n}</span>
              <Chip c={C.ash}>{t.tgt}</Chip>
            </div>
            <Note s={{ marginTop: 2 }}>{t.d}</Note>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 8 }}>
              <div style={{ flex: 1 }}><Lab>Result ({t.u})</Lab><Fld v={g(t.id)} on={(val) => put(t.id, val)} ph="—" /></div>
              <div style={{ flex: 1 }}><Lab>Last macrocycle</Lab><div style={Object.assign({}, mno, { fontSize: 15, color: C.ash, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" })}>{pv != null ? pv + " " + t.u : "—"}</div></div>
              <div style={{ flex: 1 }}><Lab>Change</Lab><div style={Object.assign({}, mno, { fontSize: 15, fontWeight: 700, color: d == null ? C.ash : good ? C.moss : C.oxide, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" })}>{d == null ? "—" : (d > 0 ? "+" : "") + d.toFixed(1) + "%"}</div></div>
            </div>
          </Card>);
      })}
      <Card ac={C.violet}>
        <Eye c={C.violet}>Tape and bodyweight</Eye>
        <div style={{ display: "flex", gap: 6 }}>
          {[["bw", "BODYWEIGHT"], ["arm", "ARM"], ["sh", "SHOULDERS"], ["wa", "WAIST"]].map((k) => <div key={k[0]} style={{ flex: 1 }}><Lab>{k[1]}</Lab><Fld v={tape[k[0]]} on={(val) => setTape(Object.assign({}, tape, { [k[0]]: val }))} ph="—" /></div>)}
        </div>
      </Card>
      <Btn on={commit} c={C.cobalt} fill s={{ width: "100%", fontSize: 16, marginBottom: 10 }}>{isDone ? "SAVE AGAIN" : "SAVE TEST DAY — UPDATE MAXES"}</Btn>
      <Note>Squat and bench singles become the new maxes. A trap bar 3RM × 1.08 becomes the trap bar max. Then 3–4 easy days, and week 1 of the next macrocycle.</Note>
    </div>);
}

/* ================================================================
   WEEK — the map, and where you are on it
   ================================================================ */
function WeekView({ view, setView, current, setCurrent, done, L, openDay, weekDoneMap }) {
  const { macro, week } = view; const rx = rxFor(week), P = PH[rx.ph];
  const move = (d) => { let w = week + d, m = macro; if (w < 1) { if (m <= 1) return; m -= 1; w = L; } if (w > L) { m += 1; w = 1; } setView({ macro: m, week: w }); };
  const isCur = current.macro === macro && current.week === week;
  const wks = Array.from({ length: L }, (_, i) => i + 1);
  const Row = ({ k, val }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line }}>
    <span style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk, flexShrink: 0 })}>{k}</span>
    <span style={Object.assign({}, mno, { fontSize: 10.5, color: C.brass, textAlign: "right" })}>{val}</span></div>;
  return (
    <div>
      <Card ac={P.ac}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Btn on={() => move(-1)} c={C.ash} small s={{ minWidth: 48 }}>◀</Btn>
          <span style={{ textAlign: "center" }}>
            <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, letterSpacing: 1.4 })}>MACROCYCLE {macro}</div>
            <div style={Object.assign({}, dsp, { fontSize: 34, fontWeight: 800, letterSpacing: 1, color: C.chalk, lineHeight: 1.05 })}>WEEK {week}</div>
            <div style={Object.assign({}, dsp, { fontSize: 16, fontWeight: 700, color: P.ac, marginTop: 3, letterSpacing: 1.4 })}>{P.long}</div>
          </span>
          <Btn on={() => move(1)} c={C.brass} small s={{ minWidth: 48 }}>▶</Btn>
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 14 }}>
          {wks.map((n) => { const r = rxFor(n), ph = PH[r.ph]; const sel = n === week; const dn = weekDoneMap && weekDoneMap[n];
            return <div key={n} onClick={() => setView({ macro, week: n })} style={{ flex: 1, height: 30, borderRadius: 3, cursor: "pointer", background: sel ? ph.ac : (r.hell ? "rgba(194,78,51,.35)" : r.dl || r.reload ? "rgba(102,132,90,.35)" : r.test ? "rgba(79,132,168,.45)" : (r.maxSq ? "rgba(210,160,71,.35)" : "rgba(138,149,158,.13)")), border: sel ? "none" : "1px solid " + C.line, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <span style={Object.assign({}, mno, { fontSize: 7, color: sel ? C.ink : C.ash })}>{n}</span>
              {dn != null ? <span style={{ width: 4, height: 4, borderRadius: 2, background: dn >= 1 ? C.moss : dn > 0 ? C.brass : "transparent" }} /> : null}
            </div>; })}
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 7, flexWrap: "wrap" }}>
          {[["MAX SINGLE", "rgba(210,160,71,.6)"], ["DELOAD", "rgba(102,132,90,.6)"], ["TEST", "rgba(79,132,168,.7)"]].concat(L > 16 ? [["HELL WEEK", "rgba(194,78,51,.6)"]] : []).map((x) =>
            <span key={x[0]} style={Object.assign({}, mno, { fontSize: 8, color: C.ash, display: "flex", alignItems: "center", gap: 4 })}><span style={{ width: 9, height: 9, borderRadius: 2, background: x[1], display: "inline-block" }} />{x[0]}</span>)}
        </div>
        {isCur ? <Chip c={C.moss} s={{ marginTop: 12, display: "inline-block" }}>This is the current week</Chip>
          : <Btn on={() => setCurrent(macro, week)} c={C.brass} small s={{ marginTop: 12 }}>MAKE THIS THE CURRENT WEEK</Btn>}
        <Note>{P.note}</Note>
      </Card>

      <Card ac={C.brass}>
        <Eye c={C.brass}>What this week actually is</Eye>
        {rx.hell ? <Note c={C.chalk}>Hell Week. Six flagship tests, one a day. No Optimal 8 volume — the IRON tab runs this week.</Note> : (
          <div>
            <Row k="Squat (Sat)" val={rx.sc} />
            <Row k="Bench (Mon)" val={rx.upperC ? "Upper circuit · 4 × 2 @ 85%" : rx.maxBe ? rx.sets + " × " + rx.reps + " @ " + rx.pct + "% · max is Sunday" : (rx.bsc || rx.sc)} />
            <Row k="Jump circuit" val={rx.cr + " round" + (rx.cr > 1 ? "s" : "") + " · 2 @ " + rx.cpct + "%" + (rx.ph === "b3" ? " · +assisted jump" : "")} />
            <Row k="Sprints" val={rx.spr + " × 20m" + (rx.sprPct < 100 ? " @ 90%" : "")} />
            <Row k="Jumps (Sat)" val={(rx.jump === "AEL" ? "Loaded drop jump " : "Depth jump ") + rx.js[0] + " × " + rx.js[1]} />
            <Row k="Trap bar" val={rx.tb.sc} />
            <Row k="Push press" val={rx.pp && rx.pp.sc ? rx.pp.sc : rx.maxBe ? "skipped — squat max day" : "—"} />
            <Row k="Nordics" val={rx.nor ? rx.nor[0] + " × " + rx.nor[1] : "—"} />
            <Row k="Punch throws" val={rx.vec + " rounds"} />
            <Row k="Rows / split squat" val={(rx.acc <= 2 ? 2 : 3) + "–" + (rx.acc <= 2 ? 3 : 4) + " sets"} />
            <Row k="Tuesday bike" val={ENG[rx.eng] ? ENG[rx.eng].n : "—"} />
            <Row k="Thursday bike" val={ENG[rx.eng2] ? ENG[rx.eng2].n : "—"} />
            <Row k="Pause squat (Wed)" val={rx.pq ? rx.pq.sc : "—"} />
            <Row k="Fight sim" val={rx.sim.skip ? "skip" : (rx.sim.rounds || 6) + " rds · " + rx.sim.rest + "s" + (rx.sim.tested ? " · TESTED" : "")} />
            <Row k="Easy ride" val={"Fri " + friMin(rx) + " min"} />
            
            <Row k="Max singles" val={rx.maxSq ? "Squat Sat · Bench Sun" : rx.test ? "TEST DAY" : "none"} />
            {rx.cal ? <Note c={C.brass} bold>Calibration week: ramp to a 3RM on the trap bar (Wed) and the push press (Sat). The app turns them into maxes.</Note> : null}
            {rx.mid ? <Note c={C.oxide} bold>Mid-check. Not your real numbers — you are fatigued. A direction check.</Note> : null}
            {rx.dl ? <Note c={C.moss} bold>Deload. Sprints and jumps stay in at reduced volume — the 5-day residual doesn't pause.</Note> : null}
          </div>)}
      </Card>

      {DAYS.map((d) => { const dk = dayKey(macro, week, d); const n = (done[dk] || []).length; const tot = rx.hell ? 0 : (d === "sat" && rx.test ? 1 : realBlocks(d, rx).length); const full = tot > 0 && n >= tot;
        return (
          <Card key={d} ac={full ? C.moss : S[d].ac} s={{ padding: 0, opacity: rx.hell ? .4 : 1 }}>
            <button onClick={() => openDay(d)} style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, textAlign: "left", background: "transparent", border: "none", padding: "11px 13px", cursor: "pointer" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 700, letterSpacing: 1.2, color: C.chalk })}>{S[d].n}{S[d].pm ? " · PM" : ""}</span>
                  <span style={Object.assign({}, mno, { fontSize: 9.5, color: S[d].ac })}>{rx.hell ? "—" : d === "sat" && rx.test ? "TEST DAY" : v(S[d].m, rx) + " MIN"}</span>
                </div>
                <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.ash, marginTop: 3 })}>{d === "sat" && rx.test ? "Sprint · jump · throws · squat · bench · pull · tape" : S[d].t}</div>
              </span>
              <span style={Object.assign({}, mno, { fontSize: 10, color: full ? C.moss : n ? C.brass : C.ash, flexShrink: 0 })}>{tot ? n + "/" + tot : ""}</span>
            </button>
          </Card>);
      })}
    </div>);
}

/* ================================================================
   TRACK — numbers, progress, body
   ================================================================ */
const LIFT_LOC = { squat: ["sat", "squat"], bench: ["mon", "bench"], tbdl: ["wed", "tbdl"], pp: ["sat", "pushpress"] };
function topSet(e) { if (!e || !e.sets) return null; let m = null; e.sets.forEach((s) => { if (s.ok && num(s.w) != null) m = m == null ? num(s.w) : Math.max(m, num(s.w)); }); return m; }

function Bars({ data, unit, color }) {
  const vals = data.map((d) => d[1]); if (!vals.length) return <Note s={{ fontStyle: "italic" }}>Nothing logged yet.</Note>;
  const mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), span = mx - mn || mx || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 84, marginTop: 10 }}>
      {data.map((d, i) => { const rel = (d[1] - mn) / span, h = 22 + rel * 52, last = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0 }}>
            <div style={Object.assign({}, mno, { fontSize: 9.5, fontWeight: 700, color: last ? (color || C.brass) : C.chalk, marginBottom: 3 })}>{d[1]}</div>
            <div style={{ width: "100%", height: h, background: last ? (color || C.brass) : C.line, borderRadius: "3px 3px 0 0" }} />
            <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, marginTop: 4, whiteSpace: "nowrap" })}>{d[0]}</div>
          </div>);
      })}
    </div>);
}

function Track({ current, maxes, onSetMax, maxHist, log, body, addBody, done, L }) {
  const [sub, setSub] = useState("numbers");
  const [edit, setEdit] = useState({});
  const [tape, setTape] = useState({});
  const macro = current.macro;
  const testVal = (m, id) => { const e = log["m" + m + "w16-test-" + id]; return e ? num(e.w) : null; };
  const fade = (m, w) => { const a = log["m" + m + "w" + w + "-sun-fs_rd1"], b = log["m" + m + "w" + w + "-sun-fs_rd6"];
    return a && b && num(a.w) && num(b.w) ? (num(a.w) - num(b.w)) / num(a.w) * 100 : null; };
  return (
    <div>
      <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
        {[["numbers", "NUMBERS"], ["progress", "PROGRESS"], ["body", "BODY"]].map((x) => <button key={x[0]} onClick={() => setSub(x[0])}
          style={Object.assign({}, dsp, { flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "9px 0", borderRadius: 4, cursor: "pointer", background: sub === x[0] ? C.brass : "transparent", color: sub === x[0] ? C.ink : C.ash, border: "1px solid " + (sub === x[0] ? C.brass : C.line) })}>{x[1]}</button>)}
      </div>

      {sub === "numbers" ? (
        <div>
          <Card ac={C.brass}>
            <Eye c={C.brass}>Your four numbers — every weight in the app comes off these</Eye>
            {MAXES.map((m) => { const cur = num(maxes[m[0]]); const h = maxHist.filter((x) => x.lift === m[0]);
              return (
                <div key={m[0]} style={{ padding: "10px 0", borderBottom: "1px solid " + C.line }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ flex: 1 }}>
                      <div style={Object.assign({}, bdy, { fontSize: 14.5, fontWeight: 600, color: C.chalk })}>{m[1]}</div>
                      <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, marginTop: 2 })}>{h.length ? "LAST SET " + h[0].d + " · " + h[0].src.toUpperCase() : cur ? "ENTERED BY HAND" : "NOT SET — week 1 finds it, or enter a number"}</div>
                    </span>
                    <span style={Object.assign({}, mno, { fontSize: 22, fontWeight: 700, color: cur ? C.brass : C.ash })}>{cur ? cur + " kg" : "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <div style={{ flex: 1 }}><Fld v={edit[m[0]]} on={(val) => setEdit(Object.assign({}, edit, { [m[0]]: val }))} ph="new max (kg)" /></div>
                    <Btn small c={C.brass} dis={!num(edit[m[0]])} on={() => { onSetMax(m[0], num(edit[m[0]]), "entered by hand"); setEdit(Object.assign({}, edit, { [m[0]]: "" })); }}>SAVE</Btn>
                  </div>
                  {h.length > 1 ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 6 })}>{h.slice(0, 4).map((x) => x.kg + "kg").join(" ← ")}</div> : null}
                </div>);
            })}
            <Note>Squat and bench: your best single. Trap bar and push press: week 1 finds them (hard triple × 1.08), or enter one here.</Note>
          </Card>
          <Card ac={C.cobalt}>
            <Eye c={C.cobalt}>Fight-sim fade — scored weeks 4, 9 and 14</Eye>
            {[4, 9, 14].map((w) => { const f = fade(macro, w);
              return <div key={w} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + C.line }}>
                <span style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk })}>Week {w}</span>
                <span style={Object.assign({}, mno, { fontSize: 13, fontWeight: 700, color: f == null ? C.ash : f <= 5 ? C.moss : f <= 10 ? C.brass : C.oxide })}>{f == null ? "—" : f.toFixed(1) + "% drop"}</span></div>; })}
            <Note>Round 6 against round 1. Under 5% is excellent, under 10% is the standard. The whole game is pushing it toward zero.</Note>
          </Card>
        </div>) : null}

      {sub === "progress" ? (
        <div>
          <Card ac={C.moss}>
            <Eye c={C.moss}>Test day, macrocycle by macrocycle</Eye>
            <Note s={{ marginTop: 0 }}>Every week-16 test, charted. Target +3–6% on the lifts, +3–5% on throws and jump, 1–3% off the sprint — fresh, three times a year.</Note>
          </Card>
          {TESTS.filter((t) => !t.opt).map((t) => {
            const h = []; for (let m = 1; m <= macro; m++) { if (t.sun) { const b0 = log["m" + m + "w1-sun-bike20"]; if (b0 && num(b0.w) != null) h.push(["M" + m + "·w1", num(b0.w)]); const b1 = log["m" + m + "w16-sun-bike20"]; if (b1 && num(b1.w) != null) h.push(["M" + m + "·w16", num(b1.w)]); continue; } const val = testVal(m, t.id); if (val != null) h.push(["M" + m, val]); }
            const d = h.length > 1 ? (h[h.length - 1][1] - h[h.length - 2][1]) / h[h.length - 2][1] * 100 : null;
            const good = d == null ? null : t.dir === "down" ? d < 0 : d > 0;
            return (
              <Card key={t.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={Object.assign({}, bdy, { fontSize: 14, fontWeight: 600, color: C.chalk })}>{t.n}</span>
                  <span style={Object.assign({}, mno, { fontSize: 10.5, color: d == null ? C.ash : good ? C.moss : C.oxide })}>{d == null ? "" : (d > 0 ? "+" : "") + d.toFixed(1) + "%"}</span>
                </div>
                <Bars data={h} color={C.brass} />
              </Card>);
          })}
          <Card ac={C.brass}>
            <Eye c={C.brass}>Top sets this macrocycle</Eye>
            {MAXES.map((m) => { const loc = LIFT_LOC[m[0]]; const h = [];
              for (let w = 1; w <= L; w++) { const ts = topSet(log["m" + macro + "w" + w + "-" + loc[0] + "-" + loc[1]]); if (ts != null) h.push(["w" + w, ts]); }
              return <div key={m[0]} style={{ marginBottom: 6 }}><div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{m[1]}</div>{h.length ? <Bars data={h.slice(-8)} /> : <Note s={{ fontStyle: "italic", marginTop: 2 }}>No sets confirmed yet.</Note>}</div>; })}
          </Card>
          <Card ac={C.cobalt}>
            <Eye c={C.cobalt}>Sessions completed — macrocycle {macro}</Eye>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
              {Array.from({ length: L }, (_, i) => i + 1).map((w) => { const rx = rxFor(w);
                return (
                  <div key={w} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, width: 20 })}>{w}</span>
                    {DAYS.map((d) => { const dk = dayKey(macro, w, d); const n = (done[dk] || []).length; const tot = rx.hell ? 0 : (d === "sat" && rx.test ? 1 : realBlocks(d, rx).length);
                      const f = tot ? n / tot : 0;
                      return <div key={d} style={{ flex: 1, height: 12, borderRadius: 2, background: tot === 0 ? "transparent" : f >= 1 ? C.moss : f > 0 ? "rgba(210,160,71,.55)" : C.card, border: "1px solid " + C.line }} />; })}
                  </div>);
              })}
            </div>
            <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, marginTop: 5, display: "flex", justifyContent: "space-between" })}>{DAYS.map((d) => <span key={d} style={{ flex: 1, textAlign: "center" }}>{DSH[d][0]}</span>)}</div>
          </Card>
          <Card ac={C.oxide}>
            <Eye c={C.oxide}>If a test stalls — two macrocycles flat, not one</Eye>
            {[["Max strength", "Block 2 wasn't heavy enough, or Block 1 didn't build enough. Add a set to the main lifts in weeks 1–4."],
              ["Speed / jump", "Block 3 carried fatigue in. Make week 10's easy week genuinely easy."],
              ["Size", "Not programming. Volume or food."],
              ["Fight-sim fade", "Aerobic base eroded. Guard the Friday ride and both bike sessions."],
              ["Everything", "Recovery, not programming. Take a full week off."]].map((r) => (
              <div key={r[0]} style={{ padding: "8px 0", borderBottom: "1px solid " + C.line }}>
                <div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{r[0]}</div>
                <div style={Object.assign({}, bdy, { fontSize: 12, color: C.ash, marginTop: 2, lineHeight: 1.45 })}>{r[1]}</div>
              </div>))}
          </Card>
        </div>) : null}

      {sub === "body" ? (
        <div>
          <Card ac={C.violet}>
            <Eye c={C.violet}>Tape — every 4–6 weeks</Eye>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {[["bw", "WEIGHT"], ["arm", "ARM"], ["sh", "SHOULDERS"]].map((k) => <div key={k[0]} style={{ flex: 1 }}><Lab>{k[1]}</Lab><Fld v={tape[k[0]]} on={(val) => setTape(Object.assign({}, tape, { [k[0]]: val }))} ph="—" /></div>)}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[["ch", "CHEST"], ["nk", "NECK"], ["wa", "WAIST"]].map((k) => <div key={k[0]} style={{ flex: 1 }}><Lab>{k[1]}</Lab><Fld v={tape[k[0]]} on={(val) => setTape(Object.assign({}, tape, { [k[0]]: val }))} ph="—" /></div>)}
            </div>
            <Btn c={C.violet} fill s={{ width: "100%" }} dis={!num(tape.bw)} on={() => { addBody(tape); setTape({}); }}>SAVE MEASUREMENTS</Btn>
            <Note c={C.oxide}>If the waist climbs faster than shoulders and arms, cut 100–150 kcal. If bodyweight drifts down with training unchanged, eat more.</Note>
          </Card>
          {body.slice(0, 8).map((e, i) => (
            <Card key={i} s={{ padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={Object.assign({}, mno, { fontSize: 10, color: C.ash })}>{e.d}</span>
                <span style={Object.assign({}, mno, { fontSize: 11, color: C.chalk })}>{e.bw} kg{e.arm ? " · arm " + e.arm : ""}{e.wa ? " · waist " + e.wa : ""}</span>
              </div>
            </Card>))}
        </div>) : null}
    </div>);
}

/* ================================================================
   PLAN — the reference, collapsible
   ================================================================ */
function PlanView() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {PLAN.map((sec, i) => (
        <Card key={i} s={{ padding: 0 }} ac={sec[1]}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", padding: "13px 14px", cursor: "pointer", textAlign: "left" }}>
            <span style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 700, letterSpacing: 1.1, color: C.chalk })}>{sec[0]}</span>
            <span style={Object.assign({}, mno, { fontSize: 15, color: C.ash })}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i ? <div className="rise" style={{ padding: "0 14px 14px" }}>
            {sec[2].map((ln, j) => <div key={j} style={Object.assign({}, bdy, { fontSize: 12.5, color: ln[1] ? C.chalk : C.ash, padding: "5px 0", lineHeight: 1.5, fontWeight: ln[1] ? 600 : 400 })}>{ln[0]}</div>)}
          </div> : null}
        </Card>))}
    </div>);
}

/* ================================================================
   SETTINGS
   ================================================================ */
function Settings({ st, setSt, current, L, exportData, importData, close }) {
  const [io, setIo] = useState(""); const [showIo, setShowIo] = useState(false); const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState(""); const fileRef = useRef(null);
  const upd = (patch) => setSt(Object.assign({}, st, patch));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(16,20,22,.94)", zIndex: 95, overflowY: "auto" }} onClick={close}>
      <div className="rise" onClick={(e) => e.stopPropagation()} style={{ background: C.card, maxWidth: 640, margin: "24px auto", marginTop: "calc(24px + env(safe-area-inset-top))", marginBottom: "calc(24px + env(safe-area-inset-bottom))", borderRadius: 8, border: "1px solid " + C.line, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 800, letterSpacing: 1.4, color: C.chalk })}>SETTINGS</span>
          <Btn on={close} c={C.ash} small s={{ minWidth: 44, minHeight: 44 }}>CLOSE</Btn>
        </div>
        <Eye>Schedule</Eye>
        <Lab>Monday of week 1, macrocycle {st.macroBase}</Lab>
        <Fld type="date" v={st.start} on={(val) => { if (val) upd({ start: iso(mondayOf(parseISO(val))) }); }} a="left" />
        <Note>Today reads as <span style={{ color: C.brass }}>macro {current.macro} · week {current.week}</span>. If that's wrong, open the WEEK tab, find the right week and tap "make this the current week".</Note>
        <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
        <Eye>Cycle</Eye>
        {[["iron", "Iron Mind weeks 17–18 (Hell Week + Reload)", "On = 18-week cycle. Off = 16 weeks, straight from test day into week 1 of the next cycle."],
          ["sound", "Bell sounds on the timers", "Round bells and 3-2-1 pips. Vibration stays on either way."],
          ["autoRest", "Auto rest clock", "Confirming a set starts that exercise's rest countdown by itself."]].map((x) => (
          <div key={x[0]} onClick={() => upd({ [x[0]]: !st[x[0]] })} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.line, cursor: "pointer" }}>
            <span style={{ width: 40, height: 24, borderRadius: 12, background: st[x[0]] ? C.moss : C.ink, border: "1px solid " + (st[x[0]] ? C.moss : C.line), position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: st[x[0]] ? 18 : 2, width: 18, height: 18, borderRadius: 9, background: C.chalk, transition: "left .15s" }} /></span>
            <span style={{ flex: 1 }}>
              <div style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{x[1]}</div>
              <div style={Object.assign({}, bdy, { fontSize: 11.5, color: C.ash, marginTop: 2 })}>{x[2]}</div>
            </span>
          </div>))}
        <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
        <Eye>Backup</Eye>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={async () => { setMsg(""); setIo(await exportData()); setShowIo(true); }}>EXPORT</Btn>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={() => { setMsg(""); setShowIo(true); }}>IMPORT</Btn>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={async () => { setMsg("");
            const r = await shareOrDownload(await exportData());
            setMsg(r === "shared" ? "Backup sent." : r === "downloaded" ? "Backup file saved." : r === "cancelled" ? "Cancelled." : "Couldn't make the file — use EXPORT and paste the text somewhere safe."); }}>EXPORT TO FILE</Btn>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={() => { setMsg(""); if (fileRef.current) fileRef.current.click(); }}>IMPORT FROM FILE</Btn>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }} aria-hidden="true" tabIndex={-1}
          onChange={async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
            try { const txt = await readTextFile(f); JSON.parse(txt); importData(txt); } catch (err) { setMsg("That file isn't an Optimal 8 backup."); } }} />
        <Note>EXPORT TO FILE saves a .json backup you can keep in Files or send to yourself. IMPORT FROM FILE loads one back in.</Note>
        {msg ? <Note c={C.brass}>{msg}</Note> : null}
        {showIo ? <div style={{ marginTop: 8 }}>
          <textarea value={io} onChange={(e) => setIo(e.target.value)} placeholder="Paste a backup here, then tap load"
            style={Object.assign({}, mno, { width: "100%", minHeight: 90, background: C.ink, border: "1px solid " + C.line, borderRadius: 4, color: C.chalk, fontSize: 10, padding: 8 })} />
          <Btn small c={C.cobalt} fill s={{ width: "100%", marginTop: 6 }} on={() => importData(io)}>LOAD THIS BACKUP</Btn>
        </div> : null}
        <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
        {!confirm ? <Btn small c={C.oxide} s={{ width: "100%" }} on={() => setConfirm(true)}>RESET ALL DATA…</Btn>
          : <div style={{ display: "flex", gap: 6 }}>
            <Btn small c={C.ash} s={{ flex: 1 }} on={() => setConfirm(false)}>KEEP MY DATA</Btn>
            <Btn small c={C.oxide} fill s={{ flex: 1 }} on={() => importData("{}")}>WIPE EVERYTHING</Btn>
          </div>}
      </div>
    </div>);
}

/* ================================================================
   IRON — the Forge (weekly benchmark) and Hell Week, re-placed for Optimal 8
   ================================================================ */
const FORGE = [
  { w: 1, dom: "GRIP", test: "Farmer's hold (50% BW/hand) + dead hang", mins: 15, max: 10, fit: "ok",
    place: "SUNDAY — replaces the Core + Hands finisher.",
    tests: [
      { k: "hold", n: "Farmer's Hold", u: "seconds", load: 0.5, rows: [[30, 1], [45, 2], [60, 3], [90, 4]], top: 5, table: "<30s=1 · 30–44=2 · 45–59=3 · 60–89=4 · 90+=5" },
      { k: "hang", n: "Dead Hang", u: "seconds", rows: [[45, 1], [75, 2], [105, 3], [135, 4]], top: 5, table: "<45s=1 · 45–74=2 · 75–104=3 · 105–134=4 · 135+=5" }] },
  { w: 2, dom: "BARBELL ENDURANCE", test: "The complex — 20 min cap, 40% BW", mins: 25, max: 15, fit: "warn",
    place: "TUESDAY — replaces the bike session entirely. Never both.",
    why: "A big metabolic hit. This replaces Tuesday's engine so the week still has one peak conditioning day, not two.",
    tests: [{ k: "rounds", n: "Rounds completed", u: "rounds", load: 0.4, rows: [[4, 3], [6, 6], [8, 9], [10, 12]], top: 15, table: "<4=3 · 4–5=6 · 6–7=9 · 8–9=12 · 10+=15" }] },
  { w: 3, dom: "BREATH UNDER FATIGUE", test: "Nasal-only threshold", mins: 20, max: 10, fit: "ok",
    place: "TUESDAY — replaces the bike session.",
    tests: [{ k: "nasal", n: "Nasal-Only Threshold", u: "minutes", rows: [[6, 2], [10, 4], [14, 6], [18, 8]], top: 10, table: "<6min=2 · 6–9=4 · 10–13=6 · 14–17=8 · 18+=10" }] },
  { w: 4, dom: "LOAD BEARING", test: "Sled push/drag — 15 min max distance", mins: 20, max: 15, fit: "warn",
    place: "WEDNESDAY — replaces the sled sprints. Never both.",
    why: "Direct collision with Wednesday's sled sprints. This IS your sled work that week.",
    tests: [{ k: "sled", n: "Total distance", u: "metres", load: 1.0, rows: [[200, 3], [300, 6], [400, 9], [500, 12]], top: 15, table: "<200m=3 · 200–299=6 · 300–399=9 · 400–499=12 · 500+=15" }] },
  { w: 5, dom: "ISOMETRIC", test: "Plank + wall sit + hollow hold", mins: 20, max: 9, fit: "ok",
    place: "SUNDAY — replaces the Core + Hands finisher.",
    tests: [
      { k: "plank", n: "Plank", u: "seconds", rows: [[120, 1], [240, 2]], top: 3, table: "4+min=3 · 2–4min=2 · <2min=1" },
      { k: "wall", n: "Wall Sit", u: "seconds", rows: [[90, 1], [180, 2]], top: 3, table: "3+min=3 · 90s–3min=2 · <90s=1" },
      { k: "hollow", n: "Hollow Hold", u: "seconds", rows: [[45, 1], [90, 2]], top: 3, table: "90+s=3 · 45–90=2 · <45=1" }] },
  { w: 6, dom: "ENGINE", test: "20 min max distance", mins: 25, max: 15, fit: "warn",
    place: "TUESDAY — replaces the bike session entirely.",
    why: "A 20-minute maximal effort — one peak engine day that week, not two.",
    tests: [{ k: "dist", n: "20 min distance (rower standard)", u: "metres", rows: [[4500, 3], [5000, 6], [5500, 9], [6000, 12]], top: 15, table: "<4500m=3 · 4500–4999=6 · 5000–5499=9 · 5500–5999=12 · 6000+=15" }] },
];
const FRULES = [
  ["One benchmark per week. Never two.", 0],
  ["It REPLACES part of a session you were already doing — never added on top. That's what keeps this inside a 9-hour week.", 1],
  ["Same day each week. Consistency of timing matters more than which day.", 0],
  ["Never on a max-single week (4 or 9) if it lands on a heavy day.", 1],
  ["Log the number immediately. Not later.", 0],
  ["Beaten up, on an easy week, or ill? Skip it. A benchmark in a bad state pollutes the trend.", 0],
  ["Skip the Forge entirely in weeks 15–16. A maximal benchmark is the opposite of a taper.", 1],
];
function fsc(vv, rows, top) { const n = num(vv); if (n == null) return null; for (let i = 0; i < rows.length; i++) if (n < rows[i][0]) return rows[i][1]; return top; }

function Forge({ fweek, setFweek, forge, setForge, bw, week }) {
  const [raw, setRaw] = useState({}); const [note, setNote] = useState("");
  const cur = FORGE[(fweek - 1) % 6];
  const pts = (t) => fsc(raw[t.k], t.rows, t.top);
  const score = cur.tests.reduce((a, t) => a + (pts(t) || 0), 0);
  const any = cur.tests.some((t) => pts(t) !== null);
  const taper = week >= 15 && week <= 16;
  const commit = () => { if (!any) return;
    const next = [{ date: new Date().toISOString().slice(0, 10), w: cur.w, dom: cur.dom, score, max: cur.max, note, mw: week }].concat(forge);
    setForge(next); setRaw({}); setNote(""); setFweek((fweek % 6) + 1); buzz([60, 40, 60]); };
  const byDom = {}; forge.forEach((e) => { if (!byDom[e.dom]) byDom[e.dom] = []; byDom[e.dom].push(e); });
  return (
    <div>
      {taper ? <Card ac={C.oxide}><div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 800, letterSpacing: 1.3, color: C.oxide })}>SKIP THE FORGE — TAPER WEEK</div><Note c={C.chalk}>Weeks 15–16 drop volume and hold intensity. A maximal benchmark is the opposite of that. Resume in week 1.</Note></Card> : null}
      <Card ac={C.brass}>
        <Eye c={C.brass}>This week's benchmark</Eye>
        <div style={Object.assign({}, dsp, { fontSize: 23, fontWeight: 800, letterSpacing: 1.3, color: C.chalk })}>WEEK {cur.w} — {cur.dom}</div>
        <Note c={C.chalk}>{cur.test}</Note>
        <div style={Object.assign({}, mno, { fontSize: 10, color: C.ash, marginTop: 4 })}>{cur.mins} MIN · SCORED /{cur.max}</div>
        <div style={{ background: C.ink, border: "1px solid " + (cur.fit === "warn" ? C.oxide : C.moss), borderRadius: 5, padding: "10px 12px", marginTop: 12 }}>
          <Eye c={cur.fit === "warn" ? C.oxide : C.moss} s={{ marginBottom: 4 }}>Where it goes</Eye>
          <div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk, lineHeight: 1.45 })}>{cur.place}</div>
          {cur.why ? <Note>{cur.why}</Note> : null}
        </div>
        <div style={{ height: 1, background: C.line, margin: "13px 0" }} />
        {cur.tests.map((t) => { const p = pts(t), kg = bw && t.load ? Math.round(bw * t.load) : null;
          return (
            <div key={t.k} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{t.n}{kg ? " · " + kg + " kg" : ""}</span>
                <span style={Object.assign({}, mno, { fontSize: 13, fontWeight: 700, color: C.brass })}>{p !== null ? p + " pts" : ""}</span>
              </div>
              <div style={{ marginTop: 6 }}><Lab>{t.u}</Lab><Fld v={raw[t.k]} on={(vv) => setRaw(Object.assign({}, raw, { [t.k]: vv }))} ph="—" /></div>
              <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 4 })}>{t.table}</div>
            </div>);
        })}
        <div style={{ marginBottom: 11 }}><Lab>Note — first quit signal vs where you actually stopped</Lab><Fld v={note} on={setNote} ph="—" a="left" /></div>
        {any ? <div style={{ background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "10px 12px", marginBottom: 10, textAlign: "center" }}><span style={Object.assign({}, mno, { fontSize: 28, fontWeight: 700, color: C.brass })}>{score}</span><span style={Object.assign({}, mno, { fontSize: 12, color: C.ash })}>/{cur.max}</span></div> : null}
        <Btn on={commit} c={C.brass} fill s={{ width: "100%" }} dis={!any}>LOG &amp; ADVANCE</Btn>
      </Card>
      <Card>
        <Eye>The six-week rotation — tap to jump</Eye>
        {FORGE.map((f) => (
          <div key={f.w} onClick={() => setFweek(f.w)} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderTop: f.w > 1 ? "1px solid " + C.line : "none", cursor: "pointer", opacity: f.w === cur.w ? 1 : .55 }}>
            <div style={{ flex: 1 }}>
              <div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: f.w === cur.w ? C.brass : C.chalk })}>WK {f.w} · {f.dom}</div>
              <div style={Object.assign({}, bdy, { fontSize: 11.5, color: C.ash, marginTop: 2 })}>{f.test}</div>
              <div style={Object.assign({}, mno, { fontSize: 8.5, color: f.fit === "warn" ? C.oxide : C.moss, marginTop: 3 })}>{f.place.split("—")[0].trim()}</div>
            </div>
            <span style={Object.assign({}, mno, { fontSize: 10, color: C.ash, flexShrink: 0 })}>{f.mins}m</span>
          </div>))}
      </Card>
      {Object.keys(byDom).length ? (
        <Card>
          <Eye c={C.moss}>Trend by domain — watch for the flat line</Eye>
          {Object.keys(byDom).map((dom) => (
            <div key={dom} style={{ marginBottom: 13 }}>
              <div style={Object.assign({}, bdy, { fontSize: 12.5, fontWeight: 600, color: C.chalk, marginBottom: 5 })}>{dom}</div>
              <div style={{ display: "flex", gap: 4 }}>
                {byDom[dom].slice(0, 6).reverse().map((x, i) => (
                  <div key={i} style={{ flex: 1, background: C.ink, border: "1px solid " + C.line, borderRadius: 3, padding: "6px 2px", textAlign: "center" }}>
                    <div style={Object.assign({}, mno, { fontSize: 13, fontWeight: 700, color: C.chalk })}>{x.score}</div>
                    <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash })}>{x.date.slice(5)}</div>
                  </div>))}
              </div>
            </div>))}
          <Note s={{ fontStyle: "italic" }}>The flat line is your weak link, and it decides what the next block leans on. That's the whole reason for measuring.</Note>
        </Card>) : null}
      <Card ac={C.oxide}>
        <Eye c={C.oxide}>The rules</Eye>
        {FRULES.map((r, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12.5, color: r[1] ? C.chalk : C.ash, padding: "7px 0", borderBottom: i < FRULES.length - 1 ? "1px solid " + C.line : "none", lineHeight: 1.45, fontWeight: r[1] ? 600 : 400 })}>{r[0]}</div>)}
      </Card>
      <Card>
        <Eye c={C.cobalt}>Monthly gauntlet</Eye>
        <Note s={{ marginTop: 0 }}>Once a month, run <span style={{ color: C.chalk }}>three of the six tests back-to-back</span> — 10 min rest between, scored out of 45, Saturday only. The Gauntlet IS that week's benchmark; never both. The gap between a test done fresh and the same test inside a Gauntlet is the most honest resilience number you own — watch it narrow.</Note>
      </Card>
    </div>);
}

/* ---------- Hell Week ---------- */
const HWT = {
  1: { n: "PROVING GROUND", col: C.moss, freq: "Every 8–12 weeks", tax: 50, gate: "None — this is your baseline. Run it first, always.",
    mods: ["Full recovery between the tests within a day. 10 min between Day 1's three tests.", "★ DAILY TAX — 50 burpees every morning, before anything else. Unscored. Not optional."] },
  2: { n: "THE CRUCIBLE", col: C.brass, freq: "Every 12–16 weeks", tax: 100, gate: "60+ of 120 on Proving Ground, run at least twice.",
    mods: ["Day 1 — rest drops to 3 min. Hang and carry performed pre-fatigued.", "Day 2 — load rises to 50% bodyweight.", "Day 3 — only 5 min between the threshold and the max hold. The hold will be worse. That's the point: fatigued capacity is real capacity.", "Day 4 — unchanged. A 20-min max effort is already at the ceiling of what's safe to intensify.", "Day 5 — 20 minutes instead of 15. Distance standards +25% for the same points.", "Day 6 — rest drops to 5 min. Full 24hr fast. Tests moved deep into the fasted window.", "★ DAILY TAX DOUBLES — 100 burpees every morning."] },
  3: { n: "KOKORO", col: C.oxide, freq: "1–2× per year MAXIMUM", tax: 200, gate: "84+ of 120 on Crucible · no injuries or missed sessions across two consecutive Crucible weeks.",
    mods: ["★ DOUBLE SESSIONS — each day gets a second session 8+ hours later, repeating that day's flagship test. 60% of the morning result is the minimum, or the day scores zero.", "Daily Tax: 100 burpees morning, 100 evening.", "No caffeine all week.", "Cold finish — every session ends with 3 min in the coldest shower available, nasal breathing throughout.", "Silence 60 min every evening, all seven days.", "Day 7 is NOT rest — a 90-minute unbroken effort at conversational pace. No music, no clock-watching.", "A Kokoro week scoring 90+ of 120 is a serious result."] },
};
const HWD = [
  { d: 1, n: "GRIP & ISOMETRIC FORTITUDE", col: C.oxide,
    m: "Grip failure announces itself early and lies about how close it is. When your hands start screaming, the drill is FIVE MORE SECONDS — not 'finish the test', just five. Then five again. That stacking of small refusals is the actual rep.",
    t: [{ k: "hold", n: "Farmer's Hold", u: "seconds", load: 0.5, ln: "50% BW per hand", rows: [[30, 1], [45, 2], [60, 3], [90, 4]], top: 5, tbl: "<30=1 · 30–44=2 · 45–59=3 · 60–89=4 · 90+=5" },
      { k: "hang", n: "Dead Hang ★ logs your Decay baseline", u: "seconds", ln: "bodyweight, no straps", rows: [[45, 1], [75, 2], [105, 3], [135, 4]], top: 5, tbl: "<45=1 · 45–74=2 · 75–104=3 · 105–134=4 · 135+=5" },
      { k: "carry", n: "Farmer's Carry", u: "metres", load: 0.35, ln: "35% BW per hand", rows: [[100, 1], [200, 2], [300, 3], [400, 4]], top: 5, tbl: "<100=1 · 100–199=2 · 200–299=3 · 300–399=4 · 400+=5" }] },
  { d: 2, n: "BARBELL ENDURANCE", col: C.brass, sub: "THE BAR DOESN'T TOUCH THE FLOOR",
    pre: "One round: 3 deadlifts → 3 bent-over rows → 3 hang cleans → 3 front squats → 3 push presses → 3 back squats. 18 reps unbroken, bar never grounded. Rest holding the bar in any position — the moment it touches the floor the test is over. 20-minute cap.",
    m: "This is where overthinking shows up as 'how many rounds left'. Don't count forward. One round exists at a time; nothing after it is real yet.",
    t: [{ k: "rounds", n: "Rounds completed", u: "rounds", load: 0.4, ln: "40% BW on the bar", rows: [[4, 3], [6, 6], [8, 9], [10, 12]], top: 15, tbl: "<4=3 · 4–5=6 · 6–7=9 · 8–9=12 · 10+=15" }],
    ret: { k: "r3", n: "★ RETENTION R3 — heavy single immediately after", maxk: "squat", pct: 85 } },
  { d: 3, n: "BREATH CONTROL UNDER FATIGUE", col: C.cobalt,
    pre: "The direct measure of whether your breath work has transferred into your body under stress.",
    m: "On the threshold test, mouth-breathing is usually a mental cave before it's a physical necessity. Be honest about which it was — that honesty is worth more than the score.",
    t: [{ k: "nasal", n: "Nasal-Only Threshold", u: "minutes", ln: "rower/ski/bike · +1 notch every 2 min until forced to open your mouth", rows: [[6, 2], [10, 4], [14, 6], [18, 8]], top: 10, tbl: "<6=2 · 6–9=4 · 10–13=6 · 14–17=8 · 18+=10" },
      { k: "hold2", n: "Seated Max Breath Hold", u: "seconds", ln: "min 15 min after · seated, dry, still. NEVER standing, never in water.", rows: [[45, 1], [60, 2], [90, 3], [120, 4]], top: 5, tbl: "<45=1 · 45–59=2 · 60–89=3 · 90–119=4 · 120+=5" }] },
  { d: 4, n: "ENGINE", col: C.moss,
    pre: "20 minutes, maximum distance, ONE modality. Same one every attempt forever. No pacing plan. Go and find out.",
    m: "Minutes 12–16 is where the mind starts negotiating — 'ease off, you've made your point'. Note honestly whether you held pace through that window. THAT'S the real result; the distance is secondary.",
    t: [{ k: "dist", n: "20 min distance", u: "metres (rower standard)", rows: [[4500, 3], [5000, 6], [5500, 9], [6000, 12]], top: 15, tbl: "<4500=3 · 4500–4999=6 · 5000–5499=9 · 5500–5999=12 · 6000+=15" }],
    extra: { k: "pace", n: "Held pace through minutes 12–16?" },
    ret: { k: "r1", n: "★ RETENTION R1 — med-ball diagonal throw", pre: 1, unit: "distance" } },
  { d: 5, n: "LOAD-BEARING GUT-CHECK", col: C.oxide,
    pre: "Sled push/drag, 15 minutes, maximum total distance. Push 20m, turn, drag 20m back. Rest as needed but the clock never stops.",
    m: "THE RULE THAT MATTERS MORE THAN THE SCORE: the first time your mind says stop, you do ONE MORE LENGTH before you're allowed to reassess. Every time.",
    t: [{ k: "dist", n: "Total distance", u: "metres", load: 1.0, ln: "sled at 100% BW · adjust for surface", rows: [[200, 3], [300, 6], [400, 9], [500, 12]], top: 15, tbl: "<200=3 · 200–299=6 · 300–399=9 · 400–499=12 · 500+=15" }],
    extra2: [{ k: "quit", n: "First quit signal at (m)" }, { k: "stop", n: "Actually stopped at (m)" }],
    ret: { k: "r2", n: "★ RETENTION R2 — broad jump", pre: 1, unit: "distance" } },
  { d: 6, n: "STATIC HOLDS UNDER DEPRIVATION", col: C.violet,
    pre: "No output test. Nothing to push against, nowhere for the discomfort to go. Fast from the previous evening (16–24hr, water only — scale to what you've actually done before). Tests LATE in the fasted window. Silence block in the evening: 60 min. 10 min rest between holds.",
    m: "Static holds have no rhythm to hide inside. Anchor on the breath, count exhales, and let the timer be someone else's problem.",
    warn: "HYPOGLYCAEMIA: shakiness, cold sweat, confusion or vision changes mean you EAT IMMEDIATELY. Day 6 scores whatever it scores.",
    t: [{ k: "plank", n: "Plank", u: "seconds", ln: "forearms, neutral spine", rows: [[120, 1], [240, 2]], top: 3, tbl: "4+min=3 · 2–4min=2 · <2min=1" },
      { k: "wall", n: "Wall Sit", u: "seconds", ln: "thighs parallel", rows: [[90, 1], [180, 2]], top: 3, tbl: "3+min=3 · 90s–3min=2 · <90s=1" },
      { k: "hollow", n: "Hollow Hold", u: "seconds", rows: [[45, 1], [90, 2]], top: 3, tbl: "90+s=3 · 45–90=2 · <45=1" },
      { k: "hang2", n: "Dead Hang ★ second of the week — scores your Decay", u: "seconds", ln: "against Day 1's number", rows: [[75, 1], [105, 2]], top: 3, tbl: "105+s=3 · 75–104=2 · <75=1" }],
    extra: { k: "fastsil", n: "Full fast + full silence completed?", pts: 3 } },
];
const HWCOMP = [["Completed all six days, none skipped or shortened", 4], ["No music / headphones all week", 2], ["Held controlled breathing — no panic breathing — in every test", 2], ["Went past the first quit signal every time", 2]];
const HWRANK = [[48, "RECRUIT", C.ash, "You have your baseline. That's the entire point of attempt one."], [72, "SOLDIER", C.moss, "Solid general capacity, clear weak links to attack."], [90, "WARRIOR", C.cobalt, "Genuinely strong across the board."], [108, "PRAETORIAN", C.brass, "Elite for a non-professional athlete."], [121, "KOKORO", C.oxide, "You didn't need this document."]];
const RETBAND = [[80, 1], [85, 2], [90, 3], [95, 4]];
const HWRULES = [
  "One flagship test per day. No extra training. This replaces the program — no Optimal 8 volume in week 17.",
  "Full sleep every night. You're testing load tolerance, not sleep debt.",
  "No music, no headphones, all week. No distraction to hide behind.",
  "★ Draw the day's test each morning. Six cards, shuffled, Day 6 always last. Better if someone else holds them.",
  "Same time of day, every test, every attempt — or the numbers don't compare.",
  "Log the number immediately. Not after your shower.",
  "'To failure' means form breaks or a genuine wall. Not joint pain, not numbness, not dizziness that doesn't clear. Grit and injury are different things.",
];
const HWABORT = [
  ["Dark cola-coloured urine, severe swelling, or muscle pain wildly out of proportion", "RHABDOMYOLYSIS. A&E, not a decision."],
  ["Shakiness, cold sweat, confusion or vision changes on Day 6", "HYPOGLYCAEMIA. Eat immediately."],
  ["Chest pain, or dizziness that doesn't clear on rest", "Stop."],
  ["Any joint pain that changes how you move", "Stop."],
  ["A panic response that doesn't settle with your panic protocol", "Stop."],
  ["You are lying in your log", "A falsified week scores nothing and teaches nothing."],
];
const WEAKFIX = { 1: "Loaded holds and dead hangs 3×/week to failure", 2: "One unbroken complex added to a conditioning day", 3: "Breath work daily and non-negotiable · nasal threshold tested fortnightly", 4: "One extra easy-cardio session per week for the block", 5: "Loaded carries and sled 2×/week", 6: "Isometric holds into every session finisher", ret: "Rear-leg drive endurance to 3×/week · punch throws to 4 rounds", dec: "Not a training problem — food and recovery between days." };
function hsc(vv, rows, top) { const n = num(vv); if (n == null) return null; for (let i = 0; i < rows.length; i++) if (n < rows[i][0]) return rows[i][1]; return top; }
function retPts(pre, post) { if (!num(pre) || !num(post)) return null; const p = num(post) / num(pre) * 100; for (let i = 0; i < RETBAND.length; i++) if (p < RETBAND[i][0]) return RETBAND[i][1]; return 5; }

function HellWeek({ current, maxes, bw, hwLog, setHwLog, L }) {
  const best = (t) => hwLog.filter((e) => e.tier === t).reduce((a, e) => Math.max(a, e.total || 0), 0);
  const autoTier = current.macro <= 1 ? 1 : best(2) >= 84 && current.macro >= 3 ? 3 : best(1) >= 60 ? 2 : 1;
  const [tier, setTier] = useState(autoTier);
  const [raw, setRaw] = useState({}); const [comp, setComp] = useState([]); const [open, setOpen] = useState(1);
  const T = HWT[tier]; const week = current.week;
  const dayScore = (d) => { let s = 0; d.t.forEach((t) => { const p = hsc(raw[d.d + t.k], t.rows, t.top); if (p) s += p; }); if (d.extra && d.extra.pts && raw[d.d + d.extra.k] === "y") s += d.extra.pts; return Math.min(15, s); };
  const days = HWD.reduce((a, d) => a + dayScore(d), 0);
  const r1 = retPts(raw["4r1pre"], raw["4r1post"]), r2 = retPts(raw["5r2pre"], raw["5r2post"]);
  const r3 = raw["2r3"] === "clean" ? 5 : raw["2r3"] === "grind" ? 3 : raw["2r3"] === "miss" ? 1 : null;
  const ret = (r1 || 0) + (r2 || 0) + (r3 || 0);
  const h1 = num(raw["1hang"]), h6 = num(raw["6hang2"]);
  const decayPct = h1 && h6 ? (h1 - h6) / h1 * 100 : null;
  const dec = decayPct === null ? 0 : decayPct < 10 ? 5 : decayPct < 20 ? 4 : decayPct < 30 ? 3 : decayPct < 40 ? 2 : 1;
  const compPts = comp.reduce((a, i) => a + HWCOMP[i][1], 0);
  const grand = days + ret + dec + compPts;
  const rank = HWRANK.find((r) => grand < r[0]) || HWRANK[4];
  const weak = useMemo(() => { let lo = null; HWD.forEach((d) => { const s = dayScore(d); if (s > 0 && (lo === null || s < lo.s)) lo = { s, k: d.d, n: "DAY " + d.d + " — " + d.n }; });
    if (ret > 0 && ret < 9) lo = lo && lo.s <= 5 ? lo : { s: ret, k: "ret", n: "RETENTION — force production when empty" };
    if (dec > 0 && dec <= 2) lo = { s: dec, k: "dec", n: "DECAY — you degraded badly across the week" };
    return lo; }, [raw, comp]);
  const commit = () => { const e = { date: new Date().toISOString().slice(0, 10), macro: current.macro, week, tier, bw, days, ret, dec, decayPct: decayPct === null ? null : Number(decayPct.toFixed(1)), comp: compPts, total: grand, rank: rank[1], weak: weak ? weak.n : "", fix: weak ? (WEAKFIX[weak.k] || "") : "" };
    setHwLog([e].concat(hwLog)); setRaw({}); setComp([]); buzz([80, 50, 80]); };
  return (
    <div>
      <Card ac={C.oxide}>
        <Eye c={C.oxide}>When — fixed. No decision to make.</Eye>
        {L > 16 ? (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[[17, "HELL WEEK", C.oxide], [18, "RELOAD", C.moss]].map((x) => (
                <div key={x[0]} style={{ flex: 1, background: week === x[0] ? x[2] : C.ink, border: "1px solid " + x[2], borderRadius: 5, padding: "12px 8px", textAlign: "center" }}>
                  <div style={Object.assign({}, mno, { fontSize: 8.5, color: week === x[0] ? C.ink : C.ash, letterSpacing: 1.2 })}>WEEK {x[0]}</div>
                  <div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 800, letterSpacing: 1, color: week === x[0] ? C.ink : x[2], marginTop: 2 })}>{x[1]}</div>
                </div>))}
            </div>
            <Note c={C.chalk} s={{ marginTop: 0 }}>Weeks 15–16 taper and test, week 17 is Hell Week, week 18 is the reload, then straight into week 1 of the next macrocycle. You've just tapered — the freshest you'll be all cycle, and Saturday's test gives the Retention single a current max.</Note>
            {week === 17 ? <Note c={C.oxide} bold>THIS IS THE WEEK. Draw a card each morning. 50–200 burpees first, depending on tier.</Note> : week === 18 ? <Note c={C.moss} bold>Reload — light movement, full food. The adaptation happens now.</Note> : <Note>{17 - week > 0 ? (17 - week) + " week" + (17 - week === 1 ? "" : "s") + " out." : ""}</Note>}
          </div>) : <Note c={C.chalk} s={{ marginTop: 0 }}>The 18-week cycle is switched off. Turn on Iron Mind weeks in settings to schedule Hell Week after each test day.</Note>}
      </Card>
      <Card ac={T.col}>
        <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
          {[1, 2, 3].map((n) => <button key={n} onClick={() => setTier(n)} style={{ flex: 1, background: n === tier ? HWT[n].col : "transparent", border: "1px solid " + (n === tier ? HWT[n].col : C.line), borderRadius: 4, padding: "9px 3px", cursor: "pointer" }}>
            <div style={Object.assign({}, dsp, { fontSize: 11.5, fontWeight: 700, color: n === tier ? C.ink : C.ash, letterSpacing: .6 })}>{HWT[n].n}</div></button>)}
        </div>
        <div style={Object.assign({}, mno, { fontSize: 10, color: C.ash })}>{T.freq.toUpperCase()} · BODYWEIGHT {bw} KG</div>
        <div style={{ background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "10px 12px", marginTop: 9 }}><Eye c={T.col} s={{ marginBottom: 4 }}>Gate</Eye><div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{T.gate}</div></div>
        <div style={{ background: C.ink, border: "1px solid " + C.oxide, borderRadius: 5, padding: "10px 12px", marginTop: 9 }}><Eye c={C.oxide} s={{ marginBottom: 4 }}>Daily tax</Eye><div style={Object.assign({}, bdy, { fontSize: 15, fontWeight: 700, color: C.chalk })}>{T.tax} burpees {tier === 3 ? "(100 AM + 100 PM)" : "every morning"}</div><Note s={{ marginTop: 2 }}>Before anything else. Unscored. Not optional.</Note></div>
        {T.mods.map((m, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12.5, color: m.indexOf("★") === 0 ? C.chalk : C.ash, padding: "7px 0", borderBottom: i < T.mods.length - 1 ? "1px solid " + C.line : "none", lineHeight: 1.5, fontWeight: m.indexOf("★") === 0 ? 600 : 400 })}>{m}</div>)}
      </Card>
      <Card ac={rank[2]}>
        <Eye c={rank[2]}>Running total</Eye>
        <div style={{ textAlign: "center" }}>
          <div style={Object.assign({}, mno, { fontSize: 44, fontWeight: 700, color: rank[2], lineHeight: 1 })}>{grand}<span style={{ fontSize: 17, color: C.ash }}>/120</span></div>
          <div style={Object.assign({}, dsp, { fontSize: 21, fontWeight: 800, letterSpacing: 2, color: rank[2], marginTop: 6 })}>{rank[1]}</div>
          <Note>{rank[3]}</Note>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 14, flexWrap: "wrap" }}>
          {HWD.map((d) => { const sc = dayScore(d); return <div key={d.d} style={{ flex: "1 1 10%", background: C.ink, border: "1px solid " + (sc ? d.col : C.line), borderRadius: 3, padding: "6px 2px", textAlign: "center" }}><div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash })}>D{d.d}</div><div style={Object.assign({}, mno, { fontSize: 12, fontWeight: 700, color: sc ? C.chalk : C.ash })}>{sc}</div></div>; })}
          {[["RET", ret, C.brass], ["DEC", dec, C.violet], ["COMP", compPts, C.cobalt]].map((x) => <div key={x[0]} style={{ flex: "1 1 10%", background: C.ink, border: "1px solid " + (x[1] ? x[2] : C.line), borderRadius: 3, padding: "6px 2px", textAlign: "center" }}><div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash })}>{x[0]}</div><div style={Object.assign({}, mno, { fontSize: 12, fontWeight: 700, color: x[1] ? C.chalk : C.ash })}>{x[1]}</div></div>)}
        </div>
        {decayPct !== null ? <div style={{ background: C.ink, border: "1px solid " + C.violet, borderRadius: 5, padding: "10px 12px", marginTop: 12, textAlign: "center" }}><Eye c={C.violet} s={{ marginBottom: 2 }}>Decay — Day 1 hang {h1}s → Day 6 {h6}s</Eye><div style={Object.assign({}, mno, { fontSize: 24, fontWeight: 700, color: decayPct < 20 ? C.moss : decayPct < 40 ? C.brass : C.oxide })}>{decayPct.toFixed(1)}%</div><Note s={{ marginTop: 2 }}>Whether it was a Hell Week or six separate test days.</Note></div> : null}
        {weak ? <div style={{ background: C.ink, border: "1px solid " + C.oxide, borderRadius: 5, padding: "11px 12px", marginTop: 11 }}><Eye c={C.oxide} s={{ marginBottom: 4 }}>Weakest — next block attacks this</Eye><div style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{weak.n}</div><Note c={C.brass}>{WEAKFIX[weak.k]}</Note></div> : null}
        {grand > 0 ? <Btn on={commit} c={rank[2]} fill s={{ width: "100%", marginTop: 12 }}>SAVE ATTEMPT</Btn> : null}
      </Card>
      {HWD.map((d) => { const isOpen = open === d.d, sc = dayScore(d);
        return (
          <Card key={d.d} ac={d.col} s={{ padding: 0 }}>
            <div onClick={() => setOpen(isOpen ? null : d.d)} style={{ padding: "12px 13px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={Object.assign({}, dsp, { fontSize: 15.5, fontWeight: 700, letterSpacing: .9, color: C.chalk })}>DAY {d.d} — {d.n}</span>
                <span style={Object.assign({}, mno, { fontSize: 12, color: sc ? d.col : C.ash })}>{sc}/15</span>
              </div>
              {d.sub ? <div style={Object.assign({}, mno, { fontSize: 9, color: d.col, marginTop: 3 })}>{d.sub}</div> : null}
            </div>
            {isOpen ? (
              <div className="rise" style={{ padding: "0 13px 13px" }}>
                <div style={{ height: 1, background: C.line, marginBottom: 11 }} />
                {d.pre ? <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, lineHeight: 1.55, marginBottom: 12 })}>{d.pre}</div> : null}
                {d.warn ? <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.oxide, lineHeight: 1.5, marginBottom: 12, paddingLeft: 10, borderLeft: "2px solid " + C.oxide, fontWeight: 600 })}>⚠ {d.warn}</div> : null}
                {d.ret && d.ret.pre ? (
                  <div style={{ background: C.ink, border: "1px solid " + C.brass, borderRadius: 5, padding: "11px 12px", marginBottom: 12 }}>
                    <Eye c={C.brass} s={{ marginBottom: 6 }}>{d.ret.n}</Eye>
                    <div style={{ display: "flex", gap: 7 }}>
                      <div style={{ flex: 1 }}><Lab>Before</Lab><Fld v={raw[d.d + d.ret.k + "pre"]} on={(vv) => setRaw(Object.assign({}, raw, { [d.d + d.ret.k + "pre"]: vv }))} ph="—" /></div>
                      <div style={{ flex: 1 }}><Lab>After</Lab><Fld v={raw[d.d + d.ret.k + "post"]} on={(vv) => setRaw(Object.assign({}, raw, { [d.d + d.ret.k + "post"]: vv }))} ph="—" /></div>
                    </div>
                    {num(raw[d.d + d.ret.k + "pre"]) && num(raw[d.d + d.ret.k + "post"]) ? <div style={{ textAlign: "center", marginTop: 9 }}><span style={Object.assign({}, mno, { fontSize: 20, fontWeight: 700, color: C.brass })}>{(num(raw[d.d + d.ret.k + "post"]) / num(raw[d.d + d.ret.k + "pre"]) * 100).toFixed(1)}%</span><span style={Object.assign({}, mno, { fontSize: 11, color: C.ash })}> · {retPts(raw[d.d + d.ret.k + "pre"], raw[d.d + d.ret.k + "post"])} pts</span></div> : null}
                    <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, marginTop: 6 })}>95%+=5 · 90–94=4 · 85–89=3 · 80–84=2 · under 80=1 · three attempts each, same ball, same spot.</div>
                  </div>) : null}
                {d.t.map((t) => { const p = hsc(raw[d.d + t.k], t.rows, t.top); const kg = t.load && bw ? Math.round(bw * (tier >= 2 && t.k === "rounds" ? 0.5 : t.load)) : null;
                  return (
                    <div key={t.k} style={{ marginBottom: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{t.n}</span>
                        <span style={Object.assign({}, mno, { fontSize: 12, fontWeight: 700, color: C.brass, flexShrink: 0 })}>{p !== null ? p + " pts" : ""}</span>
                      </div>
                      {t.ln ? <div style={Object.assign({}, bdy, { fontSize: 12, color: C.ash, marginTop: 2 })}>{t.ln}{kg ? " — " + kg + " kg" : ""}</div> : null}
                      <div style={{ marginTop: 6 }}><Lab>{t.u}</Lab><Fld v={raw[d.d + t.k]} on={(vv) => setRaw(Object.assign({}, raw, { [d.d + t.k]: vv }))} ph="—" /></div>
                      <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, marginTop: 4 })}>{t.tbl}</div>
                    </div>); })}
                {d.ret && !d.ret.pre ? (
                  <div style={{ background: C.ink, border: "1px solid " + C.brass, borderRadius: 5, padding: "11px 12px", marginBottom: 12 }}>
                    <Eye c={C.brass} s={{ marginBottom: 5 }}>{d.ret.n}</Eye>
                    <div style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk, marginBottom: 8 })}>
                      {num(maxes[d.ret.maxk]) ? <span>Single at <strong style={{ color: C.brass }}>{r25(num(maxes[d.ret.maxk]) * d.ret.pct / 100)} kg</strong> — {d.ret.pct}% of your squat max</span> : <span style={{ color: C.ash, fontStyle: "italic" }}>Set your squat max in TRACK to auto-load this.</span>}
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[["clean", "MADE CLEAN", 5, C.moss], ["grind", "MADE GRINDING", 3, C.brass], ["miss", "MISSED", 1, C.oxide]].map((o) =>
                        <button key={o[0]} onClick={() => setRaw(Object.assign({}, raw, { "2r3": raw["2r3"] === o[0] ? "" : o[0] }))}
                          style={Object.assign({}, dsp, { flex: 1, fontSize: 10, fontWeight: 700, padding: "8px 2px", borderRadius: 4, cursor: "pointer", background: raw["2r3"] === o[0] ? o[3] : "transparent", color: raw["2r3"] === o[0] ? C.ink : C.ash, border: "1px solid " + (raw["2r3"] === o[0] ? "transparent" : C.line) })}>{o[1]}<br />{o[2]} pts</button>)}
                    </div>
                  </div>) : null}
                {d.extra ? (
                  <div style={{ marginBottom: 12 }}>
                    <div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk, marginBottom: 6 })}>{d.extra.n}{d.extra.pts ? " (+" + d.extra.pts + ")" : ""}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["y", "n"].map((vv) => <button key={vv} onClick={() => setRaw(Object.assign({}, raw, { [d.d + d.extra.k]: raw[d.d + d.extra.k] === vv ? "" : vv }))}
                        style={Object.assign({}, dsp, { flex: 1, fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 4, cursor: "pointer", background: raw[d.d + d.extra.k] === vv ? (vv === "y" ? C.moss : C.oxide) : "transparent", color: raw[d.d + d.extra.k] === vv ? C.ink : C.ash, border: "1px solid " + (raw[d.d + d.extra.k] === vv ? "transparent" : C.line) })}>{vv === "y" ? "YES" : "NO"}</button>)}
                    </div>
                  </div>) : null}
                {d.extra2 ? d.extra2.map((e) => <div key={e.k} style={{ marginBottom: 10 }}><Lab>{e.n}</Lab><Fld v={raw[d.d + e.k]} on={(vv) => setRaw(Object.assign({}, raw, { [d.d + e.k]: vv }))} ph="—" /></div>) : null}
                {d.extra2 && num(raw[d.d + "quit"]) != null && num(raw[d.d + "stop"]) != null ? <div style={{ background: C.ink, border: "1px solid " + C.oxide, borderRadius: 5, padding: "10px 12px", marginBottom: 11, textAlign: "center" }}><Eye c={C.oxide} s={{ marginBottom: 2 }}>The gap</Eye><div style={Object.assign({}, mno, { fontSize: 24, fontWeight: 700, color: C.chalk })}>{num(raw[d.d + "stop"]) - num(raw[d.d + "quit"])} m</div><Note s={{ marginTop: 2 }}>The most honest measurement of mental fortitude in the entire week.</Note></div> : null}
                <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.ash, lineHeight: 1.55, paddingLeft: 10, borderLeft: "2px solid " + d.col, fontStyle: "italic" })}>{d.m}</div>
              </div>) : null}
          </Card>); })}
      <Card ac={C.cobalt}>
        <Eye c={C.cobalt}>Composure — judged per test, immediately</Eye>
        {HWCOMP.map((c, i) => { const on = comp.indexOf(i) >= 0;
          return <div key={i} onClick={() => { const n = comp.slice(); const x = n.indexOf(i); if (x >= 0) n.splice(x, 1); else n.push(i); setComp(n); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < HWCOMP.length - 1 ? "1px solid " + C.line : "none", cursor: "pointer" }}>
            <span style={Object.assign({}, mno, { width: 24, height: 24, borderRadius: 4, flexShrink: 0, background: on ? C.moss : C.ink, border: "1px solid " + (on ? C.moss : C.line), color: C.ink, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" })}>{on ? "✓" : ""}</span>
            <span style={Object.assign({}, bdy, { fontSize: 12.5, color: on ? C.chalk : C.ash, flex: 1, lineHeight: 1.4 })}>{c[0]}</span>
            <span style={Object.assign({}, mno, { fontSize: 11, color: on ? C.moss : C.ash })}>{c[1]}</span></div>; })}
      </Card>
      <Card ac={C.oxide}>
        <Eye c={C.oxide}>⚠ Abort — and it is not failure</Eye>
        {HWABORT.map((r, i) => <div key={i} style={{ padding: "9px 0", borderBottom: i < HWABORT.length - 1 ? "1px solid " + C.line : "none" }}><div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.oxide })}>{r[0]}</div><div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, marginTop: 2, lineHeight: 1.45 })}>{r[1]}</div></div>)}
      </Card>
      <Card ac={C.brass}>
        <Eye c={C.brass}>Rules of engagement</Eye>
        {HWRULES.map((r, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, padding: "7px 0", borderBottom: i < HWRULES.length - 1 ? "1px solid " + C.line : "none", lineHeight: 1.45, fontWeight: 600 })}>{r}</div>)}
      </Card>
      {hwLog.length ? (
        <Card>
          <Eye c={C.moss}>Previous attempts</Eye>
          {hwLog.slice(0, 6).map((e, i) => (
            <div key={i} style={{ padding: "9px 0", borderBottom: i < Math.min(6, hwLog.length) - 1 ? "1px solid " + C.line : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{HWT[e.tier] ? HWT[e.tier].n : "TIER " + e.tier}</span>
                <span style={Object.assign({}, mno, { fontSize: 12, fontWeight: 700, color: C.brass })}>{e.total}/120 · {e.rank}</span></div>
              <div style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, marginTop: 3 })}>{e.date} · M{e.macro} wk{e.week} · ret {e.ret}/15 · decay {e.decayPct != null ? e.decayPct + "%" : "—"}</div>
              {e.weak ? <div style={Object.assign({}, bdy, { fontSize: 11.5, color: C.oxide, marginTop: 3 })}>Weakest: {e.weak}</div> : null}
            </div>))}
        </Card>) : null}
      <Card ac={C.oxide}><div style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk, lineHeight: 1.55, fontWeight: 600 })}>The score isn't the point. The score is what stops you lying to yourself about the point.</div></Card>
    </div>);
}

/* ================================================================
   APP SHELL
   ================================================================ */
const KEYS = { st: "o8s-settings", done: "o8s-done", log: "o8s-log", maxes: "o8s-maxes", maxHist: "o8s-maxhist", body: "o8s-body", ready: "o8s-ready", spar: "o8s-spar", swap: "o8s-swap", box: "o8s-box", notes: "o8s-notes", forge: "o8s-forge", fweek: "o8s-fweek", hw: "o8s-hw" };
const DEF_ST = () => ({ start: defaultStart(), macroBase: 1, iron: false, sound: true, autoRest: true });

export default function App() {
  const [st, setStRaw] = useState(DEF_ST());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  const [selDay, setSelDay] = useState(null);
  const [view, setViewRaw] = useState(null);
  const [proto, setProto] = useState(null);
  const [plates, setPlates] = useState(null);
  const [flow, setFlow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isub, setIsub] = useState("forge");
  const [done, setDoneRaw] = useState({});
  const [log, setLogRaw] = useState({});
  const [maxes, setMaxesRaw] = useState({});
  const [maxHist, setMaxHistRaw] = useState([]);
  const [body, setBodyRaw] = useState([]);
  const [readyMap, setReadyRaw] = useState({});
  const [sparMap, setSparRaw] = useState({});
  const [swapMap, setSwapRaw] = useState({});
  const [boxMap, setBoxRaw] = useState({});
  const [notes, setNotesRaw] = useState({});
  const [forge, setForgeRaw] = useState([]);
  const [fweek, setFweekRaw] = useState(1);
  const [hwLog, setHwRaw] = useState([]);
  const T = useTimer(st.sound);

  const mk = (setter, key) => (val) => { setter(val); save(key, val); };
  const setSt = mk(setStRaw, KEYS.st), setDone = mk(setDoneRaw, KEYS.done), setLog = mk(setLogRaw, KEYS.log);
  const setMaxes = mk(setMaxesRaw, KEYS.maxes), setMaxHist = mk(setMaxHistRaw, KEYS.maxHist), setBody = mk(setBodyRaw, KEYS.body);
  const setReadyMap = mk(setReadyRaw, KEYS.ready), setSparMap = mk(setSparRaw, KEYS.spar), setSwapMap = mk(setSwapRaw, KEYS.swap);
  const setBoxMap = mk(setBoxRaw, KEYS.box), setNotes = mk(setNotesRaw, KEYS.notes);
  const setForge = mk(setForgeRaw, KEYS.forge), setFweek = mk(setFweekRaw, KEYS.fweek), setHwLog = mk(setHwRaw, KEYS.hw);

  useEffect(() => { (async () => {
    const s0 = await load(KEYS.st, null);
    let migrated = await load("o8s-migrated", false);
    let mig = {};
    if (!migrated) {
      const m8 = await load("o8-maxes", null); if (m8) mig.maxes = m8;
      const s8 = await load("o8-settings", null); if (s8) mig.settings = s8;
      const m7 = await load("o7-maxes", null); if (m7 && !mig.maxes) mig.maxes = m7;
      const s7 = await load("o7-settings", null); if (s7 && !mig.settings) mig.settings = s7;
      const m6 = await load("o6-maxes", null); if (m6 && !mig.maxes) mig.maxes = m6;
      const s6 = await load("o6-settings", null); if (s6 && !mig.settings) mig.settings = s6;
      const b6 = await load("o6-body", null); if (b6 && b6.length) mig.body = b6;
      const f6 = await load("o6-forge", null); if (f6 && f6.length) mig.forge = f6;
      const h6 = await load("o6-hw", null); if (h6 && h6.length) mig.hw = h6;
      const m5 = await load("o5-maxes", null);
      if (m5 && !mig.maxes) mig.maxes = { squat: m5.squat, bench: m5.bench, tbdl: m5.tbdl, pp: m5.pp };
      const b5 = await load("o5-body", null); if (b5 && b5.length && !mig.body) mig.body = b5;
      const f5 = await load("o5-forge", null); if (f5 && f5.length && !mig.forge) mig.forge = f5;
      const fw5 = await load("o5-forgeweek", null); if (fw5) mig.fweek = fw5;
      const h5 = await load("o5-hw", null); if (h5 && h5.length && !mig.hw) mig.hw = h5;
      const l5 = await load("o5-log", null);
      if (l5) { const t = {}; let mm = 0; Object.keys(l5).forEach((k) => { const m = k.match(/^m(\d+)w16-test-/); if (m && l5[k] && l5[k].w) { t[k] = { w: l5[k].w }; mm = Math.max(mm, Number(m[1])); } });
        if (Object.keys(t).length) { mig.testLog = t; mig.macroBase = mm + 1; } }
      await save("o8s-migrated", true);
    }
    const st1 = s0 || Object.assign(DEF_ST(), mig.settings || {}, mig.macroBase ? { macroBase: mig.macroBase } : {});
    setStRaw(st1); if (!s0) save(KEYS.st, st1);
    const mx = await load(KEYS.maxes, null); setMaxesRaw(mx || mig.maxes || {}); if (!mx && mig.maxes) save(KEYS.maxes, mig.maxes);
    const bd = await load(KEYS.body, null); setBodyRaw(bd || mig.body || []); if (!bd && mig.body) save(KEYS.body, mig.body);
    const fg = await load(KEYS.forge, null); setForgeRaw(fg || mig.forge || []); if (!fg && mig.forge) save(KEYS.forge, mig.forge);
    const fw = await load(KEYS.fweek, null); setFweekRaw(fw || mig.fweek || 1);
    const hw = await load(KEYS.hw, null); setHwRaw(hw || mig.hw || []); if (!hw && mig.hw) save(KEYS.hw, mig.hw);
    const lg = await load(KEYS.log, null); const lg1 = lg || mig.testLog || {}; setLogRaw(lg1); if (!lg && mig.testLog) save(KEYS.log, lg1);
    setDoneRaw(await load(KEYS.done, {})); setMaxHistRaw(await load(KEYS.maxHist, []));
    setReadyRaw(await load(KEYS.ready, {})); setSparRaw(await load(KEYS.spar, {})); setSwapRaw(await load(KEYS.swap, {}));
    setBoxRaw(await load(KEYS.box, {})); setNotesRaw(await load(KEYS.notes, {}));
    setLoaded(true);
  })(); }, []);

  const L = st.iron ? 18 : 16;
  const current = useMemo(() => { const wk = Math.floor((mondayOf(new Date()) - mondayOf(parseISO(st.start))) / 604800000);
    if (wk < 0) return { macro: st.macroBase, week: 1, pre: true };
    return { macro: st.macroBase + Math.floor(wk / L), week: (wk % L) + 1 }; }, [st.start, st.macroBase, L]);
  const today = todayKey();
  const shown = selDay || { macro: current.macro, week: current.week, day: today };
  const isToday = shown.macro === current.macro && shown.week === current.week && shown.day === today;
  const vw = view || { macro: current.macro, week: current.week };
  const setView = (x) => setViewRaw(x);
  const setCurrent = (m, w) => { let base = st.macroBase, off; if (m < base) { base = m; off = w - 1; } else off = (m - base) * L + (w - 1);
    const start = new Date(mondayOf(new Date()).getTime() - off * 604800000);
    setSt(Object.assign({}, st, { start: iso(start), macroBase: base })); setViewRaw({ macro: m, week: w }); setSelDay(null); };

  const bw = num(body[0] && body[0].bw) || 80;
  const onSetMax = (lift, kg, src) => { setMaxes(Object.assign({}, maxes, { [lift]: kg })); setMaxHist([{ d: new Date().toISOString().slice(0, 10), lift, kg, src, macro: current.macro, week: current.week }].concat(maxHist)); buzz([50, 30, 50]); };
  const addBody = (t) => setBody([Object.assign({ d: new Date().toISOString().slice(0, 10), m: current.macro }, t)].concat(body));

  const dk = dayKey(shown.macro, shown.week, shown.day);
  const pdk = prevDayKey(shown.macro, shown.week, shown.day, L);
  const weekStats = useMemo(() => { let g = 0, y = 0, r = 0, slow = 0, spr = 0, dn = 0, planned = 0; const rx = rxFor(shown.week);
    DAYS.forEach((d) => { const k = dayKey(shown.macro, shown.week, d); const rv = readyMap[k]; if (rv === "G") g++; if (rv === "Y") y++; if (rv === "R") r++;
      if (boxMap[k] === "slow") slow++; if (sparMap[k]) spr++;
      const tot = rx.hell ? 0 : (d === "sat" && rx.test ? 1 : realBlocks(d, rx).length); if (tot) { planned++; if ((done[k] || []).length >= tot) dn++; } });
    return { g, y, r, slow, spar: spr, done: dn, planned }; }, [readyMap, boxMap, sparMap, done, shown.macro, shown.week]);
  const weekDoneMap = useMemo(() => { const out = {}; for (let w = 1; w <= L; w++) { const rx = rxFor(w); let dn = 0, tot = 0;
    DAYS.forEach((d) => { const t = rx.hell ? 0 : (d === "sat" && rx.test ? 1 : realBlocks(d, rx).length); if (t) { tot++; if ((done[dayKey(vw.macro, w, d)] || []).length >= t) dn++; } });
    out[w] = tot ? dn / tot : null; } return out; }, [done, vw.macro, L]);

  const sessProps = { macro: shown.macro, week: shown.week, day: shown.day, isCurrent: isToday, done, setDone, log, setLog, maxes, bw,
    ready: readyMap[dk] || "", setReady: (val) => setReadyMap(Object.assign({}, readyMap, { [dk]: val })),
    sparPrev: !!sparMap[pdk], sparThis: !!sparMap[dk], setSparThis: (val) => setSparMap(Object.assign({}, sparMap, { [dk]: val })),
    swapped: !!swapMap[dk], setSwapped: (val) => setSwapMap(Object.assign({}, swapMap, { [dk]: val })),
    box: boxMap[dk] || "", setBox: (val) => setBoxMap(Object.assign({}, boxMap, { [dk]: val })),
    note: notes[dk] || "", setNote: (val) => setNotes(Object.assign({}, notes, { [dk]: val })),
    openProto: setProto, startTimer: T.start, openPlates: setPlates, onSetMax, autoRest: st.autoRest,
    openFlow: () => setFlow(true), goIron: () => { setTab("iron"); setIsub("hell"); }, weekStats, addBody };

  const exportData = async () => JSON.stringify({ st, done, log, maxes, maxHist, body, readyMap, sparMap, swapMap, boxMap, notes, forge, fweek, hwLog });
  const importData = (s) => { try { const d = JSON.parse(s || "{}");
    setSt(d.st || DEF_ST()); setDone(d.done || {}); setLog(d.log || {}); setMaxes(d.maxes || {}); setMaxHist(d.maxHist || []); setBody(d.body || []);
    setReadyMap(d.readyMap || {}); setSparMap(d.sparMap || {}); setSwapMap(d.swapMap || {}); setBoxMap(d.boxMap || {}); setNotes(d.notes || {});
    setForge(d.forge || []); setFweek(d.fweek || 1); setHwLog(d.hwLog || []); setShowSettings(false); } catch (e) {} };

  const TABS = [["today", "TODAY"], ["week", "WEEK"], ["track", "TRACK"], ["iron", "IRON"], ["plan", "PLAN"]];
  const P = PH[rxFor(current.week).ph];
  const noMaxes = loaded && !num(maxes.squat) && !num(maxes.bench);

  return (
    <div style={Object.assign({}, bdy, { background: C.ink, minHeight: "100vh", color: C.chalk })}>
      <style>{FONTS}</style>
      {T.t ? <TimerFull T={T} /> : null}
      {plates !== null && plates !== undefined ? <Plates kg={plates} onClose={() => setPlates(null)} /> : null}
      {proto ? <ProtoSheet id={proto} close={() => setProto(null)} /> : null}
      {showSettings ? <Settings st={st} setSt={setSt} current={current} L={L} exportData={exportData} importData={importData} close={() => setShowSettings(false)} /> : null}
      {flow ? <Flow {...sessProps} close={() => setFlow(false)} /> : null}

      <div style={{ borderBottom: "1px solid " + C.line, background: C.slab, position: "sticky", top: 0, zIndex: 30, paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ borderTop: "3px solid " + P.ac }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", paddingLeft: "max(13px, env(safe-area-inset-left))", paddingRight: "max(13px, env(safe-area-inset-right))", maxWidth: 640, margin: "0 auto" }}>
          <span style={Object.assign({}, dsp, { fontSize: 19, fontWeight: 800, letterSpacing: 2, color: C.chalk })}>OPTIMAL<span style={{ color: P.ac }}>·</span>8<span style={{ fontSize: 12, color: C.ash, letterSpacing: 1 }}> FIGHTER</span></span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Chip c={P.ac}>M{current.macro} · WK {current.week} · {P.n}</Chip>
            <button onClick={() => setShowSettings(true)} aria-label="Settings" style={Object.assign({}, mno, { background: "transparent", border: "1px solid " + C.line, color: C.ash, borderRadius: 4, width: 44, height: 44, cursor: "pointer", fontSize: 16 })}>⚙</button>
          </span>
        </div>
        {tab === "today" ? (
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 13px 10px" }}>
            <div style={{ display: "flex", gap: 3 }}>
              {DAYS.map((k) => { const active = shown.day === k && shown.week === current.week && shown.macro === current.macro;
                return <button key={k} onClick={() => setSelDay(k === today ? null : { macro: current.macro, week: current.week, day: k })}
                  style={Object.assign({}, dsp, { flex: 1, fontSize: 10.5, fontWeight: 700, padding: "7px 0", borderRadius: 4, cursor: "pointer", minHeight: 32,
                    background: active ? S[k].ac : "transparent", color: active ? C.ink : (k === today ? C.moss : C.ash), border: "1px solid " + (active ? S[k].ac : k === today ? C.moss : C.line) })}>{DSH[k]}</button>; })}
            </div>
            {selDay ? <button onClick={() => setSelDay(null)} style={Object.assign({}, mno, { marginTop: 6, background: "transparent", border: "none", color: C.moss, fontSize: 9.5, letterSpacing: 1, cursor: "pointer", padding: 0 })}>◀ BACK TO TODAY ({DSH[today]})</button> : null}
          </div>) : <div style={{ paddingBottom: 2 }} />}
      </div>

      <div style={{ padding: "13px 13px 150px", maxWidth: 640, margin: "0 auto" }}>
        {!loaded ? <div style={Object.assign({}, mno, { fontSize: 11, color: C.ash, padding: "40px 0", textAlign: "center" })}>LOADING…</div> : (
          <div>
            {tab === "today" ? (
              <div>
                {current.pre ? <Card ac={C.brass}><Eye c={C.brass}>Not started yet</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>Week 1 begins {fmtDate(st.start)}. Change it in settings if that's wrong.</Note></Card> : null}
                {noMaxes ? <Card ac={C.brass}><Eye c={C.brass}>First — your numbers</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>Enter your best squat and bench singles so every weight shows in kilos. Trap bar and push press get found in week 1.</Note><Btn small c={C.brass} fill s={{ marginTop: 10 }} on={() => setTab("track")}>ENTER MAXES</Btn></Card> : null}
                <Session {...sessProps} />
              </div>) : null}
            {tab === "week" ? <WeekView view={vw} setView={setView} current={current} setCurrent={setCurrent} done={done} L={L} weekDoneMap={weekDoneMap}
              openDay={(d) => { setSelDay({ macro: vw.macro, week: vw.week, day: d }); setTab("today"); }} /> : null}
            {tab === "track" ? <Track current={current} maxes={maxes} onSetMax={onSetMax} maxHist={maxHist} log={log} body={body} addBody={addBody} done={done} L={L} /> : null}
            {tab === "iron" ? (
              <div>
                <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                  {[["forge", "THE FORGE"], ["hell", "HELL WEEK"]].map((x) => <button key={x[0]} onClick={() => setIsub(x[0])}
                    style={Object.assign({}, dsp, { flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "9px 0", borderRadius: 4, cursor: "pointer", background: isub === x[0] ? (x[0] === "hell" ? C.oxide : C.brass) : "transparent", color: isub === x[0] ? C.ink : C.ash, border: "1px solid " + (isub === x[0] ? (x[0] === "hell" ? C.oxide : C.brass) : C.line) })}>{x[1]}</button>)}
                </div>
                {isub === "forge" ? <Forge fweek={fweek} setFweek={setFweek} forge={forge} setForge={setForge} bw={bw} week={current.week} />
                  : <HellWeek current={current} maxes={maxes} bw={bw} hwLog={hwLog} setHwLog={setHwLog} L={L} />}
              </div>) : null}
            {tab === "plan" ? <PlanView /> : null}
            <div style={Object.assign({}, bdy, { fontSize: 10.5, color: C.ash, textAlign: "center", padding: "24px 0 6px", lineHeight: 1.6 })}>
              Beat your last peak by 3–6%. Three times a year.<br />Nothing else matters.
            </div>
          </div>)}
      </div>

      <TimerDock T={T} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, background: C.slab, borderTop: "1px solid " + C.line, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div style={{ display: "flex", maxWidth: 640, margin: "0 auto" }}>
          {TABS.map((x) => <button key={x[0]} onClick={() => { setTab(x[0]); setProto(null); }}
            style={Object.assign({}, dsp, { flex: 1, fontSize: 11, fontWeight: 700, letterSpacing: .8, background: "transparent", border: "none", borderTop: "2px solid " + (tab === x[0] ? P.ac : "transparent"), color: tab === x[0] ? C.chalk : C.ash, padding: "12px 2px 14px", cursor: "pointer", minHeight: 50 })}>{x[1]}</button>)}
        </div>
      </div>
    </div>);
}
