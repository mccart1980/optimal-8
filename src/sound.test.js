import { describe, it, expect } from "vitest";
import { cueFor, beatAt, inRound, play, beep, cue, audio, wake, rehearse, setMode, MODES } from "./sound.js";

/* ================================================================
   ONE SOUND ENGINE — every timer plays through sound.js.
   ================================================================ */
describe("which sound a timer's next part gets", () => {
  const W = { t: "w" }, R = { t: "r" };
  it("a timer of boxing rounds: one bell to start a round, two to end it, three when it's all done", () => {
    expect(cueFor(null, W, true)).toBe("bell1");
    expect(cueFor(R, W, true)).toBe("bell1");
    expect(cueFor(W, R, true)).toBe("bell2");
    expect(cueFor(W, null, true)).toBe("bell3");
    expect(cueFor(R, null, true)).toBe("bell3");
  });
  it("inside a round, the next part changes on a quieter sound, never a bell", () => {
    expect(cueFor(W, W, true)).toBe("change");
    expect(cueFor(R, R, true)).toBe("ease");
  });
  it("a round made of bursts with a steady pace between: the steady stretch belongs to the round, so the bells stay at its edges", () => {
    const B = { t: "w", s: 5 }, St = { t: "r", s: 15, inR: true }, Rest = { t: "r", s: 60 };
    expect([inRound(B), inRound(St), inRound(Rest), inRound(null)]).toEqual([true, true, false, false]);
    expect(cueFor(Rest, B, true)).toBe("bell1");     // a round starts
    expect(cueFor(B, St, true)).toBe("ease");        // a burst ends
    expect(cueFor(St, B, true)).toBe("go");          // the next burst
    expect(cueFor(St, Rest, true)).toBe("bell2");    // the round ends
    expect(cueFor(St, null, true)).toBe("bell3");
  });
  it("every other timer: work starts on one sound, rest on another, the end on a third", () => {
    expect(cueFor(null, W, false)).toBe("go");
    expect(cueFor(R, W, false)).toBe("go");
    expect(cueFor(W, W, false)).toBe("go");
    expect(cueFor(W, R, false)).toBe("ease");
    expect(cueFor(W, null, false)).toBe("done");
  });
  it("every sound a timer can ask for is one the engine can make", () => {
    const made = Object.keys(cue);
    ["tick", "go", "ease", "change", "half", "warn", "bell", "done"].forEach((k) => expect(made).toContain(k));
    [cueFor(null, W, true), cueFor(W, W, true), cueFor(W, R, true), cueFor(W, null, true), cueFor(null, W, false), cueFor(W, R, false), cueFor(W, null, false)]
      .forEach((name) => expect(/^bell[123]$/.test(name) || made.includes(name)).toBe(true));
  });
});

describe("the 3-2-1 and the last ten seconds", () => {
  const B = { t: "w", s: 5 }, St = { t: "r", s: 15, inR: true }, Rest = { t: "r", s: 60 };
  const round = [Rest, B, St, B, St, Rest];            // a minute's rest, a 40-second round, a minute's rest
  it("the 3-2-1 on a part of 10 seconds or more, never inside a short burst", () => {
    expect([1, 2, 3].map((r) => beatAt(round, 2, r, true).tick)).toEqual([true, true, true]);
    expect(beatAt(round, 2, 4, true).tick).toBe(false);
    expect([1, 2, 3].map((r) => beatAt(round, 1, r, true).tick)).toEqual([false, false, false]);
  });
  it("on a timer of rounds the ten seconds count to the round's end, across its parts", () => {
    expect(beatAt(round, 4, 10, true)).toEqual({ tick: false, warn: true, ten: true, left: 10 });
    expect(beatAt(round, 3, 3, true)).toEqual({ tick: false, warn: false, ten: false, left: 18 });
    expect(beatAt(round, 2, 10, true).ten).toBe(false);  // 30 seconds of the round still to go
    expect(beatAt(round, 0, 10, true)).toEqual({ tick: false, warn: true, ten: true, left: 10 });   // the rest's own last ten
  });
  it("anything shorter than 30 seconds isn't marked, and nothing is at zero", () => {
    const short = [{ t: "r", s: 20 }];
    expect(beatAt(short, 0, 10, false)).toEqual({ tick: false, warn: false, ten: false, left: 10 });
    expect(beatAt([{ t: "r", s: 90 }], 0, 0, false)).toEqual({ tick: false, warn: false, ten: false, left: 0 });
    expect(beatAt([], 0, 5, false).ten).toBe(false);
  });
});

describe("the phone's silent switch", () => {
  it("two choices: stay silent with the switch, or play anyway", () => {
    expect(MODES).toEqual([["mix", "STAY SILENT"], ["loud", "PLAY ANYWAY"]]);
  });
  it("the choice is passed to the phone where the phone has a place for it, and is harmless where it hasn't", () => {
    expect(() => { setMode("loud"); setMode("mix"); setMode(undefined); }).not.toThrow();
    const session = { type: "auto" };
    Object.defineProperty(navigator, "audioSession", { value: session, configurable: true });
    try {
      setMode("loud"); expect(session.type).toBe("playback");
      setMode("mix"); expect(session.type).toBe("ambient");
      setMode(undefined); expect(session.type).toBe("ambient");
    } finally { delete navigator.audioSession; }
  });
});

describe("a phone that can't make the sound", () => {
  it("gets silence, never an error", () => {
    expect(() => { play("bell1"); play("bell2"); play("bell3"); play("go"); play("done"); play("no such sound"); beep(880, 120); beep(); cue.tick(); cue.warn(); cue.half(); wake(); rehearse(); }).not.toThrow();
    /* the engine is either whole or absent */
    const a = audio();
    expect(a === null || typeof a.createOscillator === "function").toBe(true);
  });
});
