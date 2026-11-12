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
    ["Warm-up", "Box Jumps", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Seated Leg Curl", "Standing Calf Raise + Hanging Leg Raise"]
      .forEach((n, i, a) => { expect(rows).toContain(n); if (i) expect(before(rows, a[i - 1], n)).toBe(true); });
    // the two nasal runs are the easy work: no easy hour
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
    expect(light.slice(light.indexOf("Warm-up"), light.indexOf("Warm-up") + 3)).toEqual(["Warm-up", "Box Jumps", "Load-Velocity Profile — Squat"]);
    expect(pick("Box Jumps").querySelectorAll("[data-set-btn]")).toHaveLength(2);
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
    fireEvent.click(within(pick("Pressure Rounds")).getAllByRole("button", { name: /START/ })[0]);
    expect(screen.getByTestId("timer-title").textContent).toBe("2 PRESSURE ROUNDS");
    expect(screen.getAllByText(/STEP 1 \/ 39 · 10:00 LEFT/).length).toBeGreaterThan(0);
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    await at(2026, 11, 10, live(), { "o8s-ready": { "mSw2-tue": "R" } });
    expect(wholeDay()).not.toContain("Pressure Rounds");
  });
  it("Thursday ends with the side plank and the dead bug, back to back: the plank counts seconds with no clock after it, the dead bug's set starts 0:30; one set each in week 4", async () => {
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
    expect([...pick("Side Plank + Dead Bug").querySelectorAll("[data-pair-part]")].map((p) => p.querySelectorAll("[data-set-btn]").length)).toEqual([1, 1]);
  });
  it("Saturday: the side plank, then the landmine rotation in added kilos, before the 4 × 4; a plank set starts 0:30, a rotation set 1:00; both run on a red morning", async () => {
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
    expect(rows[i + 1]).toBe("One-Arm Landmine Push Press");
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
    expect(test).toContain("Bench Throw (Smith)");
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
  it("from a card's date on it counts: week 3's Monday without its box jumps is 8 of 9, its Wednesday without the neck and drops 6 of 7", async () => {
    await at(2026, 11, 19, Object.assign(live(), { v16: true }), { "o8s-done": { "mSw3-mon": ["A", "C", "D", "E", "F", "G", "N", "Q"], "mSw3-tue": ["A", "K", "C", "D", "E", "F", "G", "H", "I"], "mSw3-wed": ["A", "B", "C", "D", "E", "R"] } });
    week();
    expect(counts()).toMatchObject({ mon: "8/9", tue: "9/9", wed: "6/7" });
  });
  it("the day's own page is as it was: Tuesday 3 November still lists the throws and the pressure rounds", async () => {
    await at(2026, 11, 3, live());
    const rows = wholeDay();
    expect(rows).toContain("Rotational Shot-Put Throw + Hook Throw");
    expect(rows).toContain("Pressure Rounds");
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
    ["PREP · 16-WEEK CYCLE", "STRENGTH, POWER, PHYSIQUE · 12 WEEKS", "OPTIMAL 8 FIGHTER"].forEach((n) => expect(screen.getByRole("button", { name: n })).toBeInTheDocument());
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
