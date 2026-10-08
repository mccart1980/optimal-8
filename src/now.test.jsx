import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import App from "./App.jsx";
import { libFor, LIBRARY } from "./library.js";

/* PREP with no fight date runs its sixteen-week form from the start date.
   Saturday 10 January 2026 is week 1's Saturday; Wednesday 7 January its
   Wednesday. */
const PREP_START = "2026-01-05";
const SAT = new Date(2026, 0, 10, 6, 0, 0);
const WED = new Date(2026, 0, 7, 6, 0, 0);

function settings(extra) {
  return JSON.stringify(Object.assign(
    { start: PREP_START, macroBase: 1, iron: false, sound: false, autoRest: true,
      medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: PREP_START, rangeStart: PREP_START,
      camp: false, lastTen: false, taper: false, levelStart: PREP_START, program: "prep", v12: true },
    extra || {}));
}

async function mount(at, extra) {
  vi.setSystemTime(at);
  localStorage.setItem("o8s-settings", settings(extra));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}

/* open the whole day and make one row the NOW card */
function pick(name) {
  fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  const chapter = screen.getByText("GYM").closest("[data-chapter]");
  if (!within(chapter).queryByText(name)) fireEvent.click(within(chapter).getByRole("button", { expanded: false }));
  fireEvent.click(within(chapter).getByText(name));
}

describe("TODAY — one thing at a time", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100, tbdl: 180, pp: 70 }));
  });
  afterEach(() => vi.useRealTimers());

  it("opens on one NOW card with a NEXT line, the day's line and a progress bar", async () => {
    await mount(SAT);
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 1 · P1 · Build");
    expect(screen.getByTestId("day-progress")).toBeInTheDocument();
    expect(screen.getAllByTestId("now-card")).toHaveLength(1);
    expect(screen.getByTestId("next-line").textContent).toMatch(/^NEXT · \d\d:\d\d · .+/);
    // the whole timeline is not on screen until it is asked for
    expect(screen.queryByTestId("whole-day")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    ["MORNING", "GYM", "THE DAY", "EVENING"].forEach((c) => expect(screen.getByText(c)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "◀ NOW" }));
    expect(screen.getAllByTestId("now-card")).toHaveLength(1);
  });

  it("moves to the next item with DONE", async () => {
    await mount(SAT);
    const first = screen.getByTestId("card-name").textContent;
    const next = screen.getByTestId("next-line").textContent;
    fireEvent.click(screen.getByRole("button", { name: "DONE" }));
    expect(screen.getByTestId("card-name").textContent).not.toBe(first);
    expect(next).toContain(screen.getByTestId("card-name").textContent);
  });

  it("shows the stance starts' library entry on the card, with no tap", async () => {
    await mount(SAT);
    pick("Stance Starts");
    const card = screen.getByTestId("now-card");
    expect(within(card).getByTestId("card-name").textContent).toBe("Stance Starts");
    expect(within(card).getByTestId("card-lib").textContent).toBe(libFor("Stance starts")[0].text);
    expect(within(card).getByTestId("card-pres").textContent).toMatch(/3 × 10 m/);
  });

  it("starts the rest timer when a set is tapped", async () => {
    await mount(WED);
    pick("Trap Bar Deadlift");
    const card = screen.getByTestId("now-card");
    // the weight is worked out on the prescription line: 70% of 180, to 2.5 kg
    expect(within(card).getByTestId("card-pres").textContent).toMatch(/3 × 5 · 125 kg · Rest 2:30/);
    expect(screen.queryByTestId("timer-count")).not.toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Set 1" }));
    expect(screen.getByTestId("timer-title").textContent).toBe("REST");
    expect(screen.getByTestId("timer-count").textContent).toBe("2:30");
  });

  it("puts the bar-speed field on the first work set of a main lift, and nowhere else", async () => {
    await mount(WED);
    pick("Trap Bar Deadlift");
    expect(screen.getAllByTestId("bar-speed")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    fireEvent.click(within(screen.getByText("GYM").closest("[data-chapter]")).getByText("Nordic Curls"));
    expect(screen.queryByTestId("bar-speed")).not.toBeInTheDocument();
    // bodyweight work: reps, never kilos
    expect(screen.getByTestId("card-pres").textContent).not.toMatch(/kg/);
    expect(document.querySelector("[data-set-mode]").getAttribute("data-set-mode")).toBe("bw");
  });

  it("runs the warm-up as one card with a checklist, and the session list ticks", async () => {
    await mount(WED);
    pick("Warm-up");
    const card = screen.getByTestId("now-card");
    expect(within(card).getByText("Goblet squat")).toBeInTheDocument();
    expect(within(card).getByText(libFor("Goblet squat")[0].text)).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "SESSION LIST" }));
    const list = screen.getByTestId("session-list");
    expect(within(list).getByText("Trap Bar Deadlift")).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "NEXT" }));
    expect(screen.getByTestId("card-name").textContent).not.toBe("Warm-up");
  });

  it("runs the drive and punch holds on a guided round timer", async () => {
    await mount(WED);
    pick("Drive Holds + Punch-Position Holds");
    fireEvent.click(screen.getByRole("button", { name: "▶ START THE ROUNDS" }));
    expect(screen.getByTestId("timer-part").textContent).toMatch(/ROUND 1 · DRIVE HOLD/);
  });

  it("runs RANGE one move per card, with the move's library entry and its own timer", async () => {
    await mount(SAT);
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    const ev = screen.getByText("EVENING").closest("[data-chapter]");
    fireEvent.click(within(ev).getByRole("button", { expanded: false }));
    fireEvent.click(within(ev).getByText("RANGE"));
    const runner = screen.getByTestId("move-runner");
    expect(within(runner).getByText("MOVE 1 OF 25")).toBeInTheDocument();
    fireEvent.click(within(runner).getByRole("button", { name: "Next move" }));
    expect(within(runner).getByText(libFor("Foam roller extensions")[0].text)).toBeInTheDocument();
    expect(within(runner).getByTestId("move-clock").textContent).toBe("0:30");
  });

  it("looks ahead to another day and another week from the top of TODAY", async () => {
    await mount(SAT);   // PREP week 1, Saturday
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    // another day opens on its session, every row with its prescription
    const gymOf = () => screen.getByText("GYM").closest("[data-chapter]");
    expect(within(gymOf()).getByText("Trap Bar Deadlift")).toBeInTheDocument();
    expect(within(gymOf()).getByText("3 × 5 · 125 kg · Rest 2:30")).toBeInTheDocument();
    expect(screen.getByTestId("day-label").textContent).toBe("WED 7 JAN");
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 1 · P1 · Build");
    // a week on, the same day
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 2 · P2 · Build");
    expect(within(gymOf()).getByText("4 × 5 · 130 kg · Rest 2:30")).toBeInTheDocument();
    // any week, from the week line
    fireEvent.click(screen.getByRole("button", { name: "Pick a week" }));
    fireEvent.click(within(screen.getByTestId("week-picker")).getByRole("button", { name: "Week 9" }));
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 9 · P8 · Heavy");
    expect(within(gymOf()).getByText(/^5 × \(2\+2\) · 157\.5 kg/)).toBeInTheDocument();
    // and back
    fireEvent.click(screen.getByRole("button", { name: "◀ BACK TO TODAY" }));
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 1 · P1 · Build");
    expect(screen.getByTestId("now-label").textContent).toMatch(/^NOW · /);
  });

  it("opens a row from another day as its card, and leaves today's NOW where it was", async () => {
    await mount(SAT);
    const first = screen.getByTestId("card-name").textContent;
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    fireEvent.click(within(screen.getByText("GYM").closest("[data-chapter]")).getByText("Split Squat, Rear Foot Elevated"));
    expect(screen.getByTestId("now-label").textContent).toMatch(/^THU · /);
    expect(screen.getByTestId("card-name").textContent).toBe("Split Squat, Rear Foot Elevated");
    expect(screen.getByTestId("card-lib").textContent).toBe(libFor("Split squat, rear foot elevated")[0].text);
    // the TODAY tab, tapped on TODAY, comes back to today
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "TODAY" }));
    expect(screen.getByTestId("now-label").textContent).toMatch(/^NOW · /);
    expect(screen.getByTestId("card-name").textContent).toBe(first);
  });

  it("has four tabs", async () => {
    await mount(SAT);
    const nav = screen.getByRole("navigation", { name: "Tabs" });
    expect(within(nav).getAllByRole("button").map((b) => b.textContent)).toEqual(["TODAY", "PROGRESS", "FOOD", "MORE"]);
    fireEvent.click(within(nav).getByText("FOOD"));
    expect(screen.getByTestId("food-menu")).toBeInTheDocument();
    fireEvent.click(within(nav).getByText("MORE"));
    expect(screen.getByRole("button", { name: "SETTINGS" })).toBeInTheDocument();
  });
});

describe("THE LIBRARY", () => {
  it("reads every entry out of exercise-library.md", () => {
    expect(LIBRARY.length).toBeGreaterThan(100);
    expect(libFor("Flying 20s")[0].n).toBe("FLYING SPRINTS");
    expect(libFor("Easy bike")[0].n).toBe("EASY BIKE (WARM-UP)");
  });
});
