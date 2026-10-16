// Deck-local building blocks for the font specimens.

// Page heading and the line that says what the page is for.
function heading(k, title, note) {
  k.text(title, { style: 'heading', x: k.M.x, y: 0.55, w: 6, nowrap: true });
  k.text(note, { style: 'meta', x: k.M.x, y: 1.0, w: 11.5, nowrap: true });
}

// One specimen row: the font's name with a note beside it or a tag below, at left; the sample in that font at right.
function row(k, { x, y, nameW, sampleW, font, label, tag, note, sample, size }) {
  k.text(note ? [label, { text: `  ${note}`, style: 'meta' }] : label, { style: 'name', x, y: y + 0.04, w: nameW, nowrap: true });
  if (tag) k.text(tag, { style: 'meta', x, y: y + 0.27, w: nameW, nowrap: true });
  k.text(sample, { style: 'plain', font, size, leading: 1.1, color: 'ink', x: x + nameW + 0.15, y: y - (size - 20) / 160, w: sampleW, nowrap: true });
}

// The same words on every pairing page, so only the type changes. Facts: Apple's Macintosh 128K, announced
// 24 January 1984 at US$2,495, with a 9-inch monochrome screen, a mouse and 128 KB of memory.
const COPY = {
  label: '1984 · MACINTOSH',
  title: '一台为普通人\n做的电脑。',
  body: '九英寸黑白屏幕，图形界面，一只鼠标。\n1984 年 1 月 24 日发布，售价 2,495 美元。',
  number: '128',
  unit: 'KB 内存',
  quote: 'Insanely great.',
};

// A mock slide set in one pairing. p: { name, use, fonts: { title, body, number, latin, label }, title: {...},
// number: {...}, quote: {...}, label: {...}, roles } — the nested objects override the text options of that part.
function pairing(k, p) {
  const left = k.M.x, top = 1.85;
  k.text(p.name, { style: 'heading', x: left, y: 0.55, w: 6, nowrap: true, chrome: true });
  k.text(p.use, { style: 'meta', x: left, y: 1.0, w: 11.5, nowrap: true, chrome: true });

  k.text(COPY.label, { style: 'plain', font: p.fonts.label, size: 11, tracking: 12, color: 'stone', x: left, y: top, w: 4, nowrap: true, ...p.label });
  const t = k.text(COPY.title, { style: 'plain', font: p.fonts.title, size: 46, leading: 1.25, color: 'ink', x: left, y: top + 0.45, w: 5.6, ...p.title });
  const b = k.text(COPY.body, { style: 'plain', font: p.fonts.body, size: 16, leading: 1.7, color: 'graphite', x: left, y: t.y + t.estH + 0.4, w: 5.6 });
  k.text(COPY.quote, { style: 'plain', font: p.fonts.latin, size: 16, color: 'stone', x: left, y: b.y + b.estH + 0.3, w: 4, nowrap: true, ...p.quote });

  // The number is the visual centre.
  const nw = 5.8, nx = k.W - k.M.x - nw;
  const n = k.text(COPY.number, { style: 'plain', font: p.fonts.number, size: 210, leading: 0.85, tracking: -2, color: 'accent', x: nx, y: top, w: nw, h: 3.0, align: 'right', nowrap: true, ...p.number });
  // Just under the digits' baseline, inside the number's box (the box is taller than the digits).
  k.text(COPY.unit, { style: 'plain', font: p.fonts.body, size: 16, color: 'graphite', x: nx, y: n.y + 2.4, w: nw, align: 'right', nowrap: true, overlap: true });

  // Which font does what.
  k.rule({ x: left, y: 6.45, w: k.W - 2 * left });
  k.text(p.roles, { style: 'meta', x: left, y: 6.6, w: k.W - 2 * left, nowrap: true, chrome: true });
}

module.exports = { heading, row, pairing };
