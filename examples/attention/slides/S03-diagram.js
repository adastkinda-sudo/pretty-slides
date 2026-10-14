// S03 — 图解：同一句子上下两行，“it”（上）连向每个词（下），线宽编码注意力权重
const TOKENS = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
// Illustrative weights from "it" to each token (sum ≈ 1). Marked as illustrative on the slide.
const W = [0.02, 0.46, 0.03, 0.04, 0.02, 0.17, 0.03, 0.08, 0.04, 0.03, 0.08];
const IT = 7;
const { frame, leader } = require('../parts');

module.exports = {
  id: 'S03',
  rhythm: 'dense',
  title: 'it 指向谁',
  notes: '先让观众自己猜 it 指什么。然后指出：模型给 animal 的权重最高（0.46），street 次之（0.17）。权重为示意值。',
  build(k) {
    frame(k, { section: '01', name: '按内容检索' });
    k.text([
      { text: 'it', font: 'latin', color: 'accent' },
      { text: ' 把最多的注意力给了 ' },
      { text: 'animal', font: 'latin', color: 'accent' },
    ], { style: 'title', ...k.span(1, 9), y: k.M.top });

    // Lay the sentence out once, centred; reuse x positions for both rows.
    const size = 22, gapX = 0.32;
    const widthOf = (t) => [...t].reduce((s, ch) => s + (/[A-Z]/.test(ch) ? 0.66 : /[il.']/.test(ch) ? 0.3 : 0.56), 0) * size / 72;
    const ws = TOKENS.map(widthOf);
    const total = ws.reduce((a, b) => a + b, 0) + gapX * (TOKENS.length - 1);
    let x = (k.W - total) / 2;
    const xs = ws.map((w) => { const p = { x, w, cx: x + w / 2 }; x += w + gapX; return p; });

    const yTop = 2.2, yBot = 4.85, rowH = 0.62;
    const from = xs[IT];
    TOKENS.forEach((_, i) => {
      const strong = W[i] >= 0.15;
      k.line({ x1: from.cx, y1: yTop + rowH, x2: xs[i].cx, y2: yBot - 0.08, color: strong ? 'accent' : 'hairline', weight: 0.5 + W[i] * 10 });
    });
    k.text('it', { style: 'body', font: 'latin', size, color: 'ink', x: from.x - 0.05, y: yTop, w: from.w + 0.1, h: rowH, align: 'center', nowrap: true });
    TOKENS.forEach((t, i) => {
      const hot = W[i] >= 0.15;
      k.text(t, { style: 'body', font: 'latin', size, color: hot ? 'ink' : 'graphite', x: xs[i].x - 0.05, y: yBot, w: xs[i].w + 0.1, h: rowH, align: 'center', nowrap: true });
    });
    [[1, 'accent'], [5, 'graphite']].forEach(([i, c]) => {
      k.text(W[i].toFixed(2), { style: 'caption', font: 'latin', color: c, x: xs[i].x - 0.2, y: yBot + rowH, w: xs[i].w + 0.4, h: 0.26, align: 'center' });
    });

    // Flag annotation: a vertical leader (reads differently from the diagonal fan) dropping onto the it→animal line.
    const a = xs[1];
    const lx = a.cx + 0.9;
    const y1 = yTop + rowH, y2 = yBot - 0.08;
    const target = { x: lx, y: y2 + (y1 - y2) * ((lx - a.cx) / (from.cx - a.cx)) };
    k.text([{ text: '指代消解\n', style: 'label' }, { text: 'it 指的就是 animal', style: 'body' }], { x: lx + 0.12, y: 2.0, w: 2.4, paraSpace: 2 });
    leader(k, { from: { x: lx, y: 2.05 }, to: target });

    k.text('线宽 = 注意力权重（示意值）', { style: 'caption', x: k.M.x, y: k.H - k.M.bottom - 0.26, w: 4, h: 0.26 });
  },
};
