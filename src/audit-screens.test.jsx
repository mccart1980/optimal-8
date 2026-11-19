import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* THE AUDIT OF 19 NOVEMBER 2026 IN PREP, THE CAMP AND FIGHTER, on the
   screen. From the week of Monday 23 November 2026: the SkiErg out of the
   rounds, the rounds on the erg and the 20-minute test; the one-arm
   landmine push press in the barbell push press's place; a speed on every
   fast rep; three stance starts as the camp's Tuesday speed; a primer on
   the camp's last morning and its rehearsal's. A week before that Monday
   reads as it did. */
const MAXES = { squat: 140, bench: 100, tbdl: 180, pp: 70, cw_squat: 120, cw_tbdl: 160, cw_bench: 90, cw_pp: 60 };
const prep = (extra) => Object.assign({ start: "2026-01-05", macroBase: 1, iron: false, sound: false, autoRest: true,
  medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: "2026-01-05", rangeStart: "2026-01-05",
  camp: false, lastTen: false, taper: false, levelStart: "2026-01-05", program: "prep", v12: true }, extra || {});
/* the classic, from Monday 5 January 2026: its fourth cycle's week 1 is from 7 December 2026 */
const fighter = () => prep({ program: "fighter" });
/* the ten-week camp from Monday 4 January 2027: week 6 from 8 February, week 8 from 22 February, the rehearsal Sunday 7 March */
const camp10 = { booked: true, fight: "2027-03-13", rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "good", emphasis: "none" };
const ten = () => prep({ program: "prep", plans: [{ from: "2027-01-04", made: "2026-12-31", inputs: camp10 }], season: camp10, fightDate: "2027-03-13" });
/* the same camp before the switch: from Monday 2 March 2026 to Saturday 9 May */
const old10 = Object.assign({}, camp10, { fight: "2026-05-09" });
const tenOld = () => prep({ program: "prep", plans: [{ from: "2026-03-02", made: "2026-02-27", inputs: old10 }], season: old10, fightDate: "2026-05-09" });
/* Prep's cycle from Monday 30 November 2026: every week of it after the switch */
const cyc = { booked: false, classic: false, fitness: "good", rounds: 6, mins: 3, rest: 60, weighIn: "before", emphasis: "none" };
const prepLate = () => prep({ program: "prep", plans: [{ from: "2026-11-30", made: "2026-11-29", inputs: cyc }], season: cyc });

const FAST = "SPLEEFT ON YOUR WRIST: READ THE SPEED AFTER EVERY REP. A REP 10% SLOWER THAN THE SET'S FASTEST ENDS THE SET.";
const ARM = "SPLEEFT READS THE ARM THE WATCH IS ON: THAT SIDE FIRST, THE SPEED READ AFTER EVERY REP. A REP 10% SLOWER THAN THE SET'S FASTEST ENDS THE SET, AND THE OTHER SIDE DOES THE SAME REPS.";
const T20 = "Five easy minutes, then as much distance as you can in 20 minutes on your usual bike. Log the distance and the highest heart rate you saw.";

async function at(y, m, d, st) {
  vi.setSystemTime(new Date(y, m - 1, d, 6, 0, 0));
  localStorage.setItem("o8s-settings", JSON.stringify(st));
  localStorage.setItem("o8s-maxes", JSON.stringify(MAXES));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
/* another day in the same test */
const again = () => { cleanup(); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); };
/* the whole day, every chapter open: the rows' names in order */
function wholeDay() {
  if (!screen.queryByTestId("whole-day")) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  for (let k = 0; k < 8; k++) { const b = document.querySelector("[data-chapter] [aria-expanded=false]"); if (!b) break; fireEvent.click(b); }
  return [...document.querySelectorAll("[data-flow-name]")].map((e) => e.getAttribute("data-flow-name"));
}
/* make one row the NOW card */
function pick(name) {
  wholeDay();
  const row = [...document.querySelectorAll("[data-flow-name]")].find((e) => e.getAttribute("data-flow-name") === name);
  if (!row) throw new Error("no row " + name + " in " + wholeDay().join(" | "));
  fireEvent.click(row.querySelectorAll("button")[1]);
  return screen.getByTestId("now-card");
}
const card = () => screen.getByTestId("now-card");
const pres = () => within(card()).getAllByTestId("card-pres").map((e) => e.textContent);
const lib = () => within(card()).getAllByTestId("card-lib").map((e) => e.textContent);
const tid = (id) => { const e = within(card()).queryByTestId(id); return e ? e.textContent : null; };
const boxes = () => [...card().querySelectorAll("input")].map((i) => (i.closest("label") ? i.closest("label").firstChild.textContent : null));
const type = (label, value) => fireEvent.change(within(card()).getByLabelText(label), { target: { value } });
const val = (label) => within(card()).getByLabelText(label).value;
const log = () => JSON.parse(localStorage.getItem("o8s-log") || "{}");
const entry = (re) => { const l = log(); const k = Object.keys(l).find((x) => re.test(x)); return k ? l[k] : undefined; };
/* a row's clock time, as the whole day shows it */
const clock = (name) => { const e = [...document.querySelectorAll("[data-flow-name]")].find((x) => x.getAttribute("data-flow-name") === name); return e ? e.textContent.slice(0, 5) : null; };
const part = () => screen.getByTestId("timer-part").textContent;
const skip = () => fireEvent.click(screen.getAllByRole("button", { name: "SKIP" }).pop());
const bar = () => within(screen.getByRole("navigation", { name: "Tabs" }));
const week = () => { fireEvent.click(bar().getByRole("button", { name: "MORE" })); fireEvent.click(screen.getByRole("button", { name: "PLAN" })); fireEvent.click(screen.getByRole("button", { name: "THIS WEEK" })); return document.body.textContent; };

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("the audit's changes in the camp, from Monday 23 November", () => {
  it("Tuesday 9 February 2027, week 6: the speed is three starts from the stance, after the shuttles. Tuesday 7 April 2026 has the flying twenties, as it did", async () => {
    await at(2027, 2, 9, ten());
    const rows = wholeDay(), i = rows.indexOf("Shuttle bursts");
    expect(rows.slice(i, i + 3)).toEqual(["Shuttle bursts", "Speed — stance starts", "The Pistol Line"]);
    expect([rows.indexOf("Flying sprint 20 m"), rows.indexOf("Build-up 20 m")]).toEqual([-1, -1]);
    pick("Speed — stance starts");
    expect(pres()).toEqual(["3 × 10 m · Rest 90 s"]);
    expect(lib().length).toBe(1);
    expect(lib()[0]).toMatch(/^Sprints from your boxing stance\. Stand in your stance, then explode forward off your back foot and sprint ten metres flat out\./);
    again();
    await at(2026, 4, 7, tenOld());
    const was = wholeDay();
    expect([was.indexOf("Flying sprint 20 m") >= 0, was.indexOf("Speed — stance starts")]).toEqual([true, -1]);
  });

  it("Saturday 13 February 2027: the one-arm landmine push press straight after the squat, 3 × 3 each side, with the bar-speed box and Spleeft's rule for the arm the watch is on; its speed is kept. Saturday 11 April 2026 has the barbell push press", async () => {
    await at(2027, 2, 13, ten());
    const rows = wholeDay(), i = rows.indexOf("Back Squat");
    expect(rows.slice(i, i + 3)).toEqual(["Back Squat", "One-Arm Landmine Push Press", "Bear-Hug Carry"]);
    expect(rows.indexOf("Push Press")).toBe(-1);
    pick("One-Arm Landmine Push Press");
    expect(pres()).toEqual(["3 × 3 each side · every rep fast · Rest 2:00"]);
    expect(tid("speed-rule")).toBe(ARM);
    expect(tid("bar-speed")).toMatch(/SET 1 · MEAN OF ITS TWO FASTEST REPS \(M\/S\)$/);
    fireEvent.change(within(card()).getByTestId("bar-speed").querySelector("input"), { target: { value: "1.3" } });
    expect(entry(/^mCw6-sat-c_lmpush$/).bs).toBe("1.3");
    expect(lib().length).toBe(1);
    expect(lib()[0]).toMatch(/^The landmine press with a leg drive\./);
    again();
    await at(2026, 4, 11, tenOld());
    const was = wholeDay();
    expect([was.indexOf("Push Press") >= 0, was.indexOf("One-Arm Landmine Push Press")]).toEqual([true, -1]);
  });

  it("Wednesday 6 January 2027: the bench throw has the bar-speed box and Spleeft's rule; Wednesday 4 March 2026 has neither", async () => {
    await at(2027, 1, 6, ten());
    pick("Bench Throw");
    expect(tid("speed-rule")).toBe(FAST);
    expect(tid("bar-speed")).toMatch(/SET 1 · MEAN OF ITS TWO FASTEST REPS \(M\/S\)$/);
    again();
    await at(2026, 3, 4, tenOld());
    pick("Bench Throw");
    expect(tid("bar-speed")).toBe(null);
  });

  it("Sunday 28 February 2027, the ten rounds: the card says the thirds without the SkiErg, a round logs the bike's calories alone, and the stop rule reads them — 16 against 20 goes on, 14 ends it", async () => {
    await at(2027, 2, 28, ten());
    pick("The 10 × 3 Simulation");
    expect(lib().length).toBe(1);
    expect(lib()[0]).toMatch(/Each round is split into thirds: the assault bike with your arms only, feet on the pegs; then the assault bike with arms and legs; then medicine-ball slams \(or the bag\)\./);
    expect(lib()[0]).not.toMatch(/SkiErg/);
    expect(boxes()).toEqual(["ROUND 1 · BIKE (CAL)", "LAST ROUND · BIKE (CAL)", "ROUND 7 · BIKE (CAL)"]);
    type("ROUND 1 · BIKE (CAL)", "20"); type("ROUND 7 · BIKE (CAL)", "16");
    expect(tid("stop-verdict")).toBe(null);
    expect(boxes()).toContain("ROUND 8 · BIKE (CAL)");
    type("ROUND 8 · BIKE (CAL)", "14");
    expect(tid("stop-verdict")).toMatch(/^ROUND 8 WAS THE LAST — THE REST ARE OFF/);
    expect(boxes()).not.toContain("ROUND 9 · BIKE (CAL)");
    expect(val("LAST ROUND · BIKE (CAL)")).toBe("14");
    expect(screen.getByTestId("round-fade").textContent).toBe("THE FADE · 70%");
    const e = entry(/-sun-c_fs_rd6$/);
    expect([e.cal, "w" in e]).toEqual(["14", false]);
  });

  it("the rounds' timer: the first third on the assault bike with the arms only, feet on the pegs, then the bike with arms and legs, then the slams or the bag", async () => {
    await at(2027, 2, 28, ten());
    pick("The 10 × 3 Simulation");
    fireEvent.click(screen.getByRole("button", { name: "▶ START THE ROUNDS" }));
    expect(part()).toBe("RD 1 · FIRST THIRD — ASSAULT BIKE, ARMS ONLY");
    expect(document.body.textContent).toContain("Feet on the pegs.");
    skip();
    expect(part()).toBe("RD 1 · SECOND THIRD — ASSAULT BIKE, ARMS AND LEGS");
    skip();
    expect(part()).toBe("RD 1 · LAST THIRD — MED-BALL SLAMS OR THE BAG");
  });

  it("Thursday 28 January 2027: the rounds on the erg are on the bike, in the line and in the words under the name", async () => {
    await at(2027, 1, 28, ten());
    pick("ROUNDS ON THE ERG · 7 × 3");
    expect(pres()).toEqual(["7 × 3 minutes on the bike at fight pace — the output you can hold across all of them — 60 seconds between"]);
    expect(lib().length).toBe(1);
    expect(lib()[0]).toMatch(/^Three-minute rounds on the bike at the pace you could hold for the whole fight/);
    expect(boxes()).toEqual(["ROUND 1 OUTPUT (OUTPUT)", "LAST ROUND OUTPUT (OUTPUT)", "ROUND 7 OUTPUT"]);
  });

  it("Saturday 13 March 2027, the camp's last day: the morning primer at nine — three easy minutes on the bike, box jumps 2 × 3, rotational throws 2 × 3 a side — and the fight at seven. Saturday 9 May 2026 has no primer", async () => {
    await at(2027, 3, 13, ten());
    const rows = wholeDay(), i = rows.indexOf("Easy bike");
    expect(rows.slice(i, i + 3)).toEqual(["Easy bike", "Box jumps", "Rotational throws"]);
    expect([i > 0, rows.indexOf("The fight") > i + 3]).toEqual([true, true]);
    expect(["Easy bike", "Box jumps", "Rotational throws", "The fight"].map(clock)).toEqual(["09:00", "09:03", "09:07", "19:00"]);
    pick("Easy bike");
    expect(pres()).toEqual(["3 minutes, easy · this morning, hours before the fight"]);
    pick("Box jumps");
    expect(pres()).toEqual(["2 × 3 · every jump as high as you can · Rest 60 s"]);
    pick("Rotational throws");
    expect(pres()).toEqual(["2 × 3 per side · every throw flat out · Rest 60 s"]);
    again();
    await at(2026, 5, 9, tenOld());
    const was = wholeDay();
    expect([was.indexOf("Easy bike"), was.indexOf("Box jumps"), was.indexOf("The fight") >= 0]).toEqual([-1, -1, true]);
  });

  it("Sunday 7 March 2027, the rehearsal: the primer first, then the movement block and the rehearsal, which logs the bike", async () => {
    await at(2027, 3, 7, ten());
    const rows = wholeDay(), i = rows.indexOf("Easy bike");
    expect(rows.slice(i, i + 5)).toEqual(["Easy bike", "Box jumps", "Rotational throws", "The movement block", "THE FIGHT-DAY REHEARSAL"]);
    pick("Easy bike");
    expect(pres()).toEqual(["3 minutes, easy · this morning, hours before the rehearsal"]);
    pick("THE FIGHT-DAY REHEARSAL");
    expect(boxes()).toEqual(["ROUND 1 · BIKE (CAL)", "LAST ROUND · BIKE (CAL)"]);
  });

  it("THIS WEEK: the final week's table names the primer, and a peak week's card the landmine push press", async () => {
    await at(2027, 3, 10, ten());
    expect(week()).toMatch(/The morning primer, hours before: three easy minutes on the bike, box jumps 2 × 3, rotational throws 2 × 3 per side, every one fast\. Then the FIGHT\. The warm-up you rehearsed\./);
    again();
    await at(2027, 2, 13, ten());
    expect(week()).toMatch(/Landmine push press3 × 3 each side, every rep fast/);
  });
});

describe("the audit's changes in Prep, from Monday 23 November", () => {
  it("Saturday 5 December 2026, week 1: the profiles are the squat's and the bench's", async () => {
    await at(2026, 12, 5, prepLate());
    const rows = wholeDay();
    expect([rows.indexOf("Load-Velocity Profiles — Squat and Bench") >= 0, rows.indexOf("Load-Velocity Profiles — Squat, Bench, Push Press")]).toEqual([true, -1]);
    pick("Load-Velocity Profiles — Squat and Bench");
    expect(pres()).toEqual(["the squat at five loads, the bench at four"]);
  });

  it("Saturday 12 December 2026: the one-arm landmine push press between the squat and the Romanian deadlift, with Spleeft's rule. Saturday 17 January 2026 has the barbell push press", async () => {
    await at(2026, 12, 12, prepLate());
    const rows = wholeDay(), i = rows.indexOf("Back Squat");
    expect(rows.slice(i, i + 3)).toEqual(["Back Squat", "One-Arm Landmine Push Press", "Romanian Deadlift"]);
    pick("One-Arm Landmine Push Press");
    expect(pres()).toEqual(["3 × 3 each side · every rep fast · Rest 2:00"]);
    expect(tid("speed-rule")).toBe(ARM);
    again();
    await at(2026, 1, 17, prep());
    const was = wholeDay();
    expect([was.indexOf("Push Press") >= 0, was.indexOf("One-Arm Landmine Push Press")]).toEqual([true, -1]);
  });

  it("the rounds log the bike alone; the 20-minute test and the bench throw read the new words and rule; the lighter week checks the squat's working weight and not a push press's", async () => {
    await at(2026, 12, 13, prepLate());
    pick("The 6 × 3 Simulation");
    expect(boxes()).toEqual(["ROUND 1 · BIKE (CAL)", "LAST ROUND · BIKE (CAL)"]);
    again();
    await at(2026, 12, 6, prepLate());
    pick("The 20-Minute Test");
    expect(lib()).toEqual([T20]);
    again();
    await at(2026, 12, 9, prepLate());
    pick("Bench Throw (Smith)");
    expect(tid("speed-rule")).toBe(FAST);
    again();
    await at(2027, 1, 9, prepLate());
    expect(wholeDay().filter((r) => /Working-Weight Check/i.test(r))).toEqual(["Working-Weight Check — Squat"]);
    again();
    await at(2026, 1, 18, prep());
    pick("The 6 × 3 Simulation");
    expect(boxes()).toEqual(["ROUND 1 · SKIERG (M)", "ROUND 1 · BIKE (CAL)", "LAST ROUND · SKIERG (M)", "LAST ROUND · BIKE (CAL)"]);
  });
});

describe("the audit's changes in Fighter, from Monday 23 November", () => {
  it("Saturday 19 December 2026: the one-arm landmine push press after the jump circuit, 4 × 3 each side, on the card and on the week's; week 1's, with no number to find, is 4 × 3 too. Saturday 21 November has the barbell push press", async () => {
    await at(2026, 12, 19, fighter());
    const rows = wholeDay(), i = rows.indexOf("The Jump Circuit");
    expect([rows[i + 1], rows.indexOf("Push Press")]).toEqual(["One-Arm Landmine Push Press", -1]);
    pick("One-Arm Landmine Push Press");
    expect(pres()).toEqual(["4 × 3 each side · every rep fast · Rest 2:00"]);
    expect(tid("speed-rule")).toBe(ARM);
    expect(week()).toMatch(/Landmine push press4 × 3 each side, every rep fast/);
    again();
    await at(2026, 12, 12, fighter());
    pick("One-Arm Landmine Push Press");
    expect(pres()).toEqual(["4 × 3 each side · every rep fast · Rest 2:00"]);
    again();
    await at(2026, 11, 21, fighter());
    const was = wholeDay();
    expect([was.indexOf("Push Press") >= 0, was.indexOf("One-Arm Landmine Push Press")]).toEqual([true, -1]);
  });

  it("Sunday 20 December 2026: the fight rounds log one box a round, the bike's calories, and minute 1 is the assault bike with the arms only", async () => {
    await at(2026, 12, 20, fighter());
    pick("Fight Simulation");
    expect(boxes()).toEqual(["ROUND 1 OUTPUT (BIKE CAL)", "ROUND 6 OUTPUT (BIKE CAL)"]);
    fireEvent.click(screen.getByRole("button", { name: "▶ START THE ROUNDS" }));
    expect(part()).toBe("RD 1 · MIN 1 — ASSAULT BIKE, ARMS ONLY");
    skip();
    expect(part()).toBe("RD 1 · MIN 2 — ASSAULT BIKE, ARMS AND LEGS");
  });

  it("Monday's bench throw has Spleeft's rule; the 20-minute test names the bike; NUMBERS asks for working maxes, never a best single", async () => {
    await at(2026, 12, 14, fighter());
    pick("Bench Throw (Smith)");
    expect(tid("speed-rule")).toBe(FAST);
    again();
    await at(2026, 12, 13, fighter());
    pick("20-Minute Bike Test");
    expect(lib()).toEqual([T20]);
    again();
    await at(2026, 12, 19, fighter());
    fireEvent.click(bar().getByRole("button", { name: "PROGRESS" }));
    fireEvent.click(screen.getByRole("button", { name: "NUMBERS" }));
    expect(document.body.textContent).toMatch(/Squat and bench: working maxes — your heaviest clean set of 3, with one or two reps left in you, × 1\.08\. Never a best single\./);
    expect(document.body.textContent).not.toMatch(/your best single/);
  });
});
