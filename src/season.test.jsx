import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* Worked Example 1 in the app: Settings answered on Thursday 8 October
   2026, the plan from Monday 12 October. Every kind of week renders —
   the week before, F1, the engine-first build, the double, fight day,
   the transition, and Prep after it — on TODAY and on the week map. */
const plans = [{ from: "2026-10-12", made: "2026-10-08", inputs: { booked: true, fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" } }];
const settings = () => JSON.stringify({ start: "2026-09-28", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
  imStart: "2026-09-28", levelStart: "2026-09-28", v12: true, program: "prep", plans, season: plans[0].inputs, fightDate: "2026-11-28" });
const title = () => screen.getByTestId("app-title").textContent.toUpperCase();
async function at(y, m, d) {
  vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0));
  localStorage.setItem("o8s-settings", settings());
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
    await at(2026, 12, 1);
    expect(title()).toBe("TRANSITION · WEEK 1 · EASY");
    cleanup();
    await at(2026, 12, 9);
    expect(title()).toBe("PREP · WEEK 1 · P1 · BUILD");
  });
});
