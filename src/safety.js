import { r25 } from "./ui.jsx";

/* ================================================================
   THE OCTOBER REVIEW — the safety rules every program shares

   Optimal 8 · Prep, Optimal 8 · Camp and season-builder.md, as the
   review rewrote them:
     · no released weights — the reactive slot climbs from drop
       landings to low-box depth jumps to depth jumps
     · no true maxes, ever — the heaviest work is a top triple, on pins;
       × 1.08 is the working max
     · the stop rule — rounds past the fight stop below 75% of round one
     · the tendon gate — a sore tendon loses its jumping, keeps its holds
     · the head check — the morning after a fight
   Every word a card shows is the documents' own.
   ================================================================ */

/* ---------------- the reactive slot ---------------- */
export const JUMP_STAGES = ["land", "lowbox", "depth"];
export const JUMPS = {
  land: { n: "Drop Landings", item: "Drop landing", box: "20–30 cm box",
    cue: "Step off a 20–30 cm box, land on both feet soft and silent, hips back and knees over your toes, and hold it dead still for two seconds. No jump: this teaches your knees and tendons to absorb.",
    w: "Stop the set the moment a landing is loud, or your knees cave in." },
  lowbox: { n: "Low-Box Depth Jumps", item: "Low-box depth jump", box: "20 cm box",
    cue: "Step off a 20 cm box and, the instant your feet touch, jump straight up as high as you can.",
    w: "Stop the set the moment a jump is lower than the last, a landing is loud, or your knees cave in." },
  depth: { n: "Depth Jumps", item: "Depth jump", box: "30–40 cm box",
    cue: "Step off a 30–40 cm box and, the instant your feet touch, jump straight up as high as you can — the shortest possible time on the floor.",
    w: "Stop the set the moment a jump is lower than the last, a landing is loud, or your knees cave in." },
};
export const jumpOf = (k) => JUMPS[k] || JUMPS.land;
/* "When it's back under 3, the jumps restart one stage down for a week
   (depth jumps → low-box depth jumps → drop landings)." */
export const stageDown = (k) => JUMP_STAGES[Math.max(0, JUMP_STAGES.indexOf(k) - 1)] || "land";
/* the gentler of two stages */
export const lowerStage = (a, b) => (JUMP_STAGES.indexOf(a) <= JUMP_STAGES.indexOf(b) ? a : b);
export const JUMP_GATE_LINE = "Achilles or knee at 3 or more on Sunday's check: no reactive jumps that week — the tendon holds carry on.";

/* ---------------- the top triple ---------------- */
/* "after the warm-up sets, 50% × 5 → 65% × 3 → 75% × 2 → 85% × 1, then
   sets of three going up 2.5–5% at a time until one is hard but leaves
   one or two in you — pins set, no exceptions; that weight × 1.08 is
   your new working max; then 2 × 2 at 85% of it" */
export const TOP_RAMP = [[50, 5], [65, 3], [75, 2], [85, 1]];
export const TOP_EST = 1.08;
export const TOP_BACKOFF = 85;
export const topMax = (triple) => (triple ? r25(triple * TOP_EST) : null);
export const TOP_CUE = "Sets of three going up 2.5–5% at a time until one is hard but leaves one or two in you — pins set, no exceptions. That weight × 1.08 is your new working max.";
export const TOP_NOT_MAX = "Never a true max: a top triple with one or two in reserve sets the loads without the risk of failing a lift alone.";

/* ---------------- the stop rule ---------------- */
/* "Your fight's own rounds are always finished. After them — and the
   whole second set of the double — if a round drops below 75% of round
   one's output, or your posture goes (traps up by your ears, hands on
   your knees in the rest), that round is the last. The fade is scored
   on the last round finished." */
export const STOP_PCT = 75;
export const STOP_RULE = "Rounds past the fight are capacity work, not punishment. Your fight's own rounds are always finished; after them, if a round drops below 75% of round one's output, or your posture goes, that round is the last. The fade is scored on the last round finished.";
/* The rounds the stop rule watches, in order: { k, label }. R is the
   fight's rounds; total the session's; a double is { a, easy, b }. */
export function stopRounds(R, total, double) {
  const out = [];
  if (double) {
    for (let i = R + 1; i <= double.a; i++) out.push({ k: out.length, label: "FIRST SET · ROUND " + i });
    for (let i = 1; i <= double.b; i++) out.push({ k: out.length, label: "SECOND SET · ROUND " + i });
    return out;
  }
  for (let i = R + 1; i <= total; i++) out.push({ k: out.length, label: "ROUND " + i });
  return out;
}
/* What the logged rounds say: { stopAt, last, done } — stopAt is the
   index of the round that was the last, or -1 while they run on. */
export function stopState(round1, past, form, rounds) {
  const r1 = Number(round1);
  const p = past || [];
  for (let i = 0; i < rounds.length; i++) {
    const v = p[i] == null || p[i] === "" ? null : Number(String(p[i]).replace(",", "."));
    if (form === i) return { stopAt: i, last: v, done: true, why: "form" };
    if (v == null || isNaN(v)) return { stopAt: -1, next: i, done: false };
    if (r1 > 0 && v < r1 * STOP_PCT / 100) return { stopAt: i, last: v, done: true, why: "drop" };
  }
  const lastV = rounds.length ? Number(String(p[rounds.length - 1]).replace(",", ".")) : null;
  return { stopAt: -1, last: isNaN(lastV) ? null : lastV, done: true, why: "all" };
}

/* ---------------- the tendon gate, at the time ---------------- */
/* "Any jump, sprint or hold that hurts more than 3 out of 10 while you
   do it, or is worse the next morning, stops that day; still there
   after two weeks, a physio looks at it." */
export const PAIN_LINE = "Hurts more than 3 out of 10 while you do it, or worse the next morning: it stops for today. Still there after two weeks, a physio looks at it.";
export const PAIN_ENTRIES = {
  "BROAD JUMPS": 1, "BOX JUMPS": 1, "SHUTTLE BURSTS": 1, "STANCE STARTS": 1, "CLOSE AND PLANT": 1, "FLYING SPRINTS": 1,
  "DROP LANDINGS": 1, "LOW-BOX DEPTH JUMPS": 1, "DEPTH JUMPS": 1, "SIDE BOUNDS": 1, "TRAP BAR JUMPS": 1, "BAND-ASSISTED JUMPS": 1,
  "SQUAT CONTRAST CIRCUIT": 1, "HEAVY SLED PUSH": 1, "REPEAT SLED STARTS": 1, "DRIVE HOLDS": 1, "PUNCH-POSITION HOLD": 1,
  "SPANISH SQUAT HOLD": 1, "ACHILLES HOLD": 1, "COPENHAGEN PLANK": 1, "SPEED MICRODOSE": 1, "JUMP CHECK": 1,
  "KNUCKLE HOLD": 1, "NECK FOUR-DIRECTION HOLDS": 1, "NECK PERTURBATION HOLD": 1,
};
export const painRow = (lib) => !!(lib && lib.some((e) => PAIN_ENTRIES[e.n]));

/* ---------------- the head check ---------------- */
export const HEAD_Q = "Stopped, dropped, or any symptoms?";
export const HEAD_SYMPTOMS = "Headache, fogginess, feeling slowed down, dizziness, sensitivity to light or noise.";
export const HEAD_DOCTOR = "See a doctor before any training, and nothing hard until you're cleared and symptom-free. A medical suspension overrides everything here.";
export const HEAD_AE = "A severe or worsening headache, repeated vomiting, confusion or drowsiness is A&E, straight away.";
export const HEAD_WHY = "The app asks the morning after the fight, and the transition doesn't start until you've answered.";
export const HEAD_CLEARED = "A doctor has cleared me, and I'm symptom-free";
