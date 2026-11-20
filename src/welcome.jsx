import React, { useRef, useState } from "react";
import { C, soft, dsp, bdy, mno, RAD, Icon, Btn, Seg, Fld, Note, Lab, CheckDot, TEXT_STEPS, THEME_STEPS, num } from "./ui.jsx";

/* ================================================================
   THE WELCOME — the first thing a new phone sees, once.

   Four short screens: what the app is, what you want to run, your
   working maxes, and how you want it to look and sound. A backup can
   be loaded from the first screen, so moving to a new phone (or adding
   the app again for a new icon) is one tap.

   It shows only on a phone with nothing saved. Everything it sets can
   be changed later in MORE → SETTINGS and PROGRESS → NUMBERS.
   ================================================================ */

/* the bull: the same shapes as the icon (scripts/generate-icons.mjs), on a 1024 grid */
const MARK = [
  ["a", "415 348 372 400 307 406 237 368 190 301 179 222 206 161 235 238 276 289 332 314 393 318"],
  ["a2", "631 318 692 314 748 289 789 238 818 161 845 222 834 301 787 368 717 406 652 400 609 348"],
  ["b", "348 424 267 417 215 449 276 492 345 487"],
  ["b2", "679 487 748 492 809 449 757 417 676 424"],
  ["a", "512 318 415 348 348 420 345 512 379 607 397 670 372 737 386 813 440 852 512 863"],
  ["a2", "512 863 584 852 638 813 652 737 627 670 645 607 679 512 676 420 609 348 512 318"],
  ["b", "345 512 379 607 397 670 372 737 386 813 426 755 440 669 409 582"],
  ["b2", "615 582 584 669 598 755 638 813 652 737 627 670 645 607 679 512"],
  ["k", "386 489 478 530 474 568 399 541"],
  ["k", "625 541 550 568 546 530 638 489"],
  ["k", "433 753 487 768 481 805 442 796"],
  ["k", "582 796 543 805 537 768 591 753"],
];
export function Mark({ size, lit, shade, ground }) {
  const fill = { a: lit || C.markLit, a2: lit || C.markLit, b: shade || C.markShade, b2: shade || C.markShade, k: ground || C.ink };
  return (
    <svg viewBox="0 0 1024 1024" width={size || 132} height={size || 132} aria-hidden="true" style={{ display: "block" }}>
      {MARK.map((m, i) => <polygon key={i} points={m[1]} style={{ fill: fill[m[0]] }} />)}
    </svg>);
}

/* what can run when no fight is booked: its key, its name, its length, one line */
export const RUNS = [
  ["spp", "Strength, Power and Physique", "12 weeks, then round again", "Size, then strength, then power, with the engine held."],
  ["prep", "Prep", "A 16-week cycle, then round again", "Everything built together, tilting from volume to speed, with three hard engine sessions a week."],
];
const POINTS = [
  ["today", "Your day, in order", "Open it and it shows the next thing to do. Nothing to plan."],
  ["skip", "Timers that run the session", "Rounds, rests and intervals, with a bell and a clock you can read across the gym."],
  ["progress", "Numbers that move", "Strength, bar speed, jumps, the engine and the tape, each with its trend."],
];

export function Welcome({ st, upd, maxes, onMaxes, onRun, onRestore, onDone }) {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState("spp");
  const [mx, setMx] = useState({ squat: "", bench: "", tbdl: "" });
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const next = () => setStep(step + 1);
  const H = ({ children }) => <h1 style={Object.assign({}, dsp, { margin: "0 0 8px", fontSize: 30, fontWeight: 800, letterSpacing: -.5, lineHeight: 1.12, color: C.chalk })}>{children}</h1>;
  const P = ({ children }) => <p style={Object.assign({}, bdy, { margin: "0 0 18px", fontSize: 18, lineHeight: 1.45, color: C.ash })}>{children}</p>;
  const saveMaxes = () => { const out = {}; ["squat", "bench", "tbdl"].forEach((k) => { const n = num(String(mx[k]).replace(",", ".")); if (n > 0) out[k] = n; });
    if (Object.keys(out).length) onMaxes(Object.assign({}, maxes || {}, out)); next(); };
  return (
    <div data-testid="welcome" className="fade" style={{ position: "fixed", inset: 0, zIndex: 200, background: C.ink, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100%", display: "flex", flexDirection: "column", padding: "calc(18px + env(safe-area-inset-top)) 22px calc(22px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", alignItems: "center", minHeight: 48, marginBottom: 6 }}>
          {step > 0 ? <button onClick={() => setStep(step - 1)} aria-label="Back a step" style={{ width: 48, height: 48, borderRadius: 999, border: "none", cursor: "pointer", padding: 0, background: soft(C.ash), color: C.chalk, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="left" size={22} w={2.6} /></button> : null}
          <div style={{ flex: 1 }} />
          <div data-testid="welcome-dots" aria-label={"Step " + (step + 1) + " of 4"} style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 999, background: i === step ? C.brass : C.ring, transition: "width .25s ease, background-color .25s ease" }} />)}
          </div>
        </div>

        {step === 0 ? (
          <div key="s0" className="rise" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", margin: "10px 0 22px" }}>
              <Mark size={132} />
              <div style={Object.assign({}, dsp, { fontSize: 40, fontWeight: 800, letterSpacing: 3, color: C.chalk, marginTop: 4 })}>FIGHTER</div>
              <div style={Object.assign({}, bdy, { fontSize: 19, lineHeight: 1.4, color: C.ash, marginTop: 6, maxWidth: 320 })}>Strength, power and engine for the ring. One thing at a time.</div>
            </div>
            <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: RAD.l, boxShadow: C.shadow, padding: "6px 16px", marginBottom: 20 }}>
              {POINTS.map((p, i) => (
                <div key={p[0]} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 0", borderTop: i ? "1px solid " + C.line : "none" }}>
                  <span style={{ width: 40, height: 40, borderRadius: RAD.s, background: soft(C.brass), color: C.brass, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon n={p[0]} size={22} w={2.2} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={Object.assign({}, bdy, { display: "block", fontSize: 18, fontWeight: 700, color: C.chalk, lineHeight: 1.3 })}>{p[1]}</span>
                    <span style={Object.assign({}, bdy, { display: "block", fontSize: 16, color: C.ash, lineHeight: 1.4, marginTop: 2 })}>{p[2]}</span>
                  </span>
                </div>))}
            </div>
            <div style={{ flex: 1 }} />
            <Btn c={C.brass} fill s={{ width: "100%", minHeight: 58, fontSize: 19, letterSpacing: 1 }} on={next}>GET STARTED</Btn>
            <Btn c={C.ash} s={{ width: "100%", marginTop: 10 }} on={() => { setMsg(""); if (fileRef.current) fileRef.current.click(); }}>I HAVE A BACKUP</Btn>
            <input ref={fileRef} data-testid="welcome-file" type="file" accept="application/json,.json" style={{ display: "none" }} aria-hidden="true" tabIndex={-1}
              onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
                const r = new FileReader(); r.onerror = () => setMsg("That file couldn't be read.");
                r.onload = () => { try { const txt = String(r.result || ""), d = JSON.parse(txt); if (!d || typeof d !== "object" || !d.st) throw new Error("not a backup"); onRestore(txt); } catch (err) { setMsg("That file isn't a Fighter backup."); } };
                r.readAsText(f); }} />
            {msg ? <Note c={C.oxide} s={{ textAlign: "center" }}>{msg}</Note> : null}
          </div>) : null}

        {step === 1 ? (
          <div key="s1" className="rise" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <H>What do you want to run?</H>
            <P>Pick one. You can change it whenever you like.</P>
            {RUNS.map((r) => { const on = run === r[0]; return (
              <button key={r[0]} onClick={() => setRun(r[0])} aria-pressed={on} data-run={r[0]}
                style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", textAlign: "left", cursor: "pointer", background: C.card, border: "1.5px solid " + (on ? C.brass : C.line), borderRadius: RAD.l, boxShadow: on ? "0 0 0 3px " + soft(C.brass) : C.shadow, padding: "14px 16px", marginBottom: 10 }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={Object.assign({}, bdy, { display: "block", fontSize: 19, fontWeight: 800, color: C.chalk, lineHeight: 1.25 })}>{r[1]}</span>
                  <span style={Object.assign({}, mno, { display: "block", fontSize: 13, fontWeight: 700, letterSpacing: .6, color: C.brass, textTransform: "uppercase", marginTop: 3 })}>{r[2]}</span>
                  <span style={Object.assign({}, bdy, { display: "block", fontSize: 16, color: C.ash, lineHeight: 1.4, marginTop: 5 })}>{r[3]}</span>
                </span>
                <CheckDot ok={on} c={C.brass} size={28} />
              </button>); })}
            <Note s={{ marginTop: 4 }}>A fight booked? Put the date in MORE → SETTINGS once you're in, and the app builds the camp back from it.</Note>
            <div style={{ flex: 1, minHeight: 18 }} />
            <Btn c={C.brass} fill s={{ width: "100%", minHeight: 58, fontSize: 19, letterSpacing: 1 }} on={() => { onRun(run); next(); }}>CONTINUE</Btn>
          </div>) : null}

        {step === 2 ? (
          <div key="s2" className="rise" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <H>Your working maxes</H>
            <P>Every load in the app is worked out from these. A working max is your heaviest clean set of 3, with one or two reps left in you, × 1.08. It is never a best single.</P>
            <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: RAD.l, boxShadow: C.shadow, padding: 16 }}>
              {[["squat", "Back squat"], ["bench", "Bench press"], ["tbdl", "Trap bar deadlift"]].map((f, i) => (
                <label key={f[0]} style={{ display: "block", marginTop: i ? 14 : 0 }}>
                  <span style={Object.assign({}, mno, { display: "block", fontSize: 15, fontWeight: 700, letterSpacing: .6, color: C.ash, textTransform: "uppercase", marginBottom: 6 })}>{f[1]} (kg)</span>
                  <Fld v={mx[f[0]]} on={(val) => setMx(Object.assign({}, mx, { [f[0]]: val }))} ph="kg" a="left" s={{ fontSize: 22, minHeight: 56 }} />
                </label>))}
            </div>
            <Note>Leave any of them blank and put it in later, in PROGRESS → NUMBERS.</Note>
            <div style={{ flex: 1, minHeight: 18 }} />
            <Btn c={C.brass} fill s={{ width: "100%", minHeight: 58, fontSize: 19, letterSpacing: 1 }} on={saveMaxes}>CONTINUE</Btn>
          </div>) : null}

        {step === 3 ? (
          <div key="s3" className="rise" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <H>Make it yours</H>
            <P>How it looks and sounds. All of it is in MORE → SETTINGS afterwards.</P>
            <div style={{ background: C.card, border: "1px solid " + C.line, borderRadius: RAD.l, boxShadow: C.shadow, padding: 16 }}>
              <Lab>Text size</Lab>
              <Seg opts={TEXT_STEPS.map((x) => [x[0], x[1]])} val={st.textSize || "n"} on={(v) => upd({ textSize: v })} />
              <div style={{ height: 16 }} />
              <Lab>Light or dark</Lab>
              <Seg opts={THEME_STEPS} val={st.theme === "light" || st.theme === "dark" ? st.theme : "auto"} on={(v) => upd({ theme: v })} />
              <div style={{ height: 16 }} />
              <Lab>Bells and pips on the timers</Lab>
              <Seg opts={[["on", "ON"], ["off", "OFF"]]} val={st.sound === false ? "off" : "on"} on={(v) => upd({ sound: v === "on" })} />
            </div>
            <Note>AUTO follows the phone: light when the phone is light, dark when it goes dark.</Note>
            <div style={{ flex: 1, minHeight: 18 }} />
            <Btn c={C.moss} fill s={{ width: "100%", minHeight: 58, fontSize: 19, letterSpacing: 1 }} on={onDone}>OPEN TODAY</Btn>
          </div>) : null}
      </div>
    </div>);
}
