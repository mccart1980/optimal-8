import { C } from "./ui.jsx";
import { mondayOf, parseISO } from "./ui.jsx";
import { clusterTimer } from "./edge.js";

/* ================================================================
   OPTIMAL 8 · CAMP — ten weeks to the fight.
   The camp document as data: the dated week table, the seven session
   pages in their running order, the lift phases, the conditioning
   session types, the rounds, the tests, fight week, and THE EDGE —
   the seven additions the guardrail takes off in a week with two
   yellow mornings in it.

   Ten weeks, ending on the fight: foundation 1, build 3, easy + tests
   1, peak 3, sharpen 1, fight week. No fork — if the date moves, the
   last rows move with it.

   The block schema is the Fighter's, so the same Session, Flow and
   BlockBody render both:
     { L, n, m, p, star, hard, hide, rest, rt, rxLine, timer, items,
       w, why, note, tr, cal, mainLift, pres, work, sim, eng, menu,
       settle, review, rangeTests, recovery, rules, ramp }
   ================================================================ */

export const CAMP_L = 10;
export const CAMP_START_DEFAULT = "2027-01-04";   /* Monday 4 January 2027 */

export const CAMP_INTRO =
  "Your camp, from Monday 4 January, built on what Prep hands it: test-day maxes, a fourteen-week base, tendons with three months of holds behind them, hips and shoulders that pass their tests, and every conditioning number already on the board. Ten weeks to the first bell, at your best — and if the date moves, the last three rows move with it.";

export const CAMP_PHILOSOPHY =
  "The engine is the priority and it's built brutally from week 1, because Prep did the foundation: two conditioning sessions a week shaped like a round, the rounds every Sunday at fight rest, eight in the peak block and ten once, the fade scored every fortnight. Strength is kept and turned into speed through the phased lifts — one week of slow lowering, paused, fast in clusters, contrast — with working weights reset off test day and again in week 5, never a max. Durability and movement don't stop for a camp — RANGE, the tendon block twice a week, the neck, the hands and the Nordics run all ten weeks. Brutal lives in the sessions: every hard session has a number to beat and a standard that ends it. Discipline lives in the structure: Friday asleep, sleep as a rule, nothing new in camp, and the last ten days sacred.";

export const CAMP_RULES = [
  "The rounds are the hardest thing in the week and they're Sunday, the day with an easy morning after it.",
  "No maxes. No max singles, no rep-outs, no testing what you can lift.",
  "Nothing new in camp. Every exercise here you own from Prep; only the loads, the rounds and the dates change.",
  "The sixth round is trained as the eighth. In the peak block every round session goes two past the fight, and once, in the last hard week, four past.",
  "Sleep is the first session of every day. In bed by half past eight, Sunday to Wednesday.",
  "Cold water stays out of camp. The sauna comes in from week 2, twice a week, never more.",
  "The bag is skill, not conditioning. Conditioning is measured on the erg, where the number can't lie.",
  "Easy means easy. Monday's base, the Wednesday thirty and the easy hour are nasal and conversational, or they're stealing from Tuesday and Sunday.",
  "The fight-day rehearsal is Sunday 7 March. Same wake time, same meals, same warm-up, six rounds at fight time of day.",
  "The fade is the number. Round six's output divided by round one's.",
  "Before every camp: bloods — full blood count, lipids, liver and kidneys — and blood pressure. No dehydration cuts, ever: if there's weight to make, it comes off through food.",
];

export const CAMP_DAILY_CHECK = {
  n: "THE DAILY CHECK — before every session, and it governs the camp",
  q: [
    "Is my resting heart rate up — five or more beats over your week-1 average?",
    "Am I unusually sore?",
    "Flat and unmotivated?",
    "Was last night's sleep worse than normal?",
  ],
  green: "0–1 yes = GREEN. Train as written.",
  yellow: "2–3 yes = YELLOW. 7% off every barbell weight, the interval session at 90% effort, skip the last block.",
  red: "4 yes, ill, injured, or three yellows running = RED. The warm-up, the neck and hands and the home block, and go home. A red day taken is a camp saved.",
};

export const PRE_CAMP_CUE = "A blood test — full blood count, lipids, liver and kidneys — and a blood-pressure reading. Book it with your GP or a private clinic and tick it off when it's done. A resting ECG once a year.";
export const WW_CHECK_CUE = "Warm up, then add weight set by set until a set of 3 is hard but you could have done two more. Stop there and type the weight in: that weight × 1.08 is the working max every percentage reads from. Not a max.";
/* the durability emphasis: the holds go up when the last one was solid */
const HOLDS_PLUS = (rx) => (rx && rx.holdsPlus ? ", +2.5 kg if the last hold was solid" : "");

export const OUTPUT_RULE = "Every explosive set ends the moment the output drops — jump height, throw distance, bar speed, sprint time. Rep counts are ceilings.";

export const WORKING_WEIGHT_RULE =
  "No maxes in camp. The working weights are test day's numbers, reset once in week 5 with a hard set of 3 with two in you. The calendar gives sets, reps and a percentage; the bar speed on your wrist decides whether the number was right — the first work set sets the day (stay, 5% off, or 2.5% on), strength sets end at a 20% slowdown, fast and contrast sets at 10%. A max attempt three weeks out is how camps end.";

export const CAMP_TARGETS =
  "Targets over the camp: fade 5–8 points better than Prep's last read · burst decrement down a further quarter · jump and throw +3–5% · working weights held or +3% · recovery heart rate up 5 beats · every range test held.";

export const CORNER_MINUTE =
  "Every rest is THE CORNER MINUTE — two physiological sighs the second the round ends (a full breath in through the nose, a short second sip on top, one long slow exhale through the mouth, twice), then nose only, in for 3 and out for 6, stood up, hands off the knees. Hands-on-knees gasping keeps you revved and starts the next round behind.";

/* ---------------- the blocks ---------------- */
export const CPH = {
  c1: { n: "FOUNDATION", long: "WEEK 1 · FOUNDATION", ac: C.moss, vl: "—",
    note: "Prep did the foundation — fourteen weeks of it. One week of slow lowering off the test-day max is a hand-over, not a build: the body re-learns the tempo, the new working weights settle, the camp's baselines get logged." },
  c2: { n: "BUILD", long: "WEEKS 2–4 · BUILD", ac: C.cobalt, vl: "—",
    note: "Paused, then fast in clusters; the rounds at fight rest. The paused holds own the bottom position where force starts; the clusters give more heavy reps at full speed than straight sets can." },
  c3: { n: "EASY + TESTS", long: "WEEK 5 · EASY + TESTS", ac: C.brass, vl: "—",
    note: "Adaptation lands in the easy week, not the hard ones. The tests are how you know it landed, and they reset the working weights and the paces for the peak block. Skipping it is how the peak block starts from a hole." },
  c4: { n: "PEAK", long: "WEEKS 6–8 · PEAK", ac: C.oxide, vl: "—",
    note: "Contrast, depth jumps, top speed twice a week, repeat bursts, eight rounds, the sauna. Week 8 is the last hard week — everything you'll have on the night, you'll have by its Sunday." },
  c5: { n: "SHARPEN", long: "WEEK 9 · SHARPEN", ac: C.violet, vl: "—",
    note: "The camp's work is done; week 9 converts it. Volume drops by about 40%; intensity stays; everything is short and fast and finished fresh. Sunday is the fight-day rehearsal." },
  c6: { n: "FIGHT WEEK", long: "WEEK 10 · FIGHT WEEK", ac: C.brass, vl: "—",
    note: "You cannot get fitter this week. You can only get fresher or more tired. Every decision this week is made by asking which of those it does." },
};
const phaseOfCamp = (w) => (w <= 1 ? "c1" : w <= 4 ? "c2" : w === 5 ? "c3" : w <= 8 ? "c4" : w === 9 ? "c5" : "c6");

/* ---------------- dates ---------------- */
/* The camp's week clock runs Monday to Sunday from day one: week 1 is a
   full week, starting Monday 4 January. */
export const campMonday = (start) => mondayOf(parseISO(start || CAMP_START_DEFAULT));
export const campDayDate = (start, w, dayIdx) => {
  const d = new Date(campMonday(start).getTime());
  d.setDate(d.getDate() + (w - 1) * 7 + dayIdx);
  return d;
};
export const campWeekOf = (start, today) =>
  Math.floor((mondayOf(today || new Date()) - campMonday(start)) / 604800000) + 1;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dm = (d) => d.getDate() + " " + MON[d.getMonth()];
/* "4–10 Jan", then "25–31 Jan", "1–7 Feb" */
export const campDatesLabel = (start, w) => {
  const a = campDayDate(start, w, 0), b = campDayDate(start, w, 6);
  return a.getMonth() === b.getMonth() ? a.getDate() + "–" + dm(b) : dm(a) + "–" + dm(b);
};
export const campDayLabel = (start, w, dayIdx) => dm(campDayDate(start, w, dayIdx));

/* ================================================================
   THE CONDITIONING SESSION TYPES — the Tuesday page writes them all
   out; Thursday refers back to it.
   ================================================================ */
export const CENG = {
  vo2: { n: "4-MINUTE INTERVALS", d: "4 × 4 minutes HARD — breathing heavily, two or three words at most — 3 easy between",
    why: "The best-proven builder of the aerobic ceiling there is." },
  rz: { n: "REPEAT BURSTS", d: "8 bursts of 6–8 s at absolute maximum with 40 s easy · 5 full minutes easy · 8 more",
    why: "This is a flurry, twenty or thirty seconds apart, for a round — and what decides whether the fourth flurry has anything in it is how fast the muscle refills between them.",
    rule: "If a burst is visibly weaker than the last, take an extra 20 seconds; if two in a row are, the set is over." },
  rz1: { n: "REPEAT BURSTS · ONE SET", d: "one set of 8 bursts of 6–8 s at absolute maximum with 40 s easy between",
    why: "The sharpen week: sharp, not tired. The shape of a round held, the volume halved.",
    rule: "If a burst is visibly weaker than the last, take an extra 20 seconds; if two in a row are, the set is over." },
  tempo: { n: "TEMPO INTERVALS", d: "10 × 1 minute hard-but-controlled — about 70% of flat out — with 1 minute easy between",
    why: "Aerobic power without the cost; the bridge from base to the hard work." },
  thr: { n: "THRESHOLD", d: "2 × 8 minutes at the hardest pace you could hold for half an hour, 3 easy minutes between",
    why: "Sentences impossible, short phrases possible. The pace of a hard round, held." },
  lac: { n: "40-SECOND REPEATS", d: "40 seconds absolutely flat out, 80 seconds easy. Six.",
    why: "Rounds 1–2 feel fine, round 3 burns, the last three are horrible. That burning is the late rounds, and this is the only session that goes there. Don't hold back early to survive the end." },
  lac2: { n: "40-SECOND REPEATS · 2 × 6", d: "40 seconds flat out, 80 seconds easy. Six; rest 5 full minutes; six more.",
    why: "Rounds 1–2 feel fine, round 3 burns, the last three are horrible. That burning is the late rounds, and this is the only session that goes there." },
  erg: { n: "ROUNDS ON THE ERG · 7 × 3", d: "7 × 3 minutes on the bike or SkiErg at fight pace — the output you can hold across all seven — 60 seconds between",
    why: "Past the fight, on purpose. Write down the first round and the last." },
  erg8: { n: "ROUNDS ON THE ERG · 8 × 3", d: "8 × 3 minutes on the bike or SkiErg at fight pace — the output you can hold across all eight — 60 seconds between",
    why: "Past the fight, on purpose. Write down the first round and the last." },
  fp: { n: "FIGHT-PACE ROUNDS", d: "4 × 3 minutes at the pace you held in week 7, 60 seconds between, and stop",
    why: "Sharp, not tired." },
  easy: { n: "EASY", d: "20 minutes conversational", why: "Easy means easy, or it's stealing from Tuesday and Sunday." },
};
export const CENG_MENU = ["vo2", "rz", "tempo", "thr", "lac", "erg", "fp", "easy"];

/* the timer each session type drives, at the week's dose */
export const cengTimer = (key, short, rx) => {
  const d = (rx && rx.dose) || {}, eff = rx && rx.eff ? " · AT " + rx.eff + "%" : "";
  if (key === "vo2") return { kind: "vo2", opt: { short: !!short, n: d.vo2 || 4 }, title: "4-MINUTE INTERVALS" + eff };
  if (key === "rz") return { kind: "rz", opt: { sets: 2 }, title: "REPEAT BURSTS" + eff };
  if (key === "rz1") return { kind: "rz", opt: { sets: 1 }, title: "REPEAT BURSTS · ONE SET" };
  if (key === "tempo") { const n = (d.tempo || 10) - (short ? 1 : 0); return { kind: "tempo", opt: { reps: n }, title: "TEMPO INTERVALS · " + n + eff }; }
  if (key === "thr") return { kind: "thr", title: "THRESHOLD" + eff };
  if (key === "lac") return d.lac === 2 ? { kind: "lac", opt: { blocks: 2, reps: 6 }, title: "40-SECOND REPEATS · 2 × 6" + eff } : { kind: "lac", opt: { blocks: 1, reps: short ? 5 : 6 }, title: "40-SECOND REPEATS" + eff };
  if (key === "lac2") return { kind: "lac", opt: { blocks: 2, reps: 6 }, title: "40-SECOND REPEATS · 2 × 6" + eff };
  if (key === "erg" || key === "erg8") { const e = (rx && rx.ergR) || { rounds: key === "erg" ? 7 : 8, mins: 3, rest: 60 }; return { kind: "ergrounds", opt: e, title: "ROUNDS ON THE ERG · " + e.rounds + " × " + e.mins }; }
  if (key === "fp") { const e = (rx && rx.fpR) || { rounds: 4, mins: 3, rest: 60 }; return { kind: "ergrounds", opt: e, title: "FIGHT-PACE ROUNDS · " + e.rounds + " × " + e.mins }; }
  return { kind: "z2", opt: { min: 20, label: "EASY — CONVERSATIONAL" }, title: "EASY" };
};
/* a session type's line, at the week's dose */
export const cengLine = (key, rx) => {
  const d = (rx && rx.dose) || {}, eff = rx && rx.eff ? " — at " + rx.eff + "% effort: hard, not all-out" : "";
  if (key === "vo2") return (d.vo2 || 4) + " × 4 minutes HARD — breathing heavily, two or three words at most — 3 easy between" + eff;
  if (key === "tempo") return (d.tempo || 10) + " × 1 minute hard-but-controlled — about 70% of flat out — with 1 minute easy between" + eff;
  if (key === "lac" && d.lac === 2) return CENG.lac2.d;
  if (key === "erg" || key === "erg8") { const e = rx.ergR; return e.rounds + " × " + e.mins + " minutes on the bike or SkiErg at fight pace — the output you can hold across all " + e.rounds + " — " + e.rest + " seconds between"; }
  if (key === "fp") { const e = rx.fpR; return e.rounds + " × " + e.mins + " minutes at fight pace, " + e.rest + " seconds between, and stop"; }
  return CENG[key] ? CENG[key].d + eff : "";
};
export const cengName = (key, rx) => {
  if (key === "erg" || key === "erg8") return "ROUNDS ON THE ERG · " + rx.ergR.rounds + " × " + rx.ergR.mins;
  if (key === "lac" && rx && rx.dose && rx.dose.lac === 2) return CENG.lac2.n;
  return CENG[key] ? CENG[key].n : "Engine";
};

/* ================================================================
   THE TEN WEEKS — every number, every week
   ================================================================ */
const tb = (sc, sets, reps, pct, phase) => ({ sc, sets, reps, pct, phase });
const CW = {};
const CDEF = () => ({
  camp: 1, vec: 2, jump: "AEL", js: [3, 4], bound: "stick", box: [3, 3], bsets: 3,
  spr: null, sled: null, nor: null, sim: null, base: null, cr: null, cpct: null,
  pp: { sc: "3 × 3", sets: 3, reps: 3, pct: 75 },
});
const cw = (w, o) => { CW[w] = Object.assign({ w, ph: phaseOfCamp(w) }, CDEF(), o); };

/* the peak block's lifts, jumps and push press */
const PEAK = (pct, cr) => ({
  tb: tb("CONTRAST · 3 × 2 @ " + pct + "%, fast, into the jump circuit" + (cr === 2 ? ", 2 rounds" : ""), 3, 2, pct, "contrast"),
  sq: tb("CONTRAST · 3 × 2 @ " + pct + "% + the jump circuit", 3, 2, pct, "contrast"),
  cr, cpct: pct, jump: "DEPTH", js: [4, 4], bound: "cont",
  pp: { sc: "3 × 3", sets: 3, reps: 3, pct: 85 },
});

cw(1, { block: "Foundation", base: 45, eng1: "vo2", eng2: "tempo",
  tb: tb("3 × 5 @ 72% of the test-day max — SLOW LOWERING, 5 s down", 3, 5, 72, "slow"),
  sq: tb("3 × 5 @ 72% — SLOW LOWERING, 5 s down", 3, 5, 72, "slow"),
  sled: 5, nor: [3, 5], spr: { n: 4, pct: 100 },
  sim: { rounds: 6, rest: 60, scored: "baseline" }, tests: { tue: "burst" }, nasal: 1, move: 1 });
cw(2, { block: "Build", base: 45, eng1: "rz", eng2: "lac2",
  tb: tb("3 × 3 @ 78% — PAUSED, 3 s an inch off the floor", 3, 3, 78, "paused"),
  sq: tb("3 × 3 @ 78% — PAUSED, 3 s dead still at the bottom", 3, 3, 78, "paused"),
  sled: 5, nor: [3, 5], spr: { n: 5, pct: 100 },
  sim: { rounds: 6, rest: 60 }, sauna: "starts", move: 1 });
cw(3, { block: "Build", base: 45, eng1: "vo2", eng2: "thr",
  tb: tb("4 × 3 @ 82% — paused, 3 s", 4, 3, 82, "paused"),
  sq: tb("4 × 3 @ 82% — paused, 3 s", 4, 3, 82, "paused"),
  sled: 5, nor: [3, 5], spr: { n: 5, pct: 100 },
  sim: { rounds: 6, rest: 60 }, sauna: 1, move: 1 });
/* week 4 runs the clusters; with the edge off, straight sets */
cw(4, { block: "Build", base: 45, eng1: "rz", eng2: "erg",
  tb: tb("4 × 3 @ 87% — FAST, straight sets", 4, 3, 87, "fast"),
  sq: tb("4 × 3 @ 87% — FAST, straight sets", 4, 3, 87, "fast"),
  cluster: 1, sled: 5, nor: [3, 5], spr: { n: 5, pct: 100 },
  sim: { rounds: 6, rest: 60, scored: 1 }, sauna: 1, move: 1 });
cw(5, { block: "EASY + TESTS", base: 30, eng1: "easy", eng2: "easy",
  tb: tb("2 × 3 @ 65% — fast, easy week", 2, 3, 65, "fast"),
  sq: tb("2 × 3 @ 65% — fast, easy week", 2, 3, 65, "fast"),
  sled: 3, nor: [2, 3], spr: { n: 3, pct: 90 },
  sim: { rounds: 6, rest: 60, scored: 1 }, dl: 1, reset: 1, nasal: 1, sauna: 1, move: 1,
  tests: { tue: "retest", sun: "range" },
  pp: { sc: "2 × 3", sets: 2, reps: 3, pct: 65 } });
cw(6, Object.assign({ block: "Peak", base: 45, eng1: "rz", eng2: "lac2",
  sled: 5, nor: [3, 5], spr: { n: 5, pct: 100 },
  sim: { rounds: 6, rest: 60 }, edgeWin: 1, edgeRounds: 8, sauna: 1 }, PEAK(85, 3)));
cw(7, Object.assign({ block: "Peak", base: 45, eng1: "vo2", eng2: "erg8",
  sled: 5, nor: [3, 5], spr: { n: 5, pct: 100 },
  sim: { rounds: 6, rest: 60 }, edgeWin: 1, edgeRounds: 8, sauna: 1 }, PEAK(87, 3)));
cw(8, Object.assign({ block: "Peak, last hard week", base: 45, eng1: "rz", eng2: "rz",
  sled: 5, nor: [3, 5], spr: { n: 5, pct: 100 },
  sim: { rounds: 6, rest: 60, scored: "last" }, edgeWin: 1, edgeRounds: 10, sauna: 1 }, PEAK(88, 2)));
cw(9, { block: "SHARPEN", base: 30, eng1: "rz1", eng2: "fp",
  tb: tb("2 × 2 @ 80% — fast", 2, 2, 80, "fast"),
  sq: null, sled: 3, nor: [2, 3], spr: { n: 3, pct: 90, micro: 1 },
  sim: { rounds: 6, rest: 60, rehearsal: 1 }, tp: 1,
  tests: { tue: "retest9" }, pp: null });
cw(10, { block: "FIGHT WEEK", base: 20, eng1: null, eng2: null,
  tb: null, sq: null, sled: null, nor: null, spr: null, sim: null,
  tp: 1, fightWeek: 1, pp: null });

/* The master week, untouched: a copy of the document's row, for the
   season builder to read from. */
export const campMaster = (w) => JSON.parse(JSON.stringify(CW[Math.max(1, Math.min(CAMP_L, Number(w) || 1))]));

/* THE EDGE, for a camp week. On, the week runs every addition its weeks
   carry — inside the Edge's window, which a camp from low fitness or at
   short notice opens at its first peak or engine week; off — two yellow
   mornings, or the switch in settings — the base program: no Tuesday
   speed, no Wednesday thirty, straight sets for the clusters, the
   contacts back, the rounds back to the fight's. Depth jumps hold at
   4 × 4 either way. The durability emphasis keeps the contacts out. */
export function campEdge(rx, on) {
  const inWin = rx.edgeAllowed !== false;
  const o = Object.assign({}, rx, { edge: !!on, speed: false, thirty: !!on && !rx.fightWeek });
  if (o.sim && o.sim.rounds != null && !o.sim.rehearsal) o.sim = Object.assign({}, o.sim);
  if (!on || !inWin) return o;
  if (rx.cluster) {
    const sets = rx.ef ? 2 : 5;
    Object.assign(o, {
      tb: Object.assign({}, rx.tb, { sc: "FAST, IN CLUSTERS · " + sets + " × (2+2) @ 87%", sets, reps: "2+2", pct: 87, phase: "cluster" }),
      sq: Object.assign({}, rx.sq, { sc: "FAST, IN CLUSTERS · " + sets + " × (2+2) @ 87%", sets, reps: "2+2", pct: 87, phase: "cluster" }) });
  }
  if (rx.edgeWin) {
    o.speed = !rx.noFlyingEdge;
    if (!rx.noContacts) Object.assign(o, { box: rx.boxAll ? rx.box : [4, 3], bsets: rx.twoThirds ? rx.bsets : 4 });
  }
  if (rx.sim && rx.edgeRounds) o.sim = Object.assign({}, o.sim, { rounds: rx.edgeRounds });
  if (rx.sim && rx.edgeDouble) o.sim = Object.assign({}, o.sim, { rounds: rx.edgeDouble.a + rx.edgeDouble.b, double: rx.edgeDouble });
  return o;
}

/* THE BENCH PRESS, every camp week through the peak, off the test-day
   max as its working weight; the bench throws behind it in weeks 1–5,
   inside the contrast in weeks 6–8, on their own in the sharpen week. */
const CBENCH = {
  1: tb("SLOW LOWERING · 3 × 5 @ 72% of the test-day max, 5 s down", 3, 5, 72, "slow"),
  2: tb("PAUSED · 3 × 3 @ 78%, 2 s on the chest", 3, 3, 78, "paused"),
  3: tb("PAUSED · 3 × 3 @ 82%, 2 s on the chest", 3, 3, 82, "paused"),
  4: tb("FAST · 4 × 2 @ 87%", 4, 2, 87, "fast"),
  5: tb("2 × 3 @ 65% — fast, the working weight reset", 2, 3, 65, "fast"),
  6: tb("CONTRAST · 3 rounds · 2 @ 85% + 3 bench throws", 3, 2, 85, "contrast"),
  7: tb("CONTRAST · 3 rounds · 2 @ 87% + 3 bench throws", 3, 2, 87, "contrast"),
  8: tb("CONTRAST · 2 rounds · 2 @ 88% + 3 bench throws", 2, 2, 88, "contrast"),
};
export const campBenchMaster = (w) => (CBENCH[w] ? Object.assign({}, CBENCH[w]) : null);
/* the week's bench, with its sets as the week runs them */
export const campBench = (rx) => (rx && rx.bench ? rx.bench : null);
/* the bench throws on their own row: 3 × 3 behind the press in weeks
   1–5, and the sharpen week's 3 × 3 */
const campThrowRow = (rx) => !rx.fightWeek && !rx.engine && (rx.w <= 5 || rx.w === 9);
const BENCH_CUE_C = {
  slow: "SLOW LOWERING — five seconds down to the chest, then press.",
  paused: "PAUSED — two seconds dead still on the chest, then drive.",
  fast: "FAST — down under control, up as fast as the bar will move.",
  contrast: "CONTRAST — 2 reps, rest 20 seconds, 3 bench throws, rest 2½ minutes.",
};
/* side bounds: straight sideways on odd weeks, forward-and-across at 45°
   on even weeks — counted from the camp's first week */
const boundAngleC = (rx) => ((rx.cw || rx.w) % 2 === 0 ? "45" : "side");

/* even-numbered weeks of the camp, not the easy and test weeks: the long
   sled runs become repeat sled starts */
export const campRepeatSled = (rx) => (rx.repeatSled != null ? !!rx.repeatSled : !!rx.sled && rx.w % 2 === 0 && !rx.dl && !rx.tp);
/* the shot-put ball by block: 5–6 kg through week 5, 3–5 kg after */
const shotBall = (rx) => (rx.w <= 5 ? "5–6 kg" : "3–5 kg");
/* a lift's line, with its sets as the week runs them: the document's
   own words when nothing has changed them */
const withSets = (sc, sets) => (/\d+ rounds/.test(sc) && !/^\d+ ×/.test(sc) && !/· \d+ ×/.test(sc) ? sc.replace(/\d+ rounds/, sets + " rounds") : sc.replace(/\d+ ×/, sets + " ×"));
export const liftLine = (L) => (L ? withSets(L.sc, L.sets) + (L.extra ? " + " + L.extra.sets + " × " + L.extra.reps + " @ " + L.extra.pct + "%" : "") : "");
const benchLine = (bp) => liftLine(bp);
const ppLine = (rx) => rx.pp.sets + " × " + rx.pp.reps;
const chinSets = (rx) => (rx.chins != null ? rx.chins : setsOf(rx, 3));
/* F1's two-thirds: every set count drops by a third, rounded down */
export const setsOf = (rx, n) => (rx && rx.twoThirds ? Math.max(1, Math.floor(n * 2 / 3)) : n);
const R6 = (rx) => (rx && rx.R) || 6, MINS = (rx) => (rx && rx.mins) || 3, REST = (rx) => (rx && rx.rest) || 60;
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen"];
/* the station split: a third of the round each */
const thirdName = (rx, k) => (MINS(rx) === 3 ? "Minute " + k : (k === 1 ? "First " : k === 2 ? "Second " : "Last ") + Math.round(MINS(rx) * 20) + " s");

/* ================================================================
   THE WEEK TABLE — one row per camp week, in the document's words
   ================================================================ */
const MON_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const longDate = (isoDay) => { const p = String(isoDay).split("-").map(Number); const d = new Date(p[0], p[1] - 1, p[2]); return WDAY[d.getDay()] + " " + d.getDate() + " " + MON_NAMES[d.getMonth()]; };
/* a conditioning session as the table names it */
export function engCell(key, rx) {
  const d = rx.dose || {};
  if (key === "vo2") return (d.vo2 || 4) + " × 4 min hard" + (rx.eff ? " at " + rx.eff + "%" : "");
  if (key === "rz") return "REPEAT BURSTS 2 × 8";
  if (key === "rz1") return "bursts 1 × 8";
  if (key === "lac2" || key === "lac") return "40-s repeats " + (key === "lac2" || d.lac === 2 ? "2 × 6" : "× 6");
  if (key === "tempo") return "tempo " + (d.tempo || 10) + " × 1 min";
  if (key === "thr") return "threshold 2 × 8";
  if (key === "easy") return "20 min easy";
  if (key === "erg" || key === "erg8") return "ROUNDS ON THE ERG " + rx.ergR.rounds + " × " + rx.ergR.mins + ", " + rx.ergR.rest + " s";
  if (key === "fp") return rx.fpR.rounds + " × " + rx.fpR.mins + " min at fight pace, " + rx.fpR.rest + " s";
  return "—";
}
const liftWed = (L, first, rx) => {
  const sr = L.sets + " × " + (L.phase === "cluster" ? "(2+2)" : L.reps) + " @ " + L.pct + "%";
  const ex = L.extra ? " + " + L.extra.sets + " × " + L.extra.reps + " @ " + L.extra.pct + "%" : "";
  if (L.hold) return sr + " fast" + ex;
  if (L.phase === "slow") return (first ? "SLOW LOWERING (5 s down) · " + sr + " of the test-day max" : "slow lowering · " + sr + ", 5 s down") + ex;
  if (L.phase === "paused") return (first ? "PAUSED (3 s) · " : "paused · ") + sr + ex;
  if (L.phase === "cluster") return "FAST, IN CLUSTERS · " + sr + ex;
  if (L.phase === "contrast") return (first ? "CONTRAST · " + sr + " + the circuit" : "contrast · " + sr + " + circuit") + (rx.cr && rx.cr !== 3 ? ", " + rx.cr + " rounds" : "") + ex;
  return (rx.dl ? "" : "FAST · ") + sr + (rx.dl ? " fast" : "") + ex;
};
const liftSat = (L, first, rx, prev) => {
  const sr = L.sets + " × " + (L.phase === "cluster" ? "(2+2)" : L.reps) + " @ " + L.pct + "%";
  const ex = L.extra ? " + " + L.extra.sets + " × " + L.extra.reps + " @ " + L.extra.pct + "%" : "";
  if (L.hold) return sr + " fast" + ex;
  if (L.phase === "slow") return sr + ", 5 s down" + ex;
  if (L.phase === "paused") return sr + " paused" + ex;
  if (L.phase === "cluster") return sr + " fast" + ex;
  if (L.phase === "contrast") { const showR = first || !prev || prev.cr !== rx.cr; return "CONTRAST " + sr + " + circuit" + (showR ? ", " + rx.cr + " rounds" : "") + ex; }
  return sr + (rx.dl ? "" : " fast") + ex;
};
/* The week table's row, from the same numbers the sessions use. prev is
   the week before in the same camp, for the words a phase is introduced
   with. */
export function campRow(rx, prev) {
  const firstPhase = (k) => !prev || !prev[k] || prev[k].phase !== rx[k].phase;
  const tests = rx.tests && rx.tests.tue;
  const sunCell = () => {
    if (rx.fightWeek) return "—";
    if (!rx.sim) return "—";
    if (rx.sim.rehearsal) return "FIGHT-DAY REHEARSAL — " + longDate(rx.rehearsal || "2027-03-07");
    const sc = rx.sim.scored ? " SIM — SCORED" + (rx.sim.scored === "baseline" ? " (camp baseline)" : rx.sim.scored === "last" ? " (last read)" : "") : "";
    const body = rx.sim.double ? "THE DOUBLE: " + rx.sim.double.a + " × " + MINS(rx) + ", " + rx.sim.double.easy + " min easy, " + rx.sim.double.b + " × " + MINS(rx) + (sc ? " —" + sc.replace(" SIM —", "") : "")
      : rx.sim.rounds + " × " + (rx.sim.mins || MINS(rx)) + sc;
    return body + ", " + rx.sim.rest + " s" + (rx.sauna === "starts" ? " · sauna starts" : "");
  };
  return {
    mon: rx.fightWeek ? "20 min easy" : rx.base ? rx.base + " min" : "—",
    tue: rx.fightWeek ? "SPEED MICRODOSE 25 min"
      : tests === "retest9" ? "RETESTS, then " + engCell(rx.eng1, rx)
      : engCell(rx.eng1, rx) + (tests ? " · " + (tests === "burst" ? "BURST TEST first" : "RETESTS first") : "")
        + (rx.shuttleFirst ? " · shuttles begin" : "") + (rx.speed ? " · speed twice" : ""),
    wed: rx.fightWeek ? "—"
      : rx.tp ? (rx.tb ? rx.tb.sets + " × " + rx.tb.reps + " @ " + rx.tb.pct + "% fast, bench throws, chins, Nordics " + (rx.nor ? rx.nor[0] + " × " + rx.nor[1] : "—") : "—")
      : rx.tb ? (rx.reset ? "reset working weights · " + rx.tb.sets + " × " + rx.tb.reps + " @ " + rx.tb.pct + "% fast · profiles redrawn" : liftWed(rx.tb, firstPhase("tb"), rx))
        + (campRepeatSled(rx) ? " · repeat sled starts" : "") : "—",
    thu: rx.fightWeek ? "ACTIVATION 20 min" : engCell(rx.eng2, rx) + (rx.nasal ? " · NASAL TEST first" : ""),
    sat: rx.fightWeek ? "FIGHT — " + longDate(rx.fightIso || "2027-03-13")
      : rx.spr && rx.spr.micro ? "SPEED MICRODOSE 25 min"
      : (rx.spr ? rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : "") : "—")
        + (rx.sq ? " · " + (rx.reset ? rx.sq.sets + " × " + rx.sq.reps + " @ " + rx.sq.pct + "%" : liftSat(rx.sq, firstPhase("sq"), rx, prev)) : "")
        + (rx.jump === "DEPTH" ? " · depth jumps " + rx.js[0] + " × " + rx.js[1] : rx.w >= 6 && !rx.tp ? " · drop jumps " + rx.js[0] + " × " + rx.js[1] : ""),
    sun: sunCell(),
    nor: rx.fightWeek || !rx.nor ? "—" : rx.nor[0] + " × " + rx.nor[1],
    sled: rx.sled ? (campRepeatSled(rx) ? "6 × 10 m repeat starts" : rx.sled + " runs") : "—",
  };
}

export const CAMP_TABLE_NOTE =
  "Sled runs on Wednesday: weeks 1–4 and 6–8: 5 — repeat sled starts on the even weeks · weeks 5 and 9: 3 · week 10: none. Drive holds every Wednesday through week 8. Throws and the landmine are dosed on the Thursday, Saturday and Sunday pages; the shot-put ball is 5–6 kg through week 5 and 3–5 kg after. Calisthenics lines run at your levels from week 1, drop to two sets in week 5, and become holds only from week 9. RANGE, the morning five, the neck, the hands and the tendon block run every week, fight week at half dose.";

/* ================================================================
   FIGHT WEEK — week 10, the Saturday fight
   ================================================================ */
export const FIGHT_WEEK_INTRO =
  "You cannot get fitter this week. You can only get fresher or more tired. Every decision this week is made by asking which of those it does.";
/* [ week, dayIdx, what ] — the date is computed from the camp's start */
export const FIGHT_WEEK_ROWS = [
  [10, 0, "20 minutes easy, nose only. Neck holds, 2 × 10 seconds each direction. RANGE at half dose. Bed by half past eight."],
  [10, 1, "SPEED MICRODOSE · 25 min: warm-up, 3 × 20 m flying sprints at 90%, box jumps 2 × 3, rotational throws 2 × 3 per side, bench throws 3 × 3. Fast, nothing tired, done."],
  [10, 2, "Nothing. RANGE at half dose, the sit."],
  [10, 3, "ACTIVATION · 20 min: Tuesday's warm-up, band pull-aparts and external rotations, three easy throws per side, two minutes of shadow boxing at pace, three physiological sighs, done."],
  [10, 4, "Weigh-in if there is one. Nothing else. Feet up. The rehearsal's meals. Bed early."],
  [10, 5, "FIGHT. The warm-up you rehearsed. The corner minute in every rest. Round six is a place you've already been."],
];
export const FIGHT_WEEK_FOOD =
  "Food this week holds — the fuel plan's fight-week phase, and the making-weight phase only if you decided on it in week 1. The commonest way to lose a fight in the last week is to eat less because you're training less and arrive at the ring empty.";
export const FIGHT_WEEK_AFTER = "After the fight: the transition — one week after a fight of 9 minutes or less, two after a longer one. The first three days RANGE, the sit and walking; then easy. It runs on until the strap says you're back, then the next fight's plan, or Prep.";

/* ================================================================
   THE TESTS
   ================================================================ */
export const CAMP_TEST_INTRO =
  "The camp's baselines are Prep's test-day numbers; week 1 only adds what test day didn't measure — the burst decrement on Tuesday, the nasal threshold on Thursday, the 6 × 3 scored on Sunday. Week 5 resets the working weights and retests the burst decrement, the broad jump, the throw and BOLT, with the nasal threshold on Thursday. Week 9's Tuesday is the last read: short, sharp, done.";

/* the retests, and with them the four range tests and the tape */
export const campTestWeeks = () => [1, 5, 9];
export const scoredWeeks = () => [1, 4, 5, 8];
export const SCORED_WEEKS_LINE = "Scored weeks: 1, 4, 5 and 8.";

/* ================================================================
   PROTOCOLS — written once, referenced by name. Keys are prefixed so
   they sit beside the Fighter's without colliding.
   ================================================================ */
const GETUP = "2 per side, light — lie on your back with a kettlebell pressed up in the right hand, right knee bent, left arm and leg out at 45°; roll up onto the left elbow, then the hand; lift the hips, sweep the left leg back to kneeling, windmill the trunk upright, stand; reverse every step to the floor. The bell never stops pointing at the ceiling. 8–12 kg to learn it.";

export const CPROTO = {
  C_WU: { n: "Warm-up", s: "7 min · Tue and Thu", c: C.cobalt,
    note: "Thursday's is the same, then three easy throws of each at half effort.",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"]] },
  C_WUW: { n: "Warm-up", s: "6 min · Wed", c: C.cobalt,
    note: "Tuesday's warm-up, then the trap bar warm-up sets.",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"],
      ["TRAP BAR WARM-UP SETS", ""], ["Bar", "×5"], ["50% of working", "×3"], ["70% of working", "×2"]] },
  C_SATWU: { n: "Warm-up · get-ups, hips + build-ups", s: "16 min · Sat", c: C.cobalt,
    note: "Never sprint cold. The build-ups are the sprint warm-up and they are never skipped. The squat warm-up sets sit inside the squat step, forty minutes later.",
    i: [["TURKISH GET-UP · 2 PER SIDE, LIGHT", ""], ["Turkish get-up", GETUP],
      ["THEN THE HIPS", ""], ["90/90 hip switches", "×5 each way"], ["Hip airplanes", "×5 per side — stand on one leg holding the rack, hinge the chest to horizontal, rotate toward the floor and then up"],
      ["Cossack squats", "×6 per side"], ["Leg swings", "×10 each way"], ["Pogo hops", "2 × 20"],
      ["THE SPRINT BUILD-UPS — NEVER SKIPPED", ""], ["20 m @ 60%", "×1"], ["20 m @ 75%", "×1"], ["20 m @ 90%", "×1"]] },
  C_SUNWU: { n: "Warm-up · power prep + practice throws", s: "11 min · Sun", c: C.cobalt,
    note: "Tuesday's warm-up, then the power prep and three easy throws of each of the four.",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"],
      ["PLUS", ""], ["Broad jumps", "3 × 2"], ["Med-ball chest passes", "3 × 3 as hard as you can"], ["Bike sprints", "3 × 10 seconds with a minute between"], ["Practice throws", "three easy throws of each of the four"]] },
  C_NECK: { n: "Neck", s: "8 min · Mon and Thu", c: C.violet,
    note: "A stiffer neck lowers how much the head accelerates when hit. Not armour; a cheap bet on a sound mechanism, from day one.",
    i: [["4-direction holds", "3 × 10 s each direction — press your palm hard against your forehead and push your head into it; the head never moves. Then the back of the head, then each side."],
      ["Rapid tense", "4 × 6 per direction — a band resting light pressure on your head; snap from fully relaxed to fully braced in under a second, hold 2 s, relax"],
      ["Perturbation hold", "2 × 20 s — band around the head, anchored to the rack; brace in neutral and tug the band in small random pulses with your own hand; the head does not move"]] },
  C_HANDS: { n: "Hands", s: "4 min · Mon and Thu", c: C.violet,
    note: "The most common boxing injury is a wrist folding under impact. Four minutes of insurance.",
    i: [["Knuckle hold", "3 × 20 s — push-up position on your fists, wrist dead straight"],
      ["Band wrist extension", "2 × 15 — forearm on your knee, palm down, band in the hand, lift the knuckles toward you"]] },
  C_SPAN: { n: "Spanish squat hold", s: "3 min · Tue and Thu", c: C.violet,
    note: "The patellar tendon, which takes every depth jump and box landing in this camp.",
    i: [["Spanish squat hold", "3 × 30 seconds · rest 30 s"],
      ["Set-up", "a thick band around the back of both knees, anchored to the rack in front of you at knee height"],
      ["The hold", "lean back into it so the shins stay vertical, sit to a half squat, hold dead still"],
      ["It burns above the kneecap", "it never hurts inside the knee"]] },
  C_VEC: { n: "The four punch throws", s: "45 s between exercises · 90 s between rounds", c: C.brass,
    note: "Medicine ball — 5–6 kg for the shot-put in the build and heavy blocks, 3–5 kg for the rest; if it isn't flying, it's too heavy. Straights are forward drive, hooks are rotation; all four get trained.",
    i: [["Rotational shot-put", "×4 per side — ball at the shoulder, stance side-on to the wall, drive off the back hip, flat and hard"],
      ["Downward diagonal throw", "×4 per side — ball high outside the shoulder, driven down and across toward the opposite hip, back foot pivoting"],
      ["Hook throw", "×4 per side — ball at chest height in bent arms, pivot hard off the lead leg and sling it sideways into the wall"],
      ["Landmine punch", "×5 per side — one end of a barbell in a corner, the other at your shoulder in your stance, drive the hips and punch it up and away, never a slow press"]] },
};

export const CAMP_HOMELINE =
  "HOME · tonight: RANGE, 20 min · Mon–Thu then the skill block, 5 min · then the sit and the review · and the morning five on waking. All ten weeks, fight week at half dose.";
export const CAMP_HOMELINE_TAPER =
  "HOME · tonight: RANGE at half dose, 10 min — the roller, the open book, the 90/90 with the lift, the couch stretch, the deep squat hold, the hang · then the sit. It doesn't stop.";

export const CAMP_EASY_HOUR = {
  n: "THE EASY HOUR",
  s: "30–40 minutes easy, nose only, bike or walk, four-plus hours after the session.",
  why: "Active recovery for legs that have just done the rounds, and the aerobic base that the base day alone doesn't carry.",
  tag: "SUNDAY AFTERNOON · NOSE ONLY",
};
export const SAUNA_LINE = "Weeks 2–8: sauna, 15–20 minutes, twice a week — Sunday and one weekday evening — never more, and never without the hydration schedule's sauna line. Never straight from the sauna into cold.";

/* ================================================================
   THE SEVEN PAGES, in running order, exactly as written
   ================================================================ */
const vv = (x, rx) => (typeof x === "function" ? x(rx) : x);
const isTest = (rx, day) => !!(rx.tests && rx.tests[day]);

/* the burst test, the retests, and the sharpen week's short battery */
const testItems = (kind) => {
  const burst = [
    { n: "Burst 1 — peak power", s: "6 seconds flat out", cue: "Ten bursts of 6 seconds flat out with 30 seconds easy between. Write down the first and the last; the last divided by the first is the decrement.", id: "c_burst1", k: "out", u: "peak power / output" },
    { n: "Burst 10 — peak power", s: "the tenth, against the first", id: "c_burst10", k: "out", u: "peak power / output" },
  ];
  const power = [
    { n: "Broad jump", s: "best of three", cue: "Two-foot jump forward for distance, stick the landing dead still. Three attempts, best one counts.", id: "c_jump", k: "out", u: "metres" },
    { n: "Rotational throw", s: "best of three per side", cue: "Medicine ball at the shoulder, side-on to the wall, drive off the back hip. Three per side, best distance.", id: "c_throw", k: "out", u: "metres" },
  ];
  const bolt = [{ n: "BOLT", s: "time to the first definite urge", cue: "A normal breath in and out, pinch the nose, and time it to the first definite urge to breathe. Breathing efficiency and a readiness number. The Iron Mind breath tool times it.", id: "c_bolt", k: "out", u: "seconds" }];
  const tape = [
    { n: "Bodyweight", s: "kg", id: "c_bw", k: "out", u: "kg" },
    { n: "Waist", s: "cm", id: "c_waist", k: "out", u: "cm" },
    { n: "Resting heart rate", s: "five mornings averaged", id: "c_rhr", k: "out", u: "bpm" },
  ];
  if (kind === "burst") return burst;
  if (kind === "retest") return burst.concat(power, bolt);
  if (kind === "retest9") return burst.concat(power, bolt, tape);
  return [];
};
const testTitle = { burst: "THE BURST TEST", retest: "THE RETESTS", retest9: "THE RETESTS — SHORT" };

export const CS = {
  /* ---------------- MONDAY · BASE ---------------- */
  mon: { n: "MONDAY", t: "BASE — easy nasal ride or run, 45 min · neck · hands · band deceleration catch · ring rows", m: (rx) => (rx.base || 0) + 19, ac: C.moss,
    intro: "The base is the thing Optimal 8 was thin on and the thing the camp will lean on hardest. It decides how fast you recover between exchanges and between rounds — roughly three-quarters of a 6 × 3 is aerobic — and it's the floor that lets Tuesday and Thursday be as hard as they are. It's the low day in a high/low week, and it must stay low.",
    b: [
    { L: "Y", n: "The Pre-Camp Check", m: 0, hide: (rx) => !rx.preCamp, rxLine: () => "this week — bloods and blood pressure",
      items: [{ n: "Pre-camp check", s: "full blood count, lipids, liver and kidneys · blood pressure", cue: PRE_CAMP_CUE, id: "c_precamp", k: "chk" }],
      why: "Standing rule 5: before every camp. A resting ECG once a year." },
    { L: "X", n: "The 20-Minute Test", m: 25, star: 1, hard: 1, hide: (rx) => !rx.checks,
      timer: () => ({ kind: "z2", opt: { min: 20, label: "20-MIN TEST — MAXIMUM DISTANCE" }, title: "20-MIN TEST" }),
      rxLine: () => "5 easy minutes, then 20 minutes for the most distance you can — today instead of the base",
      items: [{ n: "Distance", s: "the engine's ceiling", id: "c_bike20", k: "out", u: "distance (m)" },
        { n: "Peak heart rate", s: "the highest you saw — it sets your heart-rate zones", id: "c_bike20hr", k: "out", u: "bpm" }],
      why: "The camp didn't start straight after a Prep test week, and there wasn't time before week 1: the 20-minute test sets your heart-rate zones, so it comes first." },
    { L: "A", n: "Easy, nose only", m: (rx) => rx.base || 45, star: 1, baseTrend: "c_base", hide: (rx) => !!rx.checks,
      timer: (rx) => ({ kind: "z2", opt: { min: rx.base || 45, label: "EASY — NOSE ONLY" }, title: "THE BASE" }),
      rxLine: (rx) => (rx.base || 45) + " min · nose the whole way",
      items: [{ n: "Output", s: "write it down", id: "c_base", k: "out", u: "distance / avg HR" }],
      w: "Nose the whole way; if you can't hold a sentence, slow down.",
      why: "Bike, SkiErg, or a run if your legs and ankles are used to it — a run builds the base faster but costs more. Heart rate on the strap and the average logged: 65–75% of your peak, no higher. The output at that heart rate is the number that should climb. Forty-five minutes through the camp, thirty in the easy week and the sharpen week. Boring on purpose. Fine on an empty stomach." },
    { L: "B", n: "Neck", m: 8, p: "C_NECK",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 10, rest: 20, label: "4-DIRECTION HOLD" }, title: "NECK HOLDS" }),
      rxLine: (rx) => "holds · rapid tense " + setsOf(rx, 4) + " × 6 · perturbation",
      items: (rx) => [{ n: "The neck block", s: "holds " + setsOf(rx, 3) + " × 10 s · rapid tense " + setsOf(rx, 4) + " × 6 per direction · perturbation " + setsOf(rx, 2) + " × 20 s", id: "c_neck_mon", k: "chk" }],
      why: "A stiffer neck lowers how much the head accelerates when hit. Not armour; a cheap bet on a sound mechanism, from day one." },
    { L: "C", n: "Hands", m: 4, p: "C_HANDS",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 20, rest: 30, label: "KNUCKLE HOLD" }, title: "HANDS" }),
      items: (rx) => [{ n: "Knuckle hold + band wrist extension", s: setsOf(rx, 3) + " × 20 s · " + setsOf(rx, 2) + " × 15", id: "c_hands_mon", k: "wr", sets: setsOf(rx, 3), reps: 20 }] },
    { L: "K", n: "Band Deceleration Catch", m: 2, rxLine: (rx) => setsOf(rx, 2) + " × 8 per arm",
      items: (rx) => [{ n: "Band deceleration catch", s: setsOf(rx, 2) + " × 8 per arm", cue: "A light band anchored behind you at shoulder height, the end in your hand, in your stance. Punch the arm out fast; the band snatches it back — brake it hard and stop it dead in the last third of the return. Fast out, hard stop.", id: "c_decel", k: "chk" }],
      why: "Every punch you throw has to be braked and brought home by these muscles, and this is the only exercise that trains them to do it." },
    { L: "D", n: "Ring Rows", m: 5, cal: "ringrow", rest: "Rest 60 s", rt: 60, rxLine: (rx) => setsOf(rx, 3) + " sets at your level",
      items: (rx) => [{ n: "Ring rows — at your level", s: setsOf(rx, 3) + " sets", cue: "Rings hung at hip height, hang beneath them with the body straight and heels on the floor, pull the rings to the chest, pause, lower slow; the line climbs to feet-elevated rows and archer rows.", id: "ringrow", k: "wr", sets: setsOf(rx, 3), reps: "at your level" }],
      why: "Light horizontal pulling on the easy day, keeping the shoulder honest without touching the elbow load Wednesday carries." }] },

  /* ---------------- TUESDAY · POWER + ENGINE 1 ---------------- */
  tue: { n: "TUESDAY", t: "POWER + ENGINE 1 — the jump check, jumps, shuttles, speed from week 6, pistol line, Spanish hold, the interval session, the settle, trunk, the Achilles hold", m: (rx) => (isTest(rx, "tue") ? 78 : 70), ac: C.cobalt,
    intro: "Fresh legs, so the power dose goes first. Then the week's first hard conditioning session. Then the trunk, because the trunk is what turns leg drive into hand speed.",
    b: [
    { L: "A", n: "Warm-up", m: 7, p: "C_WU", rxLine: () => "7 min · bike, bands, squats, push-ups, hips, pogos" },
    { L: "J", n: "The Jump Check", m: 1, jumpCheck: 1, hide: (rx) => !!rx.fightWeek, rxLine: () => "3 countermovement jumps — the best height",
      items: [{ n: "Countermovement jump — best of three", s: "3 jumps · log the best height", cue: "Hands on hips, dip and jump straight up as high as you can, land soft, reset between each. Film them in slow motion on the jump app and log the best height.", id: "c_jumpchk", k: "out", u: "best height (cm)" }],
      why: "It reads tired legs and a tired nervous system, which the strap can't." },
    { L: "T", n: (rx) => testTitle[rx.tests.tue], m: 18, star: 1, hard: 1, hide: (rx) => !isTest(rx, "tue"),
      timer: () => ({ kind: "bursttest", title: "BURST TEST · 10 × 6 s" }),
      rxLine: (rx) => (rx.tests.tue === "burst" ? "Ten bursts of 6 s flat out, 30 s easy — first against last"
        : rx.tests.tue === "retest9" ? "Short and sharp, inside a 40-minute session — then one set of eight repeat bursts"
        : "Fresh, first, at the start of the session"),
      items: (rx) => testItems(rx.tests.tue),
      rangeTests: 1,
      w: "Tested fresh or not tested at all. Nothing hard goes in front of these.",
      why: "The repeat-burst decrement: ten bursts of 6 seconds flat out with 30 seconds easy; peak power of the first versus the last. Whether your fourth flurry has anything in it.",
      note: (rx) => (rx.tests.tue === "burst" ? "Week 1 baseline — the camp's own, beside test day's. The intervals follow it." : "The retests run before the session, fresh. Then the session, as written."), tr: 3 },
    { L: "W", n: "Broad Jump and Throw Tests", m: 6, star: 1, hide: (rx) => !rx.checks, rxLine: () => "best of three each — before the jumps",
      items: [{ n: "Broad jump", s: "best of three", cue: "Two-foot jump forward for distance, stick the landing dead still. Three attempts, best one counts.", id: "c_jump", k: "out", u: "metres" },
        { n: "Rotational throw", s: "best of three per side", cue: "Medicine ball at the shoulder, side-on to the wall, drive off the back hip. Three per side, best distance.", id: "c_throw", k: "out", u: "metres" }],
      why: "The camp didn't start straight after a Prep test week, and there wasn't time before week 1." },
    { L: "B", n: "Power dose — jumps", m: 8, star: 1, hard: 1, rest: "Rest 90 s", rt: 90, hide: (rx) => !!rx.tp,
      rxLine: (rx) => "broad jumps " + rx.broad + " × 2 · box jumps " + rx.box[0] + " × " + rx.box[1] + (rx.shuttles ? " · shuttle bursts × 6" : ""),
      items: (rx) => [{ n: "Broad jump", s: rx.broad + " × 2", cue: "Two-foot jump forward for distance, stick the landing dead still.", id: "c_broad", k: "chk" },
        { n: "Box jump", s: rx.box[0] + " × " + rx.box[1], cue: "The box chosen by the landing: you land on it in a quarter squat. Quick dip, jump as high as you can, land soft, step down.", id: "c_boxjump", k: "chk" }]
        .concat(rx.shuttles ? [{ n: "Shuttle bursts", s: "6 × 5 m out and back · 20 s between", cue: "Six times five metres out and back, a hard push-off at each turn, twenty seconds between. A mover with good feet makes you change direction; this trains it forward and back. Three minutes.", id: "c_shuttle", k: "chk" }] : []),
      w: OUTPUT_RULE,
      why: "Explosiveness responds to how often the nervous system is asked, not how much. Eight minutes, three mornings a week." },
    { L: "Q", n: "Speed — flying twenties", m: 8, star: 1, hard: 1, edge: 1, rest: "Rest 2:30", rt: 150, hide: (rx) => !rx.speed,
      rxLine: () => "build-ups at 75% and 90%, then 3 × 20 m flat out",
      items: [{ n: "Build-up 20 m", s: "one at 75%, one at 90%", cue: "Never skipped. The build-ups are what make the speed safe.", id: "c_speed_bu", k: "chk" },
        { n: "Flying sprint 20 m", s: "3 × 20 m · rest 2½ min", cue: "After the shuttles: three flying 20-metre sprints, absolutely flat out. Curved treadmill or outdoors.", id: "c_speed_tue", k: "out", u: "best time (s)" }],
      w: "A hamstring twinge on the build-ups ends the speed for the day. The Nordics never miss.",
      why: "THE EDGE. Twice a week is what sprinters do, and it's the best hamstring insurance there is — provided the build-ups never miss." },
    { L: "C", n: "The Pistol Line", m: 5, cal: "pistol", rest: "Rest 60 s", rt: 60, hide: (rx) => !!rx.tp, rxLine: (rx) => setsOf(rx, 2) + " × 5 per leg at your level",
      items: (rx) => [{ n: "The pistol line — at your level", s: setsOf(rx, 2) + " × 5 per leg", cue: "Box pistol to start — stand on one leg in front of a box, the other straight out in front, sit to the box under control and stand without the free foot touching — climbing to the assisted and then the full pistol.", id: "pistol", k: "wr", sets: setsOf(rx, 2), reps: "5/leg" }],
      w: "Two sets, never to failure: control, not load.",
      why: "The pivot foot learning to own the body." },
    { L: "K", n: "Spanish Squat Hold", m: 3, p: "C_SPAN", rest: "Rest 30 s", rt: 30, rxLine: (rx) => setsOf(rx, 3) + " × 30 seconds" + HOLDS_PLUS(rx),
      timer: (rx) => ({ kind: "hold", opt: { sets: setsOf(rx, 3), secs: 30, rest: 30, label: "SPANISH SQUAT — DEAD STILL" }, title: "SPANISH SQUAT" }),
      items: (rx) => [{ n: "Spanish squat hold", s: setsOf(rx, 3) + " × 30 seconds" + HOLDS_PLUS(rx) + " · rest 30 s", cue: "As Thursday: a thick band around the back of both knees, anchored to the rack in front of you at knee height; lean back into it so the shins stay vertical, sit to a half squat, hold dead still.", id: "c_spanish_tue", k: "wr", sets: setsOf(rx, 3), reps: 30 }],
      why: "The tendon block runs twice a week now, because the jumps do." },
    { L: "D", n: (rx) => (CENG[rx.eng1] ? cengName(rx.eng1, rx) : "Engine 1"), m: (rx) => (rx.eng1 === "easy" ? 20 : 24), star: 1, hard: 1, eng: 1, engKey: "eng1", menu: 1,
      engLine: (rx) => cengLine(rx.eng1, rx),
      hide: (rx) => !rx.eng1, timer: (rx) => cengTimer(rx.eng1, false, rx),
      items: [{ n: "Output", s: "write it down", id: "c_eng1", k: "out", u: "output / peak HR" }],
      note: "Bike or SkiErg — one, all camp, so the numbers compare. Write down your output every session." },
    { L: "E", n: "The 60-Second Settle", m: 1, settle: 1, hide: (rx) => !rx.eng1,
      timer: () => ({ kind: "settle", title: "THE SETTLE" }), rxLine: () => "60 seconds — log the seconds to land",
      items: [{ n: "Seconds to land on the breath", s: "write it down", id: "c_settle1", k: "out", u: "seconds" }],
      why: "Stay on the bike, eyes closed, heart pounding, find the breath at the nostrils, count the seconds it takes to land there. The corner between rounds, trained." },
    { L: "F", n: "Trunk", m: 9, rest: "Rest 45 s", rt: 45, hide: (rx) => !!rx.tp,
      items: (rx) => [{ n: "Pallof press", s: setsOf(rx, 3) + " × 10 per side · 2 s hold", cue: "Band at chest height anchored beside you, press the hands straight out and hold 2 seconds without letting it twist you.", id: "c_pallof", k: "wr", sets: setsOf(rx, 3), reps: "10/side" },
        { n: "Ab wheel rollout", s: setsOf(rx, 3) + " × 8–12", cue: "Knees down, out only as far as the lower back remains flat.", id: "c_abwheel", k: "wr", sets: setsOf(rx, 3), reps: "8–12" },
        { n: "Copenhagen plank", s: setsOf(rx, rx.copen || 2) + " × 30 s per side", cue: "Side plank, top foot on a bench, bottom leg lifted.", id: "c_copenplank", k: "wr", sets: setsOf(rx, rx.copen || 2), reps: 30 }],
      why: "The groin you pivot off, and the trunk that turns leg drive into hand speed." },
    { L: "G", n: "Seated Calf Raise + Achilles Hold", m: 5, rest: "Rest 60 s", rt: 60,
      rxLine: (rx) => setsOf(rx, 3) + " × 12, then one 45-second hold" + HOLDS_PLUS(rx),
      timer: () => ({ kind: "hold", opt: { sets: 1, secs: 45, label: "ACHILLES HOLD — STANDING, STRAIGHT KNEE" }, title: "ACHILLES HOLD" }),
      items: (rx) => [{ n: "Seated calf raise", s: setsOf(rx, 3) + " × 12", cue: "Up on the balls of the feet, pause, down slow, twelve times — the knee-bent position trains the muscle that keeps you on your toes in round six.", id: "c_soleus", k: "wr", sets: setsOf(rx, 3), reps: 12 },
        { n: "Achilles hold — STANDING", s: "one × 45 seconds" + HOLDS_PLUS(rx), cue: "On the edge of a step, a dumbbell in each hand or a bar on your back, as heavy as you can hold dead still, rise to the top and hold 45 seconds, knees straight.", id: "c_achilles", k: "chk" }],
      why: "The Achilles takes every sprint and landing in this camp on a straight knee; this is its insurance." }] },

  /* ---------------- WEDNESDAY · STRENGTH ---------------- */
  wed: { n: "WEDNESDAY", t: "STRENGTH — sled (repeat starts on even weeks), drive and punch-position holds, the trap bar in its phase, the bench press and bench throws, chins and the muscle-up line, Nordics, neck holds", m: 64, ac: C.oxide,
    intro: "The heavy morning, and the lift changes its shape by block — slow lowering, paused, fast in clusters, contrast. Every rep moves with intent; the watch says how fast, and the set ends at the velocity threshold. A grinding rep ends the set.",
    b: [
    { L: "A", n: "Warm-up", m: 6, p: "C_WUW", rxLine: () => "6 min · then bar × 5, 50% × 3, 70% × 2 of working" },
    { L: "B", n: (rx) => (campRepeatSled(rx) ? "Repeat Sled Starts" : "Heavy Sled"), m: 12, star: 1, hard: 1, hide: (rx) => !rx.sled,
      rest: (rx) => (campRepeatSled(rx) ? "Rest 0:30" : "Rest 2:30"), rt: (rx) => (campRepeatSled(rx) ? 30 : 150),
      rxLine: (rx) => (campRepeatSled(rx) ? setsOf(rx, 6) + " × 10 m" : rx.sled + " × 20 m") + " @ 40–60% of bodyweight",
      items: (rx) => [campRepeatSled(rx)
        ? { n: "Repeat sled start 10 m", s: setsOf(rx, 6) + " × 10 m", cue: "Six heavy runs of ten metres with thirty seconds' rest. Same load as the long runs: 40–60% of bodyweight, lean in at about 45°, drive the ground backward through the whole foot.", id: "c_sled_rep", k: "out", u: "load (kg) · time (s)", bwp: [40, 60], bwl: "on the sled" }
        : { n: "Heavy sled sprint 20 m", s: rx.sled + " × 20 m", cue: "Load the sled with 40–60% of bodyweight, lean in at about 45°, sprint 20 metres driving the ground backward through the whole foot.", id: "c_sled", k: "out", u: "load (kg) · time (s)", bwp: [40, 60], bwl: "on the sled" }],
      w: (rx) => (campRepeatSled(rx) ? "Forward pressure repeated on a clock, which is the shape of a pressure fight against a man who keeps resetting." : "Get the load right by the clock: 5–7 seconds a run. Faster, add weight; slower, take some off."),
      why: "Horizontal force, the push that starts a punch and closes distance, with no soreness and nothing on your spine. First, while the nervous system is freshest. No sled: skip to the trap bar and add a set." },
    { L: "K", n: "Drive Holds + Punch-Position Holds", m: 4, hard: 1, rest: "Rest 30 s", rt: 30, hide: (rx) => !rx.sled || rx.w > 8, rxLine: (rx) => setsOf(rx, 3) + " rounds",
      timer: (rx) => ({ kind: "drivepunch", opt: { rounds: setsOf(rx, 3) }, title: "DRIVE + PUNCH HOLDS" }),
      items: (rx) => [{ n: "Drive hold", s: setsOf(rx, 3) + " × 10 seconds", cue: "Load the sled so it won't move — or use a wall — and from your boxing stance drive into it as hard as you can, through the rear leg, the trunk braced, breathing out.", id: "c_drivehold", k: "chk" },
        { n: "Punch-position hold", s: setsOf(rx, 3) + " × 4 seconds each hand", cue: "While the legs recover: in your stance, a wrapped fist against a padded wall or a Smith-machine bar locked at shoulder height, the arm just short of straight and the wrist dead straight, and punch into it as hard as you can without anything moving. Thirty seconds, and the next round.", id: "c_punchhold", k: "chk" }],
      why: "The drive hold is the clinch against a heavier man; the punch hold is strength in the exact position your fist is in when it lands — isometric strength builds mainly at the angle you train it, so it's trained at that angle.", tr: 2 },
    { L: "P", n: "Load-Velocity Profiles — Redrawn", m: 10, hide: (rx) => !rx.reset, star: 1, profile: "tbdl",
      rxLine: () => "the trap bar at five loads; the ballistic loads at four",
      items: [{ n: "Trap bar at five loads", s: "50 · 60 · 70 · 80 · 85% — two reps each", cue: "Two reps at each load, as fast as the bar will move, the watch recording the mean speed.", id: "c_prof_tb", k: "chk" },
        { n: "Trap bar jump at four loads", s: "10 · 20 · 30 · 40% of the trap bar — two reps each", cue: "Two jumps at each load, the watch recording the mean speed. The load with the most power is the one you jump with until the fight.", id: "c_prof_tj", k: "chk" },
        { n: "Bench throw at four loads", s: "20 · 30 · 40 · 50% of the bench — two reps each", cue: "Two throws at each load, the watch recording the mean speed. The load with the most power is the one you throw until the fight.", id: "c_prof_bt", k: "chk" }],
      why: "Power is load times speed: the load with the highest number is the one you use until the next profile." },
    { L: "V", n: "Working-Weight Checks — Trap Bar and Bench", m: 10, star: 1, hide: (rx) => !rx.checks, rxLine: () => "a set of 3, hard with two in you — then the working sets",
      items: [{ n: "Working-weight check — trap bar", s: "a set of 3, two in reserve", cue: WW_CHECK_CUE, id: "c_ww_tb", k: "out", u: "kg", max: "cw_tbdl", est: 1.08 },
        { n: "Working-weight check — bench press", s: "a set of 3, two in reserve", cue: WW_CHECK_CUE, id: "c_ww_bench", k: "out", u: "kg", max: "cw_bench", est: 1.08 }],
      why: "The camp didn't start straight after a Prep test week, and there wasn't time before week 1." },
    { L: "C", n: "Trap Bar Deadlift", m: 12, star: 1, hard: 1, mainLift: "cw_tbdl", work: "cw_tbdl", hide: (rx) => !rx.tb,
      pres: (rx) => ({ sc: liftLine(rx.tb, rx), pct: rx.tb.pct }),
      rest: (rx) => (rx.tb.phase === "contrast" || rx.tb.phase === "cluster" ? "Rest 3:00" : "Rest 2:30"), rt: (rx) => (rx.tb.phase === "contrast" || rx.tb.phase === "cluster" ? 180 : 150),
      timer: (rx) => (rx.tb.phase === "contrast" ? { kind: "contrast", opt: { rounds: rx.cr || rx.tb.sets, rest: 180, items: ["TRAP BAR — 2 @ " + rx.tb.pct + "%, FAST", "BOX JUMP ×3", "TRAP BAR JUMP ×3"] }, title: "TRAP BAR CONTRAST" }
        : rx.tb.phase === "cluster" ? clusterTimer(rx.tb.sets, rx.tb.pct + "%", "TRAP BAR") : null),
      items: (rx) => [{ n: "Trap bar deadlift", s: liftLine(rx.tb, rx), cue: PHASE_CUE[rx.tb.phase], id: "c_tbdl", k: "wr", mk: "cw_tbdl", pct: rx.tb.pct, sets: rx.tb.sets, reps: rx.tb.reps }]
        .concat(rx.tb.extra ? [{ n: "Trap bar deadlift — the strength set", s: rx.tb.extra.sets + " × " + rx.tb.extra.reps + " @ " + rx.tb.extra.pct + "%", cue: "The strength emphasis: one more set, at the top of the week's load.", id: "c_tbdl_x", k: "wr", mk: "cw_tbdl", pct: rx.tb.extra.pct, sets: rx.tb.extra.sets, reps: rx.tb.extra.reps }] : []),
      rxLine: (rx) => liftLine(rx.tb, rx),
      w: "Nothing passes over your body and a rep you're not sure of goes down, not up — the one heavy lift safe to do alone at this hour. A grinding rep ends the set.",
      why: (rx) => PHASE_WHY[rx.tb.phase],
      note: (rx) => (rx.reset ? "Reset week: before the working sets, a set of 3 that's hard but leaves two in you. That triple is the new working weight — save it in the panel above." : ""), tr: 2 },
    { L: "L", n: "Bench Press", m: (rx) => (campBench(rx) && campBench(rx).phase === "contrast" ? 10 : 8), star: 1, hard: 1, mainLift: "cw_bench", work: "cw_bench", vel: "bench",
      hide: (rx) => !campBench(rx),
      pres: (rx) => ({ sc: benchLine(campBench(rx)), pct: campBench(rx).pct }),
      rest: "Rest 2:30", rt: 150,
      timer: (rx) => (campBench(rx).phase === "contrast" ? { kind: "contrast", opt: { rounds: campBench(rx).sets, rest: 150, items: ["BENCH PRESS — 2 @ " + campBench(rx).pct + "%", "BENCH THROW ×3"] }, title: "BENCH CONTRAST" } : null),
      rxLine: (rx) => benchLine(campBench(rx)),
      items: (rx) => { const bp = campBench(rx);
        return [{ n: "Bench press", s: benchLine(bp), cue: BENCH_CUE_C[bp.phase] + " Warm-up sets: bar × 10, 40% × 5, 60% × 3, 75% × 2. Pins at chest height, no collars.", id: "c_bench", k: "wr", mk: "cw_bench", pct: bp.pct, sets: bp.sets, reps: bp.reps }]
          .concat(bp.extra ? [{ n: "Bench press — the strength set", s: bp.extra.sets + " × " + bp.extra.reps + " @ " + bp.extra.pct + "%", cue: "The strength emphasis: one more set, at the top of the week's load.", id: "c_bench_x", k: "wr", mk: "cw_bench", pct: bp.extra.pct, sets: bp.extra.sets, reps: bp.extra.reps }] : [])
          .concat(bp.phase === "contrast" ? [{ n: "Bench throw", s: "3 after each pair · rest 20 s before", cue: "Smith machine, at your peak-power load. Lower to the chest, press so hard the bar leaves your hands, catch it, reset.", id: "c_benchthrow", k: "wr", mk: "cw_bench", pct: rx.btPct, sets: bp.sets, reps: 3 }] : []); },
      w: "A grinding rep ends the set.",
      why: "The punch-speed lift, built on a bench you now train. The ring dips rotate out for the camp; the bench press does the pressing.",
      note: (rx) => (rx.reset ? "Reset week: the working weight comes off today's sets, fast." : ""), tr: 2 },
    { L: "D", n: "Bench Throw", m: 4, star: 1, hard: 1, rest: "Rest 90 s", rt: 90, hide: (rx) => !campThrowRow(rx),
      rxLine: () => "3 × 3 @ your peak-power load",
      items: (rx) => [{ n: "Bench throw", s: "3 × 3", cue: "Smith machine, light bar, at your peak-power load. Lower to the chest, press so hard the bar leaves your hands, catch it, reset.", id: "c_benchthrow", k: "wr", mk: "cw_bench", pct: rx.btPct, sets: 3, reps: 3 }],
      w: OUTPUT_RULE,
      why: "The punch-speed lift.",
      note: "No Smith machine: a 4–6 kg medicine ball thrown off the chest at a wall." },
    { L: "F", n: "Weighted Chin-Ups + The Muscle-Up Line", m: 8, cal: "muscleup", rest: "Rest 90 s", rt: 90,
      rxLine: (rx) => (rx.tp ? "2 × 5, holds only on the line" : chinSets(rx) + " × 5, then " + setsOf(rx, 2) + " sets of the muscle-up line"),
      items: (rx) => [{ n: "Weighted chin-up", s: rx.tp ? "2 × 5" : chinSets(rx) + " × 5", cue: "Palms away, weight on a belt or a dumbbell between the feet, from a dead hang, chin over the bar, lower under control.", id: "c_chinup", k: "wr", sets: rx.tp ? 2 : chinSets(rx), reps: 5 }]
        .concat(rx.tp ? [] : [{ n: "The muscle-up line — at your level", s: setsOf(rx, 2) + " sets", cue: "Chest-to-bar pull-ups at the first level, explosive, the bar touching the chest, climbing through negatives to the strict muscle-up.", id: "muscleup", k: "wr", sets: setsOf(rx, 2), reps: "at your level" }]),
      why: "Pulling strength protects the shoulders that throw; the muscle-up is pulling power, the quality that snaps a hand back." },
    { L: "G", n: "Nordic Curls", m: 6, hide: (rx) => !rx.nor, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => rx.nor[0] + " × " + rx.nor[1],
      items: (rx) => [{ n: "Nordic curl", s: rx.nor[0] + " × " + rx.nor[1], cue: "Kneel with the heels anchored under something solid. Body straight from knees to head, lower forward as slowly as you can, catch yourself with your hands, push back up.", id: "c_nordic", k: "wr", sets: rx.nor[0], reps: rx.nor[1] }],
      w: "Stop the set the moment the lower back rounds.",
      why: (rx) => (rx.ramp ? "From low fitness the Nordics ramp 2 × 3, 2 × 4, 3 × 4, then the camp's numbers. " : "") + (rx.emphasis === "durability" ? "The durability emphasis: one more set. " : "") + "Held at 3 × 5 through the camp, 2 × 3 in weeks 5 and 9. A hamstring on a Saturday sprint is the second-commonest way a preparation ends. Wednesday, so the soreness is gone before Saturday." },
    { L: "H", n: "Neck — holds only", m: 5, p: "C_NECK",
      timer: (rx) => ({ kind: "hold", opt: { sets: setsOf(rx, 3), secs: 10, rest: 20, label: "4-DIRECTION HOLD" }, title: "NECK HOLDS" }),
      items: (rx) => [{ n: "4-direction holds", s: setsOf(rx, 3) + " × 10 s each direction", id: "c_neck_wed", k: "chk" }],
      why: "The third neck dose of the week, because in camp the neck is the cheapest insurance there is." }] },

  /* ---------------- THURSDAY · THROWS + ENGINE 2 ---------------- */
  thu: { n: "THURSDAY", t: "THROWS + ENGINE 2 — throws and landmine, split squat, Spanish hold, Achilles hold, the second conditioning session, the settle, neck, hands, band catch", m: (rx) => (rx.nasal ? 77 : 69), ac: C.cobalt,
    intro: "The third power dose — the rotational throw and the loaded punch — then the only loaded single-leg lift, the tendon holds, and the second conditioning session, always a different quality from Tuesday's. Then the neck and hands again.",
    b: [
    { L: "A", n: "Warm-up", m: 8, p: "C_WU", rxLine: () => "8 min · Tuesday's warm-up, then three easy throws of each at half effort",
      items: [{ n: "Three easy throws of each", s: "at half effort", cue: "A maximal rotational throw is the one movement in the morning nothing in the warm-up has rehearsed.", id: "c_easythrows", k: "chk" }] },
    { L: "B", n: "Power dose — throws + landmine", m: 8, star: 1, hard: 1, rest: "45 s between sets", rt: 45, hide: (rx) => !!rx.tp,
      rxLine: (rx) => "shot-put " + rx.shot + " × 3/side @ " + shotBall(rx) + " · landmine punch " + rx.lm + " × 5/side",
      items: (rx) => [{ n: "Rotational shot-put", s: rx.shot + " × 3 per side @ " + shotBall(rx), cue: "Medicine ball, " + shotBall(rx) + ", at the shoulder, side-on to the wall, drive off the back hip; flat and hard, like the punch. You'll be punching up and in at taller men: more force at the same speed is the adaptation.", id: "c_shot", k: "chk" },
        { n: "Landmine punch", s: rx.lm + " × 5 per side", cue: "One end of a barbell in a corner, the other at your shoulder, in your stance; step in off the rear foot and punch it up and away on the same movement, never a press — the drive that closes distance and the punch that lands, as one.", id: "c_lm", k: "wr", sets: rx.lm, reps: "5/side" }],
      w: "Bar speed is the metric; add weight only when it still snaps. " + OUTPUT_RULE },
    { L: "C", n: "Split Squat — rear foot elevated", m: 7, rest: "Rest 60 s", rt: 60,
      rxLine: (rx) => (rx.dl || rx.tp ? 2 : setsOf(rx, 3)) + " × 6–8 each leg",
      items: (rx) => [{ n: "Rear-foot-elevated split squat", s: (rx.dl || rx.tp ? 2 : setsOf(rx, 3)) + " × 6–8 each leg", cue: "Back foot up on a bench behind you, front shin near vertical, a dumbbell in each hand; sink until the back knee nearly touches, drive up through the front heel. Weak side first, and the same weight on both legs.", id: "c_rfess", k: "wr", sets: rx.dl || rx.tp ? 2 : setsOf(rx, 3), reps: "6–8/leg" }],
      why: "The rear-leg drive and the pivot are one foot; this is where the weak side gets found and fixed." },
    { L: "D", n: "Spanish Squat Hold", m: 3, p: "C_SPAN", rest: "Rest 30 s", rt: 30, rxLine: (rx) => setsOf(rx, 3) + " × 30 seconds" + HOLDS_PLUS(rx),
      timer: (rx) => ({ kind: "hold", opt: { sets: setsOf(rx, 3), secs: 30, rest: 30, label: "SPANISH SQUAT — DEAD STILL" }, title: "SPANISH SQUAT" }),
      items: (rx) => [{ n: "Spanish squat hold", s: setsOf(rx, 3) + " × 30 seconds" + HOLDS_PLUS(rx) + " · rest 30 s", cue: "A thick band around the back of both knees, anchored to the rack in front of you at knee height; lean back into it so the shins stay vertical, sit to a half squat, hold dead still.", id: "c_spanish", k: "wr", sets: setsOf(rx, 3), reps: 30 }],
      why: "The patellar tendon, which takes every depth jump and box landing in this camp. It burns above the kneecap; it never hurts inside the knee." },
    { L: "J", n: "Achilles Hold", m: 2,
      timer: () => ({ kind: "hold", opt: { sets: 1, secs: 45, label: "ACHILLES HOLD — STANDING, STRAIGHT KNEE" }, title: "ACHILLES HOLD" }),
      rxLine: (rx) => "one 45-second standing hold" + HOLDS_PLUS(rx),
      items: (rx) => [{ n: "Achilles hold — STANDING", s: "one × 45 seconds" + HOLDS_PLUS(rx), cue: "As Tuesday's calf block, hold only: on the edge of a step, as heavy as you can hold dead still, rise to the top and hold, knees straight.", id: "c_achilles_thu", k: "chk" }],
      why: "Twice a week, because the contacts are up." },
    { L: "N", n: "The Nasal Threshold Test", m: 8, star: 1, hide: (rx) => !rx.nasal,
      timer: () => ({ kind: "nasal", title: "NASAL THRESHOLD" }), rxLine: () => "8 minutes, nose only, pace up every two minutes",
      items: [{ n: "Minutes in when the mouth opened", s: "write it down", id: "c_nasal_min", k: "out", u: "minutes" },
        { n: "The pace it opened at", s: "write it down", id: "c_nasal_pace", k: "out", u: "pace" },
        { n: "The honest half", s: "did it open because it had to, or because you caved?", id: "c_nasal_honest", k: "out", u: "had to / caved" }],
      w: "Then run the session below one round short.",
      why: "Weeks 1 and 5. Eight minutes nose only, pace up every two minutes until the mouth has to open; log the pace and the honest half — did it open because it had to, or because you caved?", tr: 2 },
    { L: "E", n: (rx) => (CENG[rx.eng2] ? cengName(rx.eng2, rx) : "Engine 2"), m: (rx) => (rx.eng2 === "easy" ? 20 : 28), star: 1, hard: 1, eng: 1, engKey: "eng2",
      engLine: (rx) => cengLine(rx.eng2, rx),
      hide: (rx) => !rx.eng2, timer: (rx) => cengTimer(rx.eng2, !!rx.nasal, rx),
      items: [{ n: "Output", s: "write it down", id: "c_eng2", k: "out", u: "output / peak HR" },
        { n: "Round 1 output", s: "rounds on the erg — write it down", id: "c_erg_rd1", k: "out", u: "output" },
        { n: "Last round output", s: "rounds on the erg — write it down", id: "c_erg_rdl", k: "out", u: "output" }],
      note: "The same session types as Tuesday, written on the Tuesday page. Thursday always runs a different quality from Tuesday. Same erg, same rules, write down your output." },
    { L: "F", n: "The 60-Second Settle", m: 1, settle: 1, hide: (rx) => !rx.eng2,
      timer: () => ({ kind: "settle", title: "THE SETTLE" }), rxLine: () => "60 seconds — log the seconds to land",
      items: [{ n: "Seconds to land on the breath", s: "write it down", id: "c_settle2", k: "out", u: "seconds" }],
      why: "As Tuesday. Every session ends with the settle." },
    { L: "G", n: "Neck", m: 8, p: "C_NECK",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 10, rest: 20, label: "4-DIRECTION HOLD" }, title: "NECK HOLDS" }),
      rxLine: (rx) => "holds · rapid tense " + setsOf(rx, 4) + " × 6 · perturbation",
      items: (rx) => [{ n: "The neck block", s: "holds " + setsOf(rx, 3) + " × 10 s · rapid tense " + setsOf(rx, 4) + " × 6 per direction · perturbation " + setsOf(rx, 2) + " × 20 s", id: "c_neck_thu", k: "chk" }] },
    { L: "H", n: "Hands", m: 4, p: "C_HANDS",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 20, rest: 30, label: "KNUCKLE HOLD" }, title: "HANDS" }),
      items: (rx) => [{ n: "Knuckle hold + band wrist extension", s: setsOf(rx, 3) + " × 20 s · " + setsOf(rx, 2) + " × 15", id: "c_hands_thu", k: "wr", sets: setsOf(rx, 3), reps: 20 }] },
    { L: "K", n: "Band Deceleration Catch", m: 2, rxLine: (rx) => setsOf(rx, 2) + " × 8 per arm",
      items: (rx) => [{ n: "Band deceleration catch", s: setsOf(rx, 2) + " × 8 per arm", cue: "As Monday: a light band anchored behind you at shoulder height, the end in your hand, in your stance. Punch the arm out fast; the band snatches it back — brake it hard and stop it dead in the last third of the return.", id: "c_decel_thu", k: "chk" }],
      why: "Twice a week, because the muscles that brake your arm have to keep up with your punching." }] },

  /* ---------------- FRIDAY · SLEEP ---------------- */
  fri: { n: "FRIDAY", t: "SLEEP. No alarm. RANGE at home in the evening.", m: 0, ac: C.moss, sleep: 1,
    intro: "No alarm. Tomorrow is the long session and Sunday is the rounds, and the best thing you can do for both is not get up at half three.",
    sleepWhy: "The base a Friday morning would have built is worth less than the hour of sleep it costs the night before the two biggest days of the week. Work, RANGE and the sit in the evening, nothing hard, nothing fast, nothing heavy.",
    safeguard: "Sleep is the first session of every day. In bed by half past eight, Sunday to Wednesday, and Friday off the alarm.",
    sleepFood: "Friday's 5pm carb feed loads Saturday; it doesn't move.",
    b: [] },

  /* ---------------- SATURDAY · THE LONG SESSION ---------------- */
  sat: { n: "SATURDAY", t: "★ THE LONG SESSION · 8:30 — get-ups, build-ups, stance starts, close and plant, sprints, reactive jumps, side bounds, the squat in its phase, push press", m: (rx) => (rx.spr && rx.spr.micro ? 25 : 85), ac: C.oxide, free: 1,
    intro: "Fed and rested, Friday's sleep in front of it. Speed first, then reactive power, then the squat in its phase, then the push press. Fuel it: porridge two hours before, half the bottle and a banana twenty minutes before.",
    b: [
    { L: "A", n: "Warm-up — get-ups first", m: 16, p: "C_SATWU", rxLine: () => "16 min · get-ups 2/side, hips, build-ups",
      items: (rx) => [{ n: "Turkish get-up", s: setsOf(rx, 2) + " per side, light", cue: GETUP, id: "c_getup_sat", k: "chk" }],
      why: "The whole body agreeing on how to get off the floor. The build-ups are never skipped." },
    { L: "M", n: "THE SPEED MICRODOSE", m: 25, star: 1, hard: 1, hide: (rx) => !(rx.spr && rx.spr.micro),
      rxLine: () => "25 minutes, everything fast, nothing tired",
      items: [{ n: "3 × 20 m @ 90%", s: "after the build-ups", id: "c_micro_spr", k: "chk" },
        { n: "Box jumps", s: "2 × 3", id: "c_micro_box", k: "chk" },
        { n: "Rotational throws", s: "2 × 3 per side", id: "c_micro_throw", k: "chk" },
        { n: "Bench throws", s: "3 × 3", id: "c_micro_bt", k: "chk" }],
      w: "Everything fast, nothing tired. Nothing here is allowed to cost you anything.",
      why: "The sharpen week. Speed fades fastest once you stop, and this is the dose that keeps it without spending anything." },
    { L: "K", n: "Stance Starts", m: 3, star: 1, hard: 1, rest: "Rest 90 s", rt: 90,
      hide: (rx) => !rx.spr || !!rx.spr.micro, rxLine: (rx) => setsOf(rx, 3) + " × 10 m from your stance",
      items: (rx) => [{ n: "Stance start 10 m", s: setsOf(rx, 3) + " × 10 m", cue: "From your boxing stance, three ten-metre sprints, the first step explosive off the rear foot, 90 seconds between.", id: "c_stance", k: "chk" }],
      why: "Against a taller man the fight is decided in the first two metres, every time he moves; this is that, trained." },
    { L: "Z", n: "Close and Plant", m: 2, star: 1, hard: 1, rest: "Rest 60 s", rt: 60,
      hide: (rx) => !rx.spr || !!rx.spr.micro, rxLine: (rx) => setsOf(rx, 3) + " × 5 m into your stance",
      items: (rx) => [{ n: "Close and plant", s: setsOf(rx, 3) + " × 5 m · stick 2 s", cue: "From your stance, sprint five metres and stop into your stance in one or two steps, dead still for two seconds, balanced and ready to punch; walk back, 60 seconds between.", id: "c_closeplant", k: "chk" }],
      why: "Closing the distance and braking into position is the movement a pressure fighter repeats most, and this is the braking, trained." },
    { L: "B", n: "Flying Sprints", m: 14, star: 1, hard: 1, rest: "Rest 2:30–3:00 — full recovery", rt: 165,
      hide: (rx) => !rx.spr || !!rx.spr.micro || !!rx.noFlying,
      rxLine: (rx) => rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : " · flat out"),
      items: (rx) => [{ n: "Flying sprint 20 m", s: rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : ""), cue: "Jog-build for 10–15 metres, then 20 metres absolutely flat out. Walk back, full rest — speed, not cardio. Curved treadmill, outdoors, or a treadmill on an 8–12% incline at 12–15 km/h for 8–10 seconds with the safety clip on.", id: "c_sprint", k: "out", u: "best time (s)" }],
      w: (rx) => (rx.ramp && rx.spr && rx.spr.pct < 100 && rx.cw <= 2 ? "The tendon ramp: 90% for the camp's first two weeks; flat out from week 3. " : "") + "Yellow day: 3 runs at 90%.",
      why: "Sprinting flat-out is the most explosive thing a body can do, and regular top-speed running is the best-proven protection a hamstring can get.", tr: 2 },
    { L: "C", n: (rx) => (rx.jump === "AEL" ? "Loaded Drop Jumps" : "Depth Jumps"), m: 8, hard: 1, rest: "Rest 2:00", rt: 120,
      hide: (rx) => !!rx.tp,
      rxLine: (rx) => rx.js[0] + " × " + rx.js[1] + (rx.jump === "AEL" ? " · hex DBs 8–12 kg" : " · 30–40 cm box"),
      items: (rx) => [{ n: rx.jump === "AEL" ? "Loaded drop jump" : "Depth jump", s: rx.js[0] + " × " + rx.js[1],
        cue: rx.jump === "AEL" ? "A hex dumbbell in each hand, 8–12 kg, dip fast into a quarter squat, let both dumbbells go at the bottom and jump straight up as high as you can, empty-handed; land soft on clear floor."
          : "Step off a 30–40 cm box and, the instant the feet touch, jump as high as you can, shortest possible time on the floor.", id: "c_jumpsat", k: "out", u: "height / quality" }],
      w: "Stop the set the moment a jump is lower than the last.",
      why: (rx) => (rx.emphasis === "durability" ? "The durability emphasis: loaded drop jumps instead of depth jumps all camp, at the same sets and reps. " : rx.ramp && rx.cw < 4 ? "The tendon ramp: no depth jumps before week 4. " : rx.engine ? "Engine week: loaded drop jumps, never depth jumps. " : "") + "Weeks 1–5 loaded drop jumps; weeks 6–8 depth jumps — the fastest way to convert strength into power that exists.", tr: 2 },
    { L: "D", n: (rx) => (boundAngleC(rx) === "45" ? "Side Bounds — 45°" : "Side Bounds — straight sideways"), m: 6, rest: "Rest 90 s", rt: 90, hide: (rx) => !!rx.tp,
      rxLine: (rx) => rx.bsets + " × 4 per side",
      items: (rx) => [{ n: (boundAngleC(rx) === "45" ? "Side bound — forward-and-across at 45°" : "Side bound — straight sideways") + (rx.bound === "stick" ? ", stick the landing" : ", continuous"), s: rx.bsets + " × 4 per side",
        cue: "Stand on one leg, jump " + (boundAngleC(rx) === "45" ? "forward-and-across at 45 degrees, the angle you cut a ring off at," : "straight sideways") + " as far as you can, land on the other" + (rx.bound === "stick" ? " and stick it dead still for 2 seconds." : " and bounce straight back the other way — no stick."), id: "c_bound", k: "chk" }],
      why: "The sideways push-off that cuts a ring off." },
    { L: "V", n: "Working-Weight Check — Squat", m: 8, star: 1, hide: (rx) => !rx.checks, rxLine: () => "a set of 3, hard with two in you — then the working sets",
      items: [{ n: "Working-weight check — squat", s: "a set of 3, two in reserve", cue: WW_CHECK_CUE, id: "c_ww_sq", k: "out", u: "kg", max: "cw_squat", est: 1.08 }],
      why: "The camp didn't start straight after a Prep test week, and there wasn't time before week 1." },
    { L: "E", n: "Back Squat", m: 16, star: 1, hard: 1, mainLift: "cw_squat", work: "cw_squat", hide: (rx) => !rx.sq,
      pres: (rx) => ({ sc: liftLine(rx.sq, rx), pct: rx.sq.pct }),
      rest: "Rest 3:00 · PINS SET", rt: 180,
      ramp: { n: "Squat warm-up sets — here, not at the start of the session", pcts: [[40, 3], [60, 2], [75, 1]],
        why: "Forty minutes of sprinting and jumping keeps you warm; it doesn't keep the squat pattern rehearsed." },
      timer: (rx) => (rx.sq.phase === "contrast"
        ? { kind: "contrast", opt: { rounds: rx.cr || 3, rest: 180, items: ["BACK SQUAT — 2 @ " + rx.cpct + "%, FAST", "BOX JUMP ×3", "TRAP BAR JUMP ×3", "BAND-ASSISTED JUMP ×3"] }, title: "THE JUMP CIRCUIT" }
        : rx.sq.phase === "cluster" ? clusterTimer(rx.sq.sets, rx.sq.pct + "%", "BACK SQUAT") : null),
      items: (rx) => [{ n: "Back squat", s: liftLine(rx.sq, rx), cue: PHASE_CUE[rx.sq.phase], id: "c_squat", k: "wr", mk: "cw_squat", pct: rx.sq.pct, sets: rx.sq.sets, reps: rx.sq.reps }]
        .concat(rx.sq.extra ? [{ n: "Back squat — the strength set", s: rx.sq.extra.sets + " × " + rx.sq.extra.reps + " @ " + rx.sq.extra.pct + "%", cue: "The strength emphasis: one more set, at the top of the week's load.", id: "c_squat_x", k: "wr", mk: "cw_squat", pct: rx.sq.extra.pct, sets: rx.sq.extra.sets, reps: rx.sq.extra.reps }] : [])
        .concat(rx.sq.phase === "contrast" ? [
          { n: "Box jump", s: "×3 · rest 20 s", cue: "Twenty seconds after the squat. Heavy wakes the system up; fast uses it.", id: "c_cbox", k: "chk" },
          { n: "Trap bar jump", s: "×3 · rest 20 s", cue: "A trap bar at your peak-power load from the profile, jump with it, land soft.", id: "c_ctbj", k: "wr", mk: "cw_tbdl", pct: rx.tjPct, sets: rx.cr || 3, reps: 3 },
          { n: "Band-assisted jump", s: "×3 · then 3 minutes' rest", cue: "A heavy band looped over the top of the rack and tucked under the armpits so it pulls you upward — it makes you faster than you are.", id: "c_cassist", k: "chk" }] : []),
      rxLine: (rx) => liftLine(rx.sq, rx) + (rx.sq.phase === "contrast" ? " · " + (rx.cr || 3) + " rounds" : ""),
      w: (rx) => (rx.sq.phase === "contrast" ? "Pins set just below your lowest position, every set — you're alone. The round ends the moment jump height drops." : "Pins set just below your lowest position, every set — you're alone."),
      why: (rx) => PHASE_WHY[rx.sq.phase] + " Lower-body maximal strength is the best predictor there is of how hard trained boxers hit.",
      note: (rx) => (rx.reset ? "Reset week: a set of 3, hard with two in you, before the working sets. That triple is the new working weight." : ""), tr: 2 },
    { L: "N", n: "Neck — holds only", m: 5, p: "C_NECK", hide: (rx) => !rx.neckSat,
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 10, rest: 20, label: "4-DIRECTION HOLD" }, title: "NECK HOLDS" }),
      items: [{ n: "4-direction holds", s: "3 × 10 s each direction", id: "c_neck_sat", k: "chk" }],
      why: "The durability emphasis: neck holds on Saturday after the squat — four neck days a week." },
    { L: "F", n: "Push Press", m: 8, hard: 1, mainLift: "cw_pp", work: "cw_pp", hide: (rx) => !rx.pp, rest: "Rest 2:00", rt: 120,
      pres: (rx) => ({ sc: ppLine(rx) + " @ " + rx.pp.pct + "%", pct: rx.pp.pct }),
      rxLine: (rx) => ppLine(rx) + " @ " + rx.pp.pct + "%",
      items: (rx) => [{ n: "Push press", s: ppLine(rx), cue: "Bar on the front of the shoulders, quick shallow knee dip, drive it overhead with the legs and punch it to lockout.", id: "c_pushpress", k: "wr", mk: "cw_pp", pct: rx.pp.pct, sets: rx.pp.sets, reps: rx.pp.reps }],
      w: "Loaded like the other lifts: fast, two in reserve.",
      why: "Legs, braced trunk, hands — the route a punch takes." }] },

  /* ---------------- SUNDAY · THE ROUNDS ---------------- */
  sun: { n: "SUNDAY", t: "★ THE ROUNDS · 8:30 — throws, the simulation, the post-max sit, core with suitcase carries, the L-sit, the lever and face pulls, hands, weekly check", m: 80, ac: C.brass, free: 1,
    intro: "The session the camp is for. Fed and rested — porridge two hours before, half the bottle and a banana twenty minutes before, electrolytes in the bottle. Throws first, fresh; then the rounds; then the corner, trained; then the core.",
    b: [
    { L: "A", n: "Warm-up", m: 11, p: "C_SUNWU", rxLine: () => "11 min · Tuesday's warm-up, the power prep and the practice throws" },
    { L: "B", n: "The Four Punch Throws", m: 12, star: 1, p: "C_VEC", hide: (rx) => !!(rx.sim && rx.sim.rehearsal),
      rest: "45 s between exercises · 90 s between rounds", rt: 45,
      timer: (rx) => ({ kind: "vec", opt: { rounds: rx.vec }, title: "PUNCH THROWS" }),
      rxLine: (rx) => rx.vec + " rounds",
      items: (rx) => [{ n: "Rotational shot-put", s: rx.vec + " rounds · 4 per side @ " + shotBall(rx), cue: "A " + shotBall(rx) + " ball at the shoulder, stance side-on to the wall, drive off the back hip, flat and hard.", id: "c_mbshot", k: "out", u: "best distance (m)" },
        { n: "Downward diagonal throw", s: "4 per side", cue: "Ball high outside the shoulder, driven down and across toward the opposite hip, back foot pivoting.", id: "c_mbdiag", k: "out", u: "best distance (m)" },
        { n: "Hook throw", s: "4 per side", cue: "Ball at chest height in bent arms, pivot hard off the lead leg and sling it sideways into the wall.", id: "c_mbhook", k: "chk" },
        { n: "Landmine punch", s: "5 per side", cue: "One end of a barbell in a corner, the other at your shoulder in your stance, drive the hips and punch it up and away, never a slow press.", id: "c_lmpunch", k: "wr", sets: 2, reps: "5/side" }],
      w: OUTPUT_RULE,
      why: "Fresh, first thing — the only throws of the weekend, so every one is at full speed. Straights are forward drive, hooks are rotation; all four get trained. Medicine ball — 5–6 kg for the shot-put through week 5, 3–5 kg after; if it isn't flying, it's too heavy." },
    { L: "C", n: (rx) => (rx.sim && rx.sim.rehearsal ? "THE FIGHT-DAY REHEARSAL" : rx.sim && rx.sim.double ? "The Double" : "The " + (rx.sim ? rx.sim.rounds : 6) + " × " + MINS(rx) + " Simulation"),
      m: (rx) => (rx.sim ? Math.max(12, Math.round((rx.sim.rounds * (MINS(rx) * 60 + rx.sim.rest) + (rx.sim.double ? 300 : 0)) / 60) + 4) : 28), star: 1, sim: 1, hard: 1, hide: (rx) => !rx.sim,
      timer: (rx) => ({ kind: "csim", opt: { rounds: rx.sim.rounds, rest: rx.sim.rest, mins: MINS(rx), double: rx.sim.double || null, pace: !!rx.sim.rehearsal }, title: rx.sim.rehearsal ? "THE REHEARSAL" : rx.sim.double ? "THE DOUBLE" : "THE ROUNDS" }),
      rxLine: (rx) => (rx.sim.double ? rx.sim.double.a + " × " + MINS(rx) + " min, " + rx.sim.double.easy + " min easy, " + rx.sim.double.b + " × " + MINS(rx) + " min" : rx.sim.rounds + " × " + MINS(rx) + " min")
        + " · rest " + rx.sim.rest + " s" + (rx.sim.scored ? " · SCORED" : rx.sim.rehearsal ? " · at fight pace, at fight time" : ""),
      items: (rx) => (rx.sim.rehearsal
        ? [{ n: MINS(rx) === 3 ? "Minute 1–3" : "Every round", s: "at fight pace on the erg or the bag", k: "txt" },
          { n: "Round 1 output", s: "write it down", id: "c_fs_rd1", k: "out", u: "SkiErg m / bike cal" },
          { n: "Last round output", s: "write it down", id: "c_fs_rd6", k: "out", u: "SkiErg m / bike cal" }]
        : [{ n: thirdName(rx, 1), s: "SkiErg", k: "txt" }, { n: thirdName(rx, 2), s: "Assault bike", k: "txt" },
          { n: thirdName(rx, 3), s: "Med-ball slams — a 5–8 kg ball overhead and driven into the floor, caught on the bounce, hard and continuous — or bag work, hard and technically clean.", k: "txt" },
          { n: "Round 1 output", s: (rx.sim.scored ? "SCORED WEEK — write it down" : "write it down"), id: "c_fs_rd1", k: "out", u: "SkiErg m / bike cal" },
          { n: "Last round output", s: rx.master || !rx.R ? "round six divided by round one is the fade" : "the last round divided by round one is the fade", id: "c_fs_rd6", k: "out", u: "SkiErg m / bike cal" }]),
      rules: (rx) => [
        "Relaxed jaw, shoulders down. Finish a round with your traps by your ears and it doesn't count.",
        CORNER_MINUTE,
        rx.master || !rx.R ? "On scored weeks write down round one's output and round six's. Round six divided by round one is the fade. " + SCORED_WEEKS_LINE
          : "On scored weeks write down round one's output and the last round's. The last divided by the first is the fade.",
      ],
      recovery: 1,
      why: (rx) => (rx.sim.rehearsal
        ? "Get up at the time you'll get up on fight day. Eat what you'll eat, when you'll eat it. Do the warm-up you'll do. Then, at the hour the fight is on, " + WORDS[R6(rx)] + " rounds of " + WORDS[MINS(rx)] + " minutes at fight pace on the erg or the bag, " + REST(rx) + " seconds between, the corner minute every rest, the post-max sit after. Not a test — a rehearsal. Everything that goes wrong today, you fix before the day it matters."
        : rx.master || !rx.R ? "Six rounds of three minutes at 60 seconds' rest from week 1; eight in weeks 6 and 7 — two past the fight; ten, once, in week 8, the last hard week. A ceiling you've stood on before the bell. Scored, and the fade decides whether it was worth it."
        : rx.sim.double ? "THE DOUBLE — the ceiling for a short fight: one round more than your fight, five minutes easy, then your fight's rounds again. Same stations, same rest. Scored, the last read."
        : "Your fight on the machines: " + WORDS[R6(rx)] + " rounds of " + WORDS[MINS(rx)] + " minutes, " + REST(rx) + " seconds between, each round split into thirds — SkiErg, assault bike, then slams or the bag. In the build and the peak you go past the fight on purpose; the fade decides whether it was worth it."),
      tr: 2 },
    { L: "D", n: "The Post-Max Sit", m: 3, hide: (rx) => !rx.sim,
      timer: () => ({ kind: "postmax", title: "POST-MAX SIT" }), rxLine: () => "3 min — straight off the last round",
      items: [{ n: "Seconds to settle onto the breath", s: "write it down", cue: "Straight off the last round: sit, eyes closed, heart at 170-plus, find the breath at the nostrils. Write down the seconds it took.", id: "c_postmax", k: "out", u: "seconds" }],
      why: "The corner, trained. The settle after intervals and this sit after the rounds are where the sit is tested." },
    { L: "E", n: "Core, Carries, L-Sit, Lever, Face Pulls, Hands", m: 15, cal: "lsit", rest: "Rest 60 s", rt: 60, hide: (rx) => !!(rx.sim && rx.sim.rehearsal),
      items: (rx) => [{ n: "Hanging leg raise", s: setsOf(rx, 3) + " × 8–12", cue: "Hang from a bar, lift the legs to hip height or above, no swinging.", id: "c_hlr", k: "wr", sets: setsOf(rx, 3), reps: "8–12" },
        { n: "The L-sit line — at your level", s: setsOf(rx, 3) + " sets", cue: "The tuck L-sit between two boxes to start; the line climbs one leg at a time to the full L-sit.", id: "lsit", k: "wr", sets: setsOf(rx, 3), reps: "at your level" },
        { n: "Suitcase carries", s: setsOf(rx, rx.suit || 2) + " × 30 m each side", cue: "One heavy dumbbell or kettlebell in one hand, walk 30 metres tall without leaning or letting the hips shift, switch hands; heavy enough that staying upright is the work.", id: "c_suitcase", k: "wr", sets: setsOf(rx, rx.suit || 2), reps: "30 m/side" },
        { n: "Tuck front lever", s: setsOf(rx, 3) + " holds", cue: "Hang from the bar, pull the shoulder blades down, knees to the chest, body horizontal, face up; ten seconds to start. The three elbow laws apply: five seconds added per fortnight at most, twelve weeks a level minimum, any ache on the inside of the elbow and the lever rests for two weeks.", id: "lever", k: "wr", sets: setsOf(rx, 3), reps: "hold" },
        { n: "Face pulls", s: setsOf(rx, 3) + " × 15", cue: "Rope on a high cable or the band on the door anchor, elbows high, squeeze the back of the shoulders.", id: "c_face", k: "wr", sets: setsOf(rx, 3), reps: 15 },
        { n: "Hands", s: "knuckle hold " + setsOf(rx, 3) + " × 20 s · band wrist extension " + setsOf(rx, 2) + " × 15", cue: "On your fists on a mat, the wrist dead straight; then forearm on the knee, palm down, lifting the knuckles toward you.", id: "c_hands_sun", k: "wr", sets: setsOf(rx, 3), reps: 20 }] },
    { L: "F", n: "Weekly Check", m: 2, review: 1, rangeTests: 1,
      items: [{ n: "Bodyweight", s: "kg", id: "cwr_bw", k: "out", u: "kg" },
        { n: "Waist", s: "cm", id: "cwr_waist", k: "out", u: "cm" },
        { n: "Resting heart rate", s: "bpm", id: "cwr_rhr", k: "out", u: "bpm" },
        { n: "Green days", s: "count", id: "cwr_g", k: "out", u: "days" },
        { n: "Yellow days", s: "count", id: "cwr_y", k: "out", u: "days" },
        { n: "Red days", s: "count", id: "cwr_r", k: "out", u: "days" },
        { n: "Hips", s: "0–10", id: "cwr_hip", k: "out", u: "0–10" },
        { n: "Shoulders", s: "0–10", id: "cwr_sh", k: "out", u: "0–10" },
        { n: "Elbows", s: "0–10", id: "cwr_el", k: "out", u: "0–10" },
        { n: "Wrists", s: "0–10", id: "cwr_wr", k: "out", u: "0–10" },
        { n: "Knees", s: "0–10", id: "cwr_kn", k: "out", u: "0–10" },
        { n: "Achilles", s: "0–10", id: "cwr_ach", k: "out", u: "0–10" },
        { n: "Hamstrings", s: "0–10", id: "cwr_ham", k: "out", u: "0–10" },
        { n: "Hours of sleep, averaged", s: "hours a night", id: "cwr_sleep", k: "out", u: "hours" },
        { n: "Lights-out time, averaged", s: "what time the light went off", id: "cwr_lights", k: "out", u: "e.g. 20:30" },
        { n: "Energy", s: "1–10", id: "cwr_en", k: "out", u: "1–10" },
        { n: "Home-block evenings done", s: "0–7", id: "cwr_home", k: "out", u: "0–7" }],
      note: "Three yellows in a week: next week runs at the table's numbers minus one set on everything and the interval sessions at 90%." }] },
};

export const PHASE_CUE = {
  slow: "SLOW LOWERING — lower the bar over a full five seconds, touch, and drive up fast. Count it: five seconds down, every rep.",
  paused: "PAUSED — lower normally, stop dead an inch off the floor for three seconds, then drive. Count the three seconds; the position is the point.",
  fast: "FAST — no pause: down under control, up as fast as the bar will move. The set ends the moment the bar slows.",
  cluster: "FAST, IN CLUSTERS — two reps, the bar down on the pins for twenty seconds, two more; three minutes between sets. The watch polices every rep, and a rep under the threshold ends the set.",
  contrast: "CONTRAST — the sets at the table's percentage, fast, then straight into the jump circuit. Heavy wakes the system up; fast uses it.",
};
export const PHASE_WHY = {
  slow: "The hand-over week: the body re-learns the tempo and the new working weights settle.",
  paused: "The position force starts from, owned.",
  fast: "The fast phase teaches the nervous system to fire.",
  cluster: "More heavy reps at full speed than straight sets can give.",
  contrast: "The contrast block is where strength becomes speed.",
};
export const PHASE_NAME = { slow: "SLOW LOWERING · 5 s down", paused: "PAUSED · 3 s hold", fast: "FAST", cluster: "FAST, IN CLUSTERS · 20 s on the pins", contrast: "CONTRAST + the jump circuit" };

/* ================================================================
   FIGHT WEEK — week 10. Monday easy, Tuesday the speed microdose,
   Wednesday nothing, Thursday activation, Friday the weigh-in,
   Saturday the fight. (The c12_ ids are storage keys; they don't move.)
   ================================================================ */
export const CSFW = {
  /* the rehearsal, when a fight off a Saturday puts it in fight week */
  reh: null,
  mon: { n: "MONDAY", t: "20 minutes easy · neck holds · RANGE at half dose", m: 25, ac: C.moss,
    intro: "You cannot get fitter this week. You can only get fresher or more tired.",
    b: [
    { L: "A", n: "Easy, nose only", m: 20, star: 1,
      timer: () => ({ kind: "z2", opt: { min: 20, label: "EASY — NOSE ONLY" }, title: "THE BASE" }),
      rxLine: () => "20 min · nose only",
      items: [{ n: "Output", s: "write it down", id: "c_base", k: "out", u: "distance / avg HR" }] },
    { L: "B", n: "Neck — holds only", m: 3, p: "C_NECK",
      timer: () => ({ kind: "hold", opt: { sets: 2, secs: 10, rest: 20, label: "4-DIRECTION HOLD" }, title: "NECK HOLDS" }),
      items: [{ n: "4-direction holds", s: "2 × 10 s each direction", id: "c12_neck", k: "chk" }],
      w: "Then RANGE at half dose. Bed by half past eight." }] },
  tue: { n: "TUESDAY", t: "SPEED MICRODOSE · 25 min — fast, nothing tired, done", m: 25, ac: C.oxide,
    intro: "Speed fades fastest once you stop. This keeps it without spending anything.",
    b: [
    { L: "M", n: "THE SPEED MICRODOSE", m: 25, star: 1,
      rxLine: () => "25 minutes, everything fast, nothing tired",
      items: [{ n: "Warm-up", s: "and the build-ups", id: "c12_micro_wu", k: "chk" },
        { n: "3 × 20 m flying sprints @ 90%", s: "full rest", id: "c12_micro_spr", k: "chk" },
        { n: "Box jumps", s: "2 × 3", id: "c12_micro_box", k: "chk" },
        { n: "Rotational throws", s: "2 × 3 per side", id: "c12_micro_throw", k: "chk" },
        { n: "Bench throws", s: "3 × 3", id: "c12_micro_bt", k: "chk" }],
      w: "Fast, nothing tired, done." }] },
  thu: { n: "THURSDAY", t: "ACTIVATION · 20 min — then feet up", m: 20, ac: C.brass,
    intro: "Two days out. Everything you'll have on Saturday, you have already. This morning only wakes it up.",
    b: [
    { L: "A", n: "Activation", m: 20, star: 1, rxLine: () => "20 min · nothing tired, nothing heavy",
      items: [{ n: "Tuesday's warm-up", s: "bike, bands, hips, pogos", cue: "3 easy minutes on the bike, band pull-aparts × 20, goblet squats × 8, push-ups × 10, 90/90 hip switches × 5 each way, pogo hops × 20.", id: "c12_wu", k: "chk" },
        { n: "Band pull-aparts and external rotations", s: "×20 · ×15 per arm", id: "c12_band", k: "chk" },
        { n: "Three easy throws per side", s: "half effort", id: "c12_throws", k: "chk" },
        { n: "Shadow boxing", s: "two minutes at pace", id: "c12_shadow", k: "chk" },
        { n: "Three physiological sighs", s: "done", cue: "A full breath in through the nose, a short second sip on top, one long slow exhale through the mouth. Three times.", id: "c12_sighs", k: "chk" }],
      w: "Then stop.",
      why: "You cannot get fitter today. You can only get fresher or more tired." }] },
  sat: { n: "FIGHT DAY", t: "★ FIGHT", m: 0, ac: C.oxide, free: 1, fight: 1,
    intro: "The warm-up you rehearsed. The corner minute in every rest. The last round is a place you've already been.",
    b: [
    { L: "W", n: "The weigh-in", m: 0, hide: (rx) => rx.weighIn !== "day", rxLine: () => "today, on the day",
      items: [{ n: "Weigh-in", s: "on the day — then eat the day as a normal Saturday and drink to the alarms", id: "c12_weighin", k: "chk" }] },
    { L: "A", n: "The fight", m: 0, star: 1,
      timer: (rx) => ({ kind: "csim", opt: { rounds: R6(rx), rest: REST(rx), mins: MINS(rx), pace: 1 }, title: "THE FIGHT" }),
      rxLine: (rx) => R6(rx) + " × " + MINS(rx) + " · the corner minute in every rest",
      items: [{ n: "The warm-up you rehearsed", s: "as rehearsed", id: "c12_fwu", k: "chk" },
        { n: "The corner minute", s: "every rest", cue: CORNER_MINUTE, id: "c12_corner", k: "chk" },
        { n: "How it went", s: "write it down tonight", id: "c12_result", k: "out", u: "rounds / result" }],
      why: "Everything you'll have tonight, you had by the Sunday of week 8. Week 9 sharpened it; fight week protected it." }] },
};

CSFW.reh = Object.assign({}, CS.sun, { n: "THE REHEARSAL", b: CS.sun.b.filter((b) => b.L === "A" || b.L === "C" || b.L === "D") });

/* THE WEEK BEFORE THE CAMP — when there's time before week 1: the
   pre-camp check, then Saturday's tests and the working-weight checks,
   then Sunday's 20-minute test. */
export const CPRE = {
  mon: { n: "THIS WEEK", t: "The pre-camp check — bloods and blood pressure", m: 0, ac: C.brass,
    intro: "Before every camp: bloods — full blood count, lipids, liver and kidneys — and blood pressure. A resting ECG once a year.",
    b: [
    { L: "Y", n: "The Pre-Camp Check", m: 0, rxLine: () => "this week — bloods and blood pressure",
      items: [{ n: "Pre-camp check", s: "full blood count, lipids, liver and kidneys · blood pressure", cue: PRE_CAMP_CUE, id: "c_precamp", k: "chk" }],
      why: "Standing rule 5. The app puts it in the week before the camp's first Monday." }] },
  sat: { n: "SATURDAY", t: "Broad jump and rotational throw, then the working-weight checks", m: 45, ac: C.oxide, free: 1,
    intro: "The camp didn't start straight after a Prep test week, so before week 1: the jump, the throw, and a set of 3 on each of the three lifts.",
    b: [
    { L: "A", n: "Warm-up", m: 7, p: "C_WU", rxLine: () => "7 min · bike, bands, squats, push-ups, hips, pogos" },
    { L: "W", n: "Broad Jump and Throw Tests", m: 8, star: 1, rxLine: () => "best of three each",
      items: [{ n: "Broad jump", s: "best of three", cue: "Two-foot jump forward for distance, stick the landing dead still. Three attempts, best one counts.", id: "c_jump", k: "out", u: "metres" },
        { n: "Rotational throw", s: "best of three per side", cue: "Medicine ball at the shoulder, side-on to the wall, drive off the back hip. Three per side, best distance.", id: "c_throw", k: "out", u: "metres" }] },
    { L: "V", n: "Working-Weight Checks", m: 30, star: 1, prepTest: 1, rxLine: () => "squat, trap bar, bench — a set of 3, hard with two in you",
      items: [{ n: "Working-weight check — squat", s: "a set of 3, two in reserve", cue: WW_CHECK_CUE, id: "c_ww_sq", k: "out", u: "kg", max: "cw_squat", est: 1.08 },
        { n: "Working-weight check — trap bar", s: "a set of 3, two in reserve", cue: WW_CHECK_CUE, id: "c_ww_tb", k: "out", u: "kg", max: "cw_tbdl", est: 1.08 },
        { n: "Working-weight check — bench press", s: "a set of 3, two in reserve", cue: WW_CHECK_CUE, id: "c_ww_bench", k: "out", u: "kg", max: "cw_bench", est: 1.08 }],
      why: "That weight × 1.08 is the working max every percentage reads from." }] },
  sun: { n: "SUNDAY", t: "The 20-minute test — it sets your heart-rate zones", m: 30, ac: C.cobalt, free: 1,
    intro: "Five easy minutes, then as much distance as you can in 20 minutes on the bike or SkiErg you'll use all camp.",
    b: [
    { L: "X", n: "The 20-Minute Test", m: 25, star: 1, hard: 1,
      timer: () => ({ kind: "z2", opt: { min: 20, label: "20-MIN TEST — MAXIMUM DISTANCE" }, title: "20-MIN TEST" }),
      rxLine: () => "5 easy minutes, then 20 minutes for the most distance you can",
      items: [{ n: "Distance", s: "the engine's ceiling", id: "c_bike20", k: "out", u: "distance (m)" },
        { n: "Peak heart rate", s: "the highest you saw — it sets your heart-rate zones", id: "c_bike20hr", k: "out", u: "bpm" }],
      why: "Every easy session in the camp is paced at 65–75% of the peak it finds." }] },
};
/* the week before the camp with no tests to do: the check alone */
const CPRE_CHECK_ONLY = { mon: CPRE.mon };

/* days before the fight, for a fight-week day */
const DAY_I = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
export const daysOut = (day, rx) => DAY_I[rx.fightDay || "sat"] - DAY_I[day];
/* the date a camp day falls on */
const dayIsoOf = (rx, day) => { if (!rx.campStart) return null; const p = rx.campStart.split("-").map(Number); const d = new Date(p[0], p[1] - 1, p[2] + (rx.cw - 1) * 7 + DAY_I[day]);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

/* the sessions for a camp day, or null when the day is a card of its own.
   Fight week slides with the fight: twenty easy minutes five days out, the
   microdose four out, nothing three out, the activation two out, nothing
   the day before; the rehearsal is six days out. */
export const campSess = (day, rx) => {
  if (rx.pre) return (rx.checks ? CPRE : CPRE_CHECK_ONLY)[day] || null;
  const iso0 = dayIsoOf(rx, day);
  if (rx.fightWeek) {
    if (iso0 && iso0 === rx.rehearsal) return CSFW.reh;
    const o = daysOut(day, rx);
    return o === 0 ? CSFW.sat : o === 2 ? CSFW.thu : o === 4 ? CSFW.tue : o === 5 ? CSFW.mon : null;
  }
  if (rx.tp && rx.rehearsal && iso0) {
    const sameWeek = rx.rehearsal >= dayIsoOf(rx, "mon") && rx.rehearsal <= dayIsoOf(rx, "sun");
    if (iso0 === rx.rehearsal) return CS.sun;
    if (day === "sun" && sameWeek) return null;
    if (day === "sun" && !sameWeek) return null;
  }
  return CS[day];
};

/* what the card says on the days that have no session page */
export const campBlank = (day, rx) => {
  if (rx.pre) return { h: "BEFORE WEEK 1", c: C.moss, l: ["Nothing written today beyond the pre-camp check.", "Tonight: RANGE, the skill block, the sit — they don't stop."] };
  if (rx.fightWeek) {
    const o = daysOut(day, rx);
    if (o === 1) return rx.weighIn === "day" ? { h: "THE DAY BEFORE", c: C.brass, l: ["Nothing. Feet up. The rehearsal's meals. Bed early.", "You weigh in tomorrow, on the day."] }
      : { h: "THE WEIGH-IN", c: C.brass, l: ["Weigh-in. Nothing else.", "Feet up. The rehearsal's meals. Bed early."] };
    if (o === 3) return { h: "NOTHING TODAY", c: C.moss, l: ["Nothing. RANGE at half dose, the sit.", "You cannot get fitter this week. You can only get fresher or more tired."] };
    if (o < 0) return { h: "AFTER THE FIGHT", c: C.moss,
      l: ["The transition: the first three days RANGE, the sit and walking; then easy — base rides, the movement session, calisthenics at half sets.",
        "It runs on until the strap says you're back: resting heart rate within 3 beats of baseline and HRV within 10% of its average, three mornings running."] };
    return { h: "NOTHING TODAY", c: C.moss, l: ["Nothing written today in fight week.", "RANGE at half dose, the sit."] };
  }
  if (rx.tp && day === "sun") return { h: "NO ROUNDS TODAY", c: C.moss, l: ["The rehearsal is six days before the fight: " + rx.rehearsal + ".", "Tonight: RANGE, the sit."] };
  return { h: "NOTHING WRITTEN TODAY", c: C.moss,
    l: ["No session on this page.",
      "Tonight: RANGE, the skill block, the sit — they don't stop."] };
};
