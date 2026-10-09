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
