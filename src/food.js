/* ================================================================
   THE DAY'S BUDGET — food as a budget you eat into, not a menu at set
   times (brief 34).

   Every day starts with its calories, protein, carbs and fat, set by what
   the day holds. What you eat comes off it; what's left is what matters.
   The clock starts at the first thing you eat, and the next meal is about
   three hours after the last one.

   The numbers, and where they come from:
   - Protein is fixed at 200 g a day (about 2.4 g/kg at 82 kg; the ISSN's
     2026 weight-loss stand puts lean lifters at 1.9–3.2 g/kg). Five meals
     of about 40 g; a UFIT bottle is one of them.
   - Calories follow the day's work, carbs taking the change (Burke and
     Jeukendrup: carbohydrate matched to the training it fuels): a gym day
     3,200, a hard day (the gym and boxing, or Saturday's long session)
     3,600, a day off 2,700.
   - Fat sits at 75 g. Carbs never drop below 3 g/kg and fat never below
     0.6 g/kg (the ISSN combat-sports stand's floors are 3–4 g/kg and
     0.5–1.0 g/kg); below that, the calories stop going down.
   - With no fight, the Sunday check holds the 7-morning average weight
     where it is (or, with the slight surplus on, lets it rise a little)
     by moving the day 150 kcal at a time.
   - With a fight and a weight limit, the weight plan already runs the cut
     (weight.js): its step comes off the day here, exactly as its own
     table says, and the Sunday check of the weight plan moves it.
   - Making weight's light days, the weigh-in day and the fight day keep
     the set plan: the timing is the point on those days.

   Nothing in here touches a session, a set, a load or a week.
   ================================================================ */
import { STEP_KCAL, averageOn, plusDays, isSunday, sundayOf } from "./weight.js";
import { LIST, GROUPS, UNIT, unitOf } from "./food-list.js";

export const PROTEIN = 200;
export const FAT = 75;
export const DAY_KCAL = { hard: 3600, gym: 3200, rest: 2700 };
export const DAY_NAME = { hard: "Hard day", gym: "Gym day", rest: "Day off" };
export const DAY_WHY = { hard: "the gym and boxing, or the long session", gym: "a gym session", rest: "no session" };
export const SURPLUS = 250;
export const STEP = 150;            // one Sunday's change, kcal a day
export const ADJ_MAX = 600;         // the most the Sunday checks move a day, either way
export const MEALS = 5;             // meals in a day, for the next meal's share
export const GAP = 180;             // minutes from one meal to the next
export const SAME_MEAL = 60;        // things eaten this close together are one meal
export const CARB_FLOOR = 3;        // g/kg
export const FAT_FLOOR = 0.6;       // g/kg
const r0 = (x) => Math.round(x);
const r1 = (x) => Math.round(x * 10) / 10;

/* ---------------- THE DAY ---------------- */
/* What the day holds: a hard day is the gym and boxing, or Saturday's long
   session; a gym day is one session, or boxing on its own; a day off is
   neither. */
export function dayType({ session, boxing, day }) {
  if (session && (boxing || day === "sat")) return "hard";
  if (session || boxing) return "gym";
  return "rest";
}

/* The day's numbers.
     type:    hard | gym | rest
     adj:     the Sunday checks' total, kcal a day
     surplus: the slight surplus is on
     step:    the weight plan's step, 0–4, when a cut is running
     kg:      body weight, for the floors */
export function targets({ type, adj, surplus, step, kg }) {
  const w = kg > 0 ? kg : 80;
  const cut = step != null && STEP_KCAL[step] != null ? STEP_KCAL[0] - STEP_KCAL[step] : 0;
  let kcal = (DAY_KCAL[type] || DAY_KCAL.gym) + (adj || 0) + (surplus && step == null ? SURPLUS : 0) - cut;
  const p = PROTEIN, cMin = r0(CARB_FLOOR * w), fMin = r0(FAT_FLOOR * w);
  let f = FAT, floor = false;
  let c = (kcal - p * 4 - f * 9) / 4;
  if (c < cMin) { f = Math.max(fMin, r0((kcal - p * 4 - cMin * 4) / 9)); c = (kcal - p * 4 - f * 9) / 4; }
  if (c < cMin) { c = cMin; kcal = p * 4 + c * 4 + f * 9; floor = true; }
  return { kcal: r0(kcal), p, c: r0(c), f, floor, cut };
}

/* The weight to use for the floors: the 7-morning average, or the last weight. */
export function bodyKg(weights, today) {
  const a = averageOn(weights, today).avg;
  if (a != null) return a;
  const days = Object.keys(weights || {}).filter((d) => d <= today && weights[d] > 0).sort();
  return days.length ? weights[days[days.length - 1]] : null;
}

/* ---------------- THE SUNDAY CHECK, WITH NO FIGHT ----------------
   Every Sunday from the second one after the budget began: this week's
   7-morning average against last week's.
     maintenance: down more than 0.3 kg → 150 more a day; up more than 0.3 → 150 less
     slight surplus: down at all → 150 more; up more than 0.35 → 150 less
   Weeks a cut is running are left out: the weight plan has those.
     surplusOn(sun) → the switch on that Sunday; cutOn(sun) → a cut running */
export function sundayChecks({ weights, from, today, surplusOn, cutOn }) {
  const out = []; let adj = 0;
  if (!from || !today) return { adj, checks: out };
  let s = sundayOf(from);
  if (s === from) s = plusDays(s, 7);           // a budget begun on a Sunday is first checked a week on
  for (s = plusDays(s, 7); s <= today; s = plusDays(s, 7)) {
    if (cutOn && cutOn(s)) continue;
    const A = averageOn(weights, s).avg, P = averageOn(weights, plusDays(s, -7)).avg;
    const sur = !!(surplusOn && surplusOn(s));
    if (A == null || P == null) { out.push({ sun: s, A, P, change: 0, why: "few" }); continue; }
    const diff = A - P;
    const lo = sur ? 0 : -0.3, hi = sur ? 0.35 : 0.3;
    let change = 0, why = "held";
    if (diff < lo - 1e-9) { change = STEP; why = "down"; }
    else if (diff > hi + 1e-9) { change = -STEP; why = "up"; }
    const next = Math.max(-ADJ_MAX, Math.min(ADJ_MAX, adj + change));
    if (next === adj && change) why = change > 0 ? "maxup" : "maxdown";
    out.push({ sun: s, A: r1(A), P: r1(P), diff: r1(diff), change: next - adj, why, surplus: sur });
    adj = next;
  }
  return { adj, checks: out };
}
export const CHECK_SAY = {
  held: "Your average held. The budget stays.",
  down: "Your average dropped. 150 kcal a day more.",
  up: "Your average rose. 150 kcal a day less.",
  maxup: "Your average dropped, but the budget is already 600 kcal a day above where it started. Check the weigh-ins are mornings, after the toilet.",
  maxdown: "Your average rose, but the budget is already 600 kcal a day below where it started. Check what's being logged.",
  few: "Fewer than three weigh-ins in one of the two weeks, so no change. Weigh in at least three mornings a week.",
};

/* ---------------- THE FOODS ----------------
   The wide list is its own file (food-list.js): several hundred everyday
   foods, per 100 g. These few are his own: the packets he buys by the
   item (UFIT, Ben's Original, Quaker Oat So Simple), his collagen, and
   the batch, which is read from the two pans weighed in COOK. They come
   first, so their names win. */
const F = (id, n, keys, o) => Object.assign({ id, n, keys, grp: "Yours" }, o);
const OWN = [
  F("ufit", "UFIT 50g bottle", ["ufit", "ufit bottle", "protein shake", "protein bottle", "shake", "bottle"], { each: { g: 500, w: "bottle", m: [288, 50, 18, 1] }, liquid: true }),
  F("pouch", "Ben's Original rice pouch", ["rice pouch", "pouch of rice", "bens rice", "ben's rice", "bens", "uncle bens", "microwave rice", "pouch"], { each: { g: 250, w: "pouch", m: [360, 8, 72, 4] } }),
  F("sachet", "Oat So Simple sachet", ["porridge sachet", "oat so simple", "porridge", "sachet"], { each: { g: 36, w: "sachet", m: [138, 3.2, 25.5, 2.2] } }),
  F("collagen", "Collagen powder", ["collagen", "gelatin", "gelatine"], { std: [360, 90, 0, 0], unit: { scoop: 15 } }),
  /* the batch, from the two pans weighed in COOK */
  F("batchmince", "Batch mince (the mince pot)", ["batch mince", "mince pot", "batch meat"], { batch: "mince" }),
  F("batchpot", "Batch sweet potato", ["batch sweet potato", "batch potato", "sweet potato pan"], { batch: "potato" }),
  F("batch", "The batch", ["batch"], { batch: "both" }),
];
export const FOODS = OWN.concat(LIST);
export { GROUPS };

/* One standard portion of each pan, from what goes in: 150 g raw 5% mince
   with 150 g passata and the stock; 300 g raw sweet potato. COOK weighs
   what that becomes cooked; with no pans weighed, a typical cooked weight. */
export const POT = { mince: { m: [246, 33.5, 8.5, 7], std: 240, big: 320 }, potato: { m: [258, 4.8, 60, 0.3], std: 270, big: 315 } };
const potOf = (cook, k) => { const c = cook && cook[k]; return c && Number(c.std) > 0 ? { std: Number(c.std), big: Number(c.big) || Number(c.std) * 4 / 3, weighed: true } : { std: POT[k].std, big: POT[k].big, weighed: false }; };
/* the batch per 100 g cooked */
export function batchPer100(cook, k) { const p = potOf(cook, k); return { m: POT[k].m.map((x) => x / p.std * 100), std: p.std, big: p.big, weighed: p.weighed }; }

/* ---------------- READING WHAT'S TYPED ----------------
   "200g cooked mince, 250g pasta", "2 eggs and a bagel", "half a bottle",
   "1 tin tuna", "20g raisins", "a pint", "fish and chips". Parts split on
   commas, "and", "with", "+", "&" and new lines; a food whose own name
   holds one of those words ("fish and chips") is kept whole. A part is an
   amount, a unit, the way it's cooked and a food, in any order. */
const NUMW = [["ten", 10], ["nine", 9], ["eight", 8], ["seven", 7], ["six", 6], ["five", 5], ["four", 4], ["three", 3], ["two", 2], ["one", 1], ["dozen", 12], ["couple", 2], ["quarter", 0.25], ["half", 0.5], ["an", 1], ["a", 1]];
const WEIGHT = { g: 1, gram: 1, grams: 1, gr: 1, gm: 1, gms: 1, kg: 1000, kilo: 1000, kilos: 1000, ml: 1, cl: 10, l: 1000, litre: 1000, litres: 1000, liter: 1000, liters: 1000, oz: 28.35, ounce: 28.35, ounces: 28.35, lb: 453.6, lbs: 453.6 };
const SHORT = { gram: "g", grams: "g", gr: "g", gm: "g", gms: "g", kilo: "kg", kilos: "kg", litre: "l", litres: "l", liter: "l", liters: "l", ounce: "oz", ounces: "oz", lbs: "lb" };
/* what a spoon of anything weighs, and a glass, mug, pint, shot, bottle or can of a drink */
const SPOON = { tbsp: 15, tsp: 5 };
const POUR = { glass: 250, mug: 260, pint: 568, shot: 25, bottle: 500, tin: 330 };
const STATE = Object.assign(Object.create(null), { cooked: "cooked", boiled: "cooked", grilled: "cooked", roasted: "cooked", roast: "cooked", fried: "cooked", baked: "cooked", steamed: "cooked", stewed: "cooked", poached: "cooked", microwaved: "cooked", barbecued: "cooked", raw: "raw", uncooked: "raw", dry: "dry", dried: "dry" });
/* words that say nothing about which food or how much */
const FILL = "a an of the some my in on for to at fresh frozen plain large small medium big little lean sliced chopped diced peeled grated tinned canned drained hot cold bit bits extra homemade home made organic free range skinless boneless pitted about around roughly approx nearly just only more another each per total worth weighed weight ready eat style type brand own air pan stir single piece pieces toasted smoked unsmoked tesco asda aldi lidl sainsburys morrisons waitrose iceland coop".split(" ").reduce((o, w) => { o[w] = 1; return o; }, Object.create(null));
const SPELL = [[/yoghurt/g, "yogurt"], [/\bdonut/g, "doughnut"], [/\bchili\b/g, "chilli"], [/\bomelet\b/g, "omelette"], [/\blasagna\b/g, "lasagne"], [/\bbolognaise\b/g, "bolognese"], [/\bhoumous\b|\bhumous\b|\bhummous\b|\bhumus\b/g, "hummus"], [/\bwhole ?wheat\b/g, "wholewheat"], [/\bwhiskey\b/g, "whisky"]];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* what's typed, made plain: small letters, no accents, hyphens as spaces,
   "Ben's" as "bens", one spelling of a word that has two */
export const norm = (s) => {
  let t = String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/½/g, " 0.5 ").replace(/¼/g, " 0.25 ")
    .replace(/[’‘`]/g, "'").replace(/'s\b/g, "s").replace(/'/g, "").replace(/[-–—_]/g, " ");
  SPELL.forEach((x) => { t = t.replace(x[0], x[1]); });
  return t.replace(/\s+/g, " ").trim();
};
export const allFoods = (mine) => (mine || []).concat(FOODS);

/* a name's other number: "egg" for "eggs", "tomatoes" for "tomato" */
function forms(k) {
  const m = k.match(/^(.*?)([a-z]+)$/);
  if (!m || m[2].length < 3) return [];
  const w = m[2], out = [];
  if (/ies$/.test(w) && w.length > 4) out.push(w.slice(0, -3) + "y", w.slice(0, -1));
  else if (/(ch|sh|ss|x|z|ato)es$/.test(w)) out.push(w.slice(0, -2));
  else if (/s$/.test(w)) { if (!/(ss|us|is)$/.test(w)) out.push(w.slice(0, -1)); }
  else if (/[^aeiou]y$/.test(w)) out.push(w.slice(0, -1) + "ies");
  else if (/(ch|sh|x|z|ato)$/.test(w)) out.push(w + "es");
  else out.push(w + "s");
  return out.filter((x) => x.length >= 3).map((x) => m[1] + x);
}

/* Every name a food answers to, as its words, with how many of them say
   what the food is ("cup of tea" has one: a cup is an amount). A name as
   written beats one made from another by adding or dropping an s, and a
   food typed in from its own packet beats the list: whichever is put in
   first keeps the name. */
let INDEX = null;
const says = (w) => !FILL[w] && !UNIT[w] && w !== "and" && w !== "with" && !NUMW.some((n) => n[0] === w);
/* a word for an amount, as the one word it's kept under: "tins" and "cans" are the same word */
const same = (w) => (UNIT[w] ? "#" + UNIT[w] : w);
function indexFor(foods) {
  /* built once, and again only when the foods typed in from packets change */
  const key = JSON.stringify(foods.slice(0, Math.max(0, foods.length - FOODS.length)));
  if (INDEX && INDEX.key === key) return INDEX.list;
  const seen = Object.create(null), list = [];
  const put = (k, f) => { if (!k || seen[k]) return; seen[k] = 1; const w = k.split(" "), c = w.map(same), told = w.filter(says);
    list.push({ k, f, w, c, n: told.length, h: told.length ? told[told.length - 1] : c[c.length - 1], unit: (w.find((x) => UNIT[x]) && UNIT[w.find((x) => UNIT[x])]) || null }); };
  foods.forEach((f) => (f.keys || [f.n]).forEach((k) => put(norm(k), f)));
  foods.forEach((f) => (f.keys || [f.n]).forEach((k) => forms(norm(k)).forEach((x) => put(x, f))));
  /* the names that hold "and" or "with": kept whole when the entry is split, the longest first */
  const guards = list.filter((e) => / and | with /.test(e.k)).sort((x, y) => y.k.length - x.k.length).map((e) => ({
    re: new RegExp("(^|[^a-z])" + e.w.map((w) => (w === "and" ? "(?:and|&|\\+|'?n'?)" : /s$/.test(w) ? esc(w.slice(0, -1)) + "'?s" : esc(w))).join("[\\s-]*") + "(?![a-z])", "gi"),
    to: e.k.replace(/ and /g, "\u0001").replace(/ with /g, "\u0002") }));
  INDEX = { key, list, guards };
  return list;
}
const guardsFor = (foods) => { indexFor(foods); return INDEX.guards; };

const AMOUNT = /^\d*\.?\d+(\s*\/\s*\d+)?\s*(kg|ml|cl|oz|lbs?|g|l|grams?|kilos?|litres?|ounces?)?$/i;
/* the parts of an entry, a food whose own name holds "and" or "with" kept whole */
export function splitParts(text, foods) {
  /* "1 and a half bagels" is one amount, not two foods */
  let t = String(text || "").replace(/(\d+)\s+and\s+a\s+half\b/gi, "$1.5").replace(/\bone\s+and\s+a\s+half\b/gi, "1.5").replace(/\btwo\s+and\s+a\s+half\b/gi, "2.5");
  guardsFor(foods || FOODS).forEach((g) => { t = t.replace(g.re, (m, pre) => pre + g.to); });
  const parts = t.split(/,|;|\n|\+|&|\band\b|\bwith\b/i).map((x) => x.replace(/\u0001/g, " and ").replace(/\u0002/g, " with ").trim()).filter(Boolean);
  /* an amount on its own belongs to the food beside it that has none: "chicken, 150g" */
  const out = [];
  parts.forEach((p) => {
    const prev = out[out.length - 1];
    if (AMOUNT.test(p) && prev != null && !/\d/.test(prev)) out[out.length - 1] = prev + " " + p;
    else if (prev != null && AMOUNT.test(prev) && !/\d/.test(p)) out[out.length - 1] = prev + " " + p;
    else out.push(p);
  });
  return out;
}

/* The name in the part that fits best. Every word of a name has to be
   there, in any order ("yoghurt greek 0%"). Then, in turn: the name with
   the most words that say what the food is; the one whose last such word
   comes latest, because the thing itself is said last ("strawberry
   milkshake" is a milkshake, "chicken soup" a soup); the name with the
   most words of any kind ("cup of tea"); words standing together before
   words apart; the longest; the first in the list. A name with a word
   for an amount in it has to be said in its own order: "cheese slice" is
   a processed slice, "slice of cheese" a slice of cheddar. */
function findFood(toks, list) {
  const canon = toks.map(same), last = Object.create(null);
  canon.forEach((w, i) => { last[w] = i; });
  let best = null;
  for (const e of list) {
    let there = true;
    for (let j = 0; j < e.c.length; j++) if (last[e.c[j]] == null) { there = false; break; }
    if (!there) continue;
    const head = last[e.h];
    if (best && (e.n < best.e.n || (e.n === best.e.n && head < best.head))) continue;
    let run = -1;
    for (let i = 0; i + e.c.length <= canon.length && run < 0; i++) { let j = 0; while (j < e.c.length && canon[i + j] === e.c[j]) j++; if (j === e.c.length) run = i; }
    if (run < 0 && e.unit) continue;
    const tog = run >= 0 ? 1 : 0, more = best ? e.c.length - best.e.c.length : 1;
    if (!best || e.n > best.e.n || head > best.head || more > 0 || (more === 0 && (tog > best.tog || (tog === best.tog && e.k.length > best.e.k.length)))) best = { e, head, tog, run };
  }
  if (!best) return null;
  /* the words of the part that the name used */
  best.used = {};
  if (best.run >= 0) best.e.c.forEach((w, j) => { best.used[best.run + j] = 1; });
  else best.e.c.forEach((w) => { best.used[last[w]] = 1; });
  return best;
}
const cut = (s, re) => s.replace(re, " ");
/* every word in a food's own names, either number */
function ownWords(f) {
  if (f.words) return f.words;
  const o = Object.create(null);
  (f.keys || []).concat([f.n]).forEach((k) => norm(k).split(/[^a-z]+/).forEach((w) => { if (w) { o[w] = 1; forms(w).forEach((x) => { o[x] = 1; }); } }));
  Object.defineProperty(f, "words", { value: o, enumerable: false });
  return o;
}

/* one part → { food, qty, unit, state, … } or { unknown } */
export function readPart(part, foods) {
  const list = indexFor(foods || FOODS);
  const toks = norm(part).replace(/[^a-z0-9%./ ]+/g, " ").replace(/\.(?!\d)/g, " ").split(" ").filter(Boolean);
  const hit = findFood(toks, list);
  const f = hit ? hit.e.f : null;
  let s = " " + (hit ? toks.filter((w, i) => !hit.used[i]) : toks).join(" ") + " ";
  let qty = null, unit = null, wu = null, state = null, big = false;
  /* an amount glued to a weight: 200g, 1.5kg, 330ml, 8oz */
  const glued = s.match(/(\d*\.?\d+)\s*(kg|ml|cl|oz|lbs?|g|l)(?![a-z])/);
  if (glued) { qty = Number(glued[1]); wu = SHORT[glued[2]] || glued[2]; s = s.replace(glued[0], " "); }
  if (qty == null) { const fr = s.match(/(\d+)\s*\/\s*(\d+)/); if (fr && Number(fr[2])) { qty = Number(fr[1]) / Number(fr[2]); s = s.replace(fr[0], " "); } }
  if (qty == null) { const n = s.match(/(\d*\.?\d+)(?![\d.]*\s*%)/); if (n) { qty = Number(n[1]); s = s.replace(n[0], " "); } }
  if (!f) return { text: part, unknown: true, qty, wu, unit: null, state: null };
  Object.keys(STATE).forEach((w) => { const re = new RegExp("\\b" + w + "\\b"); if (re.test(s)) { state = state || STATE[w]; s = cut(s, re); } });
  if (f.batch && /\bbig\b/.test(s)) { big = true; s = cut(s, /\bbig\b/); }
  if (qty == null) { for (const [w, n] of NUMW) { const re = new RegExp("\\b" + w + "\\b"); if (re.test(s)) { qty = n; s = cut(s, re); break; } } }
  if (qty != null && qty !== 0.5 && /\bhalf\b/.test(s)) { qty = qty * 0.5; s = cut(s, /\bhalf\b/); }
  if (/\bdouble\b/.test(s)) { qty = (qty == null ? 1 : qty) * 2; s = cut(s, /\bdouble\b/); }
  if (wu == null) { for (const w of Object.keys(SHORT)) { const re = new RegExp("\\b" + w + "\\b"); if (re.test(s)) { wu = SHORT[w]; s = cut(s, re); break; } } }
  /* the food's own word for one of it ("2 breasts of chicken"), then the words for an amount */
  if (wu == null && f.each) {
    const w = norm(f.each.w), re = new RegExp("\\b(" + [w].concat(forms(w)).map(esc).join("|") + ")\\b");
    if (re.test(s)) { unit = "each"; s = cut(s, re); }
  }
  if (wu == null && unit == null) { for (const w of s.split(/[^a-z]+/)) { if (UNIT[w]) { unit = UNIT[w]; s = cut(s, new RegExp("\\b" + w + "\\b")); break; } } }
  /* an amount word that was part of the name it matched ("a chocolate bar", "slice of bread") */
  let named = false;
  if (wu == null && unit == null && hit.e.unit) { unit = hit.e.unit; named = true; }
  /* what's left over that isn't a word for this food: said, so a wrong match shows */
  const own = ownWords(f);
  const extra = s.split(/[^a-z]+/).filter((w) => w.length > 1 && !FILL[w] && !UNIT[w] && !STATE[w] && !own[w] && w !== "half" && w !== "double" && !NUMW.some((n) => n[0] === w));
  return { text: part, food: f, key: hit.e.k, qty, unit, named, wu, state, big, extra };
}

/* the numbers per 100 g for a food in a state */
function per100(f, state, cook) {
  if (f.batch) {
    if (f.batch === "both") return null;
    return batchPer100(cook, f.batch).m;
  }
  if (f.std) return f.std;
  if (state && f[state]) return f[state];
  if (f.cooked) return f.cooked;
  if (f.raw) return f.raw;
  if (f.dry) return f.dry;
  if (f.each && f.each.m) return f.each.m.map((x) => x / f.each.g * 100);
  return null;
}
/* the states a food is weighed in, the one it's read as first */
export const statesOf = (f) => (f.std || f.batch ? [] : ["cooked", "raw", "dry"].filter((s) => f[s]));
/* raw and dry are the same ask of a food that has only one of them: "uncooked rice" is dry rice */
const stateOf = (f, state) => { const all = statesOf(f), alt = state === "raw" ? "dry" : state === "dry" ? "raw" : null; return !all.length ? null : state && f[state] ? state : alt && f[alt] ? alt : all[0]; };
/* a food's numbers per 100 g (or 100 ml), for showing: [{ state, m }] */
export const per100Of = (f, cook) => (f.batch === "both" ? [] : statesOf(f).length ? statesOf(f).map((s) => ({ state: s, m: f[s] })) : [{ state: null, m: per100(f, null, cook) }]).filter((x) => x.m);
const mOf = (m, g) => ({ kcal: m[0] * g / 100, p: m[1] * g / 100, c: m[2] * g / 100, f: m[3] * g / 100 });
const round = (x) => ({ kcal: r0(x.kcal), p: r1(x.p), c: r1(x.c), f: r1(x.f) });
export const add = (a, b) => ({ kcal: (a.kcal || 0) + (b.kcal || 0), p: (a.p || 0) + (b.p || 0), c: (a.c || 0) + (b.c || 0), f: (a.f || 0) + (b.f || 0) });
export const ZERO = { kcal: 0, p: 0, c: 0, f: 0 };

const plural = (w) => (/(ch|sh|s|x)$/.test(w) ? w + "es" : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + "ies" : /ato$/.test(w) ? w + "es" : w + "s");
function countSay(n, w) {
  const k = Math.round(n * 100) / 100;
  if (k === 0.5) return "half a" + (/^[aeiou]/.test(w) ? "n " : " ") + w;
  return (k === Math.round(k) ? k : r1(k)) + " " + (k === 1 || w === "tbsp" || w === "tsp" ? w : plural(w));
}
/* How much it is, in grams (millilitres for a drink), and how that was
   worked out: by its weight, by a spoon or slice or tin of it, by the
   one, or — a bare number beside a food that's weighed — as grams. */
function toGrams(r, f) {
  const u = r.unit, q = r.qty == null ? 1 : r.qty;
  if (r.wu) return { g: q * WEIGHT[r.wu], by: "weight" };
  if (u && u !== "each" && f.unit && f.unit[u] != null) return { g: q * f.unit[u], by: "unit" };
  /* a piece, a slice and a portion are the same ask of a food that has one of them */
  const cutOf = u === "piece" || u === "slice" || u === "portion" ? ["slice", "piece", "portion"].find((k) => f.unit && f.unit[k] != null) : null;
  if (cutOf) return { g: q * f.unit[cutOf], by: "unit" };
  const own = f.each && (u === "each" || (u && unitOf(f.each.w) === u));
  if (own) return { g: q * f.each.g, by: "each" };
  if (u && SPOON[u]) return { g: q * SPOON[u], by: "unit" };
  if (u && f.liquid && POUR[u]) return { g: q * POUR[u], by: "unit" };
  /* a portion of fruit or veg is the 80 g of five-a-day */
  if (u === "portion" && !f.each && (f.grp === "Vegetables and salad" || f.grp === "Fruit")) return { g: q * 80, by: "unit" };
  /* an amount word this food doesn't have ("2 slices of chicken"): ask, rather than guess at it */
  if (u && u !== "each" && !r.named && u !== "x" && u !== "piece" && u !== "portion") return null;
  /* a number of 20 or more beside a food that isn't small: grams, not that many of them */
  if (f.each && !u && r.qty != null && r.qty >= 20 && f.each.g >= 20) return { g: r.qty, by: "weight" };
  if (f.each && (!f.each.ask || r.qty != null)) return { g: q * f.each.g, by: "each" };
  if (!f.each && !f.batch && !u && r.qty != null && r.qty >= 10) return { g: r.qty, by: "weight" };
  return null;
}
const unitSay = (f) => (f.liquid ? " ml" : " g");

/* one part → the item to log: { name, amount, kcal, p, c, f } — or what's missing */
export function itemOf(r, cook) {
  if (r.unknown) return { text: r.text, unknown: true };
  const f = r.food, u = r.unit, q = r.qty;
  const more = { text: r.text, id: f.id, key: r.key, extra: r.extra && r.extra.length ? r.extra : null };
  /* the batch by the portion: "batch", "a big batch", "1 portion of batch mince" */
  if (f.batch && !r.wu) {
    const n = q == null ? 1 : q;
    const ks = f.batch === "both" ? ["mince", "potato"] : [f.batch];
    let m = ZERO; ks.forEach((k) => { const b = batchPer100(cook, k); const g = r.big ? b.big : b.std; m = add(m, mOf(b.m, g * n)); });
    const weighed = ks.every((k) => batchPer100(cook, k).weighed);
    return Object.assign(more, { name: f.n + (r.big ? ", big" : ""), amount: (n === 1 ? "1 portion" : n + " portions"), est: !weighed }, round(m));
  }
  const G = toGrams(r, f);
  if (!G) return { text: r.text, needG: true, food: f, key: r.key, state: stateOf(f, r.state), extra: more.extra };
  const g = G.g;
  if (f.batch === "both") {
    /* grams of the two together: shared as one standard portion of each */
    const a = batchPer100(cook, "mince"), b = batchPer100(cook, "potato");
    const tot = a.std + b.std, m = add(mOf(a.m, g * a.std / tot), mOf(b.m, g * b.std / tot));
    return Object.assign(more, { name: f.n, amount: r1(g) + " g", est: !(a.weighed && b.weighed) }, round(m));
  }
  const st = stateOf(f, r.state);
  const m = f.each && f.each.m && G.by === "each" ? mOf(f.each.m, g / f.each.g * 100) : mOf(per100(f, st, cook), g);
  const est = f.batch ? !batchPer100(cook, f.batch).weighed : false;
  const amount = G.by === "each" ? countSay(g / f.each.g, f.each.w) + (f.each.about ? " (about " + r0(g) + unitSay(f) + ")" : "")
    : G.by === "unit" ? countSay(q == null ? 1 : q, u === "tin" && f.liquid ? "can" : u) + " (" + r1(g) + unitSay(f) + ")"
    : r1(g) + unitSay(f);
  return Object.assign(more, { name: f.n + (st ? ", " + st : ""), amount, est, g: r1(g), state: st, states: statesOf(f) }, round(m));
}

/* the whole entry: every part read, and the total */
export function readEntry(text, { mine, cook } = {}) {
  const foods = allFoods(mine);
  const items = splitParts(text, foods).map((p) => itemOf(readPart(p, foods), cook));
  const good = items.filter((x) => !x.unknown && !x.needG);
  const total = round(good.reduce((a, b) => add(a, b), ZERO));
  return { items, total, ok: good.length > 0 && good.length === items.length };
}

/* ---------------- PICKING THE RIGHT FOOD ----------------
   The reader takes the longest name it finds, which is usually right and
   sometimes isn't ("chicken" is read as breast). These find the others it
   could have meant, the closest names to one it couldn't read, and write
   the entry again with the food, the state or the amount changed. */
export const foodById = (id, mine) => allFoods(mine).find((f) => f.id === id) || null;
const wordsOf = (k) => norm(k).split(" ").filter((w) => /[a-z]/.test(w));
/* a name holds the words, in either number: "roast potatoes" holds "potato" */
const hasWords = (hay, k) => [k].concat(forms(k)).some((x) => (" " + hay + " ").indexOf(" " + x + " ") >= 0);

/* other foods the same words could mean: the ones whose names hold the
   name it matched, its own kind first, the nearest in the list first
   (the list keeps like with like: the cuts of chicken sit together) */
export function others(food, key, mine, n) {
  const k = norm(key), last = k.split(" ").pop(), out = [], all = allFoods(mine), here = all.indexOf(food);
  all.forEach((f, i) => {
    if (f === food || f.batch) return;
    const ks = (f.keys || []).map(norm);
    const whole = ks.filter((a) => hasWords(a, k)), tail = ks.filter((a) => hasWords(a, last));
    if (!whole.length && !(k !== last && tail.length)) return;
    out.push({ f, rank: (whole.length ? 0 : 2) + (f.grp === food.grp ? 0 : 1), far: Math.abs(i - here), at: i });
  });
  return out.sort((a, b) => (a.rank - b.rank) || (a.far - b.far) || (a.at - b.at)).slice(0, n || 6).map((x) => x.f);
}

/* how far one word is from another, in letters changed (2 is the most counted) */
function apart(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = [], cur = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
/* The foods closest to what was typed: a name that starts the same, holds
   it, or is a letter or two off ("raisens"). Used for a food it couldn't
   read, and for looking a food up. */
export function near(text, mine, n) {
  const ws = wordsOf(String(text || "").replace(/\d*\.?\d+\s*(kg|ml|cl|oz|lbs?|g|l)?(?![a-z])/gi, " ")).filter((w) => w.length > 1 && !FILL[w] && !STATE[w]);
  if (!ws.length) return [];
  const out = [];
  allFoods(mine).forEach((f) => {
    if (f.batch) return;
    let best = 0, len = 99;
    (f.keys || []).concat([f.n]).forEach((a) => {
      const aw = wordsOf(a); let sc = 0;
      ws.forEach((w) => {
        let s = 0;
        aw.forEach((x) => {
          const v = x === w ? 6 : x.indexOf(w) === 0 ? 5 : w.length >= 4 && x.length >= 3 && w.indexOf(x) === 0 ? 3
            : w.length >= 4 && x.indexOf(w) > 0 ? 2 : w.length >= 5 && apart(w, x) <= (w.length >= 8 ? 2 : 1) ? 4 : 0;
          if (v > s) s = v;
        });
        sc += s;
      });
      /* every typed word found beats one of two; a short name beats a long one */
      const full = sc - (aw.length - ws.length > 0 ? Math.min(2, aw.length - ws.length) * 0.5 : 0);
      if (sc > 0 && (full > best || (full === best && a.length < len))) { best = full; len = a.length; }
    });
    if (best >= 2) out.push({ f, best, len });
  });
  return out.sort((a, b) => (b.best - a.best) || (a.len - b.len)).slice(0, n || 5).map((x) => x.f);
}

/* the amount as it would be typed: "150g", "2 slices", "half a tin", "2" */
function amountSay(r) {
  const q = r.qty, u = r.unit === "each" ? (r.food && r.food.each ? r.food.each.w : null) : r.named ? null : r.unit;
  if (r.wu) return (q == null ? 1 : q) + r.wu;
  if (u) return q === 0.5 ? "half a" + (/^[aeiou]/.test(u) ? "n " : " ") + u : (q == null ? 1 : q) + " " + (q > 1 && u !== "tbsp" && u !== "tsp" && u !== "x" ? plural(u) : u);
  return q == null ? "" : q === 0.5 ? "half a" : String(q);
}
/* The entry written again with part i changed: another food (`key`, a name
   it answers to), another state, or another amount ("150g", "1 tbsp"). */
export function rewrite(text, i, change, { mine } = {}) {
  const foods = allFoods(mine), parts = splitParts(text, foods);
  if (!(i >= 0 && i < parts.length)) return text;
  const r = readPart(parts[i], foods), ch = change || {};
  const key = ch.key != null ? ch.key : r.key || parts[i];
  const amount = ch.amount != null ? ch.amount : amountSay(r);
  const state = ch.state !== undefined ? ch.state : ch.key != null ? null : r.state;
  parts[i] = [amount, r.big ? "big" : "", state || "", key].filter(Boolean).join(" ");
  return parts.join(", ");
}

/* the spoon or scoop a food is measured by, when that's the first of its amounts: oil, honey, whey */
export const spoonOf = (f) => { const u = Object.keys(f.unit || {})[0]; return u === "tbsp" || u === "tsp" || u === "scoop" ? u : null; };
/* the amounts worth offering for a food that needs one: a spoon or slice
   of it, one of it, then round weights; `protein` adds the weight that
   gives that much protein, for a food that's mostly protein */
export function amountsFor(f, state, protein) {
  const out = [], st = stateOf(f, state), m = f.batch ? null : per100(f, st);
  const u = f.unit || {};
  Object.keys(u).slice(0, 2).forEach((k) => out.push({ label: "1 " + k + " (" + r0(u[k]) + unitSay(f) + ")", amount: "1 " + k }));
  if (f.each && f.each.g >= 10) out.push({ label: "1 " + f.each.w + (f.each.about ? " (about " + r0(f.each.g) + unitSay(f) + ")" : ""), amount: "1" });
  (f.liquid ? [250, 500] : spoonOf(f) ? [] : [100, 150, 200]).forEach((g) => out.push({ label: g + unitSay(f), amount: g + (f.liquid ? "ml" : "g") }));
  /* for a food that is mostly protein: the weight that gives a meal's worth */
  if (protein > 0 && m && m[1] >= 15 && m[1] * 4 >= m[0] * 0.35 && !f.liquid && spoonOf(f) !== "tbsp" && spoonOf(f) !== "tsp") {
    const g = Math.max(5, Math.round(protein / m[1] * 100 / 5) * 5);
    if (!out.some((x) => x.amount === g + "g")) out.push({ label: g + " g for " + r0(protein) + " g protein", amount: g + "g" });
  }
  return out.slice(0, 6);
}

/* ---------------- THE DAY'S LOG ---------------- */
/* entries: [{ id, at: minutes after midnight, text, kcal, p, c, f, items }] */
export const eaten = (entries) => round((entries || []).reduce((a, b) => add(a, b), ZERO));
export const leftOf = (t, e) => ({ kcal: t.kcal - e.kcal, p: r1(t.p - e.p), c: r1(t.c - e.c), f: r1(t.f - e.f) });

/* things eaten within an hour of each other are one meal */
export function mealsOf(entries) {
  const xs = (entries || []).slice().sort((a, b) => a.at - b.at);
  const out = [];
  xs.forEach((e) => { const last = out[out.length - 1]; if (last && e.at - last.at <= SAME_MEAL) { last.items.push(e); last.end = e.at; } else out.push({ at: e.at, end: e.at, items: [e] }); });
  return out;
}

/* THE NEXT MEAL. Nothing eaten yet: whenever you first eat. Then about
   three hours after the last meal began, and a fair share of what's left:
   what's left split over the meals still to come, never less than one. */
export function nextMeal({ entries, now, left }) {
  const meals = mealsOf(entries);
  if (!meals.length) return { first: true, meals: 0 };
  const last = meals[meals.length - 1];
  const at = last.at + GAP;
  const toCome = Math.max(1, MEALS - meals.length);
  const share = (x) => Math.max(0, x / toCome);
  const aim = { kcal: r0(share(left.kcal)), p: r0(share(left.p)), c: r0(share(left.c)), f: r0(share(left.f)) };
  return { first: false, meals: meals.length, at, now: now != null && now >= at, toCome, aim, done: left.kcal <= 0 && left.p <= 0 };
}

/* the meals that fit the next one best: closest on protein and calories,
   and never one that runs well past what's left */
export function suggest(candidates, aim, left, n) {
  if (!aim) return [];
  const score = (m) => {
    const over = Math.max(0, m.kcal - Math.max(left.kcal, 0) - 100);
    return Math.abs(m.p - aim.p) * 8 + Math.abs(m.kcal - aim.kcal) + over * 4;
  };
  return candidates.slice().sort((a, b) => score(a) - score(b)).slice(0, n || 3);
}

/* the protein still short late in the day: what a bottle does about it */
export function lateProtein(left, now) {
  if (now == null || now < 18 * 60 || left.p < 25) return null;
  return left.p >= 50 ? "A UFIT bottle is 50 g of the " + r0(left.p) + " g protein still to go." : "Half a UFIT bottle is 25 g of the " + r0(left.p) + " g protein still to go.";
}

/* a food typed in from its packet: per 100 g, or per item */
export function myFood({ name, per, g, kcal, p, c, f }) {
  const n = String(name || "").trim();
  const nums = [kcal, p, c, f].map(Number);
  if (!n || nums.some((x) => !(x >= 0)) || !(nums[0] > 0)) return null;
  const id = "u-" + norm(n).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const keys = [norm(n)];
  if (per === "item") { const w = Number(g) > 0 ? Number(g) : 100; return { id, n, keys, mine: true, each: { g: w, w: "item", m: nums } }; }
  return { id, n, keys, mine: true, std: nums };
}

/* a meal from the old menu, as one thing to log */
export const sentence = (s) => { const t = String(s || "").toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); };

/* the time typed beside an entry, "07:30" → minutes */
export const minsOf = (s) => { const m = String(s || "").match(/^(\d{1,2})[:.]?(\d{2})$/); if (!m) return null; const h = Number(m[1]), mi = Number(m[2]); return h < 24 && mi < 60 ? h * 60 + mi : null; };
export const clock = (m) => { const x = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, "0") + ":" + String(x % 60).padStart(2, "0"); };
export const isSun = isSunday;
