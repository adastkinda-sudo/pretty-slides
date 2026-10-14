// Deck-local building blocks.
// Motif: the vector strip / matrix cell. Structure layer: running head + progress cells + folio,
// dimension lines and leaders — every element carries information (where we are, how big, what points where).

// Deterministic pseudo-random values in [0, 1) so renders are stable between builds.
function values(seed, n) {
  return Array.from({ length: n }, (_, i) => {
    const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return s - Math.floor(s);
  });
}

// A row of n square cells whose tone encodes value. `name` gives each cell a stable Morph name.
function vector(k, { x, y, n = 8, cell = 0.24, gap = 0.04, seed = 1, tone = 'ink', light = 'paperDeep', min = 0.15, max = 0.8, name }) {
  values(seed, n).forEach((v, i) => {
    k.rect({ x: x + i * (cell + gap), y, w: cell, h: cell, fill: k.mix(light, tone, min + v * (max - min)), name: name && `${name}-${i}` });
  });
  return { x, y, w: n * cell + (n - 1) * gap, h: cell, right: x + n * cell + (n - 1) * gap, cy: y + cell / 2 };
}

// Navigation frame for content pages: running head (top right), progress cells (bottom left), folio (bottom right).
// The progress cells reuse the deck motif: done = graphite, current = accent, ahead = hairline.
// `page` overrides the position, e.g. { index: 5, total: 7 } for a probe deck that holds only a few pages.
function frame(k, { section, name, ink = 'stone', page }) {
  const { index, total } = page || k.page;
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
  const w = 2;
  k.text(label, { style: 'caption', font: 'latin', color, x: (x1 + x2) / 2 - w / 2, y: y + 0.08, w, align: 'center', nowrap: true });
}

// Leader: from an annotation anchor to a target point, ending in a small dot on the target.
function leader(k, { from, to, color = 'graphite', dot = 'accent' }) {
  k.line({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color, weight: 0.5 });
  k.dot({ cx: to.x, cy: to.y, r: 0.045, fill: dot });
}

// Heat ramp: cold cell → ember → amber → hot. t in [0, 1].
function heat(k, t) {
  const stops = [['paperDeep', 0], ['ember', 0.35], ['accent', 0.75], ['hot', 1]];
  for (let i = 1; i < stops.length; i++) {
    const [c0, p0] = stops[i - 1], [c1, p1] = stops[i];
    if (t <= p1) return k.mix(c0, c1, (t - p0) / (p1 - p0));
  }
  return k.color('hot');
}

module.exports = { values, vector, frame, dim, leader, heat };
