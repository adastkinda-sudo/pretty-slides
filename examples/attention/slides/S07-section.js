// S07 — 章节页：深色转场，节奏上的“换气”
module.exports = {
  id: 'S07',
  rhythm: 'anchor',
  title: '章节：多头注意力',
  bg: 'night',
  notes: '进入第二部分：一组 Q/K/V 只能学到一种“相关”。多头 = 并行地问多个不同的问题。',
  build(k) {
    // The cover's attention matrix returns, larger and in night tones, bleeding off the right edge.
    const N = 14, cell = 0.44, gap = 0.07, pitch = cell + gap;
    const x0 = k.col(8), y0 = (k.H - (N * pitch - gap)) / 2;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const w = Math.min(1, Math.exp(-Math.abs(r - c) * 0.8) * 0.8 + ((r * 5 + c * 3) % 11 === 0 ? 0.45 : 0));
        const box = { x: x0 + c * pitch, y: y0 + r * pitch, w: cell, h: cell };
        if (box.x >= k.W) continue;
        box.w = Math.min(cell, k.W - box.x);
        k.rect({ ...box, fill: r === 8 && c === 3 ? 'accent' : k.mix('night', 'nightMuted', 0.08 + w * 0.42), bleed: true });
      }
    }
    k.text('02', { style: 'number', color: 'accent', x: k.M.x, y: 2.1, w: 3, overlap: true });
    k.text('多头注意力', { style: 'display', color: 'nightText', ...k.span(1, 8), y: 3.85, h: 1.25 });
    k.text('同时问多个问题', { style: 'lead', color: 'nightMuted', ...k.span(1, 8), y: 5.2 });
  },
};
