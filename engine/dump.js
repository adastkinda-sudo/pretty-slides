#!/usr/bin/env node
// List the objects on a slide of any .pptx: name, position/size (inches), and text.
// Use it to port a user's manual PowerPoint edits back into the slide source.
//
//   node engine/dump.js <file.pptx> [slideNumber ...]

const fs = require('fs');
const JSZip = require('jszip');

const EMU = 914400;
const inch = (v) => (Number(v) / EMU).toFixed(2);

(async () => {
  const [file, ...nums] = process.argv.slice(2);
  if (!file) { console.error('usage: node engine/dump.js <file.pptx> [slideNumber ...]'); process.exit(2); }
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const slides = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  const pick = nums.length ? nums.map(Number) : slides.map((_, i) => i + 1);
  for (const n of pick) {
    const xml = await zip.file(`ppt/slides/slide${n}.xml`).async('string');
    console.log(`\n── slide ${n}`);
    const objs = xml.match(/<p:(sp|pic|graphicFrame|cxnSp)>[\s\S]*?<\/p:\1>/g) || [];
    for (const o of objs) {
      const name = (o.match(/<p:cNvPr[^>]*name="([^"]*)"/) || [])[1] || '';
      const off = o.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>/);
      const ext = o.match(/<a:ext cx="(\d+)" cy="(\d+)"\/>/);
      const text = (o.match(/<a:t>([^<]*)<\/a:t>/g) || []).map((t) => t.replace(/<\/?a:t>/g, '')).join('').slice(0, 60);
      const sz = (o.match(/sz="(\d+)"/) || [])[1];
      const pos = off && ext ? `x=${inch(off[1])} y=${inch(off[2])} w=${inch(ext[1])} h=${inch(ext[2])}` : '';
      console.log(`  ${name.padEnd(18)} ${pos.padEnd(36)} ${sz ? `${sz / 100}pt ` : ''}${text}`);
    }
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
