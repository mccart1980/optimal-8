import { describe, it, expect } from "vitest";
import { sessionCatalog } from "./App.jsx";

/* THE BUILD CHECK: every card PREP, CAMP, the transition and the week
   before a camp can show — in every season the builder makes, with THE
   EDGE on and off — names an entry in exercise-library.md, and so does
   the Fighter's. A warm-up card's checklist rows and a round card's parts
   each name one too. `npm run build` runs this first and stops if it
   fails. The weekly check is the week's numbers, not an exercise, and is
   left out.

   The October library dropped seven entries only Optimal 8 Fighter, the
   classic, still names (bear crawls, breathe down, the Romanian
   deadlift, the chest-supported row, the clap push-up, the side plank
   reach-through, the mid-thigh pull). Those Fighter rows show the
   Fighter's own words instead, and are the only rows allowed through. */
const FIGHTER_ONLY = [
  "fighter · Chest-Supported Row",
  "fighter · Mid-thigh pull peak force",
  "fighter · Romanian Deadlift",
  "fighter · Side plank reach-through",
  "fighter · Upper Circuit — Bench + Throws · Clap push-up",
  "fighter · Warm-up · Back on the floor, feet on a bench",
  "fighter · Warm-up · Bear crawls · 2 min",
];
describe("the exercise library covers every session row", () => {
  const cat = sessionCatalog().filter((c) => c.kind !== "review");

  it("finds the four programs' rows", () => {
    ["prep", "camp", "fighter", "transition"].forEach((p) => expect(cat.some((c) => c.program === p)).toBe(true));
  });

  it("gives every row an entry", () => {
    const miss = new Set();
    cat.forEach((c) => {
      if (c.kind !== "warm" && !c.lib) miss.add(c.program + " · " + c.n);
      c.rows.forEach((r) => { if (!r.lib) miss.add(c.program + " · " + c.n + " · " + r.n); });
    });
    expect([...miss].filter((m) => FIGHTER_ONLY.indexOf(m) < 0).sort()).toEqual([]);
  });
});
