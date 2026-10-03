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
const title = () => screen.getByTestId("app-title").textContent.toUpperCase();
const findHead = (name) => screen.findByText(headMatch(name));

/* a day of the week: the strip is inside the whole day now */
function pickDay(d) {
  if (!screen.queryByRole("button", { name: d })) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  fireEvent.click(screen.getByRole("button", { name: d }));
}

/* the old tabs, by the path they now live on */
function nav(name) {
  const bar = () => within(screen.getByRole("navigation", { name: "Tabs" }));
  const tab = (n) => fireEvent.click(bar().getByRole("button", { name: n }));
  const click = (n) => fireEvent.click(screen.getByRole("button", { name: n }));
  if (name === "TRACK") return tab("PROGRESS");
  if (name === "TODAY") return tab("TODAY");
  if (name === "COOK" || name === "SHOP") { tab("FOOD"); return click(name); }
  tab("MORE");
  if (name === "WEEK") { click("PLAN"); return click("THIS WEEK"); }
  if (name === "PLAN") { click("PLAN"); return click("DOCUMENTS"); }
  return click(name);
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

  const CAMP_START = "2027-01-04";              // Monday 4 January 2027
  const camp = (extra) => mount(Object.assign({ camp: true, campStart: CAMP_START }, extra || {}));
  const season = async (extra) => {
    await mount(extra);
    nav("WEEK");
    fireEvent.click(await screen.findByRole("button", { name: "THE SEASON" }));
  };

  it("locks a Stage 4 breath preset at breath stage 1 and writes the gate on the lock", async () => {
    await mount();
    nav("IRON");
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

  it("gives the camp a dated week table, and a fight-week table for Saturday 13 March", async () => {
    vi.setSystemTime(new Date(2027, 2, 3, 9, 0, 0));    // camp week 9, sharpen
    await camp();

    nav("WEEK");
    expect(await screen.findByText("The ten weeks — every number, every week, with dates")).toBeInTheDocument();
    expect(screen.getByText("4–10 Jan")).toBeInTheDocument();
    expect(screen.getByText("22–28 Feb")).toBeInTheDocument();
    expect(screen.getByText("1–7 Mar")).toBeInTheDocument();
    expect(screen.getByText("8–14 Mar")).toBeInTheDocument();
    expect(screen.queryByText("15–21 Mar")).not.toBeInTheDocument();

    expect(screen.getByText("Fight week — fight on Saturday 13 Mar")).toBeInTheDocument();
    expect(screen.getByText("SAT 13 Mar")).toBeInTheDocument();
    expect(screen.getByText(/Round six is a place you've already been/)).toBeInTheDocument();
  });

  it("puts the camp document on the PLAN tab", async () => {
    await camp();
    nav("PLAN");
    expect(await screen.findByRole("button", { name: "CAMP" })).toBeInTheDocument();
    expect(screen.getAllByText("THE TEN WEEKS — EVERY NUMBER, EVERY WEEK, WITH DATES").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/THE EDGE — THE REINS OFF/).length).toBeGreaterThan(0);
  });

  /* ---------------- THE EDGE ---------------- */

  /* the season the documents date: PREP from 28 September, test day
     2 January, the camp 4 January to the fight on 13 March */
  const SEASON = { fightDate: "2027-03-13", start: "2026-09-28" };
  const ready = (m) => localStorage.setItem("o8s-ready", JSON.stringify(m));

  it("defaults to a 16-week cycle with the Iron Mind weeks off", async () => {
    await mount();

    nav("WEEK");
    expect(await screen.findByText("16")).toBeInTheDocument();
    expect(screen.queryByText("17")).not.toBeInTheDocument();
    expect(screen.queryByText("18")).not.toBeInTheDocument();
  });

  it("renders the hardship, track and plan pages without falling over", async () => {
    await mount();

    nav("IRON");
    fireEvent.click(await screen.findByRole("button", { name: "HARDSHIP" }));
    expect(await screen.findByText("THE SILENT SLED")).toBeInTheDocument();
    expect(screen.getByText("THE COLLISION RULES — PRECEDENCE, FIXED")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SIT" }));
    expect(await screen.findByText("THE GUIDED TIMERS")).toBeInTheDocument();
    // the guided timers and the eleven types both name the body scan
    expect(screen.getAllByText("Body scan").length).toBe(2);
    // stage 4's shikantaza is locked at meditation stage 1
    expect(screen.getByText("🔒 Just sitting — shikantaza")).toBeInTheDocument();

    nav("TRACK");
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

    nav("PLAN");
    expect(await screen.findByText("CONTENTS")).toBeInTheDocument();
    // both documents are readable offline: once in the contents, once as the heading
    expect(screen.getAllByText("WHEN BOXING RETURNS — CAMP MODE").length).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: "IRON MIND v5" }));
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

  it("puts the dashboard at the top of TRACK, with the photos beside it", async () => {
    seedMornings(50, 80);
    localStorage.setItem("o8s-log", JSON.stringify({ "m1w1-sun-bike20": { w: "5200" }, "m1w1-sun-bike20hr": { w: "180" } }));
    await mount();
    nav("TRACK");

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
    await mount({ camp: true, campStart: "2027-01-04" });
    nav("TRACK");

    expect(await screen.findByText("The dashboard — the seven numbers, against the camp's targets")).toBeInTheDocument();
    expect(screen.getByText("CAMP TARGET · 5–8 POINTS BETTER THAN PREP'S LAST READ")).toBeInTheDocument();
    expect(screen.getByText("CAMP TARGET · THE DECREMENT DOWN A FURTHER QUARTER")).toBeInTheDocument();
    expect(screen.getByText("CAMP TARGET · DOWN 4–8 BEATS")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PHOTOS" }));
    expect(await screen.findByText("Photos — the Sunday of camp weeks 1, 5 and 9")).toBeInTheDocument();
  });

  it("recalibrates the baseline and sets the erg unit from settings", async () => {
    seedMornings(50, 80);
    await mount();
    nav("SETTINGS");

    expect(await screen.findByText("The morning numbers — the baseline")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "RECALIBRATE BASELINE" }));
    expect(await screen.findByText(/Baseline set from the last 7 days/)).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).base.rhr).toBe(50));

    fireEvent.click(screen.getByRole("button", { name: "METRES" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).ergUnit).toBe("m"));
  });

  it("carries the new data through export and import", async () => {
    seedMornings(50, 80);
    localStorage.setItem("o8s-photos", JSON.stringify({ "2026-09-06": { front: "data:image/jpeg;base64,AAA" } }));
    await mount();
    nav("SETTINGS");
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

  it("moves camp day one from settings, and reads a mid-week date back to its Monday", async () => {
    await mount({ camp: true, program: "camp", campStart: "2026-09-07", start: "2026-08-31" });
    nav("SETTINGS");
    const lab = await screen.findByText("Camp day one — the Monday week 1 starts on");
    const field = lab.parentElement.querySelector("input");
    expect(field.value).toBe("2026-09-07");
    fireEvent.change(field, { target: { value: "2026-09-30" } });     // a Wednesday
    await waitFor(() => expect(JSON.parse(localStorage.getItem("o8s-settings")).campStart).toBe("2026-09-28"));
  });

  it("hands camp day one to the fight date when there is one", async () => {
    await mount({ camp: true, program: "camp", fightDate: "2027-03-13" });
    nav("SETTINGS");
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
    await waitFor(() => expect(title()).toBe("FIGHTER · WEEK 3 · BUILD"));
  }, 60000);

  /* ================================================================
     PREP — the calendar drives the session
     ================================================================ */

  it("renders the guide on its own tab, with this week at the top", async () => {
    await mount({ program: "prep", start: "2026-08-24" });
    nav("GUIDE");

    expect(await screen.findByText(/This week is ACCUMULATE/)).toBeInTheDocument();
    expect(screen.getByText(/Tests this week: none/)).toBeInTheDocument();
    // and guide.md itself, with its contents
    expect(screen.getByText("CONTENTS")).toBeInTheDocument();
    expect(screen.getAllByText("WHAT TO DO TODAY").length).toBeGreaterThan(0);
    expect(screen.getByText(/Open the app. It shows one thing at a time/)).toBeInTheDocument();
    // and guide-fuel.md after it, in the same document
    expect(screen.getAllByText("THE FOOD GUIDE — PLAIN ENGLISH").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FIGHT DAY").length).toBeGreaterThan(0);
    expect(screen.getByText(/stir 15 g of collagen into the bottle/)).toBeInTheDocument();
  });

  it("names the tests on the weeks that carry them", async () => {
    await mount({ program: "prep", start: "2026-08-03" });    // the lighter week with the tests on it
    nav("GUIDE");
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

  it("holds every document on PLAN, and one live panel on GUIDE with the phase and the next feed", async () => {
    await mount();
    nav("PLAN");
    ["PREP", "CAMP", "FIGHTER v1.5", "IRON MIND v5", "FUEL · FIGHTER", "THE MENU", "MENU B + WATER", "FUEL · SEASON"].forEach((n) =>
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "THE MENU" }));
    expect((await screen.findAllByText(/THE FIVE RULES/)).length).toBeGreaterThan(0);
    nav("GUIDE");
    expect(await screen.findByText("The food this week:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Next feed:", { exact: false })).toBeInTheDocument();
    // Wednesday 09:00: the mid-morning feed is due now
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("BATCH")).toBeInTheDocument();
    expect(screen.getAllByText(/^FOOD AND DRINK$/).length).toBeGreaterThan(0);
  });
});
