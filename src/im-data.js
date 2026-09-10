import { C } from "./ui.jsx";

/* ================================================================
   IRON MIND v4.2 — the program, as data.
   Every instruction string on this page is the document's own
   wording. Nothing here is paraphrased; where the document gives a
   duration, that duration is the one the timer runs.
   ================================================================ */

export const IM_KEYS = {
  day: "o8s-imday",     /* { "2026-09-10": { ticks: {...}, floor: 1 } }         */
  sit: "o8s-imsit",     /* [ { d, stage, mins, cycles, best, drifts, segs } ]   */
  hard: "o8s-imhard",   /* [ { d, wk, test, mind, body, gap, honest, note } ]   */
  wk: "o8s-imwk",       /* { "2026-09-07": { bolt } }  keyed by that Monday     */
};

export const SAFETY = "Safety, at every stage. Breath holds and any fast breathing: seated or lying, never in or near water, never driving, never standing. Never holds and cold together. If anything tips toward panic: stop, sigh, session over — that's the tool used correctly, not a failure. Forceful techniques carry real contraindications — high blood pressure, heart conditions, epilepsy, recent abdominal surgery, severe asthma; if any ever apply, those techniques are out and the rest still works.";

export const CARDINAL = "CARDINAL RULE: controlled breath throughout, always. Discomfort without breath control is just suffering. Discomfort with breath control is the training.";

export const FLOOR_TEXT = "Overtime, someone ill, everything sliding — this still happens: three sighs → three minutes of box breathing → the review. A floor day counts. A skipped day doesn't. You are never training the practice; you are training the not-quitting. And never miss twice. One missed day is life. Two in a row is a decision, and you don't make that one.";

export const NEVER_TWICE = "Never miss twice. One missed day is life. Two in a row is a decision, and you don't make that one.";

/* ================================================================
   THE DAY — the slots, in the order the document runs them
   ================================================================ */
export const ONE_THING_Q = [
  "What is the one thing that, done today, makes the day a win?",
  "See it done.",
  "What's most likely to stop me?",
  "When that happens, I will…",
];

export const REVIEW_Q = [
  "Where did I go wrong today?",
  "What did I do well?",
  "What did I leave undone that I'll do tomorrow?",
];

export const SIGH_HOW = "Full breath in through the nose, a second short sip on top, one long slow exhale through the mouth, longer than the inhale. Three times. The fastest reliable way to bring the body down, and you're rehearsing the rescue tool while calm so it's automatic under stress.";

export const ONE_THING_HOW = "Sixty seconds, in your head, four questions in order. Marcus Aurelius did a version of this at dawn every day; the modern research on if-then planning shows it roughly doubles the odds a hard intention gets acted on.";

export const REVIEW_HOW = "2 minutes, spoken under your breath or in your head, never written. Facts, not adjectives; then it's over, no second pass. Seneca every night in bed; the Pythagoreans before him; the samurai's daily self-examination.";

export const SITE = [
  { id: "reset", n: "The reset", s: "At every break and before anything difficult: two sighs, then thirty seconds with your eyes on one fixed point and nothing else. Eyes steady, mind steadies — a hard-wired link, and why it works in thirty seconds." },
  { id: "onejob", n: "One job at a time", s: "Start it, stay on it, finish it, then look up. Zanshin — the remaining mind." },
  { id: "seven", n: "Seven breaths", s: "Any decision you catch yourself circling: seven slow breaths, decide, act. Not instantly — that's impulse. Not endlessly — that's the circling. The samurai's rule from the Hagakure." },
  { id: "phone", n: "The phone rule", s: "First five minutes of any break, the phone stays in the pocket." },
];

export const NOSE_ALL_DAY = "Nose breathing while you work, at whatever pace lets you.";

/* The walking practice is the site slot, and it is keyed to the breath stage. */
export const WALKING = {
  1: { n: "Walking meditation", s: "One site break a day, 3–5 minutes. Walk at half pace. Attention on the feet: the lift, the swing, the place. Lose it, return to the feet. The Zen halls walk between every sit for a reason — it's the first transfer: attention that survives movement.", tool: "walk" },
  2: { n: "Walking breath holds", s: "Nose. Exhale normally, pinch, walk 10–20 paces, release, recover through the nose for a full minute. 5–8 reps. Gentle: recovered within 2–3 breaths or it was too far." },
  3: { n: "Altitude walks", s: "2–3 times a week. Steady nasal walking; exhale, pinch, walk holding to a strong-but-not-maximal air hunger (6–7 out of 10), release, recover fully for a minute. 5 reps. Paces per hold climbing over the weeks is the number." },
  4: { n: "Breath-hold repeats under effort", s: "Once a week, replacing the altitude walk. Exhale, hold, jog or hard-walk 20–40 paces, release, full nasal recovery. 5–8 reps. Brutal, effective, only on a built base." },
};

/* ================================================================
   THE BREATH — four stages, and the presets each one unlocks
   ================================================================ */
export const BREATH_STAGE = {
  1: { n: "STAGE 1 · CALM", weeks: "WEEKS 1–4", gate: "Gate → Stage 2: BOLT 20 seconds. Nasal automatic in easy training.",
    lunch: ["box"], lunchLine: "Box breathing — lunch, 5 minutes." },
  2: { n: "STAGE 2 · TOLERATE", weeks: "WEEKS 5–12", gate: "Gate → Stage 3: BOLT 25s+. Breathe Light clean for 10 minutes. No panic response to mild air hunger.",
    lunch: ["light", "co2"], lunchLine: "Breathe Light — lunch, 10 minutes, daily; a second round in the evening when you can. The CO2 table twice a week, Sunday afternoon and Thursday lunch." },
  3: { n: "STAGE 3 · CONTROL", weeks: "WEEKS 13–24", gate: "Gate → Stage 4: BOLT 35s+. Sensation exposure at 60 seconds producing boredom. Stage 3 stable for eight-plus weeks.",
    lunch: ["sensation", "light", "kumbhaka", "hum", "o2"], lunchLine: "Stage 3's tools, each on the schedule the document gives it. Sensation exposure is the bridge to Stage 4 — twice a week, seated, calm day, nothing stressful ahead." },
  4: { n: "STAGE 4 · POWER", weeks: "WEEK 25 ONWARD", gate: "The ceiling. The heavy tools, used sparingly — on the base the slow work built.",
    lunch: ["wimhof", "light", "kumbhaka", "hum"], lunchLine: "The heavy tools, used sparingly. Every one of them is a stimulant. Always finish with five minutes of Breathe Light." },
};

/* kind: "in" | "hold" | "out" | "empty" | "free" | "count" | "stop"          */
/* Presets that need a number the user owns declare `needs`.                  */
export const PRESETS = [
  { id: "sigh3", st: 1, n: "Physiological sigh ×3", tag: "THE RESCUE TOOL", mins: "~30 sec", c: C.moss,
    how: "Two inhales through the nose — a full one, a short top-up — one long exhale through the mouth. One to three brings you down in about eight seconds. On waking, on every reset, between rounds, and the moment anything tips toward panic.",
    build: () => rep(3, [p("in", "FULL BREATH IN — NOSE", 3), p("in", "SHORT SIP ON TOP", 1), p("out", "LONG SLOW EXHALE — MOUTH", 6)]) },
  { id: "sigh5", st: 1, n: "Cyclic sighing · 5 minutes", tag: "THE BEST-EVIDENCED FIVE MINUTES", mins: "5 min", c: C.moss,
    how: "In a head-to-head trial, five minutes a day of these on repeat beat box breathing and meditation for mood and resting breathing rate over a month — so on any day you want more calm than the routine gives, five minutes of continuous sighing is the best-evidenced five minutes there is.",
    build: () => rep(30, [p("in", "FULL BREATH IN — NOSE", 3), p("in", "SHORT SIP ON TOP", 1), p("out", "LONG SLOW EXHALE — MOUTH", 6)]) },
  { id: "box", st: 1, n: "Box breathing", tag: "LUNCH · 5 MINUTES", mins: "5 or 10 min", c: C.cobalt,
    how: "In through the nose 4 → hold 4 → out 4 → hold empty 4. If 4 strains, 3. The one the SEALs are taught because it works sitting in anything.",
    opts: [{ k: "count", n: "Count", vals: [3, 4, 5], def: 4, unit: "s" }, { k: "mins", n: "Length", vals: [5, 10], def: 5, unit: " min" }],
    build: (o) => { const c = o.count || 4, m = o.mins || 5; return rep(Math.round(m * 60 / (c * 4)), [p("in", "IN — NOSE", c), p("hold", "HOLD", c), p("out", "OUT", c), p("empty", "HOLD EMPTY", c)]); } },
  { id: "coherent", st: 1, n: "Coherent breathing", tag: "ANY EVENING · BEFORE BED IF SLEEP IS POOR", mins: "5 or 10 min", c: C.cobalt,
    how: "In 4, out 6, nose only — about six breaths a minute, the rate at which heart rhythm and breath lock together and the calming branch runs strongest.",
    opts: [{ k: "mins", n: "Length", vals: [5, 10], def: 5, unit: " min" }],
    build: (o) => rep(Math.round((o.mins || 5) * 60 / 10), [p("in", "IN — NOSE · 4", 4), p("out", "OUT — NOSE · 6", 6)]) },
  { id: "light", st: 2, n: "Breathe Light", tag: "LUNCH · 10 MINUTES · DAILY", mins: "10 min", c: C.brass,
    how: "Sit upright. Nose only. Breathe deliberately lighter and quieter than you want to — slightly less air than feels comfortable — until there's a mild, tolerable air hunger you could hold for minutes without the shoulders lifting or the breath going ragged. Gasping or chaotic means too light; ease off. This resets the CO2 alarm and moves your BOLT more than everything else combined. It is gentle on purpose.",
    opts: [{ k: "mins", n: "Length", vals: [5, 10], def: 10, unit: " min" }],
    build: (o) => Array.from({ length: o.mins || 10 }, (_, i) => p("free", "LIGHTER, QUIETER · MINUTE " + (i + 1), 60)) },
  { id: "altnostril", st: 2, n: "Alternate-nostril breathing", tag: "THREE EVENINGS A WEEK · NO HOLDS YET", mins: "5 min", c: C.violet,
    how: "Thumb closes the right nostril, in through the left for 4; close the left with the ring finger, out through the right for 6; in through the right 4; close, out through the left 6. That's one round. Slow, quiet, even. It's the classical settling breath before meditation, and it gives the counting mind something to do.",
    build: () => rep(15, [p("in", "IN — LEFT · 4", 4), p("out", "OUT — RIGHT · 6", 6), p("in", "IN — RIGHT · 4", 4), p("out", "OUT — LEFT · 6", 6)]) },
  { id: "co2", st: 2, n: "The CO2 table", tag: "TWICE A WEEK · SUNDAY AFTERNOON AND THURSDAY LUNCH", mins: "~18 min", c: C.oxide,
    needs: "hold", needsLabel: "Your comfortable max hold (seconds)",
    how: "Seated, dry, never after cardio, nose-only rests, no big breathing between rounds — that defeats the point. Set the hold at 50% of your comfortable max. Eight rounds; the hold never changes, the rest shrinks: 2:00 → 1:45 → 1:30 → 1:15 → 1:00 → 0:45 → 0:30 → 0:15. By round six it's unpleasant. That unpleasantness is CO2 accumulating, and tolerating it calmly is the training.",
    build: (o) => { const h = Math.max(5, Math.round((o.hold || 60) * 0.5)); const rests = [120, 105, 90, 75, 60, 45, 30, 15]; const out = [];
      rests.forEach((r, i) => { out.push(p("hold", "ROUND " + (i + 1) + " · HOLD " + h + "s", h)); out.push(p("free", "REST — NOSE ONLY, NO BIG BREATHING", r)); }); return out; } },
  { id: "kumbhaka", st: 3, n: "The classical ratio · kumbhaka", tag: "THREE EVENINGS A WEEK", mins: "5–10 min", c: C.violet,
    how: "In 4 · hold 8 · out 8, nose only, built slowly toward in 4 · hold 16 · out 8 over months. This is kumbhaka — the held breath the yogis built their whole system on. Any gasping on the exit means the ratio is too aggressive; drop back.",
    opts: [{ k: "hold", n: "Hold", vals: [8, 10, 12, 14, 16], def: 8, unit: "s" }, { k: "mins", n: "Length", vals: [5, 10], def: 5, unit: " min" }],
    build: (o) => { const h = o.hold || 8, cyc = 4 + h + 8; return rep(Math.round((o.mins || 5) * 60 / cyc), [p("in", "IN · 4", 4), p("hold", "HOLD · " + h, h), p("out", "OUT · 8", 8)]); } },
  { id: "hum", st: 3, n: "Humming breath · bhramari", tag: "ANY EVENING · THE BEST PRE-SLEEP BREATH THERE IS", mins: "2–3 min", c: C.violet,
    how: "In through the nose, then a long, low hum on the exhale with the mouth closed, until the breath runs out. Ten to fifteen rounds. It lengthens the exhale automatically, the vibration settles the nervous system, and the hum raises nitric oxide in the nasal passages.",
    build: () => rep(12, [p("in", "IN — NOSE", 4), p("out", "LONG LOW HUM — MOUTH CLOSED", 9)]) },
  { id: "o2", st: 3, n: "The O2 table", tag: "ONCE A WEEK · SATURDAY LATE AFTERNOON", mins: "~22 min", c: C.oxide,
    needs: "hold", needsLabel: "Your max hold (seconds)",
    how: "Four-plus hours after the session, never the same day as a CO2 table. Rest stays fixed at 2:00, the hold grows: rounds 1–8 at 50 → 55 → 60 → 65 → 70 → 75 → 80 → 85% of your max. Seated, dry. Tingling hands or lips, or any change in vision — stop the table entirely. That's a signal, not a badge.",
    build: (o) => { const m = o.hold || 60; const pcts = [50, 55, 60, 65, 70, 75, 80, 85]; const out = [];
      pcts.forEach((pc, i) => { out.push(p("free", "REST 2:00 — ROUND " + (i + 1) + " NEXT", 120)); out.push(p("hold", "HOLD · " + pc + "% · " + Math.max(5, Math.round(m * pc / 100)) + "s", Math.max(5, Math.round(m * pc / 100)))); }); return out; } },
  { id: "sensation", st: 3, n: "Sensation exposure", tag: "★ THE BRIDGE TO STAGE 4 · TWICE A WEEK", mins: "~6 min", c: C.oxide,
    how: "Seated, calm day, nothing stressful ahead. Thirty seconds of deliberate fast, deep breathing through the mouth — then stop, two sighs, and five minutes of Breathe Light. That's the whole thing. It will produce tingling, lightness, a quick heart, a tight chest — the sensations the alarm is tuned to. You are teaching the alarm, in thirty controlled seconds at a time, that these sensations are safe and boring. This is the same method panic clinics use, because it's the one that works: not avoiding the sensations, and not being ambushed by them — meeting them on purpose, small, with the brakes in your hand. Progress 30 → 45 → 60 seconds over eight weeks. The gate to Stage 4 is boredom: when sixty seconds produces sensation and nothing else — no urge to stop, no story — the heavy tools are yours.",
    opts: [{ k: "fast", n: "Fast breathing", vals: [30, 45, 60], def: 30, unit: "s" }],
    build: (o) => [p("free", "FAST, DEEP BREATHING — MOUTH", o.fast || 30)]
      .concat(rep(2, [p("in", "FULL BREATH IN — NOSE", 3), p("in", "SHORT SIP ON TOP", 1), p("out", "LONG SLOW EXHALE — MOUTH", 6)]))
      .concat(Array.from({ length: 5 }, (_, i) => p("free", "BREATHE LIGHT · MINUTE " + (i + 1), 60))) },
  { id: "wimhof", st: 4, n: "Wim Hof rounds", tag: "UP TO 3× A WEEK · NEVER TWO DAYS RUNNING", mins: "~15 min", c: C.oxide, custom: "wimhof",
    how: "Seated or lying, calm day. Entry protocol: 20 full breaths — deep in through the nose or mouth, let the exhale fall out — then after the last, exhale and hold empty as long as comfortable; one full breath in, hold 15 seconds, release. That's a round. Two rounds to start. Build to 30–40 breaths and three rounds only if it lands as alert-calm, never agitated. Always finish with five minutes of Breathe Light to re-sensitise; skip that and you've hyperventilated twice a day and called it training. Never before water, never before driving, never standing." },
  { id: "recovery", st: 0, n: "Round-recovery breathing", tag: "EVERY REST IN THE FIGHT SIM · GUIDED 60 SEC", mins: "60 sec", c: C.brass,
    how: "Two physiological sighs the second the round ends, then nose only, in for 3 and out for 6, for the rest of the break. Stand up, hands off the knees. Hands-on-knees gasping through an open mouth keeps you revved and starts the next round behind; this is the one purely mental minute a fight gives you, and this is where it's practised.",
    build: () => [p("free", "STAND UP · HANDS OFF THE KNEES", 4)]
      .concat(rep(2, [p("in", "FULL BREATH IN — NOSE", 3), p("in", "SHORT SIP ON TOP", 1), p("out", "LONG SLOW EXHALE — MOUTH", 6)]))
      .concat(rep(4, [p("in", "IN — NOSE · 3", 3), p("out", "OUT — NOSE · 6", 6)])) },
  { id: "settle", st: 0, n: "The 60-second settle", tag: "AFTER THE LAST INTERVAL · TUESDAY AND THURSDAY", mins: "60 sec", c: C.brass, custom: "settle",
    how: "Stay on the bike after the last interval. Eyes closed, heart pounding, chest heaving — find the breath at the nostrils and stay on it. Count how many seconds it takes to land there and write it down. This is the corner between rounds, trained, for nothing, every Tuesday and Thursday." },
  { id: "bolt", st: 0, n: "BOLT score", tag: "SUNDAY ON WAKING · BEFORE THE SIGHS", mins: "stopwatch", c: C.cobalt, custom: "bolt",
    how: "One normal breath in through the nose, one normal breath out, pinch the nose, time to the first definite urge to breathe — not a grit hold. Gasp on release and it didn't count." },
];

function p(k, l, s) { return { k, l, s }; }
function rep(n, cycle) { const out = []; for (let i = 0; i < n; i++) cycle.forEach((c) => out.push(Object.assign({}, c))); return out; }
export const presetById = (id) => PRESETS.find((x) => x.id === id) || null;

/* ================================================================
   MEDITATION — the path, the sit, and the eleven types
   ================================================================ */
export const MED_STAGE = {
  1: { n: "STAGE 1 · CONCENTRATION", weeks: "WEEKS 1–4", mins: 12,
    line: "Breath counting, every evening. Count each exhale silently, one to ten, then start again at one. Lose the count or catch yourself elsewhere — straight back to one, no punishment, no comment. A clean cycle is one to ten with no drift. Track clean cycles, not minutes: 3 → 5 → 10 → 20. Twenty consecutive clean cycles is properly hard and impossible to fake.",
    target: "Target: 28 days done. Three clean cycles. 12-minute sits without physical restlessness.",
    segs: () => [{ l: "COUNT THE EXHALES · ONE TO TEN", m: 12 }] },
  2: { n: "STAGE 2 · INSIGHT", weeks: "WEEKS 5–12", mins: 15, minsLate: 20,
    line: "Count, then follow. First half counting. Second half, drop the numbers and follow the breath: cool at the nostrils in, warm out, the pause at the bottom. As it settles the breath gets thinner and quieter — that's correct; don't deepen it to feel it, sharpen attention instead. Noting — the crucial skill: when something pulls you off the breath, label it silently, one word, by category — hearing · feeling · thinking · planning · remembering — and return.",
    target: "Target: 5 clean cycles. Noting automatic. 20-minute sits. The breath thinning without alarm.",
    segs: (m) => [{ l: "COUNT", m: m / 2 }, { l: "FOLLOW THE BREATH", m: m / 2 }] },
  3: { n: "STAGE 3 · OPEN", weeks: "WEEKS 13–24", mins: 20, sunday: 30,
    line: "Count, follow, open. Five minutes counting, ten following, then the anchor is dropped. Whatever arises — a sound, a thought, an itch, a mood — arrives, is seen clearly, and passes, without following it and without pushing it away. Where counting trains holding, this trains watching without grabbing. The Zen name for what it produces is mushin — no-mind: not emptiness, but a mind that doesn't stop on anything.",
    target: "Target: 10 clean cycles. 30-minute sits. Open awareness stable for the last five minutes. Switch drill at 10 seconds a station.",
    segs: (m) => [{ l: "COUNT", m: 5 }, { l: "FOLLOW", m: 10 }, { l: "OPEN — DROP THE ANCHOR", m: m - 15 }] },
  4: { n: "STAGE 4 · MASTERY", weeks: "WEEK 25 ONWARD", mins: 30, opts: [30, 45, 60],
    line: "Just sitting — shikantaza. No anchor, no technique, no count, no goal. Upright, alert, present with whatever is. It sounds like nothing; it's the hardest practice there is, because there's nothing to hold and nothing to achieve, and every trick the mind has for getting somewhere is exposed. Ten minutes at the end of the sit, growing.",
    target: "Target: 20 clean cycles · a 60-minute sit · a full day.",
    segs: (m) => [{ l: "COUNT", m: 5 }, { l: "FOLLOW", m: 10 }, { l: "OPEN", m: m - 25 }, { l: "JUST SITTING — SHIKANTAZA", m: 10 }] },
};

export const HOW_TO_SIT = "Upright, chair or cushion, hands in the lap, eyes closed or half-open on the floor a metre ahead. Back straight, not stiff. Timer set so the clock isn't a thought. Nose breathing, natural — watch it, don't drive it.";
export const THE_CATCH = "THE CATCH IS THE REP, NOT THE STILLNESS. You're doing it right every time you notice you've drifted. Drifting is the set-up; catching is the lift. Measure the catch.";

export const GOODWILL_MIN = 5;
export const DEATH_MIN = 3;
export const GOODWILL_LINE = "Goodwill, Sunday, the last five minutes of the long sit. Silently, in sequence: may I be well → someone you love → someone neutral, the man at the yard → someone difficult. It sounds soft and it is the hardest thing on this page, because it is the direct antidote to being provoked.";
export const DEATH_LINE = "SUNDAY: THREE MINUTES ON DEATH. The last three minutes of the Sunday sit. Sit with the plain fact that the days are numbered and unknown, then one question: what would I stop putting off if this were the last month? The honest answer goes in Monday's one thing. Three minutes, then open the eyes and get on with the week.";

/* The eleven types, as the document tabulates them. */
export const ELEVEN = [
  [1, "Breath counting", "Zen (susokukan)", "Concentration; the catch", 1],
  [2, "Breath following", "The Buddha's anapanasati", "Fine concentration", 1],
  [3, "Body scan", "Burmese sweeping; U Ba Khin / Goenka", "Reading the body accurately", 1],
  [4, "Walking meditation", "Zen kinhin; Theravada walking", "Attention in motion", 1],
  [5, "Noting", "Mahasi Sayadaw's method", "Seeing thoughts as events", 2],
  [6, "Goodwill (metta)", "The Buddha's first brahmavihara", "Not being provoked", 2],
  [7, "Candle gazing", "Trataka, yogic; Zen wall-gazing", "One-pointedness; the bridge to open awareness", 2],
  [8, "Rehearsal", "The samurai's mental practice; modern imagery science", "Pre-built responses", 2],
  [9, "Focus under load", "Zanshin; the warrior schools", "Transfer", 2],
  [10, "Open awareness", "Zen; Tibetan shamatha without object", "Mushin; not grabbing", 3],
  [11, "Just sitting", "Zen shikantaza (Dōgen)", "Everything, with nothing to hold", 4],
];

/* Guided timers, each locked to the stage it enters at. st 0 = any stage. */
export const GUIDED = [
  { id: "bodyscan", st: 1, n: "Body scan", tag: "TWICE A WEEK · IN PLACE OF THE COUNT · LYING DOWN", c: C.cobalt,
    how: "Attention travels foot to head, 10–15 seconds per area — sole, ankle, shin, knee — noticing whatever is there, warmth, pressure, nothing, without changing anything. This is how you learn to read your body accurately, which is the exact skill that stops arousal being misread as threat.",
    steps: ["SOLE", "ANKLE", "SHIN", "KNEE", "THIGH", "HIP", "LOWER BACK", "BELLY", "CHEST", "UPPER BACK", "SHOULDERS", "UPPER ARM", "FOREARM", "HAND", "NECK", "JAW", "FACE", "SCALP"].map((l) => ({ l, s: 15 })) },
  { id: "walk", st: 1, n: "Walking meditation", tag: "ONE SITE BREAK A DAY · 3–5 MINUTES", c: C.moss,
    how: "Walk at half pace. Attention on the feet: the lift, the swing, the place. Lose it, return to the feet. The Zen halls walk between every sit for a reason — it's the first transfer: attention that survives movement.",
    steps: [{ l: "HALF PACE — THE LIFT, THE SWING, THE PLACE", s: 60 }, { l: "LOSE IT, RETURN TO THE FEET", s: 60 }, { l: "THE LIFT, THE SWING, THE PLACE", s: 60 }, { l: "STAY WITH THE FEET", s: 60 }, { l: "LAST MINUTE", s: 60 }] },
  { id: "candle", st: 2, n: "Candle gazing", tag: "TWICE A WEEK · 5 MINUTES BEFORE THE SIT", c: C.brass,
    how: "Dim room, candle at arm's length, eye level. Gaze without blinking as long as comfortable — 30–60 seconds to start — then close the eyes and hold the after-image until it fades, then keep the eyes closed and hold the empty dark for thirty seconds more. That last phase is the bridge from concentration to open awareness. 3–5 rounds. Watery eyes are normal; strain isn't. Skip with any eye condition.",
    rounds: 4, steps: [{ l: "GAZE — NO BLINKING", s: 45 }, { l: "EYES CLOSED — HOLD THE AFTER-IMAGE", s: 30 }, { l: "EYES CLOSED — THE EMPTY DARK", s: 30 }] },
  { id: "goodwill", st: 2, n: "Goodwill · metta", tag: "SUNDAY · THE LAST FIVE MINUTES OF THE LONG SIT", c: C.violet,
    how: "Silently, in sequence. It sounds soft and it is the hardest thing on this page, because it is the direct antidote to being provoked. The test isn't a feeling. Did anything move you this week, and did you notice before or after you reacted? That's fudōshin — the immovable mind — measured honestly.",
    steps: [{ l: "MAY I BE WELL", s: 75 }, { l: "SOMEONE YOU LOVE", s: 75 }, { l: "SOMEONE NEUTRAL — THE MAN AT THE YARD", s: 75 }, { l: "SOMEONE DIFFICULT", s: 75 }] },
  { id: "rehearsal", st: 2, n: "Rehearsal", tag: "ONCE A WEEK · REAL TIME", c: C.brass,
    how: "Pick one specific hard thing coming this week — a round, a max, a conversation — and run it through your own eyes, in real time (a round takes three minutes to rehearse, not twenty seconds), with the nerves included. Then the adversity run: the moment it goes wrong — gassing mid-round, caught clean, the mind saying quit — watched, and answered with control. You're pre-building the response so the ambush has already been met.",
    steps: [{ l: "THE THING, REAL TIME, YOUR OWN EYES", s: 180 }, { l: "NERVES INCLUDED", s: 60 }, { l: "THE ADVERSITY RUN — IT GOES WRONG", s: 120 }, { l: "ANSWERED WITH CONTROL", s: 60 }],
    extra: { n: "THE PRE-FIGHT 90 SECONDS", s: "In the car before any sparring: two sighs; one line, second person, your own name — \"You've done harder. Sharp and relaxed.\"; the single concrete thing you'll do when the first bell goes. Then in.",
      steps: [{ l: "TWO SIGHS", s: 20 }, { l: "\"YOU'VE DONE HARDER. SHARP AND RELAXED.\"", s: 35 }, { l: "THE ONE CONCRETE THING AT THE FIRST BELL", s: 35 }] } },
  { id: "switch", st: 3, n: "The four-station switch drill", tag: "5 MINUTES · THREE TIMES A WEEK · BEFORE THE SIT", c: C.cobalt,
    how: "Attention has width (broad or narrow) and direction (outward or inward) — four states — and mastery is switching cleanly on demand, not holding one. Stuck narrow-outward: fixating on the shot that landed and eating the one behind it. Stuck broad-inward: analysing mid-round. Stuck narrow-inward: every twinge enormous — the panic state, the aperture jammed shut on your own body. Progress 30s → 20s → 10s per station; then run it during a wall sit; then during conditioning. THE TRAINING EFFECT IS IN THE SWITCH.",
    opts: [{ k: "secs", n: "Per station", vals: [30, 20, 10], def: 30, unit: "s" }], rounds: 3,
    stations: ["THE WHOLE ROOM AT ONCE — SOFT EYES", "ONE MARK ON THE WALL — NOTHING ELSE EXISTS", "THE WHOLE BODY AS ONE SENSATION", "THE AIR AT THE NOSTRILS ONLY"] },
  { id: "moving", st: 3, n: "Moving focus — zanshin proper", tag: "TEN MINUTES · ONCE A WEEK", c: C.moss,
    how: "Slow-motion shadow boxing, ten minutes, once a week, where the target isn't the movement but the state: total presence, nothing left over for stray thought, awareness continuing after each action finishes. Your coach owns boxing; this is your mind, using your body as the object.",
    steps: Array.from({ length: 10 }, (_, i) => ({ l: "SLOW MOTION · TOTAL PRESENCE · MINUTE " + (i + 1), s: 60 })) },
  { id: "justsitting", st: 4, n: "Just sitting — shikantaza", tag: "TEN MINUTES AT THE END OF THE SIT, GROWING", c: C.violet,
    how: "No anchor, no technique, no count, no goal. Upright, alert, present with whatever is. It sounds like nothing; it's the hardest practice there is, because there's nothing to hold and nothing to achieve, and every trick the mind has for getting somewhere is exposed.",
    opts: [{ k: "mins", n: "Length", vals: [10, 20, 30], def: 10, unit: " min" }],
    stepsFrom: (o) => Array.from({ length: o.mins || 10 }, (_, i) => ({ l: "JUST SITTING · MINUTE " + (i + 1), s: 60 })) },
  { id: "nidra", st: 0, n: "Yoga Nidra", tag: "RECOVERY, ANY STAGE · WHEN YOU NEED RESETTING", c: C.violet,
    how: "20–45 minutes lying down when you need resetting.",
    steps: [{ l: "SETTLE", s: 120 }, { l: "ONE SHORT PRESENT-TENSE INTENTION, AS IF ALREADY TRUE", s: 60 },
      { l: "RAPID ROTATION AROUND THE BODY — NAME EACH PART, 1–2s, TOO FAST TO DWELL", s: 300 },
      { l: "COUNT BREATHS BACKWARD FROM 27 — PICK UP WHEREVER YOU LAND", s: 300 },
      { l: "PAIRS OF OPPOSITES — HEAVY THEN LIGHT, WARM THEN COOL", s: 180 },
      { l: "A FEW RAPID IMAGES, NO STORY", s: 120 },
      { l: "RETURN TO THE INTENTION WITH MORE CONVICTION", s: 60 }, { l: "COME BACK SLOWLY", s: 60 }] },
  { id: "death", st: 0, n: "Death recollection", tag: "SUNDAY · THREE MINUTES", c: C.oxide,
    how: DEATH_LINE,
    steps: [{ l: "THE DAYS ARE NUMBERED AND UNKNOWN", s: 120 }, { l: "WHAT WOULD I STOP PUTTING OFF IF THIS WERE THE LAST MONTH?", s: 60 }] },
];
export const guidedById = (id) => GUIDED.find((x) => x.id === id) || null;

/* ================================================================
   HARDSHIP — the ladder, the tests, the collision rules
   ================================================================ */
export const LADDER = {
  1: { n: "LEVEL 1", weeks: "WEEKS 1–8", freq: "3 sessions a week", c: C.moss,
    cold: "Cold: 30–60 seconds at the end of the after-work shower, three weekdays. Breath long and slow on the way in; the gasp is the first arrow — one long exhale, and you stay.",
    coldSecs: [30, 45, 60], silence: 20, silenceLine: "Twenty minutes of silence a week: one session with no music — Wednesday's sled block or Sunday's throws does it.",
    items: ["One static hold to failure a week — wall sit or plank — with attention on the breath and the drift count logged.", "One hardship test a week from the rotation below."],
    gate: "Gate: eight consecutive weeks, none missed." },
  2: { n: "LEVEL 2", weeks: "WEEKS 9–16", freq: "4 sessions a week", c: C.brass,
    cold: "Cold: 2–3 minutes, four weekdays, and the water as cold as the shower goes.",
    coldSecs: [120, 150, 180], silence: 45, silenceLine: "Forty-five minutes of silence a week: two sessions with no music.",
    items: ["The hold to failure with the countback (test 3, below).", "The hungry hour: once a week, the last hour before the 5pm feed is worked through without the 3pm shake — the hunger treated as a first arrow, named, and put down. Never on a Tuesday or Friday (those feeds load the next morning's session)."],
    gate: "Gate: eight weeks · the cold no longer produces a gasp." },
  3: { n: "LEVEL 3", weeks: "WEEK 17 ONWARD", freq: "4–5 sessions a week", c: C.oxide,
    cold: "Cold: 3–5 minutes — a plunge or a cold bath if you can get one, stacked cold showers if not — with the anchor running the whole time.",
    coldSecs: [180, 240, 300], silence: 60, silenceLine: "No-music training as the default, not the exception. Sixty to ninety minutes of silence a week.",
    heat: "Heat: sauna 15–20 minutes, once or twice a week if available, breath slow and nasal, sitting still — the same practice at the other end of the thermometer. Never straight into cold from heat before a training day.",
    heatSecs: [900, 1200],
    items: ["Combined stressors: cold with the four-station drill running; the wall sit with Breathe Light."],
    gate: "Gate: twelve weeks, plus a completed Hell Week." },
};

export const CEILING = "THE CEILING — Hell Week two or three times a year (the training app's IRON switch runs it, in a week without a max or a test day), one deliberate comfort-deprivation day a quarter — no phone, no music, plain food, cold water, the floor slept on — and the solo half-day sit. Visit the ceiling. Don't live there.";

export const ARROWS = "THE FIRST ARROW AND THE SECOND — the operating teaching. When something hard hits — cold on skin, air hunger, burning quads, round five with heavy hands — two arrows land. The first is the event. The second is the reaction: get me out, I can't, how long left. The second arrow hurts more than the first, and the second one is optional. The tell: the second arrow is always a sentence. The first never is. Pure sensation has no words. The moment you find words, you've found the second arrow, and you can put it down. Run this separation silently for sixty seconds inside every hardship session. Noting on a cushion is rehearsal; noting in the cold is the performance.";

/* The five tests, rotating one a week. mind/body labels are the document's units. */
export const TESTS5 = [
  { id: "sled", n: "THE SILENT SLED", c: C.oxide, where: "Wednesday's sled block (it's written on that page), no music, counting exhales.",
    how: "Log the exhale where attention broke and the run where the legs broke. The gap between them is your Crossover gap — where your mind quits against where your body quits.",
    mind: "Exhale attention broke on", body: "Run the legs broke on", unit: "", gap: 1 },
  { id: "postmax", n: "THE POST-MAX SIT", c: C.brass, where: "Sunday, straight after the fight sim (it's on that page — three minutes there, five when it's the week's test).",
    how: "Sit, eyes closed, heart at 170-plus, chest heaving — find the breath. Log seconds to settle onto the anchor. This is the corner between rounds, trained. Nobody practises it and everybody needs it.",
    mind: "Seconds to settle onto the anchor", body: "Where the body quit (optional)", unit: "s", gap: 1, oneNumber: 1 },
  { id: "countback", n: "HELD POSITION UNDER COGNITIVE LOAD", c: C.violet, where: "Wall sit or plank to failure while counting backward from 300 in sevens.",
    how: "Log hold time and the number reached; compare with your plain hold. A 15–25% drop is normal; a smaller gap means you're dual-capable rather than needing every scrap of attention just to hang on.",
    mind: "Number reached counting back", body: "Hold time (seconds)", unit: "", gap: 1,
    third: { k: "plain", n: "Your plain hold (seconds)" } },
  { id: "nasal", n: "THE NASAL THRESHOLD", c: C.cobalt, where: "Thursday's bike, weeks 4, 9 and 14, or any Thursday you make it the week's test.",
    how: "Eight minutes nose only, raising the pace every two minutes until the mouth has to open; then the interval session runs one round short. Log the pace — and the honest half: did the mouth open because it had to, or because you caved? That answer is worth more than the number.",
    mind: "Minutes in when the mouth opened", body: "The pace it opened at", unit: "", honest: 1 },
  { id: "cold", n: "COLD WITH AN ANCHOR", c: C.cobalt, where: "Cold at your level, anchor running throughout, count the drifts.",
    how: "The cold is the first arrow; every drift you count was a sentence in your head, not a sensation on your skin.",
    mind: "Drifts counted", body: "Seconds held", unit: "", drift: 1 },
];

export const COLLISION = [
  "Optimal 8 Fighter owns your body's budget. Iron Mind attaches to what remains; its only standalone claims are seated minutes and the shower.",
  "Cold: weekdays in the after-work shower. Never within the hour before training. Weekends, not within four hours after the session — cold straight after lifting blunts the adaptation you just paid for — so Saturday and Sunday cold is evening cold. Hell Week's cold finishes are fine; there's no lifting adaptation that week to blunt.",
  "Holds and cold never together.",
  "Fasts: none in a training week beyond the hungry hour. Extended fasts happen on Hell Week day six only — never in a training week; they fight the 5pm feeds that run your weekend.",
  "Taper weeks 15–16 of the training cycle: no maximal hardship sessions. Breath, sits and the daily core continue; the tests pause.",
  "One hardship test per week. Never two.",
];

/* ================================================================
   THE GATES — what the app can measure, and what it can't
   ================================================================ */
export const GATES = {
  med: {
    1: { to: 2, lines: [["days", "28 days done", 28], ["cycles", "Three clean cycles", 3], ["sit", "12-minute sits without physical restlessness", 12]] },
    2: { to: 3, lines: [["cycles", "5 clean cycles", 5], ["self", "Noting automatic", 0], ["sit", "20-minute sits", 20], ["self", "The breath thinning without alarm", 0]] },
    3: { to: 4, lines: [["cycles", "10 clean cycles", 10], ["sit", "30-minute sits", 30], ["self", "Open awareness stable for the last five minutes", 0], ["self", "Switch drill at 10 seconds a station", 0]] },
    4: { to: null, lines: [["cycles", "20 clean cycles", 20], ["sit", "A 60-minute sit", 60], ["self", "A full day", 0]] },
  },
  breath: {
    1: { to: 2, lines: [["bolt", "BOLT 20 seconds", 20], ["self", "Nasal automatic in easy training", 0]] },
    2: { to: 3, lines: [["bolt", "BOLT 25s+", 25], ["self", "Breathe Light clean for 10 minutes", 0], ["self", "No panic response to mild air hunger", 0]] },
    3: { to: 4, lines: [["bolt", "BOLT 35s+", 35], ["self", "Sensation exposure at 60 seconds producing boredom", 0], ["self", "Stage 3 stable for eight-plus weeks", 0]] },
    4: { to: null, lines: [["self", "The ceiling. Used sparingly, on the base the slow work built.", 0]] },
  },
  hard: {
    1: { to: 2, lines: [["weeks", "Eight consecutive weeks, none missed", 8]] },
    2: { to: 3, lines: [["weeks", "Eight weeks", 8], ["self", "The cold no longer produces a gasp", 0]] },
    3: { to: null, lines: [["weeks", "Twelve weeks", 12], ["hell", "A completed Hell Week", 1]] },
  },
};

/* The three curricula, side by side — the document's progression table. */
export const PROGRESSION = [
  ["1–4", "Stage 1 · counting, body scan, walking · 12 min", "Stage 1 · calm · box, coherent, nasal, diaphragm", "Level 1 · cold 30–60s, a hold, silence, one test", "28 days done · 3 clean cycles · BOLT 20s"],
  ["5–8", "Stage 2 · count then follow, noting, goodwill, candle, rehearsal · 15 min", "Stage 2 · tolerate · Breathe Light, CO2 table, walking holds, alternate-nostril", "Level 1 continues", "Level 1 gate at week 8"],
  ["9–12", "Stage 2 · 20 min · focus under load", "Stage 2 continues", "Level 2 · cold 2–3 min, countback hold, the hungry hour", "5 clean cycles · BOLT 25s · no panic response to mild air hunger"],
  ["13–16", "Stage 3 · open awareness, switch drill, moving focus · 20 min, Sunday 30", "Stage 3 · control · kumbhaka ratio, humming, O2 table, altitude walks, sensation exposure", "Level 2 continues; taper weeks 15–16: tests pause", "Level 2 gate: no gasp"],
  ["17–24", "Stage 3 continues · access concentration may appear", "Stage 3 continues", "Level 3 · plunge, heat, combined stressors, silence 60–90", "10 clean cycles · BOLT 35s · sensation exposure = boredom · a completed Hell Week"],
  ["25+", "Stage 4 · shikantaza, 30–60 min sits, the half-day", "Stage 4 · power · Wim Hof, FRC holds, effort holds, Kapalabhati, extended kumbhaka", "The ceiling · Hell Week 2–3×/year, the deprivation day", "20 clean cycles · a 60-minute sit · a full day"],
];

/* ================================================================
   DERIVED — the day, the streak, the week
   ================================================================ */
export const dayDone = (rec) => !!(rec && (rec.floor || (rec.ticks && rec.ticks.sit && rec.ticks.review)));

export function streakTo(dayMap, isoStr, back) {
  let n = 0; const d = new Date(isoStr + "T00:00:00");
  for (let i = 0; i < (back || 500); i++) {
    const k = d.toISOString().slice(0, 10);
    if (!dayDone(dayMap[k])) break;
    n++; d.setDate(d.getDate() - 1);
  }
  return n;
}

/* The sit for a stage on a given day. Sunday always ends on three minutes of
   death recollection; from stage 2 it carries five minutes of goodwill first. */
export function sitPlan(stage, imWeek, isSunday, stage4Len) {
  const S = MED_STAGE[stage] || MED_STAGE[1];
  let base = S.mins;
  if (stage === 2 && imWeek >= 9) base = S.minsLate;
  if (stage === 3 && isSunday) base = S.sunday;
  if (stage === 4) base = stage4Len || S.mins;
  const tail = (isSunday ? (stage >= 2 ? GOODWILL_MIN : 0) + DEATH_MIN : 0);
  const core = isSunday && stage === 3 ? base - tail : base;
  const segs = S.segs(core).filter((s) => s.m > 0).map((s) => Object.assign({}, s));
  if (isSunday) {
    if (stage >= 2) segs.push({ l: "GOODWILL — MAY I BE WELL → LOVED → NEUTRAL → DIFFICULT", m: GOODWILL_MIN });
    segs.push({ l: "THREE MINUTES ON DEATH", m: DEATH_MIN });
  }
  const mins = segs.reduce((a, s) => a + s.m, 0);
  return { segs, mins };
}

export const testForWeek = (imWeek) => TESTS5[((imWeek || 1) - 1) % TESTS5.length];
