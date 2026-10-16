// On-screen text check: does the built .pptx carry the text that design.md's per-slide plan specifies?
//
// design.md, section "逐页方案": each slide is a `### S07 · …` heading; its `- **画面文字**：` bullet lists
// the on-screen text, one sub-bullet per item (`- 标题：…`). The value after the first colon is the text;
// quoted segments (“…” 「…」 "…"), when present, are taken as the exact text and the rest as annotation;
// a trailing （…） annotation is dropped; ` / ` separates lines. Matching ignores whitespace, quotes and case.

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// projects/<slug>/02-design/design.md, from 03-reference/, 04-deck/ or 03-reference/directions/<X>/.
function findDesign(deckDir) {
  let d = deckDir;
  for (let i = 0; i < 4; i++) {
    const f = path.join(d, '02-design', 'design.md');
    if (fs.existsSync(f)) return f;
    d = path.dirname(d);
  }
  return null;
}

const norm = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[\s“”‘’"'「」『』]/g, '');

function expectedItems(value) {
  const v = value.trim();
  const quoted = [...v.matchAll(/“([^”]+)”|「([^」]+)」|"([^"]+)"/g)].map((m) => m[1] || m[2] || m[3]);
  const texts = quoted.length ? quoted : [v.replace(/\s*[（(][^（）()]*[）)]\s*$/, '')];
  return texts.flatMap((t) => t.split(/\s+\/\s+|\\n/)).map((t) => t.trim())
    .filter((t) => t && !/^[（(].*[）)]$/.test(t) && !/^(无|—|-|——)$/.test(t));
}

function parseDesign(md) {
  const pages = {};
  let cur = null, inText = false, indent = 0;
  for (const line of md.split('\n')) {
    const h = line.match(/^###\s+(S\d+[a-z]?)\b/);
    if (h) { cur = pages[h[1]] = { section: '', items: [] }; inText = false; continue; }
    if (/^##?\s/.test(line)) { cur = null; inText = false; continue; }
    if (!cur) continue;
    cur.section += `${line}\n`;
    const lead = line.match(/^(\s*)-\s*\*\*画面文字\*\*\s*[：:]\s*(.*)$/);
    if (lead) {
      inText = true; indent = lead[1].length;
      if (lead[2].trim()) cur.items.push(...expectedItems(lead[2]));
      continue;
    }
    if (!inText || !line.trim()) continue;
    const sub = line.match(/^(\s*)-\s+(.*)$/);
    if (!sub || sub[1].length <= indent) { inText = false; continue; }
    const body = sub[2];
    const colon = body.search(/[：:]/);
    cur.items.push(...expectedItems(colon >= 0 && colon <= 12 ? body.slice(colon + 1) : body));
  }
  return pages;
}

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

// Text of each paragraph on a slide (shapes and tables), in document order.
function paragraphs(xml) {
  return (xml.match(/<a:p>[\s\S]*?<\/a:p>/g) || [])
    .map((p) => (p.match(/<a:t>([^<]*)<\/a:t>/g) || []).map((t) => decode(t.replace(/<\/?a:t>/g, ''))).join(''))
    .filter(Boolean);
}

// manifest: [{ id, index }]; returns { design, reports: [{ id, soft: [] }] } or null when no design.md is found.
async function checkText(deckDir, pptxBuffer, manifest) {
  const design = findDesign(deckDir);
  if (!design) return null;
  const md = fs.readFileSync(design, 'utf8');
  const pages = parseDesign(md);
  const whole = norm(md);
  const zip = await JSZip.loadAsync(pptxBuffer);
  const reports = [];
  for (const m of manifest) {
    const soft = [];
    const page = pages[m.id];
    const file = zip.file(`ppt/slides/slide${m.index}.xml`);
    const texts = file ? paragraphs(await file.async('string')) : [];
    const onSlide = norm(texts.join(''));
    if (!page) soft.push('design.md 里没有这一页的逐页方案');
    else if (!page.items.length) soft.push('design.md 里这一页没有写“画面文字”');
    else {
      const missing = page.items.filter((t) => !onSlide.includes(norm(t)));
      if (missing.length) soft.push(`design.md 要求、页面上没有: ${missing.map((t) => `“${t}”`).join('、')}`);
    }
    // Longer text on the slide that design.md never mentions: invented in production, or not synced back.
    const extra = texts.filter((t) => {
      const n = norm(t);
      return n.length >= 4 && /[\p{L}]/u.test(n) && !whole.includes(n);
    });
    if (extra.length) soft.push(`页面上有、design.md 没写: ${extra.slice(0, 5).map((t) => `“${t.slice(0, 30)}”`).join('、')}${extra.length > 5 ? ` 等 ${extra.length} 处` : ''}`);
    reports.push({ id: m.id, soft });
  }
  return { design, reports };
}

module.exports = { checkText, parseDesign, findDesign };
