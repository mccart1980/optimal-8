import React, { useState } from "react";
import { C, dsp, bdy, mno, num, fmtDate, Card, Eye, Lab, Fld, Btn, Chip, Note } from "./ui.jsx";
import { Lines } from "./today.jsx";
import { SleepFields } from "./metrics-ui.jsx";
import {
  SEASON_ROWS, SEASON_GATED, cell, seasonRowFor, seasonRowDates, seasonSunday,
  LIFE_INTRO, RULES, LIFE_TEST_INTRO, LIFE_TESTS, LIFE_TEST_ROTATE, lifeTestForWeek,
  LIFE_REVIEW_Q, LIFE_NUMBERS, AUDIT_Q, AUDIT_HOW, AUDIT_WEEKS, AUDIT_NAMES, LIFE_BUILDS,
  NIGHT_INTRO, NIGHT_RULES, NIGHT_CLOSE, NIGHT_LINE, lightsTarget,
  FIGHT_WEEK_INTRO, FIGHT_WEEK, FIGHT_HARDSHIP, AFTER_FIGHT, AFTER_STAGE4, AFTER_VERDICT, AFTER_Q, HALF_DAY, HALF_DAY_WEEK,
} from "./life.js";

/* ================================================================
   THE RULES — the code, made specific. On the GUIDE tab and in the
   IRON library.
   ================================================================ */
export function RulesCard() {
  return (
    <Card ac={C.brass}>
      <Eye c={C.brass}>The rules — the code, made specific</Eye>
      <Lines rows={RULES.map((r) => ({ n: r.n, how: r.s }))} colour={C.brass} />
    </Card>);
}

/* ================================================================
   TODAY — the bodies of the Life pillar's rows
   ================================================================ */
/* the week's life test: ticked on the row, its cost scored here */
export function LifeTestBody({ test, rec, setRec }) {
  return (
    <div>
      <Note c={C.chalk} s={{ marginTop: 0 }}>{test.s}</Note>
      <div style={{ marginTop: 10 }}>
        <Lab>What it cost you, 1–10</Lab>
        <Fld v={rec.cost} on={(v) => setRec({ cost: v, test: test.id })} ph="cost 1–10" />
      </div>
      <Note>{LIFE_TEST_INTRO}</Note>
    </div>);
}

/* the Sunday life review: four questions, then the three numbers */
export function LifeReviewBody({ rec, setRec, oneThing, month }) {
  const control = num(rec.control);
  return (
    <div>
      <Lines rows={LIFE_REVIEW_Q} colour={C.brass} />
      {month ? <Note c={C.brass} bold>The month's one thing: {month.text}</Note> : null}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <Lab>Control score</Lab>
          <Fld v={rec.control} on={(v) => setRec({ control: v })} ph="1–10" />
        </div>
        <div style={{ flex: 1 }}>
          <Lab>Reactivity count</Lab>
          <Fld v={rec.react} on={(v) => setRec({ react: v })} ph="times moved" />
        </div>
      </div>
      {control != null && (control < 1 || control > 10) ? <Note c={C.oxide}>One number, 1 to 10.</Note> : null}
      <div style={{ background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "10px 12px", marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={Object.assign({}, mno, { fontSize: 13, color: C.ash, letterSpacing: 1 })}>ONE-THING RATE</span>
        <span data-testid="onething-rate" style={Object.assign({}, mno, { fontSize: 24, fontWeight: 700, color: C.brass })}>{oneThing}/7</span>
      </div>
      <Note>The mornings the one thing was ticked this week. {LIFE_NUMBERS[2].s}</Note>
    </div>);
}

/* the monthly audit: three questions, and the month's one thing named */
export function AuditBody({ rec, setRec }) {
  return (
    <div>
      <Lines rows={AUDIT_Q} colour={C.oxide} />
      <Note>{AUDIT_HOW}</Note>
      <div style={{ marginTop: 10 }}>
        <Lab>The month's one thing</Lab>
        <Fld v={rec.month} on={(v) => setRec({ month: v })} ph="name it" type="text" a="left" />
      </div>
    </div>);
}

/* THE NIGHT: tonight's target, the protocol on tap, the time logged */
export function NightBody({ day, dayIso, nextIso, morning, setMorning }) {
  const [open, setOpen] = useState(false);
  const T = lightsTarget(day);
  return (
    <div>
      <div style={Object.assign({}, dsp, { fontSize: 26, fontWeight: 800, letterSpacing: 1.2, color: C.cobalt })}>{T.t ? "LIGHTS OUT BY " + T.t : "AIM FOR 8½ HOURS"}</div>
      <Note c={C.chalk}>{T.line} {NIGHT_LINE}</Note>
      <div style={{ marginTop: 12 }}>
        <SleepFields dayIso={dayIso} nextIso={nextIso} morning={morning} setMorning={setMorning} />
      </div>
      <Btn small c={C.cobalt} fill={open} s={{ width: "100%", marginTop: 12 }} on={() => setOpen(!open)}>{open ? "HIDE THE PROTOCOL" : "THE PROTOCOL — SEVEN RULES"}</Btn>
      {open ? (
        <div className="rise" style={{ marginTop: 8 }}>
          <Lines rows={NIGHT_RULES.map((r) => ({ n: r.n, how: r.s }))} colour={C.cobalt} />
          <Note>{NIGHT_CLOSE}</Note>
        </div>) : null}
    </div>);
}

/* the half-day sit, on the Sunday the season names */
export function HalfDayBody({ open }) {
  return (
    <div>
      <Note c={C.chalk} s={{ marginTop: 0 }}>{HALF_DAY}</Note>
      <Btn on={() => open({ kind: "guided", id: "walk" })} c={C.moss} s={{ width: "100%", marginTop: 10 }}>▶ WALKING MEDITATION — BETWEEN THE SITS</Btn>
    </div>);
}

/* the fight-week mind, above the evening */
export function FightWeekCard({ w }) {
  const F = FIGHT_WEEK[w];
  if (!F) return null;
  return (
    <Card ac={C.oxide}>
      <Eye c={C.oxide}>The fight-week mind</Eye>
      <div data-testid="fight-week-mind" style={Object.assign({}, dsp, { fontSize: 24, fontWeight: 800, letterSpacing: 1.3, color: C.chalk })}>{F.n}</div>
      <Note c={C.chalk}>{F.s}</Note>
    </Card>);
}

/* ================================================================
   AFTER THE FIGHT — the page that opens Stage 4
   ================================================================ */
export function AfterFightCard({ st, onOpen, verdict }) {
  const open = (st.medStage || 1) >= 4 && (st.breathStage || 1) >= 4;
  return (
    <Card ac={C.moss}>
      <Eye c={C.moss}>After the fight</Eye>
      <Note c={C.chalk} s={{ marginTop: 0 }}>{AFTER_FIGHT}</Note>
      <Note c={C.chalk} bold>The extra question, once: {AFTER_Q}</Note>
      <Note c={C.moss} bold>{AFTER_STAGE4}</Note>
      {open
        ? <div style={Object.assign({}, mno, { fontSize: 14, color: C.moss, letterSpacing: 1.2, marginTop: 10 })}>STAGE 4 IS OPEN — MEDITATION AND BREATH</div>
        : <Btn c={C.moss} fill s={{ width: "100%", marginTop: 12 }} on={onOpen}>OPEN STAGE 4 — MEDITATION AND BREATH</Btn>}
      {verdict ? (
        <div style={{ marginTop: 12, borderTop: "1px solid " + C.line, paddingTop: 10 }}>
          <Note s={{ marginTop: 0 }}>{AFTER_VERDICT}</Note>
          <VerdictGrid v={verdict} />
        </div>) : null}
    </Card>);
}

function VerdictGrid({ v }) {
  const cells = [["DAYS DONE · 24 WEEKS", v.days], ["BEST CLEAN CYCLES", v.cycles || null],
    ["REACTIVITY · WEEK 1", v.react1], ["REACTIVITY · WEEK 24", v.react24]];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
      {cells.map((x) => (
        <div key={x[0]} style={{ flex: "1 1 40%", background: C.ink, border: "1px solid " + C.line, borderRadius: 5, padding: "10px 6px", textAlign: "center" }}>
          <div style={Object.assign({}, mno, { fontSize: 10, color: C.ash, letterSpacing: 1 })}>{x[0]}</div>
          <div style={Object.assign({}, mno, { fontSize: 22, fontWeight: 700, color: x[1] == null ? C.ash : C.brass })}>{x[1] == null ? "—" : x[1]}</div>
        </div>))}
    </div>);
}

/* ================================================================
   IRON TAB — THE SEASON
   ================================================================ */
export function SeasonMindView({ IM }) {
  const st = IM.st, w = IM.imWeek, now = seasonRowFor(w);
  const mine = [["Meditation", st.medStage || 1, now.med], ["Breath", st.breathStage || 1, now.breath], ["Hardship", st.hardLevel || 1, now.hard]];
  return (
    <div>
      <Card ac={C.brass}>
        <Eye c={C.brass}>The season — twenty-four weeks, dated</Eye>
        <div style={Object.assign({}, dsp, { fontSize: 26, fontWeight: 800, letterSpacing: 1.2, color: C.chalk, lineHeight: 1.1 })}>
          {w <= 24 ? "SEASON WEEK " + w + " OF 24" : "AFTER THE FIGHT"}
        </div>
        <Note c={C.chalk}>
          {st.fightDate
            ? "Week 1 is " + fmtDate(IM.seasonStart) + "; week 24 ends on the fight, " + fmtDate(st.fightDate) + ". The weeks line up with PREP and CAMP."
            : "No fight date — the season counts from the Iron Mind start in settings. Set a fight date and it dates itself back from the fight."}
        </Note>
        <div style={{ marginTop: 10 }}>
          {mine.map((x) => (
            <div key={x[0]} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 16, color: C.chalk })}>{x[0]}</span>
              <span style={Object.assign({}, mno, { fontSize: 14, color: x[1] >= x[2] ? C.moss : C.brass })}>
                {(x[0] === "Hardship" ? "LEVEL " : "STAGE ") + x[1]} · THE SEASON EXPECTS {x[2]}
              </span>
            </div>))}
        </div>
        <Note>{SEASON_GATED}</Note>
      </Card>

      {SEASON_ROWS.map((r) => {
        const isNow = r === now;
        return (
          <Card key={r.from} ac={isNow ? C.brass : C.line} s={{ opacity: isNow ? 1 : .82 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={Object.assign({}, dsp, { fontSize: 19, fontWeight: 800, letterSpacing: 1.1, color: C.chalk })}>
                {r.after ? "AFTER" : r.from === r.to ? "WEEK " + r.from : "WEEKS " + r.from + "–" + r.to}
              </span>
              {isNow ? <Chip c={C.brass}>This week</Chip> : null}
            </div>
            <div style={Object.assign({}, mno, { fontSize: 13, color: C.brass, marginTop: 4 })}>{seasonRowDates(st, r).toUpperCase()}</div>
            {[["Meditation", r.meditation], ["Breath", r.breathL], ["Hardship", r.hardship], ["Life", r.life], ["Training", r.training]].map((x) => (
              <div key={x[0]} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid " + C.line }}>
                <span style={Object.assign({}, mno, { fontSize: 11, color: C.ash, width: 78, flexShrink: 0, letterSpacing: .8, paddingTop: 3 })}>{x[0].toUpperCase()}</span>
                <span style={Object.assign({}, bdy, { fontSize: 15, color: C.chalk, lineHeight: 1.4 })}>{cell(x[1], st)}</span>
              </div>))}
          </Card>); })}

      <Card ac={C.oxide}>
        <Eye c={C.oxide}>The fight-week mind — weeks 23 and 24</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{FIGHT_WEEK_INTRO}</Note>
        {[23, 24].map((k) => (
          <div key={k} style={{ marginTop: 10, borderTop: "1px solid " + C.line, paddingTop: 8 }}>
            <div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 800, letterSpacing: 1.1, color: IM.fightWeek === k ? C.oxide : C.chalk })}>{FIGHT_WEEK[k].n}</div>
            <Note c={C.chalk}>{FIGHT_WEEK[k].s}</Note>
          </div>))}
        <Note c={C.oxide} bold>{FIGHT_HARDSHIP}</Note>
      </Card>

      <AfterFightCard st={st} onOpen={IM.openStage4} verdict={IM.verdict} />
    </div>);
}

/* ================================================================
   IRON TAB — LIFE
   ================================================================ */
export function LifeView({ IM }) {
  const st = IM.st, w = IM.imWeek, thisTest = lifeTestForWeek(w);
  const paused = !!IM.fightWeek;
  const rec = (IM.wks[IM.weekMonday] || {}).life || {};
  return (
    <div>
      <Card ac={C.brass}>
        <Eye c={C.brass}>The life pillar — the man, not the fighter</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{LIFE_INTRO}</Note>
      </Card>
      <RulesCard />

      <div style={Object.assign({}, mno, { fontSize: 13, letterSpacing: 1.8, color: C.brass, padding: "12px 2px 8px" })}>THE LIFE TEST — ONE A WEEK, ROTATING</div>
      <Card><Note c={C.chalk} s={{ marginTop: 0 }}>{LIFE_TEST_INTRO}</Note>
        {paused ? <Note c={C.oxide} bold>The fight-week mind: the life test pauses. The rules hold, especially six and seven.</Note> : null}</Card>
      {LIFE_TESTS.map((t, i) => { const isNow = t.id === thisTest.id;
        return (
          <Card key={t.id} ac={isNow ? C.brass : C.line} s={{ opacity: isNow ? 1 : .74 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 800, letterSpacing: 1, color: isNow ? C.chalk : C.ash })}>{i + 1}. {t.n.toUpperCase()}</span>
              {isNow ? <Chip c={paused ? C.oxide : C.brass}>{paused ? "Paused" : rec.done ? "Done ✓" : "This week"}</Chip> : null}
            </div>
            <Note c={C.chalk}>{t.s}</Note>
          </Card>); })}
      <Note>{LIFE_TEST_ROTATE}</Note>

      <Card ac={C.brass}>
        <Eye c={C.brass}>The Sunday life review — five minutes, spoken</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>After the weekly check. Then the three numbers.</Note>
        <Lines rows={LIFE_REVIEW_Q} colour={C.brass} />
        <Lines rows={LIFE_NUMBERS.map((x) => ({ n: x.n, how: x.s }))} colour={C.brass} />
      </Card>

      <Card ac={C.oxide}>
        <Eye c={C.oxide}>The monthly audit — twenty minutes</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{AUDIT_HOW}</Note>
        <Lines rows={AUDIT_Q} colour={C.oxide} />
        <div style={{ marginTop: 10 }}>
          {AUDIT_WEEKS.map((aw, i) => (
            <div key={aw} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid " + C.line }}>
              <span style={Object.assign({}, bdy, { fontSize: 15, color: C.chalk })}>{AUDIT_NAMES[i]} audit</span>
              <span style={Object.assign({}, mno, { fontSize: 13, color: aw === w ? C.oxide : C.ash })}>{fmtDate(seasonSunday(st, aw))} · WK {aw}</span>
            </div>))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={Object.assign({}, bdy, { fontSize: 15, color: C.chalk })}>The half-day sit</span>
            <span style={Object.assign({}, mno, { fontSize: 13, color: C.ash })}>{fmtDate(seasonSunday(st, HALF_DAY_WEEK))} · WK {HALF_DAY_WEEK}</span>
          </div>
        </div>
      </Card>

      <Card ac={C.moss}><Eye c={C.moss}>What this builds, in plain terms</Eye><Note c={C.chalk} s={{ marginTop: 0 }}>{LIFE_BUILDS}</Note></Card>

      <Card ac={C.cobalt}>
        <Eye c={C.cobalt}>The night — the sleep protocol</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>{NIGHT_INTRO}</Note>
        <Lines rows={NIGHT_RULES.map((r) => ({ n: r.n, how: r.s }))} colour={C.cobalt} />
        <Note>{NIGHT_CLOSE}</Note>
      </Card>
    </div>);
}
