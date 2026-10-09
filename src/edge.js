/* ================================================================
   THE EDGE — five additions, on by default, and the one thing that
   puts them back.

   PREP and CAMP both carry it. Each program's data module says which
   weeks each addition runs in (prepEdge, campEdge); this module holds
   the words, the evening row, and the guardrail: two yellow mornings in
   the same week — Tuesday's jump check more than 7% under its four-week
   average counts as one — and the five come off for the rest of that
   week. Not the program — the additions. They come back on the Monday,
   because the count starts again. The tendon gate runs beside it,
   separately from the colours.
   ================================================================ */

export const EDGE_YELLOWS = 2;
export const EDGE_OFF_LINE = "The edge is off this week: two yellow mornings";

export const EDGE_INTRO =
  "Five additions, on by default. None of them is grinding volume; every one is more high-quality exposure at a recovery cost the monitoring can see.";

export const EDGE_GUARDRAIL =
  "Two yellow mornings on the strap in the same week — resting heart rate five over, or HRV twelve percent under — and the five come off for the rest of that week. Not the program: the additions. Tuesday's speed and the Wednesday thirty go first; the clusters become straight sets; the contacts drop back; the rounds go back to six.";

export const TENDON_GATE =
  "Separately from the strap: Achilles or knee at 3 or more on Sunday's check means no reactive jumps the following week, with the tendon holds carried on, and a hamstring at 3 or more means no flying sprints — a sore tendon doesn't show on HRV. And Tuesday's jump check more than 7% under its four-week average counts as a yellow, toward the two that take the Edge off.";

export const EDGE_ITEMS = {
  prep: [
    "Speed twice a week — three flying twenties on Tuesday after the shuttles, from week 11. Build-ups every time. The Nordics never miss.",
    "Cluster sets in the heavy block — five sets of two-plus-two at 87–90%, twenty seconds on the pins between the pairs. Pins set; the velocity rule ends the set.",
    "More plyometric contacts in weeks 11–13 — box jumps 4 × 3 and side bounds 4 × 4; depth jumps held at 4 × 4, because sixteen clean landings beat twenty-five tired ones. The tendon block runs twice a week, the tendon gate applies, and the output rule is law.",
    "Rounds past the fight — seven in the convert block. Scored; the fade governs.",
    "The Wednesday easy thirty — a second base session, walk or run, nose only. Easy, or it comes out.",
  ],
  camp: [
    "Speed twice a week — three flying twenties on Tuesday after the shuttles, from week 6. Build-ups every time. The Nordics never miss.",
    "Cluster sets in the build block — week 4: five sets of two-plus-two at 87%, twenty seconds on the pins between the pairs. Pins set; the velocity rule ends the set.",
    "More plyometric contacts in weeks 6–8 — box jumps 4 × 3 and side bounds 4 × 4; depth jumps held at 4 × 4, because sixteen clean landings beat twenty-five tired ones. The tendon block runs twice a week, the tendon gate applies, and the output rule is law.",
    "Rounds past the fight — eight in weeks 6 and 7, ten once in week 8. Scored; the fade governs.",
    "The Wednesday easy thirty — a second base session, walk or run, nose only. Easy, or it comes out.",
  ],
};

/* ---------------- the tendon gate and the jump check ---------------- */
export const TENDON_LIMIT = 3;
export const JUMP_DROP = 0.07;
/* Last Sunday's joint scores, read into next week's prescription:
   Achilles or knee at 3 or more — no reactive jumps, the tendon holds
   carried on; hamstring at 3 or more — no flying sprints, and the Nordics
   only if they're pain-free. */
export function tendonGate(scores) {
  const n = (x) => (x == null || x === "" || isNaN(Number(String(x).replace(",", "."))) ? null : Number(String(x).replace(",", ".")));
  const ach = n(scores && scores.ach), kn = n(scores && scores.kn), ham = n(scores && scores.ham);
  const noFlying = ham != null && ham >= TENDON_LIMIT;
  return {
    noJumps: (ach != null && ach >= TENDON_LIMIT) || (kn != null && kn >= TENDON_LIMIT),
    noFlying, nordicPF: noFlying,
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

export const SAUNA_BASE = "Fifteen to twenty minutes, twice a week — Sunday and one weekday evening. Heat acclimation raises blood volume and endurance the way nothing else this cheap does. Never straight from the sauna into cold.";

/* the evenings a sauna week puts the sauna on: at most twice a week,
   everywhere — Sunday and one weekday evening */
export const saunaDays = (rx) => (!rx || !rx.sauna ? [] : ["wed", "sun"]);

/* the cluster timer: two reps, twenty seconds on the pins, two more */
export const clusterTimer = (sets, pct, lift) => ({
  kind: "cluster", opt: { sets, lift, pct, rest: 180, pin: 20 }, title: "THE CLUSTERS",
});
