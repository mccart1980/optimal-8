import libraryMd from "../exercise-library.md?raw";

/* ================================================================
   THE EXERCISE LIBRARY

   exercise-library.md, read once into entries: { n, names, text }.
   Every card the app shows looks its row up here by name — the entry's
   own name, the names inside its brackets, the names either side of a
   slash, and the "also called" names in its text — and shows the
   entry's text under the name.

   The rows of the documents name some exercises differently from the
   library ("Rear-foot-elevated split squat", "Heavy sled sprint"), and
   a few rows are two or three library entries in one ("Hands" is the
   knuckle hold and the band wrist extension). ROW_NAMES below says
   which entry those rows are; it holds names only, never text.
   ================================================================ */

/* lower case, no punctuation, plurals folded, "the" dropped */
export function normName(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/\b(\d+)\s*s\b/g, "$1 sec")
    .replace(/[‘’'`]/g, "")
    .replace(/[^a-z0-9×/½]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w, i) => !(i === 0 && w === "the"))
    .map((w) => (w.length > 3 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w))
    .join(" ");
}

export function parseLibrary(md) {
  const out = [];
  let section = "";
  String(md || "").split(/\r?\n/).forEach((line) => {
    const h = line.match(/^##\s+(.+)$/);
    if (h) { section = h[1].trim(); return; }
    const m = line.match(/^\*\*(.+?)\*\*\s*[—-]\s*(.+)$/);
    if (!m) return;
    const n = m[1].trim(), text = m[2].trim();
    const names = [];
    n.split(/\s+\/\s+/).forEach((part) => {
      names.push(part);
      const br = part.match(/^(.*?)\s*\((.+)\)\s*$/);
      /* the bracket is another name for it, unless it only qualifies it:
         "(WARM-UP)", "(ON PARALLETTES)", "(10 SECONDS)", "(RIDE OR RUN)" */
      if (br) { names.push(br[1]); if (!/^(warm-up|on |\d+ seconds|ride or run)/i.test(br[2])) names.push(br[2]); }
    });
    const also = text.match(/also called\s+([^.]+)/i);
    if (also) also[1].split(/,\s*|\s+or\s+|\s+and\s+/).forEach((x) => names.push(x));
    out.push({ n, section, text, names: names.map((x) => x.trim()).filter(Boolean) });
  });
  return out;
}

export const LIBRARY = parseLibrary(libraryMd);
const BY_KEY = {};
LIBRARY.forEach((e) => e.names.forEach((x) => { const k = normName(x); if (k && !BY_KEY[k]) BY_KEY[k] = e; }));
export const libEntry = (name) => BY_KEY[normName(name)] || null;

/* The rows whose names differ from the library's, by the library's
   name. An array is a row that is several entries at once. */
const ROW_NAMES = {
  /* warm-ups */
  "easy bike": "EASY BIKE (WARM-UP)",
  "band pull apart": "BAND PULL-APARTS",
  "push up": "PUSH-UPS",
  "90/90 hip switch": "90/90 HIP SWITCHES",
  "90/90 switche": "90/90 HIP SWITCHES",
  "med ball chest passe": "MEDICINE-BALL CHEST PASSES",
  "medicine ball chest pass": "MEDICINE-BALL CHEST PASSES",
  "bike sprint": "BIKE SPRINTS (10 SECONDS)",
  "practice throw": ["ROTATIONAL SHOT-PUT THROW", "DOWNWARD DIAGONAL THROW", "HOOK THROW", "LANDMINE PUNCH"],
  "three easy throws of each": ["ROTATIONAL SHOT-PUT THROW", "DOWNWARD DIAGONAL THROW", "HOOK THROW", "LANDMINE PUNCH"],
  "build up 20 m": "SPRINT BUILD-UPS",
  "sprint build up": "SPRINT BUILD-UPS",
  "get up slow": "TURKISH GET-UP",
  "get up": "TURKISH GET-UP",
  "wrist": "WRIST CIRCLES",
  "warm-up": ["EASY BIKE (WARM-UP)", "BAND PULL-APARTS", "GOBLET SQUAT", "PUSH-UPS", "90/90 HIP SWITCHES", "POGO HOPS"],
  "tuesday's warm-up": ["EASY BIKE (WARM-UP)", "BAND PULL-APARTS", "GOBLET SQUAT", "PUSH-UPS", "90/90 HIP SWITCHES", "POGO HOPS"],
  "first, one minute of legs": "POGO HOPS",
  "the warm-up you rehearsed": ["EASY BIKE (WARM-UP)", "BAND PULL-APARTS", "GOBLET SQUAT", "PUSH-UPS", "90/90 HIP SWITCHES", "POGO HOPS"],
  "band pull-aparts and external rotations": ["BAND PULL-APARTS", "BAND EXTERNAL ROTATIONS"],
  "weighted chin-ups + the muscle-up line": ["WEIGHTED CHIN-UPS", "MUSCLE-UP LINE"],
  "weighted chin-up + the muscle-up line": ["WEIGHTED CHIN-UPS", "MUSCLE-UP LINE"],
  "back on the floor, feet on a bench": "BREATHE DOWN",
  "down-regulate": "BREATHE DOWN",
  "bear crawls · 2 min": "BEAR CRAWLS",
  "three physiological sighs": "PHYSIOLOGICAL SIGH",
  "shadow boxing": "ACTIVATION",
  /* power and speed */
  "countermovement jump best of three": "JUMP CHECK",
  "countermovement jump": "JUMP CHECK",
  "broad jump": "BROAD JUMPS",
  "box jump": "BOX JUMPS",
  "depth jump rebound": "DEPTH JUMPS",
  "side bound": "SIDE BOUNDS",
  "flying sprint 20 m": "FLYING SPRINTS",
  "speed flying twentie": "FLYING SPRINTS",
  "trap bar jump": "TRAP BAR JUMPS",
  "band assisted jump": "BAND-ASSISTED JUMPS",
  "heavy sled sprint 20 m": "HEAVY SLED PUSH",
  "heavy sled sprint": "HEAVY SLED PUSH",
  "heavy sled push": "HEAVY SLED PUSH",
  "repeat sled start 10 m": "REPEAT SLED STARTS",
  "drive hold": "DRIVE HOLDS",
  "punch position hold": "PUNCH-POSITION HOLD",
  "drive hold punch position hold": ["DRIVE HOLDS", "PUNCH-POSITION HOLD"],
  /* strength */
  "rear foot elevated split squat": "SPLIT SQUAT, REAR FOOT ELEVATED",
  "weighted chin up": "WEIGHTED CHIN-UPS",
  "nordic curl": "NORDIC CURLS",
  "jump circuit": "SQUAT CONTRAST CIRCUIT",
  "back squat jump circuit": "SQUAT CONTRAST CIRCUIT",
  "back squat max single": "MAX SINGLE",
  "bench max single": "MAX SINGLE",
  "bench max single pin": "MAX SINGLE",
  "trap bar heavy triple": "TRAP BAR DEADLIFT",
  "trap bar 3rm": "TRAP BAR DEADLIFT",
  "pause squat": "BACK SQUAT",
  "speed squat": "BACK SQUAT",
  "flat bench max single": "MAX SINGLE",
  "bench": "BENCH PRESS",
  "bench throw smith": "BENCH THROW",
  /* calisthenics */
  "ring row": "RING ROWS",
  "ring dip": "RING DIPS",
  "muscle up line": "MUSCLE-UP LINE",
  "pistol line": "PISTOL LINE",
  "l sit line": "L-SIT LINE",
  "handstand on parallette": "HANDSTAND (ON PARALLETTES)",
  /* trunk, tendons, hands, neck */
  "ab wheel rollout": "AB WHEEL ROLLOUTS",
  "hanging leg raise": "HANGING LEG RAISES",
  "achilles hold standing": "ACHILLES HOLD",
  "hand": ["KNUCKLE HOLD", "BAND WRIST EXTENSION"],
  "full neck block": ["NECK FOUR-DIRECTION HOLDS", "NECK RAPID TENSE", "NECK PERTURBATION HOLD"],
  "neck": ["NECK FOUR-DIRECTION HOLDS", "NECK RAPID TENSE", "NECK PERTURBATION HOLD"],
  "four direction hold": "NECK FOUR-DIRECTION HOLDS",
  "4 direction hold": "NECK FOUR-DIRECTION HOLDS",
  "rapid tense": "NECK RAPID TENSE",
  "perturbation hold": "NECK PERTURBATION HOLD",
  "face pull": "FACE PULLS",
  "suitcase carries": "SUITCASE CARRY",
  "shoulder circuit + band catch": ["SIDE-LYING EXTERNAL ROTATION", "PRONE T RAISE", "FACE PULLS", "WALL SLIDES", "BAND DECELERATION CATCH"],
  "circuit + band deceleration catch": ["SIDE-LYING EXTERNAL ROTATION", "PRONE T RAISE", "FACE PULLS", "WALL SLIDES", "BAND DECELERATION CATCH"],
  "the slow lane — one lever hold": "TUCK FRONT LEVER",
  "lever": "TUCK FRONT LEVER",
  "seated calf raise achilles hold": ["SEATED CALF RAISE", "ACHILLES HOLD"],
  /* throws */
  "rotational shot put": "ROTATIONAL SHOT-PUT THROW",
  "shot put throw": "ROTATIONAL SHOT-PUT THROW",
  "shot put": "ROTATIONAL SHOT-PUT THROW",
  "diagonal throw": "DOWNWARD DIAGONAL THROW",
  "rotational throw": "ROTATIONAL SHOT-PUT THROW",
  "med-ball hook throw": "HOOK THROW",
  "three easy throws per side": ["ROTATIONAL SHOT-PUT THROW", "DOWNWARD DIAGONAL THROW", "HOOK THROW", "LANDMINE PUNCH"],
  "three easy throws of each first": ["ROTATIONAL SHOT-PUT THROW", "DOWNWARD DIAGONAL THROW", "HOOK THROW", "LANDMINE PUNCH"],
  "four punch throw": ["ROTATIONAL SHOT-PUT THROW", "DOWNWARD DIAGONAL THROW", "HOOK THROW", "LANDMINE PUNCH"],
  "power dose throw landmine": ["ROTATIONAL SHOT-PUT THROW", "LANDMINE PUNCH"],
  "med ball slam": "MEDICINE-BALL SLAMS",
  /* size */
  "rear delt fly": "REAR-DELT FLY",
  /* conditioning */
  "base easy nose only": "EASY BASE (RIDE OR RUN)",
  "base": "EASY BASE (RIDE OR RUN)",
  "easy, nose only": "EASY BASE (RIDE OR RUN)",
  "easy flush": "EASY BASE (RIDE OR RUN)",
  "easy walk or ride": "EASY HOUR / WEDNESDAY EASY THIRTY",
  "3 × 20 m @ 90%": "FLYING SPRINTS",
  "3 × 20 m flying sprints @ 90%": "FLYING SPRINTS",
  "easy hour": "EASY HOUR / WEDNESDAY EASY THIRTY",
  "easy thirty": "EASY HOUR / WEDNESDAY EASY THIRTY",
  "wednesday easy thirty": "EASY HOUR / WEDNESDAY EASY THIRTY",
  "easy": "EASY BASE (RIDE OR RUN)",
  "40 sec repeat two block": "40-SECOND REPEATS",
  "repeat burst one set": "REPEAT BURSTS",
  "60 second settle": "THE 60-SECOND SETTLE",
  "post max sit": "THE POST-MAX SIT",
  "corner minute": "THE CORNER MINUTE",
  "round recovery breathing": "THE CORNER MINUTE",
  "6 × 3 simulation": "THE ROUNDS (6 × 3 SIMULATION)",
  "7 × 3 simulation": "THE ROUNDS (6 × 3 SIMULATION)",
  "5 × 3 simulation": "THE ROUNDS (6 × 3 SIMULATION)",
  "speed microdose": "SPEED MICRODOSE",
  /* tests */
  "20 minute test": "THE 20-MINUTE TEST",
  "20-minute bike test": "THE 20-MINUTE TEST",
  "20-min bike test": "THE 20-MINUTE TEST",
  "burst test": "BURST DECREMENT TEST",
  "mid-thigh pull peak force": "MID-THIGH PULL",
  "tape and weight": "TAPE, WEIGHT AND PHOTOS",
  "resting heart rate": "TAPE, WEIGHT AND PHOTOS",
  "burst decrement": "BURST DECREMENT TEST",
  "nasal threshold": "NASAL THRESHOLD TEST",
  "load velocity profile": "LOAD-VELOCITY PROFILE",
  "trap bar at five load": "LOAD-VELOCITY PROFILE",
  "trap bar jump at four load": "LOAD-VELOCITY PROFILE",
  "squat at five load": "LOAD-VELOCITY PROFILE",
  "bench and push press at four load": "LOAD-VELOCITY PROFILE",
  "bench throw at four load": "LOAD-VELOCITY PROFILE",
  "bolt score": "BOLT",
  "four range test": "THE FOUR RANGE TESTS",
  "range test": "THE FOUR RANGE TESTS",
  "three flexibility test": "THE THREE FLEXIBILITY TESTS",
  "flexibility test": "THE THREE FLEXIBILITY TESTS",
  "knee to wall": "THE THREE FLEXIBILITY TESTS",
  "toe touch": "THE THREE FLEXIBILITY TESTS",
  "seated rotation": "THE THREE FLEXIBILITY TESTS",
  "tape": "TAPE, WEIGHT AND PHOTOS",
  "photo": "TAPE, WEIGHT AND PHOTOS",
  "bodyweight": "TAPE, WEIGHT AND PHOTOS",
  "waist": "TAPE, WEIGHT AND PHOTOS",
  "push up test": "PUSH-UP AND CHIN-UP TESTS",
  "chin up test": "PUSH-UP AND CHIN-UP TESTS",
  "plank test": "PLANK AND COPENHAGEN TESTS",
  "copenhagen test": "PLANK AND COPENHAGEN TESTS",
  "broad jump test": "BROAD JUMP AND THROW TESTS",
  "throw test": "BROAD JUMP AND THROW TESTS",
  /* morning and evening */
  "morning five": "THE MORNING FIVE",
  "foam roller extension": "FOAM ROLLER EXTENSIONS",
  "stiffest notch": "FOAM ROLLER EXTENSIONS",
  "loaded rotation": "LOADED ROTATION (SIDE-LYING WINDMILL)",
  "90/90": "90/90 STRETCH AND INTERNAL-ROTATION LIFT",
  "internal rotation lift": "90/90 STRETCH AND INTERNAL-ROTATION LIFT",
  "deep squat hold": "DEEP SQUAT HOLD AND SQUAT-TO-STAND",
  "squat to stand": "DEEP SQUAT HOLD AND SQUAT-TO-STAND",
  "pigeon": "PIGEON STRETCH",
  "overhead squat hold with stick": "OVERHEAD SQUAT HOLD",
  "band external rotation": "BAND EXTERNAL ROTATIONS",
  "external rotation": "BAND EXTERNAL ROTATIONS",
  "hip airplane": "HIP AIRPLANES",
  "hang from bar": "HANG",
};
const ROW_KEYS = {};
Object.keys(ROW_NAMES).forEach((k) => { ROW_KEYS[normName(k)] = ROW_NAMES[k]; });

/* the ways a row's name is written beyond the exercise itself: the side,
   the reps, the level, the distance */
const TRIMS = [
  (s) => s.split(/\s+[—–]\s+/)[0],
  (s) => s.split(/\s+·\s+/)[0],
  (s) => s.split(/\s+×\s*\d/)[0],
  (s) => s.replace(/\s*\(.*?\)\s*/g, " "),
  (s) => s.replace(/\s*[—–-]\s*at your level\s*$/i, ""),
  (s) => s.replace(/\s+\d+\s*m$/i, ""),
  (s) => s.replace(/\s+test$/i, ""),
];

function candidates(name) {
  const seen = {}, out = [];
  const add = (s) => { const k = normName(s); if (k && !seen[k]) { seen[k] = 1; out.push(k); } };
  const base = String(name || "").replace(/^[★\s]+/, "").trim();
  add(base);
  let cur = [base];
  for (let pass = 0; pass < 2; pass++) {
    const next = [];
    cur.forEach((s) => TRIMS.forEach((t) => { const x = t(s).trim(); if (x && x !== s) { add(x); next.push(x); } }));
    cur = next;
  }
  return out;
}

const byName = (n) => LIBRARY.find((e) => e.n === n) || null;
const resolve = (val) => {
  const arr = (Array.isArray(val) ? val : [val]).map(byName).filter(Boolean);
  return arr.length ? arr : null;
};

/* Every entry a row is, or null. Exact names first, then the row's own
   table, then a word-for-word prefix of two words or more either way. */
export function libFor(name) {
  const cands = candidates(name);
  for (const k of cands) if (BY_KEY[k]) return [BY_KEY[k]];
  for (const k of cands) if (ROW_KEYS[k]) return resolve(ROW_KEYS[k]);
  let best = null, bestLen = 0;
  for (const k of cands) {
    const kw = k.split(" ");
    Object.keys(BY_KEY).forEach((lk) => {
      const lw = lk.split(" ");
      const short = lw.length <= kw.length ? lw : kw, long = lw.length <= kw.length ? kw : lw;
      if (short.length < 2) return;
      if (short.every((w, i) => long[i] === w) && short.length > bestLen) { best = BY_KEY[lk]; bestLen = short.length; }
    });
    if (best) return [best];
  }
  return null;
}

/* the entry's text, joined, for a card */
export const libText = (name) => { const e = libFor(name); return e ? e.map((x) => x.text) : null; };
