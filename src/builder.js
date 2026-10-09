import { iso, mondayOf, parseISO, addDays } from "./ui.jsx";
import { campMaster, campBenchMaster, campEdge } from "./camp.js";
import { prepRx, prepEdge } from "./prep.js";
import { lowerStage } from "./safety.js";

/* ================================================================
   THE SEASON BUILDER — season-builder.md, as code.

   Settings asks one question, "Fight booked?", and a handful more if
   the answer is yes. Every answer is kept as a PLAN: the inputs and the
   Monday it runs from. The season is the plans laid end to end — each
   one runs from its own Monday until the next one starts — so changing
   an answer re-plans from today forward and every week already lived
   keeps the plan it was lived under.

   A plan is built out of the two master programs and nothing else:
     · no fight      — Prep's 16-week cycle, on repeat
     · 11+ weeks     — Prep fitted by the N table, then the full camp
     · 6–10 (7–10)   — the camp, shortened from the front
     · under 6 (7)   — the short-notice camp
     · after a fight — the head check, the transition, then Prep
   Each week of the result is a ROW: { program, id, mon, sun, ... }.
   The week's prescription is campWeekRx / prepWeekRx below, read off
   the master week the row names, with only the changes these pages
   write: the format, the pairs, starting fitness, engine-first, the
   emphasis, the tendon ramp, the Edge's window and the standing rules.
   ================================================================ */

const WEEK_MS = 604800000;
export const monOf = (isoDay) => iso(mondayOf(parseISO(isoDay)));
export const weeksBetween = (a, b) => Math.round((parseISO(monOf(b)) - parseISO(monOf(a))) / WEEK_MS);
/* A plan made on a Monday starts that Monday; otherwise the next one. */
export const planStartFor = (today) => { const m = monOf(today); return m === today ? today : addDays(m, 7); };
const containsDate = (mon, md) => { const y = Number(mon.slice(0, 4)); return [y, y + 1].some((yy) => { const d = yy + "-" + md; return d >= mon && d <= addDays(mon, 6); }); };

export const FIGHT_DEFAULTS = { rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "good", emphasis: "none" };
export const FITNESS = ["low", "moderate", "good"];
export const EMPHASES = ["none", "power", "strength", "durability"];

/* ---------------- the camp, and how it shortens ---------------- */
export const MASTER_WEEK = { F1: 1, F: 1, B1: 2, B2: 3, B3: 4, E: 5, P1: 6, P2: 7, P3: 8, S: 9, FW: 10, E1: 6, E2: 8 };
const MASTER_10 = ["F", "B1", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"];
export const CAMP_MG = {
  10: MASTER_10,
  9: ["F", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"],
  8: ["F", "B2", "E", "P1", "P2", "P3", "S", "FW"],
  7: ["F", "B2", "P1", "P2", "P3", "S", "FW"],
  6: ["F", "B2", "P1", "P3", "S", "FW"],
};
export const CAMP_LOW = {
  10: ["F1", "F", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"],
  9: ["F1", "F", "B2", "E", "P1", "P2", "P3", "S", "FW"],
  8: ["F1", "F", "B2", "P1", "P2", "P3", "S", "FW"],
  7: ["F1", "F", "B2", "P1", "P3", "S", "FW"],
};
export const SHORT_MG = { 5: ["F", "E1", "E2", "S", "FW"], 4: ["F", "E1", "S", "FW"], 3: ["E1", "S", "FW"], 2: ["S", "FW"], 1: ["FW"] };
export const SHORT_LOW = { 6: ["F1", "F", "E1", "E2", "S", "FW"], 5: ["F1", "E1", "E2", "S", "FW"], 4: ["F1", "E1", "S", "FW"], 3: ["F1", "S", "FW"], 2: ["S", "FW"], 1: ["FW"] };

/* The camp for M weeks from this fitness, and whether it is the
   short-notice camp. */
export function campLayout(M, fitness) {
  const low = fitness === "low", m = Math.max(1, Math.min(10, M));
  if (low) return m >= 7 ? { ids: CAMP_LOW[m], short: false } : { ids: SHORT_LOW[m], short: true };
  return m >= 6 ? { ids: CAMP_MG[m], short: false } : { ids: SHORT_MG[m], short: true };
}

/* ---------------- Prep, fitted by the N table ---------------- */
export const CYCLE16 = ["P1", "P2", "P3", "P4", "P4b", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P12b", "P13", "P14"];
const P = (...a) => a.map((x) => "P" + x);
export const PREP_N = {
  15: P(1, 2, 3, 4, "4b", 5, 6, 7, 8, 9, 10, 11, 12, 13, 14),
  14: P(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14),
  13: P(2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14),
  12: P(3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14),
  11: P(3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14),
  10: P(3, 4, 5, 6, 7, 8, 9, 10, 13, 14),
  9: P(3, 4, 5, 7, 8, 9, 10, 13, 14),
  8: P(4, 5, 7, 8, 9, 10, 13, 14),
  7: P(4, 5, 7, 8, 9, 10, 14),
  6: P(4, 5, 7, 8, 10, 14),
  5: P(4, 7, 8, 10, 14),
  4: P(4, 7, 8, 14),
};
/* The Prep for N weeks, as segments that each end in a test day. */
export function prepLayout(N) {
  if (N >= 20) return [CYCLE16.slice()].concat(prepLayout(N - 16));
  if (N >= 17) { const c = CYCLE16.slice(); c.splice(5, 0, ...["P4c", "P4d", "P4e"].slice(0, N - 16)); return [c]; }
  if (N === 16) return [CYCLE16.slice()];
  if (PREP_N[N]) return [PREP_N[N].slice()];
  return [];
}
/* "P4b" → document row 4, two and a half percent on; "P12b" → row 12 at 88% */
export function prepIdInfo(id) {
  const m = String(id).match(/^P(\d+)([a-z]?)$/); const doc = m ? Number(m[1]) : 1, s = m ? m[2] : "";
  const plus = doc === 4 && s ? 2.5 * (s.charCodeAt(0) - 97) : 0;
  return { doc, plus, p88: doc === 12 && s === "b" };
}

/* ================================================================
   THE ROWS
   ================================================================ */
const fightMinutes = (inp) => (Number(inp.rounds) || 6) * (Number(inp.mins) || 3);
export const transitionWeeks = (inp) => (fightMinutes(inp) <= 9 ? 1 : 2);

function prepRows(ids, segIdx, extra) {
  const hasDoc = (d) => ids.some((x) => prepIdInfo(x).doc === d);
  let benchEarlyDone = hasDoc(6);
  /* test day's depth jump is from the box you've trained on */
  const depthTrained = ids.some((x) => { const d = prepIdInfo(x).doc; return d >= 11 && d <= 13; });
  return ids.map((id, i) => {
    const inf = prepIdInfo(id);
    const r = Object.assign({ program: "prep", id, doc: inf.doc, plus: inf.plus, p88: inf.p88, seg: segIdx, segLen: ids.length, depthTrained }, extra || {});
    r.profile = i === 0 || inf.doc === 10 || (inf.doc === 14 && !hasDoc(10));
    if (!benchEarlyDone && inf.doc >= 6 && inf.doc <= 13) { r.benchEarly = 1; benchEarlyDone = true; }
    r.size = inf.doc <= 5 ? "full" : inf.doc <= 13 ? "half" : null;
    return r;
  });
}

/* THE TRANSITION after a fight, week by week from the Monday after fight
   week: { mon, hold } while the head check holds it, then the transition
   — one week after a fight of 9 minutes or less, two after a longer one —
   and on until the strap says you're back, for the weeks that have
   happened.
   The head check: the app asks the morning after the fight, and the
   transition doesn't start until it's answered. Yes — stopped, dropped or
   any symptoms — and it doesn't start until a doctor has cleared you: the
   weeks up to the clearance (or, uncleared or unanswered, up to this one)
   are held. No, and it starts. */
function transitionPlan(fight, finp, ctx) {
  const tw = transitionWeeks(finp);
  const out = [];
  let mon = addDays(monOf(fight), 7);
  const h = ctx.head ? ctx.head(fight) : null;
  const unanswered = !!ctx.head && !h && addDays(fight, 1) <= ctx.today;
  if ((h && h.a === "yes") || unanswered) {
    const clearMon = h && h.cleared ? planStartFor(h.cleared) : null;
    while (clearMon ? mon < clearMon : mon <= ctx.todayMon) { out.push({ mon, hold: 1 }); mon = addDays(mon, 7); if (out.length > 52) break; }
  }
  let k = 0;
  while (k < tw || (mon <= ctx.todayMon && !ctx.strapBack(addDays(mon, -1)))) {
    out.push({ mon, idx: ++k, tw }); mon = addDays(mon, 7); if (k > 12) break;
  }
  return { weeks: out, end: mon, tw };
}
const transitionRow = (t, fight) => (t.hold
  ? { program: "transition", id: "HOLD", hold: 1, idx: 0, tw: 0, fight }
  : { program: "transition", id: "T", idx: t.idx, tw: t.tw, fight });

/* One plan's rows, from its own Monday. ctx carries what came before:
   the last fight and its transition, and the row before. */
function genPlan(plan, ctx, horizon) {
  const inp = Object.assign({}, FIGHT_DEFAULTS, plan.inputs || {});
  const rows = [];
  let cur = plan.from;
  const push = (r) => { rows.push(Object.assign({ mon: cur, sun: addDays(cur, 6), plan: plan.from }, r)); cur = addDays(cur, 7); };
  const cycles = () => {
    let c = 0;
    do { prepRows(CYCLE16, ++c, { cycle: c }).forEach((r) => push(r)); } while (cur <= horizon);
  };

  /* a transition carried over from the last plan's fight */
  let afterFight = false;
  if (ctx.prevFight) {
    const tp = transitionPlan(ctx.prevFight, ctx.prevFightInp, ctx);
    if (tp.end > cur) {
      afterFight = true;
      tp.weeks.filter((t) => t.mon >= cur).forEach((t) => { cur = t.mon; push(transitionRow(t, ctx.prevFight)); });
    } else if (tp.end === cur) afterFight = true;
  }

  if (plan.inputs && plan.inputs.classic && !plan.inputs.booked) return { rows, classic: true };
  const booked = !!(inp.booked && inp.fight && monOf(inp.fight) >= cur);
  if (!booked) { cycles(); return { rows }; }

  const fightMon = monOf(inp.fight);
  const M = weeksBetween(cur, fightMon) + 1;
  let fitness = inp.fitness;
  let lastBefore = rows.length ? rows[rows.length - 1] : ctx.lastRow;
  let filler = false;
  if (M >= 11) {
    const N = M - 10;
    const segs = prepLayout(N);
    if (segs.length) segs.forEach((ids, si) => prepRows(ids, si + 1, { fitted: 1 }).forEach((r) => push(r)));
    else {
      /* 1–3 weeks: straight after a fight, the transition's easy weeks run
         on until the camp; otherwise those weeks run as P1, P2 and P3 */
      filler = true;
      for (let k = 0; k < N; k++) {
        if (afterFight) { const last = rows[rows.length - 1]; push({ program: "transition", id: "T", idx: (last && last.program === "transition" ? last.idx : 0) + 1, tw: transitionWeeks(ctx.prevFightInp || inp), fight: ctx.prevFight, runOn: 1 }); }
        else push(Object.assign(prepRows(["P1", "P2", "P3"].slice(k, k + 1), 1, { filler: 1 })[0], { profile: k === 0 }));
      }
    }
    if (rows.length) lastBefore = rows[rows.length - 1];
  }
  /* a re-plan inside a camp that is already running carries it on: no
     week before, no checks, no week-1 tests — those were the camp's */
  const continuation = !rows.length && !!(lastBefore && lastBefore.program === "camp" && lastBefore.id !== "FW" && addDays(lastBefore.mon, 7) === cur);
  /* straight after a Prep test week, the app sets good fitness and uses
     test week's numbers */
  const afterTest = !!(lastBefore && lastBefore.program === "prep" && lastBefore.doc === 14 && addDays(lastBefore.mon, 7) === cur);
  if (afterTest) fitness = "good";
  const lay = campLayout(weeksBetween(cur, fightMon) + 1, fitness);
  const ids = lay.ids, n = ids.length;
  /* the working-weight checks, the broad jump and throw, the 20-minute
     test: before week 1 if there's time, otherwise in week 1 */
  const testDayRecent = ctx.lastTestDay && (parseISO(cur) - parseISO(ctx.lastTestDay)) / 86400000 <= 21;
  const needChecks = !afterTest && !continuation && (fitness === "low" || (fitness === "moderate" && !testDayRecent));
  const preRow = !rows.length && !filler && !continuation && plan.made && plan.made < plan.from;
  const checks = needChecks ? (preRow ? "pre" : "week1") : null;
  /* the week-1 tests: the burst test opens Tuesday and the nasal test
     opens Thursday, unless the camp follows a Prep test week, which has
     just measured both. Good fitness is test week's numbers: a camp from
     good fitness with nothing before it in the season is the camp Prep's
     test week hands on — Optimal 8 · Camp itself. */
  const offTestWeek = afterTest || (fitness === "good" && !lastBefore && !rows.length);
  const weekOneTests = !offTestWeek && !continuation;
  const ef = fitness === "low" || lay.short;
  const firstEdge = (fitness === "low" || lay.short) ? ids.findIndex((x) => /^(P|E\d)/.test(x)) : 0;
  const lastBuild = ids.reduce((a, x, i) => (/^B/.test(x) ? i : a), -1);
  const sIdx = ids.indexOf("S");
  const lastHard = (sIdx >= 0 ? sIdx : ids.indexOf("FW")) - 1;
  /* the pre-camp check in the week before the camp's first Monday — or,
     when that week has already gone, in week 1 */
  const preInWeek1 = !continuation && !rows.length && !preRow && !offTestWeek;
  const camp = { R: Number(inp.rounds) || 6, mins: Number(inp.mins) || 3, rest: Number(inp.rest) || 60, fitness, entered: inp.fitness,
    emphasis: inp.emphasis || "none", ef, short: lay.short, firstEdge: firstEdge < 0 ? n : firstEdge, lastBuild, lastHard, n, ids,
    fight: inp.fight, weighIn: inp.weighIn || "before", checks, afterTest, weekOneTests, continuation, preInWeek1 };
  if (rows.length) rows[rows.length - 1].preCamp = 1;
  const pre = preRow ? { program: "pre", id: "PRE", mon: addDays(plan.from, -7), sun: addDays(plan.from, -1), plan: plan.from, made: plan.made, preCamp: 1, camp } : null;
  const campStart = cur;
  ids.forEach((id, i) => push({ program: "camp", id, idx: i + 1, campStart, camp }));
  /* after the fight: the head check, the transition, then Prep */
  transitionPlan(inp.fight, inp, ctx).weeks.forEach((t) => { cur = t.mon; push(transitionRow(t, inp.fight)); });
  cycles();
  return { rows: pre ? [pre].concat(rows) : rows };
}

/* The whole season. plans: [{ from, made, inputs }], oldest first.
   strapBack(isoDay): were the morning numbers back by that day?
   head(fightIso): the head check's answer { a: "yes"|"no", cleared }. */
export function buildSeason(o) {
  const plans = (o.plans || []).filter((p) => p && p.from).slice().sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  const today = o.today || iso(new Date());
  const todayMon = monOf(today);
  const strapBack = o.strapBack || (() => true);
  const head = o.head || null;
  const horizon = addDays(todayMon, 7 * 26);
  let rows = [], classic = false;
  plans.forEach((plan, i) => {
    const next = plans[i + 1];
    /* what came before this plan */
    const before = rows.filter((r) => r.mon < plan.from);
    const lastRow = before[before.length - 1] || null;
    const fights = before.filter((r) => r.program === "camp" && r.camp.fight < plan.from).map((r) => r.camp);
    const pf = fights.length ? fights[fights.length - 1] : null;
    const tests = before.filter((r) => r.program === "prep" && r.doc === 14);
    const ctx = {
      today, todayMon, strapBack, head, lastRow,
      prevFight: pf ? pf.fight : null, prevFightInp: pf ? { rounds: pf.R, mins: pf.mins } : null,
      lastTestDay: tests.length ? addDays(tests[tests.length - 1].mon, 5) : null,
    };
    const g = genPlan(plan, ctx, horizon);
    let mine = g.rows;
    classic = !!g.classic && !mine.length;
    const pre = mine.length && mine[0].program === "pre" ? mine[0] : null;
    if (pre) {
      /* the week before the camp lands on a week already under way: the
         days before the plan was made keep the week they were lived under */
      const lived = rows.find((r) => r.mon === pre.mon);
      if (lived && pre.made > pre.mon) {
        if (lived.program === "pre") { if (lived.under) { pre.under = lived.under; pre.made = lived.made; } }
        else pre.under = lived;
      }
    }
    rows = rows.filter((r) => r.mon < (pre ? pre.mon : plan.from));
    if (next) {
      mine = mine.filter((r) => r.mon < next.from);
    }
    rows = rows.concat(mine);
  });
  /* the key week of each row: counted per program across the whole
     season, so a week's log never lands on another week — a week a
     re-plan landed on mid-week is counted where it was lived */
  const mac = { prep: "P", camp: "C", transition: "T", pre: "B" };
  const cnt = {};
  /* the weeks the head check holds are counted on their own, so the
     transition's weeks keep their keys whenever the answer comes */
  const tag = (r, i) => { const m = r.hold ? "H" : mac[r.program]; cnt[m] = (cnt[m] || 0) + 1; r.mac = m; r.kw = cnt[m]; r.seq = i; };
  rows.forEach((r, i) => { if (r.under) { tag(r.under, i); r.under.overlaid = 1; } tag(r, i); });
  return { rows, classic, today, todayMon };
}

/* "4–10 Jan", "26 Oct–1 Nov"; fight week ends on the fight */
const MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function rowDates(row) {
  const end = row.program === "camp" && row.id === "FW" ? row.camp.fight : row.sun;
  const a = parseISO(row.mon), b = parseISO(end);
  const dm = (d) => d.getDate() + " " + MON3[d.getMonth()];
  return a.getMonth() === b.getMonth() ? a.getDate() + "–" + dm(b) : dm(a) + "–" + dm(b);
}
export const rowOn = (season, isoDay) => { const m = monOf(isoDay); return season.rows.find((r) => r.mon === m) || null; };
/* the row a day was lived under: the week's own, or — before a re-plan
   made mid-week — the one it replaced */
export const rowForDay = (season, isoDay) => { const r = rowOn(season, isoDay); return r && r.under && isoDay < r.made ? r.under : r; };
export const rowByKey = (season, mac, kw) => season.rows.find((r) => r.mac === mac && r.kw === kw)
  || (season.rows.find((r) => r.under && r.under.mac === mac && r.under.kw === kw) || {}).under || null;

/* ================================================================
   THE CAMP WEEK — the master week, changed only as these pages say
   ================================================================ */
const twoThirds = (n) => Math.max(1, Math.floor(n * 2 / 3));
const twoThirdsMin = (m) => Math.max(5, Math.floor(m * 2 / 3 / 5) * 5);
const floor2 = (n) => Math.max(2, n);

export const ceilingRounds = (R) => (R >= 5 ? R + Math.min(Math.ceil(2 * R / 3), 4) : null);
export const fightPaceRounds = (R) => Math.max(3, Math.ceil(2 * R / 3));
export const SHORT_PAIRS = {
  F1: ["vo2", "tempo"], F: ["vo2", "tempo"], B1: ["rz", "lac2"], B2: ["rz", "lac2"], B3: ["rz", "lac2"],
  P1: ["vo2", "rz"], P2: ["rz", "lac2"], P3: ["lac2", "rz"], E1: ["vo2", "rz"], E2: ["lac2", "rz"],
};
const MASTER_PAIRS = { E1: ["rz", "lac2"], E2: ["rz", "rz"] };

const BLOCK_LABEL = { F1: "Foundation, two-thirds", F: "Foundation", B1: "Build", B2: "Build", B3: "Build", E: "EASY + TESTS",
  P1: "Peak", P2: "Peak", P3: "Peak, last hard week", S: "SHARPEN", FW: "FIGHT WEEK", E1: "Engine", E2: "Engine, last hard week" };
const PH_OF = { F1: "c1", F: "c1", B1: "c2", B2: "c2", B3: "c2", E: "c3", P1: "c4", P2: "c4", P3: "c4", S: "c5", FW: "c6", E1: "c4", E2: "c4" };

/* The camp week's prescription. edgeOn: the switch, the guardrail and
   the day — false takes the Edge's additions off. */
export function campWeekRx(row, edgeOn) {
  const c = row.camp, id = row.id, i = row.idx - 1;
  const w = MASTER_WEEK[id];
  const rx = campMaster(w);
  const R = c.R, short = c.R * c.mins <= 9;
  const S = id === "S", FW = id === "FW", F1 = id === "F1", E = id === "E", EW = id === "E1" || id === "E2";
  const beforeS = i <= c.lastHard;
  const ef = c.ef && beforeS;
  const low = c.fitness === "low";
  Object.assign(rx, { id, cw: row.idx, n: c.n, R, mins: c.mins, rest: c.rest, split: Math.round(c.mins * 60 / 3),
    block: BLOCK_LABEL[id], ph: PH_OF[id], ef, emphasis: beforeS ? c.emphasis : "none", fitness: c.fitness,
    fightIso: c.fight, weighIn: c.weighIn, campStart: row.campStart, preCamp: !!row.preCamp || (!!c.preInWeek1 && i === 0) });
  if (c.n === 10 && c.ids.join() === MASTER_10.join()) rx.master = 1;
  /* the master week's own reactive jump, for the table */
  rx.mjump = rx.jump;
  /* fight week slides with the fight's weekday */
  rx.fightDay = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][parseISO(c.fight).getDay()];
  rx.rehearsal = addDays(c.fight, -6);
  rx.activation = addDays(c.fight, -2);

  /* the engine weeks: P1's or P3's week, with the strength at its hold
     dose and the power as written — low-box depth jumps, drop landings
     from low fitness, never full depth jumps */
  if (EW) {
    const hold = () => ({ sc: "2 × 3 @ 85% — fast", sets: 2, reps: 3, pct: 85, phase: "fast", hold: 1 });
    Object.assign(rx, { tb: hold(), sq: hold(), cr: null, cpct: null, jump: low ? "land" : "lowbox", js: [4, 4], engine: 1,
      pp: { sc: "2 × 3", sets: 2, reps: 3, pct: 85 } });
    rx.bench = { sc: "2 × 3 @ 85% — fast", sets: 2, reps: 3, pct: 85, phase: "fast" };
  } else rx.bench = campBenchMaster(w);

  /* ---- the format: the rounds, week by week ---- */
  const scoredFirst = i === 0;
  const peakR = R + (R >= 5 ? 2 : 1) + (ef ? 1 : 0);
  if (rx.sim) {
    const base = { rounds: R, mins: c.mins, rest: c.rest };
    if (F1) rx.sim = Object.assign(base, { rest: 90, scored: "baseline" });
    else if (id === "F") rx.sim = Object.assign(base, { scored: scoredFirst ? "baseline" : 0 });
    else if (/^B/.test(id)) rx.sim = Object.assign(base, { rounds: R + (ef ? 1 : 0), scored: i === c.lastBuild ? (scoredFirst ? "baseline" : 1) : (scoredFirst ? "baseline" : 0) });
    else if (E) rx.sim = Object.assign(base, { scored: 1 });
    else if (id === "P1" || id === "P2") { rx.sim = Object.assign(base, { rounds: R + (ef ? 1 : 0), scored: scoredFirst ? "baseline" : 0 }); rx.edgeRounds = peakR; }
    else if (id === "P3" || id === "E2") {
      rx.sim = Object.assign(base, { scored: "last" });
      if (R >= 5) rx.edgeRounds = ceilingRounds(R); else rx.edgeDouble = { a: R + 1, easy: 5, b: R };
    } else if (id === "E1") { rx.sim = Object.assign(base, { scored: scoredFirst ? "baseline" : 0 }); rx.edgeRounds = R + 1; }
    else if (S) rx.sim = Object.assign(base, { rehearsal: 1 });
  }
  /* rounds on the erg at the round length; the sharpen week's fight pace */
  rx.ergR = { rounds: R + (id === "P2" ? 2 : 1), mins: c.mins, rest: c.rest };
  rx.fpR = { rounds: fightPaceRounds(R), mins: c.mins, rest: c.rest };
  /* the conditioning pairs */
  if (EW) { const pr = short ? SHORT_PAIRS[id] : MASTER_PAIRS[id]; rx.eng1 = pr[0]; rx.eng2 = pr[1]; }
  else if (short && SHORT_PAIRS[id]) { rx.eng1 = SHORT_PAIRS[id][0]; rx.eng2 = SHORT_PAIRS[id][1]; }

  /* ---- the tests: in the camp's first week the burst test opens
     Tuesday's session and the nasal test opens Thursday's, unless the
     camp follows a Prep test week; the easy week and the sharpen week
     run their retests as the master writes them ---- */
  if (i === 0 && c.weekOneTests && !S && !FW && !E) { rx.tests = Object.assign({}, rx.tests, { tue: "burst" }); rx.nasal = 1; }
  if (c.checks === "week1" && i === 0 && !S && !FW) rx.checks = 1;

  /* ---- the sauna: from the camp's second week to the last hard week ---- */
  rx.sauna = i >= 1 && i <= c.lastHard ? (i === 1 ? "starts" : 1) : 0;
  /* ---- repeat sled starts on the camp's even weeks, not the easy and test weeks ---- */
  rx.repeatSled = !!rx.sled && row.idx % 2 === 0 && !E && !S && !FW;
  rx.shuttles = !S && !FW && w >= 3;
  rx.shuttleFirst = rx.shuttles && (i === 0 || MASTER_WEEK[c.ids[i - 1]] < 3 || /^F/.test(c.ids[i - 1]));

  /* ---- engine-first: the lifts at their hold dose, the engine the time ---- */
  rx.wedEasy = 30; rx.easyHour = [30, 40];
  if (ef) {
    const two = (L) => (L ? Object.assign({}, L, { sets: Math.min(L.sets, 2) }) : L);
    rx.tb = two(rx.tb); rx.sq = two(rx.sq); rx.bench = two(rx.bench);
    if (rx.cr) rx.cr = 2;
    if (rx.pp) rx.pp = Object.assign({}, rx.pp, { sets: 2 });
    rx.chins = 2;
    rx.wedEasy = 40;
    rx.base = Math.min(rx.base || 45, 45);
  }
  /* ---- F1: two-thirds dose ---- */
  if (F1) {
    rx.twoThirds = 1; rx.eff = 90;
    const t = (L) => (L ? Object.assign({}, L, { sets: twoThirds(L.sets) }) : L);
    rx.tb = t(rx.tb); rx.sq = t(rx.sq); rx.bench = t(rx.bench);
    if (rx.pp) rx.pp = Object.assign({}, rx.pp, { sets: twoThirds(rx.pp.sets) });
    rx.sled = twoThirds(rx.sled); rx.spr = Object.assign({}, rx.spr, { n: twoThirds(rx.spr.n) });
    rx.js = [twoThirds(rx.js[0]), rx.js[1]]; rx.box = [twoThirds(rx.box[0]), rx.box[1]]; rx.bsets = twoThirds(rx.bsets);
    rx.broad = twoThirds(3); rx.vec = twoThirds(rx.vec); rx.shot = twoThirds(2); rx.lm = twoThirds(2);
    rx.base = twoThirdsMin(rx.base); rx.wedEasy = twoThirdsMin(rx.wedEasy); rx.easyHour = [twoThirdsMin(30), twoThirdsMin(40)];
    rx.dose = { vo2: twoThirds(4), tempo: twoThirds(10) };
    if (ef) { rx.tb.sets = floor2(rx.tb.sets); rx.sq.sets = floor2(rx.sq.sets); rx.bench.sets = floor2(rx.bench.sets); }
  }
  if (ef) { rx.dose = Object.assign({}, rx.dose, { rz: 2, lac: 2 }); }

  /* ---- the emphasis, week 1 to the last hard week ---- */
  rx.broad = rx.broad || 3; rx.shot = rx.shot || 2; rx.lm = rx.lm || 2;
  rx.copen = 2; rx.suit = 2;
  const em = rx.emphasis;
  const contrast = rx.tb && rx.tb.phase === "contrast";
  if (em === "power") {
    if (rx.cr) rx.cr += 1; else rx.js = [rx.js[0] + 1, rx.js[1]];
    rx.shot += 1; rx.lm += 1; rx.box = [4, 3]; rx.boxAll = 1;
    if (rx.tb) rx.tb = Object.assign({}, rx.tb, { sets: floor2(rx.tb.sets - 1) });
    if (rx.sq && !contrast) rx.sq = Object.assign({}, rx.sq, { sets: floor2(rx.sq.sets - 1) });
  } else if (em === "strength") {
    const plus = (L) => (L ? Object.assign({}, L, { extra: { sets: 1, reps: L.reps, pct: L.pct + 2.5 } }) : L);
    rx.tb = plus(rx.tb); rx.sq = plus(rx.sq); rx.bench = plus(rx.bench);
    rx.broad = floor2(rx.broad - 1); rx.js = [floor2(rx.js[0] - 1), rx.js[1]];
    if (rx.cr) rx.cr = floor2(rx.cr - 1);
  } else if (em === "durability") {
    rx.neckSat = 1; rx.holdsPlus = 1; rx.noContacts = 1;
    rx.copen += 1; rx.suit += 1;
    /* low-box depth jumps instead of full depth jumps all camp, at the
       same sets and reps */
    rx.jump = lowerStage(rx.jump, "lowbox");
    rx.bsets = floor2(rx.bsets - 1); rx.broad = floor2(rx.broad - 1);
    if (rx.pp) rx.pp = Object.assign({}, rx.pp, { sets: floor2(rx.pp.sets - 1) });
  }

  /* ---- the tendon ramp, from low fitness: flying sprints at 90% for the
     camp's first two weeks; drop landings in the first two weeks, low-box
     depth jumps from week 3, full depth jumps not before week 4; the
     Nordics 2 × 3, 2 × 4, 3 × 4, then the camp's numbers ---- */
  if (low && !S && !FW) {
    if (row.idx <= 2 && rx.spr) rx.spr = Object.assign({}, rx.spr, { pct: 90 });
    if (row.idx <= 2) rx.jump = "land";
    else if (row.idx === 3) rx.jump = lowerStage(rx.jump, "lowbox");
    const ramp = [[2, 3], [2, 4], [3, 4]][row.idx - 1];
    if (ramp && rx.nor) rx.nor = ramp.slice();
    rx.ramp = 1;
  }
  if (em === "durability" && rx.nor) rx.nor = [rx.nor[0] + 1, rx.nor[1]];

  /* ---- the Edge: from the first peak or engine week in a camp from low
     fitness or at short notice; the durability emphasis keeps the contacts ---- */
  rx.edgeAllowed = i >= c.firstEdge;
  /* a fight off a Saturday can put the rehearsal in fight week itself */
  if (FW && rx.rehearsal >= row.mon) rx.sim = { rounds: R, mins: c.mins, rest: c.rest, rehearsal: 1 };
  return campEdge(rx, edgeOn !== false);
}

/* the week before the camp */
export const preWeekRx = (row) => ({ pre: 1, w: 0, cw: 0, ph: "c1", block: "BEFORE WEEK 1", preCamp: 1, checks: row.camp.checks === "pre" ? 1 : 0,
  campStart: addDays(row.mon, 7), fightIso: row.camp.fight, R: row.camp.R, mins: row.camp.mins, rest: row.camp.rest, weighIn: row.camp.weighIn });

/* any row's prescription */
export function rowRx(row, edgeOn) {
  if (!row) return null;
  if (row.program === "camp") return campWeekRx(row, edgeOn);
  if (row.program === "prep") return prepWeekRx(row, edgeOn);
  if (row.program === "pre") return preWeekRx(row);
  if (row.hold) return { w: 0, ph: "trans", trans: 1, hold: 1, doc: 0, tw: 0, fight: row.fight, preCamp: !!row.preCamp };
  return { w: row.idx, ph: "trans", trans: 1, doc: row.idx, tw: row.tw, fight: row.fight, runOn: !!row.runOn || row.idx > row.tw, preCamp: !!row.preCamp };
}

/* ================================================================
   THE PREP WEEK — the document's row, as the N table keeps it
   ================================================================ */
const q34 = (n) => Math.max(1, Math.round(n * 0.75));
const D3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayMonth = (isoDay) => { const d = parseISO(isoDay); return d.getDate() + " " + D3[d.getMonth()]; };
export function prepWeekRx(row, edgeOn) {
  const base = prepRx(row.doc);
  let rx = prepEdge(base, edgeOn !== false);
  rx = Object.assign({}, rx, { id: row.id, doc: row.doc, size: row.size, profile: row.profile ? 1 : 0, reset: base.reset && row.doc === 10 ? 1 : 0, preCamp: !!row.preCamp,
    depthTrained: row.depthTrained !== false });
  if (row.plus) {
    const pct = rx.pct + row.plus;
    rx = Object.assign({}, rx, { pct, sc: rx.sc.replace(/@ \d+(\.\d+)?%/, "@ " + pct + "%"),
      em: base.em.replace(/@ 75%/, "@ " + pct + "%") + " P4 again, +" + row.plus + "%." });
  }
  if (row.p88) rx = Object.assign({}, rx, { pct: 88, sc: rx.sc.replace(/@ 87%/, "@ 88%"), js: [4, 4],
    em: base.em.replace(/@ 87%/, "@ 88%") + " P12 again at 88%, depth jumps 4 × 4." });
  if (row.benchEarly) rx = Object.assign({}, rx, { benchDoc: 6, em: rx.em + " The bench press starts this week at P6's load, 80%." });
  else rx = Object.assign({}, rx, { benchDoc: row.doc });
  /* test day's depth jumps are from the box you've trained on */
  if (row.doc === 14 && row.depthTrained === false) rx = Object.assign({}, rx, { jump: "lowbox" });
  /* test week names its own Saturday and Sunday */
  if (row.doc === 14) rx = Object.assign({}, rx, { em: rx.em.replace("Sat 2 Jan", "Sat " + dayMonth(addDays(row.mon, 5))).replace("Sun 3 Jan", "Sun " + dayMonth(addDays(row.mon, 6))) });
  /* the bar-speed profiles: the Prep's first week, P10 if kept, else P14 */
  if (row.profile && !base.profile) rx.em = rx.em + " Load-velocity profiles drawn this week.";
  /* the Christmas rule: the week with 25 December in it at three-quarters
     volume, intensity kept — P13 is already written that way */
  const xmas = containsDate(row.mon, "12-25");
  if (xmas && row.doc !== 13) {
    rx = Object.assign({}, rx, { xmas: 1, vol34: 1, sets: rx.sets ? q34(rx.sets) : rx.sets, sled: q34(rx.sled), nor: [q34(rx.nor[0]), rx.nor[1]],
      js: [q34(rx.js[0]), rx.js[1]], box: [q34(rx.box[0]), rx.box[1]], bsets: q34(rx.bsets), split: q34(rx.split),
      spr: rx.spr ? q34(rx.spr) : rx.spr, pp: rx.pp ? Object.assign({}, rx.pp, { sets: q34(rx.pp.sets) }) : rx.pp,
      cr: rx.cr ? q34(rx.cr) : rx.cr,
      sc: rx.sc.replace(/^(\d+)/, (m) => String(q34(Number(m)))),
      em: rx.em + " Christmas week: three-quarters volume, intensity kept." });
  }
  /* P13 is written as Christmas week; anywhere else its numbers stand and
     the block is the convert block's */
  rx.bk = xmas || row.doc !== 13 ? base.bk : "Convert";
  rx.xmasWeek = xmas;
  return rx;
}

/* ================================================================
   WHAT CHANGED — the one line Settings shows after a re-plan
   ================================================================ */
const fmtD = (s) => { try { return parseISO(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch (e) { return s; } };
export function describeSeason(season, from) {
  const rows = season.rows.filter((r) => r.mon >= from);
  const camp = rows.filter((r) => r.program === "camp");
  const prep = rows.filter((r) => r.program === "prep");
  if (camp.length) {
    const cfirst = camp[0], c = cfirst.camp, cRows = camp.filter((r) => r.campStart === cfirst.campStart);
    const pBefore = prep.filter((r) => r.mon < cfirst.mon);
    return (pBefore.length ? pBefore.length + " weeks of Prep (" + pBefore.map((r) => r.id).join(" · ") + "), then " : "")
      + (c.short ? "the short-notice camp" : "a " + cRows.length + "-week camp") + " from " + fmtD(cfirst.mon) + ": " + cRows.map((r) => r.id).join(" · ")
      + " — " + c.R + " × " + c.mins + ", " + c.fitness + " fitness" + (c.emphasis !== "none" ? ", " + c.emphasis : "") + (c.ef ? ", engine-first" : "") + ".";
  }
  if (prep.length) return "Prep's 16-week cycle from " + fmtD(prep[0].mon) + ".";
  return "Optimal 8 Fighter, the classic.";
}

/* the fade decides the fitness: under 75% low, 75–84% moderate, 85% or more good */
export const fitnessFromFade = (fade) => (fade == null ? null : fade < 75 ? "low" : fade < 85 ? "moderate" : "good");
