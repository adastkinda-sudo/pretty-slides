#!/usr/bin/env node
// Generate a subtle paper-grain background for a given page color.
//
//   node engine/texture.js <hex> <out.jpg> [--strength 1]
//
// strength 1 ≈ luminance σ 1.9 on a light page: visible up close, calm from a distance. Use 0.5–1.5.
// Wire it up in theme.js: backgroundImages: { paper: 'assets/grain-paper.jpg' }.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const [hex, out, ...rest] = process.argv.slice(2);
if (!/^#?[0-9a-fA-F]{6}$/.test(hex || '') || !out) {
  console.error('usage: node engine/texture.js <hex> <out.jpg> [--strength 1]');
  process.exit(2);
}
const si = rest.indexOf('--strength');
const strength = si >= 0 ? Number(rest[si + 1]) : 1;
// Contrast window for the noise layers: narrower window = stronger grain.
const win = (base) => { const half = Math.min(49, base / strength); return [`${50 - half}%`, `${50 + half}%`]; };

const W = 2667, H = 1500; // 16:9 at 200 dpi
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-texture-'));
const fine = path.join(tmp, 'fine.png'), mottle = path.join(tmp, 'mottle.png');
const run = (args) => execFileSync('magick', args, { stdio: 'inherit' });

run(['-size', `${W}x${H}`, 'xc:gray50', '-seed', '3', '-attenuate', '1', '+noise', 'Gaussian', '-colorspace', 'gray', '-blur', '0x0.6', fine]);
run(['-size', `${Math.round(W / 20)}x${Math.round(H / 20)}`, 'xc:gray50', '-seed', '9', '-attenuate', '1', '+noise', 'Gaussian', '-colorspace', 'gray', '-blur', '0x2', '-resize', `${W}x${H}!`, mottle]);
const [f0, f1] = win(25), [m0, m1] = win(20);
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
run(['-size', `${W}x${H}`, `xc:#${hex.replace('#', '')}`,
  '(', fine, '-level', `${f0},${f1}`, ')', '-compose', 'overlay', '-composite',
  '(', mottle, '-level', `${m0},${m1}`, ')', '-compose', 'overlay', '-composite',
  '-quality', '90', out]);
fs.rmSync(tmp, { recursive: true, force: true });
const sd = execFileSync('magick', [out, '-colorspace', 'gray', '-format', '%[fx:standard_deviation*255]', 'info:'], { encoding: 'utf8' });
console.log(`✓ ${out}  (luminance σ ≈ ${Number(sd).toFixed(2)})`);
