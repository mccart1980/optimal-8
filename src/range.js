import { C } from "./ui.jsx";

/* ================================================================
   RANGE — the home block of Fighter v1.4, as data.
   THE MORNING FIVE on waking, RANGE every evening for twelve weeks,
   then THE KEEP, and the four tests every four weeks. Every
   instruction string below is the document's own wording.

   Each step carries two durations: `s` is the hold exactly as the
   document writes it, `s20` trims it so the whole block lands on the
   twenty minutes the document promises. The document's per-section
   minutes (1 + 5 + 8 + 6) add to twenty; its per-move holds add to
   about twenty-five. The timer offers both and defaults to twenty.
   ================================================================ */

export const RANGE_KEYS = { tests: "o8s-range" };   /* { "m1w5": { ...fields } } */

export const RANGE_INTRO = "Two joints you named as your limiting factor: hips and shoulders. Both are limited first by the mid-back, so it goes first. Eight minutes a night was maintenance; this is change. Twenty minutes every evening for twelve weeks, five on waking, four tests every four weeks so the range is a number, then a ten-minute keep for life. Kit: a foam roller, a light band, a kettlebell or dumbbell (8–16 kg), a doorframe pull-up bar if you can fit one, a sofa and a chair.";

export const RANGE_HOW = "How range changes — so you do it right. Stiffness is partly the tissue and mostly the nervous system guarding it. Three things move it, and the eight-minute block did none of them: long holds — ninety seconds to three minutes, breathing slowly out through the nose, because a long exhale is what tells the body it's safe to let go; contract-relax — pushing gently into the stretch for five seconds at a third of your strength, then relaxing and sinking further, three times, which resets the guard directly; and strength at the end of the range, because the body only keeps range it can control. Every joint below gets all three. Never into pain; into a strong stretch, and stay.";

export const RANGE_HIPS = "One line on the hips, worth reading twice. A stretch should pull at the back of the hip, the groin or the front of the thigh. If a deep squat or the 90/90 pinches at the front of the hip, or one side is markedly worse than the other, that's a joint pattern, not a muscle one — get it looked at before the twelve weeks, and we work around it.";

export const RANGE_SKIP = "If you skip it: nothing shows this week. By week 6 the hips tighten back to where they were, the internal-rotation lift stops moving, and the tests say so in numbers. The weekly check asks how many evenings you did it.";

export const KEEP_LINE = "After twelve weeks — THE KEEP · 10 min. The roller extensions, open book, the 90/90 with the lift, the couch stretch, the deep squat hold, the hang and the arm bar. Every evening, for good. The tests every eight weeks.";

export const MORNING_FIVE_HOW = "Controlled joint circles — the slowest, biggest circle each joint can make under its own power, three each way. Slow enough that it takes ten seconds a circle; if something wants to cheat — a shrug, a lean, a bent knee — that's the range you don't own yet, so slow down there.";

/* ---------------- THE MORNING FIVE · 5 min ---------------- */
export const MORNING_FIVE = [
  { k: "seg", l: "NECK — THREE CIRCLES EACH WAY, GENTLE, CHIN LEADING", s: 40 },
  { k: "seg", l: "SHOULDERS · RIGHT — THE BIGGEST CIRCLE THE ARM CAN DRAW: FORWARD, UP PAST THE EAR, BACK AND DOWN. THREE EACH WAY, TRUNK DEAD STILL, NO SHRUG", s: 35 },
  { k: "seg", l: "SHOULDERS · LEFT — THREE EACH WAY, TRUNK DEAD STILL, NO SHRUG", s: 35 },
  { k: "seg", l: "MID-BACK — CAT-CAMEL × 8", s: 40 },
  { k: "seg", l: "MID-BACK — ON ALL FOURS, HAND BEHIND HEAD, ELBOW TO THE CEILING × 6 EACH SIDE", s: 45 },
  { k: "seg", l: "HIPS · RIGHT — HOLD A WALL: KNEE TO THE CHEST, OUT TO THE SIDE, ROUND TO THE BACK AND DOWN. THREE EACH WAY, STANDING TALL", s: 35 },
  { k: "seg", l: "HIPS · LEFT — THREE EACH WAY, STANDING TALL", s: 35 },
  { k: "seg", l: "ANKLES — CIRCLES × 5 EACH WAY", s: 20 },
  { k: "seg", l: "ANKLES — 10 SLOW DEEP KNEE-BENDS OVER THE TOES, HEELS DOWN", s: 15 },
];

/* ---------------- RANGE · 20 min ---------------- */
export const RANGE_SECTIONS = [
  { n: "0 · DOWN-REGULATE", mins: 1, c: C.moss,
    note: "Lie on your back, feet on a chair, five slow breaths: in through the nose for 4, out for 8. Range work on a wound-up nervous system is wasted." },
  { n: "1 · MID-BACK — FIRST, ALWAYS", mins: 5, c: C.cobalt },
  { n: "2 · HIPS", mins: 8, c: C.oxide },
  { n: "3 · SHOULDERS", mins: 6, c: C.violet },
];

export const RANGE_STEPS = [
  { k: "out", sec: 0, l: "DOWN-REGULATE — FEET ON A CHAIR · FIVE SLOW BREATHS, IN 4, OUT 8", s: 60, s20: 60 },

  { k: "seg", sec: 1, l: "FOAM ROLLER EXTENSIONS × 8 — HANDS BEHIND HEAD, ARCH BACK OVER IT, UP A NOTCH EACH TIME", s: 40, s20: 30 },
  { k: "seg", sec: 1, l: "THE STIFFEST NOTCH — STAY THERE, BREATHING OUT", s: 45, s20: 45 },
  { k: "seg", sec: 1, l: "OPEN BOOK · RIGHT SIDE UP — OPEN THE TOP ARM, CHEST FOLLOWING, KNEES GLUED DOWN. HOLD 3s, COME BACK, AGAIN. CONTRACT-RELAX: PRESS THE TOP HAND TOWARD THE CEILING 5s, RELAX, OPEN FURTHER", s: 90, s20: 70 },
  { k: "seg", sec: 1, l: "OPEN BOOK · LEFT SIDE UP — HOLD 3s, COME BACK, AGAIN. CONTRACT-RELAX: PRESS TOWARD THE CEILING 5s, RELAX, OPEN FURTHER", s: 90, s20: 70 },
  { k: "seg", sec: 1, l: "THREAD THE NEEDLE × 8 PER SIDE — ON ALL FOURS, SLIDE ONE ARM UNDER THE OTHER, SHOULDER TOWARD THE FLOOR, HOLD 3s", s: 50, s20: 50 },
  { k: "seg", sec: 1, l: "LOADED ROTATION × 6 PER SIDE — SIDE-LYING WINDMILL, KNEES DOWN, ARC THE WEIGHT OVER AND BACK", s: 30, s20: 35 },

  { k: "seg", sec: 2, l: "90/90 · RIGHT LEG FRONT — FOLD THE CHEST OVER THE FRONT SHIN, BREATHING OUT", s: 60, s20: 45 },
  { k: "seg", sec: 2, l: "90/90 · RIGHT — CONTRACT-RELAX × 3: PRESS THE FRONT SHIN INTO THE FLOOR 5s, RELAX, FOLD FURTHER. THEN THE INTERNAL-ROTATION LIFT × 8: SIT TALL, LIFT THE BACK FOOT WITHOUT LEANING, HOLD 3s", s: 60, s20: 45 },
  { k: "seg", sec: 2, l: "90/90 · LEFT LEG FRONT — FOLD THE CHEST OVER THE FRONT SHIN, BREATHING OUT", s: 60, s20: 45 },
  { k: "seg", sec: 2, l: "90/90 · LEFT — CONTRACT-RELAX × 3, THEN THE INTERNAL-ROTATION LIFT × 8, HOLD 3s", s: 60, s20: 45 },
  { k: "seg", sec: 2, l: "COUCH STRETCH · RIGHT — SQUEEZE THE GLUTE, STAND TALL. CONTRACT-RELAX: DRIVE THE BACK KNEE INTO THE CUSHION 5s, RELAX, STAND TALLER", s: 90, s20: 70 },
  { k: "seg", sec: 2, l: "COUCH STRETCH · LEFT — SQUEEZE THE GLUTE, STAND TALL. CONTRACT-RELAX: DRIVE THE KNEE DOWN 5s, RELAX, STAND TALLER", s: 90, s20: 70 },
  { k: "seg", sec: 2, l: "COSSACK SQUATS × 6 PER SIDE — 3-SECOND PAUSE AT THE BOTTOM, THE OTHER LEG STRAIGHT, HEEL DOWN", s: 45, s20: 35 },
  { k: "seg", sec: 2, l: "DEEP SQUAT HOLD — A WEIGHT AT THE CHEST, ELBOWS PRYING THE KNEES OUT, HEELS DOWN, BREATHING OUT", s: 90, s20: 70 },
  { k: "seg", sec: 2, l: "SQUAT-TO-STAND × 5 — FOLD, HOLD THE TOES, PULL DOWN INTO THE SQUAT CHEST UP, STRAIGHTEN THE LEGS STILL HOLDING, AND BACK DOWN", s: 30, s20: 25 },
  { k: "seg", sec: 2, l: "HIP AIRPLANES × 5 PER SIDE — ON ONE LEG HOLDING A CHAIR, CHEST TO HORIZONTAL, ROTATE TOWARD THE FLOOR THEN UP TO THE CEILING", s: 45, s20: 30 },

  { k: "seg", sec: 3, l: "HANG — SHOULDERS RELAXED UP BY THE EARS, BREATHING OUT. NO BAR: HANDS ON A TABLE, STEP BACK, LET THE CHEST SINK BETWEEN THE ARMS", s: 90, s20: 70 },
  { k: "seg", sec: 3, l: "PRAYER STRETCH — ELBOWS ON THE CHAIR, HANDS BEHIND THE HEAD, SINK THE CHEST. CONTRACT-RELAX: PRESS THE ELBOWS INTO THE SEAT 5s, RELAX, SINK", s: 90, s20: 70 },
  { k: "seg", sec: 3, l: "SLEEPER STRETCH · RIGHT — PRESS THE FOREARM GENTLY TOWARD THE FLOOR. CONTRACT-RELAX: PUSH UP INTO YOUR HAND 5s, RELAX, PRESS FURTHER", s: 60, s20: 45 },
  { k: "seg", sec: 3, l: "SLEEPER STRETCH · LEFT — PRESS TOWARD THE FLOOR. CONTRACT-RELAX: PUSH UP 5s, RELAX, PRESS FURTHER", s: 60, s20: 45 },
  { k: "seg", sec: 3, l: "KETTLEBELL ARM BAR · RIGHT — ROLL ONTO THE LEFT SIDE, STRAIGHTEN THE RIGHT LEG BEHIND YOU, BELL STILL POINTING AT THE CEILING, SHOULDER PACKED. BREATHE THERE", s: 45, s20: 35 },
  { k: "seg", sec: 3, l: "KETTLEBELL ARM BAR · LEFT — BELL STILL POINTING AT THE CEILING, SHOULDER PACKED. BREATHE THERE", s: 45, s20: 35 },
  { k: "seg", sec: 3, l: "WALL SLIDES × 12 — FOREARMS ON THE WALL LIKE A GOALPOST, SLIDE UP WITHOUT THEM LEAVING IT, 3-SECOND REACH AT THE TOP", s: 40, s20: 30 },
  { k: "seg", sec: 3, l: "BAND EXTERNAL ROTATIONS × 15 PER ARM — THE RANGE YOU JUST FOUND, PUT UNDER CONTROL", s: 45, s20: 30 },
];

/* ---------------- THE KEEP · 10 min ---------------- */
export const KEEP_STEPS = [
  { k: "seg", l: "FOAM ROLLER EXTENSIONS × 8, THEN THE STIFFEST NOTCH — BREATHING OUT", s: 60 },
  { k: "seg", l: "OPEN BOOK · RIGHT SIDE UP — HOLD 3s, COME BACK, AGAIN. CONTRACT-RELAX AT THE END OF THE RANGE", s: 60 },
  { k: "seg", l: "OPEN BOOK · LEFT SIDE UP — HOLD 3s, COME BACK, AGAIN. CONTRACT-RELAX AT THE END OF THE RANGE", s: 60 },
  { k: "seg", l: "90/90 · RIGHT — FOLD, BREATHING OUT, THEN THE INTERNAL-ROTATION LIFT × 8", s: 60 },
  { k: "seg", l: "90/90 · LEFT — FOLD, BREATHING OUT, THEN THE INTERNAL-ROTATION LIFT × 8", s: 60 },
  { k: "seg", l: "COUCH STRETCH · RIGHT — SQUEEZE THE GLUTE, STAND TALL", s: 55 },
  { k: "seg", l: "COUCH STRETCH · LEFT — SQUEEZE THE GLUTE, STAND TALL", s: 55 },
  { k: "seg", l: "DEEP SQUAT HOLD — ELBOWS PRYING THE KNEES OUT, HEELS DOWN, BREATHING OUT", s: 70 },
  { k: "seg", l: "HANG — SHOULDERS RELAXED UP BY THE EARS, BREATHING OUT", s: 60 },
  { k: "seg", l: "KETTLEBELL ARM BAR · RIGHT — SHOULDER PACKED, BREATHE THERE", s: 30 },
  { k: "seg", l: "KETTLEBELL ARM BAR · LEFT — SHOULDER PACKED, BREATHE THERE", s: 30 },
];

/* ---------------- THE FOUR TESTS ---------------- */
export const TEST_INTRO = "Day one, then weeks 5, 9 and 13 — on the Sunday weekly check. Write the eight numbers down. If nothing has moved by week 5, the holds aren't long enough or the exhale isn't happening; fix that before adding anything.";

export const RANGE_TESTS = [
  { id: "t1", n: "90/90 sit", c: C.oxide,
    how: "Both sitting bones on the floor, no hands: yes or no each side, and how many centimetres the back knee sits off the floor.",
    fields: [{ id: "t1_yes_r", n: "Both sitting bones down — right leg front", k: "yn" },
      { id: "t1_yes_l", n: "Both sitting bones down — left leg front", k: "yn" },
      { id: "t1_cm_r", n: "Back knee off the floor — right leg front", k: "cm" },
      { id: "t1_cm_l", n: "Back knee off the floor — left leg front", k: "cm" }] },
  { id: "t2", n: "Deep squat", c: C.brass,
    how: "Heels down, 60 seconds: heels stayed down, thighs below parallel, back flat — three yes-or-nos.",
    fields: [{ id: "t2_heels", n: "Heels stayed down", k: "yn" },
      { id: "t2_depth", n: "Thighs below parallel", k: "yn" },
      { id: "t2_back", n: "Back flat", k: "yn" }] },
  { id: "t3", n: "Wall flexion", c: C.cobalt,
    how: "Back to a wall, heels ten centimetres out, lower back and head on the wall, straight arms raised overhead: do the thumbs reach the wall, and if not, by how many centimetres.",
    fields: [{ id: "t3_yes", n: "Thumbs reach the wall", k: "yn" },
      { id: "t3_cm", n: "If not, the gap", k: "cm" }] },
  { id: "t4", n: "Hands behind the back", c: C.violet,
    how: "One hand over the shoulder, the other up from below: the gap between the fingertips in centimetres, each way round.",
    fields: [{ id: "t4_cm_r", n: "Gap — right hand over the shoulder", k: "cm" },
      { id: "t4_cm_l", n: "Gap — left hand over the shoulder", k: "cm" }] },
];

/* Every centimetre field, in the order they chart. */
export const RANGE_CM = [];
RANGE_TESTS.forEach((t) => t.fields.forEach((f) => { if (f.k === "cm") RANGE_CM.push({ id: f.id, n: t.n + " — " + f.n, c: t.c, test: t.id }); }));

/* ---------------- the RANGE calendar ----------------
   Twelve weeks of RANGE, then THE KEEP for good. Tests on weeks 1, 5,
   9 and 13, and every eight weeks after that. */
export const KEEP_FROM = 13;
export const isKeepWeek = (w) => (w || 1) >= KEEP_FROM;
export const isTestWeek = (w) => { const n = w || 1; return n === 1 || n === 5 || n === 9 || (n >= 13 && (n - 13) % 8 === 0); };

export const rangeTitle = (w) => (isKeepWeek(w) ? "THE KEEP" : "RANGE");
export const rangeMins = (w) => (isKeepWeek(w) ? 10 : 20);
export const rangeLine = (w) => (isKeepWeek(w)
  ? "Ten minutes at home, every evening, for good — the roller extensions, open book, the 90/90 with the lift, the couch stretch, the deep squat hold, the hang and the arm bar."
  : "Twenty minutes at home, every evening. Mid-back first, always; then the hips; then the shoulders. Long holds, contract-relax, strength at the end of the range.");

export const stepsFor = (w, full) => (isKeepWeek(w)
  ? KEEP_STEPS.map((x) => Object.assign({}, x))
  : RANGE_STEPS.map((x) => Object.assign({}, x, { s: full ? x.s : (x.s20 == null ? x.s : x.s20) })));

export const totalOf = (steps) => steps.reduce((a, x) => a + x.s, 0);
