/* ================================================================
   ONE SOUND ENGINE — every timer in the app plays through this, so
   they sound like one app and share one audio line to the phone.

   Nothing is downloaded: every sound is made here, from a few tones,
   loud and long enough to hear across a gym.
     tick      the last three seconds of a part of 10 seconds or more
     warn      ten seconds left: of a round, a rest, or any part of 30 seconds or more
     go        work starts (a burst, an interval, the end of a rest clock)
     ease      rest, or the steady pace between bursts, starts
     change    the next part of the same round (minute 2 of a round)
     bell(n)   the ring bell: one for a round starting, two for it ending,
               three when the timer is finished
     done      any other timer finished
   beep(f, ms, vol) is the plain, quieter tone the movement, Iron Mind
   and kitchen timers use.

   On an iPhone a web app's sound is "ambient": it plays alongside your
   music and goes quiet when the ring switch is on silent. setMode("loud")
   asks the phone to play it anyway; the phone then stops other apps'
   music, which is the only way it allows.
   ================================================================ */
let ac = null, out = null;

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

/* one tone: a pitch, when it starts (seconds from now), how long, and its
   shape. `flat` holds it at full volume and cuts it cleanly, the way a
   timer's beep should be; without it the tone dies away, like a bell. */
function tone(f, at, dur, o) {
  const c = audio(); if (!c) return;
  const p = o || {}, t = c.currentTime + (at || 0), vol = p.vol == null ? 0.3 : p.vol, att = p.attack || 0.006;
  try {
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = p.type || "sine"; osc.frequency.setValueAtTime(f, t);
    if (p.to) osc.frequency.exponentialRampToValueAtTime(p.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + att);
    if (p.flat) { g.gain.setValueAtTime(vol, t + Math.max(att, dur - 0.03)); g.gain.linearRampToValueAtTime(0.0001, t + dur); }
    else g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + dur + 0.05);
  } catch (e) {}
}

/* a beep that carries over gym noise: a square wave for its edge, and a
   sine an octave down for body */
function blip(f, at, dur, vol) {
  tone(f, at, dur, { type: "square", vol: vol * 0.45, flat: true });
  tone(f / 2, at, dur, { vol, flat: true });
}

/* the ring bell: a struck bell is one low note and a handful of
   higher ones that don't quite agree, each dying away at its own speed */
const BELL = [[1, 0.68, 1.6], [2, 0.38, 1.2], [2.76, 0.32, 1], [5.4, 0.14, 0.55], [8.93, 0.07, 0.35]];
function strike(at, k) {
  tone(2600, at, 0.04, { type: "square", vol: 0.17 * k });
  BELL.forEach(([m, vol, dur]) => tone(587 * m, at, dur, { vol: vol * k, attack: 0.003 }));
}

export const cue = {
  tick: () => blip(1000, 0, 0.15, 0.55),
  warn: () => [0, 0.2, 0.4].forEach((a) => blip(1568, a, 0.12, 0.55)),
  go: () => { blip(880, 0, 0.14, 0.5); blip(1319, 0.16, 0.34, 0.6); },
  ease: () => { blip(784, 0, 0.16, 0.5); blip(523, 0.18, 0.4, 0.55); },
  change: () => { blip(1175, 0, 0.12, 0.5); blip(1175, 0.18, 0.14, 0.5); },
  half: () => blip(880, 0, 0.25, 0.45),
  bell: (n) => { for (let i = 0; i < (n || 1); i++) strike(i * 0.45, n > 1 ? 0.74 : 1); },        // two or three strikes ring on into each other: each a little softer
  done: () => { [523, 659, 784].forEach((f, i) => blip(f * 2, i * 0.13, 0.14, 0.45)); blip(2093, 0.4, 0.6, 0.5); },
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
   round meets them — the bell, the 10-second warning, the 3-2-1, the go */
export function rehearse() {
  play("bell1");
  [[1600, "warn"], [2700, "tick"], [3200, "tick"], [3700, "tick"], [4200, "go"]].forEach(([ms, n]) => setTimeout(() => play(n), ms));
}
