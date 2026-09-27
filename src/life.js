import { iso, mondayOf, parseISO, addDays, fmtDate } from "./ui.jsx";

/* ================================================================
   IRON MIND v5 — THE SEASON, THE LIFE PILLAR, THE NIGHT

   Every instruction string on this page is the document's own
   wording. The season is twenty-four dated weeks ending on the
   fight: week 24 is the fight's own week, so week 1 is twenty-three
   weeks before it — Monday 28 September for a fight on Saturday
   13 March. With no fight date the season counts from the Iron Mind
   start in settings, exactly as it did.
   ================================================================ */

export const SEASON_WEEKS = 24;
const DAY = 86400000;

/* the Monday the season's week 1 falls on */
export function imSeasonStart(st) {
  if (st && st.fightDate) return addDays(iso(mondayOf(parseISO(st.fightDate))), -7 * (SEASON_WEEKS - 1));
  return iso(mondayOf(parseISO((st && (st.imStart || st.start)) || iso(new Date()))));
}

/* the season week a date falls in — counted in days, so a clock change
   in between never moves it */
export function imWeekOn(st, isoDay) {
  const a = mondayOf(parseISO(imSeasonStart(st))), b = mondayOf(parseISO(isoDay));
  return Math.max(1, Math.round((b - a) / DAY / 7) + 1);
}

/* the Monday and the Sunday of a season week */
export const seasonMonday = (st, w) => addDays(imSeasonStart(st), 7 * (w - 1));
export const seasonSunday = (st, w) => addDays(seasonMonday(st, w), 6);

/* The fight-week mind: weeks 23 and 24, up to and including the fight. */
export function fightWeekOn(st, isoDay) {
  if (!st || !st.fightDate || isoDay > st.fightDate) return 0;
  const w = imWeekOn(st, isoDay);
  return w === 23 || w === 24 ? w : 0;
}
/* the morning after the fight — the sit at 12 minutes and the extra question */
export const morningAfter = (st, isoDay) => !!(st && st.fightDate && isoDay === addDays(st.fightDate, 1));
export const afterFight = (st, isoDay) => !!(st && st.fightDate && isoDay > st.fightDate);

/* ================================================================
   THE SEASON TABLE — the stages each row expects, and the dates
   ================================================================ */
/* the Sundays the Season table names for the monthly audit, and the
   half-day sit */
export const AUDIT_WEEKS = [4, 8, 12, 17, 21];
export const AUDIT_NAMES = ["First", "Second", "Third", "Fourth", "Fifth"];
export const HALF_DAY_WEEK = 13;

const sunOf = (st, w) => fmtDate(seasonSunday(st, w));
const auditLine = (st, i) => AUDIT_NAMES[i] + " audit, Sunday " + sunOf(st, AUDIT_WEEKS[i]);

export const SEASON_ROWS = [
  { from: 1, to: 4, med: 1, breath: 1, hard: 1,
    meditation: "Stage 1 · counting, body scan, walking · 12 min", breathL: "Stage 1 · calm",
    hardship: "Level 1 · cold 30–60 s, a hold, silence, one test",
    life: () => "The rules begin · life test weekly · the Sunday life review", training: "Prep, build" },
  { from: 5, to: 8, med: 2, breath: 2, hard: 1,
    meditation: "Stage 2 · count then follow, noting, goodwill, candle, rehearsal · 15 min", breathL: "Stage 2 · tolerate",
    hardship: "Level 1 → gate at week 8",
    life: (st) => auditLine(st, 0), training: "Prep, heavy" },
  { from: 9, to: 12, med: 2, breath: 2, hard: 2,
    meditation: "Stage 2 · 20 min · focus under load", breathL: "Stage 2",
    hardship: "Level 2 · cold 2–3 min, the countback hold, the hungry hour",
    life: (st) => auditLine(st, 1), training: "Prep, heavy into fast" },
  { from: 13, to: 14, med: 3, breath: 3, hard: 2,
    meditation: (st) => "Stage 3 begins · open awareness, the switch drill · 20 min, 30 Sunday · the half-day sit, Sunday " + sunOf(st, HALF_DAY_WEEK),
    breathL: "Stage 3 · control", hardship: "Level 2 · tests pause in test week",
    life: (st) => auditLine(st, 2), training: "Prep, test week" },
  { from: 15, to: 19, med: 3, breath: 3, hard: 3,
    meditation: "Stage 3 · moving focus · 20 min", breathL: "Stage 3 · sensation exposure",
    hardship: "Level 3 · plunge, heat, combined stressors",
    life: (st) => auditLine(st, 3), training: "Camp, foundation and build" },
  { from: 20, to: 22, med: 3, breath: 3, hard: 3,
    meditation: "Stage 3 · access concentration may appear", breathL: "Stage 3",
    hardship: "Level 3 · the tests ride the rounds",
    life: (st) => auditLine(st, 4), training: "Camp, peak" },
  { from: 23, to: 23, med: 3, breath: 3, hard: 3, fightWeek: 1,
    meditation: "20 min, nothing new · rehearsal daily", breathL: "Stage 3, calm tools only",
    hardship: "Tests pause · cold and heat stop",
    life: () => "The fight-week mind (its own page)", training: "Camp, sharpen" },
  { from: 24, to: 24, med: 3, breath: 3, hard: 3, fightWeek: 1,
    meditation: "12 min · the corner minute · the pre-fight 90 seconds", breathL: "The sigh and the long exhale only",
    hardship: "Nothing", life: () => "Fight week",
    training: (st) => st.fightDate ? "FIGHT " + fmtDate(st.fightDate) : "FIGHT Saturday" },
  { from: 25, to: null, med: 4, breath: 4, hard: 3, after: 1,
    meditation: "Stage 4 · just sitting, long sits, the full day", breathL: "Stage 4 · the heavy tools, earned",
    hardship: "The ceiling · the deprivation day",
    life: () => "The post-fight review, then the year", training: "Transition, then Prep" },
];
export const cell = (x, st) => (typeof x === "function" ? x(st) : x);
export const seasonRowFor = (w) => SEASON_ROWS.find((r) => w >= r.from && (r.to == null || w <= r.to)) || SEASON_ROWS[SEASON_ROWS.length - 1];

/* the dates a row covers: week 24 ends on the fight, and the row after it
   starts the Monday after */
export function seasonRowDates(st, r) {
  const from = r.after && st.fightDate ? addDays(st.fightDate, 2) : seasonMonday(st, r.from);
  if (r.to == null) return "from " + fmtDate(from);
  const to = r.to === SEASON_WEEKS && st.fightDate ? st.fightDate : seasonSunday(st, r.to);
  return fmtDate(from) + " – " + fmtDate(to);
}

export const SEASON_GATED = "The stages are gated, not dated: the dates say when you'd expect to arrive if the work is done; the gates say whether you did. Clear them honestly. The program only fails if you lie to yourself about where you are.";

/* ================================================================
   THE LIFE PILLAR
   ================================================================ */
export const LIFE_INTRO = "The other three curricula build a mind that can hold, watch and stay level. This one points it at your life. It has four parts: the rules you live by, the test you set yourself each week, the review that keeps you honest each Sunday, and the audit that keeps you aimed each month.";

export const RULES = [
  { n: "Decide in seven breaths.", s: "Any decision you catch yourself circling: seven slow breaths, decide, act. Not instantly — that's impulse. Not endlessly — that's the circling you're here to stop." },
  { n: "The hard thing first.", s: "Whatever you'd put off — the conversation, the phone call, the job at work everyone's avoiding — it goes first. Before the easy things, before you're ready. Readiness is a feeling and feelings follow action, not the other way round." },
  { n: "Keep your word, including to yourself.", s: "Makoto. The sit at half eight is a promise; so is the feed you said you'd eat. A man who breaks small promises to himself has no standing to make big ones to anyone else." },
  { n: "Say less.", s: "Speak when it improves the silence. The Spartans made a virtue of it; the research on self-regulation says the same — the man who reacts in words has already lost the half-second the sit trains." },
  { n: "No complaint.", s: "Not out loud, not in your head past the first arrow. The Stoic rule: the thing is the thing; the sentence about it is yours to put down. Complaining is the second arrow with an audience." },
  { n: "Control what's yours, drop what isn't.", s: "Your attention, your judgements, your actions. Not other people, the weather, the past, the outcome. Every hour spent on the second column is stolen from the first." },
  { n: "The phone is a tool, not a place.", s: "First five minutes of every break in the pocket; nothing in bed; nothing at the table with your family." },
];

export const LIFE_TEST_INTRO = "The hardship tests train the body to stay level under load. These train the man to act under the discomfort that actually stops him — awkwardness, avoidance, the fear of a conversation. One a week, done, ticked. Score it 1–10 for how much it cost you, so you can see it get cheaper.";

export const LIFE_TESTS = [
  { id: "avoided", n: "The avoided thing", s: "The one job, call or conversation you've been putting off longest. Done by Wednesday." },
  { id: "nocomplaint", n: "The no-complaint day", s: "Twenty-four hours without a single complaint, out loud or in your head that you let run. Every one you catch counts as a rep, not a failure." },
  { id: "phonefree", n: "The phone-free evening", s: "From the moment you're home to bed, the phone in a drawer. RANGE, the sit, your family, a book." },
  { id: "silence", n: "The hour of silence", s: "A solo walk, an hour, no music, no phone, no company. Nothing to do but notice." },
  { id: "refusal", n: "The refusal", s: "Say no to one thing you'd normally say yes to out of habit or to avoid the awkwardness. Politely, once, without explaining." },
  { id: "truth", n: "The hard truth", s: "Say one true thing you've been not saying — to yourself in the review, or to someone it concerns. Makoto." },
  { id: "coldcall", n: "The cold call", s: "Ask for something you want and expect to be refused — a favour, a rate, a course, a chance. The point is the asking." },
];
export const LIFE_TEST_ROTATE = "Rotate through all seven, then start again. Once a quarter, the ceiling: the comfort-deprivation day from the Hardship page, and a night on the floor.";
export const lifeTestForWeek = (w) => LIFE_TESTS[((w || 1) - 1) % LIFE_TESTS.length];

export const LIFE_REVIEW_Q = [
  "What did I control this week, and what did I try to control that wasn't mine?",
  "What did I avoid?",
  "What moved me, and how fast did I notice?",
  "What's the hard thing for next week?",
];
export const LIFE_NUMBERS = [
  { k: "control", n: "The control score, 1–10", s: "How much of this week did you spend on the first column — your attention, your judgements, your actions — and how much on the second? One number, honest." },
  { k: "react", n: "The reactivity count", s: "How many times this week were you moved — provoked, wound up, dragged into a reaction — before you noticed? Count them. The number should fall over months; when it does, that's fudōshin measured." },
  { k: "onething", n: "The one-thing rate", s: "Of seven mornings, how many days did the one thing get done? Sevens are the target; fives are the truth at first." },
];

export const AUDIT_Q = [
  "What did I say I'd do this month, and did I?",
  "Where's my life going that I'd choose, and where's it going that I wouldn't?",
  "What's the one thing this month that, done, would matter in a year?",
];
export const AUDIT_HOW = "Once a month, after the life review, three questions with the honesty the review demands. The answer to the last becomes the month's one thing — the thing the mornings serve. Career, family, money, the body, the mind: whichever it is, it's named, and the next four Sundays check it.";

export const LIFE_BUILDS = "Resilience isn't toughness; it's the speed of the recovery — the same thing the fade measures on the erg, measured on your life. Strength of character is keeping your word when it costs. Control is spending yourself on what's yours. The sit trains the half-second; the rules decide what you do with it; the tests prove you can; the review and the audit show the trend. Six months from now the numbers on the Sunday page will tell you whether you're a different man, and they won't be able to lie.";

/* ================================================================
   THE NIGHT — THE SLEEP PROTOCOL
   ================================================================ */
export const NIGHT_INTRO = "Sleep is the practice under every practice: it's where the sit's changes are consolidated, where the body repairs what the day loaded, and the single biggest lever on the numbers the strap reads in the morning. On a 3:30 alarm it's also the scarcest thing you own, so it gets a protocol, not a hope.";
export const NIGHT_RULES = [
  { n: "Lights out by half past eight, Sunday to Wednesday.", s: "Thursday and Friday can slip to nine; Saturday and Sunday nights aim for eight and a half hours. Seven hours is the floor; eight is the target; the weekly average is on the check." },
  { n: "The last hour is the same every night.", s: "RANGE, the skill block, the sit, the review — the sequence itself is the wind-down; the sit is the switch from the day's nervous system to the night's. Casein, water only after eight." },
  { n: "Screens off from the sit onward.", s: "The phone charges outside the bedroom. If you need an alarm, a cheap clock." },
  { n: "Cold, dark, quiet.", s: "The room cooler than you'd like it; blackout if the street lights in; earplugs if the house is loud. Ten pounds for each; they pay for themselves in a week." },
  { n: "Caffeine stops at noon.", s: "It has a five-hour half-life; a coffee at three is a quarter of a coffee at midnight." },
  { n: "Can't sleep after twenty minutes: get up.", s: "Sit in the dark, coherent breathing — in 4, out 6 — until the eyes are heavy, then back. Lying awake trains the bed to be a place you lie awake." },
  { n: "Wake at the same time every day, including Friday's lie-in within an hour of the others.", s: "The body's clock is set by the wake time, not the bedtime." },
];
export const NIGHT_CLOSE = "The strap tells you if it's working: resting heart rate down over months, HRV up, the morning check green. It won't lie, and neither should you on the sleep line of the weekly check.";
export const NIGHT_LINE = "The most important line in Iron Mind isn't a practice; it's a bedtime.";

/* tonight's lights-out target, by the day it is */
export function lightsTarget(day) {
  if (day === "thu" || day === "fri") return { t: "21:00", s: "BY 21:00", line: "Thursday and Friday can slip to nine." };
  if (day === "sat") return { t: null, s: "8½ HOURS", line: "Saturday and Sunday nights aim for eight and a half hours." };
  return { t: "20:30", s: "BY 20:30", line: "Lights out by half past eight, Sunday to Wednesday." };
}

/* ================================================================
   THE FIGHT-WEEK MIND — WEEKS 23 AND 24 — AND AFTER THE FIGHT
   ================================================================ */
export const FIGHT_WEEK_INTRO = "Nothing new, nothing heavy, nothing that isn't already automatic. The mind tapers exactly as the body does: frequency kept, volume down, intensity in the form of sharpness, not effort.";
export const FIGHT_WEEK = {
  23: { n: "WEEK 23 · SHARPEN", mins: 20,
    s: "The sit at 20 minutes every night, counting and following only — no open awareness, no candle, no switch drill; the practices that hold the mind, not the ones that open it. Rehearsal every evening, five minutes, real time, through your own eyes: the walk to the ring, the first bell, the moment it goes wrong, the response. Breath: the sigh, coherent breathing and Breathe Light only — the tolerate and control tools stop, the stimulants aren't in the season. Hardship: none. Cold and heat stop. The life test pauses. The rules hold, especially six and seven.",
    breath: ["sigh3", "sigh5", "coherent", "light"], breathLine: "Breath: the sigh, coherent breathing and Breathe Light only — the tolerate and control tools stop, the stimulants aren't in the season.",
    segs: [{ l: "COUNT", m: 10 }, { l: "FOLLOW THE BREATH", m: 10 }] },
  24: { n: "WEEK 24 · FIGHT WEEK", mins: 12,
    s: "The sit at 12 minutes, counting only. Rehearsal daily. On the day: the routine you rehearsed on the Sunday before — wake, meals, the warm-up — and in the car, the pre-fight 90 seconds: two sighs; one line, second person, your own name — \"You've done harder. Sharp and relaxed.\"; the single concrete thing you'll do when the first bell goes. Then in. In every rest, the corner minute: two sighs the second the round ends, then nose only, in 3 out 6, stood up, hands off the knees. Between rounds, one instruction from your corner, nothing else in your head. Round six is a place you've already been.",
    breath: ["sigh3", "sigh5", "coherent"], breathLine: "The sigh and the long exhale only.",
    segs: [{ l: "COUNT THE EXHALES · ONE TO TEN", m: 12 }] },
};
export const FIGHT_HARDSHIP = "Hardship: none. Cold and heat stop. The tests pause.";

/* the sit the fight-week mind prescribes, in sitPlan's shape */
export const fightSitPlan = (w) => {
  const F = FIGHT_WEEK[w] || FIGHT_WEEK[24];
  return { segs: F.segs.map((s) => Object.assign({}, s)), mins: F.mins };
};

export const AFTER_FIGHT = "The night of, nothing. The next morning, the sit at 12 minutes and the review with one extra question, once. Spoken, not written, not brooded on — one pass, then it's over, whatever the result. The transition weeks keep the sit at 12–15 minutes, the rules, and the life review; the hardship ladder restarts at Level 2 when the training does.";
export const AFTER_STAGE4 = "Then Stage 4 — meditation and breath — opens: the long sits, just sitting, the full day, and the heavy breath tools you were drawn to at the start, earned by the six months of calm behind them.";
export const AFTER_VERDICT = "The season's numbers get one last look: days done across twenty-four weeks, the clean-cycle line, the reactivity count in week 1 against week 24. That comparison is the verdict on the whole program, and it's the one to keep.";
export const AFTER_Q = "What did I learn that I couldn't have learned any other way?";

export const HALF_DAY = "Three to four hours, sitting and walking alternately, no phone, no talking, no reading. Nothing else will show you your own mind as clearly.";

/* the month's one thing named at the latest audit, for the four Sundays after it */
export function monthOneThing(st, wks, isoDay) {
  const w = imWeekOn(st, isoDay);
  for (let back = 0; back <= 4; back++) {
    const aw = w - back; if (AUDIT_WEEKS.indexOf(aw) < 0) continue;
    const rec = wks[seasonMonday(st, aw)] || {};
    if (rec.month) return { text: rec.month, week: aw };
  }
  return null;
}
