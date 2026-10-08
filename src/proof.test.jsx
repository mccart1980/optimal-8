import { describe, it, expect } from "vitest";
import campMd from "../optimal-8-camp.md?raw";
import prepMd from "../optimal-8-prep.md?raw";
import builderMd from "../season-builder.md?raw";
import { sessionCatalog, seasonWeeks } from "./App.jsx";

/* ================================================================
   THE PROOF, CONTINUED — the session pages the builder generates.
   1 · the master camp's session pages, as Optimal 8 · Camp writes them
   3 · Worked Example 1's pages: two-thirds, engine-first, durability
   5 · nothing invented: every exercise, load and session type in every
       generated week is written in Prep, the Camp or season-builder.md
   ================================================================ */
const CAT = sessionCatalog(null).filter((c) => c.program !== "fighter");
const cards = (set, week, day, edge) => CAT.filter((c) => c.set === set && c.row === "camp" && c.week === week && c.day === day && c.edge === (edge !== false));
const pres = (set, week, day, name) => { const c = cards(set, week, day).find((x) => x.n === name); return c ? c.pres : null; };
const has = (set, week, day, name) => cards(set, week, day).some((x) => x.n === name);

describe("proof 1 — the master camp's session pages", () => {
  const W = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  it("Monday: the base 45 (30 in weeks 5 and 9), the neck, the hands, the catch, the ring rows", () => {
    W.forEach((w) => {
      expect(pres("master", w, "mon", "Easy, nose only")).toMatch(new RegExp("^" + (w === 5 || w === 9 ? 30 : 45) + " min"));
      expect(pres("master", w, "mon", "Neck")).toBe("holds 3 × 10 s · rapid tense 4 × 6 per direction · perturbation 2 × 20 s");
      expect(pres("master", w, "mon", "Hands")).toBe("3 × 20 s · 2 × 15");
      expect(pres("master", w, "mon", "Band Deceleration Catch")).toBe("2 × 8 per arm");
      expect(pres("master", w, "mon", "Ring Rows")).toMatch(/^3 sets/);
    });
  });
  it("Tuesday: broad jumps 3 × 2, box jumps 3 × 3 (4 × 3 in weeks 6–8), shuttles from week 3, speed from week 6, the pistol line, the holds, the trunk", () => {
    W.filter((w) => w !== 9).forEach((w) => {
      expect(pres("master", w, "tue", "Broad jump")).toMatch(/^3 × 2/);
      expect(pres("master", w, "tue", "Box jump")).toMatch(new RegExp("^" + (w >= 6 ? 4 : 3) + " × 3"));
      expect(has("master", w, "tue", "Shuttle bursts")).toBe(w >= 3);
      expect(has("master", w, "tue", "Flying sprint 20 m")).toBe(w >= 6);
      expect(pres("master", w, "tue", "The Pistol Line")).toMatch(/^2 × 5 per leg/);
      expect(pres("master", w, "tue", "Spanish Squat Hold")).toMatch(/^3 × 30 seconds/);
      expect(pres("master", w, "tue", "Pallof press")).toMatch(/^3 × 10 per side/);
      expect(pres("master", w, "tue", "Ab wheel rollout")).toMatch(/^3 × 8–12/);
      expect(pres("master", w, "tue", "Copenhagen plank")).toMatch(/^2 × 30 s per side/);
      expect(pres("master", w, "tue", "Seated calf raise")).toMatch(/^3 × 12/);
    });
    expect(has("master", 1, "tue", "THE BURST TEST")).toBe(true);
    expect(has("master", 5, "tue", "THE RETESTS")).toBe(false);
  });
  it("Wednesday: the sled, the drive holds through week 8, the trap bar and bench in their phases, chins, Nordics, neck holds", () => {
    const tb = { 1: /^3 × 5 · 72%/, 2: /^3 × 3 · 78%/, 3: /^4 × 3 · 82%/, 4: /^FAST, IN CLUSTERS · 5 × \(2\+2\) · 87%/, 5: /^2 × 3 · 65%/, 9: /^2 × 2 · 80%/ };
    W.forEach((w) => {
      const sledName = [2, 4, 6, 8].indexOf(w) >= 0 ? "Repeat Sled Starts" : "Heavy Sled";
      expect(has("master", w, "wed", sledName)).toBe(true);
      if (sledName === "Heavy Sled") expect(pres("master", w, "wed", "Heavy Sled")).toMatch(new RegExp("^" + (w === 5 || w === 9 ? 3 : 5) + " × 20 m"));
      expect(has("master", w, "wed", "Drive Holds + Punch-Position Holds")).toBe(w <= 8);
      if (tb[w]) expect(pres("master", w, "wed", "Trap Bar Deadlift")).toMatch(tb[w]);
      expect(pres("master", w, "wed", w === 9 ? "Weighted Chin-Ups + The Muscle-Up Line" : "Weighted chin-up")).toMatch(new RegExp("^" + (w === 9 ? 2 : 3) + " × 5"));
      expect(pres("master", w, "wed", "Nordic Curls")).toMatch(new RegExp("^" + (w === 5 || w === 9 ? "2 × 3" : "3 × 5")));
      expect(pres("master", w, "wed", "Neck — holds only")).toBe("3 × 10 s each direction");
    });
    [6, 7, 8].forEach((w) => expect(pres("master", w, "wed", "Trap Bar Deadlift")).toMatch(new RegExp("^CONTRAST · 3 × 2 @ " + { 6: 85, 7: 87, 8: 88 }[w] + "%")));
    expect(pres("master", 8, "wed", "Bench contrast")).toMatch(/^CONTRAST · 2 rounds · 2 @ 88%/);
    expect(pres("master", 1, "wed", "Bench Press")).toMatch(/^SLOW LOWERING · 3 × 5 · 72%/);
    expect(pres("master", 4, "wed", "Bench Press")).toMatch(/^FAST · 4 × 2 · 87%/);
  });
  it("Thursday: the throws, the split squat (2 sets in weeks 5 and 9), the holds, the session from the table", () => {
    const eng2 = { 1: "TEMPO INTERVALS", 2: "40-SECOND REPEATS · 2 × 6", 3: "THRESHOLD", 4: "ROUNDS ON THE ERG · 7 × 3", 5: "EASY", 6: "40-SECOND REPEATS · 2 × 6", 7: "ROUNDS ON THE ERG · 8 × 3", 8: "REPEAT BURSTS", 9: "FIGHT-PACE ROUNDS" };
    W.forEach((w) => {
      expect(has("master", w, "thu", eng2[w])).toBe(true);
      expect(pres("master", w, "thu", "Split Squat — rear foot elevated")).toMatch(new RegExp("^" + (w === 5 || w === 9 ? 2 : 3) + " × 6–8"));
      if (w !== 9) expect(pres("master", w, "thu", "Rotational shot-put")).toMatch(new RegExp("^2 × 3 per side · " + (w <= 5 ? "5–6" : "3–5") + " kg"));
    });
    expect(pres("master", 4, "thu", "ROUNDS ON THE ERG · 7 × 3")).toMatch(/^7 × 3 minutes .* 60 seconds between/);
    expect(pres("master", 9, "thu", "FIGHT-PACE ROUNDS")).toBe("4 × 3 minutes at fight pace, 60 seconds between, and stop");
  });
  it("Saturday: stance starts, close and plant, the sprints, the reactive jumps, the side bounds, the squat, the push press", () => {
    W.filter((w) => w !== 9).forEach((w) => {
      expect(pres("master", w, "sat", "Stance Starts")).toMatch(/^3 × 10 m/);
      expect(pres("master", w, "sat", "Close and Plant")).toMatch(/^3 × 5 m/);
      expect(pres("master", w, "sat", "Flying Sprints")).toMatch(new RegExp("^" + (w === 1 ? 4 : w === 5 ? 3 : 5) + " × 20 m"));
      expect(pres("master", w, "sat", w >= 6 ? "Depth Jumps" : "Loaded Drop Jumps")).toMatch(w >= 6 ? /^4 × 4/ : /^3 × 4/);
      expect(cards("master", w, "sat").find((c) => /^Side Bounds/.test(c.n)).pres).toMatch(new RegExp("^" + (w >= 6 ? 4 : 3) + " × 4 per side"));
      expect(pres("master", w, "sat", "Push Press")).toMatch(/^3 × 3|^2 × 3/);
    });
    expect(has("master", 9, "sat", "3 × 20 m @ 90%")).toBe(true);
    expect(has("master", 9, "sat", "Bench throws")).toBe(true);
    expect(pres("master", 6, "sat", "Back Squat")).toMatch(/^CONTRAST · 3 × 2 @ 85% \+ the jump circuit · 3 rounds/);
    expect(pres("master", 8, "sat", "Back Squat")).toMatch(/· 2 rounds/);
  });
  it("Sunday: the throws, the rounds from the table, the sit, the core", () => {
    const sim = { 1: "The 6 × 3 Simulation", 2: "The 6 × 3 Simulation", 5: "The 6 × 3 Simulation", 6: "The 8 × 3 Simulation", 7: "The 8 × 3 Simulation", 8: "The 10 × 3 Simulation", 9: "THE FIGHT-DAY REHEARSAL" };
    Object.keys(sim).forEach((w) => expect(has("master", Number(w), "sun", sim[w])).toBe(true));
    expect(pres("master", 1, "sun", "The 6 × 3 Simulation")).toBe("6 × 3 min · rest 60 s · SCORED");
    expect(pres("master", 8, "sun", "The 10 × 3 Simulation")).toBe("10 × 3 min · rest 60 s · SCORED");
    W.filter((w) => w !== 9).forEach((w) => {
      expect(pres("master", w, "sun", "The Four Punch Throws")).toBe("2 rounds");
      expect(pres("master", w, "sun", "Suitcase carries")).toMatch(/^2 × 30 m each side/);
      expect(pres("master", w, "sun", "Face pulls")).toMatch(/^3 × 15/);
    });
  });
  it("with the Edge off: straight sets in week 4, no Tuesday speed, the rounds back to six", () => {
    expect(cards("master", 4, "wed", false).find((c) => c.n === "Trap Bar Deadlift").pres).toMatch(/^4 × 3 · 87%/);
    expect(cards("master", 6, "tue", false).some((c) => c.n === "Flying sprint 20 m")).toBe(false);
    expect(cards("master", 8, "sun", false).some((c) => c.n === "The 6 × 3 Simulation")).toBe(true);
  });
  it("fight week: twenty easy, the microdose, nothing, the activation, the weigh-in, the fight", () => {
    expect(has("master", 10, "mon", "Easy, nose only")).toBe(true);
    expect(has("master", 10, "tue", "3 × 20 m flying sprints @ 90%")).toBe(true);
    expect(cards("master", 10, "wed").length).toBe(0);
    expect(has("master", 10, "thu", "Shadow boxing")).toBe(true);
    expect(has("master", 10, "sat", "The fight")).toBe(true);
  });
});

describe("proof 3 — Worked Example 1's session pages", () => {
  it("F1 runs at two-thirds: sets down a third, the intervals at 90%, the rounds at 90 seconds", () => {
    expect(pres("example1", 1, "tue", "Broad jump")).toMatch(/^2 × 2/);
    expect(cards("example1", 1, "tue").find((c) => /4-MINUTE/.test(c.n)).pres).toMatch(/^2 × 4 minutes HARD .* at 90% effort/);
    expect(pres("example1", 1, "thu", "TEMPO INTERVALS")).toMatch(/^6 × 1 minute/);
    expect(pres("example1", 1, "sun", "The 3 × 2 Simulation")).toBe("3 × 2 min · rest 90 s · SCORED");
    expect(pres("example1", 1, "wed", "Trap Bar Deadlift")).toMatch(/^2 × 5 · 72%/);
    expect(pres("example1", 1, "wed", "Heavy Sled")).toMatch(/^3 × 20 m/);
    expect(pres("example1", 1, "sat", "Flying Sprints")).toMatch(/^2 × 20 m · 90%/);
    expect(pres("example1", 1, "mon", "Easy, nose only")).toMatch(/^30 min/);
  });
  it("the durability emphasis: Saturday neck holds, Copenhagen and carries a set more, the holds going up", () => {
    [1, 2, 3, 4, 5].forEach((w) => {
      expect(has("example1", w, "sat", "Neck — holds only")).toBe(true);
      expect(pres("example1", w, "sun", "Suitcase carries")).toMatch(w === 1 ? /^2 × 30 m/ : /^3 × 30 m/);
      expect(pres("example1", w, "tue", "Spanish Squat Hold")).toMatch(/\+2\.5 kg if the last hold was solid/);
      expect(has("example1", w, "sat", "Depth Jumps")).toBe(false);
    });
    expect(has("example1", 6, "sat", "Neck — holds only")).toBe(false);
  });
  it("the rounds: 3 × 2, 4 × 2, 5 × 2, the double, the rehearsal, at 40 seconds a station", () => {
    expect(has("example1", 3, "sun", "The 4 × 2 Simulation")).toBe(true);
    expect(has("example1", 4, "sun", "The 5 × 2 Simulation")).toBe(true);
    expect(pres("example1", 5, "sun", "The Double")).toBe("4 × 2 min, 5 min easy, 3 × 2 min · rest 60 s · SCORED");
    expect(has("example1", 6, "sun", "THE FIGHT-DAY REHEARSAL")).toBe(true);
    expect(pres("example1", 6, "thu", "FIGHT-PACE ROUNDS")).toBe("3 × 2 minutes at fight pace, 60 seconds between, and stop");
  });
  it("puts the pre-camp check, the tests and the working-weight checks in the week before", () => {
    const pre = CAT.filter((c) => c.set === "example1" && c.row === "pre" && c.edge);
    expect(pre.some((c) => c.day === "mon" && c.n === "The Pre-Camp Check")).toBe(true);
    expect(pre.filter((c) => c.day === "sat").map((c) => c.n)).toEqual(expect.arrayContaining(["Broad jump", "Rotational throw", "Working-weight check — squat", "Working-weight check — trap bar", "Working-weight check — bench press"]));
    expect(pre.some((c) => c.day === "sun" && c.n === "The 20-Minute Test")).toBe(true);
  });
});

describe("the standing rules", () => {
  it("puts the pre-camp check in the week before every camp — P14 here, the transition in Worked Example 2", () => {
    const p14 = CAT.filter((c) => c.set === "prep14" && c.row === "prep" && c.id === "P14" && c.day === "mon" && c.edge);
    expect(p14.some((c) => c.n === "The Pre-Camp Check")).toBe(true);
    const p13 = CAT.filter((c) => c.set === "prep14" && c.row === "prep" && c.id === "P13" && c.day === "mon" && c.edge);
    expect(p13.some((c) => c.n === "The Pre-Camp Check")).toBe(false);
    expect(CAT.some((c) => c.set === "example2" && c.id === "P14" && c.n === "The Pre-Camp Check")).toBe(true);
  });
  it("runs the size block in Prep with the overhead triceps extension, and never in a camp", () => {
    expect(CAT.some((c) => c.set === "cycle" && c.n === "Overhead triceps extension" && /^3 × 10–12/.test(c.pres))).toBe(true);
    expect(CAT.some((c) => c.set === "cycle" && c.n === "Overhead triceps extension" && /^2 × 10–12/.test(c.pres))).toBe(true);
    expect(CAT.some((c) => c.set === "cycle" && c.id === "P14" && c.n === "Overhead triceps extension")).toBe(false);
    expect(CAT.some((c) => c.row === "camp" && /triceps|Hammer|Lean-away/.test(c.n))).toBe(false);
  });
});

/* ---------------- 5 · nothing invented ---------------- */
const DOCS = (prepMd + "\n" + campMd + "\n" + builderMd);
const norm = (t) => String(t).toLowerCase().replace(/[‘’']/g, "").replace(/[–—-]/g, " ").replace(/[^a-z0-9%.×]+/g, " ").replace(/\s+/g, " ");
const DOCN = norm(DOCS);
/* the library entries whose own name isn't how the pages say it, with
   the words the pages do use — each checked against the documents too */
const SAID_AS = {
  "EASY BIKE (WARM-UP)": "3 easy minutes on the bike", "BAND PULL-APARTS": "band pull aparts", "PUSH-UPS": "push ups",
  "90/90 HIP SWITCHES": "90/90 hip switches", "MEDICINE-BALL CHEST PASSES": "medicine ball chest passes", "BIKE SPRINTS (10 SECONDS)": "10 second bike sprints",
  "SPRINT BUILD-UPS": "build ups", "JUMP CHECK": "the jump check", "HEAVY SLED PUSH": "heavy sled", "PUNCH-POSITION HOLD": "punch position hold",
  "SQUAT CONTRAST CIRCUIT": "jump circuit", "BENCH CONTRAST": "bench throws", "CLUSTER SETS": "clusters", "MAX SINGLE": "max single",
  "SPLIT SQUAT, REAR FOOT ELEVATED": "split squat, rear foot elevated", "WEIGHTED CHIN-UPS": "weighted chin ups", "MUSCLE-UP LINE": "muscle up line",
  "HANDSTAND (ON PARALLETTES)": "handstand", "AB WHEEL ROLLOUTS": "ab wheel rollouts", "SUITCASE CARRY": "suitcase carries",
  "NECK FOUR-DIRECTION HOLDS": "four direction holds", "NECK RAPID TENSE": "rapid tense", "NECK PERTURBATION HOLD": "perturbation hold",
  "ROTATIONAL SHOT-PUT THROW": "rotational shot put", "MEDICINE-BALL SLAMS": "medicine ball slams", "EZ-BAR OR DUMBBELL CURLS": "curls", "CURLS": "curls",
  "EASY BASE (RIDE OR RUN)": "easy nasal ride or run", "MODERATE INTERVALS": "moderate intervals", "THE ROUNDS (FIGHT SIMULATION)": "simulation",
  "EASY HOUR / WEDNESDAY EASY THIRTY": "the easy hour", "SAUNA": "sauna", "THE 20-MINUTE TEST": "20 minute test", "BURST DECREMENT TEST": "burst decrement",
  "BROAD JUMP AND THROW TESTS": "broad jump and the rotational throw", "LOAD-VELOCITY PROFILE": "load velocity profile", "TAPE, WEIGHT AND PHOTOS": "tape",
  "THE FOUR RANGE TESTS": "range tests", "THE THREE FLEXIBILITY TESTS": "flexibility tests", "WORKING-WEIGHT CHECK": "working weight check",
  "PRE-CAMP CHECK": "pre camp check", "TRANSITION WEEK": "the transition", "LEAN-AWAY LATERAL RAISE": "lean away lateral raise", "REAR-DELT FLY": "rear delt fly",
  "PUSH-UP AND CHIN-UP TESTS": "push ups, chins", "PLANK AND COPENHAGEN TESTS": "plank, copenhagen", "THE MOVEMENT SESSION": "the movement session",
  "TRAP BAR JUMPS": "trap bar jumps", "BAND-ASSISTED JUMPS": "band assisted jumps", "LOADED DROP JUMPS": "loaded drop jumps", "SIDE BOUNDS": "side bounds",
  "SHUTTLE BURSTS": "shuttle bursts", "ACTIVATION": "activation", "SPEED MICRODOSE": "speed microdose", "THE DOUBLE": "the double",
};
const SESSION_SAID = { vo2: "4 minute intervals", rz: "repeat bursts", rz1: "bursts 1 × 8", lac: "40 second repeats", lac2: "40 s repeats 2 × 6", tempo: "tempo",
  thr: "threshold", erg: "rounds on the erg", erg8: "rounds on the erg", ergrounds: "rounds on the erg", fp: "fight pace", fightpace: "fight pace",
  easy: "20 minutes conversational", mod: "moderate" };

describe("proof 5 — nothing invented", () => {
  it("every exercise on every generated card is a library entry the three documents name", () => {
    const out = new Set();
    CAT.forEach((c) => (c.lib || []).concat(...c.rows.map((r) => r.lib || [])).forEach((e) => {
      if (!e) return;
      const said = SAID_AS[e.n] || e.n;
      if (DOCN.indexOf(norm(said)) < 0 && !e.names.some((x) => DOCN.indexOf(norm(x)) >= 0)) out.add(e.n);
    }));
    expect([...out].sort()).toEqual([]);
  });

  it("every session type in every generated week is one the documents write", () => {
    const keys = new Set();
    seasonWeeks().forEach(({ rx }) => ["eng1", "eng2", "e1", "e2"].forEach((k) => { if (rx[k]) keys.add(rx[k]); }));
    [...keys].forEach((k) => {
      expect(SESSION_SAID[k]).toBeTruthy();
      expect(DOCN.indexOf(norm(SESSION_SAID[k]))).toBeGreaterThanOrEqual(0);
    });
  });

  it("every load in every generated week is a percentage the documents write, or one their rules make (+2.5%)", () => {
    const docPct = new Set((DOCS.match(/\d+(\.\d+)?%/g) || []).map((x) => Number(x.replace("%", ""))));
    const allowed = (p) => docPct.has(p) || [2.5, 5, 7.5].some((d) => docPct.has(p - d));
    const bad = new Set();
    seasonWeeks().forEach(({ set, rx }) => {
      const lifts = [rx.tb, rx.sq, rx.bench, rx.pp].filter(Boolean);
      lifts.forEach((L) => { [L.pct, L.extra && L.extra.pct].filter((x) => x != null).forEach((p) => { if (!allowed(p)) bad.add(set + ":" + p); }); });
      if (rx.pct != null && !allowed(rx.pct)) bad.add(set + ":" + rx.pct);
    });
    CAT.forEach((c) => (String(c.pres).match(/\d+(\.\d+)?%/g) || []).forEach((x) => { const p = Number(x.replace("%", "")); if (!allowed(p)) bad.add(c.set + ":" + c.n + ":" + p); }));
    expect([...bad].sort()).toEqual([]);
  });

  it("every week is one of the documents' own weeks", () => {
    const ids = new Set(seasonWeeks().map(({ row }) => row.id));
    [...ids].forEach((id) => {
      if (id === "T" || id === "PRE") return;
      expect(DOCS.indexOf(id)).toBeGreaterThanOrEqual(0);
    });
  });
});
