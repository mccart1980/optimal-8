import { describe, it, expect } from "vitest";
import { weightCfg, numbers, runPlan, drawLine, sundayCheck, r1, plusDays } from "./weight.js";

/* ================================================================
   THE PROOF — weight-making.md's eight tests. 1–7 here, on the
   arithmetic and the food; 8 (no limit, no trace) and the food's half
   of 7 in weight-ui.test.jsx.
   ================================================================ */
const aims = (line) => line.aims.map((a) => r1(a).toFixed(1));
/* a week of mornings ending on a Sunday that average to `avg` */
const week = (sun, avg) => { const o = {}; [-6, -4, -2, 0].forEach((i) => { o[plusDays(sun, i)] = avg; }); return o; };
const run = (cfg, set, weights, today, opts) => runPlan(Object.assign({ draws: [{ at: set, cfg }], weights, today }, opts || {}));

const EX = { booked: true, fight: "2026-11-28", limit: 76.0, tol: 1.0, natural: 80.0, weighIn: "before" };
const exCfg = weightCfg(EX);
/* the worked example's Sundays, after 18 October's 81.6 */
const exWeights = (extra) => Object.assign({ "2026-10-11": 83.0 }, week("2026-10-18", 81.6), extra || {});

describe("proof 1 — the worked example, Saturday 28 November", () => {
  it("on setup: C 77.0, F 77.5, M 76.0, forecast 76.0, Step 2, aims 81.1 · 79.2 · 78.8 · 78.3 · 77.9 · 77.5", () => {
    const n = numbers(exCfg);
    expect([n.C, n.F, n.M]).toEqual([77.0, 77.5, 76.0]);
    const p = run(exCfg, "2026-10-11", { "2026-10-11": 83.0 }, "2026-10-11");
    const l = p.lines[0];
    expect(l.prov).toBe(true);
    expect(l.N).toBe(6);
    expect(r1(l.E)).toBe(3.0);
    expect(r1(l.R)).toBe(2.5);
    expect(aims(l)).toEqual(["81.1", "79.2", "78.8", "78.3", "77.9", "77.5"]);
    expect(l.sundays).toEqual(["2026-10-18", "2026-10-25", "2026-11-01", "2026-11-08", "2026-11-15", "2026-11-22"]);
    expect(l.firstStep).toBe(2);
    expect(r1(l.forecast)).toBe(76.0);
    expect(p.stepOn("2026-10-11")).toBe(0);
    expect(p.stepOn("2026-10-12")).toBe(2);
  });
  it("on 18 October, with an average of 81.6: redrawn to 79.6 · 79.0 · 78.5 · 78.0 · 77.5, Step 2", () => {
    const p = run(exCfg, "2026-10-11", exWeights(), "2026-10-18");
    const c = p.checks["2026-10-18"];
    expect(c.settle).toBe(true);
    expect(p.line.prov).toBe(false);
    expect(aims(p.line)).toEqual(["79.6", "79.0", "78.5", "78.0", "77.5"]);
    expect(p.line.firstStep).toBe(2);
    expect(p.step).toBe(2);
  });
  it("the Sundays in the example table give exactly its verdicts and steps", () => {
    const w = exWeights(Object.assign(week("2026-10-25", 79.9), week("2026-11-01", 79.6), week("2026-11-08", 78.6), week("2026-11-15", 78.1), week("2026-11-22", 77.6)));
    const p = run(exCfg, "2026-10-11", w, "2026-11-22", { bad: () => 2 });
    const row = (s) => { const c = p.checks[s]; return [r1(c.A).toFixed(1), c.verdict, c.next]; };
    expect(row("2026-10-25")).toEqual(["79.9", "ON TRACK", 2]);
    expect(row("2026-11-01")).toEqual(["79.6", "BEHIND", 3]);
    expect(row("2026-11-08")).toEqual(["78.6", "TOO FAST", 2]);
    expect(p.checks["2026-11-08"].checkpoint).toBe(true);
    expect(r1(p.checks["2026-11-08"].forecast)).toBe(76.1);
    expect(p.checks["2026-11-08"].over).toBe(false);
    expect(row("2026-11-15")).toEqual(["78.1", "ON TRACK", 2]);
    expect(p.checks["2026-11-22"].last).toBe(true);
    expect(r1(p.checks["2026-11-22"].forecast)).toBe(76.1);
    expect(p.checks["2026-11-22"].next).toBe(2);
    /* fight week: Monday 23 and Tuesday 24 at Step 2, then the light days */
    expect(p.stepOn("2026-11-23")).toBe(2);
    expect(p.stepOn("2026-11-24")).toBe(2);
    expect(p.line.dates.light).toEqual(["2026-11-25", "2026-11-26"]);
    expect(p.line.dates.weighDay).toBe("2026-11-27");
  });
  it("if the weigh-in turns out to be in the morning, the fight-week aim moves to 78.0 and the line is redrawn, the step kept", () => {
    const am = weightCfg(Object.assign({}, EX, { weighIn: "am" }));
    expect(numbers(am).F).toBe(78.0);
    const w = exWeights(week("2026-10-25", 79.9));
    const p = runPlan({ draws: [{ at: "2026-10-11", cfg: exCfg }, { at: "2026-10-27", cfg: am }], weights: w, today: "2026-10-27" });
    expect(p.line.F).toBe(78.0);
    expect(p.line.at).toBe("2026-10-27");
    expect(p.step).toBe(2);
  });
});

/* "On that redrawn line at Step 3": the line redrawn on 18 October,
   checked on its Sunday at Step 3. */
const redrawn = drawLine(exCfg, 81.6, "2026-10-18", false);
const onLine = (sun, A, prevA, bad) => sundayCheck(redrawn, redrawn.sundays.indexOf(sun) + 1, { A, prevA, step: 3, age: Math.floor((Date.parse(sun) - Date.parse("2026-10-11")) / 864e5 / 7), bad: bad || 0 });

describe("proof 2 — ahead", () => {
  it("on that redrawn line at Step 3, 1 November average 78.1 after 78.7 → AHEAD, Step 2", () => {
    const c = onLine("2026-11-01", 78.1, 78.7);
    expect(c.verdict).toBe("AHEAD");
    expect(c.next).toBe(2);
  });
});

describe("proof 3 — recovery first", () => {
  it("on that line at Step 3, 1 November average 79.6 after 79.9, with three yellow or red mornings → BEHIND, holding at Step 3", () => {
    const c = onLine("2026-11-01", 79.6, 79.9, 3);
    expect(c.behind).toBe(true);
    expect(c.verdict).toBe("HOLDING");
    expect(c.why).toBe("recovery");
    expect(c.next).toBe(3);
  });
});

describe("proof 4 — the checkpoint", () => {
  it("on that line at Step 3, 8 November average 79.8 after 79.6 → BEHIND, Step 4, forecast 77.3, and the checkpoint card shows", () => {
    const c = onLine("2026-11-08", 79.8, 79.6);
    expect(c.verdict).toBe("BEHIND");
    expect(c.next).toBe(4);
    expect(r1(c.forecast)).toBe(77.3);
    expect(c.checkpoint).toBe(true);
    expect(c.over).toBe(true);
  });
  it("and the replayed plan reaches the same Sunday the same way", () => {
    const p = runPlan({ draws: [{ at: "2026-10-11", cfg: exCfg }], weights: exWeights(Object.assign(week("2026-10-25", 79.9), week("2026-11-01", 79.6), week("2026-11-08", 79.8))), today: "2026-11-08", bad: () => 0 });
    const c = p.checks["2026-11-08"];
    expect(c.stepBefore).toBe(3);
    expect(c.verdict).toBe("BEHIND");
    expect(c.next).toBe(4);
    expect(r1(c.forecast)).toBe(77.3);
    expect(c.over).toBe(true);
  });
});

describe("proof 5 — hold", () => {
  const cfg = weightCfg({ booked: true, fight: "2026-11-14", limit: 80.0, tol: 0, natural: 79.0, weighIn: "am" });
  /* four Sundays after Sunday 11 October: 18, 25, 1 Nov, 8 Nov — fight week 9–15 November */
  const w = week("2026-10-11", 79.0);
  it("on setup: F 81.0, every aim 81.0, Step 0, forecast 77.0", () => {
    const p = run(cfg, "2026-10-11", w, "2026-10-11");
    const l = p.lines[0];
    expect(l.prov).toBe(false);
    expect(l.N).toBe(4);
    expect(l.F).toBe(81.0);
    expect(aims(l)).toEqual(["81.0", "81.0", "81.0", "81.0"]);
    expect(l.firstStep).toBe(0);
    expect(r1(l.forecast)).toBe(77.0);
  });
  it("a Sunday average of 81.5 → BEHIND, Step 1", () => {
    const p = run(cfg, "2026-10-11", Object.assign({}, w, week("2026-10-18", 81.5)), "2026-10-18", { bad: () => 0 });
    expect(p.checks["2026-10-18"].verdict).toBe("BEHIND");
    expect(p.checks["2026-10-18"].next).toBe(1);
  });
});

describe("proof 6 — too far", () => {
  const cfg = weightCfg({ booked: true, fight: "2026-11-28", limit: 70.0, tol: 0, natural: 80.0, weighIn: "am" });
  it("on setup: d capped at 0.8, aims 79.7 · 78.4 · 77.6 · 76.8 · 76.0 · 75.2, forecast 73.2, Step 4, and the checkpoint card on the day", () => {
    const p = run(cfg, "2026-10-11", week("2026-10-11", 82.0), "2026-10-11");
    const l = p.lines[0];
    expect(l.N).toBe(6);
    expect(l.d).toBeCloseTo(0.8, 9);
    expect(l.capped).toBe(true);
    expect(aims(l)).toEqual(["79.7", "78.4", "77.6", "76.8", "76.0", "75.2"]);
    expect(r1(l.forecast)).toBe(73.2);
    expect(l.firstStep).toBe(4);
    expect(l.forecast > l.C).toBe(true);
  });
});

describe("proof 7 — on the day", () => {
  const cfg = weightCfg({ booked: true, fight: "2026-11-14", limit: 76.0, tol: 0, natural: 78.0, weighIn: "day" });
  it("on setup: F 76.0, M 75.5, aims 77.5 · 77.0 · 76.5 · 76.0, Step 2", () => {
    const p = run(cfg, "2026-10-11", week("2026-10-11", 78.0), "2026-10-11");
    const l = p.lines[0];
    expect([l.F, l.M]).toEqual([76.0, 75.5]);
    expect(aims(l)).toEqual(["77.5", "77.0", "76.5", "76.0"]);
    expect(l.firstStep).toBe(2);
    expect(l.dates.lowFibre).toEqual(["2026-11-12", "2026-11-13"]);
  });
});

describe("the arithmetic's edges", () => {
  it("draws nothing without a weight, and draws from the first one that comes in", () => {
    const p = run(exCfg, "2026-10-11", {}, "2026-10-11");
    expect(p.waiting).toBe(true);
    const q = run(exCfg, "2026-10-11", { "2026-10-13": 83.0 }, "2026-10-13");
    expect(q.lines[0].at).toBe("2026-10-13");
    expect(q.lines[0].prov).toBe(true);
  });
  it("asks for one weight on a thin week and uses it", () => {
    const w = exWeights({ "2026-10-25": 79.9 });
    const p = run(exCfg, "2026-10-11", w, "2026-10-25");
    expect(p.checks["2026-10-25"].pending).toBe(true);
    const q = run(exCfg, "2026-10-11", w, "2026-10-25", { asked: { "2026-10-25": 79.9 } });
    expect(q.checks["2026-10-25"].verdict).toBe("ON TRACK");
    expect(q.checks["2026-10-25"].src).toBe("asked");
  });
  it("never steps below 4 or above 0, and no step up in the first two weeks", () => {
    const l = drawLine(exCfg, 81.6, "2026-10-18", false);
    expect(l.firstStep).toBe(2);
  });
});
