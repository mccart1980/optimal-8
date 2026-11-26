import { describe, it, expect } from "vitest";
import sppMd from "../optimal-8-strength-power-physique.md?raw";
import builderMd from "../season-builder.md?raw";
import { buildSeason, rowRx, describeSeason, CYCLE12, CYCLE16 } from "./builder.js";
import { SPP_ROWS, sppRx, sppSess, sppTests, sppVelPhase, sppRamp, sppPhotoDay, sppMainLine, sppPp, sppSled, SPPROTO, SPPENG, SPP_READY_LINE,
  ENGINE_SINCE, sppEasyHour, sppSunRun, AUDIT_SINCE, sppAudit, spp44Short, sppTread, sppPrRounds, sppArms, sppPowerTest,
  FIT_SINCE, sppBss, sppOrder, sppCards, sppSprints } from "./spp.js";
import { targetFor, TYPICAL } from "./velocity.js";
import { parseKey, inScope, scopeOf, weekLabel, ergSeries, series, seriesMean, DASH_IDS, BAR_SPEED_ITEMS, BAR_SPEED_FAST, barSpeeds, lastSession, rangeTop, topOfRange, liftHistory } from "./metrics.js";
import { libFor } from "./library.js";
import { sessionCatalog, boxJumpsDone, countsOn } from "./App.jsx";

/* ================================================================
   OPTIMAL 8 · STRENGTH, POWER AND PHYSIQUE — the proof.
   1 · the season: picked inside a Prep, the Prep carries on to its
       test day and the twelve weeks start the Monday after; on repeat;
       a cycle that's running carries on; START NOW and START AGAIN; a
       fight booked takes over from the next Monday
   2 · the twelve weeks are the document's table, row for row
   3 · the session pages, as the document writes them, block by block
   4 · the standing rules on its pages: the tendon gate, the elbow and
       shoulder rule, red days
   5 · PROGRESS reads its own weeks; bar speed reads the line at the
       set's own percentage
   ================================================================ */
const P = (from, made, inputs) => ({ from, made, inputs: Object.assign({ booked: false, rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "good", emphasis: "none" }, inputs) });
const ids = (s, a, b) => s.rows.filter((r) => r.mon >= a && r.mon < b).map((r) => r.id);

describe("1 · the season", () => {
  /* the plan in use: Prep from Monday 26 October, Strength, Power and Physique picked on Thursday 29 October */
  const his = buildSeason({ plans: [P("2026-10-26", "2026-10-25", {}), P("2026-11-02", "2026-10-29", { spp: true })], today: "2026-10-29" });
  it("picked inside a Prep: the Prep carries on to its test day, Saturday 13 February, and the twelve weeks start Monday 15 February", () => {
    expect(ids(his, "2026-10-26", "2027-02-15")).toEqual(CYCLE16);
    expect(his.rows.find((r) => r.id === "P14").mon).toBe("2027-02-08");
    expect(ids(his, "2027-02-15", "2027-05-10")).toEqual(CYCLE12);
    const s1 = his.rows.find((r) => r.program === "spp");
    expect(s1).toMatchObject({ mon: "2027-02-15", id: "S1", doc: 1, idx: 1, cycle: 1, mac: "S", kw: 1 });
    expect(describeSeason(his, "2026-11-02")).toMatch(/^Prep carries on: P2 · P3 · P4 · P4b · P5 · P6 · P7 · P8 · P9 · P10 · P11 · P12 · P12b · P13 · P14, test day Sat,? 13 Feb; then Strength, Power and Physique's 12-week cycle from Mon,? 15 Feb\.$/);
  });
  it("runs on repeat, half a year ahead of today: S12, then S1 of the next cycle, the week keys counted on", () => {
    const later = buildSeason({ plans: [P("2026-10-26", "2026-10-25", {}), P("2026-11-02", "2026-10-29", { spp: true })], today: "2027-03-01" });
    const s = later.rows.filter((r) => r.program === "spp");
    expect(s[12]).toMatchObject({ id: "S1", cycle: 2, kw: 13, mon: "2027-05-10" });
    expect(s.every((r) => r.mac === "S")).toBe(true);
  });
  it("START NOW inside a Prep: the twelve weeks from the plan's Monday", () => {
    const now = buildSeason({ plans: [P("2026-10-26", "2026-10-25", {}), P("2026-11-02", "2026-10-29", { spp: true, restart: true })], today: "2026-10-29" });
    expect(ids(now, "2026-10-26", "2026-11-02")).toEqual(["P1"]);
    expect(ids(now, "2026-11-02", "2027-01-25")).toEqual(CYCLE12);
    expect(describeSeason(now, "2026-11-02")).toMatch(/^Strength, Power and Physique's 12-week cycle from Mon,? 2 Nov\.$/);
  });
  it("a cycle that's running carries on to its test week when Prep is picked; START NOW starts Prep from the plan's Monday", () => {
    const spp = P("2027-02-15", "2027-02-14", { spp: true });
    const on = buildSeason({ plans: [spp, P("2027-03-29", "2027-03-25", {})], today: "2027-03-25" });
    expect(ids(on, "2027-02-15", "2027-05-10")).toEqual(CYCLE12);
    expect(on.rows.filter((r) => r.mon >= "2027-03-29" && r.program === "spp").every((r) => r.carried && r.plan === "2027-02-15")).toBe(true);
    expect(ids(on, "2027-05-10", "2027-05-24")).toEqual(["P1", "P2"]);
    expect(describeSeason(on, "2027-03-29")).toMatch(/^Strength, Power and Physique carries on: S7 · S8 · S9 · S10 · S11 · S12, test week from Mon,? 3 May; then Prep's 16-week cycle from Mon,? 10 May\.$/);
    const now = buildSeason({ plans: [spp, P("2027-03-29", "2027-03-25", { restart: true })], today: "2027-03-25" });
    expect(ids(now, "2027-03-29", "2027-04-12")).toEqual(["P1", "P2"]);
  });
  it("START AGAIN inside a cycle: week 1 from the plan's Monday, the next cycle's number", () => {
    const again = buildSeason({ plans: [P("2027-02-15", "2027-02-14", { spp: true }), P("2027-03-29", "2027-03-25", { spp: true, restart: true })], today: "2027-03-25" });
    expect(ids(again, "2027-02-15", "2027-03-29")).toEqual(CYCLE12.slice(0, 6));
    expect(again.rows.find((r) => r.mon === "2027-03-29")).toMatchObject({ id: "S1", cycle: 2 });
  });
  it("a fight booked inside a cycle takes over from the next Monday: Prep fitted to the weeks before the camp, then the camp", () => {
    const fight = buildSeason({ plans: [P("2027-02-15", "2027-02-14", { spp: true }), P("2027-03-29", "2027-03-25", { booked: true, fight: "2027-09-04", spp: true })], today: "2027-03-25" });
    expect(fight.rows.find((r) => r.mon === "2027-03-29").program).toBe("prep");
    expect(fight.rows.some((r) => r.program === "spp" && r.mon >= "2027-03-29")).toBe(false);
    expect(fight.rows.some((r) => r.program === "camp")).toBe(true);
  });
  it("after a fight: the transition, then the twelve weeks", () => {
    const ex = P("2026-10-12", "2026-10-08", { booked: true, fight: "2026-11-28", rounds: 3, mins: 2, fitness: "low", emphasis: "durability" });
    const after = buildSeason({ plans: [ex, P("2026-11-30", "2026-11-29", { spp: true })], today: "2026-11-29", head: () => ({ a: "no", at: "2026-11-29" }) });
    expect(ids(after, "2026-11-30", "2026-12-21")).toEqual(["T", "S1", "S2"]);
  });
  it("season-builder.md names the twelve weeks", () => {
    expect(builderMd).toMatch(/\*\*S1 · S2 · S3 · S4 · S5 · S6 · S7 · S8 · S9 · S10 · S11 · S12\*\*/);
  });
});

/* the rows of the first markdown table after a heading that matches */
function tableAfter(md, headRe) {
  const lines = md.split(/\r?\n/);
  let i = lines.findIndex((l) => headRe.test(l));
  while (i < lines.length && !/^\|/.test(lines[i])) i++;
  const out = [];
  for (; i < lines.length && /^\|/.test(lines[i]); i++) {
    const cells = lines[i].replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c))) continue;
    out.push(cells);
  }
  return out.slice(1);
}

describe("2 · the twelve weeks are the document's table", () => {
  const doc = tableAfter(sppMd, /^## THE TWELVE WEEKS/);
  it("has twelve rows, S1 to S12", () => {
    expect(doc.map((r) => r[0])).toEqual(CYCLE12);
  });
  it("runs every row's block and main lifts as the table writes them", () => {
    doc.forEach(([id, block, main, rest], i) => {
      const rx = sppRx(i + 1);
      expect(block.toLowerCase()).toBe(rx.blk === "lighter" ? "lighter" : rx.blk);
      if (rx.main) expect(main.startsWith(sppMainLine(rx))).toBe(true);
      if (rx.contrast) expect(main).toMatch(/three jumps after each set/);
      if (rx.profile) expect(main).toMatch(/^The profile/);
      if (rx.testWeek) expect(main).toMatch(/^Top triple/);
      expect(!!rx.half).toBe(/^Half the sets/.test(rest));
    });
  });
  it("the 4 × 4 is 3 × 4 in the lighter weeks, the engine test in test week", () => {
    expect(CYCLE12.map((x, i) => sppRx(i + 1).e)).toEqual(["vo2", "vo2", "vo2", "vo2s", "vo2", "vo2", "vo2", "vo2s", "vo2", "vo2", "vo2", "vo2"]);
    expect(SPPENG.vo2s.d).toMatch(/3 × 4 minutes/);
  });
  it("tests and photos: the profiles in weeks 4 and 8, the top triples in week 12, tape and photos the Sunday of 4, 8 and 12", () => {
    expect(sppTests(4)).toEqual(["the load-velocity profiles", "tape", "photos"]);
    expect(sppTests(12)).toEqual(["the broad jump", "the top triples", "the 4 × 4 as the engine test", "tape", "photos"]);
    expect(sppTests(5)).toEqual([]);
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((d) => sppPhotoDay(d, "sun"))).toEqual([4, 8, 12]);
    expect(sppPhotoDay(12, "sat")).toBe(false);
  });
});

describe("3 · the session pages", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const day = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i);
  const names = (w, d) => day(w, d).map((c) => c.n);
  const card = (w, d, n) => day(w, d).find((c) => c.n === n);
  const ALL12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  it("Monday: box jumps, the squat, then the Romanian deadlift, the split squat, the calves and leg raises, the dead bug and woodchop, then the rear delts", () => {
    /* from the trim (30 November) the leg curl is out and the neck pair is Sunday's */
    expect(names(1, "mon")).toEqual(["The movement block", "Kneeling Jump into Box Jump", "Achilles pushes", "Knee pushes", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Towel Calf Raise + Hanging Leg Raise", "Dead Bug + Cable Woodchop", "Chest-Supported Rear-Delt Raise"]);
    expect(card(1, "mon", "Back Squat").pres).toBe("4 × 6 · 75% · Rest 3:00");
    expect(card(5, "mon", "Back Squat").pres).toBe("5 × 3 · 85% · Rest 3:00");
    expect(card(11, "mon", "Back Squat").pres).toBe("4 × 2 · 95% · Rest 90 s · 3 box jumps · rest 2:00");
    expect(card(11, "mon", "Back Squat").lib.map((e) => e.n)).toEqual(["BACK SQUAT", "BOX JUMPS"]);
    expect([1, 5, 9].map((w) => card(w, "mon", "Romanian Deadlift").pres.split(" · ")[0])).toEqual(["3 × 8", "3 × 6", "3 × 5"]);
    expect([1, 5, 9].map((w) => card(w, "mon", "Bulgarian Split Squat").pres.split(" · ")[0])).toEqual(["2 × 8 each leg", "2 × 6 each leg", "2 × 6 each leg"]);
    expect(card(1, "mon", "Towel Calf Raise + Hanging Leg Raise").kind).toBe("pair");
  });
  it("Tuesday: the rotational throws, then bench and weighted chin-ups as a pair, the landmine press, the landmine rotation, then the bursts and the pressure rounds, then rows and dips and the ab wheel", () => {
    /* from the trim the bike work comes before the rows and dips, and the lateral raise, the side bend and the knuckle hold are out */
    expect(names(1, "tue")).toEqual(["The movement block", "Rotational Shot-Put Throw + Hook Throw", "Bench Press + Weighted Chin-Up", "One-Arm Landmine Press", "Landmine Rotation", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute", "Chest-Supported Row + Weighted Dip", "Ab Wheel Rollout"]);
    const pair = card(5, "tue", "Bench Press + Weighted Chin-Up");
    expect(pair.kind).toBe("pair");
    expect(pair.rows.map((r) => r.n)).toEqual(["Bench press", "Weighted chin-up, palms toward you"]);
    expect(pair.lib.map((e) => e.n)).toEqual(["BENCH PRESS", "WEIGHTED CHIN-UP, PALMS TOWARD YOU"]);
    expect([1, 5, 9].map((w) => card(w, "tue", "One-Arm Landmine Press").pres.split(" · ")[0])).toEqual(["3 × 8 each side", "4 × 5 each side", "3 × 4 each side"]);
    expect(card(9, "tue", "Bench Press + Weighted Chin-Up").lib.map((e) => e.n)).toEqual(["BENCH PRESS", "MEDICINE-BALL CHEST PASSES", "WEIGHTED CHIN-UP, PALMS TOWARD YOU"]);
  });
  it("Wednesday and Sunday: size, then the 30-minute nasal run; Sunday ends with the weekly check", () => {
    expect(names(1, "wed")).toEqual(["The movement block", "Incline Dumbbell Press + Lat Pulldown", "Low-to-High Cable Fly + Wide-Grip Seated Row", "Reverse Pec-Deck + Cable Crunch", "Dumbbell Lateral Raise", "Side Neck Raise + Medicine-Ball Drops", "Cable Woodchop", "The Nasal Run"]);
    expect(card(1, "wed", "The Nasal Run").pres).toBe("30 min easy, nose only · 65–75% of peak");
    expect(names(1, "sun")).toEqual(["The movement block", "Cable Lateral Raise", "Face Pull", "Dumbbell Shrug + Cable Crunch", "Medicine-Ball Drops", "Lying Neck Curl + Lying Neck Extension", "EZ-Bar Curl + Overhead Triceps Extension", "Incline Dumbbell Curl + Dumbbell Skull Crusher", "Hammer Curl", "Back Extension", "Seated Calf Raise + Pallof Press", "The Nasal Run", "Weekly Check"]);
    expect(card(1, "sun", "Cable Lateral Raise").pres).toMatch(/^4 × 12–20 · the last set to failure, then 30% lighter and go again/);
  });
  it("Thursday: the sled and the jumps first, then trap bar jumps, the lower pushes, the trap bar and its shrugs, the pause squat, the Nordics, then the hip pair; the flying sprints are Saturday's", () => {
    expect(names(1, "thu")).toEqual(["The movement block", "Heavy Sled Sprint", "Box Jumps", "Trap Bar Jump", "Rotational Scoop Throw", "Achilles pushes", "Knee pushes", "Trap Bar Deadlift", "Trap Bar Shrug", "Pause Squat", "Nordic Curls", "Copenhagen lifts", "Star side plank", "Weighted Decline Sit-Up"]);
    expect(names(5, "thu")).toContain("Low-Box Depth Jumps");
    expect(names(9, "thu")).toContain("Depth Jumps");
    expect(card(5, "thu", "Low-Box Depth Jumps").pres).toMatch(/^4 × 3 · 20 cm box/);
    expect(card(9, "thu", "Depth Jumps").pres).toMatch(/^4 × 3 · 30–40 cm box/);
    ALL12.forEach((w) => expect([w, names(w, "thu").indexOf("Flying Sprints")]).toEqual([w, -1]));
    expect([1, 3, 5].map((w) => card(w, "sat", "Flying Sprints, Outside").pres)).toEqual(["3 × 20 m · at 90% · Rest 2:30", "3 × 20 m · flat out · Rest 2:30", "4 × 20 m · flat out · Rest 2:30"]);
    expect(card(1, "sat", "Flying Sprints, Outside").lib.map((e) => e.n)).toEqual(["FLYING SPRINTS, OUTSIDE"]);
    expect([1, 5, 9].map((w) => card(w, "thu", "Pause Squat").pres)).toEqual(["3 × 5 · 2-second pause · 65% · Rest 2:00", "3 × 3 · 2-second pause · 72.5% · Rest 2:00", "3 × 2 · 2-second pause · 75% · Rest 2:00"]);
    expect(card(10, "thu", "Trap Bar Deadlift").pres).toBe("4 × 2 · 92.5% · Rest 90 s · 3 broad jumps · rest 2:00");
  });
  it("Saturday: the flying sprints first, outside, then the lower pushes, the throws, the bench throw, the landmine push press, then the 4 × 4, then bench and pull-ups, lateral raises, the hip pair, the landmine rotation and the leg raise", () => {
    /* from the trim: the sprints and their own warm-up first, the one-arm row out, the 4 × 4 ahead of the size work */
    expect(names(1, "sat")).toEqual(["Warm-up", "Flying Sprints, Outside", "The movement block", "Achilles pushes", "Knee pushes", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "One-Arm Landmine Push Press", "The 4 × 4 Intervals", "Bench Press, Touch and Go + Pull-Up", "Cable Lateral Raise", "Copenhagen lifts", "Star side plank", "Landmine Rotation", "Hanging Leg Raise"]);
    expect([1, 5, 9].map((w) => card(w, "sat", "One-Arm Landmine Push Press").pres)).toEqual(["4 × 5 each side · every rep fast · Rest 2:00", "5 × 3 each side · every rep fast · Rest 2:00", "5 × 3 each side · every rep fast · Rest 2:00"]);
    expect(card(1, "sat", "Bench Throw (Smith)").lib.some((e) => e.n === "BENCH THROW" && /safety stops/.test(e.text))).toBe(true);
    expect(card(4, "sat", "The 3 × 4 Intervals").pres).toMatch(/3 × 4 minutes at 90–95% of your peak heart rate/);
  });
  it("Tuesday's bursts: eight 6-second bursts on the assault bike, four in the lighter weeks and test week; the timer runs the easy minutes either side", () => {
    expect(CYCLE12.map((x, i) => sppRx(i + 1).bk)).toEqual(["sb", "sb", "sb", "sb4", "sb", "sb", "sb", "sb4", "sb", "sb", "sb", "sb4"]);
    expect(card(1, "tue", "Assault Bike Bursts").pres).toBe(SPPENG.sb.d);
    expect(SPPENG.sb.d).toMatch(/8 bursts of 6 seconds flat out with 40 seconds easy between/);
    expect(card(4, "tue", "Assault Bike Bursts").pres).toMatch(/4 bursts of 6 seconds/);
    expect(card(12, "tue", "Assault Bike Bursts").pres).toMatch(/4 bursts of 6 seconds/);
    expect(card(1, "tue", "Assault Bike Bursts").lib.map((e) => e.n)).toEqual(["ASSAULT BIKE BURSTS"]);
    const b = sppSess("tue").b.find((x) => x.n === "Assault Bike Bursts");
    expect(b.timer(sppRx(1))).toEqual({ kind: "rz", opt: { sets: 1, n: 8, secs: 6, wu: 2, cd: 2 }, title: "8 BURSTS" });
    expect(b.timer(sppRx(8)).opt.n).toBe(4);
    expect(b.items(sppRx(1))[0].id).toBe("s_burst");
    expect(sppMd).toMatch(/\*\*Assault bike bursts\*\* — 8 bursts, 4 in weeks 4, 8 and 12/);
  });
  it("the lighter weeks: the profiles in place of the main lifts, everything else half the sets, rounded up", () => {
    ["mon", "tue", "thu", "sat"].forEach((d) => expect(day(4, d).some((c) => /^Load-Velocity Profile/.test(c.n))).toBe(true));
    expect(names(4, "mon")).not.toContain("Back Squat");
    expect(names(4, "thu")).not.toContain("Trap Bar Deadlift");
    expect(names(4, "thu")).not.toContain("Trap Bar Jump");
    expect(names(4, "sat")).not.toContain("Bench Throw (Smith)");
    expect(names(4, "sat").slice(0, 9)).toEqual(["Warm-up", "Flying Sprints, Outside", "The movement block", "Achilles pushes", "Knee pushes", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Load-Velocity Profile — Bench Throw", "Push press speed test", "One-Arm Landmine Push Press"]);
    expect(card(4, "tue", "Weighted Chin-Up, Palms Toward You").pres.split(" · ")[0]).toBe("2 × 6");
    expect(card(8, "tue", "Weighted Chin-Up, Palms Toward You").pres.split(" · ")[0]).toBe("3 × 4");
    expect(card(4, "wed", "Dumbbell Lateral Raise").pres.split(" · ")[0]).toBe("2 × 12–20");
    expect(card(4, "sun", "Hammer Curl").pres.split(" · ")[0]).toBe("1 × 10–12");
    expect(card(4, "thu", "Heavy Sled Sprint").pres.split(" · ")[0]).toBe("3 × 20 m");
    expect(card(8, "thu", "Low-Box Depth Jumps").pres.split(" · ")[0]).toBe("2 × 3");
  });
  it("test week: the broad jump and the top triples, the chin-up's added weight, no sprints, depth jumps or pause squats", () => {
    expect(day(12, "mon").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Back Squat"]);
    expect(names(12, "mon").slice(1, 3)).toEqual(["Kneeling Jump into Box Jump", "Broad jump"]);
    expect(day(12, "tue").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Bench Press"]);
    expect(card(12, "tue", "Weighted chin-up, palms toward you — top triple").kind).toBe("out");
    expect(day(12, "thu").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Trap Bar Deadlift"]);
    /* from the audit's week, test week redraws the trap bar jump's profile in its sets' place */
    expect(names(12, "thu")).toEqual(["The movement block", "Heavy Sled Sprint", "Load-Velocity Profile — Trap Bar Jump", "Rotational Scoop Throw", "Achilles pushes", "Knee pushes", "Trap Bar Deadlift", "Trap Bar Shrug", "Nordic Curls", "Copenhagen lifts", "Star side plank", "Weighted Decline Sit-Up"]);
    expect(card(12, "thu", "Load-Velocity Profile — Trap Bar Jump").kind).toBe("eng");
    expect(day(12, "sat").filter((c) => c.kind === "top").map((c) => c.n)).toEqual([]);
    day(12, "mon").concat(day(12, "tue"), day(12, "thu"), day(12, "sat")).filter((c) => c.kind === "top").forEach((c) => expect(c.lib[0].n).toBe("TOP TRIPLE"));
  });
  it("every card names a library entry, the chin-up and the pull-up their own", () => {
    CAT.filter((c) => c.kind !== "review").forEach((c) => { if (c.kind !== "warm") expect(c.lib).toBeTruthy(); c.rows.forEach((r) => expect(r.lib).toBeTruthy()); });
    expect(libFor("Weighted chin-up, palms toward you").map((e) => e.n)).toEqual(["WEIGHTED CHIN-UP, PALMS TOWARD YOU"]);
    expect(libFor("Weighted chin-up").map((e) => e.n)).toEqual(["WEIGHTED CHIN-UPS"]);
    expect(libFor("Pull-up").map((e) => e.n)).toEqual(["PULL-UPS"]);
    expect(libFor("Bulgarian split squat").map((e) => e.n)).toEqual(["SPLIT SQUAT, REAR FOOT ELEVATED"]);
  });
  it("the ramp: bar × 8, then each step at least 5% under the working weight", () => {
    expect(sppRamp(75)).toEqual([[0, 8], [40, 5], [55, 3], [65, 2]]);
    expect(sppRamp(85)).toEqual([[0, 8], [40, 5], [55, 3], [65, 2], [75, 1]]);
    expect(sppRamp(95)).toEqual([[0, 8], [40, 5], [55, 3], [65, 2], [75, 1], [85, 1]]);
  });
});

describe("4 · the standing rules on its pages", () => {
  const visible = (day, rx) => sppSess(day).b.filter((b) => !(b.hide && b.hide(rx))).map((b) => (typeof b.n === "function" ? b.n(rx) : b.n));
  it("the tendon gate: no reactive jumps, the box jumps of the size block untouched; one stage down after; no flying sprints", () => {
    expect(visible("thu", Object.assign({}, sppRx(5), { noJumps: 1 }))).not.toContain("Low-Box Depth Jumps");
    expect(visible("thu", Object.assign({}, sppRx(2), { noJumps: 1 }))).toContain("Box Jumps");
    expect(visible("thu", Object.assign({}, sppRx(9), { jump: "lowbox", restart: 1 }))).toContain("Low-Box Depth Jumps");
    expect(visible("thu", Object.assign({}, sppRx(6), { noFlying: 1 }))).not.toContain("Flying Sprints");
    const nor = sppSess("thu").b.find((b) => b.L === "I");
    expect(nor.painIf(Object.assign({}, sppRx(6), { nordicPF: 1 }))).toBe(true);
  });
  it("an elbow or a shoulder at 4 or more: the dips become push-ups, Sunday's curls and triceps come off", () => {
    const rx = Object.assign({}, sppRx(2), { upper4: 1 });
    expect(visible("tue", rx)).toContain("Chest-Supported Row + Push-Ups");
    const sun = visible("sun", rx);
    ["EZ-Bar Curl + Overhead Triceps Extension", "Incline Dumbbell Curl + Dumbbell Skull Crusher", "Hammer Curl"].forEach((n) => expect(sun).not.toContain(n));
  });
  it("red: the main lifts, sprints, jumps, throws, the 4 × 4, the bursts and the pressure rounds are the hard blocks; the size work and the ab finishes aren't", () => {
    const hard = (day, rx) => sppSess(day).b.filter((b) => !(b.hide && b.hide(rx)) && b.hard).map((b) => (typeof b.n === "function" ? b.n(rx) : b.n));
    expect(hard("mon", sppRx(2))).toEqual(["Box Jumps", "Back Squat"]);
    expect(hard("tue", sppRx(2))).toEqual(["Rotational Shot-Put Throw + Hook Throw", "Bench Press + Weighted Chin-Up", "One-Arm Landmine Press", "Assault Bike Bursts", "Pressure Rounds"]);
    expect(hard("wed", sppRx(2))).toEqual([]);
    expect(hard("sat", sppRx(2))).toEqual(["Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "One-Arm Landmine Push Press", "The 4 × 4 Intervals"]);
    expect(hard("sun", sppRx(2))).toEqual([]);
    expect(hard("thu", sppRx(2))).not.toContain("Side Plank + Dead Bug");
    expect(SPP_READY_LINE.R).toMatch(/the 4 × 4, the bursts and the pressure rounds come off; the size work runs/);
  });
  it("the weekly check carries the tendon gate's scores, and the arm and shoulders on the tape weeks", () => {
    const chk = (d) => sppSess("sun").b.find((b) => b.review).items(sppRx(d)).map((x) => x.id);
    ["wr_ach", "wr_kn", "wr_ham", "wr_el", "wr_sh"].forEach((id) => expect(chk(5)).toContain(id));
    expect(chk(5)).not.toContain("s_arm");
    [4, 8, 12].forEach((d) => { expect(chk(d)).toContain("s_arm"); expect(chk(d)).toContain("s_sh"); });
  });
});

describe("5 · PROGRESS and bar speed", () => {
  it("reads its own weeks: S keys parse, the week labels are its own, nothing else's", () => {
    expect(parseKey("mSw3-sat-s_44_erg")).toEqual({ macro: "S", week: 3, day: "sat", id: "s_44_erg" });
    expect(scopeOf("spp")).toBe("spp");
    expect(inScope("spp", "S")).toBe(true); expect(inScope("spp", "P")).toBe(false); expect(inScope("prep", "S")).toBe(false);
    expect(weekLabel("S", 4)).toBe("w4");
    expect(DASH_IDS.spp.e44).toBe("s_44");
    const log = { "mSw1-sat-s_44_erg": { v: ["410"], kind: "vo2" }, "mSw1-sat-s_44": { hr: "171" }, "mSw4-sat-s_44_erg": { v: ["300"], kind: "vo2s" },
      "mSw5-sat-s_44_erg": { v: ["425"], kind: "vo2" }, "mPw2-tue-p_e1_erg": { v: ["999"], kind: "vo2" }, "mSw12-mon-s_bj": { w: "251" } };
    expect(ergSeries(log, "s_44", "spp", "vo2").map((r) => [r.label, r.v, r.hr])).toEqual([["w1", 410, 171], ["w5", 425, null]]);
    expect(ergSeries(log, "s_44", "spp", "vo2s").map((r) => r.v)).toEqual([300]);
    expect(series(log, "s_bj", "spp").map((r) => r.v)).toEqual([251]);
  });
  it("bar speed reads the profile at the set's own percentage, and the typical numbers by its band until there's a line", () => {
    expect([75, 80, 85, 87.5, 90, 95].map(sppVelPhase)).toEqual(["accum", "intens", "intens", "intens", "top", "top"]);
    const profiles = { squat: { points: [{ load: 50, speed: 1.0 }, { load: 60, speed: 0.9 }, { load: 70, speed: 0.8 }, { load: 80, speed: 0.7 }, { load: 85, speed: 0.65 }] } };
    expect(targetFor(profiles, "squat", "intens", 85).v).toBe(0.65);
    expect(targetFor(profiles, "squat", "top", 95).v).toBe(0.55);
    expect(targetFor(profiles, "squat", "intens").v).toBe(0.66);
    const t = TYPICAL.squat.top;
    expect(targetFor(null, "squat", "top", 95).v).toBe(Math.round((t[0] + t[1]) / 2 * 100) / 100);
  });
  it("leaves Prep's own rows as they were", () => {
    const prep = buildSeason({ plans: [P("2026-10-26", "2026-10-25", {})], today: "2026-10-25" });
    expect(prep.rows.some((r) => r.program === "spp")).toBe(false);
    expect(rowRx(prep.rows[0], true).spp).toBeUndefined();
    expect(Object.keys(SPP_ROWS).length).toBe(12);
  });
});

describe("6 · the weights you lift", () => {
  const set = (w, r, ok) => ({ ok: ok !== false, w: w == null ? undefined : String(w), r: String(r) });
  const log = {
    "mSw1-mon-rdl": { sets: [set(60, 8), set(60, 8), set(60, 8)], n: "Romanian Deadlift", d: "2027-02-15" },
    "mSw2-mon-rdl": { sets: [set(62.5, 8), set(62.5, 8), set(65, 6)], n: "Romanian Deadlift", d: "2027-02-22" },
    "mSw3-mon-rdl": { sets: [set(null, 8), set(null, 8)] },
    "mSw2-mon-s_legcurl": { sets: [set(40, 12), set(40, 12), set(40, 12)], d: "2027-02-22" },
    "mSw1-mon-s_legcurl": { sets: [set(40, 12), set(40, 11), set(40, 10)] },
    "mPw5-sat-rdl": { sets: [set(80, 6), set(80, 6)] },
    "mSw2-tue-s_chin": { sets: [set(10, 6), set(10, 6, false)], n: "Weighted chin-up, palms toward you", d: "2027-02-23" },
  };
  const dateOf = (p) => ({ "1": "2027-02-15", "2": "2027-02-22", "3": "2027-03-01" })[p.macro === "S" ? p.week : 0] || null;
  it("last time: the latest session before the day with a weight on a done set; an entry without its date is placed off its week", () => {
    expect(lastSession(log, "rdl", "2027-03-01", dateOf)).toEqual({ d: "2027-02-22", sets: [{ w: 62.5, r: "8" }, { w: 62.5, r: "8" }, { w: 65, r: "6" }] });
    expect(lastSession(log, "rdl", "2027-02-22", dateOf).d).toBe("2027-02-15");
    expect(lastSession(log, "rdl", "2027-02-15", dateOf)).toBe(null);
    expect(lastSession(log, "s_legcurl", "2027-02-20", dateOf)).toEqual({ d: "2027-02-15", sets: [{ w: 40, r: "12" }, { w: 40, r: "11" }, { w: 40, r: "10" }] });
    expect(lastSession(log, "s_chin", "2027-03-01", dateOf).sets).toEqual([{ w: 10, r: "6" }]);
  });
  it("the nudge: every set at the top of a rep range, and as many sets as today's; a fixed count never nudges", () => {
    expect(rangeTop("10–12")).toBe(12);
    expect(rangeTop("8–12/side")).toBe(12);
    expect(rangeTop("8")).toBe(null);
    expect(rangeTop("8/leg")).toBe(null);
    expect(topOfRange(lastSession(log, "s_legcurl", "2027-03-01", dateOf), "10–12", 3)).toBe(true);
    expect(topOfRange(lastSession(log, "s_legcurl", "2027-02-20", dateOf), "10–12", 3)).toBe(false);
    expect(topOfRange(lastSession(log, "s_legcurl", "2027-03-01", dateOf), "10–12", 4)).toBe(false);
    expect(topOfRange(lastSession(log, "rdl", "2027-03-01", dateOf), "8", 3)).toBe(false);
  });
  it("NUMBERS: each lift's heaviest set, session by session, its own weeks only, named as its card", () => {
    const h = liftHistory(log, "spp");
    const rdl = h.find((x) => x.id === "rdl");
    expect(rdl.n).toBe("Romanian Deadlift");
    expect(rdl.rows.map((r) => [r.label, r.v])).toEqual([["w1 mon", 60], ["w2 mon", 65]]);
    expect(h.find((x) => x.id === "s_chin").rows.map((r) => r.v)).toEqual([10]);
    expect(liftHistory(log, "prep").map((x) => x.id)).toEqual(["rdl"]);
    expect(liftHistory(log, "prep")[0].rows.map((r) => r.v)).toEqual([80]);
  });
  it("the leg curl's card says where the pads go", () => {
    const it0 = sppSess("mon").b.find((b) => b.n === "Seated Leg Curl").items(sppRx(1))[0];
    expect(it0.cue).toMatch(/the pad behind your legs just above your heels, the top pad down on your thighs/);
    expect(sppMd).toMatch(/the pad behind your legs just above your heels/);
    expect(sppMd).not.toMatch(/lower shins/);
  });
});

describe("7 · the sprints: a button a run, and the rest", () => {
  const thu = sppSess("thu");
  const sled = thu.b.find((b) => b.n === "Heavy Sled Sprint"), fly = thu.b.find((b) => b.n === "Flying Sprints");
  it("the sled: a button for each run on its line — five, three in weeks 4 and 8, two in test week — and the 2:00 rest; the load and the time keep their boxes", () => {
    expect(sled.rt).toBe(120);
    const runsOf = (w) => { const it0 = sled.items(sppRx(w))[0]; return it0.runs ? Number(it0.s.match(/^(\d+) ×/)[1]) : 0; };
    expect(CYCLE12.map((x, i) => runsOf(i + 1))).toEqual([5, 5, 5, 3, 5, 5, 5, 3, 5, 5, 5, 2]);
    const it1 = sled.items(sppRx(1))[0];
    expect(it1.k).toBe("out");
    expect(it1.fields.map((f) => f.k)).toEqual(["w", "t"]);
  });
  it("the flying sprints: a tick for each sprint on their line and the 2:30 rest, as before", () => {
    expect(fly.rt).toBe(150);
    expect(fly.items(sppRx(1))[0].k).toBe("chk");
    expect([1, 4, 5].map((w) => fly.items(sppRx(w))[0].s.split(" · ")[0])).toEqual(["3 × 20 m", "2 × 20 m", "4 × 20 m"]);
  });
});

describe("8 · rotation and the trunk", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const card = (w, d, n) => CAT.find((c) => c.week === w && c.day === d && c.n === n && c.edge == null);
  const block = (d, n) => sppSess(d).b.find((b) => (typeof b.n === "function" ? b.n({}) : b.n) === n);
  const throws = block("tue", "Rotational Shot-Put Throw + Hook Throw"), trunk = block("sun", "Seated Calf Raise + Pallof Press");
  it("Tuesday's throws: the shot-put and the hook, 3 × 3 each side, alternated with 45 seconds, two sets in weeks 4, 8 and 12, off on a red morning", () => {
    expect(card(1, "tue", "Rotational Shot-Put Throw + Hook Throw").kind).toBe("pair");
    expect(card(1, "tue", "Rotational Shot-Put Throw + Hook Throw").lib.map((e) => e.n)).toEqual(["ROTATIONAL SHOT-PUT THROW", "HOOK THROW"]);
    expect(throws.items(sppRx(1)).map((i) => [i.s, i.rt, i.k])).toEqual([["3 × 3 each side · 4–6 kg ball, into a wall", 45, "chk"], ["3 × 3 each side", 45, "chk"]]);
    expect([4, 8, 12].map((w) => throws.items(sppRx(w))[1].s)).toEqual(["2 × 3 each side", "2 × 3 each side", "2 × 3 each side"]);
    expect(throws.hard).toBe(1);
    /* with Saturday's scoop throws: 60 rotational throws a week, on two days */
    const each = (it) => Number(it.s.match(/^(\d+) ×/)[1]) * Number(it.s.match(/× (\d+) each side/)[1]) * 2;
    const scoop = block("sat", "Medicine-Ball Chest Pass + Rotational Scoop Throw").items(sppRx(1))[1];
    expect(throws.items(sppRx(1)).reduce((a, it) => a + each(it), 0) + each(scoop)).toBe(60);
    expect(sppMd).toMatch(/\*\*Rotational shot-put throw\*\*, alternated with 2 — 3 × 3 each side/);
    expect(sppMd).toMatch(/\| Tuesday \| \*\*Upper strength\*\* — rotational throws, then bench/);
  });
  it("Sunday's Pallof press: back to back with the seated calf raise, 3 × 10 each side, a minute after each pair; it counts reps, and it runs on a red morning", () => {
    expect(card(1, "sun", "Seated Calf Raise + Pallof Press").kind).toBe("pair");
    expect(card(1, "sun", "Seated Calf Raise + Pallof Press").lib.map((e) => e.n)).toContain("PALLOF PRESS");
    const [calf, pallof] = trunk.items(sppRx(1));
    expect([calf.id, calf.rt, pallof.id, pallof.rt, pallof.s]).toEqual(["s_scalf", 0, "s_pallof", 60, "3 × 10 each side"]);
    expect(pallof.s).not.toMatch(/hold|second/);
    expect(trunk.items(sppRx(4))[1].s).toBe("2 × 10 each side");
    expect(trunk.hard).toBeUndefined();
    expect(sppMd).toMatch(/\*\*Pallof press\*\*, 3 × 10 each side\. Rest 60 seconds after each pair/);
  });
  it("the week's minutes: Tuesday about 98 with the pressure rounds, the landmine rotation and the movement block, Sunday about 85 with the movement block and the back extension, 95 with the 40-minute run; the document's table is the trim's, 90 and 103", () => {
    const mv = (w) => Object.assign({}, sppRx(w), { mw: 1 });
    expect([1, 5, 9].map((w) => sppSess("tue").m(sppRx(w)))).toEqual([92, 98, 99]);
    expect([1, 5, 9].map((w) => sppSess("tue").m(mv(w)))).toEqual([94, 100, 101]);
    expect([sppSess("sun").m(sppRx(1)), sppSess("sun").m(mv(1))]).toEqual([76, 85]);
    expect(sppMd).toMatch(/\| Tuesday \|[^\n]*\| ~90 min \|/);
    /* and from the engine base's first week, Sunday's nasal run at 40: about 95 */
    expect(sppSess("sun").m(Object.assign(mv(1), { eb: true }))).toBe(95);
    expect(sppMd).toMatch(/\| Sunday \|[^\n]*the neck, arms and calves, the back extension and the Pallof press, then a 40-minute nasal run \| ~103 min \|/);
  });
});

describe("9 · the abs, the traps, the rear delts and the neck", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const card = (w, d, n) => CAT.find((c) => c.week === w && c.day === d && c.n === n && c.edge == null);
  const block = (d, n) => sppSess(d).b.find((b) => (typeof b.n === "function" ? b.n({}) : b.n) === n);
  const setsOf = (it) => Number(String(it.s).match(/^(\d+) ×/)[1]);
  const items = (d, n, w) => block(d, n).items(sppRx(w));
  const names = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i).map((c) => c.n);
  it("the abs: 12 hard sets a week — the leg raises, the ab wheel, and the cable crunch on Wednesday and Sunday — 8 in the lighter weeks", () => {
    const abs = (w) => [items("mon", "Standing Calf Raise + Hanging Leg Raise", w)[1], items("tue", "Ab Wheel Rollout", w)[0],
      items("wed", "Reverse Pec-Deck + Cable Crunch", w)[1], items("sun", "Dumbbell Shrug + Cable Crunch", w)[1]];
    expect(abs(1).map((i) => i.n)).toEqual(["Hanging leg raise", "Ab wheel rollout", "Cable crunch", "Cable crunch"]);
    expect(abs(1).reduce((a, i) => a + setsOf(i), 0)).toBe(12);
    expect(abs(4).reduce((a, i) => a + setsOf(i), 0)).toBe(8);
    const crunch = abs(1)[2];
    expect([crunch.id, crunch.k, crunch.reps, crunch.rt, crunch.s]).toEqual(["s_crunch", "wr", "10–15", 60, "3 × 10–15 · one or two left"]);
    expect(card(1, "wed", "Reverse Pec-Deck + Cable Crunch").lib.map((e) => e.n)).toEqual(["REVERSE PEC-DECK", "CABLE CRUNCHES"]);
    expect(items("wed", "Reverse Pec-Deck + Cable Crunch", 1)[0].rt).toBe(0);
    expect(items("sun", "Dumbbell Shrug + Cable Crunch", 1)[0].rt).toBe(0);
  });
  it("the traps: heavy trap bar shrugs on Thursday, straight after the deadlift, and Sunday's dumbbell shrugs — twice a week", () => {
    const thu = names(1, "thu");
    expect(thu.indexOf("Trap Bar Shrug")).toBe(thu.indexOf("Trap Bar Deadlift") + 1);
    expect(names(4, "thu")).toContain("Trap Bar Shrug");
    const tb = items("thu", "Trap Bar Shrug", 1)[0];
    expect([tb.id, tb.s, tb.rt == null ? block("thu", "Trap Bar Shrug").rt : tb.rt]).toEqual(["s_tbshrug", "3 × 8–12 · a second's hold at the top", 75]);
    expect(card(1, "thu", "Trap Bar Shrug").lib.map((e) => e.n)).toEqual(["TRAP BAR SHRUGS"]);
    expect(block("thu", "Trap Bar Shrug").hard).toBeUndefined();
  });
  it("the neck: the lying neck curl and extension, back to back, 3 × 15–20, 45 seconds after each pair, light and slow; Monday's until the trim, Sunday's from it", () => {
    const [c, e] = items("mon", "Lying Neck Curl + Lying Neck Extension", 1);
    /* Sunday's is the same pair, with the same ids, so its weights start from Monday's */
    expect(items("sun", "Lying Neck Curl + Lying Neck Extension", 1)).toEqual(items("mon", "Lying Neck Curl + Lying Neck Extension", 1));
    expect(names(1, "mon")).not.toContain("Lying Neck Curl + Lying Neck Extension");
    expect(names(1, "sun").indexOf("Lying Neck Curl + Lying Neck Extension")).toBe(names(1, "sun").indexOf("Medicine-Ball Drops") + 1);
    expect([c.id, c.s, c.rt, e.id, e.s, e.rt]).toEqual(["s_neckc", "3 × 15–20 · slow, never jerked", 0, "s_necke", "3 × 15–20 · slow, never jerked", 45]);
    expect(c.cue).toMatch(/Start with 2\.5–5 kg/);
    expect(card(1, "sun", "Lying Neck Curl + Lying Neck Extension").lib.map((x) => x.n)).toEqual(["LYING NECK CURLS", "LYING NECK EXTENSIONS"]);
    expect(items("mon", "Lying Neck Curl + Lying Neck Extension", 4)[0].s).toMatch(/^2 ×/);
  });
  it("the rear delts: direct work three times a week — Monday's chest-supported raise, Wednesday's reverse pec-deck, Sunday's face pulls — 9 hard sets", () => {
    const rd = [items("mon", "Chest-Supported Rear-Delt Raise", 1)[0], items("wed", "Reverse Pec-Deck + Cable Crunch", 1)[0], items("sun", "Face Pull", 1)[0]];
    expect(rd.map((i) => i.n)).toEqual(["Chest-supported rear-delt raise", "Reverse pec-deck", "Face pull"]);
    expect(rd.reduce((a, i) => a + setsOf(i), 0)).toBe(9);
    const r = rd[0];
    expect([r.id, r.k, r.s, r.reps, block("mon", "Chest-Supported Rear-Delt Raise").rt]).toEqual(["s_rdraise", "wr", "3 × 15–20 · one or two left", "15–20", 60]);
    expect(card(1, "mon", "Chest-Supported Rear-Delt Raise").lib.map((e) => e.n)).toEqual(["CHEST-SUPPORTED REAR-DELT RAISES"]);
    const mon = names(1, "mon");
    expect(mon[mon.length - 1]).toBe("Chest-Supported Rear-Delt Raise");
    expect(items("mon", "Chest-Supported Rear-Delt Raise", 4)[0].s).toMatch(/^2 ×/);
    expect(block("mon", "Chest-Supported Rear-Delt Raise").hard).toBeUndefined();
    expect(sppMd).toMatch(/\*\*Chest-supported rear-delt raise\*\* — 3 × 15–20\. Rest 60 seconds\./);
    expect(sppMd).toMatch(/\| Wednesday \| \*\*Physique A\*\* — chest and back for size, rear delts and cable crunches/);
  });
  it("the week's minutes and the document: before Optimal 8 · Move, Monday 71 to 75, Wednesday 75, Thursday 89 to 93; the document's table is the trim's — Monday ~75, Wednesday ~83, Thursday ~98, about ten and a quarter hours with the easy hour", () => {
    const mv = (w) => Object.assign({}, sppRx(w), { mw: 1 });
    expect([1, 5, 9].map((w) => sppSess("mon").m(sppRx(w)))).toEqual([71, 75, 75]);
    expect([1, 5, 9].map((w) => sppSess("mon").m(mv(w)))).toEqual([77, 81, 81]);
    expect([sppSess("wed").m(sppRx(1)), sppSess("wed").m(mv(1))]).toEqual([75, 79]);
    expect([1, 5, 9].map((w) => sppSess("thu").m(sppRx(w)))).toEqual([89, 93, 93]);
    expect([1, 5, 9].map((w) => sppSess("thu").m(mv(w)))).toEqual([89, 93, 93]);
    expect(sppMd).toMatch(/\| Monday \|[^\n]*the dead bug and woodchop, then the rear delts \| ~75 min \|/);
    expect(sppMd).toMatch(/\| Wednesday \|[^\n]*cable crunches[^\n]*\| ~83 min \|/);
    expect(sppMd).toMatch(/\| Thursday \|[^\n]*trap bar shrugs[^\n]*then the hip pair and the decline sit-up \| ~98 min \|/);
    expect(sppMd).toMatch(/About ten and a quarter hours a week\./);
    expect(sppMd).toMatch(/\*\*Cable crunch\*\*, 3 × 10–15\. Rest 60 seconds after each pair/);
    expect(sppMd).toMatch(/\*\*Trap bar shrug\*\* — 3 × 8–12\. Rest 75 seconds\. Straight after the deadlift/);
    expect(sppMd).toMatch(/\*\*Lying neck curl\*\*, 3 × 15–20, back to back with 10/);
  });
});

describe("10 · the pressure rounds and the ab finishes", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const card = (w, d, n) => CAT.find((c) => c.week === w && c.day === d && c.n === n && c.edge == null);
  const block = (d, n) => sppSess(d).b.find((b) => (typeof b.n === "function" ? b.n({}) : b.n) === n);
  const items = (d, n, w) => block(d, n).items(sppRx(w));
  const names = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i).map((c) => c.n);
  it("Tuesday's pressure rounds: straight after the bursts — last until the trim, before the rows and dips from it; three rounds, two in weeks 4, 8 and 12; a 5-second burst every 20 seconds; off on a red morning", () => {
    const tue = names(1, "tue");
    /* from the audit's week the third minute of every round is arms only, and the half weeks run one round and the arms-only test */
    /* from the trim the bike work comes straight after the landmine rotation, and the rows and dips and the ab wheel end the session */
    expect(tue.slice(-5)).toEqual(["Landmine Rotation", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute", "Chest-Supported Row + Weighted Dip", "Ab Wheel Rollout"]);
    [4, 8, 12].forEach((w) => expect(names(w, "tue").slice(-6)).toEqual(["Landmine Rotation", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute", "The Arms-Only Test", "Chest-Supported Row + Weighted Dip", "Ab Wheel Rollout"]));
    const last = (rx) => sppSess("tue").b.filter((b) => b.L && !(b.hide && b.hide(rx))).map((b) => (typeof b.n === "function" ? b.n(rx) : b.n)).slice(-2);
    expect(last(sppRx(1))).toEqual(["Assault Bike Bursts", "Pressure Rounds"]);
    expect(CYCLE12.map((x, i) => sppRx(i + 1).pr)).toEqual(["pr", "pr", "pr", "pr2", "pr", "pr", "pr", "pr2", "pr", "pr", "pr", "pr2"]);
    expect(card(1, "tue", "Pressure Rounds, Arms-Only Third Minute").pres).toBe(SPPENG.pa.d);
    expect(SPPENG.pa.d).toMatch(/3 rounds of 3 minutes with 1 minute's rest between — in each, a 5-second burst all out every 20 seconds, a steady pace between, and the third minute arms only, feet on the pegs/);
    expect(SPPENG.pr.d).toMatch(/3 rounds of 3 minutes with 1 minute's rest between — in each, a 5-second burst all out every 20 seconds, a steady pace between/);
    [4, 8, 12].forEach((w) => expect(card(w, "tue", "Pressure Rounds, Arms-Only Third Minute").pres).toMatch(/1 round of 3 minutes/));
    [4, 8, 12].forEach((w) => expect(card(w, "tue", "The Arms-Only Test").pres).toBe(SPPENG.arm3.d));
    expect(card(1, "tue", "Pressure Rounds, Arms-Only Third Minute").lib.map((e) => e.n)).toEqual(["PRESSURE ROUNDS, ARMS-ONLY THIRD MINUTE"]);
    expect(card(4, "tue", "The Arms-Only Test").lib.map((e) => e.n)).toEqual(["THE ARMS-ONLY TEST"]);
    const b = block("tue", "Pressure Rounds");
    expect(b.hard).toBe(1);
    expect(b.timer(sppRx(1))).toEqual({ kind: "pressure", opt: { rounds: 3, mins: 3, every: 20, secs: 5, rest: 60, wu: 1, cd: 2 }, title: "3 PRESSURE ROUNDS" });
    expect(b.timer(sppRx(8))).toMatchObject({ opt: { rounds: 2 }, title: "2 PRESSURE ROUNDS" });
    expect([b.m(sppRx(1)), b.m(sppRx(4)), b.tr]).toEqual([14, 10, 1]);
    const au = (w) => sppAudit(Object.assign({}, sppRx(w), { au: 1 }));
    expect(b.timer(au(1))).toEqual({ kind: "pressure", opt: { rounds: 3, mins: 3, every: 20, secs: 5, rest: 60, wu: 1, cd: 2, arms: 1 }, title: "3 PRESSURE ROUNDS" });
    expect(b.timer(au(8))).toEqual({ kind: "pressure", opt: { rounds: 1, mins: 3, every: 20, secs: 5, rest: 60, wu: 1, cd: 1, arms: 1 }, title: "1 PRESSURE ROUND" });
    expect([b.m(au(1)), b.m(au(4)), b.n(au(1)), b.n(sppRx(1))]).toEqual([14, 5, "Pressure Rounds, Arms-Only Third Minute", "Pressure Rounds"]);
    expect(b.items(au(1))[0].fields.map((f) => f.l)).toEqual(["PEAK HEART RATE (BPM)", "MINUTES AT 90% OR ABOVE · THE POLAR'S TOP ZONE"]);
    expect(b.items(sppRx(1))[0].fields.map((f) => f.l)).toEqual(["PEAK HEART RATE (BPM)"]);
    const out = items("tue", "Pressure Rounds", 1)[0];
    expect([out.id, out.k]).toEqual(["s_press", "out"]);
    expect(sppMd).toMatch(/\*\*Pressure rounds\*\* — 3 rounds, 2 in weeks 4, 8 and 12\. Straight after the bursts, on the same bike/);
    expect(sppMd).toMatch(/\| Tuesday \|[^\n]*then 6-second bursts and the pressure rounds on the assault bike, then rows and dips and the ab wheel \| ~90 min \|/);
    expect(sppMd).toMatch(/two weeks running, the Saturday easy hour comes out first\. If it happens again, two more weeks running, the pressure rounds come out too, for the rest of the twelve weeks\./);
  });
  it("Thursday's ab finish: before Optimal 8 · Move, the side plank back to back with the dead bug; from its week 1, the Copenhagen plank, 2 × 20–30 s each side, 30 seconds between, last, with its level; from the tendon work's week 1, the hip pair", () => {
    const thu = names(1, "thu");
    expect(thu.slice(-3)).toEqual(["Copenhagen lifts", "Star side plank", "Weighted Decline Sit-Up"]);
    expect(libFor("Copenhagen plank, knee or ankle").map((e) => e.n)).toEqual(["COPENHAGEN PLANK, KNEE OR ANKLE"]);
    const mv = (w) => Object.assign({}, sppRx(w), { mw: 1 });
    const cp = block("thu", "Copenhagen Plank, Knee or Ankle");
    const c = cp.items(mv(1))[0];
    expect([c.n, c.id, c.k, c.s, c.lv, cp.rt]).toEqual(["Copenhagen plank, knee or ankle", "s_copen", "chk", "2 × 20–30 s each side", "mv_copen", 30]);
    expect(cp.items(mv(4))[0].s).toBe("1 × 20–30 s each side");
    expect([cp.m(mv(1)), cp.m(mv(4)), cp.hard, cp.since]).toEqual([3, 2, undefined, "2026-11-09"]);
    expect([cp.hide(sppRx(1)), cp.hide(mv(1)), block("thu", "Side Plank + Dead Bug").hide(sppRx(1)), block("thu", "Side Plank + Dead Bug").hide(mv(1))]).toEqual([true, false, false, true]);
    expect([cp.hide(Object.assign(mv(1), { tw: 1 })), block("thu", "The Hip Pair").hide(mv(1)), block("thu", "The Hip Pair").hide(Object.assign(mv(1), { tw: 1 }))]).toEqual([true, true, false]);
    const [sp, db] = items("thu", "Side Plank + Dead Bug", 1);
    expect([sp.id, sp.k, sp.s, sp.rt, db.id, db.k, db.s, db.rt]).toEqual(["s_splank", "chk", "2 × 30–45 s each side", 0, "s_deadbug", "chk", "2 × 10 each side · slow", 30]);
    expect(items("thu", "Side Plank + Dead Bug", 4).map((i) => i.s)).toEqual(["1 × 30–45 s each side", "1 × 10 each side · slow"]);
    expect(block("thu", "Side Plank + Dead Bug").m).toBe(5);
    expect(sppMd).toMatch(/10\. \*\*The hip pair\*\* — about 5 minutes, at your levels\. Rest 20 seconds between sets\./);
    expect(sppMd).toMatch(/Before Optimal 8 · Move the finish was the side plank, 2 × 30–45 seconds each side, back to back with the dead bug, 2 × 10 each side, 30 seconds after each pair\. From Optimal 8 · Move's week 1 to Monday 23 November it was the Copenhagen plank, 2 × 20–30 seconds each side\./);
  });
  it("Saturday's ab finish: the side plank until Optimal 8 · Move, the Copenhagen plank from its week 1, then the landmine rotation in added kilos — before the 4 × 4 until the trim, the session's end from it; neither comes off on a red morning", () => {
    const sat = names(1, "sat");
    expect(sat.slice(-7)).toEqual(["The 4 × 4 Intervals", "Bench Press, Touch and Go + Pull-Up", "Cable Lateral Raise", "Copenhagen lifts", "Star side plank", "Landmine Rotation", "Hanging Leg Raise"]);
    const shown = (rx) => sppSess("sat").b.filter((b) => !(b.hide && b.hide(rx))).map((b) => b.n);
    expect(shown(sppRx(1)).includes("Side Plank")).toBe(true);
    expect(shown(sppRx(1)).includes("Copenhagen Plank, Knee or Ankle")).toBe(false);
    expect(shown(Object.assign({}, sppRx(1), { mw: 1 })).includes("Side Plank")).toBe(false);
    const cp = items("sat", "Copenhagen Plank, Knee or Ankle", 1)[0];
    expect([cp.id, cp.k, cp.s, cp.lv, block("sat", "Copenhagen Plank, Knee or Ankle").rt, block("sat", "Copenhagen Plank, Knee or Ankle").m]).toEqual(["s_copen", "chk", "2 × 20–30 s each side", "mv_copen", 30, 3]);
    expect(items("sat", "Copenhagen Plank, Knee or Ankle", 12)[0].s).toMatch(/^1 ×/);
    expect(shown(Object.assign({}, sppRx(1), { mw: 1, tw: 1 })).filter((n) => /Copenhagen|Side Plank|Hip Pair/.test(n))).toEqual(["The Hip Pair"]);
    expect(sppMd).toMatch(/10\. \*\*The hip pair\*\* — the Copenhagen lifts and the star side plank, 2 × 4 each side of each, at your levels, as on Thursday/);
    expect(sppMd).toMatch(/Before Optimal 8 · Move it was the side plank, 2 × 30–45 seconds each side; then, until Monday 23 November, the Copenhagen plank, 2 × 20–30 seconds each side\./);
    const sp = items("sat", "Side Plank", 1)[0], lr = items("sat", "Landmine Rotation", 1)[0];
    expect([sp.id, sp.k, sp.s, block("sat", "Side Plank").rt]).toEqual(["s_splank", "chk", "2 × 30–45 s each side", 30]);
    expect([lr.id, lr.k, lr.s, lr.sets, lr.reps, block("sat", "Landmine Rotation").rt]).toEqual(["s_landrot", "wr", "3 × 6–8 each side · controlled", 3, "6–8/side", 60]);
    expect(lr.cue).toMatch(/Start with the bar plus 5–10 kg/);
    expect(items("sat", "Landmine Rotation", 8)[0].s).toMatch(/^2 ×/);
    expect(items("sat", "Side Plank", 12)[0].s).toMatch(/^1 ×/);
    expect(card(1, "sat", "Landmine Rotation").lib.map((e) => e.n)).toEqual(["LANDMINE ROTATION"]);
    ["Side Plank", "Copenhagen Plank, Knee or Ankle", "The Hip Pair", "Landmine Rotation"].forEach((n) => expect(block("sat", n).hard).toBeUndefined());
    expect([1, 5, 9].map((w) => sppSess("sat").m(sppRx(w)))).toEqual([93, 95, 95]);
    expect(sppMd).toMatch(/\| Saturday \|[^\n]*then the 4 × 4 intervals, then bench and pull-ups for size, the hip pair, landmine rotations and leg raises; in the evening, the easy hour on the bike \| ~122 min \+ 45 \|/);
    expect(sppMd).toMatch(/11\. \*\*Landmine rotation\*\* — 3 × 6–8 each side, controlled\. Rest 60 seconds\./);
  });
  it("the side plank's entry leaves the classic's side plank reach-through as it was, with no entry", () => {
    expect(libFor("Side plank").map((e) => e.n)).toEqual(["FOREARM SIDE PLANK"]);
    expect(libFor("Side plank reach-through")).toBe(null);
  });
});

describe("11 · the landmine presses, the side neck raise and the medicine-ball drops", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const day = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i);
  const names = (w, d) => day(w, d).map((c) => c.n);
  const card = (w, d, n) => day(w, d).find((c) => c.n === n);
  const block = (d, n) => sppSess(d).b.find((b) => (typeof b.n === "function" ? b.n({}) : b.n) === n);
  const items = (d, n, w) => block(d, n).items(sppRx(w));
  const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  it("Tuesday's one-arm landmine press, in place of the standing overhead press: 3 × 8 each side, then 4 × 5, then 3 × 4, two minutes' rest, the weight added to the bar", () => {
    ALL.forEach((w) => { expect(names(w, "tue")).not.toContain("Standing Overhead Press"); expect(names(w, "tue")).toContain("One-Arm Landmine Press"); });
    const tue = names(1, "tue");
    expect(tue.indexOf("One-Arm Landmine Press")).toBe(tue.indexOf("Bench Press + Weighted Chin-Up") + 1);
    /* the trim leaves it there: the bike work goes after the landmine rotation, not before the press */
    expect(tue.slice(tue.indexOf("One-Arm Landmine Press"), tue.indexOf("One-Arm Landmine Press") + 3)).toEqual(["One-Arm Landmine Press", "Landmine Rotation", "Assault Bike Bursts"]);
    expect([1, 4, 5, 8, 9, 12].map((w) => items("tue", "One-Arm Landmine Press", w)[0].s.split(" · ")[0])).toEqual(["3 × 8 each side", "2 × 8 each side", "4 × 5 each side", "2 × 5 each side", "3 × 4 each side", "2 × 4 each side"]);
    const b = block("tue", "One-Arm Landmine Press"), i = items("tue", "One-Arm Landmine Press", 1)[0];
    expect([i.id, i.k, i.s, i.sets, i.reps, i.mk, b.rt, b.hard]).toEqual(["s_lmpress", "wr", "3 × 8 each side · the heaviest that leaves two in you", 3, "8/side", undefined, 120, 1]);
    expect(i.cue).toMatch(/Never lean back\. Log the weight you add to the bar\.$/);
    expect(card(1, "tue", "One-Arm Landmine Press").pres).toBe("3 × 8 each side · the heaviest that leaves two in you · Rest 2:00");
    expect(card(1, "tue", "One-Arm Landmine Press").lib.map((e) => e.n)).toEqual(["ONE-ARM LANDMINE PRESS"]);
    expect(sppMd).toMatch(/5\. \*\*One-arm landmine press\*\* — size 3 × 8 each side, strength 4 × 5, power 3 × 4, at the heaviest weight that leaves two in you\. Rest 2 minutes\./);
    expect(sppMd).not.toMatch(/overhead press/i);
    expect(sppMd).toMatch(/\| Tuesday \|[^\n]*bench, weighted chins and the landmine press heavy[^\n]*\| ~90 min \|/);
  });
  it("Saturday's one-arm landmine push press, in place of the push press: 4 × 5 each side, then 5 × 3, every rep fast, two minutes' rest — by weight and reps, with no working max, no bar-speed target and no ramp", () => {
    ALL.forEach((w) => { expect(names(w, "sat")).not.toContain("Push Press"); expect(names(w, "sat")).toContain("One-Arm Landmine Push Press"); });
    expect([1, 4, 5, 8, 9, 12].map((w) => sppPp(sppRx(w)))).toEqual([{ sets: 4, reps: 5 }, { sets: 2, reps: 5 }, { sets: 5, reps: 3 }, { sets: 3, reps: 3 }, { sets: 5, reps: 3 }, { sets: 3, reps: 3 }]);
    const sat = names(1, "sat");
    expect(sat.indexOf("One-Arm Landmine Push Press")).toBe(sat.indexOf("Bench Throw (Smith)") + 1);
    const b = block("sat", "One-Arm Landmine Push Press"), i = items("sat", "One-Arm Landmine Push Press", 1)[0];
    expect([i.id, i.k, i.s, i.sets, i.reps, b.rt, b.hard]).toEqual(["s_lmpush", "wr", "4 × 5 each side · every rep fast", 4, "5/side", 120, 1]);
    ["mk", "pct", "ramp"].forEach((k) => expect(i[k]).toBeUndefined());
    ["mainLift", "vel", "hide"].forEach((k) => expect(b[k]).toBeUndefined());
    expect(b.w({})).toBe("Every rep as fast as you can make it. A rep clearly slower than the first ends the set.");
    /* from the audit's week: a speed on every rep, the watch's arm first, a 10% drop ends the set */
    expect(b.w({ au: 1 })).toBe("Every rep as fast as you can make it. Spleeft reads the arm the watch is on: that side first, the speed read after every rep. A rep 10% slower than the set's fastest ends the set, and the other side does the same reps.");
    expect([b.spd({}), b.spd({ au: 1 })]).toEqual([false, true]);
    expect(card(5, "sat", "One-Arm Landmine Push Press").pres).toBe("5 × 3 each side · every rep fast · Rest 2:00");
    expect(card(1, "sat", "One-Arm Landmine Push Press").lib.map((e) => e.n)).toEqual(["ONE-ARM LANDMINE PUSH PRESS"]);
    expect([1, 4, 5, 8, 9, 12].map((w) => b.m(sppRx(w)))).toEqual([13, 8, 15, 8, 15, 8]);
    expect(sppMd).toMatch(/5\. \*\*One-arm landmine push press\*\* — size 4 × 5 each side, strength and power 5 × 3, every rep as fast as you can\. Rest 2 minutes\./);
    expect(sppMd).toMatch(/\| Saturday \| \*\*Upper power\*\* — flying sprints outside, the lower pushes, then throws, bench throws and the landmine push press,/);
  });
  it("the lighter weeks and test week: Saturday's profile is the bench throw's alone, the landmine push press runs at half the sets, and it has no top triple", () => {
    [4, 8].forEach((w) => expect(names(w, "sat").slice(6, 9)).toEqual(["Load-Velocity Profile — Bench Throw", "Push press speed test", "One-Arm Landmine Push Press"]));
    expect(block("sat", "Load-Velocity Profile — Bench Throw").items.map((x) => x.id)).toEqual(["s_prof_bt"]);
    expect(card(4, "sat", "Load-Velocity Profile — Bench Throw").pres).toBe("the bench throw at four loads · 2 reps each, the watch recording");
    expect([4, 8, 12].map((w) => card(w, "sat", "One-Arm Landmine Push Press").pres.split(" · ")[0])).toEqual(["2 × 5 each side", "3 × 3 each side", "3 × 3 each side"]);
    /* from the audit's week, test week redraws the bench throw's profile in its sets' place, and runs the push press speed test */
    expect(names(12, "sat").slice(0, 7)).toEqual(["The movement block", "Achilles pushes", "Knee pushes", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Load-Velocity Profile — Bench Throw", "Push press speed test", "One-Arm Landmine Push Press"]);
    expect(day(12, "sat").some((c) => c.kind === "top")).toBe(false);
    expect(sppSess("sat").b.some((x) => x.profile === "pp")).toBe(false);
    expect(sppRx(4).em).toMatch(/^Lighter: the squat, bench and trap bar are their profiles/);
    expect(sppRx(12).em).toMatch(/Thursday the trap bar top triple; Saturday the 4 × 4 as the engine test\./);
    expect(sppMd).toMatch(/\| Saturday \| The bench throw's profile and the push press speed test, then the 4 × 4 as the engine test\. \|/);
    expect(sppMd).toMatch(/The squat, bench and trap bar are replaced by their profiles/);
  });
  it("Wednesday's side neck raise and medicine-ball drops: back to back, 3 × each, 45 seconds after each pair, last before the run; two sets in weeks 4, 8 and 12; they run on a red morning", () => {
    ALL.forEach((w) => expect(names(w, "wed").slice(-4)).toEqual(["Dumbbell Lateral Raise", "Side Neck Raise + Medicine-Ball Drops", "Cable Woodchop", "The Nasal Run"]));
    const b = block("wed", "Side Neck Raise + Medicine-Ball Drops");
    const [n, d] = items("wed", "Side Neck Raise + Medicine-Ball Drops", 1);
    expect([n.id, n.k, n.s, n.sets, n.reps, n.rt]).toEqual(["s_neckside", "wr", "3 × 12–15 each side · no weight to start", 3, "12–15/side", 0]);
    expect([d.id, d.k, d.s, d.rt]).toEqual(["s_drops", "chk", "3 × 8 · a 3 kg ball, up to 6", 45]);
    expect([b.pair, b.hard, b.m]).toEqual([1, undefined, 7]);
    [4, 8, 12].forEach((w) => expect(items("wed", "Side Neck Raise + Medicine-Ball Drops", w).map((x) => x.s.split(" · ")[0])).toEqual(["2 × 12–15 each side", "2 × 8"]));
    const c = card(1, "wed", "Side Neck Raise + Medicine-Ball Drops");
    expect([c.kind, c.pres]).toEqual(["pair", "back to back · 45 s after each pair"]);
    expect(c.lib.map((e) => e.n)).toEqual(["SIDE NECK RAISES", "MEDICINE-BALL DROPS"]);
    expect(c.rows.map((r) => r.n)).toEqual(["Side neck raise", "Medicine-ball drops"]);
    expect(libFor("Side neck raise").map((e) => e.n)).toEqual(["SIDE NECK RAISES"]);
    expect(sppMd).toMatch(/8\. \*\*Side neck raise\*\*, 3 × 12–15 each side, back to back with 9\./);
    expect(sppMd).toMatch(/9\. \*\*Medicine-ball drops\*\*, 3 × 8\. Rest 45 seconds after each pair\./);
    expect(sppMd).toMatch(/\| Wednesday \| \*\*Physique A\*\* — chest and back for size, rear delts and cable crunches, the neck and medicine-ball drops, the cable woodchop, then a 30-minute nasal run \| ~83 min \|/);
  });
  it("the week's minutes: Tuesday 92 to 99 with the landmine rotation, Wednesday 75, Saturday 93 to 95; the lighter weeks and test week shorter", () => {
    expect([1, 5, 9].map((w) => sppSess("tue").m(sppRx(w)))).toEqual([92, 98, 99]);
    expect(ALL.map((w) => sppSess("wed").m(sppRx(w)))).toEqual(ALL.map(() => 75));
    expect([1, 4, 5, 8, 9, 12].map((w) => sppSess("sat").m(sppRx(w)))).toEqual([93, 87, 95, 87, 95, 88]);
    expect(sppMd).toMatch(/About 122 minutes, and the easy hour in the evening\. Before that Monday the session had no sprints, the one-arm dumbbell row was in it and the 4 × 4 came last: about 110 minutes\./);
    expect(sppMd).toMatch(/About ten and a quarter hours a week\./);
  });
  it("the new entries leave every other programme's rows as they were", () => {
    expect(libFor("Push press").map((e) => e.n)).toEqual(["PUSH PRESS"]);
    expect(libFor("Overhead press").map((e) => e.n)).toEqual(["OVERHEAD PRESS"]);
    expect(libFor("One-arm landmine press").map((e) => e.n)).toEqual(["ONE-ARM LANDMINE PRESS"]);
    expect(libFor("One-arm landmine push press").map((e) => e.n)).toEqual(["ONE-ARM LANDMINE PUSH PRESS"]);
    expect(libFor("Landmine rotation").map((e) => e.n)).toEqual(["LANDMINE ROTATION"]);
    expect(libFor("Medicine-ball drops").map((e) => e.n)).toEqual(["MEDICINE-BALL DROPS"]);
  });
});

describe("12 · more power: Monday's box jumps and Thursday's five sled runs", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const day = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i);
  const names = (w, d) => day(w, d).map((c) => c.n);
  const card = (w, d, n) => day(w, d).find((c) => c.n === n);
  const block = (d, n) => sppSess(d).b.find((b) => (typeof b.n === "function" ? b.n({}) : b.n) === n);
  const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  it("Monday: box jumps on their own card, straight after the warm-up — 4 × 3 in every block, 2 × 3 in weeks 4, 8 and 12, a minute's rest, a hard block", () => {
    /* from 23 November, the kneeling jump into a box jump in their place: brief 29 */
    ALL.forEach((w) => expect(names(w, "mon").slice(0, 2)).toEqual(["The movement block", "Kneeling Jump into Box Jump"]));
    expect(names(1, "mon").slice(2, 5)).toEqual(["Achilles pushes", "Knee pushes", "Back Squat"]);
    expect(names(4, "mon")[2]).toBe("Load-Velocity Profile — Squat");
    expect(names(12, "mon").slice(2, 6)).toEqual(["Broad jump", "Achilles pushes", "Knee pushes", "Back Squat"]);
    const b = block("mon", "Box Jumps");
    expect(ALL.map((w) => b.items(sppRx(w))[0].s)).toEqual(ALL.map((w) => ([4, 8, 12].includes(w) ? "2" : "4") + " × 3 · onto a knee-high box"));
    const i = b.items(sppRx(1))[0];
    expect([i.id, i.k, b.rt, b.hard, b.star]).toEqual(["boxjump", "chk", 60, 1, 1]);
    expect(b.hide).toBeUndefined();
    expect([1, 4, 5, 12].map((w) => b.m(sppRx(w)))).toEqual([5, 3, 5, 3]);
    /* the catalog's weeks are from 2027: the kneeling jump into a box jump, the same sets, two reps */
    expect(card(1, "mon", "Kneeling Jump into Box Jump").pres).toBe("4 × 2 · onto a knee-high box · Rest 60 s");
    expect(card(4, "mon", "Kneeling Jump into Box Jump").pres).toBe("2 × 2 · onto a knee-high box · Rest 60 s");
    expect(card(1, "mon", "Kneeling Jump into Box Jump").lib.map((e) => e.n)).toEqual(["KNEELING JUMP INTO BOX JUMP"]);
    /* the power block's jumps after each double are still there, on top */
    expect(card(11, "mon", "Back Squat").pres).toBe("4 × 2 · 95% · Rest 90 s · 3 box jumps · rest 2:00");
  });
  it("Monday's warm-up, before Optimal 8 · Move, is the bike and the hold: five minutes, the box jumps no longer in it; from its week 1 the movement block, 11 minutes", () => {
    expect(SPPROTO.S_WU_MON.s).toBe("5 min · Mon");
    expect(SPPROTO.S_WU_MON.i.map((x) => x[0])).toEqual(["Easy bike", "Spanish squat hold"]);
    const a = sppSess("mon").b[0], mv = Object.assign({}, sppRx(1), { mw: 1 });
    expect([a.p(sppRx(1)), a.m(sppRx(1)), a.rxLine(sppRx(1))]).toEqual(["S_WU_MON", 5, "5 min · bike, the Spanish squat hold"]);
    expect([a.p(mv), a.m(mv), a.rxLine(mv)]).toEqual(["S_MV_MON", 11, "11 min · hips, knees and lower back"]);
    const tw = Object.assign({}, mv, { tw: 1 });
    expect([a.p(tw), a.m(tw), a.rxLine(tw)]).toEqual(["S_MV_MON_T", 8, "8 min · hips, knees and lower back"]);
    expect(card(1, "mon", "The movement block").pres).toBe("8 min · hips, knees and lower back");
  });
  it("Thursday: five sled runs, three in the lighter weeks, two in test week; the load, the rest and the log as before", () => {
    expect(ALL.map((w) => sppSled(sppRx(w)))).toEqual([5, 5, 5, 3, 5, 5, 5, 3, 5, 5, 5, 2]);
    expect([1, 4, 12].map((w) => card(w, "thu", "Heavy Sled Sprint").pres)).toEqual(["5 × 20 m · 40–60% of bodyweight · Rest 2:00", "3 × 20 m · 40–60% of bodyweight · Rest 2:00", "2 × 20 m · 40–60% of bodyweight · Rest 2:00"]);
    const b = block("thu", "Heavy Sled Sprint"), i = b.items(sppRx(1))[0];
    expect([i.id, i.k, i.runs, b.rt, b.hard]).toEqual(["sled", "out", 1, 120, 1]);
    expect([1, 4, 5, 12].map((w) => b.m(sppRx(w)))).toEqual([12, 8, 12, 8]);
    expect(names(1, "thu").slice(0, 4)).toEqual(["The movement block", "Heavy Sled Sprint", "Box Jumps", "Trap Bar Jump"]);
  });
  it("a Monday finished before the box jumps had their own card stays finished: its warm-up's tick carries to them, once", () => {
    const before = { "mSw1-mon": ["A", "C", "D", "E", "F", "G", "N", "Q"], "mSw2-mon": ["C", "D"], "mSw2-tue": ["A", "K"], "mPw3-mon": ["A", "B"], "m1w2-mon": ["A"], "mSw3-mon": ["A", "K", "C"], "mSw4-mon": [] };
    const after = boxJumpsDone(before);
    expect(after["mSw1-mon"]).toEqual(["A", "C", "D", "E", "F", "G", "N", "Q", "K"]);
    /* the warm-up wasn't ticked: nothing added */
    expect(after["mSw2-mon"]).toEqual(["C", "D"]);
    /* other days, other programmes, and a Monday that already has them: untouched */
    ["mSw2-tue", "mPw3-mon", "m1w2-mon", "mSw3-mon", "mSw4-mon"].forEach((k) => expect(after[k]).toEqual(before[k]));
    expect(before["mSw1-mon"]).toHaveLength(8);
    expect(boxJumpsDone(after)).toEqual(after);
    expect(boxJumpsDone(undefined)).toEqual({});
    /* a finished Monday counts every card: the eight it had, and the box jumps */
    const real = sppSess("mon").b.filter((b) => b.L && !(b.hide && b.hide(sppRx(1)))).map((b) => b.L);
    expect(real.slice().sort()).toEqual(after["mSw1-mon"].slice().sort());
  });
  it("the week's jumps: 36 in the size block, where there were 30", () => {
    const sets = (d, n, w) => Number(block(d, n).items(sppRx(w))[0].s.match(/^(\d+) × 3/)[1]);
    expect(sets("mon", "Box Jumps", 1) * 3 + sets("thu", "Box Jumps", 1) * 3 + sets("thu", "Trap Bar Jump", 1) * 3).toBe(36);
  });
  it("the minutes and the document", () => {
    expect([1, 4, 5, 9, 12].map((w) => sppSess("mon").m(sppRx(w)))).toEqual([71, 58, 75, 75, 77]);
    expect([1, 4, 5, 9, 12].map((w) => sppSess("thu").m(sppRx(w)))).toEqual([89, 68, 93, 93, 66]);
    expect(sppMd).toMatch(/\| Monday \| \*\*Lower strength\*\* — the movement block, box jumps, the lower pushes, then the squat heavy,[^\n]*\| ~75 min \|/);
    expect(sppMd).toMatch(/\*\*The movement block · 8 minutes\*\* — hips, knees and lower back\n\n1\. \*\*Easy bike\*\*, 2 minutes\.\n2\. \*\*90\/90 hip switches\*\*[^\n]*\n3\. \*\*Three easy box jumps\*\*, at half effort, from Monday 23 November[^\n]*\n\nEvery move, its levels and the reasons are in Optimal 8 · Move\. Before its week 1 this was the warm-up: the easy bike for 3 minutes and the Spanish squat hold, 2 × 30 seconds\. Until Monday 23 November the block was 11 minutes, with the Spanish squat hold, 3 × 45 seconds; the knee pushes do its job harder\.\n\n\*\*The session\*\*\n\n1\. \*\*Box jump\*\* — 4 × 3, all twelve weeks\. Rest 60 seconds\./);
    expect(sppMd).toMatch(/3\. \*\*Back squat\*\* — the table's sets and percentages/);
    expect(sppMd).toMatch(/11\. \*\*Chest-supported rear-delt raise\*\*/);
    expect(sppMd).toMatch(/1\. \*\*Heavy sled sprint\*\* — 5 × 20 metres\. Rest 2 minutes\. Load 40–60% of your bodyweight on the sled\./);
    expect(sppMd).toMatch(/the jumps, sled and sprints included, is half the sets, rounded up/);
    expect(sppMd).toMatch(/\| Thursday \| The movement block, 2 sled sprints and the trap bar jump's profile, then the lower pushes and the trap bar top triple/);
    expect(sppMd).toMatch(/\| Monday \| Broad jump, best of three, after the movement block and the box jumps\. Then the lower pushes and the squat top triple\. \|/);
    expect(sppMd).toMatch(/\*\*The sled, five runs\.\*\*[^\n]*\(Alcaraz, 2018; Morin, 2017\)/);
    expect(sppMd).toMatch(/\*\*Two jump days\.\*\*/);
  });
});

describe("13 · a card added later doesn't count against days trained before it", () => {
  /* the programme began on Monday 2 November 2026; these went in after that, and count from the day after they did */
  const SINCE = {
    mon: { K: "2026-11-13", T: "2026-11-23", AB: "2026-11-23", N: "2026-11-08", Q: "2026-11-08" },
    tue: { X: "2026-11-23", K: "2026-11-06", J: "2026-11-14", SB: "2026-11-23", Y: "2026-11-23", I: "2026-11-09", Z: "2026-11-23" },
    wed: { F: "2026-11-13", WC: "2026-11-23" },
    thu: { Q: "2026-11-23", SC: "2026-11-23", T: "2026-11-23", J: "2026-11-08", K: "2026-11-23", DS: "2026-11-23" },
    sat: { SW: "2026-11-30", FS: "2026-11-30", T: "2026-11-23", X: "2026-11-23", J: "2026-11-23", K: "2026-11-09", HL: "2026-11-23" },
    sun: { M: "2026-11-23", N: "2026-11-30", J: "2026-11-16" },
  };
  const DAYS6 = ["mon", "tue", "wed", "thu", "sat", "sun"], OFF = { mon: 0, tue: 1, wed: 2, thu: 3, sat: 5, sun: 6 };
  const iso = (week, d) => { const t = new Date(Date.UTC(2026, 10, 2 + (week - 1) * 7 + OFF[d])); return t.toISOString().slice(0, 10); };
  /* the cards a day is measured against: its real blocks that week, less any that came later */
  const counted = (week, d) => sppSess(d).b.filter((b) => b.L && !(b.hide && b.hide(sppRx(week))) && countsOn(b, iso(week, d))).map((b) => b.L);
  it("each card added after the programme began carries the date it counts from; the rest carry none", () => {
    DAYS6.forEach((d) => { const got = {}; sppSess(d).b.forEach((b) => { if (b.since) got[b.L] = b.since; }); expect([d, got]).toEqual([d, SINCE[d]]); });
    expect(sppSess("mon").b.find((b) => b.since === "2026-11-13").n({})).toBe("Box Jumps");
    expect(sppSess("tue").b.find((b) => b.since === "2026-11-09").n({})).toBe("Pressure Rounds");
    expect(sppSess("tue").b.filter((b) => b.since === "2026-11-23").map((b) => b.n)).toEqual(["Rotational Throw for Distance", "Dumbbell Side Bend", "Knuckle Hold", "The Arms-Only Test"]);
    expect(sppSess("wed").b.find((b) => b.since).n).toBe("Side Neck Raise + Medicine-Ball Drops");
    expect(sppSess("thu").b.filter((b) => b.since).map((b) => b.n)).toEqual(["Load-Velocity Profile — Trap Bar Jump", "Rotational Scoop Throw", "The Lower Pushes", "Trap Bar Shrug", "Side Plank + Dead Bug", "Copenhagen Plank, Knee or Ankle", "The Hip Pair", "Weighted Decline Sit-Up"]);
    expect(sppSess("sat").b.filter((b) => b.since).map((b) => b.n)).toEqual(["Warm-up", "Flying Sprints, Outside", "The Lower Pushes", "Push Press Speed Test", "Side Plank", "Copenhagen Plank, Knee or Ankle", "The Hip Pair", "Landmine Rotation", "Hanging Leg Raise"]);
    expect(sppSess("mon").b.filter((b) => b.since === "2026-11-23").map((b) => b.n)).toEqual(["The Lower Pushes", "Dead Bug + Cable Woodchop"]);
    expect(sppSess("sun").b.filter((b) => b.since).map((b) => b.n)).toEqual(["Medicine-Ball Drops", "Lying Neck Curl + Lying Neck Extension", "Back Extension"]);
  });
  it("a card counts on its date and after, never before; a card with no date always counts; no date for the day, and every card counts", () => {
    const b = { L: "I", since: "2026-11-09" };
    expect([countsOn(b, "2026-11-03"), countsOn(b, "2026-11-08"), countsOn(b, "2026-11-09"), countsOn(b, "2026-11-10"), countsOn(b, "2027-03-02")]).toEqual([false, false, true, true, true]);
    expect([countsOn({ L: "A" }, "2026-11-03"), countsOn(b, null), countsOn(b, undefined)]).toEqual([true, true, true]);
  });
  it("week 1, as it was trained: each day is measured against the cards it had", () => {
    expect(counted(1, "mon")).toEqual(["A", "C", "D", "E", "F", "G"]);
    expect(counted(1, "tue")).toEqual(["A", "C", "D", "E", "F", "G", "H"]);
    expect(counted(1, "wed")).toEqual(["A", "B", "C", "D", "E", "R"]);
    expect(counted(1, "thu")).toEqual(["A", "B", "C", "D", "F", "G", "H", "I"]);
    expect(counted(1, "sat")).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
    expect(counted(1, "sun")).toHaveLength(10);
  });
  it("week 2: Monday has the neck and rear delts but not the box jumps' own card; Tuesday the throws and the pressure rounds; Wednesday not yet the neck and drops; Thursday everything", () => {
    expect(counted(2, "mon")).toEqual(["A", "C", "D", "E", "F", "G", "N", "Q"]);
    expect(counted(2, "tue")).toEqual(["A", "K", "C", "D", "E", "F", "G", "H", "I"]);
    expect(counted(2, "wed")).toEqual(["A", "B", "C", "D", "E", "R"]);
    expect(counted(2, "thu")).toEqual(["A", "B", "C", "D", "F", "G", "J", "H", "I", "K"]);
    expect(counted(2, "sat")).toEqual(["A", "B", "C", "D", "E", "F", "G", "J", "K", "H"]);
  });
  it("from week 3 on, and whenever the programme is run again, every card counts", () => {
    const all = (week, d) => sppSess(d).b.filter((b) => b.L && !(b.hide && b.hide(sppRx(week)))).map((b) => b.L);
    [3, 5, 9].forEach((w) => DAYS6.forEach((d) => expect([w, d, counted(w, d)]).toEqual([w, d, all(w, d)])));
    DAYS6.forEach((d) => sppSess(d).b.forEach((b) => expect(countsOn(b, "2027-02-15")).toBe(true)));
  });
  it("the pages don't change: a card with a date is still on every week's page", () => {
    const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp" && c.week === 1 && c.edge == null);
    const names = (d) => CAT.filter((c) => c.day === d).map((c) => c.n);
    expect(names("tue")).toContain("Pressure Rounds, Arms-Only Third Minute");
    expect(names("mon")).toContain("Kneeling Jump into Box Jump");
    expect(names("wed")).toContain("Side Neck Raise + Medicine-Ball Drops");
  });
});

describe("14 · Tuesday's landmine rotation", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const day = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i);
  const names = (w, d) => day(w, d).map((c) => c.n);
  const card = (w, d, n) => day(w, d).find((c) => c.n === n);
  const block = (d, n) => sppSess(d).b.find((b) => (typeof b.n === "function" ? b.n({}) : b.n) === n);
  const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  it("every week, straight after the one-arm landmine press; from the trim the bike work follows it, then the rows and dips; Saturday's stays where it was", () => {
    ALL.forEach((w) => { const t = names(w, "tue"); expect([w, t[t.indexOf("One-Arm Landmine Press") + 1]]).toEqual([w, "Landmine Rotation"]); });
    ALL.forEach((w) => { const s = names(w, "sat"); const i = s.indexOf("Copenhagen lifts"); expect([w, s.slice(i, i + 3)]).toEqual([w, ["Copenhagen lifts", "Star side plank", "Landmine Rotation"]]); });
    expect(names(1, "tue")).toEqual(["The movement block", "Rotational Shot-Put Throw + Hook Throw", "Bench Press + Weighted Chin-Up", "One-Arm Landmine Press", "Landmine Rotation", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute", "Chest-Supported Row + Weighted Dip", "Ab Wheel Rollout"]);
  });
  it("the same card as Saturday's: 3 × 6–8 each side, controlled, 60 seconds' rest, two sets in weeks 4, 8 and 12, the weight added to the bar", () => {
    const t = block("tue", "Landmine Rotation"), s = block("sat", "Landmine Rotation");
    ALL.forEach((w) => expect([w, t.items(sppRx(w))]).toEqual([w, s.items(sppRx(w))]));
    ALL.forEach((w) => expect(t.items(sppRx(w))[0].s).toBe(([4, 8, 12].includes(w) ? "2" : "3") + " × 6–8 each side · controlled"));
    const i = t.items(sppRx(1))[0];
    expect([i.id, i.k, i.sets, i.reps, t.m, t.rt, t.rest]).toEqual(["s_landrot", "wr", 3, "6–8/side", 4, 60, "Rest 60 s"]);
    expect(i.cue).toMatch(/Start with the bar plus 5–10 kg\.$/);
    expect(card(1, "tue", "Landmine Rotation").pres).toBe(card(1, "sat", "Landmine Rotation").pres);
    expect(card(1, "tue", "Landmine Rotation").lib.map((e) => e.n)).toEqual(["LANDMINE ROTATION"]);
  });
  it("not a hard block: it stays on a red morning, as Saturday's does", () => {
    expect(block("tue", "Landmine Rotation").hard).toBeUndefined();
    expect(block("tue", "Landmine Rotation").star).toBeUndefined();
  });
  it("one exercise on two days: Tuesday's weight starts from Saturday's, and Saturday's from Tuesday's", () => {
    const set = (w, r) => ({ ok: true, w: String(w), r: String(r) });
    const log = {
      "mSw2-sat-s_landrot": { sets: [set(10, 8), set(10, 8), set(10, 7)], d: "2026-11-14" },
      "mSw3-tue-s_landrot": { sets: [set(12.5, 7), set(12.5, 7), set(12.5, 6)], d: "2026-11-17" },
    };
    expect(lastSession(log, "s_landrot", "2026-11-17").d).toBe("2026-11-14");
    expect(lastSession(log, "s_landrot", "2026-11-21")).toEqual({ d: "2026-11-17", sets: [{ w: 12.5, r: "7" }, { w: 12.5, r: "7" }, { w: 12.5, r: "6" }] });
  });
  it("counts from Saturday 14 November: Tuesday 10 November is measured without it, Tuesday 17 November with it", () => {
    const b = block("tue", "Landmine Rotation");
    expect([b.L, b.since]).toEqual(["J", "2026-11-14"]);
    expect([countsOn(b, "2026-11-10"), countsOn(b, "2026-11-17")]).toEqual([false, true]);
    expect(sppSess("tue").b.filter((x) => x.L).map((x) => x.L).filter((L, i, a) => a.indexOf(L) !== i)).toEqual([]);
  });
  it("Tuesday about 96 minutes before Optimal 8 · Move, 98 with it; the week about nine and three-quarter hours with it and the easy hour; the title lines name it", () => {
    expect([1, 4, 5, 8, 9, 12].map((w) => sppSess("tue").m(sppRx(w)))).toEqual([92, 80, 98, 80, 99, 89]);
    const week = (w) => ["mon", "tue", "wed", "thu", "sat", "sun"].reduce((a, d) => a + sppSess(d).m(sppRx(w)), 0);
    expect([1, 5, 9].map(week)).toEqual([496, 512, 513]);
    const weekMove = (w) => ["mon", "tue", "wed", "thu", "sat", "sun"].reduce((a, d) => a + sppSess(d).m(Object.assign({}, sppRx(w), { mw: 1 })), 0);
    expect([1, 4, 5, 9, 12].map(weekMove)).toEqual([522, 469, 538, 539, 496]);
    expect(sppSess("tue").t).toMatch(/the landmine press and landmine rotations, rows, dips/);
    expect(sppSess("tue").intro).toMatch(/the landmine press heavy, then landmine rotations, then rows and dips for size/);
  });
  it("the document: the week's table, Tuesday's item 6 and the renumbered list, the hours, and why", () => {
    expect(sppMd).toMatch(/Friday is off\. About ten and a quarter hours a week\./);
    expect(sppMd).toMatch(/\| Tuesday \| \*\*Upper strength\*\* — rotational throws, then bench, weighted chins and the landmine press heavy, landmine rotations, then 6-second bursts and the pressure rounds on the assault bike, then rows and dips and the ab wheel \| ~90 min \|/);
    expect(sppMd).toMatch(/\n6\. \*\*Landmine rotation\*\* — 3 × 6–8 each side, controlled\. Rest 60 seconds\. Straight after the landmine press, with the bar still in the landmine\./);
    expect(sppMd).toMatch(/\n7\. \*\*Chest-supported dumbbell row\*\*, alternated with 8 —/);
    expect(sppMd).toMatch(/\n8\. \*\*Weighted dip\*\*/);
    expect(sppMd).toMatch(/\n13\. \*\*Pressure rounds\*\* — 3 rounds/);
    expect(sppMd).toMatch(/\n11\. \*\*Landmine rotation\*\* — 3 × 6–8 each side, controlled\. Rest 60 seconds\. One end of a barbell/);
    expect(sppMd).toMatch(/the landmine rotation, Tuesday and Saturday, trains it under load;/);
    expect(sppMd).not.toMatch(/Saturday's landmine rotation trains it/);
  });
});

describe("15 · repeat the week", () => {
  const SPP = { spp: true };
  const base = P("2026-11-02", "2026-10-29", SPP);
  const rep = (from, made) => P(from, made, Object.assign({ repeat: true }, SPP));
  const s = buildSeason({ plans: [base, rep("2026-11-16", "2026-11-13")], today: "2026-11-13" });
  const sRows = s.rows.filter((r) => r.program === "spp");
  it("week 2 runs again from the plan's Monday, and every week after it moves back one: week 12 is 25 January, its Sunday 31", () => {
    expect(sRows.slice(0, 5).map((r) => [r.mon, r.id])).toEqual([["2026-11-02", "S1"], ["2026-11-09", "S2"], ["2026-11-16", "S2"], ["2026-11-23", "S3"], ["2026-11-30", "S4"]]);
    expect(sRows.slice(0, 12).pop()).toMatchObject({ id: "S11", mon: "2027-01-18" });
    expect(sRows[12]).toMatchObject({ id: "S12", mon: "2027-01-25", sun: "2027-01-31" });
    expect(sRows[13]).toMatchObject({ id: "S1", cycle: 2, mon: "2027-02-01" });
  });
  it("the done weeks stay as they were: the repeat is a new week key, so Monday 9 November's ticks and logs stay on its own", () => {
    expect(sRows.slice(0, 4).map((r) => [r.mac, r.kw, r.doc])).toEqual([["S", 1, 1], ["S", 2, 2], ["S", 3, 2], ["S", 4, 3]]);
    expect(sRows.slice(2, 13).every((r) => r.carried && r.cycle === 1)).toBe(true);
    expect(rowRx(sRows[2]).doc).toBe(2);
    expect(rowRx(sRows[3]).doc).toBe(3);
  });
  it("one line says it: S2 again from the Monday, test week from 25 January, then the cycle again", () => {
    expect(describeSeason(s, "2026-11-16")).toMatch(/^Strength, Power and Physique carries on: S2 · S3 · S4 · S5 · S6 · S7 · S8 · S9 · S10 · S11 · S12, test week from Mon,? 25 Jan; then the 12-week cycle again from Mon,? 1 Feb\.$/);
  });
  it("without it, the same plan carries on as it did: week 3 on 16 November, test week 18 January", () => {
    const plain = buildSeason({ plans: [base], today: "2026-11-13" });
    expect(plain.rows.find((r) => r.mon === "2026-11-16")).toMatchObject({ id: "S3" });
    expect(plain.rows.find((r) => r.mon === "2027-01-18")).toMatchObject({ id: "S12" });
  });
  it("a fight entered once the twelve weeks finish: the full camp for 3 April starts Monday 1 February and is 9 weeks, with the usual lead-in week on 25 January", () => {
    const f = buildSeason({ plans: [base, rep("2026-11-16", "2026-11-13"), P("2027-02-01", "2027-01-31", { booked: true, fight: "2027-04-03", rounds: 3, mins: 2, rest: 60 })], today: "2027-01-31" });
    const camp = f.rows.filter((r) => r.program === "camp");
    expect(camp).toHaveLength(9);
    expect(camp[0].mon).toBe("2027-02-01");
    expect(f.rows.filter((r) => r.program === "spp").pop()).toMatchObject({ id: "S11", mon: "2027-01-18" });
    expect(f.rows.find((r) => r.mon === "2027-01-25")).toMatchObject({ program: "pre" });
  });
  it("a later re-plan doesn't undo it: carrying on from 30 November keeps the repeat and the weeks after it", () => {
    const later = buildSeason({ plans: [base, rep("2026-11-16", "2026-11-13"), P("2026-11-30", "2026-11-27", SPP)], today: "2026-11-27" });
    expect(later.rows.filter((r) => r.program === "spp").slice(0, 6).map((r) => r.id)).toEqual(["S1", "S2", "S2", "S3", "S4", "S5"]);
    expect(later.rows.find((r) => r.mon === "2027-01-25")).toMatchObject({ id: "S12" });
  });
  it("repeat the week again later: each repeat moves everything back another week", () => {
    const twice = buildSeason({ plans: [base, rep("2026-11-16", "2026-11-13"), rep("2026-11-30", "2026-11-27")], today: "2026-11-27" });
    expect(twice.rows.filter((r) => r.program === "spp").slice(0, 6).map((r) => r.id)).toEqual(["S1", "S2", "S2", "S3", "S3", "S4"]);
    expect(twice.rows.find((r) => r.id === "S12")).toMatchObject({ mon: "2027-02-01" });
  });
  it("the document: season-builder.md says what it does", () => {
    expect(builderMd).toMatch(/\*\*REPEAT WEEK \d+\*\*/);
    expect(builderMd).toMatch(/moves back a week/);
  });
});

describe("the engine base: the Saturday easy hour and Sunday's 40-minute run, from Monday 16 November", () => {
  const eb = (w) => Object.assign({}, sppRx(w), { eb: true, mw: 1 });
  const run = (d, rx) => sppSess(d).b.find((b) => b.n === "The Nasal Run");
  const v = (x, rx) => (typeof x === "function" ? x(rx) : x);
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp" && c.edge == null);
  const card = (w, d, n) => CAT.find((c) => c.week === w && c.day === d && c.n === n);
  it("from the week of 16 November; 45 minutes on Saturday evening, 30 in the lighter weeks and test week; none before", () => {
    expect(ENGINE_SINCE).toBe("2026-11-16");
    expect([1, 2, 3, 4, 5, 8, 9, 11, 12].map((w) => sppEasyHour(eb(w)))).toEqual([45, 45, 45, 30, 45, 30, 45, 45, 30]);
    expect(sppEasyHour(sppRx(1))).toBe(0);
  });
  it("Sunday's nasal run: 40 minutes, 30 in the lighter weeks and test week and before the engine base; Wednesday's stays 30", () => {
    expect([1, 4, 5, 8, 9, 12].map((w) => sppSunRun(eb(w)))).toEqual([40, 30, 40, 30, 40, 30]);
    expect(sppSunRun(sppRx(1))).toBe(30);
    const sun = run("sun"), wed = run("wed");
    expect([v(sun.m, eb(1)), sun.rxLine(eb(1)), sun.timer(eb(1)).opt.min]).toEqual([40, "40 min easy, nose only · 65–75% of peak", 40]);
    expect([v(sun.m, eb(4)), sun.rxLine(eb(4)), sun.timer(eb(4)).opt.min]).toEqual([30, "30 min easy, nose only · 65–75% of peak", 30]);
    expect([v(sun.m, sppRx(1)), sun.rxLine(sppRx(1))]).toEqual([30, "30 min easy, nose only · 65–75% of peak"]);
    expect([v(wed.m, eb(1)), wed.rxLine(eb(1)), wed.timer(eb(1)).opt.min]).toEqual([30, "30 min easy, nose only · 65–75% of peak", 30]);
    /* the catalog's weeks are all past 16 November */
    expect([1, 4, 5].map((w) => card(w, "sun", "The Nasal Run").pres)).toEqual(["40 min easy, nose only · 65–75% of peak", "30 min easy, nose only · 65–75% of peak", "40 min easy, nose only · 65–75% of peak"]);
  });
  it("the lifting and the hard sessions don't change: every day but Sunday the same minutes, Sunday 10 more", () => {
    ["mon", "tue", "wed", "thu", "sat"].forEach((d) => [1, 4, 9, 12].forEach((w) => expect(sppSess(d).m(eb(w))).toBe(sppSess(d).m(Object.assign({}, sppRx(w), { mw: 1 })))));
    expect([1, 4, 9, 12].map((w) => sppSess("sun").m(eb(w)) - sppSess("sun").m(Object.assign({}, sppRx(w), { mw: 1 })))).toEqual([10, 0, 10, 0]);
    const week = (w) => ["mon", "tue", "wed", "thu", "sat", "sun"].reduce((a, d) => a + sppSess(d).m(eb(w)), 0) + sppEasyHour(eb(w));
    expect([1, 4, 5, 9, 12].map(week)).toEqual([577, 499, 593, 594, 526]);
  });
  it("its words: the Saturday easy hour in the library, and the document's engine, Saturday, Sunday and rules", () => {
    expect(libFor("the saturday easy hour").map((e) => e.n)).toEqual(["THE SATURDAY EASY HOUR"]);
    expect(libFor("the saturday easy hour")[0].text).toMatch(/^Strength, Power and Physique's: 45 minutes on a bike, easy enough to talk in full sentences, breathing in and out through your nose the whole way, at 65–75% of your peak heart rate/);
    expect(sppMd).toMatch(/\*\*The engine base from Monday 16 November\.\*\* Saturday evening gets the easy hour, 45 minutes on the bike, and Sunday's nasal run goes to 40 minutes\. The lifting and the hard engine sessions don't change\./);
    expect(sppMd).toMatch(/\*\*Then, in the evening · the easy hour, 45 minutes\*\*\n\nAt least six hours after the session/);
    expect(sppMd).toMatch(/\*\*Then · the nasal run, 40 minutes\*\*\n\nEasy, breathing through your nose only, as on Wednesday\. 30 minutes in the lighter weeks and test week\./);
    expect(sppMd).toMatch(/\*\*The nasal runs · Wednesday 30 minutes, Sunday 40\*\*/);
    expect(sppMd).toMatch(/\*\*The Saturday easy hour · 45 minutes, in the evening\*\*/);
    expect(sppMd).toMatch(/There's no third hard session, and no hard engine work in the 24 hours before Monday or Thursday\./);
    expect(sppMd).toMatch(/the size work runs as written, and so do the nasal runs and the easy hour; the pushes run at half effort, that evening's too\./);
    expect(sppMd).toMatch(/the Saturday easy hour goes first, then the nasal runs, because the boxing covers that work\./);
    expect(sppMd).toMatch(/\*\*The base built, the hard work held\.\*\*/);
    expect(sppMd).not.toMatch(/engine held where it is/);
  });
});

describe("15 · the audit's changes, from Monday 23 November", () => {
  /* a week with the switch on, as the season hands it over from Monday 23 November: Move running, the tendon work in */
  const au = (w) => sppAudit(Object.assign({}, sppRx(w), { au: 1, mw: 2, tw: 1 }));
  const mv = (w) => Object.assign({}, sppRx(w), { mw: 2, tw: 1 });
  const block = (d, n) => sppSess(d).b.find((b) => (typeof b.n === "function" ? b.n({}) : b.n) === n);
  const shown = (d, rx) => sppSess(d).b.filter((b) => b.L && !(b.hide && b.hide(rx))).map((b) => (typeof b.n === "function" ? b.n(rx) : b.n));
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp" && c.edge == null);
  it("the switch: on from the week of Monday 23 November; off, a week is handed back untouched", () => {
    expect(AUDIT_SINCE).toBe("2026-11-23");
    expect(sppAudit(sppRx(1))).toBe(sppRx(1));
    expect([1, 4, 8, 12].map((w) => [au(w).e, au(w).pr, au(w).at])).toEqual([["vt", "pa", "arm3"], ["vts", "pa1", "arm3"], ["vts", "pa1", "arm3"], ["vt", "pa1", "arm3"]]);
    expect([spp44Short(au(4)), spp44Short(au(1)), spp44Short(sppRx(4)), sppTread(au(1)), sppTread(sppRx(1))]).toEqual([true, false, true, true, false]);
    expect([sppPrRounds(sppRx(1)), sppPrRounds(sppRx(4)), sppPrRounds(au(1)), sppPrRounds(au(4))]).toEqual([3, 2, 3, 1]);
    expect([sppArms(sppRx(1)), sppArms(au(1)), sppArms(au(4))]).toEqual([false, true, true]);
    expect([1, 4, 5, 8, 9, 12].map((w) => sppPowerTest(au(w)))).toEqual([false, true, false, true, false, true]);
    expect(sppPowerTest(sppRx(4))).toBe(false);
  });
  it("with the switch off every day shows the cards it did; on, the new ones sit in their places", () => {
    ["mon", "tue", "wed", "thu", "sat", "sun"].forEach((d) => [1, 4, 9, 12].forEach((w) => ["Knuckle Hold", "The Arms-Only Test", "Rotational Throw for Distance", "Push Press Speed Test", "Medicine-Ball Drops", "Load-Velocity Profile — Trap Bar Jump"]
      .forEach((n) => expect([d, w, shown(d, mv(w)).indexOf(n)]).toEqual([d, w, -1]))));
    expect(shown("tue", au(1)).slice(-5)).toEqual(["Ab Wheel Rollout", "Dumbbell Side Bend", "Knuckle Hold", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute"]);
    [4, 8, 12].forEach((w) => { const t = shown("tue", au(w)); expect([t[1], t.slice(-2)]).toEqual(["Rotational Throw for Distance", ["Pressure Rounds, Arms-Only Third Minute", "The Arms-Only Test"]]); });
    [1, 5, 9].forEach((w) => { const t = shown("tue", au(w)); expect([t.indexOf("Rotational Throw for Distance"), t.indexOf("The Arms-Only Test")]).toEqual([-1, -1]); });
    expect(shown("thu", au(12))).toEqual(["Warm-up", "Heavy Sled Sprint", "Load-Velocity Profile — Trap Bar Jump", "Rotational Scoop Throw", "The Lower Pushes", "Trap Bar Deadlift", "Trap Bar Shrug", "Nordic Curls", "The Hip Pair", "Weighted Decline Sit-Up"]);
    expect(shown("thu", au(4))).not.toContain("Load-Velocity Profile — Trap Bar Jump");
    [4, 8, 12].forEach((w) => expect(shown("sat", au(w)).slice(2, 6)).toEqual(["Medicine-Ball Chest Pass + Rotational Scoop Throw", "Load-Velocity Profile — Bench Throw", "Push Press Speed Test", "One-Arm Landmine Push Press"]));
    expect(shown("sat", au(5)).slice(2, 5)).toEqual(["Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "One-Arm Landmine Push Press"]);
    expect(shown("sun", au(1)).slice(3, 6)).toEqual(["Dumbbell Shrug + Cable Crunch", "Medicine-Ball Drops", "EZ-Bar Curl + Overhead Triceps Extension"]);
  });
  it("the time, honestly: Tuesday and Sunday two minutes more every week; weeks 4 and 8 ten in all, test week nine; no other day changes", () => {
    /* the core's cards (brief 29) went in the same Monday; their minutes are counted in section 16 */
    const CORE_L = ["AB", "SB", "WC", "SC", "DS", "HL"];
    const coreM = (d, rx) => sppSess(d).b.filter((b) => CORE_L.includes(b.L) && !(b.hide && b.hide(rx))).reduce((a, b) => a + b.m(rx), 0);
    const more = (d, w) => sppSess(d).m(au(w)) - sppSess(d).m(mv(w)) - coreM(d, au(w));
    expect(["mon", "tue", "wed", "thu", "sat", "sun"].map((d) => [1, 4, 5, 9, 12].map((w) => more(d, w)))).toEqual([[0, 0, 0, 0, 0], [2, 6, 2, 2, 6], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 2, 0, 0, 1], [2, 2, 2, 2, 2]]);
    expect([1, 4, 5, 8, 9, 12].map((w) => sppSess("tue").m(Object.assign(au(w), { eb: true })) - coreM("tue", au(w)))).toEqual([96, 88, 102, 88, 103, 97]);
    expect(sppSess("sun").m(Object.assign(au(1), { eb: true }))).toBe(97);
    expect(sppMd).toMatch(/About four minutes a week more, and five or six more in each of those three weeks\./);
  });
  it("Monday: the movement block ends with three easy box jumps; before the switch it's the block the tendon work left", () => {
    const a = sppSess("mon").b[0];
    expect([a.p(au(1)), a.p(mv(1)), a.m(au(1)), a.m(mv(1))]).toEqual(["S_MV_MON_A", "S_MV_MON_T", 8, 8]);
    expect(SPPROTO.S_MV_MON_A.i.map((r) => r[0])).toEqual(["Easy bike", "90/90 hip switches", "Cossack squats", "Bird dog", "Then three easy box jumps"]);
    expect(SPPROTO.S_MV_MON_A.i[4]).toEqual(["Then three easy box jumps", "at half effort"]);
    expect(SPPROTO.S_MV_MON_T.i.map((r) => r[0])).toEqual(["Easy bike", "90/90 hip switches", "Cossack squats", "Bird dog"]);
    expect(sppMd).toMatch(/\n3\. \*\*Three easy box jumps\*\*, at half effort, from Monday 23 November: the build-up before the hard sets on the next card\.\n/);
  });
  it("Tuesday: the knuckle hold, the throw for distance, the pressure rounds' own engine keys and the arms-only test", () => {
    const k = block("tue", "Knuckle Hold");
    expect([k.items(au(1))[0].s, k.items(au(4))[0].s, k.items(au(1))[0].id, k.m, k.rt, k.hard, k.since]).toEqual(["3 × 20 s · on your fists, wrists dead straight", "2 × 20 s · on your fists, wrists dead straight", "s_knuckle", 2, 30, undefined, "2026-11-23"]);
    const t = block("tue", "Rotational Throw for Distance");
    expect([t.items[0].id, t.items[0].k, t.items[0].u, t.items[0].s, t.prepTest, t.hard, t.m]).toEqual(["s_rthrow", "out", "best distance (m)", "best of three each side · the 4 kg ball", 1, 1, 3]);
    expect(SPPENG.pa.d).toMatch(/a steady pace between, and the third minute arms only, feet on the pegs — then 2 minutes easy$/);
    expect(SPPENG.pa1.d).toMatch(/then 1 round of 3 minutes — .* — then 1 minute easy, and the arms-only test\. One round in the lighter weeks and test week$/);
    const a = block("tue", "The Arms-Only Test");
    expect(a.timer()).toEqual({ kind: "armtest", opt: { mins: 3, cd: 2 }, title: "THE ARMS-ONLY TEST" });
    expect([a.items()[0].id, a.engKey, a.hard, a.m, a.rxLine()]).toEqual(["s_arm3", "at", 1, 5, SPPENG.arm3.d]);
    /* out from the trim: no card in a season after it, and its library entry stays */
    expect(CAT.find((c) => c.week === 1 && c.day === "tue" && c.n === "Knuckle Hold")).toBeUndefined();
    expect(libFor("Knuckle hold").map((e) => e.n)).toEqual(["KNUCKLE HOLD"]);
    expect(CAT.find((c) => c.week === 4 && c.day === "tue" && c.n === "Rotational throw for distance").lib.map((e) => e.n)).toEqual(["ROTATIONAL THROW FOR DISTANCE"]);
  });
  it("the throws: a 3 kg ball in the power block and test week, 4–6 kg before them and before the switch", () => {
    const shot = (rx) => block("tue", "Rotational Shot-Put Throw + Hook Throw").items(rx)[0].s, pass = (rx) => block("sat", "Medicine-Ball Chest Pass + Rotational Scoop Throw").items(rx)[0].s;
    expect([1, 5, 9, 12].map((w) => shot(au(w)))).toEqual(["3 × 3 each side · 4–6 kg ball, into a wall", "3 × 3 each side · 4–6 kg ball, into a wall", "3 × 3 each side · 3 kg ball, into a wall", "2 × 3 each side · 3 kg ball, into a wall"]);
    expect([1, 9].map((w) => pass(au(w)))).toEqual(["3 × 5 · 4–6 kg ball, into a wall", "3 × 5 · 3 kg ball, into a wall"]);
    expect([shot(sppRx(9)), pass(sppRx(9))]).toEqual(["3 × 3 each side · 4–6 kg ball, into a wall", "3 × 5 · 4–6 kg ball, into a wall"]);
  });
  it("a speed on every fast rep: the trap bar jump, the bench throw and the landmine push press show the bar-speed box and Spleeft's rule, and PROGRESS charts them at the same load", () => {
    const tj = block("thu", "Trap Bar Jump"), bt = block("sat", "Bench Throw (Smith)"), pp = block("sat", "One-Arm Landmine Push Press");
    [tj, bt, pp].forEach((b) => expect([b.spd(sppRx(1)), b.spd(au(1))]).toEqual([false, true]));
    expect(tj.spdLine).toBe("Spleeft on your wrist: read the speed after every rep. A rep 10% slower than the set's fastest ends the set.");
    expect(bt.spdLine).toBe(tj.spdLine);
    expect(pp.spdLine).toBe("Spleeft reads the arm the watch is on: that side first, the speed read after every rep. A rep 10% slower than the set's fastest ends the set, and the other side does the same reps.");
    expect([tj.w(sppRx(1)), tj.w(au(1))]).toEqual(["Every jump as high as you can make it. A jump clearly lower than the first ends the set.", "Every jump as high as you can make it. " + tj.spdLine]);
    expect([BAR_SPEED_ITEMS.s_tbjump, BAR_SPEED_ITEMS.throw, BAR_SPEED_ITEMS.s_lmpush]).toEqual(["tbjump", "bthrow", "lmpush"]);
    expect(BAR_SPEED_FAST).toEqual([["tbjump", "Trap Bar Jump"], ["bthrow", "Bench Throw"], ["lmpush", "Landmine Push Press"]]);
    const log = { "mSw5-thu-s_tbjump": { sets: [{ ok: true, w: "35", r: "3" }], bs: "1.62" }, "mSw6-thu-s_tbjump": { sets: [{ ok: true, w: "35", r: "3" }], bs: "1.66" }, "mSw5-sat-s_lmpush": { sets: [{ ok: true, w: "20", r: "3" }], bs: "1.45" } };
    const sp = barSpeeds(log, "spp");
    expect(sp.tbjump.map((r) => [r.label, r.load, r.speed])).toEqual([["w5", 35, 1.62], ["w6", 35, 1.66]]);
    expect(sp.lmpush.map((r) => [r.label, r.load, r.speed])).toEqual([["w5", 20, 1.45]]);
    /* test week redraws the jump's and the throw's profiles in their sets' place; the lighter weeks did already */
    expect([tj.hide(au(12)), tj.hide(sppRx(12)), tj.hide(au(4)), tj.hide(au(1))]).toEqual([true, false, true, false]);
    expect([bt.hide(au(12)), bt.hide(sppRx(12))]).toEqual([true, false]);
    const prof = block("sat", "Load-Velocity Profile — Bench Throw"), jp = block("thu", "Load-Velocity Profile — Trap Bar Jump");
    expect([prof.hide(au(12)), prof.hide(sppRx(12)), prof.hide(sppRx(4)), jp.hide(au(12)), jp.hide(au(4)), jp.hide(sppRx(12))]).toEqual([false, true, false, false, true, true]);
    expect(jp.items.map((x) => x.id)).toEqual(["s_prof_tj"]);
  });
  it("Saturday: the push press speed test in weeks 4, 8 and 12, a box an arm; the 4 × 4 on the treadmill, the distance and the peak heart rate in their own boxes", () => {
    const t = block("sat", "Push Press Speed Test");
    expect([t.items[0].id, t.items[0].k, t.items[0].s, t.items[0].fields.map((f) => f.k + ":" + f.l), t.prepTest, t.hard, t.m]).toEqual(["s_ppspeed", "out", "3 reps each side · the bar plus 20 kg, every time", ["w:RIGHT ARM (M/S)", "l:LEFT ARM (M/S)"], 1, 1, 2]);
    const h = block("sat", "The 4 × 4 Intervals");
    expect([h.n(au(1)), h.n(au(4)), h.rxLine(au(1)), h.rxLine(au(4))]).toEqual(["The 4 × 4 Intervals", "The 3 × 4 Intervals", SPPENG.vt.d, SPPENG.vts.d]);
    expect(SPPENG.vt.d).toBe("On the treadmill at 5%: 5 minutes easy, then 4 × 4 minutes at 90–95% of your peak heart rate with 3 easy between, then 3 minutes easy");
    const on = h.items(au(1))[0], off = h.items(sppRx(1))[0];
    expect([on.id, on.erg, on.fields.map((f) => f.k + ":" + f.l), on.lastKm]).toEqual(["s_44", undefined, ["w:DISTANCE (KM)", "hr:PEAK HEART RATE (BPM)"], 1]);
    expect([off.id, off.erg, off.fields.map((f) => f.l), off.lastKm]).toEqual(["s_44", ["SESSION"], ["PEAK HEART RATE (BPM)"], undefined]);
    expect(h.timer(au(4))).toEqual({ kind: "vo2", opt: { n: 4, short: 1, wu: 5, cd: 3 }, title: "THE 3 × 4" });
    expect(CAT.find((c) => c.week === 1 && c.day === "sat" && c.n === "The 4 × 4 Intervals").lib.map((e) => e.n)).toEqual(["4-MINUTE INTERVALS ON THE TREADMILL"]);
  });
  it("Sunday: the drops' second dose after the shrug and the crunch, 2 × 8, one set in the half weeks", () => {
    const d = block("sun", "Medicine-Ball Drops");
    expect([d.items(au(1))[0].s, d.items(au(4))[0].s, d.items(au(1))[0].id, d.m, d.rt, d.hard, d.since]).toEqual(["2 × 8 · Wednesday's ball", "1 × 8 · Wednesday's ball", "s_drops_sun", 2, 45, undefined, "2026-11-23"]);
    expect(sppMd).toMatch(/   - From Monday 23 November, then the \*\*medicine-ball drops\*\*, 2 × 8, 45 seconds between sets; 1 × 8 in weeks 4, 8 and 12\./);
  });
  it("the week's tests, as its header says them; PROGRESS's ids; the push press speed is the mean of the two arms", () => {
    expect(sppTests(4)).toEqual(["the load-velocity profiles", "tape", "photos"]);
    expect(sppTests(4, true)).toEqual(["the load-velocity profiles", "the rotational throw for distance", "the push press speed", "the arms-only test", "tape", "photos"]);
    expect(sppTests(12, true)).toEqual(["the broad jump", "the top triples", "the 4 × 4 as the engine test", "the rotational throw for distance", "the push press speed", "the arms-only test", "the trap bar jump and bench throw profiles", "tape", "photos"]);
    expect(sppTests(1, true)).toEqual([]);
    expect([DASH_IDS.spp.rt, DASH_IDS.spp.pps, DASH_IDS.spp.arm3, DASH_IDS.spp.e44]).toEqual(["s_rthrow", "s_ppspeed", "s_arm3", "s_44"]);
    const log = { "mSw4-sat-s_ppspeed": { w: "1.9", l: "1.7" }, "mSw8-sat-s_ppspeed": { w: "2.0" }, "mPw4-sat-s_ppspeed": { w: "9" }, "mSw5-sat-s_44": { w: "3.2", hr: "172", kind: "vt" }, "mSw3-sat-s_44": { hr: "170" },
      "mSw4-tue-s_arm3_erg": { v: ["41"], kind: "arm3" } };
    expect(seriesMean(log, "s_ppspeed", "spp", ["w", "l"]).map((r) => [r.label, r.v])).toEqual([["w4", 1.8], ["w8", 2]]);
    expect(series(log, "s_44", "spp", "sat").map((r) => [r.label, r.v])).toEqual([["w5", 3.2]]);
    expect(ergSeries(log, "s_arm3", "spp", "arm3").map((r) => [r.label, r.v])).toEqual([["w4", 41]]);
  });
  it("the document says all of it, dated; and the line about the weakest link is out", () => {
    expect(sppMd).toMatch(/\*\*The audit's changes from Monday 23 November\.\*\* Nothing comes out\./);
    expect(sppMd).toMatch(/\*\*The power tests, in weeks 4, 8 and 12, from Monday 23 November\.\*\*/);
    expect(sppMd).toMatch(/\n11\. \*\*Knuckle hold\*\* — 3 × 20 seconds, from Monday 23 November; 2 × 20 in weeks 4, 8 and 12\. Rest 30 seconds\./);
    expect(sppMd).toMatch(/\n12\. \*\*Assault bike bursts\*\* — 8 bursts, 4 in weeks 4, 8 and 12/);
    expect(sppMd).toMatch(/    - From Monday 23 November, \*\*the third minute of every round is arms only\*\*: feet on the pegs on the bike's fork/);
    expect(sppMd).toMatch(/weeks 4, 8 and 12 run one round, then \*\*the arms-only test\*\* in the second round's place/);
    expect(sppMd).toMatch(/the \*\*rotational throw for distance\*\* comes first\. Open floor, never towards a wall\./);
    expect(sppMd).toMatch(/the \*\*push press speed test\*\* comes first: 20 kg on the bar, the same every time\./);
    expect(sppMd).toMatch(/From Monday 23 November, Spleeft reads the trap bar jumps, the bench throws and the landmine push press too\. Read the speed after every rep: a rep 10% slower than the set's fastest ends the set\./);
    expect(sppMd).toMatch(/On the treadmill, set to 5%, from Monday 23 November; before that the card was written for the bike\./);
    expect(sppMd).toMatch(/\n1\. 5 minutes easy on the treadmill, set to 5%\.\n/);
    expect(sppMd).toMatch(/Use the same treadmill and the same slope every week\. Log the distance on its screen at the end and your peak heart rate from the Polar\./);
    expect(sppMd).toMatch(/the minutes at 90% of your peak or above, which is the time in the Polar's top heart-rate zone for the session/);
    expect(sppMd).toMatch(/\| Tuesday \| The rotational throw for distance, then the bench top triple and the weighted chin top triple\. One pressure round, then the arms-only test\. \|/);
    expect(sppMd).toMatch(/- A longer rotational throw, a faster push press at the same weight, and a bigger arms-only total\./);
    expect(sppMd).not.toMatch(/weakest link/);
    expect(sppMd).not.toMatch(/Jiménez-Reyes/);
    expect(sppMd).toMatch(/tailoring the work to a force and speed profile did no better than not tailoring it \(Lindberg, 2021\)/);
    expect(sppMd).toMatch(/- \*\*A speed on every fast rep\.\*\* Athletes shown their speed after every rep moved the bar 8\.4% faster on the spot/);
    expect(sppMd).toMatch(/- \*\*The arms-only minute\.\*\*/);
    expect(sppMd).toMatch(/- \*\*The 4 × 4 uphill on a treadmill\.\*\*/);
    expect(sppMd).toMatch(/- \*\*The knuckle hold and the second dose of drops\.\*\*/);
  });
});

/* ================================================================
   16 · THE CORE, FROM MONDAY 23 NOVEMBER — at least three exercises for
   the abs and the core every training day, one of them for the abs
   themselves with weight added as it gets easy; more rotation; and the
   kneeling jump into a box jump in Monday's box jumps' place. Brief 29.
   ================================================================ */
describe("16 · the core, from Monday 23 November", () => {
  const au = (w) => sppAudit(Object.assign({}, sppRx(w), { au: 1, mw: 2, tw: 1 }));
  const mv = (w) => Object.assign({}, sppRx(w), { mw: 2, tw: 1 });
  const vv = (x, rx) => (typeof x === "function" ? x(rx) : x);
  const shown = (d, rx) => sppSess(d).b.filter((b) => b.L && !(b.hide && b.hide(rx)));
  const items = (d, rx) => [].concat(...shown(d, rx).map((b) => vv(b.items, rx) || [])).map((i) => vv(i.n, rx));
  const ABS = ["Hanging leg raise", "Ab wheel rollout", "Cable crunch", "Weighted decline sit-up"];
  const CORE = ABS.concat(["Dead bug", "Cable woodchop", "Dumbbell side bend", "Landmine rotation", "Medicine-ball drops", "Pallof press", "Star side plank", "Rotational scoop throw", "Rotational shot-put throw", "Hook throw"]);
  const DAYS6 = ["mon", "tue", "wed", "thu", "sat", "sun"], ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const NEW = ["Dead Bug + Cable Woodchop", "Dumbbell Side Bend", "Cable Woodchop", "Rotational Scoop Throw", "Weighted Decline Sit-Up", "Hanging Leg Raise"];

  it("every training day of every week: at least three for the core, and one of them for the abs themselves", () => {
    ALL.forEach((w) => DAYS6.forEach((d) => {
      const got = [...new Set(items(d, au(w)).filter((n) => CORE.includes(n)))];
      expect([w, d, got.length >= 3, got.some((n) => ABS.includes(n))]).toEqual([w, d, true, true]);
    }));
  });
  it("the new cards in their places: Monday's after the leg raises, Tuesday's after the ab wheel, Wednesday's after the drops, Thursday's throw after the trap bar jumps and its sit-up last, Saturday's leg raise before the 4 × 4", () => {
    const n = (d, w) => shown(d, au(w || 1)).map((b) => vv(b.n, au(w || 1)));
    const after = (d, a, b) => n(d).indexOf(b) === n(d).indexOf(a) + 1;
    expect([after("mon", "Towel Calf Raise + Hanging Leg Raise", "Dead Bug + Cable Woodchop"), after("tue", "Ab Wheel Rollout", "Dumbbell Side Bend"),
      after("wed", "Side Neck Raise + Medicine-Ball Drops", "Cable Woodchop"), after("thu", "Trap Bar Jump", "Rotational Scoop Throw"),
      after("sat", "Landmine Rotation", "Hanging Leg Raise"), after("sat", "Hanging Leg Raise", "The 4 × 4 Intervals")]).toEqual([true, true, true, true, true, true]);
    expect(n("thu").slice(-1)).toEqual(["Weighted Decline Sit-Up"]);
    expect(n("sun").filter((x) => NEW.includes(x))).toEqual([]);
  });
  it("before the switch every day shows the cards it did", () => {
    ALL.forEach((w) => DAYS6.forEach((d) => expect([w, d, shown(d, mv(w)).map((b) => vv(b.n, mv(w))).filter((x) => NEW.includes(x) || x === "Kneeling Jump into Box Jump")]).toEqual([w, d, []])));
    expect(vv(shown("mon", mv(1))[1].n, mv(1))).toBe("Box Jumps");
  });
  it("the sets and reps, halved in weeks 4, 8 and 12, each logged on its own", () => {
    const pres = (d, nm, rx) => { const b = shown(d, rx).find((x) => vv(x.n, rx) === nm); return vv(b.items, rx).map((i) => [i.n, i.s, i.id, i.k]); };
    expect(pres("mon", "Dead Bug + Cable Woodchop", au(1))).toEqual([["Dead bug", "2 × 8 each side, slow", "s_deadbug", "wr"], ["Cable woodchop", "2 × 10 each side · high to low", "s_chop_hi", "wr"]]);
    expect(pres("mon", "Dead Bug + Cable Woodchop", au(4)).map((x) => x[1])).toEqual(["1 × 8 each side, slow", "1 × 10 each side · high to low"]);
    expect(pres("tue", "Dumbbell Side Bend", au(1))).toEqual([["Dumbbell side bend", "2 × 12 each side", "s_sidebend", "wr"]]);
    expect(pres("wed", "Cable Woodchop", au(1))).toEqual([["Cable woodchop", "3 × 10 each side · low to high", "s_chop_lo", "wr"]]);
    expect(pres("thu", "Rotational Scoop Throw", au(1))).toEqual([["Rotational scoop throw", "3 × 3 each side · 4–6 kg ball, into a wall", "s_scoop_thu", "chk"]]);
    expect(pres("thu", "Rotational Scoop Throw", au(9))[0][1]).toBe("3 × 3 each side · 3 kg ball, into a wall");
    expect(pres("thu", "Weighted Decline Sit-Up", au(1))).toEqual([["Weighted decline sit-up", "3 × 10", "s_situp", "wr"]]);
    expect(pres("sat", "Hanging Leg Raise", au(1))).toEqual([["Hanging leg raise", "3 × 8–12", "hlr", "wr"]]);
    expect(pres("sat", "Hanging Leg Raise", au(8))[0][1]).toBe("2 × 8–12");
  });
  it("the throw is a hard block, gone on a red morning; the rest of the core stays", () => {
    const hard = (d, nm) => !!shown(d, au(1)).find((b) => vv(b.n, au(1)) === nm).hard;
    expect([hard("thu", "Rotational Scoop Throw"), hard("thu", "Weighted Decline Sit-Up"), hard("mon", "Dead Bug + Cable Woodchop"), hard("sat", "Hanging Leg Raise")]).toEqual([true, false, false, false]);
  });
  it("the time, honestly: about 23 minutes a week, 12 in the lighter weeks", () => {
    /* Monday's day total moves by exactly its core card: the kneeling jump takes the box jumps' minutes */
    const more = (d, w) => sppSess(d).m(au(w)) - sppSess(d).m(Object.assign({}, au(w), { au: 0 }));
    const core = (d, w) => shown(d, au(w)).filter((b) => NEW.includes(vv(b.n, au(w)))).reduce((a, b) => a + vv(b.m, au(w)), 0);
    expect(DAYS6.map((d) => core(d, 1))).toEqual([5, 3, 4, 7, 4, 0]);
    expect(DAYS6.map((d) => core(d, 4))).toEqual([3, 2, 2, 4, 2, 0]);
    expect(DAYS6.reduce((a, d) => a + core(d, 1), 0)).toBe(23);
    expect(more("mon", 1)).toBe(5);
  });
  it("Monday's kneeling jump into a box jump: the box jumps' sets, two reps, a minute's rest, a hard block", () => {
    const b = sppSess("mon").b.find((x) => x.L === "K"), i = b.items(au(1))[0];
    expect([vv(b.n, au(1)), b.rxLine(au(1)), b.rxLine(au(4)), i.n, i.s, i.id, i.k, b.rt, b.hard, b.m(au(1)), b.m(au(4))])
      .toEqual(["Kneeling Jump into Box Jump", "4 × 2", "2 × 2", "Kneeling jump into box jump", "4 × 2 · onto a knee-high box", "s_kneelbox", "chk", 60, 1, 5, 3]);
    expect(i.cue).toMatch(/^Kneel tall on a mat, toes tucked under/);
    expect(libFor("Kneeling jump into box jump").map((e) => e.n)).toEqual(["KNEELING JUMP INTO BOX JUMP"]);
    /* the power block's three box jumps after each squat double stay box jumps */
    expect(sppSess("mon").b.find((x) => x.L === "C").rest(Object.assign({}, au(11), { contrast: 1 }))).toBe("Rest 90 s · 3 box jumps · rest 2:00");
  });
  it("every new exercise is in the library and in this program's document", () => {
    ["Dead bug", "Cable woodchop", "Dumbbell side bend", "Weighted decline sit-up", "Hanging leg raise", "Rotational scoop throw", "Kneeling jump into box jump"].forEach((n) => expect([n, (libFor(n) || []).length]).toEqual([n, 1]));
    expect(sppMd).toMatch(/## THE CORE — FROM MONDAY 23 NOVEMBER/);
    ["Dead bug", "Cable woodchop", "Dumbbell side bend", "Weighted decline sit-up", "Kneeling jump into box jump"].forEach((n) => expect(sppMd.toLowerCase()).toContain(n.toLowerCase()));
  });
});

/* ================================================================
   17 · THE TRIM, FROM MONDAY 30 NOVEMBER — the week cut and re-ordered
   to fit the mornings, to the list set on 26 November. Out: Monday's
   leg curl and the split squat's third set; Tuesday's cable lateral
   raise, side bend and knuckle hold; Saturday's one-arm row. Moved:
   the neck pair to Sunday; the flying sprints to Saturday, outside,
   first; Tuesday's bike work ahead of the rows and dips; Saturday's
   4 × 4 ahead of the size work. Wednesday doesn't change. Brief 32.
   ================================================================ */
describe("17 · the trim, from Monday 30 November", () => {
  /* a week as the season hands it over from Monday 30 November, and the same week the Monday before */
  const pre = (w, o) => sppAudit(Object.assign({}, sppRx(w), { au: 1, mw: 3, tw: 2, eb: true }, o));
  const fit = (w, o) => pre(w, Object.assign({ fit: true }, o));
  const vv = (x, rx) => (typeof x === "function" ? x(rx) : x);
  const names = (d, rx) => sppCards(d, rx).map((b) => vv(b.n, rx));
  const letters = (d, rx) => sppCards(d, rx).map((b) => b.L);
  const blk = (d, L, rx) => sppCards(d, rx).find((b) => b.L === L);
  const DAYS6 = ["mon", "tue", "wed", "thu", "sat", "sun"], ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const trimOf = (md) => md.slice(md.indexOf("## THE TRIM — FROM MONDAY 30 NOVEMBER"), md.indexOf("## MONDAY · LOWER STRENGTH"));

  it("the switch: Monday 30 November; before it every day shows the cards it did, in the order it did", () => {
    expect(FIT_SINCE).toBe("2026-11-30");
    ALL.forEach((w) => DAYS6.forEach((d) => {
      const asWritten = sppSess(d).b.filter((b) => b.L && !(b.hide && b.hide(pre(w))));
      expect([w, d, letters(d, pre(w))]).toEqual([w, d, asWritten.map((b) => b.L)]);
      expect(sppOrder(asWritten, pre(w))).toBe(asWritten);
    }));
    expect(names("mon", pre(1))).toEqual(["Warm-up", "Kneeling Jump into Box Jump", "The Lower Pushes", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Seated Leg Curl", "Towel Calf Raise + Hanging Leg Raise", "Dead Bug + Cable Woodchop", "Lying Neck Curl + Lying Neck Extension", "Chest-Supported Rear-Delt Raise"]);
    expect(names("tue", pre(1)).slice(3)).toEqual(["One-Arm Landmine Press", "Landmine Rotation", "Chest-Supported Row + Weighted Dip", "Cable Lateral Raise", "Ab Wheel Rollout", "Dumbbell Side Bend", "Knuckle Hold", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute"]);
    expect(names("thu", pre(1)).slice(0, 4)).toEqual(["Warm-up", "Heavy Sled Sprint", "Flying Sprints", "Box Jumps"]);
    expect(names("sat", pre(1))).toEqual(["Warm-up", "The Lower Pushes", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "One-Arm Landmine Push Press", "Bench Press, Touch and Go + Pull-Up", "One-Arm Dumbbell Row", "Cable Lateral Raise", "The Hip Pair", "Landmine Rotation", "Hanging Leg Raise", "The 4 × 4 Intervals"]);
    expect(names("sun", pre(1))).not.toContain("Lying Neck Curl + Lying Neck Extension");
  });

  it("Monday: the leg curl out, the split squat two sets in every block, the neck pair gone to Sunday; the dead bug, the woodchop and the rear-delt raise stay", () => {
    expect(names("mon", fit(1))).toEqual(["Warm-up", "Kneeling Jump into Box Jump", "The Lower Pushes", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Towel Calf Raise + Hanging Leg Raise", "Dead Bug + Cable Woodchop", "Chest-Supported Rear-Delt Raise"]);
    ALL.forEach((w) => expect([w, names("mon", fit(w)).filter((n) => /Leg Curl|Neck/.test(n))]).toEqual([w, []]));
    expect([1, 5, 9].map((w) => [sppBss(pre(w)), sppBss(fit(w))])).toEqual([[3, 2], [3, 2], [2, 2]]);
    const e = (rx) => blk("mon", "E", rx);
    expect([1, 4, 5, 9, 12].map((w) => e(fit(w)).rxLine(fit(w)))).toEqual(["2 × 8 each leg", "1 × 8 each leg", "2 × 6 each leg", "2 × 6 each leg", "1 × 6 each leg"]);
    expect([e(fit(1)).items(fit(1))[0].sets, e(fit(1)).items(fit(1))[0].s, e(fit(1)).items(fit(1))[0].id]).toEqual([2, "2 × 8 each leg · one or two left", "rfess"]);
    expect([vv(e(pre(1)).m, pre(1)), vv(e(fit(1)).m, fit(1)), e(pre(1)).rxLine(pre(1))]).toEqual([9, 6, "3 × 8 each leg"]);
  });

  it("Tuesday: the heavy and fast work, then the bike work, then the rows, dips and ab wheel; the lateral raise, the side bend and the knuckle hold out; the landmine work where it was", () => {
    expect(names("tue", fit(1))).toEqual(["Warm-up", "Rotational Shot-Put Throw + Hook Throw", "Bench Press + Weighted Chin-Up", "One-Arm Landmine Press", "Landmine Rotation", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute", "Chest-Supported Row + Weighted Dip", "Ab Wheel Rollout"]);
    /* weeks 4 and 8, the profile and the chin-ups on their own; test week, the top triples: the bike work, the arms-only test with it, still sits between the landmine rotation and the rows */
    [4, 8, 12].forEach((w) => expect([w, names("tue", fit(w)).slice(-7)]).toEqual([w, ["One-Arm Landmine Press", "Landmine Rotation", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute", "The Arms-Only Test", "Chest-Supported Row + Weighted Dip", "Ab Wheel Rollout"]]));
    ALL.forEach((w) => expect([w, names("tue", fit(w)).filter((n) => /Lateral Raise|Side Bend|Knuckle/.test(n))]).toEqual([w, []]));
    /* the moved cards are the same cards: their letters, and so their ticks and logs, don't change */
    expect(letters("tue", fit(1))).toEqual(["A", "K", "C", "D", "J", "H", "I", "E", "G"]);
    expect(letters("tue", fit(4))).toEqual(["A", "X", "K", "B", "U", "D", "J", "H", "I", "Z", "E", "G"]);
    ["H", "I"].forEach((L) => expect(blk("tue", L, fit(1))).toBe(blk("tue", L, pre(1))));
    expect(blk("tue", "I", fit(1)).items(fit(1))[0].id).toBe("s_press");
    /* the day's trunk work is two now: the ab wheel and the landmine rotation */
    const core = [].concat(...sppCards("tue", fit(1)).map((b) => vv(b.items, fit(1)) || [])).map((i) => vv(i.n, fit(1))).filter((n) => /ab wheel|landmine rotation|side bend/i.test(n));
    expect(core).toEqual(["Landmine rotation", "Ab wheel rollout"]);
  });

  it("Wednesday doesn't change: the same cards, the same minutes; its neck line names Sunday", () => {
    ALL.forEach((w) => { expect([w, names("wed", fit(w))]).toEqual([w, names("wed", pre(w))]); expect(sppSess("wed").m(fit(w))).toBe(sppSess("wed").m(pre(w))); });
    const f = blk("wed", "F", fit(1));
    expect(f.why(fit(1))).toMatch(/The neck is trained forward and back on Sunday and side to side here/);
    expect(f.why(pre(1))).toMatch(/The neck is trained forward and back on Monday and side to side here/);
  });

  it("Thursday: the flying sprints go, and nothing else changes — the warm-up and its build-ups, the five sled runs and every card after them", () => {
    ALL.forEach((w) => expect([w, names("thu", fit(w))]).toEqual([w, names("thu", pre(w)).filter((n) => n !== "Flying Sprints")]));
    expect(names("thu", fit(1))).toEqual(["Warm-up", "Heavy Sled Sprint", "Box Jumps", "Trap Bar Jump", "Rotational Scoop Throw", "The Lower Pushes", "Trap Bar Deadlift", "Trap Bar Shrug", "Pause Squat", "Nordic Curls", "The Hip Pair", "Weighted Decline Sit-Up"]);
    const a = blk("thu", "A", fit(1));
    expect([vv(a.p, fit(1)), vv(a.m, fit(1))]).toEqual(["S_MV_THU", 12]);
    expect(SPPROTO.S_MV_THU.i.map((r) => r[0]).slice(-4)).toEqual(["SPRINT BUILD-UPS", "20 m @ 60%", "20 m @ 75%", "20 m @ 90%"]);
    expect([1, 4, 12].map((w) => sppSled(fit(w)))).toEqual([5, 3, 2]);
    ALL.forEach((w) => expect(sppSess("thu").m(pre(w)) - sppSess("thu").m(fit(w))).toBe(w === 12 ? 0 : 10));
  });

  it("Saturday: the sprint warm-up and the flying sprints first, then the movement block and the session; the one-arm row out; the 4 × 4 straight after the landmine push press", () => {
    expect(names("sat", fit(1))).toEqual(["Warm-up", "Flying Sprints, Outside", "Warm-up", "The Lower Pushes", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "One-Arm Landmine Push Press", "The 4 × 4 Intervals", "Bench Press, Touch and Go + Pull-Up", "Cable Lateral Raise", "The Hip Pair", "Landmine Rotation", "Hanging Leg Raise"]);
    expect(letters("sat", fit(1))).toEqual(["SW", "FS", "A", "T", "B", "C", "D", "H", "E", "G", "J", "K", "HL"]);
    ALL.forEach((w) => { const n = names("sat", fit(w)); const i = n.indexOf("One-Arm Landmine Push Press");
      expect([w, n[i + 1], n[i + 2], n.indexOf("One-Arm Dumbbell Row")]).toEqual([w, w === 4 || w === 8 ? "The 3 × 4 Intervals" : "The 4 × 4 Intervals", "Bench Press, Touch and Go + Pull-Up", -1]);
      expect(n[n.length - 1]).toBe("Hanging Leg Raise"); });
    expect(blk("sat", "H", fit(1))).toBe(blk("sat", "H", pre(1)));
    expect(blk("sat", "H", fit(1)).items(fit(1))[0].id).toBe("s_44");
    expect(blk("sat", "HL", fit(1)).why(fit(1))).toMatch(/and the session's last card\.$/);
    expect(blk("sat", "HL", pre(1)).why(pre(1))).toMatch(/before the intervals\.$/);
  });

  it("the flying sprints: Thursday's sprints on Saturday, outside — three in the size block, four after, two in the lighter weeks, 90% in weeks 1 and 2, the same sets, rest and id; a card and a library entry of their own, with the ground they need and the wet, cold, sore and ice rules; off in test week, at the tendon gate and on a red morning, the warm-up with them", () => {
    const fs = (rx) => blk("sat", "FS", rx), thu = sppSess("thu").b.find((b) => b.L === "C");
    expect([1, 3, 4, 5, 8, 9].map((w) => fs(fit(w)).rxLine(fit(w)))).toEqual(["3 × 20 m at 90%", "3 × 20 m flat out", "2 × 20 m flat out", "4 × 20 m flat out", "2 × 20 m flat out", "4 × 20 m flat out"]);
    ALL.filter((w) => w !== 12).forEach((w) => expect(fs(fit(w)).rxLine(fit(w))).toBe(thu.rxLine(pre(w))));
    const it0 = fs(fit(3)).items(fit(3))[0];
    expect([fs(fit(3)).n, it0.id, it0.k, it0.n, it0.s, it0.id === thu.items(pre(3))[0].id]).toEqual(["Flying Sprints, Outside", "s_sprint", "chk", "Flying sprints, outside", "3 × 20 m · flat out", true]);
    expect([fs(fit(1)).m, fs(fit(1)).rt, fs(fit(1)).rest, fs(fit(1)).hard, fs(fit(1)).star, fs(fit(1)).since]).toEqual([10, 150, "Rest 2:30", 1, 1, "2026-11-30"]);
    expect([thu.m, thu.rt, thu.rest, thu.hard, thu.star]).toEqual([10, 150, "Rest 2:30", 1, 1]);
    /* what the card shows is the library's entry: the card's own name finds it, and Thursday's entry stays as it was */
    const lib = libFor("Flying Sprints, Outside");
    expect(lib.map((e) => e.n)).toEqual(["FLYING SPRINTS, OUTSIDE"]);
    expect(lib[0].text).toBe("On a flat, clear straight of about 50 metres. Jog and build up speed over 15 metres, sprint the next 20 metres absolutely flat out, ease down over the next 15, then walk back and rest 2½ minutes. Wet ground, colder than 5°C, or hamstrings still sore from Thursday: every run at 90%. Ice or frost underfoot, or a hamstring twinge on the build-ups: no sprints that day.");
    expect(libFor("Flying Sprints").map((e) => e.n)).toEqual(["FLYING SPRINTS"]);
    expect(libFor("Flying sprint 20 m").map((e) => e.n)).toEqual(["FLYING SPRINTS"]);
    /* the card's rule and cue, for the proof's scans, say what the entry says */
    expect(fs(fit(3)).w(fit(3))).toBe("Wet ground, colder than 5°C, or hamstrings still sore from Thursday: every run at 90%. Ice or frost underfoot, or a hamstring twinge on the build-ups: no sprints that day.");
    expect(fs(fit(1)).w(fit(1))).toMatch(/^Weeks 1 and 2 at 90%, flat out from week 3\. Wet ground/);
    expect(lib[0].text.indexOf(it0.cue.replace(/then walk back\.$/, "then walk back"))).toBe(0);
    /* the warm-up of their own: the bike inside, the rest outside */
    const sw = blk("sat", "SW", fit(1));
    expect([sw.n, sw.p, sw.m, sw.hard, sw.since, sw.rxLine()]).toEqual(["Warm-up", "S_WU_SPRINT", 8, 1, "2026-11-30", "8 min · the bike, then outside: leg swings, skips and the three build-ups"]);
    expect(SPPROTO.S_WU_SPRINT.i).toEqual([["Easy bike", "3 min"], ["OUTSIDE, ON THE STRAIGHT YOU'LL SPRINT ON", ""], ["Leg swings", "×10 each way, each leg"], ["A-skips", "2 × 15 m"],
      ["SPRINT BUILD-UPS", ""], ["20 m @ 60%", "×1"], ["20 m @ 75%", "×1"], ["20 m @ 90%", "×1"]]);
    ["Easy bike", "Leg swings", "A-skips"].forEach((n) => expect([n, (libFor(n) || []).length > 0]).toEqual([n, true]));
    /* off together: test week, a hamstring at 3 or more, and before the trim */
    [fit(12), fit(3, { noFlying: 1 }), pre(3)].forEach((rx) => expect(letters("sat", rx).filter((L) => L === "SW" || L === "FS")).toEqual([]));
    expect(letters("sat", fit(12)).slice(0, 2)).toEqual(["A", "T"]);
    ALL.forEach((w) => expect([w, letters("thu", fit(w)).indexOf("C")]).toEqual([w, -1]));
    expect(sppSprints(fit(5))).toBe(4);
  });

  it("Sunday: Monday's neck pair after the drops, the same exercises under the same ids, so its weights carry", () => {
    expect(names("sun", fit(1))).toEqual(["Warm-up", "Cable Lateral Raise", "Face Pull", "Dumbbell Shrug + Cable Crunch", "Medicine-Ball Drops", "Lying Neck Curl + Lying Neck Extension", "EZ-Bar Curl + Overhead Triceps Extension", "Incline Dumbbell Curl + Dumbbell Skull Crusher", "Hammer Curl", "Back Extension", "Seated Calf Raise + Pallof Press", "The Nasal Run", "Weekly Check"]);
    const sun = blk("sun", "N", fit(1)), mon = blk("mon", "N", pre(1));
    expect(sun.items(fit(1))).toEqual(mon.items(pre(1)));
    expect(sun.items(fit(1)).map((i) => [i.id, i.s, i.rt])).toEqual([["s_neckc", "3 × 15–20 · slow, never jerked", 0], ["s_necke", "3 × 15–20 · slow, never jerked", 45]]);
    expect(sun.items(fit(4))[0].s).toMatch(/^2 ×/);
    expect([sun.since, mon.since, sun.m, sun.pair, sun.hard, sun.why]).toEqual(["2026-11-30", "2026-11-08", 6, 1, undefined, mon.why]);
    expect(sppSunRun(fit(1))).toBe(40);
  });

  it("every card keeps a letter of its own on its day, and a moved card only moves when the card it names is on the page", () => {
    ALL.forEach((w) => DAYS6.forEach((d) => [fit(w), fit(w, { noFlying: 1, noJumps: 1, upper4: 1 })].forEach((rx) => { const L = letters(d, rx); expect([w, d, L.length]).toEqual([w, d, new Set(L).size]); })));
    const a = { L: "A" }, b = { L: "B" }, c = { L: "C", goesBefore: (rx) => (rx.fit ? "B" : null) }, z = { L: "Z", goesBefore: () => "Q" };
    const list = [a, b, c, z];
    expect(sppOrder(list, { fit: 1 }).map((x) => x.L)).toEqual(["A", "C", "B", "Z"]);
    expect(sppOrder(list, {})).toBe(list);
    expect(list.map((x) => x.L)).toEqual(["A", "B", "C", "Z"]);
  });

  it("the time, honestly: the work mornings 14, 9, 0 and 10 minutes shorter, Saturday 12 longer and Sunday 6 — 15 minutes a week less", () => {
    const mins = (rx) => DAYS6.map((d) => sppSess(d).m(rx));
    expect(mins(pre(1))).toEqual([89, 99, 83, 108, 110, 97]);
    expect(mins(fit(1))).toEqual([75, 90, 83, 98, 122, 103]);
    expect(mins(fit(5))).toEqual([79, 96, 83, 102, 124, 103]);
    expect(mins(fit(9))).toEqual([79, 97, 83, 102, 124, 103]);
    expect(mins(fit(4))).toEqual([60, 82, 81, 74, 116, 93]);
    expect(mins(fit(12))).toEqual([79, 91, 81, 82, 98, 93]);
    const week = (rx) => mins(rx).reduce((a, b) => a + b, 0) + sppEasyHour(rx);
    expect([week(pre(1)), week(fit(1)), week(fit(5)), week(fit(9))]).toEqual([631, 616, 632, 633]);
    expect([1, 5, 9].map((w) => week(pre(w)) - week(fit(w)))).toEqual([15, 15, 15]);
    expect(sppEasyHour(fit(1))).toBe(45);
  });

  it("the title lines: every changed day has the trim's, Wednesday none", () => {
    expect(DAYS6.filter((d) => sppSess(d).tf)).toEqual(["mon", "tue", "thu", "sat", "sun"]);
    expect(sppSess("mon").tf).not.toMatch(/leg curl|neck/);
    expect(sppSess("tue").tf).toMatch(/the landmine press and landmine rotations, then the bursts and the pressure rounds, then rows, dips and the ab wheel$/);
    expect(sppSess("thu").tf).not.toMatch(/sprint/);
    expect(sppSess("sat").tf).toMatch(/^Upper power — flying sprints outside, the lower pushes, .* then the 4 × 4, then bench and pull-ups for size/);
    expect(sppSess("sun").tf).toMatch(/cable crunches, the neck, arms and calves/);
  });

  it("the document says all of it, dated: what comes out, what moves, the times, and each morning's running order, card for card", () => {
    expect(sppMd).toMatch(/\*\*The trim from Monday 30 November\.\*\* The week is cut and re-ordered to fit the mornings before work\./);
    expect(sppMd).toMatch(/About 15 minutes a week less: the four work mornings are 33 minutes shorter between them, and the weekend 18 longer\./);
    expect(sppMd).toMatch(/Friday is off\. About ten and a quarter hours a week\. That's the size block from Monday 30 November; the strength and power blocks run about a quarter of an hour longer\./);
    const T = trimOf(sppMd);
    expect(T).toMatch(/^## THE TRIM — FROM MONDAY 30 NOVEMBER\n/);
    expect(T).toMatch(/Wednesday doesn't change\. No run, sled run, jump, throw or heavy lift comes out\./);
    ["- **Monday: the seated leg curl**", "**the third set of Bulgarian split squats**", "- **Tuesday: the cable lateral raise**", "**the dumbbell side bend**", "**the knuckle hold**", "- **Saturday: the one-arm dumbbell row**",
      "- **The neck pair, from Monday to Sunday**", "- **The flying sprints, from Thursday to Saturday, outside, first.**", "- **Tuesday's bike work, up to straight after the landmine rotation.**", "- **Saturday's 4 × 4, up to straight after the landmine push press.**",
      "**Why the order changes.**"].forEach((x) => expect([x, T.includes(x)]).toEqual([x, true]));
    /* the times table is the data's, day for day */
    const NAME = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", sat: "Saturday", sun: "Sunday" };
    DAYS6.forEach((d) => { const b = sppSess(d).m(pre(1)), a = sppSess(d).m(fit(1));
      expect([d, T.includes("| " + NAME[d] + " | ~" + b + " min" + (d === "sat" ? " + 45" : "") + " | ~" + a + " min" + (d === "sat" ? " + 45" : "") + " |")]).toEqual([d, true]); });
    expect(T).toMatch(/\| The week \| about 10 hours 30 \| about 10 hours 15 \|/);
    /* and so is the week's own table, above */
    DAYS6.forEach((d) => expect([d, new RegExp("\\| " + NAME[d] + " \\| \\*\\*[^\\n]*\\| ~" + sppSess(d).m(fit(1)) + " min" + (d === "sat" ? " \\+ 45" : "") + " \\|\\n").test(sppMd)]).toEqual([d, true]));
    /* each morning's list has a line for every card on the page that week */
    const list = (day, mins) => { const h = "**" + NAME[day] + " · about " + mins + " minutes"; const i = T.indexOf(h); expect([day, i > 0]).toEqual([day, true]);
      const rest = T.slice(T.indexOf("\n\n", i) + 2); return rest.slice(0, rest.indexOf("\n\n")).split("\n"); };
    ["mon", "tue", "thu", "sat", "sun"].forEach((d) => { const L = list(d, sppSess(d).m(fit(1)));
      expect([d, L.length]).toEqual([d, sppCards(d, fit(1)).length]);
      L.forEach((line, i) => expect(line.indexOf((i + 1) + ". ")).toBe(0)); });
    expect(T).not.toMatch(/\*\*Wednesday · about/);
    expect(list("tue", 90).slice(3, 8).map((l) => l.replace(/^\d+\. /, "").split(",")[0])).toEqual(["One-arm landmine press", "Landmine rotation", "Assault bike bursts", "Pressure rounds", "Chest-supported dumbbell row and weighted dip"]);
    expect(list("sat", 122).slice(0, 3).map((l) => l.replace(/^\d+\. /, "").split(/[,:]/)[0])).toEqual(["The sprint warm-up", "Flying sprints", "The movement block"]);
    expect(list("sat", 122)[7]).toBe("8. The 4 × 4 intervals on the treadmill, about 30 minutes.");
    expect(list("sun", 103)[5]).toBe("6. Lying neck curl and lying neck extension, back to back, 3 × 15–20.");
    /* the day pages carry the dated notes */
    expect(sppMd).toMatch(/\*\*The flying sprints · first, outside · from Monday 30 November\*\*\n\nThursday's flying sprints, moved\. About 18 minutes with their warm-up\./);
    expect(sppMd).toMatch(/   - Wet ground, colder than 5°C, or hamstrings still sore from Thursday: every run at 90%\.\n   - Ice or frost underfoot, or a hamstring twinge on the build-ups: no sprints that day\.\n/);
    expect(sppMd).toMatch(/A hamstring twinge on the build-ups ends the sprints for the day\. From Monday 30 November they're Saturday's, outside: Saturday's page, below\./);
    expect(sppMd).toMatch(/power 2 × 6; from Monday 30 November, 2 sets in every block\. Rest 90 seconds\./);
    expect(sppMd).toMatch(/Curl all the way, then lower slowly to a full stretch\. Out from Monday 30 November\./);
    expect(sppMd).toMatch(/   - From Monday 30 November, then the \*\*lying neck curl\*\*, 3 × 15–20, back to back with the \*\*lying neck extension\*\*, 3 × 15–20, 45 seconds after each pair; 2 sets in weeks 4, 8 and 12\./);
    expect(sppMd).toMatch(/\*\*The 4 × 4 · Saturday, after the fast work\*\*/);
    expect(sppMd).toMatch(/\*\*The bursts · Tuesday, after the heavy lifts\*\*/);
    expect(sppMd).toMatch(/From Monday 30 November Tuesday has two, the ab wheel and the landmine rotation: its side bend came out in THE TRIM, below\./);
    expect(sppMd).toMatch(/- \*\*The hard engine work ahead of the size work, from Monday 30 November\.\*\*[^\n]*\(Eddens, 2018\)/);
    expect(sppMd).toMatch(/- \*\*Flying sprints outside, on Saturday, from Monday 30 November\.\*\*/);
    expect(sppMd).toMatch(/- The Role of Intra-Session Exercise Sequence in the Interference Effect: A Systematic Review with Meta-Analysis — Eddens, van Someren and Howatson, Sports Medicine, 2018/);
  });
});
