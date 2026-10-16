// SXX — <构图动作>：<主角是什么>
module.exports = {
  id: 'SXX',
  title: '<短名>',
  rhythm: 'dense',  // anchor | breathing | dense — 照抄 design.md 的节奏表
  // transition: 'morph',   // when this page shares named objects with the previous one
  notes: `<讲稿：可以照着念的口语；括号里写动作提示，如（单击 1）>`,
  build(k) {
    k.text('<论断标题>', { style: 'title', ...k.span(1, 8), y: k.M.top });
  },
};
