import React, { useState, useRef, useMemo } from "react";
import { C, dsp, bdy, mno, num, buzz, fmtDate, Card, Eye, Lab, Fld, Btn, Note, Seg } from "./ui.jsx";
import {
  MORNING_FIELDS, rolling7, baseline, morningFlag, RHR_OVER, HRV_UNDER,
  recoveryDrop, recoveryBand, easyZone, zoneNote, ergUnitLabel, ergTotal, ergMean, recalibrated,
  BAR_SPEED_LIFTS, barSpeeds, sameLoadSeries, PHOTO_VIEWS, PHOTO_NOTE, photoWeeks,
  bodyNow, trend, series, pairSeries, CAMP_TARGET, r1,
} from "./metrics.js";

/* ================================================================
   THE MEASUREMENT LAYER — the screens.
   Every field here is optional and every one of them is a ten-second
   entry: a number, a tap, and back to the session.
   ================================================================ */

/* ---------- a small chart, same grammar as TRACK's bars ---------- */
export function MiniBars({ data, color, fmt }) {
  const vals = data.map((d) => d[1]); if (!vals.length) return <Note s={{ fontStyle: "italic" }}>Nothing logged yet.</Note>;
  const mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), span = mx - mn || mx || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginTop: 10 }}>
      {data.map((d, i) => { const rel = (d[1] - mn) / span, h = 20 + rel * 50, last = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0 }}>
            <div style={Object.assign({}, mno, { fontSize: 9, fontWeight: 700, color: last ? (color || C.brass) : C.chalk, marginBottom: 3 })}>{fmt ? fmt(d[1]) : d[1]}</div>
            <div style={{ width: "100%", height: h, background: last ? (color || C.brass) : C.line, borderRadius: "3px 3px 0 0" }} />
            <div style={Object.assign({}, mno, { fontSize: 7, color: C.ash, marginTop: 4, whiteSpace: "nowrap" })}>{d[0]}</div>
          </div>);
      })}
    </div>);
}

/* the one-line "against its own average, against week 1" readout */
const Against = ({ v, avg, base, dir, u }) => {
  if (v == null) return null;
  const d7 = avg == null ? null : v - avg, db = base == null ? null : v - base;
  const col = (delta) => (delta == null ? C.ash : Math.abs(delta) < 0.05 ? C.ash : (dir === "down" ? delta < 0 : delta > 0) ? C.moss : C.brass);
  const sign = (n) => (n > 0 ? "+" : "") + r1(n);
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
      <span style={Object.assign({}, mno, { fontSize: 13, color: C.ash, letterSpacing: .6 })}>
        7-DAY AVG <span style={{ color: C.chalk }}>{avg == null ? "—" : avg + (u ? " " + u : "")}</span>
        {d7 == null ? null : <span style={{ color: col(d7) }}> ({sign(d7)})</span>}
      </span>
      <span style={Object.assign({}, mno, { fontSize: 13, color: C.ash, letterSpacing: .6 })}>
        WEEK 1 <span style={{ color: C.chalk }}>{base == null ? "—" : base + (u ? " " + u : "")}</span>
        {db == null ? null : <span style={{ color: col(db) }}> ({sign(db)})</span>}
      </span>
    </div>);
};

/* ================================================================
   MORNING NUMBERS — on TODAY, above the daily check
   ================================================================ */
export function MorningCard({ dayIso, morning, setMorning, st, camp, isToday, sleep, bare }) {
  const rec = morning[dayIso] || {};
  const put = (f, v) => setMorning(Object.assign({}, morning, { [dayIso]: Object.assign({}, rec, { [f]: v }) }));
  const flag = morningFlag(rec, morning, st, dayIso);
  const ac = flag.level === "R" ? C.oxide : flag.level === "Y" ? C.brass : C.cobalt;
  const Wrap = bare ? ({ children }) => <div>{children}</div> : ({ children }) => <Card ac={ac}>{children}</Card>;
  return (
    <Wrap>
      <div style={{ marginBottom: 4 }}>
        <div style={Object.assign({}, dsp, { fontSize: 17, fontWeight: 800, letterSpacing: 1.5, color: ac })}>THE MORNING NUMBERS</div>
        <div style={Object.assign({}, mno, { fontSize: 8.5, color: isToday === false ? C.brass : C.ash, letterSpacing: 1.2, marginTop: 2 })}>
          {isToday === false ? fmtDate(dayIso).toUpperCase() : "FROM THE CHEST STRAP"}
        </div>
      </div>
      {MORNING_FIELDS.map((f) => {
        const avg7 = rolling7(morning, f.id, dayIso).avg;
        const b = baseline(morning, st)[f.id];
        const flagged = f.id === "rhr" ? flag.rhrUp : flag.hrvDown;
        return (
          <div key={f.id} style={{ padding: "9px 0", borderBottom: "1px solid " + C.line }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ flex: 1 }}>
                <div style={Object.assign({}, bdy, { fontSize: 14, fontWeight: 600, color: flagged ? C.brass : C.chalk })}>{f.n}</div>
                <div style={Object.assign({}, mno, { fontSize: 8, color: C.ash, letterSpacing: 1, marginTop: 2 })}>{f.u.toUpperCase()}</div>
              </span>
              <span style={{ width: 108 }}>
                <Fld v={rec[f.id]} on={(v) => put(f.id, v)} ph={f.u} s={{ fontSize: 19, fontWeight: 700 }} />
              </span>
            </div>
            <Against v={num(rec[f.id])} avg={r1(avg7)} base={b} dir={f.dir} u={f.u} />
          </div>); })}

      {sleep === false ? null : (
        <div style={{ padding: "9px 0", borderBottom: "1px solid " + C.line }}>
          <div style={Object.assign({}, mno, { fontSize: 8, color: C.ash, letterSpacing: 1.2, marginBottom: 6 })}>SLEEP, LAST NIGHT</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}><Lab>Hours slept</Lab><Fld v={rec.sleep} on={(v) => put("sleep", v)} ph="hours" /></div>
            <div style={{ flex: 1 }}><Lab>Lights out</Lab><Fld v={rec.lights} on={(v) => put("lights", v)} ph="21:30" type="text" /></div>
          </div>
        </div>)}

    </Wrap>);
}

/* The two sleep numbers, on the evening's lights-out row: last night's
   hours against this morning's record, tonight's lights-out against
   tomorrow's. The weekly check averages both across the week. */
export function SleepFields({ dayIso, nextIso, morning, setMorning }) {
  const rec = morning[dayIso] || {}, nx = morning[nextIso] || {};
  const put = (day, f, v) => setMorning(Object.assign({}, morning, { [day]: Object.assign({}, morning[day] || {}, { [f]: v }) }));
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ flex: 1 }}><Lab>Lights out tonight</Lab><Fld v={nx.lights} on={(v) => put(nextIso, "lights", v)} ph="21:30" type="text" /></div>
      <div style={{ flex: 1 }}><Lab>Hours slept last night</Lab><Fld v={rec.sleep} on={(v) => put(dayIso, "sleep", v)} ph="hours" /></div>
    </div>);
}

/* the line the daily check itself carries */
export function MorningFlagLine({ flag }) {
  if (!flag || !flag.level) return null;
  const ac = flag.level === "R" ? C.oxide : C.brass;
  return (
    <div style={{ background: C.ink, border: "1px solid " + ac, borderRadius: 5, padding: "9px 11px", marginBottom: 8 }}>
      <div style={Object.assign({}, mno, { fontSize: 9, letterSpacing: 1.2, color: ac })}>
        {flag.level === "R" ? "THE MORNING NUMBERS SUGGEST RED" : "THE MORNING NUMBERS FLAG THIS YELLOW"}
      </div>
      <div style={Object.assign({}, bdy, { fontSize: 12, color: C.chalk, marginTop: 4, lineHeight: 1.45 })}>{flag.why}</div>
    </div>);
}

/* ================================================================
   RECOVERY HEART RATE — beside the 60-second settle
   ================================================================ */
export function RecoveryHR({ endHR, hr60, onEnd, on60, prev }) {
  const drop = recoveryDrop(endHR, hr60);
  return (
    <div style={{ background: C.ink, border: "1px solid " + C.cobalt, borderRadius: 5, padding: "11px 12px", marginBottom: 11 }}>
      <Eye c={C.cobalt} s={{ marginBottom: 6 }}>Recovery heart rate — the drop over the settle</Eye>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Lab>HR at the end of the last interval</Lab><Fld v={endHR} on={onEnd} ph="bpm" /></div>
        <div style={{ flex: 1 }}><Lab>Heart rate at 60 seconds</Lab><Fld v={hr60} on={on60} ph="bpm" /></div>
      </div>
      {drop != null ? (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <div style={Object.assign({}, mno, { fontSize: 8, color: C.cobalt, letterSpacing: 1.2 })}>THE DROP</div>
          <div style={Object.assign({}, mno, { fontSize: 26, fontWeight: 700, color: drop >= 20 ? C.moss : drop >= 12 ? C.brass : C.oxide })}>{drop} <span style={{ fontSize: 11, color: C.ash }}>bpm</span></div>
          <Note s={{ marginTop: 2 }}>{recoveryBand(drop)}</Note>
        </div>) : null}
      {prev != null ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.brass, marginTop: 6 })}>LAST WEEK: {prev} bpm</div> : null}
    </div>);
}

/* ================================================================
   THE EASY ZONE — on Monday's base and on the easy hour
   ================================================================ */
export function EasyZonePanel({ peak, avgHR, onAvg, compact }) {
  const zone = easyZone(peak);
  const note = zoneNote(avgHR, zone);
  return (
    <div style={{ background: C.ink, border: "1px solid " + C.moss, borderRadius: 5, padding: "11px 12px", marginBottom: compact ? 0 : 11, marginTop: compact ? 10 : 0 }}>
      <Eye c={C.moss} s={{ marginBottom: 4 }}>The easy zone — 65–75% of your peak heart rate</Eye>
      {zone
        ? <div style={Object.assign({}, mno, { fontSize: 24, fontWeight: 700, color: C.moss })}>{zone[0]}–{zone[1]} <span style={{ fontSize: 10, color: C.ash, letterSpacing: 1 }}>BPM · FROM A PEAK OF {peak}</span></div>
        : <Note c={C.ash} s={{ fontStyle: "italic", marginTop: 0 }}>Log the peak heart rate from the 20-minute test and the zone appears here.</Note>}
      <div style={{ marginTop: 9 }}><Lab>Average heart rate</Lab><Fld v={avgHR} on={onAvg} ph="bpm" /></div>
      {note ? <div style={Object.assign({}, mno, { fontSize: 9.5, letterSpacing: 1, marginTop: 7, color: note.in ? C.moss : C.brass })}>{note.in ? "IN THE ZONE" : note.low ? "UNDER THE ZONE" : "OVER THE ZONE"}</div> : null}
    </div>);
}

/* ================================================================
   ERG OUTPUT — per interval, per burst, per round
   ================================================================ */
export function ErgPanel({ title, slots, vals, onVal, unit, fade, scored, prevTotal }) {
  const u = ergUnitLabel(unit);
  const total = ergTotal(vals), mean = ergMean(vals);
  return (
    <div style={{ background: C.ink, border: "1px solid " + C.brass, borderRadius: 5, padding: "11px 12px", marginBottom: 11 }}>
      <Eye c={C.brass} s={{ marginBottom: 6 }}>{title || "Output"} — {u} {slots.length > 1 ? "each" : ""}</Eye>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {slots.map((s, i) => (
          <div key={i} style={{ flex: "1 1 22%", minWidth: 68 }}>
            <Lab>{s}</Lab>
            <Fld v={vals[i] == null ? "" : vals[i]} on={(v) => onVal(i, v)} ph={u} s={{ padding: "9px 4px" }} />
          </div>))}
      </div>
      {total != null ? (
        <div style={{ display: "flex", gap: 14, marginTop: 9 }}>
          <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, letterSpacing: 1 })}>TOTAL <span style={{ color: C.chalk, fontSize: 13, fontWeight: 700 }}>{r1(total)}</span> {u}</span>
          {slots.length > 1 ? <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.ash, letterSpacing: 1 })}>MEAN <span style={{ color: C.chalk, fontSize: 13, fontWeight: 700 }}>{mean}</span> {u}</span> : null}
          {prevTotal != null ? <span style={Object.assign({}, mno, { fontSize: 9.5, color: C.brass, letterSpacing: 1 })}>LAST WEEK {r1(prevTotal)}</span> : null}
        </div>) : null}
      {fade ? (
        <div style={{ marginTop: 10, paddingTop: 9, borderTop: "1px solid " + C.line }}>
          <div style={Object.assign({}, mno, { fontSize: 8, color: C.oxide, letterSpacing: 1.2 })}>THE FADE — ROUND {fade.idx} AGAINST ROUND 1{scored ? " · SCORED WEEK" : ""}</div>
          <div style={Object.assign({}, mno, { fontSize: 24, fontWeight: 700, color: fade.held >= 95 ? C.moss : fade.held >= 90 ? C.brass : C.oxide })}>{fade.held}%<span style={{ fontSize: 11, color: C.ash }}> held · {fade.drop}% drop</span></div>
        </div>) : null}
    </div>);
}

/* ================================================================
   BAR SPEED — on the top set of the four bars
   ================================================================ */
export function BarSpeedField({ v, on, prev }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 8 }}>
      <div style={{ flex: 1 }}><Lab>Bar speed — top set (m/s) · optional</Lab><Fld v={v} on={on} ph="m/s" /></div>
      {prev ? <div style={{ flex: 1 }}><div style={Object.assign({}, mno, { fontSize: 9, color: C.brass, paddingBottom: 12 })}>LAST WEEK {prev.speed} m/s{prev.load != null ? " @ " + prev.load + " kg" : ""}</div></div> : null}
    </div>);
}

export function BarSpeedTrack({ log, camp }) {
  const all = barSpeeds(log, camp);
  return (
    <Card ac={C.brass}>
      <Eye c={C.brass}>Bar speed — at the same load, per lift</Eye>
      <Note c={C.chalk} s={{ marginTop: 0 }}>A speed only means something against another speed at the same weight, so each chart holds the load with the most entries on it. Metres a second, top set.</Note>
      {BAR_SPEED_LIFTS.map((l) => { const rows = all[l[0]] || []; const same = sameLoadSeries(rows);
        return (
          <div key={l[0]} style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{l[1]}</span>
              {same ? <span style={Object.assign({}, mno, { fontSize: 9, color: C.ash })}>AT {same.load} KG</span> : null}
            </div>
            {same && same.rows.length
              ? <MiniBars data={same.rows.map((r) => [r.label, r.speed])} color={C.brass} />
              : <Note s={{ fontStyle: "italic", marginTop: 2 }}>{rows.length ? "Speeds on file, but none yet at a repeated load." : "No bar speeds logged yet."}</Note>}
          </div>); })}
    </Card>);
}

/* ================================================================
   ERG TRACK — by session type, so the same session compares
   ================================================================ */
export function ErgTrack({ ergRows, unit }) {
  const u = ergUnitLabel(unit);
  const types = Object.keys(ergRows || {});
  return (
    <Card ac={C.cobalt}>
      <Eye c={C.cobalt}>Erg output — by session type, week against week</Eye>
      <Note c={C.chalk} s={{ marginTop: 0 }}>Total output for the session, in {u}. Charted by type, so a 4-minute interval session is only ever read against another one.</Note>
      {!types.length ? <Note s={{ fontStyle: "italic" }}>Nothing logged yet. The output fields are on every conditioning session.</Note>
        : types.map((t) => (
          <div key={t} style={{ marginTop: 12 }}>
            <div style={Object.assign({}, bdy, { fontSize: 13, fontWeight: 600, color: C.chalk })}>{ergRows[t].n}</div>
            <MiniBars data={ergRows[t].rows.map((r) => [r.label, r.v])} color={C.cobalt} />
          </div>))}
    </Card>);
}

/* ================================================================
   PHOTOS — front, side, back, on the phone, side by side by date
   ================================================================ */
const downscale = (file, max) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onerror = () => rej(fr.error);
  fr.onload = () => {
    const raw = String(fr.result || "");
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const sc = Math.min(1, max / Math.max(img.width || max, img.height || max));
          const cv = document.createElement("canvas");
          cv.width = Math.round((img.width || max) * sc); cv.height = Math.round((img.height || max) * sc);
          const cx = cv.getContext("2d");
          if (!cx) { res(raw); return; }
          cx.drawImage(img, 0, 0, cv.width, cv.height);
          res(cv.toDataURL("image/jpeg", 0.7));
        } catch (e) { res(raw); }
      };
      img.onerror = () => res(raw);
      img.src = raw;
    } catch (e) { res(raw); }
  };
  fr.readAsDataURL(file);
});

function PhotoSlot({ view, src, onFile, onClear }) {
  const ref = useRef(null);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={Object.assign({}, mno, { fontSize: 8, color: C.ash, letterSpacing: 1.2, marginBottom: 4 })}>{view[1]}</div>
      <button onClick={() => ref.current && ref.current.click()} aria-label={"Add the " + view[1].toLowerCase() + " photo"}
        style={{ width: "100%", minHeight: 96, padding: 0, background: C.ink, border: "1px solid " + (src ? C.violet : C.line), borderRadius: 5, cursor: "pointer", overflow: "hidden", display: "block" }}>
        {src ? <img src={src} alt={view[1] + " photo"} style={{ width: "100%", display: "block" }} />
          : <span style={Object.assign({}, mno, { fontSize: 20, color: C.ash })}>+</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} aria-hidden="true" tabIndex={-1}
        onChange={async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
          try { onFile(await downscale(f, 900)); } catch (err) {} }} />
      {src ? <button onClick={onClear} aria-label={"Remove the " + view[1].toLowerCase() + " photo"}
        style={Object.assign({}, mno, { width: "100%", minHeight: 32, marginTop: 4, background: "transparent", border: "1px solid " + C.line, borderRadius: 4, color: C.ash, fontSize: 8.5, letterSpacing: 1, cursor: "pointer" })}>REMOVE</button> : null}
    </div>);
}

export function PhotosView({ photos, setPhotos, camp, week, dayIso, isPhotoDay }) {
  const dates = Object.keys(photos || {}).sort().reverse();
  const [openDate, setOpenDate] = useState(dayIso);
  const cur = photos[openDate] || {};
  const put = (view, data) => setPhotos(Object.assign({}, photos, { [openDate]: Object.assign({}, photos[openDate], { [view]: data }) }));
  const clear = (view) => { const rec = Object.assign({}, photos[openDate]); delete rec[view];
    const next = Object.assign({}, photos);
    if (Object.keys(rec).length) next[openDate] = rec; else delete next[openDate];
    setPhotos(next); };
  const wks = photoWeeks(camp);
  return (
    <div>
      <Card ac={isPhotoDay ? C.violet : C.line}>
        <Eye c={C.violet}>Photos — {camp ? "the Sunday of camp weeks 1, 6 and 11" : "the Sunday of weeks 1, 5, 9 and 13"}</Eye>
        {isPhotoDay
          ? <div style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 800, letterSpacing: 1.2, color: C.violet })}>TODAY IS A PHOTO DAY</div>
          : <Note c={C.chalk} s={{ marginTop: 0 }}>Not today. The next one is {camp ? "camp week " : "week "}{wks.filter((w) => w > week)[0] || wks[0]}.</Note>}
        <Note c={C.chalk}>Front, side and back, same light, same spot, same time of day. Three taps.</Note>
        <div style={{ marginTop: 10 }}>
          <Lab>The date these belong to</Lab>
          <Fld type="date" v={openDate} on={(v) => { if (v) setOpenDate(v); }} a="left" />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {PHOTO_VIEWS.map((v) => <PhotoSlot key={v[0]} view={v} src={cur[v[0]]} onFile={(d) => { put(v[0], d); buzz(20); }} onClear={() => clear(v[0])} />)}
        </div>
        <Note c={C.ash}>{PHOTO_NOTE}</Note>
      </Card>

      {dates.map((d) => (
        <Card key={d}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{fmtDate(d)}</span>
            <span style={Object.assign({}, mno, { fontSize: 9, color: C.ash })}>{PHOTO_VIEWS.filter((v) => photos[d][v[0]]).length} / 3</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {PHOTO_VIEWS.map((v) => (
              <div key={v[0]} style={{ flex: 1, minWidth: 0 }}>
                {photos[d][v[0]]
                  ? <img src={photos[d][v[0]]} alt={v[1] + " " + d} style={{ width: "100%", display: "block", borderRadius: 4, border: "1px solid " + C.line }} />
                  : <div style={{ width: "100%", height: 70, borderRadius: 4, border: "1px dashed " + C.line }} />}
                <div style={Object.assign({}, mno, { fontSize: 7.5, color: C.ash, letterSpacing: 1, marginTop: 3, textAlign: "center" })}>{v[1]}</div>
              </div>))}
          </div>
        </Card>))}
      {!dates.length ? <Note s={{ fontStyle: "italic" }}>No photos yet.</Note> : null}
    </div>);
}

/* the nudge on TODAY, on the Sundays that ask for them */
export function PhotoPrompt({ onOpen, camp, week, done, future }) {
  return (
    <Card ac={C.violet}>
      <Eye c={C.violet}>{camp ? "Camp week " + week : "Week " + week} · Sunday — the photos</Eye>
      <div style={Object.assign({}, dsp, { fontSize: 20, fontWeight: 800, letterSpacing: 1.2, color: C.chalk })}>{done ? "PHOTOS DONE" : future ? "THIS SUNDAY" : "FRONT, SIDE, BACK"}</div>
      <Btn small c={C.violet} fill={!done && !future} s={{ width: "100%", marginTop: 10 }} on={onOpen}>{done ? "SEE THE PHOTOS" : future ? "THE PHOTOS SCREEN" : "TAKE THEM"}</Btn>
    </Card>);
}

/* ================================================================
   THE DASHBOARD — seven numbers at the top of TRACK
   ================================================================ */
const Arrow = ({ t }) => {
  if (!t || t.v == null) return <span style={Object.assign({}, mno, { fontSize: 13, color: C.ash })}>—</span>;
  const c = t.good === null ? C.ash : t.good ? C.moss : C.oxide;
  return <span style={Object.assign({}, mno, { fontSize: 15, fontWeight: 700, color: c })}>{t.arrow}</span>;
};

function DashRow({ n, t, u, fmt, date, target, note }) {
  return (
    <div style={{ padding: "11px 0", borderBottom: "1px solid " + C.line }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <div style={Object.assign({}, bdy, { fontSize: 13.5, fontWeight: 600, color: C.chalk })}>{n}</div>
          <div style={Object.assign({}, mno, { fontSize: 8, color: C.ash, letterSpacing: 1, marginTop: 2 })}>{date ? "LAST LOGGED " + date.toUpperCase() : "NEVER LOGGED"}</div>
        </span>
        <Arrow t={t} />
        <span style={Object.assign({}, mno, { fontSize: 19, fontWeight: 700, color: t && t.v != null ? C.chalk : C.ash, textAlign: "right", minWidth: 76 })}>
          {t && t.v != null ? (fmt ? fmt(t.v) : r1(t.v)) : "—"}{t && t.v != null && u ? <span style={{ fontSize: 9, color: C.ash }}> {u}</span> : null}
        </span>
      </div>
      {target ? <div style={Object.assign({}, mno, { fontSize: 9, color: C.brass, marginTop: 5, letterSpacing: .6 })}>CAMP TARGET · {target.toUpperCase()}</div> : null}
      {note ? <Note s={{ marginTop: 5 }}>{note}</Note> : null}
    </div>);
}

export function Dashboard({ log, morning, st, camp, body, fuel, addBody, dateOf, openPhotos }) {
  const [tape, setTape] = useState({});
  const D = useMemo(() => {
    const fadeRows = pairSeries(log, camp ? "c_fs_rd1" : "fs_rd1", camp ? "c_fs_rd6" : "fs_rd6", camp, "sun", (a, b) => (a ? r1(b / a * 100) : null));
    const t20Rows = series(log, camp ? "c_bike20" : "bike20", camp, "sun");
    const burstRows = pairSeries(log, "c_burst1", "c_burst10", camp, null, (a, b) => (a ? r1((a - b) / a * 100) : null));
    const recRows = ["settle", "settle2", "c_settle1", "c_settle2"]
      .reduce((acc, id) => acc.concat(series(log, id + "_drop", camp)), [])
      .sort((a, b) => a.week - b.week);
    const mDates = (f) => Object.keys(morning || {}).filter((d) => num((morning[d] || {})[f]) != null).sort();
    const mRows = (f) => mDates(f).map((d) => ({ d, v: num(morning[d][f]) }));
    return { fadeRows, t20Rows, burstRows, recRows, rhrRows: mRows("rhr"), hrvRows: mRows("hrv") };
  }, [log, morning, camp]);

  const bn = bodyNow(fuel, body);
  const dat = (rows) => { const r = rows[rows.length - 1]; return r ? (r.d ? fmtDate(r.d) : dateOf(r.macro, r.week, r.day)) : null; };
  const tg = (k) => (camp ? CAMP_TARGET[k] : null);

  return (
    <div>
      <Card ac={C.brass}>
        <Eye c={C.brass}>The dashboard — the seven numbers{camp ? ", against the camp's targets" : ""}</Eye>
        <Note c={C.chalk} s={{ marginTop: 0 }}>Everything the whole programme is actually trying to move, on one screen, with the way it is going and the day it was last written down.</Note>
        <DashRow n="Fade — round six against round one" t={trend(D.fadeRows, "up")} u="% held" date={dat(D.fadeRows)} target={tg("fade")} />
        <DashRow n="20-minute test — distance" t={trend(D.t20Rows, "up")} u="m" date={dat(D.t20Rows)} target={tg("t20")} />
        <DashRow n="Burst decrement — first against last" t={trend(D.burstRows, "down")} u="%" date={dat(D.burstRows)} target={tg("burst")} />
        <DashRow n="Recovery heart rate — the 60-second drop" t={trend(D.recRows, "up")} u="bpm" date={dat(D.recRows)} target={tg("recovery")} />
        <DashRow n="Resting heart rate" t={trend(D.rhrRows, "down")} u="bpm" date={dat(D.rhrRows)} target={tg("rhr")}
          note={D.rhrRows.length ? "Seven-day average " + (r1(rolling7(morning, "rhr").avg) || "—") + " bpm · week-1 baseline " + (baseline(morning, st).rhr == null ? "—" : baseline(morning, st).rhr) + " bpm." : null} />
        <DashRow n="HRV" t={trend(D.hrvRows, "up")} u="ms" date={dat(D.hrvRows)} target={tg("hrv")}
          note={D.hrvRows.length ? "Seven-day average " + (r1(rolling7(morning, "hrv").avg) || "—") + " ms." : null} />
        <DashRow n="Bodyweight" t={{ v: bn.bw ? bn.bw.v : null, arrow: bn.bw && bn.bw.prev != null ? (bn.bw.v > bn.bw.prev ? "↑" : bn.bw.v < bn.bw.prev ? "↓" : "→") : "", good: null }}
          u="kg" date={bn.bw ? fmtDate(bn.bw.d) : null} target={tg("body")}
          note={bn.fromFuel ? "From the fuel app's export." : "The fuel app's export has not been imported — type it here or in settings."} />
        <DashRow n="Waist" t={{ v: bn.waist ? bn.waist.v : null, arrow: bn.waist && bn.waist.prev != null ? (bn.waist.v > bn.waist.prev ? "↑" : bn.waist.v < bn.waist.prev ? "↓" : "→") : "", good: bn.waist && bn.waist.prev != null ? bn.waist.v <= bn.waist.prev : null }}
          u="cm" date={bn.waist ? fmtDate(bn.waist.d) : null} />
        {!bn.fromFuel ? (
          <div style={{ marginTop: 10 }}>
            <Lab>Bodyweight and waist — entered here</Lab>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1 }}><Fld v={tape.bw} on={(v) => setTape(Object.assign({}, tape, { bw: v }))} ph="kg" /></div>
              <div style={{ flex: 1 }}><Fld v={tape.wa} on={(v) => setTape(Object.assign({}, tape, { wa: v }))} ph="waist cm" /></div>
              <Btn small c={C.brass} dis={!num(tape.bw) && !num(tape.wa)} on={() => { addBody(tape); setTape({}); }}>SAVE</Btn>
            </div>
          </div>) : null}
        {openPhotos ? <Btn small c={C.violet} s={{ width: "100%", marginTop: 12 }} on={openPhotos}>THE PHOTOS →</Btn> : null}
      </Card>
      {camp ? <Note c={C.brass} bold>The camp's targets over twelve honest weeks, beside each number. They are targets, not promises — the point of the dashboard is that you can see which of them you are actually on for.</Note> : null}
    </div>);
}

/* ================================================================
   SETTINGS — the measurement layer's own controls
   ================================================================ */
export function MeasureSettings({ st, upd, morning, dayIso, fuel, setFuel, importFuelText }) {
  const b = baseline(morning, st);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const recal = () => {
    const r = recalibrated(morning, dayIso);
    if (r.n === 0) { setMsg("No morning numbers yet — there is nothing to calibrate from."); return; }
    upd({ base: { rhr: r.rhr, hrv: r.hrv, from: dayIso } });
    setMsg("Baseline set from the last " + r.n + " day" + (r.n === 1 ? "" : "s") + ": resting heart rate " + (r.rhr == null ? "—" : r.rhr) + ", HRV " + (r.hrv == null ? "—" : r.hrv) + ".");
  };
  return (
    <div>
      <Eye c={C.cobalt}>The morning numbers — the baseline</Eye>
      <Note c={C.chalk} s={{ marginTop: 0 }}>Week 1's resting heart rate and HRV are what every morning after it is read against. Until you recalibrate, the baseline is the first seven days you logged.</Note>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <div style={{ flex: 1 }}><Lab>Baseline resting HR</Lab><div style={Object.assign({}, mno, { fontSize: 20, fontWeight: 700, color: b.rhr == null ? C.ash : C.brass })}>{b.rhr == null ? "—" : b.rhr + " bpm"}</div></div>
        <div style={{ flex: 1 }}><Lab>Baseline HRV</Lab><div style={Object.assign({}, mno, { fontSize: 20, fontWeight: 700, color: b.hrv == null ? C.ash : C.brass })}>{b.hrv == null ? "—" : b.hrv + " ms"}</div></div>
      </div>
      <Btn small c={C.cobalt} s={{ width: "100%", marginTop: 8 }} on={recal}>RECALIBRATE BASELINE</Btn>
      <Note>Sets the week-1 baseline to the last seven days. Do it after a block that genuinely changed you — not after a bad week.</Note>
      {b.set ? <Note c={C.brass}>Recalibrated{b.from ? " on " + fmtDate(b.from) : ""}.</Note> : null}
      {msg ? <Note c={C.moss}>{msg}</Note> : null}

      <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
      <Eye c={C.brass}>Erg output — the unit you log in</Eye>
      <Seg opts={[["w", "WATTS"], ["m", "METRES"], ["cal", "CALORIES"]]} val={st.ergUnit || "w"} on={(v) => upd({ ergUnit: v })} c={C.brass} />
      <Note>Every conditioning session logs its output in this unit — per interval, per burst, per round. Pick one and keep it, or the weeks stop comparing.</Note>

      <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
      <Eye c={C.violet}>The fuel app</Eye>
      <Note c={C.chalk} s={{ marginTop: 0 }}>Import the fuel app's export and the dashboard reads bodyweight and waist straight out of it. Without it, you type them on the dashboard.</Note>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <Btn small c={C.violet} s={{ flex: 1 }} on={() => fileRef.current && fileRef.current.click()}>IMPORT THE FUEL EXPORT</Btn>
        {fuel && (fuel.entries || []).length ? <Btn small c={C.ash} s={{ flex: 1 }} on={() => { setFuel(null); setMsg("The fuel app's data has been cleared."); }}>CLEAR IT</Btn> : null}
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }} aria-hidden="true" tabIndex={-1}
        onChange={async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
          const r = await importFuelText(f); setMsg(r); }} />
      {fuel && (fuel.entries || []).length
        ? <Note c={C.moss}>{fuel.entries.length} day{fuel.entries.length === 1 ? "" : "s"} from the fuel app, imported {fuel.importedAt ? fmtDate(fuel.importedAt) : ""}.</Note>
        : <Note c={C.ash} s={{ fontStyle: "italic" }}>Nothing imported yet.</Note>}
    </div>);
}
