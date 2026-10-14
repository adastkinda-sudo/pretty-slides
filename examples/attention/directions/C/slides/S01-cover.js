// S01 — 封面：钴蓝色场，Q K V 三个巨大的字母从上方出血。符号本身就是主视觉。
module.exports = {
  id: 'S01',
  rhythm: 'anchor',
  title: '封面',
  transition: 'none',
  notes: '开场：今天只讲一个想法——注意力机制本质上是一次“按内容检索”。Q、K、V 是今天的三个主角。',
  build(k) {
    k.bg('field');
    const glyphs = [['Q', 'fieldText'], ['K', 'fieldMuted'], ['V', 'fieldMuted']];
    glyphs.forEach(([g, c], i) => {
      k.text(g, { style: 'glyph', color: c, x: k.col(1 + i * 4) - 0.12, y: -0.95, w: 4, h: 5.05, bleed: true, nowrap: true, overlap: true });
    });
    k.rule({ x: 0, y: 3.95, w: k.W, color: 'fieldMuted', weight: 0.75 });
    k.text('TECH TALK — 2026', { style: 'label', color: 'fieldMuted', x: k.M.x, y: 4.2, w: 4, nowrap: true });
    k.text('注意力，是一种检索', { style: 'display', color: 'fieldText', x: k.M.x, y: 4.65, w: 9, nowrap: true });
    k.text('从一个代词出发，理解 Transformer 的核心机制', { style: 'lead', color: 'fieldMuted', x: k.M.x, y: 5.8, w: 9, nowrap: true });
    k.text('Asteria', { style: 'caption', color: 'fieldMuted', x: k.M.x, y: k.H - k.M.bottom - 0.26, w: 3, h: 0.26, nowrap: true });
    k.text('机器学习读书会 · 第 7 期', { style: 'caption', color: 'fieldMuted', x: k.col(9), y: k.H - k.M.bottom - 0.26, w: k.span(9, 12).w, h: 0.26, align: 'right', nowrap: true });
  },
};
