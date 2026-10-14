// S05 — 总线图：it 的词向量沿一条竖直总线分发给三个矩阵；每行是一个角色。巨大的字母是行的锚点。
const { vector, frame } = require('../parts');

const ROWS = [
  { L: 'Q', sub: 'Q', en: 'QUERY', zh: '我在找：我指代的是谁？', tone: 'accent', seed: 3 },
  { L: 'K', sub: 'K', en: 'KEY', zh: '我的标签：代词、单数', tone: 'ink', seed: 7 },
  { L: 'V', sub: 'V', en: 'VALUE', zh: '被关注时，我交出的内容', tone: 'ink', seed: 11 },
];

module.exports = {
  id: 'S05',
  rhythm: 'dense',
  title: 'Q K V',
  notes: '以 it 为例：它的词向量分别乘以三个可学习的矩阵 W_Q、W_K、W_V，得到三个同样长度的向量，各自承担一个角色。',
  build(k) {
    frame(k, { section: '01', name: '按内容检索', page: { index: 5, total: 7 } });
    k.text('每个词同时扮演三个角色', { style: 'title', ...k.span(1, 8), y: k.M.top + 0.15 });

    const vx = k.col(5) - 0.3, cell = 0.3, gap = 0.05;
    // input band
    const inY = 1.85;
    k.text('it', { style: 'letter', size: 40, x: k.M.x, y: inY - 0.22, w: 1, h: 0.75, nowrap: true, overlap: true });
    k.text('词向量 x', { style: 'caption', x: k.col(2) + 0.2, y: inY + 0.02, w: 1.5, nowrap: true });
    const input = vector(k, { x: vx, y: inY, cell, gap, seed: 1, tone: 'ink', min: 0.15, max: 0.75 });

    // rows separated by full-width rules
    const rowTop = [2.6, 3.95, 5.3], rowH = 1.35;
    k.rule({ x: k.M.x, y: rowTop[0], w: k.W - 2 * k.M.x, color: 'ink', weight: 1 });
    const busX = vx - 0.4;
    k.line({ x1: input.x - 0.08, y1: input.cy, x2: busX, y2: input.cy, color: 'ink', weight: 1 });
    k.line({ x1: busX, y1: input.cy, x2: busX, y2: rowTop[2] + rowH / 2, color: 'ink', weight: 1 });

    ROWS.forEach((r, i) => {
      const top = rowTop[i], cy = top + rowH / 2, hot = r.tone === 'accent';
      k.text(r.L, { style: 'letter', color: hot ? 'accent' : 'ink', x: k.M.x - 0.06, y: cy - 0.72, w: 1.4, h: 1.7, nowrap: true, overlap: true });
      k.text([{ text: 'W' }, { text: r.sub, subscript: true }], { style: 'math', color: 'graphite', x: busX - 0.75, y: cy - 0.42, w: 0.6, nowrap: true });
      k.line({ x1: busX, y1: cy, x2: vx - 0.08, y2: cy, color: hot ? 'accent' : 'ink', weight: hot ? 2 : 1, arrow: 'end' });
      vector(k, { x: vx, y: cy - cell / 2, cell, gap, seed: r.seed, tone: r.tone, min: 0.2, max: hot ? 1 : 0.75 });
      k.text([{ text: `${r.en}\n`, style: 'label', color: hot ? 'accent' : 'stone' }, { text: r.zh, style: 'body', color: 'ink' }], { x: k.col(9), y: cy - 0.32, w: k.W - k.M.x - k.col(9), paraSpace: 3 });
      k.rule({ x: k.M.x, y: top + rowH, w: k.W - 2 * k.M.x, color: i === 2 ? 'ink' : 'hairline', weight: i === 2 ? 1 : 0.75 });
    });
  },
};
