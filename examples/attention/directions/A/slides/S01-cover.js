// S01 — 封面：左侧排版；右侧一张出血的注意力矩阵，主视觉即主题本身
const N = 11;
// Deterministic illustrative weights: local attention + a few long-range links; row 7 ("it") → col 1 ("animal") is the hero cell.
function weight(r, c) {
  const local = Math.exp(-Math.abs(r - c) * 0.9);
  const longRange = (r * 7 + c * 3) % 11 === 0 ? 0.55 : 0;
  return Math.min(1, local * 0.85 + longRange);
}

module.exports = {
  id: 'S01',
  rhythm: 'anchor',
  title: '封面',
  transition: 'none',
  notes: '开场：今天只讲一个想法——注意力机制本质上是一次“按内容检索”。右侧是一张注意力矩阵（示意）。',
  build(k) {
    const cell = 0.5, gap = 0.07, pitch = cell + gap;
    const x0 = k.col(8) + 0.2, y0 = (k.H - (N * pitch - gap)) / 2;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const hero = r === 7 && c === 1;
        const fill = hero ? 'accent' : k.mix('paperDeep', 'ink', weight(r, c) * 0.85);
        const box = { x: x0 + c * pitch, y: y0 + r * pitch, w: cell, h: cell };
        if (box.x + box.w > k.W) { box.w = k.W - box.x; if (box.w <= 0.02) continue; }
        k.rect({ ...box, fill, bleed: true });
      }
    }

    k.text('TECH TALK  ·  2026', { style: 'label', x: k.M.x, y: k.M.top, w: 4 });
    k.text('注意力，\n是一种检索', { style: 'display', ...k.span(1, 7), y: 2.0, name: 'title' });
    k.text('从一个代词出发，\n理解 Transformer 的核心机制', { style: 'lead', ...k.span(1, 6), y: 4.65 });

    const footY = k.H - k.M.bottom - 0.26;
    k.rule({ ...k.span(1, 6), y: footY - 0.18 });
    k.text('Asteria', { style: 'caption', ...k.span(1, 3), y: footY, h: 0.26 });
    k.text('机器学习读书会 · 第 7 期', { style: 'caption', ...k.span(4, 6), y: footY, h: 0.26, align: 'right' });
  },
};
