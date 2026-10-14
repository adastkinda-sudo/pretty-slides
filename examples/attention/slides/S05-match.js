// S05 — 匹配 ★：it 的 Q 依次与各词的 K 比较，得分经 softmax 变成权重；权重按亮度点亮，最亮的是 animal。
// 视觉中心：0.46 那根最亮的权重条。Morph 自 S04（q / k / v / q-vec 同名）。权重与 S03 一致（节选）。
const { vector, heat, room, frame } = require('../parts');

const KEYS = [
  { t: 'The', w: 0.02, seed: 21 },
  { t: 'animal', w: 0.46, seed: 22 },
  { t: 'cross', w: 0.04, seed: 23 },
  { t: 'street', w: 0.17, seed: 24 },
  { t: 'tired', w: 0.08, seed: 25 },
];

module.exports = {
  id: 'S05',
  rhythm: 'dense',
  title: 'Q 与 K 匹配',
  transition: 'morph',
  notes: 'it 的 Query 依次与每个词的 Key 做点积，得到匹配分数（单击 1）；softmax 把分数变成权重——animal 最亮，0.46（单击 2）；最后按权重把各词的 Value 加权求和，得到 it 的新表示（单击 3）。图中只列出 5 个词，权重为示意值。',
  build(k) {
    room(k, 'right');
    frame(k, { section: '01', name: '按内容检索' });
    k.text('匹配度，决定从每个词取多少', { style: 'title', x: k.M.x, y: k.M.top, w: 9, nowrap: true });

    const top = 2.35, pitch = 0.66;
    const rowsY = KEYS.map((_, i) => top + i * pitch);
    const midY = rowsY[2] + 0.12;

    // ① it's query
    k.text('Q', { style: 'letter', color: 'accent', x: k.M.x, y: midY - 1.3, w: 0.8, h: 1.05, name: 'q', overlap: true, nowrap: true });
    k.text('it 的 Query', { style: 'label', x: k.M.x + 0.75, y: midY - 0.8, w: 1.6, nowrap: true });
    const q = vector(k, { x: k.M.x, y: midY - 0.12, seed: 3, lo: 0.45, hi: 1, name: 'q-vec' });

    // ② keys
    const wordX = k.col(4) - 0.15, keyX = k.col(5) + 0.15;
    k.text('K', { style: 'letter', size: 40, x: keyX, y: top - 1.0, w: 0.6, h: 0.75, name: 'k', overlap: true, nowrap: true });
    k.text('各词的 Key', { style: 'label', x: keyX + 0.55, y: top - 0.62, w: 1.6, nowrap: true });
    let keyRight = 0;
    KEYS.forEach((r, i) => {
      const y = rowsY[i], lit = r.w >= 0.4;
      k.line({ x1: q.right + 0.15, y1: q.cy, x2: wordX - 0.1, y2: y + 0.12, color: lit ? 'accent' : 'hairline', weight: lit ? 1.5 : 0.75, build: [1, i * 90] });
      k.text(r.t, { style: 'word', size: 17, color: lit ? 'hot' : 'stone', x: wordX, y: y - 0.04, w: 0.95, align: 'right', nowrap: true });
      const kv = vector(k, { x: keyX, y, cell: 0.2, gap: 0.035, seed: r.seed, lo: 0.05, hi: 0.4, build: [1, i * 90] });
      keyRight = kv.right;
    });

    // ③ softmax weights — the light
    const barX = keyRight + 0.5, barMax = 2.7;
    k.text('softmax 权重', { style: 'label', x: barX, y: top - 0.62, w: 2, nowrap: true });
    KEYS.forEach((r, i) => {
      const y = rowsY[i], lit = r.w >= 0.4, bw = Math.max(0.05, (r.w / 0.5) * barMax);
      const b = [2, lit ? 700 : i * 120];
      k.rect({ x: barX, y: y + 0.03, w: bw, h: 0.18, fill: heat(k, 0.2 + r.w * 1.75), build: b });
      k.text(r.w.toFixed(2), { style: 'caption', font: 'latin', color: lit ? 'hot' : 'stone', x: barX + bw + 0.12, y: y - 0.01, w: 0.6, nowrap: true, build: b });
    });

    // ④ weighted sum of values → it's new representation
    const vX = k.col(11) - 0.1;
    k.text('V', { style: 'letter', size: 40, color: 'graphite', x: vX, y: top - 1.0, w: 0.6, h: 0.75, name: 'v', overlap: true, nowrap: true });
    k.text('加权求和', { style: 'label', x: vX + 0.55, y: top - 0.62, w: 1.1, nowrap: true });
    const out = vector(k, { x: vX, y: midY - 0.12, cell: 0.18, gap: 0.035, seed: 22, lo: 0.3, hi: 0.95, build: [3, 0] });
    k.text('it 的新表示\n以 animal 为主', { style: 'caption', x: vX, y: midY + 0.25, w: out.w + 0.2, build: 3 });

    k.text('softmax( QKᵀ / √dₖ ) V', { style: 'math', size: 20, x: k.M.x, y: 6.3, w: 4, nowrap: true, build: 3 });
  },
};
