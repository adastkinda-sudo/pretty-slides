#!/usr/bin/env node
// Find out what PowerPoint changed when it "repaired" a file.
//
//   node engine/pptdiff.js <original.pptx> <repaired.pptx>
//
// Reports: parts added/removed, content-type overrides, per-part element/attribute count changes, and the first
// changed text body per slide (by shape id). Re-saving also normalises things (attribute order, namespace placement,
// image de-duplication, extLst additions) — look for changes that repeat across slides or remove/merge content.

const fs = require('fs');
const JSZip = require('jszip');

const [a, b] = process.argv.slice(2);
if (!a || !b) { console.error('usage: node engine/pptdiff.js <original.pptx> <repaired.pptx>'); process.exit(2); }

const tidy = (s) => s.replace(/>\s+</g, '><');
function counts(xml) {
  const c = new Map();
  const add = (k) => c.set(k, (c.get(k) || 0) + 1);
  for (const m of xml.matchAll(/<([A-Za-z0-9]+:[A-Za-z0-9]+)((?:\s+[A-Za-z0-9:]+="[^"]*")*)\s*\/?>/g)) {
    add(m[1]);
    for (const at of m[2].matchAll(/([A-Za-z0-9:]+)="/g)) if (!at[1].startsWith('xmlns')) add(`${m[1]}@${at[1]}`);
  }
  return c;
}
function textBodies(xml) {
  const out = new Map();
  for (const sp of xml.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)) {
    const id = (sp[0].match(/<p:cNvPr id="(\d+)"[^>]*name="([^"]*)"/) || []);
    const tx = (sp[0].match(/<p:txBody>[\s\S]*?<\/p:txBody>/) || [''])[0];
    if (id[1]) out.set(id[1], { name: id[2], tx: tx.replace(/\s*\/>/g, '/>').replace(/(<[^>]+?)\s+([^>]*?)>/g, (m) => m) });
  }
  return out;
}
const norm = (tx) => tx.replace(/<([A-Za-z0-9:]+)((?:\s+[A-Za-z0-9:]+="[^"]*")*)\s*(\/?)>/g, (m, tag, attrs, sl) =>
  `<${tag}${[...attrs.matchAll(/\s+([A-Za-z0-9:]+="[^"]*")/g)].map((x) => ` ${x[1]}`).sort().join('')}${sl}>`).replace(/<(\w+:\w+)([^>]*)><\/\1>/g, '<$1$2/>');

(async () => {
  const [za, zb] = await Promise.all([a, b].map(async (f) => JSZip.loadAsync(fs.readFileSync(f))));
  const pa = Object.keys(za.files).filter((n) => !za.files[n].dir), pb = Object.keys(zb.files).filter((n) => !zb.files[n].dir);
  const onlyA = pa.filter((n) => !pb.includes(n)), onlyB = pb.filter((n) => !pa.includes(n));
  if (onlyA.length || onlyB.length) console.log(`parts only in original: ${onlyA.join(', ') || '—'}\nparts only in repaired: ${onlyB.join(', ') || '—'}\n`);

  for (const part of pa.filter((n) => pb.includes(n) && /\.xml$|\.rels$/.test(n)).sort()) {
    const xa = tidy(await za.file(part).async('string')), xb = tidy(await zb.file(part).async('string'));
    if (xa === xb) continue;
    const ca = counts(xa), cb = counts(xb);
    const keys = [...new Set([...ca.keys(), ...cb.keys()])].filter((k) => (ca.get(k) || 0) !== (cb.get(k) || 0)).sort();
    console.log(`== ${part}`);
    if (keys.length) console.log(`   ${keys.slice(0, 30).map((k) => `${k}: ${ca.get(k) || 0}→${cb.get(k) || 0}`).join('  ')}`);
    if (/^ppt\/slides\/slide\d+\.xml$/.test(part)) {
      const ta = textBodies(xa), tb = textBodies(xb);
      for (const [id, v] of ta) {
        const w = tb.get(id);
        if (!w) { console.log(`   shape ${id} "${v.name}" removed`); continue; }
        if (norm(v.tx) !== norm(w.tx)) {
          console.log(`   first changed text body: shape ${id} "${v.name}"\n     original: ${v.tx.slice(0, 400)}\n     repaired: ${w.tx.slice(0, 400)}`);
          break;
        }
      }
    }
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
