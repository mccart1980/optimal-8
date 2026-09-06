/* Generates the app icons from code — no binary assets in the repo.
   A brass "8" (two rings) on the app's ink background.
   Run with: npm run icons                                            */
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

const INK = [0x10, 0x14, 0x16];
const BRASS = [0xd2, 0xa0, 0x47];

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
const crc32 = (buf) => { let c = -1; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function png(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

// coverage of a stroked circle at (cx,cy) radius r, thickness t — antialiased
const ring = (x, y, cx, cy, r, t) => {
  const d = Math.abs(Math.hypot(x - cx, y - cy) - r) - t / 2;
  return Math.max(0, Math.min(1, 0.5 - d));
};
const roundedRect = (x, y, w, h, rad) => {
  const dx = Math.max(rad - x, 0, x - (w - rad)), dy = Math.max(rad - y, 0, y - (h - rad));
  const d = Math.hypot(dx, dy) - rad;
  return Math.max(0, Math.min(1, 0.5 - d));
};

function icon(size, { scale = 1, corner = 0, bleed = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const c = size / 2;
  const rad = corner ? size * corner : 0;
  const s = scale;
  const upper = { cy: c - size * 0.155 * s, r: size * 0.13 * s };
  const lower = { cy: c + size * 0.13 * s, r: size * 0.155 * s };
  const th = size * 0.072 * s;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5, py = y + 0.5;
      const bg = corner ? roundedRect(px, py, size, size, rad) : 1;
      let r = INK[0], g = INK[1], b = INK[2];
      const a1 = ring(px, py, c, upper.cy, upper.r, th);
      const a2 = ring(px, py, c, lower.cy, lower.r, th);
      const glyph = Math.max(a1, a2);
      if (glyph > 0) {
        r = Math.round(r + (BRASS[0] - r) * glyph);
        g = Math.round(g + (BRASS[1] - g) * glyph);
        b = Math.round(b + (BRASS[2] - b) * glyph);
      }
      const i = (y * size + x) * 4;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
      buf[i + 3] = Math.round(255 * (bleed ? 1 : bg));
    }
  }
  return png(size, size, buf);
}

const out = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(out, { recursive: true });
const files = [
  ["icon-192.png", icon(192, { bleed: true })],
  ["icon-512.png", icon(512, { bleed: true })],
  ["icon-maskable-512.png", icon(512, { scale: 0.7, bleed: true })],
  ["apple-touch-icon.png", icon(180, { bleed: true })],
  ["favicon-32.png", icon(32, { bleed: true })],
];
for (const [name, data] of files) {
  fs.writeFileSync(path.join(out, name), data);
  console.log("wrote public/icons/" + name + " (" + data.length + " bytes)");
}
