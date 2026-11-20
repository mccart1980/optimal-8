import { AUDIT_SINCE } from "./audit.js";

/* ================================================================
   THE CORE, IN EVERY PROGRAM — from Monday 23 November 2026

   Every training day has at least three exercises for the abs and the
   core: one for the abs themselves (a crunch, a sit-up or a leg raise,
   with weight added as it gets easy), one that braces or works the
   sides, and one that rotates. They come after the heavy lifting, never
   before it. More rotation: rotation under load on four days, the
   throws on three in Strength, Power and Physique.

   Strength, Power and Physique gets its own cards (spp.js), where its
   days were short of one or two. Prep, the camp and Optimal 8 Fighter
   share the days below, laid over their pages by withCore:
     Monday     cable crunch + dead bug · cable woodchop, high to low
     Tuesday    THE BRACE (Prep and the camp): already three · in Fighter,
                the medicine-ball drops after the trunk block, whose
                Copenhagen plank went to Wednesday's hip pair
     Wednesday  weighted decline sit-up + landmine rotation · the star
                side plank in the hip pair is the third
     Thursday   reverse crunch + dumbbell side bend · cable woodchop,
                low to high
     Saturday   hanging leg raise + landmine rotation · the star side
                plank in the hip pair is the third
     Sunday     the leg raise, the L-sit and the lever: already three
   Prep runs them at its circuits' rounds (3, 2 or 1, none in test week);
   the camp at two rounds through week 8, one in its easy week, none in
   its last two weeks; Fighter at three, two in its lighter weeks, none
   in the last ten days before a fight.

   And the kneeling jump into a box jump, in the box jumps' place:
   Monday in Strength, Power and Physique and in Fighter, Tuesday in
   Prep and the camp. Each rep is two jumps, so the reps go to 2.
   Every block here hides itself before 23 November: a week before then
   reads exactly as it did.
   ================================================================ */
export const CORE_SINCE = AUDIT_SINCE;

export const CORE_CUE = {
  crunch: "Kneel facing a high cable, the rope held either side of your head. Curl your ribs down towards your hips, so your back rounds and your hips stay still, then uncurl slowly. Add weight when 15 is easy.",
  deadbug: "Lie on your back, arms pointing at the ceiling, knees bent above your hips. Press your lower back into the floor and keep it there while you slowly lower one arm and the opposite leg to just above the floor, breathing out. Bring them back, then the other pair. When it's easy, hold a light plate in your hands.",
  chopHi: "A cable at the top of the stack with a single handle. Stand side-on to it, feet wide, both hands on the handle above your near shoulder, arms long. Pull it down and across your body to the outside of your far knee by turning your hips and shoulders together, your back foot pivoting, then let it back up under control. All the reps one side, then the other. Add weight when 10 is easy.",
  chopLo: "A cable at the bottom of the stack with a single handle. Stand side-on to it, feet wide, both hands on the handle outside your near knee, arms long. Pull it up and across your body to above your far shoulder by turning your hips and shoulders together, your back foot pivoting, then let it back down under control. All the reps one side, then the other. Add weight when 10 is easy.",
  situp: "On a decline bench, feet hooked under the pads, a plate held on your chest. Curl up one bit of your spine at a time until your chest faces your knees, then lower slowly all the way back. Add weight when 12 is easy.",
  revcrunch: "Lie on a flat bench holding its end behind your head, knees bent to a right angle above your hips. Curl your hips up off the bench, bringing your knees towards your chest, then lower slowly until your feet nearly touch the floor. No swinging. Straighten your legs a little to make it harder.",
  sidebend: "Stand tall with one heavy dumbbell in one hand, the other hand on your head. Bend straight sideways towards the dumbbell as far as you can, then pull back up past upright with the side of your waist. No twisting, no leaning forward. All the reps one side, then the other. Add weight when 15 is easy.",
  lmrot: "One end of a barbell in a landmine or a corner, the other end held at arm's length in front of your chest, feet wide. Swing it down to one hip by turning your hips and pivoting your back foot, arms straight, then across to the other side, trunk braced. Controlled, never swung loose. Start with the bar plus 5–10 kg.",
  hlr: "Hang from the bar, curl your pelvis up and lift your knees to your chest without swinging, then lower slowly. Straight legs once that gets easy.",
  drops: "Lie on your back, knees bent, the ball held at arm's length over your stomach. Breathe out hard through your teeth and brace as you let it go; it lands just above your belly button, and you catch it on the bounce. Never on the ribs. Go up a kilo when all eight land on a brace that doesn't give, from 3 kg up to 6.",
  kneel: "Kneel tall on a mat, toes tucked under, a knee-high box about a metre in front of you. Swing your arms back, then throw them forward and snap your hips through to jump onto your feet, landing in a half squat. Straight away, jump onto the box as high as you can, land soft and step down. Kneel again and start each rep still.",
};

/* one exercise of the core: its sets and reps, its cue, its log */
export const coreItem = (key, n, sets, reps, id, rest, rt) => ({ n, s: sets + " × " + reps, cue: CORE_CUE[key], id, k: "wr", sets, reps, rest, rt });

export const KNEEL_WHY = "From your knees the legs can't use a dip and a bounce, so all of the jump comes from snapping your hips through: the same drive that turns a punch from the back foot.";
/* a box jump item becomes the kneeling jump into a box jump: the same sets, two reps */
export const kneelItem = (it, sets, id) => ({ n: "Kneeling jump into box jump", s: sets + " × 2", cue: CORE_CUE.kneel, id, k: it && it.k ? it.k : "chk" });

/* ---------------- Prep, the camp and Fighter ---------------- */
const v = (x, rx) => (typeof x === "function" ? x(rx) : x);
const pair = (L, n, m, rounds, a, b, why) => ({ L, n, since: CORE_SINCE, m, pair: 1, rxLine: () => "back to back · 45 s after each pair",
  items: (rx) => { const r = rounds(rx); return [coreItem(a[0], a[1], r, a[2], a[3], "straight into the " + b[1].toLowerCase(), 0), coreItem(b[0], b[1], r, b[2], b[3], "Rest 45 s", 45)]; },
  w: "Every rep slow and controlled, all the way through its range. Weight goes on when the top of the range is easy.", why });
const single = (L, n, m, sets, a, why) => ({ L, n, since: CORE_SINCE, m, rest: "Rest 45 s", rt: 45, rxLine: (rx) => sets(rx) + " × " + a[2],
  items: (rx) => [coreItem(a[0], a[1], sets(rx), a[2], a[3], "Rest 45 s", 45)], why });

/* the rounds each program runs them at; 0 hides them */
const ROUNDS = {
  prep: (rx) => Math.max(0, Math.min(3, rx.circ == null ? 3 : rx.circ)),
  camp: (rx) => (rx.tp || rx.fightWeek || (rx.w || 0) > 8 ? 0 : rx.dl ? 1 : 2),
  fighter: (rx) => (rx.hell || rx.test ? 0 : (rx.acc || 3) < 3 ? 2 : 3),
};
const PFX = { prep: "p_", camp: "c_", fighter: "" };
const WHY = {
  mon: "The abs grow on load and hard sets, like any muscle: the crunch takes weight. The dead bug keeps the trunk still while the arms and legs move, and the woodchop turns the hips and shoulders together, the way a hook does.",
  wed: "A sit-up you add weight to, for the abs, and a turn under load for the sides; the star side plank in the hip pair is the day's third.",
  thu: "The reverse crunch works the lower abs from the hips up, the side bend the sides of the waist, and the woodchop turns from low to high, the way an uppercut does.",
  tue: "The body-shot brace, Prep's and the camp's: with the Pallof press and the ab wheel, the day's three now the Copenhagen plank is in Wednesday's hip pair.",
  sat: "The leg raise for the lower abs and the landmine rotation for the turn; the star side plank in the hip pair is the day's third.",
};
function coreBlocks(prog, day) {
  const R = ROUNDS[prog], p = PFX[prog], two = (rx) => Math.min(2, R(rx)), m = (per, add) => (rx) => (R(rx) ? per * R(rx) + add : 0);
  const hide = (rx) => !rx.au || !R(rx);
  const out = {
    mon: [pair("CR", "Cable Crunch + Dead Bug", m(2.5, 0), R, ["crunch", "Cable crunch", "10–15", p + "core_crunch"], ["deadbug", "Dead bug", "6 each side, slow", p + "core_deadbug"], WHY.mon),
      single("CW", "Cable Woodchop", (rx) => (R(rx) ? 1.5 * two(rx) : 0), two, ["chopHi", "Cable woodchop", "10 each side · high to low", p + "core_chop_hi"], WHY.mon)],
    wed: [pair("CR", "Weighted Decline Sit-Up + Landmine Rotation", m(2.5, 0), R, ["situp", "Weighted decline sit-up", "10", p + "core_situp"], ["lmrot", "Landmine rotation", "6–8 each side", p + "core_lmrot"], WHY.wed)],
    thu: [pair("CR", "Reverse Crunch + Dumbbell Side Bend", m(2.5, 0), R, ["revcrunch", "Reverse crunch", "10–12", p + "core_rev"], ["sidebend", "Dumbbell side bend", "12 each side", p + "core_sidebend"], WHY.thu),
      single("CW", "Cable Woodchop", (rx) => (R(rx) ? 1.5 * two(rx) : 0), two, ["chopLo", "Cable woodchop", "10 each side · low to high", p + "core_chop_lo"], WHY.thu)],
    tue: prog === "fighter" ? [{ L: "CD", n: "Medicine-Ball Drops", after: "G", since: CORE_SINCE, m: (rx) => (R(rx) ? 2 : 0), rest: "Rest 45 s", rt: 45, rxLine: (rx) => two(rx) + " × 8",
      items: (rx) => [{ n: "Medicine-ball drops", s: two(rx) + " × 8 · a 3 kg ball, up to 6", cue: CORE_CUE.drops, id: "core_drops", k: "chk", rest: "Rest 45 s", rt: 45 }], why: WHY.tue }] : [],
    sat: [pair("CR", "Hanging Leg Raise + Landmine Rotation", m(2.5, 0), R, ["hlr", "Hanging leg raise", "8–12", p + "core_hlr"], ["lmrot", "Landmine rotation", "6–8 each side", p + "core_lmrot"], WHY.sat)],
  }[day] || [];
  return out.map((x) => Object.assign(x, { hide, noTaper: 1, m: ((mm) => (rx) => Math.round(v(mm, rx)))(x.m) }));
}
/* the minutes the core adds to a day */
export const coreMins = (blocks, rx) => blocks.reduce((a, x) => a + (x.hide(rx) ? 0 : v(x.m, rx)), 0);

/* the box jumps that become the kneeling jump into a box jump, by program
   and day: the block's letter, and the box jump's log id */
const KNEEL = { prep: { tue: ["B", "boxjump"] }, camp: { tue: ["B", "c_boxjump"] }, fighter: { mon: ["C", "boxjump"] } };
const kneelBlock = (x, id) => Object.assign({}, x, {
  rxLine: (rx) => { const s = String(v(x.rxLine, rx) || ""); return !rx.au ? s : s.replace(/box jumps (\d+) × \d+/, "kneeling jumps into box jumps $1 × 2").replace(/^one minute of legs, then (\d+) × \d+$/, "one minute of legs, then kneeling jumps into box jumps $1 × 2"); },
  items: (rx) => (v(x.items, rx) || []).map((it) => (rx.au && it.id === id ? kneelItem(it, String(it.s).split(" × ")[0], id + "_kneel") : it)),
  why: (rx) => (rx.au ? String(v(x.why, rx) || "") + " " + KNEEL_WHY : v(x.why, rx)) });

/* a day's page with the core laid over it, the same object every time */
const CACHE = new WeakMap();
export function withCore(prog, day, S) {
  if (!S || !S.b || !ROUNDS[prog]) return S;
  const blocks = coreBlocks(prog, day), kn = KNEEL[prog] && KNEEL[prog][day];
  if (!blocks.length && !kn) return S;
  let per = CACHE.get(S); if (per) return per;
  let b = S.b.map((x) => (kn && x.L === kn[0] ? kneelBlock(x, kn[1]) : x));
  /* each block straight after the one it names, or at the end, before the weekly check */
  blocks.forEach((x) => {
    const a = x.after ? b.findIndex((y) => y.L === x.after) : -1, r = b.findIndex((y) => y.review);
    const at = a >= 0 ? a + 1 : r >= 0 ? r : b.length;
    b = b.slice(0, at).concat([x], b.slice(at));
  });
  per = Object.assign({}, S, { b, m: blocks.length ? (rx) => v(S.m, rx) + coreMins(blocks, rx) : S.m });
  CACHE.set(S, per);
  return per;
}
