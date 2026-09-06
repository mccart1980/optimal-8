import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import App from "./App.jsx";

// Monday of the week we are in right now — makes "today" fall inside week 1.
function mondayOfThisWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

describe("Optimal 8", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem(
      "o8s-settings",
      JSON.stringify({ start: mondayOfThisWeek(), macroBase: 1, iron: false, sound: false, autoRest: true })
    );
  });

  it("mounts and renders week 1 Monday's session", async () => {
    render(<App />);

    // finishes loading out of the localStorage-backed storage shim
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());

    // the header knows where we are in the cycle (the chip is built from several text nodes)
    const chips = await screen.findAllByText((_t, el) => el && el.tagName === "SPAN" && el.textContent.trim() === "M1 · WK 1 · BUILD");
    expect(chips.length).toBeGreaterThan(0);

    // jump to Monday whatever day the test runs on
    fireEvent.click(screen.getByRole("button", { name: "MON" }));

    expect(await screen.findByText("MONDAY")).toBeInTheDocument();
    expect(screen.getByText("Upper Strength + Power Dose")).toBeInTheDocument();
    expect(screen.getByText("Flat Bench")).toBeInTheDocument();
    expect(screen.getByText("Weighted Chin-Up")).toBeInTheDocument();
    // week 1's bench prescription, so this really is week 1 and not just any Monday
    expect(screen.getByText("4 × 6 @ 75%")).toBeInTheDocument();
  });

  it("defaults to a 16-week cycle with the Iron Mind weeks off", async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
    expect(await screen.findByText("16")).toBeInTheDocument();
    expect(screen.queryByText("17")).not.toBeInTheDocument();
    expect(screen.queryByText("18")).not.toBeInTheDocument();
  });

  it("keeps data in localStorage under the o8s- keys", async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());

    fireEvent.click(await screen.findByText("GREEN"));
    await waitFor(() => expect(localStorage.getItem("o8s-ready")).toBeTruthy());
  });
});
