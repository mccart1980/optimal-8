import { num, r25 } from "./ui.jsx";

/* ================================================================
   LOADING BY BAR SPEED

   A percentage is a guess about today from a number measured weeks
   ago; a velocity is a measurement of today. Five loads and their
   mean speeds draw a line per lift, and the line gives the phase
   targets that replace the document's typical numbers.
   ================================================================ */

export const VEL_LIFTS = [
  { id: "squat", n: "Back squat", work: "squat" },
  { id: "tbdl", n: "Trap bar deadlift", work: "tbdl" },
  { id: "bench", n: "Bench press", work: "bench" },
  { id: "pp", n: "Push press", work: "pp" },
];

/* The loads the document asks for, as percentages of the working max. */
export const PROFILE_LOADS = [50, 60, 70, 80, 85];

/* The phases a target is read at, and the percentage each one sits at. */
export const VEL_PHASES = [
  { id: "accum", n: "Accumulate", pct: 72, line: "70–75%" },
  { id: "intens", n: "Intensify", pct: 84, line: "80–87%" },
  { id: "max", n: "Max single", pct: 100, line: "100%" },
  { id: "convert", n: "Convert · contrast", pct: 86, line: "85–88%" },
];

/* the document's typical numbers, until a profile replaces them */
export const TYPICAL = {
  squat: { accum: [0.65, 0.75], intens: [0.40, 0.55], max: [0.25, 0.30], convert: [0.40, 0.45] },
  tbdl: { accum: [0.60, 0.70], intens: [0.40, 0.50], max: [0.25, 0.30], convert: [0.40, 0.45] },
  bench: { accum: [0.50, 0.60], intens: [0.30, 0.40], max: [0.15, 0.20], convert: [0.30, 0.35] },
  pp: { accum: [0.90, 1.10], intens: [0.70, 0.85], max: [0.50, 0.50], convert: [0.70, 0.70] },
};

/* the phase a prep week is in */
export const phaseOfWeek = (doc) => (doc <= 5 ? "accum" : doc === 9 ? "max" : doc <= 10 ? "intens" : doc === 14 ? "convert" : "convert");

/* ---------- the line ---------- */
/* Least squares through (load %, mean speed). Two points are enough to
   draw one; fewer and there is no line. */
export function fitLine(points) {
  const p = (points || []).filter((x) => num(x.load) != null && num(x.speed) != null)
    .map((x) => ({ x: num(x.load), y: num(x.speed) }));
  if (p.length < 2) return null;
  const n = p.length;
  const sx = p.reduce((a, q) => a + q.x, 0), sy = p.reduce((a, q) => a + q.y, 0);
  const sxx = p.reduce((a, q) => a + q.x * q.x, 0), sxy = p.reduce((a, q) => a + q.x * q.y, 0);
  const den = n * sxx - sx * sx;
  if (!den) return null;
  const slope = (n * sxy - sx * sy) / den;
  const intercept = (sy - slope * sx) / n;
  /* how well it fits, so a profile drawn from noise can be seen to be */
  const mean = sy / n;
  const ssTot = p.reduce((a, q) => a + (q.y - mean) * (q.y - mean), 0);
  const ssRes = p.reduce((a, q) => { const f = slope * q.x + intercept; return a + (q.y - f) * (q.y - f); }, 0);
  return { slope, intercept, n, r2: ssTot ? 1 - ssRes / ssTot : 1, at: (pct) => slope * pct + intercept };
}

/* The target for one lift in one phase: from the profile when there is
   one, from the document's typical numbers when there is not. */
export function targetFor(profiles, lift, phase) {
  const p = profiles && profiles[lift];
  const line = p && p.points ? fitLine(p.points) : null;
  const ph = VEL_PHASES.find((x) => x.id === phase) || VEL_PHASES[0];
  if (line) { const v = line.at(ph.pct); if (v > 0.05 && v < 2.5) return { v: Math.round(v * 100) / 100, own: true, drawn: p.drawn || null }; }
  const t = (TYPICAL[lift] || TYPICAL.squat)[phase] || [0.5, 0.6];
  return { v: Math.round((t[0] + t[1]) / 2 * 100) / 100, lo: t[0], hi: t[1], own: false };
}

/* ---------- the first work set decides the day ---------- */
export const VEL_BAND = 0.05;
export const STOP_STRENGTH = 20;   /* % slower than the set's first rep */
export const STOP_FAST = 10;

/* Mean velocity within 0.05 m/s of target: stay. More than 0.05
   slower: 5% off the remaining sets. More than 0.05 faster: 2.5% on,
   and the same load next week. */
export function verdictFor(speed, target) {
  const s = num(speed), t = num(target);
  if (s == null || t == null) return null;
  const d = Math.round((s - t) * 100) / 100;
  if (d < -VEL_BAND) return { kind: "down", pct: -5, d, line: "TAKE 5% OFF", why: "the remaining sets, recalculated" };
  if (d > VEL_BAND) return { kind: "up", pct: 2.5, d, line: "ADD 2.5%", why: "the remaining sets, and the same load next week" };
  return { kind: "stay", pct: 0, d, line: "STAY", why: "the load was right" };
}

/* the load the remaining sets are done at */
export const adjustLoad = (kg, verdict) => (kg == null || !verdict || !verdict.pct ? kg : r25(kg * (100 + verdict.pct) / 100));

/* the rep that ends the set */
export const stopLine = (fast) => "Rack it when a rep is " + (fast ? STOP_FAST : STOP_STRENGTH) + "% slower than the first — the rep count is a ceiling.";
export const stopPct = (fast) => (fast ? STOP_FAST : STOP_STRENGTH);

/* the phase a camp week reads its targets at: the hand-over week and the
   easy week at the accumulation speeds, the build block heavy, the peak
   and the sharpen week fast */
export const campPhaseOfWeek = (w) => (w <= 1 || w === 5 ? "accum" : w <= 4 ? "intens" : "convert");

/* ================================================================
   THE BALLISTIC LOADS

   The bench throw and the trap bar jump are loaded for power, not by
   feel. In the week-1 and week-10 profiles (camp week 5) both go at four
   loads, two reps each; power is load times mean speed, and the load
   with the highest number is the one used until the next profile.
   ================================================================ */
export const BALLISTIC = [
  { id: "bthrow", n: "Bench throw", of: "bench", loads: [20, 30, 40, 50] },
  { id: "tbjump", n: "Trap bar jump", of: "tbdl", loads: [10, 20, 30, 40] },
];
export const ballisticOf = (id) => BALLISTIC.find((x) => x.id === id) || null;
/* the loads before a profile has been drawn: about a third of the bench,
   a fifth of the trap bar */
export const BALLISTIC_DEFAULT = { bthrow: 30, tbjump: 20 };

/* Power at each load — load in kg when the lift's weight is known, else the
   percentage, which ranks the loads the same way — and the peak. */
export function powerRows(points, workKg) {
  return (points || []).map((p) => {
    const pct = num(p.load), speed = num(p.speed);
    const kg = pct != null && workKg ? r25(workKg * pct / 100) : null;
    const power = pct != null && speed != null ? Math.round((kg != null ? kg : pct) * speed * 10) / 10 : null;
    return { pct, kg, speed, power };
  });
}
export function peakPower(profiles, id, workKg) {
  const p = profiles && profiles[id];
  const rows = powerRows(p && p.points, workKg).filter((r) => r.power != null);
  if (!rows.length) return null;
  const best = rows.reduce((a, r) => (r.power > a.power ? r : a), rows[0]);
  return Object.assign({ drawn: (p && p.drawn) || null }, best);
}
/* the percentage the rows load from: the peak-power load, or the default */
export const ballisticPct = (profiles, id) => {
  const pk = peakPower(profiles, id, null);
  return pk ? pk.pct : BALLISTIC_DEFAULT[id];
};
