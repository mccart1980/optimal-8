/* ================================================================
   THE AUDIT OF 19 NOVEMBER 2026 — the pieces every program shares.

   Its changes run from the week of Monday 23 November 2026: a week's
   prescription carries `au` when its Monday is that day or later, and
   every page of a week before it reads exactly as it did. Strength,
   Power and Physique's own changes are in spp.js; Prep's, the camp's
   and Fighter's are on their own pages, each behind `au`.
   ================================================================ */
export const AUDIT_SINCE = "2026-11-23";
/* a week, by its Monday: the switch's week or a later one */
export const auditOn = (mon) => !!mon && String(mon) >= AUDIT_SINCE;

/* Spleeft on the fast lifts: a speed after every rep, a 10% drop ends the set */
export const SPLEEFT_FAST = "Spleeft on your wrist: read the speed after every rep. A rep 10% slower than the set's fastest ends the set.";
export const SPLEEFT_ARM = "Spleeft reads the arm the watch is on: that side first, the speed read after every rep. A rep 10% slower than the set's fastest ends the set, and the other side does the same reps.";

/* THE ROUNDS, with the SkiErg out: the first third of every round is the
   assault bike with the arms only, feet on the pegs; the second is the
   bike, arms and legs; the bike's screen runs through both, so a round
   logs one number, its calories */
export const ARMS_THIRD = "Assault bike, arms only — feet on the pegs";
export const BIKE_THIRD = "Assault bike, arms and legs";
export const ROUNDS_LIB = "THE ROUNDS, ARMS-ONLY FIRST THIRD";
export const ERG_ROUNDS_LIB = "ROUNDS ON THE BIKE";
export const T20_LIB = "THE 20-MINUTE TEST ON THE BIKE";
export const bikeFields = (rd) => [{ k: "cal", l: rd + " · BIKE (CAL)" }];

/* THE ONE-ARM LANDMINE PUSH PRESS, in the barbell push press's place in
   Prep, the camp and Fighter: the legs start the bar and one arm finishes
   it, up and forward, with no bar pressed straight overhead. The week's
   own sets and reps, each side; by weight and reps, every rep fast — no
   working max, no percentage, no profile. `o`: id (the log key), m (the
   minutes of the card it replaces: the time doesn't change), and sets and
   reps (the week's own; no sets, no card). */
export const LM_PUSH_CUE = "The landmine press with a leg drive: the end of the bar at your shoulder, split stance, the opposite foot forward. A quick dip of the knees, then drive hard with the legs and punch the bar up and forward to a straight arm. Lower it under control and reset. Log the weight you add to the bar.";
export const lmPush = (o) => {
  const line = (rx) => o.sets(rx) + " × " + o.reps(rx) + " each side · every rep fast";
  return { L: "LM", n: "One-Arm Landmine Push Press", since: AUDIT_SINCE, m: o.m, hard: 1,
    spd: 1, spdLine: SPLEEFT_ARM, rest: "Rest 2:00", rt: 120, hide: (rx) => !rx.au || !o.sets(rx),
    rxLine: line,
    items: (rx) => [{ n: "One-arm landmine push press", s: line(rx), cue: LM_PUSH_CUE, id: o.id, k: "wr", sets: o.sets(rx), reps: o.reps(rx) + "/side" }],
    w: "Every rep as fast as you can make it. " + SPLEEFT_ARM,
    why: "Legs, braced trunk, one hand: the week's fast press, with no bar pressed straight overhead." };
};

/* THE MORNING PRIMER, the camp's last morning and its rehearsal: ten
   minutes of jumps and throws, hours before the rounds. `pfx` keeps the
   two days' ticks apart; `what` is what the morning is ahead of; `at` is
   its own clock time, in minutes, on a day whose page starts at the fight. */
export const primer = (pfx, what, at) => Object.assign(at == null ? {} : { at }, { L: "PR", n: "The Morning Primer", since: AUDIT_SINCE, m: 10, star: 1, rest: "Rest 60 s", rt: 60, hide: (rx) => !rx.au,
  rxLine: () => "10 minutes, this morning — every rep fast, nothing tired",
  items: [{ n: "Easy bike", s: "3 minutes, easy · this morning, hours before " + what, id: pfx + "prime_wu", k: "chk", rest: "", rt: 0 },
    { n: "Box jumps", s: "2 × 3 · every jump as high as you can", id: pfx + "prime_box", k: "chk" },
    { n: "Rotational throws", s: "2 × 3 per side · every throw flat out", id: pfx + "prime_throw", k: "chk" }],
  w: "Fast, nothing tired, done. Hours before " + what + ", never as its warm-up.",
  why: "A short, fast session in the two days before competing can leave you sharper for it; the evidence is limited, and it costs ten minutes." });
