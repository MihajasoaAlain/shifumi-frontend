// Generates the PWA icon PNGs (pure Node, no deps) into public/icons.
// Re-run with `node scripts/gen-icons.mjs` if the brand colors change.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "icons");

// Brand palette (mirrors app/globals.css).
const BG = [0xda, 0xa0, 0x6d]; // --primary
const CARD = [0xea, 0xdd, 0xca]; // --background
const INK = [0x1c, 0x1c, 0x1c]; // --secondary

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "latin1");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // 10,11,12 = compression/filter/interlace = 0
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function draw(size, { padScale = 0 } = {}) {
  const px = Buffer.alloc(size * size * 4);
  const inset = Math.round(size * padScale); // safe-zone padding for maskable
  const set = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    // simple source-over alpha blend
    const ia = a / 255;
    px[i] = Math.round(px[i] * (1 - ia) + r * ia);
    px[i + 1] = Math.round(px[i + 1] * (1 - ia) + g * ia);
    px[i + 2] = Math.round(px[i + 2] * (1 - ia) + b * ia);
    px[i + 3] = Math.max(px[i + 3], a);
  };

  // Background fills the whole canvas (maskable-friendly).
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) set(x, y, BG);

  const area = size - inset * 2;
  const ox = inset;
  const oy = inset;

  // Rounded "card" rectangle, matching the app's card look.
  const margin = Math.round(area * 0.14);
  const left = ox + margin;
  const top = oy + margin;
  const right = ox + area - margin;
  const bottom = oy + area - margin;
  const radius = Math.round(area * 0.16);
  const inRounded = (x, y) => {
    if (x < left || x > right || y < top || y > bottom) return false;
    const cx = x < left + radius ? left + radius : x > right - radius ? right - radius : x;
    const cy = y < top + radius ? top + radius : y > bottom - radius ? bottom - radius : y;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  };
  for (let y = top; y <= bottom; y++)
    for (let x = left; x <= right; x++) if (inRounded(x, y)) set(x, y, CARD);

  // Three discs in a row = rock / paper / scissors motif.
  const cy = oy + Math.round(area * 0.5);
  const r = Math.round(area * 0.085);
  const gap = Math.round(area * 0.105);
  const centers = [ox + area / 2 - gap, ox + area / 2, ox + area / 2 + gap];
  const disc = (cx, color) => {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++)
        if (x * x + y * y <= r * r) set(Math.round(cx) + x, cy + y, color);
  };
  disc(centers[0], INK);
  disc(centers[1], BG);
  disc(centers[2], INK);

  return px;
}

mkdirSync(OUT, { recursive: true });
const targets = [
  { name: "icon-192.png", size: 192, padScale: 0 },
  { name: "icon-512.png", size: 512, padScale: 0 },
  { name: "maskable-512.png", size: 512, padScale: 0.1 },
  { name: "apple-touch-icon-180.png", size: 180, padScale: 0.06 },
];
for (const t of targets) {
  const png = encodePng(t.size, draw(t.size, { padScale: t.padScale }));
  writeFileSync(join(OUT, t.name), png);
  console.log("wrote", t.name, png.length, "bytes");
}
