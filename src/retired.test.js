import { describe, it, expect } from "vitest";
import guideMd from "../guide.md?raw";
import ironMd from "../iron-mind-v5.md?raw";
import moveMd from "../optimal-8-move.md?raw";
import campMd from "../optimal-8-camp.md?raw";
import sppMd from "../optimal-8-strength-power-physique.md?raw";
import fighterMd from "../optimal8fighter.md?raw";
import { existsSync } from "fs";
import ironV4Md from "../iron-mind-v4-2.md?raw";
import { CALIS_RULES } from "./calis.js";
import { RUNS } from "./welcome.jsx";
import { withMove, OPROTO } from "./movex.js";
import { withCore } from "./core.js";
import { prepSess } from "./prep.js";
import { campSess } from "./camp.js";

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

describe("Hell Week, retired with it, and then Iron Mind on 20 November 2026", () => {
  it("Iron Mind's modules are out of the app: nothing is left to run it", () => {
    ["src/im-data.js", "src/im-ui.jsx", "src/life.js", "src/life-ui.jsx"].forEach((f) => expect([f, existsSync(f)]).toEqual([f, false]));
    expect(existsSync("src/sheet.jsx")).toBe(true);
  });
  it("the taper is a switch in Settings → Calisthenics, not Fighter's weeks 15–16", () => {
    expect(JSON.stringify(CALIS_RULES)).not.toMatch(/15–16|Iron Mind/);
    expect(CALIS_RULES).toContain("A taper week (the switch in Settings → Calisthenics): holds only — handstand and ring support — nothing to failure, nothing new.");
  });
  it("the 60-second settle stays: Prep's and the camp's interval days end with it, on its own timer, with its seconds to land", () => {
    [[prepSess("tue"), "settle"], [prepSess("thu"), "settle2"], [campSess("tue", {}), null], [campSess("thu", {}), null]].forEach(([S, id]) => {
      const b = S.b.find((x) => x.settle);
      expect(b.n).toBe("The 60-Second Settle");
      expect(b.timer()).toEqual({ kind: "settle", title: "THE SETTLE" });
      expect(b.rxLine()).toBe("60 seconds — log the seconds to land");
      if (id) expect((typeof b.items === "function" ? b.items({}) : b.items).map((i) => i.id)).toEqual([id]);
    });
  });
  it("Iron Mind's documents say they're retired, and stay only as the record", () => {
    [ironMd, ironV4Md].forEach((md) => expect(md).toMatch(/^\*\*RETIRED on 20 November 2026\.\*\* Iron Mind is no longer in the app/m));
    expect(ironMd).not.toMatch(/Hell Week/i);
  });
});
