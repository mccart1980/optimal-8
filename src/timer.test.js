import { describe, it, expect } from "vitest";
import { timerSteps, BELL_KINDS } from "./App.jsx";
import { cueFor, beatAt } from "./sound.js";

/* ================================================================
   EVERY SECOND OF A TIMER — what it sounds and shows, walked second by
   second through the timers the programmes really start, with the
   options they really give them. The rules are sound.js's; this checks
   that the timers' parts let them land where a fighter needs them.
   ================================================================ */
function walk(kind, opt) {
  const S = timerSteps(kind, opt), rounds = BELL_KINDS.indexOf(kind) >= 0, out = [];
  out.push({ at: 0, i: 0, cue: S.length > 1 ? cueFor(null, S[0], rounds) : "tick" });
  let at = 0;
  S.forEach((p, i) => {
    for (let rem = p.s; rem >= 1; rem--) {
      const b = beatAt(S, i, rem, rounds);
      if (b.tick) out.push({ at, i, cue: "tick", rem });
      if (b.warn) out.push({ at, i, cue: "warn", rem });
      at += 1;
    }
    out.push({ at, i: i + 1, cue: kind === "rest" && i === S.length - 1 ? "bell1" : cueFor(p, S[i + 1], rounds) });
  });
  return { S, out, only: (c) => out.filter((x) => x.cue === c) };
}
/* the second a round's work ends: the parts of a round run until a part that isn't */
const roundEnds = (S) => { const ends = []; let at = 0; S.forEach((p, i) => { at += p.s; const inR = p.t === "w" || p.inR, nxt = S[i + 1]; if (inR && !(nxt && (nxt.t === "w" || nxt.inR))) ends.push(at); }); return ends; };

describe("the pressure rounds, as Strength, Power and Physique starts them", () => {
  const opt = { rounds: 3, mins: 3, every: 20, secs: 5, rest: 60, wu: 1, cd: 2, arms: 1 };
  const { S, out, only } = walk("pressure", opt);

  it("the bell only at a round's edges: one as it starts, two as it ends, three at the very end", () => {
    expect(only("bell1").map((x) => x.at)).toEqual([60, 300, 540]);
    expect(only("bell2").map((x) => x.at)).toEqual([240, 480, 720]);
    expect(only("bell3").map((x) => x.at)).toEqual([840]);
    expect(roundEnds(S)).toEqual([240, 480, 720]);
  });
  it("inside a round, every burst starts on the work sound and every steady stretch on the rest sound", () => {
    expect(out[0].cue).toBe("ease");                // the easy minute to warm up starts on the rest sound
    const inside = (c) => only(c).filter((x) => x.at > 0);
    expect(inside("go").length).toBe(3 * 8);        // nine bursts a round; the first starts on the bell
    expect(inside("ease").length).toBe(3 * 9);      // nine steady stretches a round
    inside("go").forEach((x) => expect(S[x.i].t).toBe("w"));
    inside("ease").forEach((x) => expect(S[x.i].inR).toBe(true));
    expect(only("change").length).toBe(0);
  });
  it("ten seconds before every round ends, the warning, once a round; and once in each minute's rest and the warm-up", () => {
    const warns = only("warn").map((x) => x.at);
    roundEnds(S).forEach((end) => expect(warns).toContain(end - 10));
    expect(warns).toEqual([50, 230, 290, 470, 530, 710, 830]);
  });
  it("the 3-2-1 before every burst, before every round and rest ends, and never inside a 5-second burst", () => {
    only("tick").forEach((x) => expect(S[x.i].s).toBeGreaterThanOrEqual(10));
    const before = (at) => [at - 3, at - 2, at - 1].every((s) => only("tick").some((x) => x.at === s));
    only("go").forEach((x) => expect(before(x.at)).toBe(true));
    [60, 240, 300, 480, 540, 720, 840].forEach((at) => expect(before(at)).toBe(true));
  });
  it("the last ten seconds of a round are marked, and only those", () => {
    const iLast = S.findIndex((p, i) => p.inR && !(S[i + 1] && (S[i + 1].t === "w" || S[i + 1].inR)));
    expect(beatAt(S, iLast, 10, true).ten).toBe(true);
    expect(beatAt(S, iLast, 11, true).ten).toBe(false);
    expect(beatAt(S, iLast - 2, 10, true).ten).toBe(false);   // a steady stretch earlier in the round
    expect(beatAt(S, iLast - 1, 3, true).ten).toBe(false);    // the last burst: 18 seconds left in the round
  });
  it("one round in a lighter week: the same edges", () => {
    const one = walk("pressure", { rounds: 1, mins: 3, every: 20, secs: 5, rest: 60, wu: 1, cd: 1, arms: 1 });
    expect([one.only("bell1").length, one.only("bell2").length, one.only("bell3").length]).toEqual([1, 1, 1]);
    expect(one.only("warn").map((x) => x.at)).toEqual([50, 230, 290]);
  });
});

describe("the rounds in the other programmes", () => {
  it("Fighter's simulation: three minutes a round, a bell at each edge, a double beep at each minute, the warning ten seconds from each round's end", () => {
    const { S, only } = walk("sim", { rounds: 6, rest: 60 });
    expect(only("bell1").length).toBe(6);
    expect(only("bell2").length).toBe(5);
    expect(only("bell3").length).toBe(1);
    expect(only("change").length).toBe(6 * 2);
    roundEnds(S).forEach((end) => expect(only("warn").map((x) => x.at)).toContain(end - 10));
    expect(only("warn").length).toBe(6 + 5);       // every round, and every minute's rest
  });
  it("the camp's and Prep's rounds, and the rounds on the erg: the same", () => {
    [["csim", { rounds: 6, rest: 60, mins: 3, R: 6, arms: 1 }], ["csim", { rounds: 3, rest: 60, mins: 3, pace: 1 }], ["ergrounds", { rounds: 7, mins: 3, rest: 60, R: 6 }]].forEach(([k, o]) => {
      const { S, only } = walk(k, o), n = o.rounds;
      expect([k, only("bell1").length, only("bell2").length, only("bell3").length]).toEqual([k, n, n - 1, 1]);
      roundEnds(S).forEach((end) => expect(only("warn").map((x) => x.at)).toContain(end - 10));
    });
  });
});

describe("a rest clock", () => {
  it("ten seconds left: the clapper; then the 3-2-1; then one ring of the bell", () => {
    const { out } = walk("rest", { secs: 90 });
    expect(out.map((x) => x.cue + "@" + x.at)).toEqual(["tick@0", "warn@80", "tick@87", "tick@88", "tick@89", "bell1@90"]);
  });
  it("a rest under 30 seconds gets the 3-2-1 and the bell, no clapper", () => {
    const { only } = walk("rest", { secs: 20 });
    expect([only("warn").length, only("tick").length]).toEqual([0, 4]);
  });
  it("the last ten seconds are marked", () => {
    const S = timerSteps("rest", { secs: 90 });
    expect([beatAt(S, 0, 11, false).ten, beatAt(S, 0, 10, false).ten, beatAt(S, 0, 1, false).ten]).toEqual([false, true, true]);
  });
});

describe("the 4 × 4", () => {
  it("every four minutes of work and every three easy: the warning at ten seconds, the 3-2-1, then the next", () => {
    const { only } = walk("vo2", { n: 4 });
    expect(only("warn").length).toBe(timerSteps("vo2", { n: 4 }).filter((p) => p.s >= 30).length);
    expect(only("go").length + only("ease").length + only("done").length).toBe(timerSteps("vo2", { n: 4 }).length + 1);   // the start, then every change
    expect(only("done").length).toBe(1);
  });
});
