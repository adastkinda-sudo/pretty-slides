// S06 — 代价：每个词都要看每个词，矩阵是 n × n。长度翻倍，格子变为四倍。视觉中心：最大的那张矩阵。
// 逐步出现：4×4 → 8×8 → 16×16，每次一个 ×4。格子数量是准确的（16、64、256）。
const { matrix, frame, dim } = require('../parts');

const pattern = (n) => (r, c) => {
  const local = Math.exp(-Math.abs(r - c) * (6 / n)) * 0.75;
  const s = Math.sin(r * 12.9898 + c * 78.233 + n) * 43758.5453;
  return Math.min(0.95, local + (s - Math.floor(s)) * 0.15);
};

module.exports = {
  id: 'S06',
  rhythm: 'dense',
  title: '平方代价',
  notes: '代价在这里：每个词都要看每个词，所以注意力矩阵是 n × n。（单击 1：长度从 4 到 8，格子从 16 到 64。单击 2：到 16，格子 256。）长度每翻一倍，计算量和显存约变为四倍——这也是长文本昂贵的根本原因。',
  build(k) {
    frame(k, { section: '01', name: '按内容检索' });
    k.text([{ text: '长度翻倍，代价变为' }, { text: '四倍', color: 'accent' }], { style: 'title', x: k.M.x, y: k.M.top, w: 9, nowrap: true });

    const pitch = 0.205, gap = 0.035, cell = pitch - gap;
    const baseY = 5.75; // shared baseline: matrices sit on it
    const specs = [{ n: 4, x: k.M.x + 0.3 }, { n: 8, x: 3.35 }, { n: 16, x: 6.7 }];
    const big = 16 * pitch - gap;
    k.light({ cx: specs[2].x + big / 2, cy: baseY - big / 2, rx: 3.6, ry: 3.1 }); // the largest matrix
    let prev;
    specs.forEach((s, i) => {
      const size = s.n * pitch - gap;
      const m = matrix(k, { x: s.x, y: baseY - size, n: s.n, cell, gap, weight: pattern(s.n), build: i ? [i, 25] : undefined });
      k.text([{ text: `n = ${s.n}`, font: 'latin', color: i === 2 ? 'ink' : 'graphite' }, { text: `   ${s.n * s.n} 格`, color: 'stone' }],
        { style: 'caption', x: s.x, y: baseY + 0.18, w: 1.6, nowrap: true, build: i || undefined });
      if (prev) {
        const ax1 = prev.right + 0.2, ax2 = m.x - 0.2, ay = baseY - 0.5;
        k.line({ x1: ax1, y1: ay, x2: ax2, y2: ay, color: 'accent', weight: 1, arrow: 'end', build: i });
        k.text('×4', { style: 'word', font: 'latinLight', size: 22, color: 'accent', x: (ax1 + ax2) / 2 - 0.4, y: ay - 0.45, w: 0.8, align: 'center', nowrap: true, build: i });
      }
      prev = m;
    });
    dim(k, { x1: specs[2].x, x2: specs[2].x + 16 * pitch - gap, y: baseY - 16 * pitch - 0.15, label: 'n = 16 个词', build: 2 });
  },
};
