import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
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

/* A block header is one element whose whole text is the block's name, with a
   leading ★ on the starred ones. */
const headMatch = (name) => (_t, el) => {
  if (!el || el.children.length) return false;
  const txt = (el.textContent || "").trim();
  return txt === name || txt === "\u2605 " + name;
};
const head = (name) => screen.getByText(headMatch(name));
const findHead = (name) => screen.findByText(headMatch(name));

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
    expect(screen.getByText("Upper Strength + Power Dose + Rings")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Weighted Chin-Up + The Muscle-Up Line")).toBeInTheDocument();
    // week 1's bench prescription, so this really is week 1 and not just any Monday
    expect(screen.getByText("4 × 6 @ 75%")).toBeInTheDocument();
  });

  it("renders Monday's ring dips after the bench press, at the level you're on", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "MON" }));

    const bench = await screen.findByText("Bench Press");
    const dips = screen.getByText("Ring Dips");
    const chins = screen.getByText("Weighted Chin-Up + The Muscle-Up Line");
    // DOCUMENT_POSITION_FOLLOWING === 4: bench → ring dips → chins + muscle-up
    expect(bench.compareDocumentPosition(dips) & 4).toBeTruthy();
    expect(dips.compareDocumentPosition(chins) & 4).toBeTruthy();

    // the block carries the level, its prescription and the "own it when"
    fireEvent.click(dips);
    expect(await screen.findByText("RING DIPS · Monday")).toBeInTheDocument();
    expect(screen.getByText("LEVEL 1")).toBeInTheDocument();
    expect(screen.getByText("Bar dips 3 × 5, chest forward, shoulders down (bench dips 3 × 10 if a bar dip isn't there yet)")).toBeInTheDocument();
    expect(screen.getByText("3 × 10 bar dips")).toBeInTheDocument();

    // owning the level records today's date
    fireEvent.click(screen.getByLabelText("Level owned — RING DIPS"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-calis")).owned.ringdip["0"]).toBe("2026-09-09"));
  });

  it("threads the rest of the calisthenics into the week it belongs to", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    const pistol = await screen.findByText("The Pistol Line");
    const bike = screen.getByText(/4-MINUTE INTERVALS/);
    expect(pistol.compareDocumentPosition(bike) & 4).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    expect(await screen.findByText("Ring Rows")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await screen.findByText("Core + L-Sit + Hands")).toBeInTheDocument();
    expect(screen.getByText("The Slow Lane — one lever hold")).toBeInTheDocument();
  });

  it("takes the lines to holds only in a taper week, and to half sets in an easy week", async () => {
    await mount({ start: "2026-06-01" });          // week 15 — taper
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await screen.findByText("Ring Dips"));
    expect(await screen.findByText(/HOLDS ONLY — handstand and ring support/)).toBeInTheDocument();

    cleanup();
    await mount({ start: "2026-08-10" });          // week 5 — easy week
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await screen.findByText("Ring Dips"));
    expect(await screen.findByText(/EASY WEEK — every line at half its sets/)).toBeInTheDocument();
    // and the slow lane is out that week
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    await waitFor(() => expect(screen.queryByText("The Slow Lane — one lever hold")).not.toBeInTheDocument());
  });

  it("takes every line to holds only after an elbow at 4 or above on the weekly check", async () => {
    localStorage.setItem("o8s-log", JSON.stringify({ "m1w1-sun-wr_el": { w: "5" } }));
    await mount({ start: "2026-08-31" });          // week 2, so last week's check counts
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await screen.findByText("Ring Dips"));
    expect(await screen.findByText(/HOLDS ONLY — handstand and ring support/)).toBeInTheDocument();
  });

  it("puts the home skill block on the evening line, Monday to Thursday", async () => {
    await mount();      // the fixed day is a Wednesday

    expect(await screen.findByText("THE SKILL BLOCK — 6 minutes, Monday to Thursday, after RANGE")).toBeInTheDocument();
    expect(screen.getByText(/HANDSTAND · LEVEL 1 ·/)).toBeInTheDocument();
    // planche leans are Tuesday and Thursday only, so not today
    expect(screen.queryByText(/Planche leans, Tuesday and Thursday only/)).not.toBeInTheDocument();
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

  it("renders Friday as a sleep day whose only evening line is RANGE", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "FRI" }));

    expect(await screen.findByText("SLEEP")).toBeInTheDocument();
    expect(screen.getByText("No session today")).toBeInTheDocument();
    expect(screen.getByText(/not get up at half three/)).toBeInTheDocument();
    // v1.4: the full stretch is folded into RANGE, and there is no skill block
    expect(screen.getByText((_t, el) => el && el.textContent === "TONIGHT: RANGE · 20 MIN")).toBeInTheDocument();
    expect(screen.getByText(/Friday's extra stretch is folded into it, and there's no skill block/)).toBeInTheDocument();
    expect(screen.queryByText(/THE FULL STRETCH/)).not.toBeInTheDocument();
    // the ride is gone: no bike block, and nothing to tick off
    expect(screen.queryByText("Easy bike")).not.toBeInTheDocument();
    expect(screen.queryByText("▶ START SESSION")).not.toBeInTheDocument();
  });

  it("opens Saturday's and Sunday's warm-ups with the Turkish get-up", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));

    const wu = await screen.findByText("Warm-up — get-ups first");
    fireEvent.click(wu);
    // the get-up is the first thing on the protocol sheet, ahead of the hip work
    const getup = await screen.findByText("TURKISH GET-UP · 2 PER SIDE, LIGHT · 4 MIN");
    const hips = screen.getByText("THEN THE HIPS");
    const sprints = screen.getByText("SPRINT BUILD-UPS");
    // DOCUMENT_POSITION_FOLLOWING === 4
    expect(getup.compareDocumentPosition(hips) & 4).toBeTruthy();
    expect(hips.compareDocumentPosition(sprints) & 4).toBeTruthy();
    expect(screen.getByText(/the whole body agreeing on how to get off the floor/)).toBeInTheDocument();

    cleanup();
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await screen.findByText("Warm-up — get-ups first"));
    expect(await screen.findByText("THEN TUESDAY'S WARM-UP, WITHOUT THE CRAWLS")).toBeInTheDocument();
    expect(screen.getAllByText("TURKISH GET-UP · 2 PER SIDE, LIGHT · 4 MIN").length).toBeGreaterThan(0);
  });

  it("opens Tuesday's and Thursday's warm-ups with bear crawls", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await screen.findByText("Warm-up + bear crawls"));
    expect(await screen.findByText("THEN BEAR CRAWLS · 2 MIN")).toBeInTheDocument();
    expect(screen.getByText(/the bridge between the handstand and the get-up/)).toBeInTheDocument();

    // Wednesday's warm-up is unchanged — no crawls there
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    await waitFor(() => expect(screen.queryByText("Warm-up + bear crawls")).not.toBeInTheDocument());
  });

  it("shows RANGE in the evening on TODAY, with the morning five on waking", async () => {
    await mount();

    expect(await screen.findByText("THE MORNING FIVE — 5 minutes of joint circles")).toBeInTheDocument();
    expect(screen.getByText("NECK · SHOULDERS · MID-BACK · HIPS · ANKLES")).toBeInTheDocument();

    const range = screen.getByText("★ RANGE — 20 minutes");
    expect(range).toBeInTheDocument();
    expect(screen.getByLabelText("Open the range timer")).toBeInTheDocument();
    // RANGE comes before the skill block and the sit
    const skill = screen.getByText("THE SKILL BLOCK — 6 minutes, Monday to Thursday, after RANGE");
    const sit = screen.getByText("★ THE SIT — 12 minutes");
    expect(range.compareDocumentPosition(skill) & 4).toBeTruthy();
    expect(skill.compareDocumentPosition(sit) & 4).toBeTruthy();

    // the timer steps through the document's moves, mid-back first
    fireEvent.click(screen.getByLabelText("Open the range timer"));
    expect(await screen.findByText("RANGE")).toBeInTheDocument();
    expect(screen.getByText(/DOWN-REGULATE — FEET ON A CHAIR/)).toBeInTheDocument();
    expect(screen.getByText(/NEXT · FOAM ROLLER EXTENSIONS/)).toBeInTheDocument();
  });

  it("writes the whole home block out behind the session's home line", async () => {
    await mount();
    fireEvent.click(screen.getByText(/HOME · tonight: RANGE/));

    expect(await screen.findByText("THE HOME BLOCK")).toBeInTheDocument();
    expect(screen.getByText("The morning five · on waking, after the sighs and the one thing · 5 min")).toBeInTheDocument();
    expect(screen.getByText("1 · MID-BACK — FIRST, ALWAYS · 5 min")).toBeInTheDocument();
    expect(screen.getByText("2 · HIPS · 8 min")).toBeInTheDocument();
    expect(screen.getByText("3 · SHOULDERS · 6 min")).toBeInTheDocument();
    expect(screen.getByText(/90\/90 · RIGHT LEG FRONT/)).toBeInTheDocument();
    expect(screen.getByText(/KETTLEBELL ARM BAR · LEFT/)).toBeInTheDocument();
  });

  it("switches RANGE to THE KEEP from range week 13", async () => {
    // week 1 Monday thirteen weeks back puts today in range week 13
    await mount({ start: "2026-06-15", rangeStart: "2026-06-15" });

    expect(await screen.findByText("★ THE KEEP — 10 minutes")).toBeInTheDocument();
    expect(screen.queryByText("★ RANGE — 20 minutes")).not.toBeInTheDocument();
    // week 13 is also a test week
    expect(screen.getByText("THE FOUR RANGE TESTS — range week 13")).toBeInTheDocument();
  });

  it("puts the four range tests on the Sunday weekly check in weeks 1, 5, 9 and 13", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await findHead("Weekly Check"));

    expect(await screen.findByText("The four range tests — weeks 1, 5, 9 and 13")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/THE FOUR RANGE TESTS · RANGE WEEK 1/));

    expect(await screen.findByText("1. 90/90 sit")).toBeInTheDocument();
    expect(screen.getByText("3. Wall flexion")).toBeInTheDocument();
    expect(screen.getByText("Gap — right hand over the shoulder (cm)")).toBeInTheDocument();
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
    expect(screen.getByText("Elbows")).toBeInTheDocument();
    expect(screen.getByText("Achilles")).toBeInTheDocument();
    expect(screen.getByText("Evenings you did RANGE")).toBeInTheDocument();
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

    // and the calisthenics go to the handstand at home only
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    await waitFor(() => expect(screen.queryByText("Ring Dips")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    await waitFor(() => expect(screen.queryByText("Ring Rows")).not.toBeInTheDocument());
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

  /* ---------------- v1.5 ---------------- */

  it("runs Sunday in the v1.5 order — the Nordics ahead of the fight simulation", async () => {
    await mount({ start: "2026-08-31" });          // week 2 — week 1's Sunday is the bike test
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));

    const throws = await findHead("The Four Punch Throws");
    const nordics = head("Nordic Curls");
    const sim = head("Fight Simulation");
    const postmax = head("The Post-Max Sit");
    const core = head("Core + L-Sit + Hands");
    const lever = head("The Slow Lane — one lever hold");
    const check = head("Weekly Check");
    // DOCUMENT_POSITION_FOLLOWING === 4
    expect(throws.compareDocumentPosition(nordics) & 4).toBeTruthy();
    expect(nordics.compareDocumentPosition(sim) & 4).toBeTruthy();
    expect(sim.compareDocumentPosition(postmax) & 4).toBeTruthy();
    expect(postmax.compareDocumentPosition(core) & 4).toBeTruthy();
    expect(core.compareDocumentPosition(lever) & 4).toBeTruthy();
    expect(lever.compareDocumentPosition(check) & 4).toBeTruthy();

    fireEvent.click(nordics);
    expect(await screen.findByText(/the hardest eccentric work of the week goes on fresh hamstrings/)).toBeInTheDocument();
  });

  it("puts repeat bursts in the Tuesday bike menu, and no 30-second all-outs anywhere", async () => {
    await mount({ start: "2026-08-24" });          // week 3 — Tuesday is the repeat bursts
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));

    fireEvent.click(await findHead("REPEAT BURSTS"));

    // the menu writes out all four types, as the Tuesday page does
    expect(await screen.findByText("The four session types")).toBeInTheDocument();
    expect(screen.getByText("4-MINUTE INTERVALS")).toBeInTheDocument();
    expect(screen.getByText("40-SECOND REPEATS")).toBeInTheDocument();
    expect(screen.getByText("REPEAT BURSTS · THIS WEEK")).toBeInTheDocument();
    expect(screen.getByText("EASY")).toBeInTheDocument();
    expect(screen.queryByText(/30-SECOND ALL-OUTS/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30s all-out/)).not.toBeInTheDocument();

    // the prescription, the weaker-burst rule, and a timer that counts the bursts
    expect(screen.getAllByText(/8 bursts of 6–8s at absolute maximum/).length).toBeGreaterThan(0);
    expect(screen.getByText(/if a burst is visibly weaker than the last, take an extra 20 seconds/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "▶ START REPEAT BURSTS" }));
    expect(await screen.findByText("SET 1 · BURST 1 OF 8 — ABSOLUTE MAXIMUM")).toBeInTheDocument();
    expect(screen.getByText("6–8 seconds, everything you have.")).toBeInTheDocument();
  });

  it("runs week 15's repeat bursts as one set", async () => {
    await mount({ start: "2026-06-01" });          // week 15
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("REPEAT BURSTS · ONE SET"));
    await waitFor(() => expect(screen.getAllByText(/1 set × 8 bursts of 6–8s at absolute maximum/).length).toBeGreaterThan(0));
  });

  it("reads week 8's pause squat at 75%, and never above it", async () => {
    await mount({ start: "2026-07-20" });          // week 8
    fireEvent.click(screen.getByRole("button", { name: "WED" }));

    expect(await findHead("Pause Squat")).toBeInTheDocument();
    expect(screen.getAllByText("3 × 3 @ 75%").length).toBeGreaterThan(0);

    fireEvent.click(head("Pause Squat"));
    expect(await screen.findByText(/That column never goes above 75%/)).toBeInTheDocument();

    // and the easy week sits at 60%
    cleanup();
    await mount({ start: "2026-08-10" });          // week 5
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    expect(await findHead("Pause Squat")).toBeInTheDocument();
    expect(screen.getAllByText("2 × 3 @ 60% — easy week").length).toBeGreaterThan(0);
  });

  it("warms the legs up before Monday's box jumps and picks the box by the landing", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await findHead("Power dose — box jumps"));

    const prep = await screen.findByText("First, one minute of legs");
    const jump = screen.getByText("Box jump");
    expect(prep.compareDocumentPosition(jump) & 4).toBeTruthy();
    expect(screen.getByText(/the box by the landing, not the height/)).toBeInTheDocument();
  });

  it("stands the Achilles hold up on a straight knee", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("Seated Calf Raise + Achilles Hold"));

    expect(await screen.findByText("Achilles hold — STANDING")).toBeInTheDocument();
    expect(screen.getByText(/knees straight, no bouncing, no sinking/)).toBeInTheDocument();
    expect(screen.getByText(/a seated hold loads a different muscle into the same tendon/)).toBeInTheDocument();
  });

  it("opens Thursday's throws with three easy throws", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    fireEvent.click(await findHead("Power dose — throws + landmine"));

    const easy = await screen.findByText("Three easy throws of each first");
    const shot = screen.getByText("Rotational shot-put");
    expect(easy.compareDocumentPosition(shot) & 4).toBeTruthy();
    expect(screen.getByText(/nothing in the warm-up has rehearsed/)).toBeInTheDocument();
  });

  it("moves Saturday's squat warm-up sets inside the squat step", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));

    fireEvent.click(await screen.findByText("Warm-up — get-ups first"));
    expect(await screen.findByText("SPRINT BUILD-UPS")).toBeInTheDocument();
    expect(screen.queryByText("SQUAT RAMP")).not.toBeInTheDocument();

    fireEvent.click(head("Back Squat"));
    expect(await screen.findByText("Squat warm-up sets — here, not at the start of the session")).toBeInTheDocument();
    expect(screen.getByText(/it doesn't keep the squat pattern rehearsed/)).toBeInTheDocument();
  });

  it("puts THE EASY HOUR on the weekend, once, ticked from either day", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    expect(await screen.findByText("THE EASY HOUR")).toBeInTheDocument();
    expect(screen.getByText("30–40 MIN · NOSE ONLY · ONCE A WEEKEND")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("The easy hour"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w1-easyhour"].ok).toBe(true));

    // ticking it on Saturday clears Sunday too
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await screen.findByText(/✓ DONE THIS WEEKEND/)).toBeInTheDocument();

    // and it is a weekend item only
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    await waitFor(() => expect(screen.queryByText("THE EASY HOUR")).not.toBeInTheDocument());
  });

  it("asks for lights-out time on the weekly check", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await screen.findByText("Weekly Check"));

    expect(await screen.findByText("Lights-out time, averaged")).toBeInTheDocument();
    expect(screen.getByText("Hours of sleep, averaged")).toBeInTheDocument();
    expect(screen.getByText("Achilles")).toBeInTheDocument();
    expect(screen.getByText("Evenings you did RANGE")).toBeInTheDocument();
  });

  it("writes the engine safeguard on the Friday page", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "FRI" }));
    expect(await screen.findByText(/The safeguard, written down/)).toBeInTheDocument();
    expect(screen.getByText(/twenty easy minutes on the bike straight after Tuesday's intervals is the first thing that comes back/)).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "CALIS" }));
    expect(await screen.findByText("Calisthenics — where each line stands")).toBeInTheDocument();
    expect(screen.getByText("THE SLOW LANE")).toBeInTheDocument();
    expect(screen.getAllByText("not yet").length).toBe(7);

    fireEvent.click(screen.getByRole("button", { name: "RANGE" }));
    expect(await screen.findByText("RANGE — the four tests")).toBeInTheDocument();
    expect(screen.getByText("90/90 sit — Back knee off the floor — right leg front")).toBeInTheDocument();
    expect(screen.getByText("The yes-or-nos")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PLAN" }));
    expect(await screen.findByText("CONTENTS")).toBeInTheDocument();
    // both documents are readable offline: once in the contents, once as the heading
    expect(screen.getAllByText("WHEN BOXING RETURNS — CAMP MODE").length).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: "IRON MIND v4.2" }));
    await waitFor(() => expect(screen.getAllByText("THE DAY — ONE PAGE, EVERY DAY").length).toBe(2));
  });
});
