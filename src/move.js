import { C, num, parseISO, mondayOf, iso } from "./ui.jsx";
import { isTestWeek } from "./range.js";

/* ================================================================
   OPTIMAL 8 · MOVE — as data

   optimal-8-move.md, as the app runs it. Twelve weeks beside Strength,
   Power and Physique: a movement block every gym morning in place of
   the warm-up, RANGE five evenings, Session A on Wednesday evening and
   Session B on Sunday evening. Three phases (RESTORE, BUILD, OWN), the
   fifteen standards in weeks 1, 5, 9 and 13 and every eight weeks
   after, and a level on every move that has them. RANGE stays at full
   dose until the range standards are met; then THE KEEP.
   ================================================================ */

export const MOVE_NAME = "Optimal 8 · Move";
/* week 1: the Monday it went in, unless Settings says otherwise */
export const MOVE_SINCE = "2026-11-16";
export const MOVE_PROGRAM_INTRO = "Twelve weeks to give you the best range of movement you can have in every joint, and to make you strong in every position you can get into: hips, lower back, mid-back, shoulders, knees, ankles and feet, neck and wrists, with balance, landing and getting up and down. Get there, own it, load it.";

/* the MOVE week a Monday falls in: none before it starts */
export const moveWeekOf = (mon, start) => {
  if (!mon || !start) return null;
  const a = iso(mondayOf(parseISO(start))), b = iso(mondayOf(parseISO(mon)));
  if (b < a) return null;
  return Math.round((parseISO(b) - parseISO(a)) / 604800000) + 1;
};
/* weeks 1–4 RESTORE, 5–8 BUILD, 9–12 OWN; OWN carries on after week 12 */
export const movePhase = (mw) => (!mw ? null : mw <= 4 ? "restore" : mw <= 8 ? "build" : "own");
export const MOVE_PH = {
  restore: { n: "RESTORE", c: C.moss, line: "Open every joint's range and own it with bodyweight. The lower back trained still. Tendons start loading." },
  build: { n: "BUILD", c: C.brass, line: "Load the end of every range. The back extension goes full range. Holds get longer." },
  own: { n: "OWN", c: C.oxide, line: "Strong in every position: heavier end-range loads, balance under load, the Jefferson curl once its gate is passed." },
};
/* the standards: weeks 1, 5, 9 and 13, then every eight weeks */
export const isMoveTestWeek = (mw) => !!mw && isTestWeek(mw);

/* ---------------- THE LEVELS ----------------
   Every move with levels starts at level 1. You own a level when the
   whole prescription is clean, no pain over 2 out of 10, two sessions
   running; then up. The pain rule takes it down. Kept in the log under
   LEVEL_KEY, by move. */
export const LEVEL_KEY = "move-lv";
export const LEVELS = {
  mv_9090: { n: "90/90 hip switches", l: ["Hands on the floor behind you", "Arms folded", "Arms folded, the back foot lifted for 3 seconds at each side"] },
  mv_cossack: { n: "Cossack squats", l: ["Holding a rack upright", "No support", "8–12 kg held at your chest", "16–20 kg", "24 kg or more"] },
  mv_birddog: { n: "Bird dog", l: ["6-second holds", "10-second holds", "10 seconds, drawing small squares with the hand and the foot"] },
  mv_spanish: { n: "Spanish squat hold", l: ["A quarter squat", "A heavier band", "Thighs level with the floor"] },
  mv_pry: { n: "Goblet squat pry", l: ["Holding a post with one hand", "The weight, heels flat", "45 seconds"] },
  mv_airplane: { n: "Hip airplanes", l: ["A hand on the rack", "No hand", "A 5 kg plate held at your chest"] },
  mv_elbow: { n: "Elbow to the ceiling", l: ["On all fours", "Kneeling on one knee, a light plate at your chest"] },
  mv_calfhold: { n: "Single-leg calf hold", l: ["Bodyweight", "A 10 kg dumbbell in the same hand", "20 kg", "30 kg"] },
  mv_getup: { n: "Turkish get-up", l: ["No weight: a shoe balanced on your fist", "8 kg", "12 kg", "16 kg", "20 kg"] },
  mv_copen: { n: "Copenhagen plank", l: ["Knee on the bench", "Ankle on the bench"] },
  mv_curlup: { n: "McGill curl-up", l: ["Elbows on the floor", "Elbows lifted", "Elbows lifted, a deep breath in and out during each hold"] },
  mv_bridge: { n: "Side bridge", l: ["From your knees", "From your feet", "Rolling through a front plank to the other side"] },
  mv_floor: { n: "Floor to standing", l: ["One hand", "No hands"] },
  mv_balance: { n: "One-leg balance", l: ["Eyes open", "Eyes closed", "Eyes closed, on a folded towel"] },
  mv_rnordic: { n: "Reverse Nordic", l: ["A short lean, about a quarter of the way", "Halfway", "As far as you can still pull back up from"] },
  mv_squat: { n: "Deep squat", l: ["Holding a post", "Hands free", "Both arms overhead for the last 30 seconds"] },
  mv_kneel: { n: "90/90 to kneeling", l: ["Hands down", "No hands", "No hands, a 3-second hold kneeling tall"] },
  mv_slr: { n: "Straight-leg lift-offs", l: ["Hands beside your hips", "Hands beside your knees", "Hands off the floor"] },
  mv_turnout: { n: "Turn-out lifts", l: ["No weight", "A 1 kg weight in the hand"] },
  mv_ktw: { n: "Loaded knee to wall", l: ["No weight", "10 kg", "20 kg"] },
  mv_scalf: { n: "Single-leg calf raise", l: ["Bodyweight", "A 10 kg dumbbell in the same hand"] },
};
export const levelOf = (lv, id) => { const L = LEVELS[id]; if (!L) return null;
  const n = Math.round(Number((lv || {})[id]) || 1); return Math.max(1, Math.min(L.l.length, n)); };
export const levelLine = (lv, id) => { const L = LEVELS[id]; if (!L) return "";
  const n = levelOf(lv, id); return "LEVEL " + n + " OF " + L.l.length + " — " + L.l[n - 1]; };
/* one level up or down, kept inside the move's levels */
export const stepLevel = (lv, id, by) => { const L = LEVELS[id]; if (!L) return lv || {};
  return Object.assign({}, lv || {}, { [id]: Math.max(1, Math.min(L.l.length, levelOf(lv, id) + by)) }); };

/* ---------------- THE FIFTEEN STANDARDS ----------------
   fields: k "n" a number, "yn" yes or no. range: one of the range
   standards that let RANGE drop to THE KEEP. gym: entered in Sunday's
   session, not on the sheet. */
const all = (g, ids, ok) => ids.every((id) => { const v = g(id); return v !== "" && v != null && ok(v); });
const atLeast = (x) => (v) => num(v) != null && num(v) >= x;
const yes = (v) => v === "y";
export const MOVE_TESTS = [
  { id: "s1", n: "Floor to standing", area: "Getting up", tgt: "10 out of 10",
    how: "Sit cross-legged on the floor, then stand up. Score 10, and lose a point for each hand, knee or lean you use.",
    fields: [{ id: "mv1", n: "Score out of 10", k: "n" }], met: (g) => all(g, ["mv1"], atLeast(10)) },
  { id: "s2", n: "One leg, eyes closed", area: "Balance", tgt: "20 s each leg",
    how: "Arms folded, eyes closed, stand on one leg. The time until the other foot touches or your arms come out.",
    fields: [{ id: "mv2_r", n: "Right leg (seconds)", k: "n" }, { id: "mv2_l", n: "Left leg (seconds)", k: "n" }], met: (g) => all(g, ["mv2_r", "mv2_l"], atLeast(20)) },
  { id: "s3", n: "Deep squat", area: "Hips, knees, ankles", tgt: "2 min", range: 1,
    how: "No weight, no hands. Sit to the bottom of a squat, heels down and chest up. The time you hold it.",
    fields: [{ id: "mv3", n: "Seconds at the bottom", k: "n" }], met: (g) => all(g, ["mv3"], atLeast(120)) },
  { id: "s4", n: "90/90", area: "Hips", tgt: "Both sides, and the switch", range: 1,
    how: "Sit in the 90/90 with both sitting bones on the floor, each side; then switch sides with no hands.",
    fields: [{ id: "mv4_r", n: "Both sitting bones down — right leg in front", k: "yn" }, { id: "mv4_l", n: "Both sitting bones down — left leg in front", k: "yn" },
      { id: "mv4_sw", n: "Switch sides with no hands", k: "yn" }], met: (g) => all(g, ["mv4_r", "mv4_l", "mv4_sw"], yes) },
  { id: "s5", n: "Toe touch", area: "Hips, lower back", tgt: "Palms flat", range: 1,
    how: "Feet together, knees straight. Fold forward and reach for the floor.",
    fields: [{ id: "mv5", n: "Palms flat on the floor", k: "yn" }, { id: "mv5_cm", n: "If not, fingertips to the floor (cm; 0 = touching)", k: "n" }],
    met: (g) => yes(g("mv5")) },
  { id: "s6", n: "Wall overhead", area: "Shoulders", tgt: "Thumbs touch the wall", range: 1,
    how: "Back, head and bottom against a wall. Straight arms up overhead without your lower back leaving the wall.",
    fields: [{ id: "mv6", n: "Thumbs touch the wall, lower back flat", k: "yn" }, { id: "mv6_cm", n: "If not, the gap (cm)", k: "n" }], met: (g) => yes(g("mv6")) },
  { id: "s7", n: "Hands behind the back", area: "Shoulders", tgt: "Fingertips touch, both ways", range: 1,
    how: "One hand over the shoulder, the other up from below. The gap between the fingertips: 0 when they touch.",
    fields: [{ id: "mv7_r", n: "Gap — right hand over the shoulder (cm)", k: "n" }, { id: "mv7_l", n: "Gap — left hand over the shoulder (cm)", k: "n" }],
    met: (g) => all(g, ["mv7_r", "mv7_l"], (v) => num(v) != null && num(v) <= 0) },
  { id: "s8", n: "Knee to wall", area: "Ankles", tgt: "12 cm each side", range: 1,
    how: "Foot flat, toes at a mark, knee driven forward to touch the wall without the heel lifting. Move the foot back until it can't: that distance.",
    fields: [{ id: "mv8_r", n: "Right foot (cm)", k: "n" }, { id: "mv8_l", n: "Left foot (cm)", k: "n" }], met: (g) => all(g, ["mv8_r", "mv8_l"], atLeast(12)) },
  { id: "s9", n: "Dead hang", area: "Grip, shoulders", tgt: "60 s",
    how: "Hang from the bar, arms straight, feet off the floor, as long as you can.",
    fields: [{ id: "mv9", n: "Seconds", k: "n" }], met: (g) => all(g, ["mv9"], atLeast(60)) },
  { id: "s10", n: "Single-leg calf raise", area: "Achilles", tgt: "25 each leg",
    how: "On the flat, one foot, all the way up each time. As many as you can.",
    fields: [{ id: "mv10_r", n: "Right leg (reps)", k: "n" }, { id: "mv10_l", n: "Left leg (reps)", k: "n" }], met: (g) => all(g, ["mv10_r", "mv10_l"], atLeast(25)) },
  { id: "s11", n: "Back hold", area: "Lower back", tgt: "3 min", gym: 1,
    how: "In Sunday's session, in the back extension's slot: on the 45-degree back extension, body straight, arms crossed, as long as you can.",
    fields: [{ id: "mv11", n: "Seconds", k: "n" }], met: (g) => all(g, ["mv11"], atLeast(180)) },
  { id: "s12", n: "Couch position", area: "Hips", tgt: "60 s each side", range: 1,
    how: "Back knee on a cushion against the sofa, front foot flat, buttock squeezed. Chest fully upright for 60 seconds, lower back not arched.",
    fields: [{ id: "mv12_r", n: "Right knee down", k: "yn" }, { id: "mv12_l", n: "Left knee down", k: "yn" }], met: (g) => all(g, ["mv12_r", "mv12_l"], yes) },
  { id: "s13", n: "Seated turn", area: "Mid-back", tgt: "60° each way", range: 1,
    how: "Sit on the floor, legs straight, a stick across your shoulders. Turn as far as you can each way; film it from above and read the angle.",
    fields: [{ id: "mv13_r", n: "To the right (degrees)", k: "n" }, { id: "mv13_l", n: "To the left (degrees)", k: "n" }], met: (g) => all(g, ["mv13_r", "mv13_l"], atLeast(60)) },
  { id: "s14", n: "Neck turn", area: "Neck", tgt: "Chin in line with the shoulder",
    how: "Sitting tall, turn your head as far as it goes each way.",
    fields: [{ id: "mv14_r", n: "To the right", k: "yn" }, { id: "mv14_l", n: "To the left", k: "yn" }], met: (g) => all(g, ["mv14_r", "mv14_l"], yes) },
  { id: "s15", n: "Wrist bend", area: "Wrists", tgt: "A right angle, pain-free", range: 1,
    how: "On all fours, palms flat, fingers forward, arms straight. Move your shoulders forward past your hands until the wrists are bent to a right angle.",
    fields: [{ id: "mv15_r", n: "Right hand", k: "yn" }, { id: "mv15_l", n: "Left hand", k: "yn" }], met: (g) => all(g, ["mv15_r", "mv15_l"], yes) },
];
export const MOVE_TEST_IDS = [].concat(...MOVE_TESTS.map((t) => t.fields.map((f) => f.id)));
/* every range standard met: RANGE can drop to THE KEEP */
export const rangeStandardsMet = (g) => MOVE_TESTS.filter((t) => t.range).every((t) => t.met(g));
/* one standard, as one line: "8 · 12 s", "YES", "—" */
export const testSummary = (t, g) => {
  const vals = t.fields.filter((f) => !/_cm$/.test(f.id) || t.fields.length === 1).map((f) => { const v = g(f.id);
    return f.k === "yn" ? (v === "y" ? "YES" : v === "n" ? "NO" : "—") : (v === "" || v == null ? "—" : String(v)); });
  return vals.join(" · ");
};

/* THE JEFFERSON CURL'S GATE: a back hold of 2 minutes or more, fingertips
   reaching the floor, and four weeks with no back pain at all */
export const jeffersonGate = ({ backHold, palms, toeCm, backScores }) =>
  num(backHold) != null && num(backHold) >= 120
  && (palms === "y" || (num(toeCm) != null && num(toeCm) <= 0))
  && Array.isArray(backScores) && backScores.length >= 4 && backScores.slice(0, 4).every((s) => num(s) === 0);
