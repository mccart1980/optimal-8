import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import App from "./App.jsx";

/* A fixed Wednesday, so "today" is deterministic: the Iron Mind day, the
   sit's length and which of the five tests is this week's all move with it. */
const WED = new Date(2026, 8, 9, 9, 0, 0);      // Wed 9 Sep 2026
const MONDAY_OF_WED = "2026-09-07";

function settings(extra) {
  return JSON.stringify(Object.assign(
    { start: MONDAY_OF_WED, macroBase: 1, iron: false, sound: false, autoRest: true,
      medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: MONDAY_OF_WED,
      camp: false, lastTen: false, taper: false, levelStart: MONDAY_OF_WED },
    extra || {}));
}

async function mount(extra) {
  localStorage.setItem("o8s-settings", settings(extra));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}

describe("Optimal 8", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(WED);
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem("o8s-settings", settings());
  });
  afterEach(() => vi.useRealTimers());

  it("mounts and renders week 1 Monday's session", async () => {
    await mount();

    // the header knows where we are in the cycle (the chip is built from several text nodes)
    const chips = await screen.findAllByText((_t, el) => el && el.tagName === "SPAN" && el.textContent.trim() === "M1 · WK 1 · BUILD");
    expect(chips.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "MON" }));

    expect(await screen.findByText("MONDAY")).toBeInTheDocument();
    expect(screen.getByText("Upper Strength + Power Dose")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Weighted Chin-Up")).toBeInTheDocument();
    // week 1's bench prescription, so this really is week 1 and not just any Monday
    expect(screen.getByText("4 × 6 @ 75%")).toBeInTheDocument();
  });

  it("puts week 1 Thursday's split squat and Spanish squat hold before the bike", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "THU" }));

    expect(await screen.findByText("THURSDAY")).toBeInTheDocument();
    const split = screen.getByText("Split Squat — rear foot elevated");
    const span = screen.getByText("Spanish Squat Hold");
    // week 1's second engine session is the 40-second repeats
    const bike = screen.getByText(/40-SECOND REPEATS/);
    // DOCUMENT_POSITION_FOLLOWING === 4
    expect(split.compareDocumentPosition(span) & 4).toBeTruthy();
    expect(span.compareDocumentPosition(bike) & 4).toBeTruthy();
    // and the settle closes the bike out
    expect(screen.getByText("The 60-Second Settle")).toBeInTheDocument();
  });

  it("renders Friday as a sleep day with only the evening stretch", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "FRI" }));

    expect(await screen.findByText("SLEEP")).toBeInTheDocument();
    expect(screen.getByText("No session today")).toBeInTheDocument();
    expect(screen.getByText(/not get up at half three/)).toBeInTheDocument();
    expect(screen.getByText("TONIGHT: THE FULL STRETCH · 20 MIN")).toBeInTheDocument();
    // the ride is gone: no bike block, and nothing to tick off
    expect(screen.queryByText("Easy bike")).not.toBeInTheDocument();
    expect(screen.queryByText("▶ START SESSION")).not.toBeInTheDocument();
  });

  it("shows a 12-minute sit on TODAY at meditation stage 1", async () => {
    await mount();

    expect(await screen.findByText("★ THE SIT — 12 minutes")).toBeInTheDocument();
    expect(screen.getByText("12 MIN · COUNT THE EXHALES · ONE TO TEN")).toBeInTheDocument();
    // the day is woven in order around the session
    const waking = screen.getByText("ON WAKING");
    const session = screen.getByText("THE SESSION · WRITTEN ON THE PAGE, RUN FROM HERE");
    const evening = screen.getByText("EVENING");
    expect(waking.compareDocumentPosition(session) & 4).toBeTruthy();
    expect(session.compareDocumentPosition(evening) & 4).toBeTruthy();
  });

  it("locks a Stage 4 breath preset at breath stage 1 and writes the gate on the lock", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "IRON" }));
    fireEvent.click(await screen.findByRole("button", { name: "BREATHE" }));

    // stage 1 is open
    expect(await screen.findByText("Box breathing")).toBeInTheDocument();
    // stage 4 is locked, and the lock carries the gate that opens it
    const locked = screen.getByText("🔒 Wim Hof rounds");
    expect(locked).toBeInTheDocument();
    const card = locked.closest("button");
    expect(within(card).getByText("TO UNLOCK")).toBeInTheDocument();
    expect(within(card).getByText(/BOLT 35s\+\. Sensation exposure at 60 seconds producing boredom\./)).toBeInTheDocument();
    // and it cannot be started
    expect(card).toBeDisabled();
  });

  it("opens the sit at stage 1 with the clean cycle and drift buttons", async () => {
    await mount();
    fireEvent.click(screen.getByLabelText("Open the sit timer"));

    expect(await screen.findByText("THE SIT")).toBeInTheDocument();
    expect(screen.getByText("STAGE 1 · CONCENTRATION · 12 MINUTES")).toBeInTheDocument();
    const clean = screen.getByLabelText("Clean cycle");
    fireEvent.click(clean);
    fireEvent.click(clean);
    expect(await screen.findByText("2 TOTAL · RUN OF 2 · BEST 2")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/DRIFT — BACK TO ONE/));
    expect(await screen.findByText("2 TOTAL · RUN OF 0 · BEST 2")).toBeInTheDocument();
  });

  it("opens Thursday's bike with the nasal threshold in weeks 4, 9 and 14", async () => {
    await mount({ start: "2026-08-17" });          // puts today inside week 4
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    fireEvent.click(await screen.findByText(/40-SECOND REPEATS/));

    expect(await screen.findByText("Weeks 4, 9 and 14 — the nasal threshold test first")).toBeInTheDocument();
    expect(screen.getByText("The interval session below runs one round short today.")).toBeInTheDocument();
    // the honest half is worth more than the number
    expect(screen.getByText("IT HAD TO")).toBeInTheDocument();
    expect(screen.getByText("I CAVED")).toBeInTheDocument();
  });

  it("carries the silent sled on Wednesday's sled block", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    fireEvent.click(await screen.findByText(/Heavy Sled Sprints/));

    expect(await screen.findByText("THE SILENT SLED — when it's the week's test")).toBeInTheDocument();
    expect(screen.getByText("Exhale attention broke on")).toBeInTheDocument();
    expect(screen.getByText("Run the legs broke on")).toBeInTheDocument();
  });

  it("puts round-recovery breathing in every fight-sim rest and the post-max sit after it", async () => {
    await mount({ start: "2026-08-31" });          // week 2, so the fight sim is on
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));

    const sim = await screen.findByText(/Fight Simulation/);
    const sit = screen.getByText("The Post-Max Sit");
    expect(sim.compareDocumentPosition(sit) & 4).toBeTruthy();

    fireEvent.click(sim);
    expect(await screen.findByText(/Every rest is ROUND-RECOVERY BREATHING/)).toBeInTheDocument();
    expect(screen.getByText("▶ ROUND-RECOVERY BREATHING · 60s")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Weekly Check"));
    expect(await screen.findByText("Knees")).toBeInTheDocument();
    expect(screen.getByText("Achilles")).toBeInTheDocument();
    expect(screen.getByText("Hours of sleep, averaged")).toBeInTheDocument();
  });

  it("strips the week down inside the last ten days before a fight", async () => {
    await mount({ camp: true, lastTen: true });
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));

    expect(await screen.findByText("Box jumps only — the last ten days")).toBeInTheDocument();
    expect(screen.getAllByText("2 sets @ 70% — fast").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Flying Sprints/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    await waitFor(() => expect(screen.queryByText("Nordic Curls")).not.toBeInTheDocument());
  });

  it("swaps the week to the camp table when camp mode is on", async () => {
    await mount({ camp: true });

    // Tuesday is a sleep day in camp
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    expect(await screen.findByText("SLEEP")).toBeInTheDocument();

    // Thursday keeps the tendon work and drops the bike
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    expect(await screen.findByText("Spanish Squat Hold")).toBeInTheDocument();
    expect(screen.getByText("Achilles Hold")).toBeInTheDocument();
    expect(screen.queryByText(/40-SECOND REPEATS/)).not.toBeInTheDocument();
  });

  it("offers the fast-bar rule after the last bench set and raises the max 2.5%", async () => {
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100 }));
    await mount();

    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await screen.findByText("Bench Press"));

    // the prompt only shows once the last work set is confirmed
    expect(screen.queryByText("Last rep as fast as the first?")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm set 4" }));
    expect(await screen.findByText("Last rep as fast as the first?")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/YES · 100 → 102.5 KG/));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-maxes")).bench).toBe(102.5));
    expect(JSON.parse(localStorage.getItem("o8s-maxhist"))[0].src).toBe("fast-bar rule · wk 1");
  });

  it("defaults to a 16-week cycle with the Iron Mind weeks off", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
    expect(await screen.findByText("16")).toBeInTheDocument();
    expect(screen.queryByText("17")).not.toBeInTheDocument();
    expect(screen.queryByText("18")).not.toBeInTheDocument();
  });

  it("keeps data in localStorage under the o8s- keys", async () => {
    await mount();

    fireEvent.click(await screen.findByText("GREEN"));
    await waitFor(() => expect(localStorage.getItem("o8s-ready")).toBeTruthy());

    // the Iron Mind day writes to its own o8s- key and marks the day done
    fireEvent.click(screen.getByLabelText("Tick THE REVIEW"));
    fireEvent.click(screen.getByLabelText("Tick ★ THE SIT — 12 minutes"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-imday"))["2026-09-09"].ticks.sit).toBe(true));
    expect(await screen.findByText("YES")).toBeInTheDocument();
  });

  it("renders the hardship, track and plan pages without falling over", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: "IRON" }));
    fireEvent.click(await screen.findByRole("button", { name: "HARDSHIP" }));
    expect(await screen.findByText("THE SILENT SLED")).toBeInTheDocument();
    expect(screen.getByText("THE COLLISION RULES — PRECEDENCE, FIXED")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SIT" }));
    expect(await screen.findByText("THE GUIDED TIMERS")).toBeInTheDocument();
    // the guided timers and the eleven types both name the body scan
    expect(screen.getAllByText("Body scan").length).toBe(2);
    // stage 4's shikantaza is locked at meditation stage 1
    expect(screen.getByText("🔒 Just sitting — shikantaza")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "TRACK" }));
    fireEvent.click(await screen.findByRole("button", { name: "IRON MIND" }));
    expect(await screen.findByText("Week by week")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PLAN" }));
    expect(await screen.findByText("CONTENTS")).toBeInTheDocument();
    // both documents are readable offline: once in the contents, once as the heading
    expect(screen.getAllByText("WHEN BOXING RETURNS — CAMP MODE").length).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: "IRON MIND v4.2" }));
    await waitFor(() => expect(screen.getAllByText("THE DAY — ONE PAGE, EVERY DAY").length).toBe(2));
  });
});
