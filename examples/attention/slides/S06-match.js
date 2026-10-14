// S06 — 匹配：it 的 Q 与各词的 K 做点积 → softmax 权重 → 按权重取 V。主角是中间的权重条。
// 从 S05 Morph 而来：q / k / v 字母与 q-vec 向量条同名。权重与 S03 一致（节选）。
const { vector, frame } = require('../parts');

const KEYS = [
  { t: 'The', w: 0.02, seed: 21 },
  { t: 'animal', w: 0.46, seed: 22 },
  { t: 'cross', w: 0.04, seed: 23 },
  { t: 'street', w: 0.17, seed: 24 },
  { t: 'tired', w: 0.08, seed: 25 },
];

module.exports = {
  id: 'S06',
  rhythm: 'dense',
  title: 'Q 与 K 匹配',
  transition: 'morph',
  notes: 'it 的 Query 依次与每个词的 Key 做点积，得到匹配分数；softmax 把分数变成权重，animal 拿到 0.46。最后按这些权重把各词的 Value 加权求和，得到 it 的新表示——这个新表示里，animal 的信息占了最大比重。图中只列出 5 个词，权重为示意值。',
  build(k) {
    // Output zone: a flat secondary field behind the V column, bleeding off the right edge.
    const vX = k.col(11) - 0.1;
    k.rect({ x: vX - 0.35, y: 0, w: k.W - (vX - 0.35), h: k.H, fill: 'paperDeep', bleed: true });
    frame(k, { section: '01', name: '按内容检索', ink: 'graphite' });
    k.text('Q 与 K 的匹配度，决定从 V 取多少', { style: 'title', ...k.span(1, 9), y: k.M.top });

    const top = 2.45, pitch = 0.62;
    const rowsY = KEYS.map((_, i) => top + i * pitch);
    const midY = rowsY[2] + 0.12;

    // ① it's query (left)
    k.text('Q', { style: 'number', font: 'serif', size: 60, color: 'accent', x: k.M.x, y: midY - 1.25, w: 0.8, h: 1.05, name: 'q', overlap: true });
    k.text('it 的 Query', { style: 'label', x: k.M.x + 0.75, y: midY - 0.78, w: 1.6, nowrap: true });
    const q = vector(k, { x: k.M.x, y: midY - 0.12, seed: 3, tone: 'accent', name: 'q-vec' });

    // ② keys (middle-left), one row per token
    const wordX = k.col(4) - 0.15, keyX = k.col(5) + 0.15;
    k.text('K', { style: 'number', font: 'serif', size: 40, x: keyX, y: top - 1.0, w: 0.6, h: 0.75, name: 'k', overlap: true });
    k.text('各词的 Key', { style: 'label', x: keyX + 0.55, y: top - 0.62, w: 1.6, nowrap: true });
    let keyRight = 0;
    KEYS.forEach((r, i) => {
      const y = rowsY[i];
      const hot = r.w >= 0.15;
      k.line({ x1: q.right + 0.15, y1: q.cy, x2: wordX - 0.1, y2: y + 0.12, color: r.w >= 0.4 ? 'accent' : 'hairline', weight: r.w >= 0.4 ? 1.5 : 0.75 });
      k.text(r.t, { style: 'body', font: 'latin', size: 17, color: hot ? 'ink' : 'graphite', x: wordX, y: y - 0.04, w: 0.95, align: 'right', nowrap: true });
      const kv = vector(k, { x: keyX, y, cell: 0.2, gap: 0.035, seed: r.seed, tone: 'ink', max: 0.6 });
      keyRight = kv.right;
    });

    // ③ softmax weights (middle-right): the hero
    const barX = keyRight + 0.55, barMax = 2.6;
    k.text('softmax 权重', { style: 'label', x: barX, y: top - 0.62, w: 2, nowrap: true });
    KEYS.forEach((r, i) => {
      const y = rowsY[i];
      const hot = r.w >= 0.4;
      k.rect({ x: barX, y: y + 0.02, w: Math.max(0.04, (r.w / 0.5) * barMax), h: 0.2, fill: hot ? 'accent' : r.w >= 0.15 ? 'graphite' : 'hairline' });
      k.text(r.w.toFixed(2), { style: 'caption', font: 'latin', color: hot ? 'accent' : 'graphite', x: barX + (r.w / 0.5) * barMax + 0.12, y: y - 0.01, w: 0.6, nowrap: true });
    });

    // ④ weighted sum of values (right, on the output field)
    k.text('V', { style: 'number', font: 'serif', size: 40, color: 'stone', x: vX, y: top - 1.0, w: 0.6, h: 0.75, name: 'v', overlap: true });
    k.text('加权求和', { style: 'label', color: 'graphite', x: vX + 0.55, y: top - 0.62, w: 1.1, nowrap: true });
    const out = vector(k, { x: vX, y: midY - 0.12, cell: 0.18, gap: 0.035, seed: 22, tone: 'accent', light: 'paper', min: 0.1, max: 0.55 });
    k.text('it 的新表示\n（以 animal 为主）', { style: 'caption', color: 'graphite', x: vX, y: midY + 0.25, w: out.w });

    // formula
    // Formula, decomposed: each step sits under the column that draws it, with a tick on the rule.
    const ruleY = 5.75;
    k.rule({ x: k.M.x, y: ruleY, w: vX - 0.35 - 0.3 - k.M.x });
    k.text('softmax( QKᵀ / √dₖ ) V', { style: 'math', size: 18, x: k.M.x, y: ruleY + 0.2, w: 3, nowrap: true });
    const steps = [
      { x: keyX, n: '①', f: 'QKᵀ / √dₖ', d: '点积，再缩放' },
      { x: barX, n: '②', f: 'softmax', d: '归一化为权重' },
    ];
    steps.forEach((s) => {
      k.line({ x1: s.x, y1: ruleY - 0.08, x2: s.x, y2: ruleY + 0.08, color: 'ink', weight: 0.75 });
      k.text([{ text: `${s.n} `, font: 'sans', color: 'accent' }, { text: s.f }], { style: 'math', size: 18, x: s.x, y: ruleY + 0.2, w: 2.4, nowrap: true });
      k.text(s.d, { style: 'caption', x: s.x, y: ruleY + 0.6, w: 2.4, nowrap: true });
    });
    k.text([{ text: '③ ', font: 'sans', color: 'accent' }, { text: '× V' }], { style: 'math', size: 18, x: vX, y: ruleY + 0.2, w: 1.5, nowrap: true });
    k.text('加权求和', { style: 'caption', color: 'graphite', x: vX, y: ruleY + 0.6, w: 1.5, nowrap: true });
    k.text('权重为示意值，节选 5 个词', { style: 'caption', x: k.M.x, y: ruleY + 0.6, w: 3, nowrap: true });
  },
};
