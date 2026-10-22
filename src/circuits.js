/* ================================================================
   THE DIPS, THE CIRCUITS AND THE CARRIES — Prep's and the camp's.

   Monday's weighted dips and ring rows, the arms circuit, THE BRACE on
   Tuesday, the shoulders circuit on Thursday, the farmer's carry on
   Wednesday and the bear-hug carry on Saturday. The pair and the three
   circuits are one card each, with a guided timer that says every
   exercise out loud and boxes for the weights; the carries are cards of
   their own. Prep and the camp build them here from their own numbers.
   ================================================================ */

/* Monday's warm-up: the shoulders first, then the dips at bodyweight */
export const MON_WU = { n: "Warm-up", s: "4 min · Mon",
  note: "The shoulders first, then the dips at bodyweight, before any weight goes on the belt.",
  i: [["Band pull-apart", "×20"], ["Band external rotation", "×15 per arm"], ["Ring support hold", "2 × 20 s"], ["Bodyweight dips", "×5"]] };

/* the dips by the week's phase: the reps and the one line that loads them */
export const DIPS = {
  "6–8": { reps: "6–8", say: "6–8", cue: "Leave two reps in you every set. When every set reaches 8, add 2.5 kg next week." },
  "4–6": { reps: "4–6", say: "4–6, heavier", cue: "Heavier: leave two in you. When every set reaches 6, add 2.5 kg next week." },
  "4–5": { reps: "4–5", say: "4–5, driven up fast", cue: "Driven up fast: the set ends the moment a rep slows." },
  light: { reps: "5", say: "5, light and fast", cue: "Light and fast: a weight you could do ten with." },
  heavy: { reps: "5", say: "5, heavy", cue: "Heavy: a weight that leaves two in you at five." },
};
const DIP_HOW = "Parallel bars, weight on a belt. Lower until your shoulders are level with your elbows, chest slightly forward, then press to locked arms. No deeper.";
const ROW_HOW = "Rings at hip height, body straight, heels on the floor: pull the rings to your chest, pause, lower slowly.";

/* how long a circuit takes: its work, the gaps between exercises and the
   rest after every round but the last */
export function circuitSecs(list, rounds, between, rest) {
  let t = 0;
  for (let i = 1; i <= rounds; i++) {
    const here = list.filter((x) => !x.upto || i <= x.upto);
    t += here.reduce((a, x) => a + x.s, 0) + Math.max(0, here.length - 1) * between;
    if (i < rounds) t += rest;
  }
  return t;
}
const mins = (s) => Math.max(1, Math.round(s / 60));
const roundsWord = (n) => n + (n === 1 ? " round" : " rounds");

/* One card a circuit. c: { L, n, title, pfx, rounds(rx), list(rx), between,
   rest, line(rx), why, w } — each entry of the list: { id, n, l (what the
   timer says), s (its seconds), upto (the last round it runs in), out (the
   box's name, kg) } */
export function circuitBlock(c) {
  const n = (rx) => c.rounds(rx) || 0;
  return { L: c.L, n: c.n, circuit: 1,
    hide: (rx) => !n(rx) || (c.hide ? !!c.hide(rx) : false),
    m: (rx) => mins(circuitSecs(c.list(rx), n(rx), c.between, c.rest)),
    timer: (rx) => ({ kind: "circuit", opt: { rounds: n(rx), between: c.between, rest: c.rest, items: c.list(rx).map((x) => ({ l: x.l, s: x.s, upto: x.upto || 0 })) }, title: c.title }),
    rxLine: (rx) => roundsWord(n(rx)) + (c.line ? c.line(rx) : "") + " · " + c.between + " s between exercises · " + c.rest + " s after each round",
    items: (rx) => c.list(rx).map((x) => ({ n: x.n, s: x.l.toLowerCase(), cue: x.cue || "", id: c.pfx + "_" + x.id + "_part", k: "chk" }))
      .concat(c.list(rx).filter((x) => x.out).map((x) => ({ n: x.out, s: "the weight you used", id: c.pfx + "_" + x.id, k: "out", u: "kg" }))),
    w: c.w, why: c.why };
}

/* MONDAY · the weighted dips and the ring rows, a round of each, a minute
   after each. A shoulder or an elbow at 4 or more on Sunday's check: push-ups
   for the dips and the rows held at the top. */
export function dipsAndRows(o) {
  const n = (rx) => o.rounds(rx) || 0;
  const list = (rx) => { const u = !!rx.upper4, d = DIPS[o.dips(rx)] || DIPS["6–8"];
    return [u ? { id: "pushup", n: "Push-ups", l: "PUSH-UPS × 12–15, TWO SECONDS DOWN", s: 35 } : { id: "dip", n: "Weighted dips", l: "WEIGHTED DIPS × " + d.say.toUpperCase(), s: 35, cue: DIP_HOW + " " + d.cue },
      { id: "row", n: "Ring rows — at your level", l: u ? "RING ROWS — HOLD AT THE TOP, 20 S" : "RING ROWS — AT YOUR LEVEL", s: 35, cue: ROW_HOW }]; };
  return { L: o.L, n: "Dips + Ring Rows", cal: "ringrow", circuit: 1,
    hide: (rx) => !n(rx) || (o.hide ? !!o.hide(rx) : false),
    m: (rx) => mins(circuitSecs(list(rx), n(rx), 60, 60)),
    timer: (rx) => ({ kind: "circuit", opt: { rounds: n(rx), between: 60, rest: 60, items: list(rx).map((x) => ({ l: x.l, s: x.s })) }, title: "DIPS + RING ROWS" }),
    rxLine: (rx) => { const d = DIPS[o.dips(rx)] || DIPS["6–8"];
      return roundsWord(n(rx)) + " · " + (rx.upper4 ? "push-ups × 12–15" : "weighted dips × " + d.say) + " · ring rows " + (rx.upper4 ? "held at the top" : "at your level") + " · 60 s after each"; },
    items: (rx) => list(rx).map((x) => ({ n: x.n, s: x.l.toLowerCase(), cue: x.cue || "", id: o.pfx + "_" + x.id + "_part", k: "chk" }))
      .concat(rx.upper4 ? [{ n: "Push-ups — the last round", s: "reps", id: o.pfx + "_pushup_reps", k: "out", u: "reps" }]
        : [{ n: "Dips — on the belt", s: "the weight you used", id: o.pfx + "_dip_kg", k: "out", u: "kg" },
          { n: "Dips — the last round", s: "reps", id: o.pfx + "_dip_reps", k: "out", u: "reps" }]),
    w: (rx) => (rx.upper4 ? "A shoulder or an elbow at 4 or more on Sunday's check: push-ups for the dips and the rows held at the top, this week only." : "Down until your shoulders are level with your elbows and no deeper. Elbow or shoulder pain is a stop sign, not a challenge."),
    why: o.why };
}

/* THE ARMS CIRCUIT · Monday */
export function armsCircuit(o) {
  return circuitBlock({ L: o.L, n: "The Arms Circuit", title: "THE ARMS CIRCUIT", pfx: o.pfx, rounds: o.rounds, hide: o.hide, between: 20, rest: 90,
    list: (rx) => (rx.upper4 ? [] : [
      { id: "inccurl", n: "Incline dumbbell curl", l: "INCLINE CURLS × 10–12", s: 35, out: "Incline curl" },
      { id: "ohtri", n: "Overhead triceps extension", l: "OVERHEAD TRICEPS × 10–12", s: 35, out: "Overhead triceps" }]).concat([
      { id: "lat", n: "Lateral raise", l: "LATERAL RAISES × 15", s: 35, out: "Lateral raise" },
      { id: "rdf", n: "Rear-delt fly", l: "REAR-DELT FLIES × 15", s: 35, out: "Rear-delt fly" }]),
    line: (rx) => (rx.upper4 ? " · lateral raises and rear-delt flies only — no curls or triceps this week" : ""),
    w: "Leave two reps in you on each. When every round reaches the top of the range, go up a dumbbell next time.",
    why: o.why });
}

/* THE SHOULDERS CIRCUIT · Thursday */
export function shouldersCircuit(o) {
  return circuitBlock({ L: o.L, n: "The Shoulders Circuit", title: "THE SHOULDERS CIRCUIT", pfx: o.pfx, rounds: o.rounds, hide: o.hide, between: 20, rest: 90,
    list: (rx) => [
      { id: "lat2", n: "Lateral raise", l: "LATERAL RAISES × 15", s: 35, out: "Lateral raise" },
      { id: "shrug", n: "Trap bar shrugs", l: "TRAP BAR SHRUGS × 10–12", s: 35, out: "Shrugs" }].concat(rx.upper4 ? [] : [
      { id: "ham", n: "Hammer curl", l: "HAMMER CURLS × 10–12", s: 35, out: "Hammer curl" },
      { id: "push", n: "Rope pushdown", l: "ROPE PUSHDOWNS × 12–15", s: 35, out: "Rope pushdown" }]),
    line: (rx) => (rx.upper4 ? " · lateral raises and shrugs only — no curls or triceps this week" : ""),
    w: "Leave two reps in you on each. When every round reaches the top of the range, go up next time.",
    why: o.why });
}

/* THE BRACE · Tuesday — the body-shot block. The Copenhagen plank runs in
   the first `copen` rounds. */
export function theBrace(o) {
  return circuitBlock({ L: o.L, n: "THE BRACE", title: "THE BRACE", pfx: o.pfx, rounds: o.rounds, hide: o.hide, between: 20, rest: 60,
    list: (rx) => [
      { id: "abwheel", n: "Ab wheel rollout", l: "AB WHEEL × 8–12", s: 35 },
      { id: "pallof", n: "Pallof press", l: "PALLOF PRESS × 10 PER SIDE", s: 55 },
      { id: "drops", n: "Medicine-ball drops", l: "MEDICINE-BALL DROPS × 8", s: 35, out: "Medicine ball" },
      { id: "copen", n: "Copenhagen plank", l: "COPENHAGEN PLANK · 25 S PER SIDE", s: 55, upto: o.copen(rx) }],
    line: (rx) => " · the Copenhagen plank in " + (o.copen(rx) >= o.rounds(rx) ? "every round" : o.copen(rx) === 1 ? "the first round" : "the first " + o.copen(rx)),
    w: "Never on the ribs. The drops land on the brace just above your belly button; up a kilo when all eight land on a brace that doesn't give, from 3 kg up to 6.",
    why: o.why });
}

/* the carries: their own cards, the runs and the weight */
const FARMER = "A heavy dumbbell in each hand. Stand tall, shoulders down, and take short, quick steps for 30 metres without putting them down. Start around 30 kg a hand; add 2.5 kg a hand when every run is clean, with no stop and no lean.";
const BEARHUG = "Hug a heavy sandbag tight to your chest — or a heavy plate, or a dumbbell held upright against it. Elbows in, stand tall, walk 30 metres. Breathe short and sharp through your nose behind a braced stomach, and never let the brace go. Start with a 30–40 kg sandbag or a 20–25 kg plate; add weight when every run is clean.";
export function carryBlock(o) {
  const n = (rx) => o.runs(rx) || 0;
  const bear = o.kind === "bear";
  return { L: o.L, n: bear ? "Bear-Hug Carry" : "Farmer's Carry", m: (rx) => (n(rx) >= 3 ? 4 : 3), rest: "Rest 60 s", rt: 60,
    hide: (rx) => !n(rx) || (o.hide ? !!o.hide(rx) : false),
    rxLine: (rx) => n(rx) + " × 30 m · rest 60 s",
    items: (rx) => [{ n: bear ? "Bear-hug carry" : "Farmer's carry", s: n(rx) + " × 30 m", cue: bear ? BEARHUG : FARMER, id: o.pfx + (bear ? "_bearhug" : "_farmer"), k: "wr", sets: n(rx), reps: "30 m" }],
    w: bear ? "Never let the brace go." : "No stop and no lean.",
    why: o.why };
}
