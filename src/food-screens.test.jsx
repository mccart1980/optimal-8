import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App.jsx";

/* FOOD · TODAY on the screen (brief 34): the day's budget, the food typed
   in and taken off it, the box as a calculator over the food list, the
   next meal, the meals one tap each, a food from its packet, the home
   screen's row, and the day's list without the meal rows. Strength, Power and Physique's twelve weeks from Monday 15 February
   2027; every number here is made up. */
const SPP = { booked: false, classic: false, spp: true, fitness: "moderate", rounds: 6, mins: 3, rest: 60, weighIn: "before", emphasis: "none" };
const MAXES = { squat: 140, bench: 100, tbdl: 180, pp: 70, cw_squat: 120, cw_tbdl: 160, cw_bench: 90, cw_pp: 60 };
const spp = (extra) => Object.assign({ macroBase: 1, iron: false, sound: false, autoRest: true, medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, v12: true, v16: true,
  start: "2026-10-26", imStart: "2026-10-26", rangeStart: "2026-10-26", levelStart: "2026-10-26", program: "prep", easyPeak: "180",
  plans: [{ from: "2027-02-15", made: "2027-02-14", inputs: SPP }], season: SPP }, extra || {});

async function at(y, m, d, hh, mm, st, store) {
  vi.setSystemTime(new Date(y, m - 1, d, hh, mm, 0));
  localStorage.setItem("o8s-settings", JSON.stringify(st || spp()));
  localStorage.setItem("o8s-maxes", JSON.stringify(MAXES));
  Object.keys(store || {}).forEach((k) => localStorage.setItem(k, JSON.stringify(store[k])));
  render(<App />);
  await waitFor(() => expect(screen.queryByText("LOADING…")).not.toBeInTheDocument());
}
const tab = (name) => fireEvent.click(within(screen.getByRole("navigation", { name: "Tabs" })).getByRole("button", { name }));
const food = () => { tab("Food"); return screen.getByTestId("food-today"); };
const type = (s) => fireEvent.change(screen.getByTestId("food-text"), { target: { value: s } });
const addBtn = () => within(screen.getByTestId("food-add")).getByRole("button", { name: /^ADD($| · )/ });
const stored = () => JSON.parse(localStorage.getItem("o8s-eat") || "{}");
const left = () => screen.getByTestId("kcal-left").textContent;

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); localStorage.clear(); localStorage.setItem("o8s-migrated", "true"); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("the day's budget", () => {
  it("FOOD opens on TODAY: a gym day at maintenance is 3,200 kcal and 200 g protein", async () => {
    await at(2027, 2, 15, 6, 0);
    food();
    expect([...screen.getAllByRole("button").filter((b) => ["TODAY", "MEALS", "COOK", "SHOP", "WATER"].indexOf(b.textContent) >= 0)].map((b) => [b.textContent, b.getAttribute("aria-pressed")]))
      .toEqual([["TODAY", "true"], ["MEALS", "false"], ["COOK", "false"], ["SHOP", "false"], ["WATER", "false"]]);
    expect(screen.getByTestId("day-type").textContent).toBe("Gym day · 3,200 kcal");
    expect(left()).toBe("3,200");
    expect(screen.getByTestId("left-p").textContent).toMatch(/200 g left of 200/);
    expect(screen.getByTestId("left-c").textContent).toMatch(/431 g left of 431/);
    expect(screen.getByTestId("left-f").textContent).toMatch(/75 g left of 75/);
    expect(screen.getByTestId("food-mode").textContent).toBe("Maintenance");
    expect(screen.getByTestId("next-meal").textContent).toMatch(/Whenever you're ready/);
  });

  it("a day off is 2,700; the gym and boxing is a hard day, 3,600", async () => {
    await at(2027, 2, 19, 6, 0);   // Friday: no session
    food();
    expect(screen.getByTestId("day-type").textContent).toBe("Day off · 2,700 kcal");
    cleanup();
    await at(2027, 2, 15, 6, 0, spp({ boxDays: { mon: 1 } }));
    food();
    expect(screen.getByTestId("day-type").textContent).toBe("Hard day · 3,600 kcal");
  });

  it("food typed in is read, shown before it's added, and comes off what's left", async () => {
    await at(2027, 2, 15, 7, 15);
    food();
    expect(addBtn()).toBeDisabled();
    type("200g cooked mince, 250g pasta");
    const pv = screen.getByTestId("food-preview");
    expect([...pv.querySelectorAll("[data-preview-item]")].map((x) => x.getAttribute("data-preview-item"))).toEqual(["ok", "ok"]);
    expect(pv.textContent).toMatch(/Beef mince 5%, cooked/);
    expect(pv.textContent).toMatch(/Pasta, cooked/);
    expect(screen.getByTestId("preview-total").textContent).toBe("744 kcal · 72 g protein · 82 g carbs · 14 g fat");
    expect(addBtn().textContent).toBe("ADD · 744 KCAL");
    fireEvent.click(addBtn());
    expect(left()).toBe("2,456");
    expect(screen.getByTestId("left-p").textContent).toMatch(/128 g left of 200/);
    expect(screen.getByTestId("toast").textContent).toMatch(/Logged · 744 kcal · 72 g protein/);
    expect(screen.getByTestId("food-text").value).toBe("");
    /* stored for the day, with what it was made of */
    const e = stored();
    expect(e.from).toBe("2027-02-15");
    expect(e.days["2027-02-15"].map((x) => [x.at, x.text, x.kcal, x.p])).toEqual([[435, "200g cooked mince, 250g pasta", 744, 72.3]]);
    expect(e.days["2027-02-15"][0].items.map((x) => x.n)).toEqual(["Beef mince 5%, cooked", "Pasta, cooked"]);
    /* the next meal: three hours on */
    expect(screen.getByTestId("next-at").textContent).toBe("About 10:15");
    expect(screen.getByTestId("next-aim").textContent).toMatch(/about 32 g protein and 614 kcal — 4 meals to come/);
    /* deleted, it all comes back */
    fireEvent.click(within(screen.getByTestId("food-log")).getByRole("button", { name: "Delete 200g cooked mince, 250g pasta" }));
    expect(left()).toBe("3,200");
    expect(stored().days["2027-02-15"]).toEqual([]);
  });

  it("the time can be typed: the clock runs from when it was eaten", async () => {
    await at(2027, 2, 15, 9, 0);
    food();
    type("ufit");
    fireEvent.change(within(screen.getByTestId("food-add")).getByPlaceholderText("09:00"), { target: { value: "0545" } });
    fireEvent.click(addBtn());
    expect(stored().days["2027-02-15"][0].at).toBe(345);
    expect(screen.getByTestId("next-at").textContent).toBe("Now");
  });

  it("what it can't read, it says, and a food from its packet is read from then on", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    type("2 eggs, 60g zog bar");
    const items = [...screen.getByTestId("food-preview").querySelectorAll("[data-preview-item]")].map((x) => x.getAttribute("data-preview-item"));
    expect(items).toEqual(["ok", "unknown"]);
    expect(screen.getByTestId("food-preview").textContent).toMatch(/Not in the list: "60g zog bar"/);
    expect(addBtn()).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "ADD IT FROM THE PACKET" }));
    const form = screen.getByTestId("my-food-form");
    expect(within(form).getByPlaceholderText("Name, as you'll type it").value).toBe("zog bar");
    fireEvent.change(within(form).getByPlaceholderText("kcal"), { target: { value: "357" } });
    fireEvent.change(within(form).getByPlaceholderText("protein g"), { target: { value: "33" } });
    fireEvent.change(within(form).getByPlaceholderText("carbs g"), { target: { value: "28" } });
    fireEvent.change(within(form).getByPlaceholderText("fat g"), { target: { value: "13" } });
    fireEvent.click(within(form).getByRole("button", { name: "SAVE THE FOOD" }));
    expect(stored().foods.map((x) => [x.id, x.n, x.std])).toEqual([["u-zog-bar", "zog bar", [357, 33, 28, 13]]]);
    expect(screen.getByTestId("my-foods").textContent).toMatch(/zog bar/);
    expect(addBtn().textContent).toBe("ADD · 366 KCAL");
    fireEvent.click(addBtn());
    expect(left()).toBe("2,834");
  });

  it("a food that needs its grams asks for them, and offers some: one tap fills it in", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    type("chicken");
    const pv = screen.getByTestId("food-preview");
    expect(pv.textContent).toMatch(/How many grams of chicken breast\? Type it like "200g chicken", or pick one\./);
    expect(addBtn()).toBeDisabled();
    expect([...pv.querySelectorAll("[data-pick]")].map((b) => b.textContent)).toEqual(["1 breast (about 150 g)", "100 g", "150 g", "200 g", "125 g for 40 g protein"]);
    fireEvent.click(within(pv).getByRole("button", { name: "150 g" }));
    expect(screen.getByTestId("food-text").value).toBe("150g chicken");
    expect(addBtn().textContent).toBe("ADD · 222 KCAL");
    /* a drink is asked for in millilitres, a spread by the spoon */
    type("latte, butter");
    expect(screen.getByTestId("food-preview").textContent).toMatch(/Type it like "1 tbsp butter"/);
    expect([...screen.getByTestId("food-preview").querySelectorAll("[data-pick]")].map((b) => b.textContent)).toEqual(["1 tbsp (15 g)", "1 tsp (5 g)", "1 knob (about 10 g)"]);
  });

  it("the meals from the old plan are one tap each, and the next meal offers the ones that fit", async () => {
    await at(2027, 2, 15, 17, 0);
    food();
    fireEvent.click(screen.getByRole("button", { name: /Your meals, one tap each/ }));
    fireEvent.click(within(screen.getByTestId("meal-list")).getByText("Steak & eggs"));
    expect(addBtn().textContent).toBe("ADD · 943 KCAL");
    fireEvent.click(addBtn());
    expect(stored().days["2027-02-15"].map((x) => [x.text, x.kcal, x.p])).toEqual([["Steak & eggs", 943, 78]]);
    expect(left()).toBe("2,257");
    /* the next meal: ideas that fit, breakfasts only in the morning */
    const ideas = [...screen.getByTestId("next-meal").querySelectorAll("[data-idea]")].map((b) => b.getAttribute("data-idea"));
    expect(ideas.length).toBe(3);
    expect(ideas.some((k) => /porridge|bagelbf|bagelbb/.test(k))).toBe(false);
    fireEvent.click(screen.getByTestId("next-meal").querySelector("[data-idea]"));
    expect(addBtn().textContent).toMatch(/^ADD · /);
  });

  it("late in the day and short of protein, it says what a bottle does about it", async () => {
    await at(2027, 2, 15, 19, 30);
    food();
    type("2 bagels");
    fireEvent.change(within(screen.getByTestId("food-add")).getByPlaceholderText("19:30"), { target: { value: "16:00" } });
    fireEvent.click(addBtn());
    expect(screen.getByTestId("next-meal").textContent).toMatch(/A UFIT bottle is 50 g of the 182 g protein still to go\./);
  });

  it("the slight surplus is a switch: 250 more, kept from today on", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    fireEvent.click(screen.getByRole("button", { name: "SLIGHT SURPLUS" }));
    expect(screen.getByTestId("day-type").textContent).toBe("Gym day · 3,450 kcal");
    expect(screen.getByTestId("food-mode").textContent).toBe("Slight surplus");
    expect(stored().surplus).toEqual([{ at: "2027-02-15", on: true }]);
    cleanup();
    await at(2027, 2, 16, 7, 0, spp(), { "o8s-eat": stored() });
    food();
    expect(screen.getByTestId("day-type").textContent).toBe("Gym day · 3,450 kcal");
  });
});

describe("the box is a calculator over the food list", () => {
  it("20 g of raisins: the numbers show before anything is added, with what the day would have left", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    type("20g raisins");
    const pv = screen.getByTestId("food-preview");
    expect(pv.querySelector("[data-preview-row]").textContent).toBe("Raisins or sultanas20 g59 kcalP 1 · C 14 · F 0");
    expect(screen.getByTestId("preview-total").textContent).toBe("59 kcal · 1 g protein · 14 g carbs · 0 g fat");
    expect(screen.getByTestId("preview-after").textContent).toBe("After it: 3,141 kcal and 200 g protein left");
    expect(addBtn().textContent).toBe("ADD · 59 KCAL");
    /* nothing is logged by looking */
    expect(left()).toBe("3,200");
    expect(stored().days).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: "Clear the box" }));
    expect(screen.getByTestId("food-text").value).toBe("");
    expect(screen.queryByTestId("food-preview")).toBeNull();
    /* over the day: it says by how much */
    type("3kg pasta");
    expect(screen.getByTestId("preview-after").textContent).toBe("After it: 1,600 kcal over and 29 g protein left");
  });

  it("a food opened up: its numbers per 100 g, cooked or raw, and the other foods it could have been", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    type("150g chicken, 2 eggs");
    expect(screen.queryByTestId("food-change")).toBeNull();
    const row = () => screen.getByTestId("food-preview").querySelector('[data-preview-row="0"]');
    expect(row().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(row());
    expect(row().getAttribute("aria-expanded")).toBe("true");
    const ch = screen.getByTestId("food-change");
    expect(ch.textContent).toMatch(/Per 100 gCooked: 148 kcal · P 32 · C 0 · F 2\.2Raw: 106 kcal · P 24 · C 0 · F 1\.1/);
    expect([...ch.querySelectorAll("[data-pick^=state]")].map((b) => [b.textContent, b.getAttribute("aria-pressed")])).toEqual([["Weighed cooked", "true"], ["Weighed raw", "false"]]);
    expect([...ch.querySelectorAll("[data-pick^='f-']")].map((b) => b.textContent)).toEqual(["Chicken thigh (no skin)", "Chicken thigh, skin on", "Chicken drumstick", "Chicken wings", "Roast chicken (meat only)", "Sliced chicken (deli)"]);
    /* weighed raw: the entry is written again, and read again */
    fireEvent.click(within(ch).getByRole("button", { name: "Weighed raw" }));
    expect(screen.getByTestId("food-text").value).toBe("150g raw chicken, 2 eggs");
    expect(row().textContent).toMatch(/^Chicken breast, raw150 g159 kcal/);
    expect(within(screen.getByTestId("food-change")).getByRole("button", { name: "Weighed raw" }).getAttribute("aria-pressed")).toBe("true");
    /* it was thigh: one tap, and the food is shut again */
    fireEvent.click(within(screen.getByTestId("food-change")).getByRole("button", { name: "Chicken thigh (no skin)" }));
    expect(screen.getByTestId("food-text").value).toBe("150g chicken thigh, 2 eggs");
    expect(row().textContent).toMatch(/^Chicken thigh \(no skin\), cooked150 g270 kcal/);
    expect(screen.queryByTestId("food-change")).toBeNull();
    expect(addBtn().textContent).toBe("ADD · 422 KCAL");
    /* a food with one set of numbers has no cooked or raw to pick */
    fireEvent.click(screen.getByTestId("food-preview").querySelector('[data-preview-row="1"]'));
    expect(screen.getByTestId("food-change").textContent).toMatch(/Per 100 g131 kcal · P 12\.6 · C 0 · F 9/);
    expect(screen.getByTestId("food-change").querySelector("[data-pick^=state]")).toBeNull();
  });

  it("a food it can't read: the closest names in the list, one tap each", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    type("20g raisens");
    expect(addBtn()).toBeDisabled();
    const close = screen.getByTestId("food-close");
    expect(close.textContent).toMatch(/^Closest in the listRaisins or sultanas/);
    fireEvent.click(within(close).getByRole("button", { name: "Raisins or sultanas" }));
    expect(screen.getByTestId("food-text").value).toBe("20g raisins");
    expect(addBtn().textContent).toBe("ADD · 59 KCAL");
  });

  it("a word it didn't use is said, so a wrong match shows", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    type("chicken pizza 2 slices");
    expect(screen.getByTestId("food-extra").textContent).toBe("Read as pizza, cheese and tomato. It didn't use \"chicken\": tap the food if it's the wrong one.");
    type("2 slices of pizza");
    expect(screen.queryByTestId("food-extra")).toBeNull();
  });

  it("the food list, looked up: per 100 g, and a tap puts the food in the box", async () => {
    await at(2027, 2, 15, 7, 0);
    food();
    fireEvent.click(screen.getByRole("button", { name: /^Look up a food · 4\d\d in the list$/ }));
    const look = screen.getByTestId("food-lookup"), find = (s) => fireEvent.change(within(look).getByPlaceholderText("Raisins, chicken thigh, rice…"), { target: { value: s } });
    expect(look.textContent).toMatch(/Calories, protein, carbs and fat per 100 g, the way a packet prints them\./);
    find("raisin");
    const hit = look.querySelector('[data-food="f-raisins-or-sultanas"]');
    expect(hit.textContent).toBe("Raisins or sultanas295 kcal · P 2.5 · C 70 · F 0.5Per 100 g");
    find("pasta");
    expect(look.querySelector('[data-food="f-pasta"]').textContent).toBe("PastaCooked: 160 kcal · P 5.7 · C 32.7 · F 0.7Dry: 355 kcal · P 12.5 · C 72 · F 1.5Per 100 g");
    find("zzzz");
    expect(look.textContent).toMatch(/Nothing close to that in the list\. Add it from its packet, below\./);
    /* a tap: the food goes in the box with a weight to change, after whatever is there */
    type("2 eggs");
    find("raisin");
    fireEvent.click(look.querySelector('[data-food="f-raisins-or-sultanas"]'));
    expect(screen.getByTestId("food-text").value).toBe("2 eggs, 100g raisins");
    find("egg");
    expect(look.querySelector('[data-food="f-egg"]').textContent).toBe("Egg131 kcal · P 12.6 · C 0 · F 9Per 100 g · 1 egg is 58 g");
    type("");
    fireEvent.click(look.querySelector('[data-food="f-egg"]'));
    expect(screen.getByTestId("food-text").value).toBe("1 egg");
    find("milk");
    fireEvent.click(look.querySelector('[data-food="f-semi-skimmed-milk"]'));
    expect(screen.getByTestId("food-text").value).toBe("1 egg, 250ml milk");
    /* a food typed in from its own packet is in the list too */
    expect(look.querySelector('[data-food="f-semi-skimmed-milk"]').textContent).toMatch(/Per 100 ml$/);
  });
});

describe("the rest of the app", () => {
  it("TODAY's home has a food row: what's left and when to eat next; it opens FOOD · TODAY", async () => {
    const eat = { from: "2027-02-15", days: { "2027-02-15": [{ id: "x", at: 300, text: "ufit", kcal: 288, p: 50, c: 18, f: 1 }] } };
    await at(2027, 2, 15, 6, 0, spp(), { "o8s-eat": eat });
    const row = screen.getByTestId("food-row");
    expect(row.textContent).toBe("Food2,912 kcal and 150 g protein left · next meal about 08:00");
    fireEvent.click(row);
    expect(screen.getByTestId("food-today")).toBeInTheDocument();
  });

  it("the day's list keeps the drinks at their times, and no meal rows", async () => {
    await at(2027, 2, 15, 6, 0);
    if (!screen.queryByTestId("whole-day")) fireEvent.click(screen.getByRole("button", { name: "WHOLE DAY" }));
    for (let k = 0; k < 8; k++) { const b = document.querySelector("[data-chapter] [aria-expanded=false]"); if (!b) break; fireEvent.click(b); }
    const names = [...document.querySelectorAll("[data-flow-name]")].map((e) => e.getAttribute("data-flow-name"));
    expect(names.some((n) => /PORRIDGE|BATCH|HALF BOTTLE|STEAK|CHICKEN|LOAD|BAGEL/.test(n))).toBe(false);
    expect(names).toContain("300 ml water, the creatine in it");
    expect(names).toContain("Urine check at ten");
    expect(names).toContain("The last big drink — 250 ml");
  });

  it("MEALS keeps the old plan, as ideas", async () => {
    await at(2027, 2, 15, 6, 0);
    tab("Food");
    fireEvent.click(screen.getByRole("button", { name: "MEALS" }));
    const menu = screen.getByTestId("food-menu");
    expect(menu.textContent).toMatch(/The old plan's meals, as ideas/);
    expect(within(menu).getAllByText("PORRIDGE").length).toBeGreaterThan(0);
  });

  it("WATER shows the water, not the old plan's calories", async () => {
    await at(2027, 2, 15, 6, 0);
    tab("Food");
    fireEvent.click(screen.getByRole("button", { name: "WATER" }));
    expect(screen.getByTestId("water-total")).toBeInTheDocument();
    expect(screen.queryByTestId("fuel-phase")).toBeNull();
  });

  it("the food log is in the backup, and comes back from it", async () => {
    const eat = { from: "2027-02-15", days: { "2027-02-15": [{ id: "x", at: 300, text: "ufit", kcal: 288, p: 50, c: 18, f: 1 }] },
      foods: [{ id: "u-bar", n: "bar", keys: ["bar"], mine: true, std: [400, 30, 40, 12] }], surplus: [{ at: "2027-02-15", on: true }] };
    await at(2027, 2, 15, 6, 0, spp(), { "o8s-eat": eat });
    tab("More");
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "IMPORT" }));
    fireEvent.click(screen.getByRole("button", { name: "EXPORT" }));
    const box = screen.getByPlaceholderText("Paste a backup here, then tap load");
    await waitFor(() => expect(box.value.length).toBeGreaterThan(50));
    const out = JSON.parse(box.value);
    expect(out.eat).toEqual(eat);
    /* wiped, then loaded back */
    localStorage.setItem("o8s-eat", "{}");
    fireEvent.change(box, { target: { value: JSON.stringify(Object.assign({}, out, { eat: Object.assign({}, eat, { from: "2027-02-01" }) })) } });
    fireEvent.click(screen.getByRole("button", { name: "LOAD THIS BACKUP" }));
    await waitFor(() => expect(stored().from).toBe("2027-02-01"));
    expect(stored().days).toEqual(eat.days);
  });

  it("a backup from before the food log loads, with an empty one", async () => {
    await at(2027, 2, 15, 6, 0, spp(), { "o8s-eat": { from: "2027-02-10", days: {} } });
    tab("More");
    fireEvent.click(within(screen.getByTestId("more-menu")).getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "IMPORT" }));
    fireEvent.change(screen.getByPlaceholderText("Paste a backup here, then tap load"), { target: { value: JSON.stringify({ st: spp(), log: {}, maxes: MAXES }) } });
    fireEvent.click(screen.getByRole("button", { name: "LOAD THIS BACKUP" }));
    await waitFor(() => expect(stored()).toEqual({}));
    tab("Food");
    expect(screen.getByTestId("food-today")).toBeInTheDocument();
  });
});
