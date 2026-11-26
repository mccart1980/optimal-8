/* ================================================================
   ONE SOUND ENGINE — every timer in the app plays through this, so
   they sound like one app and share one audio line to the phone.

   Nothing is downloaded: every sound is made here, from tones and noise,
   loud and long enough to hear across a gym. The two that matter most are
   the two a fight is run on: the timekeeper's wooden clapper, knocked three
   times with ten seconds left, and the ring bell, struck with a metal hammer.
     tick      the last three seconds of a part of 10 seconds or more
     warn      ten seconds left: of a round, a rest, or any part of 30 seconds
               or more. The clapper: three knocks.
     go        work starts (a burst, an interval)
     ease      rest, or the steady pace between bursts, starts
     change    the next part of the same round (minute 2 of a round)
     bell(n)   the ring bell: one for a round starting and for a rest clock
               running out, two for a round ending, three when a timer is done
     done      any other timer finished: the bell, three times
   beep(f, ms, vol) is the plain, quieter tone the movement, Iron Mind
   and kitchen timers use.

   On an iPhone a web app's sound is "ambient": it plays alongside your
   music and goes quiet when the ring switch is on silent. setMode("loud")
   asks the phone to play it anyway; the phone then stops other apps'
   music, which is the only way it allows.
   ================================================================ */
let ac = null, out = null, room = null, hiss = null;

export function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    if (!ac) {
      /* built whole or not at all: a phone that can't make one part gets silence, not half an engine.
         The last stage is a limiter, not a squash: the sounds go out near full volume, and two at once can't crackle. */
      const a = new AC(), gain = a.createGain(), limit = a.createDynamicsCompressor();
      limit.threshold.value = -2; limit.knee.value = 0; limit.ratio.value = 20; limit.attack.value = 0.002; limit.release.value = 0.15;
      gain.gain.value = 1; gain.connect(limit); limit.connect(a.destination);
      ac = a; out = gain;
      /* the extras: the noise the clapper and the hammer are made of, and the
         hall they ring in. A phone that can't make one gets the tones alone. */
      try { hiss = noiseOf(a); } catch (e) { hiss = null; }
      try { room = hallOf(a, gain); } catch (e) { room = null; }
    }
    /* a call, a lock or another app can stop the engine: start it again on the next sound */
    if (ac.state === "suspended" || ac.state === "interrupted") { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); }
  } catch (e) { return null; }
  return ac;
}

/* An iPhone only lets a stopped engine start again from a touch. So once
   it exists, any touch on the app that finds it stopped wakes it, with a
   sound too short to hear: a timer that runs on after the phone has been
   locked or another app opened still sounds. A running engine is left
   alone, so a touch never interrupts music. */
export function wake() {
  if (!ac) return false;
  try {
    if (ac.state === "running") return true;
    const p = ac.resume(); if (p && p.catch) p.catch(() => {});
    const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource();
    s.buffer = b; s.connect(ac.destination); s.start(0);
  } catch (e) { return false; }
  return true;
}
if (typeof window !== "undefined" && window.addEventListener) {
  ["pointerdown", "touchend", "keydown"].forEach((e) => window.addEventListener(e, wake, { capture: true, passive: true }));
  if (typeof document !== "undefined" && document.addEventListener) document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") wake(); });
}

export const MODES = [["mix", "STAY SILENT"], ["loud", "PLAY ANYWAY"]];
export function setMode(mode) {
  try { if (typeof navigator !== "undefined" && navigator.audioSession) navigator.audioSession.type = mode === "loud" ? "playback" : "ambient"; } catch (e) {}
}

/* a second of noise, the same every time (so the sounds are too): a
   clapper's crack and a hammer's clank are noise, shaped */
function noiseOf(a) {
  const n = Math.floor(a.sampleRate), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  let s = 22222;
  for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; }
  return b;
}
/* the hall: a sound's echo off the walls of a big room, dying away in
   about a second, mixed in quietly behind the clapper and the bell */
function hallOf(a, into) {
  const n = Math.floor(a.sampleRate * 1.1), b = a.createBuffer(2, n, a.sampleRate);
  let s = 777, e = 0;
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < n; i++) {
      s = (s * 16807) % 2147483647;
      const at = i / a.sampleRate;
      d[i] = at < 0.012 ? 0 : (s / 1073741823.5 - 1) * Math.exp(-at / 0.16);
      e += d[i] * d[i];
    }
  }
  /* scaled so the hall gives back as much as goes in, before its share is set */
  const k = 1 / Math.sqrt(e / 2);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] *= k; }
  const cv = a.createConvolver(), g = a.createGain();
  cv.normalize = false; cv.buffer = b; g.gain.value = 0.5;
  cv.connect(g); g.connect(into);
  return cv;
}
/* a sound's way out: straight out, and a share of it into the hall */
function send(c, g, wet) {
  g.connect(out);
  if (wet && room) { const s = c.createGain(); s.gain.value = wet; g.connect(s); s.connect(room); }
}

/* one tone: a pitch, when it starts (seconds from now), how long, and its
   shape. `flat` holds it at full volume and cuts it cleanly, the way a
   timer's beep should be; without it the tone dies away. `tau` makes it
   die away the way a struck thing does: losing the same share of itself
   every moment, to a thousandth of its start in about seven tau. */
function tone(f, at, dur, o) {
  const c = audio(); if (!c) return;
  const p = o || {}, t = c.currentTime + (at || 0), vol = p.vol == null ? 0.3 : p.vol, att = p.attack || 0.006;
  try {
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = p.type || "sine"; osc.frequency.setValueAtTime(f, t);
    if (p.to) osc.frequency.exponentialRampToValueAtTime(p.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + att);
    if (p.tau) g.gain.setTargetAtTime(0.0001, t + att, p.tau);
    else if (p.flat) { g.gain.setValueAtTime(vol, t + Math.max(att, dur - 0.03)); g.gain.linearRampToValueAtTime(0.0001, t + dur); }
    else g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); send(c, g, p.wet);
    osc.start(t); osc.stop(t + (p.tau ? Math.max(dur, p.tau * 7) : dur) + 0.05);
  } catch (e) {}
}

/* a burst of noise through a filter: `f` the pitch it's centred on, `q`
   how narrow, `tau` how fast it dies (as in tone), `hp` a high-pass in
   place of the band */
function crack(at, o) {
  const c = audio(); if (!c || !hiss) return;
  const p = o || {}, t = c.currentTime + (at || 0), vol = p.vol == null ? 0.5 : p.vol, tau = p.tau || 0.01;
  try {
    const src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    src.buffer = hiss;
    fl.type = p.hp ? "highpass" : "bandpass"; fl.frequency.setValueAtTime(p.f || 2000, t); fl.Q.setValueAtTime(p.q || 1, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.0007);
    g.gain.setTargetAtTime(0.0001, t + 0.0007, tau);
    src.connect(fl); fl.connect(g); send(c, g, p.wet);
    src.start(t, p.from || 0); src.stop(t + tau * 8 + 0.02);
  } catch (e) {}
}

/* a beep that carries over gym noise: a square wave for its edge, and a
   sine an octave down for body */
function blip(f, at, dur, vol) {
  tone(f, at, dur, { type: "square", vol: vol * 0.45, flat: true });
  tone(f / 2, at, dur, { vol, flat: true });
}

/* THE CLAPPER: two hardwood boards slapped together on the ring apron. One
   knock is a crack of noise, sharpest around 2 kHz, gone in a few hundredths
   of a second, with the short hollow note of the wood inside it and a
   little of the hall after it. */
function knock(at, k, n) {
  const from = 0.11 * n;
  crack(at, { f: 1900, q: 0.8, tau: 0.013, vol: 2.5 * k, wet: 0.5, from });
  crack(at, { f: 4300, q: 1.3, tau: 0.006, vol: 1.3 * k, wet: 0.3, from: from + 0.05 });
  crack(at, { f: 820, q: 1.6, tau: 0.026, vol: 1.7 * k, wet: 0.45, from: from + 0.02 });
  tone(1180, at, 0.05, { vol: 0.6 * k, attack: 0.0008, tau: 0.035, wet: 0.35 });
  tone(2140, at, 0.04, { vol: 0.3 * k, attack: 0.0008, tau: 0.018, wet: 0.25 });
  tone(430, at, 0.05, { vol: 0.5 * k, attack: 0.0008, tau: 0.025 });
}
/* three knocks, a quarter of a second apart: ten seconds left */
const KNOCKS = [[0, 1], [0.25, 0.93], [0.5, 0.97]];

/* THE RING BELL: a brass gong struck with a metal hammer. A struck bell
   is a handful of notes that don't make a chord (1, 2.76, 5.4, 8.9 and
   13.3 times the lowest), each dying away at its own speed, the high ones
   first. Each note is really two a hair apart, which is what makes a real
   bell shimmer as it rings. The hammer adds a clank of noise at the start. */
const BELL_HZ = 650;
const BELL = [[1, 0.46, 0.95], [1.0028, 0.17, 0.85], [2.756, 0.46, 0.6], [2.7595, 0.16, 0.52], [5.404, 0.27, 0.3], [5.414, 0.09, 0.27],
  [8.933, 0.15, 0.17], [13.34, 0.08, 0.1], [18.64, 0.04, 0.06]];
function strike(at, k) {
  crack(at, { f: 5200, q: 0.7, tau: 0.004, vol: 0.5 * k, wet: 0.3 });
  crack(at, { f: 2600, q: 3, tau: 0.008, vol: 0.28 * k, wet: 0.3, from: 0.4 });
  BELL.forEach(([m, vol, tau]) => tone(BELL_HZ * m, at, 0.2, { vol: vol * k, attack: 0.0015, tau, wet: 0.35 }));
}

export const cue = {
  tick: () => blip(1000, 0, 0.15, 0.55),
  warn: () => KNOCKS.forEach(([a, k], n) => knock(a, k, n)),
  go: () => { blip(880, 0, 0.14, 0.5); blip(1319, 0.16, 0.34, 0.6); },
  ease: () => { blip(784, 0, 0.16, 0.5); blip(523, 0.18, 0.4, 0.55); },
  change: () => { blip(1175, 0, 0.12, 0.5); blip(1175, 0.18, 0.14, 0.5); },
  half: () => blip(880, 0, 0.25, 0.45),
  bell: (n) => { for (let i = 0; i < (n || 1); i++) strike(i * 0.42, n > 1 ? 0.8 : 1); },        // two or three strikes ring on into each other: each a little softer
  done: () => cue.bell(3),
};

/* the plain tone: a pitch, its length in milliseconds, how loud */
export function beep(f, ms, vol) { tone(f, 0, (ms || 120) / 1000, { vol: vol || 0.3 }); }

/* A part of a round: its work, or the steady pace between its bursts (a
   part marked `inR`). A rest that isn't marked is a real rest between rounds. */
export const inRound = (p) => !!p && (p.t === "w" || !!p.inR);

/* which cue a timer's next part gets. `rounds` is a timer of boxing
   rounds: the bell starts and ends each round; inside a round, a burst
   starts on the work sound, the steady pace after it on the rest sound,
   and the next minute of a round on a quieter double beep. */
export function cueFor(prev, next, rounds) {
  if (!next) return rounds ? "bell3" : "done";
  if (rounds) {
    if (inRound(next)) {
      if (!inRound(prev)) return "bell1";
      if (next.t !== "w") return "ease";
      return prev.t === "w" ? "change" : "go";
    }
    return inRound(prev) ? "bell2" : "ease";
  }
  return next.t === "w" ? "go" : "ease";
}

/* What a timer does at a second: `steps` its parts, `i` the one it's on,
   `rem` that part's seconds left. The ten seconds count to the end of the
   round on a timer of rounds, and to the end of the part on anything
   else; they're marked on anything of 30 seconds or more.
     tick   the 3-2-1, on a part of 10 seconds or more
     warn   this is the tenth second left
     ten    inside the last ten seconds
     left   seconds to the end of the round, or of the part */
export function beatAt(steps, i, rem, rounds) {
  const here = steps && steps[i];
  if (!here || !(rem > 0)) return { tick: false, warn: false, ten: false, left: 0 };
  let left = rem, len = here.s;
  if (rounds && inRound(here)) {
    for (let k = i + 1; k < steps.length && inRound(steps[k]); k++) { left += steps[k].s; len += steps[k].s; }
    for (let k = i - 1; k >= 0 && inRound(steps[k]); k--) len += steps[k].s;
  }
  const long = len >= 30;
  return { tick: rem <= 3 && here.s >= 10, warn: long && left === 10, ten: long && left <= 10, left };
}

export function play(name) {
  if (name === "bell1") cue.bell(1); else if (name === "bell2") cue.bell(2); else if (name === "bell3") cue.bell(3);
  else if (cue[name]) cue[name]();
}

/* the test in the settings: every sound a timer makes, in the order a
   round meets them — the bell to start, the clapper at ten seconds, the
   3-2-1, the bell to end */
export const REHEARSAL = [[0, "bell1"], [2400, "warn"], [3700, "tick"], [4200, "tick"], [4700, "tick"], [5200, "bell2"]];
export function rehearse() {
  REHEARSAL.forEach(([ms, n]) => (ms ? setTimeout(() => play(n), ms) : play(n)));
}
