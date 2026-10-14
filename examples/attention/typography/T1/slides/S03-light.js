// S03 — 光 ★：从 it 出发，向每个词伸出一道弧；弧的粗细与亮度就是注意力。最粗最亮的一道落在 animal 上。
// 视觉中心：it → animal 的弧与被点亮的 animal。Morph 自 S02（tok-* 同名同位）。
const { TOKENS, IT, WEIGHTS, heat, frame, sentence, leader } = require('../parts');

module.exports = {
  id: 'S03',
  rhythm: 'dense',
  title: 'it 看向 animal',
  notes: '模型的做法：让 it 去“看”句子里的每一个词，并给每个词一个注意力权重。（单击 1：微弱的连线依次亮起。单击 2：street 和 animal 两道最亮的弧。单击 3：结论。）animal 拿到 0.46，street 0.17——it 指的是 animal。权重为示意值。',
  build(k) {
    frame(k, { section: '01', name: '按内容检索' });
    k.text([
      { text: 'it', font: 'latin', color: 'accent' },
      { text: ' 把最多的注意力给了 ' },
      { text: 'animal', font: 'latin', color: 'hot' },
    ], { style: 'title', x: k.M.x, y: k.M.top, w: 9, nowrap: true });

    const xs = sentence(k);
    const y = 4.95, base = y - 0.1;
    const it = xs[IT];
    k.light({ cx: xs[1].cx + (it.cx - xs[1].cx) * 0.3, cy: base - 0.7, r: 3.6 }); // the light moves onto animal
    // arcs: weak first (click 1, staggered), then the two strong ones (click 2)
    const order = TOKENS.map((_, i) => i).filter((i) => i !== IT).sort((a, b) => WEIGHTS[a] - WEIGHTS[b]);
    let weak = 0;
    let animalArc;
    order.forEach((i) => {
      const w = WEIGHTS[i], strong = w >= 0.15;
      const h = 0.3 + Math.abs(xs[i].cx - it.cx) * 0.22;
      const a = k.arc({ x1: it.cx, x2: xs[i].cx, y: base, h, color: heat(k, 0.25 + w * 1.6), weight: 0.75 + w * 14,
        build: strong ? [2, w > 0.3 ? 500 : 0] : [1, (weak++) * 70] });
      if (i === 1) animalArc = a;
    });

    TOKENS.forEach((t, i) => {
      const c = i === IT ? 'accent' : i === 1 ? 'hot' : i === 5 ? 'graphite' : 'stone';
      k.text(t, { style: 'word', color: c, x: xs[i].x - 0.1, y, w: xs[i].w + 0.2, h: 0.5, align: 'center', nowrap: true, name: `tok-${i}` });
    });
    [[1, 'accent'], [5, 'stone']].forEach(([i, c]) => {
      k.text(WEIGHTS[i].toFixed(2), { style: 'caption', font: 'latin', color: c, x: xs[i].x - 0.3, y: y + 0.55, w: xs[i].w + 0.6, align: 'center', nowrap: true, build: [2, 500] });
    });

    // flag annotation dropping onto the apex of the it → animal arc
    const ax = animalArc.apex.x;
    k.text([{ text: '指代消解\n', style: 'label', color: 'accent' }, { text: 'it = animal', style: 'body', font: 'latin', color: 'ink' }], { x: ax + 0.14, y: 1.75, w: 2.4, paraSpace: 2, build: 3 });
    leader(k, { from: { x: ax, y: 1.8 }, to: animalArc.apex, build: 3 });

    k.text('弧的粗细与亮度 = 注意力权重（示意值）', { style: 'caption', x: k.M.x, y: k.H - k.M.bottom - 0.32, w: 5, h: 0.26, nowrap: true });
  },
};
