import React, { useState, useMemo } from "react";
import { C, soft, dsp, bdy, mno, big, cap, FS, RAD, Icon, Card, Eye, Btn, Note, Seg, Fld, Meter, Banner, NavRow, toast, buzz } from "./ui.jsx";
import { readEntry, eaten as eatenOf, leftOf, nextMeal, suggest, lateProtein, myFood, clock, minsOf, mealsOf, DAY_NAME, CHECK_SAY, PROTEIN, sentence, rewrite, others, near, amountsFor, foodById, per100Of, spoonOf, FOODS } from "./food.js";

/* ================================================================
   FOOD · TODAY — the day's budget (brief 34). What's left at the top,
   the next meal under it, then the box to type what you ate: it works
   as a calculator, the numbers showing before anything is added. The
   numbers and the rules are in food.js; the foods it knows are in
   food-list.js.
   ================================================================ */
const n0 = (x) => Math.round(x).toLocaleString("en-GB");
const g0 = (x) => Math.round(x);
const macroLine = (m) => n0(m.kcal) + " kcal · " + g0(m.p) + " g protein · " + g0(m.c) + " g carbs · " + g0(m.f) + " g fat";
const d1 = (x) => Math.round(x * 10) / 10;
/* a food's numbers per 100 g, one line for each state it's weighed in */
const perLines = (f, cook) => per100Of(f, cook).map((p) => (p.state ? sentence(p.state) + ": " : "") + n0(p.m[0]) + " kcal · P " + d1(p.m[1]) + " · C " + d1(p.m[2]) + " · F " + d1(p.m[3]));
const per100Say = (f) => "Per 100 " + (f.liquid ? "ml" : "g");
/* what to put in the box for a food picked from a list: one of it, a spoon of it, or 100 g */
const starter = (f) => (f.each && !f.each.ask ? "1 " : f.liquid ? "250ml " : spoonOf(f) ? "1 " + spoonOf(f) + " " : "100g ") + f.keys[0];

/* one of a row of choices */
const Pill = ({ on, sel, children, pick }) => (
  <button onClick={on} data-pick={pick} aria-pressed={sel == null ? undefined : !!sel} style={Object.assign({}, bdy, { fontSize: FS.meta, fontWeight: 600, color: sel ? C.on : C.chalk, background: sel ? C.accent : soft(C.ash), border: "none", borderRadius: 999, padding: "8px 14px", minHeight: 44, cursor: "pointer", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>{children}</button>);
const Pills = ({ children, s }) => <div style={Object.assign({ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }, s)}>{children}</div>;

/* A food that was read, opened up: what it is per 100 g, the state it
   was weighed in, and the other foods the same words could have meant. */
function Change({ x, mine, cook, go }) {
  const f = foodById(x.id, mine);
  if (!f) return null;
  const alts = others(f, x.key, mine, 6);
  return (
    <div data-testid="food-change" style={{ padding: "0 0 12px" }}>
      <div style={Object.assign({}, mno, { fontSize: FS.meta, color: C.ash, lineHeight: 1.5 })}>
        <span style={{ fontWeight: 700 }}>{per100Say(f)}</span>
        {perLines(f, cook).map((s, k) => <span key={k} style={{ display: "block" }}>{s}</span>)}
      </div>
      {x.states && x.states.length > 1 ? (
        <Pills>{x.states.map((s) => <Pill key={s} pick={"state-" + s} sel={s === x.state} on={() => go({ state: s })}>{"Weighed " + s}</Pill>)}</Pills>) : null}
      {alts.length ? (
        <div style={{ marginTop: 12 }}>
          <div style={cap()}>Or it was</div>
          <Pills>{alts.map((a) => <Pill key={a.id} pick={a.id} on={() => go({ key: a.keys[0] }, true)}>{a.n}</Pill>)}</Pills>
        </div>) : null}
    </div>);
}

/* one of the three: what's left of it, and a bar of what's eaten */
function Left({ label, left, target, unit, testid }) {
  const over = left < 0;
  return (
    <div data-testid={testid} style={{ padding: "10px 0", borderTop: "1px solid " + C.line }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <span style={Object.assign({}, bdy, { fontSize: FS.body, fontWeight: 600, color: C.chalk })}>{label}</span>
        <span style={Object.assign({}, mno, { fontSize: FS.body, fontWeight: 700, color: over ? C.warn : C.chalk, whiteSpace: "nowrap" })}>
          {over ? g0(-left) + " " + unit + " over" : g0(left) + " " + unit + " left"}<span style={{ fontSize: FS.meta, fontWeight: 600, color: C.ash }}> of {g0(target)}</span>
        </span>
      </div>
      <Meter v={(target - left) / (target || 1)} c={over ? C.warn : C.accent} label={label + " eaten"} />
    </div>);
}

export function FoodToday({ bud, entries, setEntries, mine, setMine, cook, meals, now, recent, surplus, setSurplus, boxSw }) {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState(null);
  const [at, setAt] = useState("");
  const [showMeals, setShowMeals] = useState(false);
  const [adding, setAdding] = useState(null);
  const [open, setOpen] = useState(null);          // the food in the preview that's opened up
  const t = bud.t;
  const e = eatenOf(entries);
  const left = leftOf(t, e);
  const nm = nextMeal({ entries, now, left });
  const read = useMemo(() => (picked ? null : readEntry(text, { mine, cook })), [text, picked, JSON.stringify(mine), JSON.stringify(cook)]);
  const preview = picked ? { items: [Object.assign({ name: picked.n, amount: "1 meal" }, picked)], total: picked, ok: true } : read;
  const late = lateProtein(left, now);
  /* breakfasts before eleven, dinners from four, the rest any time */
  const fitsTime = (m, at) => (m.slot === "breakfast" ? at < 11 * 60 : m.slot === "dinner" ? at >= 16 * 60 : true);
  const ideas = nm.first || nm.done ? [] : suggest(meals.filter((m) => fitsTime(m, Math.max(nm.at, now || 0))), nm.aim, left, 3);
  const logIt = () => {
    if (!preview || !preview.ok) return;
    const when = minsOf(at) != null ? minsOf(at) : now;
    const item = { id: "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: when, text: picked ? picked.n : text.trim(),
      kcal: preview.total.kcal, p: preview.total.p, c: preview.total.c, f: preview.total.f,
      items: preview.items.map((x) => ({ n: x.name, a: x.amount, kcal: x.kcal, p: x.p, c: x.c, f: x.f })) };
    setEntries((entries || []).concat([item]).sort((a, b) => a.at - b.at));
    setText(""); setPicked(null); setAt(""); setOpen(null); buzz(20);
    toast("Logged · " + n0(item.kcal) + " kcal · " + g0(item.p) + " g protein");
  };
  const drop = (id) => setEntries((entries || []).filter((x) => x.id !== id));
  const fill = (s) => { setPicked(null); setText(s); };
  const pick = (m) => { setText(""); setPicked(m); setOpen(null); };
  /* part i of what's typed, written again: another food, state or amount */
  const change = (i) => (ch, shut) => { setText(rewrite(text, i, ch, { mine })); if (shut) setOpen(null); };
  const aimP = nm.first || nm.done ? 40 : Math.max(20, Math.min(60, Math.round(nm.aim.p)));
  const after = preview && preview.ok ? leftOf(left, preview.total) : null;
  const toTop = () => { if (typeof window !== "undefined" && window.scrollTo) { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (err) { /* old phones */ } } };
  const isOver = left.kcal < 0;
  const modeSay = bud.mode === "cut" ? "Cutting · the weight plan's step " + bud.step : bud.mode === "surplus" ? "Slight surplus" : "Maintenance";
  return (
    <div data-testid="food-today">
      {bud.planDay ? <Banner kind="warn" testid="plan-day">{bud.planDay}</Banner> : null}
      {boxSw || null}

      {/* WHAT'S LEFT */}
      <Card s={{ paddingBottom: 6 }}>
        <div data-testid="food-left">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={cap()}>Left today</span>
            <span data-testid="day-type" style={Object.assign({}, bdy, { fontSize: FS.meta, fontWeight: 600, color: C.ash })}>{DAY_NAME[bud.type]} · {n0(t.kcal)} kcal</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "4px 0 10px" }}>
            <span data-testid="kcal-left" style={Object.assign({}, big, { fontSize: 56, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, color: isOver ? C.warn : C.chalk })}>{n0(Math.abs(left.kcal))}</span>
            <span style={Object.assign({}, mno, { fontSize: FS.body, fontWeight: 600, color: C.ash })}>{isOver ? "kcal over" : "kcal"}</span>
          </div>
          <Left label="Protein" left={left.p} target={t.p} unit="g" testid="left-p" />
          <Left label="Carbs" left={left.c} target={t.c} unit="g" testid="left-c" />
          <Left label="Fat" left={left.f} target={t.f} unit="g" testid="left-f" />
          <div data-testid="food-mode" style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, padding: "10px 0 8px", borderTop: "1px solid " + C.line, lineHeight: 1.45 })}>
            {modeSay}{bud.adj ? " · " + (bud.adj > 0 ? "+" : "−") + Math.abs(bud.adj) + " kcal a day from the Sunday checks" : ""}{t.floor ? " · at the floor: carbs 3 g and fat 0.6 g per kilo" : ""}
          </div>
        </div>
      </Card>

      {/* THE NEXT MEAL */}
      <Card>
        <div data-testid="next-meal">
          <Eye>Next meal</Eye>
          {nm.first ? (
            <div>
              <div style={Object.assign({}, dsp, { fontSize: FS.lead, fontWeight: 800, color: C.chalk })}>Whenever you're ready</div>
              <Note s={{ marginTop: 4 }}>The clock starts with the first thing you log. Then a meal about every three hours, five in the day, about 40 g of protein each.</Note>
            </div>
          ) : nm.done ? (
            <div style={Object.assign({}, dsp, { fontSize: FS.lead, fontWeight: 800, color: C.accent })}>The day's numbers are hit</div>
          ) : (
            <div>
              <div data-testid="next-at" style={Object.assign({}, dsp, { fontSize: FS.lead, fontWeight: 800, color: C.chalk })}>{nm.now ? "Now" : "About " + clock(nm.at)}</div>
              <div data-testid="next-aim" style={Object.assign({}, bdy, { fontSize: FS.body, color: C.chalk, marginTop: 4, lineHeight: 1.45 })}>
                Aim for about <b>{g0(nm.aim.p)} g protein</b> and {n0(nm.aim.kcal)} kcal{nm.toCome > 1 ? " — " + nm.toCome + " meals to come" : " — the last one"}.
              </div>
              {ideas.length ? (
                <div style={{ marginTop: 12 }}>
                  <div style={Object.assign(cap(), { marginBottom: 6 })}>Fits it</div>
                  {ideas.map((m) => (
                    <button key={m.id} onClick={() => pick(m)} data-idea={m.id} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", gap: 10, textAlign: "left", background: soft(C.ash), border: "none", borderRadius: RAD.m, padding: "10px 12px", marginTop: 6, minHeight: 52, cursor: "pointer" }}>
                      <span style={Object.assign({}, bdy, { fontSize: FS.body, fontWeight: 600, color: C.chalk, lineHeight: 1.25 })}>{m.n}</span>
                      <span style={Object.assign({}, mno, { fontSize: FS.meta, color: C.ash, whiteSpace: "nowrap" })}>{n0(m.kcal)} · {g0(m.p)} g</span>
                    </button>))}
                </div>) : null}
            </div>)}
          {late ? <Note c={C.chalk} s={{ marginTop: 10 }}>{late}</Note> : null}
        </div>
      </Card>

      {/* WHAT YOU ATE */}
      <Card>
        <div data-testid="food-add">
          <Eye>What did you eat?</Eye>
          {picked ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: soft(C.accent), borderRadius: RAD.m, padding: "10px 12px" }}>
              <span style={Object.assign({}, bdy, { flex: 1, fontSize: FS.body, fontWeight: 600, color: C.chalk })}>{picked.n}</span>
              <button onClick={() => setPicked(null)} aria-label="Clear" style={{ width: 44, height: 44, border: "none", background: "transparent", color: C.ash, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon n="close" size={20} /></button>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <textarea data-testid="food-text" value={text} onChange={(ev) => fill(ev.target.value)} rows={Math.max(2, Math.min(6, Math.ceil(text.length / 26)))} placeholder="200g cooked mince, 250g pasta" aria-label="What you ate: the weight and the food"
                style={Object.assign({}, bdy, { width: "100%", background: C.ink, border: "1px solid " + C.line, borderRadius: RAD.m, color: C.chalk, fontSize: FS.body, lineHeight: 1.4, padding: "12px 44px 12px 12px", resize: "none", minHeight: 76 })} />
              {text ? <button onClick={() => { fill(""); setOpen(null); }} aria-label="Clear the box" style={{ position: "absolute", top: 2, right: 0, width: 44, height: 44, border: "none", background: "transparent", color: C.ash, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon n="close" size={18} /></button> : null}
            </div>)}
          {!picked && !text ? <div style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash, lineHeight: 1.45, marginTop: 8 })}>The weight, then the food. The numbers show before you add it, so it's a calculator too.</div> : null}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {["ufit bottle", "half a bottle", "banana"].concat((recent || []).filter((r) => ["ufit bottle", "half a bottle", "banana", "ufit", "bottle"].indexOf(String(r).trim().toLowerCase()) < 0).slice(0, 4)).map((s, i) => (
              <button key={i} onClick={() => fill(s)} style={Object.assign({}, bdy, { fontSize: FS.meta, fontWeight: 600, color: C.chalk, background: soft(C.ash), border: "none", borderRadius: 999, padding: "8px 14px", minHeight: 44, cursor: "pointer", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>{s === "ufit bottle" ? "UFIT bottle" : s === "half a bottle" ? "Half a bottle" : s === "banana" ? "Banana" : s}</button>))}
          </div>
          {preview && preview.items.length ? (
            <div data-testid="food-preview" style={{ marginTop: 12 }}>
              {preview.items.map((x, i) => {
                const kind = x.unknown ? "unknown" : x.needG ? "grams" : "ok";
                const can = kind === "ok" && !picked && x.id != null && x.id !== "batch";
                const isOpen = can && open === i;
                return (
                  <div key={i} data-preview-item={kind} style={{ borderTop: "1px solid " + C.line }}>
                    {x.unknown ? (
                      <div style={{ padding: "8px 0 10px" }}>
                        <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, color: C.warn, fontWeight: 600 })}>Not in the list: "{x.text}"</span>
                        {(() => { const close = near(x.text, mine, 4); return close.length ? (
                          <div data-testid="food-close" style={{ marginTop: 8 }}>
                            <div style={cap()}>Closest in the list</div>
                            <Pills>{close.map((a) => <Pill key={a.id} pick={a.id} on={() => change(i)({ key: a.keys[0] })}>{a.n}</Pill>)}</Pills>
                          </div>) : null; })()}
                        <button onClick={() => setAdding({ name: x.text.replace(/^\s*[\d.]+\s*(g|kg|ml|l)?\s*/i, "") })} style={Object.assign({}, dsp, { marginTop: 10, fontSize: FS.meta, fontWeight: 700, color: C.chalk, background: soft(C.ash), border: "none", borderRadius: RAD.s, padding: "8px 12px", minHeight: 44, cursor: "pointer" })}>ADD IT FROM THE PACKET</button>
                      </div>
                    ) : x.needG ? (
                      <div style={{ padding: "8px 0 10px" }}>
                        <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, color: C.warn, fontWeight: 600 })}>How many {x.food.liquid ? "millilitres" : "grams"} of {x.food.n.toLowerCase()}? Type it like "{x.food.liquid ? "250ml" : spoonOf(x.food) ? "1 " + spoonOf(x.food) : "200g"} {x.food.keys[0]}", or pick one.</span>
                        {x.extra ? <span data-testid="food-extra" style={Object.assign({}, bdy, { display: "block", fontSize: FS.meta, color: C.warn, lineHeight: 1.45, marginTop: 4 })}>It didn't use "{x.extra.join(" ")}".</span> : null}
                        <Pills>{amountsFor(x.food, x.state, aimP).map((a) => <Pill key={a.amount} pick={a.amount} on={() => change(i)({ amount: a.amount })}>{a.label}</Pill>)}</Pills>
                      </div>
                    ) : (
                      <React.Fragment>
                        {(() => { const inside = (
                          <React.Fragment>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, fontWeight: 600, color: C.chalk, lineHeight: 1.3 })}>{x.name}</span>
                              <span style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.ash })}>{x.amount}{x.est ? " · estimate: weigh the pans in COOK" : ""}</span>
                            </span>
                            <span style={Object.assign({}, mno, { fontSize: FS.meta, color: C.chalk, textAlign: "right", whiteSpace: "nowrap", lineHeight: 1.4 })}>{n0(x.kcal)} kcal<br /><span style={{ color: C.ash }}>P {g0(x.p)} · C {g0(x.c)} · F {g0(x.f)}</span></span>
                            {can ? <span aria-hidden="true" style={{ color: C.ash, display: "flex", alignSelf: "center", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}><Icon n="down" size={18} /></span> : null}
                          </React.Fragment>);
                          const row = { display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start", gap: 10, textAlign: "left", background: "transparent", border: "none", padding: "8px 0", minHeight: 52 };
                          return can ? <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} data-preview-row={i} style={Object.assign(row, { cursor: "pointer" })}>{inside}</button>
                            : <div data-preview-row={i} style={row}>{inside}</div>; })()}
                        {x.extra ? <div data-testid="food-extra" style={Object.assign({}, bdy, { fontSize: FS.meta, color: C.warn, lineHeight: 1.45, paddingBottom: 8 })}>Read as {x.name.toLowerCase()}. It didn't use "{x.extra.join(" ")}": tap the food if it's the wrong one.</div> : null}
                        {isOpen ? <Change x={x} mine={mine} cook={cook} go={change(i)} /> : null}
                      </React.Fragment>)}
                  </div>); })}
              {preview.ok ? <div data-testid="preview-total" style={Object.assign({}, mno, { fontSize: FS.meta, fontWeight: 700, color: C.chalk, padding: "8px 0 2px", borderTop: "1px solid " + C.line })}>{macroLine(preview.total)}</div> : null}
              {after ? <div data-testid="preview-after" style={Object.assign({}, mno, { fontSize: FS.meta, color: C.ash, paddingBottom: 2 })}>After it: {after.kcal < 0 ? n0(-after.kcal) + " kcal over" : n0(after.kcal) + " kcal"} and {g0(Math.max(0, after.p))} g protein left</div> : null}
              {!picked && preview.items.some((x) => !x.unknown && !x.needG && x.id != null && x.id !== "batch") ? <div style={Object.assign({}, bdy, { fontSize: FS.micro, color: C.ash, paddingTop: 6 })}>Tap a food to see it per 100 g, or to change which one it is.</div> : null}
            </div>) : null}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 12 }}>
            <div style={{ width: 112, flexShrink: 0 }}>
              <div style={Object.assign(cap(), { fontSize: FS.micro, marginBottom: 4 })}>At</div>
              <Fld type="text" v={at} on={setAt} ph={clock(now)} s={{ minHeight: 56 }} />
            </div>
            <Btn fill dis={!preview || !preview.ok} on={logIt} s={{ flex: 1, minHeight: 56 }}>{preview && preview.ok ? "ADD · " + n0(preview.total.kcal) + " KCAL" : "ADD"}</Btn>
          </div>
        </div>
      </Card>

      {/* TODAY'S LOG */}
      <Card>
        <div data-testid="food-log">
          <Eye>Eaten today · {n0(e.kcal)} kcal · {g0(e.p)} g protein</Eye>
          {!(entries || []).length ? <Note s={{ marginTop: 0 }}>Nothing logged yet today.</Note> : mealsOf(entries).map((m, mi) => (
            <div key={mi} style={{ borderTop: mi ? "1px solid " + C.line : "none", padding: "6px 0" }}>
              {m.items.map((x) => (
                <div key={x.id} data-entry={x.id} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 52 }}>
                  <span style={Object.assign({}, mno, { width: 52, flexShrink: 0, fontSize: FS.meta, fontWeight: 600, color: C.ash })}>{clock(x.at)}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, color: C.chalk, lineHeight: 1.3 })}>{x.text}</span>
                    <span style={Object.assign({}, mno, { fontSize: FS.meta, color: C.ash })}>{n0(x.kcal)} kcal · P {g0(x.p)} · C {g0(x.c)} · F {g0(x.f)}</span>
                  </span>
                  <button onClick={() => drop(x.id)} aria-label={"Delete " + x.text} style={{ width: 44, height: 44, marginRight: -8, flexShrink: 0, border: "none", background: "transparent", color: C.ash, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon n="close" size={18} /></button>
                </div>))}
            </div>))}
        </div>
      </Card>

      {/* YOUR MEALS: the old menu, one tap each */}
      <Card s={{ padding: 0 }}>
        <button onClick={() => setShowMeals(!showMeals)} aria-expanded={showMeals} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: "0 16px", minHeight: 56, cursor: "pointer" }}>
          <span style={cap()}>Your meals, one tap each</span>
          <span aria-hidden="true" style={{ color: C.ash, display: "flex", transform: showMeals ? "rotate(180deg)" : "none", transition: "transform .2s" }}><Icon n="down" size={18} /></span>
        </button>
        {showMeals ? (
          <div data-testid="meal-list" style={{ padding: "0 16px 8px" }}>
            {meals.map((m) => (
              <button key={m.id} onClick={() => { pick(m); toTop(); }} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", gap: 10, textAlign: "left", background: "transparent", border: "none", borderTop: "1px solid " + C.line, padding: "8px 0", minHeight: 52, cursor: "pointer" }}>
                <span style={Object.assign({}, bdy, { fontSize: FS.body, color: C.chalk, lineHeight: 1.25 })}>{m.n}</span>
                <span style={Object.assign({}, mno, { fontSize: FS.meta, color: C.ash, whiteSpace: "nowrap" })}>{n0(m.kcal)} · {g0(m.p)} g</span>
              </button>))}
          </div>) : null}
      </Card>

      {/* THE FOOD LIST, TO LOOK A FOOD UP */}
      <LookUp mine={mine} cook={cook} on={(f) => { fill((picked || !text.trim() ? "" : text.trim().replace(/[,\s]+$/, "") + ", ") + starter(f)); setOpen(null); toTop(); }} />

      {/* A FOOD FROM ITS PACKET */}
      <MyFoods mine={mine} setMine={setMine} adding={adding} setAdding={setAdding} />

      {/* HOW THE NUMBERS ARE SET */}
      <Card>
        <Eye>How the numbers are set</Eye>
        <Note s={{ marginTop: 0 }}>Protein is {PROTEIN} g every day. Calories follow the day: 3,600 on a hard day (the gym and boxing, or the long session), 3,200 on a gym day, 2,700 on a day off. Carbs take the difference; fat sits at 75 g.</Note>
        {bud.mode === "cut" ? (
          <Note>A fight and a weight limit are set, so the weight plan runs the cut: its step comes off every day, and its Sunday check moves it.</Note>
        ) : (
          <div style={{ marginTop: 12 }}>
            <Seg opts={[["keep", "MAINTENANCE"], ["surplus", "SLIGHT SURPLUS"]]} val={surplus ? "surplus" : "keep"} on={(v) => setSurplus(v === "surplus")} />
            <Note>{surplus ? "250 kcal a day over, in carbs. The Sunday check lets your average rise up to about a third of a kilo a week." : "The Sunday check holds your 7-morning average weight where it is, moving the day 150 kcal at a time."}</Note>
          </div>)}
        {bud.check ? <div data-testid="last-check"><Note c={C.chalk}>Sunday {bud.check.sun.slice(8, 10).replace(/^0/, "")} {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(bud.check.sun.slice(5, 7)) - 1]}: {CHECK_SAY[bud.check.why]}</Note></div> : null}
      </Card>
    </div>);
}

/* The food list, searched: every food it knows with its numbers per
   100 g. Tapping one puts it in the box, ready for its weight. */
function LookUp({ mine, cook, on }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const hits = useMemo(() => (q.trim().length >= 2 ? near(q, mine, 20) : []), [q, JSON.stringify(mine)]);
  const count = FOODS.filter((f) => !f.batch).length + (mine || []).length;
  return (
    <Card s={{ padding: 0 }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: "0 16px", minHeight: 56, cursor: "pointer" }}>
        <span style={cap()}>Look up a food · {count} in the list</span>
        <span aria-hidden="true" style={{ color: C.ash, display: "flex", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}><Icon n="down" size={18} /></span>
      </button>
      {open ? (
        <div data-testid="food-lookup" style={{ padding: "0 16px 12px" }}>
          <Fld type="text" a="left" v={q} on={setQ} ph="Raisins, chicken thigh, rice…" />
          {q.trim().length < 2 ? <Note>Calories, protein, carbs and fat per 100 g, the way a packet prints them. Type a food's name; tap one to put it in the box.</Note>
            : !hits.length ? <Note>Nothing close to that in the list. Add it from its packet, below.</Note>
            : hits.map((f) => (
              <button key={f.id} data-food={f.id} onClick={() => on(f)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: "1px solid " + C.line, padding: "10px 0", minHeight: 52, cursor: "pointer" }}>
                <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, fontWeight: 600, color: C.chalk, lineHeight: 1.3 })}>{f.n}</span>
                {perLines(f, cook).map((s, k) => <span key={k} style={Object.assign({}, mno, { display: "block", fontSize: FS.meta, color: C.ash, lineHeight: 1.45 })}>{s}</span>)}
                <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.micro, color: C.ash, lineHeight: 1.45 })}>{per100Say(f)}{f.each ? " · 1 " + f.each.w + (f.each.about ? " is about " : " is ") + f.each.g + (f.liquid ? " ml" : " g") : ""}</span>
              </button>))}
        </div>) : null}
    </Card>);
}

/* the foods typed in from a packet's panel, kept on the phone */
function MyFoods({ mine, setMine, adding, setAdding }) {
  const [f, setF] = useState({ per: "100" });
  const open = !!adding;
  const cur = Object.assign({}, f, adding && adding.name && f.name == null ? { name: adding.name } : {});
  const set = (k) => (v) => setF(Object.assign({}, cur, { [k]: v }));
  const made = myFood({ name: cur.name, per: cur.per === "item" ? "item" : "100", g: cur.g, kcal: cur.kcal, p: cur.p, c: cur.c, f: cur.f });
  const saveIt = () => { if (!made) return; setMine((mine || []).filter((x) => x.id !== made.id).concat([made])); setF({ per: "100" }); setAdding(null); toast("Saved · " + made.n); };
  return (
    <Card s={{ padding: 0 }}>
      <button onClick={() => { setAdding(open ? null : {}); setF({ per: "100" }); }} aria-expanded={open} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: "0 16px", minHeight: 56, cursor: "pointer" }}>
        <span style={cap()}>Add a food from its packet</span>
        <span aria-hidden="true" style={{ color: C.ash, display: "flex" }}><Icon n={open ? "minus" : "plus"} size={18} /></span>
      </button>
      {open ? (
        <div data-testid="my-food-form" style={{ padding: "0 16px 16px" }}>
          <Fld type="text" a="left" v={cur.name} on={set("name")} ph="Name, as you'll type it" />
          <div style={{ marginTop: 10 }}><Seg opts={[["100", "PER 100 G"], ["item", "PER ITEM"]]} val={cur.per} on={set("per")} /></div>
          {cur.per === "item" ? <div style={{ marginTop: 10 }}><Fld v={cur.g} on={set("g")} ph="One item weighs (g)" /></div> : null}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <Fld v={cur.kcal} on={set("kcal")} ph="kcal" />
            <Fld v={cur.p} on={set("p")} ph="protein g" />
            <Fld v={cur.c} on={set("c")} ph="carbs g" />
            <Fld v={cur.f} on={set("f")} ph="fat g" />
          </div>
          <Note>Off the panel on the back, {cur.per === "item" ? "per item" : "per 100 g"}. Then type it like any other food: {cur.per === "item" ? "\"2 " + (cur.name || "of them").toLowerCase() + "\"" : "\"150g " + (cur.name || "it").toLowerCase() + "\""}.</Note>
          <Btn fill dis={!made} on={saveIt} s={{ width: "100%", marginTop: 10 }}>SAVE THE FOOD</Btn>
        </div>) : null}
      {(mine || []).length ? (
        <div data-testid="my-foods" style={{ padding: "0 16px 8px" }}>
          {mine.map((x) => (
            <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid " + C.line, minHeight: 52 }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={Object.assign({}, bdy, { display: "block", fontSize: FS.body, color: C.chalk })}>{x.n}</span>
                <span style={Object.assign({}, mno, { fontSize: FS.meta, color: C.ash })}>{x.each ? "per item (" + x.each.g + " g)" : "per 100 g"} · {(x.each ? x.each.m : x.std)[0]} kcal · P {(x.each ? x.each.m : x.std)[1]}</span>
              </span>
              <button onClick={() => setMine(mine.filter((y) => y.id !== x.id))} aria-label={"Delete " + x.n} style={{ width: 44, height: 44, marginRight: -8, border: "none", background: "transparent", color: C.ash, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon n="close" size={18} /></button>
            </div>))}
        </div>) : null}
    </Card>);
}

/* TODAY's home: one row for the food — what's left and when to eat next */
export function FoodRow({ bud, entries, now, on }) {
  const left = leftOf(bud.t, eatenOf(entries));
  const nm = nextMeal({ entries, now, left });
  const sub = (left.kcal < 0 ? n0(-left.kcal) + " kcal over" : n0(left.kcal) + " kcal") + " and " + g0(Math.max(0, left.p)) + " g protein left"
    + (nm.first ? " · nothing logged yet" : nm.done ? "" : " · next meal " + (nm.now ? "now" : "about " + clock(nm.at)));
  return (
    <Card s={{ padding: "0 16px" }}>
      <NavRow icon="food" title="Food" sub={sub} last on={on} testid="food-row" />
    </Card>);
}

/* the old menu's meals, as one thing each to log */
export const mealsFrom = (B, keys, slotOf) => keys.filter((k) => B[k]).map((k) => ({ id: k, slot: slotOf ? slotOf(k) : null, n: sentence(B[k].n).replace(/\bufit\b/i, "UFIT").replace(/ bbq\b/i, " BBQ"), kcal: B[k].kcal, p: B[k].p, c: B[k].c, f: B[k].f }));
