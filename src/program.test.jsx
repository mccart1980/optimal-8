import { describe, it, expect } from "vitest";
import { sessionCatalog } from "./App.jsx";
import { jumpYellow } from "./edge.js";
import { ergBoxes, sessionBoxes, engHR } from "./camp.js";
import { parseKey, series, pairEntries, barSpeeds, DASH_IDS } from "./metrics.js";
import { fadePct } from "./safety.js";

/* The programs' content, read off the cards the gym runs. The rebuild
   changed how a session is shown, never what is in it. */
const CAT = sessionCatalog();
const day = (program, week, d, o) => CAT.filter((c) => c.main && c.program === program && c.week === week && c.day === d
  && (o && o.edge === false ? c.edge === false : c.edge !== false) && !!c.lastTen === !!(o && o.lastTen)).map((c) => c);
const names = (...a) => day(...a).map((c) => c.n);
const before = (arr, a, b) => arr.indexOf(a) >= 0 && arr.indexOf(b) >= 0 && arr.indexOf(a) < arr.indexOf(b);

describe("the programs, as the gym runs them", () => {
  it("the jump check is three broad jumps against a tape, PREP and CAMP; more than 5% under the four-week average is a yellow", () => {
    expect(day("prep", 2, "tue").find((c) => c.n === "The Jump Check").pres).toBe("3 broad jumps — the best distance");
    const camp = CAT.find((c) => c.set === "master" && c.program === "camp" && c.day === "tue" && c.n === "The Jump Check");
    expect(camp.pres).toBe("3 broad jumps — the best distance");
    expect(camp.lib.map((e) => e.n)).toEqual(["JUMP CHECK"]);
    expect(camp.lib[0].text).toMatch(/^Three broad jumps against a tape\./);
    expect(jumpYellow(218, [230, 229, 231, 230])).toBe(true);
    expect(jumpYellow(219, [230, 229, 231, 230])).toBe(false);
    expect(jumpYellow(218, [])).toBe(false);
  });

  it("an interval session logs one number, at the end, and the peak heart rate; easy logs its output", () => {
    ["vo2", "tempo", "lac", "lac2", "rz", "rz1", "thr", "erg", "fp"].forEach((k) => expect(ergBoxes(k, false, {})).toEqual(["SESSION"]));
    expect(ergBoxes("easy", false, {})).toEqual(["OUTPUT"]);
    ["mod", "vo2", "tempo", "lac", "lac2", "rz", "rz1", "thr"].forEach((k) => expect(sessionBoxes(k)).toEqual(["SESSION"]));
    expect(sessionBoxes("easy")).toEqual(["OUTPUT"]);
    expect(engHR("tempo")).toEqual([{ k: "hr", l: "PEAK HEART RATE (BPM)" }]);
  });

  it("PREP week 2 Saturday: stance starts, then close and plant, before the flying sprints; no throws", () => {
    const n = names("prep", 2, "sat");
    expect(before(n, "Stance Starts", "Close and Plant")).toBe(true);
    expect(before(n, "Close and Plant", "Flying Sprints")).toBe(true);
    expect(n.some((x) => /throw/i.test(x))).toBe(false);
  });

  it("PREP opens the Sunday with the warm-up and then the four punch throws", () => {
    const n = names("prep", 2, "sun");
    expect(n[0]).toBe("Warm-up");
    expect(n[1]).toBe("The Four Punch Throws");
  });

  it("PREP's Wednesday has the bench press and the bench throws from week 1, no ring dips, and the farmer's carry last", () => {
    [1, 3, 7].forEach((w) => {
      const n = names("prep", w, "wed");
      expect(before(n, "Bench Press", "Bench Throw (Smith)")).toBe(true);
      expect(n).not.toContain("Ring Dips");
      expect(n[n.length - 1]).toBe("Farmer's Carry");
    });
    expect(day("prep", 1, "wed").find((c) => c.n === "Bench Press").pres).toMatch(/^SLOW LOWERING · 3 × 5 · 70%/);
    expect(names("prep", 3, "thu")).toContain("The Shoulders Circuit");
  });

  it("PREP's fast week runs the trap bar in clusters with the edge on, straight sets with it off", () => {
    /* the sixteen-week form: document week 8 is week 9 */
    expect(day("prep", 9, "wed").find((c) => c.n === "Trap Bar Deadlift").pres).toMatch(/^5 × \(2\+2\) · 87–90%/);
    expect(day("prep", 9, "wed", { edge: false }).find((c) => c.n === "Trap Bar Deadlift").pres).toMatch(/^FAST · 4 × 3 · 87%/);
  });

  it("PREP's trap bar and squat name the week's phase in front of the sets, as the bench does", () => {
    expect(day("prep", 1, "wed").find((c) => c.n === "Trap Bar Deadlift").pres).toMatch(/^SLOW LOWERING · 3 × 5 · 70%/);
    expect(day("prep", 4, "sat").find((c) => c.n === "Back Squat").pres).toMatch(/^NORMAL TEMPO · 5 × 5 · 75%/);
    /* the sixteen-week form: document week 6 is week 7 */
    expect(day("prep", 7, "sat").find((c) => c.n === "Back Squat").pres).toMatch(/^3-SECOND PAUSE · 4 × 4 · 80%/);
    expect(day("prep", 11, "wed").find((c) => c.n === "Trap Bar Deadlift").pres).toMatch(/^FAST · 2 × 3 · 65%/);
  });

  it("PREP's legs: the pause squat after the trap bar on Wednesday, fast in the fast block; the Romanian deadlift after the push press on Saturday", () => {
    /* the sixteen-week form: P4b is week 5, P5 week 6, P9 week 10, P11 week 12, P13 week 15, P14 week 16 */
    const wed = names("prep", 1, "wed");
    expect(before(wed, "Trap Bar Deadlift", "Pause Squat")).toBe(true);
    expect(before(wed, "Pause Squat", "Bench Press")).toBe(true);
    const pq = (w) => day("prep", w, "wed").find((c) => /^(Pause|Speed) Squat$/.test(c.n));
    expect(pq(1).pres).toMatch(/^2-SECOND PAUSE · 3 × 3 · 65% · Rest 2:00$/);
    expect(pq(1).lib.map((e) => e.n)).toEqual(["BACK SQUAT"]);
    expect(pq(1).lib[0].text).toMatch(/Paused: stop dead at the bottom for two seconds/);
    expect(pq(2).pres).toMatch(/· 68%/);
    expect(pq(5).pres).toMatch(/· 74\.5%/);
    expect(pq(6).pres).toMatch(/^2-SECOND PAUSE · 2 × 3 · 60%/);
    expect(pq(8).pres).toMatch(/· 75%/);
    expect(pq(10)).toBeUndefined();
    expect(pq(12).n).toBe("Speed Squat");
    expect(pq(12).pres).toMatch(/^FAST · 3 × 3 · 70%/);
    expect(pq(15).pres).toMatch(/^FAST · 2 × 3 · 70%/);
    expect(pq(16)).toBeUndefined();
    const sat = names("prep", 2, "sat");
    expect(before(sat, "Push Press", "Romanian Deadlift")).toBe(true);
    expect(before(sat, "Romanian Deadlift", "Bear-Hug Carry")).toBe(true);
    const rdl = (w) => day("prep", w, "sat").find((c) => c.n === "Romanian Deadlift");
    expect(rdl(2).pres).toBe("3 × 6 · Rest 75 s");
    expect(rdl(2).lib.map((e) => e.n)).toEqual(["ROMANIAN DEADLIFT"]);
    expect(rdl(6).pres).toMatch(/^2 × 6/);
    expect(rdl(10).pres).toMatch(/^2 × 6/);
    expect(rdl(12).pres).toMatch(/^2 × 6/);
    expect(rdl(16)).toBeUndefined();
  });

  it("the comeback's first two weeks run the pause squat and the Romanian deadlift a set short", () => {
    const cb = CAT.filter((c) => c.set === "comeback" && c.program === "prep");
    const at = (w, d, n) => cb.find((c) => c.week === w && c.day === d && c.n === n && c.edge !== false);
    expect(at(1, "wed", "Pause Squat").pres).toMatch(/^2-SECOND PAUSE · 2 × 3 · 65%/);
    expect(at(1, "sat", "Romanian Deadlift").pres).toMatch(/^2 × 6/);
    expect(at(3, "wed", "Pause Squat").pres).toMatch(/^2-SECOND PAUSE · 3 × 3/);
    expect(at(3, "sat", "Romanian Deadlift").pres).toMatch(/^3 × 6/);
  });

  it("runs Monday's dips and ring rows and the arms circuit before the base, in PREP and in CAMP", () => {
    ["prep", "camp"].forEach((p) => {
      const n = names(p, 2, "mon");
      expect(before(n, "Warm-up", "Dips + Ring Rows")).toBe(true);
      expect(before(n, "Dips + Ring Rows", "The Arms Circuit")).toBe(true);
      expect(before(n, "The Arms Circuit", p === "prep" ? "Base — easy, nose only" : "Easy, nose only")).toBe(true);
      expect(before(n, "Hands", "Band Deceleration Catch")).toBe(true);
      expect(n).not.toContain("Ring Rows");
    });
    expect(names("prep", 2, "mon")).not.toContain("Neck");
    expect(names("camp", 2, "mon")).toContain("Neck");
    expect(day("prep", 2, "mon").find((c) => c.n === "Dips + Ring Rows").kind).toBe("round");
  });

  it("runs the drive and punch holds and the rounds as round cards", () => {
    expect(day("prep", 2, "wed").find((c) => c.n === "Drive Holds + Punch-Position Holds").kind).toBe("round");
    expect(day("prep", 2, "sun").some((c) => c.kind === "round" && /Simulation/.test(c.n))).toBe(true);
  });

  it("CAMP week 6 Saturday runs depth jumps 4 × 4", () => {
    const c = day("camp", 6, "sat").find((x) => x.n === "Depth Jumps");
    expect(c.pres).toMatch(/^4 × 4/);
  });

  it("the Fighter's Sunday has the Nordics ahead of the fight simulation, and Friday is empty", () => {
    const n = names("fighter", 8, "sun");
    const nord = n.findIndex((x) => /Nordic/.test(x)), sim = n.findIndex((x) => /Simulation/.test(x));
    expect(nord).toBeGreaterThanOrEqual(0);
    expect(nord).toBeLessThan(sim);
    expect(names("fighter", 2, "fri")).toEqual([]);
  });

  it("the Fighter's week 8 pause squat is at 75%", () => {
    expect(day("fighter", 8, "wed").find((c) => /Pause Squat|Speed Squat/.test(c.n)).pres).toMatch(/75%/);
  });

  it("the Fighter's Wednesday is as it was: the pause squat and the Romanian deadlift, its own numbers", () => {
    const n = names("fighter", 2, "wed");
    expect(before(n, "Trap Bar Deadlift", "Pause Squat")).toBe(true);
    expect(before(n, "Pause Squat", "Romanian Deadlift")).toBe(true);
    expect(day("fighter", 2, "wed").find((c) => c.n === "Pause Squat").pres).toMatch(/^3 × 3 · 68%/);
    expect(day("fighter", 2, "wed").find((c) => c.n === "Romanian Deadlift").pres).toMatch(/^3 × 6/);
    expect(names("fighter", 2, "sat")).not.toContain("Romanian Deadlift");
  });

  it("PROGRESS reads each program's own weeks: Prep's keys parse, and the classic and the camp read what they always read", () => {
    expect(parseKey("mPw12-thu-p_e2_erg")).toEqual({ macro: "P", week: 12, day: "thu", id: "p_e2_erg" });
    expect(parseKey("mCw3-sun-c_fs_rd1").macro).toBe("C");
    expect(parseKey("m2w5-sun-fs_rd1").macro).toBe("2");
    const log = { "mPw1-sun-bike20": { w: "6100" }, "mPw16-thu-bike20": { w: "6450" }, "m1w1-sun-bike20": { w: "5900" }, "mCw1-sun-c_bike20": { w: "6300" },
      "mPw2-sun-c_fs_rd1": { w: "250", cal: "20" }, "mPw2-sun-c_fs_rd6": { w: "200", cal: "16" } };
    expect(series(log, DASH_IDS.prep.t20, "prep", DASH_IDS.prep.t20Day).map((r) => [r.label, r.v])).toEqual([["w1", 6100], ["w16", 6450]]);
    expect(series(log, "bike20", false, "sun").map((r) => r.v)).toEqual([5900]);
    expect(series(log, "c_bike20", true, "sun").map((r) => r.v)).toEqual([6300]);
    expect(pairEntries(log, DASH_IDS.prep.rd1, DASH_IDS.prep.rd6, "prep", "sun", fadePct).map((r) => [r.label, r.v])).toEqual([["w2", 80]]);
    /* Prep's bar speed is the first work set's, at that set's load; the classic's the top set's */
    const bs = { "mPw2-wed-tbdl": { v1: "0.62", sets: [{ ok: true, w: "130" }, { ok: true, w: "135" }] }, "m1w2-wed-tbdl": { bs: "0.7", sets: [{ ok: true, w: "120" }, { ok: true, w: "125" }] } };
    expect(barSpeeds(bs, "prep").tbdl).toEqual([{ macro: "P", week: 2, label: "w2", load: 130, speed: 0.62 }]);
    expect(barSpeeds(bs, false).tbdl).toEqual([{ macro: "1", week: 2, label: "m1w2", load: 125, speed: 0.7 }]);
  });

  it("the two easy weeks have no sprints and no rounds", () => {
    const n = CAT.filter((c) => c.program === "transition").map((c) => c.n).join(" | ");
    expect(n).not.toMatch(/Sprint|Simulation|Rounds/);
  });
});
