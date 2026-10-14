// Rough text metrics for overflow warnings. Heuristic only — the render is the real check.

const fs = require('fs');

function charEm(ch) {
  const c = ch.codePointAt(0);
  if (c >= 0x2e80 && c <= 0x9fff) return 1.0;          // CJK
  if (c >= 0xff00 && c <= 0xffef) return 1.0;          // full-width forms
  if (c >= 0x3000 && c <= 0x303f) return 1.0;          // CJK punctuation
  if (ch === ' ') return 0.28;
  if (/[il.,:;'!|]/.test(ch)) return 0.28;
  if (/[mwMW]/.test(ch)) return 0.85;
  if (/[A-Z]/.test(ch)) return 0.66;
  if (/[0-9]/.test(ch)) return 0.58;
  return 0.54;
}

function lineWidthPt(str, sizePt, trackingPt) {
  let em = 0;
  for (const ch of str) em += charEm(ch);
  return em * sizePt + [...str].length * trackingPt;
}

// PowerPoint "multiple" line spacing multiplies the font's own line height (≈1.2 em for PingFang /
// Songti / Helvetica Neue), not the font size.
const NATURAL_LINE = 1.2;

// paragraphs: [{ text, sizePt, trackingPt, leading }]; returns estimated height in inches
function estimateHeight(paragraphs, boxWIn) {
  const boxWPt = boxWIn * 72;
  let total = 0;
  for (const p of paragraphs) {
    const w = lineWidthPt(p.text, p.sizePt, p.trackingPt || 0);
    const lines = Math.max(1, Math.ceil(w / Math.max(boxWPt, 1)));
    total += lines * p.sizePt * (p.leading || 1) * NATURAL_LINE;
  }
  return total / 72;
}

// Image natural size (px) for PNG / JPEG, without dependencies.
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      }
      i += 2 + len;
    }
  }
  throw new Error(`Unsupported image (use PNG or JPEG): ${file}`);
}

module.exports = { estimateHeight, lineWidthPt, imageSize };
