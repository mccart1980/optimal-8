import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import App from "./App.jsx";
import { weeksIn, weeksApart, addWeeks, mondayOf, parseISO, iso } from "./ui.jsx";
import { campWeekOf } from "./camp.js";

/* ================================================================
   WEEKS, COUNTED ACROSS A CLOCK CHANGE.

   A week's Monday is a midnight by the phone's own clock. When the
   clocks go forward or back between two Mondays, the gap between them
   is an hour short or an hour long of a whole number of weeks. Cutting
   that down to a whole number loses a week all summer; adding weeks as
   a count of hours lands on the evening before. So gaps are rounded,
   and weeks are added by the calendar.

   The dates below cross both of a year's clock changes. On a machine
   that keeps one clock all year they pass either way; on one that
   changes its clocks (a phone in Britain) they only pass with the rule.
   ================================================================ */
const HOUR = 3600000, WEEK = 604800000;

describe("how many weeks", () => {
  it("an hour short or an hour long is still that many weeks", () => {
    expect(weeksIn(0)).toBe(0);
    expect(weeksIn(WEEK)).toBe(1);
    expect(weeksIn(32 * WEEK - HOUR)).toBe(32);
    expect(weeksIn(16 * WEEK + HOUR)).toBe(16);
    expect(weeksIn(-(48 * WEEK) + HOUR)).toBe(-48);
  });
  it("from one date's Monday to another's, any day of either week", () => {
    expect(weeksApart(parseISO("2026-01-05"), parseISO("2026-01-05"))).toBe(0);
    expect(weeksApart(parseISO("2026-01-05"), parseISO("2026-01-11"))).toBe(0);
    expect(weeksApart(parseISO("2026-01-05"), parseISO("2026-01-12"))).toBe(1);
    expect(weeksApart(parseISO("2026-01-07"), parseISO("2026-01-18"))).toBe(1);
    expect(weeksApart(parseISO("2026-01-12"), parseISO("2026-01-05"))).toBe(-1);
  });
  it("across the spring change and the autumn one", () => {
    expect(weeksApart(parseISO("2026-01-05"), parseISO("2026-08-17"))).toBe(32);
    expect(weeksApart(parseISO("2026-01-05"), parseISO("2026-08-23"))).toBe(32);
    expect(weeksApart(parseISO("2026-08-17"), parseISO("2026-12-07"))).toBe(16);
    expect(weeksApart(parseISO("2026-03-23"), parseISO("2026-03-30"))).toBe(1);
    expect(weeksApart(parseISO("2026-10-19"), parseISO("2026-10-26"))).toBe(1);
    expect(campWeekOf("2026-01-05", parseISO("2026-08-17"))).toBe(33);
    expect(campWeekOf("2026-08-17", parseISO("2026-12-07"))).toBe(17);
  });
  it("weeks added by the calendar land on the same weekday, at midnight", () => {
    expect(iso(addWeeks(parseISO("2026-01-05"), 32))).toBe("2026-08-17");
    expect(iso(addWeeks(parseISO("2026-08-17"), 16))).toBe("2026-12-07");
    expect(iso(addWeeks(parseISO("2026-12-07"), -16))).toBe("2026-08-17");
    expect(iso(addWeeks(mondayOf(parseISO("2026-08-20")), -32))).toBe("2026-01-05");
    const d = addWeeks(parseISO("2026-08-17"), 16);
    expect([d.getDay(), d.getHours(), d.getMinutes()]).toEqual([1, 0, 0]);
    /* the date it was given is left alone */
    const from = parseISO("2026-01-05"); addWeeks(from, 5);
    expect(iso(from)).toBe("2026-01-05");
  });
});

describe("Optimal 8 Fighter's week, on the screen", () => {
  /* the classic from Monday 5 January 2026, sixteen weeks a cycle: the
     third cycle's week 1 is Monday 17 August, the fourth's Monday 7 December */
  const classic = { start: "2026-01-05", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
    imStart: "2026-01-05", rangeStart: "2026-01-05", camp: false, lastTen: false, taper: false, levelStart: "2026-01-05", program: "fighter", v12: true };
  const title = () => screen.getByTestId("app-title").textContent;
  async function on(y, m, d) {
    cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    vi.setSystemTime(new Date(y, m - 1, d, 6, 0, 0));
    localStorage.setItem("o8s-settings", JSON.stringify(classic));
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
    return title();
  }
  beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("week 1 of a cycle starts on its Monday in summer as it does in winter", async () => {
    expect(await on(2026, 1, 5)).toMatch(/^Fighter · Week 1 · /);
    expect(await on(2026, 8, 16)).toMatch(/^Fighter · Week 16 · /);
    expect(await on(2026, 8, 17)).toMatch(/^Fighter · Week 1 · /);
    expect(await on(2026, 8, 23)).toMatch(/^Fighter · Week 1 · /);
    expect(await on(2026, 8, 24)).toMatch(/^Fighter · Week 2 · /);
    expect(await on(2026, 12, 6)).toMatch(/^Fighter · Week 16 · /);
    expect(await on(2026, 12, 7)).toMatch(/^Fighter · Week 1 · /);
  });
});
