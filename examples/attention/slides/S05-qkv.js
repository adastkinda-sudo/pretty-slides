// S05 — 变换流程：一个词向量经三个投影矩阵，分出 Q / K / V 三个向量。主角是左→右的变换。
// Morph 到 S06：q / k / v 字母与 q-vec 向量条共享名字。
const { vector, frame, dim } = require('../parts');

const ROLES = [
  { L: 'Q', name: 'q', sub: 'Q', en: 'Query', zh: '我在找：我指代的是谁？', tone: 'accent', seed: 3 },
  { L: 'K', name: 'k', sub: 'K', en: 'Key', zh: '我的标签：代词、单数', tone: 'ink', seed: 7 },
  { L: 'V', name: 'v', sub: 'V', en: 'Value', zh: '被关注时，我交出的内容', tone: 'ink', seed: 11 },
];

module.exports = {
  id: 'S05',
  rhythm: 'dense',
  title: 'Q K V',
  notes: '以 it 为例：它的词向量分别乘以三个可学习的矩阵 W_Q、W_K、W_V，得到三个向量。Query 是“我在找什么”，Key 是“我能被怎样找到”，Value 是“被关注时交出去的内容”。三者长度相同，但承担的角色不同。',
  build(k) {
    frame(k, { section: '01', name: '按内容检索' });
    k.text('每个词同时扮演三个角色', { style: 'title', ...k.span(1, 8), y: k.M.top });

    // Input: the token and its embedding, vertically centred on the middle row.
    const rows = [2.35, 3.95, 5.55];
    const inY = rows[1];
    k.text('it', { style: 'body', font: 'latin', size: 26, color: 'ink', x: k.M.x, y: inY - 0.78, w: 0.35, nowrap: true });
    const input = vector(k, { x: k.M.x, y: inY, seed: 1, tone: 'graphite' });
    k.text('词向量 x', { style: 'caption', x: k.M.x + 0.42, y: inY - 0.6, w: 1.5, nowrap: true });
    dim(k, { x1: input.x, x2: input.right, y: inY + 0.4, label: 'd = 8（示意）' });

    const opX = k.col(5) - 0.1;     // projection labels
    const outX = k.col(6) + 0.25;   // output strips
    const letterX = k.col(9) + 0.05;
    const textX = k.col(10);

    ROLES.forEach((r, i) => {
      const y = rows[i];
      const hot = r.tone === 'accent';
      // input → projection
      k.line({ x1: input.right + 0.15, y1: input.cy, x2: opX - 0.12, y2: y + 0.12, color: hot ? 'accent' : 'hairline', weight: hot ? 1.5 : 0.75 });
      k.text([{ text: 'W' }, { text: r.sub, subscript: true }], { style: 'math', size: 22, color: hot ? 'accent' : 'graphite', x: opX, y: y - 0.12, w: 0.7, nowrap: true });
      // projection → output vector
      k.line({ x1: opX + 0.62, y1: y + 0.12, x2: outX - 0.12, y2: y + 0.12, color: hot ? 'accent' : 'hairline', weight: hot ? 1.5 : 0.75, arrow: 'end' });
      const ov = vector(k, { x: outX, y, seed: r.seed, tone: r.tone, name: hot ? 'q-vec' : undefined });
      if (i === 2) dim(k, { x1: ov.x, x2: ov.right, y: y + 0.4, label: 'd = 8，与输入同长' });
      // role
      k.text(r.L, { style: 'number', font: 'serif', size: 60, color: hot ? 'accent' : 'ink', x: letterX, y: y - 0.42, w: 0.8, h: 1.05, name: r.name, overlap: true });
      k.text([{ text: `${r.en}\n`, style: 'label' }, { text: r.zh, style: 'body' }], { x: textX, y: y - 0.2, w: k.W - k.M.x - textX, paraSpace: 2 });
    });

    k.text('三个矩阵在训练中学得；同一个词，三种用途', { style: 'caption', x: k.M.x, y: k.H - k.M.bottom - 0.26, w: 5, h: 0.26, nowrap: true });
  },
};
