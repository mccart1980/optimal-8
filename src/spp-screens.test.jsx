import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* OPTIMAL 8 · STRENGTH, POWER AND PHYSIQUE on the screen: the week's
   title, the ramp and the bar-speed target on a main lift, a pair card,
   the power block's rest with its jumps in it, the 4 × 4's timer, the
   nasal run's zone, the photos and the tape, the morning check, test
   week, PROGRESS, and picking it in Settings while a Prep is running.
   The twelve weeks from Monday 15 February 2027: week 4 is the lighter
   week from 8 March, week 9 the power block from 12 April, week 12 the
   test week from 3 May. */
const SPP = { booked: false, classic: false, spp: true, fitness: "moderate", rounds: 6, mins: 3, rest: 60, weighIn: "before", emphasis: "none" };
const PREP = Object.assign({}, SPP, { spp: false });
const MAXES = { squat: 140, bench: 100, tbdl: 180, pp: 70, cw_squat: 120, cw_tbdl: 160, cw_bench: 90, cw_pp: 60 };
/* a squat profile: 0.75 m/s at 75% */
const profiles = { squat: { points: [{ load: 50, speed: 1.0 }, { load: 60, speed: 0.9 }, { load: 70, speed: 0.8 }, { load: 80, speed: 0.7 }, { load: 85, speed: 0.65 }], drawn: "2027-02-01" } };
const base = (extra) => Object.assign({ macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, v12: true,
  start: "2026-10-26", imStart: "2026-10-26", rangeStart: "2026-10-26", levelStart: "2026-10-26", program: "prep", easyPeak: "180" }, extra || {});
const spp = () => base({ plans: [{ from: "2027-02-15", made: "2027-02-14", inputs: SPP }], season: SPP, profiles });

async function at(y, m, d, st, store) {
  vi.setSystemTime(new Date(y, m - 1, d, 6, 0, 0));
  localStorage.setItem("o8s-settings", typeof st === "string" ? st : JSON.stringify(st));
  localStorage.setItem("o8s-maxes", JSON.stringify(MAXES));
  Object.keys(store || {}).forEach((k) => localStorage.setItem(k, JSON.stringify(store[k])));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
const title = () => screen.getByTestId("app-title").textContent;
/* the whole day, every chapter open: the rows' names in order */
function wholeDay() {
  if (!screen.queryByTestId("whole-day")) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  for (let k = 0; k < 8; k++) { const b = document.querySelector("[data-chapter] [aria-expanded=false]"); if (!b) break; fireEvent.click(b); }
  return [...document.querySelectorAll("[data-flow-name]")].map((e) => e.getAttribute("data-flow-name"));
}
/* make one row the NOW card */
function pick(name) {
  wholeDay();
  const row = [...document.querySelectorAll("[data-flow-name]")].find((e) => e.getAttribute("data-flow-name") === name);
  if (!row) throw new Error("no row " + name + " in " + wholeDay().join(" | "));
  fireEvent.click(row.querySelectorAll("button")[1]);
  return screen.getByTestId("now-card");
}
const before = (rows, a, b) => rows.indexOf(a) >= 0 && rows.indexOf(b) > rows.indexOf(a);
const saved = () => JSON.parse(localStorage.getItem("o8s-settings"));

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("the week and its main lifts", () => {
  it("week 1's Monday: the title, the order, the squat's ramp in kilos, its line and its bar-speed target", async () => {
    await at(2027, 2, 15, spp());
    expect(title()).toBe("Strength & Power · Week 1 · Size");
    const rows = wholeDay();
    /* from 23 November the box jumps are the kneeling jump into box jump, and the dead bug and woodchop follow the leg raises (core.js) */
    ["The movement block", "Kneeling Jump into Box Jump", "Achilles pushes", "Knee pushes", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Seated Leg Curl", "Towel Calf Raise + Hanging Leg Raise", "Dead Bug + Cable Woodchop", "Lying Neck Curl + Lying Neck Extension"]
      .forEach((n, i, a) => { expect(rows).toContain(n); if (i) expect(before(rows, a[i - 1], n)).toBe(true); });
    // the easy hour is Saturday's, not Monday's
    expect(rows).not.toContain("The easy hour");
    const card = pick("Back Squat");
    expect(within(card).getByTestId("lift-ramp").textContent).toBe("RAMP · BAR × 8 · 55 KG × 5 · 77.5 KG × 3 · 90 KG × 2 · A MINUTE BETWEEN");
    expect(within(card).getByTestId("card-pres").textContent).toBe("4 × 6 · 105 kg · Rest 3:00");
    // read off the profile at the set's own 75%
    expect(within(card).getByTestId("bar-speed").textContent).toMatch(/TARGET 0\.75/);
  });

  it("the power block: 4 × 2, the box jumps in the rest, the rest timer runs them", async () => {
    await at(2027, 4, 12, spp());
    expect(title()).toBe("Strength & Power · Week 9 · Power");
    const card = pick("Back Squat");
    expect(within(card).getByTestId("card-pres").textContent).toBe("4 × 2 · 125 kg · Rest 90 s · 3 box jumps · rest 2:00");
    expect(within(card).getByTestId("lift-ramp").textContent).toMatch(/· 105 KG × 1 · 120 KG × 1 · A MINUTE BETWEEN$/);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-part").textContent).toBe("REST — THEN 3 BOX JUMPS");
  });

  it("the morning check: red takes the squat off and leaves the size work; yellow takes 7% off", async () => {
    await at(2027, 2, 22, spp(), { "o8s-ready": { "mSw2-mon": "R" } });
    const rows = wholeDay();
    expect(rows).not.toContain("Back Squat");
    expect(rows).toContain("Romanian Deadlift");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2027, 2, 22, spp(), { "o8s-ready": { "mSw2-mon": "Y" } });
    expect(within(pick("Back Squat")).getByTestId("card-pres").textContent).toBe("4 × 6 · 100 kg · Rest 3:00");
  });

  it("test week's Monday: the broad jump, then the squat's top triple", async () => {
    await at(2027, 5, 3, spp());
    expect(before(wholeDay(), "Broad jump", "Back Squat")).toBe(true);
    expect(within(pick("Back Squat")).getByTestId("top-triple")).toBeInTheDocument();
  });
});

describe("a pair", () => {
  it("Tuesday's bench and chin-ups: one card, each half its own name, entry, line and sets; a bench set starts the 90 seconds", async () => {
    await at(2027, 2, 16, spp());
    const card = pick("Bench Press + Weighted Chin-Up");
    const parts = card.querySelectorAll("[data-pair-part]");
    expect(parts).toHaveLength(2);
    expect(within(card).getAllByTestId("card-name").map((e) => e.textContent)).toEqual(["Bench Press + Weighted Chin-Up", "Bench press", "Weighted chin-up, palms toward you"]);
    expect([...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id"))).toEqual(["kg:bench", "add:s_chin"]);
    expect(within(parts[0]).getAllByTestId("card-lib")).toHaveLength(1);
    expect(within(parts[1]).getByTestId("card-lib").textContent).toMatch(/Palms facing you/);
    const pres = within(card).getAllByTestId("card-pres").map((e) => e.textContent);
    expect(pres[1]).toBe("4 × 6 · 75 kg · Rest 90 s · then the chin-up");
    expect(pres[2]).toBe("4 × 6 · the heaviest that leaves two in you · Rest 90 s · then the bench");
    fireEvent.click(within(parts[0]).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-title").textContent).toBe("REST");
    expect(screen.getByTestId("timer-count").textContent).toBe("1:30");
  });
});

describe("the engine", () => {
  it("Saturday ends with the 4 × 4: its timer runs five easy minutes first, nine steps in all", async () => {
    await at(2027, 2, 20, spp());
    const rows = wholeDay();
    expect(before(rows, "Cable Lateral Raise", "The 4 × 4 Intervals")).toBe(true);
    fireEvent.click(within(pick("The 4 × 4 Intervals")).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("THE 4 × 4");
    expect(screen.getByTestId("timer-part").textContent).toBe("EASY — 5 MINUTES");
    expect(screen.getAllByText(/STEP 1 \/ 9/).length).toBeGreaterThan(0);
  });

  it("Wednesday's nasal run carries the easy zone", async () => {
    await at(2027, 2, 17, spp());
    const card = pick("The Nasal Run");
    expect(within(card).getByTestId("card-pres").textContent).toBe("30 min easy, nose only · 65–75% of peak");
    expect(screen.getByTestId("easy-zone-range").textContent).toMatch(/^117–135/);
  });
});

describe("Tuesday's bursts", () => {
  it("end Tuesday after the ab wheel; the timer runs 2 easy minutes first, 17 steps in all; four in week 4; none on a red morning", async () => {
    await at(2027, 2, 16, spp());
    expect(before(wholeDay(), "Ab Wheel Rollout", "Assault Bike Bursts")).toBe(true);
    const card = pick("Assault Bike Bursts");
    expect(within(card).getByTestId("card-pres").textContent).toBe("On the assault bike: 2 minutes easy, then 8 bursts of 6 seconds flat out with 40 seconds easy between, then 2 minutes easy");
    fireEvent.click(within(card).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("8 BURSTS");
    expect(screen.getByTestId("timer-part").textContent).toBe("EASY — 2 MINUTES");
    expect(screen.getAllByText(/STEP 1 \/ 17/).length).toBeGreaterThan(0);
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2027, 3, 9, spp());
    fireEvent.click(within(pick("Assault Bike Bursts")).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("4 BURSTS");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2027, 2, 23, spp(), { "o8s-ready": { "mSw2-tue": "R" } });
    expect(wholeDay()).not.toContain("Assault Bike Bursts");
  });
});

describe("the weight box", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ autoRest: false, plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  const seed = { "mSw1-mon-rdl": { sets: [{ ok: true, w: "60", r: "8" }, { ok: true, w: "60", r: "8" }, { ok: true, w: "60", r: "8" }], n: "Romanian Deadlift", d: "2026-11-02" },
    "mSw1-mon-s_legcurl": { sets: [{ ok: true, w: "40", r: "12" }, { ok: true, w: "40", r: "12" }, { ok: true, w: "40", r: "12" }], n: "Seated Leg Curl", d: "2026-11-02" } };
  it("week 1: type the weight once, the sets read it, the log keeps it; none on the squat or the leg raises", async () => {
    await at(2026, 11, 2, live());
    const card = pick("Romanian Deadlift");
    expect(within(card).queryByTestId("last-time")).toBe(null);
    fireEvent.change(within(card).getByTestId("weight-box").querySelector("input"), { target: { value: "60" } });
    expect(card.querySelector("[data-set-btn='1']").textContent).toMatch(/60 kg × 8/);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    const e = JSON.parse(localStorage.getItem("o8s-log"))["mSw1-mon-rdl"];
    expect(e).toMatchObject({ n: "Romanian Deadlift", d: "2026-11-02" });
    expect(e.sets[0]).toMatchObject({ ok: true, w: "60", r: "8" });
    expect(within(pick("Back Squat")).queryByTestId("weight-box")).toBe(null);
    const pair = pick("Standing Calf Raise + Hanging Leg Raise");
    expect([...pair.querySelectorAll("[data-pair-part]")].map((e) => !!e.querySelector("[data-testid='weight-box']"))).toEqual([true, false]);
  });
  it("week 2: last time's sets, the box starts at them, the nudge when every set hit the top of the range, and NUMBERS", async () => {
    await at(2026, 11, 9, live(), { "o8s-log": seed });
    let card = pick("Romanian Deadlift");
    expect(within(card).getByTestId("last-time").textContent).toMatch(/^LAST TIME · MON,? 2 NOV · 60 KG × 8 · 8 · 8$/);
    expect(within(card).getByTestId("weight-box").querySelector("input").value).toBe("60");
    expect(within(card).queryByTestId("step-up")).toBe(null);
    card = pick("Seated Leg Curl");
    expect(within(card).getByTestId("step-up").textContent).toBe("TOP OF THE RANGE ON EVERY SET LAST TIME — ADD THE SMALLEST STEP TODAY");
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "PROGRESS" }));
    fireEvent.click(screen.getByRole("button", { name: "NUMBERS" }));
    const rows = [...document.querySelectorAll("[data-lift-history]")].map((e) => e.textContent);
    expect(rows.some((t) => /^Romanian Deadlift60 kg/.test(t))).toBe(true);
    expect(rows.some((t) => /^Seated Leg Curl40 kg/.test(t))).toBe(true);
  });
});

describe("the sprints' buttons", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  const runBtns = (card) => [...card.querySelectorAll("[data-runs='sled'] [data-set-btn]")];
  it("Thursday's sled: a SET button a run — five, each tick starts the 2:00 rest; the load and the time keep their boxes; three runs in week 4, two in test week", async () => {
    await at(2026, 11, 5, live());
    const card = pick("Heavy Sled Sprint");
    expect(runBtns(card).map((b) => b.getAttribute("aria-label") + " · " + b.children[1].textContent)).toEqual(["Set 1 · 20 m", "Set 2 · 20 m", "Set 3 · 20 m", "Set 4 · 20 m", "Set 5 · 20 m"]);
    expect([...card.querySelectorAll("[data-out-field]")].map((e) => e.getAttribute("data-out-field"))).toEqual(["w", "t"]);
    fireEvent.change(card.querySelector("[data-out-field='w'] input"), { target: { value: "40" } });
    fireEvent.click(runBtns(screen.getByTestId("now-card"))[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("REST");
    expect(screen.getByTestId("timer-count").textContent).toBe("2:00");
    expect(JSON.parse(localStorage.getItem("o8s-log"))["mSw1-thu-sled"]).toEqual({ w: "40", runs: [true, false, false, false, false] });
    expect(runBtns(screen.getByTestId("now-card"))[0].getAttribute("aria-label")).toBe("Undo set 1");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 26, live());
    expect(runBtns(pick("Heavy Sled Sprint"))).toHaveLength(3);
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2027, 1, 21, live());
    expect(runBtns(pick("Heavy Sled Sprint"))).toHaveLength(2);
  });
  it("last week's three ticked runs still read on a five-run card, and the day is no less done", async () => {
    await at(2026, 11, 12, live(), { "o8s-log": { "mSw2-thu-sled": { w: "40", t: "6.2", runs: [true, true, true] } } });
    const btns = runBtns(pick("Heavy Sled Sprint"));
    expect(btns.map((b) => b.getAttribute("aria-label"))).toEqual(["Undo set 1", "Undo set 2", "Undo set 3", "Set 4", "Set 5"]);
  });
  it("a Monday finished before the box jumps had their own card still reads as finished, here and after a backup is loaded", async () => {
    const eight = ["A", "C", "D", "E", "F", "G", "N", "Q"];
    const week = () => { fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" })); fireEvent.click(screen.getByRole("button", { name: "PLAN" })); fireEvent.click(screen.getByRole("button", { name: "THIS WEEK" })); return document.body.textContent; };
    await at(2026, 11, 12, live(), { "o8s-done": { "mSw2-mon": eight } });
    expect(JSON.parse(localStorage.getItem("o8s-done"))["mSw2-mon"]).toEqual(eight.concat(["K"]));
    expect(JSON.parse(localStorage.getItem("o8s-settings")).v16).toBe(true);
    week();
    expect(document.querySelector("[data-day-count='mon']").textContent).toBe("8/8");
    /* a Monday whose box jumps are skipped after the change stays as it is */
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 19, Object.assign(live(), { v16: true }), { "o8s-done": { "mSw3-mon": eight } });
    expect(JSON.parse(localStorage.getItem("o8s-done"))["mSw3-mon"]).toEqual(eight);
  });
  it("Monday's box jumps: their own card straight after the warm-up, four ticked sets of three, a set starts 1:00; two sets in week 4; none on a red morning; the warm-up is the bike and the hold", async () => {
    await at(2026, 11, 9, live());
    const rows = wholeDay();
    expect(rows.slice(rows.indexOf("Warm-up"), rows.indexOf("Warm-up") + 3)).toEqual(["Warm-up", "Box Jumps", "Back Squat"]);
    const warm = pick("Warm-up");
    expect(within(warm).getByTestId("card-pres").textContent).toBe("5 min · bike, the Spanish squat hold");
    expect(warm.textContent).not.toMatch(/Box jump/i);
    const card = pick("Box Jumps");
    expect(within(card).getByTestId("card-pres").textContent).toBe("4 × 3 · onto a knee-high box · Rest 60 s");
    expect([...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id"))).toEqual(["bw:boxjump"]);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(4);
    expect(card.querySelector("[data-testid='weight-box']")).toBe(null);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("1:00");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 23, live());
    const light = wholeDay();
    /* Optimal 8 · Move's week 2: the movement block in the warm-up's place */
    expect(light.slice(light.indexOf("The movement block"), light.indexOf("The movement block") + 3)).toEqual(["The movement block", "Kneeling Jump into Box Jump", "Load-Velocity Profile — Squat"]);
    /* from 23 November: the kneeling jump into box jump, the same sets, two reps each */
    const kneel = pick("Kneeling Jump into Box Jump");
    expect(within(kneel).getByTestId("card-pres").textContent).toBe("2 × 2 · onto a knee-high box · Rest 60 s");
    expect(kneel.textContent).toMatch(/Kneel tall on a mat, toes tucked under/);
    expect([...kneel.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id"))).toEqual(["bw:s_kneelbox"]);
    expect(kneel.querySelectorAll("[data-set-btn]")).toHaveLength(2);
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 16, live(), { "o8s-ready": { "mSw3-mon": "R" } });
    const red = wholeDay();
    expect(red).not.toContain("Box Jumps");
    expect(red).not.toContain("Back Squat");
    expect(red).toContain("Romanian Deadlift");
  });
  it("the flying sprints: a SET button a sprint, and each tap starts the 2:30 rest", async () => {
    await at(2026, 11, 5, live());
    const card = pick("Flying Sprints");
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(3);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("2:30");
  });
  it("Prep's sled is as it was: no run buttons", async () => {
    await at(2026, 10, 28, live());
    const card = pick("Heavy Sled Sprints");
    expect(card.querySelector("[data-runs]")).toBe(null);
    expect([...card.querySelectorAll("[data-out-field]")].map((e) => e.getAttribute("data-out-field"))).toEqual(["w", "t"]);
  });
});

describe("rotation and the trunk", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  it("Tuesday: the throws first, before the bench; a shot-put set starts the 45 seconds; two sets in week 4; none on a red morning", async () => {
    await at(2026, 11, 3, live());
    const rows = wholeDay();
    expect(before(rows, "Warm-up", "Rotational Shot-Put Throw + Hook Throw")).toBe(true);
    expect(before(rows, "Rotational Shot-Put Throw + Hook Throw", "Bench Press + Weighted Chin-Up")).toBe(true);
    const card = pick("Rotational Shot-Put Throw + Hook Throw");
    const parts = card.querySelectorAll("[data-pair-part]");
    expect(within(card).getAllByTestId("card-name").map((e) => e.textContent)).toEqual(["Rotational Shot-Put Throw + Hook Throw", "Rotational shot-put throw", "Hook throw"]);
    expect([...parts].map((p) => p.querySelectorAll("[data-set-btn]").length)).toEqual([3, 3]);
    fireEvent.click(within(parts[0]).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-title").textContent).toBe("REST");
    expect(screen.getByTestId("timer-count").textContent).toBe("0:45");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 24, live());
    expect([...pick("Rotational Shot-Put Throw + Hook Throw").querySelectorAll("[data-pair-part]")].map((p) => p.querySelectorAll("[data-set-btn]").length)).toEqual([2, 2]);
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 10, live(), { "o8s-ready": { "mSw2-tue": "R" } });
    expect(wholeDay()).not.toContain("Rotational Shot-Put Throw + Hook Throw");
  });
  it("Sunday: the Pallof press back to back with the seated calf raise — the calf set goes straight into it, its own set starts the minute, and it counts reps", async () => {
    await at(2026, 11, 8, live());
    const card = pick("Seated Calf Raise + Pallof Press");
    const parts = card.querySelectorAll("[data-pair-part]");
    expect([...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id") + ":" + e.getAttribute("data-set-unit"))).toEqual(["kg:s_scalf:reps", "bw:s_pallof:reps"]);
    fireEvent.click(within(parts[0]).getByRole("button", { name: "Set 1" }));
    expect(screen.queryByTestId("timer-title")).toBe(null);
    fireEvent.click(within(parts[1]).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("1:00");
    expect(parts[1].querySelector("[data-set-btn='1']").textContent).toMatch(/10$/);
  });
});

describe("the abs, the traps and the neck", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  const modes = (card) => [...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id"));
  it("Monday ends with the neck, back to back: the curl's set goes straight into the extension, the extension's starts 0:45", async () => {
    await at(2026, 11, 2, live());
    const rows = wholeDay();
    expect(before(rows, "Standing Calf Raise + Hanging Leg Raise", "Lying Neck Curl + Lying Neck Extension")).toBe(true);
    const card = pick("Lying Neck Curl + Lying Neck Extension");
    expect(modes(card)).toEqual(["kg:s_neckc", "kg:s_necke"]);
    const parts = card.querySelectorAll("[data-pair-part]");
    fireEvent.click(within(parts[0]).getByRole("button", { name: "Set 1" }));
    expect(screen.queryByTestId("timer-title")).toBe(null);
    fireEvent.click(within(parts[1]).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("0:45");
  });
  it("Monday ends with the chest-supported rear-delt raise after the neck, in kilos; its set starts 1:00", async () => {
    await at(2026, 11, 2, live());
    const rows = wholeDay();
    expect(before(rows, "Lying Neck Curl + Lying Neck Extension", "Chest-Supported Rear-Delt Raise")).toBe(true);
    const card = pick("Chest-Supported Rear-Delt Raise");
    expect(modes(card)).toEqual(["kg:s_rdraise"]);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("1:00");
  });
  it("Wednesday's and Sunday's cable crunch, each back to back with the pull before it, with a weight box; the crunch's set starts 1:00", async () => {
    await at(2026, 11, 4, live());
    let card = pick("Reverse Pec-Deck + Cable Crunch");
    expect(modes(card)).toEqual(["kg:s_rpd", "kg:s_crunch"]);
    expect(within(card.querySelectorAll("[data-pair-part]")[1]).getByTestId("weight-box")).toBeTruthy();
    fireEvent.click(within(card.querySelectorAll("[data-pair-part]")[1]).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("1:00");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 8, live());
    card = pick("Dumbbell Shrug + Cable Crunch");
    expect(modes(card)).toEqual(["kg:s_shrug", "kg:s_crunch"]);
  });
  it("Thursday: the trap bar shrug straight after the deadlift; a set starts 1:15", async () => {
    await at(2026, 11, 5, live());
    const rows = wholeDay();
    expect(rows.indexOf("Trap Bar Shrug")).toBe(rows.indexOf("Trap Bar Deadlift") + 1);
    const card = pick("Trap Bar Shrug");
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("1:15");
  });
});

describe("the pressure rounds and the ab finishes", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  const modes = (card) => [...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id") + ":" + e.getAttribute("data-set-unit"));
  const skip = () => fireEvent.click(screen.getAllByRole("button", { name: "SKIP" }).pop());
  it("Tuesday: the pressure rounds straight after the bursts; the timer runs a minute easy, then three rounds of nine 5-second bursts with a steady 15 between, 58 steps; two rounds in week 4; none on a red morning", async () => {
    await at(2026, 11, 3, live());
    const rows = wholeDay();
    expect(rows.indexOf("Pressure Rounds")).toBe(rows.indexOf("Assault Bike Bursts") + 1);
    const card = pick("Pressure Rounds");
    expect(within(card).getByTestId("card-pres").textContent).toBe("On the assault bike, straight after the bursts: 1 minute easy, then 3 rounds of 3 minutes with 1 minute's rest between — in each, a 5-second burst all out every 20 seconds, a steady pace between — then 2 minutes easy");
    fireEvent.click(within(card).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("3 PRESSURE ROUNDS");
    expect(screen.getByTestId("timer-part").textContent).toBe("EASY — 1 MINUTE");
    expect(screen.getAllByText(/STEP 1 \/ 58 · 14:00 LEFT/).length).toBeGreaterThan(0);
    skip();
    expect([screen.getByTestId("timer-part").textContent, screen.getByTestId("timer-count").textContent]).toEqual(["BURST 1 OF 9 — ALL OUT", "0:05"]);
    skip();
    expect([screen.getByTestId("timer-part").textContent, screen.getByTestId("timer-count").textContent]).toEqual(["ROUND 1 OF 3 · STEADY — NEVER STOP", "0:15"]);
    for (let i = 0; i < 17; i++) skip();
    expect([screen.getByTestId("timer-part").textContent, screen.getByTestId("timer-count").textContent]).toEqual(["REST — 1 MINUTE", "1:00"]);
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 24, live());
    /* from the audit's week, Monday 23 November: the lighter week runs one round, its third minute arms only, then the arms-only test */
    fireEvent.click(within(pick("Pressure Rounds, Arms-Only Third Minute")).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("1 PRESSURE ROUND");
    expect(screen.getAllByText(/STEP 1 \/ 20 · 5:00 LEFT/).length).toBeGreaterThan(0);
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 10, live(), { "o8s-ready": { "mSw2-tue": "R" } });
    expect(wholeDay()).not.toContain("Pressure Rounds");
  });
  it("Thursday ends with the side plank and the dead bug, back to back, until Optimal 8 · Move: the plank counts seconds with no clock after it, the dead bug's set starts 0:30; from the tendon work's week 1 the hip pair, two sets each, in week 4 too", async () => {
    await at(2026, 11, 5, live());
    const rows = wholeDay();
    expect(rows.indexOf("Side Plank + Dead Bug")).toBe(rows.indexOf("Nordic Curls") + 1);
    const card = pick("Side Plank + Dead Bug");
    expect(modes(card)).toEqual(["bw:s_splank:s", "bw:s_deadbug:reps"]);
    const parts = card.querySelectorAll("[data-pair-part]");
    expect([...parts].map((p) => p.querySelectorAll("[data-set-btn]").length)).toEqual([2, 2]);
    expect(parts[0].querySelector("[data-set-btn='1']").textContent).toMatch(/30 s$/);
    fireEvent.click(within(parts[0]).getByRole("button", { name: "Set 1" }));
    expect(screen.queryByTestId("timer-title")).toBe(null);
    fireEvent.click(within(parts[1]).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("0:30");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 26, live());
    const late = wholeDay();
    expect(late).not.toContain("Side Plank + Dead Bug");
    expect(late).not.toContain("Copenhagen Plank, Knee or Ankle");
    expect(late.slice(late.indexOf("Nordic Curls"), late.indexOf("Nordic Curls") + 3)).toEqual(["Nordic Curls", "Copenhagen lifts", "Star side plank"]);
    expect(pick("Copenhagen lifts").querySelectorAll("[data-set-btn]")).toHaveLength(2);
  });
  it("Saturday: the side plank, then the landmine rotation in added kilos, before the 4 × 4; a plank set starts 0:30, a rotation set 1:00; both run on a red morning; from Move's week 1 the Copenhagen plank", async () => {
    await at(2026, 11, 7, live());
    const rows = wholeDay();
    const i = rows.indexOf("Cable Lateral Raise");
    expect(rows.slice(i, i + 4)).toEqual(["Cable Lateral Raise", "Side Plank", "Landmine Rotation", "The 4 × 4 Intervals"]);
    let card = pick("Side Plank");
    expect(modes(card)).toEqual(["bw:s_splank:s"]);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(2);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("0:30");
    fireEvent.click(screen.getByRole("button", { name: "CLOSE TIMER" }));
    card = pick("Landmine Rotation");
    expect(modes(card)).toEqual(["add:s_landrot:reps"]);
    expect(within(card).getByTestId("weight-box").textContent).toMatch(/ADDED WEIGHT \(KG\)/);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(3);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("1:00");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 14, live(), { "o8s-ready": { "mSw2-sat": "R" } });
    const red = wholeDay();
    expect(red).toContain("Side Plank");
    expect(red).toContain("Landmine Rotation");
    expect(red).not.toContain("The 4 × 4 Intervals");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 21, live());
    const late = wholeDay(), j = late.indexOf("Cable Lateral Raise");
    expect(late.slice(j, j + 4)).toEqual(["Cable Lateral Raise", "Copenhagen Plank, Knee or Ankle", "Landmine Rotation", "The 4 × 4 Intervals"]);
  });
});

describe("the landmine presses, the side neck raise and the medicine-ball drops", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  const modes = (card) => [...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id") + ":" + e.getAttribute("data-set-unit"));
  const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
  const sets = (card) => [within(card).getByTestId("card-pres").textContent.split(" · ")[0], card.querySelectorAll("[data-set-btn]").length];
  it("Tuesday: the one-arm landmine press straight after the bench and chin-ups, in added kilos; 3 × 8 each side, a set starts 2:00; two sets in week 4, 4 × 5 in week 5, 3 × 4 in week 9; none on a red morning", async () => {
    await at(2026, 11, 3, live());
    const rows = wholeDay();
    expect(rows.indexOf("One-Arm Landmine Press")).toBe(rows.indexOf("Bench Press + Weighted Chin-Up") + 1);
    expect(rows).not.toContain("Standing Overhead Press");
    const card = pick("One-Arm Landmine Press");
    expect(within(card).getByTestId("card-pres").textContent).toBe("3 × 8 each side · the heaviest that leaves two in you · Rest 2:00");
    expect(within(card).getByTestId("card-lib").textContent).toMatch(/^One end of a barbell in a landmine or a corner, the other end at your shoulder in one hand\./);
    expect(modes(card)).toEqual(["add:s_lmpress:reps"]);
    expect(within(card).getByTestId("weight-box").textContent).toMatch(/ADDED WEIGHT \(KG\)/);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(3);
    expect(within(card).queryByTestId("lift-ramp")).toBe(null);
    expect(within(card).queryByTestId("bar-speed")).toBe(null);
    fireEvent.change(within(card).getByTestId("weight-box").querySelector("input"), { target: { value: "20" } });
    expect(card.querySelector("[data-set-btn='1']").textContent).toMatch(/\+20 kg × 8/);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("2:00");
    expect(JSON.parse(localStorage.getItem("o8s-log"))["mSw1-tue-s_lmpress"].sets[0]).toMatchObject({ ok: true, w: "20", r: "8" });
    again();
    await at(2026, 11, 24, live());
    expect(sets(pick("One-Arm Landmine Press"))).toEqual(["2 × 8 each side", 2]);
    again();
    await at(2026, 12, 1, live());
    expect(sets(pick("One-Arm Landmine Press"))).toEqual(["4 × 5 each side", 4]);
    again();
    await at(2026, 12, 29, live());
    expect(sets(pick("One-Arm Landmine Press"))).toEqual(["3 × 4 each side", 3]);
    again();
    await at(2026, 11, 10, live(), { "o8s-ready": { "mSw2-tue": "R" } });
    const red = wholeDay();
    expect(red).not.toContain("One-Arm Landmine Press");
    expect(red).toContain("Chest-Supported Row + Weighted Dip");
  });
  it("Saturday: the one-arm landmine push press straight after the bench throw, in added kilos, with no ramp and no bar-speed box; 4 × 5 each side, a set starts 2:00; 5 × 3 in weeks 5 and 9; none on a red morning", async () => {
    await at(2026, 11, 7, live());
    const rows = wholeDay();
    const i = rows.indexOf("Bench Throw (Smith)");
    expect(rows.slice(i, i + 3)).toEqual(["Bench Throw (Smith)", "One-Arm Landmine Push Press", "Bench Press, Touch and Go + Pull-Up"]);
    expect(rows).not.toContain("Push Press");
    const card = pick("One-Arm Landmine Push Press");
    expect(within(card).getByTestId("card-pres").textContent).toBe("4 × 5 each side · every rep fast · Rest 2:00");
    expect(within(card).getByTestId("card-lib").textContent).toMatch(/^The landmine press with a leg drive\..* a rep clearly slower than the first ends the set\. When every rep of every set is fast, add the smallest step next time\.$/);
    expect(modes(card)).toEqual(["add:s_lmpush:reps"]);
    expect(within(card).getByTestId("weight-box").textContent).toMatch(/ADDED WEIGHT \(KG\)/);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(4);
    expect(within(card).queryByTestId("lift-ramp")).toBe(null);
    expect(within(card).queryByTestId("bar-speed")).toBe(null);
    fireEvent.change(within(card).getByTestId("weight-box").querySelector("input"), { target: { value: "15" } });
    expect(card.querySelector("[data-set-btn='1']").textContent).toMatch(/\+15 kg × 5/);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("2:00");
    again();
    await at(2026, 12, 5, live());
    expect(sets(pick("One-Arm Landmine Push Press"))).toEqual(["5 × 3 each side", 5]);
    again();
    await at(2027, 1, 2, live());
    expect(sets(pick("One-Arm Landmine Push Press"))).toEqual(["5 × 3 each side", 5]);
    again();
    await at(2026, 11, 14, live(), { "o8s-ready": { "mSw2-sat": "R" } });
    const red = wholeDay();
    expect(red).not.toContain("One-Arm Landmine Push Press");
    expect(red).toContain("Bench Press, Touch and Go + Pull-Up");
  });
  it("the lighter week's and test week's Saturday: the bench throw's profile alone, then the landmine push press at half the sets; no top triple in test week", async () => {
    await at(2026, 11, 28, live());
    const rows = wholeDay();
    const i = rows.indexOf("Load-Velocity Profile — Bench Throw");
    expect(i).toBeGreaterThan(0);
    /* from the audit's week the push press speed test sits between them */
    expect(rows.slice(i + 1, i + 3)).toEqual(["Push press speed test", "One-Arm Landmine Push Press"]);
    expect(rows).not.toContain("Bench Throw (Smith)");
    const prof = pick("Load-Velocity Profile — Bench Throw");
    expect(within(prof).getByTestId("card-pres").textContent).toBe("the bench throw at four loads · 2 reps each, the watch recording");
    expect(within(prof).getByRole("button", { name: "DRAW THE PROFILE" })).toBeInTheDocument();
    expect(prof.textContent).not.toMatch(/push press/i);
    expect(sets(pick("One-Arm Landmine Push Press"))).toEqual(["2 × 5 each side", 2]);
    again();
    await at(2027, 1, 23, live());
    const test = wholeDay();
    expect(test.some((r) => /top triple/i.test(r))).toBe(false);
    /* from the audit's week, test week redraws the bench throw's profile in its sets' place */
    expect(test).not.toContain("Bench Throw (Smith)");
    expect(test).toContain("Load-Velocity Profile — Bench Throw");
    expect(sets(pick("One-Arm Landmine Push Press"))).toEqual(["3 × 3 each side", 3]);
  });
  it("Wednesday: the side neck raise and the medicine-ball drops, back to back, after the lateral raise and before the nasal run; the neck's set goes straight into the drops, the drops' set starts 0:45; two sets each in week 4; they run on a red morning", async () => {
    await at(2026, 11, 4, live());
    const rows = wholeDay();
    const i = rows.indexOf("Dumbbell Lateral Raise");
    expect(rows.slice(i, i + 3)).toEqual(["Dumbbell Lateral Raise", "Side Neck Raise + Medicine-Ball Drops", "The Nasal Run"]);
    const card = pick("Side Neck Raise + Medicine-Ball Drops");
    expect(within(card).getAllByTestId("card-name").map((e) => e.textContent)).toEqual(["Side Neck Raise + Medicine-Ball Drops", "Side neck raise", "Medicine-ball drops"]);
    expect(within(card).getAllByTestId("card-pres").map((e) => e.textContent)).toEqual(["back to back · 45 s after each pair", "3 × 12–15 each side · no weight to start · straight into the drops", "3 × 8 · a 3 kg ball, up to 6 · Rest 45 s"]);
    expect(within(card).getAllByTestId("card-lib").map((e) => e.textContent.slice(0, 44))).toEqual(["Lie on your side on a bench with your head o", "Lie on your back, knees bent, a 3 kg ball he"]);
    expect(modes(card)).toEqual(["kg:s_neckside:reps", "bw:s_drops:reps"]);
    const parts = card.querySelectorAll("[data-pair-part]");
    expect([...parts].map((p) => p.querySelectorAll("[data-set-btn]").length)).toEqual([3, 3]);
    expect([...parts].map((p) => !!p.querySelector("[data-testid='weight-box']"))).toEqual([true, false]);
    fireEvent.click(within(parts[0]).getByRole("button", { name: "Set 1" }));
    expect(screen.queryByTestId("timer-title")).toBe(null);
    fireEvent.click(within(parts[1]).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("0:45");
    const log = JSON.parse(localStorage.getItem("o8s-log"));
    expect(log["mSw1-wed-s_neckside"].sets[0]).toMatchObject({ ok: true, r: "12" });
    expect(log["mSw1-wed-s_drops"].sets[0]).toMatchObject({ ok: true, r: "8" });
    again();
    await at(2026, 11, 25, live());
    expect([...pick("Side Neck Raise + Medicine-Ball Drops").querySelectorAll("[data-pair-part]")].map((p) => p.querySelectorAll("[data-set-btn]").length)).toEqual([2, 2]);
    again();
    await at(2026, 11, 11, live(), { "o8s-ready": { "mSw2-wed": "R" } });
    expect(wholeDay()).toContain("Side Neck Raise + Medicine-Ball Drops");
  });
  it("the week's card: Saturday's landmine push press by sets and reps, in the lighter week and test week too; week 2 reads last week's added weight, and NUMBERS keeps the old presses", async () => {
    const week = async (y, m, d) => {
      await at(y, m, d, live());
      fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" }));
      fireEvent.click(screen.getByRole("button", { name: "PLAN" }));
      fireEvent.click(screen.getByRole("button", { name: "THIS WEEK" }));
      return document.body.textContent;
    };
    expect(await week(2026, 11, 3)).toMatch(/Landmine push press \(Sat\)4 × 5 each side, every rep fast/);
    again();
    expect(await week(2026, 11, 24)).toMatch(/Landmine push press \(Sat\)2 × 5 each side, every rep fast/);
    again();
    expect(await week(2027, 1, 19)).toMatch(/Landmine push press \(Sat\)3 × 3 each side, every rep fast/);
    again();
    const seed = { "mSw1-tue-s_lmpress": { sets: [{ ok: true, w: "20", r: "8" }, { ok: true, w: "20", r: "8" }, { ok: true, w: "20", r: "8" }], n: "One-Arm Landmine Press", d: "2026-11-03" },
      "mSw1-sat-pushpress": { sets: [{ ok: true, w: "50", r: "5" }, { ok: true, w: "50", r: "5" }], n: "Push Press", d: "2026-11-07" },
      "mSw1-tue-s_ohp": { sets: [{ ok: true, w: "40", r: "6" }], n: "Standing Overhead Press", d: "2026-11-03" } };
    await at(2026, 11, 10, live(), { "o8s-log": seed });
    const card = pick("One-Arm Landmine Press");
    expect(within(card).getByTestId("last-time").textContent).toMatch(/^LAST TIME · TUE,? 3 NOV · \+20 KG × 8 · 8 · 8$/);
    expect(within(card).getByTestId("weight-box").querySelector("input").value).toBe("20");
    expect(within(card).queryByTestId("step-up")).toBe(null);
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "PROGRESS" }));
    fireEvent.click(screen.getByRole("button", { name: "NUMBERS" }));
    const hist = [...document.querySelectorAll("[data-lift-history]")].map((e) => e.textContent);
    expect(hist.some((t) => /^One-Arm Landmine Press\+20 kg/.test(t))).toBe(true);
    expect(hist.some((t) => /^Push Press50 kg/.test(t))).toBe(true);
    expect(hist.some((t) => /^Standing Overhead Press40 kg/.test(t))).toBe(true);
  });
});

describe("a card added later doesn't count against days trained before it", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  /* the first two weeks as they were ticked: every card that was on the day at the time */
  const DONE = {
    "mSw1-mon": ["A", "C", "D", "E", "F", "G"], "mSw1-tue": ["A", "C", "D", "E", "F", "G", "H"], "mSw1-wed": ["A", "B", "C", "D", "E", "R"],
    "mSw1-thu": ["A", "B", "C", "D", "F", "G", "H", "I"], "mSw1-sat": ["A", "B", "C", "D", "E", "F", "G", "H"], "mSw1-sun": ["A", "B", "C", "D", "E", "F", "G", "H", "R", "I"],
    "mSw2-mon": ["A", "C", "D", "E", "F", "G", "N", "Q"], "mSw2-tue": ["A", "K", "C", "D", "E", "F", "G", "H", "I"], "mSw2-wed": ["A", "B", "C", "D", "E", "R"],
    "mSw2-thu": ["A", "B", "C", "D", "F", "G", "J", "H", "I", "K"],
  };
  const week = () => { fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" })); fireEvent.click(screen.getByRole("button", { name: "PLAN" })); fireEvent.click(screen.getByRole("button", { name: "THIS WEEK" })); };
  const counts = () => { const o = {}; document.querySelectorAll("[data-day-count]").forEach((e) => { o[e.getAttribute("data-day-count")] = e.textContent; }); return o; };
  it("week 1, seen on Sunday 8 November: every finished day reads finished, against the cards it had", async () => {
    await at(2026, 11, 8, live(), { "o8s-done": DONE });
    week();
    expect(counts()).toEqual({ mon: "6/6", tue: "7/7", wed: "6/6", thu: "8/8", fri: "", sat: "8/8", sun: "10/10" });
  });
  it("week 2, seen on Thursday 12 November: Monday against 8, Tuesday 9, Wednesday 6, Thursday 10; the days to come against today's cards", async () => {
    await at(2026, 11, 12, live(), { "o8s-done": DONE });
    week();
    expect(counts()).toEqual({ mon: "8/8", tue: "9/9", wed: "6/6", thu: "10/10", fri: "", sat: "0/10", sun: "0/10" });
  });
  it("from a card's date on it counts: week 3's Monday without its box jumps is 8 of 9, its Tuesday without the landmine rotation 9 of 10, its Wednesday without the neck and drops 6 of 7", async () => {
    await at(2026, 11, 19, Object.assign(live(), { v16: true }), { "o8s-done": { "mSw3-mon": ["A", "C", "D", "E", "F", "G", "N", "Q"], "mSw3-tue": ["A", "K", "C", "D", "E", "F", "G", "H", "I"], "mSw3-wed": ["A", "B", "C", "D", "E", "R"] } });
    week();
    expect(counts()).toMatchObject({ mon: "8/9", tue: "9/10", wed: "6/7" });
  });
  it("the day's own page is as it was: Tuesday 3 November still lists the throws and the pressure rounds", async () => {
    await at(2026, 11, 3, live());
    const rows = wholeDay();
    expect(rows).toContain("Rotational Shot-Put Throw + Hook Throw");
    expect(rows).toContain("Pressure Rounds");
  });
});

describe("Tuesday's landmine rotation", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November */
  const live = () => base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP });
  const modes = (card) => [...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id") + ":" + e.getAttribute("data-set-unit"));
  const week = () => { fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" })); fireEvent.click(screen.getByRole("button", { name: "PLAN" })); fireEvent.click(screen.getByRole("button", { name: "THIS WEEK" })); };
  const counts = () => { const o = {}; document.querySelectorAll("[data-day-count]").forEach((e) => { o[e.getAttribute("data-day-count")] = e.textContent; }); return o; };
  const TUE = ["A", "K", "C", "D", "E", "F", "G", "H", "I"];
  it("Tuesday 17 November: straight after the landmine press, before the rows and dips; 3 sets in added kilos, a set starts 1:00", async () => {
    await at(2026, 11, 17, live());
    const rows = wholeDay();
    const i = rows.indexOf("One-Arm Landmine Press");
    expect(rows.slice(i, i + 3)).toEqual(["One-Arm Landmine Press", "Landmine Rotation", "Chest-Supported Row + Weighted Dip"]);
    const card = pick("Landmine Rotation");
    expect(within(card).getAllByTestId("card-pres")[0].textContent).toBe("3 × 6–8 each side · controlled · Rest 60 s");
    expect(modes(card)).toEqual(["add:s_landrot:reps"]);
    expect(within(card).getByTestId("weight-box").textContent).toMatch(/ADDED WEIGHT \(KG\)/);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(3);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("1:00");
  });
  it("one exercise on two days: Tuesday's weight starts from Saturday's, and Saturday's from Tuesday's", async () => {
    const set = (w, r) => ({ ok: true, w, r });
    await at(2026, 11, 17, live(), { "o8s-log": { "mSw2-sat-s_landrot": { sets: [set("10", "8"), set("10", "8"), set("10", "7")], n: "Landmine rotation", d: "2026-11-14" } } });
    let card = pick("Landmine Rotation");
    expect(within(card).getByTestId("last-time").textContent).toMatch(/^LAST TIME · SAT,? 14 NOV · \+10 KG × 8 · 8 · 7$/);
    expect(within(card).getByTestId("weight-box").querySelector("input").value).toBe("10");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 21, live(), { "o8s-log": { "mSw3-tue-s_landrot": { sets: [set("12.5", "7"), set("12.5", "7"), set("12.5", "6")], n: "Landmine rotation", d: "2026-11-17" } } });
    card = pick("Landmine Rotation");
    expect(within(card).getByTestId("last-time").textContent).toMatch(/^LAST TIME · TUE,? 17 NOV · \+12\.5 KG × 7 · 7 · 6$/);
    expect(within(card).getByTestId("weight-box").querySelector("input").value).toBe("12.5");
  });
  it("a red morning: the landmine press comes off, the rotation stays; two sets in weeks 4, 8 and test week", async () => {
    await at(2026, 11, 17, live(), { "o8s-ready": { "mSw3-tue": "R" } });
    const red = wholeDay();
    expect(red).not.toContain("One-Arm Landmine Press");
    expect(red[red.indexOf("Landmine Rotation") + 1]).toBe("Chest-Supported Row + Weighted Dip");
    for (const [m, d] of [[11, 24], [12, 22], [1, 19]]) {
      cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
      await at(m === 1 ? 2027 : 2026, m, d, live());
      const rows = wholeDay();
      expect(rows[rows.indexOf("Landmine Rotation") - 1]).toBe("One-Arm Landmine Press");
      expect(pick("Landmine Rotation").querySelectorAll("[data-set-btn]")).toHaveLength(2);
    }
  });
  it("THIS WEEK: Tuesday 10 November, trained before it, still reads 9/9; Tuesday 17 November counts it, 9/10 without and 10/10 with", async () => {
    await at(2026, 11, 12, live(), { "o8s-done": { "mSw2-tue": TUE } });
    week();
    expect(counts().tue).toBe("9/9");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 19, live(), { "o8s-done": { "mSw3-tue": TUE } });
    week();
    expect(counts().tue).toBe("9/10");
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 19, live(), { "o8s-done": { "mSw3-tue": TUE.concat("J") } });
    week();
    expect(counts().tue).toBe("10/10");
    expect(document.body.textContent).toMatch(/the landmine press and landmine rotations, rows, dips/);
  });
});

describe("the tape, the photos and PROGRESS", () => {
  it("week 4's Sunday: the photos, and the weekly check asks the arm and the shoulders", async () => {
    await at(2027, 3, 14, spp());
    const rows = wholeDay();
    expect(rows).toContain("The photos");
    const labels = [...pick("Weekly Check").querySelectorAll("label")].map((l) => l.textContent);
    expect(labels.some((l) => /^ARM \(CM\)/.test(l))).toBe(true);
    expect(labels.some((l) => /^SHOULDERS \(CM\)/.test(l))).toBe(true);
  });

  it("PROGRESS shows its own dashboard", async () => {
    await at(2027, 2, 17, spp());
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "PROGRESS" }));
    const text = document.body.textContent;
    expect(text).toMatch(/the dashboard — the numbers this cycle moves/i);
    expect(text).toMatch(/The 4 × 4 — the total at the end/);
    expect(text).toMatch(/Broad jump — test week/);
  });
});

describe("picking it in Settings", () => {
  it("on Thursday 29 October, with Prep running: no fitness question; the Prep carries on to its test day, then the twelve weeks from Monday 15 February", async () => {
    await at(2026, 10, 29, base({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }], season: PREP }));
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" }));
    fireEvent.click(screen.getByRole("button", { name: "SETTINGS" }));
    await screen.findByText("Fight booked?");
    ["PREP · 16-WEEK CYCLE", "STRENGTH, POWER, PHYSIQUE · 12 WEEKS"].forEach((n) => expect(screen.getByRole("button", { name: n })).toBeInTheDocument());
    /* Optimal 8 Fighter was retired on 23 November 2026 */
    expect(screen.queryByRole("button", { name: "OPTIMAL 8 FIGHTER" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "STRENGTH, POWER, PHYSIQUE · 12 WEEKS" }));
    expect(screen.queryByText("How fit you are right now")).toBe(null);
    const run = screen.getByTestId("prep-running");
    expect(within(run).getByRole("button", { name: "CARRY ON" })).toBeInTheDocument();
    expect(within(run).getByRole("button", { name: "START NOW" })).toBeInTheDocument();
    expect(run.textContent).toMatch(/The Prep carries on to its test day, then Strength, Power and Physique from Mon,? 15 Feb\./);
    fireEvent.click(screen.getByRole("button", { name: /^RE-PLAN FROM MON,? 2 NOV/ }));
    await waitFor(() => expect(saved().plans.length).toBe(2));
    const st = saved();
    expect(st.plans[1]).toMatchObject({ from: "2026-11-02", inputs: { spp: true } });
    expect(st.plans[1].inputs.restart).toBeUndefined();
    expect(st.planNote).toMatch(/^program Prep → Strength, Power and Physique\. From Mon,? 2 Nov: Prep carries on: P2 · P3 · P4 · P4b · P5 · P6 · P7 · P8 · P9 · P10 · P11 · P12 · P12b · P13 · P14, test day Sat,? 13 Feb; then Strength, Power and Physique's 12-week cycle from Mon,? 15 Feb\.$/);
    const kept = localStorage.getItem("o8s-settings");
    cleanup();
    await at(2026, 11, 2, kept);
    expect(title()).toMatch(/^Prep · Week 2 · P2 ·/);
    cleanup();
    await at(2027, 2, 15, kept);
    expect(title()).toBe("Strength & Power · Week 1 · Size");
  });
});

describe("repeat the week", () => {
  const PLANS = [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }];
  it("on Friday 13 November, in week 2: REPEAT WEEK 2 sits between CARRY ON and START AGAIN; re-planned, week 2 runs again from Monday 16 November and week 3 is on 23 November; the repeat isn't kept as an answer", async () => {
    await at(2026, 11, 13, base({ plans: PLANS, season: SPP }));
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" }));
    fireEvent.click(screen.getByRole("button", { name: "SETTINGS" }));
    await screen.findByText("Fight booked?");
    const run = screen.getByTestId("spp-running");
    ["CARRY ON", "REPEAT WEEK 2", "START AGAIN"].forEach((n) => expect(within(run).getByRole("button", { name: n })).toBeInTheDocument());
    fireEvent.click(within(run).getByRole("button", { name: "REPEAT WEEK 2" }));
    expect(run.textContent).toMatch(/Week 2 again from Mon,? 16 Nov\. Everything after it moves back a week; what you've ticked and logged stays\./);
    fireEvent.click(screen.getByRole("button", { name: /^RE-PLAN FROM MON,? 16 NOV/ }));
    await waitFor(() => expect(saved().plans.length).toBe(3));
    const st = saved();
    expect(st.plans[2]).toMatchObject({ from: "2026-11-16", inputs: { spp: true, repeat: true } });
    expect(st.season.repeat).toBeUndefined();
    expect(st.season.restart).toBeUndefined();
    expect(st.planNote).toMatch(/^Strength, Power and Physique repeats week 2\. From Mon,? 16 Nov: Strength, Power and Physique carries on: S2 · S3 · S4 · S5 · S6 · S7 · S8 · S9 · S10 · S11 · S12, test week from Mon,? 25 Jan; then the 12-week cycle again from Mon,? 1 Feb\.$/);
    const kept = localStorage.getItem("o8s-settings");
    cleanup();
    await at(2026, 11, 16, kept);
    expect(title()).toBe("Strength & Power · Week 2 · Size");
    cleanup();
    await at(2026, 11, 23, kept);
    expect(title()).toBe("Strength & Power · Week 3 · Size");
  });
});

describe("Optimal 8 · Move", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique from Monday 2 November; Move's week 1 is 16 November, SPP's week 3 */
  const live = (extra) => base(Object.assign({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP }, extra || {}));
  const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
  const levelIds = (card) => [...card.querySelectorAll("[data-level-id]")].map((e) => e.getAttribute("data-level-id"));
  it("Monday 16 November: the movement block in the warm-up's place, every move with levels showing its level; UP saves it; no morning five. The Monday before is as it was", async () => {
    await at(2026, 11, 16, live());
    expect(title()).toBe("Strength & Power · Week 3 · Size");
    let rows = wholeDay();
    expect(rows).not.toContain("The morning five");
    expect(rows).not.toContain("Warm-up");
    expect(rows.slice(rows.indexOf("The movement block"), rows.indexOf("The movement block") + 3)).toEqual(["The movement block", "Box Jumps", "Back Squat"]);
    const card = pick("The movement block");
    expect(within(card).getByTestId("card-pres").textContent).toBe("11 min · hips, knees and lower back");
    expect(within(card).getAllByTestId("row-level").map((e) => e.textContent)).toEqual(["LEVEL 1 OF 3 — Hands on the floor behind you", "LEVEL 1 OF 5 — Holding a rack upright",
      "LEVEL 1 OF 3 — 6-second holds", "LEVEL 1 OF 3 — A quarter squat"]);
    expect(card.textContent).toMatch(/Pedal easy for two minutes, easy enough to talk\./);
    expect(levelIds(card)).toEqual(["mv_9090", "mv_cossack", "mv_birddog", "mv_spanish"]);
    const cos = card.querySelector("[data-level-id='mv_cossack']");
    fireEvent.click(within(cos).getByRole("button", { name: "▲ UP" }));
    expect(screen.getByTestId("now-card").querySelector("[data-level-id='mv_cossack'] [data-testid='move-level-line']").textContent).toBe("LEVEL 2 OF 5 — No support");
    expect(JSON.parse(localStorage.getItem("o8s-log"))["move-lv"]).toEqual({ lv: { mv_cossack: 2 } });
    expect(within(screen.getByTestId("now-card")).getAllByTestId("row-level")[1].textContent).toBe("LEVEL 2 OF 5 — No support");
    again();
    await at(2026, 11, 9, live());
    rows = wholeDay();
    expect(rows).toContain("The morning five");
    expect(rows).toContain("Warm-up");
    expect(rows).not.toContain("The movement block");
  });
  it("the evenings: RANGE re-aimed, 27 cards, five nights; Session A on Wednesday, its levels on the cards; Thursday ends with the Copenhagen plank and its level", async () => {
    await at(2026, 11, 16, live());
    expect(pick("RANGE").textContent).toMatch(/CARD 1 OF 26/);
    again();
    await at(2026, 11, 18, live(), { "o8s-log": { "move-lv": { lv: { mv_curlup: 2 } } } });
    let rows = wholeDay();
    expect(rows).not.toContain("RANGE");
    const a = pick("Session A · hips, lower back, balance");
    expect(a.textContent).toMatch(/CARD 1 OF 16/);
    expect(levelIds(a)).toEqual(["mv_curlup", "mv_bridge", "mv_floor", "mv_balance", "mv_rnordic", "mv_squat", "mv_kneel", "mv_slr"]);
    fireEvent.click(within(a).getByRole("button", { name: "Next card" }));
    fireEvent.click(within(a).getByRole("button", { name: "Next card" }));
    expect(a.textContent).toMatch(/McGILL CURL-UP.*LEVEL 2 OF 3 — Elbows lifted/);
    again();
    await at(2026, 11, 19, live());
    rows = wholeDay();
    expect(rows).toContain("RANGE");
    expect(rows.indexOf("Copenhagen Plank, Knee or Ankle")).toBe(rows.indexOf("Nordic Curls") + 1);
    const cp = pick("Copenhagen Plank, Knee or Ankle");
    expect(cp.querySelectorAll("[data-set-btn]")).toHaveLength(2);
    expect(levelIds(cp)).toEqual(["mv_copen"]);
    expect(within(cp).getByTestId("move-level-line").textContent).toBe("LEVEL 1 OF 3 — Knee on the bench");
  });
  it("Sunday 22 November, Move's first test week: the back hold after the hammer curls, logged from the session into the standards; the fifteen standards on the weekly list; the lower back scored; Session B in the evening", async () => {
    await at(2026, 11, 22, live());
    const rows = wholeDay();
    expect(rows.indexOf("The Back Hold")).toBe(rows.indexOf("Hammer Curl") + 1);
    expect(rows).toContain("Session B · shoulders, mid-back, neck, wrists, ankles");
    expect(rows).not.toContain("RANGE");
    expect(rows).toContain("The fifteen standards");
    const bh = pick("The Back Hold");
    expect(bh.textContent).toMatch(/Standard 11, on MOVE's test weeks/);
    fireEvent.change(bh.querySelector("input"), { target: { value: "95" } });
    expect(JSON.parse(localStorage.getItem("o8s-log"))["mSw3-sun-mv11"]).toEqual({ w: "95" });
    const labels = [...pick("Weekly Check").querySelectorAll("label")].map((l) => l.textContent);
    expect(labels.indexOf("LOWER BACK (0–10)")).toBe(labels.indexOf("HIPS (0–10)") + 1);
    expect(labels).toContain("EVENINGS YOU DID RANGE OR A MOVEMENT SESSION (0–7)");
    const st = pick("The fifteen standards");
    fireEvent.click(within(st).getByRole("button", { name: "▶ THE STANDARDS" }));
    expect(screen.getAllByText("THE FIFTEEN STANDARDS").length).toBeGreaterThan(0);
    expect(screen.getByTestId("move-gym-field").textContent).toBe("95 S · FROM SUNDAY'S SESSION");
  });
  it("Sunday 29 November: the back extension held still, 3 × 30 s; Sunday 15 November is as it was", async () => {
    await at(2026, 11, 29, live());
    const rows = wholeDay();
    expect(rows).not.toContain("The fifteen standards");
    expect(within(pick("Back Extension")).getByTestId("card-pres").textContent).toMatch(/^3 × 30 s · body straight/);
    again();
    await at(2026, 11, 15, live());
    const before = wholeDay();
    expect(before).not.toContain("Back Extension");
    expect(before).toContain("The morning five");
    expect(before).toContain("RANGE");
    expect(before).not.toContain("Session B · shoulders, mid-back, neck, wrists, ankles");
  });
  it("PROGRESS: the standards, test week by test week; Settings moves week 1, and the weeks before it keep the warm-up", async () => {
    await at(2026, 12, 15, live(), { "o8s-log": { "mSw3-range-mv1": { w: "8" }, "mSw3-range-mv3": { w: "45" }, "mSw3-sun-mv11": { w: "95" }, "mSw7-range-mv1": { w: "10" }, "mSw7-range-mv3": { w: "80" } } });
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "PROGRESS" }));
    fireEvent.click(screen.getAllByRole("button", { name: "RANGE" })[0]);
    const t = screen.getByTestId("move-track");
    expect(t.querySelector("[data-track-standard='s1']").textContent).toBe("1. Floor to standing · 10 out of 10WEEK 1 · 8WEEK 5 · 10 ✓");
    expect(t.querySelector("[data-track-standard='s3']").textContent).toBe("3. Deep squat · 2 minWEEK 1 · 45WEEK 5 · 80");
    expect(t.querySelector("[data-track-standard='s11']").textContent).toBe("11. Back hold · 3 minWEEK 1 · 95WEEK 5 · —");
    again();
    await at(2026, 11, 16, live({ moveStart: "2026-11-23" }));
    const rows = wholeDay();
    expect(rows).toContain("Warm-up");
    expect(rows).toContain("The morning five");
  });
});

describe("the engine base", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique from Monday 2 November; the engine base from 16 November, SPP's week 3 */
  const live = (extra) => base(Object.assign({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP }, extra || {}));
  const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
  it("Saturday 21 November: the easy hour in the evening, before RANGE, 45 minutes on the bike with the easy zone and its own timer; ticked, it's logged. Saturday 14 November has none; Saturday 28 November, the lighter week, 30", async () => {
    await at(2026, 11, 21, live());
    let rows = wholeDay();
    expect(rows.indexOf("RANGE")).toBe(rows.indexOf("The easy hour") + 1);
    const card = pick("The easy hour");
    expect(within(card).getByTestId("card-pres").textContent).toBe("45 min on the bike · nose only · + 500 ml water");
    expect(card.textContent).toMatch(/Strength, Power and Physique's: 45 minutes on a bike, easy enough to talk in full sentences/);
    expect(screen.getByTestId("easy-zone-range").textContent).toMatch(/^117–135/);
    fireEvent.click(within(card).getByRole("button", { name: "▶ START · 45 MIN" }));
    expect(screen.getByTestId("timer-title").textContent).toBe("THE EASY HOUR");
    expect(screen.getByTestId("timer-part").textContent).toMatch(/^EASY — NOSE ONLY/);
    again();
    await at(2026, 11, 21, live());
    fireEvent.click(within(pick("The easy hour")).getByRole("button", { name: "DONE" }));
    expect(JSON.parse(localStorage.getItem("o8s-log"))["mSw3-easyhour"]).toMatchObject({ ok: true, d: "sat" });
    again();
    await at(2026, 11, 14, live());
    expect(wholeDay()).not.toContain("The easy hour");
    again();
    await at(2026, 11, 28, live());
    expect(within(pick("The easy hour")).getByTestId("card-pres").textContent).toBe("30 min on the bike · nose only · + 500 ml water");
  });
  it("Sunday's nasal run: 40 minutes on 22 November, 30 in the lighter week and before the engine base; Wednesday's stays 30", async () => {
    for (const [d, want] of [[22, "40 min"], [29, "30 min"], [15, "30 min"], [18, "30 min"]]) {
      await at(2026, 11, d, live());
      expect(within(pick("The Nasal Run")).getByTestId("card-pres").textContent).toBe(want + " easy, nose only · 65–75% of peak");
      again();
    }
  });
});

describe("Optimal 8 · Move, put right", () => {
  const live = (extra) => base(Object.assign({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP }, extra || {}));
  const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
  /* the range standards all met at Move's weeks 1 and 5 (SPP weeks 3 and 7) but the toe touch */
  const MET = { mv3: "120", mv4_r: "y", mv4_l: "y", mv4_sw: "y", mv5: "n", mv5_cm: "4", mv6: "y", mv7_r: "0", mv7_l: "0", mv8_r: "12", mv8_l: "12", mv12_r: "y", mv12_l: "y", mv13_r: "52", mv13_l: "50", mv15_r: "y", mv15_l: "y" };
  const LOG = {}; ["mSw3", "mSw7"].forEach((w) => Object.keys(MET).forEach((k) => { LOG[w + "-range-" + k] = { w: MET[k] }; }));
  const sheetCard = (id) => document.querySelector("[data-move-test='" + id + "']").parentElement;
  it("Saturday 21 November: the Achilles pushes in the block, 11 minutes, one leg at a time at 8 out of 10, the stops above the bar; the Copenhagen plank in the session, at its level; RANGE's 26 cards with one-leg balance at your level", async () => {
    await at(2026, 11, 21, live(), { "o8s-log": { "move-lv": { lv: { mv_balance: 2 } } } });
    let card = pick("The movement block");
    expect(within(card).getByTestId("card-pres").textContent).toBe("11 min · mid-back, shoulders and Achilles");
    expect(card.textContent).toMatch(/Achilles pushes\s*5 × 4 each leg · 3 s on, 3 s off · 8 out of 10/);
    expect(card.textContent).toMatch(/On the Smith machine, with the safety stops set just above the bar so it can't rise\. Stand on one leg/);
    card = pick("Copenhagen Plank, Knee or Ankle");
    expect(within(card).getAllByTestId("move-level-line").map((e) => e.textContent)).toEqual(["LEVEL 1 OF 3 — Knee on the bench"]);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(2);
    const range = pick("RANGE");
    expect(range.textContent).toMatch(/CARD 1 OF 26/);
    for (let k = 0; k < 16; k++) fireEvent.click(within(range).getByRole("button", { name: "Next card" }));
    expect(range.textContent).toMatch(/CARD 17 OF 26ONE-LEG BALANCE — RIGHT LEG/);
    expect(range.textContent).toMatch(/LEVEL 2 OF 3 — Eyes closed/);
  });
  it("the standards: the neck turn in degrees; no end to mark at the first test; at the second, the toe touch short both times can be marked YOUR END, and it counts for THE KEEP and shows in PROGRESS", async () => {
    await at(2026, 11, 22, live(), { "o8s-log": LOG });
    fireEvent.click(within(pick("The fifteen standards")).getByRole("button", { name: "▶ THE STANDARDS" }));
    expect(screen.queryAllByRole("button", { name: "THIS IS MY END" })).toHaveLength(0);
    expect(sheetCard("s14").querySelectorAll("input")).toHaveLength(2);
    expect(within(sheetCard("s14")).queryAllByRole("button", { name: "YES" })).toHaveLength(0);
    again();
    await at(2026, 12, 20, live(), { "o8s-log": LOG });
    fireEvent.click(within(pick("The fifteen standards")).getByRole("button", { name: "▶ THE STANDARDS" }));
    expect(screen.getAllByRole("button", { name: "THIS IS MY END" })).toHaveLength(1);
    expect(within(sheetCard("s5")).getByTestId("move-end").textContent).toMatch(/^Only if all three are true: this test and the last both fell short with no gain/);
    fireEvent.click(within(sheetCard("s5")).getByRole("button", { name: "THIS IS MY END" }));
    expect(JSON.parse(localStorage.getItem("o8s-log"))["move-end"]).toEqual({ ends: { s5: "2026-12-20" } });
    expect(sheetCard("s5").querySelector("[data-move-test='s5']").textContent).toBe("5. Toe touchYOUR END");
    expect(within(sheetCard("s5")).getAllByRole("button", { name: "UNDO — NOT MY END" })).toHaveLength(1);
    expect(screen.getByText("Every range standard met or marked as your end: from next week RANGE drops to THE KEEP, 10 minutes.")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("o8s-log"));
    again();
    await at(2026, 12, 21, live(), { "o8s-log": saved });
    let rows = wholeDay();
    expect(rows).toContain("THE KEEP");
    expect(rows).not.toContain("RANGE");
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "PROGRESS" }));
    fireEvent.click(screen.getAllByRole("button", { name: "RANGE" })[0]);
    expect(screen.getByTestId("move-track").querySelector("[data-track-standard='s5']").textContent).toBe("5. Toe touch · Palms flat · YOUR ENDWEEK 1 · NOWEEK 5 · NO");
    again();
    await at(2026, 12, 21, live(), { "o8s-log": LOG });
    rows = wholeDay();
    expect(rows).toContain("RANGE");
    expect(rows).not.toContain("THE KEEP");
  });
});

describe("Optimal 8 · Move · the tendon work, from Monday 23 November", () => {
  const live = (extra) => base(Object.assign({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP }, extra || {}));
  const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
  const pres = (card) => within(card).getAllByTestId("card-pres").map((e) => e.textContent);
  const btns = (card) => [...card.querySelectorAll("[data-set-btn]")].map((e) => e.textContent);
  const modes = (card) => [...card.querySelectorAll("[data-set-mode]")].map((e) => e.getAttribute("data-set-mode") + ":" + e.getAttribute("data-set-id") + ":" + e.getAttribute("data-set-unit"));
  const levels = (card) => within(card).queryAllByTestId("move-level-line").map((e) => e.textContent);
  it("Monday 23 November: the block is 8 minutes without the Spanish squat; the lower pushes after the box jumps and the profile, before the Romanian deadlift, one leg at a time at 8 out of 10, five sets of four pushes that start no clock; the calf raise on a towel", async () => {
    await at(2026, 11, 23, live());
    const rows = wholeDay();
    expect(rows.slice(rows.indexOf("The movement block"), rows.indexOf("The movement block") + 6)).toEqual(["The movement block", "Kneeling Jump into Box Jump", "Load-Velocity Profile — Squat", "Achilles pushes", "Knee pushes", "Romanian Deadlift"]);
    expect(rows).toContain("Towel Calf Raise + Hanging Leg Raise");
    const block = pick("The movement block");
    expect(within(block).getByTestId("card-pres").textContent).toBe("8 min · hips, knees and lower back");
    expect(block.textContent).not.toMatch(/Spanish squat/);
    let card = pick("Achilles pushes");
    expect(pres(card)).toEqual(["5 × 4 each leg · 3 s on, 3 s off · 8 out of 10, the first two weeks · Rest while the other leg pushes"]);
    expect(card.textContent).toMatch(/On the Smith machine, with the safety stops set just above the bar so it can't rise\./);
    expect(btns(card)).toEqual(["SET 14", "SET 24", "SET 34", "SET 44", "SET 54"]);
    expect(modes(card)).toEqual(["bw:s_achpush:reps"]);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.queryByTestId("timer-title")).toBe(null);
    expect(JSON.parse(localStorage.getItem("o8s-log"))["mSw4-mon-s_achpush"].sets[0]).toEqual({ ok: true, r: "4" });
    card = pick("Knee pushes");
    expect(modes(card)).toEqual(["bw:s_kneepush:reps"]);
    expect(card.textContent).toMatch(/the start position set so your knee is bent to a right angle, and the pin at the bottom of the stack/);
    card = pick("Towel Calf Raise + Hanging Leg Raise");
    expect(card.textContent).toMatch(/The standing calf raise, on the machine, with a rolled towel under your toes/);
  });
  it("a red morning: the pushes stay, at half effort; from week 3 as hard as you can; Achilles or knee at 3 or more on Sunday's check, 7 out of 10", async () => {
    await at(2026, 11, 30, live(), { "o8s-ready": { "mSw5-mon": "R" } });
    expect(wholeDay().filter((r) => /box jump/i.test(r))).toEqual([]);
    expect(pres(pick("Achilles pushes"))).toEqual(["5 × 4 each leg · 3 s on, 3 s off · half effort, a red morning · Rest while the other leg pushes"]);
    expect(pres(pick("Knee pushes"))[0]).toMatch(/half effort, a red morning/);
    again();
    await at(2026, 12, 7, live());
    expect(pres(pick("Achilles pushes"))[0]).toMatch(/· as hard as you can ·/);
    again();
    await at(2026, 12, 7, live(), { "o8s-log": { "mSw5-sun-wr_ach": { w: "3" } } });
    expect(pres(pick("Knee pushes"))[0]).toMatch(/· 7 out of 10, the tendon gate ·/);
  });
  it("Thursday 26 November: the lower pushes after the trap bar's profile; the hip pair last, each at its level, two sets that start 0:20; the upper pushes before RANGE in the evening, two cards at 8 out of 10", async () => {
    await at(2026, 11, 26, live());
    const rows = wholeDay();
    /* the scoop throw, the core's third day of throws, comes between them from 23 November (core.js) */
    expect(rows.slice(rows.indexOf("Load-Velocity Profile — Trap Bar"), rows.indexOf("Load-Velocity Profile — Trap Bar") + 4)).toEqual(["Load-Velocity Profile — Trap Bar", "Rotational Scoop Throw", "Achilles pushes", "Knee pushes"]);
    expect(rows.indexOf("RANGE")).toBe(rows.indexOf("The upper pushes") + 1);
    let card = pick("Copenhagen lifts");
    expect(levels(card)).toEqual(["LEVEL 1 OF 3 — Knee on the bench"]);
    expect(btns(card)).toEqual(["SET 14", "SET 24"]);
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-count").textContent).toBe("0:20");
    fireEvent.click(screen.getByRole("button", { name: "CLOSE TIMER" }));
    card = pick("Star side plank");
    expect(levels(card)).toEqual(["LEVEL 1 OF 3 — From your bottom knee, the top leg straight"]);
    expect(card.textContent).toMatch(/Lift your top leg straight up about 30 cm, toes pointing forward, hold for 3 seconds, and lower for 3/);
    const up = pick("The upper pushes");
    expect(within(up).getByTestId("card-pres").textContent).toBe("8 min · shoulders and wrists");
    expect(up.textContent).toMatch(/CARD 1 OF 2SHOULDER PUSHES/);
    expect(within(up).getByTestId("routine-level").textContent).toBe("8 OUT OF 10, THE FIRST TWO WEEKS");
    fireEvent.click(within(up).getByRole("button", { name: "Next card" }));
    expect(up.textContent).toMatch(/CARD 2 OF 2WRIST PUSHES/);
  });
  it("Saturday 28 November: the block is 7 minutes, mid-back and shoulders, the Achilles pushes out of it; the lower pushes straight after; the hip pair in the Copenhagen plank's place", async () => {
    await at(2026, 11, 28, live());
    const rows = wholeDay();
    expect(rows.slice(rows.indexOf("The movement block"), rows.indexOf("The movement block") + 4)).toEqual(["The movement block", "Achilles pushes", "Knee pushes", "Medicine-Ball Chest Pass + Rotational Scoop Throw"]);
    expect(rows.slice(rows.indexOf("Cable Lateral Raise"), rows.indexOf("Cable Lateral Raise") + 4)).toEqual(["Cable Lateral Raise", "Copenhagen lifts", "Star side plank", "Landmine Rotation"]);
    const block = pick("The movement block");
    expect(within(block).getByTestId("card-pres").textContent).toBe("7 min · mid-back and shoulders");
    expect(block.textContent).not.toMatch(/Achilles pushes/);
    expect(rows).not.toContain("The upper pushes");
  });
  it("Sunday 29 November: Session B is 35 minutes, 16 cards, the shoulder and wrist pushes in the turn-out lifts' place; a red Tuesday's upper pushes at half effort; Monday 14 December, Move's test week, the tendon numbers", async () => {
    await at(2026, 11, 29, live());
    const b = pick("Session B · shoulders, mid-back, neck, wrists, ankles");
    expect(within(b).getByTestId("card-pres").textContent).toBe("35 min");
    expect(b.textContent).toMatch(/CARD 1 OF 16/);
    for (let k = 0; k < 6; k++) fireEvent.click(within(b).getByRole("button", { name: "Next card" }));
    expect(b.textContent).toMatch(/CARD 7 OF 16SHOULDER PUSHES/);
    expect(within(b).getByTestId("routine-level").textContent).toBe("8 OUT OF 10, THE FIRST TWO WEEKS");
    again();
    await at(2026, 12, 1, live(), { "o8s-ready": { "mSw5-tue": "R" } });
    expect(within(pick("The upper pushes")).getByTestId("routine-level").textContent).toBe("HALF EFFORT, A RED DAY");
    again();
    await at(2026, 12, 14, live());
    const rows = wholeDay();
    expect(rows.slice(rows.indexOf("Kneeling Jump into Box Jump"), rows.indexOf("Kneeling Jump into Box Jump") + 4)).toEqual(["Kneeling Jump into Box Jump", "Achilles pushes", "Single-leg leg extension, heaviest 5", "Back Squat"]);
    const t = pick("Single-leg leg extension, heaviest 5");
    expect(pres(t)).toEqual(["the heaviest you can lift for 5 clean reps, each leg · a tendon number · Rest 2:00 between the heavy sets"]);
    expect(t.querySelectorAll("input")).toHaveLength(2);
    expect(pick("Towel Calf Raise + Hanging Leg Raise").textContent).toMatch(/Towel calf raise, heaviest 5/);
  });
});

describe("Optimal 8 · Move in every program — Prep, the camp and the transition", () => {
  const CI = { booked: true, fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "moderate", emphasis: "none" };
  const prepNow = () => base({ plans: [{ from: "2026-11-30", made: "2026-11-29", inputs: PREP }], season: PREP });
  const campNow = (x) => base(Object.assign({ plans: [{ from: "2027-01-04", made: "2027-01-01", inputs: CI }], season: CI, fightDate: "2027-03-13" }, x || {}));
  const cycle = (extra) => Object.assign({ start: "2026-01-05", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
    imStart: "2026-01-05", rangeStart: "2026-01-05", camp: false, lastTen: false, taper: false, levelStart: "2026-01-05", program: "prep", v12: true }, extra || {});
  const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
  const pres = (card) => within(card).getAllByTestId("card-pres").map((e) => e.textContent);
  const lvl = (card) => within(card).queryAllByTestId("routine-level").map((e) => e.textContent);
  const sl = (rows, a, n) => rows.slice(rows.indexOf(a), rows.indexOf(a) + n);
  it("Prep, Tuesday 1 December: the movement block opens the session; the lower pushes after the pistol line at 8 out of 10; THE BRACE's side plank; the towel calf raise straight after the seated one; the upper pushes before RANGE; no holds and no morning five", async () => {
    await at(2026, 12, 1, prepNow());
    const rows = wholeDay();
    expect(rows.find((r) => r === "The movement block" || r === "Warm-up")).toBe("The movement block");
    expect(sl(rows, "The Pistol Line", 3)).toEqual(["The Pistol Line", "Achilles pushes", "Knee pushes"]);
    expect(sl(rows, "Seated calf raise", 2)).toEqual(["Seated calf raise", "Towel calf raise"]);
    expect(rows.filter((r) => /Spanish|Achilles hold|morning five/i.test(r))).toEqual([]);
    expect(rows.indexOf("RANGE")).toBe(rows.indexOf("The upper pushes") + 1);
    expect(pres(pick("The movement block"))[0]).toBe("12 min · hips, balance and sprint prep");
    expect(pres(pick("Achilles pushes"))).toEqual(["5 × 4 each leg · 3 s on, 3 s off · 8 out of 10, the first two weeks · Rest while the other leg pushes"]);
    let c = pick("THE BRACE");
    expect(pres(c)[0]).toBe("3 rounds · the side plank in the first 2 · 20 s between exercises · 60 s after each round");
    expect([/COPENHAGEN PLANK/.test(c.textContent), /FOREARM SIDE PLANK/.test(c.textContent)]).toEqual([false, true]);
    c = pick("Towel calf raise");
    expect(pres(c)).toEqual(["2 × 6–10 · 3 s up, 2 s at the top, 3 s down, 2 s at the bottom · Rest 60 s"]);
    expect(c.textContent).toMatch(/The standing calf raise, on the machine, with a rolled towel under your toes/);
    expect(lvl(pick("The upper pushes"))).toEqual(["8 OUT OF 10, THE FIRST TWO WEEKS"]);
  });
  it("Prep, Monday 30 November, Wednesday 2 and Saturday 5 December: Monday's block 9 minutes and no pushes; the hip pair last on Wednesday and Saturday; Session A on Wednesday evening; Saturday's lower pushes after the side bounds, before the squat", async () => {
    await at(2026, 11, 30, prepNow());
    let rows = wholeDay();
    expect(pres(pick("The movement block"))[0]).toBe("9 min · hips, ankles and overhead");
    expect(rows.filter((r) => /pushes|Copenhagen lifts/.test(r))).toEqual([]);
    expect(rows.includes("RANGE") && !rows.includes("The upper pushes")).toBe(true);
    again();
    await at(2026, 12, 2, prepNow());
    rows = wholeDay();
    expect(pres(pick("The movement block"))[0]).toBe("10 min · hips, knees and lower back");
    expect(sl(rows, "Farmer's Carry", 3)).toEqual(["Farmer's Carry", "Copenhagen lifts", "Star side plank"]);
    expect(rows.includes("Session A · hips, lower back, balance") && !rows.includes("RANGE")).toBe(true);
    again();
    await at(2026, 12, 5, prepNow());
    rows = wholeDay();
    expect(sl(rows, "Side Bounds — straight sideways", 4)).toEqual(["Side Bounds — straight sideways", "Achilles pushes", "Knee pushes", "Back Squat"]);
    expect(sl(rows, "Bear-Hug Carry", 3)).toEqual(["Bear-Hug Carry", "Copenhagen lifts", "Star side plank"]);
  });
  it("Prep, Sunday 6 December: the block 14 minutes, the back extension after the core block, Session B 35 minutes, 16 cards", async () => {
    await at(2026, 12, 6, prepNow());
    const rows = wholeDay();
    expect(pres(pick("The movement block"))[0]).toBe("14 min · the whole body, then the power prep");
    expect(sl(rows, "Hands", 2)).toEqual(["Hands", "Back Extension"]);
    const b = pick("Session B · shoulders, mid-back, neck, wrists, ankles");
    expect(pres(b)[0]).toBe("35 min");
    expect(b.textContent).toMatch(/CARD 1 OF 16/);
  });
  it("the camp: Tuesday 5 January as Prep's, as hard as you can; its final week, Tuesday 9 March, one dose of each at half effort; Thursday 11 March none", async () => {
    await at(2027, 1, 5, campNow());
    let rows = wholeDay();
    expect(sl(rows, "The Pistol Line", 3)).toEqual(["The Pistol Line", "Achilles pushes", "Knee pushes"]);
    expect(sl(rows, "Seated calf raise", 2)).toEqual(["Seated calf raise", "Towel calf raise"]);
    expect(pres(pick("Achilles pushes"))[0]).toBe("5 × 4 each leg · 3 s on, 3 s off · as hard as you can · Rest while the other leg pushes");
    expect(rows.indexOf("RANGE")).toBe(rows.indexOf("The upper pushes") + 1);
    again();
    await at(2027, 3, 9, campNow());
    rows = wholeDay();
    expect(title()).toBe("Camp · Week 10 · FW · Fight Week");
    expect(sl(rows, "Bench throws", 3)).toEqual(["Bench throws", "Achilles pushes", "Knee pushes"]);
    expect(rows.includes("The movement block")).toBe(false);
    expect(pres(pick("Knee pushes"))[0]).toBe("5 × 4 each leg · 3 s on, 3 s off · half effort, the camp's final week · Rest while the other leg pushes");
    expect(lvl(pick("The upper pushes"))).toEqual(["HALF EFFORT, THE CAMP'S FINAL WEEK"]);
    expect(rows.indexOf("RANGE — FIGHT WEEK")).toBe(rows.indexOf("The upper pushes") + 1);
    again();
    await at(2027, 3, 11, campNow());
    expect(wholeDay().filter((r) => /pushes|movement block|Session [AB]/.test(r))).toEqual([]);
  });
  it("the week before the camp: its own sessions as written, MOVE's evenings — the upper pushes on Tuesday, Session A on Wednesday, Session B on Sunday — and no morning five", async () => {
    await at(2027, 1, 2, campNow());
    const rows = wholeDay();
    expect([rows.includes("Warm-up"), rows.includes("The movement block")]).toEqual([true, false]);
    for (const [d, n] of [[[2026, 12, 29], "The upper pushes"], [[2026, 12, 30], "Session A · hips, lower back, balance"], [[2027, 1, 3], "Session B · shoulders, mid-back, neck, wrists, ankles"]]) {
      again();
      await at(d[0], d[1], d[2], campNow());
      const r = wholeDay();
      expect([title(), r.includes(n), r.includes("The morning five")]).toEqual(["Camp · Before Week 1", true, false]);
    }
  });
  it("the transition, the head check answered: none in its first days; Thursday 18 and Monday 22 March the lower and upper pushes at 7 out of 10", async () => {
    const H = { head: { "2027-03-13": { a: "no", at: "2027-03-14" } } };
    await at(2027, 3, 15, campNow(H));
    expect(wholeDay().filter((r) => /pushes|Session [AB]/.test(r))).toEqual([]);
    for (const d of [18, 22]) {
      again();
      await at(2027, 3, d, campNow(H));
      expect(sl(wholeDay(), "Base — easy, nose only", 3)).toEqual(["Base — easy, nose only", "Achilles pushes", "Knee pushes"]);
      expect(pres(pick("Achilles pushes"))[0]).toBe("5 × 4 each leg · 3 s on, 3 s off · 7 out of 10, the transition · Rest while the other leg pushes");
      expect(lvl(pick("The upper pushes"))).toEqual(["7 OUT OF 10, THE TRANSITION"]);
    }
  });
  it("THE CORE, from 23 November: Prep's Monday ends with the crunch, the dead bug and the woodchop; its Tuesday's box jumps are the kneeling jump into box jump; Wednesday's sit-up and landmine rotation follow the hip pair", async () => {
    await at(2026, 11, 30, prepNow());
    let rows = wholeDay();
    expect(sl(rows, "Cable Crunch + Dead Bug", 2)).toEqual(["Cable Crunch + Dead Bug", "Cable Woodchop"]);
    let card = pick("Cable Woodchop");
    expect(pres(card)[0]).toBe("2 × 10 each side · high to low · Rest 45 s");
    expect(card.textContent).toMatch(/a cable at the top of the stack with a single handle/i);
    again();
    await at(2026, 12, 1, prepNow());
    rows = wholeDay();
    expect(rows).toContain("Kneeling jump into box jump");
    expect(rows).not.toContain("Box jump");
    card = pick("Kneeling jump into box jump");
    expect(card.textContent).toMatch(/Kneel tall on a mat, toes tucked under/);
    again();
    await at(2026, 12, 2, prepNow());
    rows = wholeDay();
    expect(sl(rows, "Star side plank", 2)).toEqual(["Star side plank", "Weighted Decline Sit-Up + Landmine Rotation"]);
    expect(pick("Weighted Decline Sit-Up + Landmine Rotation").textContent).toMatch(/On a decline bench, feet hooked under the pads/);
  });
  it("before MOVE, Prep's own cycle reads as it did: the warm-up, the morning five, the holds, THE BRACE's Copenhagen plank", async () => {
    await at(2026, 1, 6, cycle());
    const rows = wholeDay();
    expect(rows.includes("The movement block")).toBe(false);
    expect(rows.includes("The morning five")).toBe(true);
    expect(rows.filter((r) => /pushes|Towel calf/.test(r))).toEqual([]);
    expect(rows.filter((r) => /Spanish squat hold|Achilles hold/i.test(r)).length > 0).toBe(true);
    expect(pres(pick("THE BRACE"))[0]).toMatch(/the Copenhagen plank in/);
  });
});

describe("the audit's changes, from Monday 23 November", () => {
  /* the plan in use: Prep from 26 October, Strength, Power and Physique started on Monday 2 November.
     Week 4, the lighter week, is from 23 November; week 5 from 30 November; week 9, the power block,
     from 28 December; week 12, test week, from 18 January */
  const live = (extra) => base(Object.assign({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: PREP }, { from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], season: SPP }, extra || {}));
  const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
  const skip = () => fireEvent.click(screen.getAllByRole("button", { name: "SKIP" }).pop());
  const part = () => [screen.getByTestId("timer-part").textContent, screen.getByTestId("timer-count").textContent];
  const pres = (card) => within(card).getAllByTestId("card-pres").map((e) => e.textContent);
  it("Tuesday 1 December: the knuckle hold after the ab wheel, three sets of 20 seconds; the pressure rounds' third minute is arms only, from burst 7 of 9, 58 steps, and they log the minutes at 90% or above. Tuesday 17 November is as it was", async () => {
    await at(2026, 12, 1, live());
    const rows = wholeDay(), i = rows.indexOf("Ab Wheel Rollout");
    /* the side bend, the core's third on Tuesday, sits between the ab wheel and the knuckle hold from 23 November (core.js) */
    expect(rows.slice(i, i + 5)).toEqual(["Ab Wheel Rollout", "Dumbbell Side Bend", "Knuckle Hold", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute"]);
    expect(rows).not.toContain("The Arms-Only Test");
    expect(rows).not.toContain("Rotational throw for distance");
    let card = pick("Knuckle Hold");
    expect(pres(card)).toEqual(["3 × 20 s · on your fists, wrists dead straight · Rest 30 s"]);
    expect(card.querySelectorAll("[data-set-btn]")).toHaveLength(3);
    card = pick("Pressure Rounds, Arms-Only Third Minute");
    expect(pres(card)).toEqual(["On the assault bike, straight after the bursts: 1 minute easy, then 3 rounds of 3 minutes with 1 minute's rest between — in each, a 5-second burst all out every 20 seconds, a steady pace between, and the third minute arms only, feet on the pegs — then 2 minutes easy"]);
    expect(card.textContent).toMatch(/Minute three, arms only: your feet on the pegs on the fork, legs still/);
    expect(card.textContent).toMatch(/PEAK HEART RATE \(BPM\)MINUTES AT 90% OR ABOVE · THE POLAR'S TOP ZONE/);
    fireEvent.click(within(card).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("3 PRESSURE ROUNDS");
    expect(screen.getAllByText(/STEP 1 \/ 58 · 14:00 LEFT/).length).toBeGreaterThan(0);
    skip();
    expect(part()).toEqual(["BURST 1 OF 9 — ALL OUT", "0:05"]);
    for (let k = 0; k < 11; k++) skip();
    expect(part()).toEqual(["ROUND 1 OF 3 · STEADY — NEVER STOP", "0:15"]);
    skip();
    expect(part()).toEqual(["BURST 7 OF 9 — ARMS ONLY, ALL OUT", "0:05"]);
    skip();
    expect(part()).toEqual(["ROUND 1 OF 3 · ARMS ONLY, STEADY — NEVER STOP", "0:15"]);
    again();
    await at(2026, 11, 17, live());
    const was = wholeDay();
    expect(was).toContain("Pressure Rounds");
    expect(was).not.toContain("Knuckle Hold");
  });
  it("Tuesday 24 November, the lighter week: the rotational throw for distance first; two knuckle holds; one pressure round, then the arms-only test, 3 minutes and 2 easy", async () => {
    await at(2026, 11, 24, live());
    const rows = wholeDay(), b = rows.indexOf("The movement block"), k = rows.indexOf("Knuckle Hold");
    expect(rows.slice(b, b + 3)).toEqual(["The movement block", "Rotational throw for distance", "Rotational Shot-Put Throw + Hook Throw"]);
    expect(rows.slice(k, k + 4)).toEqual(["Knuckle Hold", "Assault Bike Bursts", "Pressure Rounds, Arms-Only Third Minute", "The Arms-Only Test"]);
    let card = pick("Rotational throw for distance");
    expect(pres(card)).toEqual(["best of three each side · the 4 kg ball"]);
    expect(card.textContent).toMatch(/Open floor, never towards a wall\. The 4 kg ball at your shoulder/);
    expect(pick("Knuckle Hold").querySelectorAll("[data-set-btn]")).toHaveLength(2);
    card = pick("The Arms-Only Test");
    expect(pres(card)).toEqual(["On the assault bike, straight after the pressure round: clear its screen, feet on the pegs, then 3 minutes arms only for the biggest total you can make, then 2 minutes easy"]);
    fireEvent.click(within(card).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("THE ARMS-ONLY TEST");
    expect(screen.getByTestId("timer-part").textContent).toBe("ARMS ONLY — 3 MINUTES, THE BIGGEST TOTAL YOU CAN MAKE");
    expect(screen.getAllByText(/STEP 1 \/ 2 · 5:00 LEFT/).length).toBeGreaterThan(0);
  });
  it("Monday 23 November: the movement block ends with three easy box jumps; Monday 16 November's doesn't", async () => {
    await at(2026, 11, 23, live());
    expect(pick("The movement block").textContent).toMatch(/Then three easy box jumps\s*at half effort/);
    again();
    await at(2026, 11, 16, live());
    expect(pick("The movement block").textContent).not.toMatch(/easy box jumps/);
  });
  it("Thursday 3 December: the trap bar jump has the bar-speed box and Spleeft's rule; Thursday 19 November has neither. Saturday 5 December: the bench throw's and the landmine push press's, the push press's for the arm the watch is on, and its speed is kept", async () => {
    await at(2026, 12, 3, live());
    let card = pick("Trap Bar Jump");
    expect(within(card).getByTestId("speed-rule").textContent).toBe("SPLEEFT ON YOUR WRIST: READ THE SPEED AFTER EVERY REP. A REP 10% SLOWER THAN THE SET'S FASTEST ENDS THE SET.");
    expect(within(card).getByTestId("bar-speed").textContent).toMatch(/SET 1 · MEAN OF ITS TWO FASTEST REPS \(M\/S\)$/);
    again();
    await at(2026, 11, 19, live());
    expect(within(pick("Trap Bar Jump")).queryByTestId("bar-speed")).toBe(null);
    again();
    await at(2026, 12, 5, live());
    expect(within(pick("Bench Throw (Smith)")).getByTestId("speed-rule").textContent).toMatch(/^SPLEEFT ON YOUR WRIST: READ THE SPEED AFTER EVERY REP\./);
    card = pick("One-Arm Landmine Push Press");
    expect(within(card).getByTestId("speed-rule").textContent).toBe("SPLEEFT READS THE ARM THE WATCH IS ON: THAT SIDE FIRST, THE SPEED READ AFTER EVERY REP. A REP 10% SLOWER THAN THE SET'S FASTEST ENDS THE SET, AND THE OTHER SIDE DOES THE SAME REPS.");
    fireEvent.change(within(card).getByTestId("bar-speed").querySelector("input"), { target: { value: "1.45" } });
    expect(JSON.parse(localStorage.getItem("o8s-log"))["mSw5-sat-s_lmpush"].bs).toBe("1.45");
  });
  it("Saturday 5 December: the 4 × 4 on the treadmill at 5%, the distance and the peak heart rate logged; the Saturday after reads it back. Saturday 21 November's is on the bike, as it was", async () => {
    await at(2026, 12, 5, live());
    let card = pick("The 4 × 4 Intervals");
    expect(pres(card)).toEqual(["On the treadmill at 5%: 5 minutes easy, then 4 × 4 minutes at 90–95% of your peak heart rate with 3 easy between, then 3 minutes easy"]);
    expect(card.textContent).toMatch(/The treadmill set to 5%\. Five minutes easy, then four minutes hard/);
    expect(card.textContent).toMatch(/DISTANCE \(KM\)PEAK HEART RATE \(BPM\)/);
    expect(card.textContent).not.toMatch(/SESSION AVERAGE/);
    const inputs = card.querySelectorAll("input");
    expect(inputs).toHaveLength(2);
    fireEvent.change(inputs[0], { target: { value: "3.2" } });
    fireEvent.change(card.querySelectorAll("input")[1], { target: { value: "172" } });
    expect(JSON.parse(localStorage.getItem("o8s-log"))["mSw5-sat-s_44"]).toMatchObject({ w: "3.2", hr: "172", kind: "vt" });
    again();
    await at(2026, 12, 12, live(), { "o8s-log": { "mSw5-sat-s_44": { w: "3.2", hr: "172", kind: "vt", d: "2026-12-05" } } });
    expect(within(pick("The 4 × 4 Intervals")).getByTestId("last-run").textContent).toBe("LAST TIME · 3.2 KM · PEAK 172 BPM");
    again();
    await at(2026, 11, 21, live());
    card = pick("The 4 × 4 Intervals");
    expect(pres(card)[0]).toMatch(/^On the bike: 5 minutes easy/);
    expect(card.textContent).toMatch(/SESSION AVERAGE/);
  });
  it("Saturday 28 November: the push press speed test between the bench throw's profile and the push press, a box an arm. Sunday 29 November: one set of drops after the shrug and the crunch; two on 6 December; none on 22 November", async () => {
    await at(2026, 11, 28, live());
    const card = pick("Push press speed test");
    expect(pres(card)).toEqual(["3 reps each side · the bar plus 20 kg, every time"]);
    expect(card.textContent).toMatch(/Swap the watch to the other wrist and do three on that side\./);
    expect(card.textContent).toMatch(/RIGHT ARM \(M\/S\)LEFT ARM \(M\/S\)/);
    again();
    await at(2026, 11, 29, live());
    const sun = wholeDay();
    expect(sun[sun.indexOf("Dumbbell Shrug + Cable Crunch") + 1]).toBe("Medicine-Ball Drops");
    let drops = pick("Medicine-Ball Drops");
    expect(pres(drops)).toEqual(["1 × 8 · Wednesday's ball · Rest 45 s"]);
    expect(drops.querySelectorAll("[data-set-btn]")).toHaveLength(1);
    again();
    await at(2026, 12, 6, live());
    drops = pick("Medicine-Ball Drops");
    expect(pres(drops)).toEqual(["2 × 8 · Wednesday's ball · Rest 45 s"]);
    expect(drops.querySelectorAll("[data-set-btn]")).toHaveLength(2);
    again();
    await at(2026, 11, 22, live());
    expect(wholeDay()).not.toContain("Medicine-Ball Drops");
  });
  it("the power block and test week: a 3 kg ball for Tuesday 29 December's throws; Thursday 21 January the trap bar jump's profile in its sets' place; Saturday 23 January the bench throw's profile, then the speed test", async () => {
    await at(2026, 12, 29, live());
    expect(pres(pick("Rotational Shot-Put Throw + Hook Throw"))[1]).toBe("3 × 3 each side · 3 kg ball, into a wall · Rest 45 s · then the hook throw");
    again();
    await at(2027, 1, 21, live());
    const thu = wholeDay();
    expect(thu).toContain("Load-Velocity Profile — Trap Bar Jump");
    expect(thu).not.toContain("Trap Bar Jump");
    expect(within(pick("Load-Velocity Profile — Trap Bar Jump")).getByRole("button", { name: "DRAW THE PROFILE" })).toBeInTheDocument();
    again();
    await at(2027, 1, 23, live());
    const sat = wholeDay(), i = sat.indexOf("Load-Velocity Profile — Bench Throw");
    expect(sat.slice(i, i + 3)).toEqual(["Load-Velocity Profile — Bench Throw", "Push press speed test", "One-Arm Landmine Push Press"]);
    expect(sat).not.toContain("Bench Throw (Smith)");
  });
  it("PROGRESS: the dashboard reads the treadmill's distance, the throw, the push press speed as the mean of the two arms, and the arms-only test; THIS WEEK says what the week tests", async () => {
    const seed = { "mSw5-sat-s_44": { w: "3.2", hr: "172", kind: "vt", d: "2026-12-05" }, "mSw4-tue-s_rthrow": { w: "9.5" }, "mSw4-sat-s_ppspeed": { w: "1.9", l: "1.7" },
      "mSw4-tue-s_arm3_erg": { v: ["41"], kind: "arm3", d: "2026-11-24" }, "mSw4-tue-s_arm3": { hr: "165" } };
    await at(2026, 12, 11, live(), { "o8s-log": seed });
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "PROGRESS" }));
    const text = document.body.textContent;
    expect(text).toMatch(/The 4 × 4 on the treadmill — the distanceLAST LOGGED SAT,? 5 DEC.{0,3}3\.2 km/);
    expect(text).toMatch(/Rotational throw — weeks 4, 8 and 12LAST LOGGED TUE,? 24 NOV.{0,3}9\.5 m/);
    expect(text).toMatch(/Push press speed — weeks 4, 8 and 12LAST LOGGED SAT,? 28 NOV.{0,3}1\.8 m\/s/);
    expect(text).toMatch(/The arms-only test — 3 minutesLAST LOGGED TUE,? 24 NOV.{0,3}41 W/);
    again();
    await at(2026, 11, 24, live());
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" }));
    fireEvent.click(screen.getByRole("button", { name: "PLAN" }));
    fireEvent.click(screen.getByRole("button", { name: "THIS WEEK" }));
    const week = document.body.textContent;
    expect(week).toMatch(/The intervals \(Sat\)3 × 4 on the treadmill at 5%/);
    expect(week).toMatch(/Pressure rounds \(Tue\)1 × 3 minutes, straight after the bursts, the third minute arms only; then the arms-only test/);
    expect(week).toMatch(/Teststhe load-velocity profiles · the rotational throw for distance · the push press speed · the arms-only test · tape · photos/);
  });
});
