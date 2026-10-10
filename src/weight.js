/* ================================================================
   MAKING WEIGHT — weight-making.md, as code.

   When a fight has a weight limit the app runs the food down to it.
   The morning scales go in every day; the line gives every Sunday an
   aim; the Sunday check moves the food one step at most. The weight
   comes off through food only — never water, never extra training —
   and nothing in here ever touches a session, a load or a week.

   Everything below is THE ARITHMETIC — FOR THE APP, line for line.
   Dates are ISO strings throughout; the arithmetic is done in UTC so a
   clock change never moves a Sunday.
   ================================================================ */

const DAY = 86400000;
const toT = (s) => { const p = String(s).split("-").map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); };
const toS = (t) => new Date(t).toISOString().slice(0, 10);
export const plusDays = (s, n) => toS(toT(s) + n * DAY);
const dow = (s) => (new Date(toT(s)).getUTCDay() + 6) % 7; /* Monday 0 … Sunday 6 */
const daysBetween = (a, b) => Math.round((toT(b) - toT(a)) / DAY);
export const isSunday = (s) => dow(s) === 6;
/* the Sunday that ends the week s falls in */
export const sundayOf = (s) => plusDays(s, 6 - dow(s));
/* the Sunday strictly after s */
const nextSunday = (s) => (isSunday(s) ? plusDays(s, 7) : sundayOf(s));
/* the Monday strictly after s */
const mondayAfter = (s) => plusDays(s, 7 - dow(s));
const EPS = 1e-9;
const n0 = (v) => { if (v === "" || v == null) return null; const n = Number(String(v).replace(",", ".")); return isNaN(n) ? null : n; };
export const r1 = (x) => (x == null ? null : Math.round(x * 10 + (x >= 0 ? EPS : -EPS)) / 10);
export const kg1 = (x) => (x == null ? "—" : r1(x).toFixed(1));

/* Settings → Fight booked? → Yes: the three weigh-ins. Not confirmed yet
   is the afternoon or evening — the safer plan. */
export const WEIGH_INS = [["am", "DAY BEFORE – MORNING"], ["before", "DAY BEFORE – AFTERNOON OR EVENING"], ["day", "ON THE DAY"]];
export const WEIGH_IN_SAY = { am: "the day before, in the morning", before: "the day before, in the afternoon or evening", day: "on the day" };
export const WEIGHT_FIELDS = ["limit", "tol", "natural"];

/* The plan's settings, read off the season's answers. Null is "off": no
   fight, or no limit. */
export function weightCfg(season) {
  const s = season || {};
  const limit = n0(s.limit);
  if (!s.booked || !s.fight || !(limit > 0)) return null;
  const tol = n0(s.tol), nat = n0(s.natural);
  return { limit, tol: tol > 0 ? tol : 0, natural: nat > 0 ? nat : null, weighIn: s.weighIn === "am" || s.weighIn === "day" ? s.weighIn : "before", fight: s.fight };
}
export const sameCfg = (a, b) => !!a && !!b && ["limit", "tol", "natural", "weighIn", "fight"].every((k) => String(a[k]) === String(b[k]));

/* THE NUMBERS — the ceiling, the fight-week aim, the weigh-in morning aim. */
export function numbers(cfg) {
  const C = cfg.limit + cfg.tol;
  const F = cfg.weighIn === "am" ? C + 1.0 : cfg.weighIn === "before" ? C + 0.5 : C;
  const M = cfg.weighIn === "before" ? C - 1.0 : C - 0.5;
  return { C, F, M };
}

/* Fight week's dates. The last check is the Sunday before the Monday of
   fight week — or, for a fight early in the week whose light days would
   fall on or before that Sunday, the last Sunday before the light days. */
export function fightDates(cfg) {
  const fight = cfg.fight, before = cfg.weighIn !== "day";
  const weighDay = before ? plusDays(fight, -1) : fight;
  const fwMon = plusDays(fight, -dow(fight));
  const light = before ? [plusDays(weighDay, -2), plusDays(weighDay, -1)] : null;
  const lowFibre = before ? null : [plusDays(fight, -2), plusDays(fight, -1)];
  let lastCheck = plusDays(fwMon, -1);
  if (light && light[0] <= lastCheck) lastCheck = plusDays(light[0], -dow(light[0]) - 1);
  return { fight, weighDay, fwMon, light, lowFibre, lastCheck };
}

/* The seven-morning average on a day: the weights logged that day and the
   six days before. It needs at least three. */
export function averageOn(weights, s) {
  const xs = [];
  for (let i = 0; i < 7; i++) { const v = n0((weights || {})[plusDays(s, -i)]); if (v != null && v > 0) xs.push(v); }
  return { n: xs.length, avg: xs.length >= 3 ? xs.reduce((a, b) => a + b, 0) / xs.length : null };
}
const weightOn = (weights, s) => { const v = n0((weights || {})[s]); return v != null && v > 0 ? v : null; };

/* THE LINE, from S on the day it's drawn. */
export function drawLine(cfg, S, at, prov) {
  const { C, F, M } = numbers(cfg);
  const U = cfg.natural || S;
  const fd = fightDates(cfg);
  const sundays = [];
  /* the Sundays after the day it's drawn, up to and including the last check */
  for (let x = nextSunday(at); x <= fd.lastCheck; x = plusDays(x, 7)) sundays.push(x);
  const N = sundays.length;
  const hold = S <= F + EPS;
  const E = Math.min(Math.max(0, S - Math.max(U, F)), 0.04 * S);
  const R = Math.max(0, S - F - E);
  const d = N ? Math.min(R / N, 0.01 * U) : 0;
  const aims = sundays.map((x, i) => (hold ? F : S - Math.min(E, 1.5 * (i + 1)) - d * (i + 1)));
  const firstStep = hold ? 0 : R <= EPS ? 1 : d <= 0.35 + EPS ? 1 : d <= 0.55 + EPS ? 2 : d <= 0.75 + EPS ? 3 : 4;
  const P = hold ? S : N ? aims[N - 1] : S;
  const forecast = C - 1.0 + (P - F);
  return { cfg, at, S, prov: !!prov, U, C, F, M, E, R, d, N, sundays, aims, hold, firstStep, forecast, capped: N > 0 && R / N > 0.01 * U + EPS, dates: fd };
}
export const aimOn = (line, sun) => { const i = line ? line.sundays.indexOf(sun) : -1; return i >= 0 ? line.aims[i] : null; };

/* Forecast colour: over the ceiling red, within half a kilo of it amber. */
export const forecastTone = (f, C) => (f > C + EPS ? "red" : f >= C - 0.5 - EPS ? "amber" : "green");

/* THE SUNDAY CHECK, for k = 1 … N − 1. */
export function decide({ A, aim, prevA, S, U, step, age, bad }) {
  const gap = A - aim;
  const fell = Math.min(prevA != null ? prevA : S, U) - A;
  const fast = A <= U + EPS && fell > 0.01 * U + EPS;
  if (gap > 0.4 + EPS) {
    const why = fast ? "fast" : bad >= 3 ? "recovery" : step >= 4 ? "floor" : null;
    return why ? { verdict: "HOLDING", behind: true, why, gap, fell, next: step } : { verdict: "BEHIND", gap, fell, next: Math.min(4, step + 1) };
  }
  if (fast && age >= 2) return { verdict: "TOO FAST", gap, fell, next: Math.max(0, step - 1) };
  if (gap < -0.8 - EPS && A <= U + EPS && age >= 2) return { verdict: "AHEAD", gap, fell, next: Math.max(0, step - 1) };
  /* the plan's first two weeks: what would have been a step up holds */
  const young = age < 2 && (fast || (gap < -0.8 - EPS && A <= U + EPS));
  return { verdict: "ON TRACK", gap, fell, next: step, young };
}
export const HOLD_WHY = {
  fast: "the weight is already coming off fast below your natural weight",
  recovery: "three or more yellow or red mornings this week — recovery comes first",
  floor: "you're already at Step 4, the floor",
};

/* One Sunday on a line, k = 1 … N: the forecast, the check (or, on
   Sunday N, the report), and the checkpoint at k = N − 2. */
export function sundayCheck(line, k, { A, prevA, step, age, bad }) {
  const P = line.aims[line.N - 1] + (A - line.aims[k - 1]);
  const forecast = line.C - 1.0 + (P - line.F);
  if (k >= line.N) return { last: true, verdict: "LAST CHECK", next: step, forecast, over: forecast > line.C + EPS };
  const r = decide({ A, aim: line.aims[k - 1], prevA, S: line.S, U: line.U, step, age, bad });
  const checkpoint = k === line.N - 2;
  return Object.assign(r, { bad, age, forecast, checkpoint, over: checkpoint && forecast > line.C + EPS });
}

/* A draw becomes a line once there's a weight to draw it from: the
   average on the day, or the weight entered that day (a provisional line
   that the first Sunday redraws). A redraw with no average takes the
   latest weight before it. With no weight at all it waits for the first. */
function resolveDraw(d, weights, first, prevProv) {
  const a = averageOn(weights, d.at);
  if (a.avg != null) return { at: d.at, cfg: d.cfg, S: a.avg, prov: false };
  const w = weightOn(weights, d.at);
  if (w != null) return { at: d.at, cfg: d.cfg, S: w, prov: first || prevProv };
  const days = Object.keys(weights || {}).filter((k) => weightOn(weights, k) != null).sort();
  if (!first) { const before = days.filter((k) => k < d.at).pop(); if (before) return { at: d.at, cfg: d.cfg, S: weightOn(weights, before), prov: prevProv }; }
  const after = days.find((k) => k > d.at);
  if (after) { const a2 = averageOn(weights, after); return { at: after, cfg: d.cfg, S: a2.avg != null ? a2.avg : weightOn(weights, after), prov: a2.avg == null && (first || prevProv) }; }
  return null;
}

/* The whole plan, replayed from the day it was set to today: every line,
   every Sunday's result, and the step on every day.
     draws:   [{ at, cfg }] — the day it was set, then every change
     weights: { iso: kg } — the morning scales
     asked:   { sundayIso: kg } — the one weight a thin week's check asks for
     bad:     (sundayIso) => yellow or red mornings, Monday to Sunday */
export function runPlan({ draws, weights, asked, bad, today }) {
  const ds = (draws || []).filter((d) => d && d.at && d.cfg).slice().sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  const out = { lines: [], checks: {}, timeline: [], setAt: null, line: null, waiting: !ds.length, firstAt: ds.length ? ds[0].at : null };
  if (!ds.length) return finish(out);
  let line = null, step = 0, prevA = null, di = 0, prov = false;
  const take = (x) => {
    const r = resolveDraw(ds[x], weights, !line, prov);
    if (!r) return;
    const nl = drawLine(r.cfg, r.S, r.at, r.prov);
    if (!line) { step = nl.firstStep; out.setAt = r.at; out.timeline.push({ from: mondayAfter(r.at), step }); }
    prov = nl.prov; line = nl; out.lines.push(Object.assign({ why: out.lines.length ? "redraw" : "set", step }, nl));
  };
  const A = (x) => { const a = averageOn(weights, x); if (a.avg != null) return { A: a.avg, n: a.n, src: "avg" };
    const w = n0((asked || {})[x]); return w > 0 ? { A: w, n: a.n, src: "asked" } : { A: null, n: a.n, src: null }; };
  /* the first resolvable draw sets the plan */
  while (di < ds.length && !line) { take(di); di++; }
  if (!line) { out.waiting = true; return finish(out); }
  for (let x = nextSunday(out.setAt); x <= today; x = plusDays(x, 7)) {
    while (di < ds.length && ds[di].at < x) { take(di); di++; }
    const k = line.sundays.indexOf(x) + 1;
    if (k >= 1) {
      const a = A(x), age = Math.floor(daysBetween(out.setAt, x) / 7);
      const base = { sun: x, k, N: line.N, n: a.n, src: a.src, A: a.A, aim: line.aims[k - 1], prevA, stepBefore: step, line };
      if (a.A == null) out.checks[x] = Object.assign(base, { pending: true, next: step });
      else if (line.prov) {
        /* the first Sunday with a weight redraws the provisional line
           from it, with the Sundays left, sets the step from it, and
           decides nothing else */
        const nl = drawLine(line.cfg, a.A, x, false);
        step = nl.firstStep; prov = false;
        out.timeline.push({ from: plusDays(x, 1), step });
        out.lines.push(Object.assign({ why: "settle", step }, nl));
        out.checks[x] = Object.assign(base, { settle: true, verdict: "SETTLED", next: step, line: nl, aim: null, forecast: nl.forecast, over: nl.forecast > nl.C + EPS });
        line = nl; prevA = a.A;
      } else {
        const r = sundayCheck(line, k, { A: a.A, prevA, step, age, bad: k < line.N && bad ? bad(x) : 0 });
        out.checks[x] = Object.assign(base, r);
        if (r.next !== step) { step = r.next; out.timeline.push({ from: plusDays(x, 1), step }); }
        prevA = a.A;
      }
    }
    while (di < ds.length && ds[di].at === x) { take(di); di++; }
  }
  while (di < ds.length && ds[di].at <= today) { take(di); di++; }
  out.line = line; out.step = step;
  return finish(out);
}
function finish(out) {
  out.stepOn = (s) => { let st = 0; out.timeline.forEach((e) => { if (e.from <= s) st = e.step; }); return st; };
  return out;
}

/* The line in force on a day: the last one drawn on or before it. */
export const lineOn = (plan, s) => { let l = null; (plan.lines || []).forEach((x) => { if (x.at <= s) l = x; }); return l || (plan.lines || [])[0] || null; };

/* What a day is, for the food. Null when the plan is off that day: no
   plan yet, or the fight is behind it (the transition menu runs). */
export function weightDay(plan, cfg, s) {
  if (!cfg || !plan || s > cfg.fight) return null;
  /* on from the day it was entered */
  if (plan.firstAt && s < plan.firstAt) return null;
  const fd = fightDates(cfg), nums = numbers(cfg);
  const line = lineOn(plan, s);
  const sun = sundayOf(s);
  const aim = line ? aimOn(line, sun) : null;
  const base = { cfg, nums, dates: fd, line, aim, sun, step: plan.waiting ? 0 : plan.stepOn(s) };
  if (s === cfg.fight) return Object.assign(base, { kind: "fight", step: null });
  if (fd.light && (s === fd.light[0] || s === fd.light[1])) return Object.assign(base, { kind: "light", step: null });
  if (cfg.weighIn !== "day" && s === fd.weighDay) return Object.assign(base, { kind: "weighin", step: null });
  if (fd.lowFibre && (s === fd.lowFibre[0] || s === fd.lowFibre[1])) return Object.assign(base, { kind: "lowfibre", step: 0 });
  return Object.assign(base, { kind: "step" });
}

/* The fight-week Sunday average: the last check's number, or the average
   on that Sunday. */
export function fightWeekAverage(plan, cfg, weights) {
  const fd = fightDates(cfg);
  const c = plan && plan.checks ? plan.checks[fd.lastCheck] : null;
  if (c && c.A != null) return c.A;
  return averageOn(weights, fd.lastCheck).avg;
}
/* After a day-before weigh-in: 1.25–1.5 litres for every kilo under the
   fight-week Sunday average. */
export function topUpLitres(fwAvg, weighed) {
  if (fwAvg == null || weighed == null) return null;
  const under = fwAvg - weighed;
  return { under, lo: Math.max(0, under * 1.25), hi: Math.max(0, under * 1.5) };
}

/* ================================================================
   THE WORDS — the cards' text, as weight-making.md writes it.
   ================================================================ */
export const SCALES_HEAD = "EVERY MORNING — THE SCALES";
export const SCALES_TEXT = [
  "Go to the toilet, then get on the scales before you eat or drink, with nothing on. Use the same scales, in the same spot, on a hard floor. Type the number. Miss a morning and nothing breaks, but three mornings a week is the least that works.",
  "The app always uses the average of your last seven mornings, never one morning on its own. One salty dinner can put a kilo on overnight, and it's gone the next day.",
];
export const overLine = (forecast, C) => "At this pace you'll be about " + kg1(forecast) + " on the scales — " + kg1(forecast - C) + " over.";
export const CHECKPOINT_TEXT = [
  "Two weeks out is the time to talk to the promoter about a catchweight, the next weight up, or a later date.",
  "One more lever if you're going for it, and still no water: stop the creatine from that Sunday. The extra water it holds in the muscle drains slowly, about half a kilo by the weigh-in. It costs a little repeat power. Your call.",
  "The plan carries on either way.",
];
export const LIGHT_DAYS_TEXT = [
  "Low fibre and fewer carbs. This menu replaces the whole day.",
  "No three o'clock and no 5pm load.",
  "No fruit, no veg, no beans, no oats, no wholemeal, no mushrooms, no passata.",
  "Salt as normal.",
  "Drink the full schedule — every drink on it, as on any other day.",
  "Creatine as normal. On a tendon day, collagen in water, without the orange juice.",
];
export const REWEIGH_TEXT = "Still over on the official scales: most shows give you a re-weigh within an hour or two. Use the toilet and walk in normal clothes. Never a sauna, a sweat suit, spitting, laxatives, water pills or going without water. Missing by a few hundred grams costs a fine or a catchweight. Dehydrating at 45, after weeks of cutting, costs the fight and can cost a lot more.";
export const AFTER_FIGHT_TEXT = "The weight plan switches off and the transition menu runs from the next day. Expect 2–4 kg back within the week. That's the food, the water and the stored carbohydrate coming back. It's the plan working, not fat.";
export const STEP_SAY = {
  0: "Nothing. The menu as printed.",
  1: "No three o'clock. No honey at breakfast.",
  2: "Lunch: half the carb. Thursday and Sunday dinner: half the carb. Saturday's mid-morning and lunch at standard portions, not BIG.",
  3: "Mid-morning: half the carb. Tuesday, Friday and Saturday dinner: half the carb. Monday and Friday breakfast: no banana.",
  4: "Breakfast: no banana, every day. Monday and Friday breakfast: half the oats or half the bagel as well. The BIG breakfasts at standard size. Nothing goes lower than this.",
};
export const STEP_KCAL = { 0: 3600, 1: 3350, 2: 3150, 3: 2900, 4: 2700 };
