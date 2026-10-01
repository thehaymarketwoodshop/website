// Procedural wood-grain textures (original assets). Usage: node scripts/gen/wood.mjs
import zlib from 'node:zlib';
import fs from 'node:fs';

function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
function makeNoise(seed) {
  const r = rng(seed), P = new Uint8Array(512), G = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; G[i] = r(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [P[i], P[j]] = [P[j], P[i]]; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const s = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = G[P[(xi & 255) + P[yi & 255]]], b = G[P[((xi + 1) & 255) + P[yi & 255]]];
    const c = G[P[(xi & 255) + P[(yi + 1) & 255]]], d = G[P[((xi + 1) & 255) + P[(yi + 1) & 255]]];
    const u = s(xf), v = s(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function wood({ w, h, seed, light, dark, fleck, ringDensity, warp, fiber, cathedral }) {
  const n = makeNoise(seed), n2 = makeNoise(seed + 7), n3 = makeNoise(seed + 13);
  const L = hex(light), D = hex(dark), F = hex(fleck);
  const raw = Buffer.alloc((w * 3 + 1) * h);
  const cx = w * 0.55;
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      // low-frequency warp, stretched along the board length (x)
      let wv = 0, amp = 1, f = 1;
      for (let o = 0; o < 4; o++) { wv += amp * n(x * 0.00035 * f, y * 0.0016 * f); amp *= 0.45; f *= 2.1; }
      const arch = cathedral * Math.pow((x - cx) / w, 2) * h;
      const g = (y + arch) * ringDensity + wv * warp;
      const band = g - Math.floor(g);
      // sharp latewood line, soft earlywood
      const ss = (a, b, v) => { const k = Math.min(1, Math.max(0, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
      let t = (ss(0.45, 0.88, band) - ss(0.9, 1, band)) * 0.5;
      const fib = n2(x * 0.003, y * 1.4) * fiber + n3(x * 0.015, y * 0.5) * fiber * 0.4;
      t = Math.min(1, Math.max(0, t + fib - fiber * 0.7 + (n(x * 0.0005, y * 0.0009) - 0.5) * 0.3));
      let c = mix(L, D, t);
      c = mix(c, F, Math.max(0, n3(x * 0.0012, y * 0.002) - 0.6) * 0.8);
      const o = y * (w * 3 + 1) + 1 + x * 3;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
    }
  }
  const chunk = (t, d) => { const b = Buffer.alloc(8 + d.length + 4); b.writeUInt32BE(d.length, 0); b.write(t, 4); d.copy(b, 8); b.writeUInt32BE(zlib.crc32(Buffer.concat([Buffer.from(t), d])) >>> 0, 8 + d.length); return b; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

const out = process.argv[2] || 'public/media';
const W = 2400, H = 1500;
const specs = {
  walnut: { light: '#6E4B31', dark: '#2E1C12', fleck: '#4B2F27', ringDensity: 0.011, warp: 3.2, fiber: 0.35, cathedral: 3.2, seed: 11 },
  oak: { light: '#D2B68C', dark: '#9C7A52', fleck: '#B89468', ringDensity: 0.009, warp: 2.6, fiber: 0.45, cathedral: 4, seed: 23 },
  maple: { light: '#EAD9BA', dark: '#CDB089', fleck: '#DCC39C', ringDensity: 0.007, warp: 2, fiber: 0.25, cathedral: 2, seed: 37 },
  'walnut-dark': { light: '#4A3122', dark: '#1F140D', fleck: '#3A241C', ringDensity: 0.014, warp: 3.6, fiber: 0.3, cathedral: 2.4, seed: 51 },
};
for (const [name, s] of Object.entries(specs)) {
  fs.writeFileSync(`${out}/${name}.png`, wood({ w: W, h: H, ...s }));
  console.log('wrote', name);
}
