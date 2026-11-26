import { describe, it, expect } from "vitest";
import { readEntry, targets, dayType, sundayChecks, nextMeal, mealsOf, suggest, lateProtein, myFood, bodyKg, minsOf, clock, batchPer100, PROTEIN, DAY_KCAL } from "./food.js";
import { STEP_KCAL } from "./weight.js";
import { tMin } from "./fuel.js";

/* THE DAY'S BUDGET (brief 34): the food typed in, read into numbers;
   the day's targets; the next meal; the Sunday check with no fight. */
const one = (t, o) => readEntry(t, o).items[0];
const near = (a, b, tol) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol == null ? 1 : tol);

describe("reading what's typed", () => {
  it("weighed foods: cooked by default where a food is weighed both ways, and the state typed wins", () => {
    const r = readEntry("200g cooked mince, 250g pasta");
    expect(r.ok).toBe(true);
    expect(r.items.map((x) => [x.name, x.amount])).toEqual([["Beef mince 5%, cooked", "200 g"], ["Pasta, cooked", "250 g"]]);
    expect(r.total).toEqual({ kcal: 744, p: 72.3, c: 81.8, f: 14.2 });
    expect(one("250g pasta").name).toBe("Pasta, cooked");
    expect(one("100g dry pasta")).toMatchObject({ name: "Pasta, dry", kcal: 355, p: 12.5, c: 72 });
    expect(one("150g raw 5% mince")).toMatchObject({ name: "Beef mince 5%, raw", kcal: 186, p: 31.5 });
    expect(one("200 g chicken breast raw")).toMatchObject({ name: "Chicken breast, raw", kcal: 212, p: 48 });
    expect(one("1kg rice").amount).toBe("1000 g");
  });

  it("things counted in ones: eggs, bagels, bananas, tins, pouches and the UFIT bottle", () => {
    expect(one("2 eggs")).toMatchObject({ amount: "2 eggs", kcal: 152, p: 14.6 });
    expect(one("a bagel")).toMatchObject({ amount: "1 bagel", kcal: 220 });
    expect(one("banana")).toMatchObject({ amount: "1 banana", kcal: 105 });
    expect(one("1 tin tuna")).toMatchObject({ amount: "1 tin", p: 27.5 });
    expect(one("1 pouch")).toMatchObject({ name: "Ben's Original rice pouch", kcal: 360, c: 72 });
    expect(one("ufit")).toMatchObject({ name: "UFIT 50g bottle", kcal: 288, p: 50 });
    expect(one("half a bottle")).toMatchObject({ amount: "half a bottle", kcal: 144, p: 25 });
    expect(one("1/2 bottle").amount).toBe("half a bottle");
    expect(one("3 rice cakes")).toMatchObject({ amount: "3 rice cakes", kcal: 84 });
    expect(one("2x bagel").amount).toBe("2 bagels");
    expect(one("half a tin of beans")).toMatchObject({ name: "Baked beans", amount: "half a tin", kcal: 164 });
  });

  it("spoons, millilitres and the longest name first", () => {
    const r = readEntry("250ml milk + 2 porridge sachets + 1 tbsp honey");
    expect(r.items.map((x) => [x.name, x.amount])).toEqual([["Semi-skimmed milk", "250 ml"], ["Oat So Simple sachet", "2 sachets"], ["Honey", "1 tbsp (20 g)"]]);
    expect(one("4 rice cakes").name).toBe("Rice cake");
    expect(one("200g jacket potato").name).toBe("Jacket potato");
    expect(one("150g sweet potato").name).toBe("Sweet potato, cooked");
    expect(one("200ml orange juice").name).toBe("Orange juice");
  });

  it("what it can't read, it says: an unknown food, and a food that needs its grams", () => {
    const r = readEntry("2 eggs, 150g zogwort");
    expect(r.ok).toBe(false);
    expect(r.items[1]).toMatchObject({ unknown: true, text: "150g zogwort" });
    expect(one("chicken")).toMatchObject({ needG: true });
    expect(readEntry("").items).toEqual([]);
  });

  it("the batch comes from the two pans weighed in COOK: by the portion, or by the gram", () => {
    const cook = { mince: { std: 260, big: 345 }, potato: { std: 250, big: 290 } };
    const std = one("batch", { cook });
    near(std.kcal, 246 + 258); near(std.p, 33.5 + 4.8, 0.2);
    expect(std.est).toBe(false);
    /* by the gram: each pan's own numbers */
    const m = one("260g batch mince", { cook });
    near(m.kcal, 246); near(m.p, 33.5, 0.1);
    const b = batchPer100(cook, "potato");
    near(b.m[0], 258 / 250 * 100, 0.01);
    /* no pans weighed yet: a typical cooked weight, and it says it's an estimate */
    expect(one("batch").est).toBe(true);
    expect(one("a big batch", { cook }).name).toBe("The batch, big");
  });

  it("a food typed in from its packet is read like any other", () => {
    const bar = myFood({ name: "Grenade bar", per: "item", g: 60, kcal: 214, p: 20, c: 17, f: 8 });
    expect(bar).toMatchObject({ id: "u-grenade-bar", each: { g: 60, w: "item", m: [214, 20, 17, 8] } });
    expect(one("2 grenade bar", { mine: [bar] })).toMatchObject({ kcal: 428, p: 40 });
    const oats = myFood({ name: "Jumbo oats", per: "100", kcal: 370, p: 12, c: 60, f: 8 });
    expect(one("80g jumbo oats", { mine: [oats] })).toMatchObject({ kcal: 296, p: 9.6 });
    expect(myFood({ name: "", kcal: 100, p: 1, c: 1, f: 1 })).toBeNull();
    expect(myFood({ name: "x", kcal: "", p: 1, c: 1, f: 1 })).toBeNull();
  });
});

describe("the day's numbers", () => {
  it("what the day holds: the gym and boxing or Saturday is a hard day, one of them a gym day, neither a day off", () => {
    expect(dayType({ session: true, boxing: true, day: "tue" })).toBe("hard");
    expect(dayType({ session: true, boxing: false, day: "sat" })).toBe("hard");
    expect(dayType({ session: true, boxing: false, day: "mon" })).toBe("gym");
    expect(dayType({ session: false, boxing: true, day: "wed" })).toBe("gym");
    expect(dayType({ session: false, boxing: false, day: "fri" })).toBe("rest");
  });

  it("protein is 200 every day, fat 75, the carbs take the difference", () => {
    expect(targets({ type: "hard", kg: 82 })).toMatchObject({ kcal: 3600, p: 200, c: 531, f: 75, floor: false });
    expect(targets({ type: "gym", kg: 82 })).toMatchObject({ kcal: 3200, p: 200, c: 431, f: 75 });
    expect(targets({ type: "rest", kg: 82 })).toMatchObject({ kcal: 2700, p: 200, c: 306, f: 75 });
    expect(PROTEIN).toBe(200);
    expect(DAY_KCAL).toEqual({ hard: 3600, gym: 3200, rest: 2700 });
  });

  it("the slight surplus is 250 in carbs; the Sunday checks' change rides on every day", () => {
    expect(targets({ type: "gym", surplus: true, kg: 82 })).toMatchObject({ kcal: 3450, c: 494 });
    expect(targets({ type: "gym", adj: -300, kg: 82 })).toMatchObject({ kcal: 2900, c: 356 });
  });

  it("a cut takes the weight plan's own step off the day, and no surplus while it runs", () => {
    [1, 2, 3, 4].forEach((s) => expect(targets({ type: "hard", step: s, surplus: true, kg: 82 }).kcal).toBe(3600 - (STEP_KCAL[0] - STEP_KCAL[s])));
    expect(targets({ type: "gym", step: 0, kg: 82 }).kcal).toBe(3200);
  });

  it("never under the floors: carbs 3 g and fat 0.6 g per kilo", () => {
    const t = targets({ type: "rest", adj: -600, step: 4, kg: 82 });
    expect(t).toMatchObject({ p: 200, c: 246, f: 49, floor: true });
    expect(t.kcal).toBe(200 * 4 + 246 * 4 + 49 * 9);
  });

  it("the weight for the floors is the 7-morning average, or the last weight", () => {
    expect(bodyKg({ "2026-11-28": 82, "2026-11-29": 81, "2026-11-30": 80 }, "2026-11-30")).toBe(81);
    expect(bodyKg({ "2026-11-20": 83 }, "2026-11-30")).toBe(83);
    expect(bodyKg({}, "2026-11-30")).toBeNull();
  });
});

describe("the next meal", () => {
  const left = { kcal: 2400, p: 160, c: 330, f: 60 };
  it("nothing eaten: whenever you're ready", () => {
    expect(nextMeal({ entries: [], now: 300, left })).toEqual({ first: true, meals: 0 });
  });
  it("three hours after the last meal began, with what's left shared over the meals to come", () => {
    const e = [{ at: 255, kcal: 249, p: 26 }, { at: 290, kcal: 144, p: 25 }, { at: 555, kcal: 346, p: 26 }];
    expect(mealsOf(e).map((m) => m.at)).toEqual([255, 555]);
    const n = nextMeal({ entries: e, now: 600, left });
    expect(n).toMatchObject({ meals: 2, at: 735, now: false, toCome: 3, aim: { kcal: 800, p: 53, c: 110, f: 20 } });
    expect(nextMeal({ entries: e, now: 740, left }).now).toBe(true);
    /* never fewer than one to come */
    const many = [300, 500, 700, 900, 1100, 1250].map((at) => ({ at, kcal: 100, p: 10 }));
    expect(nextMeal({ entries: many, now: 1260, left }).toCome).toBe(1);
  });
  it("the meals that fit: closest on protein and calories, none that runs well past what's left", () => {
    const m = [{ id: "a", kcal: 300, p: 10 }, { id: "b", kcal: 600, p: 45 }, { id: "c", kcal: 1400, p: 60 }, { id: "d", kcal: 550, p: 38 }];
    expect(suggest(m, { kcal: 600, p: 40 }, { kcal: 900 }, 2).map((x) => x.id)).toEqual(["b", "d"]);
  });
  it("short of protein in the evening: what a bottle does about it", () => {
    expect(lateProtein({ p: 70 }, 19 * 60)).toBe("A UFIT bottle is 50 g of the 70 g protein still to go.");
    expect(lateProtein({ p: 30 }, 19 * 60)).toBe("Half a UFIT bottle is 25 g of the 30 g protein still to go.");
    expect(lateProtein({ p: 70 }, 12 * 60)).toBeNull();
    expect(lateProtein({ p: 10 }, 20 * 60)).toBeNull();
  });
});

describe("the Sunday check, with no fight", () => {
  const days = (from, n, kg) => { const o = {}; for (let i = 0; i < n; i++) { const d = new Date(Date.UTC(2026, 10, 30 + i)); o[d.toISOString().slice(0, 10)] = kg(i); } return o; };
  it("the first check is the second Sunday: a full week on the budget first", () => {
    const r = sundayChecks({ weights: days("2026-11-30", 21, () => 82), from: "2026-11-30", today: "2026-12-20" });
    expect(r.checks.map((c) => [c.sun, c.why, c.change])).toEqual([["2026-12-13", "held", 0], ["2026-12-20", "held", 0]]);
    expect(r.adj).toBe(0);
  });
  it("maintenance: down more than 0.3 a week is 150 more a day; up more than 0.3 is 150 less", () => {
    const down = sundayChecks({ weights: days("2026-11-30", 28, (i) => 82 - i * 0.07), from: "2026-11-30", today: "2026-12-27" });
    expect(down.checks.map((c) => c.change)).toEqual([150, 150, 150]);
    expect(down.adj).toBe(450);
    const up = sundayChecks({ weights: days("2026-11-30", 21, (i) => 80 + i * 0.07), from: "2026-11-30", today: "2026-12-20" });
    expect(up.adj).toBe(-300);
  });
  it("never more than 600 either way", () => {
    const r = sundayChecks({ weights: days("2026-11-30", 70, (i) => 85 - i * 0.1), from: "2026-11-30", today: "2026-02-07".replace("2026", "2027") });
    expect(r.adj).toBe(600);
    expect(r.checks.some((c) => c.why === "maxup")).toBe(true);
  });
  it("the slight surplus lets the average rise a little, and adds when it falls", () => {
    const rise = sundayChecks({ weights: days("2026-11-30", 21, (i) => 80 + i * 0.03), from: "2026-11-30", today: "2026-12-20", surplusOn: () => true });
    expect(rise.adj).toBe(0);
    const flat = sundayChecks({ weights: days("2026-11-30", 21, (i) => 80 - i * 0.01), from: "2026-11-30", today: "2026-12-20", surplusOn: () => true });
    expect(flat.adj).toBe(300);
  });
  it("too few weigh-ins changes nothing; and the weeks a cut runs are the weight plan's", () => {
    const thin = sundayChecks({ weights: { "2026-12-12": 80, "2026-12-13": 80 }, from: "2026-11-30", today: "2026-12-13" });
    expect(thin.checks).toEqual([{ sun: "2026-12-13", A: null, P: null, change: 0, why: "few" }]);
    const cut = sundayChecks({ weights: days("2026-11-30", 28, (i) => 82 - i * 0.1), from: "2026-11-30", today: "2026-12-27", cutOn: () => true });
    expect(cut).toEqual({ adj: 0, checks: [] });
  });
});

describe("times", () => {
  it("a time typed without its colon is read as one: 1100 is eleven o'clock", () => {
    expect(tMin("1100")).toBe(660);
    expect(tMin("0930")).toBe(570);
    expect(tMin("09:30")).toBe(570);
    expect(tMin("13:30")).toBe(810);
    expect(minsOf("07:30")).toBe(450);
    expect(minsOf("730")).toBe(450);
    expect(minsOf("25:00")).toBeNull();
    expect(clock(735)).toBe("12:15");
  });
});
