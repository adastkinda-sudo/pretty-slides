// S01 — 封面 ★：暗室里一张注意力矩阵是唯一的光源；最亮的一格是 it → animal。视觉中心：那一格。
const { TOKENS, IT, heat, room } = require('../parts');

function weight(r, c) {
  if (r === IT && c === 1) return 1;                      // it → animal
  if (r === IT && c === 5) return 0.62;                   // it → street
  const local = Math.exp(-Math.abs(r - c) * 1.1) * 0.55;
  const s = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
  return Math.min(0.85, local + (s - Math.floor(s)) * 0.18);
}

module.exports = {
  id: 'S01',
  rhythm: 'anchor',
  title: '封面',
  transition: 'none',
  notes: '开场：今天只讲一个想法——注意力机制本质上是一次“按内容检索”。右侧是例句的注意力矩阵（示意），最亮的格子是 it 看向 animal。',
  build(k) {
    room(k, 'cover');
    const N = TOKENS.length, cell = 0.5, gap = 0.06, pitch = cell + gap;
    const x0 = k.W - 0.55 - N * pitch + gap, y0 = (k.H - (N * pitch - gap)) / 2;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) k.rect({ x: x0 + c * pitch, y: y0 + r * pitch, w: cell, h: cell, fill: heat(k, weight(r, c)) });
      k.text(TOKENS[r], { style: 'caption', font: 'latin', color: r === IT ? 'accent' : 'stone', x: x0 - 1.1, y: y0 + r * pitch + 0.12, w: 1.0, align: 'right', nowrap: true });
    }

    k.text('TECH TALK  ·  2026', { style: 'label', color: 'accent', x: k.M.x, y: k.M.top, w: 4, nowrap: true });
    k.text('注意力，\n是一种检索', { style: 'display', x: k.M.x, y: 2.3, w: 4.4, nowrap: true });
    k.text('从一个代词出发，\n理解 Transformer 的核心机制', { style: 'lead', x: k.M.x, y: 4.95, w: 4.4, nowrap: true });
    k.text('Asteria  ·  机器学习读书会 第 7 期', { style: 'caption', x: k.M.x, y: k.H - k.M.bottom - 0.26, w: 4.4, h: 0.26, nowrap: true });
  },
};
