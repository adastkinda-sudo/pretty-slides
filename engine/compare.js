#!/usr/bin/env node
// Side-by-side comparison sheet: one column per deck (or renders folder), one row per slide ID.
//
//   node engine/compare.js <out.png> <dirA> <dirB> [dirC ...] [--only S01,S05] [--labels A,B,C]
//
// Each dir is a deck folder (its renders/ is used) or a renders folder itself, e.g.
//   node engine/compare.js cmp.png 03-reference/directions/A 03-reference/directions/B 03-reference/directions/C
//   node engine/compare.js before-after.png 04-deck/renders/_prev 04-deck/renders --only S03 --labels 修改前,修改后

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const opt = (f) => { const i = argv.indexOf(f); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const only = opt('--only')?.split(',').map((s) => s.trim()).filter(Boolean);
const labelsArg = opt('--labels')?.split(',');
const [out, ...dirs] = argv;
if (!out || dirs.length < 2) {
  console.error('usage: node engine/compare.js <out.png> <dirA> <dirB> [dirC ...] [--only S01,S05] [--labels A,B,C]');
  process.exit(2);
}

const renderDir = (d) => (fs.existsSync(path.join(d, 'renders')) ? path.join(d, 'renders') : d);
const cols = dirs.map((d, i) => ({ dir: renderDir(path.resolve(d)), label: labelsArg?.[i] || path.basename(path.resolve(d)) }));
const idsIn = (d) => fs.existsSync(d) ? fs.readdirSync(d).filter((f) => /^S\w*\.png$/.test(f)).map((f) => f.replace('.png', '')) : [];
let ids = [...new Set(cols.flatMap((c) => idsIn(c.dir)))].sort();
if (only) ids = ids.filter((id) => only.includes(id));
if (!ids.length) { console.error('no slide renders found (run make.js first)'); process.exit(1); }

const BG = '#CFCDC7', W = 960, H = 540, GAP = 32;
// Labels may be Chinese: prefer a CJK-capable system font.
const font = ['/System/Library/Fonts/STHeiti Medium.ttc', '/System/Library/Fonts/Hiragino Sans GB.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/System/Library/Fonts/Helvetica.ttc']
  .find((f) => fs.existsSync(f));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-compare-'));
const run = (args) => execFileSync('magick', args, { stdio: 'inherit' });

const rows = ids.map((id, r) => {
  const cells = cols.map((c) => {
    const f = path.join(c.dir, `${id}.png`);
    return fs.existsSync(f) ? ['(', f, '-resize', `${W}x${H}!`, ')'] : ['(', '-size', `${W}x${H}`, `xc:${BG}`, ')'];
  });
  const row = path.join(tmp, `row${r}.png`);
  const a = ['-background', BG];
  cells.forEach((cell, i) => { if (i) a.push('(', '-size', `${GAP}x${H}`, `xc:${BG}`, ')'); a.push(...cell); });
  a.push('+append', '+repage', '-gravity', 'north', '-splice', '0x36');
  if (font) a.push('-font', font, '-pointsize', '20', '-fill', '#3A3936', '-gravity', 'northwest', '-annotate', '+4+8', id);
  a.push(row);
  run(a);
  return row;
});

const header = ['-background', BG, ...rows, '-append', '+repage', '-gravity', 'north', '-splice', '0x56'];
if (font) {
  header.push('-font', font, '-pointsize', '26', '-fill', '#1B1B1A', '-gravity', 'northwest');
  cols.forEach((c, i) => header.push('-annotate', `+${4 + i * (W + GAP)}+14`, c.label));
}
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
run([...header, '-depth', '8', out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✓ ${out}  (${cols.length} columns × ${ids.length} rows)`);
