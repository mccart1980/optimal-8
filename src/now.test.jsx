import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup as cleanupApp } from "@testing-library/react";
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

/* TODAY opens on HOME. These tests start from the card the day is on: one tap, on the row that says what's on now, or on the session's own button. */
const openNow = () => { const b = screen.queryByTestId("now-row") || screen.queryByTestId("hero-go"); if (b) fireEvent.click(b); };
async function mount(at, extra) {
  vi.setSystemTime(at);
  localStorage.setItem("o8s-settings", settings(extra));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
  openNow();
}

/* open the whole day and make one row the NOW card */
function pick(name) {
  { const wd = screen.queryByRole("button", { name: "WHOLE DAY" }); if (wd) fireEvent.click(wd); }
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

  it("opens on HOME — the week, the session, the day — and one tap opens the card the day is on, with a NEXT line and a progress bar", async () => {
    vi.setSystemTime(SAT);
    localStorage.setItem("o8s-settings", settings());
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 1 · P1 · Build");
    // HOME: where the week sits in the programme, the seven days, the session and its one button, the day's chapters. No card yet.
    expect(screen.getByTestId("whole-day")).toBeInTheDocument();
    expect(screen.queryByTestId("now-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("week-title").textContent).toBe("Week 1 of 16 · P1 · Build");
    expect(screen.getByTestId("programme-bar").getAttribute("aria-label")).toBe("Week 1 of 16");
    expect(Array.from(screen.getByTestId("day-strip").querySelectorAll("button")).map((b) => b.getAttribute("aria-label"))).toEqual(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
    expect(screen.getByRole("button", { name: "SAT" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("session-hero").getAttribute("data-state")).toBe("todo");
    expect(screen.getByTestId("hero-go").textContent).toBe("START SESSION");
    expect(screen.getByTestId("day-progress")).toBeInTheDocument();
    ["MORNING", "GYM", "THE DAY", "EVENING"].forEach((c) => expect(screen.getByText(c)).toBeInTheDocument());
    // one tap, and the day is one thing at a time
    openNow();
    expect(screen.getAllByTestId("now-card")).toHaveLength(1);
    expect(screen.getByTestId("next-line").textContent).toMatch(/^NEXT · \d\d:\d\d · .+/);
    expect(screen.getByTestId("day-progress")).toBeInTheDocument();
    expect(screen.queryByTestId("whole-day")).not.toBeInTheDocument();
    // and the way back to HOME is the arrow at the top
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    expect(screen.getByTestId("whole-day")).toBeInTheDocument();
    expect(screen.queryByTestId("now-card")).not.toBeInTheDocument();
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
    { const wd = screen.queryByRole("button", { name: "WHOLE DAY" }); if (wd) fireEvent.click(wd); }
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
    // the session's list opens from the top of the screen; NEXT is on the bar under the thumb
    fireEvent.click(screen.getByRole("button", { name: "SESSION LIST" }));
    const list = screen.getByTestId("session-list");
    expect(within(list).getByText("Trap Bar Deadlift")).toBeInTheDocument();
    fireEvent.click(within(list.parentElement).getByRole("button", { name: "CLOSE" }));
    expect(screen.queryByTestId("session-list")).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByTestId("action-bar")).getByRole("button", { name: "NEXT" }));
    expect(screen.getByTestId("card-name").textContent).not.toBe("Warm-up");
  });

  it("runs the drive and punch holds on a guided round timer", async () => {
    await mount(WED);
    pick("Drive Holds + Punch-Position Holds");
    fireEvent.click(screen.getByRole("button", { name: "START THE ROUNDS" }));
    expect(screen.getByTestId("timer-part").textContent).toMatch(/ROUND 1 · DRIVE HOLD/);
  });

  it("runs RANGE one card at a time, in home-routines.md's words: HOLD with a clock, REPS with none", async () => {
    await mount(SAT);
    { const wd = screen.queryByRole("button", { name: "WHOLE DAY" }); if (wd) fireEvent.click(wd); }
    const ev = screen.getByText("EVENING").closest("[data-chapter]");
    fireEvent.click(within(ev).getByRole("button", { expanded: false }));
    fireEvent.click(within(ev).getByText("RANGE"));
    const runner = screen.getByTestId("routine-runner");
    expect(within(runner).getByText("CARD 1 OF 27")).toBeInTheDocument();
    expect(within(runner).getByTestId("routine-name").textContent).toBe("SETTLE");
    expect(within(runner).getByTestId("routine-clock").textContent).toBe("1:00");
    fireEvent.click(within(runner).getByRole("button", { name: "Next card" }));
    expect(within(runner).getByTestId("routine-name").textContent).toBe("FOAM ROLLER — ARCH OVER IT");
    expect(within(runner).queryByText(libFor("Foam roller extensions")[0].text)).not.toBeInTheDocument();
    expect(within(runner).queryByTestId("routine-clock")).not.toBeInTheDocument();
    expect(within(runner).getByTestId("routine-dose").textContent).toBe("REPS 8");
  });

  it("looks ahead to another day and another week from the top of TODAY", async () => {
    await mount(SAT);   // PREP week 1, Saturday
    // the seven days are on HOME
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    // another day opens on its session, every row with its prescription
    const gymOf = () => screen.getByText("GYM").closest("[data-chapter]");
    expect(within(gymOf()).getByText("Trap Bar Deadlift")).toBeInTheDocument();
    expect(within(gymOf()).getByText("SLOW LOWERING · 3 × 5 · 125 kg · Rest 2:30 · lateral raises × 15 in it, then sit")).toBeInTheDocument();
    expect(screen.getByTestId("day-label").textContent).toBe("WED 7 JAN");
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 1 · P1 · Build");
    // a week on, the same day
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 2 · P2 · Build");
    expect(within(gymOf()).getByText("SLOW LOWERING · 4 × 5 · 130 kg · Rest 2:30 · lateral raises × 15 in it, then sit")).toBeInTheDocument();
    // any week, from the week line
    fireEvent.click(screen.getByRole("button", { name: "Pick a week" }));
    fireEvent.click(within(screen.getByTestId("week-picker")).getByRole("button", { name: "Week 9" }));
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 9 · P8 · Heavy");
    expect(within(gymOf()).getByText(/^5 × \(2\+2\) · 157\.5 kg/)).toBeInTheDocument();
    // and back
    fireEvent.click(screen.getByRole("button", { name: "BACK TO TODAY" }));
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 1 · P1 · Build");
    expect(screen.queryByTestId("day-label")).not.toBeInTheDocument();
    openNow();
    expect(screen.getByTestId("now-label").textContent).toMatch(/^NOW · /);
  });

  it("opens a row from another day as its card, and leaves today's NOW where it was", async () => {
    await mount(SAT);
    const first = screen.getByTestId("card-name").textContent;
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    fireEvent.click(within(screen.getByText("GYM").closest("[data-chapter]")).getByText("Split Squat, Rear Foot Elevated"));
    expect(screen.getByTestId("now-label").textContent).toMatch(/^THU · /);
    expect(screen.getByTestId("card-name").textContent).toBe("Split Squat, Rear Foot Elevated");
    expect(screen.getByTestId("card-lib").textContent).toBe(libFor("Split squat, rear foot elevated")[0].text);
    // the TODAY tab, tapped on TODAY, comes back to today
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "Today" }));
    expect(screen.getByTestId("whole-day")).toBeInTheDocument();
    openNow();
    expect(screen.getByTestId("now-label").textContent).toMatch(/^NOW · /);
    expect(screen.getByTestId("card-name").textContent).toBe(first);
  });

  it("has four tabs", async () => {
    await mount(SAT);
    const nav = screen.getByRole("navigation", { name: "Tabs" });
    expect(within(nav).getAllByRole("button").map((b) => b.textContent)).toEqual(["Today", "Progress", "Food", "More"]);
    fireEvent.click(within(nav).getByText("Food"));
    expect(screen.getByTestId("food-menu")).toBeInTheDocument();
    fireEvent.click(within(nav).getByText("More"));
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });
});

/* ================================================================
   THE SAFETY CORRECTIONS, ON THE CARDS
   ================================================================ */
const settingsKey = () => JSON.parse(localStorage.getItem("o8s-maxes") || "{}");
describe("the safety corrections, on the cards", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100, tbdl: 180, pp: 70 }));
  });
  afterEach(() => vi.useRealTimers());

  it("week 9's top triple: the ramp off the working max, the triple × 1.08 as the new working max, the back-off at 85% of it", async () => {
    await mount(new Date(2026, 2, 11, 6, 0, 0));   // P9's Wednesday
    expect(screen.getByTestId("app-title").textContent).toBe("Prep · Week 10 · P9 · Heavy");
    pick("Trap bar deadlift — top triple");
    const card = screen.getByTestId("now-card");
    expect(within(card).getAllByTestId("card-lib")[0].textContent).toMatch(/^TOP TRIPLE|After the warm-up ramp, do sets of three/);
    expect(within(card).getByTestId("top-ramp").textContent).toBe("Ramp · 90 kg × 5 · 117.5 kg × 3 · 135 kg × 2 · 152.5 kg × 1");
    fireEvent.change(within(card).getByLabelText("HEAVIEST CLEAN TRIPLE (KG)"), { target: { value: "160" } });
    fireEvent.click(within(card).getByRole("button", { name: "WORKING MAX · 160 × 1.08 = 172.5 KG" }));
    expect(settingsKey().tbdl).toBe(172.5);
    /* the back-off sets read the new working max */
    { const wd = screen.queryByRole("button", { name: "WHOLE DAY" }); if (wd) fireEvent.click(wd); }
    expect(within(screen.getByText("GYM").closest("[data-chapter]")).getByText("2 × 2 · 147.5 kg · Rest 2:30")).toBeInTheDocument();
  });

  it("the velocity rule: the mean of the two fastest reps; 5% off on one slow reading; 2.5% on only after two fast sessions running", async () => {
    await mount(WED);
    pick("Trap Bar Deadlift");
    const speed = () => screen.getByLabelText(/^Set 1 · mean of its two fastest reps \(m\/s\) · target 0\.65$/);
    fireEvent.change(speed(), { target: { value: "0.55" } });
    expect(screen.getByTestId("bar-verdict").textContent).toBe("TAKE 5% OFF · 120 KG");
    fireEvent.change(speed(), { target: { value: "0.75" } });
    expect(screen.getByTestId("bar-verdict").textContent).toBe("STAY");
    expect(screen.queryByRole("button", { name: /ADD 2\.5% FROM NOW ON/ })).not.toBeInTheDocument();
  });

  it("adds 2.5% when the same lift was fast at its previous session too", async () => {
    localStorage.setItem("o8s-log", JSON.stringify({ "mPw1-mon-x": { v1: "0.80", vt: 0.65, vl: "tbdl", vd: "2026-01-05" } }));
    await mount(WED);
    pick("Trap Bar Deadlift");
    fireEvent.change(screen.getByLabelText(/mean of its two fastest reps/), { target: { value: "0.75" } });
    expect(screen.getByTestId("bar-verdict").textContent).toBe("ADD 2.5% · 127.5 KG");
    fireEvent.click(screen.getByRole("button", { name: "ADD 2.5% FROM NOW ON · 185 KG" }));
    expect(settingsKey().tbdl).toBe(185);
  });

  it("a jump that hurts more than 3 out of 10 stops for the day", async () => {
    await mount(SAT);
    pick("Drop Landings");
    expect(screen.getByTestId("card-pres").textContent).toMatch(/^3 × 4 · 20–30 cm box/);
    fireEvent.click(screen.getByRole("button", { name: "Hurts more than 3 out of 10: stop it for today" }));
    expect(screen.getByTestId("card-name").textContent).not.toBe("Drop Landings");
    pick("Drop Landings");
    expect(screen.getByTestId("pain-stopped").textContent).toMatch(/^STOPPED FOR TODAY/);
    expect(document.querySelector("[data-set-mode]")).toBeNull();
  });

  it("the sauna, twice a week at most: a week the program puts it in has no weekend sauna of your own", async () => {
    const water = () => { fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByText("Food")); fireEvent.click(screen.getByRole("button", { name: "WATER" })); };
    await mount(SAT);   // P1: no sauna in the program
    water();
    expect(screen.getByRole("button", { name: "SAUNA TODAY" })).toBeInTheDocument();
    cleanupApp();
    await mount(new Date(2026, 1, 21, 6, 0, 0));   // P6's Saturday: the sauna is Wednesday and Sunday
    water();
    expect(screen.queryByRole("button", { name: "SAUNA TODAY" })).not.toBeInTheDocument();
  });
});

describe("the stop rule, on the rounds", () => {
  const camp = { booked: true, fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "good", emphasis: "none" };
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
  });
  afterEach(() => vi.useRealTimers());
  /* from the audit's week a round logs one number, the bike's calories */
  const at10 = () => mount(new Date(2027, 1, 28, 6, 0, 0), { program: "prep", plans: [{ from: "2027-01-04", made: "2026-12-31", inputs: camp }], season: camp, fightDate: "2027-03-13" });

  it("past the fight, a round under 75% of round one is the last: the rest come off, and the fade is scored on it", async () => {
    await at10();   // week 8, the ten rounds once
    pick("The 10 × 3 Simulation");
    fireEvent.click(screen.getByRole("button", { name: "START THE ROUNDS" }));
    fireEvent.click(screen.getByRole("button", { name: "MINIMISE" }));
    expect(screen.getByRole("button", { name: "Close timer" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("ROUND 1 · BIKE (CAL)"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("ROUND 7 · BIKE (CAL)"), { target: { value: "80" } });
    expect(screen.queryByTestId("stop-verdict")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("ROUND 8 · BIKE (CAL)"), { target: { value: "70" } });
    expect(screen.getByTestId("stop-verdict").textContent).toMatch(/^ROUND 8 WAS THE LAST — THE REST ARE OFF/);
    expect(screen.queryByLabelText("ROUND 9 · BIKE (CAL)")).not.toBeInTheDocument();
    expect(screen.getByLabelText("LAST ROUND · BIKE (CAL)").value).toBe("70");
    expect(screen.queryByRole("button", { name: "Close timer" })).not.toBeInTheDocument();
  });

  it("the posture gone — FORM GONE — makes that round the last", async () => {
    await at10();
    pick("The 10 × 3 Simulation");
    fireEvent.change(screen.getByLabelText("ROUND 1 · BIKE (CAL)"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Form gone in round 7" }));
    expect(screen.getByTestId("stop-verdict").textContent).toMatch(/^ROUND 7 WAS THE LAST/);
    fireEvent.change(screen.getByLabelText("ROUND 7 · BIKE (CAL)"), { target: { value: "90" } });
    expect(screen.getByLabelText("LAST ROUND · BIKE (CAL)").value).toBe("90");
  });
});

describe("THE LIBRARY", () => {
  it("reads every entry out of exercise-library.md", () => {
    expect(LIBRARY.length).toBeGreaterThan(100);
    expect(libFor("Flying 20s")[0].n).toBe("FLYING SPRINTS");
    expect(libFor("Easy bike")[0].n).toBe("EASY BIKE (WARM-UP)");
  });
});
