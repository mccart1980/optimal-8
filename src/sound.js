/* ================================================================
   ONE SOUND ENGINE — every timer in the app plays through this, so
   they sound like one app and share one audio line to the phone.

   Nothing is downloaded: every sound is made here, from a few tones.
     tick      the last three seconds
     go        work starts
     ease      rest starts
     change    the next part of the same round
     warn      ten seconds of a round left
     bell(n)   the ring bell: one for a round starting, two for it ending
     done      the whole timer finished
   beep(f, ms, vol) is the plain tone the older timers ask for.

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
      /* built whole or not at all: a phone that can't make one part gets silence, not half an engine */
      const a = new AC(), gain = a.createGain(), squash = a.createDynamicsCompressor();
      gain.gain.value = 0.9; gain.connect(squash); squash.connect(a.destination);
      ac = a; out = gain;
    }
    /* a call, a lock or another app can stop the engine: start it again on the next sound */
    if (ac.state === "suspended" || ac.state === "interrupted") { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); }
  } catch (e) { return null; }
  return ac;
}

export const MODES = [["mix", "STAY SILENT"], ["loud", "PLAY ANYWAY"]];
export function setMode(mode) {
  try { if (typeof navigator !== "undefined" && navigator.audioSession) navigator.audioSession.type = mode === "loud" ? "playback" : "ambient"; } catch (e) {}
}

/* one tone: a pitch, when it starts (seconds from now), how long, and its shape */
function tone(f, at, dur, o) {
  const c = audio(); if (!c) return;
  const p = o || {}, t = c.currentTime + (at || 0), vol = p.vol == null ? 0.3 : p.vol;
  try {
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = p.type || "sine"; osc.frequency.setValueAtTime(f, t);
    if (p.to) osc.frequency.exponentialRampToValueAtTime(p.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (p.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + dur + 0.05);
  } catch (e) {}
}

/* the ring bell: a struck bell is one low note and a handful of
   higher ones that don't quite agree, each dying away at its own speed */
const BELL = [[1, 0.5, 1.5], [2, 0.28, 1.1], [2.76, 0.24, 0.9], [5.4, 0.1, 0.5], [8.93, 0.05, 0.3]];
function strike(at) {
  tone(2600, at, 0.03, { type: "square", vol: 0.07 });
  BELL.forEach(([k, vol, dur]) => tone(587 * k, at, dur, { vol, attack: 0.003 }));
}

export const cue = {
  tick: () => tone(1320, 0, 0.07, { type: "triangle", vol: 0.24 }),
  go: () => { tone(784, 0, 0.12, { type: "triangle", vol: 0.3 }); tone(1175, 0.1, 0.3, { type: "triangle", vol: 0.34 }); },
  ease: () => { tone(659, 0, 0.16, { vol: 0.26 }); tone(494, 0.14, 0.38, { vol: 0.26 }); },
  change: () => { tone(988, 0, 0.09, { type: "triangle", vol: 0.24 }); tone(988, 0.13, 0.12, { type: "triangle", vol: 0.24 }); },
  half: () => tone(880, 0, 0.2, { vol: 0.22 }),
  warn: () => { tone(1800, 0, 0.05, { type: "square", vol: 0.1 }); tone(1800, 0.16, 0.05, { type: "square", vol: 0.1 }); tone(1800, 0.32, 0.05, { type: "square", vol: 0.1 }); },
  bell: (n) => { for (let i = 0; i < (n || 1); i++) strike(i * 0.4); },
  done: () => { [523, 659, 784].forEach((f, i) => tone(f, i * 0.11, 0.2, { type: "triangle", vol: 0.28 })); tone(1047, 0.33, 0.7, { type: "triangle", vol: 0.32 }); },
};

/* the plain tone: a pitch, its length in milliseconds, how loud */
export function beep(f, ms, vol) { tone(f, 0, (ms || 120) / 1000, { vol: vol || 0.3 }); }

/* which cue a timer's next part gets. `rounds` is a timer of boxing
   rounds: the bell starts and ends each round, and the parts inside a
   round change on a quieter sound. */
export function cueFor(prev, next, rounds) {
  if (!next) return rounds ? "bell3" : "done";
  if (next.t === "w") return rounds ? (prev && prev.t === "w" ? "change" : "bell1") : "go";
  return rounds && prev && prev.t === "w" ? "bell2" : "ease";
}
export function play(name) {
  if (name === "bell1") cue.bell(1); else if (name === "bell2") cue.bell(2); else if (name === "bell3") cue.bell(3);
  else if (cue[name]) cue[name]();
}
