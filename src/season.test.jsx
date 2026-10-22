import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* Worked Example 1 in the app: Settings answered on Thursday 8 October
   2026, the plan from Monday 12 October. Every kind of week renders —
   the week before, F1, the engine-first build, the double, fight day,
   the transition, and Prep after it — on TODAY and on the week map. */
const plans = [{ from: "2026-10-12", made: "2026-10-08", inputs: { booked: true, fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" } }];
const settings = (extra) => JSON.stringify(Object.assign({ start: "2026-09-28", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
  imStart: "2026-09-28", levelStart: "2026-09-28", v12: true, program: "prep", plans, season: plans[0].inputs, fightDate: "2026-11-28" }, extra || {}));
const NO = { head: { "2026-11-28": { a: "no", at: "2026-11-29" } } };
const YES = { head: { "2026-11-28": { a: "yes", at: "2026-11-29" } } };
const title = () => screen.getByTestId("app-title").textContent.toUpperCase();
async function at(y, m, d, extra) {
  vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0));
  localStorage.setItem("o8s-settings", settings(extra));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
function weekMap() {
  const bar = within(screen.getByRole("navigation", { name: "Tabs" }));
  fireEvent.click(bar.getByRole("button", { name: "MORE" }));
  fireEvent.click(screen.getByRole("button", { name: "PLAN" }));
  fireEvent.click(screen.getByRole("button", { name: "THIS WEEK" }));
}

describe("the season, in the app", () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("the week before: the pre-camp check, then Saturday's checks", async () => {
    await at(2026, 10, 10);
    expect(title()).toBe("CAMP · BEFORE WEEK 1");
    weekMap();
    expect((await screen.findAllByText("BEFORE WEEK 1")).length).toBeGreaterThan(0);
  });
  it("F1, the double and the sharpen week render on TODAY and the week map", async () => {
    for (const [d, t] of [[13, "CAMP · WEEK 1 · F1 · FOUNDATION, TWO-THIRDS"], [3, "CAMP · WEEK 3 · B2 · BUILD"]]) {
      await at(2026, d === 3 ? 10 : 10, d === 3 ? 28 : d);
      expect(title()).toBe(t);
      weekMap();
      expect(await screen.findByText("The camp — every number, every week, with dates")).toBeInTheDocument();
      cleanup();
    }
    await at(2026, 11, 15);
    expect(title()).toBe("CAMP · WEEK 5 · P3 · PEAK, LAST HARD WEEK");
    weekMap();
    expect(screen.getAllByText(/THE DOUBLE: 4 × 2, 5 min easy, 3 × 2/).length).toBeGreaterThan(0);
  });
  it("fight day, the transition, and Prep after it", async () => {
    await at(2026, 11, 28);
    expect(title()).toBe("CAMP · WEEK 7 · FW · FIGHT WEEK");
    weekMap();
    expect(await screen.findByText(/Fight week — the fight on Saturday 2026-11-28/)).toBeInTheDocument();
    cleanup();
    await at(2026, 12, 1, NO);
    expect(title()).toBe("TRANSITION · WEEK 1 · EASY");
    cleanup();
    await at(2026, 12, 9, NO);
    expect(title()).toBe("PREP · WEEK 1 · P1 · BUILD");
  });
  it("a re-plan made mid-week: the days before it keep the week they were lived in", async () => {
    const prep = { from: "2026-09-28", made: "2026-09-28", inputs: { booked: false, classic: false } };
    await at(2026, 10, 8, { plans: [prep].concat(plans), season: plans[0].inputs });
    expect(title()).toBe("CAMP · BEFORE WEEK 1");
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    expect(title()).toBe("PREP · WEEK 2 · P2 · BUILD");
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    expect(title()).toBe("CAMP · BEFORE WEEK 1");
  });
  it("the head check: the first row the morning after; YES shows the doctor and A&E and holds the transition until cleared", async () => {
    await at(2026, 11, 29);
    const card = screen.getByTestId("now-card");
    expect(within(card).getByTestId("card-name").textContent).toBe("The head check");
    expect(within(card).getByTestId("card-pres").textContent).toBe("Stopped, dropped, or any symptoms?");
    expect(within(card).getByText(/Headache, fogginess, feeling slowed down, dizziness, sensitivity to light or noise/)).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "YES" }));
    expect(screen.getByTestId("head-doctor").textContent).toMatch(/^See a doctor before any training/);
    expect(screen.getByTestId("head-ae").textContent).toMatch(/is A&E, straight away/);
    expect(JSON.parse(localStorage.getItem("o8s-settings")).head["2026-11-28"].a).toBe("yes");
    cleanup();
    /* unanswered, the transition waits */
    await at(2026, 12, 1);
    expect(title()).toBe("TRANSITION · ON HOLD · THE HEAD CHECK");
    cleanup();
    /* YES and not cleared: held */
    await at(2026, 12, 9, YES);
    expect(title()).toBe("TRANSITION · ON HOLD · THE HEAD CHECK");
    expect(within(screen.getByTestId("now-card")).getByTestId("card-name").textContent).toBe("The head check");
    fireEvent.click(screen.getByRole("button", { name: "A DOCTOR HAS CLEARED ME, AND I'M SYMPTOM-FREE" }));
    expect(JSON.parse(localStorage.getItem("o8s-settings")).head["2026-11-28"].cleared).toBe("2026-12-09");
    cleanup();
    /* cleared on the Wednesday: the transition starts the Monday after */
    await at(2026, 12, 14, { head: { "2026-11-28": { a: "yes", at: "2026-11-29", cleared: "2026-12-09" } } });
    expect(title()).toBe("TRANSITION · WEEK 1 · EASY");
  });
});

/* Worked Example 3 in the app: the comeback, and the date moved inside it.
   The re-plan carries Prep on from the week you're on instead of
   restarting it. */
describe("the comeback, re-planned inside Prep", () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  const WE3 = { booked: true, fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "low", emphasis: "power", classic: false };
  const we3 = [{ from: "2026-10-26", made: "2026-10-25", inputs: WE3 }];
  async function mount(y, m, d, st) {
    vi.setSystemTime(new Date(y, m - 1, d, 6, 0, 0));
    localStorage.setItem("o8s-settings", st);
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
  }
  const raw = () => screen.getByTestId("app-title").textContent;
  it("moving the date on Thursday 12 November carries Prep on: P4 this week, P4b the next", async () => {
    await mount(2026, 11, 12, settings({ plans: we3, season: WE3, fightDate: "2027-03-13" }));
    expect(raw()).toMatch(/· P4 ·/);
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" }));
    fireEvent.click(screen.getByRole("button", { name: "SETTINGS" }));
    fireEvent.change((await screen.findByText("The date")).parentElement.querySelector("input"), { target: { value: "2027-04-10" } });
    fireEvent.click(screen.getByRole("button", { name: /^RE-PLAN FROM MON,? 16 NOV/ }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).plans.length).toBe(2));
    const saved = localStorage.getItem("o8s-settings");
    expect(JSON.parse(saved).plans[1]).toMatchObject({ from: "2026-11-16", inputs: { fight: "2027-04-10" } });
    cleanup();
    await mount(2026, 11, 16, saved);
    expect(raw()).toMatch(/· P4b ·/);
  });
});

/* No fight booked: the fight called off carries Prep on; the fitness
   question; START AGAIN; the week number within the cycle. */
describe("no fight booked", () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  const WE3 = { booked: true, fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "low", emphasis: "power", classic: false };
  const CYC = { booked: false, classic: false, fitness: "good" };
  async function mount(y, m, d, st) {
    vi.setSystemTime(new Date(y, m - 1, d, 6, 0, 0));
    localStorage.setItem("o8s-settings", st);
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
  }
  const raw = () => screen.getByTestId("app-title").textContent;
  const openSettings = async () => {
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "MORE" }));
    fireEvent.click(screen.getByRole("button", { name: "SETTINGS" }));
    return (await screen.findByText("Fight booked?")).parentElement;
  };
  const saved = () => JSON.parse(localStorage.getItem("o8s-settings"));
  it("the March fight called off on Thursday 3 December carries Prep on: P7 this week, P8 the next, test day Saturday 30 January", async () => {
    await mount(2026, 12, 3, settings({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: WE3 }], season: WE3, fightDate: "2027-03-13" }));
    expect(raw()).toMatch(/^Prep · Week 6 · P7 ·/);
    const box = await openSettings();
    fireEvent.click(within(box).getByRole("button", { name: "NO" }));
    expect(within(screen.getByText("How fit you are right now").parentElement).getByRole("button", { name: "LOW" })).toBeInTheDocument();
    expect(within(screen.getByTestId("prep-running")).getByRole("button", { name: "CARRY ON" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^RE-PLAN FROM MON,? 7 DEC/ }));
    await waitFor(() => expect(saved().plans.length).toBe(2));
    const st = saved();
    expect(st.plans[1]).toMatchObject({ from: "2026-12-07", inputs: { booked: false, fight: null } });
    expect(st.plans[1].inputs.restart).toBeUndefined();
    expect(st.planNote).toMatch(/^fight booked yes → no\. From Mon,? 7 Dec: Prep carries on: P8 · P9 · P10 · P11 · P12 · P12b · P13 · P14, test day Sat,? 30 Jan; then Prep's 16-week cycle from Mon,? 1 Feb\.$/);
    cleanup();
    await mount(2026, 12, 7, localStorage.getItem("o8s-settings"));
    expect(raw()).toMatch(/^Prep · Week 7 · P8 ·/);
  });
  it("START AGAIN, from low fitness: week 1 from the next Monday, eased in — and never kept as an answer", async () => {
    await mount(2027, 1, 7, settings({ plans: [{ from: "2026-10-26", made: "2026-10-25", inputs: CYC }], season: CYC, fightDate: null }));
    expect(raw()).toMatch(/^Prep · Week 11 · P10 ·/);
    await openSettings();
    fireEvent.click(within(screen.getByText("How fit you are right now").parentElement).getByRole("button", { name: "LOW" }));
    fireEvent.click(within(screen.getByTestId("prep-running")).getByRole("button", { name: "START AGAIN" }));
    expect(within(screen.getByTestId("prep-running")).getByText(/^Week 1 again from Mon,? 11 Jan, eased in\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^RE-PLAN FROM MON,? 11 JAN/ }));
    await waitFor(() => expect(saved().plans.length).toBe(2));
    const st = saved();
    expect(st.plans[1]).toMatchObject({ from: "2027-01-11", inputs: { booked: false, fitness: "low", restart: true } });
    expect(st.season.restart).toBeUndefined(); expect(st.season.fitness).toBe("low");
    expect(st.planNote).toMatch(/^fitness good → low · Prep starts again at week 1\. From Mon,? 11 Jan: Prep's 16-week cycle from Mon,? 11 Jan, easing you back in\.$/);
    /* this Monday's plan starts again: Settings shows it, and nothing's left to re-plan */
    expect(within(screen.getByTestId("prep-running")).getByText(/^Week 1 again from/)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "THIS IS THE PLAN" })).toBeInTheDocument();
    cleanup();
    await mount(2027, 1, 11, localStorage.getItem("o8s-settings"));
    expect(raw()).toBe("Prep · Week 1 · P1 · Build");
  });
  it("counts the week within the cycle: the second cycle's first week is week 1, not week 17", async () => {
    await mount(2026, 4, 27, settings({ plans: [{ from: "2026-01-05", made: "2026-01-05", inputs: CYC }], season: CYC, fightDate: null }));
    expect(raw()).toBe("Prep · Week 1 · P1 · Build");
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }));
    expect(raw()).toBe("Prep · Week 16 · P14 · Test");
  });
});
