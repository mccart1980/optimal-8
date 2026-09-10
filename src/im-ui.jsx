import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { C, dsp, bdy, mno, num, mmss, buzz, Card, Eye, Lab, Fld, Btn, Chip, Note, Seg, Tick, OpenBtn } from "./ui.jsx";
import {
  SAFETY, CARDINAL, FLOOR_TEXT, NEVER_TWICE, ONE_THING_Q, REVIEW_Q, SIGH_HOW, ONE_THING_HOW, REVIEW_HOW,
  SITE, NOSE_ALL_DAY, WALKING, BREATH_STAGE, PRESETS, presetById, MED_STAGE, HOW_TO_SIT, THE_CATCH,
  GOODWILL_LINE, DEATH_LINE, ELEVEN, GUIDED, guidedById, LADDER, CEILING, ARROWS, TESTS5, COLLISION,
  GATES, PROGRESSION, dayDone, sitPlan, testForWeek,
} from "./im-data.js";

/* ================================================================
   BELLS — Web Audio only, no audio files. Vibration where available.
   ================================================================ */
export function useBells(sound) {
  const ctxRef = useRef(null);
  const tone = useCallback((f, ms, vol) => { if (!sound) return; try {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current; if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime; g.gain.setValueAtTime(vol == null ? 0.28 : vol, now); g.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);
    o.start(now); o.stop(now + ms / 1000 + 0.03);
  } catch (e) {} }, [sound]);
  const bell = useCallback((kind) => {
    if (kind === "in") { tone(660, 160); buzz(60); }
    else if (kind === "out") { tone(440, 220); buzz(40); }
    else if (kind === "hold" || kind === "empty") { tone(880, 90, .16); buzz(25); }
    else if (kind === "seg") { tone(523, 200); setTimeout(() => tone(784, 320), 180); buzz([120, 60, 120]); }
    else if (kind === "done") { tone(523, 200); setTimeout(() => tone(659, 200), 190); setTimeout(() => tone(784, 480), 380); buzz([150, 80, 150, 80, 320]); }
    else { tone(700, 120); buzz(35); }
  }, [tone]);
  return bell;
}

/* ================================================================
   RUNNER — one timestamp-based engine behind every Iron Mind timer.
   Holds a screen wake lock for as long as it is running.
   ================================================================ */
export function useRunner(steps, sound, onFinish) {
  const [s, setS] = useState({ i: 0, left: steps[0] ? steps[0].s : 0, run: false, done: false });
  const sRef = useRef(s); sRef.current = s;
  const stepsRef = useRef(steps); stepsRef.current = steps;
  const endRef = useRef(0), lockRef = useRef(null), finRef = useRef(onFinish);
  finRef.current = onFinish;
  const bell = useBells(sound);

  useEffect(() => { setS({ i: 0, left: steps[0] ? steps[0].s : 0, run: false, done: false }); }, [steps]);

  const lock = useCallback(async (on) => { try {
    if (on) { if (!lockRef.current && navigator.wakeLock) { lockRef.current = await navigator.wakeLock.request("screen"); lockRef.current.addEventListener("release", () => { lockRef.current = null; }); } }
    else if (lockRef.current) { await lockRef.current.release(); lockRef.current = null; }
  } catch (e) {} }, []);
  useEffect(() => () => { lock(false); }, [lock]);

  useEffect(() => {
    if (!s.run || s.done) { lock(false); return; }
    lock(true);
    const id = setInterval(() => {
      const cur = sRef.current, list = stepsRef.current;
      if (!cur.run) return;
      const rem = Math.ceil((endRef.current - Date.now()) / 1000);
      if (rem <= 0) {
        const n = cur.i + 1;
        if (n < list.length) { endRef.current = Date.now() + list[n].s * 1000; bell(list[n].k || "seg"); setS({ i: n, left: list[n].s, run: true, done: false }); }
        else { bell("done"); setS({ i: cur.i, left: 0, run: false, done: true }); if (finRef.current) finRef.current(); }
      } else if (rem !== cur.left) setS(Object.assign({}, cur, { left: rem }));
    }, 200);
    return () => clearInterval(id);
  }, [s.run, s.i, s.done, lock, bell]);

  const start = useCallback(() => { const cur = sRef.current, list = stepsRef.current; if (cur.done || !list.length) return;
    endRef.current = Date.now() + cur.left * 1000; bell(list[cur.i] ? (list[cur.i].k || "seg") : "seg"); setS(Object.assign({}, cur, { run: true })); }, [bell]);
  const pause = useCallback(() => setS(Object.assign({}, sRef.current, { run: false })), []);
  const skip = useCallback(() => { const cur = sRef.current, list = stepsRef.current; const n = cur.i + 1;
    if (n < list.length) { endRef.current = Date.now() + list[n].s * 1000; setS({ i: n, left: list[n].s, run: cur.run, done: false }); }
    else { setS({ i: cur.i, left: 0, run: false, done: true }); if (finRef.current) finRef.current(); } }, []);
  const reset = useCallback(() => { const list = stepsRef.current; setS({ i: 0, left: list[0] ? list[0].s : 0, run: false, done: false }); }, []);

  const elapsed = useMemo(() => steps.slice(0, s.i).reduce((a, x) => a + x.s, 0) + ((steps[s.i] ? steps[s.i].s : 0) - s.left), [steps, s.i, s.left]);
  const total = useMemo(() => steps.reduce((a, x) => a + x.s, 0), [steps]);
  return { s, start, pause, skip, reset, endRef, sRef, elapsed, total, bell };
}

const reduced = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

/* ================================================================
   PACER — the circle. Grows on the inhale, holds, shrinks on the exhale.
   ================================================================ */
export function Pacer({ steps, sound, title, sub, colour, onClose, onFinish, footer }) {
  const R = useRunner(steps, sound, onFinish);
  const { s } = R;
  const cur = steps[s.i] || { l: "COMPLETE", s: 1, k: "free" };
  const ball = useRef(null);
  const { sRef, endRef } = R;
  useEffect(() => {
    if (reduced()) { if (ball.current) ball.current.style.transform = "scale(.8)"; return; }
    let raf; const tick = () => {
      const st = sRef.current, c = steps[st.i];
      if (ball.current && c) {
        const tot = c.s || 1;
        const rem = st.run ? Math.max(0, (endRef.current - Date.now()) / 1000) : st.left;
        const f = Math.min(1, Math.max(0, 1 - rem / tot));
        let sc = .8;
        if (c.k === "in") sc = .40 + .60 * f;
        else if (c.k === "out") sc = 1 - .60 * f;
        else if (c.k === "hold") sc = 1;
        else if (c.k === "empty") sc = .40;
        else sc = .70 + .06 * Math.sin(f * Math.PI * 2 * Math.max(1, tot / 12));
        if (st.done) sc = .8;
        ball.current.style.transform = "scale(" + sc.toFixed(4) + ")";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [steps, sRef, endRef]);

  const col = colour || C.cobalt;
  const nxt = steps[s.i + 1];
  return (
    <div style={{ position: "fixed", inset: 0, background: C.ink, zIndex: 120, display: "flex", flexDirection: "column", padding: 16, paddingTop: "calc(16px + env(safe-area-inset-top))", paddingBottom: "calc(16px + env(safe-area-inset-bottom))", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ minWidth: 0 }}>
          <div style={Object.assign({}, mno, { fontSize: 10, color: col, letterSpacing: 1.4 })}>{title}</div>
          {sub ? <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, letterSpacing: 1, marginTop: 2 })}>{sub}</div> : null}
        </span>
        <Btn on={onClose} c={C.ash} small s={{ minWidth: 44 }} label="Close timer">CLOSE</Btn>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", minHeight: 320, padding: "18px 0" }}>
        <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, border: "1px solid " + C.line }} />
          <div ref={ball} style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, background: col, opacity: .17, willChange: "transform" }} />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={Object.assign({}, mno, { fontSize: 54, fontWeight: 700, color: s.done ? C.moss : C.chalk, lineHeight: 1, letterSpacing: -2 })}>{s.done ? "✓" : mmss(s.left)}</div>
          </div>
        </div>
        <div style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 700, letterSpacing: 1.4, color: s.done ? C.moss : col, marginTop: 20, padding: "0 8px", lineHeight: 1.15 })}>{s.done ? "COMPLETE" : cur.l}</div>
        <div style={Object.assign({}, mno, { fontSize: 10, color: C.ash, marginTop: 10, letterSpacing: 1.1 })}>
          {s.done ? mmss(R.total) + " TOTAL" : "STEP " + (s.i + 1) + " / " + steps.length + " · " + mmss(R.total - R.elapsed) + " LEFT"}
        </div>
        {!s.done && nxt ? <div style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, marginTop: 6 })}>NEXT · {nxt.l}</div> : null}
      </div>

      {footer || null}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Btn on={R.reset} c={C.ash} s={{ flex: 1, padding: "16px 0" }}>RESET</Btn>
        <Btn on={s.run ? R.pause : R.start} c={col} fill={!s.run && !s.done} dis={s.done} s={{ flex: 2, padding: "16px 0", fontSize: 17 }}>{s.done ? "DONE" : s.run ? "PAUSE" : "START"}</Btn>
        <Btn on={R.skip} c={C.ash} dis={s.done} s={{ flex: 1, padding: "16px 0" }}>SKIP</Btn>
      </div>
    </div>);
}

/* A count-up stopwatch, timestamp-based. Used by BOLT and the cold drill. */
function useStopwatch() {
  const [ms, setMs] = useState(0); const [run, setRun] = useState(false);
  const t0 = useRef(0), acc = useRef(0), lockRef = useRef(null);
  useEffect(() => { if (!run) { if (lockRef.current) { try { lockRef.current.release(); } catch (e) {} lockRef.current = null; } return; }
    (async () => { try { if (navigator.wakeLock) lockRef.current = await navigator.wakeLock.request("screen"); } catch (e) {} })();
    const id = setInterval(() => setMs(acc.current + (Date.now() - t0.current)), 100);
    return () => clearInterval(id); }, [run]);
  useEffect(() => () => { if (lockRef.current) { try { lockRef.current.release(); } catch (e) {} lockRef.current = null; } }, []);
  const start = () => { t0.current = Date.now(); setRun(true); };
  const stop = () => { acc.current += Date.now() - t0.current; setMs(acc.current); setRun(false); };
  const reset = () => { acc.current = 0; setMs(0); setRun(false); };
  return { secs: Math.floor(ms / 1000), run, start, stop, reset };
}

/* ================================================================
   THE TOOLS — each one is a full-screen sheet
   ================================================================ */
function Sheet({ title, sub, colour, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: C.ink, zIndex: 120, overflowY: "auto", padding: 16, paddingTop: "calc(16px + env(safe-area-inset-top))", paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ minWidth: 0 }}>
            <div style={Object.assign({}, dsp, { fontSize: 22, fontWeight: 800, letterSpacing: 1.2, color: C.chalk, lineHeight: 1.1 })}>{title}</div>
            {sub ? <div style={Object.assign({}, mno, { fontSize: 9, color: colour || C.ash, letterSpacing: 1.2, marginTop: 3 })}>{sub}</div> : null}
          </span>
          <Btn on={onClose} c={C.ash} small s={{ minWidth: 44 }} label="Close">CLOSE</Btn>
        </div>
        {children}
      </div>
    </div>);
}

/* --- BOLT: a stopwatch stopped by tap, saved to the week --- */
export function BoltTool({ sound, onSave, current, onClose }) {
  const sw = useStopwatch();
  const bell = useBells(sound);
  const P = presetById("bolt");
  return (
    <Sheet title="BOLT SCORE" sub="SUNDAY ON WAKING · BEFORE THE SIGHS" colour={C.cobalt} onClose={onClose}>
      <Card ac={C.cobalt}><Note c={C.chalk} s={{ marginTop: 0 }}>{P.how}</Note></Card>
      <Card>
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={Object.assign({}, mno, { fontSize: 66, fontWeight: 700, color: sw.run ? C.chalk : C.cobalt, lineHeight: 1 })}>{sw.secs}<span style={{ fontSize: 18, color: C.ash }}>s</span></div>
        </div>
        {!sw.run && sw.secs === 0
          ? <Btn on={() => { sw.start(); bell("in"); }} c={C.cobalt} fill s={{ width: "100%", padding: "22px 0", fontSize: 18 }}>PINCH THE NOSE — START</Btn>
          : sw.run
            ? <Btn on={() => { sw.stop(); bell("done"); }} c={C.oxide} fill s={{ width: "100%", padding: "26px 0", fontSize: 20 }}>FIRST DEFINITE URGE — STOP</Btn>
            : <div style={{ display: "flex", gap: 8 }}>
                <Btn on={sw.reset} c={C.ash} s={{ flex: 1 }}>AGAIN</Btn>
                <Btn on={() => { onSave(sw.secs); onClose(); }} c={C.cobalt} fill s={{ flex: 2 }}>SAVE {sw.secs}s TO THIS WEEK</Btn>
              </div>}
        {current != null ? <Note>This week on file: <span style={{ color: C.cobalt }}>{current}s</span></Note> : null}
        <Note c={C.oxide}>Gasp on release and it didn't count.</Note>
      </Card>
    </Sheet>);
}

/* --- The 60-second settle, with a seconds-to-land entry --- */
export function SettleTool({ sound, onSave, onClose, saved }) {
  const steps = useMemo(() => [{ k: "free", l: "EYES CLOSED — FIND THE BREATH AT THE NOSTRILS", s: 60 }], []);
  const R = useRunner(steps, sound, null);
  const [landed, setLanded] = useState(saved == null ? "" : String(saved));
  const P = presetById("settle");
  const stamp = () => { const el = 60 - R.s.left; setLanded(String(Math.max(0, Math.round(el)))); buzz(40); };
  return (
    <Sheet title="THE 60-SECOND SETTLE" sub={P.tag} colour={C.brass} onClose={onClose}>
      <Card ac={C.brass}><Note c={C.chalk} s={{ marginTop: 0 }}>{P.how}</Note></Card>
      <Card>
        <div style={{ textAlign: "center" }}>
          <div style={Object.assign({}, mno, { fontSize: 62, fontWeight: 700, color: R.s.done ? C.moss : C.chalk, lineHeight: 1 })}>{R.s.done ? "✓" : mmss(R.s.left)}</div>
          <div style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 700, letterSpacing: 1.2, color: C.brass, marginTop: 8 })}>{R.s.done ? "SIXTY SECONDS DONE" : "FIND THE BREATH AT THE NOSTRILS"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Btn on={R.s.run ? R.pause : R.start} c={C.brass} fill={!R.s.run && !R.s.done} dis={R.s.done} s={{ flex: 1, padding: "16px 0" }}>{R.s.done ? "DONE" : R.s.run ? "PAUSE" : "START"}</Btn>
          <Btn on={stamp} c={C.moss} fill dis={!R.s.run} s={{ flex: 1, padding: "16px 0" }}>LANDED</Btn>
        </div>
        <div style={{ marginTop: 14 }}>
          <Lab>Seconds it took to land there</Lab>
          <Fld v={landed} on={setLanded} ph="—" />
        </div>
        <Btn on={() => { onSave(num(landed)); onClose(); }} c={C.brass} fill dis={num(landed) == null} s={{ width: "100%", marginTop: 10 }}>SAVE AND CLOSE</Btn>
      </Card>
    </Sheet>);
}

/* --- Wim Hof rounds — breaths, empty hold, 15-second recovery hold --- */
export function WimHof({ sound, onClose }) {
  const P = presetById("wimhof");
  const [ack, setAck] = useState(false);
  const [phase, setPhase] = useState("breaths"); /* breaths | empty | recovery | light | done */
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(20);
  const [rounds, setRounds] = useState(2);
  const [breath, setBreath] = useState(0);
  const [holds, setHolds] = useState([]);
  const sw = useStopwatch();
  const bell = useBells(sound);
  const bSteps = useMemo(() => { const out = []; for (let i = 1; i <= target; i++) { out.push({ k: "in", l: "DEEP IN · BREATH " + i + " / " + target, s: 2 }); out.push({ k: "out", l: "LET IT FALL OUT · " + i + " / " + target, s: 2 }); } return out; }, [target]);
  const rec = useMemo(() => [{ k: "hold", l: "ONE FULL BREATH IN — HOLD 15 SECONDS", s: 15 }], []);
  const light = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ k: "free", l: "BREATHE LIGHT · MINUTE " + (i + 1), s: 60 })), []);
  const Rb = useRunner(bSteps, sound, () => setPhase("empty"));
  const Rr = useRunner(rec, sound, () => { if (round < rounds) { setRound(round + 1); setPhase("breaths"); Rb.reset(); } else setPhase("light"); });
  const Rl = useRunner(light, sound, () => setPhase("done"));
  useEffect(() => { setBreath(Math.floor(Rb.s.i / 2) + 1); }, [Rb.s.i]);

  if (!ack) return (
    <Sheet title="WIM HOF ROUNDS" sub="STAGE 4 · THE HEAVY TOOLS" colour={C.oxide} onClose={onClose}>
      <Card ac={C.oxide}><Eye c={C.oxide}>Read this first</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>{SAFETY}</Note></Card>
      <Card><Note c={C.chalk} s={{ marginTop: 0 }}>{P.how}</Note></Card>
      <Btn on={() => setAck(true)} c={C.oxide} fill s={{ width: "100%" }}>I HAVE READ IT — BEGIN</Btn>
    </Sheet>);

  return (
    <Sheet title="WIM HOF ROUNDS" sub={"ROUND " + round + " OF " + rounds} colour={C.oxide} onClose={onClose}>
      {phase === "breaths" && Rb.s.i === 0 && !Rb.s.run ? (
        <Card><Eye c={C.oxide}>Entry protocol</Eye>
          <Lab>Breaths per round</Lab><Seg opts={[[20, "20"], [30, "30"], [40, "40"]]} val={target} on={setTarget} c={C.oxide} />
          <div style={{ height: 10 }} />
          <Lab>Rounds</Lab><Seg opts={[[2, "2"], [3, "3"]]} val={rounds} on={setRounds} c={C.oxide} />
          <Note>Two rounds to start. Build to 30–40 breaths and three rounds only if it lands as alert-calm, never agitated.</Note>
        </Card>) : null}

      {phase === "breaths" ? (
        <Card ac={C.oxide}>
          <div style={{ textAlign: "center" }}>
            <div style={Object.assign({}, mno, { fontSize: 12, color: C.ash, letterSpacing: 1.4 })}>BREATH</div>
            <div style={Object.assign({}, mno, { fontSize: 58, fontWeight: 700, color: C.chalk, lineHeight: 1 })}>{Math.min(breath, target)}<span style={{ fontSize: 18, color: C.ash }}>/{target}</span></div>
            <div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 700, letterSpacing: 1.2, color: C.oxide, marginTop: 8 })}>{(bSteps[Rb.s.i] || {}).l}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn on={Rb.s.run ? Rb.pause : Rb.start} c={C.oxide} fill={!Rb.s.run} s={{ flex: 2, padding: "16px 0" }}>{Rb.s.run ? "PAUSE" : "START THE BREATHS"}</Btn>
            <Btn on={() => setPhase("empty")} c={C.ash} s={{ flex: 1, padding: "16px 0" }}>SKIP</Btn>
          </div>
        </Card>) : null}

      {phase === "empty" ? (
        <Card ac={C.oxide}>
          <Eye c={C.oxide}>After the last breath — exhale and hold empty as long as comfortable</Eye>
          <div style={{ textAlign: "center" }}><div style={Object.assign({}, mno, { fontSize: 58, fontWeight: 700, color: C.chalk, lineHeight: 1 })}>{sw.secs}<span style={{ fontSize: 18, color: C.ash }}>s</span></div></div>
          {!sw.run
            ? <Btn on={() => { sw.reset(); sw.start(); bell("out"); }} c={C.oxide} fill s={{ width: "100%", marginTop: 12, padding: "20px 0", fontSize: 17 }}>EXHALE — HOLD EMPTY</Btn>
            : <Btn on={() => { sw.stop(); setHolds(holds.concat([sw.secs])); bell("seg"); setPhase("recovery"); Rr.reset(); }} c={C.moss} fill s={{ width: "100%", marginTop: 12, padding: "24px 0", fontSize: 18 }}>BREATHE — END THE HOLD</Btn>}
        </Card>) : null}

      {phase === "recovery" ? (
        <Card ac={C.moss}>
          <Eye c={C.moss}>One full breath in, hold 15 seconds, release</Eye>
          <div style={{ textAlign: "center" }}><div style={Object.assign({}, mno, { fontSize: 58, fontWeight: 700, color: C.chalk, lineHeight: 1 })}>{Rr.s.done ? "✓" : mmss(Rr.s.left)}</div></div>
          <Btn on={Rr.s.run ? Rr.pause : Rr.start} c={C.moss} fill={!Rr.s.run && !Rr.s.done} dis={Rr.s.done} s={{ width: "100%", marginTop: 12, padding: "18px 0" }}>{Rr.s.done ? "DONE" : Rr.s.run ? "PAUSE" : "START THE 15-SECOND HOLD"}</Btn>
        </Card>) : null}

      {phase === "light" || phase === "done" ? (
        <Card ac={C.brass}>
          <Eye c={C.brass}>Mandatory finish — five minutes of Breathe Light</Eye>
          <Note c={C.chalk} s={{ marginTop: 0 }}>Always finish with five minutes of Breathe Light to re-sensitise; skip that and you've hyperventilated twice a day and called it training.</Note>
          <div style={{ textAlign: "center", marginTop: 12 }}><div style={Object.assign({}, mno, { fontSize: 52, fontWeight: 700, color: phase === "done" ? C.moss : C.chalk, lineHeight: 1 })}>{phase === "done" ? "✓" : mmss(Rl.s.left)}</div>
            <div style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 700, letterSpacing: 1.2, color: C.brass, marginTop: 6 })}>{phase === "done" ? "FINISHED" : (light[Rl.s.i] || {}).l}</div></div>
          {phase !== "done" ? <Btn on={Rl.s.run ? Rl.pause : Rl.start} c={C.brass} fill={!Rl.s.run} s={{ width: "100%", marginTop: 12, padding: "18px 0" }}>{Rl.s.run ? "PAUSE" : "START BREATHE LIGHT"}</Btn> : null}
        </Card>) : null}

      {holds.length ? <Card><Eye>Empty holds this session</Eye><div style={Object.assign({}, mno, { fontSize: 15, color: C.chalk })}>{holds.map((h) => h + "s").join(" · ")}</div></Card> : null}
    </Sheet>);
}

/* --- Cold: a long-exhale cue and a drift counter --- */
export function ColdTimer({ level, sound, onClose, onSave }) {
  const L = LADDER[level] || LADDER[1];
  const [secs, setSecs] = useState(L.coldSecs[L.coldSecs.length - 1]);
  const steps = useMemo(() => [{ k: "out", l: "LONG EXHALE — AND YOU STAY", s: secs }], [secs]);
  const R = useRunner(steps, sound, null);
  const [drift, setDrift] = useState(0);
  return (
    <Sheet title="COLD" sub={L.n + " · " + L.freq.toUpperCase()} colour={C.cobalt} onClose={onClose}>
      <Card ac={C.cobalt}><Note c={C.chalk} s={{ marginTop: 0 }}>{L.cold}</Note><Note c={C.oxide}>{CARDINAL}</Note></Card>
      <Card>
        <Lab>Length</Lab>
        <Seg opts={L.coldSecs.map((x) => [x, x >= 60 ? (x / 60 % 1 ? (x / 60).toFixed(1) : x / 60) + " MIN" : x + "s"])} val={secs} on={setSecs} c={C.cobalt} />
        <div style={{ textAlign: "center", margin: "18px 0 4px" }}>
          <div style={Object.assign({}, mno, { fontSize: 62, fontWeight: 700, color: R.s.done ? C.moss : C.chalk, lineHeight: 1 })}>{R.s.done ? "✓" : mmss(R.s.left)}</div>
          <div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 700, letterSpacing: 1.4, color: C.cobalt, marginTop: 8, animation: R.s.run && !reduced() ? "breathe 5s infinite" : "none" })}>LONG EXHALE</div>
        </div>
        <Btn on={R.s.run ? R.pause : R.start} c={C.cobalt} fill={!R.s.run && !R.s.done} dis={R.s.done} s={{ width: "100%", marginTop: 8, padding: "18px 0", fontSize: 16 }}>{R.s.done ? "DONE" : R.s.run ? "PAUSE" : "START"}</Btn>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <Btn on={() => { setDrift(drift + 1); buzz(25); }} c={C.oxide} fill s={{ flex: 2, padding: "20px 0", fontSize: 17 }}>DRIFT</Btn>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={Object.assign({}, mno, { fontSize: 30, fontWeight: 700, color: C.chalk })}>{drift}</div>
            <div style={Object.assign({}, mno, { fontSize: 8, color: C.ash, letterSpacing: 1 })}>DRIFTS</div>
          </div>
          <Btn on={() => setDrift(0)} c={C.ash} small s={{ flex: 1 }}>RESET</Btn>
        </div>
        <Note c={C.oxide}>Every drift you count was a sentence in your head, not a sensation on your skin.</Note>
        {onSave ? <Btn on={() => { onSave({ drifts: drift, secs: secs - R.s.left }); onClose(); }} c={C.moss} fill s={{ width: "100%", marginTop: 10 }}>SAVE TO THIS WEEK'S TEST</Btn> : null}
      </Card>
    </Sheet>);
}

export function HeatTimer({ sound, onClose }) {
  const [secs, setSecs] = useState(900);
  const steps = useMemo(() => [{ k: "free", l: "BREATH SLOW AND NASAL · SITTING STILL", s: secs }], [secs]);
  const R = useRunner(steps, sound, null);
  return (
    <Sheet title="HEAT" sub="SAUNA · ONCE OR TWICE A WEEK IF AVAILABLE" colour={C.oxide} onClose={onClose}>
      <Card ac={C.oxide}><Note c={C.chalk} s={{ marginTop: 0 }}>{LADDER[3].heat}</Note></Card>
      <Card>
        <Lab>Length</Lab><Seg opts={[[900, "15 MIN"], [1200, "20 MIN"]]} val={secs} on={setSecs} c={C.oxide} />
        <div style={{ textAlign: "center", margin: "18px 0" }}>
          <div style={Object.assign({}, mno, { fontSize: 62, fontWeight: 700, color: R.s.done ? C.moss : C.chalk, lineHeight: 1 })}>{R.s.done ? "✓" : mmss(R.s.left)}</div>
          <div style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 700, letterSpacing: 1.3, color: C.oxide, marginTop: 8 })}>SLOW AND NASAL · SITTING STILL</div>
        </div>
        <Btn on={R.s.run ? R.pause : R.start} c={C.oxide} fill={!R.s.run && !R.s.done} dis={R.s.done} s={{ width: "100%", padding: "18px 0", fontSize: 16 }}>{R.s.done ? "DONE" : R.s.run ? "PAUSE" : "START"}</Btn>
      </Card>
    </Sheet>);
}

/* --- THE SIT --- */
export function SitTool({ stage, imWeek, isSunday, sound, onClose, onSave, sitLen, onLen }) {
  const S = MED_STAGE[stage] || MED_STAGE[1];
  const [len, setLenRaw] = useState(sitLen || (S.opts && S.opts[0]) || S.mins);
  const setLen = (v) => { setLenRaw(v); if (onLen) onLen(v); };
  const plan = useMemo(() => sitPlan(stage, imWeek, isSunday, len), [stage, imWeek, isSunday, len]);
  const steps = useMemo(() => plan.segs.map((sg) => ({ k: "seg", l: sg.l, s: Math.round(sg.m * 60) })), [plan]);
  const [cycles, setCycles] = useState(0), [drifts, setDrifts] = useState(0), [run, setRun] = useState(0), [best, setBest] = useState(0);
  const [saved, setSaved] = useState(false);
  const R = useRunner(steps, sound, null);
  const clean = () => { const n = run + 1; setRun(n); setCycles(cycles + 1); if (n > best) setBest(n); buzz(30); };
  const drift = () => { setRun(0); setDrifts(drifts + 1); buzz(15); };
  const commit = () => { onSave({ stage, mins: plan.mins, cycles, best, drifts, segs: plan.segs.map((x) => x.l) }); setSaved(true); };
  return (
    <Sheet title="THE SIT" sub={S.n + " · " + plan.mins + " MINUTES" + (isSunday ? " · SUNDAY" : "")} colour={C.violet} onClose={onClose}>
      {S.opts ? <Card><Lab>Length</Lab><Seg opts={S.opts.map((x) => [x, x + " MIN"])} val={len} on={setLen} c={C.violet} /></Card> : null}
      <Card ac={C.violet}>
        <div style={{ textAlign: "center" }}>
          <div style={Object.assign({}, mno, { fontSize: 60, fontWeight: 700, color: R.s.done ? C.moss : C.chalk, lineHeight: 1 })}>{R.s.done ? "✓" : mmss(R.s.left)}</div>
          <div style={Object.assign({}, dsp, { fontSize: 16, fontWeight: 700, letterSpacing: 1.2, color: C.violet, marginTop: 8, lineHeight: 1.2 })}>{R.s.done ? "SIT COMPLETE" : (steps[R.s.i] || {}).l}</div>
          <div style={Object.assign({}, mno, { fontSize: 9, color: C.ash, marginTop: 6 })}>SEGMENT {Math.min(R.s.i + 1, steps.length)} / {steps.length} · {mmss(R.total - R.elapsed)} LEFT</div>
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 12 }}>
          {steps.map((sg, k) => <div key={k} style={{ flex: Math.max(1, sg.s), height: 6, borderRadius: 2, background: k < R.s.i || R.s.done ? C.violet : k === R.s.i ? C.brass : C.line, opacity: k < R.s.i ? .5 : 1 }} />)}
        </div>
        <Btn on={R.s.run ? R.pause : R.start} c={C.violet} fill={!R.s.run && !R.s.done} dis={R.s.done} s={{ width: "100%", marginTop: 12, padding: "16px 0", fontSize: 16 }}>{R.s.done ? "DONE" : R.s.run ? "PAUSE" : "START THE SIT"}</Btn>
      </Card>

      <button onClick={clean} aria-label="Clean cycle" style={Object.assign({}, dsp, { width: "100%", minHeight: 96, borderRadius: 8, cursor: "pointer", background: C.moss, color: C.ink, border: "none", fontSize: 26, fontWeight: 800, letterSpacing: 2, marginBottom: 10 })}>
        CLEAN CYCLE<div style={Object.assign({}, mno, { fontSize: 13, letterSpacing: 1, fontWeight: 500, marginTop: 4 })}>{cycles} TOTAL · RUN OF {run} · BEST {best}</div>
      </button>
      <Btn on={drift} c={C.oxide} s={{ width: "100%", minHeight: 60, fontSize: 17, marginBottom: 10 }}>DRIFT — BACK TO ONE ({drifts})</Btn>

      <Card><Note c={C.chalk} s={{ marginTop: 0 }}>{THE_CATCH}</Note><Note>{HOW_TO_SIT}</Note></Card>
      {isSunday && stage >= 2 ? <Card ac={C.violet}><Eye c={C.violet}>Sunday</Eye><Note s={{ marginTop: 0 }}>{GOODWILL_LINE}</Note><Note>{DEATH_LINE}</Note></Card> : null}

      <Btn on={commit} c={C.brass} fill={!saved} s={{ width: "100%" }}>{saved ? "SAVED — " + cycles + " CYCLES, BEST RUN " + best : "SAVE THE SIT"}</Btn>
    </Sheet>);
}

/* --- The guided meditation timers --- */
export function GuidedTool({ id, sound, onClose }) {
  const g = guidedById(id);
  const [opts, setOpts] = useState(() => { const o = {}; (g && g.opts || []).forEach((x) => { o[x.k] = x.def; }); return o; });
  const [extra, setExtra] = useState(false);
  const steps = useMemo(() => {
    if (!g) return [];
    if (extra && g.extra) return g.extra.steps.map((s) => Object.assign({ k: "seg" }, s));
    if (g.stations) { const secs = opts.secs || 30; const out = [];
      for (let r = 1; r <= (g.rounds || 3); r++) g.stations.forEach((st, j) => out.push({ k: "seg", l: "RD " + r + " · " + (j + 1) + " — " + st, s: secs }));
      return out; }
    if (g.stepsFrom) return g.stepsFrom(opts).map((s) => Object.assign({ k: "seg" }, s));
    if (g.rounds) { const out = []; for (let r = 1; r <= g.rounds; r++) g.steps.forEach((s) => out.push(Object.assign({ k: "seg" }, s, { l: "RD " + r + " · " + s.l }))); return out; }
    return g.steps.map((s) => Object.assign({ k: "seg" }, s));
  }, [g, opts, extra]);
  if (!g) return null;
  return (
    <Pacer steps={steps} sound={sound} title={(extra && g.extra ? g.extra.n : g.n).toUpperCase()} sub={extra ? "" : g.tag} colour={g.c} onClose={onClose}
      footer={
        <div>
          {(g.opts || []).map((o) => <div key={o.k} style={{ marginBottom: 8 }}><Lab>{o.n}</Lab>
            <Seg opts={o.vals.map((vv) => [vv, vv + (o.unit || "")])} val={opts[o.k]} on={(vv) => setOpts(Object.assign({}, opts, { [o.k]: vv }))} c={g.c} /></div>)}
          {g.extra ? <Btn on={() => setExtra(!extra)} c={C.brass} fill={extra} small s={{ width: "100%", marginBottom: 8 }}>{extra ? "◀ BACK TO THE REHEARSAL" : "▶ " + g.extra.n}</Btn> : null}
          <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: 6, padding: 12, maxHeight: 168, overflowY: "auto" }}>
            <Note c={C.chalk} s={{ marginTop: 0 }}>{extra && g.extra ? g.extra.s : g.how}</Note>
          </div>
        </div>} />);
}

/* --- The breath pacer for a named preset --- */
export function BreathTool({ id, sound, onClose, onBolt, boltNow, onSettle, settleNow }) {
  const P = presetById(id);
  const [opts, setOpts] = useState(() => { const o = {}; (P && P.opts || []).forEach((x) => { o[x.k] = x.def; }); return o; });
  const [need, setNeed] = useState("");
  const [ack, setAck] = useState(false);
  const steps = useMemo(() => (P && P.build ? P.build(Object.assign({}, opts, P.needs ? { [P.needs]: num(need) } : {})) : []), [P, opts, need]);
  if (!P) return null;
  if (P.custom === "bolt") return <BoltTool sound={sound} onSave={onBolt} current={boltNow} onClose={onClose} />;
  if (P.custom === "settle") return <SettleTool sound={sound} onSave={onSettle} saved={settleNow} onClose={onClose} />;
  if (P.custom === "wimhof") return <WimHof sound={sound} onClose={onClose} />;
  if (P.st === 4 && !ack) return (
    <Sheet title={P.n.toUpperCase()} sub="STAGE 4 · THE HEAVY TOOLS" colour={C.oxide} onClose={onClose}>
      <Card ac={C.oxide}><Eye c={C.oxide}>Read this first</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>{SAFETY}</Note></Card>
      <Card><Note c={C.chalk} s={{ marginTop: 0 }}>{P.how}</Note></Card>
      <Btn on={() => setAck(true)} c={C.oxide} fill s={{ width: "100%" }}>I HAVE READ IT — BEGIN</Btn>
    </Sheet>);
  if (P.needs && num(need) == null) return (
    <Sheet title={P.n.toUpperCase()} sub={P.tag} colour={P.c} onClose={onClose}>
      <Card ac={P.c}><Note c={C.chalk} s={{ marginTop: 0 }}>{P.how}</Note></Card>
      <Card><Lab>{P.needsLabel}</Lab><Fld v={need} on={setNeed} ph="seconds" />
        <Note>{id === "co2" ? "Every hold in the table is set at 50% of this." : "Each round's hold is a percentage of this."}</Note></Card>
      <Card ac={C.oxide}><Note c={C.chalk} s={{ marginTop: 0 }}>{SAFETY}</Note></Card>
    </Sheet>);
  return (
    <Pacer steps={steps} sound={sound} title={P.n.toUpperCase()} sub={P.tag} colour={P.c} onClose={onClose}
      footer={
        <div>
          {(P.opts || []).map((o) => <div key={o.k} style={{ marginBottom: 8 }}><Lab>{o.n}</Lab>
            <Seg opts={o.vals.map((vv) => [vv, vv + (o.unit || "")])} val={opts[o.k]} on={(vv) => setOpts(Object.assign({}, opts, { [o.k]: vv }))} c={P.c} /></div>)}
          <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: 6, padding: 12, maxHeight: 150, overflowY: "auto" }}>
            <Note c={C.chalk} s={{ marginTop: 0 }}>{P.how}</Note>
          </div>
        </div>} />);
}

/* --- THE FLOOR — three sighs, three minutes of box breathing, the review --- */
export function FloorTool({ sound, onClose, onDone }) {
  const steps = useMemo(() => {
    const out = [];
    for (let i = 0; i < 3; i++) { out.push({ k: "in", l: "FULL BREATH IN — NOSE · SIGH " + (i + 1), s: 3 }); out.push({ k: "in", l: "SHORT SIP ON TOP", s: 1 }); out.push({ k: "out", l: "LONG SLOW EXHALE — MOUTH", s: 6 }); }
    for (let i = 0; i < 11; i++) { out.push({ k: "in", l: "IN · 4", s: 4 }); out.push({ k: "hold", l: "HOLD · 4", s: 4 }); out.push({ k: "out", l: "OUT · 4", s: 4 }); out.push({ k: "empty", l: "HOLD EMPTY · 4", s: 4 }); }
    REVIEW_Q.forEach((q) => out.push({ k: "seg", l: q.toUpperCase(), s: 10 }));
    return out;
  }, []);
  const [fin, setFin] = useState(false);
  return (
    <Pacer steps={steps} sound={sound} title="THE FLOOR · 4 MINUTES" sub="THREE SIGHS → BOX BREATHING → THE REVIEW" colour={C.moss}
      onClose={onClose} onFinish={() => setFin(true)}
      footer={
        <div>
          {fin ? <Btn on={() => { onDone(); onClose(); }} c={C.moss} fill s={{ width: "100%", marginBottom: 8, padding: "16px 0", fontSize: 16 }}>MARK TODAY A FLOOR DAY</Btn> : null}
          <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: 6, padding: 12, maxHeight: 140, overflowY: "auto" }}>
            <Note c={C.chalk} s={{ marginTop: 0 }}>{FLOOR_TEXT}</Note>
          </div>
        </div>} />);
}

/* ================================================================
   TODAY — the Iron Mind day, woven into the training day
   ================================================================ */
const SlotHead = ({ n, s, c }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 800, letterSpacing: 1.5, color: c || C.chalk })}>{n}</div>
    {s ? <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, letterSpacing: 1.2, marginTop: 2 })}>{s}</div> : null}
  </div>);

export function IronToday({ IM, part }) {
  const { st, dayIso, isSunday, rec, tick, imWeek, open, floorOpen } = IM;
  const ok = (k) => !!(rec.ticks && rec.ticks[k]);
  const med = st.medStage || 1, br = st.breathStage || 1, hl = st.hardLevel || 1;
  const BS = BREATH_STAGE[br], L = LADDER[hl], W = WALKING[br];
  const plan = sitPlan(med, imWeek, isSunday, st.sitLen);

  if (part === "waking") return (
    <Card ac={C.moss}>
      <SlotHead n="ON WAKING" s="2 MINUTES, BEFORE THE PHONE" c={C.moss} />
      <Tick ok={ok("sighs")} on={() => tick("sighs")} title="Three physiological sighs" sub={SIGH_HOW}
        right={<OpenBtn on={() => open({ kind: "breath", id: "sigh3" })} label="Open the pacer" c={C.moss} />} />
      <Tick ok={ok("onething")} on={() => tick("onething")} title="The one thing" sub={ONE_THING_HOW} />
      <div style={{ paddingLeft: 55, marginTop: 6 }}>
        {ONE_THING_Q.map((q, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, padding: "4px 0", lineHeight: 1.45 })}><span style={Object.assign({}, mno, { fontSize: 9, color: C.moss })}>{i + 1} · </span>{q}</div>)}
      </div>
      {isSunday ? <Tick ok={ok("bolt")} on={() => tick("bolt")} title="BOLT score — on waking, before the sighs" sub={presetById("bolt").how} c={C.cobalt}
        right={<OpenBtn on={() => open({ kind: "breath", id: "bolt" })} label="Open the BOLT stopwatch" c={C.cobalt} />} /> : null}
    </Card>);

  if (part === "site") return (
    <Card ac={C.brass}>
      <SlotHead n="ON SITE" s="FREE" c={C.brass} />
      <Note c={C.chalk} s={{ marginTop: 0, marginBottom: 6 }}>{NOSE_ALL_DAY}</Note>
      <Tick ok={ok("reset")} on={() => tick("reset")} title={SITE[0].n} sub={SITE[0].s} c={C.brass} />
      <Tick ok={ok("walk")} on={() => tick("walk")} title={"★ The walking practice — " + W.n} sub={W.s} c={C.brass}
        right={W.tool ? <OpenBtn on={() => open({ kind: "guided", id: W.tool })} label="Open walking meditation" c={C.brass} /> : null} />
      {SITE.slice(1).map((x) => <Tick key={x.id} ok={ok(x.id)} on={() => tick(x.id)} title={x.n} sub={x.s} c={C.brass} />)}
    </Card>);

  if (part === "lunch") return (
    <Card ac={C.cobalt}>
      <SlotHead n="LUNCH, IN THE VAN" s="5–10 MINUTES" c={C.cobalt} />
      <Tick ok={ok("lunch")} on={() => tick("lunch")} title={"★ The breath practice — " + BS.n} sub={BS.lunchLine} c={C.cobalt} />
      <div style={{ marginTop: 8 }}>
        {BS.lunch.map((pid) => { const P = presetById(pid); if (!P) return null;
          return (
            <button key={pid} onClick={() => open({ kind: "breath", id: pid })} style={{ display: "flex", width: "100%", gap: 10, alignItems: "center", textAlign: "left", background: "transparent", border: "1px solid " + C.line, borderRadius: 5, padding: "9px 11px", marginBottom: 6, cursor: "pointer", minHeight: 44 }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{P.n}</div>
                <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, marginTop: 2, letterSpacing: 1 })}>{P.tag} · {P.mins}</div>
              </span>
              <span style={Object.assign({}, mno, { fontSize: 14, color: P.c })}>▸</span>
            </button>); })}
      </div>
      <Note>Skip it on a chaotic day; the floor covers you.</Note>
    </Card>);

  if (part === "shower") return (
    <Card ac={C.cobalt}>
      <SlotHead n="THE SHOWER AFTER WORK" s={L.n + " · " + L.freq.toUpperCase()} c={C.cobalt} />
      <Tick ok={ok("cold")} on={() => tick("cold")} title="The cold slot" sub={L.cold} c={C.cobalt}
        right={<OpenBtn on={() => open({ kind: "cold" })} label="Open the cold timer" c={C.cobalt} />} />
      <Note c={C.oxide}>Weekdays only in this slot; weekend rules on the Hardship page. Breath controlled throughout.</Note>
    </Card>);

  if (part === "evening") return (
    <Card ac={C.violet}>
      <SlotHead n="EVENING" s="15–35 MINUTES, AFTER THE MOBILITY BLOCK" c={C.violet} />
      <Tick ok={ok("mobility")} on={() => tick("mobility")} title="The mobility block" sub={isFriday(dayIso) ? "Friday evening: the full stretch, 20 minutes." : "Eight minutes at home, every evening."} c={C.violet} />
      <Tick ok={ok("sit")} on={() => tick("sit")} title={"★ THE SIT — " + plan.mins + " minutes"} sub={(MED_STAGE[med] || MED_STAGE[1]).line} c={C.violet}
        right={<OpenBtn on={() => open({ kind: "sit" })} label="Open the sit timer" c={C.violet} />} />
      <div style={{ paddingLeft: 55, marginTop: 4, marginBottom: 6 }}>
        {plan.segs.map((sg, i) => <div key={i} style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, padding: "2px 0" })}>{sg.m} MIN · {sg.l}</div>)}
      </div>
      <Tick ok={ok("review")} on={() => tick("review")} title="THE REVIEW" sub={REVIEW_HOW} c={C.violet} />
      <div style={{ paddingLeft: 55, marginTop: 6 }}>
        {REVIEW_Q.map((q, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, padding: "4px 0", lineHeight: 1.45 })}><span style={Object.assign({}, mno, { fontSize: 9, color: C.violet })}>{i + 1} · </span>{q}</div>)}
      </div>
    </Card>);

  if (part === "sunday") return (
    <Card ac={C.brass}>
      <SlotHead n="SUNDAY" s="+15 MINUTES" c={C.brass} />
      <Tick ok={ok("numbers")} on={() => tick("numbers")} title="The four numbers — ten seconds each" sub="Days done this week (of 7) · best clean cycles in a sit · BOLT · this week's Crossover gap." c={C.brass} />
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {IM.four.map((x) => (
          <div key={x[0]} style={{ flex: "1 1 40%", background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "9px 6px", textAlign: "center" }}>
            <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, letterSpacing: 1 })}>{x[0]}</div>
            <div style={Object.assign({}, mno, { fontSize: 19, fontWeight: 700, color: x[1] == null ? C.ash : C.brass })}>{x[1] == null ? "—" : x[1]}</div>
          </div>))}
      </div>
      <Note>If a fifth number ever appears, something has wandered.</Note>
    </Card>);

  /* the header strip: streak, days this week, never miss twice, FLOOR */
  const done = dayDone(rec);
  return (
    <Card ac={done ? C.moss : C.brass} s={{ padding: 0 }}>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <span style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 800, letterSpacing: 1.5, color: C.chalk })}>IRON MIND</span>
          <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash })}>WEEK {imWeek}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[["STREAK", IM.streak], ["THIS WEEK", IM.weekDone + "/7"], ["DONE TODAY", done ? (rec.floor ? "FLOOR" : "YES") : "NO"]].map((x) => (
            <div key={x[0]} style={{ flex: 1, background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "9px 4px", textAlign: "center" }}>
              <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, letterSpacing: 1 })}>{x[0]}</div>
              <div style={Object.assign({}, mno, { fontSize: 19, fontWeight: 700, color: done && x[0] === "DONE TODAY" ? C.moss : C.chalk })}>{x[1]}</div>
            </div>))}
        </div>
        {IM.missedYesterday && IM.hasHistory && !done ? <div style={{ background: C.ink, border: "1px solid " + C.oxide, borderRadius: 5, padding: "10px 12px", marginTop: 10 }}>
          <div style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 800, letterSpacing: 1.2, color: C.oxide })}>NEVER MISS TWICE</div>
          <Note c={C.chalk} s={{ marginTop: 3 }}>{NEVER_TWICE}</Note>
        </div> : null}
        <Btn on={floorOpen} c={C.moss} fill={!done} s={{ width: "100%", marginTop: 10, fontSize: 15 }}>▶ THE FLOOR · 4 MINUTES</Btn>
        <Note>The day is done when the sit and the review are ticked — or the floor is used. A floor day counts. A skipped day doesn't. One streak for the whole day, training included.</Note>
      </div>
    </Card>);
}
const isFriday = (d) => { try { return new Date(d + "T00:00:00").getDay() === 5; } catch (e) { return false; } };

/* ================================================================
   IRON TAB — BREATHE
   ================================================================ */
export function BreatheView({ IM }) {
  const br = IM.st.breathStage || 1;
  const open = IM.open;
  const groups = [[0, "ALWAYS AVAILABLE"], [1, "STAGE 1 · CALM"], [2, "STAGE 2 · TOLERATE"], [3, "STAGE 3 · CONTROL"], [4, "STAGE 4 · POWER"]];
  return (
    <div>
      <Card ac={C.oxide}><Eye c={C.oxide}>Safety</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>{SAFETY}</Note></Card>
      <Card ac={C.cobalt}>
        <Eye c={C.cobalt}>Your stage</Eye>
        <div style={Object.assign({}, dsp, { fontSize: 21, fontWeight: 800, letterSpacing: 1.2, color: C.chalk })}>{BREATH_STAGE[br].n}</div>
        <div style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, marginTop: 3 })}>{BREATH_STAGE[br].weeks}</div>
        <Note c={C.chalk}>{BREATH_STAGE[br].gate}</Note>
        <Note>The road runs: calm → tolerate → control → power. In that order, with the gates cleared honestly. The heavy tools are earned, and they're earned by the slow ones. Change your stage in Settings — the app never advances it for you.</Note>
      </Card>
      {groups.map((g) => {
        const list = PRESETS.filter((p) => p.st === g[0]);
        if (!list.length) return null;
        const locked = g[0] > br;
        return (
          <div key={g[0]}>
            <div style={Object.assign({}, mno, { fontSize: 9.5, letterSpacing: 1.8, color: locked ? C.ash : C.brass, padding: "14px 2px 8px" })}>{g[1]}{locked ? " · LOCKED" : ""}</div>
            {list.map((P) => (
              <Card key={P.id} ac={locked ? C.line : P.c} s={{ opacity: locked ? .62 : 1, padding: 0 }}>
                <button onClick={() => (locked ? null : open({ kind: "breath", id: P.id }))} disabled={locked}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "12px 13px", cursor: locked ? "default" : "pointer", minHeight: 44 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={Object.assign({}, bdy, { fontSize: 15, fontWeight: 700, color: locked ? C.ash : C.chalk })}>{locked ? "🔒 " : ""}{P.n}</span>
                    <span style={Object.assign({}, mno, { fontSize: 9.5, color: locked ? C.ash : P.c, flexShrink: 0 })}>{P.mins}</span>
                  </div>
                  <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, letterSpacing: 1.1, marginTop: 3 })}>{P.tag}</div>
                  <Note c={locked ? C.ash : C.chalk}>{P.how}</Note>
                  {locked ? <div style={{ background: C.ink, border: "1px solid " + C.oxide, borderRadius: 5, padding: "9px 11px", marginTop: 10 }}>
                    <div style={Object.assign({}, mno, { fontSize: 8, color: C.oxide, letterSpacing: 1.2 })}>TO UNLOCK</div>
                    <div style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, marginTop: 3, lineHeight: 1.45, fontWeight: 600 })}>{BREATH_STAGE[Math.max(1, g[0] - 1)].gate}</div>
                  </div> : null}
                  {!locked && P.st === 4 ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.oxide, marginTop: 8, letterSpacing: 1 })}>⚠ THE SAFETY LINE SHOWS BEFORE THIS ONE STARTS</div> : null}
                </button>
              </Card>))}
          </div>);
      })}
    </div>);
}

/* ================================================================
   IRON TAB — SIT
   ================================================================ */
export function SitView({ IM }) {
  const med = IM.st.medStage || 1;
  const S = MED_STAGE[med];
  const plan = sitPlan(med, IM.imWeek, IM.isSunday, IM.st.sitLen);
  const best = IM.sits.reduce((a, x) => Math.max(a, x.best || 0), 0);
  return (
    <div>
      <Card ac={C.violet}>
        <Eye c={C.violet}>Your stage</Eye>
        <div style={Object.assign({}, dsp, { fontSize: 21, fontWeight: 800, letterSpacing: 1.2, color: C.chalk })}>{S.n}</div>
        <div style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, marginTop: 3 })}>{S.weeks} · THE SIT IS {plan.mins} MINUTES{IM.isSunday ? " TODAY" : ""}</div>
        <Note c={C.chalk}>{S.line}</Note>
        <Note c={C.brass}>{S.target}</Note>
        <Btn on={() => IM.open({ kind: "sit" })} c={C.violet} fill s={{ width: "100%", marginTop: 12, fontSize: 16 }}>▶ START THE SIT · {plan.mins} MIN</Btn>
        <div style={{ marginTop: 10 }}>
          {plan.segs.map((sg, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid " + C.line }}>
            <span style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk })}>{sg.l}</span>
            <span style={Object.assign({}, mno, { fontSize: 10, color: C.violet })}>{sg.m} min</span></div>)}
        </div>
      </Card>
      <Card ac={C.moss}>
        <Eye c={C.moss}>Best consecutive run</Eye>
        <div style={Object.assign({}, mno, { fontSize: 40, fontWeight: 700, color: C.moss, lineHeight: 1 })}>{best}<span style={{ fontSize: 14, color: C.ash }}> clean cycles</span></div>
        <Note c={C.chalk}>{THE_CATCH}</Note>
        <Note>Track clean cycles, not minutes: 3 → 5 → 10 → 20. Twenty consecutive clean cycles is properly hard and impossible to fake.</Note>
      </Card>
      <div style={Object.assign({}, mno, { fontSize: 9.5, letterSpacing: 1.8, color: C.brass, padding: "10px 2px 8px" })}>THE GUIDED TIMERS</div>
      {GUIDED.map((g) => { const locked = g.st > med;
        return (
          <Card key={g.id} ac={locked ? C.line : g.c} s={{ opacity: locked ? .62 : 1, padding: 0 }}>
            <button onClick={() => (locked ? null : IM.open({ kind: "guided", id: g.id }))} disabled={locked}
              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "12px 13px", cursor: locked ? "default" : "pointer", minHeight: 44 }}>
              <div style={Object.assign({}, bdy, { fontSize: 15, fontWeight: 700, color: locked ? C.ash : C.chalk })}>{locked ? "🔒 " : ""}{g.n}</div>
              <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, letterSpacing: 1.1, marginTop: 3 })}>{g.tag}</div>
              <Note c={locked ? C.ash : C.chalk}>{g.how}</Note>
              {locked ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.oxide, marginTop: 8, letterSpacing: 1 })}>ENTERS AT MEDITATION STAGE {g.st}</div> : null}
            </button>
          </Card>); })}
      <Card>
        <Eye c={C.brass}>The eleven types — what each is, what it builds, when it enters</Eye>
        {ELEVEN.map((e) => (
          <div key={e[0]} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid " + C.line, opacity: e[4] > med ? .5 : 1 }}>
            <span style={Object.assign({}, mno, { fontSize: 10, color: C.ash, width: 16, flexShrink: 0 })}>{e[0]}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{e[1]}</div>
              <div style={Object.assign({}, bdy, { fontSize: 11.5, color: C.ash, marginTop: 1 })}>{e[2]} — {e[3]}</div>
            </span>
            <Chip c={e[4] > med ? C.ash : C.moss}>ST {e[4]}</Chip>
          </div>))}
      </Card>
      {IM.sits.length ? (
        <Card><Eye c={C.moss}>Recent sits</Eye>
          {IM.sits.slice(0, 8).map((x, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, mno, { fontSize: 10, color: C.ash })}>{x.d} · ST{x.stage} · {x.mins}m</span>
              <span style={Object.assign({}, mno, { fontSize: 11, color: C.chalk })}>{x.cycles} cycles · best {x.best} · {x.drifts} drifts</span>
            </div>))}
        </Card>) : null}
    </div>);
}

/* ================================================================
   IRON TAB — HARDSHIP
   ================================================================ */
export function HardshipView({ IM }) {
  const hl = IM.st.hardLevel || 1;
  const L = LADDER[hl];
  const [openRules, setOpenRules] = useState(false);
  const [raw, setRaw] = useState({});
  const [silence, setSilence] = useState("");
  const thisTest = testForWeek(IM.imWeek);
  const paused = IM.taperNow;
  const put = (k, vv) => setRaw(Object.assign({}, raw, { [k]: vv }));
  const gapOf = (t) => { const m = num(raw[t.id + "mind"]), b = num(raw[t.id + "body"]); return t.gap && m != null && b != null ? b - m : null; };
  const logTest = (t) => {
    const e = { d: IM.dayIso, wk: IM.imWeek, test: t.id, n: t.n, mind: num(raw[t.id + "mind"]), body: num(raw[t.id + "body"]),
      plain: t.third ? num(raw[t.id + "plain"]) : null, honest: raw[t.id + "honest"] || "", gap: gapOf(t) };
    IM.addHard(e); setRaw({});
  };
  const silenceDone = IM.silenceFor(IM.weekMonday) || 0;
  const lastCold = (IM.wks[IM.weekMonday] || {}).cold;
  useEffect(() => { if (!lastCold) return;
    setRaw((r) => (r.colddrift === lastCold.stamp ? r : Object.assign({}, r, { colddrift: lastCold.stamp, coldmind: String(lastCold.drifts), coldbody: String(lastCold.secs) })));
  }, [lastCold]);
  return (
    <div>
      <Card ac={L.c}>
        <Eye c={L.c}>Your level</Eye>
        <div style={Object.assign({}, dsp, { fontSize: 21, fontWeight: 800, letterSpacing: 1.2, color: C.chalk })}>{L.n} · {L.freq.toUpperCase()}</div>
        <div style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, marginTop: 3 })}>{L.weeks}</div>
        <Note c={C.chalk}>{L.cold}</Note>
        {L.heat ? <Note c={C.chalk}>{L.heat}</Note> : null}
        <Note c={C.chalk}>{L.silenceLine}</Note>
        {L.items.map((x, i) => <Note key={i} c={C.chalk}>{x}</Note>)}
        <Note c={C.brass} bold>{L.gate}</Note>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <Btn on={() => IM.open({ kind: "cold" })} c={C.cobalt} fill s={{ flex: 1 }}>▶ COLD</Btn>
          {L.heat ? <Btn on={() => IM.open({ kind: "heat" })} c={C.oxide} s={{ flex: 1 }}>▶ HEAT</Btn> : null}
        </div>
      </Card>

      <Card ac={C.oxide}><Eye c={C.oxide}>The operating teaching</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>{ARROWS}</Note><Note c={C.oxide} bold>{CARDINAL}</Note></Card>

      <Card ac={C.moss}>
        <Eye c={C.moss}>Silence this week</Eye>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={Object.assign({}, mno, { fontSize: 34, fontWeight: 700, color: silenceDone >= L.silence ? C.moss : C.chalk })}>{silenceDone}</span>
          <span style={Object.assign({}, mno, { fontSize: 13, color: C.ash })}>/ {L.silence} min</span>
        </div>
        <div style={{ height: 6, background: C.ink, borderRadius: 3, marginTop: 8, overflow: "hidden" }}><div style={{ width: Math.min(100, silenceDone / L.silence * 100) + "%", height: "100%", background: silenceDone >= L.silence ? C.moss : C.brass }} /></div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}><Lab>Add minutes with no music</Lab><Fld v={silence} on={setSilence} ph="min" /></div>
          <Btn c={C.moss} fill dis={!num(silence)} on={() => { IM.addSilence(num(silence)); setSilence(""); }}>ADD</Btn>
        </div>
        <Note>{L.silenceLine}</Note>
      </Card>

      <div style={Object.assign({}, mno, { fontSize: 9.5, letterSpacing: 1.8, color: C.brass, padding: "12px 2px 8px" })}>THE FIVE TESTS — ONE A WEEK, ROTATING</div>
      {paused ? <Card ac={C.oxide}><div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 800, letterSpacing: 1.3, color: C.oxide })}>TESTS PAUSE</div><Note c={C.chalk}>Taper weeks 15–16 of the training cycle: no maximal hardship sessions. Breath, sits and the daily core continue; the tests pause.</Note></Card> : null}
      {TESTS5.map((t) => { const isNow = t.id === thisTest.id, g = gapOf(t);
        const last = IM.hards.find((h) => h.test === t.id);
        return (
          <Card key={t.id} ac={isNow ? t.c : C.line} s={{ opacity: isNow ? 1 : .74 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={Object.assign({}, dsp, { fontSize: 16, fontWeight: 800, letterSpacing: 1.1, color: isNow ? C.chalk : C.ash })}>{t.n}</span>
              {isNow ? <Chip c={paused ? C.oxide : t.c}>{paused ? "TESTS PAUSE" : "THIS WEEK"}</Chip> : null}
            </div>
            <div style={Object.assign({}, mno, { fontSize: 8.5, color: C.ash, letterSpacing: 1, marginTop: 4 })}>{t.where.toUpperCase()}</div>
            <Note c={C.chalk}>{t.how}</Note>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1 }}><Lab>{t.mind}</Lab><Fld v={raw[t.id + "mind"]} on={(vv) => put(t.id + "mind", vv)} ph="—" /></div>
              <div style={{ flex: 1 }}><Lab>{t.body}</Lab><Fld v={raw[t.id + "body"]} on={(vv) => put(t.id + "body", vv)} ph="—" /></div>
            </div>
            {t.third ? <div style={{ marginTop: 8 }}><Lab>{t.third.n}</Lab><Fld v={raw[t.id + "plain"]} on={(vv) => put(t.id + "plain", vv)} ph="—" /></div> : null}
            {t.third && num(raw[t.id + "plain"]) && num(raw[t.id + "body"]) ? (() => { const d = (num(raw[t.id + "plain"]) - num(raw[t.id + "body"])) / num(raw[t.id + "plain"]) * 100;
              return <Note c={d >= 15 && d <= 25 ? C.moss : C.brass}>{d.toFixed(0)}% below your plain hold. A 15–25% drop is normal; a smaller gap means you're dual-capable rather than needing every scrap of attention just to hang on.</Note>; })() : null}
            {t.honest ? <div style={{ marginTop: 10 }}><Lab>The honest half</Lab>
              <Seg opts={[["had", "IT HAD TO", C.moss], ["caved", "I CAVED", C.oxide]]} val={raw[t.id + "honest"]} on={(vv) => put(t.id + "honest", raw[t.id + "honest"] === vv ? "" : vv)} />
              {raw[t.id + "honest"] === "caved" ? <Note c={C.oxide} bold>Caved — the mind quit first. That answer is worth more than the number.</Note> : raw[t.id + "honest"] === "had" ? <Note c={C.moss} bold>It had to — the body quit first.</Note> : null}
            </div> : null}
            {t.drift ? <Btn on={() => IM.open({ kind: "cold" })} c={C.cobalt} small s={{ width: "100%", marginTop: 10 }}>▶ COLD TIMER — COUNT THE DRIFTS</Btn> : null}
            {g != null ? <div style={{ background: C.ink, border: "1px solid " + t.c, borderRadius: 5, padding: "10px 12px", marginTop: 10, textAlign: "center" }}>
              <div style={Object.assign({}, mno, { fontSize: 8, color: t.c, letterSpacing: 1.2 })}>CROSSOVER GAP</div>
              <div style={Object.assign({}, mno, { fontSize: 26, fontWeight: 700, color: C.chalk })}>{g}</div>
              <Note s={{ marginTop: 2 }}>Where your mind quits against where your body quits. Closing over months is the only real evidence any of this arrived where you fight.</Note>
            </div> : null}
            <Btn on={() => logTest(t)} c={t.c} fill s={{ width: "100%", marginTop: 10 }} dis={num(raw[t.id + "mind"]) == null && num(raw[t.id + "body"]) == null && !raw[t.id + "honest"]}>LOG THIS TEST</Btn>
            {last ? <Note>Last logged {last.d}{last.gap != null ? " · gap " + last.gap : ""}{last.honest ? " · " + (last.honest === "caved" ? "caved" : "it had to") : ""}</Note> : null}
          </Card>); })}

      <Card ac={C.oxide} s={{ padding: 0 }}>
        <button onClick={() => setOpenRules(!openRules)} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: "13px 14px", cursor: "pointer", textAlign: "left", minHeight: 44 }}>
          <span style={Object.assign({}, dsp, { fontSize: 15, fontWeight: 700, letterSpacing: 1.1, color: C.chalk })}>THE COLLISION RULES — PRECEDENCE, FIXED</span>
          <span style={Object.assign({}, mno, { fontSize: 15, color: C.ash })}>{openRules ? "−" : "+"}</span>
        </button>
        {openRules ? <div className="rise" style={{ padding: "0 14px 14px" }}>
          {COLLISION.map((r, i) => <div key={i} style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, padding: "8px 0", borderBottom: i < COLLISION.length - 1 ? "1px solid " + C.line : "none", lineHeight: 1.5 })}><span style={Object.assign({}, mno, { fontSize: 10, color: C.oxide })}>{i + 1}. </span>{r}</div>)}
        </div> : null}
      </Card>
      <Card ac={C.brass}><Eye c={C.brass}>The ceiling</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>{CEILING}</Note>
        <Btn on={IM.goHell} c={C.oxide} fill s={{ width: "100%", marginTop: 12 }}>GO TO HELL WEEK</Btn></Card>
    </div>);
}

/* ================================================================
   GATES — progress toward the next stage or level, all three curricula
   ================================================================ */
export function GatesPanel({ IM, compact }) {
  const rows = [
    ["MEDITATION", "med", IM.st.medStage || 1, C.violet],
    ["BREATH", "breath", IM.st.breathStage || 1, C.cobalt],
    ["HARDSHIP", "hard", IM.st.hardLevel || 1, C.oxide],
  ];
  const met = IM.gateMet, shown = IM.gateShown;
  return (
    <div>
      {rows.map((r) => { const G = GATES[r[1]][r[2]];
        return (
          <Card key={r[1]} ac={r[3]}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={Object.assign({}, dsp, { fontSize: 16, fontWeight: 800, letterSpacing: 1.2, color: C.chalk })}>{r[0]}</span>
              <Chip c={r[3]}>{r[1] === "hard" ? "LEVEL " + r[2] : "STAGE " + r[2]}{G.to ? " → " + G.to : " · CEILING"}</Chip>
            </div>
            {G.lines.map((ln, i) => { const m = met(ln[0], ln[2]);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < G.lines.length - 1 ? "1px solid " + C.line : "none" }}>
                  <span style={Object.assign({}, mno, { width: 24, height: 24, flexShrink: 0, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: m === true ? C.moss : "transparent", color: m === true ? C.ink : C.ash, border: "1px solid " + (m === true ? C.moss : C.line) })}>{m === true ? "✓" : m === false ? "" : "·"}</span>
                  <span style={Object.assign({}, bdy, { fontSize: 12.5, color: C.chalk, flex: 1, lineHeight: 1.4 })}>{ln[1]}</span>
                  <span style={Object.assign({}, mno, { fontSize: 10, color: m === true ? C.moss : C.ash, flexShrink: 0 })}>{shown(ln[0], ln[2])}</span>
                </div>); })}
            {compact ? null : <Note>Clear the gates honestly. The program only fails if you lie to yourself about where you are. Nothing here advances by itself — you move it in Settings.</Note>}
          </Card>); })}
      {compact ? null : (
        <Card>
          <Eye c={C.brass}>The three curricula, side by side</Eye>
          <div style={{ overflowX: "auto" }}>
            <table style={Object.assign({}, bdy, { width: "100%", minWidth: 520, borderCollapse: "collapse", fontSize: 11.5 })}>
              <thead><tr>{["Weeks", "Meditation", "Breath", "Hardship", "Gates to clear"].map((h) => <th key={h} style={Object.assign({}, mno, { textAlign: "left", color: C.ash, fontSize: 8.5, letterSpacing: 1, padding: "6px 8px 6px 0", borderBottom: "1px solid " + C.line })}>{h.toUpperCase()}</th>)}</tr></thead>
              <tbody>{PROGRESSION.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} style={{ color: j === 0 ? C.brass : C.chalk, padding: "8px 8px 8px 0", borderBottom: "1px solid " + C.line, verticalAlign: "top", lineHeight: 1.4 }}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </Card>)}
    </div>);
}

/* ================================================================
   TRACK — the Iron Mind weekly rows
   ================================================================ */
function MiniBars({ data, color, unit }) {
  const vals = data.filter((d) => d[1] != null).map((d) => d[1]);
  if (!vals.length) return <Note s={{ fontStyle: "italic" }}>Nothing logged yet.</Note>;
  const mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), span = mx - mn || mx || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 72, marginTop: 10 }}>
      {data.map((d, i) => { const has = d[1] != null; const rel = has ? (d[1] - mn) / span : 0; const h = has ? 18 + rel * 44 : 4;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0 }}>
            <div style={Object.assign({}, mno, { fontSize: 8.5, fontWeight: 700, color: has ? C.chalk : C.ash, marginBottom: 3 })}>{has ? d[1] : ""}</div>
            <div style={{ width: "100%", height: h, background: has ? (color || C.brass) : C.line, borderRadius: "2px 2px 0 0" }} />
            <div style={Object.assign({}, mno, { fontSize: 7, color: C.ash, marginTop: 3, whiteSpace: "nowrap" })}>{d[0]}</div>
          </div>); })}
    </div>);
}

export function IronTrack({ IM }) {
  const rows = IM.weekRows;
  return (
    <div>
      <Card ac={C.brass}>
        <Eye c={C.brass}>The four numbers — ten seconds each, Sunday</Eye>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {IM.four.map((x) => (
            <div key={x[0]} style={{ flex: "1 1 40%", background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "10px 6px", textAlign: "center" }}>
              <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, letterSpacing: 1 })}>{x[0]}</div>
              <div style={Object.assign({}, mno, { fontSize: 22, fontWeight: 700, color: x[1] == null ? C.ash : C.brass })}>{x[1] == null ? "—" : x[1]}</div>
            </div>))}
        </div>
        <Note>If a fifth number ever appears, something has wandered.</Note>
      </Card>

      <Card>
        <Eye c={C.moss}>Week by week</Eye>
        <div style={{ overflowX: "auto" }}>
          <table style={Object.assign({}, bdy, { width: "100%", minWidth: 380, borderCollapse: "collapse", fontSize: 12 })}>
            <thead><tr>{["Week", "Days done", "Best cycles", "BOLT", "Crossover"].map((h) => <th key={h} style={Object.assign({}, mno, { textAlign: h === "Week" ? "left" : "right", color: C.ash, fontSize: 8, letterSpacing: 1, padding: "6px 6px 6px 0", borderBottom: "1px solid " + C.line })}>{h.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.mon}>
                  <td style={Object.assign({}, mno, { color: C.ash, fontSize: 9.5, padding: "8px 6px 8px 0", borderBottom: "1px solid " + C.line })}>{r.label}</td>
                  <td style={{ textAlign: "right", padding: "8px 6px 8px 0", borderBottom: "1px solid " + C.line, color: r.days >= 7 ? C.moss : C.chalk }}>
                    {r.days}/7{r.floors ? <span style={Object.assign({}, mno, { fontSize: 9, color: C.brass })}> ·{r.floors}F</span> : null}
                  </td>
                  <td style={{ textAlign: "right", padding: "8px 6px 8px 0", borderBottom: "1px solid " + C.line, color: r.cycles ? C.chalk : C.ash }}>{r.cycles || "—"}</td>
                  <td style={{ textAlign: "right", padding: "8px 6px 8px 0", borderBottom: "1px solid " + C.line, color: r.bolt != null ? C.chalk : C.ash }}>{r.bolt != null ? r.bolt + "s" : "—"}</td>
                  <td style={{ textAlign: "right", padding: "8px 6px 8px 0", borderBottom: "1px solid " + C.line, color: r.gap != null ? C.chalk : C.ash }}>{r.gap != null ? r.gap : "—"}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
        <Note>F marks a floor day. A floor day counts. A skipped day doesn't.</Note>
      </Card>

      <Card ac={C.moss}><Eye c={C.moss}>Days done</Eye><MiniBars data={rows.map((r) => [r.label, r.days])} color={C.moss} /></Card>
      <Card ac={C.violet}><Eye c={C.violet}>Best clean cycles</Eye><MiniBars data={rows.map((r) => [r.label, r.cycles || null])} color={C.violet} /></Card>
      <Card ac={C.cobalt}><Eye c={C.cobalt}>BOLT</Eye><MiniBars data={rows.map((r) => [r.label, r.bolt])} color={C.cobalt} />
        <Note>The single biggest lever on your BOLT is nose breathing, all day. Breathe Light moves it more than everything else combined.</Note></Card>
      <Card ac={C.oxide}><Eye c={C.oxide}>Crossover gap</Eye><MiniBars data={rows.map((r) => [r.label, r.gap])} color={C.oxide} />
        <Note>Your physical numbers climb first. The mental numbers are what you're here for, and they lag by months. That lag is the program.</Note></Card>

      <div style={Object.assign({}, mno, { fontSize: 9.5, letterSpacing: 1.8, color: C.brass, padding: "14px 2px 8px" })}>THE GATES</div>
      <GatesPanel IM={IM} />
    </div>);
}
