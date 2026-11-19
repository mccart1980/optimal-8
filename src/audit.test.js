import { describe, it, expect } from "vitest";
import prepMd from "../optimal-8-prep.md?raw";
import campMd from "../optimal-8-camp.md?raw";
import fighterMd from "../optimal8fighter.md?raw";
import builderMd from "../season-builder.md?raw";
import { AUDIT_SINCE, auditOn, SPLEEFT_FAST, SPLEEFT_ARM, ARMS_THIRD, BIKE_THIRD, ROUNDS_LIB, ERG_ROUNDS_LIB, T20_LIB, bikeFields } from "./audit.js";
import { AUDIT_SINCE as SPP_SINCE } from "./spp.js";
import { prepSess, prepRx, pengLine } from "./prep.js";
import { campSess, campMaster, CS, CSFW, roundFields, cengLine, cengLib } from "./camp.js";
import { sessionCatalog, fighterSess, FIGHTER_MAXES_RULE } from "./App.jsx";
import { BAR_SPEED_ITEMS, BAR_SPEED_FAST } from "./metrics.js";
import { LIBRARY, libFor } from "./library.js";

/* ================================================================
   THE AUDIT OF 19 NOVEMBER 2026, IN PREP, THE CAMP AND FIGHTER — from
   the week of Monday 23 November: the SkiErg out, the one-arm landmine
   push press, a speed on every fast rep, the camp's Tuesday starts and
   its last morning's primer. Before that Monday every page reads as it
   did. (Strength, Power and Physique's own changes: spp.test.js, 15.)
   ================================================================ */

const v = (x, rx) => (typeof x === "function" ? x(rx) : x);
const blk = (S, L) => S.b.find((b) => b.L === L);
const named = (S, n) => S.b.find((b) => v(b.n, {}) === n);
const shows = (b, rx) => !(b.hide && b.hide(rx));
const entry = (n) => LIBRARY.find((e) => e.n === n);
/* the catalog's two main seasons: the cycle runs in early 2026, before
   the switch; the master season in 2027, after it */
const CAT = sessionCatalog(["master", "cycle"]).filter((c) => c.edge !== false && !c.lastTen);
const page = (set, row, pick, day) => CAT.filter((c) => c.set === set && c.row === row && c.day === day && pick(c));
const card = (set, row, pick, day, n) => page(set, row, pick, day).find((c) => c.n === n);
const names = (set, row, pick, day) => page(set, row, pick, day).map((c) => c.n);
const wk = (w) => (c) => c.week === w, id = (i) => (c) => c.id === i;

describe("the audit in Prep, the camp and Fighter · the switch", () => {
  it("is the week of Monday 23 November 2026, the same Monday as Strength, Power and Physique's", () => {
    expect(AUDIT_SINCE).toBe("2026-11-23");
    expect(SPP_SINCE).toBe(AUDIT_SINCE);
    expect([auditOn("2026-11-16"), auditOn("2026-11-22"), auditOn("2026-11-23"), auditOn("2027-01-04"), auditOn(null), auditOn(undefined)]).toEqual([false, false, true, true, false, false]);
  });

  it("before it every new card hides and every old one shows; after it, the other way round", () => {
    const pp = { sets: 3, reps: 3, pct: 75 };
    const cases = [
      [prepSess("sat"), "F", "LM", { pp }],
      [campSess("sat", {}), "F", "LM", { pp }],
      [fighterSess("sat"), "G", "LM", { pp: { sc: "4 × 3 @ 82%", sets: 4, reps: 3, pct: 82 } }],
      [campSess("tue", {}), "Q", "ST", { speed: true }],
    ];
    cases.forEach(([S, old, neu, rx]) => {
      expect([shows(blk(S, old), rx), shows(blk(S, neu), rx)]).toEqual([true, false]);
      expect([shows(blk(S, old), Object.assign({ au: true }, rx)), shows(blk(S, neu), Object.assign({ au: true }, rx))]).toEqual([false, true]);
      expect(blk(S, neu).since).toBe(AUDIT_SINCE);
    });
    /* the primer: the camp's last day and its rehearsal, nowhere else */
    expect([shows(blk(CSFW.sat, "PR"), {}), shows(blk(CSFW.sat, "PR"), { au: true })]).toEqual([false, true]);
    const reh = { sim: { rounds: 6, rest: 60, rehearsal: 1 } };
    expect([shows(blk(CS.sun, "PR"), Object.assign({ au: true }, reh)), shows(blk(CS.sun, "PR"), reh), shows(blk(CS.sun, "PR"), { au: true, sim: { rounds: 6, rest: 60 } })]).toEqual([true, false, false]);
    expect(CSFW.reh.b.map((b) => b.L)).toEqual(["PR", "A", "C", "D"]);
  });

  it("the catalog's cycle, in early 2026, is untouched; its master season, in 2027, runs the changes", () => {
    expect(names("cycle", "prep", wk(2), "sat")).toContain("Push Press");
    expect(names("cycle", "prep", wk(2), "sat")).not.toContain("One-Arm Landmine Push Press");
    expect(card("cycle", "prep", wk(2), "sun", "The 6 × 3 Simulation").lib.map((e) => e.n)).toEqual(["THE ROUNDS (FIGHT SIMULATION)"]);
    expect(card("cycle", "prep", wk(2), "sun", "The 6 × 3 Simulation").say).toMatch(/Minute 1 \| SkiErg/);
    expect(card("cycle", "prep", wk(1), "sun", "The 20-Minute Test").lib.map((e) => e.n)).toEqual(["THE 20-MINUTE TEST"]);
    expect(card("cycle", "prep", id("P12"), "thu", "ROUNDS ON THE ERG").pres).toBe("6 × 3 minutes on the bike or SkiErg at fight pace — the output you can hold across all six — 60 seconds between");
    expect(card("cycle", "prep", id("P12"), "thu", "ROUNDS ON THE ERG").lib.map((e) => e.n)).toEqual(["ROUNDS ON THE ERG"]);
    expect(card("cycle", "prep", wk(1), "sat", "Load-Velocity Profiles — Squat, Bench, Push Press").pres).toBe("the squat at five loads, bench and push press at four");
    expect(names("cycle", "prep", id("P5"), "sat")).toContain("Working-Weight Check — Push Press");
  });
});

describe("the audit in Prep, the camp and Fighter · the SkiErg out", () => {
  it("the rounds: the first third is the assault bike with the arms only, the second the bike with arms and legs; the card's words say so", () => {
    const sim = card("master", "camp", wk(1), "sun", "The 6 × 3 Simulation");
    expect(sim.lib.map((e) => e.n)).toEqual([ROUNDS_LIB]);
    expect(sim.say).toMatch(/Minute 1 \| Assault bike, arms only — feet on the pegs \| .*Minute 2 \| Assault bike, arms and legs \|/);
    expect(sim.say).not.toMatch(/SkiErg/);
    expect([ARMS_THIRD, BIKE_THIRD]).toEqual(["Assault bike, arms only — feet on the pegs", "Assault bike, arms and legs"]);
    const e = entry(ROUNDS_LIB);
    expect(e.text).toMatch(/^Your fight, on the machines\. Each round is split into thirds: the assault bike with your arms only, feet on the pegs; then the assault bike with arms and legs; then medicine-ball slams \(or the bag\)\./);
    expect(e.text).toMatch(/Log its calories for round one, clear the screen in the rest before the last round, and log the last round's\./);
    expect(e.text).not.toMatch(/SkiErg/);
    /* the entry an older page shows is as it was */
    expect(entry("THE ROUNDS (FIGHT SIMULATION)").text).toMatch(/thirds — SkiErg, then assault bike, then medicine-ball slams/);
    /* Prep's rounds and its three easy rounds, and the camp's past the fight, the same; the rehearsal and the double keep their own words */
    expect(card("master", "prep", wk(2), "sun", "The 6 × 3 Simulation").lib.map((x) => x.n)).toEqual([ROUNDS_LIB]);
    expect(card("master", "prep", wk(1), "sun", "Three Easy Rounds").lib.map((x) => x.n)).toEqual([ROUNDS_LIB]);
    expect(card("master", "camp", wk(8), "sun", "The 10 × 3 Simulation").lib.map((x) => x.n)).toEqual([ROUNDS_LIB]);
    expect(card("master", "camp", wk(9), "sun", "THE FIGHT-DAY REHEARSAL").lib.map((x) => x.n)).toEqual(["THE FIGHT-DAY REHEARSAL"]);
    const C = blk(CS.sun, "C");
    expect(C.libAs({ au: true, sim: { rounds: 7, rest: 60, double: { a: 4, b: 3, easy: 5 } } })).toBe(null);
    expect(C.libAs({ sim: { rounds: 6, rest: 60 } })).toBe(null);
  });

  it("the rounds' timer names the arms-only third, and a round logs one number: the bike's calories", () => {
    const rx = Object.assign(campMaster(1), { au: true }), old = campMaster(1);
    const C = blk(CS.sun, "C");
    expect(C.timer(rx).opt.arms).toBe(1);
    expect("arms" in C.timer(old).opt).toBe(false);
    expect(roundFields("ROUND 1")).toEqual([{ k: "w", l: "ROUND 1 · SKIERG (M)" }, { k: "cal", l: "ROUND 1 · BIKE (CAL)" }]);
    expect(roundFields("ROUND 1", {})).toEqual(roundFields("ROUND 1"));
    expect(roundFields("LAST ROUND", { au: true })).toEqual([{ k: "cal", l: "LAST ROUND · BIKE (CAL)" }]);
    expect(bikeFields("ROUND 1")).toEqual([{ k: "cal", l: "ROUND 1 · BIKE (CAL)" }]);
    const outs = (r) => v(C.items, r).filter((i) => i.k === "out").map((i) => [i.id, i.u, i.fields.map((f) => f.l)]);
    expect(outs(rx)).toEqual([["c_fs_rd1", "bike cal", ["ROUND 1 · BIKE (CAL)"]], ["c_fs_rd6", "bike cal", ["LAST ROUND · BIKE (CAL)"]]]);
    expect(outs(old)).toEqual([["c_fs_rd1", "SkiErg m / bike cal", ["ROUND 1 · SKIERG (M)", "ROUND 1 · BIKE (CAL)"]], ["c_fs_rd6", "SkiErg m / bike cal", ["LAST ROUND · SKIERG (M)", "LAST ROUND · BIKE (CAL)"]]]);
    /* Prep's the same */
    const P = blk(prepSess("sun"), "C"), prx = Object.assign({}, prepRx(2), { au: true });
    expect(P.timer(prx).opt.arms).toBe(1);
    expect("arms" in P.timer(prepRx(2)).opt).toBe(false);
    expect(v(P.items, prx).filter((i) => i.k === "out").map((i) => i.fields.map((f) => f.l))).toEqual([["ROUND 1 · BIKE (CAL)"], ["LAST ROUND · BIKE (CAL)"]]);
  });

  it("the rounds on the erg are on the bike, and the 20-minute test: the line, and the words under it", () => {
    const erg = card("master", "camp", wk(4), "thu", "ROUNDS ON THE ERG · 7 × 3");
    expect(erg.pres).toBe("7 × 3 minutes on the bike at fight pace — the output you can hold across all of them — 60 seconds between");
    expect(erg.lib.map((e) => e.n)).toEqual([ERG_ROUNDS_LIB]);
    expect(entry(ERG_ROUNDS_LIB).text).toMatch(/^Three-minute rounds on the bike at the pace you could hold for the whole fight, one minute's rest between\./);
    expect(entry("ROUNDS ON THE ERG").text).toMatch(/on the bike or SkiErg at the pace/);
    const ergR = { rounds: 7, mins: 3, rest: 60 };
    expect(cengLine("erg", { ergR })).toMatch(/minutes on the bike or SkiErg at fight pace/);
    expect(cengLine("erg", { ergR, au: true })).toMatch(/minutes on the bike at fight pace/);
    expect([cengLib("erg", { au: true }), cengLib("erg8", { au: true }), cengLib("erg", {}), cengLib("vo2", { au: true })]).toEqual([ERG_ROUNDS_LIB, ERG_ROUNDS_LIB, null, null]);
    expect(pengLine("e2", { e2: "ergrounds", au: true })).toBe("6 × 3 minutes on the bike at fight pace — the output you can hold across all six — 60 seconds between");
    expect(pengLine("e2", { e2: "ergrounds" })).toMatch(/on the bike or SkiErg at fight pace/);
    expect(pengLine("e1", { e1: "vo2", au: true })).toBe(pengLine("e1", { e1: "vo2" }));
    const p12 = card("master", "prep", id("P12"), "thu", "ROUNDS ON THE ERG");
    expect([p12.pres, p12.lib.map((e) => e.n)]).toEqual([pengLine("e2", { e2: "ergrounds", au: true }), [ERG_ROUNDS_LIB]]);
    /* the 20-minute test */
    expect(card("master", "prep", wk(1), "sun", "The 20-Minute Test").lib.map((e) => e.n)).toEqual([T20_LIB]);
    expect(entry(T20_LIB).text).toBe("Five easy minutes, then as much distance as you can in 20 minutes on your usual bike. Log the distance and the highest heart rate you saw.");
    expect(entry("THE 20-MINUTE TEST").text).toMatch(/on your usual bike or SkiErg/);
    [blk(CS.mon, "X"), blk(campSess("sun", { pre: 1, checks: 1 }), "X"), blk(prepSess("sun"), "X"), named(fighterSess("sun"), "20-Minute Bike Test")]
      .forEach((b) => expect([b.libAs({ au: true }), b.libAs({})]).toEqual([T20_LIB, null]));
    expect(libFor(T20_LIB)[0].n).toBe(T20_LIB);
    /* the lookups an older page makes still find the older entries */
    expect([libFor("The 20-Minute Test")[0].n, libFor("20-Minute Bike Test")[0].n, libFor("ROUNDS ON THE ERG · 7 × 3")[0].n, libFor("THE ROUNDS")[0].n, libFor("Fight Simulation")[0].n])
      .toEqual(["THE 20-MINUTE TEST", "THE 20-MINUTE TEST", "ROUNDS ON THE ERG", "THE ROUNDS (FIGHT SIMULATION)", "THE ROUNDS (FIGHT SIMULATION)"]);
  });

  it("Fighter's rounds: minute 1 on the assault bike with the arms only, one box a round in the bike's calories", () => {
    const D = named(fighterSess("sun"), "Fight Simulation");
    const rx = { sim: { rest: 90, max3: 1 } };
    expect(v(D.items, rx).map((i) => [i.n, i.k === "txt" ? i.s : i.u])).toEqual([["Minute 1", "SkiErg"], ["Minute 2", "Assault bike"], ["Minute 3", "Landmine punches (odd rounds) or med-ball slams (even)"],
      ["Round 1 output", "SkiErg m / bike cal"], ["Round 6 output", "SkiErg m / bike cal"]]);
    expect(v(D.items, Object.assign({ au: true }, rx)).map((i) => [i.n, i.k === "txt" ? i.s : i.u])).toEqual([["Minute 1", ARMS_THIRD], ["Minute 2", BIKE_THIRD], ["Minute 3", "Landmine punches (odd rounds) or med-ball slams (even)"],
      ["Round 1 output", "bike cal"], ["Round 6 output", "bike cal"]]);
    expect(D.timer(Object.assign({ au: true }, rx)).opt).toEqual({ rounds: 6, rest: 90, max3: 1, arms: 1 });
    expect(D.timer(rx).opt).toEqual({ rounds: 6, rest: 90, max3: 1 });
    expect([D.libAs({ au: true }), D.libAs({})]).toEqual([ROUNDS_LIB, null]);
  });
});

describe("the audit in Prep, the camp and Fighter · the one-arm landmine push press", () => {
  it("in the barbell push press's place: the week's own sets and reps, each side, every rep fast; no working max, no percentage", () => {
    const lm = card("master", "prep", wk(2), "sat", "One-Arm Landmine Push Press");
    expect(lm.pres).toBe("3 × 3 each side · every rep fast · Rest 2:00");
    expect(lm.lib.map((e) => e.n)).toEqual(["ONE-ARM LANDMINE PUSH PRESS"]);
    expect(names("master", "prep", wk(2), "sat")).not.toContain("Push Press");
    expect(card("master", "camp", wk(5), "sat", "One-Arm Landmine Push Press").pres).toBe("2 × 3 each side · every rep fast · Rest 2:00");
    expect(card("master", "camp", wk(6), "sat", "One-Arm Landmine Push Press").pres).toBe("3 × 3 each side · every rep fast · Rest 2:00");
    /* where the week has no push press it has no landmine push press: Prep's top-triple and test weeks, the camp's last two */
    ["P9", "P14"].forEach((i) => expect(names("master", "prep", id(i), "sat")).not.toContain("One-Arm Landmine Push Press"));
    [9, 10].forEach((w) => expect(names("master", "camp", wk(w), "sat")).not.toContain("One-Arm Landmine Push Press"));
    [[prepSess("sat"), "p_lmpush", 8], [campSess("sat", {}), "c_lmpush", 8], [fighterSess("sat"), "lmpush", 10]].forEach(([S, lid, mins]) => {
      const b = blk(S, "LM"), rx = { au: true, pp: { sc: "3 × 3 @ 75%", sets: 3, reps: 3, pct: 75 } }, it = v(b.items, rx)[0];
      expect([it.id, it.k, it.sets, it.reps, it.mk, it.pct]).toEqual([lid, "wr", 3, "3/side", undefined, undefined]);
      expect([b.m, b.rest, b.rt, b.hard, b.mainLift, b.vel]).toEqual([mins, "Rest 2:00", 120, 1, undefined, undefined]);
      expect([!!v(b.spd, rx), b.spdLine]).toEqual([true, SPLEEFT_ARM]);
      expect(BAR_SPEED_ITEMS[lid]).toBe("lmpush");
    });
    expect(BAR_SPEED_FAST.map((x) => x[0])).toContain("lmpush");
  });

  it("Prep: the profiles are the squat's and the bench's, and the lighter week has no push press check", () => {
    const prof = card("master", "prep", wk(1), "sat", "Load-Velocity Profiles — Squat and Bench");
    expect(prof.pres).toBe("the squat at five loads, the bench at four");
    expect(prof.lib.map((e) => e.n)).toEqual(["LOAD-VELOCITY PROFILE"]);
    const P = blk(prepSess("sat"), "P");
    expect(v(P.items, { au: true }).map((i) => [i.n, i.id])).toEqual([["Squat at five loads", "p_prof_sq"], ["Bench at four loads", "p_prof_bp"], ["Bench throw at four loads", "p_prof_bt"]]);
    expect(v(P.items, {}).map((i) => i.n)).toEqual(["Squat at five loads", "Bench and push press at four loads", "Bench throw at four loads"]);
    expect([v(P.m, { au: true }), v(P.m, {})]).toEqual([11, 14]);
    expect(libFor("Bench at four loads")[0].n).toBe("LOAD-VELOCITY PROFILE");
    expect(names("master", "prep", id("P5"), "sat")).toContain("Working-Weight Check — Squat");
    expect(names("master", "prep", id("P5"), "sat")).not.toContain("Working-Weight Check — Push Press");
  });

  it("Fighter: the week's push press sets and reps, each side; week 1, with no number to find, runs 4 × 3; none in the top-triple weeks", () => {
    const b = blk(fighterSess("sat"), "LM");
    const line = (pp) => (shows(b, { au: true, pp }) ? v(b.items, { au: true, pp })[0].s : null);
    expect(line({ sc: "CALIBRATE — ramp to a 3RM @ RPE 8", cal: 1 })).toBe("4 × 3 each side · every rep fast");
    expect(line({ sc: "4 × 3 @ 82%", sets: 4, reps: 3, pct: 82 })).toBe("4 × 3 each side · every rep fast");
    expect(line({ sc: "2 × 3 @ 65%", sets: 2, reps: 3, pct: 65 })).toBe("2 × 3 each side · every rep fast");
    expect(line({ sc: "2 × 2 @ 85%", sets: 2, reps: 2, pct: 85 })).toBe("2 × 2 each side · every rep fast");
    expect([line({ bench: 1 }), line(null)]).toEqual([null, null]);
    /* the barbell's card, as it was, in a week before the switch */
    const G = blk(fighterSess("sat"), "G");
    expect([shows(G, { pp: { sc: "4 × 3 @ 82%" } }), shows(G, { pp: { bench: 1 } }), G.calib]).toEqual([true, false, "pp"]);
  });
});

describe("the audit in Prep, the camp and Fighter · a speed on every fast rep", () => {
  it("the bench throw's own card shows the bar-speed box and Spleeft's rule, from the switch", () => {
    [[named(prepSess("wed"), "Bench Throw (Smith)"), "throw"], [named(campSess("wed", {}), "Bench Throw"), "c_benchthrow"], [named(fighterSess("mon"), "Bench Throw (Smith)"), "throw"]].forEach(([b, tid]) => {
      expect([!!v(b.spd, { au: true }), !!v(b.spd, {}), b.spdLine]).toEqual([true, false, SPLEEFT_FAST]);
      expect(BAR_SPEED_ITEMS[tid]).toBe("bthrow");
    });
    expect(SPLEEFT_FAST).toBe("Spleeft on your wrist: read the speed after every rep. A rep 10% slower than the set's fastest ends the set.");
    expect(SPLEEFT_ARM).toMatch(/^Spleeft reads the arm the watch is on: that side first, the speed read after every rep\./);
  });
});

describe("the audit in Prep, the camp and Fighter · the camp's Tuesday speed and its last morning", () => {
  it("Tuesday's speed, weeks 6 to 8 with the Edge on: three 10-metre starts from the stance; the flying sprints stay on Saturday; Prep's Tuesday is as it was", () => {
    [6, 7, 8].forEach((w) => {
      const st = card("master", "camp", wk(w), "tue", "Speed — stance starts");
      expect([st.pres, st.lib.map((e) => e.n)]).toEqual(["3 × 10 m · Rest 90 s", ["STANCE STARTS"]]);
      expect(names("master", "camp", wk(w), "tue")).not.toContain("Flying sprint 20 m");
      expect(names("master", "camp", wk(w), "tue").indexOf("Speed — stance starts")).toBe(names("master", "camp", wk(w), "tue").indexOf("Shuttle bursts") + 1);
      expect(card("master", "camp", wk(w), "sat", "Flying Sprints").pres).toMatch(/^5 × 20 m/);
    });
    expect(names("master", "camp", wk(5), "tue")).not.toContain("Speed — stance starts");
    const ST = blk(campSess("tue", {}), "ST");
    expect([ST.m, ST.edge, v(ST.items, {})[0].id, v(ST.items, {})[0].k]).toEqual([4, 1, "c_stance_tue", "chk"]);
    /* Prep's weeks 11 to 13 keep the three flying twenties on Tuesday */
    const Q = blk(prepSess("tue"), "Q");
    expect([shows(Q, { speed: true, au: true }), v(Q.n, {})]).toEqual([true, "Speed — flying twenties"]);
  });

  it("the last morning's primer: three easy minutes on the bike, box jumps 2 × 3, rotational throws 2 × 3 a side, at nine, hours before the fight; rehearsed on the rehearsal's morning", () => {
    expect(names("master", "camp", wk(10), "sat")).toEqual(["Easy bike", "Box jumps", "Rotational throws", "The fight"]);
    expect(page("master", "camp", wk(10), "sat").slice(0, 3).map((c) => c.pres)).toEqual(["3 minutes, easy · this morning, hours before the fight", "2 × 3 · every jump as high as you can · Rest 60 s", "2 × 3 per side · every throw flat out · Rest 60 s"]);
    expect(page("master", "camp", wk(10), "sat").slice(0, 3).map((c) => c.lib.map((e) => e.n))).toEqual([["EASY BIKE (WARM-UP)"], ["BOX JUMPS"], ["ROTATIONAL SHOT-PUT THROW"]]);
    const PR = blk(CSFW.sat, "PR");
    expect([PR.at, PR.m, v(CSFW.sat.m, { au: true }), v(CSFW.sat.m, {}), v(CSFW.sat.m, undefined)]).toEqual([540, 10, 10, 0, 0]);
    expect(v(PR.items, {}).map((i) => i.id)).toEqual(["c12_prime_wu", "c12_prime_box", "c12_prime_throw"]);
    /* the rehearsal, six days before: the primer first, with no clock time of its own */
    expect(names("master", "camp", wk(9), "sun").slice(0, 5)).toEqual(["Easy bike", "Box jumps", "Rotational throws", "The movement block", "THE FIGHT-DAY REHEARSAL"]);
    expect(page("master", "camp", wk(9), "sun")[0].pres).toBe("3 minutes, easy · this morning, hours before the rehearsal");
    expect([blk(CS.sun, "PR").at, v(blk(CS.sun, "PR").items, {}).map((i) => i.id)]).toEqual([undefined, ["c_prime_wu", "c_prime_box", "c_prime_throw"]]);
    /* no other Sunday has it */
    [1, 5, 8].forEach((w) => expect(names("master", "camp", wk(w), "sun")).not.toContain("Easy bike"));
  });
});

describe("the audit in Prep, the camp and Fighter · the documents", () => {
  it("each program's document says what changed and why, and no page of them names the SkiErg as a station", () => {
    [prepMd, campMd, fighterMd].forEach((md) => {
      expect(md).toMatch(/^\*\*What the November audit changed, and why\.\*\* The audit of 19 November 2026 read every program against the brief/m);
      expect((md.match(/SkiErg/g) || []).length).toBe(1);
      expect(md).toMatch(/\*\*The SkiErg is out:\*\* you can't pace on it, so its numbers said nothing\./);
      expect(md).toMatch(/minute 1 on the assault bike with your arms only, feet on the pegs → minute 2 on the assault bike, arms and legs → minute 3/);
      expect(md).toMatch(/ONE-ARM LANDMINE PUSH PRESS · /);
      expect(md).not.toMatch(/— PUSH PRESS · /);
      expect(md).toMatch(/a rep 10% slower than the set's fastest ends the set/);
    });
    expect(builderMd).toMatch(/Each round splits into thirds — the assault bike with the arms only, feet on the pegs, the assault bike with arms and legs, then medicine-ball slams or the bag\. Until the week of Monday 23 November 2026 the first third was the SkiErg\./);
  });

  it("the camp: Tuesday's stance starts, the primer on the last morning and at the rehearsal; Prep: no push press profile, check or bar-speed line", () => {
    expect(campMd).toMatch(/\*\*SPEED — from week 6, after the shuttles:\*\* three 10-metre starts from your stance, the first step explosive off the rear foot, 90 seconds between\. Four minutes\./);
    expect(campMd).toMatch(/1\. \*\*Speed twice a week\*\* — three 10-metre stance starts on Tuesday after the shuttles, from week 6; the flying sprints stay on Saturday\./);
    expect(campMd).toMatch(/\| Saturday 13 Mar \| THE MORNING PRIMER, hours before, ten minutes: three easy minutes on the bike, box jumps 2 × 3, rotational throws 2 × 3 per side, every one fast, a minute between sets\. Then the FIGHT\./);
    expect(campMd).toMatch(/Get up at the time you'll get up on the 13th\. Do the morning primer, as you will that morning\./);
    expect(campMd).toMatch(/the evidence is limited \(Harrison, 2019\)/);
    expect(prepMd).toMatch(/^\| Phase \| Squat \| Trap bar \| Bench \|$/m);
    expect(prepMd).toMatch(/On Saturday, the squat the same way, then the bench at four loads\./);
    expect(prepMd).toMatch(/the trap bar and the bench on Wednesday, the squat on Saturday: a set of 3/);
    expect(prepMd).toMatch(/Tuesday's three flying twenties in weeks 11–13 stay/);
  });

  it("Fighter: no maximum singles — weeks 4 and 9 and test day are top triples, as the app runs them", () => {
    expect(fighterMd).not.toMatch(/MAX SINGLE|max singles?\b|100–102%|attempt at 100/i);
    expect(fighterMd).toMatch(/^\| 4 \| TOP TRIPLE, then 2 × 3 @ 85% \| — \| 4 × 3 @ 80% \| — \(squat top-triple day; the bench's is Sunday\) \|$/m);
    expect(fighterMd).toMatch(/^\| 9 \| TOP TRIPLE, then 2 × 2 @ 88% \| — \| 3 × 2 @ 88% \| — \(squat top-triple day; the bench's is Sunday\) \|$/m);
    expect(fighterMd).toMatch(/^\| Week \| Squat \(Sat\) & bench \(Mon\) \| Pause squat \(Wed\) \| Trap bar \(Wed\) \| Landmine push press \(Sat\), each side \|$/m);
    expect(fighterMd).toMatch(/^\| 1 \| 4 × 6 @ 75% \| 3 × 3 @ 65% \| find your 3RM \| 4 × 3 \|$/m);
    expect(fighterMd).toMatch(/TOP TRIPLE — weeks 4 and 9 only \(about 20 min\)\..*sets of three going up 2\.5–5% at a time until one is hard but leaves one or two in you\. Stop there\./);
    expect(fighterMd).toMatch(/^5\. \*\*Back squat\*\* — top triple, pins set: the heaviest clean set of three, one or two left in you\./m);
    expect(fighterMd).toMatch(/\*\*No maximum singles\.\*\* Weeks 4 and 9 and test day are top triples/);
    expect(FIGHTER_MAXES_RULE).toMatch(/^Squat and bench: working maxes — your heaviest clean set of 3, with one or two reps left in you, × 1\.08\. Never a best single\./);
    expect(FIGHTER_MAXES_RULE).not.toMatch(/your best single/);
  });
});
