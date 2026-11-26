import React from "react";
import { C, soft, dsp, cap, FS, Icon } from "./ui.jsx";

/* ================================================================
   THE SHEET — a full-screen page over the app: its title stays at the
   top with the button that closes it. The tools, the tests and the
   profile open in one.
   ================================================================ */
export function Sheet({ title, sub, onClose, children }) {
  return (
    <div data-testid="sheet" role="dialog" aria-label={title} className="sheet" style={{ position: "fixed", inset: 0, background: C.ink, zIndex: 120, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
      <div className="o8-glass" style={{ position: "sticky", top: 0, zIndex: 2, background: C.slab, borderBottom: "1px solid " + C.line, paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 640, margin: "0 auto", padding: "10px 12px 10px 16px", paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(12px, env(safe-area-inset-right))" }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <div style={Object.assign({}, dsp, { fontSize: FS.lead, fontWeight: 800, letterSpacing: .2, color: C.chalk, lineHeight: 1.15 })}>{title}</div>
            {sub ? <div style={Object.assign(cap(), { fontSize: FS.micro, letterSpacing: .6, lineHeight: 1.35, marginTop: 3 })}>{sub}</div> : null}
          </span>
          <button onClick={onClose} aria-label="Close" style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 999, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: soft(C.ash), color: C.chalk }}><Icon n="close" size={22} w={2.4} /></button>
        </div>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: 16, paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))", paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
        {children}
      </div>
    </div>);
}
