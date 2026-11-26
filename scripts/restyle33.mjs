/* BRIEF 33 · THE SWEEP — run once: node scripts/restyle33.mjs
   Brings every older screen's own sizes onto the design system's:
   the type scale (12 · 13 · 15 · 18 · 22 · 28 · 32), the corners
   (10 · 14 · 20), one outline weight, one letter-spacing for small
   capitals and a tighter one for anything at reading size or bigger. It
   only rewrites numbers inside style objects, never a word on a screen,
   and running it twice changes nothing the second time. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["App.jsx", "camp-ui.jsx", "fuel-ui.jsx", "mdview.jsx", "metrics-ui.jsx", "move-ui.jsx", "range-ui.jsx", "season-ui.jsx", "sheet.jsx", "today.jsx", "weight-ui.jsx", "welcome.jsx"];

const SIZE = { 7: 12, 7.5: 12, 8: 12, 8.5: 12, 9: 12, 9.5: 12, 10: 12, 10.5: 12, 11: 12, 11.5: 12, 12.5: 13, 13.5: 13, 14: 15, 14.5: 15, 16: 18, 17: 18, 19: 18, 20: 22, 21: 22, 23: 22, 24: 22, 26: 28, 30: 28, 34: 32 };
const CORNER = { 4: 10, 5: 10, 6: 10, 8: 14, 9: 14, 18: 20 };
const TRACK = { "1.1": "1", "1.2": "1", "1.3": "1", "1.4": "1", "1.5": "1", "2": "1", "3": "1", ".5": ".4" };
const size = (n) => (SIZE[Number(n)] != null ? String(SIZE[Number(n)]) : n);
const corner = (n) => (CORNER[Number(n)] != null ? String(CORNER[Number(n)]) : n);

export function restyle(text) {
  return text
    /* a size on its own, and the two sides of a size that depends on something */
    .replace(/\bfontSize: (\d+(?:\.\d+)?)(?=[,\s})])/g, (m, n) => "fontSize: " + size(n))
    .replace(/\bfontSize: ([A-Za-z_][A-Za-z0-9_.!&| ]*\? )(\d+(?:\.\d+)?)( : )(\d+(?:\.\d+)?)(?=[,\s})])/g, (m, a, x, b, y) => "fontSize: " + a + size(x) + b + size(y))
    /* the corners */
    .replace(/\bborderRadius: (\d+)(?=[,\s})])/g, (m, n) => "borderRadius: " + corner(n))
    /* one outline weight */
    .replace(/"2px solid "/g, '"1.5px solid "')
    /* capitals are spaced one way */
    .replace(/\bletterSpacing: (\d*\.?\d+)(?=[,\s})])/g, (m, n) => "letterSpacing: " + (TRACK[n] != null ? TRACK[n] : n))
    /* and words at reading size or bigger are not spaced like small capitals */
    .replace(/\{[^{}]*\}/g, (obj) => (/\bfontSize: (?:1[89]|[2-9]\d|T[123]|FS\.(?:body|lead|title|name))(?=[,\s})])/.test(obj) ? obj.replace(/\bletterSpacing: 1(?=[,\s})])/g, "letterSpacing: .4") : obj));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let changed = 0;
  for (const f of FILES) {
    const p = path.join(root, "src", f), was = fs.readFileSync(p, "utf8"), now = restyle(was);
    if (now !== was) { fs.writeFileSync(p, now); changed += 1; }
    console.log((now !== was ? "restyled  " : "unchanged ") + f);
  }
  console.log(changed + " of " + FILES.length + " files changed");
}
