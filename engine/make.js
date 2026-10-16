#!/usr/bin/env node
// Build a deck folder into .pptx, run geometry QA, render PNG previews.
//
//   node engine/make.js <deckDir>                 build + QA + render all + contact sheet
//   node engine/make.js <deckDir> --only S03,S07  build all, render only these slides
//   node engine/make.js <deckDir> --no-render     build + QA only
//
// <deckDir> must contain deck.js ({ name, theme, slides: ['S01', ...] }) and slides/<ID>-*.js.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const PptxGenJS = require('pptxgenjs');
const { makeKit } = require('./lib/kit');
const { check } = require('./lib/qa');
const { postProcess } = require('./lib/post');
const { estimate } = require('./lib/timing');
const { checkText } = require('./lib/textcheck');

function args() {
  const a = process.argv.slice(2);
  if (!a[0] || a[0].startsWith('-')) {
    console.error('usage: node engine/make.js <deckDir> [--only S01,S02] [--no-render] [--dpi 110]');
    process.exit(2);
  }
  const get = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : undefined; };
  return {
    dir: path.resolve(a[0]),
    only: get('--only')?.split(',').map((s) => s.trim()).filter(Boolean),
    render: !a.includes('--no-render'),
    dpi: Number(get('--dpi') || 110),
  };
}

function fresh(mod) { delete require.cache[require.resolve(mod)]; return require(mod); }

// Fonts named in the theme but not installed get silently substituted — the most common way a deck loses its look.
function missingFonts(theme) {
  let list;
  try { list = execFileSync('fc-list', [':', 'family', 'fullname'], { encoding: 'utf8' }); } catch { return []; }
  const names = new Set();
  for (const line of list.split('\n')) {
    const [fam, full] = line.split(':fullname=');
    [...(fam || '').split(','), ...(full || '').split(',')].forEach((n) => n && names.add(n.replace(/\\/g, '').trim()));
  }
  const has = (f) => names.has(f) || names.has(`${f} Regular`);
  const wanted = new Set([...Object.values(theme.fonts || {}), ...Object.values(theme.fontPairs || {})]);
  Object.values(theme.type || {}).forEach((t) => { if (t.font && !theme.fonts?.[t.font]) wanted.add(t.font); });
  return [...wanted].filter((f) => !has(f));
}

function findSlideFile(dir, id) {
  const sd = path.join(dir, 'slides');
  const hit = fs.readdirSync(sd).filter((f) => f.endsWith('.js') && (f === `${id}.js` || f.startsWith(`${id}-`)));
  if (hit.length !== 1) throw new Error(`slide ${id}: expected exactly one slides/${id}-*.js, found ${hit.length}`);
  return path.join(sd, hit[0]);
}

async function build(opt) {
  const deck = fresh(path.join(opt.dir, 'deck.js'));
  const theme = typeof deck.theme === 'string' ? fresh(path.resolve(opt.dir, deck.theme)) : deck.theme;
  const name = deck.name || path.basename(opt.dir);
  const pptx = new PptxGenJS();
  const W = theme.size?.w ?? 13.333, H = theme.size?.h ?? 7.5;
  pptx.defineLayout({ name: 'DECK', width: W, height: H });
  pptx.layout = 'DECK';
  pptx.title = deck.title || name;
  if (deck.author) pptx.author = deck.author;

  const manifest = [], transitions = [], reports = [], builds = [], lights = [], notes = [];
  for (const [index, id] of deck.slides.entries()) {
    const file = findSlideFile(opt.dir, id);
    const mod = fresh(file);
    const slide = pptx.addSlide();
    const k = makeKit({ pptx, slide, theme, deckDir: opt.dir, slideId: id, page: { id, index: index + 1, total: deck.slides.length } });
    k.bg(mod.bg || theme.background || 'paper');
    try {
      await mod.build(k);
    } catch (e) {
      e.message = `[${id}] ${e.message}`;
      throw e;
    }
    if (mod.notes) k.notes(String(mod.notes).trim());
    notes.push({ id, notes: mod.notes || '' });
    transitions.push(mod.transition || theme.transition || 'none');
    builds.push(k._builds());
    lights.push(k._lights());
    manifest.push({ id, index: index + 1, title: mod.title || '', rhythm: mod.rhythm || '', file: path.relative(opt.dir, file) });
    const q = k._qa();
    reports.push(check({ id, boxes: q.boxes, bg: q.bg, W, H, M: k.M, rhythm: mod.rhythm, textOnly: mod.textOnly }));
  }

  const raw = await pptx.write({ outputType: 'nodebuffer' });
  const buf = await postProcess(raw, { transitions, fontPairs: theme.fontPairs, builds, lights });
  const outDir = path.join(opt.dir, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const pptxPath = path.join(outDir, `${name}.pptx`);
  fs.writeFileSync(pptxPath, buf);
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  // CJK faces must be named by family only ('PingFang SC'); weight comes from bold: true.
  // Weight-suffixed CJK names ('PingFang SC Light') resolve inconsistently and fall back to another face (often a serif).
  const cjkSuffixed = (f) => /(PingFang|Songti|Heiti|Hiragino|Kaiti|Yuanti|Lantinghei)/.test(f) && / (Ultralight|Thin|Light|Regular|Medium|Semibold|Bold|Heavy|Black)$/.test(f);
  const used = [...Object.values(theme.fonts || {}), ...Object.keys(theme.fontPairs || {}), ...Object.values(theme.type || {}).map((t) => t.font)];
  const badPairs = [...new Set(used.filter((f) => f && cjkSuffixed(f)))];
  const timing = estimate(notes, { target: deck.minutes, rate: deck.speechRate });
  const text = await checkText(opt.dir, buf, manifest);
  return { name, pptxPath, manifest, reports, missing: missingFonts(theme), badPairs, timing, text };
}

function render(opt, { name, pptxPath, manifest }) {
  const outDir = path.dirname(pptxPath);
  const rDir = path.join(opt.dir, 'renders');
  fs.mkdirSync(rDir, { recursive: true });
  // Isolated LibreOffice profile so a running LibreOffice window doesn't block headless conversion.
  const profile = path.join(os.tmpdir(), 'pretty-slides-lo-profile');
  execFileSync('soffice', [`-env:UserInstallation=file://${profile}`, '--headless', '--convert-to', 'pdf', '--outdir', outDir, pptxPath], { stdio: 'ignore' });
  const pdf = path.join(outDir, `${name}.pdf`);
  if (!fs.existsSync(pdf)) throw new Error('LibreOffice did not produce a PDF');
  const targets = opt.only ? manifest.filter((m) => opt.only.includes(m.id)) : manifest;
  const prevDir = path.join(rDir, '_prev'); // previous render of each slide, for before/after comparison
  for (const m of targets) {
    const prefix = path.join(rDir, `__tmp_${m.id}`);
    const dest = path.join(rDir, `${m.id}.png`);
    execFileSync('pdftoppm', ['-png', '-r', String(opt.dpi), '-f', String(m.index), '-l', String(m.index), '-singlefile', pdf, prefix]);
    if (fs.existsSync(dest)) {
      fs.mkdirSync(prevDir, { recursive: true });
      fs.renameSync(dest, path.join(prevDir, `${m.id}.png`));
    }
    fs.renameSync(`${prefix}.png`, dest);
  }
  // Remove renders of slides no longer in the deck.
  const ids = new Set(manifest.map((m) => m.id));
  for (const f of fs.readdirSync(rDir)) if (/^S\d+.*\.png$/.test(f) && !ids.has(f.replace('.png', ''))) fs.unlinkSync(path.join(rDir, f));
  let contact;
  if (!opt.only) {
    contact = path.join(rDir, '_contact.png');
    execFileSync('magick', contactArgs(manifest, rDir, contact), { stdio: 'ignore' });
  }
  return { rDir, targets, contact };
}

// Contact sheet: rows of thumbnails labelled with slide IDs (no `montage`, which needs a default font).
function contactArgs(manifest, rDir, out) {
  const perRow = manifest.length <= 6 ? 3 : 4;
  const font = ['/System/Library/Fonts/Helvetica.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'].find((f) => fs.existsSync(f));
  const a = [];
  for (let i = 0; i < manifest.length; i += perRow) {
    a.push('(');
    for (const m of manifest.slice(i, i + perRow)) {
      a.push('(', path.join(rDir, `${m.id}.png`), '-resize', '640x360', '-background', '#CFCDC7', '-gravity', 'north', '-splice', '0x30');
      if (font) a.push('-font', font, '-pointsize', '16', '-fill', '#3A3936', '-gravity', 'northwest', '-annotate', '+2+6', m.id);
      a.push('-bordercolor', '#CFCDC7', '-border', '12', ')');
    }
    a.push('+append', ')');
  }
  a.push('-background', '#CFCDC7', '-gravity', 'northwest', '-append', out);
  return a;
}

(async () => {
  const opt = args();
  const res = await build(opt);
  console.log(`✓ built ${path.relative(process.cwd(), res.pptxPath)} (${res.manifest.length} slides)`);
  let hardCount = 0;
  if (res.badPairs.length) {
    hardCount += res.badPairs.length;
    console.log(`\n中文字体不能带字重后缀（会被渲染成别的字体）: ${res.badPairs.join(', ')} — 只写家族名（如 'PingFang SC'），字重用 bold: true`);
  }
  if (res.missing.length) {
    hardCount += res.missing.length;
    console.log(`\n字体未安装（会被替换）: ${res.missing.join(', ')}`);
  }
  for (const r of res.reports) {
    if (opt.only && !opt.only.includes(r.id)) continue;
    if (!r.hard.length && !r.soft.length) continue;
    console.log(`\n${r.id}`);
    r.hard.forEach((m) => { hardCount++; console.log(`  ✗ ${m}`); });
    r.soft.forEach((m) => console.log(`  · ${m}`));
  }
  console.log(hardCount ? `\nQA: ${hardCount} hard issue(s) — fix before showing the user.` : '\nQA: no hard issues (geometry heuristics only; still inspect the renders).');
  if (res.text) {
    const hits = res.text.reports.filter((r) => r.soft.length && (!opt.only || opt.only.includes(r.id)));
    const rel = path.relative(process.cwd(), res.text.design);
    console.log(`\n画面文字核对（对照 ${rel.startsWith('..') ? res.text.design : rel}）: ${hits.length ? '' : '一致'}`);
    for (const r of hits) r.soft.forEach((m) => console.log(`  · ${r.id} ${m}`));
  }
  const t = res.timing;
  console.log(`\n讲解时长估算: 约 ${t.minutes.toFixed(0)} 分钟（备注 ${Math.round(t.total)} 字当量，按 ${t.rate} 字/分钟）${t.target ? `，目标 ${t.target} 分钟` : ''}`);
  t.soft.forEach((m) => console.log(`  · ${m}`));
  if (opt.render) {
    const r = render(opt, res);
    console.log(`✓ rendered ${r.targets.map((t) => t.id).join(', ')} → ${path.relative(process.cwd(), r.rDir)}/`);
    if (r.contact) console.log(`✓ contact sheet → ${path.relative(process.cwd(), r.contact)}`);
  }
})().catch((e) => { console.error(`✗ ${e.stack || e.message}`); process.exit(1); });
