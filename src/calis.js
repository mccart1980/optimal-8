import { C } from "./ui.jsx";

/* ================================================================
   CALISTHENICS — the lines and the levels
   Every line from the Fighter document's Calisthenics page, with its
   levels and its "own it when", in the document's own wording. The
   current level per line is a setting; owning a level records a date.
   ================================================================ */

export const CALIS_INTRO = "Seven lines, each with levels. You own a level when you hit the top of its target for the prescribed sets on two occasions running. Then, and only then, move up. Adding reps at a level always comes before adding difficulty. When you go back to a lower level, that's your warm-up.";

export const CALIS_RULES = [
  "One to two reps in the tank on every set — the grinding lives on Saturday.",
  "Easy weeks (5 and 10): every line at half its sets, no slow lane.",
  "Taper weeks 15–16: holds only — handstand and ring support — nothing to failure, nothing new.",
  "Camp Mode: the handstand at home stays; everything else on this page stops.",
  "Weekly check: shoulders, elbows or wrists at 4 or above out of 10 on Sunday, and next week every line is holds only.",
  "The slow lane's three laws are absolute.",
];

export const SLOW_LAWS = [
  "One: add five seconds to a hold every two weeks, maximum.",
  "Two: twelve weeks minimum at each level, whatever the numbers say.",
  "Three: any ache on the inside of the elbow or the front of the shoulder, during or the next day, and the slow lane rests for two weeks — no exceptions, no negotiating.",
];
export const SLOW_WHY = "Straight-arm work loads the elbow tendons like nothing else, and tendon adapts over months while muscle adapts over weeks; for you, right now, that gap is wider than normal.";

/* The two shapes and the wrist work that open the home skill block. */
export const SKILL_BLOCK = {
  n: "THE SKILL BLOCK · MONDAY TO THURSDAY · 6 MIN",
  when: "after the mobility, before the sit",
  why: "Balance skills are built by frequency. Five minutes of handstand four evenings a week beats an hour of it on one; the wall in your house is a better teacher than any gym.",
  wrists: "Wrists first, always: circles × 10 each way, then palms flat on the floor and rock forward and back × 10.",
  handstand: "Handstand, 4 minutes at your level — the body is one straight line, ribs in, glutes tight, pushing the floor away through the shoulders the whole time.",
  hollow: "Hollow hold, 2 × 20 seconds — on your back, lower back pressed into the floor, arms overhead, legs straight and lifted, one shallow banana. Then arch hold, 2 × 20 seconds — face down, arms and legs lifted. The two shapes every calisthenics skill is made of.",
  planche: "Planche leans, Tuesday and Thursday only, 3 × 15 seconds — a push-up position, then shift the shoulders forward past the wrists as far as they'll go, arms locked, body rigid. The home end of the slow lane: five seconds added per fortnight, never with an elbow that aches.",
};

/* ---------- the seven lines ---------- */
export const LINES = [
  { id: "handstand", n: "HANDSTAND", where: "home, Mon–Thu", day: "home", c: C.brass, home: 1,
    hold: "The wall hold at your level, nothing to failure, nothing new — the handstand is one of the two things that stay in a taper week.",
    levels: [
      { l: "1", what: "Wall walk-ups, 3 × 3, each hold 10 seconds", own: "3 × 3 clean" },
      { l: "2", what: "Chest-to-wall hold, toes touching, hands a foot from the wall, 3 × 30 seconds", own: "3 × 45 seconds" },
      { l: "3", what: "Back-to-wall kick-ups, pull one heel off and balance, 10 kick-ups; plus chest-to-wall shoulder taps 3 × 6", own: "5 seconds of balance on most kick-ups" },
      { l: "4", what: "Freestanding attempts in open space, 10 kick-ups; then 3 × 30 seconds chest-to-wall", own: "A 10-second freestanding hold three times in a session" },
      { l: "5", what: "Wall handstand push-up negatives, head to floor over 5 seconds, 3 × 3 (Tuesday and Thursday only); freestanding holds other evenings", own: "3 × 5 negatives at 5 seconds" },
      { l: "6", what: "Wall handstand push-ups, 3 × 3–5, full range (Tuesday and Thursday only)", own: "3 × 8" },
      { l: "7", what: "Freestanding handstand push-ups — years, and only with a 60-second freestanding hold", own: "—" },
    ] },
  { id: "ringdip", n: "RING DIPS", where: "Monday", day: "mon", c: C.oxide,
    hold: "Ring support hold, 3 × 20 seconds at the top, arms locked, rings still — the ring support is the other thing that stays in a taper week.",
    levels: [
      { l: "1", what: "Bar dips 3 × 5, chest forward, shoulders down (bench dips 3 × 10 if a bar dip isn't there yet)", own: "3 × 10 bar dips" },
      { l: "2", what: "Ring support hold, 3 × 20 seconds at the top, arms locked, rings still; then bar dips 3 × 8", own: "3 × 40 seconds dead still" },
      { l: "3", what: "Ring dip negatives, 3 × 5, lowering over 5 seconds", own: "3 × 5 at 5 seconds" },
      { l: "4", what: "Ring dips, 3 × 5–8, full depth, rings turned out at the top", own: "3 × 10" },
      { l: "5", what: "Weighted ring dips, 3 × 5, +2.5 kg when 3 × 8 is clean", own: "+20 kg for 3 × 5" },
    ] },
  { id: "muscleup", n: "THE MUSCLE-UP LINE", where: "Monday, 2 sets after the chins", day: "mon", c: C.oxide,
    levels: [
      { l: "1", what: "Chest-to-bar pull-ups, 2 × 5, explosive, bar touches the chest", own: "2 × 8" },
      { l: "2", what: "Muscle-up negatives, 2 × 3 — jump to the top, lower through the transition to a dead hang over 5 seconds", own: "2 × 5 at 5 seconds" },
      { l: "3", what: "Bar muscle-ups, 2 × 3, a band under the feet for the first weeks", own: "2 × 5 strict" },
      { l: "4", what: "Ring muscle-ups, 2 × 3, false grip", own: "2 × 5" },
    ] },
  { id: "ringrow", n: "RING ROWS", where: "Wednesday", day: "wed", c: C.oxide,
    levels: [
      { l: "1", what: "Ring rows, 3 × 8, body straight, feet on the floor, pause at the chest", own: "3 × 12 near horizontal" },
      { l: "2", what: "Feet-elevated ring rows, 3 × 8, rings turned out at the chest", own: "3 × 12" },
      { l: "3", what: "Archer rows, 3 × 5 per side", own: "3 × 8 per side" },
      { l: "4", what: "One-arm ring row progressions — the other hand on the rope, then off", own: "3 × 5 per side" },
    ] },
  { id: "pistol", n: "THE PISTOL LINE", where: "Tuesday, 2 sets per leg, light", day: "tue", c: C.cobalt,
    levels: [
      { l: "1", what: "Box pistol, 2 × 5 per leg, lowering the box over the weeks", own: "Clean to a knee-height box" },
      { l: "2", what: "Assisted pistol, fingertips on a post, full depth, 2 × 5 per leg", own: "2 × 8 per leg, fingertips only" },
      { l: "3", what: "Pistol squat, 2 × 5 per leg, heel down, chest up", own: "2 × 8 per leg" },
      { l: "4", what: "Weighted pistol, a kettlebell at the chest, 2 × 5 per leg", own: "2 × 5 with 16 kg" },
      { l: "Alt", what: "Shrimp squat, 2 × 5 per leg — hold the back foot behind you, sink until the back knee touches, stand", own: "2 × 8 per leg" },
    ] },
  { id: "lsit", n: "THE L-SIT LINE", where: "Sunday", day: "sun", c: C.brass,
    levels: [
      { l: "1", what: "Tuck L-sit, 3 × 10 seconds", own: "3 × 20 seconds" },
      { l: "2", what: "One-leg L-sit, 3 × 10 seconds per side", own: "3 × 20 seconds per side" },
      { l: "3", what: "L-sit, 3 × 10 seconds, legs straight, toes pointed", own: "3 × 20 seconds" },
      { l: "4", what: "L-sit on the floor, 3 × 15 seconds; hanging L raises 3 × 8", own: "3 × 30 seconds" },
      { l: "5", what: "V-sit progressions — months", own: "—" },
    ] },
  /* The slow lane is one line with three progressions running in step: the
     Sunday lever alternates front and back week by week, and the planche
     leans are its home end on Tuesday and Thursday. The level is the step
     you are on, and the three laws govern when it moves. */
  { id: "slowlane", n: "THE SLOW LANE", where: "one lever hold on Sunday; planche leans at home Tuesday and Thursday", day: "sun", c: C.violet, slow: 1,
    own: "Twelve weeks minimum at each level, whatever the numbers say — and five seconds added to a hold every two weeks, maximum.",
    levels: [
      { l: "1", front: "Scapular pulls 3 × 10", back: "Skin the cat 3 × 3", planche: "Leans 3 × 15 s" },
      { l: "2", front: "Tuck front lever 3 × 10 s", back: "German hang 3 × 20 s", planche: "Leans 3 × 30 s" },
      { l: "3", front: "Advanced tuck — back flat", back: "Tuck back lever 3 × 10 s", planche: "Feet-elevated leans" },
      { l: "4", front: "One leg", back: "One leg", planche: "Tuck planche on parallettes 3 × 5 s" },
      { l: "5", front: "Straddle", back: "Straddle", planche: "Advanced tuck" },
      { l: "6", front: "Full", back: "Full", planche: "Straddle" },
    ] },
];

export const FRONT_LEVER_LINE = "Front lever: scapular pulls 3 × 10 → tuck front lever 3 × 10 s → advanced tuck (back flat) → one leg → straddle → full. A two-to-four-year skill.";
export const BACK_LEVER_LINE = "Back lever: skin the cat 3 × 3 → German hang 3 × 20 s → tuck back lever 3 × 10 s → one leg → straddle → full. Do not force the German hang; shoulders open over months.";
export const PLANCHE_LINE = "Planche: leans 3 × 15 s → 3 × 30 s → feet-elevated leans → tuck planche on parallettes 3 × 5 s → advanced tuck → straddle. The longest road in calisthenics. The leans are most of the benefit for a fighter.";

export const SUNDAY_LEVER = "One lever per Sunday, rotating week by week: the tuck front lever (hang from the bar, pull the shoulder blades down, knees to the chest, body horizontal, face up); then skin the cat and the German hang (rotate backward through the arms from a hang until the feet drop toward the floor, and hang there with the shoulders stretched — face down, the start of the back lever); then, at home in the week, the planche leans. Ten seconds a hold to start.";

/* ---------- helpers ---------- */
export const lineById = (id) => LINES.find((x) => x.id === id) || null;
export const DEF_CALIS = () => ({ lvl: {}, owned: {} });

/* The level a line is set to, as { i, l, what, own, … }. */
export function curLevel(calis, id) {
  const L = lineById(id); if (!L) return null;
  const raw = calis && calis.lvl ? Number(calis.lvl[id]) : 0;
  const i = Math.max(0, Math.min(L.levels.length - 1, isNaN(raw) ? 0 : raw));
  return Object.assign({ i }, L.levels[i]);
}
export const ownedDate = (calis, id, i) => (calis && calis.owned && calis.owned[id] ? calis.owned[id][i] || null : null);

/* What this line's prescription reads as, at a level and in a week. */
export function levelText(id, lev, week) {
  const L = lineById(id); if (!L || !lev) return "";
  if (!L.slow) return lev.what;
  const front = (week || 1) % 2 === 1;
  return (front ? "SUNDAY, FRONT LEVER · " + lev.front : "SUNDAY, BACK LEVER · " + lev.back) + " · AT HOME, TUE + THU · " + lev.planche;
}

/* full · half (easy weeks) · holds (taper, or a joint at 4+) · camp (stopped) */
export function calMode(rx, taper, jointFlag) {
  if (rx && rx.camp) return "camp";
  if (taper || (rx && rx.tp)) return "holds";
  if (jointFlag) return "holds";
  if (rx && rx.dl) return "half";
  return "full";
}
export const MODE_LINE = {
  full: null,
  half: "EASY WEEK — every line at half its sets, no slow lane.",
  holds: "HOLDS ONLY — handstand and ring support. Nothing to failure, nothing new.",
  camp: "CAMP MODE — the handstand at home stays; everything else on this page stops.",
};
