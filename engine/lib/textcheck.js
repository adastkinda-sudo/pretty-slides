// On-screen text check: does the built .pptx carry the text that design.md's per-slide plan specifies?
//
// design.md, section "逐页方案": each slide is a `### S07 · …` heading; its `- **画面文字**：` bullet lists
// the on-screen text, one sub-bullet per item (`- 标题：…`). The value after the first colon is the text;
// quoted segments (“…” 「…」 "…"), when present, are taken as the exact text and the rest as annotation;
// full-width （…） is annotation, and an item that is all annotation is skipped.
// An item matches when its whole text is on the slide, or when every fragment is: fragments are split at
// line breaks (`/`), enumeration commas (`、`) and middle dots (`·`), since such lists are usually set as
// separate labels; a Latin/number fragment whose space-separated words are each on the slide also counts.
// Matching ignores whitespace, quotes and case.
//
// content.md: under each chapter's `- 必须上屏：` bullet, quoted text (inline or one sub-bullet per item) must
// appear somewhere in the finished deck. Unquoted descriptions ("注意力公式") are not checked. This runs only
// when the deck has every page of design.md's per-slide plan: sample decks carry a few pages by design.
//
// Placeholders: template text left on a slide ({{…}}, <论断标题>, SXX, lorem ipsum) is a hard issue;
// TODO / TBD / FIXME / XXX / 待定 / 待补 / 占位, which can be legitimate content, are flagged softly, as is
// anything of either kind in the speaker notes.

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// projects/<slug>/<rel>, from 03-reference/, 04-deck/ or 03-reference/directions/<X>/.
function findUp(deckDir, rel) {
  let d = deckDir;
  for (let i = 0; i < 4; i++) {
    const f = path.join(d, rel);
    if (fs.existsSync(f)) return f;
    d = path.dirname(d);
  }
  return null;
}
const findDesign = (deckDir) => findUp(deckDir, path.join('02-design', 'design.md'));
const findContent = (deckDir) => findUp(deckDir, path.join('01-content', 'content.md'));

const norm = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[\s“”‘’"'「」『』]/g, '');

const SEP = /[\/／、·・|｜]|\\n/;

const quotedIn = (v) => [...v.matchAll(/“([^”]+)”|「([^」]+)」|"([^"]+)"/g)].map((m) => m[1] || m[2] || m[3]);
const toItems = (texts) => texts.map((t) => t.trim())
  .filter((t) => t && !/^(无|—|-|——)$/.test(t))
  .map((text) => ({ text, frags: text.split(SEP).map((f) => f.trim()).filter((f) => norm(f)) }));

// -> [{ text, frags }]
function expectedItems(value) {
  const v = value.trim();
  const quoted = quotedIn(v);
  return toItems(quoted.length ? quoted : [v.replace(/（[^（）]*）/g, '')]);
}

// Quoted items under content.md's `必须上屏` bullets -> [{ text, frags }]
function parseMustShow(md) {
  const items = [];
  let inList = false, indent = 0;
  for (const line of md.split('\n')) {
    const lead = line.match(/^(\s*)-\s*(?:\*\*)?必须上屏(?:\*\*)?\s*[：:]\s*(.*)$/);
    if (lead) { inList = true; indent = lead[1].length; items.push(...toItems(quotedIn(lead[2]))); continue; }
    if (!inList || !line.trim()) continue;
    const sub = line.match(/^(\s*)-\s+(.*)$/);
    if (!sub || sub[1].length <= indent) { inList = false; continue; }
    items.push(...toItems(quotedIn(sub[2])));
  }
  return items;
}

const HARD_PH = [/\{\{[^{}]*\}\}/, /<[^<>\n]*\p{Script=Han}[^<>\n]*>/u, /\bSXX\b/, /lorem ipsum/i];
const SOFT_PH = [/\b(?:TODO|TBD|FIXME|XXX)\b/, /待定|待补|占位/];
const hits = (text, res) => res.map((re) => text.match(re)).filter(Boolean).map((m) => m[0]);

// Leftover template text on a slide (texts: its paragraphs) and in its notes -> { hard: [], soft: [] }
function placeholders(texts, notes = '') {
  const hard = [], soft = [];
  const onSlideHard = [...new Set(texts.flatMap((t) => hits(t, HARD_PH)))];
  const onSlideSoft = [...new Set(texts.flatMap((t) => hits(t, SOFT_PH)))];
  const inNotes = [...new Set(hits(String(notes), [...HARD_PH, ...SOFT_PH]))];
  if (onSlideHard.length) hard.push(`页面上有模板占位符: ${onSlideHard.map((t) => `“${t}”`).join('、')}`);
  if (onSlideSoft.length) soft.push(`页面上疑似占位符: ${onSlideSoft.map((t) => `“${t}”`).join('、')}（是正文内容可忽略）`);
  if (inNotes.length) soft.push(`讲稿里有占位符: ${inNotes.map((t) => `“${t}”`).join('、')}`);
  return { hard, soft };
}

// Items not found on the slide, each with the fragments that are missing.
function missingItems(items, onSlide) {
  return items.flatMap((it) => {
    if (onSlide.includes(norm(it.text))) return [];
    // A Latin/number fragment also counts when each of its words is on the slide: label and value
    // ("street 0.17") are often separate boxes. Not for Chinese, where common words would mask real drift.
    const words = (f) => f.split(/\s+/);
    const found = (f) => onSlide.includes(norm(f))
      || (!/\p{Script=Han}/u.test(f) && words(f).every((w) => onSlide.includes(norm(w))));
    const lost = it.frags.filter((f) => !found(f));
    return lost.length ? [{ text: it.text, lost, partial: lost.length < it.frags.length }] : [];
  });
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

// manifest: [{ id, index }]; chrome: per slide, the paragraphs of structure-layer text (k.text chrome: true),
// such as section markers, which design.md describes in its structure layer rather than per slide; notes: per slide.
// Returns { design, content, reports: [{ id, soft: [] }], deck: [], placeholders: [{ id, hard: [], soft: [] }] };
// design / content are null when the file is not found, and reports / deck are then empty.
async function checkText(deckDir, pptxBuffer, manifest, { chrome = [], notes = [] } = {}) {
  const zip = await JSZip.loadAsync(pptxBuffer);
  const slides = [];
  for (const m of manifest) {
    const file = zip.file(`ppt/slides/slide${m.index}.xml`);
    slides.push(file ? paragraphs(await file.async('string')) : []);
  }
  const ph = manifest.map((m, i) => ({ id: m.id, ...placeholders(slides[i], notes[i]) }));
  const design = findDesign(deckDir);
  const res = { design, content: null, reports: [], deck: [], placeholders: ph };
  if (!design) return res;
  const md = fs.readFileSync(design, 'utf8');
  const pages = parseDesign(md);
  const whole = norm(md);
  for (const [i, m] of manifest.entries()) {
    const skip = new Set((chrome[i] || []).map(norm));
    const soft = [];
    const page = pages[m.id];
    const texts = slides[i];
    const onSlide = norm(texts.join(''));
    if (!page) soft.push('design.md 里没有这一页的逐页方案');
    else if (!page.items.length) soft.push('design.md 里这一页没有写“画面文字”');
    else {
      const missing = missingItems(page.items, onSlide);
      if (missing.length) soft.push(`design.md 要求、页面上没有: ${missing.map(show).join('、')}`);
    }
    // Longer text on the slide that design.md never mentions: invented in production, or not synced back.
    const extra = texts.filter((t) => {
      const n = norm(t);
      return n.length >= 4 && /[\p{L}]/u.test(n) && !whole.includes(n) && !skip.has(n);
    });
    if (extra.length) soft.push(`页面上有、design.md 没写: ${extra.slice(0, 5).map((t) => `“${t.slice(0, 30)}”`).join('、')}${extra.length > 5 ? ` 等 ${extra.length} 处` : ''}`);
    res.reports.push({ id: m.id, soft });
  }
  // content.md's must-show text, against the whole deck, once the deck has every page design.md plans.
  const content = findContent(deckDir);
  const ids = new Set(manifest.map((m) => m.id));
  const planned = Object.keys(pages);
  if (content && planned.length && planned.every((id) => ids.has(id))) {
    res.content = content;
    const missing = missingItems(parseMustShow(fs.readFileSync(content, 'utf8')), norm(slides.flat().join('')));
    if (missing.length) res.deck.push(`content.md 必须上屏、整套页面上都没有: ${missing.map(show).join('、')}`);
  }
  return res;
}

const show = (m) => (m.partial ? `“${m.lost.join('”“')}”（在“${m.text}”中）` : `“${m.text}”`);

module.exports = { checkText, parseDesign, parseMustShow, placeholders, findDesign, findContent, missingItems };
