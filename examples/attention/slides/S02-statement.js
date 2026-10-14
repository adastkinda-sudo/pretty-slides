// S02 — 大字论断：一句话占据画面，其余留白
module.exports = {
  id: 'S02',
  rhythm: 'breathing',
  title: '核心论断',
  notes: '停顿两秒再讲。强调“在看谁”：一个词的表示不是固定的，而是由它关注的上下文决定。',
  build(k) {
    require('../parts').frame(k, { section: '01', name: '按内容检索' });
    k.text('01', { style: 'label', x: k.M.x, y: k.M.top, w: 1 });
    k.text([
      { text: '一个词的含义，\n取决于它' },
      { text: '在看谁', color: 'accent' },
      { text: '。' },
    ], { style: 'statement', ...k.span(1, 8), y: 2.3 });
    k.text('Self-attention 让序列中的每个位置，按相关程度从其他位置汇集信息。', { style: 'body', ...k.span(1, 6), y: 4.55 });
  },
};
