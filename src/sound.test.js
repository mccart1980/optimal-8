import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { cueFor, beatAt, inRound, play, beep, cue, audio, wake, rehearse, setMode, MODES, REHEARSAL } from "./sound.js";

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

/* THE CLAPPER AND THE BELL, as the engine plays them: a pretend engine that
   writes down every sound it's asked to make. It's last in this file because
   the engine, once built, is kept. */
describe("the clapper and the bell", () => {
  /* the engine needs a window to live in (the test browser has one; a run without one gets one for this block), with the pretend engine in it */
  let made = false, was;
  beforeAll(() => { if (typeof window === "undefined") { globalThis.window = {}; made = true; } was = window.AudioContext; window.AudioContext = Pretend; });
  afterAll(() => { window.AudioContext = was; if (made) delete globalThis.window; });
  const log = [];
  class Param { constructor() { this.value = 0; this.ev = []; } setValueAtTime(v, t) { this.ev.push(["set", v, t]); } linearRampToValueAtTime(v, t) { this.ev.push(["lin", v, t]); }
    exponentialRampToValueAtTime(v, t) { this.ev.push(["exp", v, t]); } setTargetAtTime(v, t, k) { this.ev.push(["die", v, t, k]); } }
  class Node { constructor(kind, more) { Object.assign(this, { kind, to: [] }, more); log.push(this); } connect(n) { this.to.push(n); return n; } start(t, from) { this.at = t; this.from = from || 0; } stop(t) { this.end = t; } }
  class Pretend {
    constructor() { Object.assign(this, { currentTime: 0, sampleRate: 8000, state: "running", destination: { kind: "speaker" } }); }
    resume() { return Promise.resolve(); }
    createGain() { return new Node("gain", { gain: new Param() }); }
    createDynamicsCompressor() { return new Node("limit", { threshold: new Param(), knee: new Param(), ratio: new Param(), attack: new Param(), release: new Param() }); }
    createOscillator() { return new Node("tone", { type: "sine", frequency: new Param() }); }
    createBufferSource() { return new Node("noise"); }
    createBiquadFilter() { return new Node("filter", { type: "lowpass", frequency: new Param(), Q: new Param() }); }
    createConvolver() { return new Node("hall"); }
    createBuffer(ch, n, rate) { const d = Array.from({ length: ch }, () => new Float32Array(n)); return { length: n, sampleRate: rate, getChannelData: (i) => d[i] }; }
  }
  const heard = (fn) => { log.length = 0; fn(); return log.filter((n) => n.at != null); };
  const at = (xs) => [...new Set(xs.map((n) => Math.round(n.at * 1000) / 1000))].sort((a, b) => a - b);
  const hz = (n) => n.frequency.ev[0][1];
  const loud = (n) => n.to[0].gain.ev.find((e) => e[0] === "exp")[1];
  const dies = (n) => n.to[0].gain.ev.find((e) => e[0] === "die")[3];

  it("the engine is built once, with the hall: its echo gives back as much as goes in, after a moment's quiet", () => {
    log.length = 0;
    expect(audio()).toBeInstanceOf(Pretend);
    const hall = log.find((n) => n.kind === "hall");
    expect(hall.normalize).toBe(false);
    const energy = [0, 1].map((ch) => hall.buffer.getChannelData(ch).reduce((s, v) => s + v * v, 0));
    expect((energy[0] + energy[1]) / 2).toBeCloseTo(1, 6);
    expect([...hall.buffer.getChannelData(0).slice(0, Math.floor(8000 * 0.012))].every((v) => v === 0)).toBe(true);
    expect(audio()).toBeInstanceOf(Pretend);
  });

  it("ten seconds left is the clapper: three knocks a quarter of a second apart, each a crack of wood, no beep in it", () => {
    const ac = audio(); ac.currentTime = 10;
    const s = heard(() => play("warn"));
    const noise = s.filter((n) => n.kind === "noise"), tones = s.filter((n) => n.kind === "tone");
    expect(at(noise)).toEqual([10, 10.25, 10.5]);
    expect(noise.length).toBe(9);
    noise.forEach((n) => expect(n.to[0]).toMatchObject({ kind: "filter", type: "bandpass" }));
    expect(tones.every((n) => n.type === "sine")).toBe(true);
    /* every knock is over in a moment: the wood's note dies within a fifth of a second */
    tones.forEach((n) => expect(n.end - n.at).toBeLessThan(0.3));
    ac.currentTime = 0;
  });

  it("the bell: a metal hammer, then a struck gong's notes, none a whole number of times the lowest, the high ones dying first", () => {
    const s = heard(() => play("bell1"));
    const tones = s.filter((n) => n.kind === "tone"), noise = s.filter((n) => n.kind === "noise");
    expect(at(s)).toEqual([0]);
    expect(noise.length).toBe(2);
    const f = tones.map(hz);
    expect(f[0]).toBe(650);
    expect(f.map((x) => Math.round(x / 650 * 100) / 100)).toEqual([1, 1, 2.76, 2.76, 5.4, 5.41, 8.93, 13.34, 18.64]);
    /* each note has a twin a hair away: the shimmer */
    expect([f[1] - f[0], f[3] - f[2]].map((d) => d > 1 && d < 3)).toEqual([true, true]);
    const main = [0, 2, 4, 6, 7, 8].map((i) => dies(tones[i]));
    main.slice(1).forEach((k, i) => expect(k).toBeLessThan(main[i]));
    /* the lowest rings on for seconds */
    expect(tones[0].end).toBeGreaterThan(5);
  });

  it("two rings as a round ends, three when a timer is done, each a little softer; any other timer ends on the bell too", () => {
    const one = heard(() => play("bell1")).filter((n) => n.kind === "tone");
    const two = heard(() => play("bell2")).filter((n) => n.kind === "tone");
    const three = heard(() => play("bell3")).filter((n) => n.kind === "tone");
    const done = heard(() => play("done")).filter((n) => n.kind === "tone");
    expect([at(two), at(three), at(done)]).toEqual([[0, 0.42], [0, 0.42, 0.84], [0, 0.42, 0.84]]);
    expect(loud(three[0])).toBeLessThan(loud(one[0]));
    expect(done.map(hz)).toEqual(three.map(hz));
  });

  it("the test in Settings plays them in the order a round meets them", () => {
    expect(REHEARSAL.map((x) => x[1])).toEqual(["bell1", "warn", "tick", "tick", "tick", "bell2"]);
    expect(REHEARSAL.map((x) => x[0])).toEqual([...REHEARSAL.map((x) => x[0])].sort((a, b) => a - b));
  });

  it("a phone that can't shape the noise still gets the notes of the clapper and the bell, and never an error", () => {
    const ac = audio(), keep = ac.createBiquadFilter;
    ac.createBiquadFilter = () => { throw new Error("none"); };
    try {
      const s = heard(() => { play("warn"); play("bell2"); });
      expect(s.filter((n) => n.kind === "tone").length).toBe(3 * 3 + 2 * 9);
    } finally { ac.createBiquadFilter = keep; }
  });
});
