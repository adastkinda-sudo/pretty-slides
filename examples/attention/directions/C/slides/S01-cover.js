// S01 — 封面：钴蓝色场上画出 QKᵀ 这一次运算。Q 是一列，Kᵀ 是一行，相乘得到注意力矩阵；
// 最亮的格子是 it → animal。符号仍然是主角，但每个符号都指向它所代表的东西。
const TOKENS = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
const N = TOKENS.length;
function weight(r, c) {
  if (r === 7 && c === 1) return 1;
  if (r === 7 && c === 5) return 0.6;
  const local = Math.exp(-Math.abs(r - c) * 1.1) * 0.5;
  const s = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
  return Math.min(0.7, local + (s - Math.floor(s)) * 0.15);
}
const tone = (s) => { const v = Math.sin(s * 12.9898) * 43758.5453; return v - Math.floor(v); };

module.exports = {
  id: 'S01',
  rhythm: 'anchor',
  title: '封面',
  transition: 'none',
  notes: '开场：今天只讲一个想法——注意力机制本质上是一次“按内容检索”。右侧就是那次检索：每个词的 Query 与每个词的 Key 相乘，得到一张匹配度矩阵；最亮的一格是 it 找到了 animal。',
  build(k) {
    k.bg('field');
    const cell = 0.36, gap = 0.05, pitch = cell + gap;
    const gx = k.W - k.M.x - N * pitch + gap;            // matrix
    const gy = 1.95;
    const qx = gx - 0.75;                                // Q column
    const ky = gy - 0.75;                                // Kᵀ row
    const cool = (t) => k.mix('field', 'fieldText', t);

    for (let i = 0; i < N; i++) {
      k.rect({ x: qx, y: gy + i * pitch, w: cell, h: cell, fill: i === 7 ? 'accent' : cool(0.25 + tone(i + 1) * 0.5) });
      k.rect({ x: gx + i * pitch, y: ky, w: cell, h: cell, fill: i === 1 ? 'accent' : cool(0.25 + tone(i + 31) * 0.5) });
      for (let j = 0; j < N; j++) {
        const w = weight(i, j);
        k.rect({ x: gx + j * pitch, y: gy + i * pitch, w: cell, h: cell, fill: w === 1 ? 'fieldText' : cool(0.08 + w * 0.55) });
      }
    }
    // the operator's symbols, at the size of a heading rather than a wall
    k.text('Q', { style: 'letter', size: 64, color: 'fieldText', x: qx - 0.05, y: ky - 0.35, w: 0.7, h: 1.1, nowrap: true, overlap: true });
    k.text('K', { style: 'letter', size: 64, color: 'fieldText', x: gx + N * pitch - gap - 1.05, y: ky - 1.15, w: 0.8, h: 1.1, align: 'right', nowrap: true, overlap: true });
    k.text('T', { style: 'letter', size: 28, color: 'fieldText', x: gx + N * pitch - gap - 0.24, y: ky - 1.08, w: 0.3, h: 0.5, nowrap: true, overlap: true });
    k.text('it', { style: 'caption', font: 'latin', color: 'fieldText', x: qx - 0.5, y: gy + 7 * pitch + 0.08, w: 0.4, align: 'right', nowrap: true });
    k.text('animal', { style: 'caption', font: 'latin', color: 'fieldText', x: gx + pitch - 0.35, y: ky - 0.3, w: 1.1, align: 'center', nowrap: true });
    k.text('每一格：一个词对另一个词的匹配度', { style: 'caption', color: 'fieldMuted', x: gx, y: gy + N * pitch + 0.1, w: N * pitch, nowrap: true });

    // type block, left
    k.text('TECH TALK — 2026', { style: 'label', color: 'fieldMuted', x: k.M.x, y: k.M.top + 0.1, w: 4, nowrap: true });
    k.text('注意力，\n是一种检索', { style: 'display', size: 60, color: 'fieldText', x: k.M.x, y: 2.35, w: 5.2, nowrap: true });
    k.text('从一个代词出发，\n理解 Transformer 的核心机制', { style: 'lead', color: 'fieldMuted', x: k.M.x, y: 4.75, w: 5.2, nowrap: true });
    k.rule({ x: k.M.x, y: k.H - k.M.bottom - 0.45, w: 5.2, color: 'fieldMuted', weight: 0.75 });
    k.text('Asteria  ·  机器学习读书会 第 7 期', { style: 'caption', color: 'fieldMuted', x: k.M.x, y: k.H - k.M.bottom - 0.3, w: 5.2, h: 0.26, nowrap: true });
  },
};
