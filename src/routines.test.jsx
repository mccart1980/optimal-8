import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, act, cleanup } from "@testing-library/react";
import homeMd from "../home-routines.md?raw";
import App, { sessionCatalog, rangeRoutine } from "./App.jsx";
import { RoutineRunner, GET_SET } from "./now.jsx";
import { LIBRARY } from "./library.js";
import { SIGHS, MORNING_FIVE, RANGE_CARDS, FIGHT_WEEK_CARDS, KEEP_CARDS, MOVE_CARDS, SKILL_CARDS, skillCards } from "./routines.js";

/* ================================================================
   THE HOME ROUTINES AND GOING BACK — `npm run build` stops unless:
   · every routine card shows its own words from home-routines.md and
     no exercise-library text
   · no routine card has both a clock and a rep count
   · RANGE is home-routines.md's 27 cards, in its order, the 90/90 as
     six cards named exactly as written
   · a REPS card never moves on by itself
   · BACK, from any NOW card, opens the item before it, its inputs
     editable, nothing unticked
   ================================================================ */

const RANGE_NAMES = [
  "SETTLE", "FOAM ROLLER — ARCH OVER IT", "FOAM ROLLER — THE STIFFEST SPOT", "OPEN BOOK — RIGHT ARM", "OPEN BOOK — LEFT ARM",
  "THREAD THE NEEDLE", "LOADED ROTATION",
  "90/90 — RIGHT LEG IN FRONT", "90/90 — RIGHT LEG IN FRONT: PUSH AND RELAX", "90/90 — LIFT YOUR LEFT FOOT",
  "90/90 — LEFT LEG IN FRONT", "90/90 — LEFT LEG IN FRONT: PUSH AND RELAX", "90/90 — LIFT YOUR RIGHT FOOT",
  "COUCH STRETCH — RIGHT KNEE DOWN", "COUCH STRETCH — LEFT KNEE DOWN", "COSSACK SQUATS", "DEEP SQUAT HOLD", "SQUAT-TO-STAND", "HIP AIRPLANES",
  "HANG", "PRAYER STRETCH", "SLEEPER STRETCH — RIGHT SHOULDER", "SLEEPER STRETCH — LEFT SHOULDER",
  "KETTLEBELL ARM BAR — RIGHT ARM", "KETTLEBELL ARM BAR — LEFT ARM", "WALL SLIDES", "BAND EXTERNAL ROTATIONS",
];
const ROUTINES = { RANGE: RANGE_CARDS, "RANGE — FIGHT WEEK": FIGHT_WEEK_CARDS, "THE KEEP": KEEP_CARDS, "THE MOVEMENT SESSION": MOVE_CARDS, "THE SKILL BLOCK": SKILL_CARDS };
const LIB_TEXTS = LIBRARY.map((e) => e.text);
const hasLibText = (el) => LIB_TEXTS.some((t) => el.textContent.indexOf(t) >= 0);

/* walk a runner from its first card to its last, reading each card */
function walk(cards) {
  render(<RoutineRunner cards={cards} sound={false} />);
  const seen = [];
  for (let i = 0; i < cards.length; i++) {
    const r = screen.getByTestId("routine-runner");
    seen.push({ n: within(r).getByTestId("routine-name").textContent, words: within(r).getByTestId("routine-words").textContent,
      dose: within(r).getByTestId("routine-dose").textContent, clock: within(r).queryByTestId("routine-clock"),
      level: within(r).queryByTestId("routine-level"), lib: within(r).queryAllByTestId("card-lib").length, libText: hasLibText(r), kind: r.getAttribute("data-kind") });
    fireEvent.click(within(r).getByRole("button", { name: "Next card" }));
  }
  expect(screen.getByTestId("routine-done").textContent).toBe("DONE");
  cleanup();
  return seen;
}

describe("the routine cards are home-routines.md's", () => {
  it("RANGE is the 27 cards in the document's order, the 90/90 as six", () => {
    expect(RANGE_CARDS.map((c) => c.n)).toEqual(RANGE_NAMES);
    expect(walk(RANGE_CARDS).map((c) => c.n)).toEqual(RANGE_NAMES);
    expect(RANGE_CARDS.filter((c) => /^90\/90/.test(c.n)).length).toBe(6);
    RANGE_CARDS.forEach((c) => expect(homeMd).toContain("**" + c.no + " · " + c.n + "**"));
  });

  it("the fight week, the Keep, the movement session and the skill block are the document's lists", () => {
    expect(FIGHT_WEEK_CARDS.length).toBe(12);
    expect(KEEP_CARDS.length).toBe(14);
    expect(MOVE_CARDS.length).toBe(26);
    expect(SKILL_CARDS.length).toBe(6);
    expect(FIGHT_WEEK_CARDS.map((c) => c.amt)).toEqual(["8", "45 s", "35 s", "35 s", "30 s", "8", "30 s", "8", "35 s", "35 s", "45 s", "45 s"]);
    expect(KEEP_CARDS[KEEP_CARDS.length - 1].n).toBe("KETTLEBELL ARM BAR — LEFT ARM");
    /* fight week drops the press: no "at halfway" on its open book or couch stretch */
    FIGHT_WEEK_CARDS.forEach((c) => { expect(c.words).not.toMatch(/at halfway/i); expect(c.halfway).toBe(false); });
    expect(KEEP_CARDS.find((c) => c.n === "OPEN BOOK — RIGHT ARM").halfway).toBe(true);
    expect(MOVE_CARDS.find((c) => c.n === "KETTLEBELL ARM BAR — RIGHT ARM").words).toBe(RANGE_CARDS[23].words);
  });

  it("every routine card shows its own words from home-routines.md, and no library text", () => {
    Object.keys(ROUTINES).forEach((k) => {
      const cards = k === "THE SKILL BLOCK" ? skillCards({ l: "2", what: "Chest-to-wall hold" }) : ROUTINES[k];
      walk(cards).forEach((c, i) => {
        expect(c.n).toBe(cards[i].n);
        expect(c.words).toBe(cards[i].words);
        expect(c.words.length).toBeGreaterThan(10);
        expect(homeMd).toContain(c.words);
        expect(c.lib).toBe(0);
        expect(c.libText).toBe(false);
      });
    });
    expect(homeMd).toContain(SIGHS.words);
    expect(homeMd).toContain(MORNING_FIVE.words);
    expect(MORNING_FIVE.rows.map((r) => r.n)).toEqual(["Neck", "Shoulders", "Mid-back", "Hips", "Ankles"]);
    MORNING_FIVE.rows.forEach((r) => expect(homeMd).toContain("**" + r.n + "** — " + r.text));
  });

  it("the skill block's handstand card carries the level's instruction under its words", () => {
    const seen = walk(skillCards({ l: "3", what: "Back-to-wall kick-ups" }));
    expect(seen[1].n).toBe("HANDSTAND ON PARALLETTES");
    expect(seen[1].level.textContent).toBe("LEVEL 3 — Back-to-wall kick-ups");
  });

  it("no routine card has both a clock and a rep count", () => {
    Object.keys(ROUTINES).forEach((k) => walk(ROUTINES[k]).forEach((c, i) => {
      const card = ROUTINES[k][i];
      if (card.kind === "hold") {
        expect(card.secs).toBeGreaterThan(0);
        expect(c.clock).not.toBeNull();
        expect(c.dose).not.toMatch(/REPS|EACH|×/);
      } else {
        expect(card.kind).toBe("reps");
        expect(c.clock).toBeNull();
        expect(c.dose).toBe("REPS " + card.amt);
      }
    }));
  });
});

describe("how a routine card runs", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  const tick = (ms) => act(() => { vi.advanceTimersByTime(ms); });

  it("a HOLD card: 8 seconds of GET SET, the clock, then the next card by itself; a REPS card never moves on", () => {
    render(<RoutineRunner cards={RANGE_CARDS} sound={false} />);
    const name = () => screen.getByTestId("routine-name").textContent;
    expect(name()).toBe("SETTLE");
    fireEvent.click(screen.getByRole("button", { name: "▶ START" }));
    expect(screen.getByTestId("routine-dose").textContent).toMatch(/^GET SET/);
    expect(screen.getByTestId("routine-clock").textContent).toBe("0:0" + GET_SET);
    tick(GET_SET * 1000 + 500);
    expect(screen.getByTestId("routine-dose").textContent).toMatch(/^HOLD/);
    tick(61 * 1000);
    expect(name()).toBe("FOAM ROLLER — ARCH OVER IT");
    /* a REPS card: no clock, and ten minutes later it is still there */
    tick(10 * 60 * 1000);
    expect(name()).toBe("FOAM ROLLER — ARCH OVER IT");
    expect(screen.queryByTestId("routine-clock")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done, next card" }));
    expect(name()).toBe("FOAM ROLLER — THE STIFFEST SPOT");
  });

  it("a REPS card opened on its own doesn't move on either", () => {
    render(<RoutineRunner cards={MOVE_CARDS} sound={false} at={1} />);
    expect(screen.getByTestId("routine-name").textContent).toBe("SHOULDER CIRCLES WITH A KETTLEBELL — RIGHT ARM");
    tick(30 * 60 * 1000);
    expect(screen.getByTestId("routine-name").textContent).toBe("SHOULDER CIRCLES WITH A KETTLEBELL — RIGHT ARM");
  });

  it("\"at halfway\" buzzes once at halfway", () => {
    const vib = vi.fn(); Object.defineProperty(navigator, "vibrate", { value: vib, configurable: true });
    render(<RoutineRunner cards={RANGE_CARDS} sound={false} at={3} />);
    fireEvent.click(screen.getByRole("button", { name: "▶ START" }));
    tick(GET_SET * 1000 + 500);
    vib.mockClear();
    tick(34 * 1000);
    expect(vib).not.toHaveBeenCalledWith(200);
    tick(2 * 1000);
    expect(vib.mock.calls.filter((c) => c[0] === 200).length).toBe(1);
    tick(20 * 1000);
    expect(vib.mock.calls.filter((c) => c[0] === 200).length).toBe(1);
  });

  it("after the last card: DONE and BACK TO THE LAST CARD; it starts where the day left it", () => {
    const onAt = vi.fn();
    render(<RoutineRunner cards={SKILL_CARDS} sound={false} at={5} onAt={onAt} />);
    expect(screen.getByTestId("routine-name").textContent).toBe("ARCH HOLD — 2 OF 2");
    fireEvent.click(screen.getByRole("button", { name: "Next card" }));
    expect(onAt).toHaveBeenLastCalledWith(6);
    expect(screen.getByTestId("routine-done").textContent).toBe("DONE");
    fireEvent.click(screen.getByRole("button", { name: "◀ BACK TO THE LAST CARD" }));
    expect(screen.getByTestId("routine-name").textContent).toBe("ARCH HOLD — 2 OF 2");
    fireEvent.click(screen.getByRole("button", { name: "Previous card" }));
    expect(onAt).toHaveBeenLastCalledWith(4);
  });
});

/* ---------------- in the app ---------------- */
const PREP_START = "2026-01-05";
const WED = new Date(2026, 0, 7, 6, 0, 0);
function settings() {
  return JSON.stringify({ start: PREP_START, macroBase: 1, iron: false, sound: false, autoRest: true,
    medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: PREP_START, rangeStart: PREP_START,
    camp: false, lastTen: false, taper: false, levelStart: PREP_START, program: "prep", v12: true });
}
async function mount(at) {
  vi.setSystemTime(at);
  localStorage.setItem("o8s-settings", settings());
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
const openWhole = () => {
  fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
  ["MORNING", "GYM", "THE DAY", "EVENING"].forEach((ch) => {
    const el = screen.getByText(ch).closest("[data-chapter]");
    const b = within(el).getAllByRole("button")[0];
    if (b.getAttribute("aria-expanded") === "false") fireEvent.click(b);
  });
};
const pickRow = (id) => { openWhole(); fireEvent.click(within(document.querySelector('[data-flow-id="' + id + '"]')).getAllByRole("button")[1]); };
const nowId = () => screen.getByTestId("now-card").getAttribute("data-flow-id");

describe("the routines and BACK, in TODAY", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    localStorage.clear();
    localStorage.setItem("o8s-migrated", "true");
    localStorage.setItem("o8s-maxes", JSON.stringify({ squat: 140, bench: 100, tbdl: 180, pp: 70 }));
  });
  afterEach(() => vi.useRealTimers());

  it("the sighs card shows THREE BIG SIGHS' words; the morning five is one card of five rows to tick, no clocks; the evening has the skill block", async () => {
    await mount(WED);
    pickRow("m-sighs");
    let card = screen.getByTestId("now-card");
    expect(within(card).getByTestId("card-name").textContent).toBe("Three physiological sighs");
    expect(within(card).getByTestId("card-desc").textContent).toBe(SIGHS.words);
    expect(within(card).queryByTestId("card-lib")).not.toBeInTheDocument();
    pickRow("m-five");
    card = screen.getByTestId("now-card");
    expect(within(card).getByTestId("card-desc").textContent).toBe(MORNING_FIVE.words);
    expect(within(card).queryByTestId("card-lib")).not.toBeInTheDocument();
    expect(within(card).queryByTestId("routine-clock")).not.toBeInTheDocument();
    expect(hasLibText(card)).toBe(false);
    MORNING_FIVE.rows.forEach((r) => expect(within(card).getByText(r.text)).toBeInTheDocument());
    fireEvent.click(within(card).getByRole("button", { name: "Tick Hips" }));
    expect(within(card).getByRole("button", { name: "Untick Hips" })).toBeInTheDocument();
    openWhole();
    expect(within(screen.getByText("EVENING").closest("[data-chapter]")).getByText("The skill block")).toBeInTheDocument();
    expect(screen.queryByText("The hollow block")).not.toBeInTheDocument();
  });

  it("every routine card in the evening is the document's, with no library text", async () => {
    await mount(WED);
    pickRow("ev-skill");
    let r = screen.getByTestId("routine-runner");
    SKILL_CARDS.forEach((c) => {
      r = screen.getByTestId("routine-runner");
      expect(within(r).getByTestId("routine-name").textContent).toBe(c.n);
      expect(within(r).getByTestId("routine-words").textContent).toBe(c.words);
      expect(hasLibText(screen.getByTestId("now-card"))).toBe(false);
      fireEvent.click(within(r).getByRole("button", { name: "Next card" }));
    });
    /* leaving and coming back returns to the card it was on */
    pickRow("ev-range");
    r = screen.getByTestId("routine-runner");
    fireEvent.click(within(r).getByRole("button", { name: "Next card" }));
    fireEvent.click(within(r).getByRole("button", { name: "Next card" }));
    expect(within(r).getByTestId("routine-name").textContent).toBe(RANGE_CARDS[2].n);
    expect(hasLibText(screen.getByTestId("now-card"))).toBe(false);
    pickRow("m-sighs");
    pickRow("ev-range");
    expect(screen.getByTestId("routine-name").textContent).toBe(RANGE_CARDS[2].n);
  });

  it("BACK from every NOW card opens the item before it in the day's order, done or not", async () => {
    await mount(WED);
    openWhole();
    const ids = Array.from(document.querySelectorAll("[data-flow-id]")).filter((el) => el.closest("[data-chapter]")).map((el) => el.getAttribute("data-flow-id"));
    expect(ids.length).toBeGreaterThan(20);
    /* from the last item, BACK all the way to the first */
    fireEvent.click(within(document.querySelector('[data-flow-id="' + ids[ids.length - 1] + '"]')).getAllByRole("button")[1]);
    const seen = [nowId()];
    for (let i = 1; i < ids.length; i++) { fireEvent.click(screen.getByRole("button", { name: "Back to the item before" })); seen.push(nowId()); }
    expect(seen.reverse()).toEqual(ids);
    expect(screen.getByRole("button", { name: "Back to the item before" })).toBeDisabled();
  });

  it("BACK reopens a done item with its inputs editable, and never unticks it", async () => {
    await mount(WED);
    /* the morning numbers: typed, done; BACK from the next card */
    pickRow("m-numbers");
    const field = () => within(screen.getByTestId("now-card")).getAllByRole("textbox")[0];
    fireEvent.change(field(), { target: { value: "52" } });
    fireEvent.click(screen.getByRole("button", { name: "DONE" }));
    expect(nowId()).not.toBe("m-numbers");
    fireEvent.click(screen.getByRole("button", { name: "Back to the item before" }));
    expect(nowId()).toBe("m-numbers");
    expect(field()).not.toBeDisabled();
    expect(field().value).toBe("52");
    fireEvent.change(field(), { target: { value: "54" } });
    expect(field().value).toBe("54");
    openWhole();
    expect(within(document.querySelector('[data-flow-id="m-numbers"]')).getByRole("button", { name: /^Untick/ })).toBeInTheDocument();

    /* a gym card: a set logged, NEXT, BACK: the set is still logged and editable */
    const gid = Array.from(document.querySelectorAll("[data-flow-id]")).map((el) => el.getAttribute("data-flow-id")).find((id) => /^G:/.test(id) && /tbdl|trap/i.test(id))
      || Array.from(document.querySelectorAll('[data-chapter="GYM"] [data-flow-id]')).map((el) => el.getAttribute("data-flow-id"))[1];
    fireEvent.click(within(document.querySelector('[data-flow-id="' + gid + '"]')).getAllByRole("button")[1]);
    const setBtn = within(screen.getByTestId("now-card")).queryByRole("button", { name: "Set 1" });
    if (setBtn) fireEvent.click(setBtn);
    fireEvent.click(screen.getByRole("button", { name: "NEXT" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to the item before" }));
    expect(nowId()).toBe(gid);
    if (setBtn) {
      expect(within(screen.getByTestId("now-card")).getByRole("button", { name: "Undo set 1" })).not.toBeDisabled();
      fireEvent.click(within(screen.getByTestId("now-card")).getByRole("button", { name: "ADJUST" }));
      within(screen.getByTestId("now-card")).getAllByRole("textbox").forEach((x) => expect(x).not.toBeDisabled());
    }
    openWhole();
    expect(within(document.querySelector('[data-flow-id="' + gid + '"]')).getByRole("button", { name: /^Untick/ })).toBeInTheDocument();
  });
});

describe("the audit's fixes", () => {
  it("camp's fight week runs RANGE at half dose; the Keep from week 13", () => {
    expect(rangeRoutine(5, true).cards).toBe(FIGHT_WEEK_CARDS);
    expect(rangeRoutine(5, true).mins).toBe(10);
    expect(rangeRoutine(13, false).cards).toBe(KEEP_CARDS);
    expect(rangeRoutine(12, false).cards).toBe(RANGE_CARDS);
  });
  it("the neck holds show the neck holds' entry only; the activation's sighs show THREE BIG SIGHS", () => {
    const cat = sessionCatalog(["master", "cycle"]);
    const neck = cat.filter((c) => c.n === "Neck — holds only");
    expect(neck.length).toBeGreaterThan(0);
    neck.forEach((c) => expect(c.lib.map((e) => e.n)).toEqual(["NECK FOUR-DIRECTION HOLDS"]));
    const sighs = cat.filter((c) => c.n === "Three physiological sighs");
    expect(sighs.length).toBeGreaterThan(0);
    sighs.forEach((c) => { expect(c.lib).toBeNull(); expect(c.desc).toBe(SIGHS.words); });
  }, 300000);
});
