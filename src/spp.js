import { C } from "./ui.jsx";
import { jumpOf, JUMP_GATE_LINE } from "./safety.js";
import { SLED_FIELDS, LIGHTS_FIELDS, sessionBoxes, engHR } from "./camp.js";
import { BENCH_THROW_NOTE, topItem } from "./prep.js";

/* ================================================================
   OPTIMAL 8 · STRENGTH, POWER AND PHYSIQUE — as data

   optimal-8-strength-power-physique.md, as the app runs it. Twelve
   weeks, six days: three hard weeks of size, a lighter week, three of
   strength, a lighter week, three of power, then the test week. The
   squat, bench and trap bar move through the blocks off the working
   max; everything else keeps going all the way through, block by block.
   Its own programme, picked in Settings when no fight is booked: Prep,
   the camp and Optimal 8 Fighter don't change.
   ================================================================ */

export const SPP_NAME = "Strength, Power and Physique";
export const SPP_INTRO = "Twelve weeks to make you as strong, as explosive and as muscular as you can be, six days a week, with the engine held where it is: size, then strength, then power, and every block keeps all three going.";

/* ---------- the blocks, for the headers and the week map ---------- */
export const SPP_PH = {
  spp_size: { n: "SIZE", long: "BLOCK 1 · SIZE", ac: C.moss, vl: "4 × 6 @ 75–80%",
    note: "Three weeks of size: the squat, bench and trap bar 4 × 6 at 75, 77.5 and 80%, and the most sets of the cycle for chest, back, shoulders and arms. Box jumps; the flying sprints at 90% for the first two weeks." },
  spp_lighter: { n: "LIGHTER", long: "THE LIGHTER WEEK", ac: C.moss, vl: "the profiles · half the sets",
    note: "The squat, bench and trap bar become their profiles — five loads, two fast reps each — and the trap bar jumps and bench throws theirs. Everything else is half the sets, rounded up, and the 4 × 4 is 3 × 4. Tape and photos on Sunday." },
  spp_strength: { n: "STRENGTH", long: "BLOCK 2 · STRENGTH", ac: C.oxide, vl: "5 × 3 @ 85–90%",
    note: "Three weeks of strength: 5 × 3 at 85, 87.5 and 90%, three minutes between sets. Low-box depth jumps; four flying sprints, flat out. The size work keeps going." },
  spp_power: { n: "POWER", long: "BLOCK 3 · POWER", ac: C.brass, vl: "4 × 2 @ 90–95% + jumps",
    note: "Three weeks of power: 4 × 2 at 90, 92.5 and 95%, with three jumps or throws 90 seconds after every double. Depth jumps. The size work keeps going." },
  spp_test: { n: "TEST WEEK", long: "TEST WEEK", ac: C.cobalt, vl: "top triples · half the sets",
    note: "Monday the broad jump and the squat top triple; Tuesday the bench and the chin-up top triples; Thursday the trap bar top triple; Saturday the 4 × 4 as the engine test. Everything else half the sets. Tape and photos on Sunday." },
};

/* ---------- the engine ---------- */
export const SPPENG = {
  vo2: { n: "4-MINUTE INTERVALS", d: "On the bike: 5 minutes easy, then 4 × 4 minutes at 90–95% of your peak heart rate with 3 easy between, then 3 minutes easy",
    tgt: "The total on the bike's screen, at the same peak heart rate or a lower one." },
  vo2s: { n: "4-MINUTE INTERVALS", d: "On the bike: 5 minutes easy, then 3 × 4 minutes at 90–95% of your peak heart rate with 3 easy between, then 3 minutes easy — the lighter week's 3 × 4",
    tgt: "The total on the bike's screen, against the last 3 × 4." },
  /* Tuesday's bursts on the assault bike: eight, four in the lighter weeks and test week */
  sb: { n: "6-SECOND BURSTS", d: "On the assault bike: 2 minutes easy, then 8 bursts of 6 seconds flat out with 40 seconds easy between, then 2 minutes easy",
    tgt: "The total on the bike's screen, against the last eight." },
  sb4: { n: "6-SECOND BURSTS", d: "On the assault bike: 2 minutes easy, then 4 bursts of 6 seconds flat out with 40 seconds easy between, then 2 minutes easy — four in the lighter weeks and test week",
    tgt: "The total on the bike's screen, against the last four." },
  /* Tuesday's pressure rounds, straight after the bursts: three, two in the lighter weeks and test week */
  pr: { n: "PRESSURE ROUNDS", d: "On the assault bike, straight after the bursts: 1 minute easy, then 3 rounds of 3 minutes with 1 minute's rest between — in each, a 5-second burst all out every 20 seconds, a steady pace between — then 2 minutes easy",
    tgt: "The total on the bike's screen, against the last three." },
  pr2: { n: "PRESSURE ROUNDS", d: "On the assault bike, straight after the bursts: 1 minute easy, then 2 rounds of 3 minutes with 1 minute's rest between — in each, a 5-second burst all out every 20 seconds, a steady pace between — then 2 minutes easy. Two in the lighter weeks and test week",
    tgt: "The total on the bike's screen, against the last two." },
};
export const SPPENG_MENU = ["vo2"];

/* ---------- the twelve weeks, row by row ----------
   blk: the week's block · acc: the block the rest of the week is written
   in (a lighter week keeps the block before it, test week the power
   block's) · main: the squat, bench and trap bar · contrast: three jumps
   after every double · profile: the lighter weeks' profiles · half: half
   the sets, rounded up · jump: the reactive slot — none in the size block
   (box jumps), low-box depth jumps in the strength block, depth jumps in
   the power block · e: the Saturday intervals · bk: Tuesday's bursts, eight
   or, in the half weeks, four · pr: the pressure rounds after them, three
   or, in the half weeks, two · tape: arm and shoulders on Sunday's check,
   and the photos. */
const SR = {};
const swk = (d, o) => { SR[d] = Object.assign({ d, main: null, half: 0, light: 0, testWeek: 0, profile: 0, contrast: 0, jump: null, e: "vo2", spr90: 0, tape: 0 }, o);
  SR[d].bk = SR[d].half ? "sb4" : "sb"; SR[d].pr = SR[d].half ? "pr2" : "pr"; };
swk(1, { blk: "size", acc: "size", ph: "spp_size", main: { sets: 4, reps: 6, pct: 75 }, spr90: 1,
  em: "Size: the squat, bench and trap bar 4 × 6 @ 75%. Box jumps; the flying sprints at 90%. The 4 × 4 on Saturday, the nasal runs on Wednesday and Sunday." });
swk(2, { blk: "size", acc: "size", ph: "spp_size", main: { sets: 4, reps: 6, pct: 77.5 }, spr90: 1,
  em: "Size: 4 × 6 @ 77.5%. The flying sprints at 90% for the last week." });
swk(3, { blk: "size", acc: "size", ph: "spp_size", main: { sets: 4, reps: 6, pct: 80 },
  em: "Size: 4 × 6 @ 80%. The flying sprints flat out from here." });
swk(4, { blk: "lighter", acc: "size", ph: "spp_lighter", light: 1, half: 1, profile: 1, e: "vo2s", tape: 1,
  em: "Lighter: the squat, bench and trap bar are their profiles — five loads, two fast reps each — and the trap bar jumps and bench throws theirs. Everything else half the sets; the 4 × 4 is 3 × 4. Tape and photos on Sunday." });
swk(5, { blk: "strength", acc: "strength", ph: "spp_strength", main: { sets: 5, reps: 3, pct: 85 }, jump: "lowbox",
  em: "Strength: 5 × 3 @ 85%. Low-box depth jumps replace the box jumps; four flying sprints." });
swk(6, { blk: "strength", acc: "strength", ph: "spp_strength", main: { sets: 5, reps: 3, pct: 87.5 }, jump: "lowbox",
  em: "Strength: 5 × 3 @ 87.5%." });
swk(7, { blk: "strength", acc: "strength", ph: "spp_strength", main: { sets: 5, reps: 3, pct: 90 }, jump: "lowbox",
  em: "Strength: 5 × 3 @ 90%." });
swk(8, { blk: "lighter", acc: "strength", ph: "spp_lighter", light: 1, half: 1, profile: 1, e: "vo2s", jump: "lowbox", tape: 1,
  em: "Lighter: the profiles again; everything else half the sets; the 4 × 4 is 3 × 4. Tape and photos on Sunday." });
swk(9, { blk: "power", acc: "power", ph: "spp_power", main: { sets: 4, reps: 2, pct: 90 }, contrast: 1, jump: "depth",
  em: "Power: 4 × 2 @ 90%, three jumps or throws 90 seconds after every double. Depth jumps replace the low-box depth jumps." });
swk(10, { blk: "power", acc: "power", ph: "spp_power", main: { sets: 4, reps: 2, pct: 92.5 }, contrast: 1, jump: "depth",
  em: "Power: 4 × 2 @ 92.5%, three jumps or throws after every double." });
swk(11, { blk: "power", acc: "power", ph: "spp_power", main: { sets: 4, reps: 2, pct: 95 }, contrast: 1, jump: "depth",
  em: "Power: 4 × 2 @ 95%, three jumps or throws after every double." });
swk(12, { blk: "test", acc: "power", ph: "spp_test", half: 1, testWeek: 1, tape: 1,
  em: "Test week: Monday the broad jump and the squat top triple; Tuesday the bench and chin-up top triples; Thursday the trap bar top triple; Saturday the 4 × 4 as the engine test. Everything else half the sets. Tape and photos on Sunday." });

/* what the morning's colour does to the session, as the check says it */
export const SPP_READY_LINE = {
  G: "GREEN — the session as written",
  Y: "YELLOW — every load −7% · the 4 × 4 at 90%",
  R: "RED — the heavy lifts, the sprints, jumps and throws, the 4 × 4, the bursts and the pressure rounds come off; the size work runs",
};

export const SPP_ROWS = SR;
export const sppRx = (doc) => SR[doc] || SR[1];
/* any SPP row's week: the calendar's, as the season builder hands it on */
export const sppWeekRx = (row) => Object.assign({}, sppRx(row.doc), { id: row.id, doc: row.doc, cycle: row.cycle || 1, preCamp: !!row.preCamp });

/* the tests each row carries, as one line */
export function sppTests(doc) {
  const rx = sppRx(doc), out = [];
  if (rx.profile) out.push("the load-velocity profiles");
  if (rx.testWeek) out.push("the broad jump", "the top triples", "the 4 × 4 as the engine test");
  if (rx.tape) out.push("tape", "photos");
  return out;
}
/* tape and photos: Sunday of weeks 4, 8 and 12 */
export const sppPhotoDay = (doc, day) => day === "sun" && !!sppRx(doc).tape;

/* the bar-speed phase a set is read at, by its own percentage */
export const sppVelPhase = (pct) => { const p = Number(pct) || 0; return p < 80 ? "accum" : p < 88 ? "intens" : "top"; };

/* ---------- how the numbers are picked ---------- */
const half = (n) => Math.ceil(n / 2);
/* the week's sets: half, rounded up, in the lighter weeks and test week */
const hs = (rx, n) => (rx.half ? half(n) : n);
/* a number by the block the week is written in */
const by = (rx, o) => (o[rx.acc] != null ? o[rx.acc] : o.size);
export const sppMainLine = (rx) => (rx.main ? rx.main.sets + " × " + rx.main.reps + " @ " + rx.main.pct + "%" : "");
/* THE RAMP, on the card of every main lift: bar × 8, then 40% × 5,
   55% × 3, 65% × 2, 75% × 1 and 85% × 1 — each step only while it's at
   least 5% under the day's working weight. A minute between. */
const RAMP = [[0, 8], [40, 5], [55, 3], [65, 2], [75, 1], [85, 1]];
export const sppRamp = (pct) => RAMP.filter((r) => r[0] <= Number(pct) - 5);
/* a main lift's minutes, the ramp in them */
const mainM = (rx) => (rx.testWeek || rx.contrast || (rx.main && rx.main.sets >= 5) ? 25 : 21);
/* the power block's rest: 90 seconds, the three jumps or throws, two minutes */
const thenRest = (what) => ({ kind: "rest", opt: { a: 90, then: what, w: 15, b: 120 }, title: "REST" });

const PSQ = { size: { sets: 3, reps: 5, pct: 65 }, strength: { sets: 3, reps: 3, pct: 72.5 }, power: { sets: 3, reps: 2, pct: 75 } };
/* Saturday's one-arm landmine push press: by weight and reps, every rep fast — no working max, no profile */
const PP = { size: { sets: 4, reps: 5 }, strength: { sets: 5, reps: 3 }, power: { sets: 5, reps: 3 } };
const BTG = { size: { reps: 8, pct: 70 }, strength: { reps: 6, pct: 75 }, power: { reps: 5, pct: 75 } };
const CHIN = { size: [4, 6], strength: [5, 4], power: [4, 3] };
/* Tuesday's one-arm landmine press, each side */
const LMP = { size: [3, 8], strength: [4, 5], power: [3, 4] };
const BSS = { size: [3, 8], strength: [3, 6], power: [2, 6] };
export const sppPsq = (rx) => (rx.testWeek ? null : Object.assign({}, by(rx, PSQ), { sets: hs(rx, by(rx, PSQ).sets) }));
export const sppPp = (rx) => Object.assign({}, by(rx, PP), { sets: hs(rx, by(rx, PP).sets) });
/* Thursday's flying sprints: three in the size block, four after */
export const sppSprints = (rx) => hs(rx, by(rx, { size: 3, strength: 4, power: 4 }));
/* Thursday's heavy sled: five runs, three in the lighter weeks, two in test week */
export const sppSled = (rx) => (rx.testWeek ? 2 : rx.half ? 3 : 5);
const DROP = "the last set to failure, then 30% lighter and go again";
/* THE CABLE CRUNCH: the abs loaded, so they grow thick enough to show —
   Wednesday's and Sunday's, back to back with the pull before it */
const CRUNCH = (rx) => ({ n: "Cable crunch", s: hs(rx, 3) + " × 10–15 · one or two left", cue: "Kneel facing a high cable, the rope held either side of your head. Curl your ribs down towards your hips, so your back rounds and your hips stay still, then uncurl slowly. Add weight when 15 is easy.", id: "s_crunch", k: "wr", sets: hs(rx, 3), reps: "10–15", rest: "Rest 60 s", rt: 60 });
/* THE SIDE PLANK: Thursday's and Saturday's ab finish, a hold, in seconds */
const SIDE_PLANK = (rx, o) => Object.assign({ n: "Side plank", s: hs(rx, 2) + " × 30–45 s each side", cue: "Lie on your side propped on your forearm, elbow under your shoulder. Lift your hips so you're straight from head to feet, and hold. Then the other side.", id: "s_splank", k: "chk" }, o || {});
const RUN_FIELDS = [{ k: "w", l: "DISTANCE (KM)" }, { k: "hr", l: "AVERAGE HEART RATE (BPM)" }];

/* ---------- the warm-ups ---------- */
export const SPPROTO = {
  S_WU_MON: { n: "Warm-up", s: "5 min · Mon", c: C.cobalt,
    note: "The box jumps have their own card, next. The ramp to the working sets is on the squat's own card.",
    i: [["Easy bike", "3 min"], ["Spanish squat hold", "2 × 30 s"]] },
  S_WU_TUE: { n: "Warm-up", s: "6 min · Tue", c: C.cobalt,
    note: "The ramp to the working sets is on the bench's own card.",
    i: [["Band pull-apart", "2 × 15"], ["Band dislocate", "2 × 10"], ["Push-up", "×10"], ["Then two easy throws of each", "at half effort"]] },
  S_WU_WED: { n: "Warm-up", s: "5 min · Wed", c: C.cobalt,
    i: [["Band pull-apart", "2 × 15"], ["Push-up", "×10"], ["Then a light set", "of the incline press and the pulldown"]] },
  S_WU_THU: { n: "Warm-up · legs and build-ups", s: "10 min · Thu", c: C.cobalt,
    note: "Never sprint cold. The build-ups are the sprint warm-up; the ramp to the trap bar is on its own card.",
    i: [["Easy bike", "3 min"], ["Leg swings", "×10 each way, each leg"], ["A-skips", "2 × 15 m"], ["Walking lunges", "×10"],
      ["SPRINT BUILD-UPS", ""], ["20 m @ 60%", "×1"], ["20 m @ 75%", "×1"], ["20 m @ 90%", "×1"]] },
  S_WU_SAT: { n: "Warm-up", s: "6 min · Sat", c: C.cobalt,
    note: "The same as Tuesday's: bands, push-ups, then two easy throws of each at half effort.",
    i: [["Band pull-apart", "2 × 15"], ["Band dislocate", "2 × 10"], ["Push-up", "×10"], ["Then two easy throws of each", "at half effort"]] },
  S_WU_SUN: { n: "Warm-up", s: "4 min · Sun", c: C.cobalt,
    i: [["Band pull-apart", "2 × 15"], ["Band dislocate", "2 × 10"], ["Then a light set", "of the cable lateral raise and the curl"]] },
};

/* the profile rows, two fast reps a load, the watch recording */
const FIVE = "50 · 60 · 70 · 80 · 85% — two reps each";
const PROFILE_WHY = "A percentage is a guess about today from a number measured weeks ago; a velocity is a measurement of today. The lighter weeks redraw every line.";

/* the weekly check — Prep's, with the arm and shoulders on the tape weeks */
const checkItems = (rx) => [{ n: "Bodyweight", s: "kg", id: "wr_bw", k: "out", u: "kg" }, { n: "Waist", s: "cm", id: "pwr_waist", k: "out", u: "cm" }]
  .concat(rx.tape ? [{ n: "Arm", s: "cm · flexed, at the biggest point", id: "s_arm", k: "out", u: "cm" },
    { n: "Shoulders", s: "cm · around the widest point", id: "s_sh", k: "out", u: "cm" }] : [])
  .concat([{ n: "Resting heart rate", s: "bpm", id: "wr_rhr", k: "out", u: "bpm" },
    { n: "Green days", s: "count", id: "pwr_g", k: "out", u: "days" }, { n: "Yellow days", s: "count", id: "pwr_y", k: "out", u: "days" }, { n: "Red days", s: "count", id: "pwr_r", k: "out", u: "days" },
    { n: "Hips", s: "0–10", id: "wr_hip", k: "out", u: "0–10" }, { n: "Shoulders", s: "0–10", id: "wr_sh", k: "out", u: "0–10" },
    { n: "Elbows", s: "0–10", id: "wr_el", k: "out", u: "0–10" }, { n: "Wrists", s: "0–10", id: "wr_wr", k: "out", u: "0–10" },
    { n: "Knees", s: "0–10", id: "wr_kn", k: "out", u: "0–10" }, { n: "Achilles", s: "0–10", id: "wr_ach", k: "out", u: "0–10" },
    { n: "Hamstrings", s: "0–10", id: "wr_ham", k: "out", u: "0–10" },
    { n: "Hours of sleep, averaged", s: "hours a night", id: "wr_sleep", k: "out", u: "hours" },
    { n: "Lights-out time, averaged", s: "what time the light went off", id: "wr_lights", k: "out", u: "e.g. 20:00", fields: LIGHTS_FIELDS },
    { n: "Energy", s: "1–10", id: "wr_en", k: "out", u: "1–10" },
    { n: "Evenings you did RANGE", s: "0–7", id: "wr_home", k: "out", u: "0–7" }]);

/* the nasal run, Wednesday and Sunday, after the session */
const nasalRun = (L) => ({ L, n: "The Nasal Run", m: 30, eng: 1, engKey: "base",
  timer: () => ({ kind: "z2", opt: { min: 30, label: "EASY — NOSE ONLY · 65–75% OF PEAK" }, title: "THE NASAL RUN" }),
  rxLine: () => "30 min easy, nose only · 65–75% of peak",
  items: [{ n: "The nasal run", s: "distance and average heart rate", cue: "Easy, on the road or a treadmill, breathing in and out through your nose the whole way. If you need your mouth, slow down.", id: "s_run", k: "out", u: "km · bpm", fields: RUN_FIELDS }],
  why: "Two easy runs and one hard interval session hold the engine where it is. Easy and on the size days, so they take nothing from the heavy and fast sessions." });

/* ================================================================
   THE SEVEN PAGES, in running order
   ================================================================ */
/* since: a card added after the programme first ran carries the first date it
   counts from — the day after it went in. Days trained before that are
   measured against the cards they had, so a finished day stays finished.
   A card that's there from a programme's first day needs none. */
export const SS = {
  /* ---------------- MONDAY ---------------- */
  mon: { n: "MONDAY", t: "Lower strength — box jumps, the squat, then Romanian deadlifts, Bulgarian split squats, leg curls, calves and leg raises, then the neck and rear delts", ac: C.oxide, box: 1,
    intro: "Box jumps while you're fresh, the squat heavy, then size for the legs, then the neck and rear delts.", b: [
    { L: "A", n: "Warm-up", m: 5, p: "S_WU_MON", rxLine: () => "5 min · bike, the Spanish squat hold" },
    { L: "K", n: "Box Jumps", since: "2026-11-13", m: (rx) => (rx.half ? 3 : 5), star: 1, hard: 1, rest: "Rest 60 s", rt: 60,
      rxLine: (rx) => hs(rx, 4) + " × 3",
      items: (rx) => [{ n: "Box jump", s: hs(rx, 4) + " × 3 · onto a knee-high box", cue: "Onto a box about knee height, landing soft, stepping down.", id: "boxjump", k: "chk" }],
      w: "Every jump as high as you can make it. A jump clearly lower than the first ends the set.",
      why: "The week's second jump day, before the squat: box jumps land the softest of all the jumps, and they sharpen the heavy sets that follow." },
    { L: "B", n: "Load-Velocity Profile — Squat", m: 12, star: 1, profile: "squat", hide: (rx) => !rx.profile,
      rxLine: () => "five loads × 2 reps, fast, the watch recording",
      items: [{ n: "Squat at five loads", s: FIVE, cue: "Two reps at each load, as fast as the bar will move, the watch recording the mean speed.", id: "s_prof_sq", k: "chk" }],
      why: PROFILE_WHY },
    { L: "J", n: "Broad Jump", m: 4, star: 1, hard: 1, prepTest: 1, hide: (rx) => !rx.testWeek, rxLine: () => "best of three",
      items: [{ n: "Broad jump", s: "best of three · from a line to the back of your heels", cue: "Open floor, never towards a wall. Two-foot jump forward from a line, stick the landing, and measure from the line to the back of your heels.", id: "s_bj", k: "out", u: "best distance (cm)" }],
      why: "Test week: the broad jump measures what the power work did." },
    { L: "C", n: "Back Squat", m: mainM, star: 1, hard: 1, mainLift: "squat", vel: "squat", hide: (rx) => !!rx.profile,
      rest: (rx) => (rx.contrast ? "Rest 90 s · 3 box jumps · rest 2:00" : "Rest 3:00"), rt: (rx) => (rx.contrast ? 225 : 180),
      rxLine: (rx) => (rx.testWeek ? "the top triple" : sppMainLine(rx) + (rx.contrast ? " · 3 box jumps after each double" : "")),
      items: (rx) => (rx.testWeek ? [topItem("Back squat", "squat", "s_squat_top")]
        : [{ n: "Back squat", s: sppMainLine(rx), cue: "Bar on your upper back, feet about shoulder width, toes slightly out. Brace, sit down between your heels until the crease of your hip is below the top of your knee, then drive up as fast as the bar will go. Pins set just below your lowest point.",
          id: "squat", k: "wr", mk: "squat", pct: rx.main.pct, sets: rx.main.sets, reps: rx.main.reps, ramp: sppRamp(rx.main.pct),
          also: rx.contrast ? "Box jumps" : null, restT: rx.contrast ? thenRest("3 BOX JUMPS — AS HIGH AS YOU CAN") : null }]),
      w: "The beep is the set's last rep: rack it, and the set counts.",
      why: "The heaviest leg lift of the week, off your working max; Thursday's pause squat is the second.", tr: 2 },
    { L: "D", n: "Romanian Deadlift", m: 8, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => hs(rx, 3) + " × " + by(rx, { size: 8, strength: 6, power: 5 }),
      items: (rx) => [{ n: "Romanian deadlift", s: hs(rx, 3) + " × " + by(rx, { size: 8, strength: 6, power: 5 }) + " · one or two left", cue: "Barbell at arm's length, knees soft. Push your hips back and slide the bar down your thighs, back flat, until your hamstrings are at a deep stretch, then drive your hips forward to stand.", id: "rdl", k: "wr", sets: hs(rx, 3), reps: by(rx, { size: 8, strength: 6, power: 5 }) }],
      why: "The hamstrings and hips at full stretch." },
    { L: "E", n: "Bulgarian Split Squat", m: 9, rest: "Rest 90 s", rt: 90,
      rxLine: (rx) => hs(rx, by(rx, BSS)[0]) + " × " + by(rx, BSS)[1] + " each leg",
      items: (rx) => [{ n: "Bulgarian split squat", s: hs(rx, by(rx, BSS)[0]) + " × " + by(rx, BSS)[1] + " each leg · one or two left", cue: "Back foot on a bench behind you, a dumbbell in each hand, front foot far enough forward that its shin stays fairly upright. Lower until the back knee nearly touches the floor, then drive up through the front heel.", id: "rfess", k: "wr", sets: hs(rx, by(rx, BSS)[0]), reps: by(rx, BSS)[1] + "/leg" }],
      why: "One leg at a time: size for the quads and glutes, and the weak side found." },
    { L: "F", n: "Seated Leg Curl", m: 5, rest: "Rest 75 s", rt: 75,
      rxLine: (rx) => hs(rx, 3) + " × 10–12",
      items: (rx) => [{ n: "Seated leg curl", s: hs(rx, 3) + " × 10–12 · " + DROP.split(",")[0], cue: "Knees lined up with the machine's pivot, the pad behind your legs just above your heels, the top pad down on your thighs, chest leaning slightly forward. Curl all the way, then lower slowly to a full stretch.", id: "s_legcurl", k: "wr", sets: hs(rx, 3), reps: "10–12" }],
      why: "Seated leg curls grew the hamstrings more than lying ones, 14% against 9% (Maeo, 2021)." },
    { L: "G", n: "Standing Calf Raise + Hanging Leg Raise", m: 6, pair: 1,
      rxLine: () => "back to back · 60 s after each pair",
      items: (rx) => [{ n: "Standing calf raise", s: hs(rx, 3) + " × 10–15 · 2 s at the bottom", cue: "All the way down to a full stretch, hold two seconds, then all the way up.", id: "s_calf", k: "wr", sets: hs(rx, 3), reps: "10–15", rest: "straight into the leg raise", rt: 0 },
        { n: "Hanging leg raise", s: hs(rx, 3) + " × 8–12", cue: "Hang from the bar, curl your pelvis up and lift your knees to your chest without swinging, then lower slowly. Straight legs once that gets easy.", id: "hlr", k: "wr", sets: hs(rx, 3), reps: "8–12", rest: "Rest 60 s", rt: 60 }],
      why: "Back to back, a minute after each pair." },
    /* THE NECK: front and back, light and slow, once a week */
    { L: "N", n: "Lying Neck Curl + Lying Neck Extension", since: "2026-11-08", m: 6, pair: 1, rxLine: () => "back to back · 45 s after each pair",
      items: (rx) => [{ n: "Lying neck curl", s: hs(rx, 3) + " × 15–20 · slow, never jerked", cue: "Lie face up on a bench with your head off the end, a folded towel and a light plate on your forehead, held with both hands. Let your head go back slowly, then curl your chin to your chest. Start with 2.5–5 kg and add a little only when 20 is easy.", id: "s_neckc", k: "wr", sets: hs(rx, 3), reps: "15–20", rest: "straight into the neck extension", rt: 0 },
        { n: "Lying neck extension", s: hs(rx, 3) + " × 15–20 · slow, never jerked", cue: "Lie face down on a bench with your head off the end, a folded towel and a light plate on the back of your head, held with both hands. Lower your chin towards your chest, then lift your head until you're looking straight ahead. Start light, as for the curl.", id: "s_necke", k: "wr", sets: hs(rx, 3), reps: "15–20", rest: "Rest 45 s", rt: 45 }],
      why: "Back to back, 45 seconds after each pair. Light and slow: the neck grows on reps, not heavy plates." },
    /* THE REAR DELTS' third dose: fresh, on the week's shortest session */
    { L: "Q", n: "Chest-Supported Rear-Delt Raise", since: "2026-11-08", m: 4, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 3) + " × 15–20",
      items: (rx) => [{ n: "Chest-supported rear-delt raise", s: hs(rx, 3) + " × 15–20 · one or two left", cue: "Lie face down on an incline bench with light dumbbells hanging straight down. Raise your arms out to the sides to shoulder height, little fingers leading, squeeze the backs of your shoulders, then lower slowly.", id: "s_rdraise", k: "wr", sets: hs(rx, 3), reps: "15–20" }] }] },

  /* ---------------- TUESDAY ---------------- */
  tue: { n: "TUESDAY", t: "Upper strength — rotational throws, then bench and weighted chin-ups, the landmine press, rows, dips, lateral raises and the ab wheel, then the bursts and the pressure rounds", ac: C.cobalt, box: 1,
    intro: "Rotational throws while you're fresh, then bench, weighted chin-ups and the landmine press heavy, then rows and dips for size, then 6-second bursts and the pressure rounds on the assault bike.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "S_WU_TUE", rxLine: () => "6 min · bands, push-ups, two easy throws of each" },
    /* ROTATION: the second throws of the week, three and four days from
       Saturday's, the straight and the hook — first, while you're fresh */
    { L: "K", n: "Rotational Shot-Put Throw + Hook Throw", since: "2026-11-06", m: 5, star: 1, hard: 1, pair: 1, rxLine: () => "alternate · 45 s after each",
      items: (rx) => [{ n: "Rotational shot-put throw", s: hs(rx, 3) + " × 3 each side · 4–6 kg ball, into a wall", cue: "Ball at your shoulder, side-on to the wall in your stance. Drive off your back hip and push the ball into the wall hard and flat, like a straight punch.", id: "s_shotput", k: "chk", rest: "Rest 45 s · then the hook throw", rt: 45 },
        { n: "Hook throw", s: hs(rx, 3) + " × 3 each side", cue: "Ball at chest height in bent arms, side-on to the wall. Pivot hard off your lead leg and sling the ball sideways into the wall.", id: "s_hookthrow", k: "chk", rest: "Rest 45 s · then the shot-put", rt: 45 }],
      w: "Every throw as hard as you can make it. A throw clearly weaker than the first ends the set." },
    { L: "B", n: "Load-Velocity Profile — Bench", m: 10, star: 1, profile: "bench", hide: (rx) => !rx.profile,
      rxLine: () => "five loads × 2 reps, fast, the watch recording",
      items: [{ n: "Bench at five loads", s: FIVE, cue: "Two reps at each load, as fast as the bar will move, the watch recording the mean speed.", id: "s_prof_bp", k: "chk" }],
      why: PROFILE_WHY },
    { L: "C", n: "Bench Press + Weighted Chin-Up", m: (rx) => (rx.contrast ? 30 : rx.main && rx.main.sets >= 5 ? 29 : 23), star: 1, hard: 1, pair: 1, mainLift: "bench", vel: "bench",
      hide: (rx) => !!rx.profile || !!rx.testWeek,
      rxLine: (rx) => "alternate · a set of one, 90 s, a set of the other" + (rx.contrast ? " · 3 chest passes 90 s after each double" : ""),
      items: (rx) => [{ n: "Bench press", s: sppMainLine(rx), cue: "Feet flat, backside on the bench, shoulder blades squeezed together. Lower to your lower chest, pause for a one-count, then press. Pins at chest height, no collars.",
          id: "bench", k: "wr", mk: "bench", pct: rx.main.pct, sets: rx.main.sets, reps: rx.main.reps, ramp: sppRamp(rx.main.pct),
          also: rx.contrast ? "Medicine-ball chest passes" : null,
          rest: rx.contrast ? "Rest 90 s · 3 chest passes · then the chin-up" : "Rest 90 s · then the chin-up", rt: rx.contrast ? 225 : 90,
          restT: rx.contrast ? thenRest("3 MEDICINE-BALL CHEST PASSES — AS HARD AS YOU CAN") : null },
        { n: "Weighted chin-up, palms toward you", s: by(rx, CHIN)[0] + " × " + by(rx, CHIN)[1] + " · the heaviest that leaves two in you", cue: "Palms facing you, hands shoulder width, weight on a belt. From a dead hang, pull until your chin clears the bar, then lower all the way.",
          id: "s_chin", k: "wr", sets: by(rx, CHIN)[0], reps: by(rx, CHIN)[1], rest: "Rest 90 s · then the bench", rt: 90 }],
      w: "The beep is the bench set's last rep: rack it, and the set counts.",
      why: "Go bench, 90 seconds, chins, 90 seconds, so each lift gets three minutes.", tr: 2 },
    { L: "U", n: "Weighted Chin-Up, Palms Toward You", m: 7, hide: (rx) => !rx.profile, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => hs(rx, by(rx, CHIN)[0]) + " × " + by(rx, CHIN)[1],
      items: (rx) => [{ n: "Weighted chin-up, palms toward you", s: hs(rx, by(rx, CHIN)[0]) + " × " + by(rx, CHIN)[1] + " · the heaviest that leaves two in you", cue: "Palms facing you, hands shoulder width, weight on a belt. From a dead hang, pull until your chin clears the bar, then lower all the way.", id: "s_chin", k: "wr", sets: hs(rx, by(rx, CHIN)[0]), reps: by(rx, CHIN)[1] }] },
    { L: "T", n: "Bench Press", m: 18, star: 1, hard: 1, mainLift: "bench", hide: (rx) => !rx.testWeek, rest: "Rest 3:00", rt: 180,
      items: [topItem("Bench press", "bench", "s_bench_top")],
      why: "Test week: × 1.08 is the new working max." },
    { L: "V", n: "Chin-Up Top Triple", m: 8, star: 1, hard: 1, prepTest: 1, hide: (rx) => !rx.testWeek,
      items: [{ n: "Weighted chin-up, palms toward you — top triple", s: "sets of three, 2.5–5 kg more each, to one that's hard but leaves one or two in you · log the added weight", cue: "After a light set or two, sets of three adding 2.5–5 kg, three minutes apart. Stop at the set of three that's hard but leaves one or two in you. Log the weight on the belt.", id: "s_chin_top", k: "out", u: "added kg" }],
      why: "Test week: the heaviest added weight for a clean three." },
    /* THE LANDMINE PRESS: the bar goes up and forward, not straight
       overhead, so the lower back never has to arch to finish it */
    { L: "D", n: "One-Arm Landmine Press", m: 9, hard: 1, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => hs(rx, by(rx, LMP)[0]) + " × " + by(rx, LMP)[1] + " each side",
      items: (rx) => [{ n: "One-arm landmine press", s: hs(rx, by(rx, LMP)[0]) + " × " + by(rx, LMP)[1] + " each side · the heaviest that leaves two in you", cue: "One end of a barbell in a landmine or a corner, the other end at your shoulder in one hand. Split stance, the opposite foot forward, ribs down. Press the bar up and forward until your arm is straight, leaning into it, then lower it under control. Never lean back. Log the weight you add to the bar.", id: "s_lmpress", k: "wr", sets: hs(rx, by(rx, LMP)[0]), reps: by(rx, LMP)[1] + "/side" }],
      why: "Shoulders pressed heavy, one side at a time, with no bar straight overhead." },
    { L: "E", n: (rx) => (rx.upper4 ? "Chest-Supported Row + Push-Ups" : "Chest-Supported Row + Weighted Dip"), m: 9, pair: 1,
      rxLine: () => "alternate · 90 s after each",
      items: (rx) => [{ n: "Chest-supported dumbbell row", s: hs(rx, 3) + " × 8–10 · one or two left", cue: "Chest on a bench set at about 30 degrees, a dumbbell in each hand. Row your elbows back to your hips, squeeze, then lower to a full stretch.", id: "s_csrow", k: "wr", sets: hs(rx, 3), reps: "8–10", rest: "Rest 90 s · then the " + (rx.upper4 ? "push-ups" : "dip"), rt: 90 },
        rx.upper4
          ? { n: "Push-ups", s: hs(rx, 3) + " × 12–15 · two seconds down", cue: "An elbow or a shoulder at 4 or more on Sunday's check: push-ups for the dips, this week only.", id: "s_pushup", k: "wr", sets: hs(rx, 3), reps: "12–15", rest: "Rest 90 s · then the row", rt: 90 }
          : { n: "Weighted dip", s: hs(rx, 3) + " × " + by(rx, { size: "8–10", strength: "6–8", power: "5–6" }) + " · one or two left", cue: "Parallel bars, weight on a belt once 10 bodyweight reps are easy. Lower until your shoulders are level with your elbows, chest slightly forward, then press to locked arms.", id: "s_dip", k: "wr", sets: hs(rx, 3), reps: by(rx, { size: "8–10", strength: "6–8", power: "5–6" }), rest: "Rest 90 s · then the row", rt: 90 }],
      why: "Back and chest for size, a minute and a half after each." },
    { L: "F", n: "Cable Lateral Raise", m: 4, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 3) + " × 12–15",
      items: (rx) => [{ n: "Cable lateral raise", s: hs(rx, 3) + " × 12–15 · one or two left", cue: "Cable at hand height, stand side-on, the handle in your far hand with the cable running behind your back. Raise your arm out to the side to shoulder height, leading with the elbow, then lower slowly.", id: "s_clat_tue", k: "wr", sets: hs(rx, 3), reps: "12–15" }] },
    { L: "G", n: "Ab Wheel Rollout", m: 4, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 3) + " × 8–10",
      items: (rx) => [{ n: "Ab wheel rollout", s: hs(rx, 3) + " × 8–10", cue: "Kneeling, roll forward as far as you can without your lower back sagging, then pull back with your abs.", id: "abwheel", k: "wr", sets: hs(rx, 3), reps: "8–10" }] },
    /* THE BURSTS: six seconds flat out, forty easy, on the assault bike —
       a little power and repeat-effort fitness for ten minutes on a day
       the legs are fresh, halfway between Saturday's 4 × 4 and Thursday */
    { L: "H", n: "Assault Bike Bursts", m: 10, hard: 1, eng: 1, engKey: "bk",
      timer: (rx) => ({ kind: "rz", opt: { sets: 1, n: rx.bk === "sb4" ? 4 : 8, secs: 6, wu: 2, cd: 2 }, title: rx.bk === "sb4" ? "4 BURSTS" : "8 BURSTS" }),
      rxLine: (rx) => (SPPENG[rx.bk] || SPPENG.sb).d,
      items: (rx) => [{ n: "Output", s: "the total on the bike's screen · the peak heart rate", id: "s_burst", k: "out", u: "output / peak HR", erg: sessionBoxes(rx.bk), fields: engHR(rx.bk) }],
      why: "Six seconds flat out, arms and legs, then forty easy. If a burst is clearly weaker than the one before, take an extra 20 seconds; if two in a row are, stop there. Same bike every week, so the totals compare.", tr: 1 },
    /* THE PRESSURE ROUNDS: the fight sim — 3-minute rounds, a 5-second
       burst all out every 20 seconds and a steady pace between, straight
       after the bursts on the same bike. Three, two in the half weeks */
    { L: "I", n: "Pressure Rounds", since: "2026-11-09", m: (rx) => (rx.pr === "pr2" ? 10 : 14), hard: 1, eng: 1, engKey: "pr",
      timer: (rx) => ({ kind: "pressure", opt: { rounds: rx.pr === "pr2" ? 2 : 3, mins: 3, every: 20, secs: 5, rest: 60, wu: 1, cd: 2 }, title: rx.pr === "pr2" ? "2 PRESSURE ROUNDS" : "3 PRESSURE ROUNDS" }),
      rxLine: (rx) => (SPPENG[rx.pr] || SPPENG.pr).d,
      items: (rx) => [{ n: "Output", s: "the total on the bike's screen · the peak heart rate", id: "s_press", k: "out", u: "output / peak HR", erg: sessionBoxes(rx.pr), fields: engHR(rx.pr) }],
      w: "Every burst all out; between them a steady pace, and never stop pedalling.",
      why: "Bursts with seconds to recover, the way you fight. Clear the bike's screen after the bursts, so its total is the rounds' alone. If Thursday's sled times get slower at the same load, or your jump and throw sets keep ending early, two weeks running, the pressure rounds come out for the rest of the twelve weeks.", tr: 1 }] },

  /* ---------------- WEDNESDAY ---------------- */
  wed: { n: "WEDNESDAY", t: "Physique A — chest and back for size, rear delts and cable crunches, lateral raises, the neck and medicine-ball drops, then the nasal run", ac: C.moss, box: 1,
    intro: "Nothing heavy and nothing fast: Thursday is the power session.", b: [
    { L: "A", n: "Warm-up", m: 5, p: "S_WU_WED", rxLine: () => "5 min · bands, push-ups, a light set of the first pair" },
    { L: "B", n: "Incline Dumbbell Press + Lat Pulldown", m: 11, pair: 1, rxLine: () => "alternate · 90 s after each",
      items: (rx) => [{ n: "Incline dumbbell press", s: hs(rx, 3) + " × 8–12 · one or two left", cue: "Bench at 30 degrees. Lower the dumbbells to the sides of your upper chest at a deep stretch, then press up and slightly in.", id: "s_incdb", k: "wr", sets: hs(rx, 3), reps: "8–12", rest: "Rest 90 s · then the pulldown", rt: 90 },
        { n: "Lat pulldown", s: hs(rx, 3) + " × 10–12 · one or two left", cue: "Lean back slightly and pull the bar to your upper chest, driving your elbows down, then let it all the way up to a full stretch.", id: "s_pulldown", k: "wr", sets: hs(rx, 3), reps: "10–12", rest: "Rest 90 s · then the press", rt: 90 }] },
    { L: "C", n: "Low-to-High Cable Fly + Wide-Grip Seated Row", m: 9, pair: 1, rxLine: () => "alternate · 75 s after each",
      items: (rx) => [{ n: "Low-to-high cable fly", s: hs(rx, 3) + " × 12–15 · one or two left", cue: "Cables set low, step forward, and sweep your hands up and together to chin height, arms slightly bent. Lower to a full stretch.", id: "s_fly", k: "wr", sets: hs(rx, 3), reps: "12–15", rest: "Rest 75 s · then the row", rt: 75 },
        { n: "Wide-grip seated cable row", s: hs(rx, 3) + " × 10–12 · one or two left", cue: "Pull the bar to your upper chest with your elbows out, squeeze your upper back, then reach forward to a full stretch.", id: "s_wrow", k: "wr", sets: hs(rx, 3), reps: "10–12", rest: "Rest 75 s · then the fly", rt: 75 }] },
    { L: "D", n: "Reverse Pec-Deck + Cable Crunch", m: 7, pair: 1, rxLine: () => "back to back · 60 s after each pair",
      items: (rx) => [{ n: "Reverse pec-deck", s: hs(rx, 3) + " × 15–20 · one or two left", cue: "Face the machine, arms straight out in front, and sweep them back until they're level with your body.", id: "s_rpd", k: "wr", sets: hs(rx, 3), reps: "15–20", rest: "straight into the cable crunch", rt: 0 },
        CRUNCH(rx)],
      why: "Back to back, a minute after each pair." },
    { L: "E", n: "Dumbbell Lateral Raise", m: 6, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 4) + " × 12–20",
      items: (rx) => [{ n: "Dumbbell lateral raise", s: hs(rx, 4) + " × 12–20 · " + DROP, cue: "Lean slightly forward, raise the dumbbells out to the sides to shoulder height, elbows soft, and lower slowly.", id: "s_dblat", k: "wr", sets: hs(rx, 4), reps: "12–20" }] },
    /* DURABILITY: the neck side to side, and the brace that takes a body
       shot — back to back, before the run */
    { L: "F", n: "Side Neck Raise + Medicine-Ball Drops", since: "2026-11-13", m: 7, pair: 1, rxLine: () => "back to back · 45 s after each pair",
      items: (rx) => [{ n: "Side neck raise", s: hs(rx, 3) + " × 12–15 each side · no weight to start", cue: "Lie on your side on a bench with your head off the end. Lower your ear slowly towards the floor, then lift it towards the ceiling. No weight to start; when 15 is easy, hold a light plate against the side of your head. Never jerk it.", id: "s_neckside", k: "wr", sets: hs(rx, 3), reps: "12–15/side", rest: "straight into the drops", rt: 0 },
        { n: "Medicine-ball drops", s: hs(rx, 3) + " × 8 · a 3 kg ball, up to 6", cue: "Lie on your back, knees bent, the ball held at arm's length over your stomach. Breathe out hard through your teeth and brace as you let it go; it lands just above your belly button, and you catch it on the bounce. Never on the ribs.", id: "s_drops", k: "chk", rest: "Rest 45 s", rt: 45 }],
      why: "Back to back, 45 seconds after each pair. The neck is trained forward and back on Monday and side to side here; the drops train the brace to fire on time." },
    nasalRun("R")] },

  /* ---------------- THURSDAY ---------------- */
  thu: { n: "THURSDAY", t: "Lower power — the sled, flying sprints and jumps, trap bar jumps, the trap bar deadlift and shrugs, the pause squat, Nordics, then side planks and dead bugs", ac: C.brass, box: 1,
    intro: "Sled, sprints and jumps while you're fresh, then the trap bar heavy, heavy shrugs on the same bar and a second, lighter squat, then an ab finish. Friday's rest after it.", b: [
    { L: "A", n: "Warm-up", m: 10, p: "S_WU_THU", rxLine: () => "10 min · bike, swings, skips, lunges, then the three build-ups" },
    { L: "B", n: "Heavy Sled Sprint", m: (rx) => (rx.half ? 8 : 12), star: 1, hard: 1, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => sppSled(rx) + " × 20 m",
      items: (rx) => [{ n: "Heavy sled sprint 20 m", s: sppSled(rx) + " × 20 m @ 40–60% of bodyweight", cue: "Lean in at about 45 degrees and drive the ground backward through the whole foot, 5–7 seconds a run. Faster than that, add weight; slower, take some off.", id: "sled", k: "out", u: "load (kg) · time (s)", fields: SLED_FIELDS, bwp: [40, 60], bwl: "on the sled", runs: 1 }],
      why: "Heavy sled sprints improve the first metres of a sprint and the forward push (Alcaraz, 2018; Morin, 2017)." },
    { L: "C", n: "Flying Sprints", m: 10, star: 1, hard: 1, hide: (rx) => !!rx.testWeek || !!rx.noFlying, rest: "Rest 2:30", rt: 150,
      rxLine: (rx) => sppSprints(rx) + " × 20 m " + (rx.spr90 ? "at 90%" : "flat out"),
      items: (rx) => [{ n: "Flying sprint 20 m", s: sppSprints(rx) + " × 20 m · " + (rx.spr90 ? "at 90%" : "flat out"), cue: "Jog-build for 15 metres, then run 20 metres absolutely flat out, and walk back.", id: "s_sprint", k: "chk" }],
      w: (rx) => (rx.spr90 ? "Weeks 1 and 2 at 90%, flat out from week 3. " : "") + "A hamstring twinge on the build-ups ends the sprints for the day." },
    { L: "D", n: "Box Jumps", m: 6, star: 1, hard: 1, hide: (rx) => !!rx.jump || !!rx.testWeek, rest: "Rest 90 s", rt: 90,
      rxLine: (rx) => hs(rx, 4) + " × 3",
      items: (rx) => [{ n: "Box jump", s: hs(rx, 4) + " × 3 · onto a knee-high box", cue: "Onto a box about knee height, landing soft, stepping down.", id: "boxjump", k: "chk" }],
      w: "Every jump as high as you can make it. A jump clearly lower than the first ends the set." },
    { L: "E", n: (rx) => jumpOf(rx.jump).n, m: 6, star: 1, hard: 1, hide: (rx) => !rx.jump || !!rx.noJumps || !!rx.testWeek, rest: "Rest 90 s", rt: 90,
      rxLine: (rx) => hs(rx, 4) + " × 3 · " + jumpOf(rx.jump).box,
      items: (rx) => [{ n: jumpOf(rx.jump).item, s: hs(rx, 4) + " × 3 · " + jumpOf(rx.jump).box, cue: jumpOf(rx.jump).cue, id: "s_react", k: "chk" }],
      w: (rx) => jumpOf(rx.jump).w,
      why: (rx) => (rx.restart ? "Back under 3 on Sunday's check: the jumps restart one stage down for a week. " : "") + JUMP_GATE_LINE },
    { L: "P", n: "Load-Velocity Profile — Trap Bar", m: 12, star: 1, profile: "tbdl", hide: (rx) => !rx.profile,
      rxLine: () => "five loads × 2 reps, then the trap bar jump at four",
      items: [{ n: "Trap bar at five loads", s: FIVE, cue: "Two reps at each load, as fast as the bar will move, the watch recording the mean speed.", id: "s_prof_tb", k: "chk" },
        { n: "Trap bar jump at four loads", s: "10 · 20 · 30 · 40% of the trap bar — two reps each", cue: "Two jumps at each load, the watch recording the mean speed. The load with the highest power is the one you jump with until the next profile.", id: "s_prof_tj", k: "chk" }],
      why: PROFILE_WHY },
    { L: "F", n: "Trap Bar Jump", m: 6, star: 1, hard: 1, hide: (rx) => !!rx.profile, rest: "Rest 90 s", rt: 90,
      rxLine: (rx) => (rx.testWeek ? 3 : 4) + " × 3 @ your peak-power load",
      items: (rx) => [{ n: "Trap bar jump", s: (rx.testWeek ? 3 : 4) + " × 3 @ your peak-power load", cue: "Stand inside the bar, dip and jump as high as you can, land soft with bent knees, reset, go again.", id: "s_tbjump", k: "wr", mk: "tbdl", pct: rx.tjPct, sets: rx.testWeek ? 3 : 4, reps: 3 }],
      w: "Every jump as high as you can make it. A jump clearly lower than the first ends the set." },
    { L: "G", n: "Trap Bar Deadlift", m: mainM, star: 1, hard: 1, mainLift: "tbdl", vel: "tbdl", hide: (rx) => !!rx.profile,
      rest: (rx) => (rx.contrast ? "Rest 90 s · 3 broad jumps · rest 2:00" : "Rest 3:00"), rt: (rx) => (rx.contrast ? 225 : 180),
      rxLine: (rx) => (rx.testWeek ? "the top triple" : sppMainLine(rx) + (rx.contrast ? " · 3 broad jumps after each double" : "")),
      items: (rx) => (rx.testWeek ? [topItem("Trap bar deadlift", "tbdl", "s_tbdl_top")]
        : [{ n: "Trap bar deadlift", s: sppMainLine(rx), cue: "Stand inside the bar, hips back, chest up, grip the handles and push the floor away until hips and knees lock out together. No hitch, no leaning back.",
          id: "tbdl", k: "wr", mk: "tbdl", pct: rx.main.pct, sets: rx.main.sets, reps: rx.main.reps, ramp: sppRamp(rx.main.pct),
          also: rx.contrast ? "Broad jumps" : null, restT: rx.contrast ? thenRest("3 BROAD JUMPS — FOR DISTANCE, STICK THE LANDING") : null }]),
      w: "The beep is the set's last rep: set it down, and the set counts.",
      why: "The heaviest pull of the week, off your working max.", tr: 2 },
    /* THE TRAPS: the week's second shrug, heavy, on the bar that's already loaded */
    { L: "J", n: "Trap Bar Shrug", since: "2026-11-08", m: 4, rest: "Rest 75 s", rt: 75, rxLine: (rx) => hs(rx, 3) + " × 8–12",
      items: (rx) => [{ n: "Trap bar shrug", s: hs(rx, 3) + " × 8–12 · a second's hold at the top", cue: "Stand inside the trap bar, arms straight. Shrug straight up towards your ears, hold for a second, then lower to a full stretch. Never roll the shoulders.", id: "s_tbshrug", k: "wr", sets: hs(rx, 3), reps: "8–12" }] },
    { L: "H", n: "Pause Squat", m: 7, hard: 1, mainLift: "squat", hide: (rx) => !sppPsq(rx), rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => sppPsq(rx).sets + " × " + sppPsq(rx).reps + " @ " + sppPsq(rx).pct + "%",
      items: (rx) => { const q = sppPsq(rx);
        return [{ n: "Pause squat", s: q.sets + " × " + q.reps + " · 2-second pause @ " + q.pct + "%", cue: "Monday's squat with a dead stop at the bottom for two seconds, staying tight, then up as fast as the bar will move. Pins set.", id: "pausesq", k: "wr", mk: "squat", pct: q.pct, sets: q.sets, reps: q.reps }]; },
      why: "The week's second squat, a percentage of your squat working max." },
    { L: "I", n: "Nordic Curls", m: 6, hard: 1, rest: "Rest 90 s", rt: 90, painIf: (rx) => !!rx.nordicPF,
      rxLine: (rx) => hs(rx, 3) + " × 4–6" + (rx.nordicPF ? " · only if pain-free" : ""),
      items: (rx) => [{ n: "Nordic curl", s: hs(rx, 3) + " × 4–6" + (rx.nordicPF ? " · only if pain-free" : ""), cue: "Kneel with your heels anchored under a pad. Keep your body straight from knees to head and lower yourself forward as slowly as you can, catch yourself with your hands, and push back up.", id: "nordic", k: "wr", sets: hs(rx, 3), reps: "4–6" }],
      w: (rx) => (rx.nordicPF ? "Hamstring at 3 or more on Sunday's check: the Nordics only if they're pain-free." : "Stop the set the moment the lower back rounds.") },
    /* THE ABS, the easy day's way: the trunk held still, never to failure,
       and last, so nothing heavy comes after it */
    { L: "K", n: "Side Plank + Dead Bug", since: "2026-11-09", m: 5, pair: 1, rxLine: () => "back to back · 30 s after each pair",
      items: (rx) => [SIDE_PLANK(rx, { rest: "straight into the dead bug", rt: 0 }),
        { n: "Dead bug", s: hs(rx, 2) + " × 10 each side · slow", cue: "Lie on your back, arms pointing at the ceiling, knees bent above your hips. Press your lower back into the floor, slowly lower one arm and the opposite leg to just above the floor, bring them back, then switch.", id: "s_deadbug", k: "chk", rest: "Rest 30 s", rt: 30 }],
      why: "Back to back, 30 seconds after each pair. Easy work that holds the trunk still, never to failure: the hard days do the growing." }] },

  /* ---------------- FRIDAY ---------------- */
  fri: { n: "FRIDAY", t: "Off — sleep", m: 0, ac: C.moss, sleep: 1, free: 1,
    intro: "No alarm. Saturday is the longest session of the week.", b: [] },

  /* ---------------- SATURDAY ---------------- */
  sat: { n: "SATURDAY", t: "Upper power — throws, bench throws and the landmine push press, then bench and back for size, side planks and landmine rotations, then the 4 × 4", ac: C.oxide, free: 1,
    intro: "Throws, bench throws and the landmine push press while you're fresh from Friday's rest, then bench and back for size, an ab finish, then the 4 × 4.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "S_WU_SAT", rxLine: () => "6 min · bands, push-ups, two easy throws of each" },
    { L: "B", n: "Medicine-Ball Chest Pass + Rotational Scoop Throw", m: 7, star: 1, hard: 1, pair: 1, rxLine: () => "alternate · 60 s after each",
      items: (rx) => [{ n: "Medicine-ball chest pass", s: hs(rx, 3) + " × 5 · 4–6 kg ball, into a wall", cue: "Stand a metre from a solid wall with the ball at your chest and throw it into the wall as hard and fast as you can, then catch the rebound.", id: "s_chestpass", k: "chk", rest: "Rest 60 s · then the scoop throw", rt: 60 },
        { n: "Rotational scoop throw", s: hs(rx, 3) + " × 4 each side", cue: "Side-on to the wall, ball at your back hip. Drive off your back foot and turn your hips through to throw it into the wall.", id: "s_scoop", k: "chk", rest: "Rest 60 s · then the chest pass", rt: 60 }],
      w: "Every throw as hard as you can make it. A throw clearly weaker than the first ends the set." },
    { L: "P", n: "Load-Velocity Profile — Bench Throw", m: 6, star: 1, profile: "bthrow", hide: (rx) => !rx.profile,
      rxLine: () => "the bench throw at four loads · 2 reps each, the watch recording",
      items: [{ n: "Bench throw at four loads", s: "20 · 30 · 40 · 50% of the bench — two reps each", cue: "Two throws at each load, the watch recording the mean speed. The load with the highest power is the one you throw until the next profile.", id: "s_prof_bt", k: "chk" }],
      why: PROFILE_WHY },
    { L: "C", n: "Bench Throw (Smith)", m: 7, star: 1, hard: 1, hide: (rx) => !!rx.profile, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => hs(rx, 4) + " × 3 @ your peak-power load",
      items: (rx) => [{ n: "Bench throw", s: hs(rx, 4) + " × 3 @ your peak-power load", cue: "Smith machine, with its safety stops set so the bar rests a couple of centimetres above your chest. Lower the bar to the stops, throw it so hard it leaves your hands, catch it with soft elbows and lower it back to the stops.", id: "throw", k: "wr", mk: "bench", pct: rx.btPct, sets: hs(rx, 4), reps: 3 }],
      note: BENCH_THROW_NOTE, w: "Every throw as fast as you can make it. A throw clearly slower than the first ends the set." },
    /* THE LANDMINE PUSH PRESS: the legs start the bar and one arm finishes
       it, up and forward — the week's fast press, with no bar overhead */
    { L: "D", n: "One-Arm Landmine Push Press", m: (rx) => (rx.half ? 8 : rx.acc === "size" ? 13 : 15), star: 1, hard: 1, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => sppPp(rx).sets + " × " + sppPp(rx).reps + " each side · every rep fast",
      items: (rx) => [{ n: "One-arm landmine push press", s: sppPp(rx).sets + " × " + sppPp(rx).reps + " each side · every rep fast", cue: "The landmine press with a leg drive: the end of the bar at your shoulder, split stance, the opposite foot forward. A quick dip of the knees, then drive hard with the legs and punch the bar up and forward to a straight arm. Lower it under control and reset. Log the weight you add to the bar.",
        id: "s_lmpush", k: "wr", sets: sppPp(rx).sets, reps: sppPp(rx).reps + "/side" }],
      w: "Every rep as fast as you can make it. A rep clearly slower than the first ends the set.",
      why: "When every rep of every set is fast, add the smallest step next time.", tr: 1 },
    { L: "E", n: "Bench Press, Touch and Go + Pull-Up", m: 11, pair: 1, rxLine: () => "alternate · 90 s after each",
      items: (rx) => [{ n: "Bench press, touch and go", s: hs(rx, 3) + " × " + by(rx, BTG).reps + " @ " + by(rx, BTG).pct + "%", cue: "Tuesday's bench without the pause: lower under control, touch your chest and press." + (rx.acc === "power" ? " Fast." : ""), id: "s_bench_tg", k: "wr", mk: "bench", pct: by(rx, BTG).pct, sets: hs(rx, 3), reps: by(rx, BTG).reps, rest: "Rest 90 s · then the pull-up", rt: 90 },
        { n: "Pull-up", s: hs(rx, 3) + " × 8–10 · one or two left", cue: "Palms facing away, hands just outside shoulder width. From a dead hang, pull until your chin is over the bar. Weight on a belt once 10 is easy.", id: "s_pullup", k: "wr", sets: hs(rx, 3), reps: "8–10", rest: "Rest 90 s · then the bench", rt: 90 }] },
    { L: "F", n: "One-Arm Dumbbell Row", m: 6, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 3) + " × 8–12 each side",
      items: (rx) => [{ n: "One-arm dumbbell row", s: hs(rx, 3) + " × 8–12 each side · one or two left", cue: "One knee and one hand on a bench, the dumbbell hanging at full stretch. Row it to your hip, then lower slowly.", id: "s_1arow", k: "wr", sets: hs(rx, 3), reps: "8–12/side" }] },
    { L: "G", n: "Cable Lateral Raise", m: 4, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 3) + " × 15–20",
      items: (rx) => [{ n: "Cable lateral raise", s: hs(rx, 3) + " × 15–20 · " + DROP, cue: "Cable at hand height, the handle in your far hand with the cable behind your back. Raise your arm out to shoulder height and lower slowly.", id: "s_clat_sat", k: "wr", sets: hs(rx, 3), reps: "15–20" }] },
    /* THE ABS: the side plank, then rotation under load, turned from the
       hips — before the 4 × 4, with nothing heavy after it */
    { L: "J", n: "Side Plank", since: "2026-11-09", m: 3, rest: "Rest 30 s", rt: 30, rxLine: (rx) => hs(rx, 2) + " × 30–45 s each side",
      items: (rx) => [SIDE_PLANK(rx)] },
    { L: "K", n: "Landmine Rotation", since: "2026-11-09", m: 4, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 3) + " × 6–8 each side",
      items: (rx) => [{ n: "Landmine rotation", s: hs(rx, 3) + " × 6–8 each side · controlled", cue: "One end of a barbell in a landmine or a corner, the other end at arm's length in front of your chest, feet wide. Swing it down to one hip by turning your hips and pivoting your back foot, arms straight, then across to the other side, trunk braced. Start with the bar plus 5–10 kg.", id: "s_landrot", k: "wr", sets: hs(rx, 3), reps: "6–8/side" }],
      why: "Rotation under load, driven from the hips: the force side of the turn the throws train fast." },
    { L: "H", n: (rx) => (rx.e === "vo2s" ? "The 3 × 4 Intervals" : "The 4 × 4 Intervals"), m: 30, star: 1, hard: 1, eng: 1, engKey: "e",
      timer: (rx) => ({ kind: "vo2", opt: { n: 4, short: rx.e === "vo2s" ? 1 : 0, wu: 5, cd: 3 }, title: rx.e === "vo2s" ? "THE 3 × 4" : "THE 4 × 4" }),
      rxLine: (rx) => (SPPENG[rx.e] || SPPENG.vo2).d,
      items: (rx) => [{ n: "Output", s: "the total on the bike's screen · the peak heart rate", id: "s_44", k: "out", u: "output / peak HR", erg: sessionBoxes(rx.e), fields: engHR(rx.e) }],
      why: (rx) => (rx.testWeek ? "Test week: the 4 × 4 is the engine test. " : "") + "Use the same bike every week. Progress is more on the screen at the same peak heart rate, or the same at a lower one.", tr: 1 }] },

  /* ---------------- SUNDAY ---------------- */
  sun: { n: "SUNDAY", t: "Physique B — shoulders, traps and cable crunches, arms and calves, and the Pallof press, then the nasal run and the weekly check", ac: C.brass, free: 1,
    intro: "Shoulders, traps, abs, arms and calves for size, and the Pallof press, then a 30-minute nasal run.", b: [
    { L: "A", n: "Warm-up", m: 4, p: "S_WU_SUN", rxLine: () => "4 min · bands, a light set of the first two" },
    { L: "B", n: "Cable Lateral Raise", m: 6, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 4) + " × 12–20",
      items: (rx) => [{ n: "Cable lateral raise", s: hs(rx, 4) + " × 12–20 · " + DROP, cue: "Cable at hand height, the handle in your far hand with the cable behind your back. Raise your arm out to shoulder height, leading with the elbow, and lower slowly.", id: "s_clat_sun", k: "wr", sets: hs(rx, 4), reps: "12–20" }] },
    { L: "C", n: "Face Pull", m: 4, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 3) + " × 15–20",
      items: (rx) => [{ n: "Face pull", s: hs(rx, 3) + " × 15–20 · one or two left", cue: "Rope on a cable at forehead height. Pull the rope towards your forehead, hands apart and elbows high, and squeeze the backs of your shoulders.", id: "s_face", k: "wr", sets: hs(rx, 3), reps: "15–20" }] },
    { L: "D", n: "Dumbbell Shrug + Cable Crunch", m: 8, pair: 1, rxLine: () => "back to back · 60 s after each pair",
      items: (rx) => [{ n: "Dumbbell shrug", s: hs(rx, 3) + " × 10–15 · a second's hold at the top", cue: "Heavy dumbbells at your sides. Lift your shoulders straight up towards your ears, hold for a second, then lower to a full stretch.", id: "s_shrug", k: "wr", sets: hs(rx, 3), reps: "10–15", rest: "straight into the cable crunch", rt: 0 },
        CRUNCH(rx)],
      why: "Back to back, a minute after each pair." },
    { L: "E", n: "EZ-Bar Curl + Overhead Triceps Extension", m: 7, pair: 1, hide: (rx) => !!rx.upper4, rxLine: () => "alternate · 60 s after each",
      items: (rx) => [{ n: "EZ-bar curl", s: hs(rx, 3) + " × 8–12 · one or two left", cue: "Elbows pinned at your sides. Curl up, then take two seconds to lower to straight arms.", id: "s_ezcurl", k: "wr", sets: hs(rx, 3), reps: "8–12", rest: "Rest 60 s · then the triceps", rt: 60 },
        { n: "Overhead cable triceps extension", s: hs(rx, 3) + " × 10–15 · one or two left", cue: "Elbows pointing at the ceiling, lower your hands behind your head to a deep stretch, then straighten your arms.", id: "s_ohtri", k: "wr", sets: hs(rx, 3), reps: "10–15", rest: "Rest 60 s · then the curl", rt: 60 }],
      why: "Overhead triceps extensions grew the triceps 1.4 times as much as pushdowns (Maeo, 2023)." },
    { L: "F", n: "Incline Dumbbell Curl + Dumbbell Skull Crusher", m: 7, pair: 1, hide: (rx) => !!rx.upper4, rxLine: () => "alternate · 60 s after each",
      items: (rx) => [{ n: "Incline dumbbell curl", s: hs(rx, 3) + " × 10–12 · one or two left", cue: "Bench at 45 degrees, arms hanging straight down behind your body: the stretch is the point. Curl without letting your elbows move forward.", id: "s_inccurl", k: "wr", sets: hs(rx, 3), reps: "10–12", rest: "Rest 60 s · then the skull crusher", rt: 60 },
        { n: "Dumbbell skull crusher", s: hs(rx, 3) + " × 10–12 · one or two left", cue: "Lie on a flat bench, dumbbells above your shoulders, palms facing each other. Bend only at the elbows to lower the dumbbells beside your head to a deep stretch, then straighten.", id: "s_skull", k: "wr", sets: hs(rx, 3), reps: "10–12", rest: "Rest 60 s · then the curl", rt: 60 }] },
    { L: "G", n: "Hammer Curl", m: 3, hide: (rx) => !!rx.upper4, rest: "Rest 60 s", rt: 60, rxLine: (rx) => hs(rx, 2) + " × 10–12",
      items: (rx) => [{ n: "Hammer curl", s: hs(rx, 2) + " × 10–12 · one or two left", cue: "Thumbs up, elbows at your sides. Curl, then lower slowly.", id: "s_hammer", k: "wr", sets: hs(rx, 2), reps: "10–12" }] },
    /* THE TRUNK: holding against a twist, back to back with the calves */
    { L: "H", n: "Seated Calf Raise + Pallof Press", m: 7, pair: 1, rxLine: () => "back to back · 60 s after each pair",
      items: (rx) => [{ n: "Seated calf raise", s: hs(rx, 3) + " × 12–15 · 2 s at the bottom", cue: "Pad on your knees. Lower your heels to a full stretch and hold for two seconds, then rise all the way up.", id: "s_scalf", k: "wr", sets: hs(rx, 3), reps: "12–15", rest: "straight into the Pallof press", rt: 0 },
        { n: "Pallof press", s: hs(rx, 3) + " × 10 each side", cue: "A band or cable at chest height beside you, standing side-on. Hold the handle at your chest, press your hands straight out and hold two seconds without letting it twist you, then bring them back. When 10 is easy, stand further from the anchor.", id: "s_pallof", k: "chk", rest: "Rest 60 s", rt: 60 }],
      why: "Back to back, a minute after each pair." },
    nasalRun("R"),
    { L: "I", n: "Weekly Check", m: 2, review: 1, rangeTests: 1,
      items: (rx) => checkItems(rx),
      note: "Three red mornings in a week: run the next week as a lighter week. Achilles or knee at 3 or more: no reactive jumps next week, the tendon holds carry on. Hamstring at 3 or more: no flying sprints next week, Nordics only if pain-free. That's the tendon gate, and it runs whatever the strap says. An elbow or a shoulder at 4 or more: next week's dips become push-ups and Sunday's curls and triceps work comes off." }] },
};


/* a session's minutes: its blocks as the week runs them, with the moves between */
const vv = (x, rx) => (typeof x === "function" ? x(rx) : x);
["mon", "tue", "wed", "thu", "sat", "sun"].forEach((d) => { const S = SS[d];
  S.m = (rx) => S.b.filter((b) => b.L && !(b.hide && b.hide(rx)) && !b.review).reduce((a, b) => a + (Number(vv(b.m, rx)) || 0) + (Number(b.tr) || 0), 0); });

export const sppSess = (day) => SS[day] || null;
