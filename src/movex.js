import { C } from "./ui.jsx";
import { SPPROTO, lowerPushes, hipPair, backExt } from "./spp.js";
import { isMoveTestWeek } from "./move.js";

/* ================================================================
   OPTIMAL 8 · MOVE IN EVERY PROGRAM

   Prep, the camp, the transition and Optimal 8 Fighter, the classic, as
   Strength, Power and Physique runs it: from MOVE's week 1 the movement
   block in the warm-up's place, and from the tendon work's week 1 the
   lower pushes, the hip pair and the towel calf raise. A program's own
   pages are untouched; withMove lays MOVE over a day's page, block by
   block, and every new block hides itself until its week. Before MOVE a
   page reads exactly as it did.

   The blocks, day by day (optimal-8-move.md, MOVE IN EVERY PROGRAM):
   Monday hips, ankles and overhead · Tuesday hips, balance and sprint
   prep · Wednesday hips, knees and lower back · Thursday lower back and
   shoulders · Saturday hips, balance and sprint prep · Sunday the whole
   body, then the power prep. The last rows of Monday's, Wednesday's and
   Sunday's are the old warm-up's own lift sets and primers.
   ================================================================ */

const moves = (k) => SPPROTO[k].i.filter((r) => !/^Then /.test(r[0]));
const TB_SETS = [["TRAP BAR WARM-UP SETS", ""], ["Bar", "×5"], ["50% of working", "×3"], ["70% of working", "×2"]];
const PRIMERS = [["PLUS", ""], ["Broad jumps", "3 × 2"], ["Med-ball chest passes", "3 × 3 as hard as you can"], ["Bike sprints", "3 × 10 seconds with a minute between"],
  ["Practice throws", "three easy throws of each of the four"]];
const mv = (s, area, i, note) => Object.assign({ n: "The movement block", s, c: C.cobalt, mv: 1, area, i }, note ? { note } : {});
export const OPROTO = {
  O_MV_MON: mv("9 min · Mon", "Hips, ankles and overhead", moves("S_MV_WED").concat([["Ring support hold", "2 × 20 s"], ["Bodyweight dips", "×5"]]),
    "The dips at bodyweight last, before any weight goes on the belt."),
  O_MV_MON_F: mv("11 min · Mon", "Hips, ankles and overhead", moves("S_MV_WED").concat([["BENCH RAMP", ""], ["Bar", "×10"], ["40%", "×5"], ["60%", "×3"], ["75%", "×2"]]),
    "The bench ramp last — about a minute between those sets, so the first working set is already warm."),
  O_MV_TUE: mv("12 min · Tue", "Hips, balance and sprint prep", SPPROTO.S_MV_THU.i, "Never sprint cold. The build-ups are the sprint warm-up."),
  O_MV_WED: mv("10 min · Wed", "Hips, knees and lower back", moves("S_MV_MON_T").concat(TB_SETS)),
  O_MV_WED_F: mv("11 min · Wed", "Hips, knees and lower back", moves("S_MV_MON_T").concat([["TRAP BAR WARM-UP SETS", ""], ["Bar", "×5"], ["50% of working", "×3"], ["65% of working", "×2"],
    ["SQUAT WARM-UP SETS", ""], ["40% of working", "×3"], ["60% of working", "×2"]])),
  O_MV_THU: mv("8 min · Thu", "Lower back and shoulders", SPPROTO.S_MV_TUE.i),
  O_MV_SAT: mv("12 min · Sat", "Hips, balance and sprint prep", SPPROTO.S_MV_THU.i, "Never sprint cold. The build-ups are the sprint warm-up; the squat's warm-up sets are on its own card."),
  O_MV_SUN: mv("14 min · Sun", "The whole body, then the power prep", moves("S_MV_SUN").concat(PRIMERS)),
};
const MINS = { O_MV_MON: 9, O_MV_MON_F: 11, O_MV_TUE: 12, O_MV_WED: 10, O_MV_WED_F: 11, O_MV_THU: 8, O_MV_SAT: 12, O_MV_SUN: 14 };
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const moveBlock = (L, key) => ({ L, n: "Warm-up", m: MINS[key], p: key, since: "2026-11-16", hide: (rx) => !rx.mw,
  rxLine: () => MINS[key] + " min · " + lower(OPROTO[key].area) });

/* what MOVE does to each program's days: warm — the warm-up's letter and
   the block in its place; out — the holds the lower pushes replace;
   after — the block the lower pushes follow; calf — the calf block whose
   Achilles hold becomes the towel calf raise; hip — the hip pair at the
   end; back — the back extension after the core block; copen — the trunk
   block that loses its Copenhagen plank */
const P = {
  prep: { mon: { warm: ["W", "O_MV_MON"] }, tue: { warm: ["A", "O_MV_TUE"], out: ["K"], after: "C", calf: "G", tn: 1 }, wed: { warm: ["A", "O_MV_WED"], hip: 1 },
    thu: { warm: ["A", "O_MV_THU"], out: ["D", "J"], after: "C" }, sat: { warm: ["A", "O_MV_SAT"], after: "D", hip: 1 }, sun: { warm: ["A", "O_MV_SUN"], back: "E" } },
  fighter: { mon: { warm: ["A", "O_MV_MON_F"] }, tue: { warm: ["A", "O_MV_TUE"], after: "C", calf: "H", copen: "G", tn: 1 }, wed: { warm: ["A", "O_MV_WED_F"], hip: 1 },
    thu: { warm: ["A", "O_MV_THU"], out: ["D", "X"], after: "C" }, sat: { warm: ["A", "O_MV_SAT"], after: "D", hip: 1 }, sun: { warm: ["A", "O_MV_SUN"], back: "G" } },
  trans: { mon: { end: { hide: (rx) => rx.w === 1 } }, thu: { end: {} } },
};
P.camp = P.prep;
const v = (x, rx) => (typeof x === "function" ? x(rx) : x);
const or = (b, f) => Object.assign({}, b, { hide: (rx) => (b.hide ? !!b.hide(rx) : false) || !!f(rx) });

/* THE TOWEL CALF RAISE, in the Achilles hold's place: the seated calf
   raise as it was, then the towel calf raise on the standing machine; in
   MOVE's test weeks its heaviest five, a tendon number */
const towelBlock = (old, pfx) => ({ L: "TC", n: "Seated Calf Raise + Towel Calf Raise", since: "2026-11-23", m: old.m, rest: old.rest, rt: old.rt,
  hide: (rx) => !rx.tw || (old.hide ? !!old.hide(rx) : false),
  items: (rx) => [Object.assign({}, v(old.items, rx)[0], { rest: "straight into the towel calf raise", rt: 0 }), isMoveTestWeek(rx.mw)
    ? { n: "Towel calf raise, heaviest 5", s: "the heaviest you can lift for 5 clean reps · a tendon number", cue: "In place of today's towel calf raise sets: work up to the heaviest you can lift for 5 clean reps at the usual tempo, and log it.", id: pfx + "tn_calf", k: "out", u: "kg", rest: "Rest 60 s", rt: 60 }
    : { n: "Towel calf raise", s: "2 × 6–10 · 3 s up, 2 s at the top, 3 s down, 2 s at the bottom", cue: "On the standing calf raise machine, a rolled towel under your toes, so they're bent up as far as they go at the top. All the way down to a full stretch, then all the way up.", id: pfx + "towel", k: "wr", sets: 2, reps: "6–10", rest: "Rest 60 s", rt: 60 }],
  why: "The towel winds up the band under your foot, so the raise loads the sole of the foot as well as the Achilles. It replaces the Achilles hold, which sat below the load a tendon needs." });

/* a day's page with MOVE laid over it, the same object every time */
const CACHE = new WeakMap();
export function withMove(prog, day, S) {
  const plan = S && S.b && P[prog] && P[prog][day];
  if (!plan) return S;
  const hit = CACHE.get(S); if (hit) return hit;
  const pfx = prog === "camp" ? "c_" : "";
  const b = [];
  S.b.forEach((x) => {
    if (plan.warm && x.L === plan.warm[0]) { b.push(or(x, (rx) => !!rx.mw)); b.push(moveBlock(x.L, plan.warm[1])); return; }
    if (plan.out && plan.out.indexOf(x.L) >= 0) { b.push(or(x, (rx) => !!rx.tw)); return; }
    if (plan.calf && x.L === plan.calf) { b.push(or(x, (rx) => !!rx.tw)); b.push(towelBlock(x, pfx)); return; }
    if (plan.copen && x.L === plan.copen) {
      b.push(Object.assign({}, x, { m: (rx) => (rx.tw ? 7 : v(x.m, rx)), items: (rx) => (v(x.items, rx) || []).filter((i) => !(rx.tw && i.id === "copen")) })); return; }
    b.push(x);
    if (plan.after && x.L === plan.after) b.push(lowerPushes("LP", { mon: plan.tn }));
    if (plan.back && x.L === plan.back) b.push({ L: "BX", n: "Back Extension", since: "2026-11-16", m: 3, hide: (rx) => !rx.mw || (x.hide ? !!x.hide(rx) : false), rest: "Rest 60 s", rt: 60,
      rxLine: (rx) => backExt(rx).s, items: (rx) => [backExt(rx)],
      why: "The lower back strong in every position, step by step: still, then through its range, then bent under load." });
  });
  if (plan.hip) { const r = b.findIndex((x) => x.review); b.splice(r >= 0 ? r : b.length, 0, hipPair("HP")); }
  if (plan.end) b.push(lowerPushes("LP", { trans: 1, hide: plan.end.hide }));
  const out = Object.assign({}, S, { b });
  CACHE.set(S, out);
  return out;
}
/* the camp's final week: its Tuesday gets one dose of the lower pushes,
   at half effort; nothing after it until the transition */
const FW_CACHE = new WeakMap();
export const withFinalWeek = (S) => {
  if (!S || !S.b) return S;
  const hit = FW_CACHE.get(S); if (hit) return hit;
  const out = Object.assign({}, S, { b: S.b.concat([lowerPushes("LP", { fw: 1 })]) });
  FW_CACHE.set(S, out); return out;
};
