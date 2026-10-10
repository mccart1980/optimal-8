import React from "react";
import { C, dsp, bdy, mno, fmtDate, num } from "./ui.jsx";
import { T2, T3 } from "./now.jsx";
import { kg1, r1, forecastTone, overLine, CHECKPOINT_TEXT, HOLD_WHY, STEP_SAY, STEP_KCAL, WEIGH_IN_SAY, LIGHT_DAYS_TEXT } from "./weight.js";

/* ================================================================
   MAKING WEIGHT — the screens: the line's card, the over-the-ceiling
   card, the Sunday check's weight result, the morning's line under the
   scales, and the FOOD banner. weight-making.md, nothing else.
   ================================================================ */
const toneC = { red: C.oxide, amber: C.brass, green: C.moss };
const Row = ({ k, v, c, tid }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "6px 0", borderTop: "1px solid " + C.line }}>
    <span style={Object.assign({}, mno, { fontSize: T3, color: C.ash, letterSpacing: .6 })}>{k}</span>
    <span data-testid={tid} style={Object.assign({}, mno, { fontSize: T3, fontWeight: 700, color: c || C.chalk, textAlign: "right" })}>{v}</span>
  </div>);
const P = ({ children, c, bold, s }) => <p style={Object.assign({}, bdy, { margin: "8px 0 0", fontSize: T3, lineHeight: 1.5, color: c || C.chalk, fontWeight: bold ? 700 : 400 }, s)}>{children}</p>;
const Box = ({ children, c, tid }) => <div data-testid={tid} style={{ background: C.card, border: "2px solid " + (c || C.brass), borderRadius: 10, padding: 14, marginBottom: 12 }}>{children}</div>;
const Head = ({ children, c }) => <div style={Object.assign({}, dsp, { fontSize: T2, fontWeight: 800, letterSpacing: 1.2, color: c || C.brass, marginBottom: 6 })}>{children}</div>;
const short = (s) => fmtDate(s).toUpperCase();

/* THE CHECKPOINT — over the ceiling, said plainly. */
export function OverCard({ forecast, C: ceil }) {
  return (
    <Box c={C.oxide} tid="over-card">
      <Head c={C.oxide}>OVER THE CEILING</Head>
      <P bold>{overLine(forecast, ceil)}</P>
      {CHECKPOINT_TEXT.map((t, i) => <P key={i}>{t}</P>)}
    </Box>);
}

/* The line, when it's set or redrawn: the Sunday aims, the fight-week
   aim, the weigh-in morning aim, the step and the forecast. */
export function LineCard({ line, step, from }) {
  if (!line) return null;
  const tone = forecastTone(line.forecast, line.C);
  const fd = line.dates;
  return (
    <div>
      <Box tid="line-card">
        <Head>MAKING WEIGHT · THE LINE</Head>
        <P c={C.ash} s={{ marginTop: 0 }}>{line.why === "settle" ? "Redrawn from the first week's average, " + kg1(line.S) + "." : line.why === "redraw" ? "Redrawn from your latest average, " + kg1(line.S) + ". The step stays where it is." : line.prov ? "Drawn from one morning, " + kg1(line.S) + ": the first week settles, and the first Sunday's average redraws it." : "Drawn from your seven-morning average, " + kg1(line.S) + "."}</P>
        <div style={{ marginTop: 8 }}>
          {line.sundays.map((s, i) => <Row key={s} k={"SUNDAY " + short(s).replace(/^[A-Z]+,? /, "")} v={kg1(line.aims[i])} tid={"aim-" + s} />)}
        </div>
        <Row k="FIGHT-WEEK AIM" v={kg1(line.F)} tid="fight-week-aim" />
        <P c={C.ash} s={{ marginTop: 2 }}>Your average on {fmtDate(fd.lastCheck)}, the last check.</P>
        <Row k="WEIGH-IN MORNING AIM" v={kg1(line.M)} tid="morning-aim" />
        <P c={C.ash} s={{ marginTop: 2 }}>On waking, {fmtDate(fd.weighDay)} — weighing in {WEIGH_IN_SAY[line.cfg.weighIn]}.</P>
        <Row k="THE STEP" v={"STEP " + step + (from ? " FROM " + short(from) : "")} tid="line-step" />
        <P c={C.ash} s={{ marginTop: 2 }}>~{STEP_KCAL[step].toLocaleString()} a day. {STEP_SAY[step]}</P>
        <Row k="FORECAST ON THE SCALES" v={"about " + kg1(line.forecast)} c={toneC[tone]} tid="line-forecast" />
        <P c={C.ash} s={{ marginTop: 2 }}>Ceiling {kg1(line.C)}: the limit plus the tolerance.</P>
        {line.capped ? <P c={C.brass}>The real weight can't reach the aim inside the speed limit — 1% of your natural weight a week, {kg1(0.01 * line.U)} kg — so the line runs at the limit.</P> : null}
        {line.hold ? <P c={C.moss}>You're already at the fight-week aim: the line holds there, Step 0.</P> : null}
      </Box>
      {line.forecast > line.C + 1e-9 ? <OverCard forecast={line.forecast} C={line.C} /> : null}
    </div>);
}

/* THE SUNDAY CHECK's bodyweight line, while the plan is on. */
export function WeightResult({ check, onAsk, asked }) {
  if (!check) return null;
  const c = check;
  if (c.pending) return (
    <div data-testid="weight-result" style={{ marginTop: 12 }}>
      <div style={Object.assign({}, mno, { fontSize: T3, color: C.brass, letterSpacing: .6 })}>FEWER THAN 3 MORNINGS THIS WEEK</div>
      <P s={{ marginTop: 4 }}>One weight, this morning — toilet first, nothing on — and the check uses it.</P>
      <label style={{ display: "block", marginTop: 8 }}>
        <span style={Object.assign({}, mno, { display: "block", fontSize: T3, color: C.ash, marginBottom: 4 })}>ONE WEIGHT (KG)</span>
        <input data-testid="weight-ask" value={asked == null ? "" : asked} onChange={(e) => onAsk(e.target.value)} inputMode="decimal" placeholder="—"
          style={Object.assign({}, mno, { width: "100%", background: C.ink, border: "1px solid " + C.line, borderRadius: 6, color: C.chalk, fontSize: T2, padding: "12px 10px", minHeight: 56 })} />
      </label>
    </div>);
  if (c.settle) return (
    <div data-testid="weight-result" style={{ marginTop: 12 }}>
      <Row k="AVERAGE" v={kg1(c.A)} tid="wr-average" />
      <Row k="VERDICT" v="THE FIRST WEEK SETTLED" c={C.brass} tid="wr-verdict" />
      <P c={C.ash} s={{ marginTop: 2 }}>The line is redrawn from this average: {c.line.aims.map((a) => kg1(a)).join(" · ")}.</P>
      <Row k="NEXT WEEK" v={"STEP " + c.next} tid="wr-step" />
      <Row k="FORECAST" v={"about " + kg1(c.forecast)} c={toneC[forecastTone(c.forecast, c.line.C)]} tid="wr-forecast" />
      {c.over ? <div style={{ marginTop: 10 }}><OverCard forecast={c.forecast} C={c.line.C} /></div> : null}
    </div>);
  const ch = c.prevA != null ? c.A - c.prevA : null;
  const verdictC = c.verdict === "ON TRACK" ? C.moss : c.verdict === "BEHIND" || c.verdict === "HOLDING" ? C.oxide : c.verdict === "LAST CHECK" ? C.brass : C.cobalt;
  return (
    <div data-testid="weight-result" style={{ marginTop: 12 }}>
      <Row k={c.src === "asked" ? "THIS MORNING" : "SEVEN-MORNING AVERAGE"} v={kg1(c.A)} tid="wr-average" />
      <Row k="ON LAST WEEK" v={ch == null ? "—" : (r1(ch) > 0 ? "+" : "") + kg1(ch)} tid="wr-change" />
      <Row k="THE AIM" v={kg1(c.aim)} tid="wr-aim" />
      <Row k="VERDICT" v={c.verdict} c={verdictC} tid="wr-verdict" />
      {c.verdict === "HOLDING" ? <P c={C.ash} s={{ marginTop: 2 }}>More than 0.4 over the aim, but holding: {HOLD_WHY[c.why]}.</P> : null}
      {c.young ? <P c={C.ash} s={{ marginTop: 2 }}>No step up in the plan's first two weeks: the first drop is water and food, not fat.</P> : null}
      <Row k="NEXT WEEK" v={c.last ? "FIGHT WEEK · STEP " + c.next : "STEP " + c.next + (c.next !== c.stepBefore ? " FROM MONDAY" : "")} tid="wr-step" />
      <Row k="FORECAST" v={"about " + kg1(c.forecast)} c={toneC[forecastTone(c.forecast, c.line.C)]} tid="wr-forecast" />
      {c.checkpoint ? <P c={C.brass} s={{ marginTop: 4 }}>The checkpoint: two Sundays before fight week.</P> : null}
      {c.last ? <P c={C.ash} s={{ marginTop: 4 }}>The last check. Nothing changes: your step until {c.line.dates.light ? "the light days, " + fmtDate(c.line.dates.light[0]) + " and " + fmtDate(c.line.dates.light[1]) : "the two low-fibre days, " + fmtDate(c.line.dates.lowFibre[0]) + " and " + fmtDate(c.line.dates.lowFibre[1])}; weigh-in morning aim {kg1(c.line.M)} on waking.</P> : null}
      {c.over ? <div style={{ marginTop: 10 }}><OverCard forecast={c.forecast} C={c.line.C} /></div> : null}
    </div>);
}

/* Under the morning scales: the seven-morning average and this Sunday's
   aim. On the weigh-in morning, the number against the morning aim. */
export function ScalesLine({ avg, aim, wd, kg }) {
  const M = wd.nums.M;
  const weighMorning = wd.kind === "weighin" || (wd.kind === "fight" && wd.cfg.weighIn === "day");
  return (
    <div>
      <div data-testid="scales-line" style={Object.assign({}, mno, { fontSize: T3, color: C.ash, marginTop: 10, lineHeight: 1.45 })}>
        SEVEN-MORNING AVERAGE <span style={{ color: C.chalk, fontWeight: 700 }}>{avg == null ? "— (3 mornings)" : kg1(avg)}</span> · {aim != null ? "THIS SUNDAY'S AIM" : "WEIGH-IN MORNING AIM"} <span style={{ color: C.brass, fontWeight: 700 }}>{kg1(aim != null ? aim : M)}</span>
      </div>
      {weighMorning && num(kg) != null ? (
        <div data-testid="weighin-morning" style={Object.assign({}, bdy, { fontSize: T3, fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: num(kg) > M + 1e-9 ? C.oxide : C.moss })}>
          {num(kg) > M + 1e-9
            ? kg1(num(kg) - M) + " over the weigh-in morning aim of " + kg1(M) + "." + (wd.cfg.weighIn === "before" ? " Halve the small feeds and keep sipping." : " Sip water; the toilet and a walk before the official scales.")
            : "On or under the weigh-in morning aim of " + kg1(M) + "."}
        </div>) : null}
    </div>);
}

/* THE FOOD BANNER: MAKING WEIGHT · STEP n · this Sunday's aim, and in
   one line the feed the step takes away. */
export function WeightBanner({ wd, waiting }) {
  if (!wd) return null;
  const k = wd.kind;
  const head = k === "light" ? "MAKING WEIGHT · THE LIGHT DAYS" : k === "weighin" ? "MAKING WEIGHT · WEIGH-IN DAY · MORNING AIM " + kg1(wd.nums.M)
    : k === "fight" ? "MAKING WEIGHT · FIGHT DAY" + (wd.cfg.weighIn === "day" ? " · MORNING AIM " + kg1(wd.nums.M) : "")
    : k === "lowfibre" ? "MAKING WEIGHT · STEP 0 · LOW FIBRE"
    : "MAKING WEIGHT · STEP " + wd.step + (wd.aim != null ? " · SUNDAY'S AIM " + kg1(wd.aim) : " · MORNING AIM " + kg1(wd.nums.M));
  const line = k === "light" ? LIGHT_DAYS_TEXT[0] + " " + LIGHT_DAYS_TEXT[1]
    : k === "weighin" ? (wd.cfg.weighIn === "am" ? "Nothing to eat until you've weighed in; sip water to thirst." : "Small low-fibre feeds every three hours, the last two hours before you weigh in.")
    : k === "fight" ? (wd.cfg.weighIn === "day" ? "Nothing before the scales." : "The top-up, then the bell.")
    : k === "lowfibre" ? "The full day, low-fibre options only: the carbs come back, only the fibre goes."
    : waiting ? "Step on the scales: the line is drawn from your first weight."
    : wd.step >= 1 ? "No three o'clock this week." : null;
  return (
    <div data-testid="weight-banner" style={{ background: C.card, border: "2px solid " + C.oxide, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
      <div style={Object.assign({}, dsp, { fontSize: T2, fontWeight: 800, letterSpacing: 1.2, color: C.oxide })}>{head}</div>
      {line ? <div data-testid="weight-banner-line" style={Object.assign({}, bdy, { fontSize: T3, color: C.chalk, marginTop: 4, lineHeight: 1.45 })}>{line}</div> : null}
    </div>);
}

/* The light days' rules, under the day's food. */
export const lightDaysNotes = () => LIGHT_DAYS_TEXT.slice(2);
