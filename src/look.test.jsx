import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* ================================================================
   THE LOOK, THE SOUND AND THE SET-UP — what brief 27 added:
   the welcome on a phone with nothing saved, light and dark, the
   timers' sound on a silent phone, and the jumps down the settings.
   ================================================================ */
const MON = new Date(2026, 10, 23, 6, 0, 0);                 // Monday 23 November 2026
const saved = () => JSON.parse(localStorage.getItem("o8s-settings") || "{}");
const maxes = () => JSON.parse(localStorage.getItem("o8s-maxes") || "{}");
const up = async () => { render(<App />); await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument()); };
const title = () => screen.getByTestId("app-title").textContent;
const theme = () => document.documentElement.getAttribute("data-theme");
const tabs = () => within(screen.getByRole("navigation", { name: "Tabs" }));
const openSettings = () => { fireEvent.click(tabs().getByRole("button", { name: "MORE" })); fireEvent.click(screen.getByRole("button", { name: "SETTINGS" })); };
/* a phone that has been used: Strength, Power and Physique from 2 November */
const used = (extra) => localStorage.setItem("o8s-settings", JSON.stringify(Object.assign({ start: "2026-11-02", macroBase: 1, sound: false, autoRest: true, v12: true, v16: true,
  season: { booked: false, classic: false, spp: true }, plans: [{ from: "2026-11-02", made: "2026-10-29", inputs: { booked: false, classic: false, spp: true } }] }, extra || {})));

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(MON); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); document.documentElement.removeAttribute("data-theme"); });
afterEach(() => { cleanup(); vi.useRealTimers(); document.documentElement.removeAttribute("data-theme"); });

describe("the welcome: a phone with nothing saved", () => {
  const welcome = () => within(screen.getByTestId("welcome"));
  const step = () => screen.getByTestId("welcome-dots").getAttribute("aria-label");
  const runs = () => [...screen.getByTestId("welcome").querySelectorAll("[data-run]")].map((b) => [b.getAttribute("data-run"), b.getAttribute("aria-pressed")]);

  it("four steps — what it is, what to run, the working maxes, how it looks and sounds — then TODAY", async () => {
    await up();
    expect(step()).toBe("Step 1 of 4");
    expect(welcome().getByText("FIGHTER")).toBeInTheDocument();
    fireEvent.click(welcome().getByRole("button", { name: "GET STARTED" }));

    expect(step()).toBe("Step 2 of 4");
    expect(welcome().getByText("What do you want to run?")).toBeInTheDocument();
    /* Optimal 8 Fighter was retired on 23 November 2026: two to choose from */
    expect(runs()).toEqual([["spp", "true"], ["prep", "false"]]);
    fireEvent.click(welcome().getByRole("button", { name: "CONTINUE" }));

    expect(step()).toBe("Step 3 of 4");
    fireEvent.change(welcome().getByLabelText("Back squat (kg)"), { target: { value: "140" } });
    fireEvent.change(welcome().getByLabelText("Bench press (kg)"), { target: { value: "100,5" } });
    fireEvent.click(welcome().getByRole("button", { name: "CONTINUE" }));

    expect(step()).toBe("Step 4 of 4");
    expect(welcome().getByText("Make it yours")).toBeInTheDocument();
    fireEvent.click(welcome().getByRole("button", { name: "DARK" }));
    expect(theme()).toBe("dark");
    fireEvent.click(welcome().getByRole("button", { name: "OFF" }));
    fireEvent.click(welcome().getByRole("button", { name: "OPEN TODAY" }));

    expect(screen.queryByTestId("welcome")).not.toBeInTheDocument();
    expect(title()).toMatch(/^Strength & Power · Week 1/);
    await waitFor(() => expect(saved().welcome).toBe(false));
    expect([saved().theme, saved().sound]).toEqual(["dark", false]);
    expect(saved().season).toMatchObject({ booked: false, classic: false, spp: true });
    expect(saved().plans.map((p) => p.from)).toEqual(["2026-11-23"]);
    await waitFor(() => expect(maxes()).toMatchObject({ squat: 140, bench: 100.5 }));
    expect(maxes().tbdl).toBeUndefined();
  });

  it("the other programme starts the same way, from this Monday", async () => {
    for (const [key, want] of [["prep", /^Prep · Week 1/]]) {
      localStorage.clear(); localStorage.setItem("o8s-migrated", "true");
      await up();
      fireEvent.click(within(screen.getByTestId("welcome")).getByRole("button", { name: "GET STARTED" }));
      fireEvent.click(screen.getByTestId("welcome").querySelector("[data-run=" + key + "]"));
      expect(runs().filter((r) => r[1] === "true").map((r) => r[0])).toEqual([key]);
      fireEvent.click(welcome().getByRole("button", { name: "CONTINUE" }));
      fireEvent.click(welcome().getByRole("button", { name: "CONTINUE" }));
      fireEvent.click(welcome().getByRole("button", { name: "OPEN TODAY" }));
      expect(title()).toMatch(want);
      await waitFor(() => expect(saved().welcome).toBe(false));
      expect([!!saved().season.classic, !!saved().season.spp, saved().season.booked]).toEqual([false, false, false]);
      expect(saved().plans.length).toBe(1);
      expect(maxes()).toEqual({});
      cleanup();
    }
  });

  it("the step before is one tap back, and it comes back until it has been finished", async () => {
    await up();
    fireEvent.click(welcome().getByRole("button", { name: "GET STARTED" }));
    fireEvent.click(welcome().getByRole("button", { name: "Back a step" }));
    expect(step()).toBe("Step 1 of 4");
    expect(welcome().queryByRole("button", { name: "Back a step" })).not.toBeInTheDocument();
    await waitFor(() => expect(saved().welcome).toBe(true));
    /* closed half-way and opened again */
    cleanup();
    await up();
    expect(step()).toBe("Step 1 of 4");
  });

  it("I HAVE A BACKUP: a file that isn't one says so; a real one puts everything back and opens TODAY", async () => {
    await up();
    const file = (text) => new File([text], "fighter-backup-2026-11-22.json", { type: "application/json" });
    const pick = (text) => fireEvent.change(screen.getByTestId("welcome-file"), { target: { files: [file(text)] } });
    expect(welcome().getByRole("button", { name: "I HAVE A BACKUP" })).toBeInTheDocument();
    pick("[1, 2, 3]");
    expect(await screen.findByText("That file isn't a Fighter backup.")).toBeInTheDocument();
    expect(screen.getByTestId("welcome")).toBeInTheDocument();
    pick(JSON.stringify({ st: { start: "2026-11-02", v12: true, v16: true, theme: "light", season: { booked: false, classic: false, spp: true },
      plans: [{ from: "2026-11-02", made: "2026-10-29", inputs: { booked: false, classic: false, spp: true } }] }, maxes: { squat: 150, bench: 105 } }));
    await waitFor(() => expect(screen.queryByTestId("welcome")).not.toBeInTheDocument());
    expect(title()).toMatch(/^Strength & Power · Week 4/);
    expect(theme()).toBe("light");
    await waitFor(() => expect(maxes()).toEqual({ squat: 150, bench: 105 }));
    expect(saved().welcome).toBeFalsy();
  });

  it("a phone that has been used never sees it", async () => {
    used();
    await up();
    expect(screen.queryByTestId("welcome")).not.toBeInTheDocument();
    expect(title()).toMatch(/^Strength & Power · Week 4/);
    expect(saved().welcome).toBeFalsy();
  });
});

describe("light or dark", () => {
  const pick = (name) => fireEvent.click(within(screen.getByTestId("theme-pick")).getByRole("button", { name }));
  let meta;
  beforeEach(() => { meta = document.createElement("meta"); meta.setAttribute("name", "theme-color"); meta.setAttribute("content", "#F1F4F9"); document.head.appendChild(meta); });
  afterEach(() => { meta.remove(); });

  it("AUTO to begin with: the app follows the phone, and nothing is held on the page", async () => {
    used();
    await up();
    expect(theme()).toBe(null);
    openSettings();
    expect(within(screen.getByTestId("theme-pick")).getAllByRole("button").map((b) => b.textContent)).toEqual(["AUTO", "LIGHT", "DARK"]);
  });

  it("DARK and LIGHT hold one, on the page and in the phone's bar; AUTO lets go again", async () => {
    used();
    await up();
    openSettings();
    pick("DARK");
    expect(theme()).toBe("dark");
    expect(meta.getAttribute("content")).toBe("#0A0D12");
    await waitFor(() => expect(saved().theme).toBe("dark"));
    pick("LIGHT");
    expect(theme()).toBe("light");
    expect(meta.getAttribute("content")).toBe("#F1F4F9");
    pick("AUTO");
    expect(theme()).toBe(null);
    await waitFor(() => expect(saved().theme).toBe("auto"));
  });

  it("the theme a phone was left on is the one it opens in", async () => {
    used({ theme: "dark" });
    await up();
    expect(theme()).toBe("dark");
    expect(meta.getAttribute("content")).toBe("#0A0D12");
  });
});

describe("the sound, in one place in the settings", () => {
  it("the bells' own switch, then what they do when the phone is on silent, then a bell to try", async () => {
    used();
    const session = { type: "auto" };
    Object.defineProperty(navigator, "audioSession", { value: session, configurable: true });
    try {
      await up();
      expect(session.type).toBe("ambient");
      openSettings();
      const mode = () => within(screen.getByTestId("sound-mode"));
      expect(mode().getAllByRole("button").map((b) => b.textContent)).toEqual(["STAY SILENT", "PLAY ANYWAY"]);
      fireEvent.click(mode().getByRole("button", { name: "PLAY ANYWAY" }));
      expect(session.type).toBe("playback");
      await waitFor(() => expect(saved().soundMode).toBe("loud"));
      fireEvent.click(mode().getByRole("button", { name: "STAY SILENT" }));
      expect(session.type).toBe("ambient");
      /* the switch for the bells themselves sits with it */
      fireEvent.click(screen.getByText("Bell sounds and the feed chime"));
      await waitFor(() => expect(saved().sound).toBe(true));
      fireEvent.click(screen.getByRole("button", { name: "▶ TEST THE BELL" }));
    } finally { delete navigator.audioSession; }
  });
});

describe("the settings page", () => {
  it("a row of jumps at the top, and a line for each to land on", async () => {
    used();
    await up();
    openSettings();
    const jumps = within(screen.getByTestId("settings-jumps")).getAllByRole("button");
    expect(jumps.map((b) => b.textContent)).toEqual(["THE DAY", "LOOK", "SOUND", "REST CLOCK", "RANGE AND MOVE", "CALISTHENICS", "BACKUP"]);
    ["day", "look", "sound", "cycle", "range", "calis", "backup"].forEach((k) => expect([k, !!document.getElementById("set-" + k)]).toEqual([k, true]));
    /* a jump is safe to press where the page can't scroll */
    jumps.forEach((b) => fireEvent.click(b));
    expect(screen.getByTestId("settings-jumps")).toBeInTheDocument();
  });
});

describe("the pages of PROGRESS", () => {
  it("one row of pages, the open one marked", async () => {
    used();
    await up();
    fireEvent.click(tabs().getByRole("button", { name: "PROGRESS" }));
    const row = screen.getByTestId("track-pages");
    const on = () => [...row.querySelectorAll("button")].filter((b) => b.getAttribute("data-on")).map((b) => b.textContent);
    expect(on()).toEqual(["DASH"]);
    fireEvent.click(within(row).getByRole("button", { name: "NUMBERS" }));
    expect(on()).toEqual(["NUMBERS"]);
  });
});

/* THE LAST TEN SECONDS — marked on the timer, so they show with the sound
   off: to the end of a round on a timer of rounds, to the end of a rest,
   and never earlier. The clock is moved by hand; the timer reads it. */
describe("the timer's last ten seconds", () => {
  const wholeDay = () => { if (!screen.queryByTestId("whole-day")) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    for (let k = 0; k < 8; k++) { const b = document.querySelector("[data-chapter] [aria-expanded=false]"); if (!b) break; fireEvent.click(b); } };
  const pick = (name) => { wholeDay(); const row = [...document.querySelectorAll("[data-flow-name]")].find((e) => e.getAttribute("data-flow-name") === name);
    if (!row) throw new Error("no row " + name); fireEvent.click(row.querySelectorAll("button")[1]); return screen.getByTestId("now-card"); };
  const skip = (n) => { for (let k = 0; k < (n || 1); k++) fireEvent.click(screen.getAllByRole("button", { name: "SKIP" }).pop()); };
  const later = (s) => vi.setSystemTime(new Date(Date.now() + s * 1000));
  const part = () => [screen.getByTestId("timer-part").textContent, screen.getByTestId("timer-count").textContent];

  it("the pressure rounds: not with 2:40 of the round to go; at ten seconds from its end; and at ten seconds from the end of the minute's rest", async () => {
    vi.setSystemTime(new Date(2026, 10, 17, 6, 0, 0));     // Tuesday of week 3
    used();
    await up();
    fireEvent.click(within(pick("Pressure Rounds")).getAllByRole("button", { name: /START/ })[0]);
    expect(part()).toEqual(["EASY — 1 MINUTE", "1:00"]);
    skip(2);
    expect(part()).toEqual(["ROUND 1 OF 3 · STEADY — NEVER STOP", "0:15"]);
    later(5);
    await waitFor(() => expect(screen.getByTestId("timer-count").textContent).toBe("0:10"));
    expect(screen.queryByTestId("timer-ten")).not.toBeInTheDocument();
    skip(16);
    expect(part()).toEqual(["ROUND 1 OF 3 · STEADY — NEVER STOP", "0:15"]);
    expect(screen.queryByTestId("timer-ten")).not.toBeInTheDocument();
    later(5);
    await waitFor(() => expect(screen.getByTestId("timer-ten").textContent).toBe("LAST 10 SECONDS"));
    expect(screen.getByTestId("timer-count").textContent).toBe("0:10");
    skip();
    expect(part()).toEqual(["REST — 1 MINUTE", "1:00"]);
    expect(screen.queryByTestId("timer-ten")).not.toBeInTheDocument();
    later(50);
    await waitFor(() => expect(screen.getByTestId("timer-ten")).toBeInTheDocument());
    /* minimised, the strip marks them too */
    fireEvent.click(screen.getByRole("button", { name: "MINIMISE" }));
    expect(screen.getByTestId("dock-ten").textContent).toBe("LAST 10");
  });

  it("the sound test says when the bells are off", async () => {
    used({ sound: false });
    await up();
    openSettings();
    expect(screen.getByText("The bells are OFF, so the timers make no sound. Switch Bell sounds on, above.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Bell sounds and the feed chime"));
    expect(screen.getByText(/^Plays every sound a timer makes, in order/)).toBeInTheDocument();
  });
});
