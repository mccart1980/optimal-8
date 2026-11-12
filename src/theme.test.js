import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { C, soft } from "./ui.jsx";

/* ================================================================
   FIGHTER'S LOOK — white, blue and pastel, the name and the bull.
   Every colour that is text reads at 4.5:1 or better on the page, the
   bars and the cards; every pastel fill reads with navy on it.
   ================================================================ */
const root = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const lum = (h) => {
  const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const TEXT = ["chalk", "ash", "moss", "oxide", "brass", "cobalt", "violet"];
const ACCENTS = ["moss", "oxide", "brass", "cobalt", "violet", "ash", "chalk"];

/* a PNG's size and one pixel, read back from the file */
function pixel(file, x, y) {
  const b = fs.readFileSync(path.join(root, file));
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const parts = []; let i = 8;
  while (i < b.length) { const n = b.readUInt32BE(i), t = b.toString("ascii", i + 4, i + 8); if (t === "IDAT") parts.push(b.subarray(i + 8, i + 8 + n)); i += 12 + n; }
  const raw = zlib.inflateSync(Buffer.concat(parts)), row = w * 4 + 1, o = y * row + 1 + x * 4;
  return { w, h, rgb: [raw[o], raw[o + 1], raw[o + 2]] };
}

describe("white, blue and pastel", () => {
  it("the page is the palest blue, the cards white, the text navy", () => {
    expect([C.ink, C.card, C.chalk]).toEqual(["#F3F7FC", "#FFFFFF", "#13243D"]);
    expect(lum(C.ink)).toBeGreaterThan(0.9);
    expect(lum(C.slab)).toBeGreaterThan(0.8);
  });
  it("every text colour clears 4.5:1 on the page, the bars and the cards", () => {
    TEXT.forEach((t) => ["ink", "slab", "card"].forEach((b) => expect([t, b, ratio(C[t], C[b]) >= 4.5]).toEqual([t, b, true])));
  });
  it("every colour has a pastel for fills, and navy on it clears 4.5:1", () => {
    ACCENTS.forEach((a) => {
      expect(soft(C[a])).not.toBe(C[a]);
      expect(lum(soft(C[a]))).toBeGreaterThan(0.6);
      expect([a, ratio(C.chalk, soft(C[a])) >= 4.5]).toEqual([a, true]);
    });
    expect(soft("#123456")).toBe("#123456");
  });
  it("no colour sits behind text at full strength: text on a fill is navy, never the page colour", () => {
    ["src/ui.jsx", "src/App.jsx", "src/now.jsx", "src/im-ui.jsx", "src/fuel-ui.jsx", "src/camp-ui.jsx", "src/metrics-ui.jsx", "src/life-ui.jsx", "src/today.jsx", "src/weight-ui.jsx", "src/season-ui.jsx", "src/range-ui.jsx"]
      .forEach((f) => expect([f, /color: [^,}]*C\.ink/.test(read(f))]).toEqual([f, false]));
    expect(read("src/App.jsx")).not.toMatch(/rgba\(16,20,22/);
  });
  it("the page and the manifest: light, the palest blue, a dark status bar text", () => {
    const html = read("index.html"), vite = read("vite.config.js");
    expect(html).toMatch(/<meta name="theme-color" content="#F3F7FC" \/>/);
    expect(html).toMatch(/<meta name="color-scheme" content="light" \/>/);
    expect(html).toMatch(/<meta name="apple-mobile-web-app-status-bar-style" content="default" \/>/);
    expect(html).toMatch(/html, body \{ margin: 0; padding: 0; background: #F3F7FC; \}/);
    expect(vite).toMatch(/theme_color: "#F3F7FC",\s*background_color: "#F3F7FC",/);
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

describe("the icon: the low-poly bull", () => {
  it("five icons at their sizes: a white ground, the white muzzle and the deep blue nostrils", () => {
    [["public/icons/apple-touch-icon.png", 180], ["public/icons/icon-192.png", 192], ["public/icons/icon-512.png", 512], ["public/icons/icon-maskable-512.png", 512], ["public/icons/favicon-32.png", 32]]
      .forEach(([f, n]) => { const p = pixel(f, 0, 0); expect([f, p.w, p.h]).toEqual([f, n, n]); p.rgb.forEach((c) => expect(c).toBeGreaterThan(245)); });
    pixel("public/icons/apple-touch-icon.png", 90, 100).rgb.forEach((c) => expect(c).toBeGreaterThan(240));
    [[80, 112], [100, 112]].forEach(([x, y]) => { const [r, g, b] = pixel("public/icons/apple-touch-icon.png", x, y).rgb; expect(r).toBeLessThan(40); expect(b - r).toBeGreaterThan(80); });
  });
  it("drawn by the script, from paths, with no image files read", () => {
    const s = read("scripts/generate-icons.mjs");
    expect(s).toMatch(/low-poly bull/);
    expect(s).not.toMatch(/readFileSync/);
  });
});
