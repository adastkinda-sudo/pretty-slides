// Deck-local building blocks for "暗室之光".
// Motif: cells and links whose brightness is attention. Structure layer: navigation frame, leaders, dimension lines.

// The running example and its (illustrative) attention from "it".
const TOKENS = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
const IT = 7;
const WEIGHTS = [0.02, 0.46, 0.03, 0.04, 0.02, 0.17, 0.03, 0.08, 0.04, 0.03, 0.08];

// Deterministic pseudo-random values in [0, 1).
function values(seed, n) {
  return Array.from({ length: n }, (_, i) => {
    const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return s - Math.floor(s);
  });
}

// Heat ramp: unlit cell → ember → amber → hot. t in [0, 1]. Brightness = attention.
function heat(k, t) {
  const stops = [['paperDeep', 0], ['ember', 0.35], ['accent', 0.75], ['hot', 1]];
  const v = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    const [c0, p0] = stops[i - 1], [c1, p1] = stops[i];
    if (v <= p1) return k.mix(c0, c1, (v - p0) / (p1 - p0));
  }
  return k.color('hot');
}

// A row of n cells (a vector), brightness from heat(). build = [step, delay] staggers the cells.
function vector(k, { x, y, n = 8, cell = 0.24, gap = 0.04, seed = 1, lo = 0.1, hi = 0.6, name, build }) {
  values(seed, n).forEach((v, i) => {
    const b = Array.isArray(build) ? [build[0], build[1] + i * 40] : build;
    k.rect({ x: x + i * (cell + gap), y, w: cell, h: cell, fill: heat(k, lo + v * (hi - lo)), name: name && `${name}-${i}`, build: b });
  });
  return { x, y, w: n * cell + (n - 1) * gap, h: cell, right: x + n * cell + (n - 1) * gap, cy: y + cell / 2 };
}

// An n×n attention matrix; weight(r, c) in [0, 1].
// build = [step, delayPerRow = 0, startDelay = 0] (ms): reveals it row by row, starting after startDelay.
function matrix(k, { x, y, n, cell, gap, weight, build }) {
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      k.rect({ x: x + c * (cell + gap), y: y + r * (cell + gap), w: cell, h: cell, fill: heat(k, weight(r, c)),
        build: build && [build[0], (build[2] || 0) + r * (build[1] || 0)] });
    }
  }
  const size = n * cell + (n - 1) * gap;
  return { x, y, w: size, h: size, right: x + size, bottom: y + size };
}

// Lay the example sentence out on one line, centred, as a monospaced prompt; returns x/width/centre per token.
function sentence(k, { size = 20, gap = 0.26 } = {}) {
  const ws = TOKENS.map((t) => t.length * 0.55 * size / 72); // Consolas advance = 0.55 em
  const total = ws.reduce((a, b) => a + b, 0) + gap * (TOKENS.length - 1);
  let x = (k.W - total) / 2 + 0.275; // centre the prompt mark + sentence together
  return ws.map((w) => { const p = { x, w, cx: x + w / 2 }; x += w + gap; return p; });
}

// Prompt chrome around the sentence: a prompt mark before it and (optionally) a cursor after it.
// Shared Morph names keep them in place across pages. cursorBuild lets the cursor appear when typing ends.
function prompt(k, xs, y, { cursor = false, cursorBuild } = {}) {
  k.text('›', { style: 'word', color: 'accent', x: xs[0].x - 0.55, y, w: 0.3, h: 0.5, nowrap: true, name: 'prompt-mark' });
  if (cursor) {
    const last = xs[xs.length - 1];
    k.rect({ x: last.x + last.w + 0.14, y: y + 0.05, w: 0.12, h: 0.36, fill: 'accent', name: 'prompt-cursor', build: cursorBuild });
  }
}

// Navigation frame for content pages: running head (top right), progress cells (bottom left), folio (bottom right).
// `page` overrides the position, e.g. { index: 5, total: 7 } for a probe deck that holds only a few pages.
function frame(k, { section, name, ink = 'stone', page }) {
  const { index, total } = page || k.page;
  const right = k.W - k.M.x;
  k.text([{ text: section, font: 'label' }, { text: `   ${name}` }], { style: 'label', color: ink, x: right - 4, y: 0.4, w: 4, align: 'right', nowrap: true, chrome: true });
  const cell = 0.085, gap = 0.05, y = k.H - 0.42;
  for (let i = 1; i <= total; i++) {
    const fill = i < index ? 'stone' : i === index ? 'accent' : 'hairline';
    k.rect({ x: k.M.x + (i - 1) * (cell + gap), y, w: cell, h: cell, fill });
  }
  const pad = (n) => String(n).padStart(2, '0');
  k.text(`${pad(index)} / ${pad(total)}`, { style: 'caption', font: 'label', color: ink, x: right - 1.2, y: y - 0.055, w: 1.2, align: 'right', nowrap: true, chrome: true });
}

// Dimension line (engineering-drawing style). The label goes below the line, or above it when what is measured
// lies below (side: 'above').
function dim(k, { x1, x2, y, label, color = 'stone', side = 'below', build }) {
  k.line({ x1, y1: y, x2, y2: y, color, weight: 0.5, build });
  k.line({ x1, y1: y - 0.06, x2: x1, y2: y + 0.06, color, weight: 0.5, build });
  k.line({ x1: x2, y1: y - 0.06, x2, y2: y + 0.06, color, weight: 0.5, build });
  k.text(label, { style: 'caption', font: 'label', color, x: (x1 + x2) / 2 - 1, y: side === 'above' ? y - 0.3 : y + 0.08, w: 2, align: 'center', nowrap: true, build });
}

// Leader: a thin line from an annotation to its target, ending in a small lit dot.
function leader(k, { from, to, color = 'stone', dot = 'accent', build }) {
  k.line({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color, weight: 0.5, build });
  k.dot({ cx: to.x, cy: to.y, r: 0.05, fill: dot, build });
}

module.exports = { TOKENS, IT, WEIGHTS, values, heat, vector, matrix, sentence, prompt, frame, dim, leader };
