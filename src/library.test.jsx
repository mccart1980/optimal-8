import { describe, it, expect } from "vitest";
import { sessionCatalog } from "./App.jsx";

/* THE BUILD CHECK: every card PREP, CAMP, the Fighter and the two easy
   weeks can show — in every week, with THE EDGE on and off, and the
   Fighter's last ten days — names an entry in exercise-library.md. A
   warm-up card's checklist rows and a round card's parts each name one
   too. `npm run build` runs this first and stops if it fails. The
   weekly check is the week's numbers, not an exercise, and is left out. */
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
    expect([...miss].sort()).toEqual([]);
  });
});
