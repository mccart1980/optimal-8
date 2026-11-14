import { describe, it, expect } from "vitest";
import moveMd from "../optimal-8-move.md?raw";
import homeMd from "../home-routines.md?raw";
import sppMd from "../optimal-8-strength-power-physique.md?raw";
import { MOVE_SINCE, moveWeekOf, movePhase, isMoveTestWeek, LEVELS, LEVEL_KEY, levelOf, levelLine, stepLevel,
  MOVE_TESTS, MOVE_TEST_IDS, rangeStandardsMet, testSummary, jeffersonGate } from "./move.js";
import { MOVE_RANGE_CARDS, SESSION_A_CARDS, SESSION_B_CARDS, RANGE_CARDS, sessionCards, levelIdOf, ROUTINE_MINS } from "./routines.js";
import { sppRx, sppSess, SPPROTO } from "./spp.js";
import { libFor } from "./library.js";
import { sessionCatalog } from "./App.jsx";

/* ================================================================
   OPTIMAL 8 · MOVE — the data: its weeks and phases, the levels, the
   fifteen standards and the keep, the Jefferson curl's gate, the
   evening routines, and what it changes in Strength, Power and Physique
   ================================================================ */

const mv = (w, m, extra) => Object.assign({}, sppRx(w), { mw: m }, extra || {});
const block = (d, n) => sppSess(d).b.find((b) => b.n === n);
const shown = (d, rx) => sppSess(d).b.filter((b) => b.L && !(b.hide && b.hide(rx))).map((b) => b.n);
const v = (x, rx) => (typeof x === "function" ? x(rx) : x);

describe("Optimal 8 · Move · its weeks", () => {
  it("week 1 is Monday 16 November; the weeks before it have none; any day of a week is that week; Settings can move it", () => {
    expect(MOVE_SINCE).toBe("2026-11-16");
    expect(["2026-11-02", "2026-11-09", "2026-11-15"].map((d) => moveWeekOf(d, MOVE_SINCE))).toEqual([null, null, null]);
    expect(["2026-11-16", "2026-11-19", "2026-11-22", "2026-11-23", "2027-02-08"].map((d) => moveWeekOf(d, MOVE_SINCE))).toEqual([1, 1, 1, 2, 13]);
    expect(moveWeekOf("2026-11-30", "2026-11-23")).toBe(2);
    expect([moveWeekOf(null, MOVE_SINCE), moveWeekOf("2026-11-16", null)]).toEqual([null, null]);
  });
  it("RESTORE weeks 1 to 4, BUILD 5 to 8, OWN from 9, and OWN carries on after week 12", () => {
    expect([null, 1, 4, 5, 8, 9, 12, 13, 30].map(movePhase)).toEqual([null, "restore", "restore", "build", "build", "own", "own", "own", "own"]);
    expect(moveMd).toMatch(/\| 9–12 \| \*\*OWN\*\* \|/);
    expect(moveMd).toMatch(/After week 12, OWN carries on at your new levels until standards 3 to 8, 12, 13 and 15 are met\./);
  });
  it("the standards: weeks 1, 5, 9 and 13, then every eight weeks", () => {
    const tw = []; for (let w = 1; w <= 40; w++) if (isMoveTestWeek(w)) tw.push(w);
    expect(tw).toEqual([1, 5, 9, 13, 21, 29, 37]);
    expect(isMoveTestWeek(null)).toBe(false);
  });
});

describe("Optimal 8 · Move · the levels", () => {
  it("every move starts at level 1, a step stays inside its levels, and the line names the level", () => {
    expect(LEVEL_KEY).toBe("move-lv");
    expect(Object.keys(LEVELS).length).toBe(21);
    Object.values(LEVELS).forEach((L) => { expect(L.n).toBeTruthy(); expect(L.l.length).toBeGreaterThanOrEqual(2); });
    expect(levelOf({}, "mv_cossack")).toBe(1);
    expect(levelOf({ mv_cossack: 9 }, "mv_cossack")).toBe(5);
    expect(levelOf({ mv_cossack: 0 }, "mv_cossack")).toBe(1);
    expect(levelOf({}, "nothing")).toBeNull();
    expect(levelLine({ mv_cossack: 3 }, "mv_cossack")).toBe("LEVEL 3 OF 5 — 8–12 kg held at your chest");
    let lv = stepLevel({}, "mv_copen", 1);
    expect(lv).toEqual({ mv_copen: 2 });
    expect(stepLevel(lv, "mv_copen", 1)).toEqual({ mv_copen: 2 });
    expect(stepLevel(stepLevel(lv, "mv_copen", -1), "mv_copen", -1)).toEqual({ mv_copen: 1 });
    expect(stepLevel({ mv_9090: 2 }, "mv_cossack", 1)).toEqual({ mv_9090: 2, mv_cossack: 2 });
  });
  it("the levels are the document's, move by move", () => {
    expect(moveMd).toMatch(/Level 1: hold a rack upright\. Level 2: no support\. Level 3: 8–12 kg held at your chest\. Level 4: 16–20 kg\. Level 5: 24 kg or more\./);
    expect(moveMd).toMatch(/Level 1: no weight \(a shoe balanced on your fist\)\. Level 2: 8 kg\. Level 3: 12 kg\. Level 4: 16 kg\. Level 5: 20 kg\./);
    expect(moveMd).toMatch(/Level 1: bodyweight\. Level 2: a 10 kg dumbbell in the same hand\. Level 3: 20 kg\. Level 4: 30 kg\./);
    expect(moveMd).toMatch(/Level 1: knee on the bench\. Level 2: ankle on the bench\./);
    expect([LEVELS.mv_cossack.l.length, LEVELS.mv_getup.l.length, LEVELS.mv_calfhold.l.length, LEVELS.mv_copen.l.length]).toEqual([5, 5, 4, 2]);
  });
});

describe("Optimal 8 · Move · the fifteen standards", () => {
  const ALL_MET = { mv1: "10", mv2_r: "20", mv2_l: "25", mv3: "120", mv4_r: "y", mv4_l: "y", mv4_sw: "y", mv5: "y", mv6: "y", mv7_r: "0", mv7_l: "-2",
    mv8_r: "12", mv8_l: "13", mv9: "60", mv10_r: "25", mv10_l: "25", mv11: "180", mv12_r: "y", mv12_l: "y", mv13_r: "60", mv13_l: "65", mv14_r: "y", mv14_l: "y", mv15_r: "y", mv15_l: "y" };
  const g = (o) => (id) => (o[id] == null ? "" : o[id]);
  it("fifteen, in the document's order; the back hold is entered in Sunday's session", () => {
    expect(MOVE_TESTS.map((t) => t.id)).toEqual(Array.from({ length: 15 }, (x, i) => "s" + (i + 1)));
    expect(MOVE_TESTS.map((t) => t.n)).toEqual(["Floor to standing", "One leg, eyes closed", "Deep squat", "90/90", "Toe touch", "Wall overhead", "Hands behind the back",
      "Knee to wall", "Dead hang", "Single-leg calf raise", "Back hold", "Couch position", "Seated turn", "Neck turn", "Wrist bend"]);
    expect(new Set(MOVE_TEST_IDS).size).toBe(MOVE_TEST_IDS.length);
    expect(MOVE_TESTS.filter((t) => t.gym).map((t) => t.id)).toEqual(["s11"]);
    expect(moveMd).toMatch(/## THE FIFTEEN STANDARDS/);
  });
  it("the range standards are 3 to 8, 12, 13 and 15; met, RANGE drops to THE KEEP; one short and it stays", () => {
    expect(MOVE_TESTS.filter((t) => t.range).map((t) => t.id)).toEqual(["s3", "s4", "s5", "s6", "s7", "s8", "s12", "s13", "s15"]);
    expect(MOVE_TESTS.every((t) => t.met(g(ALL_MET)))).toBe(true);
    expect(rangeStandardsMet(g(ALL_MET))).toBe(true);
    /* the others don't hold the keep back */
    expect(rangeStandardsMet(g(Object.assign({}, ALL_MET, { mv1: "6", mv9: "20", mv11: "40" })))).toBe(true);
    expect(rangeStandardsMet(g(Object.assign({}, ALL_MET, { mv3: "119" })))).toBe(false);
    expect(rangeStandardsMet(g(Object.assign({}, ALL_MET, { mv7_l: "3" })))).toBe(false);
    expect(rangeStandardsMet(g(Object.assign({}, ALL_MET, { mv13_l: "" })))).toBe(false);
    expect(rangeStandardsMet(g({}))).toBe(false);
    expect(moveMd).toMatch(/RANGE stays at 20 minutes until the range standards \(3 to 8, 12, 13 and 15\) are met\./);
  });
  it("each standard's line: numbers as entered, YES and NO, a dash when it's empty", () => {
    const t = (id) => MOVE_TESTS.find((x) => x.id === id);
    expect(testSummary(t("s2"), g({ mv2_r: "18", mv2_l: "22" }))).toBe("18 · 22");
    expect(testSummary(t("s4"), g({ mv4_r: "y", mv4_l: "n" }))).toBe("YES · NO · —");
    expect(testSummary(t("s5"), g({ mv5: "n", mv5_cm: "4" }))).toBe("NO");
    expect(testSummary(t("s3"), g({}))).toBe("—");
  });
});

describe("Optimal 8 · Move · the Jefferson curl's gate", () => {
  const ok = { backHold: "120", palms: "n", toeCm: "0", backScores: ["0", "0", "0", "0"] };
  it("a back hold of 2 minutes, fingertips to the floor, and four weeks with no back pain at all", () => {
    expect(jeffersonGate(ok)).toBe(true);
    expect(jeffersonGate(Object.assign({}, ok, { palms: "y", toeCm: "" }))).toBe(true);
    expect(jeffersonGate(Object.assign({}, ok, { backHold: "119" }))).toBe(false);
    expect(jeffersonGate(Object.assign({}, ok, { toeCm: "3" }))).toBe(false);
    expect(jeffersonGate(Object.assign({}, ok, { backScores: ["0", "0", "1", "0"] }))).toBe(false);
    expect(jeffersonGate(Object.assign({}, ok, { backScores: ["0", "0", "0"] }))).toBe(false);
    expect(jeffersonGate(Object.assign({}, ok, { backScores: ["0", "0", "0", ""] }))).toBe(false);
    expect(moveMd).toMatch(/\*\*The gate:\*\* a back hold of 2 minutes or more, fingertips reaching the floor on the toe touch, and no back pain at all for 4 weeks\./);
  });
});

describe("Optimal 8 · Move · the movement block, every gym morning", () => {
  const DAYS = { mon: ["S_MV_MON", 11, "hips, knees and lower back", "S_WU_MON", 5], tue: ["S_MV_TUE", 8, "lower back and shoulders"], wed: ["S_MV_WED", 9, "hips, ankles and overhead"],
    thu: ["S_MV_THU", 12, "hips, balance and sprint prep"], sat: ["S_MV_SAT", 10, "mid-back, shoulders and Achilles"], sun: ["S_MV_SUN", 10, "the whole body"] };
  it("from MOVE week 1 the first block is the day's movement block, its minutes the document's; before it, the old warm-up", () => {
    Object.entries(DAYS).forEach(([d, [p, m, area]]) => {
      const a = sppSess(d).b[0];
      expect([a.L, v(a.p, mv(1, 1)), v(a.m, mv(1, 1)), v(a.rxLine, mv(1, 1))]).toEqual(["A", p, m, m + " min · " + area]);
      expect(v(a.p, sppRx(1))).not.toBe(p);
      expect(SPPROTO[p].mv).toBe(1);
      expect(SPPROTO[p].n).toBe("The movement block");
    });
    expect([v(block("mon", "Warm-up").p, sppRx(1)), v(block("mon", "Warm-up").m, sppRx(1))]).toEqual(["S_WU_MON", 5]);
    expect(moveMd).toMatch(/### MONDAY · HIPS, KNEES AND LOWER BACK · 11 min/);
    expect(moveMd).toMatch(/### TUESDAY · LOWER BACK AND SHOULDERS · 8 min/);
    expect(moveMd).toMatch(/### WEDNESDAY · HIPS, ANKLES AND OVERHEAD · 9 min/);
    expect(moveMd).toMatch(/### THURSDAY · HIPS, BALANCE AND SPRINT PREP · 12 min/);
    expect(moveMd).toMatch(/### SATURDAY · MID-BACK, SHOULDERS AND ACHILLES · 10 min/);
    expect(moveMd).toMatch(/### SUNDAY · THE WHOLE BODY · 10 min/);
    expect(sppMd).toMatch(/\*\*The movement block · 11 minutes\*\* — hips, knees and lower back/);
    expect(sppMd).toMatch(/\*\*The movement block · 12 minutes\*\* — hips, balance and sprint prep/);
  });
  it("the moves, day by day, with the moves that have levels marked", () => {
    const rows = (p) => SPPROTO[p].i.map((r) => r[0] + (r[2] ? " @" + r[2] : ""));
    expect(rows("S_MV_MON")).toEqual(["Easy bike", "90/90 hip switches @mv_9090", "Cossack squats @mv_cossack", "Bird dog @mv_birddog", "Spanish squat hold @mv_spanish"]);
    expect(rows("S_MV_TUE")).toEqual(["Bird dog @mv_birddog", "Cable external rotation at shoulder height", "Push-up plus", "Then two easy throws of each"]);
    expect(rows("S_MV_WED")).toEqual(["Goblet squat pry @mv_pry", "Prone Y-raise", "Side-lying dumbbell external rotation", "Push-up plus", "Then a light set"]);
    expect(rows("S_MV_THU")).toEqual(["Easy bike", "Leg swings", "Hip airplanes @mv_airplane", "World's greatest stretch", "A-skips", "SPRINT BUILD-UPS", "20 m @ 60%", "20 m @ 75%", "20 m @ 90%"]);
    expect(rows("S_MV_SAT")).toEqual(["Elbow to the ceiling @mv_elbow", "Cable external rotation at shoulder height", "Push-up plus", "Single-leg calf hold @mv_calfhold", "Then two easy throws of each"]);
    expect(rows("S_MV_SUN")).toEqual(["Turkish get-up @mv_getup", "Suitcase carry", "Band pull-apart", "Then a light set"]);
    expect(SPPROTO.S_MV_MON.i[4][1]).toBe("3 × 45 s · hard, 7 out of 10 · 30 s between");
    expect(SPPROTO.S_MV_SUN.i[1][1]).toBe("2 × 30 m each hand");
    expect(moveMd).toMatch(/\*\*Suitcase carry\*\* — 2 × 30 m each hand\./);
    /* every level a block names is a level */
    Object.keys(DAYS).forEach((d) => SPPROTO[DAYS[d][0]].i.filter((r) => r[2]).forEach((r) => expect(LEVELS[r[2]]).toBeTruthy()));
  });
  it("every move in a block has its words in the library, and where the warm-up's entry would say otherwise, Move's own", () => {
    const rows = [].concat(...Object.values(DAYS).map(([p]) => SPPROTO[p].i)).filter((r) => !/^(Then |20 m @)/.test(r[0]) && r[1] !== "");
    const libs = rows.map((r) => [r[0], (libFor(r[3] || r[0]) || []).map((e) => e.n)[0] || null]);
    expect(libs.filter((x) => !x[1])).toEqual([]);
    const of = (n) => libs.find((x) => x[0] === n)[1];
    expect(["Easy bike", "90/90 hip switches", "Cossack squats", "Bird dog", "Spanish squat hold", "Hip airplanes", "Turkish get-up", "Push-up plus", "Goblet squat pry",
      "Prone Y-raise", "Elbow to the ceiling", "Single-leg calf hold"].map(of))
      .toEqual(["EASY BIKE, TWO MINUTES", "90/90 SWITCHES, BY LEVEL", "COSSACK SQUAT, BY LEVEL", "BIRD DOG", "SPANISH SQUAT HOLD, BY LEVEL", "HIP AIRPLANES, BY LEVEL", "TURKISH GET-UP, SLOW",
        "PUSH-UP PLUS", "GOBLET SQUAT PRY", "PRONE Y-RAISE", "ELBOW TO THE CEILING", "SINGLE-LEG CALF HOLD"]);
    /* the warm-ups before Move, and the other programs, keep their own */
    expect([libFor("Easy bike")[0].n, libFor("Spanish squat hold")[0].n, libFor("90/90 hip switch")[0].n]).toEqual(["EASY BIKE (WARM-UP)", "SPANISH SQUAT HOLD", "90/90 HIP SWITCHES"]);
    expect(libFor("Easy bike, two minutes")[0].text).toMatch(/^Pedal easy for two minutes/);
  });
  it("the card: named The movement block, its rows carry their levels and Move's words", () => {
    const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp" && c.edge == null);
    const warm = CAT.find((c) => c.week === 1 && c.day === "mon" && c.kind === "warm");
    expect(warm.n).toBe("The movement block");
    expect(warm.pres).toBe("11 min · hips, knees and lower back");
    expect(warm.rows.map((r) => [r.n, r.lv, r.lib[0].n])).toEqual([["Easy bike", null, "EASY BIKE, TWO MINUTES"], ["90/90 hip switches", "mv_9090", "90/90 SWITCHES, BY LEVEL"],
      ["Cossack squats", "mv_cossack", "COSSACK SQUAT, BY LEVEL"], ["Bird dog", "mv_birddog", "BIRD DOG"], ["Spanish squat hold", "mv_spanish", "SPANISH SQUAT HOLD, BY LEVEL"]]);
  });
});

describe("Optimal 8 · Move · what it changes in the sessions", () => {
  it("Monday's standing calf raise: heavier and slower from MOVE week 1, the same time", () => {
    const calf = (rx) => block("mon", "Standing Calf Raise + Hanging Leg Raise").items(rx)[0];
    expect([calf(mv(1, 1)).s, calf(mv(1, 1)).reps]).toEqual(["3 × 6–10 · 3 s up, 3 s down, 2 s at the bottom", "6–10"]);
    expect([calf(sppRx(1)).s, calf(sppRx(1)).reps]).toEqual(["3 × 10–15 · 2 s at the bottom", "10–15"]);
    expect(block("mon", "Standing Calf Raise + Hanging Leg Raise").m).toBe(6);
    expect(sppMd).toMatch(/\*\*Standing calf raise\*\*, 3 × 6–10, back to back with 7: 3 seconds up, 3 seconds down, 2 seconds at the bottom\./);
    expect(moveMd).toMatch(/3 × 6–10, 3 seconds up and 3 seconds down, 2 seconds at the bottom stretch/);
  });
  it("Thursday: the Copenhagen plank in place of the side plank and dead bug, only from MOVE week 1", () => {
    expect(shown("thu", sppRx(1)).slice(-1)).toEqual(["Side Plank + Dead Bug"]);
    expect(shown("thu", mv(1, 1)).slice(-1)).toEqual(["Copenhagen Plank, Knee or Ankle"]);
    expect(block("thu", "Copenhagen Plank, Knee or Ankle").items(mv(1, 1))[0].lv).toBe("mv_copen");
  });
  it("Sunday's back extension, straight after the hammer curls: held still, then full range, then a plate or the Jefferson curl; the back hold on the test weeks", () => {
    const be = block("sun", "Back Extension");
    const at = (rx) => { const i = be.items(rx)[0]; return [i.n, i.id, i.k, i.s]; };
    expect(be.hide(sppRx(1))).toBe(true);
    expect(be.hide(mv(1, 2))).toBe(false);
    const sun = shown("sun", mv(1, 2));
    expect(sun.indexOf("Back Extension")).toBe(sun.findIndex((n) => /Hammer Curl/.test(n)) + 1);
    expect(at(mv(1, 1))).toEqual(["The back hold", "mv11", "out", "as long as you can · standard 11"]);
    expect(at(mv(1, 2))).toEqual(["Back extension hold", "s_bkext", "chk", "3 × 30 s · body straight"]);
    expect(at(mv(1, 4))).toEqual(["Back extension hold", "s_bkext", "chk", "3 × 30 s · body straight"]);
    expect(at(mv(1, 5))).toEqual(["The back hold", "mv11", "out", "as long as you can · standard 11"]);
    expect(at(mv(1, 6))).toEqual(["Back extension, full range", "s_bkext", "chk", "2 × 12 · 2-second hold at the top"]);
    expect(at(mv(1, 10))).toEqual(["Back extension, full range, a plate at your chest", "s_bkext", "chk", "2 × 12 · 2-second hold at the top"]);
    expect(at(mv(1, 10, { jeff: true }))).toEqual(["Jefferson curl", "s_jeff", "wr", "2 × 8 · 5 s down, 5 s up · from 5 kg, +2.5 kg every 2 weeks while it's pain-free, up to 20 kg"]);
    /* the gate only opens it in OWN */
    expect(at(mv(1, 6, { jeff: true }))[0]).toBe("Back extension, full range");
    expect(be.m).toBe(3);
    expect(be.rxLine(mv(1, 2))).toBe("3 × 30 s · body straight");
    expect(libFor("Back extension hold").map((e) => e.n)).toEqual(["BACK EXTENSION"]);
    expect(libFor("Jefferson curl").map((e) => e.n)).toEqual(["JEFFERSON CURL"]);
    expect(libFor("The back hold").map((e) => e.n)).toEqual(["THE BACK HOLD"]);
    /* the card: the back hold and the Jefferson curl name their own card, and carry their own words */
    expect([be.items(mv(1, 1))[0].title, be.items(mv(1, 10, { jeff: true }))[0].title, be.items(mv(1, 2))[0].title, be.items(mv(1, 10))[0].title])
      .toEqual(["The Back Hold", "Jefferson Curl", undefined, undefined]);
    const CAT = sessionCatalog(["spp"]).filter((c) => c.set === "spp" && c.edge == null && c.day === "sun");
    /* this catalog's week 1 is Move's week 14, OWN; its week 8 is Move's week 21, a test week */
    const sunCard = (w) => CAT.find((c) => c.week === w && c.key === "J") || CAT.filter((c) => c.week === w).find((c) => /^(Back Extension|The Back Hold|Jefferson Curl)$/.test(c.n));
    expect([sunCard(1).n, sunCard(1).lib.map((e) => e.n)]).toEqual(["Back Extension", ["BACK EXTENSION"]]);
    expect([sunCard(8).n, sunCard(8).lib.map((e) => e.n)]).toEqual(["The Back Hold", ["THE BACK HOLD"]]);
    expect(moveMd).toMatch(/\*\*Test weeks:\*\* the slot is the back hold, standard 11\./);
    expect(moveMd).toMatch(/The hammer curls stay as they are\./);
  });
  it("the weekly check scores the lower back, which the Jefferson curl's gate reads", () => {
    const wk = block("sun", "Weekly Check").items(mv(1, 2));
    const ids = wk.map((i) => i.id);
    expect(ids.indexOf("wr_lb")).toBe(ids.indexOf("wr_hip") + 1);
    expect(wk.find((i) => i.id === "wr_lb")).toMatchObject({ n: "Lower back", k: "out", u: "0–10" });
    /* the evenings: RANGE five nights, a movement session two */
    expect(wk.find((i) => i.id === "wr_home").n).toBe("Evenings you did RANGE or a movement session");
    expect(block("sun", "Weekly Check").items(sppRx(1)).find((i) => i.id === "wr_home").n).toBe("Evenings you did RANGE");
    expect(sppMd).toMatch(/your joints and your lower back, sleep, lights-out, energy and your evenings of RANGE or a movement session/);
  });
});

describe("Optimal 8 · Move · the evenings", () => {
  it("RANGE FOR MOVE: 27 cards, about 20 minutes; the hamstring, cross-body and doorway stretches in; RANGE itself unchanged for the other programs", () => {
    expect(MOVE_RANGE_CARDS.length).toBe(27);
    expect(ROUTINE_MINS.moveRange).toBe(20);
    const n = MOVE_RANGE_CARDS.map((c) => c.n);
    expect(n.slice(14, 16)).toEqual(["HAMSTRING STRETCH — RIGHT LEG UP", "HAMSTRING STRETCH — LEFT LEG UP"]);
    expect(n.slice(21, 23)).toEqual(["CROSS-BODY STRETCH — RIGHT ARM", "CROSS-BODY STRETCH — LEFT ARM"]);
    expect(n.slice(23, 25)).toEqual(["KETTLEBELL ARM BAR — RIGHT ARM", "KETTLEBELL ARM BAR — LEFT ARM"]);
    expect(n.slice(25)).toEqual(["DOORWAY CHEST STRETCH — RIGHT ARM", "DOORWAY CHEST STRETCH — LEFT ARM"]);
    expect(n.some((x) => /THREAD|SQUAT-TO-STAND|SLEEPER|WALL SLIDE/.test(x))).toBe(false);
    expect(RANGE_CARDS.map((c) => c.n).some((x) => /THREAD/.test(x))).toBe(true);
    expect(homeMd).toMatch(/## RANGE FOR MOVE · five evenings a week · about 20 minutes · Optimal 8 · Move/);
  });
  it("Session A, Wednesday evening, 30 minutes: hips, lower back, balance, getting up and down — 16 cards", () => {
    expect(SESSION_A_CARDS.map((c) => c.n)).toEqual(["SETTLE", "CAT-CAMEL", "McGILL CURL-UP", "SIDE BRIDGE", "FLOOR TO STANDING", "ONE-LEG BALANCE", "REVERSE NORDIC", "DEEP SQUAT",
      "90/90 TO KNEELING", "PRONE HIP INWARD TURN", "PRONE HIP INWARD TURN — LIFTS", "STRAIGHT-LEG LIFT-OFFS", "NERVE SLIDERS", "FROG ROCKS", "PIGEON — RIGHT LEG IN FRONT", "PIGEON — LEFT LEG IN FRONT"]);
    expect(ROUTINE_MINS.sessA).toBe(30);
    expect(SESSION_A_CARDS.find((c) => c.n === "DEEP SQUAT").secs).toBe(120);
    expect(moveMd).toMatch(/## WEDNESDAY EVENING · SESSION A · HIPS, LOWER BACK, BALANCE AND GETTING UP AND DOWN · 30 min/);
  });
  it("Session B, Sunday evening, 30 minutes: shoulders, mid-back, neck, wrists, ankles and feet — 15 cards", () => {
    expect(SESSION_B_CARDS.map((c) => c.n)).toEqual(["SETTLE", "NECK RANGE WITH PUSHES", "WRIST ROCKS AND PALM LIFTS", "SEATED TURN", "CHEST LIFTS", "OVERHEAD LIFT-OFFS", "TURN-OUT LIFTS",
      "TURN-IN LIFTS", "BEHIND-THE-BACK SHOULDER STRETCH", "DEAD HANG", "LOADED KNEE TO WALL — RIGHT FOOT FORWARD", "LOADED KNEE TO WALL — LEFT FOOT FORWARD", "SINGLE-LEG CALF RAISE",
      "KETTLEBELL ARM BAR — RIGHT ARM", "KETTLEBELL ARM BAR — LEFT ARM"]);
    expect(ROUTINE_MINS.sessB).toBe(30);
    expect(SESSION_B_CARDS.slice(-2).map((c) => c.words)).toEqual(MOVE_RANGE_CARDS.slice(23, 25).map((c) => c.words));
    expect(moveMd).toMatch(/## SUNDAY EVENING · SESSION B · SHOULDERS, MID-BACK, NECK, WRISTS, ANKLES AND FEET · 30 min/);
  });
  it("the cards with levels show your level; in OWN the pigeons are 2 minutes with the halfway push and relax", () => {
    expect(levelIdOf("McGILL CURL-UP")).toBe("mv_curlup");
    expect(levelIdOf("PIGEON — RIGHT LEG IN FRONT")).toBeNull();
    const a = sessionCards("A", 9, { mv_curlup: 2 });
    expect(a.filter((c) => c.level).map((c) => c.lv)).toEqual(["mv_curlup", "mv_bridge", "mv_floor", "mv_balance", "mv_rnordic", "mv_squat", "mv_kneel", "mv_slr"]);
    expect(a.find((c) => c.lv === "mv_curlup").level).toBe("LEVEL 2 OF 3 — Elbows lifted");
    const pig = (cards) => cards.filter((c) => /^PIGEON/.test(c.n));
    expect(pig(a).map((c) => [c.secs, c.amt, c.halfway])).toEqual([[120, "2:00", true], [120, "2:00", true]]);
    expect(pig(a)[0].words).toMatch(/At halfway: press your front shin into the floor for 5 seconds, relax, and fold further\.$/);
    expect(pig(sessionCards("A", 8, {})).map((c) => c.secs)).toEqual([90, 90]);
    expect(sessionCards("B", 1, {}).filter((c) => c.level).map((c) => c.lv)).toEqual(["mv_turnout", "mv_ktw", "mv_ktw", "mv_scalf"]);
  });
});
