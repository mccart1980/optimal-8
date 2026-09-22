import { iso, mondayOf, parseISO, addDays, fmtDate } from "./ui.jsx";

/* ================================================================
   THE SEASON

   One fight date decides everything. The camp is the ten weeks that
   end on it; PREP is the fourteen weeks that end on the test day on
   the Saturday before the camp starts; the two easy weeks of the
   TRANSITION follow the fight. With no fight date PREP runs its
   sixteen-week form and nothing is dated to anything but its own
   start.

   Every week in here carries a `doc` number — the row of the
   fourteen-week calendar its prescription is read from — so the
   sixteen-week form and a truncated PREP both load the document's
   own weeks rather than a rewritten table.
   ================================================================ */

export const WEEK = 604800000;
export const CAMP_WEEKS = 10;
export const PREP_FULL = 14;
export const PREP_SOLO = 16;
export const TRANSITION_WEEKS = 2;

/* the camp's six blocks, in order, ending on the fight */
export const CAMP_BLOCKS = [
  { n: "FOUNDATION", w: 1 },
  { n: "BUILD", w: 3 },
  { n: "EASY + TESTS", w: 1 },
  { n: "PEAK", w: 3 },
  { n: "SHARPEN", w: 1 },
  { n: "FIGHT WEEK", w: 1 },
];

/* PREP's blocks in the document's fourteen-week form */
export const PREP_BLOCKS_14 = { 1: "ACCUMULATE", 2: "ACCUMULATE", 3: "ACCUMULATE", 4: "ACCUMULATE", 5: "ACCUMULATE",
  6: "INTENSIFY", 7: "INTENSIFY", 8: "INTENSIFY", 9: "INTENSIFY", 10: "INTENSIFY",
  11: "CONVERT", 12: "CONVERT", 13: "CONVERT", 14: "TEST WEEK" };

/* The sixteen-week form: the same sessions, loads and rules, with the
   extra weeks added where the blocks make room for them — a second
   normal-tempo week in accumulation and a second contrast week in
   conversion. Each entry is the document row it reads from. */
export const PREP_16_DOC = [1, 2, 3, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 14];
export const PREP_16_BLOCK = ["ACCUMULATE", "ACCUMULATE", "ACCUMULATE", "ACCUMULATE", "ACCUMULATE", "ACCUMULATE",
  "INTENSIFY", "INTENSIFY", "INTENSIFY", "INTENSIFY", "INTENSIFY",
  "CONVERT", "CONVERT", "CONVERT", "CONVERT", "TEST WEEK"];

/* the camp block a camp week falls in */
export function campBlockOf(week) {
  let n = 0;
  for (let i = 0; i < CAMP_BLOCKS.length; i++) { n += CAMP_BLOCKS[i].w; if (week <= n) return CAMP_BLOCKS[i].n; }
  return CAMP_BLOCKS[CAMP_BLOCKS.length - 1].n;
}

/* ---------- the dates ---------- */
/* The camp's last week is the fight's own week, so camp week 1 is nine
   weeks before it. */
export const campStartFor = (fightIso) => iso(new Date(mondayOf(parseISO(fightIso)).getTime() - (CAMP_WEEKS - 1) * WEEK));
/* PREP hands over on the Saturday before the camp starts. */
export const testDayFor = (fightIso) => addDays(campStartFor(fightIso), -2);
/* and its test week is the week that Saturday falls in */
export const prepEndMondayFor = (fightIso) => addDays(campStartFor(fightIso), -7);

const weeksBetween = (a, b) => Math.round((mondayOf(parseISO(b)) - mondayOf(parseISO(a))) / WEEK);

/* How many PREP weeks there is room for: fourteen when there are
   fourteen, otherwise as many as there are, and the calendar is
   truncated from the front so the weeks that survive are the ones
   nearest the camp. */
export function prepShapeFor(st) {
  if (!st.fightDate) {
    return { weeks: PREP_SOLO, doc: PREP_16_DOC.slice(), block: PREP_16_BLOCK.slice(), truncated: 0 };
  }
  const end = prepEndMondayFor(st.fightDate);
  const avail = weeksBetween(st.start, end) + 1;
  const weeks = Math.max(1, Math.min(PREP_FULL, avail));
  const from = PREP_FULL - weeks;                    /* rows dropped off the front */
  const doc = [], block = [];
  for (let i = 0; i < weeks; i++) { const d = from + i + 1; doc.push(d); block.push(PREP_BLOCKS_14[d]); }
  return { weeks, doc, block, truncated: from };
}

/* The whole season as a dated strip, oldest first. Every row carries
   the program it belongs to, its week inside that program, the
   document row its prescription comes from, and its Monday. */
export function buildSeason(st) {
  const rows = [];
  const shape = prepShapeFor(st);
  let prepStart;
  if (st.fightDate) prepStart = iso(new Date(mondayOf(parseISO(prepEndMondayFor(st.fightDate))).getTime() - (shape.weeks - 1) * WEEK));
  else prepStart = iso(mondayOf(parseISO(st.start)));

  for (let i = 0; i < shape.weeks; i++) {
    const mon = iso(new Date(parseISO(prepStart).getTime() + i * WEEK));
    rows.push({ program: "prep", week: i + 1, doc: shape.doc[i], block: shape.block[i], mon, sun: addDays(mon, 6) });
  }
  const prepEnd = rows.length ? rows[rows.length - 1] : null;
  const testDay = st.fightDate ? testDayFor(st.fightDate) : (prepEnd ? addDays(prepEnd.mon, 5) : null);

  if (st.fightDate) {
    const cs = campStartFor(st.fightDate);
    for (let i = 0; i < CAMP_WEEKS; i++) {
      const mon = iso(new Date(parseISO(cs).getTime() + i * WEEK));
      rows.push({ program: "camp", week: i + 1, doc: i + 1, block: campBlockOf(i + 1), mon, sun: addDays(mon, 6) });
    }
    const tStart = iso(new Date(mondayOf(parseISO(st.fightDate)).getTime() + WEEK));
    for (let i = 0; i < TRANSITION_WEEKS; i++) {
      const mon = iso(new Date(parseISO(tStart).getTime() + i * WEEK));
      rows.push({ program: "transition", week: i + 1, doc: i + 1, block: "TRANSITION", mon, sun: addDays(mon, 6) });
    }
  }
  return {
    rows, prepStart, prepEnd: prepEnd ? prepEnd.sun : null, prepWeeks: shape.weeks, truncated: shape.truncated,
    testDay, fight: st.fightDate || null,
    campStart: st.fightDate ? campStartFor(st.fightDate) : null,
    transitionStart: st.fightDate ? iso(new Date(mondayOf(parseISO(st.fightDate)).getTime() + WEEK)) : null,
  };
}

/* which row a date falls in */
export function rowOn(season, isoDay) {
  const mon = iso(mondayOf(parseISO(isoDay)));
  return season.rows.find((r) => r.mon === mon) || null;
}

/* The program the season says today belongs to, which is not always
   the program that is switched on. */
export function programOn(season, isoDay) { const r = rowOn(season, isoDay); return r ? r.program : null; }

/* Is the fight behind us? */
export const fightPassed = (st, isoDay) => !!(st.fightDate && isoDay > st.fightDate);

/* What changed when the fight date moved: the weeks whose Monday is
   no longer what it was. */
export function seasonDiff(before, after) {
  const was = {}; before.rows.forEach((r) => { was[r.program + r.week] = r.mon; });
  const moved = [];
  after.rows.forEach((r) => { const w = was[r.program + r.week]; if (w && w !== r.mon) moved.push(r); });
  const added = after.rows.filter((r) => !was[r.program + r.week]);
  return { moved, added };
}

export const seasonLabel = (r) => (r.program === "prep" ? "PREP WK " + r.week : r.program === "camp" ? "CAMP WK " + r.week : "TRANSITION WK " + r.week);
export const dateSpan = (r) => fmtDate(r.mon) + " – " + fmtDate(r.sun);
