import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* THE CIRCUITS. Monday's dips and ring rows, the arms circuit and THE
   BRACE each run a guided timer that calls every exercise by name. */

/* PREP's sixteen-week form from Monday 5 January 2026 */
const prep = (extra) => Object.assign({ start: "2026-01-05", macroBase: 1, iron: false, sound: false, autoRest: true,
  medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: "2026-01-05", rangeStart: "2026-01-05",
  camp: false, lastTen: false, taper: false, levelStart: "2026-01-05", program: "prep", v12: true }, extra || {});

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
const start = (card) => fireEvent.click(within(card).getByRole("button", { name: /▶ START/ }));
const part = () => screen.getByTestId("timer-part").textContent;

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("the circuit timer, PREP week 2", () => {
  it("Monday's dips and ring rows start with the weighted dips", async () => {
    await at("2026-01-12", prep());
    start(pick("Dips + Ring Rows"));
    expect(part()).toBe("RD 1 · WEIGHTED DIPS × 6–8");
  });
  it("the arms circuit starts with the incline curls", async () => {
    await at("2026-01-12", prep());
    start(pick("The Arms Circuit"));
    expect(part()).toBe("RD 1 · INCLINE CURLS × 10–12");
  });
  it("THE BRACE starts with the ab wheel", async () => {
    await at("2026-01-13", prep());
    start(pick("THE BRACE"));
    expect(part()).toBe("RD 1 · AB WHEEL × 8–12");
  });
});
