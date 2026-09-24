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
/* the app header's one line: program · week · block */
const title = () => screen.getByTestId("app-title").textContent;
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
    await waitFor(() => expect(title()).toBe("OPTIMAL 8 FIGHTER · WEEK 1"));

    fireEvent.click(screen.getByRole("button", { name: "MON" }));

    expect(await screen.findByText("MONDAY")).toBeInTheDocument();
    expect(screen.getByText("Upper Strength + Power Dose + Rings")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Weighted Chin-Up + The Muscle-Up Line")).toBeInTheDocument();
    // week 1's bench prescription, on the row, so this really is week 1
    expect(screen.getByText(/^4 × 6 · 75%/)).toBeInTheDocument();
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
    // the week is resolved into the row: a taper week prescribes the hold
    expect(await screen.findByText(/^Ring support hold, 3 × 20 seconds at the top/)).toBeInTheDocument();
    expect(screen.queryByText(/HOLDS ONLY/)).not.toBeInTheDocument();

    cleanup();
    await mount({ start: "2026-08-10" });          // week 5 — easy week
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    // an easy week prescribes half the sets — 3 × 5 becomes 2 × 5
    expect(await screen.findByText(/^Bar dips 2 × 5 · level 1/)).toBeInTheDocument();
    expect(screen.queryByText(/EASY WEEK/)).not.toBeInTheDocument();
    // and the slow lane is out that week
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    await waitFor(() => expect(screen.queryByText("The Slow Lane — one lever hold")).not.toBeInTheDocument());
  });

  it("takes every line to holds only after an elbow at 4 or above on the weekly check", async () => {
    localStorage.setItem("o8s-log", JSON.stringify({ "m1w1-sun-wr_el": { w: "5" } }));
    await mount({ start: "2026-08-31" });          // week 2, so last week's check counts
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    expect(await screen.findByText(/^Ring support hold, 3 × 20 seconds at the top/)).toBeInTheDocument();
  });

  it("puts the hollow block on every evening but Friday", async () => {
    await mount();      // the fixed day is a Wednesday

    fireEvent.click(await screen.findByText("The hollow block"));
    expect(await screen.findByText("Handstand")).toBeInTheDocument();
    expect(screen.getByText("4 min · level 1")).toBeInTheDocument();
    // planche leans are Tuesday and Thursday only, so not today
    expect(screen.queryByText("Planche leans")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "FRI" }));
    await waitFor(() => expect(screen.queryByText("The hollow block")).not.toBeInTheDocument());
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

  it("renders Friday as a sleep day whose evening still runs", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "FRI" }));

    expect(await screen.findByText("SLEEP")).toBeInTheDocument();
    expect(screen.getByText("No alarm")).toBeInTheDocument();
    // the evening still runs, and there is no hollow block on a Friday
    expect(screen.getByText("RANGE")).toBeInTheDocument();
    expect(screen.getByText("The sit")).toBeInTheDocument();
    expect(screen.queryByText("The hollow block")).not.toBeInTheDocument();
    // the ride is gone: no bike block
    expect(screen.queryByText("Easy bike")).not.toBeInTheDocument();
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
    // the how opens on a tap
    fireEvent.click(screen.getAllByText("Bear crawls · 2 min")[1]);
    expect(screen.getAllByText(/on hands and feet, knees an inch off the floor/).length).toBeGreaterThan(1);

    // Wednesday's warm-up is unchanged — no crawls there
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    await waitFor(() => expect(screen.queryByText("Warm-up + bear crawls")).not.toBeInTheDocument());
  });

  it("runs the whole day as one flow, the morning down to lights out", async () => {
    await mount();

    // the five morning items, in order, then the session, the site, lunch, the evening
    ["Resting heart rate and HRV", "Three physiological sighs", "The one thing", "The morning five", "The check"]
      .forEach((n) => expect(screen.getByText(n)).toBeInTheDocument());
    const order = ["MORNING", "SESSION", "ON SITE", "LUNCH", "EVENING"].map((n) => screen.getByText(n));
    order.forEach((el, i) => { if (i) expect(order[i - 1].compareDocumentPosition(el) & 4).toBeTruthy(); });

    // the evening runs RANGE → the hollow block → the sit → the review → the light
    const ev = ["RANGE", "The hollow block", "The sit", "The review", "Casein before bed", "Lights out"].map((n) => screen.getByText(n));
    ev.forEach((el, i) => { if (i) expect(ev[i - 1].compareDocumentPosition(el) & 4).toBeTruthy(); });

    // the morning five is five rows under one running timer
    fireEvent.click(screen.getByText("The morning five"));
    ["Neck", "Shoulders", "Mid-back", "Hips", "Ankles"].forEach((n) => expect(screen.getByText(n)).toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: "START" }).length).toBe(1);

    // and RANGE is the document's moves in order, mid-back first, under one timer
    fireEvent.click(screen.getByText("RANGE"));
    expect(await screen.findByText("DOWN-REGULATE")).toBeInTheDocument();
    expect(screen.getByText("FOAM ROLLER EXTENSIONS × 8")).toBeInTheDocument();
    expect(screen.getByText(/DOWN-REGULATE — FEET ON A CHAIR/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "START" }).length).toBe(1);
  });

  it("switches RANGE to THE KEEP from range week 13", async () => {
    // week 1 Monday thirteen weeks back puts today in range week 13
    await mount({ start: "2026-06-15", rangeStart: "2026-06-15" });

    expect(await screen.findByText("THE KEEP")).toBeInTheDocument();
    expect(screen.queryByText("RANGE")).not.toBeInTheDocument();
  });

  it("puts the four range tests on the Sunday weekly check in weeks 1, 5, 9 and 13", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await findHead("Weekly Check"));

    expect(await screen.findByText("The four range tests")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/^▶ 90\/90 SIT · DEEP SQUAT/));

    expect(await screen.findByText("1. 90/90 sit")).toBeInTheDocument();
    expect(screen.getByText("3. Wall flexion")).toBeInTheDocument();
    expect(screen.getByText("Gap — right hand over the shoulder (cm)")).toBeInTheDocument();
  });

  it("shows a 12-minute sit on TODAY at meditation stage 1", async () => {
    await mount();

    const sit = await screen.findByText("The sit");
    expect(within(sit.parentElement).getByText("12 MIN")).toBeInTheDocument();
    // the day is woven in order around the session
    const morning = screen.getByText("MORNING");
    const session = screen.getByText("WEDNESDAY");
    const evening = screen.getByText("EVENING");
    expect(morning.compareDocumentPosition(session) & 4).toBeTruthy();
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
    fireEvent.click(screen.getByText("The sit"));
    fireEvent.click(await screen.findByRole("button", { name: "▶ THE SIT · 12 MIN" }));

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

    expect(await screen.findByText("Nasal threshold test · 8 min")).toBeInTheDocument();
    // the honest half is worth more than the number
    expect(screen.getByText("IT HAD TO")).toBeInTheDocument();
    expect(screen.getByText("I CAVED")).toBeInTheDocument();
  });

  it("carries the silent sled on Wednesday's sled block", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    fireEvent.click(await screen.findByText(/Heavy Sled Sprints/));

    expect(await screen.findByText("THE SILENT SLED")).toBeInTheDocument();
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
    expect(await screen.findByText("▶ ROUND-RECOVERY BREATHING · 60s")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Weekly Check"));
    expect(await screen.findByText("Knees")).toBeInTheDocument();
    expect(screen.getByText("Elbows")).toBeInTheDocument();
    expect(screen.getByText("Achilles")).toBeInTheDocument();
    expect(screen.getByText("Evenings you did RANGE")).toBeInTheDocument();
    expect(screen.getByText("Hours of sleep, averaged")).toBeInTheDocument();
  });

  it("strips the week down inside the last ten days before a fight", async () => {
    await mount({ lastTen: true });
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));

    expect(await findHead("The Jump Circuit")).toBeInTheDocument();
    expect(screen.getAllByText(/^2 sets · 70%/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Flying Sprints/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    await waitFor(() => expect(screen.queryByText("Nordic Curls")).not.toBeInTheDocument());
  });

  /* ---------------- CAMP MODE — the twelve weeks ---------------- */

  const CAMP_START = "2026-09-21";              // Monday 21 September 2026
  const camp = (extra) => mount(Object.assign({ camp: true, campStart: CAMP_START }, extra || {}));
  /* a is before b in the document */
  const before = (a, b) => !!(a.compareDocumentPosition(b) & 4);

  it("runs Monday 21 September as camp week 1, with a full first week", async () => {
    vi.setSystemTime(new Date(2026, 8, 21, 9, 0, 0));   // Monday 21 September 2026
    await camp();

    // the camp's own clock, counting from its own start date — and week 1 opens with the base
    await waitFor(() => expect(title()).toBe("CAMP · WEEK 1 · FOUNDATION"));
    expect(screen.getByText("MON 21 Sep")).toBeInTheDocument();
    expect(await findHead("Easy, nose only")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    expect(await screen.findByText("TUE 22 Sep")).toBeInTheDocument();

    const burst = await findHead("THE BURST TEST");
    const intervals = head("MODERATE INTERVALS");
    expect(before(burst, intervals)).toBe(true);

    // the session runs in the document's order, and the settle closes the engine work
    expect(before(head("Warm-up + bear crawls"), burst)).toBe(true);
    expect(before(intervals, head("The 60-Second Settle"))).toBe(true);
    expect(before(head("The 60-Second Settle"), head("Seated Calf Raise + Achilles Hold"))).toBe(true);

    // ten bursts of six seconds, first against last
    fireEvent.click(burst);
    expect(await screen.findByText("Burst 1 — peak power")).toBeInTheDocument();
    expect(screen.getByText("Burst 10 — peak power")).toBeInTheDocument();
  });

  it("sharpens in week 10 when the fight is confirmed, and runs the last hard week when it isn't", async () => {
    vi.setSystemTime(new Date(2026, 10, 25, 9, 0, 0));  // Wednesday 25 November 2026, camp week 10

    await camp({ campFight: true });
    await waitFor(() => expect(title()).toBe("CAMP · WEEK 10 · THE FORK"));
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    expect(await findHead("THE SPEED MICRODOSE")).toBeInTheDocument();
    expect(screen.queryByText("Back Squat")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await findHead("THE REHEARSAL-LITE")).toBeInTheDocument();

    cleanup();
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");

    // no fight: week 10 is the fourth peak week, and week 11 becomes the test week
    await camp({ campFight: false });
    await waitFor(() => expect(title()).toBe("CAMP · WEEK 10 · PEAK"));
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    expect(await findHead("Back Squat")).toBeInTheDocument();
    expect(screen.queryByText("THE SPEED MICRODOSE")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await findHead("The 7 × 3 Simulation")).toBeInTheDocument();
  });

  it("makes week 11 fight week on one path and the camp's verdict on the other", async () => {
    vi.setSystemTime(new Date(2026, 11, 1, 9, 0, 0));   // Tuesday 1 December 2026, camp week 11

    await camp({ campFight: true });
    await waitFor(() => expect(title()).toBe("CAMP · WEEK 11 · FIGHT WEEK"));
    expect(await findHead("The fight")).toBeInTheDocument();

    cleanup();
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");

    await camp({ campFight: false });
    await waitFor(() => expect(title()).toBe("CAMP · WEEK 11 · THE TEST WEEK"));
    expect(await findHead("THE RETESTS")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await findHead("The 6 × 3 Simulation")).toBeInTheDocument();
  });

  it("runs the camp's lift phases, its conditioning types and its rounds", async () => {
    vi.setSystemTime(new Date(2026, 8, 16, 9, 0, 0));   // Wednesday 16 September 2026, camp week 1
    await camp();

    // week 1 is slow lowering, with the five-second cue on the page
    fireEvent.click(await findHead("Trap Bar Deadlift"));
    expect((await screen.findAllByText("3 × 5 @ 70% — SLOW LOWERING, 5 s down")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText("Trap bar deadlift"));
    expect(await screen.findByText(/lower the bar over a full five seconds/)).toBeInTheDocument();

    // Thursday opens with the nasal threshold in week 1, then tempo intervals
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    const nasal = await findHead("The Nasal Threshold Test");
    expect(before(nasal, head("TEMPO INTERVALS"))).toBe(true);

    // Sunday is the 20-minute test, then three easy rounds, then the post-max sit
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    const t20 = await findHead("The 20-Minute Test");
    expect(before(t20, head("The 3 × 3 Simulation"))).toBe(true);
    expect(before(head("The 3 × 3 Simulation"), head("The Post-Max Sit"))).toBe(true);

  });

  it("puts the corner minute in every rest of the rounds, and the post-max sit after them", async () => {
    vi.setSystemTime(new Date(2026, 8, 20, 9, 0, 0));   // Sunday 20 September 2026, camp week 1
    await camp();

    fireEvent.click(await findHead("The 3 × 3 Simulation"));
    expect(await screen.findByRole("button", { name: "▶ START THE ROUNDS" })).toBeInTheDocument();

    fireEvent.click(head("The Post-Max Sit"));
    fireEvent.click(await screen.findByText("Seconds to settle onto the breath"));
    expect(await screen.findByText(/heart at 170-plus, find the breath at the nostrils/)).toBeInTheDocument();
  });

  it("moves to paused, then fast, then contrast, and puts the jump circuit behind the contrast squat", async () => {
    vi.setSystemTime(new Date(2026, 10, 11, 9, 0, 0));  // Wednesday 11 November 2026, camp week 8
    await camp();

    await waitFor(() => expect(title()).toBe("CAMP · WEEK 8 · PEAK"));
    fireEvent.click(await findHead("Trap Bar Deadlift"));
    fireEvent.click(await screen.findByText("Trap bar deadlift"));
    expect(await screen.findByText(/straight into the jump circuit/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    fireEvent.click(await findHead("Back Squat"));
    expect(await screen.findByText("Band-assisted jump")).toBeInTheDocument();
    expect(screen.getByText("Trap bar jump")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "▶ START THE JUMP CIRCUIT" })).toBeInTheDocument();

    // seven rounds in the peak block, so the sixth is a place you've been
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await findHead("The 7 × 3 Simulation")).toBeInTheDocument();
  });

  it("loads the camp from working weights and never from a max", async () => {
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100, cw_squat: 120, cw_tbdl: 160 }));
    vi.setSystemTime(new Date(2026, 8, 16, 9, 0, 0));   // Wednesday 16 September 2026
    await camp();

    fireEvent.click(await findHead("Trap Bar Deadlift"));
    expect(await screen.findByText("Trap Bar Deadlift — working weight")).toBeInTheDocument();
    expect(screen.getByText((_t, el) => !!el && el.children.length === 1 && (el.textContent || "").trim() === "112.5 kg ▶ PLATES")).toBeInTheDocument();   // 70% of 160
    expect(screen.getByText("NO MAXES, EVER, IN CAMP")).toBeInTheDocument();

    // the fighter's maxes are untouched and still on TRACK
    fireEvent.click(screen.getByRole("button", { name: "TRACK" }));
    fireEvent.click(await screen.findByRole("button", { name: "MAXES" }));
    expect(await screen.findByText("140 kg")).toBeInTheDocument();
  });

  it("gives the camp a dated week table, and a fight-week table for Tuesday 1 December", async () => {
    vi.setSystemTime(new Date(2026, 10, 25, 9, 0, 0));  // camp week 10, the fork
    await camp({ campFight: true });

    fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
    expect(await screen.findByText("The twelve weeks — every number, every week, with dates")).toBeInTheDocument();
    expect(screen.getByText("21–27 Sep")).toBeInTheDocument();
    expect(screen.getByText("23–29 Nov")).toBeInTheDocument();
    expect(screen.getByText("30 Nov–6 Dec")).toBeInTheDocument();
    expect(screen.getByText("7–13 Dec")).toBeInTheDocument();

    expect(screen.getByText("Fight week — fight on Tuesday 1 December")).toBeInTheDocument();
    expect(screen.getByText("TUE 1 Dec")).toBeInTheDocument();
    expect(screen.getByText(/Round six is a place you've already been/)).toBeInTheDocument();
  });

  it("hands back to Optimal 8 Fighter exactly as it was when the switch goes off", async () => {
    await camp();
    expect(await screen.findByText(/STRENGTH — sled, the trap bar in its phase/)).toBeInTheDocument();

    cleanup();
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    await mount({ camp: false, campStart: CAMP_START });

    // the Fighter's own clock, its own week 1 Monday, its own page
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    expect(await screen.findByText("Upper Strength + Power Dose + Rings")).toBeInTheDocument();
    expect(head("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Ring Dips")).toBeInTheDocument();
  });

  it("switches the camp on, off and at the fork from settings", async () => {
    vi.setSystemTime(new Date(2026, 8, 22, 9, 0, 0));
    await camp();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(await screen.findByText("Camp mode — the twelve weeks")).toBeInTheDocument();
    expect(screen.getByText("Camp day one — the Monday week 1 starts on")).toBeInTheDocument();
    expect(screen.getByText(/camp week 1/)).toBeInTheDocument();

    // the fork is a setting, and it rewrites weeks 10 and 11
    fireEvent.click(screen.getByRole("button", { name: "FIGHT CONFIRMED" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).campFight).toBe(true));
    expect(await screen.findByText(/week 11 is fight week/)).toBeInTheDocument();

    // and turning it off hands the app straight back to the Fighter
    fireEvent.click(screen.getByText("CAMP MODE"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).camp).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: "CLOSE" }));
    expect(await screen.findByText(/Crawls · Jumps · Pistols · Engine 1/)).toBeInTheDocument();
  });

  it("puts the camp document on the PLAN tab", async () => {
    await camp();
    fireEvent.click(screen.getByRole("button", { name: "PLAN" }));
    expect(await screen.findByRole("button", { name: "CAMP" })).toBeInTheDocument();
    expect(screen.getAllByText("THE TWELVE WEEKS — EVERY NUMBER, EVERY WEEK, WITH DATES").length).toBe(2);
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

    // the four yes/no taps resolve the day and write it to its own o8s- key
    fireEvent.click(await screen.findByText("The check"));
    screen.getAllByRole("button", { name: "NO" }).forEach((b) => fireEvent.click(b));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-ready"))["m1w1-wed"]).toBe("G"));

    // the Iron Mind day writes to its own o8s- key and marks the day done
    fireEvent.click(screen.getByLabelText("Tick The review"));
    fireEvent.click(screen.getByLabelText("Tick The sit"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-imday"))["2026-09-09"].ticks.sit).toBe(true));
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
    fireEvent.click(await screen.findByText("Nordic curl"));
    expect(await screen.findByText(/Kneel with your heels anchored under something solid/)).toBeInTheDocument();
  });

  it("puts repeat bursts in the Tuesday bike menu, and no 30-second all-outs anywhere", async () => {
    await mount({ start: "2026-08-24" });          // week 3 — Tuesday is the repeat bursts
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));

    fireEvent.click(await findHead("REPEAT BURSTS"));

    // this week's session is on the page; the menu of the other three is on PLAN
    expect((await screen.findAllByText(/^2 sets × 8 bursts of 6–8s at absolute maximum/)).length).toBeGreaterThan(0);
    expect(screen.queryByText("The four session types")).not.toBeInTheDocument();
    expect(screen.queryByText(/30-SECOND ALL-OUTS/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30s all-out/)).not.toBeInTheDocument();

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
    expect(screen.getByText(/^3 × 3 · 75%/)).toBeInTheDocument();

    fireEvent.click(head("Pause Squat"));
    expect((await screen.findAllByText("3 × 3 @ 75%")).length).toBeGreaterThan(0);

    // and the easy week sits at 60%
    cleanup();
    await mount({ start: "2026-08-10" });          // week 5
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    expect(await findHead("Pause Squat")).toBeInTheDocument();
    expect(screen.getByText(/^2 × 3 · 60%/)).toBeInTheDocument();
  });

  it("warms the legs up before Monday's box jumps and picks the box by the landing", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await findHead("Power dose — box jumps"));

    const prep = await screen.findByText("First, one minute of legs");
    const jump = screen.getByText("Box jump");
    expect(prep.compareDocumentPosition(jump) & 4).toBeTruthy();
    fireEvent.click(jump);
    expect(await screen.findByText(/the box by the landing, not the height/)).toBeInTheDocument();
  });

  it("stands the Achilles hold up on a straight knee", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("Seated Calf Raise + Achilles Hold"));

    expect(await screen.findByText("Achilles hold — STANDING")).toBeInTheDocument();
    expect(screen.getByText("one × 45 seconds")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Achilles hold — STANDING"));
    expect(await screen.findByText(/knees straight, no bouncing, no sinking/)).toBeInTheDocument();
    // the protocol keeps the straight-knee reason where the block is written out
    expect(screen.getByText(/a seated hold loads a different muscle into the same tendon/)).toBeInTheDocument();
  });

  it("opens Thursday's throws with three easy throws", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    fireEvent.click(await findHead("Power dose — throws + landmine"));

    const easy = await screen.findByText("Three easy throws of each first");
    const shot = screen.getByText("Rotational shot-put");
    expect(easy.compareDocumentPosition(shot) & 4).toBeTruthy();
    fireEvent.click(easy);
    expect(await screen.findByText(/nothing in the warm-up has rehearsed/)).toBeInTheDocument();
  });

  it("moves Saturday's squat warm-up sets inside the squat step", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));

    fireEvent.click(await screen.findByText("Warm-up — get-ups first"));
    expect(await screen.findByText("SPRINT BUILD-UPS")).toBeInTheDocument();
    expect(screen.queryByText("SQUAT RAMP")).not.toBeInTheDocument();

    fireEvent.click(head("Back Squat"));
    expect(await screen.findByText("Squat warm-up sets — here, not at the start of the session")).toBeInTheDocument();
    expect(screen.getByText("40% × 3")).toBeInTheDocument();
  });

  it("puts THE EASY HOUR on the weekend, once, ticked from either day", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    expect(await screen.findByText("The easy hour")).toBeInTheDocument();
    expect(screen.getByText("30–40 MIN · NOSE ONLY · ONCE A WEEKEND")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Tick The easy hour"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w1-easyhour"].ok).toBe(true));

    // ticking it on Saturday clears Sunday too
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await screen.findByLabelText("Untick The easy hour")).toBeInTheDocument();

    // and it is a weekend item only
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    await waitFor(() => expect(screen.queryByText("The easy hour")).not.toBeInTheDocument());
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

  it("leaves the Friday page a sleep day with nothing to run", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "FRI" }));
    expect(await screen.findByText("SLEEP")).toBeInTheDocument();
    expect(screen.queryByLabelText("Tick Warm-up")).not.toBeInTheDocument();
    // the engine safeguard is a paragraph, so it lives on PLAN
    expect(screen.queryByText(/The safeguard, written down/)).not.toBeInTheDocument();
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

  /* ================================================================
     THE MEASUREMENT LAYER
     ================================================================ */

  /* a settled week of mornings behind today, so today has a baseline
     and a seven-day average to be read against */
  const seedMornings = (rhr, hrv) => {
    const m = {};
    for (let i = 7; i >= 1; i--) {
      const d = new Date(2026, 8, 9 - i);
      const iso = d.getFullYear() + "-0" + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate();
      m[iso] = { rhr: String(rhr), hrv: String(hrv), sleep: "8", lights: "21:30" };
    }
    localStorage.setItem("o8s-morning", JSON.stringify(m));
    return m;
  };

  it("takes the morning numbers before the daily check and flags the check yellow", async () => {
    seedMornings(50, 80);
    await mount();

    expect(await screen.findByText("THE MORNING NUMBERS")).toBeInTheDocument();
    expect(screen.getByText("FROM THE CHEST STRAP")).toBeInTheDocument();
    expect(screen.getByText("Resting heart rate")).toBeInTheDocument();
    expect(screen.getByText("HRV")).toBeInTheDocument();

    // resting heart rate 6 over the week-1 baseline of 50 is a yellow on its own
    fireEvent.change(screen.getByPlaceholderText("bpm"), { target: { value: "56" } });

    // the number is read against its own seven-day average and against week 1,
    // and nothing on the screen explains the rule
    expect(await screen.findByText(/7-DAY AVG/)).toBeInTheDocument();
    expect(screen.getAllByText(/WEEK 1/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/flags the check yellow/)).not.toBeInTheDocument();
    expect(screen.queryByText("YELLOW FLAG ON TODAY'S CHECK")).not.toBeInTheDocument();

    // HRV under its seven-day average too
    fireEvent.change(screen.getByPlaceholderText("ms"), { target: { value: "65" } });

    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-morning"))["2026-09-09"].rhr).toBe("56"));
  });

  it("keeps the morning numbers on every day of the week, not only on today", async () => {
    seedMornings(50, 80);
    await mount();

    // today (Wednesday) — the card is there, on its own date
    expect(await screen.findByText("THE MORNING NUMBERS")).toBeInTheDocument();
    expect(screen.getByText("FROM THE CHEST STRAP")).toBeInTheDocument();

    // tap back to Monday: the card stays, carrying Monday's own morning
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    expect(await screen.findByText("THE MORNING NUMBERS")).toBeInTheDocument();
    expect(screen.getByText(/MON,? 7 SEPT?/)).toBeInTheDocument();
    // Monday's seeded resting heart rate, not Wednesday's
    expect(screen.getByPlaceholderText("bpm").value).toBe("50");

    // a morning missed on the day can be filled in after it, against Monday's date
    fireEvent.change(screen.getByPlaceholderText("bpm"), { target: { value: "57" } });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-morning"))["2026-09-07"].rhr).toBe("57"));

    // a day still ahead has its morning too — it opens every day
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    fireEvent.click(await screen.findByText("Resting heart rate and HRV"));
    expect(await screen.findByText("THE MORNING NUMBERS")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("bpm").value).toBe("");
  });

  it("computes the drop on the 60-second settle and logs it", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("The 60-Second Settle"));

    expect(await screen.findByText("Recovery heart rate — the drop over the settle")).toBeInTheDocument();
    expect(screen.getByText("HR at the end of the last interval")).toBeInTheDocument();
    expect(screen.getByText("Heart rate at 60 seconds")).toBeInTheDocument();

    const panel = screen.getByText("Recovery heart rate — the drop over the settle").parentElement;
    const hr = within(panel).getAllByPlaceholderText("bpm");
    expect(hr.length).toBe(2);
    fireEvent.change(hr[0], { target: { value: "172" } });
    fireEvent.change(hr[1], { target: { value: "138" } });

    expect(await screen.findByText("THE DROP")).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getByText("excellent")).toBeInTheDocument();

    // the drop is written into the log, so it charts and exports like everything else
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w1-tue-settle_drop"].w).toBe("34"));
  });

  it("puts an output field on every interval of a conditioning session, in the unit from settings", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("4-MINUTE INTERVALS"));

    // week 1's Tuesday is the four-minute intervals: four intervals, four fields
    expect(await screen.findByText("Output, interval by interval — W each")).toBeInTheDocument();
    ["INT 1", "INT 2", "INT 3", "INT 4"].forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
    const f = screen.getAllByPlaceholderText("W");
    expect(f.length).toBe(4);
    fireEvent.change(f[0], { target: { value: "300" } });
    fireEvent.change(f[1], { target: { value: "290" } });
    expect(await screen.findByText("590")).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w1-tue-cond_erg"].v[0]).toBe("300"));
  });

  it("computes the simulation's fade from rounds one and six on a scored week", async () => {
    await mount({ start: "2026-08-17" });                 // week 4 — a scored week
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await findHead("Fight Simulation"));

    expect(await screen.findByText("Round output — W each")).toBeInTheDocument();
    const f = screen.getAllByPlaceholderText("W");
    expect(f.length).toBe(6);
    fireEvent.change(f[0], { target: { value: "100" } });
    fireEvent.change(f[5], { target: { value: "90" } });

    expect(await screen.findByText("THE FADE — ROUND 6 AGAINST ROUND 1 · SCORED WEEK")).toBeInTheDocument();
    expect(screen.getByText(/90%/)).toBeInTheDocument();
    // and it fills the two round figures the rest of the app already reads
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w4-sun-fs_rd1"].w).toBe("100"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w4-sun-fs_rd6"].w).toBe("90"));
  });

  it("shows the easy zone on the easy hour once the 20-minute test's peak is logged", async () => {
    localStorage.setItem("o8s-log", JSON.stringify({ "m1w1-sun-bike20hr": { w: "180" } }));
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    fireEvent.click(await screen.findByText("The easy hour"));

    expect(await screen.findByText("The easy zone — 65–75% of your peak heart rate")).toBeInTheDocument();
    expect(screen.getByText("117–135")).toBeInTheDocument();

    const zone = screen.getByText("The easy zone — 65–75% of your peak heart rate").parentElement;
    fireEvent.change(within(zone).getByPlaceholderText("bpm"), { target: { value: "150" } });
    expect(await screen.findByText("OVER THE ZONE")).toBeInTheDocument();
  });

  it("offers bar speed on the top set of the four bars, and nowhere else", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await findHead("Bench Press"));
    expect(await screen.findByText("Bar speed — top set (m/s) · optional")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("m/s"), { target: { value: "0.42" } });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w1-mon-bench"].bs).toBe("0.42"));

    // the ring dips are not one of the four bars
    fireEvent.click(head("Ring Dips"));
    await waitFor(() => expect(screen.queryByPlaceholderText("m/s")).not.toBeInTheDocument());
  });

  it("fills the weekly check's sleep averages from the mornings", async () => {
    seedMornings(50, 80);
    await mount({ start: "2026-09-07" });
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await screen.findByText("Weekly Check"));

    expect(await screen.findByText("Sleep — filled from this week's mornings")).toBeInTheDocument();
    expect(screen.getByText(/lights out 21:30/)).toBeInTheDocument();
  });

  it("puts the dashboard at the top of TRACK, with the photos beside it", async () => {
    seedMornings(50, 80);
    localStorage.setItem("o8s-log", JSON.stringify({ "m1w1-sun-bike20": { w: "5200" }, "m1w1-sun-bike20hr": { w: "180" } }));
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "TRACK" }));

    expect(await screen.findByText("The dashboard — the seven numbers")).toBeInTheDocument();
    expect(screen.getByText("Fade — round six against round one")).toBeInTheDocument();
    expect(screen.getByText("20-minute test — distance")).toBeInTheDocument();
    expect(screen.getByText("Burst decrement — first against last")).toBeInTheDocument();
    expect(screen.getByText("Recovery heart rate — the 60-second drop")).toBeInTheDocument();
    expect(screen.getByText("Resting heart rate")).toBeInTheDocument();
    expect(screen.getByText("HRV")).toBeInTheDocument();
    expect(screen.getByText("Bodyweight")).toBeInTheDocument();
    expect(screen.getByText("Waist")).toBeInTheDocument();
    expect(screen.getByText("5200")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PHOTOS" }));
    expect(await screen.findByText("Photos — the Sunday of weeks 1, 5, 9 and 13")).toBeInTheDocument();
    expect(screen.getByText(/never leave the phone/)).toBeInTheDocument();
    expect(screen.getByLabelText("Add the front photo")).toBeInTheDocument();
    expect(screen.getByLabelText("Add the side photo")).toBeInTheDocument();
    expect(screen.getByLabelText("Add the back photo")).toBeInTheDocument();
  });

  it("shows the camp's targets beside the dashboard's numbers in Camp Mode", async () => {
    await mount({ camp: true, campStart: "2026-09-21" });
    fireEvent.click(screen.getByRole("button", { name: "TRACK" }));

    expect(await screen.findByText("The dashboard — the seven numbers, against the camp's targets")).toBeInTheDocument();
    expect(screen.getByText("CAMP TARGET · 8–12 POINTS BETTER THAN WEEK 2")).toBeInTheDocument();
    expect(screen.getByText("CAMP TARGET · +8–10% ON WEEK 1")).toBeInTheDocument();
    expect(screen.getByText("CAMP TARGET · THE DECREMENT HALVED")).toBeInTheDocument();
    expect(screen.getByText("CAMP TARGET · DOWN 4–8 BEATS")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PHOTOS" }));
    expect(await screen.findByText("Photos — the Sunday of camp weeks 1, 6 and 11")).toBeInTheDocument();
  });

  it("recalibrates the baseline and sets the erg unit from settings", async () => {
    seedMornings(50, 80);
    await mount();
    fireEvent.click(screen.getByLabelText("Settings"));

    expect(await screen.findByText("The morning numbers — the baseline")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "RECALIBRATE BASELINE" }));
    expect(await screen.findByText(/Baseline set from the last 7 days/)).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).base.rhr).toBe(50));

    fireEvent.click(screen.getByRole("button", { name: "METRES" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).ergUnit).toBe("m"));
  });

  it("paces Monday's base off the 20-minute test's peak, and gives the test its own splits", async () => {
    // camp week 2: Monday's base exists, and week 1's Sunday test has been logged
    localStorage.setItem("o8s-log", JSON.stringify({ "mCw1-sun-c_bike20": { w: "5200" }, "mCw1-sun-c_bike20hr": { w: "184" } }));
    await mount({ camp: true, campStart: "2026-09-01" });      // today (9 Sep) is camp week 2
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await findHead("Easy, nose only"));

    expect(await screen.findByText("The easy zone — 65–75% of your peak heart rate")).toBeInTheDocument();
    expect(screen.getByText("120–138")).toBeInTheDocument();
    expect(screen.getByText("Average heart rate")).toBeInTheDocument();
    const zone = screen.getByText("The easy zone — 65–75% of your peak heart rate").parentElement;
    fireEvent.change(within(zone).getByPlaceholderText("bpm"), { target: { value: "128" } });
    expect(await screen.findByText("IN THE ZONE")).toBeInTheDocument();

    // and the 20-minute test itself logs four five-minute splits
    cleanup();
    await mount({ camp: true, campStart: "2026-09-08" });      // camp week 1, which carries the test
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await findHead("The 20-Minute Test"));
    expect(await screen.findByText("Five-minute splits — W each")).toBeInTheDocument();
    ["MIN 1–5", "MIN 6–10", "MIN 11–15", "MIN 16–20"].forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
  });

  it("shows the bar speed beside the fast-bar prompt", async () => {
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100 }));
    localStorage.setItem("o8s-log", JSON.stringify({
      "m1w1-mon-bench": { bs: "0.41", sets: [{ ok: true, w: "75", r: "6" }, { ok: true, w: "75", r: "6" }, { ok: true, w: "75", r: "6" }, { ok: true, w: "75", r: "6" }] },
    }));
    await mount({ start: "2026-09-07" });
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await findHead("Bench Press"));

    expect(await screen.findByText("The fast-bar rule · once per lift per week")).toBeInTheDocument();
    expect(screen.getByText(/BAR SPEED/)).toBeInTheDocument();
    expect(screen.getByText("0.41")).toBeInTheDocument();
  });

  it("carries the new data through export and import", async () => {
    seedMornings(50, 80);
    localStorage.setItem("o8s-photos", JSON.stringify({ "2026-09-06": { front: "data:image/jpeg;base64,AAA" } }));
    await mount();
    fireEvent.click(screen.getByLabelText("Settings"));
    fireEvent.click(await screen.findByRole("button", { name: "EXPORT" }));

    const box = await screen.findByPlaceholderText("Paste a backup here, then tap load");
    await waitFor(() => expect(box.value.length).toBeGreaterThan(10));
    const d = JSON.parse(box.value);
    expect(d.morning["2026-09-02"].rhr).toBe("50");
    expect(d.photos["2026-09-06"].front).toBe("data:image/jpeg;base64,AAA");
    expect("fuel" in d).toBe(true);
  });

  /* ================================================================
     THE PRESENTATION RULES — TODAY and every session page is a running
     order. No rationale, no history, no conditions stated as conditions.
     The documents' full text lives on the PLAN tab and nowhere else.
     ================================================================ */

  /* The strings that betray a paragraph that belongs on PLAN. */
  const BANNED = ["stays", "if you", "your call", "not on the clock", "the thinking", "why"];
  const scan = (where) => {
    const txt = (document.body.textContent || "").toLowerCase();
    const hit = BANNED.filter((s) => txt.indexOf(s) >= 0);
    if (hit.length) throw new Error(where + " still says: " + hit.map((s) => s + " → …" + txt.slice(Math.max(0, txt.indexOf(s) - 70), txt.indexOf(s) + 70) + "…").join(" | "));
  };

  /* The flow, swept: every item is listed once, only the item you are on
     is open, and the lines behind each one are scanned as it opens. */
  const dupesIn = (arr) => { const seen = {}, out = []; arr.forEach((x) => { if (seen[x]) out.push(x); seen[x] = 1; }); return out; };
  const flowRows = () => Array.from(document.querySelectorAll("[data-flow-id]"));
  const runTimers = () => Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.trim() === "START").length;
  const sweepDay = (where) => {
    scan(where);
    const rows = flowRows();
    if (!rows.length) throw new Error(where + " has no flow on it");
    const ids = dupesIn(rows.map((r) => r.getAttribute("data-flow-id")));
    const names = dupesIn(rows.map((r) => r.getAttribute("data-flow-name")));
    if (ids.length) throw new Error(where + " lists an item twice: " + ids.join(", "));
    if (names.length) throw new Error(where + " lists a row twice: " + names.join(", "));
    for (let i = 0; i < rows.length; i++) {
      const row = flowRows()[i];
      if (!row) break;
      fireEvent.click(row.children[1]);
      const open = document.querySelectorAll("[data-flow-open='1']");
      if (open.length !== 1) throw new Error(where + " has " + open.length + " items open at once");
      if (runTimers() > 1) throw new Error(where + " shows two running timers");
      const loaded = Array.from(document.querySelectorAll("[data-set-mode='bw']"))
        .filter((el) => el.querySelectorAll("input[placeholder='kg'], input[placeholder='+kg']").length)
        .map((el) => el.getAttribute("data-set-id"));
      if (loaded.length) throw new Error(where + " asks for a weight on bodyweight work: " + loaded.join(", "));
      scan(where + " · item open");
    }
  };

  /* Monday of the week that makes `w` the current week, counting back
     from the fixed Wednesday the suite runs on. */
  const weekStart = (w) => {
    const d = new Date(2026, 8, 7 - (w - 1) * 7);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const DAYNAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  it("keeps every Optimal 8 Fighter day a running order, week by week", async () => {
    for (let w = 1; w <= 16; w++) {
      await mount({ start: weekStart(w) });
      for (const d of DAYNAMES) {
        fireEvent.click(screen.getByRole("button", { name: d }));
        await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
        sweepDay("Fighter week " + w + " " + d);
      }
      cleanup();
    }
  }, 900000);

  it("keeps every Camp Mode day a running order, on both paths", async () => {
    for (const fight of [false, true]) {
      for (let w = 1; w <= 12; w++) {
        await mount({ camp: true, campFight: fight, campStart: weekStart(w) });
        for (const d of DAYNAMES) {
          fireEvent.click(screen.getByRole("button", { name: d }));
          await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
          sweepDay("Camp week " + w + " " + d + (fight ? " (fight)" : " (no fight)"));
        }
        cleanup();
      }
    }
  }, 900000);

  it("keeps every PREP day a running order, week by week", async () => {
    for (let w = 1; w <= 16; w++) {
      await mount({ program: "prep", start: weekStart(w) });
      for (const d of DAYNAMES) {
        fireEvent.click(screen.getByRole("button", { name: d }));
        await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
        sweepDay("PREP week " + w + " " + d);
      }
      cleanup();
    }
  }, 900000);

  it("keeps a fight-dated PREP and the two easy weeks clean too", async () => {
    await mount({ program: "prep", fightDate: "2026-12-19", start: weekStart(3) });
    for (const d of DAYNAMES) {
      fireEvent.click(screen.getByRole("button", { name: d }));
      await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
      sweepDay("Dated PREP " + d);
    }
    cleanup();
    await mount({ program: "transition", fightDate: "2026-09-05", start: weekStart(1) });
    for (const d of DAYNAMES) {
      fireEvent.click(screen.getByRole("button", { name: d }));
      await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
      sweepDay("Transition " + d);
    }
  }, 600000);

  it("keeps the last ten days and an easy week clean too", async () => {
    await mount({ start: weekStart(16), lastTen: true });
    for (const d of DAYNAMES) {
      fireEvent.click(screen.getByRole("button", { name: d }));
      await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
      sweepDay("Last ten days " + d);
    }
    cleanup();
    await mount({ start: weekStart(5) });
    sweepDay("Easy week");
  }, 600000);

  it("writes the session as numbered steps with a clock time, a prescription and a rest", async () => {
    await mount({ start: weekStart(1) });
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    await findHead("Bench Press");

    // the steps are numbered down the whole flow, the morning's five first
    expect(screen.getByLabelText("Tick Warm-up").textContent).toBe("6");
    expect(screen.getByLabelText("Tick Bench Press")).toBeInTheDocument();

    // a 3am session opens at 03:00 and each step carries the clock
    expect(screen.getByText("03:00")).toBeInTheDocument();
    expect(screen.getByText("03:08")).toBeInTheDocument();

    // the row carries the prescription and the rest, and nothing else
    expect(screen.getByText("4 × 6 · 75% · Rest 2:00")).toBeInTheDocument();

    // the how opens only on a tap
    expect(screen.queryByText(/Pins at chest height/)).not.toBeInTheDocument();
    fireEvent.click(head("Bench Press"));
    fireEvent.click(await screen.findByText("Bench press"));
    expect(await screen.findByText(/Pins at chest height/)).toBeInTheDocument();
  });

  /* ================================================================
     THE MORNING — the same five items, every program, every day

     This is one shared flow, so the morning cannot differ by mode. The
     sweep below is what holds it to that.
     ================================================================ */

  const PROGRAMS = [
    ["OPTIMAL 8 FIGHTER", {}],
    ["CAMP", { camp: true, program: "camp", campStart: "2026-09-07" }],
    ["PREP", { program: "prep", start: "2026-09-07" }],
    ["TRANSITION", { program: "transition", fightDate: "2026-08-29" }],
  ];
  const MORNING_IDS = ["m-numbers", "m-sighs", "m-onething", "m-five", "m-check"];
  const flowIds = () => Array.from(document.querySelectorAll("[data-flow-id]")).map((e) => e.getAttribute("data-flow-id"));

  it("opens every day of every program with the morning, before the session", async () => {
    seedMornings(50, 80);         // a settled week behind today, to read the numbers against
    for (const [name, extra] of PROGRAMS) {
      await mount(extra);
      // a weekday, the Friday with no session on it, and both weekend days
      for (const d of ["MON", "WED", "FRI", "SAT", "SUN"]) {
        const where = name + " " + d;
        fireEvent.click(screen.getByRole("button", { name: d }));
        await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());

        const ids = flowIds();
        // the five morning items are all there, in order
        expect(ids.slice(0, 5), where + " does not open with the morning: " + ids.slice(0, 6).join(", ")).toEqual(MORNING_IDS);
        // and every one of them is above the first session row
        const firstSession = ids.findIndex((x) => /^S:/.test(x));
        expect(firstSession, where + " has no session rows").toBeGreaterThan(0);
        MORNING_IDS.forEach((m) => expect(ids.indexOf(m), where + " lost " + m).toBeLessThan(firstSession));

        // the two heart-rate fields are on the first item, which opens the day
        fireEvent.click(screen.getByText("Resting heart rate and HRV"));
        expect(screen.getByText("Resting heart rate"), where).toBeInTheDocument();
        expect(screen.getByText("HRV"), where).toBeInTheDocument();
        expect(screen.getByPlaceholderText("ms"), where).toBeInTheDocument();

        // a number typed in is read against the week-1 baseline and the
        // seven-day average, and it feeds the colour
        fireEvent.change(screen.getByPlaceholderText("bpm"), { target: { value: "58" } });
        expect(screen.getAllByText(/7-DAY AVG/).length, where).toBeGreaterThan(0);
        expect(screen.getAllByText(/WEEK 1/).length, where).toBeGreaterThan(0);

        // the check is four yes/no taps, and the rate over baseline has
        // already resolved the day before a single one of them is tapped
        fireEvent.click(screen.getByText("The check"));
        expect(screen.getAllByRole("button", { name: "YES" }).length, where).toBe(4);
        expect(screen.getAllByRole("button", { name: "NO" }).length, where).toBe(4);
        const line = screen.getByText(/^(GREEN|YELLOW|RED) —/);
        expect(line, where + " shows no result line").toBeInTheDocument();
        // and it is the numbers that did it, with the reason under it
        expect(line.textContent, where).not.toMatch(/^GREEN/);
        expect(screen.getByText(/resting heart rate \d+ over baseline/), where).toBeInTheDocument();
        // four noes cannot talk it back down: the numbers stand on their own
        screen.getAllByRole("button", { name: "NO" }).forEach((b) => fireEvent.click(b));
        expect(screen.getByText(/^(YELLOW|RED) —/), where).toBeInTheDocument();

        // and the rest of the day is below it
        ["site", "lunch", "ev-range", "ev-sit", "ev-review", "ev-casein", "ev-lights"]
          .forEach((x) => expect(ids.indexOf(x), where + " lost " + x).toBeGreaterThan(0));
      }
      cleanup();
    }
  }, 300000);

  it("puts the settle and its recovery heart rate inside every interval session", async () => {
    /* [program, day, the conditioning row it follows] */
    const sessions = [
      ["OPTIMAL 8 FIGHTER", {}, "TUE", "4-MINUTE INTERVALS"],
      ["OPTIMAL 8 FIGHTER", {}, "THU", "40-SECOND REPEATS"],
      ["CAMP", { camp: true, program: "camp", campStart: "2026-09-07" }, "TUE", "MODERATE INTERVALS"],
      ["CAMP", { camp: true, program: "camp", campStart: "2026-09-07" }, "THU", "TEMPO INTERVALS"],
      ["PREP", { program: "prep", start: "2026-09-07" }, "TUE", "MODERATE INTERVALS"],
      ["PREP", { program: "prep", start: "2026-09-07" }, "THU", "TEMPO INTERVALS"],
    ];
    for (const [name, extra, d, engine] of sessions) {
      const where = name + " " + d;
      await mount(extra);
      fireEvent.click(screen.getByRole("button", { name: d }));
      await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());

      const ids = flowIds();
      const names = Array.from(document.querySelectorAll("[data-flow-id]")).map((e) => e.getAttribute("data-flow-name"));
      // exactly one settle, and it comes straight after the last interval
      const settles = names.filter((n) => n === "The 60-Second Settle");
      expect(settles.length, where + " has " + settles.length + " settles").toBe(1);
      expect(names.indexOf("The 60-Second Settle"), where).toBe(names.indexOf(engine) + 1);

      // and it carries the heart rate at 60 seconds
      fireEvent.click(screen.getByText("The 60-Second Settle"));
      expect(await screen.findByText("Recovery heart rate — the drop over the settle"), where).toBeInTheDocument();
      expect(screen.getByText("HR at the end of the last interval"), where).toBeInTheDocument();
      expect(screen.getByText("Heart rate at 60 seconds"), where).toBeInTheDocument();
      cleanup();
    }
  }, 300000);

  /* ================================================================
     THE SEASON — one fight date dates everything
     ================================================================ */

  const season = async (extra) => {
    await mount(extra);
    fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
    fireEvent.click(await screen.findByRole("button", { name: "THE SEASON" }));
  };

  it("moves camp day one from settings, and reads a mid-week date back to its Monday", async () => {
    await mount({ camp: true, program: "camp", campStart: "2026-09-07", start: "2026-08-31" });
    fireEvent.click(screen.getByLabelText("Settings"));
    const lab = await screen.findByText("Camp day one — the Monday week 1 starts on");
    const field = lab.parentElement.querySelector("input");
    expect(field.value).toBe("2026-09-07");
    fireEvent.change(field, { target: { value: "2026-09-30" } });     // a Wednesday
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).campStart).toBe("2026-09-28"));
  });

  it("hands camp day one to the fight date when there is one", async () => {
    await mount({ camp: true, program: "camp", fightDate: "2027-03-13" });
    fireEvent.click(screen.getByLabelText("Settings"));
    const lab = await screen.findByText("Camp day one — the Monday week 1 starts on");
    // it is shown, not typed into, and it says where it comes from
    expect(lab.parentElement.querySelector("input")).toBeNull();
    expect(within(lab.parentElement).getByText(/Mon,? 4 Jan/)).toBeInTheDocument();
    expect(screen.getByText(/Move the fight date to move camp day one/)).toBeInTheDocument();
  });

  it("dates the season backwards from the fight", async () => {
    await season({ program: "prep", fightDate: "2027-03-13", start: "2026-09-28" });

    expect(await screen.findByText(/FIGHT · SAT,? 13 MAR/i)).toBeInTheDocument();
    // prep hands over on the Saturday before the camp, and the camp is the ten weeks to the fight
    expect(screen.getByText(/Prep ends \w{3},? 2 Jan/)).toBeInTheDocument();
    expect(screen.getByText(/camp starts \w{3},? 4 Jan/)).toBeInTheDocument();
    expect(screen.getByText(/14 prep weeks/)).toBeInTheDocument();

    // the whole plan is on the strip: prep, test day, camp, fight, the two easy weeks
    expect(screen.getByText("PREP WK 1")).toBeInTheDocument();
    expect(screen.getByText("PREP WK 14")).toBeInTheDocument();
    expect(screen.getByText("TEST DAY")).toBeInTheDocument();
    expect(screen.getByText("CAMP WK 1")).toBeInTheDocument();
    expect(screen.getByText("FIGHT")).toBeInTheDocument();
    expect(screen.getByText("TRANSITION WK 2")).toBeInTheDocument();
  });

  it("truncates PREP from the front when there is less room", async () => {
    // ten weeks of room instead of fourteen
    await season({ program: "prep", fightDate: "2027-03-13", start: "2026-10-26" });
    expect(await screen.findByText(/10 prep weeks/)).toBeInTheDocument();
    expect(screen.getByText(/the first 4 of the calendar cut from the front/)).toBeInTheDocument();
    expect(screen.getByText("PREP WK 10")).toBeInTheDocument();
    expect(screen.queryByText("PREP WK 11")).not.toBeInTheDocument();
  });

  it("runs PREP in its sixteen-week form with no fight date", async () => {
    await season({ program: "prep" });
    expect(await screen.findByText("NO FIGHT DATE")).toBeInTheDocument();
    expect(screen.getByText("PREP WK 16")).toBeInTheDocument();
    expect(screen.queryByText("PREP WK 17")).not.toBeInTheDocument();
    // the blocks the sixteen-week form names
    ["ACCUMULATE", "INTENSIFY", "CONVERT", "TEST WEEK"].forEach((n) => expect(screen.getAllByText(n).length).toBeGreaterThan(0));
  });

  it("re-dates the season when the fight date moves, and says which weeks changed", async () => {
    await season({ program: "prep", fightDate: "2027-03-20", prevFight: "2027-03-13", start: "2026-09-28" });
    expect(await screen.findByText(/The date moved/i)).toBeInTheDocument();
    expect(screen.getByText(/weeks changed/)).toBeInTheDocument();
    expect(screen.getByText(/camp starts \w{3},? 11 Jan/)).toBeInTheDocument();
  });

  /* ================================================================
     ONE PROGRAM SELECTOR — the header, TODAY, WEEK, TRACK, PLAN and the
     timers all read the program that is switched on
     ================================================================ */

  it("switches the whole app to PREP from settings, dated from the fight", async () => {
    vi.setSystemTime(new Date(2026, 8, 30, 9, 0, 0));   // Wednesday 30 September 2026
    await mount({ start: "2026-09-28" });
    await waitFor(() => expect(title()).toBe("OPTIMAL 8 FIGHTER · WEEK 1"));

    // select PREP, with a fight date of Saturday 13 March 2027
    fireEvent.click(screen.getByLabelText("Settings"));
    const lab = await screen.findByText("Fight date — optional");
    fireEvent.change(lab.parentElement.querySelector("input[type=date]"), { target: { value: "2027-03-13" } });
    fireEvent.click(screen.getByRole("button", { name: "PREP" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings"))).toMatchObject({ program: "prep", camp: false, fightDate: "2027-03-13" }));
    fireEvent.click(screen.getByRole("button", { name: "CLOSE" }));

    // the header reads the program, the week and the block
    await waitFor(() => expect(title()).toBe("OPTIMAL 8 · PREP · WEEK 1 · ACCUMULATE"));
    expect(title()).not.toMatch(/FIGHTER/);

    // Wednesday of week 1: the trap bar with the five-second lowering cue
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    fireEvent.click(await findHead("Trap Bar Deadlift"));
    expect(await screen.findByText("SLOW LOWERING · 5 s down")).toBeInTheDocument();
    expect(screen.getAllByText("3 × 5 @ 70%").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText("Trap bar deadlift"));
    expect(await screen.findByText(/lower the bar to the floor over a full five seconds/i)).toBeInTheDocument();
    // the day's own chip carries the same line as the header
    expect(screen.getAllByText("OPTIMAL 8 · PREP · WEEK 1 · ACCUMULATE").length).toBeGreaterThan(1);

    // Monday of week 1: the 45-minute base, and its timer runs 45 minutes
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    expect(screen.queryByText("Upper Strength + Power Dose + Rings")).not.toBeInTheDocument();
    fireEvent.click(await findHead("Base — easy, nose only"));
    expect((await screen.findAllByText("45 min at 65–75% of peak")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "▶ START BASE" }));
    expect(await screen.findByText("EASY — NOSE ONLY · 65–75% OF PEAK")).toBeInTheDocument();
    expect(screen.getAllByText("45:00").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "CLOSE TIMER" }));

    // WEEK reads the same program and its dates, never a Fighter macrocycle
    fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
    expect(await screen.findByText(/^OPTIMAL 8 · PREP · Mon,? 28 Sep/)).toBeInTheDocument();
    expect(screen.queryByText(/MACROCYCLE/)).not.toBeInTheDocument();
    expect(screen.getByText("Monday base").nextSibling.textContent).toBe("45 min");

    // and the calendar: test day on Saturday 2 January, the camp from Monday 4 January
    fireEvent.click(screen.getByRole("button", { name: "THE SEASON" }));
    const test = await screen.findByText("TEST DAY");
    expect(test.nextSibling.textContent).toMatch(/Sat,? 2 Jan/);
    const campWk1 = screen.getByText("CAMP WK 1").parentElement.nextSibling;
    expect(campWk1.textContent).toMatch(/^Mon,? 4 Jan/);
    expect(screen.getByText("PREP WK 1").parentElement.textContent).toMatch(/THIS WEEK/);

    // TRACK and PLAN carry the same line, and PLAN opens on the PREP document
    fireEvent.click(screen.getByRole("button", { name: "TRACK" }));
    expect(await screen.findByText("OPTIMAL 8 · PREP · WEEK 1 · ACCUMULATE", { selector: "div" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "PLAN" }));
    expect(await screen.findByText("OPTIMAL 8 · PREP · WEEK 1 · ACCUMULATE", { selector: "div" })).toBeInTheDocument();
  }, 60000);

  it("reads CAMP and the Fighter off the same selector, and the old camp flag with it", async () => {
    vi.setSystemTime(new Date(2026, 8, 30, 9, 0, 0));
    await mount({ program: "camp", camp: true, campStart: "2026-09-28" });
    await waitFor(() => expect(title()).toBe("CAMP · WEEK 1 · FOUNDATION"));
    cleanup();
    // settings saved before the switch existed: the camp flag alone still means CAMP
    await mount({ camp: true, program: "fighter", campStart: "2026-09-07" });
    await waitFor(() => expect(title()).toBe("CAMP · WEEK 4 · BUILD"));
    cleanup();
    await mount({ start: "2026-09-14" });
    await waitFor(() => expect(title()).toBe("OPTIMAL 8 FIGHTER · WEEK 3"));
  }, 60000);

  /* ================================================================
     PREP — the calendar drives the session
     ================================================================ */

  it("renders PREP week 3's trap bar with the slow-lowering cue", async () => {
    await mount({ program: "prep", start: "2026-08-24" });      // the fixed Wednesday is week 3
    fireEvent.click(screen.getByRole("button", { name: "WED" }));

    fireEvent.click(await findHead("Trap Bar Deadlift"));
    // the phase is on the block, and the week's own line with it
    expect(await screen.findByText("SLOW LOWERING · 5 s down")).toBeInTheDocument();
    expect(screen.getAllByText("4 × 6 @ 72%").length).toBeGreaterThan(0);
    // and the cue says what slow lowering is
    fireEvent.click(screen.getByText("Trap bar deadlift"));
    expect(await screen.findByText(/lower the bar to the floor over a full five seconds/i)).toBeInTheDocument();
  });

  it("moves the lift through its phases as the calendar says", async () => {
    const phases = [["2026-08-24", 3, "SLOW LOWERING · 5 s down"], ["2026-08-03", 6, "NORMAL TEMPO"],
      ["2026-07-27", 7, "PAUSED · 3 s hold"], ["2026-07-06", 10, "MAX SINGLE · pins set"]];
    for (const [start, , name] of phases) {
      await mount({ program: "prep", start });
      fireEvent.click(screen.getByRole("button", { name: "WED" }));
      fireEvent.click(await findHead("Trap Bar Deadlift"));
      expect(await screen.findByText(name)).toBeInTheDocument();
      cleanup();
    }
  });

  it("runs repeat sled starts in PREP week 2 and the long runs in week 3, the drive holds after either", async () => {
    const names = () => Array.from(document.querySelectorAll("[data-flow-id^='S:']")).map((e) => e.getAttribute("data-flow-name"));
    await mount({ program: "prep", start: "2026-08-31" });      // the fixed Wednesday is week 2
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    await findHead("Repeat Sled Starts");
    expect(screen.queryByText(headMatch("Heavy Sled Sprints"))).not.toBeInTheDocument();
    expect(screen.getAllByText(/^6 × 10 m/).length).toBeGreaterThan(0);
    expect(names().indexOf("Drive Holds")).toBe(names().indexOf("Repeat Sled Starts") + 1);
    cleanup();

    await mount({ program: "prep", start: "2026-08-24" });      // week 3
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    await findHead("Heavy Sled Sprints");
    expect(screen.queryByText(headMatch("Repeat Sled Starts"))).not.toBeInTheDocument();
    expect(screen.getAllByText(/^4 × 20 m/).length).toBeGreaterThan(0);
    expect(names().indexOf("Drive Holds")).toBe(names().indexOf("Heavy Sled Sprints") + 1);
  });

  it("puts PREP's stance starts on Saturday, before the flying sprints", async () => {
    await mount({ program: "prep", start: "2026-08-24" });
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    await findHead("Flying Sprints");
    const names = Array.from(document.querySelectorAll("[data-flow-id^='S:']")).map((e) => e.getAttribute("data-flow-name"));
    expect(names.indexOf("Stance Starts")).toBeGreaterThanOrEqual(0);
    expect(names.indexOf("Stance Starts") + 1).toBe(names.indexOf("Flying Sprints"));
  });

  it("puts the movement session on Wednesday and Saturday evenings in the build", async () => {
    await mount({ program: "prep", start: "2026-08-24" });
    expect(await screen.findByText("The movement session")).toBeInTheDocument();
    // and the accumulation block's carb top-up on Monday and Thursday
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    expect(await screen.findByText("Carb top-up · 17:00")).toBeInTheDocument();
  });

  /* ================================================================
     LOADING BY BAR SPEED
     ================================================================ */

  it("takes 5% off when the first work set is slower than the phase target", async () => {
    localStorage.setItem("o8s-maxes", JSON.stringify({ tbdl: 200, squat: 180, bench: 120, pp: 80 }));
    await mount({ program: "prep", start: "2026-08-24" });
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    fireEvent.click(await findHead("Trap Bar Deadlift"));

    // the trap bar's accumulation target, from the document's typical numbers
    expect(await screen.findByText("FIRST WORK SET · TARGET 0.65 M/S")).toBeInTheDocument();
    expect(screen.getByText(/RACK IT AT 20% SLOWER THAN THE FIRST REP/)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("m/s"), { target: { value: "0.55" } });
    expect(await screen.findByText("TAKE 5% OFF")).toBeInTheDocument();
    // and the remaining sets are recalculated: 72% of 200 is 145, less 5% is 137.5
    expect(screen.getByText(/at 137.5 kg/)).toBeInTheDocument();

    // on target it stays, and faster it goes up
    fireEvent.change(screen.getByPlaceholderText("m/s"), { target: { value: "0.66" } });
    expect(await screen.findByText("STAY")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("m/s"), { target: { value: "0.80" } });
    expect(await screen.findByText("ADD 2.5%")).toBeInTheDocument();
  });

  it("draws the phase targets off the profile once it has one", async () => {
    localStorage.setItem("o8s-maxes", JSON.stringify({ tbdl: 200 }));
    await mount({ program: "prep", start: "2026-08-24",
      profiles: { tbdl: { points: [{ load: 50, speed: "1.00" }, { load: 60, speed: "0.90" }, { load: 70, speed: "0.80" }, { load: 80, speed: "0.70" }, { load: 85, speed: "0.65" }] } } });
    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    fireEvent.click(await findHead("Trap Bar Deadlift"));
    // the line through those points reads 0.78 at 72%
    expect(await screen.findByText("FIRST WORK SET · TARGET 0.78 M/S")).toBeInTheDocument();
    expect(screen.getByText("from your profile")).toBeInTheDocument();
  });

  /* ================================================================
     READINESS, THE ENGINE AND THE GUIDE
     ================================================================ */

  it("turns the morning yellow on the numbers alone", async () => {
    seedMornings(50, 80);
    await mount({ program: "prep", start: "2026-08-24" });
    // resting heart rate 6 over the baseline of 50 is a yellow with no taps at all
    fireEvent.change(screen.getByPlaceholderText("bpm"), { target: { value: "56" } });
    fireEvent.click(await screen.findByText("The check"));
    expect(await screen.findByText(/^YELLOW/)).toBeInTheDocument();
    expect(screen.getByText(/resting heart rate 6 over baseline/)).toBeInTheDocument();
  });

  it("carries last time's number and the target on every conditioning row", async () => {
    localStorage.setItem("o8s-log", JSON.stringify({
      "mPw1-tue-p_e1": { w: "240", kind: "rz", d: "2026-08-25" } }));
    await mount({ program: "prep", start: "2026-08-24" });   // week 3 Tuesday runs the bursts
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("REPEAT BURSTS"));
    expect(await screen.findByText(/LAST TIME · 240/)).toBeInTheDocument();
    expect(screen.getByText("The sixteenth burst against the first. It should shrink.")).toBeInTheDocument();
  });

  it("renders the guide on its own tab, with this week at the top", async () => {
    await mount({ program: "prep", start: "2026-08-24" });
    fireEvent.click(screen.getByRole("button", { name: "GUIDE" }));

    expect(await screen.findByText(/This week is ACCUMULATE/)).toBeInTheDocument();
    expect(screen.getByText(/Tests this week: none/)).toBeInTheDocument();
    // and guide.md itself, with its contents
    expect(screen.getByText("CONTENTS")).toBeInTheDocument();
    expect(screen.getAllByText("WHAT TO DO TODAY").length).toBeGreaterThan(0);
    expect(screen.getByText(/Open the app. It shows one thing at a time/)).toBeInTheDocument();
  });

  it("names the tests on the weeks that carry them", async () => {
    await mount({ program: "prep", start: "2026-08-03" });    // the lighter week with the tests on it
    fireEvent.click(screen.getByRole("button", { name: "GUIDE" }));
    expect(await screen.findByText(/This week is ACCUMULATE/)).toBeInTheDocument();
    expect(screen.getByText(/the four range tests and the three flexibility tests/)).toBeInTheDocument();
  });

  /* ================================================================
     READABILITY
     ================================================================ */

  it("scales the whole app from the text-size setting", async () => {
    const zoomNow = () => Number(document.querySelector(".o8-root").style.getPropertyValue("--o8-zoom"));
    await mount({ textSize: "n" });
    const base = zoomNow();
    expect(base).toBeGreaterThan(0);
    cleanup();
    await mount({ textSize: "l" });
    const large = zoomNow();
    cleanup();
    await mount({ textSize: "xl" });
    const largest = zoomNow();
    // three steps, each scaling the whole app, on top of whatever the phone asks for
    expect(large / base).toBeCloseTo(1.15, 2);
    expect(largest / base).toBeCloseTo(1.32, 2);
  });

  it("keeps the flow readable and its targets big enough to hit", async () => {
    await mount({ textSize: "xl" });
    const rows = Array.from(document.querySelectorAll("[data-flow-id]"));
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((r) => {
      const tick = r.querySelector("button[aria-label^='Tick '], button[aria-label^='Untick ']");
      expect(parseFloat(tick.style.width)).toBeGreaterThanOrEqual(48);
      expect(parseFloat(tick.style.height)).toBeGreaterThanOrEqual(48);
      const name = r.children[1].children[r.children[1].children.length - 2];
      expect(parseFloat(name.style.fontSize)).toBeGreaterThanOrEqual(18);
    });
  });

  /* ================================================================
     THE SET LOGGER — bodyweight work has no weight to write down
     ================================================================ */

  /* Every logger on the page, by the mode it is in. */
  const loggers = (mode) => Array.from(document.querySelectorAll(mode ? "[data-set-mode='" + mode + "']" : "[data-set-mode]"));
  const weightFields = (el) => el.querySelectorAll("input[placeholder='kg'], input[placeholder='+kg']").length;

  it("logs bodyweight work as reps and a level, with no weight field", async () => {
    await mount({ start: weekStart(1) });
    fireEvent.click(screen.getByRole("button", { name: "MON" }));

    fireEvent.click(await findHead("Ring Dips"));
    expect(await screen.findByText("Ring dips — at your level")).toBeInTheDocument();

    const bw = loggers("bw");
    expect(bw.length).toBe(1);
    expect(weightFields(bw[0])).toBe(0);
    expect(bw[0].getAttribute("data-set-unit")).toBe("reps");
    expect(screen.getByText("AT LEVEL 1")).toBeInTheDocument();
    expect(screen.getByText("BODYWEIGHT")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Confirm set/).length).toBe(3);

    // the reps are what gets logged, and no weight goes in beside them
    fireEvent.change(screen.getAllByPlaceholderText("at your level")[0], { target: { value: "6" } });
    fireEvent.click(screen.getByLabelText("Confirm set 1"));
    await waitFor(() => {
      const e = JSON.parse(localStorage.getItem("o8s-log"))["m1w1-mon-ringdip"];
      expect(e.sets[0].r).toBe("6");
      expect("w" in e.sets[0]).toBe(false);
    });
  });

  it("logs the added load on weighted chins and the Achilles hold, beside bodyweight", async () => {
    localStorage.setItem("o8s-body", JSON.stringify([{ d: "2026-09-01", bw: "82" }]));
    await mount({ start: weekStart(1) });
    fireEvent.click(screen.getByRole("button", { name: "MON" }));

    fireEvent.click(await findHead("Weighted Chin-Up + The Muscle-Up Line"));
    expect(await screen.findByText("BODYWEIGHT 82 KG + ADDED")).toBeInTheDocument();
    expect(loggers("add").length).toBe(1);
    fireEvent.change(screen.getAllByPlaceholderText("+kg")[0], { target: { value: "15" } });
    fireEvent.click(within(loggers("add")[0]).getByLabelText("Confirm set 1"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w1-mon-chin"].sets[0].w).toBe("15"));

    // the muscle-up line, in the same block, is bodyweight and takes no load
    expect(loggers("bw").length).toBe(1);
    expect(weightFields(loggers("bw")[0])).toBe(0);
    expect(screen.queryByPlaceholderText("kg")).not.toBeInTheDocument();

    // the Achilles hold logs its 45 seconds and the load it is held with
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("Seated Calf Raise + Achilles Hold"));
    const add = await waitFor(() => { const a = loggers("add"); expect(a.length).toBe(1); return a[0]; });
    expect(add.getAttribute("data-set-unit")).toBe("s");
    expect(add.querySelectorAll("input[placeholder='+kg']").length).toBe(1);
    // the seated calf raise beside it is barbell work and keeps its weight field
    expect(loggers("kg").length).toBe(1);
    expect(weightFields(loggers("kg")[0])).toBe(3);
  });

  it("keeps the weight field on barbell, trap bar, dumbbell and sled work", async () => {
    await mount({ start: weekStart(1) });
    fireEvent.click(screen.getByRole("button", { name: "MON" }));
    fireEvent.click(await findHead("Bench Press"));
    await waitFor(() => expect(loggers("kg").length).toBe(1));
    // one weight field per set — four of them in week 1
    expect(weightFields(loggers("kg")[0])).toBe(4);

    fireEvent.click(screen.getByRole("button", { name: "WED" }));
    fireEvent.click(await findHead("Trap Bar Deadlift"));
    await waitFor(() => expect(loggers("kg").length).toBe(1));
    expect(weightFields(loggers("kg")[0])).toBeGreaterThan(0);

    // the sled is Wednesday's, and it still asks for the load it is dragging
    fireEvent.click(await findHead("Heavy Sled Sprints"));
    expect(await screen.findByText("load (kg) · time (s)")).toBeInTheDocument();
    expect(screen.getByText(/kg on the sled at/)).toBeInTheDocument();
    expect(loggers("bw").length).toBe(0);
  });

  it("logs holds in seconds, in both modes and in camp's calisthenics rows", async () => {
    await mount({ start: weekStart(1) });
    fireEvent.click(screen.getByRole("button", { name: "THU" }));
    fireEvent.click(await findHead("Spanish Squat Hold"));
    const bw = await waitFor(() => { const a = loggers("bw"); expect(a.length).toBe(1); return a[0]; });
    expect(bw.getAttribute("data-set-unit")).toBe("s");
    expect(weightFields(bw)).toBe(0);
    expect(screen.getAllByLabelText(/^Confirm set/).length).toBe(3);
    fireEvent.click(screen.getByLabelText("Confirm set 1"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-log"))["m1w1-thu-spanish"].sets[0].r).toBe("30"));

    cleanup();
    await mount({ camp: true, campStart: weekStart(1) });
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    fireEvent.click(await findHead("Core, L-Sit, Lever, Hands"));
    expect(await screen.findByText("Tuck front lever")).toBeInTheDocument();
    // the L-sit, the lever and the knuckle hold are bodyweight at their levels
    const camp = loggers("bw");
    expect(camp.length).toBe(3);
    camp.forEach((el) => expect(weightFields(el)).toBe(0));
    expect(screen.getAllByText("AT LEVEL 1").length).toBe(2);
  });

  it("opens the morning with the two strap numbers, and closes it with four yes/no taps", async () => {
    await mount();
    // the numbers are the first item, and they are already open
    expect(await screen.findByText("THE MORNING NUMBERS")).toBeInTheDocument();

    // the check is the last morning item, and the session comes after it
    const numbers = screen.getByText("Resting heart rate and HRV");
    const check = screen.getByText("The check");
    expect(numbers.compareDocumentPosition(check) & 4).toBeTruthy();
    expect(check.compareDocumentPosition(screen.getByText("WEDNESDAY")) & 4).toBeTruthy();

    // it opens on a tap: four yes/no taps, and nothing else on the screen
    fireEvent.click(check);
    expect(screen.getAllByRole("button", { name: "YES" }).length).toBe(4);
    expect(screen.getAllByRole("button", { name: "NO" }).length).toBe(4);
    expect(screen.queryByText("THE MORNING NUMBERS")).not.toBeInTheDocument();

    // four yeses resolve the day to red, and the hard steps come off the order
    screen.getAllByRole("button", { name: "YES" }).forEach((b) => fireEvent.click(b));
    expect(await screen.findByText(/^RED —/)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByLabelText(/^Tick Heavy Sled Sprints/)).not.toBeInTheDocument());
  });

  it("prescribes the same hollow block in both modes", async () => {
    for (const camp of [false, true]) {
      await mount(camp ? { camp: true, campStart: weekStart(1) } : {});
      fireEvent.click(await screen.findByText("The hollow block"));
      expect(await screen.findByText("Hollow hold")).toBeInTheDocument();
      expect(screen.getByText("Arch hold")).toBeInTheDocument();
      expect(screen.getByText("Handstand")).toBeInTheDocument();
      expect(screen.getAllByText("2 × 20 s").length).toBe(2);
      expect(screen.getByText(/4 min · level/)).toBeInTheDocument();
      cleanup();
    }
  });

  it("writes the evening as RANGE, the hollow block, the sit, the review and the light", async () => {
    await mount();
    const names = Array.from(document.querySelectorAll("[data-flow-id^='ev-']")).map((r) => r.getAttribute("data-flow-name"));
    expect(names).toEqual(["RANGE", "The hollow block", "The sit", "The review", "Casein before bed", "Lights out"]);

    // every RANGE move is its own row, with its hold time, behind the one timer
    fireEvent.click(screen.getByText("RANGE"));
    expect(await screen.findByText("OPEN BOOK · RIGHT SIDE UP")).toBeInTheDocument();
    expect(screen.getByText("DEEP SQUAT HOLD")).toBeInTheDocument();

    // the review is the three questions, on one screen
    fireEvent.click(screen.getByText("The review"));
    expect(await screen.findByText("Where did I go wrong today?")).toBeInTheDocument();
    expect(screen.getByText("What did I do well?")).toBeInTheDocument();
    expect(screen.queryByText("OPEN BOOK · RIGHT SIDE UP")).not.toBeInTheDocument();
  });

  it("finishes the day on the last item, and shows the streak", async () => {
    await mount();
    const nextBtn = () => Array.from(document.querySelectorAll("button")).find((b) => /^NEXT/.test(b.textContent.trim()));
    let guard = 0, b;
    while ((b = nextBtn()) && guard++ < 80) fireEvent.click(b);
    expect(await screen.findByText("DONE")).toBeInTheDocument();
    expect(screen.getByText(/^STREAK ·/)).toBeInTheDocument();
    expect(nextBtn()).toBeUndefined();
    // and the day counts on the streak, because the sit and the review are in it
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-imday"))["2026-09-09"].ticks.review).toBe(true));
  }, 60000);

  it("reopens where it was left", async () => {
    await mount();
    fireEvent.click(screen.getByText("The one thing"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-flow"))["m1w1-wed"]).toBe("m-onething"));

    cleanup();
    render(<App />);
    await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
    await waitFor(() => expect(document.querySelector("[data-flow-open='1']").getAttribute("data-flow-id")).toBe("m-onething"));
  });
});
