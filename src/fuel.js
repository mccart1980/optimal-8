import { C, parseISO } from "./ui.jsx";

/* ================================================================
   FUEL — the food and the water, as data.

   Everything in here came across from the fuel app (optimal-8-fuel)
   unchanged: the blocks, weighed once; the slots and their matched
   options; the seven day plans; the phase table's changes; the water
   schedule from the hydration document; the shop; the referee's
   feedback-loop rules. What is new is fuelPlan() at the bottom, which
   puts every feed and every drink of a day on the clock so TODAY can
   thread them through the one timeline.
   ================================================================ */

/* The fuel app's warm palette, mapped onto this app's: ember (the feeds
   that decide sessions) and copper (warnings) to oxide, honey (carbs) to
   brass, sage (done, protein) to moss, frost (water) to cobalt. */
export const FC = { ember: C.oxide, honey: C.brass, sage: C.moss, copper: C.oxide, frost: C.cobalt };

export const tMin = (t) => { const p = String(t).split(":").map(Number); return p[0] * 60 + (p[1] || 0); };
export const hhmm = (m) => { const x = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, "0") + ":" + String(x % 60).padStart(2, "0"); };

export const B = {
  /* BEFORE THE SESSION · ~250 kcal. The bottle is the constant; the carb is
     whatever sits best at that hour. */
  halfban:    { n: "HALF BOTTLE + BANANA", kcal: 249, p: 26, c: 36, f: 1, bn: "One UFIT 50g on every training day — half before, half straight after. Six bottles a week. Nothing sitting heavy at half past three.", i: [["UFIT 50g", "half · 250ml"], ["Banana", "1"]] },
  halfraisin: { n: "HALF BOTTLE + RAISINS", kcal: 234, p: 26, c: 33, f: 0, extra: [["Raisins or sultanas", "500 g"]], i: [["UFIT 50g", "half · 250ml"], ["Raisins or sultanas", "30g"]] },
  halfrc:     { n: "HALF BOTTLE + RICE CAKES", kcal: 275, p: 26, c: 45, f: 1, extra: [["Rice cakes", "2 packs"]], i: [["UFIT 50g", "half · 250ml"], ["Rice cakes", "2, with honey"], ["Honey", "on them"]] },
  halfdates:  { n: "HALF BOTTLE + 3 DATES", kcal: 215, p: 26, c: 40, f: 0, extra: [["Dates", "a small bag"]], i: [["UFIT 50g", "half · 250ml"], ["Dried dates", "3"]] },
  half:       { n: "HALF BOTTLE", kcal: 144, p: 25, c: 9, f: 0, bn: "The other half of the morning bottle, straight after the session.", i: [["UFIT 50g", "the other half"]] },

  /* BREAKFAST · ~570 kcal (BIG on Wednesday, Saturday, Sunday: ~710) */
  porridge:   { n: "PORRIDGE", kcal: 570, p: 16, c: 105, f: 10, bn: "Sachets into the thermos, hot milk on top, a splash of water if it's thick, honey stirred in. No decisions at half past four.", i: [["Quaker Oat So Simple Golden Syrup", "2 sachets · 2 × 36g"], ["Milk", "250ml"], ["Honey", "20g"], ["Banana", "1"]] },
  porridgeb:  { n: "PORRIDGE BIG", kcal: 710, p: 19, c: 130, f: 12, bn: "The same with a third sachet.", i: [["Quaker Oat So Simple Golden Syrup", "3 sachets"], ["Milk", "250ml"], ["Honey", "20g"], ["Banana", "1"]] },
  appleraisin:  { n: "APPLE & RAISIN PORRIDGE", kcal: 590, p: 16, c: 108, f: 10, extra: [["Apples", "7"], ["Raisins or sultanas", "500 g"]], i: [["Quaker Oat So Simple Golden Syrup", "2 sachets"], ["Milk", "250ml"], ["Apple", "1, chopped in"], ["Raisins or sultanas", "30g"]] },
  appleraisinb: { n: "APPLE & RAISIN PORRIDGE BIG", kcal: 710, p: 19, c: 130, f: 12, extra: [["Apples", "7"], ["Raisins or sultanas", "500 g"]], i: [["Quaker Oat So Simple Golden Syrup", "3 sachets"], ["Milk", "250ml"], ["Apple", "1, chopped in"], ["Raisins or sultanas", "30g"]] },
  oatscold:   { n: "OVERNIGHT SACHETS", kcal: 570, p: 16, c: 105, f: 10, bn: "The porridge or the apple and raisin one, made cold in a tub the night before.", i: [["Quaker Oat So Simple Golden Syrup", "2 sachets"], ["Milk", "250ml"], ["Honey", "20g"], ["Banana", "1"]] },
  eggbagelbf: { n: "EGG BAGEL BREAKFAST", kcal: 629, p: 30, c: 88, f: 17, extra: [["Bagels", "10"]], i: [["Plain bagel", "1"], ["Boiled eggs", "3"], ["Banana", "1"], ["Honey", "on the bagel"]] },
  eggbagelbb: { n: "EGG BAGEL BREAKFAST BIG", kcal: 800, p: 39, c: 133, f: 18, extra: [["Bagels", "10"]], i: [["Plain bagels", "2"], ["Boiled eggs", "3"], ["Banana", "1"], ["Honey", "none"]] },
  tunabagelbf: { n: "TUNA BAGEL BREAKFAST", kcal: 601, p: 35, c: 115, f: 2, extra: [["Bagels", "10"], ["Tuna in spring water", "4 tins"]], i: [["Plain bagel", "1"], ["Tuna in spring water", "1 tin"], ["Bananas", "2"], ["Honey", "20g"]] },

  /* MID-MORNING AND LUNCH · ~545 kcal each — sit down, then on the move */
  batch:      { n: "BATCH", kcal: 543, p: 36, c: 66, f: 15, cook: "std", i: [["Beef mince 5%", "150g raw"], ["Sweet potato", "300g raw"], ["Passata + beef stock", "150g"], ["Mushrooms (optional)", "150g · +33 kcal"]] },
  batchbig:   { n: "BATCH BIG", kcal: 671, p: 47, c: 76, f: 20, cook: "big", i: [["Beef mince 5%", "200g raw"], ["Sweet potato", "350g raw"], ["Passata", "150g"], ["Mushrooms (optional)", "150g"]] },
  jacketbt:   { n: "JACKET POTATO, BEANS & TUNA", kcal: 540, p: 41, c: 89, f: 1, extra: [["Potatoes", "2 kg"], ["Beans", "2 tins"], ["Tuna in spring water", "4 tins"]], i: [["Baking potato", "300g"], ["Baked beans", "half a tin"], ["Tuna in spring water", "1 tin"]] },
  jacketbe:   { n: "JACKET POTATO, BEANS & EGGS", kcal: 595, p: 30, c: 89, f: 12, extra: [["Potatoes", "2 kg"], ["Beans", "2 tins"]], i: [["Baking potato", "300g"], ["Baked beans", "half a tin"], ["Boiled eggs", "2"]] },
  prawnrice:  { n: "PRAWN RICE", kcal: 550, p: 40, c: 78, f: 8, bn: "Frozen prawns, cooked from frozen in ten minutes.", extra: [["Frozen prawns", "1 kg"]], i: [["Prawns, cooked", "150g"], ["Ben's Original rice pouch", "1"], ["Passata", ""], ["Mushrooms", "150g"]] },
  wraps:      { n: "MINCE WRAPS + BANANA", kcal: 580, p: 42, c: 73, f: 11, cook: "std", bn: "Same mince, same pot — the wraps stand in for the sweet potato. Rolled tight, foiled, made the night before. Cold mince travels in a cool bag with a freezer block.", extra: [["Wholemeal wraps", "10"]], i: [["Wholemeal tortilla wraps", "2 × ~40g"], ["Pot mince, cooked", "1 standard portion"], ["Banana", "1"]] },
  tunabagel:  { n: "TUNA & EGG BAGEL + BANANA", kcal: 590, p: 47, c: 72, f: 12, bn: "Assembled the night before and foiled, or carried as parts and put together at the break. Salt and pepper, nothing else needed.", extra: [["Bagels", "10"], ["Tuna in spring water", "4 tins"]], i: [["Plain bagel", "1"], ["Tuna in spring water", "1 tin, drained"], ["Boiled eggs", "2, sliced"], ["Banana", "1"]] },
  chickpouch: { n: "CHICKEN & POUCH", kcal: 610, p: 58, c: 72, f: 11, bn: "Eaten cold from a tub.", extra: [["Chicken breast", "+150g per feed taken"]], i: [["Chicken breast, cooked", "150g"], ["Ben's Original rice pouch", "1"]] },
  rctuna:     { n: "RICE CAKES, TUNA, EGG & APPLE", kcal: 480, p: 37, c: 71, f: 7, bn: "Nothing to keep cold but the egg.", extra: [["Rice cakes", "2 packs"], ["Tuna in spring water", "4 tins"], ["Apples", "7"]], i: [["Rice cakes", "6"], ["Tuna in spring water", "1 tin"], ["Boiled egg", "1"], ["Apple", "1"]] },

  /* THE THREE O'CLOCK · ~210 kcal */
  twoban:     { n: "TWO BANANAS", kcal: 210, p: 2, c: 54, f: 1, i: [["Bananas", "2"]] },
  onebagel:   { n: "ONE BAGEL", kcal: 230, p: 9, c: 45, f: 1, bn: "Honey on it or not; it's 60 calories you'll use.", extra: [["Bagels", "10"]], i: [["Plain bagel", "1"], ["Honey (optional)", "+60 kcal"]] },
  appleraisins: { n: "AN APPLE + RAISINS", kcal: 215, p: 1, c: 53, f: 0, extra: [["Apples", "7"], ["Raisins or sultanas", "500 g"]], i: [["Apple", "1"], ["Raisins or sultanas", "40g"]] },
  rchoney:    { n: "FOUR RICE CAKES WITH HONEY", kcal: 201, p: 3, c: 47, f: 0, extra: [["Rice cakes", "2 packs"]], i: [["Rice cakes", "4"], ["Honey", "on them"]] },

  /* THE 5PM LOAD · ~525 kcal — low fat, low fibre, easy to move on */
  topup:      { n: "POUCH LOAD", kcal: 526, p: 9, c: 116, f: 6, bn: "One Ben's Original pouch is 100g of dry rice cooked — about 360 kcal, 72g carbs. Nothing to weigh.", i: [["Ben's Original rice pouch", "1 · 250g"], ["Banana", "1"], ["Honey", "20g"]] },
  bageltop:   { n: "BAGEL LOAD", kcal: 521, p: 18, c: 106, f: 2, bn: "The night you're not home by five — same carbohydrate as the pouch, no fridge, no microwave.", extra: [["Bagels", "10"]], i: [["Plain bagels", "2"], ["Honey", "20g"]] },
  pastatop:   { n: "PASTA LOAD", kcal: 546, p: 17, c: 110, f: 3, extra: [["Pasta, dry", "+125g per load taken"]], i: [["Pasta", "125g dry"], ["Passata", ""], ["Honey", "20g after"]] },
  rcload:     { n: "RICE CAKE LOAD", kcal: 521, p: 7, c: 118, f: 1, bn: "The one that needs no kitchen.", extra: [["Rice cakes", "2 packs"], ["Raisins or sultanas", "500 g"]], i: [["Rice cakes", "8"], ["Raisins or sultanas", "60g"], ["Honey", "20g"]] },
  potatotop:  { n: "POTATO LOAD", kcal: 541, p: 9, c: 117, f: 1, extra: [["Potatoes", "2 kg"]], i: [["Boiled potatoes", "400g"], ["Banana", "1"], ["Honey", "20g"]] },

  /* DINNER · ~940 kcal (BIG on Wednesday and Saturday: ~1,135) */
  steak:      { n: "STEAK & EGGS", kcal: 943, p: 78, c: 72, f: 39, i: [["Steak", "200g"], ["Eggs", "3"], ["Ben's Original rice pouch", "1"]] },
  steakbig:   { n: "STEAK & EGGS BIG", kcal: 1135, p: 83, c: 99, f: 37, i: [["Steak", "250g"], ["Eggs", "3"], ["Ben's Original rice pouch", "1"], ["Banana", "1"]] },
  chicken:    { n: "CHICKEN, EGGS & RICE", kcal: 941, p: 91, c: 83, f: 25, i: [["Chicken breast", "250g"], ["Eggs", "3"], ["Ben's Original rice pouch", "1"], ["Passata", ""], ["Mushrooms", "150g"]] },
  pasta:      { n: "CHICKEN PASTA", kcal: 916, p: 84, c: 100, f: 20, i: [["Chicken breast", "250g"], ["Pasta", "125g dry"], ["Passata", ""], ["Mushrooms", "150g"]] },
  salmon:     { n: "SALMON, EGGS & RICE", kcal: 945, p: 63, c: 77, f: 43, bn: "The one line on the page that beats the capsules. Twice a week, when you'll eat it.", extra: [["Cod or salmon", "2 × 250 g"]], i: [["Salmon", "200g"], ["Eggs", "2"], ["Ben's Original rice pouch", "1"], ["Mushrooms", "150g"]] },
  codprawns:  { n: "COD & PRAWNS WITH RICE", kcal: 915, p: 96, c: 79, f: 21, bn: "The leanest protein you can buy — any night you want a lighter plate that still hits the number. Both cook from frozen in ten minutes.", extra: [["Cod or salmon", "2 × 250 g"], ["Frozen prawns", "1 kg"]], i: [["Cod", "250g"], ["Prawns", "150g"], ["Eggs", "2"], ["Ben's Original rice pouch", "1"], ["Passata", ""]] },
  scallops:   { n: "SCALLOP & PRAWN RICE", kcal: 905, p: 76, c: 73, f: 25, bn: "Scallops fresh, seared two minutes a side.", extra: [["Scallops", "when you want them"], ["Frozen prawns", "1 kg"]], i: [["Scallops", "200g"], ["Prawns", "100g"], ["Eggs", "2"], ["Ben's Original rice pouch", "1"], ["Butter", "15g"]] },
  steakjacket: { n: "STEAK, JACKET & BEANS", kcal: 870, p: 73, c: 89, f: 23, extra: [["Potatoes", "2 kg"], ["Beans", "2 tins"]], i: [["Steak", "200g"], ["Baking potato", "300g"], ["Baked beans", "half a tin"], ["Egg", "1"]] },

  /* BEDTIME · ~130 kcal, on the early-dinner nights */
  casein:     { n: "CASEIN", kcal: 130, p: 30, c: 3, f: 1, bn: "Slow protein through the night, on the five nights dinner is early.", i: [["Casein in water", "35g"]] },
  threeeggs:  { n: "THREE BOILED EGGS", kcal: 233, p: 20, c: 1, f: 16, i: [["Boiled eggs", "3"]] },
  prawnscod:  { n: "PRAWNS OR COD, PLAIN", kcal: 150, p: 30, c: 0, f: 2, extra: [["Frozen prawns", "1 kg"], ["Cod or salmon", "2 × 250 g"]], i: [["Prawns or cod", "150g"]] },

  /* WEEKEND POST-SESSION · ~350 kcal */
  half2ban:   { n: "HALF BOTTLE + 2 BANANAS", kcal: 354, p: 27, c: 63, f: 1, bn: "The other half of the bottle with two bananas — within the hour after the weekend sessions.", i: [["UFIT 50g", "the other half"], ["Bananas", "2"]] },
  halfbanrai: { n: "HALF BOTTLE + BANANA + RAISINS", kcal: 339, p: 27, c: 60, f: 1, extra: [["Raisins or sultanas", "500 g"]], i: [["UFIT 50g", "the other half"], ["Banana", "1"], ["Raisins or sultanas", "30g"]] },
  halfrc4:    { n: "HALF BOTTLE + 4 RICE CAKES", kcal: 345, p: 28, c: 62, f: 1, extra: [["Rice cakes", "2 packs"]], i: [["UFIT 50g", "the other half"], ["Rice cakes", "4, with honey"], ["Honey", "on them"]] },

  banana:     { n: "BANANA", kcal: 105, p: 1, c: 27, f: 0, i: [["Banana", "1"]] },

  /* FIGHT DAY — weigh-in to bell */
  fcarb:      { n: "LOW-FIBRE CARBS — ABOUT 1 G PER KILO", kcal: 300, p: 6, c: 75, f: 1, bn: "Nothing new, nothing fatty, nothing fibrous.", i: [["Rice, bagels, white pasta, bananas, or rice cakes with honey", "about a gram of carbohydrate per kilo of bodyweight"]] },
  flast:      { n: "THE LAST PROPER MEAL", kcal: 715, p: 59, c: 99, f: 11, bn: "Three hours out. Nothing new, nothing fatty, nothing fibrous.", i: [["Ben's Original rice pouch", "1"], ["Chicken breast, cooked", "150g"], ["Banana", "1"]] },
  fhour:      { n: "HALF BOTTLE + BANANA", kcal: 249, p: 26, c: 36, f: 1, bn: "One hour out. Rice cakes and honey in place of the banana if that sits better.", i: [["UFIT 50g", "half · 250ml"], ["Banana — or rice cakes and honey", "1"]] },
};

/* The tendon days — Tuesday, Thursday and Saturday — add collagen to the
   bottle before the session, with a small orange juice for the vitamin C. */
export const COLLAGEN_DAYS = { tue: 1, thu: 1, sat: 1 };
export const COLLAGEN_NOTE = "15 g of collagen or gelatin powder stirred into the bottle, with a small glass of orange juice for the vitamin C. Taken 30–60 minutes before the jumps and the tendon holds, it gives the tendons more of the material they rebuild from.";
export const withCollagen = (b) => Object.assign({}, b, { n: b.n + " + COLLAGEN", kcal: b.kcal + 119, p: b.p + 14, c: b.c + 15,
  i: b.i.concat([["Collagen or gelatin powder", "15 g, stirred into the bottle"], ["Orange juice", "150 ml"]]) });

export const SLOT_OF = { halfban: "pre", porridge: "breakfast", porridgeb: "breakfast", batch: "lunch", batchbig: "lunch",
  twoban: "three", topup: "five", steak: "dinner", steakbig: "dinner", chicken: "dinner", pasta: "dinner",
  casein: "bed", half2ban: "post" };
/* The days the document serves a BIG portion: breakfast on Wednesday,
   Saturday and Sunday; mid-morning on Saturday; dinner on Wednesday and
   Saturday. The day plans carry the BIG block, so this marks them. */
export const BIGKEY = { porridgeb: 1, batchbig: 1, steakbig: 1 };
/* Every slot of the day, its options in the document's order, and where the
   document groups them, the groups. `d` is the increment from that slot's own
   printed A -> BIG pair, used for the options the document doesn't print a BIG
   line for. */
export const SLOTS = {
  pre:       { n: "Before the session", t: "~250 kcal · 25 g protein · 35 g carbs",
               opts: ["halfban", "halfraisin", "halfrc", "halfdates"],
               note: "The bottle is the constant; the carb is whatever sits best at that hour. Nothing with fibre or fat this close to a session." },
  breakfast: { n: "Breakfast", t: "~570 · 16 · 105 · 10",
               opts: ["porridge", "appleraisin", "oatscold", "eggbagelbf", "tunabagelbf"],
               big: { porridge: "porridgeb", appleraisin: "appleraisinb", eggbagelbf: "eggbagelbb" }, d: [140, 3, 25, 2],
               note: "Creatine, 5 g, goes in the water you drink with this feed, every day." },
  lunch:     { n: "Mid-morning and lunch", t: "~545 kcal each",
               opts: ["batch", "jacketbt", "jacketbe", "prawnrice", "wraps", "tunabagel", "chickpouch", "rctuna"],
               groups: [["Sit down", ["batch", "jacketbt", "jacketbe", "prawnrice"]], ["On the move", ["wraps", "tunabagel", "chickpouch", "rctuna"]]],
               big: { batch: "batchbig" }, d: [128, 11, 10, 5],
               note: "BIG portions on Saturday: a third wrap, a second egg, or a second half-pouch — about 130 more." },
  three:     { n: "The three o'clock", t: "~210 · 2 · 54 · 1",
               opts: ["twoban", "onebagel", "appleraisins", "rchoney"] },
  five:      { n: "The 5pm load", t: "~525 · 9 · 116 · 6",
               opts: ["topup", "bageltop", "pastatop", "rcload", "potatotop"],
               note: "Low fat, low fibre, easy to move on — no beans, no wholemeal, no eggs in this slot. It's loading tomorrow morning, not filling you tonight." },
  dinner:    { n: "Dinner", t: "~940 · 80 · 75 · 35",
               opts: ["steak", "chicken", "pasta", "salmon", "codprawns", "scallops", "steakjacket"],
               big: { steak: "steakbig" }, d: [192, 5, 27, -2],
               note: "Steak on the two heavy days. Salmon twice a week, when you'll eat it. Cod, prawns and scallops are the leanest protein you can buy: any night you want a lighter plate that still hits the number." },
  bed:       { n: "Bedtime", t: "~130 · 30 · 3 · 1",
               opts: ["casein", "threeeggs", "half", "prawnscod"] },
  post:      { n: "Weekend post-session", t: "~350 kcal",
               opts: ["half2ban", "halfbanrai", "halfrc4"] },
};
/* The option actually on the plate: the base option, or its BIG form on
   the days the document serves a BIG portion in that slot. */
export function blockOf(key, slot, big) {
  const S = SLOTS[slot];
  if (!big || !S) return B[key];
  if (S.big && S.big[key]) return B[S.big[key]];
  const b = B[key], d = S.d;
  if (!d) return b;
  return Object.assign({}, b, { n: b.n + " BIG", kcal: b.kcal + d[0], p: b.p + d[1], c: b.c + d[2], f: b.f + d[3] });
}
/* The base key for a feed: BIG blocks resolve to the option they enlarge. */
export const BASE_OF = { porridgeb: "porridge", appleraisinb: "appleraisin", eggbagelbb: "eggbagelbf", batchbig: "batch", steakbig: "steak" };
export const slotOf = (k) => SLOT_OF[k] || null;

export const F = (t, b, o) => Object.assign({ t, b }, o);
export const E = (t, n, o) => Object.assign({ t, ev: n }, o);
export const D = {
  mon: { n: "MONDAY", kcal: 3332, p: 249, c: 411, f: 82, tag: "3:30 upper strength + rings ~65 min", star: 0,
    call: ["HALF THE BOTTLE BEFORE, HALF AFTER", "Bench throws, box jumps, bench, dips, chins, rows — a real session, not a warm-up. Half the bottle and a banana at 3:10, the other half the moment you finish, porridge in the thermos behind it."],
    feeds: [F("03:10", "halfban", { crit: 1, note: "Twenty minutes before you start." }), E("03:30", "UPPER STRENGTH + POWER + RINGS · ~65 MIN"), F("04:50", "half", { note: "Straight after the session." }), F("04:50", "porridge", { note: "Thermos, on the way to work." }), F("09:00", "batch"), F("12:30", "batch"), F("15:00", "twoban"), F("18:30", "steak"), F("21:00", "casein", { note: "Half an hour before bed." })] },
  tue: { n: "TUESDAY", kcal: 3726, p: 241, c: 535, f: 73, tag: "3:30 jumps, pistols, engine 1 ~65 min → load Wednesday", star: 0,
    call: ["THE 5PM FEED LOADS WEDNESDAY'S TRAP BAR", "Muscle fuel takes hours to load. Tomorrow's sled, trap bar and pause squat at 3:30am run on today's 5pm carb feed. If Wednesday feels flat, the fault was here. Dinner is late, so no casein tonight."],
    feeds: [F("03:10", "halfban", { crit: 1, note: "Non-negotiable. Jumps into an interval session." }), E("03:30", "JUMPS · PISTOLS · ENGINE 1 · TRUNK · ACHILLES · ~65 MIN"), F("04:50", "half", { note: "Straight after the session." }), F("04:50", "porridge", { note: "Thermos, on the way to work." }), F("09:00", "batch"), F("12:30", "batch"), F("15:00", "twoban"), F("17:00", "topup", { crit: 1, note: "This loads Wednesday morning." }), F("20:15", "chicken", { note: "Dinner is late, so no casein tonight." })] },
  wed: { n: "WEDNESDAY", kcal: 3664, p: 257, c: 463, f: 82, tag: "3:30 sled · trap bar · pause squat · RDL ~60 min", star: 1,
    call: ["NOT FASTED. EVER.", "The loading was done last night at 5pm; the 3:10 half-bottle is non-negotiable. The session is finished by 4:30am — there is nothing at 7pm. Porridge big after it, the big steak tonight: the heavy lower day gets the bigger recovery."],
    feeds: [F("03:10", "halfban", { crit: 1, note: "The loading was done last night. This is non-negotiable." }), E("03:30", "SLED · TRAP BAR · PAUSE SQUAT · RDL · RING ROWS · ~60 MIN"), F("04:50", "half", { note: "Straight after the session." }), F("04:50", "porridgeb", { note: "Thermos, on the way to work." }), F("09:00", "batch"), F("12:30", "batch"), F("15:00", "twoban"), F("18:30", "steakbig"), F("21:00", "casein", { note: "Half an hour before bed." })] },
  thu: { n: "THURSDAY", kcal: 3330, p: 262, c: 422, f: 68, tag: "3:30 throws, split squat, engine 2, neck ~61 min", star: 0,
    call: ["24 MINUTES OF INTERVALS — NOT OPTIONAL", "Throws, split squat, tendon hold, the bike, neck. Half the bottle and a banana at 3:10, the other half the moment you finish, thermos at 4:50."],
    feeds: [F("03:10", "halfban", { crit: 1, note: "24 minutes of intervals. Not optional." }), E("03:30", "THROWS · SPLIT SQUAT · TENDON · ENGINE 2 · NECK · ~61 MIN"), F("04:50", "half", { note: "Straight after the session." }), F("04:50", "porridge", { note: "Thermos, on the way to work." }), F("09:00", "batch"), F("12:30", "batch"), F("15:00", "twoban"), F("18:30", "chicken"), F("21:00", "casein", { note: "Half an hour before bed." })] },
  fri: { n: "FRIDAY", kcal: 3438, p: 213, c: 510, f: 68, tag: "sleep day → work → load Saturday", star: 0,
    call: ["NO SESSION, SAME FOOD", "A rest day is not a low-food day when the biggest session of the week is tomorrow morning. The 5pm carb feed is the most important feed of the week — Saturday's sprints, jumps and squat run on it. If Saturday feels flat, the fault was Friday at 5pm."],
    feeds: [E("", "SLEEP DAY — NO SESSION"), F("05:00", "porridge", { tl: "WAKE", note: "Breakfast, no session in front of it, no bottle." }), F("09:00", "batch"), F("12:30", "batch"), F("15:00", "twoban", { note: "The pre-load starts here." }), F("17:00", "topup", { crit: 1, note: "This loads SATURDAY. The most important feed of the week." }), F("19:30", "pasta"), F("21:00", "casein", { note: "Half an hour before bed." })] },
  sat: { n: "SATURDAY", kcal: 4188, p: 247, c: 586, f: 92, tag: "legs & power ~96 min, then the easy hour", star: 1,
    call: ["THE BIGGEST DAY OF TRAINING AND FOOD", "Porridge big 6:30, half the bottle 7:45, start 8:15. Water and electrolytes during. Today's 5pm carb feed loads Sunday's rounds. Dinner's late, so no casein."],
    feeds: [F("06:30", "porridgeb"), F("07:45", "halfban"), E("08:15", "★ THE LEG & POWER SESSION · ~96 MIN", { sub: "Get-ups, sprints, jumps, squat, circuit, push press." }), F("10:00", "half2ban", { crit: 1, note: "Within the hour after finishing." }), F("11:30", "batchbig"), F("14:30", "batch", { note: "The easy hour, if it's today, sits between the 11:30 and 14:30 feeds or after this one — water only." }), F("17:00", "topup", { crit: 1, note: "This loads SUNDAY." }), F("20:00", "steakbig", { note: "Dinner's late; no casein tonight." })] },
  sun: { n: "SUNDAY", kcal: 3550, p: 259, c: 491, f: 65, tag: "throws · Nordics · fight rounds · core ~80 min", star: 1,
    call: ["THE ROUNDS DRAIN THE TANK", "Electrolytes throughout, and a banana in the gap between the throws and the Nordics on fight-sim weeks — that one's extra, and it's the only extra. Weeks 1 and 16 the rounds are the 20-minute bike test — same rule."],
    feeds: [F("06:30", "porridgeb"), F("07:45", "halfban"), E("08:15", "★ THROWS · NORDICS · FIGHT ROUNDS · CORE · ~80 MIN", { sub: "Sim weeks: banana in the throws → Nordics gap. That one's extra, and it's the only extra." }), F("10:00", "half2ban", { crit: 1, note: "Within the hour after finishing." }), F("11:30", "batch"), F("14:30", "batch", { note: "If the easy hour is today, it's after this feed." }), F("17:00", "banana"), F("19:30", "pasta"), F("21:00", "casein", { note: "Half an hour before bed." })] },
};

/* The phase table's changes, applied to a day's feeds. */
export function phaseFeeds(ph, day, feeds) {
  if (!ph) return feeds;
  if (ph === "build" && (day === "mon" || day === "thu")) {
    /* the 5pm load the two light days don't otherwise get */
    const at = feeds.findIndex((f) => f.b && tMin(f.t) > tMin("15:00"));
    const row = F("17:00", "topup", { crit: 1, note: "BUILD puts the 5pm load on Monday and Thursday as well." });
    return feeds.slice(0, at < 0 ? feeds.length : at).concat([row], at < 0 ? [] : feeds.slice(at));
  }
  if (ph === "trans") {
    let out = feeds;
    if (day === "mon" || day === "wed" || day === "thu") out = out.filter((f) => f.b !== "twoban");
    if (day === "sat") out = out.map((f) => f.b === "batchbig" ? Object.assign({}, f, { b: "batch" }) : f);
    return out;
  }
  if (ph === "cut") {
    /* the making-weight section, in its order */
    let out = feeds.filter((f) => f.b !== "casein");
    out = out.map((f) => f.b === "batchbig" ? Object.assign({}, f, { b: "batch" }) : f);
    if (day === "mon" || day === "thu") out = out.map((f) => f.b === "twoban" ? Object.assign({}, f, { b: "banana" }) : f);
    return out;
  }
  return feeds;
}
export const MIDBANANA = { fast: 1, camp: 1 };

export const HYDRA_RULES = [
  ["The 5:15 litre with the sachet is the one that never moves.", "You start every shift already sweating from a session; this is what stops the day going dark at ten."],
  ["Pale straw at 10 and 4.", "The check outranks the schedule — dark means more, however much you've drunk."],
  ["Cramps at night, a headache in the afternoon, a resting heart rate up with no other reason:", "under-replaced yesterday. Sachet 2 today, salt on dinner, and the 14:00 goes to 500."],
  ["Nothing big after eight.", "The camp runs on sleep."],
];

export const SHOP = [
  ["MEAT & EGGS", [["Beef mince 5%", "2.2 kg raw — the batch only"], ["Steak", "3 — one 200 g, two 250 g"], ["Chicken breast", "4 × 250 g"], ["Eggs", "3 dozen — 21 boiled (12 Sunday, 9 Wednesday) plus the dinners"]]],
  ["CARBS", [["Sweet potato", "4.3 kg raw"], ["Ben's Original rice pouches", "8"], ["Pasta, dry", "250 g"], ["Quaker Oat So Simple Golden Syrup sachets", "17 — two boxes of 15 last under a fortnight"], ["Honey", "~200 g"], ["Bananas", "~35"]]],
  ["THE REST", [["Passata", "2.5 L — the batch, plus the two chicken dinners"], ["Beef stock", "as needed"], ["UFIT 50 g", "6 bottles"], ["Casein", "a 1 kg tub lasts about six weeks"], ["Milk", "2 L — the porridge only"], ["Mushrooms", "1.3 kg"], ["Electrolyte sachets", "8–12 a week"], ["Collagen or gelatin powder", "300 g — 15 g in the bottle on Tuesday, Thursday and Saturday"], ["Orange juice", "1 litre — 150 ml with the collagen"]]],
  ["SUPPLEMENTS", [["Creatine monohydrate", "Creatine 5 g in the post-session water, daily"], ["Omega-3 (fish oil)", "1–2 g EPA+DHA daily — there is no oily fish anywhere in your diet"], ["Vitamin D", "1,000–2,000 IU daily, October to April"], ["Multivitamin", "as before — cheap insurance"], ["Beta-alanine (optional)", "3.2 g/day split in two; needs four-plus weeks to work, so start week 1 or don't bother. Helps exactly where it hurts: the 40-second repeats, the repeat bursts and the fight sim. The tingling is harmless."]]],
];
/* The document's "as you use them" list, in its order. An item appears only
   once an option that needs it has been chosen in the last fortnight. */
export const AS_YOU_USE = ["Bagels", "Wholemeal wraps", "Rice cakes", "Raisins or sultanas", "Apples", "Tuna in spring water", "Beans", "Potatoes", "Frozen prawns", "Cod or salmon", "Scallops", "Dates", "Chicken breast", "Pasta, dry"];

/* Typical raw→cooked yields (fallbacks until he weighs his own) */
export const YIELDS = [["White rice", "×2.6 from dry"], ["Pasta", "×2.2 from dry"], ["Chicken breast", "×0.75 from raw"], ["Mince 5%", "×0.7 from raw"], ["Sweet potato (boiled in)", "×0.8 from raw"], ["The batch, mixed", "≈ ×0.8 of everything in"]];

export const MEASURES = [
  { k: "kg", n: "BODYWEIGHT", unit: "kg", c: FC.sage },
  { k: "waist", n: "WAIST", unit: "cm", c: FC.ember },
  { k: "arm", n: "ARM", unit: "cm", c: FC.honey, every4: true },
  { k: "shoulder", n: "SHOULDER", unit: "cm", c: FC.frost, every4: true },
];
export const UPPER = MEASURES.filter((m) => m.every4);
export const WEEKLY = MEASURES.filter((m) => !m.every4);
const DAY_MS = 86400000;
const weeksBetween = (a, b) => (parseISO(b) - parseISO(a)) / (DAY_MS * 7);

/* Least-squares slope in units per week. Null under two points. */
export function tapeSlope(pts) {
  if (!pts || pts.length < 2) return null;
  const t0 = parseISO(pts[0].d);
  const xs = pts.map((p) => (parseISO(p.d) - t0) / (DAY_MS * 7)), ys = pts.map((p) => p.v);
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  return den === 0 ? null : num / den;
}
export const tapeSeries = (rows, k) => rows.filter((r) => r[k] != null && r[k] !== "").map((r) => ({ d: r.d, v: Number(r[k]) }));
const within = (pts, days) => { if (!pts.length) return []; const last = parseISO(pts[pts.length - 1].d); return pts.filter((p) => (last - parseISO(p.d)) <= days * DAY_MS); };
const fmt = (v, dp) => (v > 0 ? "+" : "") + v.toFixed(dp == null ? 1 : dp);

/* The three rules from THE FEEDBACK LOOP, read off the logged numbers. */
export function verdicts(rows) {
  const kg = tapeSeries(rows, "kg"), waist = tapeSeries(rows, "waist");
  const arm = tapeSeries(rows, "arm"), sh = tapeSeries(rows, "shoulder");
  const out = [];

  /* 1 — waist climbing faster than arms and shoulders, over the tape window */
  const taped = rows.filter((r) => r.waist != null && r.waist !== "" && ((r.arm != null && r.arm !== "") || (r.shoulder != null && r.shoulder !== "")));
  if (taped.length >= 2) {
    const a = taped[taped.length - 2], b = taped[taped.length - 1];
    const wk = weeksBetween(a.d, b.d);
    const dW = Number(b.waist) - Number(a.waist);
    const ups = [];
    if (a.arm != null && a.arm !== "" && b.arm != null && b.arm !== "") ups.push(Number(b.arm) - Number(a.arm));
    if (a.shoulder != null && a.shoulder !== "" && b.shoulder != null && b.shoulder !== "") ups.push(Number(b.shoulder) - Number(a.shoulder));
    const dU = ups.length ? ups.reduce((x, y) => x + y, 0) / ups.length : 0;
    out.push({ id: "waist", lit: dW > 0 && dW > dU,
      head: "Waist climbing faster than arms and shoulders",
      act: "Cut 100–150 kcal — one of the three o'clock bananas on Monday and Thursday.",
      read: "Waist " + fmt(dW) + " cm against " + fmt(dU) + " cm up top, over " + wk.toFixed(0) + " week" + (Math.round(wk) === 1 ? "" : "s") + "." });
  } else {
    out.push({ id: "waist", lit: false, head: "Waist climbing faster than arms and shoulders",
      act: "Cut 100–150 kcal — one of the three o'clock bananas on Monday and Thursday.",
      read: "Needs two tape sessions with waist and arm or shoulder." });
  }

  /* 2 — nothing moving in six weeks, waist flat */
  const six = within(kg, 45), sixW = within(waist, 45);
  if (six.length >= 3 && sixW.length >= 2 && weeksBetween(six[0].d, six[six.length - 1].d) >= 5.5) {
    const kgWk = tapeSlope(six), wWk = tapeSlope(sixW);
    const upWk = [tapeSlope(within(arm, 45)), tapeSlope(within(sh, 45))].filter((x) => x != null);
    const upFlat = !upWk.length || upWk.every((x) => x <= 0.02);
    out.push({ id: "stuck", lit: Math.abs(wWk) <= 0.08 && Math.abs(kgWk) <= 0.06 && upFlat,
      head: "Nothing moving in six weeks, waist flat",
      act: "Add 200 kcal — one extra 5pm load.",
      read: "Weight " + fmt(kgWk * 6, 1) + " kg and waist " + fmt(wWk * 6, 1) + " cm over the last six weeks." });
  } else {
    out.push({ id: "stuck", lit: false, head: "Nothing moving in six weeks, waist flat",
      act: "Add 200 kcal — one extra 5pm load.",
      read: "Needs six weeks of weekly weigh-ins." });
  }

  /* 3 — bodyweight falling more than half a kilo a week */
  const four = within(kg, 28);
  if (four.length >= 3) {
    const kgWk = tapeSlope(four);
    out.push({ id: "falling", lit: kgWk < -0.5,
      head: "Bodyweight falling more than 0.5 kg a week",
      act: "Add the 5pm load and a rice pouch on the light days. You're under-eating — the answer is food, not a program change.",
      read: "Trending " + fmt(kgWk, 2) + " kg a week over the last four." });
  } else {
    out.push({ id: "falling", lit: false, head: "Bodyweight falling more than 0.5 kg a week",
      act: "Add the 5pm load and a rice pouch on the light days.",
      read: "Needs three weekly weigh-ins." });
  }
  return out;
}
/* ================================================================
   THE PHASE TABLE — what the season changes about the food. The phase
   is read off the app's one season (program, start, fight date and the
   making-weight switch); the fuel app's own season settings are gone.
   ================================================================ */
export const BASE_TARGET = { kcal: 3600, p: 245, c: 487, f: 78 };
export const PHASES = {
  build:   { n: "BUILD", sub: "Prep accumulation", t: { kcal: 3900, p: 245, c: 560, f: 80 }, c: FC.honey, chg: "The 5pm load on Monday and Thursday as well.",
             r: ["The 5pm load on Monday and Thursday as well — the two days without one.", "Surplus about 300. Tissue is being built; feed it. The tape at the block's end decides whether it stays."] },
  heavy:   { n: "HEAVY", sub: "Intensify", t: BASE_TARGET, c: FC.ember, r: ["The day as printed. The extra loads come off."] },
  fast:    { n: "FAST", sub: "Convert", t: BASE_TARGET, c: FC.ember, chg: "On the scored round weeks, the mid-session banana.", r: ["The day as printed.", "On the scored round weeks, the mid-session banana."] },
  test:    { n: "TEST WEEK", sub: "Prep's last week", t: BASE_TARGET, c: FC.frost, chg: "Do not cut. Training drops, carbs hold; the tank fills.", r: ["Do not cut. Training drops, carbs hold; the tank fills.", "Test day eats like a Saturday."] },
  camp:    { n: "CAMP", sub: "Foundation, build, peak", t: BASE_TARGET, c: FC.ember,
             r: ["The day as printed. Do not cut in the light weeks.", "Seven-round weeks keep the mid-session banana.", "Sauna weeks: the hydration schedule's sauna line."] },
  easy:    { n: "EASY WEEK", sub: "Camp", t: BASE_TARGET, c: FC.sage, chg: "Do not cut. Eating less because you are training less is how fights are lost.", r: ["Do not cut. The commonest way to lose a fight is eating less because you're training less."] },
  sharpen: { n: "SHARPEN", sub: "Camp", t: BASE_TARGET, c: FC.sage, chg: "Do not cut. Eating less because you are training less is how fights are lost.", r: ["Do not cut. The commonest way to lose a fight is eating less because you're training less."] },
  fight:   { n: "FIGHT WEEK", sub: "", t: BASE_TARGET, c: FC.copper, r: ["The day as printed.", "Weigh-in day per the weight section."] },
  trans:   { n: "TRANSITION", sub: "The two weeks after a fight", t: { kcal: 3300, p: 235, c: 420, f: 78 }, c: FC.frost, chg: "No three o'clock on Monday, Wednesday and Thursday; Saturday's big portion standard.",
             r: ["No three o'clock on Monday, Wednesday and Thursday; Saturday's big portion back to standard.", "Maintenance. Protein holds so the muscle does."] },
  cut:     { n: "MAKING WEIGHT", sub: "Only when the limit demands it", t: { kcal: 3100, p: 200, c: 400, f: 70 }, c: FC.copper, chg: "Carbs off the light days, never protein, never the bottle, never the loads.",
             r: ["Carbs off the light days, never protein, never the bottle, never the loads.", "Cut in order: the casein, then Saturday's BIG back to standard, then one of the three o'clock bananas on Monday and Thursday.", "Half a percent of bodyweight a week, no faster."] },
};

/* ================================================================
   THE CLOCK — the fuel app's session settings, now the app's own.
   ================================================================ */
export const DEFAULT_BREAKS = () => ["09:00", "12:30"];
export const DEFAULT_LEN = () => ({ mon: 65, tue: 65, wed: 62, thu: 65, sat: 90, sun: 80 });
export const LEN_DAYS = [["mon", "MON"], ["tue", "TUE"], ["wed", "WED"], ["thu", "THU"], ["sat", "SAT"], ["sun", "SUN"]];
export const SACHET = "⚡";
export const CREATINE = "CREATINE 5 G IN THE WATER";
export const WATER_KIT = "One 1-litre bottle for work, one 500 ml for the gym, sachets in the bag. Two sachets a day is the ceiling — three only on a sauna day — and salt your food.";
export const SAUNA_WATER = { before: 500, after: 500 };
export const EASY_WATER = 500;

/* ================================================================
   fuelPlan — one day's feeds and drinks, each on the clock.

   The morning moves with the session start: the wake half an hour before
   a weekday session (two hours before a weekend one), half the bottle
   twenty minutes before (thirty at the weekend), the other half the
   moment it ends, breakfast a quarter of an hour after that, work start
   twenty-five minutes after breakfast and never before 05:15. With no
   session the start is the wake, and breakfast is fifteen minutes after
   it. The two work breaks come from settings; everything from three
   o'clock on is the plan's own clock, and the casein is half an hour
   before the light goes off.

   The water schedule is threaded into the same rows: a drink that goes
   with a feed is on the feed's row, and the rest are rows of their own.
   ================================================================ */
export function fuelPlan(o) {
  if (o.fight) return fightDayPlan(o);
  const day = o.day, weekend = day === "sat" || day === "sun", work = !weekend;
  const sess = !!o.session;
  const S = o.start, len = Number(o.len) || 0;
  const breaks = (o.breaks || DEFAULT_BREAKS()).filter(Boolean);
  const picks = o.menu || {};
  const wake = !sess ? S : weekend ? S - 120 : S - 30;
  const bf = !sess ? wake + 15 : weekend ? S - 105 : S + len + 15;
  const lights = o.lights;

  const plan = D[day];
  const feeds = phaseFeeds(o.phase, day, plan.feeds).filter((f) => f.b);
  const seen = {}, rows = [];
  let lunchN = 0;
  feeds.forEach((f) => {
    if (!sess && (f.b === "halfban" || f.b === "half" || f.b === "half2ban")) return;
    const base = BASE_OF[f.b] || f.b, slot = slotOf(f.b);
    let pickId = null, key = base, nth = 0;
    if (slot) {
      nth = seen[slot] || 0; seen[slot] = nth + 1;
      pickId = day + "-" + slot + (nth ? "-" + nth : "");
      const chosen = picks[pickId];
      if (chosen && SLOTS[slot].opts.indexOf(chosen) >= 0) key = chosen;
    }
    const big = !!BIGKEY[f.b];
    const blk = slot ? blockOf(key, slot, big) : B[key];
    let t;
    if (f.b === "halfban") t = weekend ? S - 30 : S - 20;
    else if (f.b === "half") t = S + len;
    else if (f.b === "porridge" || f.b === "porridgeb") t = bf;
    else if (f.b === "half2ban") t = S + len + 15;
    else if (f.b === "batch" || f.b === "batchbig") { const b = breaks[Math.min(lunchN, breaks.length - 1)]; lunchN++; t = work && b ? tMin(b) : tMin(f.t); }
    else if (f.b === "casein" && lights != null) t = lights - 30;
    else t = tMin(f.t);
    const id = "f-" + (slot ? slot + (nth ? "-" + nth : "") : f.b);
    const col = slot === "pre" && !!COLLAGEN_DAYS[day];
    rows.push({ id, kind: "feed", t, b: f.b, base, key, slot, big, pickId, blk: col ? withCollagen(blk) : blk, crit: !!f.crit,
      note: col ? COLLAGEN_NOTE : f.note || "", sub: f.sub || "", ml: 0, collagen: col });
  });
  const feedOf = (pred) => rows.find((r) => r.kind === "feed" && pred(r));
  const lunch = rows.filter((r) => r.slot === "lunch");
  /* a drink that goes with a feed rides on its row; if the feed isn't
     there today, the drink keeps its own row at its own time */
  const withFeed = (r, w) => { if (r) Object.assign(r, w); return !!r; };
  const water = (id, t, ml, n, extra) => rows.push(Object.assign({ id: "w-" + id, kind: "water", t, ml, n }, extra || {}));
  const cre = (x) => ({ cre: 1, ...x });

  if (work) {
    water("wake", wake + 1, 500, "500 ml water on waking", !sess ? cre({ note: "The creatine goes in this one today." })
      : { note: "Straight after the strap numbers." });
    if (sess) {
      water("sess", S, 500, "The gym bottle — 500 ml, sipped through the session", { note: "Sipped between blocks. Not electrolytes — an hour indoors doesn't need them." });
      withFeed(feedOf((r) => r.slot === "breakfast"), cre({ ml: 300, wnote: "300 ml water with it, the creatine in it. The second half of the bottle counts as another 250." }));
    }
    const bfRow = feedOf((r) => r.slot === "breakfast");
    const start = Math.max(tMin("05:15"), (bfRow ? bfRow.t : bf) + (sess ? 25 : 0));
    water("start", start, 1000, "Work start — the 1-litre bottle", { sachet: "SACHET 1", note: "Sip it from now to the first break. It should be empty by 09:00." });
    water("check7", Math.max(tMin("07:00"), start + 30), 0, "Check the bottle", { note: "If it's still full, drink 300 ml now." });
    [0, 1].forEach((i) => { if (!withFeed(lunch[i], { ml: 500, wnote: i ? "500 ml water with it." : "500 ml water with it. Refill the litre bottle, plain water." }))
      water("feed" + (i + 1), tMin(breaks[i] || (i ? "12:30" : "09:00")), 500, i ? "500 ml water at the second break" : "500 ml water at the first break"); });
    water("u1", tMin("10:00"), 0, "Urine check at ten", { check: 1, note: "Pale straw = carry on. Dark = 500 ml now and sachet 2 at 15:00 today." });
    water("t1045", tMin("10:45"), 300, "300 ml water — mid-morning");
    water("t1400", tMin("14:00"), 300, "300 ml water — the afternoon", { note: "On a hot day or a heavy-sweat day, 500." });
    if (!withFeed(feedOf((r) => r.slot === "three"), { ml: 500, sachet: "SACHET 2", sachetIf: 1, wnote: "500 ml water — with sachet 2 on hot days, heavy-sweat days, or after a dark 10am check. Otherwise plain." }))
      water("feed3", tMin("15:00"), 500, "500 ml water at three", { sachet: "SACHET 2", sachetIf: 1, note: "With sachet 2 on hot days, heavy-sweat days, or after a dark 10am check. Otherwise plain." });
    water("u2", tMin("16:00"), 0, "Urine check at four", { check: 2, note: "Dark = 500 ml before 17:00 and salt on dinner." });
    withFeed(feedOf((r) => r.slot === "five"), { ml: 300, wnote: "300 ml water with it." });
  } else {
    water("wake", wake + 1, 500, "500 ml water on waking", !sess ? cre({}) : {});
    withFeed(feedOf((r) => r.slot === "breakfast"), { ml: 300, wnote: "300 ml water with it." });
    if (sess) {
      withFeed(feedOf((r) => r.slot === "pre"), { ml: 250, wnote: "The half bottle counts as 250 ml." });
      water("sess", S, 750, "750 ml with a sachet, through the session", { sachet: "A SACHET", note: "Saturday's sprints and Sunday's rounds are the two sessions that drain you. Sunday, on the seven-round weeks, keep sipping through the rounds." });
      withFeed(feedOf((r) => r.slot === "post"), cre({ ml: 500, wnote: "500 ml water with it, the creatine in it." }));
    }
    [0, 1].forEach((i) => { if (!withFeed(lunch[i], { ml: 500, wnote: "500 ml water with it." })) water("f" + (i + 1), tMin(i ? "14:30" : "11:30"), 500, i ? "500 ml water at half past two" : "500 ml water at half past eleven"); });
    if (!withFeed(feedOf((r) => r.t === tMin("17:00")), { ml: 500, wnote: "500 ml water with it." })) water("t1700", tMin("17:00"), 500, "500 ml water at five");
  }
  withFeed(feedOf((r) => r.slot === "dinner"), { ml: 300, wnote: "300 ml water with it." });
  water("last", tMin("20:00"), 250, "The last big drink — 250 ml", { note: "Nothing large after this. Water at 9pm is a 2am toilet trip, and the sleep is worth more than the fluid." });
  if (o.sauna) {
    rows.push({ id: "w-sauna1", kind: "water", anchor: "sauna-before", ml: SAUNA_WATER.before, n: "500 ml before the sauna", note: "Never sauna dry." });
    rows.push({ id: "w-sauna2", kind: "water", anchor: "sauna-after", ml: SAUNA_WATER.after, n: "500 ml after the sauna, with a second sachet", sachet: "A SECOND SACHET", note: "Twenty minutes in a sauna is half a litre gone." });
  }
  const target = (weekend ? 4000 : 4500) + (o.sauna ? 500 : 0);
  return { rows, target, weekend, work, wake, call: plan.call, dayName: plan.n, star: plan.star, tag: plan.tag };
}

/* The water a row carries once it is ticked. A dark urine check is 500 ml
   of its own, per the document. */
export const mlOf = (r, checks) => (r.check ? ((checks || {})[r.check] === "dark" ? 500 : 0) : (r.ml || 0));

/* ================================================================
   FIGHT DAY — WEIGH-IN TO BELL. The session start is the bell; every
   row runs back from it. With the making-weight switch on, the hours
   between the scale and the bell put the weight back: 1.25–1.5 litres
   for every kilo lost with a sachet in every litre, and low-fibre carbs
   every hour or two until three hours out. Without it, the day eats as
   a normal Saturday. Then the same for both: the last proper meal three
   hours out, half the bottle and a banana an hour out, caffeine an hour
   out, and sips with electrolytes through the warm-up and the rounds.
   Bicarbonate is for the March fight only, after a trial.
   ================================================================ */
export const FIGHT_DAY = {
  rehydrate: "Drink 1.25–1.5 litres for every kilo lost, an electrolyte sachet in every litre, sipped steadily, not gulped.",
  caffeine: "About 240 mg — a strong coffee or a caffeine tablet. Only with blood pressure in the normal range, and only after using it before a hard session in camp; never for the first time on fight night. The noon caffeine rule doesn't apply tonight.",
  bicarb: "The March fight only, and only after a trial on a Sunday simulation in camp — the dose and timing trialled. The dose is large and stomach upset is common; fight night is no place to find out.",
  sips: "Sips of water with electrolytes through the warm-up and between rounds, nothing else.",
};
function fightDayPlan(o) {
  const B0 = o.start, wake = Math.min(tMin("07:00"), B0 - 360), last = B0 - 180, rows = [];
  const feed = (id, t, b, extra) => rows.push(Object.assign({ id, kind: "feed", t, b, base: b, key: b, slot: null, big: false, pickId: null, blk: B[b], crit: 0, note: "", sub: "", ml: 0 }, extra || {}));
  const water = (id, t, ml, n, extra) => rows.push(Object.assign({ id: "w-" + id, kind: "water", t, ml, n }, extra || {}));
  water("wake", wake + 1, 500, "500 ml water on waking", { cre: 1 });
  if (o.cut) {
    water("rehyd", wake + 5, 0, "Put the weight back — 1.25–1.5 litres for every kilo lost", { sachet: "A SACHET IN EVERY LITRE", note: FIGHT_DAY.rehydrate });
    let n = 0;
    for (let t = wake + 30; t <= last - 60; t += 120) feed("f-fcarb" + (n ? "-" + n : ""), t, "fcarb", { ml: 0, note: n ? "" : "Every hour or two until three hours out." }), n++;
  } else {
    feed("f-breakfast", wake + 15, "porridgeb", { slot: "breakfast", ml: 300, wnote: "300 ml water with it.", note: "A normal Saturday until three hours out — drink to the alarms." });
    if (tMin("11:30") <= last - 60) feed("f-lunch", tMin("11:30"), "batchbig", { slot: "lunch", ml: 500, wnote: "500 ml water with it." });
    if (tMin("14:30") <= last - 60) feed("f-lunch-1", tMin("14:30"), "batch", { slot: "lunch", ml: 500, wnote: "500 ml water with it." });
  }
  feed("f-fight3", last, "flast", { crit: 1, ml: 300, wnote: "300 ml water with it." });
  if (o.march) water("bicarb", B0 - 90, 0, "Sodium bicarbonate — the March fight, as trialled", { note: FIGHT_DAY.bicarb });
  feed("f-fight1", B0 - 60, "fhour", { crit: 1, ml: 250, wnote: "The half bottle counts as 250 ml." });
  water("caffeine", B0 - 60, 0, "Caffeine — about 240 mg, an hour before the bell", { note: FIGHT_DAY.caffeine });
  water("sips", B0 - 30, 0, "The warm-up and between rounds — sips with electrolytes", { sachet: "A SACHET", note: FIGHT_DAY.sips });
  rows.sort((a, b) => a.t - b.t);
  return { rows, target: 4000, weekend: true, work: false, wake, call: ["FIGHT DAY — WEIGH-IN TO BELL", "Nothing new, nothing fatty, nothing fibrous. The bell is the clock."],
    dayName: "FIGHT DAY", star: 1, tag: "the bell" };
}
