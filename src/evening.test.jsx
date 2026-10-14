import React from "react";
import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* THURSDAY. In PREP and CAMP the easy session and the sauna sit on
   Thursday evening: the run first, the sauna straight after it, then the
   rest of the evening. Sunday's easy hour comes before its sauna too. The
   classic Fighter is untouched. */

/* Worked Example 1: the camp from Monday 12 October, the Edge on */
const plans = [{ from: "2026-10-12", made: "2026-10-08", inputs: { booked: true, fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" } }];
const camp = (extra) => Object.assign({ start: "2026-09-28", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
  imStart: "2026-09-28", levelStart: "2026-09-28", v12: true, program: "prep", plans, season: plans[0].inputs, fightDate: "2026-11-28" }, extra || {});
/* PREP's sixteen-week form from Monday 5 January 2026 */
const prep = (extra) => Object.assign({ start: "2026-01-05", macroBase: 1, iron: false, sound: false, autoRest: true,
  medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: "2026-01-05", rangeStart: "2026-01-05",
  camp: false, lastTen: false, taper: false, levelStart: "2026-01-05", program: "prep", v12: true }, extra || {});
const fighter = () => prep({ program: "fighter" });

async function at(y, m, d, st) {
  vi.setSystemTime(new Date(y, m - 1, d, 6, 0, 0));
  localStorage.setItem("o8s-settings", JSON.stringify(st));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
/* the evening's rows, in order, feeds aside */
const FEED = /kcal/;
function evening() {
  fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  const ch = screen.getByText("EVENING").closest("[data-chapter]");
  const closed = ch.querySelector("[aria-expanded=false]");
  if (closed) fireEvent.click(closed);
  return [...ch.querySelectorAll("[data-flow-name]")].filter((e) => !FEED.test(e.textContent)).map((e) => e.getAttribute("data-flow-name"));
}
const EASY = /^The (easy thirty|Thursday easy session)$/;
const BEFORE = "500 ml before the sauna", AFTER = "500 ml after the sauna, with a second sachet";
const easyOf = (rows) => rows.filter((n) => EASY.test(n));
function water() {
  fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByText("FOOD"));
  fireEvent.click(screen.getByRole("button", { name: "WATER" }));
  return Number(screen.getByTestId("water-total").textContent.match(/\/ ([\d.]+) L/)[1]);
}

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("CAMP — Worked Example 1, week 2, the Edge on", () => {
  it("Thursday 22 October: the easy session (40 min), the sauna's water, the sauna, its water, then RANGE", async () => {
    await at(2026, 10, 22, camp());
    const rows = evening();
    expect(rows.slice(0, 5)).toEqual(["The Thursday easy session", BEFORE, "Sauna", AFTER, "RANGE"]);
    expect(screen.getByText("40 min · nose only · engine-first")).toBeInTheDocument();
  });
  it("Wednesday 21 October: no easy session and no sauna", async () => {
    await at(2026, 10, 21, camp());
    const rows = evening();
    expect(easyOf(rows)).toEqual([]);
    expect(rows.some((n) => /sauna/i.test(n))).toBe(false);
  });
  it("Sunday 25 October: the easy hour before the sauna", async () => {
    await at(2026, 10, 25, camp());
    const rows = evening();
    expect(rows.slice(0, 4)).toEqual(["The easy hour", BEFORE, "Sauna", AFTER]);
  });
  it("two yellow mornings by Thursday: no easy session, the sauna still on", async () => {
    localStorage.setItem("o8s-ready", JSON.stringify({ "mCw2-mon": "Y", "mCw2-tue": "Y" }));
    await at(2026, 10, 22, camp());
    const rows = evening();
    expect(easyOf(rows)).toEqual([]);
    expect(rows.slice(0, 4)).toEqual([BEFORE, "Sauna", AFTER, "RANGE"]);
  });
  it("fight week's Thursday has no easy session", async () => {
    await at(2026, 11, 26, camp());
    expect(easyOf(evening())).toEqual([]);
  });
  it("the FOOD tab's water target carries the sauna's 500 ml on Thursday, not Wednesday", async () => {
    await at(2026, 10, 21, camp());
    const wed = water();
    cleanup();
    await at(2026, 10, 22, camp());
    const thu = water();
    cleanup();
    await at(2026, 10, 20, camp());
    const tue = water();
    expect(wed).toBe(tue);
    expect(thu).toBeCloseTo(wed + 0.5, 5);
  });
});

describe("PREP", () => {
  it("a sauna week: Thursday the easy thirty, then the sauna; Wednesday neither", async () => {
    await at(2026, 2, 19, prep());   // P6's Thursday
    expect(evening().slice(0, 5)).toEqual(["The easy thirty", BEFORE, "Sauna", AFTER, "RANGE"]);
    cleanup();
    await at(2026, 2, 18, prep());   // P6's Wednesday
    const rows = evening();
    expect(easyOf(rows)).toEqual([]);
    expect(rows.some((n) => /sauna/i.test(n))).toBe(false);
  });
  it("weeks 1–5: the movement session stays on Wednesday evening", async () => {
    for (const d of [7, 14, 21, 28]) {
      await at(2026, 1, d, prep());
      expect(evening()).toContain("The movement session");
      cleanup();
    }
    await at(2026, 2, 4, prep());
    expect(evening()).toContain("The movement session");
  });
});

describe("the classic Fighter is untouched", () => {
  it("no easy thirty on any weekday evening, and its own weekend sauna's water still opens the evening", async () => {
    for (const d of [5, 6, 7, 8, 9]) {
      await at(2026, 1, d, fighter());
      expect(easyOf(evening())).toEqual([]);
      cleanup();
    }
    localStorage.setItem("o8s-fday", JSON.stringify({ "2026-01-10": { sauna: true } }));
    await at(2026, 1, 10, fighter());
    const rows = evening();
    expect(rows.slice(0, 3)).toEqual([BEFORE, AFTER, "The easy hour"]);
  });
});

describe("the words", () => {
  const root = path.resolve(__dirname, "..");
  const OLD = /Wednesday thirty|Wednesday easy|one weekday evening/i;
  it("no .md file says Wednesday thirty, Wednesday easy or one weekday evening", () => {
    const bad = fs.readdirSync(root).filter((f) => f.endsWith(".md")).filter((f) => OLD.test(fs.readFileSync(path.join(root, f), "utf8")));
    expect(bad).toEqual([]);
  });
  it("nor does anything the app shows", () => {
    const src = path.join(root, "src");
    const bad = fs.readdirSync(src).filter((f) => /\.(js|jsx)$/.test(f) && !/\.test\./.test(f)).filter((f) => OLD.test(fs.readFileSync(path.join(src, f), "utf8")));
    expect(bad).toEqual([]);
  });
});
