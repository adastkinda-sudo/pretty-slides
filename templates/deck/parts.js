// Deck-local building blocks: the structure layer (generic) + this deck's visual motif (write your own).
// Every structure element carries information — where we are, how big, what points where. Nothing here is decoration.
// Reference implementation: examples/attention/parts.js.

// Navigation frame for content pages: running head (top right), progress cells (bottom left), folio (bottom right).
// Done pages = graphite, current = accent, ahead = hairline. Replace the progress cells with the deck motif if it has one.
function frame(k, { section, name, ink = 'stone' }) {
  const { index, total } = k.page;
  const right = k.W - k.M.x;
  k.text([{ text: section, font: 'latin' }, { text: `   ${name}` }], { style: 'label', color: ink, x: right - 4, y: 0.4, w: 4, align: 'right', nowrap: true, chrome: true });
  const cell = 0.085, gap = 0.05, y = k.H - 0.42;
  for (let i = 1; i <= total; i++) {
    const fill = i < index ? 'graphite' : i === index ? 'accent' : 'hairline';
    k.rect({ x: k.M.x + (i - 1) * (cell + gap), y, w: cell, h: cell, fill });
  }
  const pad = (n) => String(n).padStart(2, '0');
  k.text(`${pad(index)} / ${pad(total)}`, { style: 'caption', font: 'latin', color: ink, x: right - 1.2, y: y - 0.055, w: 1.2, align: 'right', nowrap: true, chrome: true });
}

// Dimension line (engineering-drawing style): a hairline with end ticks spanning x1→x2, label centred below.
function dim(k, { x1, x2, y, label, color = 'stone' }) {
  k.line({ x1, y1: y, x2, y2: y, color, weight: 0.5 });
  k.line({ x1, y1: y - 0.06, x2: x1, y2: y + 0.06, color, weight: 0.5 });
  k.line({ x1: x2, y1: y - 0.06, x2, y2: y + 0.06, color, weight: 0.5 });
  k.text(label, { style: 'caption', font: 'latin', color, x: (x1 + x2) / 2 - 1, y: y + 0.08, w: 2, align: 'center', nowrap: true });
}

// Leader: from an annotation anchor to a target point, ending in a small dot on the target.
// Make it read differently from the diagram's own lines (e.g. vertical when the diagram is diagonal).
function leader(k, { from, to, color = 'graphite', dot = 'accent' }) {
  k.line({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color, weight: 0.5 });
  k.dot({ cx: to.x, cy: to.y, r: 0.045, fill: dot });
}

// Deterministic pseudo-random values in [0, 1) — stable renders for illustrative data.
function values(seed, n) {
  return Array.from({ length: n }, (_, i) => {
    const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return s - Math.floor(s);
  });
}

// ── This deck's motif ── (one recurring visual element, drawn from the content; see design.md「母题」)
// function motif(k, { ... }) { ... }

module.exports = { frame, dim, leader, values };
