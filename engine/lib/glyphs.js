// Glyph check on the built .pptx: characters the run's font does not have.
//
// A run names a Latin face (<a:latin>) and an East Asian face (<a:ea>). Chinese characters and CJK punctuation are
// set in the East Asian face, everything else in the Latin face. A character missing from its face is set in some
// other font, chosen differently by each renderer: PowerPoint used Times New Roman for ᵀ and ↑ and Segoe UI Symbol
// for ₖ, where LibreOffice showed something else. Coverage comes from fontconfig (`fc-list :family=<f> charset`),
// or, for fonts bundled inside PowerPoint, from their files (`fc-scan`).
//
// Didot (regular) maps digits to oldstyle figures; LibreOffice switches them to lining figures through the font's
// AAT rules, PowerPoint does not. Digits in Didot regular get a soft hint.

const JSZip = require('jszip');
const { fc, scanBundled } = require('./fonts');

const EAST_ASIAN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}　-〿＀-￯]/u;
const OLDSTYLE_DIGITS = ['Didot']; // regular weight; bold and italic have lining digits

// `fc-list :family=<f> charset` -> [[lo, hi], ...] over all faces, or null when the font is not installed.
function parseCharset(out) {
  if (!out || !out.trim()) return null;
  const ranges = [];
  for (const line of out.split('\n')) {
    const m = /charset=(.*)$/.exec(line);
    if (!m) continue;
    for (const tok of m[1].trim().split(/\s+/)) {
      const [lo, hi = lo] = tok.split('-').map((h) => parseInt(h, 16));
      if (!Number.isNaN(lo)) ranges.push([lo, hi]);
    }
  }
  return ranges.length ? ranges : null;
}

// family -> (codepoint -> true/false), or null for a font fontconfig does not know.
function coverage(lookup = (family) => fc([`:family=${family}`, 'charset']) || scanBundled(family, ':charset=%{charset}\n')) {
  const cache = new Map();
  return (family) => {
    if (!cache.has(family)) {
      const ranges = parseCharset(lookup(family));
      cache.set(family, ranges && ((cp) => ranges.some(([lo, hi]) => cp >= lo && cp <= hi)));
    }
    return cache.get(family);
  };
}

const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

// Slide XML -> [{ latin, ea, bold, text }]
function runs(xml) {
  const out = [];
  for (const m of xml.matchAll(/<a:r>([\s\S]*?)<\/a:r>/g)) {
    const r = m[1];
    const text = /<a:t>([\s\S]*?)<\/a:t>/.exec(r);
    if (!text) continue;
    out.push({
      latin: /<a:latin typeface="([^"]*)"/.exec(r)?.[1],
      ea: /<a:ea typeface="([^"]*)"/.exec(r)?.[1],
      bold: /<a:rPr[^>]*\sb="1"/.test(r),
      text: unescape(text[1]),
    });
  }
  return out;
}

// Slide XML -> { hard: [], soft: [] }
function checkGlyphs(xml, has = coverage()) {
  const missing = new Map(); // font -> Set of characters
  const oldstyle = new Set();
  for (const r of runs(xml)) {
    for (const ch of r.text) {
      if (/\s/.test(ch)) continue;
      const font = EAST_ASIAN.test(ch) ? r.ea : r.latin;
      const covers = font && has(font);
      if (covers && !covers(ch.codePointAt(0))) {
        if (!missing.has(font)) missing.set(font, new Set());
        missing.get(font).add(ch);
      }
    }
    if (OLDSTYLE_DIGITS.includes(r.latin) && !r.bold && /\d/.test(r.text)) oldstyle.add(r.text.trim());
  }
  return {
    hard: [...missing].map(([font, chars]) => `${[...chars].map((c) => `'${c}'`).join('、')} 不在 ${font} 里（PowerPoint 会换成别的字体显示）— 换个写法，或给这几个字单独指定一个有它们的字体`),
    soft: oldstyle.size ? [`Didot 的数字在 PowerPoint 里是旧式数字（预览里是等高数字）: ${[...oldstyle].map((t) => `'${t}'`).join('、')} — 数字可改用 Bodoni 72 或 Didot Bold`] : [],
  };
}

// Built deck -> one { hard, soft } per manifest entry.
async function glyphReports(buf, manifest, has = coverage()) {
  const zip = await JSZip.loadAsync(buf);
  return Promise.all(manifest.map(async (m) => {
    const f = zip.file(`ppt/slides/slide${m.index}.xml`);
    return f ? checkGlyphs(await f.async('string'), has) : { hard: [], soft: [] };
  }));
}

module.exports = { parseCharset, coverage, runs, checkGlyphs, glyphReports };
