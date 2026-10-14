// S07 — 章节：02 多头注意力。同一间暗室里，一束光分成四束：四张小矩阵，各自照亮不同的规律。
// 视觉中心：四个头。与整套同一个世界，靠更大的尺度和更多的光来“换气”，不换底色。
const { matrix, room } = require('../parts');

const HEADS = [
  { name: '指代', f: (r, c) => (r === 6 && c === 1 ? 1 : Math.exp(-Math.abs(r - c) * 2) * 0.3) },
  { name: '相邻', f: (r, c) => (c === r - 1 ? 0.85 : c === r ? 0.35 : 0.06) },
  { name: '句首', f: (r, c) => (c === 0 ? 0.75 - r * 0.04 : 0.08) },
  { name: '自身', f: (r, c) => (r === c ? 0.8 : 0.1 + ((r * 3 + c * 5) % 7) * 0.02) },
];

module.exports = {
  id: 'S07',
  rhythm: 'anchor',
  title: '章节：多头注意力',
  notes: '第二部分：一组 Q/K/V 只能学到一种“相关”。多头注意力并行地问多个问题——有的头专门找指代，有的看相邻的词，有的盯着句首。',
  build(k) {
    room(k, 'right');
    k.text('02', { style: 'number', x: k.M.x, y: 2.0, w: 3, overlap: true, nowrap: true });
    k.text('多头注意力', { style: 'display', x: k.M.x, y: 3.6, w: 5.5, h: 1.25, nowrap: true });
    k.text('同时问多个问题', { style: 'lead', color: 'stone', x: k.M.x, y: 4.95, w: 5, nowrap: true });

    const n = 8, cell = 0.21, gap = 0.04, size = n * (cell + gap) - gap;
    const x0 = 6.9, y0 = 1.45, gx = 0.55, gy = 0.75;
    HEADS.forEach((h, i) => {
      const x = x0 + (i % 2) * (size + gx), y = y0 + Math.floor(i / 2) * (size + gy);
      matrix(k, { x, y, n, cell, gap, weight: h.f, build: [1, i * 250] });
      k.text([{ text: `头 ${i + 1}`, color: 'graphite' }, { text: `   ${h.name}`, color: 'stone' }], { style: 'caption', x, y: y + size + 0.12, w: size, nowrap: true, build: [1, i * 250] });
    });
  },
};
