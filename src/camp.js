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
  "The rounds are the hardest thing in the week and they're Sunday, the day with no shift after it and an easy morning after it.",
  "No maxes. No max singles, no rep-outs, no testing what you can lift.",
  "Nothing new in camp. Every exercise here you own from Prep; only the loads, the rounds and the dates change.",
  "The sixth round is trained as the eighth. In the peak block every round session goes two past the fight, and once, in the last hard week, four past.",
  "Sleep is the first session of every day. In bed by half past eight, Sunday to Wednesday.",
  "Cold water stays out of camp. The sauna comes in from week 2, four times a week in the peak.",
  "The bag is skill, not conditioning. Conditioning is measured on the erg, where the number can't lie.",
  "Easy means easy. Monday's base, the Wednesday thirty and the easy hour are nasal and conversational, or they're stealing from Tuesday and Sunday.",
  "The fight-day rehearsal is Sunday 7 March. Same wake time, same meals, same warm-up, six rounds at fight time of day.",
  "The fade is the number. Round six's output divided by round one's.",
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
    note: "Contrast, depth jumps, top speed twice a week, repeat bursts, eight rounds, the sauna four times. Week 8 is the last hard week — everything you'll have on the night, you'll have by its Sunday." },
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

/* the timer each session type drives */
export const cengTimer = (key, short) => {
  if (key === "vo2") return { kind: "vo2", opt: { short: !!short }, title: short ? "4-MINUTE INTERVALS · ONE SHORT" : "4-MINUTE INTERVALS" };
  if (key === "rz") return { kind: "rz", opt: { sets: 2 }, title: "REPEAT BURSTS" };
  if (key === "rz1") return { kind: "rz", opt: { sets: 1 }, title: "REPEAT BURSTS · ONE SET" };
  if (key === "tempo") return { kind: "tempo", opt: { reps: short ? 9 : 10 }, title: short ? "TEMPO INTERVALS · ONE SHORT" : "TEMPO INTERVALS" };
  if (key === "thr") return { kind: "thr", title: "THRESHOLD" };
  if (key === "lac") return { kind: "lac", opt: { blocks: 1, reps: short ? 5 : 6 }, title: short ? "40-SECOND REPEATS · ONE SHORT" : "40-SECOND REPEATS" };
  if (key === "lac2") return { kind: "lac", opt: { blocks: 2, reps: 6 }, title: "40-SECOND REPEATS · 2 × 6" };
  if (key === "erg") return { kind: "ergrounds", opt: { rounds: 7 }, title: "ROUNDS ON THE ERG" };
  if (key === "erg8") return { kind: "ergrounds", opt: { rounds: 8 }, title: "ROUNDS ON THE ERG" };
  if (key === "fp") return { kind: "ergrounds", opt: { rounds: 4 }, title: "FIGHT-PACE ROUNDS" };
  return { kind: "z2", opt: { min: 20, label: "EASY — CONVERSATIONAL" }, title: "EASY" };
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
  cr, cpct: pct, jump: "DEPTH", js: [4, 5], bound: "cont",
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

/* THE EDGE, for a camp week. On, the week runs every addition its weeks
   carry; off — two yellow mornings, or the switch in settings — the base
   program: no Tuesday speed, no Wednesday thirty, straight sets for the
   clusters, the contacts back, no microdoses, six rounds. */
export function campEdge(rx, on) {
  const o = Object.assign({}, rx, { edge: !!on, speed: false, sauna4: !!rx.edgeWin,
    micro: !!on && !rx.fightWeek, thirty: !!on && !rx.fightWeek });
  if (!on) return o;
  if (rx.cluster) Object.assign(o, {
    tb: tb("FAST, IN CLUSTERS · 5 × (2+2) @ 87%", 5, "2+2", 87, "cluster"),
    sq: tb("FAST, IN CLUSTERS · 5 × (2+2) @ 87%", 5, "2+2", 87, "cluster") });
  if (rx.edgeWin) Object.assign(o, { speed: true, box: [4, 3], js: [5, 5], bsets: 4 });
  if (rx.edgeRounds && rx.sim) o.sim = Object.assign({}, rx.sim, { rounds: rx.edgeRounds });
  return o;
}

export const campRxFor = (w, edge) => {
  const n = Math.max(1, Math.min(CAMP_L, Number(w) || 1));
  return campEdge(CW[n], edge !== false);
};

/* even-numbered weeks, not the easy and test weeks: the long sled runs
   become repeat sled starts */
export const campRepeatSled = (rx) => !!rx.sled && rx.w % 2 === 0 && !rx.dl && !rx.tp;
/* the shot-put ball by block: 5–6 kg through week 5, 3–5 kg after */
const shotBall = (rx) => (rx.w <= 5 ? "5–6 kg" : "3–5 kg");

/* the week table's row, built from the same numbers the sessions use */
export const campRow = (rx) => ({
  mon: rx.fightWeek ? "20 min easy" : rx.base ? rx.base + " min" : "—",
  tue: rx.fightWeek ? "SPEED MICRODOSE 25 min"
    : rx.tests && rx.tests.tue === "retest9" ? "RETESTS, then bursts 1 × 8"
    : (CENG[rx.eng1] ? CENG[rx.eng1].n : "—") + (rx.tests && rx.tests.tue ? " · " + (rx.tests.tue === "burst" ? "BURST TEST first" : "RETESTS first") : "")
      + (rx.w === 3 ? " · shuttles begin" : "") + (rx.speed ? " · speed twice" : ""),
  wed: rx.tb ? (rx.reset ? "reset the working weights · " : "") + rx.tb.sc + (campRepeatSled(rx) ? " · repeat sled starts" : "") : "—",
  thu: rx.fightWeek ? "ACTIVATION 20 min" : (CENG[rx.eng2] ? CENG[rx.eng2].n : "—") + (rx.nasal ? " · NASAL TEST first" : ""),
  sat: rx.fightWeek ? "FIGHT" : (rx.spr && rx.spr.micro ? "SPEED MICRODOSE 25 min"
    : (rx.spr ? rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : "") : "—") + (rx.sq ? " · " + rx.sq.sc : "")
      + (rx.jump === "DEPTH" ? " · depth jumps " + rx.js[0] + " × " + rx.js[1] : "")),
  sun: rx.fightWeek ? "—"
    : rx.sim ? (rx.sim.rehearsal ? "FIGHT-DAY REHEARSAL · " + rx.sim.rounds + " × 3 at fight pace"
      : rx.sim.rounds + " × 3" + (rx.sim.scored ? " SIM — SCORED" + (rx.sim.scored === "baseline" ? " (camp baseline)" : rx.sim.scored === "last" ? " (last read)" : "") : "") + ", " + rx.sim.rest + " s"
        + (rx.sauna === "starts" ? " · sauna starts" : rx.sauna4 && rx.edge ? " · sauna × 4" : "")) : "—",
  nor: rx.nor ? rx.nor[0] + " × " + rx.nor[1] : "—",
  sled: rx.sled ? (campRepeatSled(rx) ? "6 × 10 m repeat starts" : rx.sled + " runs") : "—",
});

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
export const FIGHT_WEEK_AFTER = "After the fight: the two-week transition — three or four days of nothing but RANGE, the sit and walking, then two easy weeks — and Prep restarts when the strap says the numbers are back to baseline.";

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
const CRAWLS = "on hands and feet, knees an inch off the floor, back flat as a table, opposite hand and foot together, 10 metres forward and 10 back, four times, slow.";

export const CPROTO = {
  C_WU: { n: "Warm-up · crawls", s: "8 min · Tue and Thu", c: C.cobalt,
    note: "Thursday's is the same, crawls included, then three easy throws of each at half effort.",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"],
      ["THEN BEAR CRAWLS · 2 MIN", ""], ["Bear crawls", CRAWLS]] },
  C_WUW: { n: "Warm-up", s: "6 min · Wed", c: C.cobalt,
    note: "Tuesday's warm-up without the crawls, then the trap bar warm-up sets.",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"],
      ["TRAP BAR WARM-UP SETS", ""], ["Bar", "×5"], ["50% of working", "×3"], ["70% of working", "×2"]] },
  C_SATWU: { n: "Warm-up · get-ups, hips + build-ups", s: "16 min · Sat", c: C.cobalt,
    note: "Never sprint cold. The build-ups are the sprint warm-up and they are never skipped. The squat warm-up sets sit inside the squat step, forty minutes later.",
    i: [["TURKISH GET-UP · 2 PER SIDE, LIGHT", ""], ["Turkish get-up", GETUP],
      ["THEN THE HIPS", ""], ["90/90 hip switches", "×5 each way"], ["Hip airplanes", "×5 per side — stand on one leg holding the rack, hinge the chest to horizontal, rotate toward the floor and then up"],
      ["Cossack squats", "×6 per side"], ["Leg swings", "×10 each way"], ["Pogo hops", "2 × 20"],
      ["THE SPRINT BUILD-UPS — NEVER SKIPPED", ""], ["20 m @ 60%", "×1"], ["20 m @ 75%", "×1"], ["20 m @ 90%", "×1"]] },
  C_SUNWU: { n: "Warm-up · get-ups + practice throws", s: "14 min · Sun", c: C.cobalt,
    note: "Turkish get-ups, then Tuesday's warm-up without the crawls, then the power prep and three easy throws of each of the four.",
    i: [["TURKISH GET-UP · 2 PER SIDE, LIGHT", ""], ["Turkish get-up", GETUP],
      ["THEN TUESDAY'S WARM-UP, WITHOUT THE CRAWLS", ""],
      ["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"],
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
  "HOME · tonight: RANGE, 20 min · Mon–Thu then the skill block, 6 min · then the sit and the review · and the morning five on waking. All ten weeks, fight week at half dose.";
export const CAMP_HOMELINE_TAPER =
  "HOME · tonight: RANGE at half dose, 10 min — the roller, the open book, the 90/90 with the lift, the couch stretch, the deep squat hold, the hang · then the sit. It doesn't stop.";

export const CAMP_EASY_HOUR = {
  n: "THE EASY HOUR",
  s: "30–40 minutes easy, nose only, bike or walk, four-plus hours after the session.",
  why: "Active recovery for legs that have just done the rounds, and the aerobic base that the base day alone doesn't carry.",
  tag: "SUNDAY AFTERNOON · NOSE ONLY",
};
export const SAUNA_LINE = "Weeks 2–5: sauna, 15–20 minutes, twice a week; weeks 6–8: four times — Sunday, Tuesday, Thursday and Saturday evenings — the full heat-acclimation dose, with the hydration schedule's sauna line every time. Never straight from the sauna into cold.";

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
  mon: { n: "MONDAY", t: "BASE — easy nasal ride or run, 45 min · neck · hands · ring rows", m: (rx) => (rx.base || 0) + 17, ac: C.moss,
    intro: "The base is the thing Optimal 8 was thin on and the thing the camp will lean on hardest. It decides how fast you recover between exchanges and between rounds — roughly three-quarters of a 6 × 3 is aerobic — and it's the floor that lets Tuesday and Thursday be as hard as they are. It's the low day in a high/low week, and it must stay low.",
    b: [
    { L: "A", n: "Easy, nose only", m: (rx) => rx.base || 45, star: 1,
      timer: (rx) => ({ kind: "z2", opt: { min: rx.base || 45, label: "EASY — NOSE ONLY" }, title: "THE BASE" }),
      rxLine: (rx) => (rx.base || 45) + " min · nose the whole way",
      items: [{ n: "Output", s: "write it down", id: "c_base", k: "out", u: "distance / avg HR" }],
      w: "Nose the whole way; if you can't hold a sentence, slow down.",
      why: "Bike, SkiErg, or a run if your legs and ankles are used to it — a run builds the base faster but costs more. Heart rate on the strap and the average logged: 65–75% of your peak, no higher. The output at that heart rate is the number that should climb. Forty-five minutes through the camp, thirty in the easy week and the sharpen week. Boring on purpose. Fine on an empty stomach." },
    { L: "B", n: "Neck", m: 8, p: "C_NECK",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 10, rest: 20, label: "4-DIRECTION HOLD" }, title: "NECK HOLDS" }),
      rxLine: () => "holds · rapid tense 4 × 6 · perturbation",
      items: [{ n: "The neck block", s: "holds 3 × 10 s · rapid tense 4 × 6 per direction · perturbation 2 × 20 s", id: "c_neck_mon", k: "chk" }],
      why: "A stiffer neck lowers how much the head accelerates when hit. Not armour; a cheap bet on a sound mechanism, from day one." },
    { L: "C", n: "Hands", m: 4, p: "C_HANDS",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 20, rest: 30, label: "KNUCKLE HOLD" }, title: "HANDS" }),
      items: [{ n: "Knuckle hold + band wrist extension", s: "3 × 20 s · 2 × 15", id: "c_hands_mon", k: "wr", sets: 3, reps: 20 }] },
    { L: "D", n: "Ring Rows", m: 5, cal: "ringrow", rest: "Rest 60 s", rt: 60, rxLine: () => "3 sets at your level",
      items: [{ n: "Ring rows — at your level", s: "3 sets", cue: "Rings hung at hip height, hang beneath them with the body straight and heels on the floor, pull the rings to the chest, pause, lower slow; the line climbs to feet-elevated rows and archer rows.", id: "ringrow", k: "wr", sets: 3, reps: "at your level" }],
      why: "Light horizontal pulling on the easy day, keeping the shoulder honest without touching the elbow load Wednesday carries." }] },

  /* ---------------- TUESDAY · POWER + ENGINE 1 ---------------- */
  tue: { n: "TUESDAY", t: "POWER + ENGINE 1 — crawls, jumps, shuttles, speed from week 6, pistol line, Spanish hold, the interval session, the settle, trunk, the Achilles hold", m: (rx) => (isTest(rx, "tue") ? 78 : 70), ac: C.cobalt,
    intro: "Fresh legs, so the power dose goes first. Then the week's first hard conditioning session. Then the trunk, because the trunk is what turns leg drive into hand speed.",
    b: [
    { L: "A", n: "Warm-up + bear crawls", m: 8, p: "C_WU", rxLine: () => "8 min · bike, bands, hips, pogos — then bear crawls, 2 min",
      items: [{ n: "Bear crawls · 2 min", s: "10 m forward, 10 m back, × 4", cue: CRAWLS, id: "c_crawl", k: "wr", sets: 4, reps: 20 }],
      why: "Loads the shoulder and trunk in a pattern the body hasn't done since you were two." },
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
    { L: "B", n: "Power dose — jumps", m: 8, star: 1, hard: 1, rest: "Rest 90 s", rt: 90, hide: (rx) => !!rx.tp,
      rxLine: (rx) => "broad jumps 3 × 2 · box jumps " + rx.box[0] + " × " + rx.box[1] + (rx.w >= 3 ? " · shuttle bursts × 6" : ""),
      items: (rx) => [{ n: "Broad jump", s: "3 × 2", cue: "Two-foot jump forward for distance, stick the landing dead still.", id: "c_broad", k: "chk" },
        { n: "Box jump", s: rx.box[0] + " × " + rx.box[1], cue: "The box chosen by the landing: you land on it in a quarter squat. Quick dip, jump as high as you can, land soft, step down.", id: "c_boxjump", k: "chk" }]
        .concat(rx.w >= 3 ? [{ n: "Shuttle bursts", s: "6 × 5 m out and back · 20 s between", cue: "Six times five metres out and back, a hard push-off at each turn, twenty seconds between. A mover with good feet makes you change direction; this trains it forward and back. Three minutes.", id: "c_shuttle", k: "chk" }] : []),
      w: OUTPUT_RULE,
      why: "Explosiveness responds to how often the nervous system is asked, not how much. Eight minutes, three mornings a week." },
    { L: "Q", n: "Speed — flying twenties", m: 8, star: 1, hard: 1, edge: 1, rest: "Rest 2:30", rt: 150, hide: (rx) => !rx.speed,
      rxLine: () => "build-ups at 75% and 90%, then 3 × 20 m flat out",
      items: [{ n: "Build-up 20 m", s: "one at 75%, one at 90%", cue: "Never skipped. The build-ups are what make the speed safe.", id: "c_speed_bu", k: "chk" },
        { n: "Flying sprint 20 m", s: "3 × 20 m · rest 2½ min", cue: "After the shuttles: three flying 20-metre sprints, absolutely flat out. Curved treadmill or outdoors.", id: "c_speed_tue", k: "out", u: "best time (s)" }],
      w: "A hamstring twinge on the build-ups ends the speed for the day. The Nordics never miss.",
      why: "THE EDGE. Twice a week is what sprinters do, and it's the best hamstring insurance there is — provided the build-ups never miss." },
    { L: "C", n: "The Pistol Line", m: 5, cal: "pistol", rest: "Rest 60 s", rt: 60, hide: (rx) => !!rx.tp, rxLine: () => "2 × 5 per leg at your level",
      items: [{ n: "The pistol line — at your level", s: "2 × 5 per leg", cue: "Box pistol to start — stand on one leg in front of a box, the other straight out in front, sit to the box under control and stand without the free foot touching — climbing to the assisted and then the full pistol.", id: "pistol", k: "wr", sets: 2, reps: "5/leg" }],
      w: "Two sets, never to failure: control, not load.",
      why: "The pivot foot learning to own the body." },
    { L: "K", n: "Spanish Squat Hold", m: 3, p: "C_SPAN", rest: "Rest 30 s", rt: 30, rxLine: () => "3 × 30 seconds",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 30, rest: 30, label: "SPANISH SQUAT — DEAD STILL" }, title: "SPANISH SQUAT" }),
      items: [{ n: "Spanish squat hold", s: "3 × 30 seconds · rest 30 s", cue: "As Thursday: a thick band around the back of both knees, anchored to the rack in front of you at knee height; lean back into it so the shins stay vertical, sit to a half squat, hold dead still.", id: "c_spanish_tue", k: "wr", sets: 3, reps: 30 }],
      why: "The tendon block runs twice a week now, because the jumps do." },
    { L: "D", n: (rx) => (CENG[rx.eng1] ? CENG[rx.eng1].n : "Engine 1"), m: (rx) => (rx.eng1 === "easy" ? 20 : 24), star: 1, hard: 1, eng: 1, engKey: "eng1", menu: 1,
      hide: (rx) => !rx.eng1, timer: (rx) => cengTimer(rx.eng1),
      items: [{ n: "Output", s: "write it down", id: "c_eng1", k: "out", u: "output / peak HR" }],
      note: "Bike or SkiErg — one, all camp, so the numbers compare. Write down your output every session." },
    { L: "E", n: "The 60-Second Settle", m: 1, settle: 1, hide: (rx) => !rx.eng1,
      timer: () => ({ kind: "settle", title: "THE SETTLE" }), rxLine: () => "60 seconds — log the seconds to land",
      items: [{ n: "Seconds to land on the breath", s: "write it down", id: "c_settle1", k: "out", u: "seconds" }],
      why: "Stay on the bike, eyes closed, heart pounding, find the breath at the nostrils, count the seconds it takes to land there. The corner between rounds, trained." },
    { L: "F", n: "Trunk", m: 9, rest: "Rest 45 s", rt: 45, hide: (rx) => !!rx.tp,
      items: [{ n: "Pallof press", s: "3 × 10 per side · 2 s hold", cue: "Band at chest height anchored beside you, press the hands straight out and hold 2 seconds without letting it twist you.", id: "c_pallof", k: "wr", sets: 3, reps: "10/side" },
        { n: "Ab wheel rollout", s: "3 × 8–12", cue: "Knees down, out only as far as the lower back remains flat.", id: "c_abwheel", k: "wr", sets: 3, reps: "8–12" },
        { n: "Copenhagen plank", s: "2 × 30 s per side", cue: "Side plank, top foot on a bench, bottom leg lifted.", id: "c_copenplank", k: "wr", sets: 2, reps: 30 }],
      why: "The groin you pivot off, and the trunk that turns leg drive into hand speed." },
    { L: "G", n: "Seated Calf Raise + Achilles Hold", m: 5, rest: "Rest 60 s", rt: 60,
      rxLine: () => "3 × 12, then one 45-second hold",
      timer: () => ({ kind: "hold", opt: { sets: 1, secs: 45, label: "ACHILLES HOLD — STANDING, STRAIGHT KNEE" }, title: "ACHILLES HOLD" }),
      items: [{ n: "Seated calf raise", s: "3 × 12", cue: "Up on the balls of the feet, pause, down slow, twelve times — the knee-bent position trains the muscle that keeps you on your toes in round six.", id: "c_soleus", k: "wr", sets: 3, reps: 12 },
        { n: "Achilles hold — STANDING", s: "one × 45 seconds", cue: "On the edge of a step, a dumbbell in each hand or a bar on your back, as heavy as you can hold dead still, rise to the top and hold 45 seconds, knees straight.", id: "c_achilles", k: "chk" }],
      why: "The Achilles takes every sprint and landing in this camp on a straight knee; this is its insurance." }] },

  /* ---------------- WEDNESDAY · STRENGTH ---------------- */
  wed: { n: "WEDNESDAY", t: "STRENGTH — sled (repeat starts on even weeks), drive holds, the trap bar in its phase, bench throw, ring dips, chins and the muscle-up line, Nordics, neck holds", m: 64, ac: C.oxide,
    intro: "The heavy morning, and the lift changes its shape by block — slow lowering, paused, fast in clusters, contrast. Every rep moves with intent; the watch says how fast, and the set ends at the velocity threshold. A grinding rep ends the set.",
    b: [
    { L: "A", n: "Warm-up", m: 6, p: "C_WUW", rxLine: () => "6 min · then bar × 5, 50% × 3, 70% × 2 of working" },
    { L: "B", n: (rx) => (campRepeatSled(rx) ? "Repeat Sled Starts" : "Heavy Sled"), m: 12, star: 1, hard: 1, hide: (rx) => !rx.sled,
      rest: (rx) => (campRepeatSled(rx) ? "Rest 0:30" : "Rest 2:30"), rt: (rx) => (campRepeatSled(rx) ? 30 : 150),
      rxLine: (rx) => (campRepeatSled(rx) ? "6 × 10 m" : rx.sled + " × 20 m") + " @ 40–60% of bodyweight",
      items: (rx) => [campRepeatSled(rx)
        ? { n: "Repeat sled start 10 m", s: "6 × 10 m", cue: "Six heavy runs of ten metres with thirty seconds' rest. Same load as the long runs: 40–60% of bodyweight, lean in at about 45°, drive the ground backward through the whole foot.", id: "c_sled_rep", k: "out", u: "load (kg) · time (s)", bwp: [40, 60], bwl: "on the sled" }
        : { n: "Heavy sled sprint 20 m", s: rx.sled + " × 20 m", cue: "Load the sled with 40–60% of bodyweight, lean in at about 45°, sprint 20 metres driving the ground backward through the whole foot.", id: "c_sled", k: "out", u: "load (kg) · time (s)", bwp: [40, 60], bwl: "on the sled" }],
      w: (rx) => (campRepeatSled(rx) ? "Forward pressure repeated on a clock, which is the shape of a pressure fight against a man who keeps resetting." : "Get the load right by the clock: 5–7 seconds a run. Faster, add weight; slower, take some off."),
      why: "Horizontal force, the push that starts a punch and closes distance, with no soreness and nothing on your spine. First, while the nervous system is freshest. No sled: skip to the trap bar and add a set." },
    { L: "K", n: "Drive Holds", m: 3, hard: 1, rest: "Rest 60 s", rt: 60, hide: (rx) => !rx.sled || rx.w > 8, rxLine: () => "3 × 10 seconds",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 10, rest: 60, label: "DRIVE HOLD — FROM YOUR STANCE" }, title: "DRIVE HOLDS" }),
      items: [{ n: "Drive hold", s: "3 × 10 seconds", cue: "Load the sled so it won't move — or use a wall — and from your boxing stance drive into it as hard as you can for ten seconds, through the rear leg, the trunk braced, breathing out.", id: "c_drivehold", k: "chk" }],
      why: "The clinch against a heavier man: the strength to hold your ground under ninety kilos is an isometric, and this is the only place it's trained.", tr: 2 },
    { L: "C", n: "Trap Bar Deadlift", m: 12, star: 1, hard: 1, mainLift: "cw_tbdl", work: "cw_tbdl", hide: (rx) => !rx.tb,
      pres: (rx) => ({ sc: rx.tb.sc, pct: rx.tb.pct }),
      rest: (rx) => (rx.tb.phase === "contrast" || rx.tb.phase === "cluster" ? "Rest 3:00" : "Rest 2:30"), rt: (rx) => (rx.tb.phase === "contrast" || rx.tb.phase === "cluster" ? 180 : 150),
      timer: (rx) => (rx.tb.phase === "contrast" ? { kind: "contrast", opt: { rounds: rx.tb.sets, rest: 180, items: ["TRAP BAR — 2 @ " + rx.tb.pct + "%, FAST", "BOX JUMP ×3", "TRAP BAR JUMP ×3"] }, title: "TRAP BAR CONTRAST" }
        : rx.tb.phase === "cluster" ? clusterTimer(rx.tb.sets, rx.tb.pct + "%", "TRAP BAR") : null),
      items: (rx) => [{ n: "Trap bar deadlift", s: rx.tb.sc, cue: PHASE_CUE[rx.tb.phase], id: "c_tbdl", k: "wr", mk: "cw_tbdl", pct: rx.tb.pct, sets: rx.tb.sets, reps: rx.tb.reps }],
      rxLine: (rx) => rx.tb.sc,
      w: "Nothing passes over your body and a rep you're not sure of goes down, not up — the one heavy lift safe to do alone at this hour. A grinding rep ends the set.",
      why: (rx) => PHASE_WHY[rx.tb.phase],
      note: (rx) => (rx.reset ? "Reset week: before the working sets, a set of 3 that's hard but leaves two in you. That triple is the new working weight — save it in the panel above." : ""), tr: 2 },
    { L: "D", n: "Bench Throw", m: 6, star: 1, hard: 1, rest: "Rest 90 s", rt: 90, hide: (rx) => !!rx.fightWeek,
      rxLine: (rx) => (rx.tp ? "3 × 3" : "4 × 3"),
      items: (rx) => [{ n: "Bench throw", s: (rx.tp ? "3 × 3" : "4 × 3") + " @ about a third of what you'd bench", cue: "Smith machine, light bar. Lower to the chest, press so hard the bar leaves your hands, catch it, reset. Whatever weight flies highest.", id: "c_benchthrow", k: "wr", mk: "bench", pct: [30, 40], sets: rx.tp ? 3 : 4, reps: 3 }],
      w: OUTPUT_RULE,
      why: "The punch-speed lift.",
      note: "No Smith machine: a 4–6 kg medicine ball thrown off the chest at a wall, 4 × 5." },
    { L: "E", n: "Ring Dips", m: 6, cal: "ringdip", rest: "Rest 90 s", rt: 90, rxLine: () => "3 sets at your level", hide: (rx) => !!rx.tp,
      items: [{ n: "Ring dips — at your level", s: "3 sets", cue: "Support at the top of the rings, arms locked, rings still; lower until the shoulders are level with the elbows, press up, turning the palms forward at the top.", id: "ringdip", k: "wr", sets: 3, reps: "at your level" }],
      w: "Elbow pain is a stop sign, not a challenge.",
      why: "Pressing through a shoulder that has to stabilise itself — the cuff and serratus work that keeps a guard up." },
    { L: "F", n: "Weighted Chin-Ups + The Muscle-Up Line", m: 8, cal: "muscleup", rest: "Rest 90 s", rt: 90,
      rxLine: (rx) => (rx.tp ? "2 × 5, holds only on the line" : "3 × 5, then 2 sets of the muscle-up line"),
      items: (rx) => [{ n: "Weighted chin-up", s: rx.tp ? "2 × 5" : "3 × 5", cue: "Palms away, weight on a belt or a dumbbell between the feet, from a dead hang, chin over the bar, lower under control.", id: "c_chinup", k: "wr", sets: rx.tp ? 2 : 3, reps: 5 }]
        .concat(rx.tp ? [] : [{ n: "The muscle-up line — at your level", s: "2 sets", cue: "Chest-to-bar pull-ups at the first level, explosive, the bar touching the chest, climbing through negatives to the strict muscle-up.", id: "muscleup", k: "wr", sets: 2, reps: "at your level" }]),
      why: "Pulling strength protects the shoulders that throw; the muscle-up is pulling power, the quality that snaps a hand back." },
    { L: "G", n: "Nordic Curls", m: 6, hide: (rx) => !rx.nor, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => rx.nor[0] + " × " + rx.nor[1],
      items: (rx) => [{ n: "Nordic curl", s: rx.nor[0] + " × " + rx.nor[1], cue: "Kneel with the heels anchored under something solid. Body straight from knees to head, lower forward as slowly as you can, catch yourself with your hands, push back up.", id: "c_nordic", k: "wr", sets: rx.nor[0], reps: rx.nor[1] }],
      w: "Stop the set the moment the lower back rounds.",
      why: "Held at 3 × 5 through the camp, 2 × 3 in weeks 5 and 9. A hamstring on a Saturday sprint is the second-commonest way a preparation ends. Wednesday, so the soreness is gone before Saturday." },
    { L: "H", n: "Neck — holds only", m: 5, p: "C_NECK",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 10, rest: 20, label: "4-DIRECTION HOLD" }, title: "NECK HOLDS" }),
      items: [{ n: "4-direction holds", s: "3 × 10 s each direction", id: "c_neck_wed", k: "chk" }],
      why: "The third neck dose of the week, because in camp the neck is the cheapest insurance there is." }] },

  /* ---------------- THURSDAY · THROWS + ENGINE 2 ---------------- */
  thu: { n: "THURSDAY", t: "THROWS + ENGINE 2 — crawls, throws and landmine, split squat, Spanish hold, Achilles hold, the second conditioning session, the settle, neck, hands", m: (rx) => (rx.nasal ? 75 : 67), ac: C.cobalt,
    intro: "The third power dose — the rotational throw and the loaded punch — then the only loaded single-leg lift, the tendon holds, and the second conditioning session, always a different quality from Tuesday's. Then the neck and hands again.",
    b: [
    { L: "A", n: "Warm-up + bear crawls", m: 8, p: "C_WU", rxLine: () => "8 min · crawls included, then three easy throws of each at half effort",
      items: [{ n: "Three easy throws of each", s: "at half effort", cue: "A maximal rotational throw is the one movement in the morning nothing in the warm-up has rehearsed.", id: "c_easythrows", k: "chk" }] },
    { L: "B", n: "Power dose — throws + landmine", m: 8, star: 1, hard: 1, rest: "45 s between sets", rt: 45, hide: (rx) => !!rx.tp,
      rxLine: (rx) => "shot-put 2 × 3/side @ " + shotBall(rx) + " · landmine punch 2 × 5/side",
      items: (rx) => [{ n: "Rotational shot-put", s: "2 × 3 per side @ " + shotBall(rx), cue: "Medicine ball, " + shotBall(rx) + ", at the shoulder, side-on to the wall, drive off the back hip; flat and hard, like the punch. You'll be punching up and in at taller men: more force at the same speed is the adaptation.", id: "c_shot", k: "chk" },
        { n: "Landmine punch", s: "2 × 5 per side", cue: "One end of a barbell in a corner, the other at your shoulder, in your stance; step in off the rear foot and punch it up and away on the same movement, never a press — the drive that closes distance and the punch that lands, as one.", id: "c_lm", k: "wr", sets: 2, reps: "5/side" }],
      w: "Bar speed is the metric; add weight only when it still snaps. " + OUTPUT_RULE },
    { L: "C", n: "Split Squat — rear foot elevated", m: 7, rest: "Rest 60 s", rt: 60,
      rxLine: (rx) => (rx.dl || rx.tp ? "2 × 6–8 each leg" : "3 × 6–8 each leg"),
      items: (rx) => [{ n: "Rear-foot-elevated split squat", s: (rx.dl || rx.tp ? 2 : 3) + " × 6–8 each leg", cue: "Back foot up on a bench behind you, front shin near vertical, a dumbbell in each hand; sink until the back knee nearly touches, drive up through the front heel. Weak side first, and the same weight on both legs.", id: "c_rfess", k: "wr", sets: rx.dl || rx.tp ? 2 : 3, reps: "6–8/leg" }],
      why: "The rear-leg drive and the pivot are one foot; this is where the weak side gets found and fixed." },
    { L: "D", n: "Spanish Squat Hold", m: 3, p: "C_SPAN", rest: "Rest 30 s", rt: 30, rxLine: () => "3 × 30 seconds",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 30, rest: 30, label: "SPANISH SQUAT — DEAD STILL" }, title: "SPANISH SQUAT" }),
      items: [{ n: "Spanish squat hold", s: "3 × 30 seconds · rest 30 s", cue: "A thick band around the back of both knees, anchored to the rack in front of you at knee height; lean back into it so the shins stay vertical, sit to a half squat, hold dead still.", id: "c_spanish", k: "wr", sets: 3, reps: 30 }],
      why: "The patellar tendon, which takes every depth jump and box landing in this camp. It burns above the kneecap; it never hurts inside the knee." },
    { L: "J", n: "Achilles Hold", m: 2,
      timer: () => ({ kind: "hold", opt: { sets: 1, secs: 45, label: "ACHILLES HOLD — STANDING, STRAIGHT KNEE" }, title: "ACHILLES HOLD" }),
      rxLine: () => "one 45-second standing hold",
      items: [{ n: "Achilles hold — STANDING", s: "one × 45 seconds", cue: "As Tuesday's calf block, hold only: on the edge of a step, as heavy as you can hold dead still, rise to the top and hold, knees straight.", id: "c_achilles_thu", k: "chk" }],
      why: "Twice a week, because the contacts are up." },
    { L: "N", n: "The Nasal Threshold Test", m: 8, star: 1, hide: (rx) => !rx.nasal,
      timer: () => ({ kind: "nasal", title: "NASAL THRESHOLD" }), rxLine: () => "8 minutes, nose only, pace up every two minutes",
      items: [{ n: "Minutes in when the mouth opened", s: "write it down", id: "c_nasal_min", k: "out", u: "minutes" },
        { n: "The pace it opened at", s: "write it down", id: "c_nasal_pace", k: "out", u: "pace" },
        { n: "The honest half", s: "did it open because it had to, or because you caved?", id: "c_nasal_honest", k: "out", u: "had to / caved" }],
      w: "Then run the session below one round short.",
      why: "Weeks 1 and 5. Eight minutes nose only, pace up every two minutes until the mouth has to open; log the pace and the honest half — did it open because it had to, or because you caved?", tr: 2 },
    { L: "E", n: (rx) => (CENG[rx.eng2] ? CENG[rx.eng2].n : "Engine 2"), m: (rx) => (rx.eng2 === "easy" ? 20 : 28), star: 1, hard: 1, eng: 1, engKey: "eng2",
      hide: (rx) => !rx.eng2, timer: (rx) => cengTimer(rx.eng2, !!rx.nasal),
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
      rxLine: () => "holds · rapid tense 4 × 6 · perturbation",
      items: [{ n: "The neck block", s: "holds 3 × 10 s · rapid tense 4 × 6 per direction · perturbation 2 × 20 s", id: "c_neck_thu", k: "chk" }] },
    { L: "H", n: "Hands", m: 4, p: "C_HANDS",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 20, rest: 30, label: "KNUCKLE HOLD" }, title: "HANDS" }),
      items: [{ n: "Knuckle hold + band wrist extension", s: "3 × 20 s · 2 × 15", id: "c_hands_thu", k: "wr", sets: 3, reps: 20 }] }] },

  /* ---------------- FRIDAY · SLEEP ---------------- */
  fri: { n: "FRIDAY", t: "SLEEP. No alarm. RANGE at home in the evening.", m: 0, ac: C.moss, sleep: 1,
    intro: "No alarm. Tomorrow is the long session and Sunday is the rounds, and the best thing you can do for both is not get up at half three.",
    sleepWhy: "The base a Friday morning would have built is worth less than the hour of sleep it costs the night before the two biggest days of the week. Work, RANGE and the sit in the evening, nothing hard, nothing fast, nothing heavy.",
    safeguard: "Sleep is the first session of every day. In bed by half past eight, Sunday to Wednesday, and Friday off the alarm.",
    sleepFood: "Friday's 5pm carb feed loads Saturday; it doesn't move.",
    b: [] },

  /* ---------------- SATURDAY · THE LONG SESSION ---------------- */
  sat: { n: "SATURDAY", t: "★ THE LONG SESSION · 8:30 — get-ups, build-ups, stance starts, sprints, reactive jumps, side bounds, the squat in its phase, push press, the four throws", m: (rx) => (rx.spr && rx.spr.micro ? 25 : 95), ac: C.oxide, free: 1,
    intro: "Fed and rested, no shift after it, Friday's sleep in front of it. Speed first, then reactive power, then the squat in its phase, then the push press, then the throws. Fuel it: porridge two hours before, half the bottle and a banana twenty minutes before.",
    b: [
    { L: "A", n: "Warm-up — get-ups first", m: 16, p: "C_SATWU", rxLine: () => "16 min · get-ups 2/side, hips, build-ups",
      items: [{ n: "Turkish get-up", s: "2 per side, light", cue: GETUP, id: "c_getup_sat", k: "chk" }],
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
      hide: (rx) => !rx.spr || !!rx.spr.micro, rxLine: () => "3 × 10 m from your stance",
      items: [{ n: "Stance start 10 m", s: "3 × 10 m", cue: "From your boxing stance, three ten-metre sprints, the first step explosive off the rear foot, 90 seconds between.", id: "c_stance", k: "chk" }],
      why: "Against a taller man the fight is decided in the first two metres, every time he moves; this is that, trained." },
    { L: "B", n: "Flying Sprints", m: 14, star: 1, hard: 1, rest: "Rest 2:30–3:00 — full recovery", rt: 165,
      hide: (rx) => !rx.spr || !!rx.spr.micro,
      rxLine: (rx) => rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : " · flat out"),
      items: (rx) => [{ n: "Flying sprint 20 m", s: rx.spr.n + " × 20 m" + (rx.spr.pct < 100 ? " @ 90%" : ""), cue: "Jog-build for 10–15 metres, then 20 metres absolutely flat out. Walk back, full rest — speed, not cardio. Curved treadmill, outdoors, or a treadmill on an 8–12% incline at 12–15 km/h for 8–10 seconds with the safety clip on.", id: "c_sprint", k: "out", u: "best time (s)" }],
      w: "Yellow day: 3 runs at 90%.",
      why: "Sprinting flat-out is the most explosive thing a body can do, and regular top-speed running is the best-proven protection a hamstring can get.", tr: 2 },
    { L: "C", n: (rx) => (rx.jump === "AEL" ? "Loaded Drop Jumps" : "Depth Jumps"), m: 8, hard: 1, rest: "Rest 2:00", rt: 120,
      hide: (rx) => !!rx.tp,
      rxLine: (rx) => rx.js[0] + " × " + rx.js[1] + (rx.jump === "AEL" ? " · hex DBs 8–12 kg" : " · 30–40 cm box"),
      items: (rx) => [{ n: rx.jump === "AEL" ? "Loaded drop jump" : "Depth jump", s: rx.js[0] + " × " + rx.js[1],
        cue: rx.jump === "AEL" ? "A hex dumbbell in each hand, 8–12 kg, dip fast into a quarter squat, let both dumbbells go at the bottom and jump straight up as high as you can, empty-handed; land soft on clear floor."
          : "Step off a 30–40 cm box and, the instant the feet touch, jump as high as you can, shortest possible time on the floor.", id: "c_jumpsat", k: "out", u: "height / quality" }],
      w: "Stop the set the moment a jump is lower than the last.",
      why: "Weeks 1–5 loaded drop jumps; weeks 6–8 depth jumps — the fastest way to convert strength into power that exists.", tr: 2 },
    { L: "D", n: "Side Bounds", m: 6, rest: "Rest 90 s", rt: 90, hide: (rx) => !!rx.tp,
      rxLine: (rx) => rx.bsets + " × 4 per side",
      items: (rx) => [{ n: rx.bound === "stick" ? "Side bound — stick the landing" : "Side bound — continuous", s: rx.bsets + " × 4 per side",
        cue: rx.bound === "stick" ? "Stand on one leg, jump sideways as far as you can, land on the other and stick it dead still for 2 seconds." : "Weeks 6–8: no stick — bounce straight back the other way.", id: "c_bound", k: "chk" }],
      why: "The sideways push-off that cuts a ring off." },
    { L: "E", n: "Back Squat", m: 16, star: 1, hard: 1, mainLift: "cw_squat", work: "cw_squat", hide: (rx) => !rx.sq,
      pres: (rx) => ({ sc: rx.sq.sc, pct: rx.sq.pct }),
      rest: "Rest 3:00 · PINS SET", rt: 180,
      ramp: { n: "Squat warm-up sets — here, not at the start of the session", pcts: [[40, 3], [60, 2], [75, 1]],
        why: "Forty minutes of sprinting and jumping keeps you warm; it doesn't keep the squat pattern rehearsed." },
      timer: (rx) => (rx.sq.phase === "contrast"
        ? { kind: "contrast", opt: { rounds: rx.cr || 3, rest: 180, items: ["BACK SQUAT — 2 @ " + rx.cpct + "%, FAST", "BOX JUMP ×3", "TRAP BAR JUMP ×3", "BAND-ASSISTED JUMP ×3"] }, title: "THE JUMP CIRCUIT" }
        : rx.sq.phase === "cluster" ? clusterTimer(rx.sq.sets, rx.sq.pct + "%", "BACK SQUAT") : null),
      items: (rx) => [{ n: "Back squat", s: rx.sq.sc, cue: PHASE_CUE[rx.sq.phase], id: "c_squat", k: "wr", mk: "cw_squat", pct: rx.sq.pct, sets: rx.sq.sets, reps: rx.sq.reps }]
        .concat(rx.sq.phase === "contrast" ? [
          { n: "Box jump", s: "×3 · rest 20 s", cue: "Twenty seconds after the squat. Heavy wakes the system up; fast uses it.", id: "c_cbox", k: "chk" },
          { n: "Trap bar jump", s: "×3 · rest 20 s", cue: "A trap bar loaded to 20% of its working weight, jump with it, land soft.", id: "c_ctbj", k: "wr", mk: "cw_tbdl", pct: 20, sets: rx.cr || 3, reps: 3 },
          { n: "Band-assisted jump", s: "×3 · then 3 minutes' rest", cue: "A heavy band looped over the top of the rack and tucked under the armpits so it pulls you upward — it makes you faster than you are.", id: "c_cassist", k: "chk" }] : []),
      rxLine: (rx) => rx.sq.sc + (rx.sq.phase === "contrast" ? " · " + (rx.cr || 3) + " rounds" : ""),
      w: (rx) => (rx.sq.phase === "contrast" ? "Pins set just below your lowest position, every set — you're alone. The round ends the moment jump height drops." : "Pins set just below your lowest position, every set — you're alone."),
      why: (rx) => PHASE_WHY[rx.sq.phase] + " Lower-body maximal strength is the best predictor there is of how hard trained boxers hit.",
      note: (rx) => (rx.reset ? "Reset week: a set of 3, hard with two in you, before the working sets. That triple is the new working weight." : ""), tr: 2 },
    { L: "F", n: "Push Press", m: 8, hard: 1, mainLift: "cw_pp", work: "cw_pp", hide: (rx) => !rx.pp, rest: "Rest 2:00", rt: 120,
      pres: (rx) => ({ sc: rx.pp.sc + " @ " + rx.pp.pct + "%", pct: rx.pp.pct }),
      rxLine: (rx) => rx.pp.sc + " @ " + rx.pp.pct + "%",
      items: (rx) => [{ n: "Push press", s: rx.pp.sc, cue: "Bar on the front of the shoulders, quick shallow knee dip, drive it overhead with the legs and punch it to lockout.", id: "c_pushpress", k: "wr", mk: "cw_pp", pct: rx.pp.pct, sets: rx.pp.sets, reps: rx.pp.reps }],
      w: "Loaded like the other lifts: fast, two in reserve.",
      why: "Legs, braced trunk, hands — the route a punch takes." },
    { L: "G", n: "The Four Punch Throws", m: 12, star: 1, p: "C_VEC", hide: (rx) => !!rx.spr && !!rx.spr.micro,
      rest: "45 s between exercises · 90 s between rounds", rt: 45,
      timer: (rx) => ({ kind: "vec", opt: { rounds: rx.vec }, title: "PUNCH THROWS" }),
      rxLine: (rx) => rx.vec + " rounds",
      items: (rx) => [{ n: "Rotational shot-put", s: "4 per side @ " + shotBall(rx), cue: "A " + shotBall(rx) + " ball at the shoulder, stance side-on to the wall, drive off the back hip, flat and hard.", id: "c_mbshot", k: "out", u: "best distance (m)" },
        { n: "Downward diagonal throw", s: "4 per side", cue: "Ball high outside the shoulder, driven down and across toward the opposite hip, back foot pivoting.", id: "c_mbdiag", k: "out", u: "best distance (m)" },
        { n: "Hook throw", s: "4 per side", cue: "Ball at chest height in bent arms, pivot hard off the lead leg and sling it sideways into the wall.", id: "c_mbhook", k: "chk" },
        { n: "Landmine punch", s: "5 per side", cue: "In your stance, step in off the rear foot, drive the hips and punch it up and away, never a slow press.", id: "c_lmpunch", k: "wr", sets: 2, reps: "5/side" }],
      w: OUTPUT_RULE,
      why: "Straights are forward drive, hooks are rotation; all four get trained. Medicine ball — 5–6 kg for the shot-put through week 5, 3–5 kg after; if it isn't flying, it's too heavy." }] },

  /* ---------------- SUNDAY · THE ROUNDS ---------------- */
  sun: { n: "SUNDAY", t: "★ THE ROUNDS · 8:30 — get-ups, throws, the simulation, the post-max sit, core with the L-sit and lever, hands, weekly check", m: 80, ac: C.brass, free: 1,
    intro: "The session the camp is for. Fed and rested — porridge two hours before, half the bottle and a banana twenty minutes before, electrolytes in the bottle. Throws first, fresh; then the rounds; then the corner, trained; then the core.",
    b: [
    { L: "A", n: "Warm-up — get-ups first", m: 14, p: "C_SUNWU", rxLine: () => "14 min · get-ups 2/side, Tuesday's warm-up, the power prep and the practice throws",
      items: [{ n: "Turkish get-up", s: "2 per side, light", cue: GETUP, id: "c_getup_sun", k: "chk" }] },
    { L: "B", n: "The Four Punch Throws", m: 12, star: 1, p: "C_VEC", hide: (rx) => !!(rx.sim && rx.sim.rehearsal),
      rest: "45 s between exercises · 90 s between rounds", rt: 45,
      timer: (rx) => ({ kind: "vec", opt: { rounds: rx.vec }, title: "PUNCH THROWS" }),
      rxLine: (rx) => rx.vec + " rounds — as Saturday",
      items: (rx) => [{ n: "The four throws", s: "2 rounds · shot-put ball " + shotBall(rx), cue: "Rotational shot-put 4/side with a " + shotBall(rx) + " ball, downward diagonal 4/side, hook throw 4/side, landmine punch 5/side.", id: "c_sunthrows", k: "chk" }],
      w: OUTPUT_RULE },
    { L: "C", n: (rx) => (rx.sim && rx.sim.rehearsal ? "THE FIGHT-DAY REHEARSAL" : "The " + (rx.sim ? rx.sim.rounds : 6) + " × 3 Simulation"), m: (rx) => (rx.sim && rx.sim.rounds > 6 ? 28 + (rx.sim.rounds - 6) * 4 : 28), star: 1, sim: 1, hard: 1, hide: (rx) => !rx.sim,
      timer: (rx) => ({ kind: "csim", opt: { rounds: rx.sim.rounds, rest: rx.sim.rest, pace: !!rx.sim.rehearsal }, title: rx.sim.rehearsal ? "THE REHEARSAL" : "THE ROUNDS" }),
      rxLine: (rx) => rx.sim.rounds + " × 3 min · rest " + rx.sim.rest + " s" + (rx.sim.scored ? " · SCORED" : rx.sim.rehearsal ? " · at fight pace, at fight time" : ""),
      items: (rx) => (rx.sim.rehearsal
        ? [{ n: "Minute 1–3", s: "at fight pace on the erg or the bag", k: "txt" },
          { n: "Round 1 output", s: "write it down", id: "c_fs_rd1", k: "out", u: "SkiErg m / bike cal" },
          { n: "Last round output", s: "write it down", id: "c_fs_rd6", k: "out", u: "SkiErg m / bike cal" }]
        : [{ n: "Minute 1", s: "SkiErg", k: "txt" }, { n: "Minute 2", s: "Assault bike", k: "txt" },
          { n: "Minute 3", s: "Med-ball slams — a 5–8 kg ball overhead and driven into the floor, caught on the bounce, hard and continuous — or bag work, hard and technically clean.", k: "txt" },
          { n: "Round 1 output", s: (rx.sim.scored ? "SCORED WEEK — write it down" : "write it down"), id: "c_fs_rd1", k: "out", u: "SkiErg m / bike cal" },
          { n: "Last round output", s: "round six divided by round one is the fade", id: "c_fs_rd6", k: "out", u: "SkiErg m / bike cal" }]),
      rules: [
        "Relaxed jaw, shoulders down. Finish a round with your traps by your ears and it doesn't count.",
        CORNER_MINUTE,
        "On scored weeks write down round one's output and round six's. Round six divided by round one is the fade. " + SCORED_WEEKS_LINE,
      ],
      recovery: 1,
      why: (rx) => (rx.sim.rehearsal
        ? "Get up at the time you'll get up on fight day. Eat what you'll eat, when you'll eat it. Do the warm-up you'll do. Then, at the hour the fight is on, six rounds of three minutes at fight pace on the erg or the bag, 60 seconds between, the corner minute every rest, the post-max sit after. Not a test — a rehearsal. Everything that goes wrong today, you fix before the day it matters."
        : "Six rounds of three minutes at 60 seconds' rest from week 1; eight in weeks 6 and 7 — two past the fight; ten, once, in week 8, the last hard week. A ceiling you've stood on before the bell. Scored, and the fade decides whether it was worth it."),
      tr: 2 },
    { L: "D", n: "The Post-Max Sit", m: 3, hide: (rx) => !rx.sim,
      timer: () => ({ kind: "postmax", title: "POST-MAX SIT" }), rxLine: () => "3 min — straight off the last round",
      items: [{ n: "Seconds to settle onto the breath", s: "write it down", cue: "Straight off the last round: sit, eyes closed, heart at 170-plus, find the breath at the nostrils. Write down the seconds it took.", id: "c_postmax", k: "out", u: "seconds" }],
      why: "The corner, trained. The settle after intervals and this sit after the rounds are where the sit is tested." },
    { L: "E", n: "Core, L-Sit, Lever, Hands", m: 12, cal: "lsit", rest: "Rest 60 s", rt: 60, hide: (rx) => !!(rx.sim && rx.sim.rehearsal),
      items: [{ n: "Hanging leg raise", s: "3 × 8–12", cue: "Hang from a bar, lift the legs to hip height or above, no swinging.", id: "c_hlr", k: "wr", sets: 3, reps: "8–12" },
        { n: "The L-sit line — at your level", s: "3 sets", cue: "The tuck L-sit between two boxes to start; the line climbs one leg at a time to the full L-sit.", id: "lsit", k: "wr", sets: 3, reps: "at your level" },
        { n: "Side plank reach-through", s: "2 × 10 per side", id: "c_sprt", k: "chk" },
        { n: "Tuck front lever", s: "3 holds", cue: "Hang from the bar, pull the shoulder blades down, knees to the chest, body horizontal, face up; ten seconds to start. The three elbow laws apply: five seconds added per fortnight at most, twelve weeks a level minimum, any ache on the inside of the elbow and the lever rests for two weeks.", id: "lever", k: "wr", sets: 3, reps: "hold" },
        { n: "Hands", s: "knuckle hold 3 × 20 s · band wrist extension 2 × 15", cue: "On your fists on a mat, the wrist dead straight; then forearm on the knee, palm down, lifting the knuckles toward you.", id: "c_hands_sun", k: "wr", sets: 3, reps: 20 }] },
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
  sat: { n: "SATURDAY", t: "★ FIGHT", m: 0, ac: C.oxide, free: 1, fight: 1,
    intro: "The warm-up you rehearsed. The corner minute in every rest. Round six is a place you've already been.",
    b: [
    { L: "A", n: "The fight", m: 0, star: 1,
      timer: () => ({ kind: "csim", opt: { rounds: 6, rest: 60, pace: 1 }, title: "THE FIGHT" }),
      rxLine: () => "6 × 3 · the corner minute in every rest",
      items: [{ n: "The warm-up you rehearsed", s: "as rehearsed", id: "c12_fwu", k: "chk" },
        { n: "The corner minute", s: "every rest", cue: CORNER_MINUTE, id: "c12_corner", k: "chk" },
        { n: "How it went", s: "write it down tonight", id: "c12_result", k: "out", u: "rounds / result" }],
      why: "Everything you'll have tonight, you had by the Sunday of week 8. Week 9 sharpened it; fight week protected it." }] },
};

/* the sessions for a camp day, or null when the day is a card of its own */
export const campSess = (day, rx) => {
  if (rx.fightWeek) return CSFW[day] || null;
  return CS[day];
};

/* what the card says on the days that have no session page */
export const campBlank = (day, rx) => {
  if (rx.fightWeek && day === "wed") return { h: "NOTHING TODAY", c: C.moss,
    l: ["Nothing. RANGE at half dose, the sit.", "You cannot get fitter this week. You can only get fresher or more tired."] };
  if (rx.fightWeek && day === "fri") return { h: "THE WEIGH-IN", c: C.brass,
    l: ["Weigh-in if there is one. Nothing else.", "Feet up. The rehearsal's meals. Bed early."] };
  if (rx.fightWeek) return { h: "AFTER THE FIGHT", c: C.moss,
    l: ["The two-week transition: three or four days of nothing but RANGE, the sit and walking, then two easy weeks.",
      "Prep restarts when the strap says the numbers are back to baseline."] };
  return { h: "NOTHING WRITTEN TODAY", c: C.moss,
    l: ["No session on this page.",
      "Tonight: RANGE, the skill block, the sit — they don't stop."] };
};
