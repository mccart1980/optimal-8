import React from "react";
import guide from "../guide.md?raw";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";
import { roundShare, fadePct, stopStateShares, stopRounds } from "./safety.js";
import { pairEntries } from "./metrics.js";

/* THE BOXES. In PREP and CAMP every value a result asks for has its own
   labelled box: the number pad for a number, the keyboard for a word, the
   time picker for a time, big buttons for a choice. The classic Fighter's
   boxes are exactly as they were. */

const plans = [{ from: "2026-10-12", made: "2026-10-08", inputs: { booked: true, fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" } }];
const camp = (extra) => Object.assign({ start: "2026-09-28", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
  imStart: "2026-09-28", levelStart: "2026-09-28", v12: true, program: "prep", plans, season: plans[0].inputs, fightDate: "2026-11-28",
  head: { "2026-11-28": { a: "no" } } }, extra || {});
const prep = (extra) => Object.assign({ start: "2026-01-05", macroBase: 1, iron: false, sound: false, autoRest: true,
  medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: "2026-01-05", rangeStart: "2026-01-05",
  camp: false, lastTen: false, taper: false, levelStart: "2026-01-05", program: "prep", v12: true }, extra || {});
const fighter = (extra) => prep(Object.assign({ program: "fighter" }, extra || {}));
/* the ten-round camp from the stop rule's own test */
const camp10 = { booked: true, fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "good", emphasis: "none" };
const ten = () => prep({ program: "prep", plans: [{ from: "2027-01-04", made: "2026-12-31", inputs: camp10 }], season: camp10, fightDate: "2027-03-13" });

async function at(isoDay, st, log) {
  vi.setSystemTime(new Date(isoDay + "T06:00:00"));
  localStorage.setItem("o8s-settings", JSON.stringify(st));
  if (log) localStorage.setItem("o8s-log", JSON.stringify(log));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
function wholeDay() {
  if (!screen.queryByTestId("whole-day")) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  for (let k = 0; k < 8; k++) { const b = document.querySelector("[data-chapter] [aria-expanded=false]"); if (!b) break; fireEvent.click(b); }
  return [...document.querySelectorAll("[data-flow-name]")];
}
function pick(name) {
  const row = wholeDay().find((e) => e.getAttribute("data-flow-name") === name);
  if (!row) throw new Error("no row " + name + " in " + wholeDay().map((e) => e.getAttribute("data-flow-name")).join(" | "));
  fireEvent.click(row.querySelectorAll("button")[1]);
  return screen.getByTestId("now-card");
}
const card = () => screen.getByTestId("now-card");
const box = (label) => within(card()).getByLabelText(label);
const type = (label, value) => fireEvent.change(box(label), { target: { value } });
const log = () => JSON.parse(localStorage.getItem("o8s-log") || "{}");
const entry = (re) => { const l = log(); const k = Object.keys(l).find((x) => re.test(x)); return k ? l[k] : undefined; };
/* every box on the card: [label, inputMode, type, height] */
const boxes = () => [...card().querySelectorAll("input")].map((i) => [i.closest("label") ? i.closest("label").firstChild.textContent : null, i.inputMode, i.type]);
const tall = () => [...card().querySelectorAll("input")].forEach((i) => expect(parseInt(i.style.minHeight, 10)).toBeGreaterThanOrEqual(48));
const labelSize = (label) => parseInt(box(label).closest("label").firstChild.style.fontSize, 10);
const pressed = (name) => within(card()).getByRole("button", { name }).getAttribute("aria-pressed");

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("two numbers, two boxes", () => {
  it("Monday's base: 7.2 and 128 save as w 7.2 and hr 128", async () => {
    await at("2026-10-12", camp());
    pick("Easy, nose only");
    expect(box("DISTANCE (KM)").inputMode).toBe("decimal");
    expect(box("AVERAGE HEART RATE (BPM)").inputMode).toBe("decimal");
    expect(labelSize("DISTANCE (KM)")).toBe(18);
    tall();
    type("DISTANCE (KM)", "7.2");
    type("AVERAGE HEART RATE (BPM)", "128");
    expect(entry(/-mon-c_base$/)).toMatchObject({ w: "7.2", hr: "128" });
  });
  it("a distance already saved in w shows in DISTANCE", async () => {
    await at("2026-10-12", camp(), { "mCw1-mon-c_base": { w: "6.4" } });
    pick("Easy, nose only");
    expect(box("DISTANCE (KM)").value).toBe("6.4");
    expect(box("AVERAGE HEART RATE (BPM)").value).toBe("");
  });
  it("fight week's 20 easy minutes have the same two boxes", async () => {
    await at("2026-11-23", camp());
    pick("Easy, nose only");
    expect(box("DISTANCE (KM)").inputMode).toBe("decimal");
    expect(box("AVERAGE HEART RATE (BPM)").inputMode).toBe("decimal");
  });
  it("the sled, CAMP and PREP: LOAD (KG) and TIME (S)", async () => {
    await at("2026-10-14", camp());
    pick("Heavy Sled");
    type("LOAD (KG)", "60"); type("TIME (S)", "6.1");
    expect(entry(/-wed-c_sled$/)).toMatchObject({ w: "60", t: "6.1" });
    cleanup();
    await at("2026-01-07", prep());
    pick("Heavy Sled Sprints");
    expect(boxes()).toEqual([["LOAD (KG)", "decimal", "text"], ["TIME (S)", "decimal", "text"]]);
    type("TIME (S)", "5.8");
    expect(entry(/-wed-sled$/)).toMatchObject({ t: "5.8" });
  });
  it("fight night: ROUNDS on the number pad, RESULT on the keyboard", async () => {
    await at("2026-11-28", camp());
    pick("The fight");
    expect(box("ROUNDS").inputMode).toBe("decimal");
    expect(box("RESULT").inputMode).toBe("text");
    type("ROUNDS", "3"); type("RESULT", "won on points");
    expect(entry(/-sat-c12_result$/)).toMatchObject({ w: "3", res: "won on points" });
  });
});

describe("the Sunday rounds on two machines", () => {
  it("round one 250 and 20, the last round 200 and 16: the fade is 80%", async () => {
    await at("2026-10-18", camp());
    pick("The 3 × 2 Simulation");
    expect(boxes()).toEqual([["ROUND 1 · SKIERG (M)", "decimal", "text"], ["ROUND 1 · BIKE (CAL)", "decimal", "text"],
      ["LAST ROUND · SKIERG (M)", "decimal", "text"], ["LAST ROUND · BIKE (CAL)", "decimal", "text"]]);
    type("ROUND 1 · SKIERG (M)", "250"); type("ROUND 1 · BIKE (CAL)", "20");
    type("LAST ROUND · SKIERG (M)", "200"); type("LAST ROUND · BIKE (CAL)", "16");
    expect(screen.getByTestId("round-fade").textContent).toBe("THE FADE · 80%");
    expect(entry(/-sun-c_fs_rd1$/)).toMatchObject({ w: "250", cal: "20" });
    expect(entry(/-sun-c_fs_rd6$/)).toMatchObject({ w: "200", cal: "16" });
  });
  it("SkiErg alone, 250 then 200: 80%", async () => {
    await at("2026-01-18", prep());
    pick("The 6 × 3 Simulation");
    type("ROUND 1 · SKIERG (M)", "250"); type("LAST ROUND · SKIERG (M)", "200");
    expect(screen.getByTestId("round-fade").textContent).toBe("THE FADE · 80%");
  });
  it("the share, the fade and the stop rule", () => {
    expect(roundShare({ w: "250", cal: "20" }, { w: "200", cal: "16" })).toBeCloseTo(0.8);
    expect(fadePct({ w: "250", cal: "20" }, { w: "200", cal: "16" })).toBeCloseTo(80);
    expect(fadePct({ w: "250" }, { w: "200" })).toBeCloseTo(80);
    expect(fadePct({ w: "250", cal: "20" }, { w: "200" })).toBeCloseTo(80);
    expect(roundShare({ w: "250", cal: "20" }, { w: "170", cal: "14" })).toBeCloseTo(0.69);
    expect(fadePct({}, { w: "200" })).toBe(null);
    const rounds = stopRounds(6, 10);
    const first = { w: "250", cal: "20" };
    expect(stopStateShares(first, [{ w: "170", cal: "14" }], null, rounds)).toMatchObject({ stopAt: 0, done: true, why: "drop" });
    expect(stopStateShares(first, [{ w: "190", cal: "16" }], null, rounds)).toMatchObject({ stopAt: -1, next: 1, done: false });
    // the dashboard's and the camp page's fade read the same share
    const l = { "mCw3-sun-c_fs_rd1": { w: "250", cal: "20" }, "mCw3-sun-c_fs_rd6": { w: "200", cal: "16" } };
    expect(pairEntries(l, "c_fs_rd1", "c_fs_rd6", true, "sun", fadePct)[0].v).toBeCloseTo(80);
  });
  it("past the fight: 170 and 14 against 250 and 20 (68% and 70%, mean 69%) ends the rounds", async () => {
    await at("2027-02-28", ten());
    pick("The 10 × 3 Simulation");
    type("ROUND 1 · SKIERG (M)", "250"); type("ROUND 1 · BIKE (CAL)", "20");
    expect(box("ROUND 7 · SKIERG (M)").inputMode).toBe("decimal");
    type("ROUND 7 · SKIERG (M)", "170"); type("ROUND 7 · BIKE (CAL)", "14");
    expect(screen.getByTestId("stop-verdict").textContent).toMatch(/^ROUND 7 WAS THE LAST — THE REST ARE OFF/);
    expect(within(card()).queryByLabelText("ROUND 8 · SKIERG (M)")).toBe(null);
    expect(box("LAST ROUND · SKIERG (M)").value).toBe("170");
    expect(box("LAST ROUND · BIKE (CAL)").value).toBe("14");
    expect(screen.getByTestId("round-fade").textContent).toBe("THE FADE · 69%");
  });
  it("190 and 16 (76% and 80%) doesn't", async () => {
    await at("2027-02-28", ten());
    pick("The 10 × 3 Simulation");
    type("ROUND 1 · SKIERG (M)", "250"); type("ROUND 1 · BIKE (CAL)", "20");
    type("ROUND 7 · SKIERG (M)", "190"); type("ROUND 7 · BIKE (CAL)", "16");
    expect(screen.queryByTestId("stop-verdict")).toBe(null);
    expect(box("ROUND 8 · SKIERG (M)")).toBeInTheDocument();
  });
  it("the Thursday rounds on the erg stay one box a round", async () => {
    await at("2027-01-28", ten());
    pick("ROUNDS ON THE ERG · 7 × 3");
    expect(boxes()).toEqual([["ROUND 1 OUTPUT (OUTPUT)", "decimal", "text"], ["LAST ROUND OUTPUT (OUTPUT)", "decimal", "text"], ["ROUND 7 OUTPUT", "decimal", "text"]]);
    expect(screen.queryByTestId("round-fade")).toBe(null);
  });
});

describe("the conditioning sessions", () => {
  it("a 4 × 4 session shows four boxes: 230, 228, 225 and 220 are TOTAL 903, MEAN 225.8, and in PROGRESS → MEASURE", async () => {
    await at("2026-10-20", camp({ ergUnit: "w" }));
    pick("4-MINUTE INTERVALS");
    const labels = ["INTERVAL 1 (W)", "INTERVAL 2 (W)", "INTERVAL 3 (W)", "INTERVAL 4 (W)"];
    expect(boxes().map((b) => b[0])).toEqual(labels.concat(["PEAK HEART RATE (BPM)"]));
    boxes().forEach((b) => expect(b[1]).toBe("decimal"));
    tall();
    expect(labelSize("INTERVAL 1 (W)")).toBe(18);
    ["230", "228", "225", "220"].forEach((x, i) => type(labels[i], x));
    expect(screen.getByTestId("erg-total").textContent).toBe("TOTAL 903 W");
    expect(screen.getByTestId("erg-mean").textContent).toBe("MEAN 225.8 W");
    expect(entry(/-tue-c_eng1_erg$/).v).toEqual(["230", "228", "225", "220"]);
    type("PEAK HEART RATE (BPM)", "182");
    expect(entry(/-tue-c_eng1$/)).toMatchObject({ hr: "182" });
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByText("PROGRESS"));
    fireEvent.click(screen.getByRole("button", { name: "MEASURE" }));
    expect(screen.getByText("4-minute intervals")).toBeInTheDocument();
    expect(screen.getByText("903")).toBeInTheDocument();
  });
  it("week 1's 2 × 4 shows two; boxes can be left empty", async () => {
    await at("2026-10-13", camp());
    pick("4-MINUTE INTERVALS");
    expect(boxes().map((b) => b[0])).toEqual(["INTERVAL 1 (W)", "INTERVAL 2 (W)", "PEAK HEART RATE (BPM)"]);
    type("INTERVAL 2 (W)", "210");
    expect(screen.getByTestId("erg-total").textContent).toBe("TOTAL 210 W");
  });
  it("LAST TIME is the total of the last session of the same type", async () => {
    await at("2026-10-20", camp(), { "mCw1-tue-c_eng1_erg": { v: ["200", "205"], kind: "vo2", d: "2026-10-13" } });
    pick("4-MINUTE INTERVALS");
    expect(screen.getByTestId("erg-last").textContent).toBe("LAST TIME 405 W");
  });
  it("tempo: a box a minute, in the unit set in Settings", async () => {
    await at("2026-10-15", camp({ ergUnit: "cal" }));
    pick("TEMPO INTERVALS");
    const b = boxes().map((x) => x[0]);
    expect(b[0]).toBe("MINUTE 1 (cal)");
    expect(b[b.length - 1]).toBe("PEAK HEART RATE (BPM)");
  });
});

describe("the settle", () => {
  it("165 and 130 show a drop of 35, saved as c_settle1_drop; the seconds-to-land box stays", async () => {
    await at("2026-10-13", camp());
    pick("The 60-Second Settle");
    expect(boxes()).toEqual([["SECONDS TO LAND ON THE BREATH", "decimal", "text"],
      ["HEART RATE WHEN YOU STOP (BPM)", "decimal", "text"], ["HEART RATE AFTER 60 SECONDS (BPM)", "decimal", "text"]]);
    type("HEART RATE WHEN YOU STOP (BPM)", "165");
    type("HEART RATE AFTER 60 SECONDS (BPM)", "130");
    expect(screen.getByTestId("recovery-drop").textContent).toBe("35 BPM");
    expect(entry(/-tue-c_settle1_drop$/)).toMatchObject({ w: "35" });
  });
  it("PREP's settle has the same boxes", async () => {
    await at("2026-01-06", prep());
    pick("The 60-Second Settle");
    type("HEART RATE WHEN YOU STOP (BPM)", "170");
    type("HEART RATE AFTER 60 SECONDS (BPM)", "142");
    expect(entry(/-tue-settle_drop$/)).toMatchObject({ w: "28" });
  });
});

describe("one number, words, choices and times", () => {
  it("the burst test: PEAK WATTS", async () => {
    await at("2026-10-13", camp());
    pick("THE BURST TEST");
    expect(boxes()).toEqual([["BURST 1 · PEAK WATTS", "decimal", "text"], ["BURST 10 · PEAK WATTS", "decimal", "text"]]);
  });
  it("the nasal test: the pace on the keyboard; HAD TO / CAVED toggle and save", async () => {
    await at("2026-10-15", camp());
    pick("The Nasal Threshold Test");
    expect(box("PACE (E.G. 2:05 OR 180 W)").inputMode).toBe("text");
    type("PACE (E.G. 2:05 OR 180 W)", "2:05");
    expect(entry(/-thu-c_nasal_pace$/)).toMatchObject({ w: "2:05" });
    expect(pressed("HAD TO")).toBe("false");
    fireEvent.click(within(card()).getByRole("button", { name: "HAD TO" }));
    expect(pressed("HAD TO")).toBe("true");
    expect(entry(/-thu-c_nasal_honest$/)).toMatchObject({ w: "had to" });
    fireEvent.click(within(card()).getByRole("button", { name: "CAVED" }));
    expect(pressed("HAD TO")).toBe("false");
    expect(pressed("CAVED")).toBe("true");
    expect(entry(/-thu-c_nasal_honest$/)).toMatchObject({ w: "caved" });
    fireEvent.click(within(card()).getByRole("button", { name: "CAVED" }));
    expect(pressed("CAVED")).toBe("false");
    expect(entry(/-thu-c_nasal_honest$/).w).toBe("");
    cleanup();
    await at("2026-01-08", prep());
    pick("Nasal Threshold Test");
    expect(box("PACE (E.G. 2:05 OR 180 W)").inputMode).toBe("text");
    fireEvent.click(within(card()).getByRole("button", { name: "HAD TO" }));
    expect(entry(/-thu-p_nasal_h$/)).toMatchObject({ w: "had to" });
  });
  it("Saturday's jumps: no BEST HEIGHT on a drop-landing week; CLEAN / MESSY toggle and save", async () => {
    await at("2026-10-17", camp());
    pick("Drop Landings");
    expect(within(card()).queryByLabelText("BEST HEIGHT (CM)")).toBe(null);
    fireEvent.click(within(card()).getByRole("button", { name: "CLEAN" }));
    expect(pressed("CLEAN")).toBe("true");
    expect(entry(/-sat-c_jumpsat$/)).toMatchObject({ q: "clean" });
    fireEvent.click(within(card()).getByRole("button", { name: "MESSY" }));
    expect(pressed("CLEAN")).toBe("false");
    expect(entry(/-sat-c_jumpsat$/)).toMatchObject({ q: "messy" });
    fireEvent.click(within(card()).getByRole("button", { name: "MESSY" }));
    expect(pressed("MESSY")).toBe("false");
    cleanup();
    localStorage.removeItem("o8s-log");
    await at("2026-10-31", camp());
    pick("Low-Box Depth Jumps");
    expect(box("BEST HEIGHT (CM)").inputMode).toBe("decimal");
    type("BEST HEIGHT (CM)", "38");
    expect(entry(/-sat-c_jumpsat$/)).toMatchObject({ w: "38" });
  });
  it("the weekly check's lights-out is a time picker, CAMP and PREP", async () => {
    await at("2026-10-18", camp());
    pick("Weekly Check");
    expect(box("LIGHTS-OUT TIME, AVERAGED").type).toBe("time");
    type("LIGHTS-OUT TIME, AVERAGED", "20:30");
    expect(entry(/-sun-cwr_lights$/)).toMatchObject({ w: "20:30" });
    cleanup();
    await at("2026-01-11", prep());
    pick("Weekly Check");
    expect(box("LIGHTS-OUT TIME, AVERAGED").type).toBe("time");
  });
});

describe("the classic Fighter", () => {
  it("its sled, settle, settle2, wr_lights, cond, cond2, jump, fs_rd1 and fs_rd6 are exactly as before", async () => {
    const want = [
      ["2026-01-06", "4-MINUTE INTERVALS", [["OUTPUT / PEAK HR", "decimal", "text"]]],
      ["2026-01-06", "The 60-Second Settle", [["SECONDS", "decimal", "text"]]],
      ["2026-01-07", "Heavy Sled Sprints", [["LOAD (KG) · TIME (S)", "decimal", "text"]]],
      ["2026-01-08", "40-SECOND REPEATS", [["OUTPUT / PEAK HR", "decimal", "text"]]],
      ["2026-01-08", "The 60-Second Settle", [["SECONDS", "decimal", "text"]]],
      ["2026-01-10", "Drop Landings", [["HEIGHT / QUALITY", "decimal", "text"]]],
      ["2026-01-18", "Fight Simulation", [["ROUND 1 OUTPUT (SKIERG M / BIKE CAL)", "decimal", "text"], ["ROUND 6 OUTPUT (SKIERG M / BIKE CAL)", "decimal", "text"]]],
    ];
    for (const [d, n, b] of want) {
      await at(d, fighter());
      pick(n);
      expect([d, n, boxes()]).toEqual([d, n, b]);
      expect(card().querySelector("[data-out-id], [data-testid=erg-panel], [data-testid=recovery-hr], [data-testid=round-fade], [aria-pressed]")).toBe(null);
      cleanup();
      localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    }
    await at("2026-01-11", fighter());
    pick("Weekly Check");
    expect(box("LIGHTS-OUT TIME, AVERAGED (E.G. 21:30)").type).toBe("text");
    expect(box("LIGHTS-OUT TIME, AVERAGED (E.G. 21:30)").inputMode).toBe("decimal");
    expect(card().querySelector("[data-out-id]")).toBe(null);
  }, 60000);
});

describe("the guide", () => {
  it("asks for the two heart rates of the settle", () => {
    const g = guide;
    expect(g).toContain("- After every hard session: sit on the bike, eyes closed, one minute. Type your heart rate when you stop and again at the end of the minute: the drop is your recovery.");
    expect(g).not.toContain("Type your heart rate at the end of it.");
  });
});
