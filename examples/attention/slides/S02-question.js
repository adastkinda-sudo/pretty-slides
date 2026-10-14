// S02 — 问题：一句话里的词都还暗着，只有 it 亮着。它指的是谁？两条虚线伸向两个候选。视觉中心：it。
// 词的位置与 S03 完全相同（同名 tok-*），下一页 Morph 时，光从这里开始蔓延。
const { TOKENS, IT, frame, sentence, prompt } = require('../parts');

module.exports = {
  id: 'S02',
  rhythm: 'breathing',
  title: 'it 指的是谁',
  notes: '先抛出问题：这句话里的 it，指的是 animal 还是 street？人一眼就知道，因为我们会“看”上下文。模型要怎么做到？（单击 1：这句话像一条 prompt 被逐词输入。单击 2：两条虚线伸向两个候选。）',
  build(k) {
    frame(k, { section: '01', name: '按内容检索' });
    k.text('一个词的含义，取决于它在看谁', { style: 'statement', x: k.M.x, y: 1.2, w: 10, nowrap: true });

    const xs = sentence(k);
    const y = 4.95;
    k.light({ cx: xs[IT].cx, cy: y + 0.2, r: 2.4 }); // only “it” is lit
    // click 1: the prompt is typed in, token by token, then the cursor waits
    prompt(k, xs, y, { cursor: true, cursorBuild: [1, TOKENS.length * 110] });
    xs.forEach((p, i) => {
      k.text(TOKENS[i], { style: 'word', color: i === IT ? 'hot' : 'stone', x: p.x - 0.1, y, w: p.w + 0.2, h: 0.5, align: 'center', nowrap: true, name: `tok-${i}`, build: [1, i * 110] });
    });

    // two candidate readings, as dashed brackets above the line
    const it = xs[IT];
    [[1, 1.15], [5, 0.7]].forEach(([j, h], n) => {
      const c = xs[j], top = y - 0.12 - h;
      const b = [2, n * 350];
      k.line({ x1: it.cx, y1: y - 0.08, x2: it.cx, y2: top, color: 'stone', dash: 'dash', build: b });
      k.line({ x1: it.cx, y1: top, x2: c.cx, y2: top, color: 'stone', dash: 'dash', build: b });
      k.line({ x1: c.cx, y1: top, x2: c.cx, y2: y - 0.08, color: 'stone', dash: 'dash', arrow: 'end', build: b });
      k.text('?', { style: 'word', color: 'accent', x: (it.cx + c.cx) / 2 - 0.2, y: top - 0.48, w: 0.4, align: 'center', nowrap: true, build: b });
    });
  },
};
