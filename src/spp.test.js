import { describe, it, expect } from "vitest";
import sppMd from "../optimal-8-strength-power-physique.md?raw";
import builderMd from "../season-builder.md?raw";
import { buildSeason, rowRx, describeSeason, CYCLE12, CYCLE16 } from "./builder.js";
import { SPP_ROWS, sppRx, sppSess, sppTests, sppVelPhase, sppRamp, sppPhotoDay, sppMainLine, sppPp, sppSled, SPPROTO, SPPENG, SPP_READY_LINE } from "./spp.js";
import { targetFor, TYPICAL } from "./velocity.js";
import { parseKey, inScope, scopeOf, weekLabel, ergSeries, series, DASH_IDS, lastSession, rangeTop, topOfRange, liftHistory } from "./metrics.js";
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
  it("Monday: box jumps, the squat, then the Romanian deadlift, the split squat, the leg curl, the calves and leg raises, then the neck and rear delts", () => {
    expect(names(1, "mon")).toEqual(["Warm-up", "Box Jumps", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Seated Leg Curl", "Standing Calf Raise + Hanging Leg Raise", "Lying Neck Curl + Lying Neck Extension", "Chest-Supported Rear-Delt Raise"]);
    expect(card(1, "mon", "Back Squat").pres).toBe("4 × 6 · 75% · Rest 3:00");
    expect(card(5, "mon", "Back Squat").pres).toBe("5 × 3 · 85% · Rest 3:00");
    expect(card(11, "mon", "Back Squat").pres).toBe("4 × 2 · 95% · Rest 90 s · 3 box jumps · rest 2:00");
    expect(card(11, "mon", "Back Squat").lib.map((e) => e.n)).toEqual(["BACK SQUAT", "BOX JUMPS"]);
    expect([1, 5, 9].map((w) => card(w, "mon", "Romanian Deadlift").pres.split(" · ")[0])).toEqual(["3 × 8", "3 × 6", "3 × 5"]);
    expect([1, 5, 9].map((w) => card(w, "mon", "Bulgarian Split Squat").pres.split(" · ")[0])).toEqual(["3 × 8 each leg", "3 × 6 each leg", "2 × 6 each leg"]);
    expect(card(1, "mon", "Standing Calf Raise + Hanging Leg Raise").kind).toBe("pair");
  });
  it("Tuesday: the rotational throws, then bench and weighted chin-ups as a pair, the landmine press, the landmine rotation, rows and dips, lateral raises, the ab wheel, then the bursts and the pressure rounds", () => {
    expect(names(1, "tue")).toEqual(["Warm-up", "Rotational Shot-Put Throw + Hook Throw", "Bench Press + Weighted Chin-Up", "One-Arm Landmine Press", "Landmine Rotation", "Chest-Supported Row + Weighted Dip", "Cable Lateral Raise", "Ab Wheel Rollout", "Assault Bike Bursts", "Pressure Rounds"]);
    const pair = card(5, "tue", "Bench Press + Weighted Chin-Up");
    expect(pair.kind).toBe("pair");
    expect(pair.rows.map((r) => r.n)).toEqual(["Bench press", "Weighted chin-up, palms toward you"]);
    expect(pair.lib.map((e) => e.n)).toEqual(["BENCH PRESS", "WEIGHTED CHIN-UP, PALMS TOWARD YOU"]);
    expect([1, 5, 9].map((w) => card(w, "tue", "One-Arm Landmine Press").pres.split(" · ")[0])).toEqual(["3 × 8 each side", "4 × 5 each side", "3 × 4 each side"]);
    expect(card(9, "tue", "Bench Press + Weighted Chin-Up").lib.map((e) => e.n)).toEqual(["BENCH PRESS", "MEDICINE-BALL CHEST PASSES", "WEIGHTED CHIN-UP, PALMS TOWARD YOU"]);
  });
  it("Wednesday and Sunday: size, then the 30-minute nasal run; Sunday ends with the weekly check", () => {
    expect(names(1, "wed")).toEqual(["Warm-up", "Incline Dumbbell Press + Lat Pulldown", "Low-to-High Cable Fly + Wide-Grip Seated Row", "Reverse Pec-Deck + Cable Crunch", "Dumbbell Lateral Raise", "Side Neck Raise + Medicine-Ball Drops", "The Nasal Run"]);
    expect(card(1, "wed", "The Nasal Run").pres).toBe("30 min easy, nose only · 65–75% of peak");
    expect(names(1, "sun")).toEqual(["Warm-up", "Cable Lateral Raise", "Face Pull", "Dumbbell Shrug + Cable Crunch", "EZ-Bar Curl + Overhead Triceps Extension", "Incline Dumbbell Curl + Dumbbell Skull Crusher", "Hammer Curl", "Seated Calf Raise + Pallof Press", "The Nasal Run", "Weekly Check"]);
    expect(card(1, "sun", "Cable Lateral Raise").pres).toMatch(/^4 × 12–20 · the last set to failure, then 30% lighter and go again/);
  });
  it("Thursday: the sled, the sprints and the jumps first, then trap bar jumps, the trap bar and its shrugs, the pause squat, the Nordics, then the side plank and dead bug", () => {
    expect(names(1, "thu")).toEqual(["Warm-up", "Heavy Sled Sprint", "Flying Sprints", "Box Jumps", "Trap Bar Jump", "Trap Bar Deadlift", "Trap Bar Shrug", "Pause Squat", "Nordic Curls", "Side Plank + Dead Bug"]);
    expect(names(5, "thu")).toContain("Low-Box Depth Jumps");
    expect(names(9, "thu")).toContain("Depth Jumps");
    expect(card(5, "thu", "Low-Box Depth Jumps").pres).toMatch(/^4 × 3 · 20 cm box/);
    expect(card(9, "thu", "Depth Jumps").pres).toMatch(/^4 × 3 · 30–40 cm box/);
    expect([1, 3, 5].map((w) => card(w, "thu", "Flying Sprints").pres.split(" · ").slice(0, 2).join(" · "))).toEqual(["3 × 20 m · at 90%", "3 × 20 m · flat out", "4 × 20 m · flat out"]);
    expect([1, 5, 9].map((w) => card(w, "thu", "Pause Squat").pres)).toEqual(["3 × 5 · 2-second pause · 65% · Rest 2:00", "3 × 3 · 2-second pause · 72.5% · Rest 2:00", "3 × 2 · 2-second pause · 75% · Rest 2:00"]);
    expect(card(10, "thu", "Trap Bar Deadlift").pres).toBe("4 × 2 · 92.5% · Rest 90 s · 3 broad jumps · rest 2:00");
  });
  it("Saturday: the throws, the bench throw, the landmine push press, then bench and pull-ups, rows, lateral raises, the side plank and the landmine rotation, then the 4 × 4", () => {
    expect(names(1, "sat")).toEqual(["Warm-up", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "One-Arm Landmine Push Press", "Bench Press, Touch and Go + Pull-Up", "One-Arm Dumbbell Row", "Cable Lateral Raise", "Side Plank", "Landmine Rotation", "The 4 × 4 Intervals"]);
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
    expect(names(4, "sat").slice(0, 4)).toEqual(["Warm-up", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Load-Velocity Profile — Bench Throw", "One-Arm Landmine Push Press"]);
    expect(card(4, "tue", "Weighted Chin-Up, Palms Toward You").pres.split(" · ")[0]).toBe("2 × 6");
    expect(card(8, "tue", "Weighted Chin-Up, Palms Toward You").pres.split(" · ")[0]).toBe("3 × 4");
    expect(card(4, "wed", "Dumbbell Lateral Raise").pres.split(" · ")[0]).toBe("2 × 12–20");
    expect(card(4, "sun", "Hammer Curl").pres.split(" · ")[0]).toBe("1 × 10–12");
    expect(card(4, "thu", "Heavy Sled Sprint").pres.split(" · ")[0]).toBe("3 × 20 m");
    expect(card(8, "thu", "Low-Box Depth Jumps").pres.split(" · ")[0]).toBe("2 × 3");
  });
  it("test week: the broad jump and the top triples, the chin-up's added weight, no sprints, depth jumps or pause squats", () => {
    expect(day(12, "mon").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Back Squat"]);
    expect(names(12, "mon").slice(1, 3)).toEqual(["Box Jumps", "Broad jump"]);
    expect(day(12, "tue").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Bench Press"]);
    expect(card(12, "tue", "Weighted chin-up, palms toward you — top triple").kind).toBe("out");
    expect(day(12, "thu").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Trap Bar Deadlift"]);
    expect(names(12, "thu")).toEqual(["Warm-up", "Heavy Sled Sprint", "Trap Bar Jump", "Trap Bar Deadlift", "Trap Bar Shrug", "Nordic Curls", "Side Plank + Dead Bug"]);
    expect(card(12, "thu", "Trap Bar Jump").pres.split(" · ")[0]).toBe("3 × 3 @ your peak-power load");
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
  const block = (d, n) => sppSess(d).b.find((b) => b.n === n);
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
  it("the week's minutes: Tuesday about 96 with the pressure rounds and the landmine rotation, Sunday about 76 with the cable crunches, as the document's table says", () => {
    expect([1, 5, 9].map((w) => sppSess("tue").m(sppRx(w)))).toEqual([92, 98, 99]);
    expect(sppSess("sun").m(sppRx(1))).toBe(76);
    expect(sppMd).toMatch(/\| Tuesday \|[^\n]*\| ~96 min \|/);
    expect(sppMd).toMatch(/\| Sunday \|[^\n]*\| ~76 min \|/);
  });
});

describe("9 · the abs, the traps, the rear delts and the neck", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const card = (w, d, n) => CAT.find((c) => c.week === w && c.day === d && c.n === n && c.edge == null);
  const block = (d, n) => sppSess(d).b.find((b) => b.n === n);
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
  it("the neck: Monday's lying neck curl and extension, back to back, 3 × 15–20, 45 seconds after each pair, light and slow", () => {
    const [c, e] = items("mon", "Lying Neck Curl + Lying Neck Extension", 1);
    expect([c.id, c.s, c.rt, e.id, e.s, e.rt]).toEqual(["s_neckc", "3 × 15–20 · slow, never jerked", 0, "s_necke", "3 × 15–20 · slow, never jerked", 45]);
    expect(c.cue).toMatch(/Start with 2\.5–5 kg/);
    expect(card(1, "mon", "Lying Neck Curl + Lying Neck Extension").lib.map((x) => x.n)).toEqual(["LYING NECK CURLS", "LYING NECK EXTENSIONS"]);
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
  it("the week's minutes and the document: Monday ~73, Wednesday ~75, Thursday ~91 with its ab finish, Sunday ~76, eight and a quarter to eight and a half hours", () => {
    expect([1, 5, 9].map((w) => sppSess("mon").m(sppRx(w)))).toEqual([71, 75, 75]);
    expect(sppSess("wed").m(sppRx(1))).toBe(75);
    expect([1, 5, 9].map((w) => sppSess("thu").m(sppRx(w)))).toEqual([89, 93, 93]);
    expect(sppMd).toMatch(/\| Monday \|[^\n]*then the neck and rear delts \| ~73 min \|/);
    expect(sppMd).toMatch(/\| Wednesday \|[^\n]*cable crunches[^\n]*\| ~75 min \|/);
    expect(sppMd).toMatch(/\| Thursday \|[^\n]*trap bar shrugs[^\n]*then side planks and dead bugs \| ~91 min \|/);
    expect(sppMd).toMatch(/Eight and a quarter to eight and a half hours a week\./);
    expect(sppMd).toMatch(/\*\*Cable crunch\*\*, 3 × 10–15\. Rest 60 seconds after each pair/);
    expect(sppMd).toMatch(/\*\*Trap bar shrug\*\* — 3 × 8–12\. Rest 75 seconds\. Straight after the deadlift/);
    expect(sppMd).toMatch(/\*\*Lying neck curl\*\*, 3 × 15–20, back to back with 9/);
  });
});

describe("10 · the pressure rounds and the ab finishes", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const card = (w, d, n) => CAT.find((c) => c.week === w && c.day === d && c.n === n && c.edge == null);
  const block = (d, n) => sppSess(d).b.find((b) => b.n === n);
  const items = (d, n, w) => block(d, n).items(sppRx(w));
  const names = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i).map((c) => c.n);
  it("Tuesday's pressure rounds: last, straight after the bursts; three rounds, two in weeks 4, 8 and 12; a 5-second burst every 20 seconds; off on a red morning", () => {
    const tue = names(1, "tue");
    expect(tue.slice(-2)).toEqual(["Assault Bike Bursts", "Pressure Rounds"]);
    expect(CYCLE12.map((x, i) => sppRx(i + 1).pr)).toEqual(["pr", "pr", "pr", "pr2", "pr", "pr", "pr", "pr2", "pr", "pr", "pr", "pr2"]);
    expect(card(1, "tue", "Pressure Rounds").pres).toBe(SPPENG.pr.d);
    expect(SPPENG.pr.d).toMatch(/3 rounds of 3 minutes with 1 minute's rest between — in each, a 5-second burst all out every 20 seconds, a steady pace between/);
    [4, 8, 12].forEach((w) => expect(card(w, "tue", "Pressure Rounds").pres).toMatch(/2 rounds of 3 minutes/));
    expect(card(1, "tue", "Pressure Rounds").lib.map((e) => e.n)).toEqual(["PRESSURE ROUNDS"]);
    const b = block("tue", "Pressure Rounds");
    expect(b.hard).toBe(1);
    expect(b.timer(sppRx(1))).toEqual({ kind: "pressure", opt: { rounds: 3, mins: 3, every: 20, secs: 5, rest: 60, wu: 1, cd: 2 }, title: "3 PRESSURE ROUNDS" });
    expect(b.timer(sppRx(8))).toMatchObject({ opt: { rounds: 2 }, title: "2 PRESSURE ROUNDS" });
    expect([b.m(sppRx(1)), b.m(sppRx(4)), b.tr]).toEqual([14, 10, 1]);
    const out = items("tue", "Pressure Rounds", 1)[0];
    expect([out.id, out.k]).toEqual(["s_press", "out"]);
    expect(sppMd).toMatch(/\*\*Pressure rounds\*\* — 3 rounds, 2 in weeks 4, 8 and 12\. Straight after the bursts, on the same bike/);
    expect(sppMd).toMatch(/\| Tuesday \|[^\n]*6-second bursts and the pressure rounds on the assault bike \| ~96 min \|/);
    expect(sppMd).toMatch(/two weeks running, the pressure rounds come out for the rest of the twelve weeks/);
  });
  it("Thursday's ab finish: the side plank back to back with the dead bug, 2 × each, 30 seconds after each pair, last; the plank counts seconds", () => {
    const thu = names(1, "thu");
    expect(thu[thu.length - 1]).toBe("Side Plank + Dead Bug");
    expect(card(1, "thu", "Side Plank + Dead Bug").kind).toBe("pair");
    expect(card(1, "thu", "Side Plank + Dead Bug").lib.map((e) => e.n)).toEqual(["FOREARM SIDE PLANK", "DEAD BUG"]);
    const [sp, db] = items("thu", "Side Plank + Dead Bug", 1);
    expect([sp.id, sp.k, sp.s, sp.rt, db.id, db.k, db.s, db.rt]).toEqual(["s_splank", "chk", "2 × 30–45 s each side", 0, "s_deadbug", "chk", "2 × 10 each side · slow", 30]);
    expect(sp.s).toMatch(/\d+ s each side/);
    expect(db.s).not.toMatch(/hold|second|\d+ s\b/);
    expect(items("thu", "Side Plank + Dead Bug", 4).map((i) => i.s)).toEqual(["1 × 30–45 s each side", "1 × 10 each side · slow"]);
    expect(block("thu", "Side Plank + Dead Bug").hard).toBeUndefined();
    expect(block("thu", "Side Plank + Dead Bug").m).toBe(5);
    expect(sppMd).toMatch(/9\. \*\*Side plank\*\*, 2 × 30–45 seconds each side, back to back with 10\./);
    expect(sppMd).toMatch(/10\. \*\*Dead bug\*\*, 2 × 10 each side\. Rest 30 seconds after each pair\./);
  });
  it("Saturday's ab finish: the side plank, then the landmine rotation in added kilos, before the 4 × 4; neither comes off on a red morning", () => {
    const sat = names(1, "sat");
    expect(sat.slice(-4)).toEqual(["Cable Lateral Raise", "Side Plank", "Landmine Rotation", "The 4 × 4 Intervals"]);
    const sp = items("sat", "Side Plank", 1)[0], lr = items("sat", "Landmine Rotation", 1)[0];
    expect([sp.id, sp.k, sp.s, block("sat", "Side Plank").rt]).toEqual(["s_splank", "chk", "2 × 30–45 s each side", 30]);
    expect([lr.id, lr.k, lr.s, lr.sets, lr.reps, block("sat", "Landmine Rotation").rt]).toEqual(["s_landrot", "wr", "3 × 6–8 each side · controlled", 3, "6–8/side", 60]);
    expect(lr.cue).toMatch(/Start with the bar plus 5–10 kg/);
    expect(items("sat", "Landmine Rotation", 8)[0].s).toMatch(/^2 ×/);
    expect(items("sat", "Side Plank", 12)[0].s).toMatch(/^1 ×/);
    expect(card(1, "sat", "Side Plank").lib.map((e) => e.n)).toEqual(["FOREARM SIDE PLANK"]);
    expect(card(1, "sat", "Landmine Rotation").lib.map((e) => e.n)).toEqual(["LANDMINE ROTATION"]);
    ["Side Plank", "Landmine Rotation"].forEach((n) => expect(block("sat", n).hard).toBeUndefined());
    expect([1, 5, 9].map((w) => sppSess("sat").m(sppRx(w)))).toEqual([93, 95, 95]);
    expect(sppMd).toMatch(/\| Saturday \|[^\n]*side planks and landmine rotations, then the 4 × 4 intervals \| ~94 min \|/);
    expect(sppMd).toMatch(/10\. \*\*Landmine rotation\*\* — 3 × 6–8 each side, controlled\. Rest 60 seconds\./);
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
  const block = (d, n) => sppSess(d).b.find((b) => b.n === n);
  const items = (d, n, w) => block(d, n).items(sppRx(w));
  const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  it("Tuesday's one-arm landmine press, in place of the standing overhead press: 3 × 8 each side, then 4 × 5, then 3 × 4, two minutes' rest, the weight added to the bar", () => {
    ALL.forEach((w) => { expect(names(w, "tue")).not.toContain("Standing Overhead Press"); expect(names(w, "tue")).toContain("One-Arm Landmine Press"); });
    const tue = names(1, "tue");
    expect(tue.indexOf("One-Arm Landmine Press")).toBe(tue.indexOf("Bench Press + Weighted Chin-Up") + 1);
    expect([1, 4, 5, 8, 9, 12].map((w) => items("tue", "One-Arm Landmine Press", w)[0].s.split(" · ")[0])).toEqual(["3 × 8 each side", "2 × 8 each side", "4 × 5 each side", "2 × 5 each side", "3 × 4 each side", "2 × 4 each side"]);
    const b = block("tue", "One-Arm Landmine Press"), i = items("tue", "One-Arm Landmine Press", 1)[0];
    expect([i.id, i.k, i.s, i.sets, i.reps, i.mk, b.rt, b.hard]).toEqual(["s_lmpress", "wr", "3 × 8 each side · the heaviest that leaves two in you", 3, "8/side", undefined, 120, 1]);
    expect(i.cue).toMatch(/Never lean back\. Log the weight you add to the bar\.$/);
    expect(card(1, "tue", "One-Arm Landmine Press").pres).toBe("3 × 8 each side · the heaviest that leaves two in you · Rest 2:00");
    expect(card(1, "tue", "One-Arm Landmine Press").lib.map((e) => e.n)).toEqual(["ONE-ARM LANDMINE PRESS"]);
    expect(sppMd).toMatch(/5\. \*\*One-arm landmine press\*\* — size 3 × 8 each side, strength 4 × 5, power 3 × 4, at the heaviest weight that leaves two in you\. Rest 2 minutes\./);
    expect(sppMd).not.toMatch(/overhead press/i);
    expect(sppMd).toMatch(/\| Tuesday \|[^\n]*bench, weighted chins and the landmine press heavy[^\n]*\| ~96 min \|/);
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
    expect(b.w).toBe("Every rep as fast as you can make it. A rep clearly slower than the first ends the set.");
    expect(card(5, "sat", "One-Arm Landmine Push Press").pres).toBe("5 × 3 each side · every rep fast · Rest 2:00");
    expect(card(1, "sat", "One-Arm Landmine Push Press").lib.map((e) => e.n)).toEqual(["ONE-ARM LANDMINE PUSH PRESS"]);
    expect([1, 4, 5, 8, 9, 12].map((w) => b.m(sppRx(w)))).toEqual([13, 8, 15, 8, 15, 8]);
    expect(sppMd).toMatch(/4\. \*\*One-arm landmine push press\*\* — size 4 × 5 each side, strength and power 5 × 3, every rep as fast as you can\. Rest 2 minutes\./);
    expect(sppMd).toMatch(/\| Saturday \| \*\*Upper power\*\* — throws, bench throws and the landmine push press,/);
  });
  it("the lighter weeks and test week: Saturday's profile is the bench throw's alone, the landmine push press runs at half the sets, and it has no top triple", () => {
    [4, 8].forEach((w) => expect(names(w, "sat").slice(2, 4)).toEqual(["Load-Velocity Profile — Bench Throw", "One-Arm Landmine Push Press"]));
    expect(block("sat", "Load-Velocity Profile — Bench Throw").items.map((x) => x.id)).toEqual(["s_prof_bt"]);
    expect(card(4, "sat", "Load-Velocity Profile — Bench Throw").pres).toBe("the bench throw at four loads · 2 reps each, the watch recording");
    expect([4, 8, 12].map((w) => card(w, "sat", "One-Arm Landmine Push Press").pres.split(" · ")[0])).toEqual(["2 × 5 each side", "3 × 3 each side", "3 × 3 each side"]);
    expect(names(12, "sat").slice(0, 4)).toEqual(["Warm-up", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "One-Arm Landmine Push Press"]);
    expect(day(12, "sat").some((c) => c.kind === "top")).toBe(false);
    expect(sppSess("sat").b.some((x) => x.profile === "pp")).toBe(false);
    expect(sppRx(4).em).toMatch(/^Lighter: the squat, bench and trap bar are their profiles/);
    expect(sppRx(12).em).toMatch(/Thursday the trap bar top triple; Saturday the 4 × 4 as the engine test\./);
    expect(sppMd).toMatch(/\| Saturday \| The 4 × 4 as the engine test\. \|/);
    expect(sppMd).toMatch(/The squat, bench and trap bar are replaced by their profiles/);
  });
  it("Wednesday's side neck raise and medicine-ball drops: back to back, 3 × each, 45 seconds after each pair, last before the run; two sets in weeks 4, 8 and 12; they run on a red morning", () => {
    ALL.forEach((w) => expect(names(w, "wed").slice(-3)).toEqual(["Dumbbell Lateral Raise", "Side Neck Raise + Medicine-Ball Drops", "The Nasal Run"]));
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
    expect(sppMd).toMatch(/\| Wednesday \| \*\*Physique A\*\* — chest and back for size, rear delts and cable crunches, the neck and medicine-ball drops, then a 30-minute nasal run \| ~75 min \|/);
  });
  it("the week's minutes: Tuesday 92 to 99 with the landmine rotation, Wednesday 75, Saturday 93 to 95; the lighter weeks and test week shorter", () => {
    expect([1, 5, 9].map((w) => sppSess("tue").m(sppRx(w)))).toEqual([92, 98, 99]);
    expect(ALL.map((w) => sppSess("wed").m(sppRx(w)))).toEqual(ALL.map(() => 75));
    expect([1, 4, 5, 8, 9, 12].map((w) => sppSess("sat").m(sppRx(w)))).toEqual([93, 87, 95, 87, 95, 88]);
    expect(sppMd).toMatch(/About 94 minutes\./);
    expect(sppMd).toMatch(/Eight and a quarter to eight and a half hours a week\./);
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
  const block = (d, n) => sppSess(d).b.find((b) => b.n === n);
  const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  it("Monday: box jumps on their own card, straight after the warm-up — 4 × 3 in every block, 2 × 3 in weeks 4, 8 and 12, a minute's rest, a hard block", () => {
    ALL.forEach((w) => expect(names(w, "mon").slice(0, 2)).toEqual(["Warm-up", "Box Jumps"]));
    expect(names(1, "mon")[2]).toBe("Back Squat");
    expect(names(4, "mon")[2]).toBe("Load-Velocity Profile — Squat");
    expect(names(12, "mon").slice(2, 4)).toEqual(["Broad jump", "Back Squat"]);
    const b = block("mon", "Box Jumps");
    expect(ALL.map((w) => b.items(sppRx(w))[0].s)).toEqual(ALL.map((w) => ([4, 8, 12].includes(w) ? "2" : "4") + " × 3 · onto a knee-high box"));
    const i = b.items(sppRx(1))[0];
    expect([i.id, i.k, b.rt, b.hard, b.star]).toEqual(["boxjump", "chk", 60, 1, 1]);
    expect(b.hide).toBeUndefined();
    expect([1, 4, 5, 12].map((w) => b.m(sppRx(w)))).toEqual([5, 3, 5, 3]);
    expect(card(1, "mon", "Box Jumps").pres).toBe("4 × 3 · onto a knee-high box · Rest 60 s");
    expect(card(1, "mon", "Box Jumps").lib.map((e) => e.n)).toEqual(["BOX JUMPS"]);
    /* the power block's jumps after each double are still there, on top */
    expect(card(11, "mon", "Back Squat").pres).toBe("4 × 2 · 95% · Rest 90 s · 3 box jumps · rest 2:00");
  });
  it("Monday's warm-up is the bike and the hold: five minutes, the box jumps no longer in it", () => {
    expect(SPPROTO.S_WU_MON.s).toBe("5 min · Mon");
    expect(SPPROTO.S_WU_MON.i.map((x) => x[0])).toEqual(["Easy bike", "Spanish squat hold"]);
    expect(card(1, "mon", "Warm-up").pres).toBe("5 min · bike, the Spanish squat hold");
    expect(sppSess("mon").b[0].m).toBe(5);
  });
  it("Thursday: five sled runs, three in the lighter weeks, two in test week; the load, the rest and the log as before", () => {
    expect(ALL.map((w) => sppSled(sppRx(w)))).toEqual([5, 5, 5, 3, 5, 5, 5, 3, 5, 5, 5, 2]);
    expect([1, 4, 12].map((w) => card(w, "thu", "Heavy Sled Sprint").pres)).toEqual(["5 × 20 m · 40–60% of bodyweight · Rest 2:00", "3 × 20 m · 40–60% of bodyweight · Rest 2:00", "2 × 20 m · 40–60% of bodyweight · Rest 2:00"]);
    const b = block("thu", "Heavy Sled Sprint"), i = b.items(sppRx(1))[0];
    expect([i.id, i.k, i.runs, b.rt, b.hard]).toEqual(["sled", "out", 1, 120, 1]);
    expect([1, 4, 5, 12].map((w) => b.m(sppRx(w)))).toEqual([12, 8, 12, 8]);
    expect(names(1, "thu").slice(0, 4)).toEqual(["Warm-up", "Heavy Sled Sprint", "Flying Sprints", "Box Jumps"]);
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
    expect(sppMd).toMatch(/\| Monday \| \*\*Lower strength\*\* — box jumps, then the squat heavy,[^\n]*\| ~73 min \|/);
    expect(sppMd).toMatch(/\*\*Warm-up · 5 minutes\*\*\n\n1\. \*\*Easy bike\*\*, 3 minutes\.\n2\. \*\*Spanish squat hold\*\*, 2 × 30 seconds\.[^\n]*\n\n\*\*The session\*\*\n\n1\. \*\*Box jump\*\* — 4 × 3, all twelve weeks\. Rest 60 seconds\./);
    expect(sppMd).toMatch(/2\. \*\*Back squat\*\* — the table's sets and percentages/);
    expect(sppMd).toMatch(/10\. \*\*Chest-supported rear-delt raise\*\*/);
    expect(sppMd).toMatch(/1\. \*\*Heavy sled sprint\*\* — 5 × 20 metres\. Rest 2 minutes\. Load 40–60% of your bodyweight on the sled\./);
    expect(sppMd).toMatch(/the jumps, sled and sprints included, is half the sets, rounded up/);
    expect(sppMd).toMatch(/\| Thursday \| Warm-up, 2 sled sprints and 3 × 3 trap bar jumps/);
    expect(sppMd).toMatch(/\| Monday \| Broad jump, best of three, after the warm-up and the box jumps\. Then the squat top triple\. \|/);
    expect(sppMd).toMatch(/\*\*The sled, five runs\.\*\*[^\n]*\(Alcaraz, 2018; Morin, 2017\)/);
    expect(sppMd).toMatch(/\*\*Two jump days\.\*\*/);
  });
});

describe("13 · a card added later doesn't count against days trained before it", () => {
  /* the programme began on Monday 2 November 2026; these went in after that, and count from the day after they did */
  const SINCE = {
    mon: { K: "2026-11-13", N: "2026-11-08", Q: "2026-11-08" },
    tue: { K: "2026-11-06", J: "2026-11-14", I: "2026-11-09" },
    wed: { F: "2026-11-13" },
    thu: { J: "2026-11-08", K: "2026-11-09" },
    sat: { J: "2026-11-09", K: "2026-11-09" },
    sun: {},
  };
  const DAYS6 = ["mon", "tue", "wed", "thu", "sat", "sun"], OFF = { mon: 0, tue: 1, wed: 2, thu: 3, sat: 5, sun: 6 };
  const iso = (week, d) => { const t = new Date(Date.UTC(2026, 10, 2 + (week - 1) * 7 + OFF[d])); return t.toISOString().slice(0, 10); };
  /* the cards a day is measured against: its real blocks that week, less any that came later */
  const counted = (week, d) => sppSess(d).b.filter((b) => b.L && !(b.hide && b.hide(sppRx(week))) && countsOn(b, iso(week, d))).map((b) => b.L);
  it("each card added after the programme began carries the date it counts from; the rest carry none", () => {
    DAYS6.forEach((d) => { const got = {}; sppSess(d).b.forEach((b) => { if (b.since) got[b.L] = b.since; }); expect([d, got]).toEqual([d, SINCE[d]]); });
    expect(sppSess("mon").b.find((b) => b.since === "2026-11-13").n).toBe("Box Jumps");
    expect(sppSess("tue").b.find((b) => b.since === "2026-11-09").n).toBe("Pressure Rounds");
    expect(sppSess("wed").b.find((b) => b.since).n).toBe("Side Neck Raise + Medicine-Ball Drops");
    expect(sppSess("thu").b.filter((b) => b.since).map((b) => b.n)).toEqual(["Trap Bar Shrug", "Side Plank + Dead Bug"]);
    expect(sppSess("sat").b.filter((b) => b.since).map((b) => b.n)).toEqual(["Side Plank", "Landmine Rotation"]);
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
    expect(names("tue")).toContain("Pressure Rounds");
    expect(names("mon")).toContain("Box Jumps");
    expect(names("wed")).toContain("Side Neck Raise + Medicine-Ball Drops");
  });
});

describe("14 · Tuesday's landmine rotation", () => {
  const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp");
  const day = (w, d) => CAT.filter((c) => c.week === w && c.day === d && c.edge == null).filter((c, i, a) => a.findIndex((x) => x.i === c.i) === i);
  const names = (w, d) => day(w, d).map((c) => c.n);
  const card = (w, d, n) => day(w, d).find((c) => c.n === n);
  const block = (d, n) => sppSess(d).b.find((b) => b.n === n);
  const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  it("every week, straight after the one-arm landmine press, before the rows and dips; Saturday's stays where it was", () => {
    ALL.forEach((w) => { const t = names(w, "tue"); expect([w, t[t.indexOf("One-Arm Landmine Press") + 1]]).toEqual([w, "Landmine Rotation"]); });
    ALL.forEach((w) => { const s = names(w, "sat"); expect([w, s.slice(s.indexOf("Side Plank"), s.indexOf("Side Plank") + 2)]).toEqual([w, ["Side Plank", "Landmine Rotation"]]); });
    expect(names(1, "tue")).toEqual(["Warm-up", "Rotational Shot-Put Throw + Hook Throw", "Bench Press + Weighted Chin-Up", "One-Arm Landmine Press", "Landmine Rotation", "Chest-Supported Row + Weighted Dip", "Cable Lateral Raise", "Ab Wheel Rollout", "Assault Bike Bursts", "Pressure Rounds"]);
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
  it("Tuesday about 96 minutes; the week eight and a quarter to eight and a half hours; the title lines name it", () => {
    expect([1, 4, 5, 8, 9, 12].map((w) => sppSess("tue").m(sppRx(w)))).toEqual([92, 80, 98, 80, 99, 89]);
    const week = (w) => ["mon", "tue", "wed", "thu", "sat", "sun"].reduce((a, d) => a + sppSess(d).m(sppRx(w)), 0);
    expect([1, 5, 9].map(week)).toEqual([496, 512, 513]);
    expect(sppSess("tue").t).toMatch(/the landmine press and landmine rotations, rows, dips/);
    expect(sppSess("tue").intro).toMatch(/the landmine press heavy, then landmine rotations, then rows and dips for size/);
  });
  it("the document: the week's table, Tuesday's item 6 and the renumbered list, the hours, and why", () => {
    expect(sppMd).toMatch(/Friday is off\. Eight and a quarter to eight and a half hours a week\./);
    expect(sppMd).toMatch(/\| Tuesday \| \*\*Upper strength\*\* — rotational throws, then bench, weighted chins and the landmine press heavy, then landmine rotations, rows and dips, then 6-second bursts and the pressure rounds on the assault bike \| ~96 min \|/);
    expect(sppMd).toMatch(/\n6\. \*\*Landmine rotation\*\* — 3 × 6–8 each side, controlled\. Rest 60 seconds\. Straight after the landmine press, with the bar still in the landmine\./);
    expect(sppMd).toMatch(/\n7\. \*\*Chest-supported dumbbell row\*\*, alternated with 8 —/);
    expect(sppMd).toMatch(/\n8\. \*\*Weighted dip\*\*/);
    expect(sppMd).toMatch(/\n12\. \*\*Pressure rounds\*\* — 3 rounds/);
    expect(sppMd).toMatch(/\n10\. \*\*Landmine rotation\*\* — 3 × 6–8 each side, controlled\. Rest 60 seconds\. One end of a barbell/);
    expect(sppMd).toMatch(/the landmine rotation, Tuesday and Saturday, trains it under load;/);
    expect(sppMd).not.toMatch(/Saturday's landmine rotation trains it/);
  });
});
