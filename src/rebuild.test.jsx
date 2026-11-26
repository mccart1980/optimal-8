import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup, act } from "@testing-library/react";
import App from "./App.jsx";
import { Toasts, toast, Guard, Skeleton, Empty, words, THEMES } from "./ui.jsx";
import { Trend, ChartCard, scaleFor } from "./charts.jsx";
import { weightSeries } from "./progress.jsx";
import { planWords } from "./season-ui.jsx";

/* THE REBUILD (brief 33) on the screen: Today as a home screen, the
   session screen with LOG SET and NEXT under the thumb, last time's
   numbers on every set, the rest timer in its dock, the charts on
   PROGRESS, MORE as a list, and the designed states: empty, loading,
   saved, went wrong. And the one that matters most: everything already
   stored on the phone is still there, untouched, after the update.
   Strength, Power and Physique's twelve weeks from Monday 15 February 2027. */
const SPP = { booked: false, classic: false, spp: true, fitness: "moderate", rounds: 6, mins: 3, rest: 60, weighIn: "before", emphasis: "none" };
const MAXES = { squat: 140, bench: 100, tbdl: 180, pp: 70, cw_squat: 120, cw_tbdl: 160, cw_bench: 90, cw_pp: 60 };
const base = (extra) => Object.assign({ macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, v12: true,
  start: "2026-10-26", imStart: "2026-10-26", rangeStart: "2026-10-26", levelStart: "2026-10-26", program: "prep", easyPeak: "180" }, extra || {});
const spp = (extra) => base(Object.assign({ plans: [{ from: "2027-02-15", made: "2027-02-14", inputs: SPP }], season: SPP }, extra || {}));

async function at(y, m, d, st, store) {
  vi.setSystemTime(new Date(y, m - 1, d, 6, 0, 0));
  localStorage.setItem("o8s-settings", JSON.stringify(st));
  if (!(store && store["o8s-maxes"])) localStorage.setItem("o8s-maxes", JSON.stringify(MAXES));
  Object.keys(store || {}).forEach((k) => localStorage.setItem(k, JSON.stringify(store[k])));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
function wholeDay() {
  if (!screen.queryByTestId("whole-day")) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  for (let k = 0; k < 8; k++) { const b = document.querySelector("[data-chapter] [aria-expanded=false]"); if (!b) break; fireEvent.click(b); }
  return [...document.querySelectorAll("[data-flow-name]")].map((e) => e.getAttribute("data-flow-name"));
}
function pick(name) {
  wholeDay();
  const row = [...document.querySelectorAll("[data-flow-name]")].find((e) => e.getAttribute("data-flow-name") === name);
  if (!row) throw new Error("no row " + name + " in " + wholeDay().join(" | "));
  fireEvent.click(row.querySelectorAll("button")[1]);
  return screen.getByTestId("now-card");
}
const tab = (name) => fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name }));
const bar = () => screen.getByTestId("action-bar");
const logSet = () => within(bar()).getByTestId("log-set");
const setRows = (card) => [...card.querySelectorAll("[data-set-btn]")];
const stored = (k) => JSON.parse(localStorage.getItem(k));

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("TODAY is a home screen", () => {
  it("opens on the day at a glance: the date, the week of the programme, the seven days, and the session with one button", async () => {
    await at(2027, 2, 15, spp());
    expect(screen.getByTestId("whole-day")).toBeInTheDocument();
    expect(screen.queryByTestId("today-now")).toBeNull();
    expect(screen.getByTestId("page-title").textContent).toMatch(/^Today/);
    expect(screen.getByText(/Monday,? 15 February/i)).toBeInTheDocument();
    /* where he is in the programme */
    expect(screen.getByTestId("week-title").textContent).toBe("Week 1 of 12 · Size");
    expect(screen.getByTestId("programme-bar").getAttribute("aria-label")).toBe("Week 1 of 12");
    expect(screen.getByTestId("programme-bar").children.length).toBe(12);
    /* the seven days, each a button, today picked */
    const days = [...screen.getByTestId("day-strip").querySelectorAll("button")];
    expect(days.map((b) => b.getAttribute("aria-label"))).toEqual(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
    expect(days.map((b) => b.getAttribute("aria-pressed"))).toEqual(["true", "false", "false", "false", "false", "false", "false"]);
    expect(days[4].getAttribute("data-day-state")).toBe("rest");
    /* the session, and the one button that starts it */
    const hero = screen.getByTestId("session-hero");
    expect(within(hero).getByTestId("hero-title").textContent).toBe("Lower Strength");
    expect(within(hero).getByTestId("hero-count").textContent).toBe("0 of 10");
    expect(within(hero).getByText("10 exercises")).toBeInTheDocument();
    expect(within(hero).getByTestId("hero-go").textContent).toBe("START SESSION");
    /* and the day's own list is still there under it */
    expect(wholeDay()).toContain("Back Squat");
  });

  it("START SESSION opens the session on its first card, NEXT walks it, the arrow comes home, and the button then says CONTINUE", async () => {
    await at(2027, 2, 15, spp());
    fireEvent.click(screen.getByTestId("hero-go"));
    expect(screen.getByTestId("today-now")).toBeInTheDocument();
    expect(screen.getByTestId("now-label").textContent).toMatch(/1 OF 10$/);
    expect(within(screen.getByTestId("now-card")).getByText("The movement block")).toBeInTheDocument();
    fireEvent.click(within(bar()).getByRole("button", { name: "NEXT" }));
    expect(screen.getByTestId("now-label").textContent).toMatch(/2 OF 10$/);
    /* the arrow in the bar goes back a card, the one at the top goes home */
    fireEvent.click(within(bar()).getByRole("button", { name: "Back to the item before" }));
    expect(screen.getByTestId("now-label").textContent).toMatch(/1 OF 10$/);
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    expect(screen.getByTestId("whole-day")).toBeInTheDocument();
    expect(screen.getByTestId("hero-count").textContent).toBe("1 of 10");
    expect(screen.getByTestId("hero-go").textContent).toBe("CONTINUE");
    expect(screen.getByTestId("session-hero").getAttribute("data-state")).toBe("going");
  });

  it("another day: its pill opens it, the session offers OPEN THE SESSION, and the Today tab comes back to today", async () => {
    await at(2027, 2, 15, spp());
    fireEvent.click(within(screen.getByTestId("day-strip")).getByRole("button", { name: "TUE" }));
    expect(screen.getByTestId("page-title").textContent).toMatch(/^Tuesday,? 16 February/);
    expect(screen.getByTestId("hero-title").textContent).toBe("Upper Strength");
    expect(screen.getByTestId("hero-go").textContent).toBe("OPEN THE SESSION");
    tab("Today");
    expect(screen.getByTestId("page-title").textContent).toMatch(/^Today/);
    expect(screen.getByTestId("hero-title").textContent).toBe("Lower Strength");
  });

  it("the week picker steps by week number, marks the lighter and the test weeks, and comes back", async () => {
    await at(2027, 2, 15, spp());
    fireEvent.click(screen.getByRole("button", { name: "Pick a week" }));
    const picker = screen.getByTestId("week-picker");
    const weeks = [...picker.querySelectorAll("button")];
    expect(weeks.map((b) => b.getAttribute("aria-label"))).toEqual(Array.from({ length: 12 }, (_, i) => "Week " + (i + 1)));
    expect(weeks.map((b) => b.getAttribute("data-week-tag") || "")).toEqual(["", "", "", "light", "", "", "", "light", "", "", "", "test"]);
    fireEvent.click(within(picker).getByRole("button", { name: "Week 5" }));
    expect(screen.getByTestId("week-title").textContent).toBe("Week 5 of 12 · Strength");
    expect(screen.queryByTestId("week-picker")).toBeNull();
  });

  it("a rest day says so, with no button to press", async () => {
    await at(2027, 2, 19, spp());   // Friday
    const hero = screen.getByTestId("session-hero");
    expect(hero.getAttribute("data-state")).toBe("rest");
    expect(within(hero).getByTestId("hero-title").textContent).toBe("Rest day");
    expect(within(hero).queryByTestId("hero-go")).toBeNull();
  });
});

describe("the session screen is built for the thumb", () => {
  it("a lift: one row a set, LOG SET in the bar logs the next one, the rest clock docks above it, and NEXT stands down beside it", async () => {
    await at(2027, 2, 15, spp());
    const card = pick("Back Squat");
    /* 4 × 6 at 75% of 140 */
    expect(setRows(card).map((b) => b.getAttribute("aria-label"))).toEqual(["Set 1", "Set 2", "Set 3", "Set 4"]);
    expect([...card.querySelectorAll("[data-set-label]")].map((e) => e.textContent)).toEqual(["105 kg × 6", "105 kg × 6", "105 kg × 6", "105 kg × 6"]);
    expect(logSet().getAttribute("aria-label")).toBe("Log set 1");
    expect(logSet().textContent).toBe("LOG SET 1105 kg × 6");
    /* both buttons are big enough for a thumb */
    expect(parseFloat(logSet().style.minHeight)).toBeGreaterThanOrEqual(60);
    expect(parseFloat(within(bar()).getByRole("button", { name: "NEXT" }).style.minHeight)).toBeGreaterThanOrEqual(60);
    fireEvent.click(logSet());
    expect(setRows(card)[0].getAttribute("aria-label")).toBe("Undo set 1");
    expect(logSet().getAttribute("aria-label")).toBe("Log set 2");
    /* the squat rests three minutes, in the dock, never over the card */
    const dock = screen.getByTestId("timer-dock");
    expect(within(dock).getByTestId("timer-title").textContent).toBe("REST");
    expect(within(dock).getByTestId("timer-count").textContent).toBe("3:00");
    expect(screen.queryByTestId("timer-full")).toBeNull();
    fireEvent.click(within(dock).getByRole("button", { name: "Close timer" }));
    expect(screen.queryByTestId("timer-dock")).toBeNull();
    /* a tap on a row does what the button does, and a tap on a done row undoes it */
    fireEvent.click(setRows(card)[1]);
    expect(logSet().getAttribute("aria-label")).toBe("Log set 3");
    fireEvent.click(setRows(card)[0]);
    expect(logSet().getAttribute("aria-label")).toBe("Log set 1");
    /* what was logged is what the app has always stored: the weight and the reps, set by set */
    const e = Object.values(stored("o8s-log")).find((x) => x && x.sets && x.n === "Back Squat");
    expect(e.sets.slice(0, 2).map((s) => [!!s.ok, s.w, s.r])).toEqual([[false, "105", "6"], [true, "105", "6"]]);
    expect(e.sets.slice(2).some((s) => s.ok)).toBe(false);
  });

  it("all the sets done: the bar is NEXT alone, and it's the one to press", async () => {
    await at(2027, 2, 15, spp());
    const card = pick("Back Squat");
    for (let i = 0; i < 4; i++) fireEvent.click(logSet());
    expect(within(bar()).queryByTestId("log-set")).toBeNull();
    expect(setRows(card).every((b) => /^Undo set/.test(b.getAttribute("aria-label")))).toBe(true);
    expect(within(bar()).getByRole("button", { name: "NEXT" })).toBeInTheDocument();
  });

  it("last time's numbers sit under every set the next time the lift comes round", async () => {
    await at(2027, 2, 15, spp());
    pick("Back Squat");
    for (let i = 0; i < 4; i++) fireEvent.click(logSet());
    cleanup();
    /* the same Monday a week on */
    await at(2027, 2, 22, spp());
    const card = pick("Back Squat");
    expect([...card.querySelectorAll("[data-set-prev]")].map((e) => e.textContent)).toEqual(Array(4).fill("Last time 105 kg × 6"));
    /* and nothing is ticked for today */
    expect(setRows(card).map((b) => b.getAttribute("aria-label"))).toEqual(["Set 1", "Set 2", "Set 3", "Set 4"]);
  });

  it("a pair: LOG SET goes back and forth between the two, naming the one it logs", async () => {
    await at(2027, 2, 16, spp());   // Tuesday
    const card = pick("Bench Press + Weighted Chin-Up");
    expect(logSet().textContent).toMatch(/^LOG SET 175 kg × 6 · Bench Press$/i);
    fireEvent.click(logSet());
    expect(logSet().textContent).toMatch(/^LOG SET 1.*Weighted Chin-Up$/i);
    fireEvent.click(logSet());
    expect(logSet().textContent).toMatch(/^LOG SET 275 kg × 6 · Bench Press$/i);
    expect([...card.querySelectorAll("[data-set-btn]")].filter((b) => /^Undo/.test(b.getAttribute("aria-label"))).length).toBe(2);
  });

  it("the session list jumps to any card, and closes", async () => {
    await at(2027, 2, 15, spp());
    pick("Back Squat");
    fireEvent.click(screen.getByRole("button", { name: "SESSION LIST" }));
    const list = screen.getByTestId("session-list");
    expect(within(list).getByText("Romanian Deadlift")).toBeInTheDocument();
    fireEvent.click(within(list).getByText("Romanian Deadlift"));
    expect(screen.queryByTestId("session-list")).toBeNull();
    expect(within(screen.getByTestId("now-card")).getAllByText("Romanian Deadlift").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "SESSION LIST" }));
    fireEvent.click(within(screen.getByTestId("session-list").parentElement).getByRole("button", { name: "CLOSE" }));
    expect(screen.queryByTestId("session-list")).toBeNull();
  });

  it("a card with a clock of its own: START is the one to press until it's been pressed", async () => {
    await at(2027, 2, 20, spp());   // Saturday: the 4 × 4
    const card = pick("The 4 × 4 Intervals");
    const start = within(card).getByRole("button", { name: "START" });
    expect(start.getAttribute("data-main")).toBe("1");
    fireEvent.click(start);
    /* intervals take the whole screen: work in red, rest in amber, with MINIMISE to get back to the card */
    const full = screen.getByTestId("timer-full");
    expect(within(full).getByTestId("timer-count").textContent).toMatch(/^\d+:\d\d$/);
    fireEvent.click(within(full).getByRole("button", { name: /MINIMISE/ }));
    expect(screen.queryByTestId("timer-full")).toBeNull();
    expect(screen.getByTestId("timer-dock")).toBeInTheDocument();
    expect(within(screen.getByTestId("now-card")).getByRole("button", { name: "START" }).getAttribute("data-main")).toBeNull();
  });

  it("the session screen comes back where it was left", async () => {
    await at(2027, 2, 15, spp());
    pick("Back Squat");
    expect(stored("o8s-view")).toEqual({ d: "2027-02-15", focus: true });
    cleanup();
    await at(2027, 2, 15, spp());
    expect(screen.getByTestId("today-now")).toBeInTheDocument();
    expect(within(screen.getByTestId("now-card")).getAllByText("Back Squat").length).toBeGreaterThan(0);
    /* another day starts at home */
    cleanup();
    await at(2027, 2, 16, spp());
    expect(screen.getByTestId("whole-day")).toBeInTheDocument();
  });
});

describe("PROGRESS draws the numbers", () => {
  const MORNING = { "2027-02-01": { kg: "81.0" }, "2027-02-08": { kg: "80.4" }, "2027-02-14": { kg: "80.1" } };

  it("the overview: body weight against 76 kg, the week's sessions, and the weight typed in is this morning's", async () => {
    await at(2027, 2, 15, spp(), { "o8s-morning": MORNING });
    tab("Progress");
    const over = screen.getByTestId("overview");
    expect(within(over).getByTestId("stat-weight").textContent).toMatch(/80\.1/);
    expect(within(over).getByTestId("stat-week").textContent).toMatch(/0 \/ 6/);
    const card = within(over).getByTestId("weight-card");
    expect(card.getAttribute("data-chart-points")).toBe("3");
    expect(card.textContent).toMatch(/Body weight to 76 kg/);
    expect(within(card).getByTestId("trend")).toBeInTheDocument();
    expect(within(card).getByTestId("weight-gap").textContent).toMatch(/4\.1/);
    /* type this morning's weight */
    fireEvent.change(within(card).getByPlaceholderText("kg"), { target: { value: "79.8" } });
    fireEvent.click(within(card).getByRole("button", { name: "SAVE" }));
    expect(Number(stored("o8s-morning")["2027-02-15"].kg)).toBe(79.8);
    expect(stored("o8s-morning")["2027-02-01"]).toEqual({ kg: "81.0" });
    expect(screen.getByTestId("toast").textContent).toMatch(/Weight saved · 79\.8 kg/);
    expect(screen.getByTestId("weight-card").getAttribute("data-chart-points")).toBe("4");
    /* the numbers behind the line, on request */
    fireEvent.click(within(screen.getByTestId("weight-card")).getByRole("button", { name: /Show the numbers/ }));
    expect(within(screen.getByTestId("weight-card")).getByTestId("chart-list").textContent).toMatch(/79\.8/);
  });

  it("the pages are named in plain words, and Lifts draws each lift from what was logged", async () => {
    await at(2027, 2, 15, spp());
    pick("Back Squat");
    for (let i = 0; i < 4; i++) fireEvent.click(logSet());
    cleanup();
    await at(2027, 2, 22, spp());
    pick("Back Squat");
    for (let i = 0; i < 4; i++) fireEvent.click(logSet());
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    tab("Progress");
    expect([...screen.getByTestId("track-pages").querySelectorAll("button")].map((b) => b.textContent))
      .toEqual(["Overview", "Lifts", "Sprints", "Fitness", "Body", "Photos", "Weigh-in", "Calisthenics", "Movement"]);
    fireEvent.click(within(screen.getByTestId("track-pages")).getByRole("button", { name: "Lifts" }));
    const squat = within(screen.getByTestId("lifts-charts")).getByTestId("lift-squat");
    expect(squat.textContent).toMatch(/^Back squat/);
    expect(squat.getAttribute("data-chart-points")).toBe("2");
    expect(within(squat).getByTestId("trend")).toBeInTheDocument();
    expect(squat.textContent).toMatch(/105/);
  });

  it("a page with nothing logged says what will fill it", async () => {
    await at(2027, 2, 15, spp());
    tab("Progress");
    fireEvent.click(within(screen.getByTestId("track-pages")).getByRole("button", { name: "Lifts" }));
    expect(screen.getByTestId("lifts-empty")).toBeInTheDocument();
    fireEvent.click(within(screen.getByTestId("track-pages")).getByRole("button", { name: "Sprints" }));
    expect(within(screen.getByTestId("sprints-page")).getAllByTestId("chart-empty").length).toBeGreaterThan(0);
    fireEvent.click(within(screen.getByTestId("track-pages")).getByRole("button", { name: "Photos" }));
    expect(screen.getByTestId("photos-empty").textContent).toMatch(/No photos yet/);
  });
});

describe("the charts", () => {
  it("a line needs two readings; one stands alone, none says so", () => {
    const { rerender } = render(<ChartCard title="Bench press" unit="kg" data={[]} empty="Nothing logged yet." />);
    expect(screen.getByTestId("chart-empty").textContent).toBe("Nothing logged yet.");
    rerender(<ChartCard title="Bench press" unit="kg" data={[["3 Nov", 67.5, 1]]} />);
    expect(screen.getByTestId("chart-one")).toBeInTheDocument();
    expect(screen.queryByTestId("trend")).toBeNull();
    rerender(<ChartCard title="Bench press" unit="kg" dir="up" data={[["3 Nov", 67.5, 1], ["10 Nov", 70, 2]]} />);
    expect(screen.getByTestId("trend")).toBeInTheDocument();
    expect(screen.getByTestId("chart-card").getAttribute("data-chart-points")).toBe("2");
    expect(screen.getByTestId("delta").textContent).toMatch(/2\.5/);
  });

  it("the target is drawn as its own line and the scale makes room for it", () => {
    render(<Trend data={[["12 Oct", 81, 1], ["25 Oct", 80.2, 2]]} unit="kg" goal={76} goalLabel="Target 76 kg" />);
    expect(screen.getByTestId("trend").textContent).toMatch(/Target 76 kg/);
    const s = scaleFor([81, 80.2], 76);
    expect(s.y0).toBeLessThanOrEqual(76);
    expect(s.y1).toBeGreaterThanOrEqual(81);
    expect(s.ticks[0]).toBe(s.y0);
  });

  it("body weight is one line from every place a weight is typed", () => {
    const rows = weightSeries({ morning: { "2027-02-01": { kg: "81" }, "2027-02-03": { kg: "" } }, tape: [{ d: "2027-02-07", kg: 80.5 }], body: [{ d: "2027-02-10", bw: "80" }], fuel: null });
    expect(rows.map((r) => [r.d, r.kg])).toEqual([["2027-02-01", 81], ["2027-02-07", 80.5], ["2027-02-10", 80]]);
  });
});

describe("MORE is a list", () => {
  it("five places, each one tap away, and More always comes back to the list", async () => {
    await at(2027, 2, 15, spp());
    tab("More");
    const menu = screen.getByTestId("more-menu");
    expect([...menu.querySelectorAll("button")].map((b) => b.getAttribute("aria-label"))).toEqual(["This week", "The season", "The programmes", "Guide", "Settings"]);
    for (const name of ["This week", "The season", "The programmes", "Guide", "Settings"]) {
      fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name }));
      expect(screen.getByTestId("page-title").textContent).toBe(name);
      expect(screen.queryByTestId("more-menu")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Back to More" }));
      expect(screen.getByTestId("more-menu")).toBeInTheDocument();
    }
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    tab("More");
    expect(screen.getByTestId("more-menu")).toBeInTheDocument();
  });

  it("Settings is in named groups, and the season says in words what runs", async () => {
    await at(2027, 2, 15, spp({ planNote: "Strength, Power and Physique carries on: S2 · S3 · S4, test week from Mon 3 May." }));
    tab("More");
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    ["season", "day", "speed", "look", "sound", "cycle", "measure", "range", "calis", "backup", "reset"].forEach((k) => expect([k, !!document.getElementById("set-" + k)]).toEqual([k, true]));
    /* Strength, Power and Physique has no edge to switch */
    expect(document.getElementById("set-edge")).toBeNull();
    expect(screen.getByTestId("settings").textContent).toMatch(/carries on: weeks 2 to 4, test week/);
    fireEvent.click(screen.getByRole("button", { name: "Back to More" }));
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "The season" }));
    expect(screen.getByTestId("season-runs").textContent).toBe("Strength, Power and Physique");
  });

  it("the plan's line reads a run of week codes as weeks, and leaves everything else as written", () => {
    expect(planWords("carries on: S2 · S3 · S4 · S5, test week")).toBe("carries on: weeks 2 to 5, test week");
    expect(planWords("S12, then the cycle again")).toBe("week 12, then the cycle again");
    expect(planWords("Prep carries on: P8 · P9 · P12b, test day")).toBe("Prep carries on: P8 · P9 · P12b, test day");
    expect(planWords("")).toBe("");
  });
});

describe("the designed states", () => {
  it("saved: a short line that goes by itself; went wrong: the same, in red, and it's an alert", () => {
    render(<Toasts />);
    act(() => { toast("Weight saved · 80.4 kg"); });
    expect(screen.getByTestId("toast").textContent).toMatch(/Weight saved · 80\.4 kg/);
    expect(screen.getByTestId("toast").getAttribute("data-kind")).not.toBe("bad");
    act(() => { toast("That didn't save.", "bad"); });
    const bad = screen.getAllByTestId("toast").find((t) => t.getAttribute("data-kind") === "bad");
    expect(bad.textContent).toMatch(/That didn't save\./);
  });

  it("loading: the shape of the page, and the word for a screen reader", () => {
    render(<Skeleton />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.getByText("LOADING…")).toBeInTheDocument();
  });

  it("a screen that breaks says so, says nothing is lost, and offers the way back", () => {
    const Boom = () => { throw new Error("boom"); };
    const was = console.error; console.error = () => {};
    try { render(<Guard at="progress"><Boom /></Guard>); } finally { console.error = was; }
    const broke = screen.getByTestId("broke");
    expect(broke.textContent).toMatch(/This screen hit a problem/);
    expect(broke.textContent).toMatch(/Nothing you've logged has been lost/);
    expect(within(broke).getByRole("button", { name: "OPEN THE APP AGAIN" })).toBeInTheDocument();
  });

  it("nothing here yet: an icon, a title and what will fill it", () => {
    render(<Empty icon="camera" title="No photos yet">They show here by date.</Empty>);
    expect(screen.getByTestId("empty").textContent).toBe("No photos yetThey show here by date.");
  });

  it("an arrow in a button's label is drawn, and the button is named by its words", () => {
    render(<div>
      <button>{words("▶ START")}</button><button>{words("◀ BACK TO TODAY")}</button><button>{words("DONE ▶")}</button><button>{words("▲ UP")}</button><button>{words("PLAIN")}</button>
    </div>);
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["START", "BACK TO TODAY", "DONE", "UP", "PLAIN"]);
    expect(screen.getAllByRole("button").map((b) => b.querySelectorAll("svg").length)).toEqual([1, 1, 1, 1, 0]);
  });

  it("wiping the phone asks twice, and KEEP MY DATA keeps it", async () => {
    await at(2027, 2, 15, spp());
    tab("More");
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "RESET ALL DATA…" }));
    const ask = screen.getByTestId("reset-confirm");
    expect(document.getElementById("set-reset").textContent).toMatch(/can't be undone/);
    fireEvent.click(within(ask).getByRole("button", { name: "KEEP MY DATA" }));
    expect(screen.queryByTestId("reset-confirm")).toBeNull();
    expect(stored("o8s-maxes")).toEqual(MAXES);
  });

  it("dark is the look unless LIGHT or AUTO is picked, and both themes carry every colour", async () => {
    await at(2027, 2, 15, spp());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(Object.keys(THEMES.light).sort()).toEqual(Object.keys(THEMES.dark).sort());
    cleanup();
    await at(2027, 2, 15, spp({ theme: "light" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("everything already on the phone is still there after the update", () => {
  /* every store the app keeps, with something in each, as a phone that has been used for months holds them
     (every number here is made up) */
  const LOG = { "m2w1-mon-squat": { sets: [{ ok: true, w: "100", r: "6" }, { ok: true, w: "100", r: "6" }], n: "Back Squat", d: "2026-11-02" }, "m2w1-tue-bursts": { w: "4200", kind: "bursts", d: "2026-11-03" },
    "m2w1-mon-wu_A": { t: { 0: true, 1: true } }, "o8-levels": { lv: { mv_cossack: 2 } } };
  const STORE = {
    "o8s-log": LOG, "o8s-done": { "m2w1-mon": ["A", "B", "C"], "m2w1-tue": ["A"] }, "o8s-maxes": { squat: 110, bench: 85, tbdl: 140, pp: 55 },
    "o8s-maxhist": [{ d: "2026-10-19", lift: "squat", kg: 110, src: "entered by hand", macro: 1, week: 1 }], "o8s-body": [{ d: "2026-10-18", m: 1, bw: "80.5", arm: "38" }],
    "o8s-morning": { "2026-11-02": { rhr: "58", hrv: "61", kg: "80.2" }, "2026-11-03": { rhr: "59", hrv: "60" } }, "o8s-notes": { "m2w1-mon": "felt strong" },
    "o8s-calis": { lvl: { handstand: 1 }, owned: {} }, "o8s-tape": [{ d: "2026-11-01", kg: 80.5, waist: 83 }], "o8s-shop": { "0-1": true }, "o8s-foods": [{ n: "RICE 100G DRY", out: 260, factor: 2.6 }],
    "o8s-cook": { mince: { std: 240, big: 320, date: "2026-11-01" } }, "o8s-fday": { "2026-11-02": { box: true } }, "o8s-menu": { used: { halfban: "2026-11-02" }, prep: { 0: true } },
  };
  const SETTINGS = Object.assign(spp({ plans: [{ from: "2026-11-02", made: "2026-11-01", inputs: Object.assign({}, SPP, { restart: true }) }], breaks: ["1000", "1300"], boxDays: { mon: 1, wed: 1 }, ergUnit: "cal",
    profiles: { squat: { points: [{ load: 50, speed: 0.8 }], drawn: "2026-10-31" } }, base: { rhr: 60, hrv: 55, from: "2026-11-01" }, planNote: "Strength, Power and Physique repeats week 3.", planNoteAt: "2026-11-15", textSize: "l" }));

  it("opening the new version changes nothing that was stored: every tick, set, weight and number, key for key", async () => {
    await at(2026, 11, 30, SETTINGS, STORE);
    /* look around: every tab draws from the same stores without rewriting them */
    tab("Progress"); tab("Food"); tab("More"); tab("Today");
    await waitFor(() => expect(stored("o8s-settings")).toBeTruthy());
    Object.keys(STORE).forEach((k) => expect([k, stored(k)]).toEqual([k, STORE[k]]));
    /* the settings keep every answer they had; the app only adds what it has learned to ask since */
    const st = stored("o8s-settings");
    Object.keys(SETTINGS).forEach((k) => expect([k, st[k]]).toEqual([k, SETTINGS[k]]));
    /* and a phone that never chose a look opens dark, without that being written over a choice */
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("a phone set to the old light look keeps it: only a phone that never chose opens dark", async () => {
    await at(2026, 11, 30, Object.assign({}, SETTINGS, { theme: "light" }), STORE);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(stored("o8s-settings").theme).toBe("light");
  });

  it("the old numbers are on the new screens: the squat's last sets on its rows, the weight on its chart, the max in its box", async () => {
    await at(2026, 11, 30, SETTINGS, STORE);
    tab("Progress");
    expect(within(screen.getByTestId("overview")).getByTestId("stat-weight").textContent).toMatch(/80\.5|80\.2/);
    fireEvent.click(within(screen.getByTestId("track-pages")).getByRole("button", { name: "Lifts" }));
    expect(screen.getAllByTestId("max-when")[0].textContent).toBe("Last set 19 Oct · entered by hand");
    expect(screen.getAllByTestId("max-when")[0].parentElement.parentElement.textContent).toMatch(/^Back Squat.*110/);
    fireEvent.click(within(screen.getByTestId("track-pages")).getByRole("button", { name: "Weigh-in" }));
    expect(screen.getByTestId("tape-kg").getAttribute("data-chart-points")).toBe("1");
  });

  it("a backup made before the update loads into it whole, and comes back out the same", async () => {
    await at(2026, 11, 30, spp());
    tab("More");
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    const backup = { st: SETTINGS, done: STORE["o8s-done"], log: LOG, maxes: STORE["o8s-maxes"], maxHist: STORE["o8s-maxhist"], body: STORE["o8s-body"], morning: STORE["o8s-morning"], notes: STORE["o8s-notes"],
      calis: STORE["o8s-calis"], tape: STORE["o8s-tape"], shop: STORE["o8s-shop"], foods: STORE["o8s-foods"], cook: STORE["o8s-cook"], fdays: STORE["o8s-fday"], menuAll: STORE["o8s-menu"] };
    fireEvent.click(screen.getByRole("button", { name: "IMPORT" }));
    fireEvent.change(screen.getByPlaceholderText("Paste a backup here, then tap load"), { target: { value: JSON.stringify(backup) } });
    fireEvent.click(screen.getByRole("button", { name: "LOAD THIS BACKUP" }));
    expect(screen.getByTestId("toast").textContent).toMatch(/Backup loaded/);
    await waitFor(() => expect(stored("o8s-log")).toEqual(LOG));
    ["o8s-done", "o8s-maxes", "o8s-maxhist", "o8s-body", "o8s-morning", "o8s-notes", "o8s-tape", "o8s-shop", "o8s-foods", "o8s-cook", "o8s-fday", "o8s-menu"].forEach((k) => expect([k, stored(k)]).toEqual([k, STORE[k]]));
    /* and out again */
    fireEvent.click(screen.getByRole("button", { name: "EXPORT" }));
    await waitFor(() => expect(screen.getByPlaceholderText("Paste a backup here, then tap load").value.length).toBeGreaterThan(50));
    const out = JSON.parse(screen.getByPlaceholderText("Paste a backup here, then tap load").value);
    ["done", "log", "maxes", "maxHist", "body", "morning", "notes", "tape", "shop", "foods", "cook", "fdays", "menuAll"].forEach((k) => expect([k, out[k]]).toEqual([k, backup[k]]));
    Object.keys(SETTINGS).forEach((k) => expect([k, out.st[k]]).toEqual([k, SETTINGS[k]]));
  });

  it("a paste that isn't a backup changes nothing and says so", async () => {
    await at(2026, 11, 30, SETTINGS, STORE);
    tab("More");
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "IMPORT" }));
    fireEvent.change(screen.getByPlaceholderText("Paste a backup here, then tap load"), { target: { value: "not a backup" } });
    fireEvent.click(screen.getByRole("button", { name: "LOAD THIS BACKUP" }));
    const t = screen.getByTestId("toast");
    expect(t.getAttribute("data-kind")).toBe("bad");
    expect(t.textContent).toMatch(/isn't a Fighter backup/);
    expect(stored("o8s-log")).toEqual(LOG);
  });
});
