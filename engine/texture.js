#!/usr/bin/env node
// Generate a subtle paper-grain background for a given page color.
//
//   node engine/texture.js <hex> <out.jpg> [--strength 1] [--mottle 1] [--vignette 0] [--light cx,cy,radius,#hex]
//
// strength 1 ≈ luminance σ 1.9 on a light page: visible up close, calm from a distance. Use 0.5–1.5.
// --light adds a soft light falloff around a point (cx, cy as fractions of the page, radius as a fraction
// of the page width) — for dark pages where the subject is the light source, e.g. --light 0.72,0.5,0.6,#2A241F.
// Only use it when something on the page motivates the light; a glow for its own sake is decoration.
// --mottle scales the low-frequency blotches (0 = off). On dark grounds they read as dust; keep 0 there.
// --vignette darkens the corners (0–1), like the edges of a dark room.
// Wire it up in theme.js: backgroundImages: { paper: 'assets/grain-paper.jpg' }.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const [hex, out, ...rest] = process.argv.slice(2);
if (!/^#?[0-9a-fA-F]{6}$/.test(hex || '') || !out) {
  console.error('usage: node engine/texture.js <hex> <out.jpg> [--strength 1] [--light cx,cy,radius,#hex]');
  process.exit(2);
}
const si = rest.indexOf('--strength');
const strength = si >= 0 ? Number(rest[si + 1]) : 1;
const num = (flag, dflt) => { const i = rest.indexOf(flag); return i >= 0 ? Number(rest[i + 1]) : dflt; };
const mottleK = num('--mottle', 1);
const vignette = num('--vignette', 0);
const li = rest.indexOf('--light');
const light = li >= 0 ? (rest[li + 1] || '').split(',') : null;
if (light && (light.length !== 4 || light.slice(0, 3).some((v) => Number.isNaN(Number(v))) || !/^#?[0-9a-fA-F]{6}$/.test(light[3]))) {
  console.error('--light expects cx,cy,radius,#hex  e.g. --light 0.72,0.5,0.6,#2E2620');
  process.exit(2);
}
if (light && !light[3].startsWith('#')) light[3] = `#${light[3]}`;
// Contrast window for the noise layers: narrower window = stronger grain.
const win = (base) => { const half = Math.min(49, base / strength); return [`${50 - half}%`, `${50 + half}%`]; };

const W = 2667, H = 1500; // 16:9 at 200 dpi
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-texture-'));
const fine = path.join(tmp, 'fine.png'), mottle = path.join(tmp, 'mottle.png');
const run = (args) => execFileSync('magick', args, { stdio: 'inherit' });

run(['-size', `${W}x${H}`, 'xc:gray50', '-seed', '3', '-attenuate', '1', '+noise', 'Gaussian', '-colorspace', 'gray', '-blur', '0x0.6', fine]);
run(['-size', `${Math.round(W / 20)}x${Math.round(H / 20)}`, 'xc:gray50', '-seed', '9', '-attenuate', '1', '+noise', 'Gaussian', '-colorspace', 'gray', '-blur', '0x2', '-resize', `${W}x${H}!`, mottle]);
const [f0, f1] = win(25);
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const base = `#${hex.replace('#', '')}`;
const ground = path.join(tmp, 'ground.png');
run(['-size', `${W}x${H}`, `xc:${base}`, ground]);
if (light) {
  const [cx, cy, rr, color] = light;
  const r = Math.round(Number(rr) * W);
  const glow = path.join(tmp, 'glow.png');
  run(['-size', `${2 * r}x${2 * r}`, `radial-gradient:${color}-${base}`, glow]);
  run([ground, glow, '-geometry', `+${Math.round(Number(cx) * W - r)}+${Math.round(Number(cy) * H - r)}`, '-compose', 'lighten', '-composite', ground]);
}
if (vignette > 0) {
  // radial mask: white centre → darker corners, multiplied onto the ground
  const v = Math.round(255 * (1 - Math.min(1, vignette)));
  const mask = path.join(tmp, 'vignette.png');
  run(['-size', `${W}x${H}`, `radial-gradient:white-rgb(${v},${v},${v})`, '-resize', `${W}x${H}!`, mask]);
  run([ground, mask, '-compose', 'multiply', '-composite', ground]);
}
const layers = [ground, '(', fine, '-level', `${f0},${f1}`, ')', '-compose', 'overlay', '-composite'];
if (mottleK > 0) {
  const [n0, n1] = win(20 / mottleK);
  layers.push('(', mottle, '-level', `${n0},${n1}`, ')', '-compose', 'overlay', '-composite');
}
run([...layers, '-quality', '92', out]);
fs.rmSync(tmp, { recursive: true, force: true });
const sd = execFileSync('magick', [out, '-colorspace', 'gray', '-format', '%[fx:standard_deviation*255]', 'info:'], { encoding: 'utf8' });
console.log(`✓ ${out}  (luminance σ ≈ ${Number(sd).toFixed(2)})`);
