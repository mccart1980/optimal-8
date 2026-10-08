import { describe, it, expect } from "vitest";
import campMd from "../optimal-8-camp.md?raw";
import prepMd from "../optimal-8-prep.md?raw";
import builderMd from "../season-builder.md?raw";
import { buildSeason, rowRx, rowDates, CYCLE16, prepLayout, campLayout } from "./builder.js";
import { campRow } from "./camp.js";
import { prepEmphasis } from "./prep.js";

/* ================================================================
   THE PROOF — season-builder.md's five tests. `npm run build` runs
   this file first and stops if any of it fails.
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
  const s = buildSeason({ plans: [plan("2027-01-04", "2027-01-04", { fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, fitness: "good", emphasis: "none", weighIn: "before" })], today: "2027-01-04" });
  const rows = campRows(s);
  const doc = tableAfter(campMd, /^## THE TEN WEEKS/);

  it("is the ten master weeks, in order, from Monday 4 January", () => {
    expect(rows.map((r) => r.id)).toEqual(["F", "B1", "B2", "B3", "E", "P1", "P2", "P3", "S", "FW"]);
    expect(rows[0].mon).toBe("2027-01-04");
    expect(doc.length).toBe(10);
  });

  it("reproduces every cell of the document's week table", () => {
    let prev = null;
    rows.forEach((r, i) => {
      const rx = rowRx(r, true), t = campRow(rx, prev), d = doc[i];
      expect([String(r.idx), rowDates(r), rx.block, t.mon, t.tue, t.wed, t.thu, t.sat, t.sun, t.nor].slice(0, d.length)).toEqual(d);
      prev = rx;
    });
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
  it("runs the size block full in weeks 1–6, half in 7–15, none in 16", () => {
    expect(s.rows.slice(0, 16).map((r) => r.size)).toEqual(["full", "full", "full", "full", "full", "full",
      "half", "half", "half", "half", "half", "half", "half", "half", "half", null]);
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
      if (/easy (\d+)/.test(wed)) expect(rx.wedEasy).toBe(n(wed, /easy (\d+)/)[0]);
      expect(rx.sauna === "starts").toBe(/sauna begins/.test(wed));
      if (/bench throws 3 × 3 · chins 2 × 5/.test(wed)) { expect(rx.tp).toBe(1); expect(rx.tb.sets + "×" + rx.tb.reps + "@" + rx.tb.pct).toBe("2×2@80"); }
      /* Thursday */
      expect(!!rx.nasal).toBe(/NASAL TEST/.test(thu));
      if (/tempo/.test(thu)) { expect(rx.eng2).toBe("tempo"); expect((rx.dose || {}).tempo || 10).toBe(n(thu, /tempo (\d+) × 1 min/)[0]); }
      if (/REPEAT BURSTS 2 × 8/.test(thu)) expect(rx.eng2).toBe("rz");
      if (/40-s repeats 2 × 6/.test(thu)) expect(rx.eng2).toBe("lac2");
      if (/at fight pace/.test(thu)) { expect(rx.eng2).toBe("fp"); expect([rx.fpR.rounds, rx.fpR.mins, rx.fpR.rest]).toEqual(n(thu, /(\d+) × (\d+) at fight pace, (\d+) s/)); }
      if (/ACTIVATION/.test(thu)) expect(rx.fightWeek).toBe(1);
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
      if (/drop jumps (\d+) × (\d+)/.test(sat)) { expect(rx.jump).toBe("AEL"); expect(rx.js).toEqual(n(sat, /drop jumps (\d+) × (\d+)/)); }
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
      expect(rx.jump).toBe("AEL");
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
    const doc = tableAfter(prepMd, /^## THE CALENDAR/).filter((r) => /^\d+$/.test(r[0]));
    expect(doc.length).toBe(14);
    prep.forEach((r, i) => {
      const rx = rowRx(r, true), d = doc[i], em = d[3];
      expect(rowDates(r)).toBe(d[1]);
      expect(rx.doc).toBe(i + 1);
      const lm = em.match(/(\d+) × (\d+|\(2\+2\)) @ (\d+)/);
      const L = Object.assign({}, rx, i === 7 ? rx : {});
      expect(String(L.sets)).toBe(lm[1]); expect(String(L.reps).replace("2+2", "(2+2)")).toBe(lm[2]); expect(L.pct).toBe(Number(lm[3]));
      const base = em.match(/Base (\d+)/); if (base) expect(rx.base).toBe(Number(base[1]));
      const sun = em.match(/Sun 6 × 3(?: scored)?, (\d+) s/); if (sun) { expect(rx.rest).toBe(Number(sun[1])); expect(rx.sim).toBeGreaterThan(0); }
      if (/Sun 20-minute test|20-minute test,|the 20-minute test/.test(em)) expect(rx.t20).toBe(1);
      expect(!!rx.scored).toBe(/scored/.test(em));
      expect(rx.em).toBe(prepEmphasis(r.doc) + (i === 0 ? "" : ""));
    });
    /* test day on P14's Saturday, the camp the Monday after */
    expect(prep[13].mon).toBe("2026-12-28");
    expect(campRows(s)[0].mon).toBe("2027-01-04");
    expect(campRows(s)[0].camp.fitness).toBe("good");
  });

  it("runs the size block full in weeks 1–5, two sets in weeks 6–13, none in week 14", () => {
    const s = buildSeason({ plans: [plan("2026-09-28", "2026-09-28", { fight: "2027-03-13" })], today: "2026-09-28" });
    expect(s.rows.filter((r) => r.program === "prep" && r.mon < "2027-01-04").map((r) => r.size)).toEqual(["full", "full", "full", "full", "full", "half", "half", "half", "half", "half", "half", "half", "half", null]);
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
    expect(p4.sc).toBe("5 × 5 @ 75%"); expect(p4.size).toBe("full"); expect(p4.profile).toBe(1);
    expect(p7.sc).toBe("4 × 3 @ 84%"); expect(p7.benchDoc).toBe(6);
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
