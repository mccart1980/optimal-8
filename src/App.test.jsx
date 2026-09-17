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
    await mount({ lastTen: true });
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));

    expect(await screen.findByText("Box jumps only — the last ten days")).toBeInTheDocument();
    expect(screen.getAllByText("2 sets @ 70% — fast").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Flying Sprints/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    await waitFor(() => expect(screen.queryByText("Nordic Curls")).not.toBeInTheDocument());
  });

  /* ---------------- CAMP MODE — the twelve weeks ---------------- */

  const CAMP_START = "2026-09-15";              // Tuesday 15 September 2026
  const camp = (extra) => mount(Object.assign({ camp: true, campStart: CAMP_START }, extra || {}));
  /* a is before b in the document */
  const before = (a, b) => !!(a.compareDocumentPosition(b) & 4);

  it("runs Tuesday 15 September as camp week 1, with the burst test before the intervals", async () => {
    vi.setSystemTime(new Date(2026, 8, 15, 9, 0, 0));   // Tuesday 15 September 2026
    await camp();

    // the camp's own clock, counting from its own start date
    expect(await screen.findByText("WK 1/12 · FOUNDATION")).toBeInTheDocument();
    expect(screen.getByText("TUE 15 Sep")).toBeInTheDocument();

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

  it("renders the sharpen page in week 11 when the fight is confirmed, and the test week when it isn't", async () => {
    vi.setSystemTime(new Date(2026, 10, 25, 9, 0, 0));  // Wednesday 25 November 2026, camp week 11

    await camp({ campFight: true });
    expect(await screen.findByText("WK 11/12 · THE FORK")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    expect(await findHead("THE SPEED MICRODOSE")).toBeInTheDocument();
    expect(screen.queryByText("Back Squat")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await findHead("THE FIGHT-DAY REHEARSAL")).toBeInTheDocument();

    cleanup();
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");

    await camp({ campFight: false });
    fireEvent.click(screen.getByRole("button", { name: "SAT" }));
    expect(await findHead("Back Squat")).toBeInTheDocument();
    expect(screen.queryByText("THE SPEED MICRODOSE")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "SUN" }));
    expect(await findHead("The 6 × 3 Simulation")).toBeInTheDocument();
  });

  it("runs the camp's lift phases, its conditioning types and its rounds", async () => {
    vi.setSystemTime(new Date(2026, 8, 16, 9, 0, 0));   // Wednesday 16 September 2026, camp week 1
    await camp();

    // week 1 is slow lowering, with the five-second cue on the page
    fireEvent.click(await findHead("Trap Bar Deadlift"));
    expect(await screen.findByText(/lower the bar over a full five seconds/)).toBeInTheDocument();
    expect(screen.getAllByText("3 × 5 @ 70% — SLOW LOWERING, 5 s down").length).toBeGreaterThan(0);

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
    expect(await screen.findByText((_t, el) => !!el && !el.children.length && /Every rest is THE CORNER MINUTE/.test(el.textContent || ""))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "▶ START THE ROUNDS" })).toBeInTheDocument();

    fireEvent.click(head("The Post-Max Sit"));
    expect(await screen.findByText(/heart at 170-plus, find the breath at the nostrils/)).toBeInTheDocument();
  });

  it("moves to paused, then fast, then contrast, and puts the jump circuit behind the contrast squat", async () => {
    vi.setSystemTime(new Date(2026, 10, 4, 9, 0, 0));   // Wednesday 4 November 2026, camp week 8
    await camp();

    expect(await screen.findByText("WK 8/12 · PEAK")).toBeInTheDocument();
    fireEvent.click(await findHead("Trap Bar Deadlift"));
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
    vi.setSystemTime(new Date(2026, 10, 25, 9, 0, 0));  // camp week 11
    await camp({ campFight: true });

    fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
    expect(await screen.findByText("The twelve weeks — every number, every week, with dates")).toBeInTheDocument();
    expect(screen.getByText("15–20 Sep")).toBeInTheDocument();
    expect(screen.getByText("23–29 Nov")).toBeInTheDocument();
    expect(screen.getByText("30 Nov–6 Dec")).toBeInTheDocument();

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
    vi.setSystemTime(new Date(2026, 8, 15, 9, 0, 0));
    await camp();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(await screen.findByText("Camp mode — the twelve weeks")).toBeInTheDocument();
    expect(screen.getByText("Camp day one — the Tuesday week 1 starts on")).toBeInTheDocument();
    expect(screen.getByText(/camp week 1/)).toBeInTheDocument();

    // the fork is a setting, and it rewrites weeks 11 and 12
    fireEvent.click(screen.getByRole("button", { name: "FIGHT CONFIRMED" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).campFight).toBe(true));
    expect(await screen.findByText(/week 12 is fight week/)).toBeInTheDocument();

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
    expect(screen.getByText("FROM THE CHEST STRAP · BEFORE THE DAILY CHECK")).toBeInTheDocument();
    expect(screen.getByText("Resting heart rate")).toBeInTheDocument();
    expect(screen.getByText("HRV")).toBeInTheDocument();

    // resting heart rate 6 over the week-1 baseline of 50 is a yellow on its own
    fireEvent.change(screen.getByPlaceholderText("bpm"), { target: { value: "56" } });

    expect(await screen.findByText("YELLOW FLAG ON TODAY'S CHECK")).toBeInTheDocument();
    expect(screen.getAllByText(/6 bpm over the week-1 baseline/).length).toBe(2);
    // and the daily check itself carries it
    expect(screen.getByText("THE MORNING NUMBERS FLAG THIS YELLOW")).toBeInTheDocument();
    // read against its own seven-day average and against week 1
    expect(screen.getAllByText(/7-DAY AVG/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WEEK 1/).length).toBeGreaterThan(0);

    // HRV 12%+ under its seven-day average too, and the two together suggest RED
    fireEvent.change(screen.getByPlaceholderText("ms"), { target: { value: "65" } });
    expect(await screen.findByText("BOTH FLAGS — THIS SUGGESTS RED")).toBeInTheDocument();
    expect(screen.getByText("THE MORNING NUMBERS SUGGEST RED")).toBeInTheDocument();

    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-morning"))["2026-09-09"].rhr).toBe("56"));
  });

  it("computes the drop on the 60-second settle and logs it", async () => {
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "TUE" }));
    fireEvent.click(await findHead("The 60-Second Settle"));

    expect(await screen.findByText("Recovery heart rate — the drop over the settle")).toBeInTheDocument();
    expect(screen.getByText("HR at the end of the last interval")).toBeInTheDocument();
    expect(screen.getByText("Heart rate at 60 seconds")).toBeInTheDocument();

    const hr = screen.getAllByPlaceholderText("bpm");
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

    expect(await screen.findByText("The easy zone — 65–75% of your peak heart rate")).toBeInTheDocument();
    expect(screen.getByText("117–135")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("bpm"), { target: { value: "150" } });
    expect(await screen.findByText(/Easy means easy/)).toBeInTheDocument();
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
    await mount({ camp: true, campStart: "2026-09-15" });
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
    fireEvent.change(screen.getByPlaceholderText("bpm"), { target: { value: "128" } });
    expect(await screen.findByText("In the zone.")).toBeInTheDocument();

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
});
