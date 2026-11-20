import React from "react";
import { C, dsp, mno, Btn } from "./ui.jsx";

/* ================================================================
   THE SHEET — a full-screen page over the app, with its title and a
   CLOSE button: the tools, the tests and the profile open in one.
   ================================================================ */
export function Sheet({ title, sub, colour, onClose, children }) {
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
