import { describe, it, expect } from "vitest";
import prepMd from "../optimal-8-prep.md?raw";
import campMd from "../optimal-8-camp.md?raw";
import fighterMd from "../optimal8fighter.md?raw";
import { CORE_SINCE, CORE_CUE, withCore, coreMins } from "./core.js";
import { AUDIT_SINCE } from "./audit.js";
import { prepSess, prepRx } from "./prep.js";
import { campSess, campMaster } from "./camp.js";
import { sessionCatalog, fighterSess } from "./App.jsx";
import { libFor } from "./library.js";

/* ================================================================
   THE CORE IN PREP, THE CAMP AND FIGHTER — from Monday 23 November
   2026: at least three exercises for the abs and the core every
   training day, more rotation, and the kneeling jump into a box jump
   in the box jumps' place. Before that Monday every page reads as it
   did. (Strength, Power and Physique's own cards: spp.test.js, 16.)
   ================================================================ */

const v = (x, rx) => (typeof x === "function" ? x(rx) : x);
const shows = (b, rx) => !(b.hide && b.hide(rx));
const on = (S, rx) => S.b.filter((b) => shows(b, rx));
const items = (b, rx) => v(b.items, rx) || [];
const named = (S, rx, n) => on(S, rx).find((b) => v(b.n, rx) === n);

/* every exercise that trains the abs or the core, by the name it has on a page */
const CORE = ["Cable crunch", "Dead bug", "Cable woodchop", "Weighted decline sit-up", "Landmine rotation", "Reverse crunch", "Dumbbell side bend",
  "Hanging leg raise", "Star side plank", "Ab wheel rollout", "Pallof press", "Medicine-ball drops", "The L-sit line", "Tuck front lever", "Side plank reach-through", "Side plank", "Copenhagen plank"];
const isCore = (n) => CORE.some((c) => String(n).toLowerCase().indexOf(c.toLowerCase()) === 0);
/* the catalog's master season runs in 2027, after the switch; the cycle in early 2026, before it */
const CAT = sessionCatalog(["master", "cycle"]).filter((c) => c.edge !== false);
const day = (set, row, w, d) => CAT.filter((c) => c.set === set && c.row === row && c.week === w && c.day === d);
/* a card's exercises: a pair's two, THE BRACE's four, or the card's own */
const exOf = (c) => (c.n === "THE BRACE" ? ["Ab wheel rollout", "Pallof press", "Medicine-ball drops", "Side plank"] : c.n === "Hands" ? [] : String(c.n).split(" + "));
const coreCount = (cards) => cards.reduce((a, c) => a + exOf(c).filter(isCore).length, 0);
const TRAIN = ["mon", "tue", "wed", "thu", "sat", "sun"];

describe("the core · the switch", () => {
  it("is Monday 23 November 2026, the audit's Monday", () => {
    expect(CORE_SINCE).toBe("2026-11-23");
    expect(CORE_SINCE).toBe(AUDIT_SINCE);
  });
  it("every exercise has its cue in plain words, and a library entry", () => {
    Object.keys(CORE_CUE).forEach((k) => expect(CORE_CUE[k].length).toBeGreaterThan(80));
    ["Cable crunch", "Dead bug", "Cable woodchop", "Weighted decline sit-up", "Landmine rotation", "Reverse crunch", "Dumbbell side bend", "Hanging leg raise", "Medicine-ball drops", "Kneeling jump into box jump"]
      .forEach((n) => expect(libFor(n) && libFor(n).length ? n : null).toBe(n));
  });
});

describe("the core in Prep", () => {
  it("every training day has at least three, in every week the circuits run", () => {
    for (let w = 1; w <= 13; w++) TRAIN.forEach((d) => {
      const n = coreCount(day("master", "prep", w, d));
      if (n < 3) throw new Error("Prep week " + w + " " + d + ": " + n + " — " + day("master", "prep", w, d).map((c) => c.n).join(" | "));
    });
  });
  it("Monday, Wednesday, Thursday and Saturday get the new three, at the end of the morning", () => {
    const tail = (w, d, k) => day("master", "prep", w, d).map((c) => c.n).slice(-k);
    expect(tail(2, "mon", 2)).toEqual(["Cable Crunch + Dead Bug", "Cable Woodchop"]);
    expect(tail(2, "wed", 3)).toEqual(["Copenhagen lifts", "Star side plank", "Weighted Decline Sit-Up + Landmine Rotation"]);
    expect(tail(2, "thu", 2)).toEqual(["Reverse Crunch + Dumbbell Side Bend", "Cable Woodchop"]);
    expect(tail(2, "sat", 3)).toEqual(["Copenhagen lifts", "Star side plank", "Hanging Leg Raise + Landmine Rotation"]);
  });
  it("at the circuits' rounds: three, two, one, and none in test week", () => {
    [[1, 3], [5, 2], [9, 2], [10, 1], [12, 2], [14, 0]].forEach(([w, r]) => {
      const rx = Object.assign({}, prepRx(w), { au: true });
      const mon = withCore("prep", "mon", prepSess("mon")), pair = named(mon, rx, "Cable Crunch + Dead Bug"), chop = named(mon, rx, "Cable Woodchop");
      if (!r) { expect([pair, chop]).toEqual([undefined, undefined]); return; }
      expect(items(pair, rx).map((i) => i.s)).toEqual([r + " × 10–15", r + " × 6 each side, slow"]);
      expect(items(chop, rx).map((i) => i.s)).toEqual([Math.min(2, r) + " × 10 each side · high to low"]);
    });
  });
  it("the kneeling jump into box jump in Tuesday's box jumps' place: 3 × 2, 4 × 2 in weeks 11–13", () => {
    [1, 5, 12].forEach((w) => {
      const c = day("master", "prep", w, "tue");
      expect(c.find((x) => x.n === "Kneeling jump into box jump").pres).toMatch(new RegExp("^" + (w >= 11 ? 4 : 3) + " × 2"));
      expect(c.some((x) => x.n === "Box jump")).toBe(false);
    });
    const rx = Object.assign({}, prepRx(2), { au: true }), B = withCore("prep", "tue", prepSess("tue")).b.find((b) => b.L === "B");
    expect(v(B.why, rx)).toMatch(/snapping your hips through/);
    expect(items(B, rx).find((i) => /Kneeling/.test(i.n)).cue).toBe(CORE_CUE.kneel);
  });
  it("adds about 38 minutes a week at three rounds, 26 at two", () => {
    const add = (rx) => TRAIN.map((d) => { const S = prepSess(d); return v(withCore("prep", d, S).m, rx) - v(S.m, rx); });
    expect(add(Object.assign({}, prepRx(2), { au: true }))).toEqual([11, 0, 8, 11, 8, 0]);
    expect(add(Object.assign({}, prepRx(5), { au: true }))).toEqual([8, 0, 5, 8, 5, 0]);
    expect(add(Object.assign({}, prepRx(2), { au: false }))).toEqual([0, 0, 0, 0, 0, 0]);
  });
});

describe("the core in the camp", () => {
  it("every training day has at least three through week 8", () => {
    for (let w = 1; w <= 8; w++) TRAIN.forEach((d) => {
      const n = coreCount(day("master", "camp", w, d));
      if (n < 3) throw new Error("camp week " + w + " " + d + ": " + n + " — " + day("master", "camp", w, d).map((c) => c.n).join(" | "));
    });
  });
  it("two rounds through week 8, one in week 5, none in weeks 9 and 10", () => {
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((w) => {
      const rx = Object.assign(campMaster(w), { au: true });
      /* the camp's week-2 Thursday, read at each week's rounds: weeks 9 and 10 have pages of their own */
      const thu = withCore("camp", "thu", campSess("thu", campMaster(2))), pair = thu.b.find((b) => b.L === "CR"), chop = thu.b.find((b) => b.L === "CW");
      expect(v(pair.n, rx)).toBe("Reverse Crunch + Dumbbell Side Bend");
      if (w >= 9) { expect([shows(pair, rx), shows(chop, rx)]).toEqual([false, false]); return; }
      const r = w === 5 ? 1 : 2;
      expect(items(pair, rx).map((i) => i.s)).toEqual([r + " × 10–12", r + " × 12 each side"]);
      expect(items(chop, rx).map((i) => i.s)).toEqual([r + " × 10 each side · low to high"]);
    });
    expect(day("master", "camp", 9, "mon").some((c) => /Cable Crunch/.test(c.n))).toBe(false);
  });
  it("the kneeling jump into box jump on Tuesday: 3 × 2, 4 × 2 in weeks 6–8", () => {
    [1, 4, 6, 8].forEach((w) => expect(day("master", "camp", w, "tue").find((x) => x.n === "Kneeling jump into box jump").pres).toMatch(new RegExp("^" + (w >= 6 ? 4 : 3) + " × 2")));
  });
  it("adds about 26 minutes a week at two rounds", () => {
    const rx = Object.assign(campMaster(2), { au: true });
    expect(TRAIN.map((d) => { const S = campSess(d, rx); return S ? v(withCore("camp", d, S).m, rx) - v(S.m, rx) : null; })).toEqual([8, 0, 5, 8, 5, 0]);
  });
});

describe("the core in Fighter", () => {
  const F = (d) => withCore("fighter", d, fighterSess(d));
  const names = (d, rx) => on(F(d), rx).map((b) => v(b.n, rx));
  it("the new three on Monday, Wednesday, Thursday and Saturday, at the end; Tuesday's drops straight after the trunk block", () => {
    const rx = { au: true, acc: 3 };
    expect(names("mon", rx).slice(-2)).toEqual(["Cable Crunch + Dead Bug", "Cable Woodchop"]);
    expect(names("tue", rx).slice(-3)).toEqual(["Trunk", "Medicine-Ball Drops", "Seated Calf Raise + Achilles Hold"]);
    expect(names("wed", rx).slice(-1)).toEqual(["Weighted Decline Sit-Up + Landmine Rotation"]);
    expect(names("thu", rx).slice(-2)).toEqual(["Reverse Crunch + Dumbbell Side Bend", "Cable Woodchop"]);
    expect(names("sat", rx).slice(-1)).toEqual(["Hanging Leg Raise + Landmine Rotation"]);
    const drops = named(F("tue"), rx, "Medicine-Ball Drops");
    expect(items(drops, rx).map((i) => [i.n, i.s])).toEqual([["Medicine-ball drops", "2 × 8 · a 3 kg ball, up to 6"]]);
  });
  it("three rounds, two in the lighter weeks, none in test week or Hell Week, and none in the last ten days", () => {
    const sets = (rx) => { const p = named(F("sat"), rx, "Hanging Leg Raise + Landmine Rotation"); return p ? items(p, rx).map((i) => i.sets) : null; };
    expect(sets({ au: true, acc: 3 })).toEqual([3, 3]);
    expect(sets({ au: true, acc: 2 })).toEqual([2, 2]);
    expect(sets({ au: true, acc: 3, test: 1 })).toBe(null);
    expect(sets({ au: true, acc: 3, hell: 1 })).toBe(null);
    F("mon").b.filter((b) => /^C[RWD]$/.test(b.L)).forEach((b) => expect(b.noTaper).toBe(1));
  });
  it("Monday's power dose: the minute of legs, then the kneeling jump into box jump, 3 × 2", () => {
    const rx = { au: true, acc: 3 }, C = F("mon").b.find((b) => b.L === "C");
    expect(v(C.rxLine, rx)).toBe("one minute of legs, then kneeling jumps into box jumps 3 × 2");
    expect(items(C, rx).map((i) => i.n)).toEqual([items(C, rx)[0].n, "Kneeling jump into box jump"]);
    expect(items(C, rx)[1].id).toBe("boxjump_kneel");
  });
  it("adds about 40 minutes a week at three rounds", () => {
    const rx = { au: true, acc: 3, sim: {} };
    expect(["mon", "tue", "wed", "thu", "sat"].map((d) => v(F(d).m, rx) - v(fighterSess(d).m, rx))).toEqual([11, 2, 8, 11, 8]);
  });
});

describe("the core · before 23 November, nothing changes", () => {
  it("a week before the switch reads exactly as it did", () => {
    const rx = Object.assign({}, prepRx(2), { au: false });
    ["mon", "tue", "wed", "thu", "sat"].forEach((d) => {
      const S = prepSess(d), C = withCore("prep", d, S);
      expect(on(C, rx).map((b) => v(b.n, rx))).toEqual(on(S, rx).map((b) => v(b.n, rx)));
      expect(v(C.m, rx)).toBe(v(S.m, rx));
    });
    const B = withCore("prep", "tue", prepSess("tue")).b.find((b) => b.L === "B");
    expect(items(B, rx).some((i) => /Kneeling/.test(i.n))).toBe(false);
    expect(coreMins(withCore("fighter", "mon", fighterSess("mon")).b.filter((b) => /^C[RW]$/.test(b.L)), { au: false, acc: 3 })).toBe(0);
  });
  it("the early-2026 cycle has no core cards and keeps its box jumps", () => {
    const cyc = CAT.filter((c) => c.set === "cycle");
    expect(cyc.length).toBeGreaterThan(100);
    expect(cyc.filter((c) => /Cable Crunch \+ Dead Bug|Cable Woodchop|Kneeling jump/.test(c.n))).toEqual([]);
  });
  it("the same page object every time, so nothing is rebuilt on a render", () => {
    expect(withCore("prep", "mon", prepSess("mon"))).toBe(withCore("prep", "mon", prepSess("mon")));
  });
});

describe("the core · the documents", () => {
  it("Prep, the camp and Fighter each write it, and name every exercise", () => {
    [prepMd, campMd, fighterMd].forEach((md) => {
      expect(md).toMatch(/^## THE CORE — FROM MONDAY 23 NOVEMBER$/m);
      const sec = md.slice(md.indexOf("## THE CORE — FROM MONDAY 23 NOVEMBER"), md.indexOf("\n---\n", md.indexOf("## THE CORE — FROM MONDAY 23 NOVEMBER")));
      ["Cable crunch", "Dead bug", "Cable woodchop, high to low", "Weighted decline sit-up", "Landmine rotation", "Reverse crunch", "Dumbbell side bend", "Cable woodchop, low to high", "Hanging leg raise", "Kneeling jump into box jump"]
        .forEach((n) => expect(sec).toContain("**" + n + "**"));
      expect(sec).toContain(CORE_CUE.kneel);
    });
    expect(prepMd).toMatch(/About 38 minutes a week at three rounds/);
    expect(campMd).toMatch(/About 26 minutes a week at two rounds/);
    expect(fighterMd).toMatch(/About 40 minutes a week at three rounds/);
    expect(fighterMd).toContain("**Medicine-ball drops** — Tuesday, 2 × 8");
  });
});
