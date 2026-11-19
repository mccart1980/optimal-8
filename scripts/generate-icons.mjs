// Draws Fighter's icon and writes it at every size a phone asks for.
// No image files are read: the bull is a handful of flat shapes listed
// here on a 1024 grid, filled onto a blue ground.
//
//   node scripts/generate-icons.mjs        (or: npm run icons)
//
// The mark: a bull's head, facing you, horns up. White where the light
// falls, pale blue in the planes that turn away, and the ground showing
// through at the eyes and nostrils.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

/* each shape: its tone, then its corners as x, y pairs. Later shapes sit on top.
   a, a2: the lit face, left and right · b, b2: the planes in shade · k: cut through to the ground */
export const MARK = [
  ["a", [415, 348, 372, 400, 307, 406, 237, 368, 190, 301, 179, 222, 206, 161, 235, 238, 276, 289, 332, 314, 393, 318]],
  ["a2", [631, 318, 692, 314, 748, 289, 789, 238, 818, 161, 845, 222, 834, 301, 787, 368, 717, 406, 652, 400, 609, 348]],
  ["b", [348, 424, 267, 417, 215, 449, 276, 492, 345, 487]],
  ["b2", [679, 487, 748, 492, 809, 449, 757, 417, 676, 424]],
  ["a", [512, 318, 415, 348, 348, 420, 345, 512, 379, 607, 397, 670, 372, 737, 386, 813, 440, 852, 512, 863]],
  ["a2", [512, 863, 584, 852, 638, 813, 652, 737, 627, 670, 645, 607, 679, 512, 676, 420, 609, 348, 512, 318]],
  ["b", [345, 512, 379, 607, 397, 670, 372, 737, 386, 813, 426, 755, 440, 669, 409, 582]],
  ["b2", [615, 582, 584, 669, 598, 755, 638, 813, 652, 737, 627, 670, 645, 607, 679, 512]],
  ["k", [386, 489, 478, 530, 474, 568, 399, 541]],
  ["k", [625, 541, 550, 568, 546, 530, 638, 489]],
  ["k", [433, 753, 487, 768, 481, 805, 442, 796]],
  ["k", [582, 796, 543, 805, 537, 768, 591, 753]],
];
export const GROUND = [[59, 123, 255], [20, 56, 166]];          // the blue, top to bottom
const TONE = { a: [255, 255, 255], a2: [238, 243, 255], b: [201, 218, 255], b2: [220, 231, 255] };

/* is the point inside the shape? (crossings of a line running right from it) */
function inside(pts, x, y) {
  let hit = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const SHAPES = MARK.map(([tone, pts]) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  return { tone, pts, x0, x1, y0, y1 };
});

/* the colour at a point of the 1024 grid; `scale` shrinks the bull about the middle */
function colourAt(gx, gy, scale) {
  const t = Math.min(1, Math.max(0, gy / 1024));
  const ground = GROUND[0].map((c, i) => c + (GROUND[1][i] - c) * t);
  const x = 512 + (gx - 512) / scale, y = 512 + (gy - 512) / scale;
  let out = ground;
  for (const s of SHAPES) {
    if (x < s.x0 || x > s.x1 || y < s.y0 || y > s.y1 || !inside(s.pts, x, y)) continue;
    out = s.tone === "k" ? ground : TONE[s.tone];
  }
  return out;
}

/* one icon, `size` pixels square: every pixel is the mean of a 4 × 4 grid of points inside it */
export function draw(size, scale) {
  const N = 4, px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0;
    for (let sy = 0; sy < N; sy++) for (let sx = 0; sx < N; sx++) {
      const c = colourAt(((x + (sx + 0.5) / N) / size) * 1024, ((y + (sy + 0.5) / N) / size) * 1024, scale || 1);
      r += c[0]; g += c[1]; b += c[2];
    }
    const o = (y * size + x) * 4;
    px[o] = Math.round(r / (N * N)); px[o + 1] = Math.round(g / (N * N)); px[o + 2] = Math.round(b / (N * N)); px[o + 3] = 255;
  }
  return px;
}

/* a PNG file from raw pixels */
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc(buf) { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const head = Buffer.alloc(8); head.writeUInt32BE(data.length, 0); head.write(type, 4, "ascii");
  const tail = Buffer.alloc(4); tail.writeUInt32BE(crc(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}
export function png(size, px) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  const row = size * 4 + 1, raw = Buffer.alloc(row * size);
  for (let y = 0; y < size; y++) px.copy(raw, y * row + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

/* The sizes. The phone rounds the corners itself, so every icon is a full
   square. The maskable one keeps the bull inside the middle four-fifths,
   which is all some Android launchers show. */
const ICONS = [["apple-touch-icon.png", 180, 1], ["favicon-32.png", 32, 1.12], ["icon-192.png", 192, 1], ["icon-512.png", 512, 1], ["icon-maskable-512.png", 512, 0.8]];
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  mkdirSync(OUT, { recursive: true });
  for (const [name, size, scale] of ICONS) {
    const file = png(size, draw(size, scale));
    writeFileSync(path.join(OUT, name), file);
    console.log("wrote public/icons/" + name + " (" + file.length + " bytes)");
  }
}
