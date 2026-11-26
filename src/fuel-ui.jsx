import React, { useState, useEffect, useRef, useCallback } from "react";
import { C as M, soft, dsp, bdy, mno, big, cap, FS as F, RAD, Icon, CheckDot, buzz, num, iso, parseISO, toast, Eye as UEye, Lab, Fld as UFld, Btn as UBtn, Note as UNote } from "./ui.jsx";
import { ChartCard } from "./charts.jsx";
import { beep as tone } from "./sound.js";
import { B, SHOP, AS_YOU_USE, YIELDS, PHASES, MEASURES, UPPER, WEEKLY, tapeSeries, verdicts, SLOTS, blockOf, stepBlockOf, lowFibreOpts, hhmm, SACHET, CREATINE } from "./fuel.js";

/* ================================================================
   FUEL — the screens that came across from the fuel app: COOK, SHOP,
   the REFEREE, and the bodies of TODAY's feed and water rows.

   COOK, SHOP and the REFEREE are the fuel app's own code, in this app's
   look: its warm colour names are kept so the code reads as it did, and
   every one of them is the accent but the warning, which is amber. Its
   sizes are read onto this app's scale, and its atoms are this app's.
   ================================================================ */
const C = { ink: M.ink, slab: M.slab, card: M.card, line: M.line, ash: M.ash, bone: M.chalk,
  ember: M.accent, honey: M.accent, sage: M.accent, copper: M.warn, frost: M.accent };
const FS = (px) => (px >= 34 ? 44 : px >= 20 ? F.title : px >= 15 ? F.lead : px >= 11 ? F.body : F.meta);
const SZ = { amount: F.body };
const TAP = 48;
const mmss = (s) => { const a = Math.max(0, Math.round(s)), m = Math.floor(a / 60), x = a % 60; return m + ":" + (x < 10 ? "0" : "") + x; };
const r5 = (n) => Math.round(n / 5) * 5;
const sundayOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() === 0 ? 0 : x.getDay())); return x; };

/* a card has no colour of its own; a label over a block is always quiet */
const Card = ({ children, s, tid }) => <div data-testid={tid} style={Object.assign({ background: C.card, border: "1px solid " + M.edge, borderRadius: RAD.l, marginBottom: 12, padding: 16, boxShadow: M.shadow }, s)}>{children}</div>;
const Eye = ({ children, s }) => <UEye s={s}>{children}</UEye>;
const Fld = ({ v, on, ph, type, s }) => <UFld v={v} on={on} ph={ph} type={type} s={s} />;
const Btn = ({ children, on, c, fill, s, dis, small }) => <UBtn on={on} c={c === C.copper ? M.warn : c === C.ash ? M.ash : M.accent} fill={fill} s={s} dis={dis} small={small}>{children}</UBtn>;
const Note = ({ children, c, bold, s }) => <UNote c={c} bold={bold} s={Object.assign({}, s, { fontStyle: "normal" })}>{children}</UNote>;
/* a tick row's box: the round tick the rest of the app uses */
const Box = ({ on }) => <span style={{ width: TAP, height: TAP, margin: "-8px -9px -8px -11px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckDot ok={on} size={28} /></span>;
/* a bar that fills: the track is the quiet one the app uses */
const Bar = ({ v }) => <div style={{ height: 6, background: soft(M.chalk), borderRadius: 999, overflow: "hidden" }}><div style={{ width: Math.max(0, Math.min(100, v)) + "%", height: "100%", background: M.accent, borderRadius: 999, transition: "width .3s" }} /></div>;

export function useBeep(sound) {
  return useCallback((f, ms, vol) => { if (sound) tone(f, ms, vol); }, [sound]);
}

export function useKTimer(beep) {
  const [t, setT] = useState(null);
  const tRef = useRef(null), endRef = useRef(0), pipRef = useRef("");
  useEffect(() => { tRef.current = t; }, [t]);
  useEffect(() => {
    if (!t || !t.run) return;
    const id = setInterval(() => { const cur = tRef.current; if (!cur || !cur.run) return;
      const rem = Math.ceil((endRef.current - Date.now()) / 1000);
      if (rem > 0 && rem <= 3 && pipRef.current !== "" + rem) { pipRef.current = "" + rem; beep(880, 80, .2); buzz(30); }
      if (rem <= 0) { beep(523, 200); setTimeout(() => beep(659, 200), 160); setTimeout(() => beep(784, 420), 320); buzz([150, 80, 150, 80, 300]); setT(Object.assign({}, cur, { left: 0, run: false, done: true })); }
      else if (rem !== cur.left) setT(Object.assign({}, cur, { left: rem }));
    }, 200);
    return () => clearInterval(id);
  }, [t && t.run, beep]);
  const start = (label, secs) => { endRef.current = Date.now() + secs * 1000; pipRef.current = ""; setT({ label, left: secs, total: secs, run: true, done: false }); beep(660, 80, .15); };
  const toggle = () => { const cur = tRef.current; if (!cur || cur.done) return; if (cur.run) setT(Object.assign({}, cur, { run: false })); else { endRef.current = Date.now() + cur.left * 1000; setT(Object.assign({}, cur, { run: true })); } };
  const close = () => setT(null);
  return { t, start, toggle, close };
}
export function KDock({ K }) {
  const t = K.t; if (!t) return null;
  const frac = t.done ? 1 : 1 - t.left / (t.total || 1);
  return (
    <div data-testid="kitchen-timer" className="sheet" style={{ zIndex: 70, padding: "0 0 8px" }}>
      <div style={{ maxWidth: 624, margin: "0 auto", background: M.raise, border: "1px solid " + C.line, borderRadius: RAD.l, boxShadow: M.lift, overflow: "hidden" }}>
        <div aria-hidden="true" style={{ height: 5, background: soft(M.chalk) }}><div style={{ width: frac * 100 + "%", height: "100%", background: t.done ? M.accent : M.warn, transition: "width .25s linear" }} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px 10px 16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={cap(t.done ? M.accent : M.warn)}>{t.label}{t.done ? " · DONE" : ""}</div>
            <div className={t.done ? "pop" : undefined} style={Object.assign({}, big, { fontSize: 44, fontWeight: 700, color: t.done ? M.accent : C.bone, lineHeight: 1.05, letterSpacing: -1 })}>{t.done ? "✓" : mmss(t.left)}</div>
          </div>
          <button onClick={K.toggle} disabled={t.done} aria-label={t.run ? "PAUSE" : "START"} style={{ width: 56, height: 56, borderRadius: 999, flexShrink: 0, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: M.warn, color: M.on, opacity: t.done ? .4 : 1 }}><Icon n={t.run ? "pause" : "play"} size={24} /></button>
          <button onClick={K.close} aria-label="Close timer" style={{ width: 44, height: 44, borderRadius: 999, flexShrink: 0, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: C.ash }}><Icon n="close" size={22} /></button>
        </div>
      </div>
    </div>);
}

export function MacroBar({ label, val, max, c }) {
  return (
    <div style={{ flex: "1 1 130px", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}><span style={cap()}>{label}</span><span style={Object.assign({}, mno, { fontSize: SZ.amount, fontWeight: 600, color: C.bone, textAlign: "right" })}>{val}<span style={{ color: C.ash, fontWeight: 400 }}>/{max}</span></span></div>
      <Bar v={val / max * 100} />
    </div>);
}

const Step = ({ n, t }) => <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}><span style={Object.assign({}, mno, { fontSize: FS(11), fontWeight: 700, color: C.ash, width: 16, flexShrink: 0 })}>{n}</span><span style={Object.assign({}, bdy, { fontSize: FS(13), color: C.bone, lineHeight: 1.45 })}>{t}</span></div>;
const Big = ({ v, on, ph, lab }) => (
  <div style={{ flex: "1 1 130px", minWidth: 0 }}>
    <Lab>{lab}</Lab>
    <input value={v} onChange={(e) => on(e.target.value)} placeholder={ph} inputMode="decimal" type="text"
      style={Object.assign({}, big, { width: "100%", background: C.ink, border: "1px solid " + C.line, borderRadius: RAD.m, color: C.bone, fontSize: FS(20), fontWeight: 700, padding: "12px 8px", textAlign: "center", minHeight: 60 })} />
  </div>
);
const Out = ({ lab, v, colour }) => (
  <div style={{ flex: "1 1 130px", background: M.card2, borderRadius: RAD.m, padding: "14px 6px", textAlign: "center" }}>
    <div style={cap()}>{lab}</div>
    <div style={Object.assign({}, big, { fontSize: FS(40), fontWeight: 700, color: colour, lineHeight: 1.1, marginTop: 2 })}>{v}<span style={Object.assign({}, mno, { fontSize: F.meta, fontWeight: 600, color: C.ash })}> g</span></div>
  </div>
);
/* One calculator: two inputs, two live outputs, a portion count and a save. */
const Calc = ({ title, colour, blurb, rawLab, rawPh, ckLab, ckPh, raw, setRaw, ck, setCk, out, count, countLab, saved, onSave }) => (
  <Card ac={colour}>
    <Eye c={colour}>{title}</Eye>
    <Note s={{ marginTop: 0 }}>{blurb}</Note>
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 8, marginTop: 12 }}>
      <Big lab={rawLab} ph={rawPh} v={raw} on={setRaw} />
      <Big lab={ckLab} ph={ckPh} v={ck} on={setCk} />
    </div>
    {out ? (
      <div className="rise" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Out lab="ONE STANDARD" v={out.std} colour={M.accent} />
          <Out lab="ONE BIG" v={out.big} colour={C.bone} />
        </div>
        <Btn c={C.sage} fill s={{ width: "100%", marginTop: 10 }} on={() => { onSave(out); buzz([60, 40, 60]); toast("Saved. It shows on every batch feed."); }}>SAVE — SHOW ON EVERY BATCH FEED</Btn>
      </div>
    ) : <Note s={{ fontStyle: "italic" }}>Type both weights and the two numbers appear here.</Note>}
    {count ? <div style={Object.assign({}, mno, { fontSize: FS(10), color: C.ash, marginTop: 10, letterSpacing: .4 })}>{countLab} {count} STANDARD PORTIONS</div> : null}
    {saved ? <div style={Object.assign({}, mno, { fontSize: FS(9.5), fontWeight: 600, color: C.sage, marginTop: 6 })}>SAVED · {saved.std}g STANDARD · {saved.big}g BIG{saved.date ? " · " + saved.date : ""}</div> : null}
  </Card>
);

export function Cook({ cook, setCook, foods, setFoods, K, prep, setPrep }) {
  /* Two independent calculators. Each takes the raw weight that went in and the
     cooked weight that came out, and scales one portion's raw share by the loss.
     Mince pot: 150g raw mince standard, 200g big. Sweet potato: 300g and 350g. */
  const [mRaw, setMRaw] = useState(""); const [mCooked, setMCooked] = useState("");
  const [sRaw, setSRaw] = useState(""); const [sCooked, setSCooked] = useState("");
  const [uRaw, setURaw] = useState(""); const [uCooked, setUCooked] = useState(""); const [uTarget, setUTarget] = useState(""); const [uName, setUName] = useState("");

  const portion = (raw, cooked, stdShare, bigShare) => {
    const r = num(raw), c = num(cooked);
    return r > 0 && c > 0 ? { std: r5(c * stdShare / r), big: r5(c * bigShare / r) } : null;
  };
  const countOf = (raw, share) => { const r = num(raw); return r > 0 ? Math.round(r / share * 10) / 10 : null; };
  const mOut = portion(mRaw, mCooked, 150, 200);
  const sOut = portion(sRaw, sCooked, 300, 350);
  const mCount = countOf(mRaw, 150), sCount = countOf(sRaw, 300);





  const uOut = num(uCooked) && num(uRaw) && num(uTarget) ? r5(num(uCooked) * num(uTarget) / num(uRaw)) : null;
  const uFactor = num(uCooked) && num(uRaw) ? num(uCooked) / num(uRaw) : null;
  return (
    <div>
      <Card ac={C.ember}>
        <Eye c={C.ember}>The batch — two pans, weighed separately</Eye>
        <Note s={{ marginTop: 0 }}>Cook the mince and the sweet potato in separate pans — they cook at different rates and lose different amounts of water, so one pot weighed together tells you nothing about either. Weigh each one cooked, type the raw weight in and the cooked weight out, and serve by the two numbers it gives you.</Note>
        <div style={{ background: M.card2, borderRadius: RAD.m, padding: 14, marginTop: 12 }}>
          <Eye s={{ marginBottom: 8 }}>The method</Eye>
          <Step n="1" t="Brown the mince, stock and passata in, simmer it down — one pan, everything in it." />
          <Step n="2" t="Sweet potato in its own pan: roasted or boiled, however much you're cooking." />
          <Step n="3" t="Weigh each one cooked. The mince pot is mince, passata and stock together, minus the pot." />
          <Step n="4" t="Type raw and cooked below. Serve by the two numbers from then on — until the recipe or the pan changes." />
          <Btn small c={C.ember} s={{ marginTop: 6, background: soft(M.chalk) }} on={() => K.start("SIMMER", 25 * 60)}>▶ SIMMER TIMER · 25:00</Btn>
        </div>
        <Note s={{ fontStyle: "italic" }}>Mushrooms go in per portion when you eat — 150g, +33 kcal — not into the pan.</Note>
      </Card>

      <Calc
        title="Mince pot"
        colour={C.copper}
        blurb="Mince, passata and stock together. A standard portion is 150g of raw mince, a big one 200g."
        rawLab="Raw mince cooked (g)" rawPh="2200"
        ckLab="Cooked pot weight (g)" ckPh="3500"
        raw={mRaw} setRaw={setMRaw} ck={mCooked} setCk={setMCooked}
        out={mOut} count={mCount} countLab="THIS POT ="
        saved={cook && cook.mince}
        onSave={(o) => setCook(Object.assign({}, cook, { mince: { std: o.std, big: o.big, date: iso(new Date()) } }))}
      />

      <Calc
        title="Sweet potato"
        colour={C.honey}
        blurb="All of it, roasted or boiled. A standard portion is 300g raw, a big one 350g."
        rawLab="Raw sweet potato cooked (g)" rawPh="4300"
        ckLab="Cooked weight (g)" ckPh="3400"
        raw={sRaw} setRaw={setSRaw} ck={sCooked} setCk={setSCooked}
        out={sOut} count={sCount} countLab="THIS BATCH ="
        saved={cook && cook.potato}
        onSave={(o) => setCook(Object.assign({}, cook, { potato: { std: o.std, big: o.big, date: iso(new Date()) } }))}
      />

      <Card ac={C.honey}>
        <Eye c={C.honey}>Batch anything — the universal converter</Eye>
        <Note s={{ marginTop: 0 }}>Rice, pasta, chicken — cook a batch, weigh it once, and serve by cooked weight from then on.</Note>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <div style={{ flex: "1 1 110px", minWidth: 0 }}><Lab>Raw in (g)</Lab><Fld v={uRaw} on={setURaw} ph="500" /></div>
          <div style={{ flex: "1 1 110px", minWidth: 0 }}><Lab>Cooked out (g)</Lab><Fld v={uCooked} on={setUCooked} ph="1300" /></div>
          <div style={{ flex: "1 1 110px", minWidth: 0 }}><Lab>Plan asks (g raw)</Lab><Fld v={uTarget} on={setUTarget} ph="100" /></div>
        </div>
        {uOut ? <div className="rise" style={{ textAlign: "center", marginTop: 12 }}>
          <div style={Object.assign({}, big, { fontSize: FS(34), fontWeight: 700, color: C.honey, lineHeight: 1.1 })}>{uOut}<span style={Object.assign({}, mno, { fontSize: F.meta, fontWeight: 600, color: C.ash })}> g cooked</span></div>
          <div style={Object.assign(cap(), { marginTop: 4 })}>YOUR RATIO ×{uFactor.toFixed(2)}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <div style={{ flex: "2 1 160px", minWidth: 0 }}><Fld type="text" v={uName} on={setUName} ph="save as… e.g. RICE 100g dry" s={{ textAlign: "left", fontSize: FS(12) }} /></div>
            <Btn small c={C.honey} dis={!uName.trim()} on={() => { setFoods([{ n: uName.trim().toUpperCase(), out: uOut, factor: +uFactor.toFixed(2) }].concat(foods.filter((x) => x.n !== uName.trim().toUpperCase()))); setUName(""); buzz(40); }}>SAVE</Btn>
          </div>
        </div> : null}
        {foods.length ? <div style={{ marginTop: 12 }}>
          <Eye s={{ marginBottom: 4 }}>Your saved ratios — one tap in the kitchen</Eye>
          {foods.map((x, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "2px 0", borderTop: "1px solid " + C.line, minHeight: TAP }}>
            <span style={Object.assign({}, bdy, { fontSize: FS(13), fontWeight: 600, color: C.bone, minWidth: 0 })}>{x.n}</span>
            <span style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
              <span style={Object.assign({}, mno, { fontSize: FS(14), fontWeight: 700, color: C.honey, whiteSpace: "nowrap" })}>{x.out}g cooked</span>
              <button onClick={() => setFoods(foods.filter((_, j) => j !== i))} aria-label={"Delete " + x.n} style={{ width: 44, height: 44, marginRight: -10, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: C.ash, cursor: "pointer" }}><Icon n="close" size={18} /></button>
            </span></div>)}
        </div> : null}
        <div style={{ marginTop: 12 }}>
          <Eye s={{ marginBottom: 4 }}>Typical yields — guides until you've weighed your own</Eye>
          {YIELDS.map((y) => <div key={y[0]} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", borderTop: "1px solid " + C.line }}><span style={Object.assign({}, bdy, { fontSize: FS(10.5), color: C.bone })}>{y[0]}</span><span style={Object.assign({}, mno, { fontSize: FS(10.5), color: C.ash, textAlign: "right" })}>{y[1]}</span></div>)}
        </div>
      </Card>

      <Card ac={C.ember}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Eye c={C.ember} s={{ marginBottom: 0 }}>The batch and the prep</Eye>
          <Btn small c={C.ash} on={() => { setPrep({}); buzz(30); }}>NEW COOK DAY</Btn>
        </div>
        <Note s={{ marginTop: 8 }}>On the batch days — Sunday and Wednesday.</Note>
        {[["The mince pot and the sweet potato, cooked separately.", "Weighed once, cooked, in the calculators above — then four mince-only tubs for the wraps and the rest into the batch tubs."],
          ["Boil the eggs.", "Twelve on Sunday, nine on Wednesday. A week in the shell."],
          ["The work bag.", "Two bagels, a tin and a pack of rice cakes live in it, so a day that goes wrong still has a feed in it."],
          ["Prawns and cod.", "Buy frozen, cook from frozen in ten minutes. Scallops fresh, seared two minutes a side."],
          ["Wraps rolled the night before.", "In a cool bag with a freezer block."]].map((x, i) => {
          const on = !!prep[i];
          return (
            <div key={i} onClick={() => { setPrep(Object.assign({}, prep, { [i]: !on })); buzz(25); }}
              role="checkbox" aria-checked={on}
              style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "12px 0", borderTop: "1px solid " + C.line, cursor: "pointer" }}>
              <Box on={on} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={Object.assign({}, bdy, { fontSize: FS(13), fontWeight: 600, lineHeight: 1.3, color: on ? C.ash : C.bone, textDecoration: on ? "line-through" : "none" })}>{x[0]}</div>
                <div style={Object.assign({}, bdy, { fontSize: FS(10.5), color: C.ash, marginTop: 3, lineHeight: 1.45 })}>{x[1]}</div>
              </span>
            </div>); })}
      </Card>

      <Card>
        <Eye>Cook days</Eye>
        <Note s={{ marginTop: 0 }}><span style={{ color: C.bone, fontWeight: 600 }}>Cook Sunday, cook Wednesday — half a batch each time.</span> Fourteen portions a week: thirteen standard, one big. Two half-week cooks beat one giant pot — fresher, and the pans fit.</Note>
      </Card>
    </div>);
}

export function Shop({ shop, setShop, used, today }) {
  /* Only the extras for options taken in the last fortnight. */
  const swaps = (() => {
    const qty = {};
    for (const [k, d] of Object.entries(used || {})) {
      if (!B[k] || !B[k].extra) continue;
      if ((parseISO(today) - parseISO(d)) / 86400000 > 14) continue;
      for (const [item, q] of B[k].extra) if (!qty[item]) qty[item] = q;
    }
    /* The document's order, not the order they happened to be picked in. */
    const rows = AS_YOU_USE.filter((x) => qty[x]).map((x) => [x, qty[x]]);
    for (const x of Object.keys(qty)) if (AS_YOU_USE.indexOf(x) < 0) rows.push([x, qty[x]]);
    return rows;
  })();
  const GROUPS = swaps.length ? SHOP.concat([["AS YOU USE THEM — THE LAST FORTNIGHT", swaps]]) : SHOP;
  const total = GROUPS.reduce((a, g) => a + g[1].length, 0);
  const got = Object.values(shop).filter(Boolean).length;
  return (
    <div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span><Eye s={{ marginBottom: 2 }}>The weekly shop</Eye><span style={Object.assign({}, big, { fontSize: F.lead, fontWeight: 700, color: C.bone })}>{got}<span style={{ color: C.ash }}>/{total}</span></span><span style={Object.assign({}, bdy, { fontSize: F.meta, color: C.ash })}> in the trolley</span></span>
          <Btn small c={C.ash} on={() => setShop({})}>NEW WEEK</Btn>
        </div>
        <Bar v={got / total * 100} />
      </Card>
      {GROUPS.map((g, gi) => (
        <Card key={g[0]}>
          <Eye>{g[0]}</Eye>
          {g[1].map((it, i) => { const k = gi + "-" + i, on = !!shop[k];
            return (
              <div key={k} role="checkbox" aria-checked={on} onClick={() => { setShop(Object.assign({}, shop, { [k]: !on })); buzz(15); }} style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid " + C.line : "none", cursor: "pointer", minHeight: 56 }}>
                <Box on={on} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div style={Object.assign({}, bdy, { fontSize: SZ.amount, fontWeight: 600, lineHeight: 1.3, color: on ? C.ash : C.bone, textDecoration: on ? "line-through" : "none" })}>{it[0]}</div>
                  <div style={Object.assign({}, bdy, { fontSize: F.meta, color: C.ash, marginTop: 2 })}>{it[1]}</div>
                </span>
              </div>);
          })}
        </Card>))}
      <Card><Note s={{ marginTop: 0, fontStyle: "italic" }}>Bananas green on Sunday ripen across the week. The supplements aren't a substitute for food — they're the honest answer to the one hole your food list actually has.</Note></Card>
    </div>);
}

/* a tape date as the charts print one: "8 Nov" */
const dayOf = (d) => { try { return parseISO(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch (e) { return String(d); } };
const nameOf = (n) => n.charAt(0) + n.slice(1).toLowerCase();

export function Referee({ tape, setTape, phase, weightOn }) {
  const rows = (tape || []).slice().sort((a, b) => a.d < b.d ? -1 : 1);
  const [d, setD] = useState(iso(sundayOf(new Date())));
  const [f, setF] = useState({ kg: "", waist: "", arm: "", shoulder: "" });
  const [msg, setMsg] = useState(null);
  const set = (k) => (v) => setF(Object.assign({}, f, { [k]: v }));

  const existing = rows.find((r) => r.d === d);
  const save = () => {
    const row = { d };
    for (const k of ["kg", "waist", "arm", "shoulder"]) { const n = num(f[k]); if (n != null) row[k] = n; }
    if (Object.keys(row).length < 2) { setMsg("Put a number in first."); return; }
    const merged = existing ? Object.assign({}, existing, row) : row;
    setTape(rows.filter((r) => r.d !== d).concat([merged]).sort((a, b) => a.d < b.d ? -1 : 1));
    setF({ kg: "", waist: "", arm: "", shoulder: "" });
    setMsg(existing ? "Updated " + dayOf(d) + "." : "Logged " + dayOf(d) + ".");
    toast(existing ? "Reading updated" : "Reading logged");
    buzz([60, 40, 60]);
  };
  const drop = (date) => { setTape(rows.filter((r) => r.d !== date)); buzz(30); };

  const P = phase ? PHASES[phase] : null;
  const V = verdicts(rows, weightOn);
  const lit = V.filter((v) => v.lit);
  const latest = (k) => { const p = tapeSeries(rows, k); return p.length ? p[p.length - 1].v : null; };

  return (
    <div>
      <Card>
        <Eye>The referee</Eye>
        <Note s={{ marginTop: 0 }}>Bodyweight and waist every Sunday; arm and shoulder every four weeks. Nothing here counts calories burned — what the tape and the scale do over weeks is the only verdict that counts.</Note>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {MEASURES.map((m) => { const v = latest(m.k);
            return (
              <div key={m.k} style={{ flex: "1 1 130px", minWidth: 0, background: M.card2, borderRadius: RAD.m, padding: "10px 12px" }}>
                <div style={cap()}>{m.n}</div>
                <div style={Object.assign({}, big, { fontSize: FS(17), fontWeight: 700, color: v == null ? C.ash : C.bone, lineHeight: 1.2, marginTop: 2 })}>{v == null ? "—" : v}{v == null ? null : <span style={Object.assign({}, mno, { fontSize: F.meta, fontWeight: 600, color: C.ash })}> {m.unit}</span>}</div>
              </div>); })}
        </div>
      </Card>

      {P ? (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <Eye s={{ marginBottom: 0 }}>{P.n}{P.sub ? " · " + P.sub : ""}</Eye>
            <span style={Object.assign({}, mno, { fontSize: FS(12), fontWeight: 700, color: C.bone, whiteSpace: "nowrap" })}>~{P.t.kcal.toLocaleString()}</span>
          </div>
          <div style={Object.assign({}, mno, { fontSize: FS(9), color: C.ash, marginTop: 4 })}>P{P.t.p} · C{P.t.c} · F{P.t.f} · DAILY AVERAGE</div>
          {P.r.map((x, i) => <Note key={i} s={{ marginTop: 6 }}>{x}</Note>)}
        </Card>) : null}

      <Card>
        <Eye>Log a reading</Eye>
        <Lab>Date — Sunday</Lab>
        <Fld type="date" v={d} on={(v) => { if (v) setD(v); }} s={{ textAlign: "left" }} />
        {[["Every Sunday", WEEKLY, { "kg": "80.4", "waist": "84" }], ["Every four weeks", UPPER, { "arm": "39.5", "shoulder": "121" }]].map((g) => (
          <div key={g[0]} style={{ marginTop: 14 }}>
            <div style={Object.assign({}, bdy, { fontSize: F.meta, fontWeight: 600, color: C.bone, marginBottom: 6 })}>{g[0]}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {g[1].map((m) => (
                <div key={m.k} style={{ flex: 1, minWidth: 0 }}>
                  <Lab>{m.n.toLowerCase()} {m.unit}</Lab>
                  <Fld v={f[m.k]} on={set(m.k)} ph={existing && existing[m.k] != null ? String(existing[m.k]) : g[2][m.k]} />
                </div>))}
            </div>
          </div>))}
        <Btn c={C.sage} fill s={{ width: "100%", marginTop: 12 }} on={save}>{existing ? "UPDATE THIS SUNDAY" : "LOG IT"}</Btn>
        {msg ? <Note c={C.honey}>{msg}</Note> : null}
      </Card>

      {MEASURES.map((m) => (
        <ChartCard key={m.k} testid={"tape-" + m.k} title={nameOf(m.n)} unit={m.unit} icon="scale"
          data={tapeSeries(rows, m.k).map((p) => [dayOf(p.d), p.v, parseISO(p.d).getTime()])}
          note={m.every4 ? "Every four weeks." : "Every Sunday."} empty="Two entries and the line starts." />))}

      <Card>
        <Eye>The feedback loop — read off your numbers</Eye>
        {V.map((v) => (
          <div key={v.id} style={{ borderTop: "1px solid " + C.line, padding: "10px 0 2px" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 999, flexShrink: 0, marginTop: 6, background: v.lit ? C.copper : "transparent", border: "1.5px solid " + (v.lit ? C.copper : M.ring) }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={Object.assign({}, bdy, { fontSize: FS(13), fontWeight: 600, color: v.lit ? C.bone : C.ash })}>{v.head}</div>
                <div data-testid={v.paused ? "referee-paused" : undefined} style={Object.assign({}, mno, { fontSize: FS(10), color: v.lit ? C.bone : C.ash, marginTop: 3, lineHeight: 1.4 })}>{v.read}</div>
                {v.lit ? <div style={Object.assign({}, bdy, { fontSize: FS(12.5), color: C.bone, marginTop: 5, lineHeight: 1.5 })}>{v.act}</div> : null}
              </span>
            </div>
          </div>))}
        {!lit.length ? <Note c={C.sage} bold>Arms and shoulders up, waist flat — correct. Change nothing.</Note> : null}
      </Card>

      <Card>
        <Eye>Every reading</Eye>
        {rows.length ? rows.slice().reverse().map((r) => (
          <div key={r.d} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0", borderTop: "1px solid " + C.line, minHeight: 56 }}>
            <span style={Object.assign({}, mno, { fontSize: F.meta, fontWeight: 600, color: C.bone, width: "4.4rem", flexShrink: 0 })}>{dayOf(r.d)}</span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: "2px 12px" }}>
              {MEASURES.map((m) => r[m.k] == null ? null : (
                <span key={m.k} style={Object.assign({}, mno, { fontSize: F.meta, color: C.bone, whiteSpace: "nowrap" })}>
                  <span style={{ color: C.ash, marginRight: 4 }}>{nameOf(m.n)}</span>{r[m.k]}</span>))}
            </span>
            <button onClick={() => drop(r.d)} aria-label={"Delete " + r.d} style={{ width: 44, height: 44, marginRight: -8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: C.ash, cursor: "pointer", flexShrink: 0 }}><Icon n="close" size={18} /></button>
          </div>)) : <Note>Nothing logged yet. Tape every four to six weeks; waist is the number that decides.</Note>}
      </Card>
    </div>);
}

/* ================================================================
   TODAY — what a feed row and a water row open to. The row itself (the
   time, the name, the tick) is TODAY's; these are the bodies.
   ================================================================ */
const WaterChips = ({ row, checks }) => {
  const lit = row.sachet && (!row.sachetIf || (checks || {})[row.sachetIf] === "dark");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {row.sachet ? <span style={Object.assign({}, mno, { fontSize: F.cap, fontWeight: 700, letterSpacing: .4, padding: "4px 10px", borderRadius: 999, color: lit ? C.bone : C.ash, background: lit ? soft(C.honey) : soft(C.ash) })}>{SACHET} {row.sachet}</span> : null}
      {row.cre ? <span style={Object.assign({}, mno, { fontSize: F.cap, fontWeight: 700, letterSpacing: .4, padding: "4px 10px", borderRadius: 999, color: C.bone, background: soft(C.sage) })}>{CREATINE}</span> : null}
    </div>);
};

/* A feed: what's on the plate, the cooked weights for the batch, the
   document's note, and the slot's matched options to swap to. */
export function FeedBody({ row, cook, onPick, checks }) {
  const bl = row.blk, S = row.slot && !row.fixed ? SLOTS[row.slot] : null;
  /* making weight: every option at the day's step; the low-fibre days
     offer only the low-fibre ones */
  const allowed = S && row.lowFibre ? lowFibreOpts(row.slot) : null;
  const okOpt = (k) => !allowed || allowed.indexOf(k) >= 0;
  const opt = (k, first) => { const b = row.w ? stepBlockOf(k, row.slot, row.big0, row.w).blk : blockOf(k, row.slot, row.big), sel = k === row.key;
    return (
      <button key={k} onClick={() => { onPick(row.pickId, k === row.base ? null : k, k); buzz(20); }}
        aria-label={"Choose " + b.n}
        aria-pressed={sel}
        style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, textAlign: "left", background: "transparent", border: "none", borderTop: first ? "none" : "1px solid " + C.line, padding: "8px 0", cursor: "pointer", minHeight: 56 }}>
        <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, border: "1.5px solid " + (sel ? C.ember : M.ring), display: "flex", alignItems: "center", justifyContent: "center" }}>{sel ? <span style={{ width: 10, height: 10, borderRadius: 999, background: C.ember }} /> : null}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={Object.assign({}, bdy, { fontSize: 18, fontWeight: sel ? 600 : 400, color: sel ? C.bone : C.ash, display: "block", lineHeight: 1.3 })}>{b.n}</span>
          <span style={Object.assign({}, mno, { fontSize: FS(9), color: C.ash })}>{b.kcal} KCAL · P{b.p} C{b.c} F{b.f}</span>
        </span>
      </button>); };
  return (
    <div>
      {bl.i.map((it, j) => (
        <div key={j} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: j ? "1px solid " + C.line : "none" }}>
          <span style={Object.assign({}, bdy, { fontSize: SZ.amount, color: C.bone, lineHeight: 1.3 })}>{it[0]}</span>
          <span style={Object.assign({}, mno, { fontSize: SZ.amount, fontWeight: 600, color: C.honey, textAlign: "right", lineHeight: 1.3 })}>{it[1]}</span>
        </div>))}
      <div style={Object.assign({}, mno, { fontSize: FS(10.5), color: C.ash, marginTop: 8 })}>{bl.kcal} KCAL · P{bl.p} · C{bl.c} · F{bl.f}</div>
      {bl.cook ? (() => {
        const parts = [];
        if (cook && cook.mince) parts.push("cooked mince ≈ " + cook.mince[bl.cook] + " g");
        /* only a plate with sweet potato on it (the wraps replace it);
           the half-carb plate's "150g raw — half" is half a standard portion */
        const pot = bl.i.find((x) => x[0] === "Sweet potato");
        if (cook && cook.potato && pot) parts.push("cooked sweet potato ≈ " + (/half/.test(pot[1]) ? Math.round(cook.potato.std / 2) : cook.potato[bl.cook]) + " g");
        return parts.length
          ? <div style={Object.assign({}, mno, { fontSize: FS(10.5), color: C.bone, marginTop: 8, lineHeight: 1.5 })}>{parts.join(" · ")}</div>
          : <Note s={{ fontStyle: "italic" }}>Weigh each pan once in COOK and this row shows what one portion of each looks like cooked.</Note>;
      })() : null}
      {row.wnote ? <Note c={C.bone}>{row.wnote}</Note> : null}
      <WaterChips row={row} checks={checks} />
      {bl.bn ? <Note s={{ fontStyle: "italic" }}>{bl.bn}</Note> : null}
      {row.note ? <Note s={{ fontStyle: "italic" }}>{row.note}</Note> : null}
      {S ? (
        <div style={{ marginTop: 14, borderTop: "1px solid " + C.line, paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px" }}>
            <Eye s={{ marginBottom: 6 }}>{S.n}{row.big ? " · BIG" : ""}</Eye>
            {S.t ? <span style={Object.assign({}, mno, { fontSize: FS(9), color: C.ash, marginBottom: 6 })}>{S.t}</span> : null}
          </div>
          {S.groups
            ? S.groups.filter((g) => g[1].some(okOpt)).map((g, gi) => (
                <div key={g[0]} style={{ marginTop: gi ? 8 : 0 }}>
                  <Eye s={{ marginBottom: 2 }}>{g[0]}</Eye>
                  {g[1].filter(okOpt).map((k, oi) => opt(k, oi === 0))}
                </div>))
            : S.opts.filter(okOpt).map((k, oi) => opt(k, oi === 0))}
          {S.note ? <Note s={{ fontStyle: "italic" }}>{S.note}</Note> : null}
        </div>) : null}
    </div>);
}

/* A drink on its own row, or a urine check with its two taps. */
export function WaterBody({ row, checks, setCheck }) {
  const cur = (checks || {})[row.check];
  return (
    <div>
      {row.note ? <Note c={C.bone} s={{ marginTop: 0 }}>{row.note}</Note> : null}
      <WaterChips row={row} checks={checks} />
      {row.check ? (
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {["pale", "dark"].map((v) => { const sel = cur === v;
            return <button key={v} onClick={() => { setCheck(row.check, sel ? null : v); buzz(20); }}
              aria-pressed={sel}
              style={Object.assign({}, dsp, { flex: 1, fontSize: 18, fontWeight: 700, letterSpacing: .4, padding: "10px 12px", borderRadius: RAD.m, cursor: "pointer", minHeight: 56, background: sel ? (v === "dark" ? C.copper : C.sage) : soft(C.ash), color: sel ? M.on : C.bone, border: "none" })}>{v === "pale" ? "PALE STRAW" : "DARK"}</button>; })}
        </div>) : null}
    </div>);
}

/* The day's numbers at the top of TODAY: the phase and what it changes,
   food eaten against the day, water drunk against the target, and the
   day's one coaching line. */
export function DayFuel({ phase, plan, eaten, total, drunk, target, notes, sauna, setSauna, showSauna, rules, midBanana, waterOnly }) {
  const [info, setInfo] = useState(false);
  const P = phase ? PHASES[phase] : null;
  const L = (ml) => (ml / 1000).toFixed(ml % 1000 === 0 ? 1 : 2).replace(/\.00$/, "");
  const pct = Math.min(100, drunk / (target || 1) * 100);
  return (
    <Card s={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 16 }}>
        {waterOnly ? null : <React.Fragment>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 10px" }}>
          <span>
            <span data-testid="fuel-phase" style={Object.assign({}, dsp, { fontSize: 22, fontWeight: 800, letterSpacing: .4, color: C.bone })}>{P ? P.n : plan.dayName}</span>
            {P && P.sub ? <span style={Object.assign({}, bdy, { fontSize: 18, color: C.ash, marginLeft: 7 })}>{P.sub}</span> : null}
          </span>
          <span style={Object.assign({}, mno, { fontSize: 18, fontWeight: 700, color: C.bone })}>{total.k.toLocaleString()}<span style={{ fontSize: 15, fontWeight: 600, color: C.ash }}> KCAL</span></span>
        </div>
        {P ? <div style={Object.assign({}, mno, { fontSize: 15, color: C.ash, marginTop: 3 })}>~{P.t.kcal.toLocaleString()} · P{P.t.p} · C{P.t.c} · F{P.t.f} · DAILY AVERAGE</div> : null}
        {P ? <Note s={{ marginTop: 6 }}>{P.chg || P.r[0]}</Note> : null}
        {midBanana ? <Note c={C.honey} bold>Scored and seven-round weeks: the mid-session banana, in the gap before the Nordics.</Note> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          <MacroBar label="KCAL" val={eaten.k} max={total.k || 1} c={C.honey} />
          <MacroBar label="P" val={eaten.p} max={total.p || 1} c={C.sage} />
          <MacroBar label="C" val={eaten.c} max={total.c || 1} c={C.ember} />
          <MacroBar label="F" val={eaten.f} max={total.f || 1} c={C.frost} />
        </div>
        </React.Fragment>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: waterOnly ? 0 : 12 }}>
          <span style={cap()}>WATER</span>
          <span data-testid="water-total" style={Object.assign({}, mno, { fontSize: 18, fontWeight: 700, color: drunk >= target ? C.sage : C.bone })}>{L(drunk)}<span style={{ fontSize: 15, fontWeight: 600, color: C.ash }}> / {L(target)} L</span></span>
        </div>
        <div style={{ marginTop: 6 }}><Bar v={pct} /></div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {showSauna ? <button onClick={() => { setSauna(!sauna); buzz(20); }} aria-pressed={!!sauna}
            style={Object.assign({}, dsp, { flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: .4, padding: "8px 4px", borderRadius: RAD.m, cursor: "pointer", minHeight: TAP, background: sauna ? C.copper : soft(C.ash), color: sauna ? M.on : C.bone, border: "none" })}>SAUNA TODAY</button> : null}
          <button onClick={() => setInfo(!info)} aria-expanded={info} style={Object.assign({}, dsp, { flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: .4, padding: "8px 4px", borderRadius: RAD.m, cursor: "pointer", minHeight: TAP, background: soft(C.ash), color: C.bone, border: "none" })}>{info ? "HIDE THE RULES" : "THE FOUR WATER RULES"}</button>
        </div>
        {info ? (
          <div className="rise" style={{ marginTop: 10 }}>
            {rules.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderTop: i ? "1px solid " + C.line : "none" }}>
                <span style={Object.assign({}, mno, { fontSize: 15, fontWeight: 700, color: C.ash, flexShrink: 0, marginTop: 4 })}>{i + 1}</span>
                <span style={Object.assign({}, bdy, { fontSize: 18, color: C.ash, lineHeight: 1.5 })}><span style={{ color: C.bone, fontWeight: 600 }}>{r[0]}</span> {r[1]}</span>
              </div>))}
          </div>) : null}
        {(notes || []).map((x, i) => <Note key={i} c={C.bone}>{x}</Note>)}
      </div>
      {plan.call && !waterOnly ? (
        <div style={{ background: M.card2, borderTop: "1px solid " + C.line, padding: "14px 16px" }}>
          <div style={cap()}>{plan.call[0]}</div>
          <div style={Object.assign({}, bdy, { fontSize: 18, color: C.bone, marginTop: 4, lineHeight: 1.45 })}>{plan.call[1]}</div>
        </div>) : null}
    </Card>);
}

export { hhmm };
