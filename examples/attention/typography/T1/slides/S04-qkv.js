// S04 — 变换流程：it 的词向量经三个矩阵分出 Q / K / V。视觉中心：被点亮的 Q 一行（它要去“找”）。
// 逐行出现：Q → K → V。q / k / v 与 q-vec 同名，Morph 到 S05。
const { vector, frame } = require('../parts');

const ROLES = [
  { L: 'Q', name: 'q', en: 'Query', zh: '我在找：我指代的是谁？', seed: 3, lo: 0.45, hi: 1 },
  { L: 'K', name: 'k', en: 'Key', zh: '我的标签：代词、单数', seed: 7, lo: 0.08, hi: 0.45 },
  { L: 'V', name: 'v', en: 'Value', zh: '被关注时，我交出的内容', seed: 11, lo: 0.08, hi: 0.45 },
];

module.exports = {
  id: 'S04',
  rhythm: 'dense',
  title: 'Q K V',
  notes: '模型怎么“看”？每个词先派生出三个向量。以 it 为例：词向量分别乘以三个可学习的矩阵 W_Q、W_K、W_V。（单击 1：Query——它在找什么。单击 2：Key——它能被怎样找到。单击 3：Value——被关注时交出的内容。）',
  build(k) {
    frame(k, { section: '01', name: '按内容检索' });
    k.text('每个词同时扮演三个角色', { style: 'title', x: k.M.x, y: k.M.top, w: 8, nowrap: true });

    const rows = [2.35, 3.95, 5.55];
    const inY = rows[1];
    k.text('it', { style: 'word', size: 28, color: 'accent', x: k.M.x, y: inY - 0.8, w: 0.4, nowrap: true });
    const input = vector(k, { x: k.M.x, y: inY, seed: 1, lo: 0.2, hi: 0.7 });
    k.text('词向量', { style: 'caption', x: k.M.x + 0.5, y: inY - 0.6, w: 1.2, nowrap: true });

    const opX = k.col(5) - 0.1, outX = k.col(6) + 0.25, letterX = k.col(9) + 0.05, textX = k.col(10);
    k.light({ cx: outX + 1.6, cy: rows[0] + 0.12, r: 2.9 }); // the Query row
    ROLES.forEach((r, i) => {
      const y = rows[i], hot = i === 0, step = i + 1;
      k.line({ x1: input.right + 0.15, y1: input.cy, x2: opX - 0.12, y2: y + 0.12, color: hot ? 'accent' : 'stone', weight: hot ? 1.5 : 0.75, build: step });
      k.text([{ text: 'W' }, { text: r.L, subscript: true }], { style: 'math', color: hot ? 'accent' : 'graphite', x: opX, y: y - 0.12, w: 0.7, nowrap: true, build: step });
      k.line({ x1: opX + 0.62, y1: y + 0.12, x2: outX - 0.12, y2: y + 0.12, color: hot ? 'accent' : 'stone', weight: hot ? 1.5 : 0.75, arrow: 'end', build: step });
      vector(k, { x: outX, y, seed: r.seed, lo: r.lo, hi: r.hi, name: hot ? 'q-vec' : undefined, build: [step, 200] });
      k.text(r.L, { style: 'letter', color: hot ? 'accent' : 'ink', x: letterX, y: y - 0.42, w: 0.8, h: 1.05, name: r.name, overlap: true, nowrap: true, build: step });
      k.text([{ text: `${r.en}\n`, style: 'label' }, { text: r.zh, style: 'body', color: hot ? 'ink' : 'graphite' }], { x: textX, y: y - 0.2, w: k.W - k.M.x - textX, paraSpace: 2, build: step });
    });
  },
};
