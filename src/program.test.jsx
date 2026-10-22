import { describe, it, expect } from "vitest";
import { sessionCatalog } from "./App.jsx";

/* The programs' content, read off the cards the gym runs. The rebuild
   changed how a session is shown, never what is in it. */
const CAT = sessionCatalog();
const day = (program, week, d, o) => CAT.filter((c) => c.main && c.program === program && c.week === week && c.day === d
  && (o && o.edge === false ? c.edge === false : c.edge !== false) && !!c.lastTen === !!(o && o.lastTen)).map((c) => c);
const names = (...a) => day(...a).map((c) => c.n);
const before = (arr, a, b) => arr.indexOf(a) >= 0 && arr.indexOf(b) >= 0 && arr.indexOf(a) < arr.indexOf(b);

describe("the programs, as the gym runs them", () => {
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
    expect(day("prep", 9, "wed", { edge: false }).find((c) => c.n === "Trap Bar Deadlift").pres).toMatch(/^4 × 3 · 87%/);
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

  it("the two easy weeks have no sprints and no rounds", () => {
    const n = CAT.filter((c) => c.program === "transition").map((c) => c.n).join(" | ");
    expect(n).not.toMatch(/Sprint|Simulation|Rounds/);
  });
});
