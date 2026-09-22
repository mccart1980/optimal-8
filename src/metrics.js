/* ================================================================
   THE MEASUREMENT LAYER — the arithmetic, on its own, with no React
   in it, so every number the app shows can be tested in isolation.

   Nothing already built changes. This module only reads what the
   existing log, settings and body records already hold, and adds
   three stores of its own: the mornings, the photos, and whatever
   the fuel app's export brought with it.
   ================================================================ */

export const num = (v) => { if (v === "" || v === null || v === undefined) return null; const n = Number(v); return isNaN(n) ? null : n; };
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
export const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

/* ================================================================
   1 · THE MORNING NUMBERS
   { "2026-09-15": { rhr, hrv, sleep, lights } } — one record a day,
   every field optional, all of it typed in ten seconds.
   ================================================================ */
export const MORNING_FIELDS = [
  { id: "rhr", n: "Resting heart rate", u: "bpm", dir: "down" },
  { id: "hrv", n: "HRV", u: "ms", dir: "up" },
];

/* the dates with a number in them, oldest first */
export const morningDates = (morning, field) => Object.keys(morning || {})
  .filter((d) => num((morning[d] || {})[field]) != null).sort();

/* The seven-day rolling average of one field: the last seven days
   with a number in them BEFORE the day you are looking at, so today's
   entry is read against the week behind it and never against itself. */
export function rolling7(morning, field, onDate) {
  const ds = morningDates(morning, field).filter((d) => (onDate ? d < onDate : true));
  const last = ds.slice(-7).map((d) => num(morning[d][field]));
  return { avg: avg(last), n: last.length };
}

/* The week-1 baseline. Set by hand from settings ("recalibrate
   baseline" writes the last seven days into it); until then it is the
   first seven days you ever logged, which is week 1 by definition. */
export function baseline(morning, st) {
  const b = (st || {}).base;
  if (b && (num(b.rhr) != null || num(b.hrv) != null)) return { rhr: num(b.rhr), hrv: num(b.hrv), from: b.from || null, set: true };
  const first = (field) => { const ds = morningDates(morning, field).slice(0, 7); return avg(ds.map((d) => num(morning[d][field]))); };
  const ds = morningDates(morning, "rhr").concat(morningDates(morning, "hrv")).sort();
  return { rhr: r1(first("rhr")), hrv: r1(first("hrv")), from: ds[0] || null, set: false };
}

/* What "recalibrate baseline" writes: the last seven days, as they
   stand now, become week 1. */
export function recalibrated(morning, today) {
  const mean = (field) => { const ds = morningDates(morning, field).filter((d) => (today ? d <= today : true)).slice(-7); return { v: r1(avg(ds.map((d) => num(morning[d][field])))), n: ds.length }; };
  const rr = mean("rhr"), hh = mean("hrv");
  return { rhr: rr.v, hrv: hh.v, n: Math.max(rr.n, hh.n), from: today || null };
}

export const RHR_OVER = 5;        /* bpm over the week-1 baseline */
export const HRV_UNDER = 0.12;    /* fraction below the seven-day average */
export const RHR_RED = 8;         /* bpm over baseline that, with the HRV, is a red */
export const HRV_RED = 0.15;      /* fraction below the average that, with the rate, is a red */

/* ================================================================
   READINESS — the four taps and the two numbers, together

   GREEN: 0–1 yes, heart rate within 5 of baseline, HRV within 12% of
   its seven-day average. YELLOW: 2–3 yes, or the rate 5+ over, or the
   HRV 12%+ under. RED: 4 yes, three yellows running, or the rate 8+
   over AND the HRV 15%+ under on the same morning.
   ================================================================ */
export function readiness(answers, flag, recent) {
  const ans = answers || [];
  const answered = ans.filter((x) => x === "y" || x === "n").length;
  const yes = ans.filter((x) => x === "y").length;
  const f = flag || {};
  const b = f.base || {}, a7 = f.avg7 || {};
  const over = f.rhr != null && b.rhr != null ? f.rhr - b.rhr : null;
  const under = f.hrv != null && a7.hrv ? 1 - f.hrv / a7.hrv : null;
  const numbersIn = over != null || under != null;
  if (!answered && !numbersIn) return { level: "", from: [] };
  const from = [];
  let level = "G";
  if (over != null && over >= RHR_OVER) { level = "Y"; from.push("resting heart rate " + Math.round(over) + " over baseline"); }
  if (under != null && under >= HRV_UNDER) { level = "Y"; from.push("HRV " + Math.round(under * 100) + "% under its average"); }
  if (answered >= ans.length && ans.length) {
    if (yes >= 4) { level = "R"; from.push("four yes"); }
    else if (yes >= 2) { if (level !== "R") level = "Y"; from.push(yes + " yes"); }
  }
  const yellows = (recent || []).filter((x) => x === "Y").length;
  if (level === "Y" && yellows >= 2) { level = "R"; from.push("three yellows running"); }
  if (over != null && under != null && over >= RHR_RED && under >= HRV_RED) { level = "R"; from.push("the rate and the HRV both out on the same morning"); }
  return { level, from, over: over == null ? null : Math.round(over), under: under == null ? null : Math.round(under * 100) };
}

/* The one line the day is shown as. */
export const READY_LINE = {
  G: "GREEN — the session as written",
  Y: "YELLOW — every load −7% · the interval session at 90% · the last block comes off",
  R: "RED — warm-up, neck, hands, RANGE, home",
};

/* Two yellows running on the HRV alone turn the hard session into the
   easy twenty minutes, and leave the base where it is. */
export const hrvOnlyTwice = (recentFlags) => (recentFlags || []).filter((x) => x && x.hrvDown && !x.rhrUp).length >= 2;

/* The flag the daily check carries.
   Resting heart rate 5+ bpm over the week-1 baseline, or HRV 12% or
   more below its own seven-day average, is a YELLOW. Both together
   suggests RED. Neither is an instruction — the check is still yours. */
export function morningFlag(entry, morning, st, onDate) {
  const e = entry || {};
  const rhr = num(e.rhr), hrv = num(e.hrv);
  const b = baseline(morning, st);
  const avgH = rolling7(morning, "hrv", onDate).avg;
  const avgR = rolling7(morning, "rhr", onDate).avg;
  const rhrUp = rhr != null && b.rhr != null && rhr - b.rhr >= RHR_OVER;
  const hrvDown = hrv != null && avgH != null && hrv <= avgH * (1 - HRV_UNDER);
  return {
    rhr, hrv, base: b, avg7: { rhr: r1(avgR), hrv: r1(avgH) },
    rhrUp, hrvDown,
    level: rhrUp && hrvDown ? "R" : rhrUp || hrvDown ? "Y" : "",
    why: rhrUp && hrvDown
      ? "Resting heart rate " + Math.round(rhr - b.rhr) + " over baseline AND HRV " + Math.round((1 - hrv / avgH) * 100) + "% under its seven-day average. Two at once suggests RED."
      : rhrUp ? "Resting heart rate " + Math.round(rhr - b.rhr) + " bpm over the week-1 baseline. That's a yellow on its own."
      : hrvDown ? "HRV " + Math.round((1 - hrv / avgH) * 100) + "% below its seven-day average. That's a yellow on its own."
      : "",
  };
}

/* ================================================================
   2 · THE RECOVERY HEART RATE
   The 60-second settle already sits at the end of every conditioning
   session. Two numbers beside it — the heart rate at the end of the
   last interval, and the heart rate 60 seconds later — and the drop
   is the number that matters.
   ================================================================ */
export const recoveryDrop = (endHR, hr60) => { const a = num(endHR), b = num(hr60); return a == null || b == null ? null : a - b; };
export const recoveryBand = (d) => (d == null ? null : d >= 30 ? "excellent" : d >= 20 ? "good — the standard" : d >= 12 ? "fair" : "low — the base is the fix");

/* ================================================================
   3 · THE EASY ZONE
   65–75% of the peak heart rate the 20-minute test found. Monday's
   base and the easy hour are paced off it, and an average heart rate
   outside it gets a quiet note, never an alarm.
   ================================================================ */
export const easyZone = (peak) => { const p = num(peak); return p == null ? null : [Math.round(p * 0.65), Math.round(p * 0.75)]; };
export function zoneNote(avgHR, zone) {
  const a = num(avgHR); if (a == null || !zone) return null;
  if (a < zone[0]) return { in: false, low: true, s: "Under the zone — fine, but a touch more would build more base." };
  if (a > zone[1]) return { in: false, low: false, s: "Over the zone. Easy means easy: this one was stealing from the hard days." };
  return { in: true, s: "In the zone." };
}

/* ================================================================
   4 · ERG OUTPUT
   Per interval, per rep, per burst, per round — in whatever unit you
   chose in settings. The slots come from the session's own shape, so
   the same session compares across weeks.
   ================================================================ */
export const ERG_UNITS = [["w", "WATTS", "W"], ["m", "METRES", "m"], ["cal", "CALORIES", "cal"]];
export const ergUnitLabel = (u) => (ERG_UNITS.find((x) => x[0] === (u || "w")) || ERG_UNITS[0])[2];
export const ergUnitName = (u) => (ERG_UNITS.find((x) => x[0] === (u || "w")) || ERG_UNITS[0])[1];

const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i + 1));

/* the labels for one conditioning session's output fields */
export function ergSlots(kind, opt) {
  const o = opt || {};
  switch (kind) {
    case "vo2": return rep(o.short ? 3 : 4, (i) => "INT " + i);
    case "mod": return rep(4, (i) => "INT " + i);
    case "lac": return [].concat.apply([], rep(o.blocks || 2, (b) => rep(o.reps || 3, (i) => "B" + b + " R" + i)));
    case "lac2": return [].concat.apply([], rep(2, (b) => rep(6, (i) => "B" + b + " R" + i)));
    case "tempo": return rep(o.short ? 9 : 10, (i) => "MIN " + i);
    case "thr": return rep(2, (i) => "THR " + i);
    case "rz": return [].concat.apply([], rep(o.sets == null ? 2 : o.sets, (s) => rep(8, (i) => "S" + s + " B" + i)));
    case "rz1": case "rz3": return rep(8, (i) => "BURST " + i);
    case "erg": case "fp": case "sim": return rep(o.rounds || 6, (i) => "RD " + i);
    case "t20": return rep(4, (i) => "MIN " + (i * 5 - 4) + "–" + i * 5);
    case "easy": case "easy15": return ["TOTAL"];
    default: return ["TOTAL"];
  }
}

/* the shape of a conditioning session, from the week's prescription.
   The Fighter's 40-second repeats run two blocks of three; the camp's
   run one block of six. Same six fields, honestly labelled either way. */
export function ergShapeFor(engKey, camp) {
  const k = String(engKey || "");
  if (k === "lac") return { kind: "lac", opt: camp ? { blocks: 1, reps: 6 } : { blocks: 2, reps: 3 } };
  if (k === "rz") return { kind: "rz", opt: { sets: 2 } };
  if (k === "rz3" || k === "rz1") return { kind: "rz1", opt: {} };
  if (k === "erg") return { kind: "erg", opt: { rounds: 7 } };
  if (k === "fp") return { kind: "fp", opt: { rounds: 4 } };
  return { kind: k, opt: {} };
}

export const ergTotal = (vals) => { const ns = (vals || []).map(num).filter((x) => x != null); return ns.length ? ns.reduce((a, b) => a + b, 0) : null; };
export const ergMean = (vals) => { const ns = (vals || []).map(num).filter((x) => x != null); return ns.length ? r1(ergTotal(ns) / ns.length) : null; };

/* The fade, computed for you: round six against round one.
   Six rounds or more reads rounds 1 and 6; a shorter session reads
   round 1 against its last round. */
export function simFade(vals) {
  const v = vals || [];
  const first = num(v[0]); if (first == null || !first) return null;
  const lastIdx = v.length >= 6 ? 5 : (() => { for (let i = v.length - 1; i > 0; i--) if (num(v[i]) != null) return i; return -1; })();
  const last = num(v[lastIdx]); if (last == null) return null;
  return { rd1: first, rdLast: last, idx: lastIdx + 1, held: r1(last / first * 100), drop: r1((first - last) / first * 100) };
}

/* ================================================================
   5 · SLEEP, DAILY
   Hours slept and lights-out, every morning. The weekly check's two
   sleep averages are filled from them.
   ================================================================ */
const hhmm = (s) => { const m = String(s || "").trim().match(/^(\d{1,2})[:.]?(\d{2})$/); if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2]); if (h > 23 || mi > 59) return null; return h * 60 + mi; };
const fromMins = (t) => { const h = Math.floor(t / 60) % 24, m = Math.round(t % 60); return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m; };

/* Lights-out averages around the evening, so 23:40 and 00:20 average
   to midnight and not to noon. */
export function sleepWeek(morning, days) {
  const ds = days || [];
  const hrs = ds.map((d) => num((morning[d] || {}).sleep)).filter((x) => x != null);
  const lights = ds.map((d) => hhmm((morning[d] || {}).lights)).filter((x) => x != null)
    .map((t) => (t < 12 * 60 ? t + 24 * 60 : t));
  return {
    hours: hrs.length ? r1(avg(hrs)) : null, nights: hrs.length,
    lights: lights.length ? fromMins(avg(lights)) : null, lightsNights: lights.length,
  };
}

/* ================================================================
   6 · BAR SPEED
   The top set of the four bars, optional, in metres a second. The
   chart only compares speeds at the same load, because a speed at a
   different weight isn't the same measurement.
   ================================================================ */
export const BAR_SPEED_ITEMS = { squat: "squat", bench: "bench", tbdl: "tbdl", pushpress: "pp", c_squat: "cw_squat", c_tbdl: "cw_tbdl", c_pushpress: "cw_pp" };
export const BAR_SPEED_LIFTS = [["squat", "Back Squat"], ["bench", "Flat Bench"], ["tbdl", "Trap Bar Deadlift"], ["pp", "Push Press"]];
const WORK_OF = { cw_squat: "squat", cw_tbdl: "tbdl", cw_pp: "pp" };

export const parseKey = (k) => { const m = String(k).match(/^m(C|\d+)w(\d+)-([a-z0-9]+)-(.+)$/); return m ? { macro: m[1], week: Number(m[2]), day: m[3], id: m[4] } : null; };

/* every bar speed on file, per lift, newest last */
export function barSpeeds(log, camp) {
  const out = {};
  Object.keys(log || {}).forEach((k) => {
    const e = log[k]; if (!e || num(e.bs) == null) return;
    const p = parseKey(k); if (!p) return;
    if (camp ? p.macro !== "C" : p.macro === "C") return;
    const lift0 = BAR_SPEED_ITEMS[p.id]; if (!lift0) return;
    const lift = WORK_OF[lift0] || lift0;
    let load = null;
    (e.sets || []).forEach((s) => { if (s.ok && num(s.w) != null) load = load == null ? num(s.w) : Math.max(load, num(s.w)); });
    (out[lift] = out[lift] || []).push({ macro: p.macro, week: p.week, label: (p.macro === "C" ? "w" : "m" + p.macro + "w") + p.week, load, speed: num(e.bs) });
  });
  Object.keys(out).forEach((l) => out[l].sort((a, b) => (a.macro === b.macro ? a.week - b.week : String(a.macro) < String(b.macro) ? -1 : 1)));
  return out;
}

/* the same-load series: the load with the most speeds on it wins */
export function sameLoadSeries(rows) {
  const by = {};
  (rows || []).forEach((r) => { if (r.load == null) return; (by[r.load] = by[r.load] || []).push(r); });
  const loads = Object.keys(by).sort((a, b) => by[b].length - by[a].length || Number(b) - Number(a));
  if (!loads.length) return null;
  return { load: Number(loads[0]), rows: by[loads[0]] };
}

/* ================================================================
   7 · PHOTOS
   Stored on the phone, in the app, as base64 — and carried in the
   backup with everything else.
   ================================================================ */
export const PHOTO_VIEWS = [["front", "FRONT"], ["side", "SIDE"], ["back", "BACK"]];
export const PHOTO_WEEKS = [1, 5, 9, 13];
export const CAMP_PHOTO_WEEKS = [1, 6, 11];
export const photoWeeks = (camp) => (camp ? CAMP_PHOTO_WEEKS : PHOTO_WEEKS);
export const isPhotoDay = (camp, week, day) => day === "sun" && photoWeeks(camp).indexOf(week) >= 0;
export const PHOTO_NOTE = "The photos never leave the phone: they are stored inside the app, not in your camera roll and not on anything of anyone else's. They travel in the backup with everything else, written into it as base64 — which is why a backup with photos in it is a large file.";

/* ================================================================
   8 · THE FUEL APP'S EXPORT
   Bodyweight and waist come from the fuel app if its export has been
   imported; otherwise they are typed here. The parser is deliberately
   forgiving about the shape it is handed.
   ================================================================ */
const pick = (o, names) => { for (let i = 0; i < names.length; i++) { const v = num(o[names[i]]); if (v != null) return v; } return null; };
const pickDate = (o) => { const k = ["d", "date", "day", "when", "logged", "timestamp"].find((x) => o[x]); if (!k) return null;
  const s = String(o[k]); const m = s.match(/\d{4}-\d{2}-\d{2}/); if (m) return m[0];
  const t = Date.parse(s); return isNaN(t) ? null : new Date(t).toISOString().slice(0, 10); };

export function parseFuelExport(text) {
  let d; try { d = typeof text === "string" ? JSON.parse(text) : text; } catch (e) { return null; }
  if (!d || typeof d !== "object") return null;
  const pools = [];
  const walk = (x, depth) => { if (!x || depth > 4) return;
    if (Array.isArray(x)) { if (x.length && typeof x[0] === "object") pools.push(x); return; }
    if (typeof x === "object") Object.keys(x).forEach((k) => walk(x[k], depth + 1)); };
  walk(d, 0);
  const rows = [];
  pools.forEach((arr) => arr.forEach((o) => {
    if (!o || typeof o !== "object") return;
    const bw = pick(o, ["bw", "weight", "bodyweight", "bodyWeight", "kg", "weightKg"]);
    const waist = pick(o, ["waist", "waistCm", "wa"]);
    if (bw == null && waist == null) return;
    const date = pickDate(o); if (!date) return;
    rows.push({ d: date, bw, waist });
  }));
  if (!rows.length) return null;
  const by = {};
  rows.forEach((r) => { const cur = by[r.d] || { d: r.d }; if (r.bw != null) cur.bw = r.bw; if (r.waist != null) cur.waist = r.waist; by[r.d] = cur; });
  const entries = Object.keys(by).sort().map((k) => by[k]);
  return { importedAt: new Date().toISOString().slice(0, 10), entries };
}

/* bodyweight and waist: the fuel app first, then whatever was typed here */
export function bodyNow(fuel, body) {
  const fe = ((fuel || {}).entries || []).slice();
  const rows = fe.map((e) => ({ d: e.d, bw: num(e.bw), waist: num(e.waist), src: "fuel" }))
    .concat((body || []).map((e) => ({ d: e.d, bw: num(e.bw), waist: num(e.wa), src: "here" })))
    .filter((r) => r.bw != null || r.waist != null)
    .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  const last = (f) => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i][f] != null) return rows[i]; return null; };
  const prev = (f, notD) => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i][f] != null && rows[i].d !== notD) return rows[i]; return null; };
  const bwL = last("bw"), waL = last("waist");
  return {
    rows,
    bw: bwL ? { v: bwL.bw, d: bwL.d, src: bwL.src, prev: (prev("bw", bwL.d) || {}).bw } : null,
    waist: waL ? { v: waL.waist, d: waL.d, src: waL.src, prev: (prev("waist", waL.d) || {}).waist } : null,
    fromFuel: !!fe.length,
  };
}

/* ================================================================
   9 · THE DASHBOARD
   Seven numbers, each with the way it is moving and the day it was
   last written down. In camp, the camp's target sits beside it.
   ================================================================ */
export const CAMP_TARGET = {
  fade: "8–12 points better than week 2",
  t20: "+8–10% on week 1",
  burst: "the decrement halved",
  recovery: "a bigger drop than week 1",
  rhr: "down 4–8 beats",
  hrv: "up on week 1",
  body: "weight held, waist down",
};

/* the log entries for one id, oldest first */
export function series(log, id, camp, day) {
  const out = [];
  Object.keys(log || {}).forEach((k) => {
    const p = parseKey(k); if (!p || p.id !== id) return;
    if (camp ? p.macro !== "C" : p.macro === "C") return;
    if (day && p.day !== day) return;
    const v = num((log[k] || {}).w); if (v == null) return;
    out.push({ macro: p.macro, week: p.week, day: p.day, label: (p.macro === "C" ? "w" : "m" + p.macro + "w") + p.week, v });
  });
  return out.sort((a, b) => (String(a.macro) === String(b.macro) ? a.week - b.week : String(a.macro) < String(b.macro) ? -1 : 1));
}

/* the same, for a value the app computes rather than one you type */
export function pairSeries(log, idA, idB, camp, day, f) {
  const a = {}, b = {};
  series(log, idA, camp, day).forEach((r) => { a[r.label] = r; });
  series(log, idB, camp, day).forEach((r) => { b[r.label] = r; });
  return Object.keys(a).filter((k) => b[k]).map((k) => Object.assign({}, a[k], { v: f(a[k].v, b[k].v) }))
    .filter((r) => r.v != null)
    .sort((x, y) => x.week - y.week);
}

/* the direction of travel: the last number against the one before it */
export function trend(rows, dir) {
  const r = (rows || []).filter((x) => x && x.v != null);
  if (!r.length) return { v: null, arrow: "", good: null, last: null, prev: null, delta: null };
  const last = r[r.length - 1], prev = r.length > 1 ? r[r.length - 2] : null;
  const delta = prev ? last.v - prev.v : null;
  const flat = delta == null || Math.abs(delta) < 1e-9;
  return {
    v: last.v, last, prev, delta,
    arrow: flat ? "→" : delta > 0 ? "↑" : "↓",
    good: flat || delta == null ? null : dir === "down" ? delta < 0 : delta > 0,
  };
}
