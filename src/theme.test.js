import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { C, soft, tone, THEMES, THEME_STEPS, themeNow, FONTS, RAD, FS, SP } from "./ui.jsx";
import { draw, GROUND, MARK } from "../scripts/generate-icons.mjs";

/* ================================================================
   FIGHTER'S LOOK — one design system.
   Dark is the main look, light is a setting. Three colours carry
   meaning: the accent (go, yours, done), amber (wait) and red (hard or
   stop). In both themes every colour that is text reads at 4.5:1 or
   better on whatever it sits on. Every size, corner and colour on a
   screen comes from the system: the tests read the screens' own code
   to hold them to it.
   ================================================================ */
const root = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const lum = (h) => {
  const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const kebab = (s) => s.replace(/[A-Z0-9]/g, (m) => "-" + m.toLowerCase());
const NAMES = ["dark", "light"];
const TEXT = ["chalk", "ash", "accent", "warn", "bad"];
const COLOURS = ["accent", "warn", "bad"];
const each = (fn) => NAMES.forEach((n) => fn(THEMES[n], n));
/* every screen's own code: the files that draw something */
const SCREENS = fs.readdirSync(path.join(root, "src")).filter((f) => /\.jsx$/.test(f) && !/\.test\.jsx$/.test(f)).map((f) => "src/" + f);

/* a PNG's size and its pixels, read back from the file */
function pixels(file) {
  const b = fs.readFileSync(path.join(root, file));
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const parts = []; let i = 8;
  while (i < b.length) { const n = b.readUInt32BE(i), t = b.toString("ascii", i + 4, i + 8); if (t === "IDAT") parts.push(b.subarray(i + 8, i + 8 + n)); i += 12 + n; }
  const raw = zlib.inflateSync(Buffer.concat(parts)), row = w * 4 + 1;
  return { w, h, at: (x, y) => { const o = y * row + 1 + x * 4; return [raw[o], raw[o + 1], raw[o + 2]]; } };
}

describe("two themes: dark is the main look, light is a setting", () => {
  it("dark is a black page with cards one step up; light a pale page with white cards", () => {
    expect(Object.keys(THEMES)).toEqual(NAMES);
    expect(THEMES.dark.ink).toBe("#000000");
    expect(lum(THEMES.dark.card)).toBeGreaterThan(lum(THEMES.dark.ink));
    expect(lum(THEMES.dark.card2)).toBeGreaterThan(lum(THEMES.dark.card));
    expect(lum(THEMES.light.ink)).toBeGreaterThan(0.85);
    expect(THEMES.light.card).toBe("#FFFFFF");
    /* the same names in both, so nothing is missing from one of them */
    expect(Object.keys(THEMES.light)).toEqual(Object.keys(THEMES.dark));
  });
  it("the setting: DARK unless LIGHT is picked, and AUTO follows the phone", () => {
    expect(THEME_STEPS.map((x) => x[0])).toEqual(["dark", "light", "auto"]);
    expect([themeNow("light"), themeNow("dark")]).toEqual(["light", "dark"]);
    /* nothing chosen yet is dark, whatever the phone is set to */
    expect([themeNow(undefined), themeNow(null), themeNow("")]).toEqual(["dark", "dark", "dark"]);
    expect(NAMES).toContain(themeNow("auto"));
  });
  it("three colours carry meaning, and the older names are other names for them", () => {
    expect([C.accent, C.warn, C.bad]).toEqual(["var(--o8-accent)", "var(--o8-warn)", "var(--o8-bad)"]);
    ["brass", "moss", "cobalt", "violet"].forEach((k) => expect([k, C[k]]).toEqual([k, C.accent]));
    expect(C.oxide).toBe(C.bad);
    /* a colour handed to a shared piece: red and amber keep their meaning, anything else is the accent */
    expect([tone(C.oxide), tone(C.warn), tone(C.cobalt), tone("#123456"), tone(C.ash)]).toEqual([C.bad, C.warn, C.accent, C.accent, C.ash]);
  });
  it("every text colour clears 4.5:1 on the page, the bars and both steps of card", () => {
    each((T, n) => TEXT.forEach((t) => ["ink", "bar", "card", "card2"].forEach((b) => expect([n, t, b, ratio(T[t], T[b]) >= 4.5]).toEqual([n, t, b, true]))));
  });
  it("every colour has a tint for fills: the text reads on it, and so does the colour itself", () => {
    each((T, n) => {
      COLOURS.concat(["ash", "chalk"]).forEach((a) => expect([n, a, ratio(T.chalk, T["soft" + cap(a)]) >= 4.5]).toEqual([n, a, true]));
      COLOURS.concat(["ash"]).forEach((a) => expect([n, a, ratio(T[a], T["soft" + cap(a)]) >= 4.5]).toEqual([n, a, true]));
    });
  });
  it("text on a solid colour, and the picked option of a switch, clear 4.5:1", () => {
    each((T, n) => {
      COLOURS.forEach((a) => expect([n, a, ratio(T.on, T[a]) >= 4.5]).toEqual([n, a, true]));
      expect([n, ratio(T.chalk, T.thumb) >= 4.5]).toEqual([n, true]);
    });
  });
  it("the empty tick ring shows on a card and on the page at 3:1", () => {
    each((T, n) => ["card", "ink"].forEach((b) => expect([n, b, ratio(T.ring, T[b]) >= 3]).toEqual([n, b, true])));
  });
  it("the colours the screens use are names, and the page's style sheet gives them their values in both themes", () => {
    expect([C.ink, C.card, C.chalk, C.on]).toEqual(["var(--o8-ink)", "var(--o8-card)", "var(--o8-chalk)", "var(--o8-on)"]);
    COLOURS.concat(["ash", "chalk"]).forEach((a) => expect(soft(C[a])).toBe("var(--o8-soft-" + a + ")"));
    expect(soft(C.brass)).toBe("var(--o8-soft-accent)");
    expect(soft("#123456")).toBe("#123456");
    const vars = (n) => Object.keys(THEMES[n]).map((k) => "--o8-" + kebab(k) + ": " + THEMES[n][k] + ";");
    vars("dark").forEach((v) => expect(FONTS).toContain(v));
    vars("light").forEach((v) => expect([v, FONTS.split(v).length]).toEqual([v, 3]));        // once for LIGHT held, once for AUTO on a light phone
    expect(FONTS).toMatch(/:root \{ color-scheme: dark;/);
    expect(FONTS).toMatch(/:root\[data-theme="light"\] \{ color-scheme: light;/);
    expect(FONTS).toMatch(/@media \(prefers-color-scheme: light\) \{ :root\[data-theme="auto"\] \{/);
  });
  it("text on a fill is never the page colour, and nothing is downloaded to draw the type", () => {
    SCREENS.forEach((f) => expect([f, /color: [^,}]*C\.ink/.test(read(f))]).toEqual([f, false]));
    ["src/ui.jsx", "index.html", "vite.config.js"].forEach((f) => expect([f, /googleapis|gstatic|@font-face/.test(read(f))]).toEqual([f, false]));
    expect(FONTS).toMatch(/-apple-system/);
    expect(read("src/ui.jsx")).toMatch(/ui-rounded/);
  });
  it("the page and the manifest: black before the first paint, light only when the setting asks", () => {
    const html = read("index.html"), vite = read("vite.config.js");
    expect(html).toMatch(/<meta name="theme-color" content="#000000" \/>/);
    expect(html).toMatch(/<meta name="color-scheme" content="dark light" \/>/);
    expect(html).toMatch(/html, body \{ margin: 0; padding: 0; background: #000000; \}/);
    expect(html).toMatch(/html\[data-theme="light"\], html\[data-theme="light"\] body \{ background: #F3F4F6; \}/);
    expect(html).toMatch(/@media \(prefers-color-scheme: light\) \{\s*html\[data-theme="auto"\], html\[data-theme="auto"\] body \{ background: #F3F4F6; \}/);
    expect(html).toMatch(/localStorage\.getItem\("o8s-settings"\)/);
    expect(html).toMatch(/root\.setAttribute\("data-theme", t === "light" \|\| t === "auto" \? t : "dark"\)/);
    expect(html).toMatch(/class="o8-splash"/);
    /* the icon's address carries a version, so a phone can't keep showing a copy of the old one */
    expect(html).toMatch(/<link rel="apple-touch-icon" href="\/optimal-8\/icons\/apple-touch-icon\.png\?v=\d+" \/>/);
    expect([THEMES.dark.ink, THEMES.light.ink]).toEqual(["#000000", "#F3F4F6"]);
    expect(vite).toMatch(/theme_color: "#000000",\s*background_color: "#000000",/);
  });
});

describe("one system: every size, corner and colour on a screen comes from it", () => {
  const SIZES = [FS.micro, FS.cap, FS.meta, FS.body, FS.lead, FS.title, FS.name];
  it("the type scale is seven sizes, and a card's three are three of them", () => {
    expect(SIZES).toEqual([12, 13, 15, 18, 22, 28, 32]);
    const now = read("src/now.jsx");
    expect(now).toMatch(/export const T1 = FS\.name, T2 = FS\.lead, T3 = FS\.body;/);
  });
  it("no screen sets a text size of its own: each is on the scale, or a big number (40 and up)", () => {
    SCREENS.forEach((f) => { const off = (read(f).match(/\bfontSize: \d+(?:\.\d+)?(?=[,\s})])/g) || []).map((m) => Number(m.slice(10))).filter((n) => SIZES.indexOf(n) < 0 && n < 40);
      expect([f, off]).toEqual([f, []]); });
  });
  it("one set of corners, and no screen rounds one its own way", () => {
    expect([RAD.s, RAD.m, RAD.l]).toEqual([10, 14, 20]);
    SCREENS.forEach((f) => { const off = (read(f).match(/\bborderRadius: \d+(?=[,\s})])/g) || []).map((m) => Number(m.slice(14))).filter((n) => [0, 1, 2, 3, 10, 14, 20, 999].indexOf(n) < 0);
      expect([f, off]).toEqual([f, []]); });
  });
  it("space is on a 4-point grid", () => {
    Object.keys(SP).forEach((k) => expect([k, SP[k] % 4]).toEqual([k, 0]));
  });
  it("no screen sets a colour of its own: every one is a name from the system", () => {
    SCREENS.filter((f) => f !== "src/ui.jsx").forEach((f) => { const src = read(f);
      expect([f, (src.match(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g) || [])]).toEqual([f, []]);
      expect([f, (src.match(/rgba?\(/g) || [])]).toEqual([f, []]); });
  });
  it("a card has no colour of its own, and a small label over a block is always quiet", () => {
    const ui = read("src/ui.jsx");
    expect(ui).toMatch(/export const Card = \(\{ children, s, mark \}\)/);
    expect(ui).toMatch(/export const Eye = \(\{ children, s \}\)/);
  });
  it("motion: one curve, and it stops for anyone who asks the phone for less", () => {
    expect(FONTS).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(FONTS).toMatch(/cubic-bezier\(\.2,\.8,\.2,1\)/);
    expect(FONTS).toMatch(/\.o8-root button:not\(:disabled\):active \{ transform: scale\(\.97\)/);
  });
  it("every button on the bar under the thumb, and every tab, is at least 48 high", () => {
    const home = read("src/home.jsx"), app = read("src/App.jsx");
    expect(home).toMatch(/aria-label="Back to the item before"\s*\n?\s*style=\{\{ width: 60, minHeight: 64,/);
    expect(home).toMatch(/className="o8-next" style=\{Object\.assign\(\{\}, dsp, \{ minWidth: 0, minHeight: 64,/);
    expect(app).toMatch(/const TAB_H = 66;/);
  });
});

describe("the name: Fighter", () => {
  it("on the home screen, the tab, the manifest and the backup", () => {
    const html = read("index.html"), vite = read("vite.config.js"), app = read("src/App.jsx");
    expect(html).toMatch(/<title>Fighter<\/title>/);
    expect(html).toMatch(/<meta name="apple-mobile-web-app-title" content="Fighter" \/>/);
    expect(vite).toMatch(/name: "Fighter",\s*short_name: "Fighter",/);
    expect(app).toMatch(/"fighter-backup-"/);
    expect(app).toMatch(/title: "Fighter backup"/);
    expect(app).toMatch(/That file isn't a Fighter backup\./);
    /* the address stays the same, so the app stays where it is */
    expect(vite).toMatch(/base: "\/optimal-8\/"/);
  });
  it("the programmes keep their own names", () => {
    expect(read("src/program.js")).toMatch(/fighter: "OPTIMAL 8 FIGHTER"/);
  });
});

describe("the icon: the bull, white on blue", () => {
  const FILES = [["public/icons/apple-touch-icon.png", 180, 1], ["public/icons/favicon-32.png", 32, 1.12], ["public/icons/icon-192.png", 192, 1], ["public/icons/icon-512.png", 512, 1], ["public/icons/icon-maskable-512.png", 512, 0.8]];
  const blue = ([r, g, b]) => b > 150 && b - r > 100;
  const white = ([r, g, b]) => r > 225 && g > 225 && b > 240;
  it("five icons at their sizes, each a full square of blue with nothing see-through", () => {
    FILES.forEach(([f, n]) => { const p = pixels(f); expect([f, p.w, p.h]).toEqual([f, n, n]);
      [[0, 0], [n - 1, 0], [0, n - 1], [n - 1, n - 1]].forEach(([x, y]) => expect([f, x, y, blue(p.at(x, y))]).toEqual([f, x, y, true])); });
    /* lighter blue at the top than at the bottom */
    const p = pixels("public/icons/icon-512.png");
    expect(p.at(4, 4)[1]).toBeGreaterThan(p.at(4, 507)[1] + 40);
    expect(GROUND).toEqual([[59, 123, 255], [20, 56, 166]]);
  });
  it("the bull: a white forehead, the blue showing through at the eyes, horns either side", () => {
    const p = pixels("public/icons/icon-512.png"), at = (gx, gy) => p.at(Math.round(gx / 2), Math.round(gy / 2));
    expect(white(at(470, 420))).toBe(true);                       // the forehead
    expect(blue(at(434, 532))).toBe(true);                        // the left eye
    expect(blue(at(590, 532))).toBe(true);                        // the right eye
    expect(white(at(215, 250))).toBe(true);                       // the left horn
    expect(blue(at(512, 200))).toBe(true);                        // between the horns
    /* the same bull, smaller, inside the middle four-fifths of the maskable icon */
    const m = pixels("public/icons/icon-maskable-512.png");
    expect(white(m.at(Math.round((512 + (470 - 512) * 0.8) / 2), Math.round((512 + (420 - 512) * 0.8) / 2)))).toBe(true);
    for (let x = 0; x < 512; x += 8) [0, 50, 461, 511].forEach((y) => { expect(blue(m.at(x, y))).toBe(true); expect(blue(m.at(y, x))).toBe(true); });
  });
  it("drawn by the script from a list of shapes, with no image file read, and the files are what it draws", () => {
    const s = read("scripts/generate-icons.mjs");
    expect(s).not.toMatch(/readFileSync/);
    expect(MARK.length).toBe(12);
    FILES.filter((x) => x[1] <= 192).forEach(([f, n, scale]) => { const p = pixels(f), px = draw(n, scale); let same = true;
      for (let y = 0; y < n && same; y++) for (let x = 0; x < n; x++) { const o = (y * n + x) * 4, q = p.at(x, y); if (q[0] !== px[o] || q[1] !== px[o + 1] || q[2] !== px[o + 2]) { same = false; break; } }
      expect([f, same]).toEqual([f, true]); });
  });
});
