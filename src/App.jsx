import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { play, cueFor, beatAt, rehearse, setMode as setSoundMode, MODES as SOUND_MODES } from "./sound.js";
import { Welcome } from "./welcome.jsx";
import "./storage.js"; // installs window.storage (localStorage-backed)
import campDoc from "../optimal-8-camp.md?raw";
import prepDocMd from "../optimal-8-prep.md?raw";
import sppDocMd from "../optimal-8-strength-power-physique.md?raw";
import moveDocMd from "../optimal-8-move.md?raw";
import guideDoc from "../guide.md?raw";
import guideFuelDoc from "../guide-fuel.md?raw";
import {
  C, soft, FONTS, RAD, Icon, CheckDot, dsp, bdy, mno, buzz, r25, num, DAYS, DSH, iso, mondayOf, parseISO, todayKey, addDays, weeksApart, addWeeks, fmtDate,
  load, save, Card, Eye, Lab, Fld, Btn, Chip, Note, Seg, TEXT_STEPS, stepScale, THEME_STEPS, applyTheme,
  FS, big, cap, longDate, toast, Toasts, Guard, Skeleton, Banner, NavRow, Meter, Knob,
} from "./ui.jsx";
import { TimerDock, TimerFull } from "./timers.jsx";
import { dayType, targets as foodTargets, sundayChecks, bodyKg } from "./food.js";
import { FoodToday, FoodRow, mealsFrom } from "./food-ui.jsx";
import { WeekCard, Hero, NowRow, Section, Focus, LogSet, ACT_H, ACT_CSS } from "./home.jsx";
import { Trend, ChartCard, Stat } from "./charts.jsx";
import { shortDate, weightSeries, WeightCard, LiftsCharts, SprintsPage, boxSeries, StatRow } from "./progress.jsx";
import { DocView } from "./mdview.jsx";
import { whileBusy, checkNow, CHECK_SAID, BUILD, buildSay } from "./update.js";
import { libFor, LIBRARY } from "./library.js";
import {
  LINES, lineById, curLevel, ownedDate, levelText, levelPres, calMode, DEF_CALIS,
  CALIS_INTRO, CALIS_RULES, SLOW_LAWS, SLOW_WHY, SKILL_BLOCK, MODE_LINE,
  FRONT_LEVER_LINE, BACK_LEVER_LINE, PLANCHE_LINE, SUNDAY_LEVER, fighterSkillCards,
} from "./calis.js";
import { Lines, CheckTaps } from "./today.jsx";
import { CardHead, BigBtn, SetButtons, Input, Checklist, RoutineRunner, Chapter, T1, T2, T3 } from "./now.jsx";
import { Sheet } from "./sheet.jsx";
import { withMove, withFinalWeek, OPROTO } from "./movex.js";
import { withCore } from "./core.js";
import { auditOn, SPLEEFT_FAST, ARMS_THIRD, BIKE_THIRD, ROUNDS_LIB, T20_LIB, lmPush } from "./audit.js";
import { SIGHS, MORNING_FIVE, RANGE_CARDS, FIGHT_WEEK_CARDS, KEEP_CARDS, MOVE_CARDS, moveRangeCards, sessionCards, upperPushCards, skillCards, ROUTINE_MINS } from "./routines.js";
import { MOVE_SINCE, MOVE_PROGRAM_INTRO, MOVE_PH, moveWeekOf, movePhase, isMoveTestWeek, LEVEL_KEY, levelLine, stepLevel, MOVE_TEST_IDS, rangeStandardsMet, jeffersonGate, END_KEY, tendonWeekOf } from "./move.js";
import { MoveLevels, MoveTests, MoveTrack } from "./move-ui.jsx";
import { SeasonView, GuideView, ProfileTool, planWords } from "./season-ui.jsx";
import { programTitle, PROGRAM_NAME } from "./program.js";
import {
  isTestWeek, isKeepWeek, rangeTitle, RANGE_INTRO,
} from "./range.js";
import { RangeTests, RangeTrack } from "./range-ui.jsx";
import {
  CAMP_L, CAMP_START_DEFAULT, CPH, CENG, CENG_MENU, CS, CPROTO,
  campSess, campBlank, daysOut, CSFW,
  CAMP_DAILY_CHECK, WORKING_WEIGHT_RULE, SCORED_WEEKS_LINE,
  CAMP_EASY_HOUR, PHASE_NAME, campBench,
} from "./camp.js";
import { EDGE_OFF_LINE, EDGE_INTRO, EDGE_GUARDRAIL, EDGE_ITEMS, TENDON_GATE, edgeCutIndex, tendonGate, jumpYellow, EASY_THIRTY, SAUNA_BASE, saunaDays } from "./edge.js";
import {
  jumpOf, stageDown, jumpGate, TOP_RAMP, topMax, TOP_NOT_MAX, STOP_PCT, stopRounds, stopState, stopStateShares, roundFilled, fadePct, PAIN_LINE, painRow,
  HEAD_Q, HEAD_SYMPTOMS, HEAD_DOCTOR, HEAD_AE, HEAD_WHY, HEAD_CLEARED,
} from "./safety.js";
import { CampWeekTable, FightWeekTable, CampWorkPanel, CampNumbers, CampWeekCard } from "./camp-ui.jsx";
import {
  PREP_INTRO, PREP_PHASE_NAME, PREP_PHASE_CUE, PENG, PENG_MENU, prepRx, prepEdge, prepEmphasis, prepTests,
  FLEX_TESTS, MOVE_INTRO, moveTonight, CARB_TOPUP,
  TRANSITION_INTRO, TRANSITION_RULES, prepSess, transitionSess, PPROTO, prepBench, topItem, psqOf, psqLine, rdlOf,
} from "./prep.js";
import {
  SPP_PH, SPPENG, SPPENG_MENU, SPPROTO, SPP_READY_LINE, sppSess, sppRx, sppTests, sppVelPhase, sppPhotoDay, sppMainLine, sppPsq, sppPp, sppSprints,
  ENGINE_SINCE, sppEasyHour, sppSunRun, AUDIT_SINCE, sppAudit, spp44Short, sppTread, sppPrRounds, sppArms, FIT_SINCE, sppOrder,
} from "./spp.js";
import {
  buildSeason, rowOn, rowForDay, rowByKey, rowRx, rowDates, monOf as mondayIso, planStartFor, describeSeason, fitnessFromFade,
  FIGHT_DEFAULTS, FITNESS, EMPHASES, campLayout, weeksBetween,
} from "./builder.js";
import {
  VEL_LIFTS, PROFILE_LOADS, VEL_PHASES, fitLine, targetFor, verdictFor, adjustLoad,
  phaseOfWeek, stopPct, VEL_BAND, campPhaseOfWeek, ballisticPct, isFast, prevReading,
} from "./velocity.js";
import {
  morningFlag, recoveryDrop, easyZone, peakHeartRate, isEasyTimer, easyTimer, ergSlots, ergShapeFor, ergTotal, simFade, sleepWeek,
  readiness, READY_LINE, recalibrated,
  BAR_SPEED_ITEMS, isPhotoDay, parseFuelExport, parseKey, ergUnitLabel, r1, MORNING_FIELDS, strapBackBy, scopeOf, inScope, SETTLE_IDS,
  lastSession, topOfRange,
} from "./metrics.js";
import {
  MorningCard, RecoveryHR, EasyZonePanel, ErgPanel, BarSpeedField,
  BarSpeedTrack, PhotosView, PhotoPrompt, Dashboard, MeasureSettings, SleepFields,
} from "./metrics-ui.jsx";
import {
  fuelPlan, DEFAULT_BREAKS, LEN_DAYS, tMin, hhmm, HYDRA_RULES, MIDBANANA, SACHET, EASY_WATER, mlOf, PHASES as FUEL_PHASES, WEIGH_DEFAULT, B as MEAL_BLOCKS, slotOf as mealSlot0, SLOTS as MEAL_SLOTS, BASE_OF as MEAL_BASE,
} from "./fuel.js";
import {
  weightCfg, sameCfg, runPlan, weightDay, averageOn, fightWeekAverage, topUpLitres, WEIGH_INS, WEIGHT_FIELDS, SCALES_TEXT, AFTER_FIGHT_TEXT, REWEIGH_TEXT,
  lineStart, startDraws,
} from "./weight.js";
import { LineCard, WeightResult, ScalesLine, WeightBanner, lightDaysNotes } from "./weight-ui.jsx";
import { FeedBody, WaterBody, DayFuel, Cook, Shop, Referee, useBeep, useKTimer, KDock } from "./fuel-ui.jsx";
import fuelDocMd from "../fuel-optimal-8-fighter.md?raw";
import fuelMenuMd from "../fuel-the-menu.md?raw";
import fuelMenuBMd from "../fuel-menu-b.md?raw";
import fuelSeasonMd from "../fuel-season.md?raw";

/* ================================================================
   OPTIMAL 8 — THE FIGHTER BUILD v1.5 · companion app
   The phase colour drives the screen: BUILD moss, FORCE oxide,
   VELOCITY brass, TAPER/TEST cobalt. Durability work is violet.
   ================================================================ */

/* The stored records Iron Mind kept. It was taken out on 20 November
   2026; the day record still holds every tick on TODAY, and the others
   stay in the backup file. */
const IM_KEYS = { day: "o8s-imday", sit: "o8s-imsit", hard: "o8s-imhard", wk: "o8s-imwk" };

/* tonight's lights-out target, by the day it is */
function lightsTarget(day) {
  if (day === "thu" || day === "fri") return { t: "21:00", s: "BY 21:00", line: "Thursday and Friday can slip to nine." };
  if (day === "sat") return { t: null, s: "8½ HOURS", line: "Saturday and Sunday nights aim for eight and a half hours." };
  return { t: "20:30", s: "BY 20:30", line: "Lights out by half past eight, Sunday to Wednesday." };
}

/* ---------- file backup (Web Share where available, download otherwise) ---------- */
const backupName = () => "fighter-backup-" + new Date().toISOString().slice(0, 10) + ".json";
async function shareOrDownload(text) {
  const name = backupName();
  try {
    if (typeof navigator !== "undefined" && navigator.canShare && typeof File === "function") {
      const file = new File([text], name, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Fighter backup" }); return "shared"; }
    }
  } catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 5000);
    return "downloaded";
  } catch (e) { return "failed"; }
}
const readTextFile = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result || "")); r.onerror = () => rej(r.error); r.readAsText(file); });

/* v1.2 threaded the calisthenics in, and that moved some block letters on
   Monday (ring dips) and Tuesday (the pistol line). This remaps the ticks of
   anything saved before then, so nothing already done lands on the wrong block. */
const MAP_MON = { E: "F", F: "G", G: "H" }, MAP_TUE = { C: "D", D: "E", E: "F", F: "G", G: "H" };
function migrateDone(done) {
  const out = {};
  Object.keys(done || {}).forEach((k) => { const m = /-mon$/.test(k) ? MAP_MON : /-tue$/.test(k) ? MAP_TUE : null;
    out[k] = m ? (done[k] || []).map((x) => m[x] || x) : done[k]; });
  return out;
}
/* Strength, Power and Physique's Monday box jumps were part of the warm-up
   (block A) until they got a card of their own (block K). A Monday whose
   warm-up was ticked before then has its box jumps ticked with it, so a day
   already finished still reads as finished. Runs once, and on a backup made
   before the change. */
export function boxJumpsDone(done) {
  const out = {};
  Object.keys(done || {}).forEach((k) => { const l = done[k] || [];
    out[k] = /^mSw\d+-mon$/.test(k) && l.indexOf("A") >= 0 && l.indexOf("K") < 0 ? l.concat(["K"]) : done[k]; });
  return out;
}

const defaultStart = () => { const t = new Date(); const dow = (t.getDay() + 6) % 7; const m = mondayOf(t); if (dow >= 5) m.setDate(m.getDate() + 7); return iso(m); };

/* ================================================================
   THE MACROCYCLE — every prescription in the app derives from here
   ================================================================ */
/* a block's note, as its week reads: from the audit's week a note that
   names what the audit replaced says what the week holds now (`au`: the
   words that went, and the words in their place) */
const phNote = (P, rx) => (P && P.note && rx && rx.au && P.au ? P.note.replace(P.au[0], P.au[1]) : (P || {}).note);
const PH = {
  b1: { n: "BUILD", long: "BLOCK 1 · BUILD", ac: C.moss, vl: "25–30%",
    note: "The most volume in the cycle — four sets of rows, three of split squats. Drop landings. Jump circuit at 2 rounds, punch throws at 3, Nordics ramping up. Week 1 finds your trap bar and push press numbers.",
    au: ["Week 1 finds your trap bar and push press numbers.", "Week 1 finds your trap bar number."] },
  b2: { n: "FORCE", long: "BLOCK 2 · FORCE", ac: C.oxide, vl: "15–20%",
    note: "Accessories drop to 3 sets and the bar gets heavier: the rests on the main lifts go to 2½ minutes for the heavy triples. Low-box depth jumps replace the drop landings. Week 9's top triple is a direction check, not your real number — you're carrying fatigue." },
  b3: { n: "VELOCITY", long: "BLOCK 3 · VELOCITY", ac: C.brass, vl: "10–15%",
    note: "Everything gets faster. The jump circuit leads Saturday at 4 rounds with the band-assisted jump; the squat drops to 2×2 @ 88% behind it. Monday's bench and bench throws merge into one circuit. Depth jumps replace the low-box depth jumps, side bounds go continuous, punch throws to 4 rounds, trap bar and push press to fast 3×3s at 80%, and Wednesday's pause squat becomes a speed squat. Speed fades fastest once you stop — so it's trained hardest right before the test.",
    au: ["trap bar and push press to fast 3×3s at 80%", "the trap bar to fast 3×3s at 80%, the landmine push press to fast 3×3s each side"] },
  taper: { n: "TAPER", long: "TAPER & TEST", ac: C.cobalt, vl: "≤10%",
    note: "Volume −40% then −60%. Intensity held. A deload drops intensity to restore you; a taper drops volume and keeps intensity, because fatigue sheds faster than fitness. Sprints and jumps stay in both weeks — reduce their volume, never their intent. Saturday of week 16 is test day." },
  hell: { n: "HELL WEEK", long: "HELL WEEK", ac: C.oxide, vl: "—",
    note: "You've just tapered for two weeks — the freshest you'll be all cycle, the only sensible place for a maximal test battery. No Optimal 8 volume. One flagship test per day, drawn from the cards each morning. Run it from the IRON tab." },
  reload: { n: "RELOAD", long: "RELOAD", ac: C.moss, vl: "—",
    note: "Sets −40%, intensity ~70%. Light movement, full food. The adaptation happens now, not during the testing. Sprints and jumps stay in at reduced volume. Then straight into week 1 of the next macrocycle." },
};
Object.assign(PH, CPH);
/* PREP's three blocks, and the two easy weeks after a fight */
Object.assign(PH, {
  accumulate: { n: "ACCUMULATE", long: "BLOCK 1 · ACCUMULATE", ac: C.moss, vl: "volume, base, tissue, size, movement",
    note: "Five weeks of volume, base, tissue and size. Slow lowering on the big lifts and the bench, the upper-body Monday, the three circuits and the three carries, and the movement session twice a week. It feels easy. It is not." },
  intensify: { n: "INTENSIFY", long: "BLOCK 2 · INTENSIFY", ac: C.oxide, vl: "heavy, paused then fast",
    note: "Five weeks of heavy work: paused reps, then fast reps, then the top triples in week 9 and the reset that follows it. The dips go heavier and the sauna goes in." },
  convert: { n: "CONVERT", long: "BLOCK 3 · CONVERT", ac: C.brass, vl: "contrast, reactive, top speed",
    note: "Contrast doubles straight into the jump circuit, depth jumps, top speed, repeat bursts and the rounds at fight rest. Where strength becomes speed." },
  prepTest: { n: "TEST WEEK", long: "TEST WEEK", ac: C.cobalt, vl: "light, then test day",
    note: "Light all week, then test day on Saturday and the 20-minute test on Sunday. Every number gets measured and every working weight resets off them." },
  trans: { n: "TRANSITION", long: "THE TWO EASY WEEKS", ac: C.moss, vl: "nothing above 70%",
    note: "Two easy weeks after the fight. Base rides, the movement session, calisthenics at half sets, nothing above 70%, no sprints, no rounds." },
});
/* Strength, Power and Physique's blocks */
Object.assign(PH, SPP_PH);
const prepPhaseOf = (doc) => (doc <= 5 ? "accumulate" : doc <= 10 ? "intensify" : doc <= 13 ? "convert" : "prepTest");
const phaseOf = (w) => (w <= 5 ? "b1" : w <= 10 ? "b2" : w <= 14 ? "b3" : w <= 16 ? "taper" : w === 17 ? "hell" : "reload");
const bwk = (w) => (w <= 5 ? w : w <= 10 ? w - 5 : w <= 14 ? w - 10 : null);

const BURST_RULE = "Rule: if a burst is visibly weaker than the last, take an extra 20 seconds; if two in a row are, the set is over.";
const ENG = {
  vo2: { n: "4-MINUTE INTERVALS", d: "4 rounds of 4 minutes HARD (breathing heavily, could speak 2–3 words at most) with 3 easy minutes between", why: "The single best session there is for building your engine. Boxing is ~75–80% aerobic." },
  lac: { n: "40-SECOND REPEATS", d: "40 seconds absolutely flat out, 80 seconds easy. Do 3, rest 5 full minutes, do 3 more", why: "Rounds 1–2 feel fine, round 3 burns, the last three are horrible. That burning is the point — it's what the late rounds of a fight feel like, and this is the only session that goes there. Don't hold back early to survive the end." },
  rz: { n: "REPEAT BURSTS", d: "2 sets × 8 bursts of 6–8s at absolute maximum / 40s easy between · 5 full minutes between sets",
    why: "Eight bursts of 6–8 seconds at absolute maximum, with 40 seconds easy spinning between them; then 5 full minutes easy; then 8 more. Two sets, sixteen bursts. The first three feel like nothing. By the sixth the burst is still there but it costs; by the eighth of the second set the question is whether the burst is still a burst. That's the point — this is a flurry, twenty or thirty seconds apart, for a round, and what decides whether the fourth flurry has anything in it is how fast the muscle refills between them, which is an aerobic job done at flat-out intensity. The one session in the week shaped exactly like the thing you do in a ring.",
    rule: BURST_RULE },
  rz3: { n: "REPEAT BURSTS · ONE SET", d: "1 set × 8 bursts of 6–8s at absolute maximum / 40s easy between",
    why: "Week 15: one set, eight bursts. The shape of a round held, the volume halved. Intent stays; the cost comes off.",
    rule: BURST_RULE },
  easy: { n: "EASY", d: "20 minutes at a pace where you could chat. That's it", why: "Deload. Nothing else." },
  easy15: { n: "EASY FLUSH", d: "15 minutes at a pace where you could chat", why: "Test week. Nothing else." },
};
/* The Tuesday page writes out all four session types; Thursday refers back to
   it. This is that menu, in the document's order. */
const ENG_MENU = ["vo2", "lac", "rz", "easy"];
const SIMB = { 1: { rest: 45 }, 2: { rest: 90, max3: 1 }, 3: { rest: 60 }, 4: { rest: 60, tested: 1 }, 5: { skip: 1 } };

const R = {};
const cal = { sc: "CALIBRATE — ramp to a 3RM @ RPE 8", cal: 1 };
const tbB = (sc, s, r, p) => ({ sc, sets: s, reps: r, pct: p });
/* No released weights: the reactive slot climbs from drop landings
   (weeks 1–5) to low-box depth jumps (6–10) to depth jumps (11–16) — the
   stages Prep and the Camp climb — and the reload starts again at the
   bottom. No true maxes: weeks 4 and 9 are top triples. */
const fighterJump = (w) => (w <= 5 || w >= 17 ? "land" : w <= 10 ? "lowbox" : "depth");
const wk = (w, o) => { R[w] = Object.assign({ w, ph: phaseOf(w), bw: bwk(w), cpct: 85, vec: 3, jump: fighterJump(w), js: [4, 4], bound: "stick", z2wed: 30, z2sun: 40, sled: 5, sprPct: 100, throw: [5, 3] }, o); };
wk(1, { sc: "4 × 6 @ 75%", sets: 4, reps: 6, pct: 75, cr: 2, spr: 3, acc: 4, nor: [2, 3], tb: cal, pp: cal, eng: "vo2", sim: SIMB[1], cal: 1 });
wk(2, { sc: "4 × 5 @ 78%", sets: 4, reps: 5, pct: 78, cr: 2, spr: 4, acc: 4, nor: [2, 4], tb: tbB("4 × 3 @ 80%", 4, 3, 80), pp: tbB("4 × 3 @ 82%", 4, 3, 82), eng: "lac", sim: SIMB[2] });
wk(3, { sc: "4 × 5 @ 80%", sets: 4, reps: 5, pct: 80, cr: 2, spr: 5, acc: 4, nor: [3, 4], tb: tbB("4 × 3 @ 80%", 4, 3, 80), pp: tbB("4 × 3 @ 82%", 4, 3, 82), eng: "rz", sim: SIMB[3] });
wk(4, { sc: "TOP TRIPLE → 2 × 3 @ 85%", sets: 2, reps: 3, pct: 85, topSq: 1, topBe: 1, cr: 2, spr: 5, acc: 4, nor: [3, 5], tb: tbB("4 × 3 @ 80%", 4, 3, 80), pp: { bench: 1 }, eng: "vo2", sim: SIMB[4] });
wk(5, { sc: "2 × 5 @ 65% — deload", sets: 2, reps: 5, pct: 65, cr: 1, spr: 3, sprPct: 90, acc: 2, nor: [2, 3], tb: tbB("2 × 3 @ 65%", 2, 3, 65), pp: tbB("2 × 3 @ 65%", 2, 3, 65), vec: 2, js: [2, 4], eng: "easy", sim: SIMB[5], dl: 1, sled: 3 });
wk(6, { sc: "4 × 4 @ 82%", sets: 4, reps: 4, pct: 82, cr: 3, spr: 3, acc: 3, nor: [3, 5], tb: tbB("4 × 3 @ 85%", 4, 3, 85), pp: tbB("4 × 3 @ 85%", 4, 3, 85), iso: 1, z2wed: 20, eng: "vo2", sim: SIMB[1] });
wk(7, { sc: "4 × 3 @ 85%", sets: 4, reps: 3, pct: 85, cr: 3, spr: 4, acc: 3, nor: [3, 5], tb: tbB("4 × 3 @ 85%", 4, 3, 85), pp: tbB("4 × 3 @ 85%", 4, 3, 85), iso: 1, z2wed: 20, eng: "lac", sim: SIMB[2] });
wk(8, { sc: "4 × 3 @ 87%", sets: 4, reps: 3, pct: 87, cr: 3, spr: 5, acc: 3, nor: [3, 5], tb: tbB("4 × 3 @ 85%", 4, 3, 85), pp: tbB("4 × 3 @ 85%", 4, 3, 85), iso: 1, z2wed: 20, eng: "rz", sim: SIMB[3] });
wk(9, { sc: "TOP TRIPLE → 2 × 2 @ 88%", sets: 2, reps: 2, pct: 88, topSq: 1, topBe: 1, mid: 1, cr: 2, spr: 5, acc: 3, nor: [3, 5], tb: tbB("3 × 2 @ 88%", 3, 2, 88), pp: { bench: 1 }, z2wed: 20, eng: "vo2", sim: SIMB[4] });
wk(10, { sc: "2 × 4 @ 65% — deload", sets: 2, reps: 4, pct: 65, cr: 1, spr: 3, sprPct: 90, acc: 2, nor: [2, 3], tb: tbB("2 × 3 @ 65%", 2, 3, 65), pp: tbB("2 × 3 @ 65%", 2, 3, 65), vec: 2, js: [2, 4], z2wed: 20, eng: "easy", sim: SIMB[5], dl: 1, sled: 3 });
[11, 12, 13, 14].forEach((w, i) => wk(w, { sc: "JUMP CIRCUIT LEADS · 2 × 2 @ 88% after", sets: 2, reps: 2, pct: 88, cpct: 88, cr: 4, spr: [3, 4, 5, 5][i], acc: 3, nor: [3, 5],
  tb: tbB("3 × 3 @ 80% — bar speed", 3, 3, 80), pp: tbB("3 × 3 @ 80% — bar speed", 3, 3, 80), vec: 4, jump: "depth", js: [4, 5], bound: "cont",
  eng: ["vo2", "lac", "rz", "vo2"][i], sim: [{ rest: 60 }, { rest: 45 }, { rest: 60 }, { rest: 60, tested: 1 }][i], upperC: 1, lowerLead: 1, bw: i + 1 }));
wk(15, { sc: "2 × 2 @ 85%", sets: 2, reps: 2, pct: 85, cr: 2, spr: 3, acc: 2, nor: [2, 4], tb: tbB("2 × 2 @ 85%", 2, 2, 85), pp: tbB("2 × 2 @ 85%", 2, 2, 85), vec: 2, jump: "depth", js: [2, 5], bound: "cont", eng: "rz3", sim: { rounds: 3, rest: 60 }, tp: 1 });
wk(16, { sc: "1 × 2 @ 85%", sets: 1, reps: 2, pct: 85, bsc: "2 × 2 @ 85%", bsets: 2, cr: 1, spr: 3, acc: 1, nor: null, tb: tbB("1 × 2 @ 80%", 1, 2, 80), pp: null, vec: 2, jump: "depth", js: [2, 3], bound: "cont", z2wed: 20, z2sun: 30, eng: "easy15", sim: SIMB[5], throw: [3, 3], tp: 1, test: 1 });
wk(17, { sc: "NO OPTIMAL 8 VOLUME", hell: 1, eng: null, sim: SIMB[5] });
wk(18, { sc: "2 × 5 @ 70% — reload", sets: 2, reps: 5, pct: 70, cr: 1, spr: 3, sprPct: 90, acc: 2, nor: [2, 3], tb: tbB("2 × 3 @ 65%", 2, 3, 65), pp: tbB("2 × 3 @ 65%", 2, 3, 65), vec: 2, js: [2, 4], eng: "easy", sim: SIMB[5], dl: 1, sled: 3, reload: 1 });
const ENG2 = { 1: "lac", 2: "rz", 3: "vo2", 4: "lac", 5: "easy", 6: "lac", 7: "rz", 8: "vo2", 9: "lac", 10: "easy", 11: "lac", 12: "rz", 13: "vo2", 14: "lac", 15: "easy", 16: null, 17: null, 18: "easy" };
const pqB = (sc, pct, sets, reps, fast) => ({ sc, pct, sets: sets || 3, reps: reps || 3, fast: !!fast });
/* v1.5: the pause squat is a percentage of the BACK-SQUAT max, and a two-second
   pause takes 10–15% off what you can lift — so this column runs 65–75%, easy
   weeks 60%, and never goes above 75%. The speed squat is unchanged at 70%. */
const PQ = { 1: pqB("3 × 3 @ 65%", 65), 2: pqB("3 × 3 @ 68%", 68), 3: pqB("3 × 3 @ 70%", 70), 4: null, 5: pqB("2 × 3 @ 60% — easy week", 60, 2), 6: pqB("3 × 3 @ 70%", 70), 7: pqB("3 × 3 @ 72%", 72), 8: pqB("3 × 3 @ 75%", 75), 9: null, 10: pqB("2 × 3 @ 60% — easy week", 60, 2),
  11: pqB("SPEED 3 × 3 @ 70%", 70, 3, 3, 1), 12: pqB("SPEED 3 × 3 @ 70%", 70, 3, 3, 1), 13: pqB("SPEED 3 × 3 @ 70%", 70, 3, 3, 1), 14: pqB("SPEED 3 × 3 @ 70%", 70, 3, 3, 1), 15: pqB("2 × 2 @ 70%", 70, 2, 2), 16: null, 17: null, 18: pqB("2 × 3 @ 60% — reload", 60, 2) };
Object.keys(R).forEach((w) => { R[w].eng2 = ENG2[w] === undefined ? null : ENG2[w]; R[w].pq = PQ[w] || null; });

/* ---------------- CAMP MODE ----------------
   ON, the ten-week camp runs in place of Optimal 8 Fighter: its own
   dated week table, its own session pages, its own tests, counting from
   its own start date. OFF, the Fighter is exactly as it was.
   THE EDGE rides on PREP and CAMP: on unless the switch in settings is
   off, and off for the rest of any week the check records a second
   yellow morning in.                                                   */
const MODE = { program: "fighter", camp: false, lastTen: false, prep: false, trans: false, pre: false, spp: false, mac: null };
const EDGE = { manual: true, ready: {} };
/* What last week's log says about this week: Sunday's joint scores for
   the tendon gate, Tuesday's jump checks for the guardrail, and the
   profiles for the ballistic loads. Set from the app's state before
   anything reads a prescription. */
const GATE = { log: {}, profiles: null };
/* The season the builder made, rebuilt whenever a plan changes. Every
   prescription and every date reads it from here. */
const SEASON = { s: null };
/* OPTIMAL 8 · MOVE: the Monday its week 1 began, set from the settings */
const MOVE = { start: MOVE_SINCE };
const seasonRow = (mac, kw) => (SEASON.s ? rowByKey(SEASON.s, mac, kw) : null);
const prevRow = (row) => (row && SEASON.s && row.seq > 0 ? SEASON.s.rows[row.seq - 1] : null);
/* MOVE's standards, as the log keeps them: the test week's sheet, and the
   back hold from Sunday's session */
const moveVal = (lg, wkKey, id) => { const e = id === "mv11" ? lg[wkKey + "-sun-mv11"] : lg[wkKey + "-range-" + id]; return e ? e.w : ""; };
/* the last MOVE test before a row (the row's own week not counted) */
const lastMoveTest = (row) => { let r = prevRow(row);
  for (let i = 0; r && i < 40; i++, r = prevRow(r)) { const mw = r.mon ? moveWeekOf(r.mon, MOVE.start) : null; if (!mw) return null;
    if (isMoveTestWeek(mw)) return "m" + r.mac + "w" + r.kw; }
  return null; };
/* THE JEFFERSON CURL'S GATE, from the log: the last back hold and toe
   touch, and the four Sundays before this week with no back pain */
const jeffOn = (row) => { const k = lastMoveTest(row); if (!k) return false;
  const scores = []; let r = prevRow(row);
  for (let i = 0; r && i < 4; i++, r = prevRow(r)) { const e = GATE.log["m" + r.mac + "w" + r.kw + "-sun-wr_lb"]; scores.push(e ? e.w : ""); }
  return jeffersonGate({ backHold: moveVal(GATE.log, k, "mv11"), palms: moveVal(GATE.log, k, "mv5"), toeCm: moveVal(GATE.log, k, "mv5_cm"), backScores: scores }); };
/* OPTIMAL 8 · MOVE in every program: a row's MOVE week, its tendon week
   and the Jefferson curl's gate, by the row's Monday. Not under `mon`,
   which a row's ticks are dated by. */
const JEFF = new WeakMap();
const jeffMemo = (row) => { const h = JEFF.get(row); if (h && h.log === GATE.log && h.start === MOVE.start) return h.v;
  const v = jeffOn(row); JEFF.set(row, { log: GATE.log, start: MOVE.start, v }); return v; };
const moveOf = (row) => { const mw = row && row.mon ? moveWeekOf(row.mon, MOVE.start) : null;
  return { mw, tw: mw ? tendonWeekOf(row.mon) : 0, jeff: mw && movePhase(mw) === "own" ? jeffMemo(row) : false, au: auditOn(row && row.mon) }; };
/* the classic's weeks have no rows: its Monday is counted from its start.
   The audit's changes run by the same Monday, with or without MOVE. */
const classicMove = (rx, mac, w) => { const c = SEASON.cstart; if (!c || !c.start) return rx;
  const mon = iso(addWeeks(mondayOf(parseISO(c.start)), ((mac - c.base) * c.L) + (w - 1)));
  const mw = moveWeekOf(mon, MOVE.start), au = auditOn(mon);
  return mw || au ? Object.assign({}, rx, mw ? { mw, tw: tendonWeekOf(mon), jeff: false } : {}, au ? { au } : {}) : rx; };
/* which program a row runs */
const MAC_PROGRAM = { P: "prep", C: "camp", T: "transition", H: "transition", B: "camp", S: "spp" };
/* Point MODE at a row's program before anything reads a prescription.
   The weeks the head check holds (H) are the transition's. The Fighter
   keeps its macrocycle number, for the Sunday check it reads. */
function setModeFor(mac) {
  if (MAC_PROGRAM[mac]) {
    Object.assign(MODE, { program: MAC_PROGRAM[mac], prep: mac === "P", camp: mac === "C" || mac === "B", trans: mac === "T" || mac === "H", pre: mac === "B", spp: mac === "S", mac, fmac: null, lastTen: false });
  } else Object.assign(MODE, { program: "fighter", prep: false, camp: false, trans: false, pre: false, spp: false, mac: null, fmac: typeof mac === "number" ? mac : null });
}
const LASTTEN_INTRO = "Week table numbers stop; every lift goes to 2 sets at 70%, fast; no sprints, no depth jumps, no Nordics inside the last seven days; the jump circuit becomes box jumps only. The two power doses stay because they keep the nervous system sharp without costing anything. The last heavy thing you do is nine days out. The fuel plan's \"making weight\" section runs the food.";

const lastTenRx = (rx) => {
  const two = "2 sets @ 70% — fast";
  return Object.assign({}, rx, {
    sc: two, pct: 70, sets: 2, bsc: two, bsets: 2, topSq: 0, topBe: 0, upperC: 0,
    tb: { sc: two, sets: 2, reps: rx.tb && rx.tb.reps ? rx.tb.reps : 2, pct: 70 },
    pp: rx.pp && rx.pp.sc ? { sc: two, sets: 2, reps: rx.pp.reps || 2, pct: 70 } : rx.pp,
    pq: rx.pq ? { sc: two, sets: 2, reps: rx.pq.reps || 2, pct: 70, fast: 1 } : rx.pq,
    cr: 1, cpct: 70, boxOnly: 1, lastTen: 1,
  });
};
const baseRxFor = (w) => R[w] || R[1];
/* Fighter's one-arm landmine push press, from the audit's week: the week's
   push press sets and reps, each side; week 1, with no ramp to find a
   number, runs week 2's 4 × 3 */
const fLm = (rx) => (rx.pp && rx.pp.sc ? { sets: rx.pp.sets || 4, reps: rx.pp.reps || 3 } : { sets: 0, reps: 0 });
/* A week of the season, as the builder writes it. The block phase names
   the week; the lift phase names what the bar does inside it. */
const seasonRxFor = (mac, w, edge) => {
  const row = seasonRow(mac, w);
  if (!row) return mac === "P" ? Object.assign({}, prepRx(1), { w, lift: "slow", ph: "accumulate", doc: 1, prep: 1 }) : mac === "S" ? Object.assign({}, sppRx(1), { w, kw: w, doc: 1, spp: 1 }) : mac === "T" || mac === "H" ? transRx(w) : { w, ph: "c1", pre: 1 };
  const rx = rowRx(row, edge);
  if (row.program === "prep") return gated(Object.assign({}, rx, { w, kw: w, lift: rx.ph, ph: prepPhaseOf(rx.doc), bw: null, prep: 1 }, moveOf(row)), "P", w);
  if (row.program === "spp") { const mw = moveWeekOf(row.mon, MOVE.start);
    return gated(sppAudit(Object.assign({}, rx, { w, kw: w, bw: null, spp: 1, mon: row.mon, mw, jeff: mw && movePhase(mw) === "own" ? jeffOn(row) : false,
      eb: !!row.mon && row.mon >= ENGINE_SINCE, tw: mw ? tendonWeekOf(row.mon) : 0, au: !!row.mon && row.mon >= AUDIT_SINCE,
      /* the trim, from Monday 30 November (spp.js) */
      fit: !!row.mon && row.mon >= FIT_SINCE })), "S", w); }
  if (row.program === "camp" || row.program === "pre") return gated(Object.assign({}, rx, { kw: w }, moveOf(row)), "C", w);
  return Object.assign({}, rx, { kw: w }, moveOf(row));
};
/* THE TENDON GATE, from the Sunday check, separately from the colours:
   Achilles or knee at 3 or more — no reactive jumps next week, the tendon
   holds carried on; back under 3, the jumps restart one stage down for a
   week. Hamstring at 3 or more — no flying sprints, and the Nordics only
   if they're pain-free. And the ballistic rows load at the peak-power
   load the last profile found. */
const sundayScores = (mac, week, back) => {
  /* the week `back` weeks before (one, unless asked), whichever program it was */
  const n = back || 1;
  let pm, pw;
  const row = MAC_PROGRAM[MODE.mac || mac] ? seasonRow(MODE.mac || mac, week) : null;
  if (row) { let pr = row; for (let i = 0; i < n && pr; i++) pr = prevRow(pr); if (!pr) return {}; pm = pr.mac; pw = pr.kw; }
  else { if (week - n < 1) return {}; pm = mac; pw = week - n; }
  const pre = pm === "C" || pm === "B" ? "cwr_" : "wr_", at = (id) => (GATE.log["m" + pm + "w" + pw + "-sun-" + pre + id] || {}).w;
  return { ach: at("ach"), kn: at("kn"), ham: at("ham"), el: at("el"), sh: at("sh") };
};
function gated(rx, mac, week) {
  const sc = sundayScores(mac, week), g = tendonGate(sc);
  const o = Object.assign({}, rx, { btPct: ballisticPct(GATE.profiles, "bthrow"), tjPct: ballisticPct(GATE.profiles, "tbjump") });
  if (rx.jump) {
    if (g.noJumps) Object.assign(o, { noJumps: 1 });
    else if (tendonGate(sundayScores(mac, week, 2)).noJumps) Object.assign(o, { jump: stageDown(rx.jump), restart: 1 });
  }
  if (g.noFlying) Object.assign(o, { noFlying: 1, speed: false, nordicPF: 1 });
  /* Achilles or knee at 3 or more: the lower pushes carry on at 7 out of 10 */
  if (g.noJumps) o.pushGate = 1;
  /* an elbow or a shoulder at 4 or more: next week's dips become push-ups and
     the circuits drop their curls and triceps work */
  if (Number(sc.el) >= 4) o.elbow4 = 1;
  if (Number(sc.sh) >= 4) o.sh4 = 1;
  if (o.elbow4 || o.sh4) o.upper4 = 1;
  return o;
}
/* Tuesday's jump check: the best height against the four Tuesdays before */
const JUMP_ID = { P: "p_jumpbj", C: "c_jumpbj" };
const jumpNum = (mac, w) => { const e = GATE.log["m" + mac + "w" + w + "-tue-" + JUMP_ID[mac]]; const n = e ? Number(String(e.w || "").replace(",", ".")) : NaN; return n > 0 ? n : null; };
const jumpAvg = (mac, week) => { const p = []; for (let w = Math.max(1, week - 4); w < week; w++) { const n = jumpNum(mac, w); if (n != null) p.push(n); } return p; };
const jumpFlag = (mac, week) => jumpYellow(jumpNum(mac, week), jumpAvg(mac, week));
const transRx = (w) => ({ w, ph: "trans", trans: 1, doc: w });
/* THE EDGE's guardrail: the day of the week (Monday 0) the second yellow
   morning fell on, or -1. The count is the week's own, so it starts again
   every Monday. */
const edgeCutFor = (week) => {
  const mac = MODE.mac || (MODE.prep ? "P" : "C");
  const jy = jumpFlag(mac, week);
  return edgeCutIndex(DAYS.map((d) => { const l = EDGE.ready[dayKey(mac, week, d)] || "";
    return d === "tue" && jy && l !== "R" ? "Y" : l; }));
};
/* Is the edge on for this day? With no day — the plan views — it is
   whatever the switch in settings says. */
const edgeOnFor = (week, day) => {
  if (!EDGE.manual) return false;
  if (!day) return true;
  const cut = edgeCutFor(week);
  return cut < 0 || DAYS.indexOf(day) < cut;
};
const rxFor = (w, day) => {
  if (MODE.mac) return seasonRxFor(MODE.mac, w, MODE.trans || MODE.pre ? true : edgeOnFor(w, day));
  let rx = baseRxFor(w); if (MODE.lastTen) rx = lastTenRx(rx);
  /* the Fighter's Sunday check gates its reactive jumps the same way */
  return MODE.fmac != null ? gated(classicMove(rx, MODE.fmac, w), MODE.fmac, w) : rx;
};
/* the running program's line for a week — the header, the day and the
   week map all read this one */
const titleFor = (week) => { const row = MODE.mac ? seasonRow(MODE.mac, week) : null;
  return programTitle(MODE.program, row ? row.idx || week : week, (PH[rxFor(week).ph] || {}).n); };

/* ---------- timer step builders ---------- */
const STOP_STEP = "Past the fight: log this round on the card. Under " + STOP_PCT + "% of round one, or your posture gone, and it was the last.";
function steps(kind, o) {
  const S = [], W = (l, s, c) => S.push({ l, s, t: "w", c }), Rs = (l, s, c) => S.push({ l, s, t: "r", c });
  /* the steady pace between a round's bursts: shown as a rest, timed and sounded as part of the round */
  const Rin = (l, s, c) => S.push({ l, s, t: "r", c, inR: true });
  o = o || {};
  if (kind === "sim") { const r = o.rounds || 6, rest = o.rest == null ? 60 : o.rest;
    for (let i = 1; i <= r; i++) { if (o.arms) { W("RD " + i + " · MIN 1 — ASSAULT BIKE, ARMS ONLY", 60, "Feet on the pegs."); W("RD " + i + " · MIN 2 — ASSAULT BIKE, ARMS AND LEGS", 60, "Feet back on the pedals."); }
      else { W("RD " + i + " · MIN 1 — SKIERG", 60); W("RD " + i + " · MIN 2 — ASSAULT BIKE", 60); }
      W("RD " + i + " · MIN 3 — " + (i % 2 ? "LANDMINE PUNCHES" : "MED-BALL SLAMS") + (o.max3 ? " · MAXIMAL" : ""), 60); if (i < r && rest > 0) Rs("REST — ROUND-RECOVERY BREATHING · 2 SIGHS, THEN IN 3 OUT 6", rest); } }
  else if (kind === "vo2") { const r = (o.n || 4) - (o.short ? 1 : 0);
    /* Strength, Power and Physique's 4 × 4 runs its own easy minutes either side */
    if (o.wu) Rs("EASY — " + o.wu + " MINUTES", o.wu * 60);
    for (let i = 1; i <= r; i++) { W("INTERVAL " + i + " — 90–95% HRMAX", 240); if (i < r) Rs("EASY", 180); }
    if (o.cd) Rs("EASY — " + o.cd + " MINUTES TO FINISH", o.cd * 60); }
  else if (kind === "lac") { const blocks = o.blocks || 2, base = o.reps || 3;
    for (let b = 1; b <= blocks; b++) { const reps = o.short && b === blocks ? base - 1 : base;
      for (let i = 1; i <= reps; i++) { W("BLOCK " + b + " · REP " + i + " — MAX", 40); if (i < reps) Rs("REST", 80); }
      if (b < blocks) Rs("BETWEEN BLOCKS", 300); } }
  else if (kind === "mod") { for (let i = 1; i <= 4; i++) { W("INTERVAL " + i + " — SHORT SENTENCES POSSIBLE", 180); if (i < 4) Rs("EASY", 180); } }
  else if (kind === "tempo") { const n = o.reps || 10; for (let i = 1; i <= n; i++) { W("MINUTE " + i + " OF " + n + " — HARD BUT CONTROLLED, ~70%", 60); if (i < n) Rs("EASY", 60); } }
  else if (kind === "thr") { for (let i = 1; i <= 2; i++) { W("THRESHOLD " + i + " — SHORT PHRASES ONLY", 480); if (i < 2) Rs("EASY", 180); } }
  else if (kind === "bursttest") { for (let i = 1; i <= 10; i++) { W("BURST " + i + " OF 10 — FLAT OUT", 6, i === 1 ? "Write this one down." : i === 10 ? "Write this one down — the last against the first." : ""); if (i < 10) Rs("EASY · " + i + " OF 10 DONE", 30); } }
  else if (kind === "ergrounds") { const r = o.rounds || 7, rest = o.rest == null ? 60 : o.rest, len = (o.mins || 3) * 60;
    for (let i = 1; i <= r; i++) { W("ROUND " + i + " OF " + r + " — FIGHT PACE", len, i === 1 || i === r ? "Write this round's output down." : "");
      if (i < r) Rs("THE CORNER MINUTE — 2 SIGHS, THEN NOSE ONLY, IN 3 OUT 6", rest, o.R && i > o.R ? STOP_STEP : "Stood up, hands off the knees."); } }
  else if (kind === "csim") { const rest = o.rest == null ? 60 : o.rest, third = Math.round((o.mins || 3) * 20);
    /* the double: one past the fight, five minutes easy, then the fight again */
    const parts = o.double ? [o.double.a, o.double.b] : [o.rounds || 6];
    /* past the fight's own rounds — and the whole second set of the double — the stop rule watches every round */
    const watched = (pi, i) => !!o.R && !o.pace && (pi > 0 || i > o.R);
    parts.forEach((r, pi) => {
      if (pi > 0) Rs("FIVE MINUTES EASY — THEN THE FIGHT AGAIN", (o.double.easy || 5) * 60, (watched(0, o.double.a) ? STOP_STEP + " " : "") + "Easy, nose only. The second half is your fight's rounds.");
      for (let i = 1; i <= r; i++) {
        const tag = (o.double ? (pi ? "SECOND · " : "FIRST · ") : "") + "RD " + i;
        if (o.pace) W((o.double ? tag : "ROUND " + i + " OF " + r) + " — FIGHT PACE", third * 3);
        else if (o.arms) { W(tag + " · FIRST THIRD — ASSAULT BIKE, ARMS ONLY", third, "Feet on the pegs."); W(tag + " · SECOND THIRD — ASSAULT BIKE, ARMS AND LEGS", third, "Feet back on the pedals."); W(tag + " · LAST THIRD — MED-BALL SLAMS OR THE BAG", third); }
        else { W(tag + " · FIRST THIRD — SKIERG", third); W(tag + " · SECOND THIRD — ASSAULT BIKE", third); W(tag + " · LAST THIRD — MED-BALL SLAMS OR THE BAG", third); }
        if (i < r) Rs("THE CORNER MINUTE — 2 SIGHS, THEN NOSE ONLY, IN 3 OUT 6", rest, watched(pi, i) ? STOP_STEP : "Stood up, hands off the knees. Relaxed jaw, shoulders down."); } }); }
  else if (kind === "rz") { /* repeat bursts — the flurry, trained. Strength, Power and Physique's
       Tuesday bursts give their own count and seconds, and easy minutes either side */
    const sets = o.sets == null ? 2 : o.sets, n = (o.n || 8) - (o.short ? 1 : 0);
    if (o.wu) Rs("EASY — " + o.wu + " MINUTES", o.wu * 60);
    for (let st = 1; st <= sets; st++) {
      for (let i = 1; i <= n; i++) {
        if (o.secs) W("BURST " + i + " OF " + n + " — FLAT OUT", o.secs, o.secs + " seconds, everything you have.");
        else W("SET " + st + " · BURST " + i + " OF " + n + " — ABSOLUTE MAXIMUM", 7, "6–8 seconds, everything you have.");
        if (i < n) Rs("EASY SPINNING · " + i + " OF " + n + " DONE", 40, BURST_RULE);
      }
      if (st < sets) Rs("5 FULL MINUTES EASY — BETWEEN SETS", 300, "Set " + st + " done. Sit up, nose breathe, let it refill.");
    }
    if (o.cd) Rs("EASY — " + o.cd + " MINUTES TO FINISH", o.cd * 60); }
  else if (kind === "pressure") { /* Strength, Power and Physique's pressure rounds: through each
       round a burst all out every `every` seconds, a steady pace between, then a minute's rest */
    const r = o.rounds || 3, every = o.every || 20, secs = o.secs || 5, n = Math.floor((o.mins || 3) * 60 / every), rest = o.rest == null ? 60 : o.rest;
    if (o.wu) Rs("EASY — " + o.wu + (o.wu === 1 ? " MINUTE" : " MINUTES"), o.wu * 60, "Then round 1: a burst every " + every + " seconds, a steady pace between.");
    /* from Monday 23 November the last third of every round is arms only,
       feet on the assault bike's pegs */
    const arm0 = o.arms ? Math.floor(n * 2 / 3) : n;
    for (let i = 1; i <= r; i++) {
      for (let j = 1; j <= n; j++) {
        const arms = j > arm0;
        W("BURST " + j + " OF " + n + (arms ? " — ARMS ONLY, ALL OUT" : " — ALL OUT"), secs, secs + " seconds, everything you have.");
        Rin("ROUND " + i + " OF " + r + (arms ? " · ARMS ONLY, STEADY — NEVER STOP" : " · STEADY — NEVER STOP"), every - secs,
          o.arms && j === arm0 ? "Next burst: feet on the pegs, arms only, to the end of the round." : arms ? "Feet on the pegs. The arms keep working." : "A pace you could hold for the round.");
      }
      if (i < r) Rs("REST — " + (rest === 60 ? "1 MINUTE" : rest + " SECONDS"), rest, "Round " + i + " done. Next, round " + (i + 1) + ".");
    }
    if (o.cd) Rs("EASY — " + o.cd + (o.cd === 1 ? " MINUTE" : " MINUTES TO FINISH"), o.cd * 60, o.arms && o.cd === 1 ? "Clear the bike's screen. Next: the arms-only test." : undefined); }
  else if (kind === "armtest") { /* three minutes on the arms alone for the biggest total, then easy */
    W("ARMS ONLY — " + (o.mins || 3) + " MINUTES, THE BIGGEST TOTAL YOU CAN MAKE", (o.mins || 3) * 60, "Feet on the pegs, legs still. Start hard and hold on.");
    if (o.cd) Rs("EASY — " + o.cd + " MINUTES TO FINISH", o.cd * 60, "Log the total on the screen and your peak heart rate."); }
  else if (kind === "nasal") { for (let i = 1; i <= 4; i++) W("NOSE ONLY · MIN " + (i * 2 - 1) + "–" + i * 2 + " — RAISE THE PACE", 120); }
  else if (kind === "settle") { W("EYES CLOSED — FIND THE BREATH AT THE NOSTRILS", 60); }
  else if (kind === "postmax") { W("SIT · EYES CLOSED · FIND THE BREATH AT THE NOSTRILS", 180); }
  else if (kind === "recovery") { W("STAND UP · HANDS OFF THE KNEES", 4);
    for (let i = 0; i < 2; i++) { W("SIGH " + (i + 1) + " — FULL BREATH IN, SHORT SIP, LONG EXHALE", 10); }
    for (let i = 0; i < 4; i++) { W("NOSE ONLY — IN 3, OUT 6", 9); } }
  else if (kind === "z2") { W(o.label || "ZONE 2 — CONVERSATIONAL", (o.min || 30) * 60); }
  else if (kind === "contrast") { const r = o.rounds || 3, items = o.items || ["BACK SQUAT — 2 REPS", "BOX JUMP ×3", "TRAP BAR JUMP ×3"];
    for (let i = 1; i <= r; i++) { items.forEach((it, j) => { W("RD " + i + " · " + it, j === 0 ? 40 : 20); if (j < items.length - 1) Rs("20s", 20); }); if (i < r) Rs("BETWEEN ROUNDS", o.rest || 165); } }
  else if (kind === "vec") { const r = o.rounds || 3, ex = ["SHOT-PUT 4/SIDE", "DIAGONAL 4/SIDE", "HOOK THROW 4/SIDE", "LANDMINE PUNCH 5/SIDE"];
    for (let i = 1; i <= r; i++) { ex.forEach((e, j) => { W("RD " + i + " · " + e, 40); if (j < ex.length - 1) Rs("45s", 45); }); if (i < r) Rs("BETWEEN ROUNDS", 90); } }
  else if (kind === "iso") { for (let s = 1; s <= 3; s++) { for (let i = 1; i <= 3; i++) { W("SET " + s + " · REP " + i + " — MAX INTENT", 3); if (i < 3) Rs("15s", 15); } if (s < 3) Rs("BETWEEN SETS", 120); } }
  else if (kind === "cluster") { const n = o.sets || 5, lab = (o.lift || "THE BAR") + (o.pct ? " @ " + o.pct : "");
    for (let i = 1; i <= n; i++) {
      W("SET " + i + " OF " + n + " · 2 REPS — " + lab + ", FAST", 12);
      Rs("ON THE PINS — 20 SECONDS", o.pin || 20, "The bar down. Breathe. Two more.");
      W("SET " + i + " OF " + n + " · 2 MORE — FAST", 12, "A rep under the threshold ends the set.");
      if (i < n) Rs("BETWEEN SETS", o.rest || 180); } }
  else if (kind === "drivepunch") { const r = o.rounds || 3;
    for (let i = 1; i <= r; i++) { W("ROUND " + i + " · DRIVE HOLD — FROM YOUR STANCE", 10, "Through the rear leg, the trunk braced, breathing out.");
      W("ROUND " + i + " · PUNCH HOLD — LEAD HAND", 4, "Wrist dead straight, the arm just short of straight.");
      W("ROUND " + i + " · PUNCH HOLD — REAR HAND", 4);
      if (i < r) Rs("REST", 30); } }
  else if (kind === "hold") { const r = o.sets || 3; for (let i = 1; i <= r; i++) { W((o.label || "HOLD") + " " + i, o.secs || 20); if (i < r) Rs("REST", o.rest || 30); } }
  /* a circuit, or Monday's pair: every exercise said as it starts, the next
     one named in the gap, the round's rest after it. An exercise with an
     upto runs in that many rounds only. */
  else if (kind === "circuit") { const r = o.rounds || 3, its = o.items || [], btw = o.between == null ? 20 : o.between;
    for (let i = 1; i <= r; i++) {
      const here = its.filter((it) => !it.upto || i <= it.upto);
      here.forEach((it, j) => { W("RD " + i + " · " + it.l, it.s || 40); if (j < here.length - 1) Rs("NEXT · " + here[j + 1].l, btw); });
      if (i < r) Rs("ROUND " + i + " DONE — REST", o.rest || 90, "Next: " + its.filter((it) => !it.upto || i + 1 <= it.upto).map((it) => it.l.toLowerCase()).join(", ") + ".");
    } }
  /* a rest with the power block's jumps or throws in it: 90 seconds, the
     three, then two minutes */
  else if (kind === "rest") { if (o.then) { Rs("REST — THEN " + String(o.then).split(" — ")[0], o.a || 90); W(o.then, o.w || 15); Rs("REST", o.b || 120); } else Rs("REST", o.secs || 90); }
  return S;
}

/* ---------- v1.4's functional layer, written once ---------- */
const GETUP_N = "Turkish get-up";
const GETUP_S = "2 per side, light — lie on your back with a kettlebell pressed up in the right hand, right knee bent, left arm and leg out at 45°. Roll up onto the left elbow, then the left hand; lift the hips high, sweep the left leg back under you to a kneeling position, windmill the trunk upright, stand up — the bell never stops pointing at the ceiling and your eyes never leave it. Then reverse every step to the floor. That's one.";
const GETUP_LOAD_N = "Loading";
const GETUP_LOAD = "start with 8–12 kg; 16 is the working weight; 24 is the test";
const GETUP_WHY = "Slow, and nothing about it is a strength move on a Saturday morning — it's the whole body agreeing on how to get off the floor, and the best shoulder-and-hip integration lift there is.";
const CRAWL_N = "Bear crawls · 2 min";
const CRAWL_S = "on hands and feet, knees an inch off the floor and staying there, back flat as a table, opposite hand and foot moving together, small steps. 10 metres forward, 10 metres backward, four times.";
const CRAWL_WHY = "Loads the shoulder and trunk in a pattern the body hasn't done since you were two, and it's the bridge between the handstand and the get-up.";

/* ---------- protocols (written once, referenced by name) ---------- */
const PROTO = {
  SH: { n: "Warm-up · shoulders", s: "8 min · Mon", c: C.cobalt, note: "The bench ramp is part of the warm-up — rest about a minute between those sets, so the first working set is already warm.",
    i: [["Back on the floor, feet on a bench", "5 breaths — in 4s, out 8s"], ["Band pull-apart", "×20 — arms straight, pull until it touches your chest"], ["Band external rotation", "×15/arm — elbow pinned to the ribs"], ["Wall slide", "×10 — forearms never leave the wall"], ["BENCH RAMP", ""], ["Bar", "×10"], ["40%", "×5"], ["60%", "×3"], ["75%", "×2"]] },
  HIP: { n: "Warm-up · get-ups, hips + build-ups", s: "16 min · Sat", c: C.cobalt, note: "Never sprint cold. The get-up opens it; the three build-ups are the sprint warm-up. The squat warm-up sets are not here — they sit inside the squat step, forty minutes later, because forty minutes of sprinting and jumping keeps you warm but it doesn't keep the squat pattern rehearsed.",
    i: [["TURKISH GET-UP · 2 PER SIDE, LIGHT · 4 MIN", ""], [GETUP_N, GETUP_S], [GETUP_LOAD_N, GETUP_LOAD], ["THEN THE HIPS", ""],
      ["90/90 switches", "×5 each way"], ["Hip airplane", "×5/side"], ["Cossack squat", "×6/side"], ["Leg swings", "×10 each — forward-back, then side-to-side"], ["Pogo hops", "2 × 20"], ["SPRINT BUILD-UPS", ""], ["20m @ 60%", "×1"], ["20m @ 75%", "×1"], ["20m @ 90%", "×1"]] },
  GEN: { n: "Warm-up", s: "6 min · Wed", c: C.cobalt, note: "Wednesday adds the trap bar and squat warm-up sets (bar × 5 · 50% × 3 · 65% × 2, then 40% × 3 · 60% × 2).",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"]] },
  GEN8: { n: "Warm-up · crawls", s: "8 min · Tue and Thu", c: C.cobalt, note: "Thursday's warm-up is the same as Tuesday's, bear crawls included.",
    i: [["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"],
      ["THEN BEAR CRAWLS · 2 MIN", ""], [CRAWL_N, CRAWL_S], ["Slow beats fast", "if the hips rock or the knees lift, you've gone too quick"]] },
  SUNWU: { n: "Warm-up · get-ups + practice throws", s: "14 min · Sun", c: C.cobalt, note: "Turkish get-ups, then Tuesday's warm-up without the crawls, then the power prep and three easy practice throws of each of the four throws.",
    i: [["TURKISH GET-UP · 2 PER SIDE, LIGHT · 4 MIN", ""], [GETUP_N, GETUP_S], [GETUP_LOAD_N, GETUP_LOAD],
      ["THEN TUESDAY'S WARM-UP, WITHOUT THE CRAWLS", ""],
      ["Easy bike", "3 min"], ["Band pull-apart", "×20"], ["Goblet squat", "×8"], ["Push-up", "×10"], ["90/90 hip switch", "×5 each way"], ["Pogo hops", "×20"],
      ["PLUS", ""], ["Broad jumps", "3 × 2"], ["Med-ball chest passes", "3 × 3 as hard as you can"], ["Bike sprints", "3 × 10 seconds with a minute between"], ["Practice throws", "three EASY throws of each of the four throws"]] },
  CUFF: { n: "Shoulder circuit + band catch", s: "8 min · Mon · 2 rounds, rest 45s", c: C.violet, note: "Every right hand you throw, this muscle group has to brake your arm. This is the only place it gets trained to.",
    i: [["Side-lying external rotation", "12/side — top elbow glued to the ribs"], ["Prone T raise", "×10 — face down on an incline bench, thumbs up"], ["Face pull", "×15 — elbows high, squeeze the back of the shoulders"], ["Wall slide", "×10"], ["BAND DECELERATION CATCH", ""], ["Punch out fast, brake the return", "2 × 8/arm — stop it dead in the last third"]] },
  NECK: { n: "Neck", s: "10 min · Wed and Thu", c: C.violet,
    note: "A stronger, stiffer neck measurably reduces how much your head accelerates when hit. Whether that prevents concussion is not proven. Cheap bet, sound mechanism — and it is not armour: it changes nothing about what you take in sparring.",
    i: [["4-direction holds", "3 × 10s each — palm hard against the forehead and push, the head never moves. Then the back of the head, then each side."], ["Rapid tense", "3 × 6/direction — band resting light pressure on your head, snap from fully relaxed to fully braced in under a second, hold 2s, relax"], ["Perturbation hold", "3 × 20s — band anchored to the rack, brace neutral, tug it in small random pulses from different angles. The head does not move."], ["Catch", "2 × 6/direction — let the band start to pull your head toward the anchor, then stop it dead in the last third"]] },
  HANDS: { n: "Hands", s: "5 min · Tue and Sun", c: C.violet,
    note: "The most common boxing injury is a wrist folding under impact. Five minutes of insurance. Your job covers your grip — no grip work in here.",
    i: [["Knuckle hold", "3 × 20s — push-up position on your fists on a mat, wrist dead straight so forearm and knuckles make one line. Firmer surface over the weeks, the wrist dead straight throughout."], ["Band wrist extension", "2 × 15 — forearm on your knee, palm down, lift the knuckles toward you"]] },
  CALF: { n: "Seated calf raise + Achilles hold", s: "5 min · Tue", c: C.violet,
    note: "The hold is the tendon block, part one. Muscle gets strong in weeks; tendon gets stiff in months, and a heavy still hold is the best-proven way to hurry it. Your Achilles takes every sprint and every depth jump on Saturday. Forty-five seconds a week is the insurance.",
    i: [["Seated calf raise", "3 × 12 · rest 60s — up on the balls of the feet, pause, down slow"],
      ["Achilles hold — STANDING", "one × 45s — on the edge of a step, both feet, a dumbbell in each hand or a bar on your back, as heavy as you can hold dead still. Rise to the top and hold. Knees straight, no bouncing, no sinking."],
      ["Straight knee", "that is the position the Achilles takes every sprint and every landing; a seated hold loads a different muscle into the same tendon and does less for it"]] },
  SPAN: { n: "Spanish squat hold", s: "3 min · Thu", c: C.violet,
    note: "The tendon block, part two: the patellar tendon, which takes every depth jump and every box landing. Same logic as the Achilles hold — a heavy, still, painless load is what makes tendon stiff, and stiff tendon is what turns strength into speed without tearing.",
    i: [["Spanish squat hold", "3 × 30s · rest 30s"],
      ["Set-up", "a thick band around the back of both knees, anchored to the rack in front of you at knee height"],
      ["The hold", "lean back into the band so your shins stay vertical, sit into a half squat — thighs around 45° — and hold, dead still, for 30 seconds"],
      ["It should burn above the kneecap", "it should never hurt inside the knee"]] },
  SPLIT: { n: "Split squat, rear foot elevated", s: "7 min · Thu", c: C.violet,
    note: "Moved here from Saturday: 24 hours after the heavy lower morning, 48 before Saturday's sprints, and before the bike so the reps are clean.",
    i: [["Rear-foot-elevated split squat", "3 × 6–8 each leg · rest 60s (easy weeks and weeks 15–16: 2 sets)"], ["Weak side first", "same weight on both legs — the weaker leg sets the load"], ["Loading", "start at a weight you could do 10 with; add when 8 is clean"]] },
  VEC: { n: "The four punch throws", s: "rest 45s between exercises · 90s between rounds", c: C.brass,
    note: "Straight punches are built on forward drive; hooks on rotation. They're different physical problems, so all four get trained. Ball 3–5 kg: if it isn't flying, it's too heavy. Both sides equally.",
    i: [["Rotational shot-put", "4/side — YOUR STRAIGHT RIGHT. Ball at the shoulder, side-on to a wall. Drive off the back hip, flat and hard. A few from a lower crouch for the body shot."], ["Downward diagonal throw", "4/side — YOUR OVERHAND RIGHT. Ball high outside the shoulder, drive it down and across toward the opposite hip. Back foot pivots, trunk turns AND side-bends."], ["Hook throw", "4/side — YOUR LEAD HOOK. Ball at chest height in bent arms, pivot hard off the lead leg and sling it sideways into the wall."], ["Landmine punch", "5/side — YOUR LOADED STRAIGHT. Drive the hips and PUNCH it up and away — never a slow press. Catch it, go again."]] },
  HOME: { n: "The home block", s: "the morning five · RANGE · the skill block", c: C.violet,
    note: "Two joints you named as your limiting factor: hips and shoulders. Both are limited first by the mid-back, so it goes first. Eight minutes a night was maintenance; this is change. Twenty minutes every evening for twelve weeks, five on waking, four tests every four weeks so the range is a number, then a ten-minute keep for life. Kit: a foam roller, a light band, a kettlebell or dumbbell (8–16 kg), a doorframe pull-up bar if you can fit one, a sofa and a chair. Balance skills are built by frequency: five minutes of handstand four evenings a week beats an hour of it on one. Tap the RANGE line on TODAY for the guided timer, move by move.",
    i: [["THE MORNING FIVE · ON WAKING · 5 MIN", ""],
      ["Controlled joint circles", "the slowest, biggest circle each joint can make under its own power, three each way — ten seconds a circle"],
      ["Neck · shoulders · mid-back · hips · ankles", "in that order, guided on TODAY"],
      ["RANGE · EVERY EVENING · 20 MIN · TWELVE WEEKS, THEN THE KEEP", ""],
      ["0 · Down-regulate", "1 min — on your back, feet on a chair, five slow breaths: in 4, out 8"],
      ["1 · Mid-back — first, always", "5 min — roller extensions, open book 90s/side, thread the needle, loaded rotation"],
      ["2 · Hips", "8 min — 90/90 2 min/side with the internal-rotation lift, couch stretch, cossacks, deep squat hold, hip airplanes"],
      ["3 · Shoulders", "6 min — hang, prayer stretch, sleeper, kettlebell arm bar, wall slides, band external rotations"],
      ["Three things move range", "long holds with a long exhale · contract-relax, five seconds at a third of your strength, three times · strength at the end of the range"],
      ["After twelve weeks — THE KEEP", "10 min — roller extensions, open book, the 90/90 with the lift, the couch stretch, the deep squat hold, the hang and the arm bar. Every evening, for good."],
      ["THE FOUR TESTS · WEEKS 1, 5, 9 AND 13", ""],
      ["90/90 sit · deep squat · wall flexion · hands behind the back", "on the Sunday weekly check — write the eight numbers down"],
      ["THE SKILL BLOCK · MONDAY TO THURSDAY · 6 MIN — after RANGE, before the sit", ""],
      ["Wrists first, always", "circles × 10 each way, then palms flat on the floor and rock forward and back × 10"],
      ["Handstand", "4 min at your level (the Calisthenics section in settings) — the body is one straight line, ribs in, glutes tight, pushing the floor away through the shoulders the whole time"],
      ["Hollow hold", "2 × 20s — on your back, lower back pressed into the floor, arms overhead, legs straight and lifted, one shallow banana"],
      ["Arch hold", "2 × 20s — face down, arms and legs lifted. The two shapes every calisthenics skill is made of."],
      ["Planche leans", "Tuesday and Thursday only, 3 × 15s — a push-up position, then shift the shoulders forward past the wrists as far as they'll go, arms locked, body rigid. Five seconds added per fortnight, never with an elbow that aches."],
      ["FRIDAY EVENING", ""],
      ["RANGE only", "no skill block"],
      ["If you skip it", "nothing shows this week. By week 6 the hips tighten back to where they were, the internal-rotation lift stops moving, and the tests say so in numbers."]] },
};
Object.assign(PROTO, CPROTO, PPROTO, SPPROTO, OPROTO);

/* v1.5 — thirty to forty easy nasal minutes on a weekend afternoon: the
   aerobic base that left with the Friday alarm, put back where it costs no
   sleep. Once a weekend, either day — so ticking it on one day clears both. */
const EASY_HOUR = {
  n: "THE EASY HOUR",
  s: "Thirty to forty minutes easy, nose only, at a pace you could hold a conversation at — a bike, a walk, a swim, whatever's there. Four-plus hours after the session.",
  why: "It's active recovery for legs that just sprinted, and it's the aerobic base that left with the Friday alarm, put back where it costs no sleep. Once a weekend, either day.",
  tag: "30–40 MIN · NOSE ONLY · ONCE A WEEKEND",
};

/* ================================================================
   SESSIONS — the seven pages, in running order, exactly as written.
   item: { n, s, cue, id, k: "wr" (sets) | "out" (one output) | "chk" (tick) | "txt", u, mk, pct, sets, reps, bwp }
   ================================================================ */
const v = (x, rx) => (typeof x === "function" ? x(rx) : x);
const heavy79 = (rx) => rx.w >= 7 && rx.w <= 9;
/* Weeks 4, 9 and 14: Thursday's bike opens with the nasal threshold test, and
   the interval session that follows runs one round short. */
const nasalWk = (rx) => rx.w === 4 || rx.w === 9 || rx.w === 14;
const engTimer = (key) => (rx) => { const e = rx[key]; const sh = key === "eng2" && nasalWk(rx) ? 1 : 0;
  return e === "vo2" ? { kind: "vo2", opt: { short: sh }, title: sh ? "VO2MAX · ONE SHORT" : "VO2MAX" } : e === "lac" ? { kind: "lac", opt: { short: sh }, title: sh ? "LACTATE · ONE SHORT" : "LACTATE" } : e === "rz" ? { kind: "rz", opt: { sets: 2, short: sh }, title: sh ? "REPEAT BURSTS · ONE SHORT" : "REPEAT BURSTS" }
    : e === "rz3" ? { kind: "rz", opt: { sets: 1 }, title: "REPEAT BURSTS · ONE SET" } : e === "easy" ? { kind: "z2", opt: { min: 20, label: "EASY ZONE 2" }, title: "EASY" } : { kind: "z2", opt: { min: 15, label: "EASY FLUSH" }, title: "EASY" }; };
const engMin = (key) => (rx) => (rx[key] === "easy" || rx[key] === "easy15" ? 20 : 24);

/* OPTIMAL 8 FIGHTER's own pages. Fighter was retired as a program on 23
   November 2026 and nothing runs these weeks any more; the table stays
   because the light session after head contact and a blank day's start
   time still read it. */
const S = {
  /* ---------------- MONDAY ---------------- */
  mon: { n: "MONDAY", t: "Upper Strength + Power Dose + Rings", m: 65, ac: C.oxide, box: 1,
    intro: "Upper strength and the first of the week's three power doses. Nothing is taken to failure.", b: [
    { L: "A", n: "Warm-up", m: 8, p: "SH" },
    { L: "B", n: "Bench Throw (Smith)", m: 11, star: 1, hard: 1, hide: (rx) => !!rx.upperC, rest: "Rest 2:00", rt: 120, spd: (rx) => !!rx.au, spdLine: SPLEEFT_FAST,
      items: [{ n: "Bench throw", s: (rx) => rx.throw[0] + " × " + rx.throw[1] + " @ ~⅓ of bench max", cue: "On a Smith machine with its safety stops set so the bar rests on them a couple of centimetres above your chest. Light bar: lower it to the stops, throw it so hard it leaves your hands, catch it with soft elbows, and lower it back to the stops. A missed catch lands on the stops, never on you.", id: "throw", k: "wr", mk: "bench", pct: [30, 45], sets: (rx) => rx.throw[0], reps: (rx) => rx.throw[1] }],
      w: (rx) => (rx.au ? SPLEEFT_FAST : "Stop the set the instant a throw is visibly lower than the last."),
      why: "This is your punch-speed lift. A normal bench decelerates through its last third to protect the elbows; throwing the bar removes the brake, and the safety stops catch a missed one. In weeks 11–14 it merges into the circuit below.",
      note: "No Smith machine with adjustable stops: throw a 4–6 kg medicine ball off your chest at a wall, 5 × 5, as hard as you can.", tr: 2 },
    { L: "C", n: "Power dose — box jumps", m: 6, star: 1, hard: 1, hide: (rx) => !!rx.test, rest: "Rest 60–90s", rt: 75,
      rxLine: () => "one minute of legs, then 3 × 3",
      items: [{ n: "First, one minute of legs", s: "pogo hops × 20 · bodyweight squats × 6 · two easy jumps onto a low step",
          cue: "The warm-up so far was all shoulders. Pogo hops × 20 — bounce on the balls of the feet, legs almost straight. Bodyweight squats × 6. Then two easy jumps onto a low step.", id: "legprep", k: "chk" },
        { n: "Box jump", s: "3 × 3", cue: "Choose the box by the landing, not the height — you should land on it in a quarter squat, knees soft, not folded to your chest. The training is the take-off; a higher box only makes you lift your knees faster. Quick dip, jump as high as you can, land soft on top, step down. Three perfect jumps, never three tired ones.", id: "boxjump", k: "chk" }],
      why: "Explosiveness responds to how often the nervous system is asked, not how much. Five minutes, three mornings a week." },
    { L: "D", n: (rx) => (rx.upperC ? "Upper Circuit — Bench + Throws" : "Bench Press"), m: 10, star: (rx) => !!rx.upperC, hard: 1, mainLift: "bench", fb: "bench",
      pres: (rx) => ({ sc: rx.upperC ? "4 rounds · 2 @ 85%" : rx.topBe ? rx.sets + " × " + rx.reps + " @ " + rx.pct + "%" : (rx.bsc || rx.sc), pct: rx.upperC ? 85 : rx.pct }),
      rest: (rx) => (rx.upperC ? "20s between elements · rest 2:30 between rounds" : heavy79(rx) ? "Rest 2:30" : "Rest 2:00"),
      rt: (rx) => (rx.upperC || heavy79(rx) ? 150 : 120),
      timer: (rx) => (rx.upperC ? { kind: "contrast", opt: { rounds: 4, rest: 150, items: ["BENCH — 2 @ 85%", "BENCH THROW ×3", "CLAP PUSH-UP ×3"] }, title: "UPPER CIRCUIT" } : null),
      items: (rx) => (rx.upperC
        ? [{ n: "Bench", s: "2 @ 85% · 4 rounds", cue: "Heavy wakes the system up.", id: "bench", k: "wr", mk: "bench", pct: 85, sets: 4, reps: 2 }, { n: "Bench throw", s: "×3", cue: "Fast uses it.", id: "uc_throw", k: "chk" }, { n: "Clap push-up", s: "×3", cue: "Overspeed.", id: "uc_plyo", k: "chk" }]
        : [{ n: "Bench press", s: rx.topBe ? rx.sets + " × " + rx.reps + " @ " + rx.pct + "%" : (rx.bsc || rx.sc), cue: "Pins at chest height, no collars. Controlled down, drive up hard. If a rep grinds, that set is over.", id: "bench", k: "wr", mk: "bench", pct: rx.pct, sets: rx.bsets || rx.sets, reps: rx.reps }]),
      w: "Pins at chest height. No collars, ever. The bench top triple happens on Sunday, fresh, first thing — never here.",
      note: (rx) => (rx.upperC ? "Weeks 11–14: steps 2 and 4 merge into one circuit, 4 rounds — 2 bench reps @ 85% → rest 20s → 3 bench throws → rest 20s → 3 clap push-ups → rest 2½ min."
        : rx.topBe ? "Top-triple week: the bench top triple is Sunday morning, first thing. Today is the back-off work." : ""),
      why: "Upper-body maximal force, which tracks punch impact in elite amateurs.", tr: 2 },
    { L: "E", n: "Ring Dips", m: 6, cal: "ringdip", rest: "Rest 90s", rt: 90, rxLine: () => "3 sets at your level",
      items: [{ n: "Ring dips — at your level", s: "3 sets", cue: "At the level most men start: support yourself at the top of a pair of rings, arms locked, rings still, then lower until your shoulders are level with your elbows and press back up, turning the rings so your palms face forward at the top.", id: "ringdip", k: "wr", sets: 3, reps: "at your level" }],
      w: "Elbow pain of any kind is a stop sign, not a challenge.",
      why: "Pressing is grouped on this morning on purpose — bench throw, bench, dips — so that the rest of the week's shoulders stay fresh for throws and push press. The rings are what make the shoulder bulletproof: every rep is the joint stabilising itself in three directions at once.", tr: 1 },
    { L: "F", n: "Weighted Chin-Up + The Muscle-Up Line", m: 9, cal: "muscleup", rest: "Rest 90s", rt: 90,
      rxLine: () => "3 × 5, then 2 sets of the muscle-up line",
      items: [{ n: "Weighted chin-up", s: "3 × 5", cue: "Wide grip, palms away (switch to a neutral grip if wide ever bothers your shoulders), weight on a belt or a dumbbell between your feet. Dead hang, chin over the bar, lower under control, no swinging. Add weight when all three sets are clean.", id: "chin", k: "wr", sets: 3, reps: 5 },
        { n: "The muscle-up line — at your level", s: "2 sets, bodyweight", cue: "At the first level that's chest-to-bar pull-ups — explosive, the bar touches the chest, elbows driving down and back — and it climbs through muscle-up negatives to the strict bar muscle-up and the ring muscle-up. It's a skill, not a grind: two crisp sets, never a third.", id: "muscleup", k: "wr", sets: 2, reps: "at your level" }],
      why: "Pulling strength protects the shoulders that throw a thousand punches a week; the muscle-up is pulling power, the same quality that snaps a hand back.", tr: 1 },
    { L: "G", n: "Chest-Supported Row", m: 7, rest: "Rest 75s", rt: 75,
      items: (rx) => [{ n: "Chest-supported row", s: (rx.acc <= 2 ? 3 : 4) + " × 8", cue: "Lie chest-down on an incline bench with dumbbells. Row until your elbows pass your body, pause one second at the top, lower slow.", id: "csrow", k: "wr", sets: rx.acc <= 2 ? 3 : 4, reps: 8 }],
      why: "Four sets so your pulling matches your pressing. A boxer's shoulders live or die on that balance.", tr: 1 },
    { L: "H", n: "Shoulder Circuit + Band Catch", m: 8, p: "CUFF",
      items: [{ n: "Circuit + band deceleration catch", s: "2 rounds · then 2 × 8/arm", id: "catch", k: "chk" }],
      why: "Every right hand you throw, this muscle group has to brake your arm. This is the only place it gets trained to." }] },

  /* ---------------- TUESDAY ---------------- */
  tue: { n: "TUESDAY", t: "Crawls · Jumps · Pistols · Engine 1 · Hands · Trunk · Achilles", m: (rx) => (rx.test ? 34 : rx.eng === "easy" ? 61 : 65), ac: C.cobalt, box: 1,
    intro: "Power dose first, fresh, then the first of the week's two engine sessions. Your legs had yesterday off.", b: [
    { L: "A", n: "Warm-up + bear crawls", m: 8, p: "GEN8", rxLine: () => "8 min · bike, bands, hips, pogos — then bear crawls, 2 min",
      items: [{ n: CRAWL_N, s: "10m forward, 10m backward, × 4", cue: CRAWL_S + " Slow beats fast: if the hips rock or the knees lift, you've gone too quick.", id: "crawl", k: "wr", sets: 4, reps: 20 }],
      why: CRAWL_WHY },
    { L: "B", n: "Power dose — jumps", m: 8, star: 1, hard: 1, hide: (rx) => !!rx.test, rest: "Rest 90s", rt: 90,
      items: [{ n: "Broad jump", s: "3 × 2", cue: "Two-foot jump forward for distance, stick the landing dead still.", id: "broad", k: "chk" },
        { n: "Trap bar jump", s: (rx) => (rx.cal ? "3 × 3 — empty bar (week 1)" : "3 × 3 @ 20% of trap bar max"), cue: "Stand inside the bar, jump with it, land soft.", id: "tbjump2", k: "chk" }],
      why: "The second of three weekly power doses. Fresh legs, before the bike — never after." },
    { L: "C", n: "The Pistol Line", m: 5, cal: "pistol", hide: (rx) => !!rx.test, rest: "Rest 60s", rt: 60, rxLine: () => "2 sets of 5 per leg at your level",
      items: [{ n: "The pistol line — at your level", s: "2 × 5 per leg", cue: "At the level most men start: stand on one leg in front of a box or bench, the other leg held straight out in front, sit down to the box under control and stand back up without touching the floor with the free foot. The line climbs through the assisted pistol (fingertips on a post) to the full pistol, then the weighted pistol, with the shrimp squat as a rotation.", id: "pistol", k: "wr", sets: 2, reps: "5/leg" }],
      w: "Two sets, never to failure, never sore: Saturday's sprints are four days away, Wednesday's heavy lower is tomorrow, and this block is control, not load.",
      why: "The split squat on Thursday is the loaded single-leg strength. This is the unloaded single-leg skill — balance, ankle, knee tracking, the pivot foot learning to own the whole body." },
    { L: "D", n: (rx) => (ENG[rx.eng] ? ENG[rx.eng].n : "Bike session"), m: engMin("eng"), star: 1, hard: 1, eng: 1, menu: 1, hide: (rx) => !rx.eng, timer: engTimer("eng"),
      items: [{ n: "Output", s: "write it down", id: "cond", k: "out", u: "output / peak HR" }],
      note: (rx) => (rx.au ? "The bike, all 16 weeks, so your numbers compare. Write down your output." : "Bike or SkiErg — pick one and keep it all 16 weeks so your numbers compare. Write down your output.") },
    { L: "E", n: "The 60-Second Settle", m: 1, settle: 1, hide: (rx) => !rx.eng || !!rx.test, timer: () => ({ kind: "settle", title: "THE SETTLE" }), rxLine: () => "60 seconds — log the seconds to land",
      items: [{ n: "Seconds to land on the breath", s: "write it down", id: "settle", k: "out", u: "seconds" }],
      why: "This is the corner between rounds, trained, for nothing, every Tuesday and Thursday." },
    { L: "F", n: "Hands", m: 5, p: "HANDS", timer: () => ({ kind: "hold", opt: { sets: 3, secs: 20, rest: 30, label: "KNUCKLE HOLD" }, title: "HANDS" }),
      items: [{ n: "Knuckle hold + wrist extension", s: "3 × 20s · 2 × 15", id: "hands", k: "chk" }] },
    { L: "G", n: "Trunk", m: 9, hide: (rx) => !!rx.test, rest: "Rest 45s between exercises", rt: 45,
      items: [{ n: "Pallof press", s: "3 × 10/side · 2s hold", cue: "Band at chest height, anchored beside you. Press your hands straight out and hold two seconds without letting it twist you. Your trunk is what turns leg drive into hand speed, and it has to be stiff to transmit it.", id: "pallof", k: "wr", sets: 3, reps: "10/side" },
        { n: "Ab wheel rollout", s: "3 × 8–12", cue: "Knees down, roll out only as far as your lower back remains flat, pull back.", id: "abwheel", k: "wr", sets: 3, reps: "8–12" },
        { n: "Copenhagen plank", s: "2 × 30s/side", cue: "Side plank with your top foot up on a bench, bottom leg lifted off the floor. Groin strength — the muscles you pivot off.", id: "copen", k: "wr", sets: 2, reps: 30 }] },
    { L: "H", n: "Seated Calf Raise + Achilles Hold", m: 5, p: "CALF", hide: (rx) => !!rx.test, rest: "Rest 60s", rt: 60,
      rxLine: () => "3 × 12, then one 45-second hold",
      timer: () => ({ kind: "hold", opt: { sets: 1, secs: 45, label: "ACHILLES HOLD — STANDING, STRAIGHT KNEE" }, title: "ACHILLES HOLD" }),
      items: [{ n: "Seated calf raise", s: "3 × 12", cue: "Seated machine, or a barbell padded across your knees. Up on the balls of the feet, pause, down slow, twelve times — seated, because the knee-bent position trains the muscle that keeps you on your toes in round six.", id: "soleus", k: "wr", sets: 3, reps: 12 },
        { n: "Achilles hold — STANDING", s: "one × 45 seconds", cue: "The hold is STANDING: on the edge of a step, both feet, a dumbbell in each hand or a bar on your back, as heavy as you can hold dead still — rise to the top and hold 45 seconds, knees straight, no bouncing, no sinking. Straight knee, because that is the position the Achilles takes every sprint and every landing; a seated hold loads a different muscle into the same tendon and does less for it.", id: "achilles", k: "wr", sets: 1, reps: 45 }],
      why: "The hold is the tendon block, part one. Muscle gets strong in weeks; tendon gets stiff in months, and a heavy still hold is the best-proven way to hurry it. Your Achilles takes every sprint and every depth jump on Saturday. Forty-five seconds a week is the insurance." }] },

  /* ---------------- WEDNESDAY ---------------- */
  wed: { n: "WEDNESDAY", t: "Sled · Trap Bar · Pause Squat · RDL · Neck · Ring Rows", m: (rx) => (rx.pq ? 60 : 50), ac: C.oxide, box: 1,
    intro: "The heavy lower morning. Sled first while the nervous system is freshest, then the pulls, then the second squat exposure. Nothing to failure. The hamstring work that leaves you sore is on Sunday, not here.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN", note: "Then trap bar warm-up sets (bar × 5 · 50% × 3 · 65% × 2) and squat warm-up sets (40% × 3 · 60% × 2)." },
    { L: "B", n: "Heavy Sled Sprints", m: 16, star: 1, hard: 1, rest: "Rest 2:30–3:00", rt: 165,
      items: [{ n: "Heavy sled sprint 20m", s: (rx) => rx.sled + " × 20m @ 40–60% of bodyweight", cue: "Lean into it at about 45°, and sprint 20 metres driving the ground backwards through your whole foot.", id: "sled", k: "out", u: "load (kg) · time (s)", bwp: [40, 60], bwl: "on the sled" }],
      silent: { n: "THE SILENT SLED — when it's the week's test",
        s: "No music. Count your exhales through every run.",
        mind: { id: "sled_mind", n: "Exhale attention broke on" }, body: { id: "sled_body", n: "Run the legs broke on" } },
      rxLine: (rx) => rx.sled + " × 20m", w: "Get the load right by the clock: each 20m run should take 5–7 seconds. Faster — add weight. Slower — take some off.",
      why: "This is forward pressure — your fighting style with resistance on it. First in the session, before the lifts, while the nervous system is freshest.", tr: 3 },
    { L: "C", n: "Trap Bar Deadlift", m: 12, hard: 1, mainLift: "tbdl", calib: "tbdl", fb: "tbdl",
      rest: (rx) => (heavy79(rx) ? "Rest 2:30" : "Rest 2:00"), rt: (rx) => (heavy79(rx) ? 150 : 120),
      ramp: { n: "Trap bar warm-up sets", pcts: [[50, 3], [65, 2]] },
      items: [{ n: "Trap bar deadlift", s: (rx) => rx.tb.sc, cue: "Stand inside the bar, grip the handles, flat back, drive the floor away FAST. No grinding, no slow reps — set the bar down and end the set if speed drops.", id: "tbdl", k: "wr", mk: "tbdl", pct: (rx) => rx.tb.pct, sets: (rx) => rx.tb.sets, reps: (rx) => rx.tb.reps }],
      why: "At 3am this is the one heavy lift allowed: nothing passes over your body, and a rep that isn't there gets set down, not fought.", tr: 2 },
    { L: "D", n: (rx) => (rx.pq && rx.pq.fast ? "Speed Squat" : "Pause Squat"), m: 10, hard: 1, mainLift: "squat", pres: (rx) => ({ sc: rx.pq.sc, pct: rx.pq.pct }), hide: (rx) => !rx.pq, rest: "Rest 2:00", rt: 120,
      ramp: { n: "Squat warm-up sets", pcts: [[40, 3], [60, 2]] },
      items: (rx) => [{ n: rx.pq.fast ? "Speed squat" : "Pause squat", s: rx.pq.sc, cue: rx.pq.fast ? "No pause. Every rep as fast as you can move it. Pins set." : "Bar on your back, sit to just below parallel and hold there, dead still, for a full two seconds — then drive up hard. Pins set.", id: "pausesq", k: "wr", mk: "squat", pct: rx.pq.pct, sets: rx.pq.sets, reps: rx.pq.reps }],
      rxLine: (rx) => rx.pq.sc, w: (rx) => (rx.pq.fast ? "Pins set. Skipped on top-triple weeks (4, 9) and in week 16."
        : "Pins set. Skipped on top-triple weeks (4, 9) and in week 16. This is a percentage of your back-squat max — and a paused triple at 75% is a hard triple, because a two-second pause takes 10–15% off what you can lift. That column never goes above 75%."),
      why: "The second squat exposure — submaximal, paused, from the position rear-leg drive starts in. Saturday owns the heavy squat; this is at a weight you own.", tr: 2 },
    { L: "E", n: "Romanian Deadlift", m: 6, rest: "Rest 75s", rt: 75, rxLine: () => "3 × 6",
      items: [{ n: "Romanian deadlift", s: "3 × 6", cue: "Bar at your hips, soft knees, push your hips back until the bar reaches mid-shin with a flat back, stand back up by driving the hips through. Start around 60% of your trap bar max and add 2.5–5 kg a week while every rep still moves at the same speed.", id: "rdl", k: "wr", sets: 3, reps: 6 }],
      why: "Hamstring strength without the soreness. The eccentric work that does leave you sore — the Nordics — is last on Sunday." },
    { L: "F", n: "Neck — holds only", m: 5, p: "NECK",
      items: [{ n: "4-direction holds", s: "3 × 10s each direction", id: "neck2", k: "chk" }],
      why: "Second dose of the week, holds only. Thursday carries the full block." },
    { L: "G", n: "Ring Rows", m: 5, cal: "ringrow", rest: "Rest 60s", rt: 60, rxLine: () => "3 sets at your level",
      items: [{ n: "Ring rows — at your level", s: "3 sets", cue: "At the level most men start: rings hung at hip height, hang beneath them with your body straight and your heels on the floor, pull the rings to your chest, pause a second, lower slow. The lower the rings, the harder. The line climbs to feet-elevated rows and then archer rows.", id: "ringrow", k: "wr", sets: 3, reps: "at your level" }],
      why: "Horizontal pulling on the heavy lower morning: light, quick, and it keeps the shoulder honest without adding a gram to the elbow load that Monday already carries." }] },

  /* ---------------- THURSDAY ---------------- */
  thu: { n: "THURSDAY", t: "Crawls · Throws + Landmine · Split Squat + Tendon Hold · Engine 2 · Neck", m: (rx) => (rx.test ? 18 : rx.eng2 === "easy" ? 57 : 61), ac: C.cobalt, box: 1,
    intro: "The third power dose, the only single-leg lift, the second engine session and the full neck block. (Week 16: warm-up and neck only.)", b: [
    { L: "A", n: "Warm-up + bear crawls", m: 8, p: "GEN8", note: "Same as Tuesday, bear crawls included.", rxLine: () => "8 min · same as Tuesday, bear crawls included",
      items: [{ n: CRAWL_N, s: "10m forward, 10m backward, × 4", cue: CRAWL_S + " Slow beats fast: if the hips rock or the knees lift, you've gone too quick.", id: "crawl", k: "wr", sets: 4, reps: 20 }],
      why: CRAWL_WHY },
    { L: "B", n: "Power dose — throws + landmine", m: 8, star: 1, hard: 1, hide: (rx) => !!rx.test, rest: "45s between sets", rt: 45,
      rxLine: () => "three easy throws first, then 2 × 3/side and 2 × 5/side",
      items: [{ n: "Three easy throws of each first", s: "at half effort", cue: "Three easy throws of each first, at half effort — a maximal rotational throw is the one movement in the morning nothing in the warm-up has rehearsed.", id: "easythrows", k: "chk" },
        { n: "Rotational shot-put", s: "2 × 3/side", cue: "Medicine ball, 3–5 kg, at the shoulder, side-on to the wall, drive off the back hip. Flat and hard, like the punch.", id: "shot2", k: "chk" },
        { n: "Landmine punch", s: "2 × 5/side", cue: "One end of a barbell in a corner or landmine sleeve, the other end at your shoulder, in your stance. Drive the hips and punch it up and away — never press it. Bar speed is the metric; add weight only when it still snaps.", id: "lm2", k: "wr", sets: 2, reps: "5/side" }],
      why: "The third weekly power dose: the unloaded ballistic and the loaded punch pattern, three days before Sunday's full session." },
    { L: "C", n: "Split Squat — rear foot elevated", m: 7, p: "SPLIT", hide: (rx) => !!rx.test, rest: "Rest 60s", rt: 60,
      rxLine: (rx) => (rx.acc <= 2 ? 2 : 3) + " × 6–8 each leg",
      items: (rx) => [{ n: "Rear-foot-elevated split squat", s: (rx.acc <= 2 ? 2 : 3) + " × 6–8 each leg", cue: "Back foot up on a bench behind you, front foot far enough forward to keep your shin near vertical, a dumbbell in each hand. Sink straight down until the back knee nearly touches the floor, drive up through the front heel. Weak side first, same weight on both legs.", id: "rfess", k: "wr", sets: rx.acc <= 2 ? 2 : 3, reps: "6–8/leg" }],
      why: "Every other loaded leg lift in the week is on two legs. Boxing isn't — the rear-leg drive and the pivot are one foot, and two-legged lifting lets your strong side hide the weak one. This is where the weak side gets found and fixed.", tr: 1 },
    { L: "D", n: "Spanish Squat Hold", m: 3, p: "SPAN", hide: (rx) => !!rx.test, rest: "Rest 30s", rt: 30,
      rxLine: () => "3 × 30 seconds",
      timer: () => ({ kind: "hold", opt: { sets: 3, secs: 30, rest: 30, label: "SPANISH SQUAT — DEAD STILL" }, title: "SPANISH SQUAT" }),
      items: [{ n: "Spanish squat hold", s: "3 × 30 seconds · rest 30s", cue: "A thick band around the back of both knees, anchored to the rack in front of you at knee height. Lean back into the band so your shins stay vertical, and sit into a half squat — thighs around 45° — and hold, dead still, for 30 seconds. Rest 30. Three times. It should burn above the kneecap; it should never hurt inside the knee.", id: "spanish", k: "wr", sets: 3, reps: 30 }],
      why: "The tendon block, part two: the patellar tendon, which takes every depth jump and every box landing. Same logic as the Achilles hold — a heavy, still, painless load is what makes tendon stiff, and stiff tendon is what turns strength into speed without tearing." },
    { L: "E", n: (rx) => (ENG[rx.eng2] ? ENG[rx.eng2].n : "Bike session"), m: (rx) => engMin("eng2")(rx) + (nasalWk(rx) ? 8 : 0), star: 1, hard: 1, eng: 1, engKey: "eng2", hide: (rx) => !rx.eng2, timer: engTimer("eng2"),
      nasal: (rx) => nasalWk(rx),
      items: [{ n: "Output", s: "write it down", id: "cond2", k: "out", u: "output / peak HR" }],
      note: "The same four session types as Tuesday (written on the Tuesday page). Thursday always runs a different quality from Tuesday, so each quality is trained twice every three weeks. Same bike, same rules, write down your output." },
    { L: "F", n: "The 60-Second Settle", m: 1, settle: 1, hide: (rx) => !rx.eng2 || !!rx.test, timer: () => ({ kind: "settle", title: "THE SETTLE" }), rxLine: () => "60 seconds — log the seconds to land",
      items: [{ n: "Seconds to land on the breath", s: "write it down", id: "settle2", k: "out", u: "seconds" }],
      why: "As Tuesday. Stay on the bike, eyes closed, find the breath, log the seconds." },
    { L: "X", n: "Achilles Hold", m: 2, campOnly: 1, p: "CALF",
      rxLine: () => "one × 45 seconds",
      timer: () => ({ kind: "hold", opt: { sets: 1, secs: 45, label: "ACHILLES HOLD — STANDING, STRAIGHT KNEE" }, title: "ACHILLES HOLD" }),
      items: [{ n: "Achilles hold — STANDING", s: "one × 45 seconds", cue: "Standing on the edge of a step, both feet, knees straight. Load it as heavy as you can hold dead still and hold the top position for 45 seconds — no bouncing, no sinking.", id: "achilles_c", k: "wr", sets: 1, reps: 45 }],
      why: "In camp the Achilles hold moves here, off the Tuesday that is now a sleep day. The tendon block does not come out — it is the cheapest insurance in sport." },
    { L: "G", n: "Neck", m: 10, p: "NECK", items: [{ n: "The full neck block", s: "4 movements", id: "neck", k: "chk" }] }] },

  /* ---------------- FRIDAY ---------------- */
  fri: { n: "FRIDAY", t: "SLEEP. No alarm. RANGE at home in the evening.", m: 0, ac: C.moss, sleep: 1, box: 1,
    intro: "No alarm. Tomorrow is the biggest session of the week, and the best thing you can do for it is not get up at half three.",
    sleepWhy: "The Singles version put a 55-minute easy ride here. Straight truth about that ride: fifty-five minutes of easy spinning a week is a token dose of aerobic base — it's either two hours or it's not worth the alarm — and the job you do all day is already hours of low-intensity movement. The two interval sessions, the fight rounds and the sprint warm-ups are what build your engine, and they're untouched. What the Friday alarm actually cost was about seventy-five minutes of sleep on the night before Saturday, every week, for sixteen weeks, and sleep is the one recovery variable in this program that nothing else replaces. So it's gone. Four mornings a week, then a lie-in.",
    safeguard: "The safeguard, written down. The engine rests on the two interval sessions, the rounds, the weekend easy hour, and a physical job. Two numbers arbitrate: the 20-minute bike test and the fight-sim fade. If either has stalled by week 9, twenty easy minutes on the bike straight after Tuesday's intervals is the first thing that comes back — not the Friday alarm.",
    sleepFood: "Food: Friday's 5pm carb feed still loads Saturday — that's the most important feed of the week and it doesn't move. There's no fasted ride, so breakfast is the porridge on waking. Everything else as the fuel app says.",
    b: [] },

  /* ---------------- SATURDAY ---------------- */
  sat: { n: "SATURDAY", t: "★ The Leg & Power Session — get-ups open it", m: (rx) => (rx.lowerLead ? 98 : rx.pp && rx.pp.sc ? 94 : 91), ac: C.oxide, free: 1, box: 1,
    intro: "No shift, fed and fresh. This is the session that matters most all week, on the one day nothing can compromise it. Fuel it like the fuel plan's big day: porridge 6:30, shake 7:45, start 8:15.", b: [
    { L: "A", n: "Warm-up — get-ups first", m: 16, p: "HIP", note: "Build-ups included. Never sprint cold. The squat warm-up sets happen inside the squat step, not here.", rxLine: () => "16 min · get-ups 2/side, hips, build-ups",
      items: [{ n: GETUP_N, s: "2 per side, light · 4 min", cue: GETUP_S + " Start with 8–12 kg; 16 is the working weight; 24 is the test.", id: "getup", k: "chk" }],
      why: GETUP_WHY },
    { L: "B", n: "Flying Sprints", m: 14, star: 1, hard: 1, noTaper: 1, rest: "Rest 2:30–3:00 — full recovery", rt: 165,
      items: [{ n: "Flying sprint 20m", s: (rx) => rx.spr + " × 20m" + (rx.sprPct < 100 ? " @ 90%" : ""), cue: "Jog-build for 10–15m, then 20 metres absolutely flat out. Walk back, full rest — this is a speed session, not cardio.", id: "sprint", k: "out", u: "best time (s)" }],
      rxLine: (rx) => rx.spr + " × 20m" + (rx.sprPct < 100 ? " @ 90%" : " · flat out"),
      w: "On a yellow day: 3 runs at 90%, never max.",
      why: "Sprinting flat-out is the single most explosive thing you can do, and regular top-speed running is also the best protection your hamstrings can get.",
      note: "Treadmill options, best first: curved self-powered → outdoors → treadmill on an 8–12% incline at 12–15 km/h for 8–10 seconds, safety clip on.", tr: 2 },
    { L: "C", n: (rx) => jumpOf(rx.jump).n, m: 12, hard: 1, noTaper: 1, rest: "Rest 2:00", rt: 120, hide: (rx) => !!rx.noJumps,
      items: [{ n: (rx) => jumpOf(rx.jump).item, s: (rx) => rx.js[0] + " × " + rx.js[1] + " · " + jumpOf(rx.jump).box,
        cue: (rx) => jumpOf(rx.jump).cue, id: "jump", k: "out", u: "height / quality" }],
      rxLine: (rx) => rx.js[0] + " × " + rx.js[1], w: (rx) => jumpOf(rx.jump).w,
      why: (rx) => (rx.restart ? "Back under 3 on Sunday's check: the jumps restart one stage down for a week. " : "")
        + (rx.jump === "depth" ? "Weeks 11–16: reactive strength, concentrated before the peak." : rx.jump === "lowbox" ? "Weeks 6–10: the step between drop landings and full depth jumps." : "Weeks 1–5: no jump — this teaches your knees and tendons to absorb.")
        + " " + jumpGate(rx), tr: 2 },
    { L: "D", n: "Side Bounds", m: 7, rest: "Rest 90s", rt: 90,
      items: [{ n: (rx) => (rx.bound === "stick" ? "Side bound — stick the landing" : "Side bound — continuous"), s: "3 × 4/side",
        cue: (rx) => (rx.bound === "stick" ? "Stand on one leg, jump sideways as far as you can, land on the other leg and stick the landing dead still for 2 seconds." : "Weeks 11–14: no stick — bounce straight back the other way."), id: "latbound", k: "chk" }],
      why: "The sideways push-off is how you cut the ring off. Nothing else in the week trains it.", tr: 2 },
    { L: "E", n: "Back Squat", m: 17, star: 1, hard: 1, mainLift: "squat", fb: "squat",
      rest: (rx) => (heavy79(rx) ? "Rest 3:00" : "Rest 2:30"), rt: (rx) => (heavy79(rx) ? 180 : 150),
      ramp: { n: "Squat warm-up sets — here, not at the start of the session", pcts: [[40, 3], [60, 2], [75, 1]],
        why: "Forty minutes of sprinting and jumping keeps you warm; it doesn't keep the squat pattern rehearsed." },
      items: (rx) => (rx.topSq ? [topItem("Back squat", "squat", "squat_top")] : []).concat([{ n: "Back squat", s: rx.topSq ? rx.sets + " × " + rx.reps + " @ " + rx.pct + "% of the new working max" : rx.sc, cue: "Bar on your back, break at the hips and knees together, sit to just below parallel, drive up hard. Every rep fast on the way up; a grinding rep ends the set.", id: "squat", k: "wr", mk: "squat", pct: rx.pct, sets: rx.sets, reps: rx.reps }]),
      w: "Pins set — just below your lowest position on every set over 80%.",
      why: "Lower-body maximal strength is the strongest single predictor of punch force in trained boxers.", tr: 3 },
    { L: "F", n: "The Jump Circuit", m: (rx) => (rx.lowerLead ? 22 : 18), star: 1, hard: 1, rt: 165, rest: "20s between elements · rest 2:30–3:00 between rounds",
      timer: (rx) => (rx.boxOnly ? { kind: "contrast", opt: { rounds: 1, rest: 165, items: ["BOX JUMP ×3"] }, title: "BOX JUMPS" }
        : { kind: "contrast", opt: { rounds: rx.cr, rest: 165, items: ["BACK SQUAT — 2 @ " + rx.cpct + "%", "BOX JUMP ×3", "TRAP BAR JUMP ×3"].concat(rx.ph === "b3" ? ["ASSISTED JUMP ×3"] : []) }, title: "JUMP CIRCUIT" }),
      items: (rx) => (rx.boxOnly
        ? [{ n: "Box jump", s: "×3", cue: "Inside the last ten days the jump circuit becomes box jumps only. Knee-to-hip-height box, land soft, step down.", id: "cbox", k: "chk" }]
        : [{ n: "Back squat", s: rx.cr + " × 2 @ " + rx.cpct + "%", cue: "Wakes the nervous system up.", id: "csq", k: "wr", mk: "squat", pct: rx.cpct, sets: rx.cr, reps: 2 },
        { n: "Box jump", s: "×3", cue: "Knee-to-hip-height box, land soft, step down.", id: "cbox", k: "chk" },
        { n: "Trap bar jump", s: rx.cal ? "×3 — empty bar (week 1)" : "3 @ 20% of trap bar max", cue: "Stand inside the bar, jump with it, land soft.", id: "ctbj", k: "wr", mk: rx.cal ? null : "tbdl", pct: 20, sets: rx.cr, reps: 3 }]
        .concat(rx.ph === "b3" ? [{ n: "Band-assisted jump", s: "×3", cue: "Loop a heavy band over the top of the rack, tuck it under your armpits so it pulls you upward, and jump — it makes you faster than you are.", id: "cassist", k: "chk" }] : [])),
      rxLine: (rx) => (rx.boxOnly ? "Box jumps only — the last ten days" : rx.cr + " round" + (rx.cr > 1 ? "s" : "") + " · squat 2 @ " + rx.cpct + "%"),
      w: "End the round the moment jump height drops.",
      why: "If round 2 jumps as high as round 1, the rest can be a bit shorter; if it doesn't, it was too short.",
      note: (rx) => (rx.lowerLead ? "Weeks 11–14: this circuit moves to the FRONT — before the squat, while you're freshest." : ""), tr: 2 },
    { L: "G", n: "Push Press", m: 10, hard: 1, mainLift: "pp", calib: "pp", fb: "pp", hide: (rx) => !rx.pp || !rx.pp.sc || !!rx.au, rest: "Rest 2:00", rt: 120,
      items: (rx) => [{ n: "Push press", s: rx.pp.sc, cue: "Bar on the front of your shoulders. Quick shallow knee dip, then drive the bar overhead with your LEGS and punch it to lockout. Down under control.", id: "pushpress", k: "wr", mk: "pp", pct: rx.pp.pct, sets: rx.pp.sets, reps: rx.pp.reps }],
      why: "Legs → braced trunk → hands. The same route a punch takes, and the heaviest thing your shoulders and traps see all week — which is why the traps and shoulders don't need a size block.",
      note: "Weeks 4 and 9: skipped. The squat top triple is enough heavy work for one day." },
    /* from the audit's week: one arm, up and forward, in the barbell's place */
    lmPush({ id: "lmpush", m: 10, sets: (rx) => fLm(rx).sets, reps: (rx) => fLm(rx).reps })] },

  /* ---------------- SUNDAY ---------------- */
  sun: { n: "SUNDAY", t: "★ Get-ups · Punch Throws · Nordics · Fight Rounds · Post-Max Sit · Core + L-Sit · Lever", m: (rx) => (rx.test ? 44 : rx.topBe ? 92 : rx.sim.skip ? 56 : 80), ac: C.brass, free: 1, box: 1,
    intro: "Second free morning. Punches, then the week's hamstring work while the legs are fresh, then rounds, core and hands. No pressing today on purpose so Monday's bench gets 42 hours. Same fuelling as Saturday. (Week 16: the warm-up, the 20-minute test and the weekly check. Nothing else. Stretch at home.)", b: [
    { L: "A", n: "Warm-up — get-ups first", m: 14, p: "SUNWU", rxLine: () => "14 min · get-ups 2/side, then Tuesday's warm-up and the practice throws", note: "Turkish get-ups, then Tuesday's warm-up without the crawls, plus: broad jumps 3 × 2 · med-ball chest passes 3 × 3 as hard as you can · 3 × 10-second bike sprints with a minute between · then three EASY practice throws of each of the four throws.",
      items: [{ n: GETUP_N, s: "2 per side, light", cue: GETUP_S + " Start with 8–12 kg; 16 is the working weight; 24 is the test.", id: "getup", k: "chk" }],
      why: GETUP_WHY },
    { L: "B", n: "Bench Top Triple", m: 12, star: 1, hard: 1, hide: (rx) => !rx.topBe, mainLift: "bench", rest: "Rest 2:30–3:00", rt: 165,
      ramp: { n: "Bench warm-up sets", pcts: [[40, 5], [60, 3]] },
      items: [topItem("Bench press", "bench", "benchtop")],
      why: "Weeks 4 and 9 only, and it happens here — Sunday, first thing, fresh, with pins and no collars. Bench warm-up sets (bar × 10, 40% × 5, 60% × 3) before the ramp. The heaviest clean triple × 1.08 is the new working max. " + TOP_NOT_MAX, tr: 2 },
    { L: "C", n: "The Four Punch Throws", m: 16, star: 1, p: "VEC", hide: (rx) => !!rx.test, rest: "45s between exercises · 90s between rounds", rt: 45,
      timer: (rx) => ({ kind: "vec", opt: { rounds: rx.vec }, title: "PUNCH THROWS" }),
      items: [{ n: "Med-ball rotational shot-put", s: "4/side — your straight right", cue: "Ball at your shoulder, boxing stance side-on to a wall. Drive off the back hip and put the ball into the wall as hard as you can, flat and hard like a punch. A few from a lower crouch for the body-shot version.", id: "mbshot", k: "out", u: "best distance (m)" },
        { n: "Med-ball downward diagonal", s: "4/side — your overhand right", cue: "Ball high outside your shoulder. Drive it down and across your body, letting go toward the opposite hip. Back foot pivots, trunk turns AND side-bends, exactly like the punch.", id: "mbdiag", k: "out", u: "best distance (m)" },
        { n: "Med-ball hook throw", s: "4/side — your lead hook", cue: "Ball held at chest height in bent arms. Pivot hard off the lead leg and sling it sideways into the wall.", id: "mbhook", k: "chk" },
        { n: "Landmine punch", s: "5/side — your loaded straight", cue: "Bar end at your shoulder, in your stance. Drive the hips and PUNCH it up and away — never a slow press. Catch it, go again.", id: "lmpunch", k: "wr", sets: (rx) => rx.vec, reps: "5/side" }],
      rxLine: (rx) => rx.vec + " rounds",
      why: "Straight punches are built on forward drive; hooks on rotation. They're different physical problems, so all four get trained. Medicine ball 3–5 kg — if it isn't flying, it's too heavy.", tr: 2 },
    { L: "H", n: "Nordic Curls", m: 8, noTaper: 1, hide: (rx) => !rx.nor || !!rx.test, rest: "Rest 2:00", rt: 120,
      rxLine: (rx) => rx.nor[0] + " × " + rx.nor[1] + " — ramped",
      items: [{ n: "Nordic curl", s: (rx) => rx.nor[0] + " × " + rx.nor[1] + " — ramped", cue: "Kneel with your heels anchored under something solid. Keeping your body straight from knees to head, lower yourself forward as SLOWLY as you can, catch yourself with your hands, push back up. Stop the set the moment your lower back rounds — not at the rep count.", id: "nordic", k: "wr", sets: (rx) => rx.nor[0], reps: (rx) => rx.nor[1] }],
      why: (rx) => "Before the rounds, on purpose: the hardest eccentric work of the week goes on fresh hamstrings, not on ones that have just done twenty-four minutes of rounds — a maximal eccentric on a tired muscle is how the protective exercise becomes the injury. The rounds after it are bike" + (rx.au ? "" : ", ski") + " and landmine, which don't need a fresh hamstring. And it's still the last day, so the soreness has two leg-easy days to leave before Wednesday. Strong hamstrings on the way down is the best-proven injury protection in all of sport; the reps ramp up over the first month — follow the table. (Week 16: skip.)" },
    { L: "D", n: "Fight Simulation", m: 24, star: 1, sim: 1, hard: 1, hide: (rx) => !!rx.sim.skip || rx.w === 1 || !!rx.test,
      timer: (rx) => ({ kind: "sim", opt: Object.assign({ rounds: rx.sim.rounds || 6, rest: rx.sim.rest, max3: rx.sim.max3 }, rx.au ? { arms: 1 } : {}), title: "FIGHT SIM" }),
      /* from the audit's week the SkiErg's minute is the assault bike with the arms only, and a round logs the bike's calories */
      libAs: (rx) => (rx.au ? ROUNDS_LIB : null),
      items: (rx) => { const u = rx.au ? "bike cal" : "SkiErg m / bike cal";
        return [{ n: "Minute 1", s: rx.au ? ARMS_THIRD : "SkiErg", k: "txt" }, { n: "Minute 2", s: rx.au ? BIKE_THIRD : "Assault bike", k: "txt" }, { n: "Minute 3", s: "Landmine punches (odd rounds) or med-ball slams (even)", k: "txt" },
          { n: "Round 1 output", s: u, id: "fs_rd1", k: "out", u }, { n: "Round 6 output", s: u, id: "fs_rd6", k: "out", u }]; },
      rxLine: (rx) => (rx.sim.rounds || 6) + " × 3 min · rest " + rx.sim.rest + "s" + (rx.sim.tested ? " · SCORED" : rx.sim.max3 ? " · minute 3 flat out" : ""),
      rules: ["Relaxed jaw, shoulders down. Finish a round with your traps by your ears and that round doesn't count, whatever the number says.", "Nose-breathe through rounds 1–3 as a pacing tool, not a test. Mouth open whenever you need it; the round still counts.", "Every rest is ROUND-RECOVERY BREATHING: two physiological sighs the second the round ends (a full breath in through the nose, a short second sip on top, one long slow exhale through the mouth — twice), then nose only, in for 3 and out for 6, for the rest of the break. Stand up, hands off the knees. Hands-on-knees gasping through an open mouth keeps you revved and starts the next round behind; this is the one purely mental minute a fight gives you, and this is where it's practised."],
      recovery: 1,
      why: "Three-minute rounds, never enough rest, holding output across six — nothing else you own trains the actual shape of a fight. The whole game is getting the fade toward 100%.", tr: 3 },
    { L: "E", n: "20-Minute Bike Test", m: 25, star: 1, hard: 1, hide: (rx) => !(rx.w === 1 || rx.w === 16), timer: () => ({ kind: "z2", opt: { min: 20, label: "20-MIN TEST" }, title: "20-MIN TEST" }),
      libAs: (rx) => (rx.au ? T20_LIB : null),
      items: [{ n: "20 minutes, maximum distance", s: (rx) => (rx.au ? "the same bike every time" : "same bike or SkiErg every time"), cue: "5 easy minutes, then 20 minutes for the most distance you can. No pacing plan — go and find out. Write down two numbers: the distance, and the highest heart rate you saw. That peak is your practical maximum; from now on every easy ride sits around 65–75% of it.", id: "bike20", k: "out", u: "distance (m)" },
        { n: "Peak heart rate", s: "highest you saw", id: "bike20hr", k: "out", u: "bpm" }],
      rxLine: () => "20 min max distance — the engine test",
      why: "Replaces the fight rounds in weeks 1 and 16. Week 1 is the baseline; week 16 is the verdict.", tr: 2 },
    { L: "F", n: "The Post-Max Sit", m: 3, hide: (rx) => !!rx.test, timer: () => ({ kind: "postmax", title: "POST-MAX SIT" }),
      rxLine: () => "3 min — straight off the last round",
      items: [{ n: "Seconds to settle onto the anchor", s: "write it down", cue: "Straight off the last round: sit down, eyes closed, heart at 170-plus, chest heaving — and find the breath at the nostrils. Write down the seconds it took to genuinely settle onto it.", id: "postmax", k: "out", u: "seconds" }],
      why: "This is the corner between rounds, trained; nobody practises it and everybody needs it." },
    { L: "G", n: "Core + L-Sit + Hands", m: 10, cal: "lsit", hide: (rx) => !!rx.test, rest: "Rest 60s", rt: 60,
      items: [{ n: "Hanging leg raise", s: "3 × 8–12", cue: "Hang from a bar, dumbbell between your feet if needed, lift the legs to hip height or above, no swinging.", id: "hlr", k: "wr", sets: 3, reps: "8–12" },
        { n: "The L-sit line — at your level", s: "3 sets", cue: "At the first level it's the tuck L-sit: sitting between two boxes or on parallettes, press the floor away until your backside lifts and hold with the knees pulled to the chest; the line climbs one leg at a time to the full L-sit and then the floor L-sit. Straight-arm pushing strength and the stiffest trunk position there is.", id: "lsit", k: "wr", sets: 3, reps: "at your level" },
        { n: "Side plank reach-through", s: "2 × 10/side", cue: "In a side plank, thread your top arm under your body, then rotate open to the ceiling.", id: "sprt", k: "chk" },
        { n: "Hands", s: "knuckle hold 3 × 20s · band wrist extension 2 × 15", cue: "On your fists on a mat, the wrist dead straight; then forearm on the knee, palm down, lifting the knuckles toward you.", id: "hands2", k: "wr", sets: 3, reps: 20 }] },
    { L: "J", n: "The Slow Lane — one lever hold", m: 3, cal: "slowlane", hide: (rx) => !!rx.test || !!rx.dl, rest: "Rest 60s", rt: 60,
      rxLine: () => "one lever · 3 sets · ten seconds a hold to start",
      items: [{ n: "The lever hold — at your level", s: "3 sets", cue: SUNDAY_LEVER, id: "lever", k: "wr", sets: 3, reps: "hold" }],
      w: "The three laws govern this block absolutely: five seconds added per fortnight at most, twelve weeks a level minimum, and any inside-elbow ache buys the lane two weeks off.",
      why: SLOW_WHY },
    { L: "T", n: "Trunk", m: 9, campOnly: 1, rest: "Rest 45s between exercises", rt: 45,
      items: [{ n: "Pallof press", s: "3 × 10/side · 2s hold", cue: "Band at chest height, anchored beside you. Press your hands straight out and hold two seconds without letting it twist you.", id: "c_pallof", k: "wr", sets: 3, reps: "10/side" },
        { n: "Ab wheel rollout", s: "3 × 8–12", cue: "Knees down, roll out only as far as your lower back remains flat, pull back.", id: "c_abwheel", k: "wr", sets: 3, reps: "8–12" },
        { n: "Copenhagen plank", s: "2 × 30s/side", cue: "Side plank with your top foot up on a bench, bottom leg lifted off the floor. Groin strength — the muscles you pivot off.", id: "c_copen", k: "wr", sets: 2, reps: 30 }],
      why: "Camp moves the trunk block to Sunday: Tuesday is a sleep day now, and maximal strength, the power doses, the tendon block, the neck, the Nordics and the trunk are what boxing never covers." },
    { L: "I", n: "Weekly Check", m: 2, review: 1,
      items: [{ n: "Bodyweight", s: "kg", id: "wr_bw", k: "out", u: "kg" }, { n: "Resting heart rate", s: "bpm", id: "wr_rhr", k: "out", u: "bpm" }, { n: "HRV average", s: "ms", id: "wr_hrv", k: "out", u: "ms" },
        { n: "Hips", s: "0–10", id: "wr_hip", k: "out", u: "0–10" }, { n: "Shoulders", s: "0–10", id: "wr_sh", k: "out", u: "0–10" }, { n: "Elbows", s: "0–10", id: "wr_el", k: "out", u: "0–10" }, { n: "Wrists", s: "0–10", id: "wr_wr", k: "out", u: "0–10" },
        { n: "Knees", s: "0–10", id: "wr_kn", k: "out", u: "0–10" }, { n: "Achilles", s: "0–10", id: "wr_ach", k: "out", u: "0–10" },
        { n: "Boxing nights your hands felt slow", s: "count", id: "wr_slow", k: "out", u: "nights" }, { n: "Energy", s: "1–10", id: "wr_en", k: "out", u: "1–10" },
        { n: "Evenings you did RANGE", s: "0–7", id: "wr_home", k: "out", u: "0–7" },
        { n: "Hours of sleep, averaged", s: "hours a night", id: "wr_sleep", k: "out", u: "hours" },
        { n: "Lights-out time, averaged", s: "what time the light went off", id: "wr_lights", k: "out", u: "e.g. 21:30" }],
      rangeTests: 1,
      note: "Two slow-hands nights, or three yellows in one week = next week is an easy week, whatever the plan says. Shoulders, elbows or wrists at 4 or above out of 10 here, and next week every calisthenics line is holds only. Every 4–6 weeks: tape — arms, shoulders, waist." }] },

  /* ---------------- THE LIGHT SESSION ---------------- */
  light: { n: "LIGHT SESSION", t: "After head contact", m: 30, ac: C.violet,
    intro: "The morning after any sparring: Tuesday's warm-up, Thursday's neck block, Monday's shoulder circuit — about 30 minutes, or nothing. No heavy lifting, no sprinting, no jumping for 24 hours after head contact. Any headache, fogginess or light sensitivity: do nothing, and tell your coach.", b: [
    { L: "A", n: "Warm-up", m: 6, p: "GEN" },
    { L: "B", n: "Neck", m: 10, p: "NECK", items: [{ n: "The full neck block", s: "4 movements", id: "neck", k: "chk" }] },
    { L: "C", n: "Shoulder Circuit + Band Catch", m: 8, p: "CUFF", items: [{ n: "Circuit + band deceleration catch", s: "2 rounds · then 2 × 8/arm", id: "catch", k: "chk" }] }] },
};

/* The day's page: the camp's when Camp Mode is on, the Fighter's when it
   isn't. Camp days with no page of their own (week 1's Monday, fight week
   after the bell, the hand-back) return null and get a card instead. */
const sessFor = (day, rx) => {
  if (MODE.spp) return sppSess(day);
  const S0 = MODE.trans ? transitionSess(day, rx) : MODE.prep ? prepSess(day) : MODE.camp ? campSess(day, rx || rxFor(1)) : S[day];
  /* OPTIMAL 8 · MOVE, laid over the day: the camp's final week has only
     its Tuesday's lower pushes, and the week before a camp has none */
  if (MODE.camp && rx && rx.pre) return S0;
  if (MODE.camp && rx && rx.fightWeek) return S0 && S0 === CSFW.tue ? withFinalWeek(S0) : S0;
  const prog = MODE.trans ? "trans" : MODE.prep ? "prep" : MODE.camp ? "camp" : "fighter";
  /* then THE CORE from 23 November: three for the abs and the core every training day, and the kneeling jump into a box jump (core.js) */
  return withCore(prog, day, withMove(prog, day, S0));
};

/* Is this day a sleep day? Friday, in both programs. */
const sleepDay = (day, rx) => {
  const sx = sessFor(day, rx);
  return !!(sx && sx.sleep);
};

/* blocks visible for a day in a given week, in the order they are performed */
function blocksFor(day, rx) {
  const sess = sessFor(day, rx); if (!sess) return [];
  if (sess.sleep) return [];
  let b = sess.b.filter((x) => x.sp || !(x.hide && x.hide(rx)));
  if (!MODE.camp) {
    b = b.filter((x) => !x.campOnly);
    if (MODE.lastTen) b = b.filter((x) => !x.noTaper);
    if (day === "sat" && rx.lowerLead) { const e = b.findIndex((x) => x.L === "E"), f = b.findIndex((x) => x.L === "F"); if (e >= 0 && f >= 0 && e < f) { const arr = b.slice(); const tmp = arr[e]; arr[e] = arr[f]; arr[f] = tmp; b = arr; } }
  }
  /* Strength, Power and Physique's trim: a card it moved inside its day
     goes before the card it names */
  if (MODE.spp) b = sppOrder(b, rx);
  return b;
}
const realBlocks = (day, rx) => blocksFor(day, rx).filter((x) => x.L);
/* The cards a day's ticks are measured against. A card added to a programme
   after it began carries the first date it counts from (since). A day before
   that date was trained without the card, so the card doesn't count against
   it: the day is measured against the cards it had. The week's prescription
   carries its Monday (mon) where the season knows it. */
export const countsOn = (block, isoDay) => !(isoDay && block.since && isoDay < block.since);
const countedBlocks = (day, rx) => { const iso = rx && rx.mon ? addDays(rx.mon, DAYS.indexOf(day)) : null;
  return realBlocks(day, rx).filter((x) => countsOn(x, iso)); };
/* The running order for today, with the day's readiness already resolved
   into it: on a red day the hard steps are not shown as struck-through
   conditions, they are simply not in the order. */
const orderFor = (day, rx, ready) => {
  let b = blocksFor(day, rx).filter((x) => !(ready === "R" && x.hard));
  /* PREP's yellow takes 7% off the bar, runs the interval session at 90%
     and drops the last block. The first two are applied where the load and
     the session are built; this is the third. */
  if (MODE.prep && ready === "Y") { const last = b.filter((x) => x.L); if (last.length > 1) b = b.filter((x) => x !== last[last.length - 1]); }
  return b;
};

/* ================================================================
   THE CARDS — the session as one card per exercise.

   A block of the running order becomes cards: the warm-up is one card
   with a checklist; paired and round-based work (the drive and punch
   holds, the contrast circuits, the bench contrast, the rounds, the
   punch throws) is one card that runs a guided round timer; an
   interval session or a test with a timer is one card with its fields;
   everything else is a card per exercise. Every card carries the
   library entry it is.
   ================================================================ */
const ROUND_KINDS = { contrast: 1, csim: 1, sim: 1, drivepunch: 1, vec: 1, circuit: 1 };
const ENGINE_KINDS = { z2: 1, vo2: 1, lac: 1, mod: 1, tempo: 1, thr: 1, rz: 1, ergrounds: 1, nasal: 1, bursttest: 1, settle: 1, postmax: 1, recovery: 1 };
/* the lines of a warm-up checklist that are loads and notes, not moves */
const NOT_A_MOVE = /^(bar|\d+%|\d+\s*m\s*@|loading|set-up|the hold|it should|weak side|straight knee|slow beats fast|plus|then|three things|if you skip)/i;
const cleanName = (s) => String(s || "").replace(/\s+[—–]\s+at your level\s*$/i, "").trim();
const firstLib = (...names) => { for (const n of names) { const l = n ? libFor(n) : null; if (l) return l; } return null; };
/* a top triple's card carries the TOP TRIPLE entry and the lift's own */
const topLib = (...names) => [].concat(libFor("top triple") || [], firstLib(...names) || []);
/* every row with a bench throw in it carries the BENCH THROW entry: the
   safety stops it's set up on */
const BENCH_THROW_LIB = LIBRARY.find((e) => e.n === "BENCH THROW") || null;
const withBenchThrow = (c, rx) => {
  const has = (l) => (l || []).some((e) => e === BENCH_THROW_LIB);
  const names = [c.n, c.item ? v(c.item.n, rx) : ""].concat((c.parts || []).map((p) => p.n));
  if (!BENCH_THROW_LIB || has(c.lib)) return c;
  if (names.some((n) => /bench throw/i.test(String(n || ""))) || (c.parts || []).some((p) => has(p.lib))) c.lib = (c.lib || []).concat([BENCH_THROW_LIB]);
  return c;
};

function gymCards(blocks, rx, o) {
  o = o || {};
  const calc = o.calc || (() => null);
  const out = [];
  blocks.forEach((b) => {
    if (!b.L) return;
    const name = String(v(b.n, rx) || "");
    const items = (v(b.items, rx) || []);
    const its = items.filter((x) => x.k !== "txt");
    const timer = b.timer ? b.timer(rx) : null;
    const rest = restCol(v(b.rest, rx)), rt = v(b.rt, rx);
    const base = { L: b.L, b, rest, rt, timer, mins: Number(v(b.m, rx)) || 0, tr: Number(b.tr) || 0, block: name };
    const row = rowFor(b, rx, calc, o.calis, b.cal ? calMode(rx, o.taper, o.jointFlag) : null);
    const blockPres = [row.work, row.load, row.rest].filter(Boolean).join(" · ");
    const proto = v(b.p, rx) && PROTO[v(b.p, rx)] ? PROTO[v(b.p, rx)] : null;
    /* the warm-up: one card, a checklist */
    if (/^warm-up/i.test(name) && proto) {
      const list = [];
      proto.i.forEach((r) => { if (!r[1]) { list.push({ head: r[0] }); return; }
        list.push({ n: r[0], s: NOT_A_MOVE.test(r[0]) ? r[1] : r[1].split(" — ")[0], move: !NOT_A_MOVE.test(r[0]), lib: NOT_A_MOVE.test(r[0]) ? null : libFor(r[3] || r[0]), lv: r[2] || null }); });
      its.forEach((it) => { const lib = libFor(v(it.n, rx));
        if (lib && list.some((r) => r.lib && r.lib[0] === lib[0])) return;
        list.push({ n: v(it.n, rx), s: v(it.s, rx), move: true, lib }); });
      out.push(Object.assign({}, base, { key: b.L, kind: "warm", n: proto.mv ? "The movement block" : "Warm-up", pres: v(b.rxLine, rx) || proto.s, list, lib: null }));
      return;
    }
    /* a test block that is several tests: a card for each */
    if (timer && timer.kind === "bursttest" && its.some((x) => !/burst/.test(x.id || ""))) {
      [["Burst decrement test", /burst/], ["Broad jump and throw tests", /_jump$|_throw$/], ["BOLT", /bolt/], ["Tape and weight", /_bw$|_waist$|_rhr$/]].forEach((g, gi) => {
        const outs = its.filter((x) => g[1].test(x.id || "")); if (!outs.length) return;
        out.push(Object.assign({}, base, { key: b.L + ":" + gi, kind: gi === 0 ? "eng" : "out", n: g[0], timer: gi === 0 ? timer : null,
          pres: gi === 0 ? String(v(b.rxLine, rx) || "") : outs.map((x) => v(x.n, rx)).join(" · "), lib: libFor(g[0]), outs }));
      });
      return;
    }
    /* the rounds and the pairs: one card, a guided round timer */
    const squatContrast = b.mainLift === "squat" && rx.lift === "contrast" && its.some((x) => x.id === "p_circuit");
    if ((timer && ROUND_KINDS[timer.kind]) || b.sim || squatContrast) {
      const tm = squatContrast ? { kind: "contrast", opt: { rounds: rx.cr || 3, rest: 180, items: ["BACK SQUAT — 2 REPS", "BOX JUMP ×3", "TRAP BAR JUMP ×3", "BAND-ASSISTED JUMP ×3"] }, title: "SQUAT CONTRAST CIRCUIT" } : timer;
      const parts = squatContrast ? ["Back squat", "Box jumps", "Trap bar jumps", "Band-assisted jumps"].map((n) => ({ n, lib: libFor(n) }))
        : b.sim ? [v(b.libAs, rx) || "The rounds", "The corner minute"].map((n) => ({ n, lib: libFor(n) }))
        : its.filter((x) => x.k !== "out").map((x) => ({ n: cleanName(v(x.n, rx)), lib: libFor(v(x.n, rx)) }));
      /* a circuit shows its own entry first, if it has one, then every exercise in it */
      const lib = tm && tm.kind === "circuit"
        ? [].concat(libFor(tm.title) || [], ...parts.map((p) => p.lib || [])).filter((e, i, a) => a.indexOf(e) === i)
        : firstLib(v(b.libAs, rx), tm && tm.title, name) || [].concat(...parts.map((p) => p.lib || []));
      out.push(Object.assign({}, base, { key: b.L, kind: "round", n: squatContrast ? "Squat contrast circuit" : tm && tm.title === "BENCH CONTRAST" ? "Bench contrast" : name,
        pres: v(b.rxLine, rx) ? String(v(b.rxLine, rx)) + (row.load ? " · " + row.load : "") : blockPres, timer: tm, parts, lib: lib && lib.length ? lib : null,
        outs: its.filter((x) => x.k === "out"), lifts: its.filter((x) => x.k === "wr" && x.mk) }));
      return;
    }
    /* an interval session, a timed test, the settle: one card with its fields */
    if (b.eng || b.settle || (timer && ENGINE_KINDS[timer.kind]) || b.profile || b.jumpCheck) {
      const E = b.eng ? engMap()[rx[b.engKey || "eng"]] : null;
      out.push(Object.assign({}, base, { key: b.L, kind: "eng", n: name,
        pres: b.engKey === "base" ? v(b.rxLine, rx) : b.engLine ? b.engLine(rx) : E ? E.d : (v(b.rxLine, rx) || blockPres), lib: firstLib(v(b.libAs, rx), name, E && E.n, its[0] && v(its[0].n, rx)),
        outs: its.filter((x) => x.k === "out"), checks: its.filter((x) => x.k === "chk") }));
      return;
    }
    /* the weekly check: one card, its numbers */
    if (b.review) {
      out.push(Object.assign({}, base, { key: b.L, kind: "review", n: name, pres: "", lib: libFor(name), outs: its.filter((x) => x.k === "out") }));
      return;
    }
    /* a block of tests, each its own card */
    if (b.prepTest) {
      its.forEach((it, j) => out.push(Object.assign({}, base, { key: b.L + ":" + j, kind: it.k === "top" ? "top" : "out", n: v(it.n, rx), pres: v(it.s, rx), item: it,
        lib: it.k === "top" ? topLib(v(it.n, rx)) : libFor(v(it.n, rx)), outs: it.k === "top" ? [] : [it] })));
      return;
    }
    /* nothing but the block itself */
    if (!its.length) {
      out.push(Object.assign({}, base, { key: b.L, kind: "chk", n: name, pres: blockPres || v(b.rxLine, rx) || "", lib: libFor(name) }));
      return;
    }
    /* a card per exercise; a block of one is named as the block is. An
       exercise with its own rest — one half of a pair — says its own. */
    const exCard = (it, j, single) => {
      const itn = v(it.n, rx);
      /* a block of one is named as the block is, unless its exercise
         names its own card: Sunday's back hold and Jefferson curl */
      const nm = single ? (it.title || name) : cleanName(itn);
      const p = splitPres(v(it.s, rx));
      const kg = it.mk && it.pct != null ? calc(it.mk, v(it.pct, rx)) : null;
      const bwp = v(it.bwp, rx);
      const rest1 = it.rest != null ? String(v(it.rest, rx) || "") : rest;
      let pres;
      /* a calisthenics line's own row reads its level; the block's other exercises read their own */
      if (b.cal && (single || LINE_OF[it.id] === b.cal || it.id === b.cal)) pres = [row.work, row.load, row.rest].filter(Boolean).join(" · ");
      else pres = [p[0] || v(it.s, rx), kg ? kg.join("–") + " kg" : p[1], bwp && o.bw ? Math.round(o.bw * bwp[0] / 100) + "–" + Math.round(o.bw * bwp[1] / 100) + " kg " + (it.bwl || "") : "", rest1].filter(Boolean).join(" · ");
      /* the three sighs are home-routines.md's THREE BIG SIGHS, not a library entry */
      const sighs = /physiological sighs/i.test(nm);
      /* a block that runs another exercise in its rests carries that one's entry too */
      const also = it.also !== undefined ? v(it.also, rx) : b.alsoLib ? v(b.alsoLib, rx) : null;
      const lib0 = sighs ? null : it.k === "top" ? topLib(nm, itn) : firstLib(nm, itn);
      return Object.assign({}, base, it.rest != null ? { rest: rest1 } : {}, it.rt != null ? { rt: v(it.rt, rx) } : {}, it.restT ? { restT: it.restT } : {},
        { key: single ? b.L : b.L + ":" + j, kind: it.k === "wr" ? "lift" : it.k === "out" ? "out" : it.k === "top" ? "top" : "chk",
        n: nm, pres, item: it, kg, lib: also && lib0 && it.k === "wr" ? lib0.concat(libFor(also) || []) : lib0, desc: sighs ? SIGHS.words : null, outs: it.k === "out" ? [it] : [],
        /* the first work set is the first after a top triple */
        first: j === Math.max(0, its.findIndex((x) => x.k !== "top")), lastOfBlock: j === its.length - 1 });
    };
    /* a pair: two exercises on one card, a set of one, its rest, a set of
       the other — every set logged on its own exercise */
    if (b.pair && its.length === 2) {
      const subs = its.map((it, j) => withBenchThrow(exCard(it, j, false), rx));
      out.push(Object.assign({}, base, { key: b.L, kind: "pair", n: name, pres: String(v(b.rxLine, rx) || ""), subs,
        lib: [].concat(...subs.map((c) => c.lib || [])).filter((e, i, a) => a.indexOf(e) === i), parts: subs.map((c) => ({ n: c.n, lib: c.lib })) }));
      return;
    }
    its.forEach((it, j) => out.push(exCard(it, j, its.length === 1)));
  });
  return out.map((c) => withBenchThrow(c, rx));
}

/* Every card of every day of the four programs, for the library check:
   { program, week, day, n, lib, rows }. `rows` are the moves inside a
   warm-up or a round card, each with its own entry. */
/* The seasons the catalog walks: the master camp and Prep's cycle (the
   "main" ones the program tests read), then the camps the builder makes
   from other answers — every fitness, every emphasis, short formats,
   short notice, a fight off a Saturday, a fitted Prep — so the library
   check and the proof's scan see every week the app can generate. */
export const CATALOG_SEASONS = (() => {
  const P = (from, made, inputs) => ({ from, made, inputs: Object.assign({ booked: true, rounds: 6, mins: 3, rest: 60, weighIn: "before", fitness: "good", emphasis: "none" }, inputs) });
  const out = [
    { set: "master", main: true, plans: [P("2027-01-04", "2026-12-31", { fight: "2027-03-13" })], today: "2026-12-31" },
    { set: "cycle", main: true, plans: [P("2026-01-05", "2026-01-05", { booked: false })], today: "2026-01-05" },
    { set: "example1", plans: [P("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 3, mins: 2, fitness: "low", emphasis: "durability" })], today: "2026-10-08" },
    { set: "example2", plans: [P("2026-10-12", "2026-10-08", { fight: "2026-11-28", rounds: 3, mins: 2, fitness: "low", emphasis: "durability" }), P("2026-12-07", "2026-12-02", { fight: "2027-03-13", fitness: "low" })], today: "2026-12-02" },
    { set: "prep14", plans: [P("2026-09-28", "2026-09-28", { fight: "2027-03-13" })], today: "2026-09-28" },
  ];
  ["power", "strength", "durability"].forEach((em) => ["low", "moderate", "good"].forEach((fit) =>
    out.push({ set: em + "-" + fit, plans: [P("2027-01-04", "2027-01-01", { fight: "2027-03-13", emphasis: em, fitness: fit })], today: "2027-01-01" })));
  [[9, "moderate"], [8, "low"], [7, "good"], [6, "moderate"], [5, "good"], [4, "low"], [3, "moderate"], [2, "low"], [1, "good"]].forEach(([n, fit]) => {
    const mon = "2027-01-04", fight = addDays(mon, 7 * (n - 1) + 5);
    out.push({ set: "weeks" + n + "-" + fit, plans: [P(mon, "2027-01-01", { fight, fitness: fit, rounds: n % 2 ? 4 : 10, mins: n % 2 ? 2 : 3 })], today: "2027-01-01" });
  });
  out.push({ set: "wednesday-fight", plans: [P("2027-01-04", "2027-01-04", { fight: "2027-03-10", rounds: 5, mins: 3, rest: 90, weighIn: "day" })], today: "2027-01-04" });
  out.push({ set: "fitted-9", plans: [P("2026-11-02", "2026-11-02", { fight: "2027-03-13", fitness: "moderate" })], today: "2026-11-02" });
  /* Worked Example 3: the comeback, and the same Prep carried on when the date moves */
  out.push({ set: "comeback", plans: [P("2026-10-26", "2026-10-25", { fight: "2027-03-13", fitness: "low", emphasis: "power" })], today: "2026-10-25" });
  out.push({ set: "carried", plans: [P("2026-10-26", "2026-10-25", { fight: "2027-03-13", fitness: "low", emphasis: "power" }), P("2026-11-16", "2026-11-12", { fight: "2027-04-10", fitness: "low", emphasis: "power" })], today: "2026-11-12" });
  /* the same fight called off on Thursday 3 December: Prep carried on to its test week, then the cycle */
  out.push({ set: "called-off", plans: [P("2026-10-26", "2026-10-25", { fight: "2027-03-13", fitness: "low", emphasis: "power" }), P("2026-12-07", "2026-12-03", { booked: false, fight: null, fitness: "low", emphasis: "power" })], today: "2026-12-03" });
  /* no fight, from low fitness: the cycle's first weeks ease you in */
  out.push({ set: "cycle-low", plans: [P("2026-10-26", "2026-10-25", { booked: false, fitness: "low" })], today: "2026-10-25" });
  /* Strength, Power and Physique: its twelve weeks from the start, and
     picked inside a Prep — the Prep carried on to its test day, then the
     twelve weeks */
  out.push({ set: "spp", plans: [P("2027-02-15", "2027-02-14", { booked: false, spp: true })], today: "2027-02-14" });
  out.push({ set: "prep-then-spp", plans: [P("2026-10-26", "2026-10-25", { booked: false }), P("2026-11-02", "2026-10-29", { booked: false, spp: true })], today: "2026-10-29" });
  return out;
})();

/* Everything a block says on its page, for the proof's scans: its name,
   its lines, every item's name, prescription and cue, its rules and notes */
const sayOf = (c, rx) => {
  const b = c.b || {}, out = [c.n, c.pres];
  [b.n, b.rxLine, b.w, b.why, b.note].forEach((x) => out.push(v(x, rx)));
  (v(b.items, rx) || []).forEach((it) => out.push(v(it.n, rx), v(it.s, rx), v(it.cue, rx)));
  (v(b.rules, rx) || []).forEach((r) => out.push(r));
  return out.filter((x) => x != null && x !== "").map(String).join(" | ");
};
/* Every card of every day of every program, for the library check:
   { program, week, day, n, lib, rows, say }. `rows` are the moves inside
   a warm-up or a round card, each with its own entry. `seasons` walks
   other seasons in place of the catalog's own. */
export function sessionCatalog(only, seasons) {
  const keepM = Object.assign({}, MODE), keepS = SEASON.s, keepE = Object.assign({}, EDGE);
  const out = [];
  const push = (program, w, day, rx, extra) => {
    gymCards(realBlocks(day, rx), rx).forEach((c, i) => out.push(Object.assign({ program, week: w, day, edge: program === "prep" || program === "camp" ? EDGE.manual : null, lastTen: !!MODE.lastTen, i, n: c.n, kind: c.kind, lib: c.lib, desc: c.desc || null, pres: c.pres,
      rows: (c.list || []).filter((r) => r.move).concat(c.parts || []), say: sayOf(c, rx) }, extra)));
  };
  try {
    EDGE.ready = {};
    (seasons || CATALOG_SEASONS.filter((x) => !only || only.indexOf(x.set) >= 0)).forEach((cs) => [true, false].forEach((edge) => {
      EDGE.manual = edge;
      SEASON.s = buildSeason({ plans: cs.plans, today: cs.today });
      const rows = SEASON.s.rows.filter((r) => (r.program !== "prep" && r.program !== "spp") || (r.cycle || 1) === 1);
      rows.forEach((r) => {
        setModeFor(r.mac);
        const week = r.program === "prep" ? rows.filter((x) => x.program === "prep" && x.seq <= r.seq && x.plan === r.plan).length : r.idx || 1;
        DAYS.forEach((day) => {
          const rx = rxFor(r.kw, day);
          push(MAC_PROGRAM[r.mac] === "camp" && r.mac === "B" ? "camp" : MAC_PROGRAM[r.mac], week, day, rx, { set: cs.set, main: !!cs.main, id: r.id, row: r.program });
        });
      });
    }));
    setModeFor(null);
  } finally {
    Object.assign(MODE, keepM); SEASON.s = keepS; Object.assign(EDGE, keepE);
  }
  return out;
}

/* One generated week's prescriptions, for the proof's scan: every row
   of every season the catalog walks, with its rx. */
export function seasonWeeks(seasons) {
  const out = [];
  (seasons || CATALOG_SEASONS).forEach((cs) => [true, false].forEach((edge) => {
    const s = buildSeason({ plans: cs.plans, today: cs.today });
    s.rows.filter((r) => (r.program !== "prep" && r.program !== "spp") || (r.cycle || 1) === 1).forEach((r) => out.push({ set: cs.set, row: r, rx: rowRx(r, edge) }));
  }));
  return out;
}

const MAXES = [["squat", "Back Squat"], ["bench", "Flat Bench"], ["tbdl", "Trap Bar Deadlift"], ["pp", "Push Press"]];
/* Fighter's numbers are working maxes too: its heaviest lifts are top
   triples, and the landmine push press has no number */
export const FIGHTER_MAXES_RULE = "Squat and bench: working maxes — your heaviest clean set of 3, with one or two reps left in you, × 1.08. Never a best single. Trap bar: week 1 finds it (hard triple × 1.08), or enter one here. The push press's number is the barbell's, kept for the weeks before 23 November 2026; the landmine push press has none.";
/* PREP and CAMP load from working maxes, never a best single */
export const SEASON_MAXES_RULE = "Every number here is a working max: your heaviest clean set of 3, with one or two reps left in you, × 1.08, rounded to 2.5 kg. A set of 3 at 120 kg is 130. Never a best single — that's the ego number, and every weight in the plan would come out too heavy.";
/* The camp loads every lift from a WORKING WEIGHT, never a max. They live
   beside the maxes so export, import and the backup file cover them, and
   the maxes themselves are never touched by a camp. */
const CAMP_WORK = [["cw_squat", "Back Squat"], ["cw_tbdl", "Trap Bar Deadlift"], ["cw_bench", "Bench Press"], ["cw_pp", "Push Press"]];
const LIFT_NAME = {}; MAXES.concat(CAMP_WORK).forEach((x) => { LIFT_NAME[x[0]] = x[1]; });
const liftName = (id) => LIFT_NAME[id] || id;
const isWork = (id) => String(id || "").indexOf("cw_") === 0;
/* which engine map and menu the pages read from */
const engMap = () => (MODE.prep ? PENG : MODE.spp ? SPPENG : MODE.camp ? CENG : ENG);
const engMenu = () => (MODE.prep ? PENG_MENU : MODE.spp ? SPPENG_MENU : MODE.camp ? CENG_MENU : ENG_MENU);
const TESTS = [
  { id: "sprint", n: "Flying sprint 20m", u: "s", dir: "down", d: "3 attempts, best time", tgt: "−1–3%" },
  { id: "jump", n: "Depth jump rebound", u: "cm", dir: "up", d: "3 attempts, best height — phone slow-motion or jump mat", tgt: "+3–5%" },
  { id: "mbdiag", n: "Diagonal throw (overhand)", u: "m", dir: "up", d: "3/side, best distance", tgt: "+3–5%" },
  { id: "mbshot", n: "Shot-put (straight)", u: "m", dir: "up", d: "3/side, best distance", tgt: "+3–5%" },
  { id: "squat", n: "Back squat — top triple", u: "kg", dir: "up", d: "pins · the heaviest clean triple, one or two left in you — × 1.08 is the new working max", max: "squat", est: 1.08, tgt: "+3–6%" },
  { id: "bench", n: "Flat bench — top triple", u: "kg", dir: "up", d: "pins, no collars · the heaviest clean triple, one or two left in you — × 1.08 is the new working max", max: "bench", est: 1.08, tgt: "+3–6%" },
  { id: "imtp", n: "Mid-thigh pull peak force", u: "N", dir: "up", d: "only if your gym has a force plate — otherwise leave blank", tgt: "+3–6%", opt: 1 },
  { id: "tb3rm", n: "Trap bar 3RM", u: "kg", dir: "up", d: "hard triple × 1.08 sets the trap bar max", max: "tbdl", est: 1.08, tgt: "+3–6%" },
  { id: "bike20", n: "20-min bike test (distance)", u: "m", dir: "up", d: "Sunday of week 1 and week 16", tgt: "+3–5%", sun: 1 },
];


/* ================================================================
   TIMER — one engine, docked at the bottom, expands to a round clock
   ================================================================ */

/* the timers that are boxing rounds: the ring bell starts and ends each round */
export const BELL_KINDS = ["sim", "csim", "ergrounds", "pressure"];
/* a timer's parts, for the tests that walk every second of one */
export const timerSteps = (kind, o) => steps(kind, o);
function useTimer(sound) {
  const [t, setT] = useState(null);
  const [open, setOpen] = useState(false);
  const tRef = useRef(null), endRef = useRef(0), beepRef = useRef(""), warnRef = useRef(""), runRef = useRef(0), lockRef = useRef(null);
  useEffect(() => { tRef.current = t; }, [t]);
  /* the parts of a timer are said out loud as they start: on a timer of rounds, as each round starts and ends and at its minutes; on any other, each part of 10 seconds or more */
  const say = useCallback((text) => { if (!sound) return; try {
    const sy = window.speechSynthesis; if (!sy || typeof SpeechSynthesisUtterance === "undefined") return;
    sy.cancel(); const u = new SpeechSynthesisUtterance(String(text || "").replace(/\bRD\b/g, "ROUND").replace(/\bMIN\b/g, "MINUTE").replace(/·/g, ",").replace(/ — /g, ", ").toLowerCase()); u.rate = 1.05; sy.speak(u);
  } catch (e) {} }, [sound]);
  /* the sounds: one engine for every timer (sound.js). Every timer gets the
     timekeeper's clapper at ten seconds and the ring bell when it runs out;
     a timer of boxing rounds rings the bell at each round's edges too. */
  const cueNow = useCallback((name) => { if (sound) play(name); }, [sound]);
  const lock = useCallback(async (on) => { try {
    if (on) { if (!lockRef.current && navigator.wakeLock) { const l = await navigator.wakeLock.request("screen"); lockRef.current = l; l.addEventListener("release", () => { if (lockRef.current === l) lockRef.current = null; }); } }
    else if (lockRef.current) { const l = lockRef.current; lockRef.current = null; await l.release(); }
  } catch (e) {} }, []);
  /* the phone lets go of the screen lock whenever the app leaves the screen: take it again on the way back */
  useEffect(() => { const back = () => { if (document.visibilityState === "visible" && tRef.current && tRef.current.run) lock(true); };
    document.addEventListener("visibilitychange", back); return () => document.removeEventListener("visibilitychange", back); }, [lock]);
  useEffect(() => {
    if (!t || !t.run) { lock(false); return; }
    lock(true);
    const id = setInterval(() => {
      const cur = tRef.current; if (!cur || !cur.run) return;
      const rem = Math.ceil((endRef.current - Date.now()) / 1000);
      const rounds = BELL_KINDS.indexOf(cur.kind) >= 0, here = cur.steps[cur.i];
      /* the 3-2-1, and ten seconds left: of the round, the rest, or the part (sound.js says which) */
      const b = beatAt(cur.steps, cur.i, rem, rounds);
      if (b.tick && beepRef.current !== cur.i + ":" + rem) { beepRef.current = cur.i + ":" + rem; cueNow("tick"); buzz(35); }
      if (b.warn && warnRef.current !== runRef.current + ":" + cur.i) { warnRef.current = runRef.current + ":" + cur.i; cueNow("warn"); buzz([60, 60, 60]); }
      if (rem <= 0) {
        const n = cur.i + 1;
        if (n < cur.steps.length) { const nx = cur.steps[n], name = cueFor(here, nx, rounds), now = Date.now();
          /* the next part is timed from the end of this one, so a long timer never runs slow; after the phone has slept, from now */
          endRef.current = (now - endRef.current < 1500 ? endRef.current : now) + nx.s * 1000;
          cueNow(name); buzz(nx.t === "w" ? [120, 60, 120] : 200);
          if (cur.steps.length > 1 && (rounds ? /^bell|^change/.test(name) : nx.s >= 10)) say(nx.l);
          setT(Object.assign({}, cur, { i: n, left: Math.max(1, Math.ceil((endRef.current - now) / 1000)) })); }
        /* the end: a rest clock running out rings the bell once (back to work, the way a round starts); any other timer, sound.js says */
        else { cueNow(cur.kind === "rest" ? "bell1" : cueFor(here, null, rounds)); buzz([150, 80, 150, 80, 320]); if (cur.steps.length > 1) say("done"); setT(Object.assign({}, cur, { i: n, left: 0, run: false, done: true }));
          if (cur.kind === "rest") setTimeout(() => { const c2 = tRef.current; if (c2 && c2.done && c2.kind === "rest") { setT(null); setOpen(false); } }, 1500); }
      } else if (rem !== cur.left) setT(Object.assign({}, cur, { left: rem }));
    }, 200);
    return () => clearInterval(id);
  }, [t && t.run, t && t.i, t && t.steps]);
  const start = useCallback((preset) => { const st = steps(preset.kind, preset.opt); if (!st.length) return; endRef.current = Date.now() + st[0].s * 1000; beepRef.current = ""; runRef.current += 1;
    setT({ steps: st, i: 0, left: st[0].s, run: true, title: preset.title || "TIMER", kind: preset.kind, done: false }); setOpen(preset.kind !== "rest"); cueNow(st.length > 1 ? cueFor(null, st[0], BELL_KINDS.indexOf(preset.kind) >= 0) : "tick");
    if (st.length > 1) say(st[0].l); }, [cueNow, say]);
  const toggle = useCallback(() => { const cur = tRef.current; if (!cur || cur.done) return; if (cur.run) setT(Object.assign({}, cur, { run: false })); else { endRef.current = Date.now() + cur.left * 1000; setT(Object.assign({}, cur, { run: true })); } }, []);
  const skip = useCallback(() => { const cur = tRef.current; if (!cur) return; const n = cur.i + 1; if (n < cur.steps.length) { endRef.current = Date.now() + cur.steps[n].s * 1000; setT(Object.assign({}, cur, { i: n, left: cur.steps[n].s })); } else setT(Object.assign({}, cur, { i: n, left: 0, run: false, done: true })); }, []);
  const reset = useCallback(() => { const cur = tRef.current; if (!cur) return; endRef.current = Date.now() + cur.steps[0].s * 1000; runRef.current += 1; beepRef.current = ""; setT(Object.assign({}, cur, { i: 0, left: cur.steps[0].s, run: false, done: false })); }, []);
  const close = useCallback(() => { setT(null); setOpen(false); }, []);
  return { t, open, setOpen, start, toggle, skip, reset, close };
}

/* ================================================================
   PLATES
   ================================================================ */
function Plates({ kg, bar, onClose }) {
  const [b, setB] = useState(bar || 20);
  const P = [25, 20, 15, 10, 5, 2.5, 1.25];
  const perSide = (kg - b) / 2; const out = []; let rem = perSide;
  if (perSide > 0) P.forEach((p) => { const n = Math.floor(rem / p + 1e-9); if (n > 0) { out.push([p, n]); rem = +(rem - n * p).toFixed(3); } });
  return (
    <div style={{ position: "fixed", inset: 0, background: C.scrim, zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, paddingTop: "calc(20px + env(safe-area-inset-top))", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }} onClick={onClose}>
      <div style={{ background: C.card, border: "1px solid " + C.brass, borderRadius: 14, padding: 20, maxWidth: 340, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <Eye c={C.brass}>Plates per side</Eye>
        <div style={Object.assign({}, mno, { fontSize: 42, fontWeight: 700, color: C.chalk, margin: "2px 0 10px" })}>{kg}<span style={{ fontSize: 18, color: C.ash }}> kg</span></div>
        <Seg opts={[[20, "20 KG BAR"], [25, "25 KG TRAP BAR"]]} val={b} on={setB} c={C.brass} />
        <div style={{ marginTop: 12 }}>
          {perSide <= 0 ? <Note>Bar only, or lighter than the bar.</Note>
            : out.map((o) => <div key={o[0]} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 18, fontWeight: 600, color: C.chalk })}>{o[0]} kg</span>
              <span style={Object.assign({}, mno, { fontSize: 18, color: C.brass })}>× {o[1]}</span></div>)}
          {rem > 0.01 ? <Note c={C.oxide}>{rem} kg per side unmatched — load {r25(kg)} kg.</Note> : null}
        </div>
        <Btn on={onClose} c={C.brass} fill s={{ width: "100%", marginTop: 16 }}>CLOSE</Btn>
      </div>
    </div>);
}

/* ================================================================
   HOW A SET IS LOGGED

   Bodyweight work has no weight to write down: it logs reps — seconds when
   the prescription is a hold — and the level the line is on, and nothing
   else. Two exercises are bodyweight plus a load, so they log that load as
   +kg beside the bodyweight. Everything else — barbell, trap bar, dumbbell,
   sled — keeps the weight field. The same map governs both programs, camp
   mode's calisthenics rows included, because they share these item ids.
   ================================================================ */
const BW_ITEMS = ["ringrow", "ringdip", "muscleup", "pistol", "lsit", "lever", "nordic", "c_nordic",
  "crawl", "c_crawl", "spanish", "c_spanish", "copen", "c_copen", "c_copenplank",
  "hands2", "c_hands_mon", "c_hands_thu", "c_hands_sun", "s_pushup"];
/* Strength, Power and Physique's weighted chin-ups, dips and pull-ups log
   the weight on the belt */
const ADD_ITEMS = ["chin", "c_chinup", "achilles", "achilles_c", "s_chin", "s_dip", "s_pullup", "s_landrot", "s_lmpress", "s_lmpush", "p_lmpush", "c_lmpush", "lmpush"];
/* the ones prescribed as a hold, so the number is seconds and not reps */
const SECS_ITEMS = ["lsit", "lever", "spanish", "c_spanish", "copen", "c_copen", "c_copenplank",
  "hands2", "c_hands_mon", "c_hands_thu", "c_hands_sun", "achilles", "achilles_c"];
const SET_MODE = {}; BW_ITEMS.forEach((id) => { SET_MODE[id] = "bw"; }); ADD_ITEMS.forEach((id) => { SET_MODE[id] = "add"; });
/* Strength, Power and Physique's bodyweight core: no weight box */
const NO_LOAD = { hlr: 1, abwheel: 1 };
/* a log key's date, off the season's rows */
const keyDate = (p) => { const row = seasonRow(p.macro, p.week); return row ? addDays(row.mon, DAYS.indexOf(p.day)) : null; };
/* last time's sets as one line: "60 KG × 10 · 10 · 9", or each set's own weight when they differ */
const lastLine = (last, md) => { const pre = md === "add" ? "+" : ""; const same = last.sets.every((x) => x.w === last.sets[0].w);
  const reps = last.sets.map((x) => x.r || "—").join(" · ");
  return "Last time · " + fmtDate(last.d) + " · " + (last.sets[0].w == null ? reps : same ? pre + last.sets[0].w + " kg × " + reps
    : last.sets.map((x) => pre + x.w + " × " + (x.r || "—")).join(" · ") + " kg"); };
const SET_SECS = {}; SECS_ITEMS.forEach((id) => { SET_SECS[id] = 1; });
/* last time's sets for any exercise, to put beside today's: with their
   weights where it has them, the reps alone where it has none */
const lastSets = (log, id, before, md) => { if (md !== "bw") return lastSession(log, id, before, keyDate);
  let best = null;
  Object.keys(log || {}).forEach((k) => { const p = parseKey(k); if (!p || p.id !== id) return;
    const e = log[k], done = ((e && e.sets) || []).filter((x) => x && x.ok && x.r != null && x.r !== ""); if (!done.length) return;
    const d = e.d || keyDate(p); if (!d || d >= before) return;
    if (!best || d > best.d) best = { d, sets: done.map((x) => ({ w: null, r: x.r })) }; });
  return best; };
/* how many of a card's sets are done, of how many: a pair's LOG SET goes to whichever is behind */
const setsLeft = (card, rx, log, dkey) => { const so = card && card.item ? setsOf(card, rx) : null; if (!so) return null;
  const rows = (log[dkey + "-" + card.item.id] || {}).sets || []; let d = 0;
  for (let i = 0; i < so.n; i++) if (rows[i] && rows[i].ok) d++;
  return { n: so.n, d }; };
/* the tendon work's pushes and lifts: their 3-second holds are in the line,
   but a set is counted in pushes or lifts, not seconds */
const SET_REPS = { s_achpush: 1, s_kneepush: 1, s_copenlift: 1, s_star: 1 };
const setMode = (id) => SET_MODE[id] || "kg";
/* the calisthenics line an item is logged against, for the level on the row */
const LINE_OF = { ringdip: "ringdip", muscleup: "muscleup", pistol: "pistol", ringrow: "ringrow", lsit: "lsit", lever: "slowlane" };
/* a taper or a sore joint turns a line into a hold, so the unit follows the
   prescription rather than the exercise */
const holdish = (t) => /\bhold\b|second|\b\d+\s*s\b/i.test(String(t || ""));


/* the first number in a field typed as "12.4 km / 138" */
const firstNum = (t) => { const m = String(t == null ? "" : t).replace(",", ".").match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
/* fast and contrast sets end at a 10% slowdown, strength sets at 20% */
const FASTPH = { contrast: 1, fast: 1, cluster: 1 };
const velFast = (b, rx) => {
  if (b.vel === "bench") { const bp = rx.camp ? campBench(rx.w) : prepBench(rx.d); return !!(bp && FASTPH[bp.phase || bp.ph]); }
  return !!FASTPH[rx.lift];
};

/* The how line: one or two sentences on how to perform the exercise, and
   nothing else. Everything the documents say beyond that — the why, the
   history, the conditions — lives on the PLAN tab. */
export function howLine(t) {
  const s = String(t || "").trim(); if (!s) return "";
  const parts = s.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts || parts.length <= 2) return s;
  return parts.slice(0, 2).join("").trim();
}

/* What last week reads back as. Bodyweight work has only the reps or the
   seconds to show; added-load work shows the load with a plus in front. */
/* ================================================================
   THE ENGINE — every conditioning row carries last time's number for
   that session type, and the target the document sets for it.
   ================================================================ */
export function lastOfKind(log, kind, exceptKey) {
  if (!kind) return null;
  let best = null;
  Object.keys(log || {}).forEach((k) => {
    const e = log[k];
    if (!e || e.kind !== kind || e.w == null || e.w === "" || k === exceptKey) return;
    if (!best || String(e.d || "") > String(best.d || "")) best = { k, w: e.w, d: e.d || null };
  });
  return best;
}

const setsSummary = (e, mode, secs) => {
  if (!e) return "";
  const u = secs ? " s" : "";
  if (e.sets && e.sets.some((s) => s.ok)) {
    const ok = e.sets.filter((s) => s.ok);
    if (mode === "bw") return ok.map((s) => s.r).join(",") + u;
    const pre = mode === "add" ? "+" : "";
    const ws = ok.map((s) => s.w);
    if (ws.every((x) => x == null || x === "")) return ok.map((s) => s.r).join(",") + u;
    const same = ws.every((x) => x === ws[0]);
    return same ? pre + ws[0] + " kg × " + ok.map((s) => s.r).join(",") + u : ok.map((s) => pre + s.w + "×" + s.r).join(" · ");
  }
  if (e.w) return e.w + (e.r ? " × " + e.r : "");
  return "";
};

/* Shoulders, elbows or wrists at 4 or above on last Sunday's check take
   every calisthenics line to holds this week. The row and the panel read
   it from the same place, so they never disagree. */
const jointFlagFor = (log, macro, week) => { if (week < 2) return false;
  return ["wr_sh", "wr_el", "wr_wr"].some((id) => { const e = log["m" + macro + "w" + (week - 1) + "-sun-" + id]; const n = e ? num(e.w) : null; return n != null && n >= 4; }); };

/* ================================================================
   PROTOCOL SHEET
   ================================================================ */
function ProtoSheet({ id, close }) {
  const p = PROTO[id]; if (!p) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: C.scrim, zIndex: 90, display: "flex", alignItems: "flex-end" }} onClick={close}>
      <div className="rise" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderTop: "3px solid " + p.c, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 640, margin: "0 auto", maxHeight: "86vh", overflowY: "auto", padding: 16, paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div><Eye c={p.c} s={{ marginBottom: 2 }}>Protocol</Eye><div style={Object.assign({}, dsp, { fontSize: 22, fontWeight: 800, letterSpacing: .4, color: C.chalk })}>{p.n}</div><div style={Object.assign({}, mno, { fontSize: 12, color: C.ash, marginTop: 3 })}>{p.s.toUpperCase()}</div></div>
          <Btn on={close} c={C.ash} small s={{ minWidth: 44, minHeight: 44 }}>CLOSE</Btn>
        </div>
        <div style={{ marginTop: 12 }}>
          {p.i.map((it, i) => it[1] ? (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 15, color: C.chalk, fontWeight: 600 })}>{it[0]}</span>
              <span style={Object.assign({}, mno, { fontSize: 12, color: C.brass, textAlign: "right", flexShrink: 0, maxWidth: "58%" })}>{it[1]}</span>
            </div>) : <Eye key={i} c={C.brass} s={{ margin: i ? "14px 0 6px" : "0 0 6px" }}>{it[0]}</Eye>)}
          {p.note ? <Note s={{ fontStyle: "italic", marginTop: 14 }}>{p.note}</Note> : null}
        </div>
      </div>
    </div>);
}

/* ---------------- THE RUNNING ORDER ----------------
   Every step is a row: number · clock time · exercise · sets × reps ·
   load · rest. The three columns below are built from the prescription
   the week resolves to, never from a sentence about it. */
const START_MIN = (sess) => (sess && sess.fight ? 19 * 60 : sess && sess.free ? (MODE.camp ? 8 * 60 + 30 : 8 * 60 + 15) : 3 * 60 + 30);
/* fight day: the session start is the bell, and the food runs back from it */
const fightDayOf = (rx, day) => MODE.camp && !!rx.fightWeek && daysOut(day, rx) === 0;
/* "4 × 3 @ 80% — bar speed" → ["4 × 3", "80%"] */
const splitPres = (s) => {
  const t = String(s || "").trim(); if (!t) return ["", ""];
  const i = t.indexOf("@");
  if (i < 0) return [t.split(" — ")[0].split(/\s·\s*rest\b/i)[0].trim(), ""];
  const tail = t.slice(i + 1).trim();
  /* only a percentage or a weight is a load; "@ RPE 8" is the work itself */
  if (!/^[\d~]/.test(tail) && tail.indexOf("%") < 0) return [t, ""];
  return [t.slice(0, i).replace(/[\s·—-]+$/, "").trim(), tail.split(" — ")[0].split(" · ")[0].trim()];
};
/* A calisthenics level is written as a sentence; the row wants the
   prescription out of the front of it. */
const presOf = (s) => { const m = String(s || "").match(/^(.*?\d+\s*×\s*[^,;.(·]*)/); return m ? m[1].trim() : String(s || ""); };
const restCol = (r) => { const t = String(r || "").trim(); if (!t) return ""; return /^rest/i.test(t) ? t : "rest " + t; };

/* The row for one step, in one week: { work, load, rest }. */
function rowFor(b, rx, calc, calis, mode) {
  const its = (v(b.items, rx) || []).filter((x) => x.k !== "txt");
  /* the prescription the step is loaded from: the logged lift if there is
     one, else the first item written as sets × reps, else the first item */
  const first = its.find((x) => x.k === "wr")
    || its.find((x) => /^\s*\d+\s*×/.test(String(v(x.s, rx) || "")))
    || (v(b.p, rx) && PROTO[v(b.p, rx)] ? null : its[0]) || null;
  let work = "", load = "";
  if (b.settle) {
    work = "60 s";
  } else if (b.cal && calis) {
    const lev = curLevel(calis, b.cal);
    work = presOf(levelPres(b.cal, lev, rx.w, mode));
    load = "level " + lev.l;
  } else if (b.eng && engMap()[rx[b.engKey || "eng"]]) {
    work = engMap()[rx[b.engKey || "eng"]].d;
  } else if (b.review) {
    work = String(its.length) + " numbers";
  } else if (first) {
    const p = splitPres(v(first.s, rx));
    work = p[0]; load = p[1];
    const kg = first.mk && first.pct != null ? calc(first.mk, v(first.pct, rx)) : null;
    if (kg) load = (load ? load + " · " : "") + kg.join("–") + " kg";
  } else if (v(b.p, rx) && PROTO[v(b.p, rx)]) {
    work = PROTO[v(b.p, rx)].s.split(" · ")[0];
  }
  /* a step whose items carry no sets × reps takes the week's own line,
     as long as that line is a prescription and not a sentence */
  if (work.indexOf("×") < 0 && b.rxLine) {
    const line = String(b.rxLine(rx) || "").split(" — ")[0].trim();
    if (/\d/.test(line) && line.length <= 40 && line.indexOf(",") < 0) work = line;
  }
  return { work, load, rest: restCol(v(b.rest, rx)) };
}
const dayKey = (macro, week, day) => "m" + macro + "w" + week + "-" + day;
const prevDayKey = (macro, week, day, L) => { const i = DAYS.indexOf(day); if (i > 0) return dayKey(macro, week, DAYS[i - 1]);
  if (typeof macro === "string") { const pr = prevRow(seasonRow(macro, week)); return pr ? dayKey(pr.mac, pr.kw, "sun") : dayKey(macro, week, "mon"); }
  if (week > 1) return dayKey(macro, week - 1, "sun"); return dayKey(macro - 1, L, "sun"); };

/* ================================================================
   THE CHECK — four yes/no taps. The app counts them and resolves the
   day: nothing on the screen states the rule, and the loads below are
   already the answer.
   ================================================================ */
const CHECK_Q = CAMP_DAILY_CHECK.q;
export const checkReady = (a) => {
  const ans = a || [];
  if (ans.filter((x) => x === "y" || x === "n").length < CHECK_Q.length) return "";
  const yes = ans.filter((x) => x === "y").length;
  return yes >= 4 ? "R" : yes >= 2 ? "Y" : "G";
};

/* ================================================================
   TODAY — ONE GUIDED FLOW

   The whole day, top to bottom, as one ordered list: the morning, the
   session, the site, lunch, the evening. Every item appears once. The
   current item is open with its timer or its fields; everything above
   it is collapsed with a tick, everything below is collapsed. One NEXT
   button moves down the list. The clock times come from the session
   start time entered at the top.
   ================================================================ */

const CASEIN_LINE = "Thirty to forty grams of slow protein, the last thing before the light goes off.";
/* The evening's RANGE: twelve weeks of RANGE, then THE KEEP; camp's
   fight week runs it at half dose. Each is home-routines.md's cards. */
export const rangeRoutine = (rw, fightWeek) => (fightWeek
  ? { n: "RANGE — FIGHT WEEK", cards: FIGHT_WEEK_CARDS, mins: ROUTINE_MINS.fight }
  : isKeepWeek(rw) ? { n: rangeTitle(rw), cards: KEEP_CARDS, mins: ROUTINE_MINS.keep }
  : { n: rangeTitle(rw), cards: RANGE_CARDS, mins: ROUTINE_MINS.range });
const parseHHMM = (s, fallback) => { const m = String(s || "").match(/^\s*(\d{1,2})\s*[:.]?\s*(\d{2})\s*$/); if (!m) return fallback;
  const h = Number(m[1]), x = Number(m[2]); if (h > 23 || x > 59) return fallback; return h * 60 + x; };

/* The day's clock, shared by TODAY and the GUIDE's next feed: the session
   start (or the wake, on a day with no session), and the light going off. */
function dayClock(week, day, log, dk) {
  const rx = rxFor(week, day);
  const own = sessFor(day, rx) || S[day] || S.mon;
  const noSess = !!rx.hold || (MODE.camp && !sessFor(day, rx)) || sleepDay(day, rx);
  const def = noSess ? 5 * 60 : START_MIN(own);
  const startStr = (log[dk + "-start"] || {}).w || hhmm(def);
  const lt = lightsTarget(day);
  /* Saturday night aims for eight and a half hours before Sunday's wake */
  const lights = lt.t ? tMin(lt.t) : START_MIN({ free: 1 }) - 120 - 510 + 1440;
  return { rx, own, noSess, def, startStr, S: parseHHMM(startStr, def), lights };
}

/* The fuel phase: read off the app's one season; the fortnight after a
   fight is the transition. Making weight isn't a phase but a step on top
   of it (weight-making.md). */
function fuelPhaseOf(st, week, isoDay) {
  /* the season's own week on that day */
  const row = SEASON.s ? rowOn(SEASON.s, isoDay) : null;
  if (row) {
    if (row.program === "transition") return "trans";
    /* Strength, Power and Physique: the food is yours — the day as printed */
    if (row.program === "spp") return null;
    if (row.program === "camp") return row.id === "E" ? "easy" : row.id === "S" ? "sharpen" : row.id === "FW" ? "fight" : "camp";
    if (row.program === "pre") return "camp";
    return row.doc <= 5 ? "build" : row.doc <= 10 ? "heavy" : row.doc <= 13 ? "fast" : "test";
  }
  if (week === 5 || week === 10) return "easy";
  if (week === 15 || week === 16) return "test";
  return "camp";
}

/* The movement session, guided, as a full screen. */
function MoveTool({ sound, onClose }) {
  return (
    <Sheet title="THE MOVEMENT SESSION" sub={ROUTINE_MINS.move + " MIN · NOTHING HERE IS RUSHED"} colour={C.violet} onClose={onClose}>
      <RoutineRunner cards={MOVE_CARDS} sound={sound} colour={C.violet} />
    </Sheet>);
}

/* ================================================================
   THE GYM CARD — one exercise, with only what it needs

   The name, the library entry, the prescription in one line, and then
   the one thing to do: the set buttons, the round timer, the fields.
   Tapping a set starts the rest timer.
   ================================================================ */
const SETS_LEAD = /^\s*(\d+)\s*×\s*([^·,@]*)/;
function setsOf(card, rx) {
  const it = card.item; if (!it) return null;
  if (it.k === "wr") return { n: Math.max(1, Number(v(it.sets, rx)) || 1), reps: v(it.reps, rx) };
  if (it.k === "chk") { const m = String(v(it.s, rx) || "").match(SETS_LEAD); if (m) return { n: Math.max(1, Number(m[1])), reps: m[2].trim(), tick: 1 }; }
  return null;
}

/* the working maxes the day's top triples set: the back-off sets read
   them the moment the triple is logged */
const topsOn = (log, dk) => { const o = {}; Object.keys(log || {}).forEach((k) => { if (k.indexOf(dk + "-") !== 0) return; const e = log[k];
  if (e && e.top && e.mk && num(e.est)) o[e.mk] = num(e.est); }); return o; };

/* the weekly check's bodyweight lines */
const BW_OUTS = { wr_bw: 1, cwr_bw: 1 };

/* One result box from its spec on the item (camp.js, prep.js): a number
   opens the number pad, a word the keyboard, a time the time picker, and
   a choice is big buttons — tap again to clear. */
function OutField({ f, v, on }) {
  if (f.ch) {
    const cur = String(v == null ? "" : v).toLowerCase();
    return (
      <div role="group" aria-label={f.l} data-out-field={f.k} style={{ marginTop: 12 }}>
        <div style={Object.assign({}, mno, { fontSize: T3, color: C.ash, marginBottom: 4 })}>{f.l}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {f.ch.map((c) => { const on1 = cur === c.toLowerCase();
            return <BigBtn key={c} on={() => { on(on1 ? "" : c.toLowerCase()); buzz(20); }} c={C.brass} fill={on1} pressed={on1} s={{ minHeight: 56, padding: "10px 6px" }}>{c}</BigBtn>; })}
        </div>
      </div>);
  }
  return <div data-out-field={f.k}><Input label={f.l} v={v} on={on} type={f.kb === "text" || f.kb === "time" ? f.kb : undefined} /></div>;
}
/* the total of the last session of the same type, before this one */
function lastErgTotal(log, macro, kind, day, self) {
  let best = null;
  Object.keys(log || {}).forEach((k) => {
    if (k === self || !/_erg$/.test(k) || k.indexOf("m" + macro + "w") !== 0) return;
    const e = log[k] || {}; if (!kind || e.kind !== kind || !e.d || (day && e.d >= day)) return;
    const t = ergTotal(e.v || []); if (t == null) return;
    if (!best || e.d > best.d) best = { d: e.d, t };
  });
  return best ? best.t : null;
}
/* A PAIR: two exercises on one card — each its own name, entry, line and
   sets, a set of one, its rest, then a set of the other. A pain stop
   stops the one exercise. */
function PairCard(props) {
  const { card, rx, log, macro, week, day, slot } = props;
  /* a set of one, its rest, then a set of the other: the button in the bar logs whichever has fewer sets done, the first when they're level */
  const left = card.subs.map((sc) => setsLeft(sc, rx, log, "m" + macro + "w" + week + "-" + day));
  let turn = -1;
  left.forEach((x, i) => { if (x && x.d < x.n && (turn < 0 || x.d < left[turn].d)) turn = i; });
  return (
    <div data-gym-card={card.key} data-pair="1">
      <CardHead name={card.n} pres={card.pres} />
      {card.subs.map((sc, i) => (
        <div key={sc.key} data-pair-part={i} style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid " + C.line }}>
          <GymCardOne {...props} card={sc} zone={null} onPainStop={null} slot={i === turn ? slot : null} sub />
        </div>))}
    </div>);
}
function GymCard(props) {
  return props.card && props.card.kind === "pair" ? <PairCard {...props} /> : <GymCardOne {...props} />;
}
/* the clocks started since the app opened, by day and card */
const RAN = {};
function GymCardOne({ card, rx, week, macro, day, log, setLog, maxes, bw, ready, startTimer, stopTimer, autoRest, calis, st, openTool, onSetMax, weekDates, onPainStop, wt, zone, slot, sub }) {
  const b = card.b, it = card.item;
  const dkey = "m" + macro + "w" + week + "-" + day;
  const key = (id) => dkey + "-" + id;
  const setE = (id, e) => { const n = Object.assign({}, log); n[key(id)] = e; setLog(n); };
  const yellow = ready === "Y", red = ready === "R";
  const tops = topsOn(log, dkey);
  const workMax = (mk) => tops[mk] || num(maxes[mk]);
  const calc = (mk, pct) => { const m = workMax(mk); if (!m || pct == null) return null; const adj = yellow ? 0.93 : 1;
    const lo = Array.isArray(pct) ? pct[0] : pct, hi = Array.isArray(pct) ? pct[1] : pct; const a = r25(m * lo / 100 * adj), z = r25(m * hi / 100 * adj); return a === z ? [a] : [a, z]; };
  const engKind = b.eng ? (b.engKey === "base" ? "base" : rx[b.engKey || "eng"]) : null;
  const engDay = (weekDates && weekDates[DAYS.indexOf(day)]) || null;
  const patchOut = (id, val) => setE(id, Object.assign({}, log[key(id)], { w: val }, engKind ? { kind: engKind, d: engDay } : {}));
  const restSecs = Number(card.rt) || 60;
  /* the power block's rest carries its three jumps or throws */
  const startRest = () => startTimer(card.restT ? v(card.restT, rx) : { kind: "rest", opt: { secs: restSecs }, title: "REST" });
  const needsCal = b.calib && card.first !== false && ((rx.cal && rx[b.calib === "tbdl" ? "tb" : "pp"] && rx[b.calib === "tbdl" ? "tb" : "pp"].cal) || !num(maxes[b.calib]));
  const [calIn, setCalIn] = useState("");
  /* a card with a clock of its own: START is the button to press until it
     has been pressed, then NEXT is */
  const [ran, setRan] = useState(!!RAN[dkey + "|" + card.key]);
  const run = (tm) => { RAN[dkey + "|" + card.key] = true; setRan(true); startTimer(tm); };
  const ticks = (log[key("wu_" + card.key)] || {}).t || {};
  /* OPTIMAL 8 · MOVE: the level each move is on, kept for good, not by day */
  const lv = (log[LEVEL_KEY] || {}).lv || {};
  const stepLv = (id, by) => { const n = Object.assign({}, log); n[LEVEL_KEY] = { lv: stepLevel(lv, id, by) }; setLog(n); buzz(20); };
  /* a jump, sprint or hold that hurts more than 3 out of 10 stops for the day */
  const painable = painRow(card.lib) || (card.parts || []).some((p) => painRow(p.lib)) || !!(b.painIf && b.painIf(rx));
  const painKey = "pain_" + card.key;
  const painStopped = painable && !!(log[key(painKey)] || {}).stop;

  /* MAKING WEIGHT: on a Sunday the plan checks, the bodyweight line is
     the weight result */
  const sunIso = card.kind === "review" && day === "sun" && weekDates ? weekDates[6] : null;
  const wCheck = sunIso && wt && wt.day(sunIso) ? wt.plan.checks[sunIso] : null;
  const putF = (id, p) => setE(id, Object.assign({}, log[key(id)], p, engKind ? { kind: engKind, d: engDay } : {}));
  /* PREP and CAMP: a box per value, from the item's own spec */
  const specBoxes = (o) => {
    const fs = v(o.fields, rx) || [], e = log[key(o.id)] || {};
    const ergK = o.id + "_erg", ergE = log[key(ergK)] || {}, ergV = ergE.v || [];
    const dropK = o.id + "_drop", dropE = log[key(dropK)] || {};
    const putDrop = (p) => { const n = Object.assign({}, dropE, p), d = recoveryDrop(n.end, n.h60); n.w = d == null ? "" : String(d); setE(dropK, n); };
    return (
      <div key={o.id} data-out-id={o.id}>
        {o.erg ? <ErgPanel slots={o.erg} vals={ergV} unit={(st && st.ergUnit) || "w"} prevTotal={lastErgTotal(log, macro, engKind, engDay, key(ergK))}
          onVal={(i, val) => { const nv = ergV.slice(); while (nv.length < o.erg.length) nv.push(""); nv[i] = val; setE(ergK, Object.assign({}, ergE, { v: nv }, engKind ? { kind: engKind, d: engDay } : {})); }} /> : null}
        {o.lastKm && engKind ? (() => { const p = lastOfKind(log, engKind, key(o.id));
          return p ? <div data-testid="last-run" style={Object.assign({}, mno, { fontSize: T3, color: C.chalk, lineHeight: 1.5, marginTop: 10 })}>{"Last time · " + p.w + " km" + (num((log[p.k] || {}).hr) != null ? " · peak " + log[p.k].hr + " bpm" : "")}</div> : null; })() : null}
        {fs.map((f) => <OutField key={f.k} f={f} v={e[f.k]} on={(val) => putF(o.id, { [f.k]: val })} />)}
        {o.recov ? <RecoveryHR endHR={dropE.end} hr60={dropE.h60} onEnd={(val) => putDrop({ end: val })} on60={(val) => putDrop({ h60: val })} /> : null}
      </div>);
  };
  const outs = (card.outs || []).map((o) => (wCheck && BW_OUTS[o.id]
    ? <WeightResult key={o.id} check={wCheck} asked={(wt.morning[sunIso] || {}).kgAsk} onAsk={(val) => wt.put(sunIso, { kgAsk: val })} /> :
    o.fields || o.erg || o.recov ? specBoxes(o) :
    <Input key={o.id} label={((card.outs.length > 1 || !o.u ? v(o.n, rx) + (o.u ? " (" + o.u + ")" : "") : o.u) || "output").toUpperCase()} v={(log[key(o.id)] || {}).w} on={(val) => patchOut(o.id, val)} />));
  /* the Sunday rounds on two machines: the fade is the last round's share
     of round one */
  const twoM = (o) => !!o && (v(o.fields, rx) || []).some((f) => f.k === "cal");
  const rdOuts = (card.outs || []).filter(twoM);
  const fadeNow = rdOuts.length === 2 ? fadePct(log[key(rdOuts[0].id)], log[key(rdOuts[1].id)]) : null;
  const fadeUI = fadeNow != null ? (
    <div data-testid="round-fade" style={Object.assign({}, mno, { fontSize: T2, fontWeight: 700, color: fadeNow >= STOP_PCT ? C.brass : C.oxide, marginTop: 14 })}>THE FADE · {Math.round(fadeNow * 10) / 10}%</div>) : null;

  /* THE STOP RULE: past the fight's own rounds — and the whole second set
     of the double — a round under 75% of round one, or the posture gone,
     is the last; the rest come off, and the fade is scored on it */
  const sr = (card.kind === "round" || card.kind === "eng") && b.stopRule ? b.stopRule(rx) : null;
  let stopUI = null;
  if (sr) {
    const rounds = stopRounds(sr.R, sr.total, sr.double);
    const ol = card.outs || [];
    const firstId = ol[0] ? ol[0].id : null, lastId = ol.length > 1 ? ol[ol.length - 1].id : null;
    const pk = "past_" + card.key, pe = log[key(pk)] || {}, past = pe.p || [];
    /* two machines a round: the stop rule reads each round's share. Its
       boxes are the machines the round's own boxes name — the SkiErg and
       the bike, or from the audit's week the bike alone */
    const two = twoM(ol[0]), first = firstId ? log[key(firstId)] || {} : {};
    const machines = two ? (v(ol[0].fields, rx) || []).map((f) => [f.k, String(f.l).slice(String(f.l).indexOf(" · "))]) : [];
    const r1 = two ? (roundFilled(first) ? 1 : null) : firstId ? num(first.w) : null;
    const state = (p, form) => (two ? stopStateShares(first, p, form, rounds) : stopState(r1, p, form, rounds));
    const stt = state(past, pe.form);
    const write = (p, form) => {
      const n = Object.assign({}, log);
      n[key(pk)] = form == null ? { p } : { p, form };
      const s2 = state(p, form);
      if (s2.done && lastId && s2.last != null) n[key(lastId)] = Object.assign({}, log[key(lastId)],
        two ? Object.assign({}, ...machines.map(([k]) => ({ [k]: s2.last[k] == null ? "" : String(s2.last[k]) }))) : { w: String(s2.last) }, engKind ? { kind: engKind, d: engDay } : {});
      setLog(n);
      if (s2.done && s2.why !== "all" && stopTimer) stopTimer();
    };
    const upto = stt.done ? (stt.stopAt >= 0 ? stt.stopAt + 1 : rounds.length) : stt.next + 1;
    stopUI = (
      <div data-testid="stop-rule" style={{ marginTop: 16, background: C.ink, border: "1px solid " + (stt.done && stt.why !== "all" ? C.oxide : C.line), borderRadius: 14, padding: 12 }}>
        <div style={Object.assign({}, mno, { fontSize: T3, color: C.brass, letterSpacing: .4, lineHeight: 1.4 })}>PAST THE FIGHT · UNDER {STOP_PCT}% OF ROUND ONE, OR THE POSTURE GONE, AND THAT ROUND IS THE LAST</div>
        {r1 ? null : <div style={Object.assign({}, mno, { fontSize: T3, color: C.ash, marginTop: 8 })}>ROUND ONE'S OUTPUT FIRST</div>}
        {rounds.slice(0, upto).map((rd, i) => (
          <div key={rd.k} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {two ? machines.map(([k, l]) => { const cur = past[i] && typeof past[i] === "object" ? past[i] : past[i] ? { w: past[i] } : {};
              return <div key={k} style={{ flex: 2 }}><Input label={rd.label + l} v={cur[k]} on={(val) => { const p = past.slice(); p[i] = Object.assign({}, cur, { [k]: val }); write(p, pe.form); }} /></div>; })
              : <div style={{ flex: 2 }}><Input label={rd.label + " OUTPUT"} v={past[i]} on={(val) => { const p = past.slice(); p[i] = val; write(p, pe.form); }} /></div>}
            <div style={{ flex: 1 }}><BigBtn on={() => write(past.slice(), pe.form === i ? null : i)} c={C.oxide} fill={pe.form === i} label={"Form gone in " + rd.label.toLowerCase()} s={{ minHeight: 56, padding: "8px 6px", fontSize: T3 }}>FORM GONE</BigBtn></div>
          </div>))}
        {stt.done && stt.why !== "all" ? (
          <div data-testid="stop-verdict" style={Object.assign({}, dsp, { fontSize: T2, fontWeight: 800, letterSpacing: .4, color: C.oxide, marginTop: 12, lineHeight: 1.25 })}>
            {rounds[stt.stopAt].label} WAS THE LAST — THE REST ARE OFF. THE POST-MAX SIT NEXT; THE FADE IS SCORED ON THIS ROUND.
          </div>) : null}
      </div>);
  }

  let body = null;
  if (card.kind === "warm") {
    const lvIds = card.list.filter((r) => r.lv).map((r) => r.lv);
    body = (
      <div>
        <Checklist rows={card.list.map((r) => r.head ? r : { n: r.n, s: r.s, level: r.lv ? levelLine(lv, r.lv) : null, text: r.lib ? r.lib.map((e) => e.text).join(" ") : "" })} ticks={ticks}
          onTick={(i) => { setE("wu_" + card.key, { t: Object.assign({}, ticks, { [i]: !ticks[i] }) }); buzz(20); }} />
        {lvIds.length ? <MoveLevels ids={lvIds} lv={lv} onStep={stepLv} /> : null}
      </div>);
  } else if (card.kind === "round" || card.kind === "eng") {
    const tm = card.timer;
    body = (
      <div>
        {tm && !(red && b.hard) ? <BigBtn on={() => run(tm)} c={C.accent} fill={!ran} main={!ran} s={{ marginTop: 16 }}>▶ START{card.kind === "round" ? " THE ROUNDS" : ""}</BigBtn> : null}
        {b.profile ? <BigBtn on={() => openTool({ kind: "profile" })} c={C.brass} s={{ marginTop: 12 }}>DRAW THE PROFILE</BigBtn> : null}
        {outs}
        {fadeUI}
        {stopUI}
      </div>);
  } else if (card.kind === "top") {
    /* THE TOP TRIPLE: the ramp off the working max, then sets of three up
       to one that's hard with one or two left; that weight × 1.08 is the
       working max, and the back-off sets read it straight away. Never a
       true max. In Prep's test week it is the camp's working weight too. */
    const mk = it.mk, wm = num(maxes[mk]), cur = log[key(it.id)] || {};
    const triple = num(cur.w), est = triple ? topMax(triple) : null;
    const also = (MODE.prep || MODE.spp) && rx.testWeek ? ["cw_" + mk] : [];
    const saved = est != null && num(maxes[mk]) === est;
    body = (
      <div data-testid="top-triple">
        <div data-testid="top-ramp" style={Object.assign({}, mno, { fontSize: T3, color: C.chalk, lineHeight: 1.5, marginTop: 14 })}>
          {"Ramp · " + TOP_RAMP.map((r) => (wm ? r25(wm * r[0] / 100) + " kg" : r[0] + "%") + " × " + r[1]).join(" · ")}
        </div>
        <div style={Object.assign({}, mno, { fontSize: T3, color: C.chalk, lineHeight: 1.5, marginTop: 8 })}>Then sets of three, +2.5–5% each, to one that's hard with one or two left · pins set</div>
        <Input label="HEAVIEST CLEAN TRIPLE (KG)" v={cur.w} on={(val) => setE(it.id, Object.assign({}, cur, { w: val, top: 1, mk, est: topMax(num(val)) }))} />
        {est ? <BigBtn on={() => onSetMax(mk, est, "top triple × 1.08 · " + macro + week, also)} c={C.accent} fill={!saved} s={{ marginTop: 10 }}>
          {saved ? "SAVED · WORKING MAX " + est + " KG" : "WORKING MAX · " + triple + " × 1.08 = " + est + " KG"}</BigBtn> : null}
      </div>);
  } else if (card.kind === "lift" || setsOf(card, rx)) {
    const so = setsOf(card, rx);
    const id = it.id, cur = log[key(id)] || {}, rows = cur.sets || [];
    const md = so.tick ? "bw" : setMode(id);
    const sec = !!SET_SECS[id] || (!SET_REPS[id] && md !== "kg" && (holdish(so.reps) || holdish(v(it.s, rx))));
    /* a set counted in metres says so on its row: "20 m" */
    const unit = sec ? " s" : /^\d+(\.\d+)?\s*m\b/.test(String(so.reps || "")) ? " m" : "";
    const ln = LINE_OF[id] && calis ? curLevel(calis, LINE_OF[id]) : null;
    const auto = it.mk && it.pct != null ? calc(it.mk, v(it.pct, rx)) : null;
    /* THE WEIGHT BOX — Strength, Power and Physique: every exercise the
       app doesn't load for you has the weight in one box above its sets,
       last time's sets over it, and the nudge when every set hit the top
       of the range. Today's weight starts as last time's. */
    const boxOn = !!MODE.spp && md !== "bw" && !it.mk && !NO_LOAD[id];
    const last = boxOn ? lastSession(log, id, engDay || "9999-12-31", keyDate) : null;
    const w0 = boxOn ? (cur.w0 != null ? String(cur.w0) : last ? String(Math.max(...last.sets.map((x) => x.w))) : "") : "";
    const stepUp = boxOn && topOfRange(last, so.reps, so.n);
    const repNum = typeof so.reps === "number" ? String(so.reps) : (String(so.reps || "").match(/^\d+(\+\d+)?/) || [""])[0];
    const velLift = b.vel && (it.mk === b.vel || it.mk === "cw_" + b.vel) && it.id !== "throw" && it.id !== "c_benchthrow" ? b.vel : null;
    /* Strength, Power and Physique reads its target off the line at the set's own percentage */
    const velT = velLift ? (rx.spp ? targetFor(st && st.profiles, velLift, sppVelPhase(v(it.pct, rx)), v(it.pct, rx))
      : targetFor(st && st.profiles, velLift, rx.camp ? campPhaseOfWeek(rx.w) : phaseOfWeek(rx.doc || rx.w))) : null;
    /* the same lift at its previous session: fast then too, and today's
       fast reading adds 2.5% */
    const prev = velT ? prevReading(log, velLift, engDay || "9999-12-31", key(id)) : null;
    const verdict = velT ? verdictFor(cur.v1, velT.v, !!(prev && isFast(prev.v1, prev.vt))) : null;
    const afterKg = velT && verdict && verdict.pct && auto && !(verdict.kind === "up" && cur.bumped) ? adjustLoad(auto[0], verdict) : null;
    const wmNow = it.mk ? workMax(it.mk) : null;
    const defW = (i) => { if (md === "bw") return ""; for (let k = i - 1; k >= 0; k--) if (rows[k] && rows[k].w) return rows[k].w;
      if (i > 0 && afterKg != null) return String(afterKg); return md === "add" || !auto ? w0 : String(auto[0]); };
    /* Strength, Power and Physique's sets carry the exercise's name and the day, for NUMBERS */
    const tag = MODE.spp ? { n: card.n, d: engDay } : {};
    const put = (i, p) => { const next = rows.slice(); while (next.length < so.n) next.push({}); next[i] = Object.assign({}, next[i], p); setE(id, Object.assign({}, cur, { sets: next }, tag)); };
    const tap = (i) => { const r = rows[i] || {};
      if (r.ok) { put(i, { ok: false }); return; }
      const d = { ok: true, r: r.r != null && r.r !== "" ? r.r : repNum };
      if (md !== "bw") d.w = r.w != null && r.w !== "" ? r.w : defW(i);
      put(i, d); buzz(30); if (autoRest !== false && card.rt !== 0) startRest(); };
    const label = (i) => { const r = rows[i] || {}; const reps = r.r != null && r.r !== "" ? r.r : repNum; const w = md === "bw" ? "" : (r.w != null && r.w !== "" ? r.w : defW(i));
      const rs = reps ? reps + unit : (sec ? "hold" : "go");
      return md === "bw" ? rs : w ? (md === "add" ? "+" : "") + w + " kg × " + rs : rs; };
    /* WHAT TO BEAT: last time's numbers for the same set, on its row */
    const was = last || lastSets(log, id, engDay || "9999-12-31", md);
    const wasRow = was ? (i) => { const p = was.sets[i]; if (!p) return null;
      const r0 = p.r != null && p.r !== "" ? p.r + unit : "";
      return "Last time " + (p.w != null ? (md === "add" ? "+" : "") + p.w + " kg" + (r0 ? " × " : "") : "") + r0; } : null;
    /* the next set that isn't done: the one the LOG SET button logs */
    let nextI = -1; for (let i = 0; i < so.n; i++) if (!(rows[i] && rows[i].ok)) { nextI = i; break; }
    /* the bar speed: the main lifts' first work set, and nowhere else —
       the mean of its two fastest reps */
    /* and, from the audit's week, the fast lifts': the trap bar jump, the
       bench throw and the landmine push press */
    const speedOn = card.first !== false && (velT || (md === "kg" && BAR_SPEED_ITEMS[id] && (v(b.mainLift, rx) || b.vel)) || (!!v(b.spd, rx) && !!BAR_SPEED_ITEMS[id]));
    const vcol = verdict ? (verdict.kind === "down" ? C.bad : C.accent) : C.line;
    const speed = speedOn ? (
      <div data-testid="bar-speed" style={{ background: C.raise, border: "1.5px solid " + (verdict ? vcol : "transparent"), borderRadius: RAD.m, padding: "14px 14px 16px" }}>
        {/* Spleeft tells one rep from the next by the stop between them: the
           bar held still at the top, not racked */}
        {velT ? <div data-testid="lockout-line" style={Object.assign({}, bdy, { fontSize: T3, color: C.ash, lineHeight: 1.45 })}>Spleeft: hold the lockout until it beeps, then the next rep. No need to rack the bar between reps.</div> : null}
        {/* the fast lifts' rule, where the number is read: a speed after every rep, a 10% drop ends the set */}
        {!velT && v(b.spd, rx) && b.spdLine ? <div data-testid="speed-rule" style={Object.assign({}, bdy, { fontSize: T3, color: C.ash, lineHeight: 1.45 })}>{b.spdLine}</div> : null}
        <Input label={"Set 1 · mean of its two fastest reps (m/s)" + (velT ? " · target " + velT.v : "")} v={velT ? cur.v1 : cur.bs}
          on={(val) => setE(id, Object.assign({}, cur, velT ? { v1: val, vt: velT.v, vl: velLift, vd: engDay } : { bs: val }))} ph="m/s" />
        {verdict ? <div data-testid="bar-verdict" style={Object.assign({}, dsp, { fontSize: T2, fontWeight: 800, letterSpacing: .4, marginTop: 12, color: vcol })}>{verdict.line}{afterKg != null ? " · " + afterKg + " KG" : ""}</div> : null}
        {verdict ? <div style={Object.assign({}, mno, { fontSize: T3, color: C.ash, marginTop: 4, lineHeight: 1.4 })}>{verdict.why}</div> : null}
        {verdict && verdict.kind === "up" && it.mk && wmNow ? (cur.bumped
          ? <div style={Object.assign({}, mno, { fontSize: T3, color: C.moss, marginTop: 8 })}>WORKING MAX UP 2.5% · {cur.bumped} KG</div>
          : <BigBtn on={() => { const kg = r25(wmNow * 1.025); onSetMax(it.mk, kg, "bar speed fast two sessions running · " + macro + week); setE(id, Object.assign({}, cur, { bumped: kg })); }} c={C.moss} s={{ marginTop: 10 }}>ADD 2.5% FROM NOW ON · {r25(wmNow * 1.025)} KG</BigBtn>) : null}
      </div>) : null;
    const adjust = (
      <div>
        {Array.from({ length: so.n }).map((_, i) => { const r = rows[i] || {};
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              {md === "bw" ? null : <div style={{ flex: 1 }}><Input label={"SET " + (i + 1) + (md === "add" ? " +KG" : " KG")} v={r.w != null ? r.w : defW(i)} on={(val) => put(i, { w: val })} /></div>}
              <div style={{ flex: 1 }}><Input label={"SET " + (i + 1) + (sec ? " SECONDS" : " REPS")} v={r.r != null ? r.r : repNum} on={(val) => put(i, { r: val })} /></div>
            </div>); })}
      </div>);
    /* THE RAMP, on a main lift that carries one: bar × 8, then the steps
       under the day's working weight */
    const rampLine = it.ramp && it.ramp.length && card.first !== false ? "Ramp · " + it.ramp.map((r) => {
      const kg = r[0] ? calc(it.mk, r[0]) : null; return (r[0] ? (kg ? kg[0] + " kg" : r[0] + "%") : "bar") + " × " + r[1]; }).join(" · ") : null;
    body = (
      <div data-set-mode={md} data-set-unit={sec ? "s" : "reps"} data-set-id={id}>
        {rampLine ? <div data-testid="lift-ramp" style={Object.assign({}, mno, { fontSize: T3, color: C.chalk, lineHeight: 1.5, marginTop: 14 })}>{rampLine} · a minute between</div> : null}
        {ln ? <div style={Object.assign({}, mno, { fontSize: T3, fontWeight: 700, color: C.accent, marginTop: 10 })}>Level {ln.l}</div> : null}
        {boxOn ? (
          <div data-testid="weight-box" style={{ marginTop: 14 }}>
            {last ? <div data-testid="last-time" style={Object.assign({}, mno, { fontSize: T3, color: C.ash, lineHeight: 1.5 })}>{lastLine(last, md)}</div> : null}
            {stepUp ? <div data-testid="step-up" style={Object.assign({}, mno, { fontSize: T3, fontWeight: 700, color: C.accent, lineHeight: 1.5, marginTop: 6 })}>Top of the range on every set last time — add the smallest step today</div> : null}
            <Input label={md === "add" ? "ADDED WEIGHT (KG)" : "WEIGHT (KG)"} v={w0} on={(val) => setE(id, Object.assign({}, cur, { w0: val }, tag))} ph="kg" />
          </div>) : null}
        <SetButtons n={so.n} sets={rows} label={label} onTap={tap} adjust={adjust} speed={speed} prev={wasRow} next={slot ? nextI : -1} />
        {nextI >= 0 ? <LogSet slot={slot} what="set" n={nextI + 1} text={label(nextI) + (sub ? " · " + String(card.n).split(",")[0] : "")} on={() => tap(nextI)} /> : null}
      </div>);
  } else if (card.kind === "out" || card.kind === "review") {
    /* a test that sets a working max: the working-weight checks and test
       day's triples — the set of 3 × 1.08 is the working max */
    const saves = (card.outs || []).filter((o) => o.max && num((log[key(o.id)] || {}).w)).map((o) => {
      const kg = o.est ? r25(num(log[key(o.id)].w) * o.est) : num(log[key(o.id)].w);
      return <BigBtn key={"sv" + o.id} on={() => onSetMax(o.max, kg, (o.est ? "working-weight check" : "test day") + " · " + macro + week)} c={C.accent} fill={num(maxes[o.max]) !== kg} s={{ marginTop: 10 }}>{num(maxes[o.max]) === kg ? "SAVED · " + kg + " KG" : "SAVE AS WORKING MAX · " + kg + " KG"}</BigBtn>; });
    /* A BUTTON A RUN — Strength, Power and Physique's sled: one for each run
       on its line, ticked as a set is, and the tick starts the rest. The
       load and the time keep their boxes; the ticks sit beside them on the
       same entry (runs), never as sets. */
    const rm = it && it.runs ? String(v(it.s, rx) || "").match(SETS_LEAD) : null;
    let runs = null;
    if (rm) {
      const n = Math.max(1, Number(rm[1])), cur = log[key(it.id)] || {}, done = cur.runs || [];
      const tap = (i) => { const next = done.slice(); while (next.length < n) next.push(false); next[i] = !next[i];
        setE(it.id, Object.assign({}, cur, { runs: next }));
        if (next[i]) { buzz(30); if (autoRest !== false && card.rt !== 0) startRest(); } };
      const nextR = Array.from({ length: n }).findIndex((_, i) => !done[i]);
      runs = <div data-runs={it.id}><SetButtons n={n} sets={done.map((x) => ({ ok: !!x }))} label={() => rm[2].trim()} onTap={tap} next={slot ? nextR : -1} />
        {nextR >= 0 ? <LogSet slot={slot} what="set" n={nextR + 1} text={rm[2].trim()} on={() => tap(nextR)} /> : null}</div>;
    }
    body = <div>{runs}{outs}{saves}</div>;
  }

  /* the calibration and the working weight, on the lift that needs them */
  const extra = (
    <div>
      {needsCal ? (
        <div style={{ marginTop: 14 }}>
          <Input label="3RM TODAY (KG)" v={calIn} on={setCalIn} />
          <BigBtn on={() => { const k = num(calIn); if (!k) return; onSetMax(b.calib, r25(k * 1.08), "3RM × 1.08 · wk " + week); setCalIn(""); }} c={C.brass} fill dis={!num(calIn)} s={{ marginTop: 10 }}>SAVE · {num(calIn) ? r25(num(calIn) * 1.08) + " KG" : "—"}</BigBtn>
        </div>) : null}
      {b.work && card.first !== false && (!num(maxes[b.work]) || rx.reset) ? <CampWorkPanel id={b.work} name={liftName(b.work)} kg={num(maxes[b.work])} onSet={(kg, src) => onSetMax(b.work, kg, src)} reset={!!rx.reset} week={week} /> : null}
    </div>);
  const pain = painable ? (painStopped ? (
    <div data-testid="pain-stopped" style={{ marginTop: 16, background: soft(C.bad), borderRadius: RAD.m, padding: 14 }}>
      <div style={Object.assign({}, dsp, { fontSize: T2, fontWeight: 800, letterSpacing: .4, color: C.bad })}>STOPPED FOR TODAY</div>
      <div style={Object.assign({}, bdy, { fontSize: T3, color: C.chalk, marginTop: 6, lineHeight: 1.5 })}>{PAIN_LINE}</div>
    </div>) : (
    <BigBtn on={() => (onPainStop ? onPainStop() : setE(painKey, { stop: 1 }))} c={C.oxide} label="Hurts more than 3 out of 10: stop it for today" s={{ marginTop: 22 }}>HURTS MORE THAN 3/10 · STOP IT</BigBtn>)) : null;
  return (
    <div data-gym-card={card.key}>
      <CardHead name={card.n} pres={card.pres} part="top" sub={sub} />
      {zone || null}
      {painStopped ? null : extra}
      {painStopped ? null : body}
      {!painStopped && it && it.lv ? <MoveLevels ids={[it.lv]} lv={lv} onStep={stepLv} /> : null}
      <CardHead lib={card.lib} desc={card.desc} part="words" />
      {pain}
    </div>);
}

/* The day's top line: "Prep · Week 1 · Build" */
const PREP_PLAIN = { ACCUMULATE: "Build", INTENSIFY: "Heavy", CONVERT: "Fast", "TEST WEEK": "Test" };
const titleCase = (s) => String(s || "").toLowerCase().replace(/(^|[\s+-])([a-z])/g, (m, a, c) => a + c.toUpperCase());
const shortTitle = (week) => {
  const prog = { prep: "Prep", camp: "Camp", fighter: "Fighter", transition: "Transition", spp: "Strength & Power" }[MODE.program] || "Fighter";
  const ph = PH[rxFor(week).ph] || {};
  const row = MODE.mac ? seasonRow(MODE.mac, week) : null;
  if (row && row.program === "pre") return "Camp · Before Week 1";
  if (row && row.hold) return "Transition · On hold · The head check";
  const block = MODE.prep ? PREP_PLAIN[ph.n] || titleCase(ph.n) : MODE.camp ? titleCase(rxFor(week).block || "") : MODE.trans ? "Easy" : titleCase(ph.n);
  /* Strength, Power and Physique's week number is the calendar's own, so the row's id would say it twice */
  return [prog, "Week " + (row ? row.idx || weekIn(row) : week), row && row.id && row.program !== "transition" && row.program !== "spp" ? row.id : null, block].filter(Boolean).join(" · ");
};

/* ---------------- THE FLOW ---------------- */
function Today(props) {
  const {
    macro, week, day, isToday, shownIso, done, setDone, log, setLog, maxes, bw,
    ready, sparPrev, swapped, note, setNote,
    startTimer, onSetMax, autoRest, addBody,
    calis, taper, rangeWeek, campLabel, peakHR, setEasyPeak,
    morning, setMorning, weekDates, st, imRec, setTick,
    checkA, setCheckA, readNow, openTool, sound, flowAt, setFlowAt, photoPrompt,
    fday, setFday, menu, cook, fuelPhase, stopTimer, setHead, wt, focus, setFocus, nav, dockUp,
  } = props;

  /* the log as it is now, for writes from inside a running timer */
  const logRef = useRef(log); logRef.current = log;
  /* THE EASY ZONE: in PREP, CAMP, the week before camp and the
     transition, every easy session carries the zone, and its timer runs
     under it. The classic Fighter has none of it. */
  const o8Zone = MODE.prep || MODE.camp || MODE.trans || MODE.spp;
  const zone = o8Zone ? easyZone(peakHR) : null;
  const startZ = (tm) => startTimer(easyTimer(tm, zone));
  /* the feed chime: a feed or a drink due now, while the app is open */
  const chimeRows = useRef([]), chimed = useRef({});
  const beep = useBeep(sound);
  useEffect(() => {
    if (!isToday || !sound) return undefined;
    const id = setInterval(() => { const d0 = new Date(), nm = d0.getHours() * 60 + d0.getMinutes();
      chimeRows.current.forEach((x) => { if (x.done || Math.round(x.t) !== nm || chimed.current[shownIso + x.id]) return;
        chimed.current[shownIso + x.id] = 1; beep(660, 200); setTimeout(() => beep(880, 350), 220); buzz([120, 60, 120]); }); }, 20000);
    return () => clearInterval(id);
  }, [isToday, sound, beep, shownIso]);
  /* Every day opens on HOME: the week, the session and the day's running
     order. One tap opens the session screen, one thing at a time; the
     app keeps which of the two today was left on. */
  const whole = !focus, setWhole = (v) => setFocus(!v);
  const [open, setOpen] = useState({});
  /* where a card puts its LOG SET button: the bar under the thumb */
  const [slot, setSlot] = useState(null);
  /* a row's own button (START, THE STANDARDS) is the one to press until it has been */
  const [toolRan, setToolRan] = useState({});
  /* a row picked from the whole day: shown as the card even when ticked */
  const [pick, setPick] = useState(null);

  const rx = rxFor(week, day);
  const own = sessFor(day, rx) || S[day] || S.mon;
  const srcDay = MODE.camp ? day : swapped ? "light" : day;
  const effReady = sparPrev && !swapped ? "R" : ready;
  const dk = dayKey(macro, week, day), dl = done[dk] || [];
  const yellow = effReady === "Y";
  const tops = topsOn(log, dk);
  const calc = (mk, pctv) => { const m = tops[mk] || num(maxes[mk]); if (!m || pctv == null) return null; const adj = yellow ? 0.93 : 1;
    const lo = Array.isArray(pctv) ? pctv[0] : pctv, hi = Array.isArray(pctv) ? pctv[1] : pctv;
    const a = r25(m * lo / 100 * adj), z = r25(m * hi / 100 * adj); return a === z ? [a] : [a, z]; };
  const markL = (L, val) => { const cur = done[dk] || []; const has = cur.indexOf(L) >= 0; if (!!val === has) return;
    const n = Object.assign({}, done); n[dk] = val ? cur.concat([L]) : cur.filter((x) => x !== L); setDone(n); };
  const ok = (k) => !!(imRec.ticks && imRec.ticks[k]);

  const rw = rangeWeek;

  /* every row: { id, n, s, lib | desc, input, tool, runner, gym } */
  const im = (id, colour, n, s, mins, tick, extra) =>
    Object.assign({ id, colour, n, s, mins, done: ok(tick), mark: (val) => setTick(tick, val) }, extra || {});
  const fromLib = (name) => ({ lib: libFor(name) });

  const clock = dayClock(week, day, log, dk);
  const { noSess, startStr, S: startMin, lights } = clock;
  const startKey = dk + "-start";
  const fd = fday || {};
  const fticks = fd.f || {}, fchecks = fd.c || {};
  /* the sauna, twice a week at most, everywhere: a week the program puts
     it in twice has no room for a weekend one of your own */
  const weekProgSauna = (MODE.prep || MODE.camp) && saunaDays(rx).length > 0;
  const progSauna = weekProgSauna && saunaDays(rx).indexOf(day) >= 0;
  const weekendDay = day === "sat" || day === "sun";
  const sauna = progSauna || (weekendDay && !!fd.sauna && !weekProgSauna);
  const ftick = (id, val) => setFday({ f: Object.assign({}, fticks, { [id]: !!val }) });
  /* a routine remembers its card for the day: leaving and coming back
     returns to it */
  const rtKey = (id) => dk + "-rt-" + id;
  const routine = (cards) => ({ runner: cards });

  /* ---------------- MORNING ---------------- */
  const mNumbers = im("m-numbers", C.cobalt, "Resting heart rate and HRV", "", 1, "mnum",
    { input: () => { const rec = morning[shownIso] || {};
        const put = (f, val) => setMorning(Object.assign({}, morning, { [shownIso]: Object.assign({}, rec, { [f]: val }) }));
        return <div>{MORNING_FIELDS.map((f) => <Input key={f.id} label={f.n.toUpperCase() + " (" + f.u.toUpperCase() + ")"} v={rec[f.id]} on={(val) => put(f.id, val)} />)}</div>; } });
  /* the morning five: one card, five rows to tick, no clocks */
  const m5Key = dk + "-m5", m5Ticks = (log[m5Key] || {}).t || {};
  const mFive = im("m-five", C.moss, "The morning five", "5 rows · tick each as you finish it", 5, "morning5",
    { desc: MORNING_FIVE.words,
      input: () => <Checklist rows={MORNING_FIVE.rows.map((r) => ({ n: r.n, text: r.text }))} ticks={m5Ticks}
        onTick={(i) => { const n = Object.assign({}, log); n[m5Key] = { t: Object.assign({}, m5Ticks, { [i]: !m5Ticks[i] }) }; setLog(n); buzz(20); }} /> });
  const mCheck = im("m-check", C.cobalt, "The check", "4 yes / no", 1, "check",
    { input: () => <CheckTaps qs={CHECK_Q} answers={checkA} setAnswers={setCheckA} result={readNow.level} line={(MODE.spp ? SPP_READY_LINE : READY_LINE)[readNow.level]} /> });
  /* MAKING WEIGHT: the scales start the morning, while the plan is on —
     and from the day the limit goes in, so the line's start has its
     seven-morning average */
  const wd = wt ? wt.day(shownIso) : null;
  const wPre = !wd && !!wt && !!wt.start && !!wt.setAt && shownIso >= wt.setAt && shownIso < wt.start;
  const mScales = wd || wPre ? im("m-scales", C.brass, "Every morning — the scales", "kg to 0.1 · before you eat or drink", 1, "scales",
    { desc: (wd && wd.kind === "fight" && wd.cfg.weighIn === "day" ? ["Fight morning: nothing before the scales. Nothing to eat until you've weighed in; sip water."] : [])
        .concat(wd && wd.kind === "weighin" ? ["Weigh-in day: wake, toilet, scales. The app checks the number against your weigh-in morning aim."] : [])
        .concat(wPre ? ["The weight plan starts with the camp, on " + fmtDate(addDays(wt.start, 1)) + ". Until then the food runs as printed; the scales are here so the line has your average on the day it's drawn."] : []).concat(SCALES_TEXT),
      input: () => { const kg = (morning[shownIso] || {}).kg;
        return (
          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block" }}>
              <span style={Object.assign({}, mno, { display: "block", fontSize: T3, color: C.ash, marginBottom: 4 })}>THIS MORNING (KG)</span>
              <input data-testid="scales-input" aria-label="This morning's weight in kg" value={kg == null ? "" : kg} inputMode="decimal" placeholder="—"
                onChange={(e) => wt.put(shownIso, { kg: e.target.value })}
                style={Object.assign({}, mno, { width: "100%", background: C.ink, border: "1.5px solid " + C.brass, borderRadius: 14, color: C.chalk, fontSize: 44, fontWeight: 700, textAlign: "center", padding: "10px 8px", minHeight: 84 })} />
            </label>
            {wd ? <ScalesLine avg={wt.avg(shownIso)} aim={wd.aim} wd={wd} kg={kg} />
              : <div data-testid="scales-line" style={Object.assign({}, mno, { fontSize: T3, color: C.ash, marginTop: 10, lineHeight: 1.45 })}>
                  SEVEN-MORNING AVERAGE <span style={{ color: C.chalk, fontWeight: 700 }}>{wt.avg(shownIso) == null ? "— (3 mornings)" : (Math.round(wt.avg(shownIso) * 10) / 10).toFixed(1)}</span> · THE PLAN STARTS <span style={{ color: C.brass, fontWeight: 700 }}>{fmtDate(addDays(wt.start, 1)).toUpperCase()}</span>
                </div>}
          </div>); } }) : null;

  /* ---------------- THE HEAD CHECK ----------------
     The morning after a fight, the first row of the day. Asked every
     morning until it's answered; YES holds the transition until a doctor
     has cleared you, NO starts it. */
  const headItem = (() => {
    if (!SEASON.s || !setHead) return null;
    const fights = SEASON.s.rows.filter((r) => r.program === "camp" && r.id === "FW").map((r) => r.camp.fight)
      .filter((f, i, a) => a.indexOf(f) === i && addDays(f, 1) <= shownIso).sort();
    const f = fights[fights.length - 1]; if (!f) return null;
    const a = (st.head || {})[f] || null;
    const open = !a || (a.a === "yes" && !a.cleared);
    if (shownIso !== addDays(f, 1) && !open) return null;
    const ans = (rec) => { setHead(f, rec); buzz(30); };
    return { id: "m-head", colour: C.oxide, n: "The head check", s: HEAD_Q, mins: 1, done: !open, mark: () => {},
      desc: [HEAD_SYMPTOMS, HEAD_WHY],
      input: () => (
        <div data-testid="head-check">
          {a && a.a === "yes" ? (
            <div style={{ marginTop: 14 }}>
              <div data-testid="head-doctor" style={Object.assign({}, bdy, { fontSize: T3, fontWeight: 700, color: C.chalk, lineHeight: 1.5 })}>{HEAD_DOCTOR}</div>
              <div data-testid="head-ae" style={Object.assign({}, bdy, { fontSize: T3, fontWeight: 700, color: C.oxide, lineHeight: 1.5, marginTop: 10 })}>{HEAD_AE}</div>
              {a.cleared ? <div style={Object.assign({}, mno, { fontSize: T3, color: C.moss, marginTop: 12 })}>CLEARED {fmtDate(a.cleared).toUpperCase()} · THE TRANSITION STARTS</div>
                : <BigBtn on={() => ans(Object.assign({}, a, { cleared: shownIso }))} c={C.moss} s={{ marginTop: 14 }}>{HEAD_CLEARED.toUpperCase()}</BigBtn>}
            </div>) : (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <BigBtn on={() => ans({ a: "yes", at: shownIso })} c={C.oxide} fill={false} s={{ flex: 1 }}>YES</BigBtn>
              <BigBtn on={() => ans({ a: "no", at: shownIso })} c={C.moss} fill={!!a && a.a === "no"} s={{ flex: 1 }}>NO</BigBtn>
            </div>)}
          {a && a.a === "no" ? <div style={Object.assign({}, mno, { fontSize: T3, color: C.moss, marginTop: 10 })}>NO · THE TRANSITION STARTS</div> : null}
        </div>) };
  })();

  /* ---------------- THE GYM ----------------
     The session as cards, one per exercise. A card is done when ticked;
     a block is done when its cards are. */
  /* a red morning: the hard steps come off, and the pushes run at half
     effort, on their card's red twin */
  const real = sleepDay(day, rx) ? [] : realBlocks(srcDay, rx).filter((x) => !(effReady === "R" && x.hard)).map((x) => (effReady === "R" && x.red) || x);
  const cardsKey = dk + "-cards";
  const cardMap = (log[cardsKey] || {}).m || {};
  const sessItems = [];
  const weekly = [];
  let cards = [];

  if (MODE.camp && !sessFor(day, rx)) {
    const bl = campBlank(day, rx);
    sessItems.push({ id: "S:blank", colour: bl.c, n: bl.h, s: DSH[day] + (campLabel ? " " + campLabel(day) : ""), mins: 0,
      done: dl.indexOf("BLANK") >= 0, mark: (val) => markL("BLANK", val), desc: bl.l.map((x) => (typeof x === "string" ? x : x.n + (x.s ? " — " + x.s : ""))) });
  } else if (sleepDay(day, rx)) {
    sessItems.push({ id: "S:sleep", colour: C.moss, n: "Sleep", s: "No alarm", mins: 0,
      done: dl.indexOf("SLEEP") >= 0, mark: (val) => markL("SLEEP", val) });
  } else if (!MODE.camp && day === "sat" && rx.test) {
    /* the Fighter's test day: each test its own card */
    const tkey = (id) => "m" + macro + "w16-test-" + id;
    const tg = (id) => (log[tkey(id)] || {}).w || "";
    const tput = (id, val) => { const n = Object.assign({}, log); n[tkey(id)] = Object.assign({}, n[tkey(id)], { w: val }); setLog(n); };
    const tmap = (log[cardsKey] || {}).m || {};
    const tmark = (k, val) => { const n = Object.assign({}, log); n[cardsKey] = { m: Object.assign({}, tmap, { [k]: !!val }) }; setLog(n); };
    TESTS.filter((x) => !x.sun).forEach((t) => {
      sessItems.push({ id: "T:" + t.id, colour: C.cobalt, n: t.n, s: t.d, mins: 8, lib: /top triple/i.test(t.n) ? topLib(t.n) : libFor(t.n), done: !!tmap[t.id], mark: (val) => tmark(t.id, val),
        input: () => (
          <div>
            <Input label={"RESULT (" + t.u.toUpperCase() + ")"} v={tg(t.id)} on={(val) => tput(t.id, val)} />
            {t.max && num(tg(t.id)) ? <BigBtn on={() => onSetMax(t.max, t.est ? r25(num(tg(t.id)) * t.est) : num(tg(t.id)), "test day · M" + macro)} c={C.accent} fill s={{ marginTop: 10 }}>{t.est ? "SAVE AS WORKING MAX" : "SAVE AS MAX"} · {t.est ? r25(num(tg(t.id)) * t.est) : num(tg(t.id))} KG</BigBtn> : null}
          </div>) });
    });
    const tape0 = (log[tkey("tape")] || {}).v || {};
    sessItems.push({ id: "T:tape", colour: C.cobalt, n: "Tape and bodyweight", s: "bodyweight · arm · shoulders · waist", mins: 5, lib: libFor("tape"), done: !!tmap.tape,
      mark: (val) => { tmark("tape", val); if (val && num(tape0.bw)) addBody(Object.assign({}, tape0)); },
      input: () => (
        <div>
          {[["bw", "BODYWEIGHT (KG)"], ["arm", "ARM (CM)"], ["sh", "SHOULDERS (CM)"], ["wa", "WAIST (CM)"]].map((k) => (
            <Input key={k[0]} label={k[1]} v={tape0[k[0]]} on={(val) => { const n = Object.assign({}, log); n[tkey("tape")] = { v: Object.assign({}, tape0, { [k[0]]: val }) }; setLog(n); }} />))}
        </div>) });
  } else {
    cards = gymCards(real, rx, { calc, calis, taper, jointFlag: jointFlagFor(log, macro, week), bw });
    const cardDone = (c) => (cardMap[c.key] === undefined ? dl.indexOf(c.L) >= 0 : !!cardMap[c.key]);
    const markCard = (c, val) => {
      const sibs = cards.filter((x) => x.L === c.L);
      const m = Object.assign({}, cardMap);
      sibs.forEach((x) => { m[x.key] = x.key === c.key ? !!val : cardDone(x); });
      const n = Object.assign({}, log); n[cardsKey] = { m }; setLog(n);
      markL(c.L, sibs.every((x) => m[x.key]));
    };
    /* hurts more than 3 out of 10: the exercise stops for today */
    const painStop = (c) => {
      const sibs = cards.filter((x) => x.L === c.L);
      const m = Object.assign({}, cardMap);
      sibs.forEach((x) => { m[x.key] = x.key === c.key ? true : cardDone(x); });
      const n = Object.assign({}, log); n[cardsKey] = { m }; n[dk + "-pain_" + c.key] = { stop: 1 }; setLog(n);
      markL(c.L, sibs.every((x) => m[x.key]));
    };
    const byL = {};
    cards.forEach((c) => {
      const it = { id: "G:" + c.key, colour: own.ac, n: c.n, s: c.pres, mins: 0, gym: c, done: cardDone(c), mark: (val) => markCard(c, val), L: c.L, painStop: () => painStop(c) };
      if (c.kind === "review" && day === "sun") { it.lib = null; weekly.push(it); return; }
      (byL[c.L] = byL[c.L] || []).push(it);
      sessItems.push(it);
    });
    /* a block's minutes shared out across its cards */
    real.forEach((b) => { const its = byL[b.L] || []; const m = (Number(v(b.m, rx)) || 0) / Math.max(1, its.length);
      its.forEach((x, i) => { x.mins = m; if (i === its.length - 1) x.tr = Number(b.tr) || 0; }); });
  }

  /* Sunday's week: the tests */
  if (day === "sun") {
    /* OPTIMAL 8 · MOVE: its fifteen standards take the range tests' place */
    if (rx.mw && isMoveTestWeek(rx.mw)) {
      weekly.push(im("S:movetests", C.violet, "The fifteen standards", "measured · about 12 min", 12, "movetests",
        { lib: libFor("the fifteen standards"), tool: { label: "▶ THE STANDARDS", run: () => openTool({ kind: "movetests" }) } }));
    }
    const rangeTestDay = rx.mw ? false : MODE.camp ? !!(rx.dl || (rx.tests && rx.tests.tue === "retest9")) : MODE.prep ? !!prepRx(rx.doc || week).tests : isTestWeek(rw);
    if (rangeTestDay) {
      const k = "rangetests";
      weekly.push(im("S:rangetests", C.oxide, MODE.prep ? "The range and flexibility tests" : "The four range tests", "measured", 10, k,
        { lib: [].concat(libFor("the four range tests") || [], MODE.prep ? (libFor("the three flexibility tests") || []) : []),
          tool: { label: "▶ THE TESTS", run: () => openTool({ kind: "rangetests" }) } }));
    }
  }
  if (photoPrompt) {
    const pd = photoPrompt.done || !!fticks["x-photos"];
    weekly.push({ id: "wk-photos", colour: C.cobalt, n: "The photos", s: "front · side · back", mins: 0, lib: libFor("photos"),
      done: pd, mark: (val) => ftick("x-photos", val), tool: { label: "▶ TAKE THE PHOTOS", run: photoPrompt.open } });
  }

  const planLen = sessItems.reduce((a, x) => a + (x.mins || 0) + (x.tr || 0), 0);
  const setLen = num((st.len || {})[day]);
  const len = noSess ? 0 : (setLen != null && setLen > 0 ? setLen : planLen);
  const squeeze = len && planLen > len ? len / planLen : 1;

  /* ---------------- THE FOOD AND THE WATER ---------------- */
  const plan = fuelPlan({ day, phase: fuelPhase, start: startMin, len, session: !noSess,
    breaks: st.breaks || DEFAULT_BREAKS(), lights, sauna, boxing: boxingTonight(fd, st, day), menu: menu || {},
    fight: fightDayOf(rx, day), weighIn: rx.weighIn || "before", march: parseISO(shownIso).getMonth() === 2, w: wt ? wt.fuel(shownIso) : null });
  const wake = plan.wake;
  mNumbers.t = wake; mFive.t = wake + 4; mCheck.t = wake + 9;
  /* brief 34: the food is a budget on FOOD · TODAY, not rows at set times.
     The set plan's rows stay only on making weight's light days, the
     weigh-in day and fight day, where the timing is the point. On every
     other day a meal row's drink keeps its own row at the same time. */
  const wfd = wt ? wt.fuel(shownIso) : null;
  const setPlanDay = !!fightDayOf(rx, day) || !!(wfd && wfd.kind !== "step");
  const fuelItems = [];
  const sayMl = (ml) => (ml >= 1000 ? (ml / 1000).toFixed(ml % 1000 ? 2 : 0).replace(/0$/, "") + " litre" : ml + " ml");
  plan.rows.forEach((r) => {
    const on = !!fticks[r.id];
    if (r.kind === "feed" && !setPlanDay) {
      if (!r.ml && !r.cre) return;
      fuelItems.push({ id: r.id, colour: C.cobalt, n: r.ml ? sayMl(r.ml) + " water" + (r.cre ? ", the creatine in it" : "") : "Creatine 5 g, in water", t: r.t, fuel: r,
        s: r.cre ? "creatine 5 g" : "", desc: r.cre ? ["The day's creatine goes in this one."] : undefined,
        done: on, mark: (val) => ftick(r.id, val) });
      return;
    }
    if (r.kind === "feed") {
      const b = r.blk;
      const lead = r.slot === "lunch" ? (r.id === "f-lunch" ? (plan.work ? "Mid-morning — " : "First feed — ") : (plan.work ? "Lunch — " : "Second feed — ")) : "";
      fuelItems.push({ id: r.id, colour: r.crit ? C.warn : C.brass, n: lead + b.n, t: r.t, fuel: r,
        s: b.kcal + " kcal" + (r.ml ? " · + " + sayMl(r.ml) + " water" : "") + (r.cre ? " · creatine 5 g" : ""),
        desc: b.i.map((x) => x[0] + " — " + x[1]),
        done: on, mark: (val) => ftick(r.id, val) });
    } else {
      const cur = fchecks[r.check];
      const wrec = (morning[shownIso] || {});
      fuelItems.push({ id: r.id, colour: r.weighin ? C.oxide : C.cobalt, n: r.n, t: r.t, fuel: r, anchor: r.anchor,
        s: [r.ml ? sayMl(r.ml) : "", r.sachet ? SACHET + " " + r.sachet : "", r.cre ? "creatine 5 g" : ""].filter(Boolean).join(" · "),
        desc: r.weighin ? [r.note, REWEIGH_TEXT] : r.note ? [r.note] : undefined,
        done: on, mark: (val) => ftick(r.id, val),
        input: r.weighin && wt ? () => (
          <div>
            <Input label="WEIGH-IN TIME" v={wrec.weighAt} on={(val) => wt.put(shownIso, { weighAt: val })} ph={hhmm(r.t)} type="text" />
            <Input label="THE OFFICIAL SCALES (KG)" v={wrec.official} on={(val) => wt.put(shownIso, { official: val })} />
          </div>) : r.check ? () => (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {["pale", "dark"].map((k) => <BigBtn key={k} on={() => setFday({ c: Object.assign({}, fchecks, { [r.check]: cur === k ? null : k }) })} c={k === "dark" ? C.oxide : C.moss} fill={cur === k} s={{ flex: 1 }}>{k === "pale" ? "PALE STRAW" : "DARK"}</BigBtn>)}
          </div>) : null });
    }
  });
  const feedAt = (pred) => fuelItems.find((x) => x.fuel.kind === "feed" && pred(x.fuel));
  chimeRows.current = fuelItems;

  let tt = startMin;
  /* a block with its own clock time — the camp's morning primer, hours
     before the fight — keeps it; the rest run on from the session's start */
  const ownT = {};
  sessItems.forEach((x) => {
    const at = x.gym && x.gym.b && x.gym.b.at != null ? x.gym.b.at : null;
    if (at != null && !noSess) { x.t = ownT[x.L] == null ? at : ownT[x.L]; ownT[x.L] = x.t + (x.mins || 0); return; }
    x.t = noSess ? startMin + 10 : tt; tt += ((x.mins || 0) + (x.tr || 0)) * squeeze; });
  const sessEnd = tt;

  /* ---------------- EVENING ----------------
     RANGE, the skill block and the movement session run one move per
     card, each hold timed, each move coming up by itself. */
  const ev = [];
  /* Strength, Power and Physique's easy hour is Saturday evening's, from
     the engine base's first week; before it, its easy work was the two
     nasal runs */
  const sppEH = MODE.spp ? sppEasyHour(rx) : 0;
  const weekend = MODE.spp ? (day === "sat" && sppEH > 0) : MODE.camp ? (day === "sun" && !!rx.sim) : (day === "sat" || day === "sun");
  const saunaWater = (a) => fuelItems.find((x) => x.anchor === a);
  /* the sauna and its two water rows: in PREP and CAMP straight after the
     easy session or the easy hour, never before them; the classic
     Fighter's own weekend sauna keeps its place at the top of the evening */
  const saunaRows = () => {
    const out = [];
    if (progSauna) {
      if (saunaWater("sauna-before")) out.push(saunaWater("sauna-before"));
      out.push(im("ev-sauna", C.oxide, "Sauna", "15–20 min · twice this week, never more", 20, "sauna", fromLib("sauna")));
      if (saunaWater("sauna-after")) out.push(saunaWater("sauna-after"));
    } else if (sauna) {
      const a = saunaWater("sauna-before"), b = saunaWater("sauna-after");
      if (a) { a.mins = 20; out.push(a); } if (b) out.push(b);
    }
    return out;
  };
  const o8Evening = MODE.prep || MODE.camp || MODE.spp;
  if (!o8Evening) saunaRows().forEach((x) => ev.push(x));
  if (o8Evening && rx.thirty && day === "thu") {
    const em = rx.wedEasy || 30;
    ev.push(im("ev-thirty", C.moss, em === 30 ? "The easy thirty" : "The Thursday easy session", em + " min · nose only" + (em === 40 ? " · engine-first" : ""), em, "thirty",
      Object.assign(fromLib("thursday easy thirty"), { easy: 1, tool: { label: "▶ START · " + em + " MIN", run: () => startZ({ kind: "z2", opt: { min: em, label: "EASY — NOSE ONLY" }, title: em === 30 ? "THE EASY THIRTY" : "THE EASY " + em }) } })));
  }
  if (weekend) {
    const EH = MODE.camp ? CAMP_EASY_HOUR : EASY_HOUR;
    const ek = "m" + macro + "w" + week + "-easyhour", evl = log[ek] || {};
    const ehDone = { done: !!evl.ok, mark: (val) => { const n = Object.assign({}, log); n[ek] = Object.assign({}, evl, { ok: !!val, d: val ? day : null }); setLog(n); ftick("w-easy", val); },
      input: () => <Input label="AVERAGE HEART RATE" v={evl.hr} on={(val) => { const n = Object.assign({}, log); n[ek] = Object.assign({}, log[ek], { hr: val }); setLog(n); }} /> };
    if (MODE.spp) ev.push(Object.assign({ id: "ev-easy", colour: C.moss, n: "The easy hour", s: sppEH + " min on the bike · nose only · + " + EASY_WATER + " ml water", mins: sppEH,
      lib: libFor("the saturday easy hour"), easy: o8Zone,
      tool: { label: "▶ START · " + sppEH + " MIN", run: () => startZ({ kind: "z2", opt: { min: sppEH, label: "EASY — NOSE ONLY · 65–75% OF PEAK" }, title: "THE EASY HOUR" }) } }, ehDone));
    else ev.push(Object.assign({ id: "ev-easy", colour: C.moss, n: "The easy hour", s: titleCase(EH.tag.split(" · ")[0]) + (rx.twoThirds && rx.easyHour ? " · " + rx.easyHour.join("–") + " min" : "") + " · + " + EASY_WATER + " ml water", mins: rx.twoThirds && rx.easyHour ? rx.easyHour[1] : 40, lib: libFor("easy hour"), easy: o8Zone }, ehDone));
  }
  if (o8Evening) saunaRows().forEach((x) => ev.push(x));
  if (!rx.mw && ((MODE.prep && moveTonight(rx, day)) || (MODE.camp && !rx.fightWeek && (day === "sat" || (day === "wed" && rx.move))))) {
    ev.push(im("ev-move", C.violet, "The movement session", ROUTINE_MINS.move + " min", ROUTINE_MINS.move, "move", routine(MOVE_CARDS)));
  }
  /* OPTIMAL 8 · MOVE: Session A on Wednesday evening, Session B on
     Sunday's, RANGE FOR MOVE the other five — THE KEEP once the last
     standards met every range target */
  /* in every program and every week but the camp's final week, the week
     before a camp too; the transition's first three days are RANGE alone */
  const fwk = MODE.camp && !!rx.fightWeek, trans3 = MODE.trans && rx.w === 1 && (day === "mon" || day === "tue" || day === "wed");
  const mvOn = !!rx.mw && !fwk;
  /* THE UPPER PUSHES: Tuesday and Thursday evenings before RANGE, and in
     Session B on Sunday, from the tendon work's week 1. The transition's
     are Monday's and Thursday's, at 7 out of 10, from its fourth day; the
     camp's final week has one, on its Tuesday, at half effort. */
  const upRed = effReady === "R";
  const upOn = !!rx.tw && (fwk ? day === "tue" : !mvOn ? false : MODE.trans ? !rx.hold && (day === "thu" || (day === "mon" && rx.w > 1)) : (day === "tue" || day === "thu"));
  if (upOn) {
    ev.push(im("ev-upper", C.violet, "The upper pushes", ROUTINE_MINS.upper + " min · shoulders and wrists", ROUTINE_MINS.upper, "upper", routine(upperPushCards(rx.tw, upRed, { fw: fwk, trans: MODE.trans }))));
  }
  if (mvOn && (day === "sun" || (day === "wed" && !trans3))) {
    const isA = day === "wed", mvLv = (log[LEVEL_KEY] || {}).lv || {}, cards = sessionCards(isA ? "A" : "B", rx.mw, mvLv, MODE.trans ? 0 : rx.tw, upRed);
    const mvStep = (id, by) => { const n = Object.assign({}, log); n[LEVEL_KEY] = { lv: stepLevel(mvLv, id, by) }; setLog(n); buzz(20); };
    const mins = isA ? ROUTINE_MINS.sessA : rx.tw && !MODE.trans ? ROUTINE_MINS.sessBPush : ROUTINE_MINS.sessB;
    ev.push(im(isA ? "ev-sessa" : "ev-sessb", C.violet, isA ? "Session A · hips, lower back, balance" : "Session B · shoulders, mid-back, neck, wrists, ankles", mins + " min", mins, isA ? "moveA" : "moveB",
      Object.assign(routine(cards), { input: () => <MoveLevels ids={cards.filter((c) => c.lv).map((c) => c.lv)} lv={mvLv} onStep={mvStep} /> })));
  } else {
    const mvKeep = mvOn && (() => { const k = lastMoveTest(seasonRow(macro, week)); return !!k && rangeStandardsMet((id) => moveVal(log, k, id), (log[END_KEY] || {}).ends); })();
    const RG = mvOn ? (mvKeep ? { n: "THE KEEP", cards: KEEP_CARDS, mins: ROUTINE_MINS.keep } : { n: "RANGE", cards: moveRangeCards((log[LEVEL_KEY] || {}).lv || {}), mins: ROUTINE_MINS.moveRange })
      : rangeRoutine(rw, MODE.camp && !!rx.fightWeek);
    ev.push(im("ev-range", C.violet, RG.n, RG.mins + " min", RG.mins, "mobility", routine(RG.cards)));
  }
  if (DAYS.indexOf(day) <= 3) {
    const hs = curLevel(calis, "handstand");
    const o8 = MODE.prep || MODE.camp || MODE.spp;
    const sk = o8 ? skillCards(hs) : fighterSkillCards(hs, day === "tue" || day === "thu");
    const skMins = o8 ? ROUTINE_MINS.skill : SKILL_BLOCK.mins;
    ev.push(im("ev-skill", C.brass, "The skill block", skMins + " min", skMins, "skill", routine(sk)));
  }
  const dinner = feedAt((r) => r.slot === "dinner");
  const evEnd = Math.min(dinner ? dinner.t : tMin("18:30"), tMin("20:00"));
  const evTotal = ev.reduce((a, x) => a + (x.mins || 0), 0);
  const floor = feedAt((r) => r.t === tMin("17:00")) || fuelItems.find((x) => x.t === tMin("17:00")) ? tMin("17:05") : tMin("16:05");
  let et = Math.max(floor, evEnd - evTotal);
  const evStart = et;
  ev.forEach((x) => { x.t = et; et += x.mins || 0; });

  const lightsItem = im("nt-lights", C.cobalt, "Lights out", lightsTarget(day).s, 0, "lights",
    { input: () => { const nextIso = addDays(shownIso, 1), rec = morning[shownIso] || {}, nx = morning[nextIso] || {};
        const put = (d, f, val) => setMorning(Object.assign({}, morning, { [d]: Object.assign({}, morning[d] || {}, { [f]: val }) }));
        return (
          <div>
            <Input label="LIGHTS OUT TONIGHT" v={nx.lights} on={(val) => put(nextIso, "lights", val)} ph="21:30" type="text" />
            <Input label="HOURS SLEPT LAST NIGHT" v={rec.sleep} on={(val) => put(shownIso, "sleep", val)} />
          </div>); } });
  lightsItem.t = lights;
  weekly.forEach((x) => { x.t = lights; });

  if (headItem) headItem.t = wake - 1;
  if (mScales) mScales.t = wake;
  /* OPTIMAL 8 · MOVE: no morning five — the movement block does its job,
     and nothing bends the back to its end in the first hour up */
  const all = (headItem ? [headItem] : []).concat(mScales ? [mScales] : [], [mNumbers], fuelItems.filter((x) => x.id === "w-wake"), rx.mw ? [mCheck] : [mFive, mCheck],
    fuelItems.filter((x) => x.id !== "w-wake" && !x.anchor && x.id !== "w-sess" && x.t <= startMin),
    fuelItems.filter((x) => x.id === "w-sess"), sessItems,
    fuelItems.filter((x) => x.id !== "w-wake" && !x.anchor && x.id !== "w-sess" && x.t > startMin),
    ev, [lightsItem], weekly);
  all.forEach((x, i) => { x.k = i; });
  all.sort((a, b) => (a.t - b.t) || (a.k - b.k));
  const gymIds = {}; sessItems.forEach((x) => { gymIds[x.id] = 1; });
  const evIds = {}; ev.concat([lightsItem], weekly).forEach((x) => { evIds[x.id] = 1; });
  all.forEach((x) => { x.clock = hhmm(x.t);
    /* a gym block with its own clock time ahead of the session — the morning primer — sits in the morning */
    const early = !!(x.gym && x.gym.b && x.gym.b.at != null && x.t < startMin);
    x.chapter = (gymIds[x.id] && !early) || x.id === "w-sess" ? "GYM" : evIds[x.id] || x.t >= evStart ? "EVENING"
      : x.t < startMin ? "MORNING" : !noSess && x.t <= sessEnd ? "GYM" : "THE DAY"; });

  /* ---------------- NOW ---------------- */
  /* only today remembers where it was; looking at another day never moves it */
  const curStored = isToday ? flowAt[dk] : null;
  const curIdx = (() => {
    if (pick) { const i = all.findIndex((x) => x.id === pick); if (i >= 0) return i; }
    if (curStored) { const i = all.findIndex((x) => x.id === curStored); if (i >= 0 && !all[i].done) return i; }
    return all.findIndex((x) => !x.done); })();
  const cur = curIdx >= 0 ? all[curIdx] : null;
  /* the morning after a fight, the head check is not left for HOME to offer: the day opens on its card */
  const headFirst = isToday && !!cur && cur.id === "m-head";
  useEffect(() => { if (headFirst && !focus) setFocus(true); }, [headFirst]);
  const go = (id) => { setPick(id); if (isToday) setFlowAt(Object.assign({}, flowAt, { [dk]: id })); };
  const nextAfter = (i) => all.slice(i + 1).find((x) => !x.done) || all.find((x, j) => j !== i && !x.done) || null;
  const nxt = cur ? nextAfter(curIdx) : null;
  const finish = () => { if (!cur) return;
    /* the app sets the working max off a logged top triple */
    if (cur.gym && cur.gym.kind === "top") { const e = log[dk + "-" + cur.gym.item.id] || {}, mk = cur.gym.item.mk, est = num(e.est);
      if (est && num(maxes[mk]) !== est) onSetMax(mk, est, "top triple × 1.08 · " + macro + week, (MODE.prep || MODE.spp) && rx.testWeek ? ["cw_" + mk] : []); }
    cur.mark(true); const n = nextAfter(curIdx); go(n ? n.id : null); buzz(30); };
  /* BACK: the item before this one in the day's order, done or not —
     opened as it was, its inputs editable, nothing unticked */
  const back = () => { if (curIdx > 0) { go(all[curIdx - 1].id); buzz(20); } };
  const doneN = all.filter((x) => x.done).length;
  const pct = all.length ? Math.round(doneN / all.length * 100) : 0;
  const gymAll = sessItems.filter((x) => x.gym);
  const gymAt = cur && cur.gym ? gymAll.indexOf(cur) : -1;
  const zonePanel = o8Zone && cur && (cur.easy || (cur.gym && isEasyTimer(cur.gym.timer))) ? <EasyZonePanel peak={peakHR} onSave={setEasyPeak} /> : null;
  const gp = { rx, week, macro, day, log, setLog, maxes, bw, ready: effReady, startTimer: startZ, stopTimer, autoRest, calis, st, openTool, onSetMax, weekDates, wt, slot };

  /* ---------------- HOME: the day at a glance ---------------- */
  const sessList = sessItems.filter((x) => x.id !== "S:sleep" && x.id !== "S:blank");
  const sessDone = sessList.filter((x) => x.done).length;
  const sessNext = sessList.find((x) => !x.done) || sessList[0] || null;
  const openAt = (it) => { if (it) go(it.id); setWhole(false); };
  const hero = (() => {
    const over = isToday ? "Today's session" : fmtDate(shownIso);
    if (!sessList.length) { const it = sessItems[0], blank = !!it && it.id === "S:blank";
      return { state: "rest", over, title: blank ? titleCase(it.n) : "Rest day", text: blank ? (it.desc || []).join(" ") : "Sleep. No alarm." }; }
    const src = sessFor(srcDay, rx) || own, line = String((rx.fit && src.tf) || (rx.au && src.ta) || (rx.tw && src.tt) || src.t || ""), cut = line.indexOf(" — ");
    const state = sessDone >= sessList.length ? "done" : sessDone ? "going" : "todo";
    return { state, over, title: cut > 0 ? titleCase(line.slice(0, cut)) : (line || titleCase(src.n)), text: cut > 0 ? line.charAt(cut + 3).toUpperCase() + line.slice(cut + 4) : "",
      facts: [len ? Math.round(len) + " min" : null, sessList.length + (sessList.length === 1 ? " exercise" : " exercises"), noSess ? null : "Starts " + hhmm(startMin)].filter(Boolean),
      done: sessDone, total: sessList.length, go: () => openAt(sessNext),
      label: !isToday ? "OPEN THE SESSION" : state === "done" ? "LOOK BACK AT IT" : state === "going" ? "CONTINUE" : "START SESSION" }; })();

  if (whole) {
    const chapters = ["MORNING", "GYM", "THE DAY", "EVENING"];
    /* today opens the chapter the day is on, so what comes next is in sight; another day opens on its session */
    const openFirst = isToday ? (cur && cur.chapter) : "GYM";
    const isOpen = (ch) => (open[ch] !== undefined ? open[ch] : ch === openFirst);
    return (
      <div data-testid="whole-day">
        {nav ? <WeekCard nav={nav} /> : null}
        {isToday ? null : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div data-testid="day-label" style={Object.assign({}, dsp, { flex: 1, fontSize: T2, fontWeight: 800, letterSpacing: .4, color: C.chalk })}>{fmtDate(shownIso).toUpperCase()}</div>
            {nav ? <Btn small on={nav.toToday}>◀ BACK TO TODAY</Btn> : null}
          </div>)}
        <Hero hero={hero} />
        {cur && sessList.indexOf(cur) < 0 ? <NowRow over={(isToday ? "Now" : "First") + " · " + cur.clock} name={cur.n} sub={cur.s} on={() => openAt(cur)} />
          : !cur && all.length ? <NowRow over={isToday ? "Today" : fmtDate(shownIso)} name="Everything is ticked" done on={() => setWhole(false)} /> : null}
        {props.foodRow || null}
        <Section right={doneN + " of " + all.length + " done"}>{isToday ? "The day" : "The day's list"}</Section>
        <div style={{ margin: "0 4px 14px" }}><Meter v={pct / 100} label="The day" testid="day-progress" /></div>
        {chapters.map((ch) => (
          <Chapter key={ch} title={ch} items={all.filter((x) => x.chapter === ch)} open={isOpen(ch)}
            onToggle={() => setOpen(Object.assign({}, open, { [ch]: !isOpen(ch) }))}
            onPick={(it) => { go(it.id); setWhole(false); }} onTick={(it) => it.mark(!it.done)} curId={isToday && cur ? cur.id : null} />))}
        <Card>
          <Input label={noSess ? "WAKE" : fightDayOf(rx, day) ? "THE BELL" : "SESSION START"} v={startStr} on={(val) => { const n = Object.assign({}, log); n[startKey] = { w: val }; setLog(n); }} ph={hhmm(clock.def)} type="text" />
          <label style={{ display: "block", marginTop: 12 }}>
            <span style={Object.assign({}, mno, { display: "block", fontSize: T3, fontWeight: 600, color: C.ash, marginBottom: 6 })}>SESSION NOTES</span>
            <textarea value={note || ""} onChange={(e) => setNote(e.target.value)}
              style={Object.assign({}, bdy, { width: "100%", minHeight: 96, background: C.ink, border: "1px solid " + C.line, borderRadius: RAD.m, color: C.chalk, fontSize: T3, padding: 12, resize: "vertical" })} />
          </label>
        </Card>
      </div>);
  }

  /* ---------------- THE SESSION SCREEN: one thing at a time ---------------- */
  if (!cur) return (
    <Focus id="done" label="DONE" pct={100} onHome={() => setWhole(true)} canBack={false} onBack={back} onNext={() => setWhole(true)} nextLabel="THE WHOLE DAY" setSlot={setSlot} dockUp={dockUp}>
      <div data-testid="now-card" className="rise" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 12px" }}>
        <CheckDot ok size={72} />
        <div style={Object.assign({}, dsp, { fontSize: T1, fontWeight: 800, letterSpacing: .4, color: C.accent, marginTop: 18 })}>DONE</div>
        <div style={Object.assign({}, bdy, { fontSize: T3, color: C.ash, lineHeight: 1.5, marginTop: 8 })}>Everything on the day's list is ticked.</div>
      </div>
    </Focus>);
  return (
    <Focus id={cur.id} label={(isToday ? "NOW" : DSH[day]) + " · " + cur.clock + (gymAt >= 0 ? " · " + (gymAt + 1) + " OF " + gymAll.length : "")} pct={pct}
      onHome={() => setWhole(true)} list={gymAt >= 0 ? gymAll.map((g) => ({ id: g.id, n: g.n, done: g.done, cur: g === cur })) : null} onPick={go}
      canBack={curIdx > 0} onBack={back} onNext={finish} nextLabel={cur.gym ? "NEXT" : "DONE"} setSlot={setSlot} dockUp={dockUp}
      footer={nxt ? (
        <div data-testid="next-line" style={Object.assign({}, mno, { fontSize: FS.meta, color: C.ash, padding: "22px 0 0", marginTop: 22, borderTop: "1px solid " + C.line, lineHeight: 1.4 })}>
          NEXT · <span style={{ color: C.chalk }}>{nxt.clock}</span> · <span style={{ color: C.chalk }}>{nxt.n}</span>
        </div>) : null}>
      <div data-testid="now-card" data-flow-id={cur.id} key={cur.id} className="rise">
        {cur.gym ? <GymCard key={cur.id} card={cur.gym} {...gp} zone={zonePanel}
            onPainStop={cur.painStop ? () => { cur.painStop(); const n = nextAfter(curIdx); go(n ? n.id : null); buzz(30); } : null} />
          : cur.runner ? (
            <div>
              <CardHead name={cur.n} desc={cur.desc} pres={cur.s} colour={cur.colour} />
              <RoutineRunner key={dk + cur.id} cards={cur.runner} sound={sound} colour={cur.colour} at={(log[rtKey(cur.id)] || {}).i}
                onAt={(i) => { const n = Object.assign({}, logRef.current); n[rtKey(cur.id)] = { i }; setLog(n); }} />
            </div>)
          : <CardHead name={cur.n} lib={cur.lib} desc={cur.desc} pres={cur.s} colour={cur.colour} part={cur.input || cur.tool ? "top" : undefined} />}
        {cur.gym ? null : zonePanel}
        {cur.input ? cur.input() : null}
        {cur.tool ? <BigBtn on={() => { setToolRan(Object.assign({}, toolRan, { [cur.id]: true })); cur.tool.run(); }} c={C.accent} fill={!toolRan[cur.id]} main={!toolRan[cur.id]} s={{ marginTop: 16 }}>{cur.tool.label}</BigBtn> : null}
        {!cur.gym && !cur.runner && (cur.input || cur.tool) ? <CardHead lib={cur.lib} desc={cur.desc} part="words" /> : null}
      </div>
    </Focus>);
}

/* ================================================================
   WEEK — the map, and where you are on it
   ================================================================ */
/* PREP and the easy weeks are dated by the season, so the week map says when */
const weekEyebrow = (week) => {
  const r = MODE.mac ? seasonRow(MODE.mac, week) : null;
  return (PROGRAM_NAME[MODE.program] || "") + (r ? " · " + r.id + " · " + rowDates(r) : "");
};
/* the rows of the stretch a week belongs to: its camp, its Prep cycle,
   its transition */
const segKey = (r) => r.mac + "|" + (r.campStart || (r.program === "pre" ? "" : r.plan) || "") + "|" + (r.cycle || r.seg || "");
const segmentOf = (row) => (SEASON.s && row ? SEASON.s.rows.filter((r) => segKey(r) === segKey(row)) : []);
/* what kind of week one is, for the week picker: a lighter week, a test week, or neither */
const weekKind = (r) => (MODE.spp ? (r.light ? "light" : r.testWeek ? "test" : "") : MODE.camp ? "" : (r.dl || r.reload ? "light" : r.test || r.tp ? "test" : ""));
/* a week's place in its stretch: week 1–16 of a cycle, not every Prep week since the start */
const weekIn = (row) => SEASON.s.rows.filter((r) => r.seq < row.seq && segKey(r) === segKey(row)).length + 1;
function WeekView({ view, setView, current, setCurrent, done, L, openDay, weekDoneMap }) {
  const { macro, week } = view; const rx = rxFor(week), P = PH[rx.ph] || PH.c1;
  const row = MODE.mac ? seasonRow(MODE.mac, week) : null;
  const seg = row ? segmentOf(row) : null;
  const move = (d) => { let w = week + d, m = macro;
    if (row) { const nx = SEASON.s.rows[row.seq + d]; if (nx) setView({ macro: nx.mac, week: nx.kw }); return; }
    if (w < 1) { if (m <= 1) return; m -= 1; w = L; } if (w > L) { m += 1; w = 1; } setView({ macro: m, week: w }); };
  const isCur = current.macro === macro && current.week === week;
  const wks = seg ? seg.map((r) => r.kw) : Array.from({ length: L }, (_, i) => i + 1);
  const [pick, setPick] = useState(false);
  const Row = ({ k, val }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid " + C.line }}>
    <span style={Object.assign({}, bdy, { fontSize: FS.meta, fontWeight: 600, color: C.chalk, flex: "0 0 42%" })}>{k}</span>
    <span style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, textAlign: "right", lineHeight: 1.4 })}>{val}</span></div>;
  const Head = ({ children }) => <div style={Object.assign({}, dsp, { fontSize: FS.body, fontWeight: 700, color: C.chalk, lineHeight: 1.3 })}>{children}</div>;
  /* the week's place in its programme, the weeks to pick from, and what kind of week each is */
  const no = (r, i) => (r && r.idx) || i + 1;
  const list = seg || wks.map((w) => ({ kw: w }));
  const at = list.findIndex((r) => r.kw === week);
  const pos = { n: no(row, at), m: list.reduce((m, r, i) => Math.max(m, no(r, i)), 1) };
  const nav = {
    /* Prep and the camp name the document's own week, to find it on the page; Strength, Power and Physique's weeks are just numbered */
    sub: (row ? (MODE.spp ? rowDates(row) : weekEyebrow(week)) : PROGRAM_NAME.fighter + " · macrocycle " + macro),
    title: row && row.program === "pre" ? "Before week 1" : "Week " + pos.n + (row && row.program === "camp" ? " / " + row.camp.n : pos.m > 1 ? " of " + pos.m : ""),
    under: P.long, pos: row && row.program === "pre" ? null : pos, prevLabel: "The week before", nextLabel: "The week after",
    atFirst: row ? !SEASON.s.rows[row.seq - 1] : macro <= 1 && week <= 1, atLast: row ? !SEASON.s.rows[row.seq + 1] : false,
    step: move, pickOpen: pick, setPickOpen: setPick, goWeek: (w) => { setView({ macro, week: w }); setPick(false); },
    weeks: list.map((r, i) => ({ w: r.kw, label: r.hold ? "H" : no(r, i), name: "Week " + no(r, i), on: r.kw === week, now: r.kw === current.week && macro === current.macro, tag: weekKind(rxFor(r.kw)),
      dot: weekDoneMap && weekDoneMap[r.kw] != null ? (weekDoneMap[r.kw] >= 1 ? "done" : weekDoneMap[r.kw] > 0 ? "part" : "") : "" })),
  };
  return (
    <div className="fade">
      <WeekCard nav={nav} />
      <Card>
        {isCur ? <Chip c={C.accent}>This is the current week</Chip>
          : !setCurrent ? null : <Btn on={() => setCurrent(macro, week)} small>MAKE THIS THE CURRENT WEEK</Btn>}
        <Note s={isCur || setCurrent ? undefined : { marginTop: 0 }}>{phNote(P, rx)}</Note>
      </Card>

      {MODE.camp && !MODE.pre && seg ? <CampWeekTable rows={seg.map((r) => ({ row: r, rx: rxFor(r.kw) }))} week={week} setWeek={(w) => setView({ macro, week: w })} /> : null}
      {MODE.camp && !MODE.pre ? <CampWeekCard rx={rx} dates={rowDates(row)} /> : null}
      {MODE.camp && (rx.tp || rx.fightWeek) ? <FightWeekTable rx={rx} /> : null}
      {MODE.prep ? (
        <Card>
          <Head>What this week actually is</Head>
          <Note s={{ marginTop: 4, marginBottom: 10 }}>{rx.em}</Note>
          <Row k="Trap bar and squat" val={PREP_PHASE_NAME[rx.lift] + " · " + rx.sc} />
          <Row k={psqOf(rx) && psqOf(rx).fast ? "Speed squat (Wed)" : "Pause squat (Wed)"} val={psqOf(rx) ? (psqOf(rx).fast ? "fast · " : "2-second pause · ") + psqLine(psqOf(rx)) : "none this week"} />
          <Row k="Romanian deadlift (Sat)" val={rdlOf(rx) ? rdlOf(rx) + " × 6" : "none this week"} />
          <Row k="Monday base" val={rx.base + " min"} />
          <Row k="Tuesday" val={(PENG[rx.e1] || PENG.easy).n} />
          <Row k="Thursday" val={(PENG[rx.e2] || PENG.easy).n} />
          <Row k="Sunday" val={rx.sim ? rx.sim + " × 3 · rest " + rx.rest + "s" + (rx.scored ? " · SCORED" : "") : "The 20-minute test"} />
          <Row k="Sled · Nordics · sprints" val={rx.sled + " × 20 m · " + rx.nor[0] + " × " + rx.nor[1] + " · " + (rx.spr || "90% only")} />
          <Row k="Size block" val={rx.size === "full" ? "Thursday and Sunday — three sets" : rx.size === "half" ? "Thursday and Sunday — two sets" : "none this week"} />
          <Row k="Movement session" val={rx.move ? "Wednesday and Saturday evenings" : "Saturday evenings"} />
          <Row k="Sauna" val={rx.sauna ? "twice — Thursday after the easy thirty, Sunday after the easy hour" : "—"} />
          <Row k="Tests" val={prepTests(rx.doc).join(" · ") || "none"} />
        </Card>) : null}
      {MODE.spp ? (
        <Card>
          <Head>What this week actually is</Head>
          <Note s={{ marginTop: 4, marginBottom: 10 }}>{rx.em}</Note>
          <Row k="Squat · bench · trap bar" val={rx.profile ? "the profiles — five loads, two fast reps each" : rx.testWeek ? "the top triples — × 1.08 is the new working max" : sppMainLine(rx) + (rx.contrast ? " · three jumps or throws after each double" : "")} />
          <Row k="Landmine push press (Sat)" val={sppPp(rx).sets + " × " + sppPp(rx).reps + " each side, every rep fast"} />
          <Row k="Pause squat (Thu)" val={sppPsq(rx) ? sppPsq(rx).sets + " × " + sppPsq(rx).reps + " @ " + sppPsq(rx).pct + "%" : "none this week"} />
          <Row k={rx.fit ? "Flying sprints (Sat, outside)" : "Flying sprints (Thu)"} val={rx.testWeek ? "none this week" : rx.noFlying ? "none — the tendon gate" : sppSprints(rx) + " × 20 m " + (rx.spr90 ? "at 90%" : "flat out")} />
          <Row k="Jumps (Thu)" val={rx.testWeek ? "none this week" : !rx.jump ? "box jumps" : rx.noJumps ? "none — the tendon gate" : jumpOf(rx.jump).n + (rx.restart ? " · one stage down" : "")} />
          <Row k="The intervals (Sat)" val={(spp44Short(rx) ? "3 × 4" : "4 × 4") + (sppTread(rx) ? " on the treadmill at 5%" : "") + (rx.testWeek ? " — the engine test" : "")} />
          <Row k="Bursts (Tue)" val={(rx.bk === "sb4" ? "4" : "8") + " × 6 seconds on the assault bike"} />
          <Row k="Pressure rounds (Tue)" val={sppPrRounds(rx) + " × 3 minutes, straight after the bursts" + (sppArms(rx) ? ", the third minute arms only" + (rx.pr === "pa1" ? "; then the arms-only test" : "") : "")} />
          <Row k="Nasal runs" val={rx.eb ? "Wednesday 30 min · Sunday " + sppSunRun(rx) + " min" : "Wednesday and Sunday · 30 min"} />
          {rx.eb ? <Row k="The easy hour (Sat evening)" val={sppEasyHour(rx) + " min on the bike, nose only"} /> : null}
          <Row k="Everything else" val={rx.half ? "half the sets, rounded up" : "as written"} />
          <Row k="Tests" val={sppTests(rx.doc, rx.au).join(" · ") || "none"} />
        </Card>) : null}
      {MODE.trans ? (
        <Card>
          <Head>The transition</Head>
          <Note s={{ marginTop: 4, marginBottom: 10 }}>{TRANSITION_INTRO}</Note>
          {TRANSITION_RULES.map((r, i) => <Row key={i} k={"Rule " + (i + 1)} val={r} />)}
        </Card>) : null}

      {DAYS.map((d, di) => { const dk = dayKey(macro, week, d); const n = (done[dk] || []).length;
        const sess = sessFor(d, rx);
        const tot = !MODE.camp && d === "sat" && rx.test ? 1 : countedBlocks(d, rx).length; const full = tot > 0 && n >= tot;
        const sl = sleepDay(d, rx);
        const blank = (MODE.camp || MODE.trans) && !sess;
        return (
          <Card key={d} s={{ padding: 0, opacity: blank ? .6 : 1 }}>
            <button onClick={() => openDay(d)} style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, textAlign: "left", background: "transparent", border: "none", padding: "14px 12px 14px 16px", cursor: "pointer", minHeight: 64 }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={Object.assign({}, dsp, { fontSize: FS.body, fontWeight: 800, letterSpacing: .4, color: C.chalk })}>{(sess ? sess.n : DSH[d])}{row ? " · " + shortDate(addDays(row.mon, di)) : ""}{sess && sess.pm ? " · PM" : ""}</span>
                  <span style={Object.assign({}, mno, { fontSize: FS.micro, fontWeight: 700, color: C.ash, whiteSpace: "nowrap" })}>{sl || blank ? "" : !MODE.camp && d === "sat" && rx.test ? "TEST DAY" : v(sess.m, rx) + " MIN"}</span>
                </div>
                <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, marginTop: 4, lineHeight: 1.4 })}>{sl ? "SLEEP. No alarm." + (d === "fri" ? " RANGE at home in the evening." : "") : blank ? (MODE.camp ? campBlank(d, rx).h : "The head check holds the transition — nothing until a doctor has cleared you") : !MODE.camp && d === "sat" && rx.test ? "Sprint · jump · throws · squat · bench · pull · tape" : (rx.fit && sess.tf) || (rx.au && sess.ta) || (rx.tw && sess.tt) || sess.t}</div>
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, minWidth: 36 }}>
                {full ? <CheckDot ok size={24} /> : null}
                <span data-day-count={d} style={Object.assign({}, mno, { fontSize: FS.micro, fontWeight: 700, color: full ? C.accent : n ? C.warn : C.ash })}>{tot ? (MODE.spp ? Math.min(n, tot) : n) + "/" + tot : ""}</span>
              </span>
              <span aria-hidden="true" style={{ color: C.ring, flexShrink: 0 }}><Icon n="right" size={18} w={2.2} /></span>
            </button>
          </Card>);
      })}
    </div>);
}

/* ================================================================
   TRACK — numbers, progress, body
   ================================================================ */
const LIFT_LOC = { squat: ["sat", "squat"], bench: ["mon", "bench"], tbdl: ["wed", "tbdl"], pp: ["sat", "pushpress"] };
function topSet(e) { if (!e || !e.sets) return null; let m = null; e.sets.forEach((s) => { if (s.ok && num(s.w) != null) m = m == null ? num(s.w) : Math.max(m, num(s.w)); }); return m; }

/* a chart's label in plain words: "w3" is week 3 */
const plainLabel = (l) => String(l).replace(/^m(\d+)w(\d+)$/i, "Cycle $1 week $2").replace(/^M(\d+)·w(\d+)$/, "Cycle $1 week $2").replace(/^M(\d+)$/, "Cycle $1").replace(/^r?w(\d+)$/i, "Week $1");
function Bars({ data, unit }) {
  const rows = (data || []).map((d) => [plainLabel(d[0]), d[1]]);
  if (!rows.length) return <Note s={{ fontStyle: "italic" }}>Nothing logged yet.</Note>;
  if (rows.length === 1) return <Note>{rows[0][0]} · <span style={{ color: C.chalk, fontWeight: 700 }}>{rows[0][1]}{unit ? " " + unit : ""}</span> · the line starts with the second reading.</Note>;
  return <Trend data={rows} unit={unit} h={120} />;
}

/* The erg outputs, gathered by session type, so the same session is only
   ever read against another one of its own kind. */
const ERG_TYPE_NAME = { vo2: "4-minute intervals", vo2s: "4-minute intervals · 3 × 4", sb: "6-second bursts", sb4: "6-second bursts · four", pr: "Pressure rounds", pr2: "Pressure rounds · two", pa: "Pressure rounds · arms-only third minute", pa1: "Pressure rounds · one round", arm3: "The arms-only test", mod: "Moderate intervals", lac: "40-second repeats", lac2: "40-second repeats · 2 × 6",
  rz: "Repeat bursts", rz1: "Repeat bursts · one set", rz3: "Repeat bursts · one set", tempo: "Tempo intervals", thr: "Threshold",
  erg: "Rounds on the erg", fp: "Fight-pace rounds", easy: "Easy", easy15: "Easy flush", sim: "The simulation", t20: "The 20-minute test" };
/* `camp` is the view: true for the camp, "prep" for Prep, false for the
   classic, which reads its current macrocycle only. A session's type is
   the one saved with it when it was logged, else the week's own. */
function ergByType(log, camp, L, macro) {
  const out = {};
  const push = (type, label, week, total, d) => { if (total == null) return;
    const r = (out[type] = out[type] || { n: ERG_TYPE_NAME[type] || type, rows: [] }); r.rows.push({ label, week, v: r1(total), d: d || null }); };
  Object.keys(log || {}).forEach((k) => {
    if (k.indexOf("_erg") < 0) return;
    const p = parseKey(k); if (!p) return;
    if (!inScope(camp, p.macro)) return;
    if (scopeOf(camp) === "fighter" && String(p.macro) !== String(macro)) return;
    const base = p.id.replace(/_erg$/, ""), e = log[k] || {};
    const wk = () => (MAC_PROGRAM[p.macro] && String(p.macro) !== String(MODE.mac) ? seasonRxFor(p.macro, p.week, true) : rxFor(p.week));
    const type = /fs$/.test(base) ? "sim" : /bike20$/.test(base) ? "t20"
      : base === "cond" || base === "c_eng1" || base === "p_e1" ? e.kind || wk().eng || wk().eng1 || wk().e1
      : base === "cond2" || base === "c_eng2" || base === "p_e2" ? e.kind || wk().eng2 || wk().e2
      : base === "s_44" ? e.kind || wk().e
      : base === "s_burst" ? e.kind || wk().bk
      : base === "s_press" ? e.kind || wk().pr
      : base === "s_arm3" ? "arm3" : null;
    if (!type) return;
    push(type, "w" + p.week, p.week, ergTotal(e.v || []), e.d || keyDate(p));
  });
  Object.keys(out).forEach((t) => out[t].rows.sort((a, b) => a.week - b.week));
  return out;
}
/* one session type's totals as a chart's rows: the day it was done, the number, and where the day sits in time */
const ergChart = (t) => t.rows.map((r) => [r.d ? shortDate(r.d) : "Week " + r.week, r.v, r.d ? parseISO(r.d).getTime() / 86400000 : null]);
const BURST_TYPES = ["sb", "sb4"];
/* THE WEEKS, A ROW EACH: a square a day, filled when the day's session was done */
function SessionGrid({ macro, week, L, done }) {
  const seg = MODE.mac ? segmentOf(seasonRow(macro, week)) : null;
  const weeks = seg && seg.length ? seg.map((r, i) => ({ w: r.kw, n: r.idx || i + 1 })) : Array.from({ length: L }, (_, i) => ({ w: i + 1, n: i + 1 }));
  return (
    <div data-testid="session-grid">
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
        <span style={{ width: 26 }} />
        {DAYS.map((d) => <span key={d} style={Object.assign({}, mno, { flex: 1, textAlign: "center", fontSize: FS.micro, fontWeight: 700, color: C.ash })}>{DSH[d][0]}</span>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weeks.map((x) => { const rx = rxFor(x.w), here = x.w === week;
          return (
            <div key={x.w} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={Object.assign({}, mno, { width: 26, fontSize: FS.micro, fontWeight: here ? 700 : 500, color: here ? C.chalk : C.ash })}>{x.n}</span>
              {DAYS.map((d) => { const n = (done[dayKey(macro, x.w, d)] || []).length, tot = !MODE.camp && d === "sat" && rx.test ? 1 : countedBlocks(d, rx).length, f = tot ? n / tot : 0;
                return <span key={d} data-grid-cell={f >= 1 ? "done" : f > 0 ? "part" : tot ? "todo" : "rest"} style={{ flex: 1, height: 16, borderRadius: 3, background: tot === 0 ? "transparent" : f >= 1 ? C.accent : f > 0 ? soft(C.warn) : soft(C.chalk) }} />; })}
            </div>); })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
        {[["Done", C.accent], ["Part done", soft(C.warn)], ["To do", soft(C.chalk)]].map((k) => <span key={k[0]} style={Object.assign({}, bdy, { display: "flex", alignItems: "center", gap: 6, fontSize: FS.micro, color: C.ash })}><span style={{ width: 12, height: 12, borderRadius: 3, background: k[1] }} />{k[0]}</span>)}
      </div>
    </div>);
}

function Track({ current, maxes, onSetMax, maxHist, log, body, addBody, done, L, calis, camp, view: viewIn, title, rangeWeeks, rangeGet, moveWeeks, moveGet, moveEnds, campRows, fight, sub: subIn, setSub: setSubIn, st, morning, photos, setPhotos, fuel, dateOf, dayIso, photoDay, ergUnit, tape, setTape, fuelPhase, weightOn, weekStats, onWeigh, todayIso }) {
  const [subOwn, setSubOwn] = useState("dash");
  const sub = subIn || subOwn;
  const setSub = (x) => { setSubOwn(x); if (setSubIn) setSubIn(x); };
  const [edit, setEdit] = useState({});
  const [tp, setTp] = useState({});
  /* the row of pages scrolls sideways: bring the chosen one into the middle of it */
  const pagesRef = useRef(null);
  useEffect(() => { const row = pagesRef.current, el = row && row.querySelector("[data-on]");
    if (row && el) row.scrollLeft = el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2; }, [sub]);
  const macro = current.macro;
  /* whose weeks the charts read: the camp's, Prep's or the classic's */
  const view = viewIn !== undefined ? viewIn : camp;
  const testVal = (m, id) => { const e = log["m" + m + "w16-test-" + id]; return e ? num(e.w) : null; };
  const fade = (m, w) => { const a = log["m" + m + "w" + w + "-sun-fs_rd1"], b = log["m" + m + "w" + w + "-sun-fs_rd6"];
    return a && b && num(a.w) && num(b.w) ? (num(a.w) - num(b.w)) / num(a.w) * 100 : null; };
  /* the pages, in plain words */
  const scope = scopeOf(view);
  const PAGES = [["dash", "Overview"], ["numbers", "Lifts"], ["sprints", "Sprints"], ["measure", "Fitness"], ["body", "Body"], ["photos", "Photos"], ["ref", "Weigh-in"], ["calis", "Calisthenics"], ["range", "Movement"]]
    .concat(camp ? [["camp", "Camp"]] : []).concat(scope === "fighter" ? [["progress", "Test days"]] : []);
  /* body weight: every weight on file, and the target it is heading for */
  const wRows = weightSeries({ morning, tape, body, fuel });
  const wGoal = num(((st || {}).season || {}).limit) || 76;
  const wLast = wRows[wRows.length - 1], wPrev = wRows[wRows.length - 2];
  const mLast = (f) => { const ds = Object.keys(morning || {}).filter((d) => num((morning[d] || {})[f]) != null).sort(); return ds.map((d) => num(morning[d][f])); };
  const rhr = mLast("rhr"), hrv = mLast("hrv");
  const dOf = (xs) => (xs.length > 1 ? xs[xs.length - 1] - xs[xs.length - 2] : null);
  const erg = ergByType(log, view, L, current.macro);
  const bursts = BURST_TYPES.filter((t) => erg[t]).map((t) => ({ n: erg[t].n, rows: ergChart(erg[t]) }));
  const weightCard = <WeightCard rows={wRows} goal={wGoal} today={todayIso} onAdd={onWeigh} />;
  /* a box's number, session by session; and the cards for the ones that have any */
  const box = (id, field) => boxSeries(log, id, view, keyDate, field);
  const charts = (list) => { const got = list.filter((x) => x.data.length), none = list.filter((x) => !x.data.length);
    return (
      <div>
        {got.map((x) => <ChartCard key={x.title} title={x.title} data={x.data} unit={x.unit} dir={x.dir} note={x.note} fmt={x.fmt} icon={x.icon} />)}
        {none.length ? (
          <Card>
            <Eye>{got.length ? "Still to come" : "Nothing logged yet"}</Eye>
            <Note c={C.chalk} s={{ marginTop: 0 }}>{none.map((x) => x.title).join(" · ")}</Note>
            <Note>Each one draws its own line here once it has been logged on its card.</Note>
          </Card>) : null}
      </div>); };
  return (
    <div>
      <div ref={pagesRef} data-testid="track-pages" className="o8-row" style={{ display: "flex", gap: 8, margin: "0 -16px 14px", padding: "2px 16px" }}>
        {PAGES.map((x) => <button key={x[0]} onClick={() => setSub(x[0])} data-on={sub === x[0] ? "1" : undefined} aria-pressed={sub === x[0]}
          style={Object.assign({}, dsp, { flex: "0 0 auto", fontSize: FS.meta, fontWeight: 700, letterSpacing: .2, padding: "10px 16px", borderRadius: 999, cursor: "pointer", minHeight: 48, whiteSpace: "nowrap", background: sub === x[0] ? C.accent : soft(C.ash), color: sub === x[0] ? C.on : C.chalk, border: "none" })}>{x[1]}</button>)}
      </div>

      {sub === "dash" ? (
        <div data-testid="overview">
          <StatRow>
            <Stat testid="stat-weight" label="Body weight" value={wLast ? String(Math.round(wLast.kg * 10) / 10) : null} unit="kg" values={wRows.slice(-12).map((r) => r.kg)}
              d={wLast && wPrev ? wLast.kg - wPrev.kg : null} good={wLast && wPrev && Math.abs(wLast.kg - wPrev.kg) > 1e-9 ? (wLast.kg > wGoal ? wLast.kg < wPrev.kg : wLast.kg > wPrev.kg) : null} sub="No weight yet" on={() => setSub("body")} />
            <Stat testid="stat-week" label="This week" value={weekStats ? weekStats.done + " / " + weekStats.planned : null} sub="sessions done" />
          </StatRow>
          <StatRow>
            <Stat testid="stat-rhr" label="Resting pulse" value={rhr.length ? String(rhr[rhr.length - 1]) : null} unit="bpm" values={rhr.slice(-12)} d={dOf(rhr)} good={dOf(rhr) == null || Math.abs(dOf(rhr)) < 1e-9 ? null : dOf(rhr) < 0} sub="Not logged yet" />
            <Stat testid="stat-hrv" label="HRV" value={hrv.length ? String(hrv[hrv.length - 1]) : null} unit="ms" values={hrv.slice(-12)} d={dOf(hrv)} good={dOf(hrv) == null || Math.abs(dOf(hrv)) < 1e-9 ? null : dOf(hrv) > 0} sub="Not logged yet" />
          </StatRow>
          {weightCard}
          <Card>
            <div style={Object.assign({}, dsp, { fontSize: FS.body, fontWeight: 700, color: C.chalk, marginBottom: 12 })}>Sessions done, week by week</div>
            <SessionGrid macro={macro} week={current.week} L={L} done={done} />
          </Card>
          <Dashboard log={log} morning={morning || {}} st={st || {}} camp={view} body={body} fuel={fuel} dateOf={dateOf} weights={wRows} />
        </div>) : null}

      {sub === "sprints" ? <SprintsPage log={log} view={view} isoOf={keyDate} bursts={bursts} unit={ergUnitLabel(ergUnit)} /> : null}

      {sub === "ref" ? <Referee tape={tape || []} setTape={setTape} phase={fuelPhase} weightOn={weightOn} /> : null}

      {sub === "photos" ? <PhotosView photos={photos || {}} setPhotos={setPhotos} camp={camp} week={current.week} dayIso={dayIso} isPhotoDay={photoDay} /> : null}

      {sub === "measure" ? (
        <div data-testid="fitness-page">
          {charts(Object.keys(erg).filter((t) => BURST_TYPES.indexOf(t) < 0).map((t) => ({ title: erg[t].n + " · the session's total", data: ergChart(erg[t]), unit: ergUnitLabel(ergUnit), dir: "up", icon: "heart" }))
            .concat(scope === "spp" ? [
              { title: "The 4 × 4 on the treadmill · distance", data: box("s_44", "w"), unit: "km", dir: "up", icon: "heart" },
              { title: "Nasal run · distance", data: box("s_run", "w"), unit: "km", dir: "up", icon: "heart" },
              { title: "Nasal run · average heart rate", data: box("s_run", "hr"), unit: "bpm", dir: "down", icon: "heart", note: "The same distance at a lower heart rate is the base growing." },
              { title: "Broad jump · best distance", data: box("s_bj", "w"), unit: "cm", dir: "up", icon: "bolt" },
              { title: "Rotational throw · best distance", data: box("s_rthrow", "w"), unit: "m", dir: "up", icon: "bolt" },
            ] : [])
            .concat([{ title: "Recovery heart rate · the drop over a minute", data: SETTLE_IDS.reduce((a, id) => a.concat(box(id + "_drop", "w")), []).sort((x, y) => (x[2] || 0) - (y[2] || 0)), unit: "bpm", dir: "up", icon: "heart",
              note: "The heart rate at the end of the last interval against the heart rate sixty seconds later. Bigger is better, and it moves with the base." }]))}
        </div>) : null}

      {sub === "camp" ? <CampNumbers rows={campRows} log={log} maxes={maxes} onSetMax={onSetMax} /> : null}

      {sub === "numbers" ? (
        <div>
          <Card ac={C.brass}>
            <Eye c={C.brass}>Your four numbers — every weight in the app comes off these</Eye>
            {MAXES.map((m) => { const cur = num(maxes[m[0]]); const h = maxHist.filter((x) => x.lift === m[0]);
              return (
                <div key={m[0]} style={{ padding: "10px 0", borderBottom: "1px solid " + C.line }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ flex: 1 }}>
                      <div style={Object.assign({}, bdy, { fontSize: 18, fontWeight: 600, color: C.chalk })}>{m[1]}</div>
                      <div data-testid="max-when" style={Object.assign({}, bdy, { fontSize: 15, color: C.ash, marginTop: 2 })}>{h.length ? "Last set " + shortDate(h[0].d) + " · " + h[0].src : cur ? "Entered by hand" : MODE.mac ? "Not set — enter the working max" : "Not set — week 1 finds it, or enter a number"}</div>
                    </span>
                    <span style={Object.assign({}, big, { fontSize: 22, fontWeight: 700, color: cur ? C.chalk : C.ash, whiteSpace: "nowrap" })}>{cur ? cur : "—"}{cur ? <span style={Object.assign({}, mno, { fontSize: 15, fontWeight: 600, color: C.ash })}> kg</span> : null}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <div style={{ flex: 1 }}><Fld v={edit[m[0]]} on={(val) => setEdit(Object.assign({}, edit, { [m[0]]: val }))} ph={MODE.mac ? "set of 3 × 1.08 (kg)" : "new max (kg)"} /></div>
                    <Btn small c={C.brass} dis={!num(edit[m[0]])} on={() => { onSetMax(m[0], num(edit[m[0]]), "entered by hand"); setEdit(Object.assign({}, edit, { [m[0]]: "" })); }}>SAVE</Btn>
                  </div>
                  {h.length > 1 ? <div data-testid="max-history" style={Object.assign({}, mno, { fontSize: 13, color: C.ash, marginTop: 8 })}>{h.slice(0, 4).map((x) => x.kg + " kg").join(" ← ")}</div> : null}
                </div>);
            })}
            {MODE.mac ? <Note>{SEASON_MAXES_RULE}</Note>
              : <Note>{FIGHTER_MAXES_RULE}</Note>}
          </Card>
          {camp ? <Note c={C.ash} s={{ fontStyle: "italic" }}>Camp Mode is on: the camp loads from working weights, not these. Your maxes wait here, untouched, until the switch goes off.</Note> : null}
          <LiftsCharts log={log} view={view} isoOf={keyDate} nameOf={liftName} added={(id) => ADD_ITEMS.indexOf(id) >= 0}
            mains={camp ? [["c_squat", "Back squat"], ["c_bench", "Bench press"], ["c_tbdl", "Trap bar deadlift"]] : [["squat", "Back squat"], ["bench", "Bench press"], ["tbdl", "Trap bar deadlift"]]} />
          <BarSpeedTrack log={log} camp={view} />
          {scopeOf(view) !== "fighter" ? null : (
          <Card ac={C.cobalt}>
            <Eye c={C.cobalt}>Fight-sim fade — scored weeks 4, 9 and 14</Eye>
            {[4, 9, 14].map((w) => { const f = fade(macro, w);
              return <div key={w} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + C.line }}>
                <span style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk })}>Week {w}</span>
                <span style={Object.assign({}, mno, { fontSize: 13, fontWeight: 700, color: f == null ? C.ash : f <= 5 ? C.accent : f <= 10 ? C.warn : C.bad })}>{f == null ? "—" : f.toFixed(1) + "% drop"}</span></div>; })}
            <Note>Round 6 against round 1. Under 5% is excellent, under 10% is the standard. The whole game is pushing it toward zero.</Note>
          </Card>)}
        </div>) : null}

      {sub === "progress" ? (
        <div>
          <Card ac={C.moss}>
            <Eye c={C.moss}>Test day, macrocycle by macrocycle</Eye>
            <Note s={{ marginTop: 0 }}>Every week-16 test, charted. Target +3–6% on the lifts, +3–5% on throws and jump, 1–3% off the sprint — fresh, three times a year.</Note>
          </Card>
          {TESTS.filter((t) => !t.opt).map((t) => {
            const h = []; for (let m = 1; m <= macro; m++) { if (t.sun) { const b0 = log["m" + m + "w1-sun-bike20"]; if (b0 && num(b0.w) != null) h.push(["M" + m + "·w1", num(b0.w)]); const b1 = log["m" + m + "w16-sun-bike20"]; if (b1 && num(b1.w) != null) h.push(["M" + m + "·w16", num(b1.w)]); continue; } const val = testVal(m, t.id); if (val != null) h.push(["M" + m, val]); }
            const d = h.length > 1 ? (h[h.length - 1][1] - h[h.length - 2][1]) / h[h.length - 2][1] * 100 : null;
            const good = d == null ? null : t.dir === "down" ? d < 0 : d > 0;
            return (
              <Card key={t.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={Object.assign({}, bdy, { fontSize: 15, fontWeight: 600, color: C.chalk })}>{t.n}</span>
                  <span style={Object.assign({}, mno, { fontSize: 12, color: d == null ? C.ash : good ? C.moss : C.oxide })}>{d == null ? "" : (d > 0 ? "+" : "") + d.toFixed(1) + "%"}</span>
                </div>
                <Bars data={h} color={C.brass} />
              </Card>);
          })}
          <Card ac={C.brass}>
            <Eye c={C.brass}>Top sets this macrocycle</Eye>
            {MAXES.map((m) => { const loc = LIFT_LOC[m[0]]; const h = [];
              for (let w = 1; w <= L; w++) { const ts = topSet(log["m" + macro + "w" + w + "-" + loc[0] + "-" + loc[1]]); if (ts != null) h.push(["w" + w, ts]); }
              return <div key={m[0]} style={{ marginBottom: 6 }}><div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{m[1]}</div>{h.length ? <Bars data={h.slice(-8)} /> : <Note s={{ fontStyle: "italic", marginTop: 2 }}>No sets confirmed yet.</Note>}</div>; })}
          </Card>
          <Card ac={C.cobalt}>
            <Eye c={C.cobalt}>Sessions completed — macrocycle {macro}</Eye>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
              {Array.from({ length: L }, (_, i) => i + 1).map((w) => { const rx = rxFor(w);
                return (
                  <div key={w} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={Object.assign({}, mno, { fontSize: 12, color: C.ash, width: 20 })}>{w}</span>
                    {DAYS.map((d) => { const dk = dayKey(macro, w, d); const n = (done[dk] || []).length; const tot = !MODE.camp && d === "sat" && rx.test ? 1 : countedBlocks(d, rx).length;
                      const f = tot ? n / tot : 0;
                      return <div key={d} style={{ flex: 1, height: 12, borderRadius: 2, background: tot === 0 ? "transparent" : f >= 1 ? C.accent : f > 0 ? soft(C.warn) : C.card, border: "1px solid " + C.line }} />; })}
                  </div>);
              })}
            </div>
            <div style={Object.assign({}, mno, { fontSize: 12, color: C.ash, marginTop: 5, display: "flex", justifyContent: "space-between" })}>{DAYS.map((d) => <span key={d} style={{ flex: 1, textAlign: "center" }}>{DSH[d][0]}</span>)}</div>
          </Card>
          <Card ac={C.oxide}>
            <Eye c={C.oxide}>If a test stalls — two macrocycles flat, not one</Eye>
            {[["Max strength", "Block 2 wasn't heavy enough, or Block 1 didn't build enough. Add a set to the main lifts in weeks 1–4."],
              ["Speed / jump", "Block 3 carried fatigue in. Make week 10's easy week genuinely easy."],
              ["Size", "Not programming. Volume or food."],
              ["Fight-sim fade", "Aerobic base eroded. Guard both bike sessions and the fight rounds — they are the engine now that Friday is a sleep day."],
              ["Everything", "Recovery, not programming. Take a full week off."]].map((r) => (
              <div key={r[0]} style={{ padding: "8px 0", borderBottom: "1px solid " + C.line }}>
                <div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{r[0]}</div>
                <div style={Object.assign({}, bdy, { fontSize: 12, color: C.ash, marginTop: 2, lineHeight: 1.45 })}>{r[1]}</div>
              </div>))}
          </Card>
        </div>) : null}

      {sub === "body" ? (
        <div data-testid="body-page">
          {weightCard}
          {charts([["arm", "Arm"], ["sh", "Shoulders"], ["wa", "Waist"]].map((k) => ({ title: k[1], unit: "cm", icon: "body",
            data: (body || []).filter((e) => e && e.d && num(e[k[0]]) != null).slice().sort((a, b) => (a.d < b.d ? -1 : 1)).map((e) => [shortDate(e.d), num(e[k[0]]), parseISO(e.d).getTime() / 86400000]) })))}
          <Card ac={C.violet}>
            <Eye c={C.violet}>Tape — every 4–6 weeks</Eye>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {[["bw", "WEIGHT"], ["arm", "ARM"], ["sh", "SHOULDERS"]].map((k) => <div key={k[0]} style={{ flex: 1 }}><Lab>{k[1]}</Lab><Fld v={tp[k[0]]} on={(val) => setTp(Object.assign({}, tp, { [k[0]]: val }))} ph="—" /></div>)}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[["ch", "CHEST"], ["nk", "NECK"], ["wa", "WAIST"]].map((k) => <div key={k[0]} style={{ flex: 1 }}><Lab>{k[1]}</Lab><Fld v={tp[k[0]]} on={(val) => setTp(Object.assign({}, tp, { [k[0]]: val }))} ph="—" /></div>)}
            </div>
            <Btn c={C.violet} fill s={{ width: "100%" }} dis={!num(tp.bw)} on={() => { addBody(tp); setTp({}); }}>SAVE MEASUREMENTS</Btn>
            <Note>If the waist climbs faster than shoulders and arms, cut 100–150 kcal. If bodyweight drifts down with training unchanged, eat more.</Note>
          </Card>
          {body.slice(0, 8).map((e, i) => (
            <Card key={i} s={{ padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={Object.assign({}, mno, { fontSize: 12, color: C.ash })}>{e.d}</span>
                <span style={Object.assign({}, mno, { fontSize: 12, color: C.chalk })}>{e.bw} kg{e.arm ? " · arm " + e.arm : ""}{e.wa ? " · waist " + e.wa : ""}</span>
              </div>
            </Card>))}
        </div>) : null}

      {sub === "calis" ? (
        <div>
          <Card ac={C.brass}>
            <Eye c={C.brass}>Calisthenics — where each line stands</Eye>
            <Note c={C.chalk} s={{ marginTop: 0 }}>{CALIS_INTRO}</Note>
            {camp ? <Note c={C.oxide} bold>CAMP MODE — the five lines run at your current levels in the same slots: ring rows Monday, ring dips and the muscle-up line Wednesday, the pistol line Tuesday, the L-sit and the tuck front lever Sunday. Half the sets in week 5, holds only from week 9. The handstand and the planche leans are not on the camp's clock.</Note> : null}
          </Card>
          {LINES.map((ln) => { const lev = curLevel(calis, ln.id); const own = ownedDate(calis, ln.id, lev.i);
            const hist = (calis && calis.owned && calis.owned[ln.id]) || {};
            return (
              <Card key={ln.id} ac={ln.c}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <span style={Object.assign({}, dsp, { fontSize: 18, fontWeight: 800, letterSpacing: .4, color: C.chalk })}>{ln.n}</span>
                  <Chip>LEVEL {lev.l} / {ln.levels.length}</Chip>
                </div>
                <div style={Object.assign({}, bdy, { fontSize: 15, color: C.ash, marginTop: 3 })}>{ln.where}</div>
                <Note c={C.chalk}>{levelText(ln.id, lev, current.week)}</Note>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 9, paddingTop: 8, borderTop: "1px solid " + C.line }}>
                  <span style={cap()}>OWNED</span>
                  <span style={Object.assign({}, mno, { fontSize: 15, fontWeight: own ? 700 : 400, color: own ? C.accent : C.ash })}>{own ? fmtDate(own) : "not yet"}</span>
                </div>
                {Object.keys(hist).length ? <div style={Object.assign({}, mno, { fontSize: 12, color: C.ash, marginTop: 6 })}>
                  {Object.keys(hist).sort((a, b) => Number(a) - Number(b)).map((k) => "L" + ln.levels[Number(k)].l + " " + hist[k]).join(" · ")}
                </div> : null}
              </Card>); })}
        </div>) : null}

      {sub === "range" ? <div><MoveTrack weeks={moveWeeks || []} get={moveGet} ends={moveEnds} /><RangeTrack weeks={rangeWeeks || []} get={rangeGet} /></div> : null}
    </div>);
}

/* ================================================================
   PLAN — both documents, read offline, with a table of contents
   ================================================================ */
const PLAN_DOCS = [
  ["prep", "Prep", C.moss, prepDocMd], ["camp", "Camp", C.brass, campDoc], ["spp", "Strength & Power", C.oxide, sppDocMd], ["move", "Move", C.violet, moveDocMd],
  ["fuel", "Fuel · Fighter", C.brass, fuelDocMd], ["menu", "The menu", C.brass, fuelMenuMd],
  ["menub", "Menu B + water", C.cobalt, fuelMenuBMd], ["fseason", "Fuel · Season", C.moss, fuelSeasonMd],
];
function PlanView({ program, title }) {
  const [doc, setDoc] = useState(program === "camp" ? "camp" : program === "spp" ? "spp" : "prep");
  const D0 = PLAN_DOCS.find((x) => x[0] === doc) || PLAN_DOCS[0];
  /* the programme being run leads the row, so its pages need no scroll */
  const mine = program === "camp" ? "camp" : program === "spp" ? "spp" : "prep";
  const docs = PLAN_DOCS.filter((x) => x[0] === mine).concat(PLAN_DOCS.filter((x) => x[0] !== mine));
  return (
    <div>
      <div data-testid="plan-docs" className="o8-row" style={{ display: "flex", gap: 8, margin: "0 -16px 12px", padding: "2px 16px" }}>
        {docs.map((x) => (
          <button key={x[0]} onClick={() => setDoc(x[0])} aria-pressed={doc === x[0]}
            style={Object.assign({}, dsp, { flex: "0 0 auto", fontSize: FS.meta, fontWeight: 700, letterSpacing: .2, padding: "10px 16px", borderRadius: 999, cursor: "pointer", minHeight: 48, whiteSpace: "nowrap", background: doc === x[0] ? C.accent : soft(C.ash), color: doc === x[0] ? C.on : C.chalk, border: "none" })}>{x[1]}</button>))}
      </div>
      <Note s={{ marginTop: 0, marginBottom: 12, fontSize: FS.meta }}>Every document in full, on the phone, with no signal. Everything the app runs comes off these pages.</Note>
      <DocView key={D0[0]} md={D0[3]} />
    </div>);
}

/* ================================================================
   SETTINGS
   ================================================================ */
/* the settings page is long: a row of jumps at its top, and the line each lands on */
const SET_JUMPS = [["day", "The day"], ["look", "Look"], ["sound", "Sound"], ["cycle", "Rest clock"], ["range", "Range and Move"], ["calis", "Calisthenics"], ["backup", "Backup"]];
const jumpTo = (k) => { const e = document.getElementById("set-" + k); if (e && e.scrollIntoView) e.scrollIntoView({ block: "start" }); };
/* one group of settings: its name, then its card */
const SetCard = ({ id, title, children }) => (
  <section id={"set-" + id} style={{ scrollMarginTop: "calc(64px + env(safe-area-inset-top))" }}>
    <Section>{title}</Section>
    <Card>{children}</Card>
  </section>);
const Toggle = ({ on, set, n, s, c, last }) => (
  <div onClick={set} role="switch" aria-checked={!!on} style={{ display: "flex", gap: 12, alignItems: "center", padding: last ? "2px 0" : "12px 0", borderBottom: last ? "none" : "1px solid " + C.line, cursor: "pointer", minHeight: 56 }}>
    <Knob on={on} c={c} />
    <span style={{ flex: 1, minWidth: 0 }}>
      <div style={Object.assign({}, bdy, { fontSize: FS.body, fontWeight: 600, color: C.chalk, lineHeight: 1.3 })}>{n}</div>
      <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, marginTop: 2, lineHeight: 1.45 })}>{s}</div>
    </span>
  </div>);

/* THE SEASON BUILDER'S QUESTIONS — "Fight booked?", and the rest if yes.
   Every change re-plans from today and says in one line what changed. */
function FightSettings({ st, replan, season, dayIso }) {
  const from = planStartFor(dayIso);
  /* START AGAIN is never kept: it belongs to the plan from this Monday */
  const pending = (st.plans || []).find((p) => p.from === from);
  const restartNow = !!(pending && pending.inputs && pending.inputs.restart);
  const repeatNow = !!(pending && pending.inputs && pending.inputs.repeat);
  const cur = Object.assign({ booked: false, classic: false, spp: false }, FIGHT_DEFAULTS, st.season || {}, restartNow ? { restart: true } : {}, repeatNow ? { repeat: true } : {});
  const [draft, setDraft] = useState(cur);
  useEffect(() => { setDraft(cur); }, [JSON.stringify(st.season || {}), restartNow, repeatNow]);
  const d = draft;
  const set = (patch) => setDraft(Object.assign({}, d, patch));
  const changed = JSON.stringify(Object.assign({}, cur)) !== JSON.stringify(Object.assign({}, d));
  const okKg = (x, blankOk, zeroOk) => (x == null || String(x).trim() === "" ? blankOk : num(String(x).replace(",", ".")) != null && (zeroOk ? num(String(x).replace(",", ".")) >= 0 : num(String(x).replace(",", ".")) > 0));
  const validFight = !d.booked || (d.fight && d.fight >= dayIso && num(d.rounds) > 0 && num(d.mins) > 0 && num(d.rest) >= 0
    && okKg(d.limit, true) && okKg(d.tol, true, true) && okKg(d.natural, true));
  const onlyWeight = changed && !trainingChanged(cur, d);
  const M = d.booked && d.fight ? weeksBetween(from, d.fight) + 1 : 0;
  /* a Prep running into this Monday carries on, unless you start it again */
  const prevRow = season && season.rows ? season.rows.find((r) => r.mon === addDays(from, -7)) : null;
  const running = !!prevRow && prevRow.program === "prep" && prevRow.doc !== 14;
  /* a Strength, Power and Physique cycle running into this Monday carries on too */
  const sppRunning = !!prevRow && prevRow.program === "spp" && prevRow.doc !== 12;
  const isSpp = !d.booked && !!d.spp;
  /* carrying on: the Monday the other program takes over */
  const handOver = (() => {
    if (d.booked || d.restart || !(running ? isSpp : sppRunning && !isSpp)) return null;
    const s2 = buildSeason({ plans: (st.plans || []).filter((p) => p.from < from).concat([{ from, made: dayIso, inputs: Object.assign({}, d, { fight: null }) }]), today: dayIso });
    const r = s2.rows.find((x) => x.mon >= from && x.program === (isSpp ? "spp" : "prep") && !x.carried);
    return r ? r.mon : null; })();
  const lay = M > 0 ? campLayout(Math.min(M, 10), d.fitness) : null;
  const opt = (arr) => arr.map((x) => [x, x.toUpperCase()]);
  return (
    <div>
      <Lab>Fight booked?</Lab>
      <Seg opts={[["no", "NO"], ["yes", "YES"]]} val={d.booked ? "yes" : "no"} on={(v) => set({ booked: v === "yes" })} c={C.brass} />
      {!d.booked ? (
        <div style={{ marginTop: 12 }}>
          <Lab>What runs</Lab>
          <Seg col opts={[["prep", "PREP · 16-WEEK CYCLE"], ["spp", "STRENGTH, POWER, PHYSIQUE · 12 WEEKS"]]} val={d.spp ? "spp" : "prep"} on={(v) => set({ classic: false, spp: v === "spp" })} c={C.brass} />
          <Note>{isSpp ? "Strength, Power and Physique's twelve weeks, on repeat: size, then strength, then power, with the engine held. Prep doesn't change."
            : "Prep's 16-week cycle, on repeat: the training aimed at fighting, ready to go straight into a camp."}</Note>
          {!d.spp ? (<div style={{ marginTop: 10 }}><Lab>How fit you are right now</Lab>
            <Seg opts={opt(FITNESS)} val={d.fitness} on={(v) => set({ fitness: v })} c={C.brass} />
            <Note>Coming back from time off is low: a new cycle eases you back in.</Note></div>) : null}
        </div>) : (
        <div style={{ marginTop: 12 }}>
          <Lab>The date</Lab>
          <Fld type="date" v={d.fight || ""} a="left" on={(val) => set({ fight: val || "" })} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1 }}><Lab>Rounds</Lab><Fld v={d.rounds} on={(val) => set({ rounds: num(val) || val })} ph="6" /></div>
            <div style={{ flex: 1 }}><Lab>Minutes a round</Lab><Fld v={d.mins} on={(val) => set({ mins: num(val) || val })} ph="3" /></div>
            <div style={{ flex: 1 }}><Lab>Rest (seconds)</Lab><Fld v={d.rest} on={(val) => set({ rest: num(val) == null ? val : num(val) })} ph="60" /></div>
          </div>
          <div style={{ marginTop: 10 }}><Lab>Weigh-in</Lab>
            <Seg opts={WEIGH_INS} val={d.weighIn === "am" || d.weighIn === "day" ? d.weighIn : "before"} on={(v) => set({ weighIn: v })} c={C.brass} />
            <Note>Not confirmed yet? Afternoon or evening: it's the safer plan. Change it when you know.</Note></div>
          <div style={{ marginTop: 10 }}><Lab>Weight limit — blank and the weight plan is off</Lab>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}><Lab>Limit (kg)</Lab><Fld v={d.limit} on={(val) => set({ limit: val })} ph="—" /></div>
              <div style={{ flex: 1 }}><Lab>Tolerance (kg)</Lab><Fld v={d.tol} on={(val) => set({ tol: val })} ph="0" /></div>
              <div style={{ flex: 1 }}><Lab>Natural weight (kg)</Lab><Fld v={d.natural} on={(val) => set({ natural: val })} ph="optional" /></div>
            </div>
            <Note>Natural weight is what you weigh after a normal week of eating and training. The plan starts with the camp, on its first Monday. The weight comes off through food only — never water, never extra training. The sessions don't change.</Note></div>
          <div style={{ marginTop: 10 }}><Lab>How fit you are right now</Lab>
            <Seg opts={opt(FITNESS)} val={d.fitness} on={(v) => set({ fitness: v })} c={C.brass} /></div>
          <div style={{ marginTop: 10 }}><Lab>Emphasis — one, or none</Lab>
            <Seg opts={opt(EMPHASES)} val={d.emphasis} on={(v) => set({ emphasis: v })} c={C.brass} /></div>
          {M > 0 ? <Note c={C.chalk}>{M} {M === 1 ? "week" : "weeks"} from {fmtDate(from)} to the fight week{M >= 11 ? ": Prep fitted to the " + (M - 10) + " before the camp, then the full ten-week camp." : lay && lay.short ? ": the short-notice camp, " + lay.ids.join(" · ") + "." : lay ? ": the camp, shortened from the front — " + lay.ids.join(" · ") + "." : "."}</Note> : null}
          {d.emphasis === "strength" && M > 0 && M < 8 ? <Note c={C.oxide} bold>Strength takes longer than this camp has — power is the better pick.</Note> : null}
          {d.fight && d.fight < dayIso ? <Note c={C.oxide}>That date has passed.</Note> : null}
        </div>)}
      {running && (!d.booked || M >= 11) ? (
        <div data-testid="prep-running" style={{ marginTop: 10 }}><Lab>The Prep you're on</Lab>
          <Seg opts={[["on", "CARRY ON"], ["again", isSpp ? "START NOW" : "START AGAIN"]]} val={d.restart ? "again" : "on"} on={(v) => set({ restart: v === "again" || undefined })} c={C.brass} />
          <Note>{isSpp ? (d.restart ? "Strength, Power and Physique from " + fmtDate(from) + ". The Prep stops here."
              : "The Prep carries on to its test day" + (handOver ? ", then Strength, Power and Physique from " + fmtDate(handOver) : "") + ".")
            : d.restart ? "Week 1 again from " + fmtDate(from) + (d.fitness === "low" ? ", eased in" : "") + ". For coming back from time off."
            : "The weeks you've done stay done, and it carries on from the week you're on."}</Note></div>) : null}
      {sppRunning && !d.booked ? (
        <div data-testid="spp-running" style={{ marginTop: 10 }}><Lab>The cycle you're on</Lab>
          <Seg opts={isSpp ? [["on", "CARRY ON"], ["repeat", "REPEAT WEEK " + prevRow.doc], ["again", "START AGAIN"]] : [["on", "CARRY ON"], ["again", "START NOW"]]}
            val={d.restart ? "again" : d.repeat ? "repeat" : "on"} on={(v) => set({ restart: v === "again" || undefined, repeat: v === "repeat" || undefined })} c={C.brass} />
          <Note>{isSpp ? (d.restart ? "Week 1 again from " + fmtDate(from) + "." : d.repeat ? "Week " + prevRow.doc + " again from " + fmtDate(from) + ". Everything after it moves back a week; what you've ticked and logged stays."
              : "The weeks you've done stay done, and it carries on from the week you're on.")
            : d.restart ? "Prep from " + fmtDate(from) + ". Strength, Power and Physique stops here."
            : "Strength, Power and Physique carries on to its test week" + (handOver ? ", then Prep from " + fmtDate(handOver) : "") + "."}</Note></div>) : null}
      <Btn c={C.brass} fill dis={!changed || !validFight} s={{ width: "100%", marginTop: 12 }} on={() => { replan(d); toast(onlyWeight ? "Weight plan set" : "Plan set from " + fmtDate(from)); }}>{onlyWeight ? "SET THE WEIGHT PLAN" : changed ? "RE-PLAN FROM " + fmtDate(from).toUpperCase() : "THIS IS THE PLAN"}</Btn>
      {st.planNote ? <Note c={C.chalk}>{planWords(st.planNote)}</Note> : null}
    </div>);
}

/* BOXING TONIGHT on FOOD: the day's own switch, on from the weekday's tick
   in Settings */
function BoxingSwitch({ on, set }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <button data-testid="boxing-tonight" onClick={() => { set(!on); buzz(20); }}
        aria-pressed={on} style={Object.assign({}, mno, { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left", fontSize: 18, fontWeight: 700, letterSpacing: .6, padding: "10px 14px", borderRadius: RAD.m, cursor: "pointer", minHeight: 54,
          background: on ? soft(C.accent) : C.card, color: C.chalk, border: "1px solid " + (on ? C.accent : C.edge), boxShadow: C.shadow })}><span>{on ? "✓ BOXING TONIGHT" : "BOXING TONIGHT"}</span>
        <Knob on={on} /></button>
      {on ? <Note c={C.chalk}>{BOXING_SAY}</Note> : null}
    </div>);
}
export const BOXING_SAY = "The 5pm load goes in if the day hasn't one. Dinner moves to 20:15, after the boxing, so the casein comes off. 500 ml of water through the boxing.";

/* MAKING WEIGHT in Settings: the line, or the first weight it waits for */
function WeightSettings({ wt, dayIso }) {
  const p = wt.plan;
  /* the line waits for the camp */
  if (p.waiting && wt.start && wt.start > dayIso) return (
    <div data-testid="weight-ahead" style={{ marginTop: 12 }}>
      <Eye c={C.oxide}>Making weight</Eye>
      <Note c={C.chalk} s={{ marginTop: 0 }}>The weight plan starts with the camp, on {fmtDate(addDays(wt.start, 1))}. Until then the food runs as printed. The line is drawn from your seven-morning average on {fmtDate(wt.start)}.</Note>
      <Note>Keep weighing in every morning. If a Sunday average climbs so far over that the camp couldn't take it off inside the speed limit, the plan starts the next day instead, and says so here.</Note>
    </div>);
  if (p.waiting) return (
    <div data-testid="weight-waiting" style={{ marginTop: 12 }}>
      <Eye c={C.oxide}>Making weight</Eye>
      <Note c={C.chalk} s={{ marginTop: 0 }}>The line is drawn from your weight. Toilet first, then the scales before you eat or drink, with nothing on — type it here, or in tomorrow's morning.</Note>
      <Input label="TODAY (KG)" v={(wt.morning[dayIso] || {}).kg} on={(val) => wt.put(dayIso, { kg: val })} />
    </div>);
  const last = p.timeline[p.timeline.length - 1];
  /* started before the camp: say why */
  const early = wt.campMon && wt.start && wt.start < addDays(wt.campMon, -1);
  return (
    <div style={{ marginTop: 12 }}>
      {early ? <Note c={C.oxide} bold s={{ marginTop: 0, marginBottom: 8 }}>The plan started on {fmtDate(addDays(wt.start, 1))}, before the camp: your average on {fmtDate(wt.start)} was more than the camp could take off inside the speed limit.</Note> : null}
      <LineCard line={p.line} step={p.step} from={last && last.from > dayIso ? last.from : null} />
    </div>);
}

function Settings({ st, setSt, current, L, exportData, importData, rangeWeek, calis, setCalis, replan, morning, dayIso, fuel, setFuel, importFuelText, season, openProfile, fuelPhase, wt }) {
  const [io, setIo] = useState(""); const [showIo, setShowIo] = useState(false); const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState(""); const fileRef = useRef(null);
  const [newer, setNewer] = useState("");
  const upd = (patch) => setSt(Object.assign({}, st, patch));
  const isCamp = MODE.camp;
  return (
    <div>
      <div data-testid="settings">
        <div data-testid="settings-jumps" className="o8-row" style={{ display: "flex", gap: 8, margin: "0 -16px", padding: "2px 16px" }}>
          {SET_JUMPS.map((x) => <button key={x[0]} onClick={() => jumpTo(x[0])}
            style={Object.assign({}, dsp, { flex: "0 0 auto", fontSize: FS.meta, fontWeight: 700, letterSpacing: .2, padding: "10px 16px", borderRadius: 999, cursor: "pointer", minHeight: 48, whiteSpace: "nowrap", background: soft(C.ash), color: C.chalk, border: "none" })}>{x[1]}</button>)}
        </div>
        <SetCard id="season" title="The season">
        <FightSettings st={st} replan={replan} season={season} dayIso={dayIso} />
        {wt ? <WeightSettings wt={wt} dayIso={dayIso} /> : null}
        <Note>{fuelPhase ? <span>The food reads today as <span style={{ color: C.chalk, fontWeight: 600 }}>{FUEL_PHASES[fuelPhase].n}</span> — {FUEL_PHASES[fuelPhase].chg || "the day as printed"}.</span> : "The food runs the day as printed."}</Note>
        </SetCard>

        <SetCard id="day" title="The day's clock">
        <Note c={C.chalk} s={{ marginTop: 0 }}>What Today works from, with the session start you type at the top of it.</Note>
        <div style={{ marginTop: 10 }}>
          <Lab>Break times at work — where the two mid-shift feeds land</Lab>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1].map((i) => { const br = st.breaks || DEFAULT_BREAKS();
              return <div key={i} style={{ flex: 1, minWidth: 0 }}><Fld v={br[i] || ""} ph={DEFAULT_BREAKS()[i]} type="text"
                on={(val) => { const n = (st.breaks || DEFAULT_BREAKS()).slice(); n[i] = val; upd({ breaks: n }); }} /></div>; })}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Lab>Session length in minutes — blank takes the plan's own</Lab>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LEN_DAYS.map((x) => (
              <div key={x[0]} style={{ flex: "1 1 30%", minWidth: 0 }}>
                <div style={Object.assign({}, mno, { fontSize: 13, color: C.ash, letterSpacing: 1, textAlign: "center", marginBottom: 3 })}>{x[1]}</div>
                <Fld v={(st.len || {})[x[0]] == null ? "" : st.len[x[0]]} ph="plan"
                  on={(val) => { const n = Object.assign({}, st.len); if (val === "" || num(val) == null) delete n[x[0]]; else n[x[0]] = num(val); upd({ len: n }); }} />
              </div>))}
          </div>
          <Note>The other half of the bottle lands a session-length after the start, breakfast a quarter of an hour after that, and the session's steps are fitted inside it.</Note>
        </div>
        <div style={{ marginTop: 12 }}>
          <Lab>Boxing evenings — the nights you box after work</Lab>
          <div data-testid="boxing-days" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DAYS.map((d) => { const on = !!(st.boxDays || {})[d];
              return <button key={d} onClick={() => { const n = Object.assign({}, st.boxDays); if (on) delete n[d]; else n[d] = 1; upd({ boxDays: n }); }}
                style={Object.assign({}, mno, { flex: "1 1 21%", fontSize: 15, fontWeight: 700, letterSpacing: 1, padding: "10px 2px", borderRadius: 10, cursor: "pointer", minHeight: 44,
                  background: on ? soft(C.oxide) : "transparent", color: on ? C.chalk : C.ash, border: "1px solid " + (on ? C.oxide : C.line) })}>{DSH[d]}</button>; })}
          </div>
          <Note>On a boxing evening the 5pm load goes in if the day hasn't one, dinner moves to 20:15, after the boxing, and the casein comes off. The BOXING TONIGHT switch on Food changes any one day.</Note>
        </div>
        </SetCard>

        <SetCard id="speed" title="Loading by bar speed">
        <Note c={C.chalk} s={{ marginTop: 0 }}>Five loads and their mean speeds draw a line per lift, and the line gives every phase target.</Note>
        <Btn s={{ width: "100%", marginTop: 12 }} on={openProfile}>OPEN THE PROFILE</Btn>
        </SetCard>

        <SetCard id="look" title="Look">
        <Eye>Text size</Eye>
        <Seg opts={TEXT_STEPS.map((x) => [x[0], x[1]])} val={st.textSize || "n"} on={(v) => upd({ textSize: v })} c={C.cobalt} />
        <Note>The phone's own text-size setting is read as well, and the two multiply.</Note>

        <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
        <Eye>Light or dark</Eye>
        <div data-testid="theme-pick"><Seg opts={THEME_STEPS} val={st.theme === "light" || st.theme === "auto" ? st.theme : "dark"} on={(v) => upd({ theme: v })} /></div>
        <Note>AUTO follows the phone: light when the phone is light, dark when it goes dark.</Note>

        </SetCard>

        <SetCard id="sound" title="Sound">
        <Toggle on={!!st.sound} set={() => upd({ sound: !st.sound })} n="Bell sounds and the feed chime"
          s="Round bells, the clapper at 10 seconds and the 3-2-1 on the timers, and a chime when a feed or a drink is due while the app is open. Off, the full-screen timer still flashes at every change and marks the last 10 seconds." />
        <div style={{ marginTop: 12 }}><Lab>When the phone is on silent</Lab></div>
        <div data-testid="sound-mode"><Seg opts={SOUND_MODES} val={st.soundMode === "loud" ? "loud" : "mix"} on={(v) => upd({ soundMode: v })} c={C.brass} /></div>
        <Note>STAY SILENT: the bells and pips play alongside your music, and go quiet when the phone's ring switch is on silent. PLAY ANYWAY: they sound even on silent, and the phone stops other apps' music while they do.</Note>
        <Btn s={{ width: "100%", marginTop: 12 }} on={() => { rehearse(); }}>TEST THE BELL</Btn>
        <Note c={st.sound ? C.ash : C.oxide}>{st.sound ? "Plays every sound a timer makes, in order: the bell to start, the clapper at 10 seconds, the 3-2-1, the bell to end. Nothing? The phone is on silent, or its volume is down." : "The bells are OFF, so the timers make no sound. Switch Bell sounds on, above."}</Note>

        </SetCard>

        <SetCard id="cycle" title="Rest clock">
        <Toggle last on={!!st.autoRest} set={() => upd({ autoRest: !st.autoRest })} n="Auto rest clock" s="Logging a set starts that exercise's rest countdown by itself." />
        </SetCard>

        {/* THE EDGE rides on Prep and the camp; Strength, Power and Physique has none */}
        {!(current && current.row && current.row.program === "spp") ? (
          <SetCard id="edge" title="The edge">
            <Toggle on={st.edge !== false} set={() => upd({ edge: st.edge === false })}
              n="THE EDGE" s={EDGE_INTRO + " Off, PREP and CAMP run the base program: no Tuesday speed, no Thursday thirty, straight sets for the clusters, the contacts back, the rounds back to the fight's. The sauna is twice a week either way."} />
            {EDGE_ITEMS[current && current.row && (current.row.program === "camp" || current.row.program === "pre") ? "camp" : "prep"].map((x, i) =>
              <Note key={i} c={C.chalk}>{i + 1}. {x}</Note>)}
            <Note c={C.oxide}>{EDGE_GUARDRAIL} It comes back on the Monday.</Note>
            <Note>{TENDON_GATE}</Note>
          </SetCard>) : null}

        <SetCard id="measure" title="Measuring">
        <MeasureSettings st={st} upd={upd} morning={morning || {}} dayIso={dayIso} fuel={fuel} setFuel={setFuel} importFuelText={importFuelText} />
        </SetCard>

        <SetCard id="range" title="Range and Move">
        <Eye>RANGE — the home block</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{RANGE_INTRO}</Note>
        <div style={{ padding: "12px 0", borderBottom: "1px solid " + C.line }}>
          <Lab>RANGE week 1 began</Lab>
          <Fld type="date" v={st.rangeStart || st.start} on={(val) => { if (val) upd({ rangeStart: iso(mondayOf(parseISO(val))) }); }} a="left" />
          <Note>Tonight reads as <span style={{ color: C.violet }}>range week {rangeWeek}</span> — {isKeepWeek(rangeWeek) ? "THE KEEP, ten minutes, every evening for good" : "RANGE, twenty minutes, every evening"}. Twelve weeks of RANGE, then the keep; the four tests on weeks 1, 5, 9 and 13, and every eight weeks after that. This clock keeps counting when the training program restarts at week 1.</Note>
        </div>

        <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
        <Eye c={C.violet}>Optimal 8 · Move</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{MOVE_PROGRAM_INTRO}</Note>
        <div style={{ padding: "12px 0", borderBottom: "1px solid " + C.line }}>
          <Lab>MOVE week 1 began</Lab>
          <Fld type="date" v={st.moveStart || MOVE_SINCE} on={(val) => { if (val) upd({ moveStart: iso(mondayOf(parseISO(val))) }); }} a="left" />
          <Note>It runs in every program: the movement block every gym morning, Session A on Wednesday evening, Session B on Sunday's, RANGE the other five, and the fifteen standards in weeks 1, 5, 9 and 13. Its tendon work starts on Monday 23 November.</Note>
        </div>

        </SetCard>

        <SetCard id="calis" title="Calisthenics">
        <Eye>The lines and the levels</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{CALIS_INTRO}</Note>
        {isCamp ? <Note c={C.brass} bold>CAMP MODE — the five lines run at your current levels in the same slots. Half the sets in week 5, holds only from week 9. The handstand and the planche leans are not on the camp's clock; they stay in your home block as your own call.</Note> : null}
        {LINES.map((ln) => { const lev = curLevel(calis, ln.id); const own = ownedDate(calis, ln.id, lev.i);
          return (
            <div key={ln.id} style={{ padding: "12px 0", borderBottom: "1px solid " + C.line }}>
              <Lab>{ln.n} — {ln.where}</Lab>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {ln.levels.map((x, i) => (
                  <button key={i} onClick={() => setCalis(Object.assign({}, calis, { lvl: Object.assign({}, calis.lvl, { [ln.id]: i }) }))}
                    aria-label={ln.n + " level " + x.l}
                    style={Object.assign({}, dsp, { minWidth: 44, minHeight: 44, flex: "0 0 auto", padding: "0 12px", fontSize: 15, fontWeight: 700, letterSpacing: 1, borderRadius: 10, cursor: "pointer",
                      background: lev.i === i ? soft(ln.c) : "transparent", color: lev.i === i ? C.chalk : C.ash, border: "1px solid " + (lev.i === i ? ln.c : C.line) })}>{x.l}</button>))}
              </div>
              <div style={{ background: C.ink, border: "1px solid " + C.line, borderRadius: 10, padding: "10px 11px", marginTop: 9 }}>
                <div style={Object.assign({}, mno, { fontSize: 12, color: ln.c, letterSpacing: 1, marginBottom: 5 })}>LEVEL {lev.l} · WHAT YOU DO</div>
                <div style={Object.assign({}, bdy, { fontSize: 13, color: C.chalk, lineHeight: 1.45 })}>{levelText(ln.id, lev, current.week)}</div>
                <div style={Object.assign({}, mno, { fontSize: 12, color: C.ash, letterSpacing: 1, margin: "9px 0 5px" })}>OWN IT WHEN</div>
                <div style={Object.assign({}, bdy, { fontSize: 13, color: C.brass, lineHeight: 1.45 })}>{ln.slow ? ln.own : lev.own}</div>
                {own ? <div style={Object.assign({}, mno, { fontSize: 12, color: C.moss, marginTop: 8, letterSpacing: 1 })}>OWNED {fmtDate(own)}</div> : null}
              </div>
            </div>); })}
        <div style={{ background: C.ink, border: "1px solid " + C.line, borderRadius: 10, padding: "10px 11px", marginTop: 12 }}>
          <div style={Object.assign({}, mno, { fontSize: 12, color: C.brass, letterSpacing: 1, marginBottom: 6 })}>THE RULES THAT SIT OVER ALL OF IT</div>
          {CALIS_RULES.map((r, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12, color: C.chalk, lineHeight: 1.45, padding: "4px 0" })}>{r}</div>)}
          <div style={Object.assign({}, mno, { fontSize: 12, color: C.violet, letterSpacing: 1, margin: "10px 0 6px" })}>THE SLOW LANE'S THREE LAWS</div>
          {SLOW_LAWS.map((r, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12, color: C.chalk, lineHeight: 1.45, padding: "4px 0" })}>{r}</div>)}
          <Note>{SLOW_WHY}</Note>
          <Note s={{ fontStyle: "italic" }}>{FRONT_LEVER_LINE}</Note>
          <Note s={{ fontStyle: "italic" }}>{BACK_LEVER_LINE}</Note>
          <Note s={{ fontStyle: "italic" }}>{PLANCHE_LINE}</Note>
        </div>

        <Toggle on={!!st.taper} set={() => upd({ taper: !st.taper })}
          n="Taper week" s="Every calisthenics line goes to holds only — handstand and ring support, nothing to failure, nothing new. On for a taper week, off after it." />

        </SetCard>

        <SetCard id="backup" title="Backup">
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={async () => { setMsg(""); setIo(await exportData()); setShowIo(true); }}>EXPORT</Btn>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={() => { setMsg(""); setShowIo(true); }}>IMPORT</Btn>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={async () => { setMsg("");
            const r = await shareOrDownload(await exportData());
            const said = r === "shared" ? "Backup sent." : r === "downloaded" ? "Backup file saved." : r === "cancelled" ? "Cancelled." : "Couldn't make the file — use EXPORT and paste the text somewhere safe.";
            setMsg(said); if (r === "shared" || r === "downloaded") toast(said); else if (r !== "cancelled") toast(said, "bad"); }}>EXPORT TO FILE</Btn>
          <Btn small c={C.cobalt} s={{ flex: 1 }} on={() => { setMsg(""); if (fileRef.current) fileRef.current.click(); }}>IMPORT FROM FILE</Btn>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }} aria-hidden="true" tabIndex={-1}
          onChange={async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
            try { const txt = await readTextFile(f); JSON.parse(txt); importData(txt); } catch (err) { setMsg("That file isn't a Fighter backup."); } }} />
        <Note>EXPORT TO FILE saves a .json backup you can keep in Files or send to yourself. IMPORT FROM FILE loads one back in. The morning numbers, the erg outputs, the bar speeds and the photos all travel in it — the photos as base64, which is what makes a backup with photos in it a big file.</Note>
        {msg ? <Note c={C.chalk}>{msg}</Note> : null}
        {showIo ? <div style={{ marginTop: 8 }}>
          <textarea value={io} onChange={(e) => setIo(e.target.value)} placeholder="Paste a backup here, then tap load"
            style={Object.assign({}, mno, { width: "100%", minHeight: 120, background: C.ink, border: "1px solid " + C.line, borderRadius: 14, color: C.chalk, fontSize: 18, lineHeight: 1.3, padding: 12 })} />
          <Btn c={C.cobalt} fill s={{ width: "100%", marginTop: 8 }} on={() => importData(io)}>LOAD THIS BACKUP</Btn>
        </div> : null}
        </SetCard>

        <SetCard id="app" title="This copy of the app">
        <div data-testid="app-version" style={Object.assign({}, mno, { fontSize: FS.body, fontWeight: 700, color: C.chalk, lineHeight: 1.4 })}>{buildSay(BUILD)}</div>
        <Note>The app keeps a copy of itself on the phone, so it opens with no signal. It looks for a newer one every time it comes onto the screen, and refreshes itself once it has it — never while a clock is running.</Note>
        <Btn small s={{ width: "100%", marginTop: 12 }} on={async () => { setNewer("Looking…"); setNewer(CHECK_SAID[await checkNow()]); }}>CHECK FOR AN UPDATE NOW</Btn>
        {newer ? <Note c={C.chalk} s={{ fontSize: FS.meta }}><span data-testid="update-said">{newer}</span></Note> : null}
        </SetCard>

        <SetCard id="reset" title="Reset">
        <Note c={C.chalk} s={{ marginTop: 0, marginBottom: 12 }}>{confirm ? "This wipes every tick, weight, number and photo on this phone, and it can't be undone." : "Wipes everything on this phone and starts the app from new. Export a backup first."}</Note>
        {!confirm ? <Btn c={C.oxide} s={{ width: "100%" }} on={() => setConfirm(true)}>RESET ALL DATA…</Btn>
          : <div data-testid="reset-confirm" style={{ display: "flex", gap: 8 }}>
            <Btn c={C.ash} s={{ flex: 1 }} on={() => setConfirm(false)}>KEEP MY DATA</Btn>
            <Btn c={C.oxide} fill s={{ flex: 1 }} on={() => importData("{}")}>WIPE EVERYTHING</Btn>
          </div>}
        </SetCard>
      </div>
    </div>);
}

/* ================================================================
   APP SHELL
   ================================================================ */
const KEYS = { st: "o8s-settings", done: "o8s-done", log: "o8s-log", maxes: "o8s-maxes", maxHist: "o8s-maxhist", body: "o8s-body", ready: "o8s-ready", spar: "o8s-spar", swap: "o8s-swap", box: "o8s-box", notes: "o8s-notes", forge: "o8s-forge", fweek: "o8s-fweek", hw: "o8s-hw", calis: "o8s-calis", morning: "o8s-morning", photos: "o8s-photos", fuel: "o8s-fuel", flow: "o8s-flow",
  /* the fuel app, merged in */
  fday: "o8s-fday", menu: "o8s-menu", cook: "o8s-cook", foods: "o8s-foods", shop: "o8s-shop", tape: "o8s-tape",
  /* the day's budget (brief 34): { from, days: { iso: [entries] }, foods: [from packets], surplus: [{ at, on }] } */
  eat: "o8s-eat" };
/* the old menu's meals, offered one tap each on FOOD · TODAY */
/* a meal's slot in the old plan: which ones are breakfasts and dinners */
const mealSlot = (k) => { const b = MEAL_BASE[k] || k; const s = Object.keys(MEAL_SLOTS).find((x) => (MEAL_SLOTS[x].opts || []).indexOf(b) >= 0); return s || mealSlot0(b); };
const MEAL_KEYS = ["half", "halfban", "porridge", "porridgeb", "appleraisin", "eggbagelbf", "tunabagelbf", "batch", "batchbig", "jacketbt", "jacketbe", "prawnrice", "wraps", "tunabagel",
  "chickpouch", "rctuna", "twoban", "onebagel", "appleraisins", "rchoney", "topup", "bageltop", "pastatop", "rcload", "potatotop", "steak", "steakbig", "chicken"];
/* the tab bar */
const TAB_H = 66;
/* MORE's list: the page, its name, what's on it, its icon */
const MORE_ROWS = [["week", "This week", "The week's sessions, day by day", "calendar"], ["season", "The season", "Every week of the plan, with its date", "flag"],
  ["docs", "The programmes", "Every document in full", "book"], ["guide", "Guide", "How the programme and the app work", "help"], ["settings", "Settings", "Fight, look, sound, rest clock, backup", "gear"]];
/* which of TODAY's two screens the day was left on: kept beside the data, never in a backup */
const VIEW_KEY = "o8s-view";
const DEF_ST = () => ({ start: defaultStart(), macroBase: 1, iron: false, sound: true, autoRest: true,
  medStage: 1, breathStage: 1, hardLevel: 1, sitLen: 30, imStart: null, rangeStart: null,
  camp: false, campStart: CAMP_START_DEFAULT, lastTen: false, taper: false, edge: true,
  levelStart: null, v12: true, v16: true,
  /* the measurement layer */
  ergUnit: "w", base: null,
  /* the season */
  program: "fighter", fightDate: null, profiles: null, textSize: "n", theme: "dark", soundMode: "mix",
  /* the season builder: the answers, and every plan they have made */
  season: null, plans: null, planNote: "", planNoteAt: null, fadeDone: {},
  /* the day's clock, from the fuel app */
  breaks: DEFAULT_BREAKS(), len: {},
  /* MAKING WEIGHT: the day the line was set, then every redraw */
  wdraws: [] });

/* Settings saved before the season builder: the program switch and the
   fight date become the first plan, from the Monday the old clock ran
   from, so every week already logged keeps its place. A fresh install
   starts Prep's cycle. Optimal 8 Fighter, the classic, was retired on 23
   November 2026: settings saved on it start Prep's cycle from the Monday
   its clock ran from, and so do settings saved with no plans at all. */
function migratePlans(st, fresh) {
  const d = FIGHT_DEFAULTS;
  if (fresh) { const from = defaultStart(); const season = { booked: false, classic: false };
    return { season, plans: [{ from, made: from, inputs: season }] }; }
  const camp = st.program === "camp" || (!!st.camp && st.program !== "prep" && st.program !== "transition");
  const prep = st.program === "prep" || st.program === "transition";
  if (!camp && !prep) { const from = mondayIso(st.start || defaultStart()); const season = { booked: false, classic: false };
    return { season, plans: [{ from, made: from, inputs: season }] }; }
  if (camp) {
    const from = mondayIso(st.fightDate ? addDays(mondayIso(st.fightDate), -63) : (st.campStart || CAMP_START_DEFAULT));
    const fight = st.fightDate || addDays(from, 63 + 5);
    const season = Object.assign({ booked: true, fight, classic: false }, d);
    return { season, plans: [{ from, made: from, inputs: season }], fightDate: fight };
  }
  const from = mondayIso(st.start || defaultStart());
  const season = st.fightDate ? Object.assign({ booked: true, fight: st.fightDate, classic: false }, d) : { booked: false, classic: false };
  return { season, plans: [{ from, made: from, inputs: season }] };
}
const FIELD_NAMES = { booked: "fight booked", fight: "date", rounds: "rounds", mins: "minutes", rest: "rest", weighIn: "weigh-in", fitness: "fitness", emphasis: "emphasis", classic: "program", program: "program",
  limit: "weight limit", tol: "tolerance", natural: "natural weight" };
const WEIGH_NAME = { am: "day before, morning", before: "day before, afternoon or evening", day: "on the day" };
const blankKg = (x) => (x == null || String(x).trim() === "" ? "—" : String(x).replace(",", ".") + " kg");
/* what runs with no fight booked */
const PROG_SAY = { prep: "Prep", spp: "Strength, Power and Physique", classic: "Optimal 8 Fighter" };
const progOf = (x) => (x.classic ? "classic" : x.spp ? "spp" : "prep");
const showVal = (k, x) => (k === "booked" ? (x ? "yes" : "no") : k === "classic" ? (x ? "Optimal 8 Fighter" : "Prep") : k === "program" ? PROG_SAY[x] || String(x) : k === "fight" ? (x ? fmtDate(x) : "—") : k === "rest" ? x + " s"
  : k === "weighIn" ? WEIGH_NAME[x] || WEIGH_NAME.before : WEIGHT_FIELDS.indexOf(k) >= 0 ? blankKg(x) : String(x));
/* The weight plan never changes the training: a change to the limit, the
   tolerance, the natural weight, or the weigh-in's time of day re-draws
   the line and leaves the plans alone. */
const kgStr = (x) => (x == null || String(x).trim() === "" ? "" : String(Number(String(x).replace(",", "."))));
function trainingChanged(was, now) {
  const a = Object.assign({ booked: false, classic: false, spp: false }, FIGHT_DEFAULTS, was || {}), b = Object.assign({ booked: false, classic: false, spp: false }, FIGHT_DEFAULTS, now || {});
  const keys = ["booked", "fight", "rounds", "mins", "rest", "fitness", "emphasis", "classic", "spp"];
  return keys.some((k) => String(a[k]) !== String(b[k])) || ((a.weighIn === "day") !== (b.weighIn === "day")) || !!a.restart !== !!b.restart || !!a.repeat !== !!b.repeat;
}
/* BOXING TONIGHT: the day's own switch on FOOD, or else the weekday ticked
   in Settings */
const boxingTonight = (fd, st, day) => (fd && fd.box != null ? !!fd.box : !!((st && st.boxDays) || {})[day]);
/* the first Monday of the camp for this fight, off the built season */
const campMonOf = (season, fight) => { const r = season && (season.rows || []).find((x) => x.program === "camp" && x.camp && x.camp.fight === fight);
  return r ? r.campStart : null; };
/* the line's draws after a change: off without a limit; a new fight once
   the last one is behind you starts afresh; any change redraws */
function nextDraws(prev, cfg, today) {
  if (!cfg) return [];
  const ds = prev || [], last = ds[ds.length - 1];
  if (!last || (last.cfg.fight < today && last.cfg.fight !== cfg.fight)) return [{ at: today, cfg }];
  return sameCfg(last.cfg, cfg) ? ds : ds.concat([{ at: today, cfg }]);
}
/* "fitness low → moderate · emphasis none → power". `running`: the program
   running into the plan's Monday, for what START AGAIN or START NOW does */
function changeLine(was, now, running, weekDoc) {
  const a = Object.assign({ booked: false, classic: false, spp: false }, FIGHT_DEFAULTS, was || {}), b = Object.assign({ booked: false, classic: false, spp: false }, FIGHT_DEFAULTS, now || {});
  a.program = progOf(a); b.program = progOf(b);
  const keys = b.booked ? ["booked", "fight", "rounds", "mins", "rest", "weighIn", "fitness", "emphasis", "limit", "tol", "natural"] : b.program === "prep" ? ["booked", "program", "fitness"] : ["booked", "program"];
  const same = (k) => (WEIGHT_FIELDS.indexOf(k) >= 0 ? kgStr(a[k]) === kgStr(b[k]) : String(a[k]) === String(b[k]));
  const line = keys.filter((k) => !same(k)).map((k) => FIELD_NAMES[k] + " " + showVal(k, a[k]) + " → " + showVal(k, b[k])).join(" · ");
  if (b.repeat && !b.restart && !b.booked && b.program === "spp" && running === "spp") return (line ? line + " · " : "") + "Strength, Power and Physique repeats week " + weekDoc;
  if (!b.restart) return line;
  const again = !b.booked && b.program === "spp" ? (running === "spp" ? "Strength, Power and Physique starts again at week 1" : "Strength, Power and Physique starts now")
    : !b.booked && running === "spp" ? "Prep starts now" : "Prep starts again at week 1";
  return (line ? line + " · " : "") + again;
}

export default function App() {
  const [st, setStRaw] = useState(DEF_ST());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  /* TODAY shows HOME, or the session screen over it (focus) */
  const [inFocus, setFocusRaw] = useState(false);
  const [selDay, setSelDay] = useState(null);
  const [weekPick, setWeekPick] = useState(false);
  const [view, setViewRaw] = useState(null);
  const [proto, setProto] = useState(null);
  const [plates, setPlates] = useState(null);
  const [trackSub, setTrackSub] = useState(null);
  const [photoDate, setPhotoDate] = useState(null);
  const [done, setDoneRaw] = useState({});
  const [log, setLogRaw] = useState({});
  const [maxes, setMaxesRaw] = useState({});
  const [maxHist, setMaxHistRaw] = useState([]);
  const [body, setBodyRaw] = useState([]);
  const [readyMap, setReadyRaw] = useState({});
  const [sparMap, setSparRaw] = useState({});
  const [swapMap, setSwapRaw] = useState({});
  const [boxMap, setBoxRaw] = useState({});
  const [notes, setNotesRaw] = useState({});
  const [forge, setForgeRaw] = useState([]);
  const [fweek, setFweekRaw] = useState(1);
  const [hwLog, setHwRaw] = useState([]);
  const [calis, setCalisRaw] = useState(DEF_CALIS());
  const [morning, setMorningRaw] = useState({});
  const [photos, setPhotosRaw] = useState({});
  const [fuel, setFuelRaw] = useState(null);
  const [flowAt, setFlowAtRaw] = useState({});
  const [fdays, setFdaysRaw] = useState({});
  const [menuAll, setMenuAllRaw] = useState({});
  const [cook, setCookRaw] = useState(null);
  const [foods, setFoodsRaw] = useState([]);
  const [shop, setShopRaw] = useState({});
  const [tape, setTapeRaw] = useState([]);
  const [eat, setEatRaw] = useState({});
  const [imDay, setImDayRaw] = useState({});
  const [imSit, setImSitRaw] = useState([]);
  const [imHard, setImHardRaw] = useState([]);
  const [imWk, setImWkRaw] = useState({});
  const [tool, setTool] = useState(null);
  const [weekSub, setWeekSub] = useState("docs");
  const [foodSub, setFoodSub] = useState(null);
  /* MORE opens on its list; each row is a page of its own */
  const [moreSub, setMoreSub] = useState("menu");
  const [devScale, setDevScale] = useState(1);
  const probeRef = useRef(null);
  const T = useTimer(st.sound);

  /* The phone's own text size, measured once off a probe styled with the
     system body font, multiplied by the app's own three steps. */
  useEffect(() => {
    try {
      const el = probeRef.current; if (!el) return;
      const px = parseFloat(window.getComputedStyle(el).fontSize);
      if (px > 0) setDevScale(Math.max(0.9, Math.min(1.6, px / 17)));
    } catch (e) {}
  }, []);

  const mk = (setter, key) => (val) => { setter(val); save(key, val); };
  const setSt = mk(setStRaw, KEYS.st), setDone = mk(setDoneRaw, KEYS.done), setLog = mk(setLogRaw, KEYS.log);
  const setMaxes = mk(setMaxesRaw, KEYS.maxes), setMaxHist = mk(setMaxHistRaw, KEYS.maxHist), setBody = mk(setBodyRaw, KEYS.body);
  const setReadyMap = mk(setReadyRaw, KEYS.ready), setSparMap = mk(setSparRaw, KEYS.spar), setSwapMap = mk(setSwapRaw, KEYS.swap);
  const setBoxMap = mk(setBoxRaw, KEYS.box), setNotes = mk(setNotesRaw, KEYS.notes);
  const setForge = mk(setForgeRaw, KEYS.forge), setFweek = mk(setFweekRaw, KEYS.fweek), setHwLog = mk(setHwRaw, KEYS.hw);
  const setCalis = mk(setCalisRaw, KEYS.calis);
  const setMorning = mk(setMorningRaw, KEYS.morning), setPhotos = mk(setPhotosRaw, KEYS.photos), setFuel = mk(setFuelRaw, KEYS.fuel);
  const setFlowAt = mk(setFlowAtRaw, KEYS.flow);
  const setFdays = mk(setFdaysRaw, KEYS.fday), setMenuAll = mk(setMenuAllRaw, KEYS.menu), setCook = mk(setCookRaw, KEYS.cook);
  const setFoods = mk(setFoodsRaw, KEYS.foods), setShop = mk(setShopRaw, KEYS.shop), setTape = mk(setTapeRaw, KEYS.tape), setEat = mk(setEatRaw, KEYS.eat);
  const kbeep = useBeep(st.sound);
  const K = useKTimer(kbeep);
  /* a newer copy of the app waits while a clock is running: a reload would lose it */
  const busyRef = useRef(false);
  busyRef.current = !!((T.t && !T.t.done) || (K.t && !K.t.done));
  useEffect(() => { whileBusy(() => busyRef.current); return () => whileBusy(null); }, []);
  const setImDay = mk(setImDayRaw, IM_KEYS.day), setImSit = mk(setImSitRaw, IM_KEYS.sit);
  const setImHard = mk(setImHardRaw, IM_KEYS.hard), setImWk = mk(setImWkRaw, IM_KEYS.wk);

  useEffect(() => { (async () => {
    const s0 = await load(KEYS.st, null);
    let migrated = await load("o8s-migrated", false);
    let mig = {};
    if (!migrated) {
      const m8 = await load("o8-maxes", null); if (m8) mig.maxes = m8;
      const s8 = await load("o8-settings", null); if (s8) mig.settings = s8;
      const m7 = await load("o7-maxes", null); if (m7 && !mig.maxes) mig.maxes = m7;
      const s7 = await load("o7-settings", null); if (s7 && !mig.settings) mig.settings = s7;
      const m6 = await load("o6-maxes", null); if (m6 && !mig.maxes) mig.maxes = m6;
      const s6 = await load("o6-settings", null); if (s6 && !mig.settings) mig.settings = s6;
      const b6 = await load("o6-body", null); if (b6 && b6.length) mig.body = b6;
      const f6 = await load("o6-forge", null); if (f6 && f6.length) mig.forge = f6;
      const h6 = await load("o6-hw", null); if (h6 && h6.length) mig.hw = h6;
      const m5 = await load("o5-maxes", null);
      if (m5 && !mig.maxes) mig.maxes = { squat: m5.squat, bench: m5.bench, tbdl: m5.tbdl, pp: m5.pp };
      const b5 = await load("o5-body", null); if (b5 && b5.length && !mig.body) mig.body = b5;
      const f5 = await load("o5-forge", null); if (f5 && f5.length && !mig.forge) mig.forge = f5;
      const fw5 = await load("o5-forgeweek", null); if (fw5) mig.fweek = fw5;
      const h5 = await load("o5-hw", null); if (h5 && h5.length && !mig.hw) mig.hw = h5;
      const l5 = await load("o5-log", null);
      if (l5) { const t = {}; let mm = 0; Object.keys(l5).forEach((k) => { const m = k.match(/^m(\d+)w16-test-/); if (m && l5[k] && l5[k].w) { t[k] = { w: l5[k].w }; mm = Math.max(mm, Number(m[1])); } });
        if (Object.keys(t).length) { mig.testLog = t; mig.macroBase = mm + 1; } }
      await save("o8s-migrated", true);
    }
    let st1 = s0 || Object.assign(DEF_ST(), mig.settings || {}, mig.macroBase ? { macroBase: mig.macroBase } : {});
    let done0 = await load(KEYS.done, {});
    if (!st1.v12) { done0 = migrateDone(done0); st1 = Object.assign({}, st1, { v12: true }); save(KEYS.done, done0); }
    if (!st1.v16) { done0 = boxJumpsDone(done0); st1 = Object.assign({}, st1, { v16: true }); save(KEYS.done, done0); }
    if (!st1.plans || !st1.plans.length) st1 = Object.assign({}, st1, migratePlans(st1, !s0 && !mig.settings));
    /* a phone with nothing saved gets the welcome, once */
    if (!s0 && !mig.settings) st1 = Object.assign({}, st1, { welcome: true });
    setStRaw(st1); save(KEYS.st, st1);
    const mx = await load(KEYS.maxes, null); setMaxesRaw(mx || mig.maxes || {}); if (!mx && mig.maxes) save(KEYS.maxes, mig.maxes);
    const bd = await load(KEYS.body, null); setBodyRaw(bd || mig.body || []); if (!bd && mig.body) save(KEYS.body, mig.body);
    const fg = await load(KEYS.forge, null); setForgeRaw(fg || mig.forge || []); if (!fg && mig.forge) save(KEYS.forge, mig.forge);
    const fw = await load(KEYS.fweek, null); setFweekRaw(fw || mig.fweek || 1);
    const hw = await load(KEYS.hw, null); setHwRaw(hw || mig.hw || []); if (!hw && mig.hw) save(KEYS.hw, mig.hw);
    const lg = await load(KEYS.log, null); const lg1 = lg || mig.testLog || {}; setLogRaw(lg1); if (!lg && mig.testLog) save(KEYS.log, lg1);
    setDoneRaw(done0); setMaxHistRaw(await load(KEYS.maxHist, []));
    setReadyRaw(await load(KEYS.ready, {})); setSparRaw(await load(KEYS.spar, {})); setSwapRaw(await load(KEYS.swap, {}));
    setBoxRaw(await load(KEYS.box, {})); setNotesRaw(await load(KEYS.notes, {}));
    setCalisRaw(Object.assign(DEF_CALIS(), await load(KEYS.calis, null) || {}));
    setMorningRaw(await load(KEYS.morning, {})); setPhotosRaw(await load(KEYS.photos, {})); setFuelRaw(await load(KEYS.fuel, null));
    setFlowAtRaw(await load(KEYS.flow, {}));
    /* left on the session screen today: it opens there again */
    const seen = await load(VIEW_KEY, null); if (seen && seen.focus && seen.d === iso(new Date())) setFocusRaw(true);
    setFdaysRaw(await load(KEYS.fday, {})); setMenuAllRaw(await load(KEYS.menu, {})); setCookRaw(await load(KEYS.cook, null));
    setFoodsRaw(await load(KEYS.foods, [])); setShopRaw(await load(KEYS.shop, {})); setTapeRaw(await load(KEYS.tape, [])); setEatRaw(await load(KEYS.eat, {}));
    setImDayRaw(await load(IM_KEYS.day, {})); setImSitRaw(await load(IM_KEYS.sit, []));
    setImHardRaw(await load(IM_KEYS.hard, [])); setImWkRaw(await load(IM_KEYS.wk, {}));
    setLoaded(true);
  })(); }, []);

  /* ---------------- THE SEASON ----------------
     The plans in settings, laid end to end by the season builder. The
     week on screen decides which program MODE points at, before anything
     reads a prescription. */
  const dayIso = iso(new Date());
  const plans = st.plans || [];
  /* the head check's answers hold or start each transition */
  const heads = st.head || {};
  const season = useMemo(() => buildSeason({ plans, today: dayIso, strapBack: (d) => strapBackBy(morning, st, d), head: (f) => heads[f] || null }),
    [JSON.stringify(plans), dayIso, morning, st.base, JSON.stringify(heads)]);
  SEASON.s = season;
  /* THE EDGE: the switch, and the mornings the check has recorded */
  EDGE.manual = st.edge !== false;
  EDGE.ready = readyMap;
  GATE.log = log; GATE.profiles = st.profiles || null;
  MOVE.start = st.moveStart || MOVE_SINCE;

  const curRow = rowOn(season, dayIso) || (season.rows.length && season.rows[0].mon > dayIso ? season.rows[0] : season.rows[season.rows.length - 1]) || null;
  const current = useMemo(() => {
    if (curRow) return { macro: curRow.mac, week: curRow.kw, pre: curRow.mon > dayIso, row: curRow };
    return { macro: "P", week: 1, pre: true }; },
    [curRow, dayIso]);
  const today = todayKey();
  const shown = selDay || { macro: current.macro, week: current.week, day: today };
  const isToday = shown.macro === current.macro && shown.week === current.week && shown.day === today;
  const vw = view || { macro: current.macro, week: current.week };
  const setView = (x) => setViewRaw(x);
  /* the week on screen points MODE at its program */
  const focus = tab === "more" && moreSub === "plan" && weekSub === "week" ? vw : shown;
  setModeFor(focus.macro);
  const program = MODE.program;
  const shownRow = MODE.mac ? seasonRow(shown.macro, shown.week) : null;
  const L = MODE.mac ? Math.max(1, segmentOf(seasonRow(focus.macro, focus.week)).length) : 16;
  /* the date a season day falls on, for the header, the pages and the tables */
  const campLabel = shownRow ? (day) => fmtDate(addDays(shownRow.mon, DAYS.indexOf(day))) : null;

  /* The Monday a week falls on, whichever program is running. */
  const monOf = useCallback((mac, wk) => {
    if (MAC_PROGRAM[mac]) {
      const r = rowByKey(season, mac, wk);
      return r ? r.mon : mondayIso(dayIso);
    }
    /* a week logged on Optimal 8 Fighter, before it was retired: dated off its old clock */
    return iso(addWeeks(mondayOf(parseISO(st.start)), ((mac - st.macroBase) * (st.iron ? 18 : 16)) + (wk - 1)));
  }, [season, st.start, st.macroBase, st.iron, dayIso]);

  const bw = num(body[0] && body[0].bw) || 80;
  /* `also`: the other lifts the same number sets — test week's top
     triples are the camp's working weights too */
  const onSetMax = (lift, kg, src, also) => { const ks = [lift].concat(also || []); const nx = Object.assign({}, maxes); ks.forEach((k) => { nx[k] = kg; }); setMaxes(nx);
    setMaxHist(ks.map((k) => ({ d: new Date().toISOString().slice(0, 10), lift: k, kg, src, macro: current.macro, week: current.week })).concat(maxHist)); buzz([50, 30, 50]);
    toast("Working max saved · " + kg + " kg"); };
  const addBody = (t) => { setBody([Object.assign({ d: new Date().toISOString().slice(0, 10), m: current.macro }, t)].concat(body)); toast("Measurements saved"); };

  const dk = dayKey(shown.macro, shown.week, shown.day);
  const pdk = prevDayKey(shown.macro, shown.week, shown.day, L);
  const weekStats = useMemo(() => { let g = 0, y = 0, r = 0, slow = 0, spr = 0, dn = 0, planned = 0; const rx = rxFor(shown.week);
    DAYS.forEach((d) => { const k = dayKey(shown.macro, shown.week, d); const rv = readyMap[k]; if (rv === "G") g++; if (rv === "Y") y++; if (rv === "R") r++;
      if (boxMap[k] === "slow") slow++; if (sparMap[k]) spr++;
      const tot = !MODE.camp && d === "sat" && rx.test ? 1 : countedBlocks(d, rx).length; if (tot) { planned++; if ((done[k] || []).length >= tot) dn++; } });
    return { g, y, r, slow, spar: spr, done: dn, planned }; }, [readyMap, boxMap, sparMap, done, shown.macro, shown.week, program, season, st.edge, st.lastTen]);
  const weekDoneMap = useMemo(() => { const out = {};
    const wks = MODE.mac ? segmentOf(seasonRow(vw.macro, vw.week)).map((r) => r.kw) : Array.from({ length: L }, (_, i) => i + 1);
    for (const w of wks) { const rx = rxFor(w); let dn = 0, tot = 0;
    DAYS.forEach((d) => { const t = !MODE.camp && d === "sat" && rx.test ? 1 : countedBlocks(d, rx).length; if (t) { tot++; if ((done[dayKey(vw.macro, w, d)] || []).length >= t) dn++; } });
    out[w] = tot ? dn / tot : null; } return out; }, [done, vw.macro, vw.week, L, program, season, st.edge, st.lastTen]);

  /* ---------------- THE DAY'S TICKS AND RANGE'S CLOCK ----------------
     Iron Mind was taken out on 20 November 2026; its day record still holds
     every tick on TODAY. */
  /* RANGE runs on its own twelve-week clock, so it keeps counting when the
     training program restarts at week 1 and THE KEEP really is for good. */
  const rangeStart = st.rangeStart || st.start;
  const rangeWeekOf = useCallback((macro, week) => {
    const mon = parseISO(monOf(macro, week));
    return Math.max(1, weeksApart(parseISO(rangeStart), mon) + 1);
  }, [monOf, rangeStart]);
  const rangeWeek = rangeWeekOf(current.macro, current.week);
  const shownRangeWeek = rangeWeekOf(shown.macro, shown.week);
  /* the test weeks so far, oldest first — what TRACK charts */
  const rangeTestWeeks = useMemo(() => { const out = [];
    season.rows.filter((r) => r.mon <= dayIso).forEach((r) => { const rw = rangeWeekOf(r.mac, r.kw); if (!isTestWeek(rw)) return;
      out.push({ key: "m" + r.mac + "w" + r.kw, label: "rw" + rw, rangeWeek: rw }); });
    return out.slice(-8); }, [rangeWeekOf, season, dayIso]);
  /* OPTIMAL 8 · MOVE's test weeks, for TRACK */
  const moveTestWeeks = useMemo(() => season.rows.filter((r) => r.mon <= dayIso).map((r) => ({ r, mw: moveWeekOf(r.mon, st.moveStart || MOVE_SINCE) }))
    .filter((x) => isMoveTestWeek(x.mw)).map((x) => ({ key: "m" + x.r.mac + "w" + x.r.kw, label: "Week " + x.mw })).slice(-8), [season, dayIso, st.moveStart]);
  const taperNow = !!st.taper;

  /* The four range tests live on the existing log key, one entry per field,
     so export/import and the "o8s-…" keys are untouched. */
  const rangeKey = (macro, week) => "m" + macro + "w" + week;
  const rangeGet = (key, id) => { const e = log[key + "-range-" + id]; return e ? e.w : ""; };
  const rangePut = (key, id, val) => { const n = Object.assign({}, log); n[key + "-range-" + id] = { w: val }; setLog(n); };

  /* The flow ticks the day it is showing, not the day it happens to be, so a
     day filled in after the fact lands on its own date. */
  const tickOn = (isoDay) => (k, val) => { const cur = imDay[isoDay] || {}; const ticks = Object.assign({}, cur.ticks);
    if (!!ticks[k] === !!val) return; ticks[k] = !!val;
    setImDay(Object.assign({}, imDay, { [isoDay]: Object.assign({}, cur, { ticks }) })); buzz(20); };
  /* ---------------- THE MEASUREMENT LAYER ----------------
     The peak heart rate — the highest 20-minute test on file, or the
     number typed into the easy-zone panel — paces the easy zone;
     the week's seven dates fill the weekly check's sleep averages from
     the mornings; the morning flag rides on the daily check. */
  const peakHR = useMemo(() => peakHeartRate(log, st.easyPeak), [log, st.easyPeak]);
  const weekDates = useMemo(() => {
    const mon = monOf(shown.macro, shown.week);
    return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
  }, [monOf, shown.macro, shown.week]);
  /* The morning numbers belong to the day you are looking at, not to the
     day it happens to be: tapping MON on the day strip shows Monday's
     morning, so a morning missed on the day can be filled in after it.
     Only a day that hasn't happened yet has nothing to show. */
  const shownIso = weekDates[DAYS.indexOf(shown.day)] || dayIso;
  const shownFuture = shownIso > dayIso;
  const mFlag = useMemo(() => morningFlag(morning[shownIso], morning, st, shownIso), [morning, st, shownIso]);
  /* Strength, Power and Physique's photos: the Sunday of weeks 4, 8 and 12 */
  const photoDay = curRow && curRow.program === "spp" ? sppPhotoDay(curRow.doc, today) : isPhotoDay(MODE.camp, current.week, today);
  const shownPhotoDay = shownRow && shownRow.program === "spp" ? sppPhotoDay(shownRow.doc, shown.day) : isPhotoDay(MODE.camp, shown.week, shown.day);
  const photosShown = photos[shownIso] || {};
  const dateOf = useCallback((mac, wk, dy) => {
    const di = Math.max(0, DAYS.indexOf(dy || "sun"));
    return fmtDate(addDays(monOf(mac, wk), di));
  }, [monOf]);
  /* The fuel app's backup: its fu8- keys come across — the chosen options,
     the cooked-batch weights and saved ratios, the shopping list, the
     referee's weigh-ins, and the break times and session lengths. An older
     export with only bodyweight and waist in it still reads as before. */
  const applyFuelBackup = (txt) => {
    let obj; try { obj = JSON.parse(String(txt).trim()); } catch (e) { return "That isn't a fuel app backup."; }
    const data = obj && typeof obj === "object" && obj.data && typeof obj.data === "object" ? obj.data : obj;
    const got = [];
    if (data && typeof data === "object" && Object.keys(data).some((k) => /^fu8-/.test(k))) {
      const m = data["fu8-menu"];
      if (m && typeof m === "object") { setMenuAll(Object.assign({}, menuAll, m, { picks: Object.assign({}, menuAll.picks, m.picks), used: Object.assign({}, menuAll.used, m.used) }));
        got.push(Object.keys(m.picks || {}).length + " chosen options"); }
      if (data["fu8-cook"]) { setCook(Object.assign({}, cook, data["fu8-cook"])); got.push("the cooked-batch weights"); }
      if (Array.isArray(data["fu8-foods"]) && data["fu8-foods"].length) { const names = {}; const merged = data["fu8-foods"].concat(foods).filter((x) => x && !names[x.n] && (names[x.n] = 1)); setFoods(merged); got.push(data["fu8-foods"].length + " saved ratios"); }
      if (data["fu8-shop"] && typeof data["fu8-shop"] === "object") { setShop(data["fu8-shop"]); got.push("the shopping list"); }
      if (Array.isArray(data["fu8-tape"]) && data["fu8-tape"].length) {
        const by = {}; tape.forEach((r) => { by[r.d] = r; }); data["fu8-tape"].forEach((r) => { if (r && r.d) by[r.d] = Object.assign({}, by[r.d], r); });
        setTape(Object.keys(by).sort().map((k) => by[k])); got.push(data["fu8-tape"].length + " referee readings"); }
      const fs = data["fu8-settings"];
      if (fs && typeof fs === "object") { const patch = {};
        if (Array.isArray(fs.breaks) && fs.breaks.length) patch.breaks = fs.breaks.slice(0, 2);
        if (fs.len && typeof fs.len === "object") { const own = {}; const d0 = { mon: 65, tue: 65, wed: 62, thu: 65, sat: 90, sun: 80 };
          Object.keys(fs.len).forEach((k) => { const n = num(fs.len[k]); if (n != null && n !== d0[k]) own[k] = n; });
          if (Object.keys(own).length) patch.len = Object.assign({}, st.len, own); }
        if (Object.keys(patch).length) { setSt(Object.assign({}, st, patch)); got.push("the break times and session lengths"); } }
      return got.length ? "From the fuel app: " + got.join(", ") + "." : "That fuel backup had nothing in it to bring across.";
    }
    const parsed = parseFuelExport(txt);
    if (!parsed) return "That file has no fuel app data the app could read.";
    setFuel(parsed); return parsed.entries.length + " day" + (parsed.entries.length === 1 ? "" : "s") + " imported from the fuel app.";
  };
  const importFuelText = async (file) => {
    try { return applyFuelBackup(await readTextFile(file)); } catch (e) { return "Couldn't read that file."; }
  };
  /* The dashboard's bodyweight and waist: the referee's weigh-ins, then an
     older fuel export if one was imported. */
  const fuelForDash = useMemo(() => {
    const entries = (tape || []).filter((r) => r && (r.kg != null || r.waist != null)).map((r) => ({ d: r.d, bw: r.kg, waist: r.waist }));
    const old = (fuel && fuel.entries) || [];
    const all = old.filter((e) => !entries.some((x) => x.d === e.d)).concat(entries).sort((a, b) => (a.d < b.d ? -1 : 1));
    return all.length ? { entries: all, importedAt: fuel && fuel.importedAt } : null;
  }, [tape, fuel]);

  /* The four yes/no taps live in the log beside everything else, and they
     resolve the day's readiness — so nothing downstream asks again. */
  const checkA = (log[dk + "-check"] || {}).a || [];
  /* the two days before this one, for the three-yellows rule */
  const recentLevels = useMemo(() => {
    const i = DAYS.indexOf(shown.day); const out = [];
    for (let k = 1; k <= 2; k++) { const j = i - k; if (j < 0) break; out.push(readyMap[dayKey(shown.macro, shown.week, DAYS[j])] || ""); }
    return out;
  }, [readyMap, shown.macro, shown.week, shown.day]);
  const readNow = useMemo(() => readiness(checkA, mFlag, recentLevels), [checkA, mFlag, recentLevels]);
  const setCheckA = (a) => { const n = Object.assign({}, log); n[dk + "-check"] = { a }; setLog(n);
    setReadyMap(Object.assign({}, readyMap, { [dk]: readiness(a, mFlag, recentLevels).level })); };
  const readyNow = readyMap[dk] || readNow.level || "";

  /* ---------------- MAKING WEIGHT ----------------
     weight-making.md: the morning scales live in the morning record,
     the line's draws in settings, and the plan is replayed from them —
     every Sunday's check, the step on every day. Off without a limit. */
  const wcfg = weightCfg(st.season);
  const weights = useMemo(() => { const o = {}; Object.keys(morning || {}).forEach((d) => { const v = num((morning[d] || {}).kg); if (v > 0) o[d] = v; }); return o; }, [morning]);
  const wAsked = useMemo(() => { const o = {}; Object.keys(morning || {}).forEach((d) => { const v = num((morning[d] || {}).kgAsk); if (v > 0) o[d] = v; }); return o; }, [morning]);
  /* yellow or red mornings, Monday to Sunday */
  const badWeek = useCallback((sun) => { let n = 0;
    for (let i = 0; i < 7; i++) { const d = addDays(sun, i - 6), r = rowForDay(season, d); if (!r) continue;
      const lv = readyMap[dayKey(r.mac, r.kw, DAYS[i])]; if (lv === "Y" || lv === "R") n++; }
    return n; }, [season, readyMap]);
  /* the line waits for the camp: drawn on the Sunday before its first
     Monday, unless a Sunday in Prep shows the camp couldn't take the
     weight off inside the speed limit */
  const wCampMon = wcfg ? campMonOf(season, wcfg.fight) : null;
  const wSetAt = (st.wdraws || []).reduce((a, d) => (d && d.at && (!a || d.at < a) ? d.at : a), null);
  const wStart = wcfg && wSetAt ? lineStart({ cfg: wcfg, campMon: wCampMon, setAt: wSetAt, weights, today: dayIso }) : null;
  const wplan = useMemo(() => (wcfg ? runPlan({ draws: startDraws(st.wdraws || [], wStart), weights, asked: wAsked, bad: badWeek, today: dayIso }) : null),
    [JSON.stringify(wcfg), JSON.stringify(st.wdraws || []), wStart, weights, wAsked, badWeek, dayIso]);
  const wDay = (d) => (wcfg && wplan ? weightDay(wplan, wcfg, d) : null);
  const putMorning = (d, patch) => setMorning(Object.assign({}, morning, { [d]: Object.assign({}, morning[d] || {}, patch) }));
  /* what fuelPlan needs for a day: the step, or the fight-week day it is */
  const wFuel = (d) => {
    const wd = wDay(d); if (!wd) return null;
    const rec = morning[d] || {}, wiDay = wd.dates.weighDay;
    const wi = morning[wiDay] || {};
    const weighAt = parseHHMM(rec.weighAt, tMin(WEIGH_DEFAULT[wcfg.weighIn]));
    const fw = fightWeekAverage(wplan, wcfg, weights);
    const weighed = num(wi.official) != null ? num(wi.official) : num(wi.kg);
    const L = topUpLitres(fw, weighed);
    return { kind: wd.kind, step: wd.step, weighIn: wcfg.weighIn, weighAt, overAim: num(rec.kg) != null && num(rec.kg) > wd.nums.M + 1e-9,
      litres: L ? Object.assign({ fw }, L) : null };
  };
  const wt = wcfg && wplan ? { cfg: wcfg, plan: wplan, day: wDay, weights, asked: wAsked, put: putMorning, morning,
    avg: (d) => averageOn(weights, d).avg, fuel: wFuel, start: wStart, campMon: wCampMon, setAt: wSetAt } : null;

  /* A slot's pick is remembered per slot per weekday, as the fuel app did;
     `used` dates each option for the shop's "as you use them" list. */
  const setMenu = (id, k, chosen) => {
    if (!id) return;
    const sel = Object.assign({}, menuAll.picks);
    if (k) sel[id] = k; else delete sel[id];
    const used = Object.assign({}, menuAll.used, chosen ? { [chosen]: dayIso } : {});
    setMenuAll(Object.assign({}, menuAll, { picks: sel, used }));
  };
  /* THE DAY'S BUDGET (brief 34): what today holds, the weight plan's step
     when a cut is running, the Sunday checks with no fight, and the days
     that keep the set plan. */
  const nowM = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();
  const budgetOf = () => {
    const dk0 = dayKey(current.macro, current.week, today);
    const ck = dayClock(current.week, today, log, dk0);
    const fd = fdays[dayIso] || {};
    const type = dayType({ session: !ck.noSess, boxing: boxingTonight(fd, st, today), day: today });
    const wd = wDay(dayIso);
    const planDay = fightDayOf(ck.rx, today) ? "Fight day runs on the set plan in MEALS: the timing is the point today."
      : wd && wd.kind === "light" ? "Making weight's light days run on the set plan in MEALS: low fibre and fewer carbs, at set times."
      : wd && wd.kind === "lowfibre" ? "A low-fibre day: eat from the set plan in MEALS."
      : wd && wd.kind === "weighin" ? "Weigh-in day runs on the set plan in MEALS."
      : null;
    const step = wd && wd.kind === "step" && wd.step != null ? wd.step : null;
    const sur = eat.surplus || [];
    const surplusOn = (s) => { let on = false; sur.forEach((x) => { if (x.at <= s) on = !!x.on; }); return on; };
    const sc = sundayChecks({ weights, from: eat.from || dayIso, today: dayIso, surplusOn, cutOn: (s) => !!wDay(s) });
    const surplus = surplusOn(dayIso);
    const t = foodTargets({ type, adj: sc.adj, surplus, step, kg: bodyKg(weights, dayIso) });
    return { type, t, step, adj: sc.adj, mode: step != null ? "cut" : surplus ? "surplus" : "keep", planDay, check: sc.checks.length ? sc.checks[sc.checks.length - 1] : null, surplus };
  };
  const bud = budgetOf();
  const eatToday = ((eat.days || {})[dayIso]) || [];
  const setEatToday = (list) => setEat(Object.assign({}, eat, { from: eat.from || dayIso, days: Object.assign({}, eat.days || {}, { [dayIso]: list }) }));
  const mealList = useMemo(() => mealsFrom(MEAL_BLOCKS, MEAL_KEYS, mealSlot), []);
  const recentEats = (() => { const seen = {}, out = []; const ds = Object.keys(eat.days || {}).filter((d) => d <= dayIso && d >= addDays(dayIso, -14)).sort().reverse();
    ds.forEach((d) => (eat.days[d] || []).slice().reverse().forEach((x) => { const k = String(x.text || "").toLowerCase(); if (k && !seen[k] && !mealList.some((m) => m.n === x.text)) { seen[k] = 1; out.push(x.text); } }));
    return out; })();
  const openFood = () => { setTab("food"); setFoodSub("today"); };
  /* FOOD opens on TODAY, or on MEALS on a day that keeps the set plan */
  const foodPage = foodSub || (bud.planDay ? "menu" : "today");
  const todayProps = { macro: shown.macro, week: shown.week, day: shown.day, isToday, shownIso, shownFuture,
    foodRow: isToday ? <FoodRow bud={bud} entries={eatToday} now={nowM} on={openFood} /> : null,
    done, setDone, log, setLog, maxes, bw,
    ergUnit: st.ergUnit || "w", peakHR, setEasyPeak: (val) => setSt(Object.assign({}, st, { easyPeak: val })), morning, setMorning, weekDates, st,
    imRec: imDay[shownIso] || {},
    setTick: tickOn(shownIso),
    ready: readyNow,
    sparPrev: !!sparMap[pdk], sparThis: !!sparMap[dk], setSparThis: (val) => setSparMap(Object.assign({}, sparMap, { [dk]: val })),
    swapped: !!swapMap[dk], setSwapped: (val) => setSwapMap(Object.assign({}, swapMap, { [dk]: val })),
    box: boxMap[dk] || "", setBox: (val) => setBoxMap(Object.assign({}, boxMap, { [dk]: val })),
    note: notes[dk] || "", setNote: (val) => setNotes(Object.assign({}, notes, { [dk]: val })),
    openProto: setProto, startTimer: T.start, stopTimer: T.close, openPlates: setPlates, onSetMax, autoRest: st.autoRest,
    setHead: (f, rec) => setSt(Object.assign({}, st, { head: Object.assign({}, st.head, { [f]: rec }) })),
    weekStats, addBody,
    calis, setCalis, taper: taperNow, checkA, setCheckA, readNow,
    openTool: (t) => setTool(t.kind === "rangetests" || t.kind === "movetests" ? { kind: t.kind, macro: shown.macro, week: shown.week } : t),
    sound: st.sound, flowAt, setFlowAt,
    rangeWeek: shownRangeWeek, campLabel,
    openRangeTests: () => setTool({ kind: "rangetests", macro: shown.macro, week: shown.week }),
    /* the food and the water */
    fday: fdays[shownIso] || {}, setFday: (patch) => setFdays(Object.assign({}, fdays, { [shownIso]: Object.assign({}, fdays[shownIso], patch) })),
    menu: menuAll.picks || {}, setMenu, cook, fuelPhase: fuelPhaseOf(st, shown.week, shownIso), wt };

  const exportData = async () => JSON.stringify({ st, done, log, maxes, maxHist, body, readyMap, sparMap, swapMap, boxMap, notes, forge, fweek, hwLog, imDay, imSit, imHard, imWk, calis, morning, photos, fuel, flowAt,
    fdays, menuAll, cook, foods, shop, tape, eat });
  const importData = (s) => { try { const d = JSON.parse(s || "{}");
    setSt(Object.assign(DEF_ST(), d.st || {}, { v12: true, v16: true }));
    const done12 = d.st && d.st.v12 ? (d.done || {}) : migrateDone(d.done || {});
    setDone(d.st && d.st.v16 ? done12 : boxJumpsDone(done12)); setLog(d.log || {}); setMaxes(d.maxes || {}); setMaxHist(d.maxHist || []); setBody(d.body || []);
    setReadyMap(d.readyMap || {}); setSparMap(d.sparMap || {}); setSwapMap(d.swapMap || {}); setBoxMap(d.boxMap || {}); setNotes(d.notes || {});
    setForge(d.forge || []); setFweek(d.fweek || 1); setHwLog(d.hwLog || []);
    setImDay(d.imDay || {}); setImSit(d.imSit || []); setImHard(d.imHard || []); setImWk(d.imWk || {});
    setCalis(Object.assign(DEF_CALIS(), d.calis || {}));
    setMorning(d.morning || {}); setPhotos(d.photos || {}); setFuel(d.fuel || null);
    setFlowAt(d.flowAt || {});
    setFdays(d.fdays || {}); setMenuAll(d.menuAll || {}); setCook(d.cook || null); setFoods(d.foods || []); setShop(d.shop || {}); setTape(d.tape || []); setEat(d.eat || {});
    toast(Object.keys(d).length ? "Backup loaded" : "Everything wiped. The app starts from new.");
  } catch (e) { toast("That isn't a Fighter backup. Nothing was changed.", "bad"); } };

  /* The GUIDE's next feed: today's timeline, the same rule TODAY uses. */
  const nextFeed = (() => {
    if (!loaded) return null;
    const dk0 = dayKey(current.macro, current.week, today);
    const ck = dayClock(current.week, today, log, dk0);
    const planLen = ck.noSess ? 0 : realBlocks(today, ck.rx).filter((b) => !(b.review && today === "sun")).reduce((a, b) => a + (Number(v(b.m, ck.rx)) || 0) + (Number(b.tr) || 0), 0);
    const setL = num((st.len || {})[today]);
    const pl = fuelPlan({ day: today, phase: fuelPhaseOf(st, current.week, dayIso), start: ck.S, len: ck.noSess ? 0 : (setL > 0 ? setL : planLen), session: !ck.noSess,
      breaks: st.breaks || DEFAULT_BREAKS(), lights: ck.lights, boxing: boxingTonight(fdays[dayIso], st, today), menu: menuAll.picks || {},
      fight: fightDayOf(ck.rx, today), weighIn: ck.rx.weighIn || "before", march: parseISO(dayIso).getMonth() === 2, w: wt ? wt.fuel(dayIso) : null });
    const ticks = (fdays[dayIso] || {}).f || {};
    const d0 = new Date(), nm = d0.getHours() * 60 + d0.getMinutes();
    const r = pl.rows.filter((x) => x.kind === "feed" && !ticks[x.id] && x.t >= nm - 5).sort((a, b) => a.t - b.t)[0];
    return r ? { n: r.blk.n, t: hhmm(r.t) } : null;
  })();
  /* four tabs: TODAY · PROGRESS · FOOD · MORE */
  const TABS = [["today", "Today", "today"], ["track", "Progress", "progress"], ["food", "Food", "food"], ["more", "More", "more"]];
  const openMore = (sub) => { setMoreSub(sub); setTab("more"); };
  /* a row of MORE's list, opened */
  const openMorePage = (k) => { if (k === "week" || k === "season" || k === "docs") { setWeekSub(k); setMoreSub("plan"); } else setMoreSub(k); };
  const morePage = moreSub === "plan" ? weekSub : moreSub;
  const moreTitle = (MORE_ROWS.find((r) => r[0] === morePage) || [null, "More"])[1];
  /* today's food and water, for the FOOD tab */
  const setTodayFday = (patch) => setFdays(Object.assign({}, fdays, { [dayIso]: Object.assign({}, fdays[dayIso], patch) }));
  const todayFuel = () => {
    const dk0 = dayKey(current.macro, current.week, today);
    const ck = dayClock(current.week, today, log, dk0);
    const planLen = ck.noSess ? 0 : realBlocks(today, ck.rx).filter((b) => !(b.review && today === "sun")).reduce((a, b) => a + (Number(v(b.m, ck.rx)) || 0) + (Number(b.tr) || 0), 0);
    const setL = num((st.len || {})[today]);
    const fd = fdays[dayIso] || {}, ticks = fd.f || {}, checks = fd.c || {};
    const weekProgSauna = (MODE.prep || MODE.camp) && saunaDays(ck.rx).length > 0;
    const progSauna = weekProgSauna && saunaDays(ck.rx).indexOf(today) >= 0;
    const weekendDay = today === "sat" || today === "sun";
    const sauna = progSauna || (weekendDay && !!fd.sauna && !weekProgSauna);
    const phase = fuelPhaseOf(st, current.week, dayIso);
    const boxing = boxingTonight(fd, st, today);
    const plan = fuelPlan({ day: today, phase, start: ck.S, len: ck.noSess ? 0 : (setL > 0 ? setL : planLen), session: !ck.noSess,
      breaks: st.breaks || DEFAULT_BREAKS(), lights: ck.lights, sauna, boxing, menu: menuAll.picks || {},
      fight: fightDayOf(ck.rx, today), weighIn: ck.rx.weighIn || "before", march: parseISO(dayIso).getMonth() === 2, w: wt ? wt.fuel(dayIso) : null });
    const feeds = plan.rows.filter((r) => r.kind === "feed");
    const sum = (xs) => xs.reduce((a, r) => ({ k: a.k + r.blk.kcal, p: a.p + r.blk.p, c: a.c + r.blk.c, f: a.f + r.blk.f }), { k: 0, p: 0, c: 0, f: 0 });
    const drunk = plan.rows.reduce((a, r) => a + (ticks[r.id] ? mlOf(r, checks) : 0), 0) + (ticks["w-easy"] ? EASY_WATER : 0);
    return { plan, phase, checks, sauna, boxing, progSauna, weekProgSauna, weekendDay, total: sum(feeds), eaten: sum(feeds.filter((r) => ticks[r.id])), drunk };
  };
  const zoom = Math.round(devScale * stepScale(st.textSize) * 1000) / 1000;
  /* dark, or light: the setting's own choice, or the phone's when it is on auto */
  useEffect(() => { applyTheme(st.theme);
    if (st.theme !== "auto" || typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)"), on = () => applyTheme(st.theme);
    if (mq.addEventListener) mq.addEventListener("change", on); else if (mq.addListener) mq.addListener(on);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", on); else if (mq.removeListener) mq.removeListener(on); }; }, [st.theme]);
  /* the timers' sound when the phone is on silent */
  useEffect(() => { setSoundMode(st.soundMode); }, [st.soundMode]);
  /* The two easy weeks are offered the moment the fight is behind you, and
     the baselines ask to be redrawn on the weeks the document names. */
  /* Prep asks for the baselines to be recalibrated at the start of
     weeks 6 and 11 of the document's calendar */
  const recalPrompt = loaded && curRow && curRow.program === "prep" && (curRow.doc === 6 || curRow.doc === 11) && curRow.id !== "P12b" && st.recalAt !== curRow.mac + curRow.kw;
  const P = PH[rxFor(current.week).ph] || PH.b1;
  const headerTitle = shortTitle(current.week);

  /* What the GUIDE's live panel says, and what the season screen reports
     when the fight date moves. */
  const thisBlock = useMemo(() => {
    if (!curRow) { const ph = PH[baseRxFor(current.week).ph] || PH.b1; return { name: ph.n, emphasis: phNote(ph, rxFor(current.week)), tests: [] }; }
    const rx = rowRx(curRow, true);
    if (curRow.program === "prep") return { name: (PH[prepPhaseOf(curRow.doc)] || {}).n + " · " + curRow.id, emphasis: rx.em, tests: prepTests(curRow.doc) };
    if (curRow.program === "spp") return { name: (PH[rx.ph] || {}).n + " · WEEK " + curRow.doc + " OF 12", emphasis: rx.em, tests: sppTests(curRow.doc, !!curRow.mon && curRow.mon >= AUDIT_SINCE) };
    if (curRow.program === "transition") return { name: "TRANSITION", emphasis: TRANSITION_INTRO, tests: [] };
    if (curRow.program === "pre") return { name: "THE WEEK BEFORE THE CAMP", emphasis: "The pre-camp check" + (rx.checks ? "; Saturday the broad jump, the throw and the working-weight checks; Sunday the 20-minute test." : "."), tests: rx.checks ? ["broad jump", "rotational throw", "working-weight checks", "the 20-minute test"] : [] };
    const ph = CPH[rx.ph] || {};
    return { name: String(rx.block || ph.n).toUpperCase() + " · " + curRow.id, emphasis: phNote(ph, { au: auditOn(curRow.mon) }), tests: [] };
  }, [curRow, season, current.macro, current.week]);
  /* the camp today belongs to, or the last one, or the next one */
  const campRowsNow = useMemo(() => {
    const camps = season.rows.filter((r) => r.program === "camp");
    if (!camps.length) return [];
    const now = camps.filter((r) => r.mon <= dayIso).slice(-1)[0] || camps[0];
    return camps.filter((r) => r.campStart === now.campStart).map((row) => ({ row, rx: rowRx(row, true) }));
  }, [season, dayIso]);
  /* RE-PLAN: from today forward — the plans before stay as they were */
  const replan = (inp, fromIn, why) => {
    const from = fromIn || planStartFor(dayIso);
    const inputs = Object.assign({}, inp, { fight: inp.booked ? inp.fight : null });
    WEIGHT_FIELDS.forEach((k) => { if (inputs[k] != null && String(inputs[k]).trim() !== "") inputs[k] = String(inputs[k]).replace(",", "."); });
    const wdraws = nextDraws(st.wdraws, weightCfg(inputs), dayIso);
    if (!fromIn && !trainingChanged(st.season, inputs)) {
      /* the weight plan alone: the training doesn't change */
      const what = why || changeLine(st.season, inputs) || "The weight plan";
      /* the line waits for the camp: say when it starts */
      const cm = campMonOf(season, inputs.fight), ahead = !!cm && addDays(cm, -1) > dayIso && !(wplan && wplan.line);
      setSt(Object.assign({}, st, { season: inputs, wdraws, planNote: what + ". " + (!weightCfg(inputs) ? "The weight plan is off; the training doesn't change."
        : ahead ? "The weight plan starts with the camp, on " + fmtDate(cm) + "; until then the food runs as printed. The training doesn't change."
        : "The weight plan's line is redrawn; the training doesn't change."), planNoteAt: dayIso }));
      return;
    }
    const plans2 = (st.plans || []).filter((p) => p.from < from).concat([{ from, made: dayIso, inputs }]);
    const s2 = buildSeason({ plans: plans2, today: dayIso });
    /* the program running into the plan's Monday */
    const was = season.rows.find((r) => r.mon === addDays(from, -7));
    const runningNow = was && was.program === "spp" && was.doc !== 12 ? "spp" : was && was.program === "prep" && was.doc !== 14 ? "prep" : null;
    const what = why || changeLine(st.season, inputs, runningNow, was && was.doc) || "Re-planned";
    const line = what + ". From " + fmtDate(from) + ": " + describeSeason(s2, from);
    /* START AGAIN goes in the plan, never in the answers */
    const kept = Object.assign({}, inputs); delete kept.restart; delete kept.repeat;
    setSt(Object.assign({}, st, { season: kept, plans: plans2, fightDate: inputs.booked ? inputs.fight : null, planNote: line, planNoteAt: dayIso, wdraws }));
    setSelDay(null); setViewRaw(null);
  };
  /* THE TESTS CORRECT THE ANSWER: the first scored simulation's fade —
     under 75% low, 75–84% moderate, 85% or more good. If it disagrees
     with what was entered, one line, and the plan adjusts from the next
     Monday. */
  useEffect(() => {
    if (!loaded || !st.season || !st.season.booked || !st.season.fight || st.season.fight <= dayIso) return;
    const camp = campRowsNow;
    const first = camp.find((x) => x.rx.sim && x.rx.sim.scored && x.row.mon <= dayIso);
    if (!first || (st.fadeDone || {})[st.season.fight]) return;
    const k = "mCw" + first.row.kw + "-sun-";
    const fade = fadePct(log[k + "c_fs_rd1"], log[k + "c_fs_rd6"]);
    if (!fade) return;
    const fit = fitnessFromFade(fade);
    const done1 = Object.assign({}, st.fadeDone, { [st.season.fight]: 1 });
    if (fit === first.row.camp.fitness) { setSt(Object.assign({}, st, { fadeDone: done1 })); return; }
    const next = addDays(mondayIso(dayIso), 7);
    const inputs = Object.assign({}, st.season, { fitness: fit });
    const plans2 = (st.plans || []).filter((p) => p.from < next).concat([{ from: next, made: dayIso, inputs }]);
    const s2 = buildSeason({ plans: plans2, today: dayIso });
    setSt(Object.assign({}, st, { season: inputs, plans: plans2, fadeDone: done1, planNoteAt: dayIso,
      planNote: "Your first scored rounds held " + Math.round(fade) + "% — that reads as " + fit + " fitness, not " + first.row.camp.fitness + ". From " + fmtDate(next) + ": " + describeSeason(s2, next) }));
  }, [loaded, log, campRowsNow]);
  const noMaxes = loaded && !MODE.camp && !num(maxes.squat) && !num(maxes.bench);
  const noCampWork = loaded && MODE.camp && !num(maxes.cw_squat) && !num(maxes.cw_tbdl);
  const dayAc = (k) => { const sx = sessFor(k, rxFor(shown.week)); return sx ? sx.ac : C.ash; };
  /* Looking at another day or another week from the top of TODAY. The
     day you are on comes back as plain today, so its NOW is the one that
     remembers where you were. */
  const atDay = (w, k, mac) => { const m = mac == null ? shown.macro : mac; return w === current.week && m === current.macro && k === today ? null : { macro: m, week: w, day: k }; };
  /* the season's weeks run on from one program into the next */
  const shownSeg = shownRow ? segmentOf(shownRow) : null;
  /* a re-plan made mid-week takes that week from the day it was made: the
     days before it open under the week they were lived in */
  const dayRow = (r, k) => { if (!r) return r; const top = r.overlaid ? season.rows.find((x) => x.under === r) || r : r;
    return top.under && addDays(top.mon, DAYS.indexOf(k)) < top.made ? top.under : top; };
  const goRow = (r) => { if (!r) return; const x = dayRow(r, shown.day); setSelDay(atDay(x.kw, shown.day, x.mac)); setWeekPick(false); };
  const goWeek = (w) => { if (shownRow) { goRow(seasonRow(shown.macro, w)); return; } setSelDay(atDay(Math.max(1, Math.min(L, w)), shown.day)); setWeekPick(false); };
  const stepWeek = (d) => { if (shownRow) { goRow(season.rows[shownRow.seq + d]); return; } goWeek(shown.week + d); };
  const atFirst = shownRow ? shownRow.seq <= 0 : shown.week <= 1;
  const atLast = shownRow ? shownRow.seq >= season.rows.length - 1 : shown.week >= L;
  const goDay = (k) => { const x = dayRow(shownRow, k); setSelDay(x ? atDay(x.kw, k, x.mac) : atDay(shown.week, k)); setWeekPick(false); };
  const setFocus = (val) => { setFocusRaw(!!val); save(VIEW_KEY, { d: dayIso, focus: !!val && isToday }); };
  /* HOME's week card: the programme line, where the week sits in it, the weeks to pick from and the seven days of the one on screen */
  const titleParts = shortTitle(shown.week).split(" · ");
  const stretch = shownSeg || Array.from({ length: L }, (_, i) => ({ kw: i + 1 }));
  const weekNo = (r, i) => (r && r.idx) || i + 1;
  const pos = { n: weekNo(shownRow, stretch.findIndex((r) => r.kw === shown.week)), m: stretch.reduce((a, r, i) => Math.max(a, weekNo(r, i)), 1) };
  const nav = {
    sub: titleParts[0], title: titleParts.slice(1).join(" · ").replace(/^Week (\d+)/, (m0, n) => (pos.m > 1 && Number(n) === pos.n ? "Week " + n + " of " + pos.m : m0)), pos,
    atFirst, atLast, step: stepWeek, pickOpen: weekPick, setPickOpen: setWeekPick, goWeek, goDay, toToday: () => { setSelDay(null); setWeekPick(false); },
    weeks: stretch.map((r, i) => ({ w: r.kw, label: r.hold ? "H" : weekNo(r, i), name: "Week " + weekNo(r, i), on: r.kw === shown.week, now: r.kw === current.week && shown.macro === current.macro, tag: weekKind(rxFor(r.kw)) })),
    days: DAYS.map((k, i) => { const rxk = rxFor(shown.week, k), n = (done[dayKey(shown.macro, shown.week, k)] || []).length;
      const tot = !MODE.camp && k === "sat" && rxk.test ? 1 : countedBlocks(k, rxk).length;
      return { k, letter: DSH[k], date: Number(String(weekDates[i] || "").slice(8)) || "", name: DSH[k], on: shown.day === k, now: k === today && shown.week === current.week && shown.macro === current.macro,
        state: !tot || sleepDay(k, rxk) ? "rest" : n >= tot ? "done" : n ? "part" : "todo" }; }),
  };
  const isRounds = (kind) => BELL_KINDS.indexOf(kind) >= 0;
  const dockUp = !!T.t && !T.open;

  return (
    <div className="o8-root" style={Object.assign({}, bdy, { background: C.ink, minHeight: "100vh", color: C.chalk, "--o8-zoom": zoom })}>
      <style>{FONTS + ACT_CSS}</style>
      <span ref={probeRef} className="o8-probe" aria-hidden="true">A</span>
      {loaded && st.welcome ? <Welcome st={st} upd={(p) => setSt(Object.assign({}, st, p))} maxes={maxes} onMaxes={setMaxes} onRestore={importData}
          onRun={(k) => { const from = defaultStart(), inputs = Object.assign({ booked: false }, FIGHT_DEFAULTS, { classic: false, spp: k === "spp" });
            setSt(Object.assign({}, st, { season: inputs, plans: [{ from, made: from, inputs }] })); }}
          onDone={() => setSt(Object.assign({}, st, { welcome: false }))} /> : null}
      {T.t ? <TimerFull T={T} rounds={isRounds} /> : null}
      {plates !== null && plates !== undefined ? <Plates kg={plates} onClose={() => setPlates(null)} /> : null}
      {proto ? <ProtoSheet id={proto} close={() => setProto(null)} /> : null}
      {tool ? (
        tool.kind === "profile" ? <ProfileTool profiles={st.profiles} setProfiles={(pr) => setSt(Object.assign({}, st, { profiles: pr }))} maxes={maxes} dayIso={dayIso} onClose={() => setTool(null)} />
        : tool.kind === "move" ? <MoveTool sound={st.sound} onClose={() => setTool(null)} />
        : tool.kind === "rangetests" ? (() => { const k = rangeKey(tool.macro || current.macro, tool.week || current.week);
            return <RangeTests week={tool.week || current.week} rangeWeek={rangeWeekOf(tool.macro || current.macro, tool.week || current.week)}
              get={(id) => rangeGet(k, id)} put={(id, v) => rangePut(k, id, v)} onClose={() => setTool(null)} flex={MODE.prep} />; })()
        : tool.kind === "movetests" ? (() => { const k = rangeKey(tool.macro || current.macro, tool.week || current.week), row = seasonRow(tool.macro || current.macro, tool.week || current.week);
            const pk = row ? lastMoveTest(row) : null, ends = (log[END_KEY] || {}).ends || {};
            /* YOUR END: marked or undone, with the day it was marked */
            const onEnd = (id) => { const n = Object.assign({}, log), e = Object.assign({}, ends); if (e[id]) delete e[id]; else e[id] = dayIso; n[END_KEY] = { ends: e }; setLog(n); buzz(20); };
            return <MoveTests mw={row ? moveWeekOf(row.mon, MOVE.start) : 1} get={(id) => rangeGet(k, id)} put={(id, v) => rangePut(k, id, v)}
              gymGet={(id) => moveVal(log, k, id)} prevGet={pk ? (id) => moveVal(log, pk, id) : null} ends={ends} onEnd={onEnd} onClose={() => setTool(null)} />; })()
        : null) : null}

      <header className="o8-glass" style={{ borderBottom: "1px solid " + C.line, background: C.slab, position: "sticky", top: 0, zIndex: 30, paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 20px 12px", paddingLeft: "max(20px, env(safe-area-inset-left))", paddingRight: "max(20px, env(safe-area-inset-right))" }}>
          {/* TODAY's line is the date; the programme and the week are in the week card under it, and said here for a screen reader */}
          <div style={Object.assign(cap(), { lineHeight: 1.35, overflowWrap: "anywhere" })}>{tab === "today" ? (isToday ? longDate(dayIso) : "Looking at another day") : <span data-testid="app-title">{headerTitle}</span>}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            {tab === "more" && moreSub !== "menu" ? (
              <button onClick={() => setMoreSub("menu")} aria-label="Back to More" style={{ width: 44, height: 44, marginLeft: -10, flexShrink: 0, borderRadius: 999, border: "none", background: "transparent", color: C.chalk, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="left" size={24} w={2.6} /></button>) : null}
            <h1 data-testid="page-title" style={Object.assign({}, dsp, { margin: 0, fontSize: FS.title, fontWeight: 800, letterSpacing: -.6, lineHeight: 1.15, color: C.chalk, overflowWrap: "anywhere" })}>
              {tab === "today" ? (isToday ? "Today" : longDate(shownIso)) : tab === "more" ? moreTitle : (TABS.find((x) => x[0] === tab) || TABS[0])[1]}
              {tab === "today" ? <span className="o8-sr" data-testid="app-title">{shortTitle(shown.week)}</span> : null}
            </h1>
          </div>
        </div>
      </header>

      <div style={{ padding: "16px 16px 190px", paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))", maxWidth: 640, margin: "0 auto" }}>
        {!loaded ? <Skeleton /> : (
          <Guard at={tab}>
            {tab === "today" ? (
              <div>
                {current.pre ? <Card ac={C.brass}><Note c={C.brass} s={{ marginTop: 0 }}>Week 1 begins {fmtDate(current.row ? current.row.mon : monOf(current.macro, 1))}</Note></Card> : null}
                {current.done ? <Card ac={C.moss}><Note c={C.moss} s={{ marginTop: 0 }}>{MODE.prep ? "PREP is over" : MODE.spp ? "The cycle is over" : MODE.trans ? "The two easy weeks are over" : "The camp is over"}</Note><Btn c={C.moss} fill s={{ marginTop: 8, width: "100%" }} on={() => openMore("settings")}>OPEN SETTINGS</Btn></Card> : null}
                {noCampWork ? <Btn c={C.brass} fill s={{ width: "100%", marginBottom: 12 }} on={() => setTab("track")}>FIRST — SET THE WORKING WEIGHTS</Btn> : null}
                {noMaxes ? <Btn c={C.brass} fill s={{ width: "100%", marginBottom: 12 }} on={() => setTab("track")}>FIRST — ENTER YOUR MAXES</Btn> : null}
                {st.planNote && st.planNoteAt && addDays(st.planNoteAt, 7) > dayIso ? <Banner kind="ok" testid="plan-note">{planWords(st.planNote)}</Banner> : null}
                {wt && isToday && wt.plan.line && wt.plan.lines[wt.plan.lines.length - 1].at === dayIso ? (() => { const ln = wt.plan.lines[wt.plan.lines.length - 1], last = wt.plan.timeline[wt.plan.timeline.length - 1];
                  return <LineCard line={ln} step={ln.step} from={last && last.from > dayIso ? last.from : null} />; })() : null}
                {wcfg && dayIso === addDays(wcfg.fight, 1) ? <Card ac={C.moss}><Note c={C.chalk} s={{ marginTop: 0 }}>{AFTER_FIGHT_TEXT}</Note></Card> : null}
                {recalPrompt ? <Btn c={C.cobalt} fill s={{ width: "100%", marginBottom: 12 }}
                  on={() => { const r = recalibrated(morning, dayIso); setSt(Object.assign({}, st, { base: r, recalAt: curRow.mac + curRow.kw })); }}>{curRow ? curRow.id : ""} — RECALIBRATE BASELINE</Btn> : null}
                <Today key={dk} {...todayProps} focus={inFocus} setFocus={setFocus} nav={nav} dockUp={dockUp} photoPrompt={shownPhotoDay
                  ? { done: !!(photosShown.front || photosShown.side || photosShown.back),
                      open: () => { setPhotoDate(shownIso); setTab("track"); setTrackSub("photos"); } }
                  : null} />
              </div>) : null}
            {tab === "track" ? <Track current={current} maxes={maxes} onSetMax={onSetMax} maxHist={maxHist} log={log} body={body} addBody={addBody} done={done} L={L} calis={calis} camp={MODE.camp}
              view={MODE.camp ? true : MODE.prep || MODE.trans ? "prep" : MODE.spp ? "spp" : false} title={headerTitle}
              rangeWeeks={rangeTestWeeks} rangeGet={rangeGet} moveWeeks={moveTestWeeks} moveGet={(k, id) => moveVal(log, k, id)} moveEnds={(log[END_KEY] || {}).ends} campRows={campRowsNow}
              sub={trackSub} setSub={(x) => { setTrackSub(x); setPhotoDate(null); }} st={st} morning={morning} photos={photos} setPhotos={setPhotos} fuel={fuelForDash} dateOf={dateOf}
              tape={tape} setTape={setTape} fuelPhase={fuelPhaseOf(st, current.week, dayIso)} weightOn={!!wDay(dayIso)}
              dayIso={photoDate || dayIso} photoDay={photoDay} ergUnit={st.ergUnit || "w"}
              weekStats={weekStats} todayIso={dayIso} onWeigh={(kg) => { putMorning(dayIso, { kg }); toast("Weight saved · " + kg + " kg"); }} /> : null}
            {tab === "food" ? (
              <div>

                {wt ? (() => { const wdx = wDay(dayIso); return wdx ? (
                  <div>
                    <WeightBanner wd={wdx} waiting={wt.plan.waiting} />
                    {wdx.kind === "light" ? <Card ac={C.oxide}>{lightDaysNotes().map((x, i) => <Note key={i} c={C.chalk} s={{ marginTop: i ? 6 : 0 }}>{x}</Note>)}</Card> : null}
                  </div>) : null; })() : null}
                <div style={{ marginBottom: 14 }}>
                  <Seg opts={[["today", "TODAY"], ["menu", "MEALS"], ["cook", "COOK"], ["shop", "SHOP"], ["water", "WATER"]]} val={foodPage} on={setFoodSub} />
                </div>
                {foodPage === "today" ? <FoodToday boxSw={(() => { const F = todayFuel(); return F.plan.boxable ? <BoxingSwitch on={F.boxing} set={(val) => setTodayFday({ box: !!val })} /> : null; })()} bud={bud} entries={eatToday} setEntries={setEatToday} mine={eat.foods || []} setMine={(xs) => setEat(Object.assign({}, eat, { foods: xs }))}
                    cook={cook} meals={mealList} now={nowM} recent={recentEats} surplus={bud.surplus}
                    setSurplus={(on) => setEat(Object.assign({}, eat, { from: eat.from || dayIso, surplus: (eat.surplus || []).filter((x) => x.at !== dayIso).concat([{ at: dayIso, on: !!on }]) }))} /> : null}
                {foodPage === "menu" || foodPage === "water" ? (() => { const F = todayFuel();
                  const boxSw = F.plan.boxable ? <BoxingSwitch on={F.boxing} set={(val) => setTodayFday({ box: !!val })} /> : null;
                  return foodPage === "menu" ? (
                    <div data-testid="food-menu">
                      {boxSw}
                      {bud.planDay ? null : <Note s={{ marginTop: 0, marginBottom: 12 }}>The old plan's meals, as ideas. Eat them whenever suits you and log them on TODAY: every one is there, one tap each.</Note>}
                      {F.plan.rows.filter((r) => r.kind === "feed").map((r) => (
                        <Card key={r.id} mark={r.crit ? "warn" : undefined}>
                          <div style={Object.assign({}, mno, { fontSize: 15, fontWeight: 600, color: C.ash })}>{hhmm(r.t)}</div>
                          <div style={Object.assign({}, dsp, { fontSize: 22, fontWeight: 800, letterSpacing: .2, lineHeight: 1.2, color: C.chalk, margin: "2px 0 10px" })}>{r.blk.n}</div>
                          <FeedBody row={r} cook={cook} checks={F.checks} onPick={setMenu} />
                        </Card>))}
                    </div>)
                    : <div>{boxSw}<DayFuel waterOnly={!bud.planDay} phase={F.phase} plan={F.plan} eaten={F.eaten} total={F.total} drunk={F.drunk} target={F.plan.target} notes={[]}
                        sauna={F.sauna} setSauna={(val) => setTodayFday({ sauna: !!val })} showSauna={F.weekendDay && !F.weekProgSauna}
                        rules={HYDRA_RULES} midBanana={!!MIDBANANA[F.phase] && today === "sun"} /></div>; })() : null}
                {foodPage === "cook" ? (
                  <div>
                    <Cook cook={cook} setCook={setCook} foods={foods} setFoods={setFoods} K={K} prep={menuAll.prep || {}} setPrep={(v) => setMenuAll(Object.assign({}, menuAll, { prep: v }))} />
                    {K.t ? <div style={{ position: "sticky", bottom: "calc(" + TAB_H + "px + env(safe-area-inset-bottom))", zIndex: 25 }}><KDock K={K} /></div> : null}
                  </div>) : null}
                {foodPage === "shop" ? <Shop shop={shop} setShop={setShop} used={menuAll.used || {}} today={dayIso} /> : null}
              </div>) : null}
            {tab === "more" ? (
              <div>
                {moreSub === "menu" ? (
                  <div data-testid="more-menu" className="fade">
                    <Card s={{ padding: "4px 16px" }}>
                      {MORE_ROWS.map((r, i) => <NavRow key={r[0]} icon={r[3]} title={r[1]} sub={r[2]} last={i === MORE_ROWS.length - 1} on={() => openMorePage(r[0])} />)}
                    </Card>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "22px 0 8px" }}>
                      <svg aria-hidden="true" width="44" height="33" viewBox="-32 0 576 432" fill="none">
                        <path style={{ fill: C.markLit }} d="M512 16L396 44L290 46L256 142L364 186L409 316L441 330L493 388L497 398L489 414L449 416L395 400L344 315L338 238L256 174Z" />
                        <path style={{ fill: C.markShade }} d="M0 16L116 44L222 46L256 142L148 186L103 316L71 330L19 388L15 398L23 414L63 416L117 400L168 315L174 238L256 174Z" />
                      </svg>
                      <div style={Object.assign(cap(), { letterSpacing: 1 })}>Fighter</div>
                    </div>
                  </div>) : null}
                {moreSub === "plan" ? (
                  <div className="fade">
                    {weekSub === "season"
                      ? <SeasonView season={season} st={st} current={current} dayIso={dayIso}
                          openWeek={(r) => { setViewRaw({ macro: r.mac, week: r.kw }); setWeekSub("week"); }} />
                      : weekSub === "week"
                      ? <WeekView view={vw} setView={setView} current={current} setCurrent={null} done={done} L={L} weekDoneMap={weekDoneMap}
                          openDay={(d) => { setSelDay({ macro: vw.macro, week: vw.week, day: d }); setFocusRaw(false); setTab("today"); }} />
                      : <PlanView program={program} title={headerTitle} />}
                  </div>) : null}
                {moreSub === "guide" ? <GuideView md={guideDoc} md2={guideFuelDoc} blockName={thisBlock.name} emphasis={thisBlock.emphasis} tests={thisBlock.tests}
                    phase={FUEL_PHASES[fuelPhaseOf(st, current.week, dayIso)] || null} next={nextFeed} /> : null}
                {moreSub === "settings" ? <Settings st={st} setSt={setSt} current={current} L={L} exportData={exportData} importData={importData} rangeWeek={rangeWeek} calis={calis} setCalis={setCalis} replan={replan}
                    morning={morning} dayIso={dayIso} fuel={fuel} setFuel={setFuel} importFuelText={importFuelText}
                    season={season} openProfile={() => setTool({ kind: "profile" })} fuelPhase={fuelPhaseOf(st, current.week, dayIso)} wt={wt} /> : null}
              </div>) : null}
          </Guard>)}
      </div>

      <TimerDock T={T} rounds={isRounds} bottom={"calc(" + (tab === "today" && inFocus ? ACT_H : TAB_H) + "px + env(safe-area-inset-bottom))"} />
      <nav aria-label="Tabs" className="o8-glass" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, background: C.slab, borderTop: "1px solid " + C.line, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div style={{ display: "flex", maxWidth: 640, margin: "0 auto" }}>
          {TABS.map((x) => { const on = tab === x[0]; return <button key={x[0]} onClick={() => { if (x[0] === "today" && tab === "today") { setSelDay(null); setWeekPick(false); setFocus(false); } if (x[0] === "more") setMoreSub("menu"); setTab(x[0]); setProto(null); }} aria-current={on ? "page" : undefined}
            style={Object.assign({}, dsp, { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: FS.micro, fontWeight: on ? 700 : 600, letterSpacing: .2, background: "transparent", border: "none", color: on ? C.chalk : C.ash, padding: "7px 2px 8px", cursor: "pointer", minHeight: TAB_H - 2 })}>
            <span aria-hidden="true" style={{ width: 60, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: on ? soft(C.accent) : "transparent", color: on ? C.accent : C.ash, transition: "background-color .2s ease, color .2s ease" }}><Icon n={x[2]} size={24} w={on ? 2.4 : 2} /></span>{x[1]}</button>; })}
        </div>
      </nav>
      <Toasts />
    </div>);
}
