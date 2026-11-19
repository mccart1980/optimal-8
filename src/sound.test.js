import { describe, it, expect } from "vitest";
import { cueFor, play, beep, cue, audio, setMode, MODES } from "./sound.js";

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
    expect(() => { play("bell1"); play("bell2"); play("bell3"); play("go"); play("done"); play("no such sound"); beep(880, 120); beep(); cue.tick(); cue.warn(); cue.half(); }).not.toThrow();
    /* the engine is either whole or absent */
    const a = audio();
    expect(a === null || typeof a.createOscillator === "function").toBe(true);
  });
});
