import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";
import { peakHeartRate, easyZone } from "./metrics.js";

/* THE EASY ZONE. One peak heart rate — the highest of the number typed
   into the panel and every 20-minute test on file — and the zone it sets
   on every easy session in PREP, CAMP, the week before camp and the
   transition. Never on a 20-minute test, never in the classic Fighter. */

/* Worked Example 1: the camp from Monday 12 October, the week before it
   from the 5th, the fight on Saturday 28 November, the head check
   answered NO so the transition starts on the 30th */
const plans = [{ from: "2026-10-12", made: "2026-10-08", inputs: { booked: true, fight: "2026-11-28", rounds: 3, mins: 2, rest: 60, weighIn: "before", fitness: "low", emphasis: "durability" } }];
const camp = (extra) => Object.assign({ start: "2026-09-28", macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30,
  imStart: "2026-09-28", levelStart: "2026-09-28", v12: true, program: "prep", plans, season: plans[0].inputs, fightDate: "2026-11-28",
  head: { "2026-11-28": { a: "no" } } }, extra || {});
/* PREP's sixteen-week form from Monday 5 January 2026 */
const prep = (extra) => Object.assign({ start: "2026-01-05", macroBase: 1, iron: false, sound: false, autoRest: true,
  medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: "2026-01-05", rangeStart: "2026-01-05",
  camp: false, lastTen: false, taper: false, levelStart: "2026-01-05", program: "prep", v12: true }, extra || {});
const fighter = (extra) => prep(Object.assign({ program: "fighter" }, extra || {}));

async function at(isoDay, st) {
  vi.setSystemTime(new Date(isoDay + "T06:00:00"));
  localStorage.setItem("o8s-settings", JSON.stringify(st));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
/* the whole day, every chapter open */
function wholeDay() {
  if (!screen.queryByTestId("whole-day")) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  for (let k = 0; k < 8; k++) { const b = document.querySelector("[data-chapter] [aria-expanded=false]"); if (!b) break; fireEvent.click(b); }
  return [...document.querySelectorAll("[data-flow-name]")];
}
/* make one row the NOW card */
function pick(name) {
  const row = wholeDay().find((e) => e.getAttribute("data-flow-name") === name);
  if (!row) throw new Error("no row " + name + " in " + wholeDay().map((e) => e.getAttribute("data-flow-name")).join(" | "));
  fireEvent.click(row.querySelectorAll("button")[1]);
  return screen.getByTestId("now-card");
}
const zoneOf = (card) => within(card).queryByTestId("easy-zone");
const rangeOf = (card) => { const r = within(card).queryByTestId("easy-zone-range"); return r ? r.textContent : null; };
const askedFor = (card) => { const z = zoneOf(card); return !!z && !!within(z).queryByLabelText("PEAK HEART RATE (BPM)")
  && z.textContent.includes("The highest number you've seen on the strap: in the rounds, an interval session or a test.")
  && !!within(z).queryByRole("button", { name: "SAVE" }); };
const log = () => JSON.parse(localStorage.getItem("o8s-log") || "{}");

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("the peak", () => {
  it("is the highest of the typed number and every 20-minute test, 120–230 only", () => {
    expect(peakHeartRate({}, null)).toBe(null);
    expect(peakHeartRate({ "mBw1-sun-c_bike20hr": { w: "180" } }, "175")).toBe(180);
    expect(peakHeartRate({ "mCw1-mon-c_bike20hr": { w: "170" }, "mPw3-thu-bike20hr": { w: "185" } }, "175")).toBe(185);
    expect(peakHeartRate({ "m1w1-sun-bike20hr": { w: "178" } }, null)).toBe(178);
    expect(peakHeartRate({ "mBw1-sun-c_bike20hr": { w: "110" }, "mCw1-mon-c_bike20hr": { w: "240" } }, "175")).toBe(175);
    expect(peakHeartRate({ "mBw1-sun-c_bike20hr": { w: "110" } }, "240")).toBe(null);
    expect(peakHeartRate({ "mCw1-mon-c_bike20": { w: "5200" } }, null)).toBe(null);
    expect(easyZone(175)).toEqual([114, 131]);
    expect(easyZone(180)).toEqual([117, 135]);
  });
});

describe("no peak yet", () => {
  it("camp week 1's Monday base, the Thursday easy session and the Sunday easy hour ask for it", async () => {
    for (const [d, n] of [["2026-10-12", "Easy, nose only"], ["2026-10-15", "The Thursday easy session"], ["2026-10-18", "The easy hour"]]) {
      await at(d, camp());
      const card = pick(n);
      expect(askedFor(card)).toBe(true);
      expect(rangeOf(card)).toBe(null);
      // the panel has no average heart rate box of its own
      expect(within(zoneOf(card)).queryByText(/average heart rate/i)).toBe(null);
      cleanup();
    }
  });
  it("a 20-minute test card shows no panel", async () => {
    await at("2026-10-11", camp());
    expect(zoneOf(pick("The 20-Minute Test"))).toBe(null);
    cleanup();
    await at("2026-04-23", prep());
    expect(zoneOf(pick("THE 20-MINUTE TEST"))).toBe(null);
  });
  it("no classic Fighter page shows a panel, with or without a peak", async () => {
    for (const st of [fighter(), fighter({ easyPeak: "175" })]) {
      for (const d of ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11"]) {
        await at(d, st);
        const names = wholeDay().map((e) => e.getAttribute("data-flow-name"));
        for (const n of names) { expect(zoneOf(pick(n))).toBe(null); }
        expect(screen.queryByTestId("easy-zone")).toBe(null);
        cleanup();
      }
    }
  }, 120000);
});

describe("typing 175 and SAVE", () => {
  it("sets the zone on every easy session at once: 114–131 BPM", async () => {
    await at("2026-10-12", camp());
    let card = pick("Easy, nose only");
    fireEvent.change(within(card).getByLabelText("PEAK HEART RATE (BPM)"), { target: { value: "175" } });
    fireEvent.click(within(card).getByRole("button", { name: "SAVE" }));
    card = screen.getByTestId("now-card");
    expect(rangeOf(card)).toBe("114–131 BPM · FROM A PEAK OF 175");
    expect(within(card).getByRole("button", { name: "CHANGE" })).toBeInTheDocument();
    expect(within(card).queryByLabelText("PEAK HEART RATE (BPM)")).toBe(null);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).easyPeak).toBe("175"));
    const saved = JSON.parse(localStorage.getItem("o8s-settings"));
    cleanup();
    const sessions = [
      ["2026-10-15", camp, "The Thursday easy session"],
      ["2026-10-18", camp, "The easy hour"],
      ["2026-11-23", camp, "Easy, nose only"],          // fight week's 20 easy minutes
      ["2026-12-05", camp, "Easy walk or ride"],        // the transition
      ["2026-12-06", camp, "Easy hour"],                // the transition's easy hour
      ["2026-01-12", prep, "Base — easy, nose only"],   // a PREP Monday base
      ["2026-02-10", prep, "EASY"],                     // the easy week's easy session
    ];
    for (const [d, f, n] of sessions) {
      await at(d, f({ easyPeak: saved.easyPeak }));
      expect([d, n, rangeOf(pick(n))]).toEqual([d, n, "114–131 BPM · FROM A PEAK OF 175"]);
      cleanup();
    }
  }, 60000);
  it("CHANGE opens the box again", async () => {
    await at("2026-10-12", camp({ easyPeak: "175" }));
    let card = pick("Easy, nose only");
    fireEvent.click(within(card).getByRole("button", { name: "CHANGE" }));
    expect(askedFor(card)).toBe(true);
    fireEvent.change(within(card).getByLabelText("PEAK HEART RATE (BPM)"), { target: { value: "180" } });
    fireEvent.click(within(card).getByRole("button", { name: "SAVE" }));
    expect(rangeOf(screen.getByTestId("now-card"))).toBe("117–135 BPM · FROM A PEAK OF 180");
  });
});

describe("a 20-minute test on file", () => {
  it("logged on the week before camp's Sunday: 180 sets 117–135 BPM, over a typed 175", async () => {
    await at("2026-10-11", camp({ easyPeak: "175" }));
    const card = pick("The 20-Minute Test");
    fireEvent.change(within(card).getByLabelText("PEAK HEART RATE (BPM)"), { target: { value: "180" } });
    await waitFor(() => expect(Object.keys(log()).some((k) => /^mB.*-sun-c_bike20hr$/.test(k))).toBe(true));
    cleanup();
    for (const [d, n] of [["2026-10-12", "Easy, nose only"], ["2026-10-15", "The Thursday easy session"], ["2026-10-18", "The easy hour"]]) {
      await at(d, camp({ easyPeak: "175" }));
      expect(rangeOf(pick(n))).toBe("117–135 BPM · FROM A PEAK OF 180");
      cleanup();
    }
  });
  it("logged on a camp Monday: the highest wins", async () => {
    localStorage.setItem("o8s-log", JSON.stringify({ "mCw1-mon-c_bike20hr": { w: "180" }, "mBw1-sun-c_bike20hr": { w: "172" } }));
    await at("2026-10-18", camp({ easyPeak: "175" }));
    expect(rangeOf(pick("The easy hour"))).toBe("117–135 BPM · FROM A PEAK OF 180");
  });
  it("110 and 240 are ignored", async () => {
    localStorage.setItem("o8s-log", JSON.stringify({ "mCw1-mon-c_bike20hr": { w: "240" }, "mBw1-sun-c_bike20hr": { w: "110" } }));
    await at("2026-10-12", camp({ easyPeak: "175" }));
    expect(rangeOf(pick("Easy, nose only"))).toBe("114–131 BPM · FROM A PEAK OF 175");
    cleanup();
    localStorage.setItem("o8s-log", JSON.stringify({ "mCw1-mon-c_bike20hr": { w: "240" }, "mBw1-sun-c_bike20hr": { w: "110" } }));
    await at("2026-10-12", camp());
    expect(askedFor(pick("Easy, nose only"))).toBe(true);
  });
});

describe("the timer", () => {
  it("an easy timer's label carries the range", async () => {
    await at("2026-10-12", camp({ easyPeak: "175" }));
    fireEvent.click(within(pick("Easy, nose only")).getByRole("button", { name: "▶ START" }));
    expect(screen.getByTestId("timer-part").textContent).toBe("EASY — NOSE ONLY · 114–131 BPM");
    cleanup();
    await at("2026-10-15", camp({ easyPeak: "175" }));
    fireEvent.click(within(pick("The Thursday easy session")).getByRole("button", { name: /▶ START/ }));
    expect(screen.getByTestId("timer-part").textContent).toBe("EASY — NOSE ONLY · 114–131 BPM");
    cleanup();
    await at("2026-01-12", prep({ easyPeak: "175" }));
    fireEvent.click(within(pick("Base — easy, nose only")).getByRole("button", { name: "▶ START" }));
    expect(screen.getByTestId("timer-part").textContent).toBe("EASY — NOSE ONLY · 114–131 BPM");
  });
  it("the 20-minute test's doesn't", async () => {
    await at("2026-10-11", camp({ easyPeak: "175" }));
    fireEvent.click(within(pick("The 20-Minute Test")).getByRole("button", { name: "▶ START" }));
    expect(screen.getByTestId("timer-part").textContent).toBe("20-MIN TEST — MAXIMUM DISTANCE");
  });
  it("nor the classic Fighter's", async () => {
    await at("2026-01-11", fighter({ easyPeak: "175" }));
    fireEvent.click(within(pick("20-Minute Bike Test")).getByRole("button", { name: "▶ START" }));
    expect(screen.getByTestId("timer-part").textContent).toBe("20-MIN TEST");
  });
});
