import { describe, it, expect } from "vitest";
import campMd from "../optimal-8-camp.md?raw";
import prepMd from "../optimal-8-prep.md?raw";
import builderMd from "../season-builder.md?raw";
import { buildSeason, rowRx, rowDates, CYCLE16, prepLayout, campLayout, COMEBACK_N, prepRunOn, describeSeason } from "./builder.js";
import { campRow } from "./camp.js";
import { prepEmphasis } from "./prep.js";
import { GRID } from "./proof-grid.js";
import { weightCfg, runPlan } from "./weight.js";

/* ================================================================
   THE PROOF — the six tests. `npm run build` runs this file and
   proof.test.jsx first and stops if any of either fails.
     1 · 6 × 3, 60 s, good, no emphasis, fight Sat 13 Mar 2027, plan
         from Mon 4 Jan 2027: Optimal 8 · Camp's week table
     2 · no fight: the 16-week cycle
     3 · fight Sat 28 Nov 2026, 3 × 2, 60 s, low, durability, plan from
         Mon 12 Oct 2026: Worked Example 1, week by week
     4 · Prep with 14 weeks is Optimal 8 · Prep; with 4, P4 P7 P8 P14
     5 · nothing outside the three documents (proof.test.jsx)
     6 · no released-weight jump, no true max, no full depth jumps
         before the tendon ramp allows them — every fitness, format and
         emphasis (here the prescriptions; proof.test.jsx the pages)
   ================================================================ */

/* the rows of the first markdown table after a heading that matches */
function tableAfter(md, headRe) {
  const lines = md.split(/\r?\n/);
  let i = lines.findIndex((l) => headRe.test(l));
  while (i < lines.length && !/^\|/.test(lines[i])) i++;
  const out = [];
  for (; i < lines.length && /^\|/.test(lines[i]); i++) {
    const cells = lines[i].replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c))) continue;
    out.push(cells);
  }
  return out.slice(1);
}
const plan = (from, made, inputs) => ({ from, made, inputs: Object.assign({ booked: true }, inputs) });
const campRows = (s) => s.rows.filter((r) => r.program === "camp");

/* ---------------- 1 · the master camp ---------------- */
describe("proof 1 — the master camp, week for week", () => {
  const master = (made) => buildSeason({ plans: [plan("2027-01-04", made, { fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, fitness: "good", emphasis: "none", weighIn: "before" })], today: made });
  const doc = tableAfter(campMd, /^## THE TEN WEEKS/);

  ["2027-01-04", "2026-12-31"].forEach((made) => {
    const s = master(made), rows = campRows(s);
    it("is the ten master weeks, in order, from Monday 4 January (planned " + made + ")", () => {
      expect(rows.map((r) => r.id)).toEqual(["F", "B1", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"]);
      expect(rows[0].mon).toBe("2027-01-04");
      expect(doc.length).toBe(10);
    });
    it("reproduces every cell of the document's week table (planned " + made + ")", () => {
      let prev = null;
      rows.forEach((r, i) => {
        const rx = rowRx(r, true), t = campRow(rx, prev), d = doc[i];
        expect([String(r.idx), rowDates(r), rx.block, t.mon, t.tue, t.wed, t.thu, t.sat, t.sun, t.nor].slice(0, d.length)).toEqual(d);
        prev = rx;
      });
    });
  });

  it("is the camp test week hands on: no week-1 burst or nasal test, test week's working weights", () => {
    const w1 = rowRx(campRows(master("2026-12-31"))[0], true);
    expect(w1.tests && w1.tests.tue).toBeFalsy(); expect(w1.nasal).toBeFalsy(); expect(w1.checks).toBeFalsy();
  });

  it("puts the pre-camp check in the week before it, 28 December–3 January", () => {
    const pre = master("2026-12-31").rows[0];
    expect(pre.program).toBe("pre"); expect(pre.mon).toBe("2026-12-28");
    const rx = rowRx(pre); expect(rx.preCamp).toBe(1); expect(rx.checks).toBe(0);
  });

  it("climbs the reactive slot as the camp writes it: low-box depth jumps in weeks 1–5, depth jumps in weeks 6–8", () => {
    campRows(master("2026-12-31")).slice(0, 8).forEach((r) => expect(rowRx(r, true).jump).toBe(r.idx <= 5 ? "lowbox" : "depth"));
  });
});

/* ---------------- 2 · no fight ---------------- */
describe("proof 2 — no fight: the 16-week cycle, on repeat", () => {
  const s = buildSeason({ plans: [plan("2026-10-12", "2026-10-12", { booked: false })], today: "2026-10-12" });
  it("runs P1 to P14 with P4b and P12b, then starts again the Monday after test day", () => {
    expect(s.rows.slice(0, 16).map((r) => r.id)).toEqual(CYCLE16);
    expect(s.rows.slice(16, 32).map((r) => r.id)).toEqual(CYCLE16);
    expect(s.rows[15].mon).toBe("2027-01-25");
    expect(s.rows[16].mon).toBe("2027-02-01");
    const ids = builderMd.match(/\| Weeks 1–16 \| (.+?) \|/)[1].split(" · ");
    expect(ids).toEqual(CYCLE16);
  });
  it("P4b is P4 at +2.5%; P12b is P12 at 88% with depth jumps 4 × 4", () => {
    const p4 = rowRx(s.rows[3], true), p4b = rowRx(s.rows[4], true), p12b = rowRx(s.rows[13], true);
    expect(p4.pct).toBe(75); expect(p4b.pct).toBe(77.5); expect(p4b.sc).toBe("5 × 5 @ 77.5%");
    expect(p12b.pct).toBe(88); expect(p12b.js).toEqual([4, 4]); expect(p12b.jump).toBe("depth");
  });
  it("climbs the reactive slot: drop landings in weeks 1–5, low-box depth jumps in 6–10, depth jumps in 11–13", () => {
    s.rows.slice(0, 16).filter((r) => r.doc <= 13).forEach((r) => expect(rowRx(r, true).jump).toBe(r.doc <= 5 ? "land" : r.doc <= 10 ? "lowbox" : "depth"));
  });
  it("runs week 9 and test week as top triples, test week spread as the tests page spreads it", () => {
    const p9 = rowRx(s.rows.find((r) => r.id === "P9"), true), p14 = rowRx(s.rows.find((r) => r.id === "P14"), true);
    expect(p9.ph).toBe("top"); expect(p9.top).toBe("backoff"); expect([p9.sets, p9.reps, p9.pct]).toEqual([2, 2, 85]); expect(p9.noPP).toBe(1);
    expect(p14.ph).toBe("test"); expect(p14.top).toBe("test"); expect(p14.sets).toBe(0); expect(p14.pct).toBe(null);
    expect(p14.e2).toBe("t20"); expect(p14.t20).toBe("thu"); expect(p14.sunOff).toBe(1); expect(p14.burstTest).toBe(1); expect(p14.nasal).toBe(1);
    expect(p14.em).toMatch(/Sat 30 Jan TEST DAY/); expect(p14.em).toMatch(/Sun 31 Jan easy hour/);
  });
  it("runs the circuits, the dips and the carries by the calendar's numbers: P4b as P4, test week the least", () => {
    const n = s.rows.slice(0, 16).map((r) => { const rx = rowRx(r, true); return [rx.circ, rx.dr, rx.carry].join("/"); });
    expect(n).toEqual(["3/4/3", "3/4/3", "3/4/3", "3/4/3", "3/4/3", "2/3/2", "3/4/3", "3/4/3", "3/4/3", "2/3/3", "1/2/2",
      "2/3/3", "2/3/3", "2/3/3", "2/3/3", "0/2/0"]);
    const p4b = rowRx(s.rows[4], true);
    expect(p4b.bench.pct).toBe(77.5); expect(p4b.bench.sc).toBe("NORMAL TEMPO · 4 × 5 @ 77.5%");
    expect(rowRx(s.rows[0], true).bench.sc).toBe("SLOW LOWERING · 3 × 5 @ 70%");
  });
});

/* ---------------- 3 · the short camp ---------------- */
describe("proof 3 — Worked Example 1, week by week", () => {
  const s = buildSeason({ plans: [plan("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" })], today: "2026-10-08" });
  const rows = campRows(s);
  const doc = tableAfter(builderMd, /^## WORKED EXAMPLE 1/);
  const n = (cell, re) => { const m = cell.match(re); return m ? m.slice(1).map(Number) : null; };

  it("is F1 · F · B2 · P1 · P3 · S · FW, engine-first, the short-format pairs", () => {
    expect(rows.map((r) => r.id)).toEqual(["F1", "F", "B2", "P1", "P3", "S", "FW"]);
    expect(builderMd).toMatch(/Seven weeks from low fitness → \*\*F1 · F · B2 · P1 · P3 · S · FW\*\*/);
    expect(rows[0].camp.ef).toBe(true);
    expect(doc.length).toBe(7);
  });

  it("puts the pre-camp check and the tests in the week before, 5–11 October", () => {
    const pre = s.rows.find((r) => r.program === "pre");
    expect(pre.mon).toBe("2026-10-05");
    const rx = rowRx(pre);
    expect(rx.preCamp).toBe(1); expect(rx.checks).toBe(1);
  });

  it("matches the table, week by week", () => {
    rows.forEach((r, i) => {
      const rx = rowRx(r, true), d = doc[i];
      const [wk, dates, block, mon, tue, wed, thu, sat, sun, nor] = d;
      expect(Number(wk)).toBe(r.idx);
      expect(rowDates(r)).toBe(dates);
      expect(block.split(" ")[0]).toBe(r.id);
      /* Monday */
      expect(rx.fightWeek ? 20 : rx.base).toBe(n(mon, /(\d+) min/)[0]);
      /* Tuesday */
      if (/BURST TEST/.test(tue)) expect(rx.tests.tue).toBe("burst");
      if (/4-min intervals/.test(tue)) { expect(rx.eng1).toBe("vo2"); expect((rx.dose || {}).vo2 || 4).toBe(n(tue, /4-min intervals (\d+) × 4/)[0]); }
      if (/at 90%/.test(tue)) expect(rx.eff).toBe(90);
      if (/REPEAT BURSTS 2 × 8/.test(tue)) expect(rx.eng1).toBe("rz");
      if (/40-s repeats 2 × 6/.test(tue)) expect(rx.eng1).toBe("lac2");
      expect(!!rx.shuttleFirst).toBe(/shuttles begin/.test(tue));
      expect(!!rx.speed).toBe(/speed \(Edge\)/.test(tue));
      if (/RETESTS, then bursts 1 × 8/.test(tue)) { expect(rx.tests.tue).toBe("retest9"); expect(rx.eng1).toBe("rz1"); }
      if (/SPEED MICRODOSE/.test(tue)) expect(rx.fightWeek).toBe(1);
      /* Wednesday */
      if (/sled (\d+) runs/.test(wed)) { expect(rx.sled).toBe(n(wed, /sled (\d+) runs/)[0]); expect(rx.repeatSled).toBe(false); }
      if (/repeat/.test(wed)) expect(rx.repeatSled).toBe(true);
      const tbm = wed.match(/trap bar (?:[A-Za-z ]+ )?(\d+) (×|rounds) ?(\d*) ?@ (\d+)%/);
      if (tbm) {
        if (tbm[2] === "rounds") { expect(rx.tb.phase).toBe("contrast"); expect(rx.cr).toBe(Number(tbm[1])); }
        else { expect(rx.tb.sets).toBe(Number(tbm[1])); expect(rx.tb.reps).toBe(Number(tbm[3])); }
        expect(rx.tb.pct).toBe(Number(tbm[4]));
      }
      if (/slow lowering|5 s down/.test(wed) && !rx.tp) expect(rx.tb.phase).toBe("slow");
      if (/PAUSED/.test(wed)) expect(rx.tb.phase).toBe("paused");
      const bm = wed.match(/bench (?:paused |contrast )?(\d+) (×|rounds) ?(\d*) ?@ (\d+)%/);
      if (bm) {
        if (bm[2] === "rounds") { expect(rx.bench.phase).toBe("contrast"); expect(rx.bench.sets).toBe(Number(bm[1])); }
        else { expect(rx.bench.sets).toBe(Number(bm[1])); expect(rx.bench.reps).toBe(Number(bm[3])); }
        expect(rx.bench.pct).toBe(Number(bm[4]));
      }
      /* the easy session and the sauna's start live on Thursday now */
      expect(/easy \d+|sauna begins/.test(wed)).toBe(false);
      if (/bench throws 3 × 3 · chins 2 × 5/.test(wed)) { expect(rx.tp).toBe(1); expect(rx.tb.sets + "×" + rx.tb.reps + "@" + rx.tb.pct).toBe("2×2@80"); }
      /* Thursday */
      expect(!!rx.nasal).toBe(/NASAL TEST/.test(thu));
      if (/tempo/.test(thu)) { expect(rx.eng2).toBe("tempo"); expect((rx.dose || {}).tempo || 10).toBe(n(thu, /tempo (\d+) × 1 min/)[0]); }
      if (/REPEAT BURSTS 2 × 8/.test(thu)) expect(rx.eng2).toBe("rz");
      if (/40-s repeats 2 × 6/.test(thu)) expect(rx.eng2).toBe("lac2");
      if (/at fight pace/.test(thu)) { expect(rx.eng2).toBe("fp"); expect([rx.fpR.rounds, rx.fpR.mins, rx.fpR.rest]).toEqual(n(thu, /(\d+) × (\d+) at fight pace, (\d+) s/)); }
      if (/ACTIVATION/.test(thu)) expect(rx.fightWeek).toBe(1);
      if (/easy (\d+)/.test(thu)) expect(rx.wedEasy).toBe(n(thu, /easy (\d+)/)[0]);
      expect(rx.sauna === "starts").toBe(/sauna begins/.test(thu));
      /* Saturday */
      if (/(\d+) × 20 m/.test(sat)) {
        expect(rx.spr.n).toBe(n(sat, /(\d+) × 20 m/)[0]);
        expect(rx.spr.pct < 100).toBe(/@ 90%/.test(sat));
      }
      const sq = sat.match(/squat (?:[A-Za-z ]+ )?(\d+) (×|rounds) ?(\d*) ?@ (\d+)%/);
      if (sq) {
        if (sq[2] === "rounds") { expect(rx.sq.phase).toBe("contrast"); expect(rx.cr).toBe(Number(sq[1])); }
        else { expect(rx.sq.sets).toBe(Number(sq[1])); expect(rx.sq.reps).toBe(Number(sq[3])); }
        expect(rx.sq.pct).toBe(Number(sq[4]));
      }
      if (/drop landings (\d+) × (\d+)/.test(sat)) { expect(rx.jump).toBe("land"); expect(rx.js).toEqual(n(sat, /drop landings (\d+) × (\d+)/)); }
      if (/low-box depth jumps (\d+) × (\d+)/.test(sat)) { expect(rx.jump).toBe("lowbox"); expect(rx.js).toEqual(n(sat, /low-box depth jumps (\d+) × (\d+)/)); }
      expect(rx.jump === "depth").toBe(false);
      if (/SPEED MICRODOSE/.test(sat)) expect(rx.spr.micro).toBe(1);
      /* Sunday */
      const sm = sun.match(/^(\d+) × (\d+) at (\d+) s/);
      if (sm) { expect([rx.sim.rounds, rx.sim.mins, rx.sim.rest]).toEqual(sm.slice(1).map(Number)); expect(!!rx.sim.scored).toBe(/SCORED/.test(sun)); }
      if (/THE DOUBLE/.test(sun)) { const dm = n(sun, /THE DOUBLE: (\d+) × \d+, (\d+) min easy, (\d+) × \d+/); expect([rx.sim.double.a, rx.sim.double.easy, rx.sim.double.b]).toEqual(dm); expect(rx.sim.scored).toBe("last"); }
      if (/REHEARSAL/.test(sun)) { expect(rx.sim.rehearsal).toBe(1); expect(rx.sim.rounds + " × " + rx.sim.mins).toBe(sun.match(/(\d+ × \d+) at fight time/)[1]); expect(rx.rehearsal).toBe("2026-11-22"); }
      /* Nordics */
      if (/\d/.test(nor)) expect(rx.nor).toEqual(n(nor, /(\d+) × (\d+)/));
      else expect(rx.fightWeek).toBe(1);
    });
  });

  it("runs the durability emphasis through weeks 1–5, and the sauna twice a week in weeks 2–5", () => {
    rows.slice(0, 5).forEach((r) => {
      const rx = rowRx(r, true);
      expect(rx.neckSat).toBe(1); expect(rx.holdsPlus).toBe(1);
      expect(rx.copen).toBe(3); expect(rx.suit).toBe(3);
      expect(rx.bsets).toBe(2); expect(rx.pp.sets).toBe(2); expect(rx.broad).toBe(2);
      expect(rx.jump).toBe(r.idx <= 2 ? "land" : "lowbox");
      expect(!!rx.sauna).toBe(r.idx >= 2);
    });
    ["S", "FW"].forEach((id) => { const rx = rowRx(rows.find((r) => r.id === id), true); expect(rx.neckSat).toBeFalsy(); expect(rx.sauna).toBeFalsy(); });
  });

  it("weighs in on Friday 27 November and fights on Saturday 28 November", () => {
    const fw = rowRx(rows[6], true);
    expect(fw.fightDay).toBe("sat"); expect(fw.weighIn).toBe("before"); expect(fw.fightIso).toBe("2026-11-28");
  });
});

/* ---------------- 4 · Prep fitted ---------------- */
describe("proof 4 — Prep fitted by the N table", () => {
  it("with 14 weeks is Optimal 8 · Prep, every calendar row", () => {
    const s = buildSeason({ plans: [plan("2026-09-28", "2026-09-28", { fight: "2027-03-13", rounds: 6, mins: 3, fitness: "good" })], today: "2026-09-28" });
    const prep = s.rows.filter((r) => r.program === "prep" && r.mon < "2027-01-04");
    expect(prep.map((r) => r.id)).toEqual(Array.from({ length: 14 }, (_, i) => "P" + (i + 1)));
    /* the calendar is the fourteen weeks by number: Wk · Block · emphasis */
    const doc = tableAfter(prepMd, /^## THE CALENDAR/).filter((r) => /^\d+$/.test(r[0]));
    expect(doc.length).toBe(14);
    prep.forEach((r, i) => {
      const rx = rowRx(r, true), d = doc[i], em = d[2];
      expect(Number(d[0])).toBe(r.doc);
      expect(rx.doc).toBe(i + 1);
      const lm = em.match(/(\d+) × (\d+|\(2\+2\)) @ (\d+)/);
      /* test week loads nothing: the top triples set the working maxes */
      if (!lm) { expect(r.doc).toBe(14); expect(rx.sets).toBe(0); expect(rx.pct).toBe(null); expect(em).toMatch(/top triple/); }
      else { expect(String(rx.sets)).toBe(lm[1]); expect(String(rx.reps).replace("2+2", "(2+2)")).toBe(lm[2]); expect(rx.pct).toBe(Number(lm[3])); }
      const base = em.match(/Base (\d+)/); if (base) expect(rx.base).toBe(Number(base[1]));
      const sun = em.match(/Sun 6 × 3(?: scored)?, (\d+) s/); if (sun) { expect(rx.rest).toBe(Number(sun[1])); expect(rx.sim).toBeGreaterThan(0); }
      if (/Sun 20-minute test|20-minute test,|the 20-minute test/.test(em)) expect(rx.t20).toBe(/Sun 20-minute test/.test(em) ? "sun" : "thu");
      expect(!!rx.scored).toBe(/scored/.test(em));
      expect(rx.em).toBe(prepEmphasis(r.doc) + (i === 0 ? "" : ""));
    });
    /* test day on P14's Saturday, the camp the Monday after */
    expect(prep[13].mon).toBe("2026-12-28");
    expect(campRows(s)[0].mon).toBe("2027-01-04");
    expect(campRows(s)[0].camp.fitness).toBe("good");
  });

  it("runs the bench from week 1 in the trap bar's phases, and the Christmas week at three-quarters", () => {
    const s = buildSeason({ plans: [plan("2026-09-28", "2026-09-28", { fight: "2027-03-13" })], today: "2026-09-28" });
    const prep = s.rows.filter((r) => r.program === "prep" && r.mon < "2027-01-04").map((r) => rowRx(r, true));
    expect(prep.map((rx) => rx.bench.ph)).toEqual(["slow", "slow", "slow", "normal", "normal", "paused", "paused", "fast", "top", "fast", "contrast", "contrast", "contrast", "top"]);
    expect(prep.map((rx) => rx.dips)).toEqual(["6–8", "6–8", "6–8", "6–8", "6–8", "4–6", "4–6", "4–6", "4–6", "light", "4–5", "4–5", "4–5", "light"]);
    /* P13 is written as Christmas week; elsewhere the rule takes a quarter off */
    const xmas = buildSeason({ plans: [plan("2026-10-05", "2026-10-05", { fight: "2027-03-20" })], today: "2026-10-05" }).rows.find((r) => r.program === "prep" && r.doc === 12);
    const rx = rowRx(xmas, true);
    expect(rx.xmas).toBe(1); expect([rx.circ, rx.dr, rx.carry]).toEqual([2, 2, 2]); expect(rx.bench.sets).toBe(2);
  });

  it("with 4 weeks gives P4, P7, P8, P14 — Worked Example 2", () => {
    expect(prepLayout(4)).toEqual([["P4", "P7", "P8", "P14"]]);
    const ex1 = plan("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, fitness: "low", emphasis: "durability" });
    const march = plan("2026-12-07", "2026-12-02", { fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, fitness: "low", emphasis: "none" });
    const s = buildSeason({ plans: [ex1, march], today: "2026-12-02" });
    const after = s.rows.filter((r) => r.mon >= "2026-11-30");
    expect(after.slice(0, 5).map((r) => r.program + ":" + r.id)).toEqual(["transition:T", "prep:P4", "prep:P7", "prep:P8", "prep:P14"]);
    expect(after.slice(1, 5).map((r) => r.mon)).toEqual(["2026-12-07", "2026-12-14", "2026-12-21", "2026-12-28"]);
    const p4 = rowRx(after[1], true), p7 = rowRx(after[2], true), p8 = rowRx(after[3], true);
    expect(p4.sc).toBe("5 × 5 @ 75%"); expect(p4.bench.sc).toBe("NORMAL TEMPO · 4 × 5 @ 75%"); expect(p4.profile).toBe(1);
    expect(p7.sc).toBe("4 × 3 @ 84%"); expect(p7.bench.sc).toBe("PAUSED · 3 × 3 @ 84%");
    expect(p8.xmas).toBe(1);
    /* the camp — the master, ten weeks, good fitness off test day */
    const camp = s.rows.filter((r) => r.program === "camp" && r.mon >= "2027-01-04");
    expect(camp.map((r) => r.id)).toEqual(["F", "B1", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"]);
    expect(camp[0].camp.fitness).toBe("good");
  });

  it("follows the decision table and the shortening tables", () => {
    expect(campLayout(9, "good").ids).toEqual(["F", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"]);
    expect(campLayout(6, "moderate").ids).toEqual(["F", "B2", "P1", "P3", "S", "FW"]);
    expect(campLayout(6, "low")).toEqual({ ids: ["F1", "F", "E1", "E2", "S", "FW"], short: true });
    expect(campLayout(5, "good")).toEqual({ ids: ["F", "E1", "E2", "S", "FW"], short: true });
    expect(prepLayout(17)[0].slice(4, 7)).toEqual(["P4b", "P4c", "P5"]);
    expect(prepLayout(20).map((x) => x.length)).toEqual([16, 4]);
    expect(prepLayout(3)).toEqual([]);
  });
});

/* ---------------- 4 · the comeback, and a re-plan carried on ---------------- */
describe("proof 4 — the comeback: Worked Example 3, and a re-plan inside Prep carried on", () => {
  const WE3 = { fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "low", emphasis: "power" };
  const his = buildSeason({ plans: [plan("2026-10-26", "2026-10-25", WE3)], today: "2026-10-25" });
  const prep = his.rows.filter((r) => r.program === "prep" && r.mon < "2027-01-04");
  it("from low fitness, not after a fight, Prep starts at its week 1: the comeback table, as season-builder.md writes it", () => {
    const doc = tableAfter(builderMd, /^\*\*From low fitness — THE COMEBACK/);
    expect(doc.length).toBe(11);
    doc.forEach(([n, ids]) => expect(n === "14" ? P14() : ids.split(" · ")).toEqual(COMEBACK_N[Number(n)]));
    expect(prepLayout(10, true)).toEqual([COMEBACK_N[10]]);
    function P14() { return Array.from({ length: 14 }, (_, i) => "P" + (i + 1)); }
  });
  it("is Worked Example 3 week by week, and the Prep page's own table", () => {
    const ex = tableAfter(builderMd, /^## WORKED EXAMPLE 3/), pg = tableAfter(prepMd, /^\*\*This year — the comeback/);
    expect(prep.map((r) => r.id)).toEqual(ex.map((d) => d[1]));
    expect(prep.map((r) => r.id)).toEqual(pg.map((d) => "P" + d[1]));
    const DM = (iso) => { const d = new Date(iso + "T12:00:00"); return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]; };
    expect(prep.map((r) => DM(r.mon))).toEqual(ex.map((d) => d[0]));
    expect(pg.map((d) => d[0])).toEqual(ex.map((d) => d[0]));
    const camp = his.rows.filter((r) => r.program === "camp");
    expect(camp[0].mon).toBe("2027-01-04"); expect(camp.map((r) => r.id)).toEqual(["F", "B1", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"]);
    expect(camp[0].camp.fitness).toBe("good"); expect(camp[0].camp.emphasis).toBe("power");
  });
  it("eases back in: the first two weeks a round short and the sprints at 90%, the Nordics 2 × 3, 2 × 4, 3 × 4, then the calendar's", () => {
    const rx = prep.map((r) => rowRx(r, true));
    expect(rx.slice(0, 4).map((x) => [x.circ, x.dr, x.carry].join("/"))).toEqual(["2/3/2", "2/3/2", "3/4/3", "2/3/2"]);
    expect(rx.slice(0, 4).map((x) => !!x.spr90)).toEqual([true, true, false, false]);
    expect(rx.slice(0, 5).map((x) => x.nor.join(" × "))).toEqual(["2 × 3", "2 × 4", "3 × 4", "2 × 3", "3 × 5"]);
    expect(rx[1].spr).toBe(4);
    /* the profiles: week 1 and P10; the Christmas week is P13, as written */
    expect(prep.filter((r) => r.profile).map((r) => r.id)).toEqual(["P1", "P10"]);
    expect(rx[8].xmas).toBe(1); expect(rx[8].vol34).toBeFalsy();
  });
  it("is the N table, not the comeback, after a fight's transition or from good fitness", () => {
    const good = buildSeason({ plans: [plan("2026-10-26", "2026-10-25", Object.assign({}, WE3, { fitness: "good" }))], today: "2026-10-25" });
    expect(good.rows.filter((r) => r.program === "prep" && r.mon < "2027-01-04").map((r) => r.id)).toEqual(prepLayout(10)[0]);
    expect(good.rows.some((r) => r.comeback)).toBe(false);
  });
  const moved = (from, made, fight, extra) => buildSeason({ plans: [plan("2026-10-26", "2026-10-25", WE3), plan(from, made, Object.assign({}, WE3, { fight }, extra || {}))], today: made });
  it("carries a re-plan on from the week you're on: 10 April entered on 12 November", () => {
    const s = moved("2026-11-16", "2026-11-12", "2027-04-10");
    const before = (rows) => rows.filter((r) => r.mon < "2026-11-16").map((r) => r.id + ":" + r.mac + r.kw);
    expect(before(s.rows)).toEqual(before(his.rows));
    const p = s.rows.filter((r) => r.program === "prep" && r.mon < "2027-02-01");
    expect(p.map((r) => r.id)).toEqual(["P1", "P2", "P4", "P4b", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13", "P14"]);
    expect(p.map((r) => r.pk)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(p.filter((r) => r.profile).map((r) => r.id)).toEqual(["P1", "P10"]);
    expect(rowRx(p[3], true).pct).toBe(77.5);
    expect(s.rows.find((r) => r.program === "camp").mon).toBe("2027-02-01");
    expect(builderMd).toMatch(/keeps P1, P2 and P4, then runs P4 again at \+2\.5%, P5 to P14 — fourteen weeks in all — and the camp from Monday 1 February/);
  });
  it("shortens from the week you're on, by the table's order, when the fight comes closer — and an answer that isn't the date changes nothing in the weeks", () => {
    const s = moved("2026-11-16", "2026-11-12", "2027-02-27");
    expect(s.rows.filter((r) => r.program === "prep" && r.mon < "2026-12-21").map((r) => r.id)).toEqual(["P1", "P2", "P4", "P5", "P7", "P9", "P10", "P14"]);
    const e = moved("2026-11-09", "2026-11-04", "2027-03-13", { emphasis: "strength" });
    expect(e.rows.filter((r) => r.program === "prep" && r.mon < "2027-01-04").map((r) => r.id)).toEqual(prep.map((r) => r.id));
    /* too few weeks left after a heavy week: the last heavy week again, never the easy week */
    const late = moved("2026-12-21", "2026-12-17", "2027-04-10");
    expect(late.rows.filter((r) => r.program === "prep" && r.mon < "2027-02-01").map((r) => r.id)).toEqual(["P1", "P2", "P4", "P5", "P6", "P7", "P9", "P10", "P7", "P7", "P11", "P12", "P13", "P14"]);
  });
});

/* ---------------- 2 · no fight: the fight called off, the comeback, starting again ---------------- */
describe("proof 2 — no fight: a Prep that's running carries on, a new cycle eases you in from low fitness, START AGAIN", () => {
  const WE3 = { fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "low", emphasis: "power" };
  const march = plan("2026-10-26", "2026-10-25", WE3);
  const his = buildSeason({ plans: [march], today: "2026-10-25" });
  /* Settings keeps the other answers when the fight goes: fitness low stays */
  const off = (from, made) => buildSeason({ plans: [march, plan(from, made, Object.assign({}, WE3, { booked: false, fight: null }))], today: made });
  const ids = (s, a, b) => s.rows.filter((r) => r.mon >= a && (!b || r.mon < b)).map((r) => r.id);
  const lived = (rows, before) => rows.filter((r) => r.mon < before).map((r) => r.program + ":" + r.id + ":" + r.mac + r.kw);
  const cr = (r) => { const x = rowRx(r, true); return [x.circ, x.dr, x.carry].join("/"); };

  it("the fight called off on Thursday 3 December: the weeks done stay done, and Prep carries on in the cycle's own order to its test week", () => {
    const s = off("2026-12-07", "2026-12-03");
    expect(lived(s.rows, "2026-12-07")).toEqual(lived(his.rows, "2026-12-07"));
    expect(ids(s, "2026-12-07", "2027-02-01")).toEqual(["P8", "P9", "P10", "P11", "P12", "P12b", "P13", "P14"]);
    expect(prepRunOn(["P1", "P2", "P4", "P5", "P6", "P7"])).toEqual(["P8", "P9", "P10", "P11", "P12", "P12b", "P13", "P14"]);
    const p14 = s.rows.find((r) => r.mon === "2027-01-25");
    expect(p14.id).toBe("P14"); expect(rowRx(p14, true).em).toMatch(/Sat 30 Jan TEST DAY/);
    /* then the cycle, on repeat, from the Monday after test day */
    expect(ids(s, "2027-02-01", "2027-05-24")).toEqual(CYCLE16);
    expect(s.rows.find((r) => r.mon === "2027-02-01").cycle).toBe(1);
    /* one stretch with the weeks done: the same Prep, its ramp counted on, no profiles redrawn until P10 */
    const prep = s.rows.filter((r) => r.mon < "2027-02-01");
    expect([...new Set(prep.map((r) => r.plan + "|" + r.seg))]).toEqual(["2026-10-26|1"]);
    expect(prep.map((r) => r.pk)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(prep.filter((r) => r.profile).map((r) => r.id)).toEqual(["P1", "P10"]);
    /* P10, the easy week, is Christmas week: three-quarters volume */
    const p10 = rowRx(s.rows.find((r) => r.id === "P10"), true);
    expect(p10.xmas).toBe(1); expect(p10.vol34).toBe(1);
    expect(describeSeason(s, "2026-12-07")).toMatch(/^Prep carries on: P8 · P9 · P10 · P11 · P12 · P12b · P13 · P14, test day Sat,? 30 Jan; then Prep's 16-week cycle from Mon,? 1 Feb\.$/);
    expect(builderMd).toMatch(/If the fight is called off\*\*, set on Thursday 3 December: the plan re-made from Monday 7 December keeps the six weeks done and carries on with P8, P9, P10, P11, P12, P12b, P13 and P14 — test day Saturday 30 January — then the 16-week cycle from Monday 1 February/);
  });
  it("called off inside the ramp, the ramp counts on", () => {
    const s = off("2026-11-09", "2026-11-05");
    expect(ids(s, "2026-10-26", "2027-02-15")).toEqual(["P1", "P2", "P3", "P4", "P4b", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P12b", "P13", "P14"]);
    const rx = s.rows.filter((r) => r.mon >= "2026-11-09").slice(0, 2).map((r) => rowRx(r, true));
    expect(rx.map((x) => x.nor.join(" × "))).toEqual(["3 × 4", "3 × 5"]);
    expect(rx[0].em).toMatch(/the last week of the ramp/); expect(rx.map((x) => !!x.spr90)).toEqual([false, false]);
  });
  it("called off in the camp, the cycle starts at week 1; straight after Prep's test week, at its own numbers", () => {
    const camp = off("2027-02-01", "2027-01-28");
    expect(ids(camp, "2027-01-04", "2027-02-01")).toEqual(["F", "B1", "B2", "B3"]);
    expect(ids(camp, "2027-02-01", "2027-05-24")).toEqual(CYCLE16);
    const test = off("2027-01-04", "2026-12-31");
    expect(ids(test, "2027-01-04", "2027-04-26")).toEqual(CYCLE16);
    expect(test.rows.filter((r) => r.mon >= "2027-01-04").some((r) => r.comeback)).toBe(false);
  });
  it("from low fitness, a new cycle eases you in as a comeback's first weeks do — not after a fight's transition, not from good fitness, and the next cycle as written", () => {
    const low = buildSeason({ plans: [plan("2026-10-26", "2026-10-25", { booked: false, fitness: "low" })], today: "2026-10-25" });
    const c1 = low.rows.slice(0, 16), c2 = low.rows.slice(16, 32);
    expect(c1.map((r) => r.id)).toEqual(CYCLE16); expect(c2.map((r) => r.id)).toEqual(CYCLE16);
    const rx = c1.slice(0, 4).map((r) => rowRx(r, true));
    expect(c1.slice(0, 4).map(cr)).toEqual(["2/3/2", "2/3/2", "3/4/3", "3/4/3"]);
    expect(rx.map((x) => !!x.spr90)).toEqual([true, true, false, false]);
    expect(rx.map((x) => x.nor.join(" × "))).toEqual(["2 × 3", "2 × 4", "3 × 4", "3 × 5"]);
    expect(c2.some((r) => r.comeback)).toBe(false);
    expect(describeSeason(low, "2026-10-26")).toMatch(/^Prep's 16-week cycle from Mon,? 26 Oct, easing you back in\.$/);
    const good = buildSeason({ plans: [plan("2026-10-26", "2026-10-25", { booked: false })], today: "2026-10-25" });
    expect(good.rows.some((r) => r.comeback)).toBe(false);
    /* after Worked Example 1's fight and its transition, from low fitness: the cycle as written */
    const ex1 = plan("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" });
    const after = buildSeason({ plans: [ex1, plan("2026-11-30", "2026-11-29", { booked: false, fitness: "low" })], today: "2026-11-29", head: () => ({ a: "no", at: "2026-11-29" }) });
    expect(ids(after, "2026-11-30", "2026-12-14")).toEqual(["T", "P1"]);
    expect(after.rows.some((r) => r.comeback)).toBe(false);
  });
  it("START AGAIN: week 1 from the plan's Monday — eased in from low, the next cycle's number; carrying on, a re-plan changes nothing in the weeks", () => {
    const cyc = plan("2026-10-26", "2026-10-25", { booked: false });
    const base = buildSeason({ plans: [cyc], today: "2026-12-31" });
    const again = buildSeason({ plans: [cyc, plan("2027-01-04", "2026-12-31", { booked: false, fitness: "low", restart: true })], today: "2026-12-31" });
    expect(ids(again, "2026-10-26", "2027-01-04")).toEqual(CYCLE16.slice(0, 10));
    expect(ids(again, "2027-01-04", "2027-04-26")).toEqual(CYCLE16);
    const first = again.rows.find((r) => r.mon === "2027-01-04");
    expect(first.cycle).toBe(2); expect(first.comeback).toBe(1); expect(first.profile).toBe(true);
    const on = buildSeason({ plans: [cyc, plan("2027-01-04", "2026-12-31", { booked: false, fitness: "moderate" })], today: "2026-12-31" });
    const key = (s) => s.rows.slice(0, 40).map((r) => r.mon + ":" + r.id + ":" + (r.cycle || "") + ":" + r.mac + r.kw);
    expect(key(on)).toEqual(key(base));
    expect([...new Set(on.rows.filter((r) => r.mon < "2027-02-15").map((r) => r.plan))]).toEqual(["2026-10-26"]);
    /* with a fight booked: the Prep laid out again from low fitness, by the comeback table */
    const fresh = buildSeason({ plans: [march, plan("2026-11-30", "2026-11-26", Object.assign({}, WE3, { restart: true }))], today: "2026-11-26" });
    expect(ids(fresh, "2026-11-30", "2027-01-04")).toEqual(COMEBACK_N[5]);
    expect(fresh.rows.find((r) => r.mon === "2026-11-30").pk).toBe(1);
    expect(fresh.rows.find((r) => r.program === "camp").mon).toBe("2027-01-04");
  });
});

/* ---------------- the transition and the head check ---------------- */
describe("the transition, with the head check", () => {
  const ex1 = plan("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" });
  const after = (head, today) => buildSeason({ plans: [ex1], today, head }).rows.filter((r) => r.mon >= "2026-11-30").slice(0, 4);
  it("runs one week after a fight of 9 minutes or less, two after a longer one, then Prep", () => {
    expect(after(null, "2026-12-02").map((r) => r.id)).toEqual(["T", "P1", "P2", "P3"]);
    const long = buildSeason({ plans: [plan("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 6, mins: 3, fitness: "low" })], today: "2026-12-02" });
    expect(long.rows.filter((r) => r.mon >= "2026-11-30").slice(0, 3).map((r) => r.id)).toEqual(["T", "T", "P1"]);
  });
  it("holds the transition until the head check is answered; NO starts it", () => {
    expect(after(() => null, "2026-12-08").map((r) => r.id)).toEqual(["HOLD", "HOLD", "T", "P1"]);
    expect(after(() => ({ a: "no", at: "2026-11-29" }), "2026-12-08").map((r) => r.id)).toEqual(["T", "P1", "P2", "P3"]);
  });
  it("YES holds it until a doctor has cleared you, then starts it the Monday after", () => {
    expect(after(() => ({ a: "yes", at: "2026-11-29" }), "2026-12-15").map((r) => r.id)).toEqual(["HOLD", "HOLD", "HOLD", "T"]);
    expect(after(() => ({ a: "yes", at: "2026-11-29", cleared: "2026-12-09" }), "2026-12-15").map((r) => r.id)).toEqual(["HOLD", "HOLD", "T", "P1"]);
  });
  it("keeps the transition's own week keys whatever the answer", () => {
    const held = buildSeason({ plans: [ex1], today: "2026-12-08", head: () => null }).rows;
    expect(held.filter((r) => r.hold).map((r) => r.mac + r.kw)).toEqual(["H1", "H2"]);
    expect(held.find((r) => r.id === "T").mac + held.find((r) => r.id === "T").kw).toBe("T1");
  });
});

/* ---------------- re-planning ---------------- */
describe("changing an input re-plans from today forward and keeps the history", () => {
  const first = plan("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, fitness: "low", emphasis: "durability" });
  const second = plan("2026-11-02", "2026-10-29", { fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, fitness: "low", emphasis: "power" });
  it("leaves every week before the re-plan as it was lived, and re-plans from the Monday after", () => {
    const a = buildSeason({ plans: [first], today: "2026-10-29" }).rows, b = buildSeason({ plans: [first, second], today: "2026-10-29" }).rows;
    const before = (rows) => rows.filter((r) => r.mon < "2026-11-02").map((r) => r.program + ":" + r.id + ":" + r.mac + r.kw);
    expect(before(b)).toEqual(before(a));
    /* the weeks left, by the tables — four from low fitness is the short-notice camp — carried on, not restarted: no week-1 tests */
    const rest = b.filter((r) => r.mon >= "2026-11-02" && r.program === "camp");
    expect(rest.map((r) => r.id)).toEqual(campLayout(4, "low").ids);
    expect(rest[0].camp.emphasis).toBe("power"); expect(rowRx(rest[0], true).emphasis).toBe("power");
    expect(rowRx(rest[0], true).nasal).toBeFalsy(); expect((rowRx(rest[0], true).tests || {}).tue).toBeFalsy();
  });
});

/* ---------------- 6 · the safety scan, the prescriptions ---------------- */
describe("proof 6 — no released weights, no true maxes, no depth jumps before the ramp allows them", () => {
  it("scans every generated week, for every fitness level, format and emphasis", () => {
    const bad = [];
    let weeks = 0;
    GRID.forEach((g) => [true, false].forEach((edge) => buildSeason({ plans: g.plans, today: g.today }).rows.forEach((r) => {
      if (r.program === "prep" && (r.cycle || 1) > 1) return;
      const rx = rowRx(r, edge); weeks++;
      const where = g.fitness + "/" + g.emphasis + "/" + g.rounds + "x" + g.mins + "/" + g.weeks + "wk/" + r.program + ":" + r.id + "#" + (r.idx || r.doc);
      /* the reactive slot is a stage, never a released weight */
      if (rx.jump != null && ["land", "lowbox", "depth"].indexOf(rx.jump) < 0) bad.push(where + " jump " + rx.jump);
      /* no true max anywhere in the week */
      const txt = JSON.stringify(rx);
      if (/max single|maxSq|maxBe|"max"|1RM|AEL|drop jump/i.test(txt)) bad.push(where + " " + (txt.match(/max single|maxSq|maxBe|"max"|1RM|AEL|drop jump/i) || [])[0]);
      if (rx.jump !== "depth") return;
      /* full depth jumps only where the ramp allows them */
      if (r.program === "prep" && !(r.doc >= 11 && r.doc <= 13) && !(r.doc === 14 && r.depthTrained)) bad.push(where + " depth jumps in Prep week " + r.doc);
      if (r.program === "camp") {
        const c = r.camp;
        if (c.fitness === "low" && r.idx < 4) bad.push(where + " depth jumps before week 4 from low fitness");
        if (/^E\d/.test(r.id)) bad.push(where + " depth jumps in an engine week");
        if (c.emphasis === "durability" && r.idx - 1 <= c.lastHard) bad.push(where + " depth jumps under the durability emphasis");
      }
      if (r.program === "transition" || r.program === "pre") bad.push(where + " depth jumps outside the program");
    })));
    expect(weeks).toBeGreaterThan(20000);
    expect(bad.slice(0, 20)).toEqual([]);
  }, 300000);
});

/* ---------------- 6 · the weight plan ----------------
   season-builder.md's test 6: Making Weight's proof tests, exactly — they
   run in weight.test.js, weight-food.test.js and weight-ui.test.jsx, in the
   build — and here, Worked Example 1 with its limit: the food runs by
   Making Weight's worked example, the training untouched by it. */
describe("proof 6 — the weight plan", () => {
  const WE1 = { fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" };
  const strip = (s) => JSON.stringify(s.rows.map((r) => Object.assign({}, r, { inputs: undefined, under: undefined, camp: r.camp ? Object.assign({}, r.camp, { inputs: undefined }) : r.camp })));
  it("Worked Example 1 with limit 76, tolerance 1, natural weight 80: the same seven weeks, week for week", () => {
    const a = buildSeason({ plans: [plan("2026-10-12", "2026-10-08", WE1)], today: "2026-10-08" });
    const b = buildSeason({ plans: [plan("2026-10-12", "2026-10-08", Object.assign({}, WE1, { limit: 76, tol: 1, natural: 80 }))], today: "2026-10-08" });
    expect(campRows(b).map((r) => r.id)).toEqual(["F1", "F", "B2", "P1", "P3", "S", "FW"]);
    expect(strip(b)).toBe(strip(a));
    expect(builderMd).toMatch(/limit 76 kg, tolerance 1 kg, natural weight 80 kg \(the food runs by Making Weight's worked example; the training below is untouched by it\)/);
  });
  it("and its weight plan is Making Weight's worked example: ceiling 77.0, aims to 77.5, Step 2", () => {
    const cfg = weightCfg(Object.assign({ booked: true }, WE1, { limit: 76, tol: 1, natural: 80 }));
    const p = runPlan({ draws: [{ at: "2026-10-11", cfg }], weights: { "2026-10-11": 83.0 }, today: "2026-10-11" });
    expect(p.line.C).toBe(77.0);
    expect(p.line.aims.map((x) => Math.round(x * 10) / 10)).toEqual([81.1, 79.2, 78.8, 78.3, 77.9, 77.5]);
    expect(p.line.firstStep).toBe(2);
  });
});
