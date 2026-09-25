/* ================================================================
   THE EDGE — seven additions, on by default, and the one thing that
   puts them back.

   PREP and CAMP both carry it. Each program's data module says which
   weeks each addition runs in (prepEdge, campEdge); this module holds
   the words, the two evening rows, and the guardrail: two yellow
   mornings in the same week and the seven come off for the rest of
   that week. Not the program — the additions. They come back on the
   Monday, because the count starts again.
   ================================================================ */

export const EDGE_YELLOWS = 2;
export const EDGE_OFF_LINE = "The edge is off this week: two yellow mornings";

export const EDGE_INTRO =
  "Seven additions, on by default. None of them is grinding volume; every one is more high-quality exposure at a recovery cost the monitoring can see.";

export const EDGE_GUARDRAIL =
  "Two yellow mornings on the strap in the same week — resting heart rate five over, or HRV twelve percent under — and the seven come off for the rest of that week. Not the program: the additions. Tuesday's speed and the Wednesday thirty go first; the clusters become straight sets; the contacts drop back; the microdoses stop; the rounds go back to six.";

export const EDGE_ITEMS = {
  prep: [
    "Speed twice a week — three flying twenties on Tuesday after the shuttles, weeks 11–13.",
    "Cluster sets in the heavy block — week 8: five sets of two-plus-two at 87–90%, twenty seconds on the pins between the pairs.",
    "Plyometric contacts up by half in weeks 11–13 — depth jumps 5 × 5, box jumps 4 × 3, side bounds 4 × 4.",
    "Evening power microdoses Monday and Wednesday, five minutes before RANGE.",
    "Rounds past the fight — seven in weeks 11–13.",
    "The Wednesday easy thirty — a second base session, walk or run, nose only.",
    "Sauna four times a week in weeks 11–13 — Sunday, Tuesday, Thursday and Saturday evenings.",
  ],
  camp: [
    "Speed twice a week — three flying twenties on Tuesday after the shuttles, weeks 6–8.",
    "Cluster sets in the build block — week 4: five sets of two-plus-two at 87%, twenty seconds on the pins between the pairs.",
    "Plyometric contacts up by half in weeks 6–8 — depth jumps 5 × 5, box jumps 4 × 3, side bounds 4 × 4.",
    "Evening power microdoses Monday and Wednesday, five minutes before RANGE.",
    "Rounds past the fight — eight in weeks 6 and 7, ten once in week 8.",
    "The Wednesday easy thirty — a second base session, walk or run, nose only.",
    "Sauna four times a week in weeks 6–8 — Sunday, Tuesday, Thursday and Saturday evenings.",
  ],
};

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

/* ---------------- the two evening rows ---------------- */
export const MICRODOSE = {
  n: "The power microdose",
  tag: "5 MIN · BEFORE RANGE",
  rows: [
    { n: "Pogo hops", s: "3 × 15", how: "Bouncing on the balls of the feet, legs almost straight, quick off the floor." },
    { n: "Tuck jumps", s: "3 × 3", how: "Jump, knees to the chest, land soft, reset." },
  ],
  why: "Nothing tired, nothing at the end of a set that's slower than the start. Rate of force development is built by how often the nervous system is asked; five exposures a week beats three. Joints under four on the check.",
};

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
