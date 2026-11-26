import { describe, it, expect } from "vitest";
import { TABLE, LIST, GROUPS, parseList } from "./food-list.js";
import { FOODS, readEntry, readPart, others, near, rewrite, amountsFor, per100Of, foodById, myFood, norm } from "./food.js";

/* THE FOOD LIST (brief 34): several hundred everyday foods with their
   numbers per 100 g, and the reader that finds the right one in what's
   typed. "20g raisins" is the user's own example. */
const say = (t, o) => readEntry(t, o).items.map((x) => (x.unknown ? "not in the list" : x.needG ? "how much? " + x.food.n : x.name + " · " + x.amount + " · " + x.kcal));
const one = (t, o) => readEntry(t, o).items[0];
const food = (n) => FOODS.find((f) => f.n === n);
const STATES = ["std", "raw", "cooked", "dry"];

describe("the list itself", () => {
  it("every line reads: a name, the names it's typed as, four numbers per 100 g, and its portions", () => {
    expect(parseList(TABLE, true).length).toBe(LIST.length);
    expect(LIST.length).toBeGreaterThan(450);
    expect(GROUPS).toEqual(["Meat and poultry", "Fish and seafood", "Eggs and dairy", "Bread and bakery", "Breakfast cereals", "Rice, pasta and grains", "Potatoes", "Vegetables and salad", "Fruit",
      "Beans, nuts and seeds", "Oils, sauces and spreads", "Snacks, sweets and puddings", "Drinks", "Meals and takeaway", "Sports nutrition"]);
    LIST.forEach((f) => expect([f.n, f.keys.length > 0, STATES.some((s) => f[s])]).toEqual([f.n, true, true]));
    /* a line that's wrong is named when the tests read it, and left out when the app does */
    expect(() => parseList("Thing | thing | 100 1 2", true)).toThrow(/line 1.*its numbers/);
    expect(() => parseList("Thing | thing | 100 1 2 3 | 1 thing > 5", true)).toThrow(/its portions/);
    expect(() => parseList("Thing | thing | 100 1 2 3; raw 90 1 2 3", true)).toThrow(/its numbers/);
    expect(parseList("Thing | thing | 100 1 2")).toEqual([]);
    expect(parseList("# Group\nThing | thing, other | raw 100 10 5 2; cooked 150 15 7 3 +4 | per piece ~ 40; tbsp 12; ml")).toEqual([{ id: "f-thing", n: "Thing", keys: ["thing", "other"], grp: "Group",
      raw: [100, 10, 5, 2], cooked: [150, 15, 7, 3], plus: { cooked: 4 }, each: { g: 40, w: "piece", about: true, ask: true }, unit: { tbsp: 12 }, liquid: true }]);
  });

  it("the calories on every line are what its protein, carbs and fat add up to (4, 4 and 9 a gram)", () => {
    const off = [];
    LIST.forEach((f) => STATES.forEach((s) => { const m = f[s]; if (!m) return;
      const sum = 4 * m[1] + 4 * m[2] + 9 * m[3] + ((f.plus || {})[s] || 0);
      if (Math.abs(m[0] - sum) > Math.max(12, 0.08 * m[0])) off.push(f.n + " " + s + ": " + m[0] + " against " + Math.round(sum)); }));
    expect(off).toEqual([]);
  });

  it("no number is out of range, and a portion is a sensible weight", () => {
    LIST.forEach((f) => {
      STATES.forEach((s) => { const m = f[s]; if (!m) return;
        expect([f.n, m[0] <= 900, m[1] <= 100 && m[2] <= 100 && m[3] <= 100, m[1] + m[2] + m[3] <= 101]).toEqual([f.n, true, true, true]); });
      if (f.dry && f.cooked) expect([f.n, f.dry[0] > f.cooked[0] * 2]).toEqual([f.n, true]);          // cooked in water: under half the calories of the same weight dry
      if (f.each) expect([f.n, f.each.g > 0 && f.each.g <= 600, /^[a-z ]+$/.test(f.each.w)]).toEqual([f.n, true, true]);
      Object.keys(f.unit || {}).forEach((u) => expect([f.n, u, f.unit[u] > 0 && f.unit[u] <= 800]).toEqual([f.n, u, true]));
    });
  });

  it("no two foods share a name, and every name reads back as its own food with nothing left over", () => {
    const seen = {}, twice = [];
    FOODS.forEach((f) => f.keys.forEach((k) => { const n = norm(k); if (seen[n] && seen[n] !== f) twice.push(n); seen[n] = f; }));
    expect(twice).toEqual([]);
    expect(new Set(FOODS.map((f) => f.id)).size).toBe(FOODS.length);
    const wrong = [];
    FOODS.forEach((f) => f.keys.forEach((k) => { const r = readPart("100g " + k, FOODS); if (r.food !== f || (r.extra && r.extra.length)) wrong.push(k + " → " + (r.food ? r.food.n : "nothing")); }));
    expect(wrong).toEqual([]);
  });

  it("the numbers checked against the packet or the UK food tables", () => {
    /* [food, state, kcal, protein, carbs, fat]: a UK packet's panel, or McCance and Widdowson's 2021 tables */
    [["Raisins or sultanas", "std", 295, 2.5, 70, 0.5], ["Chicken breast", "cooked", 148, 32, 0, 2.2], ["Chicken breast", "raw", 106, 24, 0, 1.1], ["Back bacon", "cooked", 287, 23.2, 0, 21.6],
      ["Greek yoghurt, strained, 0% fat", "std", 54, 10.3, 3, 0], ["Greek yoghurt, strained, 5% fat", "std", 93, 9, 3, 5], ["Weetabix", "std", 362, 12, 69, 2], ["Jacket potato", "std", 100, 2.5, 22, 0.2],
      ["Chip shop chips", "std", 215, 3.5, 31, 8.4], ["Doner kebab in pitta with salad", "std", 248, 14.1, 12.5, 16], ["Mars bar", "std", 447, 4.3, 69, 16.7], ["Sausage roll", "std", 330, 9.5, 24, 22],
      ["Pasta", "cooked", 160, 5.7, 32.7, 0.7], ["Beef mince 5%", "raw", 124, 21, 0, 4.5], ["Egg", "std", 131, 12.6, 0, 9], ["Cheddar", "std", 416, 25.4, 0.1, 34.9], ["Semi-skimmed milk", "std", 47, 3.6, 4.8, 1.7],
    ].forEach(([n, s, ...m]) => expect([n, s, food(n)[s]]).toEqual([n, s, m]));
    /* and by the item, as the packet gives it */
    expect(say("pot noodle, mars bar, 2 weetabix, big mac, sausage roll, bag of crisps, a pint")).toEqual(["Pot Noodle · 1 pot · 411", "Mars bar · 1 bar · 228", "Weetabix · 2 biscuits · 136", "Big Mac · 1 burger · 501",
      "Sausage roll · 1 roll (about 100 g) · 330", "Crisps · 1 bag (about 25 g) · 130", "Lager or beer (about 4.5%) · 1 pint · 210"]);
  });
});

describe("the food typed, found in the list", () => {
  it("20 g of raisins: the food is known, and the numbers are worked out from its weight", () => {
    const r = readEntry("20g raisins");
    expect(r.ok).toBe(true);
    expect(r.items[0]).toMatchObject({ name: "Raisins or sultanas", amount: "20 g", kcal: 59, p: 0.5, c: 14, f: 0.1 });
    expect(r.total).toEqual({ kcal: 59, p: 0.5, c: 14, f: 0.1 });
  });

  it("the name that fits best wins: the most words, then the thing said last", () => {
    [["150g chicken thigh", "Chicken thigh (no skin), cooked · 150 g · 270"], ["roast chicken thigh 150g", "Chicken thigh (no skin), cooked · 150 g · 270"],
      ["150g cooked chicken", "Chicken breast, cooked · 150 g · 222"], ["yoghurt greek 0% 200g", "Greek yoghurt, strained, 0% fat · 200 g · 108"], ["greek yoghurt 200g", "Greek yoghurt, strained, 5% fat · 200 g · 186"],
      ["150g Greek-style yogurt", "Greek-style yoghurt · 150 g · 188"], ["mince 5% 200g", "Beef mince 5%, cooked · 200 g · 344"], ["strawberry milkshake 300ml", "Milkshake or flavoured milk (bottled) · 300 ml · 189"],
      ["chocolate milk 300ml", "Milkshake or flavoured milk (bottled) · 300 ml · 189"], ["milk chocolate 30g", "Milk chocolate · 30 g · 161"], ["baked sweet potato 200g", "Sweet potato, cooked · 200 g · 230"],
      ["chicken zinger burger", "Chicken burger (fast food) · 1 burger · 390"], ["mushroom soup 400g", "Soup, tomato or vegetable · 400 ml · 192"], ["cup of green tea", "Tea or coffee, no milk · 1 mug · 3"],
      ["cup of tea", "Tea or coffee with milk · 1 mug · 16"], ["smoked salmon 100g", "Smoked salmon · 100 g · 184"], ["half fat cheddar 40g", "Cheddar, lighter · 40 g · 125"],
      ["3 egg omelette", "Omelette (3 eggs) · 1 omelette (about 165 g) · 322"], ["tesco chicken breast 200g", "Chicken breast, cooked · 200 g · 296"],
    ].forEach(([t, want]) => expect([t, say(t)]).toEqual([t, [want]]));
  });

  it("a food whose own name holds 'and' or 'with' is kept whole; anything else is split there", () => {
    expect(say("fish and chips")).toEqual(["Fish and chips (chip shop) · 1 portion (about 480 g) · 1090"]);
    expect(say("fish & chips and a coke")).toEqual(["Fish and chips (chip shop) · 1 portion (about 480 g) · 1090", "Cola · 1 can · 139"]);
    expect(say("fish 'n' chips")).toEqual(["Fish and chips (chip shop) · 1 portion (about 480 g) · 1090"]);
    expect(say("mac n cheese")).toEqual(["Macaroni cheese · 1 portion (about 350 g) · 578"]);
    expect(say("ben & jerry's 100g")).toEqual(["Premium ice cream (tub) · 100 g · 250"]);
    expect(say("coffee with milk")).toEqual(["Tea or coffee with milk · 1 mug · 16"]);
    expect(say("2 weetabix with 200ml milk")).toEqual(["Weetabix · 2 biscuits · 136", "Semi-skimmed milk · 200 ml · 94"]);
    expect(say("big mac and fries")).toEqual(["Big Mac · 1 burger · 501", "Fries (fast food) · 1 portion (about 114 g) · 337"]);
  });

  it("spellings, accents, hyphens and 's are read through", () => {
    expect(one("200g greek yogurt").name).toBe(one("200g Greek yoghurt").name);
    expect(say("crème fraîche 30g")).toEqual(["Crème fraîche · 30 g · 90"]);
    expect(say("semi-skimmed milk 200ml")).toEqual(["Semi-skimmed milk · 200 ml · 94"]);
    expect(say("shepherd's pie 400g")).toEqual(["Cottage or shepherd's pie · 400 g · 460"]);
    expect(say("walker's crisps")).toEqual(["Crisps · 1 bag (about 25 g) · 130"]);
    expect(one("walker's crisps").extra).toBeNull();
    expect(say("houmous 50g")).toEqual(["Hummus · 50 g · 150"]);
  });

  it("amounts: ounces and pounds, halves and dozens, a number on its own, an amount after a comma", () => {
    [["8oz steak", "Steak (sirloin or rump), cooked · 226.8 g · 454"], ["1lb mince", "Beef mince 5%, cooked · 453.6 g · 780"], ["1 and a half bagels", "Plain bagel · 1.5 bagels · 330"],
      ["half an avocado", "Avocado · half an avocado (about 65 g) · 124"], ["a couple of eggs", "Egg · 2 eggs · 152"], ["a dozen eggs", "Egg · 12 eggs · 912"],
      ["double vodka", "Spirits (vodka, gin, whisky, rum) · 2 singles · 111"], ["200 rice", "Rice, cooked · 200 g · 260"], ["100 chicken", "Chicken breast, cooked · 100 g · 148"],
      ["30 almonds", "Almonds · 30 almonds (about 36 g) · 220"], ["chicken, 150g", "Chicken breast, cooked · 150 g · 222"], ["150g, chicken", "Chicken breast, cooked · 150 g · 222"],
    ].forEach(([t, want]) => expect([t, say(t)]).toEqual([t, [want]]));
    /* too small a number to be grams, and nothing it's counted in: it asks */
    expect(say("2 rice")).toEqual(["how much? Rice"]);
  });

  it("spoons, slices, tins, glasses and pints: what one of them weighs comes from the food", () => {
    [["1 tbsp olive oil", "Oil (olive, vegetable or sunflower) · 1 tbsp (14 g) · 126"], ["2 tsp sugar", "Sugar · 2 tsp (8 g) · 32"], ["handful of almonds", "Almonds · 1 handful (30 g) · 183"],
      ["2 slices of pizza", "Pizza, cheese and tomato · 2 slices (160 g) · 416"], ["2 tins of tomatoes", "Tinned chopped tomatoes · 2 tins (800 g) · 176"], ["tin of chickpeas", "Tinned chickpeas · 1 tin (240 g) · 288"],
      ["a chocolate bar", "Milk chocolate · 1 bar (45 g) · 241"], ["2 squares dark chocolate", "Dark chocolate · 2 squares (20 g) · 116"], ["2 scoops whey", "Whey protein powder · 2 scoops (60 g) · 240"],
      ["bowl of cornflakes", "Cornflakes · 1 bowl (30 g) · 113"], ["a pint", "Lager or beer (about 4.5%) · 1 pint · 210"], ["pint of milk", "Semi-skimmed milk · 1 pint (568 ml) · 267"],
      ["bottle of coke", "Cola · 1 bottle (500 ml) · 210"], ["can of coke", "Cola · 1 can · 139"], ["can of lager", "Lager or beer (about 4.5%) · 1 can (440 ml) · 163"],
      ["glass of red wine", "Wine · 1 glass (about 175 ml) · 149"], ["bottle of wine", "Wine · 1 bottle (750 ml) · 638"], ["2 pieces of toast", "White bread · 2 slices · 190"],
      ["piece of cake", "Sponge cake · 1 piece (70 g) · 273"], ["portion of peas", "Peas · 1 portion (80 g) · 58"], ["2 chicken slices", "Sliced chicken (deli) · 2 slices (50 g) · 59"],
    ].forEach(([t, want]) => expect([t, say(t)]).toEqual([t, [want]]));
    /* a word for an amount that's in a food's name has to be said in the name's order */
    expect(say("cheese slice, slice of cheese")).toEqual(["Cheese slice (processed) · 1 slice · 57", "Cheddar · 1 slice (25 g) · 104"]);
    /* an amount the food doesn't have is asked about, never guessed */
    expect(say("2 slices chicken, bowl of pasta, tub of ice cream")).toEqual(["how much? Chicken breast", "how much? Pasta", "how much? Vanilla ice cream"]);
  });

  it("raw, cooked and dry: cooked unless it says otherwise, and uncooked rice is dry rice", () => {
    expect(say("100g rice, 100g uncooked rice, 100g dry rice, 150g boiled rice")).toEqual(["Rice, cooked · 100 g · 130", "Rice, dry · 100 g · 355", "Rice, dry · 100 g · 355", "Rice, cooked · 150 g · 195"]);
    expect(say("200g raw chicken, 200g grilled chicken")).toEqual(["Chicken breast, raw · 200 g · 212", "Chicken breast, cooked · 200 g · 296"]);
    expect(one("75g dry pasta")).toMatchObject({ state: "dry", states: ["cooked", "dry"], kcal: 266 });
    expect(one("20g raisins")).toMatchObject({ state: null, states: [] });
  });

  it("a typical portion: one of a thing that's eaten whole, and a question for a food that's weighed", () => {
    expect(say("kebab, jacket potato, protein bar, full english")).toEqual(["Doner kebab in pitta with salad · 1 kebab (about 400 g) · 992", "Jacket potato · 1 potato (about 200 g) · 200",
      "Protein bar · 1 bar (about 60 g) · 219", "Full English breakfast · 1 breakfast (about 480 g) · 941"]);
    expect(say("chicken, salmon, steak, pizza, bacon")).toEqual(["how much? Chicken breast", "how much? Salmon", "how much? Steak (sirloin or rump)", "how much? Pizza, cheese and tomato", "how much? Back bacon"]);
    expect(say("2 chicken breasts, a salmon fillet, 2 rashers of bacon, a pizza")).toEqual(["Chicken breast, cooked · 2 breasts (about 300 g) · 444", "Salmon, cooked · 1 fillet (about 110 g) · 253",
      "Back bacon, cooked · 2 rashers (about 50 g) · 144", "Pizza, cheese and tomato · 1 pizza (about 350 g) · 910"]);
  });

  it("a word it didn't use is said, so a wrong match shows", () => {
    expect(one("chicken pizza 2 slices")).toMatchObject({ name: "Pizza, cheese and tomato", extra: ["chicken"] });
    expect(one("peanut butter on toast 1 tbsp")).toMatchObject({ name: "Peanut butter", extra: ["toast"] });
    expect(one("chocolate whey 30g")).toMatchObject({ name: "Whey protein powder", extra: ["chocolate"] });
    expect(one("chicken salad")).toMatchObject({ needG: true, extra: ["chicken"] });
    expect(one("200g cooked lean beef mince").extra).toBeNull();
  });

  it("a food typed in from its own packet is read before the list's", () => {
    const mine = [myFood({ name: "Raisins", per: "100", kcal: 320, p: 3, c: 75, f: 1 })];
    expect(one("20g raisins", { mine })).toMatchObject({ id: "u-raisins", kcal: 64 });
    expect(one("20g sultanas", { mine })).toMatchObject({ name: "Raisins or sultanas", kcal: 59 });
    const bar = [myFood({ name: "Grenade bar", per: "item", g: 60, kcal: 214, p: 20, c: 17, f: 8 })];
    expect(say("2 grenade bar")).toEqual(["Protein bar · 2 bars (about 120 g) · 438"]);
    expect(say("2 grenade bar", { mine: bar })).toEqual(["Grenade bar · 2 items · 428"]);
    /* the same name saved again with other numbers: the new numbers are the ones read */
    const again = [myFood({ name: "Raisins", per: "100", kcal: 280, p: 2, c: 66, f: 0.4 })];
    expect(one("20g raisins", { mine: again }).kcal).toBe(56);
    expect(one("20g raisins").kcal).toBe(59);
  });
});

describe("picking the right food", () => {
  it("the other foods the same words could mean, the nearest kind first", () => {
    expect(others(food("Chicken breast"), "chicken").map((f) => f.n)).toEqual(["Chicken thigh (no skin)", "Chicken thigh, skin on", "Chicken drumstick", "Chicken wings", "Roast chicken (meat only)", "Sliced chicken (deli)"]);
    expect(others(food("Semi-skimmed milk"), "milk").map((f) => f.n).slice(0, 3)).toEqual(["Whole milk", "Skimmed milk", "Oat milk"]);
    expect(others(food("Potato"), "potato").map((f) => f.n)).toContain("Roast potatoes");
    expect(others(food("Whey protein powder"), "whey")).toEqual([]);
  });

  it("the closest names to one it couldn't read: a letter out, or the start of a word", () => {
    expect(near("raisens 20g").map((f) => f.n)[0]).toBe("Raisins or sultanas");
    expect(near("chiken thighs 200g").map((f) => f.n)[0]).toBe("Chicken thigh (no skin)");
    expect(near("yog").map((f) => f.n)).toContain("Natural yoghurt");
    expect(near("oat", null, 20).map((f) => f.n)).toEqual(expect.arrayContaining(["Porridge oats", "Oat milk", "Oatcakes"]));
    expect(near("zzzz")).toEqual([]);
    expect(near("200g")).toEqual([]);
  });

  it("the entry written again: another food, another state, another amount", () => {
    expect(rewrite("150g chicken, 2 eggs", 0, { key: "chicken thigh" })).toBe("150g chicken thigh, 2 eggs");
    expect(rewrite("150g chicken, 2 eggs", 0, { state: "raw" })).toBe("150g raw chicken, 2 eggs");
    expect(rewrite("150g raw chicken, 2 eggs", 0, { state: "cooked" })).toBe("150g cooked chicken, 2 eggs");
    expect(rewrite("chicken and rice", 0, { amount: "150g" })).toBe("150g chicken, rice");
    expect(rewrite("butter", 0, { amount: "1 tbsp" })).toBe("1 tbsp butter");
    expect(rewrite("60g zog bar, banana", 0, { key: "protein bar" })).toBe("60g protein bar, banana");
    expect(rewrite("half a tin of beans", 0, { key: "kidney beans" })).toBe("half a tin kidney beans");
    expect(rewrite("2 eggs", 5, { key: "ham" })).toBe("2 eggs");
    /* and what it writes reads as it should */
    expect(say(rewrite("150g chicken, 2 eggs", 0, { key: "chicken thigh" }))).toEqual(["Chicken thigh (no skin), cooked · 150 g · 270", "Egg · 2 eggs · 152"]);
    expect(say(rewrite("butter", 0, { amount: "1 tbsp" }))).toEqual(["Butter · 1 tbsp (15 g) · 112"]);
  });

  it("the amounts offered for a food that needs one, and the weight that gives a meal's protein", () => {
    expect(amountsFor(food("Chicken breast"), null, 40).map((a) => a.label)).toEqual(["1 breast (about 150 g)", "100 g", "150 g", "200 g", "125 g for 40 g protein"]);
    expect(amountsFor(food("Chicken breast"), "raw", 40).map((a) => a.label)).toContain("165 g for 40 g protein");
    expect(amountsFor(food("Honey")).map((a) => [a.label, a.amount])).toEqual([["1 tbsp (20 g)", "1 tbsp"], ["1 tsp (7 g)", "1 tsp"]]);
    expect(amountsFor(food("Semi-skimmed milk"), null, 40).map((a) => a.label)).toEqual(["250 ml", "500 ml"]);
    expect(amountsFor(food("Rice"), null, 40).map((a) => a.label)).toEqual(["100 g", "150 g", "200 g"]);
    /* a spoon or a scoop for a food measured that way, and no weight "for protein" from a food that's mostly fat */
    expect(amountsFor(food("Whey protein powder"), null, 40).map((a) => a.label)).toEqual(["1 scoop (30 g)", "50 g for 40 g protein"]);
    expect(amountsFor(food("Peanut butter"), null, 40).map((a) => a.label)).toEqual(["1 tbsp (16 g)", "1 tsp (8 g)"]);
    expect(amountsFor(food("Almonds"), null, 40).map((a) => a.label)).toEqual(["1 handful (30 g)", "100 g", "150 g", "200 g"]);
    expect(amountsFor(food("Natural yoghurt"), null, 40).map((a) => a.label)).toEqual(["1 pot (150 g)", "1 tbsp (30 g)", "100 g", "150 g", "200 g"]);
  });

  it("a food's numbers per 100 g, for each way it's weighed", () => {
    expect(per100Of(food("Pasta"))).toEqual([{ state: "cooked", m: [160, 5.7, 32.7, 0.7] }, { state: "dry", m: [355, 12.5, 72, 1.5] }]);
    expect(per100Of(food("Raisins or sultanas"))).toEqual([{ state: null, m: [295, 2.5, 70, 0.5] }]);
    expect(per100Of(food("UFIT 50g bottle"))[0].m.map(Math.round)).toEqual([58, 10, 4, 0]);
    expect(per100Of(food("The batch"))).toEqual([]);
    expect(foodById("f-raisins-or-sultanas")).toBe(food("Raisins or sultanas"));
    expect(foodById("nothing")).toBeNull();
  });
});
