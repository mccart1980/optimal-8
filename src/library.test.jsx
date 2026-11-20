import { describe, it, expect } from "vitest";
import { sessionCatalog } from "./App.jsx";

/* THE BUILD CHECK: every card PREP, CAMP, the transition and the week
   before a camp can show — in every season the builder makes, with THE
   EDGE on and off — names an entry in exercise-library.md. A warm-up
   card's checklist rows and a round card's parts each name one too.
   `npm run build` runs this first and stops if it fails. The weekly
   check is the week's numbers, not an exercise, and is left out.
   Optimal 8 Fighter was retired on 23 November 2026, and its pages are
   no longer in the catalog. The activation's three sighs show
   home-routines.md's THREE BIG SIGHS words and no library entry: the
   only row allowed through. */
const ALLOWED = [
  "camp · Three physiological sighs",
];
describe("the exercise library covers every session row", () => {
  const cat = sessionCatalog().filter((c) => c.kind !== "review");

  it("finds the programs' rows, and none of the retired Fighter's", () => {
    ["prep", "camp", "transition"].forEach((p) => expect(cat.some((c) => c.program === p)).toBe(true));
    expect(cat.some((c) => c.program === "fighter")).toBe(false);
  });

  it("gives every row an entry", () => {
    const miss = new Set();
    cat.forEach((c) => {
      if (c.kind !== "warm" && !c.lib) miss.add(c.program + " · " + c.n);
      c.rows.forEach((r) => { if (!r.lib) miss.add(c.program + " · " + c.n + " · " + r.n); });
    });
    expect([...miss].filter((m) => ALLOWED.indexOf(m) < 0).sort()).toEqual([]);
  });
});
