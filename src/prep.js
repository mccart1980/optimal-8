import { C } from "./ui.jsx";

/* ================================================================
   OPTIMAL 8 · PREP — as data

   Three blocks with one job each: ACCUMULATE (volume, base, tissue,
   size, movement), INTENSIFY (heavy, paused then fast, the max
   single), CONVERT (contrast, reactive jumps, top speed, rounds at
   fight rest), then the test week. Every prescription below is read
   off the document's fourteen-week calendar by its row number, so a
   truncated PREP and the sixteen-week form both load the same rows.
   ================================================================ */

export const PREP_INTRO =
  "The block between the program and the camp. Its only job: hand the camp a body already at the camp's week-3 level on the camp's first day — stronger, more explosive, aerobically deeper, and moving better than it has in years.";

/* ---------- the phases the two big lifts move through ---------- */
export const PREP_PHASE_NAME = {
  slow: "SLOW LOWERING · 5 s down",
  normal: "NORMAL TEMPO",
  paused: "PAUSED · 3 s hold",
  fast: "FAST",
  max: "MAX SINGLE · pins set",
  easy: "EASY · fast",
  contrast: "CONTRAST + the jump circuit",
  test: "TEST WEEK",
};
export const PREP_PHASE_CUE = {
  slow: "Lower the bar to the floor over a full five seconds, touch, and drive up fast. Count it: five seconds down, every rep.",
  normal: "Down under control, up fast. The volume is at its highest here.",
  paused: "Lower normally, stop dead an inch off the floor for three seconds, then drive. Count the three seconds.",
  fast: "No pause: down under control, up as fast as the bar will move. The set ends the moment the bar slows.",
  max: "After the warm-up ramp, one attempt at 100–102% of the working max, a second only after the first flew. Pins set, no exceptions.",
  easy: "Two sets of three at 65%, fast. Nothing heavy, nothing near failure.",
  contrast: "The sets at the calendar's percentage, fast, then straight into the jump circuit. Heavy wakes the system up; fast uses it.",
  test: "Two doubles at 80%. The heavy triple is test day.",
};
export const PREP_PHASE_WHY = {
  slow: "Builds tissue and the tendon stiffness sprinting needs; sore in week 1, then not.",
  normal: "The volume block at its peak, with the food to match.",
  paused: "The position force starts from, owned.",
  fast: "The nervous system taught to fire.",
  max: "One of two maximal exposures in the whole preparation, each after a ramp, each followed by a reset of every working weight.",
  easy: "The week the adaptation lands. Nothing is added.",
  contrast: "Where strength becomes speed.",
  test: "Light, so test day reads the truth.",
};

/* ---------- the engine sessions ---------- */
export const PENG = {
  mod: { n: "MODERATE INTERVALS", d: "4 × 3 minutes at a pace where you could speak short sentences, 3 easy between",
    tgt: "The average output across the four. This one measures the engine before it is pushed." },
  vo2: { n: "4-MINUTE INTERVALS", d: "4 × 4 minutes HARD — breathing heavily, two or three words at most — 3 easy between",
    tgt: "The average output across the four: beat last time by 1–2%, never by more." },
  lac: { n: "40-SECOND REPEATS", d: "40 seconds absolutely flat out, 80 seconds easy. Six",
    tgt: "The last repeat against the first — the decrement. It should shrink." },
  lac2: { n: "40-SECOND REPEATS · TWO BLOCKS", d: "Six, then 5 full minutes easy, then six more",
    tgt: "The last repeat against the first — the decrement. It should shrink." },
  rz: { n: "REPEAT BURSTS", d: "8 bursts of 6–8 seconds at absolute maximum, 40 seconds easy between; 5 full minutes; 8 more",
    tgt: "The sixteenth burst against the first. It should shrink.",
    rule: "A burst visibly weaker than the last buys an extra 20 seconds; two in a row and the set is over." },
  rz1: { n: "REPEAT BURSTS · ONE SET", d: "1 set × 8 bursts of 6–8 seconds at absolute maximum, 40 seconds easy between",
    tgt: "The eighth burst against the first.",
    rule: "A burst visibly weaker than the last buys an extra 20 seconds; two in a row and the set is over." },
  tempo: { n: "TEMPO INTERVALS", d: "10 × 1 minute hard but controlled, about 70% of flat out, 1 minute easy between",
    tgt: "The average output across the ten. Aerobic power without the cost." },
  thr: { n: "THRESHOLD", d: "2 × 8 minutes at the hardest pace you could hold for half an hour, 3 easy minutes between",
    tgt: "The output held across the two eights." },
  ergrounds: { n: "ROUNDS ON THE ERG", d: "6 × 3 minutes at fight pace, 60 seconds between",
    tgt: "Round one and round six. Round six over round one is the fade." },
  fightpace: { n: "FIGHT-PACE ROUNDS", d: "4 × 3 minutes at the pace held in week 13, 60 seconds between, and stop",
    tgt: "Sharp, not tired. The pace from week 13, held." },
  easy: { n: "EASY", d: "20 minutes conversational", tgt: "Nothing else." },
};
export const PENG_MENU = ["mod", "vo2", "lac", "rz", "tempo", "thr", "ergrounds", "easy"];

/* ---------- the calendar, row by row ---------- */
/* ph: the lift phase · sc: the line the week is loaded from · base: Monday's
   minutes · e1/e2: Tuesday's and Thursday's engine · rest: the rounds' rest ·
   sled/nor/spr: the three counts the calendar carries. */
const R = {};
const wk = (d, o) => { R[d] = Object.assign({ d, sled: 5, nor: [3, 5], spr: 5, sets: 4, reps: 3, pct: 80, rest: 60,
  sim: 6, split: 3, jump: "drop", js: [3, 4], bound: "stick", pp: { sets: 3, reps: 3, pct: 75 } }, o); };

wk(1, { ph: "slow", sc: "3 × 5 @ 70%", sets: 3, reps: 5, pct: 70, base: 45, e1: "mod", e2: "tempo", rest: 90, sim: 0, t20: 1,
  sled: 4, nor: [3, 4], spr: 0, size: 1, move: 1, carb: 1, profile: 1, nasal: 1, burstTest: 1,
  em: "Baselines and the load-velocity profiles. Slow lowering 3 × 5 @ 70%. Base 45. Tue 4 × 3 moderate · Thu tempo · Sun 20-minute test." });
wk(2, { ph: "slow", sc: "4 × 5 @ 72%", sets: 4, reps: 5, pct: 72, base: 50, e1: "vo2", e2: "lac", rest: 90, scored: 1,
  sled: 4, spr: 4, size: 1, move: 1, carb: 1,
  em: "Slow lowering 4 × 5 @ 72%. Base 50. Tue 4 × 4 · Thu 40-s repeats × 6 · Sun 6 × 3 scored, 90 s — baseline fade." });
wk(3, { ph: "slow", sc: "4 × 6 @ 72%", sets: 4, reps: 6, pct: 72, base: 55, e1: "rz", e2: "thr", rest: 90,
  sled: 4, spr: 5, size: 1, move: 1, carb: 1,
  em: "Slow lowering 4 × 6 @ 72%. Base 55. Tue bursts · Thu threshold · Sun 6 × 3, 90 s." });
wk(4, { ph: "normal", sc: "5 × 5 @ 75%", sets: 5, reps: 5, pct: 75, base: 60, e1: "vo2", e2: "lac2", rest: 90,
  sled: 4, spr: 5, size: 1, move: 1, carb: 1,
  em: "Normal tempo 5 × 5 @ 75%. Base 60. Tue 4 × 4 · Thu 40-s repeats 2 × 6 · Sun 6 × 3, 90 s." });
wk(5, { ph: "normal", sc: "3 × 5 @ 70%", sets: 3, reps: 5, pct: 70, base: 45, e1: "easy", e2: "easy", rest: 90, sim: 0, t20: 1,
  sled: 4, nor: [2, 3], spr: 0, sprEasy: 1, size: 1, move: 1, carb: 1, light: 1, half: 1, split: 2,
  nasal: 1, burstTest: 1, tests: 1, tape: 1, photos: 1, bolt: 1,
  em: "Lighter. 3 × 5 @ 70%. Base 45. Tue retests then easy · Thu nasal test then easy · Sun 20-minute test · range and flexibility tests · tape · photos." });
wk(6, { ph: "paused", sc: "4 × 4 @ 80%", sets: 4, reps: 4, pct: 80, base: 45, e1: "vo2", e2: "rz", rest: 60, sauna: 1,
  em: "Paused 4 × 4 @ 80%. Base 45. Tue 4 × 4 · Thu bursts · Sun 6 × 3, 60 s. Sauna starts." });
wk(7, { ph: "paused", sc: "4 × 3 @ 84%", sets: 4, reps: 3, pct: 84, base: 45, e1: "rz", e2: "thr", rest: 60, sauna: 1,
  em: "Paused 4 × 3 @ 84%. Tue bursts · Thu threshold · Sun 6 × 3, 60 s." });
wk(8, { ph: "fast", sc: "4 × 3 @ 87%", sets: 4, reps: 3, pct: 87, base: 45, e1: "vo2", e2: "lac2", rest: 60, sauna: 1,
  em: "Fast 4 × 3 @ 87%. Tue 4 × 4 · Thu 40-s repeats 2 × 6 · Sun 6 × 3, 60 s." });
wk(9, { ph: "max", sc: "MAX SINGLE → 2 × 2 @ 88%", sets: 2, reps: 2, pct: 88, base: 45, e1: "rz", e2: "rz", rest: 60,
  sauna: 1, maxWeek: 1, noPP: 1,
  em: "MAX SINGLE. Wed trap bar max, Sat squat max, Sun bench max first thing; then 2 × 2 @ 88%. Push press skipped. Tue bursts · Thu bursts · Sun 6 × 3, 60 s." });
wk(10, { ph: "easy", sc: "2 × 3 @ 65% — fast", sets: 2, reps: 3, pct: 65, base: 45, e1: "easy", e2: "easy", rest: 60, scored: 1,
  sled: 3, nor: [2, 3], spr: 0, sprEasy: 1, light: 1, half: 1, split: 2, sauna: 1,
  profile: 1, reset: 1, nasal: 1, burstTest: 1, tests: 1, tape: 1, photos: 1, bolt: 1,
  em: "EASY + TESTS. 2 × 3 @ 65% fast; working weights reset; profiles redrawn. Tue retests then easy · Thu nasal test then easy · Sun 6 × 3 scored · range and flexibility tests · tape · photos." });
wk(11, { ph: "contrast", sc: "2 × 2 @ 85% + the circuit", sets: 2, reps: 2, pct: 85, base: 45, e1: "rz", e2: "lac2", rest: 60,
  jump: "depth", js: [4, 5], bound: "cont", cr: 3, sauna: 1, pp: { sets: 3, reps: 3, pct: 85 },
  em: "Contrast 2 × 2 @ 85% + the circuit; depth jumps begin. Tue bursts · Thu 40-s repeats 2 × 6 · Sun 6 × 3, 60 s." });
wk(12, { ph: "contrast", sc: "2 × 2 @ 87% + the circuit", sets: 2, reps: 2, pct: 87, base: 45, e1: "vo2", e2: "ergrounds", rest: 60,
  jump: "depth", js: [4, 5], bound: "cont", cr: 3, sauna: 1, pp: { sets: 3, reps: 3, pct: 85 },
  em: "Contrast 2 × 2 @ 87% + circuit. Tue 4 × 4 · Thu rounds on the erg 6 × 3 · Sun 6 × 3, 60 s." });
wk(13, { ph: "contrast", sc: "2 × 2 @ 88% + the circuit", sets: 2, reps: 2, pct: 88, base: 45, e1: "rz1", e2: "lac", rest: 60,
  jump: "depth", js: [4, 5], bound: "cont", cr: 2, sauna: 1, scored: 1, xmas: 1, pp: { sets: 3, reps: 3, pct: 85 },
  em: "Christmas week, volume down 25%. Contrast 2 × 2 @ 88% + circuit, 2 rounds. Tue bursts 1 × 8 · Thu 40-s repeats × 6 · Sun 6 × 3 scored — the last read." });
wk(14, { ph: "test", sc: "2 × 2 @ 80%", sets: 2, reps: 2, pct: 80, base: 45, e1: "easy", e2: "fightpace", rest: 60, sim: 0, t20: 1,
  sled: 3, nor: [2, 3], spr: 0, sprEasy: 1, light: 1, half: 1, split: 2, testWeek: 1,
  nasal: 1, burstTest: 1, tests: 1, tape: 1, photos: 1, pp: { sets: 3, reps: 3, pct: 70 },
  em: "TEST WEEK. Light. Tue burst decrement then easy · Wed 2 × 2 @ 80% · Thu nasal test then 4 × 3 at fight pace · Sat TEST DAY · Sun the 20-minute test, range and flexibility tests, tape, photos." });

export const PREP_ROWS = R;
export const prepRx = (doc) => R[doc] || R[1];
export const prepEmphasis = (doc) => (R[doc] || R[1]).em;

/* the tests each row carries, as one line */
export function prepTests(doc) {
  const rx = prepRx(doc), out = [];
  if (rx.profile) out.push("the load-velocity profiles");
  if (rx.burstTest) out.push("the burst decrement");
  if (rx.nasal) out.push("the nasal threshold");
  if (rx.t20) out.push("the 20-minute test");
  if (rx.scored) out.push("the rounds, scored");
  if (rx.tests) out.push("the four range tests and the three flexibility tests");
  if (rx.tape) out.push("tape");
  if (rx.photos) out.push("photos");
  if (rx.bolt) out.push("BOLT");
  if (rx.testWeek) out.push("TEST DAY on Saturday");
  return out;
}

/* ---------- the three flexibility tests ---------- */
export const FLEX_TESTS = [
  { id: "f1", n: "Knee to wall", c: C.oxide, u: "cm", tgt: "12 cm by week 10",
    how: "One foot flat, toes at a mark, knee driven forward to touch the wall without the heel lifting; move the foot back in centimetres until it cannot." },
  { id: "f2", n: "Toe touch", c: C.brass, u: "cm", tgt: "palms flat by week 10",
    how: "Stand, knees straight, fold and reach; measure the gap to the floor, or the distance past the toes." },
  { id: "f3", n: "Seated rotation", c: C.cobalt, u: "degrees", tgt: "60° each way by week 10",
    how: "Sit on the floor, legs straight, stick across the shoulders, rotate the trunk as far as it goes each way; film it from above and read the angle." },
];

/* ---------- the movement session ---------- */
export const MOVE_INTRO = "The second dose. RANGE finds the range with long holds and end-range strength; this moves the whole body through it under control, slowly, so the range becomes range you can use.";
export const MOVE_STEPS = [
  { k: "out", l: "BREATHE DOWN — ON YOUR BACK, FEET ON A CHAIR · FIVE BREATHS, IN 4, OUT 8", s: 120 },
  { k: "seg", l: "SHOULDER CIRCLES, LOADED — A 4–8 KG BELL IN THE HAND, ARM STRAIGHT, TRUNK STILL · THREE EACH WAY EACH SIDE", s: 120 },
  { k: "seg", l: "HIP CIRCLES ON ONE LEG — KNEE UP, OUT, ROUND AND DOWN · THREE EACH WAY EACH SIDE", s: 120 },
  { k: "seg", l: "CAT-CAMEL × 10, THEN HAND BEHIND HEAD, ELBOW TO THE CEILING × 8 PER SIDE", s: 120 },
  { k: "seg", l: "THE GET-UP, SLOW — TWO PER SIDE, A LIGHT BELL, EVERY POSITION HELD FIVE SECONDS", s: 360 },
  { k: "seg", l: "DEEP SQUAT HOLD — HEELS DOWN, ELBOWS PRYING THE KNEES OUT", s: 60 },
  { k: "seg", l: "SQUAT-TO-STAND × 6 — HOLD THE TOES, SINK CHEST UP, STRAIGHTEN, SINK AGAIN", s: 60 },
  { k: "seg", l: "COSSACK SQUATS × 6 PER SIDE — 3-SECOND PAUSE AT THE BOTTOM", s: 90 },
  { k: "seg", l: "OVERHEAD SQUAT HOLD WITH THE STICK · 3 × 20 SECONDS — ARMS STRAIGHT, STICK BEHIND THE EARS", s: 150 },
  { k: "seg", l: "90/90 SWITCHES × 5 EACH WAY, NO HANDS", s: 60 },
  { k: "seg", l: "THE INTERNAL-ROTATION LIFT × 8 PER SIDE, 3-SECOND HOLDS", s: 60 },
  { k: "seg", l: "PIGEON · 60 SECONDS PER SIDE — CHEST FOLDING OVER THE SHIN, BREATHING OUT", s: 120 },
  { k: "seg", l: "HIP AIRPLANES × 5 PER SIDE, ACTIVE", s: 60 },
  { k: "seg", l: "HANG FROM THE BAR", s: 45 },
  { k: "seg", l: "KETTLEBELL ARM BAR · 30 SECONDS PER SIDE", s: 60 },
  { k: "seg", l: "BAND PULL-APARTS × 20, THEN EXTERNAL ROTATIONS × 15 PER ARM", s: 75 },
  { k: "out", l: "STAND TALL, EYES CLOSED — FEEL WHERE THE BODY IS", s: 60 },
];
export const MOVE_ROWS = [
  { id: "mv0", n: "Breathe down", s: "2 min" },
  { id: "mv1", n: "Joint circles, loaded", s: "6 min" },
  { id: "mv2", n: "The get-up, slow", s: "6 min" },
  { id: "mv3", n: "The squat flow", s: "6 min" },
  { id: "mv4", n: "The hip flow", s: "5 min" },
  { id: "mv5", n: "The shoulder flow", s: "4 min" },
  { id: "mv6", n: "Stand", s: "1 min" },
];
export const MOVE_ROW_OF = [0, 1, 1, 1, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6];
/* Wednesday and Saturday evenings in the accumulation block, Saturday after */
export const moveTonight = (rx, day) => (day === "sat" ? true : day === "wed" ? !!rx.move : false);

export const CARB_TOPUP = "Carb top-up at 17:00 — the fuel app has the number. Only in the accumulation block.";
export const SAUNA_PREP = "Fifteen to twenty minutes, Sunday and one weekday evening. Never straight from the sauna into cold.";

/* ---------- the two easy weeks after a fight ---------- */
export const TRANSITION_INTRO = "Two easy weeks. Base rides, the movement session, calisthenics at half sets, nothing above 70%, no sprints, no rounds. The adaptation from the camp lands here, and skipping it is how the next block starts flat.";
export const TRANSITION_RULES = [
  "Nothing above 70% of a working weight, and every set two reps short.",
  "No sprints, no depth jumps, no rounds, no maximal anything.",
  "Calisthenics at half the sets, holds where an elbow or a wrist is complaining.",
  "The base rides stay easy and nasal. RANGE and the sit do not stop.",
];

/* ================================================================
   THE SEVEN PAGES, in running order
   ================================================================ */
const GETUP = "Lie on your back with a kettlebell pressed up in one hand, that knee bent, the other arm and leg out at 45°. Roll onto the elbow, then the hand; lift the hips, sweep the free leg back to kneeling, windmill upright, stand; reverse every step to the floor. The bell never stops pointing at the ceiling.";
const OUTPUT_RULE = "Every explosive set ends the moment the output drops.";
const CORNER = "THE CORNER MINUTE — two sighs the second the round ends, then nose only, in 3 out 6. Stood up, hands off the knees.";

/* the timer a conditioning row runs */
export function prepEngTimer(key) {
  return (rx) => {
    const e = rx[key];
    if (e === "mod") return { kind: "mod", opt: {}, title: "MODERATE INTERVALS" };
    if (e === "vo2") return { kind: "vo2", opt: { short: rx.nasal && key === "e2" ? 1 : 0 }, title: "4-MINUTE INTERVALS" };
    if (e === "lac") return { kind: "lac", opt: { blocks: 1, reps: 6 }, title: "40-SECOND REPEATS" };
    if (e === "lac2") return { kind: "lac", opt: { blocks: 2, reps: 6 }, title: "40-SECOND REPEATS" };
    if (e === "rz") return { kind: "rz", opt: { sets: 2 }, title: "REPEAT BURSTS" };
    if (e === "rz1") return { kind: "rz", opt: { sets: 1 }, title: "REPEAT BURSTS · ONE SET" };
    if (e === "tempo") return { kind: "tempo", opt: { reps: rx.nasal && key === "e2" ? 9 : 10 }, title: "TEMPO INTERVALS" };
    if (e === "thr") return { kind: "thr", opt: {}, title: "THRESHOLD" };
    if (e === "ergrounds") return { kind: "ergrounds", opt: { rounds: 6, rest: 60 }, title: "ROUNDS ON THE ERG" };
    if (e === "fightpace") return { kind: "ergrounds", opt: { rounds: 4, rest: 60 }, title: "FIGHT-PACE ROUNDS" };
    return { kind: "z2", opt: { min: 20, label: "EASY — CONVERSATIONAL" }, title: "EASY" };
  };
}
const engMin = (key) => (rx) => (rx[key] === "easy" ? 20 : rx[key] === "ergrounds" || rx[key] === "lac2" ? 28 : 24);
const engName = (key) => (rx) => (PENG[rx[key]] || PENG.easy).n;

export const PS = {
  /* ---------------- MONDAY ---------------- */
  mon: { n: "MONDAY", t: "Base · neck · hands · ring rows", m: (rx) => rx.base + 22, ac: C.moss, free: 0, box: 1,
    intro: "The low day in a high/low week, and it has to stay low. The base decides how fast you recover between exchanges, and it is the floor that lets Tuesday and Thursday be as hard as they are.", b: [
    { L: "A", n: "Base — easy, nose only", m: (rx) => rx.base, star: 1, eng: 1, engKey: "base",
      timer: (rx) => ({ kind: "z2", opt: { min: rx.base, label: "EASY — NOSE ONLY · 65–75% OF PEAK" }, title: "BASE" }),
      rxLine: (rx) => rx.base + " min at 65–75% of peak",
      items: (rx) => [{ n: "Average heart rate", s: "65–75% of peak, no higher", cue: "Bike or SkiErg in weeks 1–2; from week 3 a run, once the legs and ankles are used to it. Nose the whole way — a sentence you cannot hold means slow down.", id: "c_base", k: "out", u: "bpm" },
        { n: "Output at that heart rate", s: "the number that should climb", cue: "A higher output at the same heart rate is the base getting deeper. That is the whole point of five weeks of it.", id: "p_base_out", k: "out", u: "output" }],
      why: "Roughly three-quarters of a 6 × 3 is aerobic. Boring on purpose, and fine on an empty stomach.", tr: 2 },
    { L: "B", n: "Neck", m: 8, p: "NECK",
      items: [{ n: "The full neck block", s: "holds, rapid tense, perturbation", id: "p_neck_mon", k: "chk" }] },
    { L: "C", n: "Hands", m: 4, p: "HANDS",
      items: [{ n: "Hands", s: "knuckle hold 3 × 20 s · band wrist extension 2 × 15", cue: "On your fists on a mat, the wrist dead straight; then forearm on the knee, palm down, lifting the knuckles toward you.", id: "hands2", k: "wr", sets: 3, reps: 20 }] },
    { L: "D", n: "Ring Rows", m: 5, cal: "ringrow", rest: "Rest 60 s", rt: 60, rxLine: () => "3 sets at your level",
      items: (rx) => [{ n: "Ring rows — at your level", s: (rx.half ? 2 : 3) + " sets", cue: "Rings at hip height, hang beneath them with the body straight and heels on the floor, pull the rings to the chest, pause, lower slow.", id: "ringrow", k: "wr", sets: rx.half ? 2 : 3, reps: "at your level" }],
      why: "Light horizontal pulling on the easy day, keeping the shoulder honest without touching the elbow load Wednesday carries." }] },

  /* ---------------- TUESDAY ---------------- */
  tue: { n: "TUESDAY", t: "Power + Engine 1 — jumps, pistols, the interval session, the settle, trunk, the Achilles hold", m: 60, ac: C.cobalt, box: 1,
    intro: "Fresh legs, so the power dose goes first. Then the week's first hard conditioning session, then the trunk, because the trunk is what turns leg drive into hand speed.", b: [
    { L: "A", n: "Warm-up + bear crawls", m: 8, p: "GEN8", rxLine: () => "8 min · bike, bands, hips, pogos — then bear crawls, 2 min",
      items: [{ n: "Bear crawls · 2 min", s: "10 m forward, 10 m back, × 4", cue: "On hands and feet, knees an inch off the floor, back flat as a table, opposite hand and foot together. Slow beats fast.", id: "crawl", k: "wr", sets: 4, reps: 20 }] },
    { L: "B", n: "Power dose — jumps", m: 8, star: 1, hard: 1, rest: "Rest 90 s", rt: 90,
      rxLine: () => "broad jumps 3 × 2 · box jumps 3 × 3",
      items: [{ n: "Broad jump", s: "3 × 2", cue: "Two-foot jump forward for distance, stick the landing dead still.", id: "p_broad", k: "chk" },
        { n: "Box jump", s: "3 × 3", cue: "The box chosen by the landing: you land on it in a quarter squat. Quick dip, jump as high as you can, land soft, step down.", id: "boxjump", k: "chk" }],
      w: OUTPUT_RULE,
      why: "Explosiveness responds to how often the nervous system is asked, not how much." },
    { L: "C", n: "The Pistol Line", m: 5, cal: "pistol", rest: "Rest 60 s", rt: 60, rxLine: () => "2 × 5 per leg at your level",
      items: (rx) => [{ n: "The pistol line — at your level", s: (rx.half ? 1 : 2) + " × 5 per leg", cue: "Box pistol to start: stand on one leg in front of a box, the other straight out in front, sit to the box under control and stand without the free foot touching.", id: "pistol", k: "wr", sets: rx.half ? 1 : 2, reps: 5 }],
      why: "Two sets, never to failure: control, not load. The pivot foot learning to own the body." },
    { L: "X", n: "Burst Decrement Test", m: 6, hide: (rx) => !rx.burstTest, star: 1,
      timer: () => ({ kind: "bursttest", title: "BURST DECREMENT" }), rxLine: () => "10 bursts of 6 s — the tenth against the first",
      items: [{ n: "First burst", s: "write it down", id: "p_burst1", k: "out", u: "output" },
        { n: "Tenth burst", s: "the tenth against the first", id: "p_burst10", k: "out", u: "output" }],
      why: "The decrement halving over the preparation is the flurry holding up." },
    { L: "D", n: (rx) => engName("e1")(rx), m: engMin("e1"), star: 1, hard: 1, eng: 1, engKey: "e1",
      timer: prepEngTimer("e1"), rxLine: (rx) => (PENG[rx.e1] || PENG.easy).d,
      items: (rx) => [{ n: "Output", s: "write it down", id: "p_e1", k: "out", u: "output" }],
      rules: (rx) => ((PENG[rx.e1] || {}).rule ? [(PENG[rx.e1] || {}).rule] : null),
      why: "Bike or SkiErg — one of them, all preparation, so the numbers compare.", tr: 1 },
    { L: "E", n: "The 60-Second Settle", m: 1, settle: 1, timer: () => ({ kind: "settle", title: "THE SETTLE" }),
      rxLine: () => "60 seconds — log the seconds to land",
      items: [{ n: "Seconds to land on the breath", s: "write it down", cue: "Stay on the bike. Eyes closed, heart pounding, find the breath at the nostrils and stay on it.", id: "settle", k: "out", u: "seconds" }],
      why: "The corner between rounds, trained, for nothing, twice a week." },
    { L: "F", n: "Trunk", m: 9, rest: "Rest 45 s", rt: 45,
      items: [{ n: "Pallof press", s: "3 × 10 per side · 2 s hold", cue: "Band at chest height anchored beside you, press the hands straight out and hold two seconds without letting it twist you.", id: "pallof", k: "wr", sets: 3, reps: "10/side" },
        { n: "Ab wheel rollout", s: "3 × 8–12", cue: "Knees down, out only as far as the lower back remains flat.", id: "abwheel", k: "wr", sets: 3, reps: "8–12" },
        { n: "Copenhagen plank", s: "2 × 30 s per side", cue: "Side plank, top foot on a bench, bottom leg lifted. The groin you pivot off.", id: "copen", k: "wr", sets: 2, reps: 30 }] },
    { L: "G", n: "Seated Calf Raise + Achilles Hold", m: 5, p: "CALF", rest: "Rest 60 s", rt: 60,
      items: [{ n: "Seated calf raise", s: "3 × 12", cue: "Up on the balls of the feet, pause, down slow, twelve times. The knee-bent position trains the muscle that keeps you on your toes in round six.", id: "soleus", k: "wr", sets: 3, reps: 12 },
        { n: "Achilles hold — STANDING", s: "one × 45 seconds", cue: "On the edge of a step, a dumbbell in each hand or a bar on your back, as heavy as you can hold dead still. Rise to the top and hold, knees straight.", id: "achilles", k: "wr", sets: 1, reps: 45 }],
      why: "The Achilles takes every sprint and every landing on a straight knee. Forty-five seconds a week is the insurance." }] },

  /* ---------------- WEDNESDAY ---------------- */
  wed: { n: "WEDNESDAY", t: "Strength — sled, the trap bar in its phase, bench throw, rings, chins, Nordics, neck", m: 60, ac: C.oxide, box: 1,
    intro: "The heavy morning, and the lift changes its shape by block. Every rep moves with intent; the watch says how fast, and the set ends at the velocity threshold.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN", rxLine: () => "6 min · then trap bar warm-up sets: bar × 5 · 50% × 3 · 70% × 2" },
    { L: "B", n: "Heavy Sled Sprints", m: 12, star: 1, hard: 1, rest: "Rest 2:30", rt: 150,
      rxLine: (rx) => rx.sled + " × 20 m",
      items: (rx) => [{ n: "Heavy sled sprint 20 m", s: rx.sled + " × 20 m @ 40–60% of bodyweight", cue: "Lean in at about 45° and sprint 20 metres driving the ground backward through the whole foot; 5–7 seconds a run. Faster, add weight; slower, take some off.", id: "sled", k: "out", u: "load (kg) · time (s)", bwp: [40, 60], bwl: "on the sled" }],
      why: "Horizontal force — the push that starts a punch and closes distance — with no soreness and nothing on your spine. First, while the nervous system is freshest." },
    { L: "P", n: "Load-Velocity Profile — Trap Bar", m: 10, hide: (rx) => !rx.profile, star: 1, profile: "tbdl",
      rxLine: () => "five loads × 2 reps, fast, the watch recording",
      items: [{ n: "Trap bar at five loads", s: "50 · 60 · 70 · 80 · 85% — two reps each", cue: "Two reps at each load, as fast as the bar will move, the watch recording the mean speed. The line it draws replaces the typical numbers for the whole preparation.", id: "p_prof_tb", k: "chk" }],
      why: "A percentage is a guess about today from a number measured weeks ago; a velocity is a measurement of today." },
    { L: "C", n: "Trap Bar Deadlift", m: 12, star: 1, hard: 1, mainLift: "tbdl", vel: "tbdl", phase: 1,
      pres: (rx) => ({ sc: rx.sc, pct: rx.pct }),
      rest: (rx) => (rx.lift === "contrast" ? "Rest 3:00" : "Rest 2:30"), rt: (rx) => (rx.lift === "contrast" ? 180 : 150),
      rxLine: (rx) => rx.sc,
      items: (rx) => [{ n: "Trap bar deadlift", s: rx.sc, cue: PREP_PHASE_CUE[rx.lift] + " Stand inside the bar, grip the handles, flat back, drive the floor away. Nothing passes over your body and a rep you are not sure of goes down, not up.", id: "tbdl", k: "wr", mk: "tbdl", pct: rx.pct, sets: rx.sets, reps: rx.reps }],
      w: (rx) => PREP_PHASE_CUE[rx.lift],
      why: (rx) => PREP_PHASE_WHY[rx.lift], tr: 1 },
    { L: "D", n: "Bench Throw (Smith)", m: 6, star: 1, hard: 1, rest: "Rest 90 s", rt: 90, rxLine: () => "4 × 3 @ about a third of bench",
      items: [{ n: "Bench throw", s: "4 × 3", cue: "Smith machine, light bar. Lower to the chest, press so hard the bar leaves your hands, catch it, reset. Whatever weight flies highest.", id: "throw", k: "wr", mk: "bench", pct: [30, 45], sets: 4, reps: 3 }],
      note: "No Smith machine? A 4–6 kg medicine ball thrown off the chest at a wall, 4 × 5.",
      w: OUTPUT_RULE, why: "The punch-speed lift." },
    { L: "E", n: "Ring Dips", m: 6, cal: "ringdip", rest: "Rest 90 s", rt: 90, rxLine: () => "3 sets at your level",
      items: (rx) => [{ n: "Ring dips — at your level", s: (rx.half ? 2 : 3) + " sets", cue: "Support at the top, arms locked, rings still; lower until the shoulders are level with the elbows, press up, turning the palms forward at the top.", id: "ringdip", k: "wr", sets: rx.half ? 2 : 3, reps: "at your level" }],
      w: "Elbow pain of any kind is a stop sign, not a challenge.",
      why: "Pressing through a shoulder that has to stabilise itself — the cuff and serratus work that keeps a guard up." },
    { L: "F", n: "Weighted Chin-Up + The Muscle-Up Line", m: 8, cal: "muscleup", rest: "Rest 90 s", rt: 90,
      rxLine: () => "3 × 5, then 2 sets of the muscle-up line",
      items: (rx) => [{ n: "Weighted chin-up", s: (rx.half ? 2 : 3) + " × 5", cue: "Palms away, weight on a belt or a dumbbell between the feet, from a dead hang, chin over the bar, lower under control.", id: "chin", k: "wr", sets: rx.half ? 2 : 3, reps: 5 },
        { n: "The muscle-up line — at your level", s: (rx.half ? 1 : 2) + " sets", cue: "Chest-to-bar pull-ups at the first level, explosive, the bar touching the chest, climbing through negatives to the strict muscle-up.", id: "muscleup", k: "wr", sets: rx.half ? 1 : 2, reps: "at your level" }],
      why: "Pulling strength protects the shoulders that throw; the muscle-up is pulling power, the quality that snaps a hand back." },
    { L: "G", n: "Nordic Curls", m: 6, hard: 1, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => rx.nor[0] + " × " + rx.nor[1],
      items: (rx) => [{ n: "Nordic curl", s: rx.nor[0] + " × " + rx.nor[1], cue: "Heels anchored, body straight from knees to head, lower forward as slowly as you can, catch yourself with your hands, push back up. Stop the set the moment the lower back rounds.", id: "nordic", k: "wr", sets: rx.nor[0], reps: rx.nor[1] }],
      why: "A hamstring on a Saturday sprint is the second-commonest way a preparation ends. Wednesday, so the soreness is gone before Saturday." },
    { L: "H", n: "Neck — holds only", m: 5, p: "NECK",
      items: [{ n: "Four-direction holds", s: "3 × 10 s each direction", cue: "Press your palm hard against your forehead and push your head into it; the head never moves. Then the back of the head, then each side.", id: "p_neck_wed", k: "chk" }],
      why: "The third neck dose of the week. In camp the neck is the cheapest insurance there is." }] },

  /* ---------------- THURSDAY ---------------- */
  thu: { n: "THURSDAY", t: "Throws + Engine 2 — throws and landmine, split squat, the Spanish hold, the second session, neck, hands", m: (rx) => (rx.size ? 78 : 66), ac: C.brass, box: 1,
    intro: "The third power dose, then the only loaded single-leg lift, the tendon hold, and the second conditioning session — always a different quality from Tuesday's.", b: [
    { L: "A", n: "Warm-up + bear crawls", m: 8, p: "GEN8", rxLine: () => "8 min · crawls included, then three easy throws of each at half effort",
      items: [{ n: "Bear crawls · 2 min", s: "10 m forward, 10 m back, × 4", cue: "On hands and feet, knees an inch off the floor, back flat as a table, opposite hand and foot together.", id: "crawl", k: "wr", sets: 4, reps: 20 }] },
    { L: "B", n: "Power dose — throws + landmine", m: 8, star: 1, hard: 1, rest: "45 s between sets", rt: 45,
      rxLine: () => "shot-put 2 × 3 per side · landmine punch 2 × 5 per side",
      items: [{ n: "Rotational shot-put", s: "2 × 3 per side", cue: "Medicine ball 3–5 kg at the shoulder, side-on to the wall, drive off the back hip; flat and hard, like the punch.", id: "p_shot", k: "chk" },
        { n: "Landmine punch", s: "2 × 5 per side", cue: "One end of a barbell in a corner, the other at your shoulder, in your stance; drive the hips and punch it up and away, never a press.", id: "lmpunch", k: "wr", sets: 2, reps: "5/side" }],
      w: "Bar speed is the metric; add weight only when it still snaps." },
    { L: "C", n: "Split Squat, Rear Foot Elevated", m: 7, p: "SPLIT", rest: "Rest 60 s", rt: 60,
      rxLine: (rx) => rx.split + " × 6–8 each leg",
      items: (rx) => [{ n: "Rear-foot-elevated split squat", s: rx.split + " × 6–8 each leg", cue: "Back foot up on a bench behind you, front shin near vertical, a dumbbell in each hand; sink until the back knee nearly touches, drive up through the front heel. Weak side first, and the same weight on both legs.", id: "rfess", k: "wr", sets: rx.split, reps: "6–8" }],
      why: "The rear-leg drive and the pivot are one foot; this is where the weak side gets found and fixed." },
    { L: "D", n: "Spanish Squat Hold", m: 3, p: "SPAN", rest: "Rest 30 s", rt: 30, rxLine: () => "3 × 30 seconds",
      items: [{ n: "Spanish squat hold", s: "3 × 30 seconds · rest 30 s", cue: "A thick band around the back of both knees, anchored to the rack in front of you at knee height; lean back into it so the shins stay vertical, sit to a half squat, hold dead still.", id: "spanish", k: "wr", sets: 3, reps: 30 }],
      why: "The patellar tendon, which takes every depth jump and box landing in this camp." },
    { L: "X", n: "Nasal Threshold Test", m: 8, hide: (rx) => !rx.nasal, star: 1,
      timer: () => ({ kind: "nasal", title: "NASAL THRESHOLD" }), rxLine: () => "8 min nose only, the pace up every 2 minutes",
      items: [{ n: "Pace at the moment the mouth opened", s: "write it down", id: "p_nasal", k: "out", u: "pace" },
        { n: "The honest half", s: "did it open because it had to", id: "p_nasal_h", k: "out", u: "had to / caved" }],
      why: "Then the session that follows runs one round short." },
    { L: "E", n: (rx) => engName("e2")(rx), m: engMin("e2"), star: 1, hard: 1, eng: 1, engKey: "e2",
      timer: prepEngTimer("e2"), rxLine: (rx) => (PENG[rx.e2] || PENG.easy).d,
      items: (rx) => [{ n: "Output", s: "write it down", id: "p_e2", k: "out", u: "output" }],
      rules: (rx) => ((PENG[rx.e2] || {}).rule ? [(PENG[rx.e2] || {}).rule] : null),
      why: "Always a different quality from Tuesday's.", tr: 1 },
    { L: "F", n: "The 60-Second Settle", m: 1, settle: 1, timer: () => ({ kind: "settle", title: "THE SETTLE" }),
      rxLine: () => "60 seconds — log the seconds to land",
      items: [{ n: "Seconds to land on the breath", s: "write it down", cue: "Stay on the bike. Eyes closed, heart pounding, find the breath at the nostrils.", id: "settle2", k: "out", u: "seconds" }] },
    { L: "G", n: "Neck", m: 8, p: "NECK",
      items: [{ n: "The full neck block", s: "holds, rapid tense, perturbation", id: "p_neck_thu", k: "chk" }] },
    { L: "H", n: "Hands", m: 4, p: "HANDS",
      items: [{ n: "Hands", s: "knuckle hold 3 × 20 s · band wrist extension 2 × 15", cue: "On your fists on a mat, the wrist dead straight; then forearm on the knee, palm down, lifting the knuckles toward you.", id: "hands_thu", k: "wr", sets: 3, reps: 20 }] },
    { L: "I", n: "The Size Block", m: 12, hide: (rx) => !rx.size, rest: "Rest 60–75 s", rt: 70,
      rxLine: () => "three sets each, a rep or two in the tank",
      items: [{ n: "Lean-away lateral raise", s: "3 × 12–15", cue: "Hold the rack with one hand and lean away, raise a dumbbell out to shoulder height with the other.", id: "p_lat", k: "wr", sets: 3, reps: "12–15" },
        { n: "Rear-delt fly", s: "3 × 15", cue: "Bent over flat, small dumbbells out to the sides, little fingers leading.", id: "p_rdf", k: "wr", sets: 3, reps: 15 },
        { n: "Curls", s: "3 × 8–12", cue: "EZ-bar or dumbbells, elbows still, full stretch at the bottom, no swing.", id: "p_curl", k: "wr", sets: 3, reps: "8–12" }],
      why: "Five weeks is the block where size is being built — volume up, calories up, the lifts at 70–75%. It comes out at week 6." }] },

  /* ---------------- FRIDAY ---------------- */
  fri: { n: "FRIDAY", t: "Sleep", m: 0, ac: C.moss, sleep: 1, free: 1,
    intro: "No alarm. Tomorrow is the long session and Sunday is the rounds, and the best thing you can do for both is not get up at half three.", b: [] },

  /* ---------------- SATURDAY ---------------- */
  sat: { n: "SATURDAY", t: "The long session — sprints, reactive jumps, the squat in its phase, push press, the four throws", m: 90, ac: C.oxide, free: 1,
    intro: "Fed and rested, no shift after it, Friday's sleep in front of it. Speed first, then reactive power, then the squat in its phase, then the push press, then the throws.", b: [
    { L: "A", n: "Warm-up — get-ups first", m: 16, p: "HIP", rxLine: () => "16 min · get-ups 2/side, hips, pogos, then the three build-ups",
      items: [{ n: "Turkish get-up", s: "2 per side, light", cue: GETUP, id: "getup", k: "chk" },
        { n: "Sprint build-ups", s: "20 m at 60%, 75%, 90%", cue: "Never skipped. One run at 60%, one at 75%, one at 90%.", id: "p_buildup", k: "chk" }] },
    { L: "P", n: "Load-Velocity Profiles — Squat, Bench, Push Press", m: 14, hide: (rx) => !rx.profile, star: 1, profile: "squat",
      rxLine: () => "the squat at five loads, bench and push press at four",
      items: [{ n: "Squat at five loads", s: "50 · 60 · 70 · 80 · 85% — two reps each", cue: "Two reps at each load, as fast as the bar will move, the watch recording the mean speed.", id: "p_prof_sq", k: "chk" },
        { n: "Bench and push press at four loads", s: "50 · 60 · 70 · 80%", cue: "The same again on the bench and the push press. The lines replace the typical numbers.", id: "p_prof_bp", k: "chk" }] },
    { L: "B", n: "Flying Sprints", m: 14, star: 1, hard: 1, hide: (rx) => !!rx.testWeek, rest: "Rest 2:30–3:00", rt: 165,
      rxLine: (rx) => (rx.spr ? rx.spr + " × 20 m flat out" : "build-ups, then three runs at 90%"),
      items: (rx) => [{ n: "Flying sprint 20 m", s: rx.spr ? rx.spr + " runs" : "3 runs at 90%", cue: "Jog-build for 10–15 metres, then 20 metres absolutely flat out. Walk back, full rest — speed, not cardio.", id: "p_sprint", k: "chk" }],
      w: "A hamstring twinge on the build-ups ends the sprints for the day.",
      why: "Top speed is the quality that fades first and costs least to keep." },
    { L: "C", n: (rx) => (rx.jump === "depth" ? "Depth Jumps" : "Loaded Drop Jumps"), m: 8, star: 1, hard: 1, hide: (rx) => !!rx.testWeek,
      rest: "Rest 2:00", rt: 120, rxLine: (rx) => rx.js[0] + " × " + rx.js[1],
      items: (rx) => [{ n: rx.jump === "depth" ? "Depth jump" : "Loaded drop jump", s: rx.js[0] + " × " + rx.js[1],
        cue: rx.jump === "depth" ? "Step off a 30–40 cm box and, the instant the feet touch, jump as high as you can — the shortest possible time on the floor." : "A hex dumbbell in each hand, 8–12 kg, dip fast into a quarter squat, let both go at the bottom and jump straight up as high as you can, empty-handed; land soft on clear floor.", id: "p_react", k: "chk" }],
      w: "Stop the set the moment a jump is lower than the last." },
    { L: "D", n: "Side Bounds", m: 6, hard: 1, hide: (rx) => !!rx.testWeek, rest: "Rest 90 s", rt: 90, rxLine: () => "3 × 4 per side",
      items: (rx) => [{ n: "Side bound", s: "3 × 4 per side", cue: rx.bound === "cont" ? "Stand on one leg, jump sideways as far as you can, land on the other and bounce straight back the other way — no stick." : "Stand on one leg, jump sideways as far as you can, land on the other and stick it dead still for two seconds.", id: "p_bound", k: "chk" }],
      why: "The sideways push-off that cuts a ring off." },
    { L: "E", n: (rx) => (rx.lift === "contrast" ? "Back Squat + The Jump Circuit" : "Back Squat"), m: 16, star: 1, hard: 1,
      mainLift: "squat", vel: "squat", phase: 1, hide: (rx) => !!rx.testWeek,
      pres: (rx) => ({ sc: rx.sc, pct: rx.pct }), rest: "Rest 3:00", rt: 180, rxLine: (rx) => rx.sc,
      items: (rx) => [{ n: "Back squat", s: rx.sc, cue: PREP_PHASE_CUE[rx.lift] + " Warm-up sets first: 40% × 3, 60% × 2, 75% × 1 of working. Bar on the back, break at the hips and knees together, sit to just below parallel, drive up. Pins set just below your lowest position, every set.", id: "squat", k: "wr", mk: "squat", pct: rx.pct, sets: rx.sets, reps: rx.reps }]
        .concat(rx.lift === "contrast" ? [{ n: "The jump circuit", s: rx.cr + " rounds", cue: "After each double: rest 20 s, box jumps × 3, rest 20, trap bar jumps × 3, rest 20, band-assisted jumps × 3, then 3 minutes. The round ends the moment jump height drops.", id: "p_circuit", k: "chk" }] : []),
      w: (rx) => PREP_PHASE_CUE[rx.lift], why: (rx) => PREP_PHASE_WHY[rx.lift] },
    { L: "F", n: "Push Press", m: 8, hard: 1, mainLift: "pp", vel: "pp", hide: (rx) => !!rx.noPP || !!rx.testWeek,
      pres: (rx) => ({ sc: rx.pp.sets + " × " + rx.pp.reps + " @ " + rx.pp.pct + "%", pct: rx.pp.pct }),
      rest: "Rest 2:00", rt: 120, rxLine: (rx) => rx.pp.sets + " × " + rx.pp.reps + " @ " + rx.pp.pct + "%",
      items: (rx) => [{ n: "Push press", s: rx.pp.sets + " × " + rx.pp.reps + " @ " + rx.pp.pct + "%", cue: "Bar on the front of the shoulders, quick shallow knee dip, drive it overhead with the legs and punch it to lockout.", id: "pushpress", k: "wr", mk: "pp", pct: rx.pp.pct, sets: rx.pp.sets, reps: rx.pp.reps }],
      why: "Legs, braced trunk, hands — the route a punch takes." },
    { L: "G", n: "The Four Punch Throws", m: 12, star: 1, p: "VEC", hide: (rx) => !!rx.testWeek,
      rest: "45 s between exercises · 90 s between rounds", rt: 45,
      timer: () => ({ kind: "vec", opt: { rounds: 2 }, title: "PUNCH THROWS" }), rxLine: () => "2 rounds",
      items: [{ n: "The four throws", s: "2 rounds", cue: "Rotational shot-put 4/side, downward diagonal 4/side, hook throw 4/side, landmine punch 5/side.", id: "p_throws_sat", k: "chk" }],
      w: OUTPUT_RULE },
    /* ---- test day, week 14 ---- */
    { L: "T", n: "TEST DAY", m: 70, hide: (rx) => !rx.testWeek, star: 1, prepTest: 1,
      rxLine: () => "most explosive first, full recovery between everything",
      items: [{ n: "Flying sprint 20 m", s: "3 attempts, best time", id: "p_t_sprint", k: "out", u: "s" },
        { n: "Depth jump rebound", s: "3 attempts, filmed", id: "p_t_jump", k: "out", u: "cm" },
        { n: "Diagonal throw", s: "3 per side, best distance", id: "p_t_diag", k: "out", u: "m" },
        { n: "Shot-put throw", s: "3 per side, best distance", id: "p_t_shot", k: "out", u: "m" },
        { n: "Back squat max single", s: "pins set", id: "p_t_squat", k: "out", u: "kg", max: "squat" },
        { n: "Bench max single", s: "pins, no collars", id: "p_t_bench", k: "out", u: "kg", max: "bench" },
        { n: "Trap bar heavy triple", s: "× 1.08 sets the trap bar max", id: "p_t_tb", k: "out", u: "kg", max: "tbdl", est: 1.08 },
        { n: "Bodyweight", s: "kg", id: "p_t_bw", k: "out", u: "kg" },
        { n: "Waist", s: "cm", id: "p_t_waist", k: "out", u: "cm" }],
      why: "The camp's working weights come off these numbers on Monday." }] },

  /* ---------------- SUNDAY ---------------- */
  sun: { n: "SUNDAY", t: "The rounds — throws, the 6 × 3, the post-max sit, core with the L-sit and lever, hands, weekly check", m: 75, ac: C.brass, free: 1,
    intro: "The session the camp is for. Fed and rested. Throws first, fresh; then the rounds; then the corner, trained; then the core.", b: [
    { L: "A", n: "Warm-up — get-ups first", m: 14, p: "SUNWU", rxLine: () => "14 min · get-ups 2/side, Tuesday's warm-up, the power prep and the practice throws",
      items: [{ n: "Turkish get-up", s: "2 per side, light", cue: GETUP, id: "getup_sun", k: "chk" }] },
    { L: "B", n: "The Four Punch Throws", m: 12, star: 1, p: "VEC", rest: "45 s between exercises · 90 s between rounds", rt: 45,
      timer: () => ({ kind: "vec", opt: { rounds: 2 }, title: "PUNCH THROWS" }), rxLine: () => "2 rounds",
      items: [{ n: "The four throws", s: "2 rounds", cue: "Rotational shot-put 4/side, downward diagonal 4/side, hook throw 4/side, landmine punch 5/side.", id: "p_throws_sun", k: "chk" }],
      w: OUTPUT_RULE },
    { L: "X", n: "The 20-Minute Test", m: 25, star: 1, hard: 1, hide: (rx) => !rx.t20,
      timer: () => ({ kind: "z2", opt: { min: 20, label: "20-MIN TEST — MAXIMUM DISTANCE" }, title: "20-MIN TEST" }),
      rxLine: () => "5 easy minutes, then 20 minutes for the most distance you can",
      items: [{ n: "Distance", s: "the engine's ceiling", cue: "Five easy minutes, then 20 minutes for the most distance you can on the erg you will use all preparation. No pacing plan — go and find out.", id: "bike20", k: "out", u: "distance (m)" },
        { n: "Peak heart rate", s: "the highest you saw", cue: "Every easy session from here is paced at 65–75% of it.", id: "bike20hr", k: "out", u: "bpm" }],
      why: "The engine's ceiling and your peak heart rate. Every easy session is paced off it.", tr: 2 },
    { L: "C", n: (rx) => "The " + rx.sim + " × 3 Simulation", m: 28, star: 1, sim: 1, hard: 1, hide: (rx) => !rx.sim,
      timer: (rx) => ({ kind: "csim", opt: { rounds: rx.sim, rest: rx.rest }, title: "THE ROUNDS" }),
      rxLine: (rx) => rx.sim + " × 3 min · rest " + rx.rest + " s" + (rx.scored ? " · SCORED" : ""),
      items: (rx) => [{ n: "Minute 1", s: "SkiErg", k: "txt" }, { n: "Minute 2", s: "Assault bike", k: "txt" },
        { n: "Minute 3", s: "Med-ball slams, or bag work, hard and technically clean", k: "txt" },
        { n: "Round 1 output", s: rx.scored ? "SCORED WEEK — write it down" : "write it down", id: "c_fs_rd1", k: "out", u: "SkiErg m / bike cal" },
        { n: "Last round output", s: "round six divided by round one is the fade", id: "c_fs_rd6", k: "out", u: "SkiErg m / bike cal" }],
      rules: ["Relaxed jaw, shoulders down. Finish a round with your traps by your ears and it does not count.", CORNER],
      recovery: 1,
      why: "Six rounds of three minutes, all fourteen weeks; the rest shortens by block — 90 seconds in accumulation, 60 from week 6.", tr: 2 },
    { L: "D", n: "The Post-Max Sit", m: 3, hide: (rx) => !rx.sim && !rx.t20,
      timer: () => ({ kind: "postmax", title: "POST-MAX SIT" }), rxLine: () => "3 min — straight off the last round",
      items: [{ n: "Seconds to settle onto the breath", s: "write it down", cue: "Straight off the last round: sit, eyes closed, heart at 170-plus, find the breath at the nostrils.", id: "postmax", k: "out", u: "seconds" }],
      why: "The corner, trained." },
    { L: "E", n: "Core, L-Sit, Lever, Hands", m: 12, cal: "lsit", rest: "Rest 60 s", rt: 60,
      items: (rx) => [{ n: "Hanging leg raise", s: "3 × 8–12", cue: "Hang from a bar, lift the legs to hip height or above, no swinging.", id: "hlr", k: "wr", sets: 3, reps: "8–12" },
        { n: "The L-sit line — at your level", s: (rx.half ? 2 : 3) + " sets", cue: "The tuck L-sit between two boxes to start; the line climbs one leg at a time to the full L-sit.", id: "lsit", k: "wr", sets: rx.half ? 2 : 3, reps: "at your level" },
        { n: "Side plank reach-through", s: "2 × 10 per side", cue: "In a side plank, thread your top arm under your body, then rotate open to the ceiling.", id: "sprt", k: "chk" },
        { n: "Tuck front lever", s: "3 holds", cue: "Hang from the bar, pull the shoulder blades down, knees to the chest, body horizontal, face up; ten seconds to start. The three elbow laws apply.", id: "lever", k: "wr", sets: 3, reps: "hold" },
        { n: "Hands", s: "knuckle hold 3 × 20 s · band wrist extension 2 × 15", cue: "On your fists on a mat, the wrist dead straight.", id: "hands_sun", k: "wr", sets: 3, reps: 20 }] },
    { L: "S", n: "The Size Add-On", m: 8, hide: (rx) => !rx.size, rest: "Rest 60 s", rt: 60,
      items: [{ n: "Face pulls", s: "3 × 15", cue: "Rope on a high cable or the band on the door anchor, elbows high, squeeze the back of the shoulders.", id: "p_face", k: "wr", sets: 3, reps: 15 },
        { n: "Hammer curls", s: "3 × 10", cue: "Elbows still, no swing.", id: "p_ham", k: "wr", sets: 3, reps: 10 }] },
    { L: "I", n: "Weekly Check", m: 2, review: 1, rangeTests: 1, flexTests: 1,
      items: [{ n: "Bodyweight", s: "kg", id: "wr_bw", k: "out", u: "kg" }, { n: "Waist", s: "cm", id: "pwr_waist", k: "out", u: "cm" },
        { n: "Resting heart rate", s: "bpm", id: "wr_rhr", k: "out", u: "bpm" },
        { n: "Green days", s: "count", id: "pwr_g", k: "out", u: "days" }, { n: "Yellow days", s: "count", id: "pwr_y", k: "out", u: "days" }, { n: "Red days", s: "count", id: "pwr_r", k: "out", u: "days" },
        { n: "Hips", s: "0–10", id: "wr_hip", k: "out", u: "0–10" }, { n: "Shoulders", s: "0–10", id: "wr_sh", k: "out", u: "0–10" },
        { n: "Elbows", s: "0–10", id: "wr_el", k: "out", u: "0–10" }, { n: "Wrists", s: "0–10", id: "wr_wr", k: "out", u: "0–10" },
        { n: "Knees", s: "0–10", id: "wr_kn", k: "out", u: "0–10" }, { n: "Achilles", s: "0–10", id: "wr_ach", k: "out", u: "0–10" },
        { n: "Hours of sleep, averaged", s: "hours a night", id: "wr_sleep", k: "out", u: "hours" },
        { n: "Lights-out time, averaged", s: "what time the light went off", id: "wr_lights", k: "out", u: "e.g. 20:30" },
        { n: "Energy", s: "1–10", id: "wr_en", k: "out", u: "1–10" },
        { n: "Evenings you did RANGE", s: "0–7", id: "wr_home", k: "out", u: "0–7" }],
      note: "Three yellows in a week: next week runs at the table's numbers minus one set on everything and the interval sessions at 90%." }] },
};

/* ---------------- THE TRANSITION ---------------- */
export const TS = {
  mon: { n: "MONDAY", t: "Base, easy", m: 50, ac: C.moss, b: [
    { L: "A", n: "Base — easy, nose only", m: 40, eng: 1,
      timer: () => ({ kind: "z2", opt: { min: 40, label: "EASY — NOSE ONLY" }, title: "BASE" }), rxLine: () => "40 min at 65–75% of peak",
      items: [{ n: "Average heart rate", s: "65–75% of peak", id: "c_base", k: "out", u: "bpm" }] },
    { L: "B", n: "Ring Rows", m: 5, cal: "ringrow", rest: "Rest 60 s", rt: 60, rxLine: () => "half the sets, at your level",
      items: [{ n: "Ring rows — at your level", s: "2 sets", id: "ringrow", k: "wr", sets: 2, reps: "at your level" }] }] },
  tue: { n: "TUESDAY", t: "Sleep", m: 0, ac: C.moss, sleep: 1, free: 1, b: [] },
  wed: { n: "WEDNESDAY", t: "Easy lifting — nothing above 70%", m: 45, ac: C.moss, b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN" },
    { L: "B", n: "Trap Bar Deadlift", m: 12, mainLift: "tbdl", pres: () => ({ sc: "2 × 5 @ 70%", pct: 70 }),
      rest: "Rest 2:00", rt: 120, rxLine: () => "2 × 5 @ 70%",
      items: [{ n: "Trap bar deadlift", s: "2 × 5 @ 70%", cue: "Two reps short of hard on every set.", id: "tbdl", k: "wr", mk: "tbdl", pct: 70, sets: 2, reps: 5 }] },
    { L: "C", n: "Ring Dips", m: 6, cal: "ringdip", rest: "Rest 90 s", rt: 90, rxLine: () => "half the sets, at your level",
      items: [{ n: "Ring dips — at your level", s: "2 sets", id: "ringdip", k: "wr", sets: 2, reps: "at your level" }] }] },
  thu: { n: "THURSDAY", t: "Base, easy", m: 45, ac: C.moss, b: [
    { L: "A", n: "Base — easy, nose only", m: 40, eng: 1,
      timer: () => ({ kind: "z2", opt: { min: 40, label: "EASY — NOSE ONLY" }, title: "BASE" }), rxLine: () => "40 min at 65–75% of peak",
      items: [{ n: "Average heart rate", s: "65–75% of peak", id: "c_base", k: "out", u: "bpm" }] }] },
  fri: { n: "FRIDAY", t: "Sleep", m: 0, ac: C.moss, sleep: 1, free: 1, b: [] },
  sat: { n: "SATURDAY", t: "The movement session and a walk", m: 60, ac: C.violet, free: 1, b: [
    { L: "A", n: "Easy walk or ride", m: 40, eng: 1,
      timer: () => ({ kind: "z2", opt: { min: 40, label: "EASY — NOSE ONLY" }, title: "EASY" }), rxLine: () => "40 min, conversational",
      items: [{ n: "Average heart rate", s: "65–75% of peak", id: "c_base", k: "out", u: "bpm" }] }] },
  sun: { n: "SUNDAY", t: "Easy hour and the weekly check", m: 45, ac: C.moss, free: 1, b: [
    { L: "A", n: "Easy hour", m: 40, eng: 1,
      timer: () => ({ kind: "z2", opt: { min: 40, label: "EASY — NOSE ONLY" }, title: "EASY HOUR" }), rxLine: () => "30–40 min, nose only",
      items: [{ n: "Average heart rate", s: "65–75% of peak", id: "c_base", k: "out", u: "bpm" }] },
    { L: "I", n: "Weekly Check", m: 2, review: 1,
      items: [{ n: "Bodyweight", s: "kg", id: "wr_bw", k: "out", u: "kg" }, { n: "Resting heart rate", s: "bpm", id: "wr_rhr", k: "out", u: "bpm" },
        { n: "Energy", s: "1–10", id: "wr_en", k: "out", u: "1–10" }, { n: "Hours of sleep, averaged", s: "hours a night", id: "wr_sleep", k: "out", u: "hours" }] }] },
};

export const prepSess = (day) => PS[day] || null;
export const transitionSess = (day) => TS[day] || null;
