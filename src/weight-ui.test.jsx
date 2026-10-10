import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import App from "./App.jsx";
import { buildSeason } from "./builder.js";
import { weightCfg } from "./weight.js";

/* ================================================================
   MAKING WEIGHT, in the app — weight-making.md's worked example and
   proof 8: with no limit, no trace of it anywhere.
   ================================================================ */
const FIGHT = { booked: true, fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability", classic: false };
const LIMIT = { limit: "76", tol: "1", natural: "80" };

function settings(season, extra) {
  return JSON.stringify(Object.assign(
    { start: "2026-10-12", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
      imStart: "2026-10-12", rangeStart: "2026-10-12", levelStart: "2026-10-12", v12: true, program: "prep",
      season, fightDate: season.fight, plans: [{ from: "2026-10-12", made: "2026-10-08", inputs: season }] }, extra || {}));
}
/* the worked example's mornings: 83.0 on 11 October, then weeks averaging 81.6 and 79.9 */
const MORNINGS = { "2026-10-11": { kg: "83.0" } };
["2026-10-13", "2026-10-15", "2026-10-17", "2026-10-18"].forEach((d) => { MORNINGS[d] = { kg: "81.6" }; });
["2026-10-20", "2026-10-22", "2026-10-24", "2026-10-25"].forEach((d) => { MORNINGS[d] = { kg: "79.9" }; });

async function mount(at, season, extra) {
  vi.setSystemTime(at);
  localStorage.setItem("o8s-settings", settings(season, extra));
  localStorage.setItem("o8s-morning", JSON.stringify(MORNINGS));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
const withLimit = () => Object.assign({}, FIGHT, LIMIT);
const drawn = () => ({ wdraws: [{ at: "2026-10-11", cfg: weightCfg(withLimit()) }] });
const tab = (n) => fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: n }));
function pickIn(chapterName, name) {
  fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  const chapter = screen.getByText(chapterName).closest("[data-chapter]");
  if (!within(chapter).queryByText(name)) fireEvent.click(within(chapter).getByRole("button", { expanded: false }));
  fireEvent.click(within(chapter).getByText(name));
}

describe("making weight, in the app", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100, tbdl: 180, pp: 70, cw_squat: 120, cw_tbdl: 160, cw_bench: 90, cw_pp: 60 }));
  });
  afterEach(() => vi.useRealTimers());

  it("starts the morning with the scales: a big input, then the seven-morning average and this Sunday's aim", async () => {
    await mount(new Date(2026, 9, 19, 2, 0, 0), withLimit(), drawn());
    expect(screen.getByTestId("card-name").textContent).toBe("Every morning — the scales");
    expect(screen.getAllByTestId("card-desc")[0].textContent).toMatch(/^Go to the toilet, then get on the scales before you eat or drink, with nothing on\./);
    expect(screen.getByTestId("scales-line").textContent).toBe("SEVEN-MORNING AVERAGE 81.6 · THIS SUNDAY'S AIM 79.6");
    fireEvent.change(screen.getByTestId("scales-input"), { target: { value: "81.2" } });
    expect(JSON.parse(localStorage.getItem("o8s-morning"))["2026-10-19"].kg).toBe("81.2");
    /* skippable: DONE moves on with no number */
    fireEvent.click(screen.getByRole("button", { name: "DONE" }));
    expect(screen.getByTestId("card-name").textContent).toBe("Resting heart rate and HRV");
  });

  it("runs the food at the step: the banner, no three o'clock, lunch at half the carb", async () => {
    await mount(new Date(2026, 9, 19, 2, 0, 0), withLimit(), drawn());
    tab("FOOD");
    expect(screen.getByTestId("weight-banner").textContent).toMatch(/^MAKING WEIGHT · STEP 2 · SUNDAY'S AIM 79\.6/);
    expect(screen.getByTestId("weight-banner-line").textContent).toBe("No three o'clock this week.");
    const menu = screen.getByTestId("food-menu");
    expect(within(menu).queryByText("TWO BANANAS")).not.toBeInTheDocument();
    expect(within(menu).getAllByText("BATCH — HALF THE CARB").length).toBeGreaterThan(0);
    expect(within(menu).getAllByText("415 KCAL · P34 · C36 · F15").length).toBeGreaterThan(0);
    expect(within(menu).getAllByText("PORRIDGE — NO HONEY").length).toBeGreaterThan(0);
  });

  it("turns the Sunday check's bodyweight line into the weight result", async () => {
    await mount(new Date(2026, 9, 25, 7, 0, 0), withLimit(), drawn());
    pickIn("EVENING", "Weekly Check");
    expect(screen.getByTestId("wr-average").textContent).toBe("79.9");
    expect(screen.getByTestId("wr-change").textContent).toBe("-1.7");
    expect(screen.getByTestId("wr-aim").textContent).toBe("79.6");
    expect(screen.getByTestId("wr-verdict").textContent).toBe("ON TRACK");
    expect(screen.getByTestId("wr-step").textContent).toBe("STEP 2");
    expect(screen.getByTestId("wr-forecast").textContent).toBe("about 76.3");
    expect(screen.queryByLabelText("BODYWEIGHT (KG)")).not.toBeInTheDocument();
  });

  it("shows the line when the plan is set, and pauses the Referee's bodyweight rule", async () => {
    await mount(new Date(2026, 9, 11, 9, 0, 0), withLimit(), drawn());
    expect(screen.getByTestId("line-card")).toBeInTheDocument();
    ["2026-10-18", "2026-10-25", "2026-11-01", "2026-11-08", "2026-11-15", "2026-11-22"].forEach((d, i) =>
      expect(screen.getByTestId("aim-" + d).textContent).toBe(["81.1", "79.2", "78.8", "78.3", "77.9", "77.5"][i]));
    expect(screen.getByTestId("fight-week-aim").textContent).toBe("77.5");
    expect(screen.getByTestId("morning-aim").textContent).toBe("76.0");
    expect(screen.getByTestId("line-step").textContent).toMatch(/^STEP 2 FROM MON,? 12 OCT/);
    expect(screen.getByTestId("line-forecast").textContent).toBe("about 76.0");
    expect(screen.queryByTestId("over-card")).not.toBeInTheDocument();
    tab("PROGRESS");
    fireEvent.click(screen.getByRole("button", { name: /REFEREE/i }));
    expect(screen.getByTestId("referee-paused")).toBeInTheDocument();
  });

  it("asks for the limit, the tolerance and the natural weight, and the three weigh-ins — and sets the plan without re-planning the training", async () => {
    await mount(new Date(2026, 9, 11, 9, 0, 0), FIGHT);
    tab("MORE");
    fireEvent.click(screen.getByRole("button", { name: "SETTINGS" }));
    ["DAY BEFORE – MORNING", "DAY BEFORE – AFTERNOON OR EVENING", "ON THE DAY"].forEach((n) => expect(screen.getByRole("button", { name: n })).toBeInTheDocument());
    const box = (lab) => screen.getByText(lab).parentElement.querySelector("input");
    fireEvent.change(box("Limit (kg)"), { target: { value: "76" } });
    fireEvent.change(box("Tolerance (kg)"), { target: { value: "1" } });
    fireEvent.change(box("Natural weight (kg)"), { target: { value: "80" } });
    fireEvent.click(screen.getByRole("button", { name: "SET THE WEIGHT PLAN" }));
    const st = JSON.parse(localStorage.getItem("o8s-settings"));
    expect(st.plans).toHaveLength(1);
    expect(st.wdraws).toHaveLength(1);
    expect(st.wdraws[0]).toMatchObject({ at: "2026-10-11", cfg: { limit: 76, tol: 1, natural: 80, weighIn: "before", fight: "2026-11-28" } });
    expect(st.planNote).toMatch(/^weight limit — → 76 kg · tolerance — → 1 kg · natural weight — → 80 kg\. The weight plan's line is redrawn; the training doesn't change\./);
    /* 83.0 this morning: the line is drawn */
    expect(screen.getByTestId("line-card")).toBeInTheDocument();
    expect(screen.getByTestId("line-step").textContent).toMatch(/^STEP 2/);
  });
});

describe("making weight — fight week, in the app", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100, tbdl: 180, pp: 70, cw_squat: 120, cw_tbdl: 160, cw_bench: 90, cw_pp: 60 }));
  });
  afterEach(() => vi.useRealTimers());

  it("the light days replace the day's food", async () => {
    await mount(new Date(2026, 10, 25, 9, 0, 0), withLimit(), drawn());
    tab("FOOD");
    expect(screen.getByTestId("weight-banner").textContent).toMatch(/^MAKING WEIGHT · THE LIGHT DAYS/);
    const menu = screen.getByTestId("food-menu");
    expect(within(menu).getByText("3 EGGS ON A WHITE BAGEL")).toBeInTheDocument();
    expect(within(menu).queryByText("TWO BANANAS")).not.toBeInTheDocument();
    expect(within(menu).queryByText("POUCH LOAD")).not.toBeInTheDocument();
  });
  it("the weigh-in day: the scales against the morning aim, the weigh-in on the timeline", async () => {
    localStorage.setItem("o8s-morning", JSON.stringify(Object.assign({}, MORNINGS, { "2026-11-27": { kg: "76.4" } })));
    vi.setSystemTime(new Date(2026, 10, 27, 4, 0, 0));
    localStorage.setItem("o8s-settings", settings(withLimit(), drawn()));
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
    expect(screen.getByTestId("card-name").textContent).toBe("Every morning — the scales");
    expect(screen.getByTestId("weighin-morning").textContent).toBe("0.4 over the weigh-in morning aim of 76.0. Halve the small feeds and keep sipping.");
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    expect(document.body.textContent).toMatch(/The weigh-in/);
    tab("FOOD");
    expect(screen.getByTestId("weight-banner").textContent).toMatch(/^MAKING WEIGHT · WEIGH-IN DAY · MORNING AIM 76\.0/);
    expect(within(screen.getByTestId("food-menu")).getAllByText("2 EGGS AND A RICE CAKE — HALF").length).toBeGreaterThan(0);
  });
  it("too far: the over-the-ceiling card on the day it's set", async () => {
    const far = Object.assign({}, FIGHT, { limit: "70", tol: "0", natural: "80", weighIn: "am" });
    localStorage.setItem("o8s-morning", JSON.stringify({ "2026-10-05": { kg: "82" }, "2026-10-07": { kg: "82" }, "2026-10-09": { kg: "82" }, "2026-10-11": { kg: "82" } }));
    vi.setSystemTime(new Date(2026, 9, 11, 9, 0, 0));
    localStorage.setItem("o8s-settings", settings(far, { wdraws: [{ at: "2026-10-11", cfg: weightCfg(far) }] }));
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
    expect(screen.getByTestId("line-forecast").textContent).toBe("about 73.2");
    expect(screen.getByTestId("over-card").textContent).toMatch(/At this pace you'll be about 73\.2 on the scales — 3\.2 over\./);
  });
});

describe("proof 8 — no limit", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100, tbdl: 180, pp: 70, cw_squat: 120, cw_tbdl: 160, cw_bench: 90, cw_pp: 60 }));
  });
  afterEach(() => vi.useRealTimers());

  it("no scales in the morning", async () => {
    await mount(new Date(2026, 9, 19, 2, 0, 0), FIGHT);
    expect(screen.getByTestId("card-name").textContent).toBe("Resting heart rate and HRV");
    expect(screen.queryByTestId("scales-input")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    expect(screen.queryByText("Every morning — the scales")).not.toBeInTheDocument();
  });
  it("no weight banner and no step anywhere", async () => {
    await mount(new Date(2026, 9, 19, 2, 0, 0), FIGHT);
    tab("FOOD");
    expect(screen.queryByTestId("weight-banner")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/STEP \d|HALF THE CARB|NO HONEY|MAKING WEIGHT/);
    expect(within(screen.getByTestId("food-menu")).getAllByText("TWO BANANAS").length).toBeGreaterThan(0);
    tab("MORE");
    fireEvent.click(screen.getByRole("button", { name: "SETTINGS" }));
    expect(screen.queryByTestId("line-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("weight-waiting")).not.toBeInTheDocument();
  });
  it("the Sunday check's bodyweight line and the Referee as before", async () => {
    await mount(new Date(2026, 9, 25, 7, 0, 0), FIGHT);
    pickIn("EVENING", "Weekly Check");
    expect(screen.queryByTestId("weight-result")).not.toBeInTheDocument();
    expect(screen.getByLabelText("BODYWEIGHT (KG)")).toBeInTheDocument();
    tab("PROGRESS");
    fireEvent.click(screen.getByRole("button", { name: /REFEREE/i }));
    expect(screen.queryByTestId("referee-paused")).not.toBeInTheDocument();
    expect(screen.getByText("Bodyweight falling more than 0.5 kg a week")).toBeInTheDocument();
  });
  it("every week of training identical, with a limit or without one", () => {
    const plans = (season) => [{ from: "2026-10-12", made: "2026-10-08", inputs: season }];
    const a = buildSeason({ plans: plans(FIGHT), today: "2026-10-12" });
    const b = buildSeason({ plans: plans(Object.assign({}, FIGHT, LIMIT)), today: "2026-10-12" });
    const strip = (s) => JSON.stringify(s.rows.map((r) => Object.assign({}, r, { camp: r.camp ? Object.assign({}, r.camp, { inputs: undefined }) : r.camp, under: undefined, inputs: undefined })));
    expect(a.rows.length).toBe(b.rows.length);
    expect(strip(b)).toBe(strip(a));
    /* and the morning-weight half of the weigh-in choice never moves a week either */
    const c = buildSeason({ plans: plans(Object.assign({}, FIGHT, LIMIT, { weighIn: "am" })), today: "2026-10-12" });
    expect(strip(c).replace(/"weighIn":"am"/g, '"weighIn":"before"')).toBe(strip(a));
  });
});
