import { describe, it, expect } from "vitest";
import sppMd from "../optimal-8-strength-power-physique.md?raw";
import builderMd from "../season-builder.md?raw";
import { buildSeason, rowRx, describeSeason, CYCLE12, CYCLE16 } from "./builder.js";
import { SPP_ROWS, sppRx, sppSess, sppTests, sppVelPhase, sppRamp, sppPhotoDay, sppMainLine, SPPENG } from "./spp.js";
import { targetFor, TYPICAL } from "./velocity.js";
import { parseKey, inScope, scopeOf, weekLabel, ergSeries, series, DASH_IDS } from "./metrics.js";
import { libFor } from "./library.js";
import { sessionCatalog } from "./App.jsx";

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
  it("Monday: the squat, then the Romanian deadlift, the split squat, the leg curl, the calves and leg raises", () => {
    expect(names(1, "mon")).toEqual(["Warm-up", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Seated Leg Curl", "Standing Calf Raise + Hanging Leg Raise"]);
    expect(card(1, "mon", "Back Squat").pres).toBe("4 × 6 · 75% · Rest 3:00");
    expect(card(5, "mon", "Back Squat").pres).toBe("5 × 3 · 85% · Rest 3:00");
    expect(card(11, "mon", "Back Squat").pres).toBe("4 × 2 · 95% · Rest 90 s · 3 box jumps · rest 2:00");
    expect(card(11, "mon", "Back Squat").lib.map((e) => e.n)).toEqual(["BACK SQUAT", "BOX JUMPS"]);
    expect([1, 5, 9].map((w) => card(w, "mon", "Romanian Deadlift").pres.split(" · ")[0])).toEqual(["3 × 8", "3 × 6", "3 × 5"]);
    expect([1, 5, 9].map((w) => card(w, "mon", "Bulgarian Split Squat").pres.split(" · ")[0])).toEqual(["3 × 8 each leg", "3 × 6 each leg", "2 × 6 each leg"]);
    expect(card(1, "mon", "Standing Calf Raise + Hanging Leg Raise").kind).toBe("pair");
  });
  it("Tuesday: bench and weighted chin-ups as a pair, the overhead press, rows and dips, lateral raises, the ab wheel", () => {
    expect(names(1, "tue")).toEqual(["Warm-up", "Bench Press + Weighted Chin-Up", "Standing Overhead Press", "Chest-Supported Row + Weighted Dip", "Cable Lateral Raise", "Ab Wheel Rollout"]);
    const pair = card(5, "tue", "Bench Press + Weighted Chin-Up");
    expect(pair.kind).toBe("pair");
    expect(pair.rows.map((r) => r.n)).toEqual(["Bench press", "Weighted chin-up, palms toward you"]);
    expect(pair.lib.map((e) => e.n)).toEqual(["BENCH PRESS", "WEIGHTED CHIN-UP, PALMS TOWARD YOU"]);
    expect([1, 5, 9].map((w) => card(w, "tue", "Standing Overhead Press").pres.split(" · ")[0])).toEqual(["3 × 6", "4 × 4", "3 × 3"]);
    expect(card(9, "tue", "Bench Press + Weighted Chin-Up").lib.map((e) => e.n)).toEqual(["BENCH PRESS", "MEDICINE-BALL CHEST PASSES", "WEIGHTED CHIN-UP, PALMS TOWARD YOU"]);
  });
  it("Wednesday and Sunday: size, then the 30-minute nasal run; Sunday ends with the weekly check", () => {
    expect(names(1, "wed")).toEqual(["Warm-up", "Incline Dumbbell Press + Lat Pulldown", "Low-to-High Cable Fly + Wide-Grip Seated Row", "Reverse Pec-Deck", "Dumbbell Lateral Raise", "The Nasal Run"]);
    expect(card(1, "wed", "The Nasal Run").pres).toBe("30 min easy, nose only · 65–75% of peak");
    expect(names(1, "sun")).toEqual(["Warm-up", "Cable Lateral Raise", "Face Pull", "Dumbbell Shrug", "EZ-Bar Curl + Overhead Triceps Extension", "Incline Dumbbell Curl + Dumbbell Skull Crusher", "Hammer Curl", "Seated Calf Raise", "The Nasal Run", "Weekly Check"]);
    expect(card(1, "sun", "Cable Lateral Raise").pres).toMatch(/^4 × 12–20 · the last set to failure, then 30% lighter and go again/);
  });
  it("Thursday: the sled, the sprints and the jumps first, then trap bar jumps, the trap bar, the pause squat, the Nordics", () => {
    expect(names(1, "thu")).toEqual(["Warm-up", "Heavy Sled Sprint", "Flying Sprints", "Box Jumps", "Trap Bar Jump", "Trap Bar Deadlift", "Pause Squat", "Nordic Curls"]);
    expect(names(5, "thu")).toContain("Low-Box Depth Jumps");
    expect(names(9, "thu")).toContain("Depth Jumps");
    expect(card(5, "thu", "Low-Box Depth Jumps").pres).toMatch(/^4 × 3 · 20 cm box/);
    expect(card(9, "thu", "Depth Jumps").pres).toMatch(/^4 × 3 · 30–40 cm box/);
    expect([1, 3, 5].map((w) => card(w, "thu", "Flying Sprints").pres.split(" · ").slice(0, 2).join(" · "))).toEqual(["3 × 20 m · at 90%", "3 × 20 m · flat out", "4 × 20 m · flat out"]);
    expect([1, 5, 9].map((w) => card(w, "thu", "Pause Squat").pres)).toEqual(["3 × 5 · 2-second pause · 65% · Rest 2:00", "3 × 3 · 2-second pause · 72.5% · Rest 2:00", "3 × 2 · 2-second pause · 75% · Rest 2:00"]);
    expect(card(10, "thu", "Trap Bar Deadlift").pres).toBe("4 × 2 · 92.5% · Rest 90 s · 3 broad jumps · rest 2:00");
  });
  it("Saturday: the throws, the bench throw, the push press, then bench and pull-ups, rows, lateral raises, then the 4 × 4", () => {
    expect(names(1, "sat")).toEqual(["Warm-up", "Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "Push Press", "Bench Press, Touch and Go + Pull-Up", "One-Arm Dumbbell Row", "Cable Lateral Raise", "The 4 × 4 Intervals"]);
    expect([1, 5, 9].map((w) => card(w, "sat", "Push Press").pres)).toEqual(["4 × 5 · 70% · Rest 2:30", "5 × 3 · 80% · Rest 2:30", "5 × 2 · 85% · Rest 2:30"]);
    expect(card(1, "sat", "Bench Throw (Smith)").lib.some((e) => e.n === "BENCH THROW" && /safety stops/.test(e.text))).toBe(true);
    expect(card(4, "sat", "The 3 × 4 Intervals").pres).toMatch(/3 × 4 minutes at 90–95% of your peak heart rate/);
  });
  it("the lighter weeks: the profiles in place of the main lifts, everything else half the sets, rounded up", () => {
    ["mon", "tue", "thu", "sat"].forEach((d) => expect(day(4, d).some((c) => /^Load-Velocity Profile/.test(c.n))).toBe(true));
    expect(names(4, "mon")).not.toContain("Back Squat");
    expect(names(4, "thu")).not.toContain("Trap Bar Deadlift");
    expect(names(4, "thu")).not.toContain("Trap Bar Jump");
    expect(names(4, "sat")).not.toContain("Push Press");
    expect(names(4, "sat")).not.toContain("Bench Throw (Smith)");
    expect(card(4, "tue", "Weighted Chin-Up, Palms Toward You").pres.split(" · ")[0]).toBe("2 × 6");
    expect(card(8, "tue", "Weighted Chin-Up, Palms Toward You").pres.split(" · ")[0]).toBe("3 × 4");
    expect(card(4, "wed", "Dumbbell Lateral Raise").pres.split(" · ")[0]).toBe("2 × 12–20");
    expect(card(4, "sun", "Hammer Curl").pres.split(" · ")[0]).toBe("1 × 10–12");
    expect(card(4, "thu", "Heavy Sled Sprint").pres.split(" · ")[0]).toBe("2 × 20 m");
    expect(card(8, "thu", "Low-Box Depth Jumps").pres.split(" · ")[0]).toBe("2 × 3");
  });
  it("test week: the broad jump and the top triples, the chin-up's added weight, no sprints, depth jumps or pause squats", () => {
    expect(day(12, "mon").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Back Squat"]);
    expect(names(12, "mon")[1]).toBe("Broad jump");
    expect(day(12, "tue").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Bench Press"]);
    expect(card(12, "tue", "Weighted chin-up, palms toward you — top triple").kind).toBe("out");
    expect(day(12, "thu").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Trap Bar Deadlift"]);
    expect(names(12, "thu")).toEqual(["Warm-up", "Heavy Sled Sprint", "Trap Bar Jump", "Trap Bar Deadlift", "Nordic Curls"]);
    expect(card(12, "thu", "Trap Bar Jump").pres.split(" · ")[0]).toBe("3 × 3 @ your peak-power load");
    expect(day(12, "sat").filter((c) => c.kind === "top").map((c) => c.n)).toEqual(["Push Press"]);
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
  it("red: the main lifts, sprints, jumps, throws and the 4 × 4 are the hard blocks; the size work isn't", () => {
    const hard = (day, rx) => sppSess(day).b.filter((b) => !(b.hide && b.hide(rx)) && b.hard).map((b) => (typeof b.n === "function" ? b.n(rx) : b.n));
    expect(hard("mon", sppRx(2))).toEqual(["Back Squat"]);
    expect(hard("tue", sppRx(2))).toEqual(["Bench Press + Weighted Chin-Up", "Standing Overhead Press"]);
    expect(hard("wed", sppRx(2))).toEqual([]);
    expect(hard("sat", sppRx(2))).toEqual(["Medicine-Ball Chest Pass + Rotational Scoop Throw", "Bench Throw (Smith)", "Push Press", "The 4 × 4 Intervals"]);
    expect(hard("sun", sppRx(2))).toEqual([]);
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
