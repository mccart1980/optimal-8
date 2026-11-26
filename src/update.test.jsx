import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";
import { keepUpToDate, whileBusy, checkNow, CHECK_SAID, buildSay } from "./update.js";

/* KEEPING THE APP UP TO DATE: the app looks for a newer copy each time it
   comes onto the screen, and reloads into one once it has taken over,
   but never while a clock is running or a box is being typed in. A phone
   is stood in for here: its service worker, its page, its reload. */
function phone({ controlled = true } = {}) {
  const reg = { update: vi.fn(() => Promise.resolve()), installing: null, waiting: null };
  const sw = new EventTarget();
  sw.controller = controlled ? {} : null;
  sw.ready = Promise.resolve(reg);
  sw.getRegistration = () => Promise.resolve(reg);
  const doc = new EventTarget();
  doc.visibilityState = "visible";
  doc.activeElement = null;
  const reload = vi.fn();
  return { reg, sw, doc, reload, show: () => { doc.visibilityState = "visible"; doc.dispatchEvent(new Event("visibilitychange")); },
    hide: () => { doc.visibilityState = "hidden"; doc.dispatchEvent(new Event("visibilitychange")); },
    takeOver: () => sw.dispatchEvent(new Event("controllerchange")) };
}
const tick = () => new Promise((r) => setTimeout(r, 0));
let run = null;
afterEach(() => { if (run) run.stop(); run = null; whileBusy(null); cleanup(); vi.useRealTimers(); });

describe("looking for a newer copy", () => {
  it("as the app opens, and every time it comes back onto the screen", async () => {
    const p = phone();
    run = keepUpToDate(p);
    await tick();
    expect(p.reg.update).toHaveBeenCalledTimes(1);
    p.hide();
    expect(p.reg.update).toHaveBeenCalledTimes(1);
    p.show();
    expect(p.reg.update).toHaveBeenCalledTimes(2);
  });

  it("a newer copy that takes over: the app reloads into it", async () => {
    const p = phone();
    run = keepUpToDate(p);
    await tick();
    p.takeOver();
    expect(p.reload).toHaveBeenCalledTimes(1);
  });

  it("a phone opening the app for the first time isn't reloaded: what it has is the newest", async () => {
    const p = phone({ controlled: false });
    run = keepUpToDate(p);
    await tick();
    p.takeOver();
    expect(p.reload).not.toHaveBeenCalled();
    /* and a newer copy after that is moved onto, as on any other phone */
    p.takeOver();
    expect(p.reload).toHaveBeenCalledTimes(1);
  });

  it("never while a clock is running: it waits for the next time the app comes onto the screen", async () => {
    const p = phone();
    let clock = true;
    whileBusy(() => clock);
    run = keepUpToDate(p);
    await tick();
    p.takeOver();
    expect(p.reload).not.toHaveBeenCalled();
    p.hide(); p.show();
    expect(p.reload).not.toHaveBeenCalled();
    clock = false;
    p.hide(); p.show();
    expect(p.reload).toHaveBeenCalledTimes(1);
  });

  it("never while a box is being typed in", async () => {
    const p = phone();
    p.doc.activeElement = { tagName: "TEXTAREA" };
    run = keepUpToDate(p);
    await tick();
    p.takeOver();
    expect(p.reload).not.toHaveBeenCalled();
    p.doc.activeElement = null;
    p.hide(); p.show();
    expect(p.reload).toHaveBeenCalledTimes(1);
  });

  it("and every half hour while it's open", async () => {
    vi.useFakeTimers();
    const p = phone();
    run = keepUpToDate(p);
    await vi.advanceTimersByTimeAsync(0);
    expect(p.reg.update).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000);
    expect(p.reg.update).toHaveBeenCalledTimes(2);
  });

  it("with no service worker, as in a browser that hasn't one, it does nothing", () => {
    expect(keepUpToDate({ sw: null, doc: null })).toBeNull();
  });
});

describe("Settings: which copy this is, and a button to look now", () => {
  it("the button says what it found", async () => {
    const p = phone();
    expect(await checkNow({ sw: p.sw })).toBe("same");
    p.reg.installing = {};
    expect(await checkNow({ sw: p.sw })).toBe("new");
    p.reg.update = () => Promise.reject(new Error("offline"));
    expect(await checkNow({ sw: p.sw })).toBe("offline");
  });

  it("the version: the commit it was built from, and when it was published", () => {
    expect(buildSay({ sha: "f985a77", at: "2026-11-26T16:47:00Z" })).toMatch(/^Version f985a77 · published Thu,? 26 Nov,? \d\d:\d\d$/);
    expect(buildSay(null)).toBe("Not a published copy.");
    expect(buildSay({ sha: "" })).toBe("Not a published copy.");
  });

  it("on the screen: a card of its own in Settings", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2027, 1, 15, 7, 0, 0));
    localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
    const SPP = { booked: false, classic: false, spp: true, fitness: "moderate", rounds: 6, mins: 3, rest: 60, weighIn: "before", emphasis: "none" };
    localStorage.setItem("o8s-settings", JSON.stringify({ macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, v12: true,
      start: "2026-10-26", imStart: "2026-10-26", rangeStart: "2026-10-26", levelStart: "2026-10-26", program: "prep", plans: [{ from: "2027-02-15", made: "2027-02-14", inputs: SPP }], season: SPP }));
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
    fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name: "More" }));
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    const card = document.getElementById("set-app");
    expect(card.textContent).toMatch(/^This copy of the app/);
    /* the tests' own copy isn't a published one */
    expect(within(card).getByTestId("app-version").textContent).toBe("Not a published copy.");
    fireEvent.click(within(card).getByRole("button", { name: "CHECK FOR AN UPDATE NOW" }));
    await waitFor(() => expect(within(card).getByTestId("update-said").textContent).toBe(CHECK_SAID.none));
  });
});
