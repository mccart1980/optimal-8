import { describe, it, expect } from "vitest";
import guideMd from "../guide.md?raw";
import ironMd from "../iron-mind-v5.md?raw";
import moveMd from "../optimal-8-move.md?raw";
import campMd from "../optimal-8-camp.md?raw";
import sppMd from "../optimal-8-strength-power-physique.md?raw";
import fighterMd from "../optimal8fighter.md?raw";
import { LADDER, CEILING, COLLISION, GATES, PROGRESSION } from "./im-data.js";
import { CALIS_RULES } from "./calis.js";
import { RUNS } from "./welcome.jsx";
import { withMove, OPROTO } from "./movex.js";
import { withCore } from "./core.js";

/* ================================================================
   OPTIMAL 8 FIGHTER AND HELL WEEK, RETIRED on 23 November 2026. With
   no fight booked, Strength, Power and Physique or Prep runs; a booked
   fight runs the camp. Fighter can't be picked, nothing lays new work
   over its old pages, and Hell Week is gone from Iron Mind with it.
   ================================================================ */

describe("Optimal 8 Fighter, retired", () => {
  it("can't be picked: the welcome offers Strength, Power and Physique and Prep", () => {
    expect(RUNS.map((r) => r[0])).toEqual(["spp", "prep"]);
  });
  it("nothing is laid over its old pages: no Move, no core, and its two movement blocks are gone", () => {
    const page = { b: [{ L: "A", n: "Warm-up" }, { L: "C", n: "Power dose — box jumps" }], m: 65 };
    ["mon", "tue", "wed", "thu", "sat", "sun"].forEach((d) => {
      expect(withMove("fighter", d, page)).toBe(page);
      expect(withCore("fighter", d, page)).toBe(page);
    });
    expect(Object.keys(OPROTO).filter((k) => /_F$/.test(k))).toEqual([]);
  });
  it("its document says it's retired, and the others no longer offer it", () => {
    expect(fighterMd).toMatch(/^\*\*RETIRED on 23 November 2026\.\*\* Optimal 8 Fighter and its Hell Week are no longer in the app/m);
    expect(guideMd).toMatch(/Optimal 8 Fighter, the classic, was retired on 23 November 2026\./);
    expect(guideMd).not.toMatch(/Or \*\*Optimal 8 Fighter\*\*/);
    expect(guideMd).toMatch(/It runs in every program from Monday 16 November: Strength, Power and Physique, Prep, the camp and the transition\./);
    expect(moveMd).toMatch(/MOVE and its tendon work run in Prep, the camp and the transition as they do in Strength, Power and Physique\./);
    expect(campMd).toMatch(/Prep and Strength, Power and Physique are untouched\./);
    expect(sppMd).toMatch(/It's its own programme, beside Prep: Settings → Fight booked\? No → What runs → STRENGTH, POWER, PHYSIQUE\. Prep doesn't change\./);
  });
});

describe("Hell Week, retired with it", () => {
  it("Iron Mind's hardship level 3 gate is twelve weeks, and no gate, rule or table names Hell Week", () => {
    expect(LADDER[3].gate).toBe("Gate: twelve weeks.");
    expect(GATES.hard[3].lines).toEqual([["weeks", "Twelve weeks", 12]]);
    const all = JSON.stringify([LADDER, CEILING, COLLISION, GATES, PROGRESSION, CALIS_RULES]);
    expect(all).not.toMatch(/Hell Week/i);
    expect(CEILING).toMatch(/^THE CEILING — one deliberate comfort-deprivation day a quarter/);
    expect(COLLISION[0]).toMatch(/^The training program owns your body's budget\./);
  });
  it("the taper is a switch, not Fighter's weeks 15–16", () => {
    expect(JSON.stringify([COLLISION, CALIS_RULES, PROGRESSION])).not.toMatch(/15–16/);
    expect(COLLISION.some((x) => /^A taper week \(the switch in Settings → Iron Mind\): no maximal hardship sessions\./.test(x))).toBe(true);
  });
  it("Iron Mind's document says the same", () => {
    expect(ironMd).not.toMatch(/Hell Week/i);
    expect(ironMd).not.toMatch(/Optimal 8 Fighter/);
    expect(ironMd).toMatch(/\*\*Gate: twelve weeks\.\*\*/);
    expect(ironMd).not.toMatch(/15–16/);
  });
});
