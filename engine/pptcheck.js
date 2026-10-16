#!/usr/bin/env node
// Check a deck rendered with LibreOffice (make.js --renderer libreoffice) in PowerPoint itself: which fonts
// PowerPoint really used, and how its rendering differs from the LibreOffice preview in renders/. When make.js
// rendered with PowerPoint (its default where PowerPoint is installed) this check is already part of make.js.
//
//   node engine/pptcheck.js <deckDir>                 all slides
//   node engine/pptcheck.js <deckDir> --only S03,S07  only these slides (the export is still the whole deck)
//
// Run make.js first. PowerPoint exports out/<name>.pptx to PDF (scripted, about ten seconds); the PDF is only an
// intermediate and is deleted. Results go to out/ppt/: Sxx.png per slide and _compare.png (LibreOffice preview
// beside PowerPoint) for the slides worth a look. Without PowerPoint the check is skipped.

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { parsePdffonts, foreignFonts } = require('./lib/pptfonts');
const powerpoint = require('./lib/powerpoint');

const a = process.argv.slice(2);
if (!a[0] || a[0].startsWith('-')) {
  console.error('usage: node engine/pptcheck.js <deckDir> [--only S01,S02] [--dpi 110]');
  process.exit(2);
}
const get = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : undefined; };
const dir = path.resolve(a[0]);
const only = get('--only')?.split(',').map((s) => s.trim()).filter(Boolean);
const dpi = Number(get('--dpi') || 110);
const rel = (f) => path.relative(process.cwd(), f);

// Share of pixels that differ by more than 10%, or null when the preview is missing or a different size.
function diff(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return null;
  const r = spawnSync('magick', ['compare', '-metric', 'AE', '-fuzz', '10%', a, b, 'null:'], { encoding: 'utf8' });
  const n = parseFloat(r.stderr);
  if (Number.isNaN(n)) return null;
  const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', a], { encoding: 'utf8' }).split(' ').map(Number);
  return n / (w * h);
}

try {
  main();
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}

function main() {
  if (!powerpoint.available()) {
    console.log('· 跳过：没有找到 PowerPoint for Mac。');
    return;
  }
  const deck = require(path.join(dir, 'deck.js'));
  const name = deck.name || path.basename(dir);
  const theme = typeof deck.theme === 'string' ? require(path.resolve(dir, deck.theme)) : deck.theme;
  const pptx = path.join(dir, 'out', `${name}.pptx`);
  const manifestFile = path.join(dir, 'out', 'manifest.json');
  if (!fs.existsSync(pptx) || !fs.existsSync(manifestFile)) throw new Error(`没有 ${rel(pptx)}：先运行 node engine/make.js ${rel(dir)}`);
  const renderFile = path.join(dir, 'out', 'render.json');
  if (fs.existsSync(renderFile) && JSON.parse(fs.readFileSync(renderFile, 'utf8')).renderer === 'powerpoint') {
    console.log('· renders/ 已经由 PowerPoint 渲染，字体也已在 make.js 里核对，不需要再运行 pptcheck。');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const targets = only ? manifest.filter((m) => only.includes(m.id)) : manifest;

  const out = path.join(dir, 'out', 'ppt');
  fs.mkdirSync(out, { recursive: true });
  const pdf = path.join(out, '_check.pdf');
  const t0 = Date.now();
  powerpoint.exportPdf(pptx, pdf);
  const pages = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }))[1]);
  if (pages !== manifest.length) console.log(`· PowerPoint 导出了 ${pages} 页，manifest 里有 ${manifest.length} 页：先重新运行 make.js`);
  console.log(`✓ PowerPoint 导出 ${pages} 页（${Math.round((Date.now() - t0) / 1000)} 秒）`);

  const rows = [];
  for (const m of targets) {
    const fonts = parsePdffonts(execFileSync('pdffonts', ['-f', String(m.index), '-l', String(m.index), pdf], { encoding: 'utf8' }));
    const prefix = path.join(out, `__tmp_${m.id}`);
    execFileSync('pdftoppm', ['-png', '-r', String(dpi), '-f', String(m.index), '-l', String(m.index), '-singlefile', pdf, prefix]);
    const png = path.join(out, `${m.id}.png`);
    fs.renameSync(`${prefix}.png`, png);
    rows.push({ id: m.id, fonts, diff: diff(path.join(dir, 'renders', `${m.id}.png`), png) });
  }
  fs.rmSync(pdf, { force: true });
  const ids = new Set(manifest.map((m) => m.id));
  for (const f of fs.readdirSync(out)) if (/^S\w*\.png$/.test(f) && !ids.has(f.replace('.png', ''))) fs.unlinkSync(path.join(out, f));

  const foreign = foreignFonts(rows, theme);
  console.log(`\nPowerPoint 用到的、theme 之外的字体: ${foreign.length ? '' : '没有'}`.trimEnd());
  for (const f of foreign) console.log(`  · ${f.family ? `${f.family} (${f.ps})` : f.ps}: ${f.pages.join(', ')}`);
  if (foreign.length) console.log('    正文落到这些字体上是硬问题（改字体或改字）；个别符号回退，看图判断能不能接受。');

  const ranked = rows.filter((r) => r.diff != null).sort((x, y) => y.diff - x.diff);
  console.log('\n与预览差异最大的页（像素差异，同一字体的中西文间距也会计入）:');
  console.log(ranked.length ? `  ${ranked.slice(0, 5).map((r) => `${r.id} ${(r.diff * 100).toFixed(1)}%`).join(' · ')}` : '  · 没有可比较的预览图（先运行 make.js）');

  // Comparison sheet: the requested slides, or the font pages plus the most different ones.
  const pick = only ? targets.map((m) => m.id)
    : [...new Set([...foreign.flatMap((f) => f.pages), ...ranked.slice(0, 5).map((r) => r.id)])].slice(0, 8);
  if (pick.length && fs.existsSync(path.join(dir, 'renders'))) {
    const sheet = path.join(out, '_compare.png');
    execFileSync('node', [path.join(__dirname, 'compare.js'), sheet, path.join(dir, 'renders'), out, '--only', pick.join(','), '--labels', 'LibreOffice 预览,PowerPoint'], { stdio: 'ignore' });
    console.log(`\n✓ 对比图 (${pick.join(', ')}) → ${rel(sheet)}`);
  }
  console.log(`✓ PowerPoint 渲染 → ${rel(out)}/`);
}
