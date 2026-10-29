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
    ["Warm-up", "Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Seated Leg Curl", "Standing Calf Raise + Hanging Leg Raise"]
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
