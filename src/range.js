import { C } from "./ui.jsx";
import { ROUTINE_MINS } from "./routines.js";

/* ================================================================
   RANGE — the home block of Fighter v1.5, as data.
   THE MORNING FIVE on waking, RANGE every evening for twelve weeks,
   then THE KEEP, and the four tests every four weeks. Every
   instruction string below is the document's own wording.
   ================================================================ */

export const RANGE_KEYS = { tests: "o8s-range" };   /* { "m1w5": { ...fields } } */

export const RANGE_INTRO = "Two joints you named as your limiting factor: hips and shoulders. Both are limited first by the mid-back, so it goes first. Eight minutes a night was maintenance; this is change. Twenty minutes every evening for twelve weeks, five on waking, four tests every four weeks so the range is a number, then a ten-minute keep for life. Kit: a foam roller, a light band, a kettlebell or dumbbell (8–16 kg), a doorframe pull-up bar if you can fit one, a sofa and a chair.";

export const RANGE_HOW = "How range changes — so you do it right. Stiffness is partly the tissue and mostly the nervous system guarding it. Three things move it, and the eight-minute block did none of them: long holds — ninety seconds to three minutes, breathing slowly out through the nose, because a long exhale is what tells the body it's safe to let go; contract-relax — pushing gently into the stretch for five seconds at a third of your strength, then relaxing and sinking further, three times, which resets the guard directly; and strength at the end of the range, because the body only keeps range it can control. Every joint below gets all three. Never into pain; into a strong stretch, and stay.";

export const RANGE_HIPS = "One line on the hips, worth reading twice. A stretch should pull at the back of the hip, the groin or the front of the thigh. If a deep squat or the 90/90 pinches at the front of the hip, or one side is markedly worse than the other, that's a joint pattern, not a muscle one — get it looked at before the twelve weeks, and we work around it.";

export const RANGE_SKIP = "If you skip it: nothing shows this week. By week 6 the hips tighten back to where they were, the internal-rotation lift stops moving, and the tests say so in numbers. The weekly check asks how many evenings you did it.";

export const KEEP_LINE = "After twelve weeks — THE KEEP · 10 min. The roller extensions, open book, the 90/90 with the lift, the couch stretch, the deep squat hold, the hang and the arm bar. Every evening, for good. The tests every eight weeks.";

/* THE MORNING FIVE, RANGE, the fight-week RANGE, THE KEEP, the movement
   session and the skill block are read card by card from
   home-routines.md: see routines.js. */

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
export const rangeMins = (w) => (isKeepWeek(w) ? ROUTINE_MINS.keep : ROUTINE_MINS.range);
export const rangeLine = (w) => (isKeepWeek(w)
  ? "Ten minutes at home, every evening, for good — the roller extensions, open book, the 90/90 with the lift, the couch stretch, the deep squat hold, the hang and the arm bar."
  : "Twenty minutes at home, every evening. Mid-back first, always; then the hips; then the shoulders. Long holds, contract-relax, strength at the end of the range.");
