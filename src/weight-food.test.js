import { describe, it, expect } from "vitest";
import { fuelPlan, tMin, B, blockOf } from "./fuel.js";
import { weightCfg, runPlan, weightDay, plusDays } from "./weight.js";

/* ================================================================
   MAKING WEIGHT — the food, card by card, as weight-making.md prints it.
   ================================================================ */
const plan = (day, w, extra) => fuelPlan(Object.assign({ day, phase: "camp", start: tMin(day === "sat" || day === "sun" ? "08:15" : "03:30"), len: 60, session: day !== "fri",
  lights: tMin("21:30"), w }, extra || {}));
const step = (n) => ({ kind: "step", step: n });
const feeds = (p) => p.rows.filter((r) => r.kind === "feed");
const card = (p, id) => { const r = p.rows.find((x) => x.id === id); return r ? [r.blk.kcal, r.blk.p, r.blk.c, r.blk.f] : null; };
const mac = (b) => [b.kcal, b.p, b.c, b.f];

describe("the steps — each card at its step, with its own kcal · P · C · F", () => {
  it("Step 1: no three o'clock, no honey at breakfast", () => {
    const p = plan("mon", step(1));
    expect(p.rows.find((r) => r.slot === "three")).toBeUndefined();
    expect(card(p, "f-breakfast")).toEqual([509, 16, 89, 10]);
    /* the water that went with the three o'clock keeps its own row */
    expect(p.rows.find((r) => r.id === "w-feed3")).toBeDefined();
  });
  it("Step 2: lunch half the carb; Thursday and Sunday dinner half the carb; Saturday standard, not BIG", () => {
    const mon = plan("mon", step(2));
    expect(card(mon, "f-lunch")).toEqual(mac(B.batch));
    expect(card(mon, "f-lunch-1")).toEqual([415, 34, 36, 15]);
    expect(card(plan("thu", step(2)), "f-dinner")).toEqual([761, 87, 47, 23]);
    expect(card(plan("sun", step(2)), "f-dinner")).toEqual([685, 76, 54, 19]);
    expect(card(plan("tue", step(2)), "f-dinner")).toEqual(mac(B.chicken));
    const sat = plan("sat", step(2));
    expect(card(sat, "f-lunch")).toEqual(mac(B.batch));
    expect(sat.rows.find((r) => r.id === "f-lunch").big).toBe(false);
  });
  it("Step 3: mid-morning half; Tuesday, Friday and Saturday dinner half; Monday and Friday breakfast no banana", () => {
    expect(card(plan("tue", step(3)), "f-lunch")).toEqual([415, 34, 36, 15]);
    expect(card(plan("tue", step(3)), "f-dinner")).toEqual([761, 87, 47, 23]);
    expect(card(plan("fri", step(3)), "f-dinner")).toEqual([685, 76, 54, 19]);
    /* Saturday's BIG plate with half the pouch: about 950 */
    expect(card(plan("sat", step(3)), "f-dinner")[0]).toBe(955);
    expect(card(plan("mon", step(3)), "f-breakfast")).toEqual([404, 15, 62, 10]);
    expect(card(plan("fri", step(3)), "f-breakfast")).toEqual([404, 15, 62, 10]);
    expect(card(plan("tue", step(3)), "f-breakfast")).toEqual([509, 16, 89, 10]);
  });
  it("Step 4 · the floor: no banana every day, half the oats on Monday and Friday, the BIG breakfasts at standard size", () => {
    expect(card(plan("mon", step(4)), "f-breakfast")).toEqual([267, 12, 37, 8]);
    expect(card(plan("tue", step(4)), "f-breakfast")).toEqual([404, 15, 62, 10]);
    const wed = plan("wed", step(4));
    expect(card(wed, "f-breakfast")).toEqual([404, 15, 62, 10]);
    expect(wed.rows.find((r) => r.id === "f-breakfast").big).toBe(false);
    /* the BIG breakfast through Step 3: the BIG plate, no honey */
    expect(card(plan("wed", step(3)), "f-breakfast")).toEqual([649, 19, 114, 12]);
  });
  it("every option in the swap list at its step: the bagels and the dinners", () => {
    const pick = (day, slotId, k) => ({ menu: { [day + "-" + slotId]: k } });
    expect(card(plan("mon", step(4), pick("mon", "breakfast", "eggbagelbf")), "f-breakfast")).toEqual([348, 25, 23, 16]);
    expect(card(plan("tue", step(4), pick("tue", "breakfast", "tunabagelbf")), "f-breakfast")).toEqual([435, 34, 72, 2]);
    expect(card(plan("thu", step(2), pick("thu", "dinner", "steakjacket")), "f-dinner")).toEqual([735, 70, 58, 23]);
    expect(card(plan("mon", step(2), pick("mon", "lunch-1", "rctuna")), "f-lunch-1")).toEqual([370, 35, 45, 6]);
  });
  it("never changes the bottle, the 5pm loads, the protein, the weekend post-session feed, Monday's and Wednesday's dinner, the casein or the drinking", () => {
    ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].forEach((d) => {
      const p0 = plan(d, null);
      for (let n = 0; n <= 4; n++) {
        const p = plan(d, step(n));
        ["f-pre", "f-five", "f-post", "f-bed"].forEach((id) => expect(card(p, id)).toEqual(card(p0, id)));
        p.rows.filter((r) => r.kind === "feed" && /^f-half/.test(r.id)).forEach((r) => expect(card(p, r.id)).toEqual(card(p0, r.id)));
        if (d === "mon" || d === "wed") expect(card(p, "f-dinner")).toEqual(card(p0, "f-dinner"));
        /* the protein in every feed holds: only the carb-side grams go (60 g of pasta, half a pouch) — the doc's own numbers */
        feeds(p).forEach((r) => { const r0 = p0.rows.find((x) => x.id === r.id); const same = r.slot ? blockOf(r.key, r.slot, r.big) : r0.blk;
          expect(r.blk.p).toBeGreaterThanOrEqual(same.p - 8); });
        /* the drinking schedule: every drink, every amount */
        /* every millilitre, on a feed's row or a row of its own */
        const water = (q) => q.rows.reduce((a, r) => a + (r.ml || 0), 0);
        expect(water(p)).toBe(water(p0));
        expect(p.target).toBe(p0.target);
      }
    });
  });
  it("the build block's extra Monday and Thursday loads don't run while the plan is on", () => {
    expect(plan("mon", null, { phase: "build" }).rows.find((r) => r.slot === "five")).toBeDefined();
    expect(plan("mon", step(0), { phase: "build" }).rows.find((r) => r.slot === "five")).toBeUndefined();
    expect(plan("thu", step(2), { phase: "build" }).rows.find((r) => r.slot === "five")).toBeUndefined();
    expect(plan("tue", step(2), { phase: "build" }).rows.find((r) => r.slot === "five")).toBeDefined();
  });
});

describe("fight week", () => {
  it("THE LIGHT DAYS replace the day: no three o'clock, no load, the light menu, the full drinking schedule", () => {
    const p = plan("wed", { kind: "light" });
    const ids = feeds(p).map((r) => r.blk.n);
    expect(ids).toEqual(["HALF THE BOTTLE, NO CARB", "HALF THE BOTTLE, NO CARB", "3 EGGS ON A WHITE BAGEL", "CHICKEN, PRAWNS OR TUNA + 2 RICE CAKES", "COD OR PRAWNS + HALF A POUCH", "CHICKEN OR COD, 2 EGGS + HALF A POUCH", "CASEIN"]);
    expect(card(p, "f-breakfast")).toEqual([445, 28, 46, 17]);
    expect(p.rows.find((r) => r.slot === "three" || r.slot === "five")).toBeUndefined();
    const water = (q) => q.rows.filter((r) => r.kind === "water").map((r) => r.ml).reduce((a, b) => a + b, 0);
    expect(water(p)).toBeGreaterThanOrEqual(water(plan("wed", null)) - 300);
    /* a tendon day: collagen in water, no orange juice */
    const thu = plan("thu", { kind: "light" });
    expect(thu.rows.find((r) => r.slot === "pre").blk.i.some((x) => /orange/i.test(x[0]))).toBe(false);
  });
  it("the weigh-in day, afternoon or evening: small low-fibre feeds every three hours, the last two hours before; halved over the morning aim", () => {
    const w = { kind: "weighin", weighIn: "before", weighAt: tMin("17:00") };
    const p = plan("fri", w);
    const small = feeds(p).filter((r) => /^f-wsmall/.test(r.id));
    expect(small[small.length - 1].t).toBe(tMin("15:00"));
    expect(small.map((r) => r.t)).toEqual([tMin("06:00"), tMin("09:00"), tMin("12:00"), tMin("15:00")]);
    expect(p.rows.find((r) => r.weighin).t).toBe(tMin("17:00"));
    const over = plan("fri", Object.assign({}, w, { overAim: true }));
    expect(feeds(over).find((r) => /^f-wsmall/.test(r.id)).blk.kcal).toBe(Math.round(small[0].blk.kcal / 2));
  });
  it("the weigh-in day, morning: nothing to eat until the weigh-in; then the top-up, in litres from the fight-week Sunday average", () => {
    const p = plan("fri", { kind: "weighin", weighIn: "am", weighAt: tMin("09:00"), litres: { fw: 77.6, under: 1.0, lo: 1.25, hi: 1.5 } });
    expect(feeds(p).every((r) => r.t > tMin("09:00"))).toBe(true);
    const top = p.rows.find((r) => r.id === "w-rehyd");
    expect(top.n).toBe("Top up — 1.3–1.5 litres, sipped");
    expect(top.note).toMatch(/1\.0 kg under your fight-week Sunday average of 77\.6/);
  });
  it("on the day: fight morning has nothing before the weigh-in", () => {
    const p = fuelPlan({ day: "sat", fight: true, weighIn: "day", start: tMin("19:00"), w: { kind: "fight", weighIn: "day", weighAt: tMin("10:00") } });
    expect(feeds(p).every((r) => r.t > tMin("10:00"))).toBe(true);
    expect(p.rows.find((r) => r.weighin).t).toBe(tMin("10:00"));
  });
});

describe("proof 7 — on the day: the two days before the fight are Step 0 in low-fibre form", () => {
  const cfg = weightCfg({ booked: true, fight: "2026-11-14", limit: 76.0, tol: 0, natural: 78.0, weighIn: "day" });
  const w = {}; [-6, -4, -2, 0].forEach((i) => { w[plusDays("2026-10-11", i)] = 78.0; });
  const p = runPlan({ draws: [{ at: "2026-10-11", cfg }], weights: w, today: "2026-11-14" });
  it("12 and 13 November: Step 0, low fibre; the days before them, the last step", () => {
    expect(weightDay(p, cfg, "2026-11-12")).toMatchObject({ kind: "lowfibre", step: 0 });
    expect(weightDay(p, cfg, "2026-11-13")).toMatchObject({ kind: "lowfibre", step: 0 });
    expect(weightDay(p, cfg, "2026-11-11").kind).toBe("step");
    expect(weightDay(p, cfg, "2026-11-14").kind).toBe("fight");
    expect(weightDay(p, cfg, "2026-11-15")).toBeNull();
  });
  it("the full day with only the listed low-fibre options, the three o'clock back", () => {
    const d = plan("thu", { kind: "lowfibre", step: 0 });
    const keys = Object.fromEntries(feeds(d).filter((r) => r.slot).map((r) => [r.id, r.key]));
    expect(keys["f-breakfast"]).toBe("eggbagelbf");
    expect(keys["f-lunch"]).toBe("prawnrice");
    expect(keys["f-three"]).toBe("twoban");
    expect(keys["f-dinner"]).toBe("chicken");
    const din = d.rows.find((r) => r.id === "f-dinner").blk;
    expect(din.i.some((x) => /mushroom|passata/i.test(x[0]))).toBe(false);
    /* a pick that isn't low-fibre falls back to the first that is */
    const j = plan("thu", { kind: "lowfibre", step: 0 }, { menu: { "thu-lunch": "jacketbt", "thu-breakfast": "porridge" } });
    expect(j.rows.find((r) => r.id === "f-lunch").key).toBe("prawnrice");
    expect(j.rows.find((r) => r.id === "f-breakfast").key).toBe("eggbagelbf");
  });
});
