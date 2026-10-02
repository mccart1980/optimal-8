/* ================================================================
   THE EDGE — six additions, on by default, and the one thing that
   puts them back.

   PREP and CAMP both carry it. Each program's data module says which
   weeks each addition runs in (prepEdge, campEdge); this module holds
   the words, the evening row, and the guardrail: two yellow mornings in
   the same week — Tuesday's jump check more than 7% under its four-week
   average counts as one — and the six come off for the rest of that
   week. Not the program — the additions. They come back on the Monday,
   because the count starts again. The tendon gate runs beside it,
   separately from the colours.
   ================================================================ */

export const EDGE_YELLOWS = 2;
export const EDGE_OFF_LINE = "The edge is off this week: two yellow mornings";

export const EDGE_INTRO =
  "Six additions, on by default. None of them is grinding volume; every one is more high-quality exposure at a recovery cost the monitoring can see.";

export const EDGE_GUARDRAIL =
  "Two yellow mornings on the strap in the same week — resting heart rate five over, or HRV twelve percent under — and the six come off for the rest of that week. Not the program: the additions. Tuesday's speed and the Wednesday thirty go first; the clusters become straight sets; the contacts drop back; the rounds go back to six.";

export const TENDON_GATE =
  "Separately from the strap: Achilles or knee at 3 or more on Sunday's check means no depth jumps the following week, and a hamstring at 3 or more means no flying sprints — a sore tendon doesn't show on HRV. And Tuesday's jump check more than 7% under its four-week average counts as a yellow, toward the two that take the Edge off.";

export const EDGE_ITEMS = {
  prep: [
    "Speed twice a week — three flying twenties on Tuesday after the shuttles, weeks 11–13.",
    "Cluster sets in the heavy block — week 8: five sets of two-plus-two at 87–90%, twenty seconds on the pins between the pairs.",
    "More plyometric contacts in weeks 11–13 — box jumps 4 × 3 and side bounds 4 × 4; depth jumps held at 4 × 4.",
    "Rounds past the fight — seven in weeks 11–13.",
    "The Wednesday easy thirty — a second base session, walk or run, nose only.",
    "Sauna four times a week in weeks 11–13 — Sunday, Tuesday, Thursday and Saturday evenings.",
  ],
  camp: [
    "Speed twice a week — three flying twenties on Tuesday after the shuttles, weeks 6–8.",
    "Cluster sets in the build block — week 4: five sets of two-plus-two at 87%, twenty seconds on the pins between the pairs.",
    "More plyometric contacts in weeks 6–8 — box jumps 4 × 3 and side bounds 4 × 4; depth jumps held at 4 × 4.",
    "Rounds past the fight — eight in weeks 6 and 7, ten once in week 8.",
    "The Wednesday easy thirty — a second base session, walk or run, nose only.",
    "Sauna four times a week in weeks 6–8 — Sunday, Tuesday, Thursday and Saturday evenings.",
  ],
};

/* ---------------- the tendon gate and the jump check ---------------- */
export const TENDON_LIMIT = 3;
export const JUMP_DROP = 0.07;
/* Last Sunday's joint scores, read into next week's prescription:
   Achilles or knee at 3 or more — no depth jumps; hamstring at 3 or more —
   no flying sprints. */
export function tendonGate(scores) {
  const n = (x) => (x == null || x === "" || isNaN(Number(x)) ? null : Number(x));
  const ach = n(scores && scores.ach), kn = n(scores && scores.kn), ham = n(scores && scores.ham);
  return {
    noDepth: (ach != null && ach >= TENDON_LIMIT) || (kn != null && kn >= TENDON_LIMIT),
    noFlying: ham != null && ham >= TENDON_LIMIT,
  };
}
/* Tuesday's best jump against the average of the four Tuesdays before it:
   more than 7% under is a yellow. Null until there is a number to read. */
export function jumpYellow(best, previous) {
  const b = Number(best);
  const prev = (previous || []).map(Number).filter((x) => x > 0).slice(-4);
  if (!(b > 0) || !prev.length) return false;
  const avg = prev.reduce((a, x) => a + x, 0) / prev.length;
  return b < avg * (1 - JUMP_DROP);
}

/* The day the edge comes off from: the index (Monday 0) of the second
   yellow morning in the week, or -1 while there has not been one. A red
   morning is a yellow morning and worse, so it counts. */
export function edgeCutIndex(levels) {
  let n = 0;
  for (let i = 0; i < (levels || []).length; i++) {
    const l = levels[i];
    if (l === "Y" || l === "R") { n++; if (n >= EDGE_YELLOWS) return i; }
  }
  return -1;
}

/* ---------------- the evening row ---------------- */
export const EASY_THIRTY = {
  n: "The Wednesday easy thirty",
  tag: "30 MIN · NOSE ONLY",
  s: "Thirty minutes easy, nose only, walk or run, conversational.",
  why: "The second base session of the week — the hard sessions get their recovery from the easy ones. Easy, or it comes out.",
};

export const SAUNA_EDGE = "Fifteen to twenty minutes — the full heat-acclimation dose, four evenings this week: Sunday, Tuesday, Thursday and Saturday. The hydration schedule's sauna line every time. Never straight from the sauna into cold.";
export const SAUNA_BASE = "Fifteen to twenty minutes, twice a week — Sunday and one weekday evening. Heat acclimation raises blood volume and endurance the way nothing else this cheap does. Never straight from the sauna into cold.";

/* the evenings a sauna week puts the sauna on */
export const saunaDays = (rx) => (!rx || !rx.sauna ? [] : rx.edge && rx.sauna4 ? ["tue", "thu", "sat", "sun"] : ["wed", "sun"]);

/* the cluster timer: two reps, twenty seconds on the pins, two more */
export const clusterTimer = (sets, pct, lift) => ({
  kind: "cluster", opt: { sets, lift, pct, rest: 180, pin: 20 }, title: "THE CLUSTERS",
});
